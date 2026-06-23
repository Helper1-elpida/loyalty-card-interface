'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { WORD } from './geometry'
import { Tile } from './tile'
import styles from './loyalty-card.module.css'

const BASE_FONT_PX = 120
const H_PADDING_PX = 24

interface TileState {
  id: number
  isUnlocked: boolean
}

interface CardBackProps {
  tiles: TileState[]
  allUnlocked: boolean
  isCelebrating?: boolean
  word?: string
  unlockArmed?: boolean
  onPuzzleTap?: () => void
}

export function CardBack({
  tiles,
  allUnlocked,
  isCelebrating,
  word,
  unlockArmed,
  onPuzzleTap,
}: CardBackProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [fontSize, setFontSize] = useState<number>(BASE_FONT_PX)

  const displayWord = word ?? WORD

  useLayoutEffect(() => {
    const fit = () => {
      const container = containerRef.current
      const text = textRef.current
      if (!container || !text) return
      const currentSize = parseFloat(getComputedStyle(text).fontSize)
      const currentWidth = text.scrollWidth
      if (!currentSize || !currentWidth) return
      const available = container.clientWidth - H_PADDING_PX
      if (available <= 0) return
      const next = Math.min((currentSize * available) / currentWidth, BASE_FONT_PX)
      setFontSize((prev) => (Math.abs(prev - next) < 0.5 ? prev : next))
    }

    fit()
    const observer = new ResizeObserver(fit)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [displayWord])

  return (
    <>
      {isCelebrating && <div className={styles.shine} aria-hidden="true" />}
      <div
        className={styles.puzzleArea}
        onClick={(e) => {
          if (unlockArmed) {
            e.stopPropagation()
            onPuzzleTap?.()
          }
        }}
      >
        <div className={styles.wordBase} ref={containerRef}>
          <span className={styles.wordText} ref={textRef} style={{ fontSize }}>
            {displayWord}
          </span>
        </div>
        <div className={styles.gridContainer}>
          {tiles.map((tile) => (
            <Tile
              key={tile.id}
              pathIndex={tile.id}
              isUnlocked={tile.isUnlocked}
              allUnlocked={allUnlocked}
            />
          ))}
        </div>
      </div>
    </>
  )
}