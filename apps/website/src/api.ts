const BASE = import.meta.env.VITE_API_URL ?? "/api";

export async function generate(message: string): Promise<string> {
  const res = await fetch(`${BASE}/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { code?: string };
  if (typeof data.code !== "string") throw new Error("unexpected response shape");
  return data.code;
}
