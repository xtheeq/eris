import { Hono } from "hono";
import { cors } from "hono/cors";
import { agent } from "./routes/agent.ts";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => c.text("Hello Hono!"));

app.route("/", agent);

export default app;
