// 场景：房间 / 窗 / 桌面 / 录音机 / 椅子 / 夜城（画一次的气刷背景板）/ VU 表 / 磁带
import { path, cel, line, ribbon, flutter, rgba, mix, airbrush, vgrad, hash, TAU } from '/styles/cel-anime-80s/demo/cel.js';
import { canvas } from '/styles/cel-anime-80s/demo/cel.js';

export const ROOM = {
  floorY: 764,
  win: { x: 1128, y: 132, w: 656, h: 566 },
  table: { x: 306, y: 706, w: 546, d: 26 },
  chairA: { x: 168, seat: 744, dir: 1 },     // 他坐的（桌边）
  chairB: { x: 972, seat: 750, dir: -1 },   // 空着的（窗边）
  lamp: { x: 620, y: 34 },
};

function rrPath(x, y, w, h, r) {
  const p = new Path2D();
  p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r); p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h); p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r); p.quadraticCurveTo(x, y, x + r, y); p.closePath(); return p;
}

// —— 墙 / 地板 / 灯 ——
export function drawBackWall(g, e, S, o = {}) {
  const E = S.env;
  const OX = -600, OW = 3120;   // 画得比画面宽：机位横移时不露黑边
  vgrad(g, OX, 0, OW, ROOM.floorY, [[0, E.wallLo], [.35, E.wall], [1, mix(E.wall, E.wallHi, .5)]]);
  g.fillStyle = rgba(E.wallHi, .22); g.fillRect(OX, 0, OW, 118);
  g.fillStyle = rgba(E.wallLo, .3); g.fillRect(OX, ROOM.floorY - 96, OW, 96);
  g.strokeStyle = rgba(E.wallLo, .28); g.lineWidth = 2;
  for (let x = OX; x < OX + OW; x += 46) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, ROOM.floorY); g.stroke(); }
  // 踢脚线
  g.fillStyle = E.floorLo; g.fillRect(OX, ROOM.floorY - 22, OW, 22);
  g.fillStyle = rgba(E.wallHi, .5); g.fillRect(OX, ROOM.floorY - 22, OW, 4);
  // 地板
  vgrad(g, OX, ROOM.floorY, OW, 1300 - ROOM.floorY, [[0, E.floorHi], [.35, E.floor], [1, E.floorLo]]);
  g.strokeStyle = rgba(E.floorLo, .55); g.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    const y = ROOM.floorY + i * i * 5 + i * 8;
    g.beginPath(); g.moveTo(OX, y); g.lineTo(OX + OW, y); g.stroke();
  }
  for (let x = -400; x < 2400; x += 210) {
    g.beginPath(); g.moveTo(x, ROOM.floorY); g.lineTo(x + (x - 960) * .9, 1080); g.stroke();
  }
  // 墙上挂画（80 年代房间该有的东西）
  const px = 300, py = 210;
  g.fillStyle = S.prop.woodLo; g.fillRect(px - 8, py - 8, 176, 132);
  g.fillStyle = S.prop.wood; g.fillRect(px - 4, py - 4, 168, 124);
  g.fillStyle = mix(E.wall, '#000', .35); g.fillRect(px + 4, py + 4, 152, 108);
  g.fillStyle = rgba(E.lamp, .18);
  g.fill(path([[px + 4, py + 112], [px + 60, py + 50], [px + 108, py + 112]]));
  g.fillStyle = rgba(E.lamp, .1); g.beginPath(); g.arc(px + 118, py + 34, 14, 0, TAU); g.fill();
}

