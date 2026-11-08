# -*- coding: utf-8 -*-
"""《寂寞烟火》55s 片段测拍：BPM、小节头、踢鼓/军鼓重音、能量分段"""
import subprocess, numpy as np, json

MP3 = r"D:\ai音乐mv\寂寞烟火\11月6日(1).MP3"
SR = 22050
raw = subprocess.run(["ffmpeg","-v","error","-i",MP3,"-ac","1","-ar",str(SR),
                      "-f","f32le","-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32)

n, hop = 1024, 256
frames = 1 + (len(x)-n)//hop
idx = np.arange(n)[None,:] + hop*np.arange(frames)[:,None]
win = np.hanning(n)
S = np.abs(np.fft.rfft(x[idx]*win, axis=1))
freqs = np.fft.rfftfreq(n, 1/SR)
fps = SR/hop

def band_flux(lo, hi):
    b = S[:, (freqs>=lo)&(freqs<=hi)]
    f = np.maximum(0, np.diff(b, axis=0)).sum(axis=1)
    return np.concatenate([[0], f])

low  = band_flux(40, 110)     # 踢鼓
mid  = band_flux(1500, 4000)  # 军鼓/拍手
high = band_flux(6000, 10000) # 镲
full = low + mid
fz = full - full.mean()
ac = np.correlate(fz, fz, mode="full")[len(fz)-1:]
ac /= ac[0]
lo_i, hi_i = int(0.30*fps), int(2.0*fps)
peaks = sorted(((ac[i], i) for i in range(lo_i, hi_i)
                if ac[i] == ac[max(lo_i,i-5):i+5].max()), reverse=True)[:8]
print("=== 自相关周期 -> BPM ===")
for v, i in peaks:
    p = i/fps
    print(f"  周期 {p:.3f}s  ac {v:.3f}  BPM {60/p:6.2f}")

def peaks_of(sig, thr, gap=0.16):
    out=[]
    for i in range(2, len(sig)-2):
        if sig[i] > thr and sig[i] == sig[i-2:i+3].max():
            t = i/fps
            if not out or t-out[-1] > gap:
                out.append(round(t,3))
    return out

low_n = low/(low.max()+1e-9); mid_n = mid/(mid.max()+1e-9)
k = peaks_of(low_n, 0.10)
s = peaks_of(mid_n, 0.10)
print(f"\n=== 踢鼓 {len(k)} 个 ===")
print(" ".join(f"{v:.2f}" for v in k))
print(f"\n=== 军鼓 {len(s)} 个 ===")
print(" ".join(f"{v:.2f}" for v in s))

print("\n=== 踢鼓间隔众数 ===")
d = np.diff(k)
hist, edges = np.histogram(d, bins=np.arange(0.15,1.6,0.05))
for c,e in sorted(zip(hist,edges), reverse=True)[:6]:
    print(f"  {e:.2f}s 附近 {c} 次")

# 能量（0.25s 窗 RMS dB）用于分段
w = int(SR*0.25); h2 = int(SR*0.1)
env = np.array([np.sqrt((x[i:i+w]**2).mean()+1e-12) for i in range(0, len(x)-w, h2)])
db = 20*np.log10(env+1e-9)
print("\n=== 能量曲线（每 0.5s 平均 dB）===")
tt = np.arange(len(db))*0.1
for a in np.arange(0, 263, 1.0):
    m = (tt>=a)&(tt<a+0.5)
    bar = "#"*int(max(0,(db[m].mean()+45))*1.2)
    print(f"  {a:5.1f} {db[m].mean():6.1f} {bar}")

json.dump({"bpm_peaks":[[round(60/(i/fps),2), round(v,3)] for v,i in peaks],
           "kick":k,"snare":s}, open(r"D:\ai音乐mv\寂寞烟火\beat.json","w"), indent=1)
print("\nsaved beat.json")
