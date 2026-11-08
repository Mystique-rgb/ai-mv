// 《寂寞烟火》MV — 厚涂刀触 · 38 镜
import { Impasto, Strokes } from './engine/impasto.js';
import * as P from './paint.js';
import { layerPlane, layerMid, edgeRun, knifeBlade, crackOpen, paintDrop, gradAt } from './brush3.js';
import { C, RAINBOW, h1, clamp, lerp, ss, eo, ei, eio, seg, key, mixc, shade } from './common.js';

const W = 1920, H = 1080, DUR = 55.28;
const BPM = 136, BEAT = 60 / BPM, BAR = BEAT * 4, OFF = 0.43;
const beatT = n => OFF + (n - 1) * BEAT;      // 第 n 拍（n 从 1 开始）
const barT = n => OFF + (n - 1) * BAR;

const LINES = [
  { s: 0.00, e: 3.34, txt: '跨越过多少海洋去看你' },
  { s: 3.34, e: 5.42, txt: '孤单的黑夜途中' },
  { s: 5.42, e: 7.22, txt: '只要想着你' },
  { s: 7.22, e: 10.32, txt: '我就不会惶恐' },
  { s: 10.32, e: 13.92, txt: '时光的岸上人来了又走' },
  { s: 13.92, e: 17.15, txt: '离开时你不用说我都懂' },
  { s: 17.15, e: 19.78, txt: '感谢你曾让我' },
  { s: 19.78, e: 23.30, txt: '留在你眼中' },
  { s: 24.00, e: 28.02, txt: '我曾经走过最遥远的路' },
  { s: 28.02, e: 31.60, txt: '想要去拥抱未成真的梦' },
  { s: 31.60, e: 33.78, txt: '迷失的黑夜途中' },
  { s: 33.78, e: 35.55, txt: '只要想起你' },
  { s: 35.55, e: 38.54, txt: '就点亮了星空' },
  { s: 38.54, e: 42.18, txt: '流浪的纸船忘不掉港口' },
  { s: 42.18, e: 45.72, txt: '渐灭的花火割不断彩虹' },
  { s: 45.72, e: 48.44, txt: '你就是我心中' },
  { s: 48.44, e: 52.20, txt: '永恒的天空' },
];

let E, dyn, subEl, curLine = -2, spans = [];

export async function setup(canvas) {
  try { await document.fonts.load('86px "XK"'); } catch (e) { console.warn('font', e); }
  E = new Impasto(canvas, { W, H, ss: 2 });
  dyn = new Strokes(20000);
  subEl = document.getElementById('sub');
  window.DUR = DUR;
  return frame;
}

// ============ 转场机 ============
// TR / SHIFT 是 flush 的全局上下文（只在 frame 内设置、帧末清空）：
//   劈 split/vsplit —— 上一镜整幅重画两次，各自用 GL 裁剪窗只留一半、相机反向错位滑开，
//                     两半真的在位移，缝里露出来的是下一镜（不是一层色盖过去）
//   刮 scrape     —— 上一镜拆成六条横带，交替左右错位刮走，像颜料被一刀刀铲掉
//   甩 whip       —— SHIFT 给整镜相机加偏移，旧镜甩出、新镜入画（真位移）
let TR = null, SHIFT = null;

const scissor = (x0, y0, x1, y1) => {
  const gl = E.gl, ss = E.ss;
  gl.enable(gl.SCISSOR_TEST);
  gl.scissor(Math.round(clamp(x0, 0, W) * ss), Math.round((H - clamp(y1, 0, H)) * ss),
             Math.round(Math.max(0, x1 - x0) * ss), Math.round(Math.max(0, y1 - y0) * ss));
};

const flush = (o) => {
  if (!dyn.n) return;
  let cam = o.cam;
  if (SHIFT && cam) cam = { ...cam, x: cam.x + SHIFT[0], y: cam.y + SHIFT[1] };
  const data = dyn.data();
  if (TR && TR.clips) {
    for (const cl of TR.clips) {
      const r = cl.rect;
      if (r[2] - r[0] <= 1 || r[3] - r[1] <= 1) continue;
      scissor(r[0], r[1], r[2], r[3]);
      E.drawNow(data, { run: .05, ...o, cam: { ...cam, x: cam.x + cl.off[0], y: cam.y + cl.off[1] },
                       alpha: (o.alpha ?? 1) * (cl.alpha ?? 1) });
    }
    E.gl.disable(E.gl.SCISSOR_TEST);
  } else {
    E.drawNow(data, { run: .05, ...o, cam });
  }
  dyn.clear();
};

// 劈：左右两半各滑各的；裁窗跟着缝口走，缝里就是新镜
function splitCtx(m, tr, k, s) {
  const fade = 1 - k * .1;
  if (m === 'split') {
    const L = tr.line ?? 960;
    return { clips: [
      { rect: [0, 0, L - s, H], off: [s, 0], alpha: fade },
      { rect: [L + s, 0, W, H], off: [-s, 0], alpha: fade },
    ] };
  }
  const L = tr.line ?? H / 2;
  return { clips: [
    { rect: [0, 0, W, L - s], off: [0, s], alpha: fade },
    { rect: [0, L + s, W, H], off: [0, -s], alpha: fade },
  ] };
}

// 刮：六条横带，同向（刀往一个方向拖），但每条速度不同——像一刀刀把颜料拖走
function scrapeCtx(tr, k) {
  const clips = [];
  for (let b = 0; b < 6; b++) {
    const y0 = -260 + b * 300, y1 = y0 + 300;
    const spd = .55 + h1(b * 7.3) * .9;
    const stag = Math.pow(clamp((k * 1.5 - b * .06) * (0.8 + spd * .5), 0, 1), 1.6);
    clips.push({ rect: [0, y0, W, y1], off: [2600 * spd * stag, 0], alpha: 1 - stag * .18 });
  }
  return { clips };
}

// ============ 相机 & 后处理 ============
const CAM = () => ({ x: W / 2, y: H / 2, zoom: 1, rot: 0 });

function post(t) {
  // 基底：暖光斜掠，暗部偏冷（明暗差距拉开，笔触的脊才亮得出来）
  const p = {
    light: [-.56, -.62, .68], norm: 3.4, amb: .66, dif: .44, spec: .27, shin: 30, ao: 1.25,
    ground: [.07, .07, .08], sat: 1.04, expo: 1.0, vig: .38, contrast: 1.08, weave: .07,
    lift: [.008, .008, .016],
  };
  // 段落的明暗与饱和
  if (t < 3.34) { p.sat = .92; p.expo = .9; p.amb = .5; p.vig = .44; p.contrast = 1.12; }
  if (t >= 3.34 && t < 5.42) { p.expo = .92; p.amb = .54; p.sat = .92; p.vig = .42; }
  if (t >= 23.3 && t < 24.0) { p.expo = .74; p.amb = .4; }
  if (t >= 31.6 && t < 33.78) { p.expo = .88; p.amb = .54; p.vig = .48; p.sat = .78; }
  if (t >= 33.78 && t < 38.54) { p.expo = .96; p.spec = .3; }
  if (t >= 39.25 && t < 45.72) { p.sat = 1.14; p.spec = .3; p.expo = 1.04; p.vig = .32; }
  if (t >= 48.44 && t < 52.2) { p.sat = 1.08; p.light = [-.44, -.72, .54]; p.amb = .64; }
  if (t >= 52.2) { p.expo = lerp(1, .5, seg(t, 52.2, 55.2)); p.sat = lerp(1, .42, seg(t, 52.2, 55.2)); p.amb = lerp(.6, .34, seg(t, 52.2, 55.2)); }
  return p;
}

// ============ 通用图层 ============
function deepNight(S, o = {}) { P.sky(S, { y0: -200, y1: 760, cols: [C.night, C.deep, C.seaDeep], n: 22, seed: 11, ...o }); }
function seaField(S, t, o = {}) { P.sea(S, { y0: 620, y1: 1200, n: 18, t, seed: 31, ...o }); }
function starBurst(S, cx, cy, rad, t, o = {}) {
  const n = o.n || 26;
  for (let i = 0; i < n; i++) {
    const a = h1(i * 7.7) * Math.PI * 2, d = Math.pow(h1(i * 3.3), .6) * rad;
    const x = cx + Math.cos(a) * d * 1.5, y = cy + Math.sin(a) * d;
    const tw = .6 + .4 * Math.sin(t * 3 + i);
    P.star(S, x, y, (2.4 + h1(i * 11) * 4) * tw, C.gold, i * 13, .9);
  }
}

// ============ 镜头 ============
// SH01 0.00–0.43 刀尖悬着，一滴蓝将落未落
function SH01(t, lt) {
  const cam = { x: 960, y: 470, zoom: 1.05 };
  P.bareCanvas(dyn, { seed: 3 }); flush({ t, cam });
  // 画布干裂细纹（近处更大）
  const tremble = Math.sin(t * 26) * 2.2 * seg(t, 0, .43);
  // 刀刃：从右上斜劈下来的深色长条
  const bx = 1010, by = 300;
  dyn.push({ x: bx, y: by - 260, ang: 1.28, len: 900, wid: 46, c: shade(C.black, 1.05), c2: shade(C.black, .8), seed: 1, type: 0, taper: .28, skew: .2 });
  dyn.push({ x: bx, y: by - 250, ang: 1.28, len: 880, wid: 14, c: C.greyLight, seed: 2, type: 0, taper: .3, alpha: .7 });
  // 刀尖
  dyn.push({ x: bx - 8, y: by + 8, ang: 1.28, len: 70, wid: 40, c: C.greyLight, c2: C.grey, seed: 3, type: 0, taper: .95 });
  // 那滴蓝
  const drop = seg(t, .05, .43);
  dyn.push({ x: bx - 26 + tremble * .3, y: by + 30 + drop * 20 + tremble, ang: 0, len: 78 + drop * 26, wid: 66 + drop * 14,
             c: C.cobalt, c2: C.deep, seed: 4, type: 2, alpha: .97 });
  dyn.push({ x: bx - 34, y: by + 14 + drop * 12, ang: 0, len: 26, wid: 22, c: C.ice, seed: 5, type: 2, alpha: .8 });
  // 刀身上的反射
  dyn.push({ x: bx + 40, y: by - 120, ang: 1.28, len: 300, wid: 6, c: C.white, seed: 6, type: 0, alpha: .35 });
  flush({ t, cam });
}

// SH02 0.43–0.87 一刀劈开，蓝颜料喷出
function SH02(t, lt) {
  const k = seg(t, .43, .87);
  const cam = { x: 960, y: 540, zoom: lerp(1.02, .94, k) };
  P.bareCanvas(dyn, { seed: 3 }); flush({ t, cam });
  // 裂口：从中线向两侧张开
  const gapW = lerp(10, 420, eo(k));
  for (let i = 0; i < 16; i++) {
    const yy = -160 + i * 92;
    const wob = (h1(i * 3) - .5) * 40;
    dyn.push({ x: 960 + wob, y: yy, ang: Math.PI / 2 + (h1(i * 7) - .5) * .06, len: gapW * 1.4 + 240, wid: 108,
               c: C.deep, c2: C.cobalt, seed: 10 + i, type: 0, taper: .05, skew: .7 });
  }
  // 裂口边缘翻卷的干颜料
  for (let i = 0; i < 18; i++) {
    const yy = -140 + h1(i * 5) * 1280, sgn = h1(i * 9) > .5 ? 1 : -1;
    dyn.push({ x: 960 + sgn * (gapW * .55 + 30), y: yy, ang: sgn > 0 ? 0 : Math.PI, len: 40 + h1(i * 11) * 90, wid: 22 + h1(i * 13) * 26,
               c: C.canvasDark, c2: C.canvas, seed: 30 + i, type: 0, taper: .7 });
  }
  // 喷出的三滴
  const sp = [[0, -.9], [.55, -.55], [-.5, -.7]];
  for (let i = 0; i < 3; i++) {
    const d = sp[i], dd = eo(seg(t, .5 + i * .04, .87));
    dyn.push({ x: 960 + d[0] * 560 * dd, y: 540 + d[1] * 420 * dd - 60 * dd,
               ang: i, len: 60 - dd * 18, wid: 54 - dd * 14, c: C.cobalt, c2: C.ice, seed: 50 + i, type: 2, alpha: .95 });
  }
  // 冲击白边
  dyn.push({ x: 960, y: 540, ang: Math.PI / 2, len: 1500, wid: lerp(140, 30, k), c: C.white, seed: 60, type: 0, alpha: .55 * (1 - k) + .1, taper: .1 });
  flush({ t, cam });
}

