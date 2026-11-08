// inter.js — 间奏 101.81–123.50 · 长卷滑过十景（V34–V43），每幅 2.17s
(() => {
  const D = 2.169;
  // 通用长卷框架：index = 第几景，localFrac = 幅内进度
  function scrollBG(t, i) {
    const slide = -frac(i / 10 + clamp((t - 101.81) / (D * 10)) * 0) ; // 相机在每幅内轻微滑
    mountBG(t, { goma: 10, gomaK: 'in' + i });
    return i;
  }
  // ---- V34 瀑 ----
  function V34(t, lt) {
    mountBG(t, { sky: [AI, 180], skyY0: 50, skyY1: 420, goma: 14, gomaK: 'v34' });
    // 山壁
    paint([[0, 0], [W, 0], [W, 300], [700, 360], [400, 320], [0, 420]], { wash: mixCol(AI, SUMI, .35), washOp: 255, ink: SUMI, sw: 1.6, curv: .3 });
    // 瀑布（纸白）每拍落一层
    const ph = frac(t8(t) * .8);
    for (let i = 0; i < 4; i++) { const yy = 340 + ((ph + i / 4) % 1) * 420;
      paint(rectPts(760, yy, 160, 60, 4), { wash: '#FBF5E6', washOp: 235, ink: mixCol(SUMI, WASHI, .4), sw: .8 }); }
    inkLine([[740, 340], [740, 780]], 2, SUMI, 'ink', .2); inkLine([[940, 340], [940, 780]], 2, SUMI, 'ink', .2);
    // 潭（靛青近黑）+ 涟漪 + 两只白鹭
    paint([[0, 780], [W, 780], [W, H], [0, H]], { wash: mixCol(AI, SUMI, .6), washOp: 255, ink: null });
    for (let i = 0; i < 3; i++) { const r = frac(t * .4 + i / 3) * 200 + 20;
      paint(ellPts(840, 850, r, r * .18, 20, 3), { ink: mixCol(SUMI, WASHI, .5), sw: 1 }); }
    for (const [bx, dir] of [[300, 1], [1500, -1]]) { const bx2 = bx + Math.sin(t * .8) * 160 * dir;
      paint(ellPts(bx2, 880, 34, 12, 8, 2), { wash: '#FBF5E6', washOp: 255, ink: SUMI, sw: .9 }); }
    sheetFrame(1);
  }
  // ---- V35 松雪 ----
  function V35(t, lt) {
    mountBG(t, { sky: ['#B9C4CE', 160], skyY0: 50, skyY1: 460, goma: 12, gomaK: 'v35' });
    paint([[0, 900], [W, 870], [W, H], [0, H]], { wash: mixCol(WASHI, '#FFFFFF', .3), washOp: 200, ink: null });
    for (const [px, s] of [[360, 1.2], [900, 1.5], [1460, 1.1]]) {
      inkLine([[px, 900], [px, 620 - 60 * s]], 12 * s, OCHRE, 'ink', .2);
      for (let k = 0; k < 3; k++) { const py = 660 - k * 110 * s, w2 = 200 * s * (1 - k * .22);
        paint([[px - w2, py], [px, py - 66 * s], [px + w2, py]], { wash: MIDORI, washOp: 245, ink: SUMI, sw: 1.3, curv: .3 });
        paint([[px - w2 * .8, py - 2], [px, py - 30 * s], [px + w2 * .8, py - 2]], { wash: '#FBF5E6', washOp: 230, ink: null, curv: .3 }); } // 雪压垫
      // 枝被压弯弹回
      push(); translate(px + 120 * s, 700); rotate(Math.sin(t8(t) * 1.2) * .04);
      paint([[0, 0], [90 * s, -30], [170 * s, -80]], { wash: MIDORI, washOp: 245, ink: SUMI, sw: 1.1, curv: .3 }); pop();
    }
    // 雀飞起
    const bp = frac(t * .5);
    paint(ellPts(600 + bp * 300, 500 - bp * 200, 16, 10, 8), { wash: '#FBF5E6', washOp: 255, ink: SUMI, sw: .9 });
    snow(t, 7, 'v35', 100, W - 100, 60, 900, .8);
    sheetFrame(1);
  }
  // ---- V36 怒涛 ----
  function V36(t, lt) {
    mountBG(t, { sky: [AI, 190], skyY0: 40, skyY1: 400, goma: 12, gomaK: 'v36' });
    const rise = clamp(lt / 2);
    const waveX = lerp(W + 300, 900, ease(rise));
    paint([[waveX, H], [waveX - 180, 900], [waveX - 60, 620], [waveX + 80, 420 - rise * 120], [waveX + 320, 560], [waveX + 560, 380], [W + 80, 500], [W + 80, H]],
      { wash: AI, washOp: 245, ink: SUMI, sw: 2.4, curv: .3 });
    // 浪爪
    for (let i = 0; i < 4; i++) { const cx2 = waveX + 40 + i * 150, cy = 400 - rise * 110 + i * 40;
      paint([[cx2, cy], [cx2 - 40, cy - 110 - i * 20], [cx2 + 10, cy - 160 - i * 12], [cx2 + 60, cy - 60]], { wash: AI, washOp: 255, ink: SUMI, sw: 1.6, curv: .3 }); }
    // 泡沫纸白
    for (let i = 0; i < 6; i++) paint(ellPts(waveX - 100 - i * 60, 860 - i * 70, 40 - i * 4, 22 - i * 2, 10, 4), { wash: '#FBF5E6', washOp: 255, ink: SUMI, sw: 1 });
    // 礁石
    paint([[100, H], [180, 800], [320, 760], [430, H]], { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1.8, curv: .3 });
    sheetFrame(1);
  }
  // ---- V37 火（间奏红顶点） ----
  function V37(t, lt) {
    paint(rectPts(-40, -40, W + 80, H + 80, 3), { wash: mixCol(BENI, '#7A1E18', .35), washOp: 255, ink: null });
    // 黑骨屋架
    for (let i = 0; i < 4; i++) { const hx = 140 + i * 440;
      paint([[hx, 980], [hx, 560], [hx + 180, 440], [hx + 360, 560], [hx + 360, 980]], { wash: '#1E1A22', washOp: 210, ink: null, curv: .2 }); }
    // 火三档跳 + 纸白火星
    for (let i = 0; i < 5; i++) { const fx = 240 + i * 380, fy = 900;
      const h2 = 160 + Math.sin(t8(t) * 2.4 + i) * 70;
      paint([[fx - 90, fy], [fx - 40, fy - h2 * .7], [fx, fy - h2], [fx + 50, fy - h2 * .5], [fx + 100, fy]],
        { wash: i % 2 ? BENI : mixCol(BENI, KIN, .35), washOp: 255, ink: null, curv: .3 }); }
    sparks(t, 8, 'v37', 960, 700, 700);
    // 一个陶土 Clawd 从村口跑出（scared）
    const rx = lerp(1700, 500, clamp(lt / 1.9));
    pc(rx, 980, 20, { view: 'side', dip: misreg(t), ...feel('scared', t8(t)), walk: t8(t) * 4, boilKey: 'v37c', draw: belt });
    // 浓烟
    for (let i = 0; i < 4; i++) mist(180 + i * 40, 900, 70, mixCol(SUMI, '#4A4450', .4), 110 + i * 20);
    sheetFrame(1);
  }
  // ---- V38 断桥 ----
  function V38(t, lt) {
    mountBG(t, { sky: [AI, 150], skyY0: 50, skyY1: 440, goma: 12, gomaK: 'v38' });
    paint([[0, 840], [W, 820], [W, H], [0, H]], { wash: AI_LT, washOp: 140, ink: null });
    // 断成两半各向两边塌
    const fall = ease(clamp(lt / 1.4));
    for (const s of [-1, 1]) { push(); translate(960 + s * fall * 120, 760 + fall * 60); rotate(s * fall * .1);
      paint(rectPts(s < 0 ? -700 : 60, -80, 640, 160, 6), { wash: mixCol(OCHRE, WASHI, .3), washOp: 255, ink: SUMI, sw: 1.8 });
      for (let i = 0; i < 6; i++) paint(rectPts((s < 0 ? -660 : 100) + i * 105, -110, 22, 50, 3), { wash: BENI, washOp: 255, ink: SUMI, sw: 1 }); pop(); }
    // 断口纸白新茬 + 掉石头 + 漂桥板
    paint([[900, 700], [960, 780], [1020, 700], [960, 660]], { wash: WASHI, washOp: 255, ink: SUMI, sw: 1.2 });
    for (let i = 0; i < 3; i++) { const age = lt - .5 - i * .4; if (age < 0) continue;
      const py = 800 + easeIn(clamp(age)) * 160, px2 = 960 + Math.sin(age * 3) * 40;
      paint(ellPts(px2, py, 18, 14, 8, 3), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1 }); }
    const bp = frac(t * .12);
    push(); translate(300 + bp * 900, 950); rotate(.06);
    paint(rectPts(-90, -16, 180, 32, 4), { wash: mixCol(OCHRE, WASHI, .3), washOp: 255, ink: SUMI, sw: 1.2 }); pop();
    sheetFrame(1);
  }
  // ---- V39 竹林 ----
  function V39(t, lt) {
    mountBG(t, { goma: 10, gomaK: 'v39' });
    boilSeed('bamboo');
    for (let i = 0; i < 16; i++) { const bx = 80 + i * 122 + hash(i * 7) * 60, lean = Math.sin(t8(t) * 1.1 + i) * 22;
      const sw2 = 8 + hash(i * 3) * 10;
      inkLine([[bx, H + 40], [bx + lean, 620], [bx + lean * 1.6, 160]], sw2, mixCol(MIDORI, SUMI, .35), 'ink', .3);
      for (let l2 = 0; l2 < 4; l2++) { const ly = 220 + l2 * 130;
        paint([[bx + lean * (ly / 500), ly], [bx + lean * (ly / 500) + 70, ly - 26], [bx + lean * (ly / 500) + 130, ly]], { wash: MIDORI, washOp: 235, ink: SUMI, sw: .9, curv: .3 }); } }
    // 猫蹿过
    const cp = frac(t * .4);
    if (cp < .5) { const cx2 = lerp(200, 1700, cp * 2);
      paint(ellPts(cx2, 1010, 44, 24, 10, 3), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1.1 });
      paint(ellPts(cx2 + 46, 986, 20, 16, 8, 2), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1 });
      inkLine([[cx2 - 40, 1000], [cx2 - 80, 980]], 4, OCHRE, 'ink', .3); }
    sheetFrame(1);
  }
  // ---- V40 刀塚 ----
  function V40(t, lt) {
    mountBG(t, { sky: [mixCol(OCHRE, SUMI, .4), 150], skyY0: 50, skyY1: 430, goma: 12, gomaK: 'v40' });
    paint([[0, 860], [W, 840], [W, H], [0, H]], { wash: OCHRE, washOp: 235, ink: SUMI, sw: 1.4 });
    boilSeed('blades');
    for (let i = 0; i < 18; i++) { const bx = 120 + i * 100 + hash(i * 7) * 40, h2 = 200 + hash(i * 3) * 260;
      const quiver = i === 7 ? Math.sin(t8(t) * 3) * 6 : 0;
      paint(rectPts(bx - 7 + quiver, 860 - h2, 14, h2, 3), { wash: '#EDE3CC', washOp: 255, ink: SUMI, sw: 1.1 });
      paint(rectPts(bx - 22 + quiver, 852, 44, 22, 3), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1 }); }
    // 乌鸦落刀柄
    const land = clamp(lt / 1);
    const rx = lerp(-100, 820, ease(land)), ry = lerp(300, 860 - 470, ease(land));
    paint(ellPts(rx, ry, 30, 18, 10, 2), { wash: SUMI, washOp: 245, ink: null });
    paint(ellPts(rx + 22, ry - 14, 12, 10, 8), { wash: SUMI, washOp: 245, ink: null });
    if (land >= 1 && lt > 1) paint(rectPts(rx - 6, ry + 16, 5, 14, 2), { wash: KIN, washOp: 220, ink: null });
    sheetFrame(1);
  }
  // ---- V41 空城 ----
  function V41(t, lt) {
    mountBG(t, { sky: [AI, 150], skyY0: 50, skyY1: 430, goma: 12, gomaK: 'v41' });
    paint(rectPts(140, 560, W - 280, 460, 5), { wash: mixCol(OCHRE, WASHI, .35), washOp: 255, ink: SUMI, sw: 1.6 });
    // 城门大开
    paint([[760, 1020], [760, 640], [960, 580], [1160, 640], [1160, 1020]], { wash: mixCol(OCHRE, WASHI, .2), washOp: 255, ink: SUMI, sw: 1.8, curv: .3 });
    // 翻倒的车
    push(); translate(420, 950); rotate(.5);
    paint(rectPts(-90, -50, 180, 90, 5), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1.3 });
    paint(ellPts(-60, 55, 26, 26, 10), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1.1 });
    paint(ellPts(60, 55, 26, 26, 10), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1.1 }); pop();
    // 晾着的衣服飘
    inkLine([[1300, 700], [1700, 690]], 1.6, SUMI, 'ink', .2);
    for (let i = 0; i < 3; i++) { const cx3 = 1360 + i * 120;
      push(); translate(cx3, 700 + Math.sin(t * 2 + i) * 8); rotate(Math.sin(t * 1.6 + i) * .08);
      paint(rectPts(-30, 0, 60, 130, 5), { wash: i % 2 ? MOE : '#EDE3CC', washOp: 230, ink: SUMI, sw: 1 }); pop(); }
    // 狗穿街
    const dx3 = frac(t * .07) * (W - 500) + 250;
    paint(rectPts(dx3, 980, 60, 32, 3), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1 });
    paint(rectPts(dx3 + 52, 962, 24, 24, 3), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1 });
    // 一扇窗自己合上
    if (lt > 1.2) { const ck = ease(clamp((lt - 1.2) / .5));
      paint(rectPts(1520, 760 - 120 * (1 - ck), 130, 120 * ck + 6, 3), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1.2 }); }
    sheetFrame(1);
  }
  // ---- V42 残月 ----
  function V42(t, lt) {
    mountBG(t, { sky: [mixCol(AI, SUMI, .3), 190], skyY0: 40, skyY1: 520, goma: 14, gomaK: 'v42' });
    // 半个纸白月，下半被黑线切掉（缺口每拍蚀一点）
    const erode = clamp(lt / 2) * 26;
    paint(ellPts(560, 330, 130, 130, 30, 5), { wash: '#FBF6EA', washOp: 255, ink: null });
    paint(rectPts(400, 330 + erode * 0, 340, 140 + erode, 4), { wash: mixCol(AI, SUMI, .3), washOp: 255, ink: null });
    line(430, 330 + erode, 700, 330 + erode, 2.4, SUMI, 'ink', .3);
    // 地平线小人走过
    paint([[0, 880], [W, 860], [W, H], [0, H]], { wash: mixCol(OCHRE, WASHI, .5), washOp: 255, ink: SUMI, sw: 1.2 });
    const wx = 200 + clamp(lt / 2) * 1500;
    kasa(wx, 870 - 8 * 6, 6, { back: 1, dip: misreg(t) });
    pc(wx, 870, 9, { view: 'side', dip: misreg(t), walk: t8(t) * 2.4, eyes: 'normal', boilKey: 'v42c' });
    sheetFrame(1);
  }
  // ---- V43 白纸：卷轴滑到头，雪开始落 ----
  function V43(t, lt) {
    paint(rectPts(-40, -40, W + 80, H + 80, 3), { wash: WASHI, washOp: 255, ink: null });
    goma(16, 'v43');
    // 0.8s 第一片雪落定在中央，然后每拍多一片
    const n = lt < .8 ? 0 : Math.min(10, Math.floor((lt - .8) / BEAT) + 1);
    for (let i = 0; i < n; i++) { const sx = 880 + hash(i * 7) * 180 - 90, sy = 500 + hash(i * 3) * 160;
      const drop = i === 0 ? easeOut(clamp((lt - .8) / .2)) : 1;
      paint(ellPts(sx, lerp(100, sy, drop), 5 + hash(i) * 3, 5 + hash(i) * 3, 8), { fill: '#FBF6EA', fillOp: 255, ink: mixCol(SUMI, WASHI, .5), sw: .7 }); }
    sheetFrame(1);
  }

  const T0 = 101.81;
  const list = [V34, V35, V36, V37, V38, V39, V40, V41, V42, V43].map((fn, i) => [T0 + i * D, fn]);
  shots(list);
})();
