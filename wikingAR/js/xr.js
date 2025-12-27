
// xr.js
// ============================================================
// WebXR-Integration: ARButton + Sessionstart/-ende, Intro-Overlay
// Video-Panel 'nietVideo' (Skip-Button), Grid-Visibility
// ============================================================

import { ARButton } from 'https://unpkg.com/three@0.133.0/examples/jsm/webxr/ARButton.js';

export function initXR(renderer) {
  document.body.appendChild(ARButton.createButton(renderer, {
    optionalFeatures: ["dom-overlay", "dom-overlay-for-handheld-ar"],
    domOverlay: { root: document.body }
  }));

  // Intro-video und -Button & nietVideo
  const overlay = document.getElementById("intro-overlay");
  const introVideo = document.getElementById("intro-video");
  const continueButton_intro = document.getElementById("continueButton_intro");
  const continueButton_nietVideo = document.getElementById("continueButton_nietVideo");

  // Wenn eine AR-Session startet → Intro-video starten und später UI einblenden
  renderer.xr.addEventListener('sessionstart', () => {
    // 1. Intro-Overlay anzeigen und video starten
    overlay.style.display = "flex";
    introVideo.play();
    continueButton_intro.style.display = "block";
  });

  // Continue-Button_intro → Overlay schließen und Grid freigeben
  continueButton_intro.addEventListener("click", () => {
    overlay.remove(); // mit remove() wird das Video auch vom DOM getrennt, statt nur overlay.style.display = "none"; --> mehr Speicher wird frei
    document.querySelector('.grid-container').style.display = "grid"; // UI freigeben
  });

  // continueButton_nietVideo → Video schließen
  continueButton_nietVideo.addEventListener("click", () => {
    const video = document.getElementById('nietVideo');
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.removeAttribute("src"); //Video-Quelle entfernen
      video.load(); // zwingt Browser, Quelle zu entladen --> removeAttribute() und load() arbeiten also zusammen wie staging und push bei Git
    }
    document.querySelector('.item2_2').style.display = 'none';
  });

  // Wenn AR-Session beendet → UI ausblenden
  renderer.xr.addEventListener('sessionend', () => {
    document.querySelector('.grid-container').style.display = 'none';
  });

  // Button, um UI-Panel (grid-Layout) sichtbar/unsichtbar
  document.getElementById('toggle-panel').addEventListener('click', () => {
    document.querySelector('.grid-container').classList.toggle('hide');
  });
}
