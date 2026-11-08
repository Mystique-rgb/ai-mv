// deco.js —— 装饰艺术（金线黑漆）《小镇·一九九九》概念图
const DE = {
  paper: '#F7F2E6',
  black: '#100C0A', lac: '#171210', gold: '#C9A227', goldLt: '#F0D98A', goldDk: '#7A5E12',
  ivory: '#F2E8D2', jewel: '#1F5F52', accent: '#9E2B2B'
};
PAL.paper = DE.paper;

function drawWorld(t) {
  hero(392, 908, 44, { view: 'q', noShadow: true, ...emotions(t, [[0, 'hopeful']]) });
  heroine(960, 906, 34, { view: 'front', noShadow: true, ...emotions(t, [[0, 'cry']]), aL: 1.25, aR: 1.1 });
}

window.frameHook = (c, t) => {
  const w = W, h = H, cx = w / 2;
  const id = KIT.pixels(drawingContext.canvas);
  const m = KIT.clean(KIT.mask(id, KIT.hexToRgb(DE.paper), 26), w, h);

  // ---------- 1. 漆底 ----------
  const bg = c.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#0C0908'); bg.addColorStop(.62, DE.lac); bg.addColorStop(1, '#0A0806');
  c.fillStyle = bg; c.fillRect(0, 0, w, h);

  // ---------- 2. 中心日冕（rot：从人物背后散开）----------
  const sy = 812;
  c.save();
  for (let i = 0; i < 44; i++) {
    const a = -Math.PI + (i / 43) * Math.PI;
    const a2 = a + .012;
    const gg = c.createLinearGradient(cx, sy, cx + Math.cos(a) * 1200, sy + Math.sin(a) * 1200);
    gg.addColorStop(0, 'rgba(201,162,39,.42)'); gg.addColorStop(1, 'rgba(201,162,39,0)');
    c.beginPath(); c.moveTo(cx, sy);
    c.lineTo(cx + Math.cos(a) * 1300, sy + Math.sin(a) * 1300);
    c.lineTo(cx + Math.cos(a2) * 1300, sy + Math.sin(a2) * 1300);
    c.closePath(); c.fillStyle = gg; c.fill();
  }
  c.restore();

  // 同心金弧
  c.save(); c.lineWidth = 2; c.strokeStyle = 'rgba(201,162,39,.5)';
  [300, 360, 420].forEach(r => { c.beginPath(); c.arc(cx, sy, r, Math.PI, Math.PI * 2); c.stroke(); });
  c.restore();

  // ---------- 3. 两侧台阶拱（ziggurat）----------
  const steps = [[0, 132, 250], [132, 264, 300], [264, 396, 350]];
  for (const [x0, x1, yTop] of steps) {
    KIT.poly(c, [[x0, h], [x0, yTop], [x1, yTop], [x1, h]], '#1A1410');
    c.save(); c.strokeStyle = DE.gold; c.lineWidth = 2; c.globalAlpha = .8;
    c.beginPath(); c.moveTo(x1, h); c.lineTo(x1, yTop); c.stroke();
    c.restore();
    // 镜像
    KIT.poly(c, [[w - x1, h], [w - x1, yTop], [w - x0, yTop], [w - x0, h]], '#1A1410');
    c.save(); c.strokeStyle = DE.gold; c.lineWidth = 2; c.globalAlpha = .8;
    c.beginPath(); c.moveTo(w - x1, h); c.lineTo(w - x1, yTop); c.stroke();
    c.restore();
  }
  // 台阶顶的小金球
  [[132, 250], [264, 300], [396, 350]].forEach(([x, y]) => {
    [x, w - x].forEach(xx => {
      c.beginPath(); c.arc(xx, y - 12, 7, 0, Math.PI * 2); c.fillStyle = DE.goldLt; c.fill();
    });
  });

  // ---------- 4. 中央拱窗（她在这里）----------
  const aw = 460, ax = cx - aw / 2, ayTop = 250, ayBot = 884, rr = aw / 2;
  c.save(); c.beginPath();
  c.moveTo(ax, ayBot); c.lineTo(ax, ayTop + rr);
  c.arc(cx, ayTop + rr, rr, Math.PI, 0);
  c.lineTo(ax + aw, ayBot); c.closePath();
  c.fillStyle = '#251C15'; c.fill();
  c.lineWidth = 5; c.strokeStyle = DE.gold; c.stroke();
  c.lineWidth = 1.6; c.strokeStyle = DE.goldLt; c.globalAlpha = .65; c.stroke();
  c.restore();
  // 窗内竖向金棂（贴边，不切脸）
  c.save(); c.strokeStyle = 'rgba(201,162,39,.55)'; c.lineWidth = 3;
  [ax + 26, ax + aw - 26].forEach(x => { c.beginPath(); c.moveTo(x, ayTop + 60); c.lineTo(x, ayBot); c.stroke(); });
  c.restore();

  // ---------- 5. 人物：黑/象牙/金 三版 + 金边 ----------
  c.drawImage(KIT.outline(m, w, h, 4, DE.gold), 0, 0);
  const people = KIT.separate(id, m, [
    { l: [0, .38], col: '#0B0806', off: [0, 0] },
    { s: [0, .14], l: [.74, 1], col: DE.ivory, off: [1.2, .8] },
    { h: [318, 360], col: DE.accent, off: [2, 1.4] },      // 她的粉衣 → deco 宝石红
    { h: [0, 18], col: DE.accent, off: [2, 1.4] },
    { h: [20, 58], col: DE.ivory, off: [1.4, .8] },        // 皮肤 → 象牙
    { h: [59, 200], col: DE.jewel, off: [-1.4, -1] },      // 他的卫衣 → 宝石绿
    { col: DE.jewel, off: [0, 0] }
  ]);
  c.drawImage(people, 0, 0);

  // ---------- 6. 窗台压住她的腿 ----------
  KIT.poly(c, [[ax - 26, 876], [ax + aw + 26, 876], [ax + aw + 26, 910], [ax - 26, 910]], '#0B0806');
  c.save(); c.strokeStyle = DE.gold; c.lineWidth = 3; c.globalAlpha = .9;
  c.beginPath(); c.moveTo(ax - 26, 876); c.lineTo(ax + aw + 26, 876); c.stroke(); c.restore();

  // ---------- 7. 地面：速度线 + 中心轴 ----------
  c.save(); c.strokeStyle = 'rgba(201,162,39,.34)'; c.lineWidth = 2;
  for (let i = -9; i <= 9; i++) {
    const x0 = cx + i * 96;
    c.beginPath(); c.moveTo(cx + i * 16, 910); c.lineTo(x0 + i * 60, h); c.stroke();
  }
  c.restore();

  // ---------- 8. 灯泡链（顶部拱）----------
  c.save();
  const acy = 250 + 230;
  for (let i = 0; i <= 22; i++) {
    const a = Math.PI + (i / 22) * Math.PI;
    const x = cx + Math.cos(a) * 286, y = acy + Math.sin(a) * 286;
    const gl = c.createRadialGradient(x, y, 0, x, y, 22);
    gl.addColorStop(0, 'rgba(240,217,138,.9)'); gl.addColorStop(1, 'rgba(240,217,138,0)');
    c.fillStyle = gl; c.beginPath(); c.arc(x, y, 22, 0, Math.PI * 2); c.fill();
    c.fillStyle = DE.goldLt; c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.fill();
  }
  c.restore();

  // ---------- 9. 字幕：阶梯金条 ----------
  const tw = 1080, th = 96, tx = cx - tw / 2, ty = 934;
  c.save();
  c.beginPath();
  c.moveTo(tx + 30, ty); c.lineTo(tx + tw - 30, ty);
  c.lineTo(tx + tw, ty + 30); c.lineTo(tx + tw, ty + th); c.lineTo(tx, ty + th);
  c.lineTo(tx, ty + 30); c.closePath();
  c.fillStyle = 'rgba(8,6,5,.88)'; c.fill();
  c.lineWidth = 3; c.strokeStyle = DE.gold; c.stroke();
  c.lineWidth = 1.2; c.strokeStyle = DE.goldLt; c.globalAlpha = .55; c.stroke();
  c.restore();
  KIT.text(c, '还记得一年前站在火车站', cx, ty + 60, 42, DE.ivory, { align: 'center', track: 6, weight: 600, family: '"Microsoft YaHei",serif' });

  // 左上角编号（deco 的牌匾）
  KIT.text(c, 'I', 96, 132, 62, DE.goldLt, { family: '"Georgia",serif' });
  KIT.text(c, 'ONE WAY', 100, 166, 20, DE.gold, { track: 5, weight: 600, family: '"Arial Narrow",Arial,sans-serif' });

  // ---------- 10. 质感 ----------
  KIT.grain(c, w, h, .07, 13);
  KIT.vignette(c, w, h, 'rgba(0,0,0,.62)', .5);
};
