import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { createFormulaCar } from './car.js';
import { initUI } from './ui.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202833);
scene.fog = new THREE.Fog(0x252b32, 180, 1100);
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 2600);
camera.position.set(7, 4.5, 9);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
renderer.shadowMap.enabled = false;
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

// Separate city test circuit: long straight road for testing steering, acceleration and braking.
const trackGroup = new THREE.Group();
trackGroup.visible = false;
const trackCenter = new THREE.Vector3(0, 0, -1000);
const trackRoadMat = new THREE.MeshStandardMaterial({ color: 0x25272b, roughness: 0.98, metalness: 0.0 });
const curbRed = standard(0xc8c8c5, 0.88, 0.02);
const cityGround = new THREE.Mesh(new THREE.PlaneGeometry(260, 2400), standard(0x292d31, 1, 0));
cityGround.rotation.x = -Math.PI / 2; cityGround.position.set(0, -0.25, -1000); trackGroup.add(cityGround);
const road = new THREE.Mesh(new THREE.PlaneGeometry(18, 2200), trackRoadMat);
road.rotation.x = -Math.PI / 2; road.position.set(0, -0.12, -1000); road.receiveShadow = true; trackGroup.add(road);
// Raised sidewalks separate the asphalt from the city blocks.
for (const side of [-1, 1]) {
  const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.22, 2200), standard(0x777b7d, 0.94, 0));
  sidewalk.position.set(side * 15.2, -0.12, -1000); sidewalk.receiveShadow = true; trackGroup.add(sidewalk);
  const sidewalkEdge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 2200), standard(0xb4b5b1, 0.85, 0));
  sidewalkEdge.position.set(side * 11.55, -0.005, -1000); trackGroup.add(sidewalkEdge);
}
for (const x of [-9.2, 9.2]) {
  const curb = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.16, 2200), curbRed);
  curb.position.set(x, -0.015, -350); trackGroup.add(curb);
  const barrier = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.8, 2200), standard(0xb9c1cc, 0.6, 0.2));
  barrier.position.set(x * 1.12, 0.35, -350); trackGroup.add(barrier);
}
// Reuse shared materials and reduce decorative mesh count to keep the race smooth.
const laneStripeMat = standard(0xf6f1df, 0.7, 0);
const laneMarkMat = standard(0xd8d9d6, 0.8, 0);
const cityPalette = [0x586879, 0x747b88, 0x8a786d, 0x414e60, 0x697d7a];
const windowLit = new THREE.MeshStandardMaterial({color:0xffd99a, emissive:0x8b5b24, emissiveIntensity:0.42, roughness:0.45});
const windowDark = new THREE.MeshStandardMaterial({color:0x253342, emissive:0x101923, emissiveIntensity:0.12, roughness:0.35, metalness:0.18});
const roofMat = standard(0x343a43, 0.88, 0.05);
const poleMat = standard(0x333943);
const lampMat = new THREE.MeshStandardMaterial({color:0xffe0a0,emissive:0xffb84d,emissiveIntensity:1.2});
for (let z = 20; z > -2050; z -= 30) {
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.025, 7), laneStripeMat);
  stripe.position.set(0, -0.015, z); trackGroup.add(stripe);
  for (const x of [-3, 3]) {
    const laneMark = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.022, 5.5), laneMarkMat);
    laneMark.position.set(x, -0.012, z - 5.5); trackGroup.add(laneMark);
  }
  for (const side of [-1, 1]) {
    const w = 7 + Math.random() * 7, d = 9 + Math.random() * 9, h = 12 + Math.random() * 30;
    const building = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), standard(cityPalette[Math.floor(Math.random()*cityPalette.length)], 0.82, 0.08));
    building.position.set(side * (19 + w / 2 + Math.random() * 9), h / 2 - 0.2, z - 10);
    // Avoid hundreds of costly dynamic shadow casters in the distant city.
    building.receiveShadow = false; trackGroup.add(building);
    const cols = Math.max(2, Math.floor(w / 3.6));
    const rows = Math.max(2, Math.floor((h - 2) / 5));
    const winW = Math.min(0.95, (w * 0.7) / cols * 0.58);
    const winH = Math.min(1.25, (h * 0.68) / rows * 0.58);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, 0.07), Math.random() > 0.32 ? windowLit : windowDark);
        windowMesh.position.set(
          building.position.x - w * 0.34 + col * (w * 0.68 / Math.max(1, cols - 1)),
          1.8 + row * ((h - 3) / Math.max(1, rows - 1)),
          building.position.z + d / 2 + 0.06
        );
        trackGroup.add(windowMesh);
      }
    }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.25, 0.35, d + 0.25), roofMat);
    roof.position.set(building.position.x, h - 0.02, building.position.z); trackGroup.add(roof);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,5,8), poleMat);
    pole.position.set(side*12,2.4,z-10); trackGroup.add(pole);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2,8,8), lampMat);
    lamp.position.set(side*12,4.9,z-10); trackGroup.add(lamp);
  }
}
const startLine = new THREE.Mesh(new THREE.BoxGeometry(18, 0.035, 1.5), standard(0xf8f8f8));
startLine.position.set(0, -0.015, 8); trackGroup.add(startLine);
scene.add(trackGroup);
let laneOffset = 0, roadProgress = 0, lateralVelocity = 0, impactCooldown = 0;

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
  mode = 'race'; paused = false; speed = 0; distance = 0; nitro = 100; raceTime = 0; roadProgress = 0; laneOffset = 0; steering = 0; lateralVelocity = 0; impactCooldown = 0; cameraMode = 0; cameraLabel.textContent = cameraModes[cameraMode];
  garageGroup.visible = false; trackGroup.visible = true;
  car.position.set(0, 0.16, 5); car.rotation.set(0, 0, 0);
  ui.hideMenu(); ui.showRaceHud();
  ui.showToast('BALAPAN DIMULAI — W / ↑ UNTUK GAS');
}
function resetRace() {
  speed = 0; distance = 0; nitro = 100; raceTime = 0; steering = 0; laneOffset = 0; lateralVelocity = 0; impactCooldown = 0;
  car.position.set(0, 0.16, 5); car.rotation.set(0, 0, 0);
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
    if (gas) speed += 3.8 * dt; else speed -= 0.9 * dt;
    if (brake) speed -= 18 * dt;
    if (boosting) { speed += 5.0 * dt; nitro = Math.max(0, nitro - 17 * dt); } else {
      nitro = Math.min(100, nitro + 6 * dt);
      // Nitro speed fades progressively instead of snapping down to the normal limit.
      if (speed > 75) speed = Math.max(75, speed - 5.5 * dt);
    }
    speed = THREE.MathUtils.clamp(speed, 0, 90);
    const steerInput = (right ? 1 : 0) - (left ? 1 : 0);
    steering = THREE.MathUtils.damp(steering, steerInput, 3.2, dt);
    // Real forward motion and heading-based steering: turning changes the car's direction,
    // rather than only sliding it sideways or forcing it around a loop.
    const speedFactor = THREE.MathUtils.clamp(speed / 90, 0, 1.0);
    // Gentler steering at speed keeps the car from snapping sideways.
    const turnRate = 0.26 * speedFactor;
    car.rotation.y -= steering * turnRate * dt;
    // On the straight test circuit, let the chassis gently realign after the driver releases steering.
    // This prevents a small impact or a sharp correction from leaving the car permanently crab-walking.
    if (Math.abs(steerInput) < 0.01 && speed > 3) {
      car.rotation.y = THREE.MathUtils.damp(car.rotation.y, 0, 0.18 + speedFactor * 0.12, dt);
    }
    const forwardSpeed = speed;
    impactCooldown = Math.max(0, impactCooldown - dt);
    car.position.x -= Math.sin(car.rotation.y) * forwardSpeed * dt;
    car.position.x += lateralVelocity * dt;
    lateralVelocity *= Math.exp(-1.8 * dt);
    car.position.z -= Math.cos(car.rotation.y) * forwardSpeed * dt;
    laneOffset = car.position.x;
    // One restrained barrier impact impulse, then gradual grip recovery (not repeated per-frame bouncing).
    if ((car.position.x < -7 || car.position.x > 7) && impactCooldown <= 0) {
      const side = car.position.x < 0 ? -1 : 1;
      car.position.x = THREE.MathUtils.clamp(car.position.x, -8.1, 8.1);
      lateralVelocity = -side * Math.min(2.2, speedFactor * 2.2);
      car.rotation.y += side * (0.035 + speedFactor * 0.055);
      car.rotation.z = THREE.MathUtils.clamp(car.rotation.z + side * 0.025, -0.08, 0.08);
      speed *= 0.94;
      steering *= 0.35;
      impactCooldown = 0.7;
    } else {
      car.position.x = THREE.MathUtils.clamp(car.position.x, -8.1, 8.1);
    }
    if (car.position.z < -2020) {
      car.position.z = 5;
      car.position.x = THREE.MathUtils.clamp(car.position.x, -5, 5);
      lateralVelocity = 0;
    }
    car.rotation.z = THREE.MathUtils.damp(car.rotation.z, -steering * 0.055 * speedFactor, 4.5, dt);
    car.userData.wheels.forEach(w => { w.tire.rotation.x -= speed * dt * 0.8; if (w.front) w.pivot.rotation.y = -steering * 0.3; });
    distance += speed * dt;
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
    const heading = car.rotation.y;
    if (cameraMode === 1) target = new THREE.Vector3(car.position.x - Math.sin(heading) * 0.1, 1.0, car.position.z + 0.05);
    else if (cameraMode === 2) target = new THREE.Vector3(car.position.x - Math.sin(heading) * 1.5, 1.35, car.position.z + Math.cos(heading) * 1.5);
    else if (cameraMode === 3) target = new THREE.Vector3(car.position.x, 13, car.position.z + 3);
    else target = new THREE.Vector3(car.position.x + Math.sin(heading) * 2.2, 4.1 + speed * 0.009, car.position.z + Math.cos(heading) * 13.5);
    camera.position.lerp(target, 1 - Math.exp(-3 * dt));
    camera.lookAt(car.position.x - Math.sin(heading) * (cameraMode === 3 ? 0 : 1.0), cameraMode === 3 ? 0 : 0.7, car.position.z - Math.cos(heading) * (cameraMode === 3 ? 9 : 9));
  }
  renderer.render(scene, camera);
}
animate();
ui.hideLoading();
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
});