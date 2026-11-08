# -*- coding: utf-8 -*-
"""画语谱图 + 字幕起止线，用于肉眼核对"""
import subprocess, json
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager

WAV = r"D:\ai音乐mv\天龙八部之宿敌\vocals.wav"
raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", WAV, "-ac", "1", "-ar", "16000",
                      "-f", "f32le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)

subs = json.load(open(r"D:\ai音乐mv\天龙八部之宿敌\输出\天龙八部之宿敌_逐字时间戳.json", encoding="utf-8"))
SEGS = [(21.5, 32.0), (61.0, 72.5), (234.0, 246.0)]

for font in [r"C:\Windows\Fonts\msyh.ttc", r"C:\Windows\Fonts\simhei.ttf"]:
    try:
        font_manager.fontManager.addfont(font)
    except Exception:
        pass
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei", "SimHei"]
plt.rcParams["axes.unicode_minus"] = False

N, HOP, SR = 1024, 160, 16000
for k, (a, b) in enumerate(SEGS, 1):
    seg = x[int(a * SR):int(b * SR)]
    frames = 1 + (len(seg) - N) // HOP
    idx = np.arange(N)[None, :] + HOP * np.arange(frames)[:, None]
    S = 20 * np.log10(np.abs(np.fft.rfft(seg[idx] * np.hanning(N), axis=1)) + 1e-9)
    t = a + np.arange(frames) * HOP / SR
    f = np.fft.rfftfreq(N, 1 / SR)

    fig, ax = plt.subplots(figsize=(16, 5.4), dpi=110)
    ax.pcolormesh(t, f[f < 5000], S[:, f < 5000].T, cmap="magma", shading="auto",
                  vmin=S.max() - 55, vmax=S.max())
    rms = np.sqrt((seg[idx] ** 2).mean(1))
    ax.plot(t, 400 + rms / rms.max() * 2600, color="#7cc4ff", lw=0.8, alpha=.8)

    for s in subs:
        if s["e"] < a or s["s"] > b:
            continue
        ax.axvline(s["s"], color="#37ff9d", lw=1.6)
        ax.axvline(s["e"], color="#ff5d7a", lw=1.2, ls="--")
        ax.text(s["s"], 4700, f"{s['i']} {s['t']}", color="#37ff9d", fontsize=10,
                rotation=0, va="top", ha="left")
        for ch, cs, ce in s["c"]:
            ax.axvline(cs, color="#ffd166", lw=0.5, alpha=.55)
    ax.set_ylim(0, 5000); ax.set_xlim(a, b)
    ax.set_xlabel("时间 (s)"); ax.set_ylabel("频率 (Hz)")
    ax.set_title(f"《天龙八部之宿敌》人声轨语谱 · 绿=行起 红虚线=行止 黄细线=字起 · {a}–{b}s")
    fig.tight_layout()
    p = rf"D:\ai音乐mv\天龙八部之宿敌\check_{k}.png"
    fig.savefig(p)
    plt.close(fig)
    print(p)
