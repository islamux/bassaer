export interface UndoEntry {
    timestamp: string;
    operation: string;
    snapshot: string;
}
export declare function createBackup(operation: string): void;
export declare function getLastUndo(): UndoEntry | null;
export declare function popUndo(): UndoEntry | null;
