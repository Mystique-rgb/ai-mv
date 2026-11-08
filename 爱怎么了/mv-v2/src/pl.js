// pl.js —— 纸雕灯影（paper-lantern）布景库
// 一个浅盒子，里面平行插着几张剪纸：天空 / 墙（带窗洞）/ 浮在中间的小物件 / 地面与家具 / 前景。
// 背光从盒子后面打进来（暖），每张纸只有：单色平涂 + 顶边暖光 + 底边暗带。层的明度阶梯就是景深。
// 画风硬约束（见 2026-11-06-分镜词 §4.3）：一切都是"棍子上的纸"——只平移、只绕支点转、只从 0 展开；
// 不许挤压拉伸（sq 只给人物当呼吸，不做形变）、不许 3D 推拉、不许鞭甩。
// 所有函数都是 t 的纯函数。

// 横屏 16:9（1920×1080）：箱体占满画面，窗在左三分之一，地面线压在下方
const CAV = { x0: 150, x1: 1770, y0: 70, y1: 980 };
const CAVW = CAV.x1 - CAV.x0, CAVH = CAV.y1 - CAV.y0, CX = 960, CY = 520;
const FL = 726;                        // 地面线（世界坐标）
const WIN = { x: 296, y: 116, w: 404, h: 540 };   // 窗洞

// ---------- 色阶（换段 = 换时空）。远层亮而透，近层暗而实——这个明度阶梯就是景深 ----------
const PSET = {
  night:  { sky:'#728ec8', far:'#2c3d68', mid:'#3f5a92', near:'#0f1930', front:'#05080f', light:'#ffb862', rim:'#ffd39a', accent:'#F79AC0' },
  gold:   { sky:'#ffe7bd', far:'#b8714a', mid:'#8a4630', near:'#33150a', front:'#160704', light:'#ffd080', rim:'#ffe7c0', accent:'#F79AC0' },
  violet: { sky:'#7a63a8', far:'#382750', mid:'#241736', near:'#110a1b', front:'#070410', light:'#9fb4d8', rim:'#d6e4ff', accent:'#d98aa8' }
};
function mixP(a, b, k) { const o = {}; for (const key in a) o[key] = mixCol(a[key], b[key], clamp(k)); return o; }
// 全片色阶弧线：夜（B1–B4）→ 金（B5–B8）→ 紫（B9–B17）→ 末尾回温
function plPal(t) {
  let p = mixP(PSET.night, PSET.gold, ease(seg(t, 12.55, 14.10)));
  p = mixP(p, PSET.violet, ease(seg(t, 24.20, 27.60)));
  p = mixP(p, PSET.night, .9 * ease(seg(t, 54.55, 55.45)));
  if (t > 55.3) p.light = mixCol(p.light, '#ffb862', ease(seg(t, 55.3, 55.6)));
  return p;
}

// ---------- 相机（只做平移与恒速推拉；竖屏里"横移"改成纵向 tilt 穿层） ----------
let PLV = { dx: 0, dy: 0, z: 1 };
function plCam(dx = 0, dy = 0, z = 1) { PLV = { dx, dy, z }; camBegin(CX + dx, CY + dy, z); }
function plCamEnd() { camEnd(); }
// 每张纸按深度做一点视差与缩放：近层动得多、大一点。z: 0 最远 → 1 最近
function plLayer(z, fn) {
  const k = z - .5;
  push();
  translate(CX, CY); scale(1 + k * .075); translate(-CX, -CY);
  translate(-PLV.dx * k * .8, -PLV.dy * k * .55);
  fn();
  pop();
}

