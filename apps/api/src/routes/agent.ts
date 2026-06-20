import { Hono } from "hono";
import { z } from "zod";
import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import type { ChatMiddleware } from "@tanstack/ai";
import { createOpenRouterText } from "@tanstack/ai-openrouter";
import { system } from "../prompts/system.ts";

const logger: ChatMiddleware = {
  name: "logger",
  onStart: (ctx) => {
    console.log(`[${ctx.requestId}] Chat started`);
  },
  onChunk: (ctx, chunk) => {
    if (chunk.type === "CUSTOM" && chunk.name === "structured-output.complete") {
      console.log(`[${ctx.requestId}] Response:`, chunk.value.object);
    }
  },
  onUsage: (ctx, usage) => {
    console.log(`[${ctx.requestId}] Iteration ${ctx.iteration}: ${usage.totalTokens} tokens`);
  },
  onFinish: (ctx, info) => {
    console.log(`[${ctx.requestId}] Finished: ${info.finishReason}, ${info.duration}ms`);
  },
  onAbort: (ctx, info) => {
    console.log(`[${ctx.requestId}] Aborted: ${info.reason}, ${info.duration}ms`);
  },
  onError: (ctx, info) => {
    console.error(`[${ctx.requestId}] Error after ${info.duration}ms:`, info.error);
  },
};

export const agent = new Hono<{ Bindings: CloudflareBindings }>();

agent.post("/agent", async (c) => {
  let body: { message?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid JSON" }, 400);
  }

  const adapter = createOpenRouterText("openai/gpt-oss-120b:free", c.env.OPENROUTER_API_KEY);

  const abortController = new AbortController();

  const stream = chat({
    adapter,
    messages: [{ role: "user", content: body.message ?? "" }],
    systemPrompts: [system],
    outputSchema: z.object({ code: z.string() }),
    middleware: [logger],
    abortController,
    stream: true,
  });

  return toServerSentEventsResponse(stream, { abortController });
});
