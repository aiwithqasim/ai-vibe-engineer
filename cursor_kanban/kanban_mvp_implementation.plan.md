---
name: Kanban MVP Implementation
overview: Build a complete NextJS Kanban board application with drag-and-drop, card management, and elegant UI using the specified color scheme. Include project scaffolding, unit tests, and Playwright integration tests.
todos:
  - id: scaffold-project
    content: Create NextJS app in frontend/ directory with TypeScript, configure .gitignore, install dependencies (Next.js, React, @dnd-kit, Jest, React Testing Library, Playwright)
    status: completed
  - id: define-types
    content: Create TypeScript types for Card, Column, and Board in frontend/types/index.ts
    status: completed
    dependencies:
      - scaffold-project
  - id: create-dummy-data
    content: Implement dummy data generator function in frontend/lib/utils.ts with 5 columns and 2-3 cards per column
    status: completed
    dependencies:
      - define-types
  - id: setup-styling
    content: Create globals.css with color scheme variables and base styles in frontend/app/globals.css
    status: completed
    dependencies:
      - scaffold-project
  - id: build-card-component
    content: Create Card component with title, details, and delete button in frontend/components/Card.tsx
    status: completed
    dependencies:
      - define-types
      - setup-styling
  - id: build-column-component
    content: Create Column component with rename functionality and card list in frontend/components/Column.tsx
    status: completed
    dependencies:
      - build-card-component
  - id: build-add-card-form
    content: Create AddCardForm component for adding new cards in frontend/components/AddCardForm.tsx
    status: completed
    dependencies:
      - define-types
      - setup-styling
  - id: build-board-component
    content: Create Board component that manages state and renders 5 columns in frontend/components/Board.tsx
    status: completed
    dependencies:
      - build-column-component
      - build-add-card-form
  - id: implement-drag-drop
    content: Integrate @dnd-kit for drag-and-drop functionality in Board and Card components
    status: completed
    dependencies:
      - build-board-component
  - id: create-main-page
    content: Create main page.tsx that initializes board with dummy data and renders Board component
    status: completed
    dependencies:
      - implement-drag-drop
  - id: write-unit-tests
    content: Write unit tests for utils, Card, Column, and Board components using Jest and React Testing Library
    status: completed
    dependencies:
      - create-main-page
  - id: write-integration-tests
    content: Write Playwright E2E tests covering add card, delete card, move card, and rename column workflows
    status: completed
    dependencies:
      - write-unit-tests
  - id: polish-ui
    content: Polish UI/UX, ensure color scheme is applied correctly, verify all interactions are smooth
    status: completed
    dependencies:
      - write-integration-tests
  - id: update-readme
    content: Update README.md with minimal setup and run instructions
    status: completed
    dependencies:
      - polish-ui
---

# Kanban MVP Implementation Plan

## Overview

Build a client-rendered NextJS Kanban application with a single board containing 5 renameable columns, drag-and-drop card movement, and card add/delete functionality. The app will use a modern UI with the specified color scheme and include comprehensive testing.

## Architecture

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main board page
│   └── globals.css        # Global styles with color scheme
├── components/
│   ├── Board.tsx          # Main board container
│   ├── Column.tsx         # Individual column component
│   ├── Card.tsx           # Card component
│   ├── AddCardForm.tsx    # Form to add new cards
│   └── RenameColumn.tsx   # Column rename functionality
├── lib/
│   └── utils.ts           # Utility functions (dummy data, card operations)
├── types/
│   └── index.ts           # TypeScript types (Card, Column, Board)
└── __tests__/             # Unit tests
```

## Implementation Phases

### Phase 1: Project Scaffolding

**Success Criteria:**

- NextJS app created in `frontend/` directory
- `.gitignore` configured for Node.js/Next.js
- TypeScript configured
- Dependencies installed (Next.js, React, drag-and-drop library, testing libraries)
- Project structure matches architecture above

**Key Files:**

- `frontend/package.json` - Dependencies and scripts
- `frontend/.gitignore` - Ignore node_modules, .next, etc.
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/next.config.js` - Next.js configuration (client-side rendering)

