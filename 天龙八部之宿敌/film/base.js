// 宿敌百景 · 浮世绘 MV —— 基础层
// 纸、色版、错版、题签、印章、场景构件
import { clamp, lerp, seg, ss, eio, eo, ei, hash, mulberry, TAU } from '/core/lib.js';
import {
  W, H, FR, PAL, TX, mk, buildTextures, stampLayer, stampFn, inkify, drawSeal, sealCanvas,
  rgba, mix, smooth, poly, carve, wob, line, bokashi, kasumi, vtext, vlen, cartouche
} from '/styles/ukiyoe/demo/print.js';

export { W, H, FR, PAL, TX, mk, buildTextures, stampLayer, stampFn, inkify, drawSeal, sealCanvas, rgba, mix, smooth, poly, carve, wob, line, bokashi, kasumi, vtext, cartouche };
export { clamp, lerp, seg, ss, eio, eo, ei, hash, mulberry, TAU };

export const STX = 'Xingkai';

// —— 三套色版：同一块黑骨版，三次印 ——
const blank = 'rgba(0,0,0,0)';
export const PSET = {
  // B1：靛青为骨、朱红为点，克制
  B1: {
    sky: '#2a4a72', skyD: '#16294a', skyL: '#5b7ea3', cloud: '#dfe3dc',
    water: '#2f4f73', waterL: '#7c9db4', earth: '#cbb894', earthD: '#a08a63',
    warm: '#cf9f4a', hot: '#b8412f', hotL: '#d98070', pale: '#e8dcc0',
    far: '#8ba0b4', robeA: '#2c4a70', robeB: '#a8494a', ink: '#231f1c', N: false,
  },
  // B2：红压一切
  B2: {
    sky: '#b8412f', skyD: '#8e2a1f', skyL: '#d98070', cloud: '#e7b9a6',
    water: '#a33a2c', waterL: '#d0604a', earth: '#8e2a1f', earthD: '#6d1e16',
    warm: '#d0604a', hot: '#8e2a1f', hotL: '#c05a45', pale: '#d8a08a',
    far: '#b0563f', robeA: '#8e2a1f', robeB: '#5e1610', ink: '#2a1410', N: false,
  },
  // B3：色版全撤，只有线
  B3: {
    sky: blank, skyD: blank, skyL: blank, cloud: blank, water: blank, waterL: blank,
    earth: blank, earthD: blank, warm: blank, hot: blank, hotL: blank, pale: blank,
    far: blank, robeA: blank, robeB: blank, ink: '#231f1c', N: true,
  },
};

// 错版曲线：0 → .5 → 1 → 2 → 2 → 2.5 → 4 → 8 → 0 → 0
const DIPK = [[0, 0], [22.3, .5], [42.0, 1.0], [61.9, 2.0], [101.8, 2.0], [123.5, 2.5], [143.2, 4.0], [163.5, 8.0], [205.1, 0], [263.4, 0]];
export function dip(t) {
  for (let i = 1; i < DIPK.length; i++) if (t <= DIPK[i][0]) {
    const [a, ua] = DIPK[i - 1], [b, ub] = DIPK[i];
    return lerp(ua, ub, ss(seg(t, a, b)));
  }
  return 0;
}
export const BEAT = 0.4350, BAR = BEAT * 4;
export const q8 = t => Math.floor(t * 8) / 8;
export const beat = t => Math.floor(t / BEAT);
// 步进抖动（8fps 手抖，不是正弦）
export const jit8 = (t, seed) => (hash(Math.floor(t * 8) * 3.7 + seed * 11.3) - .5);

