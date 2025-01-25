import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf7ffb3);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  alpha: true
});
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("canvas-container").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;

const light = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

let isTransitioning = false;
let transitionProgress = 0;
const TRANSITION_DURATION = 60;
const TRANSITION_DISTANCE = 10; // Distance to move models during transition

const loader = new GLTFLoader();
const modelPaths = [
  "models/model_1/scene.gltf",
  "models/model_2/scene.gltf",
  "models/model_3/scene.gltf",
];
const models = [];
let currentSlide = 0;
const maxSlides = modelPaths.length;
let transitionDirection = 1;

modelPaths.forEach((path, index) => {
  loader.load(
    path,
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(0.5, 0.5, 0.5);
      model.position.set(0, 0, 0);
      models.push(model);
      scene.add(model);
      
      model.visible = (index === 0);
    },
    undefined,
    (error) => console.error("Error loading model:", error)
  );
});

function performTransition() {
  if (!isTransitioning) return;

  transitionProgress++;
  const progress = transitionProgress / TRANSITION_DURATION;

  if (models.length === 0) return;

  const currentModel = models[currentSlide];
  const nextModelIndex = (currentSlide + transitionDirection + maxSlides) % maxSlides;
  const nextModel = models[nextModelIndex];

  // Smooth transition using sine interpolation
  const smoothProgress = Math.sin(progress * Math.PI);
  
  // Move current model out
  currentModel.position.x = -transitionDirection * smoothProgress * TRANSITION_DISTANCE;
  
  // Move next model in
  nextModel.position.x = transitionDirection * (1 - smoothProgress) * TRANSITION_DISTANCE;
  
  // Ensure both models are visible during transition
  currentModel.visible = true;
  nextModel.visible = true;

  // When transition is complete
  if (transitionProgress >= TRANSITION_DURATION) {
    isTransitioning = false;
    transitionProgress = 0;
    
    // Reset all model positions and visibility
    models.forEach((model, index) => {
      model.position.set(0, 0, 0);
      model.visible = (index === nextModelIndex);
    });
    
    currentSlide = nextModelIndex;
  }
}

document.getElementById("prev").addEventListener("click", () => {
  if (isTransitioning) return;
  isTransitioning = true;
  transitionProgress = 0;
  transitionDirection = -1;
});

document.getElementById("next").addEventListener("click", () => {
  if (isTransitioning) return;
  isTransitioning = true;
  transitionProgress = 0;
  transitionDirection = 1;
});

function animate() {
  requestAnimationFrame(animate);
  
  performTransition();
  
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});