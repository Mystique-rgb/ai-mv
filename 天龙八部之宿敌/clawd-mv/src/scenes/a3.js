// a3.js — A3 123.50–142.40 · 雪把盒子埋了（V44–V49）
(() => {
  // ---- V44 · 海上孤岛，雪成斜线 ----
  function V44(t, lt) {
    camBegin(960, 540, 1 + .06 * clamp(lt / 2.5));
    mountBG(t, { sky: ['#B9C4CE', 180], skyY0: 40, skyY1: 470, goma: 12, gomaK: 'v44' });
    // 海
    paint([[0, 760], [W, 740], [W, H], [0, H]], { wash: AI, washOp: 210, ink: null, curv: .3 });
    for (let i = 0; i < 5; i++) inkLine([[0, 800 + i * 60], [W, 790 + i * 60 + hash(i) * 20]], 1.4, mixCol(WASHI, AI, .5), 'inkfine', .3);
    // 岛：礁石 + 歪松
    push(); translate(960, 780); rotate(Math.sin(t8(t) * 1.1) * .015);
    paint([[-320, 40], [-180, -120], [0, -90], [200, -140], [340, 30], [300, 90], [-300, 90]], { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1.8, curv: .3 });
    inkLine([[-40, -90], [-60, -260]], 10, OCHRE, 'ink', .2);
    for (let k = 0; k < 2; k++) paint([[-150 + k * 130, -230 - k * 30], [-60 + k * 130, -290 - k * 34], [40 + k * 130, -230 - k * 30]], { wash: MIDORI, washOp: 240, ink: SUMI, sw: 1.2, curv: .3 });
    pop();
    // 三道雾带横移
    for (let i = 0; i < 3; i++) mist(470 + i * 90, 900 + i * 200, 44, '#F3EBDC', 120 + Math.sin(t + i * 2) * 40);
    // 阿宿礁石上（sad）
    const u = 18;
    kasa(960, 700 - 8 * u, u, { back: 1, dip: misreg(t) });
    pc(960, 700, u, { view: 'q', dip: misreg(t), ...feel('sad', t8(t)), boilKey: 'a3c', draw: belt });
    // 斜线雪（风）
    boilSeed('v44snow');
    for (let i = 0; i < 12; i++) { const s = hash(i * 7.7);
      const ph = frac(s + t * .04), x = frac(s * 3 + t * .01) * W;
      const y = 60 + ph * 800;
      inkLine([[x, y], [x - 34, y + 16]], 1.6, mixCol(SUMI, WASHI, .35), 'inkfine', 0); }
    camEnd(); sheetFrame(1);
  }

  // ---- V45 · 抱膝坐，斗笠全遮（允许处 2） ----
  function V45(t, lt) {
    camBegin(960, 560, lerp(1, 1.16, ease(clamp(lt / 2.5))));
    paint(rectPts(-60, -60, W + 120, H + 120, 2), { wash: MOUNT, washOp: 255, ink: null });
    paint(rectPts(28, 28, W - 56, H - 56, 3), { wash: WASHI, washOp: 255, ink: null });
    bokashi('v45sky', '#B9C4CE', 150, 40, 430);
    // 海 + 礁石（礁石跟着人走）
    paint(rectPts(28, 860, W - 56, 190, 3), { wash: AI, washOp: 200, ink: null });
    push(); translate(720, 880);
    paint([[-460, 0], [-300, -190], [-60, -150], [200, -200], [440, -30], [400, 60], [-420, 60]],
      { wash: OCHRE, washOp: 255, ink: SUMI, sw: 2, curv: .3 });
    inkLine([[-120, -160], [-160, -260]], 6, OCHRE, 'ink', .2);
    pop();
    // 抱膝：四腿收到身前，身体缩到最小
    const u = 45, br = Math.sin(t * 1.8) * .02;
    kasa(700, 730 - 6.4 * u, u, { force: 1, worn: 1, dip: misreg(t), tilt: .1 });
    pc(700, 730, u, { view: 'front', dip: misreg(t), sq: .28 + br, dy: -1.6, aL: 1.2, aR: 1.2,
      eyes: 'closed', mouth: 'flat', boilKey: 'a3c', draw: belt });
    // 雪落在笠上每拍多一层
    const flakes = Math.min(20, 3 + Math.floor(lt / BEAT));
    boilSeed('v45cap');
    for (let i = 0; i < flakes; i++) { const a = hash(i * 9) * Math.PI;
      paint(ellPts(700 + Math.cos(a) * 4.6 * u, 730 - 6.4 * u - Math.abs(Math.sin(a)) * 2.8 * u - 6, 8, 6, 6), { fill: '#FBF5E6', fillOp: 245, ink: null }); }
    snow(t, 8, 'v45', 80, W - 80, 60, 900);
    camEnd(); sheetFrame(1);
  }

  // ---- V46 · 极特写：雪落枯枝，不化 ----
  function V46(t, lt) {
    mountBG(t, { goma: 6, gomaK: 'v46' });
    // 枯枝墨线
    push(); translate(200, 300); rotate(-.2);
    inkLine([[0, 0], [700, 200], [1400, 420]], 8, SUMI, 'ink', .35);
    inkLine([[700, 200], [900, 90]], 5, SUMI, 'ink', .3);
    pop();
    // 已有 5 片雪，第 6 片落下时枝尖颤
    boilSeed('v46snow');
    for (let i = 0; i < 5; i++) { const p = [[620, 480], [900, 500], [1240, 610], [860, 380], [1420, 660]][i];
      paint(ellPts(p[0], p[1], 9, 7, 8, 2), { fill: '#FBF6EA', fillOp: 255, ink: mixCol(SUMI, WASHI, .45), sw: .7 }); }
    const drop = easeOut(clamp((lt - 1.1) / .5));
    const trem = drop >= 1 && lt < 2 ? Math.sin((lt - 1.6) * 40) * 4 * Math.exp(-(lt - 1.6) * 4) : 0;
    push(); translate(trem, trem * .4);
    const dx4 = lerp(600, 1000, drop), dy4 = lerp(60, 350, drop * drop);
    if (drop > 0) paint(ellPts(dx4, dy4, 10, 8, 8, 2), { fill: '#FBF6EA', fillOp: 255, ink: mixCol(SUMI, WASHI, .45), sw: .7 });
    pop();
    sheetFrame(1);
  }

  // ---- V47 · 被雪埋到胸口，只有斗笠露在外面 ----
  function V47(t, lt) {
    camBegin(960, 540, lerp(1.18, .86, ease(clamp(lt / 2.3))));
    mountBG(t, { sky: ['#B9C4CE', 150], skyY0: 40, skyY1: 400, goma: 8, gomaK: 'v44' });
    paint([[0, 300], [W, 300], [W, H], [0, H]], { wash: WASHI, washOp: 255, ink: null });   // 全部雪原（纸白）
    // 水位上涨的纸白：边缘是纸纤维不是水面
    const rise = ease(clamp(lt / 1.9));   // 5 拍涨到胸口
    const yLine = lerp(760, 560, rise);
    boilSeed('v47edge');
    const pts = []; for (let i = 0; i <= 14; i++) pts.push([i / 14 * (W + 100) - 50, yLine + (hash(i * 13) - .5) * 26]);
    // 埋掉下方的阿宿身体
    const u = 36;
    pc(880, 900, u, { view: 'front', dip: misreg(t), eyes: 'closed', sq: .1, boilKey: 'a3c', draw: belt });
    // 雪面盖上去（纸白多边形从下缘涨到 yLine）
    const cover = []; for (let i = 0; i <= 14; i++) cover.push([i / 14 * (W + 100) - 50, yLine + (hash(i * 13) - .5) * 26]);
    cover.push([W + 50, H + 60], [-50, H + 60]);
    paint(cover, { wash: WASHI, washOp: 255, ink: null, curv: .35 });
    // 只有斗笠露在白外面
    kasa(880, 900 - 8 * u - (900 - yLine) * .4, u, { force: 1, worn: 1, dip: misreg(t), tilt: .08 });
    snow(t, 8, 'v47', 100, W - 100, 60, 900);
    camEnd(); sheetFrame(1);
  }

  // ---- V48 · 伸手摘海星：星是纸上的白洞 ----
  function V48(t, lt) {
    camBegin(960, 560, 1 + .05 * clamp(lt / 4.6));
    mountBG(t, { sky: [mixCol(AI, SUMI, .35), 190], skyY0: 40, skyY1: 380, goma: 8, gomaK: 'v48' });
    paint([[0, 620], [W, 600], [W, H], [0, H]], { wash: mixCol(AI, SUMI, .5), washOp: 255, ink: null });
    for (let i = 0; i < 4; i++) inkLine([[0, 700 + i * 80], [W, 690 + i * 80]], 1.3, mixCol(WASHI, AI, .55), 'inkfine', .3);
    // 阿宿弯身伸手（手臂每拍伸长）
    const u = 42, reach = ease(clamp(lt / 1.74));
    kasa(620, 780 - 8 * u, u, { back: 1, dip: misreg(t) });
    pc(620, 780, u, { view: 'side', dip: misreg(t), eyes: 'shine', lookX: 1,
      aR: lerp(.3, 1.15, reach), armR: katana(false), boilKey: 'a3c', draw: belt });
    // 海上的星：纸白小洞
    const sx = lerp(1500, 1290, reach), sy = 660;
    paint(ellPts(sx, sy, 16, 16, 12, 3), { wash: '#FBF6EA', washOp: 255, ink: null });
    // 第 5 拍碰到：淡金 bokashi 亮一下
    if (reach >= 1) { const gk = clamp((lt - 1.74) / .3) * Math.exp(-(lt - 2.04) * 1.2);
      glow(sx, sy, 220 * gk + 40, '#F5D98A', 120 * gk);
      if (gk > .05) paint(ellPts(sx, sy, 16 + 60 * gk, 16 + 60 * gk, 16, 4), { wash: KIN, washOp: 150 * gk, ink: null }); }
    snow(t, 5, 'v48', 100, W - 100, 60, 700, .7);
    camEnd(); sheetFrame(1);
  }

  // ---- V49 · 捧星而坐，唯一一次暖（4.2s） ----
  function V49(t, lt) {
    mountBG(t, { sky: [mixCol(AI, SUMI, .3), 150], skyY0: 40, skyY1: 360, goma: 6, gomaK: 'v49' });
    paint([[0, 640], [W, 620], [W, H], [0, H]], { wash: mixCol(AI, SUMI, .45), washOp: 255, ink: null });
    // 星光每拍扩一圈，雪转暖白
    const gk = ease(clamp(lt / 3.4));
    glow(960, 620, 120 + 340 * gk, '#F5D98A', 110 * gk);
    paint(rectPts(28, 28, W - 56, H - 56, 3), { wash: mixCol(WASHI, '#F6E3C0', .5 * gk), washOp: 90 * gk, ink: null });
    // 捧星坐姿
    const u = 45;
    pc(880, 850, u, { view: 'front', dip: misreg(t), ...feel('love', t8(t)), tintK: .35,
      aL: 1.05, aR: 1.05, sq: .06, boilKey: 'a3c', draw: belt });
    // 星在两手之间
    paint(ellPts(880, 850 - 5.4 * u, 15, 15, 12, 3), { wash: '#FBF6EA', washOp: 255, ink: mixCol(KIN, SUMI, .3), sw: 1 });
    // 最后一拍：眼缝第一次弯起来（0.5s）
    if (lt > 3.7) { /* emotions 已由 love 覆盖；再加抬头 */
    }
    snow(t, 6, 'v49', 100, W - 100, 60, 800, .6);
    // 右上角小印「孤」
    if (lt > 3.4) seal(1660, 200, 74, '孤', ease(clamp((lt - 3.4) / .2)), .05);
    sheetFrame(1);
  }

  shots([[123.50, V44], [126.00, V45], [128.70, V46], [131.00, V47], [133.40, V48], [138.20, V49]]);
})();
