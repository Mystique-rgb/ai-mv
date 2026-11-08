// world.js — 纸做的长安：城墙、城门、街市、灯笼、山、云、星、印章、碎纸
import { PAL, canvas, piece, fill, cut, cutLine, cutTaper, trace, Pl, P, inset, ellipsePoly, paperShadow, noShadow, finishPaper, rnd, paperGrain, fillPaper } from '../engine/paper.js';
import { sawRow, sawEdge, crescent, crescentPts, swirl, cloudCut, plum, rosette, coin, dots, along, taper } from '../engine/motifs.js';
import { put, mul, T as Tm, R, S } from '../engine/rig.js';
import { tuanhua, tuanhuaHoles } from '../engine/tuanhua.js';

export const W = 1920, H = 1080;
export const cam = (x, y, z) => [z, 0, 0, z, 960 - x * z, 540 - y * z];

export const PAL2 = {
  red: '#d2201f', deep: '#8d0f1c', mid: '#a8111f', far: '#6e0c18', wax: '#b3242a',
  rice: '#f2e8d0', indigo: '#1c2446', ink: '#101426', gold: '#d9a93f', cream: '#fff1d6',
  pink: '#e0748c', pinkDeep: '#8e3350', grey: '#6b6472', shadow: 'rgba(40,4,10,.42)'
};

const CACHE = {};
const cp = (k, f) => (CACHE[k] || (CACHE[k] = f()));

// 放一张纸片：世界坐标 (x,y) 为锚点，s 缩放，rot 旋转
export function place(g, C, p, x, y, s = 1, rot = 0, opt = {}) {
  const M = mul(C, mul(Tm(x, y), mul(R(rot), S(s * (opt.sx || 1), s))));
  put(g, p, M, { shadow: opt.shadow ?? 1, shadowScale: Math.abs(s) * (opt.ss || 1), alpha: opt.alpha, shadowCol: opt.shadowCol });
  return M;
}

// ---------- 背景纸 ----------
export function bg(g, kind = 'rice', C = [1, 0, 0, 1, 0, 0], tint = null) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  fillPaper(g, kind, 0, 0, W, H, C, tint);
  g.restore();
}

// ---------- 城墙 + 城楼 + 门洞 ----------
export const wallPiece = () => cp('wall', () => piece([-1600, -900, 1600, 80], g => {
  // 垛口：顶上一条锯齿
  const top = [];
  for (let x = -1600; x <= 1600; x += 80) top.push([x, x % 160 ? -520 : -600]);
  const body = Pl([...top, [1600, 0], [860, 0], [860, -300], [180, -300], [180, -240], [-180, -240], [-180, -300], [-860, -300], [-860, 0], [-1600, 0]], true, .8, 3);
  fill(g, q => trace(q, body), PAL2.mid);
  inset(g, body, 22, 10, PAL2.mid);
  // 砖缝
  for (let y = -480; y < -20; y += 62) cutLine(g, 9, q => { q.moveTo(-1580, y); q.lineTo(1580, y + 3); });
  for (let x = -1560; x < 1600; x += 126) for (let y = -480; y < -20; y += 62) cutLine(g, 7, q => { q.moveTo(x + (Math.floor(y / 62) % 2) * 63, y); q.lineTo(x + (Math.floor(y / 62) % 2) * 63, y + 62); });
  // 门洞（真正镂空，透出后面的街）
  cut(g, q => { q.moveTo(-236, 0); q.lineTo(-236, -300); q.quadraticCurveTo(0, -520, 236, -300); q.lineTo(236, 0); q.closePath(); });
  // 门钉（阳刻小方块留下的纸点）
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const x = s * (270 + i % 3 * 46), y = -170 - Math.floor(i / 3) * 92; fill(g, q => { q.rect(x - 12, y - 12, 24, 24); }, PAL2.mid); }
  // 城楼
  const roof = Pl([[-620, -600], [-300, -760], [0, -800], [300, -760], [620, -600], [700, -560], [-700, -560]], true, .7, 11);
  fill(g, q => trace(q, roof), PAL2.red); inset(g, roof, 20, 9, PAL2.red);
  for (let x = -560; x <= 560; x += 70) taper(g, [[x * .96, -612], [x * .52, -742]], 9);
  fill(g, q => trace(q, Pl([[-380, -560], [380, -560], [380, -520], [-380, -520]], true, .5, 12)), PAL2.deep);
  // 匾额：一枚团花
  rosette(g, 0, -640, 46, 8, 0, .22);
}, { ss: 1.15, seed: 5 }));