// ---------- 纸 ----------
// 剪纸花边：一条打了半圆缺口的边（纸雕灯箱最像"纸"的一笔）
function scallopEdge(x0, x1, y, n = 9, r = 9) {
  const p = [[x0, y]];
  for (let i = 0; i < n; i++) {
    const xa = lerp(x0, x1, i / n), xb = lerp(x0, x1, (i + 1) / n), xm = (xa + xb) / 2;
    p.push([xa + (xb - xa) * .18, y + r * .30]);
    p.push([xm, y + r]);
    p.push([xb - (xb - xa) * .18, y + r * .30]);
  }
  p.push([x1, y]);
  return p;
}
// 一张平涂的纸：可选顶边暖光、底边暗带、切割抖动。
function plPaper(x, y, w, h, col, o = {}) {
  paint(rectPts(x, y, w, h, o.j || 0), { wash: col, ink: o.ink || null, sw: o.sw, curv: o.curv });
  if (o.rim) paint(rectPts(x - 1, y, w + 2, o.rimW || 3), { wash: o.rim, ink: null });
  if (o.shade) paint(rectPts(x - 1, y + h - (o.shadeW || 12), w + 2, o.shadeW || 12), { wash: o.shade, ink: null });
}
function plPoly(pts, col, o = {}) { paint(pts, { wash: col, ink: o.ink || null, sw: o.sw, curv: o.curv }); }
// 剪纸边：一条暖色细线（光从纸边漏出来）
function plEdge(pts, col, w = 1.6) { inkLine(pts, w, col, 'inkfine', .4); }
// 透光斑（背光打在纸上的云状亮斑，用加法光）
function plGlow(x, y, r, col, a = 1) { glow(x, y, r, col, a); }
// 纸纤维：一次 hatch 画满一整张纸的细毛（比几千根线便宜，读起来就是纸）
function plFibre(x, y, w, h, col, o = {}) {
  paint(rectPts(x, y, w, h), { hatch: { d: o.d || 9, a: o.a || .2, o: { rand: .55, gradient: .45 }, b: o.b || 'HB', c: col, w: o.w || .7 }, ink: null });
}

// ---------- 盒子外壳 ----------
function plFrame(p) {
  paint(rectPts(-240, -240, W + 480, H + 480), { wash: '#06050a', ink: null });
  // 内衬（黑卡纸），四边留出木框
  const b = 30;
  paint(rectPts(CAV.x0 - b, CAV.y0 - b, CAVW + 2 * b, CAVH + 2 * b), { wash: mixCol('#06050a', p.front, .55), ink: null });
  // 木框（只在退箱体与结尾出现，但常驻一点点，让人隐约知道"这是个物件"）
  const fb = 52;
  paint(rectPts(CAV.x0 - fb, CAV.y0 - fb, CAVW + 2 * fb, 18), { wash: '#171018', ink: null });
  paint(rectPts(CAV.x0 - fb, CAV.y1 + fb - 18, CAVW + 2 * fb, 18), { wash: '#171018', ink: null });
  paint(rectPts(CAV.x0 - fb, CAV.y0 - fb, 18, CAVH + 2 * fb), { wash: '#171018', ink: null });
  paint(rectPts(CAV.x1 + fb - 18, CAV.y0 - fb, 18, CAVH + 2 * fb), { wash: '#171018', ink: null });
}
// 内壁倒角：压在内容边上，制造"纸在盒子里"的深度（镜头推进箱体内部时不画）
function plBevel(p) {
  if (PLV.z > 1.30 || PLV.z < .95) return;
  const w = 2.5, c = mixCol(p.rim, p.front, .45);
  plEdge([[CAV.x0, CAV.y1], [CAV.x0, CAV.y0 + 30], [CAV.x0 + 40, CAV.y0]], c, w);
  plEdge([[CAV.x1, CAV.y1], [CAV.x1, CAV.y0 + 30], [CAV.x1 - 40, CAV.y0]], c, w);
}

