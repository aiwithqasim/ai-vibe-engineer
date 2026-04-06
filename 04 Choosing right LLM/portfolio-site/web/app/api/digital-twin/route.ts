import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

type OpenRouterContentPart = {
  type?: string;
  text?: string;
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string | OpenRouterContentPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

const MODEL_NAME = "qwen/qwen3-coder:free";
const FALLBACK_MODEL_NAME = "openrouter/auto";

const DIGITAL_TWIN_SYSTEM_PROMPT = `
You are the AI digital twin of Qasim Hassan.
Answer only based on his career profile and keep responses concise, confident, and professional.

Known profile:
- Senior Data Engineer with 5+ years of experience.
- Focus: scalable data pipelines, monitoring, governance, lineage, analytics infrastructure.
- Core stack: AWS, Azure, Databricks, Snowflake, Python, SQL, Apache Spark.
- Current role: Senior Data Engineer at Tradeweb (Oct 2025 - Present).
- Prior roles: Data Engineer II and Data Engineer I at Royal Cyber.
- Earlier experience: Omdena (Data Engineer / chapter leadership) and ML engineering work.
- Community/training work: Lead Data Engineering Trainer at Saylani Mass IT Training.
- Certifications include Databricks and Python credentials.

Response rules:
- Answer only the user's latest question.
- Keep replies short: 1-3 sentences by default.
- Do not generate FAQs, bullet lists, or multiple Q/A pairs unless explicitly requested.
- Do not include follow-up sample questions and answers.
- If the user asks a greeting like "who are you", give only a direct introduction.
- When asked about unavailable details, say you do not have that exact information yet.
- Do not invent facts.
`;

function readApiKeyFromEnvFile(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const file = fs.readFileSync(filePath, "utf8");
    const lines = file.split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const [key, ...rest] = line.split("=");
      if (!key || rest.length === 0) continue;
      if (key === "OPENROUTER_API_KEY" || key === "OPENROOTER_API_KEY") {
        const value = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
        if (value) return value;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function getOpenRouterApiKey(): string | null {
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY;
  if (process.env.OPENROOTER_API_KEY) return process.env.OPENROOTER_API_KEY;

  const candidateEnvFiles = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), ".emv"),
    path.resolve(process.cwd(), "../.env"),
    path.resolve(process.cwd(), "../.emv"),
  ];

  for (const filePath of candidateEnvFiles) {
    const key = readApiKeyFromEnvFile(filePath);
    if (key) return key;
  }

  return null;
}

function getAssistantText(response: OpenRouterResponse): string {
  const content = response.choices?.[0]?.message?.content;
  if (!content) return "";
  if (typeof content === "string") return content.trim();
  return content
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();
}

function sanitizeAssistantReply(reply: string): string {
  let cleaned = reply.trim();

  // Prevent model-generated FAQ dumps when user asked one question.
  const qaStart = cleaned.search(/(?:^|\n)\s*Q:\s/i);
  if (qaStart > 0) {
    cleaned = cleaned.slice(0, qaStart).trim();
  }

  // Keep responses compact and readable by default.
  const lines = cleaned
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  cleaned = lines.join(" ");

  const words = cleaned.split(/\s+/);
  if (words.length > 90) {
    cleaned = `${words.slice(0, 90).join(" ")}...`;
  }

  return cleaned;
}

async function callOpenRouter(
  apiKey: string,
  messages: IncomingMessage[],
  model: string,
) {
  const upstreamResponse = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Qasim Digital Twin Website",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 220,
        messages: [
          { role: "system", content: DIGITAL_TWIN_SYSTEM_PROMPT.trim() },
          ...messages,
        ],
      }),
    },
  );

  let responseData: OpenRouterResponse = {};
  try {
    responseData = (await upstreamResponse.json()) as OpenRouterResponse;
  } catch {
    responseData = {};
  }

  return { upstreamResponse, responseData };
}

function shouldTryFallback(status: number, responseData: OpenRouterResponse): boolean {
  if (status === 429 || status >= 500) return true;
  const message = (responseData.error?.message || "").toLowerCase();
  return message.includes("provider returned error");
}

export async function POST(request: Request) {
  try {
    const apiKey = getOpenRouterApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Missing OpenRouter API key. Add OPENROUTER_API_KEY to your env file.",
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      messages?: IncomingMessage[];
    };

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

    if (incomingMessages.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one message." },
        { status: 400 },
      );
    }

    let { upstreamResponse, responseData } = await callOpenRouter(
      apiKey,
      incomingMessages,
      MODEL_NAME,
    );

    if (!upstreamResponse.ok && shouldTryFallback(upstreamResponse.status, responseData)) {
      const fallbackResult = await callOpenRouter(
        apiKey,
        incomingMessages,
        FALLBACK_MODEL_NAME,
      );
      upstreamResponse = fallbackResult.upstreamResponse;
      responseData = fallbackResult.responseData;
    }

    if (!upstreamResponse.ok) {
      const upstreamError =
        responseData.error?.message || "OpenRouter request failed. Try again.";
      const isProviderIssue = upstreamError.toLowerCase().includes("provider returned error");

      return NextResponse.json(
        {
          error: isProviderIssue
            ? "The selected provider is currently overloaded. Please retry in a moment."
            : upstreamError,
        },
        { status: upstreamResponse.status },
      );
    }

    const assistantReply = sanitizeAssistantReply(getAssistantText(responseData));
    if (!assistantReply) {
      return NextResponse.json(
        { error: "The model returned an empty response." },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply: assistantReply });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error while processing chat." },
      { status: 500 },
    );
  }
}
