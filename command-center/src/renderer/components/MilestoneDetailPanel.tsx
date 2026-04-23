import React, { useState } from 'react'
import { Milestone, Subtask, useStore } from '../store'
import { X } from 'lucide-react'

export interface MilestoneDetailPanelProps {
  milestone: Milestone
  onClose: () => void
}

export function MilestoneDetailPanel({ milestone, onClose }: MilestoneDetailPanelProps) {
  const updateTracker = useStore(s => s.updateTracker)
  const [newNote, setNewNote] = useState('')

  const progress = milestone.subtasks.length > 0
    ? Math.round((milestone.subtasks.filter(t => t.done).length / milestone.subtasks.length) * 100)
    : 0

  const domainColor = milestone.domain === 'Content' ? '#f59e0b' :
                      milestone.domain === 'UI/UX' ? '#22c55e' :
                      milestone.domain === 'Features' ? '#8286FF' :
                      milestone.domain === 'Scripts' ? '#14B8A6' : '#6366F1'

  const toggleSubtask = (subtaskId: string) => {
    updateTracker(draft => {
      const subtask = draft.milestones
        .find(m => m.id === milestone.id)
        ?.subtasks.find(t => t.id === subtaskId)
      if (subtask) {
        subtask.done = !subtask.done
        subtask.completed_at = subtask.done ? new Date().toISOString() : null
      }
    })
  }

  const addNote = () => {
    if (newNote.trim()) {
      updateTracker(draft => {
        const ms = draft.milestones.find(m => m.id === milestone.id)
        if (ms) {
          ms.notes.push(newNote.trim())
        }
      })
      setNewNote('')
    }
  }

  return (
    <div className="fixed right-0 top-0 h-full w-[480px] bg-surface border-l border-border z-50 overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: domainColor }} />
            <span className="text-xs font-medium text-muted uppercase">
              {milestone.domain} · W{milestone.week}
            </span>
            {milestone.is_key_milestone && (
              <span className="text-xs font-medium text-on-track bg-on-track/10 px-2 py-0.5 rounded">
                {milestone.key_milestone_label}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary-text">
            <X size={16} />
          </button>
        </div>

        <h3 className="text-lg font-semibold mb-2">{milestone.title}</h3>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted">PROGRESS</span>
            <span className="text-xs font-mono text-primary-text ml-auto">
              {progress}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-progress-track">
            <div
              className="h-full rounded-full"
              style={{ 
                width: `${progress}%`, 
                backgroundColor: domainColor 
              }}
            />
          </div>
        </div>

        {/* Schedule Section */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted mb-3">SCHEDULE</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted mb-1">Planned Start</div>
              <div className="text-primary-text">
                {milestone.planned_start || 'Not set'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Planned End</div>
              <div className="text-primary-text">
                {milestone.planned_end || 'Not set'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Actual Start</div>
              <div className="text-primary-text">
                {milestone.actual_start || 'Not started'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Actual End</div>
              <div className="text-primary-text">
                {milestone.actual_end || 'Not completed'}
              </div>
            </div>
          </div>
          {milestone.drift_days !== 0 && (
            <div className={`mt-2 text-xs font-medium ${
              milestone.drift_days > 0 ? 'text-behind' : 'text-on-track'
            }`}>
              {milestone.drift_days > 0 ? '▲' : '▼'} {Math.abs(milestone.drift_days)} DAYS 
              {milestone.drift_days > 0 ? 'BEHIND' : 'AHEAD'}
            </div>
          )}
        </div>

        {/* Subtasks Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-muted">SUBTASKS</h4>
            <span className="text-xs text-muted">
              {milestone.subtasks.filter(t => t.done).length}/{milestone.subtasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {milestone.subtasks.map(subtask => (
              <SubtaskItem
                key={subtask.id}
                subtask={subtask}
                onToggle={toggleSubtask}
              />
            ))}
          </div>
        </div>

        {/* Dependencies Section */}
        {milestone.dependencies && milestone.dependencies.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted mb-3">DEPENDENCIES</h4>
            <div className="space-y-2">
              {milestone.dependencies.map(depId => (
                <div key={depId} className="flex items-center gap-2 p-2 rounded bg-surface-highlight">
                  <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-muted" />
                  </div>
                  <div>
                    <div className="text-sm text-primary-text">{depId}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted mb-3">NOTES</h4>
          {milestone.notes.length > 0 ? (
            <div className="space-y-2 mb-4">
              {milestone.notes.map((note, index) => (
                <div key={index} className="p-2 rounded bg-surface-highlight text-sm">
                  {note}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted mb-4">No notes yet</div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="flex-1 px-2 py-1 text-xs bg-surface border border-border rounded"
              onKeyPress={(e) => e.key === 'Enter' && addNote()}
            />
            <button
              onClick={addNote}
              className="px-3 py-1 text-xs bg-accent text-white rounded hover:bg-accent/80"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SubtaskItem({ subtask, onToggle }: { subtask: Subtask; onToggle: (id: string) => void }) {
  const priorityColors: Record<string, string> = {
    P1: 'text-behind',
    P2: 'text-warning',
    P3: 'text-muted',
  }

  const statusColors: Record<string, string> = {
    todo: 'bg-muted/20 border-muted/40',
    in_progress: 'bg-on-track/20 border-on-track/40',
    review: 'bg-warning/20 border-warning/40',
    done: 'bg-accent/20 border-accent/40',
    blocked: 'bg-behind/20 border-behind/40',
  }

  return (
    <div className={`flex items-center gap-2 p-2 rounded border text-xs ${statusColors[subtask.status]}`}>
      <input
        type="checkbox"
        checked={subtask.done}
        onChange={() => onToggle(subtask.id)}
        className="w-4 h-4"
      />
      <div className="flex-1">
        <div className="text-primary-text">{subtask.label}</div>
        <div className="flex items-center gap-2 text-[10px] text-muted">
          <span className={priorityColors[subtask.priority]}>
            {subtask.priority}
          </span>
          <span>{subtask.assignee || 'Unassigned'}</span>
        </div>
      </div>
      <div className={`w-1.5 h-1.5 rounded-full ${priorityColors[subtask.priority]}`} />
    </div>
  )
}
