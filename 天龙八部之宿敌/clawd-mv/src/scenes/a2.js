// a2.js — A2 42.10–60.81 · 花开花落，你没变（V14–V19）
(() => {
  // ---- V14 · 桃枝每拍开一朵 + 白头鸟落枝 ----
  function V14(t, lt) {
    mountBG(t, { goma: 18, gomaK: 'v14' });
    // 桃枝从右伸入（前景 1/3）
    push(); translate(W, 130); rotate(-.06);
    inkLine([[0, 0], [-420, 150], [-860, 200], [-1240, 300]], 9, OCHRE, 'ink', .4);
    // 每拍开一朵（色版从花心落 0.25s）
    for (let i = 0; i < 9; i++) {
      const t0 = 42.2 + i * BEAT; if (t < t0) continue;
      const p = [[-380, 140], [-520, 190], [-660, 175], [-800, 220], [-940, 210], [-1080, 260], [-700, 120], [-860, 90], [-1000, 150]][i];
      const k = easeOut((t - t0) / .25);
      push(); translate(p[0], p[1]); scale(.4 + .6 * backOut(k));
      for (let pi = 0; pi < 5; pi++) { const a = pi / 5 * TAU;
        paint(ellPts(Math.cos(a) * 22, Math.sin(a) * 22, 20, 14, 8, 2), { wash: MOE, washOp: 235, ink: SUMI, sw: .6 }); }
      paint(ellPts(0, 0, 8, 8, 8), { wash: KIN, washOp: 255, ink: null }); pop();
    }
    // 白头鸟（第二个活元素）
    const landK = ease(clamp((lt - 1.2) / .5));
    const bx = lerp(W - 100, -700, landK), by = lerp(60, 130, landK);
    if (lt < 1.2) { const p2 = clamp(lt / 1.2); paint(ellPts(W - 120 + p2 * 120, 40 + p2 * 90, 20, 14, 8), { wash: '#FBF5E6', washOp: 255, ink: SUMI, sw: 1 }); }
    else paint(ellPts(bx, by - flap2(t) * 3, 24, 17, 10, 2), { wash: '#FBF5E6', washOp: 255, ink: SUMI, sw: 1.1 }),
          paint(ellPts(bx + 10, by - 10, 8, 7, 8), { wash: KIN, washOp: 220, ink: null });
    // 阿宿树下坐（正面特写，hopeful）
    const u = 45;
    pc(700, 880, u, { view: 'front', dip: misreg(t), ...feel('hopeful', t8(t)), noLegs: false, walk: null, boilKey: 'a2c', draw: belt });
    goma(16, 'v14b');
    sheetFrame(1);
  }
  const flap2 = t => Math.sin(t * 6) * 2;

  // ---- V15 · 拉远见整枝；最后一瓣停在画框上 ----
  function V15(t, lt) {
    camBegin(960, 540 + 30 * clamp(lt), lerp(1, .82, ease(clamp(lt / 1.9))));
    mountBG(t, { goma: 18, gomaK: 'v14' });
    push(); translate(W, 130); rotate(-.06);
    inkLine([[0, 0], [-420, 150], [-860, 200], [-1240, 300]], 9, OCHRE, 'ink', .4);
    for (let i = 0; i < 9; i++) { const p = [[-380, 140], [-520, 190], [-660, 175], [-800, 220], [-940, 210], [-1080, 260], [-700, 120], [-860, 90], [-1000, 150]][i];
      for (let pi = 0; pi < 5; pi++) { const a = pi / 5 * TAU;
        paint(ellPts(p[0] + Math.cos(a) * 22, p[1] + Math.sin(a) * 22, 20, 14, 8, 2), { wash: MOE, washOp: 235, ink: SUMI, sw: .6 }); }
      paint(ellPts(p[0], p[1], 8, 8, 8), { wash: KIN, washOp: 255, ink: null }); }
    pop();
    const u = 26;
    pc(760, 880, u, { view: 'side', dip: misreg(t), ...feel('hopeful', t8(t)), boilKey: 'a2c', draw: belt });
    camEnd();
    // 最靠镜头那朵落一瓣，停在画框上
    if (lt > 1.5) { const p = easeOut((lt - 1.5) / .55);
      const px = lerp(1250, 620, p), py = lerp(240, 962, p * p);
      push(); rotate(p * 3);
      paint(ellPts(px, py, 17, 12, 8, 2), { wash: MOE, washOp: 255, ink: SUMI, sw: .7 }); pop(); }
    sheetFrame(1);
  }

  // ---- V16 · 替版：四季连续重印，Clawd 四次完全相同 ----
  function V16(t, lt) {
    mountBG(t, { goma: 12, gomaK: 'v16' });
    const SEASONS = [
      { c: MOE,  sky: [AI, 130], g: mixCol(MIDORI, WASHI, .3), flowers: 9 },
      { c: MIDORI, sky: [AI_LT, 150], g: MIDORI, flowers: 6 },
      { c: OCHRE, sky: [mixCol(OCHRE, AI, .3), 140], g: mixCol(OCHRE, SUMI, .2), flowers: 3 },
      { c: '#EFE6CE', sky: ['#B9C4CE', 130], g: mixCol(WASHI, '#FFFFFF', .3), flowers: 0 },
    ];
    const si = clamp(Math.floor((lt - .2) / 1.17), 0, 3), S = SEASONS[si];
    const reveal = clamp((lt - .2 - si * 1.17) / .35);      // 换季 = 整套色版擦掉重印
    push(); translate(lerp(7, 0, easeOut(reveal)), lerp(-5, 0, easeOut(reveal)));
    if (si < 3 || reveal > .2) bokashi('v16s' + si, S.sky[0], S.sky[1], 60, 520);
    paint([[0, 700], [W, 660], [W, H], [0, H]], { wash: S.g, washOp: 220, ink: null, curv: .3 });
    // 同一枝花
    push(); translate(W, 200); rotate(-.05);
    inkLine([[0, 0], [-520, 120], [-1000, 160]], 8, OCHRE, 'ink', .4);
    for (let i = 0; i < S.flowers; i++) { const p = [[-480, 110], [-620, 150], [-760, 130], [-900, 175], [-540, 80], [-700, 60], [-830, 100], [-960, 120], [-600, 190]][i];
      for (let pi = 0; pi < 5; pi++) { const a = pi / 5 * TAU;
        paint(ellPts(p[0] + Math.cos(a) * 19, p[1] + Math.sin(a) * 19, 16, 12, 8, 2), { wash: S.c, washOp: 240, ink: SUMI, sw: .6 }); } }
    pop();
    // 树下那个人：四季姿势完全相同（neutral，同相位呼吸）
    const u = 27, br = Math.sin(t * 2.4) * .02;
    kasa(820, 800 - 8 * u, u, { back: 1, dip: misreg(t) });
    pc(820, 800, u, { view: 'front', dip: misreg(t), eyes: 'normal', sq: br, boilKey: 'a2c', draw: belt });
    pop();
    sheetFrame(1);
  }

  // ---- V17 · 一只手摊开，掌心「缘」印呼吸 ----
  function V17(t, lt) {
    mountBG(t, { goma: 12, gomaK: 'v17' });
    // 手臂从下方伸入，手掌摊开（特写）
    const reach = ease(clamp(lt / .7));
    push(); translate(960, lerp(1300, 640, reach));
    paint(rectPts(-70, 100, 140, 500, 8), { wash: CLAY, washOp: 255, ink: SUMI, sw: 2 });   // 手臂
    paint(rectPts(-190, -190, 380, 300, 14), { wash: CLAY, washOp: 255, ink: SUMI, sw: 2.2 }); // 掌
    for (const fx of [-140, -60, 20, 100]) paint(rectPts(fx, -290, 62, 120, 8), { wash: CLAY, washOp: 255, ink: SUMI, sw: 1.6 }); // 指
    // 掌纹呼吸
    boilSeed('palm');
    inkLine([[-140, -80], [0, -40], [150, -90]], 2.2, SUMI, 'ink', .4);
    inkLine([[-120, -10], [30, 20], [140, -10]], 1.6, mixCol(SUMI, CLAY, .4), 'inkfine', .4);
    // 「缘」印每拍亮一下
    const pk = t > 52.7 ? 1 + .04 * Math.max(0, Math.sin((t - .7) * TAU / BEAT / 2)) : clamp((lt - .8) / .2);
    seal(0, -40, 92, '缘', pk);
    pop();
    sheetFrame(1);
  }

  // ---- V18 · 手握起再张开：掌心横纹延伸出画框 ----
  function V18(t, lt) {
    mountBG(t, { goma: 10, gomaK: 'v17' });
    const closeK = lt < 1.2 ? ease(clamp(lt / 1.2)) : 1 - ease(clamp((lt - 1.2) / .8));   // 握起→张开
    push(); translate(960, 700);
    const w2 = lerp(380, 210, closeK), h2 = lerp(300, 380, closeK);
    paint(rectPts(-w2 / 2, -h2 / 2 - 100, w2, h2, 16), { wash: CLAY, washOp: 255, ink: SUMI, sw: 2.2 });
    for (const fx of [-w2 * .34, -w2 * .12, w2 * .1, w2 * .32]) paint(rectPts(fx, -h2 / 2 - 210 + closeK * 60, 58, 110 - closeK * 55, 8), { wash: CLAY, washOp: 255, ink: SUMI, sw: 1.6 });
    pop();
    // 第 3 拍横纹延伸出画面爬进装裱边
    if (lt > 1.3) {
      const p = ease(clamp((lt - 1.3) / 1.2));
      inkLine([[880, 780], [1100, 800], [W - 44 + (W) * p, 820 - p * 30]], 3.2, SUMI, 'ink', .3);
      if (p > .7) inkLine([[W - 40, 812], [W + 60, 816]], 2.4, mixCol(SUMI, MOUNT, .3), 'inkfine', .3);
    }
    sheetFrame(1);
  }

  // ---- V19 · 大浪压来，停在方盒前一寸：不侵 ----
  function V19(t, lt) {
    mountBG(t, { goma: 16, gomaK: 'v19' });
    // 浪从右压近（5 层），第 6 拍停（1.74+1.2 ≈ 59.9）
    const advance = clamp(lt / (BEAT * 6));
    const waveX = lerp(W + 200, 1210, ease(advance));       // 停在 1210，方盒在 900 宽 ±5*20=1000 → 前一寸
    paint([[waveX, 980], [waveX - 140, 640], [waveX - 60, 480], [waveX + 120, 300], [waveX + 340, 420], [W + 60, 330], [W + 60, H], [waveX, H]],
      { wash: MIDORI, washOp: 235, ink: SUMI, sw: 2.2, curv: .3 });
    // 浪爪（浪脊分裂）
    for (let i = 0; i < 3; i++) { const cxx = waveX + 130 + i * 130, cy = 330 + i * 60;
      paint([[cxx, cy], [cxx - 46, cy - 90 - i * 14], [cxx + 8, cy - 130 - i * 10], [cxx + 52, cy - 40]], { wash: MIDORI, washOp: 255, ink: SUMI, sw: 1.6, curv: .3 }); }
    // 泡沫留纸白
    paint(ellPts(waveX - 90, 620, 46, 26, 10, 4), { wash: '#FBF5E6', washOp: 255, ink: SUMI, sw: 1 });
    paint(ellPts(waveX - 30, 480, 34, 20, 10, 4), { wash: '#FBF5E6', washOp: 255, ink: SUMI, sw: 1 });
    // 阿宿站得笔直，斗笠压低（determined）
    const u = 30, stop = advance >= 1;
    const u2 = stop ? u : u;
    kasa(880, 900 - 8 * u, u, { back: 1, dip: misreg(t) });
    backSwords(880, 900 - 8 * u, u, misreg(t));
    pc(880, 900, u, { view: 'front', dip: misreg(t), eyes: 'determined', sq: -.03, aL: -.9, aR: -.9, boilKey: 'a2c', draw: belt });
    // 最后一拍浪退光
    if (lt > 3.55) washPaper((lt - 3.55) / .6, 'right');
    sheetFrame(1);
  }

  shots([[42.10, V14], [44.20, V15], [46.74, V16], [51.94, V17], [54.50, V18], [57.05, V19]]);
})();
