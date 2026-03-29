"use client";
import dynamic from 'next/dynamic';
import styles from './page.module.css';

const Board = dynamic(
  () => import('@/components/Board/Board').then((mod) => mod.Board),
  { ssr: false }
);

export default function Home() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Kanban Pro</h1>
        <p className={styles.subtitle}>Manage your tasks with elegance.</p>
      </header>
      <div className={styles.boardContainer}>
        <Board />
      </div>
    </main>
  );
}
