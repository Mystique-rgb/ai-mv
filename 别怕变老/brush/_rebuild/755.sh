cd "D:/ai音乐mv/别怕变老/brush" && PYTHONIOENCODING=utf-8 python - <<'PY'
p='src/scenes/mv.js'; s=open(p,encoding='utf-8').read()
def rep(old,new,name):
    global s
    assert old in s, "MISS: "+name
    s=s.replace(old,new,1); print("ok", name)

# ── S06 回忆：薄蓝罩 + 水/纸船 + 每拍冒亮点 + 心加快 + 人物放大 ──
old = """    setKick(kickOf(t, [bp(11, 1)], 6));
    camBegin(960, 620, lerp(1.1, .98, ease(seg(lt, 0, 2.4))));
    paperBase();
    plate(rectPts(-900, -900, W + 1800, 1180), 'blue', { wash: mixCol(INK.blue, INK.paper, .34) });
    tone(-400, -300, W + 800, 1300, 'blue', '40', true);
    plate(rectPts(-900, 720, W + 1800, 900), 'blue', { wash: mixCol(INK.blueDk, INK.paper, .2) });
    dotDisc(1480, 300, 150, mixCol(INK.blue, INK.paper, .55), 8);
    // 两个小小的他们（回忆里更小）
    const giv = seg(t, 17.6, 18.2);
    A_(780, 770, 24, { ...feel(lt > 1.3 ? 'shy' : 'thinking', o2(lt)), view: 'q', lookX: .7, boilKey: 'A06' });
    B_(1150, 770, 23, { ...feel(lt > 1.2 ? 'surprised' : 'bored', o2(lt)), view: 'q', flip: true, lookX: -.7, boilKey: 'B06' });
    if (giv > 0 && giv < 1) {
      const [px, py] = arcPt([860, 700], [1080, 700], 90, giv);
      push(); translate(px, py); rotate(giv * 2.4 - .4);
      paint(rectPts(-34, -14, 68, 28, 2), { wash: INK.cream, ink: mixCol(INK.blue, INK.ink, .4), sw: 1.6 });
      pop();
    }
    // 全帧蓝洗：把两个人也洗进回忆里（他们之上再罩一层蓝）
    plate(rectPts(-900, -900, W + 1800, 2400), 'blue', { wash: mixCol(INK.blue, INK.paper, .55), washOp: 165 });
    // 漂着的纸白小心心
    for (let i = 0; i < 4; i++) {
      const yy = 560 - ((t * 26 + i * 160) % 460);
      boilSeed('h06' + i);
      paint(ellPts(360 + i * 260, yy, 13, 10, 10), { wash: INK.pink, washOp: 190, ink: null });
      paint(ellPts(360 + i * 260 - 6, yy - 4, 6, 5, 8), { wash: INK.pink, washOp: 190, ink: null });
    }"""
