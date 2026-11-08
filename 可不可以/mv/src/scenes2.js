// scenes2.js — 镜头场景（副歌二 / 副歌三 / 尾声）
'use strict';

// ==================== 副歌二：现实追爱 ====================
SC.subway = function (c, t, o) {
  const trainOff = o.trainOff == null ? -520 + t * 320 : o.trainOff;
  PLACE.subway(c, t, {
    train: Math.max(-540, Math.min(20, trainOff)),
    actors: cc => {
      const x = 150 + Math.min(70, t * 26);
      speedLines(cc, x - 100, 180, 10, 30, '#CFE3F5', .14);
      GUY(cc, x, 214, { pose: 'run', ph: (t * 3.4) % 1, eyes: 'shock', mouth: 'open', lean: 3 });
      // 拍门
      if (t > 2.2) { R(cc, x + 10, 168, 3, 20, '#E9B58C'); }
    }
  });
  // 车门警示灯
  if (t > 2.0) {
    const on = Math.sin(t * 14) > 0;
    c.save(); c.globalAlpha = on ? .8 : .2; R(c, 120, 60, 8, 8, '#D9473F'); R(c, 360, 60, 8, 8, '#D9473F'); c.restore();
  }
  // 车速风
  if (t > 2.4) speedLines(c, 0, 150, 16, 60, '#CFE3F5', .12 * (1 - (t - 2.4) / 2));
};

SC.glass = function (c, t, o) {
  PLACE.subway(c, t, {
    actors: cc => {
      // 滑坐在地
      const k = clamp(t / 1.2, 0, 1);
      GUY(cc, 200, 214 + k * 6, { pose: k > .5 ? 'sit' : 'crouch', eyes: 'sad', mouth: 'flat', h: 76 - k * 6 });
    }
  });
  // 玻璃倒影：半透明叠化回忆
  c.save(); c.globalAlpha = .28 + .1 * Math.sin(t * 1.2);
  R(c, 170, 40, 150, 150, '#0A1024');
  // 倒影内容
  const k = Math.floor(t * 2) % 4;
  GIRL(c, 240, 170, { h: 70, eyes: 'happy', mouth: 'smile', blush: 1, tint: '#8FD8F0', tintA: .4 });
  if (k === 1) boat(c, 250, 160, 12, { col: '#CFE3F5' });
  if (k === 2) { heart(c, 240, 120, 6, '#7FD8C8'); }
  if (k === 3) { R(c, 210, 130, 60, 3, '#CFE3F5'); }
  c.restore();
  // 玻璃反光条
  c.save(); c.globalAlpha = .12; for (let i = 0; i < 5; i++) R(c, 60 + i * 80, 30, 6, 180, '#CFE3F5'); c.restore();
};

SC.rainrun = function (c, t, o) {
  // 冲出地铁站口，慢动作雨
  sky(c, ['#0C1020', '#161C34', '#1E2644'], t, { h: 160 });
  cityline(c, 160, { seed: 51, col: '#0A0C18', lit: .5, hmax: 90, win: '#FFD166' });
  R(c, 0, 160, 480, 110, '#1A1E2C');
  dith(c, 0, 160, 480, 110, '#262C40', .3);
  // 站口顶棚
  R(c, 120, 60, 240, 20, '#2A2E3C');
  R(c, 120, 60, 240, 3, '#3E4458');
  for (let i = 0; i < 5; i++) glow(c, 150 + i * 48, 78, 30, '#FFE9B8', .5);
  // 霓虹
  neon(c, 380, 120, '营业中', '#FF6EC7', 1);
  neon(c, 40, 130, '24H', '#00E5FF', 1);
  // 雨（慢速大颗）
  c.save(); c.globalAlpha = .7;
  for (let i = 0; i < 90; i++) {
    const yy = ((hash(i * 3.1) * 300 + t * 240) % 320) - 20;
    const xx = ((hash(i * 5.7) * 520 + yy * -.12) % 520) - 20;
    R(c, xx, yy, 1, 6, '#CFE3F5');
  }
  c.restore();
  // 小豪仰头淋雨
  GUY(c, 240, 224, { eyes: 'closed', mouth: 'open', h: 82, aL: 40, aR: 40 });
  // 水花
  for (let i = 0; i < 20; i++) {
    const a = hash(i * 3.3) * 6.28, r = 10 + hash(i * 5.1) * 40;
    c.save(); c.globalAlpha = .6; R(c, 240 + Math.cos(a) * r, 200 + Math.abs(Math.sin(a)) * r * .4, 2, 2, '#CFE3F5'); c.restore();
  }
  // 雨雾光斑
  for (let i = 0; i < 12; i++) {
    c.save(); c.globalAlpha = .12;
    circle(c, hash(i * 3.1) * 480, 60 + hash(i * 7.7) * 160, 8 + hash(i) * 14, ['#FF6EC7', '#00E5FF', '#FFD166'][i % 3]);
    c.restore();
  }
};

SC.stonebridge = function (c, t, o) {
  PLACE.bridge(c, t, {
    actors: cc => {
      const x = 60 + t * 70;
      GUY(cc, Math.min(x, 300), 214, { pose: 'run', ph: (t * 3) % 1, eyes: 'open', mouth: 'open', lean: 3, aL: 50, aR: -30 });
      // 桥那头撑伞的她
      if (t > 1.2) {
        UM(cc, 400, 130, 46);
        GIRL(cc, 400, 214, { view: 'back', h: 70, dir: -1 });
      }
    }
  });
  rain(c, t, { n: 90, a: .3 });
};

SC.turn = function (c, t, o) {
  // 小琪回头特写
  R(c, 0, 0, 480, 270, '#141830');
  PLACE.bridge(c, t, { rain: false });
  c.save(); c.globalAlpha = .45; R(c, 0, 0, 480, 270, '#0A0C18'); c.restore();
  // 大特写（转身）
  const k = clamp(t / .8, 0, 1);
  GIRL(c, 240, 290, { h: 150, dir: dirk(k), eyes: k > .7 ? 'shock' : 'open', mouth: k > .7 ? 'open' : 'flat', blush: k > .7 ? 1 : 0 });
  function dirk(kk) { return kk > .6 ? -1 : 1; }
  // 伞沿甩出的水珠
  for (let i = 0; i < 16; i++) {
    const a = -2.4 + i * .16, r = 40 + hash(i * 3.1) * 90 * k;
    c.save(); c.globalAlpha = .7 * k;
    R(c, 240 + Math.cos(a) * r, 120 + Math.sin(a) * r, 2, 2, '#CFE3F5'); c.restore();
  }
  // 雨
  rain(c, t, { n: 70, a: .25 });
};

SC.offer = function (c, t, o) {
  PLACE.bridge(c, t, {
    rain: false,
    actors: cc => {
      GUY(cc, 210, 214, { eyes: 'open', mouth: 'open', lean: 4, h: 76 });
      GIRL(cc, 286, 214, { eyes: 'shock', mouth: 'open', h: 70, dir: -1 });
      // 递出的纸船（发光）
      boat(cc, 248, 188, 16, { col: '#F4EEDC', glow: .8, glowCol: '#FFD166' });
      R(cc, 226, 186, 12, 4, '#E9B58C'); R(cc, 258, 186, 12, 4, '#F4C9A8');
    }
  });
  rain(c, t, { n: 40, a: .18 });
};

SC.giftBoat = function (c, t, o) {
  R(c, 0, 0, 480, 270, '#0E1220');
  // 纸船特写
  boat(c, 240, 170, 90, { label: '我回来了', labelCol: '#2A2440', glow: .7, glowCol: '#FFD166', col: '#F7F2E4' });
  // 金色字逐字点亮
  if (t > .6) {
    const n = Math.min(4, Math.floor((t - .6) * 3) + 1);
    textC(c, '我回来了'.slice(0, n), 240, 156, '#FFD166', 2, '#2A2440');
  }
  // 背景 bokeh
  for (let i = 0; i < 24; i++) {
    c.save(); c.globalAlpha = .12;
    circle(c, hash(i * 3.1) * 480, hash(i * 7.7) * 270, 4 + hash(i) * 8, '#FFD166'); c.restore();
  }
  // 她的手伸进来
  R(c, 340, 210, 60, 20, '#F4C9A8'); R(c, 340, 226, 60, 8, '#D9A382');
};

