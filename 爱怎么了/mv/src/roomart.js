// 房间与物件的剪纸画法（全部用 LADDER 的同一级色，靠色阶分深度）
import { TAU, mulberry } from './lib.js';
import { cut } from './art2.js';
import { figureSil, figureSilW } from './figures.js';

// —— 后墙：一整块纸，打穿格窗，墙上留木板缝与墙裙 ——
export function wallDraw(L, p, win) {
  return x => {
    x.fillStyle = L.wall;
    x.fillRect(p.cx - p.w / 2, p.cy - p.h / 2, p.w, p.h);
    // 墙板缝：竖向 4 条，淡
    x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(0,0,0,.10)';
    for (let i = 0; i < 5; i++) x.fillRect(p.cx - p.w / 2 + i * (p.w / 4.6) + .012, p.cy - p.h / 2, .0008, p.h);
    x.restore();
    window_(x, L, win);
    // 墙裙
    x.fillStyle = L.mid; x.fillRect(p.cx - p.w / 2, FLOORY - .012, p.w, .020);
    x.fillStyle = L.prop; x.fillRect(p.cx - p.w / 2, FLOORY - .012, p.w, .0022);
  };
}
export const FLOORY = -0.16;

function window_(x, L, w) {
  const { x: cx, y: cy, w: ww, h: hh } = w;
  cut(x, () => { x.beginPath(); x.roundRect(cx - ww / 2, cy - hh / 2, ww, hh, .010); x.fill(); });
  x.save(); x.beginPath(); x.roundRect(cx - ww / 2, cy - hh / 2, ww, hh, .010); x.clip();
  x.strokeStyle = L.mid; x.lineCap = 'square'; x.lineWidth = .0018;
  for (const dy of [-hh * .34, 0, hh * .34]) { x.beginPath(); x.moveTo(cx - ww / 2, cy + dy); x.lineTo(cx + ww / 2, cy + dy); x.stroke(); }
  x.beginPath(); x.moveTo(cx, cy - hh / 2); x.lineTo(cx, cy + hh / 2); x.stroke();
  // 角部回字
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    const px = cx + sx * ww * .30, py = cy + sy * hh * .30, r = Math.min(ww, hh) * .085;
    x.beginPath(); x.moveTo(px + sx * r, py); x.lineTo(px, py); x.lineTo(px, py + sy * r); x.lineTo(px + sx * r * .55, py + sy * r); x.stroke();
  }
  x.restore();
  x.strokeStyle = L.prop; x.lineWidth = .0045;
  x.beginPath(); x.roundRect(cx - ww / 2, cy - hh / 2, ww, hh, .010); x.stroke();
  x.fillStyle = L.prop; x.fillRect(cx - ww / 2 - .010, cy - hh / 2 - .005, ww + .020, .006);
}

// —— 地板 + 地毯 + 踢脚线 ——
export function floorDraw(L, p, o = {}) {
  return x => {
    const y0 = p.cy - p.h / 2, y1 = FLOORY;
    x.fillStyle = L.mid; x.fillRect(p.cx - p.w / 2, y0, p.w, y1 - y0);
    // 地板缝
    x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(0,0,0,.16)';
    for (let i = 0; i < 9; i++) x.fillRect(p.cx - p.w / 2, FLOORY - .004 - i * .016, p.w, .0008);
    x.restore();
    if (o.rug !== false) {
      x.fillStyle = o.rugCol || L.prop;
      x.beginPath(); x.roundRect(-.02, FLOORY - .004, .20, .012, .004); x.fill();
    }
  };
}

