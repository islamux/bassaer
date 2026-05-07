import type { TrackerState } from 'command-center-shared';
export declare const CURRENT_SCHEMA_VERSION = 1;
export interface Migration {
    version: number;
    name: string;
    run: (state: TrackerState) => void;
}
export declare function runMigrations(state: TrackerState): TrackerState;
export declare function getPendingMigrations(state: TrackerState): Migration[];
export declare function getSchemaVersion(state: TrackerState): number;
