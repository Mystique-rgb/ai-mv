// ============================================================
//  fx.js — MG 特效层 + 叙事文字层 + 颜文字层（全部画在 1080 主画布上）
//  320 层的像素负责"世界"，这一层负责"电影感"：速度线 / 残影 / 光泄漏 /
//  扫描线 / 暗角 / 章节卡 / 旁白条 / 系统提示 / 颜文字。
// ============================================================

const FX_INK = '#120C0E';
const FX_PAPER = '#F6E9D2';
const FX_GOLD = '#FFC35C';
const FX_ROSE = '#E8556D';
const FX_PALE = '#E2C6AC';
const FX_MINT = '#7FD6C8';

// ---------- 缓存（只建一次） ----------
let _vig = null;
function fxVignette(c, W, H, k) {
  if (!_vig || _vig.width !== W) {
    _vig = document.createElement('canvas'); _vig.width = W; _vig.height = H;
    const v = _vig.getContext('2d');
    const g = v.createRadialGradient(W / 2, H * .48, H * .30, W / 2, H * .52, H * .95);
    g.addColorStop(0, 'rgba(11,10,18,0)');
    g.addColorStop(.55, 'rgba(11,10,18,.32)');
    g.addColorStop(1, 'rgba(11,10,18,.92)');
    v.fillStyle = g; v.fillRect(0, 0, W, H);
  }
  c.save(); c.globalAlpha = Math.min(1, k); c.drawImage(_vig, 0, 0); c.restore();
}

let _scan = null;
function fxScan(c, W, H, a) {
  if (!_scan) {
    _scan = document.createElement('canvas'); _scan.width = 8; _scan.height = 4;
    const s = _scan.getContext('2d');
    s.fillStyle = 'rgba(11,10,18,1)'; s.fillRect(0, 0, 8, 1);
    s.fillStyle = 'rgba(242,239,229,0.5)'; s.fillRect(0, 1, 8, 1);
  }
  const pat = c.createPattern(_scan, 'repeat');
  c.save(); c.globalAlpha = a; c.fillStyle = pat; c.fillRect(0, 0, W, H); c.restore();
}

// 放射速度线（大字冲击）
function fxLines(c, W, H, cx, cy, n, p, col) {
  if (p <= 0 || p >= 1) return;
  const k = p < .25 ? p / .25 : 1 - (p - .25) / .75;
  const r0 = H * .22, r1 = H * (1.15 + p * .5);
  c.save();
  c.globalAlpha = .34 * k;
  c.strokeStyle = col;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.11 * i;
    const w = 2 + (i % 3) * 2;
    c.lineWidth = w;
    const rr0 = r0 + (i % 5) * 14, rr1 = r1 - (i % 4) * 90;
    c.beginPath();
    c.moveTo(cx + Math.cos(a) * rr0, cy + Math.sin(a) * rr0);
    c.lineTo(cx + Math.cos(a) * rr1, cy + Math.sin(a) * rr1);
    c.stroke();
  }
  c.restore();
}

// 暖光斜扫（回忆入口）
function fxLeak(c, W, H, p) {
  if (p <= 0 || p >= 1) return;
  const k = Math.sin(Math.PI * p);
  const x = -W * .3 + p * W * 1.6;
  const g = c.createLinearGradient(x - W * .22, 0, x + W * .22, H);
  g.addColorStop(0, 'rgba(255,209,102,0)');
  g.addColorStop(.5, `rgba(255,209,102,${.26 * k})`);
  g.addColorStop(1, 'rgba(255,209,102,0)');
  c.save(); c.globalAlpha = 1; c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}

// 心跳/呼吸压暗（跟随小节）
function fxPulse(c, W, H, t, amt) {
  const k = (Math.sin(t * Math.PI * 2 / 3.1) * .5 + .5);
  c.save(); c.globalAlpha = amt * (0.35 + k * 0.65); c.fillStyle = FX_INK; c.fillRect(0, 0, W, H); c.restore();
}

