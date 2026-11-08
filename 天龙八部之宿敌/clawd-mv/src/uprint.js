// uprint.js — 浮世绘印刷层（v4 分镜实现基建）
// 提供：套版错位曲线、装裱+画心、bokashi 天空、双线框、朱印、竖题签、纸白淹没、雪/飞白、Clawd 双版封装 pc()
// 颜色纪律：陶土 #D97757 只属于主角，粉 #E58384 只属于宿敌，深朱 #A8322A 只属于血/印/火。

const MOUNT = '#E4D3B0';      // 装裱边
const WASHI = '#F1E4C6';      // 画心和纸
const SUMI = '#2B2233';       // 墨
const BENI = '#A8322A';       // 深朱（事件红）
const CLAY = '#D97757';       // 主角陶土（= PAL.clay）
const FEN = '#E58384';        // 宿敌胭脂粉
const AI = '#1F4E6B';         // 普鲁士蓝
const AI_LT = '#6E9FB5';      // 淡蓝
const MOE = '#D98C7E';        // 淡绯（花）
const OCHRE = '#9A6A3C';      // 赭石
const MIDORI = '#7B8A6A';     // 灰绿
const KIN = '#C8A05C';        // 淡金
const KX = '"XingKai","STXingkai","STKaiti","KaiTi",serif';   // 华文行楷

const SEG = [[0,0],[22.3,.5],[42.1,1],[61.9,2],[101.81,2],[123.5,2.5],[143.2,4],[163.5,8],[203.27,8],[205.1,0],[263.34,0]];
function misreg(t) {
  for (let i = 0; i < SEG.length - 1; i++) { const [a, va] = SEG[i], [b, vb] = SEG[i + 1];
    if (t >= a && t <= b) return lerp(va, vb, (t - a) / (b - a)); }
  return 0;
}
const t8 = t => Math.floor(t * 8) / 8;   // 8fps 步进（人物用）

// ---------- bokashi 天空（逐像素一次生成，按参数缓存） ----------
const _bok = new Map();
function bokashi(key, col, alpha, y0, y1) {
  const k = key + col + alpha + '|' + y0 + '|' + y1;
  if (_bok.has(k)) { image(_bok.get(k), 0, 0); return; }
  const g = createGraphics(W, H); g.pixelDensity(1);
  const c = g.drawingContext, id = c.createImageData(W, Math.max(2, y1 + 40)), d = id.data;
  const r = parseInt(col.slice(1, 3), 16), gc = parseInt(col.slice(3, 5), 16), b = parseInt(col.slice(5, 7), 16);
  for (let x = 0; x < W; x++) {
    const edge = y0 + (hash(x * 7 + 1) - .5) * 44 + Math.sin(x * .008) * 14;
    for (let y = Math.max(0, Math.floor(edge)); y < id.height; y++) {
      const f = clamp((y - edge) / Math.max(40, y1 - edge));
      const a = alpha * 255 * Math.min(1, f * 1.35), i = (y * W + x) * 4;
      d[i] = r; d[i + 1] = gc; d[i + 2] = b; d[i + 3] = a;
    }
  }
  c.putImageData(id, 0, 0);
  _bok.set(k, g); image(g, 0, 0);
}

// ---------- 装裱 + 画心 + 双线框 ----------
function mountBG(t, o = {}) {
  paint(rectPts(-60, -60, W + 120, H + 120, 2), { wash: o.mount || MOUNT, washOp: 255, ink: null });
  paint(rectPts(28, 28, W - 56, H - 56, 3), { wash: o.paper || WASHI, washOp: 255, ink: null });
  if (o.sky) bokashi(o.skyK || 'sky', o.sky[0], o.sky[1] ?? 200, o.skyY0 ?? 60, o.skyY1 ?? 520);
  // 统一景深层（可在单镜用 flat:1 关掉，或用 kind 指定）
  if (!o.flat) depth(t, o);
  goma(o.goma ?? 26, o.gomaK || 'g');
}

