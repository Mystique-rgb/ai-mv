// Clawd 方盒小人 · 80s 赛璐璐上色版
// 只借 painted-animation 的表演语义（情绪 / 舞步 / 视图 / emote / 五官参数），不借水彩笔触与 line boil。
// 造型不变：方盒身 + 四短腿 + 两竖眼 + 耳机（全片不摘）。赛璐璐：平涂 + 硬边月牙阴影 + 硬边高光 + 彩线 + rim。
import { path, cel, line, rgba, mix, hash, TAU } from '/styles/cel-anime-80s/demo/cel.js';

const BW = 104, BH = 80, LEGW = 11, LEGH = 26, FOOT = BH / 2 + LEGH;

function rr(x, y, w, h, r) {
  const p = new Path2D();
  p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r); p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h); p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r); p.quadraticCurveTo(x, y, x + r, y); p.closePath(); return p;
}

// —— 情绪表：只控制"表演"，不改造型 ——
// open 眼皮高度 / sq 眯眼 / mouth / blush / gloom / teary / look / tilt 身体前倾 / arm 手臂角
const E = {
  neutral: { open: 1, sq: 0, mouth: 'line', arm: 1.45 },
  thinking: { open: .72, sq: .2, mouth: 'small', look: [.6, -.5], tilt: -.05, arm: 1.6 },
  sad: { open: .6, sq: .35, mouth: 'frown', look: [0, .55], tilt: .09, gloom: .5, arm: 1.62 },
  bored: { open: .42, sq: .5, mouth: 'flat', look: [.2, .2], tilt: .04 },
  confused: { open: .9, sq: 0, mouth: 'small', look: [-.5, 0], tilt: -.12 },
  surprised: { open: 1.42, sq: 0, mouth: 'open', look: [0, 0], tilt: -.06, bob: -5 },
  nervous: { open: .95, sq: .1, mouth: 'small', look: [.45, -.2], sweat: 1 },
  shy: { open: .78, sq: .3, mouth: 'small', look: [-.35, .35], blush: .45, tilt: .05 },
  excited: { open: 1.3, sq: 0, mouth: 'grin', look: [0, -.1], bob: -7 },
  love: { open: .95, sq: .15, mouth: 'grin', blush: .6, look: [0, -.15], tilt: -.04 },
  starstruck: { open: 1.35, sq: 0, mouth: 'open', look: [0, -.55], blush: .3, bob: -4, spark: 1 },
  hopeful: { open: 1.15, sq: 0, mouth: 'small', look: [0, -.45], tilt: -.05 },
  relieved: { open: .55, sq: .45, mouth: 'small', look: [0, .15] },
  determined: { open: .85, sq: .25, mouth: 'flat', look: [0, 0], tilt: -.1, brow: 1 },
  proud: { open: .7, sq: .3, mouth: 'grin', tilt: .04 },
  cry: { open: .45, sq: .55, mouth: 'frown', teary: 1, gloom: .7, look: [0, .3] },
  happy: { open: 1.1, sq: 0, mouth: 'grin', bob: -4 },
};

export function emoOf(name, over = {}) { return { ...(E[name] || E.neutral), name, ...over }; }

// 情绪过渡：anticipation(眯眼) → 换脸 → take(过冲) → 落进新情绪
// keys: [[t, name, over?], ...]
export function emoTrack(keys, t) {
  let i = 0; while (i + 1 < keys.length && keys[i + 1][0] <= t) i++;
  const a = keys[i], b = keys[i + 1], D = .17;
  const s0 = t - a[0];
  if (!b || s0 >= D) {
    const e = emoOf(a[1], a[2] || {});
    // take 之后的 overshoot 衰减
    const k = Math.max(0, 1 - Math.max(0, s0 - D) / .18);
    e.bob = (e.bob || 0) - 4 * k * (k > 0 ? 1 : 0);
    return { ...e, over: 0 };
  }
  const u = s0 / D;                         // 0..1
  const prev = emoOf(a[1], a[2] || {}), next = emoOf(b[1], b[2] || {});
  if (u < .45) { // anticipation：眯眼，脸还是旧的
    const h = prev.sq || 0;
    return { ...prev, sq: h + (.85 - h) * (u / .45), open: prev.open * .5, mouth: 'line' };
  }
  // 换脸：新脸 + 过冲
  const k = (u - .45) / .55;                // 0..1
  const ov = Math.sin(k * Math.PI) * 1.0;
  return {
    ...next,
    open: next.open * (1 + .18 * ov),
    bob: (next.bob || 0) - 6 * ov,
    tilt: next.tilt || 0,
    over: ov,
  };
}

