// specs/v5.js —《我好想你》像素 RPG · 全曲 329s · 57 镜
// 依据：02.输出区/02.草稿/2026-11-04-分镜词-我好想你-像素RPG多人交互版.md
// 音频：76.05 BPM / 103 小节 / 重拍 12.43 / drop 291.81

if (typeof PAL !== 'undefined') Object.assign(PAL, {
  ink: '#05080D', night: '#0E1B29', navy: '#1A2C40', slate: '#33506A',
  dusk: '#274A68', haze: '#7899B4', wall: '#202C3A', wallDk: '#151E2A',
  floor: '#2A2A2E', floorDk: '#191A1F', seaDk: '#19353F', steel: '#40607A',
  gold: '#FFD166', rose: '#E8556D', teal: '#4FA0A8', paper: '#F2EFE4',
  pale: '#C9C6DD', mint: '#9AD6C4', blush: '#E88A90',
});

const HZ = (v) => Math.min(1, Math.max(0, v));
const EZ = { out: x => 1 - Math.pow(1 - x, 3), in: x => x * x * x, io: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2 };

// ---------- 运镜 ----------
function CAM(dur, o) {
  return function (lt) {
    const p = HZ(lt / Math.max(.01, dur));
    const e = (EZ[o.ease] || EZ.io)(p);
    const z = (o.z0 ?? 1) + ((o.z1 ?? o.z0 ?? 1) - (o.z0 ?? 1)) * e;
    const cx = (o.cx0 ?? 160) + ((o.cx1 ?? o.cx0 ?? 160) - (o.cx0 ?? 160)) * e;
    const cy = (o.cy0 ?? 90) + ((o.cy1 ?? o.cy0 ?? 90) - (o.cy0 ?? 90)) * e;
    const w = 320 / z, h = 180 / z;
    return [Math.min(Math.max(cx - w / 2, 0), 320 - w), Math.min(Math.max(cy - h / 2, 0), 180 - h), w, h];
  };
}
function SHAKE(dur, amp) {
  return lt => {
    const p = HZ(lt / dur), k = Math.pow(1 - p, 2);
    return [Math.sin(lt * 61.3) * amp * k, Math.cos(lt * 47.7) * amp * k * .8, 320, 180];
  };
}
function SPOT(c, cx, cy, r, k) {
  shadeMask(c, (x, y) => k * Math.min(1, Math.max(0, (Math.hypot(x - cx, y - cy) - r) / 30)));
}

// ---------- 房子：主体 + 人字屋顶 + 窗 ----------
function house(c, x, y, w, h, wallCol, roofCol, seed, winDens, winCol, lit) {
  R(c, x, y, w, h, wallCol);
  const r = Math.ceil(w * .42);
  for (let i = 0; i < r; i++) R(c, x + i, y - i - 1, w - 2 * i, 1, i === 0 ? '#3A5068' : roofCol);
  const rnd = k => Math.abs(Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453) % 1;
  if (rnd(3) > .6) R(c, x + 3 + (rnd(4) * Math.max(1, w - 8) | 0), y - r - 4, 3, 4, roofCol);
  // 窗
  const wy = y + 4, wh = Math.max(3, h - 10);
  for (let j = wy; j < wy + wh; j += 7) for (let i2 = x + 3; i2 < x + w - 3; i2 += 6) {
    const on = rnd(i2 * 3 + j) < (winDens || .12);
    if (on) { R(c, i2, j, 2, 3, winCol || PAL.gold); if (lit) { c.save(); c.globalAlpha = .14; R(c, i2 - 1, j - 1, 4, 5, winCol || PAL.gold); c.restore(); } }
    else if (rnd(i2 + j) < .3) R(c, i2, j, 2, 3, '#0C141C');
  }
  // 门（部分房子）
  if (rnd(9) > .55) { R(c, x + (w / 2 | 0) - 2, y + h - 10, 5, 10, '#0A0F16'); R(c, x + (w / 2 | 0) - 2, y + h - 10, 5, 1, '#2A3A4A'); }
}

// ---------- 小镇三层 ----------
function townBase(c, t, o = {}) {
  vgradS(c, 0, 0, 320, 96, PAL.ink, o.snow ? '#1B2A3C' : '#14243A');
  // 远山
  c.fillStyle = '#0A1320';
  for (let x = 0; x < 320; x++) { const y = 62 + Math.sin(x * .021) * 6 + Math.sin(x * .053 + 1.7) * 2.5; c.fillRect(x, y, 1, 40); }
  // 远层
  let x = -6, s = 1;
  while (x < 330) { const w = 15 + (Math.abs(Math.sin(s * 7.7) * 100) % 9 | 0); house(c, x, 84, w, 16, '#131F2C', '#101A25', s, .05, PAL.haze, false); x += w + 2; s++; }
  // 中层（主体建筑，窗亮）
  x = -10; s = 21;
  while (x < 330) { const w = 24 + (Math.abs(Math.sin(s * 5.3) * 100) % 14 | 0); house(c, x, 116, w, 32, PAL.navy, '#111C2A', s, .13, PAL.gold, true); x += w + 3; s++; }
  // 街面店铺（暖窗，给街道一点活气）
  for (let i = 0; i < 9; i++) {
    const sx = 8 + i * 36;
    if (sx > 300) break;
    R(c, sx, 130, 22, 18, '#16202C');
    const on = Math.abs(Math.sin(i * 3.7 + 1.2)) > .35;
    if (on) { R(c, sx + 2, 133, 18, 12, '#8A6A32'); R(c, sx + 2, 133, 18, 1, PAL.gold); }
    else R(c, sx + 2, 133, 18, 12, '#0E1720');
    R(c, sx + 10, 130, 2, 18, '#101A24');
  }
  // 街面
  R(c, 0, 148, 320, 32, o.snow ? '#1C2A3A' : PAL.navy);
  R(c, 0, 147, 320, 1, o.snow ? '#2E4258' : PAL.dusk);
  if (o.snow) dith(c, 0, 148, 320, 10, '#1C2A3A', '#2A3C50', .45);
  else dith(c, 0, 150, 320, 6, PAL.navy, PAL.night, .5);
}
function lamp(c, x, y, k) {
  R(c, x, y - 26, 1, 26, PAL.ink);
  R(c, x - 1, y - 28, 3, 3, PAL.gold);
  if (k) glow(c, x, y - 27, 20, 17, PAL.gold, .34 * k);
}
function sc_town(c, t, o = {}) {
  townBase(c, t, o);
  lamp(c, 62, 150, o.lamps === false ? 0 : 1);
  lamp(c, 262, 150, o.lamps === false ? 0 : 1);
  if (o.snow) snow(c, t, 70, 'rgba(226,235,244,.75)');
  else rain(c, t, 90, 'rgba(120,153,180,.40)', 1);
}

// ---------- 房间 ----------
function sc_room(c, t, o = {}) {
  R(c, 0, 0, 320, 180, PAL.ink);
  R(c, 0, 24, 320, 128, o.dark ? '#141C28' : PAL.wall);
  for (let x = 0; x < 320; x += 12) R(c, x, 24, 1, 128, o.dark ? '#101823' : '#243141');
  R(c, 0, 152, 320, 28, o.dark ? '#141519' : PAL.floor);
  for (let x = -20; x < 340; x += 26) R(c, x, 152, 1, 28, PAL.floorDk);
  R(c, 0, 151, 320, 1, '#39404D');
  // 窗（内容裁剪在窗框内）
  const wx = 30, wy = 38, ww = 76, wh = 58;
  R(c, wx - 2, wy - 2, ww + 4, wh + 4, PAL.ink);
  c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip();
  R(c, wx, wy, ww, wh, o.dark ? '#0A1420' : '#132538');
  if (o.outside !== false) {
    let xx = wx - 6, s = 3;
    while (xx < wx + ww) { const w2 = 12 + (Math.abs(Math.sin(s * 5.1) * 100) % 8 | 0); house(c, xx, wy + 36, w2, 22, '#16283C', '#0F1D2C', s, .16, o.dark ? '#8A6A32' : PAL.gold, !o.dark); xx += w2 + 2; s++; }
    rain(c, t * .7, 26, 'rgba(120,153,180,.35)');
  }
  c.restore();
  R(c, wx + ww / 2 - 1, wy, 2, wh, PAL.ink);
  R(c, wx, wy + wh / 2 - 1, ww, 2, PAL.ink);
  // 床（右）
  R(c, 206, 118, 88, 30, '#26313F');
  R(c, 206, 118, 88, 7, '#39485A');
  R(c, 212, 125, 76, 18, '#1B2634');
  R(c, 206, 146, 88, 3, '#121A24');
  R(c, 266, 122, 24, 7, '#3A4A5C');
  // 桌
  R(c, 112, 128, 58, 3, '#3A3128');
  R(c, 114, 131, 3, 22, '#241E18'); R(c, 165, 131, 3, 22, '#241E18');
  // 台灯
  R(c, 132, 110, 2, 18, '#2A2A30');
  R(c, 124, 106, 18, 5, '#242A33');
  if (o.lamp) { glow(c, 133, 108, 48, 36, PAL.gold, .44); R(c, 124, 106, 18, 3, PAL.gold); }
  // 碗筷
  R(c, 118, 124, 9, 3, o.dark ? '#2C333C' : '#D9D3C4');
  R(c, 134, 124, 9, 3, o.dark ? '#2C333C' : '#D9D3C4');
  if (o.flowers) {
    R(c, 152, 114, 2, 14, '#3E4A3A');
    for (let i = 0; i < 5; i++) R(c, 149 + i * 2, 111 + (i % 2), 2, 2, i % 2 ? '#A8894E' : '#8FB0A0');
  }
  if (o.hairtie) {
    R(c, 288, 120, 5, 5, PAL.rose);
    glow(c, 290, 122, 13, 11, PAL.rose, .35 + Math.sin(t * 2) * .1);
  }
  if (o.dark) shadeRect(c, 0, 0, 320, 180, .3);
}

// ---------- 市集 ----------
function sc_market(c, t, o = {}) {
  townBase(c, t, o);
  // 摊位三顶（前景，比人高一点）
  const stalls = [[14, '#4A323C', '#33242C'], [122, '#45402E', '#302C20'], [232, '#2E3A46', '#212A34']];
  stalls.forEach((s, i) => {
    const x = s[0], y0 = 96, w = 64;
    // 棚顶（斜纹）
    for (let a = 0; a < w; a += 8) R(c, x + a, y0, 7, 10, s[1]);
    R(c, x, y0 + 10, w, 2, s[2]);
    R(c, x, y0 - 1, w, 1, '#7A6A4E');
    // 支柱
    R(c, x + 1, y0 + 12, 2, 42, '#1E2833'); R(c, x + w - 3, y0 + 12, 2, 42, '#1E2833');
    // 台面
    R(c, x, 138, w, 6, '#3A4A5C');
    R(c, x, 144, w, 12, '#1A222E');
    // 货
    for (let a = 0; a < 7; a++) {
      if (o.empty) R(c, x + 5 + a * 8, 135, 3, 3, '#5A5030');
      else R(c, x + 5 + a * 8, 134, 3, 4, i === 0 ? '#C8D2DC' : i === 1 ? '#C0A050' : '#7A8A9A');
    }
    if (!o.empty) { // 小灯
      R(c, x + w / 2, y0 + 12, 1, 6, '#3A2A1E');
      R(c, x + w / 2 - 1, y0 + 18, 3, 3, PAL.gold);
      glow(c, x + w / 2 + .5, y0 + 19, 16, 13, PAL.gold, .28);
    }
  });
  if (o.crowd) {
    const pos = [[92, 158], [104, 161], [198, 159], [214, 156], [296, 160], [8, 157]];
    pos.forEach((p, i) => {
      const bob = Math.sin(t * 1.6 + i) > 0 ? 0 : 1;
      R(c, p[0], p[1] - 26 + bob, 9, 26, '#1A2434');
      R(c, p[0] + 1, p[1] - 33 + bob, 7, 8, '#1A2434');
    });
  }
  if (o.snow) snow(c, t, 60, 'rgba(226,235,244,.7)'); else rain(c, t, 60, 'rgba(120,153,180,.34)', 1);
}

