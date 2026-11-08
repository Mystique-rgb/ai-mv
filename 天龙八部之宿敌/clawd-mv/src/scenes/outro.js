// outro.js — 尾奏 243.94–263.34 · 一只手把它卷起来（V82–V87）
(() => {
  const REAL = '#D8CBB2', REAL_DK = '#B3A488';   // 出画后的"真实"桌（比版画平，少纹理）
  // ---- V82 · 急拉远：画→装裱→长卷摊在木桌上 ----
  function V82(t, lt) {
    const z = lerp(1.0, .3, ease(clamp(lt / 1.74)));
    camBegin(960, 540, z);
    // 桌面（真实木纹 + 阴影，不要版画化）
    paint(rectPts(-2600, -1600, W + 5200, H + 3200, 6), { wash: '#8A6B44', washOp: 255, ink: null });
    boilSeed('desk');
    for (let i = 0; i < 14; i++) { const y = -1400 + i * 260;
      inkLine([[-2400, y], [400, y + 40], [W + 2400, y - 20]], 3, mixCol('#6E5334', '#A5885F', .5), 'ink', .3); }
    // 桌上的笔与砚
    paint(rectPts(2400, 900, 420, 56, 8), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1.6 });
    paint(ellPts(3100, 950, 150, 90, 20, 5), { wash: mixCol(SUMI, '#14121A', .5), washOp: 255, ink: SUMI, sw: 2 });
    // 长卷（横向铺开，卷首在右）
    paint(rectPts(960 - 1900, 300, 3800, 480, 8), { wash: WASHI, washOp: 255, ink: SUMI, sw: 2.4 });
    // 画心：那条线的画（缩小版 V81）
    paint(rectPts(1290, 360, 420, 360, 4), { ink: SUMI, sw: 2 });
    paint(rectPts(1440, 470, 90, 110, 3), { ink: SUMI, sw: 2 });
    for (const lx of [-26, 6, 30, 52]) paint(rectPts(1485 + lx, 580, 8, 30, 1), { ink: SUMI, sw: 1.6 });
    camEnd();
    sheetFrame(0);   // 出画后没有画框
  }

  // ---- V83 · 沿长卷回看：七幅画一一兑现 ----
  function V83(t, lt) {
    paint(rectPts(-60, -60, W + 120, H + 120, 3), { wash: '#8A6B44', washOp: 255, ink: null });
    boilSeed('desk2');
    for (let i = 0; i < 8; i++) inkLine([[-60, 100 + i * 140], [W + 60, 90 + i * 140]], 2.4, mixCol('#6E5334', '#A5885F', .5), 'ink', .3);
    const slide = lerp(0, 4300, clamp(lt / 3.3));
    const cells = [[AI, '桥'], [mixCol(OCHRE, WASHI, .4), '松'], [AI, '浪'], [BENI, '火'], [MIDORI, '竹'], [OCHRE, '刀'], [WASHI, '空'], [WASHI, '白']];
    cells.forEach(([col, kind], i) => {
      const x = 1560 + i * 560 - slide; if (x < -400 || x > W + 400) return;
      paint(rectPts(x - 240, 180, 480, 720, 4), { wash: WASHI, washOp: 255, ink: SUMI, sw: 1.6 });
      // 缩微内容
      if (kind === '桥') { paint([[x - 180, 560], [x, 420], [x + 180, 560]], { wash: col, washOp: 200, ink: SUMI, sw: 1.2, curv: .3 }); paint(rectPts(x - 40, 430, 80, 60, 3), { wash: CLAY, washOp: 255, ink: SUMI, sw: 1 }); }
      if (kind === '松') { paint(ellPts(x, 420, 90, 46, 12, 3), { wash: MIDORI, washOp: 235, ink: SUMI, sw: 1 }); paint(rectPts(x - 8, 460, 16, 180, 2), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1 }); }
      if (kind === '浪') { paint([[x - 200, 700], [x - 40, 380], [x + 80, 520], [x + 200, 340], [x + 220, 700]], { wash: AI, washOp: 235, ink: SUMI, sw: 1.4, curv: .3 }); }
      if (kind === '火') { paint([[x - 140, 760], [x - 30, 420], [x + 60, 560], [x + 150, 400], [x + 180, 760]], { wash: BENI, washOp: 245, ink: null, curv: .3 }); }
      if (kind === '竹') { for (let k = 0; k < 5; k++) inkLine([[x - 160 + k * 80, 860], [x - 130 + k * 80, 300]], 6, mixCol(MIDORI, SUMI, .35), 'ink', .2); }
      if (kind === '刀') { for (let k = 0; k < 6; k++) paint(rectPts(x - 150 + k * 55, 480 + hash(k) * 60, 10, 260, 2), { wash: '#EDE3CC', washOp: 255, ink: SUMI, sw: .9 }); }
      if (kind === '空') { paint(ellPts(x, 460, 80, 80, 20, 4), { wash: '#FBF6EA', washOp: 255, ink: null }); }
      paint(rectPts(x - 240, 180, 480, 720, 4), { ink: SUMI, sw: 1.8 });
    });
    sheetFrame(0);
  }

  // ---- V84 · 真实的手卷起来 ----
  function V84(t, lt) {
    paint(rectPts(-60, -60, W + 120, H + 120, 3), { wash: '#8A6B44', washOp: 255, ink: null });
    boilSeed('desk3');
    for (let i = 0; i < 8; i++) inkLine([[-60, 100 + i * 140], [W + 60, 90 + i * 140]], 2.4, mixCol('#6E5334', '#A5885F', .5), 'ink', .3);
    // 卷过的部分消失：露出的纸从右往左缩
    const rollK = clamp(lt / 3.2);
    const paperR = lerp(W + 200, 760, ease(rollK));
    paint(rectPts(-200, 300, paperR + 200, 480, 6), { wash: WASHI, washOp: 255, ink: SUMI, sw: 2 });
    // 纸皱阻力
    boilSeed('rollwr');
    for (let i = 0; i < 5; i++) inkLine([[paperR - 300 - i * 90, 320], [paperR - 260 - i * 90, 760]], 1.2, mixCol(SUMI, WASHI, .6), 'inkfine', .3);
    // 卷筒
    paint(ellPts(paperR + 40, 540, 46, 240, 18, 4), { wash: '#EFE6CE', washOp: 255, ink: SUMI, sw: 2 });
    // 真实的手（黑白剪影）从右进来卷
    const hx = lerp(W + 300, paperR + 220, ease(clamp(lt / .8)));
    push(); translate(hx, 560 + Math.sin(t * 1.2) * 10);
    paint(ellPts(0, 0, 130, 90, 18, 5), { fill: '#241F2A', fillOp: 235, bleed: .12, ink: null });
    for (let f = 0; f < 4; f++) paint(rrPts(-60 + f * 58, -80, 46, 150, 20, 4), { fill: '#241F2A', fillOp: 235, bleed: .12, ink: null });
    paint(ellPts(70, 60, 60, 44, 14, 4), { fill: '#241F2A', fillOp: 235, bleed: .12, ink: null });
    pop();
    sheetFrame(0);
  }

  // ---- V85 · 卷首竖题签：只剩「宿敌」 ----
  function V85(t, lt) {
    paint(rectPts(-60, -60, W + 120, H + 120, 3), { wash: '#8A6B44', washOp: 255, ink: null });
    // 卷筒立在桌上
    paint(rectPts(700, 220, 520, 640, 10), { wash: '#EFE6CE', washOp: 255, ink: SUMI, sw: 2.4 });
    paint(ellPts(960, 220, 260, 42, 22, 5), { wash: '#F3EBDC', washOp: 255, ink: SUMI, sw: 2 });
    // 题签
    const cover = clamp((lt - 1.4) / 1);   // "百景"两字被卷起遮住
    vTitle(960, 300, '宿敌', 84, 1);
    if (cover > 0) { paint(rectPts(700, 300 + 84 * 2.5 * cover, 520, 400, 4), { wash: '#EFE6CE', washOp: 255, ink: null }); }
    sheetFrame(0);
  }

  // ---- V86 · 巨印盖在卷筒横截面上，红沿纸层晕开成年轮 ----
  function V86(t, lt) {
    paint(rectPts(-60, -60, W + 120, H + 120, 3), { wash: '#8A6B44', washOp: 255, ink: null });
    // 卷筒（横截面朝上）
    paint(ellPts(960, 560, 300, 190, 26, 6), { wash: '#EFE6CE', washOp: 255, ink: SUMI, sw: 2.4 });
    // 纸层理
    boilSeed('layers');
    for (let i = 0; i < 7; i++) paint(ellPts(960, 560, 260 - i * 34, 165 - i * 21, 24, 4), { ink: mixCol(SUMI, WASHI, .55), sw: 1 });
    // 巨印落下（重音）
    const fall = ease(clamp(lt / .4));
    const sc = lerp(1.8, 1, fall);
    push(); translate(960, 560); scale(sc);
    if (fall >= 1 && lt < .9) { const [sx, sy] = shakeXY(lt - .5, 5); translate(sx * 5, sy * 5); }
    paint(rectPts(-190, -120, 380, 240, 8), { wash: BENI, washOp: 248, ink: null });
    letter('宿', 0, 4, 150, '#F6EBD3', { font: `150px ${KX}`, ink: false, screen: true });
    pop();
    // 印泥沿纸层晕开成同心圆（年轮）
    if (lt > .6) { const sk = ease(clamp((lt - .6) / 1.6));
      for (let i = 0; i < 4; i++) { const rr = (120 + i * 55) * sk;
        paint(ellPts(960, 560, rr, rr * .63, 26, 5), { wash: BENI, washOp: clamp(120 - i * 22) * sk, ink: null }); } }
    sheetFrame(0);
  }

  // ---- V87 · 纸卷滚出，白纸上一个印 ----
  function V87(t, lt) {
    paint(rectPts(-40, -40, W + 80, H + 80, 3), { wash: WASHI, washOp: 255, ink: null });
    // 纸卷滚出画面
    const out = easeIn(clamp(lt / 1.2));
    if (out < 1) { push(); translate(960 + out * 1900, 560); rotate(out * 2);
      paint(rectPts(-260, -140, 520, 280, 8), { wash: '#EFE6CE', washOp: 255, ink: SUMI, sw: 2 }); pop(); }
    // 留下的印痕
    if (lt > .9) { const k = ease(clamp((lt - .9) / .3));
      paint(rectPts(960 - 150, 560 - 90, 300, 180, 8), { wash: mixCol(BENI, WASHI, .55), washOp: 200 * k, ink: null });
      letter('宿', 960, 566, 110, mixCol(BENI, WASHI, .3), { font: `110px ${KX}`, ink: false, alpha: k, screen: true }); }
    // 最后 1.2s 纯空白 + 小印
    if (lt > 2.2) { const k2 = ease(clamp((lt - 2.2) / .4));
      seal(960, 620, 90, '宿', k2); }
    sheetFrame(0);
  }

  shots([[243.94, V82], [247.00, V83], [250.50, V84], [254.00, V85], [257.50, V86], [260.50, V87]]);
})();
