// scenes.js — 镜头场景（前奏 / 主歌 / 预副歌）
'use strict';
const SC = {};
W.SCENES = SC;
const GY = 218;

const GUY = (c, x, gy, o) => CH.draw(c, 'm', x, gy, o);
const GIRL = (c, x, gy, o) => CH.draw(c, 'f', x, gy, o);

// ==================== 前奏 ====================
// 巨浪 + 纸船（mode: wide / capsize）
SC.storm = function (c, t, o) {
  const mode = o.mode || 'wide';
  const lf = (t % 2.6) / 2.6;
  sky(c, ['#060A18', '#0A1024', '#111A32', '#182444', '#22304E'], t, { h: 200 });
  // 闪电
  if (lf < .05) {
    c.save(); c.globalAlpha = .5; R(c, 0, 0, 480, 270, '#C8B8FF'); c.restore();
    let bx = 300, by = 0;
    for (let i = 0; i < 12; i++) { const nx = bx + (hash(i * 3.7) - .5) * 22, ny = by + 14; pline(c, bx, by, nx, ny, 2, '#EDE6FF'); bx = nx; by = ny; }
  }
  // 云
  clouds(c, t, 60, '#1A2440', '#26324E', 4, 6);
  // 远浪
  for (let i = 0; i < 3; i++) {
    const yy = 120 + i * 16;
    c.save(); c.globalAlpha = .5;
    for (let x = 0; x < 480; x += 3) R(c, x, yy + Math.round(Math.sin(x * .05 + t * 1.4 + i) * 4), 3, 2, '#2E4472');
    c.restore();
  }
  // 海面底色（铺到画面底部）
  R(c, 0, 150, 480, 120, '#0B1E3F');
  c.save(); c.globalAlpha = .35;
  for (let i = 0; i < 5; i++) for (let x = 0; x < 480; x += 3) R(c, x, 200 + i * 14 + Math.round(Math.sin(x * .05 + t * 1.1 + i) * 3), 3, 1, '#1B2A4A');
  c.restore();
  // 主浪
  const wob = Math.sin(t * 1.6) * 5;
  for (let x = 0; x < 480; x += 2) {
    const hh = 26 + Math.sin(x * .02 + t * 1.2) * 12 + Math.sin(x * .05 - t * 2) * 5;
    R(c, x, 152 + wob - hh, 2, hh + 40, '#1B2A4A');
  }
  for (let x = 0; x < 480; x += 2) {
    const hh = 26 + Math.sin(x * .02 + t * 1.2) * 12 + Math.sin(x * .05 - t * 2) * 5;
    if (Math.sin(x * .18 + t * 3) > .6) R(c, x, 152 + wob - hh, 2, 3, '#7FA0C8');
  }
  // 水花
  for (let i = 0; i < 50; i++) {
    const x = hash(i * 3.1) * 480, y = 140 + hash(i * 7.3) * 60 + Math.sin(t * 4 + i) * 6;
    c.save(); c.globalAlpha = .3 + .5 * hash(i); R(c, x, y, 2 + (i % 3), 2, '#CFE3F5'); c.restore();
  }
  if (mode === 'wide') {
    const tilt = Math.sin(t * 1.9) * .10;
    boat(c, 240, 196 + Math.sin(t * 2.2) * 6, 46, { tilt, glow: .5, glowCol: '#9CC0E8' });
  } else {
    // 翻船瞬间
    const k = clamp(t / 3, 0, 1);
    const tilt = lerp(0, -1.1, easeIn(k));
    boat(c, 240, 190 + k * 20, 50, { tilt });
    // 飞散的字
    for (let i = 0; i < 4; i++) {
      const ch = '可不可以'[i];
      const a = -1.2 + i * .5, r = 30 + k * 90;
      c.save(); c.globalAlpha = 1 - k * .5;
      text(c, ch, 240 + Math.cos(a) * r, 170 + Math.sin(a) * r - k * 20, '#FFD166', 2, '#2A2440');
      c.restore();
    }
    // 小豪被抛出
    GUY(c, 250 + k * 20, 150 - k * 30 + Math.sin(t * 3) * 3, {
      pose: 'run', ph: .2, eyes: 'shock', mouth: 'open', aL: 150, aR: 160, h: 66
    });
    for (let i = 0; i < 12; i++) {
      const x = 240 + (hash(i * 3.1) - .5) * 200 * k, y = 170 + (hash(i * 7.7) - .5) * 120 * k;
      c.save(); c.globalAlpha = (1 - k) * .9; R(c, x, y, 3, 3, '#FFD166'); c.restore();
    }
  }
  rain(c, t, { n: 200, a: .5, wind: -.35, spd: 700 });
  nearRain(c, t, 20, '#CFE3F5', .4);
};

