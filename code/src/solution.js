import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Game variables
let renderer, scene, camera, iron_ball_2;
const numRocks = 15;
let remainingRocks = numRocks;
let gameOver = false;
const clock = new THREE.Clock(); // Used for determining delta time

// Input handling
const keysPressed = new Set();
document.addEventListener('keydown', (event) => keysPressed.add(event.key));
document.addEventListener('keyup', (event) => keysPressed.delete(event.key));

// Utility to load GLTF models
const load = (url) => new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
});

// Initialize the scene
window.init = async () => {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    scene.add(directionalLight);

    const geometry = new THREE.PlaneGeometry(1, 1);
    const texture = new THREE.TextureLoader().load('./assets/Grass.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotateX(-Math.PI / 2);
    plane.scale.set(50, 50, 50);
    scene.add(plane);

    // Load the iron ball model
    iron_ball_2 = await load('./assets/iron_ball_2/scene.gltf');
    iron_ball_2.position.set(0, 1.5, 0);
    iron_ball_2.scale.set(0.2, 0.2, 0.2);
    iron_ball_2.name = 'iron_ball_2'; // Give the ball a name for easier identification
    scene.add(iron_ball_2);

    // Load small rocks (plastic bottles)
    const boneModel = await load('./assets/plastic_water_bottle/scene.gltf');
    boneModel.scale.set(0.2, 0.2, 0.2);
    const safeArea = 25 - 1; // half of plane size minus a bit for margin

    // Place small rocks
    for (let i = 0; i < numRocks; i++) {
        const bone = boneModel.clone();
        const randomX = Math.random() * safeArea * 2 - safeArea;
        const randomZ = Math.random() * safeArea * 2 - safeArea;
        bone.position.set(randomX, 0, randomZ);
        bone.name = `dinobone_${i}`;
        scene.add(bone);
    }

    // Start the animation loop
    animate();
};

// Collision detection and game logic
function check() {
    const p = iron_ball_2;
    const box = new THREE.Box3().setFromObject(p);

    for (let i = scene.children.length - 1; i >= 0; i--) {
        const obj = scene.children[i];
        if (obj.name.startsWith('dinobone')) {
            const smallRockBox = new THREE.Box3().setFromObject(obj);
            if (box.intersectsBox(smallRockBox)) {
                scene.remove(obj);
                remainingRocks--;
                p.scale.multiplyScalar(1.1);
                
                if (remainingRocks === 0) {
                    gameOver = true;
                    console.log('Game Over: All plastic bottles have been collected!');
                    break; // All bottles are collected, no need to check further
                }
            }
        }
    }
}

// The main game loop
window.loop = (dt) => {
    if (gameOver) {
        return; // Stop the game loop if game is over
    }

    if (!iron_ball_2) {
        console.warn('The iron ball is not yet loaded.');
        return; // If the ball isn't loaded yet, don't try to update its position
    }

    // Movement speed is based on the delta time
    const speed = 5 * dt / 1000; // Convert dt from milliseconds to seconds

    // Keyboard controls for moving the ball
    if (keysPressed.has('ArrowUp')) {
        iron_ball_2.position.z -= speed;
        iron_ball_2.rotation.x +=speed;
    }
    if (keysPressed.has('ArrowDown')) {
        iron_ball_2.position.z += speed;
        iron_ball_2.rotation.x -=speed;
    }
    if (keysPressed.has('ArrowLeft')) {
        iron_ball_2.position.x -= speed;
        iron_ball_2.rotation.y +=speed;
    }
    if (keysPressed.has('ArrowRight')) {
        iron_ball_2.position.x += speed;
        iron_ball_2.rotation.y -=speed;
    }

    // Keep the ball within the boundaries of the plane
    const planeBoundary = 25; // Assuming the plane is centered and is 50 units wide
    iron_ball_2.position.clampScalar(-planeBoundary, planeBoundary);

    // Update the camera to follow the ball
    const cameraOffset = new THREE.Vector3(10, 10, 10);
    camera.position.copy(iron_ball_2.position).add(cameraOffset);
    camera.lookAt(iron_ball_2.position);

    // Perform collision detection
    check();

    // Render the scene
    renderer.render(scene, camera);
};

// Animation frame update loop
function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta(); // Get the time passed since the last frame
    window.loop(deltaTime); // Update the game with the delta time
}

// Call the init function to start the game
//window.init();
