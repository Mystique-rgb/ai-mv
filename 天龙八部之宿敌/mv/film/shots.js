// shots.js — 62 个镜头，全部是时间的纯函数。红纸窗花 / 12fps 偶 / 24fps 镜头。
import { PAL, canvas, piece, fill, cut, cutLine, cutTaper, trace, Pl, P, inset, ellipsePoly, paperShadow, noShadow, finishPaper, rnd, fillPaper } from '../engine/paper.js';
import { sawRow, crescent, crescentPts, swirl, cloudCut, plum, rosette, coin, dots, along, taper } from '../engine/motifs.js';
import { put, mul, T as Tm, R, S } from '../engine/rig.js';
import { W, H, cam, place, bg, wallPiece, shopRow, lantern, mountain, cloud, star, seal, flower, flowerHoles, drawScraps, scrapPiece, umbrella, lampGlow, projectFlower, PAL2 } from './world.js';
import { figure, FIG_H } from './chars.js';

// ---------- 小工具 ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const sg = (t, a, b) => clamp((t - a) / (b - a));
const ez = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const eo = x => 1 - Math.pow(1 - clamp(x), 3);
const ei = x => Math.pow(clamp(x), 3);
const back = x => { x = clamp(x); const s = 1.7; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const BEAT = 0.4351, BAR = 1.7404, PH = 0.02;
const bo = (t, k = 5.5) => Math.exp(-(((t - PH) / BEAT) % 1 + 1) % 1 * k);      // 拍点脉冲 1→0
const stf = t => Math.floor(t * 12 + 1e-6) / 12;                                   // 12fps 步进
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- 共用底板 ----------
let CTX = null;
export const setCtx = c => (CTX = c);
function sheet(kind = 'rice', C, tint = null) { bg(CTX, kind, C, tint); }
const MC = {};
const memo = (k, f) => (MC[k] || (MC[k] = f()));

function groundShadow(g, C, x, y, w, a = .35) {
  g.save(); g.setTransform(...C); g.globalCompositeOperation = 'multiply';
  const gr = g.createRadialGradient(x, y, 0, x, y, w);
  gr.addColorStop(0, `rgba(60,10,16,${a})`); gr.addColorStop(1, 'rgba(60,10,16,0)');
  g.fillStyle = gr; g.save(); g.translate(x, y); g.scale(1, .22); g.translate(-x, -y); g.fillRect(x - w, y - w, w * 2, w * 2); g.restore(); g.restore();
}

// 一张大红纸（可撕、可剪）
const SHEET = () => (window.__sheet || (window.__sheet = piece([0, 0, 2400, 1500], g => {
  const p = Pl([[0, 0], [2400, 0], [2400, 1500], [0, 1500]], true, .5, 3);
  fill(g, q => trace(q, p), PAL2.red);
  inset(g, p, 26, 12, PAL2.red);
}, { ss: .8, seed: 77 })));
function drawSheet(g, C, x, y, sx, sy) {
  g.save(); g.setTransform(...mul(C, [sx, 0, 0, sy, x, y]));
  paperShadow(g, 1, 1.1); g.drawImage(SHEET().c, 0, 0, 2400, 1500); noShadow(g); g.restore();
}

// 剪刀（两片刀身，铆钉在中间）
const BLADE = () => (window.__blade || (window.__blade = piece([-40, -90, 520, 90], g => {
  const b = Pl([[10, -16], [330, -46], [500, -10], [330, 22], [10, 18]], true, .4, 7);
  fill(g, q => trace(q, b), '#efe4c8'); inset(g, b, 7, 4, '#efe4c8');
  const h = Pl([[-20, -60], [40, -60], [40, 60], [-20, 60]], true, .4, 8);
  fill(g, q => trace(q, h), PAL2.deep); inset(g, h, 6, 4, PAL2.deep);
}, { ss: 2, seed: 91 })));
function scissors(g, C, x, y, ang, open, s = 1) {
  const rv = Tm(x, y);
  for (const k of [-1, 1]) {
    const M = mul(C, mul(rv, mul(R(ang + k * open), S(k * s, s))));
    put(g, BLADE(), M, { shadow: 1, shadowScale: s });
  }
  g.save(); g.setTransform(...mul(C, rv)); g.fillStyle = PAL2.deep; g.beginPath(); g.arc(0, 0, 9 * s, 0, 7); g.fill(); g.restore();
}

// 撕口 / 剪缝：一条毛边黑缝
function tearGap(g, C, pts, w, col = 'rgba(18,6,10,.92)') {
  if (pts.length < 2) return;
  g.save(); g.setTransform(...C); g.fillStyle = col;
  const L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    const k = Math.sin(Math.PI * Math.min(1, i / (pts.length - 1))) * .9 + .1;
    const ww = w * k / 2 * (1 + .5 * Math.sin(i * 2.7));
    L.push([pts[i][0] - dy / d * ww, pts[i][1] + dx / d * ww]); R.push([pts[i][0] + dy / d * ww, pts[i][1] - dx / d * ww]);
  }
  g.beginPath(); g.moveTo(...L[0]); for (const q of L) g.lineTo(...q); for (let i = R.length - 1; i >= 0; i--) g.lineTo(...R[i]); g.closePath(); g.fill();
  g.restore();
}

// 一列剪影人群
function crowd(g, C, t, n, y, s, dir = 1, kind = 'G', speed = 60) {
  for (let i = 0; i < n; i++) {
    const x = ((i * 210 + t * speed) % 2600) - 340;
    const bob = Math.abs(Math.sin((t * 3 + i) * Math.PI)) * 8;
    figure(g, C, kind, { x: dir > 0 ? x : 2280 - x, y: y - bob, s, flip: dir < 0, expr: 'closed', pose: { aL: -.4, aR: -.4 }, shadow: .8 });
  }
}

