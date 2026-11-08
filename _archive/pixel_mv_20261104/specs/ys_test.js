// specs/ys_test.js —《于是》裁定样张：他 / 她 / 出租屋 / 车站
// 色板依据：分镜词 v2 第四节；角色依据：第三节
if (typeof PAL !== 'undefined') Object.assign(PAL, {
  ink: '#0E1220', night: '#1A2133', navy: '#2A3450', slate: '#46527A',
  dusk: '#3A4763', haze: '#7899B4', wall: '#1A2133', wallDk: '#12182A',
  floor: '#232C44', floorDk: '#161D30',
  gold: '#FFD166', rose: '#E8556D', pale: '#B9A9D6', paper: '#F3E7D3',
  teal: '#5FD3C4', mint: '#9AD6C4', blush: '#E88A90',
  skin: '#F0B892', skinDk: '#C2866A', skinMid: '#E8A472', peach: '#F7C9A8',
  steel: '#2A3450',
});
const EZo = x => 1 - Math.pow(1 - x, 3);

// ---------- HD 文字（样张标签用） ----------
function txt(c, s, x, y, size, col, alpha, ls, align) {
  c.save();
  c.globalAlpha = alpha == null ? 1 : alpha;
  c.font = `${size}px KT, XK, serif`;
  c.fillStyle = col;
  c.textAlign = align || 'left';
  c.textBaseline = 'alphabetic';
  if (!ls) { c.fillText(s, x, y); c.restore(); return; }
  const chars = [...s];
  let w = 0; for (const ch of chars) w += c.measureText(ch).width + ls;
  let cx = align === 'center' ? x - (w - ls) / 2 : (align === 'right' ? x - (w - ls) : x);
  for (const ch of chars) { const cw = c.measureText(ch).width; c.fillText(ch, cx, y); cx += cw + ls; }
  c.restore();
}

// ---------- 手柄（他右手常握） ----------
function gamepad(c, cx, cy, S, led) {
  const w = 5 * S, h = 2.4 * S;
  R(c, cx - w / 2, cy - h / 2, w, h, '#1B2436');
  R(c, cx - w / 2, cy - h / 2, w, 1, '#31415E');
  R(c, cx - w / 2 + S, cy - S / 2, S, S, '#0E1220');
  R(c, cx + w / 2 - 2 * S, cy - S / 2, S, S, '#0E1220');
  R(c, cx + w / 2 - 1.2 * S, cy - h / 2 - S, S, S, led || '#5A2A28');   // LED
}

// ---------- 轮廓光（暖白，替代 rig 自带的 haze 冷光） ----------
function warmRim(c, cx, footY, S, dy = 0) {
  const y = v => (footY - v * S) + dy * S;
  R(c, cx + 4 * S, y(39), 2 * S, S, '#E9DCC0');
  R(c, cx + 5 * S, y(38), S, S, '#E9DCC0');
  R(c, cx + 4 * S, y(32), S, S, '#C9BFA8');
  R(c, cx + 4 * S, y(27), S, 2 * S, '#3E4C6E');
  R(c, cx + 5 * S, y(26), S, S, '#3E4C6E');
}

// ---------- 他：深蓝卫衣 + 暖白内搭 + 短发 + 右手手柄 ----------
function him(c, cx, footY, S, o = {}) {
  figure(c, cx, footY, S, { sex: 'm', rim: false, ...o, col: { coat: 'navy', coatDk: 'ink', inner: 'paper', pants: 'slate', ...(o.col || {}) } });
  if (o.view !== 'back') warmRim(c, cx, footY, S, o.pose === 'sit' ? (o.dy || 0) + 16 : (o.dy || 0));
  if (o.pad !== false) {
    const dy = o.pose === 'sit' ? 10 : 0;
    gamepad(c, cx + 7 * S, footY - (13 + dy) * S, Math.max(1, S - 1), o.led);
  }
}

