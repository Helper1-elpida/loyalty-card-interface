'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { COLS, ROWS, INSET_TB, INSET_LR } from './geometry'
import { CardFront } from './card-front'
import { CardBack } from './card-back'
import { TavernSign } from './tavern-sign'
import { words, type WordEntry } from './words'
import styles from './loyalty-card.module.css'

const STORAGE_KEY = 'bollocks_word'
const TILES_STORAGE_KEY = 'bollocks_unlocked_tiles'

const TILE_COUNT = COLS * ROWS

const INITIAL_TILES = Array(TILE_COUNT)
  .fill(null)
  .map((_, i) => ({ id: i, isUnlocked: false }))

const gridVars = {
  '--cols': COLS,
  '--rows': ROWS,
  '--inset-tb': INSET_TB,
  '--inset-lr': INSET_LR,
} as CSSProperties

export default function LoyaltyCard() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [tiles, setTiles] = useState(INITIAL_TILES)
  const [showMeaning, setShowMeaning] = useState(false)
  const [isCelebrating, setIsCelebrating] = useState(false)
  const hasCelebrated = useRef(false)
  const isFirstTilesRender = useRef(true)

  const [selected, setSelected] = useState<WordEntry | null>(null)

  const [pressing, setPressing] = useState(false)
  const [unlockArmed, setUnlockArmed] = useState(false)
  const [pulsing, setPulsing] = useState(false)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressFired = useRef(false)

  const unlockedCount = tiles.filter((t) => t.isUnlocked).length
  const allUnlocked = unlockedCount === TILE_COUNT

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

  useEffect(() => {
    const storedTiles = localStorage.getItem(TILES_STORAGE_KEY)
    if (storedTiles) {
      try {
        const parsed = JSON.parse(storedTiles) as { id: number; isUnlocked: boolean }[]
        if (Array.isArray(parsed) && parsed.length === TILE_COUNT) {
          setTiles(parsed)
        }
      } catch {
        // fall through, keep INITIAL_TILES
      }
    }
  }, [])

  useEffect(() => {
    if (isFirstTilesRender.current) {
      isFirstTilesRender.current = false
      return
    }
    localStorage.setItem(TILES_STORAGE_KEY, JSON.stringify(tiles))
  }, [tiles])

  const unlockRandomTile = () => {
    const locked = tiles.filter((t) => !t.isUnlocked)
    if (locked.length === 0) return
    const target = locked[Math.floor(Math.random() * locked.length)]
    const nextUnlockedCount = unlockedCount + 1
    setTiles((prev) =>
      prev.map((t) => (t.id === target.id ? { ...t, isUnlocked: true } : t)),
    )
    if (nextUnlockedCount === TILE_COUNT && !hasCelebrated.current) {
      hasCelebrated.current = true
      setIsCelebrating(true)
    }
  }

  const startNewCycle = () => {
    const pick = words[Math.floor(Math.random() * words.length)]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pick))
    setSelected(pick)
    hasCelebrated.current = false
    setIsCelebrating(false)
    setTiles(INITIAL_TILES.map((t) => ({ ...t })))
  }

  const startPress = () => {
    if (isFlipped) return
    longPressFired.current = false
    setPressing(true)
    pressTimer.current = setTimeout(() => {
      longPressFired.current = true
      setPressing(false)
      setUnlockArmed(true)
      setPulsing(true)
    }, 3000)
  }

  const endPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
    setPressing(false)
  }

  const handlePuzzleTap = () => {
    if (!unlockArmed) return
    if (allUnlocked) {
      startNewCycle()
    } else {
      unlockRandomTile()
    }
    setUnlockArmed(false)
  }

  return (
    <div className={styles.page} style={gridVars}>
      <div className={styles.cardStage}>
        <div className={`${styles.cardShell} ${showMeaning ? styles.cardHidden : ''}`}>
          <button
            type="button"
            className={`${styles.cardContainer} ${isCelebrating ? styles.celebrate : ''} ${pulsing ? styles.armPulse : ''}`}
            onClick={() => {
              if (longPressFired.current) {
                longPressFired.current = false
                return
              }
              setIsFlipped((v) => !v)
            }}
            onAnimationEnd={(e) => {
              if (e.target === e.currentTarget) {
                setIsCelebrating(false)
                setPulsing(false)
              }
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
                  unlockArmed={unlockArmed}
                  onPuzzleTap={handlePuzzleTap}
                />
              </div>
            </div>
          </button>
        </div>

        <div
          className={`${styles.meaningPanel} ${showMeaning ? styles.meaningVisible : ''}`}
          aria-hidden={!showMeaning}
        >
          <p className={styles.meaningWord}>
            {selected?.word.toLowerCase()}
          </p>
          <div className={styles.meaningBody}>
            <p className={styles.meaningText}>
              <span className={styles.meaningPrefix}>meaning: </span>
              {selected?.meaning}
            </p>
          </div>
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

      {isFlipped && !showMeaning && (
        <p className={styles.progressCounter} aria-live="polite">
          {unlockedCount}/{TILE_COUNT}
        </p>
      )}
    </div>
  )
}