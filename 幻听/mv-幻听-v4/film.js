// 《幻听》v4 综艺节奏扁平 · 绘制基础库
// Clawd 方盒小人（借 painted-animation 的表情/动作语法，按 game-show 平涂墨线重画）
// 一切都是 t 的纯函数：无 Math.random、无跨帧状态。

export const W = 1920, H = 1080;
export const INK = '#1D1A17', CREAM = '#FFF3DC';
export const T0 = 0.04, BEAT = 0.4699;
export const tOf = k => T0 + BEAT * k;
export const kAt = t => (t - T0) / BEAT;

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const seg = (t, a, b) => clamp((t - a) / (b - a || 1e-6));
export const lerp = (a, b, u) => a + (b - a) * u;
export const hash = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);                    // ease-out cubic
export const eio = u => { u = clamp(u); return u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; };
export const back = u => { u = clamp(u); const c = 2.6; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); }; // back-ease out

// 中文字幕 / UI 用楷体，判定词用重黑体
export const KAI = `'STKaiti','KaiTi','华文楷体',serif`;
export const HEI = `'Arial Black','Segoe UI Black','Noto Sans SC',sans-serif`;

// ---------- 白闪 ----------
export const FLASHES = [tOf(0), tOf(4), tOf(12), tOf(20), tOf(28), tOf(36), tOf(44), tOf(52), tOf(60), 15.68, tOf(42), 30.11, 30.144];
export function flashAt(t) { for (const f of FLASHES) if (t >= f && t < f + 0.062) return 1; return 0; }

// ---------- 镜头 punch（同帧总和 < 0.06） ----------
const PUNCHES = [
  [tOf(0), .03], [tOf(2), .02], [tOf(6), .04], [tOf(11), .015], [tOf(16), .04],
  [tOf(24), .04], [tOf(30), .03], [tOf(30) + .23, .03], [15.68, .05],
  [tOf(35) + .235, .03], [tOf(36), .04], [tOf(38), .05], [tOf(48), .03],
  [tOf(57), .03], [tOf(60), .04], [tOf(63), .05], [30.11, .05],
];
export function punchAt(t) {
  let s = 0;
  for (const [tp, pct] of PUNCHES) { const dt = t - tp; if (dt >= 0 && dt < .3) s += pct * Math.exp(-dt / .055); }
  return Math.min(s, .055);
}
// k41 镜头 2% 摇（dizzy）
export function shakeAt(t) {
  const u = seg(t, tOf(41), tOf(41) + .35);
  return u > 0 && u < 1 ? Math.sin(t * 60) * .02 * Math.sin(u * Math.PI) : 0;
}

// ---------- 表情库 ----------
// 参数化脸：eyeS 眼睛倍率 / lid 眼皮 / brow 眉倾斜 / arc 笑眼 / heart 星星螺旋哭 等特形眼
const EMO = {
  neutral:    {},
  bored:      { lid: .5 },
  sad:        { brow: .5, mouth: 'frown', eyeTilt: -.12 },
  hopeful:    { eyeS: 1.1, lookY: -.5, mouth: 'smile' },
  confused:   { brow: .3, browAskew: 1, mouth: 'wiggle', pupil: .3 },
  surprised:  { eyeS: 1.42, mouth: 'o' },
  excited:    { eyeS: 1.2, mouth: 'grin' },
  love:       { eyes: 'heart', blush: .35, mouth: 'smile' },
  shy:        { blush: .6, lid: .35, mouth: 'smile' },
  laugh:      { eyes: 'arc', mouth: 'grin' },
  starstruck: { eyes: 'star', mouth: 'o', eyeS: 1.15 },
  relieved:   { lid: .3, mouth: 'smile' },
  nervous:    { eyeS: 1.15, mouth: 'zig', sweat: 1 },
  determined: { brow: -.55, mouth: 'flat', eyeS: 1.05 },
  dizzy:      { eyes: 'spiral', mouth: 'wiggle' },
  cry:        { eyes: 'cry', teary: 1, mouth: 'wobble' },
  proud:      { lid: .35, mouth: 'smile', lookY: -.3 },
  thinking:   { pupil: -.45, lookY: -.6, mouth: 'flat' },
};

