// cel.js — 赛璐璐：平涂 + 硬边月牙阴影 + 高光 + 逆光轮廓；一张画一层
function shadowCrescent(src, dx, dy, color) {
  const { c, g } = mkCtx(src.width, src.height);
  g.fillStyle = color; g.fillRect(0, 0, src.width, src.height);
  g.globalCompositeOperation = 'destination-in'; g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'destination-out'; g.drawImage(src, dx, dy);
  return c;
}
function rimCrescent(src, dx, dy, color) {
  const { c, g } = mkCtx(src.width, src.height);
  g.fillStyle = color; g.fillRect(0, 0, src.width, src.height);
  g.globalCompositeOperation = 'destination-in'; g.drawImage(src, dx, dy);
  g.globalCompositeOperation = 'destination-out'; g.drawImage(src, 0, 0);
  return c;
}

// 把一层 cel 上色：src 是只有平涂+线的角色/道具
function celShade(src, o = {}) {
  const { light = [-0.62, -0.78], step = 5, shadowTint = '#93A0C4', shadowA = 1,
    hiCol = null, hiA = 0, rimCol = null, rimA = 0, rimW = null } = o;
  const out = mkCtx(src.width, src.height);
  const g = out.g;
  g.drawImage(src, 0, 0);
  // 阴影：形状 减 朝光平移的形状 → 背光侧月牙
  const sh = shadowCrescent(src, light[0] * step, light[1] * step, shadowTint);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = shadowA; g.drawImage(sh, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  if (hiCol && hiA > 0) {
    const hi = shadowCrescent(src, -light[0] * step * .9, -light[1] * step * .9, hiCol);
    g.globalCompositeOperation = 'screen'; g.globalAlpha = hiA; g.drawImage(hi, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  if (rimCol && rimA > 0) {
    const rw = rimW == null ? step * .55 : rimW;
    const rm = rimCrescent(src, light[0] * rw, light[1] * rw, rimCol);
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = rimA; g.drawImage(rm, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  return out.c;
}

// 圆形/椭圆工具
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); }
function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
}
function poly(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }
