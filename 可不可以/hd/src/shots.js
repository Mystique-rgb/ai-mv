// shots.js — 镜头。每个函数负责"这一镜在 t 时刻的一张画"。
function page(model, t, seed = 0) { paper(model, t, seed); }

// 拍脉位移（章落、撞击）
function shakeOf(t, at, amp = 18, k = 12) {
  const d = t - at; if (d < 0) return [0, 0];
  const e = Math.exp(-d * k);
  return [Math.sin(d * 90) * amp * e, Math.cos(d * 77) * amp * .7 * e];
}
function flashOf(t, at, amp = .5, dur = .22) {
  const d = t - at; if (d < 0 || d > dur) return 0;
  return amp * (1 - d / dur) ** 1.5;
}

// 打印机（S01 / S41 回纸）
function printer(t, o = {}) {
  const ctx = CTX, k = o.k || 1;
  ctx.save(); ctx.translate(o.x ?? W * .66, o.y ?? H * .74); ctx.rotate(o.rot ?? -.06); ctx.scale(k, k);
  // 吐出来的纸（在机身后面）
  const feed = o.feed ?? .6;                     // 0..1 出了多长
  const ph = 240 + feed * 700;
  shape(rectPts(-330, -ph, 660, ph), { fill: '#FBF5E6', ink: PAL.ink, sw: 6, seed: 304, gap: false });
  // 齿孔
  for (const sx of [-318, 302]) {
    ctx.save(); ctx.globalAlpha = .5; ctx.fillStyle = PAL.ink;
    for (let i = 0; i < Math.floor(ph / 34); i++) { ctx.beginPath(); ctx.arc(sx + 8, -ph + 26 + i * 34, 5.5, 0, PI2); ctx.fill(); }
    ctx.restore();
  }
  // 打出的字
  let i = 0;
  const rows = o.rows || [];
  for (const row of rows) {
    const size = i === 0 ? 54 : 26;
    txt(row, -300, -ph + 84 + i * (i === 0 ? 62 : 46), {
      size, font: i === 0 ? FONT.serif : FONT.mono, weight: i === 0 ? 900 : 700,
      color: PAL.ink, alpha: .9, spacing: i === 0 ? 2 : 1.6,
    });
    i++;
  }
  // 机身
  shape([[-360, 0], [360, 0], [340, 170], [-340, 170]], { fill: '#D5C6AB', ink: PAL.ink, sw: 7, seed: 301, gap: false });
  shape(rectPts(-330, 18, 660, 34), { fill: '#22344F', ink: PAL.ink, sw: 4, seed: 302, gap: false });
  // 打印头
  const hx = -290 + (o.headPos ?? .6) * 580;
  shape(rrectPts(hx - 24, -6, 48, 44, 4), { fill: PAL.ink, ink: null, seed: 303, boil: false });
  ctx.save(); ctx.globalAlpha = .9; ctx.fillStyle = PAL.yellow; ctx.fillRect(hx - 14, 4, 28, 7); ctx.restore();
  // 机身上的小标签
  txt('KB-2019-0703', 300, 140, { size: 20, font: FONT.mono, weight: 700, color: PAL.ink, align: 'right', alpha: .55, spacing: 1.4 });
  ctx.restore();
}

