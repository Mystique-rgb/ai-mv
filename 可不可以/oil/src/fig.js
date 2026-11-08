// fig.js — 刀痕人（骨架 + 表情），全部按刀痕生成，确定性种子
(function () {
  const { mix, shade, clamp, hash } = window.PAL;
  const KNIFE = 0, BRUSH = 1, DAB = 2, LINE = 3;

  // 扫描线填充：把多边形铺满刀痕，边界严格截断 → 轮廓是硬的
  function polyFill(out, pts, o) {
    const v = o.unit || 30, ang = o.ang ?? -.16;
    const len = (o.len ?? 1.5) * v, wid = (o.wid ?? .62) * v;
    const stepY = Math.max(2, wid * (o.row ?? .74));
    let y0 = 1e9, y1 = -1e9;
    for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    const ca = Math.cos(ang), sa = Math.sin(ang);
    let k = 0;
    for (let y = y0 + stepY * .5; y < y1; y += stepY) {
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const xa = xs[i], xb = xs[i + 1];
        const span = xb - xa; if (span < 1) continue;
        const n = Math.max(1, Math.round(span / (len * (o.gap ?? .82))));
        const w0 = Math.min(wid, stepY * 1.15);
        for (let j = 0; j < n; j++) {
          const f = n === 1 ? .5 : j / (n - 1);
          const cx = xa + span * (.1 + .8 * f) + (hash(k * 3.1 + 1) - .5) * 2;
          const cy = y + (hash(k * 5.7 + 2) - .5) * stepY * .35;
          const l = Math.min(len, span / n * 1.55) * (.85 + hash(k * 7.3) * .3);
          out.push({ x: cx, y: cy, ang: ang + (hash(k * 2.9) - .5) * (o.aj ?? .28), len: Math.max(3, l), wid: w0 * (.85 + hash(k * 11.1) * .3),
            c: o.c, c2: o.c2 || o.c, seed: hash(k * 13.7) * 900, type: KNIFE, hgt: o.hgt ?? 1, alpha: o.alpha ?? 1, run: 0 });
          k++;
        }
      }
    }
    return out;
  }

  // 边缘描一刀（不是线稿，是"被压暗的窄刀"）
  function edge(out, pts, o) {
    const v = o.unit || 30, w = (o.w ?? .12) * v;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 1) continue;
      const n = Math.max(1, Math.round(L / (o.step ?? v * .55)));
      for (let j = 0; j < n; j++) {
        const f = (j + .5) / n;
        out.push({ x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, ang: Math.atan2(b[1] - a[1], b[0] - a[0]),
          len: L / n * 1.25, wid: w, c: o.c, c2: o.c2 || o.c, seed: hash(i * 7 + j) * 900, type: KNIFE, hgt: (o.hgt ?? 1.15), alpha: o.alpha ?? 1, run: 0 });
      }
    }
    return out;
  }

  const d2 = (a, b) => [a[0] + b[0], a[1] + b[1]];

  // 一个人的全部刀痕
  function fig(out, t, x, y, u, o = {}) {
    const C = window.PAL.C;
    const rot = o.rot || 0, sq = o.sq ?? 1, cr = Math.cos(rot), sr = Math.sin(rot);
    const L = [cr, sr], N = [-sr, cr]; // 局部 x 轴、y 轴（y 向下为正）
    // 局部 → 世界。局部：脚底原点，y 向下为正（人的头是负 y）
    const P = (px, py) => { const s = py * sq; return [x + L[0] * px + N[0] * s, y + L[1] * px + N[1] * s]; };
    const poly = pts => pts.map(p => P(p[0] * u, p[1] * u));

    const cloth = o.cloth || C.ochre, clothD = shade(cloth, .58), clothL = mix(cloth, C.white, .18);
    const skin = o.skin || C.skin, skinD = o.skinD || C.skinD, skinL = mix(skin, C.white, .35);
    const pants = o.pants || C.ochreD, pantsD = shade(pants, .62), pantsL = mix(pants, C.white, .12);
    const hair = o.hair || hexHair(), hairD = shade(hair, .6);
    const armL = o.armL ?? .16, armR = o.armR ?? .16;
    const ang = -.16 + rot;

    // 腿 + 鞋
    for (const s of [-1, 1]) {
      const legPts = [[s * .18, -2.35], [s * 1.32, -2.35], [s * 1.28, -.16], [s * .2, -.16]];
      polyFill(out, poly(legPts), { unit: u, ang, c: pants, c2: pantsD, len: 1.15, wid: .42, hgt: .95 });
      const shoe = [[s * .1, -.18], [s * 1.36, -.18], [s * 1.34, .12], [s * .08, .12]];
      polyFill(out, poly(shoe), { unit: u, ang, c: shade(pants, .55), c2: shade(pants, .4), len: .9, wid: .28 });
    }
    // 躯干
    const torso = [[-1.72, -4.42], [1.72, -4.42], [1.55, -2.2], [-1.55, -2.2]];
    polyFill(out, poly(torso), { unit: u, ang, c: cloth, c2: clothD, len: 1.5, wid: .55, hgt: 1.1 });
    // 亮面一刀 + 暗面一刀（把体积压出来）
    polyFill(out, poly([[-1.6, -4.3], [-.25, -4.3], [-.35, -2.35], [-1.5, -2.35]]), { unit: u, ang, c: clothL, c2: cloth, len: 1.25, wid: .42, alpha: .85 });
    polyFill(out, poly([[.55, -4.3], [1.6, -4.3], [1.45, -2.3], [.7, -2.3]]), { unit: u, ang, c: clothD, c2: shade(cloth, .45), len: 1.25, wid: .42, alpha: .9 });
    // 围裙 / 领口
    if (o.apron !== false) {
      polyFill(out, poly([[-1.05, -3.2], [1.05, -3.2], [.95, -1.95], [-.95, -1.95]]), { unit: u, ang, c: o.apronC || C.canvas, c2: shade(C.canvas, .6), len: 1.1, wid: .38, alpha: .95 });
      edge(out, poly([[-1.05, -3.2], [1.05, -3.2]]), { unit: u, c: shade(C.canvas, .5), w: .1 });
    }
    // 手臂：从肩出发沿角度
    for (const [s, a0] of [[-1, armL], [1, armR]]) {
      const sx = s * 1.6, sy = -3.9;
      const ex = sx + s * Math.sin(a0) * 1.55 * (o.armLen ?? 1), ey = sy + Math.cos(a0) * 1.55 * (o.armLen ?? 1);
      const dx = ex - sx, dy = ey - sy, Ll = Math.hypot(dx, dy) || 1, nx = -dy / Ll * .42, ny = dx / Ll * .42;
      const arm = [[sx + nx, sy + ny], [ex + nx, ey + ny], [ex - nx, ey - ny], [sx - nx, sy - ny]];
      polyFill(out, poly(arm), { unit: u, ang: Math.atan2(dy, dx), c: clothD, c2: shade(cloth, .45), len: .9, wid: .4, hgt: 1.05 });
      // 手
      const hp = [[ex - .42, ey - .3], [ex + .42, ey - .3], [ex + .4, ey + .42], [ex - .4, ey + .42]];
      polyFill(out, poly(hp), { unit: u, ang: Math.atan2(dy, dx), c: skin, c2: skinD, len: .55, wid: .3, hgt: 1.0 });
    }
    // 头（方块，切角）
    const k = .55;
    const head = [[-2.6 + k, -8], [2.6 - k, -8], [2.6, -8 + k], [2.6, -4.6 - k], [2.6 - k, -4.6], [-2.6 + k, -4.6], [-2.6, -4.6 - k], [-2.6, -8 + k]];
    polyFill(out, poly(head), { unit: u, ang, c: skin, c2: skinD, len: 1.35, wid: .52, hgt: 1.05 });
    polyFill(out, poly([[1.15, -7.9], [2.55, -7.9], [2.55, -4.75], [1.2, -4.75]]), { unit: u, ang, c: skinD, c2: shade(skin, .62), len: 1.1, wid: .42, alpha: .92 });
    polyFill(out, poly([[-2.45, -7.85], [-.9, -7.85], [-.95, -4.8], [-2.4, -4.8]]), { unit: u, ang, c: skinL, c2: skin, len: 1.1, wid: .4, alpha: .55 });
    edge(out, poly(head), { unit: u, c: skinD, w: .12, alpha: .9 });

    // 头发（盖住头顶 1.1u）
    if (o.bald !== true) {
      const hairPts = [[-2.62, -8.05], [2.62, -8.05], [2.62, -7.15], [1.5, -7.0], [.2, -7.25], [-1.2, -6.95], [-2.62, -7.2]];
      polyFill(out, poly(hairPts), { unit: u, ang: .5 + rot, c: hair, c2: hairD, len: .95, wid: .34, hgt: 1.2 });
      // 几道发流
      for (let i = 0; i < 5; i++) {
        const px = -2.1 + i * 1.05;
        polyFill(out, poly([[px, -8.0], [px + .42, -8.0], [px + .3, -7.2], [px - .08, -7.15]]), { unit: u, ang: 1.35 + rot, c: mix(hair, C.white, .12), c2: hair, len: .55, wid: .22, alpha: .8 });
      }
    }

    face(out, P, u, o, t, { skin, skinD, skinL, ang });
    return out;
  }

  const hexHair = () => window.PAL.C.ochreD;

  // 表情：眼、嘴、眉、高光（8fps）
  function face(out, P, u, o, t, c) {
    const C = window.PAL.C;
    const expr = o.expr || 'calm';
    const look = o.look || 0;                 // -1..1 视线横移
    const openW = { calm: [.30, .42], blink: [.42, .05], soft: [.34, .26], hurt: [.30, .16], grit: [.30, .12], wide: [.40, .55], smile: [.36, .10], empty: [.30, .40] }[expr] || [.3, .4];
    const pupilS = { calm: 1, blink: 1, soft: .9, hurt: .8, grit: .8, wide: 1.25, smile: .95, empty: 1 }[expr] || 1;
    const hy = { calm: 0, blink: 0, soft: .04, hurt: -.10, grit: .02, wide: .06, smile: .02, empty: 0 }[expr] || 0;
    const noHi = expr === 'empty';
    for (const s of [-1, 1]) {
      const ex = s * (1.32 + look * .22), ey = -6.15;
      // 眼眶压暗（横向一刀）
      const eyeOpen = openW[1] * u * 1.5;
      const eyes = [[ex - openW[0], ey - eyeOpen], [ex + openW[0], ey - eyeOpen], [ex + openW[0], ey + eyeOpen], [ex - openW[0], ey + eyeOpen]].map(p => P(p[0] * u, p[1] * u));
      polyFill(out, eyes, { unit: u, ang: c.ang, c: [.07, .06, .06], c2: [.14, .12, .12], len: .42, wid: .26, hgt: .6, row: .55 });
      if (!noHi && expr !== 'blink' && expr !== 'grit') {
        const hp = P((ex + s * .1 * pupilS) * u, (ey - hy * 2 - .05) * u);
        out.push({ x: hp[0], y: hp[1], ang: c.ang, len: .16 * u * pupilS, wid: .16 * u * pupilS, c: C.white, c2: mix(C.white, C.gold, .2), seed: 3.3, type: DAB, hgt: .9 });
      }
    }
    // 眉（只有几种表情有）
    const browH = { hurt: -.28, grit: -.18, wide: .12, calm: 0 }[expr];
    if (browH !== undefined && browH !== 0) {
      for (const s of [-1, 1]) {
        const a = P(s * .95 * u, (-6.85 + browH * (s > 0 ? .5 : .3)) * u), b = P(s * 1.85 * u, (-6.9 - browH * .6) * u);
        out.push({ x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2, ang: Math.atan2(b[1] - a[1], b[0] - a[0]), len: Math.hypot(b[0] - a[0], b[1] - a[1]), wid: .1 * u, c: shade(c.skinD, .75), c2: shade(c.skinD, .6), seed: 5.1, type: KNIFE, hgt: 1, run: 0 });
      }
    }
    // 嘴
    const mOpen = { wide: .9, smile: 1, hurt: 1, grit: .35, blink: 1, calm: 1, soft: .8, empty: 1 }[expr] || 1;
    const curve = { smile: -.16, hurt: .12, grit: 0, wide: .04, calm: 0, soft: -.04, blink: 0, empty: 0 }[expr] || 0;
    const mw = .55 * u * mOpen, my = -4.95 * u;
    const m1 = P(-mw, my + curve * u), m2 = P(0, my - curve * u * .4), m3 = P(mw, my + curve * u);
    out.push({ x: (m1[0] + m2[0]) / 2, y: (m1[1] + m2[1]) / 2, ang: Math.atan2(m2[1] - m1[1], m2[0] - m1[0]), len: Math.hypot(m2[0] - m1[0], m2[1] - m1[1]), wid: .12 * u, c: shade(c.skinD, .7), c2: shade(c.skinD, .55), seed: 7.7, type: KNIFE, hgt: 1, run: 0 });
    out.push({ x: (m2[0] + m3[0]) / 2, y: (m2[1] + m3[1]) / 2, ang: Math.atan2(m3[1] - m2[1], m3[0] - m2[0]), len: Math.hypot(m3[0] - m2[0], m3[1] - m2[1]), wid: .12 * u, c: shade(c.skinD, .7), c2: shade(c.skinD, .55), seed: 8.4, type: KNIFE, hgt: 1, run: 0 });
    // 笑的时候颊肌两刀
    if (expr === 'smile') {
      for (const s of [-1, 1]) {
        const p = P(s * 1.85 * u, -5.55 * u);
        out.push({ x: p[0], y: p[1], ang: c.ang + s * .5, len: .4 * u, wid: .2 * u, c: mix(C.pink, C.skin, .55), c2: C.pink, seed: 9.9 + s, type: DAB, hgt: .9, alpha: .55 });
      }
    }
  }

  window.FIG = { fig, polyFill, edge, face };
})();
