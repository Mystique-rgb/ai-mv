// 调色刀音效合成器：不依赖任何库，直接写 16-bit WAV
// 每个声音都是"刀在厚颜料上"的物理动作：刮 / 劈 / 甩 / 刃鸣 / 溅 / 炸 / 点 / 压 / 长刮
import fs from 'node:fs';
import path from 'node:path';

const SR = 44100;
const DUR = 55.28;
const OUT = process.argv[2] || 'D:/ai音乐mv/寂寞烟火/mv/out/sfx.wav';

// ---------- 确定性随机 ----------
function mulberry(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- 滤波器 ----------
function biquad(x, f0, f1, Q, mode) {
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, b0 = 1, b1 = 0, b2 = 0, a1 = 0, a2 = 0;
  const upd = (f) => {
    const w0 = 2 * Math.PI * Math.min(Math.max(f, 30), SR * 0.45) / SR;
    const cw = Math.cos(w0), al = Math.sin(w0) / (2 * Q);
    const a0 = 1 + al;
    if (mode === 'bp') { b0 = al / a0; b1 = 0; b2 = -al / a0; }
    else { b0 = (1 - cw) / 2 / a0; b1 = (1 - cw) / a0; b2 = (1 - cw) / 2 / a0; }
    a1 = -2 * cw / a0; a2 = (1 - al) / a0;
  };
  upd(f0);
  const n = x.length;
  for (let i = 0; i < n; i++) {
    if ((i & 31) === 0) upd(f0 * Math.pow(f1 / f0, i / n));
    const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
}

const nb = (dur, rnd) => { const n = Math.round(dur * SR), b = new Float32Array(n); for (let i = 0; i < n; i++) b[i] = rnd() * 2 - 1; return b; };
const at = (b, i) => (i >= 0 && i < b.length ? b[i] : 0);

// 不规则颗粒调制（让刮擦不是一条平直的白噪）
function grit(n, rnd, depth = .35) {
  const ph = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28];
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const m = (Math.sin(6.283 * 37 * t + ph[0]) + Math.sin(6.283 * 61 * t + ph[1]) * .7 + Math.sin(6.283 * 97 * t + ph[2]) * .5) / 2.2;
    out[i] = 1 - depth + depth * Math.abs(m);
  }
  return out;
}

// ---------- 声音 ----------
// 刮：一刀刮过画布
function scrape(dur = .22, f0 = 2800, f1 = 1400, seed = 1) {
  const rnd = mulberry(seed);
  const n = Math.round(dur * SR);
  const raw = nb(dur, rnd);
  const body = biquad(raw, f0, f1, 2.2, 'bp');
  const gritL = biquad(nb(dur, mulberry(seed + 7)), f0 * 2.2, f1 * 2.0, 3.0, 'bp');
  const tex = grit(n, mulberry(seed + 13), .38);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const a = Math.min(1, t / .006) * Math.exp(-t / (dur * .45));
    out[i] = (body[i] * 1.0 + at(gritL, i) * .45) * a * tex[i];
  }
  return out;
}

// 劈：刀刃剁进画布 —— 脆响 + 低频闷 + 刮尾
function crack(seed = 2) {
  const rnd = mulberry(seed);
  const n = Math.round(.52 * SR), out = new Float32Array(n);
  const click = biquad(nb(.02, mulberry(seed + 3)), 2600, 2200, 1.2, 'bp');
  const lowB = biquad(nb(.3, mulberry(seed + 5)), 320, 260, .8, 'lp');
  const tail = scrape(.36, 2100, 880, seed + 9);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const thump = Math.sin(6.283 * (100 * t - 26 * t * t)) * Math.exp(-t / .075) * .85;
    const ck = at(click, i) * 2.6;
    out[i] = thump + ck + at(lowB, i) * Math.exp(-t / .09) * .8 + at(tail, i) * .5;
  }
  return out;
}

