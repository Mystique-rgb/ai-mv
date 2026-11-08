// act3.js —— 镜 09–16（27.50–41.72）· 紫 · 抽层 / 墙块掉落 / 围巾成框 / 纸点成灰
(() => {

  // 人形的洞：她那一层被抽走，纸上留下她的形状——洞口里是外面的夜空，纸的切边在发光。
  function personHole(p, x, y, u) {
    const sky = mixCol(p.sky, '#ffffff', .28);
    dgSilhouette(x, y, u * 1.09, mixCol(p.rim, p.light, .45), 210, .16);   // 一圈发光的纸厚
    dgSilhouette(x, y, u, sky, 255, .16);                                  // 洞里是夜空
    for (let i = 0; i < 4; i++) {
      const sx = x - u * 3 + hash(i * 3.3) * u * 6, sy = y - u * 2 - hash(i * 5.1) * u * 3.4;
      paint(rectPts(sx, sy, 2.2, 2.2), { wash: mixCol(p.light, '#ffffff', .75), ink: null });
    }
  }

  // ---------- 镜 09 · 27.50–29.68 ·「但怎么你离去」 ----------
  // 大时刻 B：她那一整片纸被抽走。27.50「但」启动；28.60「你」人形的洞；29.02「离」他抓空。
  function s09(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 9);
    const rise = easeIn(seg(t, 27.50, 28.62));
    const camUp = Math.sin(clamp(seg(t, 27.5, 28.9)) * Math.PI) * 300;
    dgShell(p, { glowK: .4 });
    dgCam(30 * rise, 300 - camUp, 1.24 + .16 * ease(seg(t, 28.4, 29.4)));
    dgSky(p, { k: lk });
    dgHills(p);
    dgWall(p, { k: lk });
    dgFloor(p, { poolK: lk * (1 - .6 * rise), rug: { x: 200, y: FTOP + 96, w: 520, h: 190 } });

    dgLayer(.70, () => { dgChair(p, 760, GY + 8); dgCrates(p, 150, 1604, { n: 2 }); });
    const sheetY = -rise * 1750;
    dgLayer(.56, () => {
      if (rise < .97) {
        const S = [[250, sheetY + 300], [830, sheetY + 300], [830, sheetY + 1660], [250, sheetY + 1660]];
        paint(S, { wash: mixCol(p.mid, p.light, .30), washOp: 70, ink: null });
        dgRim([[250, sheetY + 300], [830, sheetY + 300]], 2.4, mixCol(p.rim, p.light, .4));
        dgHer(p, 604, 26, .10, { view: 'front', lookY: -.1, y: sheetY + GY });
      }
    });
    const holeK = ease(seg(t, 28.58, 29.0));
    if (holeK > .01) dgLayer(.34, () => personHole(p, 604, GY - 20, 26 * holeK));
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'sad'], [27.5, 'surprised'], [27.9, 'scared'], [28.4, 'cry']]);
      const lunge = easeOut(seg(t, 28.9, 29.35));
      dgHim(330 + 96 * lunge, 26, mood, { view: 'q', dy: (mood.dy || 0) + .2, emote: null,
        aR: -.1 + 1.3 * lunge, aL: .5 + 1.0 * lunge, lookY: -.5, lookX: .6 });
      if (t > 29.0) {
        const g = ease(seg(t, 29.02, 29.4));
        inkLine([[426 + 96 * lunge, 1470], [470 + 96 * lunge, 1400 - 60 * g]], 3, mixCol(PAL.clayDk, p.front, .2), 'inkfine', .3);
      }
    });
    dgLayer(1, () => dgDust(p, 22, 29, { k: .4 }));
    dgCamEnd();
    dgSweep(Math.max(0, 1 - lt / .22), p, 'up', mixCol(p.front, p.mid, .6));
  }

  // ---------- 镜 10 · 29.68–31.58 ·「从我的世界里」 ----------
  // 完全固定：三拍掉三块墙，露出纯黑。他不是变小，是房间在少。
  function s10(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 10);
    dgShell(p, { glowK: .35 });
    dgCam(0, 60, 1.0);
    dgSky(dgDim(p, .45), { k: lk });
    dgHills(dgDim(p, .5));
    dgWall(p, { k: lk });
    dgFloor(dgDim(p, .15), { poolK: lk * .5 });
    const falls = [29.68, 30.54, 31.40];
    dgLayer(.62, () => falls.forEach((tf, i) => {
      if (t < tf) return;
      const k = easeIn(seg(t, tf, tf + .5));
      const x = [180, 480, 760][i], w = [300, 280, 260][i], y0 = 520 + i * 90;
      paint(rectPts(x - 6, y0 - 6, w + 12, 520 * k + 16), { wash: mixCol('#04030a', p.front, .4), ink: null });
      push(); translate(x + w / 2, y0 + 200); rotate(k * (i % 2 ? .5 : -.4)); translate(-(x + w / 2), -(y0 + 200));
      dgPaper(rectPts(x, y0 + 620 * k, w, 400, 1.4), mixCol(p.wallDk, p.wall, .5),
              { shadow: false, rim: [[x, y0 + 620 * k + 1], [x + w, y0 + 620 * k + 1]], rimCol: mixCol(p.rim, p.wall, .4), rimW: 2.4 });
      pop();
    }));
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'cry'], [30.6, 'sad'], [31.3, 'bored']]);
      dgHim(540, 24, mood, { view: 'front', dy: (mood.dy || 0) + 1.4, noLegs: true, emote: null, lookY: -.8, aL: -.5, aR: -.5 });
    });
    dgLayer(1, () => dgDust(dgDim(p, .4), 14, 31, { k: .3 }));
    dgCamEnd();
  }

  // ---------- 镜 11 · 31.58–32.55 ·「恍惚间」 ----------
  // 只剩一把椅子和搭在椅背上的粉围巾。失焦 → 合焦，正好一下。他不在画面里。
  function s11(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 11);
    const focus = Math.abs(ease(seg(t, 31.60, 32.20)) - .5) * 2;
    const hazeK = .55 * (1 - focus);
    dgShell(p, { glowK: .3 });
    dgCam(0, 300, 1.50 + .02 * Math.sin(lt * .6));
    dgEmpty(p, { k: .55, gx: 700, gy: 900 });
    dgLayer(.60, () => {
      dgChair(p, 380, GY + 10);
      dgScarf(p, 470, 1370, 1, Math.sin(T * 1.4) * .3);
      dgCrates(dgDim(p, .5), 700, 1640, { n: 1 });
    });
    if (hazeK > .01) {
      paint(rectPts(BOX.x0 - 40, BOX.y0 - 40, BW + 80, BH + 80), { wash: mixCol(p.mid, p.light, .35), washOp: 70 * hazeK, ink: null });
      glow(470, 1300, 300, p.light, .22 * hazeK);
    }
    dgCamEnd();
    dgVeil(Math.max(0, 1 - lt / .2) * .7);
  }

  // ---------- 镜 12 · 32.55–35.50 ·「我还是会想起」 ----------
  // 围巾被风吹成一条长纸带，在层与层之间穿行；每穿过一层，那层亮一张她的剪影。
  function s12(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 12);
    const trav = ease(seg(t, 32.55, 35.30));
    dgShell(p, { glowK: .3 });
    dgCam(60, 240 - 300 * trav, 1.30 + .10 * trav);
    dgEmpty(p, { k: .5 });
    [0, 1, 2].forEach(i => {
      const z = .2 + i * .18, off = trav * (60 + i * 40);
      dgLayer(z, () => {
        paint(rectPts(BOX.x0 + 20, BOX.y0 + 200 - off, BW - 40, 260), { wash: mixCol(p.mid, p.front, .55 + i * .08), ink: null });
        dgRim([[BOX.x0 + 20, BOX.y0 + 201 - off], [BOX.x1 - 20, BOX.y0 + 201 - off]], 1.6, mixCol(p.rim, p.mid, .25));
      });
    });
    [33.41, 34.27, 35.10].forEach((ta, i) => {
      const k = ease(seg(t, ta - .10, ta + .12)) * (1 - ease(seg(t, ta + .5, ta + .9)));
      if (k <= .01) return;
      dgLayer(.30 + i * .12, () => {
        glow(240 + i * 250, 980 - trav * (120 + i * 60), 240, p.accent, .26 * k);
        clawd(240 + i * 250, 1180 - trav * (120 + i * 60), 14, {
          ...feel('neutral', T, { view: 'front' }), col: mixCol(p.accent, p.mid, .25), dk: mixCol(p.accent, p.front, .55),
          lt: mixCol(p.accent, '#ffffff', .3), noShadow: true, boilKey: 'sil' + i,
        });
      });
    });
    const ribbonPts = [];
    for (let i = 0; i <= 8; i++) {
      const u = i / 8, yy = lerp(1660, 420, u) - trav * 200;
      ribbonPts.push([540 + Math.sin(u * 4.2 + t * 1.1) * 150 * (1 - u * .3), yy]);
    }
    dgLayer(.74, () => {
      dgPaper(ribbon(ribbonPts, 30, 14), mixCol(p.accent, p.mid, .25),
              { shadow: false, rim: ribbonPts, rimCol: mixCol(p.rim, p.accent, .5), rimW: 2.2 });
    });
    dgLayer(.88, () => {
      const mood = emotions(t, [[0, 'hopeful'], [34.4, 'hopeful']]);
      const px = 700 + Math.sin(t * .9) * 60;
      dgHim(px, 22, mood, { view: 'q', flip: true, dy: (mood.dy || 0) - 1.1, emote: null, aR: 1.0, lookY: -1, walk: t * 1.6 });
    });
    dgLayer(1, () => dgDust(p, 18, 37, { k: .35 }));
    dgCamEnd();
  }

  // ---------- 镜 13 · 35.50–36.55 ·「但回忆」 ----------
  // 纸带卷成一个圆圈（相框），圈里是空的；35.86 起有雾，36.22 雾里浮出一张照片。
  function s13(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 13);
    const coil = easeOut(seg(t, 35.50, 35.94));
    const z = 1.30 + .24 * ease(seg(t, 35.5, 36.4));
    dgShell(p, { glowK: .25 });
    dgCam(0, 110, z);
    dgEmpty(p, { k: .45, gx: 540, gy: 1120 });
    const R = lerp(180, 168, coil);
    const ring = [];
    for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; ring.push([540 + Math.cos(a) * R, 1120 + Math.sin(a) * R]); }
    dgLayer(.70, () => {
      const n = Math.max(3, Math.floor(27 * coil));
      const P = coil < .95 ? ribbon(ring.slice(0, n).concat([[ring[0][0], ring[0][1]]]), 46, 30) : ribbon(ring, 44, 46);
      dgPaper(P, mixCol(p.accent, p.mid, .28), { shadow: false, rim: P, rimCol: mixCol(p.rim, p.accent, .55), rimW: 2.4 });
      const mist = ease(seg(t, 35.86, 36.3));
      if (mist > .02) {
        paint(ellPts(540, 1120, R * .92 * mist, R * .92 * mist, 22), { wash: mixCol(p.light, p.mid, .45), washOp: 90 * mist, ink: null });
        glow(540, 1120, R * 1.1, p.light, .22 * mist);
      }
      const ph = ease(seg(t, 36.22, 36.55));
      if (ph > .02) {
        push(); translate(540, 1120); scale(.6 + .4 * ph); translate(-540, -1120);
        dgPhoto(p, 540 - 68, 1120 - 74, 136, 148, { tint: 0 });
        pop();
      }
    });
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'sad']]);
      dgHim(250, 20, mood, { view: 'q', dy: (mood.dy || 0) + 1.5, noLegs: true, emote: null, lookY: -.6, lookX: .4 });
    });
    dgCamEnd();
  }

  // ---------- 镜 14 · 36.55–37.85 ·「但回忆」 ----------
  // 同一个圈再收紧 18%；照片浮出来，但照片上两个人中间已经有了一道裂缝 → 照片炸开。
  function s14(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 14);
    const tight = ease(seg(t, 36.55, 37.0));
    const crackK = ease(seg(t, 37.38, 37.55));
    const boom = easeIn(seg(t, 37.62, 37.85));
    const z = 1.54 + .10 * tight + .28 * boom;
    dgShell(p, { glowK: .25 });
    dgCam(0, 110, z);
    dgEmpty(p, { k: .45, gx: 540, gy: 1120 });
    const R = 168 * (1 - .18 * tight);
    const ring = [];
    for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; ring.push([540 + Math.cos(a) * R, 1120 + Math.sin(a) * R]); }
    dgLayer(.70, () => {
      dgPaper(ribbon(ring, 46, 46), mixCol(p.accent, p.mid, .26), { shadow: false, rim: ring, rimCol: mixCol(p.rim, p.accent, .55), rimW: 2.4 });
      paint(ellPts(540, 1120, R * .94, R * .94, 22), { wash: mixCol(p.light, p.mid, .5), washOp: 70, ink: null });
      const ph = ease(seg(t, 36.62, 37.0));
      if (boom < .98) {
        push(); translate(540, 1120); rotate(.02 * Math.sin(T * 2)); const sc = (.8 + .2 * ph) * (1 + .5 * boom); scale(sc); translate(-540, -1120);
        dgPhoto(p, 540 - 70, 1120 - 76, 140, 152, { tint: 0, crack: crackK > .4 });
        if (crackK > .01) inkLine([[540, 1120 - 56], [540 - 6, 1120 - 2], [540 + 6, 1120 + 64]], 2.6 * crackK, mixCol(p.front, p.light, .3), 'inkfine', .4);
        pop();
      }
      if (boom > .01) {
        for (let i = 0; i < 26; i++) {
          const a = hash(i * 3.1) * TAU, sp = 260 + hash(i * 7.7) * 520;
          const x = 540 + Math.cos(a) * sp * boom, y = 1120 + Math.sin(a) * sp * boom + 120 * boom * boom;
          dgBit(x, y, 8 + hash(i * 2.3) * 12, i % 3 ? mixCol(p.mid, p.light, .4) : p.accent, a + boom * 3);
        }
      }
    });
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'sad'], [37.3, 'cry']]);
      dgHim(250, 20, mood, { view: 'q', dy: (mood.dy || 0) + 1.5, noLegs: true, emote: null, lookY: -.5, aL: .5, aR: .6 });
    });
    dgCamEnd();
    if (lt > dur - .14) dgVeil(ease(seg(lt, dur - .14, dur)) * .5);
  }

  // ---------- 镜 15 · 37.85–39.42 ·「珍贵的点点滴滴」 ----------
  // 照片碎成几十个纸点，飘满整个箱体，像雪；镜头从下往上 tilt，纸点从顶部飘出。
  function s15(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 15);
    const up = ease(seg(t, 37.85, 39.3));
    dgShell(p, { glowK: .25 });
    dgCam(0, 320 - 420 * up, 1.16 + .06 * up);
    dgEmpty(p, { k: .5, gx: 540, gy: 900 });
    dgLayer(1.02, () => {
      for (let i = 0; i < 6; i++) {
        const x = BOX.x0 + 80 + hash(i * 5.5) * (BW - 160), y = lerp(BOX.y1, BOX.y0 - 200, frac(hash(i * 2.1) + t * .09));
        glow(x, y, 90 + hash(i) * 60, p.light, .18);
        dgBit(x, y, 26 + hash(i * 3) * 26, mixCol(p.rim, '#ffffff', .4), T * .6 + i, { op: 110 });
      }
    });
    const burst = easeOut(seg(t, 37.85, 38.96));
    dgLayer(.66, () => {
      for (let i = 0; i < 120; i++) {
        const a = hash(i * 1.7) * TAU, r0 = hash(i * 3.9) * 60;
        const sp = (200 + hash(i * 9.1) * 620) * burst;
        const drift = Math.sin(t * .8 + i) * 26;
        const x = 540 + Math.cos(a) * (r0 + sp) + drift;
        const y = 1120 + Math.sin(a) * (r0 + sp) * .8 - (t - 37.85) * 150 - i * .6;
        if (y < BOX.y0 - 60) continue;
        dgBit(x, y, 13 + hash(i * 4.4) * 26, i % 4 === 0 ? p.accent : mixCol(p.mid, p.light, .35 + hash(i) * .3), a + t * 1.4);
      }
    });
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'sad'], [38.6, 'sad']]);
      dgHim(560, 24, mood, { view: 'front', dy: (mood.dy || 0) + .1, emote: null, aL: 1.0, aR: .9, lookY: -.4 });
    });
    dgCamEnd();
    dgSweep(Math.max(0, 1 - lt / .2), p, 'down', mixCol(p.front, p.mid, .55));
  }

  // ---------- 镜 16 · 39.42–41.72 ·「再没什么意义」 ----------
  // 纸点同时失去颜色 → 一起落下 → 地上堆成一小堆灰。镜头拉远，他跪着，bored。
  function s16(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 16);
    const grey = ease(seg(t, 39.42, 40.02));
    const fall = easeIn(seg(t, 40.28, 41.45));
    const out = ease(seg(t, 39.6, 41.6));
    dgShell(p, { glowK: .22 * (1 - out * .5) });
    dgCam(0, lerp(200, 20, out), lerp(1.42, 1.02, out));
    dgEmpty(p, { k: .5 * (1 - out * .4), gx: 540, gy: 1000 });
    dgLayer(.70, () => {
      const pile = clamp(fall);
      if (pile > .01) {
        const h = 34 * pile;
        dgPaper([[380, GY + 20], [440, GY + 20 - h], [540, GY + 16 - h * 1.2], [640, GY + 20 - h * .9], [700, GY + 20]],
                mixCol(p.floor, '#ffffff', .30), { shadow: false, rim: [[440, GY + 20 - h], [540, GY + 16 - h]], rimCol: mixCol(p.rim, p.mid, .3), rimW: 1.4 });
      }
    });
    dgLayer(.68, () => {
      for (let i = 0; i < 62; i++) {
        const a = hash(i * 1.7) * TAU;
        const sp = (200 + hash(i * 9.1) * 620);
        const x = 540 + Math.cos(a) * sp * .9;
        const y0 = 1120 + Math.sin(a) * sp * .7;
        const y = lerp(y0, GY + 10, fall) + Math.sin(t * 1.2 + i) * (1 - fall) * 10;
        if (y > GY + 30) continue;
        const col = mixCol(mixCol(p.mid, p.light, .4), '#8d8b96', grey);
        dgBit(x, y, (10 + hash(i * 4.4) * 18) * (1 - .3 * fall), mixCol(col, '#9a97a2', grey * .9), a + t * 1.2);
      }
    });
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'sad'], [40.4, 'bored'], [41.4, 'bored']]);
      dgHim(560, 23, mood, { view: 'q', dy: (mood.dy || 0) + 1.5, noLegs: true, emote: null, lookY: .8, aL: -.85, aR: -.85 });
      dgKneel(560, 1590, 23, dgDimCol(PAL.clayDk, .25));
    });
    dgCamEnd();
  }

  shots([[27.50, s09], [29.68, s10], [31.58, s11], [32.55, s12], [35.50, s13], [36.55, s14], [37.85, s15], [39.42, s16]]);
})();
