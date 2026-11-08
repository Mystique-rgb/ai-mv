// b3.js — B3 205.10–243.94 · 只剩线，对上了（复用 CH 构图，mode='b3'：色版全撤，0px）
(() => {
  const reg = (t0, fn) => shots([[t0, (t, lt, d) => window.CH[fn](t, lt, 'b3')]]);
  reg(205.10, 'C20'); reg(208.36, 'C21'); reg(210.92, 'C22'); reg(213.40, 'C23');
  reg(215.86, 'C24'); reg(219.86, 'C25'); reg(224.60, 'C26'); reg(227.75, 'C27');
  reg(230.74, 'C28');
  // V79 两线合一 / V80 轮廓重叠 / V81 一条线+印 已在 C29/C30 的 b3 分支
  reg(233.42, 'C29'); reg(235.58, 'C30');
  // ---- V81 · 239.82–243.94 只剩一条线 + 空印落字「宿」 ----
  shots([[239.82, (t, lt, d) => {
    mountBG(t, { goma: 8, gomaK: 'v81' });
    // 一条缓慢呼吸的线（形状同时是阿宿也是粉煞：方盒轮廓）
    const bw = lerp(3.2, 5.0, .5 + .5 * Math.sin(t * 1.4));
    paint(rectPts(800, 300, 260, 320, 5), { ink: SUMI, sw: bw * 1.5 });
    for (const lx of [-110, -40, 40, 110]) paint(rectPts(930 + lx, 620, 26, 96, 3), { ink: SUMI, sw: bw });
    paint(rectPts(690, 430, 80, 40, 3), { ink: SUMI, sw: bw });
    paint(rectPts(1060, 430, 80, 40, 3), { ink: SUMI, sw: bw });
    // 空印重新落下，这次有字
    if (lt > 3.3) { const k = lt < 3.5 ? 1.35 - .35 * easeOut((lt - 3.3) / .2) : 1;
      seal(1180, 780, 110, '宿', k, .03); }
    sheetFrame(1);
  }]]);
})();
