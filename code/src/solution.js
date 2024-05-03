import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let gameOver=false;
let sodas=7;
// Game variables
let renderer, scene, camera, iron_ball, acceleration;

const keysPressed = new Set();
document.addEventListener('keydown', (event) => keysPressed.add(event.key));
document.addEventListener('keyup', (event) => keysPressed.delete(event.key));



// Utility to load GLTF models
const load = (url) => new Promise((resolve, reject) => {
  const loader = new GLTFLoader();
  loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
});

// Create a message overlay when the game is over
function WinMessage() {
  const win = document.createElement("div");
  win.style.position = "absolute";
  win.style.top = "50%";
  win.style.left = "50%";
  win.style.transform = "translate(-50%, -50%)";
  win.style.backgroundColor = "green";
  win.innerHTML = `
    <p>!Hurray Game Over!!!!</p>
  `;
  document.body.appendChild(win);
}

let audioContext;
let backgroundMusic;

function initAudio(url) {
  if (!audioContext) {
      audioContext = new (window.AudioContext || window.AudioContext)();
  }

  fetch(url)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
          backgroundMusic = audioContext.createBufferSource();
          backgroundMusic.buffer = audioBuffer;
          backgroundMusic.loop = true;
          const gainNode = audioContext.createGain();
          gainNode.gain.value = 0.5; // Adjust volume
          backgroundMusic.connect(gainNode);
          gainNode.connect(audioContext.destination);
          if (audioContext.state === 'suspended') {
              audioContext.resume(); // Handling autoplay policy
          }
          backgroundMusic.start();
      })
      .catch(e => console.error('Error with processing audio data', e));
}


// Initialize the scene
window.init = async () => {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 50, 150);  
  camera.lookAt(0, 0, 0);
  

  const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
  scene.add(directionalLight);

  const geometry = new THREE.PlaneGeometry(10, 10);
  const texture = new THREE.TextureLoader().load('./assets/Grass.jpg');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(50, 50);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotateX(-Math.PI / 2);
  plane.scale.set(100, 100, 100);

  scene.add(plane);

  initAudio('./assets/music.mp3');

  // Main rock object
  iron_ball = await load('./assets/iron_ball_2/scene.gltf');
  iron_ball.name = 'iron_ball';
  iron_ball.position.set(0, 8, -100);  // Move the ball away from the building initially

  scene.add(iron_ball);

  await placeBuildings();

  // Function to place objects in rows
async function placeObjectsInRows(modelPath, numObjectsPerRow, numRows, prefix, range) {
  const model = await load(modelPath);
  const offset = range / numObjectsPerRow;
  let count = 0;

  for (let i = 0; i < 10; i++) {
      for (let j = 0; j < numObjectsPerRow; j++) {
          const obj = model.clone();
          const x = j * offset - range / 2;
          const z = i * offset - range / 2;
          obj.position.set(x, 0, z);
          obj.scale.set(5, 5, 5); // Adjust scale as needed
          obj.name = `${prefix}_${count++}`;
          scene.add(obj);
      }
  }
}
  const sodam= await load('./assets/soda/scene.gltf');
  const carmodel = await load('./assets/toyota/scene.gltf');
  const buildmodel=await load('./assets/build/scene.gltf');
  const stopmodel=await load('./assets/stop/scene.gltf');
  const soda1 = sodam.clone();
  soda1.scale.set(5,5,5);
  soda1.position.set(-58,0,170)
  soda1.name = "soda";
  soda1.touch=false;
  scene.add(soda1);

  const soda2 = sodam.clone();
  soda2.scale.set(5,5,5);
  soda2.position.set(123,0,-203)
  soda2.name = "soda";
  soda2.touch=false;
  scene.add(soda2);

  const soda3 = sodam.clone();
  soda3.scale.set(5,5,5);
  soda3.position.set(35,0,155)
  soda3.name = "soda";
  soda3.touch=false;
  scene.add(soda3);

  const soda4 = sodam.clone();
  soda4.scale.set(5,5,5);
  soda4.position.set(-155,0,-170)
  soda4.name = "soda";
  soda4.touch=false;
  scene.add(soda4);

  const soda5 = sodam.clone();
  soda5.scale.set(5,5,5);
  soda5.position.set(-75,0,-122)
  soda5.name = "soda";
  soda5.touch=false;
  scene.add(soda5);

  const soda6 = sodam.clone();
  soda6.scale.set(5,5,5);
  soda6.position.set(-86,0,-42)
  soda6.name = "soda";
  soda6.touch=false;
  scene.add(soda6);

  const soda7 = sodam.clone();
  soda7.scale.set(5,5,5);
  soda7.position.set(244,0,71)
  soda7.name = "soda";
  soda7.touch=false;
  scene.add(soda7);


  const car = carmodel.clone();
  car.position.set(60, 0, -70);
  car.scale.set(5,5,5);
  scene.add(car);


  const car1 = carmodel.clone();
  car1.position.set(90, 0, -74);
  car1.scale.set(5,5,5);
  scene.add(car1);

  const car2 = carmodel.clone();
  car2.position.set(190, 0, -174);
  car2.scale.set(5,5,5);
  scene.add(car2);

  const car3 = carmodel.clone();
  car3.position.set(200, 0, -200);
  car3.scale.set(5,5,5);
  scene.add(car3);

  const car4 = carmodel.clone();
  car4.position.set(300, 0, -300);
  car4.scale.set(5,5,5);
  scene.add(car4);
  
  const stop1 = stopmodel.clone();
  stop1.position.set(100, 15, -100);
  stop1.scale.set(15, 15, 15);
  scene.add(stop1);
  
  const stop2 = stopmodel.clone();
  stop2.position.set(-1, 15, 100);
  stop2.scale.set(15, 15, 15);
  scene.add(stop2);
  
  const stop3 = stopmodel.clone();
  stop3.position.set(700, 15, 100);
  stop3.scale.set(15, 15, 15);
  scene.add(stop3);
  
  const stop4 = stopmodel.clone();
  stop4.position.set(-890, 15, -100);
  stop4.scale.set(15, 15, 15);
  scene.add(stop4);
  
  const stop5 = stopmodel.clone();
  stop5.position.set(94, 15, 0);
  stop5.scale.set(15, 15, 15);
  scene.add(stop5);
  

};

