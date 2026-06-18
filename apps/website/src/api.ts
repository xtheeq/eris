const BASE = import.meta.env.VITE_API_URL ?? "/api";

export async function* generate(message: string): AsyncGenerator<string> {
  const res = await fetch(`${BASE}/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(await res.text());
  if (!res.body) throw new Error("Response has no body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      const chunk = JSON.parse(data);
      if (chunk.type === "TEXT_MESSAGE_CONTENT" && chunk.delta) {
        yield chunk.delta;
      } else if (chunk.type === "RUN_ERROR") {
        throw new Error(chunk.message ?? "AI generation failed");
      } else if (chunk.type === "RUN_FINISHED") {
        return;
      }
    }
  }
}
