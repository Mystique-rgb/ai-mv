cd "D:/ai音乐mv/别怕变老/brush" && PYTHONIOENCODING=utf-8 python - <<'PY'
p='src/scenes/mv.js'; s=open(p,encoding='utf-8').read()
# S05: B 落到头顶上
s=s.replace("B_(cx + 14, GY - 190, 20,","B_(cx + 14, GY - 160, 20,")
# S06: 蓝罩减淡、人物放大、心更实
s=s.replace("plate(rectPts(-900, -900, W + 1800, 2400), 'blue', { wash: mixCol(INK.blue, INK.paper, .62) });\n    // 漂着的纸白小心心",
            "plate(rectPts(-900, -900, W + 1800, 2400), 'blue', { wash: mixCol(INK.blue, INK.paper, .52) });\n    // 漂着的纸白小心心")
s=s.replace("A_(800, 760, 21, { ...feel(lt > 1.3 ? 'shy' : 'thinking', o2(lt)), view: 'q', lookX: .7, boilKey: 'A06' });",
            "A_(780, 770, 24, { ...feel(lt > 1.3 ? 'shy' : 'thinking', o2(lt)), view: 'q', lookX: .7, boilKey: 'A06' });")
s=s.replace("B_(1130, 760, 20, { ...feel(lt > 1.2 ? 'surprised' : 'bored', o2(lt)), view: 'q', flip: true, lookX: -.7, boilKey: 'B06' });",
            "B_(1150, 770, 23, { ...feel(lt > 1.2 ? 'surprised' : 'bored', o2(lt)), view: 'q', flip: true, lookX: -.7, boilKey: 'B06' });")
s=s.replace("{ wash: INK.pink, washOp: 130, ink: null });\n      paint(ellPts(360 + i * 260 - 6, yy - 4, 6, 5, 8), { wash: INK.pink, washOp: 130, ink: null });",
            "{ wash: INK.pink, washOp: 190, ink: null });\n      paint(ellPts(360 + i * 260 - 6, yy - 4, 6, 5, 8), { wash: INK.pink, washOp: 190, ink: null });")
# S07: 拉开两人
s=s.replace("B_(1100, 716, 25, { ...mB, view: 'q', noLegs: true, flip: true","B_(1150, 716, 25, { ...mB, view: 'q', noLegs: true, flip: true")
s=s.replace("A_(820, 716, 26, { ...mA, view: 'q', noLegs: true, lookX: lt > 2.2 ? 1 : .2, boilKey: 'A07' });",
            "A_(770, 716, 26, { ...mA, view: 'q', noLegs: true, lookX: lt > 2.2 ? 1 : .2, boilKey: 'A07' });")
# S11: 拉开 A/B
s=s.replace("A_(760, GY, 28, { ...mA, view: 'q', aL: 1.5, aR: 1.5,","A_(620, GY, 28, { ...mA, view: 'q', aL: 1.5, aR: 1.5,")
s=s.replace("B_(1040, GY, 25, { ...feel(boom && t < 35.6 ? 'scared' : 'relieved', o2(lt)), view: 'q', flip: true, lookX: -.8, dx: -14, boilKey: 'B11' });",
            "B_(1180, GY, 25, { ...feel(boom && t < 35.6 ? 'scared' : 'relieved', o2(lt)), view: 'q', flip: true, lookX: -.8, boilKey: 'B11' });")
s=s.replace("if (calm < .5) plate(rectPts(1100, 240, 700, 640), 'blue', { wash: mixCol(INK.blue, INK.paper, .5), washOp: 160 * (1 - calm * 2) });",
            "if (calm < .5) plate(rectPts(1260, 240, 700, 640), 'blue', { wash: mixCol(INK.blue, INK.paper, .5), washOp: 160 * (1 - calm * 2) });")
# S13: 道具挪位不挡人
s=s.replace("const props = [[300, () => eyeChart(300, 560, 150)], [1050, () => phoneBox(1050, 520, 200, 300)],\n                   [1900, () => wallClock(1900, 420, 90, 47.2, 47.2)], [2650, () => { for (let p2 = 0; p2 < 6; p2++) { const a = p2 / 6 * TAU; paint(ellPts(2650 + Math.cos(a) * 20, GY - 70 + Math.sin(a) * 20, 13, 13, 8), { wash: INK.pink, ink: null }); } paint(ellPts(2650, GY - 70, 9, 9, 8), { wash: PAL.ochre, ink: null }); }]];",
            "const props = [[260, () => eyeChart(260, 500, 130)], [1560, () => phoneBox(1560, 470, 170, 260)],\n                   [2380, () => wallClock(2380, 380, 80, 47.2, 47.2)], [3050, () => { for (let p2 = 0; p2 < 6; p2++) { const a = p2 / 6 * TAU; paint(ellPts(3050 + Math.cos(a) * 20, GY - 70 + Math.sin(a) * 20, 13, 13, 8), { wash: INK.pink, ink: null }); } paint(ellPts(3050, GY - 70, 9, 9, 8), { wash: PAL.ochre, ink: null }); }]];")
open(p,'w',encoding='utf-8').write(s); print('patched')
PY
timeout 600 node render.mjs --sheet=14.9,17.9,21.9,34.9,41.5 --cols=3 --w=560 --out=out/check/sheet2.jpg 2>&1 | tail -3