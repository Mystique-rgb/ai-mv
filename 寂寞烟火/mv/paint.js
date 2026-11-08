// 刀触素材库：所有东西都是调色刀刮出来的
import { KNIFE, DAB, BRUSH, LINE } from './engine/impasto.js';
import { C, RAINBOW, h1, clamp, lerp, mixc, shade } from './common.js';

const gradAt = (cols, k) => {
  const u = clamp(k, 0, 1) * (cols.length - 1);
  const i = Math.min(cols.length - 2, Math.floor(u));
  return mixc(cols[i], cols[i + 1], u - i);
};

// —— 一片区域用若干道平行大刀填满（错位、色差，避免"色块"感）
export function fillArea(S, x0, y0, x1, y1, col, o = {}) {
  const { n = 6, seed = 0, ang = 0, c2 = null, taper = .1, skew = .35, alpha = 1, jit = .4 } = o;
  const w = x1 - x0, h = y1 - y0;
  for (let i = 0; i < n; i++) {
    const k = i / Math.max(1, n - 1);
    const yy = y0 + h * (i + .5) / n;
    const cc = c2 ? mixc(col, c2, k * .8) : col;
    S.push({
      x: x0 + w / 2 + (h1(seed + i * 3) - .5) * w * .06, y: yy,
      ang: ang + (h1(seed + i * 7) - .5) * .04,
      len: w * (1.02 + h1(seed + i * 11) * .06), wid: (h / n) * 1.45,
      c: cc, c2: mixc(cc, shade(cc, .72), .45), seed: seed + i * 5, type: KNIFE, taper, skew,
      alpha, hgt: 1,
    });
  }
}

// —— 天空：大平面铺色 → 中笔压空气/云 → （小刀由调用方按需加）
export function sky(S, o = {}) {
  const { x0 = -260, x1 = 2180, y0 = -180, y1 = 900, cols, n = 24, seed = 0, alpha = 1, detail = 1, ang: baseAng = 0 } = o;
  const w = x1 - x0, h = y1 - y0;
  // 第一层：大平面
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    const y = lerp(y0, y1, k);
    const c = gradAt(cols, k);
    S.push({
      x: x0 + w / 2 + (h1(seed + i * 3) - .5) * w * .07, y,
      ang: baseAng + (h1(seed + i * 7) - .5) * .045,
      len: w * (1.02 + h1(seed + i * 11) * .35), wid: (h / n) * 2.6,
      c, c2: gradAt(cols, Math.min(1, k + .09)),
      seed: seed + i * 13, type: KNIFE, taper: .16, skew: .55, alpha, hgt: .92,
    });
  }
  if (detail <= 0) return;
  // 第二层：中笔——空气里的脏、云的团块
  const nm = Math.round(30 * detail);
  for (let i = 0; i < nm; i++) {
    const k = h1(seed + 300 + i * 3.1);
    const y = lerp(y0, y1, clamp(k + (h1(seed + i * 7.3) - .5) * .12, 0, 1));
    // 取色只在本地附近偏一点点，避免在渐变色上"跳色"成划痕
    const base = gradAt(cols, k);
    const c = mixc(base, gradAt(cols, clamp(k + (h1(seed + i * 9.7) - .5) * .09, 0, 1)), .65);
    const tw = Math.min(1, Math.abs(base[0] - c[0]) + Math.abs(base[1] - c[1]) + Math.abs(base[2] - c[2]));
    S.push({
      x: lerp(x0, x1, h1(seed + i * 5.7)), y, ang: baseAng * 2.4 + (h1(seed + i * 11.3) - .5) * .55,
      len: 130 + h1(seed + i * 13.7) * 300, wid: 17 + h1(seed + i * 17.9) * 27,
      c, c2: shade(c, .9), seed: seed + 320 + i, type: KNIFE,
      taper: .48, alpha: alpha * (.22 + h1(seed + i * 19.3) * .28) * (1 - tw * .4), hgt: 1.06,
    });
  }
}

