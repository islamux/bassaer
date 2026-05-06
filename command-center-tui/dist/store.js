import fs from 'fs';
import { EventEmitter } from 'events';
import { getTrackerPath } from './config.js';
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
            this._state = JSON.parse(raw);
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