// scenes5.js — v2 新增：间奏特写四镜 + 情绪补强
'use strict';
const SC5 = W.SCENES;

// 5-2 ECU 小豪脸：雨打脸、咬牙闭眼、日历纸角抖动、闪电频闪
SC5.lonelyFace = function (c, t, o) {
  sky(c, ['#060A18', '#0A1024', '#111A32'], t, { h: 270 });
  // 闪电频闪
  const lf = t % 2.1;
  if (lf < .06) { c.save(); c.globalAlpha = .28; R(c, 0, 0, 480, 270, '#C8B8FF'); c.restore(); }
  // 暗色船底背景
  R(c, 0, 190, 480, 80, '#0B1226');
  for (let i = 0; i < 6; i++) pline(c, 40 + i * 76, 190, 40 + i * 76, 270, 2, '#101A34');
  CH.portrait(c, 240, 130, 7, 'm', {
    eyes: 'closed', mouth: 'flat', dir: 1, rimCol: '#9CC0E8',
  });
  // 脸上雨痕（左颊两道）
  for (let i = 0; i < 2; i++) {
    const x = 196 + i * 14;
    for (let j = 0; j < 5; j++) {
      const yy = 108 + ((t * 60 + j * 16 + i * 30) % 70);
      c.save(); c.globalAlpha = .5; PX(c, x, yy, '#CFE3F5'); c.restore();
    }
  }
  // 怀里日历纸（左下大张，纸角被风吹抖）
  const fl = Math.sin(t * 11) * 3;
  R(c, 30, 208, 64, 46, '#E8DCC4'); R(c, 32, 210, 60, 6, '#B8A88A');
  poly(c, [[94, 208], [94 + 18 + fl, 216], [94 + 15, 226 + fl], [94, 240]], '#F4EEDC');
  text(c, '保质期', 38, 218, '#8A6A4A', 1);
  rain(c, t, { n: 140, a: .38, wind: -.3 });
  grain(c, 480, 270, t, .05);
};

// 5-4 ECU 手：日历纸被风卷走，指尖差 1px
SC5.grabPaper = function (c, t, o) {
  sky(c, ['#0A1024', '#111A32', '#182444'], t, { h: 270 });
  R(c, 0, 210, 480, 60, '#0B1E3F');
  for (let x = 0; x < 480; x += 3) R(c, x, 212 + Math.sin(x * .1 + t * 2) * 2, 3, 2, '#1B2A4A');
  // 纸（从手边飘向右上出画）
  const k = clamp(t / 4.2, 0, 1);
  const px = 250 + k * 190, py = 150 - k * 66 + Math.sin(t * 2.4) * 9;
  const rot = -.18 - k * .5;
  c.save(); c.translate(px, py); c.rotate(rot);
  R(c, -16, -12, 32, 24, '#E8DCC4'); R(c, -14, -10, 28, 4, '#B8A88A');
  R(c, -10, -2, 20, 2, '#8A6A4A'); R(c, -10, 3, 14, 2, '#8A6A4A');
  c.restore();
  // 指尖（从下方伸入，追着纸）
  const hx = 210 + Math.sin(t * 5) * 2 + k * 60, hy = 232 - k * 26;
  R(c, hx - 26, hy + 16, 52, 30, '#23335C');
  R(c, hx - 20, hy + 2, 40, 18, '#E9B58C');
  for (let i = 0; i < 4; i++) R(c, hx - 16 + i * 9, hy - 8 - (i === 3 ? 2 : 0), 6, 12, '#E9B58C');
  R(c, hx - 20, hy + 2, 40, 3, '#F6CDA9');
  // 差 1px 的遗憾：指尖与纸的最小距离
  const gap = Math.max(1, Math.round((1 - Math.abs(k - .82) * 5)));
  if (k > .55 && k < .95) {
    c.save(); c.globalAlpha = .5;
    text(c, '1px', hx + 16, hy - 26, '#9CC0E8', 1);
    c.restore();
  }
  // 风线
  for (let i = 0; i < 7; i++) {
    const wy = 60 + i * 22;
    c.save(); c.globalAlpha = .18;
    pline(c, (t * 160 + i * 70) % 560 - 40, wy, ((t * 160 + i * 70) % 560) + 30, wy + 4, 1, '#8FA8C8');
    c.restore();
  }
  rain(c, t, { n: 90, a: .3, wind: -.5 });
  grain(c, 480, 270, t, .05);
};

// 5-6 ECU 左眼：瞳孔倒映粉色蝴蝶结，墨水扩散收尾
SC5.eyeRain = function (c, t, o) {
  const k = clamp(t / 4.6, 0, 1);
  R(c, 0, 0, 480, 270, '#0C1220');
  // 眼窝与皮肤（大特写）
  R(c, 60, 60, 360, 150, '#E9B58C');
  R(c, 60, 60, 360, 14, '#C98A66');
  R(c, 60, 196, 360, 14, '#C98A66');
  // 眉毛
  R(c, 120, 78, 150, 10, '#171320');
  // 眼睛（睁）
  R(c, 120, 108, 240, 62, '#F6F2E8');
  R(c, 120, 108, 240, 6, '#C98A66');
  R(c, 120, 164, 240, 6, '#C98A66');
  // 瞳孔
  circle(c, 240, 139, 30, '#2B2438');
  circle(c, 240, 139, 22, '#171320');
  // 瞳孔里的粉色蝴蝶结倒影
  const bp = 1 - k * .4;
  c.save(); c.globalAlpha = .95;
  R(c, 232, 130 * bp + 8, 16, 5, '#F58BA6');
  poly(c, [[232, 133], [224, 126], [224, 141]], '#F27C9A');
  poly(c, [[248, 133], [256, 126], [256, 141]], '#F27C9A');
  PX(c, 240, 134, '#D9473F');
  c.restore();
  // 高光
  PX(c, 230, 128, '#FFFFFF'); R(c, 234, 126, 4, 2, '#FFFFFF');
  // 一滴雨落进左眼
  const dy = (t * 44) % 46;
  c.save(); c.globalAlpha = .85; R(c, 218, 100 + dy, 2, 4, '#CFE3F5'); c.restore();
  if (dy > 30) { c.save(); c.globalAlpha = .5; ring(c, 240, 139, 34, '#8FD8F0'); c.restore(); }
  // 墨水从边缘渗入（转场铺垫）
  const ink = clamp((t - 3.4) / 1.2, 0, 1);
  if (ink > 0) {
    c.save(); c.globalAlpha = .9;
    for (let i = 0; i < 40; i++) {
      const a = hash(i * 3.1) * 6.28;
      const rr = ink * 300 * hash(i * 5.7);
      circle(c, 240 + Math.cos(a) * rr, 135 + Math.sin(a) * rr, 8 + ink * 22, '#0A0910');
    }
    c.restore();
  }
  grain(c, 480, 270, t, .05);
};
