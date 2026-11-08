// places.js — 场景建筑 / 室内（480×270，不含人物；o.actors(c) 由场景在正确景深调用）
'use strict';
const PLACE = {};
W.PLACE = PLACE;

// ============ 胡同（侧向墙面） ============
PLACE.alley = function (c, t, o) {
  o = o || {};
  const warm = o.warm, rainOn = o.rain, night = o.night;
  const cols = night ? ['#0A0F1E', '#101830', '#182444', '#22304E'] : warm ? ['#4A3A52', '#8A5A58', '#D08858', '#F2C48A'] : ['#3A4560', '#5A6A88', '#8A96AC', '#B8C0CE'];
  sky(c, cols, t, { h: 110 });
  if (night) stars(c, t, 40, 80);
  // 远景楼
  cityline(c, 118, { seed: 3, col: night ? '#080C18' : '#2A3244', lit: night ? .5 : .12, hmax: 50, win: night ? '#FFD166' : '#8A96AC' });
  // 主墙
  const wallTop = 92;
  R(c, 0, wallTop, 480, 130, warm ? '#6E4A42' : '#3E4A62');
  for (let y = wallTop; y < 222; y += 7) {
    R(c, 0, y, 480, 1, warm ? '#5A3A34' : '#333D52');
    for (let x = ((y / 7) % 2) * 14; x < 480; x += 28) R(c, x, y + 1, 1, 6, warm ? '#5A3A34' : '#333D52');
  }
  dith(c, 0, wallTop, 480, 40, warm ? '#8A5A48' : '#4E5A74', .35);
  // 墙裙
  R(c, 0, 196, 480, 26, warm ? '#4E342E' : '#2A3346');
  R(c, 0, 196, 480, 2, warm ? '#7A5044' : '#3E4A62');
  // 门
  const dx = 306, dy = 132;
  R(c, dx - 4, dy - 4, 52, 92, warm ? '#3A241E' : '#1E2436');
  R(c, dx, dy, 44, 88, warm ? '#7A4E3A' : '#2E3A52');
  R(c, dx + 2, dy + 2, 40, 84, warm ? '#8E5C42' : '#354260');
  R(c, dx + 20, dy + 2, 1, 84, warm ? '#6E4632' : '#2A3348');
  R(c, dx + 34, dy + 42, 3, 3, '#C8A04A');
  R(c, dx + 4, dy + 8, 16, 26, warm ? '#9E6A4A' : '#3A4A6A'); // 门上半窗
  // 窗
  const wx = 130, wy = 122, ww = 64, wh = 52;
  R(c, wx - 3, wy - 3, ww + 6, wh + 6, warm ? '#4E342E' : '#22283A');
  R(c, wx, wy, ww, wh, warm ? '#F2C48A' : '#101828');
  if (night) { dith(c, wx, wy, ww, wh, '#FFD166', .55); } else R(c, wx, wy, ww, wh, warm ? '#FFD9A0' : '#22304E');
  R(c, wx + ww / 2, wy, 2, wh, warm ? '#4E342E' : '#22283A');
  R(c, wx, wy + wh / 2, ww, 2, warm ? '#4E342E' : '#22283A');
  if (warm) { // 窗里晾的布和绿植
    R(c, wx + 4, wy + 4, 10, 14, '#E983A6'); R(c, wx + 40, wy + 6, 12, 8, '#CFE3F5');
    R(c, wx + 6, wy + wh - 12, 6, 10, '#2C4A32'); R(c, wx + 44, wy + wh - 14, 7, 12, '#4A7A4A');
  }
  // 招牌
  const sx = 26, sy = 104;
  R(c, sx - 2, sy - 2, 92, 26, '#241A18');
  R(c, sx, sy, 88, 22, o.signCol || '#E8DCC0');
  text(c, o.sign || '流浪书咖', sx + 4, sy + 3, '#241A18', 1);
  R(c, sx, sy + 22, 88, 2, '#8E7A56');
  if (o.signFade) { dith(c, sx, sy, 88, 22, '#6E6650', .6); }
  // 电线
  for (let i = 0; i < 3; i++) {
    const y0 = 78 + i * 6;
    for (let x = 0; x < 480; x += 2) R(c, x, y0 + Math.sin((x + i * 60) * .012) * 4 + i * 2, 2, 1, '#141018');
  }
  // 灯
  if (o.lamp !== false) lamp(c, 402, 196, 74, { gr: 34, cone: true });
  // 地面
  const gy = 222;
  R(c, 0, gy, 480, 48, warm ? '#7A5A48' : '#3E4860');
  for (let i = 0; i < 6; i++) {
    const yy = gy + 4 + i * 8;
    R(c, 0, yy, 480, 1, warm ? '#63443A' : '#333C50');
    for (let x = (i % 2) * 24; x < 480; x += 48) R(c, x, yy, 1, 8, warm ? '#63443A' : '#333C50');
  }
  dith(c, 0, gy, 480, 48, warm ? '#9A7A5C' : '#4A5670', .3);
  // 石缝高光
  for (let i = 0; i < 26; i++) { c.save(); c.globalAlpha = .35; R(c, hash(i * 3.1) * 480, gy + 2 + hash(i * 7.7) * 44, 3 + hash(i) * 5, 1, warm ? '#B08A62' : '#6E7C96'); c.restore(); }
  // 水洼
  const puddles = o.puddles || [[70, 244, 60, 7], [300, 250, 80, 8], [180, 258, 46, 5]];
  for (const [px, py, pw, ph] of puddles) {
    dith(c, px, py, pw, ph, warm ? '#F2C48A' : '#5E86BE', .5);
    R(c, px + 2, py + 1, pw * .4, 1, warm ? '#FFE9C0' : '#9CC0E8');
    c.save(); c.globalAlpha = .25; R(c, px, py + ph - 2, pw, 2, '#0A0F1E'); c.restore();
  }
  // 台阶
  if (o.step !== false) {
    R(c, 208, 210, 60, 12, warm ? '#7A5A4A' : '#39445C');
    R(c, 208, 210, 60, 2, warm ? '#9A7458' : '#4E5A74');
    R(c, 214, 218, 48, 4, warm ? '#6A4E42' : '#333D52');
  }
  // 门边绿植 / 杂物
  R(c, 24, 196, 10, 16, '#2C4A32'); R(c, 26, 190, 6, 8, '#4A7A4A');
  R(c, 40, 204, 14, 8, '#4E3A32');
  if (o.actors) o.actors(c);
  // 前景雨 / 落叶
  if (rainOn) { rain(c, t, { n: 130, a: .32, wind: -.22 }); nearRain(c, t, 10, '#CFE3F5', .25); }
  if (o.leaf) leaves(c, t, 4, '#B07A4A');
};

