// 场景：全部按「一块大色场 + 一个圆盘/一件大物 + 人物」的 riso 构图规则
// 每个函数只画版密度，不吃相机（相机由 film.js 统一给 g 变换）
import { g, W, H, S, ink, inkA, layer, rrect, circle, ellipse, rect, line, poly, blob, text, over } from './draw.js';

export const Y = [0, 1, 0];       // 黄版
export const R = [0, 0, 1];       // 红版
export const B = [1, 0, 0];       // 蓝版
export const YR = [0, 1, 1];      // 黄+红
export const BR = [1, 0, 1];
export const BY = [1, 1, 0];
export const K = [1, 1, 1];
export const P = [0, 0, 0];

export function disc(x, y, r, c) { circle(x, y, r, c); }
export function field(y, c) { rect(0, y, W, H - y, c); }

// 网点带：用密度值分区，shader 自动出网点
export function bands(y0, h, steps, c0, dir = 1) {
  for (let i = 0; i < steps.length; i++) {
    const c = [c0[0] * steps[i], c0[1] * steps[i], c0[2] * steps[i]];
    rect(0, y0 + i * h, W, h + 1, c);
  }
}

// 相框（motif）：空框 / 带内容
export function frame(x, y, w, h, o = {}) {
  const c = o.c || B, th = o.th || 10;
  rect(x - th, y - th, w + th * 2, h + th * 2, c);
  rect(x, y, w, h, o.inner || P);
  if (o.pic) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); o.pic(x, y, w, h); g.restore(); }
}

// 手机（取景框）
export function phone(x, y, w, h, o = {}) {
  rrect(x - w / 2, y - h / 2, w, h, 34, B);
  rrect(x - w / 2 + 18, y - h / 2 + 18, w - 36, h - 36, 22, [0, 0, 0]);
  const vf = o.vf ?? 1;
  if (vf > 0) {
    g.save(); g.globalAlpha = 1;
    const L = 70, c = R;
    const corners = [[x - w / 2 + 40, y - h / 2 + 40, 1, 1], [x + w / 2 - 40, y - h / 2 + 40, -1, 1],
                     [x - w / 2 + 40, y + h / 2 - 40, 1, -1], [x + w / 2 - 40, y + h / 2 - 40, -1, -1]];
    for (const [cx, cy, sx, sy] of corners) {
      rect(cx, cy, L * sx, 8 * sy, c); rect(cx, cy, 8 * sx, L * sy, c);
    }
    g.restore();
  }
}

// 视力表
export function eyeChart(x, y, w, rows = 6) {
  rrect(x - w / 2, y - w * .75, w, w * 1.5, 12, [0, 0, 0]);
  for (let i = 0; i < rows; i++) {
    const s = (1 - i * .14) * w * .12;
    text('E', x, y - w * .55 + i * w * .24, `700 ${Math.round(s * 2)}px STKaiti, serif`, B, 'center', 'middle');
  }
}

// 挂钟
export function clock(x, y, r, t, stopAt) {
  circle(x, y, r, B);
  circle(x, y, r * .9, P);
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    line([[x + Math.sin(a) * r * .78, y - Math.cos(a) * r * .78], [x + Math.sin(a) * r * .86, y - Math.cos(a) * r * .86]], r * .03, B);
  }
  const tm = stopAt ?? t;
  const ma = tm / 60 * Math.PI * 2 * 3 + 1.2;
  line([[x, y], [x + Math.sin(ma) * r * .62, y - Math.cos(ma) * r * .62]], r * .035, R);
  line([[x, y], [x + Math.sin(tm * .5) * r * .42, y - Math.cos(tm * .5) * r * .42]], r * .05, B);
}

