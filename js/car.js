import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function createFormulaCar() {
  const car = new THREE.Group();
  car.name = 'Teteng Formula';
  const paint = new THREE.MeshStandardMaterial({ color: 0xe21b2d, roughness: 0.24, metalness: 0.38 });
  const carbon = new THREE.MeshStandardMaterial({ color: 0x11141a, roughness: 0.48, metalness: 0.25 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x101114, roughness: 0.86 });
  const alloy = new THREE.MeshStandardMaterial({ color: 0x9ca5b1, roughness: 0.28, metalness: 0.82 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x13232e, roughness: 0.18, metalness: 0.48 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf2f3f5, roughness: 0.3, metalness: 0.15 });
  const make = (geometry, material, position, parent = car) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  // Low monocoque chassis and tapered nose.
  make(new THREE.BoxGeometry(1.18, 0.34, 2.55), paint, [0, 0.58, -0.05]);
  const nose = make(new THREE.ConeGeometry(0.43, 2.0, 4), paint, [0, 0.57, -2.0]);
  nose.rotation.x = -Math.PI / 2;
  nose.scale.set(0.95, 1, 0.58);
  make(new THREE.BoxGeometry(0.44, 0.2, 1.7), carbon, [0, 0.49, -2.25]);
  // Front wing with end plates.
  make(new THREE.BoxGeometry(2.05, 0.09, 0.43), carbon, [0, 0.38, -2.8]);
  make(new THREE.BoxGeometry(1.8, 0.055, 0.22), paint, [0, 0.46, -2.76]);
  for (const x of [-0.98, 0.98]) make(new THREE.BoxGeometry(0.08, 0.29, 0.42), paint, [x, 0.48, -2.8]);
  // Cockpit, headrest and driver helmet.
  make(new THREE.BoxGeometry(0.82, 0.3, 0.9), carbon, [0, 0.78, -0.15]);
  const cockpit = make(new THREE.CylinderGeometry(0.32, 0.4, 0.48, 12), glass, [0, 0.9, -0.22]);
  cockpit.rotation.x = 0.15;
  make(new THREE.SphereGeometry(0.19, 16, 12), paint, [0, 1.04, -0.03]);
  make(new THREE.TorusGeometry(0.29, 0.045, 8, 20, Math.PI), carbon, [0, 0.95, -0.25]);
  // Side pods and aerodynamic fins.
  for (const side of [-1, 1]) {
    make(new THREE.BoxGeometry(0.54, 0.35, 1.1), paint, [side * 0.73, 0.55, 0.23]);
    make(new THREE.BoxGeometry(0.12, 0.26, 0.85), carbon, [side * 0.96, 0.48, 0.28]);
    make(new THREE.BoxGeometry(0.06, 0.35, 0.65), paint, [side * 0.47, 0.67, 0.55]);
    // Mirrors
    make(new THREE.BoxGeometry(0.18, 0.08, 0.13), paint, [side * 0.67, 0.92, -0.75]);
    make(new THREE.BoxGeometry(0.12, 0.06, 0.08), glass, [side * 0.68, 0.93, -0.77]);
  }
  // Rear engine cover and rear wing.
  make(new THREE.BoxGeometry(0.72, 0.35, 1.2), paint, [0, 0.63, 0.95]);
  make(new THREE.BoxGeometry(1.85, 0.1, 0.35), carbon, [0, 1.12, 1.7]);
  make(new THREE.BoxGeometry(1.72, 0.1, 0.23), paint, [0, 1.23, 1.69]);
  for (const x of [-0.78, 0.78]) make(new THREE.BoxGeometry(0.08, 0.47, 0.3), carbon, [x, 0.99, 1.7]);
  make(new THREE.BoxGeometry(0.9, 0.08, 0.3), carbon, [0, 0.36, 1.58]);
  // Four exposed wheels, with front steering pivots.
  const wheels = [];
  for (const x of [-1.03, 1.03]) {
    for (const z of [-1.75, 1.25]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, 0.43, z);
      car.add(pivot);
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.29, 28), rubber);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      pivot.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.245, 0.305, 20), alloy);
      rim.rotation.z = Math.PI / 2;
      pivot.add(rim);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.32, 12), carbon);
      hub.rotation.z = Math.PI / 2;
      pivot.add(hub);
      for (let i = 0; i < 6; i++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.29, 0.045), white);
        spoke.rotation.x = i * Math.PI / 3;
        spoke.position.x = x < 0 ? -0.16 : 0.16;
        pivot.add(spoke);
      }
      wheels.push({ pivot, tire, front: z < 0 });
      // Visible suspension arms.
      make(new THREE.BoxGeometry(0.055, 0.06, 0.75), carbon, [x * 0.78, 0.48, z * 0.7]);
    }
  }
  // Small number panel and rear rain light.
  make(new THREE.BoxGeometry(0.32, 0.035, 0.24), white, [0, 0.77, -1.0]);
  make(new THREE.BoxGeometry(0.14, 0.13, 0.09), new THREE.MeshStandardMaterial({ color: 0xff243c, emissive: 0x8b0014 }), [0, 0.5, 1.93]);
  car.userData.wheels = wheels;
  car.userData.paintMaterial = paint;
  car.userData.vehicleType = 'formula';
  return car;
}