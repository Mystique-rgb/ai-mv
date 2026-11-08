// 《爱怎么了》纸雕灯影 MV — master timeline.
// 52 shots + tail board, 1080×1920, 纸雕灯影 (paper-cut shadowbox, backlit).
// Every frame is a pure function of t: no state carried between frames except the
// lazily built shot list (cached sets) — renders run in parallel segments.
import * as THREE from 'three';
import { Pipe } from './post.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { dispose } from './stage.js';
import { ss, seg, clamp } from './lib.js';
import { SHOTS } from './shots/index.js';
import { DUR, LINES } from './cues.js';

const Q = new URLSearchParams(location.search);
const SSAA = +(Q.get('ssaa') || 2);
const W = 1080, H = 1920;
window.DUR = DUR; window.__T = THREE;

// —— Shot plan: each shot owns [start, next.start) ——
let plan = SHOTS();
if (Q.get('only')) plan = plan.filter(s => s.id === Q.get('only'));
plan.forEach((s, i) => {
  s.end = i + 1 < plan.length ? plan[i + 1].start : (Q.get('only') ? DUR : DUR);
  s.dur = s.end - s.start;
});
window.PLAN = plan.map(s => [s.id, +s.start.toFixed(2), +s.end.toFixed(2)]);

// —— Renderer ——
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
const pmrem = new THREE.PMREMGenerator(renderer);
const ENV = pmrem.fromScene(new RoomEnvironment(), .04).texture;

await Promise.all(['Xingkai', 'Kaiti'].map(f => document.fonts.load(`76px ${f}`, '爱怎么了收拾行李整理着包裹飘逸楷体')));

// —— Subtitles: 每一句的位置与进度都来自 cues.js（SRT 句窗口 + 逐字时间戳）——
const subs = document.getElementById('subs');
const lineEls = LINES.map(L => {
  const el = document.createElement('div');
  el.className = 'line';
  const bottom = (L.i === 6) ? 380 : 340;   // S20–S21 抬到 380：角色剪影位于中下部（v2.1 §4.3）
  el.style.bottom = bottom + 'px';
  const spans = [];
  for (const c of L.ch) {
    const s = document.createElement('span');
    s.className = c.c === ' ' ? 'c sp' : 'c';
    s.textContent = c.c === ' ' ? '\u3000' : c.c;
    el.appendChild(s); spans.push(s);
  }
  subs.appendChild(el);
  return { L, el, spans, lit: new Array(L.ch.length).fill(false) };
});
let curLine = -1;
function drawSubs(t) {
  let k = -1;
  for (let i = 0; i < LINES.length; i++) {
    const L = LINES[i];
    if (t > L.s - 0.18 && t < L.e + 0.14) { k = i; break; }
  }
  if (k !== curLine) {
    if (curLine >= 0) { lineEls[curLine].el.style.opacity = 0; }
    curLine = k;
  }
  if (k < 0) return;
  const { L, el, spans, lit } = lineEls[k];
  // 早 0.15s 淡入 / 晚 0.1s 淡出，时间严格取自 SRT
  const a = Math.min(ss(seg(t, L.s - 0.15, L.s + 0.08)), 1 - ss(seg(t, L.e + 0.04, L.e + 0.14)));
  el.style.opacity = a.toFixed(3);
  for (let i = 0; i < spans.length; i++) {
    const on = t >= L.ch[i].s - 0.01;
    if (on !== lit[i]) { lit[i] = on; spans[i].classList.toggle('lit', on); }
  }
}

// —— Shot cache: build on first use, release what the current time doesn't need ——
const live = new Map();
async function get(i) {
  const p = plan[i];
  if (!live.has(i)) {
    const t0 = performance.now();
    live.set(i, await p.build({ dur: p.dur, T0: p.start, DUR, env: ENV, W, H }));
    if (Q.get('log')) console.log('built', p.id, Math.round(performance.now() - t0) + 'ms');
  }
  return live.get(i);
}
function gc(keep) { for (const [i, s] of live) if (!keep.includes(i)) { dispose(s.S.scene); live.delete(i); } }

async function drawShot(i, t, target) {
  const s = await get(i), tl = t - plan[i].start;
  s.update(tl, t);
  if (Q.get('dbg')) window.CUR = s;
  pipe.shot(s.S.scene, s.S.cam, s.post(tl, t), target);
  return s.grade(tl, t);
}

window.render = async (t) => {
  let i = plan.findIndex(p => t >= p.start && t < p.end); if (i < 0) i = plan.length - 1;
  const p = plan[i], tl = t - p.start, tr = p.in || { type: 'cut', dur: 0 };
  let mixB = 0, g;
  if (i > 0 && tr.type !== 'cut' && tl < tr.dur) {
    await drawShot(i - 1, t, pipe.rtA);
    g = await drawShot(i, t, pipe.rtB);
    mixB = (tr.ease || ss)(tl / tr.dur);
    gc([i - 1, i]);
  } else {
    g = await drawShot(i, t, pipe.rtA); gc([i]);
  }
  const tail = (Q.get('only') ? 1 : ss(clamp((DUR - t) / 0.72)));   // 收黑
  pipe.final({ ...g, mixB, mode: tr.type === 'iris' ? 1 : 0, center: tr.center, time: t, fade: (g.fade ?? 1) * tail });
  drawSubs(t);
};

window.READY = true;
