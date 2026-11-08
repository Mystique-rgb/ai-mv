# -*- coding: utf-8 -*-
"""逐句强制对齐：每句单独送 2-5s 音频，避免长段压缩，得到字级时间"""
import json, subprocess, numpy as np, torch
from transformers import Qwen3ASRProcessor, Qwen3ASRForTokenClassification

MODEL = r"C:\Users\79420\.cache\huggingface\hub\models--Qwen--Qwen3-ForcedAligner-0.6B-hf\snapshots\c07281df297b9905d24a508279258cccf987a064"
MP3 = r"D:\ai音乐mv\寂寞烟火\11月6日(1).MP3"
SR = 16000

raw = subprocess.run(["ffmpeg","-v","quiet","-i",MP3,"-ac","1","-ar",str(SR),
                      "-f","f32le","-"], capture_output=True).stdout
audio = np.frombuffer(raw, dtype=np.float32).copy()

# 每句: (搜索起点, 搜索终点, 歌词)  —— 区间来自 medium 词级边界/商用 ASR 停顿
LINES = [
 (0.00, 3.40, "跨越过多少海洋去看你"),
 (3.30, 5.40, "孤单的黑夜途中"),
 (5.34, 7.30, "只要想着你"),
 (7.26, 10.32, "我就不会惶恐"),
 (10.30, 13.85, "时光的岸上人来了又走"),
 (13.80, 17.12, "离开时你不用说我都懂"),
 (17.25, 22.45, "感谢你曾让我留在你眼中"),
 (23.95, 28.05, "我曾经走过最遥远的路"),
 (28.00, 31.60, "想要去拥抱未成真的梦"),
 (31.56, 33.76, "迷失的黑夜途中"),
 (33.72, 35.62, "只要想起你"),
 (35.58, 38.58, "就点亮了星空"),
 (38.54, 42.22, "流浪的纸船忘不掉港口"),
 (42.18, 45.76, "渐灭的花火割不断彩虹"),
 (45.72, 48.48, "你就是我心中"),
 (48.44, 52.20, "永恒的天空"),
]

proc = Qwen3ASRProcessor.from_pretrained(MODEL)
model = Qwen3ASRForTokenClassification.from_pretrained(MODEL, dtype=torch.float32)
model.eval()

out = []
for a, b, txt in LINES:
    seg = audio[int(a*SR):int(b*SR)]
    inputs, wl = proc.prepare_forced_aligner_inputs(seg, txt, language="Chinese")
    logits = model(**inputs).logits
    res = proc.decode_forced_alignment(logits, inputs["input_ids"], wl,
            timestamp_token_id=model.config.timestamp_token_id)[0]
    chars = []
    for r in res:
        chars.append({"ch": r["text"], "s": round(r["start_time"]+a, 3),
                      "e": round(r["end_time"]+a, 3)})
    lens = [round(c["e"]-c["s"], 2) for c in chars]
    print(f"\n[{a:5.2f}-{b:5.2f}] {txt}  ({len(txt)}字)")
    print("   " + " ".join(f"{c['ch']}{c['s']:.2f}" for c in chars))
    print("   时长: " + " ".join(f"{x:.2f}" for x in lens))
    out.append({"text": txt, "start": a, "end": b, "chars": chars})

json.dump(out, open(r"D:\ai音乐mv\寂寞烟火\lines_aligned.json","w",encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("\nsaved lines_aligned.json")
