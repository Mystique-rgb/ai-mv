// diorama.js —— 纸雕灯箱（paper-lantern diorama）布景库
//
// 世界 = 一个竖版浅盒子（844 × 1492 px），里面平行插着 8 张纸：
//   z0.06 天空 / z0.16 远山 / z0.30 墙（真的挖穿一个窗洞）/ z0.46 中景（吊灯、照片、搁板、帘）
//   z0.56 她自己那一层（纱纸）/ z0.70 地面与家具 / z0.86 人 / z1.00 前景（箱口与飞尘）
// 盒子里只有三样东西：纸、透过纸的光、影子。背面一盏暖灯，纸是单色平涂 + 切边受光 + 纸纤维，
// **明度阶梯就是景深**（远层亮而透，近层暗而实）。
//
// 铁律（分镜词 §4.3）：一切都是"棍子上的纸"——只平移、只绕支点转、只从 0 展开；
// 不许挤压拉伸、不许形变弯曲、不许 3D 推拉、不许鞭甩。人（clawd）是唯一会 sq 的东西（呼吸）。

const BOX = { x0: -560, y0: 214, x1: 1640, y1: 1706 };   // 2200 × 1492 的宽灯箱（16:9 用）
const BW = BOX.x1 - BOX.x0, BH = BOX.y1 - BOX.y0;
const CX = (BOX.x0 + BOX.x1) / 2, CY = (BOX.y0 + BOX.y1) / 2;
const CEIL = 300;                      // 天花板纸的下沿
const FTOP = 1380;                     // 地板纸的上沿
const GY = 1562;                       // 脚踩的地面线（箱内世界坐标）
const WIN0 = { x: 152, y: 430, w: 296, h: 420 };   // 主窗洞
const WIN2 = { x: 980, y: 470, w: 250, h: 330 };  // 右侧那扇关着的窗

// ---------- 色阶：换段 = 换时空。远亮近暗 ----------
const DSET = {
  night: { sky: '#7b95cf', sky2: '#4c6aaa', hill: '#28355e', wall: '#3b4f86', wallDk: '#222f4e', mid: '#1b2545',
           floor: '#1a2440', floorDk: '#0e1526', front: '#080b15', light: '#ffb45e', rim: '#ffd7a0', accent: '#f08fba', warm: '#ff9c54' },
  gold:  { sky: '#ffd89c', sky2: '#f0b271', hill: '#8a4a32', wall: '#a4613f', wallDk: '#753f27', mid: '#54291b',
           floor: '#3a1d13', floorDk: '#24100a', front: '#160805', light: '#ffcf7a', rim: '#ffe8be', accent: '#f18db3', warm: '#ff9f5c' },
  violet:{ sky: '#6f60a4', sky2: '#4b3d7c', hill: '#2a1e46', wall: '#3a2c5d', wallDk: '#241938', mid: '#1a1030',
           floor: '#140b24', floorDk: '#0a0616', front: '#06030d', light: '#a9bfe6', rim: '#dbe7ff', accent: '#df8aa8', warm: '#bd7f9e' },
};
const mixSet = (a, b, k) => { const o = {}; for (const key in a) o[key] = mixCol(a[key], b[key], clamp(k)); return o; };

// 全片色阶弧线：A 夜（B1–B4）→ B 金（B5–B8）→ C 紫（B9–B17）→ 最后 0.5s 回温
function dgPal(t) {
  let p = mixSet(DSET.night, DSET.gold, ease(seg(t, 12.9, 14.15)));
  p = mixSet(p, DSET.violet, ease(seg(t, 24.10, 27.55)));
  p = mixSet(p, DSET.night, .94 * ease(seg(t, 54.62, 55.36)));
  if (t > 55.10) p.light = mixCol(p.light, '#ffb862', ease(seg(t, 55.10, 55.55)));
  return p;
}

// 把一整套色阶压暗（灯一层层灭的时候，每层用不同的 k）
function dgDim(p, k) {
  const o = {};
  for (const key in p) o[key] = (key === 'light' || key === 'rim' || key === 'warm' || key === 'accent')
    ? mixCol(p[key], '#04030a', .72 * clamp(k)) : mixCol(p[key], '#04030a', clamp(k));
  return o;
}
const dgDimCol = (col, k) => mixCol(col, '#04030a', clamp(k));

// ---------- 光：唯一光源在盒体背后；每拍呼吸 + 一点闪 ----------
const dgFlick = (t, seed = 0) => 1 + .05 * Math.sin(t * 6.3 + seed) + .03 * Math.sin(t * 11.7 + seed * 2)
  + .10 * pulse(t, 9) * (.6 + .4 * hash(beatN(t) + seed));

// ---------- 相机：只做平移与恒速推拉 ----------
let DGV = { dx: 0, dy: 0, z: 1 };
const DGFIT = .78;   // 竖版世界放进 16:9 画幅的统一系数
function dgCam(dx = 0, dy = 0, z = 1) {
  const zz = z * DGFIT;
  let cy = CY + dy;
  // 远景（整间房都在画里）时，把地面线压到画幅 84% 处，别让人贴着画框底边
  const hi = H * (zz < 1.02 ? .79 : .87), lo = H * (zz < 1.02 ? .58 : .44);
  const g1 = 540 + (GY - cy) * zz;
  if (g1 > hi) cy += (g1 - hi) / zz;
  const g2 = 540 + (GY - cy) * zz;
  if (g2 < lo) cy -= (lo - g2) / zz;
  DGV = { dx, dy, z }; camBegin(CX + dx, cy, zz);
  if (SHELLQ) { const [sp, so] = SHELLQ; SHELLQ = null; dgShellDraw(sp, so); }
}
function dgCamEnd() { camEnd(); }
// 每张纸按深度做视差：近层相对动得多一点（不做 3D 投影）
function dgLayer(z, fn) {
  const k = z - .5, par = .84 + .34 * z;
  push();
  translate(CX, CY); scale(1 + k * .10); translate(-CX, -CY);
  translate(-DGV.dx * (par - 1) * DGV.z, -DGV.dy * (par - 1) * DGV.z);
  fn();
  pop();
}

// ---------- 纸的基元 ----------
const off = (P, dx, dy) => P.map(p => [p[0] + dx, p[1] + dy]);

