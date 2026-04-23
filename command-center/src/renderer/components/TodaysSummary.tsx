import React from 'react'
import { useStore } from '../store'

export function TodaysSummary() {
  const tracker = useStore(s => s.tracker)

  if (!tracker) {
    return (
      <div className="p-4 border border-border rounded">
        <p className="text-xs text-muted">Tracker not loaded</p>
      </div>
    )
  }

  // Get today's date for filtering
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Count tasks by status
  const allSubtasks = tracker.milestones.flatMap(m => m.subtasks)
  
  const completedToday = allSubtasks.filter(task => 
    task.status === 'done' && 
    task.completed_at && 
    new Date(task.completed_at) >= today
  ).length

  const inProgress = allSubtasks.filter(task => task.status === 'in_progress').length
  const blocked = allSubtasks.filter(task => task.status === 'blocked').length

  // Count agent contributions for today
  const todaysLog = tracker.agent_log.filter(entry => 
    new Date(entry.timestamp) >= today
  )

  const agentContributions = todaysLog.reduce((acc, entry) => {
    if (!acc[entry.agent_id]) {
      acc[entry.agent_id] = 0
    }
    acc[entry.agent_id]++
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-4 border border-border rounded">
      <h4 className="text-xs font-medium text-muted mb-3">TODAY'S SUMMARY</h4>

      <div className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-muted/80">Completed</div>
            <div className="text-lg font-bold">{completedToday}</div>
          </div>
          <div>
            <div className="text-xs text-muted/80">In Progress</div>
            <div className="text-lg font-bold">{inProgress}</div>
          </div>
          <div>
            <div className="text-xs text-muted/80">Blocked</div>
            <div className="text-lg font-bold">{blocked}</div>
          </div>
        </div>

        {/* Contributions */}
        <div>
          <div className="text-xs text-muted/80 mb-2">─── Contributions ───</div>
          {Object.entries(agentContributions).length > 0 ? (
            <div className="space-y-1 text-xs">
              {Object.entries(agentContributions)
                .sort((a, b) => b[1] - a[1])
                .map(([agentId, count]) => {
                  const agent = tracker.agents.find(a => a.id === agentId)
                  return (
                    <div key={agentId} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: agent?.color || '#9B9BAA' }} />
                      <span className="text-primary-text truncate flex-1">{agentId}</span>
                      <span className="text-muted/80">{count} actions</span>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="text-xs text-muted/60">No contributions today</div>
          )}
        </div>
      </div>
    </div>
  )
}
