import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Game variables
let renderer, scene, camera, iron_ball_2;
const numbottles =15;
let remainingBottles = numbottles;
let gameOver = false;
const clock = new THREE.Clock(); // Used for determining delta time

// Input handling
const keysPressed = new Set();
document.addEventListener('keydown', (event) => keysPressed.add(event.key));
document.addEventListener('keyup', (event) => keysPressed.delete(event.key));

// Utility to load GLTF models
const load = (url) => new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
        url,
        (gltf) => resolve(gltf.scene),
        undefined,
        (error) => reject(error)
    );
});

function GameOver() {
    const gameDiv = document.createElement("div");
    gameDiv.id = "game-over";
    gameDiv.style.position = "absolute";
    gameDiv.style.top = "50%";
    gameDiv.style.left = "50%";
    gameDiv.style.transform = "translate(-50%, -50%)";
    gameDiv.style.backgroundColor = "rgba(1, 1, 1, 0.8)";
    gameDiv.style.color = "white";
    gameDiv.style.padding = "20px";
    gameDiv.innerHTML = `
      <h1>Hurray...!! Game Over!</h1>
      
    `;
    document.body.appendChild(gameDiv);
  }
  function restartGame() {
    gameOver = false;
    remainingBottles = numBottles;

    document.getElementById("game-over").remove();

    // Re-add bottles and reset ball position
    init();
}

// Initialize the scene
window.init = async () => {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(12, 12, 12);
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
    //plane.scale.set(50, 50, 50);
    scene.add(plane);

    // Load the iron ball model
    iron_ball_2 = await load('./assets/iron_ball_2/scene.gltf');
    iron_ball_2.position.set(0, 1.8, 0);
    iron_ball_2.scale.set(0.2, 0.2, 0.2);
    iron_ball_2.name = 'iron_ball_2'; // Give the ball a name for easier identification
    scene.add(iron_ball_2);

   // Load plastic bottles
    const bottleModel = await load('./assets/plastic_water_bottle/scene.gltf');
    bottleModel.scale.set(0.2, 0.2, 0.2);

    // Define the number of rows and bottles per row
    const numRows = 4;
    const numBottlesPerRow = Math.ceil(numbottles / numRows);
    const spacing = 10; // Spacing between bottles

    // Calculate the starting positions
    const startX = -((numBottlesPerRow - 1) * spacing) / 2;
    const startZ = -((numRows - 1) * spacing) / 2;

    for (let i = 0; i < numbottles; i++) {
        const row = Math.floor(i / numBottlesPerRow);
        const col = i % numBottlesPerRow;

        const x = startX + col * spacing;
        const z = startZ + row * spacing;

        const bottle = bottleModel.clone();
        bottle.position.set(x, 0, z);
        bottle.name = `bottle_${i}`;
        scene.add(bottle);
    }


    // Start the animation loop
    animate();
};

// Collision detection and attachment logic
function attachBottleToBall(ball, bottle) {
    const worldPosition = bottle.position.clone();
    const localPosition = ball.worldToLocal(worldPosition);

    bottle.position.copy(localPosition);
    ball.add(bottle); // Attach bottle to the ball
    ball.scale.multiplyScalar(1.05); // Slightly increase the ball's size
}

function collidebottles() {
    if (!iron_ball_2) {
        console.warn("Iron ball not initialized");
        return;
    }

    const ballBox = new THREE.Box3().setFromObject(iron_ball_2);

    scene.children.forEach((obj) => {
        if (obj.name.startsWith("bottle")) {
            const bottleBox = new THREE.Box3().setFromObject(obj);

            if (ballBox.intersectsBox(bottleBox)) {
                attachBottleToBall(iron_ball_2, obj); // Attach the bottle to the ball
                remainingBottles--;

                if (remainingBottles === 0) {
                    gameOver = true;
                    GameOver(); // Trigger the game over message
                }
            }
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta(); // Time passed since the last frame
    window.loop(deltaTime); // Update the game with the delta time
}

// The main game loop
window.loop = (dt) => {
    if (gameOver) {
        return; // Stop the game loop if game is over
    }

    /*if (!iron_ball_2) {
        console.warn('The iron ball is not yet loaded.');
        return; // If the ball isn't loaded yet, don't try to update its position
    }*/

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
        iron_ball_2.rotation.z +=speed;
    }
    if (keysPressed.has('ArrowRight')) {
        iron_ball_2.position.x += speed;
        iron_ball_2.rotation.z -=speed;
    }

    // Keep the ball within the boundaries of the plane
    const planeBoundary = 25; // Assuming the plane is centered and is 50 units wide
    iron_ball_2.position.clampScalar(-planeBoundary, planeBoundary);

    // Update the camera to follow the ball
    const cameraOffset = new THREE.Vector3(12, 12, 12);
    camera.position.copy(iron_ball_2.position).add(cameraOffset);
    camera.lookAt(iron_ball_2.position);

    // Perform collision detection
    collidebottles();

    // Render the scene
    renderer.render(scene, camera);
};

// Initialize and start the game
init();

// Call the init function to start the game
//window.init();