// SH03 0.87–1.31 跟着刀锋坠入
function SH03(t, lt) {
  const k = seg(t, .87, 1.31);
  const cam = { x: 960, y: 540, zoom: lerp(1.0, 1.35, eo(k)), rot: k * .1 };
  // 两侧的蓝色颜料岩壁
  for (let s of [-1, 1]) {
    for (let i = 0; i < 12; i++) {
      const yy = -200 + i * 130 - k * 300;
      dyn.push({ x: 960 + s * (330 + h1(i * 7) * 90), y: yy, ang: Math.PI / 2 + s * .06,
                 len: 380 + h1(i * 11) * 200, wid: 120 + h1(i * 13) * 90,
                 c: mixc(C.deep, C.cobalt, h1(i * 3) * .5), c2: C.seaDeep, seed: 70 + i + s * 30, type: 0, taper: .1, skew: .6 });
    }
  }
  // 中间通道：高速下坠的速度线
  for (let i = 0; i < 26; i++) {
    const yy = ((i * 97 + k * 900) % 1400) - 200;
    const x = 960 + (h1(i * 5) - .5) * 420;
    dyn.push({ x, y: yy, ang: Math.PI / 2, len: 160 + h1(i * 9) * 220, wid: 12 + h1(i * 11) * 16,
               c: mixc(C.ice, C.cobalt, h1(i * 13)), seed: 100 + i, type: 0, alpha: .45, taper: .8 });
  }
  // 擦过的金光
  for (let i = 0; i < 5; i++) {
    const yy = ((i * 331 + k * 1100) % 1300) - 150;
    dyn.push({ x: 960 + (h1(i * 17) - .5) * 300, y: yy, ang: 1.3, len: 120, wid: 10, c: C.gold, seed: 140 + i, type: 2, alpha: .7 });
  }
  flush({ t, cam });
}

// SH04 1.31–2.19 砸进海，被浪抛起
function SH04(t, lt) {
  const k = seg(t, 1.31, 2.19);
  const cam = { x: 960, y: 560, zoom: lerp(1.2, .95, eo(k)) };
  P.sky(dyn, { y0: -180, y1: 520, cols: [C.night, C.deep, C.sea], n: 16, seed: 21 }); 
  P.sea(dyn, { y0: 480, y1: 1220, n: 18, t, seed: 31, foam: 1.4 });
  // 浪头
  const wy = 620 + Math.sin(k * 6) * 40;
  for (let i = 0; i < 10; i++) {
    dyn.push({ x: 300 + i * 150, y: wy + (h1(i * 3) - .5) * 90, ang: -.15 + h1(i * 5) * .3,
               len: 320 + h1(i * 7) * 260, wid: 90 + h1(i * 11) * 70,
               c: C.sea, c2: C.ice, seed: 150 + i, type: 0, taper: .3, bend: .25 });
  }
  // 浪花白片
  for (let i = 0; i < 16; i++) {
    const a = h1(i * 13) * Math.PI;
    dyn.push({ x: 960 + (h1(i * 17) - .5) * 1100, y: wy - 60 - h1(i * 19) * 160,
               ang: a, len: 60 + h1(i * 23) * 130, wid: 16 + h1(i * 29) * 26,
               c: C.foam, c2: C.ice, seed: 170 + i, type: 0, alpha: .85, taper: .6 });
  }
  // 主角被抛起
  const py = lerp(wy - 40, wy - 210, eo(seg(t, 1.45, 1.9))) + (lt > .5 ? Math.sin((lt - .5) * 8) * 12 : 0);
  P.clawd(dyn, 960, py, 26, { eyes: 'wide', mouth: 'O', aL: 1.1, aR: 1.3, sq: -.12, seed: 5, walk: t * 8 });
  // 溅起的水滴
  P.dabs(dyn, { n: 30, x: 960, y: wy, r: 260, cols: [C.foam, C.ice, C.sea], seed: 190, alpha: .8, spread: 1.1, grav: .6, t: lt });
  flush({ t, cam });
}

// SH05 2.19–3.34 全景：望不到边的海，他走过留下金色的路
function SH05(t, lt) {
  const k = seg(t, 2.19, 3.34);
  const cam = { x: 960, y: lerp(600, 520, ss(k)), zoom: lerp(1.0, .9, ss(k)) };
  P.sky(dyn, { y0: -180, y1: 470, cols: [C.night, C.deep, C.sea], n: 14, seed: 21 });
  P.sea(dyn, { y0: 430, y1: 1220, n: 20, t, seed: 33, foam: 1.1 });
  // 他走过的金色路：密集小刀沿曲线铺，成为一条真正的路
  const steps = 54;
  for (let i = 0; i < steps; i++) {
    const u = i / steps;
    const x = 960 + Math.sin(u * 4.2) * 250 * (1 - u * .3);
    const y = lerp(452, 916, u);
    const grow = clamp(k * 1.7 - u * .75, 0, 1);
    if (grow <= 0) continue;
    const w = 16 + u * 30;
    dyn.push({ x: x + Math.sin(u * 9) * 6, y, ang: -.3 + Math.sin(u * 4.2 + 1.2) * .45,
               len: 46 + u * 74, wid: w, c: mixc(C.amber, C.gold, u * .5), c2: C.lemon,
               seed: 210 + i, type: 0, taper: .55, alpha: .92 * grow, hgt: 1.2 });
    // 路的边光
    dyn.push({ x: x - 6, y: y - 3, ang: -.3 + Math.sin(u * 4.2 + 1.2) * .45, len: 34 + u * 50, wid: w * .26,
               c: C.lemon, seed: 260 + i, type: 0, taper: .8, alpha: .5 * grow });
  }
  // 主角在路的尽头走
  const px = 960 + Math.sin(1 * 4.2) * 0;
  const bob = Math.abs(Math.sin(t * 10)) * 8;
  P.clawd(dyn, 960, 880 - bob, 22, { eyes: 'normal', aL: -.5, aR: .4, walk: t * 10, seed: 7, view: 'qback' });
  flush({ t, cam });
}


// ======== 新版开场（三层笔触）========
const CANVAS_COLS = [mixc(C.canvas, C.white, .22), C.canvas, mixc(C.canvasDark, C.black, .12)];
const NEWLOOK = true;

function SH01N(t, lt) {
  const cam = { x: 1010, y: 640, zoom: 1.85 };
  // 第一层：大平面铺明暗
  layerPlane(dyn, { x0: -300, y0: -220, x1: 2220, y1: 1320, cols: CANVAS_COLS, n: 7, seed: 3 });
  flush({ t, cam });
  // 第二层：中笔压出脏和转折
  layerMid(dyn, { x0: -260, y0: -180, x1: 2180, y1: 1280, cols: [C.canvasDark, C.canvas, mixc(C.canvas, C.white, .25)], n: 30, seed: 11 });
  flush({ t, cam });
  // 第三层：干裂细纹（小刀）
  for (let i = 0; i < 14; i++) {
    const x0 = 200 + h1(i * 7.7) * 1500, y0 = 120 + h1(i * 11.3) * 800;
    dyn.push({ x: x0, y: y0, ang: h1(i * 13.1) * Math.PI, len: 90 + h1(i * 17.9) * 260, wid: 2.4 + h1(i * 19.3) * 2.6,
               c: shade(C.canvasDark, .88), seed: 30 + i, type: 2, alpha: .3, taper: .7 });
  }
  flush({ t, cam });
  // 刀：刀尖悬在画布上方，微微颤
  const tr = Math.sin(t * 30) * 1.6 * seg(t, 0, .43);
  // 一束斜光打在画布上（戏剧性）
  for (let i = 0; i < 4; i++) {
    dyn.push({ x: 700 + i * 42, y: 520, ang: 1.22, len: 1500, wid: 70 - i * 8, c: C.lemon, c2: C.amber,
               seed: 70 + i, type: 0, alpha: .10, taper: .8 });
  }
  flush({ t, cam });
  knifeBlade(dyn, { x: 1030 + tr, y: 210, ang: 1.30, len: 980, wid: 78, seed: 5 });
  // 刀尖
  dyn.push({ x: 1160 + tr, y: 684, ang: 1.30, len: 54, wid: 44, c: mixc(C.white, C.greyLight, .35), c2: C.grey, seed: 9, type: 0, taper: .55, hgt: 1.0 });
  flush({ t, cam });
  // 那滴蓝：将落未落
  const drop = seg(t, .06, .43);
  paintDrop(dyn, { x: 996 + tr, y: 742 + drop * 30 + tr * .6, r: 54 + drop * 10, c: C.cobalt, seed: 13, stretch: 1 + drop * .5 });
  // 刀尖上的反光
  dyn.push({ x: 1140 + tr, y: 664, ang: .7, len: 30, wid: 9, c: C.white, seed: 17, type: 2, alpha: .75 });
  flush({ t, cam });
}

function SH02N(t, lt) {
  const k = seg(t, .43, .87);
  const cam = { x: 960, y: 540, zoom: lerp(1.02, .93, k) };
  layerPlane(dyn, { x0: -300, y0: -220, x1: 2220, y1: 1320, cols: CANVAS_COLS, n: 7, seed: 3 });
  flush({ t, cam });
  layerMid(dyn, { x0: -260, y0: -180, x1: 2180, y1: 1280, cols: [C.canvasDark, C.canvas, mixc(C.canvas, C.white, .25)], n: 30, seed: 11 });
  flush({ t, cam });
  // 裂口
  const gap = lerp(16, 430, eo(k));
  crackOpen(dyn, { x: 960, y0: -260, y1: 1340, gap, seed: 21, t, alpha: 1 });
  flush({ t, cam });
  // 喷出的三滴
  const sp = [[0, -1.0], [.62, -.6], [-.55, -.72]];
  for (let i = 0; i < 3; i++) {
    const d = sp[i], dd = eo(seg(t, .5 + i * .05, .87));
    paintDrop(dyn, { x: 960 + d[0] * 640 * dd, y: 540 + d[1] * 460 * dd, r: 34 - dd * 8,
                     c: C.cobalt, seed: 40 + i * 5, stretch: 1 + (1 - dd) * .8 });
  }
  flush({ t, cam });
  // 冲击白边
  dyn.push({ x: 960, y: 540, ang: Math.PI / 2, len: 1520, wid: lerp(150, 26, k),
             c: C.white, seed: 60, type: 0, alpha: .5 * (1 - k) + .08, taper: .1 });
  flush({ t, cam });
}

// SH06 3.34–4.41 天黑下来（3.34 处的"劈"转场把白天劈开，夜从缝里进来）
function SH06(t, lt) {
  const cam = CAM();
  P.sky(dyn, { y0: -200, y1: 720, cols: [C.night, C.deep, C.seaDeep], n: 18, seed: 21 });
  P.sea(dyn, { y0: 700, y1: 1220, n: 12, t, seed: 31, foam: .4, cols: [C.seaDeep, shade(C.seaDeep, .72)] });
  flush({ t, cam });
  dyn.push({ x: 960, y: 840, ang: 0, len: 520, wid: 10, c: C.amber, seed: 605, type: 0, alpha: .85, taper: .45 });
  P.clawd(dyn, 960, 808, 15, { eyes: 'wide', aL: -.15, aR: -.15, seed: 9 });
  flush({ t, cam });
}

// SH07 4.41–5.42 天被一刀刮开一道缝
function SH07(t, lt) {
  const cam = { x: 960, y: 520, zoom: lerp(1, 1.18, ss(seg(t, 4.41, 5.42))) };
  P.sky(dyn, { y0: -200, y1: 760, cols: [C.night, shade(C.night, .7)], n: 16, seed: 23 });
  P.sea(dyn, { y0: 740, y1: 1220, n: 10, t, seed: 33, foam: .3, cols: [C.seaDeep, shade(C.seaDeep, .6)] });
  flush({ t, cam });
  // 斜着刮开的缝
  const gap = eo(seg(t, 4.45, 5.05));
  for (let i = 0; i < 5; i++) {
    dyn.push({ x: 690 + i * 76, y: 270 - i * 26 + (h1(i * 3) - .5) * 40, ang: -.22, len: 260 + gap * 760, wid: 14 + gap * 30,
               c: C.gold, c2: C.lemon, seed: 610 + i, type: 0, alpha: .85, taper: .3 });
  }
  flush({ t, cam });
  // 光打在他脸上：角色放大，右半边亮
  P.clawd(dyn, 900, 880, 20, { eyes: 'normal', aL: -.3, aR: .2, seed: 11 });
  dyn.push({ x: 930, y: 800, ang: -.1, len: 300, wid: 130, c: C.lemon, c2: C.gold, seed: 616, type: 0, alpha: .2, taper: .6 });
  flush({ t, cam });
}

