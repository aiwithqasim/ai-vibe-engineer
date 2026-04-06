"use client";

import { useEffect, useRef, useState } from "react";
import type { BoardData } from "@/lib/kanban";
import { sendChat, type ChatTurn } from "@/lib/api";

type ChatSidebarProps = {
  open: boolean;
  onClose: () => void;
  onBoardSynced: (board: BoardData) => void;
};

export function ChatSidebar({
  open,
  onClose,
  onBoardSynced,
}: ChatSidebarProps) {
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const el = messagesRef.current;
    if (!el) {
      return;
    }
    el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) {
      return;
    }
    setError(null);
    setInput("");
    const userTurn: ChatTurn = { role: "user", content: text };
    const nextHistory = [...messages, userTurn];
    setMessages(nextHistory);
    setLoading(true);
    try {
      const data = await sendChat(text, messages);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
      if (data.mutations_applied?.length) {
        onBoardSynced(data.board);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      setError(msg);
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside
      className="sticky top-0 z-10 flex h-screen min-h-0 w-[min(100%,22rem)] shrink-0 flex-col border-l border-[var(--stroke)] bg-gradient-to-b from-[var(--surface-strong)] to-[var(--surface)] shadow-[-12px_0_32px_-8px_rgba(3,33,71,0.08)] sm:w-[min(100%,24rem)]"
      aria-label="AI chat"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--stroke)]/80 bg-[var(--navy-dark)] px-4 py-3.5 text-white">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--accent-yellow)] shadow-[0_0_0_3px_rgba(236,173,10,0.25)]"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold tracking-wide">
              AI assistant
            </p>
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-white/55">
              Board-aware help
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/85 transition hover:bg-white/12 hover:text-white"
        >
          Close
        </button>
      </header>

      <div
        ref={messagesRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-4"
      >
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--stroke)] bg-white/60 px-4 py-6 text-center">
            <p className="text-sm font-medium text-[var(--navy-dark)]">
              What should we change?
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--gray-text)]">
              Rename columns, add or move cards, or ask for a quick summary of
              your board.
            </p>
          </div>
        ) : null}
        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}-${m.content.slice(0, 24)}`}
            className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
              m.role === "user"
                ? "ml-auto bg-[var(--primary-blue)]/12 text-[var(--navy-dark)] ring-1 ring-[var(--primary-blue)]/15"
                : "mr-auto border border-[var(--stroke)]/90 bg-white text-[var(--navy-dark)]"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading ? (
          <div className="mr-auto flex items-center gap-2 rounded-2xl border border-dashed border-[var(--stroke)] bg-white/70 px-3.5 py-2.5 text-sm text-[var(--gray-text)]">
            <span
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--primary-blue)]"
              aria-hidden
            />
            Thinking…
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="shrink-0 border-t border-red-100/90 bg-red-50/95 px-3 py-2.5 text-xs leading-snug text-red-800">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="shrink-0 border-t border-[var(--stroke)]/80 bg-white/95 p-3 shadow-[0_-8px_24px_-12px_rgba(3,33,71,0.06)] backdrop-blur-sm"
      >
        <label className="sr-only" htmlFor="chat-input">
          Message to AI
        </label>
        <textarea
          id="chat-input"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message the assistant…"
          className="mb-2 w-full resize-none rounded-xl border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--navy-dark)] outline-none transition placeholder:text-[var(--gray-text)] focus:border-[var(--accent-yellow)] focus:ring-2 focus:ring-[var(--accent-yellow)]/25"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-full rounded-xl bg-[var(--secondary-purple)] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </aside>
  );
}
