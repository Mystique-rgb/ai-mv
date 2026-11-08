// core.js (flat vector engine) — 综艺节奏扁平 / game-show。
// 只做三件事：把一条多边形填平涂色、描一条墨线、把画好的帧合成出去。
// 不用 p5.brush、不用水彩、不用渐变、不用模糊。所有形都是 paint() / inkLine()，一律纯色。
const W = window.STAGE_W || 1920, H = window.STAGE_H || 1080;
const BPM = PROJECT.bpm, BEAT = 60 / BPM, OFF = PROJECT.offset || 0, DUR = PROJECT.duration;
const TAU = Math.PI * 2;

const PAL = {
  ink: '#1A1418', paper: '#FFF6E8', cream: '#FFE9C9', white: '#FFFFFF',
  clay: '#D97757', clayDk: '#A8452C', clayLt: '#F2A283',      // A：Clawd 原色（全片不换）
  pink: '#FF4FA3', pinkDk: '#C81E74', pinkLt: '#FF9AC9',      // B：粉
  yellow: '#FFC93C', orange: '#FF8A3D', red: '#FF4A3D',
  mint: '#43D6A0', lime: '#B8E63C', sky: '#4FC3F7', blue: '#2F5BFF',
  deep: '#1B2A6B', violet: '#241A3D', teal: '#1FA3A3',
  indigo: '#2F3C7A', rose: '#E27A92', ochre: '#E8AA38', sap: '#6E9F58',
};
const K_SW = 4.2;   // 描边宽度系数：clawd 传进来的 sw 是"笔刷单位"

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeIn = x => Math.pow(clamp(x), 3);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const backOut = x => { x = clamp(x); const s = 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const elasticOut = x => { x = clamp(x); return x === 0 || x === 1 ? x : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (TAU / 3)) + 1; };
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const bpOf = t => (t - OFF) / BEAT;
const seg = (t, a, b) => clamp((t - a) / ((b - a) || 1e-9));
const frac = x => x - Math.floor(x);
const beatN = t => Math.floor(bpOf(t));
const pulse = (t, k = 6) => Math.exp(-frac(bpOf(t)) * k);
const pulse2 = (t, k = 6) => Math.exp(-frac(bpOf(t) * 2) * k);
const wob = (t, f = 1, ph = 0) => Math.sin((t * f + ph) * TAU);
const shakeXY = (t, amt) => { const f = Math.floor(t * 24); return [(hash(f * 1.7) - .5) * 2 * amt, (hash(f * 2.3 + 9) - .5) * 2 * amt]; };
const spring = (t, t0, k = 6, w = 18) => t < t0 ? 0 : Math.exp(-k * (t - t0)) * Math.sin(w * (t - t0));
const ring = (t, evs, k = 6, w = 18) => evs.reduce((s, e) => s + spring(t, e, k, w), 0);
const onTwos = t => Math.floor(t * 12 + 1e-6) / 12;
const arcPt = (p0, p1, h, k) => [lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k) - h * 4 * k * (1 - k)];

function kf(t, keys, e = ease) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a));
      return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k);
    }
  }
  return keys[keys.length - 1][1];
}
function mixCol(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = i => Math.round(lerp((pa >> i) & 255, (pb >> i) & 255, clamp(k)));
  return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1);
}

// 平面风格不抖、不 boil：clawd.js 里的 jit()/boilSeed() 全部退化成空操作，形是干净的矢量边。
const jit = () => 0;
const boilSeed = () => {};
let BOILN = 0, CLAWD_N = 0;

function jump(t, t0, t1, h = 3) {
  if (t < t0 - .12) return { dy: 0, sq: 0 };
  if (t < t0) return { dy: 0, sq: .18 * ease(seg(t, t0 - .12, t0)) };
  if (t < t1) { const k = (t - t0) / (t1 - t0); return { dy: -h * 4 * k * (1 - k), sq: -.16 * Math.abs(1 - 2 * k) }; }
  const a = t - t1; return { dy: 0, sq: .22 * Math.exp(-8 * a) * Math.cos(20 * a) };
}
function take(t, t0, amt = 1) {
  if (t < t0 - .1) return { sq: 0, dy: 0 };
  if (t < t0) return { sq: .12 * amt * ease(seg(t, t0 - .1, t0)), dy: 0 };
  const a = t - t0; return { sq: -.26 * amt * Math.exp(-6 * a) * Math.cos(16 * a), dy: -1.2 * amt * Math.exp(-7 * a) * Math.max(0, Math.cos(9 * a)) };
}
function stroll(t, t0, t1, x0, x1, u) {
  const x = lerp(x0, x1, ease(seg(t, t0, t1))), d = Math.abs(x - x0) / (4 * u), moving = t > t0 && t < t1;
  return { x, walk: d, view: moving ? 'q' : 'front', flip: x1 < x0, dy: moving ? -Math.abs(Math.sin(d * Math.PI)) * .5 : 0 };
}