// SH08 5.42–6.16 极近特写：竖眼里浮出一点粉
function SH08(t, lt) {
  const cam = { x: 960, y: 500, zoom: 1.25 };
  P.fillArea(dyn, -300, -220, 2220, 1320, C.terra, { n: 9, seed: 620, c2: C.terraDark, taper: .05 });
  flush({ t, cam });
  for (const sx of [-1, 1]) {
    dyn.push({ x: 960 + sx * 258, y: 420, ang: Math.PI / 2, len: 370, wid: 112, c: shade(C.black, 1.15), seed: 621 + sx, type: 0, taper: .2 });
    dyn.push({ x: 960 + sx * 258, y: 432, ang: Math.PI / 2, len: 280, wid: 60, c: shade(C.black, 1.5), seed: 623 + sx, type: 0, taper: .28 });
  }
  flush({ t, cam });
  const pk = ss(seg(t, 5.55, 6.1));
  for (const sx of [-1, 1]) {
    dyn.push({ x: 960 + sx * 258, y: 420 + Math.sin(t * 6) * 6, ang: 0, len: 40 + pk * 90, wid: 44 + pk * 76,
               c: C.pink, c2: C.lemon, seed: 625 + sx, type: 2, alpha: pk * .95 });
  }
  flush({ t, cam });
}

// SH09 6.16–7.22 粉色溢出、滴落、炸开成一朵花
function SH09(t, lt) {
  const cam = { x: 960, y: 540, zoom: lerp(1.2, 1.0, ss(seg(t, 6.16, 7.22))) };
  P.fillArea(dyn, -300, -220, 2220, 1320, mixc(C.terra, C.black, .45), { n: 9, seed: 630, c2: C.black, taper: .05 });
  flush({ t, cam });
  const grow = ss(seg(t, 6.16, 6.55));
  dyn.push({ x: 960, y: 470 + grow * 90, ang: 0, len: 70 + grow * 120, wid: 44 + grow * 40,
             c: C.pink, c2: C.pinkDeep, seed: 631, type: 2, alpha: .95 });
  flush({ t, cam });
  const fall = eo(seg(t, 6.6, 6.95));
  if (t > 6.58) dyn.push({ x: 960, y: lerp(560, 830, fall), ang: 0, len: 78 + fall * 40, wid: 48,
                           c: C.pink, c2: C.pinkDeep, seed: 632, type: 2, alpha: .95 });
  flush({ t, cam });
  if (t > 6.95) {
    const bx = 960, by = 845, k = ss(seg(t, 6.88, 7.10));
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2;
      dyn.push({ x: bx + Math.cos(a) * 210 * k, y: by + Math.sin(a) * 140 * k, ang: a, len: 210 * k + 40, wid: 58 * k + 14,
                 c: i % 2 ? C.pink : C.pinkDeep, c2: C.amber, seed: 640 + i, type: 0, taper: .7 });
    }
    dyn.push({ x: bx, y: by, ang: 0, len: 170 * k, wid: 170 * k, c: C.lemon, seed: 660, type: 2, alpha: .85 });
    P.dabs(dyn, { n: 40, x: bx, y: by, r: 620 * k, cols: [C.pink, C.amber, C.lemon, C.rose], seed: 661, alpha: .85 });
  }
  flush({ t, cam });
}

// SH10 7.22–8.38 颜色从落点一波波推开，把黑挤到边缘
function SH10(t, lt) {
  const k = ss(seg(t, 7.22, 8.3));
  const cam = { x: 960, y: 540, zoom: lerp(1.3, .92, eo(k)), rot: k * .18 };
  P.fillArea(dyn, -320, -240, 2240, 1340, C.black, { n: 10, seed: 670 });
  flush({ t, cam });
  const pal = [C.pink, C.amber, C.gold, C.orange, C.rose, C.lemon, C.jade, C.violet, C.sky];
  for (let i = 0; i < 150; i++) {
    const a = h1(i * 3.3) * Math.PI * 2, d = h1(i * 7.7) * 1080 + 60;
    const need = d / 1080;
    if (k < need * .92) continue;
    const c = pal[i % pal.length];
    dyn.push({ x: 960 + Math.cos(a) * d * k, y: 540 + Math.sin(a) * d * k * .82, ang: a + 1.57,
               len: 80 + h1(i * 11) * 170, wid: 34 + h1(i * 13) * 56, c, c2: mixc(c, C.white, .35),
               seed: 671 + i, type: 0, taper: .45, alpha: .95 });
  }
  flush({ t, cam });
  // 中间那朵粉花与主角
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2;
    dyn.push({ x: 960 + Math.cos(a) * 190, y: 760 + Math.sin(a) * 120, ang: a, len: 200, wid: 56,
               c: i % 2 ? C.pink : C.pinkDeep, seed: 690 + i, type: 0, taper: .72 });
  }
  P.clawd(dyn, 960, 700, 22, { eyes: 'wide', mouth: 'O', aL: .8, aR: .9, sq: -.06, seed: 13, blush: .4 });
  flush({ t, cam });
}

// SH11 8.38–10.32 他在彩色的路上跑，每踩一步炸开一小片
function SH11(t, lt) {
  const k = seg(t, 8.38, 10.32);
  const cam = { x: lerp(700, 1200, k), y: 700, zoom: 1.12 };
  P.fillArea(dyn, -320, -240, 2240, 1340, mixc(C.black, C.violet, .35), { n: 10, seed: 700 });
  flush({ t, cam });
  // 地面：彩色横条
  const pal = [C.pink, C.amber, C.gold, C.orange, C.rose];
  for (let i = 0; i < 12; i++) {
    const yy = 720 + i * 46;
    dyn.push({ x: 960, y: yy, ang: 0, len: 2400, wid: 62, c: pal[i % 5], c2: shade(pal[i % 5], .75),
               seed: 710 + i, type: 0, taper: .1, alpha: .75 });
  }
  flush({ t, cam });
  // 脚印炸点
  for (let i = 0; i < 18; i++) {
    const tt = 8.38 + i * .11;
    if (t < tt) break;
    const px = lerp(360, 1560, (tt - 8.38) / 1.94);
    const life = clamp((t - tt) * 3, 0, 1);
    P.dabs(dyn, { n: 7, x: px, y: 905, r: 120 * life, cols: [pal[i % 5], C.lemon], seed: 730 + i, alpha: 1 - life });
  }
  flush({ t, cam });
  const px = lerp(360, 1560, k);
  const bob = Math.abs(Math.sin(t * 16)) * 13;
  P.clawd(dyn, px, 852 - bob, 26, { eyes: 'happy', mouth: 'grin', aL: .5, aR: 1.2, walk: t * 16, flip: -1, seed: 15, sq: -bob * .004 });
  flush({ t, cam });
}

// SH12 10.32–11.90 岸边，灰人潮一个个走过
function SH12(t, lt) {
  const k = seg(t, 10.32, 11.9);
  const cam = { x: lerp(1100, 850, k), y: 600, zoom: 1.0 };
  P.sky(dyn, { y0: -200, y1: 520, cols: [C.greyDark, C.indigo, C.sand], n: 16, seed: 41 });
  P.fillArea(dyn, -320, 500, 2240, 1340, C.sand, { n: 8, seed: 44, c2: C.ochre, taper: .08 });
  flush({ t, cam });
  P.crowdSil(dyn, { n: 26, y0: 640, y1: 1080, t, seed: 750, speed: 160, alpha: .95 });
  flush({ t, cam });
  P.clawd(dyn, 900, 880, 24, { eyes: 'normal', aL: -.4, aR: -.4, seed: 17, view: 'front' });
  flush({ t, cam });
}

// SH13 11.90–13.92 颜色被一个个带走，最后只剩灰雾
function SH13(t, lt) {
  const k = ss(seg(t, 11.9, 13.9));
  const cam = { x: 900, y: lerp(600, 660, k), zoom: lerp(1.0, 1.16, k) };
  P.sky(dyn, { y0: -200, y1: 520, cols: [C.greyDark, C.grey, C.greyLight], n: 16, seed: 41 });
  P.fillArea(dyn, -320, 500, 2240, 1340, mixc(C.sand, C.grey, k), { n: 8, seed: 44, c2: C.grey, taper: .08 });
  flush({ t, cam });
  P.crowdSil(dyn, { n: 30, y0: 620, y1: 1080, t, seed: 760, speed: 210, alpha: .85 + k * .15 });
  flush({ t, cam });
  const body = mixc(C.terra, C.grey, k * .85);
  P.clawd(dyn, 900, 880, 24, { col: body, eyes: k > .6 ? 'sleepy' : 'normal', mouth: k > .7 ? 'frown' : null, aL: -.6, aR: -.6, seed: 19 });
  flush({ t, cam });
  if (k > .45) {
    for (let i = 0; i < 14; i++) dyn.push({ x: (h1(i * 7) * 2200 - 140) + Math.sin(t * 2 + i) * 60, y: 300 + h1(i * 11) * 800,
      ang: .05, len: 900, wid: 90, c: C.grey, seed: 780 + i, type: 0, alpha: (k - .45) * 1.2, taper: .3 });
    flush({ t, cam });
  }
}

// SH14 13.92–15.43 一只手搭上肩，她转身走远
function SH14(t, lt) {
  const k = seg(t, 13.92, 15.43);
  const cam = { x: 960, y: 620, zoom: lerp(1.0, 1.08, k) };
  P.sky(dyn, { y0: -200, y1: 560, cols: [C.grey, C.sand, C.ochre], n: 14, seed: 45 });
  P.fillArea(dyn, -320, 540, 2240, 1340, C.sand, { n: 8, seed: 46, c2: C.ochre, taper: .08 });
  flush({ t, cam });
  P.clawd(dyn, 860, 866, 34, { eyes: k > .12 ? 'wide' : 'normal', mouth: k > .2 ? 'O' : null, aL: -.5, aR: k > .3 ? .5 : -.4, blush: .35, seed: 21 });
  flush({ t, cam });
  // 她：从右侧走近再走远
  const sx = k < .42 ? lerp(1400, 1120, ss(k / .42)) : lerp(1120, 1980, ss((k - .42) / .58));
  const sv = 'q';   // 全程 3/4 侧：两只眼都在，避免侧身时只剩一只眼
  const fl = k < .42 ? 1 : -1;
  P.clawd(dyn, sx, 900, 30, { col: C.pink, eyes: 'happy', mouth: 'smile', aL: -.4, aR: -.3, view: sv, flip: fl, walk: t * 9, seed: 23 });
  flush({ t, cam });
  // 搭肩那只手
  if (k > .18 && k < .45) {
    dyn.push({ x: 1010, y: 760, ang: .3, len: 120, wid: 46, c: C.pink, c2: C.pinkDeep, seed: 790, type: 0, taper: .5 });
    flush({ t, cam });
  }
}

// 海滩底：远景海 + 地平线 + 沙面质感（SH15/SH16 共用）
function beachBase(t, seed) {
  P.sky(dyn, { y0: -200, y1: 520, cols: [C.greyDark, C.grey], n: 14, seed: seed });
  // 远海
  P.sea(dyn, { y0: 470, y1: 566, x0: -260, x1: 2180, n: 5, t, seed: seed + 1, foam: .25,
               cols: [mixc(C.deep, C.grey, .55), mixc(C.sea, C.grey, .6)] });
  // 湿沙到干沙
  P.fillArea(dyn, -320, 556, 2240, 1340, mixc(C.sand, C.grey, .55), { n: 8, seed: seed + 2, c2: C.sand, taper: .08 });
  // 沙面的干刷痕（横向，很短，让空地有东西可看）
  for (let i = 0; i < 26; i++) {
    const y = 600 + Math.pow(h1(seed + i * 3.1), .7) * 700;
    dyn.push({ x: lerp(-200, 2100, h1(seed + i * 5.7)), y, ang: (h1(seed + i * 7.3) - .5) * .06,
               len: 150 + h1(seed + i * 11.9) * 380, wid: 6 + h1(seed + i * 13.7) * 12,
               c: mixc(C.sand, C.ochre, .3 + h1(seed + i * 17.3) * .4), seed: seed + 20 + i,
               type: 0, alpha: .35, taper: .8 });
  }
  // 几块小石头
  for (let i = 0; i < 7; i++) {
    dyn.push({ x: lerp(60, 1860, h1(seed + i * 23)), y: 700 + h1(seed + i * 29) * 500,
               len: 26 + h1(seed + i * 31) * 34, wid: 18 + h1(seed + i * 37) * 20,
               c: mixc(C.greyDark, C.sand, .5), seed: seed + 60 + i, type: 2, alpha: .8 });
  }
}