// ---------- 邮局 ----------
function sc_post(c, t, o = {}) {
  townBase(c, t, o);
  // 邮局立面
  R(c, 86, 62, 148, 86, '#1A232F');
  R(c, 84, 58, 152, 6, '#3A4A5C');
  R(c, 86, 62, 148, 1, '#42576C');
  // 柜台窗口
  R(c, 104, 82, 112, 46, '#0B131C');
  R(c, 104, 80, 112, 2, '#4A5F74');
  R(c, 104, 128, 112, 2, '#4A5F74');
  R(c, 158, 82, 2, 46, '#2A3A4A');
  // 柜台内：暖光 + 分信格 + 一个柜台人影
  R(c, 108, 86, 104, 38, '#241C14');
  glow(c, 160, 104, 60, 30, PAL.gold, .30);
  for (let i = 0; i < 5; i++) R(c, 116 + i * 20, 92, 14, 3, '#4A3A28');
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) R(c, 117 + i * 20 + j * 4, 97, 3, 6, '#D8D2C4');
  R(c, 150, 100, 12, 24, '#1A1410');      // 柜台后的肩影
  // 招牌横带
  R(c, 96, 64, 128, 12, '#0E1620');
  R(c, 96, 64, 128, 1, '#4A5F74');
  for (let x = 102; x < 218; x += 7) R(c, x, 68, 4, 4, '#6A7E92');
  // 邮筒
  R(c, 246, 110, 24, 40, '#243444');
  R(c, 246, 106, 24, 5, PAL.gold);
  R(c, 251, 120, 14, 3, '#0B1118');
  glow(c, 258, 108, 24, 18, PAL.gold, .24);
  R(c, 0, 150, 320, 30, '#1B2532');
  R(c, 0, 149, 320, 1, '#2E3E4E');
  if (o.snow) snow(c, t, 50, 'rgba(226,235,244,.65)'); else rain(c, t, 45, 'rgba(120,153,180,.30)', 1);
}

// ---------- 钟表店 ----------
function clockFace(c, x, y, r) {
  disc(c, x, y, r, '#0E1720');
  ring(c, x, y, r, '#4E5E6E');
  const hA = (9 + 7 / 60) / 12 * Math.PI * 2 - Math.PI / 2;
  const mA = 7 / 60 * Math.PI * 2 - Math.PI / 2;
  c.fillStyle = PAL.gold;
  for (let i = 0; i < r - 1; i++) c.fillRect(Math.round(x + Math.cos(hA) * i), Math.round(y + Math.sin(hA) * i), 1, 1);
  for (let i = 0; i < r; i++) c.fillRect(Math.round(x + Math.cos(mA) * i), Math.round(y + Math.sin(mA) * i), 1, 1);
  R(c, x, y, 1, 1, PAL.paper);
}
function sc_clock(c, t, o = {}) {
  townBase(c, t, o);
  if (o.inside) {
    R(c, 74, 44, 172, 106, '#241C18');
    R(c, 72, 42, 176, 3, '#3A2C22');
    for (let x = 76; x < 244; x += 12) R(c, x, 44, 1, 106, '#1C1512');
    [[96, 66, 8], [136, 62, 9], [180, 66, 8], [216, 62, 8], [112, 104, 7], [196, 104, 7], [152, 106, 6]].forEach(p => clockFace(c, p[0], p[1], p[2]));
    R(c, 74, 136, 172, 5, '#3A2C22');
    glow(c, 160, 54, 110, 50, PAL.gold, .10);
    R(c, 0, 150, 320, 30, '#2A211C');
  } else {
    R(c, 62, 46, 196, 100, '#0C141C');
    R(c, 60, 44, 200, 2, '#3A4A5A');
    R(c, 60, 146, 200, 2, '#3A4A5A');
    R(c, 96, 46, 2, 100, '#26343F'); R(c, 220, 46, 2, 100, '#26343F');
    [[106, 70, 9], [150, 66, 10], [196, 70, 9], [130, 112, 7], [176, 112, 7]].forEach(p => clockFace(c, p[0], p[1], p[2]));
    c.save(); c.globalAlpha = .09; c.fillStyle = '#B8D2E8';
    c.beginPath(); c.moveTo(66, 146); c.lineTo(130, 46); c.lineTo(158, 46); c.lineTo(94, 146); c.closePath(); c.fill(); c.restore();
    R(c, 0, 150, 320, 30, '#1B2532');
  }
  if (o.snow) snow(c, t, 40, 'rgba(226,235,244,.6)'); else rain(c, t, 36, 'rgba(120,153,180,.28)', 1);
}

// ---------- 车站 ----------
function sc_station(c, t, o = {}) {
  townBase(c, t, o);
  // 站牌屏
  R(c, 18, 50, 118, 56, '#0B131C');
  R(c, 18, 48, 118, 2, '#3E5266');
  R(c, 18, 106, 118, 2, '#3E5266');
  for (let x = 22; x < 132; x += 6) R(c, x, 44, 3, 4, '#2E4258');
  // 柱子
  R(c, 16, 108, 4, 42, '#22303E'); R(c, 142, 108, 4, 42, '#22303E');
  // 长椅
  R(c, 186, 132, 70, 5, '#2A3644');
  R(c, 190, 137, 4, 12, '#1E2833'); R(c, 248, 137, 4, 12, '#1E2833');
  R(c, 186, 124, 70, 8, '#22303E');
  lamp(c, 156, 150, 1);
  // 铁轨
  R(c, 0, 168, 320, 3, '#2A3A4A');
  for (let x = 6; x < 320; x += 10) R(c, x, 166, 2, 7, '#22303E');
  if (o.snow) snow(c, t, 60, 'rgba(226,235,244,.7)'); else rain(c, t, 50, 'rgba(120,153,180,.32)', 1);
}

// ---------- 酒馆 ----------
function sc_tavern(c, t, o = {}) {
  townBase(c, t, o);
  if (!o.inside) {
    R(c, 108, 58, 104, 92, '#1A1512');
    R(c, 112, 64, 96, 86, '#2A1F16');
    for (let y = 64; y < 150; y += 10) R(c, 112, y, 96, 1, '#241A12');
    R(c, 146, 96, 28, 54, '#0A0F16');
    R(c, 148, 98, 24, 52, '#3A2A1C');
    glow(c, 160, 124, 44, 38, PAL.gold, .26);
    // 门灯
    R(c, 154, 88, 1, 6, PAL.ink);
    R(c, 150, 84, 9, 4, PAL.gold);
    glow(c, 154, 86, 26, 20, PAL.gold, .3);
    // 招牌
    R(c, 120, 62, 80, 2, '#3A2C22');
  } else {
    R(c, 0, 24, 320, 126, '#241E1A');
    for (let x = 0; x < 320; x += 16) R(c, x, 24, 1, 126, '#1B1613');
    R(c, 0, 150, 320, 30, '#2E241C');
    R(c, 32, 106, 256, 5, '#3E3024');
    for (let i = 0; i < 4; i++) { R(c, 56 + i * 62, 94, 9, 12, '#5A4630'); R(c, 58 + i * 62, 92, 5, 2, '#6E5638'); }
    R(c, 160, 24, 1, 14, PAL.ink);
    R(c, 150, 38, 21, 5, '#3A2C20');
    glow(c, 160, 44, 80, 56, PAL.gold, .24);
    // 后墙酒架
    R(c, 228, 70, 56, 34, '#1A1410');
    for (let i = 0; i < 8; i++) R(c, 232 + (i % 4) * 13, 74 + Math.floor(i / 4) * 14, 4, 9, '#6A5638');
  }
  if (o.snow && !o.inside) snow(c, t, 50, 'rgba(226,235,244,.6)');
  else if (!o.inside) rain(c, t, 45, 'rgba(120,153,180,.28)', 1);
}

// ---------- 车厢 ----------
function sc_train(c, t, o = {}) {
  R(c, 0, 0, 320, 180, '#0A1119');
  R(c, 18, 34, 202, 94, '#0C1520');
  c.save(); c.beginPath(); c.rect(22, 38, 194, 86); c.clip();
  if (o.dawn) vgradS(c, 22, 38, 194, 86, '#93AAC0', '#E7EDF3');
  else {
    R(c, 22, 38, 194, 86, '#101E2C');
    let x = 16, s = 41;
    while (x < 320) { const w = 20 + (Math.abs(Math.sin(s * 4.7) * 100) % 12 | 0); house(c, x - t * 3 % 20, 96, w, 30, '#16283C', '#0F1D2C', s, .14, PAL.gold, true); x += w + 3; s++; }
  }
  c.restore();
  R(c, 18, 34, 202, 2, '#33465A');
  R(c, 18, 126, 202, 2, '#33465A');
  R(c, 117, 34, 2, 94, '#243444');
  R(c, 0, 132, 320, 48, '#1A1F28');
  R(c, 0, 128, 320, 4, '#2A3340');
  R(c, 222, 96, 78, 38, '#222A36');
  R(c, 222, 92, 78, 6, '#2E3846');
  R(c, 0, 22, 320, 8, '#1C2430');
  R(c, 268, 28, 12, 3, PAL.gold);
  glow(c, 274, 30, 34, 26, PAL.gold, .16);
}

// ---------- 站台告别 ----------
function sc_platform(c, t, o = {}) {
  vgradS(c, 0, 0, 320, 110, o.dawn ? '#6E8CA8' : PAL.ink, o.dawn ? '#E8EEF4' : '#16253A');
  if (!o.dawn) {
    let x = -8, s = 51;
    while (x < 330) { const w = 20 + (Math.abs(Math.sin(s * 5.1) * 100) % 12 | 0); house(c, x, 100, w, 30, '#101C28', '#0C1520', s, .08, PAL.haze, false); x += w + 2; s++; }
  }
  if (o.train) {
    R(c, 0, 92, 320, 58, o.dawn ? '#3E566E' : '#16222E');
    for (let x = 10; x < 320; x += 42) R(c, x, 100, 22, 24, o.dawn ? '#8FA7BE' : '#243444');
    R(c, 0, 92, 320, 3, o.dawn ? '#E4EDF5' : '#2A3A4A');
  }
  R(c, 0, 148, 320, 32, o.dawn ? '#C9D6E2' : '#1E2C3C');
  R(c, 0, 147, 320, 1, o.dawn ? '#E4EDF5' : '#38506A');
  R(c, 0, 170, 320, 3, o.dawn ? '#8FA3B8' : '#2A3A4A');
  if (!o.dawn) { lamp(c, 40, 148, 1); snow(c, t, 60, 'rgba(226,235,244,.7)'); }
}

