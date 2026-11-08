// kit.js — 场景原子：桌面 / 窗口 / 夜街 / 回忆 / 深墨 / 纸阵
// 每个 builder 都接受 (t, o)，只画"场景"，不加 HUD/字幕/相机。

// ---------- 镜头外壳 ----------
// spec: {model, page, chip, cap, kw, dark, hud, cam(t)->{z,x,y,rot}, body(t)}
function frame(t, spec, body) {
  page(spec.model, t, spec.seed || 0);
  const c = spec.cam ? spec.cam(t) : { z: 1, x: 0, y: 0, rot: 0 };
  CTX.save();
  CTX.translate(W / 2 + (c.x || 0), H / 2 + (c.y || 0));
  if (c.rot) CTX.rotate(c.rot);
  CTX.scale(c.z || 1, c.z || 1);
  CTX.translate(-W / 2, -H / 2);
  body(t, spec);
  CTX.restore();
  const dark = spec.dark ?? (spec.model === 'N-STREET' || spec.model === 'X-VOID');
  if (spec.hud !== false) hud({ page: spec.page, chip: spec.chip, dark, secStr: clockStr(t), alpha: spec.hudAlpha });
  if (spec.cap) caption(lineByN(spec.cap), t, { keyword: spec.kw, y: spec.capY });
}

// ---------- 台面 ----------
function deskSurface(t, o = {}) {
  const ctx = CTX;
  shape(rectPts(-40, -40, W + 80, H + 80), { fill: o.fill || '#E9DDC2', ink: null, seed: 401, boil: false });
  ctx.save(); ctx.globalAlpha = o.dotAlpha ?? .16;
  dots({ x: 0, y: 0, w: W, h: H }, (u, v) => .015 + .025 * Math.abs(Math.sin(v * 34 + u * 3)), { step: 24, color: o.dotCol || '#9C7A4A', angle: 8 });
  ctx.restore();
  // 桌上的一道边（近景压暗）
  if (o.edge !== false) {
    shape(rectPts(-40, H - 130, W + 80, 170), { fill: o.edgeFill || '#DCCDAF', ink: null, seed: 402, boil: false });
    inkLine([[-40, H - 130], [W + 40, H - 130]], { sw: 5, seed: 403, alpha: .5 });
  }
}

// 一张表（俯拍）。o: rot/scale/fields/mark/hole/palm/stampText
function formOnDesk(t, o = {}) {
  const ctx = CTX;
  const s = o.scale || 1, cx = o.x ?? W * .5, cy = o.y ?? H * .52;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate((o.rot || 0) * Math.PI / 180); ctx.scale(s, s);
  const w = 760, h = 1075;
  // 纸影
  ctx.save(); ctx.globalAlpha = .16; ctx.fillStyle = PAL.ink;
  ctx.beginPath(); ctx.ellipse(10, 14, w * .52, h * .5, 0, 0, PI2); ctx.fill(); ctx.restore();
  formSheet(0, 0, w, o.st || 0, {
    applicant: o.applicant || '', time: o.time || '', place: o.place || '',
    desc: o.desc || '', expiry: o.expiry || '2022.07.03', page: o.pageNo,
  });
  // 红笔：划掉 / 圈 / 斜线
  if (o.mark) {
    for (const m of o.mark) {
      if (m[0] === 'line') inkLine([[m[1], m[2]], [m[3], m[4]]], { sw: 8, color: PAL.red, seed: 410 + m[1], amp: 1.4 });
      if (m[0] === 'circle') {
        ctx.save(); ctx.strokeStyle = PAL.red; ctx.lineWidth = 8; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.ellipse(m[1], m[2], m[3], m[4], m[5] || 0, m[6] || 0, (m[6] || 0) + (m[7] || PI2)); ctx.stroke(); ctx.restore();
      }
      if (m[0] === 'text') txt(m[1], m[2], m[3], { size: m[4] || 40, font: FONT.kai, weight: 700, color: PAL.red, align: m[5] || 'left' });
    }
  }
  // 掌心按出的网点手印
  if (o.palm) {
    ctx.save(); ctx.globalAlpha = o.palm;
    dots({ x: -140, y: -60, w: 280, h: 300 }, D.radial(.5, .5, .55, .55, 0), { step: 14, color: PAL.ink, angle: 30 });
    ctx.restore();
  }
  // 被章压穿的洞
  if (o.hole) {
    ctx.save(); ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.ellipse(140, 60, 120, 62, .1, 0, PI2); ctx.fill(); ctx.restore();
    shape(rrectPts(20, -2, 240, 124, 6), { fill: 'none', ink: PAL.red, sw: 5, seed: 415, alpha: .5 });
  }
  ctx.restore();
  return { x: cx, y: cy, w: w * s, h: h * s };
}

