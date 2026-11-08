// fx.js — v2 动效补充：冲击波 / 烟花 / 彩带 / 纸船升空 / 表情气泡 / 放射线 / 雪
'use strict';
W.FX = {
  // 金色冲击波：双环扩散 + 抖动方块（t0 = 触发时刻，绝对镜内秒）
  shockwave(c, t, t0, x, y, col) {
    if (t < t0) return;
    const k = (t - t0) / 1.1;
    if (k >= 1) return;
    const r = 8 + k * 200, a = 1 - k;
    c.save(); c.globalAlpha = a * .9;
    ring(c, x, y, Math.round(r), col || '#FFD166');
    if (k < .6) ring(c, x, y, Math.round(r * .7), '#FFF6E2');
    c.restore();
    for (let i = 0; i < 14; i++) {
      const aa = hash(i * 3.1 + 7) * 6.28, rr = r * (.8 + hash(i) * .3);
      c.save(); c.globalAlpha = a * .8;
      R(c, x + Math.cos(aa) * rr, y + Math.sin(aa) * rr * .6, 3, 3, col || '#FFD166');
      c.restore();
    }
  },

  // 烟花：seed 决定位置/颜色，t0 起爆，1.4s 生命
  firework(c, t, seed, x, y, col) {
    const tt = t - seed * 1.7;
    const life = 1.4;
    if (tt < 0 || tt > life) return;
    const k = tt / life;
    c.save();
    for (let i = 0; i < 26; i++) {
      const a = hash(i * 3.1 + seed * 17) * 6.28;
      const sp = 40 + hash(i * 5.7 + seed) * 60;
      const r = sp * (1 - Math.pow(1 - k, 2)) + 6;
      const gx = x + Math.cos(a) * r, gy = y + Math.sin(a) * r + k * 22;
      c.globalAlpha = (1 - k) * (.5 + .5 * hash(i));
      const cc = i % 3 === 0 ? '#FFF6E2' : (col || ['#FF6EC7', '#FFD166', '#39D9E8', '#7B6CFF'][i % 4]);
      R(c, gx, gy, 2 + (i % 2), 2 + (i % 2), cc);
    }
    c.restore();
    if (k < .25) glow(c, x, y, 30 * (1 - k * 4), '#FFF6E2', .8);
  },

  // 彩带（庆祝）：小竖条旋转下落
  confetti(c, t, n) {
    c.save();
    for (let i = 0; i < (n || 30); i++) {
      const sp = 30 + hash(i * 3.3) * 50;
      const x = (hash(i * 7.1) * 520 + Math.sin(t * 1.4 + i) * 14) % 500 - 10;
      const y = (hash(i * 5.3) * 300 + t * sp) % 300 - 10;
      const flip = Math.sin(t * 6 + i * 2) > 0;
      c.globalAlpha = .85;
      R(c, x, y, flip ? 2 : 5, flip ? 5 : 2,
        ['#FF6EC7', '#FFD166', '#39D9E8', '#7FD8C8', '#F58BA6'][i % 5]);
    }
    c.restore();
  },

  // 纸船群升空：从海面/云海升起，带金色像素尾迹
  boatFleet(c, t, n, yBase) {
    for (let i = 0; i < (n || 12); i++) {
      const per = 5 + hash(i * 3.7) * 3;
      const k = ((t * .55 + hash(i * 9.1)) % 1);
      const x = 40 + hash(i * 5.3) * 400 + Math.sin(t * .8 + i * 2) * 8;
      const y = (yBase || 210) - k * (120 + hash(i) * 60);
      c.save(); c.globalAlpha = clamp(k * 3, 0, 1) * clamp((1 - k) * 3, 0, 1) * .95;
      boat(c, x, y, 6 + hash(i * 2.1) * 5, { col: '#F4EEDC', tilt: Math.sin(t + i) * .12 });
      for (let j = 0; j < 4; j++) PX(c, x + 1 + (hash(i + j) - .5) * 5, y + 8 + j * 5, '#FFD166');
      c.restore();
    }
  },

  // 表情气泡：anger(井字) / heart / sweat(汗滴) / note / star
  bubble(c, x, y, kind, t) {
    const bob = Math.round(Math.sin(t * 5) * 2);
    y += bob;
    if (kind === 'anger') {
      R(c, x - 9, y - 9, 18, 16, '#F4EEDC'); R(c, x - 7, y - 7, 14, 12, '#FFFFFF');
      R(c, x - 3, y + 7, 5, 3, '#F4EEDC');
      R(c, x - 6, y - 4, 11, 2, '#D9473F'); R(c, x - 6, y + 1, 11, 2, '#D9473F');
      R(c, x - 3, y - 6, 2, 11, '#D9473F'); R(c, x + 1, y - 6, 2, 11, '#D9473F');
    } else if (kind === 'heart') {
      R(c, x - 8, y - 7, 16, 13, '#F4EEDC'); R(c, x - 6, y - 5, 12, 9, '#FFFFFF');
      R(c, x - 2, y + 6, 4, 3, '#F4EEDC');
      heart(c, x, y, 4, '#F58BA6');
      c.save(); c.globalAlpha = .8; glow(c, x, y, 16, '#FF9EC0', .5); c.restore();
    } else if (kind === 'sweat') {
      poly(c, [[x, y - 8], [x + 5, y + 1], [x, y + 6], [x - 5, y + 1]], '#7FD8F0');
      R(c, x - 1, y - 3, 2, 5, '#CFEEF8');
    } else if (kind === 'note') {
      R(c, x, y - 8, 2, 9, '#2A2438'); R(c, x + 2, y - 8, 5, 3, '#2A2438');
      R(c, x - 3, y + 1, 5, 4, '#2A2438');
    } else if (kind === 'star') {
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2 + Math.PI / 4;
        pline(c, x, y, x + Math.cos(a) * 6, y + Math.sin(a) * 6, 2, '#FFD166');
      }
      PX(c, x, y, '#FFF6E2');
    }
  },

  // 放射集中线（急推用）
  radial(c, t, x, y, n, col) {
    c.save();
    for (let i = 0; i < (n || 26); i++) {
      const a = hash(i * 3.1) * 6.28 + t * .2;
      const r0 = 60 + hash(i * 5.7) * 60, r1 = r0 + 60 + Math.sin(t * 9 + i) * 14;
      c.globalAlpha = .12 + .16 * hash(i * 2.3);
      pline(c, x + Math.cos(a) * r0, y + Math.sin(a) * r0 * .62,
        x + Math.cos(a) * r1, y + Math.sin(a) * r1 * .62, 2, col || '#EDE6FF');
    }
    c.restore();
  },

  // 像素雪
  snow(c, t, n) {
    c.save();
    for (let i = 0; i < (n || 40); i++) {
      const x = (hash(i * 3.1) * 500 + Math.sin(t * .6 + i * 1.7) * 22) % 490 - 5;
      const y = (hash(i * 7.7) * 290 + t * (14 + hash(i) * 16)) % 290 - 5;
      c.globalAlpha = .5 + .4 * hash(i * 2.1);
      R(c, x, y, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1, '#F4F6FA');
    }
    c.restore();
  },

  // 白闪星（眨眼星光）
  twinkles(c, t, n, y0, y1, col) {
    c.save();
    for (let i = 0; i < (n || 10); i++) {
      const x = hash(i * 3.1) * 480, y = y0 + hash(i * 7.7) * (y1 - y0);
      const k = Math.max(0, Math.sin(t * 2.4 + i * 2.3));
      if (k < .25) continue;
      c.globalAlpha = k;
      const s = k > .7 ? 2 : 1;
      R(c, x - s, y, s * 2 + 1, 1, col || '#FFF6E2');
      R(c, x, y - s, 1, s * 2 + 1, col || '#FFF6E2');
    }
    c.restore();
  },
};
