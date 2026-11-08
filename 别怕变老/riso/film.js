// 《别怕变老》· 孔版印刷 MV 时间轴（50.60s / 144.185 BPM / 30 小节）
// 每拍都有变化：表情/动作/运镜/套版 kick/网点档位/版 gate/滚筒
import { g, W, H, S, ink, inkA, layer, rrect, circle, ellipse, rect, line, poly, ring, blob, text, over } from './draw.js';
import { clamp, lerp, seg, ss, eio, eo, ei, back, hash } from '/core/lib.js';
import { clawd, feel, COL } from './clawd.js';
import { Y, R, B, YR, BR, BY, K, P, disc, field, bands, frame, phone, eyeChart, clock, fire, debris, poster, bench, lamp,
         cloud, hills, waves, sunburst, bird, spark4, grass, flower, tree, bunting, boat } from './scenes.js';
import { BPM, BEAT, BAR, BAR1, DUR, KICKS, SNARES, BIG, STOPS, BARS, SECTIONS } from './beats.js';
import { LINES } from './lines.js';
function eyeSpark(x, y, t) { g.save(); g.translate(x, y); const s = 30; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, rr = i % 2 ? s * .36 : s; const X = Math.cos(a) * rr, Yy = Math.sin(a) * rr; i ? g.lineTo(X, Yy) : g.moveTo(X, Yy); } g.closePath(); g.fillStyle = inkA([0, 0, 0]); g.fill(); g.restore(); }

export { DUR };

// ───────── 拍点工具 ─────────
export const bt = t => (t - BAR1) / BEAT;                 // 拍浮点（bar1 第一拍 = 0）
const ph = t => { const x = bt(t); return x - Math.floor(x); };
export const hit = (t, k = 1) => Math.pow(1 - ph(t * k), 2.2);   // 每拍衰减脉冲 1→0
export const bi = t => Math.floor(bt(t));
const step12 = t => Math.floor(t * 12) / 12;               // 角色 on twos（12fps）
const cam = (z, px = 960, py = 540, dx = 0, dy = 0) => g.setTransform(z, 0, 0, z, px * (1 - z) + dx, py * (1 - z) + dy);
const screen = () => g.setTransform(1, 0, 0, 1, 0, 0);

// ───────── 镜头表 ─────────
export const SHOTS = [
  ['open', 0, 2.88], ['mirror', 2.88, 4.53], ['phone', 4.53, 7.44], ['chart', 7.44, 11.61],
  ['slope', 11.61, 16.40], ['recall', 16.40, 19.12], ['bench', 19.12, 22.45], ['paper', 22.45, 25.62],
  ['clock', 25.62, 29.93], ['fingers', 29.93, 33.35], ['storm', 33.35, 36.39], ['fire', 36.39, 39.76],
  ['walk', 39.76, 43.28], ['close', 43.28, 47.20], ['shout', 47.20, 50.60],
];
export function shotAt(t) { for (const s of SHOTS) if (t >= s[1] && t < s[2]) return s; return SHOTS[SHOTS.length - 1]; }

// ───────── 套版：每镜一套固定 offset，鼓点上 kick，抽鼓时 drift ─────────
const BASE = [[0, 0], [4, -3], [-4, 3]];
function regist(t) {
  const si = SHOTS.findIndex(s => s[0] === shotAt(t)[0]);
  const off = BASE.map((b, i) => [b[0] + (hash(si * 3.1 + i) - .5) * 2.2, b[1] + (hash(si * 7.7 + i + 5) - .5) * 2.2]);
  for (const [tk, amp] of KICKS) {
    const x = t - tk; if (x < 0 || x > .42) continue;
    const e = Math.exp(-x * 12) * Math.cos(x * 30);
    for (let i = 0; i < 3; i++) {
      const a = hash(tk * 13 + i * 5) * 6.283;
      off[i][0] += Math.cos(a) * amp * e * (i ? 1 : .55);
      off[i][1] += Math.sin(a) * amp * e * (i ? 1 : .55);
    }
  }
  // 两处抽鼓：慢漂 → 回来那一下归位
  for (const s of STOPS) {
    const t0 = s.t, t1 = s.resume;
    if (t >= t0 - .02 && t < t1 + .7) {
      const d = t < t1 ? ss(seg(t, t0, t1)) : Math.exp(-(t - t1) * 15) * Math.cos((t - t1) * 38);
      const dv = [[-7, 6], [26, -14], [-24, 16]];
      for (let i = 0; i < 3; i++) { off[i][0] += dv[i][0] * d; off[i][1] += dv[i][1] * d; }
    }
  }
  return off;
}

// ───────── 版次：门 + 滚筒 ─────────
function plates(t) {
  const sweep = (a, b2 = .5, x0 = -80, x1 = W + 180) => lerp(x0, x1, eio(seg(t, a, a + b2)));
  const gateB = t < 1.95 ? 0 : (t < 2.86 ? .55 : (t >= 49.42 ? 0 : 1));
  const gateY = t >= .30 && !(t >= 16.40 && t < 19.10) ? 1 : 0;
  const gateR = !(t >= 16.40 && t < 19.10) ? 1 : 0;
  let sw = [1e5, 1e5, 1e5];
  if (t < .62) sw[2] = sweep(.02, .55);                    // 红版先印
  if (t < .92 && t >= .30) sw[1] = sweep(.30, .55);         // 黄版跟上
  if (t >= 37.84 && t < 38.5) sw[2] = sweep(37.86, .5, -120, W + 200);  // 火种：红版滚筒扫过
  if (t >= 49.42 && t < 50.1) sw[1] = W + 200;              // 结尾抽回黄版
  return { gate: [gateB, gateY, gateR], sweep: sw };
}

