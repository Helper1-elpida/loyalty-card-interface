import { useLayoutEffect, useRef, useState } from 'react'
import { WORD } from './geometry'
import { Tile } from './tile'
import styles from './loyalty-card.module.css'

// Largest font we ever try; the text is scaled DOWN from here to fit the grid.
const BASE_FONT_PX = 120
// Total horizontal breathing room inside the grid (12px each side).
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
}

export function CardBack({ tiles, allUnlocked, isCelebrating, word }: CardBackProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [fontSize, setFontSize] = useState<number>(BASE_FONT_PX)

  const displayWord = word ?? WORD

  // Scale the word to fill the grid width (minus padding) without overflowing.
  // Runs on mount and whenever the word changes; also re-fits on resize.
  //
  // We measure the text at whatever size is currently applied and scale
  // linearly toward the available width. This avoids mutating the live
  // element's inline style for measurement (which can leave a stale size
  // stuck on the node when a re-render is skipped), and it caps the result
  // at BASE_FONT_PX so short words never blow up past the base size.
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
      {/* One-shot diagonal shine sweep across the whole card on completion */}
      {isCelebrating && <div className={styles.shine} aria-hidden="true" />}

      <div className={styles.puzzleArea}>
      {/* Single continuous word layer behind the grid */}
      <div className={styles.wordBase} ref={containerRef}>
        <span className={styles.wordText} ref={textRef} style={{ fontSize }}>
          {displayWord}
        </span>
      </div>

      {/* Jigsaw window grid */}
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
