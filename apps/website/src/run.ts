import * as THREE from "three/webgpu";
import { api } from "./store.ts";

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

export async function run(code: string): Promise<void> {
  try {
    const fn = new AsyncFunction("api", "THREE", `"use strict";\n${code}`);
    await fn(api, THREE);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[run] ${msg}`);
  }
}
