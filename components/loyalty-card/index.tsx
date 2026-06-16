'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { COLS, ROWS, INSET_TB, INSET_LR } from './geometry'
import { CardFront } from './card-front'
import { CardBack } from './card-back'
import { TavernSign } from './tavern-sign'
import { words, type WordEntry } from './words'
import styles from './loyalty-card.module.css'

const STORAGE_KEY = 'bollocks_word'

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
  // Toggles between the card and the meaning panel.
  const [showMeaning, setShowMeaning] = useState(false)
  // One-shot completion celebration, fired only when the 8th tile unlocks.
  const [isCelebrating, setIsCelebrating] = useState(false)
  const hasCelebrated = useRef(false)

  // The active word/meaning, chosen on load and persisted across sessions.
  const [selected, setSelected] = useState<WordEntry | null>(null)

  // Long-press unlock: holding the front logo for 3s unlocks a random tile.
  const [pressing, setPressing] = useState(false)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressFired = useRef(false)

  const unlockedCount = tiles.filter((t) => t.isUnlocked).length
  const allUnlocked = unlockedCount === TILE_COUNT

  // On load: reuse the persisted word, or pick a fresh random one and save it.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as WordEntry
        if (parsed?.word && parsed?.meaning) {
          setSelected(parsed)
          return
        }
      } catch {
        // fall through to picking a new word
      }
    }
    const pick = words[Math.floor(Math.random() * words.length)]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pick))
    setSelected(pick)
  }, [])

  // Once every tile is unlocked, clear storage so the next session re-rolls.
  useEffect(() => {
    if (allUnlocked) localStorage.removeItem(STORAGE_KEY)
  }, [allUnlocked])

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

  const startPress = () => {
    if (isFlipped || allUnlocked) return
    longPressFired.current = false
    setPressing(true)
    pressTimer.current = setTimeout(() => {
      longPressFired.current = true
      setPressing(false)
      unlockRandomTile()
    }, 3000)
  }

  const endPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
    setPressing(false)
  }

  return (
    <div className={styles.page} style={gridVars}>
      <div className={styles.cardStage}>
        <div className={`${styles.cardShell} ${showMeaning ? styles.cardHidden : ''}`}>
          <button
            type="button"
            className={`${styles.cardContainer} ${isCelebrating ? styles.celebrate : ''}`}
            onClick={() => {
              // Swallow the click that ends a successful long-press so the
              // unlock gesture doesn't also flip the card.
              if (longPressFired.current) {
                longPressFired.current = false
                return
              }
              setIsFlipped((v) => !v)
            }}
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
            <CardFront
              pressing={pressing}
              onPressStart={startPress}
              onPressEnd={endPress}
            />
          </div>
          <div className={`${styles.cardFace} ${styles.cardBack}`}>
            <CardBack
              tiles={tiles}
              allUnlocked={allUnlocked}
              isCelebrating={isCelebrating}
              word={selected?.word}
            />
          </div>
        </div>
      </button>
        </div>

        <div
          className={`${styles.meaningPanel} ${showMeaning ? styles.meaningVisible : ''}`}
          aria-hidden={!showMeaning}
        >
          <p className={styles.meaningSentence}>
            η λέξη{' '}
            <span className={styles.meaningWord}>
              {selected?.word.toLowerCase()}
            </span>{' '}
            σημαίνει...
          </p>
          <p className={styles.meaningText}>{selected?.meaning}</p>
          <hr className={styles.meaningRule} />
          <p className={styles.meaningReward}>
            Δείξτε το ολοκληρωμένο παζλ σας στον πάγκο παραγγελίας
          </p>
          <button
            type="button"
            className={styles.meaningBack}
            onClick={() => setShowMeaning(false)}
            aria-label="Επιστροφή στην κάρτα"
          >
            ←
          </button>
        </div>
      </div>

      {allUnlocked && !showMeaning && (
        <button
          type="button"
          className={styles.meaningHint}
          onClick={() => setShowMeaning(true)}
        >
          tap to see the meaning
        </button>
      )}

      {isFlipped && (
        <p className={styles.progress} aria-live="polite">
          {allUnlocked
            ? 'Complete! All 8 pieces unlocked.'
            : `${unlockedCount} of ${TILE_COUNT} pieces unlocked`}
        </p>
      )}
    </div>
  )
}