// ---------- 叙事文字 ----------
// style: 'card' 章节卡 / 'bar' 旁白条 / 'sys' 系统提示
function drawNar(c, W, H, n, t) {
  if (!n) return;
  const dur = n.t1 - n.t0;
  const into = Math.min(1, (t - n.t0) / (n.style === 'card' ? .7 : .35));
  const out = Math.min(1, Math.max(0, (n.t1 - t) / (n.style === 'card' ? .7 : .4)));
  const a = Math.min(into, out);
  if (a <= 0) return;
  const k = Math.min(1, Math.max(0, (t - n.t0 - .1) / (n.style === 'card' ? .9 : Math.min(2.6, dur * .5))));

  c.save();
  c.globalAlpha = a;
  c.textAlign = 'center';
  c.textBaseline = 'alphabetic';

  if (n.style === 'card') {
    c.fillStyle = FX_INK; c.fillRect(0, 0, W, H);
    // 细碎噪点，避免纯色死板
    c.globalAlpha = a * .5;
    for (let i = 0; i < 240; i++) {
      const x = (i * 97.3) % W, y = (i * 41.7) % H;
      c.fillStyle = i % 3 ? 'rgba(201,198,221,.10)' : 'rgba(255,209,102,.10)';
      c.fillRect(x, y, 2, 2);
    }
    c.globalAlpha = a;
    // 上下分隔线
    c.fillStyle = 'rgba(201,198,221,.28)';
    c.fillRect(W / 2 - 300, H * .375, 600, 2);
    c.fillRect(W / 2 - 300, H * .625, 600, 2);
    // 主标
    c.fillStyle = FX_PAPER;
    c.font = '300px XK, KT, serif';
    c.fillText(n.text, W / 2, H * .565);
    // 副标
    if (n.sub) {
      c.fillStyle = 'rgba(201,198,221,.82)';
      c.font = '40px KT, serif';
      const chars = [...n.sub], sp = 10;
      let w = 0; for (const ch of chars) w += c.measureText(ch).width + sp;
      let x = W / 2 - (w - sp) / 2;
      for (const ch of chars) { const cw = c.measureText(ch).width; c.fillText(ch, x + cw / 2, H * .725); x += cw + sp; }
    }
    // 角标 DAY / 37
    if (n.tag) {
      c.textAlign = 'left';
      c.fillStyle = 'rgba(201,198,221,.5)';
      c.font = '26px KT, serif';
      c.fillText(n.tag, 92, 108);
    }
  } else if (n.style === 'bar') {
    const chars = [...n.text];
    const shown = Math.max(1, Math.round(chars.length * k));
    c.font = '46px KT, serif';
    const txt = chars.slice(0, shown).join('');
    let tw = 0; for (const ch of chars) tw += c.measureText(ch).width + 4;
    const bw = Math.min(W * .78, tw + 120), bh = 96;
    const bx = (W - bw) / 2, by = H * .715;
    // 像素框
    c.fillStyle = 'rgba(11,10,18,.80)'; c.fillRect(bx, by, bw, bh);
    c.fillStyle = 'rgba(201,198,221,.42)';
    c.fillRect(bx - 3, by - 3, bw + 6, 3); c.fillRect(bx - 3, by + bh, bw + 6, 3);
    c.fillRect(bx - 3, by - 3, 3, bh + 6); c.fillRect(bx + bw, by - 3, 3, bh + 6);
    // 文本
    c.textAlign = 'left';
    c.fillStyle = FX_PAPER; c.font = '46px KT, serif';
    let x = bx + 52;
    for (const ch of chars.slice(0, shown)) {
      const cw = c.measureText(ch).width;
      c.fillText(ch, x, by + 62);
      x += cw + 4;
    }
    // 光标
    if (Math.floor(t * 2.2) % 2 === 0) { c.fillStyle = FX_GOLD; c.fillText('▸', x + 6, by + 62); }
  } else {
    // sys：左上角小字
    c.textAlign = 'left';
    c.fillStyle = 'rgba(222,216,200,.74)';
    c.font = '34px KT, serif';
    const chars = [...n.text];
    let x = 76;
    for (let i = 0; i < chars.length; i++) {
      if (i / chars.length > k * 1.2) break;
      c.fillText(chars[i], x, 104);
      x += c.measureText(chars[i]).width + 8;
    }
    if (Math.floor(t * 1.8) % 2 === 0) { c.fillStyle = 'rgba(255,209,102,.75)'; c.fillText('_', x + 2, 104); }
  }
  c.restore();
}

// ---------- 颜文字 ----------
function drawKao(c, W, H, k, t) {
  if (!k) return;
  const p = (t - k.t0) / (k.t1 - k.t0);
  if (p < 0 || p > 1) return;
  const a = Math.min(1, p / .18) * Math.min(1, (1 - p) / .35);
  const x = k.x * (W / 320), y = k.y * (H / 180) - p * 26;
  const s = 46 * (k.sc || 1);
  c.save();
  c.globalAlpha = a * (k.a ?? .5);
  c.font = `${s}px KT, serif`;
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineWidth = 4; c.strokeStyle = FX_INK;
  c.strokeText(k.text, x, y);
  c.fillStyle = k.col || FX_PALE;
  c.fillText(k.text, x, y);
  c.restore();
}