// ---------- 她：黑长直 + 淡紫外套 + 玫瑰红内搭 + 耳后金色星星发夹 ----------
function her(c, cx, footY, S, o = {}) {
  figure(c, cx, footY, S, { sex: 'f', rim: false, ...o, col: { coat: 'pale', coatDk: 'slate', inner: 'rose', ...(o.col || {}) } });
  if (o.view !== 'back') warmRim(c, cx, footY, S, o.pose === 'sit' ? (o.dy || 0) + 16 : (o.dy || 0));
  if (o.pin !== false) {
    // 星星发夹：左侧耳后，十字小星（总宽 3 rig px，1rig px = S）
    const sx = o.view === 'back' ? cx + 6 * S : cx - 6 * S;
    const sy = footY - 31 * S;
    R(c, sx - S, sy, 3 * S, S, PAL.gold);
    R(c, sx, sy - S, S, 3 * S, PAL.gold);
    R(c, sx, sy, S, S, '#FFF2C8');
    glow(c, sx, sy, 4 * S, 4 * S, PAL.gold, .30);
  }
}

// ---------- 她的正脸（大块像素，特写用） ----------
// px = 像素块尺寸；state: 'open'|'smile'|'closed'|'talk'
function faceHer(c, x, y, px, o = {}) {
  const st = o.state || 'open';
  const skinC = PAL.peach, skinD = PAL.skin, hairC = '#10141F', hairDk = PAL.ink;
  const W = 12 * px, H = 14 * px;
  // 头发外轮廓（黑长直，中分）
  R(c, x - px, y - px, W + 2 * px, 6 * px, hairC);
  R(c, x - px, y - px, 3 * px, H + 3 * px, hairC);            // 左发帘+侧发
  R(c, x + W - 2 * px, y - px, 3 * px, H + 3 * px, hairC);    // 右侧发
  R(c, x + 5 * px, y - px, 2 * px, 3 * px, hairC);            // 中分缝
  // 脸
  R(c, x + 2 * px, y + 3 * px, 8 * px, 9 * px, skinC);
  R(c, x + 2 * px, y + 3 * px, 1 * px, 9 * px, skinD);        // 侧影
  // 刘海盖额
  R(c, x + 2 * px, y + 3 * px, 8 * px, 2 * px, hairC);
  R(c, x + 3 * px, y + 5 * px, 1 * px, 2 * px, hairC);
  R(c, x + 8 * px, y + 5 * px, 1 * px, 2 * px, hairC);
  // 眼（垂眼）
  if (st === 'closed') {
    R(c, x + 3 * px, y + 8 * px, 2 * px, px, hairDk);
    R(c, x + 7 * px, y + 8 * px, 2 * px, px, hairDk);
  } else if (st === 'smile') {
    R(c, x + 3 * px, y + 8 * px, 2 * px, px, hairDk);
    R(c, x + 7 * px, y + 7 * px, 2 * px, px, hairDk);
    R(c, x + 7 * px, y + 8 * px, 2 * px, px, skinD);
  } else {
    R(c, x + 3 * px, y + 7 * px, 2 * px, 2 * px, hairDk);
    R(c, x + 7 * px, y + 7 * px, 2 * px, 2 * px, hairDk);
    R(c, x + 3 * px, y + 7 * px, px, px, PAL.paper);          // 高光
    R(c, x + 7 * px, y + 7 * px, px, px, PAL.paper);
    R(c, x + 3 * px, y + 9 * px, 2 * px, px, skinD);          // 垂眼睑
    R(c, x + 7 * px, y + 9 * px, 2 * px, px, skinD);
  }
  // 腮红
  R(c, x + 2 * px, y + 9 * px, px, px, PAL.blush);
  R(c, x + 9 * px, y + 9 * px, px, px, PAL.blush);
  // 嘴
  if (st === 'smile') { R(c, x + 5 * px, y + 10 * px, 2 * px, px, PAL.ink); R(c, x + 5 * px, y + 9 * px, px, px, PAL.ink); R(c, x + 6 * px, y + 9 * px, px, px, PAL.ink); }
  else if (st === 'talk') { R(c, x + 5 * px, y + 10 * px, 2 * px, 2 * px, PAL.rose); }
  else if (st === 'closed') { R(c, x + 5 * px, y + 11 * px, 2 * px, px, PAL.skinDk); }
  else { R(c, x + 5 * px, y + 10 * px, 2 * px, px, PAL.skinDk); }
  // 耳后金色星星（左侧 = 画面左）
  R(c, x - px, y + 6 * px, px, px, PAL.gold);
  R(c, x - px, y + 5 * px, px, px, PAL.gold);
  // 肩与领口（淡紫外套 + 玫瑰红内搭锚点）
  R(c, x - 2 * px, y + 13 * px, W + 4 * px, 6 * px, PAL.pale);
  R(c, x + 3 * px, y + 13 * px, 6 * px, 6 * px, PAL.rose);
  R(c, x - 2 * px, y + 13 * px, W + 4 * px, px, PAL.slate);
}

