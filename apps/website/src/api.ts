import { ChatClient, fetchServerSentEvents } from "@tanstack/ai-client";
import type { StructuredOutputPart } from "@tanstack/ai-client";

const BASE = import.meta.env.VITE_API_URL ?? "/api";

export function createClient(onCode: (code: string) => void) {
  return new ChatClient({
    connection: fetchServerSentEvents(`${BASE}/agent`),
    onFinish: (message) => {
      const sop = message.parts.find(
        (p): p is StructuredOutputPart<{ code: string }> =>
          p.type === "structured-output" && p.status === "complete",
      );
      if (sop?.data?.code) onCode(sop.data.code);
    },
  });
}
