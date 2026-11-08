// base.js — 像素绘制基础库（480×270 场景层）
'use strict';
const W = window;
W.P = {
  ink: '#0A0910', black: '#05040A', night: '#101528', navy: '#1B2444', blue: '#22325C',
  slate: '#354A78', steel: '#4E6A9E', sky: '#5E86BE', paleblu: '#9CC0E8', ice: '#CFE3F5',
  paper: '#F4EEDC', white: '#FFFFFF',
  haze: '#8B86B0', dusk: '#5A5480', plum: '#3A2A4E',
  teal: '#2E8E9E', mint: '#7FD8C8',
  gold: '#FFD166', amber: '#FFB344', orange: '#E8792F', red: '#D9473F',
  rose: '#E8556D', pink: '#F58BA6', blush: '#F7B9C4', cream: '#F7E2C0',
  skin: '#E9B58C', skinD: '#C98A66', skinF: '#F4C9A8', skinFD: '#D9A382',
  hair: '#171320', hair2: '#2A2230', hair3: '#3C3038',
  green: '#4A7A4A', greenD: '#2C4A32', moss: '#6E8F5A',
  wood: '#7A4B32', woodD: '#4E2F22',
  violet: '#7B6CFF', cyan: '#39D9E8', magenta: '#FF6EC7',
};
const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const PX = (c, x, y, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), 1, 1); };
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a || 1e-6), 0, 1);
const ease = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeIn = k => k * k * k;
const backOut = k => 1 + 2.2 * Math.pow(k - 1, 3) + 1.4 * Math.pow(k - 1, 2);
const onTwos = (t, fps = 12) => Math.floor(t * fps) / fps;
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const pulse = (t, bpm = 90, k = 2) => Math.pow(Math.max(0, Math.sin(t * bpm / 60 * Math.PI)), k);

// 4×4 Bayer
const BAY = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
function dith(c, x, y, w, h, col, p) {
  p = clamp(p, 0, 1); if (p <= 0) return; if (p >= 1) { R(c, x, y, w, h, col); return; }
  c.fillStyle = col;
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++)
    if (BAY[(y + j) & 3][(x + i) & 3] / 16 < p) c.fillRect(x + i, y + j, 1, 1);
}
// 竖向色带渐变（bands 段 + 抖动过渡）
function vgrad(c, x, y, w, h, cols, band) {
  const n = cols.length; band = band || h / n;
  for (let i = 0; i < n - 1; i++) {
    const y0 = y + i * band, hh = band;
    R(c, x, y0, w, hh, cols[i]);
    dith(c, x, y0 + hh - band * .5, w, band * .5, cols[i + 1], .5);
  }
  R(c, x, y + (n - 1) * band, w, h - (n - 1) * band, cols[n - 1]);
}
// 横向色带
function hgrad(c, x, y, w, h, cols) {
  const n = cols.length, band = w / n;
  for (let i = 0; i < n; i++) R(c, x + i * band, y, band + 1, h, cols[i]);
}
function circle(c, cx, cy, r, col) {
  cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
  for (let j = -r; j <= r; j++) {
    const k = Math.floor(Math.sqrt(Math.max(0, r * r - j * j)));
    R(c, cx - k, cy + j, 2 * k + 1, 1, col);
  }
}
function ring(c, cx, cy, r, col) {
  cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
  for (let j = -r; j <= r; j++) {
    const k = Math.floor(Math.sqrt(Math.max(0, r * r - j * j)));
    PX(c, cx - k, cy + j, col); PX(c, cx + k, cy + j, col);
  }
  for (let i = -r; i <= r; i++) { PX(c, cx + i, cy - Math.floor(Math.sqrt(Math.max(0, r * r - i * i))), col); PX(c, cx + i, cy + Math.floor(Math.sqrt(Math.max(0, r * r - i * i))), col); }
}
// 多边形扫描线填充（像素级）
function poly(c, pts, col) {
  c.fillStyle = col;
  let minY = 1e9, maxY = -1e9;
  for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
  for (let y = Math.ceil(minY); y <= Math.floor(maxY); y++) {
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        xs.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
    }
    xs.sort((m, n) => m - n);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const x0 = Math.round(xs[i]), x1 = Math.round(xs[i + 1]);
      c.fillRect(x0, y, Math.max(1, x1 - x0), 1);
    }
  }
}
// 粗像素线（限宽 1..n），用于四肢 / 电线 / 雨丝
function pline(c, x0, y0, x1, y1, w, col) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy; c.fillStyle = col;
  const o = Math.floor(w / 2);
  for (let guard = 0; guard < 4000; guard++) {
    c.fillRect(x0 - o, y0 - o + (w % 2 === 0 ? 0 : 0), w, w);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
}
// 像素字（PXF 16×16 中文 / 8×16 ASCII）
function textW(s, sc = 1) {
  let w = 0;
  for (const ch of s) w += (/[\u4e00-\u9fff]/.test(ch) || ch.codePointAt(0) > 0x2000 ? 16 : 8) * sc;
  return w;
}
function text(c, s, x, y, col, sc = 1, shadow) {
  sc = Math.max(1, Math.round(sc));
  const F = W.PXF;
  if (shadow) text(c, s, x + sc, y + sc, shadow, sc);
  let cx = Math.round(x);
  c.fillStyle = col;
  for (const ch of s) {
    const cn = /[\u4e00-\u9fff]/.test(ch) || ch.codePointAt(0) > 0x2000;
    const g = (cn ? F.cn[ch] : F.en[ch]) || F.cn[' '];
    const gw = cn ? 16 : 8;
    if (g) for (let r = 0; r < 16; r++) {
      const bits = parseInt(g[r], 16);
      for (let i = 0; i < gw; i++) if (bits & (1 << (gw - 1 - i)))
        c.fillRect(cx + i * sc, Math.round(y) + r * sc, sc, sc);
    }
    cx += gw * sc;
  }
  return cx;
}
function textC(c, s, cxc, y, col, sc = 1, shadow) { const w = textW(s, sc); return text(c, s, cxc - w / 2, y, col, sc, shadow); }

