// act2.js —— 镜 05–08（14.15–27.50）· 回忆金 · 照片 / 抓空 / 穿四层纸推到她面前
(() => {

  const SHOTS_PHOTOS = [
    { x: 470, y: 1252, w: 150, h: 164 },
    { x: 620, y: 1240, w: 142, h: 156 },
    { x: 452, y: 1104, w: 146, h: 160 },
    { x: 606, y: 1092, w: 138, h: 150 },
    { x: 760, y: 1216, w: 132, h: 144 },
  ];

  // ---------- 镜 05 · 14.15–17.18 ·「细数着我们的过往」 ----------
  // 读：色阶切金，他拉开抽屉 → 每拍一张照片沿单轴展开 → 照片里都是两个小人。
  function s05(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 5);
    const z = 1.72 + .14 * ease(lt / dur);
    dgShell(p, { glowK: .55 });
    dgCam(-40 + 16 * ease(lt / dur), 400 + 24 * ease(lt / dur), z);
    dgSky(p, { k: lk, cloudY: 640 });
    dgHills(p);
    dgWall(p, { k: lk });
    dgLayer(.46, () => { dgLamp(p, 610, 372, { k: .95 * lk }); dgRail(p, 700, 962, 236, { n: 3 }); });
    dgFloor(p, { poolK: lk, rug: { x: 200, y: FTOP + 96, w: 520, h: 190 } });
    dgLayer(.70, () => {
      dgDresser(p, 138, 1392, 232, 236);
      const dx = 400, dy = 1430, dw = 540, dh = 150;
      paint(rectPts(dx, dy, dw, dh), { wash: mixCol(p.mid, p.light, .10), ink: null });
      paint(rectPts(dx + 16, dy + 12, dw - 32, dh - 26), { wash: mixCol(p.front, '#000000', .12), ink: null });
      dgPaper(rectPts(dx - 18, dy + dh - 4, dw + 36, 30), mixCol(p.mid, p.light, .40),
              { rim: [[dx - 18, dy + dh - 3], [dx + dw + 18, dy + dh - 3]], rimCol: mixCol(p.rim, p.mid, .7), rimW: 3 });
      dgPaper(rectPts(dx - 18, dy - 10, dw + 36, 18), mixCol(p.mid, p.light, .22),
              { rim: [[dx - 18, dy - 9], [dx + dw + 18, dy - 9]], rimCol: mixCol(p.rim, p.mid, .5), rimW: 2 });
      // 抽屉里摞着的照片边（还没展开的那些）
      for (let i = 0; i < 3; i++) dgPaper(rectPts(dx + 40 + i * 150, dy + 18, 132, 96, .8), mixCol(p.mid, p.light, .30 - i * .04),
              { shadow: false, rim: [[dx + 40 + i * 150, dy + 19], [dx + 172 + i * 150, dy + 19]], rimCol: mixCol(p.rim, p.mid, .45), rimW: 1.6, sk: .4 });
    });
    const openAt = [14.35, 15.22, 16.08, 16.94];
    dgLayer(.76, () => SHOTS_PHOTOS.forEach((ph, i) => {
      const ta = openAt[i] == null ? 99 : openAt[i];
      if (t < ta - .02) return;
      const k = backOut(seg(t, ta, ta + .34));
      push(); translate(ph.x + ph.w / 2, ph.y + ph.h); rotate((hash(i * 3.3) - .5) * .14 + Math.sin(T * 1.4 + i) * .02);
      scale(1, k); translate(-(ph.x + ph.w / 2), -(ph.y + ph.h));
      dgPhoto(p, ph.x, ph.y - (1 - (k < 0 ? 0 : k)) * 20, ph.w, ph.h, { tint: i * .04 });
      pop();
    }));
    dgLayer(.80, () => {
      const mood = emotions(t, [[0, 'thinking'], [15.2, 'sad'], [16.6, 'sad']]);
      const reach = .35 + .5 * Math.sin(bpOf(t) * Math.PI);
      dgKneel(392, 1500, 24, mixCol(PAL.clayDk, p.front, .3));
      dgHim(392, 24, mood, { view: 'q', dy: (mood.dy || 0) + 1.5, noLegs: true, emote: null, y: 1494,
        aR: reach, aL: -.2 + .15 * Math.sin(bpOf(t) * 2), lookY: .3, lookX: .6 });
    });
    dgLayer(1, () => dgDust(p, 28, 13, { k: .55 }));
    dgCamEnd();
    dgSweep(Math.max(0, 1 - lt / .26), p, 'up', mixCol(p.front, p.mid, .55));
  }

  // ---------- 镜 06 · 17.18–19.50 ·「想到又迷惘」 ----------
  // 读：照片全部飞起来 → 他伸手去抓，抓到的是空白纸 → 19.10「惘」纸边烧焦卷起 → 烧穿的洞做 iris。
  function s06(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 6);
    const tilt = ease(seg(t, 17.18, 18.5));
    const z = 1.52 - .10 * tilt;
    dgShell(p, { glowK: .5 });
    dgCam(-30 + 26 * tilt, lerp(330, 250, tilt), z);
    dgSky(p, { k: lk, cloudY: 660 });
    dgHills(p);
    dgWall(p, { k: lk });
    dgLayer(.46, () => { dgLamp(p, 610, 372, { k: .95 * lk }); dgRail(p, 700, 962, 236, { n: 3 }); });
    dgFloor(p, { poolK: lk, rug: { x: 200, y: FTOP + 96, w: 520, h: 190 } });
    dgLayer(.70, () => {
      dgDresser(p, 138, 1392, 232, 236);
      dgCrates(p, 150, 1604, { n: 2 });
      dgChair(p, 812, GY + 8);
    });
    dgLayer(.78, () => SHOTS_PHOTOS.forEach((ph, i) => {
      const ta = 17.18 + i * .28;
      if (t < ta) return;
      const k = ease(seg(t, ta, ta + 1.1));
      const x = ph.x + Math.sin(T * .9 + i) * 24 * k + (i - 2) * 26 * k;
      const y = ph.y - 120 * k - i * 34 * k + Math.sin(T * 1.3 + i * 1.7) * 12 * k;
      push(); translate(x + ph.w / 2, y + ph.h / 2); rotate((hash(i * 5.1) - .5) * 1.2 * k); translate(-(x + ph.w / 2), -(y + ph.h / 2));
      dgPhoto(p, x, y, ph.w, ph.h, { tint: i * .05 });
      pop();
    }));
    const grabT = 17.9, curlK = ease(seg(t, 19.10, 19.5));
    dgLayer(.84, () => {
      const k = ease(seg(t, grabT, grabT + .5));
      const bx = lerp(470, 520, k), by = lerp(1180, 1010, k) + Math.sin(T * 1.6) * 6;
      push(); translate(bx + 70, by); rotate(-.18 + .3 * curlK); translate(-(bx + 70), -by);
      dgPhoto(p, bx, by, 140, 156, { empty: true });
      if (curlK > .01) {
        paint([[bx + 140, by + 10], [bx + 140 - 30 * curlK, by + 60], [bx + 140 - 14 * curlK, by + 110], [bx + 140, by + 156]], { wash: mixCol(p.front, '#000000', .3), ink: null });
        dgPaper([[bx + 140 - 26 * curlK, by + 20], [bx + 140, by + 10], [bx + 140 - 10 * curlK, by + 70]], mixCol(p.mid, p.light, .3), { shadow: false, sk: .4 });
        glow(bx + 130, by + 80, 70 * curlK, p.light, .35 * curlK);
      }
      pop();
    });
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'confused'], [17.86, 'surprised'], [18.9, 'confused'], [19.2, 'sad']]);
      const reach = ease(seg(t, 17.8, 18.2));
      dgKneel(392, 1500, 24, mixCol(PAL.clayDk, p.front, .3));
      dgHim(392, 24, mood, { view: 'q', dy: (mood.dy || 0) + 1.2, sq: (mood.sq || 0) - .08 * reach, noLegs: true, emote: null, y: 1494,
        aR: .4 + 1.1 * reach, aL: -.3 - .2 * reach, lookY: -.8 * reach, lookX: .5 });
    });
    dgLayer(1, () => dgDust(p, 26, 17, { k: .5 }));
    dgCamEnd();
    if (lt > dur - .5) {
      const [sx, sy] = toScreen(590, 1060, LAST_CAM);
      iris(sx, sy, lerp(1300, 10, ease(seg(lt, dur - .5, dur))), p.front);
    }
  }

  // ---------- 镜 07 · 19.50–24.30 ·「你曾是我心中唯一的信仰」 ----------
  // 一个不间断的长运镜：穿过四层纸推到她面前。20.84「唯」轮廓亮起；24.32「仰」光最亮。
  function s07(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 7);
    const k = ease(seg(t, 19.5, 24.2));
    const z = lerp(.96, 1.46, k);
    const cx = lerp(0, 64, ease(seg(t, 19.6, 22.4))), cy = lerp(10, 470, ease(seg(t, 19.6, 23.2)));
    dgShell(p, { glowK: .5 });
    dgCam(cx, cy, z);
    dgSky(p, { k: lk });
    dgHills(p);
    dgWall(p, { k: lk });
    dgFloor(p, { poolK: lk, rug: { x: 200, y: FTOP + 96, w: 520, h: 190 } });
    dgLayer(.70, () => { dgDresser(p, 138, 1392, 232, 236); dgCrates(p, 150, 1604, { n: 2 }); });
    if (z < 1.22) dgLayer(.80, () => {
      const mood = emotions(t, [[0, 'hopeful'], [22.5, 'hopeful']]);
      const push = (z - .96) * 620;
      dgHim(372 - push, 26, mood, { view: 'q', dy: (mood.dy || 0) + .2, emote: null, aL: -.2, aR: .55, lookY: -.2 });
    });
    if (z < 1.9) dgLayer(.66, () => { dgChair(p, 210 - (z - .96) * 420, GY + 8); dgCrates(p, 150 - (z - .96) * 300, 1604, { n: 2 }); });
    const herU = lerp(15, 26, ease(seg(t, 20.2, 23.6)));
    const lit = .35 + .65 * ease(seg(t, 20.84, 21.3));
    dgLayer(.52, () => {
      const lx = 690, ly = 1176;
      inkLine([[lx, FTOP], [lx, ly + 20]], 2.4, mixCol(p.mid, p.front, .4), 'inkfine', .2);
      glow(lx, ly, 250 * lit + 60, p.light, .34 * lit);
      glow(lx, ly, 110, p.light, .42 * lit);
      dgPaper(rectPts(lx - 14, ly - 18, 28, 40, .6), mixCol(p.light, '#ffffff', .5), { shadow: false,
              rim: [[lx - 14, ly - 17], [lx + 14, ly - 17]], rimCol: '#fff6e0', rimW: 1.6 });
      dgPaper(rectPts(lx - 34, ly + 22, 68, 14, .6), mixCol(p.mid, p.front, .2), { shadow: false });
      dgHer(p, 604, herU, .10 + .55 * ease(seg(t, 24.0, 24.4)), { view: 'front', lookY: -.1, aL: -.1, aR: .12 });
      dgWallArt(p, [{ x: 800, y: 880, w: 104, h: 120 }]);
    });
    const peak = ease(seg(t, 24.24, 24.44)) * (1 - ease(seg(t, 24.6, 25.1)));
    if (peak > .01) glow(604, 1240, 460, p.light, .30 * peak);
    dgLayer(1, () => dgDust(p, 24, 19, { k: .45 }));
    dgCamEnd();
  }

  // ---------- 镜 08 · 24.30–27.50 ·「（拖腔）」 ----------
  // 读：灯闪两下 → 她越来越透 → 他把手贴在前景的纸上 → 27.50 一刀切。
  function s08(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 8);
    const f1 = t > 25.4 ? .35 * pulse(t - 25.48, 7) : 0, f2 = t > 25.98 ? .30 * pulse(t - 26.04, 7) : 0;
    const flick2 = 1 - f1 - f2;
    const fade = .10 + .62 * ease(seg(t, 24.9, 27.3));
    dgShell(p, { glowK: .45 });
    dgCam(64, 470, 1.46 + .02 * Math.sin(lt * .5));
    dgSky(p, { k: lk });
    dgHills(p);
    dgWall(p, { k: lk });
    dgFloor(p, { poolK: lk, rug: { x: 200, y: FTOP + 96, w: 520, h: 190 } });
    dgLayer(.70, () => { dgDresser(p, 138, 1392, 232, 236); dgCrates(p, 150, 1604, { n: 2 }); });
    dgLayer(.52, () => {
      const lx = 730, ly = 1120;
      inkLine([[lx, FTOP], [lx, ly + 20]], 2.4, mixCol(p.mid, p.front, .4), 'inkfine', .2);
      glow(lx, ly, 210 * flick2, p.light, .34 * flick2);
      glow(lx, ly, 96, p.light, .40 * flick2);
      dgPaper(rectPts(lx - 14, ly - 18, 28, 40, .6), mixCol(p.light, '#ffffff', .5 * flick2), { shadow: false });
      dgHer(p, 706, 26, fade, { view: 'q', flip: true, lookY: -.1, lookX: -.4 });
    });
    dgLayer(.90, () => {   // 夹在他们中间的那张透明纸：一条被灯打亮的边
      const k = ease(seg(t, 26.2, 26.9));
      paint(rectPts(560, 980, 44, 620), { wash: mixCol(p.light, p.mid, .55), washOp: 22 + 26 * k, ink: null });
      dgRim([[560, 980], [560, 1600]], 2.2, mixCol(p.rim, p.light, .35 + .3 * k));
      glow(580, 1290, 200, p.light, .10 + .12 * k);
    });
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'sad'], [25.8, 'sad'], [27.1, 'sad']]);
      dgHim(400, 26, mood, { view: 'q', dy: (mood.dy || 0) + 1.1, noLegs: true, emote: null, y: 1500, aL: .9, aR: 1.2, lookY: -.7 });
      // 两滴纸做的眼泪：一小片，落下才换一次位置
      if (t > 25.2) {
        const drop = frac(t * .55);
        [0, 1].forEach(i => {
          const dx = 400 + (i ? 44 : -54) + Math.sin(T + i) * 2, dy = 1500 - 26 * 5.4 + drop * 52;
          paint(ellPts(dx, dy, 5, 8, 10), { wash: mixCol(p.light, '#ffffff', .55), ink: null });
        });
      }
    });
    dgLayer(1, () => dgDust(p, 20, 23, { k: .4 }));
    dgCamEnd();
    dgVeil(Math.max(0, 1 - lt / .2) * .6);
  }

  shots([[14.15, s05], [17.18, s06], [19.50, s07], [24.30, s08]]);
})();