// ---------- 景深层：远景山/海/林/屋 + 雾带 + 地平 + 前景暗物 + 飞鸟+浮尘 ----------
// 目的：任何一镜都不出现"一片死色 + 一个小人"。全部压得很淡（washOp 70~120），只负责depth，不抢戏。
function depth(t, o = {}) {
  const key = String(o.gomaK || 'g'), hh = (i) => hash(i * 3.7 + key.length * 11 + key.charCodeAt(0) * .31);
  const kinds = ['mtn', 'mtn', 'sea', 'forest', 'roofs', 'haze'];
  const kind = o.kind || kinds[Math.floor(hh(1) * kinds.length) % kinds.length];
  const yH = o.yH || 660;                      // 地平线
  const pale = (c, k = .72) => mixCol(WASHI, c, k);   // 远处一切都要退到纸里去
  // ① 地平霞带：一条极淡的横向色带，压住"天空/地面"的交界
  const bandCol = [AI, OCHRE, MOE, MIDORI][Math.floor(hh(2) * 4)];
  paint(rectPts(30, yH - 26, W - 60, 54, 3), { wash: pale(bandCol, .5), washOp: 74, ink: null, curv: .1 });
  // ② 主景：远景剪影
  if (kind === 'mtn') {
    for (let L = 0; L < 2; L++) {
      const top = yH - 120 - L * 74, pts = [[20, yH + 8]];
      for (let i = 0; i <= 8; i++) pts.push([20 + i * (W - 40) / 8, top + (hh(10 + L * 9 + i) - .35) * 150 - (i % 2 ? 0 : 40)]);
      pts.push([W - 20, yH + 8]);
      paint(pts, { wash: pale(L ? AI : mixCol(AI, SUMI, .25), L ? .52 : .34), washOp: L ? 96 : 120, ink: null, curv: .3 });
      inkLine(pts.slice(1, pts.length - 1), L ? 1.1 : 1.5, pale(AI, .25), 'inkfine', .25);
    }
    // 山脚横擦
    for (let i = 0; i < 7; i++) { const x = 120 + hh(40 + i) * (W - 240), y = yH - 44 + hh(50 + i) * 60;
      inkLine([[x, y], [x + 60 + hh(60 + i) * 90, y + 2]], 1.2, pale(AI, .5), 'inkfine', .2); }
  } else if (kind === 'sea') {
    for (let L = 0; L < 3; L++) {
      const y = yH - 40 + L * 34;
      paint(rectPts(30, y, W - 60, 34, 2), { wash: pale(AI, .45 + L * .1), washOp: 92, ink: null });
      for (let i = 0; i < 6; i++) { const x = 140 + hh(70 + L * 7 + i) * (W - 280);
        inkLine([[x, y + 16], [x + 26, y + 8], [x + 52, y + 16]], 1.2, pale(AI, .3), 'inkfine', .4); }
    }
  } else if (kind === 'forest') {
    for (let i = 0; i < 9; i++) {
      const x = 90 + hh(80 + i) * (W - 180), h = 150 + hh(90 + i) * 190, w = 16 + hh(100 + i) * 12;
      inkLine([[x, yH + 10], [x + (hh(110 + i) - .5) * 20, yH - h]], w * .55, pale(MIDORI, .3), 'ink', .2);
      for (let k = 0; k < 3; k++) { const cy = yH - h + k * h * .22;
        paint(ellPts(x + (hh(120 + i * 3 + k) - .5) * 70, cy, w * 2.1, w * 1.1, 12), { wash: pale(MIDORI, .45), washOp: 88, ink: null }); }
    }
  } else if (kind === 'roofs') {
    for (let row = 0; row < 2; row++) {
      const yb = yH - 30 + row * 54, s = 1 + row * .22;
      for (let i = 0; i < 8; i++) {
        const x = 60 + i * (W - 120) / 8 + (hh(130 + row * 11 + i) - .5) * 30, w = 110 * s, h = 46 * s;
        paint([[x - w / 2, yb], [x - w * .2, yb - h], [x + w * .2, yb - h], [x + w / 2, yb]], { wash: pale(SUMI, .35 + row * .1), washOp: 84, ink: null, curv: .15 });
        inkLine([[x - w * .2, yb - h], [x + w * .2, yb - h]], 1.1, pale(SUMI, .4), 'inkfine', 0);
      }
    }
  } else {   // haze：只留远汀 + 云带
    for (let i = 0; i < 4; i++) { const y = yH - 150 + i * 34;
      paint(rectPts(30, y, W - 60, 12 + hh(140 + i) * 12, 2), { wash: pale(AI, .4), washOp: 62, ink: null }); }
  }
  // ③ 地面：地平线以下压一层土色 + 横擦
  paint(rectPts(30, yH + 30, W - 60, H - yH - 60, 3), { wash: pale(OCHRE, .16), washOp: 92, ink: null });
  inkLine([[40, yH + 30], [W - 40, yH + 30]], 1.6, pale(SUMI, .45), 'inkfine', .2);
  for (let i = 0; i < 9; i++) { const y = yH + 60 + hh(150 + i) * 240, x = 80 + hh(160 + i) * (W - 300);
    inkLine([[x, y], [x + 70 + hh(170 + i) * 140, y + 3]], 1.1, pale(SUMI, .55), 'inkfine', .15); }
  // ④ 前景暗物：左右下角草／枝，给画面一个"镜头在里面"的近景
  boilSeed('fg' + key);
  const fgc = mixCol(SUMI, MIDORI, .18);
  for (const side of [0, 1]) {
    const bx = side ? W - 40 : 40, dir = side ? -1 : 1;
    for (let i = 0; i < 7; i++) {
      const x = bx + dir * (10 + hh(180 + side * 9 + i) * 90);
      const top = H - 40 - hh(190 + side * 9 + i) * 210;
      inkLine([[bx + dir * hh(200 + i) * 40, H - 20], [x + (hh(210 + i) - .5) * 30, top + 80], [x, top]], 2.2 + hh(220 + i) * 1.8,
        fgc, 'ink', .35);
    }
  }
  // ⑤ 飞鸟 2~3 只 + 浮尘
  const bn = 2 + Math.floor(hh(230) * 2);
  for (let i = 0; i < bn; i++) {
    const x = W * (.16 + hh(240 + i) * .7) + Math.sin(t * .8 + i) * 18, y = yH - 250 - hh(250 + i) * 190, s = 9 + hh(260 + i) * 8;
    inkLine([[x - s, y], [x, y - s * .55], [x + s, y]], 1.5, pale(SUMI, .35), 'inkfine', .5);
  }
  for (let i = 0; i < 10; i++) {
    const ph = frac(t * (.05 + hh(270 + i) * .06) + hh(280 + i));
    const x = 60 + hh(290 + i) * (W - 120) + Math.sin(ph * TAU + i) * 30, y = yH - 420 + ph * 620;
    paint(ellPts(x, y, 4 + hh(300 + i) * 3, 2.2, 8), { wash: pale(KIN, .6), washOp: 130, ink: null });
  }
}