// ---------- 角色 ----------
const NPC = {
  m:    { sex: 'm' },
  she:  { sex: 'f' },
  // 8 个 NPC 各有一套剪影：帽子 / 发型 / 胡子 / 眼镜 / 体态 全不同
  xiaoman: { sex: 'f', col: { coat: '#B08A4E', coatDk: '#7A5A32', inner: 'paper', hair: 'night', hairDk: 'ink', hairStyle: 'bun' },
             fig: { hat: 'straw' }, prop: ['apron', 'basket'] },
  afei: { sex: 'm', col: { coat: 'teal', coatDk: '#2A4A50', inner: 'paper', hairStyle: 'short' },
          fig: { hat: 'newsboy', hatCol: '#3E5A6A', hatColDk: '#22303C' }, prop: ['satchel'] },
  chen: { sex: 'm', col: { coat: '#4A4A52', coatDk: '#2A2A30', hair: '#B9B4A6', hairDk: '#8A8578', hairStyle: 'short' },
          fig: { beard: 2, beardCol: '#CFCABA', glasses: true, scarf: 'rgba(92,104,116,.95)', scarfDk: 'rgba(64,74,84,.95)' }, prop: ['hunch'] },
  zhou: { sex: 'm', col: { coat: 'haze', coatDk: '#5A4636', inner: 'paper', hairStyle: 'short' },
          fig: { belly: 1, hat: 'knit', hatCol: '#D8D2C4', hatColDk: '#A9A290' }, prop: ['apron'] },
  qiao: { sex: 'm', col: { coat: '#6A4A3A', coatDk: '#3A2A22', inner: 'paper', hairStyle: 'short' },
          fig: { beard: 1, belly: 1 }, prop: ['apron'] },
  piao: { sex: 'f', col: { coat: 'navy', inner: 'paper', hair: 'night', hairStyle: 'bob' },
          fig: { hat: 'uniform', hatCol: '#24384A', hatColDk: '#101C26' }, prop: [] },
  kid:  { sex: 'f', col: { coat: 'rose', coatDk: '#8A3040', inner: 'paper', hairStyle: 'braid' },
          fig: { hat: 'knit', hatCol: '#B0433F', hatColDk: '#7A2A2A' }, sz: .84 },
  keeper: { sex: 'm', col: { coat: '#3A4A3E', inner: 'pale', hairStyle: 'short' },
            fig: { hat: 'brim', hatCol: '#2A3038', hatColDk: '#161A20', beard: 1, beardCol: '#8A8578', scarf: '#5A4048' }, prop: ['lantern'] },
};
function npc(c, id, x, gy, S, o = {}) {
  const d = NPC[id] || NPC.m;
  const sz = o.sz || d.sz || 1;
  const opt = { sex: d.sex, ...(d.fig || {}), ...o, col: { ...(d.col || {}), ...(o.col || {}) } };
  if (d.prop === 'hunch' || (Array.isArray(d.prop) && d.prop.indexOf('hunch') >= 0)) opt.lean = -.05;
  figure(c, x, gy, S * sz, opt);
  const props = Array.isArray(d.prop) ? d.prop : (d.prop ? [d.prop] : []);
  props.forEach(pr => {
    if (pr === 'cap') { R(c, x - 4, gy - 39, 9, 2, PAL.ink); }
    if (pr === 'lantern') { R(c, x + 8, gy - 12, 1, 10, PAL.ink); R(c, x + 6, gy - 6, 5, 6, PAL.gold); glow(c, x + 8, gy - 3, 20, 16, PAL.gold, .4); }
    if (pr === 'apron') { R(c, x - 4, gy - 18, 9, 14, 'rgba(240,236,226,.82)'); }
    if (pr === 'basket') {   // 花篮
      R(c, x + 7, gy - 9, 8, 6, '#8A6A32');
      R(c, x + 7, gy - 10, 8, 1, '#6A4E22');
      R(c, x + 8, gy - 13, 2, 3, PAL.rose); R(c, x + 11, gy - 14, 2, 4, PAL.paper); R(c, x + 14, gy - 12, 2, 2, '#E8A0AC');
      R(c, x + 8, gy - 15, 1, 2, '#4A6A3E'); R(c, x + 12, gy - 16, 1, 2, '#4A6A3E');
    }
    if (pr === 'satchel') {  // 邮包 + 背带
      R(c, x - 9, gy - 18, 6, 7, '#4A3A2A');
      R(c, x - 9, gy - 18, 6, 1, '#6A5A46');
      R(c, x - 4, gy - 19, 1, 3, '#3A2E22');
      R(c, x - 3, gy - 26, 1, 9, '#3A2E22');
    }
  });
}
function dog(c, x, gy, t) {
  const wag = Math.sin(t * 8) > 0 ? 1 : 0;
  R(c, x, gy - 6, 11, 5, '#6A5A46');
  R(c, x + 9, gy - 9, 6, 6, '#6A5A46');
  R(c, x + 13, gy - 7, 2, 1, '#3A2E22');
  R(c, x + 1, gy - 1, 2, 1, '#3A2E22'); R(c, x + 7, gy - 1, 2, 1, '#3A2E22');
  R(c, x - 2, gy - 9 + wag, 2, 4, '#6A5A46');
}

// ---------- 道具 ----------
function umbrella(c, x, gy, S, dx) {
  dx = dx || 0;
  c.fillStyle = PAL.gold;
  for (let i = -26; i <= 26; i++) {
    const h = Math.round(Math.sqrt(Math.max(0, 676 - i * i)) * .42);
    c.fillRect(Math.round(x + dx + i * S), gy - 44 * S - h, S, h + 2);
  }
  R(c, x + dx - 1, gy - 44 * S, 3, 46 * S, '#8A6A32');
}
function letter(c, x, y) {
  R(c, x, y, 12, 8, PAL.paper);
  R(c, x, y, 12, 1, '#C8C2B4');
  c.fillStyle = '#B8B2A4';
  for (let i = 0; i < 6; i++) c.fillRect(x + 1 + i, y + 1 + i, 1, 1);
}
function watch(c, x, y) {
  disc(c, x, y, 5, '#C8B27A');
  disc(c, x, y, 3, '#0E1720');
  R(c, x, y - 3, 1, 3, PAL.gold);
  R(c, x, y, 2, 1, PAL.gold);
}

// ============================================================
//  文字数据：歌词字幕 / NPC 对话 / 括号泡 / 计数器
// ============================================================
const SUBS = [
  { t0: 38.40, t1: 42.60, text: '开了灯 眼前的模样', kw: ['开了灯'] },
  { t0: 42.77, t1: 47.20, text: '偌大的房 寂寞的床', kw: ['寂寞'] },
  { t0: 50.99, t1: 55.45, text: '关了灯 全都一个样', kw: ['关了灯'] },
  { t0: 55.37, t1: 61.40, text: '心里的伤 无法分享', kw: ['伤'] },
  { t0: 61.56, t1: 67.40, text: '生命 随年月流去 随白发老去', kw: ['白发', '老去'] },
  { t0: 69.10, t1: 74.90, text: '随着你离去 快乐渺无音讯', kw: ['离去'] },
  { t0: 75.81, t1: 81.10, text: '随往事淡去 随梦境睡去', kw: ['往事', '睡去'] },
  { t0: 81.74, t1: 86.30, text: '随麻痹的心逐渐远去', kw: ['远去'] },
  { t0: 86.53, t1: 92.90, text: '我好想你 好想你', kw: ['想你', '好想你'], size: 96 },
  { t0: 93.01, t1: 98.90, text: '却不露痕迹', kw: ['痕迹'] },
  { t0: 99.57, t1: 105.40, text: '我还踮着脚思念', kw: ['思念'] },
  { t0: 105.91, t1: 111.70, text: '我还任记忆盘旋', kw: ['记忆'] },
  { t0: 112.26, t1: 118.00, text: '我还闭着眼流泪', kw: ['流泪'] },
  { t0: 118.45, t1: 124.30, text: '我还装作无所谓', kw: ['无所谓'] },
  { t0: 124.36, t1: 129.10, text: '我好想你 好想你', kw: ['想你', '好想你'], size: 96 },
  { t0: 130.97, t1: 133.60, text: '却欺骗自己', kw: ['欺骗'] },
  { t0: 164.77, t1: 169.00, text: '开了灯 眼前的模样', kw: ['开了灯'] },
  { t0: 169.02, t1: 176.80, text: '偌大的房 寂寞的床', kw: ['寂寞'] },
  { t0: 177.32, t1: 181.40, text: '关了灯 全都一个样', kw: ['关了灯'] },
  { t0: 181.59, t1: 187.90, text: '心里的伤 无法分享', kw: ['伤'] },
  { t0: 188.01, t1: 195.30, text: '生命 随年月流去 随白发老去', kw: ['白发', '老去'] },
  { t0: 195.41, t1: 202.00, text: '随着你离去 快乐渺无音讯', kw: ['离去'] },
  { t0: 202.11, t1: 208.00, text: '随往事淡去 随梦境睡去', kw: ['往事', '睡去'] },
  { t0: 208.10, t1: 212.70, text: '随麻痹的心逐渐远去', kw: ['远去'] },
  { t0: 212.82, t1: 219.10, text: '我好想你 好想你', kw: ['想你', '好想你'], size: 96 },
  { t0: 219.33, t1: 225.30, text: '却不露痕迹', kw: ['痕迹'] },
  { t0: 225.92, t1: 231.60, text: '我还踮着脚思念', kw: ['思念'] },
  { t0: 232.16, t1: 237.90, text: '我还任记忆盘旋', kw: ['记忆'] },
  { t0: 238.38, t1: 244.20, text: '我还闭着眼流泪', kw: ['流泪'] },
  { t0: 244.78, t1: 250.40, text: '我还装作无所谓', kw: ['无所谓'] },
  { t0: 253.93, t1: 260.00, text: '我好想你 好想你', kw: ['想你', '好想你'], size: 96 },
  { t0: 260.41, t1: 266.30, text: '却欺骗自己', kw: ['欺骗'] },
  { t0: 266.50, t1: 272.70, text: '我好想你 好想你', kw: ['想你', '好想你'], size: 96 },
  { t0: 272.98, t1: 279.00, text: '就当作秘密', kw: ['秘密'] },
  { t0: 279.10, t1: 285.30, text: '我好想你 好想你', kw: ['想你', '好想你'], size: 96 },
  { t0: 285.74, t1: 291.60, text: '就深藏在心', kw: ['深藏'] },
];

// NPC 对话（金边框 + 打字机）；opts 有选项支
const DLG = [
  { t0: 65.30, t1: 69.00, who: '小满', text: '今天的雏菊很新鲜哦。', opts: ['买一束', '算了'], sel: 0 },
  { t0: 70.70, t1: 75.60, who: '阿飞', text: '有你的信吗？……没有。' },
  { t0: 76.60, t1: 81.60, who: '陈伯', text: '（没抬头）别催，慢工才准。' },
  { t0: 119.10, t1: 124.20, who: '大乔', text: '老样子？' },
  { t0: 165.60, t1: 170.20, who: '我', text: '我回来了。', self: true },
  { t0: 182.70, t1: 188.00, who: '老周', text: '出炉了，刚出炉。……她以前也爱等第一炉。' },
  { t0: 196.10, t1: 202.00, who: '阿飞', text: '今天也没有哦。' },
  { t0: 202.90, t1: 208.20, who: '陈伯', text: '修不好了。有些东西停下来，是它自己不肯走。' },
  { t0: 220.10, t1: 225.30, who: '小孩', text: '哥哥，你哭过吗？' },
  { t0: 245.30, t1: 250.50, who: '大乔', text: '两杯？' },
  { t0: 254.70, t1: 260.10, who: '售票员', text: '去哪？', opts: ['小镇外面', '她去过的地方'], sel: 0 },
  { t0: 292.20, t1: 295.70, who: '系统', text: '是否保存当前进度？', opts: ['是', '否'], sel: 0, sys: true },
  { t0: 296.60, t1: 302.00, who: '系统', text: '检测到未寄出的信 ×1。是否同时保存？', opts: ['是', '否'], sel: 0, sys: true },
  { t0: 302.40, t1: 308.30, who: '系统', text: '已保存。', sys: true },
];

// 括号泡（没说出口的话）
const THINK = [
  { t0: 72.90, t1: 75.90, text: '（有一封，我一直没敢寄。）', x: 300, y: 300 },
  { t0: 170.70, t1: 173.00, text: '（习惯是戒不掉的。）', x: 360, y: 300 },
  { t0: 198.60, t1: 202.00, text: '（差一点就寄了。）', x: 300, y: 300 },
  { t0: 204.40, t1: 208.20, text: '（那你为什么还修？）', x: 300, y: 300 },
  { t0: 222.40, t1: 225.30, text: '（没有。是雪化了。）', x: 300, y: 300 },
];

// 计数器关键帧
const CNT = [
  [0, 0], [15.6, 0], [65.2, 1], [71.2, 2], [77.2, 3], [83.6, 4], [92.0, 5],
  [130.0, 5], [133.0, 102], [184.5, 103], [199.0, 104], [212.0, 500], [221.0, 570],
  [268.0, 1095], [302.4, 1095],
];
function cntAt(t) {
  if (t < CNT[0][0]) return 0;
  for (let i = 0; i < CNT.length - 1; i++) {
    if (t >= CNT[i][0] && t < CNT[i + 1][0]) {
      const p = (t - CNT[i][0]) / Math.max(.001, CNT[i + 1][0] - CNT[i][0]);
      return Math.round(CNT[i][1] + (CNT[i + 1][1] - CNT[i][1]) * p);
    }
  }
  return 1095;
}

// ============================================================
//  高清层：所有中文都画在这里（320 层画会糊）
// ============================================================
function txt(c, s, x, y, size, col, alpha, ls, align) {
  c.save();
  c.globalAlpha = alpha == null ? 1 : alpha;
  c.font = `${size}px KT, XK, serif`;
  c.fillStyle = col;
  c.textAlign = align || 'left';
  c.textBaseline = 'alphabetic';
  if (!ls) { c.fillText(s, x, y); c.restore(); return; }
  const chars = [...s];
  let w = 0; for (const ch of chars) w += c.measureText(ch).width + ls;
  let cx = align === 'center' ? x - (w - ls) / 2 : (align === 'right' ? x - (w - ls) : x);
  for (const ch of chars) { const cw = c.measureText(ch).width; c.fillText(ch, cx, y); cx += cw + ls; }
  c.restore();
}
function band(c, x, y, w, h, col, a) {
  c.save(); c.globalAlpha = a; c.fillStyle = col; c.fillRect(x, y, w, h); c.restore();
}
function frame(c, x, y, w, h, col, a, t) {
  c.save(); c.globalAlpha = a; c.fillStyle = col;
  const t2 = t || 2;
  c.fillRect(x, y, w, t2); c.fillRect(x, y + h - t2, w, t2);
  c.fillRect(x, y, t2, h); c.fillRect(x + w - t2, y, t2, h);
  c.restore();
}