SC.hug = function (c, t, o) {
  const cleared = clamp((t - 1.0) / 2.5, 0, 1);
  PLACE.bridge(c, t, {
    rain: false,
    actors: cc => {
      GUY(cc, 228, 214, { eyes: 'closed', mouth: 'smile', aL: 70, aR: 70, h: 78 });
      GIRL(cc, 258, 214, { eyes: 'closed', mouth: 'smile', blush: 1, aL: 70, aR: 70, h: 72, dir: -1 });
      // 手臂环抱
      R(cc, 236, 168, 18, 4, '#F4C9A8'); R(cc, 232, 176, 20, 4, '#E9B58C');
    }
  });
  if (cleared > 0) {
    c.save(); c.globalAlpha = .35 * cleared;
    for (let i = 0; i < 12; i++) R(c, 0, 0 + i * 22, 480, 10, '#FFD08A');
    c.restore();
    c.save(); c.globalAlpha = .25 * cleared; R(c, 0, 0, 480, 270, '#FFE9B8'); c.restore();
  }
  if (t < 1.0) rain(c, t, { n: 80, a: .25 * (1 - t) });
};

// ==================== 副歌三：回忆之城 ====================
SC.memcity = function (c, t, o) {
  const k = clamp(t / 1.4, 0, 1);
  // 冲击波
  if (k < 1) {
    PLACE.bridge(c, t, { rain: false, actors: cc => { GUY(cc, 220, 214, {}); GIRL(cc, 250, 214, { dir: -1 }); } });
    c.save(); c.globalAlpha = .8 * (1 - k); R(c, 0, 0, 480, 270, '#FFF6E2'); c.restore();
    c.save(); c.globalAlpha = .6 * (1 - k); ring(c, 236, 180, 40 + k * 260, '#FFD166'); ring(c, 236, 180, 20 + k * 200, '#FFE9B8'); c.restore();
  } else {
    PLACE.memcity(c, t, {
      actors: cc => {
        GUY(cc, 214, 226, { eyes: 'happy', mouth: 'smile', h: 66 });
        GIRL(cc, 258, 226, { eyes: 'happy', mouth: 'smile', blush: 1, h: 62, dir: -1 });
        R(cc, 228, 210, 14, 3, '#E9B58C');
      }
    });
    // 拼图拼合：从四角飞入的方块
    if (t < 2.6) {
      const kk = clamp((t - 1.4) / 1.2, 0, 1);
      for (let i = 0; i < 20; i++) {
        const a = hash(i * 3.1) * 6.28;
        const x = 240 + Math.cos(a) * (200 * (1 - kk)), y = 135 + Math.sin(a) * (140 * (1 - kk));
        c.save(); c.globalAlpha = .8; R(c, x, y, 10, 10, i % 2 ? '#E8792F' : '#FFD166'); c.restore();
      }
    }
  }
};