// ---------- 街市（一层纸：屋顶、门脸、窗）----------
export const shopRow = (seed = 1) => cp('shop' + seed, () => piece([-1700, -760, 1700, 40], g => {
  let x = -1700;
  for (let i = 0; i < 9; i++) {
    const w = 300 + rnd(i, seed) * 140, h = 240 + rnd(i, seed + 3) * 190;
    // 墙
    const b = Pl([[x, 0], [x, -h], [x + w, -h], [x + w, 0]], true, .7, 20 + i);
    fill(g, q => trace(q, b), i % 2 ? PAL2.mid : PAL2.wax);
    inset(g, b, 16, 8, i % 2 ? PAL2.mid : PAL2.wax);
    // 门
    cut(g, q => { q.rect(x + w * .18, -h * .58, w * .26, h * .58); });
    // 窗（两扇，糊纸的格心）
    cut(g, q => { q.rect(x + w * .56, -h * .52, w * .3, h * .3); });
    for (let k = 1; k < 3; k++) { const wx = x + w * .56 + w * .3 * k / 3; fill(g, q => { q.rect(wx - 5, -h * .52, 10, h * .3); }, i % 2 ? PAL2.mid : PAL2.wax); fill(g, q => { q.rect(x + w * .56, -h * .52 + h * .1 * k, w * .3, 9); }, i % 2 ? PAL2.mid : PAL2.wax); }
    // 檐（翘角）
    const eave = Pl([[x - 46, -h], [x + w * .5, -h - 120], [x + w + 46, -h], [x + w + 96, -h + 40], [x + w * .5, -h - 40], [x - 96, -h + 40]], true, .6, 30 + i);
    fill(g, q => trace(q, eave), PAL2.deep); inset(g, eave, 14, 7, PAL2.deep);
    for (let k = 1; k < 7; k++) taper(g, [[x + w * k / 7, -h - 6], [x + w * k / 7, -h - 86]], 7);
    x += w + 26;
  }
}, { ss: 1.1, seed: 17 }));

// ---------- 灯笼（正面，带透光孔）----------
export const lantern = () => cp('lantern', () => piece([-150, -230, 150, 150], g => {
  const b = Pl([[-104, -150], [-116, -80], [-96, -10], [0, 6], [96, -10], [116, -80], [104, -150], [0, -176]], true, .5, 4);
  fill(g, q => trace(q, b), PAL2.red);
  cutLine(g, 7, q => { q.moveTo(-40, -160); q.lineTo(-52, -6); }); cutLine(g, 7, q => { q.moveTo(40, -160); q.lineTo(52, -6); });
  crescent(g, 0, -84, 74, Math.PI * 1.15, Math.PI * 1.85, 16);
  crescent(g, 0, -84, 74, Math.PI * .15, Math.PI * .85, 16);
  // 上下托
  fill(g, q => trace(q, Pl([[-52, -186], [52, -186], [44, -158], [-44, -158]], true, .4, 6)), PAL2.deep);
  fill(g, q => trace(q, Pl([[-44, -12], [44, -12], [52, 14], [-52, 14]], true, .4, 7)), PAL2.deep);
  // 穗
  for (const s of [-1, 0, 1]) taper(g, [[s * 12, 16], [s * 20, 96], [s * 8, 146]], 9);
  cutLine(g, 8, q => { q.moveTo(0, -176); q.lineTo(0, -206); });
}, { ss: 2, seed: 21 }));

// ---------- 山（三层纸）----------
export const mountain = (seed = 1) => cp('mtn' + seed, () => piece([-1800, -900, 1800, 60], g => {
  const pts = [[-1800, 0]];
  for (let x = -1800; x <= 1800; x += 150) pts.push([x, -140 - 420 * Math.abs(Math.sin(x * .0016 + seed * 2.1)) * (.6 + .4 * rnd(x, seed))]);
  pts.push([1800, 0]);
  const p = Pl(pts, true, .9, seed);
  fill(g, q => trace(q, p), PAL2.far); inset(g, p, 18, 9, PAL2.far);
  for (let x = -1700; x < 1700; x += 220) taper(g, [[x, -80], [x + 60, -220]], 8);
}, { ss: 1.1, seed: 33 + seed }));

// ---------- 云（卷云纹）----------
export const cloud = (seed = 1) => cp('cloud' + seed, () => piece([-300, -160, 300, 60], g => {
  const b = Pl([[-250, 0], [-250, -60], [-170, -96], [-60, -104], [40, -96], [150, -110], [240, -80], [250, 0]], true, .6, seed);
  fill(g, q => trace(q, b), PAL2.mid); inset(g, b, 12, 6, PAL2.mid);
  cloudCut(g, -120, -52, 40, 9, 0, 1); cloudCut(g, 120, -56, 34, 8, Math.PI, -1);
}, { ss: 1.8, seed: 41 + seed }));

// ---------- 星（四角纸星）----------
export const star = (seed = 1) => cp('star' + seed, () => piece([-120, -120, 120, 120], g => {
  const pts = []; for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 4, r = i % 2 ? 26 : 104; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
  const p = Pl(pts, true, .4, seed);
  fill(g, q => trace(q, p), PAL2.gold); inset(g, p, 8, 4, PAL2.gold);
}, { ss: 2.6, seed: 51 + seed }));