// ---------- 天空（最远的一张纸，光就藏在它后面） ----------
function plStars(p, k = 1, seed = 0) {
  for (let i = 0; i < 46; i++) {
    const x = CAV.x0 + hash(i * 3.1 + seed) * CAVW, y = CAV.y0 + hash(i * 7.7 + seed + 4) * CAVH * .78;
    const s = 1.4 + hash(i * 5.3 + seed) * 2.4;
    const tw = .55 + .45 * Math.sin(T * (1.1 + hash(i) * 1.6) + i);
    paint(rectPts(x, y, s, s), { wash: mixCol(p.sky, '#ffffff', .55 + .35 * tw), washOp: 200 * k, ink: null });
  }
}
function plSky(p, st = {}) {
  const lk = st.lightK ?? 1;
  plLayer(0, () => {
    plPaper(CAV.x0, CAV.y0, CAVW, CAVH, p.sky);
    plStars(p, st.starK ?? 1);
    // 光从盒子背后涌进来：一大团暖光，越近窗越亮
    plGlow(WIN.x + WIN.w / 2, WIN.y + WIN.h * .55, 460, p.light, .40 * lk);
    plGlow(WIN.x + WIN.w / 2, WIN.y + WIN.h * .55, 220, p.light, .40 * lk);
    // 月亮：打穿的洞
    const mx = WIN.x + WIN.w * .66, my = WIN.y + WIN.h * .24, mr = 46;
    plGlow(mx, my, 150, p.light, .30 * lk);
    paint(ellPts(mx, my, mr, mr, 20), { wash: mixCol(p.light, '#ffffff', .6), ink: null });
    // 窗外的远山（比墙更暗，压住天，制造纵深）
    plPoly([[CAV.x0, WIN.y + WIN.h * .74], [WIN.x + 40, WIN.y + WIN.h * .58], [WIN.x + 170, WIN.y + WIN.h * .80],
            [WIN.x + 260, WIN.y + WIN.h * .66], [WIN.x + WIN.w, WIN.y + WIN.h * .78], [WIN.x + WIN.w, WIN.y + WIN.h],
            [CAV.x0, WIN.y + WIN.h]], mixCol(p.sky, p.front, .55));
    plEdge([[WIN.x + 40, WIN.y + WIN.h * .58], [WIN.x + 170, WIN.y + WIN.h * .80], [WIN.x + 260, WIN.y + WIN.h * .66]],
           mixCol(p.rim, p.sky, .5), 1.2);
  });
}

