// cover.js: 《别怕变老》3:4 海报封面（1080×1440）。
// 复用 MV 的语言：同一张纸、三版套印（蓝=世界 / 陶土=我 / 粉=你）、Clawd 手绘贴纸、规矩线与红印。
// 静态一张（t 不参与），node render.mjs --page=cover.html --stills=0 --out=out/cover
window.EXTRA_FONTS = [['220px "PiaoyiKai"', '别怕变老让我的爱人勇敢手绘孔版印刷音乐·2026.11RISOGRAHMV']];

const CW = W, CH = H;
const F = '"PiaoyiKai"';

function drawWorld(t) {
  boilSeed('cover'); noiseSeed(77);

  // ── 手绘错位画框：蓝版 / 粉版 各偏一点，墨线主版 ──
  boilSeed('frame');
  const fi = 58, fw = CW - fi * 2, fh = CH - fi * 2;
  paint(rectPts(fi - 6, fi - 5, fw + 12, fh + 10, 5), { ink: INK.blueLt, sw: 2.6 });
  paint(rectPts(fi + 6, fi + 5, fw - 12, fh - 10, 5), { ink: INK.pinkLt, sw: 2.2 });
  paint(rectPts(fi, fi, fw, fh, 4), { ink: PAL.ink, sw: 3 });

  // ── 星点（上半部留白处）──
  specks(280, 600, 170, INK.blueLt, 9, 7);
  specks(800, 560, 140, INK.pinkLt, 6, 11);

  // ── 山丘（蓝版世界，再叠一块暖色近丘）──
  plate(ellPts(540, 1330, 950, 320, 44, 8), 'blue');
  plate(ellPts(140, 1430, 520, 210, 30, 6), 'clay', { pale: .5 });
  plate(ellPts(960, 1450, 460, 190, 30, 6), 'pink', { pale: .6 });

  // ── 两只 Clawd，肩并肩坐在丘上，头轻轻靠 ──
  const u = 36, gy = 1150;
  A_(382, gy, u, { view: 'front', rot: .035, aL: .55, aR: .15 });
  B_(698, gy, u, { view: 'front', rot: -.035, aR: .55, aL: .15 });

  // ── 心（红版 = 爱，陶土 × 粉）──
  boilSeed('hearts');
  paint(heartPts(545, 655, 46, 26), { wash: INK.red, washOp: 255, ink: mixCol(INK.red, PAL.ink, .3), sw: 1.4 });
  paint(heartPts(668, 716, 21, 20), { wash: INK.pink, washOp: 235, ink: null });
  paint(heartPts(452, 730, 15, 20), { wash: INK.clay, washOp: 235, ink: null });

  // ── 标题：三层套印（蓝鬼影 → 粉鬼影 → 纸白主字带墨影）──
  letter('别怕变老', CW / 2 - 8, 318 - 6, 212, INK.blue, { font: `212px ${F}`, ink: false, alpha: .8 });
  letter('别怕变老', CW / 2 + 8, 318 + 6, 212, INK.pinkLt, { font: `212px ${F}`, ink: false, alpha: .65 });
  letter('别怕变老', CW / 2, 318, 212, '#FFF7E6', { font: `212px ${F}` });

  // ── 副题：歌词一句 ──
  letter('让我的爱人勇敢 别怕变老', CW / 2, 492, 52, INK.blueDk, { font: `52px ${F}` });
}

// ── 印在颗粒之上的 2D 层：红印章、规矩十字、底部落版 ──
window.overlayHook = (c, t) => {
  // 红印章（右上）
  c.save();
  c.translate(938, 218); c.rotate(-.09); c.globalAlpha = .92;
  c.fillStyle = INK.red;
  c.beginPath(); c.roundRect(-66, -66, 132, 132, 14); c.fill();
  c.strokeStyle = INK.cream; c.lineWidth = 5;
  c.beginPath(); c.roundRect(-52, -52, 104, 104, 8); c.stroke();
  c.fillStyle = INK.cream; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = '52px ' + F;
  c.fillText('别', -26, -26); c.fillText('怕', 26, -26);
  c.fillText('变', -26, 26); c.fillText('老', 26, 26);
  c.restore();

  // 四角规矩十字（对位标记，故意各歪一点）
  c.strokeStyle = 'rgba(61,85,136,.75)'; c.lineWidth = 2;
  for (const [x, y, d] of [[104, 104, 1.4], [CW - 104, 104, -1], [104, CH - 104, 1], [CW - 104, CH - 104, -1.8]]) {
    c.save(); c.translate(x, y); c.rotate(d * .05);
    c.beginPath(); c.moveTo(-16, 0); c.lineTo(16, 0); c.moveTo(0, -16); c.lineTo(0, 16); c.stroke();
    c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.stroke();
    c.restore();
  }

  // 底部落版
  c.fillStyle = '#3E3750'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.font = '38px ' + F;
  c.fillText('手绘孔版印刷 · 音乐MV', CW / 2, CH - 106);
  c.font = '30px ' + F;
  c.fillStyle = 'rgba(62,55,80,.75)';
  c.fillText('2026.11', CW / 2, CH - 66);
};
