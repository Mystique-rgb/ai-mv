// main.js — 合成：纸 → 镜 → 套印/闪帧/擦除
var SS = 2;
const SCRATCH = { c: null, x: null };

function initCanvas() {
  const cv = document.getElementById('out');
  cv.width = W * SS; cv.height = H * SS;
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  CTX = cv.getContext('2d', { alpha: false });
  window.CTX = CTX;
  SCRATCH.c = document.createElement('canvas');
  SCRATCH.c.width = W * SS; SCRATCH.c.height = H * SS;
  SCRATCH.x = SCRATCH.c.getContext('2d');
}

// ---------- 转场库 ----------
// 只在段落/情绪拐点用（16 次），其余硬切。
// ⚠ M2(123.98) 与 M3(141.76) 永远硬切 —— 那两拍是最强的，任何遮挡都在毁它。
const TRANS = [
  { at: 16.24, type: 'pull', dur: .40 },    // 抽纸
  { at: 30.21, type: 'split', dur: .38 },   // 撕开
  { at: 43.76, type: 'page', dur: .42 },    // 翻页
  { at: 55.84, type: 'misreg', dur: .34 },  // 套印错位
  { at: 71.44, type: 'wipe', dur: .44 },    // 网点擦除
  { at: 101.31, type: 'wipe', dur: .42 },
  { at: 130.08, type: 'split', dur: .36 },
  { at: 142.40, type: 'misreg', dur: .30 },
  { at: 156.72, type: 'page', dur: .42 },
  { at: 179.09, type: 'pull', dur: .40 },
  { at: 195.54, type: 'wipe', dur: .44 },
  { at: 199.44, type: 'pull', dur: .34 },
  { at: 203.04, type: 'flash', dur: .16 },  // 章砸空：白闪，不遮
  { at: 212.53, type: 'page', dur: .44 },
  { at: 226.66, type: 'pull', dur: .36 },
];
function transAt(t) {
  for (const x of TRANS) if (t >= x.at && t < x.at + x.dur) return { x, k: (t - x.at) / x.dur };
  return null;
}

// 把"上一镜的最后一帧"印到暂存画布，转场时当素材用
function captureInto(c, t) {
  const prev = CTX;
  CTX = c;
  CTX.setTransform(SS, 0, 0, SS, 0, 0);
  CTX.globalCompositeOperation = 'source-over'; CTX.globalAlpha = 1;
  CTX.fillStyle = PAL.paper; CTX.fillRect(0, 0, W, H);
  const sh = shotAt(t);
  (sh ? (SHOTFN[sh.id] || FALLBACK) : FALLBACK)(t);
  CTX = prev;
}

// 抽纸：上一张纸从画面里被抽走（边上有纸边和白条）
function trPull(k) {
  const ctx = CTX, e = easeIn(k), y = -e * H * 1.06;
  ctx.save();
  ctx.drawImage(SCRATCH.c, 0, y, W, H);
  ctx.fillStyle = '#FFFDF4'; ctx.fillRect(0, y + H - 9, W, 9);
  const g = ctx.createLinearGradient(0, y + H, 0, y + H + 140);
  g.addColorStop(0, 'rgba(24,16,6,.34)'); g.addColorStop(1, 'rgba(24,16,6,0)');
  ctx.fillStyle = g; ctx.fillRect(0, y + H, W, 140);
  ctx.restore();
  // 抽走时留下的齿孔
  ctx.save(); ctx.globalAlpha = (1 - k) * .5; ctx.fillStyle = PAL.ink;
  for (let i = 0; i < 46; i++) { ctx.beginPath(); ctx.arc(i * 44 + 20, y + H + 22, 4, 0, PI2); ctx.fill(); }
  ctx.restore();
}

// 翻页：上一页从右往左折过去
function trPage(k) {
  const ctx = CTX, e = easeOut(k), w = W * (1 - e);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, Math.max(0, w), H); ctx.clip();
  ctx.drawImage(SCRATCH.c, 0, 0, W, H);
  const g = ctx.createLinearGradient(Math.max(0, w - 120), 0, w, 0);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(30,20,8,.38)');
  ctx.fillStyle = g; ctx.fillRect(Math.max(0, w - 120), 0, 120, H);
  ctx.restore();
  ctx.save(); ctx.fillStyle = '#FFFDF4'; ctx.fillRect(w - 7, 0, 7, H); ctx.restore();
  // 掀起来的页角阴影
  ctx.save(); ctx.globalAlpha = .18 * (1 - k); ctx.fillStyle = '#120C04';
  ctx.beginPath(); ctx.moveTo(w, 0); ctx.lineTo(w + 160 * (1 - k), 0); ctx.lineTo(w, H * .45); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// 撕开：上一帧从中间裂成两半，各往两边滑开
