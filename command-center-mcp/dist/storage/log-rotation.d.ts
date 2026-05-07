import type { AgentLogEntry } from 'command-center-shared';
export declare function rotateAgentLog(log: AgentLogEntry[]): {
    active: AgentLogEntry[];
    rotated: number;
};
export declare function getArchivedLogCount(): number;
