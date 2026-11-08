// scenes4.js — 覆盖：黑白照片路 / 折纸船
'use strict';

// 黑白回忆之路：地上的照片有透视、有撕裂
PLACE.photosRoad = function (c, t, o) {
  o = o || {};
  R(c, 0, 0, 480, 270, '#0A0A0C');
  // 远处雾
  c.save(); c.globalAlpha = .08;
  for (let i = 0; i < 3; i++) dith(c, 0, 40 + i * 18, 480, 8, '#9A9A9A', .5);
  c.restore();
  // 地面（从远到近，一格一格放大）
  const rows = 9;
  for (let r = rows - 1; r >= 0; r--) {
    const k = r / (rows - 1);              // 0 远 1 近
    const y = 132 + Math.pow(k, 1.5) * 130;
    const hh = 6 + k * 26;
    const n = Math.round(9 - k * 4);
    const w = 480 / n;
    for (let i = 0; i < n; i++) {
      const x = i * w + (r % 2 ? w * .5 : 0) - w * .5;
      const broken = o.broken && hash(i * 7.3 + r * 3.1) > .72;
      if (broken) {
        for (let b = 0; b < 5; b++) {
          R(c, x + hash(b * 3 + i + r) * w, y + hash(b * 7 + i) * hh * .6, 2 + k * 2, 2 + k * 2, '#3A3A3A');
        }
        continue;
      }
      // 照片边框 + 画面
      R(c, x + 1, y, w - 2, hh, '#D6D6D6');
      R(c, x + 2 + k, y + 1 + k, w - 4 - k * 2, hh - 2 - k * 2, '#6E6E6E');
      if (hh > 10) {
        // 照片里的两个小人
        const cw = w - 6, chh = hh - 3;
        R(c, x + w * .32, y + chh * .25, 3 + k * 2, chh * .45, '#2E2E2E');
        R(c, x + w * .52, y + chh * .25, 3 + k * 2, chh * .45, '#3A3A3A');
        R(c, x + w * .32, y + chh * .12, 4 + k * 2, chh * .2, '#2E2E2E');
        R(c, x + w * .52, y + chh * .12, 4 + k * 2, chh * .2, '#3A3A3A');
      }
      // 照片投影
      c.save(); c.globalAlpha = .3; R(c, x + 2, y + hh, w - 2, 2 + k * 2, '#000'); c.restore();
    }
  }
  if (o.actors) o.actors(c);
};