// SH15 15.43–16.75 伸手，停在半空
function SH15(t, lt) {
  const k = seg(t, 15.43, 16.75);
  const cam = { x: 960, y: 600, zoom: lerp(1.05, 1.14, k) };
  beachBase(t, 47);
  flush({ t, cam });
  const armA = key(t, [[15.43, -.7], [15.75, 1.35, eo], [16.3, 1.3], [16.75, 1.32]]);
  // 抬手前先沉一下肩、身体微蹲，抬起来才有重量
  const sink = key(t, [[15.43, 0], [15.6, 1], [15.86, 0], [16.75, 0]]);
  P.clawd(dyn, 880, 864 + sink * 13, 32, {
    eyes: 'sad', mouth: 'frown', aR: armA, aL: -.5, seed: 25, view: 'q',
    sq: sink * .07,
  });
  flush({ t, cam });
  // 远处那个粉色的小点
  const dx = lerp(1500, 1880, k);
  dyn.push({ x: dx, y: 800, ang: 0, len: 34, wid: 34, c: C.pink, seed: 795, type: 2, alpha: .9 });
  flush({ t, cam });
}

// SH16 16.75–17.15 手落下，头低下
function SH16(t, lt) {
  const cam = { x: 960, y: 620, zoom: 1.1 };
  beachBase(t, 51);
  flush({ t, cam });
  const armA = key(t, [[16.75, 1.3], [16.95, -.85, eo]]);
  P.clawd(dyn, 880, 864, 32, { eyes: 'closed', mouth: 'frown', aR: armA, aL: -.55, sq: .1, seed: 27, view: 'q' });
  flush({ t, cam });
}

// SH17 17.15–18.52 近特写：闭着眼，脸上挂着两道粉色的痕
function SH17(t, lt) {
  const cam = { x: 960, y: 560, zoom: 1.05 };
  P.fillArea(dyn, -320, -240, 2240, 1340, mixc(C.terra, C.black, .34), { n: 9, seed: 800, c2: C.terraDark, taper: .06 });
  flush({ t, cam });
  const open = t > 18.0 ? ss(seg(t, 18.0, 18.4)) : 0;
  P.clawd(dyn, 960, 862, 36, { eyes: open > .35 ? 'shine' : 'closed', mouth: null, aL: -.45, aR: -.45, seed: 49, blush: .25, glow: C.lemon });
  flush({ t, cam });
  const ty = lerp(668, 762, ss(seg(t, 17.35, 18.2)));
  dyn.push({ x: 960 - 90, y: ty, ang: 1.6, len: 118, wid: 15, c: C.pink, c2: C.pinkDeep, seed: 807, type: 0, alpha: .92, taper: .72 });
  dyn.push({ x: 960 + 90, y: ty - 8, ang: 1.54, len: 100, wid: 12, c: C.pink, seed: 808, type: 0, alpha: .85, taper: .72 });
  flush({ t, cam });
}

// SH18 18.52–19.78 嘴角第一次出现，一道暖光扫过脸
function SH18(t, lt) {
  const cam = { x: 960, y: 560, zoom: 1.07 };
  P.fillArea(dyn, -320, -240, 2240, 1340, mixc(C.terra, C.amber, .16), { n: 9, seed: 810, c2: C.terraDark, taper: .06 });
  flush({ t, cam });
  const sm = ss(seg(t, 18.62, 19.3));
  P.clawd(dyn, 960, 862, 36, { eyes: 'shine', mouth: sm > .12 ? 'smile' : null, aL: -.45, aR: -.45, seed: 51, blush: .45 * sm, glow: C.lemon });
  flush({ t, cam });
  const lx = lerp(200, 1800, ss(seg(t, 18.7, 19.7)));
  for (let i = 0; i < 7; i++) {
    dyn.push({ x: lx + i * 26, y: 560, ang: 1.57 + .06 * i, len: 1250, wid: 34 + (i % 2) * 16,
               c: i % 2 ? C.lemon : C.amber, seed: 812 + i, type: 0, alpha: .16, taper: .7 });
  }
  flush({ t, cam });
}

// SH19 19.78–21.61 切进她的瞳孔：粉色虹膜上，长着一小片海
function SH19(t, lt) {
  const k = seg(t, 19.78, 21.61);
  const cam = { x: 960, y: 470, zoom: lerp(1.02, 1.12, k) };
  const CX = 960, CY = 470, R0 = 352;
  // 底：黑
  for (let i = 0; i < 26; i++) {
    dyn.push({ x: 960, y: -200 + i * 56, ang: 0, len: 2100, wid: 66, c: shade(C.black, 1.7),
               c2: C.black, seed: 2700 + i * 3, type: 0, taper: .18 });
  }
  flush({ t, cam });
  // 粉色虹膜：一圈圈由内向外铺满的刀，中间深、边缘亮
  for (let ring = 0; ring < 10; ring++) {
    const rr = 26 + ring * 34;
    const n = 30 + ring * 8;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + ring * .21;
      dyn.push({ x: CX + Math.cos(a) * rr, y: CY + Math.sin(a) * rr * .93, ang: a + 1.57,
                 len: 62 + h1(ring * 31 + i) * 26, wid: 40,
                 c: mixc(C.pinkDeep, C.pink, clamp(ring / 9, 0, 1) * .85 + h1(i * 7) * .15),
                 c2: mixc(C.pink, C.white, .2), seed: 2750 + ring * 40 + i, type: 0, taper: .4 });
    }
  }
  flush({ t, cam });
  // —— 虹膜上长着一小片世界
  P.sea(dyn, { y0: 236, y1: 566, x0: 790, x1: 1130, n: 8, t, seed: 840, foam: .55 });
  flush({ t, cam });
  P.fillArea(dyn, 776, 560, 1144, 678, C.sand, { n: 4, seed: 841, c2: C.ochre, taper: .3 });
  flush({ t, cam });
  // 沙滩上那朵粉花
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2;
    dyn.push({ x: 830 + Math.cos(a) * 44, y: 626 + Math.sin(a) * 24, ang: a, len: 60, wid: 23,
               c: i % 2 ? C.pink : C.pinkDeep, seed: 850 + i, type: 0, taper: .7 });
  }
  dyn.push({ x: 830, y: 626, ang: 0, len: 24, wid: 24, c: C.lemon, seed: 866, type: 2, alpha: .95 });
  flush({ t, cam });
  // 他站在海边
  P.clawd(dyn, 1062, 664, 14, { eyes: 'normal', aL: -.4, aR: .3, view: 'q', seed: 29 });
  flush({ t, cam });
  // 瞳孔边：外圈压一道深粉，把圆收干净
  for (let i = 0; i < 80; i++) {
    const a = i / 80 * Math.PI * 2;
    dyn.push({ x: CX + Math.cos(a) * R0, y: CY + Math.sin(a) * R0 * .93, ang: a + 1.57, len: 52, wid: 30,
               c: C.pinkDeep, seed: 2820 + i, type: 0, taper: .35 });
  }
  flush({ t, cam });
}

// SH20 21.61–23.30 瞳孔收缩，全黑，只剩一点粉
function SH20(t, lt) {
  const k = ss(seg(t, 21.61, 23.1));
  const cam = { x: 960, y: 540, zoom: lerp(1.06, 1.5, k) };
  P.fillArea(dyn, -320, -240, 2240, 1340, C.black, { n: 10, seed: 860 });
  flush({ t, cam });
  if (k < .96) {
    const rr = lerp(360, 36, k);
    for (let i = 0; i < 40; i++) {
      const a = i / 40 * Math.PI * 2;
      dyn.push({ x: 960 + Math.cos(a) * rr, y: 540 + Math.sin(a) * rr * .86, ang: a + 1.57, len: rr * .5, wid: 30 * (1 - k * .5),
                 c: C.pink, seed: 870 + i, type: 0, taper: .4, alpha: .9 });
    }
    P.dabs(dyn, { n: 18, x: 960, y: 540, r: rr * .8, cols: [C.pink, C.amber, C.gold], seed: 880, alpha: 1 - k * .6 });
  } else {
    const gl = 1 - seg(t, 22.9, 23.3);
    // 黑里留一点粉尘，不要做成纯黑
    for (let i = 0; i < 46; i++) {
      const a = h1(i * 3.1) * 6.283, d = 90 + Math.sqrt(h1(i * 7.7)) * 620;
      dyn.push({ x: 960 + Math.cos(a) * d, y: 540 + Math.sin(a) * d * .72, ang: a,
                 len: 5 + h1(i * 11) * 10, wid: 4 + h1(i * 13) * 7,
                 c: mixc(C.pink, C.pinkDeep, h1(i * 17)), seed: 892 + i, type: 2,
                 alpha: (.2 + .3 * h1(i * 19)) * (.6 + gl * .4) });
    }
    dyn.push({ x: 960, y: 540, ang: 0, len: 90, wid: 90, c: C.pink, seed: 890, type: 2, alpha: .9 });
    P.dabs(dyn, { n: 8, x: 960, y: 540, r: 320, cols: [C.pink, C.pinkDeep], seed: 891, alpha: gl * .5 });
  }
  flush({ t, cam });
}

// SH21 23.30–24.00 黑幕被竖着劈开（上下两半错位滑开），露出暗红——峡谷的第一口气
function SH21(t, lt) {
  const k = ss(seg(t, 23.3, 24.0));
  const cam = { x: 960, y: lerp(540, 560, k), zoom: lerp(1.0, 1.07, k) };
  P.fillArea(dyn, -320, -240, 2240, 1340, C.darkred, { n: 8, seed: 900, c2: C.maroon, taper: .06 });
  flush({ t, cam });
  // 峡谷壁从两侧的暗里先立起来几刀（接 SH22）
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    dyn.push({ x: 960 + s * (300 + i * 260), y: 200 + h1(i * 7 + s * 3) * 700, ang: 1.5 + s * .08,
               len: 200 + h1(i * 11) * 300, wid: 70 + h1(i * 13) * 90,
               c: mixc(C.darkred, C.maroon, h1(i * 5)), c2: C.maroon, seed: 921 + i * 3 + s * 20,
               type: 0, taper: .12, skew: .6, alpha: .5 + k * .5 });
  }
  flush({ t, cam });
}

