// riso.js: 《把回忆拼好给你》的三块版（Indigo / Terracotta / Fluor Pink）套印层。
// 规则只有一条：世界只有色块、没有描边，边缘是半调点；人物例外——保留手绘墨线 + 纸白挖空边，
// 他们是被贴到这张纸上的"手绘贴纸"。所有形都用 paint() / inkLine()，不用 p5 的 rect/ellipse。
//
// 版 = 颜色 + 含义（照分镜第 2 节）：
//   blue  靛蓝 #3D5588  世界 / 夜 / 海 / 阴霾
//   clay  陶土 #D97757  我（A）
//   pink  荧光粉 #FF48B0  你（B）/ 情话 / 烟花 / 心跳
//   paper 暖白 #F4EEE2  留白 = 没有回忆的地方

const INK = {
  paper: '#F4EEE2', cream: '#FBF6EA',
  blue: '#3D5588', blueDk: '#2A3A63', blueLt: '#7E92BE',
  clay: '#D97757', clayDk: '#A84D33', clayLt: '#F2A283',
  pink: '#FF48B0', pinkDk: '#C22A82', pinkLt: '#FF8FCB',
  // 叠印关系（这是全片的语法，不是滤镜）
  red: '#D9213C',     // 陶土 × 粉 = 爱
  warm: '#34272D',    // 陶土 × 蓝 = 我在世界里被压住
  violet: '#3D185E',  // 粉 × 蓝 = 你不在的世界
  dark: '#1B1117',    // 三版全叠 = 烧尽、失去
  ink: '#2B2233',     // 人物墨线
};

// ---------- 版位与套印错位 ----------
// 每个镜头固定一套偏移（±1–3px），不许每帧抖；只在重拍上"踢"一下（8–14px，0.25s 回弹带余震）。
const PLATE = { blue: [1.6, -1.1], clay: [-2.1, 1.2], pink: [2.0, 2.0], warm: [0, 0], red: [0, 0] };
let KICK = 0;
function setKick(v) { KICK = v; }
function kickOf(t, times, mag = 12) {
  let k = 0;
  for (const t0 of times) { const a = t - t0; if (a >= 0 && a < 1.4) k += mag * Math.exp(-a / .08) * Math.cos(a * 38); }
  return k;
}
function misOf(k) {
  const p = PLATE[k] || [0, 0];
  const wx = k === 'blue' ? 1 : k === 'clay' ? -.85 : .72, wy = k === 'pink' ? .8 : .42;
  return [p[0] + KICK * wx, p[1] + KICK * wy];
}

// ---------- 纸 ----------
function paperBase(tone = INK.paper) {
  boilSeed('paperbase');
  paint(rectPts(-1500, -1500, W + 3000, H + 3000), { wash: tone, ink: null });
}
// 一个色块：默认无描边，边缘由 paint 的抖动 + 半调给它"印刷毛边"
function plate(pts, k, o = {}) {
  const [dx, dy] = misOf(k);
  const { pale, ...rest } = o;
  let col = rest.wash || INK[k];
  if (pale) col = mixCol(INK.paper, col, pale);
  paint(pts.map(p => [p[0] + dx, p[1] + dy]), { ink: null, ...rest, wash: col });
}
// 规矩线：印刷对位用的十字线。歪多少 = 爱差多少；S13 抱住那一刻归零。
function crosshair(x, y, s, k = 'blue', op = 1) {
  boilSeed('xh' + x + y);
  const [dx, dy] = misOf(k);
  inkLine([[x - s, y + dy], [x + s, y + dy]], 1.1, mixCol(INK.paper, INK[k], op), 'inkfine', 0);
  inkLine([[x + dx, y - s], [x + dx, y + s]], 1.1, mixCol(INK.paper, INK[k], op), 'inkfine', 0);
  paint(ellPts(x + dx * .5, y + dy * .5, s * .52, s * .52, 22), { ink: mixCol(INK.paper, INK[k], op), sw: .9 });
}
function regMarks(op = .55) {
  boilSeed('regm');
  for (const [x, y] of [[74, 74], [W - 74, 74], [74, 1044], [W - 74, 1044]]) crosshair(x, y, 22, 'blue', op);
}

