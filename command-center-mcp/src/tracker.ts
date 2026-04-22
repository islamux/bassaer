import fs from 'fs'
import path from 'path'

export interface ProjectMeta {
  name: string
  start_date: string
  target_date: string
  current_week: number
  schedule_status: 'on_track' | 'behind' | 'ahead'
  overall_progress: number
}

export interface Subtask {
  id: string
  label: string
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'
  done: boolean
  assignee: string | null
  blocked_by: string | null
  blocked_reason: string | null
  completed_at: string | null
  completed_by: string | null
  priority: string
  notes: string | null
  prompt: string | null
  context_files: string[]
  reference_docs: string[]
  acceptance_criteria: string[]
  constraints: string[]
  agent_target: string | null
  execution_mode: 'human' | 'agent' | 'pair'
  depends_on: string[]
  last_run_id: string | null
  builder_prompt: string | null
}

export interface Milestone {
  id: string
  title: string
  domain: string
  week: number
  phase: string
  planned_start: string | null
  planned_end: string | null
  actual_start: string | null
  actual_end: string | null
  drift_days: number
  is_key_milestone: boolean
  key_milestone_label: string | null
  subtasks: Subtask[]
  dependencies: string[]
  notes: string[]
}

export interface Agent {
  id: string
  name: string
  type: 'orchestrator' | 'sub-agent' | 'human' | 'external'
  parent_id?: string
  color: string
  status: string
  permissions: string[]
  last_action_at: string | null
  session_action_count: number
}

export interface AgentLogEntry {
  id: string
  agent_id: string
  action: string
  target_type: string
  target_id: string
  description: string
  timestamp: string
  tags: string[]
}

export interface Phase {
  id: string
  title: string
  start_week: number
  end_week: number
}

export interface TrackerState {
  project: ProjectMeta
  milestones: Milestone[]
  agents: Agent[]
  agent_log: AgentLogEntry[]
  schedule: { phases: Phase[] }
}

export const PROJECT_ROOT = process.env.PROJECT_ROOT!
export const TRACKER_PATH = path.join(PROJECT_ROOT, 'project-tracker.json')

export function readTracker(): TrackerState {
  const raw = fs.readFileSync(TRACKER_PATH, 'utf-8')
  return JSON.parse(raw) as TrackerState
}

export function computeScheduleStatus(state: TrackerState): 'on_track' | 'behind' | 'ahead' {
  if (state.milestones.length === 0) return 'on_track'
  const maxDrift = Math.max(...state.milestones.map(m => m.drift_days))
  const minDrift = Math.min(...state.milestones.map(m => m.drift_days))
  if (maxDrift > 3) return 'behind'
  if (minDrift < -3) return 'ahead'
  return 'on_track'
}

export function computeOverallProgress(state: TrackerState): number {
  const allTasks = state.milestones.flatMap(m => m.subtasks)
  if (allTasks.length === 0) return 0
  const done = allTasks.filter(t => t.done).length
  return Math.round((done / allTasks.length) * 100)
}

export function writeTracker(state: TrackerState): void {
  state.project.overall_progress = computeOverallProgress(state)
  state.project.schedule_status = computeScheduleStatus(state)
  fs.writeFileSync(TRACKER_PATH, JSON.stringify(state, null, 2) + '\n')
}

export function findTask(state: TrackerState, taskId: string): { subtask: Subtask; milestone: Milestone } | null {
  for (const milestone of state.milestones) {
    const subtask = milestone.subtasks.find(s => s.id === taskId)
    if (subtask) return { subtask, milestone }
  }
  return null
}

export function touchAgent(state: TrackerState, agentId = 'orchestrator'): void {
  const agent = state.agents.find(a => a.id === agentId)
  if (agent) {
    agent.last_action_at = new Date().toISOString()
    agent.session_action_count = (agent.session_action_count || 0) + 1
    agent.status = 'active'
  }
}

export function pushLog(state: TrackerState, entry: Omit<AgentLogEntry, 'id' | 'timestamp'>): void {
  state.agent_log.push({
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  })
}

export function autoUnblockDependents(state: TrackerState, completedTaskId: string, _completedMilestoneId?: string): string[] {
  const unblocked: string[] = []
  for (const milestone of state.milestones) {
    for (const subtask of milestone.subtasks) {
      if (
        subtask.status === 'blocked' &&
        subtask.blocked_by === completedTaskId
      ) {
        const allDepsMet = subtask.depends_on.every(depId => {
          const dep = findTask(state, depId)
          return dep && dep.subtask.done
        })
        if (allDepsMet) {
          subtask.status = 'todo'
          subtask.blocked_by = null
          subtask.blocked_reason = null
          unblocked.push(subtask.id)
        }
      }
    }
  }
  return unblocked
}

export function countRevisions(state: TrackerState, taskId: string): number {
  return state.agent_log.filter(
    l => l.target_id === taskId && l.action === 'reject_task'
  ).length
}
