/**
 * @file CurvedLoop.tsx
 * @description Component giao diện React CurvedLoop cho học viên
 */

import React, { useRef, useEffect, useState, useMemo, useId, type FC, type PointerEvent } from 'react'

export interface CurvedLoopProps {
  marqueeText?: string
  speed?: number
  className?: string
  wrapperClassName?: string
  curveAmount?: number
  direction?: 'left' | 'right'
  interactive?: boolean
  fontSize?: number | string
}

export const CurvedLoop: FC<CurvedLoopProps> = ({
  marqueeText = '✦ 4 TRỤ CỘT ĐỘT PHÁ ĐIỂM SỐ ✦ LINGOSPHERE ECOSYSTEM ✦ CHINH PHỤC ETS 990',
  speed = 1.8,
  className = '',
  wrapperClassName = '',
  curveAmount = 140,
  direction = 'left',
  interactive = true,
  fontSize = 58,
}) => {
  const text = useMemo(() => {
    const hasTrailing = /\s|\u00A0$/.test(marqueeText)
    return (hasTrailing ? marqueeText.replace(/\s+$/, '') : marqueeText) + '\u00A0'
  }, [marqueeText])

  const measureRef = useRef<SVGTextElement | null>(null)
  const textPathRef = useRef<SVGTextPathElement | null>(null)
  const pathRef = useRef<SVGPathElement | null>(null)
  const [spacing, setSpacing] = useState<number>(0)
  const [offset, setOffset] = useState<number>(0)
  const uid = useId().replace(/:/g, '')
  const pathId = `curve-${uid}`
  const pathD = `M-100,50 Q720,${50 + curveAmount} 1540,50`

  const dragRef = useRef<boolean>(false)
  const lastXRef = useRef<number>(0)
  const dirRef = useRef<'left' | 'right'>(direction)
  const velRef = useRef<number>(0)

  const textLength = spacing
  const totalText = textLength
    ? Array(Math.ceil(2400 / textLength) + 3)
        .fill(text)
        .join('')
    : text
  const ready = spacing > 0

  useEffect(() => {
    if (measureRef.current) {
      const len = measureRef.current.getComputedTextLength()
      if (len > 0) {
        setSpacing(len)
        if (textPathRef.current) {
          const initial = -len
          textPathRef.current.setAttribute('startOffset', initial + 'px')
          setOffset(initial)
        }
      }
    }
  }, [text, className, fontSize])

  useEffect(() => {
    if (!spacing || !ready) return
    let frame = 0
    const step = () => {
      if (!dragRef.current && textPathRef.current) {
        const delta = dirRef.current === 'right' ? speed : -speed
        const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '0')
        let newOffset = currentOffset + delta
        const wrapPoint = spacing
        if (newOffset <= -wrapPoint) newOffset += wrapPoint
        if (newOffset > 0) newOffset -= wrapPoint
        textPathRef.current.setAttribute('startOffset', newOffset + 'px')
        setOffset(newOffset)
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [spacing, speed, ready])

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive) return
    dragRef.current = true
    lastXRef.current = e.clientX
    velRef.current = 0
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive || !dragRef.current || !textPathRef.current) return
    const dx = e.clientX - lastXRef.current
    lastXRef.current = e.clientX
    velRef.current = dx
    const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '0')
    let newOffset = currentOffset + dx
    const wrapPoint = spacing
    if (newOffset <= -wrapPoint) newOffset += wrapPoint
    if (newOffset > 0) newOffset -= wrapPoint
    textPathRef.current.setAttribute('startOffset', newOffset + 'px')
    setOffset(newOffset)
  }

  const endDrag = () => {
    if (!interactive) return
    dragRef.current = false
    dirRef.current = velRef.current > 0 ? 'right' : 'left'
  }

  const cursorStyle = interactive ? (dragRef.current ? 'grabbing' : 'grab') : 'auto'

  return (
    <div
      className={`relative flex items-center justify-center w-full max-w-full select-none overflow-hidden ${wrapperClassName}`}
      style={{ visibility: ready ? 'visible' : 'hidden', cursor: cursorStyle }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <svg
        className="select-none w-full max-w-full overflow-hidden block aspect-[1440/220]"
        viewBox="0 0 1440 220"
      >
        <text
          ref={measureRef}
          xmlSpace="preserve"
          fontSize={fontSize}
          className={className}
          style={{ visibility: 'hidden', opacity: 0, pointerEvents: 'none', fontWeight: 800 }}
        >
          {text}
        </text>
        <defs>
          <path ref={pathRef} id={pathId} d={pathD} fill="none" stroke="transparent" />
        </defs>
        {ready && (
          <text
            xmlSpace="preserve"
            fontSize={fontSize}
            fontWeight="800"
            className={`fill-white uppercase tracking-wider drop-shadow-[0_0_30px_rgba(94,234,212,0.7)] ${className}`}
          >
            <textPath
              ref={textPathRef}
              href={`#${pathId}`}
              startOffset={offset + 'px'}
              xmlSpace="preserve"
            >
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  )
}

export default CurvedLoop