// ============ 单身公寓 ============
PLACE.room = function (c, t, o) {
  o = o || {};
  const wall = o.wall || ['#1A1E30', '#242A42', '#2E3550'];
  vgrad(c, 0, 0, 480, 200, wall, 70);
  // 墙缝
  R(c, 0, 196, 480, 4, '#141826');
  // 地板
  R(c, 0, 200, 480, 70, '#1A1622');
  for (let i = 0; i < 8; i++) R(c, 0, 204 + i * 9, 480, 1, '#221C2C');
  dith(c, 0, 200, 480, 70, '#2A2232', .2);
  // 窗（左）
  const wx = 26, wy = 46, ww = 96, wh = 84;
  R(c, wx - 4, wy - 4, ww + 8, wh + 8, '#0E1018');
  R(c, wx, wy, ww, wh, '#0A1024');
  // 窗外城市
  cityline(c, wy + wh - 8, { seed: 7, col: '#0B1224', lit: .45, hmax: 40, win: '#FFD166' });
  R(c, wx, wy, ww, wh, 'rgba(10,16,36,.2)');
  R(c, wx + ww / 2, wy, 3, wh, '#0E1018');
  R(c, wx, wy + wh / 2, ww, 3, '#0E1018');
  // 窗帘
  for (let i = 0; i < 14; i++) R(c, wx - 14 + i, wy - 6, 1, wh + 10, i % 3 ? '#2A2A3E' : '#35354C');
  // 书桌
  const dx = 250, dy = 168;
  R(c, dx, dy, 200, 6, '#3A2E2A');
  R(c, dx, dy, 200, 2, '#4E3E36');
  R(c, dx + 4, dy + 6, 5, 40, '#241C1A'); R(c, dx + 190, dy + 6, 5, 40, '#241C1A');
  // 显示器
  R(c, dx + 52, dy - 46, 66, 44, '#0E1018');
  R(c, dx + 56, dy - 42, 58, 36, o.screenGlow || '#1E4A5A');
  R(c, dx + 56, dy - 42, 58, 4, '#2E6A7A');
  for (let i = 0; i < 4; i++) R(c, dx + 60, dy - 34 + i * 6, 20 + hash(i * 3) * 30, 2, '#8FD8F0');
  R(c, dx + 80, dy - 2, 10, 4, '#0E1018');
  glow(c, dx + 85, dy - 20, 60, o.screenGlow || '#2E6A7A', .55);
  c.save(); c.globalAlpha = .18; R(c, dx + 30, dy - 50, 110, 60, '#8FD8F0'); c.restore();
  // 键盘 + 罐子 + 外卖
  R(c, dx + 54, dy + 2, 54, 3, '#2A2A38');
  R(c, dx + 120, dy - 10, 8, 12, '#9CC0E8'); R(c, dx + 122, dy - 12, 4, 2, '#CFE3F5');
  R(c, dx + 140, dy - 8, 12, 10, '#D9C8A8'); R(c, dx + 142, dy - 10, 8, 2, '#B8A88A');
  R(c, dx + 160, dy - 14, 9, 16, '#8E5C42');
  // 椅子
  R(c, dx + 40, dy + 20, 34, 8, '#2A2432');
  R(c, dx + 44, dy + 28, 4, 34, '#1E1A28'); R(c, dx + 66, dy + 28, 4, 34, '#1E1A28');
  R(c, dx + 40, dy - 16, 30, 20, '#332C3E');
  // 墙上拍立得
  const ph = [[150, 80, 22, 26, '#4E6A9E'], [182, 66, 20, 24, '#8A5A58'], [176, 96, 22, 26, '#E983A6'], [212, 74, 20, 24, '#5E86BE'], [214, 104, 22, 26, '#D9C8A8']];
  for (const [px, py, pw, phh, col] of ph) {
    R(c, px, py, pw, phh, '#DCD5C4');
    R(c, px + 2, py + 2, pw - 4, phh - 8, col);
    R(c, px + 3, py + phh - 6, pw - 6, 1, '#B8B0A0');
    R(c, px + pw / 2 - 1, py - 2, 2, 2, '#8E8A80');
  }
  // 时钟
  ring(c, 372, 70, 16, '#3A3448'); circle(c, 372, 70, 14, '#DCD5C4');
  R(c, 372, 60, 1, 9, '#2A2432'); R(c, 372, 70, 6, 1, '#2A2432');
  // 挂灯
  R(c, 420, 0, 1, 40, '#141018'); circle(c, 420, 44, 6, '#2A2432');
  glow(c, 420, 48, 40, '#FFD166', .8);
  if (o.actors) o.actors(c);
  if (o.busPass) {
    // 窗外车灯扫过
    const p = (t % 6) / 6;
    if (p < .4) {
      c.save(); c.globalAlpha = .5 * Math.sin(p / .4 * Math.PI);
      R(c, wx, wy, ww, wh, '#FFE9B8'); c.restore();
    }
  }
};

