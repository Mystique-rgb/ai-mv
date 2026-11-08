// city.js — 手绘背景板：站前 / 街心 / 食街 / 天台 / 天桥（每处一套色模型）
function skyGrad(g, P, h = H * .62) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, P.sky[0]); gr.addColorStop(.55, P.sky[1]); gr.addColorStop(1, P.sky[2]);
  g.fillStyle = gr; g.fillRect(0, 0, W, h);
}
function buildingRow(g, emi, P, t, o) {
  const { y, hMin, hMax, colA, colB, seed = 1, winA = .22, detail = 1 } = o;
  const r = rng(seed);
  let x = -80;
  while (x < W + 80) {
    const bw = 120 + r() * 210, bh = hMin + r() * (hMax - hMin);
    const base = r() > .5 ? colA : colB;
    g.fillStyle = base;
    g.fillRect(x, y - bh, bw, bh);
    // 受光面 / 背光面
    g.fillStyle = rgba(mix(base, '#FFFFFF', .10), .55);
    g.fillRect(x, y - bh, bw * .62, bh);
    g.fillStyle = rgba('#000000', .22);
    g.fillRect(x + bw * .78, y - bh, bw * .22, bh);
    // 楼顶小件
    if (detail) {
      g.fillStyle = rgba(mix(base, '#000', .3), .9);
      if (r() > .5) g.fillRect(x + bw * .2, y - bh - 18 - r() * 24, 26, 26);
      g.fillRect(x + bw * .68, y - bh - 40, 4, 40);
      if (r() > .4) g.fillRect(x + bw * .1, y - bh - 10, bw * .5, 8);
    }
    // 窗：小格 + 细框
    const gx = 4 + Math.floor(r() * 4), gy = 5 + Math.floor(r() * 5);
    const dw = (bw - 26) / gx, dh = (bh - 30) / gy;
    for (let i = 0; i < gx; i++) for (let j = 0; j < gy; j++) {
      const wx = x + 14 + i * dw, wy = y - bh + 16 + j * dh;
      const rv = hash(seed * 91 + x * .13 + i * 3.1 + j * 7.7);
      g.fillStyle = rgba(mix(base, '#000', .45), .8);
      g.fillRect(wx, wy, dw * .58, dh * .52);
      if (rv < winA) {
        const br = .5 + rv * 1.4;
        g.fillStyle = rgba(P.win, .28 + br * .34);
        g.fillRect(wx + 1, wy + 1, dw * .58 - 2, dh * .52 - 2);
        emi.fillStyle = rgba(P.win, .2 + br * .26);
        emi.fillRect(wx + 1, wy + 1, dw * .58 - 2, dh * .52 - 2);
      }
    }
    x += bw + 12 + r() * 24;
  }
  const hz = g.createLinearGradient(0, y - hMin * .7, 0, y + 4);
  hz.addColorStop(0, rgba(P.sky[2], 0));
  hz.addColorStop(1, rgba(P.sky[2], .5));
  g.fillStyle = hz; g.fillRect(0, y - hMin * .7, W, hMin * .7 + 4);
}

// 街灯（发光锥）
function streetLamp(g, emi, x, yTop, h, col = '#FFD9A0') {
  g.strokeStyle = '#242A38'; g.lineWidth = 7;
  g.beginPath(); g.moveTo(x, yTop + h); g.lineTo(x, yTop); g.lineTo(x + 46, yTop - 6); g.stroke();
  g.fillStyle = rgba(col, .95);
  g.beginPath(); g.ellipse(x + 50, yTop - 4, 20, 9, 0, 0, TAU); g.fill();
  emi.fillStyle = rgba(col, .95);
  emi.beginPath(); emi.ellipse(x + 50, yTop - 4, 34, 18, 0, 0, TAU); emi.fill();
  const gr = g.createLinearGradient(0, yTop, 0, yTop + h * .95);
  gr.addColorStop(0, rgba(col, .30)); gr.addColorStop(.55, rgba(col, .07)); gr.addColorStop(1, rgba(col, 0));
  g.save(); g.globalCompositeOperation = 'lighter';
  g.beginPath(); g.moveTo(x + 50, yTop); g.lineTo(x + 190, yTop + h * .95); g.lineTo(x - 90, yTop + h * .95); g.closePath();
  g.fillStyle = gr; g.fill(); g.restore();
}

