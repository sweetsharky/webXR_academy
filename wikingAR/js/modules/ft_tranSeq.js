import * as THREE from 'three';
import { models } from './models.js';

const TARGET_MODEL_NAMES = ['Schiffsniet_originalTextur', 'Nietplatte', 'Nietplatte_mit_Rost'];
const TEXT_TRIGGER_NAMES = ['Nietplatte_mit_Rost'];

const PROXIMITY_RADIUS = 0.5;
const TARGET_TRANSPARENT_OPACITY = 0.3;

const tempCameraPos = new THREE.Vector3();
const tempTargetPos = new THREE.Vector3();

let cameraRef = null;
let discoveryTriggered = false;

const preparedModels = new Map();
const targetNearState = new Map();

function createTransparentMaterial(sourceMaterial, opacity) {
  return new THREE.MeshBasicMaterial({
    color: sourceMaterial.color ? sourceMaterial.color.clone() : new THREE.Color(0xffffff),
    map: sourceMaterial.map || null,
    transparent: true,
    opacity: opacity
  });
}

function prepareModel(model, transparentOpacity) {
  if (!model || preparedModels.has(model.uuid)) return;

  const entries = [];

  model.traverse((child) => {
    if (!child.isMesh || !child.material) return;

    const originalMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    const transparentMaterials = originalMaterials.map((material) =>
      createTransparentMaterial(material, transparentOpacity)
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

function getTargets() {
  return TARGET_MODEL_NAMES
    .map((name) => models[name])
    .filter(Boolean);
}

function triggerNextLearningStepIfReady(targetsNearByName) {
  if (discoveryTriggered) return;

  const allTargetsNear = TEXT_TRIGGER_NAMES.every((name) => targetsNearByName.has(name));
  if (!allTargetsNear) return;

  discoveryTriggered = true;

  const nextStepButton = document.getElementById('nextStepButton');
  if (nextStepButton) {
    nextStepButton.style.display = "block";
    nextStepButton.click();
  }
}

export function initTranSeq(camera) {
  cameraRef = camera;
}

export function updateTranSeq() {
  if (!cameraRef) return;

  const targets = getTargets();
  if (targets.length === 0) return;

  cameraRef.getWorldPosition(tempCameraPos);

  const targetsNearByName = new Set();

  for (const target of targets) {
    if (!target.visible) {
      targetNearState.delete(target.uuid);
      continue;
    }

    // Sobald das Modell sichtbar wird, bekommt es direkt die transparente Variante.
    prepareModel(target, TARGET_TRANSPARENT_OPACITY);
    target.getWorldPosition(tempTargetPos);

    const isNear = tempCameraPos.distanceTo(tempTargetPos) <= PROXIMITY_RADIUS;
    const previousIsNear = targetNearState.get(target.uuid);

    if (previousIsNear === undefined) {
      setTransparentState(target, !isNear);
    } else if (previousIsNear !== isNear) {
      setTransparentState(target, !isNear);
    }

    targetNearState.set(target.uuid, isNear);

    if (isNear) {
      targetsNearByName.add(target.name);
    }
  }

  triggerNextLearningStepIfReady(targetsNearByName);
}