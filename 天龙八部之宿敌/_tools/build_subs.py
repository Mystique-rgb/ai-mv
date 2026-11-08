# -*- coding: utf-8 -*-
"""《天龙八部之宿敌》字幕包生成
字级时间：faster-whisper medium 人声轨逐字时间，按行区间分段线性插值
行级时间：首字提前 0.12s，行尾由人声能量包络判定（有上限，避免盖住间奏）
"""
import os, json, csv
import numpy as np

ROOT = r"D:\ai音乐mv\天龙八部之宿敌"
OUT = os.path.join(ROOT, "输出")
DUR = 263.34
os.makedirs(OUT, exist_ok=True)

W = json.load(open(os.path.join(ROOT, "words_vocals.json"), encoding="utf-8"))
env = np.load(os.path.join(ROOT, "voc_env.npy"))
ENV_T, ENV_DB = env[0], env[1]

words = []
for seg in W:
    for w in seg["words"]:
        t = w["w"].strip().replace(" ", "")
        if not t or w["s"] < 20.0 or w["s"] > 250.0:
            continue
        words.append((t, float(w["s"]), float(w["e"])))

# (歌词, 该行 ASR 搜索区间起, 止)  —— 区间来自 medium 词级边界
LINES = [
 ("会在何处见到你", 22.20, 26.20), ("莫非前尘已注定", 26.00, 30.30),
 ("飞过时空的距离", 31.85, 36.20), ("却囿于刀剑光影", 37.10, 41.25),
 ("三月春花渐次醒", 42.10, 46.15), ("迢迢年华谁老去", 46.70, 51.15),
 ("是劫是缘随我心", 51.90, 57.05), ("除了你万敌不侵", 57.05, 61.95),
 ("当恩怨各一半", 61.90, 64.92), ("我怎么圈揽", 64.90, 67.46),
 ("看灯笼血红染", 67.44, 69.86), ("寻仇已太晚", 69.84, 72.34),
 ("月下门童喟叹", 72.32, 76.18), ("昨夜太平长安", 76.16, 81.60),
 ("当天上星河转", 82.10, 84.50), ("我命已定盘", 84.46, 87.35),
 ("待绝笔墨痕干", 87.30, 89.60), ("宿敌已来犯", 89.54, 92.02),
 ("我借你的孤单", 92.00, 95.50), ("今生恐怕难还", 96.05, 101.10),
 ("缠绕孤岛的雪雨", 123.50, 128.80), ("飘飘洒洒谁来停", 128.70, 133.60),
 ("摘取一颗海上星", 133.40, 138.40), ("陪我终夜不孤寂", 138.20, 142.40),
 ("灵柩长埋深谷底", 143.20, 147.50), ("没有永远的秘密", 148.50, 152.30),
 ("染指江湖结悲局", 153.20, 157.30), ("无人逃得过宿命", 158.10, 162.40),
 ("当恩怨各一半", 163.50, 166.24), ("我怎么圈揽", 166.22, 168.86),
 ("看灯笼血红染", 168.84, 171.24), ("寻仇已太晚", 171.22, 173.78),
 ("月下门童喟叹", 173.76, 177.62), ("昨夜太平长安", 177.60, 182.90),
 ("当天上星河转", 183.50, 186.14), ("我命已定盘", 186.12, 188.68),
 ("待绝笔墨痕干", 188.66, 191.10), ("宿敌已来犯", 191.08, 193.58),
 ("我借你的孤单", 193.56, 197.52), ("今生恐怕难还", 197.50, 205.14),
 ("当恩怨各一半", 205.10, 208.38), ("我怎么圈揽", 208.36, 210.94),
 ("看灯笼血红染", 210.92, 213.42), ("寻仇已太晚", 213.40, 215.88),
 ("月下门童喟叹", 215.86, 219.88), ("昨夜太平长安", 219.86, 224.62),
 ("当天上星河转", 224.60, 227.80), ("我命已定盘", 227.75, 230.76),
 ("待绝笔墨痕干", 230.74, 233.22), ("宿敌已来犯", 233.20, 235.80),
 ("我借你的孤单", 235.58, 238.20), ("今生恐怕难还", 238.15, 244.50),
]