new = """    const pp = pulse(t, 3.6);
    setKick(kickOf(t, [bp(11, 1), bp(11, 3)], 6));
    camBegin(900 + 74 * lt, 630 - pp * 6, lerp(1.06, .99, ease(seg(lt, 0, 2.6))));
    paperBase();
    plate(rectPts(-900, -900, W + 1800, 1180), 'blue', { wash: mixCol(INK.blue, INK.paper, .34) });
    tone(-400, -300, W + 800, 1300, 'blue', '40', true);
    // 回忆的水面 + 一只纸船（一直在晃，画面不会死）
    seaBands(742, 7, t * .8, .9);
    paperBoat(1340 + Math.sin(t * .9) * 16, 762 + Math.sin(t * 1.7) * 5, 1.15);
    dotDisc(1480, 300, 150 + pp * 9, mixCol(INK.blue, INK.paper, .55), 8);
    // 每拍从水面往上涨的亮点
    for (let i = 0; i < 9; i++) {
      const yy = 720 - ((t * 92 + i * 128) % 660);
      boilSeed('up06' + i);
      paint(ellPts(180 + i * 190 + Math.sin(t * 1.4 + i) * 18, yy, 7 - 2 * hash(i), 7 - 2 * hash(i), 8),
            { wash: i % 2 ? INK.cream : INK.pinkLt, washOp: 205, ink: null });
    }
    // 两个小小的他们（站得很开，读得出是"两个人"）
    const giv = seg(t, 17.6, 18.2);
    A_(720, 806 - pp * 11, 28, { ...feel(lt > 1.3 ? 'shy' : 'thinking', o2(lt)), view: 'q', lookX: .7, boilKey: 'A06' });
    B_(1210, 806 - pp * 11, 27, { ...feel(lt > 1.2 ? 'surprised' : 'bored', o2(lt)), view: 'q', flip: true, lookX: -.7, boilKey: 'B06' });
    if (giv > 0 && giv < 1) {
      const [px, py] = arcPt([880, 736], [1120, 736], 96, giv);
      push(); translate(px, py); rotate(giv * 2.4 - .4);
      paint(rectPts(-34, -14, 68, 28, 2), { wash: INK.cream, ink: mixCol(INK.blue, INK.ink, .4), sw: 1.6 });
      pop();
    }
    // 全帧蓝洗：薄到人还是人（原来 165 太厚，把两人洗没了）
    plate(rectPts(-900, -900, W + 1800, 2400), 'blue', { wash: mixCol(INK.blue, INK.paper, .4), washOp: 96 });
    // 漂着的纸白小心心（速度 x3）
    for (let i = 0; i < 7; i++) {
      const yy = 800 - ((t * 78 + i * 137) % 700);
      boilSeed('h06' + i);
      paint(ellPts(220 + i * 235, yy, 14, 11, 10), { wash: INK.pink, washOp: 210, ink: null });
      paint(ellPts(220 + i * 235 - 6, yy - 4, 6, 5, 8), { wash: INK.pink, washOp: 210, ink: null });
    }"""
rep(old,new,"S06 回忆段加密度")

# ── S09 按钟那一下推成钟面大特写 ──
old = """    const dance = t > 27.3;
    camBegin(960, 620, 1.05 + .03 * Math.sin(lt * .8));"""
new = """    const dance = t > 27.3;
    // 伸手按钟 → 镜头推成钟面大特写（全片唯一一个特写级镜头切）→ 27.0 拉回全景起舞
    const toClock = ease(seg(t, 26.15, 26.62)) * (1 - ease(seg(t, 27.02, 27.5)));
    camBegin(lerp(960, 1500, toClock), lerp(620, 296, toClock), lerp(1.05, 2.3, toClock) + .03 * Math.sin(lt * .8) * (1 - toClock));"""
rep(old,new,"S09 钟面特写")

# ── S10 手：方块掌 + 三指；触到后每拍再炸一圈 ──
old = """  const S10 = { touch: 32.88, freeze: 33.72 };"""
new = """  const S10 = { touch: 32.88, freeze: 33.72 };
  // 手掌：和方块小人同款的方掌 + 三根短指（读得出是"手"，不是两根棒）
  function handAt(x, y, u, dir, col, colLt) {
    boilSeed('hand' + Math.round(x) + dir);
    paint(rrPts(x - u * .5, y - u * .58, u, u * 1.16, u * .3, 1.6), { wash: col, ink: INK.ink, sw: 2.2 });
    for (let i = 0; i < 3; i++) {
      const yy = y - u * .44 + i * u * .44, fw = u * .5;
      paint(rrPts(dir > 0 ? x + u * .34 : x - u * .34 - fw, yy - u * .12, fw, u * .24, u * .1, 1.2),
            { wash: colLt, ink: INK.ink, sw: 1.8 });
    }
  }"""
rep(old,new,"S10 handAt 定义")

old = """    const meet = eio = ease(seg(tt, 30.6, S10.touch));
    camBegin(960, 660, lerp(1.16, 1.02, ease(seg(lt, 0, 1.4))));"""
