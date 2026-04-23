import React, { useState, useMemo } from 'react'
import { useStore, type Subtask } from '../store'
import { TaskChip } from '../components/TaskChip'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

export function CalendarView() {
  const tracker = useStore(s => s.tracker)
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)

  if (!tracker) {
    return (
      <div className="flex items-center justify-center h-full text-muted text-sm">
        No tracker data available
      </div>
    )
  }

  // Calculate all weeks from start to target date
  const weeks = useMemo(() => {
    const startDate = new Date(tracker.project.start_date)
    const targetDate = new Date(tracker.project.target_date)
    const weeks: { start: Date; end: Date; days: Date[] }[] = []

    let current = new Date(startDate)
    
    // Find the first Monday on or before start date
    while (current.getDay() !== 1) {
      current.setDate(current.getDate() - 1)
    }

    while (current <= targetDate) {
      const weekStart = new Date(current)
      const weekEnd = new Date(current)
      weekEnd.setDate(weekStart.getDate() + 6)

      const days = []
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart)
        day.setDate(weekStart.getDate() + i)
        days.push(day)
      }

      weeks.push({ start: weekStart, end: weekEnd, days })
      current.setDate(weekStart.getDate() + 7)
    }

    return weeks
  }, [tracker.project.start_date, tracker.project.target_date])

  const currentWeek = weeks[currentWeekIndex]
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find completed tasks for this week
  const completedTasksByDay = useMemo(() => {
    const tasks: Record<number, { subtask: Subtask; domain: string }[]> = {}
    
    tracker.milestones.forEach(milestone => {
      milestone.subtasks.forEach(subtask => {
        if (subtask.status === 'done' && subtask.completed_at) {
          const completedDate = new Date(subtask.completed_at)
          completedDate.setHours(0, 0, 0, 0)
          
          // Check if this date is in the current week
          const dayIndex = currentWeek.days.findIndex(day => 
            day.toDateString() === completedDate.toDateString()
          )
          
          if (dayIndex !== -1) {
            if (!tasks[dayIndex]) {
              tasks[dayIndex] = []
            }
            tasks[dayIndex].push({ subtask, domain: milestone.domain })
          }
        }
      })
    })
    
    return tasks
  }, [tracker.milestones, currentWeek])

  const totalCompleted = Object.values(completedTasksByDay).reduce(
    (sum, tasks) => sum + tasks.length, 0
  )

  const goToPreviousWeek = () => {
    setCurrentWeekIndex(prev => Math.max(0, prev - 1))
  }

  const goToNextWeek = () => {
    setCurrentWeekIndex(prev => Math.min(weeks.length - 1, prev + 1))
  }

  const goToToday = () => {
    // Find which week contains today
    const todayWeekIndex = weeks.findIndex(week => 
      week.start <= today && week.end >= today
    )
    
    if (todayWeekIndex !== -1) {
      setCurrentWeekIndex(todayWeekIndex)
    }
  }

  const formatDateRange = () => {
    const startMonth = currentWeek.start.toLocaleString('default', { month: 'short' })
    const startDay = currentWeek.start.getDate()
    const endMonth = currentWeek.end.toLocaleString('default', { month: 'short' })
    const endDay = currentWeek.end.getDate()
    const year = currentWeek.start.getFullYear()
    
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`
  }

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Navigation Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousWeek}
            disabled={currentWeekIndex === 0}
            className="flex items-center gap-1 text-sm text-muted hover:text-primary-text disabled:opacity-30"
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          <button
            onClick={goToToday}
            className="flex items-center gap-1 text-sm text-muted hover:text-primary-text"
          >
            <Calendar size={16} />
            <span>Today</span>
          </button>

          <button
            onClick={goToNextWeek}
            disabled={currentWeekIndex === weeks.length - 1}
            className="flex items-center gap-1 text-sm text-muted hover:text-primary-text disabled:opacity-30"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="text-sm font-medium">
          Week {currentWeekIndex + 1} · {formatDateRange()} · {totalCompleted} completed
        </div>

        <div className="w-24"></div> {/* Spacer for balance */}
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-7 gap-2 h-full">
          {currentWeek.days.map((day, dayIndex) => {
            const isToday = day.toDateString() === today.toDateString()
            const dayTasks = completedTasksByDay[dayIndex] || []
            const isFirstOfMonth = day.getDate() === 1

            return (
              <div key={dayIndex} className="flex flex-col h-full min-h-[120px]">
                {/* Day Header */}
                <div className="flex flex-col items-center p-1 mb-1">
                  <div className="text-xs font-medium text-muted/80">{dayNames[dayIndex]}</div>
                  <div className={`text-sm font-medium ${
                    isFirstOfMonth ? 'text-accent' : 'text-primary-text'
                  }`}>
                    {day.getDate()}
                  </div>
                  {isFirstOfMonth && (
                    <div className="text-[10px] text-muted/60">
                      {day.toLocaleString('default', { month: 'short' })}
                    </div>
                  )}
                </div>

                {/* Today Indicator */}
                {isToday && (
                  <div className="w-full h-0.5 bg-accent mb-1" />
                )}

                {/* Tasks */}
                <div className="flex-1 overflow-y-auto space-y-1 p-1">
                  {dayTasks.length > 0 ? (
                    dayTasks.map(({ subtask, domain }) => (
                      <TaskChip
                        key={subtask.id}
                        subtask={subtask}
                        domain={domain}
                      />
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-4 h-4 border border-border/30 rounded"></div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {totalCompleted === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted/60 text-sm">
              Completed tasks will appear here as work is finished
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
