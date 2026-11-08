// cover_scene.js —— 《最美的期待》封面（3:4 主版 / 16:9 横版），沿用全片的 game-show 画具箱。
// 封面是静态一帧：LOOPS.cover 忽略时间。
const VERT = H > W;

// 大字排版：以 x 为中心逐字摆位，白字 + 墨描边 + 硬偏移投影（和字幕同一套规矩）。
// 会自动等比缩到 maxW 以内，避免行楷字宽大于字号把标题挤出血。
function titleRun(c, txt, xCenter, baseY, size, opt = {}) {
  const { fill = PAL.paper, strokeW = .086, shadow = .07, spacing = .03, kws = [], kwCol = PAL.pink, kwScale = 1.12, maxW = 0, alpha = 1 } = opt;
  const chars = [...txt];
  const mask = new Array(chars.length).fill(false);
  for (const k of kws) {
    let i = txt.indexOf(k);
    while (i >= 0) { for (let j = 0; j < k.length; j++) mask[i + j] = true; i = txt.indexOf(k, i + 1); }
  }
  c.save();
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  // 行楷的 advance 与墨迹差得远，按 actualBoundingBox 算墨迹范围，才能视觉居中、不越界
  const box = sz => {
    c.font = `${sz}px "PiaoyiKai", "KaiTi", serif`;
    return chars.map((ch, i) => {
      if (ch === ' ') return { adv: sz * .3, l: 0, r: sz * .3 };
      const m = c.measureText(ch), sc = mask[i] ? kwScale : 1;
      return { adv: m.width * sc, l: -(m.actualBoundingBoxLeft || 0) * sc, r: (m.actualBoundingBoxRight || m.width) * sc };
    });
  };
  const inkW = b => b.slice(0, -1).reduce((a, x) => a + x.adv, 0) + (b.length - 1) * size * spacing + b[b.length - 1].r - b[0].l;
  let b = box(size);
  if (maxW && inkW(b) > maxW) { size = Math.floor(size * maxW / inkW(b)); b = box(size); }
  let acc = xCenter - inkW(b) / 2 - b[0].l;
  c.globalAlpha = alpha; c.lineJoin = 'round'; c.miterLimit = 2;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch !== ' ') {
      const isKw = mask[i], fs = size * (isKw ? kwScale : 1), cx = acc;
      c.save(); c.translate(cx, baseY); c.scale(fs / size, fs / size);
      c.font = `${size}px "PiaoyiKai", "KaiTi", serif`;
      c.globalAlpha = alpha * .9; c.fillStyle = PAL.ink;
      c.fillText(ch, size * shadow, size * shadow);
      c.globalAlpha = alpha;
      c.lineWidth = size * strokeW; c.strokeStyle = PAL.ink;
      c.strokeText(ch, 0, 0);
      c.fillStyle = isKw ? kwCol : fill;
      c.fillText(ch, 0, 0);
      c.restore();
    }
    acc += b[i].adv + size * spacing;
  }
  c.restore();
}

// 小字：字距可调，可选描边（保证压在粉色上也读得清）
function smallText(c, txt, x, y, size, col = PAL.ink, opt = {}) {
  const { track = .18, align = 'center', alpha = 1, outline = 0 } = opt;
  const chars = [...txt];
  c.save();
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.font = `${size}px "PiaoyiKai", "KaiTi", serif`;
  const b = chars.map(ch => {
    if (ch === ' ') return { adv: size * .34, l: 0, r: size * .34 };
    const m = c.measureText(ch);
    return { adv: m.width, l: -(m.actualBoundingBoxLeft || 0), r: (m.actualBoundingBoxRight || m.width) };
  });
  const gap = size * track;
  const inkW = b.slice(0, -1).reduce((a, x) => a + x.adv, 0) + (b.length - 1) * gap + b[b.length - 1].r - b[0].l;
  let acc = (align === 'center' ? x - inkW / 2 : x) - b[0].l;
  c.globalAlpha = alpha; c.lineJoin = 'round';
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch !== ' ') {
      if (outline) { c.lineWidth = size * outline; c.strokeStyle = PAL.ink; c.strokeText(ch, acc, y); }
      c.fillStyle = col; c.fillText(ch, acc, y);
    }
    acc += b[i].adv + gap;
  }
  c.restore();
}

// 硬边斜切底色：上橙下粉，交界是一条直边（无渐变）
function splitGround(yL, yR, colTop, colBot) {
  paint([[-OS, -OS], [W + OS, -OS], [W + OS, yR], [-OS, yL]], { wash: colTop, ink: null });
  paint([[-OS, yL], [W + OS, yR], [W + OS, H + OS], [-OS, H + OS]], { wash: colBot, ink: null });
}

