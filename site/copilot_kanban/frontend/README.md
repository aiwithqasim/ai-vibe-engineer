# Kanban Board MVP

A minimal, elegant single-board Kanban project management application built with Next.js, React 18, and TypeScript.

## Features

- **5 Fixed Columns**: To Do, In Progress, In Review, Done, Archived
- **Editable Column Titles**: Click on any column header to rename it
- **Card Management**: Add cards with title and details; delete cards with one click
- **Drag & Drop**: Reorder cards within columns or move between columns using @dnd-kit
- **Dummy Data**: Pre-populated cards on app load
- **Responsive UI**: Beautiful, professional design with smooth animations
- **In-Memory State**: No persistence; state resets on page reload

## Tech Stack

- **Next.js 14** — React framework with built-in optimizations
- **React 18** — UI library
- **TypeScript** — Type-safe development
- **@dnd-kit** — Accessible drag-and-drop primitives
- **Jest & React Testing Library** — Unit tests
- **Playwright** — End-to-end tests

## Color Scheme

- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991`
- Dark Navy: `#032147`
- Gray Text: `#888888`

## Setup

### Prerequisites

- Node.js 18+ (or v25.8.1)
- npm 11+

### Installation

```bash
cd frontend
npm install
```

## Running the App

### Development Server

```bash
npm run dev
```

Opens on http://localhost:3000 (or http://localhost:3001 if port 3000 is busy).

### Production Build

```bash
npm run build
npm start
```

## Testing

### Unit Tests

```bash
npm test              # Watch mode
npm run test:ci       # CI mode with coverage
```

All unit tests pass. Coverage includes BoardContext logic, column renaming, card CRUD operations.

### End-to-End Tests

```bash
npm run e2e           # Headless mode
npm run e2e:ui        # Interactive UI mode
npm run e2e:debug     # Debug mode with inspector
```

E2E tests cover:
- Loading with 5 columns and dummy data
- Renaming columns
- Adding cards
- Deleting cards
- Dragging cards between columns
- Card count updates
- Multi-step workflows

## Project Structure

```
frontend/
├── components/
│   ├── Board.tsx              # Main board component with DnD context
│   ├── SortableColumn.tsx      # Draggable column wrapper
│   └── Card.tsx               # Card with drag & delete
├── context/
│   └── BoardContext.tsx        # Global state management
├── pages/
│   ├── _app.tsx               # App wrapper with BoardProvider
│   └── index.tsx              # Homepage
├── styles/
│   ├── globals.css            # Global styles & color tokens
│   ├── Board.module.css       # Board layout styles
│   ├── Column.module.css      # Column & add-card form styles
│   └── Card.module.css        # Card styles
├── e2e/
│   └── kanban.spec.ts         # Playwright tests
├── __tests__/
│   └── BoardContext.test.tsx  # Jest unit tests
├── package.json
├── tsconfig.json
├── jest.config.js
├── playwright.config.ts
└── README.md
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests (watch) |
| `npm run test:ci` | Run Jest tests with coverage |
| `npm run e2e` | Run Playwright tests |
| `npm run e2e:ui` | Run Playwright tests in UI mode |

## Usage

1. **Add a Card**: Click "+ Add Card" in any column, fill in title and details, click Add.
2. **Delete a Card**: Click the "×" button on a card.
3. **Rename a Column**: Click the column title to inline-edit, then press Enter or click away.
4. **Move a Card**: Drag any card to reorder within a column or drop into another column.

## Browser Support

- Chrome/Chromium (tested)
- Edge (compatible)
- Firefox (compatible)

## Notes

- No backend or database; all state is in-memory.
- Refresh resets the board to dummy data.
- Keyboard navigation is supported via @dnd-kit defaults.
- Accessibility features: focus states, color contrast, ARIA labels.

## License

MIT
