// 《幻听》 · 纸片立体书 · 30.64 s / 16:9 / 30 fps
// 每一帧都是 t 的纯函数：没有 Math.random、没有跨帧状态。
import * as THREE from 'three';
import { makeBook, texOf, BW, BD } from './engine/book.js';
import { makePost } from './engine/post.js';
import { cutMesh, particles, blobShadow, thread } from './engine/cutmesh.js';
import { cv } from './engine/paper.js';
import { clamp, lerp, seg, ss, eio, eo, ei, back, spring, mulberry, TAU, track, env } from './engine/lib.js';
import * as ART from './art.js';
import { LINES, DUR, BEAT, T0, beat, TURN, SPREAD_OF, OPENING } from './story.js';

const W = 1920, H = 1080;
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);

const ov = document.getElementById('ov'), OX = ov.getContext('2d');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#150f0c');
const cam = new THREE.PerspectiveCamera(30, W / H, .004, 30);
const post = makePost(renderer, scene, cam, W, H);

// ---------- fonts ----------
const FONT = 'Xingkai';
await Promise.all([
  document.fonts.load(`700 96px ${FONT}`),
  document.fonts.load(`600 46px ${FONT}`),
  document.fonts.load(`150px ${FONT}`),
]);

// ---------- desk, room, light ----------
function woodTexture() {
  const c = cv(1024, 1024), x = c.getContext('2d'), R = mulberry(5);
  x.fillStyle = '#6b4526'; x.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 260; i++) {
    const y = R() * 1024, w = 40 + R() * 260;
    x.strokeStyle = `rgba(${R() < .5 ? '40,24,12' : '150,110,70'},${.05 + R() * .13})`;
    x.lineWidth = 1 + R() * 6; x.beginPath();
    for (let px = 0; px <= 1024; px += 32) x.lineTo(px, y + Math.sin(px * .01 + i) * 5);
    x.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t;
}
const desk = new THREE.Mesh(new THREE.BoxGeometry(2.2, .05, 1.4), new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: .78, color: '#c9a88a' }));
desk.position.set(0, -.025, .22); desk.receiveShadow = true; scene.add(desk);

const wall = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), new THREE.MeshStandardMaterial({ color: '#241a16', roughness: 1 }));
wall.position.set(0, 1.1, -1.1); scene.add(wall);

// lamp (paper-simple, stands behind-left of the book)
const brass = new THREE.MeshStandardMaterial({ color: '#8a6a3a', roughness: .45, metalness: .5 });
const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(.055, .062, .012, 24), brass); lampBase.position.set(-.47, .006, -.14); lampBase.castShadow = true; scene.add(lampBase);
const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .34, 12), brass); lampArm.position.set(-.47, .17, -.14); scene.add(lampArm);
const shade = new THREE.Mesh(new THREE.ConeGeometry(.075, .085, 26, 1, true), new THREE.MeshStandardMaterial({ color: '#2f6b52', roughness: .7, side: THREE.DoubleSide }));
shade.position.set(-.47, .345, -.14); shade.rotation.z = .18; scene.add(shade);
const bulb = new THREE.Mesh(new THREE.SphereGeometry(.012, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 2.9, 1.5) }));
bulb.position.set(-.47, .305, -.14); scene.add(bulb);

const spot = new THREE.SpotLight('#ffe3b8', 3.4, 2.4, .85, .7, 1.6);
spot.position.set(-.50, .36, -.18); spot.target.position.set(.04, 0, .12);
spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -.0006; spot.shadow.normalBias = .0008; spot.shadow.radius = 3;
scene.add(spot, spot.target);
const key = new THREE.DirectionalLight('#fff0dc', 1.9);
key.position.set(.45, .75, .55); key.target.position.set(0, 0, .1); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; key.shadow.normalBias = .0006; key.shadow.radius = 2.5;
key.shadow.camera.left = -.7; key.shadow.camera.right = .7; key.shadow.camera.top = .7; key.shadow.camera.bottom = -.7;
scene.add(key, key.target);
const hemi = new THREE.HemisphereLight('#a8bedd', '#4a3626', .8); scene.add(hemi);
const fill = new THREE.PointLight('#8fb6ff', .8, 2.2, 2); fill.position.set(.5, .35, .5); scene.add(fill);

