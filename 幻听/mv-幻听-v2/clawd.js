// Clawd 方块像素小人：18×10 栅格（来自 living-screencast 样片精灵，改为可染色）
export const CLAY = '#D97757', CLAY_D = '#B85F40', PINK = '#E58384', PINK_D = '#C2667B', EYE = '#2A2622';

export function grid({ eyes = 'n', arms = 'down', legs = 'stand' } = {}) {
  const P = new Map(), put = (c, r, v = 1) => P.set(c + ',' + r, v);
  for (let r = 0; r < 8; r++) for (let c = 3; c <= 14; c++) put(c, r);
  if (arms === 'up') for (const r of [0, 1, 2, 3]) { put(1, r); put(2, r); put(15, r); put(16, r); }
  else if (arms === 'wave') { for (const r of [4, 5]) { put(1, r); put(2, r); } for (const r of [0, 1, 2, 3]) { put(15, r); put(16, r); } }
  else if (arms === 'reach') { for (const r of [2, 3, 4]) { put(1, r); put(2, r); put(15, r); put(16, r); } }
  else if (arms === 'one') { for (const r of [2, 3, 4, 5]) { put(15, r); put(16, r); } }
  else if (arms === 'tuck') { }
  else for (const r of [4, 5]) for (const c of [1, 2, 15, 16]) put(c, r);
  const L = { stand: [[4, 2], [6, 2], [11, 2], [13, 2]], walkA: [[4, 2], [6, 1], [11, 2], [13, 1]], walkB: [[4, 1], [6, 2], [11, 1], [13, 2]],
    tuck: [[4, 1], [6, 1], [11, 1], [13, 1]], swing: [[4, 2], [6, 1], [11, 1], [13, 1]], none: [] }[legs] || [];
  for (const [c, h] of L) for (let r = 8; r < 8 + h; r++) put(c, r);
  const E = { n: [[5, 2], [5, 3], [12, 2], [12, 3]], r: [[6, 2], [6, 3], [13, 2], [13, 3]], l: [[4, 2], [4, 3], [11, 2], [11, 3]],
    u: [[5, 1], [5, 2], [12, 1], [12, 2]], d: [[5, 3], [5, 4], [12, 3], [12, 4]],
    blink: [[5, 3], [12, 3]], happy: [[4, 3], [5, 2], [6, 3], [11, 3], [12, 2], [13, 3]], wide: [[5, 1], [5, 2], [5, 3], [12, 1], [12, 2], [12, 3]],
    shut: [[4, 3], [5, 3], [6, 3], [11, 3], [12, 3], [13, 3]] }[eyes] || [];
  for (const [c, r] of E) put(c, r, 2);
  return [...P].map(([k, v]) => { const [c, r] = k.split(',').map(Number); return [c, r, v]; });
}

// x,y = 脚底中点；px = 像素边长；sq>0 压扁；flip 朝左；rot 弧度
export function sprite({ x, y, px = 7, flip = false, sq = 0, rot = 0, op = 1, color = CLAY, dark = null, ...pose }) {
  const D = dark || shade(color, .82), G = grid(pose); let s = '';
  for (let [c, r, v] of G) {
    if (flip) c = 17 - c;
    s += `<rect x="${c}" y="${r}" width="1.04" height="1.04" fill="${v === 2 ? EYE : color}"/>`;
  }
  for (let c = 3; c <= 14; c++) s += `<rect x="${c}" y="7" width="1.04" height="1.04" fill="${D}" opacity=".55"/>`;
  const sy = 1 - sq, sx = 1 + sq * .7, w = 18 * px * sx, h = 10 * px * sy;
  return `<svg class="px" viewBox="0 0 18 10" width="${w}" height="${h}" style="position:absolute;left:${x - w / 2}px;top:${y - h}px;opacity:${op};transform:rotate(${rot}rad);transform-origin:50% 60%" shape-rendering="crispEdges">${s}</svg>`;
}

export function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, '0')).join('');
}

