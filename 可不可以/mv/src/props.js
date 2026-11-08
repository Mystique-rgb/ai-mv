// props.js — 天空 / 天气 / 海 / 光 / 道具 图元库（480×270）
'use strict';

// ---------------- 取景助手 ----------------
W.CAM = {
  push: (cx, cy, z0, z1, dur, drift) => lt => {
    const k = easeOut(clamp(lt / (dur || 1), 0, 1));
    return rectOf(lerp(z0, z1, k), cx + (drift || 0) * k, cy);
  },
  pan: (x0, x1, y, z, dur) => lt => {
    const k = easeOut(clamp(lt / (dur || 1), 0, 1));
    return rectOf(z, lerp(x0, x1, k), y);
  },
  shake: (fn, amp, freq, seed) => lt => {
    const r = fn(lt);
    const s = Math.sin(lt * (freq || 26) + (seed || 0)), s2 = Math.sin(lt * (freq || 22) * 1.7 + 1.3);
    return [r[0] + s * amp * .5, r[1] + s2 * amp * .4, r[2] - amp, r[3] - amp * .6];
  },
  fixed: (x, y, w, h) => () => {
    w = Math.min(w, 480); h = Math.min(h, 270);
    return [clamp(x, 0, 480 - w), clamp(y, 0, 270 - h), w, h];
  },
};

// ---------------- 光 ----------------
function glow(c, cx, cy, r, col, amt) {
  amt = amt == null ? 1 : amt;
  c.save();
  for (let k = 0; k < 5; k++) {
    c.globalAlpha = amt * .085 * (1 - k * .12);
    circle(c, cx, cy, r * (1 - k * .18), col);
  }
  // 外缘抖动
  c.globalAlpha = amt * .12;
  const n = 26;
  for (let i = 0; i < n; i++) {
    const a = i / n * 6.283, rr = r * (.92 + hash(i * 3.1) * .22);
    PX(c, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .8, col);
  }
  c.restore();
}
function haloTight(c, cx, cy, r, col, amt) {
  c.save(); c.globalAlpha = amt == null ? .5 : amt;
  dith(c, cx - r, cy - r * .7, r * 2, r * 1.4, col, .85);
  c.restore();
}
function beam(c, x, y, w, h, col, a) {
  c.save(); c.globalAlpha = a == null ? .12 : a;
  for (let i = 0; i < h; i++) {
    const ww = w * (i / h);
    dith(c, x - ww / 2, y + i, ww, 1, col, .55);
  }
  c.restore();
}
function shadowEll(c, x, y, w, h, col) {
  c.save(); c.globalAlpha = .5;
  for (let j = -h; j <= h; j++) {
    const k = Math.floor(w * Math.sqrt(Math.max(0, 1 - (j / h) * (j / h))));
    dith(c, x - k, y + j, k * 2, 1, col || '#05040A', .8);
  }
  c.restore();
}

