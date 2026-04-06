import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatSidebar } from "@/components/ChatSidebar";
import { initialData, type BoardData } from "@/lib/kanban";

let lastBoard: BoardData | null = null;

beforeEach(() => {
  lastBoard = null;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      if (url.includes("/api/chat")) {
        const body = JSON.parse((init?.body as string) || "{}");
        const next: BoardData = structuredClone(initialData);
        next.columns[0].title = "From AI";
        lastBoard = next;
        return {
          ok: true,
          json: async () => ({
            message: "Renamed backlog.",
            mutations_applied: [{ type: "rename_column" }],
            board: next,
          }),
        };
      }
      return { ok: false, status: 404 };
    }) as typeof fetch
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ChatSidebar", () => {
  it("sends a message and shows assistant reply", async () => {
    const onBoard = vi.fn();
    render(
      <ChatSidebar
        open
        onClose={vi.fn()}
        onBoardSynced={onBoard}
      />
    );
    await userEvent.type(screen.getByLabelText("Message to AI"), "Rename backlog");
    await userEvent.click(screen.getByRole("button", { name: /^send$/i }));
    await waitFor(() => {
      expect(screen.getByText("Renamed backlog.")).toBeInTheDocument();
    });
    expect(onBoard).toHaveBeenCalled();
    expect(lastBoard?.columns[0].title).toBe("From AI");
  });
});
