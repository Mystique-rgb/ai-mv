// karaoke.js: 字幕层（飘逸楷体 / 行楷），画在 grain 之上的 2D 合成器里，逐字盖章、双版错位、纸白挖空条。
// 时间取自 `11月3日(1)_字幕与音频对应表.md`（音频绝对时间，Qwen3-ForcedAligner 逐字对齐，±80ms）。
// 逐字时间没有单独导出，所以按句内字数线性分配（末字落在句长的 94%），关键词靠自己的字位自然对上，
// 不硬编逐字秒数。
const KFONT = '"PiaoyiKai", "STXingkai", "STKaiti", "KaiTi", "楷体", serif';

const LY = [
  [0.16, 2.88, '让我的爱人勇敢 别怕变老', { kw: ['勇敢', '别怕变老'], seal: ['别怕变老', 2.44] }],
  [2.88, 4.32, '对面的女孩看过来', { kw: ['看过来'] }],
  [4.56, 5.36, '看着我', { kw: ['看着我'] }],
  [5.36, 6.48, '别再盯着镜子', { kw: ['镜子'] }],
  [6.48, 8.48, '盯着自己手机摄像头', { kw: ['手机摄像头'] }],
  [8.64, 9.36, '我总说', {}],
  [9.52, 12.16, '可能问题源于你的视力太好', { kw: ['视力太好'] }],
  [12.24, 13.76, '总说你正在衰老', { kw: ['衰老'] }],
  [13.92, 16.08, '害怕我会被拐跑 baby', { kw: ['拐跑'] }],
  [16.32, 18.72, '我从没忘记爱慕你的初衷', { kw: ['初衷'] }],
  [19.12, 20.24, '迷恋你的特别', { kw: ['特别'] }],
  [20.24, 22.00, '尽管我们都很普通', { kw: ['普通'] }],
  [22.40, 23.44, '光阴的故事', { kw: ['光阴的故事'] }],
  [23.44, 25.36, '说实话没经历也不懂', {}],
  [25.60, 26.96, '也只能珍惜眼前', { kw: ['珍惜眼前'] }],
  [26.96, 28.64, '为了不成为它的附庸', { kw: ['附庸'] }],
  [29.04, 29.36, 'babe', {}],
  [29.92, 31.20, '岁月划过指尖', { kw: ['指尖'] }],
  [31.44, 32.88, '一切像梦境实现', { kw: ['梦境'] }],
  [33.12, 34.56, '就算被苦痛肆虐', { kw: ['苦痛肆虐'] }],
  [34.80, 36.24, '那也是很久之前', { kw: ['很久之前'] }],
  [36.32, 38.00, '我们现在拥有所有', {}],
  [38.08, 39.68, '就像埋下了火种', { kw: ['火种'] }],
  [39.76, 41.36, '现在我为你歌颂', { kw: ['歌颂'] }],
  [41.44, 42.88, '就只管牵着我走', { kw: ['牵着我走'] }],
  [43.28, 45.28, 'Baby 我仰慕你的自然', { kw: ['自然'] }],
  [45.28, 47.20, '你的优雅', { kw: ['优雅'] }],
  [47.20, 48.56, 'Baby 我会大声向你表白', { kw: ['表白'] }],
  [48.56, 49.52, '虽然肉麻', { kw: ['肉麻'] }],
];
window.EXTRA_FONTS = [[`120px ${KFONT}`, LY.map(l => l[2]).join('')]];

const SB_Y = 944;          // 字幕基线
const SB_MAXW = 1560;

