import fs from 'fs';
import { EventEmitter } from 'events';
import { getTrackerPath } from './config.js';
import { TrackerStateSchema } from 'command-center-shared/src/schema.js';
export class Store extends EventEmitter {
    _state = null;
    _trackerPath;
    constructor() {
        super();
        this._trackerPath = getTrackerPath();
        this.loadFromDisk();
    }
    get state() {
        return this._state;
    }
    loadFromDisk() {
        try {
            const raw = fs.readFileSync(this._trackerPath, 'utf-8');
            const parsed = JSON.parse(raw);
            this._state = TrackerStateSchema.parse(parsed);
            this.emit('change', this._state);
            return true;
        }
        catch {
            return false;
        }
    }
    get trackerPath() {
        return this._trackerPath;
    }
}
//# sourceMappingURL=store.js.map