def chars_for(text, a, b):
    """区间内 ASR 词 -> 该行逐字时间（分段线性插值）"""
    ws = [(t, s, e) for t, s, e in words if a - 0.35 <= s < b]
    if not ws:
        ws = [(t, s, e) for t, s, e in words if a <= s < b + 0.5]
    # 锚点：累计字数 -> 时间
    xs, ts = [], []
    k = 0
    for t, s, e in ws:
        n = len(t)
        for j in range(n):
            xs.append(k + j)
            ts.append(s + (e - s) * j / n)
        k += n
        xs.append(k)
        ts.append(e)
    n_line = len(text)
    if not xs:
        step = (b - a) / n_line
        starts = [a + step * i for i in range(n_line)]
    else:
        xsa = np.array(xs, dtype=float)
        tsa = np.array(ts, dtype=float)
        # 归一化到本行字数
        xsa = xsa / max(1e-9, xsa[-1]) * n_line if xsa[-1] > 0 else xsa
        starts = [float(np.interp(i, xsa, tsa)) for i in range(n_line)]
    # 单调化
    for i in range(1, n_line):
        if starts[i] < starts[i - 1] + 0.02:
            starts[i] = starts[i - 1] + 0.02
    out = []
    for i in range(n_line):
        se = starts[i + 1] if i + 1 < n_line else max(starts[i] + 0.14, ts[-1] if ts else starts[i] + 0.3)
        out.append({"ch": text[i], "s": round(starts[i], 3), "e": round(se, 3)})
    return out


def env_at(t):
    i = int(t / 0.1)
    return float(ENV_DB[i]) if 0 <= i < len(ENV_DB) else -90.0


L = []
for idx, (text, a, b) in enumerate(LINES):
    cs = chars_for(text, a, b)
    first, last = cs[0]["s"], cs[-1]
    # 行尾：从末字起来，找人声衰减点
    ref = float(np.median([env_at(c["s"]) for c in cs]))
    thr = ref - 14
    end = last["s"] + 0.35
    t = last["s"]
    quiet = 0
    while t < last["s"] + 3.0:
        if env_at(t) < thr:
            quiet += 1
            if quiet >= 3:
                end = t - 0.2 + 0.25
                break
        else:
            quiet = 0
        t += 0.1
    else:
        end = last["s"] + 1.5
    L.append({"i": idx + 1, "t": text, "a": a, "b": b,
              "s": round(max(a, first - 0.12), 2), "e": round(end, 2),
              "c": cs, "ref": round(ref, 1)})

# 相邻行不重叠
for i in range(len(L) - 1):
    if L[i]["e"] > L[i + 1]["s"] - 0.04:
        L[i]["e"] = round(max(L[i]["s"] + 0.5, L[i + 1]["s"] - 0.06), 2)