SC.cabin = function (c, t, o) {
  PLACE.cabin(c, t, {
    actors: cc => {
      // 蜷缩在船底
      GUY(cc, 226, 252, { pose: 'crouch', eyes: 'sad', mouth: 'frown', aL: 26, aR: 26, h: 66, rim: '#9CC0E8', rimDir: -1, tint: '#1B2444', tintA: .28 });
      // 抱膝的手臂
      R(cc, 214, 214, 24, 5, '#23335C');
      R(cc, 212, 220, 26, 4, '#1C2A4E');
    }
  });
  // 泪珠
  const dy = ((t * 40) % 30);
  if (t > .6) { c.save(); c.globalAlpha = .9; R(c, 224, 200 + dy, 2, 2, '#8FD8F0'); c.restore(); }
  // 漏光
  c.save(); c.globalAlpha = .1;
  for (let i = 0; i < 26; i++) dith(c, 150 + i * 2, 0, 8, 100 + i * 4, '#9CC0E8', .5);
  c.restore();
  grain(c, 480, 270, t, .04);
};
SC.vig = function (c, t, o) {
  const v = o.v || 0;
  if (v === 0) { // 小卖部汽水
    R(c, 0, 0, 480, 270, '#3A2E2A');
    vgrad(c, 0, 0, 480, 180, ['#5A4436', '#7A5A42', '#A07A52'], 60);
    // 货架
    for (let s = 0; s < 3; s++) { R(c, 40, 30 + s * 34, 400, 4, '#4E3A2A'); for (let i = 0; i < 16; i++) R(c, 48 + i * 24, 18 + s * 34, 10, 12, ['#D9473F', '#E8792F', '#4A7A4A', '#5E86BE'][i % 4]); }
    // 柜台
    R(c, 0, 180, 480, 90, '#6E4A38'); R(c, 0, 180, 480, 4, '#8E6548');
    // 汽水
    R(c, 200, 160, 8, 22, '#E8792F'); R(c, 202, 152, 4, 8, '#D9C8A8');
    R(c, 216, 164, 8, 18, '#E8792F');
    // 两小只
    GUY(c, 168, 200, { h: 60, eyes: 'happy', mouth: 'smile', blush: 1 });
    GIRL(c, 268, 200, { h: 58, eyes: 'happy', mouth: 'smile', blush: 1, dir: -1 });
    // 气泡
    for (let i = 0; i < 8; i++) PX(c, 204 + Math.sin(t * 2 + i) * 3, 158 - ((t * 18 + i * 9) % 40), '#FFE9B8');
    PLACE.vigFrame(c, '');
  } else if (v === 1) { // 黑板 第312天
    R(c, 0, 0, 480, 270, '#1E2A22');
    R(c, 0, 0, 480, 270, '#22302A');
    dith(c, 0, 0, 480, 270, '#1A2620', .5);
    text(c, '第 312 天', 90, 90, '#F4EEDC', 3);
    // 粉笔爱心
    heart(c, 340, 120, 8, '#F58BA6');
    R(c, 60, 220, 60, 4, '#F4EEDC'); R(c, 80, 210, 20, 4, '#F58BA6');
    GIRL(c, 330, 250, { h: 92, eyes: 'happy', mouth: 'smile', aR: 120, dir: -1 });
    dustMotes(c, t, 30, 20, 250, '#F4EEDC');
    PLACE.vigFrame(c, '');
  } else if (v === 2) { // 透明伞
    sky(c, ['#2A3244', '#3A4558', '#4E5A6E'], t, { h: 180 });
    for (let i = 0; i < 6; i++) R(c, 0, 150 + i * 10, 480, 2, '#2A3040');
    R(c, 0, 210, 480, 60, '#333B4A');
    rain(c, t, { n: 120, a: .4 });
    UM(c, 240, 120, 70);
    GUY(c, 210, 216, { eyes: 'open', mouth: 'smile', h: 74 });
    GIRL(c, 268, 216, { eyes: 'happy', mouth: 'smile', blush: 1, h: 70, dir: -1 });
    PLACE.vigFrame(c, '');
  } else if (v === 3) { // 自行车后座
    sky(c, ['#4A5A78', '#7A8AA0', '#A8B8C8'], t, { h: 150 });
    for (let i = 0; i < 8; i++) circle(c, 40 + i * 70, 90, 26, '#3E4A5A');
    R(c, 0, 160, 480, 110, '#4A5460');
    R(c, 0, 190, 480, 80, '#3A4450');
    bicycle(c, 175, 218, 60);
    GUY(c, 150, 216, { pose: 'sit', eyes: 'open', mouth: 'smile', h: 72 });
    GIRL(c, 205, 214, { pose: 'sit', eyes: 'happy', mouth: 'smile', h: 70, aL: 60, aR: 60, dir: -1 });
    // 风吹马尾
    for (let i = 0; i < 5; i++) R(c, 218 + i * 3, 160 + i, 2, 2, '#2A2028');
    PLACE.vigFrame(c, '');
  } else if (v === 4) { // 桥洞背对背
    R(c, 0, 0, 480, 270, '#1A1E2A');
    for (let i = 0; i < 10; i++) R(c, 0, 40 + i * 20, 480, 2, '#22283A');
    R(c, 0, 190, 480, 80, '#2A3244');
    // 桥洞拱
    for (let i = 0; i < 40; i++) {
      const w = 300 - i * 2;
      R(c, 240 - w / 2, 60 + i * 3, w, 1, '#333B52');
    }
    GUY(c, 200, 218, { pose: 'sit', eyes: 'closed', mouth: 'flat', view: 'front' });
    GIRL(c, 286, 218, { pose: 'sit', eyes: 'closed', mouth: 'flat', dir: -1 });
    boat(c, 243, 214, 12, { label: '', col: '#E8E4D8' });
    PLACE.vigFrame(c, '');
  } else { // 她走远
    sky(c, ['#7A8290', '#9AA2AE', '#B8BEC8'], t, { h: 170 });
    R(c, 0, 170, 480, 100, '#8A9098');
    // 雾
    c.save(); c.globalAlpha = .35; dith(c, 0, 120, 480, 60, '#C8CCD4', .5); c.restore();
    GIRL(c, 300 + t * 6, 214, { view: 'back', dir: -1, h: 62 });
    // 像素碎片化
    for (let i = 0; i < 30; i++) {
      const x = 300 + t * 6 + (hash(i * 3.1) - .5) * 20, y = 150 + hash(i * 7.7) * 60;
      c.save(); c.globalAlpha = .6; R(c, x, y + (t * 8 % 20), 2, 2, '#F4E9D2'); c.restore();
    }
    rain(c, t, { n: 60, a: .2 });
    PLACE.vigFrame(c, '');
  }
};
function UM(c, x, y, s) {
  for (let i = -s; i <= s; i++) {
    const hh = Math.round(Math.sqrt(Math.max(0, s * s - i * i)) * .5);
    c.save(); c.globalAlpha = .35; R(c, x + i, y - hh, 1, hh + 2, '#CFE3F5'); c.restore();
    if (i % 8 === 0) R(c, x + i, y - hh, 1, hh, '#9CC0E8');
  }
  R(c, x, y + 2, 2, 80, '#4E3A32');
}

