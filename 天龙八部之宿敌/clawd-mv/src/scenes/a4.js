// a4.js — A4 143.20–163.11 · 埋了，又长出来（V50–V55）
(() => {
  // ---- V50 · 深谷，朱棺下坠 ----
  function V50(t, lt) {
    camBegin(960, 630, 1);
    mountBG(t, { goma: 10, gomaK: 'v50' });
    // 谷壁合拢
    const closeK = ease(clamp(lt / 2.4));
    paint([[0, 0], [340 + closeK * 260, 0], [520 + closeK * 200, H], [0, H]], { wash: mixCol(OCHRE, SUMI, .45), washOp: 255, ink: SUMI, sw: 1.8, curv: .3 });
    paint([[W, 0], [W - 340 - closeK * 260, 0], [W - 520 - closeK * 200, H], [W, H]], { wash: mixCol(OCHRE, SUMI, .45), washOp: 255, ink: SUMI, sw: 1.8, curv: .3 });
    paint(rectPts(0, 0, W, H, 2), { wash: mixCol(OCHRE, SUMI, .6), washOp: 0, ink: null });
    // 谷底黑
    paint(rectPts(0, 900, W, 240, 3), { wash: mixCol(SUMI, '#0E0C12', .5), washOp: 255, ink: null });
    // 朱棺每拍坠一段
    const drop = easeIn(clamp(lt / 1.74));
    const cy = lerp(140, 860, drop), sc = lerp(1, .45, drop);
    push(); translate(960, cy); scale(sc);
    paint(rectPts(-130, -80, 260, 160, 10), { wash: BENI, washOp: 255, ink: SUMI, sw: 2 });
    paint(rectPts(-150, -100, 300, 46, 8), { wash: mixCol(BENI, SUMI, .3), washOp: 255, ink: SUMI, sw: 1.6 });
    pop();
    // 谷口鹰盘旋
    const ea = t * 1.1;
    paint([[1400 + Math.cos(ea) * 90, 220 + Math.sin(ea) * 40], [1450 + Math.cos(ea) * 90, 200 + Math.sin(ea) * 40], [1500 + Math.cos(ea) * 90, 225 + Math.sin(ea) * 40]], { wash: SUMI, washOp: 230, ink: null, curv: .5 });
    // 阿宿谷口俯望
    pc(330, 320, 14, { view: 'q', dip: misreg(t), ...feel('sad', t8(t)), boilKey: 'a4c', draw: belt });
    kasa(330, 320 - 8 * 14, 14, { back: 1, dip: misreg(t) });
    camEnd(); sheetFrame(1);
  }

  // ---- V51 · 棺落地，土每拍盖一层，红消失 ----
  function V51(t, lt) {
    mountBG(t, { goma: 8, gomaK: 'v50' });
    paint(rectPts(0, 500, W, 640, 3), { wash: mixCol(OCHRE, SUMI, .5), washOp: 255, ink: null });
    // 棺
    paint(rectPts(760, 700, 400, 190, 10), { wash: BENI, washOp: 255, ink: SUMI, sw: 2 });
    // 土每拍盖一层（5 拍），最后露一角朱红再被吃掉
    const layer = clamp(lt / (BEAT * 5));
    for (let i = 0; i < 5; i++) { if (layer < (i + .2) / 5) break;
      const w2 = 440 + i * 60, h2 = 30 + i * 34;
      paint(ellPts(960, 890 - i * 8, w2 / 2, h2, 18, 6), { wash: mixCol(OCHRE, SUMI, .35 + i * .08), washOp: 255, ink: SUMI, sw: 1.2 }); }
    // 落地墨点飞散（开头 0.4s）
    if (lt < .5) { boilSeed('v51dirt');
      for (let i = 0; i < 10; i++) { const a = hash(i * 7) * Math.PI, d = lt * 500 * (.4 + hash(i) * .6);
        paint(ellPts(960 + Math.cos(a) * d, 760 - Math.sin(a) * d, 8, 6, 6), { fill: mixCol(OCHRE, SUMI, .4), fillOp: 220, ink: null }); } }
    // 谷壁
    paint([[0, 0], [220, 0], [420, H], [0, H]], { wash: mixCol(OCHRE, SUMI, .45), washOp: 255, ink: SUMI, sw: 1.6, curv: .3 });
    paint([[W, 0], [W - 220, 0], [W - 420, H], [W, H]], { wash: mixCol(OCHRE, SUMI, .45), washOp: 255, ink: SUMI, sw: 1.6, curv: .3 });
    sheetFrame(1);
  }

  // ---- V52 · 坟上长树，白花，根须爬向画框 ----
  function V52(t, lt) {
    camBegin(960, 620, 1 + .08 * clamp(lt / 3.9));
    mountBG(t, { sky: [mixCol(OCHRE, AI, .4), 130], skyY0: 40, skyY1: 430, goma: 8, gomaK: 'v52' });
    paint([[0, 820], [W, 800], [W, H], [0, H]], { wash: mixCol(OCHRE, SUMI, .3), washOp: 255, ink: SUMI, sw: 1.4 });
    paint(ellPts(880, 850, 240, 46, 16, 5), { wash: mixCol(OCHRE, SUMI, .45), washOp: 255, ink: SUMI, sw: 1.2 });
    // 树每拍长一截
    const grow = clamp(lt / (BEAT * 4));
    const h2 = lerp(60, 460, easeOut(grow));
    inkLine([[880, 820], [880, 820 - h2]], 18 - grow * 8, mixCol(OCHRE, SUMI, .3), 'ink', .2);
    for (let b2 = 0; b2 < 3; b2++) { if (grow < .3 + b2 * .25) break;
      const by = 820 - h2 * (.4 + b2 * .2);
      inkLine([[880, by], [880 + (b2 % 2 ? 140 : -140), by - 70]], 7 - b2 * 2, mixCol(OCHRE, SUMI, .3), 'ink', .3); }
    // 最后一拍树顶白花
    if (grow >= 1) { const fk = ease(clamp((lt - 1.74) / .3));
      for (let pi = 0; pi < 5; pi++) { const a = pi / 5 * TAU;
        paint(ellPts(880 + Math.cos(a) * 16, 820 - h2 - Math.sin(a) * 16, 12, 9, 8, 2), { wash: '#FBF5E6', washOp: 255 * fk, ink: SUMI, sw: .7 }); } }
    // 根须钻出土爬向画框
    if (lt > 1.2) { const rp = ease(clamp((lt - 1.2) / 1.4));
      inkLine([[880, 850], [1100, 870], [1300 + rp * 600, 890]], 3, mixCol(OCHRE, SUMI, .4), 'ink', .3);
      inkLine([[920, 862], [1150, 900], [1380 + rp * 500, 930]], 2, mixCol(OCHRE, SUMI, .4), 'ink', .35); }
    // 阿宿看着树长（surprised）
    const u = 18;
    pc(300, 850, u, { view: 'q', dip: misreg(t), ...feel('surprised', t8(t)), boilKey: 'a4c', draw: belt });
    camEnd(); sheetFrame(1);
  }

  // ---- V53 · 手伸进墨盆，墨面倒影里的城 ----
  function V53(t, lt) {
    mountBG(t, { goma: 8, gomaK: 'v53' });
    // 墨盆（大椭圆）
    paint(ellPts(960, 720, 460, 220, 30, 6), { wash: mixCol(SUMI, '#14121A', .5), washOp: 255, ink: SUMI, sw: 2.4 });
    // 墨面倒影：纸白线的城
    boilSeed('v53city');
    for (let i = 0; i < 6; i++) { const bx = 720 + i * 86, wob = Math.sin(t * 2 + i) * 5;
      inkLine([[bx, 660 + hash(i * 3) * 60 + wob], [bx, 780 + hash(i * 7) * 40 + wob]], 2.4, '#E8DCC0', 'inkfine', .2);
      paint([[bx - 26, 660 + hash(i * 3) * 60 + wob], [bx + 13, 636 + hash(i * 3) * 60 + wob], [bx + 52, 660 + hash(i * 3) * 60 + wob]], { ink: '#E8DCC0', sw: 1.4 }); }
    // 涟漪
    for (let i = 0; i < 2; i++) { const r = frac(t * .35 + i / 2) * 380 + 30;
      paint(ellPts(960, 720, r, r * .34, 24, 3), { ink: mixCol(SUMI, WASHI, .55), sw: 1 }); }
    // 一只手伸进墨（armR 特写）
    const dip2 = ease(clamp(lt / .9));
    const hy = lerp(320, 660, dip2);
    paint(rectPts(900, hy - 200, 120, 260, 10), { wash: CLAY, washOp: 255, ink: SUMI, sw: 2 });
    paint(rectPts(880, hy - 290, 160, 110, 10), { wash: dip2 > .9 ? mixCol(CLAY, SUMI, .7) : CLAY, washOp: 255, ink: SUMI, sw: 2 });
    sheetFrame(1);
  }

  // ---- V54 · 墨滴摊开成一座城 ----
  function V54(t, lt) {
    camBegin(960, 560, 1 + .06 * clamp(lt / 4));
    mountBG(t, { goma: 8, gomaK: 'v54' });
    // 手提着（上方）
    paint(rectPts(930, 120, 120, 200, 10), { wash: CLAY, washOp: 255, ink: SUMI, sw: 2 });
    // 墨滴落下摊开（6 拍一圈圈摊）
    const spread = ease(clamp(lt / (BEAT * 6)));
    const r = lerp(30, 430, spread);
    paint(ellPts(960, 700, r, r * .42, 26, 8 + spread * 14), { wash: mixCol(SUMI, '#14121A', .5), washOp: 245, ink: SUMI, sw: 1.8, curv: .3 });
    // 摊开后成为长安平面图：棋盘街道 + 城门
    if (spread > .8) { const gk = clamp((spread - .8) / .2);
      for (let i = 0; i < 3; i++) inkLine([[700, 660 + i * 56 * gk + 20], [1220, 660 + i * 56 * gk + 20]], 1.6, WASHI, 'inkfine', .2);
      for (let i = 0; i < 4; i++) inkLine([[800 + i * 110 * gk, 620], [800 + i * 110 * gk, 800]], 1.4, WASHI, 'inkfine', .2);
      inkLine([[880, 806], [1040, 806]], 5, WASHI, 'ink', .2); }
    camEnd(); sheetFrame(1);
  }

  // ---- V55 · 所有人同向走，最后停步抬头，被纸白洗掉 ----
  function V55(t, lt) {
    camBegin(960, 540, 1 + .04 * clamp(lt / 5));
    mountBG(t, { sky: [mixCol(OCHRE, AI, .4), 140], skyY0: 40, skyY1: 420, goma: 10, gomaK: 'v55' });
    paint(rectPts(100, 560, W - 200, 460, 4), { wash: mixCol(OCHRE, WASHI, .35), washOp: 255, ink: SUMI, sw: 1.5 });
    for (let i = 0; i < 4; i++) inkLine([[120, 640 + i * 100], [W - 120, 640 + i * 100]], 1.2, mixCol(SUMI, WASHI, .4), 'inkfine', .2);
    const stop = lt > 3.9;   // 最后 1.5s 集体停步抬头
    const walkP = stop ? 0 : t8(t) * 2;
    // 30+ 灰群演同向走
    for (let i = 0; i < 26; i++) { const lane = i % 4, sp = .012 + hash(i * 5) * .012;
      let ex = frac(hash(i * 3) + (stop ? 0 : t * sp)) * (W - 300) + 180;
      const ey = 660 + lane * 96 + hash(i * 7) * 30;
      if (stop) { extra(ex, ey, 5 + hash(i) * 2, null, misreg(t), i);   // 停步
        // 抬头：画一条向上视线
        inkLine([[ex + 8, ey - 60], [ex + 14, ey - 88]], 1.2, mixCol(SUMI, '#8A8078', .4), 'inkfine', .2);
      } else extra(ex, ey, 5 + hash(i) * 2, walkP + i, misreg(t), i); }
    // 群演唯一一次有眼睛：停步瞬间画两只白点眼
    if (stop) for (let i = 0; i < 8; i++) { const ex = frac(hash(i * 3)) * (W - 300) + 180, ey = 660 + (i % 4) * 96;
      paint(rectPts(ex - 10, ey - 44, 5, 12, 1), { wash: '#FBF5E6', washOp: 255, ink: null });
      paint(rectPts(ex + 6, ey - 44, 5, 12, 1), { wash: '#FBF5E6', washOp: 255, ink: null }); }
    // 阿宿在中间
    const u = 20, ax = 960;
    kasa(ax, 850 - 8 * u, u, { back: 1, dip: misreg(t) });
    pc(ax, 850, u, { view: stop ? 'front' : 'side', dip: misreg(t), walk: stop ? null : walkP,
      eyes: stop ? 'wide' : 'normal', boilKey: 'a4c', draw: belt });
    // 纸白从底部淹上来洗掉人
    if (lt > 4.6) washPaper((lt - 4.6) / .9, 'bottom');
    camEnd(); sheetFrame(1);
  }

  shots([[143.20, V50], [145.80, V51], [148.50, V52], [153.20, V53], [155.30, V54], [158.12, V55]]);
})();
