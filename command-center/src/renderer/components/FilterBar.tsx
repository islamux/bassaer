import React from 'react'
import { useStore } from '../store'

export type FilterType = 'all' | 'my_tasks' | 'agent_tasks' | 'blocked'

export interface FilterBarProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
  taskCounts: Record<FilterType, number>
  operatorName: string
}

export function FilterBar({ activeFilter, onFilterChange, taskCounts, operatorName }: FilterBarProps) {
  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'my_tasks', label: 'My Tasks' },
    { id: 'agent_tasks', label: 'Agent Tasks' },
    { id: 'blocked', label: 'Blocked' }
  ]

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
      {filters.map(filter => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
            activeFilter === filter.id
              ? 'bg-accent text-white'
              : 'text-muted hover:text-primary-text hover:bg-surface'
          }`}
        >
          {filter.label}
          <span className={`text-[10px] font-mono ${
            activeFilter === filter.id ? 'text-white/80' : 'text-muted/60'
          }`}>
            [{taskCounts[filter.id]}]
          </span>
        </button>
      ))}
    </div>
  )
}
