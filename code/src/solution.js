import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

//let acc = 0.0001;

// Decrease the turn speed for slower rotation
//let turnSpeed = 0.0001;

//let drag = 0.98;
//let velocity = 0;
window.loop = (dt, input) => {
  if (iron_ball_2) {
    const movementSpeed = 0.01; // Adjust the movement speed as needed

    if (input.keys.has('ArrowUp')) {
      // Move forward (along the negative Z axis in Three.js)
      iron_ball_2.position.z -= movementSpeed * dt;
    }
    if (input.keys.has('ArrowDown')) {
      // Move backward (along the positive Z axis)
      iron_ball_2.position.z += movementSpeed * dt;
    }
    if (input.keys.has('ArrowLeft')) {
      // Move left (along the negative X axis)
      iron_ball_2.position.x -= movementSpeed * dt;
    }
    if (input.keys.has('ArrowRight')) {
      // Move right (along the positive X axis)
      iron_ball_2.position.x += movementSpeed * dt;
    }

    // Plane boundaries assuming the plane's center is at (0, 0) and scale is 50
    const planeBoundaryX = 50 / 2; // half the width
    const planeBoundaryZ = 50 / 2; // half the depth

    // Clamp the ball's position to the plane's boundaries
    iron_ball_2.position.x = Math.max(-planeBoundaryX, Math.min(planeBoundaryX, iron_ball_2.position.x));
    iron_ball_2.position.z = Math.max(-planeBoundaryZ, Math.min(planeBoundaryZ, iron_ball_2.position.z));

    // Look at the ball with the camera
    camera.lookAt(iron_ball_2.position);
  }
  renderer.render(scene, camera);
};


