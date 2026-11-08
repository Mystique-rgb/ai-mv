// ys_15s_letter.js —《未寄》15.4s 像素片（训练成果验证片 v2）
// ---------------------------------------------------------------
// 本片只干一件事：把 2026-11-04 ~ 11-05 训出来的东西全用一遍，看还站不站得住。
//   规则 17  开头 = 旧媒介特写（磁带机）+ 播放手势 + 片名 2.75s
//   规则 15  人物三式：背影为主 / 正脸 1 次（情绪爆点）
//   规则 16  运镜 = 长卷平移：下摇 48 格/秒、横移 80 格/秒、全整数格、禁缓动
//   规则 11  情绪爆点由「可读的状态翻转」承担 → 未寄 ×2190 → 已寄 ×1
//   规则 12  没发出去的话量化成数字，且这个数字会变
//   规则 13  时间跨度用数字戳（DAY 2190 / 2018→2024）
//   N8/N9/N6 文字在纸上（信/磁带/明信片）· 换场换明度签名 · 场景 ≥10 层
//   N24/N25  一画面一个动效焦点 · 全离散（跳格，无平滑插值）
//
// v2 修的五类硬伤（v1 实拍复盘）：
//   ① 天空/海面硬色带 → gradBand()：整行实色 + 5 行 2px 棋盘抖动接缝
//   ② 月亮/暖光晕「洋葱圈」 → dithGlow()：点阵环，不用同心实心椭圆
//   ③ 月光水面的硬边矩形 → 只在行内打 1px 短斑，宽度随深度张开，不叠矩形
//   ④ 沙滩平涂 → 4 个明度带 + 抖动接缝 + 沙粒 + 湿沙反光 + 浪花泡沫
//   ⑤ 手/邮筒/磁带/信封 → 按像素结构重画（描边、倒角、受光边各 1px）
// 色板：一律走 P.*（_pal.js），spec 里零内联色值。
(function () {
  var N = P.core.night, TE = P.ext.teal, SD = P.ext.sandDusk, WT = P.core.water,
      PP = P.core.paper, RD = P.core.red, WD = P.core.wood, INK = P.core.ink,
      ED = P.ext.edge, AMB = P.ext.amber, SK = P.ext.skin, SKF = P.ext.skinFigure,
      GR = P.ext.shopGreen, NC = P.ext.nightCool, SH = P.ext.shirt, DS = P.ext.duskSky,
      IE = P.ext.innerEdge, BR = P.ext.brickDeep, PR = P.ext.postRed, FB = P.ext.faceBg;

  function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function ell(c, cx, cy, rx, ry, col) {
    c.fillStyle = col;
    for (var dy = -ry; dy <= ry; dy++) {
      var w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
      if (w > 0) c.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
    }
  }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  // ── 抖动色带：y0..y1 实色 colA，最后 4 行 1px 棋盘混到 colB ──
  // 本片最要紧的一条底层手艺：像素画没有渐变，靠棋盘把两档色缝起来，
  // 既消硬边，又不像 alpha 渐变那样把色块边界糊掉（复用卡硬坑 6）。
  function gradBand(c, y0, y1, colA, colB, W, x0) {
    x0 = x0 || 0;
    var seam = 4;
    R(c, x0, y0, W, y1 - y0 - seam, colA);
    // 只画 B 色的那一半像素（1px 棋盘），比整格重绘省一半调用
    for (var y = y1 - seam; y < y1; y++) {
      for (var x = x0 + (((y + 1) & 1)); x < x0 + W; x += 2) R(c, x, y, 1, 1, colB);
    }
  }
  // ── 多级渐变：两档色之间插 6 档中间色，接缝只剩 1 行 ──
  // 为什么必须插中间色：320 基准 ×6 之后，4 行棋盘 = 24px 的「网纹」，
  // 观众第一眼看到的是纹理而不是天空。档差缩小后接缝就藏住了。
  function rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mix(a, b, t) {
    var A = rgb(a), B = rgb(b), o = '#';
    for (var i = 0; i < 3; i++) {
      var v = Math.round(A[i] + (B[i] - A[i]) * t);
      o += ('0' + v.toString(16)).slice(-2);
    }
    return o;
  }
  function gradSteps(c, y0, y1, colA, colB, W, steps, x0) {
    steps = steps || 10; x0 = x0 || 0;
    var h = (y1 - y0) / steps;
    for (var i = 0; i < steps; i++) {
      var ya = Math.round(y0 + i * h), yb = Math.round(y0 + (i + 1) * h);
      var cur = mix(colA, colB, i / steps), nxt = mix(colA, colB, (i + 1) / steps);
      R(c, x0, ya, W, Math.max(1, yb - ya - 1), cur);
      // 阶与阶之间只留 1 行「两档的中点色」——比棋盘更稳，6× 放大后看不出纹理
      R(c, x0, Math.max(ya, yb - 1), W, 1, mix(cur, nxt, .5));
    }
  }
  // ── 点阵光晕：一圈圈撒点，alpha 低到看不出环 ──
  function dithGlow(c, cx, cy, r0, r1, col, aMax, step) {
    step = step || 6;
    for (var rr = r0; rr <= r1; rr += 3) {
      var a = aMax * (1 - (rr - r0) / (r1 - r0 + 1));
      if (a <= .01) continue;
      for (var d = 0; d < 360; d += step) {
        if (((d / step) + rr) % 2) continue;
        var rad = d * Math.PI / 180;
        c.save(); c.globalAlpha = a;
        R(c, cx + Math.cos(rad) * rr, cy + Math.sin(rad) * rr * .92, 1, 1, col);
        c.restore();
      }
    }
  }
  // ── 云：三个半圆丘 + 一条平底（禁整条横杠，否则像飘带）──
  function lump(c, x, y, w, h, col) {
    for (var i = 0; i < h; i++) {
      var t = i / Math.max(1, h - 1);
      var inset = Math.round((1 - Math.sin(t * Math.PI / 2)) * (w * .26));
      R(c, x + inset, y + i, w - inset * 2, 1, col);
    }
  }
  function cloud(c, x, y, w, main, top, bot) {
    var h1 = Math.max(4, Math.round(w * .14));
    lump(c, x + w * .02, y + h1 * .55, w * .52, h1, main);
    lump(c, x + w * .26, y + h1 * .10, w * .46, h1 * 1.15, main);
    lump(c, x + w * .55, y + h1 * .45, w * .42, h1 * .95, main);
    R(c, x + 3, y + h1 * .55 + h1 - 1, w - 8, 2, main);
    R(c, x + 6, y + h1 * .10 + 1, w * .30, 1, top);
    R(c, x + w * .60, y + h1 * .45 + 1, w * .22, 1, top);
    R(c, x + 4, y + h1 * .55 + h1 + 1, w - 12, 1, bot);
  }

  // ══════════════════════════════════════════════════════
  // SH1 磁带机特写（0–1.85）
  //   0.00–0.90 机体全静止，只有两个转轮转（死静，规则 17）
  //   0.90–1.30 手从画外伸入 → 1.30 按下 PLAY
  // ══════════════════════════════════════════════════════
  function deckShot(c, lt) {
    var bx = 160, y0 = 32, W = 214, H = 110, x0 = bx - W / 2, deskY = 142;
    // —— 房间：墙（抖动带）+ 桌面 ——
    gradSteps(c, 0, 70, N[1], N[2], 320, 4);
    gradSteps(c, 70, 118, N[2], N[3], 320, 3);
    R(c, 0, 118, 320, deskY - 118, N[3]);
    for (var wx = 6; wx < 320; wx += 22) { c.save(); c.globalAlpha = .5; R(c, wx, 0, 1, deskY, N[1]); c.restore(); }
    R(c, 0, deskY, 320, 38, WD[0]);
    R(c, 0, deskY, 320, 2, WD[2]);
    R(c, 0, deskY + 2, 320, 1, WD[1]);
    for (var g = 0; g < 11; g++) R(c, (g * 43) % 300, deskY + 8 + g * 3, 34 + (g % 3) * 22, 1, WD[1]);
    R(c, 0, 176, 320, 4, INK[1]);
    dithGlow(c, 318, 4, 12, 84, AMB[2], .22, 11);

    // —— 桌面道具：磁带盒（左）+ 一叠信纸（右）——
    R(c, 18, deskY + 8, 54, 30, INK[2]);
    R(c, 18, deskY + 8, 54, 1, INK[3]);
    R(c, 22, deskY + 12, 46, 16, PP[1]);
    R(c, 22, deskY + 12, 46, 2, RD[0]);
    R(c, 26, deskY + 18, 24, 1, WD[1]);
    R(c, 26, deskY + 23, 34, 1, WD[1]);
    R(c, 18, deskY + 37, 54, 1, ED[1]);
    R(c, 262, deskY + 10, 44, 26, PP[2]);
    R(c, 264, deskY + 8, 44, 26, PP[1]);
    R(c, 266, deskY + 6, 42, 24, PP[3]);
    R(c, 266, deskY + 6, 42, 1, PP[5]);
    R(c, 272, deskY + 14, 28, 1, INK[0]);
    R(c, 272, deskY + 20, 20, 1, INK[0]);

    // —— 机身 ——
    c.save(); c.globalAlpha = .40; R(c, x0 + 4, y0 + H, W - 6, 4, ED[1]); c.restore();
    c.save(); c.globalAlpha = .20; R(c, x0 + 10, y0 + H + 4, W - 20, 2, ED[1]); c.restore();
    R(c, x0 - 2, y0 - 2, W + 4, H + 4, ED[0]);
    R(c, x0, y0, W, H, PP[0]);
    R(c, x0, y0, W, 1, PP[2]);
    R(c, x0, y0 + 1, W, 1, PP[1]);
    R(c, x0, y0 + H - 6, W, 6, WD[0]);
    R(c, x0, y0 + H - 6, W, 1, WD[1]);
    R(c, x0, y0, 1, H, WD[1]);
    R(c, x0 + W - 1, y0, 1, H, AMB[3]);                 // 右侧受光边 1px（不是 rim light）
    [[x0 + 3, y0 + 3], [x0 + W - 7, y0 + 3], [x0 + 3, y0 + H - 8], [x0 + W - 7, y0 + H - 8]].forEach(function (p) {
      R(c, p[0], p[1], 3, 3, WD[1]); R(c, p[0] + 1, p[1] + 1, 1, 1, ED[1]);
    });

    // —— 磁带仓 ——
    var bayY = y0 + 10, bayX = bx - 56;
    R(c, bayX - 2, bayY - 2, 116, 50, INK[1]);
    R(c, bayX, bayY, 112, 46, N[0]);
    R(c, bayX, bayY, 112, 1, INK[2]);
    R(c, bayX, bayY + 45, 112, 1, INK[1]);
    var ang = lt * 6.0;
    for (var k = 0; k < 2; k++) {
      var rx = bx - 28 + k * 56, ry = bayY + 22;
      ell(c, rx, ry, 13, 13, ED[1]);
      ell(c, rx, ry, 12, 12, WD[0]);
      ell(c, rx, ry, 10, 10, WD[1]);
      ell(c, rx, ry, 6, 6, INK[1]);
      ell(c, rx, ry, 4, 4, PP[1]);
      for (var s = 0; s < 6; s++) {
        var a2 = ang + k * .5 + s * Math.PI / 3;
        R(c, rx + Math.cos(a2) * 4.6 - .5, ry + Math.sin(a2) * 4.6 - .5, 1, 1, INK[2]);
      }
      R(c, rx - 1, ry - 1, 2, 2, ED[1]);
    }
    R(c, bx - 16, bayY + 24, 32, 1, WD[1]);
    R(c, bx - 16, bayY + 25, 32, 1, WD[0]);
    R(c, bx - 20, bayY + 34, 40, 6, INK[2]);
    R(c, bx - 16, bayY + 36, 9, 3, SH[0]);
    R(c, bx + 7, bayY + 36, 9, 3, SH[0]);
    c.save();                                            // 玻璃反光（裁在仓内）
    c.beginPath(); c.rect(bayX, bayY, 112, 46); c.clip();
    c.globalAlpha = .12;
    for (var i = 0; i < 44; i++) R(c, bayX + 6 + i, bayY + 2 + i, 1, 1, PP[5]);
    for (var j = 0; j < 30; j++) R(c, bayX + 46 + j, bayY + 2 + j, 1, 1, PP[5]);
    c.restore();

    // —— 计数器（四位数码管，恒 2190）——
    R(c, x0 + 8, y0 + 12, 34, 15, INK[1]);
    R(c, x0 + 9, y0 + 13, 32, 13, N[0]);
    var cn = '2190';
    for (var d = 0; d < 4; d++) segNum(c, x0 + 11 + d * 7, y0 + 15, +cn[d], AMB[3], 9);

    // —— VU 双表 ——
    var press = clamp((lt - 1.30) / .10, 0, 1);
    var lvl = press > 0 ? (.30 + .22 * Math.sin(lt * 5.1) + .12 * Math.sin(lt * 13.7)) : .04;
    for (var m = 0; m < 2; m++) {
      var mx = x0 + 168, my = y0 + 12 + m * 20;
      R(c, mx, my, 38, 16, INK[1]);
      R(c, mx + 1, my + 1, 36, 14, PP[4]);
      for (var t2 = 0; t2 < 6; t2++) R(c, mx + 6 + t2 * 5, my + 3, 1, 2, t2 > 3 ? RD[0] : INK[1]);
      var na = (-.72 + lvl * (1.5 + m * .1));
      for (var q = 2; q < 12; q++) R(c, mx + 19 + Math.sin(na) * q, my + 13 - Math.cos(na) * q * .9, 1, 1, RD[0]);
      R(c, mx + 18, my + 12, 3, 2, INK[1]);
    }
    ell(c, x0 + 170, y0 + 52, 2, 2, press > 0 ? GR[1] : INK[1]);
    if (press > 0) dithGlow(c, x0 + 170, y0 + 52, 3, 9, GR[1], .35, 12);

    // —— 中段细节（品牌牌 / 降噪拨杆 / 耳机孔）——
    R(c, x0, y0 + 63, W, 1, WD[1]);
    R(c, x0, y0 + 64, W, 1, PP[3]);
    R(c, x0 + 12, y0 + 67, 74, 9, PP[1]);
    R(c, x0 + 12, y0 + 67, 74, 1, PP[3]);
    R(c, x0 + 15, y0 + 70, 30, 1, WD[1]);
    R(c, x0 + 15, y0 + 72, 22, 1, WD[1]);
    R(c, x0 + 48, y0 + 70, 34, 1, WD[1]);
    R(c, x0 + 96, y0 + 68, 16, 6, INK[1]);
    R(c, x0 + 98, y0 + 70, 6, 3, PP[1]);
    ell(c, x0 + 128, y0 + 71, 3, 3, INK[1]);
    ell(c, x0 + 128, y0 + 71, 1, 1, ED[1]);

    // —— 按键排（PLAY = 第 3 个，按下下沉 2px）——
    for (var b = 0; b < 6; b++) {
      var bxp = x0 + 14 + b * 33, byp = y0 + 80 + (b === 2 ? Math.round(press * 2) : 0);
      R(c, bxp, byp + 2, 26, 10, ED[1]);
      R(c, bxp, byp, 26, 9, b === 0 ? RD[0] : (b === 2 ? PP[2] : PP[1]));
      R(c, bxp, byp, 26, 1, b === 2 ? PP[4] : PP[3]);
      R(c, bxp, byp + 8, 26, 1, b === 0 ? PR[0] : WD[1]);
      R(c, bxp + 1, byp + 1, 1, 7, b === 0 ? PR[1] : PP[3]);
      if (b === 0) R(c, bxp + 11, byp + 3, 4, 3, PP[4]);
      if (b === 1) { R(c, bxp + 9, byp + 3, 2, 3, INK[1]); R(c, bxp + 15, byp + 3, 2, 3, INK[1]); }
      if (b === 2) { R(c, bxp + 11, byp + 2, 3, 3, INK[1]); R(c, bxp + 12, byp + 5, 1, 1, INK[1]); }
      if (b === 3) { R(c, bxp + 9, byp + 3, 2, 3, INK[1]); R(c, bxp + 15, byp + 3, 2, 3, INK[1]); }
      if (b === 4) R(c, bxp + 11, byp + 3, 4, 4, INK[1]);
      if (b === 5) { R(c, bxp + 10, byp + 3, 1, 3, INK[1]); R(c, bxp + 15, byp + 3, 1, 3, INK[1]); }
    }
    R(c, x0 + 14, y0 + 94, 196, 1, WD[1]);
    R(c, x0 + 14, y0 + 95, 196, 1, PP[3]);

    // —— 手（0.90 起伸入，指尖落在 PLAY 键正中 x=146）——
    var hk = clamp((lt - .90) / .34, 0, 1);
    if (hk > 0) {
      var hy = 196 - Math.round(hk * 70);              // 126 = 终点（指尖 114）
      c.save(); c.globalAlpha = .22; R(c, 137, hy + 8, 28, 62, ED[1]); c.restore();
      // 1px 深色膨胀描边（与人物同一套规则）
      R(c, 142, hy - 13, 8, 16, ED[2]);
      R(c, 134, hy - 2, 30, 19, ED[2]);
      R(c, 139, hy + 16, 24, 200 - hy - 16, ED[2]);
      // 皮肤（拳 + 食指 + 小臂）
      R(c, 143, hy - 12, 6, 14, SK[2]);
      R(c, 136, hy, 26, 16, SK[2]);
      R(c, 140, hy + 16, 21, 200 - hy - 16, SK[1]);
      // 左侧暗边 / 右侧受光边
      R(c, 136, hy + 1, 2, 14, SK[0]);
      R(c, 161, hy, 1, 16, SK[3]);
      R(c, 143, hy - 12, 1, 14, SK[0]);
      R(c, 148, hy - 12, 1, 14, SK[3]);
      R(c, 140, hy + 16, 2, 200 - hy - 16, SK[0]);
      R(c, 159, hy + 16, 2, 200 - hy - 16, SK[3]);
      // 指节 + 指甲
      for (var kn = 0; kn < 3; kn++) R(c, 140 + kn * 8, hy, 5, 1, SK[3]);
      R(c, 144, hy - 11, 3, 2, SK[3]);
      // 拇指（左侧包过来，这一块是「像手」的关键）
      R(c, 131, hy + 3, 5, 10, SK[1]);
      R(c, 131, hy + 4, 1, 9, SK[0]);
      R(c, 131, hy + 3, 5, 1, SK[3]);
      R(c, 143, hy + 13, 7, 1, SK[0]);
    }

    c.save(); c.globalAlpha = .24; R(c, 0, 152, 320, 28, ED[1]); c.restore();
    c.save(); c.globalAlpha = .16; R(c, 0, 0, 320, 10, ED[1]); c.restore();
  }
  // 七段数码管
  var SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  function segNum(c, x, y, d, col, h) {
    h = h || 9; var w = 5, t = 1, S = SEG[d] || '', mid = y + ((h - 1) >> 1);
    function has(ch) { return S.indexOf(ch) >= 0; }
    if (has('a')) R(c, x + 1, y, w - 2, t, col);
    if (has('g')) R(c, x + 1, mid, w - 2, t, col);
    if (has('d')) R(c, x + 1, y + h - 1, w - 2, t, col);
    if (has('f')) R(c, x, y + 1, t, (mid - y) - 1, col);
    if (has('b')) R(c, x + w - 1, y + 1, t, (mid - y) - 1, col);
    if (has('e')) R(c, x, mid + 1, t, (y + h - 1 - mid) - 1, col);
    if (has('c')) R(c, x + w - 1, mid + 1, t, (y + h - 1 - mid) - 1, col);
  }

  // ══════════════════════════════════════════════════════
  // SH2–SH4 物件快切：信封 / 磁带 / 明信片（同一套色，切得再快也不碎）
  // ══════════════════════════════════════════════════════
  function cardBg(c) {
    gradSteps(c, 0, 58, INK[1], INK[2], 320, 3);
    R(c, 0, 58, 320, 46, INK[2]);
    R(c, 0, 104, 320, 76, WD[0]);
    R(c, 0, 104, 320, 2, WD[2]);
    for (var g = 0; g < 9; g++) R(c, (g * 47) % 300, 112 + g * 7, 50 + (g % 3) * 24, 1, WD[1]);
    c.save(); c.globalAlpha = .28; R(c, 0, 100, 320, 6, ED[1]); c.restore();
    dithGlow(c, 300, 8, 8, 80, AMB[2], .22, 9);
  }
  function shadow(c, x, y, w, h) { c.save(); c.globalAlpha = .40; R(c, x + 3, y + 4, w, h, ED[1]); c.restore(); }
  function paper(c, x, y, w, h, base, grain) {
    R(c, x, y, w, h, base);
    R(c, x, y, w, 1, PP[5]);
    R(c, x, y, 1, h, PP[2]);
    R(c, x + w - 1, y, 1, h, PP[1]);
    R(c, x, y + h - 1, w, 1, PP[1]);
    for (var i = 0; i < grain; i++) {
      R(c, x + 2 + (i * 37) % (w - 4), y + 2 + (i * 53) % (h - 4), 1, 1, i % 3 ? PP[2] : PP[1]);
    }
  }
  // 邮票：小红方 + 白浪 + 小船（v1 的月牙被读成字母 L，换成具象图案）
  function stamp(c, x, y, w, h) {
    R(c, x, y, w, h, RD[0]);
    R(c, x, y, w, 1, RD[1]);
    R(c, x, y + h - 1, w, 1, PR[0]);
    for (var i = 2; i < w; i += 3) { R(c, x + i, y - 1, 1, 1, PP[4]); R(c, x + i, y + h, 1, 1, PP[4]); }
    for (var j = 2; j < h; j += 3) { R(c, x - 1, y + j, 1, 1, PP[4]); R(c, x + w, y + j, 1, 1, PP[4]); }
    var sx = x + (w >> 1), sy = y + h - 6;
    R(c, sx - 2, sy, 5, 1, PP[4]);                        // 船身
    R(c, sx, sy - 4, 1, 4, PP[4]);                        // 桅
    R(c, sx + 1, sy - 4, 3, 4, PP[3]);                    // 帆
    R(c, x + 3, y + h - 4, w - 6, 1, PP[3]);              // 浪
    R(c, x + 5, y + h - 2, w - 10, 1, PP[2]);
    R(c, x + 2, y + 3, 3, 1, PP[3]);                      // 远岸
  }
  function scEnvelope(c) {
    cardBg(c);
    var x = 80, y = 34, w = 160, h = 106;
    shadow(c, x, y, w, h);
    paper(c, x, y, w, h, PP[3], 46);
    R(c, x + 6, y + 6, w - 12, 1, PP[2]);
    R(c, x + 6, y + h - 7, w - 12, 1, PP[2]);
    R(c, x + 6, y + 6, 1, h - 13, PP[2]);
    R(c, x + w - 7, y + 6, 1, h - 13, PP[2]);
    stamp(c, x + w - 42, y + 8, 24, 20);
    var pcx = x + 84, pcy = y + 26;
    for (var a = 0; a < 360; a += 3) {
      if ((a / 3) % 7 < 2) continue;
      var rad = a * Math.PI / 180;
      R(c, pcx + Math.cos(rad) * 17, pcy + Math.sin(rad) * 17, 1, 1, RD[0]);
    }
    R(c, pcx - 10, pcy + 13, 20, 1, RD[0]);
    R(c, pcx - 8, pcy + 15, 16, 1, RD[0]);
    R(c, x + 14, y + 62, 96, 1, INK[0]);
    R(c, x + 14, y + 76, 78, 1, INK[0]);
    R(c, x + 14, y + 90, 88, 1, INK[0]);
    c.save(); c.globalAlpha = .5; R(c, x + 9, y + 52, w - 18, 1, PP[1]); c.restore();
  }
  function scTape(c) {
    cardBg(c);
    var x = 84, y = 42, w = 152, h = 98;
    shadow(c, x, y, w, h);
    R(c, x, y, w, h, INK[2]);
    R(c, x, y, w, 1, INK[3]);
    R(c, x, y + 1, w, 1, SH[0]);
    R(c, x, y + h - 4, w, 4, ED[1]);
    [[x + 3, y + 2], [x + w - 6, y + 2], [x + 3, y + h - 6], [x + w - 6, y + h - 6]].forEach(function (p) {
      R(c, p[0], p[1], 3, 3, SH[0]); R(c, p[0] + 1, p[1] + 1, 1, 1, ED[1]);
    });
    R(c, x + 16, y + 9, w - 32, 40, PP[3]);
    R(c, x + 16, y + 9, w - 32, 3, RD[0]);
    R(c, x + 16, y + 9, w - 32, 1, RD[1]);
    R(c, x + 16, y + 46, w - 32, 3, RD[0]);
    R(c, x + 24, y + 16, 36, 1, INK[1]);
    R(c, x + 14, y + 54, w - 28, 26, ED[1]);
    for (var k = 0; k < 2; k++) {
      var rx = x + 40 + k * 70, ry = y + 67;
      ell(c, rx, ry, 10, 10, WD[0]);
      ell(c, rx, ry, 8, 8, WD[1]);
      ell(c, rx, ry, 5, 5, ED[1]);
      ell(c, rx, ry, 3, 3, PP[2]);
      R(c, rx - 1, ry - 1, 2, 2, ED[1]);
    }
    R(c, x + 50, y + 67, 40, 1, WD[0]);
    R(c, x + 50, y + 68, 40, 1, WD[1]);
    R(c, x + 28, y + h - 12, 6, 3, ED[1]);
    R(c, x + w - 34, y + h - 12, 6, 3, ED[1]);
  }
  function scPost(c) {
    cardBg(c);
    var x = 84, y = 40, w = 152, h = 100;
    shadow(c, x, y, w, h);
    paper(c, x, y, w, h, PP[4], 34);
    // 左半：一小块海边夜景（画中画）
    var ix = x + 8, iy = y + 8, iw = 64, ih = 84;
    c.save(); c.beginPath(); c.rect(ix, iy, iw, ih); c.clip();
    gradSteps(c, iy, iy + 30, N[0], N[2], iw, 4, ix);
    for (var s = 0; s < 16; s++) R(c, ix + (s * 19) % 62, iy + 3 + (s * 11) % 24, 1, 1, s % 4 ? WT[4] : PP[3]);
    dithGlow(c, ix + 44, iy + 14, 5, 13, PP[2], .20, 12);
    ell(c, ix + 44, iy + 14, 4, 4, PP[4]);
    gradSteps(c, iy + 30, iy + 42, WT[3], TE[2], iw, 3, ix);
    gradSteps(c, iy + 42, iy + 60, TE[2], TE[1], iw, 4, ix);
    for (var w2 = 0; w2 < 14; w2++) {
      var py = iy + 31 + (w2 * 3) % 28;
      var wd = 1 + (py - iy - 31) * .1;
      R(c, ix + 44 - wd + (w2 % 3), py, 1 + (w2 % 2), 1, PP[3]);
    }
    for (var wv = 0; wv < 3; wv++) {
      for (var q = 0; q < 9; q++) R(c, ix + q * 8 + (wv % 2) * 3, iy + 50 + wv * 4, 5, 1, WT[4]);
    }
    gradSteps(c, iy + 60, iy + 84, SD[1], SD[3], iw, 4, ix);
    R(c, ix, iy + 60, iw, 2, SD[1]);
    R(c, ix + 40, iy + 66, 5, 8, ED[1]);
    R(c, ix + 41, iy + 64, 3, 3, SKF[1]);
    R(c, ix + 40, iy + 74, 5, 2, SD[3]);
    c.restore();
    R(c, ix, iy, iw, 1, INK[0]); R(c, ix, iy, 1, ih, INK[0]);
    R(c, ix + iw - 1, iy, 1, ih, INK[0]); R(c, ix, iy + ih - 1, iw, 1, INK[0]);
    R(c, x + 86, y + 40, 54, 1, PP[2]);
    R(c, x + 86, y + 54, 42, 1, PP[2]);
    R(c, x + 86, y + 68, 54, 1, PP[2]);
    R(c, x + 78, y + 6, 1, h - 12, PP[2]);
    stamp(c, x + w - 30, y + 8, 20, 16);
  }
  // ══════════════════════════════════════════════════════
  // SH5 片名卡（2.75–4.35）
  // ══════════════════════════════════════════════════════
  function scTitle(c, lt) {
    gradSteps(c, 0, 100, N[0], N[1], 320, 4);
    gradSteps(c, 100, 180, N[1], N[2], 320, 4);
    c.save(); c.globalAlpha = .14;
    R(c, 10, 10, 300, 1, PP[2]); R(c, 10, 169, 300, 1, PP[2]);
    R(c, 10, 10, 1, 160, PP[2]); R(c, 309, 10, 1, 160, PP[2]);
    c.restore();
    for (var i = 0; i < 30; i++) {
      var d = FX.drift(i, lt, 3);
      c.save(); c.globalAlpha = d.a * .30;
      R(c, (i * 47) % 316, (i * 31 + d.dy * 2) % 176, 1, 1, PP[1]);
      c.restore();
    }
    c.save(); c.globalAlpha = .92;                        // 红印章（贴标题右上）
    R(c, 205, 64, 15, 15, RD[0]);
    R(c, 205, 64, 15, 1, RD[1]);
    R(c, 207, 67, 11, 1, PP[4]);
    R(c, 207, 70, 7, 1, PP[4]);
    R(c, 207, 73, 11, 1, PP[4]);
    R(c, 207, 76, 5, 1, PP[4]);
    c.restore();
  }

  // 芦苇丛：每丛 5-7 根，带一点弯
  function grassClump(c, x, base, n, hmax) {
    for (var i = 0; i < n; i++) {
      var h2 = 7 + (i * 5) % hmax, lean = (i - (n - 1) / 2) * .45;
      for (var j = 0; j < h2; j++) {
        var px = x + i * 2 + Math.round(lean * Math.pow(j / h2, 2) * 4);
        R(c, px, base - j, 1, 1, j > h2 - 3 ? IE[1] : IE[0]);
      }
    }
  }

  // ══════════════════════════════════════════════════════
  // 海边长卷（640×336）。窗口 320×180。
  //   下摇 wy 0→156（48 格/秒）｜横移 wx 140→250（80 格/秒）
  // 纵深 16 层：天/星/云/月/月光河道/海×4/波纹/浪线×3/湿沙/反光/泡沫/沙×4/沙粒/脚印/芦苇/礁石/栈桥/邮筒/人物/前景
  // ══════════════════════════════════════════════════════
  function sandWorld(c, wx, wy, t, dawn) {
    c.save(); c.translate(-Math.round(wx), -Math.round(wy));
    var SKY = dawn ? [DS[0], DS[1], DS[2], DS[2]] : [N[0], N[1], N[3], N[4]];
    var SEA = dawn ? [WT[2], WT[2], TE[2], TE[1]] : [WT[1], TE[1], TE[0], NC[1]];
    var LX = dawn ? 300 : 238;   // 光源在水面的投影 x

    // 1 天空：夜=整条夜空渐变；晨=只做地平线上方那段日出光带（镜头只看得到这一段）
    if (!dawn) {
      gradSteps(c, 0, 190, SKY[0], SKY[3], 640, 9);
    } else {
      R(c, 0, 0, 640, 148, DS[0]);
      gradSteps(c, 148, 190, DS[0], PP[3], 640, 8);
      dithGlow(c, LX, 190, 8, 52, PP[4], .28, 8);
      ell(c, LX, 192, 8, 8, PP[4]);
      ell(c, LX, 191, 6, 6, PP[5]);
    }
    // 2 星（夜，静态）
    if (!dawn) {
      for (var i = 0; i < 90; i++) {
        var sx = (i * 97 + 13) % 640, sy = (i * 53 + 7) % 165;
        R(c, sx, sy, 1, 1, i % 8 === 0 ? PP[3] : (i % 3 ? TE[3] : WT[4]));
      }
    }
    // 3 云（错位堆叠，越靠下越大）
    var cl = [[24, 46, 92], [148, 26, 64], [262, 58, 104], [404, 32, 78], [520, 66, 88],
              [92, 88, 116], [300, 100, 82], [452, 116, 122], [596, 92, 72]];
    for (var k = 0; k < cl.length; k++) {
      cloud(c, cl[k][0], cl[k][1], cl[k][2],
        dawn ? DS[1] : N[4], dawn ? DS[2] : INK[3], dawn ? DS[2] : INK[2]);
    }
    // 4 月 + 点阵光晕
    if (!dawn) {
      dithGlow(c, LX, 174, 14, 28, PP[2], .26, 8);
      ell(c, LX, 174, 10, 10, PP[4]);
      ell(c, LX - 1, 173, 8, 8, PP[5]);
      R(c, LX - 4, 171, 2, 2, PP[2]); R(c, LX + 3, 178, 2, 2, PP[2]); R(c, LX - 2, 179, 1, 1, PP[2]);
    }
    // 5 海面
    gradSteps(c, 190, 266, SEA[0], SEA[3], 640, 9);

    R(c, 0, 190, 640, 1, dawn ? PP[4] : WT[3]);
    c.save(); c.globalAlpha = .35; R(c, 0, 191, 640, 2, dawn ? WT[3] : TE[2]); c.restore();
    // 6 海面碎波纹
    for (var y = 193; y < 264; y += 4) {
      for (var x2 = 0; x2 < 640; x2 += 13) {
        var hsh = (x2 * 13 + y * 7) % 17;
        if (hsh < 2) R(c, x2 + (y % 7), y, 1 + (hsh % 2), 1, dawn ? WT[3] : TE[2]);
        else if (hsh === 2) R(c, x2 + (y % 5), y, 1, 1, dawn ? PP[4] : WT[3]);
      }
    }
    // 7 水下光路：碎钻（跳行 + 短斑 + 越近越宽），不能画成水柱也不能画成拉链
    (function () {
      var yEnd = dawn ? 258 : 264;
      for (var py = 192; py < yEnd; py++) {
        if ((py * 7) % 10 < 3) continue;                    // 跳掉三成行，别成梳子
        var dd = py - 192, wdt = 1 + dd * (dawn ? .30 : .34);
        var cnt = 1 + ((dd / 18) | 0);
        for (var q = 0; q < cnt; q++) {
          var off = ((q * 11 + py * 7) % Math.max(2, (wdt | 0)));
          var qx = LX - wdt / 2 + off;
          var ln = 1 + ((py + q) % 3);
          var core = Math.abs(qx - LX) < wdt * .30;
          R(c, qx, py, ln, 1, core ? (dawn ? PP[5] : PP[4]) : (dawn ? PP[3] : WT[3]));
        }
        if (dd % 6 === 0) R(c, LX - 1, py, 2, 1, PP[5]);
      }
    })();
    // 8 浪线（唯一动效焦点：三条恒速横移；断口 + 1px 起伏，不能画成马路虚线）
    var wl = [[250, 10], [256, 15], [262, 21]];
    for (var w3 = 0; w3 < wl.length; w3++) {
      var yy2 = wl[w3][0], sp = wl[w3][1], off = Math.round(t * sp);
      for (var m2 = 0; m2 < 64; m2++) {
        var lx = ((m2 * 11 + off + ((m2 * 37) % 17)) % 660) - 20, ln = 2 + (m2 % 4) * 2 + ((m2 * 7) % 3), jy = (m2 % 3 === 0) ? 1 : 0;
        R(c, lx, yy2 + jy, ln, 1, dawn ? PP[3] : WT[3]);
        R(c, lx + 1, yy2 + jy + 1, Math.max(1, ln - 2), 1, dawn ? TE[2] : TE[1]);
        if (m2 % 3 === 0) R(c, lx, yy2 + jy, 1, 1, WT[4]);
      }
    }
    // 9 湿沙 + 泡沫 + 月光在湿沙上的倒影
    gradSteps(c, 266, 280, dawn ? TE[2] : TE[1], dawn ? SD[2] : SD[3], 640, 3);
    R(c, 0, 266, 640, 2, dawn ? PP[4] : WT[3]);
    for (var w4 = 0; w4 < 46; w4++) {
      var rx2 = (w4 * 23) % 640;
      c.save(); c.globalAlpha = .55; R(c, rx2, 268 + (w4 % 9), 2 + (w4 % 4), 1, dawn ? WT[3] : NC[1]); c.restore();
      R(c, rx2 + 3, 269 + (w4 % 7), 1, 1, dawn ? PP[3] : TE[2]);
    }
    for (var f2 = 0; f2 < 90; f2++) R(c, (f2 * 61) % 640, 264 + (f2 % 3), 1, 1, f2 % 3 ? PP[2] : PP[3]);
    if (!dawn) {
      for (var mr2 = 0; mr2 < 22; mr2++) {                 // 倒影：垂直方向的短斑，不能过长
        var ry2 = 268 + (mr2 % 11);
        R(c, LX - 8 + (mr2 * 3) % 16, ry2, 1 + (mr2 % 3), 1, mr2 % 3 ? WT[3] : PP[3]);
      }
    }
    // 10 沙滩
    var S0 = dawn ? SD[1] : SD[3], S1 = dawn ? SD[0] : SD[2], S2 = dawn ? SD[0] : SD[1];
    gradSteps(c, 280, 336, S0, S2, 640, 7);
    R(c, 0, 280, 640, 1, S2);
    for (var s2 = 0; s2 < 260; s2++) {
      var gx2 = (s2 * 71) % 640, gy2 = 282 + (s2 * 37) % 54;
      R(c, gx2, gy2, 1, 1, s2 % 7 === 0 ? S2 : (s2 % 3 ? WD[4] : S1));
    }
    for (var pb = 0; pb < 10; pb++) {
      var pxb = (pb * 73 + 34) % 620, pyb = 296 + (pb * 41) % 34;
      R(c, pxb, pyb, 2 + (pb % 2), 1, dawn ? SD[2] : BR[1]);
      R(c, pxb, pyb + 1, 1, 1, dawn ? SD[3] : BR[0]);
    }
    // 脚印（走到海边）
    for (var fp = 0; fp < 7; fp++) {
      var fx4 = 216 + fp * 11 + (fp % 2) * 3, fy4 = 334 - fp * 5;
      c.save(); c.globalAlpha = .8; R(c, fx4, fy4, 4, 1, dawn ? SD[1] : SD[3]); c.restore();
      R(c, fx4 + 1, fy4 + 1, 3, 1, dawn ? SD[0] : SD[2]);
    }
    // 11 礁石
    R(c, 44, 302, 30, 14, BR[0]); R(c, 40, 310, 40, 6, BR[0]);
    R(c, 48, 298, 18, 6, BR[1]); R(c, 48, 298, 18, 1, dawn ? WT[3] : TE[2]);
    R(c, 56, 290, 10, 8, BR[1]); R(c, 56, 290, 10, 1, BR[2]);
    R(c, 40, 315, 42, 2, BR[3]);
    // 12 芦苇丛
    for (var cp = 0; cp < 3; cp++) grassClump(c, 100 + cp * 19, 318, 5 + cp, 13 + cp * 4);

    // 14 邮筒
    postbox(c, 430, 318, dawn);
    // 15 人物（背影）
    if (!dawn) {
      c.save(); c.globalAlpha = .50; ell(c, 300, 317, 12, 3, ED[1]); c.restore();
      FIG.back(c, { cx: 300, fy: 318 });
    }
    // 16 前景碎屑 + 压边
    for (var d2 = 0; d2 < 30; d2++) {
      R(c, (d2 * 83) % 640, 326 + (d2 * 17) % 10, 1, 1, d2 % 4 === 0 ? PP[0] : WD[4]);
    }
    c.save(); c.globalAlpha = .26; R(c, 0, 330, 640, 6, ED[1]); c.restore();
    c.restore();
  }
  // 红色邮筒（26×36，圆顶 + 投信口 + 白牌 + 腿）
  function postbox(c, x, base, dawn) {
    var top = base - 34;
    c.save(); c.globalAlpha = .45; R(c, x - 6, base + 1, 34, 3, ED[1]); c.restore();
    R(c, x + 3, base - 2, 4, 3, INK[1]); R(c, x + 19, base - 2, 4, 3, INK[1]);
    R(c, x + 2, top + 6, 24, 28, PR[1]);
    R(c, x + 2, top + 6, 1, 28, PR[2]);
    R(c, x + 25, top + 6, 1, 28, PR[0]);
    R(c, x, top + 4, 28, 4, PR[1]);
    R(c, x, top + 4, 28, 1, PR[2]);
    R(c, x + 3, top + 1, 22, 3, PR[1]);
    R(c, x + 5, top, 18, 1, PR[2]);
    R(c, x + 4, top + 12, 20, 3, ED[1]);
    R(c, x + 4, top + 15, 20, 1, PR[0]);
    if (dawn) {
      R(c, x + 8, top + 11, 10, 2, PP[4]);
      R(c, x + 10, top + 9, 8, 2, PP[3]);
      R(c, x + 6, top + 12, 4, 1, ED[1]);
    }
    R(c, x + 7, top + 20, 13, 8, PP[3]);
    R(c, x + 8, top + 22, 11, 1, INK[0]);
    R(c, x + 8, top + 24, 8, 1, INK[0]);
    R(c, x + 2, top + 32, 24, 1, PR[0]);
  }

  // ══════════════════════════════════════════════════════
  // SH9 正脸特写（12.40–13.95）
  // ══════════════════════════════════════════════════════
  function faceShot(c, lt) {
    gradSteps(c, 0, 70, FB[0], FB[1], 320, 5);
    gradSteps(c, 70, 118, FB[1], FB[2], 320, 4);
    gradSteps(c, 118, 180, FB[2], FB[3], 320, 4);
    dithGlow(c, 254, 92, 10, 54, P.ext.glowWarm[4], .20, 9);
    var dust = [[42, 30], [80, 48], [112, 26], [188, 38], [222, 64], [292, 34], [302, 76], [58, 86], [130, 74], [26, 60], [206, 22], [150, 12]];
    for (var i = 0; i < dust.length; i++) {
      c.save(); c.globalAlpha = .26 + (i % 3) * .10;
      R(c, dust[i][0], dust[i][1], 2, 2, i % 2 ? ED[0] : P.ext.glowWarm[3]);
      c.restore();
    }
    FIG.faceFront(c, { cx: 160, top: 14 });
    var ek = clamp((lt - .12) / .36, 0, 1);
    var ey = 200 - Math.round(ek * 82);
    if (ek > 0) {
      var LX = 34, LY = 50;
      c.save(); c.globalAlpha = .34; R(c, LX + 3, ey + 4, LY, 44, ED[1]); c.restore();
      R(c, LX, ey, LY, 40, PP[3]);
      R(c, LX, ey, LY, 1, PP[5]);
      R(c, LX, ey + 39, LY, 1, PP[1]);
      R(c, LX, ey, 1, 40, PP[1]);
      R(c, LX + LY - 1, ey, 1, 40, PP[1]);
      stamp(c, LX + 28, ey + 4, 15, 12);
      R(c, LX + 6, ey + 24, 24, 1, INK[0]);
      R(c, LX + 6, ey + 30, 17, 1, INK[0]);
      // 托着信的手（虎口 + 拇指）
      R(c, LX + 12, ey + 40, 26, 24, SK[1]);
      R(c, LX + 12, ey + 40, 26, 1, SK[3]);
      R(c, LX + 12, ey + 40, 1, 24, SK[0]);
      R(c, LX + 37, ey + 40, 1, 24, SK[3]);
      R(c, LX + 16, ey + 34, 6, 8, SK[2]);
      R(c, LX + 16, ey + 34, 1, 8, SK[0]);
      R(c, LX + 16, ey + 34, 6, 1, SK[3]);
    }
    if (lt >= .55 && lt < .72) {
      c.save(); c.globalAlpha = .5; R(c, 0, 0, 320, 180, PP[5]); c.restore();
    }
    c.save(); c.globalAlpha = .10; R(c, 0, 0, 320, 22, ED[1]); c.restore();
  }

  // ══════════════════════════════════════════════════════
  // 文字层（1920 层）：一个字都不写在像素层（12px@320 以下必糊）
  // ══════════════════════════════════════════════════════
  function TX(c, s, x, y, sz, col, o) {
    o = o || {};
    var k = c.canvas.width / 320;
    c.save();
    c.globalAlpha = o.a == null ? 1 : o.a;
    c.font = (sz * k) + 'px ' + (o.font || 'KT, XK, serif');
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    var ls = (o.ls || 0) * k, chars = String(s).split(''), cw = [], w = 0, i;
    for (i = 0; i < chars.length; i++) { cw[i] = c.measureText(chars[i]).width; w += cw[i] + ls; }
    w -= ls;
    var X = (o.align === 'center' ? x * k - w / 2 : (o.align === 'right' ? x * k - w : x * k));
    var Y = y * k, sw = (o.sw || 1.1) * k;
    for (i = 0; i < chars.length; i++) {
      if (o.stroke) {
        c.fillStyle = o.stroke;
        c.fillText(chars[i], X - sw, Y); c.fillText(chars[i], X + sw, Y);
        c.fillText(chars[i], X, Y - sw); c.fillText(chars[i], X, Y + sw);
        c.fillText(chars[i], X - sw, Y - sw); c.fillText(chars[i], X + sw, Y + sw);
        c.fillText(chars[i], X - sw, Y + sw); c.fillText(chars[i], X + sw, Y - sw);
      }
      c.fillStyle = col;
      c.fillText(chars[i], X, Y);
      X += cw[i] + ls;
    }
    c.restore();
  }
  function measW(c, s, sz, font) {
    var k = c.canvas.width / 320;
    c.save(); c.font = (sz * k) + 'px ' + (font || 'KT, XK, serif');
    var w = c.measureText(String(s)).width / k; c.restore(); return w;
  }
  function win(t, t0, t1, inD, outD) {
    if (t < t0 || t >= t1) return 0;
    return Math.min(clamp((t - t0) / (inD || .18), 0, 1), clamp((t1 - t) / (outD || .22), 0, 1));
  }
  var DAYS = 2190;

  window.SPEC = {
    fps: 24, duration: 15.4,
    grade: 'brightness(1.08) saturate(1.12) contrast(1.05)',
    fadeIn: .5, fadeOut: .55,
    shots: [
      { t0: 0, t1: 1.85, scene: 'deck', cam: false, vig: .34, draw(pc, lt) { deckShot(pc, lt); } },
      { t0: 1.85, t1: 2.15, scene: 'env', cam: false, vig: .30, in: { type: 'glitch', dur: .12 }, draw(pc) { scEnvelope(pc); } },
      { t0: 2.15, t1: 2.45, scene: 'tape', cam: false, vig: .30, in: { type: 'glitch', dur: .12 }, draw(pc) { scTape(pc); } },
      { t0: 2.45, t1: 2.75, scene: 'post', cam: false, vig: .30, in: { type: 'glitch', dur: .12 }, draw(pc) { scPost(pc); } },
      { t0: 2.75, t1: 4.35, scene: 'title', cam: false, vig: .46, in: { type: 'blk', dur: .18 }, draw(pc, lt) { scTitle(pc, lt); } },
      {
        t0: 4.35, t1: 7.60, scene: 'sea', cam: false, vig: .30, in: { type: 'fade', dur: .45 },
        draw(pc, lt) { sandWorld(pc, 140, CAM.grid(lt, CAM.DROP), lt + 4.35, false); },
      },
      { t0: 7.60, t1: 10.30, scene: 'sea', cam: false, vig: .30, draw(pc, lt) { sandWorld(pc, 140, 156, lt + 7.60, false); } },
      {
        t0: 10.30, t1: 12.40, scene: 'sea', cam: false, vig: .30,
        draw(pc, lt) { sandWorld(pc, 140 + Math.min(110, CAM.grid(lt, CAM.PAN)), 156, lt + 10.30, false); },
      },
      { t0: 12.40, t1: 13.95, scene: 'face', cam: false, vig: .48, in: { type: 'blk', dur: .18 }, draw(pc, lt) { faceShot(pc, lt); } },
      {
        t0: 13.95, t1: 15.40, scene: 'dawn', cam: false, vig: .26, in: { type: 'dither', dur: .30 },
        draw(pc, lt) { sandWorld(pc, 205, 156, lt + 13.95, true); },
      },
    ],
    subs: [],
    hud(c, W, H, t) {
      var a;
      // ── 物件卡上的字（全部在纸上）──
      a = win(t, 1.85, 2.15, .05, .04);
      if (a > 0) {
        TX(c, '收件人', 94, 92, 2.6, INK[1], { a });
        TX(c, '2018.06.12', 94, 134, 2.5, INK[1], { a, font: 'Consolas, monospace' });
        TX(c, '未 寄', 164, 66, 4.2, RD[0], { a, align: 'center', ls: .3, sw: 0, font: 'XK, KT, serif' });
      }
      a = win(t, 2.15, 2.45, .05, .04);
      if (a > 0) {
        TX(c, 'A 面 · 海', 100, 84, 3.4, INK[0], { a });
      }
      a = win(t, 2.45, 2.75, .05, .04);
      if (a > 0) {
        TX(c, 'POST CARD', 182, 50, 2.6, INK[1], { a, font: 'Consolas, monospace', ls: .3 });
        TX(c, '2018.06 北戴河', 184, 74, 3.0, INK[0], { a });
        TX(c, '这儿的海', 184, 90, 3.2, INK[0], { a });
        TX(c, '和那天一样', 184, 100, 2.6, INK[1], { a });
      }
      // ── 片名卡 ──
      a = win(t, 2.80, 4.35, .30, .18);
      if (a > 0) {
        TX(c, '未寄', 152, 101, 33, PP[5], { a, align: 'center', ls: 3.4, stroke: ED[0], sw: 2.0, font: 'XK, KT, serif' });
        TX(c, '第 2190 天 · 22:10', 152, 124, 4.2, PP[2], { a, align: 'center', ls: .8 });
        if (Math.floor(t * 3) % 2 === 0) TX(c, 'PRESS ▶ PLAY', 152, 156, 3.0, PP[1], { a, align: 'center', ls: .6, font: 'Consolas, monospace' });
      }
      // ── 拟声 ──
      a = win(t, 1.31, 1.85, .03, .12);
      if (a > 0) TX(c, '哒。', 198, 150, 7.2, PP[3], { a, stroke: ED[0], sw: .55 });
      // ── 夜间 HUD ──
      var hudA = clamp((t - 5.5) / .6, 0, 1) * clamp((13.95 - t) / .25, 0, 1);
      if (hudA > 0) {
        TX(c, 'DAY 2190', 10, 9, 4.2, PP[4], { a: hudA, font: 'Consolas, monospace', ls: .5 });
        TX(c, '2024.06.12 · 22:10', 10, 14.8, 2.9, PP[2], { a: hudA * .8, font: 'Consolas, monospace', ls: .2 });
        TX(c, '无风 · 海边', 46, 14.8, 2.9, PP[2], { a: hudA * .8 });
      }
      // ── 计数器（本片唯一爆点：未寄 ×2190 → 已寄 ×1）──
      var flip = t >= 12.95;
      var cA = clamp((t - 6.2) / .5, 0, 1) * clamp((13.95 - t) / .2, 0, 1);
      if (cA > 0) {
        var num = flip ? '×1' : ('×' + DAYS);
        var col = flip ? RD[1] : PP[2];
        var nsz = flip ? 6.0 : 4.0;
        var lsz = flip ? 4.6 : 3.4;
        var nw = measW(c, num, nsz, 'Consolas, monospace');
        var cy = flip ? 10.4 : 9.6;
        TX(c, num, 310, cy, nsz, col, { a: cA, align: 'right', font: 'Consolas, monospace', ls: .15, stroke: ED[0], sw: .5 });
        TX(c, flip ? '已寄' : '未寄', 310 - nw - 2, cy, lsz, col, { a: cA, align: 'right', stroke: ED[0], sw: .5 });
      }
      // ── 字幕（只在静止镜给整句）──
      var s1 = win(t, 7.95, 9.10, .25, .25);
      if (s1 > 0) subLine(c, '信写好了，还是没寄。', s1);
      var s2 = win(t, 9.30, 10.20, .25, .25);
      if (s2 > 0) subLine(c, '怕你回得比海更慢。', s2);
      var s4 = win(t, 14.15, 15.40, .30, .40);
      if (s4 > 0) {
        TX(c, '寄了。', 100, 152, 11, PP[5], { a: s4, align: 'center', ls: 2.2, stroke: INK[0], sw: .8 });
        TX(c, '♪', 52, 145, 4.2, INK[1], { a: s4 * .8 });
        TX(c, '2018 → 2024', 312, 174, 3.6, INK[1], { a: s4 * .9, align: 'right', font: 'Consolas, monospace', ls: .3 });
      }
    },
  };

  function subLine(c, s, a, y) {
    y = y == null ? 157 : y;
    var w = measW(c, s, 9.2, 'KT, XK, serif');
    var k = c.canvas.width / 320, top = y - 14;
    // 字幕压暗条：只压字宽 + 8px，1px 上下细线（不让白字直接压沙滩）
    var x0 = 160 - w / 2 - 8, x1 = 160 + w / 2 + 8;
    c.save();
    // ⚠ 1920 层的 R() 不会自动乘 6，必须自己 *k，否则会画到左上角（本次踩过）
    c.globalAlpha = a * .70; R(c, x0 * k, top * k, (x1 - x0) * k, 21 * k, ED[0]);
    R(c, x0 * k, top * k, (x1 - x0) * k, 1 * k, ED[1]);
    R(c, x0 * k, (top + 20) * k, (x1 - x0) * k, 1 * k, ED[1]);
    c.restore();
    TX(c, '♪', x0 - 6, y, 3.8, PP[3], { a: a * .75 });
    TX(c, s, 160, y, 9.2, PP[5], { a, align: 'center', ls: .9, stroke: ED[0], sw: .9 });
  }
})();
