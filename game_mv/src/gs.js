// gs.js: 「综艺节奏扁平」画具箱。
// 规则（照 STORYBOARD.md 的画风卡）：平涂、一种近黑描边、硬偏移投影、无渐变无模糊；
// 一格一色相；角色是玩具；每个图形都在拍上 pop / squash / 转。
const OS = 760;   // overscan：镜头推拉位移时不能露底

// ---------- 底 ----------
function bg(col) { paint(rectPts(-OS, -OS, W + 2 * OS, H + 2 * OS), { wash: col, ink: null }); }
function rays(cx, cy, col, n = 24, rot = 0, r = 2800, a = 1) {
  for (let i = 0; i < n; i++) {
    const a0 = rot + i / n * TAU, a1 = a0 + TAU / n * .5;
    paint([[cx, cy], [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r], [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r]], { wash: col, washOp: 255 * a, ink: null });
  }
}
function stripes(col, gap = 96, rot = -.36, off = 0, w = .5, a = 1) {
  push(); translate(960, 540); rotate(rot);
  for (let x = -2400; x < 2400; x += gap) paint(rectPts(x + (off % gap), -2000, gap * w, 4000), { wash: col, washOp: 255 * a, ink: null });
  pop();
}
function dots(col, gap = 120, r = 24, ox = 0, oy = 0, a = 1) {
  for (let y = -OS; y < H + OS; y += gap) for (let x = -OS; x < W + OS; x += gap) {
    const o = (Math.round((y + OS) / gap) % 2) * gap / 2;
    paint(ellPts(x + o + (ox % gap), y + (oy % gap), r, r, 14), { wash: col, washOp: 255 * a, ink: null });
  }
}
function gridLines(col, gap = 120, lw = 4, ox = 0, oy = 0, a = 1) {
  const c = drawingContext; c.save(); c.globalAlpha = a; c.strokeStyle = col; c.lineWidth = lw;
  c.beginPath();
  for (let x = -OS + (ox % gap); x < W + OS; x += gap) { c.moveTo(x, -OS); c.lineTo(x, H + OS); }
  for (let y = -OS + (oy % gap); y < H + OS; y += gap) { c.moveTo(-OS, y); c.lineTo(W + OS, y); }
  c.stroke(); c.restore();
}
// 地板带：一条深色块 + 一条墨线压住，人物站得住
function floorBand(y = 830, col = PAL.ink, lw = 7, a = .18) {
  paint(rectPts(-OS, y, W + 2 * OS, H + OS - y), { wash: col, washOp: 255 * a, ink: null });
  inkLine([[-OS, y], [W + OS, y]], lw / 4, col, 'ink', 0);
}
// 卡片：硬偏移投影，不许柔
function card(x, y, w, h, r, fill, sh = 14, shCol = PAL.ink, sw = 1) {
  if (sh) paint(rrPts(x + sh, y + sh, w, h, r), { wash: shCol, ink: null });
  paint(rrPts(x, y, w, h, r), { wash: fill, ink: sw ? PAL.ink : null, sw });
}
function cardRaw(x, y, w, h, r, fill, noInk) { paint(rrPts(x, y, w, h, r), { wash: fill, ink: noInk ? null : PAL.ink, sw: 1 }); }

// ---------- 图形 ----------
function burstStar(x, y, r, fill, n = 12, inner = .42, rot = 0, ink = PAL.ink) {
  paint(starPts(x, y, r, inner, n, rot), { wash: fill, ink, sw: 1 });
}
function star5(x, y, r, fill, rot = 0, ink = PAL.ink) {
  const p = []; for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .44 : r; p.push([x + Math.cos(a) * q, y + Math.sin(a) * q]); }
  paint(p, { wash: fill, ink, sw: .85 });
}
function heartPts(x, y, s, rot = 0) {
  const p = []; for (let i = 0; i < 40; i++) {
    const a = i / 40 * TAU, hx = 16 * Math.pow(Math.sin(a), 3), hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
    const c = Math.cos(rot), sn = Math.sin(rot);
    p.push([x + (hx * c - hy * sn) * s / 16, y + (hx * sn + hy * c) * s / 16]);
  }
  return p;
}
function heart(x, y, s, fill, rot = 0, ink = PAL.ink) { paint(heartPts(x, y, s, rot), { wash: fill, ink, sw: 1 }); }
function arrowBig(x, y, len = 420, h = 160, rot = 0, fill = PAL.cream, ink = PAL.ink) {
  const w = h * .42, p = [[-len / 2, -w], [len / 2 - h * .5, -w], [len / 2 - h * .5, -h / 2], [len / 2, 0], [len / 2 - h * .5, h / 2], [len / 2 - h * .5, w], [-len / 2, w]];
  const c = Math.cos(rot), s = Math.sin(rot);
  paint(p.map(([px, py]) => [x + px * c - py * s, y + px * s + py * c]), { wash: fill, ink, sw: 1 });
}
function disc(x, y, r, fill, ink = PAL.ink, sw = 1) { paint(ellPts(x, y, r, r, 40), { wash: fill, ink: sw ? ink : null, sw }); }
function ringOut(x, y, r, lw, col, a = 1) {
  const c = drawingContext; c.save(); c.globalAlpha = a; c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.arc(x, y, Math.max(1, r), 0, TAU); c.stroke(); c.restore();
}
function speedLines(x, y, len, ang, n, col = PAL.ink, w = 6, a = 1, spread = .5) {
  const c = drawingContext; c.save(); c.globalAlpha = a; c.strokeStyle = col; c.lineCap = 'round'; c.lineWidth = w;
  for (let i = 0; i < n; i++) {
    const aa = ang + (i / Math.max(1, n - 1) - .5) * spread, r0 = len * (.3 + .5 * hash(i * 3 + x)), r1 = r0 + len * (.5 + hash(i * 7));
    c.beginPath(); c.moveTo(x + Math.cos(aa) * r0, y + Math.sin(aa) * r0); c.lineTo(x + Math.cos(aa) * r1, y + Math.sin(aa) * r1); c.stroke();
  }
  c.restore();
}
// 碎片爆：一圈三角/四边形向外飞，age 秒
function shards(x, y, r, n, age, cols = [PAL.cream, PAL.yellow], life = .5) {
  if (age < 0 || age > life) return;
  const k = seg(age, 0, life), a = 1 - k * k;
  for (let i = 0; i < n; i++) {
    const ang = i / n * TAU + hash(i) * .6, d = r * (0.15 + 1.05 * easeOut(k)) * (.7 + .5 * hash(i * 5));
    const s = r * .12 * (1 - k * .8), rot = ang + k * 3 * (hash(i + 9) - .5);
    const cx = x + Math.cos(ang) * d, cy = y + Math.sin(ang) * d;
    const p = [[-s, -s * .7], [s, -s * .5], [s * .8, s * .8], [-s * .6, s * .7]].map(([px, py]) => [cx + px * Math.cos(rot) - py * Math.sin(rot), cy + px * Math.sin(rot) + py * Math.cos(rot)]);
    paint(p, { wash: cols[i % cols.length], washOp: 255 * a, ink: null });
  }
}
function dashedShape(pts, col = PAL.pink, lw = 8, dash = 22, gap = 16, alpha = 1) {
  const c = drawingContext; c.save(); c.globalAlpha = alpha; c.setLineDash([dash, gap]); c.lineWidth = lw; c.strokeStyle = col; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); c.stroke(); c.restore();
}
function clipTo(pts, fn) {
  const c = drawingContext; c.save(); c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); c.clip(); fn(); c.restore();
}

