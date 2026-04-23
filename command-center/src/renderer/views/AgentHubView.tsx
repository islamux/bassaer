import React, { useState, useMemo } from 'react'
import { useStore, type Agent } from '../store'
import { AgentCard } from '../components/AgentCard'
import { ActivityFeed } from '../components/ActivityFeed'
import { SharedStateInfo } from '../components/SharedStateInfo'
import { ContextInjection } from '../components/ContextInjection'
import { TodaysSummary } from '../components/TodaysSummary'

export function AgentHubView() {
  const tracker = useStore(s => s.tracker)
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({})

  if (!tracker) {
    return (
      <div className="flex items-center justify-center h-full text-muted text-sm">
        No tracker data available
      </div>
    )
  }

  // Group agents hierarchically
  const { orchestrators, standaloneAgents } = useMemo(() => {
    const orchs: Agent[] = []
    const standalones: Agent[] = []
    
    tracker.agents.forEach(agent => {
      if (agent.type === 'orchestrator') {
        orchs.push(agent)
      } else if (!agent.parent_id) {
        standalones.push(agent)
      }
    })
    
    return { orchestrators: orchs, standaloneAgents: standalones }
  }, [tracker.agents])

  const getSubAgents = (parentId: string) => {
    return tracker.agents.filter(agent => agent.parent_id === parentId)
  }

  const toggleAgentExpanded = (agentId: string) => {
    setExpandedAgents(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }))
  }

  return (
    <div className="flex-1 overflow-hidden flex">
      {/* Left Column - Fixed Width */}
      <div className="w-[340px] flex-shrink-0 overflow-y-auto p-4 border-r border-border">
        <div className="space-y-6">
          {/* Connected Agents */}
          <div>
            <h3 className="text-sm font-medium text-muted mb-3">CONNECTED AGENTS</h3>
            
            {tracker.agents.length === 0 ? (
              <div className="p-4 bg-surface-highlight rounded text-xs text-muted/80">
                No agents registered yet. Agents register via the MCP register_agent tool.
              </div>
            ) : (
              <div className="space-y-2">
                {/* Orchestrators */}
                {orchestrators.map(agent => {
                  const subAgents = getSubAgents(agent.id)
                  return (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      subAgents={subAgents}
                      isExpanded={expandedAgents[agent.id] || false}
                      onToggle={() => toggleAgentExpanded(agent.id)}
                      isOrchestrator={true}
                    />
                  )
                })}

                {/* Standalone Agents */}
                {standaloneAgents.map(agent => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isOrchestrator={false}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Shared State File Info */}
          <SharedStateInfo />

          {/* Context Injection */}
          <ContextInjection />

          {/* Today's Summary */}
          <TodaysSummary />
        </div>
      </div>

      {/* Right Column - Flexible */}
      <div className="flex-1 overflow-hidden">
        <ActivityFeed
          entries={tracker.agent_log}
          agents={tracker.agents}
        />
      </div>
    </div>
  )
}
