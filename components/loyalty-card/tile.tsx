import { TILE_PATHS } from './geometry'
import styles from './loyalty-card.module.css'

interface TileProps {
  pathIndex: number
  isUnlocked: boolean
  allUnlocked: boolean
}

export function Tile({ pathIndex, isUnlocked, allUnlocked }: TileProps) {
  const cls = [
    styles.tilePath,
    isUnlocked ? styles.unlocked : '',
    allUnlocked ? styles.complete : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.tileContainer}>
      <div className={styles.tilePiece}>
        <svg
          className={styles.tileSvg}
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className={cls}
            d={TILE_PATHS[pathIndex]}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  )
}