// ==================== 主歌一 ====================
SC.alley = function (c, t, o) {
  const mode = o.mode || 'leave';
  const warm = mode === 'tug';
  const actors = cc => {
    if (mode === 'leave') {
      GUY(cc, 214, GY, { view: 'back', pose: 'stand', rim: '#F4D58D', rimDir: 1 });
      // 行李箱
      R(cc, 176, GY - 30, 26, 30, '#3A2E3A'); R(cc, 176, GY - 30, 26, 3, '#4E3E48');
      R(cc, 180, GY - 20, 2, 16, '#2A2030'); R(cc, 196, GY - 20, 2, 16, '#2A2030');
      R(cc, 184, GY - 32, 6, 3, '#8A6A4A');
      // 箱上小纸船
      boat(cc, 206, GY - 34, 8, { col: '#F4EEDC' });
    } else if (mode === 'tug') {
      GUY(cc, 236, GY, { pose: 'walk', ph: .22, eyes: 'shock', mouth: 'open', dir: 1, lean: 1 });
      GIRL(cc, 186, GY, { pose: 'walk', ph: .72, eyes: 'pout' ? 'happy' : 'happy', mouth: 'pout', dir: 1, blush: 1, aL: 95, aR: 100 });
      // 拽帽子的手 + 弹动
      R(cc, 220, GY - 62 + Math.sin(t * 9) * 1, 5, 3, '#23335C');
    } else {
      GUY(cc, 250, GY, { pose: 'walk', ph: .5, eyes: 'sad', mouth: 'flat', view: 'front', lean: 1 });
      // 空石阶
      R(cc, 150, GY - 12, 60, 12, '#39445C');
      leaves(cc, t, 2, '#B07A4A');
    }
  };
  PLACE.alley(c, t, {
    warm, rain: !warm, sign: mode === 'empty' ? '旺铺出租' : '流浪书咖',
    signFade: mode === 'empty', signCol: mode === 'empty' ? '#B8A88A' : '#E8DCC0',
    actors,
    puddles: mode === 'tug' ? [[70, 238, 80, 8], [330, 244, 60, 6]] : [[70, 244, 60, 7], [300, 250, 80, 8]]
  });
  if (mode === 'leave') { c.save(); c.globalAlpha = .5; R(c, 214, GY - 84, 2, 8, '#CFE3F5'); c.restore(); }
};

SC.seawall = function (c, t, o) {
  sky(c, ['#3A4458', '#4E5A70', '#6A7488', '#8A94A4'], t, { h: 150 });
  clouds(c, t, 60, '#5E6A80', '#7A8498', 3, 3);
  sea(c, 150, t, { cols: ['#2A3A52', '#324460', '#3A4E6C', '#445A78'], amp: 3 });
  // 防波堤
  R(c, 0, 196, 480, 74, '#4A4E56');
  for (let i = 0; i < 5; i++) R(c, 0, 196 + i * 15, 480, 1, '#3A3E46');
  for (let i = 0; i < 40; i++) R(c, hash(i * 3.1) * 480, 196 + hash(i * 7.7) * 70, 6, 3, '#565A62');
  R(c, 0, 196, 480, 3, '#5E626A');
  // 消波块
  for (let i = 0; i < 4; i++) { R(c, 60 + i * 120, 188, 20, 12, '#5A5E66'); R(c, 66 + i * 120, 182, 8, 8, '#6A6E76'); }
  // 浪拍堤
  for (let i = 0; i < 30; i++) {
    const x = hash(i * 3.3) * 480, y = 186 + Math.sin(t * 3 + i) * 4;
    c.save(); c.globalAlpha = .5; R(c, x, y, 3, 3, '#CFE3F5'); c.restore();
  }
  GUY(c, 250, 214, { pose: 'stand', eyes: 'sad', mouth: 'frown', rim: '#8A94A4', lean: -1 });
  // 小纸船被吹落海
  const drop = clamp((t - 1.2) / 2.2, 0, 1);
  if (drop < 1) boat(c, 276 + drop * 26, 200 + drop * 30, 9, { tilt: drop * .5 });
  else boat(c, 302 + (t - 3.4) * 4, 230 + Math.sin(t) * 2, 6, { tilt: .5 });
  // 海鸟
  for (let i = 0; i < 2; i++) {
    const bx = 60 + ((t * 26 + i * 120) % 420), by = 60 + i * 18;
    pline(c, bx, by, bx + 4, by - 3, 1, '#2A3244'); pline(c, bx + 4, by - 3, bx + 8, by, 1, '#2A3244');
  }
};

SC.room = function (c, t, o) {
  PLACE.room(c, t, {
    busPass: true,
    actors: cc => {
      GUY(cc, 300, 226, { pose: 'sit', eyes: 'sad', mouth: 'flat', tint: '#1B2444', tintA: .3 });
    }
  });
  if (t > 1.0 && t < 2.2) { // 转头看照片
    const k = clamp((t - 1.0) / .4, 0, 1);
    c.save(); c.globalAlpha = .3 * k; R(c, 160, 70, 20, 24, '#FFE9B8'); c.restore();
  }
  grain(c, 480, 270, t, .04);
};

SC.cross = function (c, t, o) {
  PLACE.crossroad(c, t, {
    rain: true,
    actors: cc => {
      const run = t > 1.2;
      const x = run ? 120 + (t - 1.2) * 130 : 120;
      if (run) {
        speedLines(cc, x - 120, 190, 14, 40, '#CFE3F5', .18);
        GUY(cc, x, GY, { pose: 'run', ph: (t * 3.2) % 1, eyes: 'open', mouth: 'open', lean: 3 });
        // 背包
        R(cc, x - 6, GY - 56, 14, 18, '#3A2E2A'); R(cc, x - 6, GY - 56, 14, 3, '#4E3E36');
      } else {
        GUY(cc, x, GY, { pose: 'stand', eyes: 'open', mouth: 'flat', lean: 2 });
      }
      // 溅水
      if (run) for (let i = 0; i < 8; i++) {
        const px = x - 10 + hash(i * 3.1) * 30, py = GY - hash(i * 7.7) * 14;
        c.save(); c.globalAlpha = .6; R(cc, px, py, 2, 2, '#9CC0E8'); c.restore();
      }
    }
  });
};

// ==================== 主歌二 ====================
SC.canteen = function (c, t, o) {
  PLACE.canteen(c, t, {
    actors: cc => {
      GIRL(cc, 210, 206, { pose: 'stand', eyes: 'pout' ? 'sad' : 'open', mouth: 'pout', aR: 95, dir: 1, blush: 1 });
      GUY(cc, 268, 206, { pose: 'stand', eyes: 'happy', mouth: 'smile', aL: 95, dir: -1 });
      // 餐盘里的胡萝卜被挑出来
      R(cc, 224, 200, 4, 2, '#E8792F'); R(cc, 230, 198, 4, 2, '#E8792F');
      // 头顶怒气泡
      const k = clamp((t - .3) / .5, 0, 1);
      if (k > 0) {
        cc.save(); cc.globalAlpha = k;
        R(cc, 198, 118, 18, 18, '#F4EEDC'); R(cc, 199, 119, 16, 16, '#FFFFFF');
        R(cc, 202, 134, 4, 3, '#F4EEDC');
        // 怒气符号：井字
        R(cc, 203, 122, 8, 2, '#D9473F'); R(cc, 203, 128, 8, 2, '#D9473F');
        R(cc, 204, 121, 2, 10, '#D9473F'); R(cc, 208, 121, 2, 10, '#D9473F');
        R(cc, 212, 118, 2, 5, '#D9473F'); cc.restore();
      }
      // 夹排骨
      if (t > 1.4) { R(cc, 244, 196, 6, 3, '#8A5A3A'); }
    }
  });
};