function sheetFrame(sw = 1) {
  if (sw <= 0) return;   // 出画段落不画框
  paint(rectPts(44, 44, W - 88, H - 88, 3), { ink: SUMI, sw: 3.2 * sw });
  paint(rectPts(53, 53, W - 106, H - 106, 2), { ink: SUMI, sw: 1.4 * sw });
}
function goma(n, key) {
  boilSeed('goma' + key);
  for (let i = 0; i < n; i++) {
    const x = 60 + hash(i * 3.1 + key.length) * (W - 120), y = 60 + hash(i * 5.7 + key.length * 3) * (H - 120);
    paint(ellPts(x, y, 2.4, 1.5, 6), { fill: SUMI, fillOp: 24, ink: null });
  }
}

// ---------- 朱印 ----------
function seal(x, y, s, txt, k = 1, rot = 0) {
  if (k <= .02) return;
  push(); translate(x, y); rotate(rot); scale(k, k);
  const pts = []; for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + TAU / 8, r = s * .58 * (1 + (hash(i * 7 + 3) - .5) * .12);
    pts.push([Math.cos(a) * r * 1.06, Math.sin(a) * r * .92 + jit(s * .04)]); }
  paint(pts, { wash: BENI, washOp: 246, ink: null });
  pop();
  // 2026-11-07 修：原来 letter 在 push/translate 内记的是局部坐标 (0, .04s)，结果印章字全被画到画布左上角。
  // letter 记的是世界坐标，必须在 pop() 之后用绝对坐标发。
  if (txt) letter(txt, x, y + s * .04 * k, s * .82 * k, '#F6EBD3',
    { font: `${Math.round(s * .82 * k)}px ${KX}`, ink: false, alpha: Math.min(1, k * 1.25) });
}