// ---------- 0 · 印章呼吸（0–3.4）----------
function sSeal(g, t, lt, dur) {
  const k = bo(t, 3.2), z = 1.05 + .5 * ez(sg(t, 0, 3.4)) + .012 * k;
  const C = cam(960, 540, z);
  sheet('ink', C);
  // 背后一圈暖光
  lampGlow(g, C, 960, 560, 700, .30 + .18 * k, 'rgba(230,90,60,');
  place(g, C, seal(), 960, 545, 2.35 + .06 * k, -.03 + .008 * Math.sin(t * 1.6), { shadow: 1.3 });
  // 呼吸时压出一层纸影
  drawScraps(g, C, t, 10, [200, 120, 1720, 980], 4, { scale: .7, fall: 12 });
  if (lt > .35) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(30,6,10,${.55 - .45 * ez(sg(lt, .35, 1.6))})`; g.fillRect(0, 0, W, H); g.restore(); }
}

// ---------- 1 · 第一刀（3.4–6.4）----------
function sFirstCut(g, t, lt, dur) {
  const C = cam(960, 500, .92 + .05 * sg(lt, 0, dur));
  sheet('rice', C);
  const path = [[-120, 430], [150, 490], [430, 430], [700, 490], [980, 410], [1260, 480], [1540, 400], [1830, 450], [2120, 360]];
  const prog = ez(sg(lt, .25, 2.2));
  drawSheet(g, C, -180, -300, .92, .92);
  // 剪开的部分往上飞走
  const fly = sg(lt, 2.1, 2.75);
  g.save(); g.setTransform(...C); g.beginPath(); g.rect(-300, -420, 2600, 1100); g.clip();
  if (fly > 0) { g.translate(0, -900 * ei(fly)); g.rotate(.05 * fly); }
  g.setTransform(...mul(C, [1, 0, 0, 1, 0, 0]));
  paperShadow(g, 1, 1.2); g.drawImage(SHEET().c, -240, -340, 2400, 1500); noShadow(g);
  g.restore();
  // 缝
  const pts = []; const n = Math.ceil(prog * 60);
  for (let i = 0; i <= n; i++) { const u = i / 60 * prog / Math.max(prog, .001); pts.push([lerp(-120, 2120, Math.min(1, u)), 450 + Math.sin(u * 9) * 26]); }
  tearGap(g, C, pts, 14 + 14 * prog);
  // 剪刀跟刀口
  if (lt < 2.2) {
    const tipU = Math.min(1, prog), tx = lerp(-120, 2120, tipU), ty = 680 + Math.sin(tipU * 9) * 26;
    const ang = Math.atan2(26 * 9 * Math.cos(tipU * 9), 2240) + Math.PI;
    scissors(g, C, tx, ty, ang + .1, .3 + .3 * Math.abs(Math.sin(lt * 22)), 1.7);
  }
  drawScraps(g, C, t, 18, [200, 300, 1900, 1000], 7, { scale: .8 });
  // 一刀落的红闪
  if (lt > 2.55 && lt < 2.85) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,120,80,${.5 * (1 - sg(lt, 2.55, 2.85))})`; g.fillRect(0, 0, W, H); g.restore(); }
}

// ---------- 2 · 城长出来（6.4–10.6）----------
function sCityRise(g, t, lt, dur) {
  const z = .58 + .03 * sg(lt, 0, dur);
  const C = cam(960, 480, z);
  sheet('rice', C);
  place(g, C, mountain(1), 960, 300, 1.5, 0, { shadow: .4, alpha: .55 });
  for (let i = 0; i < 3; i++) {
    const p = eo(sg(lt, .1 + i * .32, 1.5 + i * .32));
    place(g, C, shopRow(1 + i), 860 + i * 100, 420 + i * 70 + (1 - p) * 520, .5 - i * .05, 0, { shadow: .8, alpha: .95 });
  }
  const p = eo(sg(lt, 1.0, 2.6));
  place(g, C, wallPiece(), 960, 430 + (1 - p) * 560, .8, 0, { shadow: 1 });
  groundShadow(g, C, 960, 442, 900, .3);
  drawScraps(g, C, t, 22, [100, 100, 1820, 900], 9, { fall: 50 });
  if (lt > 2.9) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,170,110,${.22 * bo(t, 3)})`; g.fillRect(0, 0, W, H); g.restore(); }
}

// ---------- 3 · 穿过城门（10.6–14.6）----------
function sGate(g, t, lt, dur) {
  const z = 1.0 + 1.35 * ez(sg(lt, 0, dur));
  const C = cam(960, 560, z);
  sheet('rice', C);
  place(g, C, mountain(2), 960, 540, 1.4, 0, { shadow: .3, alpha: .5 });
  place(g, C, shopRow(4), 960, 640, 1.0, 0, { shadow: .9 });
  // 灯笼先挂上（关着的）
  for (let i = 0; i < 8; i++) place(g, C, lantern(), 380 + i * 170, 470, .9, 0, { shadow: .7, alpha: .9 });
  place(g, C, wallPiece(), 960, 640, 1.15, 0, { shadow: 1 });
  // 门洞里的暖光
  lampGlow(g, C, 960, 560, 230 + 20 * bo(t), .5, 'rgba(255,190,120,');
  drawScraps(g, C, t, 16, [200, 120, 1700, 900], 12, { fall: 70, scale: .8 });
  // 穿门的一瞬压暗
  const k = sg(lt, 2.2, 2.9) * (1 - sg(lt, 3.2, 3.9));
  if (k > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(20,8,12,${.75 * k})`; g.fillRect(0, 0, W, H); g.restore(); }
}

// ---------- 4 · 灯笼一盏盏亮（14.6–18.4）----------
function sLanterns(g, t, lt, dur) {
  const z = 1.05 + .1 * sg(lt, 0, dur), C = cam(960, 520, z);
  sheet('indigo', C, 'rgba(28,10,26,.35)');
  place(g, C, shopRow(4), 960, 640, 1.05, 0, { shadow: 1, alpha: .9 });
  const lit = Math.min(12, Math.floor(sg(lt, 0, dur - .3) * 13));
  for (let i = 0; i < 12; i++) {
    const x = 250 + i * 130, y = 452 - Math.abs(5.5 - i) * 8;
    const on = i < lit ? 1 : 0, b = on ? (1 + .35 * bo(t, 6)) : .25;
    if (on) lampGlow(g, C, x, y - 80, 190 * b, .42, 'rgba(255,180,110,');
    place(g, C, lantern(), x, y, (.82 + .12 * Math.sin((t + i) * 1.2)) * b, Math.sin(t * 2 + i) * .04, { shadow: .9 });
  }
  drawScraps(g, C, t, 14, [100, 80, 1820, 900], 15, { fall: 40, scale: .7 });
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  g.fillStyle = `rgba(255,120,60,${.03 * lit})`; g.fillRect(0, 0, W, H); g.restore();
}

