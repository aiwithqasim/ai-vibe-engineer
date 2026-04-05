# Frontend — Kanban Studio

## Overview

A Next.js 16 (App Router) frontend-only Kanban board. There is no backend or authentication yet; all state lives in React memory and resets on page reload. This serves as the visual and interaction baseline for the full-stack build.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16, App Router, TypeScript |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"` via PostCSS) |
| Drag and drop | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities |
| Utility | clsx |
| Unit / integration tests | Vitest 3 + @testing-library/react + jsdom |
| E2E tests | Playwright |

## Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css         # Tailwind entry, CSS design tokens
│   │   ├── layout.tsx          # Root layout, fonts (Space Grotesk, Manrope)
│   │   └── page.tsx            # Single route — renders <KanbanBoard />
│   ├── components/
│   │   ├── KanbanBoard.tsx     # Top-level board, all state, dnd-kit wiring
│   │   ├── KanbanBoard.test.tsx
│   │   ├── KanbanColumn.tsx    # Droppable column, sortable card list
│   │   ├── KanbanCard.tsx      # Sortable card with remove button
│   │   ├── KanbanCardPreview.tsx  # Static overlay shown while dragging
│   │   └── NewCardForm.tsx     # Inline add-card form per column
│   ├── lib/
│   │   ├── kanban.ts           # Types, initialData, moveCard, createId
│   │   └── kanban.test.ts      # Unit tests for moveCard
│   └── test/
│       ├── setup.ts            # @testing-library/jest-dom import
│       └── vitest.d.ts         # Type references
└── tests/
    └── kanban.spec.ts          # Playwright e2e: load, add card, drag
```

## Data Model

Defined in `src/lib/kanban.ts`.

```
BoardData
  columns: Column[]         # ordered list
    id: string
    title: string
    cardIds: string[]       # ordered card ids for this column

  cards: Record<string, Card>
    id: string
    title: string
    details: string
```

`initialData` seeds 5 columns (Backlog, In Progress, In Review, Done, Archived) and 8 cards. Column order and card order within columns are preserved by `cardIds` arrays.

## Key Components

### KanbanBoard
- `"use client"` component owning all board state via `useState<BoardData>`.
- Initialises from `initialData` (in-memory only).
- Configures `DndContext` with `PointerSensor` (6 px activation distance) and `closestCorners` collision detection.
- Delegates drag logic to `moveCard` from `lib/kanban.ts` on `onDragEnd`.
- Renders a `DragOverlay` using `KanbanCardPreview` for the active card.
- Exposes handlers: `handleRenameColumn`, `handleAddCard`, `handleDeleteCard`.

### KanbanColumn
- Uses `useDroppable` keyed on column id.
- Wraps cards in `SortableContext` with `verticalListSortingStrategy`.
- Renders a controlled `<input>` for column renaming.
- Shows empty-state text when `cardIds` is empty.
- `data-testid="column-{id}"`.

### KanbanCard
- Uses `useSortable` keyed on card id.
- Applies `CSS.Transform.toString(transform)` and transition from dnd-kit.
- Whole card acts as drag handle via spread `attributes` and `listeners`.
- Shows title, details, and a Remove button calling `onDelete`.
- `data-testid="card-{id}"`.

### KanbanCardPreview
- Renders card title and details without any sortable hooks.
- Used only inside `DragOverlay`.

### NewCardForm
- Collapsed state: "Add a card" button.
- Expanded state: title input (required), details textarea (optional), Add / Cancel.
- Calls `onAdd(title, details)` on submit; resets and collapses after.

## Pure Logic — `lib/kanban.ts`

`moveCard(columns, activeId, overId)`:
1. Locate source column (contains `activeId`).
2. If `overId` is a column id — move card to end of that column.
3. If `overId` is a card id and same column — reorder within column via splice.
4. If `overId` is a card id in a different column — insert at that position.

`createId(prefix)` — generates `"{prefix}-{Date.now()}"` for new card ids.

## Design Tokens (globals.css)

| Variable | Value | Use |
|---|---|---|
| `--color-accent` | `#ecad0a` | Accent lines, highlights |
| `--color-primary` | `#209dd7` | Links, key sections |
| `--color-secondary` | `#753991` | Submit buttons, important actions |
| `--color-navy` | `#032147` | Main headings |
| `--color-gray` | `#888888` | Supporting text, labels |

## Tests

Run unit tests:
```
npm run test:unit
```

Run e2e tests (requires dev server on port 3000):
```
npm run test:e2e
```

Run all:
```
npm run test:all
```

## What Is NOT Yet Implemented

- User sign-in / authentication
- Backend API integration
- Database persistence
- Card editing after creation (only add and delete)
- AI chat sidebar