// 投影：纸片投在它后面那张纸上的影子。这是"层叠纸"唯一的立体证据。
function dgShadow(P, k = 1, sx = 7, sy = 12) {
  if (k <= .02) return;
  paint(off(P, sx, sy), { wash: '#0a0814', washOp: 62 * k, ink: null });
  paint(off(P, sx * 1.8, sy * 2.2), { wash: '#0a0814', washOp: 26 * k, ink: null });
}

// 一张剪纸：影子 → 平涂 → 纸纤维 → 切边受光
function dgPaper(P, col, o = {}) {
  if (o.shadow !== false) dgShadow(P, o.sk == null ? 1 : o.sk, o.sx == null ? 7 : o.sx, o.sy == null ? 12 : o.sy);
  paint(P, { wash: col, washOp: o.op == null ? 255 : o.op, ink: null, curv: o.curv });
  if (o.fibre) dgFibre(P, o.fibreCol || mixCol(col, '#ffffff', .30), o.fibreK == null ? .18 : o.fibreK, o.fibreD == null ? 11 : o.fibreD);
  if (o.rim) dgRim(o.rim, o.rimW == null ? 2.2 : o.rimW, o.rimCol || mixCol(col, '#ffe0b0', .55));
}

// 纸纤维（一次 hatch 画满一整块）
function dgFibre(P, col, k = .18, d = 11) {
  paint(P, { hatch: { d: d, a: k, o: { rand: .5, gradient: .45 }, b: 'HB', c: col, w: .7 }, ink: null });
}
// 一条切边（暖色受光）
function dgRim(P, w = 2, col = '#ffd9a6') { if (P && P.length > 1) inkLine(P, w, col, 'inkfine', .35); }
// 整圈切边（小物件用）
function dgEdge(P, w = 1.6, col = '#ffd9a6') { if (P && P.length > 2) inkLine(P.concat([P[0]]), w, col, 'inkfine', .3); }

// 矩形纸（切边在顶上受光）
function dgRect(x, y, w, h, col, o = {}) {
  const P = rectPts(x, y, w, h, o.j == null ? 1.1 : o.j);
  dgPaper(P, col, {
    shadow: o.shadow, sk: o.sk, sx: o.sx, sy: o.sy, fibre: o.fibre, fibreCol: o.fibreCol, fibreK: o.fibreK, op: o.op,
    rim: o.rim === false ? null : [[x, y + 1], [x + w, y + 1]],
    rimCol: o.rimCol || mixCol(col, '#ffe2b4', .5), rimW: o.rimW == null ? 2 : o.rimW,
  });
  if (o.shade) paint(rectPts(x, y + h - (o.shadeW || 10), w, (o.shadeW || 10)), { wash: o.shade, washOp: o.shadeOp || 110, ink: null });
  return P;
}

// ---------- 盒子外壳：黑场 → 木框 → 黑衬里 → 内壁倒角 ----------
let SHELLQ = null;
function dgShell(p, o = {}) { SHELLQ = [p, o]; }
function dgShellDraw(p, o) {
  if (!o.bare) { paint(rectPts(CX - 3400, CY - 2800, 6800, 5600), { wash: '#07050c', ink: null }); flushBrush(); }
  if (o.glowK) {
    glow(CX, CY, 1020, o.glowCol || p.warm, .20 * o.glowK);
    glow(CX, CY, 640, o.glowCol || p.warm, .16 * o.glowK);
  }
  const fb = o.frame || 30, ls = o.liner || 13;
  // 桌子：灯箱摆在桌上，暖光从箱缝漏到桌面
  if (!o.bare) {
    paint(rectPts(-400, BOX.y1 + 40, W + 800, 900), { wash: '#150f18', ink: null });
    dgRim([[-200, BOX.y1 + 112], [W + 200, BOX.y1 + 144]], 2, mixCol(p.warm, '#150f18', .30));
    glow(CX, BOX.y1 + 60, 620, p.warm, .18 * (o.glowK || 0));
  }
  const wood = o.wood || '#241a22', woodLt = mixCol(wood, p.warm, .34);
  const x0 = BOX.x0 - ls - fb, x1 = BOX.x1 + ls + fb, y0 = BOX.y0 - ls - fb, y1 = BOX.y1 + ls + fb;
  paint(rectPts(x0 - 34, y0 - 34, (x1 - x0) + 68, (y1 - y0) + 68), { wash: wood, ink: null });
  dgRim([[BOX.x0 - ls - 2, BOX.y0 - ls - 3], [BOX.x1 + ls + 2, BOX.y0 - ls - 3]], 2.4, woodLt);
  dgRim([[BOX.x0 - ls - 3, BOX.y0 - ls], [BOX.x0 - ls - 3, BOX.y1 + ls]], 1.6, mixCol(wood, p.warm, .18));
  dgRim([[BOX.x1 + ls + 3, BOX.y0 - ls], [BOX.x1 + ls + 3, BOX.y1 + ls]], 1.6, mixCol(wood, p.warm, .10));
  const lin = mixCol('#07050d', p.front, .5);
  paint(rectPts(BOX.x0 - ls - 1, BOX.y0 - ls - 1, BW + 2 * ls + 2, ls + 1), { wash: lin, ink: null });
  paint(rectPts(BOX.x0 - ls - 1, BOX.y1, BW + 2 * ls + 2, ls + 1), { wash: lin, ink: null });
  paint(rectPts(BOX.x0 - ls - 1, BOX.y0 - ls - 1, ls + 1, BH + 2 * ls + 2), { wash: lin, ink: null });
  paint(rectPts(BOX.x1, BOX.y0 - ls - 1, ls + 1, BH + 2 * ls + 2), { wash: lin, ink: null });
  if (o.bevel !== false && DGV.z < 1.2) {
    const c = mixCol(p.rim, p.front, .58);
    inkLine([[BOX.x0, BOX.y0], [BOX.x0 + 28, BOX.y0]], 2.2, c, 'inkfine', .2);
    inkLine([[BOX.x0, BOX.y0], [BOX.x0, BOX.y0 + 28]], 2.2, c, 'inkfine', .2);
    inkLine([[BOX.x1, BOX.y0], [BOX.x1 - 28, BOX.y0]], 2.2, c, 'inkfine', .2);
    inkLine([[BOX.x0, BOX.y1], [BOX.x0, BOX.y1 - 26]], 1.4, mixCol(c, p.front, .5), 'inkfine', .2);
    inkLine([[BOX.x1, BOX.y1], [BOX.x1, BOX.y1 - 26]], 1.4, mixCol(c, p.front, .5), 'inkfine', .2);
  }
}