// ---------- 点阵开场（参考片：整屏 LED 网格，用点拼出歌名） ----------
let _ledCv = null, _ledCtx = null;
function ledMask(cols, rows, text, sizeK, yK) {
  if (!_ledCv) {
    _ledCv = document.createElement('canvas');
    _ledCtx = _ledCv.getContext('2d', { willReadFrequently: true });
  }
  _ledCv.width = cols; _ledCv.height = rows;
  const g = _ledCtx;
  g.clearRect(0, 0, cols, rows);
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  let fs = rows * sizeK;
  g.font = `700 ${fs}px 'Microsoft YaHei', 'Microsoft YaHei UI', 'PingFang SC', sans-serif`;
  const tw = g.measureText(text).width;
  if (tw > cols * .84) { fs = fs * (cols * .84) / tw; g.font = `700 ${fs}px 'Microsoft YaHei', 'Microsoft YaHei UI', 'PingFang SC', sans-serif`; }
  g.fillText(text, cols / 2, rows * yK);
  return g.getImageData(0, 0, cols, rows).data;
}
const hash2 = (i, j) => Math.abs(Math.sin(i * 127.1 + j * 311.7) * 43758.5453) % 1;

function drawLED(c, W, H, t, cfg) {
  const pitch = W / 88, dot = pitch * .58;
  const cols = 88, rows = Math.floor(H / pitch);
  const ox = (W - cols * pitch) / 2, oy = (H - rows * pitch) / 2;

  // 整屏底色
  c.fillStyle = '#0A0810'; c.fillRect(0, 0, W, H);

  // 点阵底（未点亮）
  const p0 = Math.min(1, t / .45);
  for (let j = 0; j < rows; j++) {
    if (j / rows > p0) continue;
    for (let i = 0; i < cols; i++) {
      c.fillStyle = 'rgba(255,195,92,.055)';
      c.fillRect(ox + i * pitch + (pitch - dot) / 2, oy + j * pitch + (pitch - dot) / 2, dot, dot);
    }
  }

  // 斜条纹扫过（0.35–1.7s）
  if (t > .3 && t < 1.9) {
    const k = (t - .3) / 1.6;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const band = ((i * .55 + j) % 26) - k * 42;
      if (band > 0 && band < 9) {
        c.fillStyle = `rgba(255,195,92,${.85 * Math.sin(Math.PI * k)})`;
        c.fillRect(ox + i * pitch + (pitch - dot) / 2, oy + j * pitch + (pitch - dot) / 2, dot, dot);
      }
    }
  }

  // 歌名点亮
  const m = ledMask(cols, rows, cfg.title, .58, .42);
  const rev = Math.min(1, Math.max(0, (t - 1.15) / 1.05));
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    if (m[(j * cols + i) * 4 + 3] < 90) continue;
    const on = hash2(i, j) < rev;
    if (!on) continue;
    const x = ox + i * pitch + (pitch - dot) / 2, y = oy + j * pitch + (pitch - dot) / 2;
    c.fillStyle = '#FFC35C'; c.fillRect(x, y, dot, dot);
    c.fillStyle = 'rgba(255,195,92,.14)';
    c.fillRect(x - dot * .28, y - dot * .28, dot * 1.56, dot * 1.56);
  }

  // 副标：第 37 天 · 他还没学会不回头
  if (cfg.sub && t > 2.5) {
    const a = Math.min(1, (t - 2.5) / .5);
    c.save(); c.globalAlpha = a;
    c.fillStyle = 'rgba(240,211,172,.82)';
    c.font = `${Math.round(H * .028)}px KT, serif`;
    c.textAlign = 'center';
    c.fillText(cfg.sub, W / 2, H * .70);
    c.restore();
  }

  // 扫描线（常亮，像坏掉的显示屏）
  const sy = ((t * 40) % H);
  const g2 = c.createLinearGradient(0, sy - 20, 0, sy + 20);
  g2.addColorStop(0, 'rgba(255,195,92,0)');
  g2.addColorStop(.5, 'rgba(255,195,92,.10)');
  g2.addColorStop(1, 'rgba(255,195,92,0)');
  c.fillStyle = g2; c.fillRect(0, sy - 20, W, 40);
}