// 表情轨（§5.2 + §9 逐拍；[时间, 情绪]）
export const EMO_TRACK = [
  [0.0, 'neutral'], [tOf(0) - .05, 'surprised'], [tOf(2), 'bored'],
  [tOf(2.55), 'neutral'], [tOf(3), 'confused'],
  [tOf(4), 'sad'], [tOf(7), 'confused'], [tOf(7.5), 'sad'],
  [tOf(9), 'hopeful'], [tOf(9.5), 'sad'],
  [tOf(12), 'surprised'], [tOf(13), 'excited'], [tOf(14), 'love'],
  [tOf(15), 'shy'], [tOf(16), 'laugh'], [tOf(18), 'confused'], [tOf(19), 'starstruck'],
  [tOf(20), 'hopeful'], [tOf(21), 'relieved'], [tOf(24), 'nervous'],
  [tOf(25), 'surprised'], [tOf(25.25), 'love'], [tOf(26), 'confused'], [tOf(27), 'sad'],
  [tOf(28), 'determined'], [tOf(31), 'determined'], [tOf(32), 'surprised'],
  [15.68, 'excited'],
  [tOf(37), 'proud'], [tOf(37.5), 'nervous'], [tOf(38), 'love'],
  [tOf(39), 'confused'], [tOf(39.5), 'sad'], [tOf(40), 'nervous'],
  [tOf(41), 'dizzy'], [tOf(42), 'sad'],
  [tOf(45), 'confused'], [tOf(46), 'determined'],
  [tOf(48), 'cry'], [tOf(49.25), 'determined'], [tOf(51.45), 'relieved'],
  [tOf(54.2), 'sad'], [tOf(57), 'hopeful'], [tOf(59), 'thinking'],
  [tOf(60), 'determined'], [tOf(61.4), 'nervous'], [tOf(63), 'excited'], [tOf(64), 'hopeful'],
];
// emotions() 语义：变化走 anticip(眯) → take(放大) → overshoot(回落)
export function emoAt(t) {
  let cur = EMO_TRACK[0], t0 = 0;
  for (let i = 0; i < EMO_TRACK.length; i++) if (t >= EMO_TRACK[i][0]) { cur = EMO_TRACK[i]; t0 = cur[0]; }
  const base = EMO[cur[1]] || {};
  const dt = t - t0;
  const p = { ...base };
  if (dt >= 0 && dt < .19) {           // take 动画
    if (dt < .055) { p.lid = .55; p.eyeS = (p.eyeS || 1) * .7; }        // anticip 眯
    else { const k = Math.exp(-(dt - .055) / .07); p.eyeS = (p.eyeS || 1) * (1 + .18 * k); } // overshoot
  }
  return p;
}

