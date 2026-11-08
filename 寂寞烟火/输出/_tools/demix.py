# -*- coding: utf-8 -*-
"""用 HTDemucs 分离人声，输出 vocals.wav，并统计各时段人声能量"""
import subprocess, numpy as np, torch
from demucs.pretrained import get_model
from demucs.apply import apply_model

MP3 = r"D:\ai音乐mv\寂寞烟火\11月6日(1).MP3"
OUT = r"D:\ai音乐mv\寂寞烟火\vocals.wav"

# 解码 44.1k 立体声
raw = subprocess.run(["ffmpeg","-v","quiet","-i",MP3,"-ac","2","-ar","44100",
                      "-f","f32le","-"], capture_output=True).stdout
wav = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).T.copy()   # (2, N)
print("shape", wav.shape, flush=True)

model = get_model("htdemucs")
model.eval()
x = torch.from_numpy(wav)[None]
with torch.no_grad():
    out = apply_model(model, x, device="cpu", shifts=0, split=True, overlap=0.25)[0]
print("sources", model.sources, flush=True)

voc = out[model.sources.index("vocals")].numpy()   # (2, N)
print("vocals rms", float(np.sqrt((voc**2).mean())), flush=True)

# 写 wav
pcm = np.clip(voc.T, -1, 1)
import wave
with wave.open(OUT, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(44100)
    w.writeframes((pcm * 32767).astype(np.int16).tobytes())
print("saved", OUT, flush=True)

# 每 0.1s 人声能量（dB）
mono = voc.mean(0)
sr = 44100; hop = int(sr*0.1)
n = len(mono)//hop
e = np.array([np.sqrt((mono[i*hop:(i+1)*hop]**2).mean()+1e-12) for i in range(n)])
db = 20*np.log10(e+1e-9)
np.save(r"D:\ai音乐mv\寂寞烟火\voc_env.npy", np.vstack([np.arange(n)*0.1, db]))

# 关键区间对比
def seg_db(a, b):
    i, j = int(a/0.1), int(b/0.1)
    return round(float(db[i:j].mean()), 1), round(float(np.percentile(db[i:j], 90)), 1)
for name, a, b in [("L1 0-3.3",0,3.3), ("L4 7.3-10.3",7.3,10.3), ("L6 13.8-17.1",13.8,17.1),
                   ("L7 17.3-22.4",17.3,22.4), ("间奏 22.4-23.9",22.4,23.9),
                   ("L8 24-28",24,28), ("尾 52.2-55",52.2,55.2)]:
    m, p = seg_db(a, b)
    print(f"  {name:16s} mean {m:6.1f} dB   p90 {p:6.1f} dB", flush=True)