SC.npc = function (c, t, o) {
  PLACE.memcity(c, t, {
    actors: cc => {
      // 路人 NPC（挥手的剪影）
      for (let i = 0; i < 8; i++) {
        const x = 20 + i * 62, gy = 236;
        const sway = Math.sin(t * 3 + i) * 3;
        R(cc, x - 5, gy - 46, 10, 24, ['#8A5A58', '#5E6A8A', '#8A6A4A', '#4A7A6A'][i % 4]);
        R(cc, x - 4, gy - 58, 8, 10, '#E9B58C');
        R(cc, x - 4, gy - 60, 8, 4, '#2A2028');
        R(cc, x - 12, gy - 54 + sway, 8, 3, '#E9B58C');
        R(cc, x + 4, gy - 54 - sway, 8, 3, '#E9B58C');
        R(cc, x - 5, gy - 22, 4, 22, '#3A3448'); R(cc, x + 1, gy - 22, 4, 22, '#3A3448');
        // 爱心 / 音符
        if (i % 3 === 0) { c0 = cc; c.save(); c.globalAlpha = .8; heart(cc, x, gy - 74 - Math.sin(t * 2 + i) * 4, 3, '#F58BA6'); c.restore(); }
        if (i % 3 === 1) text(cc, '♪', x + 8, gy - 80, '#FFD166', 1);
      }
      var c0;
      GUY(cc, 214, 236, { pose: 'walk', ph: (t * 1.2) % 1, eyes: 'happy', mouth: 'smile', h: 70 });
      GIRL(cc, 258, 236, { pose: 'walk', ph: (t * 1.2 + .5) % 1, eyes: 'happy', mouth: 'smile', h: 66, dir: -1, blush: 1 });
      // 彩带
      for (let i = 0; i < 24; i++) {
        const x = (hash(i * 3.1) * 480 + t * 12) % 480, y = (hash(i * 7.7) * 270 + t * 20) % 270;
        c.save(); c.globalAlpha = .7; R(cc, x, y, 3, 1, ['#FFD166', '#F58BA6', '#7FD8C8'][i % 3]); c.restore();
      }
    }
  });
};

SC.boatsky = function (c, t, o) {
  sky(c, ['#2A1A3E', '#4A2A4E', '#8A4A5A', '#D07850', '#FFC06A'], t, { h: 180 });
  stars(c, t, 30, 80);
  sun(c, 240, 150, 18, '#FFE9B8', '#FFB344');
  // 群船升空
  for (let i = 0; i < 12; i++) {
    const k = clamp((t - i * .12) / 2.2, 0, 1);
    const x = 40 + hash(i * 3.1) * 400 + Math.sin(t * .5 + i) * 10;
    const y = 210 - k * (120 + hash(i * 5.1) * 80);
    const s = 10 + hash(i * 7.7) * 12;
    c.save(); c.globalAlpha = .5 + .5 * k;
    boat(c, x, y, s, { col: '#F4EEDC', label: '' });
    // 尾迹
    if (k > .1) for (let j = 0; j < 5; j++) { c.save(); c.globalAlpha = .3 * (1 - j / 5); R(c, x - 2, y + 6 + j * 8, 2, 2, '#FFD166'); c.restore(); }
    // 小灯
    glow(c, x, y - s * .4, 12, '#FFD166', .6);
    c.restore();
  }
  // 地面剪影
  R(c, 0, 236, 480, 34, '#2A1E2E');
  GUY(c, 210, 238, { h: 52, view: 'back' });
  GIRL(c, 250, 238, { h: 50, view: 'back', dir: -1 });
};

SC.kiss = function (c, t, o) {
  sky(c, ['#2A1A3E', '#5A2A48', '#A04650', '#E07848'], t, { h: 160 });
  cloudSea(c, 170, t, { base: '#4A2A5A', hi: '#6E3A6A', top: '#8A4A78' });
  GUY(c, 222, 226, { eyes: 'closed', mouth: 'smile', h: 110, lean: 2 });
  GIRL(c, 276, 226, { eyes: 'closed', mouth: 'smile', blush: 1, h: 104, dir: -1 });
  // 额头相触
  const k = clamp((t - .4) / .8, 0, 1);
  if (k > 0) {
    c.save(); c.globalAlpha = .9 * k;
    for (let i = 0; i < 3; i++) ring(c, 249, 128, 14 + i * 10 + k * 8, '#F58BA6'); c.restore();
    for (let i = 0; i < 10; i++) {
      const a = -1.6 + i * .32, r = 20 + k * 40;
      c.save(); c.globalAlpha = .8; heart(c, 249 + Math.cos(a) * r, 130 + Math.sin(a) * r * .7, 2, '#F7B9C4'); c.restore();
    }
  }
  // 时间变慢：飘落花瓣
  petals(c, t * .3, 14, '#F7B9C4', '#E983A6');
};

