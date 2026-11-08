// film.js — 其余 59 镜。每个镜头用 frame() 包一层：纸 / 相机 / HUD / 字幕。
const S = t => SHOTLIST.find(s => t >= s.t0 && t < s.t1) || SHOTLIST[SHOTLIST.length - 1];

// 小工具
const push = (t, a, b, z0, z1) => ({ z: lerp(z0, z1, inv(a, b, t)) });
const shakeCam = (t, at, amp = 16) => { const [x, y] = shakeOf(t, at, amp, 12); return { x, y, z: 1.01 }; };

// ---------- 表格大特写（笔尖/填字/红笔） ----------
function formMacro(t, o = {}) {
  const z = o.z || 1.55;
  CTX.save();
  CTX.translate(W / 2, H / 2); CTX.scale(z, z); CTX.rotate(o.rot || 0);
  CTX.translate(-W / 2, -H / 2);
  // 只有一栏放大占满画面
  const bx = W * .5, by = H * .5, bw = 1120, bh = 420;
  shape(rrectPts(bx - bw / 2, by - bh / 2, bw, bh, 8), { fill: '#FBF5E6', ink: PAL.ink, sw: 6, seed: 840, gap: false });
  txt(o.label || '遗失时间', bx - bw / 2 + 30, by - bh / 2 + 56, { size: 40, font: FONT.kai, weight: 700, color: PAL.ink });
  inkLine([[bx - bw / 2 + 30, by - bh / 2 + 70], [bx - bw / 2 + 330, by - bh / 2 + 70]], { sw: 3, seed: 841, alpha: .5 });
  // 已写的字
  let cx = bx - bw / 2 + 60;
  for (const ch of (o.text || '')) {
    const w2 = measure(ch, o.size || 96, FONT.kai, 700);
    txt(ch, cx, by + (o.ty ?? 40), { size: o.size || 96, font: FONT.kai, weight: 700, color: o.color || PAL.ink });
    cx += w2 + 6;
  }
  if (o.strike) inkLine([[bx - bw / 2 + 40, by + 10], [bx - bw / 2 + 600, by + 4]], { sw: 10, color: PAL.red, seed: 842, amp: 1.6 });
  // 字尾落墨：正好落在最后一个字的右下角（跟着字走，不靠猜）
  if (o.blot != null && o.blot > 0) {
    const px = cx - 26, py = by + (o.ty ?? 40) + 26, r2 = o.blot;
    CTX.save(); CTX.fillStyle = PAL.ink; CTX.globalAlpha = .92;
    CTX.beginPath(); CTX.arc(px, py, r2, 0, PI2); CTX.fill(); CTX.restore();
    CTX.save(); CTX.globalAlpha = .45;
    dots({ x: px - r2 * 2, y: py - r2 * 2, w: r2 * 4, h: r2 * 4 }, (u, v) => clamp(1 - Math.hypot(u - .5, v - .5) * 2.2) * .8,
      { step: 7, color: PAL.ink, angle: 30 });
    CTX.restore();
  }
  if (o.dots) { CTX.save(); CTX.globalAlpha = .6; dots({ x: cx - 10, y: by + 10, w: 90, h: 90 }, D.radial(.35, .35, .5, .9, 0), { step: 9, color: PAL.ink, angle: 30 }); CTX.restore(); }
  CTX.restore();
}

// ---------- 签字页（S60–S65 共用） ----------
function sigSheet(t, o = {}) {
  const k = o.k ?? 1;
  CTX.save(); CTX.translate(W * .5, H * .56 + (o.dy || 0)); CTX.rotate((o.rot || -.012)); CTX.scale(k, k);
  shape(rectPts(-620, -380, 1240, 760), { fill: '#FBF5E6', ink: PAL.ink, sw: 6, seed: 341, gap: false });
  txt('第 04 页 / 共 04 页', 0, -330, { size: 24, font: FONT.mono, weight: 700, color: PAL.ink, align: 'center', alpha: .65, spacing: 2 });
  inkLine([[-560, -300], [560, -300]], { sw: 3.4, seed: 342, amp: .8, dash: [14, 9] });
  const cols = [{ x: -280, t: '申请人签字' }, { x: 280, t: '物品原主签字' }];
  for (const c of cols) {
    txt(c.t, c.x, -170, { size: 40, font: FONT.kai, weight: 700, color: PAL.ink, align: 'center', spacing: 3 });
    inkLine([[c.x - 210, 60], [c.x + 210, 60]], { sw: 4.5, seed: 343 + c.x, amp: 1, alpha: .8 });
  }
  if (o.signLeft) {
    const prog = o.signLeft;
    const ch = '岩';
    CTX.save(); CTX.globalAlpha = clamp(prog * 1.4);
    txt(ch, -280, 30 - (1 - clamp(prog)) * 10, { size: 96, font: FONT.kai, weight: 700, color: PAL.ink });
    CTX.restore();
  }
  if (o.dotRight) {
    CTX.save(); CTX.fillStyle = PAL.pink;
    CTX.beginPath(); CTX.arc(250, 40, o.dotRight, 0, PI2); CTX.fill(); CTX.restore();
  }
  // 右栏上方四个网点团
  if (o.ghost) {
    CTX.save(); CTX.globalAlpha = .42;
    for (let i = 0; i < 4; i++) dots({ x: 190 + i * 60, y: -252, w: 34, h: 34 }, D.radial(.5, .5, .55, .55, 0), { step: 7, color: PAL.ink, angle: 30 });
    CTX.restore();
  }
  if (o.pen) {
    CTX.save(); CTX.translate(o.pen[0], o.pen[1]); CTX.rotate(o.pen[2]);
    pen(0, 0, 0, { len: o.pen[3] || 260, color: o.pen[4] || PAL.ink, w: 11 });
    CTX.restore();
  }
  CTX.restore();
}

const FILM = {};
// ---------- 片头 ----------
FILM.S00 = t => frame(t, { model: 'D-DAY', page: 0, hud: false }, tt => {
  // 一张空纸，先只印一行小字（像机器刚醒）
  const k = clamp((t - .25) / .8);
  inkLine([[120, 300], [120 + 300 * k, 300]], { sw: 3, seed: 201, alpha: .5 });
  txt('案卷 KB-2019-0703', 120, 350, { size: 26, font: FONT.mono, weight: 700, color: PAL.ink, alpha: .55 * clamp((t - .5) / .6), spacing: 2 });
  txt('受理日 2026.11.08', 120, 386, { size: 26, font: FONT.mono, weight: 700, color: PAL.ink, alpha: .45 * clamp((t - .8) / .6), spacing: 2 });
  // 右下角一个小小的页码在等
  txt('P.001', W - 74, H - 58, { size: 26, font: FONT.mono, weight: 700, color: PAL.ink, align: 'right', alpha: .35 });
  // 一条红线从左边长出来
  inkLine([[120, 430], [120 + 180 * clamp((t - .9) / .8), 430]], { sw: 7, color: PAL.red, seed: 202, alpha: .7 });
});



// S03 取号机
FILM.S03 = t => frame(t, { model: 'D-DAY', page: 1, chip: '取号', cam: tt => push(tt, 7.08, 10.64, 1.0, 1.06) }, () => {
  shape(rectPts(-40, -40, W + 80, H + 80), { fill: '#E7DAC0', ink: null, seed: 851, boil: false });
  shape(rrectPts(W * .5 - 330, H * .18, 660, 760, 18), { fill: '#D5C6AB', ink: PAL.ink, sw: 8, seed: 852, gap: false });
  shape(rrectPts(W * .5 - 250, H * .26, 500, 220, 10), { fill: '#22344F', ink: PAL.ink, sw: 5, seed: 853, gap: false });
  txt('请取号', W * .5, H * .34, { size: 44, font: FONT.kai, weight: 700, color: PAL.paper, align: 'center', spacing: 6 });
  txt('A047', W * .5, H * .42, { size: 76, font: FONT.mono, weight: 700, color: PAL.yellow, align: 'center', spacing: 8 });
  // 出票口 + 票
  shape(rectPts(W * .5 - 160, H * .62, 320, 18), { fill: '#0B1220', ink: PAL.ink, sw: 4, seed: 854, gap: false });
  const out = inv(7.5, 8.6, t);
  if (out > 0) { CTX.save(); CTX.translate(W * .5, H * .64 + (1 - out) * 130); ticket(0, 0, 210, { no: 'A047', rot: 0 }); CTX.restore(); }
  // 手按下去
  const press = Math.sin(clamp(inv(7.15, 8.1, t)) * Math.PI);
  hand(W * .5 + 260, H * .55 + press * 40, -.35, 1.1, {});
  // 按钮
  shape(ellPts(W * .86, H * .70, 62, 62, 18), { fill: PAL.red, ink: PAL.ink, sw: 6, seed: 855 });
});

// S04 坐下，摊开表格
FILM.S04 = t => frame(t, { model: 'D-DAY', page: 2, chip: '填表' }, tt => {
  deskSurface(tt, { edge: true });
  formOnDesk(tt, { x: W * .46, y: H * .54, scale: 1.0, rot: -1.5, applicant: '岩', pageNo: 2 });
  person('a', W * .82, H * 1.02, 54, { view: 'q', face: 'playful', t: tt, seed: 5, aL: .5, aR: .35 });
  // 票夹在嘴角
  ticket(W * .82 + 34, H * 1.02 - 4.42 * 54, 56, { no: '047', rot: .5 });
});

// S05 笔尖悬停
FILM.S05 = t => frame(t, { model: 'D-DAY', page: 9, chip: '填表', cam: tt => push(tt, 14.2, 16.24, 1, 1.05) }, tt => {
  formMacro(tt, { label: '遗失时间', z: 1.6, dots: true, text: '' });
  // 笔尖对着那个漏墨的点
  CTX.save(); CTX.globalAlpha = .35; CTX.strokeStyle = PAL.ink; CTX.lineWidth = 3; CTX.setLineDash([8, 10]);
  CTX.beginPath(); CTX.moveTo(W * .46, H * .46); CTX.lineTo(W * .46, H * .56); CTX.stroke(); CTX.setLineDash([]); CTX.restore();
  const j = .6 * Math.sin(tt * 26);
  CTX.save(); CTX.translate(W * .62 + j, H * .30 + Math.sin(tt * 3) * 4); CTX.rotate(1.55);
  pen(0, 0, 0, { len: 420, color: PAL.ink, w: 16 });
  CTX.restore();
  // 握笔的手
  hand(W * .70, H * .22, -.4, 1.05, {});
});

