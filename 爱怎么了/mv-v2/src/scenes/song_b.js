// song_b.js —— 《爱怎么了》纸雕灯影 MV · 镜 13–23（35.50–55.667s）· 横屏 1920×1080
(() => {
  const DIM = '#05040a';
  const dimP = (p, k) => { const o = {}; for (const key in p) o[key] = mixCol(p[key], DIM, k); return o; };
  const KNEEL = { sq: .20, dy: .5 };   // 蹲下：压扁一点，腿还在（纸片小人只转不弯）

  // ---------- 镜 13 · 35.50–36.55 ·「但回忆」（纸带卷成一个空圈） ----------
  function s13(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    const curl = ease(seg(t, 35.50, 36.10));
    plCam(0, lerp(-40, -10, curl), 1.12 + .10 * curl);
    plSky(p, { lightK: .8 });
    plWall(p, { lightK: .8 });
    plMids(p, { photos: false });

    const pts = [];
    const R = 170, ccx = 1020, ccy = 480;
    for (let i = 0; i <= 24; i++) {
      const a = i / 24 * TAU * .97;
      const tg = [ccx + Math.cos(a - Math.PI / 2) * R, ccy + Math.sin(a - Math.PI / 2) * R];
      const sr = [420 + i * 26, 430 + Math.sin(i * .55) * 120];
      pts.push([lerp(sr[0], tg[0], curl), lerp(sr[1], tg[1], curl)]);
    }
    paint(ribbon(pts, 54 - 22 * curl, 30), { wash: p.accent, ink: mixCol(p.accent, p.front, .45) });
    const fog = ease(seg(t, 35.86, 36.30));
    if (fog > .02) {
      plGlow(ccx, ccy, 140, p.light, .35 * fog);
      paint(ellPts(ccx, ccy, 122 * fog, 122 * fog, 22), { wash: mixCol(p.light, '#fff', .35), washOp: 90 * fog, ink: null });
    }
    plLayer(.9, () => {
      const mood = emotions(t, [[0, 'sad']]);
      plHim(t, 620, 25, mood, { view: 'q', lookX: .6, aL: -.3, aR: -.2 });
    });
    plCamEnd();
    plBevel(p);
  }

  // ---------- 镜 14 · 36.55–37.85 ·「但回忆」（同一个圈，收紧一圈，照片浮出来） ----------
  function s14(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    const tight = ease(seg(t, 36.55, 36.98));
    const R = 170 * (1 - .18 * tight), ccx = 1020, ccy = 480;
    plCam(0, -10, 1.22 + .05 * tight);
    plSky(p, { lightK: .8 });
    plWall(p, { lightK: .8 });
    plMids(p, { photos: false });
    const pts = [];
    for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU * .97; pts.push([ccx + Math.cos(a - Math.PI / 2) * R, ccy + Math.sin(a - Math.PI / 2) * R]); }
    paint(ribbon(pts, 32, 26), { wash: p.accent, ink: mixCol(p.accent, p.front, .45) });
    const k = ease(seg(t, 36.98, 37.38));
    if (k > .01) {
      const w = 300 * k, h = 210 * k;
      push(); translate(ccx, ccy); rotate((1 - k) * .2);
      plPhoto(-w / 2, -h / 2, w, h, p, { two: true, col: mixCol(p.mid, p.light, .2), crack: t > 37.38 });
      pop();
    }
    plLayer(.9, () => {
      const mood = emotions(t, [[0, 'sad'], [37.38, 'cry']]);
      plHim(t, 620, 25, mood, { view: 'q', lookX: .7, aL: -.35, aR: -.25 });
    });
    plCamEnd();
    plBevel(p);
  }

  // ---------- 镜 15 · 37.85–39.42 ·「珍贵的点点滴滴」 ----------
  function s15(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    plCam(0, lerp(40, -80, ease(seg(t, 37.85, 39.3))), 1.12);
    plSky(p, { lightK: .85 });
    plWall(p, { lightK: .85 });
    plMids(p, { photos: false });
    const ccx = 1020, ccy = 480;
    const burst = ease(seg(t, 37.85, 38.42));
    paperField(56, 11, (i, r1, r2, r3) => {
      const a = r1 * TAU, d = (60 + r2 * 520) * burst;
      const x = ccx + Math.cos(a) * d + Math.sin(t * .7 + i) * 12 * burst;
      const y = ccy + Math.sin(a) * d * .8 - (t - 37.85) * 34 * burst * (.4 + r3);
      const s = (8 + r3 * 16) * (1 + .35 * burst);
      const col = i % 5 === 0 ? p.accent : mixCol(p.light, '#fff', .15 + r2 * .3);
      plPaperBit(x, y, s, col, a + t * .5 * (r1 - .5));
    });
    plLayer(.9, () => {
      const mood = emotions(t, [[0, 'sad'], [1.1, 'cry']]);
      plHim(t, 760, 27, mood, { view: 'q', lookY: -.6, aR: .8, aL: -.2 });
    });
    plCamEnd();
    plBevel(p);
  }

  // ---------- 镜 16 · 39.42–41.72 ·「再没什么意义」（褪色、落地成灰） ----------
  function s16(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    plCam(0, lerp(-30, 40, ease(lt / dur)), 1.12 - .12 * ease(lt / dur));
    plSky(p, { lightK: .7 });
    plWall(p, { lightK: .7 });
    plMids(p, { photos: false });
    plFloor(p, { box: false, floorDust: true });
    const ccx = 1020, ccy = 470;
    const grey = ease(seg(t, 39.42, 40.02));
    const fall = ease(seg(t, 40.28, 41.30));
    paperField(56, 11, (i, r1, r2, r3) => {
      const a = r1 * TAU, d = 60 + r2 * 520;
      const x0 = ccx + Math.cos(a) * d, y0 = ccy + Math.sin(a) * d * .8 - (t - 37.85) * 34 * (.4 + r3);
      const x = lerp(x0, ccx + (r1 - .5) * 300, fall);
      const y = lerp(y0, FL + 10 + r2 * 12, fall);
      const s = 8 + r3 * 16;
      const col0 = i % 5 === 0 ? p.accent : mixCol(p.light, '#fff', .15 + r2 * .3);
      plPaperBit(x, y, s * (1 - .35 * fall), mixCol(col0, '#8b8378', grey), a + t * .5 * (r1 - .5));
    });
    if (fall > .5) paint(ellPts(ccx, FL + 14, 150 * fall, 14 * fall, 20), { wash: mixCol('#8b8378', p.front, .35), ink: null });
    plLayer(.9, () => {
      const mood = emotions(t, [[0, 'bored'], [1.8, 'sad']]);
      plHim(t, 760, 26, mood, { view: 'q', lookY: .7, aL: -.7, aR: -.7, ...KNEEL });
    });
    plCamEnd();
    plBevel(p);
  }

  // ---------- 镜 17 · 41.72–43.45 ·「爱怎么随风而起」（大时刻 C：风灌进箱体） ----------
  function s17(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    const gust = ease(seg(t, 41.72, 42.40));
    const fly = ease(seg(t, 42.96, 43.45));
    plCam(lerp(-40, 50, ease(lt / dur)), lerp(40, -90, ease(lt / dur)), 1.14 - .22 * ease(lt / dur));
    plSky(p, { lightK: .9 + .3 * fly });
    plWall(p, { lightK: .9 });
    plMids(p, { photos: false });
    plFloor(p, { box: true, boxX: 1120, boxY: FL - 100, boxW: 300, boxH: 100 });
    const ccx = 900, ccy = FL + 10;
    paperField(64, 21, (i, r1, r2, r3) => {
      const x0 = ccx + (r1 - .5) * 420, y0 = ccy + r2 * 20;
      const lift = fly * (300 + r3 * 760);
      const x = x0 + fly * (120 + r3 * 420) + gust * 24 * Math.sin(t * 3 + i);
      const y = y0 - lift + gust * 8;
      const s = 9 + r3 * 15;
      const col = i % 6 === 0 ? p.accent : mixCol(p.light, '#fff', .1 + r2 * .35);
      plPaperBit(x, y, s, col, gust * .21 + fly * (r1 - .5) * 1.6);
    });
    plLayer(.9, () => {
      const mood = emotions(t, [[0, 'scared'], [1.6, 'cry']]);
      plHim(t, 800 - 70 * fly, 27, mood, { view: 'q', lookY: -.7, aL: .1 + .9 * gust, aR: .2 + 1.0 * gust, rot: -.04 * gust });
    });
    plCamEnd();
    if (t > 42.90 && t < 42.98) veil(.10, '#FFFDF6');
    plBevel(p);
  }

  // ---------- 镜 18 · 43.45–45.02 ·「又消散风雨里」（纸雨，透过窗看） ----------
  function s18(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    plCam(0, 0, 1.06);
    plSky(p, { lightK: .55 });
    plWall(p, { lightK: .5 });
    plFloor(p, { box: true, boxX: 1120, boxY: FL - 100, boxW: 300, boxH: 100 });
    plLayer(.9, () => {
      const mood = emotions(t, [[0, 'scared'], [1.0, 'sad']]);
      plHim(t, 940, 20, mood, { view: 'q', lookY: -.7, aL: -.2, aR: .3 });
    });
    // 纸雨：斜着落下
    paperField(80, 33, (i, r1, r2, r3) => {
      const sp = 420 + r3 * 420, y = ((t * sp + r2 * 1400) % (CAVH + 300)) + CAV.y0 - 150;
      const x = CAV.x0 + r1 * CAVW + (y - CAV.y0) * .22;
      const s = 6 + r3 * 10;
      plPaperBit(x, y, s, mixCol(p.light, '#fff', .2 + r2 * .3), .5 + .2);
    });
    // 窗框：近平面遮挡（相机在窗外面，透过窗看里面）
    const wf = mixCol(p.front, '#000', .3);
    paint(rectPts(56, 30, W - 112, 34), { wash: wf, ink: null });
    paint(rectPts(56, 1000, W - 112, 60), { wash: wf, ink: null });
    paint(rectPts(56, 30, 40, 1030), { wash: wf, ink: null });
    paint(rectPts(W - 96, 30, 40, 1030), { wash: wf, ink: null });
    paint(rectPts(950, 30, 18, 1030), { wash: wf, ink: null });
    paint(rectPts(56, 520, W - 112, 18), { wash: wf, ink: null });
    // 玻璃上的水痕
    const wet = ease(seg(t, 44.24, 44.90));
    if (wet > .01) for (let i = 0; i < 9; i++) {
      const x = 140 + hash(i * 5.3) * 1620, y = 200 + hash(i * 2.7) * 560, h = (40 + hash(i) * 110) * wet;
      paint(ribbon([[x, y], [x + 5, y + h * .5], [x - 4, y + h]], 8 * wet, 3 * wet), { wash: mixCol(p.light, '#fff', .35), washOp: 110, ink: null });
    }
    plCamEnd();
    plBevel(p);
  }

  // ---------- 镜 19 · 45.02–46.15 ·「找个理由」（掏出折起来的纸条） ----------
  function s19(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    plCam(0, 60, 1.42 + .16 * ease(lt / dur));
    plSky(p, { lightK: .45 });
    plWall(p, { lightK: .4 });
    plFloor(p, { box: false, floorDust: true });
    const out = ease(seg(t, 45.02, 45.36));
    plLayer(.9, () => {
      const mood = emotions(t, [[0, 'nervous'], [.9, 'sad']]);
      plHim(t, 900, 40, mood, { view: 'q', lookY: .5, aL: -.1, aR: .2 + .7 * out, ...KNEEL, dy: .5 });
      const nx = 900 + 40 * 6.4, ny = FL - 40 * 5.0 - out * 10;
      paint(rectPts(nx - 38, ny - 20, 76, 40, .6), { wash: mixCol('#FFF5E2', p.light, .2), ink: mixCol(p.front, p.light, .3), sw: .8 });
      plEdge([[nx - 34, ny], [nx + 34, ny - 2]], mixCol(p.front, p.light, .25), 1);
    });
    plCamEnd();
    plBevel(p);
  }

  // ---------- 镜 20 · 46.15–49.50 ·「却骗不过自己」（纸条展开是空的） ----------
  function s20(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    const push = ease(seg(t, 46.15, 47.6));
    plCam(0, lerp(50, -20, push), 1.46 + .22 * push);
    plSky(p, { lightK: .40 });
    plWall(p, { lightK: .35 });
    plFloor(p, { box: false });

    const open = ease(seg(t, 45.62, 46.3));
    const nx = 1040, ny = 620;
    const w = 280 * (.45 + .55 * open), h = 190 * open;
    paint(rectPts(nx - w / 2, ny - h / 2, w, h, .8), { wash: mixCol('#FFF5E2', p.light, .22), ink: mixCol(p.front, p.light, .3), sw: 1 });
    plEdge([[nx - w / 2 + 6, ny - h / 2 + 4], [nx + w / 2 - 6, ny - h / 2 + 4]], mixCol(p.rim, p.front, .5), 1.2);

    plLayer(.9, () => {
      const mood = emotions(t, [[0, 'hopeful'], [46.7, 'sad'], [48.3, 'bored']], { take: .7 });
      plHim(t, 860, 42, mood, { view: 'q', lookY: .35, lookX: 0, aL: -.15, aR: .55, ...KNEEL, dy: .4 });
    });
    plCamEnd();
    plBevel(p);
    dipOut(lt, dur, .30);
  }

  // ---------- 镜 21 · 49.50–51.40 ·「到结局」（退出箱体，看见木框） ----------
  function s21(t, lt, dur) {
    const p = plPal(t);
    const k = ease(seg(t, 49.50, 51.20));
    const sc = lerp(1, .72, k);
    paint(rectPts(-140, -140, W + 280, H + 280), { wash: '#0a0810', ink: null });
    push();
    translate(CX, CAV.y1 - 40); scale(sc); translate(-CX, -(CAV.y1 - 40));
    paint(rectPts(-200, -200, W + 400, H + 400), { wash: '#08060d', ink: null });
    plCam(0, 0, 1);
    plFrame(p);
    plSky(p, { lightK: .9 });
    plWall(p, { lightK: .85 });
    plMids(p, { shelf: true, photos: false });
    plFloor(p, { box: true, boxX: 1120, boxY: FL - 100, boxW: 280, boxH: 100, books: true });
    plLayer(.9, () => {
      const mood = emotions(t, [[0, 'sad'], [1.4, 'bored']]);
      plHim(t, 900, 30, mood, { view: 'q', lookY: .4, aL: -.6, aR: -.55, dy: .8 });
    });
    plCamEnd();
    plBevel(p);
    // 桌面（灯箱是放在一张桌子上的物件）
    paint(rectPts(CAV.x0 - 170, CAV.y1 + 74, CAVW + 340, 26), { wash: '#3b2a1e', ink: null });
    plEdge([[CAV.x0 - 170, CAV.y1 + 75], [CAV.x1 + 170, CAV.y1 + 75]], '#6b4c33', 1.6);
    paint(rectPts(CAV.x0 - 170, CAV.y1 + 100, CAVW + 340, 300), { wash: '#241812', ink: null });
    // 木框与外壳
    const fw = 40;
    paint(rectPts(CAV.x0 - fw - 12, CAV.y0 - fw - 12, CAVW + 2 * (fw + 12), 22), { wash: '#2a1a18', ink: null });
    paint(rectPts(CAV.x0 - fw - 12, CAV.y1 + fw + 26, CAVW + 2 * (fw + 12), 30), { wash: '#22160f', ink: null });
    paint(rectPts(CAV.x0 - fw - 12, CAV.y0 - fw, 22, CAVH + 2 * fw + 52), { wash: '#251713', ink: null });
    paint(rectPts(CAV.x1 + fw - 4, CAV.y0 - fw, 22, CAVH + 2 * fw + 52), { wash: '#1e120e', ink: null });
    plGlow(CX, CAV.y1 + 80, 300, p.light, .35 * k);
    pop();
  }

  // ---------- 镜 22 · 51.40–52.72 ·「我只是可惜」（现实世界：桌上的灯箱） ----------
  function s22(t, lt, dur) {
    const p = plPal(t);
    const drift = 14 * ease(lt / dur);
    paint(rectPts(-140, -140, W + 280, H + 280), { wash: '#0c0a10', ink: null });
    paint(rectPts(-100, 830, W + 200, 500), { wash: '#3a2a20', ink: null });
    paint(rectPts(-100, 830, W + 200, 12), { wash: '#4a352a', ink: null });
    for (let i = 0; i < 4; i++) plEdge([[-60, 880 + i * 50], [W + 60, 876 + i * 52]], mixCol('#3a2a20', '#7a5b41', .35), .8);

    push(); translate(drift, 0);
    const bx = 610, by = 210, bw = 700, bh = 600;
    plGlow(bx + bw / 2, by + bh / 2, 420, p.light, .55);
    paint(rectPts(bx - 26, by - 26, bw + 52, bh + 52), { wash: '#2a1a14', ink: null });
    paint(rectPts(bx - 10, by - 10, bw + 20, bh + 20), { wash: mixCol(p.front, p.light, .12), ink: null });
    // 箱内的画面：压小的房间
    push(); translate(bx + bw / 2, by + bh / 2); scale(.46); translate(-CX, -CY);
    plSky(p, { lightK: .9 }); plWall(p, { lightK: .8 }); plMids(p, { photos: false });
    plFloor(p, { box: true, boxX: 1120, boxY: FL - 100, boxW: 280, boxH: 100 });
    plGlow(900, FL - 90, 70, '#ff9a5a', .6);      // 透过纸看见的一个橙点：他还在里面
    pop();
    // 真的纸箱与贴在上面的照片
    paint(rectPts(bx + bw + 40, by + bh - 250, 330, 250), { wash: '#1a1512', ink: null });
    paint(rectPts(bx + bw + 30, by + bh - 268, 350, 26), { wash: '#241b16', ink: null });
    plPhoto(bx + bw + 110, by + bh - 380, 150, 116, p, { two: true, col: mixCol('#3a2a20', p.light, .2) });
    plEdge([[bx - 26, by + bh + 28], [bx + bw + 26, by + bh + 28]], '#5a4030', 1.6);
    pop();
    plGlow(960 + drift, 860, 430, p.light, .40);
  }

  // ---------- 镜 23 · 52.72–55.667 ·「不太够时间去拥抱你」（影子合上） ----------
  function s23(t, lt, dur) {
    const p0 = plPal(t);
    const dim = 1 - .30 * ease(seg(t, 55.30, 55.667));
    const p = dimP(p0, 1 - dim);
    plFrame(p);
    plCam(0, 6, 1.04 + .03 * ease(seg(t, 55.05, 55.667)));
    plSky(p, { lightK: dim });
    plWall(p, { lightK: dim });
    plMids(p, { photos: false });

    plFloor(p, { box: false, floorDust: true });
    // 后层：她的影子（人已经不在了，影子留着），以及他向影子落下去的影子
    const near = ease(seg(t, 53.84, 54.80)), meet = ease(seg(t, 54.80, 55.36));
    plLayer(.52, () => {
      const herX = 1230, himShX = lerp(700, 1210, near), ySh = FL - 116;
      plGlow(herX, ySh - 100, 210, p.accent, .40 * (1 - .35 * meet));
      clawd(herX, ySh, 26, { view: 'back', aL: .5, aR: -.5, col: mixCol(p.accent, p.mid, .30), dk: mixCol(p.accent, p.mid, .55), lt: mixCol(p.accent, '#ffffff', .30), noShadow: true, boilKey: 'shHer' });
      clawd(himShX, ySh, 26, { view: 'back', aL: -.5 + 1.5 * meet, aR: -.5 + 1.5 * meet, col: mixCol(p.front, p.mid, .42), dk: mixCol(p.front, p.mid, .32), lt: mixCol(p.mid, p.light, .10), noShadow: true, boilKey: 'shHim' });
      if (meet > .1) plGlow(lerp(himShX, herX, meet), ySh - 110, 90 + 40 * meet, p.light, .45 * meet);
    });
    // 他：站在前景，把手臂张开
    plLayer(.92, () => {
      const arms = ease(seg(t, 52.72, 53.30));
      const mood = emotions(t, [[0, 'cry'], [54.80, 'relieved'], [55.40, 'sad']], { take: .5 });
      plHim(t, 780, 30, mood, { view: 'front', lookX: .35, aL: -.4 + 1.35 * arms, aR: -.4 + 1.35 * arms });
    });
    plCamEnd();
    plBevel(p);
    if (t > 55.44) plGlow(CX, CAV.y1 - 160, 520, '#ffb862', .35 * ease(seg(t, 55.44, 55.62)));
    if (lt > dur - .16) veil(ease(seg(lt, dur - .16, dur)));
  }

  shots([
    [35.50, s13], [36.55, s14], [37.85, s15], [39.42, s16], [41.72, s17], [43.45, s18],
    [45.02, s19], [46.15, s20], [49.50, s21], [51.40, s22], [52.72, s23]
  ]);
})();