async function placeBuildings() {
  const buildModel = await load('./assets/build/scene.gltf');
  const numBuildings = 20; // Number of buildings you want
  const planeSize = 1000; // Assuming the plane is 1000x1000

  for (let i = 0; i < numBuildings; i++) {
    const building = buildModel.clone();
    const x = Math.random() * planeSize - planeSize / 2;
    const z = Math.random() * planeSize - planeSize / 2;
    building.position.set(x, 0, z);
    building.scale.set(0.3, 0.3, 0.3); // Scale as needed
    scene.add(building);
  }
}
function Collision() {
  const mainRock = scene.getObjectByName('iron_ball');
  const mainRockBox = new THREE.Box3().setFromObject(mainRock);

  scene.children.forEach((obj) => {
    if (( obj.name.startsWith('soda')) && !obj.touch) {
      const smallRockBox = new THREE.Box3().setFromObject(obj);
      if (mainRockBox.intersectsBox(smallRockBox)) {
        const sodacollect = mainRock.worldToLocal(obj.position);
        obj.parent = mainRock;
        obj.position.x=sodacollect.x;
        obj.position.y=sodacollect.y;
        obj.position.z=sodacollect.z;
        sodas--;
        obj.touch=true;
        if (sodas === 0) {
          gameOver = true;
          WinMessage();
        }
      }
    }
  });
}
 acceleration=0;
window.loop = (dt) => {
  if (gameOver || !iron_ball) {
    return; // Stop the loop if game is over or iron_ball isn't loaded yet
  }

  const speed = acceleration* dt; // adjust speed

  

  // Keyboard controls for moving the ball
  if (keysPressed.has('ArrowUp')) {
      if (acceleration<0.1){
        acceleration+=0.001;
      }
      iron_ball.position.z -= speed;
      iron_ball.rotation.x += speed * 0.5; // Enhanced rotation to mimic rolling
  }
  if (keysPressed.has('ArrowDown')) {
    if (acceleration<0.1){
      acceleration+=0.001;
    }
      iron_ball.position.z += speed;
      iron_ball.rotation.x -= speed * 0.5; // Enhanced rotation to mimic rolling
  }
  if (keysPressed.has('ArrowLeft')) {
    if (acceleration<0.1){
      acceleration+=0.001;
    }
      iron_ball.position.x -= speed;
      iron_ball.rotation.z += speed * 0.5; // Rolling effect on turning left
  }
  if (keysPressed.has('ArrowRight')) {
    if (acceleration<0.1){
      acceleration+=0.001;
    }
      iron_ball.position.x += speed;
      iron_ball.rotation.z -= speed * 0.5; // Rolling effect on turning right
  }

  // Clamping the ball's position to the plane's boundaries
  iron_ball.position.x = THREE.MathUtils.clamp(iron_ball.position.x, -500, 500);
  iron_ball.position.z = THREE.MathUtils.clamp(iron_ball.position.z, -500, 500);

  // Update the camera to follow the ball
 

  const desiredCameraPos = iron_ball.position.clone().add(new THREE.Vector3(0, 50, 150));
  camera.position.lerp(desiredCameraPos, 0.05);  // Smoothly interpolate the camera position
  camera.lookAt(iron_ball.position);

  Collision(); // ensure this also checks for undefined objects
  renderer.render(scene, camera);
};
function initGame() {
  // Initialize your game here
  console.log("Game has started!");
  // More initialization code as needed
}


document.getElementById('startButton').addEventListener('click', startGame);

function startGame() {
    // Hide the start screen
    document.getElementById('startScreen').style.display = 'none';

    // Start the game initialization or resume the game
    initGame(); 
}

