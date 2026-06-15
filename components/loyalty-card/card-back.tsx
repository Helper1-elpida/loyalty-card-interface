import { WORD } from './geometry'
import { Tile } from './tile'
import styles from './loyalty-card.module.css'

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
  return (
    <>
      {/* One-shot diagonal shine sweep across the whole card on completion */}
      {isCelebrating && <div className={styles.shine} aria-hidden="true" />}

      <div className={styles.puzzleArea}>
      {/* Single continuous word layer behind the grid */}
      <div className={styles.wordBase}>
        <span className={styles.wordText}>{word ?? WORD}</span>
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