// —— 海：大横刀铺面 → 中笔压浪 → 小刀挑浪尖
export function sea(S, o = {}) {
  const { x0 = -260, x1 = 2180, y0, y1, n = 20, seed = 0, cols = [C.deep, C.seaDeep],
          foam = 1, t = 0, alpha = 1, detail = 1 } = o;
  const w = x1 - x0, h = y1 - y0;
  // 第一层：大横向刀
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    const y = lerp(y0, y1, k * k * .55 + k * .45);
    const c = mixc(cols[0], cols[1], k);
    const sway = Math.sin(t * 2.2 + i * .8) * (4 + k * 30);
    S.push({
      x: lerp(x0, x1, .5) + sway + (h1(seed + i * 3) - .5) * 200, y,
      ang: (h1(seed + i * 7) - .5) * .035,
      len: w * (.85 + h1(seed + i * 11) * .4) * (0.75 + k * .5),
      wid: (h / n) * (1.1 + k * 1.9),
      c, c2: mixc(c, C.ice, .18 + k * .12), seed: seed + i * 17, type: KNIFE, taper: .2, skew: .6, alpha,
    });
  }
  // 地平线压深
  S.push({ x: lerp(x0, x1, .5), y: y0 + 6, ang: 0, len: w * 1.1, wid: 26,
           c: shade(cols[0], .55), c2: cols[0], seed: seed + 5, type: KNIFE, taper: .1, alpha: alpha * .9 });
  if (detail <= 0) return;
  // 第二层：中笔——浪的斜向转折
  const nm = Math.round(34 * detail);
  for (let i = 0; i < nm; i++) {
    const k = Math.pow(h1(seed + 400 + i * 3.7), .8);
    const y = lerp(y0 + h * .06, y1, k);
    const c = mixc(cols[0], cols[1], k * .8);
    S.push({
      x: lerp(x0, x1, h1(seed + i * 5.3)) + Math.sin(t * 2.4 + i) * 18, y,
      ang: -.32 + (h1(seed + i * 7.9) - .5) * .5,
      len: 90 + h1(seed + i * 11.3) * 260, wid: 12 + h1(seed + i * 13.1) * 20,
      c: mixc(c, C.ice, .22), c2: shade(c, .78), seed: seed + 420 + i, type: KNIFE,
      taper: .45, alpha: alpha * (.4 + h1(seed + i * 17.3) * .4), hgt: 1.2,
    });
  }
  // 第三层：浪尖白片（更小更利）
  if (foam > 0) {
    const nf = Math.round(20 * foam);
    for (let i = 0; i < nf; i++) {
      const k = h1(seed + 200 + i);
      const y = lerp(y0 + h * .12, y1, Math.pow(k, .8));
      S.push({
        x: lerp(x0, x1, h1(seed + 300 + i)) + Math.sin(t * 2.2 + i) * 22,
        y, ang: (h1(seed + 400 + i) - .5) * .26,
        len: (60 + h1(seed + 500 + i) * 170) * (.6 + k * .9), wid: 7 + h1(seed + 600 + i) * 13,
        c: C.foam, c2: C.ice, seed: seed + 700 + i, type: KNIFE, alpha: .82 * alpha, taper: .6, skew: .8, hgt: 1.3,
      });
    }
  }
}

// —— 夜空：斜向暗底 + 点状星尘（不是一整屏横纹）
export function nightField(S, o = {}) {
  const { x0 = -300, x1 = 2220, y0 = -220, y1 = 1340, seed = 0, t = 0, alpha = 1, dust = 1, base = C.night } = o;
  const w = x1 - x0, h = y1 - y0;
  // 底：少量斜向大笔，只铺色调不铺纹理
  for (let i = 0; i < 9; i++) {
    const k = i / 8;
    S.push({ x: lerp(x0, x1, .5) + (h1(seed + i * 3) - .5) * 260, y: lerp(y0, y1, k),
             ang: .38 + (h1(seed + i * 7) - .5) * .18, len: w * (1.1 + h1(seed + i * 11) * .3), wid: (h / 9) * 2.1,
             c: mixc(base, shade(base, .62), k * .8), c2: shade(base, .8),
             seed: seed + i * 5, type: KNIFE, taper: .2, skew: .5, alpha, hgt: .8 });
  }
  // 星尘：大量小点，密疏不均（把"横纹"打散成"颗粒"）
  const nd = Math.round(420 * dust);
  for (let i = 0; i < nd; i++) {
    const cx = h1(seed + 500 + i * 1.7) * 2 - 1;
    const x = lerp(x0, x1, .5) + cx * w * .5;
    const y = y0 + Math.pow(h1(seed + i * 3.3), .85) * h;
    const r = 1.6 + h1(seed + i * 7.1) * 3.4;
    const tw = .5 + .5 * Math.sin(t * 1.6 + i * 0.7);
    S.push({ x, y, ang: h1(seed + i * 11.9) * 3.1, len: r * 2.1, wid: r * 1.4,
             c: mixc(C.indigo, C.white, .18 + h1(seed + i * 13.7) * .3), seed: seed + 600 + i,
             type: DAB, alpha: alpha * (.16 + tw * .3), hgt: .6 });
  }
}

