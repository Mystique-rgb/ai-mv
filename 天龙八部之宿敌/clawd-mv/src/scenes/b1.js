// b1.js — 副歌构图 C20–C33（mode: 'b1' | 'b2' | 'b3'），B2/B3 复用同一构图 = 同一块黑骨版
// B1 61.90–101.81 正常印 · B2 163.50–203.27 印坏了（错 8px、深朱过载） · B3 205.10–243.94 只剩线（0px）
(() => {
  const line = (x0, y0, x1, y1, sw, col, br, cv) => inkLine([[x0, y0], [x1, y1]], sw, col || SUMI, br || 'ink', cv ?? .3);
  // 角色色统一口：b1/b2 陶土（主角）/ 胭脂粉（宿敌），b3 色版全撤——只剩纸白与线（主线③）。
  // 2026-11-07 修：C22/C23/C24/C26 的 b3 分支漏了这一步，B3 中段主角一直是彩色实体。
  const bodyOf = (m, who) => m === 'b3' ? { col: WASHI, dk: mixCol(WASHI, SUMI, .12), lt: WASHI }
    : who === 'F' ? { col: FEN, dk: '#B25A5E', lt: '#F7C0BC' } : { col: CLAY, dk: '#A84D33', lt: '#F2A283' };

  // ===== C20 恩怨各一半：一幅画从正中劈开，左半靛右半粉 =====
  function C20(t, lt, m) {
    const seamGrow = ease(clamp(lt / (BEAT * 5)));
    const dip = m === 'b1' ? 2 : m === 'b2' ? 8 : 0;
    const tear = m === 'b2' ? lerp(10, 76, seamGrow) : 0;
    const ghost = m === 'b3';
    // 纸与装裱
    paint(rectPts(-60, -60, W + 120, H + 120, 2), { wash: MOUNT, washOp: 255, ink: null });
    paint(rectPts(28, 28, W - 56, H - 56, 3), { wash: WASHI, washOp: 255, ink: null });
    // 两半的天（同一幅画的两半）
    if (m === 'b1') {
      paint(rectPts(28, 28, W / 2 - 28, 520, 3), { wash: mixCol(AI, WASHI, .25), washOp: 210, ink: null });
      paint(rectPts(W / 2, 28, W / 2 - 28, 520, 3), { wash: mixCol(FEN, WASHI, .35), washOp: 200, ink: null });
      bokashi('c20sky', AI, 90, 60, 560);
    } else if (m === 'b2') {
      paint(rectPts(28, 28, W - 56, H - 56, 3), { wash: mixCol(BENI, SUMI, .12), washOp: 225, ink: null });
    }
    // 地平线贯穿两半
    paint(rectPts(28, 742, W - 56, H - 56 - 714, 3), { wash: ghost ? WASHI : mixCol(OCHRE, WASHI, .28), washOp: 255, ink: null });
    inkLine([[28, 742], [W - 28, 742]], 2.4, SUMI, 'ink', 0);
    if (m === 'b2') {   // 中缝：纸真的撕开，露出木纹
      paint(rectPts(960 - tear / 2, 28, tear, H - 56, 2), { wash: '#B99463', washOp: 255, ink: null });
      boilSeed('tear');
      for (let i = 0; i < 8; i++) { const y = 80 + i * 118;
        inkLine([[960 - tear / 2, y], [960 - tear / 2 - 12 - hash(i * 7) * 14, y + 22]], 1.2, mixCol('#8A6B44', SUMI, .3), 'inkfine', .2);
        inkLine([[960 + tear / 2, y + 40], [960 + tear / 2 + 12 + hash(i * 3) * 14, y + 62]], 1.2, mixCol('#8A6B44', SUMI, .3), 'inkfine', .2); }
    } else inkLine([[960, 28], [960, 28 + (H - 56) * seamGrow]], 3.6, SUMI, 'ink', 0);
    // 两个 Clawd 靠近中线（同一套骨线，镜像）
    const u = 39, yG = 900, sep = m === 'b2' ? 34 : 0;
    const ghostCol = { col: WASHI, dk: mixCol(WASHI, SUMI, .14), lt: WASHI };
    kasa(700 - sep, yG - 8 * u, u, { back: 1, dip });
    backSwords(700 - sep, yG - 8 * u, u, dip);
    pc(700 - sep, yG, u, ghost ? { view: 'front', dip, ...ghostCol, eyes: 'normal', sq: .02 * Math.sin(t * 2.2), boilKey: 'c20a', draw: belt }
      : { view: 'front', dip, eyes: m === 'b2' ? ['narrow', 'wide'] : 'normal', sq: .02 * Math.sin(t * 2.2), boilKey: 'c20a', draw: belt });
    kasa(1220 + sep, yG - 8 * u, u, { tilt: .55, dip, col: ghost ? WASHI : mixCol(MIDORI, SUMI, .25) });
    pc(1220 + sep, yG, u, ghost ? { view: 'front', flip: true, dip, ...ghostCol, eyes: 'normal', sq: .02 * Math.sin(t * 2.2 + 1), boilKey: 'c20b' }
      : { view: 'front', flip: true, dip, col: FEN, dk: '#B25A5E', lt: '#F7C0BC', eyes: m === 'b2' ? ['wide', 'narrow'] : 'normal', sq: .02 * Math.sin(t * 2.2 + 1), boilKey: 'c20b' });
    // 前景折枝（右下角切入）
    if (!ghost) dress(t, 'branch', -1);
    sheetFrame(1);
  }

  // ===== C21 我怎么圈揽：画圆的手 =====
  function C21(t, lt, m) {
    const dip = m === 'b1' ? 2 : m === 'b2' ? 8 : 0;
    mountBG(t, { goma: 14, gomaK: 'c21' + m });
    // 两个半身 Clawd 在下缘（圈的对象）
    const ghost = m === 'b3';
    pc(330, 1010, 20, { view: 'front', dip, col: ghost ? WASHI : CLAY, dk: ghost ? mixCol(WASHI, SUMI, .12) : '#A84D33', lt: ghost ? WASHI : '#F2A283', eyes: 'normal', boilKey: 'c21a', draw: belt });
    pc(1590, 1010, 20, { view: 'front', flip: true, dip, col: ghost ? WASHI : FEN, dk: ghost ? mixCol(WASHI, SUMI, .12) : '#B25A5E', lt: ghost ? WASHI : '#F7C0BC', eyes: 'normal', boilKey: 'c21b' });
    // 画圆：每拍 1/4
    const seg = clamp(lt / BEAT);
    const R = 380, cx = 960, cy = 560;
    const arcPts2 = []; const n = Math.floor(seg * 10);
    for (let i = 0; i <= n; i++) { const a = -TAU / 4 + i / 10 * TAU / 4;
      const jit2 = m === 'b2' ? (hash(i * 13 + Math.floor(t * 30)) - .5) * 46 : jit(3);
      arcPts2.push([cx + Math.cos(a) * (R + jit2), cy + Math.sin(a) * (R + jit2) - R]); }
    if (arcPts2.length > 1) inkLine(arcPts2, m === 'b2' ? 5 : 3.4, m === 'b2' ? mixCol(SUMI, BENI, .3) : SUMI, 'ink', m === 'b2' ? .1 : .3);
    // 手 + 笔
    const aa = -TAU / 4 + clamp(seg) * TAU / 4;
    const hx = cx + Math.cos(aa) * R, hy = cy - R + Math.sin(aa) * R;
    push(); translate(hx, hy); rotate(aa + TAU / 4);
    paint(rectPts(-30, -30, 130, 60, 5), { wash: CLAY, washOp: 255, ink: SUMI, sw: 1.4 });
    inkLine([[90, 0], [240, -14]], 6, OCHRE, 'ink', .2);
    pop();
    if (m === 'b1' && seg > 3.4) {   // 圆碰到画框——断了
      const bk = ease(clamp((seg - 3.4) / .5));
      paint(rectPts(W - 44 - 40 * (1 - bk), 180 - 40 * (1 - bk), 40 + 60, 760, 2), { wash: WASHI, washOp: 255 * bk, ink: null });
    }
    if (m === 'b2' && seg > 2) {     // 笔断墨溅 + 抓皱
      const age = lt - 2 * BEAT;
      boilSeed('c21sp');
      for (let i = 0; i < 5; i++) { const a = hash(i * 9) * TAU, d = (age) * 300 * (.4 + hash(i * 3) * .6);
        paint(ellPts(hx + Math.cos(a) * d, hy + Math.sin(a) * d - 40, 12, 10, 6), { fill: SUMI, fillOp: clamp(220 - age * 160), ink: null }); }
      if (seg > 3.2) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU;
        line(960 + Math.cos(a) * 60, 560 + Math.sin(a) * 60, 960 + Math.cos(a) * (200 + hash(i) * 500), 560 + Math.sin(a) * (200 + hash(i + 5) * 400), 1.2, mixCol(SUMI, WASHI, .3), 'inkfine'); }
    }
    if (m === 'b3' && seg > 4) {     // 圆闭合，成了窗：更白的白
      const wk = ease(clamp((seg - 4) / .6));
      paint(ellPts(cx, cy - R, (R - 26) * wk, (R - 26) * wk, 30, 3), { wash: '#FBF6EA', washOp: 255 * wk, ink: SUMI, sw: 1.2 });
    }
    sheetFrame(1);
  }

  // ===== C22 看灯笼血红染：长街灯笼（红从镂空里渗出来） =====
  // 2026-11-07 修（V58 红顶点）：b2 红按拍涨档浸满全画（红>70%），红漫过主角时他"沉进去"，只剩墨线轮廓。
  function C22(t, lt, m) {
    const dip = m === 'b1' ? 2.5 : m === 'b2' ? 12 : 0;
    const rk = m === 'b2' ? ease(clamp(lt / (BEAT * 5))) : 0;   // 每拍涨一档，5 拍涨满
    mountBG(t, { sky: m === 'b2' ? [mixCol(mixCol(AI, WASHI, .3), mixCol(BENI, SUMI, .22), rk), 150 + 105 * rk] : m === 'b3' ? null : [AI, 120], skyY0: 40, skyY1: 620, goma: 14, gomaK: 'c22' + m });
    // b2 红版底色：整幅画心浸进深朱（绿树也压进红里），红>70% 的顶点靠这层兜底
    if (m === 'b2') paint(rectPts(28, 28, W - 56, H - 56, 3), { wash: mixCol(BENI, SUMI, .14), washOp: 175 * rk, ink: null });
    // 街面（层叠不透视）
    paint(rectPts(28, 860, W - 56, 200, 3), { wash: m === 'b3' ? WASHI : mixCol(mixCol(OCHRE, WASHI, .3), mixCol(BENI, '#7A1E18', .4), rk * .9), washOp: 255, ink: null });
    inkLine([[28, 862], [W - 28, 862]], 2.6, SUMI, 'ink', 0);
    // 两排灯笼（近大远小）
    for (let r2 = 0; r2 < 2; r2++) {
      const y = r2 ? 330 : 470, sc = r2 ? .62 : 1, n = r2 ? 5 : 4;
      for (let i = 0; i < n; i++) {
        const lx = (r2 ? 300 : 210) + i * (r2 ? 380 : 480);
        let redK = 0;
        if (m === 'b1') redK = clamp((lt - i * .1 - r2 * .2) / (BEAT * 5));
        if (m === 'b2') redK = clamp(rk * 1.25 - i * .04 - r2 * .08);
        const lc = m === 'b3' ? '#FBF6EA' : mixCol('#FBF5E6', BENI, redK * redK);
        push(); translate(lx + dip * .3 * r2, y); scale(sc);
        inkLine([[0, -160], [0, -70]], 1.4, SUMI, 'inkfine', 0);
        paint(rectPts(-10, -74, 20, 14, 2), { wash: OCHRE, washOp: 255, ink: SUMI, sw: .8 });
        paint(rrPts(-58, -62, 116, 140, 34, 3), { wash: lc, washOp: 255, ink: SUMI, sw: 1.6 });
        for (let k2 = 0; k2 < 4; k2++) inkLine([[-44 + k2 * 30, -54], [-44 + k2 * 30, 70]], 1, mixCol(SUMI, lc, .55), 'inkfine', .2);
        inkLine([[-52, 78], [52, 78]], 1.8, SUMI, 'ink', 0);
        for (let k2 = 0; k2 < 3; k2++) inkLine([[-30 + k2 * 30, 78], [-26 + k2 * 30, 100]], 1.1, SUMI, 'inkfine', 0);
        pop();
      }
    }
    // 阿宿走街心——b2 红漫过他时（rk>.62）色版沉进红里，只剩墨线轮廓
    const wx = 220 + clamp(lt / 1.9) * 1380;
    const u = 28;
    if (m === 'b2' && rk > .62) {
      clawd(wx, 900, u, { view: 'side', dip: 0, walk: t8(t) * 2.1, pass: 'ink', boilKey: 'a1c', draw: belt });
    } else {
      kasa(wx, 900 - 8 * u, u, { back: 1, dip });
      backSwords(wx, 900 - 8 * u, u, dip);
      pc(wx, 900, u, { view: 'side', dip, walk: t8(t) * 2.1, eyes: 'look', lookX: .6, sq: .02 * Math.sin(t * 3), boilKey: 'a1c', draw: belt, ...bodyOf(m) });
    }
    // 影子被拉长
    const shW = lerp(140, 560, clamp(lt / 1.9));
    paint(ellPts(wx + shW / 2, 924, shW, 18, 16, 4), { fill: m === 'b2' ? mixCol(BENI, SUMI, .5) : SUMI, fillOp: 95, ink: null });
    // 极前景灯笼
    if (m !== 'b3') dress(t, 'lantern', 1);
    // B2：末拍红漫出画框，把装裱边也染暗（全片红顶点）
    if (m === 'b2' && lt > BEAT * 4) { const fk = ease(clamp((lt - BEAT * 4) / (BEAT * 1.2)));
      paint(rectPts(0, 0, W, H, 2), { wash: mixCol(BENI, '#7A1E18', .3), washOp: 235 * fk, ink: null });
      paint(rectPts(28, 28, W - 56, H - 56, 3), { ink: mixCol(BENI, '#5E1712', .5), sw: 4 * fk });
    }
    // B3：白得更白（周围压墨）
    if (m === 'b3') { const bk = clamp(lt / 1.5);
      paint(rectPts(28, 28, W - 56, 330, 3), { wash: mixCol(WASHI, SUMI, .16 * bk), washOp: 255, ink: null });
      paint(rectPts(28, 862, W - 56, 200, 3), { wash: mixCol(WASHI, SUMI, .3 * bk), washOp: 255, ink: null });
    }
    sheetFrame(1);
  }

  // ===== C23 寻仇已太晚：跪坐的人与刀 =====
  function C23(t, lt, m) {
    const dip = m === 'b1' ? 2.5 : m === 'b2' ? 10 : 0;
    mountBG(t, { sky: m === 'b1' ? [AI, 160] : m === 'b2' ? [mixCol(BENI, SUMI, .4), 190] : null, skyY0: 60, skyY1: 460, goma: 12, gomaK: 'c23' + m });
    paint([[0, 900], [W, 880], [W, H], [0, H]], { wash: m === 'b3' ? WASHI : mixCol(OCHRE, WASHI, .55), washOp: 255, ink: m === 'b3' ? SUMI : null, sw: 1.4 });
    // 跪坐的阿宿（四腿折到身下，压到最低）
    const u = 30, x = 640;
    kasa(x, 900 - 7.4 * u, u, { back: 1, dip });
    pc(x, 900, u, { view: 'q', dip, sq: .2, dy: -1.2, eyes: m === 'b2' ? 'x' : 'sad', mouth: m === 'b2' ? 'wobble' : 'frown', boilKey: 'a1c', draw: belt, ...bodyOf(m) });
    // 刀（b2 没有刀，只有断红缨；b3 刀回来但只剩线）
    if (m !== 'b2') {
      push(); translate(1000, 900);
      const solid = m === 'b1';
      paint(rectPts(-16, -520, 32, 540, 4), { wash: solid ? '#EDE3CC' : WASHI, washOp: 255, ink: SUMI, sw: solid ? 2 : 1.6 });
      paint(rectPts(-52, -20, 104, 60, 5), { wash: solid ? OCHRE : WASHI, washOp: 255, ink: SUMI, sw: 1.6 });
      if (solid) { paint(ellPts(10, 70, 26, 44, 10, 3), { wash: BENI, washOp: 255, ink: null }); }
      pop();
    } else {
      paint(ellPts(1030, 880, 120, 26, 12, 4), { wash: BENI, washOp: 235, ink: null });
      paint(ellPts(1030, 862, 40, 18, 10, 3), { wash: BENI, washOp: 255, ink: null });
      inkLine([[1010, 846], [990, 800], [1004, 764]], 3, BENI, 'ink', .4);   // 断缨
    }
    // 影子：b1/b2 每拍长、爬进装裱边；b3 缩回身体
    if (m === 'b3') { const sk = 1 - ease(clamp(lt / 1.6));
      paint(ellPts(x - 200 * sk, 916, lerp(60, 420, sk), 12, 12, 3), { fill: SUMI, fillOp: 110, ink: null }); }
    else { const sh = lerp(200, W - x + 60, clamp(lt / 1.6));
      paint(ellPts(x + sh / 2, 918, sh, 16, 16, 4), { fill: m === 'b2' ? mixCol(BENI, SUMI, .5) : SUMI, fillOp: 120, ink: null });
      if (sh > W - x - 40) { const pk = clamp((sh - (W - x - 40)) / 120);
        paint(rectPts(W - 44, 700, 44 * pk + 20, 230, 2), { fill: m === 'b2' ? mixCol(BENI, SUMI, .5) : SUMI, fillOp: 120 * pk, ink: null }); } }
    sheetFrame(1);
  }

  // ===== C24 月下门童：纸白圆月 + 门 =====
  function C24(t, lt, m) {
    const dip = m === 'b1' ? 2 : m === 'b2' ? 8 : 0;
    const night = m === 'b3' ? mixCol(WASHI, SUMI, .06) : mixCol(AI, SUMI, .3);
    mountBG(t, { paper: night, goma: 16, gomaK: 'c24' + m });
    // 月 = 纸白的圆洞
    const moonY = m === 'b3' ? lerp(430, 380, clamp(lt / 1.74)) : 400;
    paint(ellPts(1380, moonY, 130, 130, 30, 5), { wash: m === 'b3' ? '#FBF6EA' : WASHI, washOp: 255, ink: null });
    if (m !== 'b3') bokashi('c24moon', AI_LT, 90, moonY - 130, moonY + 130);
    // 门（b2 倒了）
    if (m !== 'b2') {
      paint(rectPts(300, 260, 620, 660, 5), { wash: m === 'b3' ? WASHI : mixCol(BENI, OCHRE, .55), washOp: 255, ink: SUMI, sw: 2 });
      for (let r2 = 0; r2 < 3; r2++) inkLine([[320, 340 + r2 * 200], [900, 340 + r2 * 200]], 2, SUMI, 'ink', .2);
      for (let i = 0; i < 8; i++) paint(ellPts(380 + (i % 4) * 160, 320 + Math.floor(i / 4) * 480, 12, 12, 8), { wash: KIN, washOp: 200, ink: SUMI, sw: .8 });
    } else {
      push(); translate(620, 860); rotate(1.35);
      paint(rectPts(-310, -330, 620, 660, 5), { wash: mixCol(BENI, OCHRE, .55), washOp: 255, ink: SUMI, sw: 2 }); pop();
    }
    // 门童：斗笠全遮（允许处 1）+ 白气
    const u = 36, x = 1160;
    kasa(x, 920 - 8 * u, u, { worn: 1, dip, tilt: .12 });
    pc(x, 920, u, { view: 'front', dip, eyes: 'closed', mouth: 'flat', sq: .04 + .04 * Math.sin(t * 1.6), boilKey: 'c24k', draw: belt, ...bodyOf(m) });
    boilSeed('c24sigh');
    const sighN = Math.min(4, Math.floor(lt / BEAT) + 1);
    for (let i = 0; i < sighN; i++) { const age = lt - i * BEAT;
      if (age > 0 && age < 1.6) paint(ellPts(x + 60 + age * 60, 920 - 5 * u - 20 - age * 80, 16 + age * 20, 10 + age * 12, 8, 3), { wash: '#FBF5E6', washOp: clamp(200 - age * 120), ink: mixCol(SUMI, WASHI, .4), sw: .7 }); }
    if (m === 'b2') {   // 影子变刀形
      const sk = clamp(lt / 1.6);
      push(); translate(x - 300 * sk, 930); rotate(lerp(0, -.9, sk));
      paint(rectPts(-20, -300, 40, 600, 4), { fill: SUMI, fillOp: 160, ink: null }); pop();
    }
    sheetFrame(1);
  }

  // ===== C25 昨夜太平长安：城的大全景（b2 焚毁 / b3 空城线稿） =====
  function C25(t, lt, m) {
    const dip = m === 'b1' ? 2 : m === 'b2' ? 8 : 0;
    const ghost = m === 'b3';
    const rise = ease(clamp(lt / 5.5));
    // 天
    paint(rectPts(-60, -60, W + 120, H + 120, 2), { wash: MOUNT, washOp: 255, ink: null });
    paint(rectPts(28, 28, W - 56, H - 56, 3), { wash: WASHI, washOp: 255, ink: null });
    if (!ghost) bokashi('c25sky', m === 'b2' ? mixCol(BENI, SUMI, .35) : AI, 170, 40, 470);
    // 远山
    paint([[28, 520], [420, 360], [900, 500], [1400, 340], [W - 28, 470], [W - 28, 700], [28, 700]],
      { wash: ghost ? WASHI : mixCol(AI_LT, WASHI, .35), washOp: 210, ink: ghost ? SUMI : null, sw: 1.6, curv: .3 });
    // 三排屋顶（错落，后小前大）
    for (let row = 0; row < 3; row++) {
      const y = 560 + row * 84, sc = .55 + row * .22, n = 7 - row;
      for (let i = 0; i < n; i++) {
        const hx = 120 + i * (1360 / n) + (row % 2) * 60, w2 = 240 * sc, h2 = 84 * sc;
        const burnt = m === 'b2' && hash(i * 7 + row * 3) > .45;
        paint([[hx - w2 / 2, y], [hx, y - h2], [hx + w2 / 2, y]], { wash: ghost ? WASHI : burnt ? mixCol(BENI, SUMI, .55) : mixCol(OCHRE, SUMI, .25), washOp: 255, ink: SUMI, sw: 1.4 });
        paint(rectPts(hx - w2 / 2, y, w2, 70 * sc, 3), { wash: ghost ? WASHI : mixCol(OCHRE, WASHI, .2), washOp: 255, ink: SUMI, sw: 1.2 });
        if (!ghost && !burnt) for (let k2 = 0; k2 < 2; k2++)
          paint(rectPts(hx - 18 * sc + k2 * 34 * sc, y + 24 * sc, 14 * sc, 18 * sc, 2), { wash: KIN, washOp: 220, ink: null });
        if (burnt) sparks(t, 2, 'c25f' + row + i, hx, y - h2, 60);
      }
    }
    // 城墙与城门
    paint(rectPts(28, 780, W - 56, 260, 4), { wash: ghost ? WASHI : mixCol(OCHRE, WASHI, .25), washOp: 255, ink: SUMI, sw: 2.2 });
    for (let i = 0; i < 14; i++) inkLine([[60 + i * 130, 780], [60 + i * 130, 1040]], 1.2, mixCol(SUMI, WASHI, .4), 'inkfine', .2);
    paint([[820, 1040], [820, 800], [960, 730], [1100, 800], [1100, 1040]], { wash: ghost ? WASHI : mixCol(OCHRE, SUMI, .2), washOp: 255, ink: SUMI, sw: 2, curv: .3 });
    // 灯海（b1 呼吸 / b2 熄灭 / b3 白点）
    for (let i = 0; i < 18; i++) { const lx = 120 + hash(i * 3.3) * (W - 240), ly = 620 + hash(i * 5.1) * 220;
      if (m === 'b1') paint(ellPts(lx, ly, 11 + Math.sin(t * 2 + i) * 2, 11, 8), { wash: KIN, washOp: 225, ink: SUMI, sw: .7 });
      else if (m === 'b2') paint(ellPts(lx, ly, 9, 9, 8), { wash: mixCol(BENI, SUMI, .6), washOp: 170, ink: null });
      else paint(ellPts(lx, ly, 10, 10, 8), { wash: '#FBF6EA', washOp: 255, ink: SUMI, sw: .8 }); }
    // 群演同向走 + 狗横穿 + 阿宿
    if (m === 'b1') {
      for (let i = 0; i < 14; i++) { const ex = 100 + frac(hash(i * 9) + t * .018) * (W - 260), ey = 820 + (i % 3) * 76 + hash(i * 3) * 20;
        extra(ex, ey, 7 + hash(i * 7) * 2, t8(t) * 2 + i, dip, i); }
      const dx2 = frac(t * .05) * (W - 520) + 260;
      paint(rectPts(dx2, 1000, 66, 36, 3), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1.1 });
      paint(rectPts(dx2 + 56, 978, 28, 28, 3), { wash: OCHRE, washOp: 255, ink: SUMI, sw: 1.1 });
      paint(rectPts(dx2 + 78, 964, 12, 20, 2), { wash: OCHRE, washOp: 255, ink: SUMI, sw: .8 });
    }
    if (!ghost) { const u = 16;
      kasa(960, 1040 - 8 * u, u, { back: 1, dip });
      backSwords(960, 1040 - 8 * u, u, dip);
      pc(960, 1040, u, { view: 'front', dip, eyes: 'wide', boilKey: 'a1c', draw: belt }); }
    // 极前景屋檐（压在上沿）
    paint([[28, 28], [W - 28, 28], [W - 28, 96], [28, 130]], { wash: ghost ? WASHI : mixCol(SUMI, '#3A3440', .4), washOp: ghost ? 0 : 240, ink: SUMI, sw: 2 });
    // 越过画框上沿：看到装裱边与上一幅画的一角
    if (rise > .85) { const pk = ease((rise - .85) / .15);
      paint(rectPts(0, 0, W, 70 * pk, 2), { wash: MOUNT, washOp: 255, ink: null });
      paint(rectPts(1240, -60 * pk, 460, 150 * pk, 3), { wash: MOE, washOp: 200 * pk, ink: SUMI, sw: 1.4 }); }
    sheetFrame(1);
  }

  // ===== C26 当天上星河转：竖滑天翻（b3 方向正过来） =====
  function C26(t, lt, m) {
    const dip = m === 'b1' ? 2 : m === 'b2' ? 8 : 0;
    mountBG(t, { goma: 12, gomaK: 'c26' + m });
    const slide = frac(clamp(lt / 3.5)) * 900;
    const inverted = m !== 'b3';
    push(); if (inverted) { translate(960, 540); rotate(Math.PI); translate(-960, -540); }
    // 城（地面）与星河
    paint(rectPts(0, inverted ? 0 : H - 360, W, 360, 3), { wash: m === 'b3' ? WASHI : mixCol(OCHRE, WASHI, .4), washOp: 255, ink: SUMI, sw: 1.6 });
    for (let i = 0; i < 6; i++) inkLine([[0, (inverted ? 60 : H - 330) + i * 56], [W, (inverted ? 60 : H - 330) + i * 56]], 1.2, mixCol(SUMI, WASHI, .35), 'inkfine', .2);
    // 星河：b1/b3 纸白点，b2 红点；每拍多一片
    const starN = Math.min(60, 10 + Math.floor(lt / BEAT) * 3);
    for (let i = 0; i < starN; i++) { const sx = hash(i * 7.7) * W, sy = frac(hash(i * 3.1) + t * .015) * (H - 500) + 80;
      const starC = m === 'b2' ? BENI : '#FBF6EA';
      paint(ellPts(sx, sy, 4 + hash(i) * 4, 4 + hash(i) * 4, 6), { wash: starC, washOp: 255, ink: m === 'b2' ? null : mixCol(SUMI, WASHI, .5), sw: .6 }); }
    // 阿宿 rot π 倒挂（b3 正常站在地面）
    const u = 24, gy = inverted ? 300 : H - 360;
    kasa(880, gy - 8 * u, u, { back: 1, dip });
    pc(880, gy, u, { view: 'front', dip, eyes: m === 'b2' ? 'scared' : 'wide', boilKey: 'a1c', draw: belt, ...bodyOf(m) });
    pop();
    sheetFrame(1);
  }

  // ===== C27 我命已定盘：巨印压下（b2 印是反的、流红；b3 空印框） =====
  function C27(t, lt, m) {
    const dip = m === 'b1' ? 2 : m === 'b2' ? 16 : 0;
    mountBG(t, { goma: 12, gomaK: 'c27' + m });
    // 巨印
    const fall = ease(clamp(lt / .5));
    const sy = lerp(-500, 540, fall), sc = m === 'b2' ? 1.5 : 1.25;
    // b2 落定后画面变形（scaleX 1.08 / scaleY 0.92）
    const def = m === 'b2' && fall >= 1;
    if (def) { push(); translate(960, 540); scale(1.08, .92); translate(-960, -540); }
    push(); translate(960, sy); scale(sc);
    if (m === 'b2') scale(-1, 1);   // 印是反的
    if (t > 84.96 || lt > .5) { const [sx2, sy2] = m === 'b1' ? shakeXY(Math.max(0, lt - .5), 5) : [0, 0]; translate(sx2 * 4, sy2 * 4); }
    if (m === 'b3') {   // 空印边框：B3 唯一的红
      paint(rectPts(-190, -190, 380, 380, 6), { wash: WASHI, washOp: 255, ink: null });
      paint(rectPts(-190, -190, 380, 380, 6), { wash: BENI, washOp: 255, ink: BENI, sw: 14 });
      paint(rectPts(-160, -160, 320, 320, 4), { ink: BENI, sw: 3 });
    } else {
      paint(rectPts(-190, -190, 380, 380, 6), { wash: BENI, washOp: 248, ink: null });
      if (m === 'b2' && lt > .8) {   // 印文流红
        const fk = clamp((lt - .8) / 1.4);
        for (const dx of [-90, 0, 90]) paint(rectPts(dx - 16, 150, 32, 220 * fk, 4), { wash: BENI, washOp: 220, ink: null });
      }
    }
    pop();
    // 阴刻「命」：字是纸白。—— 2026-11-07 修：letter 记世界坐标，transform 内发会被画到 (0,6) 左上角丢失。
    // 必须在 pop() 之后按屏幕坐标直发（印章中心 = (960, sy)，缩放 sc），b2 镜像用 flipX。
    if (m !== 'b3' && fall >= .35)
      letter('命', 960, sy + 6 * sc, 240 * sc, WASHI, { font: `${Math.round(240 * sc)}px ${KX}`, ink: false, screen: true, alpha: clamp((fall - .35) / .2), flipX: m === 'b2' });
    if (def) pop();
    // 阿宿被印影盖住
    const u = 27, yG = 940;
    kasa(960, yG - 8 * u, u, { back: 1, dip });
    pc(960, yG, u, { view: 'front', dip, col: m === 'b3' ? WASHI : CLAY, dk: m === 'b3' ? mixCol(WASHI, SUMI, .12) : '#A84D33', lt: m === 'b3' ? WASHI : '#F2A283', eyes: 'x', boilKey: 'a1c', draw: belt });
    sheetFrame(1);
  }

  // ===== C28 待绝笔墨痕干：「宿敌」二字（b2 不干；b3 干透 + 静止 1.6s） =====
  function C28(t, lt, m) {
    mountBG(t, { goma: 10, gomaK: 'c28' + m });
    const inkCol = m === 'b2' ? mixCol(SUMI, '#0E0C12', .5) : SUMI;
    letter('宿 敌', 960, 470, 300, inkCol, { font: `300px ${KX}`, ink: false, screen: true });
    if (m === 'b1') {   // 墨在渗、快粘在一起
      boilSeed('c28wet');
      for (let i = 0; i < 8; i++) { const x = 700 + i * 74;
        paint(ellPts(x, 560 + hash(i * 3) * 40, 8 + hash(i) * 10, 6 + hash(i * 7) * 8, 6), { fill: inkCol, fillOp: 160, ink: null }); }
    }
    if (m === 'b2') {   // 永远不干：往下淌
      const fk = clamp(lt / 2);
      for (let i = 0; i < 6; i++) { const x = 620 + i * 140;
        paint(rectPts(x - 10, 520, 20, 160 * fk + hash(i * 7) * 60, 6), { wash: inkCol, washOp: 200, ink: null, curv: .3 }); }
    }
    if (m === 'b3') {   // 干透 + 印呼吸（静止镜头）
      seal(960, 850, 84, '宿', 1 + .02 * Math.max(0, Math.sin((lt - 1.1) * 10)) * (lt > 1.1 ? 1 : 0));
    }
    sheetFrame(1);
  }

  // ===== C29 宿敌已来犯：线聚成盒（b2 从身体里爆 / b3 两线合一） =====
  function C29(t, lt, m) {
    const dip = m === 'b1' ? 3 : m === 'b2' ? 12 : 0;
    mountBG(t, { goma: 12, gomaK: 'c29' + m });
    if (m === 'b1') {
      // 四边黑线冲进来聚成方盒（每拍一段），第 4 拍染红
      const p = ease(clamp(lt / (BEAT * 4)));
      const boxL = lerp(-100, 760, p), boxR = lerp(W + 100, 1160, p), boxT = lerp(-100, 480, p), boxB = lerp(H + 100, 940, p);
      line(boxL, 200, boxL, boxT, 3.4); line(W - 40 - (W - 40 - boxR), 200, boxR, boxT, 3.4);
      line(boxL, boxT, boxR, boxT, 3.4);
      if (p >= 1) {
        const redK = ease(clamp((lt - BEAT * 4) / .2));
        paint(rectPts(boxL + dip, boxT, boxR - boxL, boxB - boxT, 4), { wash: mixCol(WASHI, BENI, redK), washOp: 255, ink: null });
        paint(rectPts(boxL + dip, boxT, boxR - boxL, boxB - boxT, 4), { ink: SUMI, sw: 3 });
        for (const ex of [boxL + 120, boxR - 160]) paint(rectPts(ex, boxT + 160, 22, 46, 3), { wash: redK > .5 ? WASHI : SUMI, washOp: 255, ink: null });
      }
    } else if (m === 'b2') {
      // 粉 Clawd 饭盒嘴掀开，黑线从身体里爆出
      const u = 45, yG = 700;
      const burst = clamp(lt / (BEAT * 4));
      boilSeed('c29burst');
      for (let i = 0; i < 14; i++) { const a = hash(i * 9.1) * TAU, d = ease(clamp((burst - hash(i * 3) * .5))) * (300 + hash(i * 5) * 420);
        line(960, yG - 4.5 * u, 960 + Math.cos(a) * d, yG - 4.5 * u + Math.sin(a) * d * .7, 2.6, i % 3 ? SUMI : FEN, 'ink', .2); }
      kasa(960, yG - 8 * u, u, { tilt: .6, dip: 0, col: mixCol(MIDORI, SUMI, .2) });
      pc(960, yG, u, { view: 'front', dip: 0, tint: 'rosy', tintK: 1, lid: .6, eyes: 'red', boilKey: 'c29b' });
      if (lt < 1.9) { const [sx, sy] = shakeXY(lt * 6, 5); }
    } else {
      // b3：两条线安静合成一条
      const p = ease(clamp(lt / (BEAT * 4)));
      const sep2 = lerp(220, 0, p);
      line(960 - sep2, 200, 960 - sep2, 880, 3); line(960 + sep2, 200, 960 + sep2, 880, 3);
      if (p >= 1) { line(960, 200, 960, 880, 4.2); }
      // 顶端弯成盒盖弧
      inkLine([[960 - sep2, 200], [960, 140], [960 + sep2, 200]], 3, SUMI, 'ink', .4);
    }
    sheetFrame(1);
  }

  // ===== C30 我借你的孤单：背对背（b2 红线穿胸绷断 / b3 轮廓重合成一条线） =====
  function C30(t, lt, m) {
    const dip = m === 'b1' ? 2 : m === 'b2' ? 10 : 0;
    mountBG(t, { goma: 14, gomaK: 'c30' + m });
    const ghost = m === 'b3';
    const A = { col: ghost ? WASHI : CLAY, dk: ghost ? mixCol(WASHI, SUMI, .12) : '#A84D33', lt: ghost ? WASHI : '#F2A283' };
    const Bc = { col: ghost ? WASHI : FEN, dk: ghost ? mixCol(WASHI, SUMI, .12) : '#B25A5E', lt: ghost ? WASHI : '#F7C0BC' };
    const sep2 = m === 'b3' ? lerp(260, 0, ease(clamp(lt / (BEAT * 4)))) : 340;
    const u = 36, yG = 860;
    const breathe = .02 * Math.sin(t * 2.2);   // 同相位呼吸
    kasa(960 - sep2, yG - 8 * u, u, { back: 1, dip });
    backSwords(960 - sep2, yG - 8 * u, u, dip);
    pc(960 - sep2, yG, u, { view: 'back', flip: false, dip, ...A, sq: breathe, boilKey: 'c30a', draw: belt });
    kasa(960 + sep2, yG - 8 * u, u, { tilt: .5, dip, col: ghost ? WASHI : mixCol(MIDORI, SUMI, .2) });
    pc(960 + sep2, yG, u, { view: 'back', flip: true, dip, ...Bc, sq: breathe, boilKey: 'c30b' });
    // 中间那条线
    if (m === 'b1') { const th = lerp(2, 6, clamp(lt / (BEAT * 4)));
      line(960, yG - 8 * u - 40, 960, yG + 30, th); snow(t, 5, 'c30', 200, W - 200, 200, 900); }
    if (m === 'b2') {   // 红线穿胸，绷断
      const ten = clamp(lt / (BEAT * 4));
      if (ten < 1) { line(960 - sep2 + 40, yG - 4.5 * u, 960 + sep2 - 40, yG - 4.5 * u, 4, BENI);
        paint(ellPts(960, yG - 4.5 * u, 26, 26, 10), { wash: BENI, washOp: 235, ink: null }); }
      else { const snap = ease(clamp((lt - BEAT * 4) / .3));
        line(960 - sep2 + 40, yG - 4.5 * u, 960 - sep2 + 40 + 60 * snap, yG - 4.5 * u - 60 * snap, 4, BENI);
        line(960 + sep2 - 40, yG - 4.5 * u, 960 + sep2 - 40 - 60 * snap, yG - 4.5 * u - 60 * snap, 4, BENI); }
    }
    sheetFrame(1);
  }

  // ===== C31 手卷横移三幅（b2 破版卡顿） =====
  function C31(t, lt, m) {
    const dip = m === 'b1' ? 2 : m === 'b2' ? 20 : 0;
    paint(rectPts(-60, -60, W + 120, H + 120, 2), { wash: MOUNT, washOp: 255, ink: null });
    let slide = lerp(0, 2000, clamp(lt / 1.9));
    if (m === 'b2') {   // 卡顿跳帧
      const st = [0, .45, .9, 1.35][Math.min(3, Math.floor(lt / .48))];
      slide = lerp(0, 2000, clamp(st / 1.9)) + jit(14);
    }
    const panels = [
      { c: CLAY, draw: (x) => { pc(x, 640, 22, { view: 'q', dip, col: m === 'b2' ? mixCol(CLAY, BENI, .5) : CLAY, dk: '#A84D33', lt: '#F2A283', eyes: m === 'b2' ? 'x' : 'normal', boilKey: 'c31a', draw: belt }); if (m === 'b2') paint(rectPts(x - 130, 560, 120, 110, 4), { wash: BENI, washOp: 200, ink: null }); } },
      { c: '#D8CCB4', draw: (x) => { push(); translate(x, 620); paint(rectPts(-60, -160, 120, 330, 6), { wash: CLAY, washOp: 255, ink: SUMI, sw: 1.8 }); paint(rectPts(-150, -60, 300, 120, 8), { wash: CLAY, washOp: 255, ink: SUMI, sw: 1.8 }); if (m === 'b2') paint(rectPts(-40, -80, 90, 90, 4), { wash: SUMI, washOp: 220, ink: null }); pop(); } },
      { c: FEN, draw: (x) => { pc(x, 640, 22, { view: 'q', flip: true, dip, col: m === 'b2' ? mixCol(FEN, BENI, .6) : FEN, dk: '#B25A5E', lt: '#F7C0BC', eyes: 'normal', boilKey: 'c31b' }); if (m === 'b2') { push(); translate(x, 500); rotate(.3); paint(rectPts(-90, -20, 180, 40, 3), { wash: SUMI, washOp: 200, ink: null }); pop(); } } },
    ];
    panels.forEach((P, i) => { const x = 480 + i * 1000 - slide; if (x < -500 || x > W + 500) return;
      paint(rectPts(x - 300, 200, 600, 780, 3), { wash: WASHI, washOp: 255, ink: SUMI, sw: 1.6 });
      P.draw(x + (m === 'b2' ? 22 : 0));
      paint(rectPts(x - 300, 200, 600, 780, 3), { ink: SUMI, sw: 1.8 }); });
    sheetFrame(1);
  }

  // ===== C32 拼成一张脸（b2 拼错：三只眼两张嘴） =====
  function C32(t, lt, m) {
    const dip = m === 'b1' ? 2 : m === 'b2' ? 30 : 0;
    mountBG(t, { goma: 12, gomaK: 'c32' + m });
    // 脸板：左陶土、右粉，中线偏 2px
    const L = 500, Rr = 1420, top = 190, bot = 990, mid = 960;
    paint(rectPts(L, top, mid - L, bot - top, 8), { wash: CLAY, washOp: 255, ink: null });
    paint(rectPts(mid, top, Rr - mid, bot - top, 8), { wash: FEN, washOp: 255, ink: null });
    paint(rectPts(L, top, Rr - L, bot - top, 8), { ink: SUMI, sw: 3.2 });
    inkLine([[mid, top], [mid, bot]], 2.6, SUMI, 'ink', 0);
    // 眼缝（大而高）+ 眉
    const eyes = [[mid - 250, 470], [mid + 250, 470]];
    for (const [ex, ey] of eyes) {
      paint(rrPts(ex - 30, ey - 76, 60, 152, 16, 3), { wash: '#FBF6EA', washOp: 255, ink: SUMI, sw: 2.2 });
      inkLine([[ex - 12, ey - 40], [ex + 10, ey + 40]], 1.6, mixCol(SUMI, '#B7A98F', .3), 'inkfine', .2);   // 瞳孔竖缝
      inkLine([[ex - 56, ey - 110], [ex + 44, ey - 128]], 6, SUMI, 'ink', .3);   // 眉
    }
    if (m === 'b2') {   // 第三只眼
      paint(rrPts(mid - 30, 640, 60, 140, 16, 3), { wash: '#FBF6EA', washOp: 255, ink: SUMI, sw: 2.2 });
      inkLine([[mid - 12, 680], [mid + 8, 740]], 1.6, mixCol(SUMI, '#B7A98F', .3), 'inkfine', .2);
    }
    // 嘴：一条横线 + 两端小竖（不画鼻子）
    paint(rectPts(mid - 150, 800, 300, 18, 6), { wash: '#FBF6EA', washOp: 255, ink: SUMI, sw: 1.8 });
    if (m === 'b2') { paint(rectPts(mid + 120, 860, 260, 18, 6), { wash: '#FBF6EA', washOp: 255, ink: SUMI, sw: 1.8 });
      // 粉部件混进陶土区
      paint(rectPts(L + 60, top + 40, 240, 300, 10), { wash: mixCol(FEN, CLAY, .45), washOp: 210, ink: null }); }
    // 腮红（b1 才有）
    if (m === 'b1') for (const bx of [mid - 320, mid + 320]) paint(ellPts(bx, 660, 90, 46, 14, 4), { fill: BENI, fillOp: 40, ink: null });
    // b1：拼合一瞬 0.15s 对齐再弹回
    if (m === 'b1') {
      const snap = lt > .9 && lt < 1.05;
      const off = snap ? .5 : 2 + ease(clamp((lt - 1.05) / .3)) * 2;
      push(); translate(-off, 0);
      paint(rectPts(L, top, mid - L, bot - top, 8), { wash: CLAY, washOp: 255, ink: null });
      paint(rrPts(mid - 280, 394, 60, 152, 16, 3), { wash: '#FBF6EA', washOp: 255, ink: null });
      paint(rectPts(mid - 150, 800, 300, 18, 6), { wash: '#FBF6EA', washOp: 255, ink: null });
      paint(rectPts(L, top, mid - L, bot - top, 8), { ink: SUMI, sw: 3.2 });
      pop();
    }
    // 前景：一枝黑枫压在角上
    dress(t, 'branch', 1);
    sheetFrame(1);
  }

  // ===== C33 难还：脸分崩（b2 被红淹没→黑） =====
  function C33(t, lt, m) {
    mountBG(t, { goma: 10, gomaK: 'c33' + m });
    const L = 560, Rr = 1360, top = 240, bot = 980;
    const sep2 = lerp(0, 170, ease(clamp(lt / 1.5)));
    const dip = m === 'b2' ? 30 : 2;
    paint(rectPts(L - sep2 - dip, top, 960 - L, bot - top, 6), { wash: CLAY, washOp: 255, ink: null });
    paint(rectPts(960 + sep2, top, Rr - 960, bot - top, 6), { wash: FEN, washOp: 255, ink: null });
    paint(rectPts(L - sep2 - dip, top, 960 - L, bot - top, 6), { ink: SUMI, sw: 2.4 });
    paint(rectPts(960 + sep2, top, Rr - 960, bot - top, 6), { ink: SUMI, sw: 2.4 });
    paint(rectPts(L - sep2 - dip, top, 960 - L - sep2, bot - top, 6), { wash: WASHI, washOp: 0, ink: null });
    if (m === 'b1' && lt > 1.5) {   // 弹回撞在一起，画面一白
      const bk = ease(clamp((lt - 1.5) / .3));
      const s2 = lerp(170, 0, bk);
      paint(rectPts(L - s2, top, 960 - L, bot - top, 6), { wash: CLAY, washOp: 255, ink: null });
      paint(rectPts(960 + s2 * .2, top, Rr - 960, bot - top, 6), { wash: FEN, washOp: 255, ink: null });
      flash(clamp((lt - 1.78) / .2), '#FBF6EA');
    }
    if (m === 'b2') {   // 红从缝里涌出吃掉画面
      const fk = ease(clamp(lt / 1.6));
      paint(rectPts(960 - 60 - 80 * fk, 0, 120 + 160 * fk, H, 3), { wash: BENI, washOp: 255, ink: null });
      paint(rectPts(28, 28, W - 56, H - 56, 3), { wash: mixCol(BENI, '#7A1E18', .4), washOp: 255 * fk, ink: null });
      flash(clamp((lt - 1.62) / .1), '#1A0E0E');   // 全红然后一黑
    }
    // 两块版上各自印着自己的半身像——否则两块纯色板子会被读成"两扇门"（2026-11-07）
    if (m !== 'b3') {
      const S = (m === 'b1' && lt > 1.5) ? lerp(170, 0, ease(clamp((lt - 1.5) / .3))) : sep2;
      const portrait = (cx, base) => {
        const bw = 250, bh = 340, by = bot - 52 - bh, ic = SUMI;
        paint(rectPts(cx - bw / 2, by, bw, bh, 12), { wash: mixCol(base, SUMI, .2), washOp: 255, ink: ic, sw: 2.8 });
        for (const sg of [-1, 1]) paint(rectPts(cx + sg * bw * .19 - bw * .05, by + bh * .2, bw * .1, bh * .21, 6), { wash: WASHI, washOp: 255, ink: null });
        inkLine([[cx - bw * .09, by + bh * .64], [cx + bw * .09, by + bh * .64]], 4, WASHI, 'ink', 0);
        for (const sg of [-1, 1]) paint(rectPts(cx + sg * bw * .58 - (sg > 0 ? 0 : bw * .17), by + bh * .36, bw * .17, bh * .1, 8),
          { wash: mixCol(base, SUMI, .2), washOp: 255, ink: ic, sw: 2.2 });
      };
      portrait(960 - S - (m === 'b2' ? dip : 0) - 200, CLAY);
      portrait(960 + S + 200, FEN);
    }
    sheetFrame(1);
  }

  window.CH = { C20, C21, C22, C23, C24, C25, C26, C27, C28, C29, C30, C31, C32, C33 };

  // ---- B1 注册（61.90–101.81） ----
  const reg = (t0, fn) => shots([[t0, (t, lt, d) => fn(t, lt, 'b1')]]);
  reg(61.90, C20); reg(64.90, C21); reg(67.44, C22); reg(69.84, C23);
  reg(72.32, C24); reg(76.16, C25); reg(82.10, C26); reg(84.46, C27);
  reg(87.48, C28); reg(89.54, C29); reg(92.00, C30); reg(96.05, C31);
  reg(98.20, C32); reg(100.20, C33);
})();