// ---------- z0.06 天空 ----------
function dgSky(p, st = {}) {
  const k = st.k == null ? 1 : st.k;
  dgLayer(.06, () => {
    glow(st.gx == null ? WIN0.x + WIN0.w * .5 : st.gx, st.gy == null ? WIN0.y + WIN0.h * .5 : st.gy, 820, p.light, .30 * k);
    glow(st.gx == null ? WIN0.x + WIN0.w * .5 : st.gx, st.gy == null ? WIN0.y + WIN0.h * .5 : st.gy, 400, p.light, .28 * k);
    dgPaper(rectPts(BOX.x0 - 8, BOX.y0 - 8, BW + 16, BH + 16), p.sky, { shadow: false });
    // 云：两条被光打白的纸带
    const cy1 = st.cloudY == null ? 620 : st.cloudY;
    dgPaper([[BOX.x0 - 20, cy1], [BOX.x0 + 220, cy1 - 22], [BOX.x0 + 450, cy1 + 12], [BOX.x0 + 690, cy1 - 16], [BOX.x1 + 20, cy1 + 8],
             [BOX.x1 + 20, cy1 + 54], [BOX.x0 + 690, cy1 + 32], [BOX.x0 + 450, cy1 + 58], [BOX.x0 + 220, cy1 + 20], [BOX.x0 - 20, cy1 + 44]],
            p.sky2, { shadow: false,
              rim: [[BOX.x0, cy1 + 2], [BOX.x0 + 220, cy1 - 20], [BOX.x0 + 450, cy1 + 14], [BOX.x0 + 690, cy1 - 14], [BOX.x1, cy1 + 10]],
              rimCol: mixCol(p.sky2, '#ffffff', .5), rimW: 1.6 });
    // 星孔：纸上的针孔，光透过来
    for (let i = 0; i < 58; i++) {
      const x = BOX.x0 + hash(i * 3.1 + 2) * BW, y = BOX.y0 + hash(i * 7.7 + 9) * (BH * .58);
      const s = 1.2 + hash(i * 5.3) * 2.6, tw = .45 + .55 * Math.sin(T * (1.3 + hash(i) * 1.8) + i);
      paint(rectPts(x, y, s, s), { wash: mixCol(p.light, '#ffffff', .55 + .4 * tw), washOp: 140 + 100 * tw, ink: null });
    }
    // 月亮：一个打穿的洞
    const mx = st.mx == null ? WIN0.x + WIN0.w * .70 : st.mx, my = st.my == null ? WIN0.y + WIN0.h * .24 : st.my, mr = st.mr == null ? 42 : st.mr;
    glow(mx, my, mr * 4.6, p.light, .28 * k);
    glow(mx, my, mr * 2.2, p.light, .26 * k);
    dgPaper(ellPts(mx, my, mr, mr, 22), mixCol(p.light, '#ffffff', .66), { shadow: false,
            rim: ellPts(mx, my + mr - 1, mr * .84, mr * .12, 14), rimCol: mixCol(p.light, '#ffffff', .8), rimW: 1.6 });
  });
}

// ---------- z0.16 远山 ----------
function dgHills(p, st = {}) {
  const WN = st.win || WIN0;
  dgLayer(.16, () => {
    const base = WN.y + WN.h * .96, c = p.hill;
    dgPaper([[BOX.x0, base - 96], [WN.x + 30, base - 150], [WN.x + 140, base - 104], [WN.x + 250, base - 158], [WN.x + WN.w + 70, base - 86],
             [BOX.x1, base - 120], [BOX.x1, BOX.y1], [BOX.x0, BOX.y1]], mixCol(c, p.front, .12),
            { shadow: false, rim: [[WN.x + 30, base - 150], [WN.x + 140, base - 104], [WN.x + 250, base - 158]], rimCol: mixCol(p.rim, c, .32), rimW: 1.4 });
    dgPaper([[BOX.x0, base - 40], [WN.x + 80, base - 74], [WN.x + 200, base - 30], [WN.x + 320, base - 64], [BOX.x1, base - 24],
             [BOX.x1, BOX.y1], [BOX.x0, BOX.y1]], mixCol(c, p.front, .38),
            { shadow: false, rim: [[WN.x + 80, base - 74], [WN.x + 200, base - 30], [WN.x + 320, base - 64]], rimCol: mixCol(p.rim, c, .20), rimW: 1.2 });
  });
}