// S06 写 2019，墨漏
FILM.S06 = t => frame(t, { model: 'D-DAY', page: 9, cap: 1, kw: '流浪' }, tt => {
  // 笔尖停在"9"的右下角，墨从一个点漏成一片
  const blot = t > 17.6 ? 4 + clamp((t - 17.6) / 1.7) * 40 : 0;
  formMacro(tt, { label: '遗失时间', z: 1.52, text: '2019', ty: 46, blot });
});

// S07 写地点，红笔划掉
FILM.S07 = t => frame(t, { model: 'D-DAY', page: 9, cap: 2, kw: '迷航' }, tt => {
  formMacro(tt, { label: '遗失地点', z: 1.5, text: t > 21.2 ? '火车站 3 号' : '火车站', ty: 40, size: 74, strike: t > 20.6 });
  if (t > 22.0) txt('×', W * .78, H * .40, { size: 120, font: FONT.kai, weight: 700, color: PAL.red, alpha: .85 });
});

// S08 玻璃上的雨 → 网点海
FILM.S08 = t => frame(t, { model: 'N-STREET', page: 9, cap: 3, kw: '海洋', dark: true }, tt => {
  const k = inv(25.6, 26.4, tt);
  if (k < .5) {
    // 玻璃：表格的框线透过雨
    shape(rectPts(-40, -40, W + 80, H + 80), { fill: '#16233A', ink: null, seed: 861, boil: false });
    CTX.save(); CTX.globalAlpha = .5;
    for (let i = 0; i < 5; i++) inkLine([[-40, 220 + i * 150], [W + 40, 210 + i * 150]], { sw: 6, color: '#8FB6BE', seed: 862 + i, amp: 1 });
    CTX.restore();
    // 雨痕
    const r3 = srand(310);
    for (let i = 0; i < 26; i++) {
      const x = r3() * W, y = r3() * H * .7, len = 120 + r3() * 320;
      inkLine([[x, y], [x + Math.sin(t * 2 + i) * 8, y + len]], { sw: 3 + r3() * 5, color: '#9FC6CC', seed: 870 + i, alpha: .5, amp: 2 });
    }
  }
  // 网点从 0 涨到 .72 —— 这个画风唯一能做出来的"海"
  CTX.save(); CTX.globalAlpha = .75 * k;
  dots({ x: -40, y: -40, w: W + 80, h: H + 80 }, (u, v) => .72 * clamp((k - Math.hypot(u - .5, v - .5) * .8) * 1.6), { step: 22, color: PAL.teal, angle: 15 });
  CTX.restore();
});

// S10 走出便利店，街倒印
FILM.S10 = t => frame(t, { model: 'N-STREET', page: 10, cap: 5, kw: '回去', dark: true }, tt => {
  const back = clamp((t - 34.6) / 1.2);
  CTX.save(); CTX.translate(back * 120, 0);
  cityNight(tt, { kind: 'street', horizon: 640, seed: 22 });
  CTX.restore();
  person('a', 620 - back * 240, 980, 50, { view: 'q', face: t < 35.9 ? 'sad' : 'determined', t: tt, seed: 3, aL: .4 + back * .5, aR: .3 });
});

// S11 1 米线 + 旧脚印
FILM.S11 = t => frame(t, { model: 'D-DAY', page: 11, cap: 6, kw: '原地', cam: tt => push(tt, 37.76, 42.21, 1.1, 1.0) }, tt => {
  shape(rectPts(-40, -40, W + 80, H + 80), { fill: '#CFC0A2', ink: null, seed: 881, boil: false });
  CTX.save(); CTX.globalAlpha = .18;
  dots({ x: 0, y: 0, w: W, h: H }, D.band(.01, .06, .2, 1), { step: 24, color: PAL.ink, angle: 15 });
  CTX.restore();
  // 地砖（不然整片空）
  CTX.save(); CTX.globalAlpha = .20;
  for (let i = 0; i < 8; i++) inkLine([[-40, 120 + i * 150], [W + 40, 120 + i * 150]], { sw: 3, seed: 891 + i, amp: .9, color: '#8A7448' });
  for (let i = 0; i < 13; i++) inkLine([[i * 170 - 40, -40], [i * 170 - 40, H + 40]], { sw: 3, seed: 900 + i, amp: .9, color: '#8A7448' });
  CTX.restore();
  // 1 米线（横穿画面）+ 刻度
  CTX.save(); CTX.globalAlpha = .8; CTX.setLineDash([34, 24]);
  CTX.strokeStyle = PAL.red; CTX.lineWidth = 9; CTX.beginPath(); CTX.moveTo(-40, H * .52); CTX.lineTo(W + 40, H * .52); CTX.stroke();
  CTX.setLineDash([]); CTX.restore();
  for (let i = 0; i < 12; i++) inkLine([[140 + i * 150, H * .52 - 10], [140 + i * 150, H * .52 + 10]], { sw: 4, color: PAL.red, seed: 930 + i, alpha: .5 });
  // 旧脚印（灰，小一号）+ 新鞋踩上去（大一号）
  shape(rrectPts(W * .44 - 62, H * .60 - 96, 124, 210, 52), { fill: 'rgba(27,42,68,.26)', ink: 'rgba(27,42,68,.30)', sw: 5, seed: 882 });
  const st = clamp((t - 38.4) / .3);
  const dy = (1 - st) * -180;
  const sx = W * .58, sy = H * .60 + dy;
  // 裤腿
  shape(rrectPts(sx - 74, sy - 470, 148, 380, 34), { fill: '#3E3A46', ink: PAL.ink, sw: 8, seed: 882 });
  inkLine([[sx - 62, sy - 300], [sx + 62, sy - 300]], { sw: 6, color: '#2A2F3A', seed: 886, alpha: .8 });
  shape(rrectPts(sx - 84, sy - 124, 168, 250, 62), { fill: '#3E3A46', ink: PAL.ink, sw: 8, seed: 883 });
  shape(rrectPts(sx - 84, sy + 66, 168, 66, 34), { fill: '#2A2F3A', ink: PAL.ink, sw: 7, seed: 884 });
  for (let i = 0; i < 3; i++) inkLine([[sx - 56, sy - 70 + i * 52], [sx + 56, sy - 70 + i * 52]], { sw: 4, color: '#6E6A78', seed: 885 + i, alpha: .8 });
});

// S12 纸袋倒出附件
FILM.S12 = t => frame(t, { model: 'D-DAY', page: 11, chip: '附件' }, tt => {
  deskSurface(tt, { edge: true });
  const drop = clamp((t - 42.2) / .5);
  const r4 = srand(410);
  for (let i = 0; i < 9; i++) {
    const x = W * .3 + r4() * W * .45, y = H * .45 + r4() * H * .28;
    const k = clamp((t - 42.2 - i * .04) / .35);
    if (k <= 0) continue;
    CTX.save(); CTX.translate(lerp(x, x, 1), lerp(-200, y, backOut(clamp(k)))); CTX.rotate((r4() - .5) * .7);
    attachCard(0, 0, 230, { chip: 'ABCDEFGHIJ'[i], lines: 4, blank: i > 8, seed: i });
    CTX.restore();
  }
  // 纸袋
  CTX.save();
  CTX.translate(W * .74, H * .30); CTX.rotate(Math.sin(t * 2.1) * .03 + pulse(t, 4) * .02);
  shape([[-120, 0], [120, 0], [96, 250], [-96, 250]],
    { fill: '#C9B58C', ink: PAL.ink, sw: 6, seed: 890, gap: false });
  inkLine([[-104, 18], [104, 18]], { sw: 3, seed: 891, alpha: .4 });
  CTX.restore();
  person('a', W * .86, H * 1.03, 46, { view: 'q', face: 'excited', t: tt, seed: 5, aL: 1.3, aR: .4 });
});

// S13 小票举到灯下
FILM.S13 = t => frame(t, { model: 'P-2019', page: 7, cap: 7, kw: '所有' }, tt => {
  summer(tt, { sunX: W * .5, sunY: 300, shop: false });
  const k = inv(43.76, 44.6, t);
  CTX.save(); CTX.translate(W * .5 + Math.sin(t * 1.9) * 4, H * .48 + (1 - backOut(clamp(k))) * 120 - pulse(t, 5) * 6); CTX.rotate(-.04 + Math.sin(t * 1.7) * .016);
  shape(rectPts(-140, -290, 280, 580), { fill: '#FFFDF4', ink: PAL.ink, sw: 5, seed: 891, gap: false });
  for (let i = 0; i < 9; i++) inkLine([[-100, -220 + i * 54], [80 - (i % 3) * 30, -220 + i * 54]], { sw: 4, seed: 892 + i, alpha: .55 });
  txt('2019.07.03', 0, -250, { size: 26, font: FONT.mono, weight: 700, color: PAL.ink, align: 'center' });
  txt('21:47', 0, -212, { size: 22, font: FONT.mono, weight: 700, color: PAL.ink, align: 'center', alpha: .7 });
  txt('汽水 ×2', -100, 150, { size: 30, font: FONT.kai, weight: 700, color: PAL.ink });
  txt('创可贴 ×1', -100, 200, { size: 30, font: FONT.kai, weight: 700, color: PAL.ink });
  CTX.restore();
  // 灯（从纸背透过来）
  CTX.save(); CTX.globalAlpha = .18;
  dots({ x: W * .3, y: H * .3, w: W * .4, h: H * .4 }, D.radial(.5, .5, .5, .5, 0), { step: 16, color: PAL.yellow, angle: 30 });
  CTX.restore();
});

// S15 食街横移
FILM.S15 = t => frame(t, { model: 'N-STREET', page: 9, cap: 9, kw: '吃', dark: true, cam: tt => ({ x: -120 + inv(47.28, 49.52, tt) * 150, z: 1.04 }) }, tt => {
  cityNight(tt, { kind: 'food', horizon: 720, seed: 33 });
});