// ---------- 横题签（片头大歌名：横排 + 右端朱印，一眼可读） ----------
function hTitle(cx, cy, txt, size, k = 1, sub = '') {
  if (k <= .02) return;
  const n = [...txt].length;
  const w = n * size * 1.06 + size * 2.4, h = size * 1.92 + (sub ? size * .5 : 0);
  const x0 = cx - w / 2, y0 = cy - h / 2;
  // 纸签 + 双线框（落签有 3px 过冲）
  paint(rectPts(x0, y0, w, h, 2), { wash: '#F3E7C6', washOp: 255 * k, ink: null });
  paint(rectPts(x0 + 5, y0 + 5, w - 10, h - 10, 2), { ink: SUMI, sw: 3 * k });
  paint(rectPts(x0 + 12, y0 + 12, w - 24, h - 24, 2), { ink: SUMI, sw: 1.3 * k });
  // 逐字落下（印刷揭示用 8fps 步进）
  const baseY = y0 + h * .5 + size * .02;
  for (let i = 0; i < n; i++) {
    const ch = txt[i], a = clamp((k - .1 - i * .06) * 3.2);
    if (a > 0) letter(ch, x0 + size * 1.2 + i * size * 1.06, baseY, size, SUMI,
      { font: `${Math.round(size)}px ${KX}`, ink: false, alpha: a, screen: true });
  }
  if (sub) { const ss = Math.min(size * .42, w * .5 / Math.max(1, [...sub].length));
    letter(sub, x0 + size * 1.2 + n * size * 1.06 * .5, y0 + h - size * .34, ss, mixCol(SUMI, '#7A6A4A', .45),
      { font: `${Math.round(ss)}px ${KX}`, ink: false, alpha: k, screen: true }); }
  seal(x0 + w - size * 1.12, baseY - (sub ? size * .12 : 0), size * .84, '宿', k, .05);
}

// ---------- 竖题签（片头歌名 / 卷首） ----------
function vTitle(cx, topY, txt, size, k = 1, sub = '') {
  if (k <= .02) return;
  const n = [...txt].length, w = size * 2.0, h = n * size * 1.28 + size * 1.6 + (sub ? size * 1.7 : 0);
  const y0 = topY;
  paint(rectPts(cx - w / 2, y0, w, h, 2), { wash: '#F3E7C6', washOp: 255 * k, ink: null });
  paint(rectPts(cx - w / 2 + 4, y0 + 4, w - 8, h - 8, 2), { ink: SUMI, sw: 2.6 * k });
  paint(rectPts(cx - w / 2 + 9, y0 + 9, w - 18, h - 18, 2), { ink: SUMI, sw: 1.2 * k });
  for (let i = 0; i < n; i++) {
    const ch = txt[i], a = clamp((k - .15 - i * .1) * 4);
    if (a > 0) letter(ch, cx, y0 + size * 1.5 + i * size * 1.28, size, SUMI, { font: `${size}px ${KX}`, ink: false, alpha: a, screen: true });
  }
  if (sub) {   // 副标题按题签宽度自动缩字号，避免溢出到签外
    const ss = Math.min(size * .52, w * .84 / Math.max(1, [...sub].length));
    letter(sub, cx, y0 + h - size * .9, ss, mixCol(SUMI, '#7A6A4A', .4), { font: `${Math.round(ss)}px ${KX}`, ink: false, alpha: k, screen: true });
  }
  seal(cx, y0 + h + size * .9, size * .8, '宿', k);
}

