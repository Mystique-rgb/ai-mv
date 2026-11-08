// core.js — 《可不可以》· 遗失物认领单 · 半调案卷
// 纸 / 网点 / 墨线 / 字 / 钢印 / 擦除. 一切在这张纸上印出来。
const W = 1920, H = 1080;
const PAL = {
  paper: '#F2E8D5', ink: '#1B2A44', red: '#D4482F', yellow: '#F2B705',
  teal: '#2F7E8A', pink: '#E8748E', deep: '#0E1626',
  paperS: '#EDE3CE', paperP: '#F7EFDD',
};
const FONT = { serif: '"SerifHeavy"', kai: '"Kaiti"', mono: '"Mono"' };

// ---------- 数值 ----------
const PI2 = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, v) => clamp((v - a) / (b - a || 1e-6));
const smooth = k => k * k * (3 - 2 * k);
const backOut = k => { const c = 1.70158; k -= 1; return 1 + (c + 1) * k * k * k + c * k * k; };
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeIn = k => k * k * k;

function hash2(a, b) {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x7f4a7c15, 0xc2b2ae35);
  h ^= h >>> 15; h = Math.imul(h, 0x2545f491); h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}
function hash3(a, b, c) { return hash2(Math.imul(a | 0, 73856093) ^ (b | 0), Math.imul(c | 0, 19349663) ^ 0x5bf03635); }
// 稳定随机数：同 (镜号, 对象, 帧块) 得到同一个扰动 → 跨帧不"沸腾"
function srand(seed) { let s = (seed | 0) || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) / 4294967296); }; }
// 手绘抖：沿法线的低频扰动。amp≈2.2px，10 次/秒换种子
const BOIL_FPS = 10;
function boilAt(t) { return Math.floor(t * BOIL_FPS); }
function wob(pts, amp, key, closed = true) {
  const k = key | 0, n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n], r = pts[(i - 1 + n) % n];
    const dx = q[0] - r[0], dy = q[1] - r[1], L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L;
    const s = hash3(k, i, 7) * 2 - 1, s2 = hash3(k, i, 13) * 2 - 1;
    out.push([p[0] + nx * s * amp + dx / L * s2 * amp * .45,
              p[1] + ny * s * amp + dy / L * s2 * amp * .45]);
  }
  return out;
}

