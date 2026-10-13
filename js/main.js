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
const garageGroup = new THREE.Group();
const floor = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), standard(0x171a22, 0.36, 0.32));
floor.rotation.x = -Math.PI / 2; floor.position.y = -0.08; floor.receiveShadow = true; garageGroup.add(floor);

const platform = new THREE.Mesh(new THREE.CylinderGeometry(5.3, 5.5, 0.22, 96), standard(0x292d37, 0.32, 0.55));
platform.position.set(1.6, 0.04, 0); platform.receiveShadow = true; platform.castShadow = true; garageGroup.add(platform);
const ringMaterial = new THREE.MeshStandardMaterial({ color: 0xe21b2d, emissive: 0x7c0715, emissiveIntensity: 1.7, metalness: 0.4, roughness: 0.28 });
const ring = new THREE.Mesh(new THREE.TorusGeometry(4.92, 0.035, 8, 120), ringMaterial);
ring.rotation.x = Math.PI / 2; ring.position.set(1.6, 0.17, 0); garageGroup.add(ring);
for (let i = 0; i < 3; i++) {
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 17), ringMaterial);
  strip.position.set(-8 + i * 0.32, 0.01, -2); garageGroup.add(strip);
}
for (const side of [-1, 1]) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(0.45, 8, 34), standard(0x20232d, 0.72, 0.22));
  wall.position.set(side * 13, 3.8, -4); wall.receiveShadow = true; garageGroup.add(wall);
  const neon = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 25), ringMaterial);
  neon.position.set(side * 12.75, 5.7, -4); garageGroup.add(neon);
}
const backWall = new THREE.Mesh(new THREE.BoxGeometry(27, 8, 0.5), standard(0x10131b, 0.7, 0.2));
backWall.position.set(0, 3.8, -20); garageGroup.add(backWall);
for (let i = 0; i < 7; i++) {
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.04, 14), standard(0x545b68, 0.4, 0.4));
  beam.position.set(-8 + i * 2.6, 7.7, -4); garageGroup.add(beam);
}
scene.add(garageGroup);
const car = createFormulaCar();
car.position.set(1.6, 0.16, 0);
car.rotation.y = -0.28;
scene.add(car);