// ---------- 转场 ----------
// 眨眼：k=0 睁，k=1 合。母题，全片所有"换世界"都走它。
function eyelid(k, col = PAL.clay, lineCol = PAL.ink) {
  if (k <= .001) return;
  const mid = 540, top = lerp(-OS, mid, ease(k)), bot = lerp(H + OS, mid, ease(k));
  paint(rectPts(-OS, -OS, W + 2 * OS, top + OS), { wash: col, ink: null });
  inkLine([[-OS, top], [W + OS, top]], 1.6, lineCol, 'ink', 0);
  paint(rectPts(-OS, bot, W + 2 * OS, H + OS - bot), { wash: col, ink: null });
  inkLine([[-OS, bot], [W + OS, bot]], 1.6, lineCol, 'ink', 0);
}
function sweepDown(k, col = PAL.pink) {
  if (k <= 0 || k >= 1) return;
  const y = lerp(-H - 200, H + 200, easeIn(k));
  paint(rectPts(-OS, y - 900, W + 2 * OS, 900), { wash: col, ink: null });
  inkLine([[-OS, y], [W + OS, y]], 1.4, PAL.ink, 'ink', 0);
}
function splitWipe(k, col = PAL.ink) {
  if (k <= 0 || k >= 1) return;
  const w = lerp(0, W / 2 + 10, ease(k));
  paint(rectPts(-OS, -OS, w + OS, H + 2 * OS), { wash: col, ink: null });
  paint(rectPts(W - w, -OS, w + OS, H + 2 * OS), { wash: col, ink: null });
}
function irisOut(k, cx, cy, r, col = PAL.ink) {
  if (k <= 0) return;
  const c = drawingContext; c.save(); c.fillStyle = col;
  c.beginPath(); c.rect(-OS, -OS, W + 2 * OS, H + 2 * OS); c.arc(cx, cy, Math.max(0, r), 0, TAU, true); c.fill(); c.restore();
}

// ---------- 角色 ----------
// A = Clawd 原色（陶土橙），B = 粉；同一套几何，B 矮 8%、头顶一颗星。
function A(x, y, u, keys, extra = {}) {
  const { emoOpt, ...rest } = extra;
  const base = keys ? emotions(T, keys, emoOpt || {}) : feel(rest.emo || 'neutral', T);
  clawd(x, y, u, { col: PAL.clay, dk: PAL.clayDk, lt: PAL.clayLt, boilKey: 'A', ...base, ...rest });
}
function B(x, y, u, keys, extra = {}) {
  const { emoOpt, ...rest } = extra;
  const uu = u * .92;
  const base = keys ? emotions(T, keys, emoOpt || {}) : feel(rest.emo || 'hopeful', T);
  clawd(x, y, uu, { col: PAL.pink, dk: PAL.pinkDk, lt: PAL.pinkLt, boilKey: 'B', ...base, ...rest });
  // 识别符：头顶那颗星，随拍闪一下
  if (!rest.noStar) {
    const blink = .75 + .25 * pulse(T);
    star5(x + (rest.dx || 0) * uu * (rest.flip ? -1 : 1), y - 10.1 * uu + (rest.dy || 0) * uu, uu * 1.15 * blink, PAL.paper, T * .6);
  }
}
// 剪影版（只填一个色，用于逆光/过曝）
function silh(x, y, u, color, o = {}) {
  clawd(x, y, u, { col: color, dk: color, lt: color, ink: color, noShadow: true, ...o, boilKey: 'S' + x + y + color });
}