// ───────── 字幕：纸白 knockout 条 + 楷体 + 逐字填墨 ─────────
const SUBF = '400 46px STKaiti, KaiTi, serif';
function subtitle(t) {
  const l = LINES.find(l => t >= l.t0 - .07 && t < l.out);
  if (!l) return;
  screen();
  g.font = SUBF;
  const tw = g.measureText(l.text).width;
  const w = tw + 96, x0 = 960 - tw / 2, y = 1006;
  rrect(960 - w / 2, y - 40, w, 74, 8, [0, 0, 0]);          // 缺墨条
  text(l.text, x0, y + 14, SUBF, [0, 0, .42]);              // 未唱：红版 42% 网点
  // 唱到的部分：实心
  let k = 0;
  for (const c of l.chars) { if (t >= c.t0 - .02) k++; else break; }
  if (k > 0) {
    const pre = l.chars.slice(0, k).map(c => c.c).join('');
    const pw = g.measureText(pre).width;
    g.save(); g.beginPath(); g.rect(x0 - 4, y - 60, pw + 4, 120); g.clip();
    text(l.text, x0, y + 14, SUBF, [0, 0, 1]);
    g.restore();
  }
}

// ───────── 转场：纸带扫切 / 百叶窗 / 圆形 iris（全切在镜头边界 ±0.14s） ─────────
const TRANS = [
  [2.88, 'h'], [4.53, 'blinds'], [7.44, 'iris'], [11.61, 'v'], [16.40, 'h'],
  [19.12, 'blinds'], [22.45, 'iris'], [25.62, 'v'], [29.93, 'iris'],
  [36.39, 'h'], [39.76, 'blinds'], [43.28, 'iris'], [47.20, 'v'],
];
function transitions(t) {
  for (const [t0, kind] of TRANS) {
    const D = .14;
    if (t < t0 - D || t > t0 + D) continue;
    const edge = (x, y, nx, ny) => { // 撕纸前缘：蓝条 + 错位红条
      rect(nx ? x - 12 : x, ny ? y - 12 : y, nx ? 12 : 90, ny ? 12 : 90, B);
      rect(nx ? x - 20 : x + 8, ny ? y - 20 : y + 8, nx ? 6 : 80, ny ? 6 : 80, [0, 0, .55]);
    };
    if (kind === 'h' || kind === 'v') {
      const k = t < t0 ? eio(seg(t, t0 - D, t0)) : 1 - eio(seg(t, t0, t0 + D));
      const p = W * k;
      if (kind === 'h') { rect(0, 0, p, H, P); if (p > 2 && p < W) edge(p, 0, true, false); }
      else { rect(0, 0, W, H * k, P); if (p > 2 && p < W) edge(0, H * k, false, true); }
    } else if (kind === 'blinds') {
      const k = t < t0 ? eio(seg(t, t0 - D, t0)) : 1 - eio(seg(t, t0, t0 + D));
      for (let i = 0; i < 8; i++) rect(i * 240 + 120 * (1 - k), 0, 120 * k + 1, H, P);
    } else { // iris
      const k = t < t0 ? eio(seg(t, t0 - D, t0)) : 1 - eio(seg(t, t0, t0 + D));
      const r = Math.hypot(W, H) * .62 * k;
      g.beginPath(); g.rect(0, 0, W, H); g.arc(960, 540, Math.max(.01, r), 0, Math.PI * 2, true);
      g.fillStyle = 'rgb(0,0,0)'; g.fill('evenodd');
      if (r > 2 && r < Math.hypot(W, H) * .6) ring(960, 540, r, 12, B);
    }
  }
}

