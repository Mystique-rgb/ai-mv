import { Impasto, Strokes, KNIFE, BRUSH, DAB, LINE, hex, mixc } from '/styles/impasto/demo/engine/impasto.js';
import { Ref, paintRef } from '/styles/impasto/demo/engine/plate.js';
import { DUR, BEAT, T0, beat, SHOTS, LYRICS, HIT } from './timeline.js';

const W = 1920, H = 1080;
const q = new URLSearchParams(location.search);
const SS = +(q.get('ss') || 2);

// ---------- helpers (pure functions of t) ----------
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const ss_ = x => x * x * (3 - 2 * x);
const eo = x => 1 - (1 - x) * (1 - x) * (1 - x);
const ei = x => x * x * x;
const lerp = (a, b, t) => a + (b - a) * t;
function rng(seed) { let s = seed | 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// palette: ultramarine night, teal black, moon white; warm only for ember / firework
const P = {
  deep: hex('#0b1a33'), sea1: hex('#17335f'), sea2: hex('#24508a'), sea3: hex('#3a74b0'),
  teal: hex('#0e2a3a'), moon: hex('#f3e6cf'), paper: hex('#efe2c6'), paperShade: hex('#c9b78f'),
  ember: hex('#f26b2a'), emberHot: hex('#ffc46b'), gold: hex('#f7dca0'),
};

// ---------- scene: night sea (static strokes, built once) ----------
function buildSea() {
  const s = new Strokes(8000), r = rng(11);
  // sky: big flat planes, dark at top, a faint cold glow at the horizon
  for (let i = 0; i < 700; i++) {
    const y = r() * 1300 - 700, k = clamp((y + 700) / 1220, 0, 1);
    const c = mixc(P.deep, P.sea1, Math.pow(k, 1.4) * .9);
    s.push({ x: r() * (W + 1200) - 600, y, ang: (r() - .5) * .18, len: 220 + r() * 160, wid: 70 + r() * 50, c, c2: mixc(c, P.sea2, .25), type: KNIFE, seed: i, hgt: .8, taper: .1 });
  }
  // sea: horizontal planes, lighter and warmer toward the camera, long swell ridges
  for (let i = 0; i < 1500; i++) {
    const k = r(), y = 500 + Math.pow(k, .8) * 700;
    const c = mixc(P.sea1, P.sea3, Math.pow(k, 1.2) * .8 + r() * .15);
    s.push({ x: r() * (W + 1200) - 600, y, ang: (r() - .5) * .12 + Math.sin(y * .01) * .05, len: 120 + k * 260 + r() * 120, wid: 22 + k * 46 + r() * 18, c, c2: mixc(c, P.moon, r() * .12), type: KNIFE, seed: 1000 + i, hgt: 1 + k * .5 });
  }
  return s;
}

// ---------- scene: paper boat + ember (moving, rebuilt per frame with fixed seeds) ----------
// paper boat: drawn flat as a reference, converted once to knife strokes (fixed seed), cached as a batch
function buildBoat(E) {
  const ref = new Ref(300, 240, 2);
  const lit = '#fbf2de', paper = '#f3e4c4', shade = '#d2b98a', deep = '#b79c6a';
  const tri = (a, b, c) => ctx => { ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); };
  ref.fill(tri([148, 18], [148, 150], [38, 150]), lit, { dir: 60, maxR: 9, group: 1, hgt: 1.3, jit: .03 });
  ref.fill(tri([158, 54], [158, 150], [238, 150]), shade, { dir: 120, maxR: 8, group: 2, hgt: 1.3, jit: .03 });
  // hull: curved keel, ends lifted
  ref.fill(ctx => { ctx.moveTo(12, 150); ctx.lineTo(288, 150); ctx.lineTo(262, 196); ctx.quadraticCurveTo(150, 216, 38, 196); ctx.closePath(); }, paper, { dir: 0, maxR: 9, group: 3, hgt: 1.3, jit: .03 });
  ref.fill(ctx => { ctx.moveTo(150, 150); ctx.lineTo(288, 150); ctx.lineTo(262, 196); ctx.quadraticCurveTo(206, 208, 150, 210); ctx.closePath(); }, deep, { dir: 0, maxR: 8, group: 4, hgt: 1.3, jit: .03 });
  // folded prow tip
  ref.fill(tri([288, 150], [304, 128], [270, 150]), lit, { dir: 120, maxR: 5, group: 5, hgt: 1.4, jit: .03 });
  return E.batch(paintRef(ref, { R: [14, 8, 4], T: 14, seed: 3 }).data());
}
function ember(cx, cy, sc, glow, t) {
  const s = new Strokes(120), r = rng(91);
  const n = 7 + Math.floor(glow * 10);
  for (let i = 0; i < n; i++) {
    const a = i / n * 6.283 + t * .6, rad = (10 + (i % 3) * 7) * sc * (.5 + glow * .7);
    s.push({ x: cx + Math.cos(a) * rad * .6, y: cy + Math.sin(a) * rad * .6, ang: a, len: 26 * sc * (.4 + glow), wid: 16 * sc * (.4 + glow), c: i % 2 ? P.ember : P.emberHot, c2: P.gold, type: DAB, seed: 400 + i, hgt: 1.4 });
  }
  s.push({ x: cx, y: cy, len: 30 * sc * (.4 + glow), wid: 30 * sc * (.4 + glow), c: P.emberHot, c2: P.gold, type: DAB, seed: 499, hgt: 1.6 });
  return s;
}

