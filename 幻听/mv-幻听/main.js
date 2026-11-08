// 幻听 · 积木歌单 — 16:9 brick-toy MV, 30.64 s, cut on the measured beat grid.
import * as THREE from 'three';
import { makePost } from '/core/three/post.js';
import { clamp, seg, eio, eo, ss, lerp, hash } from '/core/lib.js';
import { COL, BRICK, PLATE, brick, plate, brickGeo, plastic } from './bricks.js';
import { buildSet, FLOOR, ROOM, HOLE } from './set.js';
import { makeClawd, TERRA, ROSY, walkPose } from './rig.js';
import { DUR, BEAT, T0, bt, LINES, SHOTS, shotAt } from './cues.js';

const W = 1920, H = 1080;
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.06;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, W / H, .5, 3000);
const post = makePost(renderer, scene, camera, W, H, { ssaa: 2, ao: true, aoRadius: 3, aoThickness: 2.6, aoAmt: 1.0 });
post.bloom.strength = .22; post.bloom.threshold = 1.2;
post.vig.uniforms.amt.value = .38; post.vig.uniforms.warm.value = -.26;
post.vig.uniforms.contrast.value = .3; post.vig.uniforms.sat.value = 1.14;

const set = await buildSet(scene, renderer);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const T12 = t => Math.floor(t * 12) / 12;
const FULL = Math.PI;

// ————— 主角 —————
const him = makeClawd({ color: TERRA, scale: 1.15 });
scene.add(him.root);
const HOME = V(0, FLOOR, 1.0);

const worn = new THREE.Group(); him.head.add(worn);
{
  const mat = new THREE.MeshPhysicalMaterial({ color: '#343b47', roughness: .3, clearcoat: .95, clearcoatRoughness: .08 });
  const band = new THREE.Mesh(new THREE.TorusGeometry(3.15, .44, 10, 28, Math.PI), mat);
  band.position.y = 1.95; worn.add(band);
  for (const sx of [-1, 1]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, .62, 24), mat);
    cup.rotation.z = Math.PI / 2; cup.position.set(sx * 3.3, 1.7, -.35); worn.add(cup);
    const pad = new THREE.Mesh(new THREE.TorusGeometry(.8, .32, 8, 20),
      new THREE.MeshStandardMaterial({ color: '#565b66', roughness: .95 }));
    pad.rotation.y = Math.PI / 2; pad.position.set(sx * 3.0, 1.7, -.35); worn.add(pad);
  }
  worn.traverse(o => { if (o.isMesh) o.castShadow = true; });
}

// ————— 她：站在他右前方（朝向镜头那一侧），所以他一回头就能看见 —————
const HER = V(8.2, FLOOR, 1.9);
const her = makeClawd({ color: ROSY, scale: 1.04 });
her.root.position.copy(HER);
her.root.rotation.y = -.78;
her.assemble(0);
scene.add(her.root);

// ————— 耳机线：从耳朵垂到地板 —————
const cablePts = [V(2.9, 10.0, 1.0), V(4.6, 7.4, 2.2), V(4.9, 2.4, 3.6), V(4.4, FLOOR + .15, 5.0), V(6.0, FLOOR + .15, 7.4)];
const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 70, .16, 8, false),
  new THREE.MeshStandardMaterial({ color: '#26282e', roughness: .55 }));
cable.castShadow = true; scene.add(cable);

const pinkBrick = brick(2, 2, ROSY); scene.add(pinkBrick);