// —— 纸 ——
export function paper(x) { x.drawImage(TX.paper, 0, 0); }
export function frame(x, lw = 3.2) {
  x.strokeStyle = PAL.sumi; x.lineWidth = lw;
  x.strokeRect(FR.x0, FR.y0, FR.x1 - FR.x0, FR.y1 - FR.y0);
  x.lineWidth = 1.25; x.strokeRect(FR.x0 - 9, FR.y0 - 9, FR.x1 - FR.x0 + 18, FR.y1 - FR.y0 + 18);
}
export function mountBG(x) { x.fillStyle = PAL.mount; x.fillRect(0, 0, W, H); }

// —— 部件缓存（每镜一张静态画） ——
const CACHE = new Map(); const ORDER = []; const MAX = 9;
export function sheet(key, build) {
  let c = CACHE.get(key);
  if (c) { ORDER.splice(ORDER.indexOf(key), 1); ORDER.push(key); return c; }
  c = mk(); const x = c.getContext('2d');
  x.fillStyle = PAL.paper; x.fillRect(0, 0, W, H);
  build(x);
  x.drawImage(TX.fiber, 0, 0);
  CACHE.set(key, c); ORDER.push(key);
  while (ORDER.length > MAX) { const k = ORDER.shift(); CACHE.delete(k); }
  return c;
}
export function clearCache() { CACHE.clear(); ORDER.length = 0; }

// —— 印 ——
export function seal(x, chars, cx, cy, size, p, o = {}) { drawSeal(x, chars, cx, cy, size, p, o); }
export function bigSeal(x, chars, cx, cy, size, p, o = {}) {
  const c = sealCanvas(chars, size, o);
  x.save(); x.translate(cx, cy); x.rotate(o.rot || 0);
  const s = p < 1 ? lerp(1.3, 1, ss(clamp(p / .55))) : 1, a = clamp(p / .3);
  x.globalAlpha = a * .95; x.scale(s, s); x.globalCompositeOperation = o.normal ? 'source-over' : 'multiply';
  x.drawImage(c, -c.width / 2, -c.height / 2); x.restore();
}

// —— 题签（竖） ——
export function slipV(x, title, cx, y0, o = {}) {
  const w = o.w || 84, size = o.size || 50;
  const b = cartouche(x, cx, y0, title, { series: o.series ?? '', w, size, ssize: o.ssize || 27, fill: o.fill || '#f3e7c6' });
  return b;
}

// —— 字幕：米色纸条 + 双线墨框 + 左朱印 + 行楷 ——
export function subSlip(x, text, p, o = {}) {
  if (p <= 0) return;
  const size = o.size || 56, pad = 52, sealW = 74;
  x.save();
  x.font = `400 ${size}px ${STX}`;
  const tw = x.measureText(text).width;
  const w = tw + pad * 2 + sealW, h = size * 1.55;
  const cx = o.cx ?? W / 2, y0 = o.y ?? (H - 86 - h);
  const x0 = cx - w / 2;
  const a = clamp(p / .6);
  // 落：上浮 + 印刷显影
  x.globalAlpha = 1;
  stampFn(x, g => {
    g.save(); g.translate(0, (1 - clamp(p)) * 12);
    g.fillStyle = o.fill || 'rgba(243,231,198,.96)';
    g.fillRect(x0, y0, w, h);
    // 纸条自己的错版边
    g.strokeStyle = PAL.sumi; g.lineWidth = 2.6; g.strokeRect(x0, y0, w, h);
    g.lineWidth = 1.1; g.strokeRect(x0 + 5, y0 + 5, w - 10, h - 10);
    g.fillStyle = o.ink || PAL.sumi;
    g.textAlign = 'left'; g.textBaseline = 'middle';
    g.font = `400 ${size}px ${STX}`;
    g.fillText(text, x0 + sealW + pad * .55, y0 + h / 2 + 3);
    g.restore();
  }, a, o.shift || [4, -3]);
  if (!o.noSeal) {
    const sc = sealCanvas('宿', 40, { seed: 17 });
    x.globalCompositeOperation = 'multiply'; x.globalAlpha = a * .9;
    x.drawImage(sc, x0 + 22, y0 + h / 2 - sc.height / 2);
  }
  x.restore();
}

