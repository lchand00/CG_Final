import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let renderer, scene, camera, iron_ball_2, bones = [];

const loadModel = (url) => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => resolve(gltf.scene),
      undefined, // Removed progress logging to simplify
      (error) => {
        console.error(`Failed to load ${url}:`, error);
        reject(error);
      }
    );
  });
};

window.init = async () => {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);

  // Lighting setup
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(directionalLight);

  // Ground plane with texture
  const planeGeo = new THREE.PlaneGeometry(100, 100);
  const planeTexture = new THREE.TextureLoader().load('./assets/Grass_seamless.jpg');
  const planeMat = new THREE.MeshBasicMaterial({ map: planeTexture });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  try {
    iron_ball_2 = await loadModel('./assets/iron_ball_2/scene.gltf');
    iron_ball_2.position.set(0, 1, 0);
    iron_ball_2.scale.set(0.2, 0.2, 0.2);
    scene.add(iron_ball_2);

    const bone = await loadModel('./assets/eigg_dinosaur_bone/scene.gltf');
    bone.scale.set(0.1, 0.1, 0.1);

    const numBones = 20;
    const planeSize = 50;
    for (let i = 0; i < numBones; i++) {
      const x = Math.random() * planeSize - planeSize / 2;
      const z = Math.random() * planeSize - planeSize / 2;
      const boneClone = bone.clone();
      boneClone.position.set(x, 0.5, z);
      scene.add(boneClone);
      bones.push(boneClone);
    }
  } catch (error) {
    console.error('Error during initialization:', error);
  }
};

window.loop = (dt, input) => {
  if (!iron_ball_2) return;

  const moveSpeed = 0.02 * dt;

  // Ball movement logic with boundary checks
  if (input.keys.has('ArrowUp')) iron_ball_2.position.z -= moveSpeed;
  if (input.keys.has('ArrowDown')) iron_ball_2.position.z += moveSpeed;
  if (input.keys.has('ArrowLeft')) iron_ball_2.position.x -= moveSpeed;
  if (input.keys.has('ArrowRight')) iron_ball_2.position.x += moveSpeed;

  // Bone catching logic with debugging
  const catchThreshold = 1.5; 
  for (const bone of bones) {
    const distance = iron_ball_2.position.distanceTo(bone.position);
    console.log(`Distance between iron_ball_2 and bone: ${distance}`);

    if (distance < catchThreshold) {
      console.log('Caught a bone!');
      scene.remove(bone); // Remove bone from scene
      iron_ball_2.scale.multiplyScalar(1.1); // Scale up the iron ball
      bones = bones.filter(b => b !== bone); // Update bones array
    }
  }

  // Keep the camera focused on the ball
  camera.lookAt(iron_ball_2.position);
  renderer.render(scene, camera);
};
