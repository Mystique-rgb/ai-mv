// people.js — 孔版人物（严格按 Clawd 模型表比例：大头 / 小身 / 细手脚）
// 本地坐标：脚底 0，头顶 -100。头 68×56，占全身一半；身体 42×26；四肢是细杆
const CAST_R = {
  yan:  { body: ['blue'],           hair: 'short', buns: 0 },
  fen:  { body: ['pink'],           hair: 'buns',  buns: 1 },
  zhou: { body: ['blue', 'yellow'], hair: 'buzz',  buns: 0 },  // 蓝6+黄4 = 墨绿
  dou:  { body: ['yellow'],         hair: 'afro',  buns: 0 },
};

const VIEWS = {
  front: { sq: 1.00, n: 2, fx: 0 },
  q:     { sq: 0.88, n: 2, fx: 2.4 },
  side:  { sq: 0.60, n: 1, fx: 5 },
  back:  { sq: 1.00, n: 0, fx: 0 },
};

// 头的几何（模型表：头比身体宽得多，重心靠上）
const HEAD = { w: 68, h: 56, top: -100, r: 13 };
const BODY = { w: 42, h: 26, top: -48, r: 7 };

function bodyInk(g, who, d = 1) {
  const c = CAST_R[who] || CAST_R.yan;
  if (c.body.length === 2) { ink(g, c.body[0], 0.62 * d); ink(g, c.body[1], 0.42 * d); }
  else ink(g, c.body[0], d);
}

// 发帽：圆顶 + 波浪下缘（模型表的标志）
function hairCap(g, hair, sq) {
  const w = HEAD.w * sq * .53, yb = hair === 'buzz' ? -88 : -86;
  g.beginPath();
  g.moveTo(-w, yb);
  g.bezierCurveTo(-w * 1.06, -97, -w * .60, -104, 0, -104);
  g.bezierCurveTo(w * .60, -104, w * 1.06, -97, w, yb);
  // 波浪下缘：5 个扇贝
  const n = 5, step = (w * 2) / n;
  for (let i = 0; i < n; i++) {
    const x0 = w - i * step, x1 = w - (i + 1) * step;
    const dip = hair === 'buzz' ? -84 : -81.5;
    g.quadraticCurveTo((x0 + x1) / 2, dip + 2.5, x1, yb - (i % 2 === 0 ? 1.2 : 0));
  }
  g.closePath();
}

function drawHair(g, hair, sq, view) {
  ink(g, 'dark', 1);
  // 丸子 / 爆炸（先画，压在头后面）
  if (hair === 'buns') {
    if (view !== 'side') { ellipse(g, -24 * sq, -103, 7.6, 7.4); g.fill(); }
    ellipse(g, 24 * sq, -103, 7.8, 7.6); g.fill();
  }
  if (hair === 'afro') {
    for (let i = 0; i < 11; i++) {
      const a = Math.PI * (0.92 + i * .106);
      g.beginPath(); g.arc(Math.cos(a) * 27 * sq, -88 + Math.sin(a) * 17, 8.4, 0, TAU); g.fill();
    }
  }
  hairCap(g, hair, sq); g.fill();
}

function drawFace(g, o) {
  const V = VIEWS[o.view || 'front'];
  const mood = o.mood || 'calm';
  const sq = V.sq;
  if (o.view === 'back') return;
  const open = mood === 'blink' ? .12 : mood === 'wide' ? 1.3 : mood === 'sad' ? .82 : 1;
  const ex = 13.2 * sq, ey = -71;
  ink(g, 'dark', 1);
  g.lineCap = 'round';
  const eyes = V.n === 2 ? [[-ex, 1], [ex, 1]] : [[ex, 1]];
  for (const [x] of eyes) {
    if (mood === 'smile' || mood === 'love') {
      g.lineWidth = 4.4;
      g.beginPath();
      g.moveTo(x - 6.8, ey - 2.4);
      g.quadraticCurveTo(x, ey + 6.4, x + 6.8, ey - 2.4);
      g.stroke();
    } else {
      const ew = 7.2 * sq, eh = clamp(10.2 * open, 1.4, 13.5);
      rr(g, x - ew / 2, ey - eh / 2, ew, eh, ew * .48); g.fill();
    }
  }
  // 嘴
  ink(g, 'dark', 1);
  g.lineWidth = 3.2;
  g.beginPath();
  const my = -56;
  if (mood === 'smile' || mood === 'love') { g.moveTo(-6.2, my + .6); g.quadraticCurveTo(0, my + 7.4, 6.2, my + .4); }
  else if (mood === 'sad') { g.moveTo(-5.8, my + 3.2); g.quadraticCurveTo(0, my - 2.4, 5.8, my + 3.0); }
  else if (mood === 'o') { g.arc(0, my + 2.6, 4.6, 0, TAU); g.fill(); }
  else if (mood === 'grit') { g.moveTo(-6.2, my + 1.4); g.lineTo(6.2, my + 1.4); g.lineWidth = 5.2; }
  else { g.moveTo(-5.0, my + 1.6); g.lineTo(5.0, my + 1.6); }
  g.stroke();
  // 腮红：只给她
  if (o.who === 'fen' && (mood === 'smile' || mood === 'love')) {
    ink(g, 'pink', .30);
    ellipse(g, -21 * sq, -61, 8.0, 4.4); g.fill();
    ellipse(g, 21 * sq, -61, 8.0, 4.4); g.fill();
  }
}