// ---------- 印章（阳刻两个字）----------
export const seal = () => cp('seal', () => piece([-260, -260, 260, 260], g => {
  const sq = Pl([[-230, -230], [230, -230], [230, 230], [-230, 230]], true, .9, 3);
  fill(g, q => trace(q, sq), PAL2.red);
  // 回纹边
  cutLine(g, 16, q => { q.rect(-196, -196, 392, 392); });
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) taper(g, [[sx * 214, sy * 176], [sx * 176, sy * 214]], 12);
  // 字：宿敌（剪纸阴刻，用同色纸把字镂空）
  g.save(); g.globalCompositeOperation = 'destination-out';
  g.font = '700 200px "Xingkai"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('宿', -70, -66); g.fillText('敌', 70, 70);
  g.restore();
  cutLine(g, 10, q => { q.moveTo(-40, -210); q.lineTo(40, -210); });
}, { ss: 2, seed: 61 }));

// ---------- 团花（整枚窗花）----------
export const flower = (col = PAL2.red) => cp('flower' + col, () => tuanhua(1.5, col, 71));
export const flowerHoles = () => cp('flowerholes', () => tuanhuaHoles(1.0));

// ---------- 碎纸 ----------
const SCRAP = [];
export function scrapPiece(i) {
  return cp('scrap' + i, () => piece([-30, -30, 30, 30], g => {
    const a = rnd(i, 3) * 6.28, n = 5 + Math.floor(rnd(i, 4) * 3), pts = [];
    for (let k = 0; k < n; k++) { const t = a + k / n * 6.283, r = 12 + rnd(i * 9 + k, 5) * 18; pts.push([Math.cos(t) * r, Math.sin(t) * r * (.6 + rnd(i, 6) * .6)]); }
    fill(g, q => trace(q, Pl(pts, true, .5, i)), i % 7 === 0 ? PAL2.gold : (i % 3 === 0 ? PAL2.deep : PAL2.red));
  }, { ss: 1.6, seed: 80 + i, edge: 1 }));
}
// 一片一片落下的碎纸：纯时间的函数
export function drawScraps(g, C, t, n, box, seed = 1, opt = {}) {
  const [x0, y0, x1, y1] = box, fall = opt.fall ?? 90, sway = opt.sway ?? 40;
  for (let i = 0; i < n; i++) {
    const sp = 22 + rnd(i, seed) * 46, ph = rnd(i, seed + 2) * 800;
    const x = x0 + ((rnd(i, seed + 1) * (x1 - x0) + Math.sin((t + ph) * .7) * sway) % (x1 - x0) + (x1 - x0)) % (x1 - x0);
    const y = y0 + ((rnd(i, seed + 3) * (y1 - y0) + t * sp) % (y1 - y0));
    const s = (.5 + rnd(i, seed + 4) * .9) * (opt.scale || 1);
    place(g, C, scrapPiece(i % 7), x, y, s, t * (1 + rnd(i, 9) * 2) + i, { shadow: .8 });
  }
}

// ---------- 小道具：纸伞 / 剑架 / 棋盘 ----------
export const umbrella = () => cp('umbrella', () => piece([-260, -320, 260, 60], g => {
  const top = Pl([[-250, -170], [-150, -260], [0, -286], [150, -260], [250, -170], [176, -150], [88, -132], [0, -126], [-88, -132], [-176, -150]], true, .6, 5);
  fill(g, q => trace(q, top), PAL2.pinkDeep); inset(g, top, 14, 7, PAL2.pinkDeep);
  for (let i = -3; i <= 3; i++) taper(g, [[i * 70, -280 + Math.abs(i) * 16], [i * 34, -132]], 7);
  fill(g, q => trace(q, Pl([[-6, -130], [6, -130], [6, 40], [-6, 40]], true, .4, 6)), PAL2.deep);
}, { ss: 2, seed: 91 }));

// ---------- 光：暖灯（投影到地面/墙面）----------
export function lampGlow(g, C, x, y, r, a = .55, col = 'rgba(255,196,120,') {
  g.save(); g.setTransform(...C); g.globalCompositeOperation = 'lighter';
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, col + a + ')'); gr.addColorStop(.5, col + a * .38 + ')'); gr.addColorStop(1, col + '0)');
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
// 纸片投影：把一枚窗花图案投在墙上（lighter）
export function projectFlower(g, C, x, y, s, a = .5) {
  g.save(); g.setTransform(...C); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a;
  g.drawImage(flowerHoles().c, x - 420 * s, y - 420 * s, 840 * s, 840 * s);
  g.restore();
}

export function warmUp() { wallPiece(); shopRow(1); lantern(); mountain(1); cloud(1); star(1); seal(); flower(); for (let i = 0; i < 7; i++) scrapPiece(i); umbrella(); }