// ============ 十字路口（凌晨） ============
PLACE.crossroad = function (c, t, o) {
  o = o || {};
  sky(c, ['#080C1A', '#0E1428', '#161E38', '#1E2846'], t, { h: 160 });
  cityline(c, 160, { seed: 12, col: '#0A0E1A', lit: .4, hmax: 110, win: '#FFD166' });
  // 路面
  R(c, 0, 160, 480, 110, '#141A2A');
  dith(c, 0, 160, 480, 110, '#1E2638', .35);
  // 斑马线
  for (let i = 0; i < 7; i++) {
    const w = 30 + i * 4;
    R(c, 240 - w / 2, 178 + i * 9, w, 5, '#B8C0CE');
  }
  // 道路标线
  for (let x = 20; x < 480; x += 60) R(c, x, 236, 34, 3, '#8A94A8');
  // 红绿灯
  R(c, 60, 96, 3, 76, '#1A1E2A');
  R(c, 52, 90, 19, 34, '#1A1E2A');
  const phase = Math.floor(t / 3) % 3;
  circle(c, 61, 97, 4, phase === 0 ? '#D9473F' : '#3A2028');
  circle(c, 61, 106, 4, phase === 1 ? '#FFD166' : '#3A3220');
  circle(c, 61, 115, 4, phase === 2 ? '#5AD98A' : '#203A28');
  glow(c, 61, 97 + phase * 9, 22, phase === 0 ? '#D9473F' : phase === 1 ? '#FFD166' : '#5AD98A', .7);
  // 路灯
  lamp(c, 392, 190, 96, { gr: 40, cone: true });
  lamp(c, 150, 176, 54, { gr: 26 });
  // 湿地面反光
  c.save(); c.globalAlpha = .22;
  for (let i = 0; i < 40; i++) {
    const x = hash(i * 3.1) * 480, y = 170 + hash(i * 5.7) * 100;
    R(c, x, y, 2 + hash(i) * 10, 1, i % 3 ? '#FFD166' : '#5E86BE');
  }
  c.restore();
  // 井盖
  ring(c, 300, 248, 9, '#2A3244');
  if (o.actors) o.actors(c);
  if (o.rain) rain(c, t, { n: 90, a: .25 });
};