function trSplit(k) {
  const ctx = CTX, d = easeOut(k) * W * .66;
  const sw = SCRATCH.c.width / 2, sh = SCRATCH.c.height;
  ctx.save();
  // 左半张：只画图的一半，整块往左推
  ctx.drawImage(SCRATCH.c, 0, 0, sw, sh, -d, 0, W / 2, H);
  // 右半张：往右推
  ctx.drawImage(SCRATCH.c, sw, 0, sw, sh, W / 2 + d, 0, W / 2, H);
  ctx.restore();
  // 撕口：两道不齐的白边
  ctx.save(); ctx.fillStyle = '#FFFDF4';
  for (const sx of [-1, 1]) {
    const x0 = W / 2 + sx * d;
    ctx.beginPath(); ctx.moveTo(x0, 0);
    for (let i = 0; i <= 20; i++) ctx.lineTo(x0 + (hash2(i, sx + 3) - .5) * 26, i * H / 20);
    ctx.lineTo(x0 + sx * 12, H); ctx.lineTo(x0 - sx * 4, H); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// 套印错位：把这一帧自己当成偏掉的色版再压一遍（像真印厂套不准，不是双曝光）
function trMisreg(k) {
  const ctx = CTX, cv = document.getElementById('out'), a = (1 - k);
  const sx = SCRATCH.x;
  sx.setTransform(1, 0, 0, 1, 0, 0);
  sx.clearRect(0, 0, cv.width, cv.height);
  sx.drawImage(cv, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = .55 * (1 - k);
  ctx.drawImage(SCRATCH.c, -12 * a - 2, 3 * a + 1, W, H);
  ctx.globalAlpha = .3 * (1 - k);
  ctx.drawImage(SCRATCH.c, 6 * a, -2 * a, W, H);
  ctx.restore();
}

// 网点擦除（T1）：粗网格圆点长满全屏再退，转场在完全覆盖时发生
function dotWipe(prog, color) {
  const ctx = CTX, step = 46;
  const cols = Math.ceil(W / step) + 2, rows = Math.ceil(H / step) + 2;
  const grow = prog < .5 ? prog * 2 : (1 - prog) * 2;
  ctx.save(); ctx.fillStyle = color || PAL.ink; ctx.beginPath();
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = i * step, y = j * step;
    const delay = (i / cols + j / rows) / 2 * .42;
    const k = clamp((grow - delay) / (1 - .42));
    if (k <= 0) continue;
    const r = easeOut(k) * step * .78;
    ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, PI2);
  }
  ctx.fill(); ctx.restore();
}

function shotAt(t) {
  for (const s of SHOTLIST) if (t >= s.t0 && t < s.t1) return s;
  return null;
}

function render(t) {
  CTX.setTransform(SS, 0, 0, SS, 0, 0);
  CTX.globalCompositeOperation = 'source-over';
  CTX.globalAlpha = 1;
  // 转场：需要上一帧的先抓一帧
  const tr = transAt(t);
  if (tr && (tr.x.type === 'pull' || tr.x.type === 'page' || tr.x.type === 'split')) captureInto(SCRATCH.x, tr.x.at - .02);
  CTX.fillStyle = PAL.paper; CTX.fillRect(0, 0, W, H);
  const sh = shotAt(t);
  const fn = sh ? (SHOTFN[sh.id] || FALLBACK) : FALLBACK;
  fn(t);
  if (tr) {
    if (tr.x.type === 'pull') trPull(tr.k);
    else if (tr.x.type === 'page') trPage(tr.k);
    else if (tr.x.type === 'split') trSplit(tr.k);
    else if (tr.x.type === 'misreg') trMisreg(tr.k);
    else if (tr.x.type === 'wipe') dotWipe(tr.k, PAL.ink);
    else if (tr.x.type === 'flash') {
      CTX.save(); CTX.globalAlpha = .6 * (1 - tr.k) ** 1.6; CTX.fillStyle = '#FFFDF4';
      CTX.fillRect(0, 0, W, H); CTX.restore();
    }
  }
  // 闪帧（≤0.5，2 帧反相）
  const f = window.FLASH;
  if (f && f.a > 0) {
    const d = t - f.at;
    if (d >= 0 && d < f.dur) {
      CTX.save();
      if (f.invert && d < .067) { CTX.globalCompositeOperation = 'difference'; CTX.fillStyle = '#FFFFFF'; CTX.globalAlpha = .85; CTX.fillRect(0, 0, W, H); }
      else { CTX.fillStyle = '#FFFDF4'; CTX.globalAlpha = f.a * (1 - d / f.dur) ** 1.4; CTX.fillRect(0, 0, W, H); }
      CTX.restore();
    }
  }
  // 颗粒叠在最上（印刷品的脏）
  CTX.save(); CTX.globalAlpha = .5;
  const r = srand(500 + Math.floor(t * 12));
  CTX.fillStyle = 'rgba(255,252,242,.5)';
  CTX.beginPath();
  for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * H, s = .6 + r() * 1.3; CTX.moveTo(x + s, y); CTX.arc(x, y, s, 0, PI2); }
  CTX.fill(); CTX.restore();
}

window.render = render;
window.SS = SS;

(async function boot() {
  initCanvas();
  const corpus = SONG.lines.map(l => l.text).join('')
    + '遗失物认领单认领申请人时间地点物品描述有效期至受理补正过期受理RECEIVEDNEEDMOREEXPIRED'
    + '取号票窗口打开关闭逾期未领取者视为放弃第页共本案卷号于年月日签字方原主1米线'
    + '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ:. -/请号到自门动';
  const loads = [];
  for (const [spec, fam] of [['900 40px "SerifHeavy"', 'serif'], ['700 40px "Kaiti"', 'kai'], ['700 40px "Mono"', 'mono']]) {
    try { loads.push(document.fonts.load(spec, corpus)); } catch (e) { }
  }
  await Promise.all(loads);
  await document.fonts.ready;
  render(0);
  window.READY = true;
})();
