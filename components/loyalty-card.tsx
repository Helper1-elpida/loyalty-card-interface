'use client'

import { useState } from 'react'

export default function LoyaltyCard() {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-100 p-4">
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
            <div className="text-center opacity-50 text-sm">
              Loyalty Card Back
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
