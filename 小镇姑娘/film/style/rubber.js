// rubber.js —— 1930s 橡皮管卡通（黑白 4:3 片门）《小镇·一九九九》概念图
const RH = {
  paper: '#FBF8F1',      // 抠像用底色
  gate: 240,             // 4:3 片门左边界（1440×1080 居中）
  ink: '#0E0E10', g1: '#2A2A2C', g2: '#4A4A4C', g3: '#6E6E70', g4: '#9A9A9C', g5: '#C8C8C6', wht: '#F4F2EC'
};
PAL.paper = RH.paper;

function drawWorld(t) {
  hero(600, 900, 54, { view: 'q', noShadow: true, ...emotions(t, [[0, 'hopeful']]) });
  heroine(1180, 690, 27, { view: 'front', noShadow: true, ...emotions(t, [[0, 'cry']]), aL: 1.25, aR: 1.1 });
}

window.frameHook = (c, t) => {
  const w = W, h = H, gx = RH.gate, gw = 1440;
  const id = KIT.pixels(drawingContext.canvas);
  const m = KIT.clean(KIT.mask(id, KIT.hexToRgb(RH.paper), 26), w, h);

  // ---------- 1. 片门外：全黑 ----------
  c.fillStyle = '#000'; c.fillRect(0, 0, w, h);

  // ---------- 2. 背景：水彩灰（画一次，永不 boil）----------
  const bg = c.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#8C8C8A'); bg.addColorStop(.55, '#A8A8A4'); bg.addColorStop(1, '#7A7A78');
  c.save(); c.beginPath(); c.rect(gx, 0, gw, h); c.clip();
  c.fillStyle = bg; c.fillRect(gx, 0, gw, h);
  // 团块（水彩积色）
  let sd = 31; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) {
    const x = gx + rnd() * gw, y = rnd() * 900, r = 90 + rnd() * 300;
    const gr = c.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(60,60,62,${.05 + rnd() * .07})`); gr.addColorStop(1, 'rgba(60,60,62,0)');
    c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }

  // ---------- 3. 站台 / 车厢（灰度块，硬边）----------
  KIT.poly(c, [[gx, 800], [gx + gw, 800], [gx + gw, 1080], [gx, 1080]], RH.g3);          // 站台
  KIT.poly(c, [[gx, 800], [gx + gw, 800], [gx + gw, 818], [gx, 818]], RH.wht);           // 月台边亮线
  KIT.poly(c, [[880, 360], [gx + gw, 360], [gx + gw, 800], [880, 800]], RH.g4);          // 车厢
  KIT.poly(c, [[880, 360], [gx + gw, 360], [gx + gw, 392], [880, 392]], RH.g2);          // 车顶
  KIT.poly(c, [[880, 756], [gx + gw, 756], [gx + gw, 800], [880, 800]], RH.g2);          // 裙板
  // 车厢接缝 + 铆钉
  c.save(); c.strokeStyle = RH.g2; c.lineWidth = 4;
  [[1520]].forEach(([x]) => { c.beginPath(); c.moveTo(x, 392); c.lineTo(x, 756); c.stroke(); });
  c.restore();
  // 车窗：发亮的白洞
  KIT.poly(c, [[960, 430], [1290, 430], [1290, 700], [960, 700]], RH.wht);
  KIT.poly(c, [[1330, 430], [1470, 430], [1470, 700], [1330, 700]], RH.wht);

  // ---------- 4. 蒸汽（白团块，从车顶冒出）----------
  c.save(); c.fillStyle = 'rgba(250,250,246,.92)';
  [[1230, 330, 90], [1140, 290, 66], [1320, 280, 54], [1250, 230, 40]].forEach(([x, y, r]) => {
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  });
  c.restore();

  // ---------- 5. 人物：三阶灰 + 粗墨线 ----------
  c.drawImage(KIT.outline(m, w, h, 6, RH.ink), 0, 0);
  c.drawImage(KIT.tone(id, m, [
    { max: .34, col: RH.ink },
    { max: .58, col: RH.g2 },
    { max: .76, col: RH.g4 },
    { col: RH.wht }
  ]), 0, 0);

  // ---------- 6. 前景：窗框压住她的腿 ----------
  KIT.poly(c, [[960, 672], [1290, 672], [1290, 700], [960, 700]], RH.g2);

  // ---------- 7. 字幕：period title card ----------
  const tw = 900, th = 108, tx = gx + (gw - tw) / 2, ty = 940;
  c.save(); c.fillStyle = 'rgba(8,8,10,.9)'; c.fillRect(tx, ty, tw, th);
  c.strokeStyle = RH.wht; c.lineWidth = 3; c.strokeRect(tx + 8, ty + 8, tw - 16, th - 16);
  c.lineWidth = 1.4; c.strokeRect(tx + 18, ty + 18, tw - 36, th - 36); c.restore();
  KIT.text(c, '还记得一年前站在火车站', tx + tw / 2, ty + 66, 44, RH.wht, { align: 'center', track: 4, weight: 700, family: '"Microsoft YaHei",serif' });
  // 角落的点环装饰
  [[tx + 18, ty + 18], [tx + tw - 18, ty + 18], [tx + 18, ty + th - 18], [tx + tw - 18, ty + th - 18]].forEach(([x, y]) => {
    c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 2); c.fillStyle = RH.wht; c.fill();
  });

  // ---------- 8. 胶片损伤 ----------
  // 片门圆角 + 内阴影
  c.save();
  roundRect(c, gx, 0, gw, h, 26); c.clip();
  const ig = c.createRadialGradient(gx + gw / 2, h / 2, 420, gx + gw / 2, h / 2, 900);
  ig.addColorStop(0, 'rgba(0,0,0,0)'); ig.addColorStop(1, 'rgba(0,0,0,.55)');
  c.fillStyle = ig; c.fillRect(gx, 0, gw, h);
  // 划痕
  c.strokeStyle = 'rgba(255,255,255,.20)'; c.lineWidth = 1.6;
  [[520, .7], [980, .45], [1420, .6]].forEach(([x, a]) => {
    c.globalAlpha = a; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 3, h); c.stroke();
  });
  c.globalAlpha = 1;
  // 灰尘
  let s2 = 77; const r2 = () => (s2 = (s2 * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 16; i++) {
    const x = gx + r2() * gw, y = r2() * h, rr = .6 + r2() * 1.6;
    c.fillStyle = r2() > .5 ? 'rgba(20,20,20,.55)' : 'rgba(255,255,252,.5)';
    c.beginPath(); c.arc(x, y, rr, 0, Math.PI * 2); c.fill();
  }
  c.restore();

  // 闪烁 + 整体对比提升
  c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .16;
  c.fillStyle = '#FFFFFF'; c.fillRect(gx, 0, gw, h); c.restore();

};

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
}
