import React from 'react'
import { Subtask } from '../store'
import { Check } from 'lucide-react'

export interface TaskChipProps {
  subtask: Subtask
  domain: string
}

export function TaskChip({ subtask, domain }: TaskChipProps) {
  const getDomainColor = () => {
    if (domain === 'Content') return '#f59e0b'
    if (domain === 'UI/UX') return '#22c55e'
    if (domain === 'Features') return '#8286FF'
    if (domain === 'Scripts') return '#14B8A6'
    return '#6366F1'
  }

  return (
    <div
      className="bg-surface/50 border border-border/50 rounded p-2 text-xs mb-1"
      style={{ borderLeft: `3px solid ${getDomainColor()}` }}
    >
      <div className="flex items-center gap-1 truncate">
        <Check size={12} className="text-on-track flex-shrink-0" />
        <span className="text-primary-text truncate flex-1">
          {subtask.label}
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: getDomainColor() }}
        />
      </div>
    </div>
  )
}