// ---------- the book ----------
const pages = ART.buildPages();
const PT = {}; for (const k in pages) PT[k] = texOf(pages[k]);
const cover = ART.coverCanvases();
const book = makeBook(cover);
book.root.position.set(0, 0, .02);
scene.add(book.root);
book.setOpen(Math.PI / 2);

const SP = {
  room: { ground: PT.roomGround, back: PT.roomBack },
  night: { ground: PT.nightGround, back: PT.nightBack },
  city: { ground: PT.cityGround, back: PT.cityBack },
  blank: { ground: PT.blankGround, back: PT.blankBack },
};

// ---------- pop system ----------
const POPS = [];
function pop(parent, it, x, y, z, o = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z);
  const m = cutMesh(it, { backCol: o.backCol || '#efe8da' });
  if (o.flip) m.scale.x = -1;
  g.add(m); parent.add(g);
  const rec = { spread: o.spread ?? 'room', g, t0: o.t0 ?? 0, dur: o.dur ?? .26, dir: o.dir ?? 1, sway: o.sway || 0, x, y, z, m };
  POPS.push(rec); m.visible = true; g.visible = false;
  return rec;
}
function updatePops(t, spread) {
  for (const p of POPS) {
    const on = (p.spread === spread || (p.spread === 'roomN' && (spread === 'room' || spread === 'night'))) && t >= p.t0 - .01;
    p.g.visible = on;
    if (!on) continue;
    const raw = seg(t, p.t0, p.t0 + p.dur);
    const k = spring(raw * 1.6, 9, .42);
    p.g.rotation.x = -p.dir * (Math.PI / 2) * (1 - Math.min(1, k));
    if (p.sway) p.g.rotation.z = Math.sin(t * 2.1 + p.x * 30) * p.sway;
  }
}

// ---------- character ----------
const clawdTexCache = new Map();
function clawdTex(pose, eyes) {
  const key = pose + '|' + eyes;
  if (clawdTexCache.has(key)) return clawdTexCache.get(key);
  let o = { eyes };
  if (pose === 'walk1') o = { ...o, legs: 1, lean: .3 };
  else if (pose === 'walk2') o = { ...o, legs: -1, lean: .3 };
  else if (pose === 'run') o = { ...o, legs: 1, lean: .9, bodyH: .94 };
  else if (pose === 'jump') o = { ...o, legs: 0, bodyH: 1.06, lean: .2 };
  else if (pose === 'land') o = { ...o, bodyH: .84, lean: 0 };
  else if (pose === 'sit') o = { ...o, bodyH: .9, legs: 1 };
  else if (pose === 'reach') o = { ...o, arm: 1, lean: .5 };
  else if (pose === 'lean') o = { ...o, lean: 1.1 };
  else if (pose === 'open') o = { ...o, arm: -1, arm2: 1 };
  else if (pose === 'push') o = { ...o, arm: 1, lean: .8 };
  const it = ART.clawdItem(o);
  const t = texOf(it.c); clawdTexCache.set(key, t); return t;
}
const heroItem = ART.clawdItem({});
const hero = cutMesh(heroItem); hero.castShadow = true;
hero.position.set(-.06, 0, .10);
book.stage.add(hero);
const heroShadow = blobShadow(.022, .34); heroShadow.position.set(-.06, .0012, .10); book.stage.add(heroShadow);

const herItem = ART.clawdItem({ pink: true, eyes: 'closed', lean: .8 });
const her = cutMesh(herItem); her.scale.setScalar(1.0);
const herPivot = new THREE.Group(); herPivot.add(her);
her.position.set(0, 0, 0);
herPivot.position.set(.150, 0, .118); herPivot.rotation.y = -Math.PI / 2;
book.stage.add(herPivot);
const herShadow = blobShadow(.02, .28); herShadow.position.set(.150, .0012, .118); book.stage.add(herShadow);

