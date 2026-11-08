# -*- coding: utf-8 -*-
"""用 faster-whisper 对人声轨做句级转写，只为拿"时间骨架"，不作为歌词原文。"""
import json, io, sys, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import wave

from faster_whisper import WhisperModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO = os.path.join(ROOT, "work", "vocals16k.wav")

# 直接读 wav 成 float32 数组，绕开 faster-whisper 内置 av 解码器的版本问题
_w = wave.open(AUDIO, "rb")
assert _w.getframerate() == 16000 and _w.getnchannels() == 1, "需要 16k 单声道"
_pcm = _w.readframes(_w.getnframes())
_w.close()
import numpy as np
audio = np.frombuffer(_pcm, dtype=np.int16).astype(np.float32) / 32768.0

model = WhisperModel("medium", device="cpu", compute_type="int8")
segments, info = model.transcribe(
    audio,
    language="zh",
    beam_size=5,
    vad_filter=False,
    condition_on_previous_text=False,
    initial_prompt="以下是普通话歌曲歌词，每句之间用换行分隔。",
)
out = []
for s in segments:
    out.append({"start": round(s.start, 2), "end": round(s.end, 2),
                "text": s.text.strip()})
    print(f"[{s.start:7.2f} -> {s.end:7.2f}] {s.text.strip()}")

with open(os.path.join(ROOT, "work", "asr.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print(f"\n共 {len(out)} 段；音频时长 {info.duration:.1f}s")