// ---------- z0.30 墙 ----------
function dgWall(p, st = {}) {
  const WN = st.win || WIN0, lk = dgFlick(T) * (st.k == null ? 1 : st.k);
  dgLayer(.30, () => {
    const wx = WN.x, wy = WN.y, ww = WN.w, wh = WN.h;
    const wallC = p.wall, rimC = mixCol(p.rim, wallC, .42);
    const panel = (x, y, w, h, rim) => {
      const P = rectPts(x, y, w, h, 1.2);
      dgShadow(P, 1, 9, 16);
      paint(P, { wash: wallC, ink: null });
      if (rim) dgRim(rim, 2.2, rimC);
    };
    panel(BOX.x0, CEIL, BW, wy - CEIL, [[BOX.x0, wy - 2], [wx - 2, wy - 2], [wx + ww + 2, wy - 2], [BOX.x1, wy - 2]]);
    panel(BOX.x0, wy + wh, BW, FTOP - (wy + wh), [[wx - 2, wy + wh + 2], [wx + ww + 2, wy + wh + 2]]);
    panel(BOX.x0, wy, wx - BOX.x0, wh, [[wx - 2, wy], [wx - 2, wy + wh]]);
    panel(wx + ww, wy, BOX.x1 - (wx + ww), wh);
    // 天花板
    dgPaper(rectPts(BOX.x0 - 4, BOX.y0 - 4, BW + 8, CEIL - BOX.y0 + 4), mixCol(p.wallDk, p.front, .42),
            { shadow: false, rim: [[BOX.x0, CEIL - 1], [BOX.x1, CEIL - 1]], rimCol: mixCol(p.rim, p.wallDk, .35), rimW: 2 });
    // 窗洞的切面（纸有厚度）
    const thick = 7, ic = mixCol(wallC, '#06040d', .66);
    paint(rectPts(wx - thick, wy - thick, ww + 2 * thick, thick), { wash: ic, ink: null });
    paint(rectPts(wx - thick, wy + wh, ww + 2 * thick, thick), { wash: ic, ink: null });
    paint(rectPts(wx - thick, wy, thick, wh), { wash: ic, ink: null });
    paint(rectPts(wx + ww, wy, thick, wh), { wash: ic, ink: null });
    glow(wx + ww * .5, wy + wh * .5, ww * 1.5, p.light, .30 * lk);
    // 上暗下暖：一层竖向的亮度差，墙不再是一块平涂
    paint(rectPts(BOX.x0, CEIL, BW, (FTOP - CEIL) * .42), { wash: mixCol(wallC, '#05040c', .30), washOp: 60, ink: null });
    paint(rectPts(BOX.x0, CEIL + (FTOP - CEIL) * .62, BW, (FTOP - CEIL) * .38), { wash: mixCol(wallC, p.light, .22), washOp: 46, ink: null });
    // 纸纤维 + 墙纸竖纹
    dgFibre(rectPts(BOX.x0, CEIL, BW, FTOP - CEIL), mixCol(wallC, '#ffffff', .24), .12, 13);
    for (let i = 1; i < 5; i++) {
      const x = BOX.x0 + BW * i / 5;
      if (x > wx - 6 && x < wx + ww + 6) continue;
      inkLine([[x, CEIL + 8], [x, FTOP - 6]], 1.1, mixCol(wallC, p.front, .36), 'inkfine', .2);
    }
    // 挂镜线
    dgPaper(rectPts(BOX.x0, CEIL + 70, BW, 11), mixCol(wallC, p.wallDk, .5),
            { shadow: false, rim: [[BOX.x0, CEIL + 71], [BOX.x1, CEIL + 71]], rimCol: rimC, rimW: 1.6 });
    // 窗棂 + 窗台
    const mull = mixCol(wallC, p.light, .28);
    paint(rectPts(wx + ww * .5 - 5, wy, 10, wh), { wash: mull, ink: null });
    paint(rectPts(wx, wy + wh * .46 - 5, ww, 10), { wash: mull, ink: null });
    dgRim([[wx + ww * .5 - 4, wy], [wx + ww * .5 - 4, wy + wh]], 1.4, mixCol(p.rim, mull, .5));
    dgPaper(rectPts(wx - 24, wy + wh, ww + 48, 17), mixCol(wallC, p.light, .20),
            { rim: [[wx - 24, wy + wh + 1], [wx + ww + 24, wy + wh + 1]], rimCol: mixCol(p.rim, wallC, .55), rimW: 2.6 });
    // ---- 右半边：一扇关着的窗 / 衣柜 / 挂钟 / 海报（让 16:9 的墙不空） ----
    if (BW > 1700) {
      // 关着的窗：一块暗玻璃 + 窗框（不是洞，光只从边缘漏）
      const W2 = WIN2;
      dgPaper(rectPts(W2.x - 18, W2.y - 18, W2.w + 36, W2.h + 36), mixCol(wallC, p.wallDk, .35),
              { rim: [[W2.x - 18, W2.y - 17], [W2.x + W2.w + 18, W2.y - 17]], rimCol: mixCol(p.rim, wallC, .38), rimW: 2.2 });
      paint(rectPts(W2.x, W2.y, W2.w, W2.h), { wash: mixCol(p.sky, p.front, .62), ink: null });
      paint(rectPts(W2.x + W2.w * .5 - 4, W2.y, 8, W2.h), { wash: mixCol(wallC, p.front, .3), ink: null });
      paint(rectPts(W2.x, W2.y + W2.h * .5 - 4, W2.w, 8), { wash: mixCol(wallC, p.front, .3), ink: null });
      glow(W2.x + W2.w * .5, W2.y + W2.h * .5, 120, p.light, .12 * lk);
      // 衣柜：一整块纸，两条门缝 + 一对把手
      const wx0 = 1330, wy0 = 620, wwd = 300, wht = FTOP - 60 - wy0;
      dgPaper(rectPts(wx0, wy0, wwd, wht), mixCol(p.wallDk, p.wall, .35),
              { rim: [[wx0, wy0 + 1], [wx0 + wwd, wy0 + 1]], rimCol: mixCol(p.rim, p.wall, .45), rimW: 2.6, sk: 1.2, sx: 10, sy: 14 });
      inkLine([[wx0 + wwd / 2, wy0 + 10], [wx0 + wwd / 2, wy0 + wht - 10]], 2, mixCol(p.wallDk, p.front, .55), 'inkfine', .2);
      dgRim([[wx0 + wwd * .5 - 26, wy0 + wht * .48], [wx0 + wwd * .5 - 26, wy0 + wht * .56]], 2.4, mixCol(p.rim, p.wall, .5));
      dgRim([[wx0 + wwd * .5 + 26, wy0 + wht * .48], [wx0 + wwd * .5 + 26, wy0 + wht * .56]], 2.4, mixCol(p.rim, p.wall, .5));
      // 挂钟
      const ck = [760, 330], cr = 48;
      dgPaper(ellPts(ck[0], ck[1], cr, cr, 20), mixCol(p.wallDk, p.light, .18),
              { rim: ellPts(ck[0], ck[1] - cr + 2, cr * .9, cr * .12, 12), rimCol: mixCol(p.rim, wallC, .5), rimW: 1.6 });
      inkLine([[ck[0], ck[1]], [ck[0] + 2, ck[1] - 26]], 2, mixCol(p.wallDk, p.front, .6), 'inkfine', .2);
      inkLine([[ck[0], ck[1]], [ck[0] + 20, ck[1] + 8]], 2.4, mixCol(p.wallDk, p.front, .6), 'inkfine', .2);
      // 海报
      dgPaper(rectPts(-330, 560, 150, 200), mixCol(p.wallDk, p.light, .22),
              { rim: [[-330, 561], [-180, 561]], rimCol: mixCol(p.rim, p.wall, .4), rimW: 2 });
      paint(rectPts(-318, 574, 126, 172), { wash: mixCol(p.mid, p.light, .30), ink: null });
      inkLine([[-300, 700], [-220, 640], [-186, 676]], 2, mixCol(p.mid, p.front, .4), 'inkfine', .3);
    }
    // 踢脚线
    dgPaper(rectPts(BOX.x0, FTOP - 46, BW, 16), mixCol(p.wallDk, p.front, .18),
            { rim: [[BOX.x0, FTOP - 45], [BOX.x1, FTOP - 45]], rimCol: mixCol(p.rim, p.wallDk, .4), rimW: 2 });
    dgPaper(rectPts(BOX.x0, FTOP - 30, BW, 30), mixCol(p.wallDk, p.wall, .45), { shadow: false });
  });
}

