// util.js — 基础函数
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, t) => { const x = clamp((t - a) / (b - a || 1e-6), 0, 1); return x * x * (3 - 2 * x); };
const easeOut = x => 1 - Math.pow(1 - x, 3);
const easeIn = x => x * x * x;
const easeInOut = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const easeBack = x => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function hash2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }

function rr(g, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  g.beginPath();
  g.moveTo(x + r, y);
  g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y);
  g.closePath();
}
function poly(g, pts) {
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
}
function ellipse(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, TAU); }

// 时间轴工具：拍 / 小节
const S = () => window.SONG;
function beatIndex(t) {
  const b = S().beats; let lo = 0, hi = b.length - 1, r = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (b[m] <= t) { r = m; lo = m + 1; } else hi = m - 1; }
  return r;
}
function beatPhase(t) {
  const b = S().beats, i = beatIndex(t);
  if (i < 0) return { i: -1, ph: 0, since: 0, period: S().beat };
  if (i >= b.length - 1) return { i, ph: 1, since: t - b[i], period: S().beat };
  const p = (t - b[i]) / (b[i + 1] - b[i] || S().beat);
  return { i, ph: p, since: t - b[i], period: b[i + 1] - b[i] };
}
// 最近的底鼓包络（0..1，按 strength 衰减）
function kickEnv(t, tau = 0.17) {
  const k = S().kicks; let best = 0;
  for (let i = k.length - 1; i >= 0; i--) {
    if (k[i][0] > t) continue;
    if (k[i][0] < t - 0.9) break;
    const dt = t - k[i][0];
    best = Math.max(best, k[i][1] * Math.exp(-dt / tau));
    if (dt > 0.6) break;
  }
  return best;
}
// 取当前拍内第几个 1/4 拍（用于每拍的子事件）
function subPhase(t, n = 4) { const { ph } = beatPhase(t); return Math.floor(ph * n); }
// 段落
function sectionAt(t) {
  for (const s of S().sections) if (t >= s.t0 && t < s.t1) return s;
  return S().sections[S().sections.length - 1];
}
function lineAt(t) {
  for (const L of S().lines) if (t >= L.t0 - 0.02 && t <= L.t1 + 0.02) return L;
  return null;
}
