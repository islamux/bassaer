export function allMilestones(state) {
    return [
        ...state.milestones.active,
        ...state.milestones.backlog,
    ].map(m => ({ ...m, subtasks: m.subtasks || [] }));
}
//# sourceMappingURL=types.js.map