// ---------- 5 · 缩成一枚窗花（18.4–22.3）----------
function sFlower(g, t, lt, dur) {
  const z = 1.0 + .18 * sg(lt, 0, dur), C = cam(960, 520, z);
  sheet('rice', C);
  const k = eo(sg(lt, 0, dur - .5));
  const s = lerp(1.0, .3, k), y = lerp(600, 530, k);
  place(g, C, wallPiece(), 960, y + 40 * k, s * 1.15, 0, { shadow: .8, alpha: 1 - .0 });
  place(g, C, shopRow(4), 960, y + 60, s, 0, { shadow: .6 });
  if (k > .6) {
    const a = sg(lt, dur - 1.1, dur - .3);
    place(g, C, flower(), 960, 520, .8 + .25 * eo(a), lt * .5, { shadow: 1.2, alpha: a });
    lampGlow(g, C, 960, 520, 340, .5 * a, 'rgba(255,190,120,');
  }
  // 末拍爆红
  const f = sg(lt, dur - .55, dur - .12);
  if (f > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,80,50,${.85 * f})`; g.fillRect(0, 0, W, H); g.restore(); }
}

// ---------- 6 · 双人（多种调度共用）----------
// o = {kind:'rice'|'indigo', action:'stand'|'gaze'|'thread'|'back'|'alone'|'sit'|'stab'|'split', dist, y, amb}
function sPair(g, t, lt, dur, o = {}) {
  const kind = o.kind || 'rice';
  const C = cam(960, o.cy || 560, o.z || 1.0);
  sheet(kind, C, kind === 'indigo' ? 'rgba(24,10,26,.3)' : null);
  if (o.city !== false) {
    place(g, C, mountain(1), 960, 520, 1.6, 0, { shadow: .3, alpha: .45 });
    place(g, C, shopRow(2), 960, 620, .95, 0, { shadow: .8, alpha: .9 });
  }
  if (kind === 'indigo') for (let i = 0; i < 7; i++) place(g, C, lantern(), 300 + i * 220, 430, .8, 0, { shadow: .8 });
  const gy = o.y || 820, s = o.s || .42, d = o.dist || 440;
  const ax = 960 - d, bx = 960 + d;
  const bob = Math.abs(Math.sin(stf(t) * 2 * Math.PI)) * 5;
  const act = o.action || 'stand';
  const poseA = { aL: -.45, aR: -.3, bob }, poseB = { aL: -.45, aR: -.3, bob: bob * .8 };
  if (act === 'gaze') { poseA.aR = 1.05; poseB.aL = 1.05; }
  if (act === 'thread') { poseA.aR = 1.35; poseB.aL = 1.35; }
  if (act === 'back') { poseA.aL = -.6; poseA.aR = -.6; poseB.aL = -.6; poseB.aR = -.6; }
  figure(g, C, 'A', { x: ax, y: gy, s, expr: o.exprA || 'determined', pose: poseA, swordL: act === 'stab', flip: false });
  if (act !== 'alone') figure(g, C, 'B', { x: bx, y: gy, s, expr: o.exprB || 'narrow', pose: poseB, flip: true });
  // 红线 / 剑光 / 撕口
  if (act === 'gaze' || act === 'thread') {
    const sag = act === 'thread' ? 60 : 130;
    const t0 = [ax + 120 * s, gy - 560 * s], t1 = [bx - 120 * s, gy - 560 * s];
    g.save(); g.setTransform(...C); g.strokeStyle = PAL2.red; g.lineWidth = 7;
    g.beginPath(); g.moveTo(...t0); g.quadraticCurveTo(960, (t0[1] + t1[1]) / 2 + sag, ...t1); g.stroke();
    g.restore();
  }
  if (act === 'stab') {
    const p = eo(sg(lt, .3, 1.1)), sx = ax + 150;
    g.save(); g.setTransform(...C); g.strokeStyle = '#fff1d6'; g.lineWidth = 10; g.globalAlpha = .9 * p;
    g.beginPath(); g.moveTo(sx, gy - 520 * s); g.lineTo(lerp(sx, bx - 60, p), lerp(gy - 520 * s, gy - 500 * s, p)); g.stroke(); g.restore();
    if (lt > 1.1) drawScraps(g, C, t, 26, [bx - 280, gy - 700, bx + 200, gy - 200], 21, { scale: .9 });
  }
  groundShadow(g, C, ax, gy + 6, 210 * s, .35); groundShadow(g, C, bx, gy + 6, 210 * s, .3);
  drawScraps(g, C, t, 10, [120, 120, 1800, 900], 31, { scale: .6, fall: 30 });
  if (o.dim) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(16,6,10,${o.dim})`; g.fillRect(0, 0, W, H); g.restore(); }
}

// ---------- 7 · 拔剑 / 剑光（37.1–42.1）----------
function sSwords(g, t, lt, dur) {
  const C = cam(960, 560, 1.06);
  sheet('rice', C);
  place(g, C, mountain(3), 960, 540, 1.7, 0, { shadow: .25, alpha: .4 });
  place(g, C, shopRow(5), 960, 640, 1.0, 0, { shadow: .8 });
  const p = eo(sg(lt, .15, 1.0));
  const poseA = { aL: -.2, aR: lerp(.4, 1.5, p), lean: -.05 * p };
  figure(g, C, 'A', { x: 760, y: 780, s: .58, expr: 'angry', pose: poseA, swordL: false });
  figure(g, C, 'B', { x: 1180, y: 780, s: .58, expr: 'narrow', pose: { aL: lerp(.3, 1.3, p), aR: .4 }, flip: true, swordR: true });
  // 剑光：一道白刃扫过，把画面切开
  const sw = sg(lt, .9, 1.7);
  if (sw > 0 && sw < 1) {
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
    const y = lerp(-200, 1300, sw);
    const gr = g.createLinearGradient(0, y - 90, 0, y + 90);
    gr.addColorStop(0, 'rgba(255,240,210,0)'); gr.addColorStop(.5, 'rgba(255,246,224,.95)'); gr.addColorStop(1, 'rgba(255,240,210,0)');
    g.fillStyle = gr; g.fillRect(0, y - 90, W, 180); g.restore();
  }
  if (lt > 1.8) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = 'rgba(12,4,8,.82)'; g.fillRect(0, 0, W, 76); g.fillRect(0, H - 76, W, 76); g.restore(); }
  drawScraps(g, C, t, 20, [100, 100, 1820, 940], 44, { scale: .9 });
}

