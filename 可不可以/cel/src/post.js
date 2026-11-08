// post.js — 泛光 / 磁带 CRT / 字幕 / 常用特效
let _scan = null, _noise = null;
function scanPattern(g) {
  if (_scan) return _scan;
  const c = mk(2, 3), x = c.getContext('2d');
  x.fillStyle = 'rgba(0,0,0,.17)'; x.fillRect(0, 0, 2, 1);
  _scan = g.createPattern(c, 'repeat'); return _scan;
}
function noisePattern(g) {
  if (_noise) return _noise;
  const c = mk(128, 128), x = c.getContext('2d'), d = x.createImageData(128, 128);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = 128 + (Math.random() - .5) * 90;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
  }
  x.putImageData(d, 0, 0);
  _noise = g.createPattern(c, 'repeat'); return _noise;
}

function bloom(main, emi, strength = .85, radius = 26) {
  if (!emi) return;
  const b1 = mkCtx(W / 4, H / 4);
  b1.g.filter = `blur(${radius / 4}px)`;
  b1.g.drawImage(emi, 0, 0, W / 4, H / 4);
  const b2 = mkCtx(W / 8, H / 8);
  b2.g.filter = `blur(${radius / 2}px)`;
  b2.g.drawImage(emi, 0, 0, W / 8, H / 8);
  main.save();
  main.globalCompositeOperation = 'lighter';
  main.globalAlpha = strength * .75; main.drawImage(b1.c, 0, 0, W, H);
  main.globalAlpha = strength * .55; main.drawImage(b2.c, 0, 0, W, H);
  main.restore();
}

function crt(main, scene, t, o = {}) {
  const { bleed = 2.4, scan = .5, vig = .55, grain = .045, track = 0 } = o;
  // 色度溢出：横向轻微拉宽 + 偏移
  main.save();
  main.globalCompositeOperation = 'lighter';
  main.globalAlpha = .10;
  main.drawImage(scene, bleed, 0);
  main.globalAlpha = .08;
  main.drawImage(scene, -bleed, 0);
  main.restore();
  // 扫描线
  main.save();
  main.globalAlpha = scan; main.fillStyle = scanPattern(main);
  main.fillRect(0, 0, W, H); main.restore();
  // RGB 栅格
  main.save(); main.globalAlpha = .05; main.globalCompositeOperation = 'lighter';
  for (let x = 0; x < W; x += 3) {
    main.fillStyle = x % 9 === 0 ? '#FF4040' : x % 9 === 3 ? '#40FF60' : '#4060FF';
    main.fillRect(x, 0, 1, H);
  }
  main.restore();
  // 磁带滚动带
  const bandY = ((t * 60) % (H + 200)) - 100;
  main.save(); main.globalCompositeOperation = 'lighter'; main.globalAlpha = .05 + track * .18;
  const bg = main.createLinearGradient(0, bandY - 60, 0, bandY + 60);
  bg.addColorStop(0, 'rgba(255,255,255,0)'); bg.addColorStop(.5, 'rgba(255,255,255,.5)'); bg.addColorStop(1, 'rgba(255,255,255,0)');
  main.fillStyle = bg; main.fillRect(0, bandY - 60, W, 120);
  main.restore();
  // 四角压暗
  const vg = main.createRadialGradient(W / 2, H * .52, H * .30, W / 2, H * .52, H * .95);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${vig})`);
  main.fillStyle = vg; main.fillRect(0, 0, W, H);
  // 噪点
  main.save(); main.globalAlpha = grain; main.globalCompositeOperation = 'overlay';
  main.fillStyle = noisePattern(main); main.fillRect(0, 0, W, H); main.restore();
}

// 字幕：华文楷体，奶油黄 + 深褐描边，底部 96px
function subtitle(g, text, o = {}) {
  if (!text) return;
  const { col = '#F7E9C4', line = '#3A2A22', size = 72, y = H - 96, alpha = 1 } = o;
  g.save();
  g.globalAlpha = alpha;
  g.font = `500 ${size}px "STKaiti", "华文楷体", "KaiTi", serif`;
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.lineJoin = 'round'; g.lineCap = 'round';
  if ('letterSpacing' in g) g.letterSpacing = '4px';
  g.shadowColor = 'rgba(20,12,8,.65)'; g.shadowBlur = 10; g.shadowOffsetY = 4;
  g.strokeStyle = line; g.lineWidth = 9; g.strokeText(text, W / 2, y);
  g.shadowBlur = 0; g.shadowOffsetY = 0;
  g.fillStyle = col; g.fillText(text, W / 2, y);
  g.restore();
}

// ---- 特效 ----
function speedLines(g, cx, cy, n, col, a = .5, len = 900, inner = 240) {
  g.save(); g.globalAlpha = a; g.strokeStyle = col; g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const ang = hash(i * 3.1) * TAU, w = 1 + hash(i * 7.7) * 4;
    const r0 = inner + hash(i * 5.3) * 300;
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
    g.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len);
    g.stroke();
  }
  g.restore();
}
function headlight(g, emi, x, y, ang, spread, len, col = '#FFF3D6') {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.globalCompositeOperation = 'lighter';
  const gr = g.createLinearGradient(0, 0, len, 0);
  gr.addColorStop(0, rgba(col, .55)); gr.addColorStop(.18, rgba(col, .16)); gr.addColorStop(1, rgba(col, 0));
  g.fillStyle = gr;
  const ty = Math.tan(spread) * len;
  g.beginPath(); g.moveTo(0, -14); g.lineTo(len, -ty); g.lineTo(len, ty); g.lineTo(0, 14); g.closePath();
  g.fill();
  // 车灯本体的小光核
  const cg = g.createRadialGradient(0, 0, 2, 0, 0, 90);
  cg.addColorStop(0, rgba(col, .9)); cg.addColorStop(1, rgba(col, 0));
  g.fillStyle = cg; g.beginPath(); g.arc(0, 0, 90, 0, TAU); g.fill();
  g.restore();
  if (emi) { emi.save(); emi.globalAlpha = .85; emi.fillStyle = rgba(col, .9); emi.beginPath(); emi.arc(x, y, 16, 0, TAU); emi.fill(); emi.restore(); }
}
function steam(g, t, x, y, n, spread, up, col = '#F2EDE4', a = .22) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const ph = (t * (.35 + hash(i * 3.3) * .35) + hash(i * 7.1)) % 1;
    const px = x + (hash(i * 5.7) - .5) * spread + Math.sin(t * 2 + i) * 16;
    const py = y - ph * up;
    const r = 14 + ph * 46;
    g.globalAlpha = a * (1 - ph) * (1 - ph) * 2.4;
    g.fillStyle = col;
    g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill();
  }
  g.restore();
}
function bokeh(g, t, n, cols, a = .18) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const x = (hash(i * 2.7) * W + Math.sin(t * .4 + i) * 12) % W;
    const y = 100 + hash(i * 6.1) * H * .48;
    const r = 10 + hash(i * 9.3) * 26;
    g.globalAlpha = a * (.3 + hash(i * 4.4) * .7);
    g.fillStyle = cols[i % cols.length];
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  g.restore();
}
function flash(g, k) {
  g.save(); g.globalAlpha = k; g.fillStyle = '#FFF6E0'; g.fillRect(0, 0, W, H); g.restore();
}
