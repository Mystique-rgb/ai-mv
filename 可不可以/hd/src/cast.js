// cast.js — 方块小人印成"粗线案卷人"
// 比例照人物资产库 v2 human：脚底原点、头顶 -8u、头宽 ±5u、眼心 (±2.5u,-6u)、嘴 (0,-4.55u)、
// 躯干 -3.7u..-1.9u、腿宽 1.3u。只换"怎么落墨"：7px 硬墨线、平涂、网点当阴影、亮眼两道高光。
const SKIN = '#F3CFA3', SKIN_D = '#DAA87C', SKIN_L = '#FBE4C0';

const CAST = {
  a:   { skin: SKIN, hair: 'short',  hairCol: '#2A2622', cloth: '#6E8C55', kind: 'hoodie', pants: '#3E3A46', shoes: '#EDE3CE', name: '阿岩' },
  b:   { skin: SKIN_L, hair: 'buns', hairCol: '#3A2A22', cloth: PAL.pink, kind: 'hoodie', pants: '#5A5470', shoes: '#F2E8D5', name: '小粉', dotCloth: .38 },
  zhou:{ skin: '#E8C49B', hair: 'crew', hairCol: '#4A443C', cloth: '#4A5A6E', kind: 'uniform', pants: '#333A48', shoes: '#2A2F3A', name: '老周', stubble: true },
  dou: { skin: '#EFC79E', hair: 'afro', hairCol: '#241F1C', cloth: '#E0A81E', kind: 'tee', pants: '#4A4452', shoes: '#E8DCC4', name: '小豆' },
};
const NICK = { '阿岩': 'a', '小粉': 'b', '老周': 'zhou', '小豆': 'dou' };

const EMO = {
  neutral:   { eye: 'oval',   mouth: 'line',    top: null },
  thinking:  { eye: 'lid',    mouth: 'lineL',   top: 'q' },
  determined:{ eye: 'squint', mouth: 'grit',    top: 'browDown' },
  sad:       { eye: 'droop',  mouth: 'arcDown', top: 'tearDots' },
  hurt:      { eye: 'half',   mouth: 'wave',    top: 'crack' },
  excited:   { eye: 'big',    mouth: 'o',       top: 'star' },
  hopeful:   { eye: 'up',     mouth: 'arcUpSm', top: 'halo' },
  confused:  { eye: 'odd',    mouth: 'wave',    top: 'qq' },
  cry:       { eye: 'arcDown',mouth: 'openDown',top: 'tears' },
  laugh:     { eye: 'arcUp',  mouth: 'open',    top: 'stars3' },
  shy:       { eye: 'slant',  mouth: 'arcUpSm', top: 'blush' },
  angry:     { eye: 'squint', mouth: 'grit',    top: 'browV' },
  surprised: { eye: 'big',    mouth: 'o',       top: 'rays' },
  love:      { eye: 'arcUp',  mouth: 'arcUpSm', top: 'hearts' },
};

