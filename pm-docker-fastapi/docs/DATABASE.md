# Database design (target schema)

This document describes the **normalized** SQLite layout planned for multi-user, multi-board support. The running MVP still stores the whole board as **one JSON row** in `board_state` (see `backend/database.py` and `docs/PLAN.md` Part 5 implementation note).

## Goals

- Support **multiple users** with distinct data.
- Support **multiple boards per user** without schema churn later.
- Keep **column order** and **card order within columns** explicit (no implicit array ordering in JSON at rest).

## Tables

### `users`

- Primary key `id`.
- `username` unique, `password_hash` for future real auth (MVP may keep JWT + hardcoded user until migration).

### `boards`

- Scoped with `user_id` foreign key to `users`.
- `title` for display; default board can be created on first login.

### `columns`

- `board_id` references `boards`.
- Stable string `id` (matches current frontend column ids such as `col-backlog`) or integer PK with separate `slug`; the JSON schema file uses **text PK** to align with existing client ids during migration.
- `position` integer for left-to-right order on the board.

### `cards`

- `column_id` references `columns`.
- `title`, `details` mirror the current card model.
- `position` integer for order inside the column.

## Migration path from MVP

1. Add tables alongside `board_state`.
2. For each user/board, read JSON snapshot and insert rows into `columns` / `cards` with computed `position` from `cardIds` order.
3. Switch API reads/writes to SQL (or SQLAlchemy) and drop or archive `board_state`.

## Reference

Machine-readable outline: **`schema.json`** in this directory.
