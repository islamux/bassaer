export declare const PROJECT_ROOT: string;
export declare const TRACKER_PATH: string;
export declare function readRaw(): string;
export declare function writeAtomic(data: string): void;
export declare function withLock<T>(fn: () => T): T;
