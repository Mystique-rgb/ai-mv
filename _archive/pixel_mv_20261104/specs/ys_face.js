// ys_face.js — 正面肖像（按《轨迹》实测规格放大）
// 规格：头身比 1:3.15（本图为半身肖像，头占画面 28%）/ 眼=深色块+高光点 / 无眉无鼻 / 1px 深色硬描边 / 无 rim light
(function () {
  const C = {
    // 背景：傍晚紫蓝
    bg1: '#2A2440', bg2: '#3A3050', bg3: '#4A3A56', bg4: '#5A4048',
    glowW: '#FFC888',
    // 头发（近黑带紫调）
    hair: '#171420', hairHi: '#3A3A58', hairHi2: '#262640', hairEdge: '#0A0810',
    // 皮肤
    skin: '#E8BE96', skinDk: '#C89A72', skinLt: '#F4D0A8', skinSh: '#B08560',
    // 眼 / 嘴 / 腮红
    eye: '#141020', eyeHi: '#FFFFFF', mouth: '#A85A58', blush: '#D08A88',
    // 外套（蓝灰）
    coat: '#46536E', coatDk: '#313C54', coatLt: '#5A6A88',
    // 白衬衫
    shirt: '#F4F4F8', shirtDk: '#D2D6E2', shirtSh: '#BEC4D4',
    // 描边
    edge: '#100C18',
  };

  function ell(c, cx, cy, rx, ry, col) {
    c.fillStyle = col;
    for (let dy = -ry; dy <= ry; dy++) {
      const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
      if (w > 0) c.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
    }
  }
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

  // ══════════════════════════════════════════════
  // 正面肖像：头 54×50（cx=160, y 18–68），肩宽 96
  // ══════════════════════════════════════════════
  function drawFace(c) {
    const cx = 160, E = C.edge;
    const HY = 18;          // 头顶
    const FY = 68;          // 下颌
    const EYE = 42;         // 眼线

    // ── 背景 ──
    R(c, 0, 0, 320, 62, C.bg1);
    R(c, 0, 62, 320, 40, C.bg2);
    R(c, 0, 102, 320, 38, C.bg3);
    R(c, 0, 140, 320, 40, C.bg4);
    // 远处光斑（右侧暖光，径向 dither 感）
    for (let r = 62; r > 4; r -= 6) {
      c.save(); c.globalAlpha = .05;
      ell(c, 250, 96, r, r * .78, C.glowW);
      c.restore();
    }
    ell(c, 250, 96, 26, 18, '#7A5A5E');
    ell(c, 250, 96, 16, 11, '#A8786A');
    ell(c, 250, 96, 8, 6, '#D8A078');
    // 散落光点
    const pts = [[46, 34], [78, 52], [110, 28], [196, 40], [226, 66], [284, 38], [300, 74], [62, 88], [126, 76]];
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i];
      c.save(); c.globalAlpha = .35 + (i % 3) * .12;
      R(c, x, y, 2, 2, i % 2 ? '#8A7A98' : '#C8A088');
      c.restore();
    }
    // 暗角
    c.save(); c.globalAlpha = .30; R(c, 0, 0, 320, 12, '#100C18'); R(c, 0, 168, 320, 12, '#100C18'); c.restore();
    c.save(); c.globalAlpha = .22; R(c, 0, 0, 14, 180, '#100C18'); R(c, 306, 0, 14, 180, '#100C18'); c.restore();

    // ── pass1：深色膨胀轮廓（逐段同形，禁止整体矩形）──
    ell(c, cx, HY + 24, 29, 26, E);              // 头（圆顶）
    R(c, cx - 27, HY + 30, 7, 26, E);            // 左鬓轮廓
    R(c, cx + 21, HY + 30, 7, 26, E);            // 右鬓轮廓
    R(c, cx - 7, FY - 4, 15, 12, E);             // 脖子
    R(c, cx - 49, 74, 99, 110, E);               // 肩与躯干

    // ── 后发（包脸）──
    R(c, cx - 26, HY + 16, 7, 34, C.hair);       // 左鬓（垂到下颌）
    R(c, cx + 20, HY + 16, 7, 34, C.hair);       // 右鬓
    R(c, cx - 26, HY + 46, 7, 4, C.hairEdge);    // 左鬓发梢
    R(c, cx + 20, HY + 46, 7, 4, C.hairEdge);

    // ── 脸（上宽下窄）──
    R(c, cx - 20, HY + 8, 41, 30, C.skin);       // 颧骨以上
    R(c, cx - 19, HY + 38, 39, 8, C.skin);       // 下颌收 1px
    R(c, cx - 16, HY + 46, 33, 4, C.skin);       // 下巴收 3px
    R(c, cx - 12, HY + 49, 25, 1, C.skinDk);     // 下巴底

    // ── 顶发（圆顶 + 刘海，压住额头）──
    ell(c, cx, HY + 16, 27, 17, C.hair);
    R(c, cx - 27, HY + 16, 55, 14, C.hair);
    R(c, cx - 24, HY + 30, 49, 2, C.hair);       // 刘海下缘（略斜）
    R(c, cx - 24, HY + 30, 22, 1, C.hair);       // 左刘海尖（低 1px）
    R(c, cx + 6, HY + 29, 18, 1, C.hair);        // 右刘海尖（高 1px）
    R(c, cx - 3, HY + 31, 8, 2, C.hair);         // 中分一撮
    // 发丝高光（左上弧 2 条断线）
    R(c, cx - 20, HY + 8, 12, 1, C.hairHi);
    R(c, cx - 14, HY + 11, 7, 1, C.hairHi2);
    R(c, cx + 4, HY + 10, 8, 1, C.hairHi2);
    R(c, cx - 22, HY + 15, 3, 4, C.hairHi2);
    R(c, cx + 18, HY + 13, 4, 8, C.hairHi2);     // 右后脑透光

    // ── 眼（深色块 + 1px 白高光；参考唯一的五官）──
    R(c, cx - 15, EYE, 7, 8, C.eye);             // 左眼
    R(c, cx + 8, EYE, 7, 8, C.eye);              // 右眼
    R(c, cx - 14, EYE + 1, 2, 2, C.eyeHi);       // 左眼高光
    R(c, cx + 9, EYE + 1, 2, 2, C.eyeHi);        // 右眼高光
    R(c, cx - 15, EYE + 6, 7, 1, C.skinSh);      // 下眼睑
    R(c, cx + 8, EYE + 6, 7, 1, C.skinSh);

    // ── 嘴（一条 8px 横线 + 嘴角）──
    R(c, cx - 4, HY + 42, 8, 2, C.mouth);
    R(c, cx - 5, HY + 41, 1, 1, C.mouth);
    R(c, cx + 4, HY + 41, 1, 1, C.mouth);

    // ── 腮红（只她加，他这块留白）──
    // （这张是「他」，不加腮红）

    // ── 下颌 / 脸颊受光 ──
    R(c, cx - 20, HY + 38, 1, 9, C.skinSh);      // 左脸缘暗
    R(c, cx + 20, HY + 20, 1, 24, C.skinLt);     // 右脸缘受光
    R(c, cx - 18, HY + 47, 14, 1, C.skinDk);     // 下颌左
    R(c, cx + 4, HY + 47, 15, 1, C.skinDk);      // 下颌右

    // ── 脖子 ──
    R(c, cx - 6, FY - 6, 13, 10, C.skinDk);
    R(c, cx - 5, FY - 6, 11, 4, C.skin);
    R(c, cx - 5, FY + 2, 11, 2, '#9A6E48');      // 颈部投影

    // ── 白衬衫 V 领 ──
    R(c, cx - 22, 76, 45, 30, C.shirt);
    R(c, cx - 22, 76, 3, 30, C.shirtDk);
    R(c, cx + 20, 76, 3, 30, C.shirtDk);
    // V 形领口（挖掉中间，露出脖子下方）
    R(c, cx - 9, 76, 19, 4, C.skinSh);
    R(c, cx - 7, 80, 15, 3, C.skinSh);
    R(c, cx - 5, 83, 11, 2, C.skinSh);
    // 领片
    R(c, cx - 22, 76, 13, 3, C.shirt);
    R(c, cx + 10, 76, 13, 3, C.shirt);
    R(c, cx - 10, 78, 9, 2, C.shirt);
    R(c, cx + 2, 78, 9, 2, C.shirt);
    R(c, cx - 10, 78, 1, 3, C.shirtSh);
    R(c, cx + 10, 78, 1, 3, C.shirtSh);
    // 衬衫竖纹（淡）
    R(c, cx - 16, 82, 1, 24, '#E8E8F2');
    R(c, cx + 16, 82, 1, 24, '#E8E8F2');

    // ── 外套（两片，敞开，肩线在 y=94）──
    // 左片
    R(c, cx - 48, 94, 36, 86, C.coat);
    R(c, cx - 48, 94, 4, 86, C.coatLt);          // 左外缘受光
    R(c, cx - 14, 94, 2, 86, C.coatDk);          // 左内襟（压住衬衫）
    // 右片
    R(c, cx + 12, 94, 36, 86, C.coat);
    R(c, cx + 44, 94, 4, 86, C.coatDk);          // 右外缘暗
    R(c, cx + 12, 94, 2, 86, C.coatDk);          // 右内襟
    // 肩线
    R(c, cx - 48, 94, 96, 1, C.coatLt);
    // 大翻领（参考：外套翻领压在衬衫上）
    R(c, cx - 24, 96, 12, 30, C.coatLt);         // 左翻领
    R(c, cx - 24, 96, 2, 30, C.coatDk);
    R(c, cx - 24, 124, 12, 2, C.coatDk);
    R(c, cx + 13, 96, 12, 30, C.coat);           // 右翻领
    R(c, cx + 23, 96, 2, 30, C.coatDk);
    R(c, cx + 13, 124, 12, 2, C.coatDk);
    // 外套竖褶
    R(c, cx - 38, 100, 1, 40, C.coatDk);
    R(c, cx + 37, 100, 1, 40, C.coatDk);
    R(c, cx - 30, 132, 1, 30, '#3A465E');
    R(c, cx + 29, 132, 1, 30, '#3A465E');
    // 肩部圆角（去掉直角）
    R(c, cx - 48, 94, 2, 2, C.bg4);              // 占位，后面被背景暗角压
    // 袖（两侧下垂，只露上臂）
    R(c, cx - 48, 96, 7, 84, C.coatDk);
    R(c, cx + 41, 96, 7, 84, C.coatDk);
    R(c, cx - 48, 96, 2, 84, C.coat);
    R(c, cx + 46, 96, 2, 84, '#3A465E');
  }

  window.SPEC = {
    fps: 24, duration: 4.0,
    grade: 'brightness(1.02) saturate(1.04) contrast(1.03)',
    fadeIn: .3, fadeOut: .3,
    shots: [{ t0: 0, t1: 4.0, scene: 'face', vig: .22, draw(pc) { drawFace(pc); } }],
    subs: [],
    hud() {},
  };
})();
