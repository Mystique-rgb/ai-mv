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
  qiao: { sex: 'm', col: { coat: '#6A4A3A', coatDk: '#3A2A22', inner: 'paper', hairStyle: 'short', hair: '#4A3226', hairDk: '#2E1E14' },
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
