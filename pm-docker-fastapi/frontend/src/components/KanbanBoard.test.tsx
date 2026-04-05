import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KanbanBoard } from "@/components/KanbanBoard";
import { initialData, type BoardData } from "@/lib/kanban";

let mockBoard: BoardData;

function applyMoveFromPatch(cardId: string, columnId: string, index: number) {
  for (const col of mockBoard.columns) {
    col.cardIds = col.cardIds.filter((id) => id !== cardId);
  }
  const target = mockBoard.columns.find((c) => c.id === columnId);
  if (!target) {
    return;
  }
  const next = [...target.cardIds];
  const pos = Math.max(0, Math.min(index, next.length));
  next.splice(pos, 0, cardId);
  target.cardIds = next;
}

beforeEach(() => {
  mockBoard = structuredClone(initialData);
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      const method = init?.method ?? "GET";

      if (url.includes("/api/board") && method === "GET") {
        return {
          ok: true,
          json: async () => structuredClone(mockBoard),
        };
      }

      if (url.includes("/api/board") && method === "PUT") {
        mockBoard = JSON.parse(init!.body as string) as BoardData;
        return { ok: true, json: async () => ({ ok: true }) };
      }

      const colPatch = url.match(/\/api\/columns\/([^/?]+)/);
      if (colPatch && method === "PATCH") {
        const columnId = decodeURIComponent(colPatch[1]);
        const { title } = JSON.parse(init!.body as string) as { title: string };
        mockBoard = {
          ...mockBoard,
          columns: mockBoard.columns.map((c) =>
            c.id === columnId ? { ...c, title } : c
          ),
        };
        return {
          ok: true,
          json: async () => ({ board: structuredClone(mockBoard) }),
        };
      }

      if (url.includes("/api/cards") && method === "POST") {
        const body = JSON.parse(init!.body as string) as {
          column_id: string;
          title: string;
          details: string;
        };
        const id = "card-mocknew";
        mockBoard = {
          ...mockBoard,
          cards: {
            ...mockBoard.cards,
            [id]: {
              id,
              title: body.title,
              details: body.details?.trim() || "No details yet.",
            },
          },
          columns: mockBoard.columns.map((c) =>
            c.id === body.column_id
              ? { ...c, cardIds: [...c.cardIds, id] }
              : c
          ),
        };
        return {
          ok: true,
          json: async () => ({ board: structuredClone(mockBoard) }),
        };
      }

      const cardPatch = url.match(/\/api\/cards\/([^/?]+)/);
      if (cardPatch && method === "PATCH") {
        const cardId = decodeURIComponent(cardPatch[1]);
        const body = JSON.parse(init!.body as string) as {
          column_id?: string;
          index?: number;
        };
        if (body.column_id !== undefined && body.index !== undefined) {
          applyMoveFromPatch(cardId, body.column_id, body.index);
        }
        return {
          ok: true,
          json: async () => ({ board: structuredClone(mockBoard) }),
        };
      }

      if (cardPatch && method === "DELETE") {
        const cardId = decodeURIComponent(cardPatch[1]);
        const { [cardId]: _, ...rest } = mockBoard.cards;
        mockBoard = {
          ...mockBoard,
          cards: rest,
          columns: mockBoard.columns.map((c) => ({
            ...c,
            cardIds: c.cardIds.filter((id) => id !== cardId),
          })),
        };
        return {
          ok: true,
          json: async () => ({ board: structuredClone(mockBoard) }),
        };
      }

      return { ok: false, status: 404, statusText: "Not Found" };
    }) as typeof fetch
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const getFirstColumn = () => screen.getAllByTestId(/column-/i)[0];

async function renderBoard() {
  render(<KanbanBoard />);
  await waitFor(() => {
    expect(screen.getAllByTestId(/column-/i)).toHaveLength(5);
  });
}

describe("KanbanBoard", () => {
  it("renders five columns", async () => {
    await renderBoard();
    expect(screen.getAllByTestId(/column-/i)).toHaveLength(5);
  });

  it("renames a column", async () => {
    await renderBoard();
    const column = getFirstColumn();
    const input = within(column).getByLabelText("Column title");
    await userEvent.clear(input);
    await userEvent.type(input, "New Name");
    expect(input).toHaveValue("New Name");
    await waitFor(
      () => {
        const first = mockBoard.columns[0];
        expect(first?.title).toBe("New Name");
      },
      { timeout: 3000 }
    );
  });

  it("adds and removes a card", async () => {
    await renderBoard();
    const column = getFirstColumn();
    const addButton = within(column).getByRole("button", {
      name: /add a card/i,
    });
    await userEvent.click(addButton);

    const titleInput = within(column).getByPlaceholderText(/card title/i);
    await userEvent.type(titleInput, "New card");
    const detailsInput = within(column).getByPlaceholderText(/details/i);
    await userEvent.type(detailsInput, "Notes");

    await userEvent.click(within(column).getByRole("button", { name: /add card/i }));

    await waitFor(() => {
      expect(within(column).getByText("New card")).toBeInTheDocument();
    });

    const deleteButton = within(column).getByRole("button", {
      name: /delete new card/i,
    });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(within(column).queryByText("New card")).not.toBeInTheDocument();
    });
  });
});
