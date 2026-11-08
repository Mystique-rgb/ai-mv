// 80s 特效库：光带横扫 / 冲击帧 / 玻璃碎片 / 雨 / 速度线 / 粉雾 / 手印 / 反相
import { path, rgba, hash, airbrush, TAU } from '/styles/cel-anime-80s/demo/cel.js';

// 光带横扫（不重画角色，只移动光）
export function lightBand(g, o) {
  const col = o.col || '#FFF3D6', a = o.a ?? .16;
  g.save(); g.globalCompositeOperation = 'screen';
  const gr = g.createLinearGradient(o.x - o.w, 0, o.x + o.w, 0);
  gr.addColorStop(0, rgba(col, 0)); gr.addColorStop(.42, rgba(col, a * .6));
  gr.addColorStop(.5, rgba(col, a)); gr.addColorStop(.58, rgba(col, a * .6)); gr.addColorStop(1, rgba(col, 0));
  g.fillStyle = gr;
  g.fill(path([[o.x - o.w, o.y0], [o.x + o.w, o.y0], [o.x + o.w + (o.slant || 0), o.y1], [o.x - o.w + (o.slant || 0), o.y1]]));
  g.restore();
}
// 全画面反相（冲击帧）
export function invert(g) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'difference'; g.fillStyle = '#fff'; g.fillRect(0, 0, 1920, 1080);
  g.restore();
}
// 冲击帧用的放射线
export function radialLines(g, cx, cy, n = 54, seed = 3, col = 'rgba(255,255,255,.7)', len = 2200) {
  g.save(); g.strokeStyle = col; g.lineCap = 'butt';
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + hash(i + seed) * .2;
    const w = 2 + hash(i * 3 + seed) * 12;
    g.lineWidth = w;
    g.beginPath(); g.moveTo(cx + Math.cos(a) * 120, cy + Math.sin(a) * 120);
    g.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); g.stroke();
  }
  g.restore();
}
// 速度线
export function speedLines(g, cx, cy, t, amt = 1, col = 'rgba(255,255,255,.35)') {
  g.save(); g.strokeStyle = col; g.globalCompositeOperation = 'screen';
  for (let i = 0; i < 40; i++) {
    const a = hash(i * 1.7) * TAU, ph = (t * 2.2 + hash(i * 2.3)) % 1;
    const r0 = 400 + ph * 900, r1 = r0 + 120 + hash(i) * 260 * amt;
    g.lineWidth = 1.5 + hash(i * 5.1) * 3;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke();
  }
  g.restore();
}
// 雨
export function rain(g, t, o = {}) {
  const n = o.n ?? 150, sl = o.slant ?? -.18, sp = o.speed ?? 1500, col = o.col || 'rgba(190,230,255,.45)';
  const x0 = o.x0 ?? -200, x1 = o.x1 ?? 2120, y0 = o.y0 ?? -100, y1 = o.y1 ?? 1180;
  g.save(); g.strokeStyle = col; g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const sp2 = sp * (.7 + hash(i * 3.3) * .8);
    const x = x0 + ((hash(i * 1.7) * (x1 - x0) + t * sp2 * sl) % (x1 - x0) + (x1 - x0)) % (x1 - x0);
    const y = y0 + ((hash(i * 2.9) * (y1 - y0) + t * sp2) % (y1 - y0));
    const l = 24 + hash(i * 5.5) * 54;
    g.lineWidth = 1.2 + hash(i * 7.1) * 1.8;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x - l * sl * 2.2, y + l); g.stroke();
  }
  g.restore();
}
// 玻璃碎片：大块为主，块数不能多到像雪
const SH_COLS = 14, SH_ROWS = 12;
export function makeShards(x, y, w, h) {
  const cols = SH_COLS, rows = SH_ROWS, arr = [];
  const cw = w / cols, ch = h / rows;
  const cx0 = x + w / 2, cy0 = y + h / 2;
  let seed = 3;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const px = x + i * cw, py = y + j * ch;
    const J = () => (rnd() - .5) * cw * .55;
    const p0 = [px + J(), py + J()], p1 = [px + cw + J(), py + J()];
    const p2 = [px + cw + J(), py + ch + J()], p3 = [px + J(), py + ch + J()];
    // 沿随机对角线切成两片：碎片不规则，才不像瓷砖
    const cut = .3 + rnd() * .4;
    const m1 = [p0[0] + (p2[0] - p0[0]) * cut, p0[1] + (p2[1] - p0[1]) * cut];
    const m2 = [p1[0] + (p3[0] - p1[0]) * cut, p1[1] + (p3[1] - p1[1]) * cut];
    const tris = rnd() > .55 ? [[p0, p1, m1], [p1, p2, m2], [m1, m2, p3]] : [[p0, p1, p2, m1], [m1, p2, p3]];
    for (const pts of tris) {
      const mx = pts.reduce((a, q) => a + q[0], 0) / pts.length;
      const my = pts.reduce((a, q) => a + q[1], 0) / pts.length;
      const dx = mx - cx0, dy = my - cy0, d = Math.hypot(dx, dy) || 1;
      arr.push({ pts, mx, my, dx: dx / d, dy: dy / d, d, sp: .45 + rnd() * .9, rot: (rnd() - .5) * 3.2, a: .1 + rnd() * .18, hi: rnd() > .55 });
    }
  }
  return arr;
}
export function drawShards(g, e, shards, prog, S, opts = {}) {
  const PR = S.prop;
  g.save();
  for (const s of shards) {
    if (opts.filter && !opts.filter(s)) continue;
    const p = Math.max(0, prog);
    const k = p * p;
    const off = k * (260 + s.d * .9) * s.sp;
    const x = s.mx + s.dx * off, y = s.my + s.dy * off;
    const sc = 1 - .25 * p * s.sp;
    g.save(); g.translate(x, y); g.rotate(s.rot * p * 2.2); g.scale(sc, sc);
    g.beginPath();
    s.pts.forEach((q, i) => { const px = q[0] - s.mx, py = q[1] - s.my; i ? g.lineTo(px, py) : g.moveTo(px, py); });
    g.closePath();
    g.fillStyle = rgba(S.env.glassHi, s.a ?? .2); g.fill();
    g.strokeStyle = rgba('#CFEAF8', .5); g.lineWidth = 2.2; g.stroke();
    if (s.hi) {   // 只给少数碎片一条反光，不是每片都闪
      g.fillStyle = 'rgba(255,255,255,.28)';
      g.fill(path([[s.pts[0][0] - s.mx, s.pts[0][1] - s.my], [s.pts[1][0] - s.mx, s.pts[1][1] - s.my], [s.pts[1][0] - s.mx, s.pts[1][1] - s.my + 7], [s.pts[0][0] - s.mx, s.pts[0][1] - s.my + 7]]));
    }
    g.restore();
    if (e && (p > .02) && s.hi) {
      const a = .2 * (1 - Math.min(1, p)) * s.sp;
      e.fillStyle = rgba('#CFEFFF', a);
      e.fillRect(x - 7, y - 7, 14, 14);
    }
  }
  g.restore();
}
// 粉雾（玻璃后面的东西开始存在）
export function pinkFog(g, e, o) {
  const amt = o.amt ?? 1;
  g.save();
  airbrush(g, o.x, o.y, o.rx, o.ry, '#FF8FA8', .34 * amt);
  airbrush(g, o.x + o.rx * .2, o.y - o.ry * .15, o.rx * .55, o.ry * .55, '#FFC2CE', .34 * amt);
  g.restore();
  if (e) {
    e.save(); e.globalCompositeOperation = 'lighter';
    airbrush(e, o.x, o.y, o.rx * 1.1, o.ry * 1.1, '#FF6E92', .5 * amt);
    e.restore();
  }
}
export function pinkDust(g, e, t, cx, cy, r, amt = .5) {
  for (let i = 0; i < 26; i++) {
    const a = hash(i * 1.3) * TAU + t * .5 * (hash(i) - .5);
    const rr2 = r * (.3 + hash(i * 2.1) * .8);
    const x = cx + Math.cos(a) * rr2, y = cy + Math.sin(a) * rr2 * .8;
    const s = 2 + hash(i * 3.7) * 4;
    g.fillStyle = rgba('#FFB3C4', amt * (.4 + hash(i * 5.1) * .6));
    g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
  }
}
// 雾里的手印
export function handprint(g, e, o) {
  const a = o.a ?? .8, s = o.s ?? 1;
  const col = o.col ?? '#FFFFFF';
  g.save(); g.translate(o.x, o.y); g.scale(s, s); g.globalAlpha = a;
  const palm = new Path2D();
  palm.ellipse(0, 0, 30, 38, 0, 0, TAU);
  g.fillStyle = rgba(col, .5); g.fill(palm);
  g.fillStyle = rgba(col, .45);
  const fingers = [[-24, -40, 11, 30, -.5], [-8, -52, 11, 34, -.16], [8, -54, 11, 34, .1], [23, -44, 10, 28, .42]];
  for (const [fx, fy, fw, fh, rot] of fingers) {
    g.save(); g.translate(fx, fy); g.rotate(rot);
    g.beginPath(); g.roundRect(-fw / 2, -fh / 2, fw, fh, fw / 2); g.fill(); g.restore();
  }
  g.beginPath(); g.roundRect(-46, -6, 16, 34, 8); g.fill();
  g.restore();
  if (e) { e.save(); e.globalCompositeOperation = 'lighter'; airbrush(e, o.x, o.y, 60 * s, 70 * s, col, .26 * a); e.restore(); }
}
// CRT 噪声条（磁带滚道）
export function trackingBar(g, t, y, h = 46) {
  g.save(); g.globalAlpha = .75;
  for (let i = 0; i < 220; i++) {
    const x = hash(i * 1.7 + Math.floor(t * 40)) * 1920;
    const w = 20 + hash(i * 2.9) * 120;
    g.fillStyle = rgba('#E8F4FF', .1 + hash(i * 4.3) * .5);
    g.fillRect(x, y + (hash(i * 6.1) - .5) * h, w, 2 + hash(i) * 3);
  }
  g.restore();
}
