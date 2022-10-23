//External Libraries
import * as THREE from "/modules/three.module.js";
import Stats from "/modules/stats.module.js";
import { Octree } from "/modules/Octree.js";
import { OctreeHelper } from "/modules/OctreeHelper.js";
//Internal Libraries
import { NoClipControls } from "/utils/NoClipControls.js";
import { Graph } from "/utils/Graph.js";
import { RadialSource } from "/utils/RadialSource.js";
import { Mirror } from "/utils/Mirror.js";

//THREE JS
let camera, scene, renderer, controls;
let stats;
let frameIndex = 0;

let time;
let prevTime;

let S; //RadialSource
let M; //Mirror

let worldOctree;
let octreeObjects = new THREE.Group();

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

  // let createPlane = function () {
  //   let mat = new THREE.MeshPhongMaterial({
  //     wireframe: false,
  //     transparent: false,
  //     depthTest: true,
  //     side: THREE.DoubleSide,
  //     opacity: 1,
  //     color: new THREE.Color(0.5, 0.5, 0.5),
  //   });
  //   let geo = new THREE.PlaneGeometry(500, 500);
  //   let mesh = new THREE.Mesh(geo, mat);
  //   mesh.rotation.x = Math.PI / 2;
  //   mesh.position.y -= 50;
  //   mesh.castShadow = true;
  //   return mesh;
  // };
  // scene.add(createPlane());

  //NO CLIP CONTROLS
  controls = new NoClipControls(window, camera, document);

  //##############################################################################
  //App Manager
  //##############################################################################

  //Mirror
  M = new Mirror(scene);
  M.create(0, -25, 0, Math.PI / 2, 0, 0);
  M.create(0, 25, 0, Math.PI / 2, 0, 0);
  M.create(25, 0, 0, 0, Math.PI / 2, 0);
  M.create(-25, 0, 0, 0, Math.PI / 2, 0);
  M.create(0, 0, 25, 0, 0, Math.PI / 2);
  M.create(0, 0, -25, 0, 0, Math.PI / 2);
  // M.createSphere(0, 0, 0, Math.PI / 2, 0, 0);
  // M.create(25, 25, 0, Math.PI / 2, Math.PI / 4, Math.PI / 3);
  // M.create(-25, 25, 0, 0, Math.PI / 2, 0);
  //##############################################################################
  //Octree Setup
  //##############################################################################

  worldOctree = new Octree();
  for (let i = 0; i < M.mirrors.length; i++) {
    octreeObjects.add(M.mirrors[i]);
  }
  // octreeObjects.add(mirrors);
  worldOctree.fromGraphNode(octreeObjects);

  //Helper
  // const octreeHelper = new OctreeHelper(worldOctree);
  // scene.add(octreeHelper);
  console.log(worldOctree);

  //Radial Source
  let params = {
    num_particles: 50000,
    initial_position: new THREE.Vector3(0, 0, 0),
    initial_velocity: 0.1,
  };
  S = new RadialSource(
    scene,
    params.num_particles,
    params.initial_position,
    params.initial_velocity,
    worldOctree
  );
  S.initVertices();
  S.initVelocities();
  S.drawParticles();
  S.tstep();

  //

  //##################################
}
function animate() {
  //Frame Start up
  requestAnimationFrame(animate);

  //   Update Graph
  if (frameIndex % 1 == 0) {
    S.tstep();
  }

  time = performance.now();
  controls.update(time, prevTime);

  renderer.render(scene, camera);

  stats.update();
  frameIndex += 1;

  //Frame Shut Down
  prevTime = time;
}
