'use client'

import { useBoard } from '@/context/BoardContext'
import { SortableColumn } from './SortableColumn'
import styles from '@/styles/Board.module.css'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  Over,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState } from 'react'

export function Board() {
  const { board, moveCard } = useBoard()
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Display columns in a fixed order
  const columnOrder = ['col1', 'col2', 'col3', 'col4', 'col5']

  const findCardColumn = (cardId: string): string | null => {
    for (const colId of columnOrder) {
      if (board.columns[colId].cardIds.includes(cardId)) {
        return colId
      }
    }
    return null
  }

  const handleDragStart = (event: any) => {
    setDraggedCardId(event.active.id)
  }

  const handleDragOver = (event: DragOverEvent) => {
    // DnD logic is handled in handleDragEnd
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedCardId(null)

    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    if (activeId === overId) return

    // Get the current column of the card being dragged
    const fromColumnId = findCardColumn(activeId)
    if (!fromColumnId) return

    // Determine target column
    let toColumnId = fromColumnId
    let toIndex = board.columns[fromColumnId].cardIds.indexOf(activeId)

    // Check if drop target is a column
    if (columnOrder.includes(overId)) {
      toColumnId = overId
      toIndex = board.columns[toColumnId].cardIds.length
    } else if (columnOrder.some((colId) => board.columns[colId].cardIds.includes(overId))) {
      // Drop target is a card
      toColumnId = columnOrder.find((colId) =>
        board.columns[colId].cardIds.includes(overId)
      ) || fromColumnId

      const targetIndex = board.columns[toColumnId].cardIds.indexOf(overId)
      toIndex = targetIndex >= 0 ? targetIndex : board.columns[toColumnId].cardIds.length
    }

    moveCard(activeId, fromColumnId, toColumnId, toIndex)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.boardContainer}>
        <div className={styles.board}>
          {columnOrder.map((colId) => {
            const column = board.columns[colId]
            const columnCards = column.cardIds.map((cardId) => board.cards[cardId])
            return <SortableColumn key={colId} column={column} cards={columnCards} />
          })}
        </div>
      </div>
    </DndContext>
  )
}
