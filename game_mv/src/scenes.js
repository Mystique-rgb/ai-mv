// scenes.js: 《最美的期待》42s · 综艺节奏扁平 · 13 镜。
// 每个镜头画满整帧，且只是 t 的纯函数（并行渲帧，不能有跨帧状态）。

const GY = 830;            // 常用地面线
const CX = 960, CY = 540;

// 圆形舞台：底盘 + 墨圈 + 放射条纹（旋转）
function stageDisc(cx, cy, r, base, stripe, rot, k = 1) {
  if (k <= .001) return;
  push(); translate(cx, cy); scale(k, k);
  const p = ellPts(0, 0, r, r, 60);
  clipTo(p, () => {
    paint(p, { wash: base, ink: null });
    for (let i = 0; i < 8; i++) {
      const a0 = rot + i / 8 * TAU, a1 = a0 + TAU / 16;
      paint([[0, 0], [Math.cos(a0) * r * 1.3, Math.sin(a0) * r * 1.3], [Math.cos(a1) * r * 1.3, Math.sin(a1) * r * 1.3]], { wash: stripe, ink: null });
    }
  });
  inkLine(p.slice(0, 60).concat([p[0]]), 1.6, PAL.ink, 'ink', 0);
  pop();
}
// 摩天轮
function ferris(cx, cy, r, rot, col) {
  disc(cx, cy, r * .1, PAL.cream);
  for (let i = 0; i < 8; i++) {
    const a = rot + i / 8 * TAU;
    inkLine([[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]], 1.1, PAL.ink, 'ink', 0);
    const hx = cx + Math.cos(a) * r, hy = cy + Math.sin(a) * r;
    paint(rrPts(hx - 46, hy - 40, 92, 80, 16), { wash: i % 2 ? col : PAL.cream, ink: PAL.ink, sw: .9 });
  }
  ringOut(cx, cy, r, 12, PAL.ink);
  ringOut(cx, cy, r, 6, col);
}
// 大眼泪（水滴形）
function dropPts(x, y, s) {
  const p = [];
  for (let i = 0; i < 26; i++) { const a = Math.PI * .28 + i / 25 * Math.PI * 1.15; p.push([x + Math.cos(a) * s * .78, y + Math.sin(a) * s * .9]); }
  p.push([x, y - s * 1.55]);
  return p;
}
function umbrella(x, y, s, open, col, ink = PAL.ink) {
  const w = s * open;
  if (open > .05) {
    const p = [];
    for (let i = 0; i <= 20; i++) { const a = Math.PI + i / 20 * Math.PI; p.push([x + Math.cos(a) * w, y + Math.sin(a) * w * .62]); }
    paint(p, { wash: col, ink, sw: 1 });
    for (let i = 1; i < 4; i++) { const a = Math.PI + i / 4 * Math.PI; inkLine([[x, y], [x + Math.cos(a) * w, y + Math.sin(a) * w * .62]], .5, ink, 'inkfine', 0); }
  }
  inkLine([[x, y], [x, y + s * 1.15]], .8, ink, 'ink', 0);
  inkLine([[x, y + s * 1.15], [x + s * .22, y + s * 1.15]], .8, ink, 'ink', 0);
}
function eyeBig(cx, cy, rx, ry, open, pupilR, irisCol, pupilCol = PAL.ink) {
  paint(ellPts(cx, cy, rx, ry, 60), { wash: PAL.paper, ink: PAL.ink, sw: 1.4 });
  const k = clamp(open);
  if (k > .02) {
    const ry2 = ry * k;
    paint(ellPts(cx, cy, pupilR * 1.75, Math.min(ry2, pupilR * 1.75), 40), { wash: irisCol, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(cx, cy, pupilR, Math.min(ry2, pupilR), 36), { wash: pupilCol, ink: null });
  }
}
// 圆点：一帧内不抖（平面风格），只在拍上 pop
function popDisc(x, y, r, col, age, life = .4) {
  if (age < 0 || age > life) return;
  const k = backOut(clamp(age / .18)) * (1 - ease(seg(age, life * .75, life)));
  disc(x, y, r * k, col);
}

// ============================== S01 睁眼 ==============================
function S01(t, lt, dur) {
  bg(PAL.cream);
  rays(CX, CY, mixCol(PAL.cream, PAL.yellow, .55), 18, lt * .1, 2600, .38);
  const open = ease(seg(lt, .04, .40));
  const morph = seg(lt, 1.12, 1.52);

  // ---- 第一段：眼睛 ----
  if (morph < 1) {
    const z = lerp(1.34, 1, ease(seg(lt, .40, 1.10))) * (1 - ease(morph));
    push();
    translate(CX, CY); scale(Math.max(.001, z)); translate(-CX, -CY);
    const ex = CX, ey = 520, rx = 760, ry = 430;
    eyeBig(ex, ey, rx, ry, open, 205, PAL.clay, PAL.ink);
    if (lt < 1.2) clipTo(ellPts(ex, ey, 205, Math.max(6, 205 * open), 36), () => { A(ex, ey + 70, 6.4, [[0, 'surprised']], { noShadow: true }); });
    if (open < .999) {
      const top = lerp(ey, ey - ry - 4, open), bot = lerp(ey, ey + ry + 4, open);
      paint(rectPts(-OS, -OS, W + 2 * OS, top + OS), { wash: PAL.clay, ink: null });
      inkLine([[-OS, top], [W + OS, top]], 2, PAL.ink, 'ink', 0);
      paint(rectPts(-OS, bot, W + 2 * OS, H + OS - bot), { wash: PAL.clay, ink: null });
      inkLine([[-OS, bot], [W + OS, bot]], 2, PAL.ink, 'ink', 0);
      for (let i = 0; i < 9; i++) {
        const x = lerp(ex - rx * .86, ex + rx * .86, i / 8);
        inkLine([[x, top], [x + (i - 4) * 5, top - 30]], 1, PAL.ink, 'ink', 0);
      }
    }
    pop();
  }

  // ---- 第二段：圆窗变成舞台 ----
  if (morph > 0) {
    const k = backOut(morph);
    // 放射条纹（在台面后面）
    const rot = lt * 1.0 + beatN(t) * .22;
    for (let i = 0; i < 6; i++) {
      const a = rot + i / 6 * TAU, w2 = .085 + .02 * pulse(t);
      paint([[CX, 830], [CX + Math.cos(a - w2) * 1800, 830 + Math.sin(a - w2) * 1800], [CX + Math.cos(a + w2) * 1800, 830 + Math.sin(a + w2) * 1800]],
        { wash: i % 2 ? PAL.yellow : PAL.orange, ink: null });
    }
    // 台面：一个圆的俯视地板
    push(); translate(CX, 830); scale(k, k); translate(-CX, -830);
    const fp = ellPts(CX, 830, 620, 166, 64);
    clipTo(fp, () => {
      paint([[-OS, -OS], [W + OS, -OS], [W + OS, H + OS], [-OS, H + OS]], { wash: PAL.paper, ink: null });
      for (let i = 0; i < 8; i++) {
        const a0 = rot * .5 + i / 8 * TAU, a1 = a0 + TAU / 16;
        paint([[CX, 830], [CX + Math.cos(a0) * 900, 830 + Math.sin(a0) * 900], [CX + Math.cos(a1) * 900, 830 + Math.sin(a1) * 900]], { wash: mixCol(PAL.paper, PAL.yellow, .3), ink: null });
      }
    });
    paint(fp, { ink: PAL.ink, sw: 1.6 });
        pop();

    // 他落下来
    const j = jump(t, 1.4, 1.68, 3.4);
    const look = kf(lt, [[2.1, 0], [2.26, -1], [2.46, 1], [2.6, 0]]);
    const emo = [[0, 'neutral'], [sh(1.42), 'surprised'], [sh(2.12), 'confused'], [sh(2.58), 'hopeful']];
    const raising = lt > 2.9;
    A(CX, 830 - 6, 33, emo, { dy: (lt < 1.9 ? j.dy : 0), sq: (lt < 1.9 ? j.sq : 0) + .03 * pulse(t), lookX: look, flip: look > .4, aR: raising ? 1.15 : .2, view: 'front' });

    // 人形空位（粉虚线）
    if (lt > 2.42) {
      const grow = ease(seg(lt, 2.42, 2.66));
      const gx = 1330, gh = 300 * grow;
      dashedShape(rrPts(gx - 145, 830 - gh, 290, gh, 84), PAL.pink, 9, 28, 20, 1);
      if (grow > .92) {
        inkLine([[gx - 58, 830 - gh], [gx - 40, 830 - gh - 42]], .9, PAL.pink, 'ink', 0);
        inkLine([[gx + 58, 830 - gh], [gx + 40, 830 - gh - 42]], .9, PAL.pink, 'ink', 0);
      }
    }
    // 手穿过去 → 碎成点
    if (lt > 2.86) {
      const kk = seg(lt, 2.86, 3.2);
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * TAU, d = 70 + 230 * easeOut(kk);
        popDisc(1330 + Math.cos(a) * d, 660 + Math.sin(a) * d * .95, 15 * (1 - kk * .4), PAL.pink, lt - 2.86 - i * .01, .5);
      }
    }
  }
}