// S16 三张食物照片拍上桌
FILM.S16 = t => frame(t, { model: 'N-STREET', page: 10, cap: 10, kw: '好东西', dark: true }, tt => {
  shape(rectPts(-40, -40, W + 80, H + 80), { fill: '#1A2436', ink: null, seed: 901, boil: false });
  const r5 = srand(420);
  for (let i = 0; i < 3; i++) {
    const k = clamp((t - 49.52 - i * .2) / .35);
    if (k <= 0) continue;
    const x = W * .38 + i * 200, y = H * .52 + (i - 1) * 40;
    CTX.save(); CTX.translate(backOut(clamp(k)) * x, lerp(-300, y, backOut(clamp(k)))); CTX.rotate((i - 1) * .12);
    polaroid(0, 0, 300, { face: 'laugh', t: tt, note: ['糖水', '烤红薯', '小丸子'][i], bg: ['#E8C08A', '#D9A24E', '#C98B5A'][i] });
    CTX.restore();
  }
});

// S17 便签
FILM.S17 = t => frame(t, { model: 'D-DAY', page: 11, cap: 11, kw: '带来' }, tt => {
  deskSurface(tt, { edge: true });
  const k = clamp((t - 50.88) / .3);
  CTX.save(); CTX.translate(W * .5, H * .5 + (1 - backOut(k)) * 100); CTX.rotate(-.06);
  shape(rectPts(-220, -220, 440, 440), { fill: '#F6E08E', ink: PAL.ink, sw: 5, seed: 902, gap: false });
  txt('今天有惊喜', 0, -40, { size: 62, font: FONT.kai, weight: 700, color: PAL.ink, align: 'center' });
  // 四道折痕
  inkLine([[-220, -20], [220, -14]], { sw: 3, seed: 903, alpha: .35 });
  inkLine([[-220, 90], [220, 96]], { sw: 3, seed: 904, alpha: .35 });
  inkLine([[-60, -220], [-56, 220]], { sw: 3, seed: 905, alpha: .3 });
  inkLine([[70, -220], [74, 220]], { sw: 3, seed: 906, alpha: .3 });
  CTX.restore();
});

// S18 电影票根举到灯下
FILM.S18 = t => frame(t, { model: 'P-2019', page: 12, cap: 13, kw: '前几年' }, tt => {
  summer(tt, { sunX: W * .5, sunY: 320, shop: false });
  const k = inv(52.86, 53.6, t);
  CTX.save(); CTX.translate(W * .5, H * .5 + (1 - backOut(clamp(k))) * 110); CTX.rotate(.05);
  for (let i = 0; i < 2; i++) {
    shape(rectPts(-330 + i * 330, -130, 320, 260), { fill: '#FFFDF4', ink: PAL.ink, sw: 5, seed: 907 + i, gap: false });
    txt('2019.07.03 19:40', -170 + i * 330, -50, { size: 22, font: FONT.mono, weight: 700, color: PAL.ink, align: 'center' });
    txt(i ? '8 排 7 座' : '8 排 6 座', -170 + i * 330, 20, { size: 30, font: FONT.kai, weight: 700, color: PAL.ink, align: 'center' });
    txt('NO.047', -170 + i * 330, 74, { size: 18, font: FONT.mono, weight: 700, color: PAL.red, align: 'center' });
  }
  CTX.restore();
});

// S20 创可贴贴在自己手背
FILM.S20 = t => frame(t, { model: 'D-DAY', page: 15, cap: 15, kw: '治愈', cam: tt => push(tt, 58.56, 61.54, 1, 1.05) }, tt => {
  deskSurface(tt, { edge: true });
  // 手背（四指 + 拇指 + 掌背），从右下伸进画面
  CTX.save(); CTX.translate(W * .52, H * .58); CTX.rotate(-.12);
  for (let i = 0; i < 4; i++) {
    shape(rrectPts(-190 + i * 100, -300, 84, 240, 42), { fill: SKIN, ink: PAL.ink, sw: 6, seed: 910 + i });
  }
  shape(rrectPts(-300, -120, 110, 210, 52), { fill: SKIN, ink: PAL.ink, sw: 6, seed: 915 });
  shape(rrectPts(-230, -130, 460, 330, 90), { fill: SKIN_L, ink: PAL.ink, sw: 7, seed: 916 });
  // 手背上的一道旧伤
  inkLine([[-60, -60], [40, 6]], { sw: 6, color: PAL.red, seed: 917, amp: 1.4, alpha: .85 });
  // 贴上去的创可贴
  const k = clamp((t - 59.6) / .4);
  if (k > 0) {
    CTX.save(); CTX.globalAlpha = k; CTX.translate(0, (1 - k) * -50);
    shape(rectPts(-110, -40, 260, 96), { fill: '#EFE0C8', ink: PAL.ink, sw: 5, seed: 918 });
    CTX.fillStyle = '#DCCDB4';
    for (let i = 0; i < 6; i++) CTX.fillRect(-84 + i * 40, -18, 22, 52);
    CTX.restore();
  }
  // 影子
  CTX.save(); CTX.globalAlpha = .14; CTX.fillStyle = PAL.ink;
  CTX.beginPath(); CTX.ellipse(10, 250, 300, 60, 0, 0, PI2); CTX.fill(); CTX.restore();
  CTX.restore();
  // 拆开的包装（少了两片）
  CTX.save(); CTX.translate(W * .17, H * .70); CTX.rotate(-.1);
  shape(rectPts(-140, -80, 280, 160), { fill: '#F2E8D5', ink: PAL.ink, sw: 5, seed: 919 });
  txt('创可贴', 0, 10, { size: 42, font: FONT.kai, weight: 700, color: PAL.red, align: 'center' });
  txt('× 8', 0, 56, { size: 24, font: FONT.mono, weight: 700, color: PAL.ink, align: 'center', alpha: .7 });
  ctxTorn(60, -70);
  CTX.restore();
});
function ctxTorn(x, y) {
  CTX.save(); CTX.globalAlpha = .8; CTX.fillStyle = PAL.paper;
  CTX.beginPath(); CTX.moveTo(x, y); CTX.lineTo(x + 70, y - 6); CTX.lineTo(x + 60, y + 40); CTX.lineTo(x + 8, y + 46); CTX.closePath(); CTX.fill();
  CTX.strokeStyle = PAL.ink; CTX.lineWidth = 3; CTX.setLineDash([6, 5]); CTX.stroke(); CTX.setLineDash([]); CTX.restore();
}

// S21 天桥
FILM.S21 = t => frame(t, { model: 'N-STREET', page: 16, cap: 16, kw: '给予', dark: true, cam: tt => ({ x: 40 - inv(61.54, 66.08, tt) * 80, z: 1.05 }) }, tt => {
  cityNight(tt, { kind: 'bridge', horizon: 640, seed: 44 });
  const wip = clamp((tt - 63.20) / .55);
  person('a', W * .46, 900 - wip * 6, 52, {
    view: 'q', face: tt < 63.9 ? 'cry' : 'determined', t: tt, seed: 3,
    aL: .2, aR: lerp(.2, 1.45, wip), rot: -.02 + wip * .03,
  });
  // 拉长的影子
  CTX.save(); CTX.globalAlpha = .22; CTX.fillStyle = PAL.ink;
  CTX.beginPath(); CTX.moveTo(W * .46 - 90, 900); CTX.lineTo(W * .46 + 90, 900); CTX.lineTo(W * 1.1, H); CTX.lineTo(W * .2, H); CTX.closePath(); CTX.fill();
  CTX.restore();
});

// S22 十张附件排成时间线
FILM.S22 = t => frame(t, { model: 'D-DAY', page: 17, cap: 17, kw: '分离', cam: tt => ({ x: 60 - inv(66.08, 70.64, tt) * 120, z: 1.02 }) }, tt => {
  deskSurface(tt, { edge: true });
  const r6 = srand(430);
  for (let i = 0; i < 10; i++) {
    const x = 140 + i * 176, y = H * .52;
    const k = clamp((t - 66.4 - i * .12) / .3);
    if (k <= 0) continue;
    CTX.save();
    CTX.translate(x, lerp(-260, y, backOut(clamp(k))) - pulse(t, 5.4) * (6 + (i % 3) * 5));
    CTX.rotate((r6() - .5) * .2 + Math.sin(t * 2.4 + i) * .03);
    CTX.scale(.55 + .45 * Math.abs(Math.cos(t * 1.35 + i * .52)), 1);
    attachCard(0, 0, 150, { chip: ['2019.07', '2019.09', '2019.12', '2020.03', '2020.07', '2020.11', '2021.03', '2021.09', '2022.03', ''][i], lines: i === 9 ? 0 : 3, blank: i === 9, seed: i });
    CTX.restore();
  }
});

// S23 章举起（反字）
FILM.S23 = t => frame(t, { model: 'S-STEEL', page: 17, chip: '钢印', cam: tt => push(tt, 70.64, 71.44, 1, 1.05) }, tt => {
  shape(rectPts(-40, -40, W + 80, H + 80), { fill: '#EDE3CE', ink: null, seed: 921, boil: false });
  CTX.save(); CTX.translate(W * .5 + Math.sin(t * 52) * pulse(t, 7) * 5, H * .72 + (1 - inv(70.64, 71.2, t)) * 120); CTX.rotate(.03 + Math.sin(t * 44) * pulse(t, 7) * .03);
  stampBody(0, 0, 1.5, { text: '受理', rot: -3 });
  CTX.restore();
});

// S25 老周翻附件
FILM.S25 = t => frame(t, { model: 'D-DAY', page: 19, cap: 19, kw: '回忆' }, tt => {
  winFront(tt, { clerk: true, clerkFace: 'neutral', u: 52 });
  const k = inv(75.04, 77.6, t);
  paperStack(1180, 640 - k * 40, 4 + Math.floor(k * 4), {});
});

