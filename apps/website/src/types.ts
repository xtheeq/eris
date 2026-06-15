import type * as THREE from "three/webgpu";

export type Tick = (delta: number, elapsed: number) => void;

export type Entity = {
  object: THREE.Object3D;
  update?: Tick;
};