// ---------- props ----------
const deck = pop(book.stage, ART.deckItem(), .00, 0, .115, { spread: 'roomN', t0: .30, dur: .3 });
const needle = pop(book.stage, ART.needleItem(), .035, .018, .116, { spread: 'roomN', t0: .55, dur: .15 });
const chairA = pop(book.stage, ART.chairItem(1), -.168, 0, .078, { spread: 'roomN', t0: .62 });
const chairB = pop(book.stage, ART.chairItem(2), .055, 0, .075, { spread: 'roomN', t0: .74, dir: 1 });
const cupA = pop(book.stage, ART.cupItem(false), -.052, 0, .145, { spread: 'roomN', t0: .86 });
const cupB = pop(book.stage, ART.cupItem(true), -.012, 0, .152, { spread: 'roomN', t0: .98 });
const phones = pop(book.stage, ART.phoneItem(), -.085, 0, .232, { spread: 'roomN', t0: 1.9, dur: .3 });
const wave = pop(book.stage, ART.waveItem(), -.058, .012, .207, { spread: 'room', t0: 7.10, dur: .18 });
const moon = pop(book.sky, ART.moonItem(), -.02, .10, .02, { spread: 'night', t0: 9.45, dur: .5 });
const moonThread = thread(.10); moonThread.position.set(-.02, .21, .018); moonThread.visible = false; book.sky.add(moonThread);
const ruler = pop(book.stage, ART.rulerItem(), .050, 0, .152, { spread: 'night', t0: 11.0, dur: .3 });
const rulerTop = pop(book.stage, ART.rulerItem(), .070, .010, .160, { spread: 'night', t0: 12.28, dur: .12 });   // the cracked-off half
const hairTie = pop(book.stage, ART.hairTieItem(), -.10, 0, .255, { spread: 'blank', t0: 20.6, dur: .3 });
const butterfly = pop(book.sky, ART.butterflyItem(), .09, .215, .03, { spread: 'room', t0: .1, dur: .3 });

// paper city
const CITY = [];
{
  const cols = [ART.C.red, ART.C.gold, ART.C.navy, ART.C.pink, ART.C.green];
  const R = mulberry(99);
  for (let i = 0; i < 16; i++) {
    const band = i % 4;
    const w = .030 + R() * .026, h = .038 + R() * (band === 0 ? .070 : .052);
    const x = -.19 + i * .025 + (R() - .5) * .014;
    const z = .040 + band * .048 + (R() - .5) * .014;
    const t0 = 13.22 + i * BEAT * .45;
    const b = pop(book.stage, ART.blockItem(w, h, cols[i % 5], 100 + i), x, 0, z, { spread: 'city', t0, dur: .22 });
    CITY.push({ ...b, h, w, x, z, i });
  }
  // street furniture
  pop(book.stage, ART.carItem(ART.C.red), .07, 0, .20, { spread: 'city', t0: 15.6, dur: .2 });
  pop(book.stage, ART.figureItem(1), -.12, 0, .245, { spread: 'city', t0: 17.92, dur: .2 });
  pop(book.stage, ART.figureItem(2), -.085, 0, .255, { spread: 'city', t0: 17.92, dur: .22 });
  pop(book.stage, ART.figureItem(3), -.155, 0, .25, { spread: 'city', t0: 17.92, dur: .24 });
}
// ribbons (pulled out at the end, they run over the front edge of the page)
const RIB = [];
for (const [col, t0, zz] of [[ART.C.red, 23.52, .295], [ART.C.gold, 24.0, .335], [ART.C.navy, 24.48, .375], [ART.C.pink, 24.48, .415]]) {
  const g = new THREE.Group();
  const it = ART.ribbonItem(col, .34);
  const m = cutMesh(it); m.rotation.x = -Math.PI / 2; m.position.set(-.17, .004, 0);
  g.add(m); g.position.set(.05, 0, zz); g.rotation.y = Math.PI / 2; book.stage.add(g);
  RIB.push({ g, t0, zz });
}

// ---------- particles: dust / rain / eraser / paper bits ----------
const quad = new THREE.PlaneGeometry(1, 1);
function spriteTex(fn, n = 64) { const c = cv(n, n), x = c.getContext('2d'); fn(x, n); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const dustTex = spriteTex((x, n) => { const g = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); g.addColorStop(0, 'rgba(255,248,225,1)'); g.addColorStop(.4, 'rgba(255,240,205,.55)'); g.addColorStop(1, 'rgba(255,240,205,0)'); x.fillStyle = g; x.fillRect(0, 0, n, n); });
const dustMat = new THREE.MeshBasicMaterial({ map: dustTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(1.6, 1.35, .95) });
const dust = particles(quad, dustMat, 70, (i, t) => {
  const R = mulberry(i * 31 + 7), x = (R() - .5) * .9, z = .05 + R() * .5;
  const y = .02 + ((R() * .5 + t * .012) % .5);
  const s = .0022 + R() * .0026;
  return { x, y, z, s: s * (0.6 + .4 * Math.sin(t * 2 + i)) };
});
dust.position.set(0, 0, 0); scene.add(dust);