// S26 红笔敲，画斜线
FILM.S26 = t => frame(t, { model: 'D-DAY', page: 20, cap: 20, kw: '道理' }, tt => {
  winFront(tt, { clerk: true, clerkFace: 'thinking', u: 52, redPen: true });
  // 表单推在台面上
  CTX.save(); CTX.translate(W * .42, H * .74); CTX.rotate(-.03);
  shape(rectPts(-300, -110, 600, 220), { fill: '#FBF5E6', ink: PAL.ink, sw: 5, seed: 931, gap: false });
  txt('物品描述', -270, -60, { size: 32, font: FONT.kai, weight: 700, color: PAL.ink });
  if (t > 79.6) inkLine([[-260, 10], [240, -20]], { sw: 9, color: PAL.red, seed: 932, amp: 1.6 });
  CTX.restore();
});

// S27 玻璃叠出 2019 的争吵
FILM.S27 = t => frame(t, { model: 'P-2019', page: 21, cap: 21, kw: '情窦初开' }, tt => {
  summer(tt, { shop: true, horizon: 660 });
  CTX.save(); CTX.globalAlpha = .55;
  person('a', W * .40, H * .92, 44, { view: 'q', face: 'angry', t: tt, seed: 3, aR: 1.1, aL: .3 });
  person('b', W * .58, H * .92, 44, { view: 'q', face: 'sad', t: tt, seed: 4, flip: true, aR: .4 });
  CTX.restore();
  // 玻璃的横向反光
  CTX.save(); CTX.globalAlpha = .12; CTX.fillStyle = PAL.paper;
  CTX.beginPath(); CTX.moveTo(0, H * .35); CTX.lineTo(W, H * .22); CTX.lineTo(W, H * .44); CTX.lineTo(0, H * .58); CTX.closePath(); CTX.fill();
  CTX.restore();
});

// S27B 手掌按在玻璃上（2019 在玻璃后面）
FILM.S27B = t => frame(t, { model: 'P-2019', page: 21, cap: 21, kw: '情窦初开', cam: tt => push(tt, 83.94, 85.68, 1.10, 1.17) }, tt => {
  summer(tt, { shop: true, horizon: 660 });
  // 玻璃后面的 2019：两个人，虚的（比前面小，别抢玻璃）
  CTX.save(); CTX.globalAlpha = .30;
  person('a', W * .62, H * .96, 30, { view: 'q', face: 'angry', t: tt, seed: 3, aR: 1.1, aL: .3 });
  person('b', W * .73, H * .96, 30, { view: 'q', face: 'sad', t: tt, seed: 4, flip: true, aR: .4 });
  CTX.restore();
  // 玻璃反光
  CTX.save(); CTX.globalAlpha = .13; CTX.fillStyle = PAL.paper;
  CTX.beginPath(); CTX.moveTo(0, H * .30); CTX.lineTo(W, H * .16); CTX.lineTo(W, H * .40); CTX.lineTo(0, H * .56); CTX.fill();
  CTX.restore();
  // 他的手掌按在玻璃外（前景）：一口气 + 一只手的形
  const press = clamp((tt - 83.94) / .45);
  CTX.save(); CTX.globalAlpha = .9 * press;
  handprint(W * .32, H * .90 - press * 22, 205, {});
  CTX.restore();
});
// S29B 掌心印在纸上（褶）
FILM.S29B = t => frame(t, { model: 'D-DAY', page: 23, cap: 23, kw: '分离', cam: tt => push(tt, 91.0, 92.8, 1.28, 1.36) }, tt => {
  deskSurface(tt, { edge: false });
  formOnDesk(tt, { x: W * .5, y: H * .54, scale: 1.32, rot: -1, pageNo: 23, palm: clamp((t - 91.0) / .3) * .55 });
  // 掌心压出的褶：三道从掌边散出去的折线
  const k = clamp((t - 91.10) / .4);
  if (k > 0) {
    CTX.save(); CTX.globalAlpha = k * .55;
    for (let i = 0; i < 3; i++) {
      inkLine([[W * .5 - 150 + i * 130, H * .56], [W * .5 - 210 + i * 180, H * .56 + 90 + i * 26]], { sw: 3.4, seed: 895 + i, amp: 1.6 });
    }
    CTX.restore();
  }
});
// S28 "未来"描粗
FILM.S28 = t => frame(t, { model: 'D-DAY', page: 22, cap: 22, kw: '未来' }, tt => {
  formMacro(tt, { label: '物品描述', z: 1.5, text: '未来', ty: 46, size: 110 });
  const k = clamp((t - 85.68) / 2.4);
  for (let i = 0; i < Math.floor(k * 5); i++) {
    txt('未来', W * .5 - 60 + i * 1.5, H * .5 + 46 + i * 1.2, { size: 110, font: FONT.kai, weight: 700, color: PAL.ink, alpha: .35 });
  }
});

// S29 手掌按出褶
FILM.S29 = t => frame(t, { model: 'D-DAY', page: 23, cap: 23, kw: '分离' }, tt => {
  deskSurface(tt, { edge: true });
  formOnDesk(tt, { x: W * .5, y: H * .54, scale: 1.02, rot: -1, pageNo: 23, palm: clamp((t - 89.6) / .4) * .5 });
  const k = clamp((t - 89.2) / .5);
  if (k < 1) { CTX.save(); CTX.globalAlpha = 1 - k * .4; hand(W * .5, H * .66 - k * 40, 0, 1.5, {}); CTX.restore(); }
});

// S30 日期章悬在有效期上
FILM.S30 = t => frame(t, { model: 'S-STEEL', page: 24, cap: 24, kw: '保质期', cam: tt => push(tt, 92.8, 96.4, 1, 1.07) }, tt => {
  deskSurface(tt, { edge: false, fill: '#E4D8BE' });
  macroBox(W * .5, H * .70, 700, 240, '有效期至', '2022.07.03', { size: 88, color: PAL.red });
  // 章影
  CTX.save(); CTX.globalAlpha = .18; CTX.fillStyle = PAL.ink;
  CTX.beginPath(); CTX.ellipse(W * .5, H * .70, 300, 90, 0, 0, PI2); CTX.fill(); CTX.restore();
  CTX.save(); CTX.translate(W * .5 + Math.sin(t * 50) * pulse(t, 6) * 4, H * .30 - (1 - inv(92.8, 95.0, t)) * 60 + pulse(t, 6) * 8); CTX.rotate(-.02 + Math.sin(t * 40) * pulse(t, 6) * .025);
  stampBody(0, 0, 1.15, { text: '受理' });
  CTX.restore();
});

// S32 大厅灭一半，他抱着卷宗
FILM.S32 = t => frame(t, { model: 'D-DAY', page: 25, chip: '等待', hudAlpha: .9 }, tt => {
  hall(tt, { lit: .45 });
  person('a', W * .42, 980, 46, { view: 'front', face: tt < 104.5 ? 'neutral' : 'determined', t: tt, seed: 5, aL: 1.2, aR: 1.2 });
  shape(rectPts(W * .42 - 120, 880, 240, 120), { fill: '#C9B58C', ink: PAL.ink, sw: 5, seed: 941 });
});

// S33 叫号屏特写
FILM.S33 = t => frame(t, { model: 'D-DAY', page: 25, chip: '叫号', cam: tt => push(tt, 106.65, 111.98, 1.12, 1.2) }, tt => {
  shape(rectPts(-40, -40, W + 80, H + 80), { fill: '#DCCDAF', ink: null, seed: 951, boil: false });
  numberScreen(W * .5 - 420, H * .3, 840, { no: '047' });
  // 滚动小字
  const scroll = (t * 120) % 900;
  txt('请 A041 到 3 号窗口  ·  请 A041 到 3 号窗口', W * .5 - 400 + scroll - 300, H * .32, { size: 30, font: FONT.mono, weight: 700, color: PAL.teal, alpha: .7 });
});

// S34 剪影翻面
FILM.S34 = t => frame(t, { model: 'D-DAY', page: 25, chip: '候号' }, tt => {
  hall(tt, { lit: .6 });
  for (let i = 0; i < 7; i++) {
    const x = 180 + i * 250;
    const flip = (beatIndex(t) + i) % 2;
    silhouette(x, 1000, 240, { hot: flip ? 1 : 0, alpha: .95 });
  }
});

// S35 票软了
FILM.S35 = t => frame(t, { model: 'D-DAY', page: 25, chip: 'A047', cam: tt => push(tt, 115.54, 120.87, 1.0, 1.05) }, tt => {
  deskSurface(tt, { edge: true });
  CTX.save();
  CTX.translate(W * .5, H * .5 - pulse(t, 4.4) * 14); CTX.rotate(-.08 + Math.sin(t * 2) * .02 + pulse(t, 4.4) * .05);
  ticket(0, 0, 420, { no: '047' });
  // 软了/皱了
  inkLine([[-150, -60], [140, -30]], { sw: 3, seed: 961, alpha: .4 });
  inkLine([[-120, 60], [160, 90]], { sw: 3, seed: 962, alpha: .35 });
  CTX.save(); CTX.globalAlpha = .3; CTX.fillStyle = PAL.ink;
  CTX.beginPath(); CTX.ellipse(40, 30, 60, 40, .3, 0, PI2); CTX.fill(); CTX.restore();
  CTX.restore();
});

// S36 最后一盏灯灭
FILM.S36 = t => frame(t, { model: 'D-DAY', page: 26, chip: '闭厅' }, tt => {
  hall(tt, { lit: .18 });
  shape(rectPts(W * .5 - 190, 34, 380, 190), { fill: '#0B1220', ink: null, seed: 971, boil: false });
  txt('A047', W * .5, 160, { size: 96, font: FONT.mono, weight: 700, color: PAL.yellow, align: 'center', spacing: 8 });
  person('a', W * .30, 1010, 50, { view: 'q', face: 'determined', t: tt, seed: 5, aL: 1.1, aR: 1.1 });
});

