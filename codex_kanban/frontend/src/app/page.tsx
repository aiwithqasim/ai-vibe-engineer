"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  addCardToColumn,
  createInitialBoard,
  deleteCardFromColumn,
  KanbanColumn,
  moveCard,
  renameColumn,
} from "../lib/kanban";
import styles from "./page.module.css";

type SortableCardProps = {
  column: KanbanColumn;
  cardId: string;
  title: string;
  details: string;
  onDelete: (columnId: string, cardId: string) => void;
};

const SortableCard = ({
  column,
  cardId,
  title,
  details,
  onDelete,
}: SortableCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: cardId,
      data: {
        type: "card",
        columnId: column.id,
        cardId,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={clsx(styles.card, isDragging && styles.dragging)}
      data-testid={`card-${cardId}`}
      {...attributes}
      {...listeners}
    >
      <h3>{title}</h3>
      <p>{details}</p>
      <button
        className={styles.deleteButton}
        type="button"
        onClick={() => onDelete(column.id, cardId)}
      >
        Delete
      </button>
    </article>
  );
};

type ColumnDropZoneProps = {
  columnId: string;
};

const ColumnDropZone = ({ columnId }: ColumnDropZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-drop-${columnId}`,
    data: {
      type: "column",
      columnId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      data-testid={`column-drop-${columnId}`}
      className={clsx(styles.dropZone, isOver && styles.dropZoneOver)}
    />
  );
};

export default function Home() {
  const initialBoard = useMemo(() => createInitialBoard(), []);
  const [board, setBoard] = useState(initialBoard);
  const [draftCards, setDraftCards] = useState<Record<string, { title: string; details: string }>>(
    () =>
      initialBoard.columns.reduce<Record<string, { title: string; details: string }>>(
        (acc, column) => {
          acc[column.id] = { title: "", details: "" };
          return acc;
        },
        {},
      ),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const totalCards = useMemo(
    () => board.columns.reduce((count, column) => count + column.cards.length, 0),
    [board.columns],
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const activeType = active.data.current?.type as string | undefined;
    const overType = over.data.current?.type as string | undefined;

    if (activeType !== "card") {
      return;
    }

    const cardId = active.data.current?.cardId as string | undefined;
    if (!cardId) {
      return;
    }

    if (overType === "card") {
      const destinationColumnId = over.data.current?.columnId as string | undefined;
      const beforeCardId = over.data.current?.cardId as string | undefined;
      if (!destinationColumnId || !beforeCardId) {
        return;
      }

      setBoard((current) => moveCard(current, cardId, destinationColumnId, beforeCardId));
      return;
    }

    if (overType === "column") {
      const destinationColumnId = over.data.current?.columnId as string | undefined;
      if (!destinationColumnId) {
        return;
      }

      setBoard((current) => moveCard(current, cardId, destinationColumnId));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.backdropA} />
      <div className={styles.backdropB} />
      <main className={styles.main}>
        <header className={styles.header}>
          <p className={styles.overline}>Single Board MVP</p>
          <h1>Project Flow</h1>
          <p className={styles.subtitle}>
            One elegant board, five renameable columns, and frictionless card movement.
          </p>
          <div className={styles.meta}>
            <span>{board.columns.length} columns</span>
            <span>{totalCards} cards</span>
          </div>
        </header>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <section className={styles.board} aria-label="Kanban board">
            {board.columns.map((column) => (
              <section
                key={column.id}
                className={styles.column}
                data-testid={`column-${column.id}`}
              >
                <div className={styles.columnHeader}>
                  <label htmlFor={`column-name-${column.id}`}>Column Name</label>
                  <input
                    id={`column-name-${column.id}`}
                    value={column.name}
                    onChange={(event) =>
                      setBoard((current) =>
                        renameColumn(current, column.id, event.target.value),
                      )
                    }
                    maxLength={40}
                    className={styles.columnName}
                    data-testid={`column-name-${column.id}`}
                  />
                </div>

                <div className={styles.cardStack}>
                  <SortableContext
                    items={column.cards.map((card) => card.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {column.cards.map((card) => (
                      <SortableCard
                        key={card.id}
                        column={column}
                        cardId={card.id}
                        title={card.title}
                        details={card.details}
                        onDelete={(columnId, cardIdToDelete) =>
                          setBoard((current) =>
                            deleteCardFromColumn(current, columnId, cardIdToDelete),
                          )
                        }
                      />
                    ))}
                  </SortableContext>
                  <ColumnDropZone columnId={column.id} />
                </div>

                <form
                  className={styles.cardComposer}
                  onSubmit={(event) => {
                    event.preventDefault();

                    const draft = draftCards[column.id];
                    setBoard((current) =>
                      addCardToColumn(current, column.id, draft.title, draft.details),
                    );
                    setDraftCards((current) => ({
                      ...current,
                      [column.id]: { title: "", details: "" },
                    }));
                  }}
                >
                  <input
                    placeholder="Card title"
                    value={draftCards[column.id]?.title ?? ""}
                    onChange={(event) =>
                      setDraftCards((current) => ({
                        ...current,
                        [column.id]: {
                          title: event.target.value,
                          details: current[column.id]?.details ?? "",
                        },
                      }))
                    }
                    data-testid={`new-card-title-${column.id}`}
                    maxLength={80}
                  />
                  <textarea
                    placeholder="Card details"
                    value={draftCards[column.id]?.details ?? ""}
                    onChange={(event) =>
                      setDraftCards((current) => ({
                        ...current,
                        [column.id]: {
                          title: current[column.id]?.title ?? "",
                          details: event.target.value,
                        },
                      }))
                    }
                    data-testid={`new-card-details-${column.id}`}
                    rows={3}
                    maxLength={220}
                  />
                  <button type="submit" data-testid={`add-card-${column.id}`}>
                    Add Card
                  </button>
                </form>
              </section>
            ))}
          </section>
        </DndContext>
      </main>
    </div>
  );
}
