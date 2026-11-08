// _audio15.mjs — 给《未寄》做一条 15.4s 的环境声（纯合成，无版权素材）
// 设计：海浪底噪 + 磁带嘶声（开场）+ 极低音量的 pad 和声 + 4 颗钟琴
// 情绪：Am(海) → F(回忆) → G(决定) → C(寄出)，最后一下钟琴落在 C6
import { writeFileSync } from 'node:fs';

const SR = 44100, DUR = 15.4, N = Math.round(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
const noiseSeed = () => Math.random() * 2 - 1;

// ── 1. 海浪：白噪 → 单极低通，再乘两个慢 LFO ──
let lp = 0, lp2 = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const w = noiseSeed();
  lp += (w - lp) * 0.012;          // 低频涌
  lp2 += (w - lp2) * 0.06;         // 中频碎浪
  const swell = 0.55 + 0.45 * Math.sin(2 * Math.PI * 0.11 * t + 1.2) * Math.sin(2 * Math.PI * 0.043 * t);
  const v = (lp * 1.9 + lp2 * 0.30) * swell * 0.19;
  // 头尾淡入淡出
  const fade = Math.min(1, t / 1.2) * Math.min(1, Math.max(0, (DUR - t) / 1.0));
  L[i] += v * fade; R[i] += v * fade * 0.96;
}

// ── 2. 磁带嘶声（只在开场，按下播放前）──
let hp = 0;
for (let i = 0; i < Math.round(SR * 1.9); i++) {
  const t = i / SR;
  const w = noiseSeed();
  hp += (w - hp) * 0.5;
  const hiss = (w - hp) * 0.010 * Math.min(1, t / .3) * Math.max(0, 1 - t / 1.9);
  L[i] += hiss; R[i] += hiss * .9;
}

// ── 3. 按键：一小段噪声爆 + 1.6kHz 短促音 ──
function click(at, amp) {
  const i0 = Math.round(at * SR), len = Math.round(SR * 0.09);
  for (let k = 0; k < len; k++) {
    const t = k / SR, e = Math.exp(-t * 60);
    const v = (noiseSeed() * .5 + Math.sin(2 * Math.PI * 1600 * t) * .5) * e * amp;
    const i = i0 + k; if (i < N) { L[i] += v; R[i] += v; }
  }
}
click(1.30, 0.16);          // 按下 PLAY
click(2.80, 0.07);          // 片子名

// ── 4. Pad 和声：Am → F → G → C ──
const CH = [
  { t0: 4.30, t1: 8.10, f: [110.00, 130.81, 164.81, 220.00] },   // Am
  { t0: 8.10, t1: 12.40, f: [87.31, 130.81, 174.61, 220.00] },   // F
  { t0: 12.40, t1: 13.95, f: [98.00, 146.83, 196.00, 246.94] },  // G
  { t0: 13.95, t1: DUR + .5, f: [130.81, 164.81, 196.00, 261.63] }, // C
];
function addNote(f0, i0, i1, amp, phase) {
  for (let i = Math.max(0, i0); i < Math.min(N, i1); i++) {
    const t = (i - i0) / SR;
    const env = Math.min(1, t / .9) * Math.min(1, Math.max(0, (i1 - i) / SR / .8));
    const v = (Math.sin(2 * Math.PI * f0 * t + phase) * .75 +
               Math.sin(2 * Math.PI * f0 * 2 * t + phase * .5) * .18 +
               Math.sin(2 * Math.PI * f0 * 3 * t) * .06) * env * amp;
    L[i] += v * (1 + 0.08 * Math.sin(2 * Math.PI * 0.13 * t));
    R[i] += v * (1 - 0.08 * Math.sin(2 * Math.PI * 0.11 * t));
  }
}
for (const c of CH) {
  const i0 = Math.round(c.t0 * SR), i1 = Math.round(c.t1 * SR);
  c.f.forEach((f, k) => addNote(f, i0, i1, k === 0 ? .075 : .046, k * 1.7));
}

// ── 5. 钟琴：稀疏 4 颗，落情绪点 ──
function bell(at, freq, amp) {
  const i0 = Math.round(at * SR), len = Math.round(SR * 2.0);
  for (let k = 0; k < len; k++) {
    const t = k / SR, e = Math.exp(-t * 2.2);
    const v = (Math.sin(2 * Math.PI * freq * t) + Math.sin(2 * Math.PI * freq * 2.01 * t) * .25) * e * amp;
    const i = i0 + k; if (i < N) { L[i] += v; R[i] += v * .92; }
  }
}
bell(4.45, 880.00, .060);   // A5 进海
bell(9.35, 1046.50, .050);  // C6 第二句歌词
bell(12.98, 1174.66, .080); // D6 计数器翻转
bell(14.05, 1046.50, .095);  // C6 天亮

// ── 6. 低频空气：下摇开始时一记很轻的 whoosh ──
for (let i = Math.round(4.30 * SR); i < Math.round(5.6 * SR); i++) {
  const t = (i - 4.30 * SR) / SR;
  const e = Math.sin(Math.PI * Math.min(1, t / 1.3)) ** 2;
  const v = (noiseSeed() * .5 + Math.sin(2 * Math.PI * 70 * t) * .5) * e * .045;
  L[i] += v; R[i] += v;
}

// ── 归一化到 -3dBFS ──
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.70 / (peak || 1);
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const l = Math.max(-1, Math.min(1, L[i] * g)), r = Math.max(-1, Math.min(1, R[i] * g));
  buf.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(r * 32767), 46 + i * 4);
}
writeFileSync('assets/_score15.wav', buf);
console.log('wrote assets/_score15.wav  peak(raw)=' + peak.toFixed(3) + '  samples=' + N);
