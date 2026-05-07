export function buildTaskIndex(state) {
    const index = new Map();
    for (const m of state.milestones.active) {
        for (let i = 0; i < m.subtasks.length; i++) {
            index.set(m.subtasks[i].id, { milestoneId: m.id, milestoneCategory: 'active', index: i });
        }
    }
    for (const m of state.milestones.backlog) {
        for (let i = 0; i < m.subtasks.length; i++) {
            index.set(m.subtasks[i].id, { milestoneId: m.id, milestoneCategory: 'backlog', index: i });
        }
    }
    return index;
}
export function findTaskFast(state, index, taskId) {
    const entry = index.get(taskId);
    if (!entry)
        return null;
    const milestone = state.milestones[entry.milestoneCategory].find(m => m.id === entry.milestoneId);
    if (!milestone)
        return null;
    const subtask = milestone.subtasks[entry.index];
    if (!subtask)
        return null;
    return { subtask, milestone };
}
export function invalidateIndex(index, taskId) {
    index.delete(taskId);
}
export function addToIndex(index, taskId, entry) {
    index.set(taskId, entry);
}
export function rebuildIndexIfNeeded(state, index) {
    const totalTasks = index.size;
    const actualTasks = getTotalTaskCount(state);
    if (totalTasks !== actualTasks) {
        return buildTaskIndex(state);
    }
    return index;
}
function getTotalTaskCount(state) {
    let count = 0;
    for (const m of state.milestones.active)
        count += m.subtasks.length;
    for (const m of state.milestones.backlog)
        count += m.subtasks.length;
    return count;
}
//# sourceMappingURL=task-index.service.js.map