function hud(c, W, H, t) {
  const Y = y => y * 6;
  const BAYER4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

  // ---------- S01 黑场判词 ----------
  if (t < 6.12) {
    const k = HZ((t - .55) / 1.5), a = Math.min(1, HZ((6.12 - t) / .5));
    const lw = HZ((t - .35) / .9) * 620;
    band(c, W / 2 - lw / 2, H * .40, lw, 2, PAL.pale, a * .34);
    band(c, W / 2 - lw / 2, H * .68, lw, 2, PAL.pale, a * .34);
    const s1 = '第 1095 天。';
    const n1 = Math.round([...s1].length * k);
    txt(c, [...s1].slice(0, n1).join(''), W / 2, H * .565, 128, PAL.paper, a, 16, 'center');
    const k2 = HZ((t - 2.0) / 1.2);
    if (k2 > 0) {
      const s2 = '他数错了。其实是第 1096 天。';
      txt(c, [...s2].slice(0, Math.round([...s2].length * k2)).join(''), W / 2, H * .745, 40, 'rgba(201,198,221,.80)', a, 6, 'center');
    }
    txt(c, 'SAVE 01 / 1095 DAYS', 92, 108, 24, 'rgba(201,198,221,.45)', a, 3);
  }

  // ---------- S02 存档界面 ----------
  if (t >= 6.12 && t < 12.4167) {
    const lt = t - 6.12, a = Math.min(1, lt / .6) * Math.min(1, HZ((12.4167 - t) / .35));
    const blink = Math.floor(lt * 2.2) % 2 === 0;
    txt(c, 'L O A D   G A M E', W / 2, 132, 30, 'rgba(201,198,221,.62)', a, 0, 'center');
    const rows = [['第 0 天 · 有她的雨夜', '1095 DAYS AGO'], ['——— 空 ———', 'NO DATA'], ['——— 空 ———', 'NO DATA']];
    [[40, 36], [88, 36], [136, 36]].forEach((s, i) => {
      const baseY = Y(s[0]) + Y(s[1]) / 2 + 12, live = i === 0;
      txt(c, rows[i][0], W * .14, baseY, live ? 40 : 32, live ? PAL.paper : 'rgba(120,153,180,.45)', a, live ? 3 : 4);
      txt(c, rows[i][1], W * .92, baseY, live ? 22 : 20, live ? 'rgba(255,209,102,.85)' : 'rgba(120,153,180,.30)', a, 3, 'right');
    });
    txt(c, blink ? '▶  读档' : '   读档', W * .92, Y(168), 30, blink ? PAL.gold : 'rgba(255,209,102,.35)', a * .95, 4, 'right');
  }

  // ---------- S03 标题砸落 ----------
  if (t >= 12.4167 && t < 15.59) {
    const lt = t - 12.4167;
    const p = Math.min(1, lt / .22), gs = 1.55 - .55 * (1 - Math.pow(1 - p, 3));
    const out = HZ((15.59 - t) / .45);
    const gr = c.createLinearGradient(0, H * .30, 0, H * .72);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.5, 'rgba(5,8,13,.92)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    band(c, 0, H * .28, W, H * .46, gr, .22 * out);
    c.save(); c.globalAlpha = out; c.translate(W / 2, H * .50); c.scale(gs, gs);
    c.font = '196px XK, KT, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#0B1119';
    for (const [dx, dy] of [[-6, 0], [6, 0], [0, -6], [0, 6], [-4, -4], [4, -4], [-4, 4], [4, 4]]) c.fillText('我好想你', dx, dy);
    c.fillStyle = PAL.paper; c.fillText('我好想你', 0, 0);
    c.restore();
    const k3 = HZ((lt - .45) / .6);
    if (k3 > 0) txt(c, 'I   M I S S   Y O U', W / 2, H * .645, 26, 'rgba(255,209,102,.75)', k3 * out, 6, 'center');
  }

  // ---------- HUD 三件套（15.6 之后全程） ----------
  if (t >= 15.59) {
    const a = Math.min(1, HZ((t - 16.1) / .9));
    if (a > 0) {
      const snow = t >= 133.0, dawn = t >= 317.5;
      const day = t >= 320 ? 1096 : 1095;
      band(c, 72, 82, 320, 84, 'rgba(8,13,20,.80)', a * .8);
      band(c, 84, 94, 3, 30, PAL.gold, a * .9);
      txt(c, '第 ' + day + ' 天', 104, 122, 30, 'rgba(230,238,246,.94)', a, 4);
      txt(c, dawn ? '晴' : snow ? '雪' : '雨', 104, 152, 22, 'rgba(150,178,204,.80)', a, 4);

      // 计数器：1095 之后碎裂成「已寄存 ×1」
      const shatter = HZ((t - 302.4) / 1.4);
      band(c, W - 392, 76, 320, 92, 'rgba(8,13,20,.80)', a * .8);
      if (shatter < .55) {
        txt(c, '未 说 出 口', W - 112, 108, 24, 'rgba(170,196,220,.88)', a, 4, 'right');
        const n = cntAt(t);
        txt(c, '× ' + String(n).padStart(4, '0'), W - 112, 154, 44, PAL.gold, a * (1 - shatter), 4, 'right');
      } else {
        txt(c, '已  寄  存', W - 112, 108, 24, 'rgba(255,209,102,.92)', a, 4, 'right');
        txt(c, '× 1', W - 112, 154, 44, PAL.gold, a * HZ((shatter - .55) / .3), 4, 'right');
      }
    }
  }

  // ---------- 车站屏（green → red） ----------
  if (t >= 118 && t < 133.7) {
    const a = Math.min(1, HZ((t - 118) / .5)) * Math.min(1, HZ((133.7 - t) / .4));
    const gone = t >= 124.47;
    const col = gone ? '#E8556D' : '#6FD3A8';
    const bx = 22 * 6, by = 50 * 6, bw = 110 * 6, bh = 54 * 6;
    band(c, bx, by, bw, bh, 'rgba(6,10,16,.55)', a);
    txt(c, '末班车  21:10', bx + bw / 2, by + 70, 34, 'rgba(201,198,221,.88)', a, 2, 'center');
    const sz = gone ? 52 : 40;
    txt(c, gone ? '已 发 车' : '检 票 中', bx + bw / 2, by + 150, sz, col, a, 4, 'center');
    if (gone) txt(c, '— — —', bx + bw / 2, by + 200, 24, 'rgba(232,85,109,.6)', a * .8, 6, 'center');
    else txt(c, 'PLATFORM 2', bx + bw / 2, by + 196, 20, 'rgba(111,211,168,.72)', a * .8, 4, 'center');
  }

  // ---------- 背包 ----------
  if (t >= 55.37 && t < 61.56) {
    const a = Math.min(1, HZ((t - 55.5) / .5)) * Math.min(1, HZ((61.56 - t) / .3));
    txt(c, '背 包', 60, 96, 26, 'rgba(201,198,221,.7)', a, 5);
    txt(c, '未寄出的信 ×1', 216, 96, 30, PAL.paper, a, 2);
    txt(c, '她的发圈 ×1', 216, 258, 30, 'rgba(180,196,214,.55)', a, 2);
    txt(c, '（灰字 · 不可用）', 216, 296, 20, 'rgba(150,178,204,.55)', a, 2);
    txt(c, '▶', 84, 330, 26, PAL.gold, a, 0);
  }
  if (t >= 279.18 && t < 285.49) {
    const a = Math.min(1, HZ((t - 279.3) / .5)) * Math.min(1, HZ((285.49 - t) / .3));
    txt(c, '背 包', 60, 96, 26, 'rgba(201,198,221,.7)', a, 5);
    txt(c, '未寄出的信', 100, 330, 26, PAL.paper, a * .95, 2);
    txt(c, '她的发圈', 452, 330, 26, PAL.paper, a * .95, 2);
    txt(c, '停摆的怀表', 800, 330, 26, PAL.paper, a * .95, 2);
    txt(c, '（三样，都还在。）', W / 2, 920, 28, 'rgba(180,196,214,.7)', a * .9, 3, 'center');
  }

  // ---------- 车票特写（S46：票面内容文字化） ----------
  if (t >= 260.2 && t < 266.52) {
    const lt = t - 260.2;
    const out = Math.min(1, HZ((266.52 - t) / .3));
    const L = (d, dr) => Math.min(1, HZ((lt - d) / dr)) * out;
    const cx = 960;
    // 头部（印刷体）
    txt(c, '小 镇 长 途 · 单 程', cx, 296, 30, '#5E594C', L(.45, .4), 6, 'center');
    // 开往
    txt(c, '开往：她住过的城市', 436, 478, 34, '#3E3A2E', L(.9, .4), 3);
    // 日期：印刷 + 红笔涂改
    txt(c, '日期', 436, 606, 26, '#6A6558', L(1.4, .35), 3);
    txt(c, '第 0 天', 600, 608, 30, '#3E3A2E', L(1.4, .35), 3);
    // 划掉印刷日期的红笔道
    const sk = Math.min(1, Math.max(0, (lt - 2.0) / .35));
    if (sk > 0) band(c, 594, 596, 178 * sk, 5, '#B0433F', .92 * out);
    // 手写「第 1095 天」（逐字 + 抖动）
    const hw = '第 1095 天', hcs = [...hw];
    hcs.forEach((ch, i) => {
      const a = Math.min(1, HZ((lt - 2.15 - i * .13) / .12)) * out;
      if (a > 0 && ch !== ' ') txt(c, ch, 588 + i * 36, 672 + ((i * 37) % 5) - 2, 30, '#B0433F', a, 1);
    });
    // 发车 / 座号
    txt(c, '发车：21:10', 436, 788, 26, '#3E3A2E', L(2.9, .35), 2);
    txt(c, '座号：21 – 07', 906, 788, 26, '#3E3A2E', L(3.1, .35), 2);
    // 底部小字
    txt(c, 'ONE WAY · 检票后作废', cx, 852, 18, '#8A8578', L(3.4, .4), 4, 'center');
    // 「改」字红章（斜盖）
    const sa = Math.min(1, HZ((lt - 2.6) / .18)) * out;
    if (sa > 0) {
      c.save(); c.translate(1170, 330); c.rotate(-.18);
      c.globalAlpha = sa * .85; c.strokeStyle = '#B0433F'; c.lineWidth = 4;
      c.strokeRect(-38, -38, 76, 76); c.strokeRect(-32, -32, 64, 64);
      c.fillStyle = '#B0433F'; c.font = '46px KT, XK, serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('改', 0, 4);
      c.restore();
    }
  }

  // ---------- 结局文案 ----------
  if (t >= 291.81 && t < 295.76) {
    const a = Math.min(1, HZ((t - 291.95) / .35));
    txt(c, '是 否 保 存 当 前 进 度 ？', W / 2, 400, 44, 'rgba(234,240,246,.95)', a, 4, 'center');
    txt(c, '▶ 是', W / 2 - 160, 520, 36, PAL.gold, a, 4, 'center');
    txt(c, '否', W / 2 + 160, 520, 36, 'rgba(150,178,204,.6)', a, 4, 'center');
    txt(c, 'SAVE 02 / NOW', 92, 108, 22, 'rgba(201,198,221,.45)', a, 3);
  }
  if (t >= 302.08 && t < 308.39) {
    const a = Math.min(1, HZ((t - 302.2) / .4)) * Math.min(1, HZ((308.39 - t) / .4));
    txt(c, '已 保 存', W / 2, 470, 52, PAL.gold, a, 8, 'center');
    txt(c, '存档位置：心里（1/1）', W / 2, 530, 26, 'rgba(201,198,221,.72)', a, 3, 'center');
  }
  if (t >= 308.39 && t < 313.3) {
    const a = Math.min(1, HZ((t - 308.9) / .8));
    // 三个气泡，都写着同一句
    [[250, 430], [610, 470], [980, 430], [1330, 470]].forEach((p, i) => {
      const k = HZ((t - 309.0 - i * .28) / .5);
      if (k <= 0) return;
      const s = '一路顺风。';
      c.save(); c.globalAlpha = k * .96;
      c.font = '28px KT, serif';
      const tw = c.measureText(s).width + 40;
      c.fillStyle = 'rgba(244,240,230,.92)';
      c.fillRect(p[0], p[1], tw, 56);
      c.fillStyle = 'rgba(10,14,20,.9)'; c.fillRect(p[0], p[1], tw, 2);
      c.fillRect(p[0], p[1] + 54, tw, 2);
      c.restore();
      txt(c, s, p[0] + 20, p[1] + 40, 28, 'rgba(20,26,34,.92)', k, 3);
    });
  }
  if (t >= 323.0) {
    const k = HZ((t - 323.4) / 1.4), a = Math.min(1, HZ((329.21 - t) / 1.2));
    txt(c, [...'第 1096 天。'].slice(0, Math.round([...'第 1096 天。'].length * k)).join(''), W / 2, H * .50, 96, PAL.paper, a, 12, 'center');
    const k2 = HZ((t - 325.4) / 1.2);
    if (k2 > 0) txt(c, '他终于没有数错。', W / 2, H * .63, 34, 'rgba(201,198,221,.75)', a, 8, 'center');
  }

  // ---------- NPC 对话（金边框 + 打字机） ----------
  for (const d of DLG) {
    if (t < d.t0 || t >= d.t1) continue;
    const lt = t - d.t0, dur = d.t1 - d.t0;
    const a = Math.min(1, lt / .2) * Math.min(1, HZ((d.t1 - t) / .25));
    const k = Math.min(1, Math.max(0, (lt - .12) / Math.min(1.8, dur * .55)));
    const bx = 110, by = H * .655, bw = W - 220, bh = 136;
    band(c, bx, by, bw, bh, 'rgba(10,14,20,.90)', a);
    frame(c, bx, by, bw, bh, d.sys ? '#8FB8D8' : '#F0D3AC', a * .85, 2);
    // 名字标签
    const nameCol = d.sys ? '#8FB8D8' : d.self ? '#F0D3AC' : PAL.gold;
    band(c, bx + 24, by - 40, Math.max(120, [...d.who].length * 32 + 40), 40, 'rgba(10,14,20,.95)', a);
    frame(c, bx + 24, by - 40, Math.max(120, [...d.who].length * 32 + 40), 40, nameCol, a * .7, 2);
    txt(c, d.who, bx + 44, by - 8, 26, nameCol, a, 3);
    // 正文（打字机）
    const chars = [...d.text];
    const n = Math.round(chars.length * k);
    txt(c, chars.slice(0, n).join(''), bx + 44, by + 84, 34, d.self ? '#F6E4C8' : PAL.paper, a, 2);
    // 打字机光标
    if (k < 1 && Math.floor(t * 6) % 2 === 0) {
      c.save(); c.globalAlpha = a;
      c.font = '34px KT, serif';
      let cw = 0; for (const ch of chars.slice(0, n)) cw += c.measureText(ch).width + 2;
      c.fillStyle = PAL.gold; c.fillRect(bx + 44 + cw + 4, by + 56, 14, 32);
      c.restore();
    }
    // 选项支
    if (d.opts && k > .6) {
      const ox = bx + bw - 380, oy = by - 40;
      d.opts.forEach((o, i) => {
        const on = i === d.sel;
        const w2 = 160, x2 = ox + i * 176;
        band(c, x2, oy, w2, 44, on ? 'rgba(255,209,102,.16)' : 'rgba(10,14,20,.85)', a);
        frame(c, x2, oy, w2, 44, on ? PAL.gold : 'rgba(150,178,204,.45)', a * .9, 2);
        txt(c, (on ? '▶ ' : '   ') + o, x2 + 20, oy + 32, 24, on ? PAL.gold : 'rgba(180,196,214,.7)', a, 2);
      });
    }
  }

  // ---------- 括号泡（没说出口的话） ----------
  for (const th of THINK) {
    if (t < th.t0 || t >= th.t1) continue;
    const lt = t - th.t0;
    const k = HZ(lt / .6), a = Math.min(1, lt / .25) * Math.min(1, HZ((th.t1 - t) / .3));
    const bx = Math.max(60, Math.min(W - 620, th.x));
    const by = th.y;
    c.save(); c.globalAlpha = a * .95;
    c.font = '30px KT, serif';
    const tw = Math.min(600, c.measureText(th.text).width + 56);
    c.fillStyle = 'rgba(226,235,244,.92)';
    c.fillRect(bx, by, tw, 62);
    c.fillStyle = 'rgba(120,153,180,.55)';
    c.fillRect(bx, by, tw, 2); c.fillRect(bx, by + 60, tw, 2);
    c.fillRect(bx, by, 2, 62); c.fillRect(bx + tw - 2, by, 2, 62);
    // 尾巴
    c.beginPath(); c.moveTo(bx + 40, by + 62); c.lineTo(bx + 56, by + 62); c.lineTo(bx + 42, by + 82); c.fill();
    c.restore();
    txt(c, th.text, bx + 28, by + 44, 30, 'rgba(20,30,42,.95)', a * k, 2);
  }
}