// ============ 大学食堂 ============
PLACE.canteen = function (c, t, o) {
  o = o || {};
  vgrad(c, 0, 0, 480, 200, ['#3A2E2A', '#4E3A32', '#6A4A38'], 70);
  // 瓷砖墙
  for (let y = 20; y < 150; y += 14) for (let x = 0; x < 480; x += 14) {
    const on = ((x / 14) + (y / 14)) % 2 === 0;
    R(c, x + 1, y + 1, 12, 12, on ? '#E8DCC4' : '#DCD0B8');
  }
  R(c, 0, 16, 480, 4, '#B8A88A');
  // 菜单牌
  R(c, 120, 34, 240, 46, '#2A2018');
  R(c, 124, 38, 232, 38, '#1E1812');
  text(c, '今日食堂', 132, 42, '#FFD166', 1);
  text(c, '红烧排骨 8元', 132, 60, '#F4EEDC', 1);
  text(c, '番茄鸡蛋 5元', 250, 60, '#F4EEDC', 1);
  // 打饭窗口
  R(c, 0, 130, 480, 16, '#8E6A4A');
  R(c, 0, 130, 480, 3, '#B08A5E');
  R(c, 0, 146, 480, 40, '#5E4634');
  for (let x = 10; x < 480; x += 90) {
    R(c, x, 150, 70, 30, '#7A5A44');
    R(c, x, 150, 70, 2, '#A07A56');
  }
  // 餐盘
  R(c, 60, 126, 34, 5, '#DCD5C4'); R(c, 64, 122, 10, 4, '#E8792F'); R(c, 78, 122, 8, 4, '#4A7A4A');
  R(c, 300, 126, 34, 5, '#DCD5C4'); R(c, 304, 122, 9, 4, '#D9473F');
  // 地砖
  R(c, 0, 186, 480, 84, '#3A3440');
  for (let y = 190; y < 270; y += 22) for (let x = 0; x < 480; x += 40) {
    dith(c, x + 1, y + 1, 38, 20, ((x / 40 + y / 22) % 2) ? '#443E4C' : '#322C38', 1);
  }
  // 桌椅
  for (const [tx, ty] of [[360, 206], [30, 216]]) {
    R(c, tx, ty, 84, 6, '#C8A04A'); R(c, tx, ty, 84, 2, '#E8C070');
    R(c, tx + 4, ty + 6, 4, 26, '#2A2432'); R(c, tx + 76, ty + 6, 4, 26, '#2A2432');
    R(c, tx + 6, ty - 12, 68, 4, '#B08A3E');
  }
  if (o.actors) o.actors(c);
};

// ============ 夜市 ============
PLACE.nightmarket = function (c, t, o) {
  o = o || {};
  sky(c, ['#0A0A18', '#14122A', '#201A36', '#2A2040'], t, { h: 130 });
  stars(c, t, 12, 60);
  // 远处楼
  cityline(c, 132, { seed: 21, col: '#0C0A16', lit: .55, hmax: 60, win: '#FF9E6E' });
  // 街面
  R(c, 0, 132, 480, 138, '#1A1420');
  dith(c, 0, 132, 480, 138, '#2A1E2A', .3);
  // 摊位（后排）
  stall(c, -10, 150, { w: 130, h: 56, awning: '#D9473F', body: '#6E4A38', sign: '烤串', signCol: '#FFB060', steam: true });
  stall(c, 350, 150, { w: 140, h: 56, awning: '#2E8E9E', body: '#5E4634', sign: '奶茶', signCol: '#7FD8C8' });
  stall(c, 170, 156, { w: 110, h: 50, awning: '#E8792F', body: '#6E4A38', sign: '糖炒栗子', signCol: '#FFD166' });
  // 灯串
  stringLights(c, 0, 480, 34, 26, t, '#FFD166');
  stringLights(c, 20, 460, 96, 14, t, '#FF9E6E');
  // 地灯光斑
  c.save(); c.globalAlpha = .3;
  for (let i = 0; i < 24; i++) dith(c, hash(i * 3.1) * 480, 180 + hash(i * 5.3) * 80, 24, 8, i % 2 ? '#FFB060' : '#D9473F', .5);
  c.restore();
  // 摆摊桌
  R(c, 40, 196, 150, 8, '#5E4634'); R(c, 40, 196, 150, 2, '#8A6A4A');
  R(c, 50, 204, 6, 40, '#3A2A24'); R(c, 170, 204, 6, 40, '#3A2A24');
  for (let i = 0; i < 6; i++) R(c, 56 + i * 22, 188, 8, 8, '#C8A04A');
  if (o.actors) o.actors(c);
  // 前景蒸汽
  c.save(); c.globalAlpha = .12;
  for (let i = 0; i < 3; i++) circle(c, 90 + Math.sin(t + i) * 8 + i * 26, 150 - i * 6, 10 + i * 3, '#FFFFFF');
  c.restore();
};