// ---------- macro opening: ridges of paint raked by light, then a sweep that pulls back ----------
function macro(t) {
  const s = new Strokes(900), r = rng(5);
  for (let i = 0; i < 260; i++) {
    const x = r() * W, y = r() * H, a = -.18 + (r() - .5) * .3;
    const k = r();
    const c = k < .12 ? P.ember : mixc(P.sea1, P.sea3, r());
    s.push({ x, y, ang: a, len: 360 + r() * 380, wid: 90 + r() * 90, c, c2: mixc(c, P.moon, .3), type: KNIFE, seed: 2000 + i, hgt: 2.2 + r(), run: .35 });
  }
  return s;
}

// ---------- subtitles & title (DOM) ----------
const elSub = document.getElementById('sub'), elTitle = document.getElementById('title');
const tBig = elTitle.querySelector('.big'), tSmall = elTitle.querySelector('.small');
tBig.textContent = '寂寞烟火'; tSmall.textContent = '朱婧汐';
function subAt(t) {
  const L = LYRICS.find(l => t >= l.t0 && t < l.t1);
  if (!L) return null;
  return { text: L.text, p: seg(t, L.t0, L.t0 + .22), out: 1 - seg(t, L.t1 - .04, L.t1) };
}
function setSub(t) {
  const S = subAt(t);
  if (!S) { elSub.textContent = ''; return; }
  elSub.textContent = S.text;
  // left-to-right reveal: clip from the right
  const inset = (1 - eo(S.p)) * 100;
  elSub.style.clipPath = `inset(-20px ${inset}% -20px 0)`;
  elSub.style.opacity = String(S.out);
}
function setTitle(t) {
  const a = HIT.titleIn, b = a + 4.6;
  const k = seg(t, a, a + .9) * (1 - seg(t, b - .6, b));
  elTitle.style.opacity = String(ss_(k));
  elTitle.style.transform = `translateY(${(1 - eo(seg(t, a, a + .9))) * 18}px)`;
  const big = tBig; big.style.clipPath = `inset(-20px ${(1 - eo(seg(t, a, a + .9))) * 100}% -20px 0)`;
}

// ---------- setup ----------
const canvas = document.getElementById('c');
const E = new Impasto(canvas, { W, H, ss: SS });
const sea = E.batch(buildSea().data());
const boatB = buildBoat(E);

const FW = { x: 960, y: 120 };
const shore = (() => { const s = new Strokes(900), r = rng(21);
  for (let i = 0; i < 420; i++) { const k = r(); s.push({ x: -700 + r() * 1250, y: 545 + k * 340, ang: (r() - .5) * .1, len: 120 + r() * 160, wid: 24 + k * 40, c: mixc(hex('#3b2a22'), hex('#8a5f3a'), r() * .7), c2: hex('#c98d5e'), type: KNIFE, seed: 5000 + i, hgt: 1.2 + r() * .4, run: .3 }); }
  return E.batch(s.data()); })();
function figs(t) { const s = new Strokes(60);
  for (let i = 0; i < 5; i++) { const f = (t * .17 + i * .21) % 1, x = lerp(60, 500, f), y = 548 + (i % 2) * 26, a = Math.sin(Math.PI * f), sw = Math.sin(t * 5 + i) * .05;
    s.push({ x, y: y - 30, ang: 1.5708 + sw, len: 58, wid: 15, c: hex('#14141e'), c2: hex('#2a2430'), type: KNIFE, seed: 700 + i, hgt: 1.1, run: 0, alpha: a });
    s.push({ x, y: y - 66, len: 17, wid: 17, c: hex('#14141e'), type: DAB, seed: 710 + i, hgt: 1.2, alpha: a }); }
  return s; }
