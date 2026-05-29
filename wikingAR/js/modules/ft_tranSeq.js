import * as THREE from 'three';
import { models } from './models.js';

const TARGET_MODEL_NAME = 'Nietplatte_mit_Rost';
const PROXIMITY_RADIUS = 0.5;
const TRANSPARENT_OPACITY = 0.3;

const tempCameraPos = new THREE.Vector3();
const tempTargetPos = new THREE.Vector3();

let cameraRef = null;
let hasTriggeredNextStep = false;

const preparedModels = new Map();

function createTransparentMaterial(sourceMaterial, opacity) {
  return new THREE.MeshBasicMaterial({
    color: sourceMaterial.color ? sourceMaterial.color.clone() : new THREE.Color(0xffffff),
    map: sourceMaterial.map || null,
    transparent: true,
    opacity
  });
}

function prepareModel(model) {
  if (!model || preparedModels.has(model.uuid)) return;

  const entries = [];

  model.traverse((child) => {
    if (!child.isMesh || !child.material) return;

    const originalMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    const transparentMaterials = originalMaterials.map((material) =>
      createTransparentMaterial(material, TRANSPARENT_OPACITY)
    );

    entries.push({
      mesh: child,
      originalMaterials,
      transparentMaterials
    });
  });

  preparedModels.set(model.uuid, entries);
}

function setTransparentState(model, useTransparent) {
  const entries = preparedModels.get(model.uuid);
  if (!entries) return;

  for (const entry of entries) {
    const nextMaterials = useTransparent
      ? entry.transparentMaterials
      : entry.originalMaterials;

    entry.mesh.material = nextMaterials.length === 1
      ? nextMaterials[0]
      : nextMaterials;
  }
}

export function initTranSeq(camera) {
  cameraRef = camera;
}

export function updateTranSeq() {
  if (!cameraRef) return;

  const target = models[TARGET_MODEL_NAME];
  if (!target) return;

  // Wenn das Ziel sichtbar wird, bereiten wir es einmalig mit transparenten Materialien vor.
  if (target.visible) {
    prepareModel(target);
  } else {
    hasTriggeredNextStep = false;
    return;
  }

  cameraRef.getWorldPosition(tempCameraPos);
  target.getWorldPosition(tempTargetPos);

  const isNear = tempCameraPos.distanceTo(tempTargetPos) <= PROXIMITY_RADIUS;

  if (hasTriggeredNextStep) {
    setTransparentState(target, false);
    return;
  }

  // Solange man noch nicht nah genug ist, bleibt das Modell transparent.
  setTransparentState(target, !isNear);

  // Sobald man nah genug ist, wird das Modell opaque und der nächste Schritt läuft an.
  if (isNear) {
    hasTriggeredNextStep = true;
    setTransparentState(target, false);

    const nextStepButton = document.getElementById('nextStepButton');
    if (nextStepButton) {
      nextStepButton.click();
    }
  }
}