// 甩：镜头横扫的风声
function whip(seed = 4) {
  const dur = .27, n = Math.round(dur * SR);
  const src = nb(dur, mulberry(seed));
  const w = biquad(src, 420, 2900, 1.15, 'bp');
  const w2 = biquad(nb(dur, mulberry(seed + 11)), 2800, 620, 1.2, 'bp');
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const u = i / n, t = i / SR;
    const e = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.05)), 1.5);
    out[i] = (w[i] * .9 + at(w2, i) * .5) * e;
  }
  return out;
}

// 刃鸣：刀片擦过钢的金属余韵
function shing(seed = 6) {
  const dur = .6, n = Math.round(dur * SR), out = new Float32Array(n);
  const ps = [[2085, .5, 5.2], [3142, .32, 7.5], [5210, .2, 10], [7410, .1, 13]];
  const rnd = mulberry(seed);
  const br = biquad(nb(.2, rnd), 4800, 3800, 2.5, 'bp');
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let s = 0;
    for (const [f, a, d] of ps) s += Math.sin(6.283 * f * t * (1 + .0006 * Math.sin(6.283 * 5.5 * t))) * a * Math.exp(-t * d);
    out[i] = s * .5 + at(br, i) * Math.exp(-t / .09) * .5;
  }
  return out;
}

// 溅：一团湿颜料落地
function splat(seed = 8) {
  const dur = .24, n = Math.round(dur * SR), out = new Float32Array(n);
  const lp1 = biquad(nb(dur, mulberry(seed)), 760, 400, .9, 'lp');
  const hp = biquad(nb(.08, mulberry(seed + 3)), 2600, 2200, 1.5, 'bp');
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const plop = Math.sin(6.283 * (300 * t - 180 * t * t)) * Math.exp(-t / .045) * .8;
    out[i] = plop + at(lp1, i) * Math.exp(-t / .05) * 1.2 + at(hp, i) * .35;
  }
  return out;
}

// 炸：花火爆开
function boom(seed = 10) {
  const dur = 1.35, n = Math.round(dur * SR), out = new Float32Array(n);
  const low = biquad(nb(dur, mulberry(seed)), 420, 180, .8, 'lp');
  const rnd = mulberry(seed + 5);
  const crackle = new Float32Array(n);
  for (let k = 0; k < 90; k++) {
    const t0 = .05 + Math.pow(rnd(), 1.4) * .9;
    const i0 = Math.round(t0 * SR);
    const g = Math.exp(-t0 * 2.2) * (.35 + rnd() * .5);
    const f = 2800 + rnd() * 3200;
    const len = Math.round(.012 * SR);
    const b = biquad(nb(.012, mulberry(seed + k + 20)), f, f * .8, 2.2, 'bp');
    for (let i = 0; i < len; i++) crackle[i0 + i] += b[i] * g * Math.exp(-i / (len * .35));
  }
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const sub = Math.sin(6.283 * (74 * t - 20 * t * t)) * Math.exp(-t / .5);
    out[i] = sub * .9 + at(low, i) * Math.exp(-t / .34) * .65 + crackle[i];
  }
  return out;
}

// 点：一颗星亮起来
function pop(seed = 12) {
  const dur = .12, n = Math.round(dur * SR), out = new Float32Array(n);
  const ck = biquad(nb(.03, mulberry(seed)), 3200, 2800, 1.4, 'bp');
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const s = Math.sin(6.283 * (1150 * t - 2600 * t * t)) * Math.exp(-t / .028);
    out[i] = s * .7 + at(ck, i) * .5;
  }
  return out;
}

// 压：黑幕压下来的闷响
function thud(seed = 14) {
  const dur = .4, n = Math.round(dur * SR), out = new Float32Array(n);
  const lp1 = biquad(nb(dur, mulberry(seed)), 220, 140, .7, 'lp');
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const s = Math.sin(6.283 * (132 * t - 60 * t * t)) * Math.exp(-t / .09);
    out[i] = s * .85 + at(lp1, i) * Math.exp(-t / .07) * .7;
  }
  return out;
}