// ————— 歌单车厢 —————
function makeCarriage(kind) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(brickGeo(7, 3, PLATE * 1.6, { tile: true }), plastic('#b8402a')); g.add(base);
  const walls = [];
  for (const [w, d, x, z] of [[7, 1, 0, -1], [7, 1, 0, 1], [1, 3, -3, 0], [1, 3, 3, 0]]) {
    const m = new THREE.Mesh(brickGeo(w, d, 2.6, { tile: true }), plastic('#d8d3c6'));
    m.position.set(x, PLATE * 1.6, z); g.add(m); walls.push(m);
  }
  const prop = new THREE.Group(); prop.position.y = PLATE * 1.6; g.add(prop);
  if (kind === 0) { const c = new THREE.Mesh(new THREE.SphereGeometry(1.15, 22, 16), plastic(COL.yellow)); c.position.y = 1.5; prop.add(c); }
  if (kind === 1) { const c = new THREE.Mesh(new THREE.BoxGeometry(3.1, .22, 1.9), new THREE.MeshStandardMaterial({ color: '#efe7d4', roughness: .9 })); c.position.y = 1.3; c.rotation.y = .28; c.rotation.x = -.3; prop.add(c); }
  if (kind === 2) { const c = new THREE.Mesh(new THREE.TorusGeometry(.85, .1, 6, 26), new THREE.MeshStandardMaterial({ color: '#2a2118', roughness: .8 })); c.position.y = 1.1; c.rotation.x = Math.PI / 2.4; prop.add(c); }
  if (kind === 3) { const c = new THREE.Mesh(new THREE.TorusGeometry(.6, .2, 8, 22), new THREE.MeshPhysicalMaterial({ color: '#e8d9a0', metalness: .9, roughness: .18 })); c.position.y = 1.2; c.rotation.x = Math.PI / 2; prop.add(c); }
  if (kind === 4) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.0, .14), new THREE.MeshStandardMaterial({ color: '#f4f1e8', roughness: .85 })); c.position.y = 1.7; c.rotation.y = .2; prop.add(c);
    const im = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.9), new THREE.MeshStandardMaterial({ color: '#3d6b78', roughness: .8 })); im.position.set(0, 1.85, .1); im.rotation.y = .2; prop.add(im);
  }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { g, walls };
}
const CAR = [0, 1, 2, 3, 4].map(k => { const c = makeCarriage(k); c.g.visible = false; scene.add(c.g); return c; });

// ————— 插头 —————
const plug = new THREE.Group();
{
  const metal = new THREE.Mesh(new THREE.CylinderGeometry(.4, .4, 2.4, 20), new THREE.MeshStandardMaterial({ color: '#c9ccd2', metalness: 1, roughness: .2 }));
  metal.position.y = -1.2; plug.add(metal);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.85, .9, 3.0, 24), new THREE.MeshPhysicalMaterial({ color: '#f2f0eb', roughness: .38, clearcoat: .85 }));
  body.position.y = 1.5; plug.add(body);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(.88, .88, .28, 24), new THREE.MeshStandardMaterial({ color: '#d4d6da', metalness: .8, roughness: .3 }));
  ring.position.y = .1; plug.add(ring);
  plug.traverse(o => { if (o.isMesh) o.castShadow = true; });
  scene.add(plug);
}
const JACK = V(0, FLOOR + 18.7, ROOM.z0 + 1.1);

// ————— 他的表演 —————
// ry：听（背对）→ P12–P14 回头看她 → 一直面对镜头 → P42 转身去撞门 → 回原位
function baseRy(t) {
  if (t < bt(12)) return FULL;
  if (t < bt(42)) return lerp(FULL, .2, ss(seg(t, bt(12), bt(14))));
  if (t < bt(43)) return lerp(.2, FULL, ss(seg(t, bt(42), bt(43))));
  return FULL;
}

