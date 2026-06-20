import { fetchServerSentEvents } from "@tanstack/ai-client";
import type { UIMessage } from "@tanstack/ai-client";

const BASE = import.meta.env.VITE_API_URL ?? "/api";

export async function* generate(message: string, signal?: AbortSignal) {
  const { connect } = fetchServerSentEvents(`${BASE}/agent`, { signal });
  const msg: UIMessage = {
    id: crypto.randomUUID(),
    role: "user",
    parts: [{ type: "text", content: message }],
  };

  for await (const chunk of connect([msg], {})) {
    if (chunk.type === "CUSTOM" && chunk.name === "structured-output.complete") {
      yield chunk.value.object.code;
      return;
    }
    if (chunk.type === "RUN_ERROR") {
      throw new Error(chunk.message ?? "AI generation failed");
    }
  }
}
