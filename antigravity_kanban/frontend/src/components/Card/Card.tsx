"use client";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardType } from '@/types/kanban';
import styles from './Card.module.css';

interface CardProps {
  card: CardType;
  onDelete: (id: string) => void;
}

export function Card({ card, onDelete }: CardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'Card',
      card,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`${styles.card} ${styles.draggingPlaceholder}`}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} glass`}
      {...attributes}
      {...listeners}
    >
      <div className={styles.header}>
        <h4 className={styles.title}>{card.title}</h4>
        <button 
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          title="Delete Card"
        >
          ×
        </button>
      </div>
      {card.description && <p className={styles.description}>{card.description}</p>}
    </div>
  );
}