// ---------- Clawd 本体 ----------
// o: {x, y(脚底), s, tint主色, alpha, halfTone网点, emo参数, lookX, lookY, blink, view(-1..1 侧头),
//     armL/armR: 'down'|'up'|'reach', legPhase(0..1 跑步), lean, squashY, sweat, teary, hearts, spark, swirl, dots, noShadow}
export function drawClawd(ctx, o) {
  const s = o.s ?? 1, x = o.x, yTop = o.y;               // yTop = 脚底
  const bodyW = 200 * s, bodyH = 196 * s, legH = 54 * s;
  const col = o.tint || '#D97757', colL = o.tintL || '#E9966F', colD = o.tintD || '#A6502F';
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.translate(x, yTop);
  if (o.lean) ctx.rotate(o.lean * .12);
  const sq = o.squashY ?? 1;
  const bx = -bodyW / 2, by = -legH - bodyH * sq;        // 身体盒
  // ---- 腿（先画远侧两条深色） ----
  const legY0 = -legH;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 8 * s;
  const legs = [[-58, colD, 0], [58, colD, 0], [-40, col, 1], [40, col, 1]];
  for (const [lx, lc, front] of legs) {
    if (o.legPhase != null && front) {                   // 跑步前后摆
      const ph = Math.sin(o.legPhase * Math.PI * 2 + (lx < 0 ? 0 : Math.PI));
      ctx.beginPath(); ctx.moveTo(lx * s, legY0);
      ctx.lineTo((lx + ph * 26) * s, -4); ctx.stroke();
      ctx.fillStyle = lc; roundRect(ctx, (lx + ph * 26) * s - 15 * s, -18, 30 * s, 20 * s, 9 * s); ctx.fill(); ctx.stroke();
    } else if (front) {
      ctx.beginPath(); ctx.moveTo(lx * s, legY0); ctx.lineTo(lx * s, -4); ctx.stroke();
      ctx.fillStyle = lc; roundRect(ctx, lx * s - 15 * s, -18, 30 * s, 20 * s, 9 * s); ctx.fill(); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(lx * s, legY0); ctx.lineTo(lx * s * 1.25, -6); ctx.stroke();
    }
  }
  // ---- 硬偏移阴影（先画偏移墨影再盖彩色，game-show 规矩） ----
  ctx.fillStyle = 'rgba(29,26,23,.28)';
  roundRect(ctx, bx + 12 * s, by + 12 * s, bodyW, bodyH * sq, 34 * s); ctx.fill();
  // ---- 身体 ----
  ctx.fillStyle = col;
  roundRect(ctx, bx, by, bodyW, bodyH * sq, 34 * s); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 8 * s; ctx.stroke();
  // 网点（残影）
  if (o.halfTone) { ctx.save(); roundRect(ctx, bx, by, bodyW, bodyH * sq, 34 * s); ctx.clip();
    dotGrid(ctx, bx, by, bodyW, bodyH * sq, 13 * s, 'rgba(29,26,23,.5)'); ctx.restore(); }
  // cream 肚皮（小，避开嘴）
  ctx.fillStyle = o.belly || 'rgba(255,243,220,.9)';
  roundRect(ctx, -42 * s, by + bodyH * sq - 52 * s, 84 * s, 34 * s, 16 * s); ctx.fill();
  ctx.stroke();
  // ---- 手臂 ----
  const armY = by + bodyH * sq * .58;
  for (const side of [-1, 1]) {
    const mode = side < 0 ? (o.armL || 'down') : (o.armR || 'down');
    ctx.beginPath();
    if (mode === 'up') { ctx.moveTo(side * (bodyW / 2) * s * .96, armY); ctx.lineTo(side * (bodyW / 2 + 46) * s, by - 26 * s); }
    else if (mode === 'reach') { ctx.moveTo(side * (bodyW / 2) * s * .96, armY); ctx.lineTo(side * (bodyW / 2 + 52) * s, armY - 34 * s); }
    else { ctx.moveTo(side * (bodyW / 2) * s * .96, armY); ctx.lineTo(side * (bodyW / 2 + 26) * s, armY + 26 * s); }
    ctx.lineWidth = 26 * s; ctx.strokeStyle = col; ctx.stroke();
    ctx.lineWidth = 8 * s; ctx.strokeStyle = INK; ctx.stroke();
  }
  // ---- 耳机 ----
  const bandY = by + 6 * s;
  ctx.beginPath(); ctx.arc(0, bandY, bodyW * .5, Math.PI * 1.02, Math.PI * 1.98);
  ctx.lineWidth = 16 * s; ctx.strokeStyle = INK; ctx.stroke();
  for (const side of [-1, 1]) {
    ctx.fillStyle = INK;
    roundRect(ctx, side * bodyW * .5 - 16 * s, by + 26 * s, 32 * s, 52 * s, 12 * s); ctx.fill();
    ctx.fillStyle = colL;
    roundRect(ctx, side * bodyW * .5 - 9 * s, by + 33 * s, 18 * s, 38 * s, 8 * s); ctx.fill();
  }
  // ---- 脸 ----
  drawFace(ctx, o, { bx, by, bodyW, bodyH: bodyH * sq, s });
  // ---- emote 标记 ----
  drawEmotes(ctx, o, { bx, by, bodyW, s });
  ctx.restore();
}