// ============================================================
//  场景 1 · room 出租屋（窗 + 雨 + 台灯）
// ============================================================
function sc_room(c, t, o = {}) {
  vgrad(c, 0, 0, 320, 180, PAL.night, PAL.navy);
  // 右墙
  R(c, 236, 0, 84, 180, PAL.wallDk);
  R(c, 236, 0, 2, 180, PAL.ink);
  dith(c, 238, 0, 82, 180, PAL.wallDk, PAL.wall, .5);
  // 地板
  R(c, 0, 156, 320, 24, PAL.floorDk);
  R(c, 0, 155, 320, 2, PAL.floor);
  // 窗（左 2/3）：框 + 玻璃 + 雨
  const wx = 16, wy = 18, ww = 190, wh = 118;
  R(c, wx - 4, wy - 4, ww + 8, wh + 8, PAL.ink);
  vgrad(c, wx, wy, ww, wh, '#141B2E', '#1E2A44');
  // 远景楼群（玻璃外）
  for (let i = 0; i < 7; i++) {
    const bx = wx + 6 + i * 26, bh = 30 + ((i * 37) % 40);
    R(c, bx, wy + wh - bh, 18, bh, '#171F36');
    const rnd = k => Math.abs(Math.sin(i * 12.9 + k * 78.2) * 43758) % 1;
    for (let yy = wy + wh - bh + 4; yy < wy + wh - 4; yy += 6)
      for (let xx = bx + 3; xx < bx + 15; xx += 6)
        if (rnd(xx + yy) < .18) R(c, xx, yy, 2, 3, PAL.haze);
  }
  // 玻璃雨痕（1px 缓慢下滑）
  for (let i = 0; i < 14; i++) {
    const rx = wx + 8 + (i * 13) % (ww - 20);
    const len = 8 + (i * 7) % 16;
    const ry = wy + 6 + ((t * 9 + i * 31) % (wh - len));
    c.save(); c.globalAlpha = .5; R(c, rx, ry, 1, len, PAL.haze); c.restore();
    R(c, rx, ry + len, 1, 2, PAL.mint);
  }
  // 窗框十字
  R(c, wx + ww / 2 - 1, wy, 2, wh, PAL.ink);
  R(c, wx, wy + wh / 2 - 1, ww, 2, PAL.ink);
  // 台灯（右墙，唯一暖光源）
  R(c, 268, 96, 2, 60, PAL.slate);
  R(c, 258, 84, 22, 5, PAL.slate);
  R(c, 262, 89, 14, 8, PAL.gold);
  R(c, 265, 91, 8, 4, PAL.paper);
  glow(c, 269, 92, 40, 34, PAL.gold, .40);
  glow(c, 269, 96, 18, 60, PAL.gold, .16);
  // 窗台（他坐着）
  R(c, wx - 6, wy + wh, ww + 12, 5, PAL.slate);
  R(c, wx - 6, wy + wh, ww + 12, 1, PAL.haze);
  // 冷调统一压暗
  shadeRect(c, 0, 0, 320, 180, .10);
}