function himAt(t) {
  const P = { x: HOME.x, y: HOME.y, z: HOME.z, ry: baseRy(t), sit: 1, eyes: 1, nod: .16, armL: [-.25, .06], armR: [-.25, .06] };
  P.bob = Math.sin(t * 2.1) * .035;
  if (t >= bt(14) && t < bt(42)) P.look = .26;

  if (t < 5.36) {                                     // S01 一个人听歌
    if (t > bt(1) && t < bt(2)) P.armR = [lerp(-.25, -2.4, ss(seg(t, bt(1), bt(1) + .18))), .55];
    if (t >= bt(2) && t < bt(5)) P.armR = [-2.3, .5];
    if (t >= bt(5)) P.armR = [-.25, .06];
    if (t > bt(4)) P.nod = lerp(.16, -.18, ss(seg(t, bt(4), bt(4) + .3)));
    if (t > bt(6)) { P.armL = [-1.35, .28]; P.nod = .1; P.look = -.15; }
    if (t > bt(8)) { P.armL = [-1.1, .2]; P.nod = .34; }
  } else if (t < 8.92) {                              // S02 声音来了，闭眼，回头
    P.nod = lerp(.34, -.12, ss(seg(t, bt(10), bt(12))));
    if (t > bt(14)) P.eyes = .12;
    if (t > bt(16)) { P.armR = [lerp(-.25, -1.5, ss(seg(t, bt(16), bt(16) + .25))), .3]; P.nod = .05; }
  } else if (t < 11.12) {                             // S03 夜色：抬头看
    P.nod = lerp(.05, -.38, ss(seg(t, bt(18), bt(20))));
    P.eyes = 1; P.armR = [-.4, .15]; P.look = .1;
  } else if (t < 12.92) {                             // S04 她的手落在他胸口
    P.nod = lerp(-.38, .42, ss(seg(t, bt(22), bt(24))));
    P.lean = lerp(0, -.14, ss(seg(t, bt(24), bt(24) + .2)));
    if (t > bt(24)) { P.armL = [-1.1, .5]; P.armR = [-1.1, .5]; P.nod = .5; }
    if (t > bt(26)) { P.armL = [-1.9, .8]; P.armR = [-1.9, .8]; P.lean = .1; }
  } else if (t < 15.68) {                             // S05 扑过去接住那一块
    P.sit = lerp(1, .3, ss(seg(t, bt(26), bt(27) + .1)));
    P.lean = lerp(.1, .52, ss(seg(t, bt(27), bt(27) + .25)));
    P.armL = [-2.2, .55]; P.armR = [-2.2, .55]; P.nod = .5;
    if (t > bt(28)) { P.sit = 1; P.lean = .05; P.nod = .3; P.armL = [-1.6, .35]; P.armR = [-1.5, .3]; }
  } else if (t < 20.34) {                             // S06 同一件事再来一遍
    if (t < bt(35)) { P.sit = 1; P.nod = .3; P.lean = .05; P.armL = [-1.6, .35]; P.armR = [-1.5, .3]; }
    else {
      P.sit = 0; P.nod = -.2; P.armL = [-.3, .1]; P.armR = [-.3, .1];
      P.y = HOME.y + Math.sin(seg(t, bt(35), bt(35) + .35) * Math.PI) * .5;
    }
    if (t > bt(37)) { P.armR = [-1.6, .5]; P.nod = .35; }
    if (t > bt(40)) { P.ry = baseRy(t) + lerp(0, .5, ss(seg(t, bt(40), bt(40) + .3))); P.nod = .1; }
  } else if (t < 23.92) {                             // S07 走向门，撞上，退回来
    const A = V(HOME.x, FLOOR, HOME.z), B = V(0, FLOOR, -14.2);
    const u = ss(seg(t, bt(42), bt(45)));
    P.x = lerp(A.x, B.x, u); P.z = lerp(A.z, B.z, u);
    P.sit = 0;
    if (t > bt(42) && t < bt(45)) { const w = walkPose((t - bt(42)) * 3.4, .5); Object.assign(P, w); P.sit = 0; }
    if (t >= bt(45)) {
      const k = ss(seg(t, bt(45), bt(45) + .12));
      P.z = -14.2 + k * 3.0; P.lean = .3 * k; P.armL = [-2.6, .9]; P.armR = [-2.6, .9]; P.nod = -.3;
      if (t > bt(46)) { P.sit = ss(seg(t, bt(46), bt(46) + .3)); P.z = -11.4 + P.sit * .4; P.lean = lerp(.3, .12, P.sit); P.armL = [-1.4, .5]; P.armR = [-1.4, .5]; P.nod = .5; }
      if (t > bt(47)) P.armR = [lerp(-1.4, -2.5, ss(seg(t, bt(47), bt(47) + .2))), .5];
    }
  } else if (t < 26.85) {                             // S08 看它们流走
    P.x = lerp(0, 1.6, ss(seg(t, bt(49), bt(52)))); P.z = lerp(-11.4, -7.4, ss(seg(t, bt(49), bt(52))));
    P.ry = .1; P.sit = 0; P.nod = .12; P.armL = [-.2, .1]; P.armR = [-.55, .18];
    if (t > bt(55)) { P.armR = [lerp(-.55, -1.5, ss(seg(t, bt(55), bt(55) + .18))), .3]; P.nod = .4; }
  } else {                                            // S09 坐回去
    const u = ss(seg(t, bt(57), bt(60)));
    P.x = lerp(1.6, HOME.x, u); P.z = lerp(-7.4, HOME.z, u);
    P.ry = lerp(.1, .2, u);
    P.sit = lerp(0, 1, ss(seg(t, bt(59), bt(60) + .2)));
    P.nod = lerp(.2, .04, u); P.armL = [-.3, .1]; P.armR = [-.3, .1];
    if (t > bt(61)) { P.armR = [lerp(-.3, -2.4, ss(seg(t, bt(61), bt(61) + .2))), .55]; P.nod = -.1; }
    if (t > bt(62)) { P.armR = [-2.3, .5]; P.nod = .2; }
  }
  return P;
}