// ---------- 形状生成 ----------
function rectPts(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
function rrectPts(x, y, w, h, r, seg = 6) {
  r = Math.min(r, Math.min(w, h) / 2); const o = [];
  const C = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]];
  for (const [cx, cy, a0] of C) for (let i = 0; i <= seg; i++) { const a = a0 + (Math.PI / 2) * i / seg; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return o;
}
function ellPts(cx, cy, rx, ry, n = 26) { const o = []; for (let i = 0; i < n; i++) { const a = i / n * PI2; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; }
function arcPts(cx, cy, r, a0, a1, n = 14) { const o = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; }
function starPts(cx, cy, r1, r2, n = 8, rot = 0) {
  const o = [];
  for (let i = 0; i < n * 2; i++) { const a = rot + i / (n * 2) * PI2, r = i % 2 ? r2 : r1; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return o;
}
function path(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }

// ---------- 网点 ----------
// dens(u,v,x,y) -> 0..1；按"覆盖率"算点径：r = step/2*√d*1.13（d=1 时点连成实墨）
function dots(box, dens, o = {}) {
  const step = o.step || 22, ang = (o.angle ?? 15) * Math.PI / 180;
  const k = o.k ?? 1, ca = Math.cos(ang), sa = Math.sin(ang);
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2, R = Math.hypot(box.w, box.h) / 2 + step;
  const ctx = CTX;
  ctx.save();
  ctx.fillStyle = o.color || PAL.ink;
  ctx.globalAlpha = o.alpha ?? 1;
  if (o.clip) { path(ctx, o.clip); ctx.clip(); }
  ctx.beginPath();
  for (let i = -R; i <= R; i += step) {
    for (let j = -R; j <= R; j += step) {
      const x = cx + i * ca - j * sa, y = cy + i * sa + j * ca;
      if (x < box.x - step || x > box.x + box.w + step || y < box.y - step || y > box.y + box.h + step) continue;
      let d = dens((x - box.x) / (box.w || 1), (y - box.y) / (box.h || 1), x, y);
      if (o.ph) d *= 1 + o.ph * .1 * Math.sin((x + y) * .05 + o.phT * 6);
      if (d <= .012) continue;
      const r = step * .5 * Math.sqrt(Math.min(1, d)) * 1.13 * k;
      ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, PI2);
    }
  }
  ctx.fill();
  ctx.restore();
}
const D = {
  flat: v => () => v,
  radial: (cx, cy, r, v0 = 1, v1 = 0, pow = 1) => (u, v) => {
    const d = Math.hypot(u - cx, v - cy) / r;
    return lerp(v0, v1, Math.pow(clamp(d), pow));
  },
  inward: (cx, cy, r, v0 = 0, v1 = 1) => (u, v) => lerp(v0, v1, smooth(clamp(Math.hypot(u - cx, v - cy) / r))),
  edge: (v0 = 0, v1 = 1, w = .34) => (u, v) => {
    const d = Math.min(u, 1 - u, v, 1 - v);
    return lerp(v1, v0, clamp(d / w));
  },
  ramp: (v0, v1, a = 90) => (u, v) => {
    const r = a * Math.PI / 180, p = u * Math.cos(r) + v * Math.sin(r);
    return lerp(v0, v1, clamp(p));
  },
  band: (v0, v1, y0, y1) => (u, v) => lerp(v0, v1, clamp((v - y0) / (y1 - y0 || 1e-6))),
  noise: (v, scale = 6, seed = 1) => (u, v2) => clamp(v + (Math.sin(u * scale + seed) * Math.cos(v2 * scale * 1.3 - seed) * .5 + .5) * .22 - .11),
};

// ---------- 墨块 ----------
// 填充 + 粗墨线（7px @1080p）+ 可选网点阴影
function shape(pts, o = {}) {
  const ctx = CTX;
  const amp = o.boil === false ? 0 : (o.amp ?? 2.2);
  const P = amp ? wob(pts, amp, o.seed ?? 1) : pts;
  if (o.clipOnly) { path(ctx, P); ctx.clip(); return P; }
  path(ctx, P);
  if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
  // 网点阴影（印刷明暗只靠点）
  if (o.shade) {
    const bb = bbox(P);
    ctx.save(); path(ctx, P); ctx.clip();
    const col = o.shadeCol || PAL.ink;
    ctx.globalAlpha = o.shadeAlpha ?? .5;
    ctx.fillStyle = col;
    const st = o.shadeStep || 20, dens = o.shadeDens || ((u, v) => clamp(u * .9 - .05));
    ctx.beginPath();
    for (let y = bb.y; y < bb.y + bb.h; y += st) for (let x = bb.x; x < bb.x + bb.w; x += st) {
      const d = dens((x - bb.x) / (bb.w || 1), (y - bb.y) / (bb.h || 1));
      if (d <= .03) continue;
      const r = d * st * .40;
      ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, PI2);
    }
    ctx.fill(); ctx.restore();
  }
  if (o.ink) {
    path(ctx, P);
    ctx.strokeStyle = o.ink; ctx.lineWidth = o.sw ?? 7; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (o.gap !== false) {           // 12–25% 断口
      const bb = bbox(P), L = (bb.w + bb.h) * 1.2;
      ctx.setLineDash([L * (.16 + hash3(o.seed ?? 1, 3, 9) * .1), L * (.018 + hash3(o.seed ?? 1, 5, 11) * .02)]);
      ctx.lineDashOffset = L * hash3(o.seed ?? 1, 7, 13);
    }
    if (o.inkAlpha != null) ctx.globalAlpha = o.inkAlpha;
    ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
  }
  return P;
}
function bbox(P) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const p of P) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}
// 一根墨线（手绘抖，可断）
function inkLine(pts, o = {}) {
  const ctx = CTX, amp = o.amp ?? 1.8;
  const P = amp ? wob(pts, amp, o.seed ?? 1, false) : pts;
  ctx.save();
  ctx.strokeStyle = o.color || PAL.ink; ctx.lineWidth = o.sw ?? 5;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (o.dash) { ctx.setLineDash(o.dash); }
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length; i++) {
    const m = P[i - 1], n = P[i];
    ctx.quadraticCurveTo(m[0], m[1], (m[0] + n[0]) / 2, (m[1] + n[1]) / 2);
  }
  const last = P[P.length - 1]; ctx.lineTo(last[0], last[1]);
  ctx.stroke(); ctx.setLineDash([]); ctx.restore();
}

