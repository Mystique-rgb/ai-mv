// midcentury.js —— 50s 扁平卡通（UPA 语法）《小镇·一九九九》概念图
const MC = {
  paper: '#F6EEDC', wall: '#5FA8A0', floor: '#E9B04C', ink: '#2A2622',
  coral: '#E2643F', sun: '#F4D35E', teal: '#2F6E6A', glass: '#FBF3E2'
};
PAL.paper = MC.paper;

function drawWorld(t) {
  hero(520, 884, 52, { view: 'q', ...emotions(t, [[0, 'hopeful']]) });
  heroine(1420, 742, 27, { view: 'front', ...emotions(t, [[0, 'cry']]), aL: 1.2, aR: 1.05 });
}

window.frameHook = (c, t) => {
  const w = W, h = H;
  const id = KIT.pixels(drawingContext.canvas);
  const m = KIT.mask(id, KIT.hexToRgb(MC.paper), 26);

  c.fillStyle = MC.paper; c.fillRect(0, 0, w, h);

  // ---------- 1. 一块墙 + 一条地板（房间不画，只有色平面）----------
  KIT.poly(c, [[0, 0], [w, 0], [w, 822], [0, 822]], MC.wall);
  KIT.poly(c, [[0, 822], [w, 822], [w, h], [0, h]], MC.floor);
  // 地平线：断开的墨线（UPA 的线从不闭合）
  c.save(); c.strokeStyle = MC.ink; c.lineWidth = 9; c.lineCap = 'round';
  [[40, 420], [470, 700], [760, 1080], [1150, 1330], [1400, 1700], [1760, 1880]].forEach(([a, b]) => {
    c.beginPath(); c.moveTo(a, 822); c.lineTo(b, 822); c.stroke();
  });
  c.restore();
  // 踢脚线一块浅色
  KIT.poly(c, [[0, 790], [w, 790], [w, 822], [0, 822]], '#4E8F88');

  // ---------- 2. 星芒：从窗里射进来的光（原子时代放射线）----------
  const cx = 1430, cy = 330;
  c.save(); c.globalAlpha = .30;
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + .12;
    const a2 = a + .055;
    c.beginPath(); c.moveTo(cx, cy);
    c.lineTo(cx + Math.cos(a) * 1500, cy + Math.sin(a) * 1500);
    c.lineTo(cx + Math.cos(a2) * 1500, cy + Math.sin(a2) * 1500);
    c.closePath(); c.fillStyle = MC.sun; c.fill();
  }
  c.restore();
  // 同心圆环（刻度盘感）
  c.save(); c.strokeStyle = MC.ink; c.lineWidth = 5;
  [128, 168].forEach(r => { c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke(); });
  c.restore();

  // ---------- 3. 车窗：画面里的画面 ----------
  const wx = 1060, wy = 176, ww = 720, wh = 590, rr = 46;
  roundRect(c, wx, wy, ww, wh, rr); c.fillStyle = MC.glass; c.fill();
  c.save(); c.lineWidth = 14; c.strokeStyle = MC.ink; c.lineJoin = 'round'; c.stroke(); c.restore();
  // 玻璃上斜光：两条硬边浅色带
  c.save(); c.beginPath(); roundRect(c, wx, wy, ww, wh, rr); c.clip();
  KIT.poly(c, [[wx + 60, wy], [wx + 210, wy], [wx - 40, wy + wh], [wx - 190, wy + wh]], '#FFF9EC');
  c.restore();

  // ---------- 4. 人物：垫一层错位色影 + 分色 ----------
  const rules = [
    { l: [0, .42], col: MC.ink, off: [0, 0] },
    { s: [0, .12], l: [.78, 1], col: MC.paper, off: [1.5, 1] },
    { h: [318, 360], col: MC.coral, off: [3.4, 2.2] },
    { h: [0, 18], col: MC.coral, off: [3.4, 2.2] },
    { h: [20, 58], col: MC.paper, off: [1.8, 1.2] },
    { h: [59, 200], col: MC.teal, off: [-2.2, -1.6] },
    { col: MC.teal, off: [0, 0] }
  ];
  const people = KIT.separate(id, m, rules);
  // 错位色影（UPA：色 blocks 印在自己的线外面几像素）
  c.save(); c.globalAlpha = .55;
  c.drawImage(KIT.fill(m, w, h, MC.sun), 7, 5);
  c.restore();
  c.drawImage(people, 0, 0);

  // ---------- 5. 窗框压住她的腿 ----------
  c.save(); c.beginPath(); roundRect(c, wx, wy, ww, wh, rr); c.clip();
  KIT.poly(c, [[wx, 706], [wx + ww, 706], [wx + ww, 780], [wx, 780]], '#4E8F88');
  c.restore();
  KIT.poly(c, [[wx + 348, wy], [wx + 372, wy], [wx + 372, wy + wh], [wx + 348, wy + wh]], MC.ink);

  // ---------- 6. 编号徽章 + 星 ----------
  badge(c, 176, 176, 96, '1', 'OF 9');
  sparkle(c, 900, 240, 26);
  sparkle(c, 640, 150, 16);
  sparkle(c, 1862, 940, 20);

  // ---------- 7. 底部圆角字幕卡（剪出来的纸片）----------
  const cw2 = 1180, chh = 132, bx = (w - cw2) / 2, by = h - chh - 54;
  c.save(); c.shadowColor = 'rgba(42,38,34,.28)'; c.shadowBlur = 0; c.shadowOffsetX = 8; c.shadowOffsetY = 8;
  roundRect(c, bx, by, cw2, chh, 18); c.fillStyle = MC.paper; c.fill();
  c.restore();
  c.save(); c.lineWidth = 8; c.strokeStyle = MC.ink; c.stroke(); c.restore();
  KIT.text(c, '还记得一年前站在火车站', bx + 58, by + 84, 52, MC.ink, { track: 2, weight: 700, family: '"Microsoft YaHei","PingFang SC",sans-serif' });
  KIT.text(c, 'LINE 1 / 9   ·   0:02.1', bx + cw2 - 52, by + 78, 22, '#8A8076', { align: 'right', track: 3, weight: 700, family: '"Arial Narrow",Arial,sans-serif' });
  // 卡片两端的小星
  sparkle(c, bx + 26, by + 66, 12, MC.coral);
  sparkle(c, bx + cw2 - 26, by + 66, 12, MC.coral);

  // ---------- 8. 质感 ----------
  KIT.grain(c, w, h, .12, 9);
  KIT.vignette(c, w, h, 'rgba(90,60,30,.22)', .6);
};

// ---- 小工具 ----
function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
}

function badge(c, x, y, r, num, sub) {
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = MC.ink; c.fill();
  c.beginPath(); c.arc(x, y, r - 12, 0, Math.PI * 2); c.strokeStyle = MC.paper; c.lineWidth = 4; c.stroke();
  KIT.text(c, num, x, y + 22, 68, MC.paper, { align: 'center', family: '"Impact","Arial Black",sans-serif' });
  KIT.text(c, sub, x, y + 52, 18, MC.sun, { align: 'center', track: 3, weight: 700, family: '"Arial Narrow",Arial,sans-serif' });
}

function sparkle(c, x, y, r, col = MC.ink) {
  c.save(); c.fillStyle = col; c.beginPath();
  c.moveTo(x, y - r); c.quadraticCurveTo(x + r * .18, y - r * .18, x + r, y);
  c.quadraticCurveTo(x + r * .18, y + r * .18, x, y + r);
  c.quadraticCurveTo(x - r * .18, y + r * .18, x - r, y);
  c.quadraticCurveTo(x - r * .18, y - r * .18, x, y - r);
  c.fill(); c.restore();
}
