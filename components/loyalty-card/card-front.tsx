import styles from './loyalty-card.module.css'

export function CardFront() {
  return (
    <div className={styles.logoWrap}>
      <div className={styles.logoContainer}>
        <div className={styles.logoThe}>the</div>
        <div className={styles.logoBollocks}>bollocks</div>
      </div>
      {/* SVG six-point asterisk replaces the emoji glyph (#4) for
          consistent cross-platform rendering. */}
      <svg
        className={styles.logoAsterisk}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2.5a1 1 0 0 1 1 1v6.27l5.43-3.14a1 1 0 1 1 1 1.74L15 11.5l5.43 3.13a1 1 0 1 1-1 1.74L13.99 13.23v6.27a1 1 0 1 1-2 0v-6.27l-5.43 3.14a1 1 0 0 1-1-1.74L11 11.5 5.57 8.37a1 1 0 1 1 1-1.74L12 9.77V3.5a1 1 0 0 1 1-1Z" />
      </svg>
    </div>
  )
}