// —— 家具与道具（同一层剪影）——
export function carton(x, cx, by, w, h, col, dark, lid = .34) {
  x.fillStyle = col;
  x.fillRect(cx - w / 2, by, w, h);
  x.fillStyle = dark;
  x.beginPath(); x.roundRect(cx - w / 2 + w * .035, by + h * .10, w * .93, h * .92, .002); x.fill();
  x.fillStyle = col;
  // 左右翻盖张开
  x.beginPath(); x.moveTo(cx - w / 2, by + h); x.lineTo(cx - w / 2 - w * .30, by + h + h * lid); x.lineTo(cx - w / 2 - w * .12, by + h + h * lid * .92); x.lineTo(cx + w * .05, by + h); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(cx + w / 2, by + h); x.lineTo(cx + w / 2 + w * .27, by + h + h * lid * .88); x.lineTo(cx + w / 2 + w * .09, by + h + h * lid * .8); x.lineTo(cx - w * .03, by + h); x.closePath(); x.fill();
  // 箱壁厚度线
  x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(0,0,0,.25)';
  x.fillRect(cx - w / 2, by + h * .52, w, .0012); x.fillRect(cx - w / 2 + w * .5, by + h * .1, .0012, h * .9);
  x.restore();
}
export function chair(x, cx, by, s, dir = 1, col) {
  x.fillStyle = col;
  const bx = cx - dir * s * .20;
  x.fillRect(bx - s * .022, by, s * .045, s * .95);
  x.fillRect(cx + dir * s * .18 - s * .022, by, s * .045, s * .44);
  x.fillRect(cx - s * .24, by + s * .42, s * .48, s * .045);
  x.fillRect(Math.min(bx, bx + dir * s * .02) - s * .018, by + s * .93, s * .085, s * .038);
  for (const k of [.58, .76]) x.fillRect(bx - s * .02, by + s * k, dir * s * .04, s * .028);
}
export function clothPile(x, cx, by, w, n, col, edge) {
  for (let i = 0; i < n; i++) {
    const y = by + i * .0075, ww = w * (.86 + .14 * Math.sin(i * 2.3)), xx = cx + (i % 2 ? .003 : -.002);
    x.fillStyle = col;
    x.beginPath(); x.roundRect(xx - ww / 2, y, ww, .0068, .0016); x.fill();
    x.fillStyle = edge; x.fillRect(xx - ww / 2 + .002, y + .0006, ww - .004, .0012);
  }
}
export function shirt(x, cx, by, w, h, col) {   // 一件摊开的薄纸衣
  x.fillStyle = col;
  x.beginPath();
  x.moveTo(cx - w * .5, by + h * .55); x.lineTo(cx - w * .30, by + h * .95); x.lineTo(cx - w * .10, by + h * .80);
  x.lineTo(cx - w * .10, by); x.lineTo(cx + w * .10, by); x.lineTo(cx + w * .10, by + h * .80);
  x.lineTo(cx + w * .30, by + h * .95); x.lineTo(cx + w * .5, by + h * .55); x.lineTo(cx + w * .26, by + h * .42);
  x.lineTo(cx + w * .26, by + h * .12); x.lineTo(cx - w * .26, by + h * .12); x.lineTo(cx - w * .26, by + h * .42);
  x.closePath(); x.fill();
}
// 挂灯（箱体里唯一的内光源）
export function pendant(x, cx, cy, r, col, glowCol) {
  x.fillStyle = col;
  x.fillRect(cx - .0008, cy, .0016, .34);
  x.beginPath(); x.moveTo(cx - r * .9, cy); x.lineTo(cx + r * .9, cy); x.lineTo(cx + r * .45, cy - r * .75); x.lineTo(cx - r * .45, cy - r * .75); x.closePath(); x.fill();
  x.fillStyle = glowCol;
  x.beginPath(); x.ellipse(cx, cy - r * .78, r * .42, r * .20, 0, 0, TAU); x.fill();
}
// 把两个人并排剪在同一张纸上（刀口从中间过）
export function pairOnSheet(x, s, o = {}) {
  x.save(); x.translate(-o.dx || 0, 0);
  figureSilW(x, s * .82, { facing: -1, pose: 'stand', arms: [[.16, .3], [-.08, .2]] });
  x.restore();
  x.save(); x.translate(o.dx || s * .5, 0);
  figureSil(x, s, { facing: 1, pose: 'stand', arms: [[.28, .5], [-.12, .26]] });
  x.restore();
}
// 纸屑雨（固定种子，位置稳定）
export function scraps(x, n, seed, o = {}) {
  const R = mulberry(seed), out = [];
  for (let i = 0; i < n; i++) out.push([(R() - .5) * (o.span || .3), (R() - .5) * (o.spanY || .4), .0012 + R() * .004, R() * TAU, R()]);
  return out;
}
export function drawScrap(x, px, py, r, rot, col) {
  x.fillStyle = col;
  x.save(); x.translate(px, py); x.rotate(rot);
  x.beginPath();
  x.moveTo(-r, -r * .5); x.quadraticCurveTo(0, -r * .2, r, -r * .6);
  x.quadraticCurveTo(r * .6, r * .55, 0, r * .5); x.quadraticCurveTo(-r * .7, r * .4, -r, -r * .5);
  x.closePath(); x.fill(); x.restore();
}
