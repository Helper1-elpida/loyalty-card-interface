'use client'

import { useState, type CSSProperties } from 'react'
import { COLS, ROWS, INSET_TB, INSET_LR } from '../../components/loyalty-card/geometry'
import { CardBack } from '../../components/loyalty-card/card-back'
import { words } from '../../components/loyalty-card/words'
import styles from '../../components/loyalty-card/loyalty-card.module.css'

const TILE_COUNT = COLS * ROWS

// Every tile pre-unlocked so each card shows its word fully revealed.
const FULLY_UNLOCKED_TILES = Array(TILE_COUNT)
  .fill(null)
  .map((_, i) => ({ id: i, isUnlocked: true }))

// Same CSS custom properties the production card relies on for grid sizing.
const gridVars = {
  '--cols': COLS,
  '--rows': ROWS,
  '--inset-tb': INSET_TB,
  '--inset-lr': INSET_LR,
} as CSSProperties

export default function DebugWordsPage() {
  // Single shared toggle — flips ALL 20 cards between puzzle and meaning view at once.
  const [showMeaning, setShowMeaning] = useState(false)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#2C2C2C',
        padding: '40px 24px 120px',
      }}
    >
      <h1
        style={{
          fontFamily: 'DM Sans, sans-serif',
          color: '#EDE8E0',
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        Debug — all {words.length} words ({showMeaning ? 'meaning view' : 'puzzle view'})
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '32px 24px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {words.map((entry) => (
          <div key={entry.word} style={gridVars}>
            <div className={styles.cardStage}>
              {/* Puzzle face — reuses the real CardBack component as-is, permanently flipped into view */}
              <div className={`${styles.cardShell} ${showMeaning ? styles.cardHidden : ''}`}>
                <div className={styles.cardContainer}>
                  <div className={`${styles.cardInner} ${styles.flipped}`}>
                    <div className={styles.cardFace} />
                    <div className={`${styles.cardFace} ${styles.cardBack}`}>
                      <CardBack
                        tiles={FULLY_UNLOCKED_TILES}
                        allUnlocked={true}
                        word={entry.word}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Meaning panel — same markup/classes as production, driven by the shared toggle */}
              <div
                className={`${styles.meaningPanel} ${showMeaning ? styles.meaningVisible : ''}`}
                aria-hidden={!showMeaning}
              >
                <p className={styles.meaningWord}>{entry.word.toLowerCase()}</p>
                <div className={styles.meaningBody}>
                  <p className={styles.meaningText}>
                    <span className={styles.meaningPrefix}>meaning: </span>
                    {entry.meaning}
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

            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                color: '#A8BDB8',
                fontSize: '12px',
                textAlign: 'center',
                marginTop: '10px',
                opacity: 0.8,
              }}
            >
              {entry.word}
            </p>
          </div>
        ))}
      </div>

      {/* Floating global control — the only meaning trigger, flips all 20 cards together */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <button
          type="button"
          onClick={() => setShowMeaning((v) => !v)}
          style={{
            background: '#A8BDB8',
            color: '#2C2C2C',
            border: 'none',
            borderRadius: '999px',
            padding: '14px 28px',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          {showMeaning ? 'show all puzzles' : 'tap to see the meaning'}
        </button>
      </div>
    </div>
  )
}