export function drawLamp(g, e, S, t = 0, on = 1) {
  const E = S.env, x = ROOM.lamp.x, y = ROOM.lamp.y;
  g.strokeStyle = E.wallLo; g.lineWidth = 4;
  g.beginPath(); g.moveTo(x, 0); g.lineTo(x, y + 26); g.stroke();
  // 灯罩
  const shade = [[x - 74, y + 96], [x - 30, y + 18], [x + 30, y + 18], [x + 74, y + 96]];
  cel(g, shade, { f: mix(E.lamp, E.wallLo, .35), s: E.wallLo, so: [-14, -8], h: E.lampHot, ho: [10, 12], l: E.wallLo, lw: 3 });
  g.fillStyle = E.lampHot; g.beginPath(); g.ellipse(x, y + 96, 74, 10, 0, 0, TAU); g.fill();
  if (e) {
    e.save(); e.globalCompositeOperation = 'lighter';
    airbrush(e, x, y + 104, 150, 90, E.lamp, .75 * on);
    airbrush(e, x, y + 104, 420, 300, E.lamp, .28 * on);
    e.restore();
  }
  // 灯下的光锥（打在墙上，硬边）
  g.save(); g.globalCompositeOperation = 'screen';
  const cone = [[x - 76, y + 96], [x + 76, y + 96], [x + 330, ROOM.floorY + 40], [x - 330, ROOM.floorY + 40]];
  const gr = g.createLinearGradient(0, y + 96, 0, ROOM.floorY + 40);
  gr.addColorStop(0, rgba(E.lamp, .34 * on)); gr.addColorStop(1, rgba(E.lamp, 0));
  g.fillStyle = gr; g.fill(path(cone));
  g.restore();
  // 地板上的光池
  g.save(); g.globalCompositeOperation = 'screen';
  airbrush(g, x, ROOM.floorY + 120, 420, 120, E.lamp, .18 * on);
  g.restore();
}

// —— 窗 + 竖条百叶 + 窗外夜 ——
export function drawWindow(g, e, S, o = {}) {
  const W0 = ROOM.win, E = S.env;
  const open = o.open ?? 0;                  // 0 关 / 1 全开
  const rain = o.rain ?? 1;
  // 窗框
  g.fillStyle = E.wallLo; g.fillRect(W0.x - 16, W0.y - 16, W0.w + 32, W0.h + 32);
  g.fillStyle = S.prop.woodLo; g.fillRect(W0.x - 10, W0.y - 10, W0.w + 20, W0.h + 20);
  // 玻璃（画外的夜）
  g.save(); g.beginPath(); g.rect(W0.x, W0.y, W0.w, W0.h); g.clip();
  vgrad(g, W0.x, W0.y, W0.w, W0.h, [[0, mix(E.glass, '#000', .55)], [.5, mix(E.glass, '#000', .25)], [1, mix(E.glass, E.glassHi, .35)]]);
  // 远处的楼与灯窗（气刷）
  // 远处一层楼（压得很暗）
  for (let i = 0; i < 30; i++) {
    const bx = W0.x + hash(i * 3.1 + 5) * W0.w, bw = 34 + hash(i * 7.7) * 70;
    const bh = 120 + hash(i * 5.3) * 300;
    g.fillStyle = 'rgba(9,13,34,.95)';
    g.fillRect(bx, W0.y + W0.h - bh, bw, bh);
  }
  // 近处一层楼（更暗，遮住一部分）
  for (let i = 0; i < 22; i++) {
    const bx = W0.x + hash(i * 4.9 + 11) * W0.w, bw = 60 + hash(i * 8.3) * 110;
    const bh = 80 + hash(i * 6.1) * 240;
    g.fillStyle = 'rgba(6,9,22,.97)';
    g.fillRect(bx, W0.y + W0.h - bh, bw, bh);
    for (let y = W0.y + W0.h - bh + 14; y < W0.y + W0.h - 12; y += 22) {
      for (let x = bx + 8; x < bx + bw - 10; x += 16) {
        if (hash(x * .7 + y * 1.3) > .74) {
          const warm = hash(x + y) > .42;
          const cc = warm ? E.lamp : (E.cyan || E.glassHi);
          g.fillStyle = rgba(cc, .8); g.fillRect(x, y, 7, 9);
          if (e) { e.fillStyle = rgba(cc, .75); e.fillRect(x, y, 7, 9); }
        }
      }
    }
  }
  // 街底的暖光（城市自己的光，从下往上）
  g.save(); g.globalCompositeOperation = 'screen';
  const gg = g.createRadialGradient(W0.x + W0.w * .5, W0.y + W0.h, 40, W0.x + W0.w * .5, W0.y + W0.h, W0.w * .8);
  gg.addColorStop(0, rgba(E.magenta || E.lamp, .32)); gg.addColorStop(.5, rgba(E.lamp, .12)); gg.addColorStop(1, rgba(E.lamp, 0));
  g.fillStyle = gg; g.fillRect(W0.x, W0.y, W0.w, W0.h);
  g.restore();
  if (e) {
    e.save(); e.beginPath(); e.rect(W0.x, W0.y, W0.w, W0.h); e.clip(); e.globalCompositeOperation = 'lighter';
    const eg = e.createRadialGradient(W0.x + W0.w * .5, W0.y + W0.h, 20, W0.x + W0.w * .5, W0.y + W0.h, W0.w * .75);
    eg.addColorStop(0, rgba(E.magenta || E.lamp, .5)); eg.addColorStop(.5, rgba(E.lamp, .2)); eg.addColorStop(1, rgba(E.lamp, 0));
    e.fillStyle = eg; e.fillRect(W0.x, W0.y, W0.w, W0.h);
    e.restore();
  }
  // 玻璃上的雨（斜线 + 水珠）
  if (rain > 0) {
    g.strokeStyle = rgba('#BBD8E8', .3); g.lineWidth = 1.6;
    for (let i = 0; i < 90; i++) {
      const x = W0.x + hash(i * 1.7) * W0.w, y = W0.y + hash(i * 2.9) * W0.h;
      const l = 20 + hash(i * 4.1) * 60;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - 5, y + l); g.stroke();
    }
  }
  g.restore();
  // 竖条百叶（开着的时候往两侧收）
  const slats = 9, gapx = W0.w / slats, slid = open * gapx * .8;
  for (let i = 0; i < slats; i++) {
    const x = W0.x + i * gapx + slid * (i < slats / 2 ? -1 : 1) * .5;
    g.fillStyle = mix(E.blind, E.glass, .28); g.fillRect(x, W0.y, gapx * .66, W0.h);
    g.fillStyle = rgba(E.glassHi, .3); g.fillRect(x + gapx * .66, W0.y, 2, W0.h);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + gapx * .68, W0.y, 4, W0.h);
    g.fillStyle = rgba(E.glassHi, .12); g.fillRect(x + 6, W0.y, 3, W0.h);
  }
  // 窗台
  g.fillStyle = S.prop.woodLo; g.fillRect(W0.x - 22, W0.y + W0.h, W0.w + 44, 18);
  g.fillStyle = S.prop.wood; g.fillRect(W0.x - 22, W0.y + W0.h, W0.w + 44, 8);
  // 中竖框
  g.fillStyle = S.prop.woodLo; g.fillRect(W0.x + W0.w / 2 - 5, W0.y, 10, W0.h - 4);
  if (e) {
    e.save(); e.beginPath(); e.rect(W0.x, W0.y, W0.w, W0.h); e.clip();
    e.globalCompositeOperation = 'lighter';
    e.fillStyle = rgba(E.glassHi, .13); e.fillRect(W0.x, W0.y, W0.w, W0.h);
    e.restore();
  }
}

