// _hero.js — chibi 主角立绘库（纯代码绘制，零图片素材）
// 风格基准：用户 2026-11-05 提供的参考图「回忆·那年夏天」拍立得
//   大头身比 ≈1:2.8 / 圆穹顶厚发 / 点状眼 / 双腮红 / 深色外描边
// 坐标约定：drawGirl(g, ox, oy) 的 (ox, oy) = 脚底中心；人物总高 H（女 110 / 男 114）
//   内部 P(x, y, w, h) 中 y 相对头顶向下（0..H），x 相对中轴向右为正
// 全部整数坐标，禁抗锯齿；每块表面 ≥2 档明度
(function () {
  const R = (g, x, y, w, h, col) => {
    g.fillStyle = col;
    g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  };

  // 逐行半宽填充（画圆头/脸/发冠的通用工具）
  function band(g, ox, y0, hws, col, T) {
    for (let i = 0; i < hws.length; i++) R(g, ox - hws[i], T + y0 + i, hws[i] * 2, 1, col);
  }

  // ─────────── 调色板（取自参考图量化） ───────────
  const CG = {
    hair: '#7A4A2E', hairD: '#583220', hairL: '#9C6541',
    skin: '#F8DFC0', skinD: '#E7C29E', skinDD: '#CFA57D',
    top: '#F3CF68', topL: '#FFE7A2', topD: '#D6AB42', topDD: '#B38B2C',
    pants: '#4E5872', pantsD: '#3B4559', pantsDD: '#2C3444', pantsL: '#616C88',
    shoe: '#4B4139', shoeD: '#2C2521', shoeL: '#6E6054',
    blush: '#F0A07E', eye: '#33211A', mouth: '#AC5F49',
    line: [74, 46, 34],
  };
  const CB = {
    hair: '#4A3428', hairD: '#31221A', hairL: '#67493A',
    skin: '#F8DFC0', skinD: '#E7C29E', skinDD: '#CFA57D',
    top: '#F4ECDD', topL: '#FFFDF2', topD: '#D9CEB9', topDD: '#BBAE96',
    pants: '#7D8DA7', pantsD: '#63728C', pantsDD: '#4E5C72', pantsL: '#96A5BD',
    shoe: '#4B4139', shoeD: '#2C2521', shoeL: '#6E6054',
    blush: '#F0A07E', eye: '#33211A', mouth: '#AC5F49',
    line: [58, 44, 36],
  };

  // ══════════════ 女：黄色短袖 + 深蓝直筒裤 + 棕色中长发 + 右手上举 ══════════════
  function drawGirl(g, ox, oy) {
    const H = 110, T = oy - H;
    const C = CG;
    const P = (x, y, w, h, col) => R(g, ox + x, T + y, w, h, col);

    // ① 后发：两侧垂发（先画，被脸/身体压住）
    P(-16, 16, 7, 31, C.hair);            // 左侧中长束 16..47（到肩）
    P(10, 16, 7, 31, C.hair);
    P(-17, 26, 1, 18, C.hairD);           // 发束外侧暗边
    P(16, 26, 1, 18, C.hairD);
    P(-16, 43, 6, 5, C.hair);             // 内扣发梢
    P(10, 43, 6, 5, C.hair);
    P(-16, 46, 6, 2, C.hairD);
    P(10, 46, 6, 2, C.hairD);

    // ② 脖子
    P(-4, 36, 8, 12, C.skinD);
    P(-4, 36, 3, 12, C.skinDD);

    // ③ 裤：臀片 + 两条腿 + 裆缝
    P(-14, 72, 28, 13, C.pants);          // 臀 72..85
    P(-14, 85, 13, 17, C.pants);          // 左腿 85..102
    P(1, 85, 13, 17, C.pants);            // 右腿
    P(-2, 82, 4, 11, C.pantsD);           // 裆缝（只到腿根，下段靠两腿间的透明缝）
    P(-1, 83, 2, 10, C.pantsDD);
    P(-14, 72, 2, 30, C.pantsD);          // 外侧暗
    P(12, 72, 2, 30, C.pantsD);
    P(-12, 74, 3, 22, C.pantsL);          // 左腿高光
    P(3, 74, 3, 22, C.pantsL);
    P(-14, 97, 13, 5, C.pantsL);          // 裤脚翻边
    P(1, 97, 13, 5, C.pantsL);
    P(-14, 102, 13, 1, C.pantsD);
    P(1, 102, 13, 1, C.pantsD);

    // ④ 鞋（圆头厚底）
    P(-15, 103, 15, 4, C.shoe);
    P(1, 103, 15, 4, C.shoe);
    P(-15, 103, 15, 1, C.shoeL);
    P(1, 103, 15, 1, C.shoeL);
    P(-16, 105, 1, 4, C.shoe);            // 鞋头外凸
    P(16, 105, 1, 4, C.shoe);
    P(-15, 107, 15, 3, C.shoeD);          // 鞋底
    P(1, 107, 15, 3, C.shoeD);
    P(-15, 106, 15, 1, C.shoe);           // 鞋面分界
    P(1, 106, 15, 1, C.shoe);

    // ⑤ 上衣躯干（宽松，下摆外扩）
    P(-15, 44, 30, 22, C.top);            // 44..66
    P(-16, 64, 32, 10, C.top);            // 下摆 64..74
    P(-15, 44, 3, 22, C.topD);            // 左侧暗
    P(-16, 70, 32, 4, C.topD);
    P(-16, 73, 32, 1, C.topDD);
    P(-15, 44, 30, 1, C.topL);            // 肩线
    P(-12, 47, 2, 18, C.topL);            // 左侧受光边（窄）
    P(-9, 62, 4, 2, C.topD);              // 衣褶
    P(6, 64, 3, 2, C.topD);
    P(8, 56, 2, 6, C.topD);               // 右侧暗褶
    // 领口（领边压一道暗线，脖子露出 8px）
    P(-5, 43, 10, 1, C.skinD);
    P(-5, 43, 4, 1, C.skinDD);
    P(-6, 45, 12, 1, C.topD);

    // ⑥ 短袖（圆肩：肩部上角切掉一格，袖口 y=52）
    P(-20, 46, 6, 6, C.top);
    P(14, 46, 6, 6, C.top);
    P(-19, 44, 4, 2, C.top);              // 肩弧
    P(15, 44, 4, 2, C.top);
    P(-19, 44, 3, 1, C.topL);
    P(16, 44, 3, 1, C.topL);
    P(-20, 51, 6, 2, C.topD);             // 袖口暗
    P(14, 51, 6, 2, C.topD);
    P(-18, 52, 1, 3, C.topDD);            // 袖口内缘
    P(18, 52, 1, 3, C.topDD);
    P(-20, 46, 1, 6, C.topD);             // 袖外侧暗
    P(19, 46, 1, 6, C.topD);

    // ⑦ 垂下手臂（画面右，全露肤：上臂粗、腕细、掌宽）
    P(15, 52, 5, 8, C.skin);              // 上臂 52..60
    P(15, 59, 5, 2, C.skinD);             // 肘窝
    P(16, 61, 4, 8, C.skin);              // 前臂 61..69
    P(17, 69, 3, 2, C.skin);              // 腕（收窄）
    P(16, 71, 5, 6, C.skin);              // 掌
    P(16, 76, 5, 1, C.skinD);             // 指尖
    P(19, 61, 1, 8, C.skinD);             // 外侧暗
    P(18, 71, 1, 5, C.skinD);             // 指缝
    P(16, 71, 1, 5, C.skinD);             // 拇指侧

    // ⑧ 脸
    band(g, ox, 14, [8, 10, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 11, 9], C.skin, T);
    P(-12, 18, 2, 18, C.skinD);           // 侧脸受暗
    P(-13, 26, 2, 6, C.skin);             // 耳
    P(11, 26, 2, 6, C.skin);
    P(-13, 27, 1, 4, C.skinD);
    P(12, 27, 1, 4, C.skinD);

    // ⑨ 头发：圆穹顶 + 厚刘海 + 分缝（发冠压到 4..19，只高出脸顶 10px）
    band(g, ox, 7, [5, 9, 12, 14, 15, 16, 16, 16, 16, 16, 16, 16, 16], C.hair, T);
    // 刘海下缘（发缕，高矮错落）
    const fringe = [[-16, 3], [-14, 4], [-12, 2], [-10, 4], [-8, 1],
                    [-6, 3], [-4, 4], [-2, 2], [0, 3], [2, 1],
                    [4, 3], [6, 4], [8, 2], [10, 3], [12, 3], [14, 2]];
    for (const [fx, fh] of fringe) P(fx, 20, 2, fh, C.hair);
    // 鬓角（只压 2px，让脸露全）
    P(-16, 20, 3, 16, C.hair);
    P(13, 20, 3, 14, C.hair);
    P(-16, 20, 1, 16, C.hairD);
    P(15, 20, 1, 14, C.hairD);
    // 发顶高光（弧形三段，贴着新发顶）
    P(-6, 11, 9, 1, C.hairL);
    P(-11, 13, 4, 1, C.hairL);
    P(6, 13, 4, 1, C.hairL);
    P(-2, 15, 5, 1, C.hairL);
    // 发丝暗线（细、不刺眼）
    P(-11, 17, 1, 14, C.hairD);
    P(12, 17, 1, 12, C.hairD);
    P(-17, 34, 1, 18, C.hairD);

    // ⑩ 五官
    P(-8, 28, 3, 3, C.eye);               // 左眼
    P(5, 28, 3, 3, C.eye);                // 右眼
    P(-7, 28, 1, 1, '#FFFFFF');           // 高光
    P(6, 28, 1, 1, '#FFFFFF');
    P(-9, 25, 3, 1, C.hairD);             // 眉
    P(6, 25, 3, 1, C.hairD);
    P(-11, 33, 3, 2, C.blush);            // 腮红
    P(8, 33, 3, 2, C.blush);
    P(-1, 36, 2, 1, C.mouth);             // 嘴

    // ⑪ 举起的手臂（画面左 = 她的右手）：整条向外倾斜，末端张开手掌
    for (let i = 0; i < 15; i++) {
      const y = 50 - i * 2;                  // 50 → 22
      const x = -18 - Math.round(i * 0.86);  // -18 → -30（外倾 23°）
      P(x, y, 6, 2, C.skin);
      P(x, y, 1, 2, C.skinD);                // 内侧（贴头一侧）压暗
    }
    P(-18, 44, 2, 7, C.skinD);               // 腋下交界暗
    // 张开的手掌（掌 + 拇指，指缝分隔）
    P(-33, 14, 6, 10, C.skin);               // 掌
    P(-33, 11, 1, 3, C.skin);                // 四指（外倾斜上）
    P(-31, 10, 1, 4, C.skin);
    P(-29, 11, 1, 3, C.skin);
    P(-34, 16, 1, 4, C.skin);                // 拇指
    P(-32, 14, 1, 7, C.skinD);               // 指缝
    P(-30, 14, 1, 7, C.skinD);
    P(-33, 23, 6, 1, C.skinD);               // 掌根

    return H;
  }

  // ══════════════ 男：米白开衫长袖 + 灰蓝裤 + 深棕蓬松短发 ══════════════
  function drawBoy(g, ox, oy) {
    const H = 114, T = oy - H;
    const C = CB;
    const P = (x, y, w, h, col) => R(g, ox + x, T + y, w, h, col);

    // ① 后发（短，包住后脑）
    P(-17, 20, 4, 16, C.hair);
    P(13, 20, 4, 16, C.hair);
    P(-17, 33, 4, 3, C.hairD);
    P(13, 33, 4, 3, C.hairD);

    // ② 脖子
    P(-4, 40, 8, 12, C.skinD);
    P(-4, 40, 3, 12, C.skinDD);

    // ③ 裤（略宽松直筒）
    P(-14, 76, 28, 13, C.pants);          // 臀
    P(-14, 89, 13, 17, C.pants);          // 左腿
    P(1, 89, 13, 17, C.pants);
    P(-2, 86, 4, 11, C.pantsD);           // 裆缝（只到腿根）
    P(-1, 87, 2, 10, C.pantsDD);
    P(-14, 76, 2, 30, C.pantsD);
    P(12, 76, 2, 30, C.pantsD);
    P(-12, 78, 3, 22, C.pantsL);
    P(3, 78, 3, 22, C.pantsL);
    P(-14, 101, 13, 5, C.pants);          // 裤脚
    P(1, 101, 13, 5, C.pants);
    P(-14, 105, 13, 1, C.pantsD);
    P(1, 105, 13, 1, C.pantsD);

    // ④ 鞋（比女生大一号）
    P(-15, 106, 15, 4, C.shoe);
    P(1, 106, 15, 4, C.shoe);
    P(-15, 106, 15, 1, C.shoeL);
    P(1, 106, 15, 1, C.shoeL);
    P(-16, 108, 1, 4, C.shoe);
    P(16, 108, 1, 4, C.shoe);
    P(-15, 110, 15, 4, C.shoeD);
    P(1, 110, 15, 4, C.shoeD);
    P(-15, 109, 15, 1, C.shoe);
    P(1, 109, 15, 1, C.shoe);

    // ⑤ 上衣躯干（落肩宽松版型：肩线连续，不做垫肩台阶）
    P(-13, 46, 26, 3, C.top);             // 肩（两侧各收 1px 圆角）
    P(-15, 49, 30, 17, C.top);            // 躯干 49..66
    P(-16, 66, 32, 12, C.top);            // 下摆 66..78
    P(-13, 46, 3, 3, C.topD);
    P(-15, 52, 3, 14, C.topD);
    P(-16, 74, 32, 4, C.topD);
    P(-16, 77, 32, 1, C.topDD);
    P(-13, 46, 26, 1, C.topL);
    P(-12, 52, 2, 14, C.topL);            // 左侧受光边
    P(-16, 66, 1, 12, C.topD);
    // 腋下缝（只在腋下短一段，不作为整条分界线）
    P(-15, 50, 1, 7, C.topD);
    P(14, 50, 1, 7, C.topD);
    // 开衫门襟（中缝两片）
    P(-1, 49, 3, 28, C.topDD);
    P(0, 49, 1, 28, C.topD);
    P(-3, 52, 1, 20, C.topD);
    P(2, 52, 1, 20, C.topD);
    // 翻领（三角，立在领口两侧）
    P(-11, 46, 9, 3, C.top);
    P(2, 46, 9, 3, C.top);
    P(-11, 49, 2, 6, C.topD);
    P(9, 49, 2, 6, C.topD);
    P(-11, 46, 9, 1, C.topL);
    P(2, 46, 9, 1, C.topL);
    // 领口（脖子露出 3px）
    P(-5, 41, 10, 4, C.skinD);
    P(-5, 41, 4, 4, C.skinDD);
    P(-6, 45, 12, 1, C.topD);
    // 衣褶
    P(-9, 68, 4, 2, C.topD);
    P(5, 70, 3, 2, C.topD);

    // ⑥ 长袖（落肩：从肩线直接垂下，袖口 y=72）
    P(-20, 48, 5, 11, C.top);             // 上臂
    P(15, 48, 5, 11, C.top);
    P(-20, 58, 5, 14, C.top);             // 前臂
    P(15, 58, 5, 14, C.top);
    P(-20, 48, 1, 24, C.topD);            // 外侧暗
    P(19, 48, 1, 24, C.topD);
    // 袖身分界（从袖中段起，保留上半的落肩连续感）
    P(-15, 56, 1, 16, C.topD);
    P(14, 56, 1, 16, C.topD);
    P(-16, 66, 2, 4, C.topD);
    P(14, 66, 2, 4, C.topD);
    P(-21, 49, 1, 23, C.topD);
    P(20, 49, 1, 23, C.topD);
    P(-21, 48, 6, 1, C.topL);
    P(15, 48, 6, 1, C.topL);
    P(-20, 70, 5, 2, C.topDD);            // 袖口
    P(15, 70, 5, 2, C.topDD);

    // ⑦ 手（腕窄掌宽）
    P(-19, 72, 4, 2, C.skin);             // 腕（收窄）
    P(16, 72, 4, 2, C.skin);
    P(-20, 74, 6, 6, C.skin);             // 掌
    P(15, 74, 6, 6, C.skin);
    P(-21, 76, 1, 3, C.skin);             // 拇指
    P(20, 76, 1, 3, C.skin);
    P(-20, 79, 6, 1, C.skinD);            // 指尖
    P(15, 79, 6, 1, C.skinD);
    P(-20, 74, 1, 5, C.skinD);
    P(19, 74, 1, 5, C.skinD);
    P(-17, 74, 1, 5, C.skinD);            // 指缝
    P(18, 74, 1, 5, C.skinD);

    // ⑧ 脸（比女生宽一档）
    band(g, ox, 16, [9, 11, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 10], C.skin, T);
    P(-13, 20, 2, 18, C.skinD);
    P(-14, 28, 2, 6, C.skin);
    P(12, 28, 2, 6, C.skin);
    P(-14, 29, 1, 4, C.skinD);
    P(13, 29, 1, 4, C.skinD);

    // ⑨ 头发：短、蓬松、圆穹顶（发冠压到 6..20，只高出脸顶 10px）
    band(g, ox, 9, [6, 11, 14, 16, 17, 17, 17, 17, 17, 17, 17, 17], C.hair, T);
    // 贴轮廓的碎发簇（1px 宽、下缘阶梯，避免方块状凸起）
    P(-18, 15, 1, 4, C.hair);
    P(17, 15, 1, 4, C.hair);
    P(-18, 15, 1, 2, C.hairD);
    P(17, 15, 1, 2, C.hairD);
    // 刘海（碎、不对称，最长到眉上）
    const fringeM = [[-17, 4], [-15, 2], [-13, 5], [-11, 3], [-9, 5], [-7, 3],
                     [-5, 5], [-3, 2], [-1, 3], [1, 5], [3, 3], [5, 4],
                     [7, 2], [9, 4], [11, 1], [13, 3], [15, 2]];
    for (const [fx, fh] of fringeM) P(fx, 21, 2, fh, C.hair);
    // 鬓角（短，下缘做阶梯，避免方块感）
    P(-17, 21, 3, 8, C.hair);
    P(-17, 29, 2, 4, C.hair);
    P(-17, 33, 1, 2, C.hair);
    P(14, 21, 3, 7, C.hair);
    P(15, 28, 2, 4, C.hair);
    P(16, 32, 1, 2, C.hair);
    P(-17, 21, 1, 8, C.hairD);
    P(16, 21, 1, 7, C.hairD);
    // 发顶高光
    P(-7, 13, 10, 1, C.hairL);
    P(-12, 15, 4, 1, C.hairL);
    P(7, 15, 4, 1, C.hairL);
    P(-3, 17, 5, 1, C.hairL);
    // 发丝暗线
    P(-12, 16, 1, 13, C.hairD);
    P(13, 16, 1, 12, C.hairD);

    // ⑩ 五官（眼距略宽，眼神平）
    P(-8, 32, 3, 3, C.eye);
    P(6, 32, 3, 3, C.eye);
    P(-7, 32, 1, 1, '#FFFFFF');
    P(7, 32, 1, 1, '#FFFFFF');
    P(-10, 29, 3, 1, C.hairD);            // 眉
    P(7, 29, 3, 1, C.hairD);
    P(-11, 37, 3, 2, C.blush);
    P(8, 37, 3, 2, C.blush);
    P(-1, 40, 2, 1, C.mouth);

    return H;
  }

  // ─────────── 外描边（参考图的深色轮廓，1px 膨胀） ───────────
  function withOutline(g, W, H, drawFn, lineCol) {
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const c2 = cv.getContext('2d', { willReadFrequently: true });
    c2.imageSmoothingEnabled = false;
    drawFn(c2);
    const d = c2.getImageData(0, 0, W, H).data;
    const mask = c2.createImageData(W, H);
    const m = mask.data;
    const col = lineCol || [74, 46, 34];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (d[i + 3] > 0) continue;
        const near =
          (x > 0 && d[i - 4 + 3] > 0) || (x < W - 1 && d[i + 4 + 3] > 0) ||
          (y > 0 && d[i - W * 4 + 3] > 0) || (y < H - 1 && d[i + W * 4 + 3] > 0);
        if (near) { m[i] = col[0]; m[i + 1] = col[1]; m[i + 2] = col[2]; m[i + 3] = 255; }
      }
    }
    const lc = document.createElement('canvas');
    lc.width = W; lc.height = H;
    lc.getContext('2d').putImageData(mask, 0, 0);
    g.drawImage(lc, 0, 0);
    g.drawImage(cv, 0, 0);
  }

  // 单人合成：自动加描边。离屏画布只取包围盒，
  // 这样多人同框时各自描边互不干扰。
  const BW = 84, PAD_TOP = 8, PAD_BOT = 10;
  function person(g, ox, oy, kind, opt) {
    const H = kind === 'boy' ? 114 : 110;
    const BH = H + PAD_TOP + PAD_BOT;
    const cv = document.createElement('canvas');
    cv.width = BW; cv.height = BH;
    const c2 = cv.getContext('2d', { willReadFrequently: true });
    c2.imageSmoothingEnabled = false;
    const px = BW / 2;                       // 中轴在局部画布的 x
    const py = PAD_TOP + H;                  // 脚底在局部画布的 y
    if (kind === 'boy') drawBoy(c2, px, py, opt); else drawGirl(c2, px, py, opt);
    const d = c2.getImageData(0, 0, BW, BH).data;
    const mask = c2.createImageData(BW, BH);
    const m = mask.data;
    const col = (kind === 'boy' ? CB.line : CG.line);
    for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
      const i = (y * BW + x) * 4;
      if (d[i + 3] > 0) continue;
      const near =
        (x > 0 && d[i - 4 + 3] > 0) || (x < BW - 1 && d[i + 4 + 3] > 0) ||
        (y > 0 && d[i - BW * 4 + 3] > 0) || (y < BH - 1 && d[i + BW * 4 + 3] > 0);
      if (near) { m[i] = col[0]; m[i + 1] = col[1]; m[i + 2] = col[2]; m[i + 3] = 255; }
    }
    const out = document.createElement('canvas');
    out.width = BW; out.height = BH;
    const oc = out.getContext('2d');
    oc.putImageData(mask, 0, 0);
    oc.drawImage(cv, 0, 0);
    g.drawImage(out, Math.round(ox - px), Math.round(oy - py));
  }

  // ─────────── 双人合照（男左女右，女略矮） ───────────
  function drawCouple(g, ox, oy, gap) {
    const d = gap == null ? 30 : gap;
    drawBoy(g, ox - d, oy + 1);
    drawGirl(g, ox + d, oy);
  }

  window.HERO = { drawGirl, drawBoy, drawCouple, person, withOutline, CG, CB };
})();