// 火堆（纸白 knockout + 红黄苗）
export function fire(x, y, s, k = 1, t = 0) {
  // 柴
  for (const a of [-.5, .2, .9]) {
    g.save(); g.translate(x, y); g.rotate(a);
    rrect(-1.6 * s, -0.18 * s, 3.2 * s, .36 * s, .18 * s, B);
    g.restore();
  }
  // 苗：三片，随拍呼吸
  const h = s * (1.6 + .5 * k);
  for (let i = -1; i <= 1; i++) {
    const w = s * (.55 - Math.abs(i) * .12), hh = h * (1 - Math.abs(i) * .28);
    g.beginPath(); g.moveTo(x + i * s * .5, y);
    g.quadraticCurveTo(x + i * s * .5 - w, y - hh * .55, x + i * s * .5, y - hh);
    g.quadraticCurveTo(x + i * s * .5 + w, y - hh * .55, x + i * s * .5, y);
    g.fillStyle = inkA(i === 0 ? Y : YR); g.fill();
  }
  if (k > .01) { g.save(); g.globalCompositeOperation = 'lighter'; circle(x, y - h * .55, s * 2.1 * k, [0, .42, 0]); g.restore(); }
}

// 纸屑/风
export function debris(pts) { for (const [x, y, s, a, c] of pts) { g.save(); g.translate(x, y); g.rotate(a); rect(-s / 2, -s / 4, s, s / 2, c || R); g.restore(); } }

// 海报卷边
export function poster(x, y, w, h, o = {}) {
  rrect(x, y, w, h, 4, [0, 0, 0]);
  rect(x - 14, y - 14, w + 28, 16, o.tape || [0, 0, .3]);
  // 胶带
  g.save(); g.translate(x + w * .5, y - 10); g.rotate(-.03); rect(-42, -16, 84, 32, [0, 0, .3]); g.restore();
}

// 长椅
export function bench(x, y, s = 1) {
  rect(x, y - 26 * s, 240 * s, 14 * s, R);
  rect(x, y - 70 * s, 240 * s, 12 * s, R);
  rect(x + 10 * s, y - 26 * s, 12 * s, 40 * s, B);
  rect(x + 216 * s, y - 26 * s, 12 * s, 40 * s, B);
}

// 路灯
export function lamp(x, y, h, c = B) {
  rect(x - 5, y - h, 10, h, c);
  circle(x, y - h - 6, 22, c);
}

// ═════════ 剪纸风景库（参考图语言：撕边、圆滚滚、纸层） ═════════

// 云：三团圆 + 平底，可给漂移速度
export function cloud(x, y, s, c, drift = 0) {
  const cx = x + drift;
  blob([[cx - 2.2 * s, y + .45 * s], [cx - 2.4 * s, y - .3 * s], [cx - 1.2 * s, y - .75 * s],
        [cx, y - 1.15 * s], [cx + 1.3 * s, y - .8 * s], [cx + 2.3 * s, y - .25 * s],
        [cx + 2.1 * s, y + .45 * s]], c);
}

// 撕边远山：一条起伏纸带（seed 变换形状）
export function hills(y, amp, c, seed = 1, yBase = 1080) {
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const x = i / 8 * (W + 160) - 80;
    const yy = y - Math.abs(Math.sin(i * 1.7 + seed * 3.3)) * amp - Math.sin(i * .9 + seed) * amp * .3;
    pts.push([x, yy]);
  }
  pts.push([W + 80, yBase + 40], [-80, yBase + 40]);
  poly(pts, c);
}

// 水面：多层撕边水带（参考图下方的蓝色纸层）
export function waves(y, rows, c, t = 0, amp = 14) {
  for (let i = 0; i < rows; i++) {
    const yy = y + i * 44;
    const pts = [];
    for (let k = 0; k <= 10; k++) {
      const x = k / 10 * (W + 120) - 60;
      pts.push([x, yy + Math.sin(k * 1.3 + i * 2 + t * (1.2 + i * .2)) * amp]);
    }
    pts.push([W + 60, H + 40], [-60, H + 40]);
    poly(pts, [c[0] * (1 - i * .16), c[1] * (1 - i * .16), c[2] * (1 - i * .16)]);
  }
}

