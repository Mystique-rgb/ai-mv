// cover.js —— 《把回忆拼好给你》套印版 封面
// 与成片共用同一套墨色和字体；版式 ?v=A|B，尺寸 ?w= ?h=
const Q = new URLSearchParams(location.search);
const W = +(Q.get('w') || 1920), H = +(Q.get('h') || 1080);
const VAR = (Q.get('v') || 'A').toUpperCase();
const DPR = Math.min(2, window.devicePixelRatio || 1);

const cv = document.getElementById('cv');
cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
cv.style.width = W + 'px'; cv.style.height = H + 'px';
const c = cv.getContext('2d');
c.scale(DPR, DPR);

const TAU = Math.PI * 2;
const INK = {
  paper: '#F4EEE2', cream: '#EFE4CE',
  blue: '#3D5588', blueDk: '#25355C', blueLt: '#6C87B8',
  clay: '#D97757', clayDk: '#B85535',
  pink: '#FF48B0', pinkDk: '#D4278A',
  ink: '#1E2024', red: '#D9213C',
};

let SEED = 20261103;
function rnd() { SEED = (SEED * 1664525 + 1013904223) % 4294967296; return SEED / 4294967296; }
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

// ---------- 半调 ----------
function halftone(x, y, w, h, opt) {
  const cell = opt.cell || 14, ang = (opt.angle ?? 15) * Math.PI / 180;
  const color = opt.color || INK.blue, dens = opt.dens || (() => .6);
  const cos = Math.cos(ang), sin = Math.sin(ang), diag = Math.hypot(w, h);
  const cx = x + w / 2, cy = y + h / 2;
  c.save();
  c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = color;
  for (let j = -diag; j <= diag; j += cell) {
    for (let i = -diag; i <= diag; i += cell) {
      const gx = cx + i * cos - j * sin, gy = cy + i * sin + j * cos;
      if (gx < x - cell || gx > x + w + cell || gy < y - cell || gy > y + h + cell) continue;
      const d = dens(gx, gy);
      if (d <= .02) continue;
      const r = cell * .605 * Math.sqrt(Math.min(1, d));
      c.beginPath(); c.arc(gx, gy, r, 0, TAU); c.fill();
    }
  }
  c.restore();
}

// ---------- 纸 ----------
function paperBg() {
  c.fillStyle = INK.paper; c.fillRect(0, 0, W, H);
  c.save();
  for (let i = 0; i < 24; i++) {
    const x = rnd() * W, y = rnd() * H, r = 160 + rnd() * 460;
    c.globalAlpha = .03 + rnd() * .045;
    c.fillStyle = i % 3 ? INK.cream : INK.blueLt;
    c.beginPath(); c.ellipse(x, y, r, r * (.45 + rnd() * .6), rnd() * 3, 0, TAU); c.fill();
  }
  c.globalAlpha = .085;
  for (let i = 0; i < 110; i++) {
    const x = rnd() * W, y = rnd() * H, l = 18 + rnd() * 110, a = rnd() * .6 - .3;
    c.strokeStyle = i % 4 ? INK.cream : INK.blueLt; c.lineWidth = .5 + rnd() * .8;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
  }
  c.restore();
}

// ---------- 人 ----------
function rr(x, y, w, h, r) {
  const k = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + k, y);
  c.arcTo(x + w, y, x + w, y + h, k);
  c.arcTo(x + w, y + h, x, y + h, k);
  c.arcTo(x, y + h, x, y, k);
  c.arcTo(x, y, x + w, y, k);
  c.closePath();
}

// 方头小身子：和 MV 里的角色同一个造型
function figureFill(cx, gy, h, color, opt = {}) {
  const wide = opt.wide || 1, lean = (opt.lean || 0) * h * .025;
  const hw = h * .152 * wide;            // 头半宽
  const headTop = gy - h, headH = h * .255;
  const shoulderY = headTop + headH - h * .004;
  const hipY = gy - h * .385;
  const sw = h * .128 * wide, ww = h * .108 * wide;
  const lx = cx + lean;
  c.save();
  c.fillStyle = color; c.strokeStyle = color;
  // 头
  rr(lx - hw, headTop, hw * 2, headH, h * .072); c.fill();
  // 身子：肩到下腹，微微收
  c.beginPath();
  c.moveTo(cx - sw, shoulderY + h * .022);
  c.quadraticCurveTo(cx - sw, shoulderY, cx - sw * .84, shoulderY);
  c.lineTo(cx + sw * .84, shoulderY);
  c.quadraticCurveTo(cx + sw, shoulderY, cx + sw, shoulderY + h * .022);
  c.lineTo(cx + ww, hipY);
  c.lineTo(cx - ww, hipY);
  c.closePath(); c.fill();
  // 腿
  const legW = h * .086, gap = h * .014;
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? cx - gap - legW : cx + gap;
    rr(x0, hipY - h * .012, legW, gy - hipY + h * .012, h * .028); c.fill();
  }
  // 手臂
  c.lineWidth = h * .064; c.lineCap = 'round'; c.lineJoin = 'round';
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * sw * .9, shoulderY + h * .045);
    c.quadraticCurveTo(cx + s * sw * 1.28, hipY - h * .095, cx + s * (ww + h * .028), hipY - h * .015);
    c.stroke();
  }
  c.restore();
}

