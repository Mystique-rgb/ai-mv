// char.js — 主角像素 rig（小豪 / 小琪）：480×270 场景层，身高约 76px
'use strict';
const CH = {};
W.CH = CH;

const C_M = {
  ink: '#141019',
  skin: '#E9B58C', skinD: '#C98A66', skinL: '#F6CDA9',
  hair: '#171320', hairHi: '#2E2738',
  top: '#23335C', topHi: '#2F4577', topDk: '#182444',
  hood: '#1C2A4E', string: '#CFE3F5',
  pants: '#33507E', pantsDk: '#22385C',
  shoe: '#E8E6DE', shoeDk: '#B9B6AA', sole: '#8E8B80',
  accent: '#F2EFE5',
};
const C_F = {
  ink: '#141019',
  skin: '#F4C9A8', skinD: '#D9A382', skinL: '#FBE0C6',
  hair: '#2A2028', hairHi: '#443442',
  top: '#F4E9D2', topHi: '#FFF9EC', topDk: '#DCCDB2',
  skirt: '#E983A6', skirtDk: '#C46384',
  sock: '#F7F4EA', shoe: '#7A4B3A', shoeDk: '#5A332A',
  bow: '#F27C9A', accent: '#E983A6',
};
CH.CM = C_M; CH.CF = C_F;

const [figCv, figC] = mkcanvas(120, 130);

function limbS(c, x0, y0, x1, y1, w, col, edge) {
  pline(c, x0, y0, x1, y1, w, edge);
  pline(c, x0, y0, x1, y1, Math.max(1, w - 2), col);
}
function torso(c, cx, top, bot, wTop, wBot, col, hi, dk) {
  for (let y = Math.round(top); y <= Math.round(bot); y++) {
    const k = (y - top) / Math.max(1, bot - top);
    const w = Math.round(lerp(wTop, wBot, k));
    const x = Math.round(cx - w / 2);
    R(c, x, y, w, 1, col);
    if (hi) PX(c, x, y, hi);
    if (dk) PX(c, x + w - 1, y, dk);
  }
  if (dk) R(c, Math.round(cx - wBot / 2), Math.round(bot), Math.round(wBot), 1, dk);
}