// ============ 教室 ============
PLACE.classroom = function (c, t, o) {
  o = o || {};
  const warm = o.sunny;
  vgrad(c, 0, 0, 480, 180, warm ? ['#5A4A44', '#7A5E4E', '#A07A5C'] : ['#2A3042', '#363E52', '#454E64'], 60);
  // 后墙 + 黑板
  R(c, 0, 0, 480, 186, warm ? '#6E5A4E' : '#2E3444');
  R(c, 20, 26, 250, 120, '#2A2A22');
  R(c, 26, 32, 238, 108, o.boardCol || '#22302A');
  R(c, 20, 146, 250, 6, '#6E5A44');
  text(c, o.boardTxt || '第 312 天', 40, 60, '#E8E4D0', 1);
  text(c, '一起走', 40, 86, '#E8E4D0', 1);
  // 粉笔槽
  R(c, 24, 142, 240, 4, '#3A3A30');
  R(c, 60, 140, 8, 2, '#F4EEDC');
  // 窗（右）
  const wx = 300, wy = 24, ww = 160, wh = 118;
  R(c, wx - 4, wy - 4, ww + 8, wh + 8, '#22283A');
  R(c, wx, wy, ww, wh, warm ? '#FFE9B8' : '#1A2440');
  if (warm) {
    // 窗外树影
    for (let i = 0; i < 5; i++) circle(c, wx + 30 + i * 30, wy + 30 + (i % 2) * 20, 16, '#C8A04A');
    dith(c, wx, wy, ww, wh, '#FFD166', .4);
  }
  R(c, wx + ww / 2, wy, 3, wh, '#22283A');
  R(c, wx, wy + wh / 2, ww, 3, '#22283A');
  // 光柱
  if (warm) {
    c.save(); c.globalAlpha = .16;
    for (let i = 0; i < 40; i++) dith(c, wx - 60 - i, wy + 10 + i * 1.4, 120, 3, '#FFE9B8', .7);
    c.restore();
  }
  // 课桌
  for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) {
    const dx = 40 + i * 112 - r * 12, dy = 150 + r * 34;
    R(c, dx, dy, 96, 6, warm ? '#B08A56' : '#4A4438');
    R(c, dx, dy, 96, 2, warm ? '#C8A06A' : '#5E564A');
    R(c, dx + 4, dy + 6, 4, 24, '#2A2432'); R(c, dx + 88, dy + 6, 4, 24, '#2A2432');
    R(c, dx + 14, dy - 10, 26, 10, '#3A3448');
    R(c, dx + 60, dy - 8, 14, 8, '#DCD5C4');
  }
  if (o.actors) o.actors(c);
  if (warm) dustMotes(c, t, 40, 40, 190, '#FFE9B8');
};

// ============ 操场看台 ============
PLACE.stands = function (c, t, o) {
  o = o || {};
  const dusk = o.dusk;
  sky(c, dusk ? ['#2A1A3A', '#5A2A48', '#A04650', '#E07848', '#FFB45E'] : ['#3A4560', '#5A6A88', '#8A96AC'], t, { h: 150 });
  if (dusk) sun(c, 380, 118, 16, '#FFD08A', '#FF9E6E');
  // 远处操场
  R(c, 0, 148, 480, 22, dusk ? '#6E4A3A' : '#4A5A44');
  R(c, 0, 148, 480, 4, dusk ? '#8A5A44' : '#5A6A4A');
  // 跑道
  R(c, 0, 160, 480, 10, '#A04A3A');
  // 看台阶梯
  for (let i = 0; i < 6; i++) {
    const y = 168 + i * 16;
    R(c, 0, y, 480, 16, i % 2 ? '#4A4E58' : '#3E424C');
    R(c, 0, y, 480, 2, '#5E626C');
    for (let x = 0; x < 480; x += 60) R(c, x, y, 1, 16, '#33363E');
  }
  // 栏杆
  for (let x = 0; x < 480; x += 8) R(c, x, 172, 1, 8, '#8A8E96');
  R(c, 0, 170, 480, 2, '#9A9EA6');
  if (o.actors) o.actors(c);
  if (dusk) petals(c, t, 10, '#F7B9C4', '#E983A6');
};

