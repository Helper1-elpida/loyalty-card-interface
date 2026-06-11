/* ------------------------------------------------------------------ */
/*  SVG jigsaw clip-path geometry                                      */
/*                                                                     */
/*  Paths use objectBoundingBox units (0..1) so the shape scales with  */
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

export const WORD = 'TSUNDOKU'
export const COLS = 4
export const ROWS = 2

const CELL_ASPECT = (16 * ROWS) / (9 * COLS) // width / height of a cell
const TAB = 0.18 // tab depth as a fraction of the shorter (height) dimension

// Baseline insets in objectBoundingBox units (box = cell + 2*tab on each axis).
const MY = TAB / (1 + 2 * TAB) // vertical inset
const MX = TAB / (CELL_ASPECT + 2 * TAB) // horizontal inset

// How far each tile-piece is expanded past its grid cell (CSS %, axis-aware).
export const INSET_TB = TAB * 100 // top/bottom: % of cell height
export const INSET_LR = (TAB / CELL_ASPECT) * 100 // left/right: % of cell width

const f = (n: number) => Number(n.toFixed(4))

/* ------------------------------------------------------------------ */
/*  Outer-corner rounding                                              */
/*                                                                     */
/*  Only the four outermost corners of the whole 2x4 grid get rounded  */
/*  (~12px, matching the card's border-radius). A corner is rounded    */
/*  iff both its adjacent edges are flat (sign 0) — which happens only  */
/*  at the grid's extreme corners. Because the tile SVG is drawn with  */
/*  preserveAspectRatio="none", a circular px radius maps to different  */
/*  object-unit radii on each axis, so we derive RX/RY separately from */
/*  a reference render size (everything scales proportionally).        */
/* ------------------------------------------------------------------ */
const RADIUS_PX = 12
const CARD_REF_W = 480 // max-width of .card-container
const PUZZLE_INSET = 0.86 // 1 - 2 * 7%
const cellWpx = (CARD_REF_W * PUZZLE_INSET) / COLS
const cellHpx = (((CARD_REF_W * 9) / 16) * PUZZLE_INSET) / ROWS
const pieceWpx = cellWpx * (1 + (2 * INSET_LR) / 100)
const pieceHpx = cellHpx * (1 + (2 * INSET_TB) / 100)
const RX = RADIUS_PX / pieceWpx
const RY = RADIUS_PX / pieceHpx

export type Edge = 1 | -1 | 0 // 1 = tab, -1 = slot, 0 = flat
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

const pt = (x: number, y: number) => `${f(x)} ${f(y)}`

function buildPath(t: Edge, r: Edge, b: Edge, l: Edge): string {
  // A corner rounds only when BOTH of its edges are flat — true only at
  // the four outermost corners of the whole grid.
  const rTL = t === 0 && l === 0
  const rTR = t === 0 && r === 0
  const rBR = b === 0 && r === 0
  const rBL = b === 0 && l === 0

  // Absolute corner coordinates (objectBoundingBox units).
  const TLx = MX,
    TLy = MY
  const TRx = 1 - MX,
    TRy = MY
  const BRx = 1 - MX,
    BRy = 1 - MY
  const BLx = MX,
    BLy = 1 - MY

  // Start on the top edge, just past the (possibly rounded) top-left corner.
  let d = `M ${pt(rTL ? TLx + RX : TLx, TLy)}`

  // Top edge -> top-right corner.
  if (t === 0) {
    d += ` L ${pt(rTR ? TRx - RX : TRx, TRy)}`
  } else {
    d += emitEdge('top', t)
  }
  if (rTR) d += ` Q ${pt(TRx, TRy)} ${pt(TRx, TRy + RY)}`

  // Right edge -> bottom-right corner.
  if (r === 0) {
    d += ` L ${pt(BRx, rBR ? BRy - RY : BRy)}`
  } else {
    d += emitEdge('right', r)
  }
  if (rBR) d += ` Q ${pt(BRx, BRy)} ${pt(BRx - RX, BRy)}`

  // Bottom edge -> bottom-left corner.
  if (b === 0) {
    d += ` L ${pt(rBL ? BLx + RX : BLx, BLy)}`
  } else {
    d += emitEdge('bottom', b)
  }
  if (rBL) d += ` Q ${pt(BLx, BLy)} ${pt(BLx, BLy - RY)}`

  // Left edge -> back toward the top-left corner.
  if (l === 0) {
    d += ` L ${pt(TLx, rTL ? TLy + RY : TLy)}`
  } else {
    d += emitEdge('left', l)
  }
  if (rTL) d += ` Q ${pt(TLx, TLy)} ${pt(TLx + RX, TLy)}`

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

export const TILE_PATHS = TILE_EDGES.map((e) => buildPath(e.t, e.r, e.b, e.l))