// o: {x, gy, h, sex, view, pose, ph, dir, eyes, mouth, blush, tear, lean, aL, aR, rim, tint, tintA}
CH.draw = function (c, sex, x, gy, o) {
  o = o || {};
  const F = sex === 'f' ? C_F : C_M;
  const h = Math.min(o.h || (sex === 'f' ? 72 : 76), 120);
  const view = o.view || 'front';
  const pose = o.pose || 'stand';
  const ph = o.ph || 0;
  const dir = o.dir || 1;
  const f = figC, cw = 120, chh = 130;
  f.clearRect(0, 0, cw, chh);
  const cx = 60, gy0 = 124;
  const y0 = gy0 - h;
  const boy = sex !== 'f';
  const bw = boy ? 19 : 16;
  const hipW = boy ? 13 : 12;
  const headW = boy ? 15 : 14, headH = boy ? 18 : 17;
  const shY = y0 + headH + 3;
  const hipY = y0 + h * .56;
  const lean = o.lean || 0;

  let hipDY = 0, feet = null;
  const stride = (pose === 'run' ? 11 : 7);
  if (pose === 'walk' || pose === 'run') {
    const a = Math.sin(ph * Math.PI * 2), b = Math.sin(ph * Math.PI * 2 + Math.PI);
    const lift = pose === 'run' ? 7 : 3;
    feet = [
      { x: cx - 4 + a * stride, y: gy0 - Math.max(0, Math.cos(ph * Math.PI * 2)) * lift },
      { x: cx + 4 + b * stride, y: gy0 - Math.max(0, Math.cos(ph * Math.PI * 2 + Math.PI)) * lift },
    ];
    hipDY = -Math.abs(a) * (pose === 'run' ? 2 : 1);
  } else if (pose === 'sit') hipDY = 18;
  else if (pose === 'crouch') hipDY = 11;
  else if (pose === 'kneel') hipDY = 17;
  const hipA = hipY + hipDY, shA = shY + hipDY;

  // ---- 腿 ----
  const legCol = boy ? F.pants : F.skin, legSh = boy ? F.pantsDk : F.skinD;
  if (pose === 'sit') {
    limbS(f, cx - 4, hipA, cx - 9, hipA - 12, 6, legCol, legSh);
    limbS(f, cx + 4, hipA, cx + 9, hipA - 12, 6, legCol, legSh);
    limbS(f, cx - 9, hipA - 12, cx - 9, gy0 - 7, 5, legCol, legSh);
    limbS(f, cx + 9, hipA - 12, cx + 9, gy0 - 7, 5, legCol, legSh);
    if (!boy) { R(f, cx - 11, gy0 - 9, 5, 6, F.sock); R(f, cx + 6, gy0 - 9, 5, 6, F.sock); }
    R(f, cx - 11, gy0 - 4, 7, 3, F.shoe); R(f, cx + 4, gy0 - 4, 7, 3, F.shoe);
  } else if (pose === 'crouch' || pose === 'kneel') {
    limbS(f, cx - 4, hipA, cx - 9, hipA + 6, 6, legCol, legSh);
    limbS(f, cx + 4, hipA, cx + 9, hipA + 6, 6, legCol, legSh);
    limbS(f, cx - 9, hipA + 6, cx - 8, gy0 - 6, 5, legCol, legSh);
    limbS(f, cx + 9, hipA + 6, cx + 8, gy0 - 6, 5, legCol, legSh);
    if (!boy) { R(f, cx - 10, gy0 - 8, 6, 4, F.sock); R(f, cx + 4, gy0 - 8, 6, 4, F.sock); }
    R(f, cx - 10, gy0 - 4, 8, 3, F.shoe); R(f, cx + 2, gy0 - 4, 8, 3, F.shoe);
  } else if (feet) {
    for (let i = 0; i < 2; i++) {
      const hipx = cx + (i ? 4 : -4), ft = feet[i];
      const knee = { x: (hipx + ft.x) / 2 + (ft.x - hipx) * .16, y: (hipA + ft.y) / 2 + 1 };
      limbS(f, hipx, hipA, knee.x, knee.y, 6, legCol, legSh);
      limbS(f, knee.x, knee.y, ft.x, ft.y - 3, 5, legCol, legSh);
      if (!boy) R(f, ft.x - 2.5, ft.y - 7, 5, 5, F.sock);
      R(f, ft.x - 3.5, ft.y - 3, 7, 2, F.shoe);
      R(f, ft.x - 3.5, ft.y - 1, 7, 1, boy ? F.sole : F.shoeDk);
    }
  } else {
    limbS(f, cx - 4, hipA, cx - 5, gy0 - 6, 6, legCol, legSh);
    limbS(f, cx + 4, hipA, cx + 5, gy0 - 6, 6, legCol, legSh);
    if (!boy) { R(f, cx - 8.5, gy0 - 9, 6, 6, F.sock); R(f, cx + 2.5, gy0 - 9, 6, 6, F.sock); }
    R(f, cx - 9, gy0 - 4, 8, 3, F.shoe); R(f, cx + 1, gy0 - 4, 8, 3, F.shoe);
    R(f, cx - 9, gy0 - 1, 8, 1, boy ? F.sole : F.shoeDk); R(f, cx + 1, gy0 - 1, 8, 1, boy ? F.sole : F.shoeDk);
  }

  // ---- 躯干 ----
  if (boy) {
    torso(f, cx, shA, hipA + 2, bw, hipW, F.top, F.topHi, F.topDk);
    R(f, cx - hipW / 2, hipA, hipW, 3, F.topDk);
    R(f, cx - hipW / 2 + 1, hipA, hipW - 2, 1, F.top);
    if (view !== 'front') R(f, cx - bw / 2 - 1, shA - 3, bw + 2, 5, F.hood);
    else { R(f, cx - bw / 2 + 1, shA, bw - 2, 2, F.hood); R(f, cx - 4, shA, 2, 3, F.hood); R(f, cx + 2, shA, 2, 3, F.hood); }
    R(f, cx - 1, shA + 2, 1, hipA - shA - 2, F.topDk);
    R(f, cx - 4, shA + 4, 1, 6, F.string); R(f, cx + 3, shA + 4, 1, 6, F.string);
    if (view === 'front') {
      const ex = cx + 4, ey = shA + 9;
      R(f, ex - 2, ey + 1, 5, 1, F.accent);
      PX(f, ex - 1, ey, F.accent); PX(f, ex, ey, F.accent); PX(f, ex + 1, ey, F.accent);
      R(f, ex, ey - 1, 1, 2, F.accent);
    }
    R(f, cx - 6, hipA - 6, 12, 1, F.topDk);
  } else {
    torso(f, cx, shA, hipA - 1, bw, hipW, F.top, F.topHi, F.topDk);
    R(f, cx - 1, shA + 1, 3, hipA - shA - 2, F.topDk);
    R(f, cx + 1, shA + 1, 1, hipA - shA - 2, F.topHi);
    for (let i = 0; i < 3; i++) PX(f, cx, shA + 7 + i * 5, F.skirtDk);
    R(f, cx - 3.5, shA - 1, 7, 2, F.topHi);
    for (let i = 0; i < 7; i++) {
      const sw = hipW + 3 + i * 1.6;
      R(f, cx - sw / 2, hipA - 3 + i * 1.6, sw, 2, i % 2 ? F.skirtDk : F.skirt);
    }
    R(f, cx - (hipW + 3) / 2, hipA - 3, hipW + 3, 1, F.skirtDk);
  }

  // ---- 手臂 ----
  const ang = (v, def) => (v == null ? def : v);
  let aL = ang(o.aL, 8), aR = ang(o.aR, 8);
  if (pose === 'run') { aL = ang(o.aL, 55); aR = ang(o.aR, -35); }
  if (pose === 'sit') { aL = ang(o.aL, 16); aR = ang(o.aR, 16); }
  if (pose === 'crouch' || pose === 'kneel') { aL = ang(o.aL, 12); aR = ang(o.aR, 12); }
  for (const s of [-1, 1]) {
    const a = (s < 0 ? aL : aR) * Math.PI / 180;
    const shx = cx + s * (bw / 2 - .5), shy = shA + 2;
    const L = boy ? 21 : 19;
    const hx = shx + s * Math.sin(a) * L * .6, hy = shy + Math.cos(a) * L;
    const ex = shx + s * Math.sin(a) * L * .3, ey = shy + Math.cos(a) * L * .5;
    limbS(f, shx, shy, ex, ey, 6, F.top, F.topDk);
    limbS(f, ex, ey, hx, hy, 5, F.top, F.topDk);
    R(f, hx - 1.5, hy - 1, 3, 3, F.skin);
    R(f, hx - 2, hy - 3, 4, 1, boy ? F.topHi : F.topDk);
  }

  // ---- 头 ----
  const hx = cx - headW / 2, hy = y0 + hipDY;
  R(f, cx - 2, shA - 4, 4, 5, F.skinD);
  R(f, hx, hy + 3, headW, headH - 3, F.skin);
  R(f, hx + headW - 2, hy + 4, 2, headH - 5, F.skinD);
  R(f, hx, hy + headH - 3, headW, 2, F.skinD);
  R(f, hx - 1, hy + 10, 1, 3, F.skinD); R(f, hx + headW, hy + 10, 1, 3, F.skinD);

  if (view === 'back') {
    R(f, hx - 1, hy, headW + 2, headH - 2, F.hair);
    R(f, hx + 2, hy + 2, 4, 7, F.hairHi);
    R(f, hx + 6, hy + 10, 2, 3, F.hairHi);
  } else {
    if (boy) {
      R(f, hx - 1, hy + 1, headW + 2, 6, F.hair);
      R(f, hx - 1, hy + 1, 3, 9, F.hair);
      R(f, hx + headW - 2, hy + 1, 3, 8, F.hair);
      for (const [bx, k] of [[1, 0], [4, 1], [7, 0], [10, 1], [12, 0]]) R(f, hx + bx, hy + 6 - k, 2, 2 + k, F.hair);
      R(f, hx + 3, hy + 1, 5, 2, F.hairHi);
      R(f, hx + 3, hy + 8, 4, 1, F.hair); R(f, hx + 9, hy + 8, 4, 1, F.hair);
    } else {
      R(f, hx - 1, hy + 1, headW + 2, 6, F.hair);
      R(f, hx - 1, hy + 2, 3, headH - 4, F.hair);
      R(f, hx + headW - 2, hy + 2, 3, headH - 4, F.hair);
      R(f, hx + 1, hy + 6, headW - 2, 1, F.hair);
      R(f, hx + 4, hy + 1, 5, 2, F.hairHi);
      const px = dir > 0 ? hx + headW + 1 : hx - 5;
      R(f, px, hy + 9, 4, 9, F.hair);
      R(f, px + (dir > 0 ? 1 : -1), hy + 16, 3, 5, F.hair);
      R(f, px + (dir > 0 ? 2 : -2), hy + 8, 3, 3, F.bow);
    }
    const ey = hy + 11, lx = hx + 3, rx = hx + headW - 4;
    const eyes = o.eyes || 'open';
    const ec = '#2B2438';
    for (const ex of [lx, rx]) {
      if (eyes === 'open' || eyes === 'lookup') {
        R(f, ex, ey, 2, 2, ec);
        PX(f, ex, ey, '#F4EEDC');
        if (eyes === 'lookup') PX(f, ex + 1, ey + 1, F.skin);
      } else if (eyes === 'happy') {
        PX(f, ex, ey + 1, ec); PX(f, ex + 1, ey, ec); PX(f, ex + 2, ey + 1, ec);
      } else if (eyes === 'closed' || eyes === 'cry' || eyes === 'sad') {
        R(f, ex, ey + 1, 2, 1, ec);
        if (eyes === 'cry') PX(f, ex, ey + 2, '#8FD8F0');
      } else if (eyes === 'shock') {
        R(f, ex - 1, ey - 1, 3, 4, ec); R(f, ex, ey, 2, 2, F.white); PX(f, ex, ey, ec);
      }
      if (o.tear) { PX(f, ex + 1, ey + 3, '#8FD8F0'); if (o.tear > 1) PX(f, ex + 1, ey + 4, '#8FD8F0'); }
    }
    const my = hy + 15;
    const mouth = o.mouth || 'flat';
    if (mouth === 'smile') { R(f, cx - 1, my, 3, 1, '#8A4A44'); PX(f, cx - 2, my - 1, '#8A4A44'); PX(f, cx + 2, my - 1, '#8A4A44'); }
    else if (mouth === 'open') { R(f, cx - 1, my - 1, 3, 3, '#7A3A3A'); PX(f, cx, my, '#C46A6A'); }
    else if (mouth === 'frown') { R(f, cx - 1, my + 1, 3, 1, '#8A4A44'); }
    else if (mouth === 'pout') { R(f, cx - 1, my, 2, 2, '#B3625E'); }
    else if (mouth !== 'none') { R(f, cx - 1, my, 3, 1, F.skinD); }
    if (o.blush) { dith(f, hx + 1, hy + 13, 3, 2, F.blush, .85); dith(f, hx + headW - 4, hy + 13, 3, 2, F.blush, .85); }
  }

  if (!o.noOutline) outlineOf(figCv, F.ink, o.rim || null, o.rimDir == null ? 1 : o.rimDir);
  const destX = Math.round(x - cw / 2), destY = Math.round(gy - chh);
  if (o.tint) {
    const [tcv, tc] = tintBuf();
    tc.clearRect(0, 0, cw, chh); tc.drawImage(figCv, 0, 0);
    tc.globalCompositeOperation = 'source-atop';
    tc.globalAlpha = o.tintA == null ? .3 : o.tintA; tc.fillStyle = o.tint; tc.fillRect(0, 0, cw, chh);
    tc.globalAlpha = 1; tc.globalCompositeOperation = 'source-over';
    c.drawImage(tcv, destX, destY);
  } else c.drawImage(figCv, destX, destY);
};
let _tb = null;
function tintBuf() { if (!_tb) _tb = mkcanvas(120, 130); return _tb; }