// S37 纸片悬空 · M2
FILM.S37 = t => frame(t, { model: 'N-STREET', page: 27, chip: '掀桌', dark: true, cam: tt => ({ x: -inv(123.98, 130.08, tt) * 260, z: 1.02 }) }, tt => {
  shape(rectPts(-40, -40, W + 80, H + 80), { fill: '#12203A', ink: null, seed: 981, boil: false });
  // 空气：远处一层极淡的网点，纸阵才有"空间"
  CTX.save(); CTX.globalAlpha = .22;
  dots({ x: -40, y: -40, w: W + 80, h: H + 80 }, (u, v) => .05 * (1 - Math.abs(v - .5)), { step: 26, color: '#3E5C7A', angle: 45 });
  CTX.restore();
  const rise = easeOut(clamp((t - 123.98) / .30));     // 一拍之内同时离桌
  const r = srand(801);
  const items = [];
  for (let i = 0; i < 34; i++) {
    const depth = r();
    items.push({
      x: r() * W * 1.12 - W * .06, y: H * .16 + r() * H * .72,
      s: .34 + depth * .62, rot: (r() - .5) * 1.15,
      ph: r() * PI2, depth, kind: Math.floor(r() * 4),
      hero: i < 9, idx: i,
    });
  }
  items.sort((a, b) => a.depth - b.depth);
  for (const it of items) {
    const bob = Math.sin(t * 1.5 + it.ph) * 9;
    const y0 = it.y + bob + (1 - rise) * (H * .45 - it.y) * .9;
    // 翻面：穿过去的那张翻个身
    const flipPh = Math.cos((t - 124.6 - it.idx * .12) * 1.7 + it.ph);
    const fx = flipPh > 0 ? Math.max(.12, Math.abs(flipPh)) : Math.max(.12, Math.abs(flipPh));
    CTX.save();
    CTX.translate(it.x + (it.depth - .5) * 40, y0);
    CTX.rotate(it.rot + Math.sin(t * .8 + it.ph) * .05);
    CTX.scale(it.s * fx, it.s);
    const w = 300, h = 400;
    if (it.hero && flipPh < 0) {
      // 翻到背面：空白（网点最密的一层）
      shape(rectPts(-w / 2, -h / 2, w, h), { fill: '#EFE5CE', ink: PAL.ink, sw: 6, seed: 810 + it.idx, gap: false });
      CTX.save(); CTX.globalAlpha = .30;
      dots({ x: -w / 2 + 16, y: -h / 2 + 16, w: w - 32, h: h - 32 }, D.radial(.5, .5, .75, .42, .06), { step: 14, color: PAL.ink, angle: 45 });
      CTX.restore();
    } else {
      shape(rectPts(-w / 2, -h / 2, w, h), { fill: '#FBF5E6', ink: PAL.ink, sw: 6, seed: 810 + (it.x | 0), gap: false });
      if (it.hero) {
        // 一张真的附件：编号 + 年份 + 三年的一个现场（用网点/线条画，不用贴图）
        const kk = it.idx;
        shape(rectPts(-w / 2 + 14, -h / 2 + 14, 74, 54), { fill: PAL.ink, ink: null, seed: 830 + kk });
        txt('ABCDEFGHI'[kk], -w / 2 + 51, -h / 2 + 53, { size: 34, font: FONT.mono, weight: 700, color: PAL.paper, align: 'center' });
        txt(['2019.07', '2019.09', '2019.12', '2020.03', '2020.07', '2020.11', '2021.03', '2021.09', '2022.03'][kk],
          w / 2 - 20, -h / 2 + 46, { size: 22, font: FONT.mono, weight: 700, color: PAL.ink, align: 'right', alpha: .8, spacing: 1 });
        if (it.kind === 0) {
          // 拍立得：照片里是夜街
          shape(rectPts(-w * .36, -h * .26, w * .72, h * .40), { fill: '#22344F', ink: PAL.ink, sw: 4, seed: 840 + kk, gap: false });
          CTX.save(); CTX.globalAlpha = .5;
          dots({ x: -w * .36, y: -h * .26, w: w * .72, h: h * .40 }, D.band(.10, .45, .3, 1), { step: 14, color: '#8FB6BE', angle: 45 });
          CTX.restore();
          CTX.save(); CTX.globalAlpha = .85; CTX.fillStyle = PAL.yellow;
          for (let q = 0; q < 5; q++) CTX.fillRect(-w * .32 + q * 26, -h * .14 + (q % 2) * 22, 10, 9);
          CTX.restore();
        } else if (it.kind === 1) {
          // 小票：一列字行 + 金额
          for (let q = 0; q < 7; q++) inkLine([[-w * .34, -h * .20 + q * 34], [w * .10 - (q % 3) * 40, -h * .20 + q * 34]], { sw: 3.4, seed: 850 + q, alpha: .55 });
          txt('¥ 47.0', w * .30, h * .16, { size: 26, font: FONT.mono, weight: 700, color: PAL.red, align: 'right', alpha: .9 });
        } else if (it.kind === 2) {
          // 票根：8 排 6 座
          shape(rectPts(-w * .40, -h * .22, w * .80, h * .26), { fill: '#FFFDF4', ink: PAL.ink, sw: 4, seed: 860 + kk, gap: false });
          txt('8 排 6 座', 0, h * .02, { size: 30, font: FONT.kai, weight: 700, color: PAL.ink, align: 'center' });
          txt('NO.047', 0, h * .10, { size: 18, font: FONT.mono, weight: 700, color: PAL.red, align: 'center' });
        } else {
          // 一张写给她的便签
          shape(rectPts(-w * .34, -h * .24, w * .68, h * .30), { fill: '#F6E08E', ink: PAL.ink, sw: 4, seed: 870 + kk, gap: false });
          txt('今天有惊喜', 0, -h * .02, { size: 26, font: FONT.kai, weight: 700, color: PAL.ink, align: 'center' });
        }
        for (let q = 0; q < 3; q++) inkLine([[-w * .34, h * .20 + q * 30], [w * .30 - q * 26, h * .20 + q * 30]], { sw: 3, seed: 880 + q, alpha: .45 });
      } else {
        if (it.kind === 0) { CTX.save(); CTX.globalAlpha = .30; dots({ x: -120, y: -170, w: 240, h: 220 }, D.band(.28, .05, 0, 1), { step: 16, color: '#7A6A48', angle: 15 }); CTX.restore(); }
        else if (it.kind === 1) { inkLine([[-120, -40], [120, -40]], { sw: 5, seed: 820 + (it.x | 0), alpha: .45 }); inkLine([[-120, 20], [60, 20]], { sw: 4, seed: 821 + (it.x | 0), alpha: .35 }); }
        else if (it.kind === 2) shape(rectPts(-140, -30, 90, 60), { fill: PAL.red, ink: null, seed: 822, alpha: .16 });
        else { CTX.save(); CTX.globalAlpha = .22; dots({ x: -120, y: -170, w: 240, h: 380 }, D.flat(.16), { step: 18, color: PAL.ink, angle: 45 }); CTX.restore(); }
      }
    }
    CTX.restore();
  }
  // 扬起来的网点灰（径向衰减，不能是一条硬边）
  if (t < 125.6) {
    const g = clamp((t - 123.98) / 1.5);
    CTX.save(); CTX.globalAlpha = 1;
    dots({ x: -40, y: H * .42, w: W + 80, h: H * .62 }, (u, v) => {
      const dd = Math.hypot((u - .5) * 1.2, (v - .85) * .95);
      return clamp(1 - dd * 1.7) * .42 * (1 - g);
    }, { step: 17, color: PAL.paper, angle: 30 });
    CTX.restore();
  }
});

// S38 抓到的是空白
FILM.S38 = t => frame(t, { model: 'N-STREET', page: 28, cap: 26, kw: '抹去', dark: true }, tt => {
  shape(rectPts(-40, -40, W + 80, H + 80), { fill: '#12203A', ink: null, seed: 982, boil: false });
  paperStorm(tt, { n: 22 });
  person('a', W * .5, 1010 - clamp((tt - 133.4) / .5) * 8, 56, { view: 'q', face: tt < 133.6 ? 'sad' : 'cry', t: tt, seed: 5, aR: lerp(1.3, .7, clamp((tt - 133.2) / .6)) });
  CTX.save(); CTX.translate(W * .62, H * .48); CTX.rotate(-.12);
  shape(rectPts(-160, -210, 320, 420), { fill: '#FBF5E6', ink: PAL.ink, sw: 6, seed: 983, gap: false });
  CTX.save(); CTX.globalAlpha = .45; dots({ x: -140, y: -190, w: 280, h: 380 }, D.flat(.4), { step: 14, color: PAL.ink, angle: 45 }); CTX.restore();
  CTX.restore();
});

// S39 跪着拾
FILM.S39 = t => frame(t, { model: 'N-STREET', page: 29, cap: 27, kw: '拾起', dark: true, cam: tt => push(tt, 135.52, 141.76, 1.02, 1.06) }, tt => {
  shape(rectPts(-40, -40, W + 80, H + 80), { fill: '#12203A', ink: null, seed: 984, boil: false });
  paperStorm(tt, { n: 16, scatter: .6 });
  person('a', W * .34, 1040 - clamp((tt - 140.0) / .6) * 10, 52, {
    view: 'q', face: tt < 140.2 ? 'cry' : 'hopeful', t: tt, seed: 5,
    aL: .5, aR: lerp(1.4, .55, clamp((tt - 139.9) / .5)), rot: .12,
  });
});

