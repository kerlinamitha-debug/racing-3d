import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { createFormulaCar } from './car.js';
import { initUI } from './ui.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x11141c);
scene.fog = new THREE.Fog(0x11141c, 42, 190);
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 500);
camera.position.set(7, 4.5, 9);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xc8ddff, 0x241017, 1.8));
const keyLight = new THREE.DirectionalLight(0xffe7d0, 3.2);
keyLight.position.set(-7, 12, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1536, 1536);
keyLight.shadow.camera.left = -15; keyLight.shadow.camera.right = 15;
keyLight.shadow.camera.top = 15; keyLight.shadow.camera.bottom = -15;
scene.add(keyLight);
const redLight = new THREE.PointLight(0xe21b2d, 34, 22);
redLight.position.set(5, 3.5, -3); scene.add(redLight);
const coolLight = new THREE.PointLight(0x4e83ff, 24, 18);
coolLight.position.set(-6, 4, 1); scene.add(coolLight);
const standard = (color, roughness = 0.65, metalness = 0.15) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), standard(0x171a22, 0.36, 0.32));
floor.rotation.x = -Math.PI / 2; floor.position.y = -0.08; floor.receiveShadow = true; scene.add(floor);

const platform = new THREE.Mesh(new THREE.CylinderGeometry(5.3, 5.5, 0.22, 96), standard(0x292d37, 0.32, 0.55));
platform.position.set(1.6, 0.04, 0); platform.receiveShadow = true; platform.castShadow = true; scene.add(platform);
const ringMaterial = new THREE.MeshStandardMaterial({ color: 0xe21b2d, emissive: 0x7c0715, emissiveIntensity: 1.7, metalness: 0.4, roughness: 0.28 });
const ring = new THREE.Mesh(new THREE.TorusGeometry(4.92, 0.035, 8, 120), ringMaterial);
ring.rotation.x = Math.PI / 2; ring.position.set(1.6, 0.17, 0); scene.add(ring);
for (let i = 0; i < 3; i++) {
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 17), ringMaterial);
  strip.position.set(-8 + i * 0.32, 0.01, -2); scene.add(strip);
}
for (const side of [-1, 1]) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(0.45, 8, 34), standard(0x20232d, 0.72, 0.22));
  wall.position.set(side * 13, 3.8, -4); wall.receiveShadow = true; scene.add(wall);
  const neon = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 25), ringMaterial);
  neon.position.set(side * 12.75, 5.7, -4); scene.add(neon);
}
const backWall = new THREE.Mesh(new THREE.BoxGeometry(27, 8, 0.5), standard(0x10131b, 0.7, 0.2));
backWall.position.set(0, 3.8, -20); scene.add(backWall);
for (let i = 0; i < 7; i++) {
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.04, 14), standard(0x545b68, 0.4, 0.4));
  beam.position.set(-8 + i * 2.6, 7.7, -4); scene.add(beam);
}
const car = createFormulaCar();
car.position.set(1.6, 0.16, 0);
car.rotation.y = -0.28;
scene.add(car);

// Straight test road for the first playable prototype.
const roadGroup = new THREE.Group();
const road = new THREE.Mesh(new THREE.PlaneGeometry(16, 1000), standard(0x30343d, 0.88, 0.05));
road.rotation.x = -Math.PI / 2; road.position.set(0, -0.12, -350); road.receiveShadow = true; roadGroup.add(road);
for (const x of [-7.5, 7.5]) {
  const edge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 1000), standard(0xf4f5f8));
  edge.position.set(x, -0.09, -350); roadGroup.add(edge);
}
for (let z = 30; z > -850; z -= 12) {
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.035, 5), standard(0xffd12e));
  stripe.position.set(0, -0.06, z); stripe.userData.roadStripe = true; roadGroup.add(stripe);
}
const grass = new THREE.Mesh(new THREE.PlaneGeometry(500, 1000), standard(0x243d32));
grass.rotation.x = -Math.PI / 2; grass.position.set(0, -0.2, -350); roadGroup.add(grass);
const movingWorld = [];
function makeTree(x, z) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 1.6, 8), standard(0x684326));
  trunk.position.y = 0.8; tree.add(trunk);
  for (let i = 0; i < 3; i++) {
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.9 - i * 0.1, 1.8, 8), standard([0x176b31, 0x21853a, 0x2d9946][i]));
    crown.position.y = 1.7 + i * 0.58; tree.add(crown);
  }
  tree.position.set(x, -0.1, z); tree.userData.movingWorld = true;
  tree.traverse(o => { if (o.isMesh) o.castShadow = true; });
  roadGroup.add(tree); movingWorld.push(tree);
}
for (let z = 35; z > -850; z -= 14) { makeTree(-11 - Math.random() * 6, z); makeTree(11 + Math.random() * 6, z - Math.random() * 5); }
for (let z = 10; z > -800; z -= 48) {
  for (const side of [-1, 1]) {
    const h = 5 + Math.random() * 15;
    const building = new THREE.Mesh(new THREE.BoxGeometry(4 + Math.random() * 5, h, 5 + Math.random() * 5), standard([0x7c8794, 0x8d7c70, 0x626e7b][Math.floor(Math.random() * 3)]));
    building.position.set(side * (24 + Math.random() * 18), h / 2, z - Math.random() * 20);
    building.userData.movingWorld = true; roadGroup.add(building); movingWorld.push(building);
  }
}
scene.add(roadGroup);

