import { Hono } from "hono";
import { z } from "zod";
import {
  chat,
  chatParamsFromRequest,
  toServerSentEventsResponse,
  type ChatMiddleware,
} from "@tanstack/ai";
import { createGeminiChat } from "@tanstack/ai-gemini";
import { system } from "../prompts/system.ts";
import { getObjectDef, listObjectsDef } from "agent-tools";

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
  let params;
  try {
    params = await chatParamsFromRequest(c.req.raw);
  } catch (err) {
    if (err instanceof Response) return c.json({ error: "invalid AG-UI body" }, 400);
    throw err;
  }

  const adapter = createGeminiChat("gemini-3.1-flash-lite", c.env.GEMINI_API_KEY);
  const abortController = new AbortController();

  c.req.raw.signal.addEventListener("abort", () => abortController.abort(), { once: true });

  const stream = chat({
    adapter,
    messages: params.messages,
    threadId: params.threadId,
    runId: params.runId,
    systemPrompts: [system],
    outputSchema: z.object({ code: z.string() }),
    tools: [getObjectDef, listObjectsDef],
    middleware: [logger],
    abortController,
    stream: true,
  });

  return toServerSentEventsResponse(stream, { abortController });
});