// 百叶窗投在墙上的光条（每拍一道，方向随光照）
export function blindBars(g, S, shift = 0, alpha = .16) {
  const W0 = ROOM.win, E = S.env;
  g.save(); g.beginPath(); g.rect(0, 0, W0.x + 20, ROOM.floorY); g.clip();
  g.globalCompositeOperation = 'screen';
  g.fillStyle = rgba(E.lamp, alpha);
  for (let i = 0; i < 13; i++) {
    const x = W0.x - 300 - i * 74 + shift * 60;
    const bar = [[x, ROOM.floorY], [x + 30, ROOM.floorY], [x + 300, 60], [x + 270, 60]];
    g.fill(path(bar));
  }
  g.restore();
}

// —— 椅子（3/4 侧后像：靠背有宽度，才能读成"一把椅子"） ——
export function drawChair(g, S, o) {
  const PR = S.prop, dir = o.dir ?? 1, x = o.x, y = o.seat, sc = o.scale ?? 1;
  g.save(); g.translate(x, y); g.scale(dir * sc, sc);
  const P = q => path(q.map(p => [p[0], p[1], 1]));
  // 后腿（远）
  g.fillStyle = PR.woodLo; g.fill(P([[-74, 0], [-58, 0], [-52, 168], [-70, 168]]));
  // 靠背（梯形 + 两条横档 + 镂空）
  cel(g, P([[-88, -238], [30, -212], [30, -12], [-88, -38]]),
    { f: PR.wood, s: PR.woodLo, so: [-14, -10], h: PR.woodHi, ho: [10, 12], l: PR.woodLo, lw: 3 });
  g.fillStyle = rgba(PR.woodLo, .85);
  for (let i = 0; i < 2; i++) g.fill(P([[-80, -206 + i * 62], [22, -184 + i * 62], [22, -166 + i * 62], [-80, -188 + i * 62]]));
  g.fillStyle = rgba(PR.woodHi, .5); g.fill(P([[-86, -234], [29, -208], [29, -196], [-86, -222]]));
  // 座面（平行四边形）
  cel(g, P([[-96, -16], [118, -6], [128, 16], [-88, 6]]),
    { f: PR.wood, s: PR.woodLo, so: [-8, 14], h: PR.woodHi, ho: [6, -10], l: PR.woodLo, lw: 3 });
  // 前腿 + 横撑
  for (const lx of [104, -82]) {
    g.fillStyle = PR.woodLo; g.fill(P([[lx, 6], [lx + 14, 6], [lx + 10, 174], [lx - 4, 174]]));
    g.fillStyle = rgba(PR.wood, .8); g.fill(P([[lx + 2, 8], [lx + 6, 8], [lx + 3, 170], [lx - 1, 170]]));
  }
  g.fillStyle = PR.woodLo; g.fill(P([[-84, 104], [112, 104], [112, 116], [-84, 116]]));
  g.restore();
}

