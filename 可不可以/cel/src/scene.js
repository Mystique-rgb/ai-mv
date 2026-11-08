// scene.js — 分镜实现（预览版：8 个关键镜头）
const SCENE = mkCtx(W, H), EMI = mkCtx(W, H);

// ---------- 道具 ----------
function travelBag(g, x, y, s, col = '#B9B3A6', line = '#3A3630') {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = col; g.strokeStyle = line; g.lineWidth = 2.4;
  rr(g, -26, -18, 52, 34, 8); g.fill(); g.stroke();
  g.fillStyle = mix(col, '#000', .14); rr(g, -26, 2, 52, 14, 6); g.fill();
  g.strokeStyle = line; g.lineWidth = 3;
  g.beginPath(); g.moveTo(-16, -18); g.quadraticCurveTo(0, -34, 16, -18); g.stroke();
  g.fillStyle = '#8E887C'; g.fillRect(-28, -6, 4, 14);
  g.restore();
}

function sheets(g, t, list) {
  for (const sh of list) {
    const { x, y, w, h, sway = 8, ph = 0, alpha = .96, front = false } = sh;
    const dx = Math.sin(t * 1.6 + ph) * sway;
    g.save();
    g.globalAlpha = alpha;
    g.beginPath();
    g.moveTo(x, y + 6);
    g.quadraticCurveTo(x + w * .5, y - 14 + dx * .4, x + w, y + 6);   // 上缘下垂
    // 下缘波浪
    g.lineTo(x + w + dx * .3, y + h);
    for (let i = 6; i >= 0; i--) {
      const px = x + w * i / 6 + dx * .3;
      const py = y + h - Math.sin(i * .9 + t * 1.4 + ph) * 16 - (i % 2) * 6;
      g.lineTo(px, py);
    }
    g.lineTo(x - dx * .2, y + h);
    g.closePath();
    const gr = g.createLinearGradient(x, y, x + w, y + h);
    gr.addColorStop(0, front ? '#FDFAF2' : '#F6F0E2');
    gr.addColorStop(.34, front ? '#F2EBDC' : '#E9E2D1');
    gr.addColorStop(.62, front ? '#FFFDF6' : '#F8F3E6');
    gr.addColorStop(1, front ? '#EDE5D3' : '#DED6C4');
    g.fillStyle = gr; g.fill();
    // 折痕
    // 暗部（背光那一侧）
    g.save(); g.clip();
    const sg2 = g.createLinearGradient(x, y, x + w, y);
    sg2.addColorStop(0, 'rgba(150,140,120,.22)');
    sg2.addColorStop(.45, 'rgba(255,255,255,.10)');
    sg2.addColorStop(1, 'rgba(120,112,96,.30)');
    g.fillStyle = sg2; g.fillRect(x, y - 20, w + 20, h + 40);
    g.restore();
    g.strokeStyle = 'rgba(140,128,108,.42)'; g.lineWidth = 3.2;
    for (let i = 1; i < 5; i++) {
      const px = x + w * i / 5;
      g.beginPath();
      g.moveTo(px, y + 2);
      g.quadraticCurveTo(px + dx * .7 + Math.sin(i) * 8, y + h * .55, px + dx * .3, y + h - 8);
      g.stroke();
    }
    g.restore();
  }
}

// 逆光时补眼睛高光：local 眼位 ±6.4u / y -87.6u
function eyeGlow(g, x, y, k, col = '#FFF0D0', r = 2.0) {
  for (const sx of [-6.4, 6.4]) {
    g.fillStyle = rgba(col, .95);
    g.beginPath(); g.arc(x + sx * k, y - 87.6 * k, r * k / 10, 0, TAU); g.fill();
  }
}

