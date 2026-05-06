import { readTracker, writeTracker, getMilestoneById, touchAgent, pushLog, pushHistory, generateTaskId, ok, fail, } from './tracker.service.js';
export function addMilestoneNote(milestoneId, note) {
    const state = readTracker();
    const milestone = getMilestoneById(state, milestoneId);
    if (!milestone)
        return fail(`Milestone not found: ${milestoneId}`);
    const agentId = 'orchestrator';
    milestone.notes.push(note);
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'add_milestone_note',
        target_type: 'milestone',
        target_id: milestone.id,
        description: `Added note to milestone "${milestone.title}": ${note}`,
        tags: ['milestone'],
    });
    writeTracker(state, 'add_milestone_note');
    return ok(`Note added to milestone \`${milestone.id}\`.`);
}
export function setMilestoneDates(milestoneId, dates) {
    const state = readTracker();
    const milestone = getMilestoneById(state, milestoneId);
    if (!milestone)
        return fail(`Milestone not found: ${milestoneId}`);
    const agentId = 'orchestrator';
    const changes = [];
    if (dates.actual_start !== undefined) {
        milestone.actual_start = dates.actual_start;
        changes.push(`actual_start=${dates.actual_start}`);
    }
    if (dates.actual_end !== undefined) {
        milestone.actual_end = dates.actual_end;
        changes.push(`actual_end=${dates.actual_end}`);
    }
    if (milestone.planned_end && milestone.actual_end) {
        const planned = new Date(milestone.planned_end).getTime();
        const actual = new Date(milestone.actual_end).getTime();
        milestone.drift_days = Math.round((actual - planned) / (1000 * 60 * 60 * 24));
    }
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'set_milestone_dates',
        target_type: 'milestone',
        target_id: milestone.id,
        description: `Set dates for milestone "${milestone.title}": ${changes.join(', ')}`,
        tags: ['milestone'],
    });
    writeTracker(state, 'set_milestone_dates');
    return ok(`Milestone \`${milestone.id}\` dates updated: ${changes.join(', ')}`);
}
export function updateDrift(milestoneId, driftDays) {
    const state = readTracker();
    const milestone = getMilestoneById(state, milestoneId);
    if (!milestone)
        return fail(`Milestone not found: ${milestoneId}`);
    const agentId = 'orchestrator';
    milestone.drift_days = driftDays;
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'update_drift',
        target_type: 'milestone',
        target_id: milestone.id,
        description: `Updated drift for milestone "${milestone.title}": ${driftDays} days`,
        tags: ['milestone'],
    });
    writeTracker(state, 'update_drift');
    return ok(`Milestone \`${milestone.id}\` drift set to ${driftDays} days.`);
}
export function createMilestone(id, title, options = {}) {
    const state = readTracker();
    if (getMilestoneById(state, id)) {
        return fail(`Milestone already exists: ${id}`);
    }
    const agentId = 'orchestrator';
    const milestone = {
        id,
        title,
        domain: options.domain || '',
        week: options.week || 0,
        phase: options.phase || '',
        planned_start: options.planned_start || null,
        planned_end: options.planned_end || null,
        actual_start: null,
        actual_end: null,
        drift_days: 0,
        is_key_milestone: options.is_key_milestone || false,
        key_milestone_label: options.key_milestone_label || null,
        subtasks: [],
        dependencies: [],
        notes: [],
    };
    const target = options.active ? state.milestones.active : state.milestones.backlog;
    target.push(milestone);
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'create_milestone',
        target_type: 'milestone',
        target_id: milestone.id,
        description: `Created milestone "${milestone.title}" in ${options.active ? 'active' : 'backlog'}`,
        tags: ['milestone'],
    });
    pushHistory(state, {
        action: `Created milestone "${milestone.title}"`,
        agent: agentId,
    });
    writeTracker(state, 'create_milestone');
    return ok(`Milestone \`${milestone.id}\` created: ${milestone.title}`);
}
export function addMilestoneTask(milestoneId, label, options = {}) {
    const state = readTracker();
    const milestone = getMilestoneById(state, milestoneId);
    if (!milestone)
        return fail(`Milestone not found: ${milestoneId}`);
    const agentId = 'orchestrator';
    const taskId = generateTaskId(milestone);
    const subtask = {
        id: taskId,
        label,
        status: 'todo',
        done: false,
        assignee: null,
        blocked_by: null,
        blocked_reason: null,
        completed_at: null,
        completed_by: null,
        priority: options.priority || 'medium',
        notes: null,
        prompt: null,
        context_files: [],
        reference_docs: [],
        acceptance_criteria: options.acceptance_criteria || [],
        constraints: options.constraints || [],
        agent_target: null,
        execution_mode: options.execution_mode || 'human',
        depends_on: options.depends_on || [],
        last_run_id: null,
        builder_prompt: null,
    };
    milestone.subtasks.push(subtask);
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'add_milestone_task',
        target_type: 'task',
        target_id: taskId,
        description: `Added task "${label}" to milestone "${milestone.title}"`,
        tags: ['milestone', 'task'],
    });
    writeTracker(state, 'add_milestone_task');
    return ok(`Task \`${taskId}\` added to milestone \`${milestone.id}\`.`);
}
export function moveMilestoneToCompleted(milestoneId) {
    const state = readTracker();
    const idx = state.milestones.active.findIndex((m) => m.id === milestoneId);
    if (idx === -1)
        return fail(`Active milestone not found: ${milestoneId}`);
    const milestone = state.milestones.active.splice(idx, 1)[0];
    const completedEntry = {
        id: milestone.id,
        title: milestone.title,
        completed_at: new Date().toISOString().split('T')[0],
        summary: `${milestone.subtasks.length} subtasks completed`,
        domain: milestone.domain,
        week: milestone.week,
        phase: milestone.phase,
        planned_start: milestone.planned_start,
        planned_end: milestone.planned_end,
        subtasks: milestone.subtasks,
        status: 'completed',
    };
    state.milestones.completed.push(completedEntry);
    touchAgent(state, 'orchestrator');
    pushHistory(state, {
        action: `Moved milestone "${milestone.title}" to completed`,
        agent: 'orchestrator',
    });
    writeTracker(state, 'move_milestone_to_completed');
    return ok(`Milestone \`${milestoneId}\` moved to completed.`);
}
//# sourceMappingURL=milestone.service.js.map