// ---------- 8 · 花开（42.1–46.1）----------
function sBlossom(g, t, lt, dur) {
  const C = cam(960, 540, 1.0 + .12 * sg(lt, 0, dur));
  sheet('rice', C);
  const n = 7;
  for (let i = 0; i < n; i++) {
    const on = Math.max(0, Math.min(1, (lt - i * .28) * 3.2));
    if (on <= 0) continue;
    const x = 260 + (i % 4) * 470 + (i > 3 ? 200 : 0), y = 300 + Math.floor(i / 3) * 330;
    const sc = .38 + .1 * on + .03 * bo(t, 5);
    place(g, C, flower(PAL2.red), x, y, sc * on, i * .3 + t * .1, { shadow: 1 });
    if (on > .6) lampGlow(g, C, x, y, 190, .18 * on, 'rgba(255,170,120,');
  }
  place(g, C, flower(PAL2.deep), 960, 560, .55, -t * .06, { shadow: 1.2, alpha: .9 });
  drawScraps(g, C, t, 24, [100, 80, 1820, 940], 55, { scale: .7 });
}

// ---------- 9 · 岁月 / 星盘 / 命盘 ----------
function sStars(g, t, lt, dur) {
  const C = cam(960, 540, 1.02), T2 = 84.5 - 0.0;
  sheet('indigo', C, 'rgba(26,12,30,.3)');
  // 星盘：大团花当罗盘
  place(g, C, flower(PAL2.deep), 960, 540, 1.0, t * .28, { shadow: .8, alpha: .55 });
  for (let i = 0; i < 22; i++) {
    const a = i / 22 * 6.283 + t * (.14 + (i % 3) * .05), r = 180 + (i % 5) * 92;
    place(g, C, star(1 + (i % 3)), 960 + Math.cos(a) * r, 540 + Math.sin(a) * r * .72, .3 + .2 * Math.abs(Math.sin(t + i)), a, { shadow: .9 });
  }
  place(g, C, flower(), 960, 540, .62, -t * .4, { shadow: 1.2 });
  // 指针（命盘定格）
  const ang = -1.2 + .35 * Math.sin(t * .8);
  g.save(); g.setTransform(...C); g.strokeStyle = PAL2.cream; g.lineWidth = 12; g.beginPath();
  g.moveTo(960, 540); g.lineTo(960 + Math.cos(ang) * 340, 540 + Math.sin(ang) * 340); g.stroke(); g.restore();
  drawScraps(g, C, t, 12, [100, 60, 1820, 980], 66, { scale: .6, fall: 20 });
}

// ---------- 10 · 一笔墨（87.5–89.5）----------
function sInk(g, t, lt, dur) {
  const C = cam(960, 540, 1.0);
  sheet('rice', C);
  drawSheet(g, C, -300, -400, 1.05, 1.05);
  const p = eo(sg(lt, .1, dur - .2));
  const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60 * p; pts.push([lerp(-200, 2100, u), 520 + Math.sin(u * 7) * 120 * u]); }
  tearGap(g, C, pts, 46 * Math.min(1, p * 3), 'rgba(22,8,12,.9)');
  // 笔
  const tip = pts[pts.length - 1];
  if (tip) {
    g.save(); g.setTransform(...C); g.translate(tip[0], tip[1]); g.rotate(-.5);
    g.fillStyle = PAL2.ink; g.beginPath(); g.moveTo(0, 0); g.lineTo(120, -62); g.lineTo(420, -110); g.lineTo(430, 40); g.lineTo(130, 54); g.closePath(); g.fill();
    g.restore();
  }
  drawScraps(g, C, t, 14, [100, 100, 1820, 900], 77, { scale: .6 });
}

// ---------- 11 · 宿敌压近（89.5–92）----------
function sEnemy(g, t, lt, dur) {
  const k = ez(sg(lt, 0, dur)), C = cam(960, 520, 1.0 + .35 * k);
  sheet('indigo', C, `rgba(60,6,14,${.20 + .25 * k})`);
  place(g, C, mountain(4), 960, 560, 1.8, 0, { shadow: .3, alpha: .35 });
  const s = .38 + .5 * k;
  figure(g, C, 'B', { x: 960, y: 900, s, expr: k > .5 ? 'angry' : 'narrow', pose: { aL: lerp(.4, 1.4, k), aR: lerp(.4, 1.4, k), lean: -.04 * k }, swordL: true, swordR: true, shadow: 1.2 });
  groundShadow(g, C, 960, 906, 340 * s, .4);
  drawScraps(g, C, t, 18, [100, 80, 1820, 900], 88, { scale: .8 });
}

// ---------- 12 · 千军 / 灰纸人群 -----------
function sArmy(g, t, lt, dur) {
  const C = cam(960, 540, 1.04);
  sheet('rice', C, 'rgba(200,120,120,.12)');
  place(g, C, mountain(5), 960, 540, 1.6, 0, { shadow: .25, alpha: .35 });
  crowd(g, C, t, 9, 700, .3, 1, 'G', 90);
  crowd(g, C, t + 2, 7, 760, .38, 1, 'G', 120);
  // 主角背影：一人挡在前面
  figure(g, C, 'A', { x: 620, y: 820, s: .6, expr: 'determined', pose: { aL: -.2, aR: -.2 }, shadow: 1.3 });
  groundShadow(g, C, 620, 826, 220, .4);
  drawScraps(g, C, t, 22, [100, 80, 1820, 900], 99, { scale: .8 });
}

// ---------- 13 · 剪成两半（61.9–64.9）----------
function sSplit(g, t, lt, dur) {
  const C = cam(960, 540, 1.02 + .06 * sg(lt, 0, dur));
  sheet('rice', C);
  const p = eo(sg(lt, .1, 1.2));
  // 一刀从上到下：左右两半分开站起
  drawSheet(g, C, -260, -360, 1, 1);
  const split = 120 * p;
  g.save(); g.setTransform(...C); g.fillStyle = 'rgba(16,6,10,.9)'; g.fillRect(940 - 4, -40, 8 + 40 * p, 1140); g.restore();
  // 两半纸各站起一个人（用纸片抬起表示）
  const lift = eo(sg(lt, 1.1, 2.2));
  figure(g, C, 'A', { x: 760 - split, y: 820 + (1 - lift) * 300, s: .5, expr: 'determined', pose: { aL: .4, aR: -.2 }, shadow: 1 });
  figure(g, C, 'B', { x: 1160 + split, y: 820 + (1 - lift) * 300, s: .5, expr: 'narrow', flip: true, pose: { aL: .4, aR: -.2 }, shadow: 1 });
  drawScraps(g, C, t, 26, [300, 200, 1700, 900], 101, { scale: .9 });
}