const rainMat = new THREE.MeshBasicMaterial({ color: '#dfeaff', transparent: true, opacity: .75, depthWrite: false });
const rain = particles(new THREE.PlaneGeometry(.0026, .016), rainMat, 150, (i, t) => {
  const R = mulberry(i * 17 + 3);
  const gx = -.19 + R() * .38, sp = .55 + R() * .5;
  const y = .30 - ((t * sp + R() * .3) % .34);
  const z = .012 + R() * .012;
  return { x: gx, y, z, s: 1, rz: .12 };
});
book.sky.add(rain);

const eraserMat = new THREE.MeshBasicMaterial({ color: '#b9a996', transparent: true, opacity: .85, depthWrite: false });
const erasers = particles(new THREE.PlaneGeometry(.003, .003), eraserMat, 40, (i, t) => {
  const R = mulberry(i * 13 + 5), a = R() * TAU;
  const u = clamp((t - 20.2) / 1.2);
  if (u <= 0) return null;
  const r = .02 + u * .10 * R(), y = .10 - u * .10 * R();
  return { x: Math.cos(a) * r, y: .16 - u * .12, z: .05 + Math.sin(a) * r, s: u > .98 ? 0 : 1, rz: a };
});
book.sky.add(erasers);

// ---------- camera ----------
// [t, px,py,pz, tx,ty,tz, fov, aperture, focus]
const SHOTS = [
  { t0: 0.00, k: [[0.00, .004, .034, .470, .000, .028, .300, 27, 10, .170], [0.70, .000, .040, .440, .000, .030, .280, 27, 10, .16]] },
  { t0: 0.70, k: [[0.70, .28, .34, .84, .00, .045, .15, 30, 7, .78], [2.39, .26, .32, .80, .00, .045, .14, 30, 7, .74]] },
  { t0: 2.39, k: [[2.39, .12, .21, .56, -.02, .045, .14, 28, 9, .46], [5.36, .04, .20, .54, -.01, .045, .14, 28, 9, .44]] },
  { t0: 5.36, k: [[5.36, -.14, .15, .50, .04, .048, .15, 27, 10, .32], [6.63, -.16, .145, .48, .05, .050, .16, 26, 11, .30], [8.92, -.17, .150, .49, .05, .050, .16, 27, 10, .31]] },
  { t0: 8.92, k: [[8.92, .12, .30, .72, .00, .075, .12, 30, 7, .66], [10.30, .08, .32, .68, .00, .085, .11, 30, 7, .62], [11.12, .06, .28, .62, .00, .070, .10, 29, 8, .56]] },
  { t0: 11.12, k: [[11.12, .10, .155, .40, .02, .035, .12, 28, 9, .34], [12.92, .09, .150, .38, .02, .038, .12, 27, 10, .32]] },
  { t0: 12.92, k: [[12.92, .20, .26, .66, .00, .060, .11, 31, 8, .62], [15.68, .14, .36, .78, .00, .085, .12, 32, 8, .74]] },
  { t0: 15.68, k: [[15.68, .28, .34, .74, .00, .090, .12, 33, 7, .78], [17.90, .32, .28, .62, .02, .080, .13, 32, 7, .66], [19.58, .26, .33, .72, .00, .090, .12, 33, 7, .76]] },
  { t0: 19.58, k: [[19.58, .16, .38, .88, .00, .080, .10, 34, 6, .92], [20.74, .10, .20, .52, .00, .060, .16, 31, 8, .46]] },
  { t0: 20.74, k: [[20.74, .13, .175, .58, .01, .035, .22, 29, 9, .42], [22.15, .11, .155, .55, .01, .030, .23, 28, 10, .40]] },
  { t0: 22.15, k: [[22.15, .14, .17, .56, -.02, .050, .13, 29, 9, .44], [23.45, .16, .16, .55, -.04, .045, .13, 29, 9, .43]] },
  { t0: 23.45, k: [[23.45, .26, .26, .66, .00, .040, .24, 31, 8, .58], [24.60, .28, .22, .58, .05, .015, .32, 30, 9, .48], [26.85, .28, .20, .52, .06, .012, .36, 30, 9, .44]] },
  { t0: 26.85, k: [[26.85, .16, .28, .66, .00, .050, .12, 31, 8, .64], [28.30, .12, .30, .60, .00, .040, .10, 30, 9, .58], [29.90, .05, .34, .46, .00, .020, .08, 29, 10, .42], [30.64, .02, .16, .34, .00, .020, .08, 28, 11, .30]] },
];
const SHOT_TRACKS = SHOTS.map(s => ({ t0: s.t0, f: track(s.k.map(r => [r[0], r.slice(1)])) }));
function camAt(t) {
  let s = SHOT_TRACKS[SHOT_TRACKS.length - 1];
  for (const q of SHOT_TRACKS) if (t >= q.t0) s = q;
  return s.f(t);
}
const openAt = t => track(OPENING.map(o => [o.t, [o.a]]))(t)[0];
const CAMQ = new THREE.Quaternion();

