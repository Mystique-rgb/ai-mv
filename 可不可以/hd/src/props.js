// props.js — 道具与场地：表格、号票、窗口、大厅、便利店、拍立得、附件、笔、剪影
const FORM_W = 760, FORM_H = 1075;   // A4 比例

// ---------- 表格 ----------
// st: 0 干净 / 1 折痕 / 2 咖啡渍 / 3 起毛 / 4 盖穿一个洞
function formSheet(x, y, w, st = 0, o = {}) {
  const ctx = CTX, k = w / FORM_W, h = FORM_H * k;
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot * Math.PI / 180);
  const paperC = o.paperC || '#FBF5E6';
  shape(rectPts(-w / 2, -h / 2, w, h), { fill: paperC, ink: PAL.ink, sw: 5, seed: 71 });
  ctx.save(); ctx.translate(-w / 2, -h / 2);
  // 表头
  txt('遗失物认领单', w * .5, 74 * k, { size: 62 * k, font: FONT.serif, weight: 900, color: PAL.ink, align: 'center', spacing: 3 * k });
  txt('CLAIM FOR A LOST ITEM', w * .5, 108 * k, { size: 19 * k, font: FONT.mono, weight: 700, color: PAL.ink, align: 'center', spacing: 5 * k, alpha: .8 });
  inkLine([[40 * k, 126 * k], [w - 40 * k, 126 * k]], { sw: 3.4, seed: 72, amp: .8, dash: [12 * k, 8 * k] });
  txt('案卷号 KB-2019-0703', 48 * k, 160 * k, { size: 20 * k, font: FONT.mono, weight: 700, color: PAL.ink, alpha: .82, spacing: 1.4 * k });
  txt('受理日 2026.11.08', w - 48 * k, 160 * k, { size: 20 * k, font: FONT.mono, weight: 700, color: PAL.ink, alpha: .82, align: 'right', spacing: 1.4 * k });
  // 五栏
  const rows = [
    ['申请人', o.applicant ?? '', ''],
    ['遗失时间', o.time ?? '', ''],
    ['遗失地点', o.place ?? '', ''],
    ['物品描述', o.desc ?? '', ''],
    ['有效期至', o.expiry ?? '2022.07.03', 'expiry'],
  ];
  let ry = 196 * k;
  for (const [label, val, tag] of rows) {
    const rh = tag === 'expiry' ? 96 * k : 118 * k;
    shape(rrectPts(40 * k, ry, w - 80 * k, rh, 4 * k), { fill: 'none', fill2: null, ink: PAL.ink, sw: 3.6, seed: 73 + ry, gap: false, boil: false });
    txt(label, 58 * k, ry + 30 * k, { size: 24 * k, font: FONT.kai, weight: 700, color: PAL.ink, alpha: .92 });
    inkLine([[58 * k, ry + 40 * k], [232 * k, ry + 40 * k]], { sw: 2.4, seed: 74 + ry, amp: .6, alpha: .5 });
    if (val) {
      const big = tag === 'expiry';
      txt(val, 250 * k, ry + (big ? 68 : 62) * k, {
        size: (big ? 62 : 40) * k, font: big ? FONT.mono : FONT.kai, weight: big ? 700 : 700,
        color: tag === 'expiry' ? PAL.red : PAL.ink, spacing: big ? 3 * k : 1 * k,
      });
    }
    ry += rh + 12 * k;
  }
  // 页码与条形码
  if (o.page) txt(`P.${String(o.page).padStart(3, '0')}`, w - 48 * k, h - 34 * k, { size: 22 * k, font: FONT.mono, weight: 700, color: PAL.ink, align: 'right', alpha: .8 });
  const bx = 48 * k, by = h - 78 * k;
  for (let i = 0; i < 42; i++) { const bw = (i % 3 === 0 ? 3.2 : 1.6) * k; ctx.fillStyle = 'rgba(27,42,68,.55)'; ctx.fillRect(bx + i * 4.6 * k, by, bw, 34 * k); }
  // 纸的状态
  if (st >= 1) inkLine([[w * .5, 8 * k], [w * .5 + 4 * k, h - 8 * k]], { sw: 2.2, seed: 76, amp: 1.2, alpha: .35 });
  if (st >= 2) {
    ctx.save(); ctx.globalAlpha = .16; ctx.fillStyle = '#7A5230';
    ctx.beginPath(); ctx.ellipse(w * .74, h * .60, 62 * k, 44 * k, .3, 0, PI2); ctx.fill();
    ctx.globalAlpha = .1; ctx.beginPath(); ctx.ellipse(w * .74, h * .60, 76 * k, 56 * k, .3, 0, PI2); ctx.fill();
    ctx.restore();
  }
  if (st >= 3) {
    ctx.save(); ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 26; i++) { const r = srand(88 + i)(); ctx.beginPath(); ctx.arc(r * w, h - 4 * k, (4 + r * 9) * k, 0, PI2); ctx.fill(); }
    ctx.restore();
  }
  if (st >= 4) {
    ctx.save(); ctx.globalAlpha = .9; ctx.fillStyle = PAL.paper;
    ctx.beginPath(); ctx.ellipse(w * .42, 196 * k + 4 * 130 * k, 26 * k, 18 * k, .2, 0, PI2); ctx.fill(); ctx.restore();
  }
  ctx.restore(); ctx.restore();
  return { w, h };
}

