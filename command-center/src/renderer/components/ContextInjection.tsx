import React, { useState } from 'react'
import { useStore, selectCurrentWeek, selectCurrentPhase, selectScheduleStatus, selectTotalTasks } from '../store'
import { Copy, Check } from 'lucide-react'

export function ContextInjection() {
  const tracker = useStore(s => s.tracker)
  const [isCopied, setIsCopied] = useState(false)

  if (!tracker) {
    return (
      <div className="p-4 border border-border rounded">
        <p className="text-xs text-muted">Tracker not loaded</p>
      </div>
    )
  }

  const currentWeek = selectCurrentWeek(tracker)
  const currentPhase = selectCurrentPhase(tracker)
  const scheduleStatus = selectScheduleStatus(tracker)
  const { done, total, blocked } = selectTotalTasks(tracker)
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  const contextString = `WEEK ${currentWeek}, Phase: ${currentPhase}, Progress: ${progress}% (${done}/${total}), Schedule: ${scheduleStatus}, Blocked: ${blocked}`

  const handleCopy = () => {
    navigator.clipboard.writeText(contextString)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="p-4 border border-border rounded">
      <h4 className="text-xs font-medium text-muted mb-3">CONTEXT INJECTION</h4>

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted/80 w-16">WEEK</span>
          <span className="text-primary-text font-mono">{currentWeek}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted/80 w-16">Phase</span>
          <span className="text-primary-text">{currentPhase}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted/80 w-16">Progress</span>
          <span className="text-primary-text">{progress}% ({done}/{total})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted/80 w-16">Schedule</span>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            scheduleStatus === 'on_track' ? 'bg-on-track/20 text-on-track' :
            scheduleStatus === 'behind' ? 'bg-behind/20 text-behind' :
            'bg-on-track/20 text-on-track'
          }`}>
            {scheduleStatus.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted/80 w-16">Blocked</span>
          <span className="text-primary-text font-mono">{blocked}</span>
        </div>
      </div>

      <button
        onClick={handleCopy}
        className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 text-xs bg-surface-highlight hover:bg-surface border border-border rounded transition-colors"
      >
        {isCopied ? <Check size={14} /> : <Copy size={14} />}
        <span>{isCopied ? 'Copied!' : 'Copy to Clipboard'}</span>
      </button>
    </div>
  )
}