// —— 粒子：雪 / 灰 / 火星 / 花瓣（有墨线勾边的白点） ——
export function snow(x, t, n, rect, o = {}) {
  const [x0, y0, x1, y1] = rect, R = mulberry(o.seed || 5), k = Math.floor(t * 12) / 12;
  for (let i = 0; i < n; i++) {
    const sp = .5 + R() * .8, sz = 1.6 + R() * (o.size || 4.2);
    const px = x0 + R() * (x1 - x0) + Math.sin(k * .8 + i) * (o.sway || 14);
    const py = y0 + ((R() * (y1 - y0) + k * 90 * sp) % (y1 - y0));
    x.beginPath(); x.arc(px, py, sz, 0, TAU);
    x.fillStyle = o.col || PAL.white; x.fill();
    if (o.ink) { x.strokeStyle = rgba(PAL.sumi, .5); x.lineWidth = .9; x.stroke(); }
  }
}
export function petals(x, t, n, rect, o = {}) {
  const [x0, y0, x1, y1] = rect, R = mulberry(o.seed || 9);
  for (let i = 0; i < n; i++) {
    const px = x0 + R() * (x1 - x0) + Math.sin(t * 1.1 + i) * 26;
    const py = y0 + ((R() * (y1 - y0) + t * (46 + R() * 60)) % (y1 - y0));
    const s = 4 + R() * 5, a = t * (1 + R() * 2) + i;
    x.save(); x.translate(px, py); x.rotate(a);
    x.beginPath(); x.ellipse(0, 0, s, s * .62, 0, 0, TAU);
    x.fillStyle = o.col || '#e7b9a6'; x.fill();
    x.strokeStyle = rgba(PAL.sumi, .35); x.lineWidth = .8; x.stroke();
    x.restore();
  }
}
// 纸屑（前作语言，浮世绘里作为「印刷残渣」）
export function scraps(x, t, n, rect, o = {}) {
  const [x0, y0, x1, y1] = rect, R = mulberry(o.seed || 3);
  for (let i = 0; i < n; i++) {
    const px = x0 + R() * (x1 - x0), py = y0 + ((R() * (y1 - y0) + t * (110 + R() * 130)) % (y1 - y0));
    const s = 3 + R() * 7;
    x.save(); x.translate(px, py); x.rotate(t * (2 + R() * 3) + i);
    x.fillStyle = o.col || PAL.white; x.fillRect(-s / 2, -s * .35, s, s * .7);
    x.strokeStyle = rgba(PAL.sumi, .45); x.lineWidth = .8; x.strokeRect(-s / 2, -s * .35, s, s * .7);
    x.restore();
  }
}

