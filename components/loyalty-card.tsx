'use client'

import { useState } from 'react'

const WORD = 'TSUNDOKU'
const INITIAL_TILES = Array(8)
  .fill(null)
  .map((_, i) => ({
    id: i,
    letter: WORD[i],
    isUnlocked: false,
  }))

/* ------------------------------------------------------------------ */
/*  SVG jigsaw clip-path geometry                                      */
/*                                                                     */
/*  All paths are expressed in objectBoundingBox units (0..1) so the   */
/*  clip scales with the element and survives the CSS 3D rotateY.      */
/*                                                                     */
/*  The piece "body" baseline is inset by M on every side. A tab       */
/*  bulges outward by M (reaching the box edge at 0 or 1); a slot is    */
/*  the exact inverse, carving inward by M. Because every tile shares   */
/*  the same profile and box size, a tab on one edge is the precise     */
/*  mirror of the slot on its neighbour, so the pieces interlock.       */
/* ------------------------------------------------------------------ */

const M = 0.2 // tab depth / baseline inset (~20% of the box)
const CORE = 1 - 2 * M // length of a baseline edge in box units (0.6)

const f = (n: number) => Number(n.toFixed(4))

type Edge = 1 | -1 | 0 // 1 = tab, -1 = slot, 0 = flat
type Side = 'top' | 'right' | 'bottom' | 'left'

// Edge profile sampled along the edge (a: 0..1) with an outward factor (o).
// Actual outward distance = o * M * sign. A smooth cubic knob with a neck.
const PROFILE = [
  { type: 'L', a: 0.35, o: 0 },
  { type: 'C', a1: 0.43, o1: 0, a2: 0.4, o2: 1, a: 0.5, o: 1 },
  { type: 'C', a1: 0.6, o1: 1, a2: 0.57, o2: 0, a: 0.65, o: 0 },
  { type: 'L', a: 1, o: 0 },
] as const

// Map a point on a given side (a along the edge, out = outward distance)
// to absolute objectBoundingBox coordinates.
function mapEdge(side: Side, a: number, out: number): [number, number] {
  switch (side) {
    case 'top':
      return [M + a * CORE, M - out]
    case 'right':
      return [1 - M + out, M + a * CORE]
    case 'bottom':
      return [1 - M - a * CORE, 1 - M + out]
    case 'left':
      return [M - out, 1 - M - a * CORE]
  }
}

function emitEdge(side: Side, sign: Edge): string {
  let d = ''
  for (const seg of PROFILE) {
    if (seg.type === 'L') {
      const [x, y] = mapEdge(side, seg.a, seg.o * M * sign)
      d += ` L ${f(x)} ${f(y)}`
    } else {
      const [x1, y1] = mapEdge(side, seg.a1, seg.o1 * M * sign)
      const [x2, y2] = mapEdge(side, seg.a2, seg.o2 * M * sign)
      const [x, y] = mapEdge(side, seg.a, seg.o * M * sign)
      d += ` C ${f(x1)} ${f(y1)}, ${f(x2)} ${f(y2)}, ${f(x)} ${f(y)}`
    }
  }
  return d
}

function buildPath(t: Edge, r: Edge, b: Edge, l: Edge): string {
  let d = `M ${f(M)} ${f(M)}`
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

        @keyframes flipTile {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(180deg);
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

        .grid-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 0;
          width: 100%;
          height: 100%;
          padding: 24px;
          box-sizing: border-box;
        }

        .tile-container {
          perspective: 1000px;
          position: relative;
        }

        /* Expanded beyond the grid cell so the tabs render into the
           neighbouring cells. The piece body (inset by M on each side)
           lines up exactly with the cell. */
        .tile-inner {
          position: absolute;
          inset: -33.333%;
          transform-style: preserve-3d;
          transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .tile-inner.unlocked {
          transform: rotateY(180deg);
        }

        .tile-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: clamp(36px, 8vw, 72px);
          line-height: 1;
        }

        .tile-locked {
          background-color: #2C2C2C;
          color: rgba(44, 44, 44, 0.1);
        }

        .tile-unlocked {
          background-color: #A8BDB8;
          background-image: 
            url('data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" /%3E%3C/filter%3E%3Crect width="100" height="100" fill="white" opacity="0.03" filter="url(%23noise)" /%3E%3C/svg%3E');
          color: #2C2C2C;
          transform: rotateY(180deg);
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
            <div className="grid-container">
              {tiles.map((tile) => (
                <div key={tile.id} className="tile-container">
                  <div className={`tile-inner ${tile.isUnlocked ? 'unlocked' : ''}`}>
                    {/* Locked state */}
                    <div
                      className="tile-face tile-locked"
                      style={{ clipPath: `url(#clip${tile.id})` }}
                    >
                      {tile.letter}
                    </div>
                    {/* Unlocked state */}
                    <div
                      className="tile-face tile-unlocked"
                      style={{ clipPath: `url(#clip${tile.id})` }}
                    >
                      {tile.letter}
                    </div>
                  </div>
                </div>
              ))}
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