SC.market = function (c, t, o) {
  // 横向移动：摊位随镜头左移
  const off = t * 34;
  PLACE.nightmarket(c, t, {
    actors: cc => {
      const x = 240;
      GUY(cc, x, 228, { pose: 'walk', ph: (t * 1.6) % 1, eyes: 'happy', mouth: 'smile' });
      GIRL(cc, x + 34, 228, { pose: 'walk', ph: (t * 1.6 + .5) % 1, eyes: 'open', mouth: 'open', blush: 1, dir: -1 });
      // 手里的串 / 奶茶
      R(cc, x - 12, 168, 2, 12, '#C8A04A'); R(cc, x - 14, 164, 6, 4, '#C46A3A');
      R(cc, x + 42, 176, 8, 10, '#E8DCC4'); R(cc, x + 44, 172, 4, 4, '#D9C8A8');
    }
  });
  c.save(); c.globalAlpha = .5; R(c, 0, 0, 8, 270, '#0A0A18'); R(c, 472, 0, 8, 270, '#0A0A18'); c.restore();
};

SC.gift = function (c, t, o) {
  // 教室课桌特写（俯视）
  vgrad(c, 0, 0, 480, 200, ['#3A3038', '#4E3E42', '#6A5248'], 66);
  c.save(); c.globalAlpha = .3;
  R(c, 320, 10, 130, 130, '#FFE9B8');
  c.restore();
  for (let i = 0; i < 3; i++) { R(c, 30 + i * 26, 50 + i * 6, 18, 44, i % 2 ? '#8A5A58' : '#4E6A8A'); }
  // 她趴在桌沿（先画人）
  GIRL(c, 152, 262, { h: 100, eyes: 'happy', mouth: 'smile', blush: 1, tint: '#FFD9A0', tintA: .12 });
  // 桌面（透视梯形，盖住她的下半身）
  poly(c, [[0, 200], [480, 190], [480, 270], [0, 270]], '#C09464');
  poly(c, [[0, 200], [480, 190], [480, 202], [0, 214]], '#D6A972');
  for (let i = 0; i < 5; i++) {
    const yy = 220 + i * 12;
    R(c, 0, yy, 480, 1, '#A87C50');
    for (let x = (i % 2) * 40; x < 480; x += 90) R(c, x, yy, 40 + i * 6, 1, '#B48858');
  }
  R(c, 60, 250, 26, 3, '#E8792F'); R(c, 86, 249, 4, 5, '#F4EEDC');
  R(c, 392, 236, 34, 2, '#3A3A4A');
  // 他的手把糖推过去
  R(c, 246, 226, 66, 16, '#E9B58C'); R(c, 246, 226, 66, 3, '#F6CDA9');
  R(c, 308, 218, 22, 28, '#E9B58C');
  R(c, 310, 212, 5, 9, '#E9B58C'); R(c, 316, 210, 5, 10, '#E9B58C'); R(c, 322, 212, 5, 9, '#E9B58C');
  // 糖
  const cx = 258, cy = 236;
  R(c, cx - 8, cy - 6, 16, 12, '#F58BA6'); R(c, cx - 8, cy - 6, 16, 2, '#FFC4D2');
  R(c, cx - 11, cy - 4, 3, 8, '#FFC4D2'); R(c, cx + 8, cy - 4, 3, 8, '#FFC4D2');
  PX(c, cx - 2, cy - 1, '#FFF6E2'); PX(c, cx + 1, cy + 1, '#FFF6E2');
  if (Math.sin(t * 5) > .3) glow(c, cx, cy, 22, '#FFD166', .7);
  // 她伸过来的手
  R(c, 190, 240, 50, 13, '#F4C9A8'); R(c, 228, 232, 18, 20, '#F4C9A8');
  for (let i = 0; i < 3; i++) R(c, 242 + i * 4, 230, 3, 8, '#F4C9A8');
  for (let i = 0; i < 2; i++) {
    const yy = 214 - ((t * 18 + i * 22) % 50);
    c.save(); c.globalAlpha = .75; heart(c, 292 + i * 26, yy, 3, '#F58BA6'); c.restore();
  }
};
SC.surprise = function (c, t, o) {
  const k = o.k || 0;
  if (k === 0) { // 课本里夹纸条
    R(c, 0, 0, 480, 270, '#3E3A32');
    R(c, 40, 60, 400, 160, '#F4EEDC'); R(c, 44, 64, 392, 152, '#E8E0CC');
    for (let i = 0; i < 6; i++) R(c, 60, 80 + i * 20, 300 + hash(i) * 60, 2, '#B8B0A0');
    // 纸条上的纸船
    boat(c, 240, 180, 22, { col: '#F7E2C0' });
    GIRL(c, 400, 230, { h: 84, eyes: 'happy', mouth: 'open', blush: 1, dir: -1 });
  } else if (k === 1) { // 雨天热可可
    sky(c, ['#2A3244', '#3A4558', '#4E5A6E'], t, { h: 170 });
    R(c, 0, 170, 480, 100, '#333B4A');
    for (let i = 0; i < 5; i++) R(c, 0, 20 + i * 28, 480, 3, '#22283A');
    rain(c, t, { n: 120, a: .35 });
    UM(c, 240, 110, 76);
    GUY(c, 214, GY, { eyes: 'open', mouth: 'smile', h: 74 });
    GIRL(c, 272, GY, { eyes: 'happy', mouth: 'smile', h: 70, blush: 1, dir: -1 });
    // 热可可
    R(c, 236, 168, 10, 14, '#F4EEDC'); R(c, 236, 174, 10, 8, '#8A5A3A');
    for (let i = 0; i < 4; i++) { c.save(); c.globalAlpha = .3; circle(c, 236 + Math.sin(t * 3 + i) * 3, 164 - i * 5, 2 + i, '#FFFFFF'); c.restore(); }
  } else if (k === 2) { // 泡面生日快乐
    R(c, 0, 0, 480, 270, '#2A2432');
    R(c, 0, 190, 480, 80, '#3A3444');
    for (let i = 0; i < 3; i++) { R(c, 120 + i * 80, 170, 40, 20, '#E8DCC4'); R(c, 120 + i * 80, 170, 40, 4, '#F4EEDC'); }
    text(c, '生日快乐', 130, 120, '#FFD166', 2, '#5A2A30');
    // 蜡烛
    for (let i = 0; i < 4; i++) {
      R(c, 150 + i * 50, 178, 4, 14, '#F58BA6');
      R(c, 151 + i * 50, 172, 2, 3, '#FFD166');
      c.save(); c.globalAlpha = .6; glow(c, 152 + i * 50, 172, 10, '#FFD166', .8); c.restore();
    }
    GUY(c, 380, 230, { h: 80, eyes: 'happy', mouth: 'smile' });
  } else { // 蜡烛爱心
    R(c, 0, 0, 480, 270, '#0A0C18');
    R(c, 0, 180, 480, 90, '#141624');
    for (let i = 0; i < 26; i++) {
      const a = i / 26 * Math.PI * 2;
      const hx = 240 + Math.cos(a) * 90, hy = 210 + Math.sin(a) * 34;
      R(c, hx - 2, hy - 8, 4, 10, '#F4EEDC');
      const fl = Math.sin(t * 6 + i) * 1;
      R(c, hx - 1, hy - 12 + fl, 2, 4, '#FFD166');
      glow(c, hx, hy - 12, 9, '#FFD166', .6);
    }
    GUY(c, 240, 214, { eyes: 'happy', mouth: 'smile' });
  }
};