// ---------- z0.46 中景 ----------
function dgLamp(p, x, y, o = {}) {
  const k = o.k == null ? 1 : o.k, sway = o.sway == null ? .05 : o.sway;
  const ax = x + Math.sin(T * 1.15 + x * .01) * sway * 40;
  glow(ax, y + 24, 300, p.light, .30 * k);
  glow(ax, y + 24, 130, p.light, .36 * k);
  inkLine([[x, CEIL + 12], [ax, y - 30]], 1.8, mixCol(p.mid, p.front, .45), 'inkfine', .3);
  glow(ax, y + 8, 150, p.light, .5 * k);
  const shade = [[ax - 54, y + 26], [ax - 26, y - 28], [ax + 26, y - 28], [ax + 54, y + 26]];
  dgPaper(through(shade.concat([shade[0]]), 3), mixCol(p.light, p.mid, .30), { shadow: false,
          rim: [[ax - 54, y + 26], [ax - 26, y - 28], [ax + 26, y - 28], [ax + 54, y + 26]], rimCol: mixCol(p.rim, p.light, .55), rimW: 2 });
  paint(ellPts(ax, y + 27, 52, 9, 16), { wash: mixCol(p.light, '#ffffff', .55), ink: null });
}

function dgPhotos(p, list, o = {}) {
  list.forEach((ph, i) => {
    const sway = Math.sin(T * 1.9 + i * 1.7) * .05 + (o.wind || 0) * Math.sin(T * 3.1 + i) * .10;
    const pin = [ph.x + ph.w / 2, ph.y - (o.hang == null ? 54 : o.hang)];
    push(); translate(ph.x + ph.w / 2, ph.y + ph.h); rotate(sway); translate(-(ph.x + ph.w / 2), -(ph.y + ph.h));
    inkLine([[pin[0], CEIL + 78], [pin[0], pin[1]]], 1.2, mixCol(p.mid, p.front, .5), 'inkfine', .3);
    dgPhoto(p, ph.x, ph.y, ph.w, ph.h, ph);
    pop();
  });
}

function dgPhoto(p, x, y, w, h, o = {}) {
  const back = o.col || mixCol(p.mid, p.light, .22);
  dgPaper(rectPts(x, y, w, h, .7), back, { rim: [[x, y + 1], [x + w, y + 1]], rimCol: mixCol(p.rim, back, .5), rimW: 1.6, sx: 4, sy: 7 });
  paint(rectPts(x + w * .10, y + h * .12, w * .80, h * .66), { wash: mixCol(back, p.light, .42), ink: null });
  if (o.empty) return;
  const fy = y + h * .68, fw = w * .17, fh = h * .21, tint = o.tint || 0;
  dgPaper(rectPts(x + w * .24, fy - fh, fw, fh), mixCol(PAL.clay, p.front, .26 + tint), { shadow: false, sk: .3 });
  dgPaper(rectPts(x + w * .58, fy - fh, fw, fh), mixCol(p.accent, p.front, .18 + tint), { shadow: false, sk: .3 });
  if (o.crack) inkLine([[x + w * .52, y + h * .12], [x + w * .47, y + h * .44], [x + w * .56, y + h * .84]], 1.8, mixCol(p.front, p.light, .3), 'inkfine', .4);
}

function dgCurtain(p, WN, wind = 0, k = 1) {
  const c = mixCol(p.wallDk, p.accent, .08), sway = wind * .22;
  [-1, 1].forEach((s) => {
    const x = s < 0 ? WN.x - 14 : WN.x + WN.w + 14, dir = -s;
    const P = through([[x, WN.y - 26], [x + dir * (10 + sway * 22), WN.y + 92], [x + dir * (16 + sway * 44), WN.y + 212], [x + dir * (6 + sway * 66), WN.y + WN.h * .84]], 4);
    dgPaper(ribbon(P, 44 * k, 28 * k), c, { shadow: false, rim: P, rimCol: mixCol(p.rim, c, .38), rimW: 1.4 });
  });
}

function dgShelf(p, x, y, w) {
  dgPaper(rectPts(x, y, w, 13), mixCol(p.mid, p.front, .26), { rim: [[x, y + 1], [x + w, y + 1]], rimCol: mixCol(p.rim, p.mid, .35), rimW: 1.8 });
  paint(rectPts(x + 14, y + 13, 11, 40), { wash: mixCol(p.mid, p.front, .5), ink: null });
  paint(rectPts(x + w - 26, y + 13, 11, 40), { wash: mixCol(p.mid, p.front, .5), ink: null });
  for (let i = 0; i < 4; i++) dgRect(x + 20, y - 12 - i * 13, 76 - i * 7, 12, mixCol(p.mid, i % 2 ? p.front : p.light, .24 + i * .04), { shadow: false, rim: false });
  dgPaper(rrPts(x + 116, y - 48, 40, 48, 8, .6), mixCol(p.light, p.mid, .5), { shadow: false, rim: [[x + 116, y - 47], [x + 156, y - 47]], rimCol: mixCol(p.rim, p.light, .5), rimW: 1.6 });
  [0, 1, 2].forEach(i => dgPaper(ribbon([[x + 190 + i * 15, y], [x + 194 + i * 15 + (i - 1) * 12, y - 30], [x + 200 + i * 15 + (i - 1) * 20, y - 54]], 13, 4), mixCol(p.mid, p.light, .28), { shadow: false }));
  dgPaper(rrPts(x + 176, y - 22, 42, 22, 5, .5), mixCol(p.mid, p.front, .16), { shadow: false });
}