const keys = {};
const touch = { gas: false, brake: false, steer: 0, nitro: false };
let mode = 'garage', speed = 0, distance = 0, nitro = 100, steering = 0, cameraMode = 0, paused = false;
const cameraModes = ['CHASE', 'COCKPIT', 'HOOD', 'TOP'];
const speedLabel = document.querySelector('#speed');
const nitroLabel = document.querySelector('#nitro-value');
const distanceLabel = document.querySelector('#distance-value');
const cameraLabel = document.querySelector('#camera-mode');
const ui = initUI({
  onStartRace: () => startRace(),
  onOpenPanel: () => {},
  onCameraChange: () => { cameraMode = (cameraMode + 1) % cameraModes.length; cameraLabel.textContent = cameraModes[cameraMode]; },
  onNitro: value => touch.nitro = value,
  onBrake: value => touch.brake = value,
  onGas: value => touch.gas = value,
  onSteer: value => touch.steer = value,
  onPause: () => { if (mode === 'race') { paused = !paused; ui.showToast(paused ? 'BALAPAN DIJEDA' : 'BALAPAN DILANJUTKAN'); } }
});
function startRace() {
  mode = 'race'; paused = false; speed = 0; distance = 0; nitro = 100;
  car.position.set(0, 0.16, 5); car.rotation.set(0, 0, 0);
  ui.hideMenu(); ui.showRaceHud();
  ui.showToast('BALAPAN DIMULAI — W / ↑ UNTUK GAS');
}
function backToGarage() {
  mode = 'garage'; speed = 0; paused = false;
  ui.showMenu(); car.position.set(1.6, 0.16, 0); car.rotation.set(0, 0, -0.28);
  cameraMode = 0; cameraLabel.textContent = cameraModes[cameraMode];
}
addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  if (e.key.toLowerCase() === 'c') { cameraMode = (cameraMode + 1) % cameraModes.length; cameraLabel.textContent = cameraModes[cameraMode]; }
  if (e.key.toLowerCase() === 'r') { car.position.set(0, 0.16, 5); car.rotation.set(0, 0, 0); speed = 0; distance = 0; nitro = 100; }
  if (e.key === 'Escape' && mode === 'race') { paused = !paused; ui.showToast(paused ? 'BALAPAN DIJEDA' : 'BALAPAN DILANJUTKAN'); }
});
addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
addEventListener('blur', () => { for (const key in keys) keys[key] = false; touch.gas = false; touch.brake = false; touch.steer = 0; touch.nitro = false; });

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.04);
  const driving = mode === 'race' && !paused;
  if (mode === 'garage') {
    car.rotation.y += dt * 0.12;
    ring.rotation.z += dt * 0.08;
  } else if (driving) {
    const gas = keys.w || keys.arrowup || touch.gas;
    const brake = keys.s || keys.arrowdown || touch.brake;
    const left = keys.a || keys.arrowleft || touch.steer < 0;
    const right = keys.d || keys.arrowright || touch.steer > 0;
    const boosting = (keys.shift || touch.nitro) && nitro > 0 && speed > 0.5;
    if (gas) speed += 22 * dt; else speed -= 5 * dt;
    if (brake) speed -= 32 * dt;
    if (boosting) { speed += 24 * dt; nitro -= 24 * dt; } else nitro = Math.min(100, nitro + 8 * dt);
    speed = THREE.MathUtils.clamp(speed, 0, boosting ? 65 : 48);
    const steerInput = (right ? 1 : 0) - (left ? 1 : 0);
    steering = THREE.MathUtils.damp(steering, steerInput, 5, dt);
    car.position.x = THREE.MathUtils.clamp(car.position.x + steering * (0.25 + speed / 30) * 8 * dt, -5.5, 5.5);
    car.rotation.y = THREE.MathUtils.damp(car.rotation.y, -steering * 0.24, 5, dt);
    car.rotation.z = THREE.MathUtils.damp(car.rotation.z, -steering * 0.08, 4, dt);
    car.userData.wheels.forEach(w => { w.tire.rotation.x -= speed * dt * 0.8; if (w.front) w.pivot.rotation.y = -steering * 0.3; });
    distance += speed * dt / 3.6;
    const moveZ = speed * dt * 1.7;
    movingWorld.forEach(object => { object.position.z += moveZ; if (object.position.z > 35) object.position.z -= 900; });
    roadGroup.children.forEach(object => { if (object.userData.roadStripe) { object.position.z += moveZ; if (object.position.z > 35) object.position.z -= 900; } });
    speedLabel.innerHTML = Math.round(speed * 3.6) + ' <small style="font-size:.7rem">KM/H</small>';
    nitroLabel.textContent = Math.round(nitro) + '%';
    distanceLabel.textContent = Math.floor(distance) + ' m';
  } else {
    car.userData.wheels.forEach(w => { if (w.front) w.pivot.rotation.y = 0; });
  }
  if (mode === 'garage') {
    camera.position.lerp(new THREE.Vector3(7.2, 4.1, 8.6), 1 - Math.exp(-2 * dt));
    camera.lookAt(1.2, 0.6, 0);
  } else {
    let target;
    if (cameraMode === 1) target = new THREE.Vector3(car.position.x, 1.0, car.position.z - 0.05);
    else if (cameraMode === 2) target = new THREE.Vector3(car.position.x, 1.35, car.position.z - 1.5);
    else if (cameraMode === 3) target = new THREE.Vector3(car.position.x, 13, car.position.z + 3);
    else target = new THREE.Vector3(car.position.x * 0.65, 4.7 + speed * 0.018, car.position.z + 8.5);
    camera.position.lerp(target, 1 - Math.exp(-3 * dt));
    camera.lookAt(car.position.x * 0.4, cameraMode === 3 ? 0 : 0.75, car.position.z - 5);
  }
  renderer.render(scene, camera);
}
animate();
ui.hideLoading();
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
});