// 三版错位的一整个人
function figure3(cx, gy, h, opt = {}) {
  const main = opt.main || INK.clay;
  const gA = opt.ghostA || INK.pink, gB = opt.ghostB || INK.blue;
  const oA = opt.offA || [-15, 11], oB = opt.offB || [13, -9];
  c.save();
  c.globalAlpha = .58; figureFill(cx + oA[0], gy + oA[1], h, gA, opt);
  c.globalAlpha = .44; figureFill(cx + oB[0], gy + oB[1], h, gB, opt);
  c.globalAlpha = 1; figureFill(cx, gy, h, main, opt);
  c.restore();
}

// ---------- 字 ----------
function measureSpaced(txt, size, sp, font) {
  c.font = `${size}px ${font || 'XK, KT, serif'}`;
  const chars = [...txt];
  let w = 0;
  for (const ch of chars) w += c.measureText(ch).width;
  return w + sp * (chars.length - 1);
}
function drawSpaced(txt, x, baseY, size, sp, fill, opt = {}) {
  c.save();
  c.font = `${size}px ${opt.font || 'XK, KT, serif'}`;
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.fillStyle = fill;
  c.globalAlpha = opt.alpha ?? 1;
  if (opt.blend) c.globalCompositeOperation = opt.blend;
  const chars = [...txt];
  const total = measureSpaced(txt, size, sp, opt.font);
  let px = opt.align === 'left' ? x : (opt.align === 'right' ? x - total : x - total / 2);
  px += opt.dx || 0;
  for (const ch of chars) {
    c.fillText(ch, px, baseY + (opt.dy || 0));
    px += c.measureText(ch).width + sp;
  }
  c.restore();
  return total;
}
function title3(txt, cx, baseY, size, sp) {
  c.save();
  c.globalCompositeOperation = 'multiply';
  drawSpaced(txt, cx, baseY, size, sp, INK.pink, { alpha: .66, dx: -12, dy: 8 });
  drawSpaced(txt, cx, baseY, size, sp, INK.clay, { alpha: .6, dx: 10, dy: -7 });
  drawSpaced(txt, cx, baseY, size, sp, INK.ink, { alpha: 1 });
  c.restore();
}


// 反算字号：让一行字正好铺到目标宽度（楷体字宽不等于字号，必须实测）
function fitSize(txt, spRatio, targetW) {
  let a = 20, b = 900;
  for (let i = 0; i < 32; i++) {
    const mid = (a + b) / 2;
    if (measureSpaced(txt, mid, mid * spRatio) < targetW) a = mid; else b = mid;
  }
  return Math.floor(a);
}

function regMarks(m) {
  c.save();
  c.strokeStyle = INK.blueDk; c.lineWidth = 1.5; c.globalAlpha = .8;
  const L = 24;
  for (const [x, y] of [[m, m], [W - m, m], [m, H - m], [W - m, H - m]]) {
    c.beginPath(); c.moveTo(x - L, y); c.lineTo(x + L, y);
    c.moveTo(x, y - L); c.lineTo(x, y + L); c.stroke();
  }
  c.restore();
}

// 一条靛蓝色带：上沿是毛的，网点随高度加密
function blueBand(top, bottom, opt = {}) {
  const hh = bottom - top;
  halftone(0, top - 20, W, hh + 24, {
    cell: opt.cell || 14, angle: opt.angle ?? 16, color: INK.blue,
    dens: (x, y) => {
      const k = (y - top) / hh;
      if (k < -.02) return 0;
      const jag = (hash(Math.floor(x / 11) * 3 + 7) - .5) * .28;   // 上沿参差
      let d = (opt.base || .42) + .5 * Math.pow(Math.max(0, k), .8);
      if (k < .1) d *= Math.max(0, .5 + k * 8 + jag);
      if (opt.groundY) {          // 人站的那一片：网点稀下去，像地上一块反光
        const dd = Math.abs(y - opt.groundY);
        if (dd < 110) d *= .42 + .58 * Math.pow(dd / 110, .7);
      }
      return Math.min(1, Math.max(0, d * (.86 + .28 * hash(Math.floor(x / 13) * 5 + Math.floor(y / 13) * 11))));
    },
  });
  // 上沿压一道墨线
  c.save();
  c.strokeStyle = INK.blueDk; c.globalAlpha = .55; c.lineWidth = 1.8;
  c.beginPath(); c.moveTo(-20, top + 2);
  for (let x = -20; x <= W + 20; x += 60) c.lineTo(x, top + 2 + (hash(x) - .5) * 7);
  c.stroke();
  c.restore();
}