// 折纸船：手 + 半折的纸 + 金光
SC.fold = function (c, t, o) {
  sky(c, ['#2A1A3A', '#5A2A48', '#A04650', '#E07848'], t, { h: 150 });
  sea(c, 150, t, { cols: ['#3A2A46', '#4A3452', '#5A3E60'], amp: 2 });
  // 旧船（远处）
  bigBoat(c, 112, 158, 150, { lights: true, col: '#E8D4D8', shade: '#C0A4B8', line: '#9C88A0' });
  // 近景：一双手捧着一张纸
  const k = clamp(t / 3.2, 0, 1);
  const cx = 300, cy = 208;
  // 纸（从平展到折起）
  const pw = 150 - k * 30, ph = 54 + k * 26;
  const lift = k * 16;
  poly(c, [[cx - pw / 2, cy - lift], [cx + pw / 2, cy - 6 - lift], [cx + pw / 2 - 6, cy + ph - lift], [cx - pw / 2 + 6, cy + ph - 4 - lift]], '#F4EEDC');
  poly(c, [[cx - pw / 2, cy - lift], [cx, cy + 6 - lift], [cx + pw / 2, cy - 6 - lift], [cx + pw / 2, cy - 2 - lift], [cx, cy + 10 - lift], [cx - pw / 2, cy + 4 - lift]], '#FFFDF6');
  // 折痕
  pline(c, cx - pw / 2, cy - lift, cx, cy + 6 - lift, 1, '#C8BFA8');
  pline(c, cx, cy + 6 - lift, cx + pw / 2, cy - 6 - lift, 1, '#C8BFA8');
  pline(c, cx - 10, cy - 2 - lift, cx - 10, cy + ph - 6 - lift, 1, '#DCD3BE');
  // 纸边抬起（折起来的角）
  if (k > .3) {
    const tip = (k - .3) / .7;
    poly(c, [[cx - 6, cy + 2 - lift], [cx - 6 + 30 * tip, cy - 26 * tip - lift], [cx + 24 * tip, cy + 6 - lift]], '#FFFDF6');
    pline(c, cx - 6, cy + 2 - lift, cx - 6 + 30 * tip, cy - 26 * tip - lift, 1, '#C8BFA8');
  }
  // 两只手
  R(c, cx - pw / 2 - 34, cy + 12 - lift, 40, 20, '#E9B58C');
  R(c, cx + pw / 2 - 4, cy + 10 - lift, 40, 20, '#F4C9A8');
  for (let i = 0; i < 4; i++) {
    R(c, cx - pw / 2 - 8 + i * 8, cy + 4 - lift, 6, 14, '#E9B58C');
    R(c, cx + pw / 2 - 12 + i * 8, cy + 2 - lift, 6, 14, '#F4C9A8');
  }
  // 金光从折缝爆出
  for (let i = 0; i < 26; i++) {
    const a = -2.6 + hash(i * 3.1) * 1.6, r = k * (30 + hash(i * 5.7) * 90);
    c.save(); c.globalAlpha = .85 * k;
    R(c, cx + Math.cos(a) * r, cy + Math.sin(a) * r * .8 - lift, 2 + hash(i) * 3, 2 + hash(i) * 3, '#FFD166'); c.restore();
  }
  if (k > .1) glow(c, cx, cy - lift, 40 + k * 60, '#FFD166', .5 * k);
  // 最后：新船成形
  if (k > .85) {
    c.save(); c.globalAlpha = (k - .85) / .15;
    boat(c, cx, cy - 10, 30, { col: '#F7F2E4', shade: '#E0D4BC', line: '#B5AC98', glow: .5 });
    c.restore();
  }
  // 岸边
  R(c, 0, 244, 480, 26, '#2A2030');
};

// 覆盖：黑白回忆（胡同 + 落下的照片），整镜去色
SC.photos = function (c, t, o) {
  PLACE.alley(c, t, {
    warm: false, rain: false, sign: '流浪书咖', lamp: true,
    actors: cc => {
      GUY(cc, 246, 218, { pose: 'walk', ph: (t * 1.1) % 1, eyes: 'sad', mouth: 'flat', view: 'back' });
    }
  });
  // 飘落的拍立得
  for (let i = 0; i < 9; i++) {
    const ph = 22 + hash(i * 3.1) * 10, pw = ph * .8;
    const yy = ((hash(i * 7.7) * 300 + t * (14 + hash(i) * 10)) % 300) - 20;
    const xx = (hash(i * 5.3) * 480 + Math.sin(t * .8 + i) * 18) % 520 - 20;
    c.save(); c.globalAlpha = .9;
    R(c, xx, yy, pw, ph, '#D6D6D6');
    R(c, xx + 2, yy + 2, pw - 4, ph * .66, '#5A5A5A');
    R(c, xx + pw * .3, yy + ph * .2, 4, 8, '#2E2E2E');
    R(c, xx + pw * .55, yy + ph * .2, 4, 8, '#3A3A3A');
    c.restore();
  }
  // 去色
  const img = c.getImageData(0, 0, 480, 270), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11;
    d[i] = d[i + 1] = d[i + 2] = g;
  }
  c.putImageData(img, 0, 0);
};

