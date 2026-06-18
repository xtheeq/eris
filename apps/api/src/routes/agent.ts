import { Hono } from "hono";
import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { createOpenRouterText } from "@tanstack/ai-openrouter";
import { system } from "../prompts/system.ts";

export const agent = new Hono<{ Bindings: CloudflareBindings }>();

agent.post("/agent", async (c) => {
  let body: { message?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid JSON" }, 400);
  }

  const adapter = createOpenRouterText("openai/gpt-oss-20b:free", c.env.OPENROUTER_API_KEY);

  const abortController = new AbortController();

  const stream = chat({
    adapter,
    messages: [{ role: "user", content: body.message ?? "" }],
    systemPrompts: [system],
    abortController,
  });

  return toServerSentEventsResponse(stream, { abortController });
});