function herAt(t) {
  const P = { x: HER.x, y: HER.y, z: HER.z, ry: -.78, sit: 0, eyes: 1, nod: .05, look: .22, armL: [-.2, .1], armR: [-.2, .1] };
  if (t < 11.12) {
    P.nod = lerp(.05, -.12, ss(seg(t, bt(13), bt(16))));
    P.x = lerp(HER.x, 7.0, ss(seg(t, bt(16), bt(17))));
    P.z = lerp(HER.z, 1.7, ss(seg(t, bt(16), bt(17))));
    if (t > bt(16)) { P.armR = [lerp(-.2, -1.35, ss(seg(t, bt(16), bt(16) + .2))), .18]; P.nod = -.1; }
  } else if (t < 12.92) {
    P.x = 7.0; P.z = 1.7;
    P.ry = lerp(-.78, -1.15, ss(seg(t, bt(22), bt(23))));
    P.look = .1;
    P.armR = [lerp(-1.35, -2.05, ss(seg(t, bt(22), bt(23)))), .1];
    P.nod = lerp(-.1, .3, ss(seg(t, bt(23), bt(24))));
  } else return null;
  return P;
}

// ————— 相机 —————
function cam(t, shot) {
  let pos, look, fov = 34, focus = null, aper = 700;
  const A = him.root.position.clone().add(V(0, 5.6, 0));
  switch (shot[0]) {
    case 'S00': {
      const u = ss(seg(t, .10, .70));
      pos = V(6.5, 23.2, -4.2).lerp(V(1.0, 20.1, -8.7), u);
      look = JACK.clone().add(V(0, .5, 0)); fov = 26; focus = JACK.clone(); aper = 900; break;
    }
    case 'S01': {
      const u = eio(seg(t, .70, 5.36));
      pos = V(4.0, 8.0, 64).lerp(V(3.0, 7.4, 55), u);
      look = V(0, 9.5, -3); fov = 35; focus = A; aper = 600; break;
    }
    case 'S02': {
      const u = eio(seg(t, 5.36, 8.92));
      pos = V(7.0, 9.4, 34).lerp(V(5.4, 9.8, 27), u);
      look = V(4.2, 7.6, 2.0); fov = 38; focus = V(4.2, 7.6, 2.0); aper = 520; break;
    }
    case 'S03': {
      pos = V(-14, 5.2, 54).lerp(V(-12, 5.6, 46), eio(seg(t, 8.92, 11.12)));
      look = V(3.0, 8.4, .6); fov = 38; focus = V(3.4, 8.2, 1.4); aper = 640; break;
    }
    case 'S04': {
      const u = eio(seg(t, 11.12, 12.92));
      pos = V(9.5, 10.2, 33).lerp(V(7.4, 9.8, 26), u);
      look = V(4.6, 8.0, 2.0); fov = 38; focus = V(4.6, 7.6, 2.0); aper = 470; break;
    }
    case 'S05': {
      const u = eio(seg(t, 12.92, 13.9));
      pos = V(7, 17, 36).lerp(V(12, 44, 76), u);
      look = V(.8, 5, 1).lerp(V(0, 1.8, 0), u); fov = 32;
      focus = V(0, 1.4, 2); aper = lerp(480, 1000, u); break;
    }
    case 'S06': {
      pos = V(4.0, 8.0, 64).lerp(V(3.6, 7.7, 59), eio(seg(t, 15.68, 20.34)));
      look = V(0, 9.5, -3); fov = 35; focus = A; aper = 600; break;
    }
    case 'S07': {
      const u = eio(seg(t, 20.34, 23.92));
      pos = V(2.4, 9.2, 30).lerp(V(1.2, 8.8, 23), u);
      look = V(0, 9.2, -13); fov = 36; focus = A; aper = 540; break;
    }
    case 'S08': {
      pos = V(-7, 70, 88).lerp(V(-6, 62, 80), eio(seg(t, 23.92, 26.85)));
      look = V(0, .6, 3); fov = 32; focus = V(3, 1, 9); aper = 1100; break;
    }
    default: {
      const u = eio(seg(t, 26.85, 28.4)), w = eio(seg(t, bt(63), 30.6));
      pos = V(6.0, 7.4, 30).lerp(V(12, 13, 50), u).lerp(V(3.4, 2.6, 12), w);
      look = V(0, 8.4, 1).lerp(V(0, 3.4, -.5), u).lerp(V(1.7, .9, 5.6), w);
      fov = lerp(38, 34, u); focus = V(1.7, .9, 5.6); aper = lerp(500, 400, w); break;
    }
  }
  camera.position.copy(pos);
  camera.fov = fov; camera.updateProjectionMatrix();
  if (shot[0] === 'S07') {
    const sh = Math.max(0, 1 - seg(t, bt(45), bt(45) + .22)) * (t > bt(45) ? 1 : 0);
    if (sh > 0) camera.position.add(V(hash(Math.floor(t * 24)) - .5, hash(Math.floor(t * 24) + 9) - .5, 0).multiplyScalar(sh * 1.4));
  }
  camera.lookAt(look);
  const k = set.key, fc = focus || look, span = (shot[0] === 'S08' || shot[0] === 'S05') ? 55 : 22;
  k.target.position.copy(fc); k.position.copy(fc).add(V(-60, 110, 55)); k.target.updateMatrixWorld();
  Object.assign(k.shadow.camera, { left: -span, right: span, top: span, bottom: -span });
  k.shadow.camera.updateProjectionMatrix();
  post.dof.focus = focus ? camera.position.distanceTo(focus) : 30;
  post.dof.aper = aper; post.dof.maxCoc = 16;
}

