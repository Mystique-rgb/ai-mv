cd "D:/ai音乐mv/别怕变老/brush" && PYTHONIOENCODING=utf-8 python - <<'PY'
p='src/scenes/mv.js'; s=open(p,encoding='utf-8').read()
old="""    // 两条手臂（带宽窄变化的丝带）"""
new="""    // 触到之前：每拍从两只手甩出一撮粉点，两条手臂本身也在呼吸
    if (tt < S10.touch) {
      const qp = pulse(tt, 3.4), qh = frac(bpOf(tt));
      for (let i = 0; i < 5; i++) {
        const sd = hash(i * 2.3 + beatN(tt));
        boilSeed('hd10' + i + beatN(tt));
        paint(ellPts(hxL - 30 - sd * 90 * qh, hy - 60 + i * 26 - qh * 60, 8 - qh * 3, 8 - qh * 3, 8),
              { wash: INK.clay, washOp: 190 * (1 - qh), ink: null });
        paint(ellPts(hxR + 30 + sd * 90 * qh, hy - 40 + i * 26 - qh * 60, 8 - qh * 3, 8 - qh * 3, 8),
              { wash: INK.pink, washOp: 190 * (1 - qh), ink: null });
      }
    }
    // 两条手臂（带宽窄变化的丝带）"""
assert old in s; s=s.replace(old,new,1); open(p,'w',encoding='utf-8').write(s); print("ok")
PY
timeout 300 node render.mjs --sheet=1.8,31.0,50.5 --cols=3 --w=860 --out=out/check/p3.jpg 2>&1 | tail -2