// ---------- 半调 ----------
// 预生成 198px 无缝点阵，乘起来用：白底 = 恒等，墨点 = 油墨的叠印。不逐点 paint()，那样一秒几千个点渲不动。
const TONES = {};
function makeToneTile(col, r) {
  const sp = 11, N = sp * 18;
  const g = createGraphics(N, N); g.pixelDensity(1);
  const c = g.drawingContext;
  c.fillStyle = '#ffffff'; c.fillRect(0, 0, N, N); c.fillStyle = col;
  for (let j = 0; j < N / sp; j++) {
    const off = (j % 2) * sp / 2;
    for (let i = -1; i <= N / sp; i++) {
      const x = i * sp + off + sp * .5, y = j * sp + sp * .5;
      c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
    }
  }
  return g;
}
window.risoInit = () => {
  for (const k of ['blue', 'clay', 'pink', 'warm', 'red', 'violet', 'dark']) {
    for (const [dn, r] of [['20', 1.7], ['40', 2.6], ['60', 3.4], ['100', 4.5]]) {
      TONES[k + dn] = makeToneTile(INK[k], r);
      TONES[k + dn + 'p'] = makeToneTile(mixCol(INK.paper, INK[k], .55), r);
    }
  }
};
// 在矩形里铺一层半调（MULTIPLY，白底恒等，墨点叠印）
function tone(x, y, w, h, k, dn = '60', pale = false) {
  const g = TONES[k + dn + (pale ? 'p' : '')]; if (!g) return;
  boilSeed('tone' + k + dn + x + y + w);
  flushBrush();
  const N = g.width, i0 = Math.floor(x / N), i1 = Math.ceil((x + w) / N), j0 = Math.floor(y / N), j1 = Math.ceil((y + h) / N);
  push(); blendMode(MULTIPLY); noTint();
  for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
    const dx = i * N, dy = j * N;
    const sx = Math.max(0, x - dx), sy = Math.max(0, y - dy);
    const ex = Math.min(N, x + w - dx), ey = Math.min(N, y + h - dy);
    if (ex - sx < 1 || ey - sy < 1) continue;
    image(g, sx, sy, ex - sx, ey - sy, dx + sx, dy + sy, ex - sx, ey - sy);   // 只取区域内的那一条，别让整块 198px 的点阵溢出去
  }
  pop();
}
// 一小撮点：烟花、纸屑、星点（数量可控，逐点画）
function specks(cx, cy, r, col, n = 10, seed = 0, spread = .9) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + hash(seed + i) * .5, d = r * (.55 + spread * hash(seed + i * 3.1));
    const s = r * .055 * (.6 + .9 * hash(seed + i * 7.7));
    paint(ellPts(cx + Math.cos(a) * d, cy + Math.sin(a) * d, s, s, 8), { wash: col, ink: null });
  }
}
// 一朵烟花：放射的"花瓣"，每一根是一串由大到小的半调点，中心一圈密点
function burst(cx, cy, r, col = INK.pink, spokes = 16, seed = 0) {
  for (let s = 0; s < spokes; s++) {
    const a = (s / spokes) * TAU + hash(seed + s) * .18;
    const n = 5 + Math.round(4 * hash(seed + s * 3));
    boilSeed('bz' + seed + s);
    for (let k = 1; k <= n; k++) {
      const d = r * (k / n) * (.88 + .22 * hash(seed + s * 7 + k));
      const sz = r * .082 * (1 - .82 * k / (n + 1.4));
      paint(ellPts(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .94, sz, sz * .92, 7), { wash: col, ink: null });
    }
  }
  boilSeed('bzc' + seed);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU, d = r * .18 * (.5 + hash(seed + i));
    paint(ellPts(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r * .07, r * .07, 7), { wash: col, ink: null });
  }
}