export function pixart(rows, { x, y, px = 6, pal, op = 1 }) {
  let s = '';
  rows.forEach((row, r) => [...row].forEach((ch, c) => { if (pal[ch]) s += `<rect x="${c}" y="${r}" width="1.04" height="1.04" fill="${pal[ch]}"/>`; }));
  const W = rows[0].length, H = rows.length;
  return `<svg class="px" viewBox="0 0 ${W} ${H}" width="${W * px}" height="${H * px}" style="position:absolute;left:${x}px;top:${y}px;opacity:${op}" shape-rendering="crispEdges">${s}</svg>`;
}
export const BANG = (x, y, px = 6, op = 1) => pixart(['.kkk.', 'kwwwk', 'kwkwk', 'kwkwk', 'kwwwk', 'kwkwk', 'kwwwk', '.kkk.', '..k..'], { x: x - 2.5 * px, y, px, op, pal: { w: '#fff', k: EYE } });
export const DOTS = (x, y, px = 6, n = 3, op = 1) => n < 1 ? '' : pixart(['kk.kk.kk'.slice(0, n * 3 - 1), 'kk.kk.kk'.slice(0, n * 3 - 1)], { x, y, px, op, pal: { k: EYE } });
export const HEART = (x, y, px = 5, col = '#E0543A', op = 1) => pixart(['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'], { x: x - 3.5 * px, y: y - 3 * px, px, op, pal: { r: col } });
export const SPARK = (x, y, px = 6, col = '#F2C14E', op = 1) => pixart(['..y..', '..y..', 'yy.yy', '..y..', '..y..'], { x: x - 2.5 * px, y: y - 2.5 * px, px, op, pal: { y: col } });
export const NOTE = (x, y, px = 5, col = '#FFFFFF', op = 1) => pixart(['..kkk', '..k.k', '..k..', '..k..', 'kkk..', 'kkk..'], { x: x - 2.5 * px, y, px, op, pal: { k: col } });
export const MOON = (x, y, px = 6, col = '#FFE9A8', op = 1) => pixart(['.yyy.', 'yy...', 'yy...', 'yy...', '.yyy.'], { x: x - 2.5 * px, y, px, op, pal: { y: col } });
export const CROSS = (x, y, px = 5, col = '#8D8478', op = 1) => pixart(['k...k', '.k.k.', '..k..', '.k.k.', 'k...k'], { x: x - 2.5 * px, y, px, op, pal: { k: col } });
export const HEADPHONE = (x, y, px = 6, col = '#F2EFE8', op = 1) => pixart(['.kkkk.', 'k....k', 'k.kk.k', 'k.kk.k', 'k....k', '.kkkk.'], { x: x - 3 * px, y: y - 3 * px, px, op, pal: { k: col } });

export function dust(x, y, t, px = 5, n = 6, seed = 1, col = '#CFC7B6') {
  if (t <= 0 || t >= 1) return ''; let s = '';
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1, k = (i >> 1) + 1, e = 1 - Math.pow(1 - t, 2);
    const dx = side * (16 + k * 14 + ((seed * 7 + i * 13) % 9)) * e, dy = -(7 + k * 5) * Math.sin(Math.PI * t * .9);
    const sz = px * (1 - t * .7);
    s += `<div style="position:absolute;left:${x + dx - sz / 2}px;top:${y + dy - sz}px;width:${sz}px;height:${sz}px;background:${col};opacity:${1 - t}"></div>`;
  }
  return s;
}

// 像素碎屑爆散（她崩解 / 分屏迸裂）
export function burst(cx, cy, t, { n = 26, px = 5, col = '#E58384', seed = 3, spread = 220, up = 90 } = {}) {
  if (t <= 0 || t >= 1.2) return ''; let s = '';
  for (let i = 0; i < n; i++) {
    const a = (i * 2.399 + seed) % 6.283, r = (0.3 + ((i * 37 + seed * 11) % 100) / 100) * spread * Math.min(1, t * 1.4);
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .75 - up * t * (1 - t) * 1.6;
    const sz = px * (1 - t * .55);
    s += `<div style="position:absolute;left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;background:${col};opacity:${Math.max(0, 1 - t)}"></div>`;
  }
  return s;
}
