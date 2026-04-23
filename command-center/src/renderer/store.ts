import { create } from 'zustand'

export interface Phase {
  id: string
  title: string
  start_week: number
  end_week: number
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

export interface ProjectMeta {
  name: string
  start_date: string
  target_date: string
  current_week: number
  schedule_status: 'on_track' | 'behind' | 'ahead'
  overall_progress: number
}

export interface TrackerState {
  project: ProjectMeta
  milestones: Milestone[]
  agents: Agent[]
  agent_log: AgentLogEntry[]
  schedule: { phases: Phase[] }
}

export type TabId = 'swim-lane' | 'task-board' | 'agent-hub' | 'calendar'

interface AppState {
  tracker: TrackerState | null
  loading: boolean
  error: string | null
  synced: boolean
  activeTab: TabId
  selectedMilestoneId: string | null
  theme: 'dark' | 'light'

  setTracker: (data: TrackerState) => void
  updateTracker: (updater: (draft: TrackerState) => void) => void
  setActiveTab: (tab: TabId) => void
  setSelectedMilestoneId: (id: string | null) => void
  setLoading: (v: boolean) => void
  setError: (err: string | null) => void
  setSynced: (v: boolean) => void
  toggleTheme: () => void
}

let writeTimer: ReturnType<typeof setTimeout> | null = null
let suppressExternalRefresh = false

function scheduleWriteBack(tracker: TrackerState) {
  if (writeTimer) clearTimeout(writeTimer)
  writeTimer = setTimeout(() => {
    suppressExternalRefresh = true
    window.api.tracker.write(JSON.stringify(tracker, null, 2))
    setTimeout(() => { suppressExternalRefresh = false }, 700)
  }, 500)
}

export function selectCurrentWeek(tracker: TrackerState | null): number {
  if (!tracker) return 1
  const start = new Date(tracker.project.start_date)
  const now = new Date()
  const diffDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  const totalWeeks = Math.ceil(
    (new Date(tracker.project.target_date).getTime() - start.getTime())
    / (1000 * 60 * 60 * 24 * 7)
  )
  return Math.max(1, Math.min(totalWeeks, Math.floor(diffDays / 7) + 1))
}

export function selectCurrentWeekFractional(tracker: TrackerState | null): number {
  if (!tracker) return 1
  const start = new Date(tracker.project.start_date)
  const now = new Date()
  const diffDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  const totalWeeks = Math.ceil(
    (new Date(tracker.project.target_date).getTime() - start.getTime())
    / (1000 * 60 * 60 * 24 * 7)
  )
  return Math.max(1, Math.min(totalWeeks + 0.99, diffDays / 7 + 1))
}

export function selectCurrentPhase(tracker: TrackerState | null): string {
  const week = selectCurrentWeek(tracker)
  const phase = tracker?.schedule.phases.find(
    p => week >= p.start_week && week <= p.end_week
  )
  return phase?.title ?? ''
}

export function selectScheduleStatus(tracker: TrackerState | null): 'on_track' | 'behind' | 'ahead' {
  if (!tracker || tracker.milestones.length === 0) return 'on_track'
  const drifts = tracker.milestones.map(m => m.drift_days)
  if (Math.max(...drifts) > 3) return 'behind'
  if (Math.min(...drifts) < -3) return 'ahead'
  return 'on_track'
}

export function selectOverallProgress(tracker: TrackerState | null): number {
  return tracker?.project.overall_progress ?? 0
}

export function selectMilestoneProgress(milestone: Milestone): { done: number; total: number; pct: number } {
  const total = milestone.subtasks.length
  const done = milestone.subtasks.filter(t => t.done).length
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
}

export function selectTotalTasks(tracker: TrackerState | null): { done: number; total: number; inProgress: number; blocked: number } {
  if (!tracker) return { done: 0, total: 0, inProgress: 0, blocked: 0 }
  const all = tracker.milestones.flatMap(m => m.subtasks)
  return {
    done: all.filter(t => t.done).length,
    total: all.length,
    inProgress: all.filter(t => t.status === 'in_progress').length,
    blocked: all.filter(t => t.status === 'blocked').length,
  }
}

export function selectDomains(tracker: TrackerState | null): string[] {
  if (!tracker) return []
  const domains = new Set<string>()
  tracker.milestones.forEach(m => domains.add(m.domain))
  return Array.from(domains)
}

const DOMAIN_COLORS: Record<string, string> = {
  Content: '#f59e0b',
  'UI/UX': '#22c55e',
  Features: '#8286FF',
  Scripts: '#14B8A6',
  Infrastructure: '#6366F1',
}

export function getDomainColor(domain: string): string {
  return DOMAIN_COLORS[domain] ?? '#9B9BAA'
}

function getInitialTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return (localStorage.getItem('command-center-theme') as 'dark' | 'light') ?? 'dark'
}

export const useStore = create<AppState>((set, get) => ({
  tracker: null,
  loading: true,
  error: null,
  synced: false,
  activeTab: 'swim-lane',
  selectedMilestoneId: null,
  theme: getInitialTheme(),

  setTracker: (data) => {
    data.project.current_week = selectCurrentWeek(data)
    set({ tracker: data, synced: true })
  },

  updateTracker: (updater) => {
    const tracker = get().tracker
    if (!tracker) return
    const next = JSON.parse(JSON.stringify(tracker))
    updater(next)

    const total = next.milestones.reduce((sum: number, m: Milestone) => sum + m.subtasks.length, 0)
    const done = next.milestones.reduce((sum: number, m: Milestone) =>
      sum + m.subtasks.filter((t: Subtask) => t.done).length, 0)
    next.project.overall_progress = total > 0 ? parseFloat((done / total).toFixed(4)) : 0
    next.project.current_week = selectCurrentWeek(next)
    next.project.schedule_status = selectScheduleStatus(next)

    set({ tracker: next })
    scheduleWriteBack(next)
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedMilestoneId: (id) => set({ selectedMilestoneId: id }),
  setLoading: (v) => set({ loading: v }),
  setError: (err) => set({ error: err }),
  setSynced: (v) => set({ synced: v }),

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('command-center-theme', next)
    set({ theme: next })
  },
}))

export function initExternalListener() {
  return window.api.tracker.onUpdated((json) => {
    if (suppressExternalRefresh) return
    try {
      const data = JSON.parse(json)
      data.project.current_week = selectCurrentWeek(data)
      useStore.getState().setTracker(data)
    } catch { /* ignore corrupt JSON */ }
  })
}