// ---------- 纸白淹没（从右往左 / 从下往上） ----------
function washPaper(k, dir = 'right') {
  if (k <= 0) return;
  const kk = ease(clamp(k));
  if (dir === 'bottom') {
    const yEdge = lerp(H + 160, -160, kk);
    const pts = []; for (let i = 0; i <= 12; i++) pts.push([i / 12 * (W + 120) - 60, yEdge + (hash(i * 17 + Math.floor(kk * 30)) - .5) * 70]);
    for (let i = 12; i >= 0; i--) pts.push([i / 12 * (W + 120) - 60, H + 160]);
    paint(pts, { wash: WASHI, washOp: 255, ink: null, curv: .4 }); return;
  }
  const xEdge = lerp(W + 160, -160, kk);
  const pts = []; for (let i = 0; i <= 12; i++) pts.push([xEdge + (hash(i * 17 + Math.floor(kk * 30)) - .5) * 70, i / 12 * (H + 120) - 60]);
  for (let i = 12; i >= 0; i--) pts.push([W + 160, i / 12 * (H + 120) - 60]);
  paint(pts, { wash: WASHI, washOp: 255, ink: null, curv: .4 });
}

// ---------- 雪花（纸白 + 墨线勾边） / 飞白火星 ----------
function snow(t, n, key, x0, x1, y0, y1, sp = 1, win = 46) {
  for (let i = 0; i < n; i++) {
    const s = hash(i * 31.7 + key.length * 7), s2 = hash(i * 13.3 + key.length * 11);
    const ph = frac(s + t * (.028 + s2 * .02) * sp);
    const y = y0 + (y1 - y0) * ph;
    const x = x0 + (x1 - x0) * frac(s * 7.3) + Math.sin(t * (.5 + s) + i) * 26;
    const r = (2.4 + s2 * 2.6) * win / 46;
    paint(ellPts(x, y, r, r * .8, 8), { fill: '#FBF5E6', fillOp: 235, ink: SUMI, sw: .5 });
  }
}
function sparks(t, n, key, x, y, r) {
  for (let i = 0; i < n; i++) {
    const a = hash(i * 9.1 + key.length) * TAU, d = r * (.3 + hash(i * 4.7) * .7), ph = frac(t * .9 + hash(i * 2.3));
    paint(ellPts(x + Math.cos(a) * d * ph, y + Math.sin(a) * d * ph - 30 * ph, 2.6, 2.6, 6), { fill: KIN, fillOp: 200 * (1 - ph), ink: null });
  }
}
function mist(y, w, h, col, a) {
  paint(rrPts(W * .5 - w / 2 + Math.sin(y) * 20, y, w, h, h / 2, 5), { wash: col, washOp: a, ink: null, curv: .5 });
}

// ---------- 印刷质感叠层（纤维 + 木纹 + 飞白），生成一次 ----------
let _tex = null;
function weaveTex() {
  if (_tex) return _tex;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'), rnd = lcg(37);
  // 木纹：横向波浪
  for (let i = 0; i < 70; i++) {
    const y0 = rnd() * H;
    c.strokeStyle = `rgba(96,74,48,${.02 + rnd() * .03})`; c.lineWidth = .8 + rnd() * 2.2;
    c.beginPath(); c.moveTo(-20, y0);
    for (let x = 0; x <= W + 40; x += 60) c.lineTo(x, y0 + Math.sin(x * .01 + i) * (4 + rnd() * 8));
    c.stroke();
  }
  // 纤维
  for (let i = 0; i < 1100; i++) {
    const x = rnd() * W, y = rnd() * H, l = 5 + rnd() * 24, a = rnd() * TAU;
    c.strokeStyle = `rgba(120,95,62,${.03 + rnd() * .04})`; c.lineWidth = .6;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + .8) * l * .4, y + Math.sin(a + .8) * l * .4, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
  }
  // goma-zuri 飞白
  for (let i = 0; i < 3200; i++) { c.fillStyle = `rgba(70,52,34,${.02 + rnd() * .035})`;
    c.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1 + rnd() * 2); }
  _tex = cv; return cv;
}
function printTex(c) {
  c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = .8; c.drawImage(weaveTex(), 0, 0); c.restore();
}

