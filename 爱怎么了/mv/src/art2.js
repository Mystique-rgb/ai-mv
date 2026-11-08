// 《爱怎么了》纸雕灯影 — 剪纸构件库（metric 坐标，y 向上，单位米；箱腔 x∈[-.28,.28] y∈[-.31,.31]）
// 全部是平面剪纸：单一平涂 + 纤维 + 顶边暖描边 + 底边暗带（由 paper.js finish() 统一处理）
import { TAU, mulberry } from './lib.js';

export const FLOOR = -0.16;          // 房间地面
export const SKY_Z = -0.168;

// —— 基础 ——
export function cut(x, fn) { x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; fn(); x.restore(); }

// 锥形肢体（纸片，只有旋转，没有弯曲）
export function limb(x, ax, ay, bx, by, w0, w1, bend = 0) {
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-6, nx = -dy / L, ny = dx / L;
  const mx = (ax + bx) / 2 + nx * L * bend, my = (ay + by) / 2 + ny * L * bend;
  x.beginPath();
  x.moveTo(ax + nx * w0 / 2, ay + ny * w0 / 2);
  x.quadraticCurveTo(mx + nx * (w0 + w1) / 4, my + ny * (w0 + w1) / 4, bx + nx * w1 / 2, by + ny * w1 / 2);
  x.lineTo(bx - nx * w1 / 2, by - ny * w1 / 2);
  x.quadraticCurveTo(mx - nx * (w0 + w1) / 4, my - ny * (w0 + w1) / 4, ax - nx * w0 / 2, ay - ny * w0 / 2);
  x.closePath(); x.fill();
}

// 平滑闭合曲线（Catmull-Rom → Bézier），点第三位 = 1 表示尖角
export function spline(x, s, pts, closed = true, k = 1 / 6) {
  const n = pts.length, P = i => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  x.beginPath(); x.moveTo(pts[0][0] * s, pts[0][1] * s);
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = p1[2] ? p1 : [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2 = p2[2] ? p2 : [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    x.bezierCurveTo(c1[0] * s, c1[1] * s, c2[0] * s, c2[1] * s, p2[0] * s, p2[1] * s);
  }
  if (closed) x.closePath();
}
export const fillSpline = (x, s, pts) => { spline(x, s, pts); x.fill(); };

// 柔边阴影：把形状画成模糊的深色（用作跨层影子）
export function shadowShape(x, blur, col, fn) {
  x.save(); x.filter = `blur(${blur}px)`; x.fillStyle = col; x.strokeStyle = col; fn(x); x.restore();
}

// —— 墙与窗 ——
// 中式格窗：在墙体上打穿一个洞（透出后面的夜空），洞上留窗棂
export function latticeWindow(x, cx, cy, w, h, bar, style = 'hui') {
  cut(x, () => { x.beginPath(); x.roundRect(cx - w / 2, cy - h / 2, w, h, .012); x.fill(); });
  x.save();
  x.beginPath(); x.roundRect(cx - w / 2, cy - h / 2, w, h, .012); x.clip();
  x.strokeStyle = x.fillStyle; x.lineCap = 'square'; x.lineWidth = bar;
  if (style === 'hui') {
    // 回纹：横三竖二 + 角部回字
    for (const dy of [-h * .33, 0, h * .33]) { x.beginPath(); x.moveTo(cx - w / 2, cy + dy); x.lineTo(cx + w / 2, cy + dy); x.stroke(); }
    x.beginPath(); x.moveTo(cx, cy - h / 2); x.lineTo(cx, cy + h / 2); x.stroke();
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      const px = cx + sx * w * .32, py = cy + sy * h * .30, r = Math.min(w, h) * .10;
      x.beginPath(); x.moveTo(px + sx * r, py); x.lineTo(px, py); x.lineTo(px, py + sy * r); x.lineTo(px + sx * r * .5, py + sy * r); x.stroke();
    }
  } else {
    for (let i = -3; i <= 3; i++) { x.beginPath(); x.moveTo(cx + i * w / 7, cy - h / 2); x.lineTo(cx + i * w / 7, cy + h / 2); x.stroke(); }
    for (let i = -2; i <= 2; i++) { x.beginPath(); x.moveTo(cx - w / 2, cy + i * h / 5); x.lineTo(cx + w / 2, cy + i * h / 5); x.stroke(); }
  }
  x.restore();
  x.lineWidth = bar * 1.8; x.strokeStyle = x.fillStyle;
  x.beginPath(); x.roundRect(cx - w / 2, cy - h / 2, w, h, .012); x.stroke();
  // 窗台
  x.fillRect(cx - w / 2 - .008, cy - h / 2 - .006, w + .016, .006);
}

