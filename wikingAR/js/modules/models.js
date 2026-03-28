
// models.js
// ============================================================
// Modelle laden (GLTFLoader), Registry 'models{}', Animationen
// Spezial: Nietplatte_mit_Rost → rost* Kinder registrieren
// ============================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const models = {};         // hier speichern wir die geladenen Modelle
export const mixers = [];         // enthält alle AnimationMixer-Instanzen (pro Modell mit Animation)
const loader = new GLTFLoader();


// Debugging: visible bounding boxes: interne Registry für Debug-Helper
models.__debugHelpers = {
  nietplatteBox: null,
  boatTargetBoxes: [], // Array von BoxHelpern für schiffsniet + nietplattenteil
};


// 📌 Liste der Modelle (aus deinem Originalcode)
export const modelList = [
  {
    name: "Nietplatte",
    url: "https://raw.githubusercontent.com/sweetsharky/media/refs/heads/main/nietplatte_mit_animation/nietplatte_mit_animation.gltf",
    position: { x: 0, y: 0, z: -0.3 },
    scale: 0.002,
    rotatable: true,
  },
  {
    name: "Schiff",
    url: "https://raw.githubusercontent.com/sweetsharky/media/refs/heads/main/gislinge_viking_boat/scene.gltf",
    position: { x: 0, y: -1.5, z: -0.6 },
    scale: 0.01,
    rotatable: false,
  },
  {
    name: "boatPart",
    url: "https://raw.githubusercontent.com/sweetsharky/media/refs/heads/main/vikingboat_part/vikingboat_part.gltf",
    position: { x: 0, y: -1.5, z: -4.0 },
    scale: 0.01,
    rotatable: false,
  },
  {
    name: "boatPart_wRivets",
    url: "https://raw.githubusercontent.com/sweetsharky/media/refs/heads/main/vikingboat_part_wRivets/vikingboat_part_wRivets.gltf",
    position: { x: 0, y: -1.5, z: -0.6 },
    scale: 0.01,
    rotatable: false,
  },
  {
    name: "Nietplatte_mit_Rost",
    url: "https://raw.githubusercontent.com/sweetsharky/media/refs/heads/main/nietplatte_mit_Rost/nietplatte_mit_Rost.gltf",
    position: { x: 0, y: 0, z: -0.3 },
    scale: 0.002,
    rotatable: false,
  },
  {
    name: "Schiffsniet",
    url: "https://raw.githubusercontent.com/sweetsharky/media/refs/heads/main/schiffsniet/schiffsniet.gltf",
    position: { x: 0.05, y: 0, z: -0.3 }, // etwas versetzt neben der Nietplatte
    scale: 0.002,
    rotatable: true,
  }
];

// Modelle laden und registrieren
export function loadModels(scene) {
  modelList.forEach(item => {
    loader.load(item.url, gltf => {
      const model = gltf.scene;
      model.scale.multiplyScalar(item.scale);
      model.position.set(item.position.x, item.position.y, item.position.z);
      model.visible = false; // unsichtbar am Anfang
      model.userData.rotatable = item.rotatable; // Flag gespeichert, ob rotierbar oder nicht

      //Start: lade Animationen auf Models und spiele sie ab
      if (gltf.animations && gltf.animations.length > 0) {
        const localMixer = new THREE.AnimationMixer(model);
        // lege alle Actions an und play sie sofort
        gltf.animations.forEach((clip) => {
          const action = localMixer.clipAction(clip);
          action.reset();
          action.play();
        });
        // speichere den lokalen Mixer, damit wir ihn im Render-Loop updaten können, über die globale Variable mixers
        mixers.push(localMixer);
      }
      //End: lade Animationen auf Models durch das Erstellen von mixer (Animations-controller/-handler pro Modell)

      scene.add(model);
      models[item.name] = model; // im Objekt speichern
      console.log(`Model "${item.name}" geladen`);

      // Wenn es die Rost-Nietplatte ist: suche rost1..rost3 und mach Materialien transparent
      if (item.name === "Nietplatte_mit_Rost") {
        // Suche und registriere die Rost-Teile
        const rostParts = [];
        model.traverse((child) => {
          if (child.isMesh) {
            const n = (child.name || "").toLowerCase();
            if (n.includes("rost1") || n.includes("rost2") || n.includes("rost3") || n.includes("rost")) {
              rostParts.push(child);
            }
          }
        });

        models["Nietplatte_mit_Rost_children"] = rostParts;
        // status-flag
        models["Nietplatte_mit_Rost_removedCount"] = 0;

        console.log("Gefundene Rost-Teile:", rostParts.map(p => p.name || p.uuid));
      }


  // Debugging: visible bounding boxes: Debug-Box für Nietplatte (grün)
        if (item.name === "Nietplatte") {
          const helper = new THREE.BoxHelper(model, 0x22aa22);
          helper.visible = model.visible; // optional: nur zeigen, wenn sichtbar
          scene.add(helper);
          models.__debugHelpers.nietplatteBox = helper;
        }


      // checken, ob alle childobjekte an Model gefunden werden
      if (item.name === "boatPart_wRivets") {
        const names = ["schiffsniet", "nietplattenteil"];
        const lowerNames = names.map(n => n.toLowerCase());
        const boatTargets = [];

        model.traverse((child) => {
          const n = (child.name || "").toLowerCase();
          if (child.isMesh && lowerNames.includes(n)) {
            boatTargets.push(child);
          }
        });

        // Optional in Registry ablegen, falls du sie mehrfach brauchst:
        models["boatPart_wRivets_targets"] = boatTargets;

        console.log('Boat-Targets beim Laden gefunden:', boatTargets.map(t => t.name || t.uuid));
        // Debugging: visible bounding boxes: BoxHelper je Target erzeugen
        const targetHelpers = boatTargets.map(target => {
          const h = new THREE.BoxHelper(target, 0xff8800);
          h.visible = model.visible; // optional: an Parent koppeln
          scene.add(h);
          return h;
        });
        models.__debugHelpers.boatTargetBoxes = targetHelpers;
      }


    }, undefined, (err) => {
      console.error("Fehler beim Laden von", item.url, err);
    });
  });

  
}

//für das ft_dropTrigger
// Liefert die Ziel-Kindobjekte im boatPart_wRivets, die als "Platzierungsstellen" gelten.
export function getBoatRivetTargets() {
  const parent = models["boatPart_wRivets"];
  if (!parent) return [];

  const names = ["schiffsniet", "nietplattenteil"];
  const lowerNames = names.map(n => n.toLowerCase());

  const targets = [];
  parent.traverse((child) => {
    const n = (child.name || "").toLowerCase();
    if (child.isMesh && lowerNames.includes(n)) {
      targets.push(child);
    }
  });

  console.log("Gefundene Boat-Teile:", targets.map(t => t.name));
  return targets;
}



// Debugging: visible bounding boxes: Sichtbarkeit & Bounds der Boxen pro Frame updaten
export function updateDebugBoxesVisibilityAndBounds() {
  const np = models["Nietplatte"];
  const h1 = models.__debugHelpers.nietplatteBox;
  if (np && h1) {
    h1.visible = np.visible; // optional
    h1.update();
  }

  const parent = models["boatPart_wRivets"];
  const hs = models.__debugHelpers.boatTargetBoxes || [];
  const show = !!(parent && parent.visible);
  hs.forEach(h => {
    h.visible = show;        // optional: nur zeigen, wenn Parent sichtbar
    h.update();              // BoxHelper neu berechnen
  });
}