// ---------- 镜头 ----------
// S01 · bar0 · 一个霓虹字在雨里亮起
function shot01(g, emi, t, P) {
  g.fillStyle = '#05070D'; g.fillRect(0, 0, W, H);
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, '#070A14'); gr.addColorStop(.62, '#0C1324'); gr.addColorStop(1, '#0A0F1A');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // 远处楼影
  g.fillStyle = '#0E1526'; 
  for (let i = 0; i < 9; i++) { const x = i * 230 - 40, h = 180 + hash(i * 3.1) * 260; g.fillRect(x, H * .72 - h, 200, h + 200); }
  // 招牌「可」
  const k = clamp(t / .55);
  const sx = 1180, sy = 250;
  g.save();
  g.globalAlpha = k;
  g.fillStyle = 'rgba(10,13,22,.92)'; rr(g, sx, sy, 190, 300, 10); g.fill();
  g.strokeStyle = rgba(P.neon[0], .95); g.lineWidth = 5; rr(g, sx + 8, sy + 8, 174, 284, 8); g.stroke();
  g.font = '500 190px "STKaiti","华文楷体",serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#FFFFFF'; g.fillText('可', sx + 95, sy + 150);
  emi.font = g.font; emi.textAlign = 'center'; emi.textBaseline = 'middle';
  emi.fillStyle = rgba(P.neon[0], .95); emi.fillText('可', sx + 95, sy + 150);
  g.restore();
  // 湿街
  g.fillStyle = '#080C16'; g.fillRect(0, H * .74, W, H * .26);
  const rg = g.createLinearGradient(0, H * .74, 0, H);
  rg.addColorStop(0, rgba(P.neon[0], .26)); rg.addColorStop(1, rgba(P.neon[0], 0));
  g.fillStyle = rg; g.fillRect(sx - 40, H * .74, 270, H * .26);
  rain(g, t, 260, { a: .38, len: 120, speed: 1900 });
}

// S02 · bar1 · 站前闸口，他逆着人流
function shot02(g, emi, t, P) {
  bgStation(g, emi, P, t);
  // 人流（灰墨剪影，全部向外走，比他快）
  const crowd = [
    { x: 200, s: 360, d: .0, y: 1020 }, { x: 470, s: 330, d: .38, y: 1000 }, { x: 1610, s: 350, d: .12, y: 1010 },
    { x: 1330, s: 300, d: .62, y: 985 }, { x: 1800, s: 380, d: .84, y: 1030 }, { x: 760, s: 285, d: .5, y: 975 }
  ];
  for (const c of crowd) {
    const px = c.x + ((t * 210 + c.d * 900) % 1400) - 200;
    silhouette(g, px, c.y, c.s, true, '#2E3A56', .62, hash(c.x) > .5 ? 'fen' : 'yan');
  }
  // 闸机
  for (let i = 0; i < 4; i++) {
    const gx = 520 + i * 250;
    g.fillStyle = '#2A3042'; g.fillRect(gx, 900, 26, 130);
    g.fillStyle = rgba('#7DE3EA', .5); g.fillRect(gx + 8, 902, 10, 6);
  }
  // 旅行袋（先画，压在他身后）
  travelBag(g, 1006, 792, 1.35, '#8E887C', '#1E1A16');
  // 阿岩（逆着走，正面，逆光）
  actor(g, {
    who: 'yan', x: 960, y: 1035, s: 560, view: 'front', mood: 'calm',
    pose: { armL: 6, armR: -4, legL: 6, legR: -7, bob: Math.sin(t * 6) * 3 },
    shadowTint: '#7C8CB4', rimCol: P.rim, rimA: .55, hiCol: P.hi, hiA: .06
  });
  // 雨棚下的雨帘
  rain(g, t, 120, { a: .22, len: 80, y0: H * .30, y1: H * .62 });
  bokeh(g, t, 5, [P.neon[0], P.neon[1]], .10);
}