// 手（俯拍）：从画面某侧伸进来
function hand(x, y, ang, u = 1, o = {}) {
  const ctx = CTX;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(u, u);
  shape(rrectPts(-46, 0, 92, 120, 34), { fill: o.cuff || '#6E8C55', ink: PAL.ink, sw: 6, seed: 420 });
  shape(ellPts(0, -18, 52, 62, 18), { fill: SKIN, ink: PAL.ink, sw: 6, seed: 421 });
  for (let i = 0; i < 4; i++) {
    shape(rrectPts(-38 + i * 22, -74, 18, 46, 9), { fill: SKIN, ink: PAL.ink, sw: 4.5, seed: 422 + i });
  }
  shape(rrectPts(-56, -30, 20, 44, 10), { fill: SKIN, ink: PAL.ink, sw: 4.5, seed: 427 });
  if (o.band) shape(rectPts(-20, -6, 40, 26), { fill: '#E8DCC4', ink: PAL.ink, sw: 3, seed: 428 });
  ctx.restore();
}

// ---------- 窗口 ----------
// o: {u, clerkFace, glassFog, slot, x, w}
function winFront(t, o = {}) {
  const wx = o.x ?? 700, wy = o.y ?? 170, ww = o.w ?? 980, wh = o.h ?? 520;
  shape(rectPts(-30, 118, W + 60, 810), { fill: '#E7DAC0', ink: null, seed: 381, boil: false });
  shape(rectPts(wx, wy, ww, wh), { fill: '#22344F', ink: PAL.ink, sw: 8, seed: 382, gap: false });
  CTX.save();
  path(CTX, rectPts(wx + 10, wy + 10, ww - 20, wh - 20)); CTX.clip();
  CTX.save(); CTX.globalAlpha = .16;
  dots({ x: wx, y: wy, w: ww, h: wh }, D.radial(.5, .15, 1.0, .14, .03), { step: 28, color: PAL.paper, angle: 45 });
  CTX.globalAlpha = .14;
  dots({ x: wx + 40, y: wy + wh - 340, w: 300, h: 300 }, D.radial(.5, .5, .62, .5, 0), { step: 20, color: PAL.paper, angle: 30 });
  CTX.restore();
  if (o.clerk !== false) {
    person('zhou', wx + ww * .52, wy + wh + 92, o.u || 52, {
      view: 'q', face: o.clerkFace || 'neutral', t, seed: 9, flip: true, aL: o.aL ?? .7, aR: o.aR ?? .4,
      dx: o.dx || 0, rot: o.rot || 0,
    });
    if (o.redPen) {
      CTX.save(); CTX.translate(wx + ww * .44, wy + wh * .58); CTX.rotate(-.7);
      pen(0, 0, 0, { len: 150, color: PAL.red, w: 9 });
      CTX.restore();
    }
  }
  CTX.restore();
  shape(rectPts(wx - 20, wy + wh - 22, ww + 40, 26), { fill: '#D8C9A9', ink: PAL.ink, sw: 5, seed: 383, gap: false });
  shape(rectPts(wx + 20, wy + wh - 12, ww - 40, 26), { fill: '#E4D8BE', ink: PAL.ink, sw: 4, seed: 384, gap: false });
  shape(rectPts(wx + 60, wy + wh + 6, ww - 120, 12), { fill: '#0B1220', ink: PAL.ink, sw: 3, seed: 385, gap: false });
  shape(rectPts(wx - 20, wy + wh + 24, ww + 40, 150), { fill: '#DCCDAF', ink: PAL.ink, sw: 5, seed: 386, gap: false });
  txt('3', wx + ww - 40, wy + 60, { size: 40, font: FONT.mono, weight: 700, color: PAL.paper, align: 'right', alpha: .8 });
  return { wx, wy, ww, wh };
}

// 从窗口里推回来的一沓纸
function paperStack(x, y, n, o = {}) {
  for (let i = 0; i < n; i++) {
    const dx = (i - n / 2) * 26, dy = -i * 8;
    shape(rectPts(x + dx - 180, y + dy - 120, 360, 240), { fill: '#FBF5E6', ink: PAL.ink, sw: 4, seed: 430 + i, gap: false });
    inkLine([[x + dx - 150, y + dy - 60], [x + dx + 140, y + dy - 60]], { sw: 3, seed: 440 + i, alpha: .4 });
  }
}