// SH22 24.00–26.90 笔触峡谷，贴地跟着他走
function SH22(t, lt) {
  const k = seg(t, 24.0, 26.9);
  const cam = { x: 960, y: lerp(700, 660, k), zoom: lerp(1.18, 1.04, k) };
  P.fillArea(dyn, -320, -240, 2240, 1340, mixc(C.darkred, C.ochre, .28), { n: 9, seed: 920 });
  dyn.push({ x: 700, y: 420, ang: .1, len: 1500, wid: 460, c: C.ochre, c2: C.amber, seed: 928, type: 0, alpha: .22, taper: .7 });
  flush({ t, cam });
  // 两侧峡谷壁：层层叠压的暗红刀痕，随相机掠过
  for (const s of [-1, 1]) {
    for (let i = 0; i < 12; i++) {
      const depth = i / 12;
      const x = 960 + s * (240 + depth * 780);
      const yy = 200 + h1(i * 3 + s) * 700 - k * 120;
      dyn.push({ x, y: yy, ang: 1.5 + s * .08 + (h1(i * 7) - .5) * .1, len: 260 + h1(i * 11) * 460,
                 wid: 90 + h1(i * 13) * 150, c: mixc(C.darkred, C.maroon, h1(i * 5)), c2: C.maroon,
                 seed: 921 + i * 3 + s * 20, type: 0, taper: .12, skew: .6 });
    }
  }
  flush({ t, cam });
  // 中笔：崖壁的转折与脏（把大平面之间撑起来）
  for (let i = 0; i < 40; i++) {
    const side = i % 2 ? 1 : -1;
    const x = 960 + side * (240 + h1(i * 3.3) * 700);
    const y = 150 + h1(i * 7.7) * 820;
    dyn.push({ x, y, ang: 1.5 + side * .1 + (h1(i * 11.1) - .5) * .5, len: 120 + h1(i * 13.7) * 300,
               wid: 20 + h1(i * 17.3) * 42, c: mixc(C.darkred, C.ochre, .15 + h1(i * 19.9) * .3),
               c2: C.maroon, seed: 2000 + i, type: 0, taper: .5, alpha: .55 + h1(i * 23.1) * .35, hgt: 1.2 });
  }
  // 小刀：崖壁上的纵向裂纹（暗金，只做质感不加戏）
  for (let i = 0; i < 18; i++) {
    const side = i % 2 ? 1 : -1;
    const x = 960 + side * (300 + h1(i * 5.1) * 640);
    const y = 220 + h1(i * 9.3) * 720;
    dyn.push({ x, y, ang: 1.55 + (h1(i * 11.7) - .5) * .2, len: 70 + h1(i * 13.3) * 180,
               wid: 3 + h1(i * 17.9) * 4, c: mixc(C.ochre, C.maroon, .55), seed: 2100 + i,
               type: 0, taper: .8, alpha: .32, hgt: 1.25 });
  }
  flush({ t, cam });
  // 头顶滴下的颜料
  for (let i = 0; i < 5; i++) {
    const dy = ((t * 260 + i * 340) % 1200) - 100;
    dyn.push({ x: 700 + h1(i * 7) * 520, y: dy, ang: 1.57, len: 90 + (dy % 60), wid: 20, c: C.darkred, seed: 960 + i, type: 0, alpha: .7, taper: .5 });
  }
  flush({ t, cam });
  P.clawd(dyn, 960, 900, 18, { eyes: 'determined', aL: -.3, aR: .3, walk: t * 11, view: 'qback', seed: 31 });
  flush({ t, cam });
}

// SH23 26.90–28.02 镜头升起，看见路有多长
function SH23(t, lt) {
  const k = ss(seg(t, 26.9, 28.02));
  const cam = { x: 960, y: lerp(660, 520, k), zoom: lerp(1.1, .82, k) };
  P.fillArea(dyn, -320, -240, 2240, 1340, mixc(C.darkred, C.ochre, .3), { n: 9, seed: 930 });
  flush({ t, cam });
  for (const s of [-1, 1]) {
    for (let i = 0; i < 14; i++) {
      const depth = i / 14;
      const x = 960 + s * (180 + depth * 820);
      dyn.push({ x, y: 180 + h1(i * 5 + s) * 720, ang: 1.5 + s * .1, len: 300 + depth * 420, wid: 90 + depth * 150,
                 c: mixc(C.darkred, C.maroon, h1(i * 9)), c2: C.maroon, seed: 931 + i * 3 + s * 20, type: 0, taper: .12, skew: .6 });
    }
  }
  // 路的延长线
  for (let i = 0; i < 16; i++) {
    const u = i / 16;
    dyn.push({ x: 960 + (h1(i * 7) - .5) * 70, y: lerp(930, 330, u), ang: 1.45, len: 70 + u * 40, wid: 26 + u * 46,
               c: mixc(C.ochre, C.amber, u), seed: 970 + i, type: 0, taper: .5, alpha: .9 });
  }
  flush({ t, cam });
  P.clawd(dyn, 960, 906, lerp(18, 11, k), { eyes: 'determined', aL: .4, aR: .5, walk: t * 14, view: 'qback', seed: 33 });
  flush({ t, cam });
}

// SH24 28.02–30.43 路的尽头是一团未完成的颜料，他跳起来抱
function SH24(t, lt) {
  const k = seg(t, 28.02, 30.43);
  const cam = { x: 960, y: lerp(640, 560, ss(k)), zoom: lerp(1.06, .95, ss(k)) };
  P.fillArea(dyn, -320, -240, 2240, 1340, mixc(C.maroon, C.darkred, .25), { n: 9, seed: 940 });
  flush({ t, cam });
  // 脚下的路：横向色带一层层向里收窄，形成一条真正朝远处去的路
  for (let i = 0; i < 46; i++) {
    const u = i / 45;
    const w = lerp(1120, 70, Math.pow(u, .62));
    const yy = lerp(1090, 556, u);
    dyn.push({ x: 960 + Math.sin(u * 3.1) * 34 + (h1(i * 5) - .5) * 14, y: yy, ang: Math.sin(u * 3.1) * .06,
               len: w, wid: lerp(30, 8, u), c: mixc(C.ochre, C.lemon, u * .8),
               c2: mixc(C.amber, C.lemon, .5), seed: 980 + i, type: 0, taper: .12,
               alpha: lerp(.95, .6, u) });
    if (i % 4 === 0) dyn.push({ x: 960 - w * .46, y: yy, ang: .04, len: 22, wid: 5,
                                c: C.lemon, seed: 1020 + i, type: 0, alpha: .4 * (1 - u), taper: .8 });
  }
  flush({ t, cam });
  // 那团梦：一团还没干的彩色颜料（外雾 + 主体 + 亮芯 + 往下滴）
  const dreamY = 396 + Math.sin(t * 1.6) * 14;
  const pal = [C.pink, C.gold, C.jade, C.violet, C.amber, C.rose];
  for (let i = 0; i < 12; i++) {
    const a = h1(i * 3.7) * 6.283 + t * .25, d = h1(i * 7.1) * 150;
    dyn.push({ x: 960 + Math.cos(a) * d * 1.5, y: dreamY + Math.sin(a) * d * .8, ang: a * .3,
               len: 300 + h1(i * 13) * 150, wid: 230 + h1(i * 17) * 110, c: pal[i % 6],
               seed: 990 + i, type: 2, alpha: .16 });
  }
  for (let i = 0; i < 18; i++) {
    const a = h1(i * 5.1) * 6.283, d = Math.sqrt(h1(i * 9.3)) * 96;
    dyn.push({ x: 960 + Math.cos(a) * d * 1.5, y: dreamY + Math.sin(a) * d * .9, ang: h1(i * 11) * .8 - .4,
               len: 150 + h1(i * 13) * 110, wid: 120 + h1(i * 17) * 70, c: pal[(i + 2) % 6],
               c2: mixc(pal[(i + 2) % 6], C.white, .35), seed: 1010 + i, type: 2, alpha: .42 });
  }
  dyn.push({ x: 960, y: dreamY, ang: 0, len: 150, wid: 132, c: C.lemon, c2: C.gold, seed: 1040, type: 2, alpha: .75 });
  for (let i = 0; i < 4; i++) {
    const dx = -90 + i * 60 + (h1(i * 3) - .5) * 26;
    dyn.push({ x: 960 + dx, y: dreamY + 96, ang: 1.57, len: 34 + h1(i * 7) * 34, wid: 11 + h1(i * 9) * 7,
               c: pal[i % 6], seed: 1045 + i, type: 2, taper: .85, alpha: .45 });
  }
  flush({ t, cam });
  // 跳：下蹲蓄力 → 蹬地拉长 → 落地压扁过冲
  const anti = ss(seg(t, 28.95, 29.2));
  const crouch = anti * (1 - ss(seg(t, 29.2, 29.36)));
  const jump = seg(t, 29.2, 29.9);
  const land = seg(t, 29.9, 30.43);
  const over = Math.sin(clamp(land / .5, 0, 1) * Math.PI) * (1 - land * .5);
  const jy = 900 + crouch * 46 - Math.sin(jump * Math.PI) * 306 + over * 26;
  const armUp = key(t, [[28.95, .35], [29.2, -.1], [29.5, 1.12], [29.9, 1.08], [30.15, .55]]);
  const sq = crouch * .18 - (jump > .05 && jump < .6 ? .15 : 0) + over * .13;
  P.clawd(dyn, 960, jy, 22, { eyes: 'hopeful', mouth: jump > .2 ? 'smile' : 'O', aL: armUp, aR: armUp, sq, seed: 35 });
  flush({ t, cam });
}

// SH25 30.43–31.60 抱住的一瞬，它散成几百个彩点
function SH25(t, lt) {
  const k = seg(t, 30.43, 31.6);
  const cam = { x: 960, y: 560, zoom: lerp(1.0, .9, k) };
  P.fillArea(dyn, -320, -240, 2240, 1340, mixc(C.maroon, C.black, .5), { n: 9, seed: 950 });
  flush({ t, cam });
  const pal = [C.pink, C.gold, C.jade, C.violet, C.amber, C.rose];
  const cx = 960, cy = 420;
  P.dabs(dyn, { n: 90, x: cx, y: cy, r: 110 + k * 780, cols: pal, seed: 1000, alpha: 1 - k * .45, spread: 1.4, t: k, drift: 1 });
  flush({ t, cam });
  const fy = lerp(600, 900, ss(seg(t, 30.6, 31.5))) + Math.sin(clamp(seg(t, 31.0, 31.35), 0, 1) * Math.PI) * 14;
  P.clawd(dyn, 960, fy, 20, { eyes: 'sad', mouth: 'frown', aL: .9, aR: .9, seed: 37,
    sq: Math.sin(clamp(seg(t, 31.0, 31.3), 0, 1) * Math.PI) * .1 });
  flush({ t, cam });
}

// SH26 31.60–33.78 全黑，灰笔触像风雪刮过，他越来越小
function SH26(t, lt) {
  const k = seg(t, 31.6, 33.78);
  const cam = { x: 960, y: 540, zoom: lerp(1.0, 1.22, k) };
  P.fillArea(dyn, -320, -240, 2240, 1340, C.black, { n: 9, seed: 1010 });
  flush({ t, cam });
  for (let i = 0; i < 22; i++) {
    const x = ((h1(i * 7) * 2400 + t * 520 * (0.5 + h1(i * 11))) % 2600) - 340;
    dyn.push({ x, y: h1(i * 13) * 1200, ang: .04, len: 300 + h1(i * 17) * 500, wid: 18 + h1(i * 19) * 40,
               c: mixc(C.grey, C.greyLight, h1(i * 23)), seed: 1011 + i, type: 0, alpha: .78, taper: .6 });
  }
  flush({ t, cam });
  P.clawd(dyn, 960, 860, lerp(17, 12, k), { eyes: 'scared', aL: -.2, aR: -.2, sq: .06, seed: 39 });
  flush({ t, cam });
}