// ---------- character motion ----------
const HZ = .10;   // his home z on the room page
function heroState(t) {
  let x = -.06, z = HZ, y = 0, pose = 'stand', eyes = 'flat', sy = 1, rot = 0;
  if (t < .98) { pose = 'jump'; y = -.02; }
  else if (t < 1.45) { const u = seg(t, .98, 1.45); y = lerp(.16, 0, u * u); pose = 'jump'; eyes = 'wide'; }
  else if (t < 2.86) { const u = seg(t, 1.45, 2.86); x = lerp(-.06, -.105, u); pose = u < .5 ? 'walk1' : 'walk2'; z = lerp(HZ, .125, u); }
  else if (t < 5.36) { const u = seg(t, 2.86, 4.0); x = lerp(-.105, -.075, u); z = lerp(.125, .165, u); pose = 'sit'; eyes = 'flat'; if (t > 3.2) pose = 'reach'; eyes = t > 3.3 && t < 4.2 ? 'up' : 'flat'; }
  else if (t < 8.92) { const u = seg(t, 5.36, 6.2); x = lerp(-.085, -.122, u); z = lerp(.155, .19, u); pose = t > 6.3 ? 'lean' : (u < 1 ? 'walk1' : 'stand'); eyes = t > 5.4 && t < 7.4 ? 'closed' : 'up'; if (t > 7.9) { pose = 'stand'; eyes = 'wide'; } }
  else if (t < 12.92) { const u = seg(t, 8.92, 10.4); x = lerp(-.085, -.14, u); z = lerp(.175, .22, u); pose = t > 9.9 && t < 10.6 ? 'reach' : 'lean'; eyes = t > 10.6 ? 'up' : 'closed'; if (t > 11.4) { const v = seg(t, 11.4, 12.0); x = lerp(-.14, -.075, v); z = lerp(.22, .185, v); pose = v < .9 ? 'push' : 'stand'; eyes = 'up'; } }
  else if (t < 15.68) { const u = seg(t, 12.92, 15.0); x = lerp(-.045, .02, u); z = lerp(.155, .20, u); pose = u < .9 ? 'run' : 'jump'; eyes = 'wide'; y = u > .55 ? Math.abs(Math.sin(seg(t, 14.0, 15.68) * 6.0)) * .02 : 0; }
  else if (t < 19.58) {
    const u = seg(t, 15.68, 19.58);
    x = lerp(-.02, .10, u) + Math.sin(u * 9) * .02;
    z = lerp(.19, .12, u);
    y = Math.abs(Math.sin(u * 12.5)) * .018;
    pose = y > .01 ? 'jump' : (u < .5 ? 'run' : 'stand');
    eyes = u > .1 && u < .7 ? 'wide' : 'up';
  }
  else if (t < 21.6) { const u = seg(t, 19.58, 20.6); x = lerp(.10, .005, u); z = lerp(.12, .245, u); y = Math.abs(Math.sin(seg(t, 19.6, 20.3) * 3 * Math.PI)) * .014; pose = u < .85 ? 'run' : 'stand'; eyes = 'up'; if (t > 20.6) { const v = seg(t, 20.6, 21.0); x = lerp(.005, -.01, v); z = lerp(.245, .16, v); pose = 'push'; } }
  else if (t < 23.45) { const u = seg(t, 21.6, 22.6); x = lerp(.03, .048, u); z = lerp(.06, .265, u); pose = u < .9 ? 'run' : 'reach'; eyes = 'flat'; if (t > 22.6) { pose = 'reach'; eyes = 'up'; } }
  else if (t < 26.85) {
    const u = seg(t, 23.45, 26.85);
    x = lerp(.05, .055, u); z = lerp(.28, .42, u);
    y = .004 + Math.abs(Math.sin(u * 7)) * .014; pose = 'jump'; eyes = 'wide';
  }
  else { const u = seg(t, 26.85, 27.9); x = lerp(.06, -.02, u); z = lerp(.40, .14, u); pose = u < .9 ? 'walk1' : 'stand'; eyes = t > 28.6 ? 'closed' : 'flat'; if (t > 30.0) pose = 'reach'; }
  // squash on landing
  const land = [[1.45, .05], [4.0, .04], [7.9, .05], [15.6, .05]];
  for (const [lt, d] of land) { const k = seg(t, lt, lt + d); if (k > 0 && k < 1) { sy = 1 - .22 * Math.sin(k * Math.PI); } }
  return { x, y, z, pose, eyes, sy, rot, scale: (t > 12.9 && t < 27) ? 1.3 : 1 };
}