// ---------- 墙：一块挖了窗洞的纸（真的挖穿，天空从那洞里透出来） ----------
function plWall(p, st = {}) {
  const lk = st.lightK ?? 1;
  plLayer(.28, () => {
    const x0 = CAV.x0, x1 = CAV.x1, y0 = CAV.y0, y1 = CAV.y1;
    const w = WIN.x, ww = WIN.w, wy = WIN.y, wh = WIN.h;
    const shade = mixCol(p.far, p.front, .30);
    // 四块：上 / 下 / 左 / 右
    plPaper(x0, y0, CAVW, wy - y0, p.far, { rim: mixCol(p.rim, p.far, .30), rimW: 2 });
    plPaper(x0, wy + wh, CAVW, y1 - (wy + wh), p.far, { shade: shade, shadeW: 26 });
    plPaper(x0, wy, w - x0, wh, p.far);
    plPaper(w + ww, wy, x1 - (w + ww), wh, p.far);
    // 纸纤维（一整张纸的细毛）
    plFibre(x0, y0, CAVW, CAVH, mixCol(p.far, '#ffffff', .13), { a: 0, w: .35, d: 6 });
    // 墙上的木板拼缝（只在窗右边那一块，别把光洞割断）
    for (let i = 0; i < 3; i++)
      plEdge([[w + ww + 24, y0 + 300 + i * 300], [x1 - 10, y0 + 296 + i * 300]], mixCol(p.far, p.front, .34), 1);
    // 窗洞的切边：光从纸边漏出来
    plEdge([[w - 2, wy], [w - 2, wy + wh]], mixCol(p.rim, p.far, .35), 1.8);
    plEdge([[w + ww + 2, wy], [w + ww + 2, wy + wh]], mixCol(p.rim, p.far, .25), 1.8);
    plEdge([[w, wy - 2], [w + ww, wy - 2]], mixCol(p.rim, p.far, .35), 1.8);
    plEdge([[w, wy + wh + 2], [w + ww, wy + wh + 2]], mixCol(p.rim, p.far, .20), 1.8);
    plGlow(w + ww / 2, wy + wh * .5, 300, p.light, .26 * lk);
    plGlow(w + ww / 2, wy + wh * .5, 620, p.light, .16 * lk);
    plGlow(w + ww / 2, wy + wh * .55, 1000, p.light, .09 * lk);
    // 窗棂 + 窗台（窗棂是受光的一面，比墙亮一点）
    const mc = mixCol(p.far, p.light, .22);
    plPaper(w + ww / 2 - 4, wy, 9, wh, mc);
    plPaper(w, wy + wh * .46 - 4, ww, 9, mc);
    plPaper(w - 16, wy + wh, ww + 32, 16, mixCol(p.far, p.light, .16));
    plEdge([[w - 16, wy + wh + 1], [w + ww + 16, wy + wh + 1]], mixCol(p.rim, p.far, .30), 1.8);
    // 墙裙（踢脚线）：一条压在墙根上的纸，房间立刻有了高度
    const sy = FL - 148;
    plPaper(x0, sy, CAVW, 26, mixCol(p.far, p.front, .22));
    plEdge([[x0, sy + 1], [x1, sy + 1]], mixCol(p.rim, p.far, .42), 1.8);
    plPaper(x0, sy + 26, CAVW, 8, mixCol(p.far, p.front, .5));
    // 墙裙下沿的小三角花边
    for (let i = 0; i < 22; i++) {
      const bx = x0 + CAVW * (i + .5) / 22, bw = CAVW / 22 * .42;
      paint([[bx - bw, sy + 26], [bx + bw, sy + 26], [bx, sy + 40]], { wash: mixCol(p.far, p.front, .30), ink: null });
    }
    // 窗顶的纸蕾丝
    for (let i = 0; i < 5; i++) {
      const bx = w + ww * (i + .5) / 5;
      paint(ellPts(bx, wy + 4, ww / 10 * .92, 16, 12), { wash: p.far, ink: null });
      plEdge([[bx - ww / 10 * .9, wy + 4], [bx + ww / 10 * .9, wy + 4]], mixCol(p.rim, p.far, .35), 1.2);
    }
    // 墙板的竖缝
    for (let i = 1; i < 3; i++) plEdge([[x0 + CAVW * i / 3, y0 + 40], [x0 + CAVW * i / 3, sy]], mixCol(p.far, p.front, .40), 1);
  });
}