// SH27 33.78–35.55 头部特写：闭着眼，眼缝漏粉光；睁眼，两眼里各升起一片星空
function SH27(t, lt) {
  const k = seg(t, 33.78, 35.55);
  const cam = { x: 960, y: 480, zoom: lerp(1.12, 1.24, ss(k)) };
  const u = 86, W = 10 * u, H = 6 * u;          // Clawd 自己的比例：宽 10u、高 6u
  const cx = 960, top = 200, bot = top + H;
  const col = C.terra, dk = shade(col, .70), light = mixc(col, [1, 1, 1], .34);
  // 底：压暗，脸才跳出来
  for (let i = 0; i < 30; i++) {
    const yy = -260 + i * 54;
    dyn.push({ x: 960 + (h1(2600 + i * 3) - .5) * 120, y: yy, ang: (h1(i * 5) - .5) * .03,
               len: 1900 + h1(i * 7) * 400, wid: 74, c: shade(C.black, 2.1), c2: C.black,
               seed: 2600 + i * 3, type: 0, taper: .2, alpha: 1 });
  }
  flush({ t, cam });
  // 头部：5 道大横刀，互相重叠盖住边缘的毛刺；上亮下暗
  for (let i = 0; i < 5; i++) {
    const q = i / 4;
    const yy = top + H * (i + .5) / 5;
    const cc = q < .45 ? mixc(light, col, q / .45) : mixc(col, dk, (q - .45) / .55);
    dyn.push({ x: cx + (h1(2060 + i * 3) - .5) * .10 * u, y: yy, ang: (h1(i * 7) - .5) * .03,
               len: W * 1.0, wid: (H / 5) * 2.15, c: cc, c2: mixc(cc, dk, .35),
               seed: 2060 + i * 5, type: 0, taper: .34, skew: .18 });
  }
  // 体积：右上暗面、左下反弹光（大而软，不要小碎块）
  for (let i = 0; i < 5; i++) {
    const q = i / 4;
    dyn.push({ x: cx + W * .30, y: top + H * (.10 + q * .80), ang: .03, len: W * .46, wid: (H / 5) * 1.9,
               c: shade(dk, .92), seed: 2400 + i, type: 0, alpha: .5, taper: .6 });
  }
  dyn.push({ x: cx - W * .22, y: bot - H * .13, ang: -.04, len: W * .66, wid: H * .20,
             c: mixc(col, C.amber, .5), seed: 2410, type: 0, alpha: .34, taper: .85 });
  // 左上一抹亮边（贴着边缘，很短，不做成划痕）
  for (let i = 0; i < 4; i++) {
    dyn.push({ x: cx - W * .43, y: top + H * (.10 + i * .07), ang: -.10, len: 120, wid: 9,
               c: mixc(light, C.white, .45), seed: 2420 + i, type: 0, alpha: .3, taper: .9 });
  }
  flush({ t, cam });
  const open = t < 34.4 ? 0 : ss(seg(t, 34.4, 34.96));
  const ex = 2.62 * u, ey = top + H * .42;
  for (const sx of [-1, 1]) {
    const px = cx + sx * ex;
    // 眉骨下的暗（让人读成“眼睛凹进去”）
    dyn.push({ x: px, y: ey - 8, ang: .02, len: R2(px) , wid: 92, c: shade(dk, .78), seed: 2440 + sx, type: 2, alpha: .30 });
    if (open < .12) {
      // 闭眼：一条缝 + 缝里的粉光
      dyn.push({ x: px, y: ey + 4, ang: .02, len: 128, wid: 17, c: shade(C.black, 1.25), seed: 2445 + sx, type: 0, taper: .55 });
      dyn.push({ x: px, y: ey, ang: .02, len: 100, wid: 7, c: C.pink, seed: 2447 + sx, type: 0, alpha: .92, taper: .6 });
      for (let i = 0; i < 3; i++)
        dyn.push({ x: px + (i - 1) * 30, y: ey - 8, ang: .1, len: 16, wid: 7, c: C.lemon,
                   seed: 2449 + sx * 5 + i, type: 2, alpha: .5 });
    } else {
      const R = 96 * open, eh = lerp(44, 210, open), ew = R * 1.5;
      // 眼形：一片干净的竖卵形（单刀椭圆，不用碎块拼）
      dyn.push({ x: px, y: ey, ang: 1.57, len: eh, wid: ew, c: shade(C.black, 1.5),
                 seed: 2450 + sx, type: 2, taper: .16 });
      // 虹膜：一圈细金点（不是放射的齿轮）
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * Math.PI * 2;
        dyn.push({ x: px + Math.cos(a) * R * .66, y: ey + Math.sin(a) * eh * .30, ang: a,
                   len: 15, wid: 9, c: mixc(C.gold, C.lemon, h1(i * 3.1)),
                   seed: 2455 + i + sx * 20, type: 2, alpha: open * .85 });
      }
      // 瞳孔里的星空
      for (let i = 0; i < 13; i++) {
        const a = h1(i * 7.3 + sx) * 6.283, d = h1(i * 11.9 + sx) * R * .52;
        dyn.push({ x: px + Math.cos(a) * d, y: ey + Math.sin(a) * d * 1.7, ang: a,
                   len: 7 + h1(i * 3.1) * 11, wid: 5 + h1(i * 5.7) * 8,
                   c: mixc(C.lemon, C.white, h1(i * 2.3)), seed: 2470 + i + sx * 30, type: 2, alpha: open });
      }
      // 高光
      dyn.push({ x: px - ew * .24, y: ey - eh * .24, ang: .7, len: 26, wid: 17,
                 c: C.white, seed: 2490 + sx, type: 2, alpha: open * .92 });
      // 眼下反光
      dyn.push({ x: px, y: ey + eh * .44, ang: .02, len: ew * .9, wid: 6,
                 c: mixc(C.ice, C.white, .35), seed: 2492 + sx, type: 0, alpha: open * .4, taper: .9 });
    }
  }
  flush({ t, cam });
  // 嘴 + 腮红
  dyn.push({ x: cx, y: top + H * .79, ang: 0, len: lerp(104, 128, open), wid: lerp(20, 25, open),
             c: shade(col, .30), seed: 2500, type: 0, alpha: .95, taper: .55, bend: lerp(-.04, .30, open) });
  for (const sx of [-3.55, 3.55]) for (let i = 0; i < 3; i++)
    dyn.push({ x: cx + sx * u + (h1(2505 + i) - .5) * 30, y: top + H * .69 + (h1(2510 + i) - .5) * 14,
               ang: h1(2515 + i) * .3, len: 1.15 * u, wid: .5 * u,
               c: C.pink, seed: 2520 + i + sx, type: 2, alpha: (.12 + open * .07) });
  flush({ t, cam });
  // 睁眼那一下：光从眼里溢到脸上
  if (open > .05) {
    for (let i = 0; i < 4; i++)
      dyn.push({ x: cx - 320 + i * 210, y: 480, ang: 1.57, len: 1240, wid: 120 - i * 16, c: C.lemon,
                 seed: 2510 + i, type: 0, alpha: .05 * open, taper: .9 });
    flush({ t, cam });
  }
}
const R2 = px => 236;

// SH28 35.55–37.49 一拍一颗星，从右下往左上点亮整个夜
function SH28(t, lt) {
  const cam = { x: 960, y: 520, zoom: lerp(1.1, .96, ss(seg(t, 35.55, 37.49))) };
  P.nightField(dyn, { seed: 1060, t, dust: 1.2 });
  flush({ t, cam });
  // 他抬手
  P.clawd(dyn, 760, 884, 24, { eyes: 'shine', mouth: 'smile', aR: 1.45, aL: -.4, seed: 41, glow: C.lemon });
  flush({ t, cam });
  // 底下的暗星（还没被点亮的那片夜）
  for (let i = 0; i < 90; i++) {
    const x = h1(i * 3.7) * 2100 - 90, y = h1(i * 7.9) * 900 - 30;
    P.star(dyn, x, y, 2.8 + h1(i * 11) * 4.5, mixc(C.indigo, C.white, .35), 1150 + i * 3, .55);
  }
  flush({ t, cam });
  // 星星：每半拍一颗
  for (let i = 0; i < 26; i++) {
    const tt = beatT(81 + i * .5);
    if (t < tt) break;
    const u = i / 26;
    const x = lerp(1500, 320, u) + (h1(i * 3) - .5) * 120;
    const y = lerp(980, 120, u) + (h1(i * 7) - .5) * 90;
    const born = clamp((t - tt) * 4, 0, 1);
    P.star(dyn, x, y, (14 + h1(i * 11) * 22) * (0.4 + born * .6), C.gold, 1070 + i * 7, 1);
    if (born < 1) {
      dyn.push({ x, y, ang: 0, len: 60 + born * 160, wid: 20 + born * 30, c: C.lemon, seed: 1100 + i, type: 2, alpha: (1 - born) * .8 });
    }
    // 连到指尖的光线
    dyn.push({ x: (x + 760) / 2, y: (y + 800) / 2, ang: Math.atan2(y - 800, x - 760), len: Math.hypot(x - 760, y - 800) * .9,
               wid: 3, c: C.gold, seed: 1130 + i, type: 0, alpha: .18 * (1 - u), taper: .9 });
  }
  flush({ t, cam });
}

// SH29 37.49–38.54 满天星
function SH29(t, lt) {
  const k = seg(t, 37.49, 38.54);
  const cam = { x: 960, y: 520, zoom: lerp(.96, 1.02, k) };
  P.nightField(dyn, { seed: 1060, t, dust: 1.0 });
  flush({ t, cam });
  for (let i = 0; i < 120; i++) {
    const x = h1(i * 3.1) * 2100 - 90, y = h1(i * 7.3) * 1000 - 40;
    const tw = .55 + .45 * Math.sin(t * 2.4 + i * 1.7);
    P.star(dyn, x, y, (3 + h1(i * 11) * 9) * tw, i % 7 === 0 ? C.lemon : C.gold, 1200 + i * 5, .85);
  }
  flush({ t, cam });
  P.clawd(dyn, 960, 918, 18, { eyes: 'starstruck', mouth: 'smile', aR: .9, aL: -.4, seed: 43, glow: C.lemon });
  flush({ t, cam });
}

// SH30 38.54–39.69 一刀劈开天海，纸船落在浪尖
function SH30(t, lt) {
  const k = ss(seg(t, 38.54, 39.5));
  const cam = { x: 960, y: lerp(460, 620, k), zoom: lerp(1.0, 1.14, k) };
  P.sky(dyn, { y0: -200, y1: 520, cols: [C.night, C.deep], n: 14, seed: 61 });
  P.sea(dyn, { y0: 500, y1: 1240, n: 16, t, seed: 63, foam: 1.2 });
  flush({ t, cam });
  // 劈开的口子
  const gw = lerp(6, 260, eo(seg(t, 38.6, 39.1)));
  for (let i = 0; i < 12; i++) {
    dyn.push({ x: 960 + (h1(i * 3) - .5) * 30, y: 120 + i * 90, ang: 1.57, len: gw * 1.6 + 200, wid: 96,
               c: C.gold, c2: C.lemon, seed: 1250 + i, type: 0, taper: .06, skew: .7, alpha: .9 });
  }
  flush({ t, cam });
  const by = lerp(260, 760, eo(seg(t, 38.75, 39.3)));
  P.boat(dyn, 960, by, 46, { seed: 1260, rot: Math.sin(t * 3) * .12 });
  flush({ t, cam });
}

// SH31 39.69–42.18 船在浪里漂，远处是港口的灯
function SH31(t, lt) {
  const k = seg(t, 39.69, 42.18);
  const cam = { x: 960, y: lerp(600, 560, k), zoom: lerp(1.14, 1.0, ss(k)) };
  P.sky(dyn, { y0: -200, y1: 540, cols: [C.night, C.deep, C.sea], n: 16, seed: 61 });
  P.sea(dyn, { y0: 520, y1: 1240, n: 18, t, seed: 63, foam: 1.3 });
  flush({ t, cam });
  // 港口的灯
  const lampOn = ss(seg(t, 40.9, 41.4));
  for (let i = 0; i < 9; i++) {
    const x = 1180 + i * 68, y = 520 + Math.sin(i) * 8;
    dyn.push({ x, y, ang: 0, len: 26 + lampOn * 14, wid: 20 + lampOn * 14, c: C.gold, seed: 1270 + i, type: 2, alpha: .5 + lampOn * .5 });
    // 水中倒影
    for (let j = 0; j < 3; j++) dyn.push({ x, y: y + 26 + j * 22, ang: 0, len: 34 - j * 8, wid: 8, c: C.amber, seed: 1280 + i * 5 + j, type: 0, alpha: .5 - j * .12 });
  }
  flush({ t, cam });
  P.boat(dyn, lerp(700, 980, k), 760 + Math.sin(t * 2.6) * 26, 44, { seed: 1290, rot: Math.sin(t * 2.6 + 1) * .14 - .06 });
  flush({ t, cam });
}

// SH32 42.18–44.55 一柱金颜料升空，炸开成花火，碎屑变彩色的雨
function SH32(t, lt) {
  const k = seg(t, 42.18, 44.55);
  const cam = { x: 960, y: lerp(620, 480, ss(seg(t, 42.5, 43.3))), zoom: lerp(1.0, .94, k) };
  P.sky(dyn, { y0: -200, y1: 620, cols: [C.night, C.deep], n: 14, seed: 61 });
  P.sea(dyn, { y0: 620, y1: 1240, n: 12, t, seed: 63, foam: .8 });
  flush({ t, cam });
  const rise = seg(t, 42.2, 43.0);
  const burst = seg(t, 43.0, 43.6);
  // 升起的柱
  if (rise > 0 && burst < 1) {
    const y = lerp(620, 300, eo(rise));
    dyn.push({ x: 960, y, ang: 1.57, len: 120 + rise * 260, wid: 40, c: C.gold, c2: C.lemon, seed: 1300, type: 0, taper: .5, alpha: .95 });
    flush({ t, cam });
  }
  // 炸开
  if (burst > 0) {
    const r = lerp(60, 420, eo(burst));
    P.firework(dyn, { x: 960, y: 320, r, n: 34, seed: 1310, alpha: .95 });
    flush({ t, cam });
  }
  // 彩色雨
  if (t > 43.5) {
    const rk = seg(t, 43.5, 44.55);
    const pal = [C.rose, C.orange, C.gold, C.jade, C.cobalt, C.violet, C.pink];
    for (let i = 0; i < 70; i++) {
      const x = 200 + h1(i * 3.7) * 1700;
      const y = 320 + ((t - 43.5) * 420 * (0.6 + h1(i * 7)) + h1(i * 11) * 600) % 900;
      dyn.push({ x, y, ang: 1.2, len: 22 + h1(i * 13) * 26, wid: 7 + h1(i * 17) * 9,
                 c: pal[i % 7], seed: 1320 + i, type: 0, alpha: .85, taper: .8 });
    }
    flush({ t, cam });
  }
}

