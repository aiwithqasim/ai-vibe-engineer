"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { ChatSidebar } from "@/components/ChatSidebar";
import { KanbanColumn } from "@/components/KanbanColumn";
import { KanbanCardPreview } from "@/components/KanbanCardPreview";
import {
  createCard,
  fetchBoard,
  patchCard,
  removeCard,
  renameColumn,
} from "@/lib/api";
import { findCardPlacement, moveCard, type BoardData } from "@/lib/kanban";
import { logout } from "@/lib/session";

const RENAME_DEBOUNCE_MS = 450;

export const KanbanBoard = () => {
  const [board, setBoard] = useState<BoardData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const renameTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );
  const [chatOpen, setChatOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchBoard();
        if (!cancelled) {
          setBoard(data);
          setLoadError(null);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Could not load your board.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(renameTimers.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  const cardsById = useMemo(
    () => (board ? board.cards : {}),
    [board]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);

    if (!over || active.id === over.id || !board) {
      return;
    }

    const activeId = active.id as string;
    const next = {
      ...board,
      columns: moveCard(board.columns, activeId, over.id as string),
    };
    const placement = findCardPlacement(next, activeId);
    if (!placement) {
      return;
    }

    setBoard(next);
    void (async () => {
      try {
        setSaveError(null);
        const updated = await patchCard(activeId, {
          column_id: placement.columnId,
          index: placement.index,
        });
        setBoard(updated);
      } catch {
        setSaveError("Could not save changes. Check your connection.");
        try {
          setBoard(await fetchBoard());
        } catch {
          /* ignore */
        }
      }
    })();
  };

  const handleRenameColumn = (columnId: string, title: string) => {
    setBoard((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        columns: prev.columns.map((c) =>
          c.id === columnId ? { ...c, title } : c
        ),
      };
    });

    const prevTimer = renameTimers.current[columnId];
    if (prevTimer) {
      clearTimeout(prevTimer);
    }
    renameTimers.current[columnId] = setTimeout(() => {
      void (async () => {
        try {
          setSaveError(null);
          const updated = await renameColumn(columnId, title);
          setBoard(updated);
        } catch {
          setSaveError("Could not save changes. Check your connection.");
          try {
            setBoard(await fetchBoard());
          } catch {
            /* ignore */
          }
        }
        delete renameTimers.current[columnId];
      })();
    }, RENAME_DEBOUNCE_MS);
  };

  const handleAddCard = (columnId: string, title: string, details: string) => {
    void (async () => {
      try {
        setSaveError(null);
        const updated = await createCard(columnId, title, details);
        setBoard(updated);
      } catch {
        setSaveError("Could not save changes. Check your connection.");
      }
    })();
  };

  const handleDeleteCard = (_columnId: string, cardId: string) => {
    void (async () => {
      try {
        setSaveError(null);
        const updated = await removeCard(cardId);
        setBoard(updated);
      } catch {
        setSaveError("Could not save changes. Check your connection.");
      }
    })();
  };

  const activeCard = activeCardId ? cardsById[activeCardId] : null;

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 font-body text-sm text-red-600">
        {loadError}
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex min-h-screen items-center justify-center font-body text-sm text-[var(--gray-text)]">
        Loading
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-x-hidden">
      {saveError ? (
        <div className="absolute left-1/2 top-4 z-20 max-w-lg -translate-x-1/2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-800">
          {saveError}
        </div>
      ) : null}
      <div className="pointer-events-none absolute left-0 top-0 h-[420px] w-[420px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,_rgba(32,157,215,0.25)_0%,_rgba(32,157,215,0.05)_55%,_transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[520px] w-[520px] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,_rgba(117,57,145,0.18)_0%,_rgba(117,57,145,0.05)_55%,_transparent_75%)]" />

      <div className="relative z-0 flex min-h-screen min-w-0 flex-1">
        <main
          className={`relative flex min-h-0 min-w-0 flex-1 flex-col gap-10 self-stretch px-6 pb-8 pt-12 ${
            chatOpen
              ? "w-full max-w-none"
              : "mx-auto max-w-[1500px]"
          }`}
        >
        <header className="shrink-0 flex flex-col gap-6 rounded-[32px] border border-[var(--stroke)] bg-white/80 p-8 shadow-[var(--shadow)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--gray-text)]">
                Single Board Kanban
              </p>
              <h1 className="mt-3 font-display text-4xl font-semibold text-[var(--navy-dark)]">
                Kanban Studio
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--gray-text)]">
                Keep momentum visible. Rename columns, drag cards between stages,
                and capture quick notes without getting buried in settings.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-3">
              {!chatOpen ? (
                <button
                  type="button"
                  onClick={() => setChatOpen(true)}
                  className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--navy-dark)] transition hover:border-[var(--accent-yellow)] hover:text-[var(--primary-blue)]"
                >
                  AI chat
                </button>
              ) : null}
              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--gray-text)]">
                  Focus
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--primary-blue)]">
                  One board. Five columns. Zero clutter.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--navy-dark)] transition hover:border-[var(--primary-blue)] hover:text-[var(--primary-blue)]"
              >
                Log out
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {board.columns.map((column) => (
              <div
                key={column.id}
                className="flex items-center gap-2 rounded-full border border-[var(--stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--navy-dark)]"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--accent-yellow)]" />
                {column.title}
              </div>
            ))}
          </div>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex min-h-0 flex-col lg:min-h-0 lg:flex-1">
            <section className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:auto-rows-[minmax(0,1fr)] lg:grid-cols-5">
              {board.columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  cards={column.cardIds.map((cardId) => board.cards[cardId])}
                  onRename={handleRenameColumn}
                  onAddCard={handleAddCard}
                  onDeleteCard={handleDeleteCard}
                />
              ))}
            </section>
          </div>
          <DragOverlay>
            {activeCard ? (
              <div className="w-[260px]">
                <KanbanCardPreview card={activeCard} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        </main>
        <ChatSidebar
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          onBoardSynced={(b) => {
            setBoard(b);
            setSaveError(null);
          }}
        />
      </div>
    </div>
  );
};
