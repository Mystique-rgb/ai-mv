// ys_couple.js — 情侣海边合照（考核题）
// 规格来源：
//   场景 → 2026-11-05-拆解-他的海边-场景配图体系（10 色族 / 11 层 / 饱和度分层 / 点阵云浪线 / 地面碎屑）
//   人物 → 2026-11-05-拆解-轨迹-像素游戏UI双重回放（占画面 24–28% / 头身比 1:3.5 / 眼 3×3+高光 / 腮红大块 / 实心投影 / 无 rim）
// 教训：实色分块不用半透明糊、每物体 ≥3 层明度、层序=远到近、脸用椭圆整体成型
(function () {
  const C = {
    // 天（3 档）
    sky1: '#B8E0EC', sky2: '#A0D0E4', sky3: '#8CC0D8',
    // 海（5 档，远浅近深）
    sea1: '#90C0D8', sea2: '#58A0B8', sea3: '#3090C0', sea4: '#2878B8', sea5: '#2068A8',
    // 沙（4 档）
    sand1: '#F8E8C0', sand2: '#F8D890', sand3: '#E8C070', sand4: '#C8A050',
    // 木（5 档）
    w1: '#6E4422', w2: '#885828', w3: '#986030', w4: '#A87038', w5: '#B88858', w6: '#C89C68',
    // 米黄纸（3 档）
    p1: '#C0A478', p2: '#F0DCA8', p3: '#F8F0C0',
    // 点缀红 / 绿
    red: '#C8463C', redLt: '#E85838', green: '#3E7050', greenLt: '#5A9068',
    // 蓝（建筑 / 男装）
    blue: '#4A90B8', blueLt: '#68A8C8', blueDk: '#2E6A8C',
    navy: '#36527A', navyLt: '#4A6E9C', navyDk: '#26384F',
    // 橙（女装）
    orange: '#E8A058', orangeLt: '#F0C070', orangeDk: '#C87C3C',
    // 肤色
    skin: '#C9A382', skinDk: '#A87E62', skinLt: '#E0B896', blush: '#C2737A',
    // 头发
    hair: '#15141A', hairHi: '#323848',
    hairBr: '#3A2A24', hairBrHi: '#5A4438',
    ink: '#4A3520', inkDk: '#2A1A10',
  };

  function ell(c, cx, cy, rx, ry, col) {
    c.fillStyle = col;
    for (let dy = -ry; dy <= ry; dy++) {
      const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
      c.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
    }
  }

  // ============ 人物（1px 格，全身 54px，头身比 1:3.6）============
  // 男：短发 / 白T / 深蓝外套敞开 / 深蓝短裤 / 深色鞋
  function boy(c, cx, footY, o) {
    const T = footY - 54;
    const hc = cx;
    // 脚底实心投影
    c.fillStyle = 'rgba(110,80,44,.50)';
    c.fillRect(cx - 10, footY, 20, 2);
    c.fillRect(cx - 7, footY + 2, 14, 1);
    // 鞋
    R(c, cx - 8, footY - 4, 7, 4, C.inkDk);
    R(c, cx - 8, footY - 4, 7, 1, '#3E3E4A');
    R(c, cx + 1, footY - 4, 7, 4, C.inkDk);
    R(c, cx + 1, footY - 4, 7, 1, '#3E3E4A');
    // 小腿
    R(c, cx - 7, footY - 20, 6, 16, C.skin);
    R(c, cx + 1, footY - 20, 6, 16, C.skin);
    R(c, cx - 7, footY - 20, 2, 16, C.skinDk);
    R(c, cx + 6, footY - 20, 1, 16, C.skinLt);
    // 短裤
    R(c, cx - 8, footY - 30, 8, 11, C.navy);
    R(c, cx + 0, footY - 30, 8, 11, C.navy);
    R(c, cx - 8, footY - 30, 8, 2, C.navyLt);
    R(c, cx - 1, footY - 30, 2, 11, C.navyDk);
    R(c, cx - 8, footY - 21, 8, 2, C.navyDk);
    R(c, cx + 0, footY - 21, 8, 2, C.navyDk);
    // 躯干：白 T（上宽下窄）
    R(c, cx - 6, footY - 42, 13, 13, C.p3);
    R(c, cx - 6, footY - 42, 13, 3, '#FFFFFF');
    R(c, cx - 6, footY - 42, 3, 13, '#DCCFB4');
    R(c, cx + 5, footY - 42, 2, 13, '#E8DCC0');
    R(c, cx - 5, footY - 30, 11, 1, '#D8CBB0');
    // 外套两片
    R(c, cx - 9, footY - 43, 4, 15, C.navy);
    R(c, cx - 9, footY - 43, 1, 15, C.navyLt);
    R(c, cx + 6, footY - 43, 4, 15, C.navy);
    R(c, cx + 9, footY - 43, 1, 15, C.navyDk);
    R(c, cx - 9, footY - 44, 4, 3, C.navyLt);
    R(c, cx + 6, footY - 44, 4, 3, C.navyLt);
    R(c, cx - 9, footY - 29, 4, 1, C.navyDk);
    R(c, cx + 6, footY - 29, 4, 1, C.navyDk);
    // 左臂（垂，贴外套）
    R(c, cx - 11, footY - 40, 3, 12, C.navy);
    R(c, cx - 11, footY - 40, 1, 12, C.navyLt);
    R(c, cx - 11, footY - 28, 3, 3, C.skin);
    R(c, cx - 11, footY - 28, 3, 1, C.skinLt);
    // 右臂：抬到腰高，前臂伸向女主
    if (o.hold) {
      R(c, cx + 9, footY - 40, 3, 9, C.navy);      // 上臂
      R(c, cx + 9, footY - 33, 5, 3, C.navy);      // 前臂横出
      R(c, cx + 13, footY - 33, 4, 3, C.skin);     // 手
      R(c, cx + 13, footY - 33, 4, 1, C.skinLt);
    } else {
      R(c, cx + 11, footY - 40, 3, 12, C.navy);
      R(c, cx + 11, footY - 28, 3, 3, C.skin);
    }
    // 脖子
    R(c, cx - 2, footY - 45, 5, 3, C.skinDk);
    // 头（椭圆 13×15）
    ell(c, hc, T + 8, 6, 7, C.skin);
    R(c, hc - 6, T + 9, 1, 3, C.skinDk);
    R(c, hc + 6, T + 9, 1, 3, C.skinDk);
    // 短发
    ell(c, hc, T + 3, 7, 4, C.hair);
    R(c, hc - 7, T + 3, 3, 6, C.hair);        // 左鬓
    R(c, hc + 5, T + 3, 3, 6, C.hair);        // 右鬓
    R(c, hc - 6, T, 12, 3, C.hair);           // 顶发
    R(c, hc - 5, T, 6, 1, C.hairHi);
    R(c, hc + 2, T + 1, 3, 1, C.hairHi);
    R(c, hc - 4, T + 6, 9, 1, '#0E0C12');     // 刘海下缘
    // 五官（眉 T+8 / 眼 T+9 / 嘴 T+13）
    R(c, hc - 4, T + 8, 3, 1, C.inkDk);
    R(c, hc + 2, T + 8, 3, 1, C.inkDk);
    R(c, hc - 4, T + 9, 3, 3, C.hair);
    R(c, hc + 2, T + 9, 3, 3, C.hair);
    R(c, hc - 4, T + 9, 1, 1, '#FFFFFF');
    R(c, hc + 2, T + 9, 1, 1, '#FFFFFF');
    R(c, hc - 1, T + 12, 1, 1, C.skinDk);
    R(c, hc - 2, T + 13, 5, 1, '#8A4A40');
    R(c, hc - 3, T + 12, 1, 1, '#8A4A40');
    R(c, hc + 3, T + 12, 1, 1, '#8A4A40');
  }

  // 女：棕黑长发垂胸 / 白T / 橙黄外套 / 蓝短裤 / 白鞋
  function girl(c, cx, footY, o) {
    const T = footY - 54;
    const hc = cx;
    c.fillStyle = 'rgba(110,80,44,.50)';
    c.fillRect(cx - 10, footY, 20, 2);
    c.fillRect(cx - 7, footY + 2, 14, 1);
    // 鞋（白）
    R(c, cx - 8, footY - 4, 7, 4, '#E8E4DC');
    R(c, cx - 8, footY - 4, 7, 1, '#FFFFFF');
    R(c, cx + 1, footY - 4, 7, 4, '#E8E4DC');
    R(c, cx + 1, footY - 4, 7, 1, '#FFFFFF');
    // 腿
    R(c, cx - 7, footY - 20, 6, 16, C.skin);
    R(c, cx + 1, footY - 20, 6, 16, C.skin);
    R(c, cx - 7, footY - 20, 1, 16, C.skinLt);
    R(c, cx + 6, footY - 20, 1, 16, C.skinDk);
    // 蓝短裤
    R(c, cx - 8, footY - 29, 8, 10, C.blue);
    R(c, cx + 0, footY - 29, 8, 10, C.blue);
    R(c, cx - 8, footY - 29, 8, 2, C.blueLt);
    R(c, cx - 1, footY - 29, 2, 10, C.blueDk);
    // 白 T
    R(c, cx - 6, footY - 42, 13, 14, C.p3);
    R(c, cx - 6, footY - 42, 13, 3, '#FFFFFF');
    R(c, cx + 5, footY - 42, 2, 14, '#E8DCC0');
    R(c, cx - 5, footY - 29, 11, 1, '#D8CBB0');
    // 橙外套
    R(c, cx - 9, footY - 43, 4, 15, C.orange);
    R(c, cx - 9, footY - 43, 1, 15, C.orangeLt);
    R(c, cx + 6, footY - 43, 4, 15, C.orange);
    R(c, cx + 9, footY - 43, 1, 15, C.orangeDk);
    R(c, cx - 9, footY - 44, 4, 3, C.orangeLt);
    R(c, cx + 6, footY - 44, 4, 3, C.orangeLt);
    R(c, cx - 9, footY - 29, 4, 1, C.orangeDk);
    R(c, cx + 6, footY - 29, 4, 1, C.orangeDk);
    // 右臂垂
    R(c, cx + 11, footY - 40, 3, 12, C.orange);
    R(c, cx + 11, footY - 28, 3, 3, C.skin);
    R(c, cx + 11, footY - 28, 3, 1, C.skinLt);
    // 左臂伸向男主
    if (o.hold) {
      R(c, cx - 11, footY - 40, 3, 9, C.orange);
      R(c, cx - 13, footY - 33, 5, 3, C.orange);
      R(c, cx - 16, footY - 33, 4, 3, C.skin);
      R(c, cx - 16, footY - 33, 4, 1, C.skinLt);
    } else {
      R(c, cx - 11, footY - 40, 3, 12, C.orange);
      R(c, cx - 11, footY - 28, 3, 3, C.skin);
    }
    // 脖子
    R(c, cx - 2, footY - 45, 5, 3, C.skinLt);
    // 长发（后层，垂到胸 y-31）
    R(c, cx - 9, footY - 48, 4, 20, C.hairBr);
    R(c, cx + 6, footY - 48, 4, 20, C.hairBr);
    R(c, cx - 9, footY - 48, 1, 20, C.hairBrHi);
    R(c, cx + 9, footY - 48, 1, 20, '#241812');
    R(c, cx - 9, footY - 30, 4, 2, '#241812');
    R(c, cx + 6, footY - 30, 4, 2, '#241812');
    // 脸
    ell(c, hc, T + 8, 6, 7, C.skin);
    R(c, hc - 6, T + 9, 1, 3, C.skinDk);
    R(c, hc + 6, T + 9, 1, 3, C.skinDk);
    // 头发（顶 + 平刘海）
    ell(c, hc, T + 2, 7, 4, C.hairBr);
    R(c, hc - 7, T + 2, 15, 3, C.hairBr);
    R(c, hc - 7, T + 5, 15, 1, '#241812');    // 平刘海下缘
    R(c, hc - 6, T, 6, 1, C.hairBrHi);
    R(c, hc + 1, T + 1, 4, 1, C.hairBrHi);
    // 五官（眉 T+7 / 眼 T+8 / 嘴 T+13）
    R(c, hc - 4, T + 7, 3, 1, C.hairBr);
    R(c, hc + 2, T + 7, 3, 1, C.hairBr);
    R(c, hc - 4, T + 8, 3, 3, C.hair);
    R(c, hc + 2, T + 8, 3, 3, C.hair);
    R(c, hc - 4, T + 8, 1, 1, '#FFFFFF');
    R(c, hc + 2, T + 8, 1, 1, '#FFFFFF');
    R(c, hc - 4, T + 10, 3, 1, C.hair);
    R(c, hc + 2, T + 10, 3, 1, C.hair);
    // 腮红
    R(c, hc - 5, T + 11, 3, 2, C.blush);
    R(c, hc + 3, T + 11, 3, 2, C.blush);
    R(c, hc - 1, T + 12, 1, 1, C.skinDk);
    // 笑
    R(c, hc - 2, T + 13, 5, 1, '#8A4A40');
    R(c, hc - 3, T + 12, 1, 1, '#8A4A40');
    R(c, hc + 3, T + 12, 1, 1, '#8A4A40');
  }

  // ============ 场景 ============
  function drawScene(c) {
    // ① 天（4 条横带，最上浅）
    R(c, 0, 0, 320, 22, C.sky1);
    R(c, 0, 22, 320, 20, C.sky2);
    R(c, 0, 42, 320, 18, C.sky3);
    R(c, 0, 60, 320, 10, C.sea1);
    // 点阵云（白 2–3px 短横，绝不画云朵形）
    const clouds = [[46, 16, 26], [120, 10, 18], [196, 20, 30], [262, 12, 14], [18, 34, 12]];
    for (const [x, y, w] of clouds) {
      R(c, x, y, w, 2, '#FFFFFF');
      R(c, x + 3, y + 2, w - 8, 2, '#F4FAFC');
      R(c, x + w, y + 1, 4, 1, '#FFFFFF');
    }
    // ② 远岛（海平线上的小块陆地）
    R(c, 226, 64, 34, 5, '#5A8A9A');
    R(c, 230, 62, 26, 3, '#6E9AA8');
    R(c, 240, 61, 14, 2, '#5A8A9A');
    R(c, 248, 60, 3, 3, '#C8463C');            // 灯塔
    R(c, 248, 59, 3, 1, '#F0F0E8');
    // ③ 海（5 层，远浅近深 + 浪线）
    // 海：8 条细层（层间插中间色，消除"梯田"硬边界）
    const seaBands = [
      [70, 6, C.sea1], [76, 5, '#74B0CC'], [81, 5, C.sea2], [86, 5, '#4A94B4'],
      [91, 5, C.sea3], [96, 6, '#2C84B8'], [102, 6, C.sea4], [108, 6, C.sea5],
    ];
    for (const b of seaBands) R(c, 0, b[0], 320, b[1], b[2]);
    // 浪线（短横 + 断续）
    for (let i = 0; i < 26; i++) {
      const x = (i * 41) % 316, y = 72 + (i * 13) % 46;
      R(c, x, y, 4 + (i % 3), 1, '#E8F4F8');
    }
    for (let i = 0; i < 12; i++) {
      const x = (i * 57) % 310, y = 104 + (i * 7) % 14;
      R(c, x, y, 6 + (i % 4), 1, '#4EA0C8');
    }
    // ④ 沙滩（3 层 + 沙粒）
    R(c, 0, 120, 320, 20, C.sand1);
    R(c, 0, 140, 320, 24, C.sand2);
    R(c, 0, 164, 320, 16, C.sand3);
    for (let i = 0; i < 40; i++) {
      const x = (i * 37) % 318, y = 124 + (i * 19) % 52;
      R(c, x, y, 1, 1, i % 3 ? C.sand4 : '#FFF4D8');
    }
    // ⑤ 左：小卖部（x 0–74）
    // 木墙
    R(c, 2, 58, 70, 74, C.w3);
    R(c, 2, 58, 70, 2, C.w5);
    R(c, 2, 58, 2, 74, C.w5);
    R(c, 70, 58, 2, 74, C.w2);
    for (let y = 62; y < 132; y += 9) R(c, 2, y, 70, 1, C.w2);   // 木纹
    // 蓝白条纹遮阳棚（斜条，前缘下垂）
    for (let i = 0; i < 7; i++) {
      const x = 0 + i * 11;
      R(c, x, 48, 11, 7, i % 2 ? C.p3 : C.blue);
    }
    R(c, 0, 55, 76, 2, C.blueDk);
    R(c, 0, 57, 76, 2, C.w2);
    for (let i = 0; i < 7; i++) {               // 棚齿
      const x = 2 + i * 11;
      R(c, x, 59, 5, 2, i % 2 ? C.p2 : C.blueLt);
    }
    // 招牌（米黄底 + 深棕字底块，字走 HD 层）
    R(c, 8, 64, 56, 12, C.p1);
    R(c, 9, 65, 54, 10, C.p2);
    R(c, 8, 64, 56, 1, C.p3);
    R(c, 8, 75, 56, 1, '#8A6A48');
    // 窗口（深色 + 内部货架）
    R(c, 8, 80, 30, 26, '#3A2A20');
    R(c, 9, 81, 28, 24, '#5A4632');
    for (let i = 0; i < 3; i++) {
      R(c, 10, 84 + i * 7, 26, 1, C.w2);
      for (let j = 0; j < 4; j++) {
        R(c, 12 + j * 6, 81 + i * 7, 3, 3, [C.red, C.green, C.orange, C.blue][(i + j) % 4]);
      }
    }
    R(c, 8, 80, 30, 2, '#2A1E16');
    // 冰柜（白 + 蓝顶）
    R(c, 42, 88, 26, 30, '#E8E8E0');
    R(c, 42, 88, 26, 4, C.blueLt);
    R(c, 42, 88, 2, 30, '#C8C8C0');
    R(c, 66, 88, 2, 30, '#B0B0A8');
    R(c, 44, 94, 22, 20, '#D0E8F0');            // 玻璃
    R(c, 46, 96, 8, 6, C.red);                  // 内部饮料
    R(c, 56, 96, 8, 6, C.green);
    R(c, 46, 104, 8, 6, C.orange);
    R(c, 56, 104, 8, 6, C.blue);
    // 台阶阴影
    R(c, 2, 130, 70, 4, '#9A7840');
    R(c, 2, 132, 70, 2, '#7A5A2E');

    // ⑥ 右：更衣室（x 262–320）
    R(c, 266, 60, 54, 72, C.blue);
    R(c, 266, 60, 54, 2, C.blueLt);
    R(c, 266, 60, 2, 72, C.blueLt);
    R(c, 318, 60, 2, 72, C.blueDk);
    for (let y = 64; y < 132; y += 8) R(c, 266, y, 54, 1, C.blueDk);  // 板材缝
    // 屋顶
    R(c, 262, 54, 58, 6, C.w4);
    R(c, 262, 54, 58, 2, C.w6);
    R(c, 262, 60, 58, 2, C.w2);
    // 红门
    R(c, 284, 86, 20, 46, C.red);
    R(c, 285, 87, 18, 44, C.redLt);
    R(c, 284, 86, 20, 2, '#8A2A24');
    R(c, 284, 130, 20, 2, '#8A2A24');
    R(c, 285, 87, 2, 44, '#E8746A');            // 门受光边
    R(c, 299, 108, 2, 2, '#F0D060');            // 门把手
    R(c, 292, 96, 4, 10, '#C8E0E8');            // 门上小窗
    R(c, 292, 96, 4, 1, '#FFFFFF');
    // 救生圈（门右侧墙上，圆环红白四段）
    ell(c, 310, 72, 6, 6, '#F0F0E8');
    ell(c, 310, 72, 3, 3, C.blue);
    R(c, 304, 69, 12, 2, C.red);
    R(c, 304, 75, 12, 2, C.red);
    R(c, 304, 69, 2, 8, C.red);
    R(c, 314, 69, 2, 8, C.red);
    R(c, 304, 69, 12, 1, '#F8B0A8');
    // 更衣室木牌（门上方，字走 HD）
    R(c, 284, 73, 26, 9, C.w2);
    R(c, 285, 74, 24, 7, C.p2);
    R(c, 284, 73, 26, 1, C.w6);
    R(c, 284, 81, 26, 1, '#6A4422');

    // ⑦ 木栈桥（中景，收窄后退，人物在其前方）
    R(c, 52, 112, 216, 10, C.w4);
    R(c, 52, 112, 216, 2, C.w6);
    R(c, 52, 114, 216, 1, '#D8B078');
    for (let x = 56; x < 264; x += 14) R(c, x, 114, 1, 8, C.w2);
    R(c, 52, 120, 216, 2, C.w1);                // 前缘
    R(c, 52, 122, 216, 2, C.w2);

    // ⑧ 人物（沙滩前景，脚 y=152，身高 54 = 画面 30%）
    boy(c, 140, 152, { look: 0, hold: true });
    girl(c, 168, 152, { look: 0, hold: true });
    // 交握的手（两人之间：男主指尖 150–154 / 女主指尖 157–161）
    R(c, 152, 119, 8, 5, C.skin);
    R(c, 152, 119, 8, 2, C.skinLt);
    R(c, 152, 123, 8, 1, C.skinDk);
    R(c, 155, 120, 1, 4, '#A87E62');
    R(c, 158, 120, 1, 4, '#A87E62');

    // ⑨ 前景小物（地面碎屑 + 生活痕迹）
    R(c, 26, 150, 9, 4, C.orange);              // 拖鞋
    R(c, 26, 150, 9, 1, C.orangeLt);
    R(c, 40, 156, 9, 4, C.orange);
    R(c, 40, 156, 9, 1, C.orangeLt);
    R(c, 96, 154, 4, 3, '#F0E0C0');             // 贝壳
    R(c, 104, 160, 3, 3, C.red);                // 海星
    R(c, 200, 156, 5, 3, C.p3);                 // 纸袋
    R(c, 200, 156, 5, 1, '#FFFFFF');
    R(c, 236, 162, 8, 2, C.w3);                 // 木板
    R(c, 300, 150, 3, 2, '#F0E0C0');
    // 遮阳伞（右下角，只露一半）
    R(c, 302, 118, 20, 5, C.p3);
    R(c, 302, 118, 20, 2, C.red);
    R(c, 304, 123, 2, 10, C.w2);
    R(c, 310, 120, 12, 3, C.red);
    R(c, 310, 123, 12, 2, C.p3);

    // ⑩ 光效（少量，压在最后）
    // 阳光从右上打，海面反光带
    glow(c, 250, 30, 90, 60, '#FFF2C8', .10);
    for (let i = 0; i < 10; i++) {
      const x = 200 + (i * 23) % 110, y = 84 + (i * 11) % 28;
      R(c, x, y, 3 + (i % 3), 1, '#FFFFFF');
    }
    // 桥面阳光斑
    R(c, 150, 113, 26, 1, 'rgba(255,250,220,.30)');
    R(c, 196, 113, 18, 1, 'rgba(255,250,220,.24)');
    // 暗角（轻）
    c.save(); c.globalAlpha = .16; c.fillStyle = '#2A1A10';
    c.fillRect(0, 0, 320, 5); c.fillRect(0, 175, 320, 5);
    c.restore();
  }

  function T(c, s, x, y, size, col, a, ls, align, stroke) {
    c.save();
    c.globalAlpha = a == null ? 1 : a;
    c.font = `${size}px KT, XK, serif`;
    c.textAlign = align || 'left';
    c.textBaseline = 'alphabetic';
    const chars = [...s];
    let w = 0;
    for (const ch of chars) w += c.measureText(ch).width + (ls || 0);
    let cx = align === 'center' ? x - (w - (ls || 0)) / 2 : (align === 'right' ? x - (w - (ls || 0)) : x);
    for (const ch of chars) {
      const cw = c.measureText(ch).width;
      if (stroke) {
        c.fillStyle = stroke;
        for (const d of [[-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, -2], [-2, 2], [2, 2]]) c.fillText(ch, cx + d[0], y + d[1]);
      }
      c.fillStyle = col;
      c.fillText(ch, cx, y);
      cx += cw + (ls || 0);
    }
    c.restore();
  }

  window.SPEC = {
    fps: 24, duration: 4.0,
    grade: 'brightness(1.02) saturate(1.05) contrast(1.02)',
    fadeIn: .2, fadeOut: .2,
    shots: [{ t0: 0, t1: 4.0, scene: 'beach', vig: .18, draw(pc) { drawScene(pc); } }],
    subs: [],

    hud(c, W, H, t) {
      const k = W / 320;   // 像素→画面 的换算比例
      // 小卖部招牌字（写在米黄招牌块上，招牌块在 320 坐标 8–64 / 64–76）
      T(c, '海边小卖部', 36 * k, 73 * k, Math.round(7 * k), '#4A3520', 1, 0, 'center');
      T(c, '更衣室', 297 * k, 80.6 * k, Math.round(4.8 * k), '#4A3520', 1, 0, 'center');

      // 右下角照片角标（米黄小标签）
      const a = t > .5 ? Math.min(1, (t - .5) / .5) : 0;
      if (a > 0) {
        const lw = Math.round(W * 0.135), lh = Math.round(H * 0.048);
        const lx = Math.round(W - W * 0.045 - lw), ly = Math.round(H - H * 0.055 - lh);
        c.save(); c.globalAlpha = a;
        c.fillStyle = '#F0DCA8'; c.fillRect(lx, ly, lw, lh);
        c.fillStyle = '#F8F0C0'; c.fillRect(lx + 2, ly + 2, lw - 4, lh * 0.26);
        c.fillStyle = '#A08050';
        c.fillRect(lx, ly, lw, 2); c.fillRect(lx, ly + lh - 2, lw, 2);
        c.fillRect(lx, ly, 2, lh); c.fillRect(lx + lw - 2, ly, 2, lh);
        c.restore();
        T(c, '7 · 14　他的海边', lx + lw / 2, ly + lh * 0.70, Math.round(H * 0.026), '#4A3520', a, 1, 'center');
      }
    },
  };
})();
