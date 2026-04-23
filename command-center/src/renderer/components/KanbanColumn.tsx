import React from 'react'
import { Subtask } from '../store'
import { TaskCard } from './TaskCard'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export interface KanbanColumnProps {
  column: {
    id: string
    label: string
    color: string
  }
  subtasks: Subtask[]
  domain: string
  onCardClick: (subtask: Subtask) => void
}

export function KanbanColumn({ column, subtasks, domain, onCardClick }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  return (
    <div className="flex-1 min-w-[240px] max-w-[320px] flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-1 h-4 rounded" style={{ backgroundColor: column.color }} />
        <span className="text-xs font-bold uppercase text-muted">
          {column.label}
        </span>
        <span className="text-xs text-muted font-mono">
          [{subtasks.length}]
        </span>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[120px] transition-colors ${
          subtasks.length === 0 ? 'border-2 border-dashed border-border/30 rounded' : ''
        }`}
      >
        <SortableContext items={subtasks} strategy={verticalListSortingStrategy}>
          {subtasks.length > 0 ? (
            <div className="space-y-2 p-2">
              {subtasks.map(subtask => (
                <TaskCard
                  key={subtask.id}
                  subtask={subtask}
                  domain={domain}
                  onClick={() => onCardClick(subtask)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-xs text-muted/60">DROP HERE</span>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
