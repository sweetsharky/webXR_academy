
// scene.js
// ============================================================
// THREE.js Grundaufbau: Szene, Kamera, Renderer, Licht, Clock
// ============================================================

import * as THREE from 'three';

export let camera, scene, renderer; //werden in andere Modulen benötigt. Light nicht, deswegen steht es nur 1x in der Funktion und, da sie nie überschrieben werden muss = const und kein let.
export const clock = new THREE.Clock();

export function initScene() {
  const container = document.createElement('div'); //1. div-Tag wird in HTML-document initialisiert, genannt "container"(=einfach nur der Name für diesen Wrapper)
  document.body.appendChild(container); //2. der div-Tag (=container) wird an den Body der HTML-Seite gehängt

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40); // der Browser weiß jederzeit was window ist, da es Teil der Web-API ist = globale Namespace.--> ist die (u.a.) Größe des Browserfensters, das der Nutzer öffnet mit innerWidth und innerHeight)
  scene.add(camera); // wichtig: Kamera in die Szene hängen, damit über camera.add(modelname) Kinder gerendert werden

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);
  
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true; // der WebGLRenderer muss für die webXR-Funktionen seine xr-rendering ermöglichen! --> WebXR wird quasi über den WebGLRenderer freigeschaltet!
  //Der Canvas (des Typs WebGLRenderer)  mit allen benötigten Funtionen (WebGLRenderer-Funktion über THREE, Anpassung an Fenstergröße des Geräts, XR enabled) wird dem HTML-Dokument hinzugefügt:
  container.appendChild(renderer.domElement); // 3. an den Div-container wird ein WebGLRenderer angehängt --> es wird automatisch ein <canva>-Tag geöffnet innerhalb des <div>! (da domElement des WebGLRenderer ein HTMLCanvasElemet ist) domElement = "A canvas where the renderer draws its output."
  renderer.domElement.classList.add('three.js-canvas'); //4. damit wir über CSS diesen Canvas anpassen können benennen wir ihn mit einer referenz "three.js-canvas" --> three.js Canvas soll in den Vordergrund für Touch-Interaktion 
  /*
  Durch Schritte 1-5. erreichen wir dies in der HTML-Datei:

      <body>
        <div>
            <canvas class="three.js-canvas"></canvas>
        </div>
      </body>

  */
}