const STARS = (() => { const r = rng(8), a = []; for (let i = 0; i < 14; i++) a.push({ x: 520 + r() * 900, y: -130 + r() * 400, s: .7 + r() * .8, t: i < 7 ? beat(80 + i) : beat(97 + i) }); return a; })();
function stars(t) { const s = new Strokes(120);
  STARS.forEach((q, i) => { const k = eo(seg(t, q.t, q.t + .35)); if (k <= 0) return; const z = q.s * k * (1 + .08 * Math.sin(t * 3 + i));
    for (let j = 0; j < 4; j++) { const a = j * Math.PI / 2 + .4; s.push({ x: q.x + Math.cos(a) * 16 * z, y: q.y + Math.sin(a) * 16 * z, ang: a, len: 46 * z, wid: 11 * z, c: P.moon, c2: P.gold, type: KNIFE, taper: .9, seed: 800 + i * 4 + j, hgt: 1.2, run: 0 }); }
    s.push({ x: q.x, y: q.y, len: 22 * z, wid: 22 * z, c: P.gold, c2: P.moon, type: DAB, seed: 850 + i, hgt: 1.5 }); });
  return s; }
function firework(t) { const t0 = beat(88), s = new Strokes(400); const fade = 1 - seg(t, t0 + 1.6, t0 + 6.5); if (t < t0 || fade <= 0) return s;
  const cols = [P.emberHot, P.ember, hex('#e0507a'), P.gold];
  for (let ring = 0; ring < 2; ring++) { const kk = eo(seg(t, t0 + ring * .18, t0 + 1.1 + ring * .18)), N = ring ? 64 : 96;
    for (let i = 0; i < N; i++) { const a = i / N * 6.283 + ring * .03, rr = (ring ? 250 : 420) * kk * (.82 + .18 * ((i * 7) % 5) / 4), d = Math.pow(seg(t, t0 + 1, t0 + 4), 2) * (110 + ((i * 13) % 7) * 16);
      s.push({ x: FW.x + Math.cos(a) * rr * .88, y: FW.y + Math.sin(a) * rr * .88 + d, ang: a + (d > 0 ? (Math.PI / 2 - a) * Math.min(1, d / 160) : 0), len: (70 + ((i * 5) % 4) * 18) * (ring ? .7 : 1), wid: 17, c: cols[(i + ring) % 4], c2: cols[(i + ring + 1) % 4], type: KNIFE, taper: .6, alpha: fade, seed: 900 + ring * 100 + i, hgt: 1.5, run: .2 }); } }
  const fl = 1 - seg(t, t0, t0 + .3); if (fl > 0) s.push({ x: FW.x, y: FW.y, len: 200, wid: 200, c: P.gold, c2: P.emberHot, type: DAB, alpha: fl * .85, seed: 999, hgt: .6 });
  return s; }
function rainbow(t) { const s = new Strokes(300), al = 1 - .5 * seg(t, 46.48, 50.02) - .5 * seg(t, 50.5, 52.5);
  ['#d93a2f', '#f08a2a', '#f4c82a', '#3aa56a', '#2f62c0', '#7a4cc0'].map(hex).forEach((c, b) => { const R = 560 + b * 44;
    for (let i = 0; i < 40; i++) { const a = Math.PI + (i + .5) / 40 * Math.PI; s.push({ x: 960 + Math.cos(a) * R, y: 620 + Math.sin(a) * R, ang: a + Math.PI / 2, len: R * Math.PI / 40 * 1.5, wid: 46, c, c2: mixc(c, P.moon, .2), type: KNIFE, seed: 1100 + b * 40 + i, hgt: 1.3, run: .1, app: i / 40 * .5 + b * .02, alpha: Math.max(0, al) }); } });
  return s; }
const scrape = (() => { const s = new Strokes(100), r = rng(61);
  for (let row = 0; row < 9; row++) for (let i = 0; i < 9; i++) s.push({ x: i * 260 - 60 + r() * 80, y: row * 140 + r() * 60, ang: (r() - .5) * .1, len: 340, wid: 150, c: mixc(hex('#4d586b'), hex('#8a93a3'), r() * .6), c2: hex('#aab2c0'), type: KNIFE, seed: 1300 + row * 9 + i, hgt: 1, run: .5, app: i / 9 * .5 + r() * .08, alpha: .75 });
  return s; })();