// S06 · bar7 · 口袋里露出的红发圈
function shot06(g, emi, t, P) {
  g.fillStyle = '#080C16'; g.fillRect(0, 0, W, H);
  bokeh(g, t, 9, [P.neon[0], P.neon[1], P.win], .26);
  g.save(); g.filter = 'blur(10px)'; g.globalAlpha = .5;
  bokeh(g, t, 4, [P.neon[0], P.win], .3);
  g.restore();

  actor(g, {
    who: 'yan', x: 960, y: 1600, s: 1150, view: 'q', mood: 'sad',
    pose: { headRot: 8 },
    shadowTint: '#7C8CB4', rimCol: P.rim, rimA: .45, hiCol: P.hi, hiA: .05
  });

  const k = 11.5, bobY = Math.sin(t * 2) * 2;
  const px = 960 + 2 * k, py = 1600 - 49.5 * k + bobY;
  g.save();
  g.strokeStyle = RED; g.lineWidth = 15; g.lineCap = 'round';
  g.beginPath(); g.ellipse(px, py - 12, 54, 22, -.28, 0, TAU); g.stroke();
  g.strokeStyle = '#FF6A55'; g.lineWidth = 5;
  g.beginPath(); g.ellipse(px, py - 15, 54, 22, -.28, Math.PI * .12, Math.PI * .7); g.stroke();
  g.restore();

  g.save();
  g.fillStyle = 'rgba(30,44,30,.55)';
  g.beginPath();
  g.moveTo(px - 130, py + 2); g.quadraticCurveTo(px, py - 22, px + 130, py + 2);
  g.lineTo(px + 130, py + 26); g.quadraticCurveTo(px, py + 4, px - 130, py + 26);
  g.closePath(); g.fill();
  g.restore();

  rain(g, t, 110, { a: .18, len: 70, y1: 520 });
}