// ───────── 镜头 ─────────
const SHOT = {
  // S01 开场：红版滚筒先印 → 黄版跟上 → 空相框
  open(t) {
    const tt = step12(t);
    const z = lerp(1.34, 1, eo(seg(t, 0, 1.0)));
    cam(z, 960 + Math.sin(t * .5) * 24, 620);
    // 天空层：太阳光芒 + 云 + 远山
    sunburst(1330, 520, 300, [0, .92, 0], t, 14, .3);
    cloud(280, 240, 52, [0, .45, 0], Math.sin(t * .4) * 14);
    cloud(1620, 180, 40, [0, .38, 0], Math.sin(t * .3 + 2) * 10);
    bird(880, 210, 16, [0, .5, 0], t * 6);
    bird(960, 260, 12, [0, .45, 0], t * 6 + 1.5);
    hills(700, 130, [0, .55, 0], 1, 860);
    field(830, [0, .28, 0]);
    // 草地细节：草丛 + 小花
    for (const [gx, gs] of [[180, 26], [420, 20], [1560, 30], [1780, 22]]) grass(gx, 900, gs, [0, .8, 0], t * 2 + gx);
    flower(320, 930, 13, R, Y, Math.sin(t * 1.8) * .4);
    flower(1680, 950, 11, [0, .9, 0], Y, Math.sin(t * 2.1 + 1) * .4);
    disc(1330, 520, 300, [0, .92, 0]);
    frame(430, 96, 320, 240, { c: B, pic: null });
    // 主角
    const b = beatSq(t);
    const tt2 = tt;
    clawd(700, 838, 30, {
      ...feel(t > 2.3 ? 'hopeful' : (t > 1.6 ? 'thinking' : 'neutral'), tt2),
      dy: -b * .18, sq: b * .06, lookY: t > 1.7 ? -0.9 : 0, lookX: .3,
      emote: t > 1.9 && t < 2.5 ? '?' : (t > 2.5 ? '!' : null), emoteK: t > 1.9 ? 1 : 0,
    });
    screen();
  },

  // S02 镜子：粉 Clawd 只在镜面网点里
  mirror(t) {
    const whip = lerp(900, 0, eo(seg(t, 2.88, 3.06)));
    const z = 1.02;
    cam(z, 960, 540, whip, 0);
    bands(0, 260, [.34, .34, .34, .34], [0, 1, 0]);         // 上墙（黄网点）
    // 窗户：窗外天空 + 云 + 远山（视差微漂）
    rrect(140, 150, 360, 420, 12, B);
    g.save(); g.beginPath(); g.rect(160, 170, 320, 380); g.clip();
    rect(160, 170, 320, 380, [0, 0, .1]);
    cloud(320, 300, 34, [0, .5, 0], Math.sin(t * .4) * 10);
    hills(420, 60, [0, .6, 0], 2, 550);
    g.restore();
    line([[320, 170], [320, 550]], 10, B);
    // 窗台小盆栽
    rect(196, 570, 120, 14, R);
    blob([[210, 570], [216, 520], [256, 505], [296, 520], [302, 570]], [0, .85, 0]);
    field(700, [0, .18, 0]);
    grass(200, 780, 22, [0, .7, 0], t * 2);
    grass(1750, 800, 26, [0, .7, 0], t * 2 + 2);
    // 镜框
    rrect(1090, 170, 600, 620, 10, B);
    rect(1120, 200, 540, 560, [0, 0, .12]);
    // 镜里的她：网点密度随歌词上升
    const k = t < 4.2 ? .45 : .62;
    const pose = t < 3.8 ? 'shy' : 'surprised';
    g.save(); g.beginPath(); g.rect(1120, 200, 540, 560); g.clip();
    clawd(1390, 760, 27, { ...feel(pose, step12(t)), tint: 'pink', flip: true, lookX: -.2, halo: 4, sq: beatSq(t) * .05 });
    g.restore();
    // 主角冲进画面
    const x = lerp(240, 640, eo(seg(t, 3.0, 3.42)));
    clawd(x, 852, 29, {
      ...feel(t > 3.5 ? 'excited' : 'surprised', step12(t)),
      view: 'side', flip: false, walk: t < 3.42 ? bt(t) * 6.283 : 0,
      aR: t > 3.6 ? 1.2 : -.1, lookX: .8, emote: t > 3.5 ? '!' : null, emoteK: 1,
      dy: -Math.max(0, hit(t)) * .2, sq: beatSq(t) * .06,
    });
    screen();
  },

  // S03 手机自拍：她在取景框里换 pose，他在框外
  phone(t) {
    cam(lerp(1, 1.07, seg(t, 4.53, 7.44)), 960 + Math.sin(t * .6) * 14, 470);
    bands(0, 240, [.3, .3, .3], [0, 1, 0]);
    field(760, [0, .16, 0]);
    // 墙上置物架：小相框 + 盆栽
    rect(220, 330, 300, 12, B);
    frame(280, 250, 90, 66, { c: B, pic: (fx, fy, fw, fh) => { clawd(fx + fw * .45, fy + fh * .95, 3.6, { noShadow: true, noLegs: true }); } });
    blob([[430, 330], [436, 288], [470, 274], [504, 288], [510, 330]], [0, .8, 0]);
    disc(1580, 300, 180, [0, .6, 0]);
    cloud(320, 140, 30, [0, .42, 0], Math.sin(t * .5) * 8);
    grass(120, 840, 24, [0, .7, 0], t * 2);
    flower(1800, 860, 12, R, Y, Math.sin(t * 2) * .4);
    phone(940, 470, 620, 860);
    // 屏幕里的她：每拍换一个 pose
    const bi0 = bi(t);
    const poses = ['cool', 'love', 'playful', 'proud'];
    const pz = poses[((bi0 % 4) + 4) % 4];
    g.save(); g.beginPath(); g.rect(660, 70, 560, 800); g.clip();
    rect(660, 70, 560, 800, [0, 0, .1]);
    clawd(940, 830, 36, { ...feel(pz, step12(t)), tint: 'pink', sq: beatSq(t) * .08, dy: -hit(t) * .2, aL: .9, aR: .5 });
    g.restore();
    // 快门白闪（每拍一帧）
    if (ph(t) < .12) rect(660, 70, 560, 800, P);
    // 他在框外扒着屏幕
    clawd(1620, 900, 34, {
      ...feel(t > 6.6 ? 'suspicious' : 'nervous', step12(t)), flip: true,
      aL: 1.1, aR: 1.0, lookX: -.9, squint: t > 6.6 ? .5 : 0,
      dy: -hit(t) * .16, sq: beatSq(t) * .06, emote: t > 5.2 && t < 5.8 ? 'sweat' : null, emoteK: 1,
    });
    screen();
  },

  // S04 取景框 + 视力表 → push into halftone
  chart(t) {
    const push = seg(t, 8.66, 10.9);
    const z = lerp(1, 2.35, eio(push));
    cam(z, 900 + Math.sin(t * .7) * 10, 780);
    bands(0, 300, [.28, .28, .28], [0, 1, 0]);
    field(770, [0, .2, 0]);
    // 背景窗：云和山
    rrect(1400, 140, 380, 360, 12, B);
    g.save(); g.beginPath(); g.rect(1420, 160, 340, 320); g.clip();
    rect(1420, 160, 340, 320, [0, 0, .1]);
    cloud(1590, 280, 30, [0, .5, 0], Math.sin(t * .45) * 9);
    hills(380, 55, [0, .6, 0], 4, 480);
    g.restore();
    // 角落绿植
    blob([[80, 770], [88, 690], [140, 668], [192, 690], [200, 770]], [0, .85, 0]);
    // 主角举视力表
    eyeChart(430, 520, 300);
    clawd(470, 890, 31, { ...feel(t > 9.2 ? 'proud' : 'smug', step12(t)), aR: 1.35, aL: 1.3, dy: -hit(t) * .14, sq: beatSq(t) * .05, mouth: 'smirk' });
    // 她在中间揉眼 → 怼脸
    clawd(1030, 900, 30, {
      ...feel(t > 9.6 ? 'mischief' : (t > 8.8 ? 'disgusted' : 'confused'), step12(t)), tint: 'pink',
      lid: 0, lookX: -.5, sq: beatSq(t) * .06, dy: -hit(t) * .1,
      emote: t > 9.9 ? 'spark' : null, emoteK: 1,
    });
    // 全屏取景框
    screen();
    const w = W, h = H, L = 90;
    for (const [cx, cy, sx, sy] of [[60, 60, 1, 1], [w - 60, 60, -1, 1], [60, h - 60, 1, -1], [w - 60, h - 60, -1, -1]]) {
      rect(sx > 0 ? cx : cx - L, cy, L, 10, R); rect(cx, sy > 0 ? cy : cy - L, 10, L, R);
    }
    if (ph(t) < .5) circle(1760, 120, 18, R);
    text('REC', 1790, 132, '600 34px STKaiti, serif', R);
  },

  // S05 斜坡：公主抱失败压成饼
  slope(t) {
    cam(1.04, 960 + Math.sin(t * .5) * 16, 700);
    // 户外大全景：太阳 + 云 + 鸟 + 双层撕边山 + 坡上花草
    sunburst(330, 260, 150, [0, .85, 0], t, 12, .28);
    cloud(900, 190, 44, [0, .42, 0], Math.sin(t * .4) * 12);
    cloud(1650, 280, 34, [0, .38, 0], Math.sin(t * .35 + 1) * 9);
    bird(1300, 180, 15, [0, .5, 0], t * 6);
    bird(1420, 240, 11, [0, .45, 0], t * 6 + 2);
    hills(520, 90, [0, .5, 0], 7, 620);
    field(920, [0, .2, 0]);
    poly([[0, 920], [0, 560], [1180, 440], [1920, 600], [1920, 920]], [0, .95, 0]);
    // 坡面装饰：草丛 + 小花 + 一棵纸艺树
    tree(180, 600, 60, [0, .8, 0], BR);
    for (const [gx, gy, gs] of [[520, 640, 18], [900, 580, 15], [1500, 700, 20], [1750, 760, 17]]) grass(gx, gy, gs, [0, .75, 0], t * 2 + gx);
    flower(700, 660, 11, R, Y, Math.sin(t * 2) * .4);
    flower(1240, 620, 10, [0, .9, 0], Y, Math.sin(t * 2.2 + 2) * .4);
    // 她站坡顶
    const hop = t > 14.2 ? Math.max(0, Math.sin(seg(t, 14.2, 14.9) * Math.PI)) * 46 : 0;
    clawd(1300, 528 - hop, 27, {
      ...feel(t > 14.5 ? 'laugh' : 'smug', step12(t)), tint: 'pink', flip: true,
      aL: .7, aR: .7, squint: 0, dy: -hit(t) * .14, sq: beatSq(t) * .06,
      emote: t > 15.1 ? 'hearts' : null, emoteK: 1,
    });
    // 他在坡下抱
    const lift = seg(t, 13.2, 13.7);
    const fall = seg(t, 13.75, 14.15);
    const sq = fall > 0 && fall < 1 ? -0.45 * Math.sin(fall * Math.PI) : 0;
    clawd(760, 906, 30, {
      ...feel(t > 14.2 ? 'ko' : (t > 13.2 ? 'determined' : 'nervous'), step12(t)),
      aL: lerp(-.2, 1.4, lift), aR: lerp(-.2, 1.4, lift),
      dy: -lift * 1.2 + fall * 1.2, sq: sq + beatSq(t) * .05,
      emote: t > 14.3 ? 'sweat' : null, emoteK: 1, lookX: .5,
    });
    screen();
  },

  // S06 回忆：只剩蓝版
  recall(t) {
    cam(lerp(1.08, 1, seg(t, 16.4, 18.6)), 960, 560);
    field(760, [.35, 0, 0]);
    disc(1420, 380, 240, [.16, 0, 0]);
    // 回忆层：蓝云 + 蓝山 + 闪点（单版蓝里的层次）
    cloud(400, 220, 46, [.28, 0, 0], Math.sin(t * .4) * 12);
    cloud(1500, 170, 34, [.22, 0, 0], Math.sin(t * .3 + 1) * 9);
    hills(620, 100, [.5, 0, 0], 3, 780);
    spark4(300, 350, 14, [.8, 0, 0], t);
    spark4(1650, 300, 11, [.7, 0, 0], t + 1);
    lamp(560, 780, 300, [.75, 0, 0]);
    rect(0, 700, W, 22, [.9, 0, 0]);
    // 回忆水岸：撕边水波 + 纸船（参考图同款）
    waves(880, 3, [.6, 0, 0], t, 10);
    g.save(); g.translate(1560, 920 + Math.sin(t * 1.6) * 8); g.rotate(Math.sin(t * .9) * .06); boat(0, 0, 78, P); g.restore();
    // 两人剪影（单版）
    clawd(800, 830, 27, { ...feel(t > 17.6 ? 'love' : 'thinking', step12(t)), tint: 'mono', aR: .8, lookX: .6, dy: -hit(t) * .12, sq: beatSq(t) * .05 });
    clawd(1120, 830, 25, { ...feel(t > 17.5 ? 'starstruck' : 'surprised', step12(t)), tint: 'mono', flip: true, aL: .7, lookX: -.6, dy: -hit(t) * .1 });
    // 递出去的票根：纸白 knockout
    const g0 = seg(t, 17.9, 18.5);
    const tx = lerp(880, 1000, eo(g0)), ty = lerp(700, 690, eo(g0));
    g.save(); g.translate(tx, ty); g.rotate(-.12);
    rect(-70, -22, 140, 44, P); rect(-70, -22, 140, 5, [.6, 0, 0]);
    g.restore();
    screen();
  },

  // S07 长椅：两个人中间长出第三色
  bench(t) {
    cam(lerp(1, 1.05, seg(t, 19.1, 22.4)), 960, 620);
    bands(0, 300, [.3, .3, .3], [0, 1, 0]);
    field(840, [0, .22, 0]);
    sunburst(1560, 340, 210, [0, .8, 0], t, 12, .25);
    cloud(360, 200, 42, [0, .42, 0], Math.sin(t * .4) * 11);
    cloud(1150, 150, 32, [0, .38, 0], Math.sin(t * .33 + 2) * 8);
    bird(700, 230, 14, [0, .5, 0], t * 6);
    hills(640, 80, [0, .5, 0], 5, 860);
    tree(1700, 850, 85, [0, .8, 0], BR);
    for (const [gx, gy, gs] of [[120, 920, 22], [420, 950, 18], [1780, 940, 24]]) grass(gx, gy, gs, [0, .75, 0], t * 2 + gx);
    flower(300, 960, 12, R, Y, Math.sin(t * 2) * .4);
    flower(560, 975, 10, [0, .9, 0], Y, Math.sin(t * 2.3 + 1) * .4);
    bench(700, 880, 1.1);
    // 第三色：两人中间慢慢印上来
    const k3 = seg(t, 21.0, 22.4);
    if (k3 > .01) circle(960, 800, 210 * (0.6 + .4 * k3), [0, .55 * k3, .55 * k3]);
    clawd(810, 856, 27, { ...feel(t > 21.2 ? 'shy' : 'happy', step12(t)), view: 'q', aL: -.4, aR: .5, dy: -hit(t) * .12, sq: beatSq(t) * .05, lookX: t > 20.8 ? 1 : 0, emote: t > 21.1 ? 'hearts' : null, emoteK: 1 });
    clawd(1100, 856, 25, { ...feel(t > 21.2 ? 'hopeful' : 'shy', step12(t)), tint: 'pink', view: 'q', flip: true, aL: .3, lookX: t > 20.8 ? -1 : 0, dy: -hit(t) * .1 });
    // 茶的热气：正弦波动
    for (let i = 0; i < 3; i++) {
      const yy = 800 - i * 26 + Math.sin(t * 4 + i) * 8;
      circle(1180 + Math.sin(t * 2.4 + i) * 7, yy, 9 - i * 2, [0, 0, .25]);
    }
    screen();
  },

  // S08 纸页翻飞
  paper(t) {
    const up = seg(t, 22.45, 25.3);
    cam(lerp(1.06, 1.22, eio(up)), 960 + Math.sin(t * .8) * 12, 640);
    field(780, [0, .18, 0]);
    // 天上的云和闪光（纸页飞上天的空间感）
    cloud(300, 200, 40, [0, .4, 0], Math.sin(t * .4) * 10);
    cloud(1560, 160, 34, [0, .36, 0], Math.sin(t * .3 + 2) * 8);
    spark4(500, 320, 12, [0, .7, 0], t * 2);
    spark4(1420, 280, 10, [.7, 0, 0], t * 2 + 1);
    bird(960, 190, 14, [0, .5, 0], t * 6);
    // 一摞印张
    for (let i = 0; i < 7; i++) rrect(620 + i * 4, 820 - i * 12, 680, 18, 4, [0, .1, 0]);
    // 每拍翻起一张
    const b0 = bi(t);
    for (let k = 0; k < 5; k++) {
      const tb = BAR1 + (b0 - k) * BEAT;
      const a = seg(t, tb, tb + .95); if (a <= 0 || a >= 1) continue;
      const idx = ((b0 - k) % 5 + 5) % 5;
      const px = 720 + idx * 120, py = 800 - a * 760, rot = a * (idx % 2 ? 1.1 : -1.1);
      g.save(); g.translate(px, py); g.rotate(rot);
      const sc = 1 + a * 1.6, pw = 210 * sc, phh = 140 * sc;
      rect(-pw, -phh, pw * 2, phh * 2, P);
      rect(-pw, -phh, pw * 2, 10, [.85, 0, 0]); rect(-pw, phh - 10, pw * 2, 10, [.85, 0, 0]);
      rect(-pw, -phh, 10, phh * 2, [.85, 0, 0]); rect(pw - 10, -phh, 10, phh * 2, [.85, 0, 0]);
      disc(-pw * .42, phh * .1, 52 * sc, idx % 2 ? [0, .85, 0] : [.8, 0, 0]);
      clawd(pw * .38, phh * .82, 8.5 * sc, { ...feel(idx % 2 ? 'happy' : 'love', 1), noShadow: true, tint: idx % 2 ? null : 'pink', noLegs: true });
      g.restore();
    }
    screen();
  },

  // S09 按停挂钟，拉起她
  clock(t) {
    cam(lerp(1.04, 1, seg(t, 25.6, 26.6)), 960 + Math.sin(t * .6) * 12, 560);
    bands(0, 420, [.26, .26, .26], [0, 1, 0]);
    // 墙上：置物架 + 小相框 + 垂吊绿植
    rect(1420, 360, 340, 12, B);
    frame(1480, 270, 100, 76, { c: B, pic: (fx, fy, fw, fh) => { clawd(fx + fw * .35, fy + fh * .95, 3.4, { noShadow: true, noLegs: true }); clawd(fx + fw * .68, fy + fh * .95, 3.1, { tint: 'pink', noShadow: true, noLegs: true }); } });
    blob([[1660, 360], [1666, 316], [1700, 302], [1734, 316], [1740, 360]], [0, .8, 0]);
    field(860, [0, .2, 0]);
    grass(140, 940, 24, [0, .7, 0], t * 2);
    flower(1820, 950, 12, R, Y, Math.sin(t * 2) * .4);
    const stopAt = t > 26.3 ? 47.5 : null;
    clock(960, 300, 175, t * 2.2, stopAt);
    bench(680, 900, 1.15);
    // 长椅上：手机扣着（蓝版） + 两个人
    rrect(735, 828, 78, 46, 6, B);
    clawd(1250, 862, 26, { ...feel(t > 26.6 ? 'playful' : 'bored', step12(t)), tint: 'pink', flip: true, view: 'q', aL: .4, lookY: t < 26.4 ? .8 : 0, dy: -hit(t) * .12, sq: beatSq(t) * .05 });
    clawd(820, 864, 28, { ...feel(t > 27.4 ? 'happy' : 'determined', step12(t)), view: 'q', aR: t > 26.1 && t < 27.2 ? 1.3 : .2, lookX: .7, walk: t > 27.6 ? bt(t) * 3.1 : 0, dy: -hit(t) * .14, sq: beatSq(t) * .06 });
    screen();
  },

  // S10 指尖：网点拖尾 + 梦境圆盘
  fingers(t) {
    const z = lerp(1.5, 1.14, eo(seg(t, 29.93, 31.2)));
    cam(z, 960 + Math.sin(t * .7) * 10, 700);
    sunburst(960, 700, 520, [0, .34, 0], t, 16, .22);
    // 梦境层：边缘云 + 闪光
    cloud(240, 220, 40, [0, .38, 0], Math.sin(t * .4) * 10);
    cloud(1680, 260, 34, [0, .34, 0], Math.sin(t * .33 + 1) * 8);
    spark4(400, 420, 13, [0, .75, 0], t * 2);
    spark4(1520, 380, 11, [.7, 0, 0], t * 2 + 1.2);
    spark4(960, 180, 9, [0, .6, 0], t * 2 + 2);
    // 两条手臂 + 网点拖尾
    const meet = eio(seg(t, 30.4, 33.1));
    const hx = lerp(520, 905, meet), hy = 620 + Math.sin(t * 4) * 8;
    const px2 = lerp(1400, 1015, meet);
    // 网点拖尾（越远越稀）
    for (let i = 1; i < 9; i++) {
      const k = i / 9;
      circle(hx - k * 300, hy + 60 + k * 120 + Math.sin(t * 5 + i) * 6, 20 - i * 1.8, [0, .8 * (1 - k * .7), .1]);
      circle(px2 + k * 300, hy + 60 + k * 120 + Math.sin(t * 5 + i + 2) * 6, 18 - i * 1.7, [0, 0, .45 * (1 - k * .6)]);
    }
    line([[240, 1000], [hx - 60, hy + 30]], 86, [0, 1, 1]);
    line([[1680, 1000], [px2 + 60, hy + 30]], 80, [0, 0, .5]);
    circle(hx - 60, hy + 30, 52, [0, 1, 1]);
    circle(px2 + 60, hy + 30, 48, [0, 0, .5]);
    // 碰上那一刻 pop 一颗纸白星
    if (meet > .96) eyeSpark(hx + 20, hy - 90, t);
    // 指尖冒出的小印张
    const pops = [[30.6, 600, 380], [31.4, 1320, 400]];
    for (const [tp, x, y] of pops) {
      const a = seg(t, tp, tp + .5); if (a <= 0 || a >= 1) continue;
      g.save(); g.translate(x, y); g.rotate((a - .5) * .3); g.globalAlpha = 1;
      rect(-90, -60, 180, 120, P); rect(-90, -60, 180, 8, [.6, 0, 0]);
      g.restore();
    }
    screen();
  },

  // S11 风暴：33.72 冻结 → 34.52 炸
  storm(t) {
    const frozen = t >= 33.72 && t < 34.52;
    const tt = frozen ? 33.72 : t;
    const boom = t >= 34.52 ? 1 : 0;
    const sh = boom ? Math.exp(-(t - 34.52) * 6) * 28 : 0;
    cam(1.1 + (frozen ? .04 * ss(seg(t, 33.72, 34.5)) : 0), 960, 600, Math.sin(t * 90) * sh, Math.cos(t * 70) * sh);
    field(820, [.55, 0, 0]);
    // 乌云压顶（蓝版，快速横移）
    cloud(400 + Math.sin(t * 3) * 30, 180, 60, [.5, 0, 0], Math.sin(t * 2.5) * 20);
    cloud(1200 + Math.cos(t * 2.6) * 30, 140, 48, [.42, 0, 0], Math.sin(t * 2.2 + 2) * 16);
    cloud(1700, 240, 40, [.38, 0, 0], Math.sin(t * 3 + 1) * 14);
    // 风的斜带
    for (let i = 0; i < 6; i++) {
      const yy = 140 + i * 120 + ((t * 900) % 120);
      line([[0, yy], [W, yy - 190]], 16, [.3, 0, 0]);
    }
    // 伏地的草
    grass(200, 900, 26, [.6, 0, 0], -1.2 + Math.sin(t * 9) * .2);
    grass(1750, 910, 28, [.6, 0, 0], -1.2 + Math.sin(t * 9 + 1) * .2);
    clawd(780, 880, 30, { ...feel(boom ? 'furious' : 'nervous', step12(tt)), aL: 1.1, aR: 1.1, sq: beatSq(tt) * .05, dy: -hit(tt) * .1, emote: boom ? 'anger' : 'sweat', emoteK: 1 });
    clawd(1090, 884, 27, { ...feel(boom ? 'relieved' : 'scared', step12(tt)), tint: 'pink', flip: true, lookX: -.8, dy: -hit(tt) * .1 });
    // 纸屑
    const pts = [];
    for (let i = 0; i < 34; i++) {
      const sd = hash(i * 3.3);
      const a = boom ? ss(seg(t, 34.52, 35.3)) : 0;
      const ang = sd * 6.283;
      const rr = 120 + a * (420 + sd * 700);
      pts.push([960 + Math.cos(ang) * rr * 1.3, 800 + Math.sin(ang) * rr * .7 - a * 120, 22 + sd * 26, ang + a * 3, i % 3 ? R : [0, .8, 0]]);
    }
    debris(pts);
    if (boom && t < 34.62) screen(), rect(0, 0, W, H, [0, 0, 1]);
    screen();
  },

  // S12 火种：37.06 冻结 → 37.86 红版滚筒印出火苗
  fire(t) {
    const frozen = t >= 37.056 && t < 37.86;
    const tt = frozen ? 37.056 : t;
    const lit = t >= 37.86 ? seg(t, 37.86, 38.5) : 0;
    cam(lerp(1.02, 1.12, ss(seg(tt, 36.4, 39.7))), 960 + Math.sin(tt * .5) * 12, 640);
    bands(0, 400, [.62, .62, .62], [0, 1, 0]);
    bands(400, 200, [.42, .42], [0, 1, 0]);
    field(860, [.75, .2, 0]);
    // 夜空：星子 + 黑山 + 树影
    for (const [sx, sy, ssz] of [[260, 140, 10], [620, 90, 7], [1180, 120, 9], [1620, 80, 11], [1830, 200, 8]]) spark4(sx, sy, ssz, [.9, 0, 0], tt + sx);
    hills(560, 110, [.85, 0, 0], 9, 680);
    tree(180, 880, 70, [.9, .1, 0], [.9, 0, 0]);
    tree(1760, 890, 62, [.9, .1, 0], [.9, 0, 0]);
    // 空火堆 → 点燃
    fire(960, 830, 62, lit, tt);
    clawd(700, 880, 28, { ...feel(lit > .2 ? 'hopeful' : 'determined', step12(tt)), aL: .9, aR: .9, dy: -hit(tt) * .12, sq: beatSq(tt) * .05, lookX: .6, lookY: .3 });
    clawd(1240, 884, 26, { ...feel(lit > .2 ? 'happy' : 'nervous', step12(tt)), tint: 'pink', flip: true, aL: .8, blush: lit > .2 ? .4 : 0, lookX: -.7, dy: -hit(tt) * .1 });
    // 火星
    if (lit > .05) for (let i = 0; i < 10; i++) {
      const a = ((tt * .5 + i * .1) % 1);
      circle(960 + Math.sin(i * 2.1 + tt) * 40, 760 - a * 300, 6 * (1 - a) + 2, [0, .9, 0]);
    }
    screen();
  },

  // S13 牵手走过街：横移 + 每拍一件道具
  walk(t) {
    const cx = (t - 39.76) * 250;
    cam(1, 960, 540);
    bands(0, 360, [.28, .28], [0, 1, 0]);
    field(840, [0, .2, 0]);
    // 天空视差：云反向慢漂 + 鸟 + 远山
    cloud(500 - cx * .12, 180, 46, [0, .42, 0], 0);
    cloud(1500 - cx * .12, 130, 36, [0, .38, 0], 0);
    cloud(2600 - cx * .12, 220, 40, [0, .4, 0], 0);
    bird(1100 - cx * .2, 200, 14, [0, .5, 0], t * 6);
    bird(2000 - cx * .2, 260, 11, [0, .45, 0], t * 6 + 1);
    hills(620, 70, [0, .5, 0], 1, 700);
    // 路边小花（随镜头快速掠过）
    for (let i = 0; i < 8; i++) {
      const fx = i * 520 - cx;
      if (fx > -60 && fx < W + 60) flower(fx, 960, 11, i % 2 ? R : [0, .9, 0], Y, Math.sin(t * 3 + i) * .5);
    }
    // 背景道具（每拍经过一件）
    const props = [[0, 'lamp'], [520, 'frame'], [1040, 'bench'], [1560, 'poster'], [2080, 'lamp']];
    for (const [px, kind] of props) {
      const x = px - cx;
      if (x < -400 || x > W + 400) continue;
      if (kind === 'lamp') lamp(x, 860, 320, B);
      if (kind === 'frame') frame(x, 260, 200, 150, { c: B, pic: (fx, fy, fw, fh) => { clawd(fx + fw * .38, fy + fh * .95, 7, { ...feel('happy', 1), noShadow: true }); clawd(fx + fw * .66, fy + fh * .95, 6.4, { ...feel('love', 1), tint: 'pink', noShadow: true }); } });
      if (kind === 'bench') bench(x, 880, 1);
      if (kind === 'poster') { rrect(x, 300, 170, 240, 4, [0, .5, .5]); rect(x + 20, 330, 130, 90, [0, 0, 0]); }
    }
    // 两人牵手走
    const wk = bt(t) * 6.283;
    const bob = Math.abs(Math.sin(wk)) * 6;
    clawd(820, 900 - bob, 30, { ...feel(t > 42 ? 'proud' : 'happy', step12(t)), view: 'side', walk: wk, aR: .55, mouth: bi(t) % 2 ? 'open' : 'grin', dy: -hit(t) * .1, sq: beatSq(t) * .05 });
    clawd(1030, 900 - bob, 27, { ...feel('playful', step12(t)), tint: 'pink', view: 'side', walk: wk + 3.14, aL: .55, dy: -hit(t) * .1 });
    screen();
  },

  // S14 她对着黄版圆盘理蝴蝶结
  close(t) {
    const z = lerp(1, 1.05, seg(t, 43.3, 47.2));
    cam(z, 900 + Math.sin(t * .5) * 12, 620);
    sunburst(1400, 560, 430, [0, .9, 0], t, 16, .2);
    field(900, [0, .22, 0]);
    // 云 + 飘落的花瓣雨
    cloud(300, 200, 40, [0, .4, 0], Math.sin(t * .4) * 10);
    cloud(900, 140, 30, [0, .36, 0], Math.sin(t * .3 + 2) * 8);
    for (let i = 0; i < 10; i++) {
      const sd = hash(i * 5.1);
      const py = ((t * (60 + sd * 50) + sd * 1100) % 1200) - 60;
      g.save(); g.translate(200 + sd * 1600 + Math.sin(t * 2 + i) * 30, py); g.rotate(t * 2 + i);
      ellipse(0, 0, 9, 5, 0, i % 2 ? [0, .7, 0] : [.6, 0, 0]);
      g.restore();
    }
    const spin = seg(t, 45.2, 45.6);
    const flip = t >= 45.4 ? true : false;
    clawd(880, 906, 52, {
      ...feel(t > 45.6 ? 'starstruck' : (t > 44.6 ? 'surprised' : 'neutral'), step12(t)),
      tint: 'pink', flip, aL: .9, aR: .9, blush: t > 45.6 ? .5 : .2,
      dy: -hit(t) * .05, sq: beatSq(t) * .04, lookX: t > 45.6 ? -.3 : .2,
      emote: t > 45.7 ? 'spark' : null, emoteK: 1,
    });
    // 他的半个头
    clawd(1730, 940, 34, { ...feel(t > 46.2 ? 'ko' : 'love', step12(t)), flip: true, dx: -.4, aL: .6, lookX: -.8, dy: -hit(t) * .1, emote: t > 46.0 ? 'hearts' : null, emoteK: 1 });
    screen();
  },

  // S15 表白：lid 全开 → 三版叠满 → 定格成墙上海报
  shout(t) {
    const poster0 = 49.42;
    const isPoster = t >= poster0;
    const draw = (tt, sc = 1, ox = 0, oy = 0) => {
      g.save(); g.translate(ox, oy); g.scale(sc, sc);
      bands(0, 300, [.3, .3], [0, 1, 0]);
      field(860, [0, .26, 0]);
      sunburst(1440, 360, 250, [0, .85, 0], tt, 14, .22);
      cloud(320, 190, 40, [0, .4, 0], Math.sin(tt * .4) * 10);
      cloud(900, 140, 30, [0, .36, 0], Math.sin(tt * .3 + 1) * 8);
      bunting(0, 120, 1920, 60, 9, [0, .8, 0], [.8, 0, 0], 50);
      // 台前草花
      for (const [gx, gs] of [[140, 24], [1740, 26], [1880, 20]]) grass(gx, 940, gs, [0, .75, 0], tt * 2 + gx);
      flower(80, 950, 12, R, Y, Math.sin(tt * 2) * .4);
      // 印张堆演讲台
      for (let i = 0; i < 5; i++) rrect(660 + i * 3, 880 - i * 16, 400, 18, 4, [0, .2, 0]);
      const shout = seg(tt, 48.2, 49.4);
      clawd(860, 800, 32, {
        ...feel(tt > 48.2 ? 'furious' : (tt > 47.6 ? 'determined' : 'nervous'), step12(tt)),
        lid: shout > 0 ? Math.min(1, shout * 2.2) : 0, aL: 1.2, aR: 1.2,
        sq: beatSq(tt) * .06, dy: -hit(tt) * .16, emote: shout > .2 ? 'hearts' : null, emoteK: 1,
      });
      clawd(1330, 890, 29, { ...feel(tt > 48.2 ? 'laugh' : 'surprised', step12(tt)), tint: 'pink', flip: true, aL: .9, aR: .5, dy: -hit(tt) * .12, sq: beatSq(tt) * .05, blush: .5 });
      // 声波环
      if (shout > .05) for (let i = 0; i < 3; i++) {
        const a = seg(tt, 48.25 + i * .4, 49.2 + i * .4);
        if (a > 0 && a < 1) { g.save(); g.globalCompositeOperation = 'lighter'; circle(860, 700, 120 + a * 620, [.35 * (1 - a), .35 * (1 - a), 0]); g.restore(); }
      }
      g.restore();
    };
    if (!isPoster) { cam(lerp(1.02, 1.1, ss(seg(t, 47.2, 49.4))), 900, 620); draw(t); screen(); }
    else {
      // 定格：整帧变成贴在墙上的海报（相框 motif 收尾）
      screen();
      bands(0, 1080, [.22], [0, 1, 0]);
      const px = 300, py = 90, pw = 1320, ph = 742;
      rect(px - 16, py - 16, pw + 32, ph + 32, [0, 0, .25]);
      rect(px - 8, py - 8, pw + 16, ph + 16, P);
      g.save(); g.beginPath(); g.rect(px, py, pw, ph); g.clip();
      g.translate(px, py); g.scale(pw / W, ph / H);
      draw(poster0 - .001);
      g.restore();
      // 胶带 + 卷边
      g.save(); g.translate(px + pw / 2, py - 6); g.rotate(-.02); rect(-90, -18, 180, 36, [0, .18, .18]); g.restore();
      g.save(); g.translate(px + pw / 2, py + ph + 4); g.rotate(.015); rect(-90, -18, 180, 36, [0, .18, .18]); g.restore();
      // 相框：就在海报下方
      frame(px + pw / 2 - 150, 850, 300, 190, { c: B, pic: (fx, fy, fw, fh) => { clawd(fx + fw * .32, fy + fh * .98, 9, { ...feel('love', 1), noShadow: true }); clawd(fx + fw * .68, fy + fh * .98, 8.4, { ...feel('hopeful', 1), tint: 'pink', flip: true, noShadow: true }); } });
    }
  },
};

// 每拍的身体弹跳（全部角色共用）
function beatSq(t) { return Math.pow(1 - ph(t), 3) * 1; }

export function renderFilm(t) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  // clear 到纸（= 0,0,0 三版都无墨）
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = inkA([0, 0, 0]); g.fillRect(0, 0, W, H);
  const [name] = shotAt(t);
  SHOT[name](t);
  screen();
  transitions(t);
  subtitle(t);
  const p = plates(t);
  return {
    seed: Math.floor(t * 12), sheet: SHOTS.findIndex(s => s[0] === name) * 3.7,
    off: regist(t), rot: [0, .0006, -.0005], period: 7, grain: .6,
    gate: p.gate, sweep: p.sweep,
    inks: [[61, 85, 136], [255, 181, 17], [255, 102, 94]],
  };
}