// ---------- 小件 ----------
function dotFill(pts, color, dens = .38, step = 17, seed = 1) {
  const ctx = CTX, P = wob(pts, 1.6, seed), bb = bbox(P);
  path(ctx, P); ctx.fillStyle = PAL.paper; ctx.fill();
  ctx.save(); path(ctx, P); ctx.clip();
  ctx.fillStyle = color; ctx.beginPath();
  for (let y = bb.y; y < bb.y + bb.h; y += step) for (let x = bb.x; x < bb.x + bb.w; x += step) {
    const d = dens * (.86 + .28 * hash3(x | 0, y | 0, seed));
    const r = d * step * .55;
    ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, PI2);
  }
  ctx.fill(); ctx.restore();
}
function eyeshape(kind, cx, cy, u, s, flip, blink) {
  const ctx = CTX, ink = PAL.ink, hi = PAL.paper;
  if (blink) {                      // 眨眼：一道下弯的闭眼线
    ctx.save(); ctx.strokeStyle = ink; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy + .16 * u, .50 * u * s, Math.PI * 1.10, Math.PI * 1.90); ctx.stroke();
    ctx.restore(); return;
  }
  const ew = .50 * u * s, eh = .95 * u * s;
  const oval = (rx, ry, dx = 0, dy = 0, rot = 0) => {
    ctx.save(); ctx.translate(cx + dx, cy + dy); ctx.rotate(rot);
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, PI2); ctx.fillStyle = ink; ctx.fill();
    // 两道高光（一大一小）
    ctx.beginPath(); ctx.ellipse(-rx * .30, -ry * .38, rx * .28, ry * .24, 0, 0, PI2); ctx.fillStyle = hi; ctx.fill();
    ctx.beginPath(); ctx.ellipse(rx * .38, ry * .44, rx * .13, ry * .12, 0, 0, PI2); ctx.fill();
    ctx.restore();
  };
  const arceye = (up) => {
    ctx.save(); ctx.strokeStyle = ink; ctx.lineWidth = 6.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy + (up ? .18 * u : -.18 * u), .52 * u * s, up ? Math.PI * 1.12 : Math.PI * .12, up ? Math.PI * 1.88 : Math.PI * .88);
    ctx.stroke(); ctx.restore();
  };
  switch (kind) {
    case 'big': oval(ew * 1.12, eh * 1.08); break;
    case 'squint': oval(ew, eh * .62); break;
    case 'half': oval(ew, eh * .38); break;
    case 'lid': oval(ew, eh * .86, 0, eh * .06); break;
    case 'droop': oval(ew * .95, eh * .78, 0, eh * .12, flip * .18); break;
    case 'up': oval(ew * .92, eh * .82, 0, -eh * .16); break;
    case 'odd': oval(flip > 0 ? ew * 1.1 : ew * .8, flip > 0 ? eh * 1.0 : eh * .52); break;
    case 'slant': oval(ew, eh * .9, 0, 0, flip * .28); break;
    case 'arcUp': arceye(true); break;
    case 'arcDown': arceye(false); break;
    default: oval(ew, eh);
  }
}
function mouthshape(kind, cx, cy, u, s) {
  const ctx = CTX, ink = PAL.ink, w = 1.55 * u * s, h = .5 * u * s;
  ctx.save(); ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const arc = (dir, hh) => { ctx.beginPath(); ctx.moveTo(cx - w / 2, cy); ctx.quadraticCurveTo(cx, cy + dir * hh, cx + w / 2, cy); ctx.stroke(); };
  switch (kind) {
    case 'line': ctx.beginPath(); ctx.moveTo(cx - w * .34, cy); ctx.lineTo(cx + w * .34, cy); ctx.stroke(); break;
    case 'lineL': ctx.beginPath(); ctx.moveTo(cx - w * .48, cy); ctx.lineTo(cx + w * .16, cy); ctx.stroke(); break;
    case 'arcUp': arc(1, h * .95); break;
    case 'arcUpSm': arc(1, h * .55); break;
    case 'arcDown': arc(-1, h * .9); break;
    case 'o': ctx.beginPath(); ctx.ellipse(cx, cy + h * .1, w * .26, h * .58, 0, 0, PI2); ctx.stroke(); break;
    case 'open': ctx.beginPath(); ctx.ellipse(cx, cy + h * .22, w * .42, h * .62, 0, 0, PI2); ctx.fill(); break;
    case 'openDown': ctx.beginPath(); ctx.ellipse(cx, cy + h * .45, w * .40, h * .8, 0, 0, PI2); ctx.fill(); break;
    case 'wave': {
      ctx.beginPath(); ctx.moveTo(cx - w / 2, cy);
      for (let i = 1; i <= 6; i++) ctx.lineTo(cx - w / 2 + w * i / 6, cy + (i % 2 ? 5 : -5) * s);
      ctx.stroke(); break;
    }
    case 'grit': {
      const g = rrectPts(cx - w * .40, cy - h * .32, w * .8, h * .64, 3);
      path(ctx, g); ctx.stroke();
      for (let i = 1; i < 5; i++) { const x = cx - w * .40 + w * .8 * i / 5; ctx.beginPath(); ctx.moveTo(x, cy - h * .32); ctx.lineTo(x, cy + h * .32); ctx.lineWidth = 2.5; ctx.stroke(); ctx.lineWidth = 6; }
      break;
    }
  }
  ctx.restore();
}
function topextra(kind, cx, cy, u, o) {
  const ctx = CTX;
  switch (kind) {
    case 'browDown':
    case 'browV': {
      const d = kind === 'browV' ? .30 : .16;
      inkLine([[cx - .95 * u, cy - d * u], [cx - .28 * u, cy + .04 * u]], { sw: 7, seed: 3 });
      inkLine([[cx + .95 * u, cy - d * u], [cx + .28 * u, cy + .04 * u]], { sw: 7, seed: 4 });
      break;
    }
    case 'q': txt('?', cx + 2.3 * u, cy - 1.5 * u, { size: 1.0 * u, font: FONT.serif, weight: 900, color: PAL.ink, align: 'center' }); break;
    case 'qq': txt('?', cx - 2.6 * u, cy - 1.8 * u, { size: .8 * u, font: FONT.serif, weight: 900, color: PAL.ink, align: 'center' });
               txt('?', cx + 2.8 * u, cy - 1.3 * u, { size: .6 * u, font: FONT.serif, weight: 900, color: PAL.ink, align: 'center' }); break;
    case 'star':
      shape(starPts(cx + 3.3 * u, cy - 2.3 * u, .40 * u, .16 * u, 8), { fill: PAL.yellow, ink: PAL.ink, sw: 5, seed: 21 }); break;
    case 'stars3':
      [[-3.2, -4.3, .34], [3.1, -4.5, .30], [2.6, -5.2, .2]].forEach(([dx, dy, r], i) =>
        shape(starPts(cx + dx * u, cy + dy * u, r * u, r * .4 * u, 8), { fill: PAL.yellow, ink: PAL.ink, sw: 4, seed: 22 + i })); break;
    case 'tearDots': {
      for (let i = 0; i < 4; i++) ctx.fillStyle = 'rgba(27,42,68,.55)', ctx.beginPath(), ctx.arc(cx - 2.6 * u, cy + .6 * u + i * 7, 3.2 - i * .5, 0, PI2), ctx.fill();
      break;
    }
    case 'tears': {
      for (const s of [-1, 1]) {
        const g = rrectPts(cx + s * 2.5 * u - 5, cy + .35 * u, 10, .9 * u, 5);
        shape(g, { fill: '#BFD8E0', ink: PAL.ink, sw: 4, seed: 31 + s });
      }
      break;
    }
    case 'halo': {
      const ctx2 = CTX; ctx2.save(); ctx2.globalAlpha = .5;
      dots({ x: cx - 2.2 * u, y: cy - 3.85 * u, w: 4.4 * u, h: 1.0 * u }, D.radial(.5, .5, .55, .50, 0), { step: 14, color: PAL.yellow, angle: 30 });
      ctx2.restore(); break;
    }
    case 'blush': {
      dots({ x: cx - 3.4 * u, y: cy + .1 * u, w: 1.5 * u, h: 1.0 * u }, D.flat(.5), { step: 12, color: PAL.red, alpha: .45 });
      dots({ x: cx + 1.9 * u, y: cy + .1 * u, w: 1.5 * u, h: 1.0 * u }, D.flat(.5), { step: 12, color: PAL.red, alpha: .45 });
      break;
    }
    case 'rays': {
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + (i - 1) * .5;
        inkLine([[cx + Math.cos(a) * 3.3 * u, cy + Math.sin(a) * 3.3 * u], [cx + Math.cos(a) * 4.4 * u, cy + Math.sin(a) * 4.4 * u]], { sw: 6, seed: 40 + i });
      }
      break;
    }
    case 'hearts': {
      for (const [dx, dy, s2] of [[-3.2, -1.4, .34], [3.2, -1.8, .28]]) {
        const hx = cx + dx * u, hy = cy + dy * u, r = s2 * u;
        shape([...arcPts(hx - r * .5, hy, r * .55, Math.PI, PI2, 8), ...arcPts(hx + r * .5, hy, r * .55, Math.PI, PI2, 8), [hx, hy + r * 1.5]],
          { fill: PAL.pink, ink: PAL.ink, sw: 4, seed: 51 });
      }
      break;
    }
    case 'crack': inkLine([[cx + 1.9 * u, cy - 1.7 * u], [cx + 2.4 * u, cy - 1.1 * u], [cx + 2.0 * u, cy - .7 * u]], { sw: 5, seed: 61 }); break;
  }
}