// S40 冲击帧（纸被一次吸回，叠成册，他一屁股坐倒）· M3
FILM.S40 = t => frame(t, { model: 'N-STREET', page: 29, chip: 'M3', dark: true, hud: false }, tt => {
  shape(rectPts(-40, -40, W + 80, H + 80), { fill: '#0B1220', ink: null, seed: 985, boil: false });
  const k = inv(141.76, 142.22, t);          // 吸入只用 0.46s
  const sit = clamp((t - 141.90) / .30);
  const cxp = W * .5, cyp = H * .66;
  // 他：坐倒（squash 0.9 → 0.96）+ 抱的姿势
  person('a', cxp, 1046 + sit * 14, 44, {
    view: 'front', face: 'surprised', t: tt, seed: 5, sq: sit * .10, sw: 7,
    aL: lerp(1.4, .62, sit), aR: lerp(1.4, .62, sit),
  });
  // 纸：从四面八方向胸口反向加速
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * PI2 + .35, ang0 = (i % 2 ? 1 : -1) * (1.2 - i * .05);
    const d = lerp(880, 26, easeIn(k));
    const px = cxp + Math.cos(a) * d, py = cyp + Math.sin(a) * d * .78;
    const sc = lerp(1, .16, easeIn(k));
    CTX.save(); CTX.globalAlpha = 1 - clamp((k - .45) / .35);
    CTX.translate(px, py); CTX.rotate(ang0 * (1 - k));
    CTX.scale(sc, sc);
    shape(rectPts(-70, -92, 140, 184), { fill: '#FBF5E6', ink: PAL.ink, sw: 5, seed: 986 + i, gap: false });
    CTX.restore();
    // 拖尾：速度线朝他
    if (k > .05 && k < .95) {
      const L = 90 + 240 * easeIn(k);
      const dx = (px - cxp), dy = (py - cyp), dd = Math.hypot(dx, dy) || 1;
      inkLine([[px + dx / dd * 14, py + dy / dd * 14], [px + dx / dd * L, py + dy / dd * L]],
        { sw: 3.4, color: PAL.paper, seed: 990 + i, alpha: .5 * k, amp: 1 });
    }
  }
  // 叠成册：三块厚边 + 封面（落在怀里，不挡脸）
  const bk = clamp((k - .62) / .38);
  if (bk > 0) {
    CTX.save(); CTX.translate(cxp - 70, 968); CTX.rotate(-.06);
    const w = lerp(120, 214, bk), h = lerp(150, 248, bk);
    for (let i = 3; i >= 1; i--) {
      shape(rectPts(-w / 2 + i * 6, -h / 2 + i * 7, w, h), { fill: '#E4D8BE', ink: PAL.ink, sw: 3.4, seed: 995 + i, gap: false, inkAlpha: .7 });
    }
    shape(rectPts(-w / 2, -h / 2, w, h), { fill: '#D9C08A', ink: PAL.ink, sw: 6, seed: 999, gap: false });
    shape(rectPts(-w / 2, -h / 2, w, 46), { fill: '#C9AE72', ink: PAL.ink, sw: 4, seed: 1001, gap: false });
    if (bk > .5) {
      txt('遗失物认领单', 0, -h / 2 + 32, { size: 22, font: FONT.serif, weight: 900, color: PAL.ink, align: 'center' });
      stamp({ x: -10, y: h * .26, scale: .30, rot: -9, text: '受理', sub: 'RECEIVED', ink: PAL.red, seed: 4 });
    }
    CTX.restore();
  }
  // 落地：网点灰（径向衰减，不能是一块方补丁）
  if (t > 142.02) {
    const g = clamp((t - 142.02) / .40);
    CTX.save(); CTX.globalAlpha = (1 - g) * .5;
    dots({ x: cxp - 700, y: 900, w: 1400, h: 260 }, (u, v) => {
      const dd = Math.hypot((u - .5) * 1.4, (v - .55) * 1.1);
      return clamp(1 - dd * 1.9) * .5 * (1 - g);
    }, { step: 15, color: PAL.paper, angle: 30 });
    CTX.restore();
  }
  if (t >= 142.02 && t < 142.09) {
    CTX.save(); CTX.globalAlpha = .45; CTX.fillStyle = '#FFFDF4'; CTX.fillRect(-40, -40, W + 80, H + 80); CTX.restore();
  }
});

// S41 划掉 2022 写 2019
FILM.S41 = t => frame(t, { model: 'D-DAY', page: 29, cap: 28, kw: '还没有' }, tt => {
  deskSurface(tt, { edge: true });
  macroBox(W * .5, H * .56, 760, 260, '有效期至', '2022.07.03', { size: 84, color: PAL.red });
  if (t > 144.0) inkLine([[W * .5 - 300, H * .56 + 60], [W * .5 + 40, H * .56 + 40]], { sw: 12, color: PAL.ink, seed: 991, amp: 2 });
  if (t > 145.6) txt('2019', W * .5 + 120, H * .56 + 70, { size: 96, font: FONT.kai, weight: 700, color: PAL.ink });
});

// S42 长尾夹咬合
FILM.S42 = t => frame(t, { model: 'D-DAY', page: 29, cap: 29, kw: '别再分离' }, tt => {
  deskSurface(tt, { edge: true });
  shape(rectPts(W * .5 - 260, H * .35, 520, 560), { fill: '#FBF5E6', ink: PAL.ink, sw: 6, seed: 992, gap: false });
  inkLine([[W * .5 - 230, H * .45], [W * .5 + 230, H * .44]], { sw: 4, seed: 993, alpha: .4 });
  const k = clamp((t - 151.0) / .3);
  CTX.save(); CTX.translate(W * .5, H * .35 + (1 - k) * -60); CTX.scale(1.6, 1.6);
  CTX.strokeStyle = PAL.ink; CTX.lineWidth = 7; CTX.lineCap = 'round';
  CTX.beginPath(); CTX.moveTo(-40, 0); CTX.lineTo(40, 0); CTX.stroke();
  CTX.beginPath(); CTX.moveTo(-30, 0); CTX.quadraticCurveTo(0, -34, 30, 0); CTX.stroke();
  CTX.restore();
});

// S43 卷宗放上台面
FILM.S43 = t => frame(t, { model: 'D-DAY', page: 29, chip: '递交' }, tt => {
  deskSurface(tt, { edge: true });
  const k = inv(155.97, 156.72, t);
  shape(rectPts(W * .5 - 300, H * .34, 600, 460), { fill: '#D9C08A', ink: PAL.ink, sw: 7, seed: 994, gap: false });
  shape(rectPts(W * .5 - 300, H * .34, 600, 70), { fill: '#C9AE72', ink: PAL.ink, sw: 5, seed: 995, gap: false });
  txt('遗失物认领单', W * .5, H * .34 + 48, { size: 34, font: FONT.serif, weight: 900, color: PAL.ink, align: 'center' });
  CTX.save(); CTX.globalAlpha = .3;
  dots({ x: W * .5 - 300, y: H * .58, w: 600, h: 200 }, D.radial(.5, .5, .5, .5, 0), { step: 18, color: PAL.ink, angle: 30 });
  CTX.restore();
});

// S44 挑开黏住的第一页
FILM.S44 = t => frame(t, { model: 'D-DAY', page: 30, cap: 30, kw: '可不可以' }, tt => {
  winFront(tt, { clerk: true, clerkFace: 'neutral', u: 52 });
  paperStack(1180, 660, 5, {});
  if (t > 158.4) tornCorner(1290, 560, 90, -1);
});

// S45 附件推回来
FILM.S45 = t => frame(t, { model: 'D-DAY', page: 31, cap: 31, kw: '回忆' }, tt => {
  page('D-DAY', tt);
  shape(rectPts(-30, 150, W + 60, 200), { fill: '#22344F', ink: PAL.ink, sw: 7, seed: 996, gap: false });
  CTX.save(); CTX.globalAlpha = .45;
  dots({ x: 0, y: 150, w: W, h: 200 }, D.radial(.5, .95, .95, .10, .03), { step: 28, color: '#3E5C7A', angle: 45 });
  CTX.restore();
  shape(rectPts(-30, 350, W + 60, 26), { fill: '#D8C9A9', ink: PAL.ink, sw: 5, seed: 1013, gap: false });
  shape(rectPts(-30, 376, W + 60, H), { fill: '#E9DDC2', ink: null, seed: 1014, boil: false });
  const k = inv(160.9, 163.4, t);
  const cx2 = lerp(W * .5, W * .46, k), cy2 = lerp(300, H * .62, k);
  paperStack(cx2, cy2, 6, {});
  // 推回来的拖尾
  if (k > 0 && k < 1) {
    for (let i = 0; i < 3; i++) inkLine([[cx2 - 220 - i * 70, cy2 - 90], [cx2 - 300 - i * 70, cy2 - 90 + (i - 1) * 24]], { sw: 4, seed: 1015 + i, alpha: .35 });
  }
});

// S46 红笔写"描述不清"
FILM.S46 = t => frame(t, { model: 'D-DAY', page: 32, cap: 32, kw: '道理' }, tt => {
  formMacro(tt, { label: '物品描述', z: 1.5, text: '' });
  const chars = '描述不清';
  const n = clamp((t - 165.6) / 2.0) * 4;
  for (let i = 0; i < Math.ceil(n); i++) {
    txt(chars[i], W * .5 - 220 + i * 116, H * .54, { size: 96, font: FONT.kai, weight: 700, color: PAL.red, alpha: i < n ? 1 : .4 });
  }
});

// S47 抢笔写"她"
FILM.S47 = t => frame(t, { model: 'D-DAY', page: 33, cap: 33, kw: '情窦初开' }, tt => {
  formMacro(tt, { label: '物品描述', z: 1.48, text: '描述不清', ty: 10, size: 62, color: PAL.red });
  if (t > 169.9) txt('她', W * .5 + 40, H * .62, { size: 130, font: FONT.kai, weight: 700, color: PAL.ink });
  CTX.save(); CTX.translate(W * .78, H * .34); CTX.rotate(-.5); pen(0, 0, 0, { len: 240, color: PAL.ink, w: 11 }); CTX.restore();
});

// S48 举第二套章
FILM.S48 = t => frame(t, { model: 'S-STEEL', page: 34, cap: 34, kw: '未来', cam: tt => push(tt, 171.48, 174.87, 1, 1.05) }, tt => {
  shape(rectPts(-40, -40, W + 80, H + 80), { fill: '#EDE3CE', ink: null, seed: 997, boil: false });
  CTX.save(); CTX.translate(W * .5 + Math.sin(t * 48) * pulse(t, 7) * 5, H * .30 + (1 - inv(171.48, 172.4, t)) * -160 + pulse(t, 7) * 7); CTX.rotate(.04 + Math.sin(t * 42) * pulse(t, 7) * .03);
  stampBody(0, 0, 1.45, { text: '补正', rot: -4 });
  CTX.restore();
});

