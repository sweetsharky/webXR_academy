<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Advanced Gui</title>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, user-scalable=no"
    />
    <link type="text/css" rel="stylesheet" href="style.css" />
    <script
      src="https://unpkg.com/three@0.133.0/build/three.js"
      crossorigin="anonymous"
    ></script>
    <style>
      .gui-button {
        right: 20px;
        position: absolute;
        bottom: 20px;
        padding: 12px 6px;
        border: 1px solid rgb(255, 255, 255);
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.1);
        color: rgb(255, 255, 255);
        font: 13px sans-serif;
        text-align: center;
        opacity: 0.5;
        outline: none;
        z-index: 999;
        cursor: pointer;
        left: calc(80% - 50px);
        width: 100px;
      }
    </style>
  </head>

  <body>
    <button id="color-change-button" class="gui-button">
      Color
    </button>
    <script type="module"> 
      import { ARButton } from "https://unpkg.com/three@0.133.0/examples/jsm/webxr/ARButton.js";

      let camera, scene, renderer;
      let mesh;

      init();
      animate();
      
      function getRandomInt(minimum, maximum) {
        const minInt = Math.ceil(minimum);
        const maxInt = Math.floor(maximum);
        return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
      }

      function init() {
        const container = document.createElement("div");
        document.body.appendChild(container);

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
          70,
          window.innerWidth / window.innerHeight,
          0.01,
          40
        );

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true; // New!
        container.appendChild(renderer.domElement);

        var light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        light.position.set(0.5, 1, 0.25);
        scene.add(light);

        const geometry = new THREE.IcosahedronGeometry(0.1, 1);
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color("rgb(226,35,213)"),
          shininess: 6,
          flatShading: true,
          transparent: 1,
          opacity: 0.8
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, -0.5);
        scene.add(mesh);
        
        const button = ARButton.createButton(renderer, {
          optionalFeatures: ["dom-overlay", "dom-overlay-for-handheld-ar"],
          domOverlay: {
            root: document.body
          }
        });
        document.body.appendChild(button);
        
        const colorChangeButton = document.getElementById('color-change-button');
        
        // The following code installs an event handler to selectively suppress XR events for that region, 
        // while continuing to generate XR events for other parts of the DOM overlay that are treated as 
        // transparent for interaction purposes.
        colorChangeButton.addEventListener('beforexrselect', ev => ev.preventDefault());
        
        // The following code adds a 'click' event handler for what to do when the button is pressed
        colorChangeButton.addEventListener('click', (event) => {
          const randomColor = `rgb(${getRandomInt(0, 360)}, ${getRandomInt(0, 360)}, ${getRandomInt(0, 360)})`;
          mesh.material.color = new THREE.Color(randomColor)
        });

        window.addEventListener("resize", onWindowResize, false);
      }

      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
      }

      function animate() {
        renderer.setAnimationLoop(render);
      }

      function render() {
        renderer.render(scene, camera);
      }
    </script>
  </body>
</html>