// ---------- 人物：A（陶土，我）/ B（荧光粉，你） ----------
// 手绘贴纸：先铺一圈纸白挖空边（4–6px），再画有条线的小方块。B 只换色，不加睫毛、蝴蝶结、裙子。
const A_COL = { col: INK.clay, dk: INK.clayDk, lt: INK.clayLt };
const B_COL = { col: INK.pink, dk: INK.pinkDk, lt: INK.pinkLt };
function halo(x, y, u, o) {
  if (o.halo === false) return;
  const m = u * .14 + 2.8;
  boilSeed('halo' + (o.boilKey ?? '') + Math.round(u));
  push();
  translate(x + (o.dx || 0) * u, y + (o.dy || 0) * u);
  if (o.rot) rotate(o.rot);
  scale((o.flip ? -1 : 1) * (o.sx ?? 1), o.sy ?? 1);
  // 手剪的挖空边：不规则纸白轮廓（4–6px），不是一块整齐的白方块
  const L = -5 * u - m, R = 5 * u + m, T = -8.4 * u - m, B = m * .5;
  const pts = [], n = 12;
  for (let i = 0; i <= n; i++) pts.push([lerp(L, R, i / n), T + (hash(i * 3 + 1) - .5) * m * 1.1]);
  for (let i = 1; i < 4; i++) pts.push([R + (hash(i * 7 + 2) - .5) * m * 1.2, lerp(T, B, i / 4)]);
  for (let i = n; i >= 0; i--) pts.push([lerp(L, R, i / n), B + (hash(i * 5 + 3) - .5) * m * 1.1]);
  for (let i = 3; i >= 1; i--) pts.push([L + (hash(i * 9 + 4) - .5) * m * 1.2, lerp(T, B, i / 4)]);
  paint(pts, { wash: INK.paper, ink: null, curv: .35 });
  pop();
}
function A_(x, y, u, o = {}) { halo(x, y, u, o); clawd(x, y, u, { ...o, ...A_COL, tint: null }); }
function B_(x, y, u, o = {}) { halo(x, y, u, o); clawd(x, y, u, { ...o, ...B_COL, tint: null }); }

// ---------- 常用道具 ----------
// 墨块：三版叠出来的暖黑，像楼一样砸下来
function blockInk(x, y, w, h, j = 1.4) {
  boilSeed('blk' + x + y + w);
  paint(rectPts(x, y, w, h, j), { wash: INK.warm, ink: null });
  paint(rectPts(x + w * .12, y + h * .1, w * .3, h * .22), { wash: INK.dark, washOp: 90, ink: null });
}
// 纸片 / 纸屑
function scrap(x, y, w, h, col, rot = 0) {
  boilSeed('sc' + x + y + w);
  push(); translate(x, y); rotate(rot);
  paint([[0, 0], [w, h * .12], [w, h], [w * .1, h * .9]], { wash: col, ink: null });
  pop();
}
// 纸船
function paperBoat(x, y, s) {
  boilSeed('boat');
  paint([[x - s, y], [x + s, y], [x + s * .62, y + s * .5], [x - s * .62, y + s * .5]], { wash: INK.cream, ink: null });
  paint([[x, y - s * .82], [x + s * .78, y - s * .02], [x - s * .78, y - s * .02]], { wash: INK.paper, ink: null });
  paint(ellPts(x, y + s * .5, s * .62, s * .13, 14), { wash: INK.blue, washOp: 70, ink: null });
}
// 巨大的灰台阶（两个人坐着发呆的地方）
function stepGround(gy, gy0, col = INK.blueDk) {
  boilSeed('step');
  paint(rectPts(-1500, gy, W + 3000, 1400), { wash: col, ink: null });
  paint(rectPts(-1500, gy - 26, W + 3000, 26), { wash: mixCol(col, INK.paper, .22), ink: null });
}
// 眼里的海：三层深浅，浪是半调带；海面以上全是没印过的纸白
function seaBands(hy, amp, t, k = 1) {
  const cols = [INK.blueDk, INK.blue, INK.blueLt];
  for (let i = 0; i < 3; i++) {
    const y0 = hy + i * 62 * k, pts = [];
    for (let x = -400; x <= W + 400; x += 60) pts.push([x, y0 + Math.sin(x * .006 + t * (.6 + i * .3) + i) * amp]);
    pts.push([W + 400, 2000], [-400, 2000]);
    plate(pts, 'blue', { wash: cols[i] });
    tone(-400, y0, W + 800, 62 * k, 'blue', ['40', '60', '20'][i], i === 2);
  }
}
// 网格城市：一条地平线 + 一片竖条楼（每栋单独一个形，别拼成自交多边形）
function gridCity(hy, k = 1) {
  boilSeed('city');
  for (let i = 0; i < 26; i++) {
    const x = -200 + i * 86, h = (40 + 150 * hash(i * 3.1)) * k;
    paint(rectPts(x, hy - h, 46, h + 4, .8), { wash: mixCol(INK.paper, INK.blue, .42), ink: null });
  }
  tone(-240, hy - 190 * k, W + 480, 190 * k + 8, 'blue', '20', true);
}
// 一个用半调点填满的圆（宏观特写用：屏幕里只剩网点）
function dotDisc(cx, cy, r, col, sp = 9) {
  boilSeed('disc' + Math.round(cx) + Math.round(cy));
  const n = Math.ceil(r * 2 / sp);
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
    const x = cx - r + i * sp + (j % 2) * sp * .5, y = cy - r + j * sp, d = Math.hypot(x - cx, y - cy);
    if (d > r * (.94 + .06 * hash(i * 31 + j))) continue;
    const rr = sp * .40 * (1 - .35 * (d / r)) * (.82 + .34 * hash(i * 7 + j * 11));   // 手感的点：大小不齐
    paint(ellPts(x, y, rr, rr, 12), { wash: col, ink: null });
  }
}