// Separate playable city circuit: an oval loop with asphalt, curbs, barriers and city blocks.
const trackGroup = new THREE.Group();
trackGroup.visible = false;
const trackRadiusX = 48, trackRadiusZ = 66;
const trackCenter = new THREE.Vector3(0, 0, -6);
const trackSegments = 180;
const trackRoadMat = standard(0x30343d, 0.9, 0.04);
const curbRed = standard(0xe32636, 0.65, 0.1);
const curbWhite = standard(0xf0f1f4, 0.7, 0.05);
const cityGround = new THREE.Mesh(new THREE.PlaneGeometry(320, 320), standard(0x34383f, 1, 0));
cityGround.rotation.x = -Math.PI / 2; cityGround.position.set(0, -0.24, -6); trackGroup.add(cityGround);
const trackPieces = [];
for (let i = 0; i < trackSegments; i++) {
  const a = i / trackSegments * Math.PI * 2;
  const b = (i + 1) / trackSegments * Math.PI * 2;
  const mid = (a + b) / 2;
  const x = trackCenter.x + trackRadiusX * Math.cos(mid);
  const z = trackCenter.z + trackRadiusZ * Math.sin(mid);
  const dx = -trackRadiusX * Math.sin(mid), dz = trackRadiusZ * Math.cos(mid);
  const length = Math.hypot(dx, dz) * (2 * Math.PI / trackSegments) + 0.25;
  const angle = Math.atan2(-dx, dz);
  const roadPiece = new THREE.Mesh(new THREE.BoxGeometry(17, 0.18, length), trackRoadMat);
  roadPiece.position.set(x, -0.12, z); roadPiece.rotation.y = angle; roadPiece.receiveShadow = true; trackGroup.add(roadPiece);
  for (const side of [-1, 1]) {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, length), (i % 2 === 0) ? curbRed : curbWhite);
    curb.position.set(x + Math.cos(mid) * (trackRadiusX + side * 8.7), -0.02, z + Math.sin(mid) * (trackRadiusZ + side * 8.7));
    curb.rotation.y = angle; trackGroup.add(curb);
  }
  trackPieces.push({ x, z, angle });
}
const barrierMat = standard(0xc4c9d1, 0.55, 0.2);
for (let i = 0; i < trackSegments; i += 3) {
  const a = i / trackSegments * Math.PI * 2;
  const x = trackCenter.x + (trackRadiusX + 10.2) * Math.cos(a);
  const z = trackCenter.z + (trackRadiusZ + 10.2) * Math.sin(a);
  const barrier = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 2.6), barrierMat);
  barrier.position.set(x, 0.18, z); barrier.rotation.y = Math.atan2(-trackRadiusX * Math.sin(a), trackRadiusZ * Math.cos(a)); trackGroup.add(barrier);
}
// City blocks: tall buildings, lit windows, street lamps and grandstand-style start/finish gantry.
const buildingMats = [0x586879, 0x747b88, 0x8a786d, 0x414e60, 0x697d7a].map(c => standard(c, 0.82, 0.08));
for (let i = 0; i < 54; i++) {
  const a = i / 54 * Math.PI * 2;
  const radiusX = trackRadiusX + 22 + Math.random() * 30;
  const radiusZ = trackRadiusZ + 25 + Math.random() * 34;
  const x = radiusX * Math.cos(a), z = trackCenter.z + radiusZ * Math.sin(a);
  const w = 5 + Math.random() * 8, d = 5 + Math.random() * 9, h = 10 + Math.random() * 34;
  const building = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), buildingMats[i % buildingMats.length]);
  building.position.set(x, h / 2 - 0.18, z); building.castShadow = true; building.receiveShadow = true; trackGroup.add(building);
  const windowMat = new THREE.MeshStandardMaterial({ color: 0xffd782, emissive: 0x80551b, emissiveIntensity: 0.5, roughness: 0.45 });
  for (let floorNo = 1; floorNo < Math.min(7, Math.floor(h / 3)); floorNo++) {
    for (let col = -1; col <= 1; col++) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.85, 0.06), windowMat);
      win.position.set(x + col * (w / 4), floorNo * 2.5, z + d / 2 + 0.04); trackGroup.add(win);
    }
  }
}
const lampMat = new THREE.MeshStandardMaterial({ color: 0xffe0a0, emissive: 0xffb84d, emissiveIntensity: 1.6 });
for (let i = 0; i < 28; i++) {
  const a = i / 28 * Math.PI * 2;
  const x = (trackRadiusX + 12) * Math.cos(a), z = trackCenter.z + (trackRadiusZ + 12) * Math.sin(a);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 5.5, 7), standard(0x333943));
  pole.position.set(x, 2.55, z); trackGroup.add(pole);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), lampMat); bulb.position.set(x, 5.3, z); trackGroup.add(bulb);
}
const startLine = new THREE.Mesh(new THREE.BoxGeometry(17, 0.035, 1.5), standard(0xf8f8f8));
startLine.position.set(trackRadiusX, -0.015, trackCenter.z); startLine.rotation.y = Math.PI / 2; trackGroup.add(startLine);
const gantry = new THREE.Mesh(new THREE.BoxGeometry(19, 0.7, 0.7), ringMaterial);
gantry.position.set(trackRadiusX, 6.2, trackCenter.z); gantry.rotation.y = Math.PI / 2; trackGroup.add(gantry);
scene.add(trackGroup);
let trackProgress = 0, laneOffset = 0;

