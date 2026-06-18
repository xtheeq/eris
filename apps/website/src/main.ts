import "./style.css";
import { tick } from "./store.ts";
import { renderer, scene, camera, timer } from "./scene.ts";
import { generate } from "./api.ts";
import { run } from "./run.ts";

void renderer.setAnimationLoop((ts: number) => {
  timer.update(ts);
  tick(timer.getDelta(), timer.getElapsed());
  renderer.render(scene, camera);
});

const input = document.getElementById("input") as HTMLInputElement | null;
if (!input) throw new Error("#input not found");

document.getElementById("form")!.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  let code = "";
  try {
    for await (const delta of generate(text)) {
      code += delta;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[generate] ${msg}`);
    return;
  }
  if (code.trim()) await run(code);
});
