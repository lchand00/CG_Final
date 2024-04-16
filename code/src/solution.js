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
  const texture = new THREE.TextureLoader().load('./assets/Grass_seamless.jpg');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
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
    const movementSpeed = 0.005; // Movement speed
    //const rollSpeed = 0.05; // Roll speed - adjust this for the size of the ball

    // Forward and backward movement - along the Z-axis
    if (input.keys.has('ArrowUp')) {
      iron_ball_2.position.z -= movementSpeed * dt;
      // Roll around the X-axis
      iron_ball_2.rotation.x -= movementSpeed * dt / (Math.PI * iron_ball_2.scale.x); // Assuming the ball's diameter is 1 unit
    }
    if (input.keys.has('ArrowDown')) {
      iron_ball_2.position.z += movementSpeed * dt;
      // Roll around the X-axis in the opposite direction
      iron_ball_2.rotation.x += movementSpeed * dt / (Math.PI * iron_ball_2.scale.x); // Assuming the ball's diameter is 1 unit
    }

    // Left and right movement - along the X-axis
    if (input.keys.has('ArrowLeft')) {
      iron_ball_2.position.x -= movementSpeed * dt;
      // Roll around the Y-axis
      iron_ball_2.rotation.z += movementSpeed * dt / (Math.PI * iron_ball_2.scale.z); // Assuming the ball's diameter is 1 unit
    }
    if (input.keys.has('ArrowRight')) {
      iron_ball_2.position.x += movementSpeed * dt;
      // Roll around the Y-axis in the opposite direction
      iron_ball_2.rotation.z -= movementSpeed * dt / (Math.PI * iron_ball_2.scale.z); // Assuming the ball's diameter is 1 unit
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