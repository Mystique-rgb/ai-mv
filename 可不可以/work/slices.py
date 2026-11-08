# -*- coding: utf-8 -*-
"""按每行起唱/收声时间切出音频小片，方便逐句核对。"""
import json, os, subprocess, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "张紫豪 - 可不可以.mp3")
OUT = os.path.join(ROOT, "segments")
os.makedirs(OUT, exist_ok=True)

data = json.load(open(os.path.join(ROOT, "work", "aligned.json"), encoding="utf-8"))
for ln in data["lines"]:
    name = f"L{ln['index']:02d}-{ln['tag']}.mp3"
    dst = os.path.join(OUT, name)
    cmd = ["ffmpeg", "-y", "-v", "error", "-ss", f"{ln['start']:.3f}",
           "-to", f"{ln['end'] + 0.25:.3f}", "-i", SRC,
           "-c:a", "libmp3lame", "-q:a", "4", "-ac", "2", dst]
    subprocess.run(cmd, check=True)
    print(f"{name}  {ln['start']:.2f}-{ln['end']:.2f}  {ln['text']}")
print(f"\n共 {len(data['lines'])} 段 → {OUT}")
