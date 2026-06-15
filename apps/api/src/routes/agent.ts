import { Hono } from "hono";
import { chat } from "@tanstack/ai";
import { createGeminiChat } from "@tanstack/ai-gemini";
import { system } from "../prompts/system.ts";

export const agent = new Hono();

agent.post("/agent", async (c) => {
  let body: { message?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid JSON" }, 400);
  }

  const adapter = createGeminiChat(
    "gemini-2.5-flash",
    (c.env as { GEMINI_API_KEY: string }).GEMINI_API_KEY,
  );

  try {
    const stream = chat({
      adapter,
      messages: [{ role: "user", content: body.message ?? "" }],
      systemPrompts: [system],
    });

    let code = "";
    for await (const chunk of stream) {
      if (chunk.type === "TEXT_MESSAGE_CONTENT" && chunk.delta) {
        code += chunk.delta;
      } else if (chunk.type === "RUN_ERROR") {
        console.error("Gemini error:", chunk.message);
        return c.json({ error: chunk.message ?? "AI generation failed" }, 502);
      }
    }

    code = code
      .trim()
      .replace(/^```\w*\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    return c.json({ code });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("chat stream error:", message);
    return c.json({ error: "AI generation failed" }, 502);
  }
});
