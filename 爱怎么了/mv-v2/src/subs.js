// subs.js —— 字幕层（华文行楷 / 逐字对齐）
// 时间来自 lyrics.js（Qwen3-ForcedAligner 字符级对齐）。字幕画在 composite() 最上面（纸纹之上），保持清晰。
// 规则（分镜词 §10 改成华文行楷）：居中，距底 ~210px（落在箱体下方的暗场里，不压画面主体）；
// 每句比开唱早 0.16s 淡入，比句尾晚 0.10s 淡出；唱到的字亮起、没唱到的字半透（逐字，不是 KTV 描边）。
const SUB = { y: 1026, size: 66, color: '#F6E6D2', dim: .34, font: 'Xingkai' };

function subLineAt(t) {
  for (let i = 0; i < LYRICS.length; i++) {
    const L = LYRICS[i], N = LYRICS[i + 1];
    let a = L.a - .16, b = L.b + .10;
    // 同一句重复（「但回忆」连播）：接上，不重新淡入
    if (N && N.txt === L.txt && N.a - L.b < .5) b = N.b + .10;
    if (t >= a && t <= b) return { L, a, b };
  }
  return null;
}

// 逐字排版：字距固定（不依赖 measureText，行楷的字宽在不同环境下会差几个像素）
function subAdv() { return SUB.size * 1.02; }
function subTotal(txt) { let w = 0; for (const ch of txt) w += ch === ' ' ? subAdv() * .58 : subAdv(); return w; }

window.overlayHook = (c, t) => {
  const S = subLineAt(t); if (!S) return;
  const { L, a, b } = S;
  // 整句的淡入淡出
  const k = Math.min(ease(seg(t, a, a + .16)), 1 - ease(seg(t, b - .18, b)));
  if (k <= .01) return;
  c.save();
  // 字幕下的柔压暗（保证任何画面下都读得清，也让底部收得住）
  const g = c.createLinearGradient(0, 820, 0, 1080);
  g.addColorStop(0, 'rgba(6,5,10,0)'); g.addColorStop(.55, 'rgba(6,5,10,.30)'); g.addColorStop(1, 'rgba(6,5,10,.58)');
  c.globalAlpha = k; c.fillStyle = g; c.fillRect(0, 810, W, 280);
  c.globalAlpha = k;
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `${SUB.size}px ${SUB.font}, "STXingkai", serif`;
  const adv = subAdv();
  let px = (W - subTotal(L.txt)) / 2 + adv / 2;      // 第一个字的中心
  c.shadowColor = 'rgba(0,0,0,.62)'; c.shadowBlur = 16; c.shadowOffsetY = 3;
  let tPrev = L.a, ci = 0;
  for (const chr of L.txt) {
    if (chr === ' ') { px += adv * .58; continue; }
    const ch = L.chars[Math.min(ci++, L.chars.length - 1)];
    const cs = ch ? ch.s : tPrev, ce = ch ? ch.e : cs + .2; tPrev = ce;
    const lit = ease(seg(t, cs - .02, cs + .14));     // 唱到之前半透，唱到之后全亮
    c.globalAlpha = k * lerp(SUB.dim, 1, lit);
    c.fillStyle = lit > .55 ? mixCol('#D8C3A8', SUB.color, lit) : '#C7B7A4';
    c.fillText(chr, px, SUB.y + (1 - lit) * 3);
    px += adv;
  }
  c.restore();
};
