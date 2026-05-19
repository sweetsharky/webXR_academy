import * as THREE from 'three';
import { models } from './models.js';

const SHIP_MODEL_NAME = 'Schiff';
const TARGET_MODEL_NAMES = ['Schiffsniet', 'Nietplatte', 'boatPart_wRivets'];

const PROXIMITY_RADIUS = 1.0;
const SHIP_TRANSPARENT_OPACITY = 0.2;
const TARGET_TRANSPARENT_OPACITY = 0.3;

const tempCameraPos = new THREE.Vector3();
const tempTargetPos = new THREE.Vector3();

let cameraRef = null;

const preparedModels = new Map();
let lastShipTransparent = false;
const lastTargetStates = new Map();

function createTransparentMaterial(sourceMaterial, opacity) {
  // Absichtlich stark reduziert:
  // nur Farbe + Textur + Transparenz
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
    const next = useTransparent ? entry.transparentMaterials : entry.originalMaterials;
    entry.mesh.material = next.length === 1 ? next[0] : next;
  }
}

function getTargets() {
  return TARGET_MODEL_NAMES.map((name) => models[name]).filter(Boolean);
}

export function initTranSeq(camera) {
  cameraRef = camera;
}

export function updateTranSeq() {
  if (!cameraRef) return;

  const ship = models[SHIP_MODEL_NAME];
  if (!ship || !ship.visible) return;

  const targets = getTargets();
  if (targets.length === 0) return;

  prepareModel(ship, SHIP_TRANSPARENT_OPACITY);

  for (const target of targets) {
    if (!target.visible) target.visible = true;
    prepareModel(target, TARGET_TRANSPARENT_OPACITY);
  }

  cameraRef.getWorldPosition(tempCameraPos);

  let anyNear = false;

  for (const target of targets) {
    target.getWorldPosition(tempTargetPos);

    const isNear = tempCameraPos.distanceTo(tempTargetPos) <= PROXIMITY_RADIUS;
    const lastState = lastTargetStates.get(target.uuid);

    if (lastState !== isNear) {
      setTransparentState(target, !isNear);
      lastTargetStates.set(target.uuid, isNear);
    }

    if (isNear) anyNear = true;
  }

  if (lastShipTransparent !== anyNear) {
    setTransparentState(ship, anyNear);
    lastShipTransparent = anyNear;
  }
}