// ---------- 夜街 ----------
// kind: street | bridge | station | food
function cityNight(t, o = {}) {
  const ctx = CTX, kind = o.kind || 'street';
  const horizon = o.horizon ?? 700;
  // 楼群剪影
  const r = srand(o.seed || 21);
  let x = -60;
  while (x < W + 60) {
    const bw = 90 + r() * 150, bh = 180 + r() * 340;
    shape(rectPts(x, horizon - bh, bw, bh + 40), { fill: PAL.deep, ink: null, seed: (x | 0) + 1, boil: false, amp: 0 });
    // 窗
    ctx.save(); ctx.globalAlpha = .5;
    for (let wy2 = horizon - bh + 24; wy2 < horizon - 20; wy2 += 34) {
      for (let wx2 = x + 14; wx2 < x + bw - 20; wx2 += 30) {
        if (r() < .45) { ctx.fillStyle = r() < .3 ? PAL.yellow : PAL.paper; ctx.globalAlpha = .18 + r() * .3; ctx.fillRect(wx2, wy2, 12, 16); }
      }
    }
    ctx.restore();
    x += bw + 8 + r() * 26;
  }
  // 地面
  shape(rectPts(-40, horizon, W + 80, H - horizon + 40), { fill: '#0B1220', ink: null, seed: 501, boil: false });
  // 湿地面：竖条网点倒影
  ctx.save(); ctx.globalAlpha = .28;
  dots({ x: 0, y: horizon, w: W, h: H - horizon }, (u, v) => .03 + .06 * Math.abs(Math.sin(u * 40)), { step: 22, color: PAL.teal, angle: 75 });
  ctx.restore();
  // 车灯 / 人流（网点条，按拍移动）
  const bp = (beatIndex(t) % 4) / 4;
  if (kind === 'street' || kind === 'station') {
    for (let i = 0; i < 3; i++) {
      const cx2 = ((t * (46 + i * 18) + i * 400) % (W + 400)) - 200;
      const cy2 = horizon + 40 + i * 46;
      ctx.save(); ctx.globalAlpha = .5;
      ctx.fillStyle = i % 2 ? PAL.yellow : PAL.red;
      ctx.fillRect(cx2, cy2, 66, 12);
      ctx.globalAlpha = .18; ctx.fillRect(cx2 - 90, cy2 + 4, 90, 5);
      ctx.restore();
    }
  }
  if (kind === 'bridge') {
    // 桥栏
    shape(rectPts(-40, horizon - 10, W + 80, 26), { fill: '#1B2A44', ink: PAL.ink, sw: 5, seed: 502, gap: false });
    for (let bx = 60; bx < W; bx += 180) inkLine([[bx, horizon - 10], [bx, horizon - 150]], { sw: 8, seed: 503 + bx, alpha: .7 });
    // 桥下车灯
    for (let i = 0; i < 5; i++) {
      const cx2 = ((t * 120 + i * 320) % (W + 300)) - 150;
      ctx.save(); ctx.globalAlpha = .45; ctx.fillStyle = i % 2 ? PAL.yellow : PAL.paper;
      ctx.fillRect(cx2, horizon + 120, 90, 10); ctx.restore();
    }
  }
  if (kind === 'food') {
    // 三个招牌
    const signs = [{ x: 260, t2: '烤红薯', c: PAL.red }, { x: 780, t2: '糖水', c: PAL.yellow }, { x: 1300, t2: '章鱼小丸子', c: PAL.teal }];
    signs.forEach((s, i) => {
      const lit = .5 + .5 * Math.sin(t * 6 + i * 2);
      shape(rectPts(s.x - 130, horizon - 300, 260, 96), { fill: PAL.deep, ink: PAL.paper, sw: 4, seed: 510 + i, gap: false });
      txt(s.t2, s.x, horizon - 236, { size: 44, font: FONT.kai, weight: 700, color: s.c, align: 'center', alpha: .55 + lit * .45 });
      ctx.save(); ctx.globalAlpha = .18 * lit;
      dots({ x: s.x - 170, y: horizon - 340, w: 340, h: 180 }, D.radial(.5, .5, .55, .5, 0), { step: 18, color: s.c, angle: 30 });
      ctx.restore();
    });
  }
  // 雨
  const rr2 = srand(707);
  for (let i = 0; i < 80; i++) {
    const rx = rr2() * W, ry = rr2() * H * .85, len = 80 + rr2() * 220;
    CTX.save(); CTX.globalAlpha = .05 + rr2() * .10;
    inkLine([[rx, ry], [rx - 7, ry + len]], { sw: 1.6 + rr2() * 2, color: PAL.teal, seed: 800 + i, amp: .6 });
    CTX.restore();
  }
  return horizon;
}

