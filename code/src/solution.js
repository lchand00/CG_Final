import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
//import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let renderer, scene, camera, iron_ball_2;

const load = (url) => new Promise((resolve, reject) => {
  const loader = new GLTFLoader();
  loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
});

window.init = async () => {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(10, 10, 10); // Updated camera position
  camera.lookAt(0, 0, 0);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
  scene.add(directionalLight);

  const geometry = new THREE.PlaneGeometry(1, 1);
  const texture = new THREE.TextureLoader().load('./assets/153_artificial green grass texture-seamless.jpg');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(50, 50);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotateX(-Math.PI / 2);
  plane.scale.set(50, 50, 50);
  scene.add(plane);

  iron_ball_2 = await load('./assets/iron_ball_2/scene.gltf');
  iron_ball_2.position.y += 1.5; // Keep model lifted above the plane
  iron_ball_2.scale.set(0.2, 0.2, 0.2); // Scale down the model
  scene.add(iron_ball_2);

  console.log('made a scene', iron_ball_2);
};

window.loop = (dt, input) => {
  if (iron_ball_2) {
    const movementSpeed = 0.1; // Adjust the movement speed as needed

    // Movement based on keyboard input
    if (input.keys.has('ArrowUp')) {
      iron_ball_2.position.z -= movementSpeed * dt;
    }
    if (input.keys.has('ArrowDown')) {
      iron_ball_2.position.z += movementSpeed * dt;
    }
    if (input.keys.has('ArrowLeft')) {
      iron_ball_2.position.x -= movementSpeed * dt;
    }
    if (input.keys.has('ArrowRight')) {
      iron_ball_2.position.x += movementSpeed * dt;
    }

    // Clamp the ball's position to the plane's boundaries
    const planeBoundaryX = 50 / 2; // half the width
    const planeBoundaryZ = 50 / 2; // half the depth
    iron_ball_2.position.x = Math.max(-planeBoundaryX, Math.min(planeBoundaryX, iron_ball_2.position.x));
    iron_ball_2.position.z = Math.max(-planeBoundaryZ, Math.min(planeBoundaryZ, iron_ball_2.position.z));

    // Update the camera to follow the ball's movement
    camera.position.x = iron_ball_2.position.x + 10;
    camera.position.z = iron_ball_2.position.z + 10;
    camera.lookAt(iron_ball_2.position);
  }

  // Render the scene
  renderer.render(scene, camera);
};