// S49 章落，压在上一道印上
FILM.S49 = t => frame(t, { model: 'S-STEEL', page: 35, cap: 35, kw: '分离', cam: tt => shakeCam(tt, 176.30, 18) }, tt => {
  deskSurface(tt, { edge: false, fill: '#E4D8BE' });
  const d = t - 176.30;
  stamp({ x: H * 0 + W * .48, y: H * .52, scale: 1.0, rot: -6, text: '受理', sub: 'RECEIVED', ink: PAL.red, alpha: .35, seed: 4 });
  if (d > 0) {
    const s = d < .09 ? lerp(2.6, 1, easeIn(d / .09)) : 1;
    stamp({ x: W * .5, y: H * .53, scale: s, rot: -5, text: '补正', sub: 'NEED MORE', ink: PAL.red, seed: 6 });
  }
  if (d > .2) { CTX.save(); CTX.globalAlpha = .5; CTX.fillStyle = PAL.paper; CTX.beginPath(); CTX.ellipse(W * .50, H * .53, 40, 30, 0, 0, PI2); CTX.fill(); CTX.restore(); }
});

// S50 举到灯下，洞
FILM.S50 = t => frame(t, { model: 'S-STEEL', page: 36, cap: 36, kw: '保质期' }, tt => {
  deskSurface(tt, { edge: false, fill: '#E4D8BE' });
  formOnDesk(tt, { x: W * .5, y: H * .5, scale: .95, rot: -2, pageNo: 36, hole: true, expiry: '2022.07.03' });
});

// S51 第三套章
FILM.S51 = t => frame(t, { model: 'S-STEEL', page: 37, cap: 37, kw: '愿意' }, tt => {
  shape(rectPts(-40, -40, W + 80, H + 80), { fill: '#EDE3CE', ink: null, seed: 998, boil: false });
  CTX.save(); CTX.translate(W * .5 + Math.sin(t * 46) * pulse(t, 7) * 5, H * .36 + (1 - inv(183.52, 184.4, t)) * -140 + pulse(t, 7) * 7); CTX.rotate(-.05 + Math.sin(t * 41) * pulse(t, 7) * .03);
  stampBody(0, 0, 1.4, { text: '过期', rot: 3 });
  CTX.restore();
});

// S52 第三次同机位
FILM.S52 = t => frame(t, { model: 'D-DAY', page: 38, cap: 38, kw: '可不可以' }, tt => {
  winFront(tt, { clerk: true, clerkFace: 'neutral', u: 52 });
  // 台面上的纸屑
  const r7 = srand(440);
  for (let i = 0; i < 14; i++) {
    const x = 760 + r7() * 860, y = 660 + r7() * 120;
    shape(rectPts(x, y, 20 + r7() * 40, 12 + r7() * 20), { fill: '#FBF5E6', ink: null, seed: 999 + i });
  }
  // 卷宗推过去
  const k = inv(185.2, 186.6, t);
  shape(rectPts(lerp(W * .18, W * .40, k), H * .66, 520, 300), { fill: '#D9C08A', ink: PAL.ink, sw: 6, seed: 1001, gap: false });
});

// S53 鞋踩过拍立得
FILM.S53 = t => frame(t, { model: 'D-DAY', page: 39, cap: 39, kw: '回忆', cam: tt => push(tt, 188.88, 192.32, 1.2, 1.1) }, tt => {
  shape(rectPts(-40, -40, W + 80, H + 80), { fill: '#CFC0A2', ink: null, seed: 1002, boil: false });
  polaroid(W * .46, H * .58, 420, { rot: .12, face: 'sad', t: tt, note: '' });
  // 鞋印（网点）
  const k = clamp((t - 190.4) / .4);
  if (k > 0) {
    CTX.save(); CTX.globalAlpha = k * .8;
    dots({ x: W * .40, y: H * .44, w: 260, h: 360 }, D.radial(.5, .5, .5, .55, 0), { step: 12, color: PAL.ink, angle: 30 });
    CTX.restore();
  }
  silhouette(W * .78, H * .30, 420, { alpha: .5 });
});

// S54 翻过来在背面写
FILM.S54 = t => frame(t, { model: 'D-DAY', page: 40, cap: 40, kw: '道理' }, tt => {
  deskSurface(tt, { edge: true });
  CTX.save(); CTX.translate(W * .5, H * .52); CTX.rotate(.02);
  formSheet(0, 0, 720, 3, { applicant: '岩', time: '2019.07.03', place: '火车站 3 号出口', desc: '一个人' });
  CTX.restore();
  // 背面的字（越来越挤）
  const r8 = srand(450);
  for (let i = 0; i < 40; i++) {
    const k = clamp((t - 192.32 - i * .06) / .3);
    if (k <= 0) continue;
    txt('她', 200 + r8() * 1400, 180 + r8() * 700, { size: 20 + r8() * 18, font: FONT.kai, weight: 700, color: PAL.ink, alpha: .55 * k });
  }
});

// S55 塞进 3cm 的缝
FILM.S55 = t => frame(t, { model: 'D-DAY', page: 41, cap: 41, kw: '情窦初开', cam: tt => push(tt, 195.54, 199.44, 1.0, 1.06) }, tt => {
  // 窗洞（在 HUD 下面才开始）
  shape(rectPts(-30, 150, W + 60, 230), { fill: '#22344F', ink: PAL.ink, sw: 7, seed: 1003, gap: false });
  CTX.save(); CTX.globalAlpha = .5;
  dots({ x: 0, y: 150, w: W, h: 230 }, D.radial(.5, .95, .95, .12, .03), { step: 28, color: '#3E5C7A', angle: 45 });
  CTX.restore();
  // 台面 + 那条缝
  shape(rectPts(-30, 380, W + 60, 54), { fill: '#D8C9A9', ink: PAL.ink, sw: 5, seed: 1011, gap: false });
  shape(rectPts(W * .12, 402, W * .76, 20), { fill: '#0B1220', ink: PAL.ink, sw: 4, seed: 1004, gap: false });
  shape(rectPts(-30, 434, W + 60, H), { fill: '#E4D8BE', ink: PAL.ink, sw: 5, seed: 1012, gap: false });
  // 卷宗往上推，压进缝里
  const k = inv(195.54, 198.8, t);
  const y = lerp(H * 1.02, 392, easeOut(clamp(k)));
  const sq = 1 - clamp((y - 392) / 500) * .30;
  CTX.save(); CTX.translate(W * .5, y); CTX.scale(1 + clamp((392 - y) / 400) * .06, sq);
  shape(rectPts(-300, -190, 600, 380), { fill: '#D9C08A', ink: PAL.ink, sw: 7, seed: 1005, gap: false });
  shape(rectPts(-300, -190, 600, 58), { fill: '#C9AE72', ink: PAL.ink, sw: 5, seed: 1006, gap: false });
  txt('遗失物认领单', 0, -150, { size: 30, font: FONT.serif, weight: 900, color: PAL.ink, align: 'center' });
  CTX.restore();
  // 台沿压在纸上面 —— 纸是"进去"的，不是浮在前面
  shape(rectPts(-30, 386, W + 60, 16), { fill: '#D8C9A9', ink: PAL.ink, sw: 5, seed: 1011, gap: false });
  // 缝口张开：两端被纸挤得鼓起来
  if (k > .55) {
    const b = clamp((k - .55) / .35);
    CTX.save(); CTX.globalAlpha = .9;
    inkLine([[W * .12, 402], [W * .12 - 16 * b, 402 - 10 * b], [W * .12, 402 + 18]], { sw: 4, color: PAL.ink, seed: 1031 });
    inkLine([[W * .88, 402], [W * .88 + 16 * b, 402 - 10 * b], [W * .88, 402 + 18]], { sw: 4, color: PAL.ink, seed: 1032 });
    CTX.restore();
  }
  // 窗口里的手按住不放（从缝里伸出来，五指压住纸边）
  if (k > .48) {
    const hk = clamp((k - .48) / .28);
    CTX.save(); CTX.translate(W * .5 - 30, 398 - hk * 12); CTX.globalAlpha = hk;
    shape(rrectPts(-44, 10, 88, 96, 26), { fill: SKIN_D, ink: PAL.ink, sw: 5, seed: 1020 });
    shape(ellPts(0, -8, 76, 56, 18), { fill: SKIN, ink: PAL.ink, sw: 5.5, seed: 1021 });
    for (let i = 0; i < 4; i++) {
      const fx = -57 + i * 38;
      shape(rrectPts(fx - 15, -80 + Math.abs(i - 1.5) * 9, 30, 76, 15), { fill: SKIN, ink: PAL.ink, sw: 4.4, seed: 1022 + i });
      inkLine([[fx, -68], [fx, -40]], { sw: 2.6, color: SKIN_D, seed: 1030 + i, alpha: .45 });
    }
    shape(rrectPts(58, -34, 30, 68, 15), { fill: SKIN, ink: PAL.ink, sw: 4.4, seed: 1027 });
    CTX.restore();
  }
  // 台面下的抽屉线
  inkLine([[120, 760], [W - 120, 760]], { sw: 4, seed: 1019, alpha: .35 });
  txt('3 号窗口', W - 130, 800, { size: 26, font: FONT.mono, weight: 700, color: PAL.ink, align: 'right', alpha: .45 });
  // 纸被挤出的褶
  if (k > .7) for (let i = 0; i < 5; i++) inkLine([[W * .5 - 280 + i * 140, 392], [W * .5 - 240 + i * 140, 372]], { sw: 4, seed: 1017 + i, alpha: .5 });
});

// S56 纸被抽走，章在空中
FILM.S56 = t => frame(t, { model: 'S-STEEL', page: 42, cap: 42, kw: '未来' }, tt => {
  deskSurface(tt, { edge: false, fill: '#E4D8BE' });
  // 纸被抽走：一张有字的表，被从右下拽出去
  const k = inv(199.44, 201.2, t);
  CTX.save(); CTX.translate(W * .44 + k * 1080, H * .64 - k * 60); CTX.rotate(k * .34);
  shape(rectPts(-340, -210, 680, 420), { fill: '#FBF5E6', ink: PAL.ink, sw: 6, seed: 1006, gap: false });
  txt('遗失物认领单', 0, -150, { size: 42, font: FONT.serif, weight: 900, color: PAL.ink, align: 'center' });
  for (let i = 0; i < 4; i++) inkLine([[-280, -80 + i * 62], [200 - i * 30, -80 + i * 62]], { sw: 3.6, seed: 950 + i, alpha: .5 });
  stamp({ x: 120, y: 120, scale: .55, rot: -8, text: '受理', sub: 'RECEIVED', ink: PAL.red, alpha: .55, seed: 5 });
  // 被拽出的拖影
  for (let i = 1; i <= 3; i++) inkLine([[-340 - i * 60, -210 + i * 40], [-340 - i * 60, 210 + i * 40]], { sw: 3, seed: 960 + i, alpha: .25 / i });
  CTX.restore();
  // 章在空中（202.0 才进画，之前不许停在画面上）
  const d = t - 201.6;
  if (d > -.42) {
    const fall = clamp((d + .42) / .90);
    const y = lerp(-460, H * .60, easeIn(fall) * .55 + fall * .45);
    for (let i = 2; i >= 0; i--) {
      const yy = y - i * 46 * (1 - fall);
      CTX.save(); CTX.translate(W * .5, yy); CTX.scale(2.2, 2.2); CTX.globalAlpha = i ? .10 : 1;
      stamp({ x: 0, y: 0, scale: 1, rot: -5, text: '过期', sub: 'EXPIRED', ink: PAL.red, seed: 8 });
      CTX.restore();
    }
  }
});

