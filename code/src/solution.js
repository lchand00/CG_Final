import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let renderer, scene, camera, symmetrical_abstract_ball;

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
  const texture = new THREE.TextureLoader().load('./assets/rocks.jpg');
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

  symmetrical_abstract_ball = await load('./assets/symmetrical_abstract_ball/scene.gltf');
  symmetrical_abstract_ball.position.y += 1.5; // Keep model lifted above the plane
  symmetrical_abstract_ball.scale.set(0.1, 0.1, 0.1); // Scale down the model
  scene.add(symmetrical_abstract_ball);

  console.log('made a scene', symmetrical_abstract_ball);
};

let acc = 0.001;

// Decrease the turn speed for slower rotation
let turnSpeed = 0.001;

let drag = 0.98;
let velocity = 0;
window.loop = (dt, input) => {
  if (symmetrical_abstract_ball) {
    if (input.keys.has('ArrowUp')) {
      velocity = Math.min(1, velocity + dt * acc);
    } else if (input.keys.has('ArrowDown')) {
      velocity = Math.max(-1, velocity - dt * acc);
    } else {
      velocity *= drag;
    }

    if (input.keys.has('ArrowLeft')) {
      symmetrical_abstract_ball.rotateY(turnSpeed * dt * velocity);
    } else if (input.keys.has('ArrowRight')) {
      symmetrical_abstract_ball.rotateY(-turnSpeed * dt * velocity);
    }

    const forward = new THREE.Vector3();
    symmetrical_abstract_ball.getWorldDirection(forward);
    symmetrical_abstract_ball.position.addScaledVector(forward, velocity * dt);

    camera.lookAt(symmetrical_abstract_ball.position);
  }
  renderer.render(scene, camera);
};

// Start the application by calling the init function
//window.init();