function kMeasure(c, chars, size, sp) {
  c.font = `${size}px ${KFONT}`;
  let w = 0; for (const ch of chars) w += c.measureText(ch).width + sp;
  return w - sp;
}
// 一行：逐字盖章 + 双版错位 + 关键词放大 + 纸白挖空条
function kLine(c, L, t) {
  const [a, b, txt, opt = {}] = L;
  const chars = [...txt], n = chars.length;
  let size = 112, sp = 7;
  let w = kMeasure(c, chars, size, sp);
  if (w > SB_MAXW) { const k = SB_MAXW / w; size = Math.floor(size * k); sp *= k; w = kMeasure(c, chars, size, sp); }
  const x0 = 960 - w / 2;

  // 每个字的位置与宽度（一次量完，后面不再 measure）
  c.font = `${size}px ${KFONT}`;
  const wid = chars.map(ch => c.measureText(ch).width);
  const cxOf = []; let acc = 0;
  for (let i = 0; i < n; i++) { cxOf.push(x0 + acc + wid[i] / 2); acc += wid[i] + sp; }

  // 关键词掩码
  const mask = new Array(n).fill('');
  for (const kw of opt.kw || []) {
    let i = txt.indexOf(kw);
    while (i >= 0) { for (let j = 0; j < kw.length; j++) mask[i + j] = kw; i = txt.indexOf(kw, i + 1); }
  }
  const popAt = opt.pop ? txt.indexOf(opt.pop) : -1;
  const fadeAt = opt.fade ? txt.indexOf(opt.fade) : -1;

  // 已经在唱的最后一个字 → 纸白条只铺到这儿（跟着字长出来，不是一条空横条）
  let last = -1;
  for (let i = 0; i < n; i++) {
    const tc = a + (b - a) * (i / Math.max(1, n - 1)) * .94;
    if (t >= tc) last = i;
  }
  const exit = seg(t, b - .09, b);
  const barA = .95 * (1 - ease(exit)) * (t < a ? 0 : 1);
  if (barA > .02 && last >= 0) {
    // 最小两个半字宽：单字/双字时纸条不至于窄成一条"秃"标签
    const bx = x0 - 46, bw = Math.max(size * 2.3, cxOf[last] - x0 + wid[last] / 2 + 46);
    const by = SB_Y - size * .92, bh = size * 1.56;
    const r = k => (hash(BOILN * 3 + k) - .5) * 8;
    const P = [
      [bx + r(1), by + r(2)], [bx + bw * .5, by - 5 + r(3)], [bx + bw + r(4), by + r(5)],
      [bx + bw + 9, by + bh * .5], [bx + bw + r(6), by + bh + r(7)],
      [bx + bw * .5, by + bh + 4 + r(8)], [bx + r(9), by + bh + r(10)], [bx - 9, by + bh * .5],
    ];
    c.save();
    c.beginPath(); c.moveTo(P[0][0], P[0][1]);
    for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]);
    c.closePath();
    c.globalAlpha = barA * .22; c.fillStyle = INK.pink; c.save(); c.translate(7, -6); c.fill(); c.restore();
    c.globalAlpha = barA; c.fillStyle = INK.paper; c.fill();
    c.globalAlpha = barA * .07; c.fillStyle = INK.blue; c.fill();       // 一点冷调，别白得像 UI
    c.globalAlpha = barA * .3; c.strokeStyle = INK.blueDk; c.lineWidth = 2; c.stroke();
    c.restore();
  }

  c.save();
  c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  for (let i = 0; i < n; i++) {
    const ch = chars[i];
    if (ch === ' ') continue;
    const tc = a + (b - a) * (i / Math.max(1, n - 1)) * .94;
    const local = t - tc;
    if (local < 0) continue;

    const isKw = !!mask[i];
    const fs = size * (isKw ? 1.13 : 1);
    const jx = (hash(i * 3.7 + a) - .5) * 4, jy = (hash(i * 9.1 + a) - .5) * 5;
    const rot = (hash(i * 5.3 + a) - .5) * .06;
    const pop = backOut(clamp(local / .11));
    const s = lerp(1.3, 1, pop);
    let alpha = clamp(local / (.06 + .05 * hash(i + 2)));
    let dy = (1 - pop) * -14;
    if (t > b - .09) { alpha *= 1 - ease(exit); dy += 16 * exit; }
    if (fadeAt >= 0 && i >= fadeAt && i < fadeAt + (opt.fade || '').length) {
      alpha *= 1 - seg(t, opt.fadeAt || 58.59, (opt.fadeAt || 58.59) + .34);   // "自己"随粉版被抽走一起消失
    }
    if (alpha <= .02) continue;

    const cx = cxOf[i];
    // "烟花"：先炸成纸屑，再落回成字
    if (popAt >= 0 && i >= popAt && i < popAt + 2 && local < .16) {
      const q = local / .16;
      c.save(); c.globalAlpha = 1 - q * .3;
      for (let d = 0; d < 12; d++) {
        const ang = (d / 12) * 6.2832 + i, dist = fs * (.16 + .6 * q) * (.6 + .7 * hash(d + i));
        c.fillStyle = d % 3 ? INK.pink : INK.clayDk;
        c.fillRect(cx + Math.cos(ang) * dist, SB_Y + dy - fs * .34 + Math.sin(ang) * dist, fs * .07, fs * .07);
      }
      c.restore();
      continue;
    }

    c.save();
    c.translate(cx + jx, SB_Y + dy + jy);
    c.rotate(rot); c.scale(s, s);
    c.font = `${fs}px ${KFONT}`;
    // 副版：同一个字再印一遍，偏 3px（印刷体）
    c.globalAlpha = alpha * .5; c.fillStyle = INK.pink;
    c.fillText(ch, -3.2, -1.8);
    // 主版
    c.globalAlpha = alpha; c.fillStyle = isKw ? INK.clayDk : INK.ink;
    c.fillText(ch, 0, 0);
    c.restore();
  }

  // hook 印章：唱到关键句一记红印「啪」盖下（opt.seal = [关键词, 盖下时刻]）
  if (opt.seal) {
    const [kw, s0] = opt.seal;
    const si = txt.indexOf(kw);
    if (si >= 0 && t >= s0) {
      const ap = seg(t, s0, s0 + .09);
      const sc = 1 + 1.2 * (1 - ease(ap));
      const kx = (cxOf[si] + cxOf[si + kw.length - 1]) / 2;
      const rw = (cxOf[si + kw.length - 1] - cxOf[si]) / 2 + size * .40, rh = size * .74;
      c.save();
      c.translate(kx, SB_Y - size * .05); c.rotate(-.1); c.scale(sc, sc);
      c.globalAlpha = barA * .9;
      c.strokeStyle = INK.red; c.lineWidth = 9;
      c.beginPath(); c.roundRect(-rw, -rh, rw * 2, rh * 2, 14); c.stroke();
      c.save(); c.beginPath(); c.roundRect(-rw, -rh, rw * 2, rh * 2, 14); c.clip();
      c.rotate(-.5); c.fillStyle = INK.red;
      c.fillRect(-rw * 1.5, -8, rw * 3, 16);
      c.restore();
      c.restore();
    }
  }
  c.restore();
}