// SH33 44.55–45.72 雨落进海把海染成七色，一道彩虹从海里升起
function SH33(t, lt) {
  const k = seg(t, 44.55, 45.72);
  const cam = { x: 960, y: lerp(560, 520, k), zoom: lerp(1.0, .9, k) };
  P.sky(dyn, { y0: -200, y1: 640, cols: [C.night, C.deep], n: 14, seed: 61 });
  // 被染成七色的海
  const pal = [C.rose, C.orange, C.gold, C.jade, C.cobalt, C.violet];
  for (let i = 0; i < 14; i++) {
    const y = 640 + i * 44;
    dyn.push({ x: 960, y, ang: 0, len: 2500, wid: 56, c: pal[i % 6], c2: shade(pal[i % 6], .7), seed: 1400 + i, type: 0, taper: .12, alpha: .7 });
  }
  flush({ t, cam });
  const rk = eo(seg(t, 44.6, 45.5));
  P.rainbowArc(dyn, { cx: 960, cy: 1500, r: 820 + rk * 340, seed: 1420, alpha: .95, thick: 1.1, wob: Math.sin(t * 1.7) * 6, a0: Math.PI * 1.16, a1: Math.PI * 1.84 });
  flush({ t, cam });
}

// SH34 45.72–46.53 切回他，站在海边，彩虹在身后
function SH34(t, lt) {
  const k = seg(t, 45.72, 46.53);
  const cam = { x: 960, y: 600, zoom: lerp(1.02, 1.16, k) };
  P.sky(dyn, { y0: -200, y1: 600, cols: [C.deep, C.sky], n: 14, seed: 65 });
  P.sea(dyn, { y0: 600, y1: 1240, n: 12, t, seed: 67, foam: .9 });
  P.rainbowArc(dyn, { cx: 960, cy: 1560, r: 860, seed: 1440, alpha: .7, thick: .9, wob: Math.sin(t * 1.4) * 5, a0: Math.PI * 1.14, a1: Math.PI * 1.86 });
  flush({ t, cam });
  P.clawd(dyn, 960, 886, 26, { eyes: 'relieved', mouth: 'smile', aL: -.35, aR: -.2, seed: 45 });
  flush({ t, cam });
}

// SH35 46.53–48.44 身体变透明，胸腔里露出一片天空
function SH35(t, lt) {
  const k = ss(seg(t, 46.53, 48.44));
  const cam = { x: 960, y: 560, zoom: lerp(1.1, 1.5, k) };
  P.sky(dyn, { y0: -200, y1: 620, cols: [C.deep, C.sky], n: 14, seed: 65 });
  P.sea(dyn, { y0: 620, y1: 1240, n: 12, t, seed: 67, foam: .8 });
  flush({ t, cam });
  // 他站着，颜色被抽走，露出来
  const fade = lerp(1, .12, k);
  P.clawd(dyn, 960, 900, 30, { eyes: 'relieved', mouth: 'smile', aL: -.3, aR: -.2, seed: 47, alpha: fade });
  flush({ t, cam });
  // 胸腔里那一小片天
  const rr = lerp(26, 240, k);
  for (let i = 0; i < 26; i++) {
    const a = h1(i * 3.3) * Math.PI * 2, d = h1(i * 7.7) * rr;
    dyn.push({ x: 960 + Math.cos(a) * d, y: 790 + Math.sin(a) * d * .9, ang: 0, len: 60, wid: 40,
               c: mixc(C.sky, C.cloud, h1(i * 11)), seed: 1460 + i, type: 0, taper: .3, alpha: .8 });
  }
  for (let i = 0; i < 5; i++) P.star(dyn, 960 + (h1(i * 5) - .5) * rr * 1.6, 790 + (h1(i * 9) - .5) * rr * 1.4, 6 + k * 8, C.gold, 1490 + i, .9);
  flush({ t, cam });
}

// SH36 48.44–50.06 天空铺满整个画面，云被风吹动
function SH36(t, lt) {
  const k = seg(t, 48.44, 50.06);
  const cam = { x: lerp(960, 1060, k), y: lerp(560, 520, k), zoom: lerp(1.0, 1.06, k) };
  P.sky(dyn, { y0: -220, y1: 1300, cols: [C.deep, C.sky, C.cloud], n: 22, seed: 67 });
  flush({ t, cam });
  // 云：有体积的团块，被风斜着推（留出蓝色的空，云才不糊成一片）
  for (let i = 0; i < 11; i++) {
    const x = ((h1(i * 7) * 2500 + t * 52 * (0.5 + h1(i * 11))) % 2800) - 420;
    const y = 90 + Math.pow(h1(i * 13), .8) * 620;
    P.cloudPuff(dyn, { x, y, s: .55 + h1(i * 17) * .8, seed: 1500 + i, alpha: .78 });
  }
  // 几颗星
  for (let i = 0; i < 10; i++) P.star(dyn, h1(i * 5) * 2000, h1(i * 9) * 400, 8, C.gold, 1540 + i, .8);
  flush({ t, cam });
}

// SH37 50.06–51.61 拉远，露出画布的边和画架
function SH37(t, lt) {
  const k = ss(seg(t, 50.06, 51.61));
  const cam = { x: 960, y: lerp(540, 540, k), zoom: lerp(1.0, .58, k) };
  // 画布外的房间
  P.fillArea(dyn, -600, -500, 2600, 1700, shade(C.night, .8), { n: 10, seed: 1560 });
  flush({ t, cam });
  // 画布上的天空
  P.sky(dyn, { x0: 340, x1: 1580, y0: 150, y1: 930, cols: [C.deep, C.sky, C.cloud], n: 14, seed: 67 });
  P.canvasEdge(dyn, { x0: 340, y0: 150, x1: 1580, y1: 930, seed: 1565 });
  flush({ t, cam });
  // 掠射光扫过整张画布
  const lx = lerp(200, 1800, ss(seg(t, 50.3, 51.4)));
  dyn.push({ x: lx, y: 540, ang: .02, len: 260, wid: 900, c: C.lemon, c2: C.amber, seed: 1570, type: 0, alpha: .26, taper: .85 });
  flush({ t, cam });
}

// SH38 51.61–55.28 光收拢：一刀把天空刮掉，只剩画布和左下角那一点粉
function SH38(t, lt) {
  const k = seg(t, 51.61, 55.28);
  const cam = { x: 960, y: 540, zoom: lerp(.58, .545, ss(k)) };
  // 房间：画布外的暗墙（和 SH37 同一个空间，拉远之后我们知道“那只是一张画”）
  P.fillArea(dyn, -900, -700, 2900, 1900, shade(C.night, .78), { n: 10, seed: 1560 });
  flush({ t, cam });
  // 画布上的天空：被一刀刀刮掉
  const wipe = ss(seg(t, 52.0, 53.55));
  const xEdge = lerp(1620, 300, wipe);
  P.sky(dyn, { x0: 340, x1: 1580, y0: 150, y1: 930, cols: [C.deep, C.sky, C.cloud], n: 14, seed: 67,
               alpha: lerp(1, .35, ss(seg(t, 51.7, 53.4))) });
  flush({ t, cam });
  // 刮掉的那一半：露出底料
  if (wipe > 0) {
    for (let i = 0; i < 18; i++) {
      const yy = 150 + i * 44;
      dyn.push({ x: (xEdge + 1620) / 2, y: yy, ang: 0, len: 1620 - xEdge, wid: 46,
                 c: C.canvas, c2: C.canvasDark, seed: 1700 + i * 3, type: 0, taper: .12, alpha: .96 });
    }
    flush({ t, cam });
    // 刃口
    dyn.push({ x: xEdge, y: 540, ang: 1.57, len: 800, wid: 12, c: C.greyLight, c2: C.white,
               seed: 1740, type: 0, alpha: .8, taper: .2 });
    flush({ t, cam });
  }
  // 画布四条边外再铺一遍暗墙，把天空溢出来的笔触压回画布里
  const ROOM = shade(C.night, .78);
  P.fillArea(dyn, -900, -640, 2900, 158, ROOM, { n: 4, seed: 1561 });
  P.fillArea(dyn, -900, 922, 2900, 1760, ROOM, { n: 4, seed: 1562 });
  P.fillArea(dyn, -900, 150, 360, 930, ROOM, { n: 3, seed: 1563 });
  P.fillArea(dyn, 1560, 150, 2900, 930, ROOM, { n: 3, seed: 1564 });
  // 画布边 + 画架的腿
  P.canvasEdge(dyn, { x0: 340, y0: 150, x1: 1580, y1: 930, seed: 1565 });
  dyn.push({ x: 700, y: 1180, ang: 1.35, len: 420, wid: 26, c: shade(C.ochre, .55), seed: 1750, type: 0, taper: .2 });
  dyn.push({ x: 1220, y: 1180, ang: 1.79, len: 420, wid: 26, c: shade(C.ochre, .5), seed: 1751, type: 0, taper: .2 });
  dyn.push({ x: 960, y: 1010, ang: 0, len: 900, wid: 22, c: shade(C.ochre, .62), seed: 1752, type: 0, taper: .2 });
  flush({ t, cam });
  // 那一点粉，始终不褪
  const pulse = .6 + .4 * Math.sin(t * 2.4);
  for (let i = 0; i < 3; i++)
    dyn.push({ x: 400, y: 872, ang: 0, len: 78 - i * 18, wid: 70 - i * 18,
               c: mixc(C.pink, C.white, .25 * i), seed: 1618 + i, type: 2, alpha: .5 - i * .12 });
  dyn.push({ x: 400, y: 872, ang: 0, len: 34, wid: 32, c: C.pink, seed: 1620, type: 2, alpha: .95 });
  P.dabs(dyn, { n: 6, x: 400, y: 872, r: 62 * pulse, cols: [C.pink, C.pinkDeep], seed: 1621, alpha: .5 * pulse });
  flush({ t, cam });
}

