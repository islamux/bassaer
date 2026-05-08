import type { ServiceResult } from 'command-center-shared';
export declare function registerAgent(agentId: string, name: string, type: string, permissions: string[], options?: {
    color?: string;
    parent_id?: string;
}): ServiceResult;