// ---------------- 天空 ----------------
const SKY = {
  night: ['#070A18', '#0C1228', '#121A38', '#1A2448', '#233058'],
  storm: ['#0A1020', '#121A2E', '#1A2440', '#26324E', '#33415E'],
  dawn: ['#1B2140', '#3A3460', '#6B5478', '#B07A82', '#E8A48C'],
  day: ['#4A7BB8', '#5E8FC8', '#7FA8D4', '#A6C4E0', '#C8DCEA'],
  dusk: ['#241838', '#452848', '#7A3A50', '#B85A50', '#E89060'],
  sunset: ['#2A1A3A', '#5A2A48', '#A04650', '#E07848', '#FFB45E'],
  gold: ['#3A2A3A', '#6E4442', '#B8704A', '#E8A050', '#FFD08A'],
};
function sky(c, cols, t, opt) {
  opt = opt || {};
  const h = opt.h || 270;
  vgrad(c, 0, 0, 480, h, cols, h / cols.length);
  // 抖动带
  for (let i = 1; i < cols.length; i++) dith(c, 0, h * i / cols.length - 6, 480, 12, cols[i], .4);
}
function stars(c, t, n, ymax) {
  for (let i = 0; i < n; i++) {
    const x = Math.floor(hash(i * 12.1) * 480), y = Math.floor(hash(i * 7.3) * (ymax || 150));
    const tw = .35 + .65 * Math.abs(Math.sin(t * (.7 + hash(i) * 1.6) + i));
    c.save(); c.globalAlpha = tw * .9;
    PX(c, x, y, '#FFF6DC');
    if (hash(i * 3.7) > .86) { PX(c, x + 1, y, '#C8D8FF'); }
    c.restore();
  }
}
function cloudPuff(c, x, y, w, h, col, col2) {
  // 像素云：几层圆弧堆叠
  const n = Math.max(3, Math.round(w / 14));
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    const cx = x + w * k, cy = y - Math.sin(k * Math.PI) * h * .55;
    const rr = h * (.55 + .45 * Math.sin(k * Math.PI));
    circle(c, cx, cy, rr, col);
  }
  R(c, x - 2, y, w + 4, h * .35, col);
  if (col2) dith(c, x - 2, y + h * .18, w + 4, h * .2, col2, .6);
}
function clouds(c, t, y, col, col2, n, spd) {
  for (let i = 0; i < (n || 3); i++) {
    const w = 90 + hash(i * 3.1) * 110;
    const x = ((hash(i * 5.7) * 600 - 100 + t * (spd || 4)) % 700) - 110;
    cloudPuff(c, x, y + hash(i * 2.3) * 26, w, 16 + hash(i) * 8, col, col2);
  }
}
function sun(c, x, y, r, col, halo) {
  glow(c, x, y, r * 3.4, halo || col, .55);
  circle(c, x, y, r, col);
  circle(c, x - 1, y - 1, r * .6, '#FFF6DC');
}
function moon(c, x, y, r, col) {
  glow(c, x, y, r * 3.2, '#9CC0E8', .45);
  circle(c, x, y, r, col || '#F2EAD8');
  circle(c, x + r * .35, y - r * .2, r * .8, '#E4DCC8');
  PX(c, x - r * .3, y + r * .2, '#D8CEB8');
}
function cityline(c, y, opt) {
  opt = opt || {};
  const col = opt.col || '#0A0E1C', win = opt.win || '#FFD166';
  const seed = opt.seed || 1, lit = opt.lit == null ? .35 : opt.lit;
  let x = -20;
  let i = 0;
  while (x < 500) {
    const w = 26 + hash(seed * 7 + i * 3.3) * 44;
    const h = 26 + hash(seed * 11 + i * 5.1) * (opt.hmax || 90);
    R(c, x, y - h, w, h + 30, col);
    // 窗户
    for (let wy = y - h + 5; wy < y - 4; wy += 7) for (let wx = x + 4; wx < x + w - 4; wx += 6) {
      if (hash(wx * 3 + wy * 7 + seed) < lit) {
        c.save(); c.globalAlpha = .75 + .25 * hash(wx + wy);
        R(c, wx, wy, 2, 3, hash(wx * wy) > .8 ? '#CFE3F5' : win);
        c.restore();
      }
    }
    if (hash(i * 9.1) > .8) { // 天台水塔
      R(c, x + w * .3, y - h - 8, 8, 8, col); R(c, x + w * .3 + 1, y - h - 10, 6, 2, col);
    }
    if (hash(i * 4.3) > .86) { // 天线
      R(c, x + w * .6, y - h - 14, 1, 14, col); PX(c, x + w * .6, y - h - 16, '#D9473F');
    }
    x += w + 2 + hash(i * 2.7) * 8; i++;
  }
}

