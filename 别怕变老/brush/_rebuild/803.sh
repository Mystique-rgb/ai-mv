cd "D:/ai音乐mv/别怕变老/brush" && PYTHONIOENCODING=utf-8 python - <<'PY'
p='src/scenes/mv.js'; s=open(p,encoding='utf-8').read()
def rep(old,new,name):
    global s
    assert old in s, "MISS: "+name
    s=s.replace(old,new,1); print("ok", name)

# S05：摔坐后 B 每拍在背上弹一下
rep("""      const fall = ease(trip);
      const fx = lerp(cx, 1380, easeOut(trip));
      A_(fx, GY + 16 * fall, 27, { ...feel(trip < .8 ? 'scared' : 'ko', o2(lt)), sq: .3 * fall, rot: .18 * fall, view: 'q', boilKey: 'A05b' });
      B_(fx + 30, GY - 60 * (1 - fall) - 96 * fall, 20, { ...mB3, view: 'front', boilKey: 'B05b' });""",
"""      const fall = ease(trip);
      const fx = lerp(cx, 1380, easeOut(trip));
      A_(fx, GY + 16 * fall, 27, { ...feel(trip < .8 ? 'scared' : 'ko', o2(lt)), sq: .3 * fall, rot: .18 * fall, view: 'q', boilKey: 'A05b' });
      const bnc = fall > .9 ? Math.abs(Math.sin(bpOf(t) * Math.PI)) : 0;   // 坐稳了也每拍弹一下
      B_(fx + 30, GY - 60 * (1 - fall) - 96 * fall - bnc * 10, 20, { ...mB3, view: 'front', sq: -bnc * .08, aL: -bnc, aR: -bnc, boilKey: 'B05b' });""",
"S05 坐背律动")

# S06：水波更明显 + 心加横摆
rep("seaBands(742, 7, t * .8, .9);", "seaBands(742, 11, t * 1.1, 1);", "S06 水波加强")
rep("""      paint(ellPts(220 + i * 235, yy, 14, 11, 10), { wash: INK.pink, washOp: 210, ink: null });
      paint(ellPts(220 + i * 235 - 6, yy - 4, 6, 5, 8), { wash: INK.pink, washOp: 210, ink: null });""",
"""      const sx2 = Math.sin(t * 2.2 + i) * 22;
      paint(ellPts(220 + i * 235 + sx2, yy, 14, 11, 10), { wash: INK.pink, washOp: 210, ink: null });
      paint(ellPts(220 + i * 235 + sx2 - 6, yy - 4, 6, 5, 8), { wash: INK.pink, washOp: 210, ink: null });""",
"S06 心横摆")

# S10：手臂提前 0.5s 开始伸；相触的环改正红（粉底上读得出）
rep("const meet = eio = ease(seg(tt, 30.6, S10.touch));", "const meet = eio = ease(seg(tt, 30.1, S10.touch));", "S10 手臂提前入场")
rep("""      for (let i = 0; i < 2; i++) {
        const q = frac(bpOf(tt) + i * .5);
        paint(ellPts(960, hy, 70 + q * 380, (70 + q * 380) * .58, 30), { wash: INK.paper, washOp: 118 * (1 - q), ink: null });
      }
      specks(960, hy, 110 + 70 * pp, INK.paper, 10, beatN(tt), .72);""",
"""      for (let i = 0; i < 2; i++) {
        const q = frac(bpOf(tt) + i * .5);
        paint(ellPts(960, hy, 60 + q * 420, (60 + q * 420) * .58, 30), { wash: INK.red, washOp: 150 * (1 - q), ink: null });
        paint(ellPts(960, hy, 40 + q * 420, (40 + q * 420) * .58, 30), { wash: INK.paper, washOp: 170 * (1 - q), ink: null });
      }
      specks(960, hy, 130 + 80 * pp, INK.red, 9, beatN(tt), .75);
      specks(960, hy, 110 + 70 * pp, INK.paper, 10, beatN(tt) + 3, .72);""",
"S10 红环加强")

# S12：火星加大 + 拍上多蹦一撮
rep("""    if (lit > .1) for (let i = 0; i < 5; i++) {
      const ph2 = frac(bpOf(t) * .8 + i * .2), up = 1 - ph2;
      boilSeed('spark12' + i);
      paint(ellPts(960 + Math.sin(i * 2.4 + t) * 46, GY - 60 - ph2 * 260, 6 * up + 2, 6 * up + 2, 7), { wash: i % 2 ? INK.pink : PAL.ochre, washOp: 230 * up * lit, ink: null });
    }""",
"""    if (lit > .1) for (let i = 0; i < 8; i++) {
      const ph2 = frac(bpOf(t) * .8 + i * .13), up = 1 - ph2;
      boilSeed('spark12' + i);
      paint(ellPts(960 + Math.sin(i * 2.4 + t) * 58, GY - 60 - ph2 * 280, 9 * up + 2, 9 * up + 2, 7), { wash: i % 2 ? INK.pink : PAL.ochre, washOp: 235 * up * lit, ink: null });
    }""",
"S12 火星加强")

open(p,'w',encoding='utf-8').write(s)
print("done")
PY