// 砖缝 / 木板缝
export function boards(x, x0, x1, y0, y1, n, col) {
  x.fillStyle = col;
  for (let i = 1; i < n; i++) { const y = y0 + (y1 - y0) * i / n; x.fillRect(x0, y, x1 - x0, .0012); }
  const R = mulberry(n * 7 + 3);
  for (let i = 0; i < n; i++) { const y = y0 + (y1 - y0) * i / n; for (let k = 0; k < 3; k++) { const px = x0 + R() * (x1 - x0); x.fillRect(px, y, .001, (y1 - y0) / n); } }
}

// 窗帘（两侧收拢）
export function curtain(x, cx, cy, w, h, col) {
  for (const s of [-1, 1]) {
    x.fillStyle = col;
    x.beginPath(); x.moveTo(cx + s * w / 2, cy + h / 2);
    x.lineTo(cx + s * (w / 2 - .022), cy + h / 2);
    x.quadraticCurveTo(cx + s * (w / 2 - .012), cy, cx + s * (w / 2 + .006), cy - h * .3);
    x.quadraticCurveTo(cx + s * (w / 2 + .016), cy - h * .42, cx + s * (w / 2 + .03), cy - h * .48);
    x.lineTo(cx + s * (w / 2 + .03), cy + h / 2); x.closePath(); x.fill();
    // 褶皱
    x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(0,0,0,.28)';
    for (let i = 0; i < 4; i++) x.fillRect(cx + s * (w / 2 - .006 + i * .009), cy - h * .5, .0022, h);
    x.restore();
  }
}

// —— 物件 ——
// 纸箱（打开，四片翻盖）：by = 底面 y
export function carton(x, cx, by, w, h, col, dark) {
  x.fillStyle = col;
  x.fillRect(cx - w / 2, by, w, h);
  // 内腔
  x.fillStyle = dark; x.fillRect(cx - w / 2 + w * .03, by + h * .04, w * .94, h * .95);
  // 翻盖（左右外张）
  x.fillStyle = col;
  x.beginPath(); x.moveTo(cx - w / 2, by + h); x.lineTo(cx - w / 2 - w * .30, by + h + h * .34); x.lineTo(cx - w / 2 - w * .13, by + h + h * .30); x.lineTo(cx + w * .04, by + h); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(cx + w / 2, by + h); x.lineTo(cx + w / 2 + w * .28, by + h + h * .30); x.lineTo(cx + w / 2 + w * .10, by + h + h * .26); x.lineTo(cx - w * .02, by + h); x.closePath(); x.fill();
  // 纸板棱线
  x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(0,0,0,.22)';
  x.fillRect(cx - w / 2, by + h * .5, w, .0012);
  x.restore();
}

// 叠好的衣物（薄纸片，一摞）
export function clothes(x, cx, by, w, n, col, edge) {
  for (let i = 0; i < n; i++) {
    const y = by + i * .0075, ww = w * (.86 + .14 * Math.sin(i * 2.3)), xx = cx + (i % 2 ? .003 : -.002);
    x.fillStyle = col;
    x.beginPath(); x.roundRect(xx - ww / 2, y, ww, .0068, .0016); x.fill();
    x.fillStyle = edge; x.fillRect(xx - ww / 2 + .002, y + .0006, ww - .004, .0012);
  }
}

// 椅子（侧视，dir=1 椅背在左）
export function chair(x, cx, by, s, dir = 1) {
  const bx = cx - dir * s * .20;
  x.fillRect(bx - s * .022, by, s * .045, s * .95);
  x.fillRect(cx + dir * s * .18 - s * .022, by, s * .045, s * .44);
  x.fillRect(cx - s * .24, by + s * .42, s * .48, s * .045);
  x.fillRect(Math.min(bx, bx + dir * s * .02) - s * .018, by + s * .93, s * .085, s * .038);
  for (const k of [.58, .76]) x.fillRect(bx - s * .02, by + s * k, dir * s * .04, s * .028);
}