// ---------------- 天气 ----------------
function rain(c, t, opt) {
  opt = opt || {};
  const n = opt.n || 150, wind = opt.wind || -.35, spd = opt.spd || 620, col = opt.col || '#9CC0E8';
  c.save(); c.globalAlpha = opt.a == null ? .55 : opt.a;
  for (let i = 0; i < n; i++) {
    const sp = spd * (.6 + hash(i * 3.1) * .8);
    const yy = ((hash(i * 7.7) * 300 + t * sp) % 300) - 20;
    const xx = ((hash(i * 5.3) * 520 + yy * wind + t * 40) % 520) - 20;
    const len = opt.len || (3 + Math.floor(hash(i * 2.2) * 4));
    pline(c, xx, yy, xx + wind * len, yy + len, 1, col);
  }
  c.restore();
}
function nearRain(c, t, n, col, a) {
  c.save(); c.globalAlpha = a || .5;
  for (let i = 0; i < (n || 18); i++) {
    const sp = 900 + hash(i) * 500;
    const yy = ((hash(i * 3.3) * 300 + t * sp) % 320) - 30;
    const xx = ((hash(i * 9.1) * 520 + t * 20) % 520) - 20;
    pline(c, xx, yy, xx - 2, yy + 12, 1, col || '#CFE3F5');
  }
  c.restore();
}
function snow(c, t, n, col) {
  c.save(); c.globalAlpha = .85;
  for (let i = 0; i < (n || 80); i++) {
    const sp = 18 + hash(i) * 26;
    const yy = ((hash(i * 7.7) * 300 + t * sp) % 300) - 10;
    const xx = (hash(i * 5.3) * 500 + Math.sin(t * .6 + i) * 9) % 500;
    PX(c, xx, yy, col || '#FFFFFF');
    if (hash(i * 2.1) > .8) PX(c, xx + 1, yy, '#DCE8F8');
  }
  c.restore();
}
function petals(c, t, n, col, col2) {
  c.save();
  for (let i = 0; i < (n || 24); i++) {
    const yy = ((hash(i * 3.9) * 300 + t * (16 + hash(i) * 18)) % 310) - 12;
    const xx = (hash(i * 8.1) * 520 + Math.sin(t * .8 + i * 1.7) * 22 + t * 12) % 520 - 20;
    c.globalAlpha = .85;
    R(c, xx, yy, 2, 2, col || '#F7B9C4');
    PX(c, xx + 1, yy + 1, col2 || '#E983A6');
  }
  c.restore();
}
function leaves(c, t, n, col) {
  for (let i = 0; i < (n || 10); i++) {
    const yy = ((hash(i * 4.1) * 280 + t * (22 + hash(i) * 12)) % 290) - 10;
    const xx = (hash(i * 2.7) * 520 + Math.sin(t * 1.1 + i) * 26) % 520 - 20;
    c.save(); c.globalAlpha = .9; R(c, xx, yy, 3, 2, col || '#B07A4A'); PX(c, xx + 1, yy, '#D9A05C'); c.restore();
  }
}
function fireflies(c, t, n, col) {
  for (let i = 0; i < (n || 26); i++) {
    const xx = 40 + hash(i * 3.3) * 400 + Math.sin(t * .5 + i) * 14;
    const yy = 90 + hash(i * 5.9) * 120 + Math.cos(t * .8 + i * 2) * 10;
    const a = .25 + .75 * Math.abs(Math.sin(t * 1.8 + i));
    c.save(); c.globalAlpha = a * .8; PX(c, xx, yy, col || '#FFE08A');
    c.globalAlpha = a * .25; dith(c, xx - 1, yy - 1, 3, 3, col || '#FFE08A', .8); c.restore();
  }
}
function ash(c, t, n) { c.save(); c.globalAlpha = .5; for (let i = 0; i < (n || 30); i++) { const yy = ((hash(i * 3.1) * 300 + t * 12) % 300); PX(c, (hash(i * 7.3) * 500 + Math.sin(t + i) * 12) % 500, yy, '#8B86B0'); } c.restore(); }