// S57 章砸桌面（底下没有纸）· M5
FILM.S57 = t => frame(t, { model: 'X-VOID', page: 43, cap: 43, kw: '分离', dark: true, cam: tt => shakeCam(tt, 203.04, 26) }, tt => {
  voidDesk(tt, { sx: W * .30, sy: H * .70, oldText: '受理', slide: clamp((t - 203.0) / .55) });
  const d = t - 203.04;
  if (d > 0) {
    const s = d < .09 ? lerp(2.55, 1, easeIn(d / .09)) : 1 + .035 * Math.exp(-(d - .09) * 16) * Math.sin((d - .09) * 60);
    stamp({ x: 1240, y: 700, scale: s, rot: -4, text: '过期', sub: 'EXPIRED', ink: PAL.red, seed: 11 });
    // 砸空的证据：底下只有桌面，没有纸 —— 一圈震开的灰 + 两支崩出去的笔
    const g = clamp(d / .7);
    CTX.save(); CTX.globalAlpha = (1 - g) * .34;
    dots({ x: 1240 - 520, y: 700 - 520, w: 1040, h: 1040 }, (u, v) => {
      const dd = Math.hypot(u - .5, v - .5); return clamp(1 - Math.abs(dd - .30 - g * .16) * 14) * (1 - g);
    }, { step: 17, color: PAL.red, angle: 45 });
    CTX.restore();
    if (d < .10) { CTX.save(); CTX.globalAlpha = .40; CTX.fillStyle = '#FFFDF4'; CTX.fillRect(-40, -40, W + 80, H + 80); CTX.restore(); }
  }
});

// S58 旧印上的划痕
FILM.S58 = t => frame(t, { model: 'X-VOID', page: 43, cap: 44, kw: '保质期', dark: true, cam: tt => push(tt, 206.56, 208.85, 1.1, 1.3) }, tt => {
  voidDesk(tt, { sx: W * .5, sy: H * .56, oldText: '受理' });
  inkLine([[W * .42, H * .48], [W * .58, H * .62]], { sw: 6, color: '#0B1220', seed: 1007, amp: 2 });
});

// S59 叫号屏跳 A048
FILM.S59 = t => frame(t, { model: 'D-DAY', page: 45, cap: 45, kw: '愿意' }, tt => {
  hall(tt, { lit: .12 });
  numberScreen(W * .5 - 190, 58, 380, { no: t > 209.4 ? '048' : '047' });
  silhouette(W * .3, 1000, 300, { alpha: .45 });
});

// S61 签左栏
FILM.S61 = t => frame(t, { model: 'D-DAY', page: 47, chip: '签字' }, tt => {
  page('D-DAY', tt);
  sigSheet(tt, { signLeft: clamp((t - 215.4) / .8), ghost: true });
  CTX.save(); CTX.translate(W * .5 - 120, H * .58); CTX.rotate(-1.35); pen(0, 0, 0, { len: 240, color: PAL.ink, w: 11 }); CTX.restore();
});

// S62 笔放下滚半圈，他走
FILM.S62 = t => frame(t, { model: 'D-DAY', page: 47, cap: 47, kw: '愿意' }, tt => {
  page('D-DAY', tt);
  sigSheet(tt, { signLeft: 1, ghost: true });
  const roll = clamp((t - 221.4) / .5);
  CTX.save(); CTX.translate(W * .5 + 60 + roll * 60, H * .62 - Math.sin(roll * Math.PI) * 30); CTX.rotate(1.55 + roll * .9);
  pen(0, 0, 0, { len: 240, color: PAL.ink, w: 11 });
  CTX.restore();
  const leave = clamp((t - 222.2) / 2.2);
  CTX.save(); CTX.globalAlpha = 1 - leave * .8;
  shape(rrectPts(W * .1 + leave * 240, H * .80 - leave * 120, 120, 220, 30), { fill: '#3E3A46', ink: PAL.ink, sw: 6, seed: 1008 });
  shape(rrectPts(W * .22 + leave * 240, H * .80 - leave * 120, 120, 220, 30), { fill: '#3E3A46', ink: PAL.ink, sw: 6, seed: 1009 });
  CTX.restore();
});

// S63 空桌，票飘落
FILM.S63 = t => frame(t, { model: 'D-DAY', page: 47, hudAlpha: .8 }, tt => {
  page('D-DAY', tt);
  sigSheet(tt, { signLeft: 1, ghost: true, dy: 40 });
  const fall = clamp((t - 227.0) / 2.0);
  ticket(W * .16 + fall * 60, lerp(-100, H * .86, fall * fall), 150, { no: '047', rot: fall * 2.4 });
});

// S64 右栏特写
FILM.S64 = t => frame(t, { model: 'D-DAY', page: 47, hud: false, cam: tt => push(tt, 229.5, 231.8, 1.3, 1.34) }, tt => {
  page('D-DAY', tt);
  sigSheet(tt, { k: 1, signLeft: 1, ghost: true });
  // 网点呼吸（0.5%/拍）：整张纸一起涨落，不是一块补丁
  const br = .5 + .5 * Math.sin(t * 2.4);
  CTX.save(); CTX.globalAlpha = .10 + br * .06;
  dots({ x: 0, y: 0, w: W, h: H }, (u, v) => .06 + .10 * Math.exp(-Math.hypot(u - .62, v - .55) / .28), { step: 24, color: PAL.ink, angle: 15 });
  CTX.restore();
});

// S65 粉笔伸进来
FILM.S65 = t => frame(t, { model: 'D-DAY', page: 47, hud: false, cam: tt => push(tt, 231.8, 234.2, 1.0, 1.08) }, tt => {
  page('D-DAY', tt);
  sigSheet(tt, { signLeft: 1, ghost: false });
  const k = inv(231.8, 233.4, t);
  const x = lerp(W * 1.15, W * .58, easeOut(clamp(k)));
  CTX.save(); CTX.translate(x, H * .50 + (1 - clamp(k)) * 30); CTX.rotate(1.42);
  pen(0, 0, 0, { len: 320, color: PAL.pink, w: 13 });
  CTX.restore();
});

// S66 笔尖点一个点
FILM.S66 = t => frame(t, { model: 'P-2019', page: 47, hud: false, cam: tt => push(tt, 234.2, 236.6, 1.1, 1.16) }, tt => {
  page('P-2019', tt);
  sigSheet(tt, { signLeft: 1, ghost: false });
  const k = clamp((t - 235.2) / .5);
  const r2 = lerp(3, 26, k);
  CTX.save(); CTX.fillStyle = PAL.pink; CTX.beginPath(); CTX.arc(W * .5 + 250, H * .56 + 40, r2, 0, PI2); CTX.fill(); CTX.restore();
});

function ctxDotR(cx, cy, r, fn) {
  CTX.save(); CTX.beginPath(); CTX.arc(cx, cy, r, 0, PI2); CTX.clip(); fn(); CTX.restore();
}
// S68 点缩成一点 → 硬切黑
FILM.S68 = t => frame(t, { model: 'X-VOID', page: 47, hud: false, dark: true }, tt => {
  shape(rectPts(-40, -40, W + 80, H + 80), { fill: '#080D18', ink: null, seed: 1010, boil: false });
  // 点：从"整块墨"缩回一个点，从签字栏的位置滑到画面正中
  const k = easeOut(clamp((t - 239.0) / .50));
  const r = lerp(400, 10, k);
  const cx = lerp(W * .5 + 250, W * .5, k), cy = lerp(H * .56 + 40, H * .5, k);
  // 散出去的点（只在前 0.5s）
  if (k < 1) {
    CTX.save(); CTX.globalAlpha = (1 - k) * .7;
    for (let i = 0; i < 40; i++) {
      const a = i / 40 * PI2 + hash2(i, 5) * .2, d = r + 20 + hash2(i, 7) * 260 * k;
      const sz = 2 + hash2(i, 11) * 7 * (1 - k);
      CTX.fillStyle = PAL.ink;
      CTX.beginPath(); CTX.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, sz, 0, PI2); CTX.fill();
    }
    CTX.restore();
  }
  // 黑底上的点：主墨 + 一圈亮边（不然墨点在全黑里看不见）
  CTX.save();
  CTX.globalAlpha = .22; CTX.fillStyle = '#6E88AC';
  CTX.beginPath(); CTX.arc(cx, cy, r + 7, 0, PI2); CTX.fill();
  CTX.globalAlpha = 1;
  CTX.fillStyle = '#24384F'; CTX.beginPath(); CTX.arc(cx, cy, r, 0, PI2); CTX.fill();
  CTX.strokeStyle = '#3F5C86'; CTX.lineWidth = 2;
  CTX.beginPath(); CTX.arc(cx, cy, Math.max(2, r - 1), 0, PI2); CTX.stroke();
  CTX.restore();
  // 收尾：留一点余音（点还在，片尾页码几乎看不见）
  if (t > 240.3) { CTX.save(); CTX.globalAlpha = .5; CTX.fillStyle = '#080D18'; CTX.fillRect(-40, -40, W + 80, H + 80); CTX.restore(); }
  if (t > 240.45) txt('P.047', W - 74, H - 58, { size: 22, font: FONT.mono, weight: 700, color: '#2A3448', align: 'right' });
});
