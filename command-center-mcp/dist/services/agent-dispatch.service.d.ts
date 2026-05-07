import type { TrackerState, Agent, Subtask, ServiceResult } from 'command-center-shared';
export type AgentPermission = 'READ' | 'WRITE' | 'EXECUTE' | 'DISPATCH' | 'APPROVE' | 'ADMIN';
export type AgentStatus = 'active' | 'idle' | 'busy' | 'stalled' | 'offline';
export declare const AGENT_HEARTBEAT_TIMEOUT_MS: number;
export declare const AGENT_MAX_CONCURRENT = 3;
export interface AgentDispatchResult {
    ok: boolean;
    agent_id: string | null;
    task_id: string | null;
    error?: string;
    message?: string;
}
export interface ValidationResult {
    passed: boolean;
    criteria_met: number;
    criteria_total: number;
    failures: string[];
}
export declare function getAgent(state: TrackerState, agentId: string): Agent | undefined;
export declare function getAvailableAgents(state: TrackerState): Agent[];
export declare function findBestAgent(state: TrackerState, task: Subtask): Agent | null;
export declare function dispatchTask(state: TrackerState, taskId: string, agentId?: string): AgentDispatchResult;
export declare function checkPermission(agent: Agent, required: AgentPermission): boolean;
export declare function getAgentBusyCount(state: TrackerState, agentId: string): number;
export declare function updateHeartbeat(state: TrackerState, agentId: string): void;
export declare function checkAgentHeartbeats(state: TrackerState): {
    stalled: string[];
    active: number;
};
export declare function validateResult(state: TrackerState, taskId: string, summary: string): ValidationResult;
export declare function enforceAgentPermission(state: TrackerState, agentId: string, required: AgentPermission): ServiceResult | null;
