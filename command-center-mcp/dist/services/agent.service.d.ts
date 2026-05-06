import type { ServiceResult } from '../types.js';
export declare function registerAgent(agentId: string, name: string, type: string, permissions: string[], options?: {
    color?: string;
    parent_id?: string;
}): ServiceResult;
