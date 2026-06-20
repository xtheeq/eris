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
const sendBtn = document.getElementById("send") as HTMLButtonElement | null;
if (!sendBtn) throw new Error("#send not found");
const stopBtn = document.getElementById("stop") as HTMLButtonElement | null;
if (!stopBtn) throw new Error("#stop not found");

let ac: AbortController | null = null;
stopBtn.onclick = () => ac?.abort();

document.getElementById("form")!.onsubmit = async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";

  ac = new AbortController();
  sendBtn.hidden = true;
  stopBtn.hidden = false;

  let code = "";
  try {
    for await (const delta of generate(text, ac.signal)) {
      code += delta;
    }
  } catch (err) {
    if (ac?.signal.aborted) return;
    console.error(err instanceof Error ? err.message : String(err));
    return;
  } finally {
    ac = null;
    sendBtn.hidden = false;
    stopBtn.hidden = true;
  }

  if (code) await run(code);
};
