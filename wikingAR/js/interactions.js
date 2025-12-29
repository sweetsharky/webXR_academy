
// interactions.js
// ============================================================
// Interaktionen:
// - Rotation via Touch (nur rotatable=true)
// - Drag&Drop Rostteile (Raycast + Ebene)
// - Greifen/Ablegen: Nietplatte folgt Kamera
// ============================================================

import * as THREE from 'https://unpkg.com/three@0.133.0/build/three.module.js';
import { getBoatRivetTargets, models } from './models.js';


let previousTouch = null;
let rotating = false; // Flag, ob Rotation aktiv ist
let activeModel = null;

// Drag&Drop (Rostteile)
let raycaster, touchPos, dragging, dragOffset, dragPlane, planeIntersectPoint;

// Greifen/Ablegen
let isGrabbed = false;
let grabbedModel = null;


// Umschalter für Kollisionsmodus:'drop' (empfohlen) = nur beim Loslassen prüfen; 'continuous' = pro Frame prüfen (kostet mehr CPU).
let COLLISION_MODE = 'drop';
export function setCollisionMode(mode) {
  COLLISION_MODE = mode === 'continuous' ? 'continuous' : 'drop';
}


// Exportierte Hilfsfunktion für den Render-Loop
export function updateGrabFollowCamera(camera) {
  //Gegriffenes Modell soll mit Camera "mitwandern", um Position im Raum zu verändern.
  if (isGrabbed && grabbedModel) {
    // Position etwas vor die Kamera setzen (z.B. 0.5m)
    const offset = new THREE.Vector3(0, 0, -0.5);
    offset.applyMatrix4(camera.matrixWorld);
    grabbedModel.position.copy(offset);
  }
}