// ---------- 回忆 2019（P-2019） ----------
function summer(t, o = {}) {
  const ctx = CTX;
  // 高调：一片过曝的纸白
  shape(rectPts(-40, -40, W + 80, H + 80), { fill: '#FBF3DF', ink: null, seed: 601, boil: false });
  // 大太阳（网点晕）
  const sx = o.sunX ?? W * .74, sy = o.sunY ?? 180;
  ctx.save(); ctx.globalAlpha = .5;
  dots({ x: sx - 320, y: sy - 240, w: 640, h: 520 }, D.radial(.5, .5, .55, .55, .05, 1.4), { step: 20, color: '#EFC24A', angle: 30 });
  ctx.restore();
  // 地平线 / 店招
  const hz = o.horizon ?? 620;
  shape(rectPts(-40, hz, W + 80, H - hz + 40), { fill: '#EADFC2', ink: null, seed: 602, boil: false });
  inkLine([[-40, hz], [W + 40, hz]], { sw: 4, seed: 603, alpha: .35 });
  // 店（便利店的白天版）
  if (o.shop !== false) {
    const bx = o.bx ?? 560, bw = o.bw ?? 820, bh = 380;
    shape(rectPts(bx, hz - bh, bw, bh), { fill: '#F6E7C4', ink: PAL.ink, sw: 6, seed: 604, gap: false });
    shape(rectPts(bx, hz - bh - 66, bw, 66), { fill: PAL.ink, ink: null, seed: 605, boil: false });
    txt('便 利 店', bx + 40, hz - bh - 20, { size: 38, font: FONT.kai, weight: 700, color: PAL.paper, spacing: 6 });
    for (let i = 0; i < 3; i++) {
      inkLine([[bx + 30, hz - bh + 90 + i * 92], [bx + bw - 30, hz - bh + 90 + i * 92]], { sw: 5, seed: 606 + i, alpha: .5 });
      ctx.save(); ctx.globalAlpha = .3;
      dots({ x: bx + 40, y: hz - bh + 40 + i * 92, w: bw - 80, h: 46 }, D.flat(.35), { step: 16, color: '#B08A4A', angle: 15 });
      ctx.restore();
    }
    shape(rectPts(bx + bw * .48, hz - bh + 40, 20, bh - 40), { fill: '#22344F', ink: null, seed: 607, boil: false });
  }
  // 树影 / 光斑
  ctx.save(); ctx.globalAlpha = .18;
  dots({ x: 0, y: hz, w: W, h: H - hz }, (u, v) => .03 + .04 * Math.abs(Math.sin(u * 22 + v * 8)), { step: 22, color: '#8FA655', angle: 45 });
  ctx.restore();
}

