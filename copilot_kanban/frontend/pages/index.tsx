'use client'

import Head from 'next/head'
import { BoardProvider } from '@/context/BoardContext'
import { Board } from '@/components/Board'

export default function Home() {
  return (
    <>
      <Head>
        <title>Kanban — MVP</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <BoardProvider>
        <main className="page-root">
          <header className="site-header">
            <div>
              <h1>Kanban Board</h1>
              <p className="subtitle">Drag, add, edit, and delete cards</p>
            </div>
          </header>
          <Board />
        </main>
      </BoardProvider>
    </>
  )
}