// ---------- subtitle ----------
const CH = (s) => Array.from(s);
function drawSubs(t) {
  OX.clearRect(0, 0, W, H);
  for (const L of LINES) {
    if (t < L.t0 - .18 || t > L.t1 + .34) continue;
    const a = Math.min(seg(t, L.t0 - .18, L.t0 + .04), 1 - seg(t, L.t1 + .06, L.t1 + .32));
    if (a <= .002) continue;
    const total = L.rows.reduce((n, r) => n + CH(r).length, 0);
    const p = clamp((t - L.t0) / Math.max(.2, L.t1 - L.t0)) * total;
    const hot = L.karaoke ? '#c8402f' : '#e8a33d';
    const size = L.rows.length > 1 ? 92 : 100;
    OX.save();
    OX.globalAlpha = a;
    OX.textAlign = 'left'; OX.textBaseline = 'alphabetic';
    OX.lineJoin = 'round'; OX.lineCap = 'round';
    OX.font = `700 ${size}px ${FONT}`;
    OX.shadowColor = 'rgba(20,12,8,.45)'; OX.shadowBlur = 22;
    let idx = 0;
    const y0 = L.rows.length > 1 ? 900 : 950;
    L.rows.forEach((row, ri) => {
      const chars = CH(row);
      const widths = chars.map(c => OX.measureText(c).width);
      const rowW = widths.reduce((s, v) => s + v, 0);
      let x = 960 - rowW / 2;
      const y = y0 + ri * 104;
      chars.forEach((c, i) => {
        OX.lineWidth = 12; OX.strokeStyle = '#3b2a20'; OX.strokeText(c, x, y);
        OX.fillStyle = (idx + i) < p ? hot : '#fbf3e2';
        OX.fillText(c, x, y);
        x += widths[i];
      });
      idx += chars.length;
    });
    OX.restore();
  }
}

// ---------- spread state ----------
function spreadState(t) {
  const now = SPREAD_OF(t);
  let leafU = 0, leafFront = null, leafBack = null;
  for (const T of TURN) {
    if (t >= T.t0 && t <= T.t1) {
      leafU = eio(seg(t, T.t0, T.t1));
      const from = T.to === 'night' ? 'room' : T.to === 'city' ? 'night' : 'city';
      leafFront = SP[from].ground; leafBack = SP[T.to].back;
    }
  }
  return { now, leafU, leafFront, leafBack };
}