// —— 云团：一堆重叠的圆刀叠成一坨（云是团，不是片）
export function cloudPuff(S, o) {
  const { x, y, s = 1, seed = 0, lit = C.cloud, dark = null, alpha = 1 } = o;
  const dk = dark || mixc(lit, C.sky, .52);
  // 主体：中间高两边低的几个大圆刀，互相盖住，边缘自然圆
  const lobes = 6;
  for (let i = 0; i < lobes; i++) {
    const u = i / (lobes - 1) - .5;                       // -0.5 … 0.5
    const px = x + u * s * 250;
    const py = y - Math.cos(u * Math.PI) * s * 52;
    const r = s * (150 - Math.abs(u) * 62);
    S.push({
      x: px, y: py, ang: .12 * u, len: r * 1.12, wid: r * .98,
      c: mixc(lit, dk, .06 + Math.abs(u) * .52), c2: mixc(lit, C.white, .28),
      seed: seed + i * 13, type: 0, taper: .55, alpha, hgt: 1.08,
    });
  }
  // 底部的暗芯：云才有厚度
  S.push({ x, y: y + s * 48, ang: -.04, len: s * 240, wid: s * 44, c: dk, c2: shade(dk, .88),
           seed: seed + 60, type: 0, taper: .72, alpha: alpha * .9 });
  // 顶上的亮边：受光的那一条
  for (let i = 0; i < 3; i++) {
    const u = (i - 1) * .30;
    S.push({
      x: x + u * s * 250, y: y - s * (54 + Math.cos(u * 2.4) * 10), ang: -.08,
      len: s * (150 - Math.abs(u) * 70), wid: s * 18,
      c: mixc(lit, C.white, .62), seed: seed + 70 + i, type: 0, taper: .8, alpha: alpha * .9,
    });
  }
}

// —— 一颗星：斜十字刀点
export function star(S, x, y, r, c, seed, alpha = 1) {
  S.push({ x, y, ang: .18, len: r * 2.8, wid: r * .5, c, c2: mixc(c, C.white, .55), seed, type: KNIFE, taper: .92, alpha });
  S.push({ x, y, ang: 1.72, len: r * 1.9, wid: r * .42, c, seed: seed + 1, type: KNIFE, taper: .92, alpha: alpha * .85 });
  S.push({ x, y, ang: 0, len: r * 1.15, wid: r * 1.15, c: mixc(c, C.white, .5), seed: seed + 2, type: DAB, alpha });
}

// —— 花火：放射状刀束 + 碎屑
export function firework(S, o = {}) {
  const { x, y, r, n = 26, seed = 0, cols = RAINBOW, alpha = 1, spread = 1, thin = 0 } = o;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + h1(seed + i) * .3;
    const len = r * (.5 + h1(seed + i * 3) * .6) * spread;
    const c = cols[(i + Math.floor(h1(seed) * 7)) % cols.length];
    S.push({
      x: x + Math.cos(a) * len * .5, y: y + Math.sin(a) * len * .5, ang: a, len,
      wid: r * (.075 + h1(seed + i * 7) * .05) * (1 - thin * .4),
      c, c2: mixc(c, C.white, .5), seed: seed + i * 3, type: KNIFE, taper: .88, alpha,
    });
  }
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + h1(seed + 50 + i) * .8;
    const d = r * (.75 + h1(seed + 60 + i) * .7);
    S.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, ang: a, len: r * .12, wid: r * .1,
             c: cols[i % cols.length], seed: seed + 90 + i, type: DAB, alpha: alpha * .9 });
  }
}

