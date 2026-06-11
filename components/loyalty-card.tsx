'use client'

import { useState } from 'react'

const WORD = 'TSUNDOKU'
const COLS = 4
const ROWS = 2
const INITIAL_TILES = Array(COLS * ROWS)
  .fill(null)
  .map((_, i) => ({
    id: i,
    isUnlocked: false,
  }))

/* ------------------------------------------------------------------ */
/*  SVG jigsaw clip-path geometry                                      */
/*                                                                     */
/*  Paths use objectBoundingBox units (0..1) so the clip scales with   */
/*  the element and survives the CSS 3D card flip.                     */
/*                                                                     */
/*  The card is 16:9 and the puzzle area is inset proportionally, so   */
/*  every cell has a fixed aspect ratio r = (16*ROWS)/(9*COLS). The    */
/*  tab depth is a constant 18% of the cell's SHORTER dimension (the   */
/*  cell height). Because the box is non-square, that constant pixel   */
/*  depth maps to different object-units on the x (mx) and y (my)      */
/*  axes — but every tile shares the same box, so a tab is always the  */
/*  exact mirror of the neighbouring slot.                             */
/* ------------------------------------------------------------------ */

const CELL_ASPECT = (16 * ROWS) / (9 * COLS) // width / height of a cell
const TAB = 0.18 // tab depth as a fraction of the shorter (height) dimension

// Baseline insets in objectBoundingBox units (box = cell + 2*tab on each axis).
const MY = TAB / (1 + 2 * TAB) // vertical inset
const MX = TAB / (CELL_ASPECT + 2 * TAB) // horizontal inset

// How far each tile-piece is expanded past its grid cell (CSS %, axis-aware).
const INSET_TB = TAB * 100 // top/bottom: % of cell height
const INSET_LR = (TAB / CELL_ASPECT) * 100 // left/right: % of cell width

const f = (n: number) => Number(n.toFixed(4))

type Edge = 1 | -1 | 0 // 1 = tab, -1 = slot, 0 = flat
type Side = 'top' | 'right' | 'bottom' | 'left'

// Symmetric, semicircle-like knob sampled along an edge.
// a = position along the edge (0..1); o = outward factor (0..1) of tab depth.
// Symmetry about a = 0.5 guarantees a tab lines up with the neighbour's slot,
// since adjacent edges are traversed in opposite directions.
const PROFILE = [
  { type: 'L', a: 0.36, o: 0 },
  { type: 'C', a1: 0.36, o1: 0.6, a2: 0.42, o2: 1, a: 0.5, o: 1 },
  { type: 'C', a1: 0.58, o1: 1, a2: 0.64, o2: 0.6, a: 0.64, o: 0 },
  { type: 'L', a: 1, o: 0 },
] as const

// Map (side, a, o, sign) to absolute objectBoundingBox coordinates.
function point(side: Side, a: number, o: number, sign: Edge): [number, number] {
  const dx = sign * o * MX
  const dy = sign * o * MY
  switch (side) {
    case 'top':
      return [MX + a * (1 - 2 * MX), MY - dy]
    case 'right':
      return [1 - MX + dx, MY + a * (1 - 2 * MY)]
    case 'bottom':
      return [1 - MX - a * (1 - 2 * MX), 1 - MY + dy]
    case 'left':
      return [MX - dx, 1 - MY - a * (1 - 2 * MY)]
  }
}

function emitEdge(side: Side, sign: Edge): string {
  let d = ''
  for (const seg of PROFILE) {
    if (seg.type === 'L') {
      const [x, y] = point(side, seg.a, seg.o, sign)
      d += ` L ${f(x)} ${f(y)}`
    } else {
      const [x1, y1] = point(side, seg.a1, seg.o1, sign)
      const [x2, y2] = point(side, seg.a2, seg.o2, sign)
      const [x, y] = point(side, seg.a, seg.o, sign)
      d += ` C ${f(x1)} ${f(y1)}, ${f(x2)} ${f(y2)}, ${f(x)} ${f(y)}`
    }
  }
  return d
}

function buildPath(t: Edge, r: Edge, b: Edge, l: Edge): string {
  let d = `M ${f(MX)} ${f(MY)}`
  d += emitEdge('top', t)
  d += emitEdge('right', r)
  d += emitEdge('bottom', b)
  d += emitEdge('left', l)
  d += ' Z'
  return d
}

// Tab/slot map for the 2 rows x 4 columns grid (row-major order).
const TILE_EDGES: { t: Edge; r: Edge; b: Edge; l: Edge }[] = [
  { t: 0, r: 1, b: 1, l: 0 }, // [0] row0,col0
  { t: 0, r: 1, b: -1, l: -1 }, // [1] row0,col1
  { t: 0, r: 1, b: 1, l: -1 }, // [2] row0,col2
  { t: 0, r: 0, b: -1, l: -1 }, // [3] row0,col3
  { t: -1, r: 1, b: 0, l: 0 }, // [4] row1,col0
  { t: 1, r: 1, b: 0, l: -1 }, // [5] row1,col1
  { t: -1, r: 1, b: 0, l: -1 }, // [6] row1,col2
  { t: 1, r: 0, b: 0, l: -1 }, // [7] row1,col3
]

const TILE_PATHS = TILE_EDGES.map((e) => buildPath(e.t, e.r, e.b, e.l))

