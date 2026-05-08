import { readRaw, writeAtomic, withLock } from '../storage/tracker-file.js';
import { createBackup } from '../storage/backup.js';
import { TrackerStateSchema } from '../schema.js';
import { runMigrations } from './migration.service.js';
import { rotateAgentLog } from '../storage/log-rotation.js';
export function readTracker() {
    const raw = readRaw();
    const parsed = JSON.parse(raw);
    const state = TrackerStateSchema.parse(parsed);
    return runMigrations(state);
}
export function allMilestones(state) {
    return [
        ...state.milestones.active,
        ...state.milestones.backlog,
    ].map((m) => ({ ...m, subtasks: m.subtasks || [] }));
}
export function writeTracker(state, operation = 'write') {
    withLock(() => {
        createBackup(operation);
        state.project.overall_progress = computeOverallProgress(state);
        state.project.schedule_status = computeScheduleStatus(state);
        if (state.agent_log && state.agent_log.length > 500) {
            const result = rotateAgentLog(state.agent_log);
            state.agent_log = result.active;
        }
        writeAtomic(JSON.stringify(state, null, 2) + '\n');
    });
}
export function computeScheduleStatus(state) {
    const milestones = allMilestones(state);
    if (milestones.length === 0)
        return 'on_track';
    const maxDrift = Math.max(...milestones.map((m) => m.drift_days));
    const minDrift = Math.min(...milestones.map((m) => m.drift_days));
    if (maxDrift > 3)
        return 'behind';
    if (minDrift < -3)
        return 'ahead';
    return 'on_track';
}
export function computeOverallProgress(state) {
    const allTasks = allMilestones(state).flatMap((m) => m.subtasks);
    if (allTasks.length === 0)
        return 0;
    const done = allTasks.filter((t) => t.status === "done").length;
    return Math.round((done / allTasks.length) * 100);
}
export function findTask(state, taskId) {
    for (const milestone of allMilestones(state)) {
        const subtask = milestone.subtasks.find((s) => s.id === taskId);
        if (subtask)
            return { subtask, milestone };
    }
    return null;
}
export function getMilestoneById(state, milestoneId) {
    return allMilestones(state).find((m) => m.id === milestoneId);
}
export function getActiveMilestoneById(state, milestoneId) {
    return state.milestones.active.find((m) => m.id === milestoneId);
}
export function touchAgent(state, agentId = 'orchestrator') {
    if (!state.agents)
        state.agents = [];
    const agent = state.agents.find((a) => a.id === agentId);
    if (agent) {
        agent.last_action_at = new Date().toISOString();
        agent.session_action_count = (agent.session_action_count || 0) + 1;
        agent.status = 'active';
    }
}
export function pushLog(state, entry) {
    if (!state.agent_log)
        state.agent_log = [];
    state.agent_log.push({
        ...entry,
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
    });
}
export function pushHistory(state, entry) {
    if (!state.history_log)
        state.history_log = [];
    state.history_log.push({
        ...entry,
        date: new Date().toISOString().split('T')[0],
    });
}
export function autoUnblockDependents(state, completedTaskId, _completedMilestoneId) {
    const unblocked = [];
    for (const milestone of allMilestones(state)) {
        for (const subtask of milestone.subtasks) {
            if (subtask.status === 'blocked' &&
                subtask.blocked_by === completedTaskId) {
                const allDepsMet = subtask.depends_on.every((depId) => {
                    const dep = findTask(state, depId);
                    return dep && dep.subtask.status === 'done';
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
    if (!state.agent_log)
        return 0;
    return state.agent_log.filter((l) => l.target_id === taskId && l.action === 'reject_task').length;
}
export function generateTaskId(milestone) {
    const existing = milestone.subtasks.map((s) => {
        const parts = s.id.split('_');
        return parseInt(parts[parts.length - 1], 10) || 0;
    });
    const maxNum = existing.length > 0 ? Math.max(...existing) : 0;
    return `${milestone.id}_${String(maxNum + 1).padStart(3, '0')}`;
}
export function ok(data) {
    return { ok: true, data };
}
export function fail(error) {
    return { ok: false, error };
}
//# sourceMappingURL=tracker.service.js.map