// ---------- 人 ----------
// o: view/face/t/rot/sq/dx/dy/aL/aR/flip/tint/alpha/noShadow
function person(name, x, y, u, o = {}) {
  const key = NICK[name] || name;
  const C = CAST[key] || CAST.a;
  const ctx = CTX;
  const view = o.view || 'front';
  const noFace = view === 'qback' || view === 'back';
  const emo = EMO[o.face || 'neutral'] || EMO.neutral;
  const seed = (o.seed ?? 1) * 97 + boilAt(o.t || 0);
  const sq = o.sq || 0, rot = o.rot || 0, flip = o.flip ? -1 : 1;
  const qs = view === 'q' ? .93 : view === 'side' ? .74 : 1;      // 侧身收窄
  const faceShift = view === 'q' ? .85 : view === 'side' ? 1.9 : 0;
  const sw = o.sw ?? 7;
  // —— 随拍呼吸 + 站姿微摆 + 眨眼（o.still 关掉）——
  const tt0 = o.t ?? 0;
  const bp = o.still ? 0 : pulse(tt0, 5.2);
  const bob = o.still ? 0 : -bp * .085 * u;
  const sway = o.still ? 0 : Math.sin(beatIndex(tt0) * 1.27 + (o.seed || 1)) * .015;
  const bph = (tt0 + (o.seed || 1) * .41) % 3.4;
  const blink = !o.still && bph > 3.26 && bph < 3.40;
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.translate(x + (o.dx || 0) * u, y + (o.dy || 0) * u + bob);
  ctx.rotate(rot + sway);
  ctx.scale(flip, 1);
  ctx.scale(1 / (1 - sq * .5), 1 - sq);
  // 影子
  if (!o.noShadow) {
    ctx.save(); ctx.globalAlpha = .22 * (o.alpha ?? 1);
    ctx.beginPath(); ctx.ellipse(0, -2, 4.2 * u * qs, .55 * u, 0, 0, PI2); ctx.fillStyle = PAL.ink; ctx.fill(); ctx.restore();
  }
  const cloth = C.cloth, clothDk = mix(C.cloth, PAL.ink, .25);
  const ink = PAL.ink;
  // 胳膊：从肩沿方向画一根胶囊 + 手
  const arm = (side, front) => {
    const a = side < 0 ? (o.aL ?? .12) : (o.aR ?? .12);
    const px = side * 3.02 * u * qs, py = -3.28 * u, len = 1.85 * u;
    const dirx = Math.sin(Math.min(a, 1.55)) * side, diry = Math.cos(Math.min(a, 1.55));
    const ex = px + dirx * len, ey = py + diry * len;
    ctx.save();
    ctx.translate(px, py); ctx.rotate(Math.atan2(-dirx, diry));
    shape(rrectPts(-.38 * u, -.30 * u, .76 * u, len + .55 * u, .38 * u),
      { fill: front ? cloth : clothDk, ink, sw: sw * .95, seed: seed + (front ? 11 : 12),
        shade: true, shadeDens: (uu) => clamp(.5 - uu * .45), shadeAlpha: .3 });
    ctx.restore();
    shape(ellPts(ex, ey + diry * .12 * u, .44 * u, .44 * u, 14), { fill: C.skin, ink, sw: sw * .9, seed: seed + (front ? 13 : 14) });
    return [ex, ey];
  };
  const [bx, by] = arm(-1, false);
  arm(1, false);
  // 腿
  for (const s of [-1, 1]) {
    const lx = s * 1.72 * u * qs;
    shape(rrectPts(lx - .66 * u, -2.15 * u, 1.32 * u, 1.95 * u, .22 * u), { fill: C.pants, ink, sw, seed: seed + 20 + s, shade: true, shadeAlpha: .3 });
    shape(rrectPts(lx - .78 * u, -.42 * u, 1.56 * u, .44 * u, .18 * u), { fill: C.shoes, ink, sw, seed: seed + 24 + s });
  }
  // 躯干
  const torso = rrectPts(-3.15 * u * qs, -3.75 * u, 6.3 * u * qs, 1.95 * u, .5 * u);
  if (C.dotCloth) {
    dotFill(torso, C.cloth, C.dotCloth, 15, seed + 30);
    path(CTX, wob(torso, 1.5, seed + 30)); CTX.strokeStyle = ink; CTX.lineWidth = sw; CTX.stroke();
  } else {
    shape(torso, { fill: cloth, ink, sw, seed: seed + 30, shade: true, shadeDens: u2 => clamp(u2 * .8 - .1), shadeAlpha: .3 });
  }
  if (C.kind === 'hoodie') {
    // 帽领 + 口袋
    shape(rrectPts(-1.5 * u * qs, -3.95 * u, 3.0 * u * qs, .62 * u, .3 * u), { fill: mix(cloth, PAL.paper, .12), ink, sw: sw * .8, seed: seed + 31 });
    inkLine([[-1.0 * u, -2.35 * u], [1.0 * u, -2.35 * u]], { sw: 4.5, seed: seed + 32 });
  } else if (C.kind === 'uniform') {
    shape(rrectPts(-.28 * u, -3.75 * u, .56 * u, 1.9 * u, .1 * u), { fill: PAL.paper, ink: null, seed: seed + 33, boil: false });
    shape(rrectPts(-3.44 * u * qs, -3.15 * u, .62 * u, .78 * u, .1 * u), { fill: PAL.red, ink, sw: sw * .7, seed: seed + 34 });   // 红袖章
  } else if (C.kind === 'tee') {
    inkLine([[-1.1 * u, -3.2 * u], [0, -2.85 * u], [1.1 * u, -3.2 * u]], { sw: 4.5, seed: seed + 35 });
  }
  // 前臂
  arm(-1, true);
  // 头
  const hw = 5.0 * u * (view === 'front' ? 1 : qs > .9 ? 1 : 1);
  const head = rrectPts(-hw + faceShift * u * .12, -8 * u, hw * 2, 4.2 * u, .85 * u);
  // 头发（后层）
  if (!noFace && (C.hair === 'buns' || C.hair === 'afro')) hairShape(C, -8.35 * u, hw, u, seed, true);
  shape(head, { fill: C.skin, ink, sw, seed: seed + 40, shade: true, shadeDens: v => clamp(v * .9 - .25), shadeAlpha: .22, shadeCol: SKIN_D });
  if (noFace) {
    hairShape(C, -8.35 * u, hw, u, seed, true, true);
    // 后脑的反光：一道纸色网点（不然是一块死黑）
    ctx.save(); ctx.globalAlpha = .22;
    dots({ x: -hw + .3 * u, y: -8.3 * u, w: hw * 2 - .6 * u, h: 2.4 * u }, (uu, vv) => clamp(.5 - Math.abs(uu - .42) * 1.6) * clamp(1 - vv), { step: 15, color: PAL.paper, angle: 45 });
    ctx.restore();
    ctx.restore(); return { x: x + (o.dx || 0) * u, y: y + (o.dy || 0) * u };
  }
  // 头发（前层）
  if (!noFace) hairShape(C, -8.35 * u, hw, u, seed, false);
  // 脸的明暗（在五官之前）：右侧一层渐变网点 + 刘海投影
  ctx.save(); ctx.globalAlpha = .24;
  path(CTX, head); CTX.clip();
  dots({ x: -hw, y: -8 * u, w: hw * 2, h: 4.15 * u }, (uu) => clamp((uu - .25) / .85), { step: 16, color: SKIN_D, angle: 45 });
  dots({ x: -hw, y: -8 * u, w: hw * 2, h: 1.0 * u }, (uu, vv) => clamp(.40 * (1 - vv) * (1 - vv)), { step: 12, color: PAL.ink, angle: 15 });
  ctx.restore();
  // 脸
  const fx = faceShift * u * .55, fy = 0;
  const eyeY = -6.0 * u + fy;
  const gap = view === 'side' ? .0 : 2.25 * u;
  const es = view === 'side' ? .9 : 1;
  if (view === 'side') {
    eyeshape(emo.eye, fx + 2.3 * u, eyeY, u, es, 1, blink);
    mouthshape(emo.mouth, fx + 2.5 * u, -4.55 * u, u, .85);
  } else {
    eyeshape(emo.eye, fx - gap, eyeY, u, es, -1, blink);
    eyeshape(emo.eye, fx + gap, eyeY, u, es, 1, blink);
    mouthshape(emo.mouth, fx + .15 * u, -4.4 * u, u, 1.02);
  }
  if (C.stubble) {
    dots({ x: fx - 2.6 * u, y: -4.1 * u, w: 5.2 * u, h: 1.0 * u }, (uu, vv) => clamp(vv * 1.2 - .15) * .55, { step: 12, color: PAL.ink, alpha: .35 });
  }
  if (emo.top) topextra(emo.top, fx, eyeY, u, o);
  ctx.restore();
  return { x: x + (o.dx || 0) * u, y: y + (o.dy || 0) * u };
}

