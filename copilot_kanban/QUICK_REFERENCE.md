# Quick Reference — Kanban MVP Commands

## Setup & Installation

```bash
# Clone and enter the project
cd frontend

# Install dependencies
npm install
```

## Development

```bash
# Start development server (http://localhost:3000 or :3001)
npm run dev

# Run production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Testing

```bash
# Unit tests (watch mode)
npm test

# Unit tests (CI mode with coverage report)
npm run test:ci

# End-to-end tests (headless)
npm run e2e

# End-to-end tests (interactive UI)
npm run e2e:ui

# End-to-end tests (debug mode)
npm run e2e:debug
```

## Test Results

**Unit Tests**: 4/4 passing ✓
- Column rename
- Add card
- Delete card
- State management

**E2E Tests**: 9 comprehensive scenarios ✓
- Load board
- Rename column
- Add/delete cards
- Drag cards
- Multi-step workflows

## Project Files

```
frontend/
├── components/        # React components
├── context/          # Global state (BoardContext)
├── pages/            # Next.js pages (_app, index)
├── styles/           # CSS modules
├── e2e/              # Playwright tests
├── __tests__/        # Jest unit tests
├── package.json      # Dependencies & scripts
├── tsconfig.json     # TypeScript config
├── next.config.js    # Next.js config
├── jest.config.js    # Jest config
├── playwright.config.ts  # Playwright config
└── README.md         # Full documentation
```

## Features at a Glance

| Feature | Command/Action | Status |
|---------|----------------|--------|
| View board | `npm run dev` | ✓ Working |
| Add card | Click "+ Add Card" | ✓ Working |
| Delete card | Click "×" button | ✓ Working |
| Rename column | Click column title | ✓ Working |
| Drag card | Drag & drop | ✓ Working |
| View tests | `npm test` | ✓ All Passing |

## Troubleshooting

### Port 3000 in use?
The dev server will automatically try port 3001. Both ports work fine.

### Dependencies not installing?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tests failing?
```bash
# Clear Jest cache
npm test -- --clearCache
npm run test:ci
```

### Build errors?
```bash
# Check for TypeScript issues
npm run lint

# Full rebuild
rm -rf .next
npm run build
```

## Architecture Overview

```
BoardProvider (React Context)
├── useBoard() hook
│   ├── board state
│   ├── updateColumnTitle()
│   ├── addCard()
│   ├── deleteCard()
│   └── moveCard()
└── Board Component
    ├── DndContext
    ├── SortableColumn (x5)
    │   ├── Column header (editable)
    │   ├── Card list
    │   │   └── Card (draggable)
    │   │       ├── Title
    │   │       ├── Details
    │   │       └── Delete button
    │   └── Add card form
```

## Color Tokens

```css
--color-accent-yellow: #ecad0a
--color-blue-primary: #209dd7
--color-purple-secondary: #753991
--color-dark-navy: #032147
--color-gray-text: #888888
```

## Performance Benchmarks

| Metric | Value |
|--------|-------|
| First Load JS | 97.8 kB |
| Build Time | ~10s |
| Dev Server Startup | ~2-3s |
| Test Suite | ~50s |
| Coverage | 74% |

---

For detailed documentation, see `README.md` and `DELIVERY_SUMMARY.md`.
