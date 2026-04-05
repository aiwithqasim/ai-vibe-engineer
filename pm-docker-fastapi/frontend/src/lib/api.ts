import type { BoardData } from "@/lib/kanban";

export async function fetchBoard(): Promise<BoardData> {
  const res = await fetch("/api/board", { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to load board");
  }
  return res.json() as Promise<BoardData>;
}

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