// 心周围的一圈短放射线
function heartRays(x, y, r0, n, len, col) {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * .34;
    inkLine([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * (r0 + len), y + Math.sin(a) * (r0 + len)]], 1.1, col, 'ink', 0);
  }
}

LOOPS.cover = () => {
  const c = drawingContext;
  const MU = W / 2;   // 中线

  // ---------- 底 ----------
  splitGround(VERT ? 940 : 792, VERT ? 1000 : 752, PAL.orange, PAL.pink);
  rays(MU, VERT ? 640 : 560, PAL.paper, 22, .16, 2600, VERT ? .17 : .14);
  dots(mixCol(PAL.orange, PAL.paper, .2), VERT ? 120 : 112, VERT ? 15 : 14, 0, 0, .5);

  // ---------- 人 ----------
  const gy = VERT ? 1150 : 892;
  // 硬边地影（不用角色自带的半透明软影，那个在粉底上会发紫）
  const shadowAt = (x, w) => paint(ellPts(x, gy + 10, w, 22, 30), { wash: mixCol(PAL.pink, PAL.ink, .2), ink: null });
  if (VERT) {
    const u = 42;
    shadowAt(352, 200); shadowAt(752, 200);
    A(345, gy, u, [[0, 'happy']], { rot: .05, aL: 1.55, aR: -.15, noShadow: true });
    B(758, gy, u, [[0, 'laugh']], { flip: true, rot: -.05, aL: -.15, aR: 1.55, noShadow: true });
    heart(MU, 606, 112, PAL.pink, -.03);
    heart(MU, 606, 71, mixCol(PAL.pink, PAL.paper, .35), -.03);
    heartRays(MU, 606, 128, 7, 42, PAL.ink);
  } else {
    const u = 36;
    shadowAt(1414, 166); shadowAt(1664, 166);
    A(1406, gy, u, [[0, 'happy']], { rot: .05, aL: 1.55, aR: -.15, noShadow: true });
    B(1662, gy, u, [[0, 'laugh']], { flip: true, rot: -.05, aL: -.15, aR: 1.55, noShadow: true });
    heart(1538, 508, 86, PAL.pink, -.03);
    heart(1538, 508, 54, mixCol(PAL.pink, PAL.paper, .35), -.03);
    heartRays(1538, 508, 98, 7, 32, PAL.ink);
  }

  // ---------- 字 ----------
  if (VERT) {
    smallText(c, '100 拍 · 13 个世界', MU, 150, 38, PAL.ink, { track: .3 });
    titleRun(c, '最美的期待', MU, 316, 168, { kws: ['期待'], kwCol: PAL.pink, maxW: 946 });
    smallText(c, 'THE MOST BEAUTIFUL EXPECTATION', MU, 376, 24, PAL.ink, { track: .32, alpha: .75 });

    inkLine([[MU - 290, 1214], [MU + 290, 1214]], 1, PAL.ink, 'ink', 0);
    smallText(c, '华文行楷 × Clawd 手绘', MU, 1272, 33, PAL.paper, { track: .14, outline: .05 });
    smallText(c, '一首歌，把每个鼓点画成一个世界', MU, 1322, 28, PAL.paper, { track: .06, outline: .045, alpha: .95 });
    smallText(c, '完整版 42 秒', MU, 1382, 25, PAL.paper, { track: .24, alpha: .9, outline: .04 });
  } else {
    const lx = 150;
    smallText(c, '100 拍 · 13 个世界', lx, 286, 34, PAL.ink, { track: .3, align: 'left' });
    titleRun(c, '最美的期待', lx + 520, 428, 168, { kws: ['期待'], kwCol: PAL.pink, maxW: 1040 });
    smallText(c, 'THE MOST BEAUTIFUL EXPECTATION', lx, 486, 24, PAL.ink, { track: .3, align: 'left', alpha: .75 });
    inkLine([[lx, 542], [lx + 600, 542]], 1, PAL.ink, 'ink', 0);
    smallText(c, '华文行楷 × Clawd 手绘', lx, 604, 33, PAL.paper, { track: .14, align: 'left', outline: .05 });
    smallText(c, '一首歌，把每个鼓点画成一个世界 · 完整版 42 秒', lx, 658, 27, PAL.paper, { track: .05, align: 'left', outline: .04, alpha: .95 });
  }
};

window.EXTRA_FONTS = [['200px "PiaoyiKai"', '最美的期待拍个世界一首歌把每鼓点画成华文行楷手绘完整版秒']];
window.LOOP = LOOPS.cover;


window.EXTRA_FONTS = [['200px "PiaoyiKai"', '最美的期待拍个世界一首歌把每鼓点画成华文行楷手绘完整版秒']];
window.LOOP = LOOPS.cover;