// ============================== S02 永远 / 瞬间 ==============================
function S02(t, lt, dur) {
  bg(PAL.yellow);
  stripes(mixCol(PAL.yellow, PAL.ink, .18), 118, -.38, lt * 90, .42);
  floorBand(GY + 60, PAL.orange, 7, .9);

  // 甩镜：整段世界随镜头横移
  const pan = lt > 2.1 ? -lerp(0, 460, ease(seg(lt, 2.14, 2.58))) : 0;
  camBegin(CX + pan, CY, 1 + .06 * pulse(t, 4), 0);

  // 硬币当背板（转动的太阳/月亮两面），A 站在地面
  const spin = kf(lt, [[0, 0], [1.35, 24], [1.62, 27]], easeOut);
  const c = Math.cos(spin), sx = .62 + .38 * Math.abs(c);
  const cyR = 430, cx = CX;
  push(); translate(cx, 560); scale(sx, 1);
  paint(ellPts(0, 0, cyR, cyR, 56), { wash: PAL.cream, ink: PAL.ink, sw: 1.8 });
  ringOut(0, 0, cyR * .84, 11, PAL.ink);
  if (c >= 0) {   // 太阳面
    disc(0, -cyR * .26, cyR * .40, PAL.orange, PAL.ink, 1.3);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; inkLine([[Math.cos(a) * cyR * .54, -cyR * .26 + Math.sin(a) * cyR * .54], [Math.cos(a) * cyR * .74, -cyR * .26 + Math.sin(a) * cyR * .74]], 1.3, PAL.ink, 'ink', 0); }
  } else {        // 月亮面
    disc(0, -cyR * .26, cyR * .46, PAL.cream, PAL.ink, 1.3);
    paint(ellPts(cyR * .21, -cyR * .31, cyR * .40, cyR * .40, 38), { wash: PAL.yellow, ink: null });
  }
  pop();

  // A 站在地上，硬币在背后转
  if (lt > .3 && lt < 1.62) {
    const wob = lt > 1.62 ? 0 : Math.sin(lt * 16) * .05 * (lt > 1.35 ? 1 : .35);
    A(cx, 830, 32, [[0, 'neutral'], [sh(1.55), 'surprised'], [sh(1.9), 'smug']],
      { rot: wob, sq: .05 * pulse(t), dy: lt > 1.5 ? -.3 : 0 });
  }

  // 影子变成一排日历格，飞快向左滚（抬到腰线，不跟字幕抢）
  if (lt > 1.0) {
    const scroll = (lt - 1.0) * 620;
    for (let i = 0; i < 12; i++) {
      const x = -140 + i * 150 - (scroll % 150);
      if (x < -220 || x > W + 220) continue;
      card(x, 600, 118, 112, 16, i % 2 ? PAL.cream : PAL.paper, 12);
    }
  }
  // 跳进"瞬间"那一格
  if (lt > 1.6) {
    const k = seg(lt, 1.6, 2.06);
    const tx = 700, ty = 656;
    const p = arcPt([cx, 770], [tx, ty], 240, ease(k));
    if (k < 1) A(p[0], p[1], 30, [[0, 'excited']], { sq: -.12, rot: .2 });
    if (lt > 2.06) shards(tx, ty, 210, 14, lt - 2.06, [PAL.cream, PAL.orange, PAL.paper], .55);
  }

  // 1 帧反色
  if (lt > 2.6 && lt < 2.65) flash(.9, PAL.pink);
  camEnd();

  // 粉色幕布落下，只露两只眼
  if (lt > 2.66) {
    const k = ease(seg(lt, 2.66, 2.88));
    const y = lerp(-260, 470, k);
    paint(rectPts(-OS, -OS, W + 2 * OS, y + OS + 200), { wash: PAL.pink, ink: null });
    inkLine([[-OS, y], [W + OS, y]], 2.2, PAL.ink, 'ink', 0);
    // 幕布下的两只眼
    const ex = 830, ey = y + 120;
    paint(ellPts(ex, ey, 74, 84, 26), { wash: PAL.paper, ink: PAL.ink, sw: 1.2 });
    paint(ellPts(ex + 10 + Math.sin(lt * 9) * 12, ey, 30, 40, 22), { wash: PAL.ink, ink: null });
    paint(ellPts(ex + 300, ey, 74, 84, 26), { wash: PAL.paper, ink: PAL.ink, sw: 1.2 });
    paint(ellPts(ex + 310 + Math.sin(lt * 9) * 12, ey, 30, 40, 22), { wash: PAL.ink, ink: null });
  }
}

