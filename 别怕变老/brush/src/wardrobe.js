// wardrobe.js: Clawd 可复用人物资产库 —— 同一个骨架（动作/表情/转身/情绪全部复用 clawd.js），
// 身份靠三件"外挂"区分，就像《春娇与志明》那类方块小人的做法：
//   o.hair    发型名（见 HAIR）+ o.hairCol 发色
//   o.outfit  服装名（见 OUTFIT）+ o.cloth 主色 + o.cloth2 点缀色
//   o.face    面部特征，字符串或数组：glasses / freckles / stubble / mole / lash
//   o.deco    服装配件，字符串或数组：scarf / belt / heart / star
// 头发画在身体填充之上、身体墨线之下（衣摆/发梢不会被墨线切断）；帽子和以前一样盖在头发上。
// 便捷入口：person('小粉', x, y, u, { ...feel('happy', t) })，或 cast('小粉') 拿预设自己展开。

// ---------- 发型 ----------
// 都画在"身体本地坐标"里：脚底中心是原点，头顶 -8u，眼心 (±2.5u, -6u)，嘴 (0, -4.3u)。
// cap/刘海/鬓发跟随 hat 的视图变换（translate(V.hat·u) + scale(V.hw,1)），所以五视图都自动对位。
function hairCap(u, V, hc, sw, o = {}) {
  const P = pts => pts.map(([a, b]) => [a * u, b * u]);
  push(); translate(V.hat * u, 0); scale(V.hw, 1);   // 跟随视图：侧视/背面时头发压到头的宽度内
  if (o.slim) {   // 寸头：贴头皮的一层
    paint(P([[-4.9, -8.05], [-2, -8.35], [1.4, -8.3], [4.9, -7.95], [4.9, -7.35], [-4.9, -7.4]]), { wash: hc, washOp: 255, ink: PAL.ink, sw: sw * .6 });
    for (let i = 0; i < 9; i++) { const dx = -3.8 + i * .95; paint(ellPts(dx * u + jit(u * .1), -7.5 * u + jit(u * .08), u * .13, u * .1, 6), { wash: mixCol(hc, PAL.ink, .3), ink: null }); }
    pop(); return;
  }
  // 发帽：盖住头顶 -8.2u..-6.8u（眼睛在 -6u，刘海绝不能压过 -6.6u）
  paint(P([[-5, -8.1], [-2.4, -8.55], [.6, -8.5], [3.2, -8.35], [5, -7.95], [5, -6.8], [-5, -6.85]]), { wash: hc, washOp: 255, ink: PAL.ink, sw: sw * .8, curv: .35 });
  // 刘海波浪（贴着发帽下缘，避开眼睛）
  if (!o.noFringe) for (let i = 0; i < 5; i++) {
    const bx = -4 + i * 2, dip = (i % 2 ? -.22 : .06);
    paint(ellPts(bx * u, (-6.75 + dip) * u, u * .95, u * .3, 12), { wash: hc, washOp: 255, ink: PAL.ink, sw: sw * .4, curv: .4 });
  }
  // 一两根发丝高光
  inkLine([[-2.2 * u, -7.9 * u], [-1.5 * u, -7.2 * u]], sw * .4, mixCol(hc, '#FFFFFF', .45), 'inkfine', .3);
  pop();
}
function hairCurtain(u, V, side, hc, sw, y0, y1, w) {   // 鬓发/长发帘：贴 body 两侧垂下（跟随视图压缩）
  push(); translate(V.hat * u, 0); scale(V.hw, 1);
  if (V.hw < .8 && side < 0) { pop(); return; }   // 侧视：只画近侧那一绺，远侧的会横穿脸
  const x = side * (4.55 * u - w * .5 * u);
  paint(rectPts(x - w * .5 * u, y0 * u, w * u, (y1 - y0) * u, u * .4), { wash: hc, washOp: 255, ink: PAL.ink, sw: sw * .6 });
  pop();
}
const HAIR = {
  short:  (u, sw, V, o, hc) => { hairCap(u, V, hc, sw); },
  buzz:   (u, sw, V, o, hc) => { hairCap(u, V, hc, sw, { slim: true }); },
  bob:    (u, sw, V, o, hc) => {
    hairCap(u, V, hc, sw);
    for (const s of [-1, 1]) hairCurtain(u, V, s, hc, sw, -7.6, -4.3, 1.5);
  },
  long:   (u, sw, V, o, hc) => {
    hairCap(u, V, hc, sw);
    push(); translate(V.hat * u, 0); scale(V.hw, 1);
    for (const s of [-1, 1]) {
      if (V.hw < .8 && s < 0) continue;   // 侧视只留近侧发丝
      inkLine([[s * 4.5 * u, -7.3 * u], [s * 4.7 * u, -4.6 * u], [s * 4.45 * u, -2.6 * u]], sw * .4, mixCol(hc, PAL.ink, .3), 'inkfine', .4);
    }
    pop();
    for (const s of [-1, 1]) hairCurtain(u, V, s, hc, sw, -7.7, -2.1, 1.6);
  },
  twin:   (u, sw, V, o, hc) => {   // 双马尾：两束向上外甩、再垂下来，走路时自己会轻轻晃
    hairCap(u, V, hc, sw);
    push(); translate(V.hat * u, 0); scale(V.hw, 1);
    for (const s of [-1, 1]) {
      const tx = s * (4.5 + jit(.15)), swing = Math.sin(T * 2.1 + s) * .3;
      paint(ribbon([[tx * u, -7.4 * u], [(tx + s * 2) * u, (-9.6 + swing) * u], [(tx + s * 2.8) * u, (-6.6 + swing * 1.6) * u]], 1.15 * u, .55 * u), { wash: hc, washOp: 255, ink: PAL.ink, sw: sw * .7 });
      paint(ellPts(tx * u, -7.4 * u, u * .5, u * .5, 10), { wash: o.cloth2 || PAL.rose, ink: PAL.ink, sw: sw * .5 });   // 皮筋
    }
    pop();
  },
  pony:   (u, sw, V, o, hc) => {   // 马尾：从头顶后方甩起一束
    hairCap(u, V, hc, sw);
    const swing = Math.sin(T * 2.1) * .3;
    paint(ribbon([[4.7 * u, -7.6 * u], [(6.1 + swing) * u, (-9.1 + swing) * u], [(6.9 + swing) * u, -7.6 * u]], 1.1 * u, .5 * u), { wash: hc, washOp: 255, ink: PAL.ink, sw: sw * .7 });
    paint(ellPts(4.85 * u, -7.6 * u, u * .45, u * .45, 10), { wash: o.cloth2 || PAL.rose, ink: PAL.ink, sw: sw * .5 });
  },
  bun:    (u, sw, V, o, hc) => {   // 丸子头
    hairCap(u, V, hc, sw, { noFringe: true });
    push(); translate(V.hat * u, 0); scale(V.hw, 1);
    paint(rectPts(-4.9 * u, -8.05 * u, 9.8 * u, .8 * u, u * .3), { wash: hc, washOp: 255, ink: null });
    paint(ellPts(jit(u * .08), (-9.5 * u) + jit(u * .08), u * 1.75, u * 1.5, 16, u * .12), { wash: hc, washOp: 255, ink: PAL.ink, sw: sw * .8 });
    for (let i = 0; i < 3; i++) inkLine([[-.6 * u + i * .7 * u, -10.4 * u], [-.2 * u + i * .7 * u, -8.9 * u]], sw * .35, mixCol(hc, PAL.ink, .35), 'inkfine', .3);
    paint(ellPts(0, -8.4 * u, u * 1.7, u * .32, 12), { wash: o.cloth2 || PAL.rose, washOp: 200, ink: null });   // 发圈
    pop();
  },
  afro:   (u, sw, V, o, hc) => {   // 爆炸头：蓬松圆球包住头顶，下缘不碰眼睛（跟随视图压缩）
    push(); translate(V.hat * u, 0); scale(V.hw, 1);
    const c = [];
    for (let i = 0; i < 28; i++) {
      const a = i / 28 * TAU, bump = 1 + .16 * Math.sin(a * 6) + .08 * Math.sin(a * 11 + 1.3);
      c.push([Math.cos(a) * 5.3 * u * bump, -9.15 * u + Math.sin(a) * 2.5 * u * bump]);
    }
    paint(c, { wash: hc, washOp: 255, ink: PAL.ink, sw: sw * .8, curv: .4 });
    for (let i = 0; i < 4; i++) inkLine([[-2.6 * u + i * 1.7 * u, -10.2 * u], [-2 * u + i * 1.7 * u, -8.9 * u]], sw * .35, mixCol(hc, PAL.ink, .3), 'inkfine', .4);
    pop();
  },
  curly:  (u, sw, V, o, hc) => {   // 短卷：一排小卷云贴着头顶
    hairCap(u, V, hc, sw, { noFringe: true });
    push(); translate(V.hat * u, 0); scale(V.hw, 1);
    for (let i = 0; i < 6; i++) paint(ellPts((-3.9 + i * 1.56) * u, (-7.9 + (i % 2 ? .45 : 0)) * u, u * 1.05, u * .85, 12, u * .1), { wash: hc, washOp: 255, ink: PAL.ink, sw: sw * .5 });
    pop();
  },
  messy:  (u, sw, V, o, hc) => {   // 睡乱的头发：帽形 + 炸毛
    hairCap(u, V, hc, sw);
    push(); translate(V.hat * u, 0); scale(V.hw, 1);
    for (let i = 0; i < 5; i++) {
      const bx = -3.4 + i * 1.7, h = 1.2 + hash(i * 3) * .9;
      paint([[(bx - .45) * u, -8.2 * u], [bx * u + jit(u * .1), (-8.2 - h) * u], [(bx + .45) * u, -8.2 * u]], { wash: hc, washOp: 255, ink: PAL.ink, sw: sw * .5, curv: .3 });
    }
    pop();
  },
  buns:   (u, sw, V, o, hc) => {   // 双丸子头（头顶两只小髻，参考《春娇与志明》女主）
    hairCap(u, V, hc, sw);
    push(); translate(V.hat * u, 0); scale(V.hw, 1);
    for (const s of [-1, 1]) {
      paint(ellPts(s * 3.3 * u, (-9 * u + jit(u * .08)) * 1, u * 1.4, u * 1.3, 14, u * .12), { wash: hc, washOp: 255, ink: PAL.ink, sw: sw * .7 });
      inkLine([[s * 3.3 * u - .5 * u, (-9.6) * u], [s * 3.3 * u - .15 * u, (-8.4) * u]], sw * .35, mixCol(hc, '#FFFFFF', .4), 'inkfine', .3);
    }
    pop();
  },
};