// ============ 天台夜景 ============
PLACE.roof = function (c, t, o) {
  o = o || {};
  sky(c, ['#070A18', '#0C1228', '#121A38', '#1A2448'], t, { h: 190 });
  stars(c, t, 90, 150);
  moon(c, 392, 46, 13, '#F2EAD8');
  cityline(c, 196, { seed: 31, col: '#080A14', lit: .5, hmax: 130, win: '#FFD166' });
  // 天台地面
  R(c, 0, 196, 480, 74, '#242A38');
  dith(c, 0, 196, 480, 74, '#2E3648', .3);
  for (let x = 0; x < 480; x += 40) R(c, x, 196, 1, 74, '#1A1E2A');
  R(c, 0, 196, 480, 2, '#3A4256');
  // 栏杆
  for (let x = 0; x < 480; x += 12) R(c, x, 168, 2, 30, '#3A3E4A');
  R(c, 0, 166, 480, 3, '#4A4E5A'); R(c, 0, 186, 480, 2, '#33363E');
  // 水塔
  R(c, 40, 120, 40, 50, '#1E2230'); R(c, 36, 116, 48, 6, '#2A2E3E');
  R(c, 44, 108, 4, 8, '#2A2E3E'); R(c, 72, 108, 4, 8, '#2A2E3E');
  // 空调外机
  R(c, 120, 176, 26, 20, '#2E3444'); ring(c, 133, 186, 7, '#3E4454');
  // 晾衣绳
  pline(c, 240, 140, 470, 132, 1, '#3A3E4A');
  R(c, 300, 132, 12, 16, '#5E6A8A'); R(c, 330, 134, 10, 14, '#8A5A58');
  if (o.actors) o.actors(c);
};

// ============ 地铁站台 ============
PLACE.subway = function (c, t, o) {
  o = o || {};
  // 站厅墙
  vgrad(c, 0, 0, 480, 118, ['#1E2438', '#2A3248', '#38405E'], 40);
  for (let y = 8; y < 112; y += 16) for (let x = 0; x < 480; x += 16) {
    const on = (x / 16 + y / 16) % 2 === 0;
    dith(c, x, y, 15, 15, on ? '#3E4870' : '#30385A', 1);
  }
  // 柱子
  for (const px of [56, 240, 424]) {
    R(c, px - 11, 6, 22, 108, '#3A4060');
    R(c, px - 11, 6, 5, 108, '#4E5680');
    R(c, px - 13, 106, 26, 6, '#262C44');
    R(c, px - 11, 6, 22, 5, '#566090');
  }
  // 吊牌
  R(c, 132, 20, 84, 17, '#1E4A6A'); text(c, '2号线', 139, 21, '#CFE3F5', 1);
  // 轨道区（深色）
  R(c, 0, 118, 480, 52, '#0C0E18');
  // 列车（辉光窗）
  if (o.train != null) {
    const off = o.train;
    R(c, off, 96, 560, 74, '#8E96AC');
    R(c, off, 96, 560, 5, '#C8D0DC');
    R(c, off, 160, 560, 10, '#5E667C');
    for (let i = 0; i < 6; i++) {
      R(c, off + 22 + i * 92, 110, 68, 34, '#1A2440');
      dith(c, off + 26 + i * 92, 114, 60, 26, '#8FD8F0', .22);
      R(c, off + 22 + i * 92, 110, 68, 2, '#A8C8E0');
    }
    R(c, off, 96, 8, 74, '#C8D0DC');
  }
  // 站台地面
  R(c, 0, 170, 480, 100, '#343A4C');
  dith(c, 0, 170, 480, 100, '#3E465C', .35);
  for (let x = 0; x < 480; x += 40) R(c, x, 170, 1, 100, '#2A3040');
  // 黄色安全线
  R(c, 0, 182, 480, 5, '#FFC35C');
  R(c, 0, 182, 480, 1, '#FFE0A0');
  R(c, 0, 170, 480, 3, '#4A5266');
  // 顶灯
  for (let x = 30; x < 480; x += 120) {
    R(c, x, 0, 66, 4, '#E8F4FF');
    glow(c, x + 33, 4, 54, '#CFE3F5', .45);
  }
  // 反光
  c.save(); c.globalAlpha = .12;
  for (let i = 0; i < 16; i++) R(c, hash(i * 3.1) * 480, 190 + hash(i * 7.7) * 70, 18, 2, '#CFE3F5');
  c.restore();
  if (o.actors) o.actors(c);
};