// 描边：对离屏 canvas 生成 1px 轮廓（可选受光边）
function outlineOf(cv, ink, rim, rimDir) {
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const img = c.getImageData(0, 0, w, h), d = img.data;
  const src = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) src[i] = d[i * 4 + 3] > 60 ? 1 : 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (src[i]) continue;
    const nb = (x > 0 && src[i - 1]) || (x < w - 1 && src[i + 1]) || (y > 0 && src[i - w]) || (y < h - 1 && src[i + w]);
    if (!nb) continue;
    let col = ink;
    if (rim) {
      const lit = (rimDir > 0 && x > 0 && src[i - 1]) || (rimDir < 0 && x < w - 1 && src[i + 1])
        || (rimDir === 0 && (y < h - 1 && src[i + w]));
      if (lit) col = rim;
    }
    const o = (i) * 4;
    d[o] = parseInt(col.slice(1, 3), 16); d[o + 1] = parseInt(col.slice(3, 5), 16); d[o + 2] = parseInt(col.slice(5, 7), 16); d[o + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  return cv;
}
function mkcanvas(w, h) {
  const e = document.createElement('canvas'); e.width = w; e.height = h;
  const x = e.getContext('2d'); x.imageSmoothingEnabled = false; return [e, x];
}
// 全局抖动/颗粒（1px）
function grain(c, w, h, t, amt = .05, col = '#000') {
  c.save(); c.globalAlpha = amt; c.fillStyle = col;
  const n = Math.floor(w * h * .06);
  for (let i = 0; i < n; i++) {
    const x = Math.floor(hash(i * 3.1 + Math.floor(t * 12)) * w), y = Math.floor(hash(i * 7.7 + Math.floor(t * 12) * 1.7) * h);
    c.fillRect(x, y, 1, 1);
  }
  c.restore();
}
W.R = R; W.PX = PX; W.dith = dith; W.vgrad = vgrad; W.circle = circle; W.ring = ring; W.pline = pline;
W.poly = poly; W.text = text; W.textC = textC; W.textW = textW; W.mkcanvas = mkcanvas; W.outlineOf = outlineOf;
W.ease = ease; W.easeOut = easeOut; W.easeIn = easeIn; W.backOut = backOut; W.seg = seg; W.clamp = clamp;
W.lerp = lerp; W.onTwos = onTwos; W.hash = hash; W.pulse = pulse; W.grain = grain; W.BAY = BAY; W.hgrad = hgrad;
