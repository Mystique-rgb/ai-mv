// ============================================================
//  subtitle.js — 像素风字幕层
//  要点：字幕必须画在高分辨率主画布上（不是 320×180），否则放大后中文糊掉。
//        风格上保持"硬"：纯色偏移描边 + 逐字弹入 + 跟字宽的暗带，不用柔光。
//
//  用法：drawSub(c, W, H, text, k, opt)
//    c = 主画布 ctx（1920×1080 级）
//    k = 这句的演唱进度 0..1（0 = 刚开口，1 = 唱完）
// ============================================================

const SUB_FONT = 'XK, KT, serif';
const SUB_INK = '#120C0E';
const SUB_PAPER = '#F6E9D2';
const SUB_GOLD = '#FFC35C';
const SUB_ROSE = '#E8556D';

// 带字距的测量
function subMeasure(c, txt, size, sp) {
  c.font = `${size}px ${SUB_FONT}`;
  let w = 0;
  for (const ch of [...txt]) w += c.measureText(ch).width;
  return w + sp * ([...txt].length - 1);
}

// 硬描边：8 方向纯色偏移（像素风不用 shadowBlur 柔边）
function subStroke(c, ch, x, y, size, col, th) {
  c.fillStyle = col;
  const t = th;
  for (const [dx, dy] of [[-t,0],[t,0],[0,-t],[0,t],[-t,-t],[t,-t],[-t,t],[t,t]]) {
    c.fillText(ch, x + dx, y + dy);
  }
}

// ---------- 主入口 ----------
// opt = {
//   size,          // 字号（默认 H*0.072）
//   y,             // 基线 y（默认 H*0.945）
//   color,         // 主字色
//   accent,        // 强调字色（用 opt.kw 指定词）
//   kw: [],        // 关键词数组，命中放大 + 换色
//   band: true,    // 是否画跟字宽的暗带
//   exit: 0..1,    // 退场进度（1 = 完全消失）
// }
function drawSub(c, W, H, txt, k, opt = {}) {
  if (!txt) return;
  const size = opt.size || Math.round(H * 0.075);
  const sp = size * 0.10;
  const chars = [...txt];

  // 关键词掩码
  const mask = new Array(chars.length).fill(false);
  for (const kw of (opt.kw || [])) {
    let i = txt.indexOf(kw);
    while (i >= 0) { for (let j = 0; j < kw.length; j++) mask[i + j] = true; i = txt.indexOf(kw, i + 1); }
  }

  // 逐字步进（关键词放大 12%，宽度必须按放大后的算，否则框会装不下）
  c.font = `${size}px ${SUB_FONT}`;
  const adv = chars.map((ch, i) => c.measureText(ch).width * (mask[i] ? 1.12 : 1) + sp);
  const total = adv.reduce((a, b) => a + b, 0) - sp;
  let x0 = (W - total) / 2;

  c.save();
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';

  // ---- 字幕框：RPG 对话框（参考片的样式：奶油描边 + 暗底 + 左右小图标）----
  let baseY = opt.y || Math.round(H - size * 0.44);
  if (opt.band !== false) {
    const bh = size * 1.9;
    const bw = Math.min(W * 0.88, total + size * 2.9);
    const bx = (W - bw) / 2, by = H - bh - H * 0.035;
    const a = Math.min(1, k * 6) * (opt.exit ? 1 - opt.exit : 1);
    c.save();
    c.globalAlpha = a;
    // 外描边（奶油）
    c.fillStyle = '#F0D3AC';
    c.fillRect(bx, by, bw, bh);
    // 内底
    c.fillStyle = 'rgba(12,8,9,.90)';
    c.fillRect(bx + 6, by + 6, bw - 12, bh - 12);
    // 内细线
    c.strokeStyle = 'rgba(255,195,92,.34)';
    c.lineWidth = 2;
    c.strokeRect(bx + 15, by + 15, bw - 30, bh - 30);
    // 四个角的缺口（像素切角感）
    c.fillStyle = '#120C0E';
    c.fillRect(bx, by, 10, 10); c.fillRect(bx + bw - 10, by, 10, 10);
    c.fillRect(bx, by + bh - 10, 10, 10); c.fillRect(bx + bw - 10, by + bh - 10, 10, 10);
    // 左侧徽章
    const ix = bx + bh * 0.52, iy = by + bh / 2, ir = bh * 0.24;
    c.beginPath(); c.arc(ix, iy, ir, 0, Math.PI * 2); c.fillStyle = '#241A16'; c.fill();
    c.lineWidth = 3; c.strokeStyle = '#FFC35C'; c.stroke();
    c.fillStyle = '#E8556D';
    c.fillRect(ix - ir * .45, iy - ir * .35, ir * .9, ir * .5);
    c.fillRect(ix - ir * .22, iy + ir * .15, ir * .44, ir * .3);
    c.fillRect(ix - ir * .1, iy + ir * .45, ir * .2, ir * .18);
    // 右侧音符
    c.fillStyle = '#FFC35C';
    const nx = bx + bw - bh * 0.52, ny = by + bh / 2 - 6;
    c.fillRect(nx, ny - 14, 4, 34);
    c.fillRect(nx + 4, ny - 14, 16, 4);
    c.fillRect(nx - 9, ny + 16, 17, 13);
    c.restore();
    baseY = by + bh * 0.5 + size * 0.34;
  }

  // ---- 逐字 ----
  // gs = 整体缩放（SLAM 大字用），dx = 横向偏移（残影用）
  const gs = opt.gs ?? 1;
  if (gs !== 1 || opt.dx) {
    c.translate(W / 2 + (opt.dx || 0), baseY);
    c.scale(gs, gs);
    c.translate(-W / 2, -baseY);
  }
  const ga = opt.ga ?? 1;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch === ' ') { continue; }
    const local = k * chars.length - i;          // 该字的出现进度
    if (local <= 0) continue;
    const pop = Math.min(1, local * 2.6);        // 0..1 弹入
    const e = 1 - Math.pow(1 - pop, 3);          // easeOutCubic
    const scl = 0.62 + 0.38 * e;
    const alpha = Math.min(1, pop * 2.2);
    const dy = (1 - e) * size * 0.26;

    let px = x0; for (let q = 0; q < i; q++) px += adv[q];
    const fs = size * (mask[i] ? 1.12 : 1);

    c.save();
    c.globalAlpha = alpha * (opt.exit ? (1 - opt.exit) : 1) * ga;
    c.translate(px + fs * 0.5, baseY + dy);
    c.scale(scl, scl);
    c.font = `${fs}px ${SUB_FONT}`;
    c.textAlign = 'center';

    // 硬描边
    subStroke(c, ch, 0, 0, fs, SUB_INK, Math.max(2, size * 0.055));
    // 主字
    c.fillStyle = mask[i] ? (opt.accent || SUB_ROSE) : (opt.color || SUB_PAPER);
    c.fillText(ch, 0, 0);
    c.restore();
  }
  c.restore();
}

// ---------- 极简版（纯字，无暗带，用于封面式镜头） ----------
function drawSubPlain(c, W, H, txt, k, opt = {}) {
  return drawSub(c, W, H, txt, k, { ...opt, band: false });
}