// 围巾（搭在椅背上，一侧垂落）——全片唯一的粉色物件
export function scarf(x, cx, cy, w, h, col, col2) {
  x.fillStyle = col;
  x.beginPath(); x.moveTo(cx - w / 2, cy); x.quadraticCurveTo(cx, cy + h * .5, cx + w / 2, cy - h * .06);
  x.lineTo(cx + w * .44, cy - h * .30); x.quadraticCurveTo(cx, cy + h * .18, cx - w * .42, cy - h * .26);
  x.closePath(); x.fill();
  // 垂落的一头
  x.beginPath(); x.moveTo(cx + w * .30, cy - h * .12);
  x.quadraticCurveTo(cx + w * .52, cy - h * .55, cx + w * .40, cy - h * 1.05);
  x.lineTo(cx + w * .18, cy - h * 1.0); x.quadraticCurveTo(cx + w * .34, cy - h * .55, cx + w * .12, cy - h * .14);
  x.closePath(); x.fill();
  // 流苏
  x.strokeStyle = col2; x.lineWidth = .0016;
  for (let i = 0; i < 7; i++) {
    const px = cx + w * .18 + i * w * .032, py = cy - h * (1.0 + .02 * Math.sin(i));
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + .003, py - .016 + .004 * Math.sin(i * 2)); x.stroke();
  }
}

// 刀（纸剪刀：刀身 + 刀柄，全部是剪纸构件）
export function knife(x, cx, cy, L, col, edge, rot = 0) {
  x.save(); x.translate(cx, cy); x.rotate(rot);
  x.fillStyle = col;
  // 刀身
  x.beginPath(); x.moveTo(0, 0); x.lineTo(-L * .72, -L * .085); x.lineTo(-L * .80, 0); x.lineTo(-L * .72, L * .075); x.closePath(); x.fill();
  // 刀柄
  x.fillRect(-L * .02, -L * .045, L * .20, L * .09);
  x.fillRect(-L * .02, -L * .052, L * .04, L * .104);
  // 背光穿透的刃口
  x.fillStyle = edge;
  x.beginPath(); x.moveTo(-L * .06, L * .006); x.lineTo(-L * .72, L * .012); x.lineTo(-L * .70, L * .05); x.lineTo(-L * .06, L * .03); x.closePath(); x.fill();
  x.restore();
}

// 一张薄纸照片：两个小人在窗前的剪影，rot 可歪
export function photoCard(x, cx, cy, w, h, rot, o = {}) {
  x.save(); x.translate(cx, cy); x.rotate(rot || 0);
  x.fillStyle = o.paper || '#f2e2c8'; x.fillRect(-w / 2, -h / 2, w, h);
  // 照片内：窗 + 两个小人 + 地面
  x.fillStyle = o.ink1 || '#8d6a52'; x.fillRect(-w / 2 + w * .07, -h / 2 + h * .06, w * .86, h * .70);
  x.fillStyle = o.ink2 || '#e8cf9e'; x.fillRect(-w * .16, -h * .12, w * .32, h * .34);   // 窗
  x.fillStyle = o.fig || '#3a2318';
  const fy = -h * .30, fh = h * .46;
  tiny(x, -w * .18, fy, fh * .8, o.fig || '#3a2318');     // 她
  tiny(x, w * .06, fy, fh, o.fig || '#3a2318');           // 他
  // 白边
  x.strokeStyle = o.paper || '#f2e2c8'; x.lineWidth = Math.max(w, h) * .055;
  x.strokeRect(-w / 2, -h / 2, w, h);
  x.restore();
}

// 迷你剪影小人（照片里的）
export function tiny(x, px, py, s, col) {
  x.fillStyle = col;
  x.beginPath(); x.arc(px + s * .02, py + s * .86, s * .14, 0, TAU); x.fill();
  x.beginPath(); x.roundRect(px - s * .11, py + s * .30, s * .26, s * .44, s * .10); x.fill();
  x.fillRect(px - s * .10, py, s * .08, s * .34);
  x.fillRect(px + s * .04, py, s * .08, s * .34);
}

// 一刀裂开的弧线（从 (x0,y0) 到 (x1,y1)，带刀口弧度）
export function crack(x, x0, y0, x1, y1, land, w = .0022) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1e-6, nx = -dy / L, ny = dx / L;
  x.beginPath(); x.moveTo(x0, y0);
  const n = 26;
  for (let i = 1; i <= n; i++) {
    const u = i / n, bulge = Math.sin(u * Math.PI) * (.012 + land * .004) * (u < .5 ? 1 : .6);
    x.lineTo(x0 + dx * u + nx * bulge, y0 + dy * u + ny * bulge);
  }
  x.lineWidth = w; x.strokeStyle = x.fillStyle; x.lineCap = 'round'; x.stroke();
}