// ---------- camera ----------
let CAM = null, LAST_CAM = null;
function camBegin(cx = W / 2, cy = H / 2, zoom = 1, rot = 0) { push(); translate(W / 2, H / 2); rotate(rot); scale(zoom); translate(-cx, -cy); CAM = LAST_CAM = { cx, cy, zoom, rot }; }
function camEnd() { pop(); CAM = null; }
function toScreen(x, y, cam = CAM) {
  if (!cam) return [x, y];
  const c = Math.cos(cam.rot), s = Math.sin(cam.rot), dx = (x - cam.cx) * cam.zoom, dy = (y - cam.cy) * cam.zoom;
  return [W / 2 + dx * c - dy * s, H / 2 + dx * s + dy * c];
}

// ---------- geometry ----------
const rectPts = (x, y, w, h) => [[x, y], [x + w / 2, y], [x + w, y], [x + w, y + h / 2], [x + w, y + h], [x + w / 2, y + h], [x, y + h], [x, y + h / 2]];
function ellPts(cx, cy, rx, ry, n = 32, rot = 0) {
  const p = []; for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p;
}
function rrPts(x, y, w, h, r) {
  const p = [], N = 6, corner = (cx, cy, a0) => { for (let i = 0; i <= N; i++) { const a = a0 + i / N * Math.PI / 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  r = Math.min(r, w / 2, h / 2);
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI);
  return p;
}
function starPts(cx, cy, r, inner = .38, n = 4, rot = -Math.PI / 2) {
  const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, q = i % 2 ? r * inner : r; p.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } return p;
}
function through(P, n = 6) {
  if (P.length < 3) return P.slice();
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const u = k / n, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map(d => .5 * (2 * p1[d] + (p2[d] - p0[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * u3)));
    }
  }
  out.push(P[P.length - 1]);
  return out;
}
function ribbon(P, w0, w1 = w0) {
  const C = through(P), n = C.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, i / Math.max(1, n - 1)) / 2;
    L.push([C[i][0] - dy / d * w, C[i][1] + dx / d * w]); R.push([C[i][0] + dy / d * w, C[i][1] - dx / d * w]);
  }
  return L.concat(R.reverse());
}

// ---------- paint / ink ----------
function pathOf(pts) { const c = drawingContext; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); }
// 一次调用 = 一个平涂形：可选实心填充（wash/fill），可选墨描边。没有纹理、没有渐变。
function paint(pts, o = {}) {
  if (!pts || pts.length < 3) return;
  const c = drawingContext;
  const fc = o.wash || o.fill;
  if (fc) {
    c.save(); pathOf(pts);
    c.globalAlpha = clamp((o.wash ? (o.washOp ?? 255) : (o.fillOp ?? 170)) / 255);
    c.fillStyle = fc; c.fill(); c.restore();
  }
  if (o.ink !== null && o.ink !== undefined) {
    c.save(); pathOf(pts);
    c.globalAlpha = clamp((o.inkOp ?? 255) / 255);
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.lineWidth = Math.max(.8, (o.sw ?? 1) * K_SW);
    c.strokeStyle = o.ink || PAL.ink; c.stroke(); c.restore();
  }
}
function inkLine(pts, sw = 1, col = PAL.ink, br = 'ink', curv = .5) {
  if (!pts || pts.length < 2) return;
  const c = drawingContext;
  c.save(); c.beginPath();
  const P = pts.length > 2 ? through(pts, 4) : pts;
  c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]);
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.lineWidth = Math.max(.8, sw * K_SW * (br === 'dry' ? 1.6 : br === 'inkfine' ? .55 : .9));
  c.strokeStyle = col; c.stroke(); c.restore();
}
function flash(k, col = PAL.paper) {
  if (k <= .01) return;
  const c = drawingContext; c.save(); c.globalAlpha = clamp(k); c.fillStyle = col; c.fillRect(-200, -200, W + 400, H + 400); c.restore();
}
const glow = () => {};   // 这套风格没有光晕
const ell = (cx, cy, rx, ry, col, a = 1) => paint(ellPts(cx, cy, rx, ry, 28), { wash: col, washOp: 255 * a, ink: null });

// ---------- lettering (字幕在合成器上另画，这里不用) ----------
let LETTERS = [];
function letter() {} function sfx() {}
function flushLetters() { LETTERS = []; }

