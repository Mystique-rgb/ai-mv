// p_intro.js — P 前奏 0–22.30 · 从零造一个盒子（V00–V07）· 片头歌名题签
(() => {
  const WOOD = '#C9A36A', WOOD_DK = '#A87F49';
  // 片头歌名：0.45s 落下 → 8.7s 收。跨 V00 白纸 / V01 刻版 / V02 上墨 / V03 覆纸 四镜常驻，保证"开头有歌名"且够久。
  const titleK = t => t < .45 ? 0 : t < 1.05 ? easeOut((t - .45) / .6) : t < 9.35 ? 1 : Math.max(0, 1 - (t - 9.35) / .8);
  const title = t => hTitle(960, 168, '天龙八部之宿敌', 104, titleK(t), '许嵩 · 宿敌百景');

  // ---- V00 · 0–1.30 白纸 + 朱印 + 头三根刻线 + 片头歌名 ----
  function V00(t, lt) {
    paint(rectPts(-40, -40, W + 80, H + 80, 3), { wash: WASHI, washOp: 255, ink: null });
    goma(20, 'v00');
    // 印章砸下（0.22s）
    const sk = t < .22 ? 1.35 - .35 * easeOut(clamp((t - .1) / .12)) : 1;
    const shk = t > .22 && t < .5 ? shakeXY(t, 4) : [0, 0];
    push(); translate(shk[0], shk[1]); seal(300, 850, 92, '宿', sk, -.06); pop();
    // 逐拍长出的刻线（G3）
    boilSeed('v00lines');
    const lines = [[[300, 620], [520, 600]], [[560, 590], [760, 640]], [[800, 660], [1010, 620]]];
    lines.forEach((L, i) => {
      const t0 = .43 + i * .435, f = easeOut(clamp((t - t0) / .3));
      if (f > 0) inkLine([[L[0][0], L[0][1]], [lerp(L[0][0], L[1][0], f), lerp(L[0][1], L[1][1], f)]], 3, SUMI, 'ink', .2);
    });
    // 片头歌名（用户要求：开头有歌名）
    title(t);
    sheetFrame(1);
  }

  // 版上要刻的那幅画：远山三叠 / 五重塔 / 浪带 / 日轮。
  // rel(col, x0, x1)：只画 x 落在 [x0,x1] 的元素（刻刀前沿 / 墨辊前沿靠这个推进）。
  function rel(col, x0, x1, op = 255) {
    const dk = col === SUMI ? '#140E18' : mixCol(WOOD_DK, SUMI, .42);
    const P = (pts, o = {}) => {
      const cx = pts.reduce((a, q) => a + q[0], 0) / pts.length;
      if (cx < x0 || cx > x1) return;
      paint(pts, { wash: col, washOp: op, ink: dk, sw: 1.5, curv: .18, ...o });
    };
    // 远山三叠（不规则峰形 + 雪肩缺口，别画成三角锥）
    P([[110, 812], [200, 690], [286, 604], [352, 560], [402, 600], [452, 664], [520, 636], [588, 700], [660, 812]]);
    P([[470, 812], [556, 690], [640, 540], [700, 470], [742, 520], [776, 596], [826, 566], [890, 660], [960, 812]]);
    P([[880, 812], [970, 700], [1060, 574], [1120, 520], [1170, 592], [1216, 640], [1290, 700], [1360, 812]]);
    // 五重塔：塔身逐层收分 + 出檐上翘 + 相轮
    P([[1432, 818], [1564, 818], [1552, 764], [1444, 764]]);
    for (let i = 0; i < 5; i++) {
      const y = 764 - i * 52, w = 150 - i * 22;
      P([[1498 - w / 2 - 20, y - 4], [1498 - w / 2, y - 18], [1498, y - 30], [1498 + w / 2, y - 18], [1498 + w / 2 + 20, y - 4],
         [1498 + w / 2 - 6, y + 8], [1498 - w / 2 + 6, y + 8]]);
      P([[1498 - w / 2 + 14, y + 6], [1498 + w / 2 - 14, y + 6], [1498 + w / 2 - 20, y + 44], [1498 - w / 2 + 20, y + 44]]);
    }
    P([[1494, 520], [1502, 442], [1486, 442], [1482, 520]]);
    P([[1480, 442], [1508, 442], [1504, 424], [1484, 424]]);
    // 日轮
    if (1498 >= x0 && 1498 <= x1) paint(ellPts(1740, 512, 86, 86, 26), { wash: col, washOp: op, ink: dk, sw: 1.5 });
    // 水：平水是"刻掉"的地方（保持木色），只有浪爪是凸面
    if (830 >= x0 && 830 <= x1) inkLine([[110, 828], [1820, 828]], 2.2, dk, 'inkfine', .2);
    for (let i = 0; i < 3; i++) {
      const x = 340 + i * 560, y = 880;
      P([[x, y + 40], [x + 40, y - 6], [x + 96, y - 26], [x + 150, y - 8], [x + 176, y + 24],
         [x + 140, y + 12], [x + 96, y + 30], [x + 46, y + 46]]);
      P([[x + 60, y + 62], [x + 120, y + 58], [x + 150, y + 72], [x + 96, y + 88]]);
    }
  }

  // ---- V01 · 1.30–4.20 刻版：浮雕从左往刻刀方向长出来 ----
  function V01(t, lt) {
    paint(rectPts(-40, -40, W + 80, H + 80, 3), { wash: mixCol('#B98F58', SUMI, .1), washOp: 255, ink: null });
    boilSeed('wood1');
    for (let i = 0; i < 9; i++) { const y = 60 + i * 118 + hash(i * 7) * 30;
      inkLine([[-40, y], [500 + hash(i * 3) * 500, y + 24], [W + 40, y - 10]], 1.5, mixCol(WOOD_DK, SUMI, .3), 'ink', .4); }
    // 版心（浮雕区）略亮，给一个"版"的边界
    paint(rectPts(120, 400, 1680, 560, 3), { wash: mixCol('#B98F58', '#F0E2C0', .16), washOp: 255, ink: mixCol(SUMI, WOOD_DK, .5), sw: 1.8 });
    const frontX = lerp(150, 1760, ease(clamp((t - 1.3) / 2.85)));
    rel('#F0E2C0', -1e4, frontX, 255);
    // 刻刀前沿：一条亮棱 + 一条阴影（刀挖过的地方）
    if (frontX < 1755) {
      inkLine([[frontX - 8, 405], [frontX - 2, 620], [frontX - 10, 955]], 3.2, '#FBEFD2', 'ink', .2);
      inkLine([[frontX + 14, 432], [frontX + 20, 700], [frontX + 12, 950]], 4.5, mixCol(WOOD_DK, SUMI, .55), 'ink', .25);
    }
    // 每拍一刀：木屑卷 + 碎屑飞
    for (let i = 0; i < 8; i++) {
      const t0 = 1.35 + i * BEAT; if (t < t0) break;
      const bx = lerp(150, 1760, ease(clamp((i * BEAT) / 2.85)));
      const age = t - t0;
      if (age < .9) {
        const a8 = t8(age), k = a8 / .9;
        for (let c = 0; c < 3; c++) {   // 木屑碎片
          const px = bx + 20 + 60 * k + (hash(i * 7 + c) - .5) * 120 * k;
          const py = 620 - 120 * Math.sin(k * Math.PI) + 240 * k * k + (hash(i * 3 + c) - .5) * 60;
          push(); translate(px, py); rotate(a8 * 7 + c);
          paint(rectPts(-9, -5, 18, 10, 2), { wash: '#E8D4A8', washOp: 255, ink: SUMI, sw: .9 }); pop();
        }
        // 卷起的木屑（螺旋带）
        const spiral = []; for (let u2 = 0; u2 <= 10; u2++) { const ang = u2 / 10 * TAU * 1.6 - a8 * 5;
          spiral.push([bx + 40 + Math.cos(ang) * (14 + u2 * 3), 620 + Math.sin(ang) * (10 + u2 * 2) - 40 * k]); }
        inkLine(spiral, 3, '#F2E3BF', 'inkfine', .3);
      }
    }
    // 刻刀（随前沿走，每拍一顿）
    const bob = Math.abs(Math.sin((t - 1.3) / BEAT * Math.PI)) * 12;
    const kx = frontX + 30, ky = 600 - bob;
    paint([[kx - 20, ky - 40], [kx + 22, ky - 30], [kx + 12, ky + 96], [kx - 12, ky + 96]], { wash: '#DCD4C4', washOp: 255, ink: SUMI, sw: 1.6 });
    paint(rectPts(kx - 34, ky - 210, 74, 180, 8), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1.6 });
    paint(ellPts(kx + 4, ky - 226, 44, 26, 14), { wash: mixCol(OCHRE, '#F0E2C0', .35), washOp: 255, ink: SUMI, sw: 1.4 });
    title(t);
    sheetFrame(1);
  }

  // ---- V02 · 4.20–7.00 墨辊滚过：只给凸面吃墨 ----
  function V02(t, lt) {
    paint(rectPts(-40, -40, W + 80, H + 80, 3), { wash: mixCol('#B98F58', SUMI, .1), washOp: 255, ink: null });
    boilSeed('wood2');
    for (let i = 0; i < 9; i++) { const y = 60 + i * 118 + hash(i * 7) * 30;
      inkLine([[-40, y], [500 + hash(i * 3) * 500, y + 24], [W + 40, y - 10]], 1.5, mixCol(WOOD_DK, SUMI, .3), 'ink', .4); }
    paint(rectPts(120, 400, 1680, 560, 3), { wash: mixCol('#B98F58', '#F0E2C0', .16), washOp: 255, ink: mixCol(SUMI, WOOD_DK, .5), sw: 1.8 });
    const front = lerp(1820, 100, clamp((t - 4.2) / 2.5));   // 辊从右往左
    rel('#F0E2C0', -1e4, 1e4, 255);          // 未上墨的浮雕（全幅）
    rel(SUMI, front, 1e4, 255);              // 已滚过的地方：线条吃墨
    // 刚滚过的一条湿光
    if (front < 1810) {
      paint(rectPts(front, 404, 26, 552, 2), { wash: '#FFFFFF', washOp: 46, ink: null });
      inkLine([[front + 26, 410], [front + 26, 950]], 1.4, mixCol(SUMI, '#FFFFFF', .5), 'inkfine', .2);
    }
    // 墨辊
    const rx = front - 60, cry = 690;
    paint(rectPts(rx - 130, cry - 44, 210, 88, 6), { wash: mixCol(SUMI, '#5A5464', .35), washOp: 200, ink: null });
    paint(rectPts(rx - 118, cry - 118, 186, 236, 12), { wash: '#241C2E', washOp: 255, ink: SUMI, sw: 2.2 });
    paint(rectPts(rx - 92, cry - 96, 44, 192, 10), { wash: mixCol('#241C2E', '#A8A0C0', .55), washOp: 255, ink: null });
    paint(rectPts(rx + 18, cry - 96, 22, 192, 10), { wash: mixCol('#241C2E', '#A8A0C0', .28), washOp: 255, ink: null });
    for (let i = 0; i < 5; i++) inkLine([[rx - 100 + i * 42, cry - 108], [rx - 96 + i * 42, cry + 108]], 1.4, mixCol(SUMI, '#8A80A0', .5), 'inkfine', .1);
    paint(rectPts(rx - 30, cry - 300, 56, 200, 8), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1.6 });
    paint(ellPts(rx - 2, cry - 318, 34, 22, 12), { wash: mixCol(OCHRE, '#F0E2C0', .3), washOp: 255, ink: SUMI, sw: 1.3 });
    title(t);
    sheetFrame(1);
  }

  // ---- V03 · 7.00–9.60 纸垂下盖住版 ----
  function V03(t, lt) {
    // 版（在纸下透出一点墨）
    paint(rectPts(-40, -40, W + 80, H + 80, 3), { wash: WOOD, washOp: 255, ink: null });
    paint(rectPts(280, 560, 780, 90, 6), { wash: SUMI, washOp: 255, ink: null });
    // 纸从上垂下：3 段（t8），底缘 3 个控制点飘
    const k = t < 7.05 ? 0 : ease(clamp((t - 7.05) / 1.3));
    const yEdge = lerp(-100, 460, k);
    const pts = [];
    for (let i = 0; i <= 12; i++) { const x = i / 12 * (W + 120) - 60;
      pts.push([x, yEdge + Math.sin(i * 1.2 + t * 1.4) * 16 * (1 - k * .5) + (hash(i * 11) - .5) * 20]); }
    for (let i = 12; i >= 0; i--) pts.push([i / 12 * (W + 120) - 60, -160]);
    paint(pts, { wash: WASHI, washOp: 252, ink: null, curv: .4 });
    if (k >= .999) { paint(rectPts(-40, 430, W + 80, H, 3), { wash: WASHI, washOp: 255, ink: null }); goma(18, 'v03'); }
    // 纸面折痕（斜光下的 3 道压痕）+ 纸边投影，让白纸也是"有东西的纸"
    if (k > .5) {
      const kk = clamp((k - .5) / .5);
      for (let i = 0; i < 3; i++) {
        const x = 420 + i * 460;
        inkLine([[x - 8, -40], [x + 26, 300], [x - 4, 700], [x + 18, H + 40]], 2.4, mixCol(WASHI, '#B9A484', .55 * kk), 'inkfine', .25);
        inkLine([[x + 34, -40], [x + 62, 300], [x + 30, 700], [x + 52, H + 40]], 1.4, '#FFFFFF', 'inkfine', .2);
      }
      // 版边在纸下透出的一道墨影（下缘）
      paint(rectPts(120, 940, 1680, 26, 3), { wash: mixCol(SUMI, WASHI, .45), washOp: 120 * kk, ink: null });
      // 压纸的手（马连）从左下推过去：每拍移动
      const bx = lerp(300, 1560, clamp((t - 7.2) / 2.2)), by = 900 - Math.abs(Math.sin((t - 7) / BEAT * Math.PI)) * 20;
      paint(ellPts(bx, by, 96, 54, 22), { wash: mixCol(OCHRE, '#E8D9B8', .45), washOp: 255, ink: SUMI, sw: 1.8 });
      paint(rectPts(bx - 16, by - 150, 32, 110, 8), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1.6 });
      for (let i = 0; i < 5; i++) inkLine([[bx - 70 + i * 34, by - 30], [bx - 60 + i * 34, by + 26]], 1.2, mixCol(SUMI, OCHRE, .4), 'inkfine', .2);
    }
    title(t);
    sheetFrame(1);
  }

  // ---- V04 · 9.60–12.40 隔纸背显影：马连打圈，剪影浮出来 ----
  function V04(t, lt) {
    paint(rectPts(-40, -40, W + 80, H + 80, 3), { wash: '#EFE3C8', washOp: 255, ink: null });
    // 剪影随每拍加深（第 5 拍全显形）
    const bi = clamp(Math.floor((t - 9.6) / BEAT), 0, 7);
    const dark = lerp(.06, .8, clamp(bi / 5));
    boilSeed('ghost');
    const col = mixCol('#EFE3C8', SUMI, dark);
    paint(rectPts(760, 470, 400, 240, 8), { wash: col, washOp: 255, ink: null });     // 身体
    for (const lx of [-140, -60, 40, 120]) paint(rectPts(960 + lx, 700, 40, 90, 4), { wash: col, washOp: 255, ink: null });
    paint(rectPts(660, 560, 90, 40, 4), { wash: col, washOp: 255, ink: null });       // 左臂
    paint(rectPts(1170, 560, 90, 40, 4), { wash: col, washOp: 255, ink: null });
    if (bi >= 5) { paint(rectPts(850, 540, 26, 52, 3), { wash: '#EFE3C8', washOp: 255, ink: null });
                   paint(rectPts(1044, 540, 26, 52, 3), { wash: '#EFE3C8', washOp: 255, ink: null }); } // 眼缝挖白
    // 马连打圈：每拍一圈
    const biF = (t - 9.6) / BEAT, cx = 960 + Math.sin(biF * TAU) * 240, cy = 600 + Math.cos(biF * TAU) * 150;
    paint(ellPts(cx, cy, 130, 130, 24, 4), { wash: OCHRE, washOp: 230, ink: SUMI, sw: 1.8 });
    paint(ellPts(cx, cy, 70, 70, 18, 3), { wash: mixCol(OCHRE, '#E8D9B8', .5), washOp: 255, ink: SUMI, sw: 1.2 });
    paint(rectPts(cx - 22, cy - 250, 44, 130, 6), { wash: WOOD_DK, washOp: 255, ink: SUMI, sw: 1.4 });
    goma(14, 'v04');
    sheetFrame(1);
  }

  // ---- V05 · 12.40–15.20 揭纸：第一幅完整的画 ----
  function V05(t, lt) {
    ridgeScene(t, 1);
    // 纸角从右下掀起（3 段）
    const k = ease(clamp((t - 12.5) / 1.25));
    if (k < 1) {
      const e = lerp(0, W + H + 400, k);   // 掀起的对角线位置
      const pts = [];
      for (let i = 0; i <= 10; i++) { const f = i / 10; pts.push([clamp(e - f * H, 0, W), f * H]); }
      pts.push([W, H]); pts.push([W, 0]); pts.push([0, 0]);
      push(); translate(0, 0);
      paint(pts, { wash: '#E9DCC0', washOp: 255, ink: SUMI, sw: 1.2, curv: .3 });
      pop();
    }
    // 山脊雾横移
    mist(430, 700, 46, '#F3EBDC', 120 + Math.sin(t) * 30);
    sheetFrame(1);
  }
  // 山脊上的无色 Clawd（V05/V06 共用）
  function ridgeScene(t, colored) {
    paint(rectPts(-40, -40, W + 80, H + 80, 3), { wash: colored ? WASHI : '#EFE3C8', washOp: 255, ink: null });
    // 远山两层
    paint([[0, 700], [300, 520], [700, 660], [1100, 480], [1500, 640], [W, 560], [W, H], [0, H]],
      { wash: colored ? AI_LT : mixCol(AI_LT, WASHI, .55), washOp: 150, ink: null, curv: .3 });
    // 山脊（赭石在 V06 才落）
    paint([[0, 880], [400, 760], [860, 800], [1300, 720], [W, 780], [W, H], [0, H]],
      { wash: colored ? OCHRE : mixCol(OCHRE, WASHI, .6), washOp: 255, ink: SUMI, sw: 1.6, curv: .3 });
    const u = 28;
    kasa(880, 690 - 8 * u, u, { back: 1, dip: 0 });
    pc(880, 690, u, { view: 'q', dip: 0, col: colored ? CLAY : '#D8CCB4', dk: colored ? '#A84D33' : mixCol('#A84D33', WASHI, .55),
      eyes: 'normal', walk: null, boilKey: 'ridge', draw: belt });
  }

  // ---- V06 · 15.20–18.60 套色：三块色版依次落 ----
  function V06(t, lt) {
    const b1 = t > 15.4, b2 = t > 17.1, b3 = t > 18.0;
    paint(rectPts(-40, -40, W + 80, H + 80, 3), { wash: b1 ? WASHI : '#EFE3C8', washOp: 255, ink: null });
    // ① 靛青版：天空+远山（带落版滑移）
    if (b1) { const f = easeOut(clamp((t - 15.4) / .3)); push(); translate(lerp(8, 0, f), lerp(-6, 0, f));
      bokashi('v06sky', AI, 220, 60, 620);
      paint([[0, 700], [300, 520], [700, 660], [1100, 480], [1500, 640], [W, 560], [W, H], [0, H]],
        { wash: AI_LT, washOp: 170, ink: null, curv: .3 }); pop(); }
    // ② 赭石版：山脊
    if (b2) { const f = easeOut(clamp((t - 17.1) / .3)); push(); translate(lerp(-7, 0, f), lerp(5, 0, f));
      paint([[0, 880], [400, 760], [860, 800], [1300, 720], [W, 780], [W, H], [0, H]], { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1.6, curv: .3 }); pop(); }
    // ③ 陶土版落在方盒上
    const u = 28, bodyCol = b3 ? CLAY : '#D8CCB4', bodyDk = b3 ? '#A84D33' : '#B3A88F';
    kasa(880, 690 - 8 * u, u, { back: 1, dip: 0 });
    pc(880, 690, u, { view: 'front', dip: misreg(t), col: bodyCol, dk: bodyDk,
      eyes: 'normal', sq: .02 * Math.sin(t * 2.4), boilKey: 'v06c', draw: belt });
    // 落版"咔"震动
    const drops = [[15.7, b1], [17.4, b2], [18.2, b3]];
    for (const [tt, on] of drops) if (on && t - tt < .25) { const [sx, sy] = shakeXY(t - tt, 4); }
    goma(26, 'v06');
    sheetFrame(1);
  }

  // ---- V07 · 18.60–22.30 拉远上墙 + 走马灯预告 ----
  function V07(t, lt) {
    const z = lerp(1.0, .32, ease(clamp((t - 18.6) / 1.6)));
    camBegin(960, 540, z);
    // 墙
    paint(rectPts(-200, -200, W + 400 + 3000, H + 400 + 3000, 4), { wash: '#D9C9A4', washOp: 255, ink: null });
    boilSeed('wall');
    for (let i = 0; i < 8; i++) inkLine([[-200, 200 + i * 180], [W + 2800, 160 + i * 180 + hash(i * 9) * 40]], 1.4, mixCol('#B7A37C', SUMI, .3), 'ink', .4);
    // 主画（装裱+纸+内容，缩在世界坐标里）
    push(); translate(960, 430); scale(.8); translate(-960, -540);
    paint(rectPts(-60, -60, W + 120, H + 120, 2), { wash: MOUNT, washOp: 255, ink: null });
    paint(rectPts(28, 28, W - 56, H - 56, 3), { wash: WASHI, washOp: 255, ink: null });
    bokashi('v06sky', AI, 200, 60, 620);
    paint([[0, 880], [400, 760], [860, 800], [1300, 720], [W, 780], [W, H], [0, H]], { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1.6, curv: .3 });
    const u = 28;
    kasa(880, 690 - 8 * u, u, { back: 1, dip: 0 });
    pc(880, 690, u, { view: 'front', dip: .5, eyes: 'normal', boilKey: 'v07c', draw: belt });
    sheetFrame(.9);
    pop();
    // 朱印砸下：宿敌百景 · 其之一
    const sk = t > 20.0 ? (t < 20.22 ? 1.35 : 1) : 0;
    if (sk > 0) { seal(960, 430 + 330 * .8, 96, '宿', sk); }
    // 12 个空框（两排）——走马灯：闪的是缩微画面（2026-11-07 修：① 原来是纯色块 ② 原第二排在 zoom .32 时整排出画）
    // 框 420×400、两排 y=1500/1975、x 从 -1900 起步距 480：zoom .32 下 12 格全部入画
    const FS = 420, FW = 560, FH = 520;   // 框内缩微构图按 560×520 设计，包一层 .75 缩放
    const frames = [];
    for (let r = 0; r < 2; r++) for (let cI = 0; cI < 6; cI++) frames.push([-1900 + cI * 480, r ? 1975 : 1500]);
    // 12 幅缩微构图（局部坐标 0..560 × 0..520）：桥/浪/灯笼/月下门/城/星河/巨印/宿敌/聚盒/棺/雪/火
    const box = (x, y, w, h, col, sw = 1.6) => paint(rectPts(x, y, w, h, 6), { wash: col, washOp: 255, ink: SUMI, sw });
    const MINI = [
      () => {   // 桥上相对（V10）
        paint([[40, 400], [170, 290], [390, 290], [520, 400]], { wash: OCHRE, washOp: 255, ink: SUMI, sw: 2.4, curv: .25 });
        box(170, 210, 90, 80, CLAY); box(300, 210, 90, 80, FEN);
        box(233, 68, 94, 94, BENI, 1.2);
      },
      () => {   // 大浪（V19）
        paint([[30, 460], [130, 220], [240, 120], [320, 200], [270, 300], [420, 260], [530, 460]],
          { wash: AI, washOp: 235, ink: SUMI, sw: 2.6, curv: .5 });
        box(240, 380, 100, 70, OCHRE);
      },
      () => {   // 灯笼街（V22）
        for (const [lx, ly, s] of [[140, 200, 1], [330, 160, .8], [430, 260, .9]]) {
          paint(rrPts(lx - 60 * s, ly, 120 * s, 150 * s, 40 * s, 3), { wash: BENI, washOp: 255, ink: SUMI, sw: 2 });
          inkLine([[lx, ly - 60], [lx, ly]], 2, SUMI, 'ink', 0);
        }
      },
      () => {   // 月下门（V24）
        paint(ellPts(420, 130, 85, 85, 26), { wash: WASHI, washOp: 255, ink: null });
        box(90, 140, 260, 300, mixCol(BENI, OCHRE, .55), 2.4);
      },
      () => {   // 城大全景（V25）
        paint(rectPts(30, 380, 500, 80, 4), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 2 });
        for (let i = 0; i < 6; i++) { const hx = 50 + i * 82, w2 = 88;
          paint([[hx, 380], [hx + w2 / 2, 300], [hx + w2, 380]], { wash: mixCol(OCHRE, SUMI, .25), washOp: 255, ink: SUMI, sw: 1.6 }); }
      },
      () => {   // 星河竖滑（V26）
        for (let i = 0; i < 26; i++) paint(ellPts(60 + hash(i * 7) * 440, 60 + frac(hash(i * 3) + .3) * 400, 7, 7, 6), { wash: '#FBF6EA', washOp: 255, ink: mixCol(SUMI, WASHI, .5), sw: .6 });
        box(240, 200, 100, 130, CLAY);
      },
      () => {   // 巨印（V27）：红印 + 纸白阴刻块
        paint(rectPts(110, 90, 340, 340, 10), { wash: BENI, washOp: 248, ink: null });
        box(200, 180, 60, 80, WASHI, 1); box(300, 180, 60, 160, WASHI, 1);
      },
      () => {   // 宿敌（V28）：两个墨块 + 小朱印
        box(110, 170, 130, 180, SUMI, 1.4); box(290, 170, 130, 180, mixCol(SUMI, '#0E0C12', .5), 1.4);
        box(420, 400, 70, 70, BENI, 1.2);
      },
      () => {   // 线聚成盒（V29）
        paint(rectPts(150, 120, 260, 280, 8), { ink: SUMI, sw: 4 });
        box(195, 200, 30, 60, SUMI, 1); box(335, 200, 30, 60, SUMI, 1);
      },
      () => {   // 棺（V31 灵柩长埋）
        paint(rectPts(130, 200, 300, 160, 14), { wash: mixCol(OCHRE, SUMI, .35), washOp: 255, ink: SUMI, sw: 2.6 });
        paint(rectPts(130, 200, 60, 160, 10), { wash: mixCol(OCHRE, SUMI, .5), washOp: 255, ink: SUMI, sw: 2 });
      },
      () => {   // 孤岛雪（V33）
        paint(ellPts(280, 400, 190, 55, 20), { wash: mixCol(AI_LT, WASHI, .4), washOp: 230, ink: SUMI, sw: 1.8 });
        snow(t, 14, 'mini', -40, 600, -40, 420);
        box(240, 280, 80, 90, CLAY);
      },
      () => {   // 火（V37 火村）
        for (let i = 0; i < 5; i++) { const fx = 100 + i * 90, fy = 360 - hash(i * 3) * 60;
          paint([[fx, fy], [fx + 34, fy - 130 - hash(i * 7) * 50], [fx + 68, fy]], { wash: BENI, washOp: 235, ink: SUMI, sw: 2, curv: .4 }); }
      },
    ];
    frames.forEach(([fx, fy], i) => {
      const flashT = 20.5 + i * .15;
      const on = t >= flashT && t < flashT + .12;
      paint(rectPts(fx, fy, FS, FS * .95, 4), { wash: on ? '#EFE2C2' : '#DCCBA6', washOp: 255, ink: SUMI, sw: 3 });
      paint(rectPts(fx + 10, fy + 10, FS - 20, FS * .95 - 20, 3), { ink: on ? mixCol(SUMI, WASHI, .4) : '#B7A57F', sw: 1.4 });
      if (on) { push(); translate(fx + 10, fy + 10); scale(FS - 20 >= 0 ? (FS - 20) / FW : 1); MINI[i % MINI.length](); pop(); }   // 缩微画面闪现
    });
    // 走马灯最后一帧变黑（右下末格）
    if (t > 22.22) paint(rectPts(-1900 + 5 * 480, 1975, FS, FS * .95, 4), { wash: SUMI, washOp: 255, ink: null });
    camEnd();
  }
  // （2026-11-07：PREVIEW 纯色块已由上面的 MINI 12 幅缩微画面替代）

  shots([[0, V00], [1.30, V01], [4.20, V02], [7.00, V03], [9.60, V04], [12.40, V05], [15.20, V06], [18.60, V07]]);
})();