// ---------- 14 · 灯笼爆亮 / 灯海 -----------
function sLanternBurst(g, t, lt, dur, o = {}) {
  const C = cam(960, 520, 1.0 + .1 * sg(lt, 0, dur));
  sheet('indigo', C, `rgba(70,8,16,${.18 + .2 * (o.heat || 0)})`);
  place(g, C, shopRow(6), 960, 700, 1.05, 0, { shadow: 1, alpha: .85 });
  const n = o.n || 16;
  for (let i = 0; i < n; i++) {
    const x = 180 + (i * 97) % 1560, y = 380 + ((i * 137) % 300);
    const b = .8 + .4 * bo(t, 5) + .3 * Math.sin(t * 3 + i);
    lampGlow(g, C, x, y, 200 * b, .3, 'rgba(255,170,100,');
    place(g, C, lantern(), x, y, (.7 + .18 * (i % 3)) * b, Math.sin(t + i) * .08, { shadow: .9 });
  }
  drawScraps(g, C, t, 26, [100, 60, 1820, 940], 111, { scale: .9 });
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  g.fillStyle = `rgba(255,110,60,${.06 * n * (o.heat || 1)})`; g.fillRect(0, 0, W, H); g.restore();
}

// ---------- 15 · 长安全景（夜）----------
function sWide(g, t, lt, dur, o = {}) {
  const z = (o.z || 1.0) - .04 * sg(lt, 0, dur), C = cam(o.cx || 960, 520, z);
  sheet('indigo', C, `rgba(36,10,22,${.20 + .28 * (o.heat || 0)})`);
  place(g, C, mountain(1), 960, 560, 1.7, 0, { shadow: .3, alpha: .35 });
  place(g, C, mountain(2), 960, 600, 1.3, 0, { shadow: .3, alpha: .3 });
  place(g, C, shopRow(7), 960, 700, 1.0, 0, { shadow: 1, alpha: .9 });
  for (let i = 0; i < 18; i++) {
    const x = 120 + (i * 211) % 1700, y = 400 + ((i * 73) % 220), b = 1 + .25 * Math.sin(t * 2 + i);
    lampGlow(g, C, x, y, 170 * b, .26, 'rgba(255,176,104,');
    place(g, C, lantern(), x, y, .62 * b, Math.sin(t * 1.5 + i) * .05, { shadow: .8 });
  }
  drawScraps(g, C, t, 16, [100, 60, 1820, 940], 121, { scale: .7, fall: 30 });
}

// ---------- 16 · 走马灯（间奏 101.8–112）----------
function sCarousel(g, t, lt, dur) {
  const C = cam(960, 540, 1.04);
  sheet('ink', C);
  lampGlow(g, C, 960, 520, 620, .45, 'rgba(255,170,100,');
  // 旋转灯筒：四个面，每面一首剪影
  const rot = t * .9;
  for (let i = 0; i < 4; i++) {
    const a = rot + i * Math.PI / 2, k = Math.cos(a), vis = Math.max(0, k);
    if (vis <= .02) continue;
    const x = 960 + Math.sin(a) * 300, sc = .55 + .3 * vis;
    place(g, C, lantern(), x, 300 + 60 * (1 - vis), 1.5 * sc, Math.sin(a) * .25, { shadow: .6, alpha: .35 + .6 * vis });
  }
  // 筒身
  place(g, C, flower(PAL2.deep), 960, 560, 1.15, -rot * .5, { shadow: 1.1, alpha: .85 });
  // 中央剪影：两人相对（12fps 走马）
  const step = Math.floor(t * 12) % 4;
  figure(g, C, 'A', { x: 830, y: 780, s: .42, expr: step % 2 ? 'determined' : 'angry', pose: { aL: .8 + .2 * (step % 2), aR: -.3 }, shadow: 1 });
  figure(g, C, 'B', { x: 1090, y: 780, s: .42, expr: 'narrow', flip: true, pose: { aL: .9, aR: -.2 + .3 * (step % 2) }, shadow: 1 });
  drawScraps(g, C, t, 22, [200, 120, 1720, 900], 131, { scale: .8 });
}

// ---------- 17 · 万花筒（112–123.5）----------
function sKaleido(g, t, lt, dur) {
  const C = cam(960, 540, 1.0);
  sheet('ink', C);
  const k = 1 + .1 * Math.sin(t * 3);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * 6.283 + t * .5;
    place(g, C, flower(i % 2 ? PAL2.red : PAL2.deep), 960 + Math.cos(a) * 300 * k, 540 + Math.sin(a) * 300 * k, .55 * k, a, { shadow: .9, alpha: .9 });
  }
  place(g, C, flower(), 960, 540, .78 * k, -t * .7, { shadow: 1.3 });
  for (let i = 0; i < 4; i++) {
    const a = -t * .9 + i * Math.PI / 2;
    figure(g, C, i % 2 ? 'B' : 'A', { x: 960 + Math.cos(a) * 420, y: 700 + Math.sin(a) * 160, s: .3, flip: i % 2 === 1, expr: i % 2 ? 'narrow' : 'determined', pose: { aL: .9, aR: .2 }, shadow: .7, alpha: .95 });
  }
  drawScraps(g, C, t, 30, [100, 60, 1820, 1000], 141, { scale: .8 });
}

// ---------- 18 · 雪 / 孤岛（123.5–143.2）----------
function sSnow(g, t, lt, dur, o = {}) {
  const C = cam(960, 520, o.z || 1.02);
  sheet('indigo', C, 'rgba(30,26,44,.35)');
  place(g, C, mountain(3), 960, 560, 1.9, 0, { shadow: .3, alpha: .4 });
  // 孤岛：一层纸
  const isl = memo('island', () => { const q0 = Pl([[-420, 0], [-300, -120], [-120, -170], [140, -160], [340, -90], [420, 0]], true, .8, 9);
    return piece([-440, -200, 440, 40], g2 => { fill(g2, q => trace(q, q0), PAL2.far); inset(g2, q0, 16, 8, PAL2.far); }, { ss: 1.6, seed: 5 }); });
  place(g, C, isl, 960, o.y || 760, 1.0, 0, { shadow: 1 });
  // 雪：碎纸
  drawScraps(g, C, t, o.n || 60, [60, -60, 1860, 900], 151, { scale: .9, fall: o.fall || 120, sway: 60 });
  if (o.star) {
    const p = eo(sg(lt, .2, 1.6));
    place(g, C, star(2), lerp(760, 960, p), lerp(300, 330, p), .5 + .3 * p, t, { shadow: 1.2 });
    lampGlow(g, C, 960, 320, 260 * p, .45 * p, 'rgba(255,220,150,');
  }
  if (o.who) {
    const bob = Math.abs(Math.sin(stf(t) * 6.283)) * 4;
    figure(g, C, 'A', { x: 800, y: o.y || 760, s: .46, expr: o.who === 2 ? 'happy' : 'determined', pose: { aL: o.who === 2 ? 1.3 : .3, aR: o.who === 2 ? 1.3 : -.2, bob }, shadow: 1 });
    if (o.who === 2) figure(g, C, 'B', { x: 1120, y: o.y || 760, s: .46, expr: 'happy', flip: true, pose: { aL: 1.25, aR: 1.25, bob }, shadow: 1 });
  }
}