function hairShape(C, top, hw, u, seed, back, full) {
  const ink = PAL.ink, col = C.hairCol;
  const ctx = CTX;
  if (full) {                       // 背面：一头头发盖住整颗头（后脑勺）
    shape(rrectPts(-hw + .08 * u, -8.55 * u, hw * 2 - .16 * u, 4.1 * u, .9 * u),
      { fill: col, ink, sw: 6.5, seed: seed + 58 });
    // 发旋
    shape(ellPts(.6 * u, -7.3 * u, .5 * u, .32 * u, 12), { fill: mix(col, PAL.paper, .12), ink: null, seed: seed + 59 });
    return;
  }
  if (C.hair === 'short') {
    if (back) return;
    const h = [[-hw - .15 * u, -7.05 * u], [-hw + .2 * u, -8.55 * u], [-2.2 * u, -8.95 * u], [1.6 * u, -8.9 * u], [hw - .5 * u, -8.4 * u], [hw + .1 * u, -6.95 * u],
      [hw - .55 * u, -7.55 * u], [1.9 * u, -7.62 * u], [1.2 * u, -7.30 * u], [.2 * u, -7.62 * u], [-1.2 * u, -7.34 * u], [-2.6 * u, -7.66 * u], [-hw + .35 * u, -7.2 * u]];
    shape(h, { fill: col, ink, sw: 6.5, seed: seed + 50 });
  } else if (C.hair === 'buns') {
    if (back) {
      for (const s of [-1, 1]) shape(ellPts(s * 5.1 * u, -8.6 * u, 1.15 * u, 1.15 * u, 16), { fill: col, ink, sw: 6, seed: seed + 55 + s });
      return;
    }
    shape([[-hw, -7.0 * u], [-hw + .1 * u, -8.6 * u], [-2.4 * u, -9.0 * u], [1.8 * u, -8.95 * u], [hw - .2 * u, -8.5 * u], [hw, -7.1 * u], [hw - .7 * u, -6.9 * u], [0, -8.15 * u], [-hw + .6 * u, -6.95 * u]],
      { fill: col, ink, sw: 6.5, seed: seed + 51 });
  } else if (C.hair === 'crew') {
    if (back) return;
    shape([[-hw, -7.55 * u], [-hw + .3 * u, -8.4 * u], [0, -8.62 * u], [hw - .3 * u, -8.4 * u], [hw, -7.55 * u], [hw - .5 * u, -7.7 * u], [0, -8.05 * u], [-hw + .5 * u, -7.7 * u]],
      { fill: col, ink, sw: 6, seed: seed + 52 });
  } else if (C.hair === 'afro') {
    if (back) return;
    const pts = [];
    for (let i = 0; i < 16; i++) { const a = Math.PI * 1.04 + i / 15 * Math.PI * .92; pts.push([Math.cos(a) * 5.9 * u, -7.3 * u + Math.sin(a) * 2.5 * u]); }
    shape(pts.concat([[-hw + .5 * u, -6.9 * u], [hw - .5 * u, -6.9 * u]]), { fill: col, ink, sw: 6.5, seed: seed + 53 });
  }

}
function mix(a, b, k) {
  const p = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const A = p(a), B = p(b);
  const c = A.map((v, i) => Math.round(lerp(v, B[i], k)));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