// ============================================================
//  场景 2 · gate 车站站台（顶棚 + 大钟 + 闸机 + 长椅）
// ============================================================
function sc_gate(c, t, o = {}) {
  vgrad(c, 0, 0, 320, 180, PAL.night, '#141B2E');
  // 远景轨道
  R(c, 0, 118, 320, 62, '#10182B');
  for (let i = 0; i < 2; i++) R(c, 0, 126 + i * 22, 320, 2, '#1C2842');
  // 对面站台灯柱
  R(c, 40, 40, 2, 80, PAL.slate); R(c, 36, 38, 10, 3, PAL.slate);
  R(c, 38, 42, 6, 3, PAL.haze);
  R(c, 250, 40, 2, 80, PAL.slate); R(c, 246, 38, 10, 3, PAL.slate);
  R(c, 248, 42, 6, 3, PAL.haze);
  // 顶棚
  R(c, 0, 0, 320, 22, PAL.wallDk);
  R(c, 0, 22, 320, 3, PAL.slate);
  for (let x = 6; x < 320; x += 14) R(c, x, 25, 2, 4, PAL.ink);
  // 顶棚滴水
  if (!o.dry) { const dy = 26 + ((t * 40) % 60); R(c, 88, dy, 1, 2, PAL.mint); }
  // 支柱
  R(c, 30, 25, 4, 118, PAL.navy); R(c, 290, 25, 4, 118, PAL.navy);
  // 大钟（外框，指针/数字走 HD 层；放右上避开人物动线）
  R(c, 216, 32, 64, 26, PAL.ink);
  R(c, 218, 34, 60, 22, '#0B1120');
  R(c, 218, 34, 60, 1, PAL.slate);
  // 闸机 ×3（加高到人体腰胸高度）
  for (let i = 0; i < 3; i++) {
    const gx = 118 + i * 34;
    R(c, gx, 88, 26, 8, PAL.slate);
    R(c, gx + 1, 96, 24, 40, '#18203A');
    R(c, gx + 2, 96, 2, 40, PAL.slate);
    R(c, gx + 22, 96, 2, 40, PAL.slate);
    R(c, gx + 4, 92, 3, 3, o.gateGlow ? PAL.teal : '#31415E');  // 状态灯
    // 小翼
    const wing = o.gateOpen ? 10 : 4;
    R(c, gx + 4, 104, wing, 2, PAL.haze);
    R(c, gx + 20 - wing + 2, 114, wing, 2, PAL.haze);
  }
  // 安全黄线
  R(c, 0, 134, 320, 3, '#6A5526');
  R(c, 0, 134, 320, 1, PAL.gold);
  // 站台地面
  R(c, 0, 137, 320, 43, PAL.navy);
  dith(c, 0, 137, 320, 6, PAL.navy, PAL.night, .4);
  // 长椅（左侧）
  R(c, 24, 128, 56, 6, PAL.slate);
  R(c, 26, 134, 4, 18, PAL.ink); R(c, 72, 134, 4, 18, PAL.ink);
  R(c, 24, 128, 56, 1, PAL.haze);
  // 站牌
  R(c, 196, 60, 2, 76, PAL.slate);
  R(c, 190, 60, 14, 10, '#18203A');
  R(c, 192, 62, 10, 6, PAL.teal);
  shadeRect(c, 0, 0, 320, 180, .08);
}