// ---------- 深墨（X-VOID）：桌面 + 旧印 ----------
function voidDesk(t, o = {}) {
  const ctx = CTX, ey = H * .58;
  // 墙（更黑）与桌面（一档亮），交界是一道台沿
  shape(rectPts(-40, -40, W + 80, ey + 40), { fill: '#080E1A', ink: null, seed: 701, boil: false });
  shape(rectPts(-40, ey, W + 80, H - ey + 40), { fill: '#16233A', ink: null, seed: 702, boil: false });
  // 桌面木纹：横纹（网点 + 低频起伏），让它读成一张桌子而不是一片空底
  ctx.save(); ctx.globalAlpha = .70;
  dots({ x: -40, y: ey, w: W + 80, h: H - ey + 40 }, (u, v) => .05 + .10 * Math.abs(Math.sin(v * 26 + Math.sin(u * 3.2) * .8)), { step: 22, color: '#0A1220', angle: 5 });
  ctx.restore();
  const rr = srand(733);
  for (let i = 0; i < 9; i++) {
    const y0 = ey + 26 + i * 46;
    const pts = [];
    for (let k = 0; k <= 6; k++) pts.push([-40 + k * (W + 80) / 6, y0 + Math.sin(k * 1.3 + i) * 9 + (rr() - .5) * 5]);
    inkLine(pts, { sw: 2 + rr() * 2.4, color: '#22344F', seed: 710 + i, amp: .8, alpha: .30 + rr() * .18 });
  }
  // 台沿：一条亮边 + 一条暗影
  inkLine([[-40, ey], [W + 40, ey]], { sw: 5, color: '#3A4E6E', seed: 703, alpha: .9 });
  ctx.save(); ctx.globalAlpha = .5; ctx.fillStyle = '#05090F';
  ctx.fillRect(-40, ey + 3, W + 80, 26); ctx.restore();
  // 桌上的灰
  ctx.save(); ctx.globalAlpha = .5;
  dots({ x: 0, y: ey, w: W, h: H - ey }, D.radial(.5, .3, .85, .22, 0), { step: 20, color: PAL.teal, angle: 45 });
  ctx.restore();
  // 正在滑出画面的纸角（他刚把纸抽走）
  if (o.slide != null) {
    const k = clamp(o.slide);
    ctx.save();
    ctx.translate(W + 260 - k * 420, ey + 90 - k * 30); ctx.rotate(-.10 - k * .06);
    shape(rectPts(-420, -120, 840, 460), { fill: '#F2E8D5', ink: PAL.ink, sw: 7, seed: 741, gap: false });
    inkLine([[-380, -60], [380, -50]], { sw: 4, seed: 742, alpha: .35 });
    inkLine([[-380, -8], [300, 4]], { sw: 4, seed: 743, alpha: .3 });
    txt('遗失物认领单', 0, 78, { size: 30, font: FONT.serif, weight: 900, color: PAL.ink, align: 'center', alpha: .8 });
    ctx.restore();
  }
  // 三年前的旧印（灰）
  if (o.oldStamp !== false) {
    stamp({ x: o.sx ?? W * .5, y: o.sy ?? H * .66, scale: 1.0, rot: -6, text: o.oldText || '受理', sub: 'RECEIVED', ink: '#5A6478', alpha: .45, seed: 9 });
  }
}

// ---------- 空中纸阵（S37 起） ----------
function paperStorm(t, o = {}) {
  const n = o.n || 34, r = srand(801);
  const items = [];
  for (let i = 0; i < n; i++) {
    const depth = r();
    items.push({
      x: r() * W * 1.1 - W * .05, y: H * .18 + r() * H * .70,
      s: .30 + depth * .55, rot: (r() - .5) * 1.1,
      ph: r() * PI2, depth,
      kind: Math.floor(r() * 4),
    });
  }
  items.sort((a, b) => a.depth - b.depth);
  const k = o.scatter ?? 1;
  for (const it of items) {
    const bob = Math.sin(t * 1.6 + it.ph) * 8;
    CTX.save();
    CTX.translate(it.x + (it.depth - .5) * 40 * (1 - k), it.y + bob);
    CTX.rotate(it.rot);
    CTX.scale(it.s, it.s);
    shape(rectPts(-150, -200, 300, 400), { fill: '#FBF5E6', ink: PAL.ink, sw: 6, seed: 810 + (it.x | 0), gap: false });
    // 每张纸上是三年的一个现场（用网点块示意）
    if (it.kind === 0) { CTX.save(); CTX.globalAlpha = .45; dots({ x: -120, y: -170, w: 240, h: 220 }, D.band(.28, .05, 0, 1), { step: 16, color: '#7A6A48', angle: 15 }); CTX.restore(); }
    else if (it.kind === 1) { inkLine([[-120, -40], [120, -40]], { sw: 5, seed: 820 + (it.x | 0), alpha: .5 }); inkLine([[-120, 20], [60, 20]], { sw: 4, seed: 821 + (it.x | 0), alpha: .4 }); }
    else if (it.kind === 2) shape(rectPts(-140, -30, 90, 60), { fill: PAL.red, ink: null, seed: 822, alpha: .18 });
    else { CTX.save(); CTX.globalAlpha = .3; dots({ x: -120, y: -170, w: 240, h: 380 }, D.flat(.18), { step: 18, color: PAL.ink, angle: 45 }); CTX.restore(); }
    CTX.restore();
  }
}

// ---------- 大特写：一个格子/一个印/一张票 ----------
function macroBox(x, y, w, h, label, value, o = {}) {
  const ctx = CTX;
  shape(rrectPts(x - w / 2, y - h / 2, w, h, 6), { fill: o.fill || '#FBF5E6', ink: PAL.ink, sw: 7, seed: 830, gap: false });
  if (label) txt(label, x - w / 2 + 26, y - h / 2 + 44, { size: 34, font: FONT.kai, weight: 700, color: PAL.ink, alpha: .9 });
  if (value) txt(value, x, y + h * .22, { size: o.size || 84, font: o.font || FONT.mono, weight: 700, color: o.color || PAL.ink, align: 'center', spacing: 4 });
}
