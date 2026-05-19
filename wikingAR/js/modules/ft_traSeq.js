import * as THREE from 'three';
import { models } from './models.js';

const SHIP_MODEL_NAME = 'Schiff';

// Trage hier die separaten Zusatzmodelle ein,
// die neben dem Schiff stehen und bei Annäherung hervorgehoben werden sollen.
const TARGET_MODEL_NAMES = [
  'Schiffsniet',
  'Nietplatte',
  'boatPart_wRivets'
];

const PROXIMITY_RADIUS = 2.0;
const SHIP_TRANSPARENT_OPACITY = 0.2;
const TARGET_TRANSPARENT_OPACITY = 0.3;

const tempCameraPos = new THREE.Vector3();
const tempTargetPos = new THREE.Vector3();

let cameraRef = null;

function createTransparentMaterial(sourceMaterial, opacity) {
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

function prepareModelMaterials(model, transparentOpacity) {
  if (!model || model.userData.tranSeqPrepared) return;

  model.traverse((child) => {
    if (!child.isMesh || !child.material) return;

    const originalMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    const transparentMaterials = originalMaterials.map((material) =>
      createTransparentMaterial(material, transparentOpacity)
    );

    child.userData.tranSeqOriginalMaterials = originalMaterials;
    child.userData.tranSeqTransparentMaterials = transparentMaterials;
  });

  model.userData.tranSeqPrepared = true;
}

function setModelTransparentState(model, useTransparent) {
  if (!model) return;

  model.traverse((child) => {
    if (!child.isMesh) return;

    const originalMaterials = child.userData.tranSeqOriginalMaterials;
    const transparentMaterials = child.userData.tranSeqTransparentMaterials;

    if (!originalMaterials || !transparentMaterials) return;

    const nextMaterials = useTransparent ? transparentMaterials : originalMaterials;
    child.material = nextMaterials.length === 1 ? nextMaterials[0] : nextMaterials;
  });
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
  if (!ship) return;
  if (!ship.visible) return;

  const targetModels = getTargetModels();
  if (targetModels.length === 0) return;

  prepareModelMaterials(ship, SHIP_TRANSPARENT_OPACITY);

  targetModels.forEach((target) => {
    target.visible = true;
    prepareModelMaterials(target, TARGET_TRANSPARENT_OPACITY);
  });

  cameraRef.getWorldPosition(tempCameraPos);

  let anyTargetIsNear = false;

  targetModels.forEach((target) => {
    target.getWorldPosition(tempTargetPos);
    const distance = tempCameraPos.distanceTo(tempTargetPos);
    const isNear = distance <= PROXIMITY_RADIUS;

    setModelTransparentState(target, !isNear);

    if (isNear) {
      anyTargetIsNear = true;
    }
  });

  setModelTransparentState(ship, anyTargetIsNear);
}