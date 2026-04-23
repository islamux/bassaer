import React, { useState, useMemo } from 'react'
import { AgentLogEntry, useStore, type Agent } from '../store'
import { Search, ChevronDown } from 'lucide-react'

export interface ActivityFeedProps {
  entries: AgentLogEntry[]
  agents: Agent[]
}

export function ActivityFeed({ entries, agents }: ActivityFeedProps) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [visibleCount, setVisibleCount] = useState(30)

  // Create filter options
  const filterOptions = useMemo(() => {
    const options: Array<{ id: string; label: string; color?: string }> = [{ id: 'all', label: 'All' }]
    
    // Add agent filters
    agents.forEach(agent => {
      options.push({ id: agent.id, label: agent.name, color: agent.color })
    })
    
    // Add special filters
    options.push({ id: 'manual', label: 'Manual' })
    options.push({ id: 'system', label: 'System' })
    
    return options
  }, [agents])

  // Filter and search entries
  const filteredEntries = useMemo(() => {
    let result = [...entries]
    
    // Filter by agent/type
    if (activeFilter !== 'all') {
      if (activeFilter === 'manual') {
        result = result.filter(entry => entry.agent_id === 'operator')
      } else if (activeFilter === 'system') {
        result = result.filter(entry => entry.tags.includes('MCP') || entry.tags.includes('SYSTEM'))
      } else {
        result = result.filter(entry => entry.agent_id === activeFilter)
      }
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(entry => 
        entry.description.toLowerCase().includes(searchLower) ||
        entry.target_id.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort by timestamp descending
    return result.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [entries, activeFilter, searchTerm])

  // Group entries by day
  const groupedEntries = useMemo(() => {
    const groups: Record<string, AgentLogEntry[]> = {}
    
    filteredEntries.slice(0, visibleCount).forEach(entry => {
      const date = new Date(entry.timestamp)
      const today = new Date()
      let dayKey = ''
      
      // Check if same day
      if (date.toDateString() === today.toDateString()) {
        dayKey = 'TODAY'
      } else {
        // Check if yesterday
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        if (date.toDateString() === yesterday.toDateString()) {
          dayKey = 'YESTERDAY'
        } else {
          // Format as MON APR 14
          dayKey = date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }).toUpperCase()
        }
      }
      
      if (!groups[dayKey]) {
        groups[dayKey] = []
      }
      groups[dayKey].push(entry)
    })
    
    return groups
  }, [filteredEntries, visibleCount])

  // Tag pill styles
  const getTagStyle = (tag: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      WRITE: { bg: 'bg-green-500/10', text: 'text-green-500' },
      COMMIT: { bg: 'bg-accent/10', text: 'text-accent' },
      START: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
      ALERT: { bg: 'bg-red-500/10', text: 'text-red-500' },
      NOTE: { bg: 'bg-muted/10', text: 'text-muted' },
      MCP: { bg: 'bg-accent/10', text: 'text-accent' }
    }
    
    return styles[tag] || { bg: 'bg-muted/10', text: 'text-muted' }
  }

  // Find agent by ID
  const getAgent = (agentId: string) => {
    return agents.find(a => a.id === agentId)
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Filter Tabs */}
      <div className="flex gap-1 p-2 border-b border-border overflow-x-auto">
        {filterOptions.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-2 py-1 text-xs rounded flex items-center gap-1 whitespace-nowrap ${
              activeFilter === filter.id
                ? 'bg-surface-highlight text-primary-text'
                : 'text-muted hover:text-primary-text'
            }`}
          >
            {filter.id !== 'all' && filter.id !== 'manual' && filter.id !== 'system' && 'color' in filter && (
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: filter.color }} />
            )}
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-2 border-b border-border">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-surface border border-border rounded pl-8"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        </div>
      </div>

      {/* Feed Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(groupedEntries).length > 0 ? (
          Object.entries(groupedEntries).map(([dayKey, dayEntries]) => (
            <div key={dayKey} className="mb-4">
              {/* Day Header */}
              <div className="sticky top-0 bg-surface z-10">
                <h4 className="text-xs font-medium text-muted/80 mb-2 border-b border-border pb-1">
                  {dayKey}
                </h4>
              </div>

              {/* Entries */}
              {dayEntries.map(entry => {
                const agent = getAgent(entry.agent_id)
                return (
                  <div key={entry.id} className="p-2 rounded hover:bg-surface-highlight transition-colors">
                    <div className="flex items-start gap-2">
                      {/* Agent dot */}
                      {agent && (
                        <div className="w-2 h-2 mt-1 rounded-full flex-shrink-0" style={{ backgroundColor: agent.color }} />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {/* Agent name */}
                          <span className={`text-xs font-medium ${
                            agent ? 'text-primary-text' : 'text-muted'
                          }`}>
                            {entry.agent_id}
                          </span>

                          {/* Description */}
                          <span className="text-xs text-primary-text truncate">
                            {entry.description}
                          </span>

                          {/* Target ID */}
                          <span className="text-xs text-muted/80 font-mono">
                            {entry.target_id}
                          </span>
                        </div>

                        {/* Tags */}
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {entry.tags.map(tag => {
                            const style = getTagStyle(tag)
                            return (
                              <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                                [{tag}]
                              </span>
                            )
                          })}
                        </div>
                      </div>

                      {/* Timestamp */}
                      <span className="text-xs text-muted/60 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted">
              <div className="w-12 h-12 mx-auto mb-2 border border-border rounded-full flex items-center justify-center">
                <span className="text-lg">📝</span>
              </div>
              <p className="text-sm">No activity recorded yet</p>
            </div>
          </div>
        )}

        {/* Load More */}
        {visibleCount < filteredEntries.length && (
          <div className="p-2 border-t border-border">
            <button
              onClick={() => setVisibleCount(prev => prev + 30)}
              className="w-full py-2 text-sm text-muted hover:text-primary-text transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Agent Performance Stats */}
      {entries.length > 0 && (
        <div className="p-4 border-t border-border">
          <h4 className="text-sm font-medium text-muted mb-3">AGENT PERFORMANCE (THIS WEEK)</h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {agents.map(agent => {
              const weeklyActions = entries.filter(entry => 
                entry.agent_id === agent.id &&
                isThisWeek(new Date(entry.timestamp))
              ).length

              if (weeklyActions === 0) return null

              return (
                <div key={agent.id} className="flex-shrink-0 w-32 p-3 bg-surface-highlight rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }} />
                    <span className="text-xs font-medium truncate">{agent.name}</span>
                  </div>
                  <div className="text-lg font-bold">{weeklyActions}</div>
                  <div className="text-xs text-muted/80">actions</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function isThisWeek(date: Date): boolean {
  const today = new Date()
  const firstDayOfWeek = new Date(today)
  firstDayOfWeek.setDate(today.getDate() - today.getDay())
  
  const lastDayOfWeek = new Date(firstDayOfWeek)
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6)
  
  return date >= firstDayOfWeek && date <= lastDayOfWeek
}