def ts_srt(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = int(t % 60); ms = int(round((t - int(t)) * 1000))
    if ms == 1000: s += 1; ms = 0
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
def ts_lrc(t):
    m = int(t // 60); return f"{m:02d}:{t - m * 60:05.2f}"
def ts_ass(t):
    h = int(t // 3600); m = int(t % 3600 // 60); return f"{h}:{m:02d}:{t % 60:05.2f}"
def ts_smpte(t, fps=25):
    f = int(round(t * fps)); return f"{f//(3600*fps):02d}:{f//(60*fps)%60:02d}:{f//fps%60:02d}:{f%fps:02d}"

TI, AR, AL = "天龙八部之宿敌", "许嵩", "天龙八部之宿敌（《天龙八部3》网游主题曲）"

# SRT
open(os.path.join(OUT, f"{TI}.srt"), "w", encoding="utf-8").write(
    "\n".join(f"{x['i']}\n{ts_srt(x['s'])} --> {ts_srt(x['e'])}\n{x['t']}\n" for x in L))
# VTT
vtt = ["WEBVTT", ""] + sum([[f"{ts_srt(x['s']).replace(',', '.')} --> {ts_srt(x['e']).replace(',', '.')}",
                             x["t"], ""] for x in L], [])
open(os.path.join(OUT, f"{TI}.vtt"), "w", encoding="utf-8").write("\n".join(vtt))
# LRC（行级 + 增强逐字）
lrc = [f"[ti:{TI}]", f"[ar:{AR}]", f"[al:{AL}]", "[by:WorkBuddy · faster-whisper medium + HTDemucs]",
       "[offset:0]", "[re:逐句对齐]"]
lrc += [f"[{ts_lrc(x['s'])}]{x['t']}" for x in L]
open(os.path.join(OUT, f"{TI}.lrc"), "w", encoding="utf-8-sig").write("\n".join(lrc) + "\n")

# 增强 LRC（A2 扩展，逐字）
ea = [f"[ti:{TI}]", f"[ar:{AR}]", "[by:WorkBuddy]", "[re:增强逐字]"]
for x in L:
    parts = "".join("<%s>%s" % (ts_lrc(c["s"]), c["ch"]) for c in x["c"])
    ea.append(f"[{ts_lrc(x['s'])}]{parts}")
open(os.path.join(OUT, f"{TI}_逐字.lrc"), "w", encoding="utf-8-sig").write("\n".join(ea) + "\n")

# ASS 逐字 karaoke
head = """[Script Info]
Title: 天龙八部之宿敌 逐字
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Microsoft YaHei,72,&H00FFFFFF,&H00A5C6FF,&H00000000,&H80000000,-1,0,0,0,100,100,2,0,1,4,2,2,80,80,90,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ass = [head]
for x in L:
    parts = []
    for k, c in enumerate(x["c"]):
        parts.append("{\\kf%.0f}%s" % (max(0.02, c["e"] - c["s"]) * 100, c["ch"]))
    ass.append(f"Dialogue: 0,{ts_ass(x['s'])},{ts_ass(x['e'])},Default,,0,0,0,,{''.join(parts)}")
open(os.path.join(OUT, f"{TI}_逐字.ass"), "w", encoding="utf-8").write("\n".join(ass))

# 音字对应表 CSV
with open(os.path.join(OUT, f"{TI}_音字对应表.csv"), "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["序号", "开始(s)", "结束(s)", "时长(s)", "开始时间码", "结束时间码",
                "开始SMPTE25", "结束SMPTE25", "歌词", "逐字起点(s)"])
    for x in L:
        w.writerow([x["i"], f"{x['s']:.2f}", f"{x['e']:.2f}", f"{x['e']-x['s']:.2f}",
                    ts_srt(x["s"]), ts_srt(x["e"]), ts_smpte(x["s"]), ts_smpte(x["e"]),
                    x["t"], " ".join(f"{c['ch']}{c['s']:.2f}" for c in x["c"])])

# 对齐表 MD
md = [f"# 《{TI}》 · 字幕对齐表", "",
      f"- 音频：`许嵩 - 天龙八部之宿敌.mp3`（{DUR:.2f} 秒 / 258 kbps / 44.1 kHz 立体声）",
      f"- 演唱结构：前奏 0–22.4s → 主歌A1 22.4–30 → 主歌A2 32–62 → 副歌B1 62–101 → 间奏 101–123.5 → "
      f"主歌A3 123.6–142 → 主歌A4 143–162 → 副歌B2 163.5–205 → 副歌B3 205–244.5 → 尾奏 244.5–{DUR:.0f}",
      "- 全曲 52 行、316 字，副歌重复 3 次（62s / 163.5s / 205s）",
      "- 制作链路：HTDemucs 分离人声 → faster-whisper medium(人声轨) 逐字时间戳 → "
      "按乐句区间分段线性映射到正确歌词 → 人声能量包络判定行尾拖音 → 人工复核",
      "", "| # | 时间 | 时长 | 歌词 | 首字 | 逐字起点 |", "|---|---|---|---|---|---|"]
for x in L:
    md.append(f"| {x['i']} | {x['s']:.2f}–{x['e']:.2f} | {x['e']-x['s']:.2f}s | {x['t']} | "
              f"{x['c'][0]['s']:.2f} | " + " ".join(f"{c['ch']}{c['s']:.2f}" for c in x["c"]) + " |")
md += ["", "## 无人声区间（字幕留白）", "- **0–22.4s**：前奏", "- **30.3–31.9s**：换气",
       "- **101.1–123.5s**：间奏（约 22 秒）", f"- **244.5–{DUR:.0f}s**：尾奏",
       "", "## 说明",
       "- 行级时间与人声能量交叉校验；逐字时间为 ASR 词边界线性插值，用于卡拉OK高亮，误差一般 ±0.1–0.3s",
       "- 第 45 行「月下门童喟叹」ASR 误听为 8 字（“月下满同归的云烟”），该行逐字为插值估算，行级时间准确"]
open(os.path.join(OUT, f"{TI}_字幕对齐表.md"), "w", encoding="utf-8").write("\n".join(md))

# JSON
json.dump([{"i": x["i"], "t": x["t"], "s": x["s"], "e": x["e"],
            "c": [[c["ch"], c["s"], c["e"]] for c in x["c"]]} for x in L],
          open(os.path.join(OUT, f"{TI}_逐字时间戳.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)

print(f"生成 {len(L)} 行")
for x in L:
    print(f"{x['i']:2d} [{x['s']:7.2f}-{x['e']:7.2f}] {x['t']}")
