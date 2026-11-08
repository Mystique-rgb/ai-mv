# -*- coding: utf-8 -*-
"""独立校验：谱通量起音点 vs 字幕行起点，报偏差"""
import subprocess, json
import numpy as np
from faster_whisper.audio import decode_audio

WAV = r"D:\ai音乐mv\天龙八部之宿敌\vocals.wav"
raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", WAV, "-ac", "1", "-ar", "16000",
                      "-f", "f32le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)

N, HOP = 1024, 160  # 64ms 窗 / 10ms 步
win = np.hanning(N)
frames = 1 + (len(x) - N) // HOP
idx = np.arange(N)[None, :] + HOP * np.arange(frames)[:, None]
S = np.abs(np.fft.rfft(x[idx] * win, axis=1))
flux = np.maximum(0, np.diff(np.log1p(S * 10), axis=0)).sum(1)
flux = np.concatenate([[0], flux])
ft = np.arange(len(flux)) * HOP / 16000
# 归一化
flux = flux / (np.percentile(flux, 99) + 1e-9)

subs = json.load(open(r"D:\ai音乐mv\天龙八部之宿敌\输出\天龙八部之宿敌_逐字时间戳.json", encoding="utf-8"))
devs = []
print(f"{'#':>2} {'字幕起':>8} {'起音点':>8} {'偏差':>7}  行")
for s in subs:
    a, b = s["s"] - 0.55, s["s"] + 0.55
    m = (ft >= a) & (ft <= b)
    if not m.any():
        continue
    i = np.argmax(flux[m])
    on = ft[m][i]
    d = on - s["s"]
    devs.append(abs(d))
    flag = "  " if abs(d) <= 0.25 else "!!"
    print(f"{s['i']:2d} {s['s']:8.2f} {on:8.2f} {d:+7.2f}{flag}  {s['t']}")

devs = np.array(devs)
print(f"\n行数 {len(devs)}  |偏差| 中位 {np.median(devs):.2f}s  均值 {devs.mean():.2f}s  "
      f"最大 {devs.max():.2f}s  ≤0.25s 占比 {(devs<=0.25).mean()*100:.0f}%")