// ---------- 中间层：挂着的照片、搁板上的纸物件、吊灯、围巾 ----------
function plPhoto(x, y, w, h, p, o = {}) {
  const back = mixCol(o.col || p.mid, p.front, .25);
  paint(rectPts(x, y, w, h, .6), { wash: back, ink: mixCol(p.rim, back, .45), sw: .8 });
  // 照片里是两个小人：一块亮纸 + 两个小剪影
  if (o.two !== false) {
    paint(rectPts(x + w * .12, y + h * .16, w * .76, h * .62), { wash: mixCol(p.light, '#fff', .25), washOp: 235, ink: null });
    const f = h * .30, fy = y + h * .62;
    paint(rectPts(x + w * .26, fy - f * .55, f * .42, f * .55), { wash: mixCol(p.front, p.mid, .3), ink: null });
    paint(rectPts(x + w * .58, fy - f * .55, f * .42, f * .55), { wash: mixCol(p.accent, p.front, .55), ink: null });
  }
  if (o.crack) plEdge([[x + w * .5, y + h * .12], [x + w * .47, y + h * .45], [x + w * .53, y + h * .86]], mixCol(p.front, p.light, .2), 1.4);
}
function plMids(p, st = {}) {
  plLayer(.5, () => {
    // 墙上钉着的照片（一串）
    if (st.photos) {
      const n = st.photoN ?? 3;
      for (let i = 0; i < n; i++) {
        const px = CAV.x1 - 380 + (i % 2) * 104, py = CAV.y0 + 150 + Math.floor(i / 2) * 118 + (i % 2) * 34;
        const wobble = (st.photoSway ?? 0) * Math.sin(T * 2.4 + i * 1.7);
        push(); translate(px + 44, py); rotate(wobble * .06); translate(-(px + 44), -py);
        plEdge([[px + 44, CAV.y0 + 120], [px + 44, py]], mixCol(p.mid, p.front, .55), 1);
        plPhoto(px, py, 88, 100, p, { crack: st.photoCrack && i === 1 });
        pop();
      }
    }
    // 搁板
    if (st.shelf) {
      const sy = FL - 230;
      paint(rectPts(CAV.x1 - 420, sy, 320, 14), { wash: mixCol(p.mid, p.front, .3), ink: null });
      plEdge([[CAV.x1 - 420, sy + 1], [CAV.x1 - 100, sy + 1]], mixCol(p.rim, p.mid, .3), 1.6);
      paint(rectPts(CAV.x1 - 380, sy - 44, 34, 44), { wash: mixCol(p.mid, p.front, .15), ink: null });
      paint(rectPts(CAV.x1 - 320, sy - 32, 56, 32), { wash: mixCol(p.mid, p.front, .3), ink: null });
    }
    // 粉色围巾：搭在椅背/挂钩上（全片唯一饱和色）
    if (st.scarf) {
      const sx = st.scarfX ?? 470, sy = st.scarfY ?? 1010, k = st.scarfK ?? 1;
      const c = mixCol(p.accent, p.mid, 1 - k);
      plPoly(ribbon([[sx, sy], [sx + 26, sy + 40], [sx + 14, sy + 78], [sx + 34, sy + 112]], 20, 12), c, { ink: mixCol(c, p.front, .4) });
    }
    // 挂着的旧衣服（一片片薄纸，默认不挂：在暗背景上像穿帮）
    if (st.clothes) {
      for (let i = 0; i < 3; i++) {
        const cx = 596 + i * 42, cy = 700 + i * 18;
        plPoly([[cx, cy], [cx + 34, cy + 6], [cx + 30, cy + 96], [cx + 4, cy + 90]], mixCol(p.mid, p.front, .18 + i * .07), { ink: null });
      }
    }
  });
}

// ---------- 地面与家具 ----------
// 小纸灯：一根杆、一个纸罩、罩里一点亮。她是站在它前面的（镜 07/08）。
function plLamp(x, y, p, k = 1) {
  const c = mixCol(p.near, p.front, .35);
  const shade = mixCol(p.light, '#fff', .16);
  plGlow(x, y - 250, 260, p.light, .50 * k);
  plGlow(x, y - 250, 120, p.light, .40 * k);
  paint(rectPts(x - 4, y - 236, 8, 236), { wash: c, ink: null });
  paint(rectPts(x - 38, y - 10, 76, 12), { wash: c, ink: null });
  plPoly([[x - 62, y - 300], [x + 62, y - 300], [x + 36, y - 232], [x - 36, y - 232]], shade, { ink: mixCol(p.front, p.light, .3), sw: .8 });
  plPoly(ellPts(x, y - 268, 46, 24, 16), mixCol(p.light, '#fff', .62), { ink: null });
  plEdge([[x - 62, y - 300], [x + 62, y - 300]], mixCol(p.rim, p.light, .4), 1.6);
}

