// scenes3.js — 覆盖版场景（后加载，覆盖 scenes2 同名实现）
'use strict';

// 地铁站台：追
SC.subway = function (c, t, o) {
  const trainOff = 300 - t * 150;
  PLACE.subway(c, t, {
    train: Math.max(-560, Math.min(300, trainOff)),
    actors: cc => {
      const run = t < 1.9;
      const x = run ? 70 + t * 90 : 246;
      if (run) speedLines(cc, x - 90, 200, 8, 26, '#CFE3F5', .14);
      GUY(cc, x, 236, { pose: run ? 'run' : 'stand', ph: (t * 3.4) % 1, eyes: run ? 'shock' : 'sad', mouth: run ? 'open' : 'flat', lean: run ? 3 : 0, h: 76 });
      if (t < 1.6) {
        const gx = 300 + t * 26;
        GIRL(cc, gx, 214, { view: 'back', pose: 'walk', ph: (t * 2) % 1, h: 66, dir: -1 });
        cc.save(); cc.globalAlpha = .3; R(cc, gx - 14, 148, 28, 66, '#0C0E18'); cc.restore();
      }
    }
  });
  if (t > 1.9) {
    const on = Math.sin(t * 16) > 0;
    c.save(); c.globalAlpha = on ? .9 : .25;
    R(c, 232, 130, 7, 7, '#D9473F'); R(c, 330, 130, 7, 7, '#D9473F');
    c.restore();
  }
};

// 玻璃倒影
SC.glass = function (c, t, o) {
  PLACE.subway(c, t, {
    train: null,
    actors: cc => {
      const k = clamp(t / 1.2, 0, 1);
      GUY(cc, 210, 236 - k * 8, { pose: k > .45 ? 'sit' : 'crouch', eyes: 'sad', mouth: 'flat', h: 76 - k * 10 });
    }
  });
  c.save();
  c.globalAlpha = .2; R(c, 0, 40, 480, 190, '#8FD8F0');
  c.globalAlpha = .45;
  for (let i = 0; i < 4; i++) R(c, 120 + i * 60, 40, 2, 190, '#A8D8E8');
  R(c, 0, 40, 480, 2, '#A8D8E8');
  c.restore();
  c.save(); c.globalAlpha = .2 + .08 * Math.sin(t * 1.2);
  const kk = Math.floor(t * 1.6) % 3;
  if (kk === 0) GIRL(c, 306, 204, { h: 88, eyes: 'happy', mouth: 'smile', blush: 1, tint: '#8FD8F0', tintA: .5 });
  if (kk === 1) { boat(c, 322, 174, 15, { col: '#CFE3F5' }); GIRL(c, 306, 210, { h: 78, eyes: 'happy', mouth: 'smile', tint: '#8FD8F0', tintA: .5 }); }
  if (kk === 2) { heart(c, 318, 156, 8, '#7FD8C8'); GIRL(c, 306, 208, { h: 82, eyes: 'closed', mouth: 'smile', tint: '#8FD8F0', tintA: .5 }); }
  c.restore();
};

// 石桥奔跑
SC.stonebridge = function (c, t, o) {
  PLACE.bridge(c, t, {
    actors: cc => {
      const x = 84 + t * 62;
      GUY(cc, Math.min(x, 290), 232, { pose: 'run', ph: (t * 3) % 1, eyes: 'open', mouth: 'open', lean: 3, aL: 50, aR: -30 });
      UM(cc, 404, 152, 44);
      GIRL(cc, 404, 232, { view: 'back', h: 68, dir: -1 });
    }
  });
  rain(c, t, { n: 90, a: .25 });
};

// 回头（大特写）
SC.turn = function (c, t, o) {
  R(c, 0, 0, 480, 270, '#141830');
  PLACE.bridge(c, t, { rain: false });
  c.save(); c.globalAlpha = .55; R(c, 0, 0, 480, 270, '#0A0C18'); c.restore();
  const k = clamp(t / .8, 0, 1);
  CH.portrait(c, 240, 126, 5, 'f', { eyes: k > .65 ? 'shock' : 'open', mouth: k > .65 ? 'open' : 'flat', blush: k > .65 ? 1 : 0, dir: -1, rimCol: '#FFD8A8' });
  for (let i = 0; i < 18; i++) {
    const a = -2.5 + i * .14, r = 50 + hash(i * 3.1) * 110 * k;
    c.save(); c.globalAlpha = .7 * k;
    R(c, 240 + Math.cos(a) * r, 108 + Math.sin(a) * r, 2, 3, '#CFE3F5'); c.restore();
  }
  rain(c, t, { n: 80, a: .22 });
};

// 递纸船
SC.offer = function (c, t, o) {
  PLACE.bridge(c, t, {
    rain: false,
    actors: cc => {
      GUY(cc, 204, 232, { eyes: 'open', mouth: 'open', lean: 4, h: 78 });
      GIRL(cc, 288, 232, { eyes: 'shock', mouth: 'open', h: 72, dir: -1 });
      boat(cc, 246, 198, 18, { col: '#F4EEDC', glow: .7, glowCol: '#FFD166' });
      R(cc, 224, 196, 14, 4, '#E9B58C'); R(cc, 258, 196, 14, 4, '#F4C9A8');
    }
  });
  rain(c, t, { n: 40, a: .16 });
};