// —— 纸船：四刀折出来
export function boat(S, x, y, s, o = {}) {
  const { seed = 0, alpha = 1, rot = 0, col = C.white } = o;
  const cr = Math.cos(rot), sr = Math.sin(rot);
  const P = (px, py) => [x + px * cr - py * sr, y + px * sr + py * cr];
  const hullC = mixc(col, C.ice, .35);
  // 船底
  const [hx, hy] = P(0, 0);
  S.push({ x: hx, y: hy, ang: rot, len: s * 1.5, wid: s * .42, c: hullC, c2: shade(hullC, .8), seed: seed + 1, type: KNIFE, taper: .35, alpha });
  // 船身左
  const [lx, ly] = P(-s * .45, -s * .3);
  S.push({ x: lx, y: ly, ang: rot - .55, len: s * .95, wid: s * .3, c: col, c2: hullC, seed: seed + 2, type: KNIFE, taper: .3, alpha });
  // 船身右
  const [rx, ry] = P(s * .45, -s * .3);
  S.push({ x: rx, y: ry, ang: rot + .55, len: s * .95, wid: s * .3, c: col, seed: seed + 3, type: KNIFE, taper: .3, alpha });
  // 帆
  const [mx, my] = P(0, -s * 1.05);
  S.push({ x: mx, y: my, ang: rot + Math.PI / 2, len: s * 1.5, wid: s * .5, c: mixc(col, C.white, .5), c2: col, seed: seed + 4, type: KNIFE, taper: .45, bend: .18, alpha });
  // 桅杆
  const [px, py] = P(0, -s * .55);
  S.push({ x: px, y: py, ang: rot + Math.PI / 2, len: s * 1.6, wid: s * .07, c: shade(hullC, .7), seed: seed + 5, type: KNIFE, taper: .2, alpha });
}