// ---------- 19 · 深谷 / 揭层（143.2–153.2）----------
function sValley(g, t, lt, dur) {
  const z = 1.0 + .12 * sg(lt, 0, dur), C = cam(960, 520, z);
  sheet('indigo', C, 'rgba(26,12,26,.3)');
  // 层层深谷：一层比一层暗
  for (let i = 0; i < 5; i++) {
    const p = eo(sg(lt, i * .18, 1.2 + i * .18));
    const col = ['#7e1424', '#6a1120', '#57101c', '#430d18', '#2f0a13'][i];
    const lay = memo('val' + i, () => { const poly = Pl([[-1000, 300], [-620, 120 + i * 30], [-260, 260], [120, 80 + i * 26], [520, 250], [1000, 120], [1000, 700], [-1000, 700]], true, 1.2, 20 + i);
      return piece([-1020, 0, 1020, 720], g2 => { fill(g2, q => trace(q, poly), col); inset(g2, poly, 18, 9, col); }, { ss: .9, seed: 61 + i }); });
    place(g, C, lay, 960, 380 + i * 90 - (1 - p) * 200, 1, 0, { shadow: .8 });
  }
  // 棺：一枚长方纸
  const coffin = memo('coffin', () => { const co = Pl([[-220, 0], [220, 0], [180, -70], [-180, -70]], true, .6, 31);
    return piece([-240, -90, 240, 20], g2 => { fill(g2, q => trace(q, co), PAL2.wax); inset(g2, co, 12, 6, PAL2.wax); for (let i = 0; i < 5; i++) taper(g2, [[-150 + i * 70, -56], [-150 + i * 70, -10]], 6); }, { ss: 1.6, seed: 9 }); });
  place(g, C, coffin, 960, 740, 1, 0, { shadow: 1 });
  drawScraps(g, C, t, 20, [100, 80, 1820, 900], 161, { scale: .7, fall: 50 });
}

// ---------- 20 · 江湖棋盘（153.2–158.1）----------
function sBoard(g, t, lt, dur) {
  const C = cam(960, 540, 1.0 + .05 * sg(lt, 0, dur));
  sheet('rice', C);
  // 棋盘：一张纸，刻格
  const brd = memo('board', () => { const board = Pl([[-620, -420], [620, -420], [620, 420], [-620, 420]], true, .6, 5);
    return piece([-660, -460, 660, 460], g2 => {
    fill(g2, q => trace(q, board), PAL2.deep);
    for (let i = 1; i < 9; i++) { cutLine(g2, 7, q => { q.moveTo(-620 + i * 155, -420); q.lineTo(-620 + i * 155, 420); }); }
    for (let i = 1; i < 9; i++) { cutLine(g2, 7, q => { q.moveTo(-620, -420 + i * 105); q.lineTo(620, -420 + i * 105); }); }
    for (let i = 0; i < 7; i++) rosette(g2, -540 + (i * 173) % 1080, -380 + (i * 97) % 760, 26, 6, i, .3);
  }, { ss: 1.1, seed: 13 }); });
  place(g, C, brd, 960, 540, 1.02, 0, { shadow: 1.2 });
  // 血滴（红纸点）
  const p = sg(lt, .4, dur);
  for (let i = 0; i < 5; i++) {
    const y = -400 + i * 190, x = 960 + Math.sin(i * 2.3) * 420;
    if (p * 5 < i) continue;
    g.save(); g.setTransform(...C); g.fillStyle = PAL2.red; g.beginPath(); g.ellipse(x, 540 + y, 16, 16 + 26 * (p * 5 - i), 0, 0, 7); g.fill(); g.restore();
  }
  drawScraps(g, C, t, 14, [100, 100, 1820, 900], 171, { scale: .6 });
}

// ---------- 21 · 撕开（163.5–171.5）----------
function sTear(g, t, lt, dur) {
  const C = cam(960, 540, 1.03 + .05 * sg(lt, 0, dur));
  sheet('rice', C);
  drawSheet(g, C, -260, -360, 1, 1);
  const p = eo(sg(lt, .1, 1.4));
  // 毛边撕口：从中间裂开，两侧上下错位
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40, y = -60 + u * 1200;
    pts.push([960 + Math.sin(u * 9 + t) * 30 + (rnd(i, 5) - .5) * 26, y]);
  }
  const cutN = Math.ceil(p * pts.length);
  tearGap(g, C, pts.slice(0, cutN), 54 + 40 * Math.sin(t * 2), 'rgba(14,4,8,.95)');
  // 两半错开
  const off = 40 * p;
  g.save(); g.setTransform(...C); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(40,6,12,.18)';
  g.fillRect(0, -60, 960 - off, 1200); g.restore();
  drawScraps(g, C, t, 34, [200, 100, 1720, 900], 181, { scale: 1.1, fall: 160 });
}

// ---------- 22 · 合成窗花（205.1–211.5）----------
function sMerge(g, t, lt, dur) {
  const C = cam(960, 540, 1.06 - .06 * sg(lt, 0, dur));
  sheet('indigo', C, 'rgba(40,10,20,.28)');
  lampGlow(g, C, 960, 540, 680, .5, 'rgba(255,180,110,');
  // 碎纸向中心聚拢
  const p = ez(sg(lt, 0, 1.8));
  for (let i = 0; i < 40; i++) {
    const a = i / 40 * 6.283 + i * .3, r = lerp(900, 120, p) * (1 + .3 * hash(i));
    const x = 960 + Math.cos(a) * r, y = 540 + Math.sin(a) * r * .62;
    place(g, C, scrapPiece(i % 7), x, y, .9 * (1 - .4 * p), a + t, { shadow: .8 });
  }
  const a2 = sg(lt, 1.6, 2.4);
  place(g, C, flower(), 960, 540, .78 + .12 * a2, t * .2, { shadow: 1.3, alpha: a2 });
  // 窗花里两个牵手小人
  if (a2 > .6) {
    figure(g, C, 'A', { x: 905 + 30 * a2, y: 600, s: .16, expr: 'happy', pose: { aL: 1.4, aR: 1.4 }, shadow: .5 });
    figure(g, C, 'B', { x: 1015 - 30 * a2, y: 600, s: .16, expr: 'happy', flip: true, pose: { aL: 1.4, aR: 1.4 }, shadow: .5 });
  }
}