// ---------- 号票 ----------
function ticket(x, y, w, o = {}) {
  const ctx = CTX, h = w * 1.9;
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot * Math.PI / 180);
  shape(rrectPts(-w / 2, -h / 2, w, h, w * .06), { fill: '#FBF5E6', ink: PAL.ink, sw: 5, seed: 91 });
  txt('取号票', 0, -h * .30, { size: w * .19, font: FONT.kai, weight: 700, color: PAL.ink, align: 'center', alpha: .85 });
  txt(o.no || 'A047', 0, h * .10, { size: w * .46, font: FONT.mono, weight: 700, color: o.hot ? PAL.red : PAL.ink, align: 'center', spacing: 2 });
  txt('3 号窗口', 0, h * .35, { size: w * .17, font: FONT.mono, weight: 700, color: PAL.ink, align: 'center', alpha: .7 });
  inkLine([[-w * .38, -h * .17], [w * .38, -h * .17]], { sw: 2.6, seed: 92, amp: .6, dash: [7, 6], alpha: .6 });
  inkLine([[-w * .38, h * .22], [w * .38, h * .22]], { sw: 2.6, seed: 93, amp: .6, dash: [7, 6], alpha: .6 });
  ctx.restore();
}

// ---------- 办事窗口 ----------
// 一格窗口：外框、玻璃、下沿的收件缝。玻璃上可叠网点反光
function counter(x, y, w, h, o = {}) {
  const ctx = CTX;
  const frame = o.frame || '#E4D8BE';
  shape(rectPts(x, y, w, h), { fill: frame, ink: PAL.ink, sw: 6, seed: 101, gap: false });
  // 玻璃（内凹）
  const gx = x + 26, gy = y + 26, gw = w - 52, gh = h - 96;
  shape(rectPts(gx, gy, gw, gh), { fill: o.dark ? '#0B1220' : '#22344F', ink: PAL.ink, sw: 4, seed: 102, gap: false });
  if (!o.dark) {
    ctx.save(); ctx.globalAlpha = .5;
    dots({ x: gx, y: gy, w: gw, h: gh }, D.ramp(.10, .42, 115), { step: 20, color: '#3E5C7A', angle: 45 });
    ctx.restore();
    // 反光斜条
    ctx.save(); ctx.globalAlpha = .18; ctx.fillStyle = PAL.paper;
    ctx.beginPath(); ctx.moveTo(gx + gw * .18, gy); ctx.lineTo(gx + gw * .42, gy); ctx.lineTo(gx + gw * .18, gy + gh); ctx.lineTo(gx - gw * .06, gy + gh); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // 收件缝
  shape(rectPts(x + 44, y + h - 62, w - 88, 15), { fill: '#0B1220', ink: PAL.ink, sw: 3, seed: 103, gap: false });
  // 台面
  shape(rectPts(x - 16, y + h + 6, w + 32, 26), { fill: o.frame2 || '#D8C9A9', ink: PAL.ink, sw: 4, seed: 104, gap: false });
  // 窗口号
  txt(o.no || '3', x + w - 30, y + 52, { size: 34, font: FONT.mono, weight: 700, color: o.dark ? PAL.paper : PAL.ink, align: 'right', alpha: .85 });
  return { gx, gy, gw, gh };
}

// ---------- 叫号屏 ----------
function numberScreen(x, y, w, o = {}) {
  const ctx = CTX, h = w * .50;
  shape(rrectPts(x, y, w, h, 6), { fill: '#111A2B', ink: PAL.ink, sw: 5, seed: 111, gap: false });
  txt('请 A047 号到 3 号窗口', x + w / 2, y + h * .32, { size: w * .058, font: FONT.mono, weight: 700, color: PAL.teal, align: 'center', alpha: .9, spacing: 1 });
  const no = o.no || '047';
  txt('A' + no, x + w / 2, y + h * .80, { size: h * .42, font: FONT.mono, weight: 700, color: PAL.yellow, align: 'center', spacing: 6 });
  if (o.flap != null) {
    // 翻牌中线
    ctx.save(); ctx.globalAlpha = .5; ctx.fillStyle = '#0B1220';
    ctx.fillRect(x + 16, y + h * .56, w - 32, 2); ctx.restore();
  }
}

// ---------- 大厅 ----------
function hall(t, o = {}) {
  const ctx = CTX, lit = o.lit ?? 1;
  // 后墙
  shape(rectPts(-40, 120, W + 80, 760), { fill: '#E7DAC0', ink: null, seed: 121, boil: false });
  // 墙裙
  shape(rectPts(-40, 700, W + 80, 180), { fill: '#DCCDAF', ink: PAL.ink, sw: 5, seed: 122, gap: false });
  // 四个窗口
  const n = 4, ww = 336, gap = 44, x0 = (W - (n * ww + (n - 1) * gap)) / 2;
  for (let i = 0; i < n; i++) {
    const wx = x0 + i * (ww + gap);
    counter(wx, 232, ww, 330, { no: String(i + 1), dark: i === 2 ? false : false });
    if (i === 0) {
      // 1 号窗口落下卷帘
      shape(rectPts(wx + 26, 258, ww - 52, 300), { fill: '#D3C4A4', ink: PAL.ink, sw: 4, seed: 123, gap: false });
      for (let j = 0; j < 9; j++) inkLine([[wx + 34, 272 + j * 33], [wx + ww - 34, 272 + j * 33]], { sw: 2.6, seed: 124 + j, amp: .7, alpha: .5 });
    }
    if (i === 3) {
      counter(wx, 232, ww, 330, { no: '4', dark: true });
    }
    silhouette(wx + ww * .52, 552, 150, { alpha: .55 });
  }
  // 叫号屏
  numberScreen(W * .5 - 170, 34, 340, { no: '047' });
  // 顶灯
  for (let i = 0; i < 4; i++) {
    const lx = 320 + i * 440;
    shape(rectPts(lx - 120, 128, 240, 14), { fill: '#FBF5E6', ink: PAL.ink, sw: 3, seed: 160 + i, gap: false });
    CTX.save(); CTX.globalAlpha = .07;
    CTX.fillStyle = PAL.yellow; CTX.fillRect(lx - 130, 142, 260, 210);
    CTX.restore();
  }
  // 地面
  shape(rectPts(-40, 880, W + 80, 240), { fill: '#CFC0A2', ink: null, seed: 131, boil: false });
  inkLine([[-40, 882], [W + 40, 882]], { sw: 7, seed: 132, amp: 1, alpha: .85 });
  ctx.save(); ctx.globalAlpha = .16;
  dots({ x: 0, y: 882, w: W, h: 240 }, D.band(.01, .09, 0, 1), { step: 24, color: PAL.ink, angle: 15 });
  ctx.restore();
  // 1 米线
  const ly = 906;
  ctx.save(); ctx.globalAlpha = .5; ctx.setLineDash([26, 20]);
  ctx.strokeStyle = PAL.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(120, ly); ctx.lineTo(W - 120, ly); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
  shape(rectPts(860, ly - 46, 124, 34), { fill: PAL.paper, ink: null, seed: 133, boil: false });
  txt('1 米线', 872, ly - 20, { size: 24, font: FONT.kai, weight: 700, color: PAL.red, alpha: .95 });
  // 排队剪影
  const q = [{ x: 300, h: 220, s: 1 }, { x: 420, h: 250, s: 0 }, { x: 1290, h: 235, s: 0 }, { x: 1400, h: 215, s: 1 }, { x: 1660, h: 245, s: 0 }];
  for (const p of q) silhouette(p.x + Math.sin(t * .6 + p.x) * 2, 968, p.h, { hot: p.s });
  // 塑料椅
  for (let i = 0; i < 5; i++) {
    const cx = 1180 + i * 74;
    shape(rrectPts(cx, 830, 58, 52, 6), { fill: '#C8B794', ink: PAL.ink, sw: 4, seed: 141 + i, gap: false });
    shape(rectPts(cx, 872, 6, 34), { fill: '#C8B794', ink: PAL.ink, sw: 3, seed: 146 + i, gap: false });
  }
  // 灯灭一半
  if (lit < 1) {
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 1 - lit;
    ctx.fillStyle = '#3C4A63'; ctx.fillRect(-40, 120, W + 80, 1000); ctx.restore();
  }
}

// 无脸剪影：纯主墨平涂 + 一处红/黄的点
function silhouette(x, y, h, o = {}) {
  const ctx = CTX, u = h / 8;
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = o.alpha ?? .92;
  const body = [[-2.4 * u, 0], [-2.4 * u, -3.2 * u], [-2.0 * u, -5.4 * u], [-1.2 * u, -6.6 * u], [0, -7.0 * u],
                [1.2 * u, -6.6 * u], [2.0 * u, -5.4 * u], [2.4 * u, -3.2 * u], [2.4 * u, 0]];
  shape(body, { fill: PAL.ink, ink: null, seed: x | 0, amp: 1.4 });
  ctx.beginPath(); ctx.arc(0, -7.6 * u, 1.05 * u, 0, PI2); ctx.fillStyle = PAL.ink; ctx.fill();
  if (o.hot) { ctx.beginPath(); ctx.arc(1.0 * u, -4.4 * u, .30 * u, 0, PI2); ctx.fillStyle = o.hot === 2 ? PAL.yellow : PAL.red; ctx.fill(); }
  ctx.restore();
}

// ---------- 便利店（夜） ----------
function storeFront(t, o = {}) {
  const ctx = CTX;
  const bx = 430, by = 120, bw = 1200, bh = 830;
  // 招牌
  shape(rectPts(bx, by - 74, bw, 74), { fill: '#1B2A44', ink: PAL.ink, sw: 6, seed: 151, gap: false });
  txt('便 利 店', bx + 54, by - 22, { size: 42, font: FONT.kai, weight: 700, color: PAL.paper, spacing: 8 });
  txt('24H', bx + bw - 54, by - 22, { size: 34, font: FONT.mono, weight: 700, color: PAL.yellow, align: 'right', spacing: 3 });
  // 店内暖光（夜里的灯，不是白天）
  shape(rectPts(bx, by, bw, bh), { fill: '#D9B471', ink: null, seed: 152, boil: false });
  shape(rectPts(bx, by + bh * .58, bw, bh * .42), { fill: '#9A7440', ink: null, seed: 157, boil: false });
  // 货架：横板 + 商品块
  for (let i = 0; i < 3; i++) {
    const sy = by + 170 + i * 150;
    inkLine([[bx + 30, sy + 96], [bx + bw - 30, sy + 96]], { sw: 7, seed: 153 + i, amp: .9, alpha: .8 });
    const r = srand(310 + i);
    let px = bx + 48;
    while (px < bx + bw - 90) {
      const w2 = 26 + r() * 46, h2 = 34 + r() * 44;
      const cols = ['#F2E8D5', '#D4482F', '#2F7E8A', '#E0A81E', '#F2E8D5'];
      const c = cols[Math.floor(r() * cols.length)];
      shape(rectPts(px, sy + 96 - h2, w2, h2), { fill: c, ink: PAL.ink, sw: 3.2, seed: 320 + (px | 0), gap: false, inkAlpha: .5 });
      px += w2 + 12 + r() * 16;
    }
  }
  // 收银台
  shape(rectPts(bx + bw - 320, by + bh - 230, 300, 230), { fill: '#7A5B32', ink: PAL.ink, sw: 5, seed: 155, gap: false });
  silhouette(bx + bw - 180, by + bh - 236, 200, { alpha: .85 });
  // 关东煮锅 + 蒸汽
  shape(rrectPts(bx + 96, by + bh - 214, 236, 158, 10), { fill: '#7E6C50', ink: PAL.ink, sw: 6, seed: 156 });
  shape(rrectPts(bx + 112, by + bh - 198, 204, 126, 6), { fill: '#B79A66', ink: PAL.ink, sw: 4, seed: 157 });
  for (let i = 0; i < 3; i++) {
    shape(rrectPts(bx + 126 + i * 64, by + bh - 186, 44, 40, 8), { fill: '#EFE0BE', ink: PAL.ink, sw: 3, seed: 158 + i });
    shape(ellPts(bx + 148 + i * 64, by + bh - 166, 14, 9, 10), { fill: '#C98B5A', ink: null, seed: 161 + i, boil: false });
  }
  inkLine([[bx + 118, by + bh - 148], [bx + 308, by + bh - 148]], { sw: 4, seed: 164, alpha: .6 });
  for (let i = 0; i < 3; i++) {
    const ph = (t * .55 + i * .33) % 1;
    ctx.save(); ctx.globalAlpha = .45 * (1 - ph);
    dots({ x: bx + 104 + i * 66, y: by + bh - 230 - ph * 200, w: 60, h: 180 }, D.radial(.5, .85, .5, .5, 0), { step: 13, color: PAL.paper, angle: 30 });
    ctx.restore();
  }
  // 玻璃门（两扇），竖条网点 = 湿气
  ctx.save(); ctx.globalAlpha = .13; ctx.fillStyle = PAL.paper;
  ctx.fillRect(bx + 26, by + 26, bw - 52, bh - 52); ctx.restore();
  ctx.save(); ctx.globalAlpha = .13;
  dots({ x: bx + 26, y: by + 26, w: bw - 52, h: bh - 52 }, (u, v) => .08 + .16 * Math.abs(Math.sin(u * 22 + t * .5)), { step: 18, color: '#9FC6CC', angle: 70 });
  ctx.restore();
  // 门框：四边 + 中缝（只有框，不填满）
  const fw = 18;
  for (const r of [[bx, by, bw, fw], [bx, by + bh - fw, bw, fw], [bx, by, fw, bh], [bx + bw - fw, by, fw, bh], [bx + bw / 2 - fw / 2, by, fw, bh]]) {
    shape(rectPts(r[0], r[1], r[2], r[3]), { fill: '#22344F', ink: PAL.ink, sw: 4, seed: 161, gap: false });
  }
  // 门把手
  for (const hx of [bx + bw / 2 - 60, bx + bw / 2 + 40]) inkLine([[hx, by + bh * .46], [hx, by + bh * .62]], { sw: 9, seed: 162, alpha: .85 });
  // 玻璃反光斜条
  ctx.save(); ctx.globalAlpha = .10; ctx.fillStyle = PAL.paper;
  ctx.beginPath(); ctx.moveTo(bx + 120, by + bh); ctx.lineTo(bx + 300, by); ctx.lineTo(bx + 420, by); ctx.lineTo(bx + 240, by + bh); ctx.closePath(); ctx.fill();
  ctx.restore();
  // 自动门贴纸
  txt('自 动 门', bx + bw / 2, by + bh - 60, { size: 30, font: FONT.kai, weight: 700, color: PAL.paper, align: 'center', alpha: .7, spacing: 4 });
  shape(rectPts(bx + bw / 2 - 92, by + bh - 92, 184, 44), { fill: '#1B2A44', ink: null, seed: 163, boil: false });
  txt('AUTO DOOR', bx + bw / 2, by + bh - 62, { size: 24, font: FONT.mono, weight: 700, color: PAL.yellow, align: 'center', alpha: .9, spacing: 3 });
  return { bx, by, bw, bh };
}
// 玻璃上的手印：先是一片呼出来的雾，再被手掌抹开（露出手形），掌心渗满纯粉
function handprint(cx, cy, s, o = {}) {
  const ctx = CTX, pink = o.pink ?? 0;
  ctx.save(); ctx.translate(cx, cy);
  ctx.globalAlpha = o.alpha ?? 1;
  const fingers = [[-.74, -1.02, 1.18, .34, -.20], [-.35, -1.44, 1.50, .35, -.06], [.04, -1.56, 1.58, .35, 0], [.42, -1.40, 1.40, .34, .08], [.76, -1.02, 1.08, .30, .22]];
  // 1) 雾：一圈不规则的纸白网点（呼出来的那一口气）
  const fog = [];
  for (let i = 0; i < 40; i++) {
    const a = i / 40 * PI2, r = (1.55 + .30 * Math.sin(i * 2.7)) * s;
    fog.push([Math.cos(a) * r * .95, Math.sin(a) * r * .80 - .35 * s]);
  }
  ctx.save(); ctx.globalAlpha *= .5;
  shape(fog, { fill: 'rgba(246,238,220,.30)', ink: null, seed: 171, boil: false });
  ctx.restore();
  // 2) 手形：纸白粗边 + 主墨细边（在亮货架和暗玻璃上都读得出）
  const parts = [];
  for (const [fx, fy, fl, fw, ang] of fingers) parts.push({ fx, fy, fl, fw, ang });
  const handPath = (fill, ink, sw1, sw2) => {
    for (const [fx, fy, fl, fw, ang] of fingers) {
      ctx.save(); ctx.translate(fx * s, fy * s); ctx.rotate(ang);
      const pts = rrectPts(-fw * s / 2, -fl * s, fw * s, fl * s + .66 * s, fw * s / 2);
      if (fill) { shape(pts, { fill, ink: null, seed: 172, boil: false }); }
      if (ink) {
        shape(pts, { fill: null, ink: PAL.paper, sw: sw1, seed: 172, gap: false, boil: false });
        shape(pts, { fill: null, ink, sw: sw2, seed: 172, gap: false, boil: false });
      }
      ctx.restore();
    }
    const palm = ellPts(0, 0, .66 * s, .60 * s, 20);
    if (fill) shape(palm, { fill, ink: null, seed: 173, boil: false });
    if (ink) {
      shape(palm, { fill: null, ink: PAL.paper, sw: sw1, seed: 173, gap: false, boil: false });
      shape(palm, { fill: null, ink, sw: sw2, seed: 173, gap: false, boil: false });
    }
  };
  handPath('rgba(26,34,54,.26)', null, 0, 0);
  handPath(null, PAL.ink, 11, 4.5);
  // 3) 掌心渗出来的满纯粉（从雾里透出来的那一小块）
  if (pink > 0) {
    ctx.save();
    ctx.globalAlpha = 1;
    // 掌心的那一块（指甲盖大小 → 一层网点晕）
    dots({ x: -.5 * s, y: -.62 * s, w: 1.0 * s, h: 1.2 * s }, D.radial(.5, .42, .62, 1.0 * pink, 0), { step: 9, color: PAL.pink, angle: 30 });
    ctx.fillStyle = PAL.pink;
    ctx.beginPath(); ctx.ellipse(0, -.04 * s, .26 * s * pink, .30 * s * pink, .08, 0, PI2); ctx.fill();
    // 五指指尖各一点（她的指印）
    for (const [fx, fy, fl, , ang] of fingers) {
      const tx = fx * s - Math.sin(ang) * .04 * s, ty = fy * s - fl * s + .10 * s;
      ctx.globalAlpha = .85 * pink;
      ctx.beginPath(); ctx.ellipse(tx, ty, .075 * s * pink, .085 * s * pink, ang, 0, PI2); ctx.fill();
    }
    // 往下渗的一道
    ctx.globalAlpha = 1;
    const drip = clamp((pink - .45) / .5);
    if (drip > 0) {
      ctx.globalAlpha = drip * .75; ctx.strokeStyle = PAL.pink; ctx.lineWidth = .10 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(.02 * s, .18 * s); ctx.quadraticCurveTo(.06 * s, .55 * s, -.02 * s, .86 * s); ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

// ---------- 拍立得 ----------
function polaroid(x, y, w, o = {}) {
  const ctx = CTX, k = w / 420, pad = 20 * k, ph = 420 * k, hh = ph + pad * 2 + 74 * k;
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot * Math.PI / 180);
  shape(rectPts(-w / 2, -hh / 2, w, hh), { fill: '#FFFDF4', ink: PAL.ink, sw: 5, seed: 181, gap: false });
  const px = -w / 2 + pad, py = -hh / 2 + pad, pw = w - pad * 2;
  ctx.save();
  path(ctx, rectPts(px, py, pw, ph)); ctx.clip();
  // 照片里：店的灯、货架、她
  shape(rectPts(px, py, pw, ph), { fill: o.bg || '#D9E2DC', ink: null, seed: 182, boil: false });
  ctx.save(); ctx.globalAlpha = .35;
  dots({ x: px, y: py, w: pw, h: ph * .55 }, D.band(.10, .38, 0, 1), { step: 16, color: '#8FA6A0', angle: 45 });
  ctx.restore();
  const u = ph * .075;
  person('b', 0, py + ph + u * .4, u, { view: 'q', face: o.face || 'laugh', aR: 1.35, aL: .3, t: o.t || 0, seed: 7, flip: true });
  // 晒淡：一层稀疏纸白网点
  ctx.save(); ctx.globalAlpha = .5;
  dots({ x: px, y: py, w: pw, h: ph }, (uu, vv) => .05 + .05 * (1 - vv), { step: 17, color: '#F7EFDD', angle: 15 });
  ctx.restore();
  // 指甲掐出的白痕
  inkLine([[px + pw * .10, py + ph * .18], [px + pw * .22, py + ph * .40]], { sw: 3, color: '#FFFFFF', seed: 183, amp: 1.8, alpha: .55 });
  ctx.restore();
  txt(o.note || '2019.07.03', 0, hh / 2 - 26 * k, { size: 26 * k, font: FONT.kai, weight: 700, color: '#6B5B45', align: 'center' });
  ctx.restore();
  return { photo: { x: px, y: py, w: pw, h: ph }, hh };
}

// ---------- 附件卡 ----------
function attachCard(x, y, w, o = {}) {
  const ctx = CTX, h = w * (o.ratio || 1.25);
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot * Math.PI / 180);
  shape(rectPts(-w / 2, -h / 2, w, h), { fill: o.paperC || '#FBF5E6', ink: PAL.ink, sw: 4, seed: 191 + (o.seed || 0) });
  if (o.chip) {
    shape(rectPts(-w / 2 + 10, -h / 2 + 10, w * .27, w * .18), { fill: o.chipCol || PAL.ink, ink: null, seed: 192 });
    txt(o.chip, -w / 2 + 10 + w * .135, -h / 2 + 10 + w * .135, { size: w * .13, font: FONT.mono, weight: 700, color: PAL.paper, align: 'center' });
  }
  if (o.blank) {
    // 空白：只有最密的网点
    dots({ x: -w / 2 + 12, y: -h / 2 + 12, w: w - 24, h: h - 24 }, D.radial(.5, .5, .8, .5, .1), { step: 13, color: PAL.ink, alpha: .30, angle: 45 });
  } else if (o.lines) {
    for (let i = 0; i < o.lines; i++) {
      const ly = -h / 2 + w * .42 + i * (h * .12);
      inkLine([[-w * .34, ly], [w * .34 - (i % 3) * w * .12, ly]], { sw: 3.4, seed: 193 + i, amp: .9, alpha: .55 });
    }
  }
  if (o.note) txt(o.note, 0, h / 2 - 18, { size: w * .10, font: FONT.kai, weight: 700, color: PAL.ink, align: 'center', alpha: .8 });
  // 回形针
  if (o.clip) {
    ctx.save(); ctx.translate(-w * .3, -h / 2 + 6); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 36); ctx.arc(9, 36, 9, Math.PI, 0, true); ctx.lineTo(18, 6); ctx.arc(9, 6, 9, 0, Math.PI, true); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ---------- 笔 ----------
function pen(x, y, ang, o = {}) {
  const ctx = CTX, L = o.len || 260, wr = o.w || 13, col = o.color || PAL.ink;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  shape(rrectPts(0, -wr, L * .78, wr * 2, wr), { fill: col, ink: PAL.ink, sw: 4, seed: 201 });
  shape(rrectPts(L * .78, -wr * .55, L * .16, wr * 1.1, 4), { fill: '#C9BFA8', ink: PAL.ink, sw: 3.4, seed: 202 });
  shape([...[[L * .94, -wr * .42], [L, 0], [L * .94, wr * .42]]], { fill: '#8C8474', ink: PAL.ink, sw: 3, seed: 203 });
  // 笔夹
  inkLine([[L * .16, -wr], [L * .30, -wr * 1.05], [L * .30, -wr * .2]], { sw: 3.4, seed: 204 });
  ctx.restore();
}

// ---------- 钢印（举起的实体，反字朝镜头） ----------
function stampBody(x, y, s, o = {}) {
  const ctx = CTX;
  ctx.save(); ctx.translate(x, y); ctx.rotate((o.rot ?? 0) * Math.PI / 180); ctx.scale(s, s);
  // 手柄
  shape(rrectPts(-28, -260, 56, 170, 26), { fill: '#3A2A22', ink: PAL.ink, sw: 7, seed: 211 });
  shape(rrectPts(-96, -100, 192, 46, 10), { fill: '#5A4636', ink: PAL.ink, sw: 6, seed: 212 });
  // 章体
  shape(rrectPts(-150, -54, 300, 74, 8), { fill: '#C9BFA8', ink: PAL.ink, sw: 7, seed: 213 });
  shape(rrectPts(-158, 20, 316, 30, 6), { fill: '#8C8474', ink: PAL.ink, sw: 6, seed: 214 });
  // 章面（反字）
  shape(rectPts(-150, 52, 300, 26), { fill: PAL.red, ink: PAL.ink, sw: 6, seed: 215 });
  ctx.save(); ctx.translate(0, 74); ctx.scale(-1, 1);
  txt(o.text || '受理', 0, 0, { size: 32, font: FONT.serif, weight: 900, color: PAL.paper, align: 'center', alpha: .95 });
  ctx.restore();
  ctx.restore();
}

// ---------- 大日期 / 大字 ----------
function bigType(s, x, y, size, o = {}) {
  const ctx = CTX;
  ctx.save();
  ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot * Math.PI / 180);
  ctx.font = `900 ${size}px ${o.font || FONT.serif}`;
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(s).width;
  if (o.vertical) { }
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = o.shadow || PAL.red; ctx.globalAlpha = .85;
  ctx.fillText(s, (o.shx ?? 7), (o.shy ?? 7)); ctx.restore();
  ctx.fillStyle = o.color || PAL.ink; ctx.fillText(s, 0, 0);
  if (o.dots) {
    ctx.save(); ctx.globalAlpha = o.dots; ctx.beginPath(); ctx.rect(-w / 2, -size * .7, w, size * 1.2); ctx.clip();
    dots({ x: -w / 2, y: -size * .7, w, h: size * 1.2 }, D.band(0, 1, 0, 1), { step: 12, color: PAL.ink, angle: 30 });
    ctx.restore();
  }
  ctx.restore();
  return w;
}

// 撕掉一角
function tornCorner(x, y, s, dir = 1) {
  const ctx = CTX;
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s, 0); ctx.lineTo(s * .62, s * .34); ctx.lineTo(s * .74, s * .58); ctx.lineTo(s * .34, s * .7); ctx.lineTo(0, s); ctx.closePath();
  ctx.fillStyle = PAL.paper; ctx.fill();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}