// 纸箱（大开的行李箱 / 关好的纸箱）
function plBox(x, y, w, h, p, o = {}) {
  const body = mixCol(p.near, p.front, .45);
  const inner = mixCol(p.front, '#000000', .35);
  // 立起来的箱盖（在他身后，像一扇小门）
  if (o.open !== false) {
    paint([[x - 8, y + 4], [x + w + 8, y + 4], [x + w - 6, y - h * .74], [x + 6, y - h * .78]], { wash: mixCol(body, p.light, .08), ink: null });
    plEdge([[x + 6, y - h * .78], [x + w - 6, y - h * .74]], mixCol(p.rim, body, .55), 1.8);
    plEdge([[x + 6, y - h * .78], [x - 8, y + 4]], mixCol(body, p.front, .3), 1);
  }
  // 开口：全画面最黑的一块
  paint(rectPts(x, y, w, h), { wash: inner, ink: null });
  // 内部后壁被窗光擦亮一点
  paint(rectPts(x + 10, y + 8, w - 20, h * .46), { wash: mixCol(inner, p.light, .16), washOp: 150, ink: null });
  // 里面已经装进去的衣物（薄纸片）
  for (let i = 0; i < 3; i++)
    paint(rectPts(x + 16 + i * 26, y + h * .34 + i * 14, w * .52, h * .34), { wash: mixCol(body, p.light, .18 + i * .05), washOp: 220, ink: null });
  // 前沿（受光的一条边）
  paint(rectPts(x - 14, y + h, w + 28, 18), { wash: mixCol(body, p.light, .26), ink: null });
  plEdge([[x - 14, y + h + 1], [x + w + 14, y + h + 1]], mixCol(p.rim, body, .55), 2);
  plEdge([[x, y], [x, y + h]], mixCol(body, p.front, .2), 1);
  plEdge([[x + w, y], [x + w, y + h]], mixCol(body, p.front, .3), 1);
}
function plChair(x, y, p, o = {}) {
  const c = mixCol(p.near, p.front, .3);
  paint(rectPts(x, y - 210, 20, 210), { wash: c, ink: null });               // 背柱
  paint(rectPts(x, y - 200, 120, 34), { wash: mixCol(c, p.light, .10), ink: null });   // 背板
  paint(rectPts(x - 6, y - 96, 138, 18), { wash: mixCol(c, p.light, .16), ink: null }); // 座面
  plEdge([[x - 6, y - 95], [x + 132, y - 95]], mixCol(p.rim, c, .55), 1.6);
  paint(rectPts(x + 2, y - 78, 12, 78), { wash: c, ink: null });             // 前腿
  paint(rectPts(x + 112, y - 78, 12, 78), { wash: mixCol(c, '#000', .12), ink: null });
  if (!o.noBack) paint(rectPts(x + 112, y - 210, 14, 210), { wash: mixCol(c, '#000', .1), ink: null });
}
function plFloor(p, st = {}) {
  plLayer(.74, () => {
    // 地板：一条带剪纸花边的纸
    const top = FL - 92;
    plPaper(CAV.x0, top, CAVW, CAV.y1 - top, p.near);
    // 花边缺口：打在纸边上，露出后面那层墙（这就是"剪纸"）
    for (let i = 0; i < 11; i++) {
      const x = CAV.x0 + CAVW * (i + .5) / 11;
      paint(ellPts(x, top, CAVW / 22 * .62, 11, 12), { wash: p.far, ink: null });
    }
    // 纸的厚度：一条暗带 + 一条暖线
    paint(rectPts(CAV.x0, top, CAVW, 9), { wash: mixCol(p.near, p.front, .45), ink: null });
    plEdge([[CAV.x0, top + 1], [CAV.x1, top + 1]], mixCol(p.rim, p.near, .68), 2.2);
    // 地板缝
    for (let i = 0; i < 3; i++) plEdge([[CAV.x0 + 60, FL + 34 + i * 52], [CAV.x1 - 60, FL + 30 + i * 52]], mixCol(p.near, p.front, .45), 1);
    // 纸纤维
    plFibre(CAV.x0, top, CAVW, CAV.y1 - top, mixCol(p.near, '#ffffff', .12), { a: 0, w: .35, d: 6 });
    // 窗光落在地上：三团加法的暖光（这是"灯箱"最要紧的证据）
    if (st.lightPool !== false) {
      const k = st.poolK ?? 1;
      plGlow(WIN.x + WIN.w * .5, top + 150, 420, p.light, .52 * k);
      plGlow(WIN.x + WIN.w * .95, CAV.y1 - 120, 300, p.light, .30 * k);
      plGlow(WIN.x + 40, CAV.y1 - 200, 190, p.light, .16 * k);
    }
    if (st.box) plBox(st.boxX ?? 636, st.boxY ?? FL - 118, st.boxW ?? 300, st.boxH ?? 118, p, { open: st.boxOpen, lidA: st.lidA });
    if (st.chair) plChair(st.chairX ?? 430, FL + 6, p, { noBack: st.chairNoBack });
    if (st.books) {
      for (let i = 0; i < 4; i++) paint(rectPts(CAV.x0 + 46, FL + 20 - i * 12, 150 - i * 10, 12), { wash: mixCol(p.near, i % 2 ? p.front : p.light, .2), ink: null });
    }
    if (st.lamp) plLamp(st.lampX ?? 700, FL + 6, p, st.lampK ?? 1);
    if (st.floorDust) {
      for (let i = 0; i < 20; i++) {
        const x = CAV.x0 + 40 + hash(i * 2.9) * (CAVW - 80), y = FL + 20 + hash(i * 5.1) * 200;
        paint(rectPts(x, y, 4 + hash(i) * 5, 3 + hash(i + 3) * 4), { wash: mixCol(p.near, p.light, .25), ink: null });
      }
    }
  });
}

