// ys_bed.js — 卧室场景图 v3（按《他的海边》拆解规格 v1）
// v3 修正：①弃用大半透明叠色，改实色分块（半透明在像素风里会糊掉色块边界）
//          ②每个物体 ≥3 层明度（亮面/中间调/暗面）
//          ③床重画为五段：木格栅床头板 / 枕头 / 头 / 白床垫边 / 分块被子 / 木床脚
//          ④她的头露出 2/3 脸，五官用强对比深色
(function () {
  const C = {
    brickDk: '#302422', brick: '#3E2E2C', brickLt: '#483733', brickHi: '#523E38',
    coolDk: '#2E2C3A', cool: '#43405A', coolLt: '#4E4A66',
    w1: '#3A2010', w2: '#4A2C16', w3: '#5A3618', w4: '#6E4422', w5: '#8A5828', w6: '#9E6630',
    p1: '#C0A478', p2: '#D8C090', p3: '#E8D09C', p4: '#F0DCA8', p5: '#F8F0C0',
    n1: '#060618', n2: '#0C0C24', n3: '#141430', n4: '#1C1C3C', n5: '#262648',
    a1: '#8A5424', a2: '#C07838', a3: '#E09A50', a4: '#F0C070', a5: '#FFE8B8',
    q1: '#33445C', q2: '#3A4E6A', q3: '#4A6080', q4: '#6A82A0', q5: '#93A8C4',
    skin: '#BE9878', skinDk: '#966E56', skinLt: '#D8B090',
    hair: '#121016', hairHi: '#2E3444',
    plant: '#2E5A3A', plantLt: '#487A50',
    cat: '#3A4A64', catLt: '#4E5E78',
    cloth: '#6E6280', clothLt: '#8A7C9E', clothHi: '#A898C8',
  };

  function pxCircle(c, cx, cy, r, col) {
    c.fillStyle = col;
    for (let dy = -r; dy <= r; dy++) {
      const w = Math.floor(Math.sqrt(r * r - dy * dy));
      c.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
    }
  }

  function ellipse(c, cx, cy, rx, ry, col) {
    c.fillStyle = col;
    for (let dy = -ry; dy <= ry; dy++) {
      const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
      c.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
    }
  }

  const FLOOR_Y = 114;

  function drawRoom(c) {
    // ═══ 1 天花板 ═══
    R(c, 0, 0, 320, 14, C.cool);
    R(c, 0, 0, 320, 3, C.coolDk);
    R(c, 0, 12, 320, 2, C.coolDk);
    for (let x = 16; x < 310; x += 32) {
      R(c, x, 5, 1, 1, C.coolLt);
      R(c, x - 1, 6, 3, 1, C.coolLt);
      R(c, x - 3, 7, 7, 1, C.coolLt);
    }

    // ═══ 2 砖墙（三段明度：上亮、中、下暗）═══
    for (let row = 0, y = 14; y < FLOOR_Y; y += 8, row++) {
      const off = row % 2 ? 10 : 0;
      const depth = y < 54 ? 0 : (y < 86 ? 1 : 2);
      const bMain = [C.brickHi, C.brick, C.brickDk][depth];
      const bLite = [C.brickLt, C.brickHi, C.brick][depth];
      const bDark = [C.brickDk, '#312422', '#2E211F'][depth];
      for (let x = -20 + off; x < 320; x += 20) {
        R(c, x, y, 20, 7, bMain);
        R(c, x, y, 20, 1, bLite);
        R(c, x, y + 7, 20, 1, bDark);
        R(c, x + 19, y, 1, 7, bDark);
      }
    }

    // ═══ 3 窗（右侧，冷光源）═══
    R(c, 226, 18, 82, 82, C.w3);
    R(c, 228, 20, 78, 78, C.w5);
    R(c, 230, 22, 74, 74, C.w2);
    R(c, 234, 26, 66, 66, C.n2);
    R(c, 234, 26, 66, 22, C.n3);
    R(c, 234, 48, 66, 22, C.n3);
    R(c, 234, 70, 66, 22, C.n4);
    R(c, 234, 80, 66, 12, C.n5);
    // 月亮
    pxCircle(c, 282, 40, 7, '#DCE4F2');
    pxCircle(c, 281, 38, 5, '#F4F8FF');
    pxCircle(c, 287, 43, 7, C.n4);
    R(c, 277, 35, 2, 2, '#FFFFFF');
    // 星
    for (const [sx, sy] of [[242, 38], [250, 52], [260, 34], [268, 60], [240, 64], [256, 68], [292, 62], [246, 76]]) {
      R(c, sx, sy, 1, 1, '#AEBAD4');
    }
    // 窗棂 1px
    R(c, 266, 26, 1, 66, C.w2);
    R(c, 234, 59, 66, 1, C.w2);
    // 窗台
    R(c, 224, 98, 86, 4, C.w5);
    R(c, 224, 98, 86, 1, C.w6);
    R(c, 224, 102, 86, 3, C.w2);
    // 窗帘
    R(c, 220, 16, 10, 84, C.cloth);
    R(c, 222, 16, 4, 84, C.clothLt);
    R(c, 224, 16, 2, 84, C.clothHi);
    R(c, 220, 16, 10, 3, '#4E4460');
    R(c, 304, 16, 10, 84, C.cloth);
    R(c, 306, 16, 4, 84, C.clothLt);
    R(c, 308, 16, 2, 84, C.clothHi);
    R(c, 304, 16, 10, 3, '#4E4460');
    // 窗台盆栽
    R(c, 238, 90, 10, 8, C.w4);
    R(c, 238, 90, 10, 1, C.w6);
    R(c, 240, 84, 7, 6, C.plant);
    R(c, 239, 82, 4, 3, C.plantLt);

    // ═══ 4 海报 + 串灯 ═══
    R(c, 180, 18, 44, 34, C.w2);
    R(c, 182, 20, 40, 30, C.p5);
    R(c, 184, 22, 36, 22, '#2E5E7A');
    R(c, 184, 22, 36, 7, '#6E96B0');
    R(c, 184, 29, 36, 1, '#A8C4CE');
    R(c, 188, 35, 14, 7, '#8A5A30');
    R(c, 184, 42, 36, 2, '#C8B080');
    R(c, 190, 24, 3, 3, '#E8EEF8');
    R(c, 206, 38, 1, 4, '#3A2010');
    // 串灯
    const lamps = ['#D08A40', '#B04038', '#4A7A54', '#8A7C9E', '#E0B060'];
    for (let i = 0; i < 14; i++) {
      const x = 6 + i * 23;
      const sag = Math.round(Math.sin((i / 13) * Math.PI) * 4);
      const y = 14 + sag;
      R(c, x, 11, 1, 1, '#3A2C2A');
      R(c, x - 1, y, 3, 1, '#3A2C2A');
      R(c, x, y + 1, 2, 2, lamps[i % 5]);
      R(c, x, y + 1, 1, 1, '#FFE8B8');
    }

    // ═══ 5 地板 ═══
    R(c, 0, FLOOR_Y, 320, 180 - FLOOR_Y, C.w5);
    R(c, 0, FLOOR_Y, 320, 20, C.w6);
    for (let y = FLOOR_Y + 4; y < 180; y += 11) R(c, 0, y, 320, 1, C.w2);
    for (let i = 0; i < 7; i++) R(c, 22 + i * 44, FLOOR_Y + 4 + (i % 2) * 11, 1, 10, C.w2);
    R(c, 0, 140, 320, 12, C.w4);
    R(c, 0, 152, 320, 14, C.w3);
    R(c, 0, 166, 320, 14, C.w2);
    R(c, 0, FLOOR_Y, 320, 3, C.w2);

    // ═══ 6 书架 ═══
    R(c, 174, 46, 52, FLOOR_Y - 46, C.w3);
    R(c, 176, 48, 48, FLOOR_Y - 50, C.w1);
    R(c, 174, 46, 52, 2, C.w5);
    R(c, 174, 46, 2, FLOOR_Y - 46, C.w5);
    for (let i = 0; i < 4; i++) {
      const sy = 52 + i * 15;
      R(c, 176, sy + 13, 48, 2, C.w4);
      R(c, 176, sy + 13, 48, 1, C.w6);
      let bx = 177;
      const books = [['#6E4646', 3], ['#9C8864', 3], ['#445C70', 3], ['#7A5E3E', 4], ['#544256', 3]];
      for (let b = 0; b < 6 && bx < 222; b++) {
        const bs = books[(i * 2 + b) % books.length];
        const hh = 9 + ((i + b) % 3);
        R(c, bx, sy + 13 - hh, bs[1], hh, bs[0]);
        R(c, bx, sy + 13 - hh, bs[1], 1, 'rgba(255,255,255,.14)');
        bx += bs[1] + 1;
      }
    }

    // ═══ 7 床 ═══
    // ① 床头板：木格栅
    R(c, 12, 66, 128, 32, C.w4);
    R(c, 12, 66, 128, 2, C.w6);
    R(c, 12, 66, 2, 32, C.w6);
    R(c, 138, 66, 2, 32, C.w2);
    for (let i = 0; i < 5; i++) {
      const gx = 18 + i * 25;
      R(c, gx, 70, 21, 22, C.w2);
      R(c, gx + 1, 71, 19, 20, C.w3);
      R(c, gx + 1, 71, 19, 2, C.w5);
      R(c, gx, 70, 21, 1, C.w1);
    }
    R(c, 12, 96, 128, 3, C.w1);
    // ② 枕头
    R(c, 18, 84, 56, 14, C.p3);
    R(c, 19, 85, 54, 4, C.p5);
    R(c, 18, 96, 56, 2, C.p1);
    R(c, 46, 87, 26, 10, C.p4);
    R(c, 46, 87, 26, 3, C.p5);
    // ③ 她的头（侧睡朝右）：发团 → 整椭圆脸 → 刘海 → 五官（顺序决定脸不被切碎）
    ellipse(c, 36, 89, 11, 11, C.hair);       // 后脑发团
    R(c, 24, 86, 14, 12, C.hair);             // 发铺在枕上
    R(c, 26, 97, 12, 3, C.hair);              // 发尾
    ellipse(c, 49, 91, 9, 10, C.skin);        // 脸（整体椭圆，一次成型）
    R(c, 56, 89, 2, 3, C.skin);               // 鼻梁
    R(c, 57, 92, 1, 2, C.skinLt);             // 鼻尖
    R(c, 46, 99, 9, 3, C.skin);               // 下巴
    R(c, 45, 101, 7, 1, C.skinDk);
    R(c, 41, 79, 18, 5, C.hair);              // 刘海（只压额头上部）
    R(c, 41, 83, 5, 3, C.hair);
    R(c, 43, 86, 3, 8, C.hair);               // 鬓角（盖脸左缘）
    R(c, 30, 79, 9, 2, C.hairHi);             // 发丝高光
    R(c, 42, 80, 4, 1, C.hairHi);
    // 五官（一横一竖，位置贴着椭圆重心）
    R(c, 50, 90, 7, 1, '#241610');            // 闭眼（长一点）
    R(c, 57, 91, 1, 1, '#241610');            // 外眼角下垂
    R(c, 50, 86, 4, 1, '#3A2818');            // 眉（内端）
    R(c, 54, 87, 1, 1, '#3A2818');            // 眉（外端下压，避免像等号）
    R(c, 54, 94, 4, 1, '#7E4640');            // 嘴
    R(c, 47, 93, 3, 1, '#B0686E');            // 腮红
    R(c, 52, 97, 5, 1, C.skinDk);             // 下颌
    R(c, 45, 88, 2, 4, C.skinDk);             // 耳
    // ④ 床垫白边
    R(c, 12, 96, 128, 3, C.p2);
    R(c, 12, 96, 128, 1, C.p3);
    // ⑤ 被子
    R(c, 14, 103, 126, 24, C.q3);
    R(c, 14, 103, 126, 7, C.q4);
    R(c, 30, 101, 72, 5, C.q5);
    R(c, 36, 99, 56, 3, C.q5);
    R(c, 40, 110, 3, 15, C.q2);
    R(c, 76, 108, 3, 17, C.q2);
    R(c, 112, 110, 3, 15, C.q2);
    R(c, 12, 103, 3, 24, C.q2);
    R(c, 139, 103, 3, 24, C.q2);
    R(c, 14, 124, 126, 3, C.q1);
    // 手
    R(c, 74, 99, 12, 5, C.p4);
    R(c, 74, 99, 12, 1, C.p5);
    R(c, 85, 100, 6, 4, C.skin);
    R(c, 85, 100, 6, 1, C.skinLt);
    // ⑥ 床脚板
    R(c, 12, 129, 126, 7, C.w4);
    R(c, 12, 129, 126, 2, C.w6);
    R(c, 12, 135, 126, 2, C.w1);
    // 床尾外套
    R(c, 104, 118, 22, 11, C.clothLt);
    R(c, 104, 118, 22, 2, C.clothHi);
    R(c, 104, 127, 22, 2, C.cloth);

    // ═══ 8 床头柜 + 台灯 ═══
    R(c, 146, 94, 28, 36, C.w4);
    R(c, 146, 94, 28, 3, C.w6);
    R(c, 147, 97, 2, 33, C.w5);
    R(c, 172, 97, 2, 33, C.w2);
    R(c, 148, 112, 24, 1, C.w2);
    R(c, 156, 106, 8, 2, C.w6);
    R(c, 148, 127, 24, 3, C.w1);
    R(c, 148, 116, 24, 10, C.w3);
    // 台灯
    R(c, 149, 72, 20, 11, C.a4);
    R(c, 150, 73, 18, 4, C.a5);
    R(c, 149, 81, 20, 2, C.a2);
    R(c, 158, 83, 2, 10, C.w2);
    R(c, 154, 92, 10, 2, C.w2);
    // 闹钟
    R(c, 148, 99, 11, 8, '#1E1E28');
    R(c, 149, 100, 9, 5, '#8A2838');
    R(c, 150, 101, 2, 2, '#E8556D');
    R(c, 154, 101, 2, 2, '#E8556D');

    // ═══ 9 地毯 ═══
    R(c, 56, 132, 120, 30, '#241A20');
    R(c, 57, 133, 118, 28, '#4A2C38');
    R(c, 64, 138, 104, 18, '#3A2230');
    R(c, 70, 141, 92, 12, '#5A3648');
    R(c, 76, 144, 80, 6, '#462838');
    R(c, 102, 138, 30, 11, C.w5);
    R(c, 102, 138, 30, 2, C.w6);
    R(c, 104, 149, 3, 5, C.w2);
    R(c, 127, 149, 3, 5, C.w2);
    R(c, 108, 133, 8, 4, '#B0B0C0');
    R(c, 108, 133, 8, 1, '#D8D8E4');
    R(c, 119, 134, 7, 3, C.p4);
    R(c, 120, 134, 5, 1, C.p1);

    // ═══ 10 前景小物 ═══
    R(c, 14, 148, 18, 24, '#6E3A2C');
    R(c, 14, 148, 18, 2, '#8A4A38');
    R(c, 16, 152, 14, 18, '#522A20');
    R(c, 15, 134, 7, 15, C.plant);
    R(c, 23, 132, 7, 17, C.plant);
    R(c, 19, 130, 5, 6, C.plantLt);
    R(c, 13, 140, 5, 5, C.plant);
    R(c, 26, 142, 5, 5, C.plantLt);
    R(c, 18, 146, 8, 3, C.plantLt);
    // 猫窝
    R(c, 280, 152, 38, 18, '#6E5238');
    R(c, 280, 152, 38, 2, '#8A6A48');
    R(c, 282, 156, 34, 12, '#4E3A26');
    pxCircle(c, 298, 160, 9, C.cat);
    pxCircle(c, 295, 158, 5, C.catLt);
    R(c, 289, 155, 3, 3, C.cat);
    R(c, 303, 155, 3, 3, C.cat);
    R(c, 291, 162, 2, 1, '#93A8C4');
    R(c, 299, 162, 2, 1, '#93A8C4');
    R(c, 296, 165, 4, 1, C.cat);
    // 拖鞋
    R(c, 40, 158, 12, 4, C.clothLt);
    R(c, 40, 158, 12, 1, C.clothHi);
    R(c, 56, 163, 12, 4, C.clothLt);
    R(c, 56, 163, 12, 1, C.clothHi);
    // 地上散物
    const debris = [[32, 150, C.p1], [70, 168, C.w2], [92, 160, C.p4],
                    [176, 166, C.q4], [202, 172, C.p1], [242, 158, C.clothHi],
                    [258, 170, C.w2], [150, 156, C.a2]];
    for (const d of debris) R(c, d[0], d[1], 2, 1, d[2]);
    // 书堆
    R(c, 244, 138, 14, 3, '#6E4646');
    R(c, 244, 141, 12, 3, '#9C8864');
    R(c, 243, 144, 15, 3, '#445C70');
    R(c, 246, 147, 10, 2, '#7A5E3E');

    // ═══ 11 接触阴影（实色，短而硬）═══
    R(c, 12, 136, 128, 4, '#1E1208');
    R(c, 146, 130, 28, 3, '#1E1208');
    R(c, 174, 111, 52, 4, '#1E1208');
    R(c, 224, 102, 86, 3, '#1E1208');
    R(c, 56, 160, 120, 3, '#1E1208');

    // ═══ 12 光源（少量半透明，压在最后）═══
    glow(c, 159, 80, 46, 36, '#E09A50', .22);
    glow(c, 159, 82, 20, 16, '#FFE8B8', .18);
    glow(c, 266, 58, 54, 44, '#8AA0BE', .12);
    R(c, 142, 90, 8, 44, 'rgba(224,154,80,.14)');
    R(c, 96, 100, 46, 30, 'rgba(224,154,80,.10)');
    R(c, 220, 100, 26, 40, 'rgba(138,160,190,.10)');
    R(c, 226, 124, 44, 40, 'rgba(138,160,190,.08)');
    c.save(); c.globalAlpha = .12; c.fillStyle = '#1A1A38'; c.fillRect(0, 0, 320, 180); c.restore();
    c.save(); c.globalAlpha = .34; c.fillStyle = '#0A0A16';
    c.fillRect(0, 0, 320, 6); c.fillRect(0, 174, 320, 6);
    c.fillRect(0, 0, 8, 180); c.fillRect(312, 0, 8, 180);
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
        for (const dd of [[-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, -2], [-2, 2], [2, 2]]) c.fillText(ch, cx + dd[0], y + dd[1]);
      }
      c.fillStyle = col;
      c.fillText(ch, cx, y);
      cx += cw + (ls || 0);
    }
    c.restore();
  }

  window.SPEC = {
    fps: 24, duration: 4.0,
    grade: 'brightness(1.03) saturate(1.04) contrast(1.02)',
    fadeIn: .25, fadeOut: .25,
    shots: [{ t0: 0, t1: 4.0, scene: 'bed', vig: .26, draw(pc) { drawRoom(pc); } }],
    subs: [],

    hud(c, W, H, t) {
      const txt = '窗外下着雨 房间里依然很冷清';
      const size = Math.round(H * 0.040);
      const bh = Math.round(H * 0.078);
      const by = Math.round(H - H * 0.042 - bh);
      c.save();
      c.font = `${size}px KT, XK, serif`;
      let tw = 0;
      for (const ch of [...txt]) tw += c.measureText(ch).width;
      const noteW = Math.round(size * 1.35);
      const bw = Math.min(Math.round(W * 0.46), Math.round(tw + noteW + size * 1.5));
      const bx = Math.round((W - bw) / 2);
      const edge = Math.max(2, Math.round(H / 400));
      c.fillStyle = '#F8F0C0'; c.fillRect(bx, by, bw, bh);
      c.fillStyle = '#F8F8D8'; c.fillRect(bx + edge, by + edge, bw - edge * 2, bh * 0.18);
      c.fillStyle = '#A08050';
      c.fillRect(bx, by, bw, edge); c.fillRect(bx, by + bh - edge, bw, edge);
      c.fillRect(bx, by, edge, bh); c.fillRect(bx + bw - edge, by, edge, bh);
      const nx = bx + size * 0.5, ny = by + bh * 0.52, s2 = size * 0.9;
      c.fillStyle = '#C8463C';
      c.fillRect(nx + s2 * 0.32, ny - s2 * 0.62, s2 * 0.09, s2 * 0.72);
      c.fillRect(nx + s2 * 0.32, ny - s2 * 0.62, s2 * 0.40, s2 * 0.09);
      c.fillRect(nx + s2 * 0.63, ny - s2 * 0.62, s2 * 0.09, s2 * 0.56);
      c.fillRect(nx, ny + s2 * 0.02, s2 * 0.28, s2 * 0.22);
      c.restore();
      c.save(); c.globalAlpha = .26; c.fillStyle = '#101020';
      c.fillRect(bx + edge, by + bh, bw - edge * 2, edge * 2); c.restore();
      T(c, txt, Math.round(W / 2 + noteW * 0.42), by + bh * 0.68, size, '#4A3520', 1, size * 0.07, 'center');

      const a = t > .25 ? Math.min(1, (t - .25) / .45) : 0;
      if (a > 0) {
        const lw = Math.round(W * 0.175), lh = Math.round(H * 0.055);
        const lx = Math.round(W * 0.033), ly = Math.round(H * 0.048);
        c.save(); c.globalAlpha = a;
        c.fillStyle = '#E8D09C'; c.fillRect(lx, ly, lw, lh);
        c.fillStyle = '#F0DCA8'; c.fillRect(lx + edge, ly + edge, lw - edge * 2, lh * 0.2);
        c.fillStyle = '#A08050';
        c.fillRect(lx, ly, lw, edge); c.fillRect(lx, ly + lh - edge, lw, edge);
        c.fillRect(lx, ly, edge, lh); c.fillRect(lx + lw - edge, ly, edge, lh);
        c.fillStyle = '#C8463C';
        c.beginPath(); c.arc(lx + lh * 0.52, ly + lh / 2, lh * 0.20, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#E8D09C';
        c.fillRect(lx + lh * 0.45, ly + lh / 2 - lh * 0.10, lh * 0.15, lh * 0.20);
        c.restore();
        T(c, 'S1 出租屋 · 02:41', lx + lh * 0.92, ly + lh * 0.66, Math.round(H * 0.026), '#4A3520', a, 1);
      }
    },
  };
})();