SC.seabig = function (c, t, o) {
  sky(c, ['#3A2A3A', '#6E4442', '#B8704A', '#E8A050', '#FFD08A'], t, { h: 170 });
  sun(c, 320, 128, 22, '#FFF3D0', '#FFB344');
  sea(c, 170, t, { cols: ['#3A3A5A', '#4A4266', '#5E4A72', '#7A5A7A'], amp: 2, foam: '#FFD8A8' });
  // 金色反光
  for (let i = 0; i < 40; i++) {
    const x = 300 + (hash(i * 3.1) - .5) * 100, y = 180 + hash(i * 7.7) * 80;
    c.save(); c.globalAlpha = .3 + .3 * Math.sin(t * 2 + i); R(c, x, y, 2 + hash(i) * 6, 1, '#FFE9B8'); c.restore();
  }
  bigBoat(c, 240, 196, 330, { lights: true, col: '#F0E0D4', shade: '#D0B8BC' });
  GUY(c, 214, 192, { view: 'back', h: 46 });
  GIRL(c, 250, 192, { view: 'back', h: 44, dir: -1 });
  // 海鸥
  for (let i = 0; i < 3; i++) {
    const bx = 40 + ((t * 34 + i * 150) % 440), by = 60 + i * 20;
    pline(c, bx, by, bx + 4, by - 3, 1, '#3A2A3A'); pline(c, bx + 4, by - 3, bx + 8, by, 1, '#3A2A3A');
  }
};

SC.wordChange = function (c, t, o) {
  sky(c, ['#3A2A3A', '#6E4442', '#B8704A', '#E8A050'], t, { h: 180 });
  sea(c, 180, t, { cols: ['#3A3A5A', '#4A4266', '#5E4A72'], amp: 1.5 });
  bigBoat(c, 240, 150, 460, { col: '#F0E0D4', shade: '#D0B8BC', line: '#B0989C', lights: true });
  const word = '我们在一起';
  const n = Math.min(word.length, Math.floor(t * 3.0) + 1);
  textC(c, word, 240, 158, '#6A4A3A', 3);
  const lit = word.slice(0, n);
  const wAll = textW(word, 3);
  const lx = 240 - wAll / 2;
  c.save();
  glow(c, 240, 176, wAll * .55, '#FFD166', .45);
  text(c, lit, lx, 158, '#FFD166', 3);
  c.restore();
};
SC.sunset = function (c, t, o) {
  sky(c, ['#2A1A3A', '#5A2A48', '#A04650', '#E07848', '#FFB45E'], t, { h: 170 });
  const sunY = 120 + t * 1.6;
  sun(c, 300, sunY, 20, '#FFF3D0', '#FF9E6E');
  sea(c, 168, t, { cols: ['#3A3A5A', '#4A4266', '#5E4A72', '#7A5A7A'], amp: 1.6, foam: '#FFD8A8' });
  bigBoat(c, 200, 200, 310, { lights: true, col: '#F0E0D4', shade: '#D0B8BC' });
  GUY(c, 170, 196, { view: 'back', h: 46, pose: 'sit' });
  GIRL(c, 205, 196, { view: 'back', h: 44, pose: 'sit', dir: -1 });
};

SC.shoulder = function (c, t, o) {
  sky(c, ['#2A1A3A', '#5A2A48', '#A04650', '#E07848'], t, { h: 170 });
  sea(c, 170, t, { cols: ['#3A3A5A', '#4A4266', '#5E4A72'], amp: 1.4 });
  bigBoat(c, 240, 200, 320, { label: '', lights: true });
  GUY(c, 200, 196, { view: 'back', h: 62, pose: 'sit' });
  GIRL(c, 240, 196, { view: 'back', h: 58, pose: 'sit', dir: -1 });
  // 她靠在他肩上
  c.save(); c.globalAlpha = .5; R(c, 212, 168, 26, 5, '#2A2028'); c.restore();
  // 最后一只纸船漂向落日
  boat(c, 380 + Math.sin(t) * 2, 206, 10, { col: '#F4EEDC' });
  glow(c, 380, 200, 30, '#FFD08A', .4);
};

