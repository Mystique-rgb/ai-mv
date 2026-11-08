cd "D:/ai音乐mv/别怕变老/brush" && PYTHONIOENCODING=utf-8 python - <<'PY'
p='src/scenes/mv.js'; s=open(p,encoding='utf-8').read()
# S06: 蓝罩加透明度（半透回忆，人物透出来）
old="plate(rectPts(-900, -900, W + 1800, 2400), 'blue', { wash: mixCol(INK.blue, INK.paper, .52) });\n    // 漂着的纸白小心心"
new="plate(rectPts(-900, -900, W + 1800, 2400), 'blue', { wash: mixCol(INK.blue, INK.paper, .55), washOp: 165 });\n    // 漂着的纸白小心心"
assert old in s; s=s.replace(old,new)
# S13: 两人拉开成牵手距离，牵手手臂端点跟着挪
s=s.replace("A_(905, GY + (hop.dy || 0) * 9, 28,","A_(880, GY + (hop.dy || 0) * 9, 28,")
s=s.replace("B_(990, GY + (hop.dy || 0) * 9, 25,","B_(1150, GY + (hop.dy || 0) * 9, 25,")
s=s.replace("paint(ribbon([[950, GY - 118 + (hop.dy || 0) * 9], [968, GY - 110 + (hop.dy || 0) * 9]], 16, 14), { wash: INK.clay, ink: INK.ink, sw: 1.5 });",
            "paint(ribbon([[1005, GY - 118 + (hop.dy || 0) * 9], [1030, GY - 110 + (hop.dy || 0) * 9]], 16, 14), { wash: INK.clay, ink: INK.ink, sw: 1.5 });")
open(p,'w',encoding='utf-8').write(s); print('patched')
PY
timeout 600 node render.mjs --sheet=17.9,18.6,41.5,42.2 --cols=2 --w=560 --out=out/check/sheet3.jpg 2>&1 | tail -2