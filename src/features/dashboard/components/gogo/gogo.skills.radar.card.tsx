// Component biểu đồ mạng nhện đa giác đánh giá toàn diện năng lực các kỹ năng tiếng Anh của học viên hỗ trợ đa ngôn ngữ.
'use client'

import { useLanguage } from '@/hooks/use.language'

interface GogoSkillsRadarCardProps {
  listeningScore: number
  readingScore: number
  speakingScore: number
  writingScore: number
  grammarScore?: number
  pronunciationScore?: number
}

export function GogoSkillsRadarCard({
  listeningScore = 0,
  readingScore = 0,
  speakingScore = 0,
  writingScore = 0,
  grammarScore = 0,
  pronunciationScore = 0,
}: GogoSkillsRadarCardProps) {
  const { isVietnamese } = useLanguage()
  const isVi = isVietnamese

  const axes = [
    { label: isVi ? 'Nghe' : 'Listening', value: Math.max(0, Math.min(100, listeningScore)), target: 90 },
    { label: isVi ? 'Nói' : 'Speaking', value: Math.max(0, Math.min(100, speakingScore)), target: 85 },
    { label: isVi ? 'Đọc' : 'Reading', value: Math.max(0, Math.min(100, readingScore)), target: 90 },
    { label: isVi ? 'Viết' : 'Writing', value: Math.max(0, Math.min(100, writingScore)), target: 85 },
    { label: isVi ? 'Ngữ pháp' : 'Grammar', value: Math.max(0, Math.min(100, grammarScore)), target: 95 },
    { label: isVi ? 'Phát âm' : 'Pronunciation', value: Math.max(0, Math.min(100, pronunciationScore)), target: 85 },
  ]

  const center = 100
  const radius = 65
  const total = axes.length

  const getCoordinates = (valuePercent: number, index: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2
    const dist = (Math.max(5, valuePercent) / 100) * radius
    return {
      x: center + dist * Math.cos(angle),
      y: center + dist * Math.sin(angle),
    }
  }

  const currentPoints = axes.map((a, i) => {
    const c = getCoordinates(a.value, i)
    return `${c.x},${c.y}`
  }).join(' ')

  const targetPoints = axes.map((a, i) => {
    const c = getCoordinates(a.target, i)
    return `${c.x},${c.y}`
  }).join(' ')

  const gridRings = [0.33, 0.66, 1]
  const hasAnyData = axes.some((a) => a.value > 0)

  return (
    <div className="space-y-3 h-full flex flex-col">
      <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
        {isVi ? 'Mạng nhện Năng lực Đa Kỹ năng' : 'Multi-Skill Competency Radar'}
      </h2>
      <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex-1 flex flex-col items-center justify-between">
        <div className="w-full flex items-center justify-center py-1">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
              {gridRings.map((scale) => {
                const ringPoints = axes.map((_, i) => {
                  const c = getCoordinates(scale * 100, i)
                  return `${c.x},${c.y}`
                }).join(' ')
                return (
                  <polygon
                    key={scale}
                    points={ringPoints}
                    fill="none"
                    stroke="currentColor"
                    className="text-border/60"
                    strokeWidth="1"
                  />
                )
              })}

              {axes.map((_, i) => {
                const c = getCoordinates(100, i)
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={c.x}
                    y2={c.y}
                    stroke="currentColor"
                    className="text-border/60"
                    strokeWidth="1"
                  />
                )
              })}

              <polygon
                points={targetPoints}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className="opacity-70"
              />

              {hasAnyData && (
                <polygon
                  points={currentPoints}
                  fill="rgba(16, 185, 129, 0.25)"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
              )}

              {axes.map((a, i) => {
                const labelCoord = getCoordinates(120, i)
                const pointCoord = getCoordinates(a.value, i)
                return (
                  <g key={a.label}>
                    {hasAnyData && (
                      <circle
                        cx={pointCoord.x}
                        cy={pointCoord.y}
                        r="3.5"
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    )}
                    <text
                      x={labelCoord.x}
                      y={labelCoord.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[10px] font-bold fill-current text-text-secondary select-none"
                    >
                      {a.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-text-secondary pt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{isVi ? 'Năng lực hiện tại' : 'Current Level'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-cyan-500" />
            <span>{isVi ? 'Mục tiêu chuẩn' : 'Target Benchmark'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