// ============ 镜头表（起, 止, 函数, 转场） ============
// 转场六种：劈 split / 竖劈 vsplit / 刮 scrape / 甩 whip / 同形切 match / 盖 cover（全片仅一次）
const SHOTS = [
  [0.00, 0.43, NEWLOOK ? SH01N : SH01, null],
  [0.43, 0.87, NEWLOOK ? SH02N : SH02, null],
  [0.87, 1.31, SH03, null],
  [1.31, 2.19, SH04, { m: 'whip', axis: 'y', dir: [0, -1], c: C.ice }],                 // 镜头跟着砸进海
  [2.19, 3.34, SH05, { m: 'match', shape: 'band', y: 500, c: C.ice }],                   // 海接海：地平线同形切
  [3.34, 4.41, SH06, { m: 'split', c: C.deep }],                                         // 白天被劈成两半，夜从缝里进来
  [4.41, 5.42, SH07, null], [5.42, 6.16, SH08, null],
  [6.16, 7.22, SH09, null], [7.22, 8.38, SH10, null],
  [8.38, 10.32, SH11, { m: 'whip', dir: [-1, 0], c: C.pink }],                           // 甩镜头跟上他起跑
  [10.32, 11.90, SH12, { m: 'split', c: C.sand }],                                       // 彩色世界劈开，露出灰岸
  [11.90, 13.92, SH13, { m: 'scrape', c: C.grey }],                                      // 颜色被一刀刀刮走
  [13.92, 15.43, SH14, null], [15.43, 16.75, SH15, null], [16.75, 17.15, SH16, null],
  [17.15, 18.52, SH17, { m: 'whip', dir: [1, 0], c: C.terraDark }],                      // 甩进特写
  [18.52, 19.78, SH18, null],
  [19.78, 21.61, SH19, { m: 'match', shape: 'ring', x: 960, y: 470, r0: 130, c: C.pink }],   // 圆接圆，切进瞳孔
  [21.61, 23.30, SH20, null],
  [23.30, 24.00, SH21, { m: 'vsplit', c: C.darkred }],                                   // 黑幕上下劈开（招牌动作·大）
  [24.00, 26.90, SH22, null], [26.90, 28.02, SH23, null],
  [28.02, 30.43, SH24, null], [30.43, 31.60, SH25, null],
  [31.60, 33.78, SH26, { m: 'cover', v: 1, c: C.black }],                                // 黑压下来（全片唯一一次盖）
  [33.78, 35.55, SH27, null], [35.55, 37.49, SH28, null],
  [37.49, 38.54, SH29, { m: 'match', shape: 'ring', x: 960, y: 520, r0: 220, grow: 260, c: C.gold }],
  [38.54, 39.69, SH30, null],
  [39.69, 42.18, SH31, { m: 'match', shape: 'ring', x: 960, y: 760, r0: 70, grow: 150, c: C.gold }],  // 纸船接纸船
  [42.18, 44.55, SH32, null], [44.55, 45.72, SH33, null],
  [45.72, 46.53, SH34, { m: 'whip', dir: [-1, 0], c: C.rose }],
  [46.53, 48.44, SH35, null],
  [48.44, 50.06, SH36, { m: 'vsplit', c: C.sky }],                                       // 天空上下撑开占满画幅
  [50.06, 51.61, SH37, null], [51.61, 55.28, SH38, null],
];

function shotAt(t) {
  for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i][0] && t < SHOTS[i][1]) return i;
  return SHOTS.length - 1;
}

// —— 劈开的刃口：切口露出的画布层 + 颜料厚度 + 缝口亮边 + 起手一瞬的白闪
function seamFX(t, k, m, tr, i, s) {
  const cam = CAM(), fade = 1 - k * .75;
  if (m === 'split') {
    const L = tr.line ?? 960;
    for (const sd of [-1, 1]) {
      const ex = L + sd * s;
      for (let j = 0; j < 12; j++) {
        const r1 = h1(i * 37 + j * 5.3), r2 = h1(i * 11 + j * 17.9), r3 = h1(i * 71 + j * 3.1);
        if (r3 < .18) continue;                                  // 空掉几个，破掉等距的"拉链感"
        const yy = -180 + ((j + r1 * 1.2) / 12) * 1460;
        dyn.push({ x: ex + sd * (6 + r2 * 40), y: yy, ang: sd > 0 ? Math.PI - .1 - r2 * .3 : .1 + r2 * .3,
                   len: 14 + Math.pow(r2, 2.4) * 170, wid: 6 + r1 * 30,
                   c: mixc(C.canvas, C.canvasDark, r1), c2: C.canvasDark,
                   seed: 6000 + i * 40 + j, type: 0, taper: .55 + r2 * .3, alpha: (.3 + r1 * .35) * fade, hgt: 1.1 });
      }
      dyn.push({ x: ex - sd * 10, y: 540, ang: Math.PI / 2, len: 1560, wid: 34,
                 c: shade(tr.c || C.deep, .55), seed: 6050 + i, type: 0, alpha: .5 * fade, taper: .12, skew: .3 });
      dyn.push({ x: ex + sd * 2, y: 540, ang: Math.PI / 2, len: 1500, wid: 7,
                 c: mixc(tr.c || C.deep, C.white, .55), seed: 6060 + i, type: 0, alpha: .45 * fade, taper: .3 });
    }
    const fl = 1 - seg(k, 0, .16);
    if (fl > 0) for (let j = 0; j < 5; j++)
      dyn.push({ x: L + (j - 2) * 8, y: 540, ang: Math.PI / 2, len: 700 + h1(j * 3 + i) * 500,
                 wid: 26 + h1(j * 7) * 40, c: C.white, seed: 6070 + i * 5 + j, type: 0, alpha: .3 * fl, taper: .4 });
  } else {
    const L = tr.line ?? 540;
    for (const sd of [-1, 1]) {
      const ey = L + sd * s;
      for (let j = 0; j < 12; j++) {
        const r1 = h1(i * 41 + j * 3.7), r2 = h1(i * 19 + j * 23.3), r3 = h1(i * 67 + j * 2.9);
        if (r3 < .18) continue;
        const xx = -180 + ((j + r1 * 1.2) / 12) * 2280;
        dyn.push({ x: xx, y: ey + sd * (6 + r2 * 40), ang: sd > 0 ? -Math.PI / 2 + .1 + r2 * .3 : Math.PI / 2 - .1 - r2 * .3,
                   len: 14 + Math.pow(r2, 2.4) * 170, wid: 6 + r1 * 30,
                   c: mixc(C.canvas, C.canvasDark, r1), c2: C.canvasDark,
                   seed: 6000 + i * 40 + j, type: 0, taper: .55 + r2 * .3, alpha: (.3 + r1 * .35) * fade, hgt: 1.1 });
      }
      dyn.push({ x: 960, y: ey - sd * 10, ang: 0, len: 2400, wid: 34,
                 c: shade(tr.c || C.darkred, .55), seed: 6150 + i, type: 0, alpha: .5 * fade, taper: .12, skew: .3 });
      dyn.push({ x: 960, y: ey + sd * 2, ang: 0, len: 2400, wid: 7,
                 c: mixc(tr.c || C.darkred, C.white, .45), seed: 6160 + i, type: 0, alpha: .4 * fade, taper: .3 });
    }
    const fl = 1 - seg(k, 0, .16);
    if (fl > 0) for (let j = 0; j < 5; j++)
      dyn.push({ x: 960, y: L + (j - 2) * 8, ang: 0, len: 1600 + h1(j * 3 + i) * 600,
                 wid: 24 + h1(j * 7) * 34, c: C.white, seed: 6170 + i * 5 + j, type: 0, alpha: .28 * fl, taper: .4 });
  }
  flush({ t, cam });
}

// —— 刮的拖影：细长的刀痕在画面上掠过
function smearFX(t, k, tr, i) {
  const cam = CAM(), a = .3 * (1 - k);
  for (let j = 0; j < 14; j++) {
    const yy = -60 + h1(i * 13 + j * 7.7) * 1200;
    const dir = j % 2 ? 1 : -1;
    dyn.push({ x: 960, y: yy, ang: dir > 0 ? 0 : Math.PI, len: 500 + h1(j * 11 + i) * 900,
               wid: 3 + h1(j * 13) * 5, c: mixc(tr.c || C.grey, C.white, h1(j * 3) * .5),
               seed: 6300 + i * 20 + j, type: 3, alpha: a, taper: .4 });
  }
  flush({ t, cam });
}

// —— 甩的速度线：沿运动方向的细长拖影
function whipFX(t, k, tr, i) {
  const cam = CAM(), d = tr.dir || [1, 0];
  const a = .22 * (1 - k), ang = Math.atan2(d[1], d[0]);
  for (let j = 0; j < 16; j++) {
    dyn.push({ x: 300 + h1(i * 17 + j * 5.1) * 1400, y: -80 + h1(i * 29 + j * 9.3) * 1240,
               ang, len: 420 + h1(j * 7 + i) * 760 * (.3 + eo(k)), wid: 4 + h1(j * 3) * 7,
               c: mixc(tr.c || C.white, C.white, .5), seed: 6400 + i * 20 + j, type: 3, alpha: a, taper: .35 });
  }
  flush({ t, cam });
}

// —— 同形切：一个扩开并消散的环（或带），把两个镜头的"同一个形状"接住
function matchFX(t, lt, tr, i) {
  const k = clamp(lt / .24, 0, 1);
  if (k >= 1) return;
  const cam = CAM(), c = tr.c || C.gold;
  if (tr.shape === 'band') {
    const y = tr.y ?? 520, w = 30 + eo(k) * 190;
    for (const sd of [-1, 1]) for (let j = 0; j < 12; j++) {
      dyn.push({ x: -100 + j * 190 + h1(i + j * 3) * 60, y: y + sd * w, ang: 0, len: 240, wid: 10,
                 c, seed: 6500 + i * 30 + j + sd * 12, type: 0, alpha: .7 * (1 - k), taper: .5 });
    }
  } else {
    const x = tr.x ?? 960, y = tr.y ?? 540, r = (tr.r0 ?? 90) + eo(k) * (tr.grow ?? 210);
    for (let j = 0; j < 26; j++) {
      const a = j / 26 * Math.PI * 2;
      dyn.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, ang: a + 1.57, len: 34, wid: 12,
                 c, c2: mixc(c, C.white, .3), seed: 6600 + i * 30 + j, type: 0, alpha: .8 * (1 - k), taper: .4 });
    }
  }
  flush({ t, cam });
}

const TRDUR = { split: .34, vsplit: .42, scrape: .30, whip: .22, match: .24, cover: .16 };

function frame(t) {
  const i = shotAt(t);
  const [t0, t1, fn, tr] = SHOTS[i];
  const lt = t - t0;
  E.begin();
  TR = null; SHIFT = null;
  const m = tr ? tr.m : null;
  if (m && m !== 'cover' && m !== 'match' && lt < TRDUR[m]) {
    const k = lt / TRDUR[m];
    // 底层：新一镜先画（甩镜头时从画外滑进来）
    if (m === 'whip') {
      const d = tr.dir || [1, 0], amt = (tr.axis === 'y' ? 2400 : 2800);
      SHIFT = [d[0] * amt * (1 - eo(k)), d[1] * amt * (1 - eo(k))];
    }
    fn(t, lt);
    SHIFT = null;
    // 上层：上一镜被劈开 / 刮走 / 甩出
    const prev = SHOTS[i - 1];
    let sv = 0;
    if (m === 'whip') {
      const d = tr.dir || [1, 0], amt = (tr.axis === 'y' ? 2400 : 2800);
      SHIFT = [-d[0] * amt * eo(k), -d[1] * amt * eo(k)];
    } else if (m === 'split' || m === 'vsplit') {
      sv = (m === 'split' ? 1180 : 760) * Math.pow(k, 1.9);
      TR = splitCtx(m, tr, k, sv);
    } else if (m === 'scrape') TR = scrapeCtx(tr, k);
    prev[2](t, t - prev[0]);
    TR = null; SHIFT = null;
    // 转场的刃口 / 拖影特写层
    if (m === 'split' || m === 'vsplit') seamFX(t, k, m, tr, i, sv);
    if (m === 'scrape') smearFX(t, k, tr, i);
    if (m === 'whip') whipFX(t, k, tr, i);
  } else {
    fn(t, lt);
    if (m === 'cover' && lt < .16) {
      const p = 1 - lt / 0.16;
      if (tr.v) P.sweepV(dyn, { p, c: tr.c, seed: 900 + i, alpha: .92, n: 12 });
      else P.sweep(dyn, { p, dir: 1, c: tr.c, seed: 900 + i, alpha: .92 });
      flush({ t, cam: CAM() });
    }
    if (m === 'match') matchFX(t, lt, tr, i);
  }
  E.finish(post(t));
  if (!(/[?&]nosub/.test((typeof location !== 'undefined' && location.search) || ''))) updateSub(t);   // ?nosub 出无字幕帧（封面底图）
}

const HIGH_SUB = new Set([2, 6, 7, 11, 15]);   // 特写镜头：字幕上移，不压脸

function updateSub(t) {
  let idx = -1;
  for (let i = 0; i < LINES.length; i++) if (t >= LINES[i].s && t < LINES[i].e) { idx = i; break; }
  if (idx !== curLine) {
    curLine = idx;
    if (idx < 0) { subEl.style.opacity = 0; spans = []; }
    else {
      subEl.innerHTML = '';
      spans = [...LINES[idx].txt].map(ch => { const s = document.createElement('span'); s.textContent = ch; s.style.opacity = 0; subEl.appendChild(s); return s; });
      subEl.style.opacity = 1;
      subEl.style.bottom = HIGH_SUB.has(idx) ? '212px' : '92px';
    }
  }
  if (idx >= 0) {
    const a = LINES[idx].s;
    spans.forEach((s, k) => { s.style.opacity = t >= a + k * 0.020 ? 1 : 0; });
  }
}