// —— 主角：赤陶色方块小人（Clawd 造型的刀触版）
export function clawd(S, x, y, u, o = {}) {
  const col = o.col || C.terra;
  const dark = shade(col, .62), light = mixc(col, [1, 1, 1], .26);
  const seed = o.seed || 0;
  const sq = o.sq || 0;
  const st = clamp(1 - sq * .42, .45, 1.5);
  const w = 10 * u * (o.wide || 1);
  const hb = 6 * u * st;
  const legH = 1.2 * u * clamp(1 - sq * .3, .4, 1.4);
  const top = y - legH - hb;
  const view = o.view || 'front';
  const flip = o.flip || 1;
  const al = o.alpha ?? 1;
  const walk = o.walk || 0;

  // 腿（四条短腿 + 脚掌）
  for (let i = 0; i < 4; i++) {
    const side = i % 2 ? 1 : -1;
    const depth = i > 1 ? 1.9 : 0;
    const lx = x + (side * (2.4 + depth)) * u * w / (10 * u) * flip;
    // 对角步态：左前/右后同相，右前/左后反相；幅度放大到能看见
    const phs = Math.sin(walk + (i === 0 || i === 3 ? 0 : Math.PI));
    const ph = phs * .58 * u;
    S.push({ x: lx + ph, y: y - legH * .55, ang: Math.PI / 2 + phs * .34, len: legH * 1.45, wid: 1.15 * u,
             c: dark, c2: shade(col, .78), seed: seed + 40 + i, type: KNIFE, taper: .32, alpha: al });
    S.push({ x: lx + ph * 1.4, y: y - legH * .08, ang: -phs * .5, len: 1.35 * u, wid: .55 * u,
             c: shade(col, .55), seed: seed + 44 + i, type: KNIFE, taper: .5, alpha: al });
  }

  // 身体：7 道横刀
  const n = 7;
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    const yy = top + hb * (i + .5) / n;
    const cc = mixc(light, col, k * .55);
    S.push({
      x: x + (h1(seed + i * 3) - .5) * .3 * u, y: yy,
      ang: (h1(seed + i * 7) - .5) * .05,
      len: w * (.96 + h1(seed + i * 11) * .06), wid: (hb / n) * 1.55,
      c: cc, c2: mixc(cc, dark, .42), seed: seed + i * 5, type: KNIFE, taper: .05, skew: .2, alpha: al,
    });
  }
  // 底部压边
  S.push({ x, y: y - legH + hb * .02, ang: 0, len: w * .99, wid: hb * .1, c: shade(col, .48), seed: seed + 90, type: KNIFE, taper: .15, alpha: al });

  // 手臂
  const arm = (side, a) => {
    const ax = x + side * (w * .46) * flip;
    const ay = top + hb * .58;                 // 身体中下部
    const dir = side * flip;
    const ang = (0.85 - (a ?? 0) * .95) * dir; // a=0 垂下，a=1.35 举高
    const al2 = 1.55 * (1 + Math.max(0, a ?? 0) * .52);   // 举得越高伸得越长，够东西时才够得着
    S.push({
      x: ax + Math.cos(ang) * .66 * u * dir, y: ay + Math.sin(ang) * .66 * u,
      ang: ang, len: al2 * u, wid: 1.25 * u,
      c: mixc(col, dark, .06), c2: dark, seed: seed + 60 + side + 2, type: KNIFE, taper: .45, alpha: al,
    });
  };
  if (view !== 'back' && view !== 'qback') { arm(-1, o.aL ?? -.35); arm(1, o.aR ?? -.35); }

  // 眼睛
  if (view !== 'back' && view !== 'qback') {
    const ey = top + hb * .42;
    const eyeCol = o.eyeCol || shade(C.black, 1.1);
    const eh = o.eyes === 'closed' ? .3 : o.eyes === 'wide' ? 2.2 : o.eyes === 'sleepy' ? 1.0 : 1.75;
    const ew = o.eyes === 'wide' ? .62 : .52;
    const one = (sx) => {
      S.push({ x: x + sx * u * flip, y: ey, ang: Math.PI / 2, len: eh * u, wid: ew * u,
               c: eyeCol, c2: shade(eyeCol, .85), seed: seed + 70 + sx * 3, type: KNIFE, taper: .26, alpha: al });
      if (o.eyes === 'shine' || o.eyes === 'spark') {
        S.push({ x: x + sx * u * flip, y: ey - .45 * u, ang: .2, len: .55 * u, wid: .5 * u,
                 c: o.glow || C.lemon, seed: seed + 74 + sx, type: DAB, alpha: al });
      }
    };
    if (view === 'side') one(2.2);
    else { one(-2.5); one(2.5); }
  }

  // 嘴
  if (o.mouth) {
    const my = top + hb * .79;
    S.push({ x, y: my, ang: 0, len: 1.9 * u * (o.mouth === 'open' ? 1.2 : 1), wid: (o.mouth === 'open' ? .8 : .42) * u,
             c: shade(col, .42), c2: shade(col, .3), seed: seed + 80, type: KNIFE, taper: .42, alpha: al,
             bend: o.mouth === 'smile' ? .4 : o.mouth === 'frown' ? -.34 : 0 });
  }

  // 腮红
  if (o.blush) {
    for (const sx of [-3.6, 3.6]) S.push({ x: x + sx * u * flip, y: top + hb * .68, ang: 0, len: 1.4 * u, wid: .7 * u,
      c: C.pink, seed: seed + 85 + sx, type: DAB, alpha: al * o.blush });
  }
}