new = """    const meet = eio = ease(seg(tt, 30.6, S10.touch));
    // 触到之后镜头继续往里推，到 33.72 才突然冻住
    const zoomIn = ease(seg(tt, S10.touch, S10.freeze));
    camBegin(960, 660, lerp(1.16, 1.02, ease(seg(lt, 0, 1.4))) + zoomIn * .2);"""
rep(old,new,"S10 cam 持续推")

old = """    const hy = 640, hxL = lerp(430, 905, meet), hxR = lerp(1490, 1015, meet);
    boilSeed('armL10');
    paint(ribbon([[180, 980], [hxL - 210, hy + 130], [hxL, hy]], 46, 30), { wash: INK.clay, ink: INK.ink, sw: 2 });
    paint(ellPts(hxL, hy, 26, 22, 12), { wash: INK.clayLt, ink: INK.ink, sw: 1.8 });
    boilSeed('armR10');
    paint(ribbon([[1740, 980], [hxR + 210, hy + 130], [hxR, hy]], 44, 28), { wash: INK.pink, ink: INK.ink, sw: 2 });
    paint(ellPts(hxR, hy, 24, 21, 12), { wash: INK.pinkLt, ink: INK.ink, sw: 1.8 });"""
new = """    const hy = 640, hxL = lerp(430, 920, meet), hxR = lerp(1490, 1000, meet);
    boilSeed('armL10');
    paint(ribbon([[180, 980], [hxL - 210, hy + 130], [hxL, hy]], 46, 30), { wash: INK.clay, ink: INK.ink, sw: 2 });
    handAt(hxL, hy, 46, 1, INK.clay, INK.clayLt);
    boilSeed('armR10');
    paint(ribbon([[1740, 980], [hxR + 210, hy + 130], [hxR, hy]], 44, 28), { wash: INK.pink, ink: INK.ink, sw: 2 });
    handAt(hxR, hy, 46, -1, INK.pink, INK.pinkLt);"""
rep(old,new,"S10 双手具象")

old = """    const tc = seg(tt, S10.touch, S10.touch + .3), ring3 = seg(tt, S10.touch, S10.touch + .84);
    if (tt > S10.touch) {
      paint(starPts(960, hy - 8, 20 + 90 * tc, .45, 4, tt), { wash: INK.paper, ink: INK.ink, sw: 1.6 });
      paint(ellPts(960, hy + 16, 30 + 70 * tc, 14 + 30 * tc, 18), { wash: INK.red, ink: null });
      if (ring3 < 1) paint(ellPts(960, hy, 80 + ring3 * 420, (80 + ring3 * 420) * .55, 30), { wash: INK.paper, washOp: 130 * (1 - ring3), ink: null });
      glow(960, hy, 200 + 160 * tc, '#FFC766', .5 * tc);
    }"""
new = """    const tc = seg(tt, S10.touch, S10.touch + .3), pp = pulse(tt, 3.2);
    if (tt > S10.touch) {
      paint(starPts(960, hy - 8, 20 + 90 * tc + 16 * pp, .45, 4, tt), { wash: INK.paper, ink: INK.ink, sw: 1.6 });
      paint(ellPts(960, hy + 16, 30 + 70 * tc, 14 + 30 * tc, 18), { wash: INK.red, ink: null });
      // 每拍再推一圈：触到之后到冻结之前不再有死帧
      for (let i = 0; i < 2; i++) {
        const q = frac(bpOf(tt) + i * .5);
        paint(ellPts(960, hy, 70 + q * 380, (70 + q * 380) * .58, 30), { wash: INK.paper, washOp: 118 * (1 - q), ink: null });
      }
      specks(960, hy, 110 + 70 * pp, INK.paper, 10, beatN(tt), .72);
      glow(960, hy, 200 + 160 * tc, '#FFC766', .5 * tc);
    }"""
rep(old,new,"S10 触后持续炸")

