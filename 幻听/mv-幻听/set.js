// The world: a real walnut desk, a desk lamp, and a brick room standing on it.
// 1 unit = 1 stud (8mm). 1 metre = 125 units.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { COL, PLATE, BRICK, mesh, plate, brickGeo, roundGeo, plastic, brick } from './bricks.js';
import { mulberry } from '/core/lib.js';

const PH = '/core/assets/polyhaven/';
export const M = 125;
export const ROOM = { x0: -22, x1: 22, z0: -19, z1: 19, h: 34 };
export const HOLE = { x0: 6.5, x1: 10.5, z0: -.5, z1: 3.5 };   // where she stood: a hole in the floor
export const FLOOR = .3;


// procedural brick face: 4x4 bricks per tile, mortar joints, per-brick shade drift
const BRICK_TEX = new Map();
function brickTex(w, h, seed) {
  const key = `${w}x${h}x${seed}`;
  if (BRICK_TEX.has(key)) return BRICK_TEX.get(key);
  const N = 512, c = document.createElement('canvas'); c.width = c.height = N;
  const x = c.getContext('2d');
  x.fillStyle = '#b3a892'; x.fillRect(0, 0, N, N);
  let r = seed * 9301 + 49297; const R = () => (r = (r * 16807) % 2147483647) / 2147483647;
  const bw = N / 4, bh = N / 4, m = 5;
  for (let row = 0; row < 4; row++) for (let col = 0; col < 5; col++) {
    const off = row % 2 ? bw / 2 : 0;
    const px = col * bw - off, py = row * bh;
    const g = 226 + Math.floor(R() * 16);
    x.fillStyle = `rgb(${g},${g - 8},${g - 22})`;
    x.beginPath(); x.roundRect(px + m / 2, py + m / 2, bw - m, bh - m, 3); x.fill();
    x.fillStyle = 'rgba(255,255,255,.28)'; x.fillRect(px + m / 2, py + m / 2, bw - m, 3);
    x.fillStyle = 'rgba(0,0,0,.09)'; x.fillRect(px + m / 2, py + bh - m / 2 - 4, bw - m, 4);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8; t.repeat.set(w / 8.2, h / 8.2);
  BRICK_TEX.set(key, t); return t;
}

export async function buildSet(scene, renderer) {
  // no HDR ships with this library outside the demo: three's procedural studio room instead
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .5;
  scene.background = new THREE.Color('#120f16');
  pmrem.dispose();

  const tl = new THREE.TextureLoader();
  const tex = (f, srgb) => {
    const t = tl.load(PH + f); t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(9, 9); t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(700, 700),
    new THREE.MeshStandardMaterial({ map: tex('walnut_diff.jpg', true), normalMap: tex('walnut_nor.jpg'), roughnessMap: tex('walnut_rough.jpg'), roughness: 1 }));
  desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);

  // — lights: one warm key, one cool fill, one softbox for crisp plastic highlights —
  const key = new THREE.DirectionalLight('#fff0dd', 4.6);
  key.position.set(-70, 120, 65); key.target.position.set(0, 6, 0);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
  key.shadow.bias = -.0004; key.shadow.normalBias = .028; key.shadow.radius = 3;
  Object.assign(key.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 10, far: 400 });
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#cfe0ff', .55); fill.position.set(60, 40, 50); scene.add(fill);
  RectAreaLightUniformsLib.init();
  const box = (col, I, w, h, p, at) => { const l = new THREE.RectAreaLight(col, I, w, h); l.position.set(...p); l.lookAt(...at); scene.add(l); return l; };
  const softKey = box('#fff6ee', 5.5, 70, 50, [-65, 72, 65], [0, 6, 0]);
  const softRim = box('#dce8ff', 4, 50, 30, [50, 40, -50], [0, 7, 0]);

  // real desk lamp at the edge of the room, its shade turned toward him
  const gltf = new GLTFLoader();
  const lamp = (await gltf.loadAsync(PH + 'desk_lamp_arm_01/desk_lamp_arm_01.gltf')).scene;
  lamp.scale.setScalar(M); lamp.position.set(-56, 0, -10); lamp.rotation.y = 2.35;
  lamp.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(lamp);
  const bulb = new THREE.PointLight('#ffe0b0', 950, 200, 2); bulb.position.set(-44, 44, -4); scene.add(bulb);

  // — floor: four strips around her hole —
  const strip = (x0, x1, z0, z1) => {
    const w = x1 - x0, d = z1 - z0;
    const mat = new THREE.MeshStandardMaterial({ map: brickTex(w, d, 9), color: '#b0a184', roughness: .8 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, FLOOR, d), mat);
    m.position.set((x0 + x1) / 2, FLOOR / 2, (z0 + z1) / 2);
    m.castShadow = m.receiveShadow = true; scene.add(m); return m;
  };
  const floor = [
    strip(ROOM.x0, ROOM.x1, ROOM.z0, HOLE.z0),
    strip(ROOM.x0, ROOM.x1, HOLE.z1, ROOM.z1),
    strip(ROOM.x0, HOLE.x0, HOLE.z0, HOLE.z1),
    strip(HOLE.x1, ROOM.x1, HOLE.z0, HOLE.z1),
  ];

  // — walls: each panel is a stack of courses, so it reads as brickwork and can fall as one piece —
  const walls = [];
  const panel = (w, d, x, z, seed = 0, tall = ROOM.h) => {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const mat = new THREE.MeshStandardMaterial({ map: brickTex(Math.max(w, d), tall, seed), roughness: .82, metalness: 0 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, tall, d), mat);
    m.position.y = tall / 2; m.castShadow = m.receiveShadow = true; g.add(m);
    scene.add(g); walls.push({ m: g, home: g.position.clone() });
    return g;
  };
  for (let i = 0; i < 5; i++) panel(8.8, 1, -17.6 + i * 8.8, ROOM.z0 - .5, i + 1);      // back
  for (let i = 0; i < 4; i++) panel(1, 9.5, ROOM.x0 - .5, -14.25 + i * 9.5, i + 2);     // left
  for (let i = 0; i < 4; i++) panel(1, 9.5, ROOM.x1 + .5, -14.25 + i * 9.5, i + 3);     // right

  // — the phone: leans on the back wall. Its screen is his window, then his door —
  const phone = new THREE.Group(); phone.position.set(0, FLOOR, ROOM.z0 + 1.1); phone.rotation.x = -.08;
  const shell = new THREE.Mesh(new RoundedBoxGeometry(10.4, 18.8, .9, 4, .28),
    new THREE.MeshPhysicalMaterial({ color: '#15171d', roughness: .32, clearcoat: .95, clearcoatRoughness: .1 }));
  shell.position.y = 9.4; shell.castShadow = shell.receiveShadow = true; phone.add(shell);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 17.6),
    new THREE.MeshStandardMaterial({ color: '#ffe8c0', emissive: '#ffd39a', emissiveIntensity: 2.4, roughness: .55 }));
  screen.position.set(0, 9.4, .47); phone.add(screen);
  const art = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4),
    new THREE.MeshStandardMaterial({ color: '#b7681a', emissive: '#c47a1e', emissiveIntensity: .8, roughness: .8 }));
  art.position.set(0, 12.4, .5); phone.add(art);
  const bars = [-.9, 0, .9].map((dx, i) => {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(.45, 1.4 + i * .5),
      new THREE.MeshStandardMaterial({ color: '#6b4e2a', roughness: .85 }));
    b.position.set(dx, 6.4, .5); phone.add(b); return b;
  });
  scene.add(phone);
  const screenLight = new THREE.PointLight('#ffcf96', 210, 70, 2); screenLight.position.set(0, 8, ROOM.z0 + 4.2); scene.add(screenLight);

  // — spare parts on the floor and on the desk —
  const R = mulberry(7);
  const PAL = [COL.red, COL.blue, COL.yellow, COL.green, COL.white, COL.lgray, COL.tan];
  const debris = [];
  for (let i = 0; i < 40; i++) {
    const onDesk = i > 26;
    const x = onDesk ? (R() - .5) * 120 : (R() - .5) * 24, z = onDesk ? (R() - .5) * 110 : (R() - .5) * 20;
    if (!onDesk && Math.hypot(x - 1, z + 2) < 6) continue;
    const d = [[2, 4], [2, 2], [1, 2], [1, 4], [2, 3], [1, 1]][Math.floor(R() * 6)];
    const m = brick(d[0], d[1], PAL[Math.floor(R() * PAL.length)], { h: R() < .3 ? PLATE : BRICK });
    m.position.set(x, onDesk ? 0 : FLOOR, z); m.rotation.y = R() * Math.PI;
    scene.add(m); debris.push(m);
  }
  // a low bench of bricks inside the room, to give the eye a scale reference
  const bench = new THREE.Group(); bench.position.set(-10, FLOOR, -3.5);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const b = brick(2, 2, i ? COL.blue : COL.lgray); b.position.set(i * 2 - 1, 0, j * 2 - 1); bench.add(b);
    const t = brick(2, 2, i ? COL.yellow : COL.red); t.position.set(i * 2 - 1, BRICK, j * 2 - 1); bench.add(t);
  }
  bench.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(bench);

  return { key, fill, softKey, softRim, bulb, lamp, floor, walls, phone, screen, screenLight, debris, desk, art, bars, bench };
}