// ---------- frame ----------
let grainC = null, outC = null, outX = null, T = 0;
let SHOT_T0 = 0;                       // 当前镜头的起始绝对时间（timeline 设）
const sh = local => SHOT_T0 + local;   // 镜头内局部时间 → 绝对时间（给 emotions 的 keys 用）

function makeGrain() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'), id = c.createImageData(W, H), d = id.data;
  let s = 12345; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < d.length; i += 4) { const v = 255 - (rnd() < .5 ? rnd() * 6 : 0); d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255; }
  c.putImageData(id, 0, 0);
  return cv;
}

async function setup() {
  createCanvas(W, H);   // P2D：要的是干净矢量边
  pixelDensity(1);
  grainC = makeGrain();
  outC = document.getElementById('out'); outX = outC.getContext('2d');
  await Promise.all([document.fonts.load('120px "PiaoyiKai"', '最美的期待我睁开双眼'), ...(window.EXTRA_FONTS || []).map(([f, txt]) => document.fonts.load(f, txt))]);
  // p5 2.x 的全局变换在 P2D 下和裸 ctx 调用不同步，所以把整套变换换成直接操作 ctx。
  // clawd.js / gs.js / scenes.js 里的 push/pop/translate/rotate/scale 从此都走这一套，和 paint() 同源。
  window.push = () => { drawingContext.save(); };
  window.pop = () => { drawingContext.restore(); };
  window.translate = (x = 0, y = 0) => { drawingContext.translate(x, y); };
  window.rotate = a => { drawingContext.rotate(a); };
  window.scale = (x = 1, y = 1) => { drawingContext.scale(x, y === undefined ? x : y); };
  window.ready = true;
  if (!location.search.includes('render')) devUI();
}

function draw() {
  if (!window.ready) return;
  LETTERS = []; CAM = LAST_CAM = null;
  CLAWD_N = 0;
  const c = drawingContext;
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
  c.fillStyle = PAL.paper; c.fillRect(0, 0, W, H);
  drawWorld(T);          // P2D 原点本来就在左上角，世界坐标 = 画布坐标，不再整体平移
  c.setTransform(1, 0, 0, 1, 0, 0);
}

function composite(t) {
  const c = outX;
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  c.drawImage(drawingContext.canvas, 0, 0, W, H);
  c.globalCompositeOperation = 'multiply'; c.globalAlpha = .35; c.drawImage(grainC, 0, 0);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  if (window.overlayHook) window.overlayHook(c, t);
}

window.renderAt = async (t, type = 'image/png', q = .92) => { T = t; await redraw(); composite(t); return outC.toDataURL(type, q); };
window.renderSheet = async (times, cols = 3, w = 640, crop = null, at = null) => {
  if (at) at = at.map((v) => typeof v === 'string' ? (0, eval)(v) : v);
  const [, , cw, ch] = at || crop || [0, 0, W, H], h = Math.round(w * ch / cw), rows = Math.ceil(times.length / cols), sc = document.createElement('canvas');
  sc.width = cols * w; sc.height = rows * h;
  const c = sc.getContext('2d'), ms = [];
  for (let i = 0; i < times.length; i++) {
    const t0 = performance.now(); T = times[i]; await redraw(); composite(times[i]); ms.push(Math.round(performance.now() - t0));
    const x = (i % cols) * w, y = Math.floor(i / cols) * h;
    const [cx, cy] = at ? toScreen(at[0], at[1], LAST_CAM).map((v, j) => v - (j ? ch : cw) / 2) : crop || [0, 0];
    c.drawImage(outC, cx, cy, cw, ch, x, y, w, h); c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(x, y, 92, 26); c.fillStyle = '#fff'; c.font = '16px sans-serif'; c.fillText(times[i].toFixed(2) + 's', x + 7, y + 18);
  }
  return { url: sc.toDataURL('image/jpeg', .92), ms };
};
window.gpuInfo = () => 'canvas2d';

function devUI() {
  const s = document.getElementById('scrub'), lab = document.getElementById('tt'); s.max = DUR; s.step = 1 / 24;
  let busy = false, want = null;
  const go = async () => { if (busy) return; busy = true; while (want != null) { const t = want; want = null; const t0 = performance.now(); await window.renderAt(t); lab.textContent = `${t.toFixed(2)}s  ·  ${Math.round(performance.now() - t0)} ms/frame`; } busy = false; };
  s.addEventListener('input', () => { want = +s.value; go(); });
  want = +(new URLSearchParams(location.search).get('t') || 0); s.value = want; go();
}