// ============ 石桥（雨夜灯笼） ============
PLACE.bridge = function (c, t, o) {
  o = o || {};
  sky(c, ['#0A0C1C', '#161A34', '#232A4C', '#2E3658'], t, { h: 150 });
  cityline(c, 150, { seed: 41, col: '#0A0C18', lit: .5, hmax: 54, win: '#FF9E6E' });
  // 河面
  R(c, 0, 150, 480, 56, '#141C36');
  c.save(); c.globalAlpha = .35;
  for (let i = 0; i < 40; i++) R(c, hash(i * 3) * 480, 152 + hash(i * 7) * 50, 8, 1, i % 2 ? '#7B6CFF' : '#E8556D');
  c.restore();
  // 桥栏（在人物身后）
  const railY = 186;
  R(c, 0, railY, 480, 10, '#4A4666');
  R(c, 0, railY, 480, 2, '#6A6688');
  R(c, 0, railY + 8, 480, 2, '#363252');
  for (let x = 0; x < 480; x += 22) { R(c, x, railY - 12, 3, 12, '#4A4666'); R(c, x, railY - 13, 3, 3, '#6A6688'); }
  R(c, 0, railY - 13, 480, 2, '#6A6688');
  // 桥面
  R(c, 0, 196, 480, 74, '#3A3852');
  for (let i = 0; i < 5; i++) { R(c, 0, 200 + i * 15, 480, 1, '#302E46'); }
  for (let i = 0; i < 30; i++) dith(c, hash(i * 3.1) * 480, 198 + hash(i * 7.7) * 70, 20, 4, '#464462', .5);
  // 灯串（横跨画面）
  for (let i = 0; i < 10; i++) {
    const x = 8 + i * 52;
    const yy = 118 + Math.sin(i / 9 * Math.PI) * 8;
    if (i > 0) pline(c, 8 + (i - 1) * 52, 118 + Math.sin((i - 1) / 9 * Math.PI) * 8, x, yy, 1, '#3A3040');
    lantern(c, x, yy, 7, t + i * .3, i % 2 ? '#E8556D' : '#F58BA6');
    // 地面光斑
    c.save(); c.globalAlpha = .18;
    for (let j = 0; j < 4; j++) dith(c, x - 14 + j, 200 + j * 2, 28 - j * 2, 6, '#FF9E6E', .4);
    c.restore();
  }
  if (o.actors) o.actors(c);
  if (o.rain !== false) rain(c, t, { n: 140, a: .35, wind: -.2 });
};

// ============ 沙滩清晨 ============
PLACE.beach = function (c, t, o) {
  o = o || {};
  sky(c, o.dawn === false ? ['#7FA8D4', '#A6C4E0', '#CFE3F5', '#F4EEDC'] : ['#4A5A88', '#8A7A9A', '#D8A08A', '#F4C48A', '#FFE9C0'], t, { h: 170 });
  const sy = 150;
  sun(c, 330, o.dawn === false ? 100 : 132, 14, '#FFF3D0', '#FFD08A');
  // 海
  sea(c, sy, t, { cols: ['#7FA8C8', '#8FB8D0', '#A6C8DC', '#C0DCE8'], amp: 2, foam: '#FFFFFF' });
  // 浪线
  for (let i = 0; i < 3; i++) {
    const yy = sy + 20 + i * 18;
    c.save(); c.globalAlpha = .5;
    for (let x = 0; x < 480; x += 3) R(c, x, yy + Math.round(Math.sin(x * .04 + t * 1.2 + i) * 2), 3, 1, '#FFFFFF');
    c.restore();
  }
  // 沙
  const gy = 208;
  R(c, 0, gy, 480, 62, o.night ? '#3A3A48' : '#E8D0A8');
  dith(c, 0, gy, 480, 62, o.night ? '#44445A' : '#D8BC90', .45);
  // 湿沙反光
  for (let i = 0; i < 3; i++) { c.save(); c.globalAlpha = .3; R(c, 0, gy + i * 6, 480, 2, '#FFFFFF'); c.restore(); }
  // 岸线泡沫
  for (let x = 0; x < 480; x += 2) {
    const yy = gy - 2 + Math.round(Math.sin(x * .07 + t * 1.6) * 2);
    R(c, x, yy, 2, 1, '#FFFFFF');
  }
  // 贝壳 / 石子
  for (let i = 0; i < 16; i++) PX(c, hash(i * 3.1) * 480, gy + 8 + hash(i * 7.7) * 50, i % 2 ? '#C8A88A' : '#F4EEDC');
  if (o.actors) o.actors(c);
};

// ============ 船内（纸船内部） ============
PLACE.cabin = function (c, t, o) {
  o = o || {};
  R(c, 0, 0, 480, 270, '#0A0E18');
  // 木肋
  for (let i = 0; i < 6; i++) {
    const x = 20 + i * 82;
    R(c, x, 40, 22, 210, '#4A3A30');
    R(c, x, 40, 4, 210, '#5E4A3E');
  }
  // 船板
  for (let y = 40; y < 250; y += 12) {
    R(c, 0, y, 480, 1, '#2A201C');
    dith(c, 0, y + 1, 480, 11, '#443428', .4);
  }
  // 漏进来的光
  c.save(); c.globalAlpha = .12;
  for (let i = 0; i < 30; i++) dith(c, 120 + i * 2, 0, 6, 120 + i * 3, '#9CC0E8', .5);
  c.restore();
  // 舷窗
  circle(c, 400, 90, 22, '#1A2438');
  ring(c, 400, 90, 22, '#4E3E36');
  circle(c, 400, 90, 18, '#0A1024');
  c.save(); c.globalAlpha = .5;
  for (let i = 0; i < 8; i++) R(c, 388 + i * 3, 84 + Math.sin(t * 2 + i) * 2, 2, 6, '#5E86BE');
  c.restore();
  // 雨从缝里漏
  c.save(); c.globalAlpha = .5;
  for (let i = 0; i < 6; i++) {
    const x = 90 + i * 60, y = ((t * 90 + i * 40) % 120);
    R(c, x, y, 1, 4, '#9CC0E8');
  }
  c.restore();
  // 船底积水
  R(c, 0, 244, 480, 26, '#1A2438');
  c.save(); c.globalAlpha = .25;
  for (let x = 0; x < 480; x += 4) R(c, x, 248 + Math.sin(x * .1 + t * 2), 4, 1, '#7FA0C8');
  c.restore();
  if (o.actors) o.actors(c);
};