// 太阳/大圆盘 + 光芒线（对参考图米色天+光感的 riso 转译）
export function sunburst(x, y, r, c, t = 0, rays = 12, len = .35) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < rays; i++) {
    const a = i / rays * Math.PI * 2 + t * .05;
    const r1 = r * 1.08, r2 = r * (1.08 + len * (0.75 + .25 * Math.sin(t * 2 + i)));
    line([[x + Math.cos(a) * r1, y + Math.sin(a) * r1], [x + Math.cos(a) * r2, y + Math.sin(a) * r2]], 10, [c[0] * .3, c[1] * .3, c[2] * .3]);
  }
  g.restore();
  circle(x, y, r, c);
}

// 小鸟：两道弧
export function bird(x, y, s, c, flap = 0) {
  const f = Math.sin(flap) * .35;
  line([[x - s, y + f * s], [x - s * .2, y - s * .45], [x, y]], s * .28, c);
  line([[x, y], [x + s * .2, y - s * .45], [x + s, y + f * s]], s * .28, c);
}

// 四角星（闪光）
export function spark4(x, y, s, c, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.beginPath();
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, rr = i % 2 ? s * .32 : s; const X = Math.cos(a) * rr, Yy = Math.sin(a) * rr; i ? g.lineTo(X, Yy) : g.moveTo(X, Yy); }
  g.closePath(); g.fillStyle = inkA(c); g.fill(); g.restore();
}

// 草丛：三片叶
export function grass(x, y, s, c, sway = 0) {
  const w = Math.sin(sway) * s * .3;
  line([[x, y], [x - s * .5 + w, y - s]], s * .22, c);
  line([[x, y], [x + w * .5, y - s * 1.3]], s * .22, c);
  line([[x, y], [x + s * .55 + w, y - s * .85]], s * .22, c);
}

// 小花：花瓣圆 + 芯
export function flower(x, y, s, c, core, sway = 0) {
  line([[x, y], [x + Math.sin(sway) * s * .3, y - s * 2.2]], s * .18, [c[0] * .5, c[1] * .5, c[2] * .5]);
  const fx = x + Math.sin(sway) * s * .3, fy = y - s * 2.2;
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2 + sway * .5;
    circle(fx + Math.cos(a) * s * .7, fy + Math.sin(a) * s * .7, s * .5, c);
  }
  circle(fx, fy, s * .42, core);
}

// 纸艺树：圆冠 + 干
export function tree(x, y, s, crown, trunk = BR) {
  rect(x - s * .12, y - s * 1.1, s * .24, s * 1.1, trunk);
  blob([[x - s * .95, y - s * 1.0], [x - s * .8, y - s * 1.9], [x, y - s * 2.3],
        [x + s * .8, y - s * 1.9], [x + s * .95, y - s * 1.0],
        [x + s * .45, y - s * .75], [x - s * .45, y - s * .75]], crown);
}

// 旗串（派对感）
export function bunting(x0, y0, x1, y1, n, cA, cB, sag = 40) {
  line([[x0, y0], [x1, y1]], 5, B);
  for (let i = 0; i < n; i++) {
    const k = (i + .5) / n;
    const x = lerp(x0, x1, k), y = lerp(y0, y1, k) + Math.sin(k * Math.PI) * sag;
    g.save(); g.translate(x, y); g.rotate((hash(i * 3.3) - .5) * .3);
    poly([[-16, 0], [16, 0], [0, 34]], i % 2 ? cA : cB);
    g.restore();
  }
}
const lerp = (a, b, k) => a + (b - a) * k;
const hash = s => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };

// 纸船（参考图同款：白纸折船）
export function boat(x, y, s, c = P) {
  poly([[x - s, y], [x + s, y], [x + s * .62, y + s * .42], [x - s * .62, y + s * .42]], c);
  poly([[x - s * .62, y], [x + s * .62, y], [x, y - s * .55]], c);
  line([[x - s * .3, y], [x, y - s * .28], [x + s * .3, y]], s * .07, [1, 1, 1]);
}