// 覆盖：拾起照片（照片里是她，粉色从边缘渗出）
SC.pickup = function (c, t, o) {
  R(c, 0, 0, 480, 270, '#101010');
  PLACE.photosRoad(c, t, { broken: true });
  // 照片
  const pw = 210, ph = 150, px = 135, py = 56;
  R(c, px - 8, py - 8, pw + 16, ph + 16, '#E2E2E2');
  R(c, px, py, pw, ph, '#8A8A8A');
  // 照片里的她（大笑）
  CH.portrait(c, px + pw / 2, py + 62, 3, 'f', { eyes: 'happy', mouth: 'smile', blush: 1, dir: -1 });
  // 照片里的背景：教室窗光
  c.save(); c.globalAlpha = .3;
  R(c, px + 6, py + 6, pw - 12, 12, '#FFFFFF');
  c.restore();
  // 去色
  c.save();
  c.globalCompositeOperation = 'saturation';
  c.fillStyle = '#808080';
  c.fillRect(0, 0, 480, 270);
  c.restore();
  // 粉色从边缘渗入
  const k = clamp(t / 3.2, 0, 1);
  c.save(); c.globalAlpha = k;
  for (let i = 0; i < 5; i++) {
    const d = 3 + i * 4;
    dith(c, px - d, py - d, pw + d * 2, d, '#F58BA6', .8 - i * .12);
    dith(c, px - d, py + ph, pw + d * 2, d, '#F58BA6', .8 - i * .12);
    dith(c, px - d, py - d, d, ph + d * 2, '#F58BA6', .8 - i * .12);
    dith(c, px + pw, py - d, d, ph + d * 2, '#F58BA6', .8 - i * .12);
  }
  c.restore();
  // 手伸进来
  R(c, 210, 210, 66, 16, '#C98A66'); R(c, 210, 226, 66, 10, '#8A5A44');
  R(c, 270, 202, 16, 14, '#E9B58C');
  for (let i = 0; i < 3; i++) R(c, 272 + i * 5, 194, 4, 12, '#E9B58C');
  // 一点颜色回到指尖
  c.save(); c.globalAlpha = k * .5;
  dith(c, 268, 194, 22, 20, '#F58BA6', .6);
  c.restore();
};

// 覆盖：仰面漂浮（俯视，用 rig 转 90°）
SC.floating = function (c, t, o) {
  sky(c, ['#3A4254', '#4E5668', '#6A7284', '#8A90A0'], t, { h: 140 });
  // 远处海雾
  c.save(); c.globalAlpha = .25;
  for (let i = 0; i < 4; i++) dith(c, 0, 128 + i * 5, 480, 5, '#A8B0BE', .5);
  c.restore();
  sea(c, 140, t, { cols: ['#2A3A52', '#2E4058', '#324460', '#3A4E6C'], amp: 1.2 });
  c.save(); c.globalAlpha = .2;
  for (let i = 0; i < 26; i++) {
    const x = hash(i * 3.1) * 480, y = 148 + hash(i * 7.7) * 116;
    R(c, x, y, 16 + hash(i) * 30, 1, i % 3 ? '#8FA8C8' : '#CFE3F5');
  }
  c.restore();
  // 涟漪
  for (let i = 0; i < 7; i++) {
    const ph = (t * .7 + i * .37) % 1;
    const x = hash(i * 5.1) * 480, y = 154 + hash(i * 9.3) * 100;
    c.save(); c.globalAlpha = .28 * (1 - ph);
    ring(c, x, y, 4 + ph * 20, '#CFE3F5'); c.restore();
  }
  // 漂浮的人：站立 rig 旋转 90°
  const bob = Math.sin(t * 1.05) * 2;
  c.save();
  c.translate(240, 200 + bob);
  c.rotate(-1.46 + Math.sin(t * .4) * .03);
  CH.draw(c, 'm', 0, 36, { h: 70, pose: 'stand', eyes: 'closed', mouth: 'flat', aL: 75, aR: 75, tint: '#22344E', tintA: .18 });
  c.restore();
  // 水光
  c.save(); c.globalAlpha = .16;
  for (let x = 0; x < 480; x += 3) R(c, x, 196 + Math.sin(x * .04 + t) * 2, 3, 74, '#22344E');
  c.restore();
  rain(c, t, { n: 110, a: .28 });
  const dy = ((t * 46) % 50);
  c.save(); c.globalAlpha = .8; R(c, 246, 138 + dy, 1, 4, '#CFE3F5'); c.restore();
};