// —— 桌子 + 双卡录音机 ——
export function drawTable(g, S, o = {}) {
  const T = ROOM.table, PR = S.prop;
  // 桌面
  cel(g, rrPath(T.x, T.y, T.w, T.d + 10, 6), { f: PR.wood, s: PR.woodLo, so: [-8, 12], h: PR.woodHi, ho: [6, -8], l: PR.woodLo, lw: 3 });
  g.fillStyle = PR.woodLo; g.fillRect(T.x + 8, T.y + T.d + 10, T.w - 16, 12);
  // 腿
  for (const lx of [T.x + 26, T.x + T.w - 46]) {
    g.fillStyle = PR.woodLo; g.fillRect(lx, T.y + T.d + 10, 20, ROOM.floorY + 130 - T.y);
    g.fillStyle = PR.wood; g.fillRect(lx + 3, T.y + T.d + 12, 6, ROOM.floorY + 126 - T.y);
  }
  // 桌上小物：杯
  const cx = T.x + 92;
  cel(g, rrPath(cx, T.y - 44, 40, 46, 6), { f: PR.cream, s: mix(PR.cream, '#000', .35), so: [-8, 6], h: '#fff', ho: [6, -6], l: PR.woodLo, lw: 2.4 });
  g.fillStyle = rgba(PR.woodLo, .65); g.fillRect(cx + 3, T.y - 36, 34, 8);
}

