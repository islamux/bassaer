import React from 'react'
import { useStore } from '../store'

export function SharedStateInfo() {
  const tracker = useStore(s => s.tracker)
  const synced = useStore(s => s.synced)

  if (!tracker) {
    return (
      <div className="p-4 border border-border rounded">
        <p className="text-xs text-muted">Tracker not loaded</p>
      </div>
    )
  }

  const totalSubtasks = tracker.milestones.reduce((sum, m) => sum + m.subtasks.length, 0)

  return (
    <div className="p-4 border border-border rounded">
      <h4 className="text-xs font-medium text-muted mb-3">SHARED STATE FILE</h4>

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted/80 w-20">Path:</span>
          <span className="text-primary-text font-mono truncate">project-tracker.json</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted/80 w-20">Watcher:</span>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${synced ? 'bg-on-track' : 'bg-behind'}`} />
            <span className={`text-${synced ? 'on-track' : 'behind'}`}>
              {synced ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted/80 w-20">Milestones:</span>
          <span className="text-primary-text font-mono">{tracker.milestones.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted/80 w-20">Subtasks:</span>
          <span className="text-primary-text font-mono">{totalSubtasks}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted/80 w-20">Log entries:</span>
          <span className="text-primary-text font-mono">{tracker.agent_log.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted/80 w-20">Schema:</span>
          <span className="text-on-track text-xs font-medium">Valid</span>
        </div>
      </div>
    </div>
  )
}