// ── 片头版记 / 片尾落版（画在字幕同一层，都是"印在这张纸上的字"）──
function kTitle(c, t) {
  // 片头：右上角竖排歌名，0.95 起随滚筒印出，S01 末被粉版扫掉
  if (t > .95 && t < 2.9) {
    const inn = clamp((t - .95) / .2), out = ease(seg(t, 2.6, 2.86));
    const a = inn * (1 - out);
    if (a > .02) {
      const x = 1688, y0 = 236, fs = 66, gap = 76;
      const cn = [...'别怕变老'];
      c.save(); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      for (let i = 0; i < cn.length; i++) {
        const lt = clamp((t - .95 - i * .06) / .14);
        if (lt <= 0) continue;
        const dy = (1 - backOut(lt)) * -18 - out * 12;
        c.globalAlpha = a * lt;
        c.font = `${fs}px ${KFONT}`;
        c.fillStyle = INK.pink; c.fillText(cn[i], x - 3, y0 + i * gap + dy);   // 副版错位
        c.fillStyle = INK.blueDk; c.fillText(cn[i], x, y0 + i * gap + dy);
      }
      c.globalAlpha = a * .9; c.font = `700 22px ${KFONT}`; c.fillStyle = INK.blue;
      c.fillText('AIR · 王以太', x, y0 + cn.length * gap - 6);
      c.restore();
    }
  }
  // 片尾：海报贴稳后，纸上印出歌名（跟海报一起缩放，像封套的版记）
  if (t > 49.82) {
    const fold = ease(seg(t, 49.9, 50.3));
    const fw = lerp(W + 500, 660, fold), fh = lerp(H + 500, 442, fold);
    const cx0 = 960, cy0 = lerp(540, 566, fold);
    const cap = backOut(clamp((t - 49.9) / .3));
    if (cap > .01) {
      const k = fw / 660;
      const baseY = cy0 + fh / 2 - 34 * k;
      c.save(); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      c.globalAlpha = clamp(cap * 1.4);
      c.font = `${46 * k}px ${KFONT}`;
      c.fillStyle = INK.pink; c.fillText('别怕变老', cx0 - 2.5 * k, baseY - 30 * k);
      c.fillStyle = INK.blueDk; c.fillText('别怕变老', cx0, baseY - 30 * k);
      c.globalAlpha = clamp(cap * 1.1) * .85;
      c.font = `${17 * k}px ${KFONT}`;
      c.fillStyle = INK.blue; c.fillText('AIR · 王以太 · 2026', cx0, baseY);
      c.restore();
    }
  }
}

window.overlayHook = (c, t) => {
  // 1) 全片印刷网点：乘在画面上（在 grain 之后、字幕之前），像这张纸本来就被压过一遍
  if (PRINT_TEX) {
    c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = .55;
    const N = PRINT_TEX.width;
    for (let y = 0; y < H; y += N) for (let x = 0; x < W; x += N) c.drawImage(PRINT_TEX, x, y);
    c.restore();
  }
  // 2) 字幕
  for (const L of LY) if (t >= L[0] && t < L[1]) kLine(c, L, t);
  // 3) 片头版记 / 片尾落版
  kTitle(c, t);
};