// —— 主要绘制 ——
// o = { set, ghost, alpha, view, emo, pose, scale, x, y, mouth, headphones }
const VIEWK = { front: 1, q: .82, side: .72, qback: .88, back: 1 };
const EYEX = { front: [-20, 20], q: [-26, 12], side: [16], qback: [], back: [] };

export function drawClawd(g, e, o) {
  const S = o.set;
  let C = o.ghost ? S.pink : S.char;
  if (o.sil) C = { mid: '#000', lit: '#000', sh: '#000', line: '#000', rim: '#000' };
  const PR = S.prop;
  const s = o.scale ?? 1, view = o.view || 'front';
  const vk = VIEWK[view] ?? 1;
  const em = o.emo || emoOf('neutral');
  const p = o.pose || {};
  const bob = (em.bob || 0) + (p.bob || 0);
  const tilt = (em.tilt || 0) + (p.tilt || 0);
  const L = S.light, lw = (o.lw ?? 3) * (o.ghost ? .9 : 1);

  g.save();
  g.globalAlpha = o.alpha ?? 1;
  g.translate(o.x, o.y + bob); g.rotate(tilt); g.scale(s * vk * (p.squashX ?? 1), s * (p.squashY ?? 1));

  const body = rr(-BW / 2, -BH / 2, BW, BH, 10);
  // cel() 的 so 是「朝光源方向偏移」，偏移后没被盖住的月牙才是阴影 → so 必须指向光
  const sh = [L[0] * 15, L[1] * 15];

  // —— 腿（先画，压在身体下面） ——
  const legs = view === 'side' ? [-21, 19] : [-33, -13, 13, 33];
  const ph = p.legPhase || 0, stride = p.stride || 0;
  legs.forEach((lx0, i) => {
    const lift = p.walk ? Math.max(0, Math.sin(ph + i * Math.PI * .5)) * 10 * stride : 0;
    const sw = p.walk ? Math.cos(ph + i * Math.PI * .5) * 6 * stride : 0;
    const x = lx0 + sw + (p.sit ? 8 : 0), yTop = BH / 2 - 8 - lift;
    const hh = LEGH + (p.sit ? -8 : 0) + lift * .4;
    const lg = rr(x - LEGW / 2, yTop, LEGW, hh, 4);
    g.fillStyle = C.sh; g.fill(lg);
    g.fillStyle = C.mid; g.fill(rr(x - LEGW / 2, yTop, LEGW * .55, hh, 4));
    g.strokeStyle = C.line; g.lineWidth = lw * .8; g.stroke(lg);
    // 脚
    g.fillStyle = C.mid; g.beginPath(); g.ellipse(x + 2, yTop + hh + 1, LEGW * .78, 5, 0, 0, TAU); g.fill();
    g.strokeStyle = C.line; g.lineWidth = lw * .7; g.stroke();
  });

  // —— 手臂 ——
  const armY = -6, armL = p.armL ?? em.arm ?? 1.45, armR = p.armR ?? em.arm ?? 1.45;
  const arms = [['l', armL], ['r', armR]];
  for (const [side, ang] of arms) {
    const sx = side === 'l' ? -BW / 2 + 6 : BW / 2 - 6;
    const far = view === 'side' && side === 'l';       // 侧视里的远侧手：暗、短一点
    const len = 34 * (p.armLen ?? 1) * (far ? .88 : 1);
    const armC = far ? mix(C.mid, C.sh, .65) : C.mid;
    const ex = sx + (side === 'l' ? -1 : 1) * Math.sin(ang) * len * .55;
    const ey = armY + Math.cos(ang) * len;
    g.beginPath(); g.moveTo(sx, armY); g.quadraticCurveTo(sx + (ex - sx) * .4, armY + (ey - armY) * .6, ex, ey);
    g.strokeStyle = far ? mix(C.sh, '#000', .3) : C.sh; g.lineWidth = 15; g.lineCap = 'round'; g.stroke();
    g.beginPath(); g.moveTo(sx - 1, armY - 1); g.quadraticCurveTo(sx + (ex - sx) * .4, armY + (ey - armY) * .6, ex, ey);
    g.strokeStyle = armC; g.lineWidth = 11; g.stroke();
    g.beginPath(); g.arc(ex, ey, 7.5, 0, TAU); g.fillStyle = armC; g.fill();
    g.strokeStyle = C.line; g.lineWidth = lw * .75; g.stroke();
  }

  // —— 身体 ——
  cel(g, body, {
    f: C.mid, s: C.sh, so: [sh[0] * 1.05, sh[1] * 1.05],
    h: C.lit, ho: [-sh[0] * .34, -sh[1] * .34],
    rim: { c: C.rim, d: [-sh[0] * .22, -sh[1] * .22] },
    l: C.line, lw,
  });
  // 盒子的三个面用线断开（避免读成一块色块）
  g.strokeStyle = rgba(C.line, .75); g.lineWidth = lw * .8;
  g.beginPath(); g.moveTo(-BW / 2 + 12, -BH / 2 + 9); g.lineTo(BW / 2 - 12, -BH / 2 + 9); g.stroke();
  g.beginPath(); g.moveTo(BW / 2 - 13, -BH / 2 + 9); g.lineTo(BW / 2 - 13, BH / 2 - 8); g.stroke();

  // —— 脸 ——
  if (view !== 'back' && view !== 'qback') {
    const xs = EYEX[view] || EYEX.front;
    const look = em.look || [0, 0];
    const eh = 34 * Math.max(.08, em.open * (1 - em.sq * .72));
    const ew = view === 'side' ? 8 : 10;
    xs.forEach((bx, i) => {
      const nw = view === 'q' && i === 0 ? ew * .78 : ew;
      const x = bx + look[0] * 6, y = -9 + look[1] * 5;
      const ep = rr(x - nw / 2, y - eh / 2, nw, eh, nw * .44);
      g.fillStyle = C.line; g.fill(ep);
      // 眼神光：远看仍是深眼（保住方块小人的极简），近景才有"瞳"
      if (eh > 7) {
        const cw = nw * .46, chh = Math.min(eh * .26, nw * .58);
        g.fillStyle = rgba('#FFF7EA', .92);
        g.beginPath(); g.ellipse(x - nw * .06, y - eh * .18, cw * .48, chh * .48, 0, 0, TAU); g.fill();
        g.fillStyle = rgba('#FFEDD4', .3);
        g.beginPath(); g.ellipse(x + nw * .18, y + eh * .22, cw * .2, chh * .2, 0, 0, TAU); g.fill();
      }
      if (em.teary > 0) { // 泪光：只有眼底一点，不是一条白带
        g.fillStyle = 'rgba(255,255,255,.9)';
        g.beginPath(); g.arc(x - nw * .14, y + eh * .32, nw * .13, 0, TAU); g.fill();
        g.fillStyle = 'rgba(255,255,255,.5)';
        g.beginPath(); g.arc(x + nw * .16, y + eh * .02, nw * .09, 0, TAU); g.fill();
      }
      if (em.sq > .45) { // 眯眼：上眼睑压下来一条
        g.fillStyle = C.mid; g.fillRect(x - nw, y - eh / 2 - 1, nw * 2, eh * .18);
      }
    });
    // 嘴
    const my = 18;
    g.strokeStyle = C.line; g.lineWidth = lw * .95; g.lineCap = 'round';
    const m = em.mouth || 'line';
    if (m === 'open') {
      const mo = rr(-7, my - 5, 14, 12, 5); g.fillStyle = rgba(C.line, .92); g.fill(mo);
      g.fillStyle = rgba('#9A3B4A', .8); g.fill(rr(-4.5, my - 1, 9, 6, 3));
    } else if (m === 'grin') {
      g.beginPath(); g.moveTo(-10, my - 1); g.quadraticCurveTo(0, my + 7, 10, my - 1); g.stroke();
    } else if (m === 'frown') {
      g.beginPath(); g.moveTo(-9, my + 4); g.quadraticCurveTo(0, my - 4, 9, my + 4); g.stroke();
    } else if (m === 'small') {
      g.beginPath(); g.moveTo(-4, my + 1); g.lineTo(4, my + 1); g.stroke();
    } else if (m === 'flat') {
      g.beginPath(); g.moveTo(-9, my + 1); g.lineTo(9, my + 1); g.stroke();
    } else {
      g.beginPath(); g.moveTo(-7, my); g.lineTo(7, my); g.stroke();
    }
    // 腮红：一层平涂，不画排线
    if (em.blush) {
      g.fillStyle = rgba('#FF8A96', em.blush * .5);
      for (const bx of (view === 'side' ? [8] : [-30, 30])) {
        g.beginPath(); g.ellipse(bx, 8, 15, 7, 0, 0, TAU); g.fill();
      }
    }
  } else {
    // 背面：一条背缝 + 耳机线插口
    g.strokeStyle = rgba(C.line, .8); g.lineWidth = lw * .9;
    g.beginPath(); g.moveTo(0, -BH / 2 + 14); g.lineTo(0, BH / 2 - 14); g.stroke();
  }

  // —— 耳机（道具，允许近黑） ——
  const hc = PR.deck, hh = PR.deckHi;
  g.lineCap = 'round';
  g.beginPath(); g.moveTo(-BW / 2 + 4, -BH / 2 + 10);
  g.bezierCurveTo(-BW / 2 + 4, -BH / 2 - 26, BW / 2 - 4, -BH / 2 - 26, BW / 2 - 4, -BH / 2 + 10);
  g.strokeStyle = C.line; g.lineWidth = 11; g.stroke();
  g.strokeStyle = hc; g.lineWidth = 7.5; g.stroke();
  g.strokeStyle = rgba(hh, .9); g.lineWidth = 2; g.stroke();
  for (const side of (view === 'side' ? [1] : [-1, 1])) {
    const cx = side * (BW / 2 - 2);
    g.save(); g.translate(cx, 2); g.rotate(side * .06);
    const cup = rr(-13, -26, 26, 52, 11);
    g.fillStyle = hc; g.fill(cup);
    g.save(); g.clip(cup);
    g.fillStyle = hh; g.fill(rr(side > 0 ? 2 : -13, -26, 11, 52, 6));   // 硬边高光
    g.fillStyle = rgba('#000000', .35); g.fill(rr(side > 0 ? -13 : 4, -26, 9, 52, 6));
    g.restore();
    g.strokeStyle = C.line; g.lineWidth = 2.6; g.stroke(cup);
    // 耳机罩内圈（发光面，画进 emissive）
    g.fillStyle = rgba(PR.green, .9); g.beginPath(); g.arc(side * 2, 0, 3.4, 0, TAU); g.fill();
    g.restore();
    if (e) { e.fillStyle = rgba(PR.green, .55); e.beginPath(); e.arc(cx + side * 2, 2, 7, 0, TAU); e.fill(); }
  }

  g.restore();

  // —— emote 标记（不进赛璐璐变换，画在头顶） ——
  if (o.emote !== null && (o.emote || em.sweat || em.spark)) emote(g, o, em, s);
}