// ---------- 前景（最暗的一层，压住画面四周） ----------
function plFront(p, st = {}) {
  if (PLV.z > 1.45) return;              // 推进箱体内部时，前景那层已经在镜头后面了
  plLayer(1, () => {
    const c = p.front;
    paint(rectPts(CAV.x0, CAV.y0, 60, CAVH), { wash: c, ink: null });
    paint(rectPts(CAV.x1 - 44, CAV.y0, 44, CAVH), { wash: c, ink: null });
    paint(rectPts(CAV.x0, CAV.y1 - 34, CAVW, 34), { wash: c, ink: null });
    if (st.frontBar) paint(rectPts(CAV.x0, st.frontBarY ?? 900, CAVW, st.frontBarH ?? 26), { wash: c, ink: null });
  });
}

// ---------- 人 ----------
// 他：原色（不加 tint），永远站在"房间层"（最前的人）。mood 用 feel/emotions 传入。
function plHim(t, x, u, mood, o = {}) {
  plGlow(x, FL - u * 4.4, u * 8.5, PAL.clayLt, .07);       // 纸边漏出来的一点暖
  clawd(x, FL, u, { ...mood, emote: null, boilKey: 'him', swMul: .82, ...o });
}
// 她：粉色。fade 0→1 = tintK 1→0，最后与纸同色，只剩轮廓（她是光，不是人）。
function plHer(t, x, u, p, fade = 0, o = {}) {
  const base = mixCol(p.accent, p.mid, clamp(fade));
  plGlow(x, FL - u * 4.2, u * 7.5, p.accent, (1 - fade) * .35);
  clawd(x, FL - 8, u, {
    ...feel('neutral', t, { view: 'front' }),
    col: base, dk: mixCol(base, p.front, .5), lt: mixCol(base, '#ffffff', .3),
    noShadow: true, boilKey: 'her', ...o
  });
}

// ---------- 小纸片（照片碎点 / 雨） ----------
function plPaperBit(x, y, s, col, rot = 0) {
  push(); translate(x, y); rotate(rot);
  paint(rectPts(-s / 2, -s / 2, s, s * .72, .4), { wash: col, ink: null });
  pop();
}