// ---------- 服装 ----------
// 画在身体填充之上、身体墨线之下。L..R 取视图轮廓内缩 0.25u。
const OUTFIT = {
  tee: (u, sw, V, o, c, cd, cl) => {   // T恤：领口露出皮肤，下摆一条线
    const L = (V.L + .25) * u, w = (V.R - V.L - .5) * u;
    paint(rectPts(L, -7.9 * u, w, 5.5 * u, u * .35), { wash: c, washOp: 255, ink: null });
    paint([[-1.15 * u, -7.9 * u], [1.15 * u, -7.9 * u], [0, -6.85 * u]], { wash: cl, washOp: 255, ink: PAL.ink, sw: sw * .5, curv: .3 });
    inkLine([[L + .25 * u, -2.5 * u], [(V.L + .25 + (V.R - V.L - .5) * .5) * u, -2.42 * u], [(V.R - .25) * u, -2.5 * u]], sw * .5, mixCol(c, PAL.ink, .35), 'ink', .15);
  },
  stripes: (u, sw, V, o, c, cd, cl) => {   // 海魂衫
    OUTFIT.tee(u, sw, V, o, c, cd, cl);
    const L = (V.L + .25) * u, w = (V.R - V.L - .5) * u;
    for (let i = 0; i < 3; i++) paint(rectPts(L, (-7.15 + i * 1.35) * u, w, .62 * u, u * .1), { wash: cd, washOp: 220, ink: null });
  },
  dress: (u, sw, V, o, c, cd, cl) => {   // 连衣裙：上身 + 呼啦裙，腿从裙摆下伸出来
    const L = (V.L + .25) * u, w = (V.R - V.L - .5) * u;
    paint(rectPts(L, -7.9 * u, w, 3.4 * u, u * .35), { wash: c, washOp: 255, ink: null });
    const hem = [], hemY = -1.55 + hash(4) * .2;
    hem.push([(V.L - 1.3) * u, hemY * u]);
    for (let i = 0; i <= 6; i++) hem.push([lerp(V.L - 1.3, V.R + 1.3, i / 6) * u, (hemY - (i % 2 ? .38 : 0) + jit(.08)) * u]);
    hem.push([(V.R + 1.3) * u, -4.6 * u]); hem.push([(V.L - 1.3) * u, -4.6 * u]);
    paint(hem, { wash: c, washOp: 255, ink: PAL.ink, sw: sw * .7, curv: .4 });
    paint(ellPts(0, -7.35 * u, u * 1.15, u * .42, 12), { wash: cd, washOp: 160, ink: null });   // 领口带
    if (V.face) for (const s of [-1, 1]) paint(ellPts((s * .8) * u, -4.7 * u, u * .22, u * .22, 8), { wash: PAL.cream, ink: null });   // 扣子
  },
  overall: (u, sw, V, o, c, cd, cl) => {   // 背带裤：上身留皮肤，背带 + 口袋
    const L = (V.L + .25) * u, w = (V.R - V.L - .5) * u;
    paint(rectPts(L, -6.2 * u, w, 3.8 * u, u * .3), { wash: c, washOp: 255, ink: null });
    paint(rectPts(-2.3 * u, -6.9 * u, 4.6 * u, 1 * u, u * .2), { wash: c, washOp: 255, ink: PAL.ink, sw: sw * .6 });
    for (const s of [-1, 1]) {
      paint(rectPts((s * 2.5 - .5) * u, -8 * u, u, 1.9 * u, u * .2), { wash: c, washOp: 255, ink: PAL.ink, sw: sw * .6 });
      paint(ellPts(s * 2.5 * u, -6.75 * u, u * .26, u * .26, 10), { wash: o.cloth2 || PAL.ochre, ink: PAL.ink, sw: sw * .45 });
    }
    inkLine([[-1.2 * u, -5.6 * u], [1.2 * u, -5.6 * u]], sw * .5, mixCol(c, PAL.ink, .35), 'ink', .2);   // 口袋线
  },
  hoodie: (u, sw, V, o, c, cd, cl) => {   // 卫衣：堆堆帽 + 抽绳 + 袋鼠兜
    const L = (V.L + .25) * u, w = (V.R - V.L - .5) * u;
    paint(rectPts(L, -7.9 * u, w, 5.55 * u, u * .4), { wash: c, washOp: 255, ink: null });
    paint(ellPts(0, -7.45 * u, u * 4.1, u * 1.05, 20, u * .15), { wash: cd, washOp: 255, ink: PAL.ink, sw: sw * .6 });
    for (const s of [-1, 1]) inkLine([[s * .75 * u, -7.1 * u], [s * .9 * u, -5.7 * u]], sw * .55, PAL.cream, 'ink', .2);
    for (const s of [-1, 1]) paint(ellPts(s * .9 * u, -5.65 * u, u * .14, u * .14, 8), { wash: PAL.cream, ink: null });
    paint(rrPts(-1.9 * u, -4.1 * u, 3.8 * u, 1.5 * u, u * .3), { ink: mixCol(c, PAL.ink, .4), sw: sw * .5 });
  },
  apron: (u, sw, V, o, c, cd, cl) => {   // 围裙（里面是 T 恤色 c）
    const L = (V.L + .25) * u, w = (V.R - V.L - .5) * u;
    paint(rectPts(L, -7.9 * u, w, 5.5 * u, u * .35), { wash: c, washOp: 255, ink: null });
    paint([[0, -6.9 * u], [-1.15 * u, -7.9 * u], [1.15 * u, -7.9 * u]], { wash: c, washOp: 255, ink: PAL.ink, sw: sw * .5, curv: .3 });
    for (const s of [-1, 1]) inkLine([[s * 1.7 * u, -7.75 * u], [s * 2.4 * u, -6.4 * u]], sw * .6, mixCol(PAL.cream, PAL.ink, .12), 'ink', .2);
    paint([[-2.1 * u, -6.5 * u], [2.1 * u, -6.5 * u], [3.4 * u, -2.3 * u], [-3.4 * u, -2.3 * u]], { wash: PAL.cream, washOp: 255, ink: PAL.ink, sw: sw * .6, curv: .25 });
    inkLine([[-3.4 * u, -4.9 * u], [3.4 * u, -4.9 * u]], sw * .55, mixCol(PAL.cream, PAL.ink, .2), 'ink', 0);   // 腰线
    paint(rrPts(-1.1 * u, -4.2 * u, 2.2 * u, 1.1 * u, u * .2), { ink: mixCol(PAL.cream, PAL.ink, .3), sw: sw * .45 });   // 口袋
  },
  suit: (u, sw, V, o, c, cd, cl) => {   // 西装 + 领带
    const L = (V.L + .25) * u, w = (V.R - V.L - .5) * u;
    paint(rectPts(L, -7.9 * u, w, 5.55 * u, u * .3), { wash: c, washOp: 255, ink: null });
    paint([[0, -7.95 * u], [-1.7 * u, -7.95 * u], [-.4 * u, -5.1 * u], [.4 * u, -5.1 * u], [1.7 * u, -7.95 * u]], { wash: PAL.cream, washOp: 255, ink: PAL.ink, sw: sw * .55, curv: .25 });
    paint([[0, -7.8 * u], [.5 * u, -7.1 * u], [0, -5.35 * u], [-.5 * u, -7.1 * u]], { wash: o.cloth2 || '#C8324A', washOp: 255, ink: PAL.ink, sw: sw * .5, curv: .3 });
    for (const s of [-1, 1]) inkLine([[s * 1.75 * u, -7.95 * u], [s * 2.6 * u, -5.2 * u]], sw * .55, mixCol(c, PAL.ink, .25), 'ink', .2);   // 西装领
  },
  vest: (u, sw, V, o, c, cd, cl) => {   // 马甲：两侧露皮肤
    const L = (V.L + .25) * u, w = (V.R - V.L - .5) * u;
    for (const s of [-1, 1]) paint(rectPts(s < 0 ? L : 1.1 * u, -7.9 * u, (w - 2.6 * u) * .5 + .1, 5.5 * u, u * .3), { wash: c, washOp: 255, ink: PAL.ink, sw: sw * .6 });
    for (let i = 0; i < 3; i++) paint(ellPts(0, (-7.3 + i * 1.1) * u, u * .16, u * .16, 8), { wash: PAL.ochre, ink: null });
  },
};