// ============================== S03 闭眼 · 你浮现 ==============================
function S03(t, lt, dur) {
  // 前 0.34s：眼皮合拢，把世界关掉
  const close = ease(seg(lt, 0, .34));
  bg(PAL.violet);
  dots(mixCol(PAL.violet, PAL.pink, .55), 132, 9, 0, -lt * 40, .55);
  // 失重：A 一直往下飘，镜头慢升
  const rise = lt * 46;
  camBegin(CX, CY + 40 - rise, 1.04, 0);
  const ay = 700 + lt * 40 + Math.sin(lt * 1.4) * 24;
  for (let i = 0; i < 7; i++) {
    const bx = 180 + hash(i + 1) * 1560, by = 900 + hash(i + 5) * 300 - ((lt * (34 + i * 6)) % 1300);
    ringOut(bx, by, 26 + 22 * hash(i + 9), 4, mixCol(PAL.violet, PAL.pink, .55), (1 - Math.abs(by - 540) / 700) * .5);
  }
  if (lt > .3) A(CX - 60, ay, 40, [[0, 'sleepy']], { view: 'q', aL: -.5, aR: -.5, rot: .06 * Math.sin(lt * 1.1) });

  // 粉点膨胀成 B
  if (lt > 1.3 && lt < 2.2) {
    const k = backOut(seg(lt, 1.34, 1.62));
    push(); translate(CX + 340, ay); scale(k, k); translate(-(CX + 340), -ay);
    B(CX + 340, ay, 40, [[0, 'hopeful']], { view: 'q', flip: true });
    pop();
  }
  // B 在他眼前晃手，他没反应
  if (lt >= 2.2 && lt < 3.1) {
    const wave = Math.sin((lt - 2.2) * 16) * .5;
    B(CX + 340, ay, 40, [[0, 'playful']], { view: 'q', flip: true, aR: 1.1 + wave });
  }
  // 他睁眼的那一帧：她消失，只剩一帧粉残影
  if (lt >= 3.1 && lt < 3.14) {
    silh(CX + 340, ay, 40, PAL.pink, { view: 'q', flip: true, aR: 1.1 });
  }
  if (lt > 3.1) {
    A(CX - 60, ay, 40, [[0, 'sleepy'], [sh(3.1), 'surprised']], { view: 'q' });
  }
  // 残影碎成点
  if (lt > 3.14) {
    for (let i = 0; i < 30; i++) {
      const x = CX + 120 + hash(i) * 460, y0 = ay - 300 * hash(i + 3);
      const fall = (lt - 3.14) * 120 * (.5 + hash(i + 7));
      popDisc(x, y0 + fall, 7 + 5 * hash(i + 11), PAL.pink, lt - 3.14 - i * .008, 1.6);
    }
  }
  // 追着粉点跑
  if (lt > 3.3) {
    const k = seg(lt, 3.3, dur);
    A(lerp(CX - 60, CX + 420, ease(k)), ay + 30, 40, [[0, 'determined']], { walk: k * 12, view: 'q', flip: false });
  }
  camEnd();
  // 合眼的那两片
  if (close < .999) {
    const mid = 540, top = lerp(-OS, mid, close), bot = lerp(H + OS, mid, close);
    paint(rectPts(-OS, -OS, W + 2 * OS, top + OS), { wash: PAL.clay, ink: null });
    paint(rectPts(-OS, bot, W + 2 * OS, H + OS - bot), { wash: PAL.clay, ink: null });
  }
}

// ============================== S04 坠落 · 寂寞的边缘 ==============================
function S04(t, lt, dur) {
  // 隧道
  bg(PAL.deep);
  const fall = seg(lt, 0, .95);
  for (let i = 0; i < 9; i++) {
    const k = frac(i / 9 + fall * 1.6);
    const r = 120 + k * 1500;
    ringOut(CX, CY, r, 6 + 26 * k, mixCol(PAL.deep, PAL.pink, .35 + .5 * (1 - k)), 1 - k * .5);
  }
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * TAU + lt * .6;
    inkLine([[CX + Math.cos(a) * 200, CY + Math.sin(a) * 200], [CX + Math.cos(a) * 1500, CY + Math.sin(a) * 1500]], .8, mixCol(PAL.deep, PAL.paper, .35), 'ink', 0);
  }
  // 掉下来
  if (lt < .95) {
    const y = lerp(250, 760, easeIn(fall));
    A(CX, y, 24, [[0, 'scared']], { sq: -.3, rot: fall * 1.4 });
  } else {
    // 落地：薄荷 + 波点 + 灰白圆盘
    bg(PAL.mint);
    dots(mixCol(PAL.mint, PAL.paper, .55), 128, 26, lt * 30, 0, .7);
    // 灰盘：边缘锯齿
    const dp = [];
    for (let i = 0; i < 64; i++) {
      const a = i / 64 * TAU, jag = (i % 2 ? 1 : .93) * (1 + .03 * Math.sin(i * 2.7));
      dp.push([CX + Math.cos(a) * 760 * jag, 880 + Math.sin(a) * 240 * jag]);
    }
    paint(dp, { wash: mixCol(PAL.paper, PAL.ink, .1), ink: PAL.ink, sw: 1.4 });
    // 盘外虚空已经开始掉渣
    const back = seg(lt, 1.5, 3.0);
    const ax = lerp(CX, 1560, ease(back));
    const j = lt < 1.3 ? jump(t, .95, 1.22, 1.6) : { dy: 0, sq: 0 };
    A(ax, 880 - 120 * back, 25, [[0, 'scared']], { dy: j.dy, sq: j.sq, flip: true, lookX: .5 });
    // 脚后跟踩空的碎屑
    if (lt > 2.2) for (let i = 0; i < 8; i++) {
      const age = lt - 2.2 - i * .06;
      popDisc(1560 + 30 + i * 14, 900 + (age) * 420, 12 - i, mixCol(PAL.paper, PAL.ink, .25), age, .8);
    }
    // 粉色的手从背后抱住
    if (lt > 2.6) {
      const k = backOut(seg(lt, 2.6, 2.92));
      const hx = ax, hy = 880 - 120 * back - 200;
      inkLine([[hx + 240 * k, hy + 150], [hx + 60, hy + 100], [hx - 60, hy + 100], [hx - 150 * k, hy + 120]], 3.4, PAL.pink, 'ink', .5);
      disc(hx - 150 * k, hy + 120, 34, PAL.pink);
    }
    if (lt > 3.1) flash(seg(lt, 3.1, 3.3) * .9, PAL.pink);
  }
}

