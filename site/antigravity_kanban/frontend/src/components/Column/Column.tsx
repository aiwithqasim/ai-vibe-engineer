"use client";
import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnType, CardType } from '@/types/kanban';
import { Card } from '../Card/Card';
import styles from './Column.module.css';

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  onRename: (columnId: string, newTitle: string) => void;
  onAddCard: (columnId: string, title: string, description: string) => void;
  onDeleteCard: (cardId: string) => void;
}

export function Column({ column, cards, onRename, onAddCard, onDeleteCard }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');

  const handleRename = () => {
    if (title.trim() && title !== column.title) {
      onRename(column.id, title.trim());
    } else {
      setTitle(column.title);
    }
    setIsEditing(false);
  };

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(column.id, newCardTitle.trim(), newCardDesc.trim());
      setNewCardTitle('');
      setNewCardDesc('');
      setIsAdding(false);
    }
  };

  return (
    <div className={`${styles.column} glass`} ref={setNodeRef}>
      <div className={styles.header}>
        {isEditing ? (
          <input
            autoFocus
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setTitle(column.title);
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <h3 className={styles.title} onClick={() => setIsEditing(true)} title="Click to rename">
            {column.title} <span className={styles.count}>{cards.length}</span>
          </h3>
        )}
      </div>

      <div className={styles.cardList}>
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <Card key={card.id} card={card} onDelete={onDeleteCard} />
          ))}
        </SortableContext>
      </div>

      {isAdding ? (
        <div className={styles.addCardForm}>
          <input
            autoFocus
            className={styles.input}
            placeholder="Task title..."
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
          />
          <textarea
            className={styles.textarea}
            placeholder="Details (optional)..."
            value={newCardDesc}
            onChange={(e) => setNewCardDesc(e.target.value)}
          />
          <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={handleAddCard}>Add</button>
            <button className={styles.btnSecondary} onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className={styles.addBtn} onClick={() => setIsAdding(true)}>
          + Add Card
        </button>
      )}
    </div>
  );
}
