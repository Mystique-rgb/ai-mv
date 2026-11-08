// karaoke.js: 字幕层（飘逸楷体 / 行楷），画在 grain 之上的 2D 合成器里，逐字盖章、双版错位、纸白挖空条。
// 时间取自 `11月3日(1)_字幕与音频对应表.md`（音频绝对时间，Qwen3-ForcedAligner 逐字对齐，±80ms）。
// 逐字时间没有单独导出，所以按句内字数线性分配（末字落在句长的 94%），关键词靠自己的字位自然对上，
// 不硬编逐字秒数。
const KFONT = '"PiaoyiKai", "STXingkai", "STKaiti", "KaiTi", "楷体", serif';

const LY = [
  [0.85, 4.70, '我们都是渺小真实存在', { kw: ['渺小'] }],
  [4.80, 8.54, '祈愿小世界里不只有挫败', { kw: ['挫败'] }],
  [8.64, 12.30, '直到遇见你 我以为就光明起来', { kw: ['遇见你', '光明'] }],
  [12.40, 16.54, '眼睛里看到的都是 广袤无垠的大海', { kw: ['广袤无垠', '大海'] }],
  [16.64, 20.30, '有你在的日子里不可能被取代', { kw: ['你', '取代'] }],
  [20.40, 24.06, '在最灰暗的日子你陪着我发呆', { kw: ['最灰暗', '发呆'] }],
  [24.16, 27.34, '你让我学会如何拨开阴霾', { kw: ['拨开阴霾'] }],
  [27.44, 30.78, '将快乐全部收集 将不开心全都淘汰', { kw: ['收集', '淘汰'] }],
  [30.88, 37.80, '你对我说的情话 像转瞬即逝的烟花', { kw: ['情话', '烟花'], pop: '烟花' }],
  [37.92, 45.16, '只停在绽放一刹那 我却已无法自拔', { kw: ['一刹那', '无法自拔'] }],
  [45.44, 48.92, '我们的爱总有时差', { kw: ['时差'] }],
  [49.20, 52.68, '也为你骗自己放下', { kw: ['放下'] }],
  [52.96, 59.40, '爱炙热的你却忘了爱自己', { kw: ['炙热', '自己'], fade: '自己', fadeAt: 58.59 }],
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
    const bx = x0 - 46, bw = Math.max(size * 1.1, cxOf[last] - x0 + wid[last] / 2 + 46);
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
  c.restore();
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
};