// ---------- human 模式服装 ----------
// human 躯干很小：领口 -3.45、下摆 -2.05（下面直接是两条裤腿），服装收成"一块布 + 一两个细节"。
function hTorso(u, V, y0, y1, style) {
  const L = (V.L + .25) * u, w = (V.R - V.L - .5) * u;
  paint(rectPts(L, y0 * u, w, (y1 - y0) * u, u * .3), style);
}
function hCollar(u, sw, cd) {   // 领口：一小块深色三角
  paint([[-1.1 * u, -3.45 * u], [1.1 * u, -3.45 * u], [0, -2.92 * u]], { wash: cd, washOp: 255, ink: PAL.ink, sw: sw * .45, curv: .3 });
}
function HOUTFIT(u, sw, V, o, c, cd, cl) {
  switch (o.outfit) {
    case 'tee': hTorso(u, V, -3.45, -2.05, { wash: c, washOp: 255, ink: null }); hCollar(u, sw, cd); break;
    case 'stripes': {
      hTorso(u, V, -3.45, -2.05, { wash: c, washOp: 255, ink: null });
      const L = (V.L + .25) * u, w = (V.R - V.L - .5) * u;
      for (let i = 0; i < 2; i++) paint(rectPts(L, (-3.12 + i * .68) * u, w, .32 * u, u * .08), { wash: cd, washOp: 220, ink: null });
      hCollar(u, sw, cd);
      break;
    }
    case 'hoodie': {
      hTorso(u, V, -3.45, -2.05, { wash: c, washOp: 255, ink: null });
      paint(rectPts(-1.9 * u, -3.45 * u, 3.8 * u, .3 * u, u * .08), { wash: cd, washOp: 255, ink: PAL.ink, sw: sw * .45 });   // 细领条
      for (const s of [-1, 1]) inkLine([[s * .55 * u, -3.1 * u], [s * .7 * u, -2.62 * u]], sw * .45, PAL.cream, 'ink', .2);   // 抽绳
      paint(rrPts(-1.6 * u, -2.55 * u, 3.2 * u, .42 * u, u * .2), { ink: mixCol(c, PAL.ink, .4), sw: sw * .4 });   // 袋鼠兜
      break;
    }
    case 'dress': {   // 连衣裙：小上身 + 呼啦裙，盖住腿根
      hTorso(u, V, -3.45, -2.9, { wash: c, washOp: 255, ink: null });
      const L = (V.L - 1.1) * u, R = (V.R + 1.1) * u, hem = [];
      for (let i = 0; i <= 6; i++) hem.push([lerp(L, R, i / 6), ((i % 2 ? -1.12 : -1.34) + jit(.06)) * u]);
      paint([[L, -2.9 * u], ...hem, [R, -2.9 * u]], { wash: c, washOp: 255, ink: PAL.ink, sw: sw * .6, curv: .35 });
      paint(ellPts(0, -3.35 * u, u * 1.1, u * .28, 12), { wash: cd, washOp: 170, ink: null });
      break;
    }
    case 'overall': {   // 背带裤：整块躯干 + 胸兜（腿的颜色在预设里配 pants 同色）
      hTorso(u, V, -3.45, -2.05, { wash: c, washOp: 255, ink: PAL.ink, sw: sw * .55 });
      paint(rectPts(-1.5 * u, -3.3 * u, 3 * u, 1.25 * u, u * .2), { wash: c, washOp: 255, ink: PAL.ink, sw: sw * .5 });
      for (const s of [-1, 1]) paint(ellPts(s * 1.1 * u, -3.36 * u, u * .2, u * .2, 8), { wash: o.cloth2 || PAL.ochre, ink: PAL.ink, sw: sw * .4 });
      inkLine([[-.7 * u, -2.45 * u], [.7 * u, -2.45 * u]], sw * .4, mixCol(c, PAL.ink, .35), 'ink', .2);
      break;
    }
    case 'apron': {   // 围裙：里面是 T 恤色，前面一块奶油围裙
      hTorso(u, V, -3.45, -2.05, { wash: c, washOp: 255, ink: null });
      for (const s of [-1, 1]) inkLine([[s * 1.5 * u, -3.4 * u], [s * 2.1 * u, -2.95 * u]], sw * .5, mixCol(PAL.cream, PAL.ink, .12), 'ink', .2);
      paint([[-1.9 * u, -3.2 * u], [1.9 * u, -3.2 * u], [2.7 * u, -2.05 * u], [-2.7 * u, -2.05 * u]], { wash: PAL.cream, washOp: 255, ink: PAL.ink, sw: sw * .55, curv: .2 });
      inkLine([[-2.55 * u, -2.68 * u], [2.55 * u, -2.68 * u]], sw * .45, mixCol(PAL.cream, PAL.ink, .2), 'ink', 0);
      break;
    }
    case 'suit': {   // 西装：深躯干 + 衬衫三角 + 领带
      hTorso(u, V, -3.45, -2.05, { wash: c, washOp: 255, ink: null });
      paint([[0, -3.45 * u], [-.95 * u, -3.45 * u], [-.25 * u, -2.55 * u], [.25 * u, -2.55 * u], [.95 * u, -3.45 * u]], { wash: PAL.cream, washOp: 255, ink: PAL.ink, sw: sw * .45, curv: .25 });
      paint([[0, -3.4 * u], [.3 * u, -2.98 * u], [0, -2.52 * u], [-.3 * u, -2.98 * u]], { wash: o.cloth2 || '#C8324A', washOp: 255, ink: PAL.ink, sw: sw * .4, curv: .3 });
      break;
    }
    case 'vest': {   // 马甲：两块侧片，中间露"衬衫"
      const w = (V.R - V.L - .5) * u, pw = (w - 1.9 * u) * .5;
      for (const s of [-1, 1]) paint(rectPts(s < 0 ? (V.L + .25) * u : V.R * u - .25 * u - pw, -3.45 * u, pw, 1.4 * u, u * .25), { wash: c, washOp: 255, ink: PAL.ink, sw: sw * .5 });
      for (let i = 0; i < 2; i++) paint(ellPts(0, (-3.1 + i * .62) * u, u * .14, u * .14, 8), { wash: PAL.ochre, ink: null });
      break;
    }
  }
}

