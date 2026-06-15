import { Hono } from "hono";
import { cors } from "hono/cors";

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
  const code = [
    `// ${body.message ?? ""}`,
    `const geo = new THREE.BoxGeometry(1, 1, 1);`,
    `const mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });`,
    `const mesh = new THREE.Mesh(geo, mat);`,
    `mesh.position.x = Math.random() * 4 - 2;`,
    `mesh.position.y = Math.random() * 4 - 2;`,
    `api.add("demo", mesh, (d) => { mesh.rotation.x += d; mesh.rotation.y += d; });`,
  ].join("\n");
  return c.json({ code });
});

export default app;
