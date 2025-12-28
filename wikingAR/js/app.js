
// app.js
// ============================================================
// Master-Datei: orchestriert Scene, XR, Models, UI, Interactions
// Startet Render-Loop (XR-kompatibel) + Resize
// ============================================================

import { initScene, scene, camera, renderer, clock } from './scene.js';
import { initXR } from './xr.js';
import { loadModels, models, mixers } from './models.js';
import { initInteractions, updateGrabFollowCamera } from './interactions.js';
import { initUI, startTextEngine, updatePerFrameUI } from './ui.js';

// ------------------------------------------------------------
// Bootstrapping-Reihenfolge --> entspricht Unity's start()!
// ------------------------------------------------------------
initScene();                 // Szene/Kamera/Renderer + Canvas
initXR(renderer);            // ARButton + Intro/Session Handling
loadModels(scene);           // GLTFs laden + Registry/Animations
initUI(models, renderer);    // Buttons/Panels/Video/Modell-Toggles
initInteractions(models, camera, renderer); // Rotation/Drag&Drop/Greifen
startTextEngine();           // Text/Steps starten (showPage(0))

// ------------------------------------------------------------
// Render-Loop (XR-kompatibel) --> entspricht Unity's update()
// ------------------------------------------------------------
renderer.setAnimationLoop(() => {
  // Start: für natürliche Animation über delta
  // update aller Mixer
  const delta = clock.getDelta();
  if (mixers.length > 0) {
    for (let i = 0; i < mixers.length; i++) {
      mixers[i].update(delta);
    }
  }
  // Ende: für natürliche Animation

  // Greifen: Modell vor Kamera positionieren, falls aktiv
  updateGrabFollowCamera(camera);

  // Optional: pro Frame UI-Updates
  updatePerFrameUI?.();

  renderer.render(scene, camera);
});

// ------------------------------------------------------------
// EventListener --> entspricht den Listener in Unitys Eventsystem, die getriggert werden, sobald ausgelöst (OnTriggerEnter(), OnMouseDown()...)
// ------------------------------------------------------------
window.addEventListener('resize', () => {
  // Three.js anpassen
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
