<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Framerate Gui</title>
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
  </head>

  <body>
    <script type="module"> 
      // A stats panel can help you measure framerate and how fast your application is running
      // The three.js stats panel has three modes. The first FPS one is probably all you need though
      // 1. FPS Frames rendered in the last second. The higher the number the better.
      // 2. MS Milliseconds needed to render a frame. The lower the number the better.
      // 3. MB MBytes of allocated memory. (You need to run Chrome with --enable-precise-memory-info to see)
      
      import { ARButton } from "https://unpkg.com/three@0.133.0/examples/jsm/webxr/ARButton.js";
      import Stats from "https://unpkg.com/three@0.133.0/examples/jsm/libs/stats.module.js";

      let camera, scene, renderer;
      let mesh;
      let stats;

      init();
      animate();
      
      function createStats() {
        stats = new Stats();
        stats.setMode(0);

        // assign css to align it properly on the page
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0';
        stats.domElement.style.top = '0';
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
        
        // add a framerate pane to the page
        createStats();
        document.body.appendChild(stats.domElement); // append the stats panel to the page

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
        stats.update(); // stats object calculates the amount of time in between frames
      }
    </script>
  </body>
</html>
