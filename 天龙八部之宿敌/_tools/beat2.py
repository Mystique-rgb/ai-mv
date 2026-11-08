# -*- coding: utf-8 -*-
"""《天龙八部之宿敌》全曲节奏图：BPM 网格 + 每小节 kick/snare/hat/RMS"""
import subprocess, json
import numpy as np

MP3 = r"D:\ai音乐mv\天龙八部之宿敌\song.mp3"
SR = 22050
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", MP3, "-ac", "1", "-ar", str(SR),
                      "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32)
DUR = len(x) / SR
print("dur", round(DUR, 2))

N, HOP = 1024, 128           # 46.4ms 窗, 5.8ms 步
frames = 1 + (len(x) - N) // HOP
idx = np.arange(N)[None, :] + HOP * np.arange(frames)[:, None]
S = np.abs(np.fft.rfft(x[idx] * np.hanning(N), axis=1))
freqs = np.fft.rfftfreq(N, 1 / SR)
FPS = SR / HOP


def flux(lo, hi):
    b = S[:, (freqs >= lo) & (freqs <= hi)]
    f = np.maximum(0, np.diff(b, axis=0)).sum(1)
    f = np.concatenate([[0], f])
    # 分段（4s）z 归一化，避免前弱后强压掉峰值
    out = f.copy()
    w = int(FPS * 4)
    for i in range(0, len(f), w):
        seg = f[i:i + w]
        sd = seg.std() + 1e-9
        out[i:i + w] = (seg - seg.mean()) / sd
    return out


LO = flux(30, 120)      # kick
MID = flux(1200, 4500)  # snare
HI = flux(6000, 10500)  # hat


def peaks(sig, thr=1.1, gap=0.09):
    out = []
    for i in range(1, len(sig) - 1):
        if sig[i] > thr and sig[i] >= sig[i - 1] and sig[i] >= sig[i + 1]:
            t = i / FPS
            if not out or t - out[-1] > gap:
                out.append(t)
    return np.array(out)


kick, snare, hat = peaks(LO), peaks(MID, 1.2), peaks(HI, 1.2)

# 相位搜索：136 BPM
best = None
for bpm in np.arange(134.0, 138.01, 0.05):
    beat = 60 / bpm
    for ph in np.arange(0, beat, 0.005):
        grid = np.arange(ph, DUR, beat)
        if len(grid) < 10:
            continue
        d = np.abs(kick[:, None] - grid[None, :]).min(1).mean()
        if best is None or d < best[0]:
            best = (d, bpm, ph)
dist, BPM, PH = best
BEAT = 60 / BPM
BAR = BEAT * 4
print(f"BPM {BPM:.2f} beat {BEAT:.4f}s bar {BAR:.4f}s 相位 {PH:.3f}  平均落点误差 {dist*1000:.0f}ms")

# 小节表
bars = []
i = 0
while True:
    t0 = PH + i * BAR
    if t0 > DUR - 0.2:
        break
    t1 = t0 + BAR
    k = int(((kick >= t0) & (kick < t1)).sum())
    s = int(((snare >= t0) & (snare < t1)).sum())
    h = int(((hat >= t0) & (hat < t1)).sum())
    a, b = int(t0 * SR), min(len(x), int(t1 * SR))
    rms = float(np.sqrt((x[a:b] ** 2).mean() + 1e-12))
    bars.append({"i": i + 1, "t": round(t0, 3), "kick": k, "snare": s, "hat": h,
                 "db": round(20 * np.log10(rms + 1e-9), 1)})
    i += 1

print(f"共 {len(bars)} 小节")
for b in bars:
    tag = ""
    if b["i"] % 8 == 1:
        tag = "  <-- 8小节"
    print(f"bar{b['i']:3d} {b['t']:7.2f} kick{b['kick']} snare{b['snare']} hat{b['hat']:2d} {b['db']:6.1f}dB{tag}")

json.dump({"bpm": round(float(BPM), 2), "beat": round(float(BEAT), 4),
           "bar": round(float(BAR), 4), "phase": round(float(PH), 3),
           "duration": round(DUR, 2), "bars": bars,
           "kick": [round(float(v), 3) for v in kick],
           "snare": [round(float(v), 3) for v in snare]},
          open(r"D:\ai音乐mv\天龙八部之宿敌\beat.json", "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("saved beat.json  kick", len(kick), "snare", len(snare), "hat", len(hat))
