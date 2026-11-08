# -*- coding: utf-8 -*-
"""逐句强制对齐：每句单独送一段音频，得到字级时间
行级区间来自 faster-whisper medium 词级边界（人工按乐句校正）
"""
import json, subprocess, numpy as np, torch
from transformers import Qwen3ASRProcessor, Qwen3ASRForTokenClassification

MODEL = r"C:\Users\79420\.cache\huggingface\hub\models--Qwen--Qwen3-ForcedAligner-0.6B-hf\snapshots\c07281df297b9905d24a508279258cccf987a064"
MP3 = r"D:\ai音乐mv\天龙八部之宿敌\song.mp3"
SR = 16000

raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", MP3, "-ac", "1", "-ar", str(SR),
                      "-f", "f32le", "-"], capture_output=True).stdout
audio = np.frombuffer(raw, dtype=np.float32).copy()
print("audio", len(audio) / SR, flush=True)

LINES = [
 ("会在何处见到你", 22.20, 26.20),
 ("莫非前尘已注定", 26.00, 30.30),
 ("飞过时空的距离", 31.85, 36.20),
 ("却囿于刀剑光影", 37.10, 41.25),
 ("三月春花渐次醒", 42.10, 46.15),
 ("迢迢年华谁老去", 46.70, 51.15),
 ("是劫是缘随我心", 51.90, 57.05),
 ("除了你万敌不侵", 57.05, 61.95),
 ("当恩怨各一半", 61.90, 64.92),
 ("我怎么圈揽", 64.90, 67.46),
 ("看灯笼血红染", 67.44, 69.86),
 ("寻仇已太晚", 69.84, 72.34),
 ("月下门童喟叹", 72.32, 76.18),
 ("昨夜太平长安", 76.16, 81.60),
 ("当天上星河转", 82.10, 84.50),
 ("我命已定盘", 84.46, 87.35),
 ("待绝笔墨痕干", 87.30, 89.60),
 ("宿敌已来犯", 89.54, 92.02),
 ("我借你的孤单", 92.00, 95.50),
 ("今生恐怕难还", 96.05, 101.10),
 ("缠绕孤岛的雪雨", 123.50, 128.80),
 ("飘飘洒洒谁来停", 128.70, 133.60),
 ("摘取一颗海上星", 133.40, 138.40),
 ("陪我终夜不孤寂", 138.20, 142.40),
 ("灵柩长埋深谷底", 143.20, 147.50),
 ("没有永远的秘密", 148.50, 152.30),
 ("染指江湖结悲局", 153.20, 157.30),
 ("无人逃得过宿命", 158.10, 162.40),
 ("当恩怨各一半", 163.50, 166.24),
 ("我怎么圈揽", 166.22, 168.86),
 ("看灯笼血红染", 168.84, 171.24),
 ("寻仇已太晚", 171.22, 173.78),
 ("月下门童喟叹", 173.76, 177.62),
 ("昨夜太平长安", 177.60, 182.90),
 ("当天上星河转", 183.50, 186.14),
 ("我命已定盘", 186.12, 188.68),
 ("待绝笔墨痕干", 188.66, 191.10),
 ("宿敌已来犯", 191.08, 193.58),
 ("我借你的孤单", 193.56, 197.52),
 ("今生恐怕难还", 197.50, 205.14),
 ("当恩怨各一半", 205.10, 208.38),
 ("我怎么圈揽", 208.36, 210.94),
 ("看灯笼血红染", 210.92, 213.42),
 ("寻仇已太晚", 213.40, 215.88),
 ("月下门童喟叹", 215.86, 219.88),
 ("昨夜太平长安", 219.86, 224.62),
 ("当天上星河转", 224.60, 227.80),
 ("我命已定盘", 227.75, 230.76),
 ("待绝笔墨痕干", 230.74, 233.22),
 ("宿敌已来犯", 233.20, 235.80),
 ("我借你的孤单", 235.58, 238.20),
 ("今生恐怕难还", 238.15, 244.50),
]

proc = Qwen3ASRProcessor.from_pretrained(MODEL)
model = Qwen3ASRForTokenClassification.from_pretrained(MODEL, dtype=torch.float32)
model.eval()
print("model loaded", flush=True)

out = []
for idx, (txt, a, b) in enumerate(LINES):
    seg = audio[int(a * SR):int(b * SR)]
    inputs, wl = proc.prepare_forced_aligner_inputs(seg, txt, language="Chinese")
    with torch.inference_mode():
        logits = model(**inputs).logits
    res = proc.decode_forced_alignment(logits, inputs["input_ids"], wl,
            timestamp_token_id=model.config.timestamp_token_id)[0]
    chars = [{"ch": r["text"], "s": round(r["start_time"] + a, 3),
              "e": round(r["end_time"] + a, 3)} for r in res]
    lens = [round(c["e"] - c["s"], 2) for c in chars]
    print(f"\n[{idx+1:2d}] {a:6.2f}-{b:6.2f} {txt}", flush=True)
    print("   " + " ".join(f"{c['ch']}{c['s']:.2f}" for c in chars), flush=True)
    print("   时长 " + " ".join(f"{x:.2f}" for x in lens), flush=True)
    out.append({"text": txt, "start": a, "end": b, "chars": chars})

json.dump(out, open(r"D:\ai音乐mv\天龙八部之宿敌\lines_aligned.json", "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("\nsaved", len(out), "lines", flush=True)