export function drawDeck(g, e, S, o = {}) {
  const PR = S.prop, x = o.x ?? 470, y = o.y ?? 636, sc = o.scale ?? 1;
  const spin = o.spin ?? 0, vu = o.vu ?? -0.2, redOn = o.redOn ?? 0;
  g.save(); g.translate(x, y); g.scale(sc, sc);
  // 机身
  cel(g, rrPath(-170, -56, 340, 112, 8), { f: PR.deck, s: PR.deckLo, so: [-10, 8], h: PR.deckHi, ho: [8, -8], l: S.char.line, lw: 3 });
  // 两个卡座窗
  for (const wx of [-146, -38]) {
    const win = rrPath(wx, -44, 96, 52, 5);
    g.fillStyle = PR.deckLo; g.fill(win);
    g.fillStyle = rgba(PR.gold, .12); g.fill(win);
    for (const rx of [wx + 26, wx + 68]) {
      g.strokeStyle = PR.metal; g.lineWidth = 2.5; g.beginPath(); g.arc(rx, -18, 15, 0, TAU); g.stroke();
      g.fillStyle = PR.deckLo; g.beginPath(); g.arc(rx, -18, 13.5, 0, TAU); g.fill();
      // 磁带盘：外圈 + 六根细辐 + 中心孔
      g.strokeStyle = PR.gold; g.lineWidth = 1.6;
      g.beginPath(); g.arc(rx, -18, 10, 0, TAU); g.stroke();
      for (let k = 0; k < 6; k++) {
        const a = spin + k * TAU / 6;
        g.beginPath(); g.moveTo(rx + Math.cos(a) * 4, -18 + Math.sin(a) * 4);
        g.lineTo(rx + Math.cos(a) * 10, -18 + Math.sin(a) * 10); g.stroke();
      }
      g.fillStyle = PR.deckLo; g.beginPath(); g.arc(rx, -18, 3.6, 0, TAU); g.fill();
      g.strokeStyle = PR.metal; g.lineWidth = 1.4; g.stroke();
    }
    g.strokeStyle = S.char.line; g.lineWidth = 2.2; g.stroke(win);
  }
  // VU 表
  const vx = 108, vy = -18;
  g.fillStyle = PR.cream; g.fill(rrPath(vx - 52, vy - 26, 104, 52, 4));
  g.save(); g.beginPath(); g.rect(vx - 52, vy - 26, 104, 52); g.clip();
  for (let i = 0; i <= 14; i++) {
    const a = -2.5 + i * .165;
    g.strokeStyle = i > 10 ? PR.red : S.char.line; g.lineWidth = i > 10 ? 2.6 : 1.6;
    const r0 = 40, r1 = i % 2 ? 34 : 30;
    g.beginPath(); g.moveTo(vx + Math.cos(a) * r0 * .55, vy + 30 + Math.sin(a) * r0 * .55);
    g.lineTo(vx + Math.cos(a) * r1 * .55, vy + 30 + Math.sin(a) * r1 * .55); g.stroke();
  }
  g.strokeStyle = PR.red; g.lineWidth = 3.4;
  g.beginPath(); g.arc(vx, vy + 30, 46, -2.42, -1.42); g.stroke();
  // 针
  const na = -2.32 + (vu + 1) / 2 * 1.05;
  g.strokeStyle = PR.red; g.lineWidth = 3;
  g.beginPath(); g.moveTo(vx, vy + 30); g.lineTo(vx + Math.cos(na) * 42, vy + 30 + Math.sin(na) * 42); g.stroke();
  g.fillStyle = S.char.line; g.beginPath(); g.arc(vx, vy + 30, 4, 0, TAU); g.fill();
  // 表盘玻璃反光
  g.fillStyle = 'rgba(255,255,255,.16)';
  g.fill(path([[vx - 52, vy - 26], [vx - 10, vy - 26], [vx - 40, vy + 26], [vx - 52, vy + 26]]));
  g.restore();
  g.strokeStyle = S.char.line; g.lineWidth = 2.4; g.stroke(rrPath(vx - 52, vy - 26, 104, 52, 4));
  // 按键
  for (let i = 0; i < 6; i++) {
    const bx = -150 + i * 26, pressed = o.pressed === i ? 4 : 0;
    cel(g, rrPath(bx, 26 + pressed, 20, 14, 3), { f: PR.metal, s: PR.chromeLo, so: [-4, 4], h: PR.chrome, ho: [3, -4], l: S.char.line, lw: 1.8 });
  }
  // 红灯
  g.fillStyle = redOn > .5 ? PR.red : rgba(PR.red, .25);
  g.beginPath(); g.arc(168, -30, 5, 0, TAU); g.fill();
  g.restore();
  if (e) {
    e.save(); e.globalAlpha = 1;
    if (redOn > .5) { airbrush(e, x + 168 * sc, y - 30 * sc, 40 * sc, 40 * sc, PR.red, .7 * redOn); }
    e.fillStyle = rgba(PR.cream, .18); e.fillRect(x - 170 * sc, y - 60 * sc, 340 * sc, 40 * sc);
    e.restore();
  }
}

// —— VU 大特写（L4） ——
export function drawVU(g, e, S, o = {}) {
  const PR = S.prop, cx = o.x ?? 960, cy = o.y ?? 560, R = o.r ?? 420;
  const vu = o.vu ?? -.3, red = o.red ?? 0, glare = o.glare ?? 0;
  // 表盘底
  const face = new Path2D();
  face.arc(cx, cy, R, Math.PI * .82, Math.PI * 2.18);
  face.closePath();
  g.fillStyle = PR.cream; g.fill(face);
  g.save(); g.clip(face);
  // 刻度
  for (let i = 0; i <= 16; i++) {
    const u = i / 16, a = Math.PI * .96 + u * Math.PI * 1.12;
    const isRed = u > .74;
    g.strokeStyle = isRed ? PR.red : S.char.line;
    g.lineWidth = i % 4 === 0 ? 6 : 3;
    const r0 = R * .82, r1 = i % 4 === 0 ? R * .62 : R * .7;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke();
  }
  // 红区弧
  g.strokeStyle = PR.red; g.lineWidth = 10;
  g.beginPath(); g.arc(cx, cy, R * .74, Math.PI * .96 + .74 * Math.PI * 1.12, Math.PI * .96 + Math.PI * 1.12); g.stroke();
  // 玻璃高光（滑动）
  g.fillStyle = 'rgba(255,255,255,.3)';
  g.fill(path([[cx - R, cy - R * .2 + glare * 30], [cx - R * .3, cy - R * .9 + glare * 30], [cx + R * .12, cy - R * .9 + glare * 30], [cx - R * .6, cy - R * .1 + glare * 30]]));
  g.restore();
  // 指针
  const a = Math.PI * .96 + ((vu + 1) / 2) * Math.PI * 1.12;
  g.strokeStyle = S.char.line; g.lineWidth = 9; g.lineCap = 'round';
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R * .8, cy + Math.sin(a) * R * .8); g.stroke();
  g.strokeStyle = PR.needle; g.lineWidth = 4;
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R * .78, cy + Math.sin(a) * R * .78); g.stroke();
  g.fillStyle = S.char.line; g.beginPath(); g.arc(cx, cy, R * .1, 0, TAU); g.fill();
  g.fillStyle = PR.cream; g.beginPath(); g.arc(cx, cy, R * .055, 0, TAU); g.fill();
  // 外框
  g.strokeStyle = S.char.line; g.lineWidth = 14; g.stroke(face);
  if (e) {
    e.save(); e.globalCompositeOperation = 'lighter';
    airbrush(e, cx, cy + R * .3, R * 1.3, R * .9, PR.cream, .18);
    if (red > 0) airbrush(e, cx + R * .55, cy - R * .35, R * .5, R * .4, PR.red, .8 * red);
    e.restore();
  }
}

// —— 磁带 ——
export function drawCassette(g, e, S, o = {}) {
  const PR = S.prop, x = o.x ?? 960, y = o.y ?? 620, sc = o.scale ?? 1, spin = o.spin ?? 0;
  g.save(); g.translate(x, y); g.scale(sc, sc);
  const body = rrPath(-150, -95, 300, 190, 8);
  cel(g, body, { f: PR.deckHi, s: PR.deckLo, so: [-12, 10], h: mix(PR.deckHi, '#fff', .3), ho: [10, -8], l: S.char.line, lw: 3 });
  // J-card 标签
  g.fillStyle = PR.card; g.fill(rrPath(-134, -80, 268, 118, 4));
  g.strokeStyle = rgba(S.char.line, .5); g.lineWidth = 2; g.stroke(rrPath(-134, -80, 268, 118, 4));
  // 手写 01–07
  g.save(); g.font = '600 26px STKaiti'; g.fillStyle = rgba(S.char.line, .9);
  for (let i = 0; i < 7; i++) {
    const lit = (o.lit ?? 0) > i;
    g.fillStyle = lit ? PR.gold : rgba(S.char.line, .55);
    g.fillText(String(i + 1).padStart(2, '0'), -110 + (i % 2) * 118, -46 + Math.floor(i / 2) * 34);
  }
  g.restore();
  // 两个盘（磁带盘：外圈带 + 轮毂 + 六齿）
  for (const rx of [-58, 58]) {
    g.fillStyle = PR.deckLo; g.beginPath(); g.arc(rx, 62, 30, 0, TAU); g.fill();
    g.strokeStyle = rgba(PR.gold, .85); g.lineWidth = 3.2;
    g.beginPath(); g.arc(rx, 62, 23, 0, TAU); g.stroke();
    g.fillStyle = PR.metal; g.beginPath(); g.arc(rx, 62, 11, 0, TAU); g.fill();
    g.fillStyle = PR.deckLo;
    for (let k = 0; k < 6; k++) {
      const a = spin + k * TAU / 6;
      g.beginPath();
      g.arc(rx + Math.cos(a) * 6.5, 62 + Math.sin(a) * 6.5, 2.6, 0, TAU); g.fill();
    }
    g.fillStyle = PR.deckLo; g.beginPath(); g.arc(rx, 62, 3.4, 0, TAU); g.fill();
    g.strokeStyle = S.char.line; g.lineWidth = 2; g.beginPath(); g.arc(rx, 62, 30, 0, TAU); g.stroke();
  }
  g.restore();
}