// 长刮：一刀一刀把整片天空刮掉
function longscrape(seed = 16) {
  const dur = 1.62, n = Math.round(dur * SR), out = new Float32Array(n);
  const body = biquad(nb(dur, mulberry(seed)), 1750, 430, 1.8, 'bp');
  const hi = biquad(nb(dur, mulberry(seed + 3)), 3600, 2200, 2.6, 'bp');
  const tex = grit(n, mulberry(seed + 5), .45);
  const bumpT = [.05, .32, .62, .95, 1.26];
  const out2 = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let e = 0;
    for (let b = 0; b < bumpT.length; b++) {
      const d = (t - bumpT[b]) / .13;
      e = Math.max(e, Math.exp(-d * d * 2.2) * (b % 2 ? .8 : 1));
    }
    out2[i] = (body[i] + at(hi, i) * .4) * e * tex[i];
  }
  return out2;
}

// ---------- 事件表（全部对齐转场与内容爆点） ----------
const EVENTS = [
  [0.43, 'crack', .60],          // 一刀剁进画布
  [0.90, 'scrape', .30],         // 顺着裂缝刮进去
  [1.31, 'whip', .40],           // 甩进海
  [1.37, 'splat', .46],          // 砸进浪里
  [2.19, 'scrape', .16],         // 海接海，轻轻一擦
  [3.34, 'crack', .52],          // 白天被劈开
  [4.45, 'scrape', .34],         // 天上刮开一道缝
  [6.95, 'splat', .40],          // 粉花炸开
  [7.23, 'scrape', .30],         // 颜色一波波推开
  [8.38, 'whip', .38],           // 甩镜头起跑
  [10.32, 'crack', .48],         // 彩色世界劈开
  [11.90, 'scrape', .42],        // 颜色被刮走
  [17.15, 'whip', .34],          // 甩进特写
  [18.72, 'scrape', .16],        // 暖光扫过脸
  [19.78, 'shing', .24],         // 切进瞳孔
  [23.30, 'crack', .68],         // 黑幕竖劈（大）
  [30.43, 'splat', .42],         // 梦散成彩点
  [31.60, 'thud', .50],          // 黑压下来
  [34.42, 'shing', .22],         // 睁眼
  [35.60, 'pop', .22], [36.22, 'pop', .20], [36.84, 'pop', .18], [37.46, 'pop', .17],
  [38.54, 'crack', .55],         // 金缝劈开天海
  [42.20, 'whip', .36],          // 金柱升空
  [43.00, 'boom', .78],          // 花火爆开
  [44.60, 'shing', .20],         // 彩虹升起
  [45.72, 'whip', .32],
  [48.44, 'crack', .46],         // 天空撑开
  [52.00, 'longscrape', .52],    // 收尾一刀刀刮掉天空
];

const lib = {
  crack: [crack(), 1], scrape: [scrape(), 1], whip: [whip(), 1], shing: [shing(), 1],
  splat: [splat(), 1], boom: [boom(), 1], pop: [pop(), 1], thud: [thud(), 1],
  longscrape: [longscrape(), 1],
};

const N = Math.round(DUR * SR);
const track = new Float32Array(N);
for (const [t0, name, g] of EVENTS) {
  const src = lib[name][0];
  const i0 = Math.round(t0 * SR);
  for (let i = 0; i < src.length; i++) {
    const j = i0 + i;
    if (j >= N) break;
    track[j] += src[i] * g;
  }
}

// 归一 + 轻微软削波，峰值 0.72
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(track[i]));
const k = .72 / (peak || 1);
for (let i = 0; i < N; i++) track[i] = Math.tanh(track[i] * k * 1.15);

// ---------- 写 WAV ----------
const buf = Buffer.alloc(44 + N * 2);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 2, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) {
  const v = Math.max(-1, Math.min(1, track[i]));
  buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, buf);
console.log(`sfx: ${OUT}  ${(N / SR).toFixed(2)}s  ${EVENTS.length} events  peak ${peak.toFixed(2)}`);