// ============================== S05 游乐场 ==============================
function S05(t, lt, dur) {
  // 白场里先出两个剪影 → 上色
  const fill = ease(seg(lt, .12, .5));
  bg(PAL.paper);
  const orbit = ease(seg(lt, .3, 1.0));
  camBegin(CX, CY, lerp(1.9, 1, orbit), 0);

  bg(fill > .02 ? PAL.sky : PAL.paper);
  if (fill > .02) {
    rays(CX, 300, mixCol(PAL.sky, PAL.paper, .55), 20, lt * .1, 2400, .8 * fill);
    // 摩天轮 + 木马
    ferris(1420, 430, 250, lt * .22, PAL.yellow);
    disc(560, 700, 220, mixCol(PAL.sky, PAL.paper, .25), PAL.ink, 1.2);
    for (let i = 0; i < 4; i++) {
      const a = lt * .8 + i / 4 * TAU;
      paint(rrPts(560 + Math.cos(a) * 150 - 26, 700 + Math.sin(a) * 60 - 26, 52, 52, 12), { wash: i % 2 ? PAL.pink : PAL.cream, ink: PAL.ink, sw: .9 });
    }
    floorBand(GY + 60, PAL.ink, 7, .16);
    // 两个人（未上色时是剪影）
    const colA = mixCol(PAL.ink, PAL.clay, fill), colB = mixCol(PAL.ink, PAL.pink, fill);
    silh(760, GY, 30, colA, { view: 'q' });
    silh(1090, GY, 30, colB, { view: 'q', flip: true });
  }

  // 旋转木马上上下下（每拍换一次高低）
  if (lt > 1.0) {
    const bp = frac(bpOf(t));
    const up = Math.sin(bpOf(t) * Math.PI);
    A(700, GY - 200 * up, 26, [[0, 'happy']], { view: 'q', aL: .8, aR: .8 });
    B(1120, GY - 200 * (1 - up), 26, [[0, 'laugh']], { view: 'q', flip: true, aL: .8, aR: .8 });
  }
  // 是非：两块箭头牌从两边挤过来
  if (lt > 1.78 && lt < 2.34) {
    const k = ease(seg(lt, 1.78, 2.12));
    const x = lerp(-500, 380, k), x2 = lerp(W + 500, 1540, k);
    arrowBig(x, 470, 460, 190, 0, PAL.red);
    arrowBig(x2, 470, 460, 190, Math.PI, PAL.blue);
  }
  // 一拳打碎
  if (lt >= 2.3) {
    shards(430, 470, 300, 16, lt - 2.3, [PAL.red, PAL.blue, PAL.cream], .5);
    shards(1500, 470, 300, 16, lt - 2.34, [PAL.blue, PAL.red, PAL.cream], .5);
    A(700, GY, 27, [[0, 'happy'], [sh(2.3), 'determined']], { aR: 1.35, rot: -.1 });
  }
  // 伤悲：巨眼泪落下，B 撑粉伞
  if (lt > 2.62) {
    const fk = seg(lt, 2.62, 2.96);
    const dy = lerp(-700, 560, easeIn(fk));
    if (fk < 1) paint(dropPts(1120, dy, 150), { wash: PAL.blue, ink: PAL.ink, sw: 1.4 });
    const bend = lt > 2.96 ? Math.exp(-(lt - 2.96) * 6) * .22 : 0;
    push(); translate(1120, 560); rotate(bend); translate(-1120, -560);
    umbrella(1120, 560 - 40, 210, backOut(seg(lt, 2.88, 3.02)), PAL.pink);
    pop();
    if (lt > 2.96) {
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * TAU + hash(i) * .4;
        popDisc(1120 + Math.cos(a) * (80 + 200 * hash(i)), 520 + Math.sin(a) * 60, 10 + 10 * hash(i + 2), PAL.paper, lt - 2.96 - i * .01, .5);
      }
    }
  }
  camEnd();
}


// ============================== S06 无怨无悔 ==============================
function S06(t, lt, dur) {
  bg(PAL.red);
  rays(CX, 600, PAL.orange, 16, lt * .18, 2400, .45);

  // 伞张开 → 变成一朵小烟花
  if (lt < .55) {
    umbrella(CX, 560, 320, 1, PAL.pink);
  } else {
    const k = clamp((lt - .55) / .5);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU + k * .4, r = 160 + 520 * easeOut(k);
      popDisc(CX + Math.cos(a) * r, 560 + Math.sin(a) * r * .85, 16 * (1 - k * .5), i % 2 ? PAL.yellow : PAL.paper, k * .5, .6);
    }
  }

  // 信任倒：A 后仰，B 接住
  const gx = 960;
  if (lt > .5) {
    const fall = easeIn(seg(lt, .5, .78));
    A(gx - 210, 830, 30, [[0, 'happy'], [sh(.62), 'surprised'], [sh(1.0), 'laugh']], { rot: -1.25 * fall, aL: 1.1, aR: 1.1, dy: -.4 * fall });
    B(gx + 210, 830, 30, [[0, 'determined'], [sh(.72), 'hopeful']], { view: 'q', flip: true, aL: 1.2, aR: .9 });
    // 她张开手接住的那一下
    if (lt > .74 && lt < .92) inkLine([[gx - 210, 640], [gx - 30, 660]], .9, PAL.pink, 'ink', .4);
  }
  // 反打：B 也后仰，A 接住
  if (lt > 1.0 && lt < 1.44) {
    const fall = easeIn(seg(lt, 1.0, 1.26));
    A(gx - 210, 830, 30, [[0, 'determined']], { view: 'q', aL: 1.2, aR: .9 });
    B(gx + 210, 830, 30, [[0, 'happy'], [sh(1.14), 'laugh']], { view: 'q', flip: true, rot: 1.25 * fall, aL: 1.1, aR: 1.1 });
  }
  // 一起摔进糖堆，四肢朝天
  if (lt >= 1.44) {
    for (let i = 0; i < 9; i++) card(430 + i * 130, 690 + (i % 3) * 46, 120, 120, 18, i % 2 ? PAL.yellow : PAL.pink, 12);
    A(gx - 160, 760, 28, [[0, 'ko']], { rot: -1.5, dy: -.4 });
    B(gx + 160, 760, 28, [[0, 'ko']], { rot: 1.5, dy: -.4, flip: true });
  }
  // 慢动作：一拳打碎箭头牌
  if (lt > 1.86 && lt < 2.36) {
    const z = kf(lt, [[1.86, 1], [2.3, 1.5]]);
    camBegin(gx - 200, 700, z, 0);
    arrowBig(gx - 200, 700, 620, 240, 0, PAL.paper);
    A(gx - 620, 880, 30, [[0, 'determined']], { aR: 1.4, rot: -.12 });
    shards(gx - 280, 700, 260, 12, lt - 1.9, [PAL.paper, PAL.yellow, PAL.cream], .6);
    camEnd();
  }
  // 黑洞把世界吸走，两人被拉成面
  if (lt > 2.36) {
    const k = easeIn(seg(lt, 2.36, 2.92));
    for (let i = 0; i < 8; i++) {
      const r = lerp(1400, 60, k) * (1 - i * .07);
      ringOut(gx, 620, Math.max(8, r), 10 + i * 4, mixCol(PAL.red, PAL.ink, .6), .8);
    }
    disc(gx, 620, 60 + 40 * k, PAL.ink);
    if (k < .95) {
      A(lerp(gx - 210, gx - 20, k), lerp(830, 620, k), 30, [[0, 'scared']], { sq: -.35 * k, aL: 1.2, aR: 1.2 });
      B(lerp(gx + 210, gx + 20, k), lerp(830, 620, k), 30, [[0, 'scared']], { sq: -.35 * k, aL: 1.2, aR: 1.2, flip: true });
    }
  }
  // 另一侧：全白 → 放射爆
  if (lt > 2.92) {
    const k = ease(seg(lt, 2.92, 3.2));
    bg(PAL.paper);
    rays(CX, CY, PAL.yellow, 18, lt * 2, 2600, k);
    rays(CX, CY, PAL.pink, 9, -lt * 2, 2000, k * .8);
  }
}

