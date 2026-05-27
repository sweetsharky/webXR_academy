
// models.js
// ============================================================
// Modelle laden (GLTFLoader), Registry 'models{}', Animationen
// Spezial: Nietplatte_mit_Rost → rost* Kinder registrieren
// ============================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const models = {};         // hier speichern wir die geladenen Modelle in einem Objekt als Schlüssel-Wert-Paare (NICHT als Array!)
export const mixers = [];         // enthält alle AnimationMixer-Instanzen (pro Modell mit Animation)
const loader = new GLTFLoader();


// Debugging: visible bounding boxes: interne Registry für Debug-Helper
models.__debugHelpers = {
  nietplatteBox: null,
  boatTargetBoxes: [], // Array von Box3Helpern für schiffsniet + nietplattenteil
};


// 📌 Liste der Modelle als Konfigurationsplan (hieraus wird tatsächliches Laufzeitmodell/gltf.scene erst erstellt) --> die tatsächlichen Modelle, die sich zur Laufzeit in der Anwendung befinden werden mithilfe dieses "Bauplans" als Schlüssel-Wertpaare in das Objekt models abgelegt!
export const modelList = [
  {
    name: "Nietplatte",
    url: "https://raw.githubusercontent.com/sweetsharky/media/refs/heads/main/nietplatte_mit_animation/nietplatte_mit_animation.gltf",
    position: { x: -0.05, y: 0, z: -0.6 },//x->re/li, y= oben/Unten z=vorne/hinten
    scale: 0.002,
    rotatable: true,
  },
  {
    name: "Schiff",
    url: "https://raw.githubusercontent.com/sweetsharky/media/refs/heads/main/gislinge_viking_boat/scene.gltf",
    position: { x: 0, y: -1.5, z: -6.0 },
    rotation: {x: 0, y: 225, z: 0},
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
    position: { x: 0, y: -1.5, z: -3.0 },
    rotation: {x: 0, y: 270, z: 0},
    scale: 0.01,
    rotatable: false,
  },
  {
    name: "Nietplatte_mit_Rost",
    url: "https://raw.githubusercontent.com/sweetsharky/media/refs/heads/main/nietplatte_mit_Rost/nietplatte_mit_Rost.gltf",
    position: { x: -0.05, y: 0, z: -0.6 },
    scale: 0.002,
    rotatable: false,
  },
  {
    name: "Schiffsniet",
    url: "https://raw.githubusercontent.com/sweetsharky/media/refs/heads/main/schiffsniet/schiffsniet.gltf",
    position: { x: 0.05, y: 0, z: -0.6 }, 
    scale: 0.002,
    rotatable: true,
  },
    {
    name: "Schiffsniet_originalTextur",
    url: "https://raw.githubusercontent.com/sweetsharky/media/refs/heads/main/schiffsniet_originalTextur/schiffsniet_originalTextur.gltf",
    position: { x: 0.05, y: 0, z: -0.6 }, 
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
      if (item.rotation) { //Falls Rotationswerte als Attribute vorhanen, dann müssen sie Grad-werte noch in Radiant umgerechnet werden,da .rotation nur Radiant annimmt:
        model.rotation.set(
          THREE.MathUtils.degToRad(item.rotation.x),
          THREE.MathUtils.degToRad(item.rotation.y),
          THREE.MathUtils.degToRad(item.rotation.z)
        );
      }
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


      // checken, ob die Childobjekte der Nietplatte_mit_Rost gefunden werden und in Console als Bestätigung ausgeben
      // Wenn es die Rost-Nietplatte ist: suche rost1..rost3 und mach Materialien transparent
      if (item.name === "Nietplatte_mit_Rost") {
        // Suche und registriere die Rost-Teile in rostParts
        const rostParts = [];
        model.traverse((child) => {
          if (child.isMesh) {
            const n = (child.name || "").toLowerCase();
            if (n.includes("rost1") || n.includes("rost2") || n.includes("rost3") || n.includes("rost")) {
              rostParts.push(child);
            }
          }
        });

        models["Nietplatte_mit_Rost_children"] = rostParts; //Schlüssel-Wertpaar wird in dem Objekt "models" hinzugefügt
        // status-flag
        models["Nietplatte_mit_Rost_removedCount"] = 0;

        console.log("Gefundene Rost-Teile:", rostParts.map(p => p.name || p.uuid)); //map() ist eine Array-Methode, die jedes Element in einem Array durchgeht und ein neues Array erzeugt. jedes Element in rostParts soll durchgegangen werden(p) und den Namen zurückgeben, falls kein name vorhanden, dann die ID zurückgeben(--> über die THREE.js Kennung, die automatisch von THREE erzeugt wird = uuid) 
      }


      // checken, ob alle childobjekte an BoatPart-Model gefunden werden und registriere in boatTargets, und füge die gefundenen Modelle in das Objekt "models" ein (= hier sind sie als Modell zur Laufzeit abgelegt/referenzierbar)
      // Visualisirung des Colliders Hinzufgen über Box3Helper
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
        // Debugging: sichtbare Boxen (Box3Helper) direkt aus Box3 der targets ableiten. HelperBox (nur Visualisierung) ist also der Box3 (=tatsächliche Boundary= Collider) angefügt
        const targetHelpers = boatTargets.map(target => {
          const box = new THREE.Box3().setFromObject(target);
          const h = new THREE.Box3Helper(box, 0xff8800);
          h.visible = model.visible; // optional: an Parent koppeln
          scene.add(h);
          return h;
        });
        models.__debugHelpers.boatTargetBoxes = targetHelpers;
      }


        // Debugging: sichtbare Box direkt aus Box3 ableiten und per Box3Helper sichtbar machen an Nietplatte
        if (item.name === "Nietplatte") {
          const box = new THREE.Box3().setFromObject(model);
          const helper = new THREE.Box3Helper(box, 0x22aa22);
          helper.visible = model.visible; // optional: nur zeigen, wenn sichtbar
          scene.add(helper);
          models.__debugHelpers.nietplatteBox = helper;
        }


    }, undefined, (err) => {
      console.error("Fehler beim Laden von", item.url, err);
    });
  });

  
}

//für das ft_dropTrigger in interactions.js
// Liefert die Ziel-Kindobjekte im boatPart_wRivets, die als "Platzierungsstellen" gelten.
export function getBoatRivetTargets() {
  const targets = models["boatPart_wRivets_targets"] || [];
  return targets;
}



// Debugging: visible bounding boxes: Sichtbarkeit & Bounds der Boxen pro Frame updaten
export function updateDebugBoxesVisibilityAndBounds() {
  const np = models["Nietplatte"];
  const h1 = models.__debugHelpers.nietplatteBox;
  if (np && h1) {
    h1.visible = np.visible; // optional
    h1.box.setFromObject(np);
  }

  const parent = models["boatPart_wRivets"];
  const hs = models.__debugHelpers.boatTargetBoxes || [];
  const targets = models["boatPart_wRivets_targets"] || [];
  const show = !!(parent && parent.visible);
  hs.forEach((h, index) => { //für jedes Element (h) in dem Array hs, mit dem index (der aktuellen Position im Array, also zB. hs[1]) setze das Element auf visible = true wenn  Parent vorhanden und visisble ist
    h.visible = show;        // optional: BoxHelper nur zeigen, wenn Parent sichtbar
    const target = targets[index]; //für den index der Box3Helper-Box (zB hs[1]) wird das entsprechende Target (targets[1] gewählt), an dieses target wird dann die BoxHelper angepasst, indem auf das Property .box der Box3Helper zugegriffen wird.
    if (target) {
      h.box.setFromObject(target);
    }
  });
}
