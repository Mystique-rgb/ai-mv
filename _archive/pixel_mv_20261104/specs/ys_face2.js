// ys_face2.js — 正面半身肖像（《轨迹》规格放大版）
// 头身比 1:3.2 / 眼=深色竖块+1px 高光 / 无眉无鼻 / 1px 深色硬描边 / 无 rim light
// 结构：头 88×84，脖 22，肩 116，躯干中间是白衬衫（不留空）
(function () {
  const C = {
    bg1: '#2A2440', bg2: '#372E4C', bg3: '#463A52', bg4: '#564048',
    glowW: '#FFC888',
    hair: '#171420', hairHi: '#3E3E5E', hairHi2: '#2A2A44', hairEdge: '#0A0810',
    skin: '#E8BE96', skinDk: '#C89A72', skinLt: '#F4D0A8', skinSh: '#B08560',
    eye: '#141020', eyeHi: '#FFFFFF', mouth: '#A05856',
    coat: '#46536E', coatDk: '#313C54', coatLt: '#5C6C8A', coatSh: '#28324A',
    shirt: '#F4F4F8', shirtDk: '#D6DAE4', shirtSh: '#BEC4D4',
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

  function drawFace(c) {
    const cx = 160, E = C.edge;
    // ── 关键坐标 ──
    const HY = 14;            // 头顶
    const JW = 44;            // 半头宽（头 88）
    const FY = 96;            // 下颌
    const EYE = 52;           // 眼顶（发底 48，留 4px 额头）
    const EH = 14;            // 眼高
    const EW = 12;            // 眼宽

    // ═══ 背景 ═══
    R(c, 0, 0, 320, 58, C.bg1);
    R(c, 0, 58, 320, 38, C.bg2);
    R(c, 0, 96, 320, 42, C.bg3);
    R(c, 0, 138, 320, 42, C.bg4);
    // 右侧暖光源（层叠椭圆，不用平滑渐变）
    // 光晕：用分散的点阵代替同心圆（同心圆会变成靶心）
    for (let i = 0; i < 130; i++) {
      const a = i * 2.399;                        // 黄金角散点
      const r = 8 + Math.sqrt(i / 130) * 56;
      const x = Math.round(258 + Math.cos(a) * r);
      const y = Math.round(92 + Math.sin(a) * r * .78);
      if (x < 0 || x > 319 || y < 0 || y > 179) continue;
      const far = r > 40;
      c.save(); c.globalAlpha = far ? .10 : .17;
      R(c, x, y, 2, 1, far ? '#8A6E62' : C.glowW);
      c.restore();
    }
    ell(c, 258, 92, 24, 18, '#6A4E56');
    ell(c, 258, 92, 17, 13, '#8E6258');
    ell(c, 258, 92, 11, 8, '#B88268');
    ell(c, 258, 92, 6, 4, '#DCA884');
    // 浮尘光点
    const pts = [[42, 30], [80, 48], [112, 26], [188, 38], [222, 64], [292, 34], [302, 76], [58, 86], [130, 74], [26, 60]];
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i];
      c.save(); c.globalAlpha = .30 + (i % 3) * .14;
      R(c, x, y, 2, 2, i % 2 ? '#8A7A98' : '#C8A088');
      c.restore();
    }
    // 暗角
    c.save(); c.globalAlpha = .34;
    R(c, 0, 0, 320, 10, '#0E0A14'); R(c, 0, 170, 320, 10, '#0E0A14');
    c.globalAlpha = .26;
    R(c, 0, 0, 12, 180, '#0E0A14'); R(c, 308, 0, 12, 180, '#0E0A14');
    c.restore();

    // ═══ pass1：深色膨胀轮廓（逐段同形，绝不用大矩形）═══
    ell(c, cx, HY + 42, JW + 3, 45, E);              // 头（圆顶）
    R(c, cx - 44, HY + 20, 10, 58, E);               // 左鬓
    R(c, cx + 34, HY + 20, 10, 58, E);               // 右鬓
    R(c, cx - 14, FY - 4, 29, 18, E);                // 脖
    // 肩（梯形，从脖向两侧斜下）
    for (let i = 0; i <= 18; i++) {
      const w = 12 + Math.round(i * 2.7);            // 12 → 60（正好贴合外套）
      R(c, cx - w, FY + 12 + i, w * 2, 1, E);
    }
    R(c, cx - 60, FY + 30, 121, 60, E);

    // ═══ 后发（包脸的鬓，垂到下颌以下）═══
    R(c, cx - 43, HY + 18, 10, 62, C.hair);
    R(c, cx + 33, HY + 18, 10, 62, C.hair);
    R(c, cx - 43, HY + 74, 8, 5, C.hairEdge);
    R(c, cx - 42, HY + 79, 5, 2, C.hairEdge);
    R(c, cx + 35, HY + 74, 8, 5, C.hairEdge);
    R(c, cx + 36, HY + 79, 5, 2, C.hairEdge);
    R(c, cx - 43, HY + 18, 1, 56, C.hairHi2);        // 左鬓受光
    R(c, cx + 42, HY + 18, 1, 56, C.hairEdge);

    // ═══ 脸（上宽下窄，一次成型）═══
    R(c, cx - 34, HY + 10, 69, 52, C.skin);          // 颧骨以上
    R(c, cx - 33, HY + 62, 67, 12, C.skin);          // 下颌收 1px
    R(c, cx - 30, HY + 74, 61, 6, C.skin);           // 再收 2px
    R(c, cx - 24, HY + 80, 49, 3, C.skin);           // 下巴尖收 5px
    R(c, cx - 34, HY + 10, 2, 54, C.skinSh);         // 左脸缘暗
    R(c, cx + 33, HY + 14, 1, 44, '#EBC49C');        // 右脸缘受光（1px 极淡）

    // ═══ 顶发（圆顶 + 刘海压到眼上方）═══
    ell(c, cx, HY + 18, JW, 18, C.hair);             // 顶部圆弧（14–50）
    R(c, cx - 44, HY + 18, 89, 16, C.hair);          // 发身（32–48）
    // 刘海下缘：左低右高的斜刘海（压到眼上方 2px，不盖眼）
    R(c, cx - 44, HY + 28, 46, 4, C.hair);           // 左侧压到 46
    R(c, cx - 30, HY + 30, 30, 3, C.hair);
    R(c, cx - 2, HY + 27, 46, 4, C.hair);            // 右侧压到 45
    R(c, cx + 14, HY + 29, 30, 3, C.hair);
    // 发丝高光（2 条断弧，不是整片亮）
    R(c, cx - 30, HY + 12, 20, 2, C.hairHi);
    R(c, cx - 22, HY + 15, 12, 1, C.hairHi2);
    R(c, cx + 6, HY + 14, 14, 1, C.hairHi2);
    R(c, cx - 34, HY + 20, 3, 8, C.hairHi2);
    R(c, cx + 30, HY + 18, 5, 12, C.hairHi2);        // 右后脑透光
    R(c, cx + 26, HY + 34, 6, 3, C.hairHi2);

    // ═══ 眼（深色竖块 + 1px 高光 + 下眼睑；无眉无鼻）═══
    R(c, cx - 20, EYE, EW, EH, C.eye);               // 左眼
    R(c, cx + 8, EYE, EW, EH, C.eye);                // 右眼
    R(c, cx - 18, EYE + 2, 3, 3, C.eyeHi);           // 左高光
    R(c, cx + 10, EYE + 2, 3, 3, C.eyeHi);           // 右高光
    R(c, cx - 20, EYE + EH, EW, 2, C.skinSh);        // 左下眼睑
    R(c, cx + 8, EYE + EH, EW, 2, C.skinSh);         // 右下眼睑

    // ═══ 嘴（一条横线 + 两个嘴角点）═══
    R(c, cx - 8, HY + 68, 17, 3, C.mouth);
    R(c, cx - 10, HY + 66, 2, 2, C.mouth);
    R(c, cx + 9, HY + 66, 2, 2, C.mouth);
    R(c, cx - 6, HY + 71, 13, 2, C.skinSh);          // 下唇投影

    // ═══ 脖子 ═══
    R(c, cx - 13, FY - 2, 27, 16, C.skinDk);
    R(c, cx - 12, FY - 2, 25, 6, C.skin);
    R(c, cx - 12, FY + 5, 25, 3, '#A27450');         // 颈部投影
    R(c, cx - 13, FY - 2, 2, 14, '#AE7E56');         // 颈侧暗
    R(c, cx + 11, FY - 2, 2, 14, '#D0A47C');         // 颈侧受光

    // ═══ 躯干：外套整块 → 挖 V 领 → 填衬衫（不留任何缝）═══
    // 1) 外套整块（肩 120 宽，从肩线 112 到底）
    R(c, cx - 60, 112, 121, 68, C.coat);
    R(c, cx - 60, 112, 5, 68, C.coatLt);              // 左外缘受光
    R(c, cx + 57, 112, 4, 68, C.coatSh);              // 右外缘暗
    // 2) 肩部圆角（左上/右上各削 3 行）
    R(c, cx - 60, 112, 3, 2, C.coatSh);
    R(c, cx + 58, 112, 3, 2, C.coatSh);

    // 3) 中间衬衫（宽 53，盖在外套上）
    R(c, cx - 26, 104, 53, 76, C.shirt);
    R(c, cx - 26, 104, 3, 76, C.shirtDk);
    R(c, cx + 24, 104, 3, 76, C.shirtSh);
    // 衬衫竖纹
    R(c, cx - 18, 116, 1, 62, '#E8E8F2');
    R(c, cx + 18, 116, 1, 62, '#E8E8F2');
    R(c, cx - 1, 122, 1, 56, '#E8E8F2');

    // 4) V 领内里（脖子下方，往下收成尖）
    // V 领三角（白衬衫的尖端）+ 最上 2px 皮肤
    R(c, cx - 10, 108, 21, 2, '#C89A72');
    R(c, cx - 9, 110, 19, 4, C.shirt);
    R(c, cx - 6, 114, 13, 4, C.shirt);
    R(c, cx - 3, 118, 7, 3, C.shirt);
    R(c, cx - 9, 110, 1, 8, C.shirtSh);
    R(c, cx + 9, 110, 1, 8, C.shirtSh);

    // 5) 领片（白，压在衬衫上缘两侧）
    R(c, cx - 26, 104, 17, 8, C.shirt);
    R(c, cx + 10, 104, 17, 8, C.shirt);
    R(c, cx - 10, 104, 10, 7, C.shirt);
    R(c, cx + 1, 104, 10, 7, C.shirt);
    R(c, cx - 10, 106, 1, 5, C.shirtSh);
    R(c, cx + 11, 106, 1, 5, C.shirtSh);

    // 6) 大翻领（外套色，压在衬衫两侧，从肩垂到胸）
    R(c, cx - 34, 112, 9, 54, C.coatLt);              // 左翻领
    R(c, cx - 34, 112, 2, 54, C.coatDk);
    R(c, cx - 26, 112, 2, 54, C.coatDk);
    R(c, cx + 26, 112, 9, 54, '#4E5C78');             // 右翻领
    R(c, cx + 26, 112, 2, 54, C.coatDk);
    R(c, cx + 34, 112, 2, 54, C.coatSh);
    R(c, cx - 34, 164, 9, 2, C.coatDk);
    R(c, cx + 26, 164, 9, 2, C.coatDk);

    // 7) 肩线（从脖根向两侧斜下 3px，去直角）
    for (let i = 0; i < 20; i++) {
      const y = 114 + Math.round(i * .15);
      R(c, cx - 26 - i, y, 1, 1, C.coatLt);
      R(c, cx + 26 + i, y, 1, 1, C.coatLt);
    }
    // 8) 外套竖褶
    R(c, cx - 50, 120, 1, 56, C.coatDk);
    R(c, cx + 50, 120, 1, 56, C.coatSh);
    R(c, cx - 44, 140, 1, 36, '#3A465E');
    R(c, cx + 44, 140, 1, 36, '#3A465E');

    // ═══ 前景压暗（让脸成为唯一亮点）═══
    c.save(); c.globalAlpha = .12;
    R(c, 0, 150, 320, 30, '#0E0A14');
    c.restore();
  }

  window.SPEC = {
    fps: 24, duration: 4.0,
    grade: 'brightness(1.03) saturate(1.04) contrast(1.04)',
    fadeIn: .3, fadeOut: .3,
    shots: [{ t0: 0, t1: 4.0, scene: 'face', vig: .22, draw(pc) { drawFace(pc); } }],
    subs: [],
    hud() {},
  };
})();
