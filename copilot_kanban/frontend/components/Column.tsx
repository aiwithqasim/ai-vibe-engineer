'use client'

import { useState } from 'react'
import { Column as ColumnType, useBoard } from '@/context/BoardContext'
import { Card } from './Card'
import styles from '@/styles/Column.module.css'

interface ColumnProps {
  column: ColumnType
  cards: any[]
}

export function Column({ column, cards }: ColumnProps) {
  const { updateColumnTitle, addCard } = useBoard()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(column.title)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [newCardDetails, setNewCardDetails] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const handleSaveTitle = () => {
    if (title.trim()) {
      updateColumnTitle(column.id, title)
    } else {
      setTitle(column.title)
    }
    setIsEditing(false)
  }

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      addCard(column.id, newCardTitle, newCardDetails)
      setNewCardTitle('')
      setNewCardDetails('')
      setShowAddForm(false)
    }
  }

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        {isEditing ? (
          <div className={styles.editTitle}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              autoFocus
              className={styles.titleInput}
            />
          </div>
        ) : (
          <h3 className={styles.title} onClick={() => setIsEditing(true)}>
            {column.title}
          </h3>
        )}
        <span className={styles.count}>{cards.length}</span>
      </div>

      <div className={styles.cardList}>
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>

      {showAddForm ? (
        <div className={styles.addForm}>
          <input
            type="text"
            placeholder="Card title"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            className={styles.input}
            autoFocus
          />
          <textarea
            placeholder="Details"
            value={newCardDetails}
            onChange={(e) => setNewCardDetails(e.target.value)}
            className={styles.textarea}
            rows={2}
          />
          <div className={styles.formButtons}>
            <button onClick={handleAddCard} className={styles.addBtn}>
              Add
            </button>
            <button onClick={() => setShowAddForm(false)} className={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className={styles.addCardBtn} onClick={() => setShowAddForm(true)}>
          + Add Card
        </button>
      )}
    </div>
  )
}
