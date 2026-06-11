'use client'

import { useState, type CSSProperties } from 'react'
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

  const unlockedCount = tiles.filter((t) => t.isUnlocked).length
  const allUnlocked = unlockedCount === TILE_COUNT

  const unlockRandomTile = () => {
    const locked = tiles.filter((t) => !t.isUnlocked)
    if (locked.length === 0) return
    const target = locked[Math.floor(Math.random() * locked.length)]
    setTiles((prev) =>
      prev.map((t) => (t.id === target.id ? { ...t, isUnlocked: true } : t)),
    )
  }

  return (
    <div className={styles.page} style={gridVars}>
      <button
        type="button"
        className={styles.cardContainer}
        onClick={() => setIsFlipped((v) => !v)}
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
            <CardBack tiles={tiles} allUnlocked={allUnlocked} />
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