// ============================================================
//  分镜 57 镜 · 全曲 329s
// ============================================================
const GY = { town: 150, room: 152, market: 154, post: 152, clock: 156, station: 148, tavern: 156, train: 170, plat: 148 };
// 对话镜头的取景：把人物放在画面上 2/3，腿被对话框挡住
const DCAM = (cx, d) => CAM(d, { z0: 1.55, z1: 1.66, cx0: cx, cy0: 122 });

function duotone(c, dark, light, thr = .40) {
  const img = c.getImageData(0, 0, 320, 180), d = img.data;
  const A = hex2rgb(dark), B = hex2rgb(light);
  for (let i = 0; i < d.length; i += 4) {
    const l = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255;
    const on = l > thr;
    d[i] = on ? B[0] : A[0]; d[i + 1] = on ? B[1] : A[1]; d[i + 2] = on ? B[2] : A[2];
  }
  c.putImageData(img, 0, 0);
}
const BR = (t, k = 1) => Math.sin(t * 1.9) > 0 ? 0 : k;
const WK = (t, sp = 7) => t * sp;

let OFF5 = null;
function off5() {
  if (!OFF5) { OFF5 = document.createElement('canvas'); OFF5.width = 320; OFF5.height = 180; }
  const g = OFF5.getContext('2d');
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, 320, 180);
  return g;
}

