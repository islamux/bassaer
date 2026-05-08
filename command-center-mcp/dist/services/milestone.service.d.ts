import type { ServiceResult } from 'command-center-shared';
export declare function addMilestoneNote(milestoneId: string, note: string): ServiceResult;
export declare function setMilestoneDates(milestoneId: string, dates: {
    actual_start?: string;
    actual_end?: string;
}): ServiceResult;
export declare function updateDrift(milestoneId: string, driftDays: number): ServiceResult;
export declare function createMilestone(id: string, title: string, options?: Record<string, any>): ServiceResult;
export declare function addMilestoneTask(milestoneId: string, label: string, options?: Record<string, any>): ServiceResult;
export declare function activateMilestone(milestoneId: string): ServiceResult;
export declare function moveMilestoneToCompleted(milestoneId: string): ServiceResult;
