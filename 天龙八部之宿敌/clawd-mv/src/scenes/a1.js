// a1.js — A1 22.30–42.04 · 我在每一幅画里找你（V08–V13）
(() => {
  // ---- V08 · 雪中的桥，阿宿背身走过（卷轴滑） ----
  function V08(t, lt) {
    const slide = clamp((lt) / .5) * 260;                      // 入画滑移（卷轴感）
    camBegin(960 - slide, 540, 1);
    mountBG(t, { sky: [AI, 210], skyY0: 60, skyY1: 560, goma: 22, gomaK: 'v08' });
    // 远山 + 河（纸白）+ 朱栏桥
    paint([[0, 560], [360, 430], [820, 560], [1280, 440], [W, 540], [W, H], [0, H]], { wash: AI_LT, washOp: 150, ink: null, curv: .3 });
    paint([[0, 860], [W, 830], [W, H], [0, H]], { wash: mixCol(WASHI, '#FFFFFF', .4), washOp: 130, ink: null });
    // 拱桥
    paint([[240, 900], [420, 700], [960, 640], [1500, 700], [1680, 900], [1680, 980], [240, 980]],
      { wash: mixCol(OCHRE, WASHI, .3), washOp: 255, ink: SUMI, sw: 2, curv: .35 });
    for (let i = 0; i < 9; i++) { const x = 340 + i * 160;   // 朱栏柱
      const top = 700 - Math.sin(i / 8 * Math.PI) * -40;
      paint(rectPts(x, 620 - Math.sin((x - 240) / 1440 * Math.PI) * 60, 18, 160, 3), { wash: BENI, washOp: 255, ink: SUMI, sw: 1.1 }); }
    inkLine([[240, 660], [960, 600], [1680, 660]], 7, BENI, 'ink', .35);
    // 阿宿背身走过桥
    const wx = lerp(420, 1180, clamp(lt / 1.9));
    kasa(wx, 640 - 8 * 19, 19, { back: 1, dip: misreg(t) });
    backSwords(wx, 640 - 8 * 19, 19, misreg(t));
    pc(wx, 640, 19, { view: 'back', walk: t8(t) * 2.2, eyes: 'normal', boilKey: 'a1c', draw: belt });
    snow(t, 10, 'v08', 100, W - 100, 80, 950);
    camEnd(); sheetFrame(1);
  }

  // ---- V09 · 雪中山道，远处人影 ----
  function V09(t, lt) {
    const slide = clamp(lt / .45) * 240;
    camBegin(960 - slide, 540, 1);
    mountBG(t, { sky: [AI, 200], skyY0: 60, skyY1: 520, goma: 20, gomaK: 'v09' });
    // 山道 S 形
    paint([[0, 980], [300, 800], [760, 900], [1200, 760], [W, 840], [W, H], [0, H]], { wash: mixCol(OCHRE, WASHI, .5), washOp: 255, ink: SUMI, sw: 1.5, curv: .3 });
    // 远处人影：随格换位
    const cell = Math.floor(lt / .9), fx = [1250, 900, 1500, 1050][cell % 4];
    const far = cell >= 2;
    paint(rectPts(fx, far ? 730 : 700, 66, 96, 4), { wash: far ? mixCol(FEN, WASHI, .45) : FEN, washOp: far ? 170 : 230, ink: far ? mixCol(SUMI, WASHI, .4) : SUMI, sw: 1.2 });
    // 阿宿近景小
    kasa(560, 830 - 8 * 16, 16, { back: 1, dip: misreg(t) });
    pc(560, 830, 16, { view: 'q', walk: t8(t) * 2, eyes: 'look', lookX: .8, boilKey: 'a1c', draw: belt });
    snow(t, 9, 'v09', 100, W - 100, 80, 950);
    camEnd(); sheetFrame(1);
    if (t > 26.4 && t < 26.7) {   // 结尾人影消失，只剩雪
      paint(rectPts(fx - 40, 640, 160, 220, 4), { wash: WASHI, washOp: 255 * ease((t - 26.4) / .3), ink: null });
    }
  }

  // 枫叶（momiji）：五瓣从中心放射（圆头瓣，椭圆填充稳）+ 斜柄（2026-11-07 修：五角星出戏）
  const maple = (cx, cy, r, rot, col, sw = .8) => {
    push(); translate(cx, cy); rotate(rot);
    for (let i = 0; i < 5; i++) {
      push(); rotate((-75 + i * 37.5) * Math.PI / 180);
      paint(ellPts(0, -r * .52, r * .22, r * .55, 12), { wash: col, washOp: 255, ink: SUMI, sw: sw * .9 });
      pop();
    }
    paint(ellPts(0, 0, r * .18, r * .18, 10), { wash: mixCol(col, SUMI, .3), ink: null });
    inkLine([[0, .05 * r], [.36 * r, .44 * r]], sw * .8, mixCol(SUMI, OCHRE, .4), 'inkfine', 0);
    pop();
  };

  // ---- V10 · 桥上相对：朱印先落，同时转头 ----
  function V10(t, lt) {
    mountBG(t, { sky: [AI, 190], skyY0: 60, skyY1: 500, goma: 20, gomaK: 'v10' });
    paint([[0, 900], [W, 870], [W, H], [0, H]], { wash: mixCol(WASHI, '#FFFFFF', .35), washOp: 150, ink: null });
    inkLine([[0, 890], [W, 870]], 2, SUMI, 'ink', .3);
    // 极前景红枫（左缘伸入）
    push(); translate(-30, 120); rotate(.1);
    inkLine([[0, 0], [330, 180], [640, 260]], 6, OCHRE, 'ink', .4);
    for (let i = 0; i < 5; i++) { const p = [330 + i * 78, 180 + i * 16];
      maple(p[0], p[1], 46, (i - 2) * .35 + .1, i % 2 ? MOE : mixCol(MOE, '#C4584A', .4)); }
    pop();
    // 两个 Clawd 相对（side 视图）
    const u = 33, yG = 860;
    const turnK = ease(clamp((t - 29.0) / .35));     // 同时转头（8fps 换 view）
    const va = turnK < .5 ? 'side' : 'q';
    kasa(700, yG - 8 * u, u, { back: 1, dip: misreg(t) });
    pc(700, yG, u, { view: va, flip: false, eyes: turnK > .5 ? 'wide' : 'look', lookX: .7, boilKey: 'a10a', draw: belt });
    kasa(1240, yG - 8 * u, u, { tilt: .5, dip: misreg(t), col: mixCol(MIDORI, SUMI, .2) });
    pc(1240, yG, u, { view: va, flip: true, tint: 'rosy', tintK: 1, eyes: turnK > .5 ? 'narrow' : 'look', lookX: -.7, boilKey: 'a10b' });
    // 枫叶每拍落一片
    for (let i = 0; i < 4; i++) { const t0 = 28.3 + i * BEAT; if (t < t0) break;
      const p = easeOut((t - t0) / 1.1);
      maple(500 + 40 * i + Math.sin(p * 5) * 30, 300 + 480 * p, 15 + 4 * i, p * 4 + i, i % 2 ? MOE : mixCol(MOE, '#C4584A', .4), .7); }
    // ① 朱印先落（1.2s = 29.0）
    if (t > 29.02) seal(960, 400, 120, '命', t < 29.24 ? 1.35 - .35 * easeOut((t - 29.02) / .22) : 1, .04);
    if (t > 29.02 && t < 29.4) { const [sx, sy] = shakeXY(t - 29.02, 4); }
    sheetFrame(1);
  }

  // ---- V11 · 白鹭飞出画框 ----
  function V11(t, lt) {
    mountBG(t, { sky: [AI, 170], skyY0: 60, skyY1: 480, goma: 16, gomaK: 'v11' });
    paint([[0, 940], [W, 900], [W, H], [0, H]], { wash: AI_LT, washOp: 120, ink: null });
    // 白鹭（纸白只有轮廓），每拍扇翅，飞向右上并越框
    const p = ease(clamp(lt / 2.3));
    const ex = lerp(300, 1780, p), ey = lerp(820, 180, p) - Math.sin(p * 9) * 40;
    const flap = Math.abs(Math.sin(t8(t) * 1.4 * TAU));
    push(); translate(ex, ey); rotate(-.2);
    paint([[0, 0], [90, -20 - flap * 90], [200, -flap * 130], [110, 30]], { wash: '#FBF5E6', washOp: 255, ink: SUMI, sw: 1.6, curv: .4 });
    paint([[0, 0], [-70, -10 - flap * 60], [-150, -flap * 90], [-60, 26]], { wash: '#FBF5E6', washOp: 255, ink: SUMI, sw: 1.6, curv: .4 });
    inkLine([[0, 4], [36, 12]], 2, mixCol(KIN, SUMI, .3), 'ink', .2);
    pop();
    // 阿宿在左下仰头看
    kasa(300, 860 - 8 * 17, 17, { back: 1, dip: misreg(t) });
    pc(300, 860, 17, { view: 'q', eyes: 'look', lookY: -1, lookX: .9, boilKey: 'a1c', draw: belt });
    sheetFrame(1);
    // 越框：线宽变细的暗示（用第二次细框闪一下）
    if (p > .8 && p < .9) paint(rectPts(44, 44, W - 88, H - 88, 3), { ink: mixCol(SUMI, WASHI, .5), sw: 2 });
  }

  // ---- V12 · 装裱边里横移，经过四幅画的边角 ----
  function V12(t, lt) {
    paint(rectPts(-60, -60, W + 120, H + 120, 2), { wash: MOUNT, washOp: 255, ink: null });
    const slide = lerp(0, 2400, clamp(lt / 2.4));
    // 四幅画依次经过（每幅补一块色）
    const cells = [[AI, '海'], [MIDORI, '松'], [OCHRE, '塔'], [BENI, '火']];
    cells.forEach(([col, kind], i) => {
      const cx = 480 + i * 640 - slide; if (cx < -500 || cx > W + 500) return;
      paint(rectPts(cx - 260, 140, 520, 800, 3), { wash: WASHI, washOp: 255, ink: SUMI, sw: 1.6 });
      const land = clamp((lt - i * .6) / .25);
      if (land > 0) { push(); translate(lerp(6, 0, easeOut(land)), lerp(-5, 0, easeOut(land)));
        if (kind === '海') { paint([[cx - 240, 500], [cx, 420], [cx + 240, 500], [cx + 240, 920], [cx - 240, 920]], { wash: col, washOp: 200 * land, ink: null, curv: .3 });
          paint(ellPts(cx, 470, 60, 18, 10, 3), { wash: '#FBF5E6', washOp: 255, ink: SUMI, sw: 1 }); }
        if (kind === '松') { paint(rectPts(cx - 200, 560, 400, 340, 4), { wash: col, washOp: 210 * land, ink: null });
          paint(ellPts(cx, 420, 130, 70, 14, 4), { wash: mixCol(col, SUMI, .2), washOp: 220 * land, ink: SUMI, sw: 1.2 }); }
        if (kind === '塔') { for (let k2 = 0; k2 < 4; k2++) paint(rectPts(cx - 90 + k2 * 12, 300 + k2 * 130, 180 - k2 * 24, 120, 3), { wash: col, washOp: 220 * land, ink: SUMI, sw: 1.2 }); }
        if (kind === '火') { paint([[cx - 200, 920], [cx - 60, 560], [cx + 40, 700], [cx + 180, 500], [cx + 240, 920]], { wash: col, washOp: 230 * land, ink: null, curv: .3 }); }
        pop(); }
      paint(rectPts(cx - 260, 140, 520, 800, 3), { ink: SUMI, sw: 1.8 });
    });
    // 白鹭在前，视差慢半拍
    const p = clamp(lt / 2.4), ex = 200 + p * 2200 - slide * .85, ey = 400 - p * 160;
    if (ex > -100 && ex < W + 100) { const flap = Math.abs(Math.sin(t8(t) * 1.4 * TAU));
      push(); translate(ex, ey);
      paint([[0, 0], [80, -16 - flap * 70], [170, -flap * 100], [95, 24]], { wash: '#FBF5E6', washOp: 255, ink: SUMI, sw: 1.4, curv: .4 }); pop(); }
    sheetFrame(1);
  }

  // ---- V13 · 两把刀交叉，A1 重音，第一次红 ----
  function V13(t, lt) {
    mountBG(t, { goma: 14, gomaK: 'v13' });
    // 两刀从两侧合拢（每拍进 1/4），第 4 拍交叉
    const closeK = ease(clamp(lt / 1.74));
    const off = lerp(700, 0, closeK);
    const crossed = lt > 1.5;
    for (const s of [-1, 1]) {
      push(); translate(960 + s * off, 540); rotate(s * (.62 - .06 * closeK));
      paint(rectPts(-26, -560, 52, 1120, 8), { wash: '#EDE3CC', washOp: 255, ink: SUMI, sw: 2.2 });
      paint(rectPts(-60, 480, 120, 90, 6), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1.8 });
      paint(rectPts(-34, 560, 68, 70, 6), { wash: BENI, washOp: crossed ? 255 : 180, ink: SUMI, sw: 1.4 });
      pop();
    }
    // 交叉点溅朱，每拍扩散一圈
    if (crossed) {
      const age = lt - 1.5;
      const rings = Math.min(4, Math.floor(age / BEAT) + 1);
      for (let i = 0; i < rings; i++) { const r = 30 + (age - i * BEAT) * 260;
        if (r > 0) paint(ellPts(960, 540, r, r * .8, 26, 6), { wash: BENI, washOp: clamp(200 - age * 90), ink: null }); }
      paint(ellPts(960, 540, 46, 40, 18, 5), { wash: BENI, washOp: 255, ink: null });
    }
    // 刀缝里的两个小剪影（各一只眼发亮）
    const gapK = clamp((off) / 300);
    for (const s of [-1, 1]) {
      const ex = 960 + s * 90 * (1 - closeK), ey = 780;
      paint(rectPts(ex - 52, ey - 96, 104, 150, 5), { wash: s < 0 ? CLAY : FEN, washOp: 255, ink: SUMI, sw: 1.6 });
      paint(rectPts(ex - 16, ey - 70, 12, 30, 2), { wash: '#FBF5E6', washOp: 255, ink: null });
    }
    if (crossed) flash(clamp((lt - 1.5) / .15) * Math.exp(-(lt - 1.65) * 5), '#FBF6EA');
    sheetFrame(1);
  }

  shots([[22.30, V08], [24.30, V09], [27.82, V10], [31.90, V11], [34.40, V12], [37.12, V13]]);
})();
