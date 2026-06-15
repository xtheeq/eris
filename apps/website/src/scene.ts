import * as THREE from "three/webgpu";

export const scene = new THREE.Scene();

export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 5;

export const renderer = new THREE.WebGPURenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

export const timer = new THREE.Timer();
timer.connect(document);

const app = document.getElementById("app");
if (!app) throw new Error("#app element not found");
app.appendChild(renderer.domElement);
