import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.homePage}>
      <h2 className={styles.welcome}>Welcome Raymond!</h2>
      <div className={styles.buttonContainer}>
        <Link
          href="/scraping"
          className={`${styles.button} ${styles.buttonBlack}`}
        >
          Manage Scraping
        </Link>
        <Link
          href="/embedding"
          className={`${styles.button} ${styles.buttonWhite}`}
        >
          Manage Embedding
        </Link>
      </div>
    </div>
  );
}