# ── S11 冻结复刻同步 + 蓝雾挪到人物后面（不再挡 B）──
old = """      const meet = 1, hy = 640, hxL = 905, hxR = 1015;
      paint(ribbon([[180, 980], [hxL - 210, hy + 130], [hxL, hy]], 46, 30), { wash: INK.clay, ink: INK.ink, sw: 2 });
      paint(ellPts(hxL, hy, 26, 22, 12), { wash: INK.clayLt, ink: INK.ink, sw: 1.8 });
      paint(ribbon([[1740, 980], [hxR + 210, hy + 130], [hxR, hy]], 44, 28), { wash: INK.pink, ink: INK.ink, sw: 2 });
      paint(ellPts(hxR, hy, 24, 21, 12), { wash: INK.pinkLt, ink: INK.ink, sw: 1.8 });
      paint(starPts(960, hy - 8, 110, .45, 4, 33.8), { wash: INK.paper, ink: INK.ink, sw: 1.6 });"""
new = """      const hy = 640, hxL = 920, hxR = 1000;
      paint(ribbon([[180, 980], [hxL - 210, hy + 130], [hxL, hy]], 46, 30), { wash: INK.clay, ink: INK.ink, sw: 2 });
      handAt(hxL, hy, 46, 1, INK.clay, INK.clayLt);
      paint(ribbon([[1740, 980], [hxR + 210, hy + 130], [hxR, hy]], 44, 28), { wash: INK.pink, ink: INK.ink, sw: 2 });
      handAt(hxR, hy, 46, -1, INK.pink, INK.pinkLt);
      paint(starPts(960, hy - 8, 110, .45, 4, 33.8), { wash: INK.paper, ink: INK.ink, sw: 1.6 });"""
rep(old,new,"S11 冻结帧同步手掌")

old = """    camBegin(960 + sh[0], 640 + sh[1], 1.04 + (frozen ? .03 * seg(t, 33.72, 34.5) : 0));"""
new = """    camBegin(960 + sh[0], 640 + sh[1], frozen ? 1.22 : 1.04);"""
rep(old,new,"S11 冻结zoom衔接")

old = """      // A 挡在 B 前面
      const mA = emotions(lt, [[.8, 'determined'], [2.0, 'furious'], [2.9, 'determined']], { take: 1 });
      A_(620, GY, 28, { ...mA, view: 'q', aL: 1.5, aR: 1.5, dy: -(mA.dy || 0) * 0 - 2 * Math.abs(Math.sin(bpOf(t) * Math.PI)) * (1 - calm), boilKey: 'A11' });
      B_(1180, GY, 25, { ...feel(boom && t < 35.6 ? 'scared' : 'relieved', o2(lt)), view: 'q', flip: true, lookX: -.8, boilKey: 'B11' });
      // B 身后的蓝雾被 A 挡住
      if (calm < .5) plate(rectPts(1260, 240, 700, 640), 'blue', { wash: mixCol(INK.blue, INK.paper, .5), washOp: 160 * (1 - calm * 2) });"""
new = """      // B 身后的蓝雾：先画，人物压在上面（原来画在后面把 B 盖掉了）
      if (calm < .5) plate(rectPts(1120, 190, 780, 700), 'blue', { wash: mixCol(INK.blue, INK.paper, .5), washOp: 150 * (1 - calm * 2) });
      // A 挡在 B 前面
      const mA = emotions(lt, [[.8, 'determined'], [2.0, 'furious'], [2.9, 'determined']], { take: 1 });
      A_(620, GY, 28, { ...mA, view: 'q', aL: 1.5, aR: 1.5, dy: -(mA.dy || 0) * 0 - 2 * Math.abs(Math.sin(bpOf(t) * Math.PI)) * (1 - calm), boilKey: 'A11' });
      B_(1180, GY, 25, { ...feel(boom && t < 35.6 ? 'scared' : 'relieved', o2(lt)), view: 'q', flip: true, lookX: -.8, boilKey: 'B11' });"""
rep(old,new,"S11 蓝雾移到人物后")

open(p,'w',encoding='utf-8').write(s)
print("done part2")
PY