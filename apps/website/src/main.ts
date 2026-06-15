import { tick } from "./store.ts";
import { renderer, scene, camera, timer } from "./scene.ts";

void renderer.setAnimationLoop((ts: number) => {
  timer.update(ts);
  tick(timer.getDelta(), timer.getElapsed());
  renderer.render(scene, camera);
});
