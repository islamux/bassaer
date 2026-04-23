import React, { useState, useEffect } from 'react'
import { Subtask, Milestone, useStore } from '../store'
import { X, Copy, Check, Clock, User, AlertTriangle, Link } from 'lucide-react'

export interface TaskDetailModalProps {
  subtask: Subtask
  milestone: Milestone
  onClose: () => void
  onSave: (updatedSubtask: Subtask) => void
}

export function TaskDetailModal({ subtask, milestone, onClose, onSave }: TaskDetailModalProps) {
  const tracker = useStore(s => s.tracker)
  const [editedSubtask, setEditedSubtask] = useState<Subtask>(subtask)
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details')
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Subtask['status']
    setEditedSubtask(prev => ({
      ...prev,
      status: newStatus,
      // If moving to done, set completion info
      ...(newStatus === 'done' && {
        completed_at: new Date().toISOString(),
        completed_by: 'operator'
      }),
      // If moving from blocked, clear blocked info
      ...(prev.status === 'blocked' && newStatus !== 'blocked' && {
        blocked_by: null,
        blocked_reason: null
      })
    }))
  }

  const handleBlockedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isBlocked = e.target.checked
    setEditedSubtask(prev => ({
      ...prev,
      status: isBlocked ? 'blocked' : 'todo',
      blocked_by: isBlocked ? 'manual' : null,
      blocked_reason: isBlocked ? prev.blocked_reason || '' : null
    }))
  }

  const handleSave = () => {
    onSave(editedSubtask)
    onClose()
  }

  // Get agent names for assignee dropdown
  const agents = tracker?.agents || []
  const agentOptions = [
    { id: 'unassigned', name: 'Unassigned' },
    ...agents.map(agent => ({ id: agent.id, name: agent.name })),
    { id: 'operator', name: 'Operator' }
  ]

  // Filter agent log for this task
  const taskHistory = tracker?.agent_log.filter(entry => 
    entry.target_id === subtask.id && entry.target_type === 'subtask'
  ) || []

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            {/* Domain tag */}
            <span className="text-xs font-medium text-muted uppercase">
              {milestone.domain}
            </span>
            
            {/* Priority badge */}
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
              subtask.priority === 'P1' ? 'bg-behind/20 text-behind' :
              subtask.priority === 'P2' ? 'bg-warning/20 text-warning' :
              'bg-muted/20 text-muted'
            }`}>
              {subtask.priority}
            </span>
            
            {/* Execution mode */}
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
              subtask.execution_mode === 'agent' ? 'bg-behind/20 text-behind' :
              subtask.execution_mode === 'human' ? 'bg-on-track/20 text-on-track' :
              'bg-warning/20 text-warning'
            }`}>
              {subtask.execution_mode}
            </span>
          </div>
          
          {/* Task ID with copy */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted">
              {subtask.id}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(subtask.id)
                setIsCopied(true)
                setTimeout(() => setIsCopied(false), 2000)
              }}
              className="text-muted hover:text-primary-text"
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          
          {/* Close button */}
          <button onClick={onClose} className="text-muted hover:text-primary-text">
            <X size={18} />
          </button>
        </div>

        {/* Title */}
        <div className="px-6 py-3">
          <h3 className="text-lg font-semibold">{subtask.label}</h3>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'bg-surface-highlight text-primary-text border-b-2 border-accent'
                : 'text-muted hover:text-primary-text'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-surface-highlight text-primary-text border-b-2 border-accent'
                : 'text-muted hover:text-primary-text'
            }`}
          >
            History
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted mb-1 block">Status</label>
                  <select
                    value={editedSubtask.status}
                    onChange={handleStatusChange}
                    className="w-full px-3 py-2 text-sm bg-surface border border-border rounded"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Priority</label>
                  <select
                    value={editedSubtask.priority}
                    onChange={(e) => setEditedSubtask(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-surface border border-border rounded"
                  >
                    <option value="P1">P1 (High)</option>
                    <option value="P2">P2 (Medium)</option>
                    <option value="P3">P3 (Low)</option>
                  </select>
                </div>
              </div>

              {/* Assignee and Execution Mode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted mb-1 block">Assignee</label>
                  <select
                    value={editedSubtask.assignee || 'unassigned'}
                    onChange={(e) => setEditedSubtask(prev => ({
                      ...prev,
                      assignee: e.target.value === 'unassigned' ? null : e.target.value
                    }))}
                    className="w-full px-3 py-2 text-sm bg-surface border border-border rounded"
                  >
                    {agentOptions.map(option => (
                      <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Execution Mode</label>
                  <select
                    value={editedSubtask.execution_mode}
                    onChange={(e) => setEditedSubtask(prev => ({
                      ...prev,
                      execution_mode: e.target.value as 'human' | 'agent' | 'pair'
                    }))}
                    className="w-full px-3 py-2 text-sm bg-surface border border-border rounded"
                  >
                    <option value="human">Human</option>
                    <option value="agent">Agent</option>
                    <option value="pair">Pair</option>
                  </select>
                </div>
              </div>

              {/* Blocked Section */}
              <div className="border border-border rounded p-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={editedSubtask.status === 'blocked'}
                    onChange={handleBlockedChange}
                    id="blocked-checkbox"
                    className="w-4 h-4"
                  />
                  <label htmlFor="blocked-checkbox" className="text-sm font-medium">
                    Blocked
                  </label>
                </div>
                
                {editedSubtask.status === 'blocked' && (
                  <div className="ml-6">
                    <label className="text-xs text-muted mb-1 block">Reason</label>
                    <input
                      type="text"
                      value={editedSubtask.blocked_reason || ''}
                      onChange={(e) => setEditedSubtask(prev => ({
                        ...prev,
                        blocked_reason: e.target.value
                      }))}
                      placeholder="Why is this task blocked?"
                      className="w-full px-3 py-2 text-sm bg-surface border border-border rounded"
                    />
                  </div>
                )}
              </div>

              {/* Dependencies */}
              {editedSubtask.depends_on && editedSubtask.depends_on.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted mb-2">Dependencies</h4>
                  <div className="space-y-2">
                    {editedSubtask.depends_on.map(depId => {
                      const depTask = milestone.subtasks.find(t => t.id === depId)
                      return (
                        <div key={depId} className="flex items-center gap-2 p-2 bg-surface-highlight rounded">
                          <div className={`w-2 h-2 rounded-full ${
                            depTask?.status === 'done' ? 'bg-accent' : 'bg-muted'
                          }`} />
                          <span className="text-sm">{depId}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ml-auto ${
                            depTask?.status === 'done' ? 'bg-accent/20 text-accent' :
                            depTask?.status === 'blocked' ? 'bg-behind/20 text-behind' :
                            'bg-warning/20 text-warning'
                          }`}>
                            {depTask?.status || 'unknown'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs text-muted mb-1 block">Notes</label>
                <textarea
                  value={editedSubtask.notes || ''}
                  onChange={(e) => setEditedSubtask(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="Add any additional notes..."
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded min-h-[100px]"
                />
              </div>

              {/* Parent Milestone */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Link size={14} className="text-muted" />
                  <span className="text-muted">Part of</span>
                  <span className="text-primary-text font-medium">{milestone.title}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted mb-3">Task History</h4>
              
              {taskHistory.length > 0 ? (
                <div className="space-y-3">
                  {taskHistory.map(entry => (
                    <div key={entry.id} className="p-3 bg-surface-highlight rounded">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 flex-shrink-0">
                          <div className="w-full h-full bg-muted/20 rounded flex items-center justify-center">
                            <span className="text-xs font-mono">{entry.agent_id.slice(0, 2)}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-primary-text">
                              {entry.agent_id}
                            </span>
                            <span className="text-xs text-muted">
                              {entry.action}
                            </span>
                            {entry.tags.map(tag => (
                              <span key={tag} className="text-xs bg-muted/20 px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-primary-text mb-1">
                            {entry.description}
                          </p>
                          <div className="text-xs text-muted/80">
                            {new Date(entry.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted">
                  <span className="text-sm">No history for this task</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Status:</span>
            <span className={`text-sm font-medium px-2 py-0.5 rounded ${
              editedSubtask.status === 'done' ? 'bg-accent/20 text-accent' :
              editedSubtask.status === 'blocked' ? 'bg-behind/20 text-behind' :
              editedSubtask.status === 'in_progress' ? 'bg-on-track/20 text-on-track' :
              editedSubtask.status === 'review' ? 'bg-warning/20 text-warning' :
              'bg-muted/20 text-muted'
            }`}>
              {editedSubtask.status}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted hover:text-primary-text transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-accent text-white rounded hover:bg-accent/80 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
