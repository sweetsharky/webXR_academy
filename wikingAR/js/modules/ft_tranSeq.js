import * as THREE from 'three';
import { models } from './models.js';

const SHIP_MODEL_NAME = 'Schiff';

// Diese Modelle stehen separat neben dem Schiff.
// Sie starten transparent und werden bei Annäherung voll sichtbar.
const TARGET_MODEL_NAMES = [
  'Schiffsniet',
  'Nietplatte',
  'boatPart_wRivets'
];

const PROXIMITY_RADIUS = 1.0;
const SHIP_TRANSPARENT_OPACITY = 0.2;
const TARGET_TRANSPARENT_OPACITY = 0.3;

const tempCameraPos = new THREE.Vector3();
const tempTargetPos = new THREE.Vector3();

let cameraRef = null;

// Hier cachen wir vorbereitete Modelle, damit wir nicht in jedem Frame neu traversen müssen.
const preparedModels = new Map();

// Merkt sich den letzten Zustand, damit Materialien nur bei Änderungen gewechselt werden.
let shipIsTransparent = false;
const targetNearState = new Map();

function createTransparentMaterial(sourceMaterial, opacity) {
  // Wir bauen bewusst ein neues THREE-Material,
  // weil das direkte Verändern des importierten GLTF-Materials bei dir nicht zuverlässig war.
  return new THREE.MeshStandardMaterial({
    color: sourceMaterial.color ? sourceMaterial.color.clone() : new THREE.Color(0xffffff),
    map: sourceMaterial.map || null,
    normalMap: sourceMaterial.normalMap || null,
    roughnessMap: sourceMaterial.roughnessMap || null,
    metalnessMap: sourceMaterial.metalnessMap || null,
    aoMap: sourceMaterial.aoMap || null,
    emissiveMap: sourceMaterial.emissiveMap || null,
    emissive: sourceMaterial.emissive ? sourceMaterial.emissive.clone() : new THREE.Color(0x000000),
    emissiveIntensity: sourceMaterial.emissiveIntensity ?? 1,
    metalness: sourceMaterial.metalness ?? 0,
    roughness: sourceMaterial.roughness ?? 1,
    transparent: true,
    opacity: opacity,
    side: sourceMaterial.side,
    alphaTest: sourceMaterial.alphaTest ?? 0,
    depthWrite: false
  });
}

function prepareModel(model, transparentOpacity) {
  if (!model || preparedModels.has(model.uuid)) return;

  const meshEntries = [];

  model.traverse((child) => {
    if (!child.isMesh || !child.material) return;

    const originalMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    const transparentMaterials = originalMaterials.map((material) =>
      createTransparentMaterial(material, transparentOpacity)
    );

    meshEntries.push({
      mesh: child,
      originalMaterials,
      transparentMaterials
    });
  });

  preparedModels.set(model.uuid, meshEntries);
}

function setModelTransparentState(model, useTransparent) {
  const meshEntries = preparedModels.get(model.uuid);
  if (!meshEntries) return;

  for (const entry of meshEntries) {
    const nextMaterials = useTransparent
      ? entry.transparentMaterials
      : entry.originalMaterials;

    entry.mesh.material = nextMaterials.length === 1 ? nextMaterials[0] : nextMaterials;
  }
}

function getTargetModels() {
  return TARGET_MODEL_NAMES
    .map((name) => models[name])
    .filter(Boolean);
}

export function initTranSeq(camera) {
  cameraRef = camera;
}

export function updateTranSeq() {
  if (!cameraRef) return;

  const ship = models[SHIP_MODEL_NAME];
  if (!ship || !ship.visible) return;

  const targetModels = getTargetModels();
  if (targetModels.length === 0) return;

  // Vorbereitung nur einmal pro Modell ausführen.
  prepareModel(ship, SHIP_TRANSPARENT_OPACITY);

  for (const target of targetModels) {
    if (!target.visible) target.visible = true;
    prepareModel(target, TARGET_TRANSPARENT_OPACITY);
  }

  cameraRef.getWorldPosition(tempCameraPos);

  let anyTargetIsNear = false;

  for (const target of targetModels) {
    target.getWorldPosition(tempTargetPos);
    const distance = tempCameraPos.distanceTo(tempTargetPos);
    const isNear = distance <= PROXIMITY_RADIUS;
    const previousIsNear = targetNearState.get(target.uuid);

    // Material nur dann wechseln, wenn sich der Zustand wirklich geändert hat.
    if (previousIsNear !== isNear) {
      setModelTransparentState(target, !isNear);
      targetNearState.set(target.uuid, isNear);
    }

    if (isNear) {
      anyTargetIsNear = true;
    }
  }

  // Auch das Schiff nur bei Zustandswechsel umschalten.
  if (shipIsTransparent !== anyTargetIsNear) {
    setModelTransparentState(ship, anyTargetIsNear);
    shipIsTransparent = anyTargetIsNear;
  }
}