SC.stands = function (c, t, o) {
  const mode = o.mode || 'cry';
  const dusk = mode !== 'cry';
  sky(c, dusk ? ['#2A1A3A', '#5A2A48', '#A04650', '#E07848', '#FFB45E'] : ['#4E5A70', '#6A7488', '#8A94A4'], t, { h: 150 });
  if (dusk) { sun(c, 372, 116, 17, '#FFD08A', '#FF9E6E'); petals(c, t, 14, '#F7B9C4', '#E983A6'); }
  else clouds(c, t, 60, '#5E6A80', '#7A8498', 3, 3);
  // 远处操场 + 跑道
  R(c, 0, 146, 480, 18, dusk ? '#6E4A3A' : '#4A5A44');
  R(c, 0, 146, 480, 2, dusk ? '#8A5A44' : '#5A6A4A');
  R(c, 0, 158, 480, 8, '#A04A3A');
  c.save(); c.globalAlpha = .5; for (let x = 0; x < 480; x += 24) R(c, x, 160, 12, 1, '#D8C8B8'); c.restore();
  // 跑道上两个小人影
  for (let i = 0; i < 2; i++) {
    const px = ((t * 20 + i * 200) % 520) - 20;
    R(c, px, 156, 2, 5, '#2A2432'); R(c, px, 153, 2, 2, '#E9B58C');
  }
  // 看台阶梯（6 级，越近越大）
  for (let i = 0; i < 6; i++) {
    const y = 166 + i * 17;
    R(c, 0, y, 480, 17, i % 2 ? '#4E525C' : '#43474F');
    R(c, 0, y, 480, 2, '#5E626C');
    R(c, 0, y + 15, 480, 2, '#33363E');
    for (let x = 0; x < 480; x += 72) R(c, x, y, 1, 17, '#33363E');
    // 台阶上的青苔/污渍
    for (let k = 0; k < 6; k++) dith(c, hash(k * 3 + i) * 480, y + 4, 18, 3, '#3A3E46', .5);
  }
  // 栏杆
  for (let x = 6; x < 480; x += 18) R(c, x, 170, 2, 26, '#8A8E96');
  R(c, 0, 168, 480, 3, '#9A9EA6');
  R(c, 0, 190, 480, 2, '#7A7E86');
  // 零散观众剪影
  const ppl = [[40, 196], [86, 214], [420, 230]];
  for (const [px, py] of ppl) {
    R(c, px - 7, py - 26, 14, 22, '#2E3238');
    R(c, px - 5, py - 34, 10, 9, '#2E3238');
    R(c, px - 9, py - 4, 6, 6, '#2E3238'); R(c, px + 3, py - 4, 6, 6, '#2E3238');
  }
  // 两人坐在台阶上
  if (mode === 'cry') {
    GIRL(c, 214, 202, { pose: 'sit', eyes: 'cry', mouth: 'frown', tear: 2, aL: 40, aR: 40 });
    GUY(c, 288, 202, { pose: 'sit', eyes: 'sad', mouth: 'flat', aL: 20, aR: 20 });
    // 外套披她肩上
    R(c, 196, 158, 38, 16, '#23335C'); R(c, 196, 158, 38, 3, '#2F4577');
    R(c, 230, 160, 6, 12, '#1C2A4E');
  } else if (mode === 'look') {
    GIRL(c, 206, 202, { pose: 'sit', eyes: 'happy', mouth: 'smile', blush: 1, aL: 30, aR: 30 });
    GUY(c, 286, 202, { pose: 'sit', eyes: 'open', mouth: 'smile', aL: 30, aR: 30 });
    // 一起抬头看天
  } else {
    GIRL(c, 224, 208, { pose: 'stand', eyes: 'happy', mouth: 'smile', blush: 1, dir: -1 });
    GUY(c, 260, 208, { pose: 'stand', eyes: 'open', mouth: 'smile' });
    R(c, 236, 182, 10, 3, '#E9B58C');
  }
};
SC.citypull = function (c, t, o) {
  // 从两人到整座城（由 cam 完成缩放，这里画城市+天台两人）
  sky(c, ['#070A18', '#0C1228', '#121A38', '#1A2448'], t, { h: 200 });
  stars(c, t, 120, 170);
  cityline(c, 210, { seed: 9, col: '#080A14', lit: .55, hmax: 150, win: '#FFD166' });
  cityline(c, 232, { seed: 15, col: '#0A0C18', lit: .5, hmax: 110, win: '#FF9E6E' });
  // 天台
  R(c, 0, 236, 480, 34, '#1A1E2A');
  R(c, 0, 236, 480, 2, '#2A3040');
  // 万家灯火渐次点亮
  const lit = clamp(t / 3.2, 0, 1);
  for (let i = 0; i < 90; i++) {
    const x = 240 + (hash(i * 3.1) - .5) * (760 * lit), y = 150 + (hash(i * 7.7) - .5) * 160 * lit;
    if (lit > hash(i * 2.3)) { c.save(); c.globalAlpha = .9; PX(cc0(), x, y, '#FFD166'); c.restore(); }
  }
  function cc0() { return c; }
  GUY(c, 232, 246, { h: 64, eyes: 'open', mouth: 'smile' });
  GIRL(c, 252, 246, { h: 61, eyes: 'happy', mouth: 'smile', dir: -1 });
  R(c, 238, 226, 8, 2, '#E9B58C');
};