export function initInteractions(models, camera, renderer) {
  // ---------------------------
  // Rotation via Touch (Raycast)
  // ---------------------------
  renderer.domElement.addEventListener('touchstart', (event) => {
    if (event.touches.length === 1) {
      const touch = new THREE.Vector2();
      touch.x = (event.touches[0].pageX / window.innerWidth) * 2 - 1;
      touch.y = -(event.touches[0].pageY / window.innerHeight) * 2 + 1;

      const rc = new THREE.Raycaster();
      rc.setFromCamera(touch, camera);

      // Nur sichtbare Modelle prüfen
      const visibleModels = Object.values(models).filter(m => m && m.visible);
      const intersects = rc.intersectObjects(visibleModels, true);

      if (intersects.length > 0) {
        // Das getroffene Modell als activeModel speichern
        let intersected = intersects[0].object;

        // Falls das getroffene Objekt ein Kind ist, gehe zum Root-Model
        while (intersected && !visibleModels.includes(intersected)) {
          intersected = intersected.parent;
        }

        // nur Modelle, die rotiert werden sollen (='rotatabel: true,') auf "rotating = true" setzen
        if (intersected && intersected.userData && intersected.userData.rotatable) {
          activeModel = intersected;
          rotating = true;
          previousTouch = { x: event.touches[0].pageX, y: event.touches[0].pageY };
        }
      }
    }
  }, false);

  renderer.domElement.addEventListener('touchmove', (event) => {
    if (event.touches.length === 1 && previousTouch && rotating && activeModel) {
      const deltaX = event.touches[0].pageX - previousTouch.x;
      const deltaY = event.touches[0].pageY - previousTouch.y;

      activeModel.rotation.y += deltaX * 0.01;
      activeModel.rotation.x += deltaY * 0.01;

      previousTouch = { x: event.touches[0].pageX, y: event.touches[0].pageY };
    }
  }, false);

  renderer.domElement.addEventListener('touchend', () => {
    rotating = false;
    previousTouch = null;
    activeModel = null;
  }, false);

  // ---------------------------
  // Drag & Drop via Touch (Raycast + Ebenenprojektion) – rostteile
  // ---------------------------
  raycaster = new THREE.Raycaster();
  touchPos = new THREE.Vector2();
  dragging = null; // das aktuell gezogene Rost-Mesh
  dragOffset = new THREE.Vector3();
  dragPlane = new THREE.Plane();
  planeIntersectPoint = new THREE.Vector3();

  renderer.domElement.addEventListener('touchstart', (ev) => {
    if (!models["Nietplatte_mit_Rost"] || !models["Nietplatte_mit_Rost"].visible) return;
    if (ev.touches.length !== 1) return;

    const t = ev.touches[0];
    touchPos.x = (t.pageX / window.innerWidth) * 2 - 1;
    touchPos.y = -(t.pageY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(touchPos, camera);

    // wir prüfen nur die Rost-Teile (falls vorhanden)
    const rostParts = models["Nietplatte_mit_Rost_children"] || [];
    if (rostParts.length === 0) return;

    // Intersect mit diesen Teilen
    const intersects = raycaster.intersectObjects(rostParts, true);
    if (intersects.length > 0) {
      // wähle den Mesh, setze dragging
      dragging = intersects[0].object;
      // setze Plane: senkrecht zur Kamera durch das Objekt (so bleibt es "auf dem Bildschirm")
      const objWorldPos = new THREE.Vector3();
      dragging.getWorldPosition(objWorldPos);
      // plane normal entlang camera.getWorldDirection()
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir).negate(); // für Plane-Normal
      dragPlane.setFromNormalAndCoplanarPoint(camDir, objWorldPos);
      // berechne initialen offset (maintain grab point)
      raycaster.ray.intersectPlane(dragPlane, planeIntersectPoint);
      dragOffset.copy(planeIntersectPoint).sub(objWorldPos);

      // Optionale visuelle Rückmeldung: etwas skalieren / highlight
      dragging.scale.multiplyScalar(1.05);
    }
  }, { passive: false });

  renderer.domElement.addEventListener('touchmove', (ev) => {
    if (!dragging) return;
    if (ev.touches.length !== 1) return;
    ev.preventDefault();
    const t = ev.touches[0];
    touchPos.x = (t.pageX / window.innerWidth) * 2 - 1;
    touchPos.y = -(t.pageY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(touchPos, camera);
    if (raycaster.ray.intersectPlane(dragPlane, planeIntersectPoint)) {
      // berechne neue Weltposition - offset abziehen
      const newWorldPos = new THREE.Vector3().copy(planeIntersectPoint).sub(dragOffset);
      // wenn das dragging Objekt Kind eines Modells ist => transformiere ggf. in lokalen Koordinaten
      // Wir setzen position in world space, dazu parent.worldToLocal
      const parent = dragging.parent;
      if (parent) {
        parent.worldToLocal(newWorldPos);
        dragging.position.copy(newWorldPos);
      } else {
        dragging.position.copy(newWorldPos);
      }
    }
  }, { passive: false });

  renderer.domElement.addEventListener('touchend', (ev) => {
    if (!dragging) return;

    // kleine Rücksetzung der Skalierung
    dragging.scale.multiplyScalar(1 / 1.05);

    // Entfernen-Logik: wenn das Teil weit genug weg vom Ursprung der Nietplatte ist oder außerhalb eines Radius --> entfernen
    const parentModel = models["Nietplatte_mit_Rost"];
    const worldPos = new THREE.Vector3();
    dragging.getWorldPosition(worldPos);

    // referenzpunkt: parentModel world pos (falls vorhanden)
    const parentWorld = new THREE.Vector3();
    parentModel.getWorldPosition(parentWorld);

    const dist = worldPos.distanceTo(parentWorld);
    const removeThreshold = 0.05; // in Metern: anpassen falls nötig

    if (dist > removeThreshold) {
      // animate scale & fade-out, dann visible=false und count++
      const removedMesh = dragging;
      // fade out this mesh (material opacity -> 0)
      const fadeDuration = 400;
      const startTime = performance.now();
      // ensure materials transparent
      removedMesh.traverse((c) => { if (c.isMesh) { if (Array.isArray(c.material)) c.material.forEach(m=>m.transparent=true); else if(c.material) c.material.transparent=true; }});
      function fadeStep(t) {
        const p = Math.min(1, (t - startTime) / fadeDuration);
        const val = 1 - p;
        removedMesh.traverse((c) => {
          if (c.isMesh) {
            if (Array.isArray(c.material)) c.material.forEach(m => { if (m) m.opacity = val; });
            else if (c.material) c.material.opacity = val;
          }
        });
        removedMesh.scale.setScalar(1 - 0.7 * p); // leicht schrumpfen
        if (p < 1) requestAnimationFrame(fadeStep);
        else {
          removedMesh.visible = false;
          // markiere als entfernt
          const childrenList = models["Nietplatte_mit_Rost_children"] || [];
          // Setze removedCount
          models["Nietplatte_mit_Rost_removedCount"] = (models["Nietplatte_mit_Rost_removedCount"] || 0) + 1;
          // optional: entferne aus array
          const idx = childrenList.indexOf(removedMesh);
          if (idx !== -1) childrenList.splice(idx, 1);
          console.log("Rost-Teil entfernt, verbleibend:", childrenList.length);
          // wenn alle entfernt -> trigger nextStep
          if (childrenList.length === 0) {
            // Nietplatte einblenden, Nietplatte_mit_Rost ausblenden
            const clean = models["Nietplatte"];
            const rusty = models["Nietplatte_mit_Rost"];
            if (clean) {
              clean.visible = true;

              // Greifbutton sichtbar 
              const grabBtn = document.getElementById("grab-nietplatte");
              if (grabBtn) grabBtn.style.display = "block";
            }
            if (rusty) {
              // rusty ausblenden
              rusty.visible = false;
              // nachdem rusty ausgeblendet: trigger next learning step
              console.log("Alle Rost-Teile entfernt -> nextStepButton triggern");
              // wenn nextStepButton existiert: click auslösen
              const nextStepButton = document.getElementById('nextStepButton');
              if (nextStepButton) {
                // Sicherheit: make it visible then trigger click so die UI-Logik läuft
                nextStepButton.style.display = "block";
                nextStepButton.click();
              }
            } else {
              // fallback: direkt triggern
              const nextStepButton = document.getElementById('nextStepButton');
              if (nextStepButton) { nextStepButton.style.display = "block"; nextStepButton.click(); }
            }
          }
        }
      }
      requestAnimationFrame(fadeStep);
    } 

    // reset dragging state
    dragging = null;
  }, { passive: false });

  // ---------------------------
  // Greif-Button-Logik
  // ---------------------------
  const grabButton = document.getElementById("grab-nietplatte");
  grabButton.addEventListener("touchstart", (e) => {
    e.preventDefault(); // verhindert Ghost-Clicks
    if (models["Nietplatte"] && models["Nietplatte"].visible) {
      grabbedModel = models["Nietplatte"];
      isGrabbed = true;
      grabButton.classList.add("grabbing"); // visuelles Feedback aktiv
    }
  });

  grabButton.addEventListener("touchend", () => {
    isGrabbed = false;
    grabbedModel = null;
    grabButton.classList.remove("grabbing"); // visuelles Feedback deaktivieren

  // 👉 Kollisionsprüfung NUR beim Ablegen (drop), durchgehend dann mit (continue) oben in Umschalter ändern.
  // Eine Frame-Verzögerung (über requestAnimationFrame()), damit updateGrabFollowCamera NICHT mehr läuft und das getragene Objekt (=Nietplatte) bei der Kollisionsdprüfung nicht mehr an der Kamera hängt, sondern sich in Weltkoordinaten befindet, wenn geprüft wird NACH dem Ablegen (und nicht im selben Frame, also nicht innerhalb von FollowCamera)!
  requestAnimationFrame(() => {
    checkNietplatteAgainstTargets();
  });

  });
}


// Zwei (Die Dritte ist optional, wegen durchgehender Kollisionsprüfung(viel Berechnung!): updatePerFrameCollisionNietplatte()) Funktionen für ft_dropTrigger --> Kollisionserkennung mit Bounding-Box
  // Berechnet eine Welt-Bounding-Box für ein Objekt
  function getWorldBox3(object) {
    // zur Sicherheit die Matrix aktualisieren
    object.updateMatrixWorld(true);
    const box = new THREE.Box3();
    box.setFromObject(object); // liefert Weltkoordinaten, wenn MatrixWorld stimmt
    return box;
  }

  // Kollisionsprüfung: Prüft Nietplatte vs. alle Ziel-Targets; wir nehmen eine Toleranz.
  function checkNietplatteAgainstTargets() {
    const nietplatte = models["Nietplatte"];
    const targets = getBoatRivetTargets();
    if (!nietplatte || !targets || targets.length === 0) return false;

    const plateBox = getWorldBox3(nietplatte);

    // Toleranz für einfacheren Treffer (z. B. 2 cm)
    const TOLERANCE = 0.05;

    for (const t of targets) {
      const tBox = getWorldBox3(t);
      // Box des Targets leicht vergrößern
      const expanded = tBox.clone().expandByScalar(TOLERANCE);
      if (plateBox.intersectsBox(expanded)) {
        // Treffer → Event senden
        window.dispatchEvent(new CustomEvent('nietplatte:placedCorrect', {
          detail: { targetName: t.name || '(unbenannt)' }
        }));
        return true;
      }
    }
    return false;
  }


  // optionale Funktion, wenn Kollisionstest pro Frame gewünscht ist und nicht nur bei Ablage
  export function updatePerFrameCollisionNietplatte() {
    if (COLLISION_MODE !== 'continuous') return;
    // Nur prüfen, wenn Nietplatte gerade getragen wird:
    if (isGrabbed) {
      checkNietplatteAgainstTargets();
    }
  }