// 纸屑（固定随机种子；形状与主刀口同一套弧线语言）
export function scrap(x, px, py, r, rot, arc = .5) {
  x.save(); x.translate(px, py); x.rotate(rot);
  x.beginPath();
  x.moveTo(-r, -r * .4);
  x.quadraticCurveTo(0, -r * .1, r, -r * .5 + arc * r * .2);
  x.quadraticCurveTo(r * .7, r * .6, 0, r * .55);
  x.quadraticCurveTo(-r * .8, r * .4, -r, -r * .4);
  x.fill();
  x.restore();
}

// 纸点（“点点滴滴”）：seed 固定，位置由 (i, seed) 决定，可随时间下落
export function dots(x, n, seed, o = {}) {
  const R = mulberry(seed), span = o.span || [.32, .62], c = o.c || [0, -0.16];
  const out = [];
  for (let i = 0; i < n; i++) {
    const px = c[0] + (R() - .5) * span[0], py = c[1] + (R() - .5) * span[1];
    const r = (o.r0 || .0016) + R() * (o.r1 || .004), rot = R() * TAU;
    out.push([px, py, r, rot, R()]);
  }
  return out;
}
export function drawDots(x, list, col) { x.fillStyle = col; for (const [px, py, r, rot] of list) scrap(x, px, py, r, rot, .6); }

// 雨痕（窗玻璃上的水线）
export function rainGlass(x, n, seed, x0, x1, y0, y1, col) {
  const R = mulberry(seed);
  x.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const px = x0 + R() * (x1 - x0), py = y0 + R() * (y1 - y0), L = .01 + R() * .05, w = .0008 + R() * .0012;
    x.beginPath(); x.roundRect(px, py, w, L, w / 2); x.fill();
    if (R() < .5) { x.beginPath(); x.arc(px + w / 2, py - .001, w * 1.6, 0, TAU); x.fill(); }
  }
}

// 垂直歌名（纸上的字，逐字可拆）
export function vtitle(x, s, cx, cy, size, font, o = {}) {
  const gap = o.gap || 1.16;
  [...s].forEach((ch, i) => {
    x.save(); x.translate(cx, cy - i * size * gap); x.scale(1, -1);
    x.font = `${o.weight || ''} ${size}px ${font}`.trim(); x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = o.fill || '#f6e6d2'; x.fillText(ch, 0, 0);
    x.restore();
  });
}

// 横排字（用 px 尺寸，供箱体外的片名/落款）
export function htext(x, s, cx, cy, size, font, o = {}) {
  x.save(); x.translate(cx, cy); x.scale(1, -1);
  x.font = `${o.weight || ''} ${size}px ${font}`.trim(); x.textAlign = o.align || 'center'; x.textBaseline = 'middle';
  x.fillStyle = o.fill || '#f6e6d2';
  if (o.spacing) { // 逐字拉开字距
    const chs = [...s], ws = chs.map(c => x.measureText(c).width);
    const tot = ws.reduce((a, b) => a + b, 0) + (chs.length - 1) * o.spacing;
    let px = o.align === 'left' ? 0 : -tot / 2;
    chs.forEach((c, i) => { x.textAlign = 'left'; x.fillText(c, px, 0); px += ws[i] + o.spacing; });
  } else x.fillText(s, 0, 0);
  x.restore();
}

// 胶片齿孔 / 刻度之类的工艺细节（三处重复小细节之一）
export function ticks(x, x0, x1, y, n, l, col) {
  x.fillStyle = col;
  for (let i = 0; i <= n; i++) { const px = x0 + (x1 - x0) * i / n; x.fillRect(px, y, .0008, i % 5 === 0 ? l * 1.8 : l); }
}

// 夜空星孔（打穿的洞，会烧起来）
export function starHoles(x, n, seed, r, yMin) {
  const R = mulberry(seed);
  for (let i = 0; i < n; i++) {
    const px = (R() - .5) * .56, py = (R() - .5) * .62;
    if (py < yMin) continue;
    const rr = r * (.35 + R() * R() * 1.2);
    x.beginPath(); x.arc(px, py, rr, 0, TAU); x.fill();
  }
}