// ---------- z0.70 地面与家具 ----------
function dgFloor(p, st = {}) {
  dgLayer(.70, () => {
    const col = p.floor;
    dgPaper([[BOX.x0 - 6, FTOP - 4], [BOX.x1 + 6, FTOP - 4], [BOX.x1 + 6, BOX.y1 + 10], [BOX.x0 - 6, BOX.y1 + 10]], col, { shadow: false });
    for (let i = 0; i < 6; i++) {
      const y = FTOP + 30 + i * 48;
      inkLine([[BOX.x0, y], [BOX.x1, y + (i % 2 ? 6 : -5)]], 1.1, mixCol(col, p.front, .45), 'inkfine', .3);
    }
    dgFibre(rectPts(BOX.x0, FTOP, BW, BOX.y1 - FTOP), mixCol(col, '#ffffff', .22), .11, 14);
    dgRim([[BOX.x0, FTOP - 3], [BOX.x1, FTOP - 3]], 2.6, mixCol(p.rim, col, .66));
    if (BW > 1700) {   // 右侧的地面：一条更长的地毯 + 落在那里的窗光
      const R2 = rectPts(700, FTOP + 150, 760, 210, 1.6);
      dgShadow(R2, 1, 4, 8);
      paint(R2, { wash: mixCol(p.floor, p.accent, .09), ink: null });
      dgRim([[700, FTOP + 151], [1460, FTOP + 151]], 1.8, mixCol(p.rim, p.accent, .38));
      glow(WIN2.x + WIN2.w * .5, FTOP + 150, 300, p.light, .14 * (st.poolK == null ? 1 : st.poolK));
    }
    if (st.pool !== false) {
      const k = st.poolK == null ? 1 : st.poolK;
      glow(WIN0.x + WIN0.w * .55, FTOP + 120, 460, p.light, .40 * k);
      glow(WIN0.x + WIN0.w * .95, BOX.y1 - 120, 250, p.light, .16 * k);
    }
    if (st.rug) {
      const rx = st.rug.x == null ? 250 : st.rug.x, ry = st.rug.y == null ? FTOP + 120 : st.rug.y;
      const rw = st.rug.w == null ? 470 : st.rug.w, rh = st.rug.h == null ? 168 : st.rug.h;
      const R = rectPts(rx, ry, rw, rh, 1.6);
      dgShadow(R, 1, 4, 8);
      paint(R, { wash: mixCol(p.floor, p.accent, .13), ink: null });
      for (let i = 0; i < 3; i++) {
        const t = rx + 30 + i * (rw - 60) / 2;
        inkLine([[t, ry + 14], [t, ry + rh - 14]], 1.2, mixCol(p.accent, p.front, .32), 'inkfine', .3);
      }
      dgRim([[rx, ry + 1], [rx + rw, ry + 1]], 1.8, mixCol(p.rim, p.accent, .45));
    }
  });
}

function dgSuitcase(p, x, y, w, h, o = {}) {
  const body = mixCol(p.mid, p.front, .24), inner = mixCol(p.front, '#000000', .18);
  const lidC = mixCol(p.mid, p.light, .34);
  // 立起来的箱盖（在他身后，像一扇小门）：受光的一面，亮
  if (o.open !== false) {
    const lid = [[x - 18, y + 10], [x + w + 18, y + 10], [x + w - 8, y - h * .92], [x + 6, y - h * .96]];
    dgPaper(lid, lidC, { rim: [[x + 6, y - h * .96], [x + w - 8, y - h * .92]], rimCol: mixCol(p.rim, lidC, .55), rimW: 3 });
    // 箱盖里面的隔层线
    inkLine([[x + 16, y - h * .84], [x + w - 14, y - h * .80]], 1.6, mixCol(lidC, p.front, .35), 'inkfine', .3);
    inkLine([[x + 18, y - h * .58], [x + w - 16, y - h * .55]], 1.4, mixCol(lidC, p.front, .35), 'inkfine', .3);
    if (o.tags !== false) inkLine([[x + w - 20, y - h * .90], [x + w - 34, y - h * .46]], 1.2, mixCol(p.accent, p.front, .2), 'inkfine', .3);
  }
  // 开口：内壁有一点点暖反光，才不会读成一块死黑
  paint(rectPts(x, y, w, h), { wash: inner, ink: null });
  paint(rectPts(x + 10, y + 6, w - 20, h * .52), { wash: mixCol(inner, p.light, .22), washOp: 165, ink: null });
  // 里面已经收进去的衣物（薄纸片，一片压一片）
  for (let i = 0; i < 3; i++) {
    const cw = w * .50, cx = x + 14 + i * (w * .20), cy = y + h * .30 + i * 12;
    dgPaper(rectPts(cx, cy, cw, h * .34, .8), mixCol(body, p.light, .22 + i * .07),
            { shadow: false, rim: [[cx, cy + 1], [cx + cw, cy + 1]], rimCol: mixCol(p.rim, body, .35), rimW: 1.6, sk: .4 });
  }
  // 前沿：最亮的一条，把箱口"翻"出来
  dgPaper(rectPts(x - 20, y + h - 4, w + 40, 24), mixCol(body, p.light, .34),
          { rim: [[x - 20, y + h - 3], [x + w + 20, y + h - 3]], rimCol: mixCol(p.rim, body, .7), rimW: 3 });
  inkLine([[x + 14, y + h + 2], [x + w - 14, y + h + 2]], 1.8, mixCol(p.rim, body, .4), 'inkfine', .2);
  // 箱体两侧的立边
  dgPaper(rectPts(x - 12, y + 10, 12, h - 4), mixCol(body, p.light, .10), { shadow: false, sk: .5 });
  dgPaper(rectPts(x + w, y + 10, 12, h - 4), mixCol(body, p.front, .15), { shadow: false, sk: .5 });
}