// ==================== 间奏 / 桥段（复用于副歌） ====================
SC.stormLone = function (c, t, o) {
  SC.storm(c, t, { mode: 'wide' });
  // 覆盖：船上只有他
  c.save(); c.globalAlpha = .55; R(c, 0, 150, 480, 40, '#0A1024'); c.restore();
  GUY(c, 240, 200, { pose: 'sit', eyes: 'sad', mouth: 'frown', h: 44, tint: '#0A1024', tintA: .35 });
  // 手里攥着日历纸
  R(c, 252, 186, 10, 8, '#E8DCC4'); R(c, 253, 188, 8, 3, '#B8A88A');
  rain(c, t, { n: 160, a: .45, wind: -.3 });
};

SC.sinking = function (c, t, o) {
  sky(c, ['#060A18', '#0A1024', '#111A32', '#182444'], t, { h: 190 });
  clouds(c, t, 40, '#141C34', '#1E2844', 4, 8);
  sea(c, 150, t, { cols: ['#0B1E3F', '#0F2549', '#132E56', '#173766'], amp: 4 });
  const sink = clamp(t / 4.5, 0, 1);
  boat(c, 250, 190 + sink * 40, 40, { tilt: .18 + sink * .35, label: '', col: '#E8E4D8' });
  // 木板散开
  for (let i = 0; i < 14; i++) {
    const a = hash(i * 3.1) * 6.28, r = 10 + sink * 60 * hash(i * 5.7);
    c.save(); c.globalAlpha = .8;
    R(c, 250 + Math.cos(a) * r, 190 + sink * 40 + Math.sin(a) * r * .6, 6, 3, '#DCD5C4'); c.restore();
  }
  // 日历纸飘走
  const px = 260 + t * 30, py = 170 - Math.sin(t * 1.3) * 8 + t * 4;
  c.save(); c.globalAlpha = .9; R(c, px, py, 12, 9, '#E8DCC4'); R(c, px + 2, py + 2, 8, 3, '#B8A88A'); c.restore();
  rain(c, t, { n: 130, a: .4, wind: -.4 });
  GUY(c, 250, 210, { pose: 'crouch', eyes: 'sad', mouth: 'open', aR: 130, h: 48, tint: '#0A1024', tintA: .3 });
};

SC.floating = function (c, t, o) {
  sky(c, ['#3A4254', '#4E5668', '#6A7284', '#8A90A0'], t, { h: 150 });
  sea(c, 150, t, { cols: ['#2A3A52', '#324460', '#3A4E6C', '#445A78'], amp: 1.5 });
  // 平躺的人
  c.save(); c.translate(240, 196); c.rotate(-.06);
  R(c, -46, -10, 40, 20, '#23335C'); R(c, -50, -8, 10, 16, '#1C2A4E');
  R(c, 0, -9, 8, 18, '#E9B58C'); R(c, 6, -12, 16, 22, '#171320'); R(c, 9, -6, 12, 12, '#E9B58C');
  R(c, 12, 1, 4, 1, '#8A4A44'); PX(c, 12, -4, '#2B2438'); PX(c, 17, -4, '#2B2438');
  R(c, -46, -4, 30, 10, '#33507E');
  c.restore();
  // 涟漪
  for (let i = 0; i < 4; i++) {
    const r = 40 + ((t * 24 + i * 30) % 120);
    c.save(); c.globalAlpha = .25 * (1 - (r - 40) / 120);
    ring(c, 240, 200, r, '#CFE3F5'); c.restore();
  }
  // 一滴雨落在眼睛
  const dy = ((t * 50) % 40);
  c.save(); c.globalAlpha = .8; R(c, 248, 150 + dy, 1, 3, '#CFE3F5'); c.restore();
  rain(c, t, { n: 80, a: .25 });
};

SC.photos = function (c, t, o) {
  PLACE.photosRoad(c, t, {
    broken: true,
    actors: cc => {
      GUY(cc, 240, 232, { pose: 'walk', ph: (t * 1.5) % 1, eyes: 'sad', mouth: 'flat', view: 'back' });
      // 踩碎
      for (let i = 0; i < 10; i++) {
        const x = 220 + hash(i * 3.1) * 40, y = 232 + hash(i * 7.7) * 26;
        cc.save(); cc.globalAlpha = .5; R(cc, x, y, 3, 3, '#888888'); cc.restore();
      }
    }
  });
};

SC.pickup = function (c, t, o) {
  R(c, 0, 0, 480, 270, '#101010');
  PLACE.photosRoad(c, t, { broken: true });
  // 照片特写（中间）
  const pw = 180, ph = 130, px = 150, py = 70;
  R(c, px - 6, py - 6, pw + 12, ph + 12, '#DCDCDC');
  R(c, px, py, pw, ph, '#7A7A7A');
  // 女孩的笑脸简笔
  R(c, px + 60, py + 30, 60, 60, '#BDBDBD');
  R(c, px + 70, py + 40, 10, 12, '#333'); R(c, px + 100, py + 40, 10, 12, '#333');
  R(c, px + 78, py + 62, 24, 4, '#333');
  // 粉色从边缘渗入
  const k = clamp(t / 3.2, 0, 1);
  c.save(); c.globalAlpha = k;
  dith(c, px - 4, py - 4, pw + 8, 10, '#F58BA6', .8);
  dith(c, px - 4, py - 4, 10, ph + 8, '#F58BA6', .8);
  dith(c, px + pw - 6, py - 4, 10, ph + 8, '#F58BA6', .8);
  dith(c, px - 4, py + ph - 6, pw + 8, 10, '#F58BA6', .8);
  c.restore();
  // 手
  R(c, 200, 196, 70, 14, '#C98A66'); R(c, 200, 210, 24, 10, '#E9B58C');
  R(c, 256, 190, 8, 8, '#E9B58C');
  c.save(); c.globalAlpha = .35; R(c, 200, 210, 70, 6, '#8A5A44'); c.restore();
};

