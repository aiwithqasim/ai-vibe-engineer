"use client";

import { FormEvent, useMemo, useState } from "react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

const starterMessage: ChatMessage = {
  role: "assistant",
  content:
    "Hi, I am Qasim's AI digital twin. Ask me about his career, projects, tools, or professional journey.",
};

export default function DigitalTwinChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isLoading,
    [input, isLoading],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt || isLoading) return;

    setError(null);
    setInput("");
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: prompt },
    ];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/digital-twin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Unable to get a response right now.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while contacting the AI service.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="panel" id="digital-twin">
      <h2>AI Career Digital Twin</h2>
      <p>
        Ask questions about Qasim&apos;s experience, tools, certifications, and
        career decisions.
      </p>

      <div className="chat-shell" aria-live="polite">
        {messages.map((message, index) => (
          <article
            key={`${message.role}-${index}`}
            className={`chat-bubble ${message.role === "user" ? "chat-user" : "chat-ai"}`}
          >
            <p className="chat-role">{message.role === "user" ? "You" : "Digital Twin"}</p>
            <p>{message.content}</p>
          </article>
        ))}

        {isLoading ? (
          <article className="chat-bubble chat-ai">
            <p className="chat-role">Digital Twin</p>
            <p>Thinking...</p>
          </article>
        ) : null}
      </div>

      <form className="chat-form" onSubmit={onSubmit}>
        <label htmlFor="chat-input" className="sr-only">
          Ask the digital twin a question
        </label>
        <input
          id="chat-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about roles, impact, stack, or future direction..."
          maxLength={500}
        />
        <button type="submit" disabled={!canSend}>
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>

      {error ? <p className="chat-error">{error}</p> : null}
    </section>
  );
}
