import type { BoardData } from "@/lib/kanban";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ChatResponse = {
  message: string;
  mutations_applied: unknown[];
  board: BoardData;
};

async function parseBoard(res: Response): Promise<BoardData> {
  if (!res.ok) {
    throw new Error("Request failed");
  }
  const data = (await res.json()) as { board: BoardData };
  return data.board;
}

export async function fetchBoard(): Promise<BoardData> {
  const res = await fetch("/api/board", { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to load board");
  }
  return res.json() as Promise<BoardData>;
}

/** Full snapshot replace (bulk sync). */
export async function persistBoard(data: BoardData): Promise<void> {
  const res = await fetch("/api/board", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to save board");
  }
}

export async function renameColumn(
  columnId: string,
  title: string
): Promise<BoardData> {
  const res = await fetch(`/api/columns/${encodeURIComponent(columnId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ title }),
  });
  return parseBoard(res);
}

export async function createCard(
  columnId: string,
  title: string,
  details: string
): Promise<BoardData> {
  const res = await fetch("/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      column_id: columnId,
      title,
      details,
    }),
  });
  return parseBoard(res);
}

export async function patchCard(
  cardId: string,
  body: {
    title?: string;
    details?: string;
    column_id?: string;
    index?: number;
  }
): Promise<BoardData> {
  const res = await fetch(`/api/cards/${encodeURIComponent(cardId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return parseBoard(res);
}

export async function removeCard(cardId: string): Promise<BoardData> {
  const res = await fetch(`/api/cards/${encodeURIComponent(cardId)}`, {
    method: "DELETE",
    credentials: "include",
  });
  return parseBoard(res);
}

export async function sendChat(
  message: string,
  history: ChatTurn[]
): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Chat request failed");
  }
  return res.json() as Promise<ChatResponse>;
}