// S19 · bar28 · 关东煮
function shot19(g, emi, t, P) {
  bgFood(g, emi, P, t);
  // 老周：站在摊后，正脸（咧嘴）
  actor(g, {
    who: 'zhou', x: 640, y: 1014, s: 660, view: 'q', mood: 'laugh',
    pose: { armL: 62, armR: -18, legL: 3, legR: -3 },
    shadowTint: '#B98A62', rimCol: '#FFC46B', rimA: .45, hiCol: '#FFF2DC', hiA: .10
  });
  // 摊位台面
  g.fillStyle = '#4A3320'; g.fillRect(0, 840, W, 240);
  g.fillStyle = '#6B4B2C'; g.fillRect(0, 828, W, 22);
  // 关东煮锅
  const gx = 1240, gy = 604;
  g.save();
  g.fillStyle = '#B8863F'; rr(g, gx - 300, gy, 600, 200, 16); g.fill();
  g.fillStyle = '#8A5E2E'; rr(g, gx - 280, gy + 26, 560, 150, 10); g.fill();
  const gr = g.createLinearGradient(0, gy + 20, 0, gy + 176);
  gr.addColorStop(0, '#B47A3C'); gr.addColorStop(1, '#6B4220');
  g.fillStyle = gr; rr(g, gx - 274, gy + 30, 548, 138, 8); g.fill();
  g.strokeStyle = 'rgba(70,42,20,.65)'; g.lineWidth = 5;
  for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(gx - 274 + i * 137, gy + 30); g.lineTo(gx - 274 + i * 137, gy + 168); g.stroke(); }
  for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(gx - 274, gy + 30 + i * 46); g.lineTo(gx + 274, gy + 30 + i * 46); g.stroke(); }
  // 串
  for (let i = 0; i < 4; i++) {
    const x = gx - 200 + i * 132, y = gy + 64;
    g.strokeStyle = '#E8DCC0'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(x, y - 44); g.lineTo(x, y + 40); g.stroke();
    for (let j = 0; j < 3; j++) {
      g.fillStyle = i % 2 ? '#E6C98A' : '#F2E4C4';
      g.beginPath(); g.arc(x, y - 30 + j * 28, 19, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(120,80,40,.45)'; g.lineWidth = 2.5; g.stroke();
    }
  }
  // 气泡
  for (let i = 0; i < 8; i++) {
    const ph = (t * .9 + hash(i * 3.1)) % 1;
    g.fillStyle = rgba('#FFF0D0', .5 * (1 - ph));
    g.beginPath(); g.arc(gx - 230 + hash(i * 7.3) * 460, gy + 160 - ph * 120, 4 + ph * 7, 0, TAU); g.fill();
  }
  g.restore();
  // 夹子：从老周手里伸到锅边
  g.save();
  g.strokeStyle = '#CBD2D8'; g.lineWidth = 9; g.lineCap = 'round';
  g.beginPath(); g.moveTo(838, 668); g.lineTo(1002, 726); g.stroke();
  g.beginPath(); g.moveTo(846, 688); g.lineTo(1010, 748); g.stroke();
  g.fillStyle = '#F2E4C4'; g.beginPath(); g.arc(1018, 752, 30, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(120,80,40,.55)'; g.lineWidth = 3; g.stroke();
  g.restore();
  // 纸杯（她的手递进来）
  g.save();
  g.fillStyle = '#FBF7EE';
  g.beginPath(); g.moveTo(1660, 800); g.lineTo(1790, 796); g.lineTo(1770, 940); g.lineTo(1682, 944); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(140,120,96,.45)'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#E8A0B0';  // 她的袖子
  rr(g, 1772, 806, 118, 100, 20); g.fill();
  g.strokeStyle = '#7A4A5E'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#F3CFA3';  // 手
  rr(g, 1734, 826, 62, 54, 16); g.fill();
  g.strokeStyle = '#8A6248'; g.lineWidth = 2.5; g.stroke();
  g.restore();
  // 蒸汽（小、淡）
  steam(g, t, gx, gy + 20, 10, 420, 340, '#FFF3DC', .13);
  bokeh(g, t, 5, ['#FFC46B'], .12);
  rain(g, t, 40, { a: .08, len: 46, y1: 300 });
}

// S27 · bar40 · M1 车灯点名
function shot27(g, emi, t, P) {
  bgCrossing(g, emi, P, t);
  const M1 = 1.78; // bar41 片内
  const burst = clamp((t - (M1 - .55)) / .55);
  actor(g, {
    who: 'yan', x: 960, y: 940, s: 500, view: 'front', mood: burst > .5 ? 'wide' : 'calm',
    pose: { armL: 4, armR: -6, legL: 2, legR: -3 },
    shadowTint: '#7C8CB4', rimCol: P.rim, rimA: .75, hiCol: P.hi, hiA: .16, step: 6
  });
  // 车灯：左右各两束，在 M1 同时转向他
  const spread = lerp(.34, .13, burst);
  headlight(g, emi, -60, 780, -0.08 + (1 - burst) * .18, spread, 1100, '#FFF3D6');
  headlight(g, emi, W + 60, 700, Math.PI + .06 - (1 - burst) * .18, spread, 1150, '#FFF3D6');
  headlight(g, emi, -60, 960, .05, spread * .8, 1000, '#DCEFFF');
  headlight(g, emi, W + 60, 900, Math.PI - .04, spread * .8, 1000, '#DCEFFF');
  if (burst > .3) {
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .18 * burst;
    const rg = g.createRadialGradient(960, 700, 40, 960, 700, 620);
    rg.addColorStop(0, 'rgba(255,243,214,.9)'); rg.addColorStop(1, 'rgba(255,243,214,0)');
    g.fillStyle = rg; g.fillRect(0, 0, W, H); g.restore();
    speedLines(g, 960, 700, 90, '#FFF3D6', .12 * burst, 1200, 380);
  }
  // 街对面：她回头（正脸，被车灯照亮一半）
  actor(g, {
    who: 'fen', x: 1712, y: 992, s: 352, view: 'front', mood: 'calm',
    shadowTint: '#8B98BC', rimCol: '#FFE0B0', rimA: .55, hiCol: P.hi, hiA: .1, step: 6
  });
  rain(g, t, 200, { a: .26, len: 100, speed: 1900 });
}

// S42 · bar73 · 天台，被单之间
function shot42(g, emi, t, P) {
  bgRoof(g, emi, P, t);
  // 晒衣绳
  g.strokeStyle = 'rgba(90,80,64,.75)'; g.lineWidth = 3;
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(0, 300 + i * 130); g.quadraticCurveTo(W / 2, 340 + i * 130, W, 290 + i * 130); g.stroke(); }
  sheets(g, t, [
    { x: 60, y: 300, w: 380, h: 420, ph: .4, sway: 12 },
    { x: 720, y: 300, w: 420, h: 440, ph: 1.7, sway: 14 },
    { x: 1400, y: 300, w: 400, h: 430, ph: 3.1, sway: 11 }
  ]);
  // 两个人隔着被单跑
  actor(g, {
    who: 'fen', x: 1210, y: 906, s: 380, view: 'q', mood: 'laugh', flip: true,
    pose: { armL: 46, armR: -26, legL: 30, legR: -26, bob: Math.sin(t * 14) * 7, lean: -4 },
    shadowTint: '#AFC3DC', hiCol: '#FFFFFF', hiA: .18, step: 4
  });
  actor(g, {
    who: 'yan', x: 790, y: 944, s: 400, view: 'q', mood: 'laugh',
    pose: { armL: 40, armR: -34, legL: -30, legR: 28, bob: Math.sin(t * 14 + 1) * 7, lean: 3 },
    shadowTint: '#AFC3DC', hiCol: '#FFFFFF', hiA: .18, step: 4
  });
  // 前景被单一角（挡一下）
  sheets(g, t, [{ x: 1620, y: 260, w: 460, h: 520, ph: 5.2, sway: 16, alpha: .9, front: true }]);
  // 阳光
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .30;
  const sg = g.createRadialGradient(1720, 120, 20, 1720, 120, 620);
  sg.addColorStop(0, 'rgba(255,247,214,.95)'); sg.addColorStop(1, 'rgba(255,247,214,0)');
  g.fillStyle = sg; g.fillRect(0, 0, W, H); g.restore();
}