const keys = {};
const touch = { gas: false, brake: false, steer: 0, nitro: false };
let mode = 'garage', speed = 0, distance = 0, nitro = 100, steering = 0, cameraMode = 0, paused = false, raceTime = 0;
const cameraModes = ['CHASE', 'COCKPIT', 'HOOD', 'TOP'];
const speedLabel = document.querySelector('#speed');
const nitroLabel = document.querySelector('#nitro-value');
const distanceLabel = document.querySelector('#distance-value');
const timerLabel = document.querySelector('#timer-value');
const cameraLabel = document.querySelector('#camera-mode');
const ui = initUI({
  onStartRace: () => startRace(),
  onResetRace: () => resetRace(),
  onOpenPanel: () => {},
  onCameraChange: () => { cameraMode = (cameraMode + 1) % cameraModes.length; cameraLabel.textContent = cameraModes[cameraMode]; },
  onNitro: value => touch.nitro = value,
  onBrake: value => touch.brake = value,
  onGas: value => touch.gas = value,
  onSteer: value => touch.steer = value,
  onPause: () => { if (mode === 'race') { paused = !paused; ui.showToast(paused ? 'BALAPAN DIJEDA' : 'BALAPAN DILANJUTKAN'); } }
});
function startRace() {
  mode = 'race'; paused = false; speed = 0; distance = 0; nitro = 100; raceTime = 0; trackProgress = 0; laneOffset = 0;
  garageGroup.visible = false; trackGroup.visible = true;
  car.position.set(trackRadiusX, 0.16, trackCenter.z); car.rotation.set(0, Math.PI / 2, 0);
  ui.hideMenu(); ui.showRaceHud();
  ui.showToast('BALAPAN DIMULAI — W / ↑ UNTUK GAS');
}
function resetRace() {
  speed = 0; distance = 0; nitro = 100; raceTime = 0; steering = 0; trackProgress = 0; laneOffset = 0;
  car.position.set(trackRadiusX, 0.16, trackCenter.z); car.rotation.set(0, Math.PI / 2, 0);
  nitroLabel.textContent = '100%'; distanceLabel.textContent = '0 m';
  speedLabel.innerHTML = '0 <small style="font-size:.7rem">KM/H</small>';
  timerLabel.textContent = '00:00';
  ui.showToast('POSISI MOBIL DIULANG');
}
function backToGarage() {
  mode = 'garage'; speed = 0; paused = false; garageGroup.visible = true; trackGroup.visible = false;
  ui.showMenu(); car.position.set(1.6, 0.16, 0); car.rotation.set(0, 0, -0.28);
  cameraMode = 0; cameraLabel.textContent = cameraModes[cameraMode];
}
addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  if (e.key.toLowerCase() === 'c') { cameraMode = (cameraMode + 1) % cameraModes.length; cameraLabel.textContent = cameraModes[cameraMode]; }
  if (e.key.toLowerCase() === 'r' && mode === 'race') resetRace();
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
    raceTime += dt;
    const mins = Math.floor(raceTime / 60).toString().padStart(2, '0');
    const secs = Math.floor(raceTime % 60).toString().padStart(2, '0');
    timerLabel.textContent = `${mins}:${secs}`;
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
    steering = THREE.MathUtils.damp(steering, steerInput, 4.5, dt);
    laneOffset = THREE.MathUtils.clamp(laneOffset + steering * (0.12 + speed / 170) * 5 * dt, -5.8, 5.8);
    const loopLength = 2 * Math.PI * Math.sqrt((trackRadiusX * trackRadiusX + trackRadiusZ * trackRadiusZ) / 2);
    trackProgress = (trackProgress + (speed * dt / 3.6) / loopLength * Math.PI * 2) % (Math.PI * 2);
    const px = trackCenter.x + (trackRadiusX + laneOffset) * Math.cos(trackProgress);
    const pz = trackCenter.z + (trackRadiusZ + laneOffset) * Math.sin(trackProgress);
    const tangent = Math.atan2(-trackRadiusX * Math.sin(trackProgress), trackRadiusZ * Math.cos(trackProgress));
    car.position.set(px, 0.16, pz);
    car.rotation.y = tangent + Math.PI - steering * 0.12;
    car.rotation.z = -steering * 0.055;
    car.userData.wheels.forEach(w => { w.tire.rotation.x -= speed * dt * 0.8; if (w.front) w.pivot.rotation.y = -steering * 0.3; });
    distance += speed * dt / 3.6;
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
    else target = new THREE.Vector3(car.position.x + Math.sin(car.rotation.y) * 8.5, 4.7 + speed * 0.018, car.position.z + Math.cos(car.rotation.y) * 8.5);
    camera.position.lerp(target, 1 - Math.exp(-3 * dt));
    camera.lookAt(car.position.x - Math.sin(car.rotation.y) * 5, cameraMode === 3 ? 0 : 0.75, car.position.z - Math.cos(car.rotation.y) * 5);
  }
  renderer.render(scene, camera);
}
animate();
ui.hideLoading();
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
});