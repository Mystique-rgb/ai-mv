# -*- coding: utf-8 -*-
"""在分离出的人声轨上重跑 medium，词级时间戳更准"""
import json
import numpy as np, wave
from faster_whisper import WhisperModel

WAV = r"D:\ai音乐mv\寂寞烟火\vocals.wav"
with wave.open(WAV, "rb") as w:
    n = w.getnframes(); sw = w.getsampwidth(); ch = w.getnchannels()
    buf = w.readframes(n)
x = np.frombuffer(buf, dtype=np.int16).astype(np.float32) / 32768.0
if ch == 2:
    x = x.reshape(-1, 2).mean(1)
if w.getframerate() != 16000:
    import subprocess
    raw = subprocess.run(["ffmpeg","-v","quiet","-i",WAV,"-ac","1","-ar","16000",
                          "-f","f32le","-"], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).copy()
print("len", len(x)/16000)

model = WhisperModel("medium", device="cpu", compute_type="int8")
segs, _ = model.transcribe(x, language="zh", word_timestamps=True, beam_size=5,
                           condition_on_previous_text=False, temperature=0.0,
                           vad_filter=False)
out = []
for s in segs:
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text}", flush=True)
    ws = [{"w": w.word, "s": round(w.start,3), "e": round(w.end,3),
           "p": round(float(w.probability),2)} for w in (s.words or [])]
    print("    " + " ".join(f"{w['w'].strip()}{w['s']:.2f}" for w in ws), flush=True)
    out.append({"start": round(s.start,3), "end": round(s.end,3), "text": s.text, "words": ws})

json.dump(out, open(r"D:\ai音乐mv\寂寞烟火\words_vocals.json","w",encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("saved")