// S59 · bar108 · 正脸特写（眼里有整条街的灯）
function shot59(g, emi, t, P) {
  // 背景：虚化的街
  g.fillStyle = '#0A0E18'; g.fillRect(0, 0, W, H);
  const b2 = mkCtx(W, H);
  bgCrossing(b2.g, b2.g, { ...P, near: '#0D1424' }, t);
  g.save(); g.filter = 'blur(18px)'; g.globalAlpha = .85; g.drawImage(b2.c, 0, 0); g.restore();
  bokeh(g, t, 14, [P.neon[0], P.neon[1], P.win], .26);
  const s = 2059, k = s / 100;
  actor(g, {
    who: 'yan', x: 948, y: 2264, s, view: 'q', mood: 'calm',
    crop: { x: -46, y: -110, w: 93, h: 52.4 },
    shadowTint: '#8FA0C8', rimCol: P.rim, rimA: .9, hiCol: P.hi, hiA: .12, step: 22
  });
  // 竖缝里的街灯（每只眼 3 颗）
  const ey = 2264 - 87.6 * k;
  for (const dx of [-6.4, 6.4]) {
    const ex = 948 + dx * k;
    for (let i = 0; i < 3; i++) {
      g.fillStyle = rgba('#FFF3D6', .55 + i * .12);
      g.beginPath(); g.arc(ex, ey - 40 + i * 40, 7, 0, TAU); g.fill();
    }
  }
  // 眉骨上的一滴雨
  const dy = 2264 - 96 * k + clamp(t * 60, 0, 90);
  g.fillStyle = rgba('#DFF2FA', .8);
  g.beginPath(); g.ellipse(948 - 150, dy, 13, 19, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,255,255,.9)';
  g.beginPath(); g.arc(948 - 155, dy - 6, 4.5, 0, TAU); g.fill();
  rain(g, t, 70, { a: .12, len: 60 });
}