// —— 构件：灯笼 ——
export function lantern(x, cx, cy, s, lit = 1, o = {}) {
  const w = 42 * s, h = 54 * s;
  x.save(); x.translate(cx, cy);
  if (lit > 0) {
    const g = x.createRadialGradient(0, 0, 4 * s, 0, 0, 120 * s);
    g.addColorStop(0, rgba(o.glow || PAL.beniL, .55 * lit)); g.addColorStop(1, rgba(o.glow || PAL.beniL, 0));
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, 120 * s, 0, TAU); x.fill();
  }
  // 提梁
  x.strokeStyle = PAL.sumi; x.lineWidth = 1.6 * s;
  x.beginPath(); x.moveTo(0, -h * .62); x.lineTo(0, -h * .5); x.stroke();
  // 灯身（腰鼓形）
  x.beginPath();
  x.moveTo(-w * .5, -h * .2); x.bezierCurveTo(-w * .72, -h * .48, -w * .62, -h * .5, 0, -h * .5);
  x.bezierCurveTo(w * .62, -h * .5, w * .72, -h * .48, w * .5, -h * .2);
  x.bezierCurveTo(w * .72, h * .1, w * .62, h * .5, 0, h * .5);
  x.bezierCurveTo(-w * .62, h * .5, -w * .72, h * .1, -w * .5, -h * .2); x.closePath();
  x.fillStyle = o.body || PAL.white; x.globalAlpha = o.alpha ?? 1; x.fill(); x.globalAlpha = 1;
  x.strokeStyle = PAL.sumi; x.lineWidth = 1.7 * s; x.stroke();
  // 竖棱
  x.lineWidth = .9 * s;
  for (let i = -2; i <= 2; i++) { x.beginPath(); x.moveTo(i * w * .17, -h * .46); x.quadraticCurveTo(i * w * .26, 0, i * w * .17, h * .46); x.stroke(); }
  // 上下箍
  x.fillStyle = PAL.ink; x.fillRect(-w * .18, -h * .56, w * .36, h * .07); x.fillRect(-w * .18, h * .49, w * .36, h * .07);
  // 穗
  if (o.tassel !== false) { x.strokeStyle = PAL.beni; x.lineWidth = 2 * s; x.beginPath(); x.moveTo(0, h * .56); x.lineTo(0, h * .78); x.stroke(); }
  x.restore();
}

// —— 构件：屋顶（起翘的檐） ——
export function roof(x, cx, by, w, h, col, o = {}) {
  const e = w * .5, lift = h * .55;
  x.beginPath();
  x.moveTo(cx - e - w * .04, by - lift * .18);
  x.quadraticCurveTo(cx - e * .86, by - h * .55, cx - w * .16, by - h);
  x.lineTo(cx + w * .16, by - h);
  x.quadraticCurveTo(cx + e * .86, by - h * .55, cx + e + w * .04, by - lift * .18);
  x.quadraticCurveTo(cx + e * .8, by + lift * .1, cx, by + lift * .04);
  x.quadraticCurveTo(cx - e * .8, by + lift * .1, cx - e - w * .04, by - lift * .18);
  x.closePath();
  x.fillStyle = col; x.fill();
  x.strokeStyle = PAL.sumi; x.lineWidth = o.lw || 2.6; x.stroke();
  if (o.ribs !== false) {
    x.lineWidth = (o.lw || 2.6) * .45;
    for (let i = -4; i <= 4; i++) { const u = i / 5; x.beginPath(); x.moveTo(cx + u * w * .16, by - h); x.quadraticCurveTo(cx + u * w * .5, by - h * .5, cx + u * e * 1.06, by - lift * .16); x.stroke(); }
  }
}

// —— 构件：屋檐下一排屋 ——
export function houseRow(x, x0, y0, n, s, cols, o = {}) {
  for (let i = 0; i < n; i++) {
    const w = (110 + (i % 3) * 26) * s, h = (58 + (i * 37) % 30) * s;
    const cx = x0 + i * 132 * s;
    x.fillStyle = cols[(i + (o.pi || 0)) % cols.length];
    x.fillRect(cx - w * .34, y0 - h * .18, w * .68, h * .95);
    x.strokeStyle = PAL.sumi; x.lineWidth = 1.8 * s; x.strokeRect(cx - w * .34, y0 - h * .18, w * .68, h * .95);
    roof(x, cx, y0 - h * .18, w, h * .5, o.roofCol || PAL.greyD, { lw: 2.2 * s });
    if (o.win !== false) { x.fillStyle = rgba(PAL.sumi, .5); x.fillRect(cx - w * .18, y0 + h * .12, w * .14, h * .2); x.fillRect(cx + w * .05, y0 + h * .12, w * .14, h * .2); }
  }
}