// ============ 记忆碎片画框 ============
PLACE.vignette = function (c, t) {
  R(c, 0, 0, 480, 270, '#000');
  // 圆角像素画框（由场景绘制内容后覆盖边框）
};
PLACE.vigFrame = function (c, label) {
  // 四周像素白框
  const m = 10;
  for (let x = m; x < 480 - m; x += 6) { PX(c, x, m, '#F4EEDC'); PX(c, x, 270 - m, '#F4EEDC'); }
  for (let y = m; y < 270 - m; y += 6) { PX(c, m, y, '#F4EEDC'); PX(c, 480 - m, y, '#F4EEDC'); }
  c.save(); c.globalAlpha = .85; R(c, 0, 0, 480, 8, '#05040A'); R(c, 0, 262, 480, 8, '#05040A'); c.restore();
  if (label) text(c, label, 20, 246, '#F4EEDC', 1, '#05040A');
};

// ============ 黑白照片路 ============
PLACE.photosRoad = function (c, t, o) {
  o = o || {};
  R(c, 0, 0, 480, 270, '#0A0A0A');
  // 雾（只在远处）
  c.save(); c.globalAlpha = .07;
  for (let i = 0; i < 4; i++) dith(c, 0, 60 + i * 20, 480, 10, '#888888', .5);
  c.restore();
  // 地面（照片拼成）
  const rows = 7;
  for (let r = 0; r < rows; r++) {
    const y = 170 + r * 15;
    const n = 8 - r;
    for (let i = 0; i < n; i++) {
      const w = 480 / n, x = i * w + (r % 2) * 6;
      const broken = o.broken && (Math.sin(i * 2.3 + r) > .2);
      if (broken) {
        for (let b = 0; b < 6; b++) R(c, x + hash(b * 3 + i + r) * w, y + hash(b * 7 + i) * 12, 3, 3, '#333333');
      } else {
        R(c, x + 1, y, w - 2, 13, '#DCDCDC');
        R(c, x + 3, y + 2, w - 6, 9, '#8A8A8A');
        R(c, x + w / 2 - 2, y + 3, 2, 3, '#BDBDBD'); R(c, x + w / 2 + 1, y + 3, 2, 3, '#BDBDBD');
      }
    }
  }
  // 远处消失点
  c.save(); c.globalAlpha = .35; R(c, 200, 120, 80, 50, '#2A2A2A'); c.restore();
  if (o.actors) o.actors(c);
};

// ============ 回忆之城（拼贴） ============
PLACE.memcity = function (c, t, o) {
  o = o || {};
  // 天空（黄昏）
  sky(c, ['#2A1A3A', '#5A2A48', '#A04650', '#E07848', '#FFB45E'], t, { h: 170 });
  sun(c, 300, 120, 20, '#FFD08A', '#FF9E6E');
  // 云海
  cloudSea(c, 150, t, { base: '#4A3A62', hi: '#6E4E78', top: '#8A5A78' });
  // 拼贴地标剪影
  const items = [
    [30, 150, 'alley'], [120, 150, 'market'], [300, 150, 'school'], [400, 150, 'bridge'],
  ];
  for (const [x, y, kind] of items) {
    R(c, x - 26, y - 40, 52, 60, '#3A2A44');
    if (kind === 'alley') { R(c, x - 18, y - 30, 36, 50, '#4A3A50'); R(c, x - 6, y - 6, 14, 26, '#2A1A2E'); }
    if (kind === 'market') { for (let i = 0; i < 3; i++) R(c, x - 20 + i * 14, y - 34, 10, 8, '#D9473F'); R(c, x - 20, y - 26, 40, 4, '#8A3A34'); }
    if (kind === 'school') { for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) R(c, x - 16 + i * 12, y - 28 + j * 12, 7, 7, '#FFD166'); }
    if (kind === 'bridge') { for (let i = 0; i < 5; i++) lantern(c, x - 20 + i * 10, y - 20, 3, t + i, '#E8556D'); }
  }
  if (o.actors) o.actors(c);
  // 金尘
  fireflies(c, t, 30, '#FFD166');
};