// ---------- 前景陈设（给每幅加版画纵深） ----------
function dress(t, kind, side = 1) {
  boilSeed('dress' + kind + side);
  const f = side;
  if (kind === 'branch') {   // 折枝：从左/右边缘横入，带两片叶
    push(); translate(f > 0 ? -60 : W + 60, 120); scale(f, 1);
    inkLine([[0, 0], [260, 90], [520, 150]], 9, OCHRE, 'ink', .35);
    inkLine([[260, 90], [340, 30]], 5, OCHRE, 'ink', .3);
    for (let i = 0; i < 3; i++) paint(ellPts(300 + i * 110, 60 + i * 40, 34, 14, 10, 3, -.4), { wash: MIDORI, washOp: 235, ink: SUMI, sw: .9 });
    pop();
  } else if (kind === 'lantern') {   // 极前景大灯笼，切在画面角上
    push(); translate(f > 0 ? 90 : W - 90, -40);
    inkLine([[0, 0], [0, 150]], 3, SUMI, 'ink', 0);
    paint(rrPts(-110, 150, 220, 280, 60, 4), { wash: mixCol(BENI, SUMI, .25), washOp: 245, ink: SUMI, sw: 2.4 });
    for (let i = 0; i < 5; i++) inkLine([[-90, 190 + i * 52], [90, 190 + i * 52]], 1.4, mixCol(SUMI, BENI, .3), 'inkfine', .2);
    pop();
  } else if (kind === 'post') {   // 木柱切边
    paint(rectPts(f > 0 ? 30 : W - 110, -20, 80, H + 40, 3), { wash: mixCol(OCHRE, SUMI, .3), washOp: 255, ink: SUMI, sw: 2.4 });
    for (let i = 0; i < 6; i++) inkLine([[f > 0 ? 40 : W - 100, 120 + i * 180], [f > 0 ? 100 : W - 40, 130 + i * 180]], 1.2, mixCol(SUMI, WASHI, .4), 'inkfine', .2);
  } else if (kind === 'grass') {
    for (let i = 0; i < 9; i++) { const bx = f > 0 ? 40 + i * 50 : W - 40 - i * 50;
      inkLine([[bx, H + 10], [bx + (hash(i * 7) - .5) * 60, H - 120 - hash(i * 3) * 130]], 2.2, mixCol(MIDORI, SUMI, .4), 'ink', .4); }
  }
}

function pc(x, y, u, o = {}) {
  const dip = o.dip !== undefined ? o.dip : misreg(T);
  const opt = { ...o }; delete opt.dip;
  if (!('mouth' in opt) && !opt.noEyes) opt.mouth = 'flat';   // 默认给一条嘴线，不然表情读不出来
  const th = h => (h ? (uu, sw, pass) => h(uu, sw, pass) : undefined);
  if (o.armL) opt.armL = th(o.armL);
  if (o.armR) opt.armR = th(o.armR);
  if (o.draw) opt.draw = th(o.draw);
  if (dip > .05) clawd(x + dip, y, u, { ...opt, pass: 'wash' });
  clawd(x, y, u, { ...opt, pass: dip > .05 ? 'ink' : 'both' });
}

