"use client";
import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column } from '../Column/Column';
import { CardType, ColumnType } from '@/types/kanban';
import { initialColumns, initialCards } from '@/data/dummy';
import styles from './Board.module.css';
import { Card } from '../Card/Card';

export function Board() {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);
  const [cards, setCards] = useState<CardType[]>(initialCards);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { id } = active;
    const card = cards.find((c) => c.id === id);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveCard = active.data.current?.type === 'Card';
    const isOverCard = over.data.current?.type === 'Card';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveCard) return;

    if (isActiveCard && isOverCard) {
      setCards((cardsState) => {
        const activeIndex = cardsState.findIndex((c) => c.id === activeId);
        const overIndex = cardsState.findIndex((c) => c.id === overId);

        if (cardsState[activeIndex].columnId !== cardsState[overIndex].columnId) {
          const updatedCards = [...cardsState];
          updatedCards[activeIndex].columnId = cardsState[overIndex].columnId;
          return arrayMove(updatedCards, activeIndex, overIndex);
        }

        return arrayMove(cardsState, activeIndex, overIndex);
      });
    }

    if (isActiveCard && isOverColumn) {
      setCards((cardsState) => {
        const activeIndex = cardsState.findIndex((c) => c.id === activeId);
        
        if (cardsState[activeIndex].columnId !== overId) {
          const updatedCards = [...cardsState];
          updatedCards[activeIndex].columnId = overId as string;
          return arrayMove(updatedCards, activeIndex, activeIndex);
        }
        return cardsState;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveCard = active.data.current?.type === 'Card';
    if (!isActiveCard) return;

    setCards((cardsState) => {
      const activeIndex = cardsState.findIndex((c) => c.id === activeId);
      const overIndex = cardsState.findIndex((c) => c.id === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        return arrayMove(cardsState, activeIndex, overIndex);
      }
      return cardsState;
    });
  };

  const renameColumn = (columnId: string, title: string) => {
    setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, title } : c)));
  };

  const addCard = (columnId: string, title: string, description: string) => {
    const newCard: CardType = {
      id: `card-${Date.now()}`,
      columnId,
      title,
      description,
    };
    setCards((prev) => [...prev, newCard]);
  };

  const deleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  return (
    <div className={styles.board}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.columnsContainer}>
          {columns.map((col) => (
            <Column
              key={col.id}
              column={col}
              cards={cards.filter((c) => c.columnId === col.id)}
              onRename={renameColumn}
              onAddCard={addCard}
              onDeleteCard={deleteCard}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? <Card card={activeCard} onDelete={() => {}} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