// ============================== S07 跑 ==============================
function S07(t, lt, dur) {
  bg(PAL.yellow);
  const pan = lerp(0, 620, ease(seg(lt, .1, 2.4)));
  camBegin(CX + pan, CY, 1.02, 0);
  // 双色地板格
  const cell = 160;
  for (let gy = 600; gy < 1100; gy += cell) for (let gx = -OS; gx < W + OS; gx += cell) {
    const i = Math.floor(gx / cell), j = Math.floor(gy / cell);
    paint(rectPts(gx, gy, cell, cell), { wash: (i + j) % 2 ? PAL.yellow : PAL.pink, washOp: 120, ink: null });
  }
  gridLines(mixCol(PAL.yellow, PAL.ink, .35), cell, 3, 0, 0, .8);

  // 脚下格子一脚一脚亮起来
  const runX = lerp(520, 1180, ease(seg(lt, 0, 2.2)));
  for (let i = 0; i < 8; i++) {
    const bx = runX - 90 - i * cell, age = (i * .11) - (lt % .11);
    if (bx < -300) continue;
    paint(rectPts(bx, 660, cell - 8, 120), { wash: PAL.paper, washOp: 190 * (1 - i / 8), ink: null });
  }
  // 她跑在前面，回头笑
  const bxRun = lerp(1180, 1560, ease(seg(lt, 0, 2.2)));
  if (lt <= 2.26) B(bxRun, 780, 30, [[0, 'playful'], [sh(1.0), 'happy']], { view: 'q', flip: true, walk: bpOf(t) * 2.2, aR: lt > 1.0 ? 1.0 : .3 });
  // 他追
  const axRun = lerp(380, 1120, ease(seg(lt, 0, 2.24)));
  if (lt <= 2.26) A(axRun, 780, 30, [[0, 'determined'], [sh(1.5), 'excited']], { view: 'q', walk: bpOf(t) * 2.4, aR: lt > 1.5 ? 1.3 : .2, rot: .06 });

  // 标尺：手与手差一个手掌
  if (lt > 1.44 && lt < 1.86) {
    const x1 = axRun + 90, x2 = bxRun - 90;
    inkLine([[x1, 640], [x2, 640]], 1.1, PAL.ink, 'ink', 0);
    inkLine([[x1, 610], [x1, 670]], .9, PAL.ink, 'ink', 0);
    inkLine([[x2, 610], [x2, 670]], .9, PAL.ink, 'ink', 0);
    for (let i = 1; i < 4; i++) inkLine([[lerp(x1, x2, i / 4), 628], [lerp(x1, x2, i / 4), 652]], .5, PAL.ink, 'inkfine', 0);
  }
  // 加速：速度线
  if (lt > 1.8 && lt < 2.3) speedLines(axRun - 160, 760, 420, Math.PI, 7, PAL.ink, 8, .9, .5);
  // 她转身张臂，他撞进来
  if (lt > 2.26) {
    const k = ease(seg(lt, 2.26, 2.5));
    B(bxRun, 780, 30, [[0, 'happy']], { aL: 1.3, aR: 1.3, dy: -k * 1 });
    if (k < 1) A(lerp(axRun, bxRun - 60, k), 780 - 40 * k, 30, [[0, 'excited']], { aR: 1.3, rot: .3 * k });
    else if (lt < 2.88) { // 一起翻一个跟头
      const r = seg(lt, 2.5, 2.86) * TAU;
      push(); translate(bxRun, 700); rotate(r); translate(-bxRun, -700);
      A(bxRun - 40, 700, 28, [[0, 'laugh']], {});
      B(bxRun + 40, 700, 28, [[0, 'laugh']], { flip: true });
      pop();
    }
  }
  // 背靠背喘气
  if (lt >= 2.88) {
    const br = .04 * pulse(t, 3);
    A(800, 790, 30, [[0, 'relieved']], { view: 'q', sq: br });
    B(1090, 790, 30, [[0, 'relieved']], { view: 'q', flip: true, sq: br });
    // 粉纸屑
    for (let i = 0; i < 26; i++) {
      const x = hash(i) * W, y = -100 + ((lt - 2.9) * 380 + hash(i + 3) * 900) % 1100;
      paint(rrPts(x, y, 26, 14, 6), { wash: i % 3 ? PAL.pink : PAL.paper, ink: null });
    }
  }
  camEnd();
}

// ============================== S08 抽鼓 ==============================
function S08(t, lt, dur) {
  const drain = seg(lt, .86, 1.06);
  if (lt < .86) {
    bg(PAL.paper);
    // 全白一帧后，星芒里的两个人影
    rays(CX, 620, PAL.yellow, 24, lt * .5, 2800, .9);
    burstStar(CX, 620, 520 * (1 + .04 * pulse(t)), PAL.orange, 14, .5, lt * .3);
    // 他把她举起来
    const lift = ease(seg(lt, .12, .4));
    const by = 830 - 350 * lift;
    A(CX, 830, 30, [[0, 'determined'], [sh(.5), 'happy']], { aL: 1.7, aR: 1.7, dy: -.3 * lift });
    B(CX, by, 30, [[0, 'excited']], { aL: 1.4, aR: 1.4 });
    if (lift > .12) for (const sx2 of [-1, 1]) inkLine([[CX + sx2 * 96, 752], [CX + sx2 * 132, 690], [CX + sx2 * 112, 546]], 8, PAL.clay, 'ink', .4);
    // 转起来：离心力把她甩成一圈弧
    if (lt > .44) {
      for (let i = 0; i < 10; i++) {
        const a = i / 10 * TAU + lt * 2;
        ringOut(CX, 700, 260 + i * 12, 6, mixCol(PAL.pink, PAL.paper, i / 10), .5 - i * .04);
      }
    }
  } else {
    bg(PAL.ink);
    if (drain < 1) {
      // 抽色：只剩橙、粉、墨
      push(); drawingContext.globalAlpha = 1 - drain;
      rays(CX, 620, PAL.yellow, 24, lt * .5, 2800, .9);
      burstStar(CX, 620, 520, PAL.orange, 14, .5, lt * .3);
      pop();
    }
    A(CX - 250, 830, 30, [[0, 'determined'], [sh(1.0), 'scared']], { aL: 1.2, aR: 1.2 });
    B(CX + 250, 830, 30, [[0, 'excited'], [sh(1.0), 'scared']], { aL: 1.2, aR: 1.2, flip: true });
    // 两拍之后：黑底上两个点隔得很远
    if (lt > 1.3) {
      bg(PAL.ink);
      const k = seg(lt, 1.3, 2.4);
      const x1 = lerp(CX - 20, 300, ease(k)), x2 = lerp(CX + 20, 1620, ease(k));
      A(x1, 700, 26, [[0, 'nervous']], { view: 'q' });
      B(x2, 700, 26, [[0, 'scared']], { view: 'q', flip: true });
      // 心跳线
      const pts = [];
      for (let i = 0; i <= 40; i++) {
        const u = i / 40, x = lerp(x1 + 90, x2 - 90, u);
        const jit2 = (i % 4 === 0 ? -1 : 0) * (10 + 26 * pulse(t) * (1 - k));
        pts.push([x, 790 + Math.sin(u * Math.PI) * 40 * (1 - k) + jit2]);
      }
      inkLine(pts, 2.4, PAL.pink, 'ink', .3);
      // 绷紧 → 断
      if (lt > 2.4) {
        const brk = seg(lt, 2.4, 2.52);
        inkLine([[x1 + 90, 790], [lerp(x1 + 90, x2 - 90, brk) - 40, 790]], 2.4, PAL.pink, 'ink', 0);
        shards((x1 + x2) / 2, 790, 260, 12, lt - 2.4, [PAL.pink, PAL.paper], .4);
        flash(seg(lt, 2.52, 2.66), PAL.paper);
      }
    }
  }
}