### Phase 2: Core Data Models & Types

**Success Criteria:**

- TypeScript types defined for Card, Column, and Board
- Dummy data generator function created
- Types exported and ready for use

**Key Files:**

- `frontend/types/index.ts` - Type definitions
- `frontend/lib/utils.ts` - Dummy data generation

### Phase 3: UI Components

**Success Criteria:**

- All components render correctly
- Color scheme applied throughout
- Responsive layout
- Cards display title and details
- Columns display with rename capability
- Add card form functional
- Delete button visible on cards

**Key Files:**

- `frontend/components/Board.tsx` - Main board with 5 columns
- `frontend/components/Column.tsx` - Column with rename and card list
- `frontend/components/Card.tsx` - Card with title, details, delete button
- `frontend/components/AddCardForm.tsx` - Form to add new cards
- `frontend/components/RenameColumn.tsx` - Inline column renaming
- `frontend/app/globals.css` - Global styles with color variables

### Phase 4: Drag and Drop

**Success Criteria:**

- Cards can be dragged between columns
- Visual feedback during drag (opacity, cursor)
- Cards update position correctly
- State persists during session (no persistence to storage)

**Key Files:**

- `frontend/components/Board.tsx` - Drag and drop handlers
- `frontend/components/Card.tsx` - Draggable card implementation

**Library Choice:** `@dnd-kit/core` and `@dnd-kit/sortable` (modern, accessible, popular)

### Phase 5: State Management

**Success Criteria:**

- Board state managed with React hooks
- Card operations (add, delete, move) update state correctly
- Column rename updates state
- State initialized with dummy data on mount

**Key Files:**

- `frontend/app/page.tsx` - Main page with state management
- `frontend/components/Board.tsx` - State handlers

### Phase 6: Unit Testing

**Success Criteria:**

- Unit tests for utility functions
- Component tests for Card, Column, Board
- Test coverage for add, delete, rename, move operations
- All tests passing

**Key Files:**

- `frontend/__tests__/utils.test.ts`
- `frontend/__tests__/Card.test.tsx`
- `frontend/__tests__/Column.test.tsx`
- `frontend/__tests__/Board.test.tsx`

**Testing Library:** Jest + React Testing Library

### Phase 7: Integration Testing

**Success Criteria:**

- Playwright tests for full user workflows
- Tests cover: add card, delete card, move card, rename column
- Tests verify UI interactions and state changes
- All integration tests passing

**Key Files:**

- `frontend/e2e/board.spec.ts` - Playwright test suite

### Phase 8: Polish & Finalization

**Success Criteria:**

- App runs with `npm run dev`
- Dummy data loads on initial render
- All features working smoothly
- UI is polished and professional
- No console errors
- README updated with minimal setup instructions

**Key Files:**

- `frontend/README.md` - Setup and run instructions
- All component files - Final polish

## Technical Decisions

1. **Drag and Drop Library:** `@dnd-kit` - Modern, accessible, TypeScript-friendly
2. **Styling:** CSS Modules or Tailwind CSS (to be decided based on simplicity)
3. **State Management:** React useState/useReducer (no external state library needed for MVP)
4. **Client Rendering:** Next.js with `'use client'` directives where needed
5. **Testing:** Jest + React Testing Library for unit tests, Playwright for E2E

## Color Scheme Implementation

- Accent Yellow (`#ecad0a`): Drag handles, hover states, highlights
- Blue Primary (`#209dd7`): Links, column headers
- Purple Secondary (`#753991`): Submit buttons, primary actions
- Dark Navy (`#032147`): Main headings, board title
- Gray Text (`#888888`): Supporting text, labels, placeholders

## Dummy Data Structure

Initial board will have 5 columns with 2-3 cards each, demonstrating various states and content lengths.