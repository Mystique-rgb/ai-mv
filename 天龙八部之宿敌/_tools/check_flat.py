# -*- coding: utf-8 -*-
"""校验：ASR 展平后的字数与歌词 52 行序列是否一一对应"""
import json

W = json.load(open(r"D:\ai音乐mv\天龙八部之宿敌\words_vocals.json", encoding="utf-8"))

words = []
for seg in W:
    for w in seg["words"]:
        t = w["w"].strip()
        if not t:
            continue
        if w["s"] < 20.0 or w["s"] > 250.0:
            continue
        words.append(w)

flat = []
for w in words:
    t = w["w"].strip().replace(" ", "")
    n = len(t)
    dur = max(0.02, w["e"] - w["s"])
    for k, ch in enumerate(t):
        flat.append((ch, round(w["s"] + dur * k / n, 3), round(w["s"] + dur * (k + 1) / n, 3)))

A1 = ["会在何处见到你", "莫非前尘已注定", "飞过时空的距离", "却囿于刀剑光影",
      "三月春花渐次醒", "迢迢年华谁老去", "是劫是缘随我心", "除了你万敌不侵"]
B = ["当恩怨各一半", "我怎么圈揽", "看灯笼血红染", "寻仇已太晚",
     "月下门童喟叹", "昨夜太平长安", "当天上星河转", "我命已定盘",
     "待绝笔墨痕干", "宿敌已来犯", "我借你的孤单", "今生恐怕难还"]
A3 = ["缠绕孤岛的雪雨", "飘飘洒洒谁来停", "摘取一颗海上星", "陪我终夜不孤寂",
      "灵柩长埋深谷底", "没有永远的秘密", "染指江湖结悲局", "无人逃得过宿命"]
LINES = A1 + B + A3 + B + B

print("ASR 字总数", len(flat), " 歌词行数", len(LINES), " 歌词字总数", sum(len(l) for l in LINES))
p = 0
for i, ln in enumerate(LINES, 1):
    seg = flat[p:p + len(ln)]
    got = "".join(x[0] for x in seg)
    print(f"{i:2d} {ln:8s}({len(ln)}) <- {got:10s} {seg[0][1] if seg else '-':7}~{seg[-1][2] if seg else '-':7} {'' if got == ln else 'DIFF'}")
    p += len(ln)
print("剩余", len(flat) - p, "".join(x[0] for x in flat[p:]))
