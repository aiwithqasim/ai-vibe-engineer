'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'

export interface Card {
  id: string
  title: string
  details: string
}

export interface Column {
  id: string
  title: string
  cardIds: string[]
}

export interface Board {
  columns: Record<string, Column>
  cards: Record<string, Card>
}

interface BoardContextType {
  board: Board
  updateColumnTitle: (columnId: string, title: string) => void
  addCard: (columnId: string, title: string, details: string) => void
  deleteCard: (cardId: string) => void
  moveCard: (cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) => void
}

const BoardContext = createContext<BoardContextType | undefined>(undefined)

const INITIAL_BOARD: Board = {
  columns: {
    col1: { id: 'col1', title: 'To Do', cardIds: ['card1', 'card2'] },
    col2: { id: 'col2', title: 'In Progress', cardIds: ['card3'] },
    col3: { id: 'col3', title: 'In Review', cardIds: ['card4', 'card5'] },
    col4: { id: 'col4', title: 'Done', cardIds: ['card6'] },
    col5: { id: 'col5', title: 'Archived', cardIds: [] },
  },
  cards: {
    card1: { id: 'card1', title: 'Design homepage', details: 'Create mockups and wireframes for the main landing page' },
    card2: { id: 'card2', title: 'Setup database', details: 'Configure PostgreSQL and initial schema' },
    card3: { id: 'card3', title: 'Build API', details: 'Implement REST endpoints for board operations' },
    card4: { id: 'card4', title: 'Add authentication', details: 'Integrate JWT and OAuth providers' },
    card5: { id: 'card5', title: 'Write tests', details: 'Unit and integration tests for core features' },
    card6: { id: 'card6', title: 'Deploy to staging', details: 'Push to staging environment and verify' },
  },
}

export function BoardProvider({ children }: { children: ReactNode }) {
  const [board, setBoard] = useState<Board>(INITIAL_BOARD)

  const updateColumnTitle = (columnId: string, title: string) => {
    setBoard((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: { ...prev.columns[columnId], title },
      },
    }))
  }

  const addCard = (columnId: string, title: string, details: string) => {
    const newCardId = uuidv4()
    setBoard((prev) => ({
      cards: {
        ...prev.cards,
        [newCardId]: { id: newCardId, title, details },
      },
      columns: {
        ...prev.columns,
        [columnId]: {
          ...prev.columns[columnId],
          cardIds: [...prev.columns[columnId].cardIds, newCardId],
        },
      },
    }))
  }

  const deleteCard = (cardId: string) => {
    setBoard((prev) => {
      const { [cardId]: _, ...remainingCards } = prev.cards
      const newColumns = { ...prev.columns }
      Object.keys(newColumns).forEach((colId) => {
        newColumns[colId] = {
          ...newColumns[colId],
          cardIds: newColumns[colId].cardIds.filter((id) => id !== cardId),
        }
      })
      return { cards: remainingCards, columns: newColumns }
    })
  }

  const moveCard = (cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) => {
    setBoard((prev) => {
      const fromColumn = prev.columns[fromColumnId]
      const toColumn = prev.columns[toColumnId]
      const newFromCardIds = fromColumn.cardIds.filter((id) => id !== cardId)
      const newToCardIds = [...toColumn.cardIds]
      newToCardIds.splice(toIndex, 0, cardId)

      return {
        ...prev,
        columns: {
          ...prev.columns,
          [fromColumnId]: { ...fromColumn, cardIds: newFromCardIds },
          [toColumnId]: { ...toColumn, cardIds: newToCardIds },
        },
      }
    })
  }

  return (
    <BoardContext.Provider value={{ board, updateColumnTitle, addCard, deleteCard, moveCard }}>
      {children}
    </BoardContext.Provider>
  )
}

export function useBoard() {
  const context = useContext(BoardContext)
  if (!context) throw new Error('useBoard must be used inside BoardProvider')
  return context
}
