// act1.js —— 镜 01–04（0.00–13.92）· 夜 · 收拾行李 / 切纸 / 裂缝 / 灯一层层灭
(() => {

  // 一片折起来的衣物：薄纸，落下有 0.1s 回弹（纸的回弹，不是弹簧）
  function cloth(x, y, w, h, col, rot, p) {
    push(); translate(x, y); rotate(rot);
    dgPaper(rectPts(-w / 2, -h / 2, w, h, .6), col, { shadow: false, sk: .5, rim: false });
    inkLine([[-w * .34, -h * .18], [w * .30, -h * .10]], 1.1, mixCol(col, p.front, .3), 'inkfine', .3);
    pop();
  }

  // ---------- 镜 01 · 0.00–3.62 ·「收拾了行李 整理着包裹」 ----------
  // 读：他跪在箱前 → 每拍一件衣物落进箱口 → 镜头一直缓慢推近（不许加速）。
  function s01(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 1);
    dgShell(p, { glowK: .5 });
    const z = lerp(1.04, 1.16, ease(lt / dur));
    dgCam(-6 + 5 * Math.sin(lt * .5), 26 + 30 * ease(lt / dur) + 4 * Math.sin(lt * .8), z);
    dgSky(p, { k: lk });
    dgHills(p);
    dgWall(p, { k: lk });
    dgLayer(.46, () => {
      dgLamp(p, 610, 372, { k: .9 * lk });
      dgRail(p, 706, 946, 232, { n: 3 });
    });
    dgFloor(p, { poolK: lk, rug: { x: 200, y: FTOP + 96, w: 520, h: 190 } });
    dgLayer(.70, () => {
      dgDresser(p, 138, 1392, 232, 236);
      dgCrates(p, 150, 1604, { n: 2 });
      dgChair(p, 812, GY + 8);
      dgPlant(p, 178, GY + 6, 92);
    });
    // 每拍一件衣物：从他手里 → 落进箱口（0.30s 飞行 + 回弹）
    const drops = [0.24, 1.105, 1.97, 2.835];
    drops.forEach((tk, i) => {
      if (t < tk) return;
      const k = ease(seg(t, tk, tk + .30));
      const rb = spring(t, tk + .30, 11, 34) * 6;
      const x = lerp(420, 556 + (i - 1.5) * 28, k), y = lerp(1430, GY - 96 - i * 5, k) - Math.sin(k * Math.PI) * 44 + rb;
      cloth(x, y, 62, 46, mixCol(p.mid, p.light, .26 + i * .05), (hash(i * 3) - .5) * .7 + k * .5, p);
    });
    dgLayer(.74, () => dgSuitcase(p, 520, GY - 112, 260, 112));
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'sad'], [2.04, 'bored'], [3.08, 'sad']]);
      const fold = Math.sin(bpOf(t) * Math.PI * 2);
      dgKneel(372, 1586, 23, mixCol(PAL.clayDk, p.front, .35));
      dgHim(372, 23, mood, { view: 'q', dy: (mood.dy || 0) + 1.55, noLegs: true, emote: null,
        aL: .10 + .16 * fold, aR: .55 + .35 * fold, lookY: .55 });
    });
    dgLayer(1, () => dgDust(p, 30, 3, { k: .55 }));
    dgCamEnd();
    dgVeil(Math.max(0, 1 - lt / .32));
  }

  // 墙上那张"两个人"的纸：并排剪着他和她（全片第一次出现"两个人"）
  function duoSheet(p, x, y, w, h, o = {}) {
    const gap = o.gap || 0, tilt = o.tilt || 0;
    const paper = mixCol(p.wallDk, p.light, .30), edge = mixCol(p.rim, paper, .45);
    push(); translate(x + w / 2, y + h / 2); rotate(tilt); translate(-(x + w / 2), -(y + h / 2));
    const half = (x0, ww) => {
      const P = rectPts(x0, y, ww, h, 1);
      dgShadow(P, 1, 6, 10);
      paint(P, { wash: paper, ink: null });
      dgRim([[x0, y + 1], [x0 + ww, y + 1]], 2, edge);
    };
    half(x - gap, w / 2 - 2);
    half(x + w / 2 + 2 + gap, w / 2 - 2);
    clawd(x + w * .25 - gap, y + h * .92, h * .030, { ...feel('neutral', T, { view: 'q' }), aL: -.15, aR: .2, noShadow: true, boilKey: 'duoA' });
    clawd(x + w * .74 + gap, y + h * .92, h * .027, { ...feel('neutral', T, { view: 'front' }), aL: .2, aR: -.15, noShadow: true, boilKey: 'duoB',
      col: p.accent, dk: mixCol(p.accent, PAL.ink, .45), lt: mixCol(p.accent, '#ffffff', .35) });
    pop();
  }

  // ---------- 镜 02 · 3.62–7.58 ·「从形影不离到轻易的割舍」 ----------
  // 读：拉出全屋，右边墙上挂着剪了两个人的纸 → 6.08 刀落 → 6.40 切开、两半滑开 → 裂缝里是夜空。
  const S2 = { x: 566, y: 636, w: 300, h: 240 };
  function s02(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 2);
    const knifeT = 6.08, cutT = 6.40, gapK = ease(seg(t, cutT, cutT + .44));
    const push = ease(seg(t, 6.16, 6.92));
    const z = lerp(lerp(1.16, .99, ease(seg(lt, 0, 2.4))), 1.34, push);
    const cx = lerp(-4, S2.x + S2.w / 2 - CX, push), cy = lerp(26, S2.y + S2.h * .5 - CY - 120, push);
    dgShell(p, { glowK: .5 });
    dgCam(cx, cy, z);
    dgSky(p, { k: lk });
    dgHills(p);
    dgWall(p, { k: lk });
    dgLayer(.46, () => { dgLamp(p, 610, 372, { k: .9 * lk }); dgRail(p, 700, 962, 236, { n: 3 });
      dgWallArt(p, [{ x: 508, y: 520, w: 96, h: 112 }]); });
    // 那张纸（挂在墙上；切开后切口透出后面的夜空）
    dgLayer(.50, () => {
      if (gapK > .01) {
        paint(rectPts(S2.x + S2.w / 2 - 8 - 17 * gapK, S2.y - 6, 34 * gapK + 16, S2.h + 12), { wash: mixCol(p.sky, '#ffffff', .18), ink: null });
        glow(S2.x + S2.w / 2, S2.y + S2.h * .5, 90 + gapK * 130, p.light, .40);
      }
      duoSheet(p, S2.x, S2.y, S2.w, S2.h, { gap: 26 * gapK, tilt: 22 * gapK * .01 });
    });
    dgFloor(p, { poolK: lk, rug: { x: 200, y: FTOP + 96, w: 520, h: 190 } });
    dgLayer(.70, () => {
      dgDresser(p, 138, 1392, 232, 236);
      dgCrates(p, 150, 1604, { n: 2 });
      dgChair(p, 830, GY + 8);
      dgPlant(p, 178, GY + 6, 92);
    });
    // 刀：从画面上方落下（纸做的一把刀）
    if (t > knifeT - .30) {
      const k = easeIn(seg(t, knifeT - .30, knifeT)), fall = k * 640;
      const kx = S2.x + S2.w / 2, ky = S2.y - 320 + fall - (t > knifeT ? 22 : 0);
      dgLayer(.58, () => {
        if (t > knifeT + .34) inkLine([[kx, ky + 130], [kx + 2, S2.y + S2.h * .52]], 2, mixCol(p.front, p.rim, .28), 'inkfine', .2);
        dgPaper(rectPts(kx - 9, ky - 244, 18, 84, .6), mixCol(p.mid, p.front, .30), { shadow: false, rim: [[kx - 9, ky - 244], [kx + 9, ky - 244]], rimCol: mixCol(p.rim, p.mid, .4) });
        dgPaper([[kx - 8, ky - 160], [kx + 8, ky - 160], [kx + 6, ky + 104], [kx, ky + 132], [kx - 6, ky + 104]], mixCol(p.rim, '#ffffff', .40),
                { shadow: false, rim: [[kx - 8, ky - 160], [kx + 8, ky - 160]], rimCol: '#fffaf0', rimW: 1.6 });
      });
    }
    dgLayer(.74, () => dgSuitcase(p, 520, GY - 112, 260, 112));
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'sad'], [5.05, 'confused'], [5.96, 'surprised'], [knifeT, 'scared'], [6.62, 'sad']]);
      const up = ease(seg(t, 5.88, 6.28));
      dgKneel(330, 1586, 22, mixCol(PAL.clayDk, p.front, .35));
      dgHim(330, 22, mood, { view: 'q', dy: (mood.dy || 0) + 1.5 - up * .18, noLegs: true, emote: null,
        lookY: -up * .9 + .4, aL: -.28 + .1 * Math.sin(bpOf(t) * 6), aR: -.45 + .2 * Math.sin(bpOf(t) * 4) });
    });
    dgLayer(1, () => dgDust(p, 26, 7, { k: .5 }));
    dgCamEnd();
    dgSweep(Math.max(0, 1 - lt / .30), p, 'down', mixCol(p.front, p.mid, .5));
    dgVeil(Math.max(0, 1 - lt / .18));
  }

  // ---------- 镜 03 · 7.58–10.46 ·「或者说 我们的爱怎么了」 ----------
  // 读：两半纸浮在中间，裂缝里是夜空 → 他在左、她在右，隔着缝对看 → 10.03「么」灯暗一档。
  const S3 = { lx: 296, rx: 560, y: 556, w: 244, h: 352 };
  function s03(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 3);
    const dimK = .46 * ease(seg(t, 10.03, 10.5));         // 「么」：灯从 100% 掉到 65%
    const pp = dgDim(p, dimK);
    const toHer = ease(seg(t, 8.66, 9.34)), back = ease(seg(t, 10.02, 10.46));
    const z = 1.08 + .24 * toHer - .10 * back;
    const cx = lerp(-4, 150, toHer) - 120 * back, cy = 10 * Math.sin(lt * .6);
    dgShell(pp, { glowK: .5 * (1 - dimK) });
    dgCam(cx, cy, z);
    dgSky(pp, { k: lk });
    dgHills(pp);
    dgWall(pp, { k: lk });
    dgLayer(.46, () => { dgLamp(p, 610, 372, { k: .9 * lk * (1 - dimK) }); dgRail(pp, 700, 962, 236, { n: 3 }); });
    dgFloor(pp, { poolK: lk * (1 - dimK), rug: { x: 200, y: FTOP + 96, w: 520, h: 190 } });
    dgLayer(.60, () => {
      dgDresser(pp, 138, 1392, 232, 236);
      dgCrates(pp, 150, 1604, { n: 2 });
      dgChair(pp, 812, GY + 8);
    });
    // 裂缝：一道真的撕开的夜空（先是细缝，慢慢变宽）
    const gapH = 12 + 74 * ease(seg(t, 7.58, 10.3));
    dgLayer(.44, () => {
      const bx0 = CX - gapH, bx1 = CX + gapH, by0 = S3.y - 40, by1 = S3.y + S3.h + 60;
      dgPaper([[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]], mixCol(p.sky, '#ffffff', .16), { shadow: false });
      glow(CX, (by0 + by1) / 2, 120 + gapH * 2.4, p.light, .38 * (1 - dimK * .5));
      // 缝底的山影
      dgPaper([[bx0 - 4, by1 - 40], [CX - gapH * .2, by1 - 78], [CX + gapH * .4, by1 - 46], [bx1 + 4, by1 - 30], [bx1 + 4, by1 + 30], [bx0 - 4, by1 + 30]],
              mixCol(p.hill, p.front, .30), { shadow: false });
      for (let i = 0; i < 12; i++) {
        const sx = bx0 + 6 + hash(i * 3.7) * (gapH * 2 - 12), sy = by0 + 20 + hash(i * 6.1) * (by1 - by0 - 50);
        const s = 1.4 + hash(i * 2.3) * 2.4, tw = .5 + .5 * Math.sin(T * (1.6 + hash(i) * 2) + i);
        paint(rectPts(sx, sy, s, s), { wash: mixCol(p.light, '#ffffff', .6), washOp: 120 + 120 * tw, ink: null });
      }
    });
    // 两半纸：左边他、右边她（纸上的两个小人已经被切开，各站在自己那一半上）
    dgLayer(.56, () => {
      const tilt = Math.sin(T * .9) * .008;
      [[S3.lx, 'A'], [S3.rx, 'B']].forEach(([hx, k]) => {
        push(); translate(hx + S3.w / 2, S3.y + S3.h / 2); rotate(tilt * (k === 'A' ? 1 : -1)); translate(-(hx + S3.w / 2), -(S3.y + S3.h / 2));
        const P = rectPts(hx, S3.y, S3.w, S3.h, 1);
        dgShadow(P, 1, 8, 14);
        paint(P, { wash: mixCol(p.wallDk, p.light, .28), ink: null });
        dgRim([[hx, S3.y + 1], [hx + S3.w, S3.y + 1]], 2, mixCol(p.rim, p.wallDk, .45));
        // 撕裂的边：一条毛边
        dgRim(k === 'A' ? [[hx + S3.w, S3.y], [hx + S3.w - 2, S3.y + 60], [hx + S3.w + 1, S3.y + 130], [hx + S3.w - 2, S3.y + 210], [hx + S3.w, S3.y + S3.h]]
                        : [[hx, S3.y], [hx + 2, S3.y + 60], [hx - 1, S3.y + 130], [hx + 2, S3.y + 210], [hx, S3.y + S3.h]],
              1.8, mixCol(p.rim, p.light, .35));
        // 纸上的小人（他原色 / 她粉）
        const fy = S3.y + S3.h * .93, uu = S3.h * .043;
        clawd(k === 'A' ? hx + S3.w * .5 : hx + S3.w * .5, fy, uu,
              k === 'A' ? { ...feel('neutral', T, { view: 'q' }), aL: .1, aR: -.1, noShadow: true, boilKey: 'pA' }
                        : { ...feel('neutral', T, { view: 'q', flip: true }), aL: .1, aR: -.1, noShadow: true, boilKey: 'pB',
                            col: p.accent, dk: mixCol(p.accent, PAL.ink, .45), lt: mixCol(p.accent, '#ffffff', .35) });
        pop();
      });
    });
    // 他真的在左边地上，她真的在右边（粉色，纱纸那一层）
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'confused'], [8.6, 'hopeful'], [10.1, 'sad']]);
      dgKneel(250, 1590, 20, mixCol(PAL.clayDk, pp.front, .35));
      dgHim(250, 20, mood, { view: 'q', dy: (mood.dy || 0) + 1.55, noLegs: true, emote: null, lookY: -.7, lookX: .5 });
    });
    dgLayer(.80, () => dgHer(pp, 826, 19, .25, { view: 'q', flip: true, lookY: -.5, lookX: -.4 }));
    dgLayer(1, () => dgDust(pp, 24, 11, { k: .45 * (1 - dimK) }));
    dgCamEnd();
    dgSweep(Math.max(0, 1 - lt / .26), pp, 'up', mixCol(pp.front, pp.mid, .55));
  }

  // ---------- 镜 04 · 10.46–13.92 ·「（器乐，无字幕）」 ----------
  // 全片唯一停工：他跪着不动，房间的层从外到内一片片灭，只剩窗洞一点暖光 → 13.6 光重新亮、色阶切金。
  function s04(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 4);
    const death = ease(seg(t, 10.55, 13.45)), rise = ease(seg(t, 13.58, 13.92));
    const kSky = .40 * death * (1 - rise), kWall = .62 * death * (1 - rise), kFloor = .80 * death * (1 - rise), kMid = .55 * death * (1 - rise);
    const pSky = dgDim(p, kSky), pWall = dgDim(p, kWall), pFloor = dgDim(p, kFloor), pMid = dgDim(p, kMid);
    const dimNow = .55 * death * (1 - rise);
    dgShell(dgDim(p, dimNow * .8), { glowK: .42 * (1 - dimNow) + .8 * rise });
    dgCam(3 * Math.sin(lt * .33), 18, 1.06 + .02 * ease(lt / dur));
    dgSky(pSky, { k: lk });
    dgHills(pSky);
    dgWall(pWall, { k: lk });
    dgLayer(.46, () => { dgLamp(pMid, 610, 372, { k: .9 * lk * (1 - dimNow) }); dgRail(pMid, 700, 962, 236, { n: 3 }); });
    dgFloor(pFloor, { poolK: lk * (1 - death * .85), rug: { x: 200, y: FTOP + 96, w: 520, h: 190 } });
    dgLayer(.70, () => {
      dgDresser(pFloor, 138, 1392, 232, 236);
      dgCrates(pFloor, 150, 1604, { n: 2 });
      dgChair(pFloor, 812, GY + 8);
    });
    dgLayer(.74, () => dgSuitcase(pFloor, 520, GY - 112, 260, 112, { tags: false }));
    // 窗洞是最后亮着的：光自己收拢成一束
    if (death > .02) {
      const k = death * (1 - rise);
      glow(WIN0.x + WIN0.w * .5, WIN0.y + WIN0.h * .5, 210 + 90 * k, p.light, .30 * k);
      glow(WIN0.x + WIN0.w * .5, WIN0.y + WIN0.h * .52, 90, p.light, .34 * k);
    }
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'sad'], [11.4, 'bored'], [12.9, 'sad']]);
      const breath = Math.sin(t * 1.15) * .02;
      dgKneel(372, 1586, 23, dgDimCol(PAL.clayDk, dimNow + .15));
      dgHim(372, 23, mood, { view: 'q', dy: (mood.dy || 0) + 1.55, sq: (mood.sq || 0) + breath, noLegs: true, emote: null,
        lookY: .7, col: dgDimCol(PAL.clay, dimNow * .85), dk: dgDimCol(PAL.clayDk, dimNow * .8), lt: dgDimCol('#F2A283', dimNow * .7) });
    });
    dgLayer(1, () => dgDust(pFloor, 18, 5, { k: .35 * (1 - death) }));
    dgCamEnd();
  }

  shots([[0, s01], [3.62, s02], [7.58, s03], [10.46, s04]]);
})();