function dgDresser(p, x, y, w, h, o = {}) {
  const c = mixCol(p.mid, p.front, .22);
  dgPaper(rectPts(x, y - h, w, h), c, { rim: [[x, y - h + 1], [x + w, y - h + 1]], rimCol: mixCol(p.rim, c, .45), rimW: 2.2 });
  for (let i = 0; i < (o.drawers || 2); i++) {
    const dy = y - h + 26 + i * (h - 34) / 2, dw = w - 36, dh = (h - 46) / 2;
    paint(rectPts(x + 18, dy, dw, dh), { wash: mixCol(c, p.front, .18), ink: null });
    inkLine([[x + 18, dy + 1], [x + 18 + dw, dy + 1]], 1.2, mixCol(p.rim, c, .30), 'inkfine', .2);
    paint(rectPts(x + w / 2 - 22, dy + dh * .5 - 4, 44, 8), { wash: mixCol(p.rim, c, .5), ink: null });
  }
  dgPhoto(p, x + 18, y - h - 66, 62, 72, {});
  dgPaper(rrPts(x + w - 74, y - h - 44, 34, 40, 6, .6), mixCol(p.light, p.mid, .45), { shadow: false, rim: [[x + w - 74, y - h - 43], [x + w - 40, y - h - 43]], rimCol: mixCol(p.rim, p.light, .5), rimW: 1.4 });
}

function dgRail(p, x, y, w, o = {}) {
  const wind = o.wind || 0, n = o.n == null ? 3 : o.n;
  inkLine([[x, y], [x + w, y]], 3, mixCol(p.mid, p.front, .30), 'inkfine', .2);
  for (let i = 0; i < n; i++) {
    const cx = x + 34 + i * (w - 68) / Math.max(1, n - 1);
    const sway = Math.sin(T * 1.6 + i * 1.3) * .04 + wind * .18;
    push(); translate(cx, y); rotate(sway);
    const c = mixCol(p.wall, i % 2 ? p.light : p.mid, .30 + i * .06);
    // 衣架：一个三角，再往下才是衣服
    inkLine([[-22, 10], [0, -18], [22, 10]], 1.8, mixCol(p.wall, p.front, .5), 'inkfine', .2);
    inkLine([[0, -18], [0, 4]], 1.6, mixCol(p.wall, p.front, .5), 'inkfine', .2);
    // 衣身：肩宽、腰收、下摆（有肩线和袖口，才不像口袋）
    const P = [[-34, 12], [-18, 0], [18, 0], [34, 12], [30, 64], [24, 142], [-24, 142], [-30, 64]];
    dgPaper(through(P.concat([P[0]]), 2), c, { shadow: false, sk: .6,
            rim: [[-34, 13], [-18, 1], [18, 1], [34, 13]], rimCol: mixCol(p.rim, c, .5), rimW: 1.8 });
    inkLine([[-16, 16], [-14, 96]], 1.3, mixCol(c, p.front, .35), 'inkfine', .3);
    inkLine([[16, 16], [14, 96]], 1.3, mixCol(c, p.front, .35), 'inkfine', .3);
    pop();
  }
}

function dgWallArt(p, list) {
  list.forEach((a, i) => {
    const tilt = Math.sin(T * 1.2 + i * 2.1) * .012;
    push(); translate(a.x + a.w / 2, a.y); rotate(tilt); translate(-(a.x + a.w / 2), -a.y);
    dgPhoto(p, a.x, a.y, a.w, a.h, { empty: a.empty, tint: a.tint });
    pop();
  });
}

function dgChair(p, x, y, o = {}) {
  const c = mixCol(p.mid, p.front, .28);
  dgPaper(rectPts(x, y - 216, 20, 216), c, { shadow: false, sx: 4, sy: 8 });
  dgPaper(rectPts(x, y - 208, 118, 32), mixCol(c, p.light, .12), { shadow: false });
  dgPaper(rectPts(x - 8, y - 102, 142, 18), mixCol(c, p.light, .18),
          { rim: [[x - 8, y - 101], [x + 134, y - 101]], rimCol: mixCol(p.rim, c, .55), rimW: 1.8 });
  dgPaper(rectPts(x + 2, y - 84, 12, 84), c, { shadow: false, sx: 3, sy: 6 });
  dgPaper(rectPts(x + 114, y - 84, 12, 84), mixCol(c, '#000000', .12), { shadow: false, sx: 3, sy: 6 });
  if (o.back !== false) dgPaper(rectPts(x + 114, y - 216, 14, 216), mixCol(c, '#000000', .08), { shadow: false, sx: 4, sy: 8 });
}

function dgScarf(p, x, y, k = 1, wind = 0) {
  const c = mixCol(p.accent, p.mid, 1 - clamp(k));
  const P = [[x, y], [x + 26, y + 42], [x + 12 + wind * 10, y + 80], [x + 34 + wind * 18, y + 116]];
  dgPaper(ribbon(P, 22, 13), c, { shadow: false, rim: P, rimCol: mixCol(p.rim, c, .55), rimW: 1.6 });
}

function dgPlant(p, x, y, h = 96) {
  [0, 1, 2, 3].forEach(i => {
    const P = [[x, y], [x + (i - 1.5) * 14, y - h * .5], [x + (i - 1.5) * 26, y - h]];
    dgPaper(ribbon(P, 16, 4), mixCol(p.mid, p.light, .20), { shadow: false });
  });
  dgPaper(rrPts(x - 24, y - 26, 48, 26, 6, .6), mixCol(p.mid, p.front, .20), { shadow: false, rim: [[x - 24, y - 25], [x + 24, y - 25]], rimCol: mixCol(p.rim, p.mid, .35) });
}

function dgCrates(p, x, y, o = {}) {
  const n = o.n == null ? 2 : o.n;
  for (let i = 0; i < n; i++) {
    const w = 168 - i * 16, h = 96 - i * 6, bx = x + i * 10, by = y - i * 88;
    const c = mixCol(p.mid, p.front, .18 + i * .10);
    dgPaper(rectPts(bx, by - h, w, h), c, { rim: [[bx, by - h + 1], [bx + w, by - h + 1]], rimCol: mixCol(p.rim, c, .45), rimW: 2 });
    inkLine([[bx + 14, by - h * .62], [bx + w - 14, by - h * .60]], 1.4, mixCol(c, p.front, .35), 'inkfine', .2);
    inkLine([[bx + w * .5, by - h], [bx + w * .5, by]], 1.2, mixCol(c, p.front, .25), 'inkfine', .2);
  }
}

