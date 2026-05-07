import { fail } from './tracker.service.js';
export const AGENT_HEARTBEAT_TIMEOUT_MS = 5 * 60 * 1000;
export const AGENT_MAX_CONCURRENT = 3;
export function getAgent(state, agentId) {
    return state.agents?.find(a => a.id === agentId);
}
export function getAvailableAgents(state) {
    if (!state.agents)
        return [];
    return state.agents.filter(a => a.status !== 'offline' && a.status !== 'stalled');
}
export function findBestAgent(state, task) {
    if (!state.agents)
        return null;
    if (task.agent_target) {
        const target = state.agents.find(a => a.id === task.agent_target);
        if (target && target.status !== 'offline' && target.status !== 'stalled') {
            return target;
        }
    }
    const candidates = getAvailableAgents(state);
    if (candidates.length === 0)
        return null;
    const busyCount = {};
    for (const m of [...state.milestones.active, ...state.milestones.backlog]) {
        for (const t of m.subtasks) {
            if (t.status === 'in_progress' && t.assignee) {
                busyCount[t.assignee] = (busyCount[t.assignee] || 0) + 1;
            }
        }
    }
    const available = candidates.filter(a => (busyCount[a.id] || 0) < AGENT_MAX_CONCURRENT);
    if (available.length === 0)
        return null;
    return available.sort((a, b) => {
        const aBusy = busyCount[a.id] || 0;
        const bBusy = busyCount[b.id] || 0;
        return aBusy - bBusy;
    })[0];
}
export function dispatchTask(state, taskId, agentId) {
    const agentIdToUse = agentId || 'orchestrator';
    const agent = getAgent(state, agentIdToUse);
    if (!agent) {
        return { ok: false, agent_id: agentIdToUse, task_id: taskId, error: `Agent not found: ${agentIdToUse}` };
    }
    if (!checkPermission(agent, 'EXECUTE')) {
        return { ok: false, agent_id: agentIdToUse, task_id: taskId, error: `Agent ${agentIdToUse} lacks EXECUTE permission` };
    }
    if (agent.status === 'offline') {
        return { ok: false, agent_id: agentIdToUse, task_id: taskId, error: `Agent ${agentIdToUse} is offline` };
    }
    const busyCount = getAgentBusyCount(state, agentIdToUse);
    if (busyCount >= AGENT_MAX_CONCURRENT) {
        return { ok: false, agent_id: agentIdToUse, task_id: taskId, error: `Agent ${agentIdToUse} is at max capacity (${AGENT_MAX_CONCURRENT})` };
    }
    return { ok: true, agent_id: agentIdToUse, task_id: taskId, message: `Task dispatched to ${agent.name} (${agentIdToUse})` };
}
export function checkPermission(agent, required) {
    if (agent.permissions.includes('ADMIN'))
        return true;
    return agent.permissions.includes(required);
}
export function getAgentBusyCount(state, agentId) {
    let count = 0;
    for (const m of [...state.milestones.active, ...state.milestones.backlog]) {
        for (const t of m.subtasks) {
            if (t.status === 'in_progress' && t.assignee === agentId) {
                count++;
            }
        }
    }
    return count;
}
export function updateHeartbeat(state, agentId) {
    const agent = getAgent(state, agentId);
    if (!agent)
        return;
    agent.last_action_at = new Date().toISOString();
    agent.status = 'active';
}
export function checkAgentHeartbeats(state) {
    if (!state.agents)
        return { stalled: [], active: 0 };
    const now = Date.now();
    const stalled = [];
    let active = 0;
    for (const agent of state.agents) {
        if (!agent.last_action_at) {
            continue;
        }
        const lastSeen = new Date(agent.last_action_at).getTime();
        const elapsed = now - lastSeen;
        if (elapsed > AGENT_HEARTBEAT_TIMEOUT_MS && agent.status === 'active') {
            agent.status = 'stalled';
            stalled.push(agent.id);
        }
        else if (agent.status === 'active') {
            active++;
        }
    }
    return { stalled, active };
}
export function validateResult(state, taskId, summary) {
    const all = [...state.milestones.active, ...state.milestones.backlog];
    let task = null;
    for (const m of all) {
        const found = m.subtasks.find(s => s.id === taskId);
        if (found) {
            task = found;
            break;
        }
    }
    if (!task) {
        return { passed: false, criteria_met: 0, criteria_total: 0, failures: [`Task not found: ${taskId}`] };
    }
    if (task.acceptance_criteria.length === 0) {
        return { passed: true, criteria_met: 0, criteria_total: 0, failures: [] };
    }
    const failures = [];
    const summaryLower = summary.toLowerCase();
    for (const criterion of task.acceptance_criteria) {
        const keyTerms = extractKeyTerms(criterion);
        const met = keyTerms.some(term => summaryLower.includes(term.toLowerCase()));
        if (!met) {
            failures.push(criterion);
        }
    }
    return {
        passed: failures.length === 0,
        criteria_met: task.acceptance_criteria.length - failures.length,
        criteria_total: task.acceptance_criteria.length,
        failures,
    };
}
function extractKeyTerms(criterion) {
    const stopwords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and', 'or', 'if', 'while', 'that', 'this', 'these', 'those', 'it', 'its']);
    return criterion.split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w.toLowerCase().replace(/[^a-z0-9]/gi, '')));
}
export function enforceAgentPermission(state, agentId, required) {
    const agent = getAgent(state, agentId);
    if (!agent) {
        return fail(`Agent not found: ${agentId}`);
    }
    if (!checkPermission(agent, required)) {
        return fail(`Agent \`${agentId}\` lacks ${required} permission (has: ${agent.permissions.join(', ')})`);
    }
    return null;
}
//# sourceMappingURL=agent-dispatch.service.js.map