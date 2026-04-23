import React, { useEffect } from 'react'
import { useStore, initExternalListener, selectCurrentWeek, selectCurrentPhase, selectScheduleStatus, selectOverallProgress, selectTotalTasks, type TabId } from './store'
import { SwimLaneView } from './views/SwimLaneView'
import { TaskBoardView } from './views/TaskBoardView'
import { AgentHubView } from './views/AgentHubView'
import { CalendarView } from './views/CalendarView'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'swim-lane', label: 'Swim Lane', icon: '⬡' },
  { id: 'task-board', label: 'Task Board', icon: '⊞' },
  { id: 'agent-hub', label: 'Agent Hub', icon: '⚡' },
  { id: 'calendar', label: 'Calendar', icon: '▭' },
]

function TabBar() {
  const activeTab = useStore(s => s.activeTab)
  const setActiveTab = useStore(s => s.setActiveTab)
  const agentLog = useStore(s => s.tracker?.agent_log ?? [])

  const hasRecentActivity = agentLog.some(e => {
    const ts = new Date(e.timestamp).getTime()
    return Date.now() - ts < 30 * 60 * 1000
  })

  return (
    <div className="flex items-center gap-1 px-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors relative ${
            activeTab === tab.id
              ? 'bg-accent text-white'
              : 'text-muted hover:text-primary-text hover:bg-surface'
          }`}
        >
          <span className="mr-1.5">{tab.icon}</span>
          {tab.label}
          {tab.id === 'agent-hub' && hasRecentActivity && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-on-track rounded-full animate-pulse" />
          )}
        </button>
      ))}
    </div>
  )
}

function StatusBar() {
  const tracker = useStore(s => s.tracker)
  const synced = useStore(s => s.synced)
  const theme = useStore(s => s.theme)
  const toggleTheme = useStore(s => s.toggleTheme)

  const week = selectCurrentWeek(tracker)
  const phase = selectCurrentPhase(tracker)
  const status = selectScheduleStatus(tracker)
  const progress = selectOverallProgress(tracker)
  const tasks = selectTotalTasks(tracker)

  const statusColors: Record<string, string> = {
    on_track: 'text-on-track bg-on-track/10',
    behind: 'text-behind bg-behind/10',
    ahead: 'text-on-track bg-on-track/10',
  }
  const statusLabels: Record<string, string> = {
    on_track: 'ON TRACK',
    behind: 'BEHIND',
    ahead: 'AHEAD',
  }

  return (
    <div className="flex items-center gap-4 text-xs" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
      <span className="text-muted font-mono">
        WEEK {week}{phase ? ` · ${phase}` : ''}
      </span>
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 rounded-full bg-progress-track">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <span className="font-mono text-muted">
          {tasks.done}/{tasks.total} ({Math.round(progress * 100)}%)
        </span>
      </div>
      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[status]}`}>
        {statusLabels[status]}
      </span>
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${synced ? 'bg-on-track' : 'bg-behind'}`} />
        <span className="text-muted">{synced ? 'Synced' : 'Offline'}</span>
      </div>
      <button
        onClick={toggleTheme}
        className="p-1 rounded hover:bg-surface text-muted hover:text-primary-text transition-colors"
      >
        {theme === 'dark' ? '☀' : '☾'}
      </button>
    </div>
  )
}

function LoadingView() {
  return (
    <div className="flex items-center justify-center h-screen bg-dark text-primary-text">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4" />
        <p className="text-muted text-sm">Loading tracker...</p>
      </div>
    </div>
  )
}

function ErrorView({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center h-screen bg-dark text-behind">
      <div className="text-center">
        <p className="text-sm">Error: {error}</p>
        <p className="text-muted text-xs mt-2">Check that project-tracker.json exists at the project root</p>
      </div>
    </div>
  )
}

function ActiveView({ tab }: { tab: TabId }) {
  return (
    <div className="flex-1 overflow-auto">
      {tab === 'swim-lane' && <SwimLaneView />}
      {tab === 'task-board' && <TaskBoardView />}
      {tab === 'agent-hub' && <AgentHubView />}
      {tab === 'calendar' && <CalendarView />}
    </div>
  )
}

export default function App() {
  const tracker = useStore(s => s.tracker)
  const loading = useStore(s => s.loading)
  const error = useStore(s => s.error)
  const activeTab = useStore(s => s.activeTab)
  const theme = useStore(s => s.theme)
  const setTracker = useStore(s => s.setTracker)
  const setLoading = useStore(s => s.setLoading)
  const setError = useStore(s => s.setError)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    async function loadTracker() {
      try {
        const json = await window.api.tracker.read()
        if (json) {
          setTracker(JSON.parse(json))
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadTracker()
    const unsubscribe = initExternalListener()
    return unsubscribe
  }, [])

  if (loading) return <LoadingView />
  if (error) return <ErrorView error={error} />

  return (
    <div className="h-screen bg-dark text-primary-text flex flex-col">
      <div className="h-3" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <TabBar />
        <StatusBar />
      </div>
      <ActiveView tab={activeTab} />
    </div>
  )
}