window.SPEC = {
  fps: 24, duration: 329.21, fadeIn: 1.2, fadeOut: 1.6,
  grade: 'brightness(1.10) saturate(1.02) contrast(1.10)',
  cover: 'A',

  shots: [
    // ================= 序幕 =================
    { t0: 0, t1: 6.12, scene: 'black', cam: false, vig: .7,
      draw(pc) { R(pc, 0, 0, 320, 180, PAL.ink); } },

    { t0: 6.12, t1: 12.4167, scene: 'save', cam: false, vig: .55,
      in: { type: 'dither', dur: .7 },
      draw(pc, lt) { saveScreen(pc, lt); } },

    { t0: 12.4167, t1: 15.59, scene: 'town', zs: 1, vig: .62, cast: '#4C7FB0', castA: .10,
      in: { type: 'flash', dur: .10, amt: 1 },
      cam: (() => {
        const sh = SHAKE(.55, 5);
        return lt => {
          const b = CAM(3.16, { z0: 1.02, z1: 1.12, cx0: 160, cy0: 96 })(lt);
          if (lt > .6) return b;
          const s = sh(lt);
          return [b[0] + s[0] * .55, b[1] + s[1] * .55, b[2], b[3]];
        };
      })(),
      draw(pc, lt, shot, t) {
        const g = off5(); sc_town(g, t); rosec(g);
        pc.drawImage(OFF5, 0, 0);
        shadeRect(pc, 0, 0, 320, 180, .84);
        const p = Math.min(1, Math.max(0, (lt - .06) / .62)), thr = p * 1.10;
        for (let by = 0; by < 180; by += 5) for (let bx = 0; bx < 320; bx += 5) {
          const o = (by / 180) * .88 + (BAYER[(by / 5) & 3][(bx / 5) & 3] / 16) * .12;
          if (o < thr - .035) pc.drawImage(OFF5, bx, by, 5, 5, bx, by, 5, 5);
          else if (o < thr) { pc.drawImage(OFF5, bx, by, 5, 5, bx, by, 5, 5); pc.save(); pc.globalAlpha = .28; pc.fillStyle = PAL.gold; pc.fillRect(bx, by, 5, 5); pc.restore(); }
          else if (o < thr + .010) { pc.drawImage(OFF5, bx, by, 5, 5, bx, by, 5, 5); pc.save(); pc.globalAlpha = .92; pc.fillStyle = PAL.gold; pc.fillRect(bx, by, 5, 5); pc.restore(); }
        }
        if (lt > .68) rain(pc, t, 50, 'rgba(120,153,180,.35)', 1);
      } },

    { t0: 15.59, t1: 21.9, scene: 'town', zs: 1, vig: .58,
      in: { type: 'dither', dur: .6 },
      cam: CAM(6.31, { z0: 1.22, z1: 1.02, cx0: 168, cy0: 100 }),
      draw(pc, lt, shot, t) { sc_town(pc, t); rosec(pc); shadeRect(pc, 0, 160, 320, 20, .45); } },

    { t0: 21.9, t1: 28.21, scene: 'town', zs: 1,
      cam: CAM(6.31, { z0: 1.30, z1: 1.42, cx0: 160, cy0: 112 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t);
        const x = 150 + lt * 1.4;
        npc(pc, 'm', x, GY.town + BR(t), 1, { view: 'back', pose: 'walk', walk: WK(t, 6), aL: .5, aR: .5 });
        umbrella(pc, x, GY.town, 1);
      } },

    { t0: 28.21, t1: 33.0, scene: 'town', zs: 1,
      cam: CAM(4.79, { z0: 2.2, z1: 2.5, cx0: 156, cy0: 108 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t); shadeRect(pc, 0, 0, 320, 180, .12);
        npc(pc, 'm', 150, GY.town, 1, { view: 'back' });
        umbrella(pc, 150, GY.town, 1, 7);   // 伞偏一侧，给另一个人留的空
      } },

    { in: { type: 'blk', hold: .3 }, t0: 33.0, t1: 37.68, scene: 'rain', zs: 1,
      cam: CAM(4.68, { z0: 3.0, z1: 3.4, cx0: 160, cy0: 96 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#0A1119');
        c_umbrellaTop(pc, 160, 140, t);
        rain(pc, t, 30, 'rgba(150,180,208,.5)', 1);
        for (let i = 0; i < 5; i++) {
          const ph = (t * 1.4 + i * .23) % 1;
          R(pc, 36 + i * 62, 92 + ph * 84, 1, 3, 'rgba(180,210,235,.75)');
        }
      } },

    // ================= 主歌一 =================
    { in: { type: 'dither', dur: .5 }, t0: 37.68, t1: 42.42, scene: 'room', zs: 1,
      cam: CAM(4.74, { z0: 1.25, z1: 1.36, cx0: 165, cy0: 110 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { lamp: lt > .25 });
        npc(pc, 'm', 172, GY.room + BR(t), 1, { eyes: 'narrow' });
      } },

    { t0: 42.42, t1: 46.71, scene: 'room', zs: 1,
      cam: CAM(4.29, { z0: 1.45, z1: 1.55, cx0: 200, cy0: 100 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { lamp: true });
        npc(pc, 'm', 176, GY.room, 1, { view: 'back' });
        for (let i = 0; i < 4; i++) {
          const x = 128 + i * 26;
          R(pc, x, 34, 18, 13, '#0E1620');
          R(pc, x, 34, 18, 1, '#4A5A6A'); R(pc, x, 46, 18, 1, '#4A5A6A');
          R(pc, x, 34, 1, 13, '#4A5A6A'); R(pc, x + 17, 34, 1, 13, '#4A5A6A');
          R(pc, x + 8, 32, 1, 2, '#8A8578');
        }
      } },

    { t0: 46.71, t1: 50.99, scene: 'room', zs: 1,
      cam: CAM(4.28, { z0: 2.2, z1: 2.45, cx0: 280, cy0: 128 }),
      draw(pc, lt, shot, t) { sc_room(pc, t, { lamp: true, hairtie: true }); } },

    { t0: 50.99, t1: 55.37, scene: 'room', zs: 1,
      cam: CAM(4.38, { z0: 1.3, z1: 1.2, cx0: 160, cy0: 110 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { lamp: lt < .35, dark: lt >= .35 });
        npc(pc, 'm', 172, GY.room, 1, { eyes: 'closed' });
      } },

    { in: { type: 'scan', dur: .3 }, t0: 55.37, t1: 61.56, scene: 'bag', cam: false,
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#070C14');
        const gx = 36, gy = 34, cw = 52, ch = 40;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
          const x = gx + i * (cw + 8), y = gy + j * (ch + 6);
          R(pc, x, y, cw, ch, '#0C141E');
          const bc = (i === 0 && j === 0) ? '#B08A3E' : '#22303E';
          R(pc, x, y, cw, 1, bc); R(pc, x, y + ch - 1, cw, 1, bc);
          R(pc, x, y, 1, ch, bc); R(pc, x + cw - 1, y, 1, ch, bc);
        }
        letter(pc, 48, 46);
        R(pc, 106, 48, 6, 6, PAL.rose); R(pc, 108, 50, 2, 2, '#8A2A38');
        R(pc, 40, 50, 2, 8, PAL.gold);
      } },

    // ①②③ 第一轮交互
    { in: { type: 'dither', dur: .45 }, t0: 61.56, t1: 69.1, scene: 'market', zs: 1,
      cam: DCAM(166, 7.54),
      draw(pc, lt, shot, t) {
        sc_market(pc, t, { crowd: true });
        npc(pc, 'm', 122 + lt * 1.2, GY.market + BR(t), 1, { pose: lt < 2.0 ? 'walk' : 'stand', walk: WK(t, 6), lookX: 1 });
        npc(pc, 'xiaoman', 200, GY.market, 1, { aL: .5, lookX: -1, mouth: 'smile' });
      } },

    { in: { type: 'dither', dur: .4 }, t0: 69.1, t1: 75.81, scene: 'post', zs: 1, cam: DCAM(176, 6.71),
      draw(pc, lt, shot, t) {
        sc_post(pc, t);
        npc(pc, 'm', 132, GY.post + BR(t), 1, { lookX: 1 });
        npc(pc, 'afei', 212, GY.post, 1, { aR: .5, lookX: -1, mouth: 'smile' });
      } },

    { t0: 75.81, t1: 81.74, scene: 'clock', zs: 1, cam: DCAM(164, 5.93),
      draw(pc, lt, shot, t) {
        sc_clock(pc, t, {});
        npc(pc, 'm', 138, GY.clock + BR(t), 1, { view: 'back' });
        c.save(); c.globalAlpha = .88;
        npc(pc, 'chen', 216, 148, 1, { pose: 'sit', lookY: 1, mouth: 'flat' });
        c.restore();
      } },

    { in: { type: 'dither', dur: .45 }, t0: 81.74, t1: 86.53, scene: 'town', zs: 1,
      cam: CAM(4.79, { z0: 2.4, z1: 2.7, cx0: 150, cy0: 112 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t); shadeRect(pc, 0, 0, 320, 180, .16);
        npc(pc, 'm', 148, GY.town + BR(t), 1, { aR: 2, eyes: 'closed', lookY: -1 });
        rain(pc, t, 80, 'rgba(150,180,208,.5)', 1);
      } },

    { t0: 86.53, t1: 90.08, scene: 'town', zs: 1,
      cam: CAM(3.55, { z0: 3.1, z1: 3.35, cx0: 148, cy0: 108 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t); shadeRect(pc, 0, 0, 320, 180, .22);
        npc(pc, 'm', 148, GY.town, 1, { eyes: 'closed' });
        for (let i = 0; i < 3; i++) {
          const p = ((lt * .9 + i * .33) % 1);
          c_ringDither(pc, 148, 126, 8 + p * 44, p);
        }
      } },

    { t0: 90.08, t1: 95.77, scene: 'town', zs: 1,
      cam: CAM(5.69, { z0: 3.2, z1: 3.0, cx0: 148, cy0: 110 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t); shadeRect(pc, 0, 0, 320, 180, .2);
        npc(pc, 'm', 148, GY.town, 1, { eyes: 'normal' });
        rain(pc, t, 60, 'rgba(150,180,208,.4)', 1);
      } },

    { t0: 95.77, t1: 99.22, scene: 'town', zs: 1,
      cam: CAM(3.45, { z0: 1.7, z1: 1.62, cx0: 160, cy0: 120 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t);
        npc(pc, 'm', 128, GY.town, 1, { eyes: 'narrow' });
        for (let i = 0; i < 3; i++) {
          const x = 186 + i * 28 + lt * (3 + i);
          R(pc, x, GY.town - 26, 9, 26, '#151E2C');
          R(pc, x + 1, GY.town - 33, 7, 8, '#151E2C');
        }
      } },

    // ================= 桥段一：闪回 =================
    { in: { type: 'fade', dur: .5 }, t0: 99.22, t1: 105.52, scene: 'flash', zs: 1,
      cam: CAM(6.3, { z0: 1.32, z1: 1.42, cx0: 186, cy0: 122 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#1A2230');
        R(pc, 96, 16, 150, 140, '#2E3A4A');
        for (let i = 0; i < 4; i++) R(pc, 98, 44 + i * 32, 146, 3, '#4A5A6E');
        for (let i = 0; i < 30; i++) R(pc, 102 + (i % 12) * 12, 26 + Math.floor(i / 12) * 32, 6, 14, i % 3 ? '#5A6A7E' : '#7A8A9E');
        R(pc, 0, 156, 320, 24, '#3A4656');
        npc(pc, 'she', 176, 158, 1, { aR: 2, lookY: -1, mouth: 'smile', eyes: 'happy' });
        npc(pc, 'm', 214, 158, 1, { aL: 2, lookX: -1, mouth: 'smile' });
        duotone(pc, '#160810', '#F2AEBB', .30);
      } },

    { t0: 105.52, t1: 111.83, scene: 'flash', zs: 1,
      cam: CAM(6.31, { z0: 1.5, z1: 1.62, cx0: 160, cy0: 112 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#1A2230');
        let x = -8, s = 71;
        while (x < 330) { const w = 22 + (Math.abs(Math.sin(s * 4.7) * 100) % 12 | 0); house(pc, x, 110, w, 34, '#2E3A4A', '#26303E', s, .10, '#6A7A8E', false); x += w + 3; s++; }
        R(pc, 0, 144, 320, 36, '#26303E');
        npc(pc, 'she', 148, 146, 1, { aL: 2, aR: 2, lookY: -1, eyes: 'happy', mouth: 'smile' });
        npc(pc, 'm', 182, 146, 1, { aL: 2, lookY: -1, mouth: 'smile' });
        const p = Math.min(1, lt / 3.4), ly = 118 - p * 52;
        R(pc, 163, ly, 5, 6, PAL.gold);
        glow(pc, 165, ly + 3, 18, 16, PAL.gold, .6);
        for (let i = 0; i < 40; i++) R(pc, (i * 43) % 320, (i * 29) % 88, 1, 1, 'rgba(226,235,244,.7)');
        duotone(pc, '#160810', '#F2AEBB', .30);
      } },

    { in: { type: 'fade', dur: .5 }, t0: 111.83, t1: 118.15, scene: 'town', zs: 1,
      cam: CAM(6.32, { z0: 3.2, z1: 3.4, cx0: 150, cy0: 108 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t); shadeRect(pc, 0, 0, 320, 180, .26);
        npc(pc, 'm', 148, GY.town, 1, { eyes: 'closed', mouth: 'frown' });
        for (let i = 0; i < 3; i++) {
          const ph = ((t * .9 + i * .4) % 1);
          R(pc, 144 + i * 2, 112 + ph * 20, 1, 3, 'rgba(200,225,245,.8)');
        }
        rain(pc, t, 90, 'rgba(150,180,208,.45)', 1);
      } },

    { in: { type: 'dither', dur: .4 }, t0: 118.15, t1: 124.47, scene: 'tavern', zs: 1, cam: DCAM(170, 6.32),
      draw(pc, lt, shot, t) {
        sc_tavern(pc, t, {});
        npc(pc, 'm', 124, GY.tavern + BR(t), 1, { aR: 1, mouth: 'smile', eyes: 'happy' });
        npc(pc, 'qiao', 212, GY.tavern, 1, { lookX: -1, mouth: 'smile' });
      } },

    // ================= 副歌一 =================
    { t0: 124.47, t1: 129.23, scene: 'station', zs: 1,
      in: { type: 'flash', dur: .12, amt: .5 },
      cam: (() => { const sh = SHAKE(.4, 4); return lt => { const b = CAM(4.76, { z0: 1.45, z1: 1.55, cx0: 76, cy0: 120 })(lt); const s = sh(lt); return [b[0] + s[0] * .5, b[1] + s[1] * .5, b[2], b[3]]; }; })(),
      draw(pc, lt, shot, t) {
        sc_station(pc, t);
        npc(pc, 'm', 240, GY.station, 1, { view: 'back' });
        for (let i = 0; i < 5; i++) {
          const x = 10 + i * 34 - lt * 9;
          if (x > 300) continue;
          R(pc, x, GY.station - 26, 9, 26, '#16202E');
          R(pc, x + 1, GY.station - 33, 7, 8, '#16202E');
        }
      } },

    { in: { type: 'whip', dur: .3, dir: -1 }, t0: 129.23, t1: 133.73, scene: 'station', zs: 1,
      cam: CAM(4.5, { z0: 1.6, z1: 1.5, cx0: 226, cy0: 118 }),
      draw(pc, lt, shot, t) {
        sc_station(pc, t);
        npc(pc, 'm', 226, GY.station, 1, { pose: 'sit', lookY: 1, eyes: 'narrow' });
      } },

    // ================= 主歌二 =================
    { t0: 133.73, t1: 141.88, scene: 'town', zs: 1,
      hit: 140.6, hitMag: 10,
      cam: CAM(8.26, { z0: 1.02, z1: 1.16, cx0: 160, cy0: 96, ease: 'out' }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t, { snow: true });
        // 2:20 鼓点动效：白闪 4 帧 + 双冲击环 + 雪雾横扫
        const dp = lt - (140.6 - 133.73);
        if (dp >= 0 && dp < .85) {
          const k = 1 - dp / .85;
          if (dp < .17) R(pc, 0, 0, 320, 180, 'rgba(246,233,210,.55)');
          c_ringDither(pc, 160, 96, 8 + dp * 170, k * .95);
          if (dp > .1) c_ringDither(pc, 160, 96, 8 + (dp - .1) * 140, k * .75);
          for (let i = 0; i < 16; i++) {
            const yy = 18 + (i * 13) % 148;
            const len = 8 + (i * 7) % 20;
            const xx = ((i * 53) % 300) - 20 - dp * 90 * (i % 2 ? 1 : -1);
            R(pc, Math.max(0, xx), yy, len, 1, 'rgba(226,235,244,' + (.5 * k).toFixed(2) + ')');
          }
        }
      } },

    { t0: 141.88, t1: 148.38, scene: 'market', zs: 1,
      in: { type: 'whip', dur: .34, dir: 1 },
      cam: CAM(6.39, { z0: 1.5, z1: 1.62, cx0: 46, cy0: 118 }),
      draw(pc, lt, shot, t) { sc_market(pc, t, { empty: true, snow: true }); } },

    { in: { type: 'scan', dur: .3 }, t0: 148.38, t1: 156.0, scene: 'door', zs: 1,
      cam: CAM(7.62, { z0: 1.45, z1: 1.58, cx0: 130, cy0: 130 }),
      draw(pc, lt, shot, t) {
        vgradS(pc, 0, 0, 320, 96, PAL.ink, '#1B2A3C');
        R(pc, 0, 96, 320, 84, '#243447');
        for (let y = 96; y < 180; y += 3) dith(pc, 0, y, 320, 1, '#243447', '#2E4056', .3);
        R(pc, 118, 40, 58, 56, '#101820');
        R(pc, 124, 46, 46, 50, '#181E26');
        // 两行脚印 → 一行
        for (let i = 0; i < 7; i++) {
          const y = 174 - i * 8;
          R(pc, 92, y, 5, 2, '#3A4C62');
          if (i < 3) R(pc, 100, y - 3, 5, 2, '#3A4C62');
        }
        snow(pc, t, 50, 'rgba(226,235,244,.6)');
      } },

    { in: { type: 'dither', dur: .5 }, t0: 156.0, t1: 164.35, scene: 'room', zs: 1,
      cam: CAM(8.35, { z0: 1.3, z1: 1.18, cx0: 150, cy0: 112 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { dark: true });
        shadeRect(pc, 0, 0, 320, 180, .16);
        npc(pc, 'm', 152, GY.room, 1, { pose: 'sit', eyes: 'narrow', lookY: 1 });
      } },

    { t0: 164.77, t1: 173.0, scene: 'room', zs: 1,
      cam: DCAM(168, 8.23),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { lamp: lt > .3, flowers: true });
        npc(pc, 'm', 176, GY.room + BR(t), 1, { lookX: -1 });
      } },

    { t0: 173.0, t1: 177.32, scene: 'room', zs: 1,
      cam: CAM(4.32, { z0: 2.2, z1: 2.45, cx0: 282, cy0: 128 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { dark: true, hairtie: true });
        shadeRect(pc, 0, 0, 320, 180, .28);
      } },

    { in: { type: 'dither', dur: .45 }, t0: 177.32, t1: 181.59, scene: 'window', zs: 1,
      cam: CAM(4.27, { z0: 1.9, z1: 1.72, cx0: 84, cy0: 92 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { dark: true });
        const p = Math.min(1, lt / 1.6), r = 4 + p * 18;
        c.save(); c.beginPath(); c.arc(84, 70, r, 0, 7); c.clip();
        R(pc, 30, 38, 76, 58, '#16283C');
        let x = 26, s = 9;
        while (x < 110) { const w = 12 + (Math.abs(Math.sin(s * 5.1) * 100) % 8 | 0); house(pc, x, 74, w, 20, '#1E3A52', '#16283C', s, .22, PAL.gold, true); x += w + 2; s++; }
        c.restore();
        R(pc, 84, 86, 6, 8, PAL.skin);   // 手
      } },

    { in: { type: 'whip', dur: .3, dir: -1 }, t0: 181.59, t1: 188.01, scene: 'market', zs: 1, cam: DCAM(172, 6.42),
      draw(pc, lt, shot, t) {
        sc_market(pc, t, { snow: true });
        npc(pc, 'm', 126, GY.market + BR(t), 1, { lookX: 1 });
        npc(pc, 'zhou', 208, GY.market, 1, { aL: .5, lookX: -1, mouth: 'smile' });
      } },

    { t0: 188.01, t1: 195.41, scene: 'oldface', zs: 1,
      cam: CAM(7.4, { z0: 2.55, z1: 2.72, cx0: 168, cy0: 112 }),
      draw(pc, lt, shot, t) {
        vgradS(pc, 0, 0, 320, 96, PAL.ink, '#1B2A3C');
        R(pc, 0, 96, 320, 84, '#1E2C3C');
        npc(pc, 'chen', 166, 132, 1, { eyes: 'narrow', lookY: 1 });
        for (let i = 0; i < 14; i++) R(pc, 152 + (i * 37) % 40, 92 + (i * 19) % 16, 1, 1, 'rgba(240,246,252,.9)');
        for (let i = 0; i < 10; i++) R(pc, 150 + (i * 23) % 44, 128 + (i * 11) % 6, 1, 1, 'rgba(240,246,252,.8)');
        snow(pc, t, 40, 'rgba(226,235,244,.5)');
      } },

    { in: { type: 'dither', dur: .45 }, t0: 195.41, t1: 202.05, scene: 'post', zs: 1, cam: DCAM(168, 6.64),
      draw(pc, lt, shot, t) {
        sc_post(pc, t, { snow: true });
        npc(pc, 'm', 122, GY.post + BR(t), 1, { lookX: 1, aR: 1 });
        npc(pc, 'afei', 196, GY.post, 1, { aL: .5, lookX: -1, mouth: 'tiny' });
        const push = Math.min(1, Math.max(0, (lt - 2.2) / .8)) * (1 - Math.min(1, Math.max(0, (lt - 4.4) / .9)));
        letter(pc, 148 + push * 10, 122);
      } },

    { t0: 202.05, t1: 208.26, scene: 'clock', zs: 1, cam: DCAM(196, 6.21),
      draw(pc, lt, shot, t) {
        sc_clock(pc, t, { inside: true });
        npc(pc, 'chen', 148, GY.clock, 1, { aR: .5, lookX: 1, eyes: 'narrow' });
        npc(pc, 'm', 226, GY.clock, 1, { view: 'back' });
        watch(pc, 176, 126);
        glow(pc, 176, 126, 14, 12, PAL.gold, .35);
      } },

    { in: { type: 'scan', dur: .3 }, t0: 208.26, t1: 212.82, scene: 'town', zs: 1,
      cam: CAM(4.56, { z0: 2.6, z1: 2.9, cx0: 150, cy0: 110 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t, { snow: true }); shadeRect(pc, 0, 0, 320, 180, .2);
        npc(pc, 'm', 148, GY.town, 1, { view: 'back', lookY: 1 });
        watch(pc, 154, 116);
        glow(pc, 154, 116, 10, 9, PAL.gold, .4);
      } },

    { t0: 212.82, t1: 219.23, scene: 'town', zs: 1,
      cam: CAM(6.41, { z0: 3.0, z1: 2.8, cx0: 150, cy0: 110 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t, { snow: true }); shadeRect(pc, 0, 0, 320, 180, .24);
        npc(pc, 'm', 148, GY.town, 1, { eyes: 'closed', lookY: 1 });
        watch(pc, 154, 116);
      } },

    { in: { type: 'fade', dur: .55 }, t0: 219.33, t1: 225.5, scene: 'market', zs: 1,
      cam: CAM(6.17, { z0: 1.7, z1: 1.82, cx0: 182, cy0: 128 }),
      draw(pc, lt, shot, t) {
        sc_market(pc, t, { snow: true, empty: true });
        npc(pc, 'm', 144, GY.market, 1, { pose: lt > 2.6 ? 'crouch' : 'stand', aR: 1, lookY: 1 });
        npc(pc, 'kid', 190, GY.market, 1, { pose: 'crouch', lookX: -1, mouth: 'tiny', eyes: 'wide' });
        dog(pc, 208, GY.market, t);
      } },

    // ================= 桥段二：回放 =================
    { in: { type: 'fade', dur: .5 }, t0: 225.5, t1: 231.77, scene: 'flash', zs: 1,
      cam: CAM(6.27, { z0: 1.55, z1: 1.68, cx0: 190, cy0: 118 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#1A222E');
        R(pc, 96, 16, 150, 140, '#2E3A4A');
        for (let i = 0; i < 4; i++) R(pc, 98, 44 + i * 32, 146, 3, '#4A5A6E');
        for (let i = 0; i < 18; i++) R(pc, 102 + (i % 9) * 14, 76 + Math.floor(i / 9) * 32, 6, 14, i % 3 ? '#5A6A7E' : '#7A8A9E');
        R(pc, 0, 156, 320, 24, '#3A4656');
        npc(pc, 'm', 190, 158, 1, { aR: 2, lookY: -1 });
        duotone(pc, '#0C1018', '#ACC4DC', .30);
      } },

    { t0: 231.77, t1: 238.04, scene: 'flash', zs: 1,
      cam: CAM(6.27, { z0: 1.5, z1: 1.62, cx0: 160, cy0: 112 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#1A222E');
        let x = -8, s = 71;
        while (x < 330) { const w = 22 + (Math.abs(Math.sin(s * 4.7) * 100) % 12 | 0); house(pc, x, 110, w, 34, '#2E3A4A', '#26303E', s, .10, '#6A7A8E', false); x += w + 3; s++; }
        R(pc, 0, 144, 320, 36, '#26303E');
        npc(pc, 'm', 176, 146, 1, { aL: 2, lookY: -1 });
        const p = Math.min(1, lt / 3.4), ly = 118 - p * 50;
        R(pc, 172, ly, 5, 6, PAL.gold);
        glow(pc, 174, ly + 3, 14, 13, PAL.gold, .55);
        for (let i = 0; i < 26; i++) R(pc, (i * 43) % 320, (i * 29) % 88, 1, 1, 'rgba(226,235,244,.6)');
        duotone(pc, '#0C1018', '#ACC4DC', .30);
      } },

    { in: { type: 'fade', dur: .5 }, t0: 238.04, t1: 244.32, scene: 'town', zs: 1,
      cam: CAM(6.28, { z0: 3.2, z1: 3.4, cx0: 150, cy0: 108 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t, { snow: false });     // 雨停了
        shadeRect(pc, 0, 0, 320, 180, .26);
        npc(pc, 'm', 148, GY.town, 1, { eyes: 'closed', mouth: 'frown' });
        const p = HZ(lt / 2.2);
        R(pc, 144, 112 + p * 10, 1, 3, 'rgba(200,225,245,.9)');
        R(pc, 150, 113 + p * 12, 1, 3, 'rgba(200,225,245,.9)');
      } },

    { in: { type: 'dither', dur: .45 }, t0: 244.32, t1: 250.62, scene: 'tavern', zs: 1,
      cam: CAM(6.3, { z0: 1.6, z1: 1.75, cx0: 168, cy0: 130 }),
      draw(pc, lt, shot, t) {
        sc_tavern(pc, t, { inside: true });
        npc(pc, 'm', 126, GY.tavern, 1, { pose: 'sit', lookY: 1, aR: .5 });
        R(pc, 152, 136, 7, 6, '#C8B27A'); R(pc, 153, 134, 5, 2, '#E8D8AE');
        R(pc, 176, 136, 7, 6, '#C8B27A'); R(pc, 177, 134, 5, 2, '#E8D8AE');
        letter(pc, 174, 132);
      } },

    { in: { type: 'fade', dur: .55 }, t0: 250.62, t1: 253.79, scene: 'snow', zs: 1,
      cam: CAM(3.17, { z0: 1.7, z1: 1.5, cx0: 160, cy0: 132 }),
      draw(pc, lt, shot, t) {
        vgradS(pc, 0, 0, 320, 104, PAL.ink, '#1B2A3C');
        R(pc, 0, 104, 320, 76, '#243447');
        for (let y = 104; y < 180; y += 3) dith(pc, 0, y, 320, 1, '#243447', '#2E4056', .3);
        for (let i = 0; i < 7; i++) {
          const y = 176 - i * 9;
          R(pc, 138 + i * 2, y, 4, 2, '#3A4C62');
          if (i < 4) R(pc, 150 + i * 2, y - 3, 4, 2, '#3A4C62');
        }
        snow(pc, t, 60, 'rgba(226,235,244,.7)');
      } },

    // ================= 三连副歌 =================
    { in: { type: 'dither', dur: .45 }, t0: 253.79, t1: 260.2, scene: 'station', zs: 1, cam: DCAM(200, 6.41),
      draw(pc, lt, shot, t) {
        sc_station(pc, t, { snow: true });
        R(pc, 178, 86, 72, 46, '#0B131C');
        R(pc, 178, 84, 72, 2, '#3E5266');
        R(pc, 212, 86, 2, 46, '#26343F');
        npc(pc, 'piao', 234, 148, 1, { lookX: -1 });
        npc(pc, 'm', 148, GY.station, 1, { lookX: 1 });
      } },

    { in: { type: 'scan', dur: .28 }, t0: 260.2, t1: 266.52, scene: 'ticket', zs: 1, cam: false,
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#0A1119');
        // 顶部一束冷光
        for (let i = 0; i < 8; i++) R(pc, 118 + i * 12, 0, 5, 44, 'rgba(150,178,204,.05)');
        // 纸（scan 进场后轻轻落定）
        const sl = Math.min(1, lt / .35);
        const py = Math.round(36 - (1 - sl) * 8);
        R(pc, 62, py, 196, 108, '#E8E2D2');
        R(pc, 62, py, 196, 2, '#B9B2A0');
        R(pc, 62, py + 106, 196, 2, '#CFC8B6');
        // 左缘打孔
        for (let i = 0; i < 6; i++) R(pc, 58, py + 10 + i * 16, 6, 6, '#0A1119');
        // 头部印刷分隔线
        R(pc, 70, py + 22, 180, 1, '#B9B2A0');
        // 条码（右下）
        for (let i = 0; i < 14; i++) R(pc, 208 + i * 2, py + 84, 1, 14, i % 3 ? '#3A362C' : '#CFC8B6');
      } },

    { in: { type: 'dither', dur: .4 }, t0: 266.52, t1: 272.86, scene: 'station', zs: 1,
      cam: CAM(6.34, { z0: 1.55, z1: 1.4, cx0: 196, cy0: 124 }),
      draw(pc, lt, shot, t) {
        sc_station(pc, t, { snow: true });
        npc(pc, 'm', 208, GY.station, 1, { view: 'back', pose: 'walk', walk: WK(t, 4) });
      } },

    { in: { type: 'whip', dur: .3, dir: 1 }, t0: 272.86, t1: 279.18, scene: 'train', zs: 1,
      cam: CAM(6.32, { z0: 1.35, z1: 1.5, cx0: 160, cy0: 118 }),
      draw(pc, lt, shot, t) {
        sc_train(pc, t, {});
        npc(pc, 'm', 146, GY.train, 1, { pose: 'sit', lookX: 1, eyes: 'narrow' });
        c.save(); c.globalAlpha = .5 + Math.sin(t * 1.6) * .18;
        npc(pc, 'she', 196, 128, 1, { lookX: -1, mouth: 'smile', eyes: 'happy' });
        c.restore();
      } },

    { in: { type: 'scan', dur: .3 }, t0: 279.18, t1: 285.49, scene: 'bag', zs: 1,
      cam: CAM(6.31, { z0: 1.0, z1: 1.08, cx0: 160, cy0: 100 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#070C14');
        const gx = 40, gy = 40, cw = 50, ch = 42;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
          const x = gx + i * (cw + 10), y = gy + j * (ch + 12);
          R(pc, x, y, cw, ch, '#0C141E');
          const bc = i === 1 ? '#B08A3E' : '#22303E';
          R(pc, x, y, cw, 1, bc); R(pc, x, y + ch - 1, cw, 1, bc);
          R(pc, x, y, 1, ch, bc); R(pc, x + cw - 1, y, 1, ch, bc);
        }
        letter(pc, 52, 54);
        R(pc, 112, 54, 7, 7, PAL.rose);
        watch(pc, 168, 58);
        const bl = Math.floor(t * 3) % 3;
        if (bl === 0) glow(pc, 58, 58, 16, 12, PAL.gold, .25);
        if (bl === 1) glow(pc, 116, 58, 16, 12, PAL.rose, .25);
        if (bl === 2) glow(pc, 168, 58, 16, 12, PAL.gold, .25);
      } },

    { in: { type: 'dither', dur: .4 }, t0: 285.49, t1: 291.81, scene: 'train', zs: 1,
      cam: CAM(6.32, { z0: 2.4, z1: 2.65, cx0: 158, cy0: 132 }),
      draw(pc, lt, shot, t) {
        sc_train(pc, t, {});
        npc(pc, 'm', 148, GY.train, 1, { pose: 'sit', aL: .5, aR: .5, lookY: 1, eyes: 'closed' });
        const beat = Math.max(0, Math.sin(t * 5.2)) ** 8;
        if (beat > .1) glow(pc, 150, 144, 10, 8, PAL.gold, .3 * beat);
      } },

    // ================= 结局 drop =================
    { t0: 291.81, t1: 295.76, scene: 'save2', zs: 1,
      in: { type: 'flash', dur: .14, amt: 1 },
      cam: (() => { const sh = SHAKE(.5, 5); return lt => { const b = CAM(3.95, { z0: 1.0, z1: 1.05, cx0: 160, cy0: 90 })(lt); const s = sh(lt); return [b[0] + s[0] * .6, b[1] + s[1] * .6, b[2], b[3]]; }; })(),
      draw(pc, lt, shot, t) {
        vgradS(pc, 0, 0, 320, 180, '#0B1520', '#16283C');
        for (let i = 0; i < 22; i++) {
          const x = (i * 37 - lt * 90) % 340 - 10;
          R(pc, x, 120 + (i % 5) * 6, 3, 2, 'rgba(226,235,244,.30)');
        }
        R(pc, 44, 54, 232, 72, 'rgba(9,14,20,.90)');
        R(pc, 44, 54, 232, 2, PAL.pale); R(pc, 44, 124, 232, 2, PAL.pale);
        R(pc, 44, 54, 2, 72, PAL.pale); R(pc, 274, 54, 2, 72, PAL.pale);
      } },

    { in: { type: 'scan', dur: .3 }, t0: 295.76, t1: 302.08, scene: 'post', zs: 1,
      cam: CAM(6.32, { z0: 1.35, z1: 1.5, cx0: 224, cy0: 120 }),
      draw(pc, lt, shot, t) {
        sc_post(pc, t, { snow: true });
        npc(pc, 'm', 196, GY.post, 1, { view: 'back', aR: 1 });
        const p = HZ((lt - 1.4) / 1.2);
        letter(pc, 224 + p * 18, 110 - p * 8);
        if (p > .95) {
          const k = Math.min(1, (lt - 2.8) / .6);
          if (k > 0) glow(pc, 258, 108, 30, 24, PAL.gold, .5 * k);
        }
      } },

    { in: { type: 'glitch', dur: .3 }, t0: 302.08, t1: 308.39, scene: 'save2', zs: 1,
      cam: CAM(6.31, { z0: 1.06, z1: 1.0, cx0: 160, cy0: 92 }),
      draw(pc, lt, shot, t) {
        vgradS(pc, 0, 0, 320, 180, '#0B1520', '#16283C');
        R(pc, 44, 60, 232, 60, 'rgba(9,14,20,.92)');
        R(pc, 44, 60, 232, 2, PAL.gold); R(pc, 44, 118, 232, 2, PAL.gold);
        R(pc, 44, 60, 2, 60, PAL.gold); R(pc, 274, 60, 2, 60, PAL.gold);
        const k = HZ((lt - .8) / 1.6);
        for (let i = 0; i < 26; i++) {
          const x = 190 + (i % 13) * 6 + Math.sin(i) * 3;
          const y = 96 - k * 40 * ((i % 5) * .3) + k * 20;
          if (k > 0 && k < .82) R(pc, x, y, 2, 2, 'rgba(255,209,102,.7)');
        }
      } },

    { in: { type: 'dither', dur: .5 }, t0: 308.39, t1: 313.3, scene: 'platform', zs: 1,
      cam: CAM(4.91, { z0: 1.35, z1: 1.45, cx0: 150, cy0: 120 }),
      draw(pc, lt, shot, t) {
        sc_platform(pc, t, { train: true });
        npc(pc, 'm', 84, GY.plat, 1, { lookX: 1 });
        const ids = ['xiaoman', 'afei', 'chen', 'zhou', 'piao', 'qiao', 'keeper'];
        ids.forEach((id, i) => {
          const x = 126 + i * 24;
          const dy = (i % 2) ? 4 : 0;
          const o2 = { lookX: -1, mouth: 'smile' };
          if (i === 2) o2.eyes = 'narrow';
          if (i === 4) o2.aR = 1;
          if (i === 6) o2.pose = 'stand';
          npc(pc, id, x, GY.plat + 6 + dy, 1, o2);
        });
      } },

    { t0: 313.3, t1: 317.85, scene: 'platform', zs: 1,
      cam: CAM(4.55, { z0: 1.55, z1: 1.38, cx0: 210, cy0: 112 }),
      draw(pc, lt, shot, t) {
        sc_platform(pc, t, { train: true });
        const k = HZ((lt - 1.2) / 2.6);
        for (let i = 0; i < 5; i++) if (i / 5 > k) R(pc, 16 + i * 60, 106, 18, 12, PAL.gold);
      } },

    { in: { type: 'fade', dur: .6 }, t0: 317.85, t1: 323.0, scene: 'dawn', zs: 1,
      cam: CAM(5.15, { z0: 1.35, z1: 1.1, cx0: 170, cy0: 104 }),
      draw(pc, lt, shot, t) {
        vgradS(pc, 0, 0, 320, 118, '#7C94AC', '#E8EEF4');
        R(pc, 0, 108, 320, 72, '#D3DEE8');
        c.fillStyle = '#B9C9D8';
        for (let x = 0; x < 320; x++) { const y = 102 + Math.sin(x * .017) * 6; c.fillRect(x, y, 1, 30); }
        const x = lt * 24;
        R(pc, 56 + x, 116, 46, 10, '#3E566E');
        R(pc, 104 + x, 118, 14, 8, '#33485C');
        for (let i = 0; i < 3; i++) R(pc, 62 + x + i * 12, 118, 6, 4, '#0B1520');
      } },

    { in: { type: 'fade', dur: .8 }, t0: 323.0, t1: 329.21, scene: 'black', cam: false, vig: .8,
      draw(pc) { R(pc, 0, 0, 320, 180, PAL.ink); } },
  ],

  subs: SUBS, hud: hud, nar: [],
};


