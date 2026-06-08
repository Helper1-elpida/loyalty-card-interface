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
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          width: 100%;
          height: 100%;
          padding: 24px;
          box-sizing: border-box;
        }

        .tile-container {
          perspective: 1000px;
          position: relative;
        }

        .tile-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .tile-inner.unlocked {
          transform: rotateY(180deg);
        }

        .tile-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 2px solid rgba(0, 0, 0, 0.3);
          overflow: hidden;
          font-weight: 900;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: clamp(60px, 12vw, 120px);
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
                    <div className="tile-face tile-locked">{tile.letter}</div>
                    {/* Unlocked state */}
                    <div className="tile-face tile-unlocked">{tile.letter}</div>
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
