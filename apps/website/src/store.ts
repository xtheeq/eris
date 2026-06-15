import * as THREE from "three/webgpu";
import type { Tick, Entity } from "./types.ts";
import { scene, camera } from "./scene.ts";

const map = new Map<string, Entity>();

export const api = {
  THREE,
  scene,
  camera,
  add(id: string, object: THREE.Object3D, update?: Tick): void {
    this.remove(id);
    scene.add(object);
    map.set(id, { object, update });
  },
  remove(id: string): void {
    const entity = map.get(id);
    if (!entity) return;
    scene.remove(entity.object);
    map.delete(id);
  },
  get(id: string): THREE.Object3D | undefined {
    return map.get(id)?.object;
  },
  list(): string[] {
    return [...map.keys()];
  },
  clear(): void {
    for (const id of map.keys()) this.remove(id);
  },
  dispose(id: string): void {
    const entity = map.get(id);
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
};

export function tick(delta: number, elapsed: number): void {
  for (const { update } of map.values()) update?.(delta, elapsed);
}