function camAt(t) {
  if (t < 4) { const m = eo(seg(t, HIT.macroSweep, 4)); return { x: W / 2, y: lerp(620, 540, m), zoom: lerp(5.2, 1, m), rot: lerp(-.06, 0, m) }; }
  if (t < 7.54) { const k = seg(t, 4, 7.54); return { x: lerp(960, 1070, k), y: 540, zoom: lerp(1, 1.06, k), rot: 0 }; }
  if (t < 11.08) { const k = ss_(seg(t, 7.54, 11.08)); return { x: lerp(1070, 1090, k), y: lerp(560, 640, k), zoom: lerp(1.2, 2.3, k), rot: 0 }; }
  if (t < 14.62) { const k = ss_(seg(t, 11.08, 14.62)); return { x: lerp(760, 900, k), y: lerp(700, 600, k), zoom: lerp(1.6, .95, k), rot: lerp(.14, 0, k) }; }
  if (t < 18.16) { const k = ss_(seg(t, 14.62, 18.16)); return { x: 1000, y: lerp(930, 560, k), zoom: 1.2, rot: 0 }; }
  if (t < 19.93) { const k = ss_(seg(t, 18.16, 19.93)); return { x: lerp(300, 1500, k), y: 620, zoom: 1.6, rot: .06 * Math.sin(k * 3.14) }; }
  if (t < 21.70) { const k = seg(t, 19.93, 21.70); return { x: 1170, y: 646, zoom: lerp(3, 3.6, k), rot: 0 }; }
  if (t < 23.47) { const k = ss_(seg(t, 21.70, 23.47)); return { x: lerp(1170, 960, k), y: lerp(646, 600, k), zoom: lerp(3, .9, k), rot: 0 }; }
  if (t < 24.36) { const k = seg(t, 23.47, 24.36); return { x: 960, y: 600, zoom: lerp(.9, 1, k), rot: 0 }; }
  if (t < 31.43) { const k = ss_(seg(t, 24.36, 31.43)); return { x: lerp(960, 1300, k), y: 600, zoom: 1, rot: 0 }; }
  if (t < 35.42) { const k = ss_(seg(t, 31.43, 35.42)); return { x: lerp(1300, 1100, k), y: lerp(600, 640, k), zoom: lerp(1, 1.7, k), rot: 0 }; }
  if (t < 39.40) { const k = eo(seg(t, 35.42, 39.40)); return { x: lerp(1100, 960, k), y: lerp(640, 150, k), zoom: lerp(1.7, 1, k), rot: 0 }; }
  if (t < 42.94) { const k = seg(t, 39.40, 42.94); return { x: 960, y: lerp(150, 200, k), zoom: lerp(1, .8, k), rot: lerp(0, .2, k) }; }
  if (t < 46.48) { const k = seg(t, 42.94, 46.48); return { x: 960, y: 200, zoom: lerp(.8, .88, k), rot: 0 }; }
  if (t < 50.02) { const k = ss_(seg(t, 46.48, 50.02)); return { x: 960, y: lerp(200, -120, k), zoom: lerp(.88, 1, k), rot: 0 }; }
  return { x: 960, y: -120, zoom: lerp(1, 1.15, seg(t, 50.02, 55.28)), rot: 0 };
}
const G = t => t < 23.47 ? 0 : t < 24.2 ? ss_(seg(t, 23.47, 24.2)) : t < 38.8 ? 1 : 1 - ss_(seg(t, 38.8, 39.5));
const boatM = (bx, by, sc, rock) => { const c = Math.cos(rock) * sc, s = Math.sin(rock) * sc; return [c, s, -s, c, bx - (150 * c - 130 * s), by - (150 * s + 130 * c)]; };