// ============================================================
//  4 个样张镜头
// ============================================================
window.SPEC = {
  fps: 24, duration: 8.2,
  grade: 'brightness(1.14) saturate(1.10) contrast(1.05)',

  shots: [
    // --- 人物图 1 · 他（雨夜站台灯下，正面，握手柄） ---
    { t0: 0, t1: 2.05, scene: 'char', cam: false, vig: .42,
      draw(pc, lt) {
        vgrad(pc, 0, 0, 320, 180, PAL.ink, PAL.navy);
        // 地面
        R(pc, 0, 150, 320, 30, PAL.night);
        R(pc, 0, 149, 320, 2, PAL.slate);
        dith(pc, 0, 150, 320, 10, PAL.night, PAL.ink, .5);
        // 顶灯（唯一暖光源）
        R(pc, 154, 0, 12, 6, PAL.slate);
        R(pc, 156, 6, 8, 4, PAL.gold);
        glow(pc, 160, 8, 66, 60, PAL.gold, .34);
        glow(pc, 160, 20, 30, 90, PAL.gold, .14);
        // 人（正面站姿，握手柄）
        him(pc, 160, 152, 3, { view: "front", eyes: "normal", mouth: "flat", led: "#C8463C" });
        shadeRect(pc, 0, 0, 320, 180, .06);
      } },

    // --- 人物图 2 · 她（耳后星星发夹 + 淡紫外套，正面） ---
    { t0: 2.05, t1: 4.1, scene: 'char', cam: false, vig: .42,
      in: { type: 'dither', dur: .4 },
      draw(pc, lt) {
        vgrad(pc, 0, 0, 320, 180, PAL.ink, PAL.navy);
        R(pc, 0, 150, 320, 30, PAL.night);
        R(pc, 0, 149, 320, 2, PAL.slate);
        dith(pc, 0, 150, 320, 10, PAL.night, PAL.ink, .5);
        R(pc, 154, 0, 12, 6, PAL.slate);
        R(pc, 156, 6, 8, 4, PAL.gold);
        glow(pc, 160, 8, 66, 60, PAL.gold, .34);
        glow(pc, 160, 20, 30, 90, PAL.gold, .14);
        her(pc, 160, 152, 3, { view: "front", eyes: "normal", mouth: "smile" });
        // 底部小注：正脸参考（大块像素画一张小的）
        faceHer(pc, 250, 96, 2, { state: 'smile' });
        shadeRect(pc, 0, 0, 320, 180, .06);
      } },

    // --- 场景图 1 · room 出租屋（他坐窗台，背影，雨） ---
    { t0: 4.1, t1: 6.15, scene: 'room', cam: false, vig: .5,
      in: { type: 'dither', dur: .4 },
      draw(pc, lt) {
        sc_room(pc, lt);
        // 他坐窗台（背影，看窗外的雨）——手融进大衣暗部，避免亮橙色块
        him(pc, 96, 138, 3, { pose: 'sit', view: 'back', pad: false, col: { skin: '#1B2438', skinDk: '#121A2C' } });
        // 手柄放在窗台上
        gamepad(pc, 118, 134, 2, '#31415E');
        // 手机光从下打一点
        glow(pc, 96, 146, 14, 8, PAL.paper, .12);
      } },

    // --- 场景图 2 · gate 车站（她回头 + 他长椅） ---
    { t0: 6.15, t1: 8.2, scene: 'gate', cam: false, vig: .5,
      in: { type: 'dither', dur: .4 },
      draw(pc, lt) {
        sc_gate(pc, lt, { gateOpen: true });
        // 她走进闸机（正面，回头神态）
        her(pc, 152, 140, 3, { view: 'front', eyes: 'normal', mouth: 'smile' });
        // 他坐长椅（侧身，手抬到一半）
        him(pc, 52, 134, 3, { pose: 'sit', view: 'front', aR: 1, pad: false });
        // 顶棚雨丝前景
        for (let i = 0; i < 10; i++) {
          const rx = (i * 37) % 320, ry = 24 + ((lt * 60 + i * 29) % 100);
          pc.save(); pc.globalAlpha = .38; R(pc, rx, ry, 1, 4, PAL.mint); pc.restore();
        }
      } },
  ],

  // HD 层标签
  hud(c, W, H, t) {
    const a = Math.min(1, HZ2(t - .3));
    const idx = t < 2.05 ? 0 : t < 4.1 ? 1 : t < 6.15 ? 2 : 3;
    const labels = [
      ['角色 · 他', '深蓝卫衣 · 暖白内搭 · 短发 · 右手手柄（LED 红）'],
      ['角色 · 她', '黑长直 · 淡紫外套 · 玫瑰红内搭 · 耳后金色星星发夹'],
      ['场景 S1 · room 出租屋', '窗左 2/3 · 台灯唯一暖光源 · 他坐窗台背影'],
      ['场景 S4 · gate 车站站台', '顶棚 · 大钟 · 闸机 ×3 · 长椅 · 安全线'],
    ];
    txt(c, labels[idx][0], 70, 96, 40, PAL.paper, a, 6);
    txt(c, labels[idx][1], 70, 140, 24, 'rgba(120,153,180,.85)', a, 3);
  },
};
function HZ2(v) { return Math.min(1, Math.max(0, v)); }