// ---------- 23 · 碎片自拼（243.9–250）----------
function sAssemble(g, t, lt, dur) {
  const C = cam(960, 540, 1.12 - .1 * sg(lt, 0, dur));
  sheet('indigo', C, 'rgba(40,12,22,.22)');
  lampGlow(g, C, 960, 540, 700, .4, 'rgba(255,180,110,');
  const p = ez(sg(lt, 0, dur - .4));
  for (let i = 0; i < 46; i++) {
    const a = i / 46 * 6.283, r = lerp(760, 150, p);
    place(g, C, scrapPiece(i % 7), 960 + Math.cos(a) * r, 540 + Math.sin(a) * r * .6, .8, a * 2 + t, { shadow: .8 });
  }
  place(g, C, flower(), 960, 540, .5 + .12 * p, t * .15, { shadow: 1.3, alpha: sg(lt, dur - 1.4, dur - .5) });
}

// ---------- 24 · 拉远：墙上那枚旧窗花（250–256）----------
function sPullBack(g, t, lt, dur) {
  const k = ez(sg(lt, 0, dur)), z = lerp(1.25, .42, k), C = cam(960, 540, z);
  sheet('indigo', C, 'rgba(20,10,18,.25)');
  // 墙（纸）
  const wl = memo('wallpaper', () => { const wallP = Pl([[-1900, -1200], [1900, -1200], [1900, 1200], [-1900, 1200]], true, .8, 3);
    return piece([-1900, -1200, 1900, 1200], g2 => {
    fill(g2, q => trace(q, wallP), '#2a1a24');
    for (let x = -1800; x < 1900; x += 220) cutLine(g2, 6, q => { q.moveTo(x, -1200); q.lineTo(x, 1200); });
    for (let y = -1100; y < 1200; y += 260) cutLine(g2, 6, q => { q.moveTo(-1900, y); q.lineTo(1900, y); });
  }, { ss: .7, seed: 21 }); });
  place(g, C, wl, 960, 540, 1, 0, { shadow: 0 });
  // 窗花贴在墙上
  place(g, C, flower(), 960, 540, .95, 0, { shadow: 1.4 });
  lampGlow(g, C, 960, 540, 500, .22, 'rgba(255,170,110,');
  if (k > .75) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(10,4,8,${(k - .75) / .25 * .35})`; g.fillRect(0, 0, W, H); g.restore(); }
}

// ---------- 25 · 盖印收尾（256–263.34）----------
function sEnd(g, t, lt, dur) {
  const C = cam(960, 540, 1.9 - .9 * sg(lt, 0, 1.4));
  sheet('ink', C);
  place(g, C, flower(), 960, 540, .55, 0, { shadow: 1.4, alpha: 1 - .3 * sg(lt, 1.2, 2) });
  // 印章从天而降，压上
  const p = sg(lt, .5, 1.9), y = lerp(-900, 540, ei(p)), sc = 1.15;
  place(g, C, seal(), 960, y, sc * (1 + .04 * (1 - p)), .02, { shadow: 1.6 });
  if (p >= 1) {
    const k = sg(lt, 1.9, 2.6);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
    g.fillStyle = `rgba(255,90,60,${.35 * (1 - k)})`; g.fillRect(0, 0, W, H); g.restore();
  }
  const fade = sg(lt, 5.2, 7.3);
  if (fade > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(8,3,6,${fade})`; g.fillRect(0, 0, W, H); g.restore(); }
}

// ---------- 26 · 门童（72.3–76.2）----------
function sGateBoy(g, t, lt, dur) {
  const C = cam(960, 560, 1.16 - .06 * sg(lt, 0, dur));
  sheet('indigo', C, 'rgba(30,12,22,.28)');
  place(g, C, shopRow(8), 960, 700, 1.05, 0, { shadow: 1, alpha: .55 });
  place(g, C, wallPiece(), 960, 720, 1.2, 0, { shadow: 1 });
  lampGlow(g, C, 960, 560, 300, .5, 'rgba(255,190,120,');
  const shake = Math.sin(stf(t) * 9) * .04;
  figure(g, C, 'G', { x: 960, y: 700, s: .3, expr: 'sad', pose: { aL: -.2, aR: -.2, lean: shake }, shadow: 1 });
  drawScraps(g, C, t, 12, [100, 100, 1820, 900], 191, { scale: .6, fall: 30 });
}

// ---------- 27 · 纸片飞越（31.9–37.1）----------
function sFlyOver(g, t, lt, dur) {
  const pan = lt * 90, C = cam(960 + pan * .35, 520, 1.02);
  sheet('rice', C);
  place(g, C, mountain(2), 960 + pan * .2, 560, 1.7, 0, { shadow: .3, alpha: .4 });
  place(g, C, cloud(1), 500 + pan * .8, 260, .9, 0, { shadow: .4, alpha: .8 });
  place(g, C, cloud(2), 1400 + pan * .8, 340, 1.2, 0, { shadow: .4, alpha: .8 });
  // 成群的纸片横飞（把镜头带过去）
  for (let i = 0; i < 26; i++) {
    const x = ((i * 137 + t * 320) % 2400) - 240, y = 260 + (i * 71) % 560;
    place(g, C, scrapPiece(i % 7), x, y - Math.sin(t * 2 + i) * 30, .7 + (i % 3) * .3, t * (1 + i % 3) + i, { shadow: .8 });
  }
  // 一前一后两个身影被带过画面
  figure(g, C, 'A', { x: 520 + pan * .3, y: 800, s: .42, expr: 'determined', pose: { aL: .7, aR: -.4, lean: .06 }, shadow: 1 });
  figure(g, C, 'B', { x: 1320 + pan * .3, y: 820, s: .38, flip: true, expr: 'narrow', pose: { aL: .5, aR: -.3, lean: -.05 }, shadow: 1 });
}

