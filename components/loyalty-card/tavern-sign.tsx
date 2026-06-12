import styles from './loyalty-card.module.css'

const SIGN_WORD = 'tsundoku'
const SIGN_MEANING =
  'η συνήθεια να αγοράζεις βιβλία χωρίς ποτέ να τα διαβάζεις'

interface TavernSignProps {
  /** When true, the hinge + sign are revealed and the sign swings in. */
  open: boolean
}

export function TavernSign({ open }: TavernSignProps) {
  return (
    <div
      className={`${styles.signWrap} ${open ? styles.signWrapOpen : ''}`}
      aria-hidden={!open}
    >
      {/* Hinge: short dark-wood bar with two rivets */}
      <div className={styles.hinge}>
        <span className={styles.rivet} />
        <span className={styles.rivet} />
      </div>

      {/* Swinging wooden sign board */}
      <div className={styles.signBoard}>
        <span className={styles.signWord}>{SIGN_WORD}</span>
        <span className={styles.signMeaning}>{SIGN_MEANING}</span>
      </div>
    </div>
  )
}
