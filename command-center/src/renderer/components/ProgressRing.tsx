import React from 'react'

export interface ProgressRingProps {
  radius: number
  progress: number
  color: string
  isKey?: boolean
  isSelected?: boolean
}

export function ProgressRing({ radius, progress, color, isKey = false, isSelected = false }: ProgressRingProps) {
  const strokeWidth = 2.5
  const innerRadius = radius - strokeWidth
  const circumference = 2 * Math.PI * innerRadius
  const strokeDashoffset = circumference - (progress / 100) * circumference
  const actualRadius = isKey ? radius + 3 : radius
  const glowColor = isKey ? `${color}30` : 'transparent'

  return (
    <g transform={`translate(0, 0)`}>
      {/* Background circle */}
      <circle
        r={actualRadius}
        fill="rgba(17, 17, 24, 0.95)"
        stroke="rgba(255, 255, 255, 0.06)"
        strokeWidth="1"
      />

      {/* Progress arc */}
      <circle
        r={innerRadius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90)"
        strokeLinecap="round"
      />

      {/* Selection indicator */}
      {isSelected && (
        <circle
          r={actualRadius + 2}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity={0.7}
        />
      )}

      {/* Key milestone glow */}
      {isKey && (
        <circle
          r={actualRadius + 6}
          fill="none"
          stroke={glowColor}
          strokeWidth="8"
        />
      )}

      {/* Center text */}
      <text
        fontFamily="JetBrains Mono"
        fontSize="9"
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        dy="1"
      >
        {Math.round(progress)}%
      </text>
    </g>
  )
}