// ============================== S09 副歌爆发 ==============================
function S09(t, lt, dur) {
  bg(PAL.orange);
  // 橙、粉两块对撞
  const hit = ease(seg(lt, 0, .28));
  if (lt < .34) {
    paint(rectPts(-OS, -OS, W / 2 + OS, H + 2 * OS), { wash: PAL.orange, washOp: 255, ink: null });
    paint(rectPts(W / 2, -OS, W / 2 + OS, H + 2 * OS), { wash: PAL.pink, ink: null });
    flash(.8 * (1 - hit), PAL.paper);
    ringOut(CX, CY, 120 + 1200 * hit, 40 * (1 - hit), PAL.paper, .8);
  }
  rays(CX, 700, mixCol(PAL.orange, PAL.yellow, .4), 20, lt * .2, 2800, .5);

  // 被抛上天 → 砸坑
  const land = 1.02;
  if (lt < .8) {
    const p = arcPt([640, 700], [600, 830], 520, ease(lt / .8));
    A(p[0], p[1], 30, [[0, 'excited']], { sq: -.2, aL: 1.5, aR: 1.5 });
    const q = arcPt([1280, 700], [1320, 830], 560, ease(lt / .8));
    B(q[0], q[1], 30, [[0, 'excited']], { sq: -.2, aL: 1.5, aR: 1.5, flip: true });
  } else {
    const j = lt < 1.3 ? jump(t, 1.02, 1.28, 2.2) : { dy: 0, sq: 0 };
    // 抱心
    const hug = seg(lt, 1.02, 1.3);
    if (lt < 1.6) {
      A(600, 830, 30, [[0, 'love']], { aL: 1.5, aR: 1.5, dy: j.dy });
      heart(960, 590, 330 * (1 + .05 * pulse(t)), PAL.pink, -.03);
      B(1320, 830, 30, [[0, 'laugh']], { aL: 1.4, aR: 1.4, flip: true });
    } else {
      // 心炸成 20 颗小心
      const k = seg(lt, 1.6, 2.3);
      A(600, 830, 30, [[0, 'love'], [sh(1.62), 'surprised']], { aL: 1.2, aR: 1.2 });
      B(1320, 830, 30, [[0, 'laugh']], { aL: 1.3, aR: 1.3, flip: true });
      for (let i = 0; i < 20; i++) {
        const a = i / 20 * TAU, d = 120 + 620 * easeOut(clamp(k - i * .01));
        heart(960 + Math.cos(a) * d, 620 + Math.sin(a) * d * .8 - 200 * k, 34 * (1 - k * .4), i % 2 ? PAL.pink : PAL.paper, a);
      }
    }
    // 巨眼睁开，他从眼里掉出来
    if (lt > 2.3) {
      bg(PAL.orange);
      rays(CX, CY, mixCol(PAL.orange, PAL.yellow, .4), 20, lt * .3, 2600, .4);
      const open = ease(seg(lt, 2.34, 2.56));
      if (open > .02) eyeBig(CX, 500, 620, 340, open, 210 * open, PAL.pink, PAL.ink);
      if (lt > 2.5) {
        const fy = lerp(520, 830, easeIn(seg(lt, 2.5, 2.78)));
        A(CX, fy, 30, [[0, 'surprised'], [sh(2.78), 'dizzy']], { rot: (lt - 2.5) * 6 });
      }
      B(1560, 830, 28, [[0, 'happy']], { aL: 1.2, aR: 1.2, flip: true });
    }
    // 搓眼 → 星星眼
    if (lt > 2.9) {
      A(CX - 100, 830, 34, [[0, 'dizzy'], [sh(3.02), 'starstruck']], { aL: .9, aR: .9, lookX: .4 });
    }
  }
}

// ============================== S10 她一直在 ==============================
function S10(t, lt, dur) {
  bg(PAL.cream);
  dots(mixCol(PAL.cream, PAL.yellow, .5), 132, 30, lt * 18, 0, .5);
  const pan = lerp(-520, 0, ease(seg(lt, 0, .62)));
  camBegin(CX + pan, CY, 1.02, 0);
  floorBand(850, PAL.ink, 7, .12);

  // 她一直在原地，头上落了一层"时间叶"
  const bx = 1220;
  if (lt < 1.0) {
    B(bx, 850, 36, [[0, 'hopeful']], { view: 'front' });
    for (let i = 0; i < 7; i++) {
      const lx = bx - 100 + hash(i) * 200, ly = 850 - 340 - hash(i + 2) * 44;
      paint(rrPts(lx, ly, 44, 22, 8), { wash: i % 2 ? PAL.pink : PAL.pinkLt, ink: PAL.ink, sw: .5 });
    }
    // 他从远处跑进画
    const pre = ease(seg(lt, .46, .96));
    if (lt > .46) A(lerp(-240, 300, pre), 850, 26, [[0, 'determined']], { view: 'q', walk: pre * 10, aL: 1.2, aR: 1.2 });
  }
  // 他冲过来抱住，叶子全飞起来
  if (lt >= .96) {
    const k = ease(seg(lt, .96, 1.34));
    const ax = lerp(300, bx - 130, k);
    A(ax, 850, 30, [[0, 'determined'], [sh(1.3), 'love']], { view: 'q', walk: k < 1 ? bpOf(t) * 2 : null, aL: 1.2, aR: 1.2 });
    B(bx, 850, 30, [[0, 'hopeful'], [sh(1.34), 'laugh']], { view: 'front', aL: k, aR: k });
    if (lt > 1.34) for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU + hash(i), d = 60 + 420 * easeOut(seg(lt, 1.34, 2.0));
      const px = bx - 90 + hash(i) * 180 + Math.cos(a) * d, py = 560 + Math.sin(a) * d * .8 - 120 * seg(lt, 1.34, 2.0);
      paint(rrPts(px, py, 44, 22, 8), { wash: i % 2 ? PAL.pink : PAL.pinkLt, ink: PAL.ink, sw: .5 });
    }
  }
  // 眼睛反打：她眼里有他，他眼里有她
  if (lt > 1.9 && lt < 2.42) {
    bg(PAL.cream);
    const which = lt < 2.16;
    eyeBig(CX, 520, 560, 330, 1, which ? 190 : 210, which ? PAL.pink : PAL.clay, PAL.ink);
    clipTo(ellPts(CX, 520, which ? 190 : 210, which ? 190 : 210, 36), () => {
      if (which) A(CX, 640, 9.5, [[0, 'love']], { noShadow: true });
      else B(CX, 630, 9.5, [[0, 'hopeful']], { noShadow: true });
    });
    // 睫毛
    for (let i = 0; i < 6; i++) inkLine([[CX - 460 + i * 184, 300], [CX - 470 + i * 184, 250]], 1, PAL.ink, 'ink', 0);
  }
  // 额头碰额头，圆环一圈圈扩散
  if (lt > 2.42) {
    bg(PAL.cream);
    dots(mixCol(PAL.cream, PAL.pink, .35), 132, 30, 0, 0, .45);
    const push2 = ease(seg(lt, 2.42, 2.66));
    A(880 - 20 * push2, 850, 34, [[0, 'love']], { aL: .3, aR: .3, rot: .02 });
    B(1040 + 20 * push2, 850, 34, [[0, 'love']], { aL: .3, aR: .3, rot: -.02, flip: true });
    for (let i = 0; i < 3; i++) {
      const age = frac(bpOf(t)) + i / 3;
      ringOut(CX, 460, 120 + 520 * age, 8 * (1 - age), mixCol(PAL.pink, PAL.cream, age), (1 - age) * .9);
    }
    // 年轮 + 音波
    if (lt > 2.86) {
      for (let i = 0; i < 5; i++) ringOut(1040, 850, 90 + i * 70 * (1 + .06 * pulse(t)), 7, mixCol(PAL.cream, PAL.pink, .55 - i * .08), .9 - i * .12);
      A(880, 926, 30, [[0, 'hopeful']], { aL: 1.2, aR: .4, lookY: .6 });
    }
  }
  camEnd();
}

