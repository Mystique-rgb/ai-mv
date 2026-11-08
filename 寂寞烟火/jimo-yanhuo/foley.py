import sys, json
import numpy as np
import soundfile as sf

LIB = 'D:/test/lemo-opuscar'
sys.path.insert(0, LIB + '/core/audio')
import sfx
from sfx import SR, add, whoosh, thump, pop, ignite, brown, noise, bp, lp, hp, norm, limit, t_

here = sys.argv[1]
TL = json.load(open(here + '/out/timeline.json', encoding='utf-8'))
BEAT, T0, DUR = TL['BEAT'], TL['T0'], TL['DUR']
beat = lambda n: T0 + BEAT * n

N = int(DUR * SR)
buf = np.zeros((N, 2), dtype=np.float64)

# 1. sea bed: low brown noise, swelling slowly; nearly gone in the grey world, sparks after the burst
bed = lp(brown(DUR), 900)
bed = norm(bed) * (0.5 + 0.5 * np.sin(2 * np.pi * np.arange(len(bed)) / SR / 7.0)) ** 1.5
tt = np.arange(len(bed)) / SR
env = np.ones_like(tt)
env *= np.where(tt < 24.36, 1.0, np.clip(1 - (tt - 24.36) / 1.2, 0.04, 1))
env *= np.where(tt < 39.4, 1.0, 0.0) + np.where(tt >= 39.4, np.clip(1 - (tt - 39.4) / 4.0, 0, 1) * 0.5, 0)
env *= np.clip((DUR - 3.0 - tt) / 2.0, 0, 1)
bed = bed * env
add(buf, bed, 0.0, 0.05, 0.0)

# 2. knife scrapes on the bar lines (J-cut: one beat early)
def scrape(at, v=1.0, pan=0.0, d=0.35):
    w = bp(noise(d), 1200, 5200) * np.hanning(int(d * SR))
    w = norm(w) * 0.8 + norm(whoosh(d, 1.0)) * 0.2
    add(buf, w, at, 0.11 * v, pan)
for i, s in enumerate([0.46, 4.00, 7.54, 11.08, 14.62, 18.16, 19.93, 21.70, 23.47]):
    scrape(max(0.0, s - BEAT), 1.0, (-0.3, 0.3)[i % 2])
scrape(24.36 - BEAT, 1.4, 0.0, 1.1)       # the grey wash
scrape(42.94 - BEAT, 0.8, 0.2)
scrape(beat(98) - 0.05, 1.0, 0.0, 0.5)    # rainbow cut

# 3. ember crackle from 5.77 s to the rise
rng = np.random.default_rng(3)
for _ in range(60):
    at = rng.uniform(5.77, 38.4)
    c = hp(noise(0.02), 3500) * np.exp(-np.arange(int(0.02 * SR)) / (0.004 * SR))
    add(buf, norm(c), at, rng.uniform(0.01, 0.03), rng.uniform(-0.5, 0.5))

# 4. stars: wet pops climbing in pitch (first sound after the quiet shot)
for i in range(7):
    p = pop(1.0)
    k = 2 ** (i / 7.0)
    idx = (np.arange(int(len(p) / k)) * k).astype(int)
    add(buf, p[idx], beat(80 + i), 0.09, (-0.6, 0.6)[i % 2] * (0.4 + 0.1 * i))
for i in range(7):
    p = pop(1.0)
    add(buf, p, beat(97 + i) + 0.0, 0.05, (-0.5, 0.5)[i % 2])

# 5. firework: low thump + burst under the returning kick, sparkle tail
add(buf, ignite(1.0), beat(88), 0.16, 0.0)
add(buf, thump(1.0, 55), beat(88), 0.18, 0.0)
sp = hp(noise(2.5), 4500) * np.exp(-t_(2.5) / 0.7)
add(buf, norm(sp), beat(88) + 0.05, 0.05, 0.0)

# 6. last knife mark
scrape(53.2, 0.7, 0.0, 0.5)

buf[:, 0] = limit(buf[:, 0], 0.9); buf[:, 1] = limit(buf[:, 1], 0.9)
sf.write(here + '/out/foley.wav', buf.astype(np.float32), SR)
print('foley peak', float(np.abs(buf).max()), 'dur', len(buf) / SR)