export default function LoyaltyCard() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [tiles, setTiles] = useState(INITIAL_TILES)

  const unlockRandomTile = () => {
    const lockedTiles = tiles.filter((t) => !t.isUnlocked)
    if (lockedTiles.length === 0) return

    const randomTile = lockedTiles[Math.floor(Math.random() * lockedTiles.length)]
    setTiles(
      tiles.map((t) =>
        t.id === randomTile.id ? { ...t, isUnlocked: true } : t,
      ),
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-100 p-4 flex-col gap-8">
      {/* clipPath definitions for the jigsaw tiles */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: 'absolute' }}
      >
        <defs>
          {TILE_PATHS.map((d, i) => (
            <clipPath
              key={i}
              id={`clip${i}`}
              clipPathUnits="objectBoundingBox"
            >
              <path d={d} />
            </clipPath>
          ))}
        </defs>
      </svg>

      <style>{`
        @keyframes flipCard {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(180deg);
          }
        }

        @keyframes flipCardReverse {
          0% {
            transform: rotateY(180deg);
          }
          100% {
            transform: rotateY(0deg);
          }
        }

        .card-container {
          perspective: 1000px;
          width: 100%;
          max-width: 480px;
          aspect-ratio: 16 / 9;
        }

        .card-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .card-inner.flipped {
          transform: rotateY(180deg);
        }

        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          user-select: none;
        }

        .card-front {
          background-color: #A8BDB8;
          background-image: 
            url('data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" /%3E%3C/filter%3E%3Crect width="100" height="100" fill="white" opacity="0.03" filter="url(%23noise)" /%3E%3C/svg%3E');
        }

        .card-back {
          background-color: #A8BDB8;
          background-image: 
            url('data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" /%3E%3C/filter%3E%3Crect width="100" height="100" fill="white" opacity="0.03" filter="url(%23noise)" /%3E%3C/svg%3E');
          transform: rotateY(180deg);
          overflow: hidden;
        }

        .logo-container {
          display: flex;
          align-items: baseline;
          gap: 6px;
          font-size: clamp(28px, 6vw, 48px);
          letter-spacing: -1px;
        }

        .logo-the {
          font-style: italic;
          font-weight: 300;
          font-family: 'Georgia', 'Garamond', serif;
          color: rgba(0, 0, 0, 0.6);
          font-size: 0.8em;
        }

        .logo-bollocks {
          font-weight: 900;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #2a2a2a;
          letter-spacing: -2px;
        }

        .logo-asterisk {
          position: absolute;
          top: 12%;
          right: 12%;
          font-size: 0.4em;
          color: #2a2a2a;
          font-weight: 300;
        }

        /* Puzzle work area: the shared word layer and the jigsaw grid
           both fill this box. Inset proportionally so the cell aspect
           ratio stays constant at every screen size. */
        .puzzle-area {
          position: absolute;
          inset: 7%;
        }

        /* Single continuous TSUNDOKU layer sitting BEHIND the grid.
           Fully covered (hidden) while every tile is locked. */
        .word-base {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 0;
        }

        .word-text {
          font-family: var(--font-bebas-neue), 'Bebas Neue', 'Oswald', sans-serif;
          font-weight: 400;
          white-space: nowrap;
          line-height: 1;
          font-size: clamp(48px, 14vw, 112px);
          letter-spacing: 0.04em;
          color: #2C2C2C;
        }

        .grid-container {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: repeat(${COLS}, 1fr);
          grid-template-rows: repeat(${ROWS}, 1fr);
          gap: 0;
          z-index: 1;
        }

        .tile-container {
          position: relative;
        }

        /* Expanded beyond the grid cell so tabs render into the
           neighbouring cells; the piece body lines up with the cell.
           Top/bottom expand by % of height, left/right by % of width. */
        .tile-piece {
          position: absolute;
          inset: -${f(INSET_TB)}% -${f(INSET_LR)}%;
          background-color: #2C2C2C;
          transition: background-color 0.4s ease;
        }

        /* Unlocked: fade the charcoal piece to a near-transparent sage
           membrane, revealing the continuous word fragment behind it. */
        .tile-piece.unlocked {
          background-color: rgba(168, 189, 184, 0.1);
        }
      `}</style>

      <div className="card-container" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
          {/* Front of card */}
          <div className="card-face card-front">
            <div className="relative">
              <div className="logo-container">
                <div className="logo-the">the</div>
                <div className="logo-bollocks">bollocks</div>
              </div>
              <div className="logo-asterisk">✳</div>
            </div>
          </div>

          {/* Back of card */}
          <div className="card-face card-back">
            <div className="puzzle-area">
              {/* Single continuous word layer behind the grid */}
              <div className="word-base">
                <span className="word-text">{WORD}</span>
              </div>

              {/* Jigsaw window grid */}
              <div className="grid-container">
                {tiles.map((tile) => (
                  <div key={tile.id} className="tile-container">
                    <div
                      className={`tile-piece ${tile.isUnlocked ? 'unlocked' : ''}`}
                      style={{ clipPath: `url(#clip${tile.id})` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test button */}
      <button
        onClick={unlockRandomTile}
        className="px-6 py-2 bg-stone-300 hover:bg-stone-400 text-stone-900 font-semibold rounded-lg transition-colors"
      >
        Unlock Random Tile
      </button>
    </div>
  )
}
