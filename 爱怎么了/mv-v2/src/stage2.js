// stage2.js —— 分镜施工用的常用工具：卡点台阶、转场（纸板滑入、遮幅、iris、黑场呼吸）、纸片群。
// 全部是 t 的纯函数。转场一定在镜头首尾（分镜词 §9 转场表）。
// BEAT / OFF 来自 core.js（PROJECT.bpm = 69.36，首拍 0.08）。
const bpos = t => (t - OFF) / BEAT;
const beatI = t => Math.floor(bpos(t));
const pulseK = (t, k = 5) => Math.exp(-frac(bpos(t)) * k);          // 每拍一个 1→0 的脉冲
const beatStep = (t, t0, n) => clamp(Math.floor((t - t0) / BEAT), 0, n);   // 从 t0 起每拍走一格

// 整屏遮一层（黑场呼吸、闪白、纸色雾）
function veil(k, col = '#06050a') {
  if (k > .004) paint(rectPts(-140, -140, W + 280, H + 280), { wash: col, washOp: 255 * clamp(k), ink: null });
}
function dipIn(lt, d = .26) { if (lt < d) veil(1 - ease(lt / d)); }
function dipOut(lt, dur, d = .26) { if (lt > dur - d) veil(ease(seg(lt, dur - d, dur))); }

// 纸板冲刷转场：一整张纸从上/下/左/右滑过画面（比刷子更贴纸雕的"纸"质感）
function paperSweep(p, k, dir = 'up', col) {
  if (k <= 0 || k >= 1) return;
  const c1 = col || mixCol('#06050a', p.front, .5), c2 = mixCol(c1, p.light, .10);
  const q = ease(k);
  const off = (dir === 'up' ? -1 : 1) * (1 - q) * H;
  paint(rectPts(-40, off - 20, W + 80, H + 60), { wash: c1, ink: null });
  paint(rectPts(-40, off + H - 18, W + 80, 26), { wash: c2, ink: null });     // 纸的切边受光
}
// 遮幅转场：一条挡满画面的纸从一侧盖过（near-plane occluder）
function occluder(k, col, dir = 1) {
  if (k <= 0 || k >= 1) return;
  const w = W * ease(k) * 1.06;
  paint(rectPts(dir > 0 ? -20 : W - w + 20, -40, w, H + 80), { wash: col, ink: null });
}
// 洞形 iris（烧穿的洞 → 下一个镜头的窗洞）
function irisOut(lt, dur, d = .5, cx = CX, cy = 620, col = '#06050a') {
  if (lt > dur - d) iris(cx, cy, lerp(1500, 8, ease(seg(lt, dur - d, dur))), col);
}
function irisIn(lt, d = .45, cx = CX, cy = 620, col = '#06050a') {
  if (lt < d) iris(cx, cy, lerp(8, 1500, ease(lt / d)), col);
}

// 纸片群（照片碎点 / 纸雨）：一次算出 n 片的位置，纯函数
function paperField(n, seed, fn) { for (let i = 0; i < n; i++) fn(i, hash(i * 7.13 + seed), hash(i * 3.31 + seed + 9), hash(i * 1.77 + seed + 4)); }
