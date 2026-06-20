import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <h1 className={styles.code}>404</h1>
        <div className={styles.separator} aria-hidden="true" />
        <h2 className={styles.heading}>Page not found</h2>
        <p className={styles.description}>
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved. Let&apos;s get you back on track.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.btnPrimary}>
            Go home
          </Link>
          <Link href="/" className={styles.btnSecondary}>
            Browse jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
