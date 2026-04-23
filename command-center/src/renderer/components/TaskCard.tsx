import React from 'react'
import { Subtask } from '../store'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export interface TaskCardProps {
  subtask: Subtask
  domain: string
  onClick: () => void
}

export function TaskCard({ subtask, domain, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: subtask.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto'
  }

  // Determine border color based on execution mode
  const getBorderColor = () => {
    if (subtask.execution_mode === 'agent') return '#ef4444' // red
    if (subtask.execution_mode === 'human') return '#22c55e' // green
    if (subtask.execution_mode === 'pair') return '#3b82f6' // blue
    return '#9B9BAA' // default muted
  }

  // Determine domain color
  const getDomainColor = () => {
    if (domain === 'Content') return '#f59e0b'
    if (domain === 'UI/UX') return '#22c55e'
    if (domain === 'Features') return '#8286FF'
    if (domain === 'Scripts') return '#14B8A6'
    return '#6366F1'
  }

  // Split title and description
  const [title, description] = React.useMemo(() => {
    const parts = subtask.label.split(/[:\-]/)
    return [parts[0].trim(), parts.slice(1).join(' ').trim()]
  }, [subtask.label])

  return (
      <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`task-card bg-surface border-l-2 rounded p-3 text-xs cursor-pointer hover:bg-surface-highlight transition-colors`}
    >
      <style>
        {`
          .task-card {
            border-left-color: ${getBorderColor()};
            ${subtask.status === 'in_progress' ? 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;' : ''}
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
        `}
      </style>

      {/* Top row: domain tag + priority */}
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: getDomainColor() }}
        />
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
          subtask.priority === 'P1' ? 'bg-behind/20 text-behind' :
          subtask.priority === 'P2' ? 'bg-warning/20 text-warning' :
          'bg-muted/20 text-muted'
        }`}>
          {subtask.priority}
        </span>
      </div>

      {/* Title */}
      <div className="font-medium text-primary-text mb-1 truncate">
        {title}
      </div>

      {/* Description */}
      {description && (
        <div className="text-muted/80 line-clamp-2 mb-2">
          {description}
        </div>
      )}

      {/* Blocker bar */}
      {subtask.status === 'blocked' && subtask.blocked_reason && (
        <div className="bg-behind/10 text-behind/80 text-[10px] p-1 rounded mb-2">
          ⊘ {subtask.blocked_reason}
        </div>
      )}

      {/* Assignee chip */}
      <div className="flex justify-between items-center">
        {subtask.assignee && (
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${
              subtask.execution_mode === 'agent' ? 'bg-behind animate-pulse' : 'bg-on-track'
            }`} />
            <span className="text-[10px] text-muted">
              {subtask.assignee}
            </span>
          </div>
        )}
        
        {/* Status indicator */}
        <div className={`w-1.5 h-1.5 rounded-full ${
          subtask.status === 'done' ? 'bg-accent' :
          subtask.status === 'blocked' ? 'bg-behind' :
          subtask.status === 'in_progress' ? 'bg-on-track' :
          subtask.status === 'review' ? 'bg-warning' :
          'bg-muted'
        }`} />
      </div>
    </div>
  )
}