// —— 灰色剪影人潮（厚重剪影：一刀身体 + 一刀头，边缘被笔触切断）
export function crowdSil(S, o = {}) {
  const { n = 22, y0, y1, x0 = -200, x1 = 2100, t = 0, seed = 0, speed = 150, col = C.greyDark, alpha = 1 } = o;
  for (let i = 0; i < n; i++) {
    const row = h1(seed + i * 3);
    const y = lerp(y0, y1, row);
    const s = 16 + row * 30;
    const span = x1 - x0 + 400;
    const x = x0 + ((h1(seed + i * 7) * span + t * speed * (0.6 + h1(seed + i * 11) * .8)) % span);
    const c = mixc(col, C.grey, h1(seed + i * 5) * .45);
    // 身体：一刀到脚，略微前倾
    S.push({ x, y: y - s * 1.6, ang: Math.PI / 2 + (h1(seed + i * 13) - .5) * .08, len: s * 2.9, wid: s * 1.35,
             c, c2: shade(c, .72), seed: seed + i * 13, type: KNIFE, taper: .35, alpha });
    // 头：压在肩上（别飘）
    S.push({ x: x + (h1(seed + i * 17) - .5) * s * .25, y: y - s * 3.15, ang: h1(seed + i * 19) * 3.1,
             len: s * 1.45, wid: s * 1.3, c: shade(c, 1.09), c2: c, seed: seed + i * 23, type: DAB, alpha });
    // 两条腿交替
    const ph = Math.sin(t * 7 + i) * s * .38;
    S.push({ x: x + ph, y: y - s * .3, ang: Math.PI / 2 + .1, len: s * 1.15, wid: s * .4,
             c: shade(c, .82), seed: seed + i * 29, type: KNIFE, taper: .3, alpha });
    S.push({ x: x - ph, y: y - s * .3, ang: Math.PI / 2 - .1, len: s * 1.15, wid: s * .4,
             c: shade(c, .68), seed: seed + i * 33, type: KNIFE, taper: .3, alpha: alpha * .92 });
    // 中笔：肩头的一小笔受光（贴住身体，不外伸）
    S.push({ x: x + (h1(seed + i * 31) - .5) * s * .3, y: y - s * 2.5, ang: 1.45 + (h1(seed + i * 37) - .5) * .22,
             len: s * 1.3, wid: s * .4, c: mixc(c, C.greyLight, .38), seed: seed + i * 41,
             type: KNIFE, taper: .6, alpha: alpha * .5 });
  }
}

// —— 彩虹：一条有厚度的颜料带
export function rainbowArc(S, o = {}) {
  const { cx, cy, r, seed = 0, alpha = 1, thick = 1, wob = 0, n = 7, a0 = Math.PI * 1.02, a1 = Math.PI * 1.98 } = o;
  for (let b = 0; b < n; b++) {
    const c = RAINBOW[b % RAINBOW.length];
    const rr = r * (1 - b * .035) + Math.sin(b * 2.1) * 4;
    const segs = 26;
    for (let i = 0; i < segs; i++) {
      const a = a0 + (a1 - a0) * (i / segs);
      const jit = Math.sin(i * .9 + b) * wob;
      const x = cx + Math.cos(a) * (rr + jit);
      const y = cy + Math.sin(a) * (rr + jit) * .95;
      S.push({ x, y, ang: a + Math.PI / 2, len: (r * (a1 - a0) / segs) * 1.9, wid: r * .055 * thick,
               c, c2: mixc(c, C.white, .3), seed: seed + b * 40 + i, type: KNIFE, taper: .2, alpha });
    }
  }
}

// —— 转场扫盖：一片笔触从一侧扫过来盖住画面
export function sweep(S, o = {}) {
  const { x0 = -200, x1 = 2120, y0 = -160, y1 = 1180, p, dir = 1, c, seed = 0, n = 16, alpha = 1 } = o;
  const k = clamp(p, 0, 1);
  if (k <= 0) return;
  const edge = dir > 0 ? lerp(x0 - 200, x1 + 260, k) : lerp(x1 + 200, x0 - 260, k);
  const near = dir > 0 ? x0 - 200 : x1 + 200;
  const len = Math.abs(edge - near);
  for (let i = 0; i < n; i++) {
    const yy = lerp(y0, y1, (i + .5) / n);
    S.push({
      x: (near + edge) / 2 + (h1(seed + i * 3) - .5) * 60, y: yy + (h1(seed + i * 7) - .5) * 70,
      ang: (h1(seed + i * 11) - .5) * .09, len: len * (1.05 + h1(seed + i * 13) * .12),
      wid: (y1 - y0) / n * 2.4, c, c2: shade(c, .74), seed: seed + i * 17, type: KNIFE,
      taper: .06, skew: .8, alpha,
    });
  }
}