// ============================== S11 舍不得分开 ==============================
function S11(t, lt, dur) {
  bg(PAL.sky);
  stripes(mixCol(PAL.sky, PAL.paper, .35), 130, .36, -lt * 70, .45);
  floorBand(850, PAL.ink, 7, .12);

  const pull = ease(seg(lt, 0, 1.1));
  const ax = lerp(760, 330, pull), bx = lerp(1160, 1590, pull);
  // 橡皮筋
  if (lt < 1.2) {
    inkLine([[ax + 90, 700], [(ax + bx) / 2, 700 + 26 * Math.sin(lt * 6)], [bx - 90, 700]], 2.6 + pull * 2.4, PAL.pink, 'ink', .5);
    A(ax, 850, 30, [[0, 'determined']], { aL: 1.2, aR: 1.4, rot: -.06, sq: .04 * pulse(t) });
    B(bx, 850, 30, [[0, 'scared']], { aL: 1.2, aR: 1.4, rot: .06, flip: true, sq: .04 * pulse(t) });
  }
  // 断：反向弹飞，画面撕成两半
  if (lt >= 1.2 && lt < 1.66) {
    const k = easeIn(seg(lt, 1.2, 1.56));
    const gap = 40 * k;
    push(); translate(-gap, 0);
    paint(rectPts(-OS, -OS, W / 2 + gap, H + 2 * OS), { wash: PAL.sky, ink: null });
    stripes(mixCol(PAL.sky, PAL.paper, .35), 130, .36, 0, .45);
    A(lerp(330, -200, k), 850, 30, [[0, 'surprised']], { rot: -.5 * k, aL: 1.4, aR: 1.4 });
    pop();
    push(); translate(gap, 0);
    paint(rectPts(W / 2, -OS, W / 2 + OS, H + 2 * OS), { wash: mixCol(PAL.sky, PAL.ink, .08), ink: null });
    B(lerp(1590, 2100, k), 850, 30, [[0, 'cry']], { rot: .5 * k, aL: 1.4, aR: 1.4, flip: true });
    pop();
    shards(CX, 700, 300, 16, lt - 1.2, [PAL.pink, PAL.paper], .5);
  }
  // 撞进色块，塌了
  if (lt >= 1.6 && lt < 2.1) {
    bg(mixCol(PAL.sky, PAL.ink, .1));
    for (let i = 0; i < 10; i++) {
      const fall = seg(lt, 1.66 + i * .02, 1.9 + i * .02);
      card(180 + i * 92, 600 + i * 6 + 200 * easeIn(fall), 110, 110, 16, i % 2 ? PAL.yellow : PAL.cream, 12);
    }
    A(300, 900, 28, [[0, 'ko']], { rot: -.4 });
  }
  // 眨眼蒙太奇：每拍换一个世界
  if (lt >= 2.06 && lt < 3.0) {
    const idx = Math.min(3, Math.floor((lt - 2.06) / .22));
    const worlds = [
      () => { bg(PAL.sky); for (let i = 0; i < 6; i++) paint(rectPts(0, 120 + i * 150, W, 74), { wash: PAL.paper, ink: null }); },
      () => { bg(PAL.deep); dots(PAL.sky, 120, 22, 0, 0, .8); },
      () => { bg(PAL.violet); for (let i = 0; i < 40; i++) popDisc(hash(i) * W, hash(i + 5) * H, 4 + 3 * hash(i + 2), PAL.paper, 1, 2); },
      () => { bg(PAL.cream); floorBand(850, PAL.ink, 7, .12); },
    ];
    worlds[idx]();
    const bk = frac((lt - 2.06) / .22);
    eyelid(Math.sin(clamp(bk) * Math.PI) * 1.15, PAL.clay);
    A(CX, 850, 30, [[0, 'surprised'], [sh(2.7), 'hopeful']], {});
  }
  // 停：额头贴额头极特写
  if (lt >= 3.0) {
    bg(PAL.cream);
    const k = ease(seg(lt, 3.0, 3.28));
    camBegin(CX, 600, 1.6, 0);
    A(880, 850, 34, [[0, 'hopeful']], { aL: .3, aR: .3, rot: .03 });
    B(1010, 850, 34, [[0, 'hopeful']], { aL: .3, aR: .3, flip: true, rot: -.03 });
    for (let i = 0; i < 4; i++) ringOut(CX, 480, 80 + 340 * frac(bpOf(t) + i / 4), 7, mixCol(PAL.pink, PAL.cream, .3), .8);
    camEnd();
  }
}

