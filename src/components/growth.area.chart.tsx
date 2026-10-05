// Biểu đồ miền SVG trực quan hóa đường tăng trưởng điểm số học tập hỗ trợ đơn dòng và đa dòng.
'use client'

import { useState, useMemo, useCallback, useId } from 'react'

export interface GrowthChartDataPoint {
  label: string
  value: number
  date?: string
  tag?: string
  tooltipTitle?: string
  tooltipSubtitle?: string
  details?: Array<{ label: string; value: string | number }>
}

export interface GrowthChartSeries {
  id: string
  name: string
  color: string
  data: GrowthChartDataPoint[]
  colorTheme?: 'indigo' | 'emerald' | 'purple' | 'teal'
}

export interface GrowthAreaChartProps {
  data?: GrowthChartDataPoint[]
  series?: GrowthChartSeries[]
  height?: number
  minVal?: number
  maxVal?: number
  targetValue?: number
  targetLabel?: string
  baselineValue?: number
  baselineLabel?: string
  colorTheme?: 'indigo' | 'emerald' | 'purple' | 'teal'
  valueSuffix?: string
  yAxisTicks?: number[]
  emptyMessage?: string
  strokeWidth?: number
}

interface ChartCoordinate {
  x: number
  y: number
  item: GrowthChartDataPoint
  idx: number
  seriesId: string
  seriesName: string
  color: string
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
  series,
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
  strokeWidth = 2,
}: GrowthAreaChartProps) {
  const gradientId = useId()
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null)
  const [lastActiveCoord, setLastActiveCoord] = useState<ChartCoordinate | null>(null)

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
    teal: {
      line: '#0d9488',
      startFill: 'rgba(13, 148, 136, 0.22)',
      endFill: 'rgba(13, 148, 136, 0.00)',
      dotBorder: '#0f766e',
      dotBg: '#ffffff',
    },
  }[colorTheme]

  const activeSeriesList = useMemo<GrowthChartSeries[]>(() => {
    if (series && series.length > 0) {
      return series.filter((s) => s.data.length > 0)
    }
    if (data && data.length > 0) {
      return [
        {
          id: 'default',
          name: 'Điểm số',
          color: themeColors.line,
          colorTheme,
          data,
        },
      ]
    }
    return []
  }, [series, data, themeColors.line, colorTheme])

  const allPoints = useMemo(() => {
    return activeSeriesList.flatMap((s) => s.data)
  }, [activeSeriesList])

  const computedMax = useMemo(() => {
    if (typeof maxVal === 'number' && maxVal > 0) return maxVal
    if (allPoints.length === 0) return 100
    const highest = Math.max(...allPoints.map((d) => d.value), targetValue || 0, baselineValue || 0)
    return Math.max(10, Math.ceil((highest * 1.15) / 50) * 50)
  }, [allPoints, maxVal, targetValue, baselineValue])

  const computedMin = useMemo(() => {
    return Math.min(minVal, ...allPoints.map((d) => d.value), baselineValue || 0)
  }, [allPoints, minVal, baselineValue])

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

  const getY = useCallback(
    (val: number) => {
      const range = computedMax - computedMin || 1
      const clamped = Math.max(computedMin, Math.min(computedMax, val))
      return paddingTop + plotHeight - ((clamped - computedMin) / range) * plotHeight
    },
    [computedMax, computedMin, paddingTop, plotHeight]
  )

  const timelineKeys = useMemo(() => {
    const set = new Set<string>()
    const list: Array<{ key: string; label: string; date?: string; sortVal: number }> = []

    activeSeriesList.forEach((s) => {
      s.data.forEach((p) => {
        const key = p.date ? `${p.date}__${p.label}` : p.label
        if (!set.has(key)) {
          set.add(key)
          let sortVal = 0
          if (p.date) {
            const parsed = Date.parse(p.date)
            if (!Number.isNaN(parsed)) sortVal = parsed
          }
          list.push({ key, label: p.label, date: p.date, sortVal })
        }
      })
    })

    if (list.some((item) => item.sortVal > 0)) {
      list.sort((a, b) => a.sortVal - b.sortVal)
    }

    return list
  }, [activeSeriesList])

  const timelineXMap = useMemo(() => {
    const map = new Map<string, number>()
    const total = timelineKeys.length
    timelineKeys.forEach((item, idx) => {
      const x = total <= 1 ? paddingLeft + plotWidth / 2 : paddingLeft + (idx / (total - 1)) * plotWidth
      map.set(item.key, x)
    })
    return map
  }, [timelineKeys, plotWidth, paddingLeft])

  const seriesRenderData = useMemo(() => {
    return activeSeriesList.map((s) => {
      const coords: ChartCoordinate[] = s.data.map((item, idx) => {
        const key = item.date ? `${item.date}__${item.label}` : item.label
        const x = timelineXMap.get(key) ?? paddingLeft
        const y = getY(item.value)
        return {
          x,
          y,
          item,
          idx,
          seriesId: s.id,
          seriesName: s.name,
          color: s.color,
        }
      })

      const area = coords.length > 0 ? getAreaPath(coords, paddingTop + plotHeight) : ''
      const curve = coords.length > 0 ? getSmoothCurvePath(coords) : ''

      return {
        series: s,
        coords,
        areaPath: area,
        curvePath: curve,
      }
    })
  }, [activeSeriesList, timelineXMap, getY, plotHeight, paddingTop])

  const allCoords = useMemo(() => {
    return seriesRenderData.flatMap((s) => s.coords)
  }, [seriesRenderData])

  const visibleTimelineTicks = useMemo(() => {
    const total = timelineKeys.length
    if (total <= 6) return timelineKeys

    const maxTicks = 6
    const step = (total - 1) / (maxTicks - 1)
    const indices = new Set<number>()
    for (let i = 0; i < maxTicks; i++) {
      indices.add(Math.round(i * step))
    }
    return timelineKeys.filter((_, idx) => indices.has(idx))
  }, [timelineKeys])

  if (activeSeriesList.length === 0 || allPoints.length === 0) {
    return (
      <div
        style={{ height }}
        className="w-full rounded-2xl border border-dashed border-border/70 bg-surface/30 flex items-center justify-center p-6 text-center"
      >
        <p className="text-xs text-text-secondary font-medium">{emptyMessage}</p>
      </div>
    )
  }

  const activeCoord =
    hoveredPointId !== null
      ? allCoords.find((c) => `${c.seriesId}_${c.idx}` === hoveredPointId) || null
      : null
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
    if (allCoords.length === 0) return
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
      setHoveredPointId(null)
      return
    }

    let closest: ChartCoordinate = allCoords[0]
    let minDistance = Infinity
    for (let i = 0; i < allCoords.length; i++) {
      const dx = allCoords[i].x - mouseSvgX
      const dy = allCoords[i].y - mouseSvgY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < minDistance) {
        minDistance = dist
        closest = allCoords[i]
      }
    }

    const id = `${closest.seriesId}_${closest.idx}`
    setHoveredPointId(id)
    setLastActiveCoord(closest)
  }

  const handleSvgMouseLeave = () => {
    setHoveredPointId(null)
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
          {seriesRenderData.map(({ series: s }) => (
            <linearGradient key={s.id} id={`${gradientId}-${s.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.00" />
            </linearGradient>
          ))}
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

        {seriesRenderData.map(({ series: s, areaPath }) => {
          if (!areaPath) return null
          return (
            <path
              key={`area-${s.id}`}
              d={areaPath}
              fill={`url(#${gradientId}-${s.id})`}
            />
          )
        })}

        {seriesRenderData.map(({ series: s, curvePath }) => {
          if (!curvePath) return null
          return (
            <path
              key={`curve-${s.id}`}
              d={curvePath}
              fill="none"
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )
        })}

        {currentCoord && (
          <line
            x1={currentCoord.x}
            y1={currentCoord.y}
            x2={currentCoord.x}
            y2={paddingTop + plotHeight}
            stroke={currentCoord.color}
            strokeWidth="1"
            strokeDasharray="3 3"
            className={`transition-all duration-200 ease-out ${
              activeCoord ? 'opacity-60' : 'opacity-0'
            }`}
          />
        )}

        {seriesRenderData.map(({ series: s, coords }) => (
          <g key={`dots-${s.id}`}>
            {coords.map((c) => {
              const pointId = `${s.id}_${c.idx}`
              const isHovered = hoveredPointId === pointId
              return (
                <g
                  key={pointId}
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredPointId(pointId)
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
                    fill={s.color}
                    fillOpacity="0.2"
                    className={`transition-opacity duration-200 ease-out ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isHovered ? '4.5' : '2.5'}
                    fill="#ffffff"
                    stroke={s.color}
                    strokeWidth={isHovered ? '1.8' : '1.2'}
                    className="transition-all duration-200 ease-out"
                  />
                </g>
              )
            })}
          </g>
        ))}

        {visibleTimelineTicks.map((t, idx) => {
          const x = timelineXMap.get(t.key) ?? paddingLeft
          let anchor: 'start' | 'middle' | 'end' = 'middle'
          let posX = x
          if (idx === 0) {
            anchor = 'start'
            posX = x - 2
          } else if (idx === visibleTimelineTicks.length - 1) {
            anchor = 'end'
            posX = x + 2
          }

          const isHovered = currentCoord ? Math.abs(currentCoord.x - x) < 5 : false

          return (
            <text
              key={t.key}
              x={posX}
              y={paddingTop + plotHeight + 22}
              textAnchor={anchor}
              className={`text-[11px] font-bold transition-colors ${
                isHovered ? 'fill-primary font-black' : 'fill-text-secondary'
              }`}
            >
              {t.label}
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
              <span
                className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded truncate max-w-[130px]"
                style={{
                  backgroundColor: `${currentCoord.color}20`,
                  color: currentCoord.color,
                }}
              >
                {currentCoord.seriesName ? currentCoord.seriesName : currentCoord.item.tag || currentCoord.item.label}
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
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: currentCoord.color }}
                />
                <span className="truncate">{currentCoord.item.tooltipSubtitle}</span>
              </div>
            )}

            <div
              className="text-base font-black"
              style={{ color: currentCoord.color }}
            >
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