SC.colorize = function (c, t, o) {
  const k = clamp(t / 4, 0, 1);
  // 先铺彩色世界，再用灰度遮罩从中心扩散
  PLACE.alley(c, t, { warm: true, rain: false, actors: cc => GUY(cc, 240, GY, { eyes: 'open', mouth: 'smile' }) });
  // 灰度层（用 destination-out 圆形不做，改用逐格覆盖）
  const [gcv, gc2] = mkcanvas(480, 270);
  gc2.drawImage(c.canvas, 0, 0);
  // 用 getImageData 做去色（简单快速）
  const img = gc2.getImageData(0, 0, 480, 270), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11;
    d[i] = d[i + 1] = d[i + 2] = g;
  }
  gc2.putImageData(img, 0, 0);
  // 把未着色的部分（离中心远的方块）盖回来
  c.save();
  const cx = 240, cy = 200, Rr = k * 380;
  for (let by = 0; by < 270; by += 9) for (let bx = 0; bx < 480; bx += 9) {
    const dd = Math.hypot(bx - cx, (by - cy) * 1.5);
    if (dd > Rr) c.drawImage(gcv, bx, by, 9, 9, bx, by, 9, 9);
  }
  c.restore();
  // 色彩点亮方块
  for (let i = 0; i < 30; i++) {
    const a = hash(i * 3.1) * 6.28, r = k * 380 * hash(i * 5.7);
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r / 1.5;
    c.save(); c.globalAlpha = .6 * (1 - k); R(c, x, y, 4, 4, '#FFD166'); c.restore();
  }
};

SC.fold = function (c, t, o) {
  sky(c, ['#2A1A3A', '#5A2A48', '#A04650', '#E07848'], t, { h: 170 });
  sea(c, 170, t, { cols: ['#1B2A4A', '#22345C', '#2A406E'], amp: 2 });
  // 旧船
  bigBoat(c, 130, 190, 130, { label: '', lights: true });
  // 折纸动作：手 + 纸
  const k = clamp(t / 3, 0, 1);
  R(c, 0, 210, 480, 60, '#2A2434');
  // 纸
  const pw = 90 - k * 20, ph = 70 - k * 30;
  R(c, 300 - pw / 2, 210 - ph, pw, ph, '#F4EEDC');
  for (let i = 0; i < 4; i++) pline(c, 300 - pw / 2, 210 - ph + i * ph / 3, 300 + pw / 2, 210 - ph + i * ph / 3, 1, '#D6CDB8');
  // 折角
  if (k > .3) { for (let i = 0; i < 20; i++) R(c, 300 + i, 210 - ph - i * .6, 2, 1, '#E4DCC8'); }
  // 金光从缝里爆
  for (let i = 0; i < 26; i++) {
    const a = hash(i * 3.1) * 6.28, r = k * 100 * hash(i * 5.7);
    c.save(); c.globalAlpha = .8 * k;
    R(c, 300 + Math.cos(a) * r, 180 + Math.sin(a) * r, 3, 3, '#FFD166'); c.restore();
  }
  glow(c, 300, 180, 60 + k * 40, '#FFD166', .5);
  // 手
  R(c, 250, 196, 50, 12, '#C98A66'); R(c, 350, 196, 50, 12, '#E9B58C');
  // 新船（最后）
  if (k > .9) boat(c, 300, 200, 34, { label: '我回来了', labelCol: '#2A2440', glow: .7 });
};

