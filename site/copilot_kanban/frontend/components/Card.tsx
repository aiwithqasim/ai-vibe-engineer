'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card as CardType, useBoard } from '@/context/BoardContext'
import styles from '@/styles/Card.module.css'

interface CardProps {
  card: CardType
  columnId?: string
}

export function Card({ card, columnId }: CardProps) {
  const { deleteCard } = useBoard()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'Card', card },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    deleteCard(card.id)
  }

  return (
    <div ref={setNodeRef} style={style} className={styles.card} {...attributes}>
      <div className={styles.cardContent} {...listeners}>
        <div className={styles.header}>
          <h4 className={styles.title}>{card.title}</h4>
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            title="Delete card"
          >
            ×
          </button>
        </div>
        <p className={styles.details}>{card.details}</p>
      </div>
    </div>
  )
}