function beatPulse(t) {
  const ph = (t - T0) / BEAT, frac = ph - Math.floor(ph);
  return Math.max(0, 1 - frac / .22);
}

// ————— 字幕（华文行楷） —————
const ov = document.getElementById('ov'), g = ov.getContext('2d');
function brickIcon(x, y, col) {
  g.save(); g.translate(x, y); g.fillStyle = col;
  g.beginPath(); g.roundRect(0, 9, 62, 28, 6); g.fill();
  g.beginPath(); g.roundRect(8, 0, 20, 11, 3); g.roundRect(36, 0, 20, 11, 3); g.fill();
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, 30, 62, 7); g.restore();
}
function subtitle(txt, accent) {
  const size = 82;
  g.font = `${size}px Xingkai, "STXingkai", "华文行楷", serif`;
  const tw = g.measureText(txt).width, pw = tw + 190, ph = 128, x = (W - pw) / 2, y = H - 214;
  g.save();
  g.fillStyle = 'rgba(14,16,22,.76)';
  g.beginPath(); g.roundRect(x, y, pw, ph, 26); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 2; g.stroke();
  brickIcon(x + 40, y + 44, accent);
  g.fillStyle = '#fff'; g.textBaseline = 'middle'; g.textAlign = 'left';
  g.fillText(txt, x + 132, y + ph / 2 + 4);
  g.restore();
}
function hud(t) {
  g.clearRect(0, 0, W, H);
  const L = LINES.find(l => t >= l.t0 - .02 && t <= l.t1 + .02);
  if (L) subtitle(L.txt, L.t0 > 14 ? '#e58384' : '#f2cd37');
  if (t > bt(57) - .1 && t < bt(59)) {
    const a = ss(seg(t, bt(57) - .1, bt(57) + .25)) * (1 - ss(seg(t, bt(58) + .4, bt(59))));
    g.save(); g.globalAlpha = a * .95; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '132px Xingkai, "STXingkai", "华文行楷", serif';
    g.fillStyle = '#fff'; g.fillText('幻听', W / 2, H * .33);
    g.font = '36px Xingkai, "STXingkai", "华文行楷", serif'; g.fillStyle = 'rgba(255,255,255,.7)';
    g.fillText('许 嵩', W / 2, H * .33 + 100);
    g.restore();
  }
}

function placeCarriages(t) {
  const inS5 = t >= 12.92 && t < 15.68, inS8 = t >= 23.92 && t < 27.0;
  CAR.forEach((c, i) => {
    let on = false, x = 0, z = 12.5, y = FLOOR, sink = 0;
    if (inS5) {
      const a = bt(29 + i), u = seg(t, a, a + 2.6);
      if (u > 0 && u < 1.02) { on = true; x = lerp(21, -21, u); }
    }
    if (inS8) {
      const a = bt(49 + i * 1.1), u = seg(t, a, a + 3.4);
      if (u > 0 && u < 1.02) { on = true; x = lerp(21, -21, u); sink = ss(u) * .5; y = FLOOR - sink * .3; }
    }
    c.g.visible = on;
    c.g.position.set(x, y, z);
    c.walls.forEach(w => { w.visible = sink < .45; w.position.y = PLATE * 1.6 - sink * 1.6; });
  });
}
function placeDebris(t) {
  set.debris.forEach((m, i) => {
    if (m.userData.y0 === undefined) m.userData.y0 = m.position.y;
    if (i % 5 === 0 && t > bt(39)) {
      const k = 1 - seg(t, bt(39), 19.6);
      m.position.y = m.userData.y0 + Math.max(0, Math.sin(((t - bt(39)) % .46) / .46 * Math.PI)) * .4 * k;
    } else m.position.y = m.userData.y0;
  });
  const w = set.walls[1];                            // P33 一块墙砖砸下来
  if (t > bt(33)) {
    const u = ss(seg(t, bt(33), bt(33) + .3));
    w.m.position.y = w.home.y + (1 - u) * 26; w.m.rotation.z = (1 - u) * .18;
  } else { w.m.position.y = w.home.y; w.m.rotation.z = 0; }
}
function placeHer(t) {
  const vis = t >= bt(10) - .05 && t < 12.92;
  her.root.visible = vis;
  if (!vis) return;
  const u = clamp((t - (bt(10) - .05)) / (bt(13) - bt(10)), 0, 1.2);
  her.assemble(Math.min(1, u));
  const P = herAt(t);
  if (P) her.pose(P);
  if (t > bt(25)) her.assemble(1 - ss(seg(t, bt(25), bt(26) + .1)) * .92);
}

