// subs.js — 刻字字幕（华文楷体）：一刀一字刮出来，被下一刀盖住
(function () {
  const { hash } = window.PAL;
  const FONT = '48px STKaiti, KaiTi, serif';
  const BASE = 1080 - 88;

  function lineAt(t) {
    const L = window.DATA.lines;
    for (let i = 0; i < L.length; i++) {
      const l = L[i];
      if (t >= l.t0 - .10 && t <= l.t1 + .30) return l;
    }
    return null;
  }

  // 一个字刮出来要 0.06s；唱到该字时正好刻完
  function draw(ctx, t, opts = {}) {
    const l = lineAt(t);
    if (!l) return null;
    const chars = l.chars, size = opts.size || 48, gap = 6;
    const total = chars.length * size + (chars.length - 1) * gap;
    let x = 960 - total / 2;
    const jitter = (hash(Math.floor(t * 24) * 1.7) - .5) * 1.6;
    ctx.save();
    ctx.font = `${size}px STKaiti, KaiTi, serif`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i][0], tc = chars[i][1];
      const age = t - (tc - .06);           // 开唱前 0.06s 开始刻
      if (age > 0) {
        const p = Math.min(1, age / .06);   // 刻的进度
        const w = ctx.measureText(ch).width * p;
        const y = BASE + jitter;
        // 被刀推起的颜料边（暖色 1px）
        ctx.fillStyle = 'rgba(58,44,32,0.75)';
        ctx.fillText(ch, x + 1, y + 2);
        // 刻穿露出的米白
        ctx.save();
        ctx.beginPath(); ctx.rect(x - 2, y - size, w + 4, size * 1.5); ctx.clip();
        ctx.fillStyle = '#F4EDDF';
        ctx.fillText(ch, x, y);
        ctx.restore();
      }
      x += size + gap;
    }
    ctx.restore();
    return l.text;
  }

  window.SUBS = { draw, lineAt };
})();
