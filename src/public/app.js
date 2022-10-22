//External Libraries
import * as THREE from "/modules/three.module.js";
import Stats from "/modules/stats.module.js";

//Internal Libraries
import { NoClipControls } from "/utils/NoClipControls.js";
import { Graph } from "/utils/Graph.js";

//THREE JS
let camera, scene, renderer, controls;
let stats;
let frameIndex = 0;

let time;
let prevTime;

let G = new Graph();

let G2 = new Graph();

init();
animate();

function init() {
  let createScene = function () {
    scene = new THREE.Scene();
    var loader = new THREE.TextureLoader(),
      texture = loader.load("/static/bg.jpg");
    scene.background = texture;
    scene.fog = new THREE.Fog(0x102234, 700, 1000);
  };
  createScene();

  let createLights = function () {
    // LIGHTS
    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);
  };
  createLights();

  let createStats = function () {
    stats = new Stats();
    container.appendChild(stats.dom);
  };
  createStats();

  let createRenderer = function () {
    //Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
  };
  createRenderer();

  let createCamera = function () {
    //Camera
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.y = 30;
    camera.position.z = 150;
    camera.position.x = 10;
  };
  createCamera();

  let createPlane = function () {
    let mat = new THREE.MeshPhongMaterial({
      wireframe: false,
      transparent: true,
      depthTest: true,
      side: THREE.DoubleSide,
      opacity: 1,
      color: new THREE.Color(0.5, 0.5, 0.5),
    });
    let geo = new THREE.PlaneGeometry(500, 500);
    let mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.y -= 50;
    mesh.castShadow = true;
    return mesh;
  };
  scene.add(createPlane());

  //NO CLIP CONTROLS
  controls = new NoClipControls(window, camera, document);

  // G Data representatio
  G = G._R(1000, 0);
  G.scene = scene;

  let G_params = {
    floatSpread: 0.01,
  };
  G.drawRandom(G_params);

  //##################################
}
function animate() {
  //Frame Start up
  requestAnimationFrame(animate);

  //   Update Graph
  if (frameIndex % 1 == 0) {
    G.update();
    // G2.update();
    // console.log(G2);
  }

  time = performance.now();
  controls.update(time, prevTime);

  renderer.render(scene, camera);

  stats.update();
  frameIndex += 1;

  //Frame Shut Down
  prevTime = time;
}
