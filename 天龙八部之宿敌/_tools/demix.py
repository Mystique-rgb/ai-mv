# -*- coding: utf-8 -*-
"""HTDemucs 分离人声 -> vocals.wav + 人声能量包络"""
import subprocess, numpy as np, torch
from demucs.pretrained import get_model
from demucs.apply import apply_model

MP3 = r"D:\ai音乐mv\天龙八部之宿敌\song.mp3"
OUT = r"D:\ai音乐mv\天龙八部之宿敌\vocals.wav"

raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", MP3, "-ac", "2", "-ar", "44100",
                      "-f", "f32le", "-"], capture_output=True).stdout
wav = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).T.copy()
print("shape", wav.shape, flush=True)

model = get_model("htdemucs")
model.eval()
x = torch.from_numpy(wav)[None]
with torch.no_grad():
    out = apply_model(model, x, device="cpu", shifts=0, split=True, overlap=0.25)[0]
print("sources", model.sources, flush=True)

voc = out[model.sources.index("vocals")].numpy()
print("vocals rms", float(np.sqrt((voc ** 2).mean())), flush=True)

import wave
pcm = np.clip(voc.T, -1, 1)
with wave.open(OUT, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(44100)
    w.writeframes((pcm * 32767).astype(np.int16).tobytes())
print("saved", OUT, flush=True)

mono = voc.mean(0)
sr = 44100; hop = int(sr * 0.1)
n = len(mono) // hop
e = np.array([np.sqrt((mono[i * hop:(i + 1) * hop] ** 2).mean() + 1e-12) for i in range(n)])
db = 20 * np.log10(e + 1e-9)
np.save(r"D:\ai音乐mv\天龙八部之宿敌\voc_env.npy", np.vstack([np.arange(n) * 0.1, db]))

# 每 5 秒报一次能量，用来找间奏/有无唱词
for k in range(0, int(n * 0.1), 5):
    seg = db[int(k / 0.1):int((k + 5) / 0.1)]
    print(f"{k:4d}-{k+5:4d}s  mean {seg.mean():6.1f}  p90 {np.percentile(seg, 90):6.1f}", flush=True)
print("done", flush=True)