// S66 · bar122 · 她转身，一线金
function shot66(g, emi, t, P) {
  bgBridge(g, emi, P, t);
  const turn = clamp(t / 1.32);
  const dark = ['#232A3A', '#1B2130', '#141A26'];
  // 阿岩（左，抬手）
  actor(g, {
    who: 'yan', x: 700, y: 838, s: 330, view: 'q', mood: 'calm',
    pose: { armL: 8, armR: 118, legL: 3, legR: -4 },
    cloth: '#242C3C', clothDk: '#1A2130', line: '#12161F', pants: '#1E2431',
    skin: dark, shadowTint: '#5E6478', shadowA: .6,
    rimCol: '#F2C46A', rimA: .95, step: 5
  });
  // 小粉（右，转身 背→侧→正）
  const v = turn < .3 ? 'back' : turn < .62 ? 'q' : 'front';
  actor(g, {
    who: 'fen', x: 1180, y: 838, s: 326, view: v, mood: 'calm',
    pose: { armL: 6, armR: -5, legL: 2, legR: -3 },
    cloth: '#3A2C36', clothDk: '#2A1E28', line: '#1A1018', pants: '#2A2430',
    skin: dark, shadowTint: '#5E6478', shadowA: .6,
    rimCol: '#F2C46A', rimA: 1, step: 5
  });
  // 逆光也要看得见眼睛
  eyeGlow(g, 700, 838, 3.30, '#FFF0D0', 2.4);
  if (v === 'front' || v === 'q') eyeGlow(g, 1180, 838, 3.26, '#FFF0D0', 2.4);
  // 落地的伞
  g.save(); g.translate(1310, 838); g.rotate(.16);
  g.strokeStyle = '#C9CFD6'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(-10, -120); g.stroke();
  g.fillStyle = rgba('#BFD6EA', .35); g.strokeStyle = '#8FA8C0'; g.lineWidth = 3;
  g.beginPath(); g.ellipse(-14, -128, 86, 26, -.1, Math.PI, TAU); g.fill(); g.stroke();
  g.restore();
  // 一线金 + 逆光
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .5;
  const sg = g.createLinearGradient(0, H * .52, 0, H * .80);
  sg.addColorStop(0, 'rgba(242,196,106,0)'); sg.addColorStop(.5, 'rgba(242,196,106,.55)'); sg.addColorStop(1, 'rgba(242,196,106,0)');
  g.fillStyle = sg; g.fillRect(0, H * .52, W, H * .28); g.restore();
  // 桥面积水的金线
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    g.fillStyle = rgba('#F2C46A', .10 + hash(i) * .07);
    g.fillRect(180 + i * 250, 840 + hash(i * 3.3) * 40, 130, 3);
  }
  g.restore();
}

// ---------- 镜头表 ----------
const SHOTS = [
  { a: 0.00, b: 1.74, fn: shot01, model: 'N-RAIN', sub: '' },
  { a: 1.74, b: 3.52, fn: shot02, model: 'N-RAIN', sub: '' },
  { a: 12.42, b: 14.20, fn: shot06, model: 'N-RAIN', sub: '' },
  { a: 49.31, b: 51.09, fn: shot19, model: 'N-SODIUM', sub: '很多好东西' },
  { a: 70.64, b: 74.20, fn: shot27, model: 'N-RAIN', sub: '可不可以 和你在一起' },
  { a: 129.32, b: 131.10, fn: shot42, model: 'D-HAZE', sub: '三年的回忆 我如何抹去' },
  { a: 191.55, b: 195.54, fn: shot59, model: 'N-RAIN', sub: '爱上了你 没什么道理' },
  { a: 216.88, b: 221.32, fn: shot66, model: 'PRE-DAWN', sub: '趁你还愿意' }
];

function drawFrame(main, t) {
  const sh = SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
  const P = PAL[sh.model];
  const g = SCENE.g, emi = EMI.g;
  g.setTransform(1, 0, 0, 1, 0, 0); emi.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, W, H); emi.clearRect(0, 0, W, H);
  sh.fn(g, emi, t - sh.a, P);
  // 合成
  main.setTransform(1, 0, 0, 1, 0, 0);
  main.clearRect(0, 0, W, H);
  main.drawImage(SCENE.c, 0, 0);
  bloom(main, EMI.c, 1.35, 34);
  if (sh.sub) subtitle(main, sh.sub, { col: P.sub });
  crt(main, SCENE.c, t, { scan: .42, vig: .5 });
  return { shot: sh.fn.name, sub: sh.sub, model: sh.model };
}
window.MV = { drawFrame, SHOTS, W, H };