function neonPanel(g, emi, x, y, w, h, text, col, t, o = {}) {
  const { size = 62, vertical = true, flick = 0 } = o;
  const f = 1 - flick * (.5 + .5 * Math.sin(t * 23 + x));
  g.save();
  g.fillStyle = rgba('#0A0D16', .92); rr(g, x, y, w, h, 6); g.fill();
  g.strokeStyle = rgba(col, .9); g.lineWidth = 3; rr(g, x + 3, y + 3, w - 6, h - 6, 5); g.stroke();
  g.font = `500 ${size}px "Microsoft YaHei", sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const cx = vertical ? x + w / 2 : x + w / (chars.length + 1) * (i + 1);
    const cy = vertical ? y + h / (chars.length + 1) * (i + 1) : y + h / 2;
    g.fillStyle = rgba('#FFFFFF', .92 * f); g.fillText(chars[i], cx, cy);
    emi.save();
    emi.font = g.font; emi.textAlign = 'center'; emi.textBaseline = 'middle';
    emi.fillStyle = rgba(col, .95 * f); emi.fillText(chars[i], cx, cy);
    emi.restore();
  }
  g.restore();
}

function streetFloor(g, emi, P, yTop, col = null) {
  const gr = g.createLinearGradient(0, yTop, 0, H);
  gr.addColorStop(0, col || P.near); gr.addColorStop(1, P.ground);
  g.fillStyle = gr; g.fillRect(0, yTop, W, H - yTop);
}

// 湿地面反光：竖条 + 模糊
function wetStreaks(g, t, P, yTop, items) {
  g.save();
  for (const it of items) {
    const { x, col, h = 260, w = 26, a = .32 } = it;
    const gr = g.createLinearGradient(0, yTop, 0, yTop + h);
    gr.addColorStop(0, rgba(col, a)); gr.addColorStop(1, rgba(col, 0));
    g.fillStyle = gr;
    g.fillRect(x - w / 2 + Math.sin(t * .8 + x * .01) * 4, yTop, w, h);
  }
  g.restore();
}

// ① 站前街 · 夜雨
function bgStation(g, emi, P, t) {
  skyGrad(g, P, H * .70);
  buildingRow(g, emi, P, t, { y: H * .58, hMin: 180, hMax: 420, colA: P.far, colB: mix(P.far, '#000', .22), seed: 7, winA: .26 });
  // 车站正面（逆光玻璃门）
  const fy = H * .30;
  g.fillStyle = mix(P.mid, '#000', .45); g.fillRect(0, fy, W, H * .58 - fy);
  g.fillStyle = mix(P.mid, '#000', .28); g.fillRect(0, fy - 26, W, 26);
  for (let i = 0; i < 4; i++) {
    const dx = 250 + i * 360;
    const gr = g.createLinearGradient(0, fy + 40, 0, H * .60);
    gr.addColorStop(0, rgba(P.win, .62)); gr.addColorStop(.65, rgba(P.win, .40)); gr.addColorStop(1, rgba(P.win, .26));
    g.fillStyle = gr; g.fillRect(dx + 4, fy + 70, 292, H * .60 - fy - 74);
    emi.fillStyle = rgba(P.win, .22); emi.fillRect(dx + 4, fy + 70, 292, H * .60 - fy - 74);
    // 玻璃里暗着的候车厅
    g.fillStyle = rgba('#241E18', .35); g.fillRect(dx + 4, fy + 70, 292, 90);
    g.strokeStyle = rgba('#1A1410', .92); g.lineWidth = 7;
    for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(dx + 4 + k * 97, fy + 70); g.lineTo(dx + 4 + k * 97, H * .60); g.stroke(); }
    g.strokeStyle = rgba('#FFE7BC', .35); g.lineWidth = 2;
    for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(dx + 8 + k * 97, fy + 74); g.lineTo(dx + 8 + k * 97, H * .60 - 4); g.stroke(); }
    g.beginPath(); g.moveTo(dx, fy + 170); g.lineTo(dx + 300, fy + 170); g.stroke();
  }
  // 雨棚
  g.fillStyle = mix(P.ink, '#000', .2); g.beginPath();
  g.moveTo(0, H * .30); g.lineTo(W, H * .30); g.lineTo(W, H * .30 + 46); g.lineTo(0, H * .30 + 46); g.fill();
  g.fillStyle = rgba(P.ink, .9); g.fillRect(0, H * .30 + 46, W, 10);
  // 招牌
  neonPanel(g, emi, 120, 210, 96, 300, '旅馆', P.neon[0], t);
  neonPanel(g, emi, 1660, 160, 96, 340, '夜宵', P.neon[1], t);
  neonPanel(g, emi, 1560, 300, 82, 220, '电玩', P.neon[2], t, { size: 50 });
  // 地面
  streetFloor(g, emi, P, H * .60);
  g.fillStyle = rgba(P.mid, .55); g.fillRect(0, H * .60, W, 8);
  wetStreaks(g, t, P, H * .60, [
    { x: 168, col: P.neon[0], h: 300, w: 34, a: .26 },
    { x: 1708, col: P.neon[1], h: 320, w: 32, a: .24 },
    { x: 400, col: P.win, h: 420, w: 210, a: .16 },
    { x: 1120, col: P.win, h: 420, w: 210, a: .16 }
  ]);
  // 水洼
  for (let i = 0; i < 7; i++) {
    const x = hash(i * 3.3) * W, y = H * (.66 + hash(i * 8.1) * .28);
    g.fillStyle = rgba('#7FD8E8', .07); g.beginPath(); g.ellipse(x, y, 110 + hash(i) * 90, 12, 0, 0, TAU); g.fill();
    g.strokeStyle = rgba('#BFE8F2', .10); g.lineWidth = 2; g.stroke();
  }
  rain(g, t, 220, { a: .34, len: 100, speed: 1700 });
}

// ② 街心 · 夜（车灯点名）
function bgCrossing(g, emi, P, t) {
  skyGrad(g, P, H * .58);
  // 远楼（低对比）
  buildingRow(g, emi, P, t, { y: H * .50, hMin: 260, hMax: 500, colA: mix(P.far, '#000', .25), colB: mix(P.far, '#000', .45), seed: 12, winA: .14, detail: 0 });
  g.fillStyle = rgba(P.sky[2], .28); g.fillRect(0, 0, W, H * .52);
  // 近排店铺
  buildingRow(g, emi, P, t, { y: H * .56, hMin: 180, hMax: 300, colA: P.far, colB: mix(P.far, '#000', .28), seed: 31, winA: .3 });
  // 店面：卷帘门、雨棚
  g.fillStyle = mix(P.near, '#000', .25); g.fillRect(0, H * .56 - 90, W, 90);
  for (let i = 0; i < 7; i++) {
    const x = i * 300 - 40;
    g.fillStyle = rgba(mix(P.mid, '#000', .35), .95); g.fillRect(x, H * .56 - 84, 220, 84);
    g.strokeStyle = rgba('#000', .35); g.lineWidth = 2;
    for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(x, H * .56 - 84 + k * 10.5); g.lineTo(x + 220, H * .56 - 84 + k * 10.5); g.stroke(); }
    g.fillStyle = rgba(P.neon[i % 4], .22); g.fillRect(x + 8, H * .56 - 74, 204, 54);
    emi.fillStyle = rgba(P.neon[i % 4], .16); emi.fillRect(x + 8, H * .56 - 74, 204, 54);
  }
  // 招牌
  neonPanel(g, emi, 60, 150, 90, 280, '食堂', P.neon[0], t);
  neonPanel(g, emi, 900, 120, 90, 300, '冷饮', P.neon[1], t, { size: 56 });
  neonPanel(g, emi, 1740, 200, 90, 260, '理发', P.neon[2], t, { size: 54 });
  // 路灯
  streetLamp(g, emi, 210, H * .44, 250, '#FFD9A0');
  streetLamp(g, emi, 1520, H * .44, 250, '#FFD9A0');
  // 路面
  streetFloor(g, emi, P, H * .56, mix(P.near, '#000', .22));
  g.fillStyle = rgba('#000', .3); g.fillRect(0, H * .56, W, 6);
  g.fillStyle = rgba('#C9CFD8', .07); g.fillRect(0, H * .63, W, 2);
  // 车道线
  g.strokeStyle = rgba('#D8DCE4', .22); g.lineWidth = 8;
  for (let i = 0; i < 4; i++) { const y = H * (.66 + i * .085); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  // 湿地反光
  wetStreaks(g, t, P, H * .56, [
    { x: 104, col: P.neon[0], h: 460, w: 40, a: .30 },
    { x: 944, col: P.neon[1], h: 460, w: 40, a: .26 },
    { x: 1782, col: P.neon[2], h: 460, w: 40, a: .26 },
    { x: 260, col: '#FFD9A0', h: 420, w: 26, a: .20 },
    { x: 1566, col: '#FFD9A0', h: 420, w: 26, a: .20 }
  ]);
  // 水洼
  for (let i = 0; i < 9; i++) {
    const x = hash(i * 3.3) * W, y = H * (.62 + hash(i * 8.1) * .34);
    g.fillStyle = rgba('#9FD8E8', .06); g.beginPath(); g.ellipse(x, y, 120 + hash(i) * 100, 13, 0, 0, TAU); g.fill();
  }
  rain(g, t, 240, { a: .30, len: 110, speed: 1800 });
}

// ③ 食街 · 钠灯
function bgFood(g, emi, P, t) {
  skyGrad(g, P, H * .40);
  buildingRow(g, emi, P, t, { y: H * .42, hMin: 160, hMax: 320, colA: P.far, colB: mix(P.far, '#000', .3), seed: 21, winA: .18 });
  // 遮雨棚（暖布）
  g.fillStyle = '#B4643A';
  g.beginPath(); g.moveTo(0, H * .28); g.lineTo(W * .52, H * .22); g.lineTo(W * .52, H * .34); g.lineTo(0, H * .40); g.fill();
  g.fillStyle = '#9E5730';
  g.beginPath(); g.moveTo(W * .52, H * .22); g.lineTo(W, H * .28); g.lineTo(W, H * .40); g.lineTo(W * .52, H * .34); g.fill();
  g.strokeStyle = rgba('#4A2A18', .8); g.lineWidth = 4;
  for (let i = 1; i < 8; i++) { const x = i * W / 8; g.beginPath(); g.moveTo(x, H * .26 + Math.abs(4 - i) * 9); g.lineTo(x, H * .40); g.stroke(); }
  // 挂灯泡
  for (let i = 0; i < 9; i++) {
    const x = 90 + i * 220, y = H * .31 + Math.sin(i * 1.7) * 16;
    g.fillStyle = rgba(P.neon[0], .95); g.beginPath(); g.arc(x, y, 9, 0, TAU); g.fill();
    emi.fillStyle = rgba('#FFC46B', .95); emi.beginPath(); emi.arc(x, y, 16, 0, TAU); emi.fill();
    g.strokeStyle = rgba('#2A1A12', .8); g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 9); g.lineTo(x, H * .27); g.stroke();
  }
  // 摊位
  g.fillStyle = mix(P.near, '#000', .1); g.fillRect(0, H * .54, W, H * .20);
  g.fillStyle = '#C9B79E'; g.fillRect(0, H * .52, W, 20);
  // 招牌
  neonPanel(g, emi, 300, 430, 84, 200, '烧烤', P.neon[0], t, { size: 46 });
  neonPanel(g, emi, 1180, 400, 84, 210, '糖水', P.neon[2], t, { size: 46 });
  neonPanel(g, emi, 1560, 450, 80, 180, '凉茶', P.neon[1], t, { size: 40 });
  streetFloor(g, emi, P, H * .74, '#241812');
  wetStreaks(g, t, P, H * .74, [
    { x: 340, col: P.neon[0], h: 220, w: 30, a: .2 },
    { x: 1220, col: P.neon[2], h: 220, w: 30, a: .18 }
  ]);
}

// ④ 天台 · 三年前盛夏
function bgRoof(g, emi, P, t) {
  skyGrad(g, P, H * .74);
  // 云
  for (let i = 0; i < 6; i++) {
    const x = ((hash(i * 4.1) * W * 1.4) + t * 12 * (.4 + hash(i))) % (W * 1.3) - 100;
    const y = 90 + hash(i * 9.3) * 260, r = 60 + hash(i * 2.7) * 90;
    g.fillStyle = rgba('#FFFFFF', .9);
    for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + k * r * .62, y + Math.sin(k) * r * .22, r * (.72 - k * .06), r * (.40 - k * .03), 0, 0, TAU); g.fill(); }
    g.fillStyle = rgba('#D6E6F2', .55);
    for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x + 20 + k * r * .58, y + r * .26, r * .5, r * .16, 0, 0, TAU); g.fill(); }
  }
  // 隔壁马赛克瓷砖墙
  g.fillStyle = '#BFA98E'; g.fillRect(0, H * .44, W, H * .30);
  for (let i = 0; i < 40; i++) for (let j = 0; j < 10; j++) {
    g.fillStyle = rgba(hash(i * 7 + j * 3) > .5 ? '#D8C6AA' : '#C9B296', .55);
    g.fillRect(i * 50 + (j % 2) * 8, H * .44 + j * 30, 44, 26);
  }
  // 水塔
  g.fillStyle = '#9C8C74'; g.fillRect(1500, 200, 190, 300);
  g.fillStyle = '#8A7A62'; g.beginPath(); g.moveTo(1480, 200); g.lineTo(1595, 130); g.lineTo(1710, 200); g.fill();
  g.strokeStyle = rgba('#6B5C46', .8); g.lineWidth = 6;
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(1540 + i * 60, 500); g.lineTo(1540 + i * 60, 620); g.stroke(); }
  // 天台地面
  g.fillStyle = '#C9C3B4'; g.fillRect(0, H * .74, W, H * .26);
  g.strokeStyle = rgba('#A79E8C', .7); g.lineWidth = 3;
  for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(0, H * .76 + i * 56); g.lineTo(W, H * .76 + i * 56); g.stroke(); }
  for (let i = 0; i < 12; i++) { const x = i * 170; g.beginPath(); g.moveTo(x, H * .74); g.lineTo(x + 40, H); g.stroke(); }
  // 铁丝网
  g.strokeStyle = rgba('#7A7263', .55); g.lineWidth = 2;
  for (let i = 0; i < 60; i++) { g.beginPath(); g.moveTo(i * 36, H * .48); g.lineTo(i * 36 + 60, H * .74); g.stroke(); g.beginPath(); g.moveTo(i * 36 + 60, H * .48); g.lineTo(i * 36, H * .74); g.stroke(); }
}

// ⑤ 天桥 · 黎明前
function bgBridge(g, emi, P, t) {
  const gr = g.createLinearGradient(0, 0, 0, H * .72);
  gr.addColorStop(0, P.sky[0]); gr.addColorStop(.62, P.sky[1]); gr.addColorStop(1, P.sky[2]);
  g.fillStyle = gr; g.fillRect(0, 0, W, H * .72);
  // 一线金
  const golden = .35 + .25 * Math.sin(t * .6);
  g.fillStyle = rgba('#F2C46A', .30 * golden);
  g.fillRect(0, H * .62, W, 8);
  emi.fillStyle = rgba('#F2C46A', .55 * golden); emi.fillRect(0, H * .60, W, 26);
  // 远处楼群
  buildingRow(g, emi, P, t, { y: H * .68, hMin: 120, hMax: 300, colA: P.far, colB: mix(P.far, '#000', .35), seed: 33, winA: .12 });
  streetFloor(g, emi, P, H * .68, '#15161E');
  // 桥面
  g.fillStyle = '#2A2C36'; g.beginPath();
  g.moveTo(0, H * .70); g.lineTo(W, H * .70); g.lineTo(W, H * .78); g.lineTo(0, H * .78); g.fill();
  g.fillStyle = '#23242E'; g.fillRect(0, H * .78, W, H * .22);
  // 栏杆
  g.strokeStyle = '#3E4250'; g.lineWidth = 9;
  g.beginPath(); g.moveTo(0, H * .70); g.lineTo(W, H * .70); g.stroke();
  g.strokeStyle = '#343846'; g.lineWidth = 5;
  for (let i = 0; i < 24; i++) { const x = i * 84; g.beginPath(); g.moveTo(x, H * .70); g.lineTo(x, H * .78); g.stroke(); }
  // 灯箱
  for (let i = 0; i < 6; i++) {
    const x = 200 + i * 300;
    g.fillStyle = rgba('#0E1018', .9); g.fillRect(x, H * .50, 150, 96);
    g.strokeStyle = rgba('#F2C46A', .8); g.lineWidth = 2.5; g.strokeRect(x + 4, H * .50 + 4, 142, 88);
    emi.fillStyle = rgba('#F2C46A', .35); emi.fillRect(x + 8, H * .50 + 8, 134, 80);
  }
  // 桥面湿反光
  g.fillStyle = rgba('#9FB4C8', .10); g.fillRect(0, H * .78, W, H * .22);
  for (let i = 0; i < 9; i++) {
    const x = hash(i * 5.1) * W;
    g.fillStyle = rgba('#F2C46A', .06);
    g.fillRect(x, H * .78, 40, 100 + hash(i) * 80);
  }
  rain(g, t, 160, { a: .22, len: 80, speed: 1400 });
}