// ---------- 面部特征 ----------
// 画在眼睛/嘴巴之后（face 块内，已带 translate(cx·u) scale(fw) 变换），帽饰之前。
function faceDeco(u, sw, F, o) {
  const kinds = Array.isArray(o.face) ? o.face : [o.face];
  for (const f of kinds) {
    if (f === 'glasses') {
      if (F.sides.length > 1) {
        for (const s of F.sides) paint(ellPts(s * 2.5 * u, -6 * u, u * 1.5, u * 1.5, 20), { ink: PAL.ink, sw: sw * .7 });
        inkLine([[-1.15 * u, -6.35 * u], [1.15 * u, -6.35 * u]], sw * .7, PAL.ink, 'ink', .1);
        for (const s of F.sides) inkLine([[s * 3.95 * u, -6.3 * u], [s * 4.9 * u, -6.5 * u]], sw * .6, PAL.ink, 'ink', 0);
        for (const s of F.sides) {   // 镜片反光
          paint(ellPts(s * 2.5 * u - .5 * u, -6.7 * u, u * .4, u * .22, 10, 0, -.5), { wash: PAL.cream, washOp: 140, ink: null });
        }
      } else {   // 侧脸：小圆镜片贴在眼前，不伸出头外
        paint(ellPts(2.1 * u, -6 * u, u * .85, u * 1.05, 16), { ink: PAL.ink, sw: sw * .6 });
        inkLine([[2.95 * u, -6.3 * u], [-2.5 * u, -6.5 * u]], sw * .5, PAL.ink, 'ink', 0);   // 镜腿回到耳侧
      }
    } else if (f === 'freckles') {
      for (const s of F.sides) for (let i = 0; i < 3; i++)
        paint(ellPts((s * (3 + (i % 2) * .55)) * u, (-4.9 + Math.floor(i / 2) * .5) * u, u * .11, u * .11, 6), { wash: mixCol(PAL.clay, PAL.ink, .4), ink: null });
    } else if (f === 'stubble') {
      for (const s of F.sides) for (let i = 0; i < 6; i++)
        paint(ellPts((s * (2.2 + hash(i + s) * 1.8)) * u, (-3.1 - hash(i * 2 + s) * 1.4) * u, u * .12, u * .1, 6), { wash: PAL.ink, washOp: 120, ink: null });
    } else if (f === 'mole') {
      paint(ellPts(1.95 * u, -3.75 * u, u * .13, u * .13, 8), { wash: PAL.ink, ink: null });
    } else if (f === 'lash') {
      for (const s of F.sides) {
        inkLine([[s * 3.2 * u, -7 * u], [s * 3.8 * u, -7.5 * u]], sw * .5, PAL.ink, 'ink', 0);
        inkLine([[s * 3.45 * u, -6.7 * u], [s * 4.1 * u, -6.95 * u]], sw * .5, PAL.ink, 'ink', 0);
      }
    }
  }
}

