import { EventEmitter } from 'events';
import type { TrackerState } from 'command-center-shared';
export declare class Store extends EventEmitter {
    private _state;
    private _trackerPath;
    constructor();
    get state(): TrackerState | null;
    loadFromDisk(): boolean;
    get trackerPath(): string;
}