// ---------- 主角道具 ----------
// 背后双刀（画在 clawd 之前）
function backSwords(x, topY, u, dip = 0, flip = false) {
  if (true) return;   // 2026-11-07 停用：刀身太细，渲染出来是两根漂浮的棕色三角+红棒，读不出是刀。改用手持 katana()。
  const f = flip ? -1 : 1;
  boilSeed('backswords');
  for (const [dx, len, ang] of [[-1.2 * f, 9.5 * u, -.5], [1.0 * f, 7.5 * u, -.38]]) {
    const x0 = x + dx * u * .4, y0 = topY + 1.2 * u;
    const x1 = x0 + Math.sin(ang) * len * f * .35 + dip, y1 = y0 - Math.cos(ang) * len;
    paint([[x0 - 1.4 * u * f, y0], [x1, y1], [x1 + 1.6 * u * f * .22, y1 + 2 * u], [x0 + 1.8 * u * f, y0 + .6 * u]],
      { wash: mixCol(OCHRE, SUMI, .35), washOp: 255, ink: SUMI, sw: 1.1, curv: .2 });
    paint(rectPts(x1 - 1.1 * u * f * .22, y1 - .5 * u, 2.2 * u * f * .22 + 2.2 * u, 1 * u, u * .05), { wash: BENI, washOp: 255, ink: SUMI, sw: .8 });
  }
}
// 束带（draw hook 用）
const belt = (u, sw, pass) => {
  paint(rectPts(-4.9 * u, -4.35 * u, 9.8 * u, .95 * u, u * .05), {
    wash: pass === 'ink' ? null : SUMI, washOp: 255, ink: pass === 'wash' ? null : SUMI, sw: sw * .4 });
};
// 菅笠：worn=0 挂背（clawd 之前画），worn=1 斜戴（clawd 之后画）。全遮遮眼只许 V24/V45。
// ⚠ 2026-11-07：笠宽 12.4u > 身宽 10u，一戴就把角色读成"房子"。默认全线停用，只有 force:1 才画（仅 V45 全遮眼 + V48）。
function kasa(cx, topY, u, o = {}) {
  if (!o.force) return;
  const dip = o.dip !== undefined ? o.dip : misreg(T), tilt = o.tilt || 0, back = o.back || 0;
  const drawK = (pass, ox) => {
    push(); translate(cx + ox, topY); rotate(tilt * .3 + back * .12);
    const w = 6.2 * u, h = 5.6 * u, apex = -h;
    const wc2 = pass === 'ink' ? null : (o.col || '#F3EBDC'), ic2 = pass === 'wash' ? null : SUMI;
    // 笠面
    paint([[-w, 0], [0, apex], [w, 0]], { wash: wc2, washOp: 255, ink: ic2, sw: 1.4, curv: .25 });
    // 编织纹
    if (pass !== 'wash') for (let i = 1; i < 6; i++) {
      const f = i / 6;
      inkLine([[-w * (1 - f), -h * f * .96], [0, apex + (0 - apex) * f * 1.02], [w * (1 - f), -h * f * .96]], .7, mixCol(SUMI, '#6B5F52', .35), 'inkfine', .2);
    }
    inkLine([[-w * .92, -.3 * u], [0, -h * .5], [w * .92, -.3 * u]], 1.1, ic2 || SUMI, 'ink', .3);
    pop();
  };
  if (dip > .05) drawK('wash', dip);
  drawK(dip > .05 ? 'ink' : 'both', 0);
  if (o.back) {   // 系带垂到体侧
    inkLine([[cx - 4.6 * u, topY + .6 * u], [cx - 5.2 * u, topY + 3.2 * u]], .8, SUMI, 'inkfine', .3);
    inkLine([[cx + 4.6 * u, topY + .6 * u], [cx + 5.2 * u, topY + 3.2 * u]], .8, SUMI, 'inkfine', .3);
  }
}
// 手持短刀（arm hook 用）
const katana = (long = false) => (u, sw, pass) => {
  const L = u * (long ? 3.4 : 2.2);
  paint([[0, 0], [L * .18, -L * .5], [L * .3, -L], [L * .42, -L * .5], [L * .3, .2 * u]],
    { wash: pass === 'ink' ? null : '#EDE3CC', washOp: 255, ink: pass === 'wash' ? null : SUMI, sw: sw * .8, curv: .2 });
  paint(rectPts(-.35 * u, -.2 * u, 1.1 * u, .8 * u, u * .04), { wash: pass === 'ink' ? null : BENI, washOp: 255, ink: pass === 'wash' ? null : SUMI, sw: sw * .5 });
};

// ---------- 群演 ----------
function extra(x, y, u, walk, dip = 0, id = 0) {   // 灰墨无眼 Clawd
  const o = { col: '#8A8078', dk: '#6B6258', lt: '#A99F92', noEyes: true, walk, boilKey: 'ex' + id };
  if (dip > .05) clawd(x + dip, y, u, { ...o, pass: 'wash' });
  clawd(x, y, u, { ...o, pass: dip > .05 ? 'ink' : 'both' });
}

// ---------- 拍点工具（BEAT 由 core.js 按 PROJECT.bpm 推出：60/137.9 = 0.4351） ----------
const pulseBeat = (t, k = .5) => pulse(t - 0.02, k);