// —— 转场扫盖（垂直版：黑幕从上往下压，或从下往上刮开）
export function sweepV(S, o = {}) {
  const { x0 = -260, x1 = 2180, y0 = -320, y1 = 1400, p, c, seed = 0, n = 14, alpha = 1, up = false } = o;
  const k = clamp(p, 0, 1);
  if (k <= 0) return;
  const edge = up ? lerp(y1 + 200, y0 - 200, k) : lerp(y0 - 200, y1 + 300, k);
  const near = up ? y1 + 200 : y0 - 200;
  const len = Math.abs(edge - near);
  for (let i = 0; i < n; i++) {
    const xx = lerp(x0, x1, (i + .5) / n);
    S.push({
      x: xx + (h1(seed + i * 3) - .5) * 50, y: (near + edge) / 2,
      ang: Math.PI / 2 + (h1(seed + i * 7) - .5) * .08, len: len * (1.03 + h1(seed + i * 11) * .1),
      wid: (x1 - x0) / n * 2.3, c, c2: shade(c, .72), seed: seed + i * 13, type: KNIFE,
      taper: .05, skew: .8, alpha,
    });
  }
}

// —— 颜料滴 / 碎屑飞散
export function dabs(S, o = {}) {
  const { n = 30, x, y, r, cols = [C.pink], seed = 0, alpha = 1, spread = 1, t = 0, grav = 0, drift = 0 } = o;
  for (let i = 0; i < n; i++) {
    const a = h1(seed + i) * Math.PI * 2;
    const d = r * (.2 + h1(seed + i * 3) * spread);
    const dx = Math.cos(a) * d + drift * t * (h1(seed + i * 5) - .5) * 60;
    const dy = Math.sin(a) * d + grav * t * t * 220;
    S.push({ x: x + dx, y: y + dy, ang: a, len: r * (.08 + h1(seed + i * 7) * .12),
             wid: r * (.06 + h1(seed + i * 11) * .1), c: cols[i % cols.length],
             seed: seed + 20 + i, type: DAB, alpha: alpha * (.5 + h1(seed + i * 13) * .5) });
  }
}

// —— 画布边（露出手工画布的厚度和卷边）
export function canvasEdge(S, o = {}) {
  const { x0, y0, x1, y1, seed = 0, alpha = 1 } = o;
  const c = C.canvasDark;
  // 上边
  S.push({ x: (x0 + x1) / 2, y: y0, ang: 0, len: x1 - x0, wid: 26, c, c2: C.canvas, seed: seed + 1, type: KNIFE, taper: .02, alpha });
  // 左边
  S.push({ x: x0, y: (y0 + y1) / 2, ang: Math.PI / 2, len: y1 - y0, wid: 26, c, c2: C.canvas, seed: seed + 2, type: KNIFE, taper: .02, alpha });
  // 右边
  S.push({ x: x1, y: (y0 + y1) / 2, ang: Math.PI / 2, len: y1 - y0, wid: 26, c, c2: C.canvas, seed: seed + 3, type: KNIFE, taper: .02, alpha });
  // 下边
  S.push({ x: (x0 + x1) / 2, y: y1, ang: 0, len: x1 - x0, wid: 26, c, c2: C.canvas, seed: seed + 4, type: KNIFE, taper: .02, alpha });
}

// —— 一整块灰画布（开场）
export function bareCanvas(S, o = {}) {
  const { seed = 0, alpha = 1 } = o;
  fillArea(S, -260, -180, 2180, 1200, C.canvas, { n: 14, seed, c2: C.canvasDark, taper: .04, skew: .7, alpha, jit: .8 });
  // 干裂纹理（很轻，只是让灰面不空）
  for (let i = 0; i < 22; i++) {
    const x = -200 + h1(seed + i * 7) * 2300;
    const y = -150 + h1(seed + i * 11) * 1300;
    S.push({ x, y, ang: h1(seed + i * 13) * Math.PI, len: 80 + h1(seed + i * 17) * 220, wid: 1.2 + h1(seed + i * 19) * 1.6,
             c: shade(C.canvasDark, .92), seed: seed + 30 + i, type: LINE, alpha: alpha * .22 });
  }
}