// ==================== 尾声 ====================
SC.beach = function (c, t, o) {
  PLACE.beach(c, t, {
    actors: cc => {
      // 大船靠岸
      c.save(); cc.globalAlpha = .9;
      bigBoat(cc, 130, 176, 170, { lights: true, col: '#F4E6DA', shade: '#D8C4C4' });
      cc.restore();
      // 两人坐在沙滩上
      GUY(cc, 300, 224, { pose: 'sit', eyes: 'closed', mouth: 'smile', h: 62 });
      GIRL(cc, 342, 224, { pose: 'sit', eyes: 'closed', mouth: 'smile', h: 58, dir: -1, blush: 1 });
      // 脚踩在浪里
      R(cc, 292, 220, 12, 4, '#E9B58C'); R(cc, 334, 220, 12, 4, '#F4C9A8');
    }
  });
  // 晨光勾边
  c.save(); c.globalAlpha = .18; R(c, 0, 0, 480, 270, '#FFD08A'); c.restore();
};

SC.boatsTwo = function (c, t, o) {
  PLACE.beach(c, t, {
    actors: cc => {
      GUY(cc, 150, 226, { pose: 'stand', view: 'back', h: 68 });
      GIRL(cc, 190, 226, { pose: 'stand', view: 'back', h: 64, dir: -1 });
      // 小纸船放进浪里
      const k = clamp(t / 2, 0, 1);
      const bx = 240 + k * 60, by = 232 + Math.sin(t * 3) * 2;
      boat(cc, bx, by, 13, { col: '#F4EEDC', glow: .6 });
      // 大船
      bigBoat(cc, 400, 176, 150, { lights: true, col: '#F4E6DA', shade: '#D8C4C4' });
    }
  });
  // 金色碎光
  for (let i = 0; i < 40; i++) {
    c.save(); c.globalAlpha = .3 + .3 * Math.sin(t * 3 + i);
    PX(c, 200 + hash(i * 3.1) * 280, 200 + hash(i * 7.7) * 60, '#FFF3D0'); c.restore();
  }
  // 淡入白（片尾）
  const k = clamp((t - 10.4) / 2.2, 0, 1);
  if (k > 0) { c.save(); c.globalAlpha = k; R(c, 0, 0, 480, 270, '#FFFDF4'); c.restore(); }
};

SC.titleEnd = function (c, t, o) {
  R(c, 0, 0, 480, 270, '#FFFDF4');
  c.save(); c.globalAlpha = .5;
  for (let i = 0; i < 20; i++) { PX(c, hash(i * 3.1) * 480, hash(i * 7.7) * 270, '#F4EEDC'); }
  c.restore();
};

// ==================== 教室初遇 ====================
SC.firstmeet = function (c, t, o) {
  PLACE.classroom(c, t, {
    sunny: true,
    boardTxt: '第 312 天',
    actors: cc => {
      const k = clamp(t / 1.6, 0, 1);
      GIRL(cc, 138 + k * 30, 212, { pose: 'walk', ph: (t * 1.4) % 1, eyes: 'open', mouth: 'flat', h: 72, dir: 1 });
      GUY(cc, 268, 210, { pose: 'stand', eyes: 'shock', mouth: 'open', aR: 40, h: 74 });
      R(cc, 148 + k * 30, 158, 18, 12, '#D9473F');
      R(cc, 149 + k * 30, 156, 16, 3, '#F4EEDC');
    }
  });
  if (t > 1.1) {
    const k = clamp((t - 1.1) / 1.2, 0, 1);
    c.save(); c.globalAlpha = .8 * k;
    let px = 40, py = 250;
    for (let x = 40; x < 440; x += 4) {
      const p = (x - 40) / 400;
      let yy = 250;
      if (p > .35 && p < .42) yy = 250 - Math.sin((p - .35) / .07 * Math.PI) * 14;
      if (p > .42 && p < .46) yy = 250 + Math.sin((p - .42) / .04 * Math.PI) * 7;
      if (p > .5 && p < .56) yy = 250 - Math.sin((p - .5) / .06 * Math.PI) * 9;
      pline(c, px, py, x, yy, 2, '#F58BA6');
      px = x; py = yy;
    }
    c.restore();
  }
  dustMotes(c, t, 26, 40, 200, '#FFE9B8');
};