// ============================== S12 不用再徘徊 ==============================
function S12(t, lt, dur) {
  bg(PAL.mint);
  const shatter = seg(lt, .92, 1.24);
  camBegin(CX, CY, lerp(1, 1.16, ease(seg(lt, 0, 1.0))), 0);
  // 三岔路：三块箭头
  if (shatter < 1) {
    arrowBig(CX - 240, 300, 520, 190, -.6, PAL.cream);
    arrowBig(CX + 240, 300, 520, 190, .6, PAL.paper);
    arrowBig(CX, 700, 520, 190, 0, PAL.cream);
    floorBand(850, PAL.ink, 7, .12);
  }
  // 三重残影：他在三个方向乱跑
  const run = lt * 3.2;
  const spots = [[CX - 520, 850, .3], [CX + 520, 850, -.3], [CX, 760, 0]];
  for (let i = 0; i < 3; i++) {
    const on = i === Math.floor(run) % 3;
    const [sx, sy, rot] = spots[i];
    if (on && lt < .92) A(sx, sy, 28, [[0, 'confused']], { view: 'q', rot, aL: .8, aR: .8 });
    else if (lt < .92) silh(sx, sy, 28, mixCol(PAL.mint, PAL.ink, .18), { view: 'q', rot });
  }
  // 指尖点额头 → 定格 → 并肩走
  if (lt > .92) {
    const k = ease(seg(lt, .92, 1.1));
    const st = ease(seg(lt, 1.55, 1.75));
    const ax = CX - 90 - 250 * st, bx = CX + 150 + 250 * st;
    // 直路：先画（压在脚下，不盖腿）
    if (lt > 1.3) {
      const rw = 240 + 760 * ease(seg(lt, 1.3, 1.95));
      paint(rectPts(CX - rw / 2, 826, rw, 64), { wash: PAL.paper, ink: null });
      inkLine([[CX - rw / 2, 826], [CX + rw / 2, 826]], .9, PAL.ink, 'ink', 0);
      inkLine([[CX - rw / 2, 890], [CX + rw / 2, 890]], .9, PAL.ink, 'ink', 0);
    }
    // 箭头碎成方块
    if (lt > 1.0) {
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * TAU, d = 200 + 900 * easeOut(seg(lt, 1.0, 1.5));
        paint(rrPts(CX + Math.cos(a) * d, CY + Math.sin(a) * d * .8, 60, 34, 8), { wash: i % 2 ? PAL.cream : PAL.paper, ink: null });
      }
    }
    A(ax, 850, 30, [[0, 'confused'], [sh(1.1), 'surprised'], [sh(1.6), 'determined']], { aL: .3 + .12 * st, aR: .3 + .12 * st });
    B(bx, 850, 30, [[0, 'determined'], [sh(1.06), 'hopeful']], { flip: true, aL: 1.1 + .4 * k - .55 * st, aR: .2 + .25 * st });
    if (lt > 1.55) ringOut(CX, 862, 60 + 420 * st, 10 * (1 - st), PAL.ink, .5);
  }
  camEnd();
}

// ============================== S13 最美的期待 ==============================
function S13(t, lt, dur) {
  // 推近到瞳孔
  if (lt < .6) {
    bg(PAL.cream);
    const z = lerp(1, 3.4, easeIn(seg(lt, 0, .58)));
    camBegin(CX, 540, z, 0);
    eyeBig(CX, 540, 620, 380, 1, 200, PAL.clay, PAL.ink);
    clipTo(ellPts(CX, 540, 200, 200, 36), () => B(CX, 640, 9, [[0, 'love']], { noShadow: true }));
    camEnd();
  } else {
    // 穿过瞳孔：全片最亮
    const k = ease(seg(lt, .6, 1.1));
    // 橙→粉 的横向色带（全片唯一"渐变"，用硬边条带做）
    for (let i = 0; i < 26; i++) {
      paint(rectPts(-OS, i * 46 - 100, W + 2 * OS, 48), { wash: mixCol(PAL.orange, PAL.pink, i / 25), ink: null });
    }
    rays(CX, 620, mixCol(PAL.paper, PAL.pink, .5), 24, lt * .4, 2600, .7 * k);
    burstStar(CX, 560, 300 + 40 * pulse(t), PAL.paper, 16, .5, lt * .3);

    if (lt < 1.1) {
      // 两个剪影站在光里
      const st = ease(seg(lt, .62, 1.0));
      push(); drawingContext.globalAlpha = st;
      silh(CX - 225, 820, 34, PAL.ink, {});
      silh(CX + 225, 820, 34, PAL.ink, { flip: true });
      pop();
    } else if (lt < 1.53) {
      // 两个剪影变成两颗星，绕着彼此转
      const a = (lt - 1.1) * 5.5;
      const r = 190;
      star5(CX + Math.cos(a) * r, 620 + Math.sin(a) * r * .7, 90, PAL.paper, a);
      star5(CX - Math.cos(a) * r, 620 - Math.sin(a) * r * .7, 60, PAL.pink, -a);
      for (let i = 0; i < 12; i++) popDisc(CX + Math.cos(i / 12 * TAU) * 520, 620 + Math.sin(i / 12 * TAU) * 320, 8, PAL.paper, 1, 2);
    } else if (lt < 1.95) {
      // 所有元素向中心汇聚
      const c2 = seg(lt, 1.53, 1.93);
      for (let i = 0; i < 22; i++) {
        const a = i / 22 * TAU + i * .3, d = lerp(900, 20, ease(c2));
        paint(rrPts(CX + Math.cos(a) * d - 30, 620 + Math.sin(a) * d * .8 - 20, 60, 40, 10), { wash: i % 3 ? PAL.paper : PAL.yellow, ink: null });
      }
      disc(CX, 620, 30 + 120 * c2, PAL.paper);
    } else if (lt < 2.38) {
      // 粉星升空
      const k2 = seg(lt, 1.95, 2.36);
      const y = lerp(760, 180, easeIn(k2));
      inkLine([[CX, 800], [CX, y]], 1.6 + 8 * (1 - k2), PAL.pink, 'ink', 0);
      star5(CX, y, 70, PAL.paper, lt * 4);
      star5(CX, y, 44, PAL.pink, lt * 4 + .4);
    } else {
      // 最大一朵烟花
      const k3 = seg(lt, 2.38, 2.62);
      for (let ring2 = 0; ring2 < 3; ring2++) {
        const kk = clamp(k3 * 1.4 - ring2 * .18);
        for (let i = 0; i < 26; i++) {
          const a = i / 26 * TAU + ring2 * .12, d = 120 + 980 * easeOut(kk);
          popDisc(CX + Math.cos(a) * d, 520 + Math.sin(a) * d * .8, 22 * (1 - kk * .5), i % 3 ? PAL.paper : PAL.yellow, 1, 2);
        }
      }
      if (k3 >= .55) {
        bg(PAL.pink);
        // 硬边条带（4 条大色阶，禁渐变）
        for (let i = 0; i < 4; i++) {
          paint(rectPts(-OS, i * 275 - 45, W + 2 * OS, 277), { wash: mixCol(PAL.orange, PAL.pink, i / 3), ink: null });
        }
        burstStar(CX, 800, 470, mixCol(PAL.paper, PAL.yellow, .25), 16, .3, lt * .25);
        // 期待线：从交握处向右上出画
        inkLine([[CX + 118, 800], [W + 300, 420]], 5, PAL.paper, 'ink', 0);
        for (let i = 0; i < 5; i++) disc(CX + 200 + i * 210, 800 - i * 78, 7 - i, PAL.paper);
        // 两个点牵手
        disc(CX - 88, 812, 54, PAL.clay, PAL.ink, 1);
        disc(CX + 88, 812, 54, PAL.pink, PAL.ink, 1);
        inkLine([[CX - 34, 812], [CX + 34, 812]], 2.8, PAL.ink, 'ink', 0);
      }
    }
  }
}

shots([
  [0.06, S01], [3.46, S02], [6.87, S03], [10.29, S04], [13.69, S05],
  [17.10, S06], [20.50, S07], [24.33, S08], [27.33, S09], [30.73, S10],
  [34.14, S11], [37.56, S12], [39.67, S13],
]);
