import React from 'react'
import { Milestone, useStore } from '../store'
import { ProgressRing } from './ProgressRing'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface ContextBarProps {
  milestones: Milestone[]
  activeMilestoneIndex: number
  onMilestoneChange: (index: number) => void
}

export function ContextBar({ milestones, activeMilestoneIndex, onMilestoneChange }: ContextBarProps) {
  const activeMilestone = milestones[activeMilestoneIndex]
  
  if (!activeMilestone) {
    return (
      <div className="h-12 flex items-center px-4 border-b border-border">
        <span className="text-muted text-sm">No milestones available</span>
      </div>
    )
  }

  const progress = activeMilestone.subtasks.length > 0
    ? Math.round((activeMilestone.subtasks.filter(t => t.done).length / activeMilestone.subtasks.length) * 100)
    : 0

  const domainColor = activeMilestone.domain === 'Content' ? '#f59e0b' :
                      activeMilestone.domain === 'UI/UX' ? '#22c55e' :
                      activeMilestone.domain === 'Features' ? '#8286FF' :
                      activeMilestone.domain === 'Scripts' ? '#14B8A6' : '#6366F1'

  const nextMilestone = activeMilestoneIndex < milestones.length - 1 
    ? milestones[activeMilestoneIndex + 1] 
    : null

  const nextMilestoneProgress = nextMilestone
    ? (nextMilestone.subtasks.filter(t => t.done).length / nextMilestone.subtasks.length) * 100
    : 0

  return (
    <div className="h-12 flex items-center px-4 border-b border-border">
      <div className="flex items-center gap-3 flex-1">
        {/* Progress Ring */}
        <div className="w-9 h-9">
          <svg viewBox="0 0 36 36" className="w-full h-full">
            <ProgressRing
              radius={16}
              progress={progress}
              color={domainColor}
            />
          </svg>
        </div>

        {/* Info Block */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted uppercase">
              {activeMilestone.domain} · W{activeMilestone.week}
            </span>
            {activeMilestone.is_key_milestone && (
              <span className="text-xs font-medium text-on-track bg-on-track/10 px-2 py-0.5 rounded">
                {activeMilestone.key_milestone_label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate">
              {activeMilestone.title}
            </h3>
            <span className="text-xs text-muted">
              Week {activeMilestone.week} · {activeMilestone.subtasks.filter(t => t.done).length}/{activeMilestone.subtasks.length} tasks
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onMilestoneChange(activeMilestoneIndex - 1)}
            disabled={activeMilestoneIndex === 0}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <select
            value={activeMilestoneIndex}
            onChange={(e) => onMilestoneChange(Number(e.target.value))}
            className="px-2 py-1 text-xs bg-surface border border-border rounded"
          >
            {milestones.map((milestone, index) => (
              <option key={milestone.id} value={index}>
                {milestone.title}
              </option>
            ))}
          </select>
          <button
            onClick={() => onMilestoneChange(activeMilestoneIndex + 1)}
            disabled={activeMilestoneIndex === milestones.length - 1}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-4" />

        {/* Next-up Section */}
        {nextMilestone ? (
          <div className="flex items-center gap-2 ml-4">
            <div className="w-6 h-6">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <ProgressRing
                  radius={10}
                  progress={nextMilestoneProgress}
                  color={nextMilestone.domain === 'Content' ? '#f59e0b' :
                         nextMilestone.domain === 'UI/UX' ? '#22c55e' :
                         nextMilestone.domain === 'Features' ? '#8286FF' :
                         nextMilestone.domain === 'Scripts' ? '#14B8A6' : '#6366F1'}
                />
              </svg>
            </div>
            <div className="text-xs">
              <div className="font-medium text-primary-text">Next</div>
              <div className="text-muted truncate max-w-[120px]">{nextMilestone.title}</div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted ml-4">
            FINAL MILESTONE
          </div>
        )}
      </div>
    </div>
  )
}
