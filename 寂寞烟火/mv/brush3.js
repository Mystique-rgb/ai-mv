// 三层笔触：大平面铺明暗 → 中笔压转折 → 小刀收边缘
// 厚涂的立体感来自笔触尺寸的层级，而不是笔触本身的纹理
import { KNIFE, DAB, LINE } from './engine/impasto.js';
import { C, h1, lerp, clamp, mixc, shade } from './common.js';

export const gradAt = (cols, k) => {
  const u = clamp(k, 0, 1) * (cols.length - 1);
  const i = Math.min(cols.length - 2, Math.floor(u));
  return mixc(cols[i], cols[i + 1], u - i);
};

// —— 第一层：大平面（40–60 px 的刀，铺出 2–3 个明暗阶）
export function layerPlane(S, o) {
  const { x0, y0, x1, y1, cols, n = 6, seed = 0, ang = 0, alpha = 1, widMul = 1.9 } = o;
  const w = x1 - x0, h = y1 - y0;
  for (let i = 0; i < n; i++) {
    const k = i / Math.max(1, n - 1);
    const y = y0 + h * (i + .5) / n;
    const c = gradAt(cols, k);
    S.push({
      x: x0 + w / 2 + (h1(seed + i * 3) - .5) * w * .05, y,
      ang: ang + (h1(seed + i * 7) - .5) * .035,
      len: w * (1.02 + h1(seed + i * 11) * .05),
      wid: (h / n) * widMul,
      c, c2: mixc(c, gradAt(cols, k + .25), .55),
      seed: seed + i * 5, type: KNIFE, taper: .1, skew: .55, alpha, hgt: 1.05,
    });
  }
}

// —— 第二层：中笔（15–28 px），在区域内撒短刀，压出转折和脏
export function layerMid(S, o) {
  const { x0, y0, x1, y1, cols, n = 26, seed = 0, ang = 0, alpha = 1 } = o;
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, h1(seed + i * 3.1)) + (h1(seed + i * 5.7) - .5) * 40;
    const y = lerp(y0, y1, h1(seed + i * 7.3));
    const c = gradAt(cols, h1(seed + i * 11.9));
    S.push({
      x, y, ang: ang + (h1(seed + i * 13.1) - .5) * .55,
      len: 90 + h1(seed + i * 17.3) * 190, wid: 15 + h1(seed + i * 19.7) * 15,
      c, c2: shade(c, .82), seed: seed + i * 23, type: KNIFE,
      taper: .3, skew: .4, alpha: alpha * (.55 + h1(seed + i * 29) * .45), hgt: 1.15,
    });
  }
}

// —— 第三层：细刀（3–7 px），沿一条边收口，让轮廓有刃感
export function edgeRun(S, pts, o = {}) {
  const { c, seed = 0, n = null, alpha = 1, wid = 5, widJit = .5 } = o;
  const cnt = n ?? pts.length;
  for (let i = 0; i < cnt; i++) {
    const [x, y, a] = pts[i];
    S.push({
      x, y, ang: a, len: 70 + h1(seed + i * 3.3) * 120, wid: wid + h1(seed + i * 7.1) * widJit * 6,
      c, seed: seed + i * 11, type: KNIFE, taper: .55, alpha, hgt: 1.3,
    });
  }
}

// —— 刀片：厚实的钢片（刀身 / 刃口分色 / 高光）
export function knifeBlade(S, o) {
  const { x, y, ang, len = 900, wid = 54, seed = 0, alpha = 1 } = o;
  const nx = -Math.sin(ang), ny = Math.cos(ang);       // 法线
  const dark = [0.27, 0.26, 0.25], mid = [0.46, 0.45, 0.43], lit = [0.63, 0.62, 0.59];
  // 刀身：一整条深灰（同一高度，避免光照把它割成黑斑）
  S.push({ x, y, ang, len, wid, c: dark, c2: [0.13, 0.13, 0.12], seed: seed + 1,
           type: KNIFE, taper: .07, skew: .1, alpha, hgt: 1.0 });
  // 亮面：贴着刃的一侧
  S.push({ x: x - nx * wid * .24, y: y - ny * wid * .24, ang, len: len * .97, wid: wid * .46,
           c: lit, c2: mid, seed: seed + 2, type: KNIFE, taper: .1, skew: .04, alpha: alpha * .95, hgt: 1.0 });
  // 刃口：一条极亮的线
  S.push({ x: x - nx * wid * .48, y: y - ny * wid * .48, ang, len: len * .99, wid: 3.0,
           c: C.white, seed: seed + 3, type: KNIFE, taper: .08, alpha: alpha * .95, hgt: 1.0 });
  // 刀背上的几道磨痕
  for (let i = 0; i < 4; i++) {
    const t = .2 + h1(seed + i * 7) * .68;
    S.push({ x: x + Math.cos(ang) * (t - .5) * len + nx * wid * .3, y: y + Math.sin(ang) * (t - .5) * len + ny * wid * .3,
             ang, len: 60 + h1(seed + i * 11) * 140, wid: 1.8, c: [0.5, 0.5, 0.48],
             seed: seed + 20 + i, type: KNIFE, alpha: alpha * .5, taper: .9 });
  }
}

