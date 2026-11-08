// song_a.js —— 《爱怎么了》纸雕灯影 MV · 镜 01–12（0.00–35.50s）· 横屏 1920×1080
(() => {
  const DIM = '#05040a';
  const dimP = (p, k) => { const o = {}; for (const key in p) o[key] = mixCol(p[key], DIM, k); return o; };
  const KNEEL = { sq: .20, dy: .5 };   // 蹲下：压扁一点，腿还在（纸片小人只转不弯）

  // 墙上那张"两个人"的相片纸：两个小剪影并排站在纸上（全片第一次出现"两个人"）
  function duoSheet(p, x, y, w, h, o = {}) {
    const gap = o.gap || 0, tilt = o.tilt || 0;
    const frame = mixCol(p.far, p.light, .30);        // 相纸的边框
    const inner = mixCol(p.far, p.light, .10);        // 相片里那一点点光
    const sil = mixCol(p.front, p.mid, .28);          // 人：纸上的深色剪影
    push(); translate(x + w / 2, y + h / 2); rotate(tilt); translate(-(x + w / 2), -(y + h / 2));
    for (const side of [-1, 1]) {
      const bx = side < 0 ? x - gap : x + w / 2 + 2 + gap;
      paint(rectPts(bx, y, w / 2 - 2, h), { wash: frame, ink: mixCol(p.rim, frame, .45), sw: .8 });
      paint(rectPts(bx + 16, y + 16, w / 2 - 34, h - 32), { wash: inner, ink: null });
    }
    plEdge([[x - gap + 18, y + h * .78], [x + w / 2 + gap - 18, y + h * .78]], mixCol(p.front, p.mid, .4), 1);
    plEdge([[x + w / 2 + 20 + gap, y + h * .78], [x + w + gap - 18, y + h * .78]], mixCol(p.front, p.mid, .4), 1);
    clawd(x + w * .26 - gap, y + h * .78, h * .040, { view: 'q', col: sil, dk: mixCol(sil, p.front, .3), lt: mixCol(sil, p.light, .12), aL: -.15, aR: .35, noShadow: true, boilKey: 'duoA' });
    clawd(x + w * .72 + gap, y + h * .78, h * .036, { view: 'front', col: mixCol(sil, p.accent, .22), dk: mixCol(sil, p.accent, .12), lt: mixCol(sil, p.light, .14), aL: .2, aR: -.2, noShadow: true, boilKey: 'duoB' });
    pop();
  }

  // 一片薄纸衣服（折好的衣 / 展开的纸片）
  function cloth(x, y, w, h, col, rot = 0) {
    push(); translate(x, y); rotate(rot);
    paint(rectPts(-w / 2, -h / 2, w, h, .5), { wash: col, ink: mixCol(col, '#000', .25), sw: .5 });
    pop();
  }

  // ---------- 镜 01 · 0.00–3.62 ·「收拾了行李 整理着包裹」 ----------
  function s01(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    const lk = 1 + .05 * Math.sin(bpos(t) * Math.PI * 2);
    plCam(-10 + 6 * Math.sin(lt * .55), 4, 1.03 + .10 * ease(lt / dur));
    plSky(p, { lightK: lk });
    plWall(p, { lightK: lk });
    plMids(p, { photos: true, photoN: 2, shelf: true });
    plFloor(p, { box: true, boxX: 1120, boxY: FL - 104, boxW: 330, boxH: 104, books: true, floorDust: true });

    // 每拍一件衣物：从他手里落到箱口（落定有 0.08s 回弹）
    const drops = [0.24, 1.10, 1.96, 2.82];
    drops.forEach((tk, i) => {
      if (t < tk) return;
      const k = ease(seg(t, tk, tk + .30)), rb = 1 + .05 * Math.exp(-9 * (t - tk - .30)) * Math.sin(26 * (t - tk - .30));
      const x = lerp(980 - i * 6, 1240 + (i - 1.5) * 30, k), y = lerp(690, FL - 120 - i * 8, k);
      cloth(x, y, 66 * rb, 46 * rb, mixCol(p.far, p.light, .30 + i * .05), (hash(i * 3) - .5) * .5 + k * .2);
    });

    plLayer(.9, () => {
      const mood = emotions(t, [[0, 'sad'], [2.05, 'bored'], [3.05, 'sad']]);
      plHim(t, 878, 25, mood, { view: 'q', aL: -.5 + .3 * Math.sin(bpos(t) * Math.PI * 2), aR: -.15, ...KNEEL });
    });
    plFront(p);
    plCamEnd();
    plBevel(p);
    dipIn(lt, .34);
  }

  // ---------- 镜 02 · 3.62–7.58 ·「从形影不离到轻易的割舍」 ----------
  const S2 = { x: 1112, y: 236, w: 420, h: 300 };
  function s02(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    const cutT = 6.40, knifeT = 6.08;
    const zoomToSheet = ease(seg(t, 6.24, 6.62));
    const zA = 1.16 - .16 * ease(seg(t, 0, 2.3));
    const z = lerp(zA, 1.62, zoomToSheet);
    const cx = lerp(0, S2.x + S2.w / 2 - CX, zoomToSheet), cy = lerp(4, S2.y + S2.h / 2 - CY + 96, zoomToSheet);
    plCam(cx, cy, z);
    plSky(p, { lightK: 1 });
    plWall(p, { lightK: 1 });
    plMids(p, { photos: false, shelf: false });

    const gap = 34 * ease(seg(t, cutT, cutT + .34));
    if (gap > .5) {
      paint(rectPts(S2.x + S2.w / 2 - gap - 3, S2.y - 2, gap * 2 + 6, S2.h + 4), { wash: mixCol(p.sky, '#fff', .25), ink: null });
      plGlow(S2.x + S2.w / 2, S2.y + S2.h * .5, 110 + gap * 3, p.light, .5);
    }
    duoSheet(p, S2.x, S2.y, S2.w, S2.h, { gap, tilt: -.02 });

    // 纸刀：从画面上方落下，落在「割」那一拍
    const kd = ease(seg(t, 5.72, knifeT));
    const ky = lerp(S2.y - 430, S2.y + S2.h * .5, kd);
    if (t < cutT + .12) {
      push(); translate(S2.x + S2.w / 2 + 8, ky); rotate(.05);
      paint([[-16, -560], [16, -560], [10, -40], [0, 26], [-10, -40]], { wash: mixCol('#EFE6D6', p.light, .30), ink: mixCol(p.front, p.mid, .35), sw: 1.2 });
      paint([[-16, -560], [-6, -560], [-4, -40], [-10, -40]], { wash: mixCol('#FFF6E6', p.light, .12), ink: null });
      paint([[0, 26], [10, -40], [4, -40]], { wash: mixCol('#FFF6E6', '#fff', .2), ink: null });
      plGlow(0, -60, 90, p.light, .25);
      pop();
    }
    if (t > knifeT - .1 && t < knifeT + .3) {
      const a = 1 - seg(t, knifeT, knifeT + .3);
      plEdge([[S2.x + 40, S2.y + S2.h * .5 + 6], [S2.x + S2.w - 40, S2.y + S2.h * .5 + 6]], mixCol(p.front, p.light, .3 + .5 * a), 2);
    }

    plFloor(p, { box: true, boxX: 1200, boxY: FL - 104, boxW: 320, boxH: 104 });
    plLayer(.9, () => {
      const mood = emotions(t, [[0, 'sad'], [5.15, 'surprised'], [knifeT - .02, 'scared'], [6.9, 'sad']]);
      plHim(t, 800, 26, mood, { view: 'q', aL: -.3 - .4 * kd, aR: -.1, ...KNEEL });
    });
    plFront(p);
    plCamEnd();
    plBevel(p);
  }

  // ---------- 镜 03 · 7.58–10.46 ·「或者说 我们的爱怎么了」 ----------
  function s03(t, lt, dur) {
    const p = plPal(t);
    const dim = 1 - .35 * ease(seg(t, 9.95, 10.35));        // 「么」灯暗一档
    const q = dimP(p, 1 - dim);
    plFrame(q);
    plCam(0, -6 + 5 * Math.sin(lt * .5), 1.10 + .05 * ease(lt / dur));
    plSky(q, { lightK: dim });
    plWall(q, { lightK: dim });
    plMids(q, { photos: false, shelf: false });

    // 裂开的两半纸浮在中间层，缝里是夜空
    const gap = 30 + 10 * Math.sin(lt * 1.1);
    plLayer(.52, () => {
      duoSheet(q, S2.x - 30, S2.y - 20, S2.w + 60, S2.h + 40, { gap, tilt: -.012 });
      plGlow(S2.x + S2.w / 2, S2.y + S2.h * .5, 90, q.light, .30 * dim);
    });
    plFloor(q, { box: true, boxX: 1180, boxY: FL - 104, boxW: 320, boxH: 104 });

    plLayer(.86, () => {
      const mood = emotions(t, [[0, 'confused'], [2.1, 'sad']]);
      plHim(t, 620, 24, mood, { view: 'q', lookX: .6, aL: -.2, aR: -.15, ...KNEEL });
    });
    plLayer(.82, () => {
      plHer(t, 1520, 23, q, .18, { view: 'front', lookX: -.5 });
    });
    plFront(q);
    plCamEnd();
    plBevel(q);
  }

  // ---------- 镜 04 · 10.46–13.92 ·「（器乐，全片唯一停工）」 ----------
  function s04(t, lt, dur) {
    const p0 = plPal(t);
    const dim = .62 + .28 * (1 - ease(seg(t, 10.5, 13.6)));
    const p = dimP(p0, 1 - dim);
    plFrame(p);
    const trem = .45 + .55 * Math.exp(-seg(t, 10.46, 11.2));
    plCam(Math.sin(lt * .7) * trem, Math.cos(lt * .9) * trem * .6, 1.08);
    plSky(p, { lightK: .55 });
    plWall(p, { lightK: dim * .9 });
    plMids(p, { photos: false, shelf: true });
    plFloor(p, { box: true, boxX: 1120, boxY: FL - 104, boxW: 320, boxH: 104 });
    plLayer(.9, () => {
      const mood = emotions(t, [[0, 'bored'], [11.5, 'sad']]);
      plHim(t, 878, 25, mood, { view: 'q', aL: -.45, aR: -.12, ...KNEEL });
    });
    plFront(p);
    plCamEnd();
    plGlow(WIN.x + WIN.w / 2, WIN.y + WIN.h * .5, 260, p0.light, .55 * (1 - dim * .6));
    plBevel(p);
  }

  // ---------- 镜 05 · 13.92–17.18 ·「细数着我们的过往」 ----------
  function s05(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    plCam(-20, 20 + 10 * ease(lt / dur), 1.14 + .08 * ease(lt / dur));
    plSky(p, { lightK: 1.1 });
    plWall(p, { lightK: 1.1 });
    plMids(p, { photos: false, shelf: true });

    // 拉开的抽屉（俯看）：一个梯形 + 里面一叠照片
    plLayer(.66, () => {
      const dx0 = 360, dy0 = 430, dx1 = 1560, dy1 = 860;
      paint([[dx0, dy0 + 50], [dx1, dy0 + 50], [dx1 - 90, dy1], [dx0 + 90, dy1]], { wash: mixCol(p.near, p.front, .2), ink: null });
      paint([[dx0, dy0], [dx1, dy0], [dx1, dy1 - 50], [dx0, dy1 - 50]], { wash: mixCol(p.mid, p.front, .45), ink: null });
      inkLine([[dx0, dy0 + 52], [dx1, dy0 + 52]], mixCol(p.rim, p.mid, .5), 1.6);
      const times = [14.35, 15.22, 16.08, 16.94];
      times.forEach((tk, i) => {
        const k = ease(seg(t, tk, tk + .26)); if (k <= .01) return;
        const px = 560 + (i % 2) * 760 + (i % 2 ? 40 : 0), py = 520 + Math.floor(i / 2) * 180;
        const w = 230 * k, dir = i % 2 ? -1 : 1;
        push(); translate(px + (1 - k) * 120 * dir, py); rotate((hash(i + 2) - .5) * .12 + (1 - k) * .1 * dir);
        plPhoto(-w / 2, 0, w, 156, p, { two: true, col: mixCol(p.mid, p.light, .18) });
        pop();
      });
    });
    plLayer(.9, () => {
      const mood = emotions(t, [[0, 'thinking'], [15.6, 'sad'], [16.9, 'sad']]);
      plHim(t, 700, 26, mood, { view: 'q', aL: -.55, aR: -.9 + .3 * Math.sin(bpos(t) * Math.PI * 2), ...KNEEL });
    });
    plCamEnd();
    plBevel(p);
  }

  // ---------- 镜 06 · 17.18–19.50 ·「想到又迷惘」 ----------
  function s06(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    const tilt = ease(seg(t, 17.18, 18.5));
    plCam(0, lerp(50, -80, tilt), 1.16 + .05 * tilt);
    plSky(p, { lightK: 1.1 });
    plWall(p, { lightK: 1.1 });
    plMids(p, { photos: false, shelf: true });
    plFloor(p, { box: false });
    plLayer(.6, () => {
      paperField(6, 3, (i, r1, r2) => {
        const t0 = 17.18 + i * .17, k = ease(seg(t, t0, t0 + .8));
        if (k <= .01) return;
        const px = 420 + r1 * 1100 + Math.sin(t * .8 + i) * 18, py = lerp(760, 250 + r2 * 220, k);
        push(); translate(px, py); rotate((hash(i * 2.2) - .5) * .8 + Math.sin(t * 1.1 + i) * .12); scale(.7 + .3 * r2);
        plPhoto(-110, -78, 220, 156, p, { two: i !== 3, col: mixCol(p.mid, p.light, .2 + .1 * r2) });
        pop();
      });
    });
    const gk = ease(seg(t, 17.9, 18.45));
    plLayer(.88, () => {
      const mood = emotions(t, [[0, 'confused'], [18.4, 'surprised']]);
      plHim(t, 820, 28, mood, { view: 'q', aL: -.2, aR: .5 + .7 * gk, lookY: -.4 });
    });
    // 空白纸：边缘在「惘」那一刻烧起来
    if (t > 18.5) {
      const burn = ease(seg(t, 19.10, 19.50));
      const bx = 1020, by = 470 - 20 * gk, bw = 210 * (1 - burn * .35), bh = 150 * (1 - burn * .55);
      paint(rectPts(bx - bw / 2, by - bh / 2, bw, bh), { wash: mixCol('#FFF5E2', p.light, .25), ink: null });
      paint(rectPts(bx - bw / 2, by + bh / 2 - 10 - burn * 24, bw, 10 + burn * 24, 2), { wash: mixCol(p.front, p.light, .12 + .2 * burn), ink: null });
      plGlow(bx, by + bh / 2, 70 + 40 * burn, p.light, .25 + .45 * burn);
    }
    plCamEnd();
    plBevel(p);
    irisOut(lt, dur, .52, 1020, 500, '#06050a');   // 烧穿的洞 → 下一镜的窗洞
  }

  // ---------- 镜 07 · 19.50–24.30 ·「你曾是我心中唯一的信仰」（一个长镜头，不许切） ----------
  function s07(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    const k = ease(seg(t, 19.6, 23.4));
    const z = 1.03 + .48 * k;
    plCam(lerp(0, 330, k), lerp(24, -50, k), z);
    plSky(p, { lightK: 1.15 });
    plWall(p, { lightK: 1.1 + .22 * k });
    plFloor(p, { lamp: true, lampX: 1500, lampK: 1, box: false, books: false });
    plLayer(.6, () => {
      const peak = ease(seg(t, 23.9, 24.3));
      plGlow(1500, FL - 210, 240 + 80 * peak, p.light, .35 + .35 * k);
      plHer(t, 1420, 19 + 3 * k, p, .34 + .12 * peak, { view: 'front', lookX: -.5, aL: .1, aR: -.1 });
    });
    [[19.95, 0], [21.1, 1], [22.4, 2]].forEach(([tk, i]) => {
      const kk = ease(seg(t, tk, tk + .55));
      if (kk <= 0 || kk >= 1) return;
      const yy = lerp(CAV.y1 + 60, CAV.y0 - 60, kk), hh = 22 + i * 10;
      paint(rectPts(CAV.x0 - 40, yy, CAVW + 80, hh), { wash: mixCol(p.front, p.mid, .35 - i * .06), ink: null });
      plEdge([[CAV.x0 - 40, yy], [CAV.x1 + 40, yy]], mixCol(p.rim, p.front, .45), 1.6);
    });
    plLayer(.95, () => {
      const mood = emotions(t, [[0, 'hopeful'], [2.6, 'sad'], [4.1, 'hopeful']]);
      plHim(t, 700, 29, mood, { view: 'q', lookX: .85, lookY: -.6, aL: -.28, aR: .3 });
    });
    plCamEnd();
    plBevel(p);
  }

  // ---------- 镜 08 · 24.30–27.50 ·「（拖腔，灯闪两下，她越来越透）」 ----------
  function s08(t, lt, dur) {
    const p0 = plPal(t);
    const flick = 1 - .28 * Math.exp(-Math.abs(t - 25.48) * 14) - .22 * Math.exp(-Math.abs(t - 26.04) * 14);
    const p = dimP(p0, 1 - .72 * flick);
    plFrame(p);
    plCam(150 + 6 * Math.sin(lt * .5), 4, 1.42);
    plSky(p, { lightK: flick });
    plWall(p, { lightK: flick });
    plMids(p, { photos: false });
    const fade = .30 + .45 * ease(seg(t, 26.6, 27.4));
    plLayer(.55, () => {
      plGlow(1500, FL - 200, 150 * flick, p0.light, .3 * flick);
      plHer(t, 1400, 26, p, fade, { view: 'front', lookX: -.3 });
    });
    plLayer(.95, () => {
      const mood = emotions(t, [[0, 'cry'], [2.4, 'sad']]);
      plHim(t, 700, 28, mood, { view: 'q', lookX: .8, lookY: -.6, aL: -.2, aR: .55 });
      const bow = Math.sin(lt * 1.4) * .5;
      plEdge([[360, 520 + bow], [780, 512 + bow]], mixCol(p.rim, p.front, .35), 1.4);
    });
    plCamEnd();
    plBevel(p);
  }

  // ---------- 镜 09 · 27.50–29.68 ·「但怎么你离去」（大时刻 B：抽走她那一层） ----------
  function s09(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    const pull = ease(seg(t, 27.54, 29.05));
    const tiltUp = ease(seg(t, 27.62, 28.4)) * (1 - ease(seg(t, 28.9, 29.6)));
    plCam(120, lerp(16, -56, tiltUp), 1.12 + .05 * pull);
    plSky(p, { lightK: 1 });
    plWall(p, { lightK: .9 });

    // 墙上本来就有一个人形的洞（她的位置），一直被她的那层纸挡着
    plLayer(.30, () => {
      clawd(1300, FL - 112, 22, { view: 'back', col: p.sky, dk: p.sky, lt: mixCol(p.sky, '#fff', .30), noShadow: true, boilKey: 'hole' });
      plGlow(1300, FL - 200, 160, p.light, .40);
      plGlow(1300, FL - 210, 80, p.accent, .16);
    });

    // 她那一层纸：被整片向上抽走
    const sheetY = CAV.y0 - pull * (CAVH + 320);
    plLayer(.52, () => {
      const sc = mixCol(p.mid, p.light, .30);
      paint(rectPts(CAV.x0, sheetY, CAVW, CAVH), { wash: sc, ink: null });
      plEdge([[CAV.x0, sheetY + 1], [CAV.x1, sheetY + 1]], mixCol(p.rim, p.mid, .35), 2.4);
      paint(rectPts(CAV.x0, sheetY + CAVH - 14, CAVW, 14), { wash: mixCol(sc, p.front, .45), ink: null });
      if (pull > .04 && pull < .96) for (let i = 0; i < 5; i++) {
        const ly = sheetY + CAVH + 26 + i * 34;
        plEdge([[CAV.x0 + 80 + i * 260, ly], [CAV.x0 + 80 + i * 260, ly + 56]], mixCol(p.rim, p.front, .45), 1.2);
      }
    });
    plFloor(p, { box: true, boxX: 560, boxY: FL - 104, boxW: 320, boxH: 104, lamp: true, lampX: 1660, lampK: .7 });
    plLayer(.9, () => {
      const grab = ease(seg(t, 28.9, 29.12));
      const mood = emotions(t, [[0, 'surprised'], [27.94, 'scared'], [29.0, 'cry']]);
      plHim(t, 900, 26, mood, { view: 'q', lookY: -.7, aL: .1 + 1.1 * grab, aR: .2 + 1.2 * grab });
    });
    plFront(p);
    plCamEnd();
    plBevel(p);
    veil(.32 * Math.exp(-Math.abs(t - 27.56) * 20), '#0b0714');
  }

  // ---------- 镜 10 · 29.68–31.58 ·「从我的世界里」（墙一块块掉） ----------
  function s10(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    plCam(0, 0, 1.06);
    plSky(p, { lightK: .8 });
    const cols = 4, rows = 3, cw = CAVW / cols, chh = CAVH / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const idx = r * cols + c, tk = 29.68 + idx * BEAT * 1.15;
      const k = ease(seg(t, tk, tk + .45));
      if (k >= .995) continue;
      const yy = CAV.y0 + r * chh + k * (460 + idx * 24), xx = CAV.x0 + c * cw;
      push(); translate(xx + cw / 2, yy + chh / 2); rotate(k * (hash(idx) - .5) * .45); translate(-(xx + cw / 2), -(yy + chh / 2));
      paint(rectPts(xx + 3, yy + 3, cw - 6, chh - 6), { wash: mixCol(p.far, p.front, .06 + .05 * (r / rows)), ink: mixCol(p.far, p.front, .45), sw: .9 });
      plEdge([[xx + 5, yy + 4], [xx + cw - 5, yy + 4]], mixCol(p.rim, p.far, .45), 1.6);
      paint(rectPts(xx + 5, yy + chh - 12, cw - 10, 8), { wash: mixCol(p.far, p.front, .35), ink: null });
      pop();
    }
    plFloor(p, { box: true, boxX: 1120, boxY: FL - 100, boxW: 300, boxH: 100, floorDust: true });
    plLayer(.9, () => {
      const mood = emotions(t, [[0, 'sad'], [1.4, 'bored']]);
      plHim(t, 900, 25, mood, { view: 'front', lookY: -.5, aL: -.4, aR: -.4, ...KNEEL });
    });
    plCamEnd();
    plBevel(p);
  }

  // ---------- 镜 11 · 31.58–32.55 ·「恍惚间」 ----------
  function s11(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    const focus = ease(seg(t, 31.60, 31.92));
    plCam(-60, 0, 1.10 + .05 * (1 - focus));
    plSky(p, { lightK: .8 });
    plWall(p, { lightK: .8 });
    plFloor(p, { chair: true, chairX: 800, box: false, floorDust: true });
    plMids(p, { scarf: true, scarfK: .25 + .75 * focus, scarfX: 880, scarfY: 640, photos: false });
    if (focus < 1) veil((1 - focus) * .46, mixCol('#F3EBDC', p.light, .35));
    plCamEnd();
    plBevel(p);
  }

  // ---------- 镜 12 · 32.55–35.50 ·「我还是会想起」 ----------
  function s12(t, lt, dur) {
    const p = plPal(t);
    plFrame(p);
    const trav = ease(seg(t, 32.55, 35.2));
    plCam(0, lerp(60, -100, trav), 1.14);
    plSky(p, { lightK: .9 });
    plWall(p, { lightK: .9 });
    plMids(p, { photos: false });
    const by = lerp(1000, 210, trav);
    plLayer(.62, () => {
      const pts = [];
      for (let i = 0; i <= 6; i++) pts.push([720 + Math.sin(t * 1.6 + i * .7) * 110 + i * 34, by + i * 64]);
      paint(ribbon(pts, 64, 34), { wash: p.accent, ink: mixCol(p.accent, p.front, .45) });
      [33.41, 34.27, 35.10].forEach((tk, i) => {
        const k = Math.exp(-Math.abs(t - tk) * 3.0);
        if (k < .07) return;
        plGlow(600 + i * 300, 520 + i * 90, 130, p.accent, .30 * k);
        paint(ellPts(600 + i * 300, 520 + i * 90, 62, 96, 18), { wash: mixCol(p.far, p.accent, .22 * k), washOp: 210, ink: null });
        plEdge([[600 + i * 300 - 52, 520 + i * 90 - 88], [600 + i * 300 + 52, 520 + i * 90 - 88]], mixCol(p.rim, p.accent, .3), 1.2);
      });
    });
    plFloor(p, { chair: true, chairX: 800, box: false });
    plLayer(.92, () => {
      const mood = emotions(t, [[0, 'hopeful'], [2.1, 'sad']]);
      plHim(t, 1060, 27, mood, { view: 'q', lookY: -.6, aL: -.1, aR: .6, dx: Math.sin(t * 2.2) * .16 });
    });
    plCamEnd();
    plBevel(p);
  }

  shots([
    [0.00, s01], [3.62, s02], [7.58, s03], [10.46, s04], [13.92, s05], [17.18, s06],
    [19.50, s07], [24.30, s08], [27.50, s09], [29.68, s10], [31.58, s11], [32.55, s12]
  ]);
})();
