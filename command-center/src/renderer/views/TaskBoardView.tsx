import React, { useState, useMemo } from 'react'
import { useStore, type Subtask, type Milestone } from '../store'
import { ContextBar } from '../components/ContextBar'
import { FilterBar, type FilterType } from '../components/FilterBar'
import { KanbanColumn } from '../components/KanbanColumn'
import { TaskDetailModal } from '../components/TaskDetailModal'
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

export function TaskBoardView() {
  const tracker = useStore(s => s.tracker)
  const updateTracker = useStore(s => s.updateTracker)
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedTask, setSelectedTask] = useState<Subtask | null>(null)
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  if (!tracker || tracker.milestones.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted text-sm">
        No milestones available — tasks will appear after hydration
      </div>
    )
  }

  const activeMilestone = tracker.milestones[activeMilestoneIndex]

  // Filter tasks based on active filter
  const filteredTasks = useMemo(() => {
    if (!activeMilestone) return []
    
    const operatorName = 'operator' // This would come from user context in a real app
    
    return activeMilestone.subtasks.filter(task => {
      if (activeFilter === 'all') return true
      if (activeFilter === 'my_tasks') return task.assignee === operatorName
      if (activeFilter === 'agent_tasks') return task.assignee && task.assignee !== operatorName
      if (activeFilter === 'blocked') return task.status === 'blocked'
      return true
    })
  }, [activeMilestone, activeFilter])

  // Count tasks for each filter
  const taskCounts = useMemo(() => {
    if (!activeMilestone) return { all: 0, my_tasks: 0, agent_tasks: 0, blocked: 0 }
    
    const operatorName = 'operator'
    return {
      all: activeMilestone.subtasks.length,
      my_tasks: activeMilestone.subtasks.filter(t => t.assignee === operatorName).length,
      agent_tasks: activeMilestone.subtasks.filter(t => t.assignee && t.assignee !== operatorName).length,
      blocked: activeMilestone.subtasks.filter(t => t.status === 'blocked').length
    }
  }, [activeMilestone])

  // Group tasks by status for columns
  const columns = useMemo(() => [
    { id: 'todo', label: 'TO DO', color: '#9B9BAA', tasks: filteredTasks.filter(t => t.status === 'todo') },
    { id: 'in_progress', label: 'IN PROGRESS', color: '#585CF0', tasks: filteredTasks.filter(t => t.status === 'in_progress') },
    { id: 'review', label: 'REVIEW', color: '#f59e0b', tasks: filteredTasks.filter(t => t.status === 'review') },
    { id: 'done', label: 'DONE', color: '#22c55e', tasks: filteredTasks.filter(t => t.status === 'done') },
    { id: 'blocked', label: 'BLOCKED', color: '#ef4444', tasks: filteredTasks.filter(t => t.status === 'blocked') }
  ], [filteredTasks])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || !activeMilestone || active.id === over.id) return
    
    const taskId = active.id.toString()
    const sourceColumnId = active.data.current?.columnId || findColumnIdForTask(taskId)
    const targetColumnId = over.id.toString()
    
    if (sourceColumnId === targetColumnId) return
    
    // Update task status
    updateTracker(draft => {
      const task = draft.milestones
        .find(m => m.id === activeMilestone.id)
        ?.subtasks.find(t => t.id === taskId)
      
      if (task) {
        task.status = targetColumnId as any
        
        // Side effects based on target column
        if (targetColumnId === 'done') {
          task.completed_at = new Date().toISOString()
          task.completed_by = 'operator'
          task.blocked_by = null
          task.blocked_reason = null
        } else if (targetColumnId === 'blocked') {
          task.blocked_by = 'manual'
        } else if (sourceColumnId === 'blocked') {
          // Moving from blocked to other column
          task.blocked_by = null
          task.blocked_reason = null
        }
      }
    })
  }

  const findColumnIdForTask = (taskId: string): string | undefined => {
    for (const column of columns) {
      if (column.tasks.some(t => t.id === taskId)) {
        return column.id
      }
    }
    return undefined
  }

  const handleTaskClick = (task: Subtask) => {
    setSelectedTask(task)
    setSelectedMilestone(activeMilestone)
  }

  const handleTaskSave = (updatedTask: Subtask) => {
    if (!activeMilestone) return
    
    updateTracker(draft => {
      const taskIndex = draft.milestones
        .find(m => m.id === activeMilestone.id)
        ?.subtasks.findIndex(t => t.id === updatedTask.id)
      
      if (taskIndex !== undefined && taskIndex !== -1) {
        draft.milestones
          .find(m => m.id === activeMilestone.id)
          ?.subtasks.splice(taskIndex, 1, updatedTask)
      }
    })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Context Bar */}
      <ContextBar
        milestones={tracker.milestones}
        activeMilestoneIndex={activeMilestoneIndex}
        onMilestoneChange={setActiveMilestoneIndex}
      />

      {/* Filter Bar */}
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        taskCounts={taskCounts}
        operatorName="operator"
      />

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto p-4">
        {activeMilestone ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 h-full">
              {columns.map(column => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  subtasks={column.tasks}
                  domain={activeMilestone.domain}
                  onCardClick={handleTaskClick}
                />
              ))}
            </div>
          </DndContext>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-muted text-sm">Select a milestone to view tasks</span>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && selectedMilestone && (
        <TaskDetailModal
          subtask={selectedTask}
          milestone={selectedMilestone}
          onClose={() => setSelectedTask(null)}
          onSave={handleTaskSave}
        />
      )}
    </div>
  )
}