function emote(g, o, em, s) {
  const S = o.set, C = S.char;
  s = Math.min(s, 3.2);   // 特写时 emote 不跟着放大，否则一个汗滴比头还大
  const bx = o.x, by = o.y - (FOOT * s) - 16;
  const col = S.prop.cream, ol = C.line;
  g.save(); g.lineJoin = 'round';
  if (em.sweat) {
    const x = bx + 62 * s, y = by + 20 * s;
    g.beginPath(); g.moveTo(x, y - 16 * s); g.quadraticCurveTo(x + 11 * s, y + 6 * s, x, y + 12 * s);
    g.quadraticCurveTo(x - 11 * s, y + 6 * s, x, y - 16 * s);
    g.fillStyle = 'rgba(190,235,255,.92)'; g.fill(); g.strokeStyle = ol; g.lineWidth = 2.4; g.stroke();
  }
  if (em.spark) {
    for (const [dx, dy, r] of [[-70, 6, 11], [58, -8, 8], [10, -30, 6]]) {
      star(g, bx + dx * s, by + dy * s, r * s, col, ol);
    }
  }
  const mk = o.emoteMark || (o.emote === 'excl' ? '!' : o.emote === 'quest' ? '?' : o.emote === 'music' ? '♪' : null);
  if (mk) {
    const x = bx + 56 * s, y = by - 6 * s;
    if (mk === '!') {
      g.fillStyle = col; g.fillRect(x - 4 * s, y - 26 * s, 8 * s, 22 * s);
      g.beginPath(); g.arc(x, y + 3 * s, 4.6 * s, 0, TAU); g.fill();
      g.strokeStyle = ol; g.lineWidth = 2.2; g.strokeRect(x - 4 * s, y - 26 * s, 8 * s, 22 * s);
      g.beginPath(); g.arc(x, y + 3 * s, 4.6 * s, 0, TAU); g.stroke();
    } else if (mk === '?') {
      g.strokeStyle = col; g.lineWidth = 6 * s; g.lineCap = 'round';
      g.beginPath(); g.arc(x, y - 16 * s, 11 * s, Math.PI * .95, Math.PI * 2.35); g.stroke();
      g.beginPath(); g.moveTo(x + 5 * s, y - 4 * s); g.lineTo(x, y + 4 * s); g.stroke();
      g.fillStyle = col; g.beginPath(); g.arc(x, y + 12 * s, 4.2 * s, 0, TAU); g.fill();
    } else if (mk === '♪') {
      g.fillStyle = col;
      g.beginPath(); g.ellipse(x - 8 * s, y + 2 * s, 7 * s, 5 * s, -.35, 0, TAU); g.fill();
      g.fillRect(x - 3 * s, y - 22 * s, 3.4 * s, 24 * s);
      g.beginPath(); g.moveTo(x - 3 * s, y - 22 * s); g.quadraticCurveTo(x + 12 * s, y - 18 * s, x + 6 * s, y - 8 * s);
      g.lineTo(x + 3 * s, y - 9 * s); g.quadraticCurveTo(x + 6 * s, y - 16 * s, x - 4 * s, y - 18 * s); g.fill();
    }
  }
  g.restore();
}

function star(g, x, y, r, col, ol) {
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU - Math.PI / 2, rr2 = i % 2 ? r * .28 : r;
    g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr2, y + Math.sin(a) * rr2);
  }
  g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = ol; g.lineWidth = 2; g.stroke();
}

// 粉色倒影：不落地、不投影子，边缘有色散
export function drawReflection(g, e, o) {
  const al = o.alpha ?? .85;
  drawClawd(g, null, { ...o, ghost: true, alpha: al * .5, x: o.x - 3.5, y: o.y });
  drawClawd(g, null, { ...o, ghost: true, alpha: al * .5, x: o.x + 3.5, y: o.y });
  drawClawd(g, null, { ...o, ghost: true, alpha: al, x: o.x, y: o.y });
}

export const CLAWD = { BW, BH, FOOT, rr };