// ==================== 副歌相关 ====================
SC.cloudboat = function (c, t, o) {
  const mode = o.mode || 'wide';
  sky(c, ['#1E1636', '#33254E', '#563463', '#8A4A70', '#B8687A'], t, { h: 210 });
  stars(c, t, 50, 110);
  if (mode === 'wide') {
    cloudSea(c, 186, t, { base: '#2E2A56', hi: '#4A4276', top: '#6A5A92' });
    for (let i = 0; i < 5; i++) {
      const x = 34 + i * 104 + Math.sin(t * .4 + i) * 6, y = 128 + Math.sin(t * .6 + i * 1.3) * 5;
      c.save(); c.globalAlpha = .5;
      boat(c, x, y, 15, { col: '#E8E4D8' });
      c.restore();
    }
    bigBoat(c, 240, 214, 360, { lights: true, col: '#EFE0D8', shade: '#C8B2C0', line: '#A894A8' });
    GUY(c, 214, 210, { view: 'back', h: 54 });
    GIRL(c, 250, 210, { view: 'back', h: 50, dir: -1 });
    for (let i = 0; i < 30; i++) {
      const x = 90 + hash(i * 3.1) * 320, y = 168 + hash(i * 7.7) * 30 - Math.sin(t + i) * 5;
      c.save(); c.globalAlpha = .4 + .6 * Math.abs(Math.sin(t * 2 + i)); PX(c, x, y, '#FFE9B8'); c.restore();
    }
    glow(c, 240, 150, 130, '#FFB060', .25);
  } else if (mode === 'windows') {
    cloudSea(c, 214, t, { base: '#2E2A56', hi: '#4A4276', top: '#6A5A92' });
    bigBoat(c, 240, 160, 520, { windows: 4, winCol: '#1B2440', lights: true, col: '#EFE0D8', shade: '#C8B2C0', line: '#A894A8' });
    for (let i = 0; i < 4; i++) {
      const wx = 240 - 520 * .39 + i * (520 * .78 / 4), wy = 160 + 520 * .16 * .34;
      const ww = 520 * .78 / 4 - 12, wh = 520 * .16 * .38;
      R(c, wx + ww * .35, wy + wh * .55, 3, 8, '#E9B58C');
      R(c, wx + ww * .5, wy + wh * .55, 3, 8, '#F4C9A8');
      R(c, wx + ww * .35, wy + wh * .45, 4, 6, '#23335C');
      R(c, wx + ww * .5, wy + wh * .45, 4, 6, '#F4E9D2');
      if (i === 3) boat(c, wx + ww * .55, wy + wh * .5, 6, { col: '#E8E4D8' });
    }
    for (let x = 40; x < 440; x += 3) PX(c, x, 160, '#FFD166');
  } else if (mode === 'bow') {
    cloudSea(c, 168, t, { base: '#4A2A5A', hi: '#6E3A6A', top: '#8A4A78' });
    bigBoat(c, 240, 238, 420, { lights: true, pk: .82, col: '#E8D4D8', shade: '#C0A4B8', line: '#9C88A0' });
    GUY(c, 210, 234, { eyes: 'open', mouth: 'smile', h: 84, aR: 62 });
    GIRL(c, 272, 234, { eyes: 'happy', mouth: 'smile', blush: 1, h: 80, dir: -1, aL: 62 });
    petals(c, t, 26, '#F7B9C4', '#E983A6');
    c.save(); c.globalAlpha = .95;
    cloudPuff(c, -40, 268, 210, 26, '#5A3670', '#7A4A80');
    cloudPuff(c, 340, 274, 220, 22, '#5A3670', '#7A4A80');
    c.restore();
  } else if (mode === 'future') {
    cloudSea(c, 214, t, { base: '#2E2A56', hi: '#4A4276', top: '#6A5A92' });
    bigBoat(c, 240, 152, 520, { windows: 3, winCol: '#1B2440', lights: true, col: '#EFE0D8', shade: '#C8B2C0', line: '#A894A8' });
    for (let i = 0; i < 3; i++) {
      const x = 240 - 250 + i * (500 / 3) + 10, y = 152 + 520 * .16 * .34, w = 500 / 3 - 24, h = 520 * .16 * .38;
      if (i === 0) { R(c, x + 4, y + h * .4, w * .5, h * .4, '#E8DCC4'); R(c, x + w * .55, y + h * .2, 3, h * .7, '#8A6A4A'); }
      if (i === 1) { R(c, x + 4, y + h * .6, w * .7, 4, '#6E4A38'); R(c, x + 6, y + h * .3, 3, 5, '#E9B58C'); R(c, x + w * .5, y + h * .3, 3, 5, '#F4C9A8'); }
      if (i === 2) { R(c, x + 4, y + h * .15, w * .8, h * .6, '#F4EEDC'); R(c, x + 10, y + h * .22, w * .6, h * .45, '#F7B9C4'); }
    }
  }
};
SC.hands = function (c, t, o) {
  sky(c, ['#2A1A3E', '#4A2A58', '#7A3A6E', '#B05A72'], t, { h: 200 });
  cloudSea(c, 176, t, { base: '#4A2A5A', hi: '#6E3A6A', top: '#8A4A78' });
  // 交握的手（近景，从左右两条手臂伸进来）
  const sh = 10;
  // 左臂
  poly(c, [[0, 250], [120, 196], [150, 210], [0, 270]], '#23335C');
  poly(c, [[0, 250], [120, 196], [126, 202], [0, 258]], '#2F4577');
  // 左手掌
  poly(c, [[120, 196], [156, 186], [176, 206], [168, 224], [140, 230], [122, 220]], '#E9B58C');
  // 右臂
  poly(c, [[480, 246], [360, 200], [332, 214], [480, 270]], '#F4E9D2');
  poly(c, [[480, 246], [360, 200], [356, 206], [480, 254]], '#FFF9EC');
  // 右手掌
  poly(c, [[360, 200], [324, 190], [304, 210], [312, 228], [340, 234], [358, 224]], '#F4C9A8');
  // 交叠区
  poly(c, [[150, 198], [176, 192], [200, 202], [204, 220], [180, 232], [152, 224]], '#E9B58C');
  // 手指（十指相扣的 4 组）
  for (let i = 0; i < 4; i++) {
    const y = 192 + i * 10;
    R(c, 186 + (i % 2) * 4, y, 16, 7, i % 2 ? '#E9B58C' : '#F4C9A8');
    R(c, 186 + (i % 2) * 4, y, 16, 2, '#FBE0C6');
  }
  // 指节阴影
  for (let i = 0; i < 4; i++) R(c, 200, 192 + i * 10, 2, 7, '#C98A66');
  // 金光
  for (let i = 0; i < 22; i++) {
    const a = hash(i * 3.1) * 6.28, r = 26 + hash(i * 5.7) * 66;
    c.save(); c.globalAlpha = .35 + .45 * Math.sin(t * 3.6 + i);
    PX(c, 190 + Math.cos(a) * r, 206 + Math.sin(a) * r * .55, '#FFE9B8'); c.restore();
  }
  glow(c, 190, 208, 66, '#FFD166', .45);
  // 樱花
  petals(c, t, 16, '#F7B9C4', '#E983A6');
};
SC.calendar = function (c, t, o) {
  R(c, 0, 0, 480, 270, '#241838');
  // 船头
  R(c, 0, 200, 480, 70, '#F4EEDC');
  for (let i = 0; i < 480; i += 4) R(c, i, 200, 2, 2, '#D6CDB8');
  // 日历
  const x = 140, y = 40, w = 200, h = 150;
  R(c, x - 4, y - 4, w + 8, h + 8, '#7A4B32');
  R(c, x, y, w, h, '#F4EEDC');
  R(c, x, y, w, 18, '#D9473F');
  text(c, '保质期', x + 58, y + 2, '#FFF0C0', 1);
  // 快速翻页
  const flip = Math.floor(t * 6) % 8;
  for (let i = 0; i < 6; i++) {
    const yy = y + 26 + i * 18;
    if (i === flip) { c.save(); c.globalAlpha = .6; R(c, x + 4, yy, w - 8, 16, '#E8E0CC'); c.restore(); }
    else R(c, x + 4, yy, w - 8, 1, '#D6CDB8');
  }
  if (t > 1.6) {
    const k = clamp((t - 1.6) / .5, 0, 1);
    c.save(); c.globalAlpha = k;
    textC(c, '永远', 240, y + 70, '#D9473F', 3, '#F4EEDC');
    heart(c, 300, y + 120, 6, '#D9473F');
    c.restore();
    glow(c, 240, y + 80, 80 * k, '#FFD166', .6 * k);
  }
};

SC.nod = function (c, t, o) {
  R(c, 0, 0, 480, 270, '#2A1E3E');
  for (let i = 0; i < 46; i++) {
    const x = hash(i * 3.1) * 480, y = hash(i * 7.7) * 270;
    c.save(); c.globalAlpha = .14 + .18 * Math.sin(t * 2 + i);
    circle(c, x, y, 3 + hash(i) * 7, ['#FF6EC7', '#7B6CFF', '#00E5FF', '#FFD166'][i % 4]);
    c.restore();
  }
  const nod = Math.round(Math.sin(t * 3.4) * 3);
  CH.portrait(c, 240, 138 + nod, 5, 'f', { eyes: 'happy', mouth: 'smile', blush: 1, dir: -1, rimCol: '#FFD8A8' });
  const k = clamp((t - .8) / 2.2, 0, 1);
  c.save(); c.globalAlpha = .95 * k;
  heart(c, 330, 96 - k * 40, 6 + k * 10, '#F58BA6');
  c.restore();
  glow(c, 330, 96 - k * 40, 36, '#FF9EC0', .4);
};
