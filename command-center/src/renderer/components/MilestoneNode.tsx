import React from 'react'
import { ProgressRing } from './ProgressRing'
import { Milestone } from '../store'

export interface MilestoneNodeProps {
  milestone: Milestone
  x: number
  y: number
  isSelected: boolean
  onClick: () => void
}

export function MilestoneNode({ milestone, x, y, isSelected, onClick }: MilestoneNodeProps) {
  const progress = milestone.subtasks.length > 0
    ? Math.round((milestone.subtasks.filter(t => t.done).length / milestone.subtasks.length) * 100)
    : 0

  return (
    <g transform={`translate(${x}, ${y})`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <ProgressRing
        radius={milestone.is_key_milestone ? 26 : 20}
        progress={progress}
        color={milestone.domain === 'Content' ? '#f59e0b' :
              milestone.domain === 'UI/UX' ? '#22c55e' :
              milestone.domain === 'Features' ? '#8286FF' :
              milestone.domain === 'Scripts' ? '#14B8A6' : '#6366F1'}
        isKey={milestone.is_key_milestone}
        isSelected={isSelected}
      />
    </g>
  )
}
