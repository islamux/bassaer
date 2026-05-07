import type { TrackerState, FoundTask } from 'command-center-shared';
export interface TaskIndexEntry {
    milestoneId: string;
    milestoneCategory: 'active' | 'backlog';
    index: number;
}
export type TaskIndex = Map<string, TaskIndexEntry>;
export declare function buildTaskIndex(state: TrackerState): TaskIndex;
export declare function findTaskFast(state: TrackerState, index: TaskIndex, taskId: string): FoundTask | null;
export declare function invalidateIndex(index: TaskIndex, taskId: string): void;
export declare function addToIndex(index: TaskIndex, taskId: string, entry: TaskIndexEntry): void;
export declare function rebuildIndexIfNeeded(state: TrackerState, index: TaskIndex): TaskIndex;