// ---------------- 海 ----------------
function sea(c, y, t, opt) {
  opt = opt || {};
  const cols = opt.cols || ['#0B1E3F', '#122A52', '#1A3763', '#22436F'];
  vgrad(c, 0, y, 480, 270 - y, cols, (270 - y) / cols.length);
  const amp = opt.amp || 3, spd = opt.spd || 1, col = opt.foam || '#9CC0E8';
  for (let l = 0; l < 6; l++) {
    const yy = y + 6 + l * 9;
    c.save(); c.globalAlpha = .18 + l * .05;
    for (let x = 0; x < 480; x += 2) {
      const h = Math.round(Math.sin((x * .06) + t * (1.1 + l * .2) * spd + l) * amp * (.6 + l * .2));
      R(c, x, yy + h, 2, 1, col);
    }
    c.restore();
  }
  // 浪花点
  for (let i = 0; i < 40; i++) {
    const yy = y + 5 + Math.floor(hash(i * 3.7) * (270 - y - 8));
    const xx = (hash(i * 5.1) * 480 + Math.sin(t * .7 + i) * 6) % 480;
    c.save(); c.globalAlpha = .2 + .35 * hash(i);
    PX(c, xx, yy, col); c.restore();
  }
}
function waveCrest(c, x, y, w, h, t, col, col2) {
  // 像素浪头
  const n = Math.round(w / 4);
  for (let i = 0; i < n; i++) {
    const k = i / n;
    const hh = Math.round(h * Math.sin(k * Math.PI) * (1 + .08 * Math.sin(t * 3 + i)));
    R(c, x + i * 4, y - hh, 4, hh, col);
    if (i % 3 === 0) R(c, x + i * 4, y - hh, 4, 2, col2 || '#CFE3F5');
  }
}
function cloudSea(c, y, t, opt) {
  opt = opt || {};
  const base = opt.base || '#2A2A52', hi = opt.hi || '#4A4478', top = opt.top || '#6E5F96';
  R(c, 0, y - 20, 480, 270 - y + 20, base);
  // 三层云团，越靠上越亮
  const L = [[base, y + 26, 12, 0], [hi, y + 12, 11, 1], [top, y - 2, 10, 2]];
  for (let li = 0; li < 3; li++) {
    const [col, yy, n, sp] = L[li];
    for (let i = 0; i < n; i++) {
      const w = 110 + hash(i * 3.1 + li) * 110;
      const x = ((i * 74 + hash(i + li * 7) * 90 + t * (4 + li * 2.4)) % 700) - 110;
      const h = 26 + hash(i * 5 + li) * 12;
      const py = yy + hash(i + li) * 14;
      // 云团：三排圆 + 平底
      for (let k = 0; k < 6; k++) {
        const cx2 = x + w * (k / 5), rr = h * (.45 + .3 * Math.sin(k / 5 * Math.PI));
        circle(c, cx2, py - Math.sin(k / 5 * Math.PI) * h * .35, rr, col);
      }
      R(c, x - 6, py, w + 12, h * .5, col);
      // 顶面高光
      if (li > 0) dith(c, x, py - h * .5, w, h * .28, li === 2 ? '#9A86BC' : '#5E5488', .5);
      // 底部阴影
      dith(c, x, py + h * .2, w, h * .25, base, .5);
    }
  }
}

// ---------------- 纸船 ----------------
// s = 半宽；经典折纸船轮廓（船体 + 分叉船篷）
function boat(c, x, y, s, o) {
  o = o || {};
  const tilt = o.tilt || 0;
  const col = o.col || '#F4EEDC', sh = o.shade || '#D8CFBA', ln = o.line || '#AFA68F';
  const hh = s * .9, pk = s * 1.15;
  c.save();
  c.translate(Math.round(x), Math.round(y));
  if (tilt) c.rotate(tilt);
  // 船篷（两个三角，中间留缝）
  poly(c, [[-s * .66, 0], [0, -pk], [-s * .06, 0]], col);
  poly(c, [[s * .66, 0], [0, -pk], [s * .06, 0]], col);
  poly(c, [[-s * .66, 0], [0, -pk], [-s * .34, 0]], sh);
  // 船体
  poly(c, [[-s, 0], [-s * .94, hh * .2], [-s * .46, hh * .82], [0, hh], [s * .46, hh * .82], [s * .94, hh * .2], [s, 0]], col);
  poly(c, [[-s * .9, hh * .55], [-s * .46, hh * .82], [0, hh], [s * .46, hh * .82], [s * .9, hh * .55], [s * .8, hh * .78], [0, hh * .99], [-s * .8, hh * .78]], sh);
  // 折线
  R(c, -s, 0, s * 2, 1, ln);
  for (let i = -s * .8; i <= s * .8; i += 3) PX(c, i, hh * .55, ln);
  // 船身文字
  if (o.label) {
    const sc = Math.max(1, Math.round(s / 22));
    textC(c, o.label, 0, hh * .1, o.labelCol || '#2A2440', sc);
  }
  c.restore();
  if (o.glow) glow(c, x, y - s * .5, s * 1.4, o.glowCol || '#FFD166', o.glow);
}