// ---------- 纸 ----------
let PAPER_CACHE = {};
function paperTex(model, seed) {
  const key = model + '|' + seed;
  if (PAPER_CACHE[key]) return PAPER_CACHE[key];
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const base = { 'D-DAY': PAL.paper, 'S-STEEL': PAL.paperS, 'N-STREET': PAL.deep, 'P-2019': PAL.paperP, 'X-VOID': PAL.deep }[model] || PAL.paper;
  x.fillStyle = base; x.fillRect(0, 0, W, H);
  const dark = model === 'N-STREET' || model === 'X-VOID';
  const r = srand(12345 + seed);
  // 低频斑驳
  for (let i = 0; i < 90; i++) {
    const cx = r() * W, cy = r() * H, rad = 90 + r() * 320;
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
    const a = .012 + r() * .028;
    g.addColorStop(0, dark ? `rgba(47,126,138,${a})` : `rgba(150,116,72,${a})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
  }
  // 纸纤维
  for (let i = 0; i < 1400; i++) {
    const cx = r() * W, cy = r() * H, len = 6 + r() * 26, a = r() * Math.PI;
    x.strokeStyle = dark ? `rgba(140,170,180,${.02 + r() * .04})` : `rgba(120,96,66,${.02 + r() * .05})`;
    x.lineWidth = .7 + r() * .8;
    x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); x.stroke();
  }
  // 暗角
  const g = x.createRadialGradient(W * .5, H * .48, H * .28, W * .5, H * .5, H * .95);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, dark ? 'rgba(0,0,0,.42)' : 'rgba(60,44,24,.16)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  // 一道折痕
  const fx = W * .505;
  const fg = x.createLinearGradient(fx - 26, 0, fx + 26, 0);
  fg.addColorStop(0, 'rgba(0,0,0,0)');
  fg.addColorStop(.46, dark ? 'rgba(0,0,0,.30)' : 'rgba(90,70,44,.10)');
  fg.addColorStop(.52, dark ? 'rgba(190,210,215,.06)' : 'rgba(255,252,240,.34)');
  fg.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = fg; x.fillRect(fx - 26, 0, 52, H);
  PAPER_CACHE[key] = c;
  return c;
}
let CTX = null;
// 铺纸 + 每帧颗粒 + 底层网点（全片只有这一层"满屏网点"，很轻）
function paper(model, t, seed = 0) {
  const ctx = CTX;
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.drawImage(paperTex(model, seed), 0, 0, W, H);
  const dark = model === 'N-STREET' || model === 'X-VOID';
  // 底层网点：中间几乎干净，靠边和四角才长点
  const base = 0;
  ctx.globalAlpha = dark ? 0 : .5;      // 夜场不铺满屏网点：灯要靠场景自己打
  dots({ x: 0, y: 0, w: W, h: H }, (u, v) => {
    const d = Math.min(u, 1 - u, v, 1 - v);
    return base + .035 * Math.exp(-d / .075) * (dark ? 1.15 : 1);
  }, { step: dark ? 24 : 26, color: dark ? '#7C9AA2' : PAL.ink, angle: dark ? 45 : 15 });
  // 颗粒
  const r = srand(9001 + Math.floor(t * 15));
  ctx.beginPath(); ctx.fillStyle = dark ? 'rgba(210,225,225,.5)' : 'rgba(255,252,242,.55)';
  for (let i = 0; i < 230; i++) { const x = r() * W, y = r() * H, s = .8 + r() * 1.7; ctx.moveTo(x + s, y); ctx.arc(x, y, s, 0, PI2); }
  ctx.fill();
  ctx.beginPath(); ctx.fillStyle = dark ? 'rgba(0,0,0,.5)' : 'rgba(48,36,22,.34)';
  for (let i = 0; i < 90; i++) { const x = r() * W, y = r() * H, s = .7 + r() * 1.3; ctx.moveTo(x + s, y); ctx.arc(x, y, s, 0, PI2); }
  ctx.fill();
  ctx.restore();
}

// ---------- 字 ----------
function txt(s, x, y, o = {}) {
  const ctx = CTX;
  ctx.save();
  const size = o.size || 40, fam = o.font || FONT.kai;
  ctx.font = `${o.weight || 400} ${size}px ${fam}`;
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.baseline || 'alphabetic';
  ctx.letterSpacing = (o.spacing || 0) + 'px';
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  if (o.shadow) {                     // 套印偏移影
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = o.shadow; ctx.globalAlpha = (o.alpha ?? 1) * .85;
    ctx.fillText(s, x + (o.shx ?? 8), y + (o.shy ?? 8));
    ctx.restore();
  }
  if (o.ink) {
    ctx.strokeStyle = o.ink; ctx.lineWidth = o.sw ?? 6; ctx.lineJoin = 'round';
    ctx.strokeText(s, x, y);
  }
  ctx.fillStyle = o.color || PAL.ink;
  ctx.fillText(s, x, y);
  ctx.restore();
}
function measure(s, size, fam, weight = 400) {
  const ctx = CTX; ctx.save(); ctx.font = `${weight} ${size}px ${fam}`; const w = ctx.measureText(s).width; ctx.restore(); return w;
}
// 大字（标题）：套印影 + 逐字落版
function headline(s, x, y, o = {}) {
  const size = o.size || 120, fam = o.font || FONT.serif;
  const ctx = CTX;
  ctx.save();
  ctx.font = `${o.weight || 900} ${size}px ${fam}`;
  ctx.textBaseline = 'alphabetic';
  const chars = [...s];
  let cx = x;
  const track = o.track ?? 0;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const cw = ctx.measureText(ch).width;
    const k = o.pop ? clamp((o.pop - i * (o.stagger ?? .055)) / .3) : 1;
    const ky = (1 - backOut(k)) * (o.drop ?? 60);
    const sq = 1 - (1 - k) * .5;
    ctx.save();
    ctx.translate(cx + cw / 2, y + ky);
    ctx.scale(1 + (1 - sq) * .4, sq);
    ctx.textAlign = 'center';
    if (k > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = o.shadow || PAL.red; ctx.globalAlpha = (o.alpha ?? 1) * (o.shadowAlpha ?? .55);
      ctx.fillText(ch, (o.shx ?? 8), (o.shy ?? 8));
      ctx.restore();
      ctx.fillStyle = o.color || PAL.ink; ctx.globalAlpha = o.alpha ?? 1;
      ctx.fillText(ch, 0, 0);
    }
    ctx.restore();
    cx += cw + track;
  }
  ctx.restore();
  return cx - x;
}

// ---------- 钢印 ----------
// o: {x,y,text,sub,scale,rot,ink,age,dur,mode:'slam'|'static'}
function stamp(o) {
  const ctx = CTX, s = o.scale ?? 1, rot = (o.rot ?? -6) * Math.PI / 180;
  const w = 470, h = 190, ink = o.ink || PAL.red, sd = o.seed || 1;
  ctx.save();
  ctx.translate(o.x, o.y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.globalAlpha = o.alpha ?? .92;
  ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // 双框（手绘抖 + 断墨）
  ctx.lineWidth = 11; path(ctx, wob(rrectPts(-w / 2, -h / 2, w, h, 12), 2.4, sd)); ctx.stroke();
  ctx.lineWidth = 4.5; path(ctx, wob(rrectPts(-w / 2 + 15, -h / 2 + 15, w - 30, h - 30, 8), 1.8, sd + 5)); ctx.stroke();
  // 字
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = `900 78px ${FONT.serif}`;
  ctx.fillText(o.text || '受理', 0, 10);
  if (o.sub) {
    ctx.font = `700 28px ${FONT.mono}`; ctx.letterSpacing = '8px';
    ctx.fillText(o.sub, 4, 62); ctx.letterSpacing = '0px';
  }
  // 油墨不匀：极细的针孔（不吃掉笔画）
  ctx.save();
  path(ctx, rrectPts(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 8)); ctx.clip();
  ctx.globalCompositeOperation = 'destination-out';
  const r = srand(707 + sd * 13);
  for (let i = 0; i < 170; i++) {
    const x = (r() - .5) * w, y = (r() - .5) * h, rad = .5 + r() * 1.3;
    ctx.beginPath(); ctx.arc(x, y, rad, 0, PI2); ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

// ---------- 字幕（说明条） ----------
// 华文楷体 · 快打字机入场（整句 0.6s 内出全）· 卡拉 OK 逐字上色（颜色跟着唱到哪个字）· 深墨药丸 + 套印红偏移影
function caption(line, t, o = {}) {
  if (!line) return;
  const ctx = CTX, size = o.size || 46, fam = FONT.kai;
  const chars = line.chars && line.chars.length === [...line.text].length
    ? line.chars : [...line.text].map((c, i) => [c, line.t0 + i * .12]);
  const track = 2;
  const widths = [...line.text].map(c => measure(c, size, fam));
  const total = widths.reduce((a, b) => a + b, 0) + track * (widths.length - 1);
  const padX = 46, barH = size * 2.06;
  const barW = Math.min(W * .78, total + padX * 2);
  const cx = W / 2, cy = o.y ?? (H - 96 - barH / 2);
  // 入场
  const age = t - (o.t0 ?? line.t0 - .12);
  const k = clamp(age / .30);
  if (k <= 0) return;
  const rise = (1 - backOut(k)) * 70;
  const kw = o.keyword || '';
  const kwColor = o.kwColor || PAL.yellow;
  ctx.save();
  ctx.translate(cx, cy + rise);
  const sq = 1 - (1 - k) * .12;
  ctx.scale(1, sq);
  // 药丸
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  shape(rrectPts(-barW / 2 + 6, -barH / 2 + 6, barW, barH, barH / 2), { fill: PAL.red, ink: null, boil: false });
  ctx.restore();
  shape(rrectPts(-barW / 2, -barH / 2, barW, barH, barH / 2), { fill: PAL.ink, ink: null, boil: false });
  // 逐字打进：整句 0.6s 内出全（可读），颜色跟着唱到哪个字（对齐）
  let x = -total / 2;
  ctx.textBaseline = 'middle';
  const str = [...line.text];
  const stagger = Math.min(.048, .55 / Math.max(1, str.length));
  for (let i = 0; i < str.length; i++) {
    const kk = clamp((t - (o.t0 ?? line.t0 - .10) - i * stagger) / .13);
    if (kk > 0) {
      const sung = t >= chars[i][1];                 // 这个字已经唱到了
      const idx = line.text.indexOf(kw);
      const hit = kw && idx >= 0 && i >= idx && i < idx + kw.length;
      ctx.save();
      ctx.globalAlpha = (o.alpha ?? 1) * clamp(kk * 2);
      const pop = sung ? Math.exp(-(t - chars[i][1]) * 14) : 0;
      ctx.translate(x + widths[i] / 2, (1 - backOut(kk)) * -34);
      ctx.scale(1 + (1 - kk) * .3 + pop * .10, 1 - (1 - kk) * .35 + pop * .06);
      ctx.font = `${o.weight || 700} ${size}px ${fam}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = sung ? kwColor : (hit ? mix(kwColor, PAL.paper, .5) : PAL.paper);
      ctx.fillText(str[i], 0, 2);
      ctx.restore();
    }
    x += widths[i] + track;
  }
  ctx.restore();
}

