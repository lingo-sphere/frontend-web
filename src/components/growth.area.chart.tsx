// Thành phần biểu đồ miền SVG trực quan hóa dữ liệu tăng trưởng năng lực theo thời gian
'use client'

import { useState, useId, useMemo } from 'react'

interface ChartCoordinate {
  x: number
  y: number
  item: GrowthChartDataPoint
  idx: number
}

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
  strokeWidth?: number
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
  strokeWidth = 1.5,
}: GrowthAreaChartProps) {
  const gradientId = useId()
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [lastActiveCoord, setLastActiveCoord] = useState<ChartCoordinate | null>(null)

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
  const paddingRight = 105
  const paddingTop = 26
  const paddingBottom = 45
  const svgWidth = 830
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
      startFill: 'rgba(99, 102, 241, 0.22)',
      endFill: 'rgba(99, 102, 241, 0.00)',
      dotBorder: '#4f46e5',
      dotBg: '#ffffff',
    },
    emerald: {
      line: '#10b981',
      startFill: 'rgba(16, 185, 129, 0.22)',
      endFill: 'rgba(16, 185, 129, 0.00)',
      dotBorder: '#059669',
      dotBg: '#ffffff',
    },
    purple: {
      line: '#a855f7',
      startFill: 'rgba(168, 85, 247, 0.22)',
      endFill: 'rgba(168, 85, 247, 0.00)',
      dotBorder: '#9333ea',
      dotBg: '#ffffff',
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
  const currentCoord = activeCoord || lastActiveCoord

  const isTooltipBelow = currentCoord ? currentCoord.y < svgHeight * 0.52 : false
  const isTooltipRightAligned = currentCoord ? currentCoord.x / svgWidth > 0.8 : false
  const isTooltipLeftAligned = currentCoord ? currentCoord.x / svgWidth < 0.2 : false

  const horizontalTransform = isTooltipRightAligned
    ? '-translate-x-[85%]'
    : isTooltipLeftAligned
      ? '-translate-x-[15%]'
      : '-translate-x-1/2'

  const verticalTransform = isTooltipBelow
    ? 'translate-y-3'
    : '-translate-y-full -translate-y-3'

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (coords.length === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width === 0) return
    const mouseSvgX = ((e.clientX - rect.left) / rect.width) * svgWidth
    const mouseSvgY = ((e.clientY - rect.top) / rect.height) * svgHeight

    if (
      mouseSvgX < paddingLeft - 20 ||
      mouseSvgX > paddingLeft + plotWidth + 20 ||
      mouseSvgY < paddingTop - 15 ||
      mouseSvgY > paddingTop + plotHeight + 35
    ) {
      setHoveredIdx(null)
      return
    }

    let closestIdx = 0
    let minDistance = Infinity
    for (let i = 0; i < coords.length; i++) {
      const dist = Math.abs(coords[i].x - mouseSvgX)
      if (dist < minDistance) {
        minDistance = dist
        closestIdx = i
      }
    }
    const closest = coords[closestIdx]
    setHoveredIdx(closestIdx)
    setLastActiveCoord(closest)
  }

  const handleSvgMouseLeave = () => {
    setHoveredIdx(null)
  }

  const targetY = typeof targetValue === 'number' && targetValue > 0 ? getY(targetValue) : null
  const rawBaselineY = typeof baselineValue === 'number' && baselineValue > 0 ? getY(baselineValue) : null

  let baselineY = rawBaselineY
  if (targetY !== null && baselineY !== null) {
    if (Math.abs(targetY - baselineY) < 22) {
      baselineY = targetY > baselineY ? targetY - 22 : targetY + 22
    }
  }

  const targetStroke = colorTheme === 'emerald' ? '#10b981' : '#f59e0b'
  const targetTextClass = colorTheme === 'emerald' ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-amber-600 dark:fill-amber-400'

  return (
    <div className="relative w-full overflow-visible select-none">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible cursor-crosshair"
        style={{ minHeight: height }}
        onMouseMove={handleSvgMouseMove}
        onMouseLeave={handleSvgMouseLeave}
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
                x2={paddingLeft + plotWidth}
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

        {typeof baselineValue === 'number' && baselineValue > 0 && baselineY !== null && (
          <g>
            <line
              x1={paddingLeft}
              y1={rawBaselineY ?? baselineY}
              x2={paddingLeft + plotWidth}
              y2={rawBaselineY ?? baselineY}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="5 4"
              className="opacity-70"
            />
            <rect
              x={paddingLeft + plotWidth + 6}
              y={baselineY - 9}
              width="94"
              height="18"
              rx="5"
              fill="#ffffff"
              stroke="#94a3b8"
              strokeWidth="1"
              className="dark:fill-slate-900"
            />
            <text
              x={paddingLeft + plotWidth + 53}
              y={baselineY + 4}
              textAnchor="middle"
              className="fill-slate-600 dark:fill-slate-300 text-[10px] font-bold"
            >
              {baselineValue}{valueSuffix} {baselineLabel || 'Baseline'}
            </text>
          </g>
        )}

        {typeof targetValue === 'number' && targetValue > 0 && targetY !== null && (
          <g>
            <line
              x1={paddingLeft}
              y1={targetY}
              x2={paddingLeft + plotWidth}
              y2={targetY}
              stroke={targetStroke}
              strokeWidth="1"
              strokeDasharray="6 4"
              className="opacity-80"
            />
            <rect
              x={paddingLeft + plotWidth + 6}
              y={targetY - 9}
              width="94"
              height="18"
              rx="5"
              fill="#ffffff"
              stroke={targetStroke}
              strokeWidth="1"
              className="dark:fill-slate-900"
            />
            <text
              x={paddingLeft + plotWidth + 53}
              y={targetY + 4}
              textAnchor="middle"
              className={`${targetTextClass} text-[10px] font-black`}
            >
              {targetValue}{valueSuffix} {targetLabel || 'Mục tiêu'}
            </text>
          </g>
        )}

        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

        {curvePath && (
          <path
            d={curvePath}
            fill="none"
            stroke={themeColors.line}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {currentCoord && (
          <line
            x1={currentCoord.x}
            y1={currentCoord.y}
            x2={currentCoord.x}
            y2={paddingTop + plotHeight}
            stroke={themeColors.line}
            strokeWidth="1"
            strokeDasharray="3 3"
            className={`transition-all duration-200 ease-out ${
              activeCoord ? 'opacity-60' : 'opacity-0'
            }`}
          />
        )}

        {coords.map((c) => {
          const isHovered = hoveredIdx === c.idx
          return (
            <g
              key={c.idx}
              className="cursor-pointer"
              onMouseEnter={() => {
                setHoveredIdx(c.idx)
                setLastActiveCoord(c)
              }}
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
                r="7.5"
                fill={themeColors.line}
                fillOpacity="0.2"
                className={`transition-opacity duration-200 ease-out ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <circle
                cx={c.x}
                cy={c.y}
                r={isHovered ? '4.5' : '2.5'}
                fill={themeColors.dotBg}
                stroke={themeColors.dotBorder}
                strokeWidth={isHovered ? '1.8' : '1.2'}
                className="transition-all duration-200 ease-out"
              />
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
              className={`text-[11px] font-bold transition-colors ${isHovered ? 'fill-primary font-black' : 'fill-text-secondary'
                }`}
            >
              {c.item.label}
            </text>
          )
        })}
      </svg>

      {currentCoord && (
        <div
          className={`absolute z-30 pointer-events-none ${horizontalTransform} ${verticalTransform} transition-all duration-200 ease-out ${
            activeCoord ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            left: `${(currentCoord.x / svgWidth) * 100}%`,
            top: `${(currentCoord.y / svgHeight) * 100}%`,
          }}
        >
          <div className="rounded-2xl border border-border/80 bg-surface/95 backdrop-blur-md px-3.5 py-2.5 shadow-xl text-left min-w-[170px] max-w-[260px] space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary truncate max-w-[130px]">
                {currentCoord.item.tag || currentCoord.item.label}
              </span>
              {currentCoord.item.date && (
                <span className="text-[10px] font-medium text-text-tertiary shrink-0">
                  {currentCoord.item.date}
                </span>
              )}
            </div>

            <div className="text-xs font-bold text-text-primary line-clamp-1">
              {currentCoord.item.tooltipTitle || currentCoord.item.label}
            </div>

            {currentCoord.item.tooltipSubtitle && (
              <div className="text-[11px] font-semibold text-text-secondary flex items-center gap-1.5 line-clamp-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span className="truncate">{currentCoord.item.tooltipSubtitle}</span>
              </div>
            )}

            <div className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
              {currentCoord.item.value} {valueSuffix}
            </div>

            {currentCoord.item.details && currentCoord.item.details.length > 0 && (
              <div className="pt-1.5 border-t border-border/50 space-y-1">
                {currentCoord.item.details.map((det, dIdx) => (
                  <div key={dIdx} className="flex items-center justify-between text-[10px] text-text-secondary gap-3">
                    <span className="shrink-0">{det.label}:</span>
                    <span className="font-bold text-text-primary text-right truncate max-w-[150px]">{det.value}</span>
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