// —— 一刀劈开的裂口：内部分层深色 + 边缘翻卷的干颜料
export function crackOpen(S, o) {
  const { x, y0, y1, gap, seed = 0, deep = C.deep, glow = C.cobalt, alpha = 1, t = 0 } = o;
  const n = 14;
  // 内部：上深下亮，带涌动的亮部
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    const yy = lerp(y0, y1, k);
    const w = gap * (1 + Math.sin(k * 3.1 + t * 2) * .06);
    S.push({ x, y: yy, ang: Math.PI / 2, len: w * 1.5 + 120, wid: 96,
             c: mixc(deep, shade(deep, .6), k * .7), c2: mixc(glow, deep, .4), seed: seed + i * 3, type: KNIFE,
             taper: .05, skew: .7, alpha, hgt: 1.2 });
  }
  // 内部亮芯（涌动的蓝）
  for (let i = 0; i < 7; i++) {
    const yy = lerp(y0 + 60, y1 - 60, h1(seed + i * 5.1));
    S.push({ x: x + (h1(seed + i * 7.7) - .5) * gap * .5, y: yy, ang: Math.PI / 2 + (h1(seed + i * 9.3) - .5) * .3,
             len: 160 + h1(seed + i * 11.1) * 260, wid: 14 + h1(seed + i * 13.9) * 22,
             c: mixc(glow, C.ice, .45), c2: glow, seed: seed + 40 + i, type: KNIFE, taper: .5, alpha: alpha * .8, hgt: 1.35 });
  }
  // 两侧翻卷的干颜料：小刀沿裂口边缘堆
  for (const s of [-1, 1]) {
    for (let i = 0; i < 22; i++) {
      const k = h1(seed + i * 3.7 + s);
      const yy = lerp(y0, y1, k);
      const xx = x + s * (gap * .5 + 6 + h1(seed + i * 5.3) * 26);
      S.push({ x: xx, y: yy, ang: s > 0 ? .1 : Math.PI - .1, len: 26 + h1(seed + i * 7.9) * 54,
               wid: 12 + h1(seed + i * 11.3) * 22, c: mixc(C.canvasDark, C.canvas, h1(seed + i * 13.7)),
               c2: C.canvasDark, seed: seed + 80 + i + s * 30, type: KNIFE, taper: .62, alpha, hgt: 1.15 });
    }
  }
}

// —— 一滴厚颜料（有主体、高光、投影三块）
export function paintDrop(S, o) {
  const { x, y, r, c, seed = 0, alpha = 1, stretch = 1, hi = null } = o;
  // 主体：下圆上收，像挂着的一滴
  S.push({ x, y: y + r * .18, ang: Math.PI / 2, len: r * 1.62 * stretch, wid: r * 1.78,
           c, c2: shade(c, .74), seed: seed + 1, type: DAB, alpha, hgt: 1.45 });
  // 上部的细颈
  S.push({ x, y: y - r * .82 * stretch, ang: Math.PI / 2, len: r * 1.0 * stretch, wid: r * .62,
           c: mixc(c, shade(c, .88), .5), seed: seed + 4, type: DAB, alpha, hgt: 1.35 });
  // 高光（左上偏中）
  S.push({ x: x - r * .30, y: y - r * .18, ang: .85, len: r * .46, wid: r * .28,
           c: hi || mixc(c, [1, 1, 1], .72), seed: seed + 2, type: DAB, alpha: alpha * .92, hgt: 1.6 });
  // 底部透光
  S.push({ x: x + r * .10, y: y + r * .66, ang: .08, len: r * .38, wid: r * .15,
           c: mixc(c, [1, 1, 1], .4), seed: seed + 5, type: DAB, alpha: alpha * .55 });
}