// —— 构件：城墙 ——
export function cityWall(x, cx, by, w, h, col) {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  x.fillStyle = col; x.fillRect(x0, by - h, w, h);
  x.strokeStyle = PAL.sumi; x.lineWidth = 2.8; x.strokeRect(x0, by - h, w, h);
  // 垛口
  const n = Math.round(w / 74);
  for (let i = 0; i < n; i++) {
    const bx = x0 + i * (w / n);
    x.fillStyle = col; x.fillRect(bx + 6, by - h - 26, w / n - 24, 26);
    x.strokeRect(bx + 6, by - h - 26, w / n - 24, 26);
  }
  // 砖缝
  x.lineWidth = .9; x.strokeStyle = rgba(PAL.sumi, .45);
  for (let y = by - h + 34; y < by; y += 30) { x.beginPath(); x.moveTo(x0 + 4, y); x.lineTo(x1 - 4, y); x.stroke(); }
  for (let y = by - h + 34; y < by; y += 30) for (let bx = x0 + ((y / 30) % 2) * 40; bx < x1; bx += 80) { x.beginPath(); x.moveTo(bx, y); x.lineTo(bx, y + 30); x.stroke(); }
}

// —— 构件：山（两层剪影 + 雪线） ——
export function hill(x, cx, by, w, h, col, o = {}) {
  const p = [[cx - w / 2, by]];
  const L = 14, seed = o.seed || 1;
  for (let i = 0; i <= L; i++) {
    const s = i / L;
    const y = by - h * Math.pow(Math.sin(s * Math.PI), .85) * (.72 + .3 * hash(seed + i * 2.3));
    p.push([cx - w / 2 + w * s, y]);
  }
  p.push([cx + w / 2, by]);
  x.beginPath(); poly(x, p);
  if (col && col !== 'none') { x.fillStyle = col; x.fill(); }
  if (o.line !== false) { x.strokeStyle = PAL.sumi; x.lineWidth = o.lw || 2.4; x.stroke(); }
  return p;
}

// —— 构件：松 ——
export function pineTree(x, bx, by, s, col, o = {}) {
  const trunk = [[bx, by]];
  for (let i = 1; i <= 6; i++) { const u = i / 6; trunk.push([bx + Math.sin(u * 3.4 + (o.seed || 0)) * 20 * s + u * 26 * s, by - u * 230 * s]); }
  x.beginPath(); poly(x, trunk.map(([a, b]) => [a - (10 - 1.2 * (by - b) / (230 * s) * 8) * s, b]).concat(trunk.slice().reverse().map(([a, b]) => [a + (10 - 1.2 * (by - b) / (230 * s) * 8) * s, b])));
  const bk = o.bark || PAL.woodD;
  if (bk && bk !== 'none') { x.fillStyle = bk; x.fill(); }
  x.strokeStyle = PAL.sumi; x.lineWidth = 2.2 * s; x.stroke();
  const R = mulberry(o.seed || 7);
  for (let i = 2; i <= 6; i++) {
    const [a, b] = trunk[i], side = i % 2 ? 1 : -1, len = (48 + R() * 40) * s;
    x.strokeStyle = bk; x.lineWidth = 6 * s; x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo(a + side * len * .5, b + 6 * s, a + side * len, b - 14 * s); x.stroke();
    pad(x, a + side * len, b - 14 * s, (30 + R() * 14) * s, col, o.lw || 2.2);
  }
  pad(x, trunk[6][0], trunk[6][1] - 6 * s, 42 * s, col, o.lw || 2.2);
}
function pad(x, cx, cy, r, col, lw) {
  const hw = r * 1.3, hh = r * .4;
  x.beginPath();
  x.moveTo(cx - hw, cy);
  x.quadraticCurveTo(cx - hw * .5, cy - hh * 2.4, cx, cy - hh * 2.2);
  x.quadraticCurveTo(cx + hw * .5, cy - hh * 2.4, cx + hw, cy);
  x.quadraticCurveTo(cx + hw * .4, cy + hh * .5, cx, cy + hh * .45);
  x.quadraticCurveTo(cx - hw * .4, cy + hh * .5, cx - hw, cy); x.closePath();
  x.fillStyle = col; x.fill();
  x.strokeStyle = PAL.sumi; x.lineWidth = lw; x.stroke();
  x.lineWidth = lw * .45;
  for (let i = -5; i <= 5; i++) { x.beginPath(); x.moveTo(cx + i * hw * .09, cy + hh * .2); x.lineTo(cx + i * hw * .17, cy - hh * 1.5); x.stroke(); }
}

