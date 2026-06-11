'use client'

import { useRef, useState, type CSSProperties } from 'react'
import { COLS, ROWS, INSET_TB, INSET_LR } from './geometry'
import { CardFront } from './card-front'
import { CardBack } from './card-back'
import styles from './loyalty-card.module.css'

const TILE_COUNT = COLS * ROWS

const INITIAL_TILES = Array(TILE_COUNT)
  .fill(null)
  .map((_, i) => ({ id: i, isUnlocked: false }))

// Dynamic geometry values passed to CSS as custom properties.
const gridVars = {
  '--cols': COLS,
  '--rows': ROWS,
  '--inset-tb': INSET_TB,
  '--inset-lr': INSET_LR,
} as CSSProperties

export default function LoyaltyCard() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [tiles, setTiles] = useState(INITIAL_TILES)
  // One-shot completion celebration, fired only when the 8th tile unlocks.
  const [isCelebrating, setIsCelebrating] = useState(false)
  const hasCelebrated = useRef(false)

  const unlockedCount = tiles.filter((t) => t.isUnlocked).length
  const allUnlocked = unlockedCount === TILE_COUNT

  const unlockRandomTile = () => {
    const locked = tiles.filter((t) => !t.isUnlocked)
    if (locked.length === 0) return
    const target = locked[Math.floor(Math.random() * locked.length)]
    const nextUnlockedCount = unlockedCount + 1
    setTiles((prev) =>
      prev.map((t) => (t.id === target.id ? { ...t, isUnlocked: true } : t)),
    )

    // Trigger the reveal sequence exactly once, the moment the final
    // (8th) tile transitions from locked to unlocked.
    if (nextUnlockedCount === TILE_COUNT && !hasCelebrated.current) {
      hasCelebrated.current = true
      setIsCelebrating(true)
    }
  }

  return (
    <div className={styles.page} style={gridVars}>
      <button
        type="button"
        className={`${styles.cardContainer} ${isCelebrating ? styles.celebrate : ''}`}
        onClick={() => setIsFlipped((v) => !v)}
        onAnimationEnd={(e) => {
          // Only the card container's own breathing animation should reset the
          // flag — ignore the shine animation bubbling up from a descendant.
          if (e.target === e.currentTarget) setIsCelebrating(false)
        }}
        aria-pressed={isFlipped}
        aria-label={
          isFlipped
            ? 'Loyalty card, showing puzzle side. Activate to flip to the front.'
            : 'Loyalty card, showing front. Activate to flip and reveal the puzzle.'
        }
      >
        <div className={`${styles.cardInner} ${isFlipped ? styles.flipped : ''}`}>
          <div className={styles.cardFace}>
            <CardFront />
          </div>
          <div className={`${styles.cardFace} ${styles.cardBack}`}>
            <CardBack tiles={tiles} allUnlocked={allUnlocked} isCelebrating={isCelebrating} />
          </div>
        </div>
      </button>

      {isFlipped && (
        <p className={styles.progress} aria-live="polite">
          {allUnlocked
            ? 'Complete! All 8 pieces unlocked.'
            : `${unlockedCount} of ${TILE_COUNT} pieces unlocked`}
        </p>
      )}

      <button
        type="button"
        onClick={unlockRandomTile}
        disabled={allUnlocked}
        className="px-6 py-2 bg-stone-300 hover:bg-stone-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-900 font-semibold rounded-lg transition-colors"
      >
        Unlock Random Tile
      </button>
    </div>
  )
}
