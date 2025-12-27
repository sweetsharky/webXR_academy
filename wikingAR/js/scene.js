
// scene.js
// ============================================================
// THREE.js Grundaufbau: Szene, Kamera, Renderer, Licht, Clock
// ============================================================

import * as THREE from 'three';

export let camera, scene, renderer;
export const clock = new THREE.Clock();

export function initScene() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);
  scene.add(camera); // wichtig: Kamera in die Szene hängen, damit über camera.add(modelname) Kinder gerendert werden

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true; // we have to enable the renderer for webxr
  container.appendChild(renderer.domElement);

  // Canvas in den Vordergrund für Touch-Interaktion (CSS muss Klasse definieren)
  renderer.domElement.classList.add('three.js-canvas');

  var light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);
}
