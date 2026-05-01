import fs from 'fs';
import path from 'path';
export const PROJECT_ROOT = process.env.PROJECT_ROOT;
export const TRACKER_PATH = path.join(PROJECT_ROOT, 'project-tracker.json');
export function readTracker() {
    const raw = fs.readFileSync(TRACKER_PATH, 'utf-8');
    return JSON.parse(raw);
}
export function computeScheduleStatus(state) {
    if (state.milestones.length === 0)
        return 'on_track';
    const maxDrift = Math.max(...state.milestones.map(m => m.drift_days));
    const minDrift = Math.min(...state.milestones.map(m => m.drift_days));
    if (maxDrift > 3)
        return 'behind';
    if (minDrift < -3)
        return 'ahead';
    return 'on_track';
}
export function computeOverallProgress(state) {
    const allTasks = state.milestones.flatMap(m => m.subtasks);
    if (allTasks.length === 0)
        return 0;
    const done = allTasks.filter(t => t.done).length;
    return Math.round((done / allTasks.length) * 100);
}
export function writeTracker(state) {
    state.project.overall_progress = computeOverallProgress(state);
    state.project.schedule_status = computeScheduleStatus(state);
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(state, null, 2) + '\n');
}
export function findTask(state, taskId) {
    for (const milestone of state.milestones) {
        const subtask = milestone.subtasks.find(s => s.id === taskId);
        if (subtask)
            return { subtask, milestone };
    }
    return null;
}
export function touchAgent(state, agentId = 'orchestrator') {
    const agent = state.agents.find(a => a.id === agentId);
    if (agent) {
        agent.last_action_at = new Date().toISOString();
        agent.session_action_count = (agent.session_action_count || 0) + 1;
        agent.status = 'active';
    }
}
export function pushLog(state, entry) {
    state.agent_log.push({
        ...entry,
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
    });
}
export function autoUnblockDependents(state, completedTaskId, _completedMilestoneId) {
    const unblocked = [];
    for (const milestone of state.milestones) {
        for (const subtask of milestone.subtasks) {
            if (subtask.status === 'blocked' &&
                subtask.blocked_by === completedTaskId) {
                const allDepsMet = subtask.depends_on.every(depId => {
                    const dep = findTask(state, depId);
                    return dep && dep.subtask.done;
                });
                if (allDepsMet) {
                    subtask.status = 'todo';
                    subtask.blocked_by = null;
                    subtask.blocked_reason = null;
                    unblocked.push(subtask.id);
                }
            }
        }
    }
    return unblocked;
}
export function countRevisions(state, taskId) {
    return state.agent_log.filter(l => l.target_id === taskId && l.action === 'reject_task').length;
}
//# sourceMappingURL=tracker.js.map