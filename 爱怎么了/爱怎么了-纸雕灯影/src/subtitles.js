// subtitles.js —— 字幕层：华文行楷 / 逐字亮起 / 严格贴音频
//
// 画在 composite() 的最上面（纸纹之上），所以永远是清楚的。
// 位置：1080×1920，水平居中，基线 y=1802 —— 落在灯箱下方的暗场里，永不压到箱内的脸。
// 时间：直接用 lyrics.js 的逐字 s/e（Qwen3 强制对齐），整句比首字早 0.14s 淡入，比末字晚 0.20s 淡出。
// 唱到的字全亮，没唱到的字压到 52% —— 不是 KTV 描边，是"字一件件被点亮"。
const SUB = { y: 1000, size: 64, color: '#FFF3E2', dim: .52, font: 'Xingkai' };

function subLineAt(t) {
  for (let i = 0; i < LYRICS.length; i++) {
    const L = LYRICS[i], N = LYRICS[i + 1];
    let a = L.a - .14, b = L.b + .20;
    // 同一句连播（「但回忆」两遍）：接上，不重新淡入
    if (N && N.txt === L.txt && N.a - L.b < .45) b = N.b + .20;
    if (t >= a && t <= b) return { L, a, b };
  }
  return null;
}

// 逐字排版：每个字的中心 x（空格算半个字宽）
function subLayout(c, txt, size) {
  const items = [];
  let w = 0;
  for (const ch of txt) {
    const cw = ch === ' ' ? size * .42 : c.measureText(ch).width;
    items.push({ ch, cw }); w += cw;
  }
  let x = -w / 2;
  const out = [];
  for (const it of items) { out.push({ ...it, x: x + it.cw / 2 }); x += it.cw; }
  return out;
}

window.overlayHook = (c, t) => {
  const S = subLineAt(t); if (!S) return;
  const { L, a, b } = S;
  const k = Math.min(ease(seg(t, a, a + .15)), 1 - ease(seg(t, b - .22, b)));
  if (k <= .01) return;
  c.save();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `${SUB.size}px ${SUB.font}, "STXingkai", "KaiTi", serif`;
  try { c.letterSpacing = '1px'; } catch (e) {}
  const lay = subLayout(c, L.txt, SUB.size);
  c.translate(W / 2, 0);
  let ci = 0;
  for (let i = 0; i < lay.length; i++) {
    const it = lay[i];
    if (it.ch === ' ') continue;
    const ch = L.chars[Math.min(ci, L.chars.length - 1)]; ci++;
    const cs = ch ? ch.s : L.a, ce = ch ? ch.e : cs + .2;
    const lit = ease(seg(t, cs - .03, cs + .16));
    // 落影（两层：硬一点的近影 + 大范围的柔影），保证任何色阶上都压得住
    c.globalAlpha = k * lerp(SUB.dim, 1, lit);
    c.shadowColor = 'rgba(6,4,10,.92)'; c.shadowBlur = 26; c.shadowOffsetY = 5;
    c.fillStyle = mixCol('#B9A98F', SUB.color, lit);
    c.fillText(it.ch, it.x, SUB.y + (1 - lit) * 4);
    c.shadowBlur = 8; c.shadowOffsetY = 2;
    c.fillText(it.ch, it.x, SUB.y + (1 - lit) * 4);
  }
  c.restore();
};