// ---------- 补充图元 ----------
function rosec(c, t) {
  const x = 214, y = 100, w = 10, h = 13;
  R(c, x - 1, y - 1, w + 2, h + 2, PAL.ink);
  R(c, x, y, w, h, PAL.rose);
  R(c, x, y + 6, w, 1, PAL.ink);
  R(c, x + 5, y, 1, h, PAL.ink);
  glow(c, x + 5, y + 6, 22, 18, PAL.rose, .30);
}
function c_umbrellaTop(c, cx, cy, t) {
  for (let y = 0; y < 60; y++) {
    const w = Math.round(Math.sqrt(Math.max(0, 1 - Math.pow((y - 60) / 60, 2))) * 150);
    R(c, cx - w, cy - 60 + y, w * 2, 1, y < 6 ? '#8A6A32' : (y % 9 === 0 ? '#C89A3E' : PAL.gold));
  }
  R(c, cx - 1, cy - 62, 3, 60, '#8A6A32');
  c.fillStyle = '#8A6A32';
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    for (let r = 0; r < 56; r++) c.fillRect(Math.round(cx + Math.cos(a) * r * 1.4), Math.round(cy - 60 + Math.sin(a) * r * .5 + 30), 1, 1);
  }
}
function c_ringDither(c, cx, cy, r, p) {
  for (let a = 0; a < 360; a += 2) {
    const rad = a * Math.PI / 180;
    const px = Math.round(cx + Math.cos(rad) * r * 1.6), py = Math.round(cy + Math.sin(rad) * r);
    if (BAYER[py & 3][px & 3] / 16 < (1 - p)) R(c, px, py, 1, 1, 'rgba(226,235,244,.5)');
  }
}
function saveScreen(c, lt) {
  R(c, 0, 0, 320, 180, PAL.ink);
  for (let y = 0; y < 180; y += 16) R(c, 0, y, 320, 1, '#080F18');
  for (let x = 0; x < 320; x += 16) R(c, x, 0, 1, 180, '#080F18');
  const blink = Math.floor(lt * 2.2) % 2 === 0;
  const SL = [{ y: 40, h: 36, live: true }, { y: 88, h: 36 }, { y: 136, h: 36 }];
  SL.forEach(s => {
    const x = 24, w = 272;
    R(c, x, s.y, w, s.h, s.live ? '#0C1A28' : '#0A121C');
    const bc = s.live ? (blink ? PAL.gold : '#B08A3E') : '#22303E';
    R(c, x, s.y, w, 1, bc); R(c, x, s.y + s.h - 1, w, 1, bc);
    R(c, x, s.y, 1, s.h, bc); R(c, x + w - 1, s.y, 1, s.h, bc);
    if (s.live) {
      const tx = x + 6, ty = s.y + 5, tw = 40, th = s.h - 10;
      R(c, tx, ty, tw, th, PAL.night);
      for (let yy = ty + 2; yy < ty + th - 2; yy += 5) R(c, tx + 2, yy, tw - 4, 1, '#16283C');
      R(c, tx + 12, ty + 4, 9, 10, PAL.rose);
      glow(c, tx + 16, ty + 9, 14, 12, PAL.rose, .30);
      if (blink) { const cyy = s.y + s.h / 2 | 0; R(c, x + 2, cyy - 3, 2, 6, PAL.gold); R(c, x + 4, cyy - 2, 1, 4, PAL.gold); R(c, x + 5, cyy - 1, 1, 2, PAL.gold); }
    } else {
      for (let dx = x + 8; dx < x + w - 8; dx += 4) R(c, dx, s.y + s.h - 3, 2, 1, '#1A2734');
    }
  });
  R(c, 0, 176, 320, 4, '#070D14');
  R(c, 0, 18, 320, 1, '#17232F');
}


// ===== 角色排排站测试镜（临时：顶替 0 号黑场） =====
window.SPEC.shots[0] = { t0: 0, t1: 6.12, scene: 'test', zs: 0, cam: false,
  draw(pc, lt) {
    R(pc, 0, 0, 320, 180, '#2A3846');
    npc(pc, 'xiaoman', 40, 150, 2, {});
    npc(pc, 'keeper', 75, 150, 2, {});
    npc(pc, 'm', 110, 150, 2, {});
    npc(pc, 'chen', 145, 150, 2, {});
    npc(pc, 'zhou', 180, 150, 2, {});
    npc(pc, 'qiao', 215, 150, 2, {});
    npc(pc, 'afei', 250, 150, 2, {});
    npc(pc, 'piao', 283, 150, 2, {});
    npc(pc, 'kid', 310, 150, 2, {});
  } };
