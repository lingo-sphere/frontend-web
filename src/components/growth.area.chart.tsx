// Thành phần biểu đồ miền SVG trực quan hóa dữ liệu tăng trưởng năng lực theo thời gian
'use client'

import { useState, useId, useMemo } from 'react'

export interface GrowthChartDataPoint {
  label: string
  value: number
  date?: string
  tag?: string
  tooltipTitle?: string
  tooltipSubtitle?: string
  details?: Array<{ label: string; value: string | number }>
}

export interface GrowthAreaChartProps {
  data: GrowthChartDataPoint[]
  height?: number
  minVal?: number
  maxVal?: number
  targetValue?: number
  targetLabel?: string
  baselineValue?: number
  baselineLabel?: string
  colorTheme?: 'indigo' | 'emerald' | 'purple'
  valueSuffix?: string
  yAxisTicks?: number[]
  emptyMessage?: string
}

function getSmoothCurvePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

function getAreaPath(points: { x: number; y: number }[], bottomY: number): string {
  if (points.length === 0) return ''
  const curve = getSmoothCurvePath(points)
  const last = points[points.length - 1]
  const first = points[0]
  return `${curve} L ${last.x.toFixed(1)} ${bottomY} L ${first.x.toFixed(1)} ${bottomY} Z`
}

