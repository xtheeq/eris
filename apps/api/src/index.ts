import { Hono } from "hono";
import { cors } from "hono/cors";
import { chat } from "@tanstack/ai";
import { createGeminiChat } from "@tanstack/ai-gemini";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/generate", async (c) => {
  let body: { message?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid JSON" }, 400);
  }

  const adapter = createGeminiChat(
    "gemini-2.5-flash",
    (c.env as Record<string, string>)["GEMINI_API_KEY"],
  );

  const stream = chat({
    adapter,
    messages: [{ role: "user", content: body.message ?? "" }],
    systemPrompts: [
      [
        "You build Three.js WebGPU scenes. The user describes what to create — never answer questions or explain concepts.",
        "Generate ONLY code that adds objects to the scene. No comments, no explanations, no Q&A.",
        "Globals:",
        "  - THREE          → three/webgpu namespace",
        "  - api.scene      → the active THREE.Scene",
        "  - api.camera     → the active THREE.Camera",
        "API:",
        "  - api.add(id, object, update?)  → add an Object3D. update(delta, elapsed) runs each frame (both numbers). Mutate the object via closure.",
        "  - api.remove(id)               → remove by id",
        "  - api.list()                   → returns string[] of entity ids",
        "  - api.clear()                  → remove all entities",
        "Rules:",
        "  - Declare variables with const",
        "  - Use unique string ids for api.add()",
        "  - Use meaningful colors, sizes, positions",
        "  - ALWAYS end with at least one api.add() call to place something in the scene",
        "  - Respond with ONLY raw JavaScript, no markdown, no backticks (`), no fences, no JSON. Start directly with executable code.",
      ].join("\n"),
    ],
  });

  let code = "";
  for await (const chunk of stream) {
    if (chunk.type === "TEXT_MESSAGE_CONTENT" && chunk.delta) {
      console.log(chunk.delta);
      code += chunk.delta;
    } else if (chunk.type === "RUN_ERROR") {
      console.error("Gemini error:", chunk.message);
      return c.json({ error: chunk.message ?? "AI generation failed" }, 502);
    }
  }
  console.log();

  code = code
    .trim()
    .replace(/^```\w*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  return c.json({ code });
});

export default app;