// ---------- 配件 ----------
function decoDraw(u, sw, V, o, c, cd, cl) {
  const kinds = Array.isArray(o.deco) ? o.deco : [o.deco];
  for (const d of kinds) {
    if (d === 'scarf') {
      const sc = o.cloth2 || '#C8324A';
      if (o.human) {   // human：围在脖子上（领口 -3.45），垂一小段
        paint(rectPts((V.L + .1) * u, -3.72 * u, (V.R - V.L - .2) * u, .58 * u, u * .25), { wash: sc, washOp: 255, ink: PAL.ink, sw: sw * .55 });
        paint(ribbon([[1.4 * u, -3.2 * u], [1.9 * u, -2.6 * u], [1.7 * u, -2.15 * u]], .55 * u, .45 * u), { wash: sc, washOp: 255, ink: PAL.ink, sw: sw * .5 });
      } else {
        paint(rectPts((V.L + .1) * u, -7.75 * u, (V.R - V.L - .2) * u, 1.05 * u, u * .3), { wash: sc, washOp: 255, ink: PAL.ink, sw: sw * .6 });
        paint(ribbon([[1.6 * u, -6.9 * u], [2.3 * u, -5.6 * u], [2.1 * u, -4.3 * u]], .8 * u, .6 * u), { wash: sc, washOp: 255, ink: PAL.ink, sw: sw * .55 });
      }
    } else if (d === 'belt') {
      const by = o.human ? -2.52 : -3.15, bh = o.human ? .42 : .75;
      paint(rectPts((V.L + .25) * u, by * u, (V.R - V.L - .5) * u, bh * u, u * .15), { wash: o.cloth2 || '#5A4632', washOp: 255, ink: PAL.ink, sw: sw * .5 });
      paint(rectPts(-.4 * u, (by - .04) * u, .8 * u, (bh + .08) * u, u * .08), { wash: PAL.ochre, ink: PAL.ink, sw: sw * .4 });
    } else if (d === 'heart') {
      paint(heartPts(-2.9 * u, -4.8 * u, u * .85, 20), { wash: '#E2476E', ink: PAL.ink, sw: sw * .45 });
    } else if (d === 'star') {
      paint(starPts(2.8 * u, -4.6 * u, u * .8, .45, 5, -.4), { wash: PAL.ochre, fill: PAL.cream, fillOp: 60, ink: PAL.ink, sw: sw * .45 });
    }
  }
}