// 大特写：头 + 肩（原生大尺寸，细节更足）
// o: {eyes, mouth, blush, tear, dir, rim, rimCol, collar:'hoodie'|'cardigan', hairFringe}
CH.portrait = function (c, cx, cy, s, sex, o) {
  o = o || {};
  const F = sex === 'f' ? C_F : C_M;
  const boy = sex !== 'f';
  const W2 = 16 * s, H2 = 20 * s;
  const bw = W2 + 16, bh = H2 + 9 * s + 10;
  const [cv, cc] = mkcanvas(bw, bh);
  cc.clearRect(0, 0, cv.width, cv.height);
  const ox = 4, oy = 4;
  const x = ox, y = oy;
  // 肩
  R(cc, x + 2 * s, y + H2 - 2 * s, W2 - 4 * s, 10 * s, F.top);
  R(cc, x + 2 * s, y + H2 - 2 * s, W2 - 4 * s, s, F.topDk);
  if (!boy) R(cc, x + W2 / 2 - 3 * s, y + H2 - 2 * s, 6 * s, 3 * s, F.topHi);
  // 脖子
  R(cc, x + W2 / 2 - 3 * s, y + H2 - 6 * s, 6 * s, 6 * s, F.skinD);
  // 脸
  R(cc, x + s, y + 3 * s, W2 - 2 * s, H2 - 3 * s, F.skin);
  R(cc, x + s, y + H2 - 4 * s, W2 - 2 * s, 2 * s, F.skinD);
  R(cc, x + W2 - 3 * s, y + 5 * s, 2 * s, H2 - 8 * s, F.skinD);
  R(cc, x, y + 10 * s, s, 4 * s, F.skinD); R(cc, x + W2 - s, y + 10 * s, s, 4 * s, F.skinD);
  // 头发（16-bit 大头像：盖住头顶 1/3，刘海锯齿层叠，不遮脸）
  const hairFringe = o.hairFringe !== false;
  if (boy) {
    // 顶盖
    R(cc, x - s, y, W2 + 2 * s, 6 * s, F.hair);
    R(cc, x - s, y, W2 + 2 * s, s, F.hairHi);
    R(cc, x + 2 * s, y + s, 5 * s, s, F.hairHi);
    // 鬓角
    R(cc, x - s, y + 6 * s, 2 * s, 7 * s, F.hair);
    R(cc, x + W2 - s, y + 6 * s, 2 * s, 7 * s, F.hair);
    // 刘海锯齿（长齿交替，露出眉眼）
    if (hairFringe) {
      const teeth = [[0, 4], [3, 2], [6, 5], [9, 3], [12, 4]];
      for (const [bx, dep] of teeth) R(cc, x + bx * s, y + 6 * s, 2 * s, dep * s, F.hair);
      R(cc, x + 2 * s, y + 6 * s, 12 * s, s, F.hair);
    }
    // 翘起的一撮碎发
    R(cc, x + W2 - 2 * s, y - 2 * s, s, 3 * s, F.hair);
    R(cc, x + W2 - 3 * s, y - s, s, 2 * s, F.hair);
  } else {
    R(cc, x - s, y, W2 + 2 * s, 6 * s, F.hair);
    R(cc, x - s, y, W2 + 2 * s, s, F.hairHi);
    R(cc, x + 3 * s, y + s, 6 * s, s, F.hairHi);
    R(cc, x - s, y + 6 * s, 2 * s, H2 - 7 * s, F.hair);
    R(cc, x + W2 - s, y + 6 * s, 2 * s, H2 - 7 * s, F.hair);
    if (hairFringe) {
      const teeth = [[0, 4], [3, 5], [6, 3], [9, 5], [12, 4]];
      for (const [bx, dep] of teeth) R(cc, x + bx * s, y + 6 * s, 2 * s, dep * s, F.hair);
      R(cc, x + 2 * s, y + 6 * s, 12 * s, s, F.hair);
    }
    // 侧马尾 + 蝴蝶结
    R(cc, x + W2, y + 8 * s, 4 * s, 12 * s, F.hair);
    R(cc, x + W2 + s, y + 6 * s, 3 * s, 3 * s, F.bow);
    PX(cc, x + W2 + 2 * s, y + 7 * s, '#FFB0C4');
  }
  // 眉毛
  const ec = '#2B2438';
  R(cc, x + 3 * s, y + 8 * s, 3 * s, s, F.hair);
  R(cc, x + 10 * s, y + 8 * s, 3 * s, s, F.hair);
  // 眼睛（白底 + 瞳 + 高光，3s 宽）
  const ey = y + 9 * s;
  for (const ex of [x + 3 * s, x + 10 * s]) {
    const eyes = o.eyes || 'open';
    if (eyes === 'open' || eyes === 'lookup') {
      R(cc, ex, ey, 3 * s, 3 * s, '#F6F2E8');
      R(cc, ex + s, ey + s, 2 * s, 2 * s, ec);
      PX(cc, ex + s, ey + s, '#4A3E58');
      R(cc, ex, ey, s, s, '#FFFFFF');
      if (eyes === 'lookup') R(cc, ex, ey + 2 * s, 3 * s, s, F.hair);
    } else if (eyes === 'happy') {
      R(cc, ex, ey + 2 * s, 3 * s, s, ec);
      PX(cc, ex, ey + s, ec); PX(cc, ex + 2 * s, ey + s, ec);
    } else if (eyes === 'closed' || eyes === 'cry' || eyes === 'sad') {
      R(cc, ex, ey + 2 * s, 3 * s, s, ec);
      PX(cc, ex, ey + s, ec); PX(cc, ex + 2 * s, ey + s, ec);
      if (eyes === 'cry') R(cc, ex + s, ey + 3 * s, s, 2 * s, '#9FE0F5');
    } else if (eyes === 'shock') {
      R(cc, ex - s * .5, ey, 4 * s, 4 * s, '#F6F2E8');
      R(cc, ex, ey + s, 2 * s, 2 * s, ec);
    }
  }
  // 鼻尖
  PX(cc, x + 8 * s, y + 13 * s, F.skinD);
  // 嘴
  const my = y + 15 * s;
  const mouth = o.mouth || 'flat';
  if (mouth === 'smile') { R(cc, x + 7 * s, my, 3 * s, Math.max(1, s * .7), '#8A4A44'); PX(cc, x + 6 * s, my - s * .7, '#8A4A44'); PX(cc, x + 10 * s, my - s * .7, '#8A4A44'); }
  else if (mouth === 'open') { R(cc, x + 7 * s, my, 2 * s, 1.6 * s, '#7A3A3A'); R(cc, x + 7 * s, my + 1.6 * s, 2 * s, s * .5, '#C46A6A'); }
  else if (mouth === 'frown') { R(cc, x + 7 * s, my + s * .7, 3 * s, Math.max(1, s * .7), '#8A4A44'); PX(cc, x + 6 * s, my + s * .3, '#8A4A44'); }
  else if (mouth === 'pout') { R(cc, x + 7 * s, my, 2 * s, 2 * s, '#B3625E'); }
  else { R(cc, x + 7 * s, my + s * .3, 3 * s, Math.max(1, s * .6), F.skinD); }
  if (o.blush) { dith(cc, x + 2 * s, y + 13 * s, 3 * s, s, F.blush, .9); dith(cc, x + 11 * s, y + 13 * s, 3 * s, s, F.blush, .9); }
  if (o.tear) { R(cc, x + 3 * s, y + 12 * s, s, 4 * s, '#9FE0F5'); R(cc, x + 12 * s, y + 12 * s, s, 3 * s, '#9FE0F5'); }
  outlineOf(cv, F.ink, o.rimCol || null, o.dir > 0 ? -1 : 1);
  c.drawImage(cv, Math.round(cx - W2 / 2 - ox), Math.round(cy - H2 / 2 - oy));
};
