// mv.js: 《别怕变老》Risograph 手绘套印版 · 15 个镜头 · 50.60s / 144.185BPM / offset .78
// 版次语法同《把回忆拼好给你》：blue=世界/夜/回忆，clay=我(A)，pink=你(B)，paper=留白，red=相拥/爱。
// 每拍一件事；两处抽鼓（33.72→34.52 / 37.06→37.86）= 全片两次"冻结→炸"。
(() => {
  const GY = 830;                 // 常规地面线（脚踝），字幕条从 872 起
  const B = n => OFF + n * BEAT;
  const bp = (bar, bt = 1) => OFF + ((bar - 1) * 4 + (bt - 1)) * BEAT;
  const o2 = lt => onTwos(lt);
  const step = (t, keys) => { let v = keys[0][1]; for (const [tt, vv] of keys) if (t >= tt) v = vv; return v; };
  const BARS = [0.78, 2.45, 4.11, 5.78, 7.44, 9.11, 10.77, 12.44, 14.10, 15.77, 17.43, 19.10,
                20.76, 22.43, 24.09, 25.76, 27.42, 29.09, 30.75, 32.42, 34.08, 35.75, 37.41, 39.08,
                40.74, 42.41, 44.07, 45.74, 47.40, 49.07];
  const bars = (a, b, mag = 10) => BARS.slice(a, b);   // 取一段小节头做 kick
  // 通用收尾：笔刷扫切
  const wipe = (lt, dur) => {
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6);
    if (lt < .3) brushWipe(.5 + lt / .6);
  };

  // 小道具：纸白 E 视力表（三横一竖，全用色块）
  function eyeChart(x, y, s) {
    boilSeed('chart');
    paint(rectPts(x - s * .5, y - s * .75, s, s * 1.5, 2), { wash: INK.cream, ink: mixCol(INK.blue, INK.ink, .4), sw: 2 });
    for (let r = 0; r < 5; r++) {
      const w = s * (.34 - r * .055), ry = y - s * .5 + r * s * .26;
      for (const [dx, dy, ww, hh] of [[-w / 2, -w * .12, w, w * .24], [-w / 2, -w * .5, w * .24, w], [w * .26, -w * .5, w * .24, w], [-w / 2, 0, w * .24, w * .5]])
        paint(rectPts(x + dx, ry + dy, ww, hh, 1), { wash: INK.blue, ink: null });
    }
  }
  // 手机（纸白屏 + 蓝边框）
  function phoneBox(x, y, w, h) {
    boilSeed('phone');
    paint(rrPts(x - w / 2, y - h / 2, w, h, 26, 2), { wash: INK.blueDk, ink: INK.ink, sw: 2.4 });
    paint(rrPts(x - w / 2 + 16, y - h / 2 + 16, w - 32, h - 32, 16, 1.6), { wash: INK.cream, ink: null });
  }
  // 挂钟
  function wallClock(x, y, r, t, stopAt) {
    boilSeed('clock');
    paint(ellPts(x, y, r, r, 26, 2), { wash: INK.cream, ink: INK.ink, sw: 2.2 });
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU;
      inkLine([[x + Math.sin(a) * r * .8, y - Math.cos(a) * r * .8], [x + Math.sin(a) * r * .9, y - Math.cos(a) * r * .9]], 2, INK.blue, 'inkfine', 0);
    }
    const tm = stopAt ?? t;
    const ma = frac(tm / 60) * TAU - Math.PI / 2, ha = frac(tm / 720) * TAU - Math.PI / 2;
    inkLine([[x, y], [x + Math.cos(ma) * r * .68, y + Math.sin(ma) * r * .68]], 3, INK.pinkDk, 'ink', 0);
    inkLine([[x, y], [x + Math.cos(ha) * r * .42, y + Math.sin(ha) * r * .42]], 4, INK.blueDk, 'ink', 0);
  }
  // 火堆：柴 + 三片苗 + 光
  function campFire(x, y, s, lit, t) {
    boilSeed('firewood');
    for (const a of [-.45, .25, .95]) {
      push(); translate(x, y); rotate(a);
      paint(rectPts(-1.5 * s, -.16 * s, 3 * s, .32 * s, 2), { wash: INK.warm, ink: INK.ink, sw: 1.6 });
      pop();
    }
    if (lit <= .01) return;
    const h = s * (1.5 + .35 * Math.sin(t * 9));
    boilSeed('flame' + Math.floor(t * 9));
    for (let i = -1; i <= 1; i++) {
      const w = s * (.5 - Math.abs(i) * .12), hh = h * (1 - Math.abs(i) * .3);
      const pts = through([[x + i * s * .55, y], [x + i * s * .55 - w, y - hh * .5], [x + i * s * .55, y - hh], [x + i * s * .55 + w, y - hh * .5]], 5);
      paint(pts.concat([[x + i * s * .55, y]]), { wash: i === 0 ? INK.clay : INK.pinkDk, ink: INK.ink, sw: 1.4 });
    }
    glow(x, y - h * .5, s * 3.2 * lit, '#FFB367', .55 * lit);
  }

  // ================================================================
  // S01 · 0–2.88 · 让我的爱人勇敢 别怕变老
  // 半调点猛拉开成一张纸 → 滚筒压出地平线 → 陶土墨点被印出来，挺直腰板
  // ================================================================
  function s01(t, lt, dur) {
    setKick(kickOf(t, [bp(1, 1), bp(1, 3)], 9));
    const pull = easeOut(seg(lt, .05, 1.35));
    camBegin(940 + 40 * ease(seg(lt, .2, dur)), 646, lerp(1.06, .95, pull));
    paperBase();
    plate(rectPts(-900, 700, W + 1800, 900), 'blue', { wash: mixCol(INK.paper, INK.blue, .5) });
    tone(-400, 700, W + 800, 900, 'blue', '20', true);
    gridCity(700, .8);
    if (pull < .995) dotDisc(560, 310, lerp(760, 120, pull), INK.blue, lerp(120, 11, pull));
    const roll = seg(lt, .4, 1.0);
    if (roll > 0 && roll < 1) {
      const rx = lerp(-320, W + 320, easeOut(roll));
      paint(rectPts(rx - 300, 660, 300, 40), { wash: INK.blueDk, ink: null });
      inkLine([[rx, 630], [rx, 762]], 5, INK.blue, 'ink', 0);
    }
    inkLine([[-400, 700], [W / 2, 697], [W + 400, 700]], 2.2, INK.blueDk, 'ink', 0);
    // A 被"印"出来：先是一粒陶土点，1.28s 长成人；「勇敢」起挺胸举手
    const aIn = backOut(seg(lt, 1.28, 1.62));
    if (aIn > .02) {
      const brave = seg(t, 1.36, 1.9);
      const m = emotions(lt, [[1.28, 'neutral'], [1.7, 'determined'], [2.2, 'excited']], { take: .8 });
      A_(556, 700, 12 * aIn, { ...m, aL: brave > 0 ? 1.35 : m.aL, aR: brave > 0 ? 1.35 : m.aR, sq: (m.sq || 0) - .1 * brave, boilKey: 'A01' });
    }
    camEnd();
    regMarks(.5);
    if (lt < .16) flash(1 - lt / .16, INK.paper);
    if (lt > dur - .26) rollerSweep((lt - (dur - .26)) / .52, INK.pink);
    wipe(lt, dur);
  }

  // ================================================================
  // S02 · 2.88–5.36 · 对面的女孩看过来 看着我
  // 街角：A 隔着墙喊；「看着我」粉版卷帘门拉起，B 探头
  // ================================================================
  function s02(t, lt, dur) {
    setKick(kickOf(t, [bp(3, 1), bp(4, 1)], 10));
    camBegin(930, 660, 1.04 + .05 * ease(seg(lt, 0, 2)));
    paperBase();
    plate(rectPts(-900, -900, W + 1800, 1180), 'blue', { wash: mixCol(INK.blue, INK.paper, .3) });
    tone(-300, 60, W + 600, 800, 'blue', '40');
    // 对面的小楼：粉版墙 + 一扇窗
    boilSeed('bldg');
    plate(rectPts(1180, 130, 560, 700), 'pink', { wash: mixCol(INK.pink, INK.paper, .55) });
    tone(1180, 130, 560, 700, 'pink', '20', true);
    paint(rectPts(1330, 260, 260, 200, 4), { wash: INK.cream, ink: INK.ink, sw: 2 });
    plate(rectPts(-900, GY, W + 1800, 900), 'blue', { wash: INK.blueDk });
    // 窗帘：4.56「看着我」拉起，B 探头
    const gate = backOut(seg(t, 4.4, 4.85));
    if (gate > .01) {
      boilSeed('curtain');
      paint(rectPts(1330, 260, 260, 200 * (1 - gate), 3), { wash: INK.pinkDk, ink: null });
      if (gate > .8) B_(1460, 470, 21, { ...feel(t > 4.9 ? 'shy' : 'surprised', o2(lt)), lookX: -.7, boilKey: 'B02' });
    }
    // A 在楼下喊：喊的时候整个人拉长
    const call = Math.max(0, Math.sin(bpOf(t) * Math.PI)) * (t < 4.4 ? 1 : .3);
    const mA = emotions(lt, [[0, 'excited'], [1.65, 'hopeful', { lookX: .9 }]], { take: .9 });
    A_(600, GY, 26, { ...mA, dy: (mA.dy || 0) - call * .8, sq: (mA.sq || 0) + call * .08,
      aL: t < 4.4 ? 1.3 + .2 * call : 1.5, aR: t < 4.4 ? 1.3 - .2 * call : 1.5, view: 'front', boilKey: 'A02' });
    if (t > 3.0 && t < 3.5) { boilSeed('helo'); for (let i = 0; i < 3; i++) paint(ellPts(760 + i * 60, 560 - i * 40 - (t - 3) * 160, 10 - i * 2.4, 8 - i * 2, 8), { wash: INK.clay, washOp: 200 - i * 55, ink: null }); }
    camEnd();
    regMarks(.42);
    wipe(lt, dur);
  }

  // ================================================================
  // S03 · 5.36–8.48 · 别再盯着镜子 盯着自己手机摄像头
  // 前半：B 对镜子摆 pose，A 在后面摇头；后半：A 举起大手机，B 每拍换 pose，每拍闪光
  // ================================================================
  function s03(t, lt, dur) {
    setKick(kickOf(t, [bp(5, 1), bp(6, 1)], 9));
    const ph2 = seg(t, 6.48, 6.9);          // 镜子 → 手机
    camBegin(960, 640, lerp(1.02, 1.1, ph2));
    paperBase();
    plate(rectPts(-900, -900, W + 1800, 1180), 'warm', { wash: mixCol(INK.warm, INK.paper, .82) });
    tone(-300, -200, W + 600, 900, 'blue', '10', true);
    plate(rectPts(-900, GY, W + 1800, 900), 'blue', { wash: mixCol(INK.blue, INK.paper, .5) });
    if (ph2 < 1) {
      // 镜子 gag：镜中 B（左右翻转的 B），A 在后面吐槽
      boilSeed('mirror');
      paint(rectPts(1180, 200, 380, 470, 6), { wash: INK.blue, ink: INK.ink, sw: 2.4 });
      paint(rectPts(1204, 224, 332, 422, 4), { wash: INK.cream, ink: null });
      B_(1370, 620, 24, { ...feel(step(lt, [[0, 'cool'], [.5, 'love'], [1, 'proud']]), o2(lt)), flip: true, lookX: -.4, boilKey: 'B03m' });
      // 镜面斜杠高光
      inkLine([[1230, 260], [1310, 600]], 3, mixCol(INK.blue, INK.paper, .4), 'ink', .3);
      const mB = emotions(lt, [[0, 'cool'], [.56, 'playful'], [1.12, 'proud']], { take: .8 });
      B_(760, GY, 27, { ...mB, view: 'front', boilKey: 'B03' });
      const mA = emotions(lt, [[0, 'bored'], [.6, 'suspicious'], [1.12, 'disgusted']], { take: .7 });
      A_(430, GY, 25, { ...mA, view: 'q', flip: true, lookX: .8, boilKey: 'A03' });
    }
    if (ph2 >= 1) {
      // 手机 gag：大手机举在中间，B 在屏里每拍换 pose，每拍快门白闪
      const lt2 = t - 6.48;
      phoneBox(960, 470, 520, 700);
      const pz = step(lt2, [[0, 'cool'], [1, 'love'], [2, 'playful'], [3, 'proud']]);
      B_(960, 660, 30, { ...feel(pz, o2(lt2)), boilKey: 'B03p' });
      if (pulse(t, 8) > .45) paint(rrPts(960 - 244, 470 - 318, 488, 636, 16, 1), { wash: INK.paper, ink: null });
      const mA = emotions(lt, [[1.12, 'nervous'], [1.7, 'sad'], [2.3, 'disgusted']], { take: .8 });
      A_(1560, GY, 27, { ...mA, view: 'q', flip: true, lookX: -.9, boilKey: 'A03b' });
    }
    camEnd();
    regMarks(.4);
    wipe(lt, dur);
  }

  // ================================================================
  // S04 · 8.48–12.24 · 我总说 可能问题源于你的视力太好
  // A 举视力表打分；「视力太好」镜头怼进 B 的脸，B 眼睛亮成星星
  // ================================================================
  function s04(t, lt, dur) {
    const push = easeIn(seg(t, 11.04, 12.0));
    setKick(kickOf(t, [bp(7, 1), bp(8, 1)], 9));
    camBegin(lerp(940, 1120, push), lerp(680, 620, push), lerp(1.02, 1.85, push));
    paperBase();
    plate(rectPts(-900, -900, W + 1800, 1180), 'blue', { wash: mixCol(INK.blue, INK.paper, .62) });
    tone(-300, -200, W + 600, 900, 'blue', '20', true);
    plate(rectPts(-900, GY, W + 1800, 900), 'blue', { wash: mixCol(INK.blue, INK.paper, .28) });
    eyeChart(520, 430, 250);
    const mA = emotions(lt, [[0, 'smug'], [1.1, 'proud']], { take: .7 });
    A_(560, GY, 28, { ...mA, aR: 1.45, aL: -1.15, view: 'q', lookX: .8, boilKey: 'A04' });
    // B 揉眼 → 怼脸 → 星星眼
    const rub = Math.sin(lt * 9) * .5 + .5;
    const mB = emotions(lt, [[0, 'confused'], [1.6, 'thinking'], [2.56, 'starstruck']], { take: 1 });
    B_(1180, GY, 29, { ...mB, view: 'front', aL: lt < 2.5 ? -1.2 + .3 * rub : mB.aL, aR: lt < 2.5 ? -1.2 - .3 * rub : mB.aR, boilKey: 'B04' });
    if (lt > 2.56) for (let i = 0; i < 5; i++) { boilSeed('sp04' + i); paint(starPts(1000 + i * 90, 400 - 60 * hash(i), 10 + 8 * hash(i + 3), .4, 4, t * 2 + i), { wash: i % 2 ? INK.pink : INK.clay, ink: null }); }
    camEnd();
    regMarks(.4);
    wipe(lt, dur);
  }

  // ================================================================
  // S05 · 12.24–16.32 · 总说你正在衰老 害怕我会被拐跑 baby
  // A 把 B 举过头顶"拐跑"，走到一半被绊倒压成饼；B 坐在他背上笑
  // ================================================================
  function s05(t, lt, dur) {
    setKick(kickOf(t, [bp(9, 1), bp(10, 1)], 10));
    const trip = seg(t, 14.64, 15.1);
    const cx = lerp(420, 1450, ease(seg(lt, .3, 2.4)));
    const sh = shakeXY(t, Math.abs(kickOf(t, [14.78], 14)) * .5);
    camBegin(960 + sh[0], 640 + sh[1], 1.05 - .12 * ease(trip));
    paperBase();
    plate(rectPts(-900, -900, W + 1800, 1180), 'blue', { wash: mixCol(INK.blue, INK.paper, .55) });
    tone(-300, 0, W + 600, 800, 'blue', '30');
    plate(rectPts(-900, GY, W + 1800, 900), 'blue', { wash: INK.blueDk });
    // 路过的小石头（绊脚的伏笔）
    boilSeed('rock');
    paint(ellPts(1250, GY + 8, 34, 14, 10), { wash: mixCol(INK.blue, INK.paper, .35), ink: INK.ink, sw: 1.4 });
    const mB2 = emotions(lt, [[0, 'surprised'], [.9, 'laugh'], [2.4, 'laugh'], [2.9, 'shy']], { take: .9 });
    const mB3 = emotions(lt, [[0, 'surprised'], [.9, 'laugh'], [2.4, 'ko'], [3.0, 'laugh']], { take: .9 });
    if (trip < .5) {
      // 举高高走：B 在 A 头顶，小腿乱蹬
      A_(cx, GY, 27, { ...feel('determined', o2(lt)), view: 'side', walk: lt * 5, boilKey: 'A05' });
      B_(cx + 14, GY - 190, 20, { ...mB2, view: 'front', rot: .06 * Math.sin(lt * 7), boilKey: 'B05' });
      if (t < 13.6) for (let i = 0; i < 3; i++) { boilSeed('dust' + i); paint(ellPts(cx - 60 - i * 40, GY + 6, 12 - i * 3, 7 - i * 1.6, 8), { wash: mixCol(INK.blue, INK.paper, .5), ink: null }); }
    } else {
      // 摔：A 压成饼，B 坐背上
      const fall = ease(trip);
      const fx = lerp(cx, 1380, easeOut(trip));
      A_(fx, GY + 16 * fall, 27, { ...feel(trip < .8 ? 'scared' : 'ko', o2(lt)), sq: .3 * fall, rot: .18 * fall, view: 'q', boilKey: 'A05b' });
      B_(fx + 30, GY - 60 * (1 - fall) - 96 * fall, 20, { ...mB3, view: 'front', boilKey: 'B05b' });
      if (trip > .6 && trip < .9) { boilSeed('pop05'); for (let i = 0; i < 7; i++) paint(ellPts(fx + (hash(i) - .5) * 260, GY - 40 - hash(i + 5) * 160, 9, 9, 7), { wash: i % 2 ? INK.pink : INK.clay, ink: null }); }
    }
    camEnd();
    regMarks(.4);
    wipe(lt, dur);
  }

  // ================================================================
  // S06 · 16.32–19.12 · 我从没忘记爱慕你的初衷
  // 回忆：整版被蓝版洗掉，只剩两个小的他们在纸上第一次遇见；一张纸票从 A 递到 B
  // ================================================================
  function s06(t, lt, dur) {
    setKick(kickOf(t, [bp(11, 1)], 6));
    camBegin(960, 620, lerp(1.1, .98, ease(seg(lt, 0, 2.4))));
    paperBase();
    plate(rectPts(-900, -900, W + 1800, 1180), 'blue', { wash: mixCol(INK.blue, INK.paper, .34) });
    tone(-400, -300, W + 800, 1300, 'blue', '40', true);
    plate(rectPts(-900, 720, W + 1800, 900), 'blue', { wash: mixCol(INK.blueDk, INK.paper, .2) });
    dotDisc(1480, 300, 150, mixCol(INK.blue, INK.paper, .55), 8);
    // 两个小小的他们（回忆里更小）
    const giv = seg(t, 17.6, 18.2);
    A_(800, 760, 21, { ...feel(lt > 1.3 ? 'shy' : 'thinking', o2(lt)), view: 'q', lookX: .7, boilKey: 'A06' });
    B_(1130, 760, 20, { ...feel(lt > 1.2 ? 'surprised' : 'bored', o2(lt)), view: 'q', flip: true, lookX: -.7, boilKey: 'B06' });
    if (giv > 0 && giv < 1) {
      const [px, py] = arcPt([860, 700], [1080, 700], 90, giv);
      push(); translate(px, py); rotate(giv * 2.4 - .4);
      paint(rectPts(-34, -14, 68, 28, 2), { wash: INK.cream, ink: mixCol(INK.blue, INK.ink, .4), sw: 1.6 });
      pop();
    }
    // 全帧蓝洗：把两个人也洗进回忆里（他们之上再罩一层蓝）
    plate(rectPts(-900, -900, W + 1800, 2400), 'blue', { wash: mixCol(INK.blue, INK.paper, .62) });
    // 漂着的纸白小心心
    for (let i = 0; i < 4; i++) {
      const yy = 560 - ((t * 26 + i * 160) % 460);
      boilSeed('h06' + i);
      paint(ellPts(360 + i * 260, yy, 13, 10, 10), { wash: INK.pink, washOp: 130, ink: null });
      paint(ellPts(360 + i * 260 - 6, yy - 4, 6, 5, 8), { wash: INK.pink, washOp: 130, ink: null });
    }
    camEnd();
    regMarks(.24);          // 回忆里规矩线歪得最厉害
    wipe(lt, dur);
  }

  // ================================================================
  // S07 · 19.12–22.40 · 迷恋你的特别 尽管我们都很普通
  // 长椅并肩；「特别」B 变 pose；「普通」两人对视，长椅底下长出正红和一朵小花
  // ================================================================
  function s07(t, lt, dur) {
    setKick(kickOf(t, [bp(13, 1), bp(14, 1)], 9));
    camBegin(960 + wob(t, .1) * 26, 660, 1.06 + .04 * ease(seg(lt, 0, 3)));
    paperBase();
    plate(rectPts(-900, -900, W + 1800, 1180), 'blue', { wash: mixCol(INK.blue, INK.paper, .66) });
    tone(-300, -100, W + 600, 850, 'blue', '20', true);
    plate(rectPts(-900, GY, W + 1800, 900), 'blue', { wash: mixCol(INK.blue, INK.paper, .34) });
    // 长椅
    boilSeed('bench07');
    paint(rectPts(660, 700, 600, 26, 3), { wash: mixCol(INK.pink, INK.paper, .3), ink: INK.ink, sw: 2 });
    paint(rectPts(660, 640, 600, 22, 3), { wash: mixCol(INK.pink, INK.paper, .3), ink: INK.ink, sw: 2 });
    for (const lx of [700, 1200]) paint(rectPts(lx, 726, 22, 104, 2), { wash: INK.blueDk, ink: INK.ink, sw: 1.8 });
    // 「普通」(21.6) 起：椅底正红在两人中间生长
    const red = ease(seg(t, 21.36, 22.4));
    if (red > 0) paint(ellPts(960, GY + 20, 40 + 180 * red, 24 + 60 * red, 24), { wash: INK.red, washOp: 210 * red, ink: null });
    // 两人坐着（view q，腿收起来）
    const poseB = step(lt, [[0, 'shy'], [.72, 'playful'], [2.24, 'shy']]);
    const mB = emotions(lt, [[0, 'shy'], [.72, 'playful'], [2.24, 'hopeful']], { take: .8 });
    B_(1100, 716, 25, { ...mB, view: 'q', noLegs: true, flip: true, lookX: lt > 2.2 ? -1 : -.2, boilKey: 'B07' });
    const mA = emotions(lt, [[0, 'happy'], [2.24, 'love']], { take: .8 });
    A_(820, 716, 26, { ...mA, view: 'q', noLegs: true, lookX: lt > 2.2 ? 1 : .2, boilKey: 'A07' });
    // 茶杯热气
    for (let i = 0; i < 3; i++) { boilSeed('tea' + i); paint(ellPts(700 + i * 8 + Math.sin(t * 2.6 + i) * 6, 590 - i * 26, 9 - i * 2, 12 - i * 2.4, 8), { wash: mixCol(INK.blue, INK.paper, .3), washOp: 110, ink: null }); }
    paint(rrPts(680, 606, 44, 34, 6, 1), { wash: INK.cream, ink: INK.ink, sw: 1.6 });
    // 「普通」那拍中间开一朵小花
    if (red > .3) {
      const fl = backOut((red - .3) / .7);
      boilSeed('fl07');
      for (let p2 = 0; p2 < 6; p2++) { const a = p2 / 6 * TAU + t * .4; paint(ellPts(960 + Math.cos(a) * 16 * fl, GY - 60 * fl + Math.sin(a) * 16 * fl, 11 * fl, 11 * fl, 8), { wash: INK.pink, ink: null }); }
      paint(ellPts(960, GY - 60 * fl, 8 * fl, 8 * fl, 8), { wash: INK.ochre, ink: null });
    }
    camEnd();
    regMarks(.42);
    wipe(lt, dur);
  }

  // ================================================================
  // S08 · 22.40–25.60 · 光阴的故事 说实话没经历也不懂
  // 桌上一摞老照片，每拍翻起一张（迷你回忆：初遇/长椅/小太阳）；A 在旁边翻，B 托腮听
  // ================================================================
  function s08(t, lt, dur) {
    setKick(kickOf(t, [bp(15, 1), bp(16, 1)], 8));
    camBegin(960, 620, 1.08 + .06 * ease(seg(lt, 0, 2.6)));
    paperBase();
    plate(rectPts(-900, -900, W + 1800, 1180), 'warm', { wash: mixCol(INK.warm, INK.paper, .86) });
    tone(-300, -200, W + 600, 1000, 'blue', '10', true);
    plate(rectPts(-900, 760, W + 1800, 800), 'blue', { wash: mixCol(INK.blue, INK.paper, .42) });
    // 一摞照片（桌角透视）
    for (let i = 0; i < 5; i++) {
      boilSeed('stk08' + i);
      paint(rectPts(700 + i * 5, 700 - i * 9, 520, 16, 2), { wash: mixCol(INK.cream, INK.paper, .1 * i), ink: INK.ink, sw: 1.2 });
    }
    // 每拍翻起一张，上面是迷你回忆
    const b0 = beatN(t);
    for (let k = 0; k < 4; k++) {
      const tb = B((Math.floor(bpOf(t)) - k));
      const a = seg(t, tb, tb + .8); if (a <= 0 || a >= 1) continue;
      const idx = ((b0 - k) % 4 + 4) % 4;
      const px = 760 + idx * 40, py = 690 - a * 640, rot = a * (idx % 2 ? .9 : -.9);
      const sc = 1 + a * .8;
      push(); translate(px, py); rotate(rot); scale(sc);
      paint(rectPts(-190, -130, 380, 260, 4), { wash: INK.cream, ink: INK.ink, sw: 1.8 });
      if (idx === 0) { paint(ellPts(-80, -30, 52, 52, 16), { wash: INK.ochre, washOp: 160, ink: null }); clawd(-20, 96, 7, feel('happy', 1), { boilKey: 'm08a' }); clawd(60, 96, 6.4, { ...feel('shy', 1), col: INK.pink, dk: INK.pinkDk, lt: INK.pinkLt, boilKey: 'm08b' }); }
      else if (idx === 1) { inkLine([[-150, 60], [150, 58]], 2.4, INK.blue, 'ink', 0); clawd(-60, 58, 7, feel('love', 1), { boilKey: 'm08c' }); clawd(50, 58, 6.6, { ...feel('laugh', 1), col: INK.pink, dk: INK.pinkDk, lt: INK.pinkLt, boilKey: 'm08d' }); }
      else if (idx === 2) { paint(ellPts(0, -40, 70, 44, 18), { wash: INK.red, washOp: 120, ink: null }); clawd(0, 80, 7, feel('hopeful', 1), { boilKey: 'm08e' }); }
      else { dotDisc(-70, -20, 46, INK.pink, 6); clawd(50, 80, 7, feel('starstruck', 1), { boilKey: 'm08f' }); }
      pop();
    }
    // A 翻照片，B 托腮
    const mA = emotions(lt, [[0, 'thinking'], [1.4, 'sad'], [2.6, 'hopeful']], { take: .7 });
    A_(380, GY, 26, { ...mA, aR: 1.1 + .2 * Math.sin(lt * 3), lookX: .8, view: 'q', boilKey: 'A08' });
    B_(1560, GY, 25, { ...feel('bored', o2(lt)), view: 'q', flip: true, aL: -.9, aR: -.9, lookX: -.8, boilKey: 'B08' });
    camEnd();
    regMarks(.38);
    wipe(lt, dur);
  }

  // ================================================================
  // S09 · 25.60–29.92 · 也只能珍惜眼前 为了不成为它的附庸 babe
  // A 按停挂钟 → 拉 B 起舞；「babe」B 亲他脸颊，正红炸开一圈
  // ================================================================
  function s09(t, lt, dur) {
    setKick(kickOf(t, [bp(17, 1), bp(18, 1)], 10));
    const stopAt = t > 26.8 ? 47.2 : null;
    const dance = t > 27.3;
    camBegin(960, 620, 1.05 + .03 * Math.sin(lt * .8));
    paperBase();
    plate(rectPts(-900, -900, W + 1800, 1180), 'blue', { wash: mixCol(INK.blue, INK.paper, .6) });
    tone(-300, -100, W + 600, 850, 'blue', '20', true);
    plate(rectPts(-900, GY, W + 1800, 900), 'blue', { wash: mixCol(INK.blue, INK.paper, .3) });
    wallClock(1500, 260, 120, t * 2.4, stopAt);
    // 按钟的那只手：26.3–26.8 A 的手臂伸过去
    const reach = seg(t, 26.3, 26.8);
    if (reach > 0 && reach < 1) {
      const [hx, hy] = arcPt([1180, 690], [1500, 330], 60, reach);
      paint(ribbon([[1180, 690], [(1180 + hx) / 2, 690 - 130], [hx, hy]], 22, 15), { wash: INK.clay, ink: INK.ink, sw: 1.6 });
    }
    // babe 亲脸：正红圈炸开
    const kiss = seg(t, 29.04, 29.6);
    if (kiss > 0) {
      const k = 1 - ease(kiss);
      paint(ellPts(700, 640, (1 - k) * 40 + 20, (1 - k) * 40 + 20, 20), { wash: INK.red, washOp: 230 * (1 - kiss * .6), ink: null });
      if (kiss < .9) paint(ellPts(700, 640, 60 + kiss * 200, 60 + kiss * 200, 26), { wash: INK.paper, washOp: 160 * (1 - kiss), ink: null });
    }
    // 两人：26.8 前 A 够钟，之后面对面跳舞（sway 卡拍）
    if (!dance) {
      A_(820, GY, 27, { ...feel(lt < 1.2 ? 'determined' : 'excited', o2(lt)), view: 'q', aR: reach > 0 ? 1.5 : .6, boilKey: 'A09' });
      B_(1120, GY, 25, { ...feel('surprised', o2(lt)), view: 'q', flip: true, lookX: -.8, boilKey: 'B09' });
    } else {
      const dk = seg(t, 27.3, 28.1);
      const ax = lerp(820, 880, dk), bx = lerp(1120, 1050, dk);
      A_(ax, GY, 27, { ...move('sway', t, 1), ...feel('happy', o2(lt)), view: 'q', flip: dk > .5, boilKey: 'A09b' });
      B_(bx, GY, 25, { ...move('sway', t, 2), ...feel(kiss > 0 ? 'shy' : 'playful', o2(lt)), view: 'q', flip: dk <= .5, boilKey: 'B09b' });
      // 舞步的纸白音符
      for (let i = 0; i < 2; i++) { boilSeed('n09' + i); paint(ellPts(bx + 90 + i * 50 + Math.sin(t * 3 + i) * 14, GY - 220 - i * 46 - ((t * 40) % 40), 9, 11, 8), { wash: INK.cream, ink: INK.ink, sw: 1.2 }); }
    }
    camEnd();
    regMarks(.4);
    wipe(lt, dur);
  }

  // ================================================================
  // S10 · 29.92–33.72 · 岁月划过指尖 一切像梦境实现
  // 梦境半调粉盘；两条手臂从对角伸向彼此，32.88 指尖相触 → 纸白星 + 一小滩正红；33.72 冻结
  // ================================================================
  const S10 = { touch: 32.88, freeze: 33.72 };
  function s10(t, lt, dur) {
    const frozen = t >= S10.freeze;
    const tt = frozen ? S10.freeze : t;
    setKick(kickOf(tt, [bp(19, 1), bp(20, 1)], 7) * (frozen ? 0 : 1));
    const meet = eio = ease(seg(tt, 30.6, S10.touch));
    camBegin(960, 660, lerp(1.16, 1.02, ease(seg(lt, 0, 1.4))));
    paperBase();
    plate(rectPts(-900, -900, W + 1800, 2400), 'pink', { wash: mixCol(INK.pink, INK.paper, .86) });
    tone(-400, -300, W + 800, 1300, 'pink', '10', true);
    dotDisc(960, 620, 430, mixCol(INK.pink, INK.paper, .78), 10);
    for (let i = 0; i < 6; i++) { boilSeed('ds10' + i); paint(starPts(240 + i * 300, 220 + 90 * hash(i + 2), 10 + 7 * hash(i), .42, 4, tt + i), { wash: INK.pink, ink: null }); }
    // 两条手臂（带宽窄变化的丝带）
    const hy = 640, hxL = lerp(430, 905, meet), hxR = lerp(1490, 1015, meet);
    boilSeed('armL10');
    paint(ribbon([[180, 980], [hxL - 210, hy + 130], [hxL, hy]], 46, 30), { wash: INK.clay, ink: INK.ink, sw: 2 });
    paint(ellPts(hxL, hy, 26, 22, 12), { wash: INK.clayLt, ink: INK.ink, sw: 1.8 });
    boilSeed('armR10');
    paint(ribbon([[1740, 980], [hxR + 210, hy + 130], [hxR, hy]], 44, 28), { wash: INK.pink, ink: INK.ink, sw: 2 });
    paint(ellPts(hxR, hy, 24, 21, 12), { wash: INK.pinkLt, ink: INK.ink, sw: 1.8 });
    // 相触：纸白星爆 + 正红小滩
    const tc = seg(tt, S10.touch, S10.touch + .3), ring3 = seg(tt, S10.touch, S10.touch + .84);
    if (tt > S10.touch) {
      paint(starPts(960, hy - 8, 20 + 90 * tc, .45, 4, tt), { wash: INK.paper, ink: INK.ink, sw: 1.6 });
      paint(ellPts(960, hy + 16, 30 + 70 * tc, 14 + 30 * tc, 18), { wash: INK.red, ink: null });
      if (ring3 < 1) paint(ellPts(960, hy, 80 + ring3 * 420, (80 + ring3 * 420) * .55, 30), { wash: INK.paper, washOp: 130 * (1 - ring3), ink: null });
      glow(960, hy, 200 + 160 * tc, '#FFC766', .5 * tc);
    }
    camEnd();
    regMarks(.4);
    if (frozen && t >= S10.freeze) { /* 冻结：什么都不动，下一镜来炸 */ }
    if (lt > dur - .02) flash(.6, INK.paper);
  }

  // ================================================================
  // S11 · 33.72–37.06 · 就算被苦痛肆虐 那也是很久之前
  // 33.72–34.52 冻结（指尖将触未触的画面冻住，套版慢慢漂走）→ 34.52 纸屑炸开、风起；
  // A 转身张开手臂挡在 B 前面；「很久之前」天色回暖
  // ================================================================
  function s11(t, lt, dur) {
    const frozen = t >= 33.72 && t < 34.52;
    const boom = t >= 34.52;
    const tt = frozen ? 33.72 : t;
    const calm = ease(seg(t, 35.68, 36.6));
    setKick(boom ? kickOf(t, [34.52], 16) * Math.exp(-(t - 34.52) * 2.2) : 0);
    const sh = boom && t < 35.2 ? shakeXY(t, 6 * Math.exp(-(t - 34.52) * 3)) : [0, 0];
    camBegin(960 + sh[0], 640 + sh[1], 1.04 + (frozen ? .03 * seg(t, 33.72, 34.5) : 0));
    paperBase();
    // 冻结时还是梦粉色，炸开后风蓝色灌进来，calm 后回暖
    const gcol = frozen ? mixCol(INK.pink, INK.paper, .86) : mixCol(mixCol(INK.blue, INK.paper, .52), mixCol(INK.pink, INK.paper, .86), calm * .8);
    plate(rectPts(-900, -900, W + 1800, 2400), frozen ? 'pink' : 'blue', { wash: gcol });
    tone(-400, -300, W + 800, 1300, frozen ? 'pink' : 'blue', frozen ? '10' : '40', true);
    if (frozen) dotDisc(960, 620, 430, mixCol(INK.pink, INK.paper, .78), 10);
    // 冻结：延续 S10 的手臂相触姿态
    if (frozen) {
      const meet = 1, hy = 640, hxL = 905, hxR = 1015;
      paint(ribbon([[180, 980], [hxL - 210, hy + 130], [hxL, hy]], 46, 30), { wash: INK.clay, ink: INK.ink, sw: 2 });
      paint(ellPts(hxL, hy, 26, 22, 12), { wash: INK.clayLt, ink: INK.ink, sw: 1.8 });
      paint(ribbon([[1740, 980], [hxR + 210, hy + 130], [hxR, hy]], 44, 28), { wash: INK.pink, ink: INK.ink, sw: 2 });
      paint(ellPts(hxR, hy, 24, 21, 12), { wash: INK.pinkLt, ink: INK.ink, sw: 1.8 });
      paint(starPts(960, hy - 8, 110, .45, 4, 33.8), { wash: INK.paper, ink: INK.ink, sw: 1.6 });
    }
    if (boom) {
      // 风的斜线：越早越密
      const wind = (1 - calm) * (1 - calm);
      for (let i = 0; i < 7; i++) {
        boilSeed('w11' + i + Math.floor(t * 8));
        const yy = 120 + i * 130 + (t * 260 % 130);
        inkLine([[-100, yy], [W / 2, yy - 60], [W + 100, yy - 110]], 3.4, mixCol(INK.blue, INK.paper, .3 + .3 * calm), 'dry', .3);
      }
      // 纸屑横飞
      for (let i = 0; i < 26; i++) {
        boilSeed('db11' + i);
        const sd = hash(i * 3.3), sp = 340 + sd * 420;
        const xx = frac(hash(i + 9) + t * sp / 2400) * (W + 300) - 150;
        const yy = 120 + hash(i + 4) * 760 + Math.sin(t * 3 + i) * 40;
        push(); translate(xx, yy); rotate(t * (2 + sd * 4) + i);
        paint(rectPts(-16 - sd * 12, -7, 32 + sd * 24, 14, 1), { wash: i % 3 === 0 ? INK.pink : i % 3 === 1 ? INK.clay : mixCol(INK.blue, INK.paper, .4), ink: null });
        pop();
      }
      // A 挡在 B 前面
      const mA = emotions(lt, [[.8, 'determined'], [2.0, 'furious'], [2.9, 'determined']], { take: 1 });
      A_(760, GY, 28, { ...mA, view: 'q', aL: 1.5, aR: 1.5, dy: -(mA.dy || 0) * 0 - 2 * Math.abs(Math.sin(bpOf(t) * Math.PI)) * (1 - calm), boilKey: 'A11' });
      B_(1040, GY, 25, { ...feel(boom && t < 35.6 ? 'scared' : 'relieved', o2(lt)), view: 'q', flip: true, lookX: -.8, dx: -14, boilKey: 'B11' });
      // B 身后的蓝雾被 A 挡住
      if (calm < .5) plate(rectPts(1100, 240, 700, 640), 'blue', { wash: mixCol(INK.blue, INK.paper, .5), washOp: 160 * (1 - calm * 2) });
    }
    camEnd();
    regMarks(frozen ? .1 : .45);
    if (boom && t < 34.62) flash(1 - (t - 34.52) / .1, INK.paper);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6);
  }

  // ================================================================
  // S12 · 37.06–39.76 · 我们现在拥有所有 就像埋下了火种
  // 37.06–37.86 冻结（两人蹲在空火堆前）→ 37.86 粉版滚筒压过，火被点着；
  // 每拍火星往上蹦一粒；「火种」39.36 火苗跳高
  // ================================================================
  function s12(t, lt, dur) {
    const frozen = t >= 37.06 && t < 37.86;
    const tt = frozen ? 37.06 : t;
    const lit = t >= 37.86 ? ease(seg(t, 37.86, 38.5)) : 0;
    const popBig = seg(t, 39.36, 39.76);
    setKick(frozen ? 0 : kickOf(t, [bp(23, 1), bp(24, 1)], 9) + kickOf(t, [39.36], 13));
    camBegin(960, 640, lerp(1.04, 1.12, ss(seg(tt, 37.9, 39.7))) + .1 * popBig);
    function ss(x) { return x * x * (3 - 2 * x); }
    paperBase();
    plate(rectPts(-900, -900, W + 1800, 2400), 'blue', { wash: mixCol(INK.blueDk, INK.paper, lerp(.5, .3, lit)) });
    tone(-400, -300, W + 800, 1300, 'blue', frozen ? '20' : '50', true);
    plate(rectPts(-900, GY, W + 1800, 900), 'blue', { wash: mixCol(INK.warm, INK.paper, .12) });
    // 夜空星子（冻结时没有，点燃后亮起来）
    if (!frozen) for (let i = 0; i < 7; i++) { boilSeed('st12' + i); paint(starPts(180 + i * 260, 130 + 80 * hash(i + 6), 8 + 6 * hash(i), .4, 4, t + i), { wash: INK.cream, washOp: 200 * lit, ink: null }); }
    campFire(960, GY - 10, 46 * (1 + .5 * popBig), lit, tt);
    // 火星：每拍往上蹦
    if (lit > .1) for (let i = 0; i < 5; i++) {
      const ph2 = frac(bpOf(t) * .8 + i * .2), up = 1 - ph2;
      boilSeed('spark12' + i);
      paint(ellPts(960 + Math.sin(i * 2.4 + t) * 46, GY - 60 - ph2 * 260, 6 * up + 2, 6 * up + 2, 7), { wash: i % 2 ? INK.pink : INK.ochre, washOp: 230 * up * lit, ink: null });
    }
    // 两人蹲坐烤火
    const mA = emotions(lt, [[.8, 'hopeful'], [2.3, 'happy']], { take: .8 });
    A_(660, GY, 27, { ...mA, view: 'q', noLegs: true, aL: -.5, aR: .3, lookX: .7, lookY: .4, sq: .12, boilKey: 'A12' });
    B_(1280, GY, 25, { ...feel(lit > .3 ? 'happy' : 'nervous', o2(lt)), view: 'q', noLegs: true, flip: true, aL: .3, aR: -.5, lookX: -.7, lookY: .4, sq: .12, blush: lit * .6, boilKey: 'B12' });
    // 点燃那一下的暖光罩
    if (lit > 0) { glow(960, GY - 90, 420 * lit, '#FF9E5E', .4 * lit); plate(rectPts(-900, -900, W + 1800, 2400), 'red', { wash: INK.ochre, washOp: 26 * lit }); }
    camEnd();
    regMarks(.4);
    if (frozen && t < 37.2) flash(.5, INK.paper);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6);
  }

  // ================================================================
  // S13 · 39.76–43.28 · 现在我为你歌颂 就只管牵着我走
  // 唯一的横移长镜：两人牵手走过这张纸，路边是前几镜的道具（视力表/手机/挂钟/小花）
  // 「牵着我走」两人同时跳一下
  // ================================================================
  function s13(t, lt, dur) {
    setKick(kickOf(t, [bp(25, 1), bp(26, 1), bp(27, 1)], 9));
    const cx = lerp(700, 1300, ease(seg(lt, 0, 3.2)));
    const hopT = seg(t, 42.0, 42.5), hop = jump(t, 42.0, 42.5, 2.2);
    camBegin(cx, 640, 1.06);
    paperBase();
    plate(rectPts(-900, -900, W + 1800, 1180), 'blue', { wash: mixCol(INK.blue, INK.paper, .68) });
    // 天上的半调太阳跟着镜头慢漂（视差）
    dotDisc(lerp(300, 2200, -seg(lt, 0, 3.5) * 0) + 400 - lt * 60, 220, 130, mixCol(INK.ochre, INK.paper, .3), 9);
    plate(rectPts(-900, GY, W + 1800, 900), 'blue', { wash: mixCol(INK.blue, INK.paper, .3) });
    inkLine([[-900, GY], [W + 900, GY]], 2.4, mixCol(INK.blueDk, INK.paper, .2), 'ink', 0);
    // 路边道具（世界坐标，随镜头经过）：视力表、手机、挂钟、花
    const props = [[300, () => eyeChart(300, 560, 150)], [1050, () => phoneBox(1050, 520, 200, 300)],
                   [1900, () => wallClock(1900, 420, 90, 47.2, 47.2)], [2650, () => { for (let p2 = 0; p2 < 6; p2++) { const a = p2 / 6 * TAU; paint(ellPts(2650 + Math.cos(a) * 20, GY - 70 + Math.sin(a) * 20, 13, 13, 8), { wash: INK.pink, ink: null }); } paint(ellPts(2650, GY - 70, 9, 9, 8), { wash: INK.ochre, ink: null }); }]];
    for (const [, fn] of props) fn();
    // 两人牵手走（侧视图，走路循环；手臂相扣：A 在左 B 在右，靠近）
    const wk = bpOf(t) * .5;
    const bobA = -Math.abs(Math.sin(wk * Math.PI)) * .5;
    A_(905, GY + (hop.dy || 0) * 9, 28, { ...feel('proud', o2(lt)), view: 'side', walk: wk, dy: bobA + (hop.dy || 0) * 0, aR: 1.0, boilKey: 'A13' });
    B_(990, GY + (hop.dy || 0) * 9, 25, { ...feel('playful', o2(lt)), view: 'side', walk: wk + .5, dy: bobA - .2, flip: true, aL: 1.0, emote: 'music', boilKey: 'B13' });
    // 牵着的手：中间一条连着的 clay 短臂
    boilSeed('hold13');
    paint(ribbon([[950, GY - 118 + (hop.dy || 0) * 9], [968, GY - 110 + (hop.dy || 0) * 9]], 16, 14), { wash: INK.clay, ink: INK.ink, sw: 1.5 });
    // 脚下的音符点（每拍冒一个）
    boilSeed('note13' + beatN(t));
    paint(ellPts(760 + frac(bpOf(t)) * 60, GY + 10, 8, 5, 8), { wash: INK.clay, washOp: 170 * pulse(t, 5), ink: null });
    camEnd();
    regMarks(.42);
    wipe(lt, dur);
  }

  // ================================================================
  // S14 · 43.28–47.20 · Baby 我仰慕你的自然 你的优雅
  // B 的大特写：转一个圈；「优雅」摆出olin pose，花瓣落下、脚下开花；A 在画右只探半个头（爱心眼）
  // ================================================================
  function s14(t, lt, dur) {
    setKick(kickOf(t, [bp(27, 3), bp(28, 1), bp(28, 3)], 8));
    const z = lerp(1.0, 1.28, ease(seg(lt, 0, 2.2)));
    camBegin(1090, 620, z);
    paperBase();
    plate(rectPts(-900, -900, W + 1800, 1180), 'pink', { wash: mixCol(INK.pink, INK.paper, .8) });
    tone(-300, -200, W + 600, 900, 'pink', '10', true);
    plate(rectPts(-900, GY, W + 1800, 900), 'blue', { wash: mixCol(INK.blue, INK.paper, .5) });
    // 大圆盘托着她（半调粉）
    dotDisc(1090, 700, 330, mixCol(INK.pink, INK.paper, .72), 9);
    // 转圈（43.9–44.6）一次；「优雅」45.28 起 摆 pose
    const spinK = seg(t, 43.9, 44.6);
    const flip = spinK > .45;
    const mB = emotions(lt, [[0, 'happy'], [.62, 'surprised'], [1.5, 'proud'], [2.0, 'starstruck']], { take: .9 });
    B_(1090, GY, 34, { ...mB, view: 'q', flip, dy: -Math.sin(spinK * Math.PI) * 3, rot: Math.sin(spinK * Math.PI) * .1,
      aL: lt > 2 ? -.85 : .9, aR: lt > 2 ? -.85 : .7, lookY: lt > 2 ? -.3 : 0, blush: lt > 2 ? .8 : .4, boilKey: 'B14' });
    // 花瓣（44.8「自然」起落）
    if (t > 44.8) for (let i = 0; i < 9; i++) {
      const sd = hash(i * 5.1);
      const yy = ((t * (70 + sd * 60) + sd * 1200) % 1300) - 80;
      boilSeed('pt14' + i);
      push(); translate(300 + sd * 1500 + Math.sin(t * 2 + i) * 34, yy); rotate(t * 2.4 + i);
      paint(ellPts(0, 0, 11, 6, 8), { wash: i % 2 ? INK.pink : INK.pinkLt, ink: null });
      pop();
    }
    // 脚下开花（拍上开一朵）
    const fb = beatN(t) % 3;
    if (t > 44) { boilSeed('fl14' + fb); for (let p2 = 0; p2 < 6; p2++) { const a = p2 / 6 * TAU + fb; paint(ellPts(820 + fb * 180 + Math.cos(a) * 14, GY - 26 + Math.sin(a) * 14, 9, 9, 8), { wash: INK.pinkLt, ink: null }); } paint(ellPts(820 + fb * 180, GY - 26, 6, 6, 8), { wash: INK.ochre, ink: null }); }
    // A 在画右探半个头
    const mA = emotions(lt, [[0, 'love'], [1.8, 'love'], [2.6, 'ko']], { take: .7 });
    A_(1660, GY + 40, 30, { ...mA, view: 'q', flip: true, lookX: -.9, dx: 1.2, boilKey: 'A14' });
    camEnd();
    regMarks(.4);
    wipe(lt, dur);
  }

  // ================================================================
  // S15 · 47.20–50.60 · Baby 我会大声向你表白 虽然肉麻
  // A 站上照片堆成的演讲台，饭盒盖全开大喊——正红声浪一圈圈推出去；
  // 49.44「肉麻」B 捂脸笑；49.9 定格：整帧变成贴在墙上的纸，规矩线归位，纸角一粒陶土点
  // ================================================================
  function s15(t, lt, dur) {
    const poster0 = 49.9;
    const isPoster = t >= poster0;
    const draw = (tt, sc = 1, ox = 0, oy = 0) => {
      push(); translate(ox, oy); scale(sc);
      paperBase();
      plate(rectPts(-900, -900, W + 1800, 2400), 'blue', { wash: mixCol(INK.blue, INK.paper, .6) });
      tone(-300, -200, W + 600, 1000, 'blue', '20', true);
      plate(rectPts(-900, 820, W + 1800, 700), 'blue', { wash: mixCol(INK.blue, INK.paper, .3) });
      dotDisc(1430, 320, 210, mixCol(INK.ochre, INK.paper, .25), 9);
      // 照片堆演讲台
      for (let i = 0; i < 4; i++) { boilSeed('pod15' + i); paint(rectPts(700 + i * 4, 850 - i * 14, 420, 16, 2), { wash: INK.cream, ink: INK.ink, sw: 1.4 }); }
      // 表白：48.16 起 lid 全开
      const shout = seg(tt, 48.16, 49.3);
      const cover = seg(tt, 49.44, 49.8);
      const mA = emotions(lt, [[0, 'nervous'], [.5, 'determined'], [.96, 'furious']], { take: 1.2 });
      A_(820, 800 - 0, 30, { ...mA, view: 'front', lid: shout > 0 ? Math.min(1, shout * 3) : 0, aL: 1.4, aR: 1.4, dy: -Math.abs(Math.sin(bpOf(tt) * Math.PI)) * 1.4, boilKey: 'A15' });
      // 正红声浪：一圈圈往外推
      if (shout > 0) for (let i = 0; i < 3; i++) {
        const a = seg(tt, 48.2 + i * .34, 49.3 + i * .34);
        if (a > 0 && a < 1) paint(ellPts(820, 700, 120 + a * 560, (120 + a * 560) * .6, 30), { wash: INK.red, washOp: 150 * (1 - a), ink: null });
      }
      // B：捂脸笑
      const mB = emotions(lt, [[0, 'surprised'], [.9, 'laugh'], [2.2, 'shy']], { take: .9 });
      B_(1330, GY, 28, { ...mB, view: 'q', flip: true, aL: cover > 0 ? -1.35 : .9, aR: cover > 0 ? -1.35 : .5, dx: cover * .4, blush: .8, lookX: -.7, boilKey: 'B15' });
      pop();
    };
    if (!isPoster) {
      const sh = shakeXY(t, Math.abs(kickOf(t, [48.16], 8)) * .4);
      camBegin(930 + sh[0], 620 + sh[1], lerp(1.0, 1.08, ss(seg(t, 47.2, 49.4))));
      function ss(x) { return x * x * (3 - 2 * x); }
      draw(t);
      camEnd();
      regMarks(.4);
    } else {
      // 定格：整帧缩成一张贴在墙上的纸
      const fold = ease(seg(t, poster0, 50.3));
      camBegin(960, 560, 1);
      paperBase();
      plate(rectPts(-900, -900, W + 1800, 2400), 'blue', { wash: mixCol(INK.blueDk, INK.paper, lerp(.6, .44, fold)) });
      const fw = lerp(W + 500, 660, fold), fh = lerp(H + 500, 442, fold);
      const cx0 = 960, cy0 = lerp(540, 566, fold);
      paint(rectPts(cx0 - fw / 2 - 15, cy0 - fh / 2 - 15, fw + 30, fh + 30, 2), { wash: mixCol(INK.paper, INK.blueDk, .3), ink: null });
      push(); translate(cx0 - fw / 2, cy0 - fh / 2); scale(fw / W, fh / H); draw(poster0 - .001); pop();
      paint(rectPts(cx0 - fw / 2, cy0 - fh / 2, fw, fh, 1.5), { ink: mixCol(INK.blue, INK.ink, .5), sw: 2.2 });
      // 折痕 + 胶带
      paint([[cx0 - fw / 2, cy0 - fh / 2], [cx0, cy0 + fh * .05], [cx0 + fw / 2, cy0 - fh / 2]], { wash: INK.paper, ink: null });
      inkLine([[cx0 - fw / 2, cy0 - fh / 2], [cx0, cy0 + fh * .05], [cx0 + fw / 2, cy0 - fh / 2]], 1.8, mixCol(INK.blue, INK.ink, .35), 'inkfine', 0);
      boilSeed('tape15');
      paint(rectPts(cx0 - 52, cy0 - fh / 2 - 14, 104, 28, 2), { wash: mixCol(INK.cream, INK.blue, .18), ink: null });
      // 纸角那粒陶土点：全片最后一样东西
      if (fold > .75) paint(ellPts(cx0 + fw / 2 - 28, cy0 + fh / 2 - 24, 10, 10, 10), { wash: INK.clay, ink: null });
      camEnd();
      regMarks(.95);        // 抱住/表白那一刻，规矩线第一次归位
    }
    if (lt < .1) flash(.7, INK.paper);
  }

  shots([
    [0.00, s01], [2.88, s02], [5.36, s03], [8.48, s04], [12.24, s05], [16.32, s06],
    [19.12, s07], [22.40, s08], [25.60, s09], [29.92, s10], [33.72, s11], [37.06, s12],
    [39.76, s13], [43.28, s14], [47.20, s15],
  ]);
})();