// ---------- 总入口（clawd.js 在身体填充之后调用）----------
function wardrobe(u, sw, V, o, col, dk, lt) {
  const c = o.cloth || '#5E81B4', cd = o.clothDk || mixCol(c, PAL.ink, .3), cl = mixCol(c, '#FFFFFF', .4);
  const hc = o.hairCol || '#4A3428';
  if (o.outfit && o.human) HOUTFIT(u, sw, V, o, c, cd, cl);
  else if (o.outfit && OUTFIT[o.outfit]) OUTFIT[o.outfit](u, sw, V, o, c, cd, cl);
  if (o.deco) decoDraw(u, sw, V, o, c, cd, cl);
  if (o.hair && HAIR[o.hair]) HAIR[o.hair](u, sw, V, o, hc);
}

// ---------- 角色预设库 ----------
// 加新角色：往这里添一行即可，动作/表情/转身自动继承。human: true = 参考图风格
// （肤色大方脸 + 头发盖顶 + 小躯干衣服 + 两条裤腿穿鞋）；pants/shoes 可选。
const CAST = {
  a:    { human: true, hair: 'short', hairCol: '#4A3428', outfit: 'hoodie',  cloth: '#7BA05B', pants: '#4A4550' },                     // 阿岩（绿卫衣，参考图左）
  b:    { human: true, hair: 'buns',  hairCol: '#5A3A26', outfit: 'hoodie',  cloth: '#E8A0B0', pants: '#565064' },                     // 小粉（双丸子头+粉卫衣，参考图中）
  lan:  { human: true, hair: 'bob',   hairCol: '#3D3A45', outfit: 'stripes', cloth: '#F4EEE2', cloth2: '#3D5588', pants: '#3D5588' },  // 阿蓝（海魂衫）
  zhou: { human: true, hair: 'buzz',  hairCol: '#565058', outfit: 'apron',   cloth: '#6E9F58', face: 'stubble', pants: '#3E3A46' },    // 老周（围裙大叔）
  xue:  { human: true, hair: 'bob',   hairCol: '#23262E', outfit: 'hoodie',  cloth: '#9AA2B8', face: 'glasses', pants: '#3E3A48' },     // 学霸（灰卫衣+圆眼镜，参考图右）
  yi:   { human: true, hair: 'bun',   hairCol: '#B9B3A8', outfit: 'apron',   cloth: '#C96F4A', face: 'glasses', pants: '#5A5462' },     // 陈阿姨
  dou:  { human: true, hair: 'afro',  hairCol: '#33241B', outfit: 'tee',     cloth: '#F0BE46', deco: 'star', pants: '#454052' },       // 小豆（爆炸头）
  fa:   { human: true, hair: 'long',  hairCol: '#2A2A30', outfit: 'dress',   cloth: '#E27A92', face: 'mole', pants: '#454052' },        // 长发姐
  mao:  { human: true, hair: 'messy', hairCol: '#4A3A28', outfit: 'overall', cloth: '#4C7A8C', pants: '#4C7A8C', hat: 'beanie' },      // 帽子哥（背带裤+毛线帽）
  hei:  { human: true, hair: 'buzz',  hairCol: '#1E1B22', outfit: 'hoodie',  cloth: '#2F3C7A', hat: 'headphones', deco: 'belt', pants: '#33303E' }, // 墨镜酷（耳机卫衣）
};

