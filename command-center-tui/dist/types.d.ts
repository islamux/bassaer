export interface ProjectMeta {
    name: string;
    start_date: string;
    target_date: string;
    current_week: number;
    schedule_status: 'on_track' | 'behind' | 'ahead';
    overall_progress: number;
}
export interface Subtask {
    id: string;
    label: string;
    status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
    done: boolean;
    assignee: string | null;
    priority: string;
    completed_at: string | null;
    notes: string | null;
}
export interface Milestone {
    id: string;
    title: string;
    domain: string;
    week: number;
    phase: string;
    planned_start: string | null;
    planned_end: string | null;
    actual_start: string | null;
    actual_end: string | null;
    drift_days: number;
    is_key_milestone: boolean;
    key_milestone_label: string | null;
    subtasks: Subtask[];
    dependencies: string[];
    notes: string[];
}
export interface CompletedMilestone {
    id: string;
    title: string;
    completed_at: string;
    summary: string;
    domain?: string;
    week?: number | string;
    phase?: string;
    subtasks?: Subtask[];
}
export interface CategorizedMilestones {
    active: Milestone[];
    backlog: Milestone[];
    completed: CompletedMilestone[];
}
export interface HistoryLogEntry {
    date: string;
    event?: string;
    action?: string;
    agent?: string;
}
export interface Dashboard {
    current_focus: string;
    active_milestone: string;
    next_priority: string;
    blockers: string;
    health: string;
}
export interface TrackerState {
    project: ProjectMeta;
    dashboard?: Dashboard;
    milestones: CategorizedMilestones;
    history_log?: HistoryLogEntry[];
}
export declare function allMilestones(state: TrackerState): Milestone[];
