import fs from 'fs'
import { EventEmitter } from 'events'
import { getTrackerPath } from './config.js'
import type { TrackerState } from './types.js'

export class Store extends EventEmitter {
  private _state: TrackerState | null = null
  private _trackerPath: string

  constructor() {
    super()
    this._trackerPath = getTrackerPath()
    this.loadFromDisk()
  }

  get state(): TrackerState | null {
    return this._state
  }

  loadFromDisk(): boolean {
    try {
      const raw = fs.readFileSync(this._trackerPath, 'utf-8')
      this._state = JSON.parse(raw) as TrackerState
      this.emit('change', this._state)
      return true
    } catch {
      return false
    }
  }

  get trackerPath(): string {
    return this._trackerPath
  }
}
