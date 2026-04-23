import React, { useEffect, useRef, useState } from 'react'
import { MilestoneNode } from '../components/MilestoneNode'
import { MilestoneDetailPanel } from '../components/MilestoneDetailPanel'
import { useStore, selectCurrentWeekFractional, selectDomains, getDomainColor, type Milestone } from '../store'

// Constants
const WEEK_W = 100
const LANE_H = 200
const LABEL_W = 140
const HEADER_H = 44
const NODE_R = 20
const KEY_NODE_R = 26
const PANEL_W = 480

export function SwimLaneView() {
  const tracker = useStore(s => s.tracker)
  const selectedMilestoneId = useStore(s => s.selectedMilestoneId)
  const setSelectedMilestoneId = useStore(s => s.setSelectedMilestoneId)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        setContainerWidth(entries[0].contentRect.width)
      })
      observer.observe(containerRef.current)
      return () => observer.disconnect()
    }
  }, [])

  useEffect(() => {
    // Auto-scroll to NOW marker on initial load
    if (containerRef.current && tracker) {
      const currentWeek = selectCurrentWeekFractional(tracker)
      const scrollPosition = (currentWeek - 1) * WEEK_W + LABEL_W - containerWidth / 2
      containerRef.current.scrollLeft = Math.max(0, scrollPosition)
    }
  }, [tracker, containerWidth])

  if (!tracker) {
    return (
      <div className="flex items-center justify-center h-full text-muted text-sm">
        No tracker data available
      </div>
    )
  }

  const totalWeeks = Math.ceil(
    (new Date(tracker.project.target_date).getTime() - new Date(tracker.project.start_date).getTime())
    / (1000 * 60 * 60 * 24 * 7)
  )

  const currentWeekFractional = selectCurrentWeekFractional(tracker)
  const domains = selectDomains(tracker)
  const startDate = new Date(tracker.project.start_date)

  const selectedMilestone = tracker.milestones.find(m => m.id === selectedMilestoneId)

  // Group milestones by domain
  const milestonesByDomain = new Map<string, Milestone[]>()
  tracker.milestones.forEach(milestone => {
    if (!milestonesByDomain.has(milestone.domain)) {
      milestonesByDomain.set(milestone.domain, [])
    }
    milestonesByDomain.get(milestone.domain)?.push(milestone)
  })

  // Calculate total height
  const totalHeight = HEADER_H + domains.length * LANE_H

  return (
    <div className="flex-1 overflow-hidden relative">
      {/* Main SVG container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        <svg
          width={LABEL_W + totalWeeks * WEEK_W}
          height={totalHeight}
          viewBox={`0 0 ${LABEL_W + totalWeeks * WEEK_W} ${totalHeight}`}
          className="bg-dark"
        >
          {/* Phase Background Bands */}
          {tracker.schedule.phases.map(phase => {
            const x = (phase.start_week - 1) * WEEK_W + LABEL_W
            const width = (phase.end_week - phase.start_week + 1) * WEEK_W
            return (
              <rect
                key={phase.id}
                x={x}
                y={HEADER_H}
                width={width}
                height={domains.length * LANE_H}
                fill="rgba(100, 100, 255, 0.05)"
                opacity={0.5}
              />
            )
          })}

          {/* Week Grid Lines */}
          {Array.from({ length: totalWeeks + 1 }).map((_, i) => (
            <line
              key={`grid-${i}`}
              x1={LABEL_W + i * WEEK_W}
              y1={HEADER_H}
              x2={LABEL_W + i * WEEK_W}
              y2={totalHeight}
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="1"
            />
          ))}

          {/* Week Headers */}
          {Array.from({ length: totalWeeks }).map((_, i) => {
            const weekStart = new Date(startDate)
            weekStart.setDate(startDate.getDate() + i * 7)
            const monthDay = (weekStart.getMonth() + 1).toString().padStart(2, '0') + '-' +
                            weekStart.getDate().toString().padStart(2, '0')

            return (
              <g key={`header-${i}`}>
                <text
                  x={LABEL_W + i * WEEK_W + WEEK_W / 2}
                  y={20}
                  fontFamily="JetBrains Mono"
                  fontSize="10"
                  fill="rgba(255, 255, 255, 0.6)"
                  textAnchor="middle"
                >
                  W{i + 1}
                </text>
                <text
                  x={LABEL_W + i * WEEK_W + WEEK_W / 2}
                  y={36}
                  fontFamily="JetBrains Mono"
                  fontSize="10"
                  fill="rgba(255, 255, 255, 0.4)"
                  textAnchor="middle"
                >
                  {monthDay}
                </text>
              </g>
            )
          })}

          {/* NOW Marker */}
          <line
            x1={LABEL_W + (currentWeekFractional - 1) * WEEK_W}
            y1={HEADER_H}
            x2={LABEL_W + (currentWeekFractional - 1) * WEEK_W}
            y2={totalHeight}
            stroke="#8286FF"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <text
            x={LABEL_W + (currentWeekFractional - 1) * WEEK_W + 4}
            y={16}
            fontFamily="JetBrains Mono"
            fontSize="10"
            fill="#8286FF"
            textAnchor="start"
          >
            NOW
          </text>

          {/* Swim Lanes */}
          {domains.map((domain, domainIndex) => {
            const y = HEADER_H + domainIndex * LANE_H + LANE_H / 2
            const milestones = milestonesByDomain.get(domain) || []

            return (
              <g key={domain}>
                {/* Domain Label */}
                <rect
                  x={0}
                  y={HEADER_H + domainIndex * LANE_H}
                  width={LABEL_W}
                  height={LANE_H}
                  fill={getDomainColor(domain)}
                  opacity={0.15}
                />
                <text
                  x={LABEL_W / 2}
                  y={y}
                  fontFamily="Inter"
                  fontSize="11"
                  fill="rgba(255, 255, 255, 0.8)"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(-90, ${LABEL_W / 2}, ${y})`}
                >
                  {domain}
                </text>

                {/* Milestone Nodes */}
                {milestones.map((milestone, milestoneIndex) => {
                  const x = LABEL_W + (milestone.week - 1) * WEEK_W
                  const verticalOffset = (milestoneIndex - (milestones.length - 1) / 2) * 56

                  return (
                    <MilestoneNode
                      key={milestone.id}
                      milestone={milestone}
                      x={x}
                      y={y + verticalOffset}
                      isSelected={selectedMilestoneId === milestone.id}
                      onClick={() => setSelectedMilestoneId(milestone.id)}
                    />
                  )
                })}

                {/* Connection Lines */}
                {milestones.length > 1 && milestones.sort((a, b) => a.week - b.week).map((milestone, index) => {
                  if (index < milestones.length - 1) {
                    const nextMilestone = milestones[index + 1]
                    const x1 = LABEL_W + (milestone.week - 1) * WEEK_W + NODE_R
                    const x2 = LABEL_W + (nextMilestone.week - 1) * WEEK_W - NODE_R
                    const y1 = y + (index - (milestones.length - 1) / 2) * 56
                    const y2 = y + (index + 1 - (milestones.length - 1) / 2) * 56

                    return (
                      <line
                        key={`conn-${milestone.id}-${nextMilestone.id}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={getDomainColor(domain)}
                        strokeWidth="1.5"
                        strokeOpacity={0.4}
                        strokeDasharray="3 3"
                      />
                    )
                  }
                  return null
                })}
              </g>
            )
          })}

          {/* Major Milestone Markers */}
          {tracker.milestones
            .filter(m => m.is_key_milestone)
            .map(milestone => {
            const x = LABEL_W + (milestone.week - 1) * WEEK_W
            const y = totalHeight - 20

            return (
              <g key={`marker-${milestone.id}`}>
                {/* Dashed vertical line */}
                <line
                  x1={x}
                  y1={HEADER_H}
                  x2={x}
                  y2={y - 10}
                  stroke={getDomainColor(milestone.domain)}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity={0.3}
                />
                {/* Diamond marker */}
                <path
                  d={`M${x} ${y} L${x + 8} ${y - 8} L${x} ${y - 16} L${x - 8} ${y - 8} Z`}
                  fill={getDomainColor(milestone.domain)}
                  opacity={0.8}
                />
                <text
                  x={x}
                  y={y + 20}
                  fontFamily="JetBrains Mono"
                  fontSize="10"
                  fill={getDomainColor(milestone.domain)}
                  textAnchor="middle"
                >
                  {milestone.key_milestone_label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Detail Panel */}
      {selectedMilestone && (
        <MilestoneDetailPanel
          milestone={selectedMilestone}
          onClose={() => setSelectedMilestoneId(null)}
        />
      )}

      {/* Empty State */}
      {tracker.milestones.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-muted text-sm">
            Milestones will appear here after hydration
          </div>
        </div>
      )}
    </div>
  )
}