// ---------- 28 · 岁月（46.74–51.94）----------
function sYears(g, t, lt, dur) {
  const C = cam(960, 540, 1.0 + .06 * sg(lt, 0, dur));
  sheet('rice', C);
  place(g, C, flower(PAL2.deep), 960, 520, 1.5, t * .1, { shadow: .7, alpha: .28 });
  place(g, C, flower(PAL2.red), 960, 520, 1.0, -t * .16, { shadow: .9, alpha: .6 });
  place(g, C, flower(), 960, 540, .5, t * .24, { shadow: 1.2, alpha: .95 });
  // 岁月：小人沿外圈走过，从小到大
  const k = sg(lt, .2, dur - .3), pos = lerp(-460, 460, k), s = lerp(.14, .3, k);
  figure(g, C, 'A', { x: 960 + pos * .9, y: 860 - Math.abs(pos) * .12, s, expr: 'determined', pose: { aL: .5 + .4 * Math.sin(t * 6), aR: -.3, bob: Math.abs(Math.sin(stf(t) * 12)) * 6 }, shadow: 1 });
  figure(g, C, 'B', { x: 960 + pos * .9 + 120 * (1 - k), y: 880 - Math.abs(pos) * .1, s: s * .96, flip: k > .5, expr: 'narrow', pose: { aL: .4, aR: -.3, bob: Math.abs(Math.sin(stf(t) * 12 + 2)) * 5 }, shadow: .9 });
  drawScraps(g, C, t, 20, [100, 80, 1820, 940], 201, { scale: .7 });
}

// ---------- 镜头表 ----------
export const SHOTS = [
  [0.00, 3.40, sSeal],
  [3.40, 6.40, sFirstCut],
  [6.40, 10.60, sCityRise],
  [10.60, 14.60, sGate],
  [14.60, 18.40, sLanterns],
  [18.40, 22.30, sFlower],
  // A1
  [22.30, 27.80, (g, t, lt, d) => sPair(g, t, lt, d, { action: 'gaze', y: 790, s: .56 })],
  [27.80, 31.90, (g, t, lt, d) => sPair(g, t, lt, d, { action: 'gaze', dist: 330, y: 800, s: .5, kind: 'indigo', dim: .18 })],
  [31.90, 37.10, sFlyOver],
  [37.10, 42.10, sSwords],
  [42.10, 46.14, sBlossom],
  [46.74, 51.94, sYears],
  [51.94, 57.05, (g, t, lt, d) => sPair(g, t, lt, d, { action: 'thread', dist: 260, y: 800, s: .56 })],
  [57.05, 61.88, sArmy],
  // B1
  [61.88, 64.88, sSplit],
  [64.88, 67.42, (g, t, lt, d) => sPair(g, t, lt, d, { action: 'stand', dist: 240, y: 790, s: .58, z: 1.1 })],
  [67.42, 69.80, (g, t, lt, d) => sLanternBurst(g, t, lt, d, { n: 18, heat: 1 })],
  [69.80, 72.30, (g, t, lt, d) => sPair(g, t, lt, d, { action: 'stab', dist: 300, y: 800, s: .55, kind: 'indigo', dim: .12 })],
  [72.30, 76.14, sGateBoy],
  [76.14, 82.10, (g, t, lt, d) => sWide(g, t, lt, d, { heat: 1 })],
  [82.10, 84.46, sStars],
  [84.46, 87.46, sStars],
  [87.46, 89.52, sInk],
  [89.52, 92.00, sEnemy],
  [92.00, 96.05, (g, t, lt, d) => sPair(g, t, lt, d, { action: 'back', dist: 150, y: 800, s: .58, kind: 'indigo', dim: .22 })],
  [96.05, 101.85, (g, t, lt, d) => sPair(g, t, lt, d, { action: 'alone', y: 810, s: .6, kind: 'indigo', dim: .3 })],
  // 间奏
  [101.85, 112.00, sCarousel],
  [112.00, 123.50, sKaleido],
  // A3
  [123.50, 128.68, (g, t, lt, d) => sSnow(g, t, lt, d, { n: 70, who: 1 })],
  [128.68, 133.38, (g, t, lt, d) => sSnow(g, t, lt, d, { n: 120, who: 0, fall: 190 })],
  [133.38, 138.18, (g, t, lt, d) => sSnow(g, t, lt, d, { n: 50, star: 1, who: 1 })],
  [138.18, 143.20, (g, t, lt, d) => sSnow(g, t, lt, d, { n: 40, who: 2, star: 1 })],
  [143.20, 148.50, sValley],
  [148.50, 153.20, sValley],
  [153.20, 158.10, sBoard],
  [158.10, 163.50, sArmy],
  // B2
  [163.50, 171.20, sTear],
  [171.20, 173.74, (g, t, lt, d) => sLanternBurst(g, t, lt, d, { n: 24, heat: 1.4 })],
  [173.74, 177.56, sGateBoy],
  [177.56, 183.48, (g, t, lt, d) => sWide(g, t, lt, d, { heat: 1.3 })],
  [183.48, 186.10, sStars],
  [186.10, 188.64, sStars],
  [188.64, 191.06, sInk],
  [191.06, 193.54, sEnemy],
  [193.54, 197.48, (g, t, lt, d) => sPair(g, t, lt, d, { action: 'back', dist: 150, y: 800, s: .58, kind: 'indigo', dim: .22 })],
  [197.48, 203.30, (g, t, lt, d) => sPair(g, t, lt, d, { action: 'alone', y: 810, s: .6, kind: 'indigo', dim: .3 })],
  // B3
  [205.10, 208.34, sMerge],
  [208.34, 210.90, (g, t, lt, d) => sLanternBurst(g, t, lt, d, { n: 26, heat: 1.5 })],
  [210.90, 213.38, sMerge],
  [213.38, 215.84, (g, t, lt, d) => sPair(g, t, lt, d, { action: 'gaze', dist: 230, y: 790, s: .58, kind: 'indigo' })],
  [215.84, 219.84, sGateBoy],
  [219.84, 224.56, (g, t, lt, d) => sWide(g, t, lt, d, { heat: 1.5 })],
  [224.56, 227.72, sStars],
  [227.72, 230.72, sStars],
  [230.72, 233.40, sInk],
  [233.40, 235.56, sEnemy],
  [235.56, 239.46, (g, t, lt, d) => sPair(g, t, lt, d, { action: 'thread', dist: 190, y: 800, s: .58 })],
  [239.46, 243.90, (g, t, lt, d) => sPair(g, t, lt, d, { action: 'gaze', dist: 200, y: 800, s: .56 })],
  // 尾奏
  [243.90, 250.00, sAssemble],
  [250.00, 256.00, sPullBack],
  [256.00, 263.34, sEnd]
];

export function shotAt(t) {
  for (let i = SHOTS.length - 1; i >= 0; i--) if (t >= SHOTS[i][0]) return SHOTS[i];
  return SHOTS[0];
}
