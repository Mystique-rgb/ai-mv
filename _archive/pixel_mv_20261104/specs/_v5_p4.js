
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