// —— 拉出来的带子（一条会流动的带） ——
export function tapeRibbon(g, e, S, o = {}) {
  const PR = S.prop;
  const sp = o.spine, w = o.width ?? 12;
  const pts = ribbon(sp, i => w * (1 - .25 * i));
  cel(g, pts, { f: PR.gold, s: mix(PR.gold, '#000', .5), so: [0, 6], h: PR.goldHi, ho: [0, -5], l: S.char.line, lw: 2.2 });
  if (e) {
    e.save(); e.globalCompositeOperation = 'lighter';
    e.strokeStyle = rgba(PR.gold, .5); e.lineWidth = w * 1.6; e.lineJoin = 'round';
    e.beginPath(); pts.forEach((p, i) => i ? e.lineTo(p[0], p[1]) : e.moveTo(p[0], p[1])); e.closePath(); e.stroke();
    e.restore();
  }
}

// —— 夜城（气刷背景板，只在载入时画一次） ——
export function cityLayers(seed = 7, wMax = 3400) {
  const plates = [];
  const cfg = [
    { n: 30, hMin: 240, hMax: 470, lit: .2, col: '#05080F', edge: '#1C2438', neon: 0, wMin: 130, wMax: 300 },
    { n: 22, hMin: 330, hMax: 660, lit: .28, col: '#060A14', edge: '#222C42', neon: 1, wMin: 160, wMax: 360 },
    { n: 14, hMin: 440, hMax: 840, lit: .36, col: '#080D1A', edge: '#2A3550', neon: 1, wMin: 220, wMax: 440 },
  ];
  cfg.forEach((cf, li) => {
    const [c, g] = canvas(wMax, 1000), [ec, e] = canvas(wMax, 1000);
    e.fillStyle = '#000'; e.fillRect(0, 0, wMax, 1000);
    let x = -240;
    for (let i = 0; i < cf.n && x < wMax + 240; i++) {
      const bw = cf.wMin + hash(seed + i * 3.7 + li * 11) * (cf.wMax - cf.wMin);
      const bh = cf.hMin + hash(seed + i * 5.1 + li * 7) * (cf.hMax - cf.hMin);
      const y = 1000 - bh - (li * 34);
      // 楼体（比夜色更暗，才读得出轮廓）
      g.fillStyle = cf.col; g.fillRect(x, y, bw, bh + 260);
      // 天面边缘高光（一条硬边，把楼从天空里切出来）
      g.fillStyle = rgba(cf.edge, .55); g.fillRect(x, y, bw, 2);
      if (hash(i * 9.3 + li) > .55) {   // 楼顶小结构
        const tw = bw * (.2 + hash(i) * .2);
        g.fillStyle = cf.col; g.fillRect(x + bw * .34, y - 34 - hash(i) * 70, tw, 90);
        g.fillStyle = rgba(cf.edge, .5); g.fillRect(x + bw * .34, y - 34 - hash(i) * 70, tw, 2);
      }
      // 窗：不做点阵，做"楼层光带 + 成组亮块"——点阵会整片读成格子布
      const bandN = 2 + Math.floor(hash(i * 8.3 + li * 3) * 5);
      for (let k = 0; k < bandN; k++) {
        const by2 = y + 40 + hash(i * 2.9 + k * 7.7 + li) * (bh - 90);
        const bwd = bw * (.34 + hash(i * 5.1 + k * 3.3) * .56);
        const bx2 = x + (bw - bwd) * hash(i * 1.7 + k * 9.1);
        const bh2 = 9 + li * 2;
        const warm = hash(i + k * 4.4 + li) > .4;
        const cc = warm ? '#F0AE4E' : '#B9D8EE';
        // 一条光带，再切成几段（有人睡有人没睡）
        const seg = 2 + Math.floor(hash(i * 3.1 + k) * 4);
        for (let q = 0; q < seg; q++) {
          if (hash(i * 11.3 + k * 5.7 + q * 2.3) < (1 - cf.lit)) continue;
          const sx2 = bx2 + (bwd / seg) * q + 3, sw2 = bwd / seg - 6;
          if (sw2 < 4) continue;
          g.fillStyle = rgba(cc, .82); g.fillRect(sx2, by2, sw2, bh2);
          e.fillStyle = rgba(cc, .78); e.fillRect(sx2, by2, sw2, bh2);
        }
      }
      // 少数散窗（只在近处那层，给一点随机感）
      if (li === 2) {
        for (let k = 0; k < 10; k++) {
          if (hash(i * 7.7 + k * 3.1) < .55) continue;
          const wx = x + 14 + hash(i * 2.3 + k * 5.9) * (bw - 28);
          const wy = y + 30 + hash(i * 4.9 + k * 1.7) * (bh - 60);
          const warm = hash(wx + wy) > .45;
          const cc = warm ? '#F5BE63' : '#CFE6F6';
          g.fillStyle = rgba(cc, .9); g.fillRect(wx, wy, 9, 12);
          e.fillStyle = rgba(cc, .85); e.fillRect(wx, wy, 9, 12);
        }
      }
      // 霓虹招牌：竖牌，靠楼顶
      if (cf.neon && hash(i * 4.7 + li * 2) > .8) {
        const sx = x + 18 + hash(i) * Math.max(0, bw - 90), sy = y + 50 + hash(i * 2.3) * 120;
        const col = hash(i * 1.9) > .5 ? '#FF4E8A' : '#37D6E0';
        const hgt = 90 + hash(i * 6.1) * 80;
        g.fillStyle = rgba('#07080E', .92); g.fillRect(sx - 9, sy - 9, 56, hgt + 18);
        g.strokeStyle = rgba(col, .55); g.lineWidth = 2.4; g.strokeRect(sx - 9, sy - 9, 56, hgt + 18);
        g.fillStyle = rgba(col, .62);
        for (let k = 0; k < 3; k++) g.fillRect(sx + 3, sy + 7 + k * (hgt / 3), 32, hgt / 3 - 16);
        e.fillStyle = rgba(col, .5);
        for (let k = 0; k < 3; k++) e.fillRect(sx + 3, sy + 7 + k * (hgt / 3), 32, hgt / 3 - 16);
        e.strokeStyle = rgba(col, .55); e.lineWidth = 2.4; e.strokeRect(sx - 9, sy - 9, 56, hgt + 18);
      }
      x += bw + 30 + hash(i * 2.1) * 120;
    }
    plates.push({ c, e: ec, w: wMax, h: 1000 });
  });
  return plates;
}

// 湿地面：倒影 = 翻转 + 拉丝 + 波纹带
export function drawWetStreet(g, e, S, plates, off = 0) {
  const E = S.env;
  g.save();
  vgrad(g, 0, 700, 1920, 380, [[0, mix(E.floorLo, '#000', .3)], [1, mix(E.floor, '#000', .5)]]);
  g.globalAlpha = .38;
  const near = plates[2];
  g.save(); g.translate(0, 700); g.scale(1, -1.35); g.filter = 'blur(2px)';
  g.drawImage(near.c, -off * 1.0 % near.w, -320, near.w, 1000);
  g.restore();
  g.globalAlpha = 1;
  g.fillStyle = rgba(E.cyan || '#37D6E0', .12); g.fillRect(0, 700, 1920, 380);
  g.fillStyle = rgba('#000', .35);
  for (let i = 0; i < 7; i++) g.fillRect(0, 720 + i * 52, 1920, 6 + i * 2);
  g.restore();
}

export { rrPath };