// ---------- render ----------
window.DUR = DUR;
window.render = (t) => {
  const st = spreadState(t);
  book.groundMat.map = SP[st.now].ground; book.groundMat.needsUpdate = true;
  book.backMat.map = SP[st.now].back; book.backMat.needsUpdate = true;
  if (st.leafU > 0 && st.leafU < 1) {
    book.leafFront.material.map = st.leafFront; book.leafFront.material.emissiveMap = st.leafFront;
    book.leafBack.material.map = st.leafBack; book.leafBack.material.emissiveMap = st.leafBack;
    book.leafFront.material.needsUpdate = book.leafBack.material.needsUpdate = true;
    book.setLeaf(st.leafU);
  } else book.setLeaf(0);

  book.setOpen(openAt(t));

  updatePops(t, st.now);

  // her: only while the fold is out
  const herOut = t > 6.10 && t < 8.10;
  herPivot.visible = herOut; herShadow.visible = herOut;
  if (herOut) {
    const k = spring(seg(t, 6.10, 6.55) * 1.5, 10, .4);
    herPivot.rotation.y = -Math.PI / 2 * (1 - Math.min(1, k)) - .06;
    herPivot.position.z = .118 + Math.sin(t * 1.6) * .002;
  }
  // needle reacts to the beat
  if (needle.g.visible) {
    const bp = ((t - T0) % BEAT) / BEAT;
    needle.g.rotation.z = -.50 + .34 * Math.exp(-bp * 4) + (t > 11.3 && t < 12.8 ? .22 : 0);
  }
  // moon rises on its thread
  if (moon.g.visible) {
    const k = seg(t, 9.5, 10.6);
    moon.g.position.y = lerp(.055, .215, ss(k));
    moonThread.visible = true; moonThread.scale.y = Math.max(.01, (moon.g.position.y - .10) / .10);
  } else moonThread.visible = false;
  // him
  const h = heroState(t);
  hero.position.set(h.x, h.y, h.z);
  hero.scale.set(h.scale, h.sy * h.scale, 1);
  hero.rotation.z = 0;
  const shine = Math.sin(t * 3.1);
  const eyes = (Math.sin(t * 1.7) > .985) ? 'closed' : h.eyes;
  const tex = clawdTex(h.pose, eyes);
  for (const m of [hero.userData.front, hero.userData.back]) if (m.material.map !== tex) { m.material.map = tex; m.material.needsUpdate = true; }
  heroShadow.position.set(h.x, .0012, h.z);
  const sc = clamp(1 - h.y * 2.2, .5, 1);
  heroShadow.scale.setScalar(sc); heroShadow.material.opacity = .34 * sc;

  // ribbons slide out
  for (const r of RIB) {
    const k = ss(seg(t, r.t0, r.t0 + .55));
    r.g.visible = t >= r.t0 - .01;
    r.g.scale.x = Math.max(.001, k);
    r.g.position.y = Math.sin(t * 2.2 + r.zz * 20) * .002;
    r.g.rotation.y = Math.PI / 2 + .08 * k;
  }

  // camera + lens
  const c = camAt(t);
  cam.position.set(c[0], c[1], c[2]);
  cam.fov = c[6]; cam.updateProjectionMatrix();
  cam.lookAt(c[3], c[4], c[5]);
  cam.updateMatrixWorld();
  const dx = c[0] - c[3], dy = c[1] - c[4], dz = c[2] - c[5];
  post.dof.focus = Math.sqrt(dx * dx + dy * dy + dz * dz); post.dof.aper = c[7]; post.dof.maxCoc = 14;
  post.bloom.strength = .16;

  // colour drain (k41–k43) — everything goes graphite except him
  const drainAmt = ss(seg(t, 19.30, 19.95)) * (1 - ss(seg(t, 20.30, 20.95)));
  const u = post.drain.material.uniforms;
  u.amt.value = drainAmt * .95;
  const pv = new THREE.Vector3(h.x, h.y + .026, h.z); book.stage.localToWorld(pv); pv.project(cam);
  u.c.value.set(pv.x * .5 + .5, pv.y * .5 + .5);
  u.r.value = .052;
  post.vig.material.uniforms.amt.value = .34;
  post.vig.material.uniforms.fade.value = ss(seg(t, 0.02, 0.34));

  // lights breathe with the song
  const dk = st.now === 'night' || st.now === 'city' ? 1 : 0;
  spot.intensity = lerp(3.4, 2.2, dk) * (1 + .07 * Math.exp(-(((t - T0) % BEAT) / BEAT) * 5));
  hemi.intensity = lerp(.8, .42, dk);
  key.intensity = lerp(1.9, .8, dk);
  const lampFade = 1 - ss(seg(t, 29.05, 29.35));
  bulb.material.color.setRGB(4 * lampFade, 2.9 * lampFade, 1.5 * lampFade);
  spot.visible = lampFade > .02; 

  post.composer.render();
  drawSubs(t);
  window.__t = t;
};
window.EV = [];
window.READY = true;