function grain(amount) {
  const img = c.getImageData(0, 0, cv.width, cv.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - .5) * amount;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  c.putImageData(img, 0, 0);
}

// 地平线：一根带抖动的墨线，人踩在上面才有"站住"的感觉
function groundLine(gy, alpha = .5) {
  c.save();
  c.strokeStyle = 'rgba(244,238,226,' + (.75 * alpha + .2) + ')';
  c.lineWidth = 4;
  c.beginPath(); c.moveTo(-20, gy);
  for (let x = -20; x <= W + 20; x += 44) c.lineTo(x, gy + (hash(x * .7) - .5) * 5);
  c.stroke();
  c.strokeStyle = INK.blueDk; c.globalAlpha = alpha * .5; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-20, gy + 5);
  for (let x = -20; x <= W + 20; x += 44) c.lineTo(x, gy + 5 + (hash(x * 1.3) - .5) * 5);
  c.stroke();
  c.restore();
}
function groundShadow(cx, gy, h) {
  c.save();
  c.globalAlpha = .42; c.fillStyle = INK.blueDk;
  c.beginPath(); c.ellipse(cx, gy + h * .01, h * .255, h * .052, 0, 0, TAU); c.fill();
  c.restore();
}

function scraps(gy, n) {
  c.save();
  for (let i = 0; i < n; i++) {
    c.globalAlpha = .16 + rnd() * .26;
    c.fillStyle = i % 3 ? INK.pink : INK.clay;
    const x = rnd() * W, y = gy + 26 + rnd() * (H - gy - 40);
    c.beginPath(); c.ellipse(x, y, 5 + rnd() * 15, 1.8 + rnd() * 3.4, rnd() * 3, 0, TAU); c.fill();
  }
  c.restore();
}

// ================= 版式 A：套不准 =================
function buildA() {
  const bandTop = H * .545, gy = H * .945;
  paperBg();
  blueBand(bandTop, H + 10, { base: .25, angle: 16, groundY: H * .945 });

  const fh = H * .302;
  groundLine(gy, .30);
  groundShadow(W * .447, gy, fh);
  groundShadow(W * .553, gy, fh * .98);
  figure3(W * .447, gy, fh, { main: INK.clay, ghostA: INK.pink, ghostB: INK.blue, offA: [-17, 13], offB: [15, -10] });
  figure3(W * .553, gy, fh * .98, { main: INK.pinkDk, ghostA: INK.clay, ghostB: INK.blue, offA: [16, -11], offB: [-14, 10], lean: -5 });

  scraps(gy - H * .06, 20);

  // 主标题
  const ts = Math.min(W * .20, 384);
  title3('套不准', W * .5, H * .400, ts, ts * .14);

  // 副标题 + 两侧短线
  const subY = H * .492, subW = measureSpaced('把回忆拼好给你', 55, 23);
  drawSpaced('把回忆拼好给你', W * .5, subY, 55, 23, INK.blueDk, { alpha: .96 });
  c.save();
  c.fillStyle = INK.blueDk; c.globalAlpha = .55;
  c.fillRect(W * .5 - subW / 2 - 96, subY - 21, 66, 2.4);
  c.fillRect(W * .5 + subW / 2 + 30, subY - 21, 66, 2.4);
  c.restore();

  // 角标
  drawSpaced('RISOGRAPH / 3 PLATES', 76, 104, 24, 8, INK.blueDk, { alpha: .85, font: 'KT, serif', align: 'left' });
  drawSpaced('60 SEC', W - 76, H - 78, 24, 7, INK.blueDk, { alpha: .85, font: 'KT, serif', align: 'right' });

  regMarks(44);
  grain(24);
}