function drawFace(ctx, o, g) {
  const { bx, by, bodyW, bodyH, s } = g;
  const p = o.emo || {};
  const ecx = 0 + (o.lookX || 0) * 14 * s, ecy = by + bodyH * .30 + (o.lookY || 0) * 10 * s;
  const er = 20 * s * (p.eyeS || 1);
  const eyeType = o.blink ? 'closed' : (p.eyes || 'round');
  for (const side of [-1, 1]) {
    const ex = ecx + side * 44 * s;
    const tilt = (p.eyeTilt || 0) * side * (side < 0 ? -1 : 1);
    ctx.save(); ctx.translate(ex, ecy); ctx.rotate(tilt * .5);
    if (eyeType === 'closed') { line(ctx, -er, 0, er, 0, 7 * s, INK); }
    else if (eyeType === 'arc') { arc(ctx, 0, er * .4, er, Math.PI * 1.15, Math.PI * 1.85, 7 * s, INK); }
    else if (eyeType === 'heart') { heart(ctx, 0, 0, er * 1.25, INK); }
    else if (eyeType === 'star') { star(ctx, 0, 0, er * 1.5, INK); }
    else if (eyeType === 'spiral') { spiral(ctx, 0, 0, er * 1.4, INK); }
    else if (eyeType === 'cry') { arc(ctx, 0, -er * .3, er, Math.PI * .15, Math.PI * .85, 7 * s, INK); }
    else {
      // 圆眼 + 眼皮 + 瞳孔偏移
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.ellipse(0, 0, er, er / Math.max(.25, 1 - (p.lid || 0) * .8), 0, 0, Math.PI * 2); ctx.fill();
      if (p.lid) { ctx.fillStyle = o.tint || '#D97757'; ctx.fillRect(-er - 2, -er - 2, er * 2 + 4, er * (p.lid) * 1.5); ctx.stroke(); line(ctx, -er, -er + er * p.lid * 1.5, er, -er + er * p.lid * 1.5, 5 * s, INK); }
    }
    ctx.restore();
  }
  // 泪
  if (p.teary) for (const side of [-1, 1]) {
    const ty = ecy + 30 * s + ((o.t ?? 0) * 90 % 34);
    ctx.fillStyle = '#BFE3EF'; ctx.strokeStyle = INK; ctx.lineWidth = 5 * s;
    ctx.beginPath(); ctx.ellipse(ecx + side * 58 * s, ty, 8 * s, 12 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  // 红晕
  if (p.blush) { ctx.fillStyle = `rgba(229,60,90,${p.blush * .5})`;
    for (const side of [-1, 1]) { ctx.beginPath(); ctx.ellipse(ecx + side * 66 * s, ecy + 26 * s, 16 * s, 9 * s, 0, 0, Math.PI * 2); ctx.fill(); } }
  // 阴影云(gloom)在 emotes 里
  // 眉
  if (p.brow) for (const side of [-1, 1]) {
    const byp = ecy - er - 16 * s;
    const ang = p.brow * side * .5;
    ctx.save(); ctx.translate(ecx + side * 44 * s, byp); ctx.rotate(ang + (p.browAskew ? side * .18 : 0));
    line(ctx, -14 * s, 0, 14 * s, 0, 6 * s, INK); ctx.restore();
  }
  // 嘴
  const my = by + bodyH * .56, mx = ecx;
  ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 7 * s;
  const m = p.mouth || 'flat';
  ctx.beginPath();
  if (m === 'flat') { ctx.moveTo(mx - 16 * s, my); ctx.lineTo(mx + 16 * s, my); }
  else if (m === 'smile') { ctx.arc(mx, my - 8 * s, 18 * s, Math.PI * .15, Math.PI * .85); }
  else if (m === 'frown') { ctx.arc(mx, my + 14 * s, 16 * s, Math.PI * 1.15, Math.PI * 1.85); }
  else if (m === 'o') { ctx.ellipse(mx, my + 4 * s, 10 * s, 13 * s, 0, 0, Math.PI * 2); }
  else if (m === 'grin') { ctx.arc(mx, my - 4 * s, 22 * s, Math.PI * .1, Math.PI * .9); ctx.closePath(); ctx.fillStyle = INK; ctx.fill(); }
  else if (m === 'wiggle') { ctx.moveTo(mx - 18 * s, my); ctx.quadraticCurveTo(mx - 9 * s, my - 8 * s, mx, my); ctx.quadraticCurveTo(mx + 9 * s, my + 8 * s, mx + 18 * s, my); }
  else if (m === 'zig') { ctx.moveTo(mx - 20 * s, my); for (let i = 1; i <= 4; i++) ctx.lineTo(mx - 20 * s + i * 10 * s, my + (i % 2 ? -6 : 6) * s); }
  else if (m === 'wobble') { const w = Math.sin((o.t ?? 0) * 30) * 3 * s; ctx.arc(mx, my - 6 * s + w, 14 * s, Math.PI * .1, Math.PI * .9); }
  ctx.stroke();
}

function drawEmotes(ctx, o, g) {
  const { bx, by, bodyW, s } = g;
  const p = o.emo || {};
  const top = by - 30 * s;
  if (p.sweat) { ctx.fillStyle = '#BFE3EF'; ctx.strokeStyle = INK; ctx.lineWidth = 5 * s;
    ctx.beginPath(); ctx.moveTo(bodyW * .52, top + 30 * s); ctx.quadraticCurveTo(bodyW * .60, top + 58 * s, bodyW * .52, top + 66 * s);
    ctx.quadraticCurveTo(bodyW * .44, top + 58 * s, bodyW * .52, top + 30 * s); ctx.fill(); ctx.stroke(); }
  if (o.hearts) for (let i = 0; i < 3; i++) { const u = ((o.t ?? 0) * .9 + i * .33) % 1;
    ctx.globalAlpha = (o.alpha ?? 1) * (1 - u); heart(ctx, bodyW * .5 + i * 26 * s, top - u * 70 * s, (14 + i * 4) * s, '#E5484D'); ctx.globalAlpha = o.alpha ?? 1; }
  if (o.spark) { ctx.strokeStyle = '#FFD24A'; ctx.lineWidth = 6 * s;
    for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 + (o.t ?? 0); const r1 = 26 * s, r2 = 44 * s;
      line(ctx, bx + bodyW + Math.cos(a) * r1, top + 40 * s + Math.sin(a) * r1, bx + bodyW + Math.cos(a) * r2, top + 40 * s + Math.sin(a) * r2, 6 * s, '#FFD24A'); } }
  if (o.swirl) { ctx.strokeStyle = INK; ctx.lineWidth = 5 * s;
    spiral(ctx, bx - 40 * s, top + 10 * s, 22 * s, INK); }
  if (o.dots) for (let i = 0; i < 4; i++) { ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(bx - 50 * s + i * 16 * s, top + 6 * s + Math.sin(i * 2.1) * 8 * s, 5 * s, 0, Math.PI * 2); ctx.fill(); }
  if (o.gloom) { ctx.fillStyle = `rgba(29,26,23,${o.gloom * .35})`;
    for (let i = 0; i < 4; i++) { const gx = bx + bodyW * (.15 + .24 * i) + hash(i + 3) * 10, gy = by - 26 * s - hash(i) * 20 * s;
      drop(ctx, gx, gy, 13 * s, 'rgba(29,26,23,.45)'); } }
  if (o.qMark) text(ctx, '?', bx + bodyW + 20 * s, top + 30 * s, 64 * s, CREAM, INK, 8 * s, HEI);
  if (o.bang) text(ctx, '!', bx + bodyW + 20 * s, top + 30 * s, 64 * s, '#FFD24A', INK, 8 * s, HEI);
  if (o.music) { const u = ((o.t ?? 0) * 1.3) % 1; note8(ctx, bx - 30 * s, top - u * 40 * s, .8 * s, CREAM, INK); }
}

// ---------- 音符 ----------
export function note8(ctx, x, y, s, fill, stroke = INK) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineWidth = 7; ctx.strokeStyle = stroke; ctx.fillStyle = fill; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.ellipse(0, 0, 16, 12, -.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, -4); ctx.lineTo(14, -46); ctx.lineTo(38, -38); ctx.stroke();
  ctx.restore();
}
// 落下的判定音符（圆头 + 杆 + 旗，accent 色平涂 + 墨描边）
export function drawNote(ctx, x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(29,26,23,.25)';
  ctx.beginPath(); ctx.ellipse(3, 3, 20, 15, -.35, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.ellipse(0, 0, 20, 15, -.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(17, -5); ctx.quadraticCurveTo(20, -30, 16, -52); ctx.quadraticCurveTo(30, -46, 40, -50); ctx.stroke();
  ctx.restore();
}

// ---------- 判定词 ----------
export function judgeWord(ctx, txt, x, y, size, fill, rot = 0, born = 0, now = 0, strokeW) {
  const dt = now - born;
  if (dt < 0 || dt > .40) return;
  const k = back(Math.min(1, dt / .13));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(.4 + .6 * k, .4 + .6 * k);
  ctx.globalAlpha = dt > .30 ? 1 - (dt - .30) / .10 : 1;
  text(ctx, txt, 0, 0, size, fill, INK, strokeW ?? size * .14, HEI);
  ctx.restore();
}

// ---------- burst（star + ring + 放射线） ----------
export function burst(ctx, x, y, born, now, col) {
  const dt = now - born;
  if (dt < 0 || dt > .3) return;
  const u = eo(dt / .3);
  ctx.save(); ctx.translate(x, y);
  ctx.globalAlpha = 1 - u;
  ctx.strokeStyle = INK; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(0, 0, 30 + 130 * u, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = 12;
  for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 + .3;
    line(ctx, Math.cos(a) * (50 + 120 * u), Math.sin(a) * (50 + 120 * u), Math.cos(a) * (80 + 160 * u), Math.sin(a) * (80 + 160 * u), 10, col); }
  star(ctx, 0, 0, 40 + 30 * (1 - u), col, INK, 6);
  ctx.restore();
}

// ---------- 基础形状 ----------
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
export function line(ctx, x1, y1, x2, y2, w, col) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
function arc(ctx, x, y, r, a0, a1, w, col) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, r, a0, a1); ctx.stroke(); ctx.restore();
}
export function star(ctx, x, y, r, fill, stroke, lw = 6) {
  ctx.save(); ctx.translate(x, y); ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r;
    i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
  ctx.restore();
}
export function heart(ctx, x, y, s, fill) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24); ctx.beginPath();
  ctx.moveTo(0, 8); ctx.bezierCurveTo(-24, -10, -10, -24, 0, -12); ctx.bezierCurveTo(10, -24, 24, -10, 0, 8);
  ctx.fillStyle = fill; ctx.fill(); ctx.restore();
}
export function drop(ctx, x, y, s, fill) {
  ctx.save(); ctx.translate(x, y); ctx.beginPath();
  ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * .8, s * .2, 0, s * .7); ctx.quadraticCurveTo(-s * .8, s * .2, 0, -s);
  ctx.fillStyle = fill; ctx.fill(); ctx.restore();
}
function spiral(ctx, x, y, r, col) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath();
  for (let a = 0; a < Math.PI * 4.2; a += .25) { const rr = r * a / (Math.PI * 4.2);
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
  ctx.stroke(); ctx.restore();
}
export function dotGrid(ctx, x, y, w, h, step, col) {
  ctx.fillStyle = col;
  for (let yy = y; yy < y + h; yy += step) for (let xx = x + ((yy / step) % 2) * step / 2; xx < x + w; xx += step) {
    ctx.beginPath(); ctx.arc(xx, yy, step * .18, 0, Math.PI * 2); ctx.fill(); }
}
export function text(ctx, str, x, y, size, fill, stroke, strokeW, font = KAI, align = 'center') {
  ctx.save();
  ctx.font = `${font === KAI ? '' : '900 '}${size}px ${font}`;
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  if (strokeW) { ctx.strokeStyle = stroke || INK; ctx.lineWidth = strokeW; ctx.strokeText(str, x, y); }
  ctx.fillStyle = fill; ctx.fillText(str, x, y);
  ctx.restore();
}