// ---------- z0.86 / 0.56 人 ----------
const DGUS = 1.26;   // 16:9 下人物统一放大
function dgHim(x, u, mood, o = {}) {
  const y = o.y == null ? GY + 4 : o.y;
  clawd(x, y, u * DGUS, { ...mood, boilKey: o.key || 'him', ...o, y: undefined });
}
function dgHer(p, x, u, fade = 0, o = {}) {
  const base = mixCol(p.accent, p.mid, clamp(fade));
  glow(x, GY - u * 4.4, u * 7.0, p.accent, (1 - fade) * .28);
  clawd(x, GY - 2, u * DGUS, {
    ...feel('neutral', T, { view: 'front' }),
    col: base, dk: mixCol(base, p.front, .5), lt: mixCol(base, '#ffffff', .35),
    noShadow: true, boilKey: 'her', ...o,
  });
}
// 跪姿：不带腿，加两片折起来的膝（纸的关节只能折，不能弯）
function dgKneel(x, y, u, dk) {
  dgPaper(rectPts(x - u * 3.0, y - u * .9, u * 2.2, u * 1.0, .5), dk, { shadow: false, sk: .4 });
  dgPaper(rectPts(x + u * 1.1, y - u * .9, u * 2.0, u * 1.0, .5), dk, { shadow: false, sk: .4 });
}

// 房间没了之后：不是纯黑，是"盒子里只剩几张暗纸"——仍有纸、仍有切边、仍有一点点背光。
function dgEmpty(p, o = {}) {
  const k = o.k == null ? 1 : o.k;
  paint(rectPts(BOX.x0 - 30, BOX.y0 - 30, BW + 60, BH + 60), { wash: mixCol(p.front, '#05040c', .45), ink: null });
  glow(o.gx == null ? 540 : o.gx, o.gy == null ? 900 : o.gy, 520, p.light, .10 * k);
  // 两张还留在盒子里的暗纸（它们的切边就是画面里唯一的层次）
  dgLayer(.14, () => {
    paint(rectPts(BOX.x0, BOX.y0 + 240, BW, 236), { wash: mixCol(p.mid, p.front, .70), ink: null });
    dgRim([[BOX.x0, BOX.y0 + 241], [BOX.x1, BOX.y0 + 241]], 1.8, mixCol(p.rim, p.mid, .16 * k));
  });
  dgLayer(.28, () => {
    paint(rectPts(BOX.x0, FTOP - 40, BW, 120), { wash: mixCol(p.mid, p.front, .58), ink: null });
    dgRim([[BOX.x0, FTOP - 39], [BOX.x1, FTOP - 39]], 1.6, mixCol(p.rim, p.mid, .20 * k));
  });
  // 地面：一张压在最下面的暗纸 + 一条受光的边
  dgLayer(.66, () => {
    paint(rectPts(BOX.x0 - 10, FTOP + 60, BW + 20, BOX.y1 - FTOP), { wash: mixCol(p.floor, '#05040c', .35), ink: null });
    dgRim([[BOX.x0, FTOP + 61], [BOX.x1, FTOP + 61]], 2, mixCol(p.rim, p.floor, .30 * k));
  });
}

// 墙上的影子：只是一个剪影，没有脸（影子不演戏，它只是跟着）
function dgSilhouette(x, y, u, col, op = 255, armA = .2, sy = 1.06) {
  push(); translate(x, y); scale(1, sy); translate(-x, -y);
  const body = rrPts(x - u * 5, y - u * 8, u * 10, u * 6, u * .9, .8);
  paint(body, { wash: col, washOp: op, ink: null });
  // 手臂
  [[-1, armA], [1, armA]].forEach(([d, a]) => {
    push(); translate(x + d * u * 4.6, y - u * 4.6); rotate(-a * d);
    paint(rectPts(d < 0 ? -u * 2.1 : 0, -u * .5, u * 2.1, u, .5), { wash: col, washOp: op, ink: null });
    pop();
  });
  // 四条短腿
  [-4, -2, 1, 3].forEach(lx => paint(rectPts(x + lx * u, y - u * 2.2, u, u * 2.2, .4), { wash: col, washOp: op, ink: null }));
  pop();
}

// ---------- 纸点 / 飞尘 ----------
function dgBit(x, y, s, col, rot = 0, o = {}) {
  push(); translate(x, y); rotate(rot);
  paint(rectPts(-s / 2, -s / 2, s, s * (o.tall == null ? .74 : o.tall), .4), { wash: col, washOp: o.op == null ? 235 : o.op, ink: null });
  pop();
}
function dgDust(p, n, seed, o = {}) {
  const k = o.k == null ? 1 : o.k;
  for (let i = 0; i < n; i++) {
    const sp = .5 + hash(i + seed) * 1.1;
    const x = BOX.x0 + 30 + frac(hash(i * 3.3 + seed) + T * .012 * sp) * (BW - 60);
    const y = BOX.y0 + 60 + frac(hash(i * 7.1 + seed) + T * .009 * sp) * (BH - 120);
    const s = 1.6 + hash(i * 5.7 + seed) * 3.4, a = (.16 + .5 * hash(i * 2.1 + seed)) * k;
    glow(x, y, s * 6, p.light, a * .45);
    paint(rectPts(x, y, s, s), { wash: mixCol(p.rim, '#ffffff', .5), washOp: 80 + 130 * a, ink: null });
  }
}

// ---------- 转场 ----------
function dgSweep(k, p, dir = 'up', col) {
  if (k <= 0 || k >= 1) return;
  const q = ease(k), c = col || mixCol(p.front, p.mid, .45);
  const yOff = (dir === 'up' ? -1 : 1) * (1 - q) * (H + 160);
  paint(rectPts(-80, yOff - 80, W + 160, H + 160), { wash: c, ink: null });
  dgRim([[-60, yOff + (dir === 'up' ? H + 76 : 4)], [W + 60, yOff + (dir === 'up' ? H + 76 : 4)]], 3, mixCol(p.rim, c, .45));
}
function dgVeil(k, col = '#050409') { if (k > .004) paint(rectPts(-80, -80, W + 160, H + 160), { wash: col, washOp: 255 * clamp(k), ink: null }); }
function dgIris(cx, cy, r, col) { iris(cx, cy, r, col); }