// 大纸船（云海/海面），w = 全长
function bigBoat(c, x, y, w, o) {
  o = o || {};
  const s = w / 2, hh = w * .16, pk = (o.pk || 1) * w * .30;
  const col = o.col || '#F4EEDC', sh = o.shade || '#DCD2BC', ln = o.line || '#B8AF9A';
  // 船篷
  poly(c, [[x - s * .68, y], [x, y - pk], [x - s * .07, y]], col);
  poly(c, [[x + s * .68, y], [x, y - pk], [x + s * .07, y]], col);
  poly(c, [[x - s * .68, y], [x, y - pk], [x - s * .40, y]], sh);
  poly(c, [[x + s * .40, y], [x, y - pk], [x + s * .07, y]], sh);
  // 船体
  poly(c, [[x - s, y], [x - s * .95, y + hh * .22], [x - s * .46, y + hh * .84], [x, y + hh], [x + s * .46, y + hh * .84], [x + s * .95, y + hh * .22], [x + s, y]], col);
  poly(c, [[x - s * .9, y + hh * .6], [x - s * .46, y + hh * .84], [x, y + hh], [x + s * .46, y + hh * .84], [x + s * .9, y + hh * .6], [x + s * .78, y + hh * .8], [x, y + hh * .98], [x - s * .78, y + hh * .8]], sh);
  R(c, x - s, y, w, 2, ln);
  // 舷窗 / 窗格
  if (o.windows) {
    const n = o.windows;
    for (let i = 0; i < n; i++) {
      const ww = w * .78 / n, wx = x - w * .39 + i * ww;
      R(c, wx + 6, y + hh * .34, ww - 12, hh * .38, o.winCol || '#1B2444');
      R(c, wx + 6, y + hh * .34, ww - 12, 1, '#FFD166');
    }
  }
  // 船身大字
  if (o.label) {
    const sc = o.labelSc || Math.max(1, Math.round(w / 210));
    const yy = y + hh * .50 - sc * 8;
    if (o.labelGlow) glow(c, x, yy + sc * 8, w * .3, '#FFD166', .5);
    textC(c, o.label, x, yy, o.labelCol || '#2A2440', sc);
  }
  if (o.lights) {
    for (let i = 0; i < 9; i++) {
      const lx = x - s * .84 + i * w * .105, ly = y - 3;
      glow(c, lx, ly, 12, '#FFD166', .45);
      PX(c, lx, ly, '#FFE9B8');
    }
  }
}

