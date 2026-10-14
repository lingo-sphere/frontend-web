'use client'

import React, { useState } from 'react'

export interface RadarDataPoint {
  axis: string
  key?: string
  value: number
  fullMark?: number
  description?: string
}

interface SkillRadarChartProps {
  data: RadarDataPoint[]
  title?: string
  subtitle?: string
  themeColor?: 'violet' | 'pink' | 'emerald' | 'blue' | 'amber'
  overallScore?: number
  className?: string
}

const THEME_CONFIG = {
  violet: {
    stroke: '#8b5cf6',
    fill: 'rgba(139, 92, 246, 0.25)',
    pointFill: '#7c3aed',
    ringStroke: 'rgba(139, 92, 246, 0.15)',
    accentText: 'text-violet-600 dark:text-violet-400',
    badgeBg: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  },
  pink: {
    stroke: '#ec4899',
    fill: 'rgba(236, 72, 153, 0.25)',
    pointFill: '#db2777',
    ringStroke: 'rgba(236, 72, 153, 0.15)',
    accentText: 'text-pink-600 dark:text-pink-400',
    badgeBg: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  },
  emerald: {
    stroke: '#10b981',
    fill: 'rgba(16, 185, 129, 0.25)',
    pointFill: '#059669',
    ringStroke: 'rgba(16, 185, 129, 0.15)',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  blue: {
    stroke: '#3b82f6',
    fill: 'rgba(59, 130, 246, 0.25)',
    pointFill: '#2563eb',
    ringStroke: 'rgba(59, 130, 246, 0.15)',
    accentText: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  amber: {
    stroke: '#f59e0b',
    fill: 'rgba(245, 158, 11, 0.25)',
    pointFill: '#d97706',
    ringStroke: 'rgba(245, 158, 11, 0.15)',
    accentText: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
}

export function SkillRadarChart({
  data,
  title,
  subtitle,
  themeColor = 'violet',
  overallScore,
  className = '',
}: SkillRadarChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<RadarDataPoint | null>(null)

  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-text-tertiary">
        Chưa có dữ liệu đánh giá chi tiết
      </div>
    )
  }

  const theme = THEME_CONFIG[themeColor] || THEME_CONFIG.violet
  const size = 320
  const center = size / 2
  const maxRadius = 110
  const totalAxes = data.length
  const angleStep = (2 * Math.PI) / totalAxes

  // Helper: compute coordinates on polygon
  const getCoordinates = (index: number, radiusRatio: number) => {
    // Start from top (-PI / 2) and rotate clockwise
    const angle = index * angleStep - Math.PI / 2
    const r = maxRadius * radiusRatio
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return { x, y, angle }
  }

  // 5 grid levels: 20%, 40%, 60%, 80%, 100%
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0]

  // Path string for data polygon
  const dataPoints = data.map((d, i) => {
    const fullMark = d.fullMark || 100
    const ratio = Math.min(Math.max((d.value || 0) / fullMark, 0.05), 1.0)
    return {
      ...getCoordinates(i, ratio),
      data: d,
    }
  })

  const polygonPath =
    dataPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ') + ' Z'

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Title & Overall Badge */}
      {(title || overallScore !== undefined) && (
        <div className="w-full flex items-center justify-between gap-2 mb-2 px-1">
          <div>
            {title && <h5 className="text-xs font-bold text-text-primary">{title}</h5>}
            {subtitle && <p className="text-[11px] text-text-tertiary">{subtitle}</p>}
          </div>
          {overallScore !== undefined && (
            <div className={`px-2.5 py-1 rounded-lg border text-xs font-black ${theme.badgeBg}`}>
              Tổng thể: {overallScore}/100
            </div>
          )}
        </div>
      )}

      {/* SVG Container */}
      <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full overflow-visible transition-all duration-300"
        >
          {/* Defs for gradient */}
          <defs>
            <radialGradient id={`radar-grad-${themeColor}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={theme.stroke} stopOpacity="0.45" />
              <stop offset="100%" stopColor={theme.stroke} stopOpacity="0.1" />
            </radialGradient>
          </defs>

          {/* Grid Polygons (Concentric rings) */}
          {levels.map((level, lvlIdx) => {
            const ringPath =
              data
                .map((_, i) => {
                  const pt = getCoordinates(i, level)
                  return `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`
                })
                .join(' ') + ' Z'
            return (
              <path
                key={lvlIdx}
                d={ringPath}
                fill="none"
                stroke="currentColor"
                strokeWidth={lvlIdx === levels.length - 1 ? '1.2' : '0.8'}
                strokeDasharray={lvlIdx < levels.length - 1 ? '3,3' : undefined}
                className="text-border/80"
              />
            )
          })}

          {/* Grid lines (Axes radiating from center) */}
          {data.map((_, i) => {
            const outer = getCoordinates(i, 1.0)
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border/60"
              />
            )
          })}

          {/* Level Labels on top axis (20, 40, 60, 80, 100) */}
          {levels.map((lvl) => {
            const y = center - maxRadius * lvl
            return (
              <text
                key={lvl}
                x={center + 4}
                y={y + 3}
                fontSize="8"
                fontWeight="600"
                className="fill-text-tertiary/70"
              >
                {lvl * 100}
              </text>
            )
          })}

          {/* Filled Data Polygon */}
          <path
            d={polygonPath}
            fill={`url(#radar-grad-${themeColor})`}
            stroke={theme.stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-all duration-500 ease-out"
          />

          {/* Data Points (Circles) */}
          {dataPoints.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.axis === pt.data.axis ? '6' : '4'}
              fill={theme.pointFill}
              stroke="#ffffff"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredPoint(pt.data)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* Axis Labels placed outside the outer perimeter */}
          {data.map((item, i) => {
            const labelCoord = getCoordinates(i, 1.25)
            const isHovered = hoveredPoint?.axis === item.axis
            const isRight = Math.cos(labelCoord.angle) > 0.3
            const isLeft = Math.cos(labelCoord.angle) < -0.3
            const textAnchor = isRight ? 'start' : isLeft ? 'end' : 'middle'

            return (
              <g
                key={i}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPoint(item)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <text
                  x={labelCoord.x}
                  y={labelCoord.y - 4}
                  textAnchor={textAnchor}
                  fontSize="10"
                  fontWeight={isHovered ? '800' : '600'}
                  className={`transition-colors ${
                    isHovered ? theme.accentText : 'fill-text-primary'
                  }`}
                >
                  {item.axis}
                </text>
                <text
                  x={labelCoord.x}
                  y={labelCoord.y + 8}
                  textAnchor={textAnchor}
                  fontSize="9.5"
                  fontWeight="700"
                  className={item.value > 0 ? theme.accentText : 'fill-text-tertiary'}
                >
                  {item.value > 0 ? `${item.value}/100` : '--'}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none z-10 px-3 py-1.5 rounded-xl bg-surface border border-border shadow-lg text-center backdrop-blur-md">
            <span className="text-[10px] text-text-tertiary block font-medium">
              {hoveredPoint.axis}
            </span>
            <span className={`text-xs font-black ${theme.accentText}`}>
              {hoveredPoint.value > 0 ? `${hoveredPoint.value} / 100 điểm` : 'Chưa có điểm'}
            </span>
          </div>
        )}
      </div>

      {/* Rubric Breakdown List (Below radar for easy reading) */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/50">
        {data.map((item, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-xl border transition-all ${
              hoveredPoint?.axis === item.axis
                ? 'bg-surface border-primary/40 shadow-xs'
                : 'bg-surface-subtle/30 border-border/40 hover:bg-surface-subtle/60'
            }`}
            onMouseEnter={() => setHoveredPoint(item)}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-text-secondary truncate">{item.axis}</span>
              <span className={`font-black ${item.value > 0 ? theme.accentText : 'text-text-tertiary'}`}>
                {item.value > 0 ? `${item.value}` : '--'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-subtle rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.value}%`,
                  backgroundColor: theme.pointFill,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
