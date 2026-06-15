import * as THREE from "three/webgpu";

type UpdateFn = (delta: number, elapsed: number) => void;

type Entity = {
  object: THREE.Object3D;
  onUpdate?: UpdateFn;
};

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGPURenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const app = document.getElementById("app");
if (!app) throw new Error("#app element not found");
app.appendChild(renderer.domElement);

const timer = new THREE.Timer();
timer.connect(document);

const entities = new Map<string, Entity>();

const SceneAPI = {
  THREE,
  scene,
  camera,
  add(id: string, object: THREE.Object3D, onUpdate?: UpdateFn): void {
    this.remove(id);
    scene.add(object);
    entities.set(id, { object, onUpdate });
  },
  remove(id: string): void {
    const entity = entities.get(id);
    if (!entity) return;
    scene.remove(entity.object);
    entities.delete(id);
  },
  get(id: string): THREE.Object3D | undefined {
    return entities.get(id)?.object;
  },
  clear(): void {
    for (const id of entities.keys()) this.remove(id);
  },
  list(): string[] {
    return [...entities.keys()];
  },
  dispose(id: string): void {
    const entity = entities.get(id);
    if (!entity) return;
    const obj = entity.object;
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        (obj.material as THREE.Material)?.dispose();
      }
    }
    this.remove(id);
  },
  _tick(delta: number, elapsed: number): void {
    for (const { onUpdate } of entities.values()) {
      onUpdate?.(delta, elapsed);
    }
  },
};

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

export async function runLLMCode(code: string): Promise<void> {
  try {
    const executeLLM = new AsyncFunction("SceneAPI", "THREE", `"use strict";\n${code}`);

    await executeLLM(SceneAPI, THREE);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[SceneAPI] Execution failed: ${message}`);
  }
}

void renderer.setAnimationLoop((timestamp: number) => {
  timer.update(timestamp);
  const delta = timer.getDelta();
  const elapsed = timer.getElapsed();

  SceneAPI._tick(delta, elapsed);
  renderer.render(scene, camera);
});