// ---------------- 道具 ----------------
function lamp(c, x, y, h, o) {
  o = o || {};
  R(c, x - 1, y - h, 2, h, o.pole || '#1A1A28');
  R(c, x - 1, y - h, 1, h, '#2E2E40');
  R(c, x - 5, y - h - 5, 10, 5, o.head || '#24243A');
  R(c, x - 4, y - h - 2, 8, 2, o.lit || '#FFD166');
  glow(c, x, y - h, o.gr || 26, o.halo || '#FFD166', .9);
  if (o.cone) {
    // 地面光池（抖动圆）
    const ry = 9, rx = 34;
    for (let j = -ry; j <= ry; j++) {
      const kk = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (j / ry) * (j / ry))));
      dith(c, x - kk, y + 4 + j, kk * 2, 1, o.halo || '#FFE0A0', .16);
    }
  }
}
function lantern(c, x, y, s, t, col) {
  col = col || '#E8556D';
  R(c, x - s, y, s * 2, s * 2.2, col);
  R(c, x - s, y, s * 2, 1, '#F58BA6');
  R(c, x - s * .6, y + s * 2.2, s * 1.2, s * .5, '#C8A04A');
  R(c, x - s * .12, y - s * .5, s * .24, s * .5, '#C8A04A');
  R(c, x - s * .3, y + s * 2.7, s * .6, s * .4, '#D9473F');
  c.save(); c.globalAlpha = .55; glow(c, x, y + s, s * 2.2, '#FFB060', .8); c.restore();
  const sw = Math.sin(t * 2 + x * .2) * s * .18;
  pline(c, x, y + s * 2.7 + s * .4, x + sw, y + s * 2.7 + s * 1.2, 1, '#C8A04A');
}
function stringLights(c, x1, x2, y, sag, t, col) {
  col = col || '#FFD166';
  const n = Math.abs(x2 - x1) | 0;
  for (let x = 0; x <= n; x += 12) {
    const k = x / n;
    const yy = y + Math.sin(k * Math.PI) * sag;
    R(c, x1 + x, yy, 1, 1, '#3A3040');
    if ((x / 12) % 2 === 0) {
      glow(c, x1 + x, yy + 4, 9, col, .75);
      PX(c, x1 + x, yy + 4, '#FFF3C8');
      R(c, x1 + x - 1, yy + 3, 2, 3, col);
    }
  }
}
function neon(c, x, y, txt, col, sc) {
  sc = Math.max(1, sc || 1);
  glow(c, x + textW(txt, sc) / 2, y + 8 * sc, textW(txt, sc) * .7, col, .7);
  text(c, txt, x, y, col, sc, '#0A0910');
  text(c, txt, x, y, col, sc);
}
function stall(c, x, y, o) {
  o = o || {};
  const w = o.w || 120, h = o.h || 52;
  // 顶棚条纹
  for (let i = 0; i < w; i += 8) R(c, x + i, y - h, 8, 10, (i / 8) % 2 ? o.awning || '#D9473F' : '#F4EEDC');
  R(c, x, y - h + 10, w, 2, '#8E3A34');
  // 支柱
  R(c, x + 1, y - h + 12, 2, h - 12, '#4E3A32'); R(c, x + w - 3, y - h + 12, 2, h - 12, '#4E3A32');
  // 柜台
  R(c, x, y - 16, w, 16, o.body || '#6E4A38');
  R(c, x, y - 16, w, 2, '#8E6548');
  // 灯泡
  for (let i = 6; i < w - 6; i += 22) { glow(c, x + i, y - h + 13, 8, '#FFD166', .6); PX(c, x + i, y - h + 13, '#FFF0C0'); }
  if (o.steam) {
    for (let i = 0; i < 5; i++) {
      c.save(); c.globalAlpha = .2;
      circle(c, x + 20 + i * 18 + Math.sin(i) * 3, y - 22 - i * 4, 3 + i, '#FFFFFF'); c.restore();
    }
  }
  if (o.sign) neon(c, x + w / 2 - textW(o.sign, 1) / 2, y - h - 20, o.sign, o.signCol || '#FFD166', 1);
}
function tree(c, x, y, s, o) {
  o = o || {};
  const trunk = o.trunk || '#3A2A28', leaf = o.leaf || '#2C4A32', leaf2 = o.leaf2 || '#4A7A4A';
  R(c, x - s * .12, y - s * .8, s * .24, s * .8, trunk);
  R(c, x - s * .32, y - s * .5, s * .22, s * .2, trunk);
  const blobs = [[0, -1, .55], [-.45, -.85, .4], [.45, -.85, .4], [0, -.72, .5], [-.3, -1.15, .3], [.32, -1.15, .3]];
  for (const [bx, by, br] of blobs) { circle(c, x + bx * s, y + by * s, br * s, leaf); }
  for (const [bx, by, br] of blobs) { circle(c, x + bx * s - 1, y + by * s - 2, br * s * .6, leaf2); }
}
function bush(c, x, y, w, h, col, col2) {
  for (let i = 0; i < 5; i++) circle(c, x + (i - 2) * w * .2, y - h * (.4 + .3 * Math.sin(i)), w * .22, col);
  if (col2) for (let i = 0; i < 5; i++) dith(c, x + (i - 2) * w * .2 - w * .1, y - h * .8, w * .2, h * .4, col2, .5);
}
function umbrella(c, x, y, s, col, col2) {
  for (let i = -s; i <= s; i++) {
    const hh = Math.round(Math.sqrt(Math.max(0, s * s - i * i)) * .55);
    R(c, x + i, y - hh, 1, hh + 1, col);
  }
  for (let i = -s; i <= 0; i += 3) R(c, x + i, y - Math.round(Math.sqrt(Math.max(0, s * s - i * i)) * .55), 3, 1, col2 || '#EAF1FF');
  R(c, x, y + 1, 1, s * 1.2, '#4E3A32');
}
function bicycle(c, x, y, s) {
  ring(c, x - s * .5, y - s * .35, s * .35, '#2A2440'); ring(c, x + s * .5, y - s * .35, s * .35, '#2A2440');
  pline(c, x - s * .5, y - s * .35, x, y - s * .7, 1, '#2A2440');
  pline(c, x + s * .5, y - s * .35, x, y - s * .7, 1, '#2A2440');
  pline(c, x, y - s * .7, x + s * .3, y - s * .75, 1, '#2A2440');
  R(c, x - s * .1, y - s * .78, s * .25, 2, '#4E3A32');
}
function photoCard(c, x, y, w, h, o) {
  o = o || {};
  R(c, x, y, w, h, '#F4EEDC');
  R(c, x + 2, y + 2, w - 4, h * .72, o.img || '#4E6A9E');
  if (o.pair) {
    R(c, x + 4, y + h * .15, 5, 7, '#E9B58C'); R(c, x + w - 9, y + h * .15, 5, 7, '#F4C9A8');
  }
  R(c, x + 2, y + h * .8, w - 4, 1, '#D6CDB8');
  if (o.tilt) c.restore;
}
function calendar(c, x, y, w, h, txt, o) {
  o = o || {};
  R(c, x, y, w, h, '#F4EEDC');
  R(c, x, y, w, 5, '#D9473F');
  for (let i = 0; i < 4; i++) { R(c, x + 3 + i * 3, y - 2, 1, 3, '#8E8B80'); }
  textC(c, txt, x + w / 2, y + h * .3, o.col || '#2A2440', 1);
}
function heart(c, x, y, s, col) {
  for (let j = 0; j < s * 2; j++) {
    const ww = Math.round((s - Math.abs(j - s) * .8) * (1 - (j > s ? .3 : 0)));
    if (ww > 0) R(c, x - ww, y + j, ww * 2, 1, col);
  }
}
function bubble(c, x, y, txt, col) {
  const w = textW(txt, 1) + 8;
  R(c, x - w / 2, y - 22, w, 20, '#F4EEDC');
  R(c, x - w / 2, y - 22, w, 1, '#C9C6DD'); R(c, x - w / 2, y - 3, w, 1, '#C9C6DD');
  R(c, x - 2, y - 3, 4, 3, '#F4EEDC');
  text(c, txt, x - w / 2 + 4, y - 18, col || '#2A2440', 1);
}
function impactRing(c, x, y, r, col, a) {
  c.save(); c.globalAlpha = a == null ? .8 : a;
  ring(c, x, y, r, col); ring(c, x, y, r - 2, col); ring(c, x, y, r - 4, col);
  c.restore();
}
function speedLines(c, x, y, n, len, col, a) {
  c.save(); c.globalAlpha = a == null ? .4 : a;
  for (let i = 0; i < n; i++) {
    const yy = y + (hash(i * 3.3) - .5) * 200;
    const xx = x + hash(i * 5.1) * 480;
    R(c, xx, yy, len * (.5 + hash(i)), 1, col || '#FFFFFF');
  }
  c.restore();
}
function dustMotes(c, t, n, y0, y1, col) {
  c.save();
  for (let i = 0; i < (n || 30); i++) {
    const xx = (hash(i * 3.7) * 480 + Math.sin(t * .4 + i) * 6) % 480;
    const yy = y0 + ((hash(i * 5.9) * (y1 - y0) + t * 4) % (y1 - y0));
    c.globalAlpha = .2 + .4 * hash(i * 2.1);
    PX(c, xx, yy, col || '#F4EEDC');
  }
  c.restore();
}
function paperFrags(c, x, y, t, n, col) {
  for (let i = 0; i < (n || 20); i++) {
    const k = hash(i * 3.1), a = hash(i * 7.7) * 6.28;
    const r = 10 + k * 60 + t * 30;
    const xx = x + Math.cos(a) * r, yy = y + Math.sin(a) * r * .7 + t * 20;
    c.save(); c.globalAlpha = Math.max(0, 1 - r / 140);
    R(c, xx, yy, 2 + (i % 3), 2, i % 4 === 0 ? '#FFD166' : col || '#F4EEDC'); c.restore();
  }
}