// ================= 版式 B：时差 =================
function buildB() {
  const bandTop = H * .665, gy = H * .945;
  const midX = W * .5, gapW = W * .075;
  paperBg();
  blueBand(bandTop, H + 10, { base: .26, angle: 12, groundY: H * .945 });

  // 中间撕开一条纸白：两个人被这道空白隔开
  c.save();
  c.fillStyle = INK.paper;
  const N = 26, Lp = [], Rp = [];
  for (let i = 0; i <= N; i++) {
    const k = i / N, y = bandTop - 26 + (H - bandTop + 56) * k;
    const x = midX + Math.sin(k * 2.2) * W * .020 + (hash(i * 5.3) - .5) * W * .004;
    const w = gapW * (.86 + .22 * hash(i * 3.7));
    Lp.push([x - w * .5, y]); Rp.push([x + w * .5, y]);
  }
  c.beginPath();
  c.moveTo(Lp[0][0], Lp[0][1]);
  for (const [x, y] of Lp) c.lineTo(x, y);
  for (let i = Rp.length - 1; i >= 0; i--) c.lineTo(Rp[i][0], Rp[i][1]);
  c.closePath(); c.fill();
  // 撕口边缘的纸纤维
  c.strokeStyle = INK.paper; c.globalAlpha = .75; c.lineWidth = 1.6;
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1, p = (i < 13 ? Lp : Rp)[i % 13];
    c.beginPath(); c.moveTo(p[0], p[1]);
    c.lineTo(p[0] + side * (10 + 16 * hash(i * 11)), p[1] + (hash(i * 7) - .5) * 12); c.stroke();
  }
  c.restore();

  const fh = H * .265;
  groundLine(gy, .22);
  groundShadow(W * .360, gy, fh);
  groundShadow(W * .640, gy, fh * .98);
  figure3(W * .360, gy, fh, { main: INK.clay, ghostA: INK.pink, ghostB: INK.blue, offA: [-16, 12], offB: [14, -10] });
  figure3(W * .640, gy, fh * .98, { main: INK.pinkDk, ghostA: INK.clay, ghostB: INK.blue, offA: [16, -12], offB: [-14, 10], lean: 5 });

  // 主标题
  const ts = Math.min(W * .245, 470);
  title3('时差', W * .5, H * .436, ts, ts * .17);

  drawSpaced('我们的爱总有时差', W * .5, H * .556, 46, 19, INK.blueDk, { alpha: .95 });
  drawSpaced('把回忆拼好给你', W * .5, H * .610, 32, 15, INK.clayDk, { alpha: .95 });

  drawSpaced('RISOGRAPH', 76, 104, 24, 8, INK.blueDk, { alpha: .85, font: 'KT, serif', align: 'left' });
  drawSpaced('60 SEC', W - 76, H - 78, 24, 7, INK.blueDk, { alpha: .85, font: 'KT, serif', align: 'right' });

  regMarks(44);
  grain(24);
}


// ================= 版式 C：歌名主位 =================
function buildC() {
  const bandTop = H * .545, gy = H * .945;
  paperBg();
  blueBand(bandTop, H + 10, { base: .25, angle: 16, groundY: gy });

  const fh = H * .302;
  groundLine(gy, .30);
  groundShadow(W * .447, gy, fh);
  groundShadow(W * .553, gy, fh * .98);
  figure3(W * .447, gy, fh, { main: INK.clay, ghostA: INK.pink, ghostB: INK.blue, offA: [-17, 13], offB: [15, -10] });
  figure3(W * .553, gy, fh * .98, { main: INK.pinkDk, ghostA: INK.clay, ghostB: INK.blue, offA: [16, -11], offB: [-14, 10], lean: -5 });

  scraps(gy - H * .06, 20);

  // 歌名铺满 87% 宽
  const ts = fitSize('把回忆拼好给你', .08, W * .87);
  title3('把回忆拼好给你', W * .5, H * .372, ts, ts * .08);

  // 副：套不准 + 两侧短线
  const subY = H * .472, subW = measureSpaced('套不准', 58, 24);
  drawSpaced('套不准', W * .5, subY, 58, 24, INK.blueDk, { alpha: .95 });
  c.save();
  c.fillStyle = INK.blueDk; c.globalAlpha = .55;
  c.fillRect(W * .5 - subW / 2 - 88, subY - 20, 58, 2.4);
  c.fillRect(W * .5 + subW / 2 + 30, subY - 20, 58, 2.4);
  c.restore();

  drawSpaced('RISOGRAPH / 3 PLATES', 76, 104, 24, 8, INK.blueDk, { alpha: .85, font: 'KT, serif', align: 'left' });
  drawSpaced('60 SEC', W - 76, H - 78, 24, 7, INK.blueDk, { alpha: .85, font: 'KT, serif', align: 'right' });

  regMarks(44);
  grain(24);
}

async function main() {
  await document.fonts.load('400px XK');
  await document.fonts.load('400px KT');
  await document.fonts.ready;
  SEED = 20261103;
  (VAR === 'B' ? buildB : VAR === 'C' ? buildC : buildA)();
  window.__ready = true;
}
main();
