"""幻听 30.64s 片段：独立实测节拍网格 / 每拍击点强度 / 响度曲线。
输出 鼓点实测.json，供分镜提示词作为唯一卡点依据。
"""
import json
import numpy as np
from scipy.signal import butter, sosfilt, stft, find_peaks

SR = 22050
x = np.fromfile("beats_raw.f32", dtype=np.float32).astype(np.float64)
dur = len(x) / SR

# --- 低频（底鼓）包络 ---
sos = butter(4, [35, 150], btype="band", fs=SR, output="sos")
low = sosfilt(sos, x)
hop = 128
env_low = np.sqrt(np.convolve(low ** 2, np.ones(hop) / hop, mode="same"))
env_low_t = np.arange(len(env_low)) / SR

# --- 全频 onset（谱通量） ---
f, tt, Z = stft(x, fs=SR, nperseg=1024, noverlap=768)
mag = np.abs(Z)
flux = np.sum(np.maximum(0, np.diff(mag, axis=1)), axis=0)
flux = flux / (flux.max() + 1e-9)
flux_t = tt[1:]

# --- 自相关求周期 ---
def autocorr_period(e, dt, lo=0.30, hi=0.70):
    e = e - e.mean()
    n = len(e)
    ac = np.correlate(e, e, mode="full")[n - 1:]
    ac /= ac[0]
    a, b = int(lo / dt), int(hi / dt)
    k = a + int(np.argmax(ac[a:b]))
    return k * dt, ac

dt = hop / SR
e_ds = env_low[::hop]
per, _ = autocorr_period(e_ds, dt)
bpm = 60 / per
print(f"自相关周期 {per:.4f}s -> {bpm:.2f} BPM")

# --- 用 127.7 BPM 网格逐拍找真实击点 ---
BEAT = 60 / 127.7
ANCHOR = 0.04
print(f"采用网格 t = {ANCHOR} + {BEAT:.4f}·k")

# 每拍 ±0.11s 内低频包络峰值
peaks, props = find_peaks(env_low, distance=int(0.20 * SR), prominence=0.0)
peak_t = peaks / SR
peak_v = env_low[peaks]
peak_v_n = peak_v / (peak_v.max() + 1e-9)

# 1s 窗 RMS
def rms_at(t, w=0.30):
    a, b = int(max(0, t - w / 2) * SR), int(min(dur, t + w / 2) * SR)
    return float(np.sqrt(np.mean(x[a:b] ** 2)))

lines = [
    (0.70, 4.60, "A1 如今一个人听歌 总是会觉得失落"),
    (5.36, 8.35, "A2 幻听你在我的耳边 轻轻诉说"),
    (8.92, 10.28, "A3 夜色多温柔"),
    (11.12, 12.92, "A4 你有多爱我"),
    (15.68, 19.58, "B1 如今一个人听歌 总是会觉得难过"),
    (20.34, 23.45, "B2 爱已不在这里 我却还没走脱"),
    (23.92, 26.85, "B3 列表里的歌 随过往流动"),
]

def window_peak(t, half=0.12):
    """窗口内低频包络峰值时间 / 归一化强度（不做全局峰值筛选，保证每拍都有读数）"""
    a, b = int(max(0, t - half) * SR), int(min(dur, t + half) * SR)
    if b <= a:
        return None, 0.0
    seg = env_low[a:b]
    i = int(np.argmax(seg))
    return round((a + i) / SR, 3), float(seg[i] / (env_low.max() + 1e-9))

# 全曲低频包络最大（归一基准，去掉开头的解码直流）
lo_max = float(np.percentile(env_low, 99.9))

def wpeak(t, half=0.12):
    a, b = int(max(0, t - half) * SR), int(min(dur, t + half) * SR)
    if b <= a:
        return None, 0.0
    seg = env_low[a:b]
    i = int(np.argmax(seg))
    return round((a + i) / SR, 3), round(min(1.0, float(seg[i] / lo_max)), 3)

beats = []
for k in range(65):
    tg = ANCHOR + BEAT * k
    if tg > dur:
        break
    ht, st = wpeak(tg)
    # 附近击点（±0.12s），取最强
    m = np.abs(peak_t - tg) < 0.12
    hit = None
    if m.any():
        i = np.argmax(peak_v_n[m])
        hit = {"t": round(float(peak_t[m][i]), 3),
               "strength": round(float(peak_v_n[m][i]), 3),
               "delta": round(float(peak_t[m][i] - tg), 3)}
    # 反拍（+半拍）低频能量
    _, sh = wpeak(tg + BEAT / 2, half=0.09)
    # 附近 onset 强度
    mo = np.abs(flux_t - tg) < 0.09
    on = round(float(flux[mo].max()), 3) if mo.any() else 0.0
    seg = next((f"L{i+1}" for i, (a, b, _) in enumerate(lines) if a <= tg < b), "间奏")
    beats.append({
        "k": k, "grid": round(tg, 3), "bar": k // 4 + 1, "beatInBar": k % 4 + 1,
        "hit": hit, "low_strength": st, "offbeat_strength": sh,
        "onset": on, "rms": round(rms_at(tg), 4), "segment": seg,
    })

# 全局统计
hits = [b["hit"] for b in beats if b["hit"]]
miss = [b for b in beats if not b["hit"]]
print(f"网格 {len(beats)} 拍，峰值检测命中 {len(hits)}，落空 {len(miss)} -> {[b['k'] for b in miss]}")
print(f"平均偏差 {np.mean([abs(b['hit']['delta']) for b in beats if b['hit']]):.4f}s")
strong = sorted(beats, key=lambda b: -b["low_strength"])[:10]
print("低频最强 10 拍:", [(b["k"], b["grid"], b["low_strength"]) for b in strong])
weak = sorted(beats, key=lambda b: b["low_strength"])[:10]
print("低频最弱 10 拍:", [(b["k"], b["grid"], b["low_strength"]) for b in weak])
print("RMS 区间:", round(min(b["rms"] for b in beats), 4), "-", round(max(b["rms"] for b in beats), 4))
print("\n拍 | 时间 | 小节 | 低频 | 反拍 | RMS | 段")
for b in beats:
    print(f"k{b['k']:<2} | {b['grid']:.2f} | b{b['bar']:02d}.{b['beatInBar']} | "
          f"{b['low_strength']:.2f} | {b['offbeat_strength']:.2f} | {b['rms']:.3f} | {b['segment']}")

out = {
    "source": "11月7日.MP3", "duration": round(dur, 3), "sample_rate": SR,
    "method": "22050Hz 单声道解码 -> 35-150Hz 带通包络 + 谱通量 + 自相关定速；逐拍 ±0.12s 窗口峰值 + ±0.09s 反拍窗口",
    "autocorr_bpm": round(bpm, 2), "grid_bpm": 127.7, "beat_sec": round(BEAT, 4), "anchor": ANCHOR,
    "beat_count": len(beats), "peak_match_count": len(hits),
    "peak_match_missing": [b["k"] for b in miss],
    "mean_delta": round(float(np.mean([abs(b["hit"]["delta"]) for b in beats if b["hit"]])), 4),
    "lyrics": [{"start": a, "end": b, "text": t} for a, b, t in lines],
    "beats": beats,
}
with open("鼓点实测.json", "w", encoding="utf-8") as fp:
    json.dump(out, fp, ensure_ascii=False, indent=1)
print("已写 鼓点实测.json")