// ---------- 印刷用的全帧叠层（在 composite 之后、字幕之前） ----------
let PRINT_TEX = null;
function makePrintTex() {
  const N = 240, sp = 7.2, cv = document.createElement('canvas');
  cv.width = N; cv.height = N;
  const c = cv.getContext('2d');
  c.fillStyle = '#ffffff'; c.fillRect(0, 0, N, N);
  c.fillStyle = '#8E8B86';
  for (let j = 0; j < N / sp; j++) for (let i = -1; i <= N / sp; i++) {
    const x = i * sp + (j % 2) * sp / 2 + sp / 2, y = j * sp + sp / 2;
    c.beginPath(); c.arc(x, y, 1.15, 0, 6.2832); c.fill();
  }
  return cv;
}
PRINT_TEX = makePrintTex();

// ---------- 全屏转场：滚筒扫过（这个片的"缝"都靠它，不许叠化） ----------
// p 0 → .5 滚筒压过（把画面盖住），.5 → 1 从另一侧滚走。cut 在 p = .5 的全遮盖下。
function rollerSweep(p, col = INK.blue) {
  if (p <= 0 || p >= 1) return;
  boilSeed('roller');
  // x1 = 油墨前沿：p<.5 一路压过去盖住全画，p>.5 从左边被拖着走、露出下一镜
  const x1 = p < .5 ? lerp(-460, W + 460, easeOut(p * 2)) : lerp(W + 460, -460, ease(p * 2 - 1));
  if (x1 > -420) {
    paint(rectPts(-460, -120, x1 + 460, H + 240), { wash: col, ink: null });
    paint(rectPts(-460, -120, x1 + 460, H + 240), { wash: INK.blueDk, washOp: 40, ink: null });
    for (let i = 0; i < 7; i++) inkLine([[-460, 30 + i * 168], [x1, 22 + i * 168]], 2.4, mixCol(col, INK.paper, .3), 'dry', 0);
    // 滚筒本身：一根竖着的圆柱，墨色更重，边缘一道纸白
    paint(rectPts(x1 - 46, -120, 92, H + 240), { wash: mixCol(col, INK.blueDk, .45), ink: null });
    inkLine([[x1 + 6, -120], [x1 + 6, H + 120]], 3.4, INK.paper, 'ink', 0);
    inkLine([[x1 - 30, -120], [x1 - 30, H + 120]], 1.4, mixCol(col, INK.paper, .5), 'inkfine', 0);
  }
}