function render(t0) {
  const t = clamp(t0, 0, DUR - 1e-4), shot = shotAt(t);
  const pulse = beatPulse(t);
  const tp = T12(t);

  him.pose(himAt(tp));
  him.root.visible = t > .62;
  placeHer(tp);
  placeCarriages(t);
  placeDebris(t);

  const handR = him.arms[1].hand.getWorldPosition(V(0, 0, 0));
  const rest = V(1.7, FLOOR, 5.6);
  if (t < bt(26)) pinkBrick.visible = false;
  else if (t < bt(27)) {
    pinkBrick.visible = true;
    const u = seg(t, bt(26), bt(27));
    pinkBrick.position.copy(V(2.2, 5.6, 2.2)).add(V(0, -u * u * 2.6, 0));
    pinkBrick.rotation.set(u * 1.2, u * 2, 0);
  } else if (t < bt(55)) {
    pinkBrick.visible = true;
    pinkBrick.position.copy(handR.clone().add(V(0, t < bt(28) ? .4 : 1.1, 0)));
    pinkBrick.rotation.set(.2, .5, .1);
  } else if (t < bt(56)) {
    pinkBrick.visible = true;
    const u = seg(t, bt(55), bt(56));
    pinkBrick.position.copy(handR.clone().add(V(0, 1.1, 0))).lerp(rest, ss(u));
    pinkBrick.rotation.set(u * 3, u * 5, 0);
  } else { pinkBrick.visible = true; pinkBrick.position.copy(rest); pinkBrick.rotation.set(0, .7, 0); }

  plug.visible = t < .72;
  if (plug.visible) {
    const u = ss(seg(t, .18, .36));
    plug.position.copy(JACK).add(V(0, lerp(4.6, -.2, u), 0));
    plug.rotation.z = Math.sin(t * 40) * .02 * (1 - u);
  }

  const night = seg(t, 8.7, 9.3) * (1 - seg(t, 12.8, 13.3));
  const sub = t > 15.68 && t < 20.34 ? .45 : 0;
  const dead = ss(seg(t, bt(58), bt(58) + 1.2));
  set.key.intensity = lerp(lerp(4.6, .75, night) - sub * .5, .1, dead) + pulse * .55 * (1 - dead);
  set.bulb.intensity = lerp(lerp(950, 240, night), 0, dead) + pulse * 110 * (1 - dead);
  set.softKey.intensity = lerp(5.5, .9, night) * (1 - dead * .9);
  set.softRim.intensity = lerp(4, 5.5, night) * (1 - dead * .8);
  set.screen.material.emissiveIntensity = lerp(2.4, 2.6, night) + pulse * .5;
  renderer.toneMappingExposure = lerp(1.06, .74, night * (1 - dead));
  set.screenLight.intensity = lerp(130, 270, night) * (1 - dead * .75) + pulse * 34;
  set.art.material.emissiveIntensity = lerp(1.1, 1.5, night);

  post.vig.uniforms.sat.value = lerp(1.14, .28, ss(seg(t, bt(58), bt(58) + 1.6)));
  post.vig.uniforms.warm.value = lerp(-.26, -.02, night);

  cam(t, shot);
  post.composer.render();
  hud(t);
}

window.render = render;
window.DUR = DUR;
await document.fonts.load('82px Xingkai');
await document.fonts.load('132px Xingkai');
render(0);
window.READY = true;
