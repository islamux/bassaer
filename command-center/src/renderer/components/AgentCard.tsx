import React, { useState } from 'react'
import { Agent } from '../store'
import { ChevronDown, ChevronRight, Copy, Check, Info } from 'lucide-react'

export interface AgentCardProps {
  agent: Agent
  subAgents?: Agent[]
  isExpanded?: boolean
  onToggle?: () => void
  isOrchestrator?: boolean
}

export function AgentCard({ agent, subAgents = [], isExpanded = false, onToggle, isOrchestrator = false }: AgentCardProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const isActive = agent.last_action_at != null &&
                   (Date.now() - new Date(agent.last_action_at).getTime()) < 30 * 60 * 1000

  const timeSinceLastAction = agent.last_action_at ? (
    Math.floor((Date.now() - new Date(agent.last_action_at).getTime()) / (1000 * 60))
  ) : null

  const getTimeLabel = () => {
    if (!timeSinceLastAction) return 'Never'
    if (timeSinceLastAction < 60) return `${timeSinceLastAction}m ago`
    const hours = Math.floor(timeSinceLastAction / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="mb-2">
      {/* Main Agent Card */}
      <div className={`p-3 rounded border border-border ${isOrchestrator ? 'bg-surface-highlight' : ''}`}>
        <div className="flex items-start gap-2">
          {/* Toggle for orchestrator */}
          {isOrchestrator && onToggle && (
            <button
              onClick={onToggle}
              className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-muted hover:text-primary-text"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}

          {/* Color dot */}
          {!isOrchestrator && (
            <div className="w-5 h-5 flex-shrink-0"></div>
          )}

          <div className="w-2 h-2 mt-2 rounded-full flex-shrink-0" style={{ backgroundColor: agent.color }} />

          <div className="flex-1 min-w-0">
            {/* Agent name and status */}
            <div className="flex items-center gap-2">
              <span className={`font-medium text-sm ${isOrchestrator ? 'text-primary-text' : 'text-muted'}`}>
                {agent.name}
              </span>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                isActive ? 'bg-on-track/20 text-on-track' : 'bg-muted/20 text-muted'
              }`}>
                {isActive ? 'ACTIVE' : 'IDLE'}
              </span>
              {timeSinceLastAction !== null && (
                <span className="text-xs text-muted/80">
                  {getTimeLabel()}
                </span>
              )}
            </div>

            {/* Permissions */}
            <div className="flex gap-1 mt-1 flex-wrap">
              {agent.permissions.map(permission => (
                <span key={permission} className="text-[10px] bg-muted/20 px-1.5 py-0.5 rounded">
                  [{permission}]
                </span>
              ))}
            </div>

            {/* Session stats */}
            <div className="text-xs text-muted/80 mt-1">
              {agent.session_action_count} actions in this session
            </div>
          </div>
        </div>
      </div>

      {/* Sub-agents (if expanded) */}
      {isExpanded && subAgents.length > 0 && (
        <div className="ml-6 mt-2 space-y-2">
          {subAgents.map(subAgent => (
            <AgentCard
              key={subAgent.id}
              agent={subAgent}
              isOrchestrator={false}
            />
          ))}
        </div>
      )}

      {/* Connect New Agent Info */}
      {isOrchestrator && isExpanded && (
        <div className="mt-3 p-2 bg-surface-highlight rounded text-xs text-muted/80 relative">
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="flex items-center gap-1 hover:text-primary-text"
          >
            <Info size={12} />
            <span>Connect New Agent</span>
          </button>
          {showTooltip && (
            <div className="absolute left-0 mt-2 p-2 bg-surface border border-border rounded text-xs z-10 max-w-[280px]">
              Agents register via the MCP <code>register_agent</code> tool.
              Run: <code>command-center-mcp register_agent --name "AgentName" --type sub-agent</code>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
