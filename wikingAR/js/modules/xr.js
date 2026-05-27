
// xr.js
// ============================================================
// WebXR-Integration: ARButton + Sessionstart/-ende, Intro-Overlay
// Video-Panel 'nietVideo' (Skip-Button), Grid-Visibility
// ============================================================

import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { models } from './models.js';

export function initXR(renderer) {
  document.body.appendChild(ARButton.createButton(renderer, {
    optionalFeatures: ["dom-overlay", "dom-overlay-for-handheld-ar"],// Standardkonfiguration: 1. erstellt den ARButton von three.js. und verbindet ihn mit dem renderer (THREE.WebGLRenderer, der in scene.js initialisiert wurde) 2. ermöglicht, dass normale DOM-Elemente (Buttons, Panels, Overlays über das Kamerabild/AR-View) erlaubt sind. --> damit ich das normale DOM als UI nuten kann.
    domOverlay: { root: document.body }
  }));

  // Intro-video und -Button & nietVideo
  const overlay = document.getElementById("intro-overlay");
  const introVideo = document.getElementById("intro-video");
  const continueButton_intro = document.getElementById("continueButton_intro");
  const continueButton_nietVideo = document.getElementById("continueButton_nietVideo");

  // Wenn eine AR-Session startet → Intro-video starten und später UI einblenden
  //'sessionstart' ist ein Three.js-Event aus dem WebXRManager(= renderer.xr). Wenn der AR-Startbutton geklickt wird, dann wird die XR-Session gestartet und renderer.xe feuert das Event 'sessionstart'. Sobald das passiert können wir also dieses Event abfangen und sagen, was nun gemacht werden soll. 
  renderer.xr.addEventListener('sessionstart', () => {
    // 1. Intro-Overlay anzeigen und video starten
    overlay.style.display = "flex";
    introVideo.play();
    continueButton_intro.style.display = "block";
  });

  // Continue-Button_intro → Overlay schließen und Grid freigeben
  continueButton_intro.addEventListener("click", () => {
    overlay.remove(); // mit remove() wird das ganze div-Element, indem das Video verschachtelt ist vom DOM gelöscht, statt nur overlay.style.display = "none"; --> mehr Speicher wird frei
    document.querySelector('.grid-container').style.display = "grid"; // UI freigeben
    models['Nietplatte_mit_Rost'].visible = true;
    models['Schiffsniet_originalTextur'].visible = true;
  });

  // continueButton_nietVideo → Video schließen
  continueButton_nietVideo.addEventListener("click", () => {
    const video = document.getElementById('nietVideo');
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    document.querySelector('.item2_2').style.display = 'none';
  });

  // Wenn AR-Session beendet → UI ausblenden
  renderer.xr.addEventListener('sessionend', () => {
    document.querySelector('.grid-container').style.display = 'none';
  });
}
