
// app.js
// ============================================================
// Master-Datei: orchestriert Scene, XR, Models, UI, Interactions
// Startet Render-Loop (XR-kompatibel) + Resize
// ============================================================

import { initScene, scene, camera, renderer, clock } from './scene.js';
import { initXR } from './xr.js';
import { loadModels, models, mixers } from './models.js';
import { initInteractions, updateGrabFollowCamera, updatePerFrameCollisionNietplatte } from './interactions.js';
import { initUI, startTextEngine, initFeedbackListener, updatePerFrameUI } from './ui.js';

// ------------------------------------------------------------
// Bootstrapping-Reihenfolge --> entspricht Unity's start()!
// ------------------------------------------------------------
initScene();                 // Szene/Kamera/Renderer + Canvas
initXR(renderer);            // ARButton + Intro/Session Handling
loadModels(scene);           // GLTFs laden + Registry/Animations
initUI(models, renderer);    // Buttons/Panels/Video/Modell-Toggles
initFeedbackListener();     //für ft_dragTrigger: Feedback bei korrekter Kollision
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


  // Greifen: Modell vor Kamera positionieren, Objekt vor Kamera halten (funktion prüft intern, ob isGrabbed=true)
  updateGrabFollowCamera(camera);
  //updatePerFrameCollisionNietplatte(); // optional, nur wenn continuous Kollisionstest gewünscht ist (siehe interactions.js)

  // Optional: pro Frame UI-Updates
  //updatePerFrameUI?.();

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