// —— 构件：刀（长而薄，白刃） ——
export function blade(x, bx, by, ang, len, wid, o = {}) {
  x.save(); x.translate(bx, by); x.rotate(ang);
  // 柄
  x.fillStyle = o.hilt || PAL.sumi; x.fillRect(-len * .3, -wid * .35, len * .3, wid * .7);
  x.strokeStyle = PAL.sumi; x.lineWidth = 1.6; x.strokeRect(-len * .3, -wid * .35, len * .3, wid * .7);
  // 刃
  x.beginPath();
  x.moveTo(0, -wid * .5); x.lineTo(len * .92, -wid * .18); x.quadraticCurveTo(len * 1.02, 0, len * .92, wid * .1); x.lineTo(0, wid * .5); x.closePath();
  x.fillStyle = o.fill || PAL.white; x.fill();
  x.strokeStyle = PAL.sumi; x.lineWidth = o.lw || 2.2; x.stroke();
  // 血槽
  x.strokeStyle = rgba(PAL.sumi, .5); x.lineWidth = 1.1;
  x.beginPath(); x.moveTo(len * .06, 0); x.lineTo(len * .86, 0); x.stroke();
  x.restore();
}

// —— 构件：水纹 ——
export function waterLines(x, t, rect, o = {}) {
  const [x0, y0, x1, y1] = rect, R = mulberry(o.seed || 4), k = Math.floor(t * 6) / 6;
  x.strokeStyle = o.col || rgba(PAL.sumi, .42); x.lineWidth = o.lw || 1.5;
  for (let i = 0; i < (o.n || 22); i++) {
    const y = y0 + (y1 - y0) * (i / (o.n || 22)), w = (x1 - x0) * (.12 + R() * .3);
    const px = x0 + ((R() * (x1 - x0) + k * (14 + R() * 20)) % (x1 - x0));
    x.beginPath(); x.moveTo(px, y); x.quadraticCurveTo(px + w * .5, y - 4, px + w, y); x.stroke();
  }
}

// —— 构件：裂纹 / 撕口 ——
export function crack(x, x0, y0, x1, y1, w, seed = 1, col = PAL.paper) {
  const R = mulberry(seed), n = 14, pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(x0, x1, u) + (R() - .5) * w * 1.6, lerp(y0, y1, u) + (R() - .5) * w * .8]); }
  x.beginPath(); x.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts) x.lineTo(p[0], p[1]);
  x.strokeStyle = col; x.lineWidth = w; x.lineJoin = 'miter'; x.stroke();
  x.strokeStyle = PAL.sumi; x.lineWidth = 1.4;
  x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (const p of pts) x.lineTo(p[0], p[1]); x.stroke();
}

// —— 墨点摊开 ——
export function inkBlot(x, cx, cy, r, col) {
  const R = mulberry(31), n = 26, p = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * (.8 + R() * .4); p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .7]); }
  x.beginPath(); smooth(x, p, true); x.fillStyle = col; x.fill();
}

// —— 文字：行楷（用于「宿敌」二字等） ——
export function brushText(x, s, cx, cy, size, col = PAL.sumi, o = {}) {
  x.save(); x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = `${o.weight || 400} ${size}px ${STX}`;
  if (o.gap) { const chars = [...s], tot = chars.length; chars.forEach((ch, i) => x.fillText(ch, cx + (i - (tot - 1) / 2) * size * o.gap, cy)); }
  else x.fillText(s, cx, cy);
  x.restore();
}
