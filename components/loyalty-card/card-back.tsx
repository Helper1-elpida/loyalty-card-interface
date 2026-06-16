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
  useLayoutEffect(() => {
    const fit = () => {
      const container = containerRef.current
      const text = textRef.current
      if (!container || !text) return

      // Measure the natural width at a known base size, then scale linearly.
      text.style.fontSize = `${BASE_FONT_PX}px`
      const naturalWidth = text.scrollWidth
      if (naturalWidth === 0) return

      const available = container.clientWidth - H_PADDING_PX
      setFontSize((BASE_FONT_PX * available) / naturalWidth)
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
