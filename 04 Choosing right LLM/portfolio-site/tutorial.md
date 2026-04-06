# Beginner Tutorial: Portfolio Website + AI Digital Twin

This tutorial explains, in beginner-friendly language, how this project works.
It covers the technology, structure, important code, and improvements.

## Technology Summary

- **Next.js (App Router):** framework used to build pages and API routes.
- **React:** used for building UI components.
- **TypeScript:** adds type safety and better editor help.
- **CSS (`globals.css`):** custom styling, colors, layout, and responsiveness.
- **OpenRouter API:** powers the AI digital twin responses.

## High-Level Walkthrough

1. The homepage is rendered from `web/app/page.tsx`.
2. The page contains sections like Hero, About, Journey, Portfolio, and Contact.
3. It also renders `DigitalTwinChat`, the AI chat interface.
4. When the user submits a message, the frontend sends a `POST` request to `/api/digital-twin`.
5. The API route validates messages, adds a system prompt, calls OpenRouter, cleans the reply, and sends JSON back.
6. The frontend displays the assistant response in the chat UI.

## Code Review With Examples

### 1) Main Page Structure (`web/app/page.tsx`)

The homepage stores content in arrays and renders cards dynamically with `.map()`.
This is clean and scalable because you can add new entries without changing layout code.

```tsx
const careerJourney = [
  {
    role: "Senior Data Engineer",
    company: "Tradeweb",
    period: "Oct 2025 - Present",
    highlight: "Architecting reliable analytics infrastructure...",
  },
];

{careerJourney.map((item) => (
  <article key={`${item.role}-${item.company}`} className="journey-card">
    <p className="journey-period">{item.period}</p>
    <h3>{item.role}</h3>
    <p className="journey-company">{item.company}</p>
    <p>{item.highlight}</p>
  </article>
))}
```

### 2) Chat Component (`web/app/components/DigitalTwinChat.tsx`)

This is a **client component** (`"use client"`) because it uses React state and browser interactions.

It manages:
- `messages` for chat history,
- `input` for the text box,
- `isLoading` while waiting for API response,
- `error` when a request fails.

```tsx
const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
const [input, setInput] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const canSend = useMemo(
  () => input.trim().length > 0 && !isLoading,
  [input, isLoading],
);
```

On submit:
1. Prevent default form refresh,
2. Validate input,
3. Send request to `/api/digital-twin`,
4. Add assistant reply to state.

```tsx
const response = await fetch("/api/digital-twin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ messages: nextMessages }),
});
```

### 3) API Route (`web/app/api/digital-twin/route.ts`)

This file handles backend logic:
- Reads API key from environment variables or `.env`,
- Validates incoming messages,
- Calls OpenRouter model,
- Uses fallback model on certain provider errors,
- Sanitizes response text.

```ts
const MODEL_NAME = "qwen/qwen3-coder:free";
const FALLBACK_MODEL_NAME = "openrouter/auto";
```

The route filters invalid/empty messages and limits context size:

```ts
const incomingMessages = Array.isArray(body.messages)
  ? body.messages
      .filter(
        (message) =>
          message &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string" &&
          message.content.trim().length > 0,
      )
      .slice(-12)
  : [];
```

This improves reliability and cost control.

### 4) Styling (`web/app/globals.css`)

The CSS file uses variables in `:root` for consistent design tokens:

```css
:root {
  --bg-base: #070b14;
  --text-primary: #f5f8ff;
  --accent: #4f8dff;
  --accent-2: #10f0bd;
}
```

Benefits:
- Easy theme updates,
- Reusable styles,
- Better maintainability.

## Beginner Learning Notes

- Keep **UI rendering** (`page.tsx`) separate from **API logic** (`route.ts`).
- Use state to model app behavior (`messages`, `loading`, `error`).
- Always validate input on the server, even if frontend already validates.
- Use clear class names and CSS variables for readable styling.

## Self-Review: 5 Improvement Ideas

1. **Move profile content into a separate data file** (`web/data/profile.ts`) to keep page component smaller.
2. **Use schema validation** (like `zod`) in the API route for stronger type-safe request validation.
3. **Add tests** for helper functions (especially response sanitization and API edge cases).
4. **Persist chat history** in local storage so users do not lose conversation on refresh.
5. **Improve accessibility further** (extra keyboard and screen-reader feedback around chat updates).

## Quick Run Instructions

From the `web` folder:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If chat does not work, add `OPENROUTER_API_KEY` to your environment file and restart the dev server.
