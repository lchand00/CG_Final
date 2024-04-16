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
  texture.repeat.set(10, 10);
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
    const movementSpeed = 0.005; // Adjust the movement speed as needed
    const rotationSpeed = 0.5;

    // Forward and backward movement - along the Z-axis
    if (input.keys.has('ArrowUp')) {
      iron_ball_2.position.z -= movementSpeed * dt;
      iron_ball_2.rotation.y += rotationSpeed * dt;
    }
    if (input.keys.has('ArrowDown')) {
      iron_ball_2.position.z += movementSpeed * dt;
      iron_ball_2.rotation.y += rotationSpeed * dt;
    }

    // Left and right movement - along the X-axis
    if (input.keys.has('ArrowLeft')) {
      iron_ball_2.position.x -= movementSpeed * dt;
      iron_ball_2.rotation.y += rotationSpeed * dt;
    }
    if (input.keys.has('ArrowRight')) {
      iron_ball_2.position.x += movementSpeed * dt;
      iron_ball_2.rotation.y += rotationSpeed * dt;
    }
    

    // Clamp the ball's position to the plane's boundaries
    const planeBoundaryX = 50 / 2; // half the width
    const planeBoundaryZ = 50 / 2; // half the depth
    iron_ball_2.position.x = Math.max(-planeBoundaryX, Math.min(planeBoundaryX, iron_ball_2.position.x));
    iron_ball_2.position.z = Math.max(-planeBoundaryZ, Math.min(planeBoundaryZ, iron_ball_2.position.z));

    // Keep the camera looking at the ball
    camera.lookAt(iron_ball_2.position);
  }

  // Render the scene
  renderer.render(scene, camera);
};