export function GrowthAreaChart({
  data,
  height = 280,
  minVal = 0,
  maxVal,
  targetValue,
  targetLabel,
  baselineValue,
  baselineLabel,
  colorTheme = 'indigo',
  valueSuffix = '',
  yAxisTicks,
  emptyMessage = 'Chưa có đủ dữ liệu để vẽ biểu đồ miền',
}: GrowthAreaChartProps) {
  const gradientId = useId()
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const computedMax = useMemo(() => {
    if (typeof maxVal === 'number' && maxVal > 0) return maxVal
    if (data.length === 0) return 100
    const highestData = Math.max(...data.map((d) => d.value), targetValue || 0, baselineValue || 0)
    return Math.max(10, Math.ceil((highestData * 1.15) / 50) * 50)
  }, [data, maxVal, targetValue, baselineValue])

  const computedMin = useMemo(() => {
    return Math.min(minVal, ...data.map((d) => d.value), baselineValue || 0)
  }, [data, minVal, baselineValue])

  const ticks = useMemo(() => {
    if (yAxisTicks && yAxisTicks.length > 0) return yAxisTicks
    const step = (computedMax - computedMin) / 4
    return [
      computedMin,
      Math.round(computedMin + step),
      Math.round(computedMin + step * 2),
      Math.round(computedMin + step * 3),
      computedMax,
    ]
  }, [yAxisTicks, computedMin, computedMax])

  const paddingLeft = 55
  const paddingRight = 35
  const paddingTop = 30
  const paddingBottom = 45
  const svgWidth = 800
  const svgHeight = height

  const plotWidth = svgWidth - paddingLeft - paddingRight
  const plotHeight = svgHeight - paddingTop - paddingBottom

  const getY = (val: number) => {
    const range = computedMax - computedMin || 1
    const clamped = Math.max(computedMin, Math.min(computedMax, val))
    return paddingTop + plotHeight - ((clamped - computedMin) / range) * plotHeight
  }

  const coords = useMemo(() => {
    const range = computedMax - computedMin || 1
    const total = data.length
    return data.map((item, idx) => {
      const clamped = Math.max(computedMin, Math.min(computedMax, item.value))
      const y = paddingTop + plotHeight - ((clamped - computedMin) / range) * plotHeight
      const x = total <= 1 ? paddingLeft + plotWidth / 2 : paddingLeft + (idx / (total - 1)) * plotWidth
      return {
        x,
        y,
        item,
        idx,
      }
    })
  }, [data, computedMin, computedMax, plotWidth, plotHeight, paddingTop, paddingLeft])

  const areaPath = useMemo(() => {
    if (coords.length === 0) return ''
    return getAreaPath(coords, paddingTop + plotHeight)
  }, [coords, paddingTop, plotHeight])

  const curvePath = useMemo(() => {
    if (coords.length === 0) return ''
    return getSmoothCurvePath(coords)
  }, [coords])

  const visibleCoords = useMemo(() => {
    const total = coords.length
    if (total <= 6) return coords

    const maxTicks = 6
    const step = (total - 1) / (maxTicks - 1)
    const indices = new Set<number>()
    for (let i = 0; i < maxTicks; i++) {
      indices.add(Math.round(i * step))
    }
    return coords.filter((c) => indices.has(c.idx))
  }, [coords])

  const themeColors = {
    indigo: {
      line: '#6366f1',
      startFill: 'rgba(99, 102, 241, 0.45)',
      endFill: 'rgba(99, 102, 241, 0.00)',
      dotBorder: '#4f46e5',
      dotBg: '#ffffff',
      pulse: 'bg-indigo-500',
    },
    emerald: {
      line: '#10b981',
      startFill: 'rgba(16, 185, 129, 0.45)',
      endFill: 'rgba(16, 185, 129, 0.00)',
      dotBorder: '#059669',
      dotBg: '#ffffff',
      pulse: 'bg-emerald-500',
    },
    purple: {
      line: '#a855f7',
      startFill: 'rgba(168, 85, 247, 0.45)',
      endFill: 'rgba(168, 85, 247, 0.00)',
      dotBorder: '#9333ea',
      dotBg: '#ffffff',
      pulse: 'bg-purple-500',
    },
  }[colorTheme]

  if (data.length === 0) {
    return (
      <div
        style={{ height }}
        className="w-full rounded-2xl border border-dashed border-border/70 bg-surface/30 flex items-center justify-center p-6 text-center"
      >
        <p className="text-xs text-text-secondary font-medium">{emptyMessage}</p>
      </div>
    )
  }

  const activeCoord = hoveredIdx !== null && coords[hoveredIdx] ? coords[hoveredIdx] : null

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible"
        style={{ minHeight: height }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={themeColors.startFill} />
            <stop offset="100%" stopColor={themeColors.endFill} />
          </linearGradient>
        </defs>

        {ticks.map((tickVal, i) => {
          const y = getY(tickVal)
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={svgWidth - paddingRight}
                y2={y}
                className="stroke-border/40 dark:stroke-border/20"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-text-tertiary text-[11px] font-semibold"
              >
                {tickVal}
                {valueSuffix}
              </text>
            </g>
          )
        })}

        {typeof baselineValue === 'number' && baselineValue > 0 && (
          <g>
            <line
              x1={paddingLeft}
              y1={getY(baselineValue)}
              x2={svgWidth - paddingRight}
              y2={getY(baselineValue)}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="5 4"
              className="opacity-70"
            />
            <rect
              x={svgWidth - paddingRight - 105}
              y={getY(baselineValue) - 10}
              width="105"
              height="20"
              rx="6"
              fill="#ffffff"
              stroke="#94a3b8"
              strokeWidth="1"
              className="dark:fill-slate-900"
            />
            <text
              x={svgWidth - paddingRight - 52}
              y={getY(baselineValue) + 4}
              textAnchor="middle"
              className="fill-slate-600 dark:fill-slate-300 text-[10px] font-bold"
            >
              {baselineLabel || 'Baseline'} ({baselineValue}{valueSuffix})
            </text>
          </g>
        )}

        {typeof targetValue === 'number' && targetValue > 0 && (
          <g>
            <line
              x1={paddingLeft}
              y1={getY(targetValue)}
              x2={svgWidth - paddingRight}
              y2={getY(targetValue)}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              className="opacity-80"
            />
            <rect
              x={paddingLeft + 6}
              y={getY(targetValue) - 10}
              width="130"
              height="20"
              rx="6"
              fill="#ffffff"
              stroke="#f59e0b"
              strokeWidth="1"
              className="dark:fill-slate-900"
            />
            <text
              x={paddingLeft + 71}
              y={getY(targetValue) + 4}
              textAnchor="middle"
              className="fill-amber-600 dark:fill-amber-400 text-[10px] font-black"
            >
              {targetLabel || 'Mục tiêu'} ({targetValue}{valueSuffix})
            </text>
          </g>
        )}

        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

        {curvePath && (
          <path
            d={curvePath}
            fill="none"
            stroke={themeColors.line}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {activeCoord && (
          <line
            x1={activeCoord.x}
            y1={activeCoord.y}
            x2={activeCoord.x}
            y2={paddingTop + plotHeight}
            stroke={themeColors.line}
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="opacity-60"
          />
        )}

        {coords.map((c) => {
          const isHovered = hoveredIdx === c.idx
          return (
            <g
              key={c.idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(c.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <circle
                cx={c.x}
                cy={c.y}
                r="18"
                fill="transparent"
              />
              <circle
                cx={c.x}
                cy={c.y}
                r={isHovered ? '7' : '4'}
                fill={themeColors.dotBg}
                stroke={themeColors.dotBorder}
                strokeWidth={isHovered ? '3.5' : '2'}
                className="transition-all duration-200"
              />
              {isHovered && (
                <circle
                  cx={c.x}
                  cy={c.y}
                  r="12"
                  fill={themeColors.line}
                  fillOpacity="0.25"
                  className="animate-ping"
                />
              )}
            </g>
          )
        })}

        {visibleCoords.map((c) => {
          let anchor: 'start' | 'middle' | 'end' = 'middle'
          let posX = c.x
          if (c.idx === 0) {
            anchor = 'start'
            posX = c.x - 2
          } else if (c.idx === coords.length - 1) {
            anchor = 'end'
            posX = c.x + 2
          }

          const isHovered = hoveredIdx === c.idx

          return (
            <text
              key={c.idx}
              x={posX}
              y={paddingTop + plotHeight + 22}
              textAnchor={anchor}
              className={`text-[11px] font-bold transition-colors ${
                isHovered ? 'fill-primary font-black' : 'fill-text-secondary'
              }`}
            >
              {c.item.label}
            </text>
          )
        })}
      </svg>

      {activeCoord && (
        <div
          className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full pb-3 transition-all duration-150"
          style={{
            left: `${(activeCoord.x / svgWidth) * 100}%`,
            top: `${(activeCoord.y / svgHeight) * 100}%`,
          }}
        >
          <div className="rounded-2xl border border-border/80 bg-surface/95 backdrop-blur-md px-3.5 py-2.5 shadow-xl text-left min-w-[160px] space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                {activeCoord.item.tag || activeCoord.item.label}
              </span>
              {activeCoord.item.date && (
                <span className="text-[10px] font-medium text-text-tertiary">
                  {activeCoord.item.date}
                </span>
              )}
            </div>

            <div className="text-xs font-bold text-text-primary line-clamp-1">
              {activeCoord.item.tooltipTitle || activeCoord.item.label}
            </div>

            <div className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
              {activeCoord.item.value} {valueSuffix}
            </div>

            {activeCoord.item.details && activeCoord.item.details.length > 0 && (
              <div className="pt-1 border-t border-border/50 space-y-0.5">
                {activeCoord.item.details.map((det, dIdx) => (
                  <div key={dIdx} className="flex items-center justify-between text-[10px] text-text-secondary">
                    <span>{det.label}:</span>
                    <span className="font-bold text-text-primary">{det.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
