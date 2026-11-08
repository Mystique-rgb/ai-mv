// mv.js: 《把回忆拼好给你》Risograph 套印版 · 13 个镜头，照着 MV分镜提示词_v1 的第 6/7 节落地。
// 音频 60.47s / 127.95BPM / offset .44 → BEAT = .4689s。B(n) 就是第 n 拍的时间。
// 每拍一件事：镜/身/表/墨 四类轮换，相邻两拍不同类；全片只有 29.98–30.92 允许"什么都没有"。
(() => {
  const GY = 830;                 // 常规地面线（脚踝），字幕条从 872 起，人物脚不压字
  const B = n => OFF + n * BEAT;  // 第 n 拍的时间（0 = 第一下底鼓）
  const bp = (bar, bt = 1) => OFF + ((bar - 1) * 4 + (bt - 1)) * BEAT;   // 第 bar 小节第 bt 拍
  const o2 = lt => onTwos(lt);    // 角色 12fps：印刷片要"顿"
  // 取"阶梯值"：过了 t0 就跳过去，不插值。用于拍上的硬切。
  const step = (t, keys) => { let v = keys[0][1]; for (const [tt, vv] of keys) if (t >= tt) v = vv; return v; };

  // ================================================================
  // S01 · b01–b02 · 0.44–4.19 · 我们都是渺小真实存在
  // 极近的半调点 → 猛拉到一张空白纸 → 滚筒压出海平线和网格城市 → 两个墨点被印出
  // ================================================================
  function s01(t, lt, dur) {
    setKick(kickOf(t, [bp(1, 3), bp(2, 1)], 6));
    const pull = easeOut(seg(lt, .05, 1.5));          // 0 = 极近的半调点，1 = 整张纸
    const cx = 940 + 46 * ease(seg(lt, .2, dur));
    camBegin(cx, 646, lerp(1.0, .93, pull));
    paperBase();
    plate(rectPts(-900, 700, W + 1800, 900), 'blue', { wash: mixCol(INK.paper, INK.blue, .58) });
    tone(-400, 700, W + 800, 900, 'blue', '20', true);
    gridCity(700, 1);

    // 起手：屏幕里只有半调点，一拉才知道那只是纸上一小块蓝
    if (pull < .995) dotDisc(560, 310, lerp(820, 130, pull), INK.blue, lerp(130, 11, pull));
    // 滚筒从左边压过去：b01 拍2
    const roll = seg(lt, .42, 1.05);
    if (roll > 0 && roll < 1) {
      const rx = lerp(-320, W + 320, easeOut(roll));
      paint(rectPts(rx - 300, 660, 300, 40), { wash: INK.blueDk, ink: null });
      inkLine([[rx, 630], [rx, 760]], 5, INK.blue, 'ink', 0);
    }
    inkLine([[-400, 700], [W / 2, 697], [W + 400, 700]], 2.2, INK.blueDk, 'ink', 0);

    // A：被"印"出来的那个陶土墨点，然后抬头、眨眼、往右找
    const aIn = backOut(seg(lt, 1.28, 1.62));
    if (aIn > .02) {
      const m = emotions(lt, [[1.28, 'neutral'], [1.9, 'surprised', { lookX: .8 }], [2.9, 'hopeful', { lookX: 1 }]], { take: .7 });
      const hop = jump(lt, 3.16, 3.5, 1.1);
      A_(556, 700, 11 * aIn, { ...m, ...hop, sq: (m.sq || 0) + (hop.sq || 0), boilKey: 'A01' });
    }
    // B：纸的另一端，先只有一粒粉点
    const bIn = seg(lt, 2.72, 3.1);
    if (bIn > .02) {
      boilSeed('bdot');
      paint(ellPts(1508, 698, 13 + 4 * Math.sin(t * 9), 7, 14), { wash: INK.pink, ink: null });
      if (bIn > .5) B_(1508, 700, 8, { ...feel('shy', o2(lt)), boilKey: 'B01', halo: false });
    }
    // 规矩线：全片一直在，歪多少 = 爱差多少
    camEnd();
    regMarks(.5);
    if (lt < .18) flash(1 - lt / .18, INK.paper);
    if (lt > dur - .26) rollerSweep((lt - (dur - .26)) / .52, INK.blue);
  }

  // ================================================================
  // S02 · b03–b04 · 4.19–7.94 · 祈愿小世界里不只有挫败
  // 低角度，暖黑方块像楼一样砸下来；A 躲、被压扁、弹回；最后一拍双手合十
  // ================================================================
  const S02_HITS = [4.66, 5.60, 6.53, 7.47];
  function s02(t, lt, dur) {
    const hit = kickOf(t, S02_HITS, 12);
    setKick(hit);
    const sky = step(lt, [[0, 0], [1.86, 1]]);          // b04 起切俯拍
    const sh = shakeXY(t, Math.abs(hit) * .55 + 1);
    camBegin(960 + sh[0], (sky ? 706 : 786) + sh[1], sky ? 1.02 : 1.2);
    paperBase();
    // 背景：一层暖黑压住靛蓝，越到后面越满
    plate(rectPts(-900, -900, W + 1800, 1500), 'blue', { wash: mixCol(INK.paper, INK.blue, .35) });
    tone(-200, -200, W + 400, 900, 'blue', '40', true);
    plate(rectPts(-900, GY - 8, W + 1800, 1100), 'warm', { wash: INK.warm });   // 地面
    tone(-500, GY, W + 1000, 700, 'warm', '60');

    // 灰块：一块接一块往下砸
    // 灰块：一块接一块往下砸，把 A 夹在中间那道缝里
    const BLOX = [[250, 286, 560, 560, 4.66], [1080, 246, 600, 620, 5.60],
                  [40, 400, 470, 460, 6.53], [1420, 372, 500, 520, 7.47]];
    BLOX.forEach(([bx, by, bw, bh, th], i) => {
      const k = seg(t, th, th + .26);
      if (k <= 0) return;
      const drop = (1 - easeIn(k)) * -900;
      boilSeed('bx' + i);
      blockInk(bx, by + drop, bw, bh, 2);
      // 落地的冲击：几道纸白的裂口 + 墨点
      if (k > .55) {
        boilSeed('crk' + i);
        for (let d = 0; d < 4; d++) {
          const cx2 = bx + bw * (.15 + .24 * d), len = 40 + 60 * hash(d + i * 3);
          inkLine([[cx2, by + bh + drop], [cx2 + (hash(d) - .5) * 40, by + bh + drop + len]], 2.4, INK.paper, 'dry', .4);
        }
        for (let d = 0; d < 6; d++) paint(ellPts(bx + bw * hash(d + 1), by + bh + drop + 16 + 36 * hash(d + 4), 8, 11, 7), { wash: INK.warm, ink: null });
      }
    });

    // A：中景，脚在地面上；被砸中时压扁
    const squash = Math.max(...[5.60, 6.53].map(th => seg(t, th, th + .08) * (1 - seg(t, th + .3, th + .6))));
    const dodge = Math.sin(seg(t, 4.5, 4.95) * Math.PI) * 150 - Math.sin(seg(t, 5.4, 5.9) * Math.PI) * 120;
    const m = emotions(lt, [[0, 'nervous', { emote: 'sweat' }], [.5, 'scared'], [1.0, 'ko'], [1.5, 'determined'], [2.3, 'ko'], [2.6, 'determined']], { take: .9 });
    const u = sky ? 15 : 26;
    A_(910 + dodge, GY, u, { ...m, sq: (m.sq || 0) + squash * .7, dy: 0, boilKey: 'A02', emote: squash > .3 ? 'dizzy' : m.emote });

    // 最后一拍：双手合十，头顶出现一个"没有油墨的圆"，一小片粉从缺口漏进来
    const pray = seg(lt, 3.2, 3.5);
    if (pray > 0) {
      boilSeed('knock');
      const r = 128 * backOut(pray);
      paint(ellPts(910, 470, r, r, 26), { wash: INK.paper, ink: null });                          // 挖空：没有油墨
      paint(ellPts(910, 470 - r * .54, r * .9, r * .3, 20), { wash: INK.pink, washOp: 200, ink: null });   // 粉从缺口上沿渗进来
      paint(ellPts(910, 470, r, r, 26), { ink: mixCol(INK.paper, INK.blue, .35), sw: 1.4 });
      A_(910, GY, 26, { ...feel('hopeful', o2(lt)), aL: 1.5, aR: 1.5, view: 'front', boilKey: 'A02b' });
    }
    camEnd();
    regMarks(.4);
    if (lt > dur - .04) flash(.85, INK.paper);
  }

  // ================================================================
  // S03 · b05–b06 · 7.94–11.69 · 直到遇见你 我以为就光明起来
  // 侧面跟拍穿过灰墙窄巷；右侧版门卷起，B 被印出来；两步之后两色叠印长出正红
  // ================================================================
  const S03_RED = 11.1;
  function s03(t, lt, dur) {
    setKick(kickOf(t, [bp(5, 1), bp(6, 1)], 8));
    const walk = ease(seg(lt, 0, 2.4));
    const red = seg(t, S03_RED, S03_RED + .6);
    const push = 1 + .4 * ease(seg(t, 9.3, 10.1)) * (1 - red);
    camBegin(lerp(880, 1010, walk), 690, (.98 + .04 * walk) * push);
    paperBase();
    // 巷子的灰墙：高得像峡谷，越到后面越暗
    const wall = k => mixCol(INK.blue, INK.paper, .18 + .34 * k);
    plate(rectPts(-400, -400, W + 800, 1180), 'blue', { wash: wall(0) });
    tone(-300, 80, W + 600, 760, 'blue', '60');
    for (let i = 0; i < 6; i++) {
      boilSeed('wall' + i);
      const x = -260 + i * 460 - walk * 190, w = 330, h = 640 + 110 * hash(i);
      plate(rectPts(x, GY - h - 60, w, h), 'blue', { wash: mixCol(INK.blueDk, INK.paper, .06 + .12 * hash(i + 3)) });
      tone(x, GY - h - 60, w, h, 'blue', '40', true);
      plate(rectPts(x, GY - h - 60, 14, h), 'blue', { wash: mixCol(INK.blue, INK.paper, .5) });
    }
    plate(rectPts(-400, GY, W + 800, 900), 'blue', { wash: INK.blueDk });
    tone(-400, GY, W + 800, 300, 'blue', '100');

    // 版门：b05 拍3，右侧像卷帘一样卷起一块粉版
    const gate = backOut(seg(t, 8.85, 9.35));
    if (gate > .01) {
      boilSeed('gate');
      paint(rectPts(1240, 120, 130, (GY - 120) * (1 - gate)), { wash: INK.pinkDk, ink: null });
      inkLine([[1240, 120], [1370, 120]], 3, INK.pink, 'ink', 0);
      if (gate > .85) {
        B_(1300, GY, 24, { ...feel('shy', o2(lt)), lookX: -.6, boilKey: 'B03' });
      }
    }

    // A：侧身走，脚步在纸上留下橙点
    const ax = lerp(560, 950, walk);
    const mA = emotions(lt, [[0, 'nervous', { emote: null }], [1.35, 'shy', { lookX: .9 }], [2.8, 'love', { lookX: .8 }], [3.2, 'laugh']], { take: .8 });
    const wA = stroll(lt, 0, 2.4, 560, 950, 24);
    A_(ax, GY, 24, { ...mA, view: 'side', walk: wA.walk, dy: (mA.dy || 0) + (t < 2.4 ? wA.dy : 0), boilKey: 'A03' });
    for (let i = 0; i < 5; i++) {
      const px = 620 + i * 90;
      if (ax > px) paint(ellPts(px, GY + 6, 9, 5, 10), { wash: INK.clay, ink: null });
    }
    // 相遇那一下：两色叠印，正红在纸上生长开，蓝版退到四成
    if (red > 0) {
      boilSeed('redpool');
      const rr = 40 + 900 * easeOut(red);
      paint(ellPts(1120, 700, rr, rr * .8, 30), { wash: INK.red, ink: null });
      paint(rectPts(-400, -400, W + 800, 1180), { wash: INK.paper, washOp: 150 * ease(red), ink: null });
      A_(ax, GY, 24, { ...feel('love', o2(lt)), view: 'q', lookX: .9, boilKey: 'A03b' });
      B_(1300, GY, 24, { ...feel('laugh', o2(lt) + BEAT), lookX: -.9, boilKey: 'B03b' });
    }
    camEnd();
    regMarks(.45);
    if (lt > dur - .3) {   // 出：正红套印生长扩到全屏
      const k = ease(seg(lt, dur - .3, dur));
      paint(ellPts(1120, 700, 1200 * k, 1000 * k, 34), { wash: INK.red, ink: null });
    }
  }

  // ================================================================
  // S04 · b07–b08 · 11.69–15.45 · 眼睛里看到的都是 广袤无垠的大海
  // 竖缝眼极特写 → 瞳孔里有海平线 → 穿过瞳孔 → 一整片半调蓝的海 → 纸船上的两个小点
  // ================================================================
  const S04_IN = 11.69, S04_SEA = 13.86;
  function s04(t, lt, dur) {
    setKick(kickOf(t, [bp(7, 1), bp(8, 1)], 6));
    const sea = t >= S04_SEA;
    if (!sea) {
      // 眼睛特写：一张陶土色的脸上，两只竖缝眼，瞳孔里先映出一条蓝色海平线
      const eyeX = 1092, eyeY = 706;
      const zp = 1 + 2.3 * easeIn(seg(t, 13.05, S04_SEA));
      camBegin(lerp(1000, eyeX, ease(seg(t, 13.05, S04_SEA))), lerp(700, eyeY, ease(seg(t, 13.05, S04_SEA))), zp);
      paperBase();
      plate(rectPts(-900, -900, W + 1800, 2400), 'clay', { wash: INK.clay });
      tone(-300, -300, W + 600, 1500, 'clay', '40', true);
      const hp = ease(seg(t, 12.1, 12.55));
      for (const s of [-1, 1]) {
        const ex = 1000 + s * 236, ew = 128, eh = 648;
        boilSeed('eye' + s);
        paint(rrPts(ex - ew / 2, eyeY - eh / 2, ew, eh, ew / 2, 1.5), { wash: INK.dark, ink: null });
        if (hp > 0) {   // 瞳孔里的海：海面以下才有墨，以上是纸白
          paint(rectPts(ex - ew / 2 + 5, eyeY - eh * .5 * (1 - hp), ew - 10, eh * .5 * hp), { wash: INK.blue, ink: null });
          inkLine([[ex - ew / 2 + 3, eyeY + 2], [ex + ew / 2 - 3, eyeY]], 4, INK.blueLt, 'ink', 0);
          tone(ex - ew / 2, eyeY - 2, ew, 90 * hp, 'blue', '100');
        }
        paint(rectPts(ex - ew * .2, eyeY - eh * .4, ew * .15, eh * .24), { wash: INK.clayLt, washOp: 210, ink: null });
      }
      if (t > 12.4 && t < 12.64) {   // 眨一次眼
        boilSeed('blink');
        for (const s of [-1, 1]) paint(rectPts(1000 + s * 150 - 46, eyeY - 212, 92, 424), { wash: INK.clayDk, ink: null });
      }
      const pv = toScreen(eyeX, eyeY);
      camEnd();
      // 穿过瞳孔：一个蓝色圆从瞳孔长到全屏（瞳孔 = 海平线，形状匹配）
      if (t > 13.3) {
        const k = easeIn(seg(t, 13.3, S04_SEA));
        irisShape(ellPts(pv[0], pv[1], lerp(26, 1900, k), lerp(26, 1900, k), 30), INK.blue);
      }
      regMarks(.28);
      return;
    }
    // ---- 海：上半是没印过的纸白，下半是三层半调蓝 ----
    const pull = easeOut(seg(t, S04_SEA, 14.9));
    camBegin(960, lerp(660, 470, pull), lerp(1.7, .84, pull));
    paperBase();
    seaBands(560, 14, t, 1);
    // 三层浪立起
    for (let i = 0; i < 3; i++) {
      boilSeed('wv' + i);
      const y0 = 560 + i * 62 + 10 * Math.sin(t * 2 + i);
      inkLine([[-400, y0], [W / 2, y0 - 12 + i * 4], [W + 400, y0]], 1.6, mixCol(INK.blueDk, INK.paper, .3), 'ink', 0);
    }
    const boat = ease(seg(t, 13.9, 14.7));
    if (boat > 0) {
      const bx = 700, by = 660;
      paperBoat(bx, by, 175);
      A_(bx - 56, by - 6, 15, { ...feel('starstruck', o2(lt)), lookX: .6, boilKey: 'A04s' });
      B_(bx + 70, by - 4, 14, { ...feel('proud', o2(lt) + BEAT), lookX: -.6, boilKey: 'B04s' });
    }
    camEnd();
    regMarks(.4);
    if (lt > dur - .22) rollerSweep((lt - (dur - .22)) / .44, INK.blue);
  }

  // ================================================================
  // S05 · b09–b11 · 15.45–20.14 · 有你在的日子里不可能被取代
  // 一拍一格的四格蒙太奇：早餐 / 雨伞 / 夜灯 / 阳台；然后四格被推碎
  // ================================================================
  const PANEL = [{ x: 120, y: 150 }, { x: 1000, y: 150 }, { x: 120, y: 556 }, { x: 1000, y: 556 }];
  const PW = 800, PH = 372;
  function s05(t, lt, dur) {
    setKick(kickOf(t, [bp(9, 1), bp(10, 1)], 8));
    const crack = seg(t, 19.2, 19.9);
    const pin = 1 + .1 * ease(seg(t, 18.4, 20.14));
    camBegin(960, 540 + 40 * crack, pin * (1 + .6 * ease(crack)), 0);
    paperBase();
    plate(rectPts(-500, -400, W + 1000, 1400), 'blue', { wash: mixCol(INK.paper, INK.blue, .22) });
    tone(-200, -200, W + 400, 1000, 'blue', '20', true);

    const stamp = [bp(9, 1), bp(9, 2), bp(9, 3), bp(9, 4)];   // 一拍压下一格
    PANEL.forEach((P, i) => {
      const k = backOut(clamp((t - stamp[i]) / .22));
      if (k <= .01) return;
      const sh = (1 - k) * 60, rot = (1 - k) * (i % 2 ? .12 : -.12);
      push(); translate(P.x + PW / 2, P.y + PH / 2 + sh); rotate(rot); scale(k, k); translate(-PW / 2, -PH / 2);
      boilSeed('pn' + i);
      paint(rectPts(0, 0, PW, PH), { wash: INK.paper, ink: null });
      paint(rectPts(0, 0, PW, PH), { wash: INK.blue, washOp: 26, ink: null });
      // 格子里的小日子（和边框同一个变换，压下时一起落）。SHELF = 格内地面线。
      const SHELF = 300, uu = 12;
      const live = t > bp(10, 1);       // b10：四格同时活起来
      if (i === 0) {                 // 早餐：两杯相碰
        plate(rectPts(40, SHELF, 720, 60), 'blue', { wash: mixCol(INK.blue, INK.paper, .55) });
        for (const [cx2, c2] of [[300, INK.clay], [392, INK.pink]]) {
          boilSeed('cup' + cx2);
          paint(rrPts(cx2 - 38, SHELF - 100, 76, 100, 14, 1), { wash: c2, ink: null });
          inkLine([[cx2 + 38, SHELF - 80], [cx2 + 66, SHELF - 60], [cx2 + 38, SHELF - 34]], 3.4, c2, 'ink', .6);
          paint(rrPts(cx2 - 38, SHELF - 100, 76, 100, 14, 1), { ink: INK.ink, sw: 1.6 });
        }
        const clink = pulse(t, 7);
        inkLine([[338, SHELF - 96 - 22 * clink], [338, SHELF - 122 - 22 * clink]], 3, INK.blueDk, 'ink', 0);
        A_(206, SHELF, uu, { ...feel('proud', o2(lt)), boilKey: 'p1a' });
        B_(500, SHELF, uu, { ...feel('laugh', o2(lt) + BEAT), lookX: -.6, boilKey: 'p1b' });
      }
      if (i === 1) {                 // 雨里一把伞，蓝版斜纹刷下
        const rain = seg(t, bp(9, 3), bp(9, 4) + .2);
        for (let d = 0; d < 30; d++) { boilSeed('rn' + d); const rx = 20 + 760 * hash(d), ry = (250 * frac(t * .8 + hash(d + 4))) * rain; paint(ellPts(rx, 30 + ry, 2, 16, 6), { wash: INK.blue, washOp: 150, ink: null }); }
        boilSeed('umb');
        paint([[236, SHELF - 118], [700, SHELF - 118], [468, SHELF - 250]], { wash: INK.blueDk, ink: null });
        inkLine([[468, SHELF - 118], [464, SHELF]], 5.5, INK.blueDk, 'ink', 0);
        A_(330, SHELF, uu, { ...feel('shy', o2(lt)), boilKey: 'p2a' });
        B_(556, SHELF, uu, { ...feel('happy', o2(lt) + BEAT), lookX: -.6, boilKey: 'p2b' });
      }
      if (i === 2) {                 // 夜路一盏灯
        plate(rectPts(10, 10, PW - 20, PH - 20), 'blue', { wash: INK.blueDk });
        const lit = seg(t, bp(10, 1), bp(10, 1) + .2);
        glow(645, 120, 210, '#FFE3A0', .85 * lit);
        boilSeed('lamp2');
        paint(rectPts(636, 96, 18, SHELF - 96), { wash: INK.warm, ink: null });
        paint(rectPts(586, 60, 118, 40), { wash: lit > .4 ? '#FFE3A0' : INK.blue, ink: null });
        plate(rectPts(10, SHELF, PW - 20, 60), 'blue', { wash: mixCol(INK.blueDk, INK.dark, .4) });
        A_(300, SHELF, uu, { ...feel(live ? 'sleepy' : 'bored', o2(lt)), boilKey: 'p3a' });
        B_(444, SHELF, uu, { ...feel('sleepy', o2(lt) + BEAT), boilKey: 'p3b' });
      }
      if (i === 3) {                 // 阳台，衣服被风吹起
        boilSeed('rail');
        inkLine([[20, 128], [PW - 20, 120]], 3.2, INK.blueDk, 'ink', 0);
        for (let d = 0; d < 7; d++) inkLine([[60 + d * 112, 126], [60 + d * 112, 232]], 2, mixCol(INK.blue, INK.paper, .35), 'inkfine', 0);
        plate(rectPts(10, SHELF, PW - 20, 60), 'blue', { wash: mixCol(INK.blue, INK.paper, .5) });
        boilSeed('shirt');
        const sway = Math.sin(t * 3) * 14;
        paint([[534, 122], [676, 122], [700 + sway, 282], [512 + sway, 296]], { wash: INK.pinkLt, ink: null });
        inkLine([[534, 122], [676, 122]], 2.6, INK.pinkDk, 'inkfine', 0);
        A_(266, SHELF, uu, { ...feel('happy', o2(lt)), boilKey: 'p4a' });
        B_(396, SHELF, uu, { ...feel('laugh', o2(lt) + BEAT), lookX: -.7, boilKey: 'p4b' });
      }
      // 边框最后压：夜路那格用纸白，否则蓝框会被深底吃掉
      paint(rectPts(6, 6, PW - 12, PH - 12), { ink: i === 2 ? INK.paper : INK.blueDk, sw: 2.6 });
      pop();
    });
    // 出：四格被推碎成四块纸片
    if (crack > 0) {
      for (let i = 0; i < 4; i++) {
        boilSeed('cr' + i);
        const P = PANEL[i], dx = (i % 2 ? 1 : -1) * 260 * crack, dy = (i < 2 ? -1 : 1) * 200 * crack;
        scrap(P.x + dx, P.y + dy, PW * .5, PH * .6, i % 2 ? INK.pink : INK.clay, crack * (i % 2 ? .4 : -.4));
      }
      paint(rectPts(-600, -400, W + 1200, 1400), { wash: INK.blueDk, washOp: 200 * crack, ink: null });
    }
    camEnd();
    regMarks(.3);
  }

  // ================================================================
  // S06 · b11.3–b12 · 20.14–22.95 · 在最灰暗的日子你陪着我发呆
  // 蓝版压满，只剩一小块纸白；两个人落在巨大的灰台阶上并排坐下，完全静止
  // ================================================================
  function s06(t, lt, dur) {
    setKick(kickOf(t, [bp(12, 4)], 8));
    camBegin(960, 610, 1.08);
    paperBase();
    // 蓝版压满：世界只剩深蓝和一点纸白
    plate(rectPts(-900, -900, W + 1800, 2400), 'blue', { wash: INK.blueDk });
    tone(-500, -500, W + 1000, 1500, 'blue', '60');
    // 一小块纸白：唯一没被印过的地方（撕过的边）
    boilSeed('patch6');
    paint([[-60, 250], [420, 208], [452, 520], [80, 560], [-90, 420]], { wash: INK.paper, ink: null });
    // 一级巨大的灰台阶，两个人坐在这条边沿上，四条小腿悬着
    const SY = 648;
    boilSeed('step6');
    plate(rectPts(-900, SY, W + 1800, 900), 'blue', { wash: mixCol(INK.blueDk, INK.dark, .5) });
    plate(rectPts(-900, SY - 14, W + 1800, 14), 'blue', { wash: mixCol(INK.blue, INK.paper, .38) });
    tone(-900, SY, W + 1800, 500, 'blue', '100');

    if (lt < .55) {   // 碎纸片落下来遮挡（从 S05 掉出来的四格碎片）
      for (let i = 0; i < 5; i++) { boilSeed('fp' + i); scrap(60 + i * 420, -260 + lt * 1500 + i * 120, 210, 160, i % 2 ? INK.pink : INK.clay, .3 * i); }
    }
    // 两个人：B 先坐（抢拍），A 慢半拍才坐；腿垂在台阶前沿
    const SEAT = SY + 42;
    const sitB = ease(seg(lt, .35, .8)), sitA = ease(seg(lt, .82, 1.28));
    if (lt > .3) B_(1120, SEAT + (1 - sitB) * 300, 21, { ...feel('sleepy', o2(lt)), sq: -.16 * (1 - sitB), boilKey: 'B06' });
    if (lt > .8) A_(880, SEAT + (1 - sitA) * 300, 21, { ...feel('bored', o2(lt)), sq: -.16 * (1 - sitA), boilKey: 'A06' });
    // b12 拍4：一片灰纸砸在 B 头上，她连躲都不躲，A 帮她拿掉
    const hit2 = pulse(t, 5) * (t > bp(12, 4) ? 1 : 0);
    if (t > bp(12, 4)) {
      const lift = ease(seg(t, bp(12, 4) + .3, bp(12, 4) + .75));
      boilSeed('scraphead');
      const py = SEAT - 8 * 21 - 30 - 46 * hit2 - 130 * lift;
      const px = lerp(1120, 990, lift);
      paint([[px - 64, py], [px + 66, py - 7], [px + 58, py + 50], [px - 58, py + 44]], { wash: mixCol(INK.blue, INK.paper, .5), ink: null });
      if (lift > .2) A_(880, SEAT, 21, { ...feel('sad', o2(lt)), aR: lerp(.2, 1.25, lift), boilKey: 'A06b' });
    }
    // 角落一粒粉点在暗处明灭
    boilSeed('dot6');
    paint(ellPts(1660, 900, 10 + 4 * Math.sin(t * 5), 10, 12), { wash: INK.pink, washOp: 110 + 90 * Math.sin(t * 5), ink: null });
    camEnd();
    regMarks(.2);
    if (lt > dur - .05) flash(.75, INK.paper);   // 出：刀口一样的一帧纸白
  }

  // ================================================================
  // S07 · b13–b14 · 22.95–26.70 · 你让我学会如何拨开阴霾
  // A 抓住画面上缘那片蓝，像掀纸一样往上撕；B 抓住另一角，两个人把天撕出一个洞
  // ================================================================
  const S07_TEAR = 24.1;
  function s07(t, lt, dur) {
    setKick(kickOf(t, [bp(13, 1), bp(15, 1)], 9));
    const tear = ease(seg(t, S07_TEAR, 26.1));
    const rise = ease(seg(t, 22.95, 26.7));
    camBegin(960, lerp(726, 626, rise), 1.0 + .12 * rise);
    paperBase();
    plate(rectPts(-900, 760, W + 1800, 1000), 'blue', { wash: INK.blueDk });      // 地面
    plate(rectPts(-900, -900, W + 1800, 1700), 'blue', { wash: INK.blue });       // 靛蓝的天
    tone(-700, -700, W + 1400, 1400, 'blue', '60');

    // 撕开的那块纸白：一个从上缘长下来的锯齿口
    const w = lerp(70, 1180, tear), jagY = lerp(70, 600, tear);
    const jag = [];
    for (let i = 0; i <= 13; i++) {
      const k = i / 13;
      jag.push([960 - w / 2 + w * k, jagY + (i % 2 ? -1 : 1) * 74 * hash(i * 2.3 + 5) * (.45 + .9 * tear)]);
    }
    boilSeed('hole');
    paint([[-40, -900], ...jag.slice().reverse(), [W + 40, -900]], { wash: INK.paper, ink: null });
    // 洞里灌下来的光：几道纸白的柱
    if (tear > .18) for (let i = 0; i < 5; i++) {
      boilSeed('ray' + i);
      const rx = 960 - w * .4 + i * w * .2;
      paint([[rx, jagY - 30], [rx + 90 + w * .05, jagY - 30], [rx + 210, 900], [rx + 40, 900]], { wash: INK.paper, washOp: 100 * tear, ink: null });
    }
    // 撕口的纸纤维：毛边，朝外翘
    for (let i = 0; i < 20; i++) {
      boilSeed('fib' + i);
      const p = jag[Math.min(13, i % 14)], s = i % 2 ? 1 : -1;
      inkLine([[p[0], p[1]], [p[0] + s * (26 + 30 * hash(i)), p[1] + 26 + 22 * hash(i + 2)]], 1.8, INK.paper, 'dry', .5);
    }

    // A：站起来，抓住上缘，双手往上撕
    const aM = emotions(lt, [[0, 'bored'], [.55, 'determined'], [2.4, 'excited'], [3.3, 'excited']], { take: .8 });
    const armsUp = .2 + 1.32 * ease(seg(t, 23.4, 23.95));
    A_(820, 760, 26, { ...aM, view: 'q', aL: armsUp, aR: armsUp * .92, dy: -1.5 * ease(seg(t, 23.0, 23.5)) + (aM.dy || 0), boilKey: 'A07' });
    if (t > 25.2) B_(1200, 760, 24, { ...feel('determined', o2(lt)), view: 'q', flip: true, aL: 1.5, aR: 1.44, boilKey: 'B07' });
    camEnd();
    regMarks(.5);
    if (lt > dur - .07) flash(1, INK.paper);
  }

  // ================================================================
  // S08 · b15–b16 · 26.70–30.45 · 将快乐全部收集 将不开心全都淘汰
  // 左右分屏对打：A 张身当口袋吸碎片，B 一拳一个把灰块打飞；然后合并、背靠背、纸墙升起
  // ================================================================
  const S08_MERGE = 29.05, S08_VAC = 29.9;
  function s08(t, lt, dur) {
    const vac = seg(t, S08_VAC, 30.45);     // 抽鼓前的真空
    setKick(kickOf(t, [bp(15, 1), bp(16, 1), bp(16, 3)], 11));
    const merged = t > S08_MERGE;
    const roll = ease(seg(t, 29.5, 30.45));
    camBegin(960, lerp(660, 540, roll), 1.02 + .12 * ease(seg(t, 26.7, 29.5)));
    paperBase();
    if (!merged) {
      // 分屏：左右两本并排的册子，中间一条纸白的分割线
      plate(rectPts(-100, -200, 1060, 1400), 'blue', { wash: mixCol(INK.paper, INK.blue, .22) });
      plate(rectPts(960, -200, 1060, 1400), 'blue', { wash: mixCol(INK.paper, INK.blueDk, .46) });
      tone(-100, 100, 1000, 900, 'blue', '20', true); tone(1000, 100, 900, 900, 'blue', '60', true);
      // 左：A 张开身体当口袋，碎片一拍拍被吸进去，身体一点点鼓起来
      const swell = 1 + .16 * seg(t, 26.7, 29.0);
      const m = emotions(lt, [[0, 'excited'], [1.4, 'excited'], [1.9, 'surprised']], { take: .6 });
      for (let i = 0; i < 14; i++) {
        boilSeed('scr' + i);
        const ph = frac(t * .9 + hash(i + 2));
        const sx = 40 + 800 * hash(i + 5), sy = 120 + 620 * hash(i + 9);
        const k = ease(clamp((t - 26.7) / 2.2));
        const px = lerp(sx, 500 + 40 * (hash(i) - .5), k * ph), py = lerp(sy, 660 + 40 * (hash(i + 1) - .5), k * ph);
        paint(ellPts(px, py, 13 * (1 - .5 * k), 9, 8), { wash: [INK.clay, INK.pink, INK.red][i % 3], ink: null });
      }
      A_(500, GY, 24 * swell, { ...m, view: 'front', aL: 1.35, aR: 1.35, sq: -.16 * seg(t, 26.7, 29), boilKey: 'A08' });
      // 右：B 一拳一个把灰块打飞，每次打出一个没有油墨的白洞
      const hits = [bp(16, 1), bp(15, 3), bp(16, 3), bp(16, 4)];
      hits.forEach((th, i) => {
        const k = seg(t, th, th + .4);
        if (k <= 0) return;
        boilSeed('hole' + i);
        const hx = 1180 + (i % 2) * 300, hy = 300 + (i % 2) * 220;
        paint(ellPts(hx, hy, 66 * backOut(seg(t, th, th + .18)), 56 * backOut(seg(t, th, th + .18)), 22), { wash: INK.paper, ink: null });
        paint(ellPts(hx, hy, 66 * backOut(seg(t, th, th + .18)), 56 * backOut(seg(t, th, th + .18)), 22), { ink: mixCol(INK.blue, INK.ink, .35), sw: 1.6 });
        if (k < 1) {   // 被打飞的那块灰
          const bx2 = hx + 520 * easeOut(k), by2 = hy - 340 * easeOut(k) + 300 * k * k;
          push(); translate(bx2, by2); rotate(k * 2.2);
          paint(rectPts(-70, -60, 140, 120), { wash: INK.warm, washOp: 255 * (1 - k), ink: null });
          pop();
        }
      });
      const mb = emotions(lt, [[0, 'determined'], [1.3, 'mischief'], [2.2, 'cool']], { take: .7 });
      const punch = Math.max(...hits.map(th => pulse(t, 9) * (t > th ? 1 : 0) * Math.exp(-(t - th) * 6)));
      B_(1420, GY, 24, { ...mb, view: 'q', flip: true, aL: .2 + 1.5 * punch, boilKey: 'B08' });
      // 纸白分割线最后压上去
      paint(rectPts(948, -200, 20, 1500), { wash: INK.paper, ink: null });
      paint(rectPts(-100, -200, 20, 1500), { wash: INK.paper, ink: null });
      paint(rectPts(W - 100, -200, 20, 1500), { wash: INK.paper, ink: null });
    } else {
      // 合并：两人背靠背，一张巨大的纸墙升起，镜头猛地上摇
      const wallUp = ease(seg(t, 29.2, 29.9));
      plate(rectPts(-500, -900, W + 1000, 1500), 'blue', { wash: INK.blueDk });
      tone(-400, -300, W + 800, 1000, 'blue', '60');
      const wy = lerp(1100, 430, wallUp);
      boilSeed('wall8');
      paint(rectPts(-500, wy, W + 1000, 1200), { wash: mixCol(INK.blue, INK.paper, .3), ink: null });
      paint(rectPts(-500, wy - 22, W + 1000, 22), { wash: INK.paper, ink: null });
      const mA = feel('excited', o2(lt)), mB = feel('cool', o2(lt) + BEAT);
      A_(880, GY, 26, { ...mA, view: 'back', boilKey: 'A08m' });
      B_(1010, GY, 26, { ...mB, view: 'back', flip: true, boilKey: 'B08m' });
      if (vac > 0) {   // 卷走：整张纸被卷起来，进入全片唯一的真空
        for (let i = 0; i < 6; i++) {
          boilSeed('rl' + i);
          paint(rectPts(-500, -900 + i * 260 + vac * -300, W + 1000, 250), { wash: i % 2 ? INK.blue : INK.blueDk, ink: null });
        }
      }
    }
    camEnd();
    regMarks(.3);
  }

  // ================================================================
  // S09 · b17–b20 · 30.45–37.96 · 你对我说的情话 像转瞬即逝的烟花
  // 全片最高点：前 0.94s 是真空，31.39 才炸；之后每四拍一朵，景别每两拍换一次
  // ================================================================
  const S09_HIT = 31.39, S09_BURSTS = [31.39, 32.33, 34.20, 36.08];
  function s09(t, lt, dur) {
    const big = kickOf(t, S09_BURSTS, 14);
    setKick(big);
    // 景别：大全景 → 仰拍 → 贴脸 → 俯拍，硬切在拍上
    const scene = step(t, [[30.45, 0], [32.33, 1], [34.20, 2], [36.08, 3]]);
    const camS = [[940, 660, .92], [960, 860, 1.18], [980, 700, 1.72], [960, 712, 1.0]][scene];
    const sh = shakeXY(t, Math.abs(big) * .5 + 2);
    camBegin(camS[0] + sh[0], camS[1] + sh[1], camS[2]);
    paperBase();

    // 真空段：只有纸纤维和两根引线在抖
    if (t < S09_HIT) {
      for (const [fx, c2, ph] of [[820, INK.clay, 0], [1100, INK.pink, 1.7]]) {
        boilSeed('fuse' + ph);
        const wob2 = 6 * Math.sin(t * 22 + ph);
        inkLine([[fx, GY], [fx + wob2, GY - 90], [fx - wob2, GY - 200]], 3.4, c2, 'ink', .6);
        paint(ellPts(fx - wob2, GY - 204, 7 + 3 * Math.sin(t * 30), 7, 8), { wash: INK.red, ink: null });
      }
      paint(rectPts(-900, GY, W + 1800, 40), { wash: mixCol(INK.paper, INK.blue, .18), ink: null });
      camEnd(); regMarks(.35); return;
    }
    // 重拍：第一朵炸开，冲击波把两个人抛起来
    const after = t - S09_HIT;
    S09_BURSTS.forEach((th, i) => {
      const a = t - th;
      if (a < 0) return;
      const life = i === 0 ? 3.2 : 1.9, q = clamp(a / life);
      if (q >= 1) return;
      const r = (i === 0 ? 640 : 440) * (a < .12 ? backOut(a / .12) : 1) * (1 - .18 * q);
      const cx = [940, 760, 1120, 900][i], cy = [420, 330, 500, 380][i];
      if (scene !== 3) burst(cx, cy, r * (.85 + .15 * Math.sin(a * 9)), INK.pink, 3, i * 31);
      if (q > .55) {   // 烧成灰，往下落
        for (let d = 0; d < 10; d++) { boilSeed('ash' + i + d); paint(ellPts(cx + (hash(d) - .5) * r * 1.4, cy + (q - .55) * 700 * (.4 + hash(d + 3)), 5, 4, 6), { wash: mixCol(INK.pink, INK.dark, q), ink: null }); }
      }
    });
    // 两个人在烟花里：被抛起、翻跟头、抱在一起转
    const thrown = jump(t, S09_HIT, S09_HIT + .5, 3.2);
    const m = emotions(lt, [[0, 'starstruck'], [1.88, 'laugh'], [3.75, 'love'], [5.63, 'laugh']], { take: .9 });
    if (scene !== 3) {
      A_(860, GY, scene === 2 ? 44 : 24, { ...m, ...thrown, sq: (m.sq || 0) + (thrown.sq || 0), rot: scene === 2 ? -.06 : 0, boilKey: 'A09' });
      if (t > S09_HIT) B_(1020, GY, scene === 2 ? 42 : 24, { ...feel('love', o2(lt) + BEAT), ...thrown, boilKey: 'B09' });
    } else {   // 俯拍：满地都是烟花的灰
      plate(rectPts(-900, GY - 40, W + 1800, 900), 'blue', { wash: mixCol(INK.paper, INK.dark, .35) });
      for (let i = 0; i < 26; i++) { boilSeed('asm' + i); paint(ellPts(-100 + 1900 * hash(i), GY + 40 + 220 * hash(i + 5), 16, 9, 8), { wash: mixCol(INK.pink, INK.dark, .5), ink: null }); }
      A_(900, GY, 20, { ...feel('laugh', o2(lt)), boilKey: 'A09t' });
      B_(1010, GY, 20, { ...feel('starstruck', o2(lt)), boilKey: 'B09t' });
    }
    camEnd();
    regMarks(.4);
    if (lt > dur - .1) flash(.9, INK.pinkLt);
  }

  // ================================================================
  // S10 · b21–b24 · 37.96–45.46 · 只停在绽放一刹那 我却已无法自拔
  // 一朵最大的烟花停住，硬成一朵纸花；A 每拍抓一次，每次都在指尖碎掉；纸折起来，世界翻 180°
  // ================================================================
  const S10 = { look: 38.9, grab: [39.83, 41.71, 43.1], flip: 44.35 };
  function s10(t, lt, dur) {
    const last = t > S10.grab[2];
    const fl = ease(seg(t, S10.flip, 45.3));
    camBegin(960, 560 + 20 * Math.sin(lt * .4), 1.0 + .04 * lt, fl * Math.PI);
    paperBase();
    plate(rectPts(-900, 500, W + 1800, 1200), 'blue', { wash: mixCol(INK.paper, INK.blue, .3) });
    tone(-400, 500, W + 800, 700, 'blue', '40', true);

    // 停住的巨大纸花：三圈花瓣，边缘硬得像贴纸
    const open = .72 + .28 * ease(seg(t, 37.96, 38.9));
    boilSeed('bigflower');
    for (let ring = 0; ring < 3; ring++) {
      const n = 7 + ring * 2, rr = (300 - ring * 70) * open;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + ring * .4 + .06 * Math.sin(t * 1.2);
        boilSeed('pt' + ring + i);
        const px = 960 + Math.cos(a) * rr, py = 320 + Math.sin(a) * rr * .78;
        paint(ellPts(px, py, 86 - ring * 14, 62 - ring * 10, 16, 1, a), { wash: ring === 0 ? INK.pink : ring === 1 ? INK.pinkLt : INK.pinkDk, ink: null });
      }
    }
    paint(ellPts(960, 320, 96, 82, 22), { wash: mixCol(INK.pinkDk, INK.dark, .3), ink: null });

    // A：伸手抓。三次同一个机位，第四次才换
    let frag = 0;
    for (const g of S10.grab) { const a = t - g; if (a > 0 && a < .42) frag = Math.max(frag, 1 - a / .42); }
    const reach = Math.max(...S10.grab.map(g => clamp((t - (g - .3)) / .3) * (1 - clamp((t - g) / .25))));
    const m = emotions(lt, [[0, 'hopeful', { lookY: -1 }], [1.9, 'surprised', { lookY: -1 }], [2.4, 'confused'], [3.4, 'determined'], [4.6, 'sad']], { take: .8 });
    const sink = ease(seg(t, 43.2, 45.0));
    A_(900, GY + 120 * sink, 30, {
      ...m, view: 'q', aR: lerp(.2, 1.45, reach), lookY: -1 + sink,
      dy: (m.dy || 0) - .2, boilKey: 'A10',
    });
    // 抓碎：手边炸出纸屑
    if (frag > 0) for (let i = 0; i < 14; i++) {
      boilSeed('fr' + i);
      const a = (i / 14) * TAU, d = 260 * (1 - frag);
      paint(ellPts(1130 + Math.cos(a) * d, 300 + Math.sin(a) * d * .8, 12 * frag + 3, 9 * frag + 2, 6), { wash: i % 2 ? INK.pink : INK.pinkLt, ink: null });
    }
    // 纸折起来：三折，一折比一折高
    const f1 = ease(seg(t, 42.6, 43.6)), f2 = ease(seg(t, 43.6, 44.4)), f3 = ease(seg(t, 44.4, 45.2));
    if (f1 > 0) paint([[-900, 720 - 40 * f1], [W + 900, 700 - 40 * f1], [W + 900, 1200], [-900, 1200]], { wash: mixCol(INK.blueDk, INK.ink, .5), ink: null });
    if (f2 > 0) paint([[-900, 560 - 30 * f2], [W + 900, 540 - 30 * f2], [W + 900, 1200], [-900, 1200]], { wash: mixCol(INK.blueDk, INK.ink, .62), ink: null });
    if (f3 > 0) paint([[-900, 380], [W + 900, 360], [W + 900, 1200], [-900, 1200]], { wash: mixCol(INK.blueDk, INK.ink, .74), ink: null });
    camEnd();
    regMarks(.3);
    if (last) {
      // 翻过去之后，粉色的纸屑落成一条河
      for (let i = 0; i < 18; i++) { boilSeed('rv' + i); paint(ellPts(-100 + i * 120, 900 - 60 * Math.sin(i), 22, 10, 8), { wash: INK.pink, washOp: 180, ink: null }); }
    }
    if (lt > dur - .12) flash(.8, INK.paper);
  }

  // ================================================================
  // S11 · b25–b26 · 45.46–49.21 · 我们的爱总有时差
  // 两个人做完全一样的动作，B 永远晚一整拍；规矩线 8 → 16 → 24px 一点点错开
  // ================================================================
  function s11(t, lt, dur) {
    // 每拍一次短促的左右甩
    const whip = Math.sin(lt * Math.PI * 4) * 26 * Math.exp(-frac(lt * 4) * 5);
    camBegin(960 + whip, 620, 1.0);
    paperBase();
    plate(rectPts(-200, -300, W + 400, 1500), 'blue', { wash: mixCol(INK.paper, INK.blue, .26) });
    for (const px of [110, 990]) { paint(rectPts(px, 130, 820, 640), { wash: INK.paper, ink: null }); paint(rectPts(px, 130, 820, 640), { ink: INK.blueDk, sw: 2 }); }
    paint(rectPts(946, 130, 28, 640), { wash: INK.paper, ink: null });
    // 规矩线从对齐开始错开：8 → 16 → 24px
    const off = seg(t, 45.46, 48.6) * 24;
    setKick(off * .8);
    boilSeed('reg11');
    inkLine([[960, 130], [960 + off, 770]], 1.4, INK.pinkDk, 'inkfine', 0);
    inkLine([[960 - off, 130], [960, 770]], 1.4, INK.clayDk, 'inkfine', 0);

    // 同一套动作：抬手（b25 拍2 / B 拍3）、转身（b26 拍2 / B 拍3）
    const tA = 45.93, tB = 46.40;
    const armA = .2 + 1.3 * clamp((t - tA) / .16) * (1 - clamp((t - 47.0) / .2));
    const armB = .2 + 1.3 * clamp((t - tB) / .16) * (1 - clamp((t - 47.47) / .2));
    const turnA = t > 47.33 ? turn(t, 47.33, 47.5, 0, .25) : null;
    const turnB = t > 47.80 ? turn(t, 47.80, 47.97, 0, .25) : null;
    const m = emotions(lt, [[0, 'surprised'], [1.4, 'nervous'], [2.6, 'sad']], { take: .7 });
    // 越到后面越像鬼影：两格重叠、身体抖
    const ghost = seg(t, 48.3, 49.2);
    const trem = 3 * ghost * Math.sin(t * 40);
    A_(520 + trem, 640, 34, { ...m, view: 'q', aL: armA, ...(turnA || {}), boilKey: 'A11' });
    B_(1400 - trem, 640, 34, { ...m, view: 'q', flip: true, aL: armB, ...(turnB || {}), boilKey: 'B11' });
    if (ghost > 0) {   // 两个鬼影叠到一起
      const gx = lerp(520, 880, ease(ghost)), hx = lerp(1400, 1000, ease(ghost));
      B_(hx, 640, 34, { ...feel('sad', o2(lt)), view: 'q', flip: true, aL: armB, boilKey: 'B11g' });
      A_(gx, 640, 34, { ...feel('sad', o2(lt)), view: 'q', aL: armA, boilKey: 'A11g' });
    }
    camEnd();
    regMarks(.3);
    if (lt > dur - .2) flash(.7, INK.paper);
  }

  // ================================================================
  // S12 · b27–b28 · 49.21–52.96 · 也为你骗自己放下
  // 俯拍桌面：把一片粉纸放进信封、合上、压住；但每一拍手指都会自己抽出来一点
  // ================================================================
  const S12_ENV = { x: 660, y: 566, w: 600, h: 366 };
  function s12(t, lt, dur) {
    setKick(kickOf(t, [bp(27, 1), bp(28, 3)], 10));
    const pull = ease(seg(t, 52.1, 52.96));
    camBegin(960, 640, lerp(1.04 + .1 * ease(seg(lt, 0, 2.4)), .88, pull));
    paperBase();
    plate(rectPts(-900, -900, W + 1800, 3000), 'blue', { wash: mixCol(INK.paper, INK.blue, .12) });
    tone(-400, -300, W + 800, 1300, 'blue', '20', true);
    const E = S12_ENV;

    // A：站在桌子后面，只顾着按下这个信封（信封最后画，遮住他的脚）
    const press = ease(seg(t, 50.3, 50.6));
    const m = emotions(lt, [[0, 'smug'], [1.9, 'smug'], [2.25, 'sad'], [2.75, 'cry']], { take: .6 });
    A_(960, E.y, 27, { ...m, view: 'front', aL: -1.2 - .1 * press, aR: -1.2 - .1 * press, boilKey: 'A12' });

    // 信封
    boilSeed('env');
    const open = 1 - ease(seg(t, 49.9, 50.3));
    paint(rectPts(E.x, E.y, E.w, E.h), { wash: INK.cream, ink: null });
    paint([[E.x, E.y], [E.x + E.w / 2, E.y + 130 * open + 12], [E.x + E.w, E.y]], { wash: INK.paper, ink: null });
    paint(rectPts(E.x, E.y, E.w, E.h), { ink: mixCol(INK.blue, INK.ink, .45), sw: 2.4 });
    // 粉纸片被放进去
    const put = ease(seg(t, 49.55, 49.95));
    if (t < 50.35) paint(ellPts(lerp(1210, 960, put), lerp(790, E.y + 40, put), 62, 45, 12, 1, put), { wash: INK.pink, ink: null });
    // 两只手压在信封上；每一拍手指自己从信封底下抽出来一点，再按回去
    const creep = t > 51.0 ? Math.max(0, Math.sin((t - 51.0) * 6.2)) * 40 : 0;
    for (const hx of [E.x + 160, E.x + E.w - 160]) {
      boilSeed('fing' + hx);
      paint(rrPts(hx - 30, E.y + 16 - creep, 60, 126, 14, 1), { wash: INK.clay, ink: null });
      paint(rrPts(hx - 30, E.y + 16 - creep, 60, 126, 14, 1), { ink: INK.ink, sw: 1.6 });
    }
    // 信封轻轻鼓一下
    const bulge = t > bp(28, 3) ? Math.exp(-(t - bp(28, 3)) * 5) : 0;
    if (bulge > .02) paint(ellPts(E.x + E.w / 2, E.y, E.w * .4, 46 * bulge, 16), { wash: INK.pink, washOp: 160, ink: null });
    // 角落一粒粉点，明灭
    boilSeed('d12');
    paint(ellPts(130, 940, 9 + 3 * Math.sin(t * 4), 9, 10), { wash: INK.pink, washOp: 110 + 90 * Math.sin(t * 4), ink: null });
    camEnd();
    regMarks(.28);
  }

  // ================================================================
  // S13 · b29–b32 · 52.96–60.47 · 爱炙热的你却忘了爱自己
  // B 烧到发白、边缘糊成红再糊成黑；A 冲过整张纸抱住她，全片唯一一次三版完美对版
  // ================================================================
  const S13 = { run: 56.6, hug: 57.9, pull: 58.59, fold: 59.5 };
  function s13(t, lt, dur) {
    const hug = ease(seg(t, S13.run, S13.hug));
    const burn = ease(seg(t, 52.96, 57.4));
    const back = ease(seg(t, S13.pull, 58.95));
    const fold = ease(seg(t, S13.fold, 60.2));
    setKick(kickOf(t, [bp(29, 1), bp(31, 1)], 13) * (1 - back));
    const bRight = lerp(1560, 1120, hug);
    const ax = lerp(300, bRight - 196, easeOut(hug));
    const focus = lerp(960, (bRight + ax) / 2, clamp(hug));
    const z13 = lerp(1 + 1.05 * clamp(hug), .92, fold);
    camBegin(lerp(focus, 960, fold), lerp(600 + 92 * clamp(hug), 556, fold) + 40 * back, z13);
    paperBase();
    // 纸的另一端（结尾这张纸会变成贴在墙上的海报，底色跟着 fold 一起暗下去）
    boilSeed('bg13');
    plate(rectPts(-900, -900, W + 1800, 2400), 'blue', { wash: mixCol(INK.paper, INK.blueDk, lerp(.34 + .28 * (1 - back), .64, fold)) });
    tone(-400, -300, W + 800, 1400, 'blue', '40', true);
    if (fold < .6) plate(rectPts(-900, GY, W + 1800, 900), 'blue', { wash: INK.blueDk });
    // 一张纸上散落的一路粉纸屑：到处都是她留下的痕迹
    if (fold < .6) {
      boilSeed('hor13');
      inkLine([[-500, GY], [W + 500, GY]], 2.4, mixCol(INK.blue, INK.paper, .28), 'ink', 0);
      for (let i = 0; i < 14; i++) {
        boilSeed('sc13' + i);
        paint(ellPts(-120 + 1980 * hash(i + 1), GY + 26 + 96 * hash(i + 5), 17, 9, 7), { wash: i % 3 ? INK.pink : INK.clay, washOp: 175, ink: null });
      }
    }

    // A：冲过整张纸（先画，B 压在前面，拥抱才叠得起来）
    if (hug > 0 && t < S13.hug + .1) {
      for (let i = 0; i < 9; i++) { boilSeed('tr' + i); paint(ellPts(lerp(300, bRight - 40, hug - i * .06), GY - 6, 26 - i * 2, 9, 8), { wash: INK.clay, washOp: 200 - i * 18, ink: null }); }
    }
    const mA = emotions(lt, [[0, 'surprised'], [3.2, 'determined'], [4.4, 'cry'], [6.0, 'relieved']], { take: .9 });
    if (t < S13.pull) {
      A_(ax, GY, 26, { ...mA, view: hug > .5 ? 'q' : 'side', walk: hug > 0 && hug < 1 ? lt * 5 : 0, halo: hug < .45, boilKey: 'A13' });
      // 粉版顶到 100%：她整个人先亮起来，边缘糊成红
      boilSeed('blur');
      if (burn > .03) paint(rrPts(bRight - 141, GY - 219, 282, 226, 20, 1.6), { wash: INK.red, washOp: 200 * burn, ink: null });
      glow(bRight, GY - 150, 260 + 180 * burn, '#FF8FCB', .5 + .4 * burn);
      const mb = emotions(lt, [[0, 'laugh'], [2.2, 'happy'], [2.9, 'cry']], { take: .8 });
      B_(bRight, GY, 26, { ...mb, view: 'q', flip: true, halo: false, boilKey: 'B13' });
      if (burn > .62) {   // 三版叠印从脚往上黑上来（只黑到胸口）
        boilSeed('burnup');
        const hh = (burn - .62) / .38 * 108;
        paint(rectPts(bRight - 132, GY - hh, 264, hh + 4), { wash: INK.dark, washOp: 235, ink: null });
      }
      // 抱住：两人相叠的那一竖条变成正红（全片唯一一次三版对版）
      if (hug > .88) {
        boilSeed('hugred');
        const hw = 62 * clamp((hug - .88) / .12);
        paint(rrPts(bRight - 98 - hw / 2, GY - 208, hw, 212, 10, 1.4), { wash: INK.red, ink: null });
      }
    } else {
      // 粉版被滚筒反向抽走，怀里只剩一个纸白的形状
      const gone = ease(seg(t, S13.pull, 58.95));
      if (gone < .9) B_(bRight, GY, 26, { ...feel('cry', o2(lt)), view: 'q', flip: true, halo: false, boilKey: 'B13p' });
      if (fold < .6) A_(lerp(ax, ax - 300, fold / .6), GY, 26 * (1 - .5 * fold), { ...feel('cry', o2(lt)), view: 'q', lookX: 1, halo: false, boilKey: 'A13p' });
      if (fold < .3) {   // 怀里只剩一个纸白的形（画在他前面，就是"抱住的那个空位"）
        boilSeed('silh');
        paint(ellPts(bRight - 30, GY - 100, 78, 156, 24), { wash: INK.paper, ink: null });
      }
      // 滚筒反向抽走粉版
      if (back > .02) { boilSeed('back'); paint(rectPts(bRight + 60, -200, 210, 1400), { wash: INK.pink, washOp: 200 * (1 - back), ink: null }); }
    }

    // 尾：把整张纸揭下来，折成信封，放在那个空位上；最后定格在一张贴在墙上的纸
    if (fold > 0) {
      boilSeed('fold');
      const fw = lerp(W + 400, 640, fold), fh = lerp(H + 400, 430, fold);
      const cx0 = 960, cy0 = lerp(540, 560, fold);
      // 墙上这张纸的边：纸白，四角规矩线
      paint(rectPts(cx0 - fw / 2 - 16, cy0 - fh / 2 - 16, fw + 32, fh + 32, 2), { wash: mixCol(INK.paper, INK.blueDk, .28), ink: null });
      paint(rectPts(cx0 - fw / 2, cy0 - fh / 2, fw, fh, 1.5), { wash: INK.cream, ink: null });
      // 信封的折线：上面那一片三角盖 + 一道压痕
      paint([[cx0 - fw / 2, cy0 - fh / 2], [cx0, cy0 + fh * .06], [cx0 + fw / 2, cy0 - fh / 2]], { wash: INK.paper, ink: null });
      inkLine([[cx0 - fw / 2, cy0 - fh / 2], [cx0, cy0 + fh * .06], [cx0 + fw / 2, cy0 - fh / 2]], 2, mixCol(INK.blue, INK.ink, .35), 'ink', 0);
      paint(rectPts(cx0 - fw / 2, cy0 - fh / 2, fw, fh), { ink: mixCol(INK.blue, INK.ink, .5), sw: 2.2 });
      // 纸角那个很小的橙墨点：全片最后一样东西
      if (fold > .8) {
        boilSeed('dot13');
        paint(ellPts(cx0 + fw / 2 - 30, cy0 + fh / 2 - 26, 11, 11, 10), { wash: INK.clay, ink: null });
      }
    }
    camEnd();
    // 规矩线：抱住那一刻第一次完全对齐
    regMarks(t > S13.hug ? .95 : .35);
    if (lt > dur - .35) flash(.5 * (1 - seg(lt, dur - .35, dur - .05)), INK.paper);
  }

  shots([
    [0.44, s01], [4.19, s02], [7.94, s03], [11.69, s04], [15.45, s05], [20.14, s06], [22.95, s07],
    [26.70, s08], [30.45, s09], [37.96, s10], [45.46, s11], [49.21, s12], [52.96, s13],
  ]);
})();