window.DUR = DUR;
window.render = (t) => {
  const t88 = beat(88), bump = seg(t, t88, t88 + .1) * (1 - seg(t, t88 + 1, t88 + 3.1)), fs = ss_(seg(t, 50.02, 53));
  const post = { light: [-.55, -.6, t > 50 ? lerp(.7, .1, fs) : lerp(.7, .2, bump)], norm: 3.2, amb: lerp(.8, .28, fs), dif: .3, spec: .2 + .4 * bump, shin: 30, ao: 1.2, vig: .3, sat: 1.05, expo: 1 - seg(t, 53.6, 54.9), ground: [.05, .09, .16] };
  E.begin(post.ground);
  const cam = camAt(t), g = G(t), camB = { x: W / 2, y: H / 2, zoom: 1, rot: 0 };
  E.draw(sea, { t, grey: g, reveal: 1e9, cam, run: 1 });
  if (t >= 11.08 && t < 35.42) { E.draw(shore, { t, grey: g, reveal: 1e9, cam, run: .3 }); E.drawNow(figs(t).data(), { t, grey: g, reveal: 1e9, cam, run: 0 }); }
  const rock = Math.sin(t * 1.3) * .05 + Math.sin(t * 2.9) * .015;
  const bs = t < 4 ? lerp(.4, 1.6, ss_(seg(t, 2.2, 4.0))) : 1.6, sc = bs * .9;
  const bx = t < 4 ? 960 : 960 + Math.max(0, t - 24.36) * 6, by = 640 + Math.sin(t * 1.3 + .6) * 8, bc = t < 4 ? camB : cam;
  if (t > 1.6) E.draw(boatB, { M: boatM(bx, by, sc, rock), t, grey: g, reveal: 1e9, cam: bc, run: 0, alpha: 1 - ss_(seg(t, 36.2, 37.6)) });
  const glow = seg(t, HIT.emberLit - .05, HIT.emberLit + .5);
  if (glow > 0 && t < 39.4) {
    const co = Math.cos(rock), si = Math.sin(rock); let ex = bx + (146 * co - 4 * si) * sc, ey = by + (146 * si + 4 * co) * sc, es = bs * .5;
    const rise = eo(seg(t, 38.51, 39.4)); ex = lerp(ex, FW.x, rise); ey = lerp(ey, FW.y, rise); es = lerp(es, bs * 1.2, rise);
    E.drawNow(ember(ex, ey, es, glow, t).data(), { t, grey: 0, cam: bc, run: 0 });
    if (t < 38.51) { const rf = new Strokes(60), rr = rng(33);
      for (let i = 0; i < 16; i++) { const k = i / 15; rf.push({ x: ex + Math.sin(t * 1.7 + i * 1.3) * (4 + k * 14) + (rr() - .5) * 10, y: ey + 26 * bs + k * 170, ang: (rr() - .5) * .08, len: (30 - k * 16 + rr() * 10) * bs, wid: (5 - k * 2.5) * bs, c: P.ember, c2: P.emberHot, type: KNIFE, alpha: glow * (.8 - k * .7), seed: 600 + i, hgt: .4, run: .7 }); }
      E.drawNow(rf.data(), { t, grey: 0, cam: bc, run: .5 }); }
  }
  const ma = 1 - seg(t, 1.2, 3.6);
  if (ma > 0) E.drawNow(macro(t).data(), { t, grey: 0, cam: camB, alpha: ma, run: .35 });
  if (t >= 23.47 && t < 24.36) E.drawNow(scrape.data(), { t, grey: 0, cam: camB, appear: 23.47, appDur: .3, alpha: 1 - seg(t, 24.1, 24.36), run: .5 });
  if (t > 35.5) E.drawNow(stars(t).data(), { t, grey: 0, cam, run: 0 });
  if (t >= t88) E.drawNow(firework(t).data(), { t, grey: 0, cam, run: .2 });
  if (t >= beat(98)) E.drawNow(rainbow(t).data(), { t, grey: 0, cam, appear: beat(98), appDur: .12, run: .1 });
  if (t >= 53.2) { const m = new Strokes(4); m.push({ x: 960, y: -100, ang: -.05, len: 300, wid: 40, c: P.gold, c2: P.moon, type: KNIFE, seed: 1500, hgt: 1.6, run: .1 }); E.drawNow(m.data(), { t, grey: 0, cam, appear: 53.2, appDur: .5, run: .1 }); }
  E.finish(post);
  setSub(t); setTitle(t);
};
window.TEXTS = (t) => {
  const out = [];
  const L = LYRICS.find(l => t >= l.t0 + 0.25 && t < l.t1 - 0.04);
  if (L) { const w = L.text.length * 54 * 1.14; out.push({ id: 'lyric' + L.t0, text: L.text, x0: 960 - w / 2, x1: 960 + w / 2, y0: 940, y1: 1010 }); }
  if (t >= HIT.titleIn + 0.9 && t < HIT.titleIn + 4.0) out.push({ id: 'title', text: '寂寞烟火 朱婧汐', x0: 520, x1: 1400, y0: 120, y1: 330 });
  return out;
};
await document.fonts.load('54px NSSC', LYRICS.map(l => l.text).join('') + '寂寞烟火朱婧汐');
render(0); window.READY = true;