// ---------------- S01 打印 ----------------
function S01(t) {
  const a = inv(1.74, 3.52, t);
  page('D-DAY', t);
  printer(t, {
    k: .96, rot: -.055, feed: .45 + a * .45, headPos: .12 + a * .78,
    rows: a > .34 ? ['遗失物认领单', 'CLAIM FOR A LOST ITEM', '案卷号 KB-2019-0703', '受理日 2026.11.08', '申请人 岩', '遗失时间 2019.07.03', '遗失地点 火车站 3 号出口'] : ['遗失物认领单'],
  });
  // 标题（左上，压一条红线）
  headline('遗失物', 104, 214, { size: 122, pop: t - 1.92, stagger: .06, drop: 40, shx: 7, shy: 7, shadowAlpha: .5 });
  headline('认领单', 104, 344, { size: 122, pop: t - 2.16, stagger: .06, drop: 40, shx: 7, shy: 7, shadowAlpha: .5 });
  inkLine([[100, 372], [620, 372]], { sw: 9, color: PAL.red, seed: 361, amp: 1.4 });
  headline('CLAIM FOR A LOST ITEM', 106, 428, { size: 26, font: FONT.mono, weight: 700, pop: t - 2.62, stagger: .018, drop: 16, shadow: null, color: PAL.ink, track: 5 });
  txt('第 01 页 / 共 47 页', 104, 486, { size: 24, font: FONT.mono, weight: 700, color: PAL.ink, alpha: .5, spacing: 2 });
  hud({ page: 1, chip: '受理中', secStr: clockStr(t) });
}
function clockStr(t) {
  const b = beatIndex(t);
  const s = (33 + b) % 60, m = 12 + Math.floor((33 + b) / 60);
  return `06:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ---------------- S02 大厅 ----------------
function S02(t) {
  const a = inv(3.52, 7.08, t);
  page('D-DAY', t);
  const k = 1.26 - easeOut(clamp(a * 1.25)) * .26;
  CTX.save();
  CTX.translate(W / 2, H * .58); CTX.scale(k, k); CTX.translate(-W / 2, -H * .58);
  hall(t, {});
  CTX.restore();
  // 印进来的剪影（从边缘滑入）
  CTX.save(); CTX.globalAlpha = .9;
  const q = (t - 3.9) / .5;
  if (q > 0) silhouette(210 - 80 * (1 - clamp(q)), 1010, 240, { alpha: .95 });
  CTX.restore();
  hud({ page: 1, chip: '候号 A047', secStr: clockStr(t) });
}

// ---------------- S09 便利店 ----------------
function S09(t) {
  page('N-STREET', t);
  // 雨：竖线（不是网点，网点留给明暗）
  CTX.save();
  const rr = srand(707);
  for (let i = 0; i < 90; i++) {
    const x = rr() * W, y0 = rr() * H * .8, len = 90 + rr() * 260;
    CTX.globalAlpha = .06 + rr() * .12;
    inkLine([[x, y0], [x - 6, y0 + len]], { sw: 2 + rr() * 2, color: PAL.teal, seed: 800 + i, amp: .6 });
  }
  CTX.restore();
  storeFront(t);
  // 手印（玻璃上）+ 渗出的满纯粉
  const hp = clamp((t - 30.88) / .3);
  if (hp > 0) {
    CTX.save(); CTX.globalAlpha = hp;
    handprint(905, 700, 168, { pink: clamp((t - 31.24) / .55) });
    CTX.restore();
  }
  // 他（左，3/4，hurt）：站在玻璃外，被店里打亮一侧
  const face = t < 31.9 ? 'neutral' : 'hurt';
  person('a', 268, 1010, 52, { view: 'q', face, t, seed: 3, dx: .2 * Math.sin(t * 1.2), rot: -.02, aL: .42, aR: .18 });
  CTX.save(); CTX.globalAlpha = .45;
  dots({ x: 150, y: 640, w: 300, h: 400 }, D.ramp(0, .55, 200), { step: 18, color: PAL.yellow, angle: 45 });
  CTX.restore();
  // 字幕
  caption(lineByN(4), t, { keyword: '离不开' });
  hud({ page: 4, chip: 'N-STREET', dark: true, secStr: clockStr(t), clockStr: 'EXPIRED 4Y 04M 05D' });
}
function dashboardEmptySeat(x, y) {
  const ctx = CTX;
  ctx.save(); ctx.globalAlpha = .55;
  shape(rrectPts(x - 60, y - 20, 120, 24, 6), { fill: PAL.deep, ink: null, seed: 311 });
  shape(rrectPts(x - 66, y - 120, 22, 100, 6), { fill: PAL.deep, ink: null, seed: 312 });
  ctx.restore();
}

// ---------------- S14 拍立得 ----------------
function S14(t) {
  page('P-2019', t);
  // 桌面：很淡的木纹，只在底部
  CTX.save(); CTX.globalAlpha = .14;
  dots({ x: 0, y: H * .58, w: W, h: H * .42 }, (u, v) => .02 + .012 * Math.sin(v * 40), { step: 26, color: '#A87C48', angle: 5 });
  CTX.restore();
  const pop = clamp((t - 45.76) / .3);
  const cy = 560 + (1 - backOut(pop)) * 140;
  const g = polaroid(W * .52, cy, 540, { rot: -2.5 + Math.sin(t * 20) * .25 * Math.exp(-(t - 45.76) * 6), face: 'laugh', t, note: '2019.07.03' });
  // 附件 B 编号（别在照片左上）
  const bx = W * .52 - 300, by = cy - g.hh / 2 - 6;
  shape(rectPts(bx, by, 92, 62), { fill: PAL.ink, ink: null, seed: 321 });
  txt('B', bx + 46, by + 46, { size: 42, font: FONT.mono, weight: 700, color: PAL.paper, align: 'center' });
  // 红笔圈（还没画完）
  const ck = clamp((t - 46.32) / .5);
  if (ck > 0) {
    const ctx = CTX;
    ctx.save(); ctx.translate(W * .52 + 40, cy - 30); ctx.rotate(-.22);
    ctx.strokeStyle = PAL.red; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.ellipse(0, 0, 118, 96, 0, -Math.PI * .62, -Math.PI * .62 + PI2 * ck * 1.02); ctx.stroke();
    ctx.restore();
  }
  caption(lineByN(8), t, { keyword: '小脾气' });
  hud({ page: 8, chip: '附件 B', secStr: clockStr(t) });
}

// ---------------- S19 三张附件扇开 ----------------
function S19(t) {
  page('D-DAY', t);
  // 桌面：左边压暗（他在左边挡光）
  CTX.save(); CTX.globalAlpha = .20;
  dots({ x: 0, y: 0, w: W * .35, h: H }, D.ramp(.10, .01, 0), { step: 24, color: PAL.ink, angle: 15 });
  CTX.restore();
  // 扇形展开的附件
  const open = clamp((t - 56.16) / .5);
  const fan = [{ r: -16, chip: 'H' }, { r: -4, chip: 'I' }, { r: 8, chip: 'J' }];
  const ox = W * .585, oy = H * .82;
  fan.forEach((f, i) => {
    const ang = lerp(-1, f.r * 1.5, open);
    CTX.save(); CTX.translate(ox + i * 62, oy - pulse(t, 5) * (4 + i * 3)); CTX.rotate(ang * Math.PI / 180 + Math.sin(t * 2.3 + i) * .02);
    attachCard(0, -215, 296, { chip: f.chip, lines: 5, blank: i === 2, note: i === 2 ? '惊喜' : '', seed: i * 5 + 1, clip: i === 0 });
    CTX.restore();
  });
  // 纸的影子
  CTX.save(); CTX.globalAlpha = .18; CTX.fillStyle = PAL.ink;
  CTX.beginPath(); CTX.ellipse(ox + 60, oy - 20, 300, 40, 0, 0, PI2); CTX.fill(); CTX.restore();
  // 他（左，半身，兴奋）
  person('a', 350, 1140, 54, { view: 'q', face: 'excited', t, seed: 5, aL: .42, aR: .55, rot: -.03 });
  caption(lineByN(14), t, { keyword: '惊喜' });
  hud({ page: 14, chip: '附件 H/I/J', secStr: clockStr(t) });
}

// ---------------- S24 窗口 ----------------
function S24(t) {
  page('D-DAY', t);
  // 墙面（比纸深一档）
  shape(rectPts(-30, 120, W + 60, 800), { fill: '#E7DAC0', ink: null, seed: 381, boil: false });
  // 窗口洞
  const wx = 700, wy = 170, ww = 980, wh = 520;
  shape(rectPts(wx, wy, ww, wh), { fill: '#22344F', ink: PAL.ink, sw: 8, seed: 382, gap: false });
  // 里面：老周（3/4，永远不给正脸）
  CTX.save();
  path(CTX, rectPts(wx + 10, wy + 10, ww - 20, wh - 20)); CTX.clip();
  CTX.save(); CTX.globalAlpha = .16;
  dots({ x: wx, y: wy, w: ww, h: wh }, D.radial(.5, .15, 1.0, .14, .03), { step: 28, color: PAL.paper, angle: 45 });
  // 他呼在玻璃上的雾（在他之前，压在玻璃上）
  CTX.globalAlpha = .14;
  dots({ x: wx + 40, y: wy + wh - 340, w: 300, h: 300 }, D.radial(.5, .5, .62, .5, 0), { step: 20, color: PAL.paper, angle: 30 });
  CTX.restore();
  person('zhou', 1180, 812, 52, { view: 'q', face: t < 73.1 ? 'neutral' : 'thinking', t, seed: 9, flip: true, aL: .7, aR: .4 });
  // 玻璃反光斜条
  CTX.save(); CTX.globalAlpha = .10; CTX.fillStyle = PAL.paper;
  CTX.beginPath(); CTX.moveTo(wx + 40, wy + wh); CTX.lineTo(wx + 300, wy); CTX.lineTo(wx + 400, wy); CTX.lineTo(wx + 140, wy + wh); CTX.closePath(); CTX.fill();
  CTX.restore();

  CTX.restore();
  // 台面 + 收件缝
  shape(rectPts(wx - 20, wy + wh - 22, ww + 40, 26), { fill: '#D8C9A9', ink: PAL.ink, sw: 5, seed: 383, gap: false });
  shape(rectPts(wx + 20, wy + wh - 12, ww - 40, 26), { fill: '#E4D8BE', ink: PAL.ink, sw: 4, seed: 384, gap: false });
  shape(rectPts(wx + 60, wy + wh + 6, ww - 120, 12), { fill: '#0B1220', ink: PAL.ink, sw: 3, seed: 385, gap: false });
  // 窗下墙裙
  shape(rectPts(wx - 20, wy + wh + 24, ww + 40, 150), { fill: '#DCCDAF', ink: PAL.ink, sw: 5, seed: 386, gap: false });
  txt('3', wx + ww - 40, wy + 60, { size: 40, font: FONT.mono, weight: 700, color: PAL.paper, align: 'right', alpha: .8 });
  // 他（过肩，只给背）
  person('a', 330, 1105, 50, { view: 'qback', t, seed: 11, rot: .02, aL: .35, aR: .3 });
  // 大字「可不可以」横排压红线
  bigType('可不可以', 330, 200, 116, { align: 'center', shadow: PAL.red, shx: 8, shy: 8 });
  inkLine([[96, 226], [566, 226]], { sw: 9, color: PAL.red, seed: 331, amp: 1.2 });
  caption(lineByN(18), t, { keyword: '可不可以' });
  hud({ page: 18, chip: '受理中', secStr: clockStr(t) });
}

// ---------------- S31 章落 M1 ----------------
function S31(t) {
  const at = 96.40, d = t - at;
  page('S-STEEL', t);
  const [sx, sy] = shakeOf(t, at, 26, 10);
  const SX = 636, SY = 930;                      // 章心：表格"有效期至"下面的空栏（左压出纸边）
  CTX.save(); CTX.translate(sx, sy);
  // 表格（斜放）
  CTX.save(); CTX.translate(W * .46, H * .52); CTX.rotate(-.035); CTX.scale(.92, .92); CTX.translate(-W * .46, -H * .52);
  formSheet(W * .46, H * .52, 720, 1, { applicant: '岩', time: '2019.07.03', place: '火车站 3 号出口', desc: '一个人' });
  CTX.restore();                                  // 章与褶都在屏幕坐标里画
  // 纸面被砸出的凹（一圈褶）
  if (d > 0) {
    const g = clamp(d / .5);
    CTX.save(); CTX.globalAlpha = (1 - g) * .55;
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * PI2 + .3, r0 = 240 + g * 60, r1 = r0 + 70;
      inkLine([[SX + Math.cos(a) * r0, SY + Math.sin(a) * r0], [SX + Math.cos(a) * r1, SY + Math.sin(a) * r1]],
        { sw: 4, color: PAL.ink, seed: 921 + i, amp: 2.2 });
    }
    CTX.restore();
  }
  // 章
  const s = d < .09 ? lerp(2.55, 1, easeIn(Math.max(0, d) / .09)) : 1 + .03 * Math.exp(-(d - .09) * 18) * Math.sin((d - .09) * 60);
  if (d > -.4) {
    CTX.save(); CTX.globalAlpha = .93;
    stamp({ x: SX, y: SY, scale: s * .80, rot: -6, text: '受理', sub: 'RECEIVED', ink: PAL.red, seed: 4 });
    CTX.restore();
  }
  CTX.restore();
  // 网点外爆：一圈点半调从章边推开（0.55s）
  if (d > 0 && d < .55) {
    const k = d / .55;
    CTX.save(); CTX.globalAlpha = (1 - k) * .34;
    dots({ x: SX - 460, y: SY - 460, w: 920, h: 920 }, (u, v) => {
      const dd = Math.hypot(u - .5, v - .5);
      return clamp(1 - Math.abs(dd - .40 - k * .22) * 9) * (1 - k);
    }, { step: 20, color: PAL.red, angle: 45 });
    CTX.restore();
  }
  // 2 帧白闪
  if (d >= 0 && d < .075) {
    CTX.save(); CTX.globalAlpha = .55 * (1 - d / .075); CTX.fillStyle = '#FFFDF4';
    CTX.fillRect(-40, -40, W + 80, H + 80); CTX.restore();
  }
  // 他（右侧，第一次笑）
  const face = d < .5 ? 'hopeful' : 'laugh';
  const jump = d > 0 ? Math.sin(Math.min(1, d / .34) * Math.PI) * 26 : 0;
  person('a', 1560, 1040 - jump, 58, {
    view: 'q', face, t, seed: 13, flip: true,
    rot: -.05 + .05 * Math.exp(-Math.max(0, d) * 8) * Math.sin(d * 50),
    aL: .7 + (d > 0 ? .5 * Math.exp(-d * 3) : 0), aR: .5,
  });
  // 编号亮一次：印子上的反光
  if (d > .4) {
    CTX.save(); CTX.globalAlpha = .5; CTX.strokeStyle = PAL.paper; CTX.lineWidth = 5;
    CTX.beginPath(); CTX.arc(SX, SY, 172, -2.4, -1.7); CTX.stroke(); CTX.restore();
  }
  caption(lineByN(25), t, { keyword: '愿意' });
  hud({ page: 25, chip: '受理', secStr: clockStr(t) });
}

// ---------------- S60 两栏签字 ----------------
function S60(t) {
  page('D-DAY', t);
  // 最后一页：只有两栏
  CTX.save(); CTX.translate(W * .5, H * .56); CTX.rotate(-.012);
  shape(rectPts(-620, -380, 1240, 760), { fill: '#FBF5E6', ink: PAL.ink, sw: 6, seed: 341, gap: false });
  txt('第 04 页 / 共 04 页', 0, -330, { size: 24, font: FONT.mono, weight: 700, color: PAL.ink, align: 'center', alpha: .65, spacing: 2 });
  inkLine([[-560, -300], [560, -300]], { sw: 3.4, seed: 342, amp: .8, dash: [14, 9] });
  // 两栏
  const cols = [{ x: -280, t: '申请人签字', name: '岩', ink: PAL.ink }, { x: 280, t: '物品原主签字', name: '', ink: null }];
  for (const c of cols) {
    txt(c.t, c.x, -170, { size: 40, font: FONT.kai, weight: 700, color: PAL.ink, align: 'center', spacing: 3 });
    inkLine([[c.x - 210, 60], [c.x + 210, 60]], { sw: 4.5, seed: 343 + c.x, amp: 1, alpha: .8 });
    if (c.name) {
      // 签名：主墨，写得比平时好看
      txt(c.name, c.x, 30, { size: 96, font: FONT.kai, weight: 700, color: c.ink, align: 'center', shadow: null });
    }
  }
  // 右栏上方四个网点团（说不出来的"可不可以"）
  CTX.save(); CTX.globalAlpha = .42;
  for (let i = 0; i < 4; i++) dots({ x: 190 + i * 60, y: -252, w: 34, h: 34 }, D.radial(.5, .5, .55, .55, 0), { step: 7, color: PAL.ink, angle: 30 });
  CTX.restore();
  // 笔（他的，主墨色）：悬在右栏上方，笔尖朝下
  CTX.save(); CTX.translate(300, -190 - pulse(t, 5) * 9); CTX.rotate(1.9 + Math.sin(t * 2.2) * .012);
  pen(0, 0, 0, { len: 260, color: PAL.ink, w: 11 });
  CTX.restore();
  CTX.restore();
  hud({ page: 46, chip: '待签字', secStr: clockStr(t) });
}

// ---------------- S67 点里的她 ----------------
function S67(t) {
  page('P-2019', t);
  const DX = W * .5 + 250, DY = H * .56 + 40;          // 接 S66 笔尖那个点
  const grow = easeOut(clamp((t - 236.6) / .55));
  const R = lerp(26, 400, grow);
  CTX.save(); CTX.translate(DX, DY);
  ctxDot(R, () => {
    // 2019 的便利店（灯下）
    shape(rectPts(-R, -R, R * 2, R * 2), { fill: '#F3DFB4', ink: null, seed: 351, boil: false });
    CTX.save(); CTX.globalAlpha = .55;
    dots({ x: -R, y: -R, w: R * 2, h: R * 2 }, D.band(.06, .52, .46, 1), { step: 16, color: '#A8834C', angle: 45 });
    CTX.restore();
    for (let i = 0; i < 2; i++) {
      const sy2 = -R * .10 + i * R * .40;
      inkLine([[-R * .84, sy2], [R * .84, sy2]], { sw: 6, seed: 352 + i, alpha: .30 });
      const rr2 = srand(367 + i);
      for (let q = 0; q < 9; q++) {
        const bx2 = -R * .78 + q * R * .18, bw2 = R * .10, bh2 = R * .10 + rr2() * R * .06;
        shape(rectPts(bx2, sy2 - bh2, bw2, bh2),
          { fill: ['#EFE0BE', '#D4482F', '#2F7E8A', '#E0A81E'][Math.floor(rr2() * 4)], ink: null, seed: 380 + q, boil: false, alpha: .5 });
      }
    }
    // 她：先背对，末尾开始转身 —— 只转到侧脸，正脸永远不给
    const turn = clamp((t - 238.18) / .48);
    person('b', R * .10, R * .70, 24, {
      view: turn < .32 ? 'qback' : 'side', face: 'love', t, seed: 17,
      aR: .30, aL: .25, flip: turn > .32, alpha: .96,
    });
    CTX.save(); CTX.globalAlpha = .30;
    dots({ x: -R, y: -R, w: R * 2, h: R * 2 }, D.radial(.5, .12, .58, .55, 0), { step: 20, color: PAL.paper, angle: 30 });
    CTX.restore();
  });
  // 点的边：一圈墨点
  CTX.save();
  for (let i = 0; i < 92; i++) {
    const a2 = i / 92 * PI2, r2 = R - 4 + (hash2(i, 3) - .5) * 26;
    const sz = 4 + hash2(i, 9) * 10;
    CTX.fillStyle = PAL.ink;
    CTX.beginPath(); CTX.arc(Math.cos(a2) * r2, Math.sin(a2) * r2, sz, 0, PI2); CTX.fill();
  }
  CTX.restore();
  // 网点从边往里把这幅画吃掉 —— 她没转完就被吃掉，这才是"没等到"
  const eat = clamp((t - 238.26) / .62);
  if (eat > 0) {
    ctxDot(R, () => {
      dots({ x: -R, y: -R, w: R * 2, h: R * 2 }, (u, v) => {
        const dd = Math.hypot(u - .5, v - .5);
        return clamp((dd - (.50 - eat * .72)) * 4.2);
      }, { step: 11, color: PAL.ink, angle: 45 });
    });
  }
  CTX.restore();
  if (t > 238.7) txt('P.047', W - 74, H - 58, { size: 22, font: FONT.mono, weight: 700, color: PAL.ink, align: 'right', alpha: .45 });
}
function ctxDot(r, fn) {
  CTX.save(); CTX.beginPath(); CTX.arc(0, 0, r, 0, PI2); CTX.clip(); fn(); CTX.restore();
}

// ---------------- 兜底（预览期间不在覆盖范围内的时刻） ----------------
function FALLBACK(t) {
  page('D-DAY', t);
  hall(t, { lit: .55 });
  hud({ page: Math.min(47, 1 + beatIndex(t) % 47), chip: '待补镜', secStr: clockStr(t) });
}

// 注册表：分镜表 SHOTLIST 驱动，缺的走兜底
const SHOTFN = { S01, S02, S09, S14, S19, S24, S31, S60, S67 };
for (const k in FILM) SHOTFN[k] = FILM[k];
