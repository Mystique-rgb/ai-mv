// _fig.js — 人物复用模块（2026-11-05 定稿，用户裁定"人物就用这个"）
// ---------------------------------------------------------------
// 依赖：specs/_pal.js（全局 P），必须先于本文件加载。
// 注入：stage.html 在 spec 前依次 document.write _pal.js → _fig.js；
//       daily.mjs / sheet.mjs 预读时拼在 spec 前面。spec 里直接写 FIG.faceFront(...)。
//
// 三种形态（都是 320×180 基准，6× 放大到 1920×1080）：
//   FIG.faceFront(c, {cx, top})   正脸半身像（特写）—— 头宽 88，占屏 27%，只用于情绪顶点
//   FIG.back(c, {cx, fy})         纯背影小人物 —— 身高 62，占屏 34%，叙事主力
//   FIG.turn(c, {cx, fy})         3/4 回眸（身体背对、头转右）—— 只画一只眼 + 一个点
//
// 共用规约（三条，别改）：
//   ① 1px 深色硬描边（膨胀轮廓），**没有 rim light**。金边是小人物特效，不是人物本体。
//   ② 五官极简：竖长眼 = 深色竖块 + 3×3 白高光；**无眉、无鼻**。张嘴只给一条横线 + 两嘴角点。
//   ③ 轮廓必须"逐段同形"：头用 ellipse，绝不用一个大矩形 → 否则头永远是"方发罩"。
var FIG = (function () {
  var E_FACE = P.ext.edge[1];   // 脸缘描边
  var E_HAIR = P.ext.edge[0];   // 发缘描边（更黑）
  var SK = P.ext.skin, HAIR = P.ext.hair, SH = P.ext.shirt, CO = P.ext.coatM;

  function ell(c, cx, cy, rx, ry, col) {
    c.fillStyle = col;
    for (var dy = -ry; dy <= ry; dy++) {
      var w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
      if (w > 0) c.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
    }
  }
  function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }

  // ══════════════════════════════════════════════════════
  // 背景（正脸特写专用）：4 带天色 + 暖光晕 + 浮尘 + 暗角
  //   ⚠ 光晕用"黄金角散点"而不是同心圆 —— 同心圆会读成靶心
  // ══════════════════════════════════════════════════════
  function faceBg(c, o) {
    o = o || {};
    var V = P.ext.faceBg, G = P.ext.glowWarm;
    var gx = o.gx == null ? 258 : o.gx, gy = o.gy == null ? 92 : o.gy;
    R(c, 0, 0, 320, 58, V[0]);
    R(c, 0, 58, 320, 38, V[1]);
    R(c, 0, 96, 320, 42, V[2]);
    R(c, 0, 138, 320, 42, V[3]);
    for (var i = 0; i < 130; i++) {
      var a = i * 2.399, r = 8 + Math.sqrt(i / 130) * 56;
      var x = Math.round(gx + Math.cos(a) * r), y = Math.round(gy + Math.sin(a) * r * .78);
      if (x < 0 || x > 319 || y < 0 || y > 179) continue;
      var far = r > 40;
      c.save(); c.globalAlpha = far ? .10 : .17;
      R(c, x, y, 2, 1, far ? '#8A6E62' : G[4]);
      c.restore();
    }
    // 暖光晕：同心实心椭圆会读成「洋葱圈」（2026-11-05《未寄》实拍暴露），
    // 改成半径 10→44 的点阵环，每行 alpha 递减，肉眼只见一团暖光。
    for (var gr = 10; gr <= 44; gr += 3) {
      var ga = .26 * (1 - (gr - 10) / 36);
      if (ga <= .012) continue;
      for (var gd = 0; gd < 360; gd += 7) {
        if (((gd / 7) + gr) % 2) continue;
        var grad = gd * Math.PI / 180;
        c.save(); c.globalAlpha = ga;
        R(c, gx + Math.cos(grad) * gr, gy + Math.sin(grad) * gr * .78, 1, 1, G[4]);
        c.restore();
      }
    }
    ell(c, gx, gy, 9, 7, G[3]);
    var pts = [[42, 30], [80, 48], [112, 26], [188, 38], [222, 64], [292, 34], [302, 76], [58, 86], [130, 74], [26, 60]];
    for (var k = 0; k < pts.length; k++) {
      c.save(); c.globalAlpha = .30 + (k % 3) * .14;
      R(c, pts[k][0], pts[k][1], 2, 2, k % 2 ? '#8A7A98' : '#C8A088');
      c.restore();
    }
    c.save(); c.globalAlpha = .34;
    R(c, 0, 0, 320, 10, '#0E0A14'); R(c, 0, 170, 320, 10, '#0E0A14');
    c.globalAlpha = .26;
    R(c, 0, 0, 12, 180, '#0E0A14'); R(c, 308, 0, 12, 180, '#0E0A14');
    c.restore();
  }

  // ══════════════════════════════════════════════════════
  // 正脸半身像（特写）
  //   头 88×82 ｜ 眼 12×14，中心距 28（内缘 16）｜ 脖 27×16 ｜ 肩 120
  //   top = 头顶 y（默认 14）
  // ══════════════════════════════════════════════════════
  function faceFront(c, o) {
    o = o || {};
    var cx = o.cx == null ? 160 : o.cx;
    var HY = o.top == null ? 14 : o.top;
    var JW = 44, FY = HY + 82, EYE = HY + 38, EH = 14, EW = 12;

    // ── pass1：深色膨胀轮廓（逐段同形，绝不用大矩形）──
    ell(c, cx, HY + 42, JW + 3, 45, E_FACE);
    R(c, cx - 44, HY + 20, 10, 58, E_FACE);           // 左鬓
    R(c, cx + 34, HY + 20, 10, 58, E_FACE);           // 右鬓
    R(c, cx - 14, FY - 4, 29, 18, E_FACE);            // 脖
    for (var i = 0; i <= 18; i++) {                   // 肩：12 → 60 梯形
      var w = 12 + Math.round(i * 2.7);
      R(c, cx - w, FY + 12 + i, w * 2, 1, E_FACE);
    }
    R(c, cx - 60, FY + 30, 121, 60, E_FACE);

    // ── 后发（包脸的鬓，垂到下颌以下）──
    R(c, cx - 43, HY + 18, 10, 62, HAIR[1]);
    R(c, cx + 33, HY + 18, 10, 62, HAIR[1]);
    R(c, cx - 43, HY + 74, 8, 5, E_HAIR);
    R(c, cx - 42, HY + 79, 5, 2, E_HAIR);
    R(c, cx + 35, HY + 74, 8, 5, E_HAIR);
    R(c, cx + 36, HY + 79, 5, 2, E_HAIR);
    R(c, cx - 43, HY + 18, 1, 56, HAIR[2]);
    R(c, cx + 42, HY + 18, 1, 56, E_HAIR);

    // ── 脸（上宽下窄，一次成型：69→67→61→49）──
    R(c, cx - 34, HY + 10, 69, 52, SK[2]);
    R(c, cx - 33, HY + 62, 67, 12, SK[2]);
    R(c, cx - 30, HY + 74, 61, 6, SK[2]);
    R(c, cx - 24, HY + 80, 49, 3, SK[2]);
    R(c, cx - 34, HY + 10, 2, 54, SK[0]);              // 左脸缘暗
    R(c, cx + 33, HY + 14, 1, 44, '#EBC49C');          // 右脸缘受光（1px 极淡）

    // ── 顶发（圆顶 + 刘海压到眼上方 4px，不盖眼）──
    ell(c, cx, HY + 18, JW, 18, HAIR[1]);
    R(c, cx - 44, HY + 18, 89, 16, HAIR[1]);
    R(c, cx - 44, HY + 28, 46, 4, HAIR[1]);
    R(c, cx - 30, HY + 30, 30, 3, HAIR[1]);
    R(c, cx - 2, HY + 27, 46, 4, HAIR[1]);
    R(c, cx + 14, HY + 29, 30, 3, HAIR[1]);
    // 发丝高光：2 条断弧，绝不留整片亮
    R(c, cx - 30, HY + 12, 20, 2, HAIR[3]);
    R(c, cx - 22, HY + 15, 12, 1, HAIR[2]);
    R(c, cx + 6, HY + 14, 14, 1, HAIR[2]);
    R(c, cx - 34, HY + 20, 3, 8, HAIR[2]);
    R(c, cx + 30, HY + 18, 5, 12, HAIR[2]);
    R(c, cx + 26, HY + 34, 6, 3, HAIR[2]);

    // ── 眼（竖长块 + 3×3 高光 + 下眼睑；无眉无鼻）──
    R(c, cx - 20, EYE, EW, EH, P.ext.eye[0]);
    R(c, cx + 8, EYE, EW, EH, P.ext.eye[0]);
    R(c, cx - 18, EYE + 2, 3, 3, SH[3]);
    R(c, cx + 10, EYE + 2, 3, 3, SH[3]);
    R(c, cx - 20, EYE + EH, EW, 2, SK[0]);
    R(c, cx + 8, EYE + EH, EW, 2, SK[0]);

    // ── 嘴（一条横线 + 两嘴角点 + 下唇投影）──
    R(c, cx - 8, HY + 68, 17, 3, P.ext.mouth[0]);
    R(c, cx - 10, HY + 66, 2, 2, P.ext.mouth[0]);
    R(c, cx + 9, HY + 66, 2, 2, P.ext.mouth[0]);
    R(c, cx - 6, HY + 71, 13, 2, SK[0]);

    // ── 脖子 ──
    R(c, cx - 13, FY - 2, 27, 16, SK[1]);
    R(c, cx - 12, FY - 2, 25, 6, SK[2]);
    R(c, cx - 12, FY + 5, 25, 3, '#A27450');
    R(c, cx - 13, FY - 2, 2, 14, '#AE7E56');
    R(c, cx + 11, FY - 2, 2, 14, '#D0A47C');

    // ── 躯干：外套整块 → 挖 V 领 → 填衬衫（不留任何缝）──
    R(c, cx - 60, 112, 121, 68, CO[2]);
    R(c, cx - 60, 112, 5, 68, CO[3]);
    R(c, cx + 57, 112, 4, 68, CO[0]);
    R(c, cx - 60, 112, 3, 2, CO[0]);
    R(c, cx + 58, 112, 3, 2, CO[0]);
    R(c, cx - 26, 104, 53, 76, SH[2]);                 // 衬衫
    R(c, cx - 26, 104, 3, 76, SH[1]);
    R(c, cx + 24, 104, 3, 76, SH[0]);
    R(c, cx - 18, 116, 1, 62, '#E8E8F2');
    R(c, cx + 18, 116, 1, 62, '#E8E8F2');
    R(c, cx - 1, 122, 1, 56, '#E8E8F2');
    // V 领三角（白衬衫尖端 + 最上 2px 皮肤）
    R(c, cx - 10, 108, 21, 2, SK[1]);
    R(c, cx - 9, 110, 19, 4, SH[2]);
    R(c, cx - 6, 114, 13, 4, SH[2]);
    R(c, cx - 3, 118, 7, 3, SH[2]);
    R(c, cx - 9, 110, 1, 8, SH[0]);
    R(c, cx + 9, 110, 1, 8, SH[0]);
    // 领片
    R(c, cx - 26, 104, 17, 8, SH[2]);
    R(c, cx + 10, 104, 17, 8, SH[2]);
    R(c, cx - 10, 104, 10, 7, SH[2]);
    R(c, cx + 1, 104, 10, 7, SH[2]);
    R(c, cx - 10, 106, 1, 5, SH[0]);
    R(c, cx + 11, 106, 1, 5, SH[0]);
    // 大翻领（外套色，从肩垂到胸）
    R(c, cx - 34, 112, 9, 54, CO[3]);
    R(c, cx - 34, 112, 2, 54, CO[1]);
    R(c, cx - 26, 112, 2, 54, CO[1]);
    R(c, cx + 26, 112, 9, 54, '#4E5C78');
    R(c, cx + 26, 112, 2, 54, CO[1]);
    R(c, cx + 34, 112, 2, 54, CO[0]);
    R(c, cx - 34, 164, 9, 2, CO[1]);
    R(c, cx + 26, 164, 9, 2, CO[1]);
    // 肩线（斜下 3px 去直角）+ 竖褶
    for (var j = 0; j < 20; j++) {
      var yy = 114 + Math.round(j * .15);
      R(c, cx - 26 - j, yy, 1, 1, CO[3]);
      R(c, cx + 26 + j, yy, 1, 1, CO[3]);
    }
    R(c, cx - 50, 120, 1, 56, CO[1]);
    R(c, cx + 50, 120, 1, 56, CO[0]);
    R(c, cx - 44, 140, 1, 36, '#3A465E');
    R(c, cx + 44, 140, 1, 36, '#3A465E');

    // 前景压暗（让脸成为唯一亮点）
    c.save(); c.globalAlpha = .12;
    R(c, 0, 150, 320, 30, '#0E0A14');
    c.restore();
  }

  // ══════════════════════════════════════════════════════
  // 纯背影（叙事主力）
  //   身高 62（占屏 34%）｜头 24×19（头身比 1:3.26，头宽 > 肩宽 22）
  //   fy = 脚底 y（默认 152 = 画面 84%）
  // ══════════════════════════════════════════════════════
  function back(c, o) {
    o = o || {};
    var cx = o.cx == null ? 137 : o.cx;
    var fy = o.fy == null ? 152 : o.fy;
    var T = fy - 62, E = P.ext.edge[2];
    var PA = P.ext.pant, SKB = P.ext.skinFigure;

    // pass1：膨胀轮廓
    ell(c, cx, T + 9, 13, 10, E);
    R(c, cx - 3, T + 16, 7, 6, E);
    R(c, cx - 12, T + 20, 24, 19, E);
    R(c, cx - 13, T + 21, 5, 16, E);
    R(c, cx + 9, T + 21, 5, 16, E);
    R(c, cx - 11, T + 37, 22, 20, E);
    R(c, cx - 12, T + 55, 24, 8, E);
    R(c, cx - 14, T + 9, 2, 5, SKB[0]);
    R(c, cx + 12, T + 9, 2, 5, SKB[0]);

    // 头（扁圆，宽 24 高 19 → 宽高比 1.26）
    ell(c, cx, T + 9, 12, 9, HAIR[1]);
    R(c, cx - 7, T + 1, 14, 1, HAIR[1]);
    R(c, cx - 4, T, 8, 1, HAIR[1]);
    R(c, cx - 10, T + 17, 20, 1, E_HAIR);
    R(c, cx - 7, T + 2, 6, 1, '#30304A');
    R(c, cx - 5, T + 3, 3, 1, '#26263C');
    R(c, cx + 3, T + 3, 3, 1, '#26263C');

    // 脖
    R(c, cx - 2, T + 17, 5, 4, '#A87E5E');
    R(c, cx - 1, T + 17, 3, 1, '#C0946E');

    // 白衬衫（22 宽，上段 12 + 下段 5，左暗右亮 + 3 条竖褶）
    R(c, cx - 11, T + 20, 22, 12, SH[2]);
    R(c, cx - 10, T + 32, 20, 5, SH[2]);
    R(c, cx - 11, T + 20, 3, 12, SH[1]);
    R(c, cx - 10, T + 32, 3, 5, '#D2D2E0');
    R(c, cx + 8, T + 20, 3, 12, SH[3]);
    R(c, cx + 7, T + 32, 3, 5, SH[3]);
    R(c, cx - 5, T + 22, 1, 13, '#E8E8F2');
    R(c, cx + 2, T + 22, 1, 13, '#E8E8F2');
    R(c, cx + 5, T + 24, 1, 10, '#EDEDF6');
    R(c, cx - 11, T + 20, 22, 1, SH[3]);
    R(c, cx - 10, T + 36, 20, 1, '#D8D8E8');
    R(c, cx - 4, T + 29, 8, 1, '#E4E4F0');
    R(c, cx - 4, T + 19, 9, 2, SH[1]);
    R(c, cx - 3, T + 20, 7, 1, SKB[0]);

    // 手臂 + 手
    R(c, cx - 12, T + 21, 3, 14, SH[1]);
    R(c, cx - 12, T + 21, 1, 14, SH[2]);
    R(c, cx + 10, T + 21, 3, 14, SH[2]);
    R(c, cx + 12, T + 21, 1, 14, SH[1]);
    R(c, cx - 12, T + 34, 3, 4, SKB[1]);
    R(c, cx - 12, T + 34, 3, 1, SKB[2]);
    R(c, cx + 10, T + 34, 3, 4, SKB[1]);
    R(c, cx + 10, T + 34, 3, 1, SKB[2]);
    R(c, cx - 12, T + 35, 1, 2, SKB[0]);
    R(c, cx + 12, T + 35, 1, 2, SKB[0]);

    // 深蓝长裤（两腿分离 + 2px 中缝）
    R(c, cx - 10, T + 37, 20, 19, PA[2]);
    R(c, cx - 10, T + 37, 9, 19, PA[1]);
    R(c, cx + 1, T + 37, 9, 19, PA[3]);
    R(c, cx - 1, T + 37, 2, 17, PA[0]);
    R(c, cx - 10, T + 37, 20, 1, PA[3]);
    R(c, cx - 10, T + 37, 20, 2, PA[1]);
    R(c, cx - 10, T + 37, 20, 1, '#4A5A88');
    R(c, cx - 10, T + 54, 9, 2, PA[0]);
    R(c, cx + 1, T + 54, 9, 2, PA[0]);
    R(c, cx + 5, T + 41, 1, 11, '#445484');

    // 鞋（比腿宽 1px）
    R(c, cx - 11, T + 56, 10, 6, '#2A2430');
    R(c, cx + 1, T + 56, 10, 6, '#2A2430');
    R(c, cx - 11, T + 56, 10, 1, '#3E3848');
    R(c, cx + 1, T + 56, 10, 1, '#3E3848');
    R(c, cx - 11, T + 61, 10, 1, E_HAIR);
    R(c, cx + 1, T + 61, 10, 1, E_HAIR);
  }

  // ══════════════════════════════════════════════════════
  // 3/4 回眸（身体背对、头转向右后）｜只画一只眼 + 一个点
  //   ⚠ 后脑必须先画圆顶 ell，再补两条"矩形垂发" —— 用一整个矩形就是方发罩
  // ══════════════════════════════════════════════════════
  function turn(c, o) {
    o = o || {};
    var cx = o.cx == null ? 175 : o.cx;
    var fy = o.fy == null ? 152 : o.fy;
    var T = fy - 62, E = P.ext.edge[2];
    var HB = P.ext.hairBrown, SKB = P.ext.skinFigure, COW = P.ext.coatW;
    var G = P.ext.gold[0], BL = P.ext.blush[0], IE = P.ext.innerEdge, SD = P.ext.skirtDusk;

    // pass1：膨胀轮廓（圆顶 + 两条矩形垂发；用整块矩形就是"方发罩"）
    ell(c, cx - 2, T + 9, 13, 10, E);
    R(c, cx - 12, T + 14, 6, 28, E);
    R(c, cx + 7, T + 19, 6, 23, E);
    R(c, cx - 3, T + 16, 7, 6, E);
    R(c, cx - 12, T + 20, 23, 24, E);
    R(c, cx - 13, T + 21, 5, 16, E);
    R(c, cx + 9, T + 21, 5, 16, E);
    R(c, cx - 10, T + 42, 21, 11, E);
    R(c, cx - 9, T + 52, 18, 5, E);
    R(c, cx - 10, T + 56, 20, 8, E);

    // 头发：圆后脑（中心偏左 2px = 头转右）+ 两条垂发
    ell(c, cx - 2, T + 9, 11, 9, HB[1]);
    R(c, cx + 6, T + 15, 5, 4, HB[1]);
    R(c, cx - 3, T + 1, 8, 1, HB[1]);
    R(c, cx - 10, T + 13, 4, 4, HB[1]);          // 左肩过渡（内收 1px）
    R(c, cx - 10, T + 16, 4, 25, HB[1]);         // 左侧长垂
    R(c, cx - 11, T + 4, 2, 11, HB[1]);          // 耳侧一缕外扩
    R(c, cx - 10, T + 4, 1, 11, HB[2]);          // 左缘受光
    R(c, cx + 8, T + 19, 4, 22, HB[1]);          // 右侧长垂
    R(c, cx + 11, T + 19, 1, 22, HB[0]);
    R(c, cx + 8, T + 20, 1, 18, HB[2]);
    R(c, cx - 10, T + 40, 2, 2, HB[0]);          // 发梢锯齿
    R(c, cx - 7, T + 41, 2, 1, HB[1]);
    R(c, cx + 9, T + 40, 2, 2, HB[0]);
    R(c, cx - 7, T + 3, 6, 1, HB[2]);            // 顶弧高光
    R(c, cx - 9, T + 6, 2, 3, HB[2]);
    R(c, cx - 10, T + 15, 2, 9, '#7A5448');
    R(c, cx - 5, T + 9, 1, 24, HB[0]);           // 长发分缝

    // 3/4 侧脸（宽 9，上宽下窄，脸缘不出描边）
    R(c, cx + 3, T + 4, 9, 9, SKB[1]);
    R(c, cx + 3, T + 13, 8, 3, SKB[1]);
    R(c, cx + 4, T + 16, 6, 1, SKB[1]);
    R(c, cx + 10, T + 12, 2, 3, SKB[1]);         // 上唇（侧脸凸出）
    R(c, cx + 3, T + 16, 8, 1, SKB[0]);
    R(c, cx + 5, T + 17, 5, 1, SKB[0]);
    R(c, cx + 11, T + 6, 1, 8, SKB[2]);
    // 刘海：左侧厚（斜边界 = 转头感）
    R(c, cx + 3, T + 3, 9, 2, HB[1]);
    R(c, cx + 3, T + 5, 3, 3, HB[1]);
    R(c, cx + 6, T + 4, 2, 1, HB[1]);
    R(c, cx + 10, T + 3, 2, 1, HB[1]);
    // 五官：一只眼 + 嘴点 + 腮红（无眉无鼻）
    R(c, cx + 8, T + 8, 2, 2, P.ext.hair[1]);
    R(c, cx + 10, T + 13, 2, 1, '#A85A58');
    R(c, cx + 5, T + 11, 2, 2, BL);
    R(c, cx + 4, T + 9, 1, 4, SKB[0]);
    R(c, cx + 8, T + 14, 2, 1, SKB[0]);
    // 星星发夹（金色）
    R(c, cx + 7, T + 2, 3, 1, G);
    R(c, cx + 8, T + 1, 1, 3, G);
    R(c, cx + 8, T + 2, 1, 1, '#FFF0C0');

    // 脖
    R(c, cx - 2, T + 16, 6, 5, SKB[0]);
    R(c, cx - 1, T + 16, 4, 1, SKB[1]);

    // 暗棕红外套（21 宽 21 高，3 条竖缝）
    R(c, cx - 11, T + 20, 22, 13, COW[1]);
    R(c, cx - 10, T + 33, 20, 8, COW[1]);
    R(c, cx - 11, T + 20, 3, 13, COW[0]);
    R(c, cx - 10, T + 33, 3, 8, '#4A2024');
    R(c, cx + 8, T + 20, 3, 13, COW[2]);
    R(c, cx + 7, T + 33, 3, 8, COW[2]);
    R(c, cx - 11, T + 20, 22, 1, COW[2]);        // 肩线
    R(c, cx - 8, T + 23, 1, 15, COW[2]);         // 竖缝 ×3
    R(c, cx - 3, T + 23, 1, 15, COW[2]);
    R(c, cx + 3, T + 23, 1, 15, COW[2]);
    R(c, cx - 1, T + 20, 1, 21, COW[0]);         // 开襟
    R(c, cx - 10, T + 37, 20, 1, '#4A2024');
    // 领口（她回头看，领子翻起）
    R(c, cx - 5, T + 18, 12, 3, COW[0]);
    R(c, cx - 4, T + 19, 10, 1, SKB[0]);

    // 手臂 + 手（臂与身之间留 1px 深色分隔，否则臂读不出来）
    R(c, cx - 12, T + 21, 2, 14, COW[0]);
    R(c, cx + 10, T + 21, 2, 14, COW[2]);
    R(c, cx - 10, T + 21, 1, 14, '#3E1A1E');
    R(c, cx + 9, T + 21, 1, 14, '#3E1A1E');
    R(c, cx - 12, T + 34, 2, 4, SKB[1]);
    R(c, cx + 11, T + 34, 1, 4, SKB[1]);
    R(c, cx - 12, T + 34, 2, 1, SKB[2]);
    R(c, cx + 11, T + 34, 1, 1, SKB[2]);

    // 绿色内搭边（外套下缘那条绿）
    R(c, cx - 10, T + 39, 20, 2, IE[0]);
    R(c, cx - 10, T + 39, 20, 1, IE[1]);

    // 蓝紫裙（竖褶）
    R(c, cx - 9, T + 41, 19, 11, SD[1]);
    R(c, cx - 9, T + 41, 19, 1, SD[2]);
    for (var i = 0; i < 4; i++) R(c, cx - 7 + i * 4, T + 42, 1, 9, SD[0]);
    R(c, cx - 9, T + 51, 19, 1, SD[0]);

    // 腿（肤色，露膝下，两条分画）
    R(c, cx - 8, T + 52, 7, 5, SKB[1]);
    R(c, cx + 2, T + 52, 7, 5, SKB[1]);
    R(c, cx - 8, T + 52, 1, 5, SKB[2]);
    R(c, cx + 8, T + 52, 1, 5, SKB[0]);

    // 白鞋
    R(c, cx - 9, T + 56, 9, 6, P.ext.shoeWhite[1]);
    R(c, cx + 1, T + 56, 9, 6, P.ext.shoeWhite[1]);
    R(c, cx - 9, T + 56, 9, 1, P.ext.shoeWhite[2]);
    R(c, cx + 1, T + 56, 9, 1, P.ext.shoeWhite[2]);
    R(c, cx - 9, T + 60, 9, 2, P.ext.shoeWhite[0]);
    R(c, cx + 1, T + 60, 9, 2, P.ext.shoeWhite[0]);
  }

  return { faceFront: faceFront, faceBg: faceBg, back: back, turn: turn, ell: ell, R: R };
})();