// ---------- HUD ----------
function hud(o = {}) {
  const ctx = CTX, dark = o.dark;
  const fg = dark ? PAL.paper : PAL.ink;
  const alpha = o.alpha ?? 1;
  ctx.save(); ctx.globalAlpha = alpha;
  // 左上：案卷号 + 章节
  const x = 74, y = 78;
  ctx.fillStyle = fg; ctx.fillRect(x, y - 26, 6, 26);
  txt(o.caseNo || 'KB-2019-0703', x + 18, y, { size: 27, font: FONT.mono, weight: 700, color: fg, spacing: 1.5, alpha });
  if (o.chip) {
    const cw = measure(o.chip, 22, FONT.mono, 700) + 34;
    ctx.globalAlpha = alpha * .9;
    shape(rrectPts(x, y + 14, cw, 38, 6), { fill: fg, ink: null, boil: false });
    txt(o.chip, x + cw / 2, y + 40, { size: 22, font: FONT.mono, weight: 700, color: dark ? PAL.deep : PAL.paper, align: 'center', alpha });
    ctx.globalAlpha = alpha;
  }
  // 右上：过期时钟
  if (o.clock !== false) {
    const str = o.clockStr || 'EXPIRED 4Y 04M 05D';
    const sec = o.secStr ?? '00:00:00';
    ctx.textAlign = 'right';
    txt(str, W - 74, y, { size: 27, font: FONT.mono, weight: 700, color: fg, spacing: 1.5, align: 'right', alpha });
    txt(sec, W - 74, y + 34, { size: 25, font: FONT.mono, weight: 700, color: o.secColor || PAL.red, spacing: 2, align: 'right', alpha });
    ctx.textAlign = 'left';
  }
  // 右下：页码
  if (o.page) {
    txt(`P.${String(o.page).padStart(3, '0')}`, W - 74, H - 58, { size: 30, font: FONT.mono, weight: 700, color: fg, align: 'right', alpha: alpha * .9 });
    txt('/ 047', W - 74, H - 32, { size: 18, font: FONT.mono, weight: 700, color: fg, align: 'right', alpha: alpha * .5 });
  }
  ctx.restore();
}

// ---------- 套印错位 ----------
// 由 main.js 在合成阶段处理（整层色版偏 6px 再回位）
