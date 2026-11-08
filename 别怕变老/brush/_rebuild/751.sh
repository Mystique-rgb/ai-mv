cd "D:/ai音乐mv/别怕变老/brush" && PYTHONIOENCODING=utf-8 python - <<'PY'
p='src/scenes/mv.js'; s=open(p,encoding='utf-8').read()
def rep(old,new,name):
    global s
    assert old in s, "MISS: "+name
    s=s.replace(old,new,1); print("ok", name)

# ── S01：半调盘呼吸 + 每拍墨环 + 城市跳 + A 每拍抬手，消灭 1.0–2.5s 静止 ──
old = """    const pull = easeOut(seg(lt, .05, 1.35));
    camBegin(940 + 40 * ease(seg(lt, .2, dur)), 646, lerp(1.06, .95, pull));
    paperBase();
    plate(rectPts(-900, 700, W + 1800, 900), 'blue', { wash: mixCol(INK.paper, INK.blue, .5) });
    tone(-400, 700, W + 800, 900, 'blue', '20', true);
    gridCity(700, .8);
    if (pull < .995) dotDisc(560, 310, lerp(760, 120, pull), INK.blue, lerp(120, 11, pull));"""
new = """    const pull = easeOut(seg(lt, .05, 1.35));
    const pp = pulse(t, 4.2), ph = frac(bpOf(t));
    camBegin(940 + 40 * ease(seg(lt, .2, dur)), 646 - pp * 8,
             lerp(1.06, .95, pull) + pp * .016);
    paperBase();
    plate(rectPts(-900, 700, W + 1800, 900), 'blue', { wash: mixCol(INK.paper, INK.blue, .5) });
    tone(-400, 700, W + 800, 900, 'blue', '20', true);
    gridCity(700 + pp * 12, .8 + pp * .16);          // 城市随拍往上顶一下
    if (pull < .995) dotDisc(560, 310, lerp(760, 120, pull), INK.blue, lerp(120, 11, pull));
    else {
      // 半调盘随拍呼吸 + 每拍甩一圈墨环 + 甩出一圈墨点：开场不再有静止的半秒
      dotDisc(560, 310, 116 + pp * 14, INK.blue, 11 + pp * 5);
      for (let i = 0; i < 2; i++) {
        const q = frac(bpOf(t) + i * .5);
        boilSeed('rg01' + i);
        paint(ellPts(560, 310, 118 + q * 340, (118 + q * 340) * .62, 26), { wash: INK.blue, washOp: 100 * (1 - q), ink: null });
      }
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * TAU + hash(i + 2) * .7;
        const d = 132 + ph * 220 * (.7 + .6 * hash(i));
        boilSeed('sd01' + i);
        paint(ellPts(560 + Math.cos(a) * d, 310 + Math.sin(a) * d * .62, 9 - ph * 4, 9 - ph * 4, 8),
              { wash: INK.blue, washOp: 185 * (1 - ph), ink: null });
      }
    }"""
rep(old,new,"S01 开场动效")

old = """    const aIn = backOut(seg(lt, 1.28, 1.62));
    if (aIn > .02) {
      const brave = seg(t, 1.36, 1.9);
      const m = emotions(lt, [[1.28, 'neutral'], [1.7, 'determined'], [2.2, 'excited']], { take: .8 });
      A_(556, 700, 12 * aIn, { ...m, aL: brave > 0 ? 1.35 : m.aL, aR: brave > 0 ? 1.35 : m.aR, sq: (m.sq || 0) - .1 * brave, boilKey: 'A01' });
    }"""
new = """    const aIn = backOut(seg(lt, 1.28, 1.62));
    if (aIn > .02) {
      const brave = seg(t, 1.36, 1.9);
      const m = emotions(lt, [[1.28, 'neutral'], [1.7, 'determined'], [2.2, 'excited'], [2.62, 'hopeful']], { take: .8 });
      const armSide = beatN(t) % 2;
      const sw = brave > 0 ? .15 + .95 * pp : 0;     // 每拍换一只手举起来
      A_(556, 700 - pp * 15, 12 * aIn, {
        ...m, sq: (m.sq || 0) - .1 * brave - pp * .05,
        aL: brave > 0 ? (armSide === 0 ? sw : .15) : m.aL,
        aR: brave > 0 ? (armSide === 1 ? sw : .15) : m.aR,
        boilKey: 'A01',
      });
      if (t > 1.95) { boilSeed('fp01' + beatN(t)); specks(556, 706, 54 + ph * 46, INK.clay, 8, beatN(t), .55); }
    }"""
rep(old,new,"S01 A 每拍动作")

# ── S04：大远景(0.7) 起手推近 → 11.04 怼脸；视力表每拍指一行 ──
old = """    const push = easeIn(seg(t, 11.04, 12.0));
    setKick(kickOf(t, [bp(7, 1), bp(8, 1)], 9));
    camBegin(lerp(940, 1120, push), lerp(680, 620, push), lerp(1.02, 1.85, push));"""
new = """    const pullIn = ease(seg(t, 8.5, 10.7)), push = easeIn(seg(t, 11.04, 12.0));
    const pp = pulse(t, 4);
    setKick(kickOf(t, [bp(7, 1), bp(8, 1)], 9));
    // 大远景起手（整张纸上两个小人 + 一张巨大的视力表）→ 一路推到怼脸特写
    camBegin(lerp(lerp(872, 950, pullIn), 1120, push),
             lerp(lerp(700, 664, pullIn), 620, push) - pp * 5,
             lerp(lerp(.70, 1.04, pullIn), 1.95, push));"""
rep(old,new,"S04 大远景推近")

old = """    eyeChart(520, 430, 250);
    const mA = emotions(lt, [[0, 'smug'], [1.1, 'proud']], { take: .7 });
    A_(560, GY, 28, { ...mA, aR: 1.45, aL: -1.15, view: 'q', lookX: .8, boilKey: 'A04' });"""
new = """    eyeChart(520, 430 + pp * 7, 250);
    // 每拍换一行，红色小箭头指着它（视力表的"读"是有节奏的）
    {
      const row = 4 - (beatN(t) % 5), ry = 430 - 125 + row * 65;
      boilSeed('ptr04' + beatN(t));
      inkLine([[Math.round(520 + 92), ry - 26], [Math.round(520 + 162), ry - 6], [Math.round(520 + 92), ry + 14]], 4, INK.red, 'ink', 0);
      paint(ellPts(520 + 156, ry - 4, 7, 7, 8), { wash: INK.red, ink: null });
    }
    const mA = emotions(lt, [[0, 'smug'], [1.1, 'proud'], [2.5, 'mischief']], { take: .7 });
    A_(560, GY - pp * 10, 28, { ...mA, aR: 1.45 + .18 * pp, aL: -1.15 - .1 * pp, view: 'q', lookX: .8, boilKey: 'A04' });"""
rep(old,new,"S04 视力表逐拍指行")

open(p,'w',encoding='utf-8').write(s)
print("done part1")
PY