function drawChar(g, o) {
  const who = o.who || 'yan';
  const C = CAST_R[who];
  const V = VIEWS[o.view || 'front'];
  const sq = V.sq;
  const p = Object.assign({ armL: 26, armR: -26, legL: 0, legR: 0, lean: 0, bob: 0, headRot: 0 }, o.pose || {});

  g.save();
  g.translate(0, p.bob);
  g.rotate(p.lean * Math.PI / 180);
  g.lineCap = 'round'; g.lineJoin = 'round';

  // 腿（细杆 + 小脚）
  for (const [side, ang] of [[-1, p.legL], [1, p.legR]]) {
    const hx = side * 10.5 * sq, hy = -24;
    const sw = Math.sin(ang * Math.PI / 180);
    const ax = hx + sw * 8.0, ay = -6;
    ink(g, 'dark', .96);
    g.lineWidth = 5.6; g.beginPath(); g.moveTo(hx, hy); g.lineTo(ax, ay); g.stroke();
    ellipse(g, ax + side * 1.0, ay + 1.6, 6.6, 3.6); g.fill();
  }

  // 身体（小方块）
  bodyInk(g, who, 1);
  const bw = BODY.w * sq;
  rr(g, -bw / 2, BODY.top, bw, BODY.h, BODY.r); g.fill();
  ink(g, 'dark', .08);
  g.beginPath(); g.ellipse(0, BODY.top + 2, bw * .46, 5.4, 0, Math.PI, TAU); g.fill();

  // 手臂（细杆，从身体上侧向外下垂）
  const arm = (side, ang) => {
    const sx = side * (bw / 2 - 2.5), sy = BODY.top + 9;
    const a = ang * Math.PI / 180;
    const hx = sx + Math.sin(a) * 14.5 * side, hy = sy + Math.cos(a) * 14.5;
    ink(g, 'dark', .96);
    g.lineWidth = 4.8; g.beginPath(); g.moveTo(sx, sy); g.lineTo(hx, hy); g.stroke();
    // 手：纸白小圆（模型表里手是浅色小圆头）
    cut(g); ellipse(g, hx + side * 1, hy + 1.4, 3.7, 3.7); g.fill();
    return [hx, hy];
  };
  const handL = arm(-1, p.armL);
  const handR = arm(1, p.armR);

  // 头（大，压住身体上缘）
  g.save();
  g.translate(0, HEAD.top + HEAD.h); g.rotate(p.headRot * Math.PI / 180); g.translate(0, -(HEAD.top + HEAD.h));
  const hw = HEAD.w * sq;
  // 脸 = 敲白
  cut(g); rr(g, -hw / 2, HEAD.top, hw, HEAD.h, HEAD.r); g.fill();
  drawHair(g, C.hair, sq, o.view || 'front');
  drawFace(g, o);
  g.restore();

  g.restore();
  return { handL, handR };
}

// 贴到版面
const _tmpCache = new Map();
function person(P, o) {
  const s = o.s || 420, k = s / 100;
  const crop = { x: -56, y: -118, w: 112, h: 126 };
  const bw = Math.max(8, Math.round(crop.w * k)), bh = Math.max(8, Math.round(crop.h * k));
  const key = bw + 'x' + bh;
  let c = _tmpCache.get(key);
  if (!c) { c = document.createElement('canvas'); c.width = bw; c.height = bh; _tmpCache.set(key, c); }
  const g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, bw, bh);
  g.save();
  g.translate(-crop.x * k, -crop.y * k);
  g.scale(k, k);
  if (o.flip) g.scale(-1, 1);
  drawChar(g, o);
  g.restore();

  const dx = Math.round(o.x + crop.x * k), dy = Math.round(o.y + crop.y * k);
  stampChar(P, c, dx, dy, o.halo ?? Math.max(3, s * 0.011));
  return { dx, dy, w: bw, h: bh };
}

// 纸白人形（白洞）
function whiteHole(P, x, y, w, h, r = 10) {
  cut(P.g, 1);
  rr(P.g, x, y, w, h, r); P.g.fill();
}

function shadow(P, x, y, rx, ry, d = .22) {
  ink(P.g, 'blue', d);
  ellipse(P.g, x, y, rx, ry); P.g.fill();
}