// 一句话出角色：所有 clawd 的能力原样可用 ——
//   person('小粉', x, y, 30, { ...feel('happy', t) })
//   person('a', x, y, 30, { ...move('run', t), view: 'side' })
//   person('学霸', x, y, 30, { ...emotions(t, [[0,'neutral'],[2,'surprised']]) })
// 中文名和字母 key 都认（NICK 做映射），两套写法等价。
const NICK = {
  '阿岩': 'a', '小粉': 'b', '阿蓝': 'lan', '老周': 'zhou', '学霸': 'xue',
  '陈阿姨': 'yi', '小豆': 'dou', '长发姐': 'fa', '帽子哥': 'mao', '墨镜酷': 'hei',
};
function person(name, x, y, u, o = {}) { clawd(x, y, u, { ...CAST[NICK[name] || name], ...o }); }
// 拿预设自己展开（要改个别字段时用）：clawd(x, y, u, { ...cast('小粉'), cloth: '#7B5CA8' })
function cast(name) { return { ...CAST[NICK[name] || name] }; }

// ---------- 默认男女主角（2026-11-08 用户裁定）----------
// 男主角 = 阿岩（绿卫衣短发）；女主角 = 小粉（粉卫衣双丸子）。
// 新片直接 hero()/heroine()，不用记 key；想换人改这两行即可。
const LEAD_M = 'a', LEAD_F = 'b';
function hero(x, y, u, o = {}) { clawd(x, y, u, { ...CAST[LEAD_M], ...o }); }      // 男主角
function heroine(x, y, u, o = {}) { clawd(x, y, u, { ...CAST[LEAD_F], ...o }); }   // 女主角
