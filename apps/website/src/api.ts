import { ChatClient, createChatClientOptions, fetchServerSentEvents } from "@tanstack/ai-client";

const BASE = import.meta.env.VITE_API_URL ?? "/api";

export function createClient(onCode: (code: string) => void) {
  const options = createChatClientOptions({
    connection: fetchServerSentEvents(`${BASE}/agent`),
    onCustomEvent: (eventType, data) => {
      if (eventType !== "structured-output.complete") return;
      const { code } = (data as { object: { code: string } }).object;
      if (code) onCode(code);
    },
  });

  return new ChatClient(options);
}
