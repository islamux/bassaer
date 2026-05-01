import { readTracker, writeTracker, findTask, touchAgent, pushLog, autoUnblockDependents, countRevisions } from './tracker.js';
import { buildTaskContext, buildTaskSummary, buildProjectStatus, buildMilestoneOverview } from './context.js';
function ok(text) {
    return { content: [{ type: 'text', text }] };
}
function err(text) {
    return { content: [{ type: 'text', text }], isError: true };
}
function getMilestoneById(state, milestoneId) {
    return state.milestones.find(m => m.id === milestoneId);
}
export async function handleTool(name, args) {
    try {
        switch (name) {
            // ── READ TOOLS ──────────────────────────────────────────
            case 'get_task_context': return toolGetTaskContext(args);
            case 'get_task_summary': return toolGetTaskSummary(args);
            case 'get_project_status': return toolGetProjectStatus();
            case 'get_milestone_overview': return toolGetMilestoneOverview(args);
            case 'list_tasks': return toolListTasks(args);
            case 'get_task_history': return toolGetTaskHistory(args);
            case 'list_agents': return toolListAgents();
            case 'get_activity_feed': return toolGetActivityFeed(args);
            // ── WRITE: TASK LIFECYCLE ───────────────────────────────
            case 'start_task': return toolStartTask(args);
            case 'complete_task': return toolCompleteTask(args);
            case 'approve_task': return toolApproveTask(args);
            case 'reject_task': return toolRejectTask(args);
            case 'reset_task': return toolResetTask(args);
            case 'block_task': return toolBlockTask(args);
            case 'unblock_task': return toolUnblockTask(args);
            case 'update_task': return toolUpdateTask(args);
            case 'log_action': return toolLogAction(args);
            // ── WRITE: TASK ENRICHMENT ──────────────────────────────
            case 'enrich_task': return toolEnrichTask(args);
            // ── WRITE: MILESTONE MANAGEMENT ─────────────────────────
            case 'add_milestone_note': return toolAddMilestoneNote(args);
            case 'set_milestone_dates': return toolSetMilestoneDates(args);
            case 'update_drift': return toolUpdateDrift(args);
            case 'create_milestone': return toolCreateMilestone(args);
            case 'add_milestone_task': return toolAddMilestoneTask(args);
            // ── WRITE: AGENT MANAGEMENT ─────────────────────────────
            case 'register_agent': return toolRegisterAgent(args);
            default: return err(`Unknown tool: ${name}`);
        }
    }
    catch (e) {
        return err(`Error: ${e.message}`);
    }
}
// ════════════════════════════════════════════════════════════
//  READ TOOLS
// ════════════════════════════════════════════════════════════
function toolGetTaskContext(args) {
    const state = readTracker();
    const found = findTask(state, args.task_id);
    if (!found)
        return err(`Task not found: ${args.task_id}`);
    return ok(buildTaskContext(state, found.subtask, found.milestone));
}
function toolGetTaskSummary(args) {
    const state = readTracker();
    const found = findTask(state, args.task_id);
    if (!found)
        return err(`Task not found: ${args.task_id}`);
    return ok(buildTaskSummary(state, found.subtask, found.milestone));
}
function toolGetProjectStatus() {
    const state = readTracker();
    return ok(buildProjectStatus(state));
}
function toolGetMilestoneOverview(args) {
    const state = readTracker();
    const milestone = getMilestoneById(state, args.milestone_id);
    if (!milestone)
        return err(`Milestone not found: ${args.milestone_id}`);
    return ok(buildMilestoneOverview(milestone, state));
}
function toolListTasks(args) {
    const state = readTracker();
    let milestones = state.milestones;
    if (args.milestone_id) {
        milestones = milestones.filter(m => m.id === args.milestone_id);
    }
    if (args.domain) {
        milestones = milestones.filter(m => m.domain === args.domain);
    }
    const lines = [];
    for (const m of milestones) {
        let tasks = m.subtasks;
        if (args.status) {
            tasks = tasks.filter(t => t.status === args.status);
        }
        if (tasks.length === 0)
            continue;
        lines.push(`## ${m.title} (${m.id})`);
        lines.push('');
        for (const t of tasks) {
            const icon = t.status === 'done' ? '[x]' : t.status === 'in_progress' ? '[~]' : t.status === 'review' ? '[r]' : t.status === 'blocked' ? '[!]' : '[ ]';
            const assignee = t.assignee ? ` → ${t.assignee}` : '';
            lines.push(`- ${icon} \`${t.id}\` ${t.label}${assignee}`);
        }
        lines.push('');
    }
    if (lines.length === 0)
        return ok('No tasks match the given filters.');
    return ok(lines.join('\n'));
}
function toolGetTaskHistory(args) {
    const state = readTracker();
    const entries = state.agent_log
        .filter(l => l.target_id === args.task_id)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    if (entries.length === 0)
        return ok(`No history for task: ${args.task_id}`);
    const lines = [`# History for ${args.task_id}`, ''];
    for (const e of entries) {
        lines.push(`- **${e.timestamp}** [${e.action}] ${e.description} (${e.agent_id})`);
    }
    return ok(lines.join('\n'));
}
function toolListAgents() {
    const state = readTracker();
    const lines = ['# Agents', ''];
    for (const a of state.agents) {
        lines.push(`## ${a.name} (\`${a.id}\`)`);
        lines.push(`- **Type:** ${a.type}`);
        lines.push(`- **Status:** ${a.status}`);
        lines.push(`- **Permissions:** ${a.permissions.join(', ')}`);
        lines.push(`- **Last Action:** ${a.last_action_at ?? 'never'}`);
        lines.push(`- **Session Actions:** ${a.session_action_count}`);
        if (a.parent_id)
            lines.push(`- **Parent:** ${a.parent_id}`);
        lines.push('');
    }
    return ok(lines.join('\n'));
}
function toolGetActivityFeed(args) {
    const state = readTracker();
    let entries = [...state.agent_log].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    if (args.agent_id) {
        entries = entries.filter(e => e.agent_id === args.agent_id);
    }
    const limit = typeof args.limit === 'number' ? args.limit : 30;
    entries = entries.slice(0, limit);
    if (entries.length === 0)
        return ok('No activity entries found.');
    const lines = ['# Activity Feed', ''];
    let currentDate = '';
    for (const e of entries) {
        const date = e.timestamp.split('T')[0];
        if (date !== currentDate) {
            currentDate = date;
            lines.push(`## ${date}`);
        }
        lines.push(`- **${e.timestamp}** [${e.agent_id}] ${e.action}: ${e.description}`);
    }
    return ok(lines.join('\n'));
}
// ════════════════════════════════════════════════════════════
//  WRITE TOOLS — TASK LIFECYCLE
// ════════════════════════════════════════════════════════════
function toolStartTask(args) {
    const state = readTracker();
    const found = findTask(state, args.task_id);
    if (!found)
        return err(`Task not found: ${args.task_id}`);
    const { subtask, milestone } = found;
    const agentId = args.agent_id || 'orchestrator';
    subtask.status = 'in_progress';
    subtask.assignee = agentId;
    if (!milestone.actual_start) {
        milestone.actual_start = new Date().toISOString().split('T')[0];
    }
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'start_task',
        target_type: 'task',
        target_id: subtask.id,
        description: `Started task "${subtask.label}"`,
        tags: ['lifecycle'],
    });
    writeTracker(state);
    return ok(`Task \`${subtask.id}\` started. Assigned to ${agentId}.`);
}
function toolCompleteTask(args) {
    const state = readTracker();
    const found = findTask(state, args.task_id);
    if (!found)
        return err(`Task not found: ${args.task_id}`);
    const { subtask } = found;
    const agentId = args.agent_id || subtask.assignee || 'orchestrator';
    subtask.status = 'review';
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'complete_task',
        target_type: 'task',
        target_id: subtask.id,
        description: `Completed task "${subtask.label}": ${args.summary}`,
        tags: ['lifecycle'],
    });
    writeTracker(state);
    return ok(`Task \`${subtask.id}\` moved to review.`);
}
function toolApproveTask(args) {
    const state = readTracker();
    const found = findTask(state, args.task_id);
    if (!found)
        return err(`Task not found: ${args.task_id}`);
    const { subtask, milestone } = found;
    if (subtask.status !== 'review') {
        return err(`Task \`${subtask.id}\` is not in review (current: ${subtask.status})`);
    }
    const agentId = 'orchestrator';
    const now = new Date().toISOString();
    subtask.done = true;
    subtask.status = 'done';
    subtask.completed_at = now;
    subtask.completed_by = agentId;
    const allDone = milestone.subtasks.every(t => t.done);
    if (allDone && !milestone.actual_end) {
        milestone.actual_end = now.split('T')[0];
    }
    const unblocked = autoUnblockDependents(state, subtask.id, milestone.id);
    const feedback = args.feedback ? ` Feedback: ${args.feedback}.` : '';
    const unblockMsg = unblocked.length > 0
        ? ` Unblocked tasks: ${unblocked.join(', ')}.`
        : '';
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'approve_task',
        target_type: 'task',
        target_id: subtask.id,
        description: `Approved task "${subtask.label}".${feedback}${unblockMsg}`,
        tags: ['lifecycle'],
    });
    writeTracker(state);
    return ok(`Task \`${subtask.id}\` approved and marked done.${unblockMsg}`);
}
function toolRejectTask(args) {
    const state = readTracker();
    const found = findTask(state, args.task_id);
    if (!found)
        return err(`Task not found: ${args.task_id}`);
    const { subtask } = found;
    if (subtask.status !== 'review') {
        return err(`Task \`${subtask.id}\` is not in review (current: ${subtask.status})`);
    }
    const agentId = 'orchestrator';
    subtask.status = 'in_progress';
    const revision = countRevisions(state, subtask.id) + 1;
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'reject_task',
        target_type: 'task',
        target_id: subtask.id,
        description: `Rejected task "${subtask.label}" (revision #${revision}): ${args.feedback}`,
        tags: ['lifecycle', 'revision'],
    });
    writeTracker(state);
    return ok(`Task \`${subtask.id}\` rejected (revision #${revision}). Back to in_progress.`);
}
function toolResetTask(args) {
    const state = readTracker();
    const found = findTask(state, args.task_id);
    if (!found)
        return err(`Task not found: ${args.task_id}`);
    const { subtask } = found;
    const agentId = 'orchestrator';
    subtask.status = 'todo';
    subtask.done = false;
    subtask.assignee = null;
    subtask.completed_at = null;
    subtask.completed_by = null;
    subtask.blocked_by = null;
    subtask.blocked_reason = null;
    subtask.last_run_id = null;
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'reset_task',
        target_type: 'task',
        target_id: subtask.id,
        description: `Reset task "${subtask.label}" to todo.`,
        tags: ['lifecycle'],
    });
    writeTracker(state);
    return ok(`Task \`${subtask.id}\` reset to todo.`);
}
function toolBlockTask(args) {
    const state = readTracker();
    const found = findTask(state, args.task_id);
    if (!found)
        return err(`Task not found: ${args.task_id}`);
    const { subtask } = found;
    const agentId = 'orchestrator';
    subtask.status = 'blocked';
    subtask.blocked_reason = args.reason;
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'block_task',
        target_type: 'task',
        target_id: subtask.id,
        description: `Blocked task "${subtask.label}": ${args.reason}`,
        tags: ['lifecycle', 'blocked'],
    });
    writeTracker(state);
    return ok(`Task \`${subtask.id}\` blocked: ${args.reason}`);
}
function toolUnblockTask(args) {
    const state = readTracker();
    const found = findTask(state, args.task_id);
    if (!found)
        return err(`Task not found: ${args.task_id}`);
    const { subtask } = found;
    if (subtask.status !== 'blocked') {
        return err(`Task \`${subtask.id}\` is not blocked (current: ${subtask.status})`);
    }
    const agentId = 'orchestrator';
    subtask.status = subtask.assignee ? 'in_progress' : 'todo';
    subtask.blocked_by = null;
    subtask.blocked_reason = null;
    const resolution = args.resolution ? `: ${args.resolution}` : '';
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'unblock_task',
        target_type: 'task',
        target_id: subtask.id,
        description: `Unblocked task "${subtask.label}"${resolution}`,
        tags: ['lifecycle'],
    });
    writeTracker(state);
    return ok(`Task \`${subtask.id}\` unblocked → ${subtask.status}.`);
}
function toolUpdateTask(args) {
    const state = readTracker();
    const found = findTask(state, args.task_id);
    if (!found)
        return err(`Task not found: ${args.task_id}`);
    const { subtask } = found;
    const agentId = 'orchestrator';
    const changes = [];
    if (args.priority !== undefined) {
        subtask.priority = args.priority;
        changes.push(`priority=${args.priority}`);
    }
    if (args.assignee !== undefined) {
        subtask.assignee = args.assignee;
        changes.push(`assignee=${args.assignee}`);
    }
    if (args.execution_mode !== undefined) {
        subtask.execution_mode = args.execution_mode;
        changes.push(`execution_mode=${args.execution_mode}`);
    }
    if (args.notes !== undefined) {
        subtask.notes = args.notes;
        changes.push('notes updated');
    }
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'update_task',
        target_type: 'task',
        target_id: subtask.id,
        description: `Updated task "${subtask.label}": ${changes.join(', ')}`,
        tags: ['update'],
    });
    writeTracker(state);
    return ok(`Task \`${subtask.id}\` updated: ${changes.join(', ')}`);
}
function toolLogAction(args) {
    const state = readTracker();
    const agentId = args.agent_id || 'orchestrator';
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: args.action,
        target_type: 'task',
        target_id: args.task_id,
        description: args.description,
        tags: args.tags || [],
    });
    writeTracker(state);
    return ok(`Action logged: ${args.action} on ${args.task_id}`);
}
// ════════════════════════════════════════════════════════════
//  WRITE TOOLS — TASK ENRICHMENT
// ════════════════════════════════════════════════════════════
function toolEnrichTask(args) {
    const state = readTracker();
    const found = findTask(state, args.task_id);
    if (!found)
        return err(`Task not found: ${args.task_id}`);
    const { subtask } = found;
    const agentId = 'orchestrator';
    const changes = [];
    if (args.prompt !== undefined) {
        subtask.prompt = args.prompt;
        changes.push('prompt');
    }
    if (args.builder_prompt !== undefined) {
        subtask.builder_prompt = args.builder_prompt;
        changes.push('builder_prompt');
    }
    if (args.acceptance_criteria !== undefined) {
        subtask.acceptance_criteria = args.acceptance_criteria;
        changes.push('acceptance_criteria');
    }
    if (args.constraints !== undefined) {
        subtask.constraints = args.constraints;
        changes.push('constraints');
    }
    if (args.context_files !== undefined) {
        subtask.context_files = args.context_files;
        changes.push('context_files');
    }
    if (args.reference_docs !== undefined) {
        subtask.reference_docs = args.reference_docs;
        changes.push('reference_docs');
    }
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'enrich_task',
        target_type: 'task',
        target_id: subtask.id,
        description: `Enriched task "${subtask.label}": ${changes.join(', ')}`,
        tags: ['enrichment'],
    });
    writeTracker(state);
    return ok(`Task \`${subtask.id}\` enriched: ${changes.join(', ')}`);
}
// ════════════════════════════════════════════════════════════
//  WRITE TOOLS — MILESTONE MANAGEMENT
// ════════════════════════════════════════════════════════════
function toolAddMilestoneNote(args) {
    const state = readTracker();
    const milestone = getMilestoneById(state, args.milestone_id);
    if (!milestone)
        return err(`Milestone not found: ${args.milestone_id}`);
    const agentId = 'orchestrator';
    milestone.notes.push(args.note);
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'add_milestone_note',
        target_type: 'milestone',
        target_id: milestone.id,
        description: `Added note to milestone "${milestone.title}": ${args.note}`,
        tags: ['milestone'],
    });
    writeTracker(state);
    return ok(`Note added to milestone \`${milestone.id}\`.`);
}
function toolSetMilestoneDates(args) {
    const state = readTracker();
    const milestone = getMilestoneById(state, args.milestone_id);
    if (!milestone)
        return err(`Milestone not found: ${args.milestone_id}`);
    const agentId = 'orchestrator';
    const changes = [];
    if (args.actual_start !== undefined) {
        milestone.actual_start = args.actual_start;
        changes.push(`actual_start=${args.actual_start}`);
    }
    if (args.actual_end !== undefined) {
        milestone.actual_end = args.actual_end;
        changes.push(`actual_end=${args.actual_end}`);
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
    writeTracker(state);
    return ok(`Milestone \`${milestone.id}\` dates updated: ${changes.join(', ')}`);
}
function toolUpdateDrift(args) {
    const state = readTracker();
    const milestone = getMilestoneById(state, args.milestone_id);
    if (!milestone)
        return err(`Milestone not found: ${args.milestone_id}`);
    const agentId = 'orchestrator';
    milestone.drift_days = args.drift_days;
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'update_drift',
        target_type: 'milestone',
        target_id: milestone.id,
        description: `Updated drift for milestone "${milestone.title}": ${args.drift_days} days`,
        tags: ['milestone'],
    });
    writeTracker(state);
    return ok(`Milestone \`${milestone.id}\` drift set to ${args.drift_days} days.`);
}
function toolCreateMilestone(args) {
    const state = readTracker();
    if (getMilestoneById(state, args.id)) {
        return err(`Milestone already exists: ${args.id}`);
    }
    const agentId = 'orchestrator';
    const milestone = {
        id: args.id,
        title: args.title,
        domain: args.domain || '',
        week: 0,
        phase: args.phase || '',
        planned_start: args.planned_start || null,
        planned_end: args.planned_end || null,
        actual_start: null,
        actual_end: null,
        drift_days: 0,
        is_key_milestone: false,
        key_milestone_label: null,
        subtasks: [],
        dependencies: [],
        notes: [],
    };
    state.milestones.push(milestone);
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: agentId,
        action: 'create_milestone',
        target_type: 'milestone',
        target_id: milestone.id,
        description: `Created milestone "${milestone.title}"`,
        tags: ['milestone'],
    });
    writeTracker(state);
    return ok(`Milestone \`${milestone.id}\` created: ${milestone.title}`);
}
function toolAddMilestoneTask(args) {
    const state = readTracker();
    const milestone = getMilestoneById(state, args.milestone_id);
    if (!milestone)
        return err(`Milestone not found: ${args.milestone_id}`);
    const agentId = 'orchestrator';
    const num = milestone.subtasks.length + 1;
    const taskId = `${args.milestone_id}_${String(num).padStart(3, '0')}`;
    const subtask = {
        id: taskId,
        label: args.label,
        status: 'todo',
        done: false,
        assignee: null,
        blocked_by: null,
        blocked_reason: null,
        completed_at: null,
        completed_by: null,
        priority: args.priority || 'medium',
        notes: null,
        prompt: null,
        context_files: [],
        reference_docs: [],
        acceptance_criteria: args.acceptance_criteria || [],
        constraints: args.constraints || [],
        agent_target: null,
        execution_mode: args.execution_mode || 'human',
        depends_on: args.depends_on || [],
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
        description: `Added task "${args.label}" to milestone "${milestone.title}"`,
        tags: ['milestone', 'task'],
    });
    writeTracker(state);
    return ok(`Task \`${taskId}\` added to milestone \`${milestone.id}\`.`);
}
// ════════════════════════════════════════════════════════════
//  WRITE TOOLS — AGENT MANAGEMENT
// ════════════════════════════════════════════════════════════
function toolRegisterAgent(args) {
    const state = readTracker();
    const agentId = args.agent_id;
    let existing = state.agents.find(a => a.id === agentId);
    if (existing) {
        existing.name = args.name;
        existing.type = args.type;
        existing.permissions = args.permissions;
        if (args.color !== undefined)
            existing.color = args.color;
        if (args.parent_id !== undefined)
            existing.parent_id = args.parent_id;
    }
    else {
        state.agents.push({
            id: agentId,
            name: args.name,
            type: args.type,
            color: args.color || '#888888',
            status: 'active',
            permissions: args.permissions,
            last_action_at: null,
            session_action_count: 0,
            ...(args.parent_id !== undefined ? { parent_id: args.parent_id } : {}),
        });
    }
    touchAgent(state, agentId);
    pushLog(state, {
        agent_id: 'orchestrator',
        action: 'register_agent',
        target_type: 'agent',
        target_id: agentId,
        description: `${existing ? 'Updated' : 'Registered'} agent "${args.name}" (${agentId})`,
        tags: ['agent'],
    });
    writeTracker(state);
    return ok(`Agent \`${agentId}\` ${existing ? 'updated' : 'registered'}: ${args.name}`);
}
// ════════════════════════════════════════════════════════════
//  TOOL DEFINITIONS
// ════════════════════════════════════════════════════════════
export function getToolDefinitions() {
    return [
        {
            name: 'get_task_context',
            description: 'Get full context (~8K tokens) for a task including metadata, acceptance criteria, constraints, context files, revision history, and dependencies',
            inputSchema: {
                type: 'object',
                properties: { task_id: { type: 'string', description: 'Task ID' } },
                required: ['task_id'],
            },
        },
        {
            name: 'get_task_summary',
            description: 'Get a slim summary (~500 tokens) of a task with key metadata, acceptance criteria, constraints, and context files',
            inputSchema: {
                type: 'object',
                properties: { task_id: { type: 'string', description: 'Task ID' } },
                required: ['task_id'],
            },
        },
        {
            name: 'get_project_status',
            description: 'Get current project status including week, schedule status, progress, and task breakdown',
            inputSchema: { type: 'object', properties: {}, required: [] },
        },
        {
            name: 'get_milestone_overview',
            description: 'Get milestone details including progress, drift, task list with status icons, and dependencies',
            inputSchema: {
                type: 'object',
                properties: { milestone_id: { type: 'string', description: 'Milestone ID' } },
                required: ['milestone_id'],
            },
        },
        {
            name: 'list_tasks',
            description: 'List and filter tasks by milestone, status, or domain. Returns grouped Markdown output.',
            inputSchema: {
                type: 'object',
                properties: {
                    milestone_id: { type: 'string', description: 'Filter by milestone ID' },
                    status: { type: 'string', description: 'Filter by status (todo, in_progress, review, done, blocked)' },
                    domain: { type: 'string', description: 'Filter by domain' },
                },
                required: [],
            },
        },
        {
            name: 'get_task_history',
            description: 'Get chronological history of all actions on a task from the agent log',
            inputSchema: {
                type: 'object',
                properties: { task_id: { type: 'string', description: 'Task ID' } },
                required: ['task_id'],
            },
        },
        {
            name: 'list_agents',
            description: 'List all registered agents with their type, status, permissions, and activity stats',
            inputSchema: { type: 'object', properties: {}, required: [] },
        },
        {
            name: 'get_activity_feed',
            description: 'Get recent activity feed sorted by time, optionally filtered by agent. Returns grouped Markdown.',
            inputSchema: {
                type: 'object',
                properties: {
                    agent_id: { type: 'string', description: 'Filter by agent ID' },
                    limit: { type: 'number', description: 'Max entries to return (default 30)' },
                },
                required: [],
            },
        },
        {
            name: 'start_task',
            description: 'Start a task: set status to in_progress, assign agent, auto-stamp milestone actual_start',
            inputSchema: {
                type: 'object',
                properties: {
                    task_id: { type: 'string', description: 'Task ID' },
                    agent_id: { type: 'string', description: 'Agent ID to assign (default: orchestrator)' },
                },
                required: ['task_id'],
            },
        },
        {
            name: 'complete_task',
            description: 'Mark a task as ready for review with a completion summary',
            inputSchema: {
                type: 'object',
                properties: {
                    task_id: { type: 'string', description: 'Task ID' },
                    summary: { type: 'string', description: 'Completion summary' },
                    agent_id: { type: 'string', description: 'Agent ID' },
                },
                required: ['task_id', 'summary'],
            },
        },
        {
            name: 'approve_task',
            description: 'Approve a reviewed task: mark done, auto-stamp milestone actual_end, unblock dependents',
            inputSchema: {
                type: 'object',
                properties: {
                    task_id: { type: 'string', description: 'Task ID' },
                    feedback: { type: 'string', description: 'Optional approval feedback' },
                },
                required: ['task_id'],
            },
        },
        {
            name: 'reject_task',
            description: 'Reject a reviewed task: send back to in_progress with revision feedback',
            inputSchema: {
                type: 'object',
                properties: {
                    task_id: { type: 'string', description: 'Task ID' },
                    feedback: { type: 'string', description: 'Rejection feedback (required)' },
                },
                required: ['task_id', 'feedback'],
            },
        },
        {
            name: 'reset_task',
            description: 'Reset a task to todo, clearing all progress fields',
            inputSchema: {
                type: 'object',
                properties: { task_id: { type: 'string', description: 'Task ID' } },
                required: ['task_id'],
            },
        },
        {
            name: 'block_task',
            description: 'Block a task with a reason',
            inputSchema: {
                type: 'object',
                properties: {
                    task_id: { type: 'string', description: 'Task ID' },
                    reason: { type: 'string', description: 'Reason for blocking (required)' },
                },
                required: ['task_id', 'reason'],
            },
        },
        {
            name: 'unblock_task',
            description: 'Unblock a blocked task, returning it to todo or in_progress',
            inputSchema: {
                type: 'object',
                properties: {
                    task_id: { type: 'string', description: 'Task ID' },
                    resolution: { type: 'string', description: 'Resolution note' },
                },
                required: ['task_id'],
            },
        },
        {
            name: 'update_task',
            description: 'Update task fields: priority, assignee, execution_mode, or notes',
            inputSchema: {
                type: 'object',
                properties: {
                    task_id: { type: 'string', description: 'Task ID' },
                    priority: { type: 'string', description: 'New priority' },
                    assignee: { type: 'string', description: 'New assignee' },
                    execution_mode: { type: 'string', description: 'New execution mode (human, agent, pair)' },
                    notes: { type: 'string', description: 'New notes' },
                },
                required: ['task_id'],
            },
        },
        {
            name: 'log_action',
            description: 'Log a custom action on a task',
            inputSchema: {
                type: 'object',
                properties: {
                    task_id: { type: 'string', description: 'Task ID' },
                    action: { type: 'string', description: 'Action name' },
                    description: { type: 'string', description: 'Action description' },
                    tags: { type: 'array', items: { type: 'string' }, description: 'Tags' },
                    agent_id: { type: 'string', description: 'Agent ID' },
                },
                required: ['task_id', 'action', 'description'],
            },
        },
        {
            name: 'enrich_task',
            description: 'Enrich a task with prompt, builder_prompt, acceptance_criteria, constraints, context_files, or reference_docs. Arrays are replaced, not merged.',
            inputSchema: {
                type: 'object',
                properties: {
                    task_id: { type: 'string', description: 'Task ID' },
                    prompt: { type: 'string', description: 'Task prompt' },
                    builder_prompt: { type: 'string', description: 'Builder prompt' },
                    acceptance_criteria: { type: 'array', items: { type: 'string' }, description: 'Acceptance criteria (replaces existing)' },
                    constraints: { type: 'array', items: { type: 'string' }, description: 'Constraints (replaces existing)' },
                    context_files: { type: 'array', items: { type: 'string' }, description: 'Context files (replaces existing)' },
                    reference_docs: { type: 'array', items: { type: 'string' }, description: 'Reference docs (replaces existing)' },
                },
                required: ['task_id'],
            },
        },
        {
            name: 'add_milestone_note',
            description: 'Append a note to a milestone',
            inputSchema: {
                type: 'object',
                properties: {
                    milestone_id: { type: 'string', description: 'Milestone ID' },
                    note: { type: 'string', description: 'Note text' },
                },
                required: ['milestone_id', 'note'],
            },
        },
        {
            name: 'set_milestone_dates',
            description: 'Set actual start/end dates for a milestone, auto-calculate drift, recalculate schedule status',
            inputSchema: {
                type: 'object',
                properties: {
                    milestone_id: { type: 'string', description: 'Milestone ID' },
                    actual_start: { type: 'string', description: 'Actual start date (YYYY-MM-DD)' },
                    actual_end: { type: 'string', description: 'Actual end date (YYYY-MM-DD)' },
                },
                required: ['milestone_id'],
            },
        },
        {
            name: 'update_drift',
            description: 'Manually set drift days for a milestone, recalculate schedule status',
            inputSchema: {
                type: 'object',
                properties: {
                    milestone_id: { type: 'string', description: 'Milestone ID' },
                    drift_days: { type: 'number', description: 'Drift in days' },
                },
                required: ['milestone_id', 'drift_days'],
            },
        },
        {
            name: 'create_milestone',
            description: 'Create a new milestone with empty subtasks, dependencies, and notes',
            inputSchema: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Unique milestone ID' },
                    title: { type: 'string', description: 'Milestone title' },
                    domain: { type: 'string', description: 'Domain' },
                    phase: { type: 'string', description: 'Phase' },
                    planned_start: { type: 'string', description: 'Planned start date (YYYY-MM-DD)' },
                    planned_end: { type: 'string', description: 'Planned end date (YYYY-MM-DD)' },
                },
                required: ['id', 'title'],
            },
        },
        {
            name: 'add_milestone_task',
            description: 'Add a new task to a milestone. Auto-generates task ID as {milestone_id}_{NNN}.',
            inputSchema: {
                type: 'object',
                properties: {
                    milestone_id: { type: 'string', description: 'Milestone ID' },
                    label: { type: 'string', description: 'Task label' },
                    priority: { type: 'string', description: 'Priority (default: medium)' },
                    acceptance_criteria: { type: 'array', items: { type: 'string' }, description: 'Acceptance criteria' },
                    constraints: { type: 'array', items: { type: 'string' }, description: 'Constraints' },
                    depends_on: { type: 'array', items: { type: 'string' }, description: 'Task dependencies' },
                    execution_mode: { type: 'string', description: 'Execution mode (human, agent, pair)' },
                },
                required: ['milestone_id', 'label'],
            },
        },
        {
            name: 'register_agent',
            description: 'Register a new agent or update an existing one',
            inputSchema: {
                type: 'object',
                properties: {
                    agent_id: { type: 'string', description: 'Unique agent ID' },
                    name: { type: 'string', description: 'Agent display name' },
                    type: { type: 'string', description: 'Agent type (orchestrator, sub-agent, human, external)' },
                    permissions: { type: 'array', items: { type: 'string' }, description: 'Permissions list' },
                    color: { type: 'string', description: 'Display color (hex)' },
                    parent_id: { type: 'string', description: 'Parent agent ID' },
                },
                required: ['agent_id', 'name', 'type', 'permissions'],
            },
        },
    ];
}
//# sourceMappingURL=tools.js.map