// 我回来了
SC.giftBoat = function (c, t, o) {
  R(c, 0, 0, 480, 270, '#0C1020');
  for (let i = 0; i < 30; i++) {
    c.save(); c.globalAlpha = .08 + .06 * Math.sin(t + i);
    circle(c, hash(i * 3.1) * 480, hash(i * 7.7) * 270, 4 + hash(i) * 10, '#FFD166'); c.restore();
  }
  glow(c, 240, 176, 110, '#FFB060', .3);
  boat(c, 240, 178, 40, { col: '#F7F2E4', shade: '#E0D4BC', line: '#B5AC98' });
  if (t > .4) {
    const n = Math.min(4, Math.floor((t - .4) * 3.6) + 1);
    textC(c, '我回来了'.slice(0, n), 240, 186, '#E8A23A', 1, '#3A2418');
  }
  // 金色粒子
  for (let i = 0; i < 18; i++) {
    const a = hash(i * 3.3) * 6.28, r = 40 + hash(i * 5.1) * 60;
    c.save(); c.globalAlpha = .4 + .4 * Math.sin(t * 2 + i);
    PX(c, 240 + Math.cos(a) * r, 176 + Math.sin(a) * r * .6, '#FFE9B8'); c.restore();
  }
};
SC.hug = function (c, t, o) {
  const cleared = clamp((t - 1.0) / 2.5, 0, 1);
  PLACE.bridge(c, t, {
    rain: false,
    actors: cc => {
      GUY(cc, 224, 232, { eyes: 'closed', mouth: 'smile', aL: 70, aR: 70, h: 80 });
      GIRL(cc, 258, 232, { eyes: 'closed', mouth: 'smile', blush: 1, aL: 70, aR: 70, h: 74, dir: -1 });
      R(cc, 234, 186, 20, 4, '#F4C9A8'); R(cc, 230, 194, 22, 4, '#E9B58C');
      boat(cc, 274, 210, 9, { col: '#F4EEDC' });
    }
  });
  if (cleared > 0) {
    c.save(); c.globalAlpha = .28 * cleared;
    for (let i = 0; i < 12; i++) R(c, 0, i * 22, 480, 9, '#FFD08A');
    c.restore();
  }
  if (t < 1.0) rain(c, t, { n: 80, a: .22 * (1 - t) });
};

// 回忆之城
SC.memcity = function (c, t, o) {
  const k = clamp(t / 1.2, 0, 1);
  if (k < 1) {
    PLACE.bridge(c, t, { rain: false, actors: cc => { GUY(cc, 224, 232, {}); GIRL(cc, 258, 232, { dir: -1 }); } });
    c.save(); c.globalAlpha = .85 * (1 - k); R(c, 0, 0, 480, 270, '#FFF6E2'); c.restore();
    c.save(); c.globalAlpha = .7 * (1 - k); ring(c, 240, 200, 30 + k * 280, '#FFD166'); ring(c, 240, 200, 10 + k * 220, '#FFE9B8'); c.restore();
    return;
  }
  sky(c, ['#2A1A3A', '#5A2A48', '#A04650', '#E07848', '#FFB45E'], t, { h: 180 });
  sun(c, 300, 118, 20, '#FFD08A', '#FF9E6E');
  cloudSea(c, 176, t, { base: '#5A3A62', hi: '#7A4A72', top: '#9A5A82' });
  const items = [[54, 'alley'], [150, 'market'], [330, 'school'], [424, 'bridge']];
  for (const [x, kind] of items) {
    R(c, x - 34, 176, 68, 60, '#3A2A44');
    R(c, x - 34, 176, 68, 3, '#5A3A52');
    if (kind === 'alley') { R(c, x - 24, 186, 48, 46, '#4A3A50'); R(c, x - 8, 206, 16, 26, '#2A1A2E'); R(c, x - 30, 180, 22, 8, '#E8DCC0'); text(c, '流浪', x - 28, 180, '#2A1A2E', 1); }
    if (kind === 'market') { for (let i = 0; i < 4; i++) R(c, x - 28 + i * 16, 180, 12, 8, '#D9473F'); R(c, x - 28, 188, 56, 4, '#8A3A34'); for (let i = 0; i < 3; i++) R(c, x - 20 + i * 16, 196, 10, 6, '#FFD166'); }
    if (kind === 'school') { for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) R(c, x - 22 + i * 16, 186 + j * 14, 10, 9, '#FFE9B8'); }
    if (kind === 'bridge') { for (let i = 0; i < 5; i++) lantern(c, x - 24 + i * 12, 182, 4, t + i, '#E8556D'); }
  }
  GUY(c, 214, 236, { eyes: 'happy', mouth: 'smile', h: 60 });
  GIRL(c, 256, 236, { eyes: 'happy', mouth: 'smile', blush: 1, h: 56, dir: -1 });
  R(c, 226, 218, 12, 3, '#E9B58C');
  fireflies(c, t, 30, '#FFD166');
  if (t < 2.6) {
    const kk = clamp((t - 1.2) / 1.4, 0, 1);
    for (let i = 0; i < 16; i++) {
      const a = hash(i * 3.1) * 6.28;
      const x = 240 + Math.cos(a) * (220 * (1 - kk)), y = 135 + Math.sin(a) * (150 * (1 - kk));
      c.save(); c.globalAlpha = .7; R(c, x, y, 10, 10, i % 2 ? '#E8792F' : '#FFD166'); c.restore();
    }
  }
};
