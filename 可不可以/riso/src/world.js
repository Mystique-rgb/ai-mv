// world.js — 场景（全部画进三通道版面）
// 构图纪律：大块实心墨 + 大面积纸白 + 中间调只在天空用网点。宁可少画，不要灰。
const W = 1920, H = 1080;

// ---------- 通用零件 ----------
function crossMarks(P, count = 4, size = 30) {
  const g = P.g;
  const pts = [[86, 86], [W - 86, 86], [86, H - 86], [W - 86, H - 86]].slice(0, clamp(count, 0, 4));
  for (const [x, y] of pts) {
    ink(g, 'dark', 1);
    g.fillRect(x - size, y - 3, size * 2, 6);
    g.fillRect(x - 3, y - size, 6, size * 2);
    // 中心留白（对版十字的经典缺口）
    cut(g, 1);
    g.fillRect(x - 9, y - 9, 18, 18);
    ink(g, 'dark', 1);
    g.fillRect(x - 4, y - 4, 8, 8);
  }
}

// 天空：越靠上越淡，给纸留白
function sky(P, y0 = 0, y1 = 760, dTop = .06, dBot = .22, bands = 9) {
  const g = P.g;
  for (let i = 0; i < bands; i++) {
    const y = lerp(y0, y1, i / bands), h = (y1 - y0) / bands + 1;
    ink(g, 'blue', lerp(dTop, dBot, i / (bands - 1)));
    g.fillRect(0, y, W, h);
  }
}

// 楼群：实心墨剪影 + 敲白窗 + 黄灯
function skyline(P, o = {}) {
  const g = P.g;
  const base = o.base ?? 760, d = o.d ?? 1, seed = o.seed ?? 1;
  let x = -60, i = 0;
  while (x < W + 80) {
    const w = 110 + hash2(i + seed, 3) * 150;
    const h = 70 + hash2(i + seed, 7) * (o.hMax ?? 260);
    ink(g, 'blue', d);
    g.fillRect(x, base - h, w, h);
    // 窗：先挖白再上黄（避免蓝黄叠成墨绿）
    const cols = Math.max(2, Math.floor((w - 24) / 46)), rows = Math.max(2, Math.floor((h - 24) / 56));
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      if (hash2(i * 31 + c + seed, r * 7) > (o.winP ?? .62)) {
        const wx = x + 16 + c * (w - 24) / cols, wy = base - h + 18 + r * (h - 24) / rows;
        cut(g, 1); g.fillRect(wx, wy, 13, 18);
        if (o.winD) { ink(g, 'yellow', o.winD); g.fillRect(wx, wy, 13, 18); }
      }
    }
    x += w + 12 + hash2(i + seed, 11) * 30;
    i++;
  }
}

function lamp(P, x, yBase, yTop, glow = .22) {
  const g = P.g;
  ink(g, 'dark', .95);
  g.fillRect(x - 5, yTop, 10, yBase - yTop);
  g.beginPath();
  g.moveTo(x, yTop + 6); g.lineTo(x + 54, yTop - 18); g.lineTo(x + 60, yTop - 6); g.lineTo(x, yTop + 22);
  g.fill();
  ink(g, 'yellow', 1);
  rr(g, x + 40, yTop - 22, 40, 14, 6); g.fill();
  ink(g, 'yellow', glow);
  ellipse(g, x + 60, yTop - 14, 120, 86); g.fill();
  ink(g, 'yellow', glow * .5);
  for (let i = 0; i < 4; i++) g.fillRect(x - 60 + i * 34, yBase - 40, 22, 40 - i * 8);
}

function rain(P, t, n = 90, d = .4) {
  const g = P.g;
  ink(g, 'blue', d);
  for (let i = 0; i < n; i++) {
    const sp = 760 + hash(i) * 520;
    const x = (hash(i * 3.1) * W + t * 26) % (W + 120) - 60;
    const y = (hash(i * 7.7) * H + t * sp) % (H + 140) - 70;
    g.fillRect(x, y, 2, 20 + hash(i * 5) * 34);
  }
}

// 天桥栏杆（前景，横跨全幅）
function railing(P, yTop = 740, yBot = 1000, step = 150) {
  const g = P.g;
  ink(g, 'dark', .96);
  g.fillRect(0, yTop, W, 18);                  // 上横梁
  g.fillRect(0, yBot - 16, W, 16);             // 下横梁
  for (let x = 60; x < W; x += step) { g.fillRect(x, yTop, 12, yBot - yTop); }
  ink(g, 'dark', .55);
  g.fillRect(0, yTop + (yBot - yTop) * .45, W, 8);   // 中横杆
}

// 滚筒：整幅向下的上墨，带一道更重的边
function rollerDown(P, yEdge, d = 1) {
  const g = P.g;
  if (yEdge >= H) return;
  ink(g, 'blue', d * .92);
  g.fillRect(0, yEdge, W, H - yEdge);
  ink(g, 'blue', d);
  g.fillRect(0, yEdge, W, 12);
}

const SCENES = {};

// 白纸 / 开场 / 收尾
SCENES.paper = (P, o) => {
  const g = P.g;
  const prog = o.inkProg != null ? o.inkProg : clamp((o.p - .55) / .45, 0, 1);
  if (prog > 0) rollerDown(P, H * (1 - prog), 1);
};

// 城市从网点里长出来
SCENES.cityGrow = (P, o) => {
  sky(P, 0, 760, .05, .20, 10);
  skyline(P, { base: 760, d: 1, hMax: 300, winD: .9, winP: .55, seed: 2 });
  railing(P, 740, 1000);
  ink(P.g, 'blue', .10); P.g.fillRect(0, 1000, W, H - 1000);
  if (o.car != null) {
    const g = P.g, x = o.car;
    cut(g, 1); rr(g, x, 930, 210, 58, 12); g.fill();
    ink(g, 'blue', .9); rr(g, x + 30, 906, 70, 32, 8); g.fill();
    cut(g, 1); rr(g, x + 38, 912, 54, 20, 4); g.fill();
    ink(g, 'dark', 1);
    ellipse(g, x + 50, 990, 12, 12); g.fill();
    ellipse(g, x + 160, 990, 12, 12); g.fill();
  }
};

// 天桥（主力）
SCENES.bridge = (P, o) => {
  const g = P.g, t = o.t;
  const warm = o.warm ?? 0;
  sky(P, 0, 760, lerp(.05, .02, warm), lerp(.20, .14, warm), 10);
  if (warm) { ink(g, 'yellow', .10); g.fillRect(0, 0, W, 800); }
  skyline(P, { base: 760, d: 1, hMax: 280, winD: warm ? 1 : .95, winP: warm ? .45 : .6, seed: 3 });
  railing(P, 740, 1000);
  ink(g, 'blue', .08); g.fillRect(0, 1000, W, H - 1000);
  ink(g, 'dark', .8); g.fillRect(0, 1000, W, 10);
  // 街面的车光
  ink(g, 'yellow', .30);
  for (let i = 0; i < 4; i++) g.fillRect(0, 792 + i * 30, W, 6);
  lamp(P, 150, 1000, 470, .20);
  lamp(P, 1760, 1000, 470, .20);
  if (o.rain) rain(P, t, 80, .34);
  if (o.pale != null) {
    ink(g, 'pink', o.pale);
    rr(g, o.paleX ?? 980, 770, 64, 170, 30); g.fill();
  }
  if (o.hole) {
    cut(g, 1);
    rr(g, o.hole.x, o.hole.y, o.hole.w, o.hole.h, o.hole.r ?? 24); g.fill();
    ink(g, 'pink', .05);
    rr(g, o.hole.x, o.hole.y, o.hole.w, o.hole.h, o.hole.r ?? 24); g.fill();
  }
};

// 街（横移 / 分格）
SCENES.street = (P, o) => {
  const g = P.g;
  sky(P, 0, 560, .04, .16, 6);
  skyline(P, { base: 620, d: 1, hMax: 330, winD: .95, winP: .5, seed: 5 });
  ink(g, 'blue', .10); g.fillRect(0, 620, W, H - 620);
  // 便利店门脸
  const sx = o.storeX ?? 1180;
  ink(g, 'yellow', .92); g.fillRect(sx, 400, 420, 230);
  cut(g, 1); g.fillRect(sx + 22, 424, 376, 186);
  ink(g, 'yellow', .70); g.fillRect(sx + 22, 424, 376, 186);
  ink(g, 'blue', .35);
  for (let i = 0; i < 4; i++) g.fillRect(sx + 30, 452 + i * 40, 360, 6);
  lamp(P, 250, 760, 340, .24);
  lamp(P, 860, 760, 340, .24);
  ink(g, 'yellow', .20);
  for (let i = 0; i < 8; i++) g.fillRect(sx + 40 + i * 46, 640 + (i % 3) * 16, 16, 100);
  if (o.rain) rain(P, o.t, 70, .34);
};

// 三年前（暖）
SCENES.memory = (P, o) => {
  SCENES.bridge(P, Object.assign({}, o, { warm: 1, rain: 0 }));
  const g = P.g;
  ink(g, 'yellow', .14);
  ellipse(g, 1250, 320, 560, 260); g.fill();
};

// 末班公交
SCENES.bus = (P, o) => {
  const g = P.g;
  sky(P, 0, 700, .04, .16, 7);
  skyline(P, { base: 700, d: 1, hMax: 260, winD: .8, winP: .6, seed: 7 });
  ink(g, 'blue', .10); g.fillRect(0, 700, W, H - 700);
  const bx = o.busX ?? 170, by = 420, bw = 1320, bh = 330;
  ink(g, 'blue', 1); rr(g, bx, by, bw, bh, 24); g.fill();
  cut(g, 1);
  for (let i = 0; i < 5; i++) { rr(g, bx + 56 + i * 214, by + 38, 176, 118, 10); g.fill(); }
  rr(g, bx + bw - 132, by + 38, 104, 196, 12); g.fill();
  ink(g, 'yellow', .75);
  for (let i = 0; i < 5; i++) { rr(g, bx + 56 + i * 214, by + 38, 176, 118, 10); g.fill(); }
  ink(g, 'dark', 1);
  ellipse(g, bx + 220, by + bh + 4, 54, 54); g.fill();
  ellipse(g, bx + bw - 260, by + bh + 4, 54, 54); g.fill();
  cut(g, 1);
  ellipse(g, bx + 220, by + bh + 4, 20, 20); g.fill();
  ellipse(g, bx + bw - 260, by + bh + 4, 20, 20); g.fill();
  ink(g, 'yellow', 1);
  rr(g, bx + bw - 24, by + 150, 30, 34, 8); g.fill();
  ink(g, 'yellow', .22);
  g.beginPath(); g.moveTo(bx + bw, by + 140); g.lineTo(W, by + 70); g.lineTo(W, by + 320); g.lineTo(bx + bw, by + 200); g.fill();
  if (o.rain) rain(P, o.t, 60, .28);
};

// 蓝海
SCENES.sea = (P, o) => {
  const g = P.g, t = o.t;
  ink(g, 'blue', 1); g.fillRect(0, 0, W, H);
  for (let i = 0; i < 15; i++) {
    cut(g, .28);
    g.lineWidth = 5 + hash(i) * 7;
    g.beginPath();
    const yBase = i * 80 + 30;
    for (let x = 0; x <= W; x += 20) {
      const y = yBase + Math.sin(x * 0.007 + t * (1.1 + hash(i)) + i) * (14 + i * 2.4);
      x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
  }
  if (o.dot) { ink(g, 'pink', .8); ellipse(g, o.dot[0], o.dot[1], o.dot[2], o.dot[2]); g.fill(); }
};

// 便利店冷柜
SCENES.store = (P, o) => {
  const g = P.g;
  ink(g, 'yellow', .30); g.fillRect(0, 0, W, H);
  ink(g, 'blue', .30); g.fillRect(0, 0, W, 150);
  // 冷柜外框
  ink(g, 'dark', .92); g.fillRect(96, 190, W - 192, 640);
  const cols = o.cols ?? 4, rows = o.rows ?? 3;
  const gx = 112, gy = 206, gw = W - 224, gh = 608;
  const cw = gw / cols, ch = gh / rows;
  const filled = o.filled ?? 0;
  const faces = o.faces || ['smile'];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c;
    const x = gx + c * cw + 7, y = gy + r * ch + 7;
    cut(g, 1); rr(g, x, y, cw - 14, ch - 14, 8); g.fill();
    if (i < filled) {
      ink(g, 'pink', .95); rr(g, x, y, cw - 14, ch - 14, 8); g.fill();
      // 格里的脸
      const mood = faces[i % faces.length];
      const fx = x + cw * .5 - 30, fy = y + ch * .30;
      cut(g, 1); rr(g, fx, fy, 60, 60, 12); g.fill();
      ink(g, 'dark', 1);
      const ex = 13;
      if (mood === 'smile') {
        for (const s of [-1, 1]) {
          g.lineWidth = 4.4; g.lineCap = 'round';
          g.beginPath(); g.moveTo(fx + 30 + s * ex - 8, fy + 30);
          g.quadraticCurveTo(fx + 30 + s * ex, fy + 17, fx + 30 + s * ex + 8, fy + 30); g.stroke();
        }
      } else if (mood === 'sad') {
        for (const s of [-1, 1]) { ellipse(g, fx + 30 + s * ex, fy + 28, 4, 8); g.fill(); }
      } else if (mood === 'wide') {
        for (const s of [-1, 1]) { ellipse(g, fx + 30 + s * ex, fy + 28, 6, 12); g.fill(); }
      } else if (mood === 'love') {
        for (const s of [-1, 1]) { ellipse(g, fx + 30 + s * ex, fy + 28, 5, 9); g.fill(); }
      } else {
        for (const s of [-1, 1]) { ellipse(g, fx + 30 + s * ex, fy + 28, 4, 7); g.fill(); }
      }
    } else {
      ink(g, 'blue', .16); rr(g, x, y, cw - 14, ch - 14, 8); g.fill();
    }
  }
  // 柜台
  ink(g, 'dark', .9); g.fillRect(0, 830, W, 250);
  ink(g, 'yellow', .35); g.fillRect(0, 830, W, 10);
};

// 食街
SCENES.food = (P, o) => {
  const g = P.g, t = o.t;
  sky(P, 0, 380, .05, .18, 5);
  skyline(P, { base: 400, d: 1, hMax: 180, winD: .9, winP: .55, seed: 11 });
  ink(g, 'blue', .30); g.fillRect(0, 400, W, H - 400);
  // 摊车
  ink(g, 'dark', .9); g.fillRect(150, 470, 1620, 330);
  ink(g, 'yellow', .9); g.fillRect(150, 470, 1620, 36);
  // 汤锅
  ink(g, 'dark', 1); rr(g, 620, 560, 680, 150, 16); g.fill();
  cut(g, 1); rr(g, 640, 576, 640, 118, 12); g.fill();
  ink(g, 'yellow', .55); rr(g, 640, 576, 640, 118, 12); g.fill();
  // 串
  for (let i = 0; i < 7; i++) {
    const x = 690 + i * 84;
    ink(g, 'dark', 1); g.fillRect(x, 505, 6, 78);
    ink(g, 'yellow', 1); ellipse(g, x + 3, 545, 22, 17); g.fill();
    ink(g, 'blue', .75); ellipse(g, x + 3, 545, 22, 17); g.fill();
  }
  // 蒸汽
  for (let i = 0; i < 24; i++) {
    const ph = (hash(i) + t * .35) % 1;
    const x = 520 + hash(i * 3.3) * 880 + Math.sin(t * 1.3 + i) * 22;
    const y = 560 - ph * 480;
    ink(g, 'yellow', .34 * (1 - ph));
    ellipse(g, x, y, 46 + ph * 80, 30 + ph * 46); g.fill();
  }
  if (o.zhou) person(P, { who: 'zhou', x: 380, y: 1010, s: 460, view: 'q', mood: 'calm', pose: { armR: 42 } });
};

// 出租屋
SCENES.room = (P, o) => {
  const g = P.g;
  ink(g, 'blue', .55); g.fillRect(0, 0, W, H);
  cut(g, 1); rr(g, 520, 140, 880, 700, 6); g.fill();
  sky(P, 140, 480, .06, .22, 6);
  skyline(P, { base: 700, d: 1, hMax: 220, winD: .95, winP: .5, seed: 13 });
  ink(g, 'dark', .96);
  g.fillRect(950, 140, 16, 700);
  g.fillRect(520, 470, 880, 16);
  ink(g, 'blue', .16); g.fillRect(520, 140, 880, 700);
};

// 纸堆
SCENES.stack = (P, o) => {
  const g = P.g;
  ink(g, 'blue', .22); g.fillRect(0, 0, W, H);
  const n = o.n ?? 26;
  for (let i = 0; i < n; i++) {
    const y = 920 - i * 10;
    const off = (i % 2 ? 1 : -1) * (i * .5);
    cut(g, 1); rr(g, 380 + off, y, 1160, 9, 2); g.fill();
    ink(g, 'dark', .30 + (i % 6) * .04);
    g.fillRect(380 + off, y + 9, 1160, 3);
  }
};

// 全黑：三版全叠 + 纸白双人
SCENES.dark = (P, o) => {
  const g = P.g;
  ink(g, 'dark', 1); g.fillRect(0, 0, W, H);
  const n = o.cracks ?? 3;
  for (let i = 0; i < n; i++) {
    const x0 = 90 + i * (W - 180) / Math.max(1, n - 1);
    const path = () => {
      g.beginPath(); g.moveTo(x0, 0);
      g.bezierCurveTo(x0 + 110, 330, x0 - 90, 720, x0 + 50, H);
      g.stroke();
    };
    cut(g, 1); g.lineWidth = 5; path();
    ink(g, 'blue', .62); g.lineWidth = 9; path();
    ink(g, 'pink', .62); g.lineWidth = 9; path();
  }
};

// 印章
SCENES.stamp = (P, o) => {
  const g = P.g;
  ink(g, 'blue', .35); g.fillRect(0, 0, W, H);
  ink(g, 'yellow', .22); g.fillRect(0, 0, W, H);
  const y = o.stampY ?? 200;
  const bx = 540, bw = 840, bh = 250;
  // 手柄
  ink(g, 'dark', 1);
  g.fillRect(W / 2 - 44, y - 150, 88, 160);
  rr(g, W / 2 - 110, y - 168, 220, 30, 12); g.fill();
  // 章体
  rr(g, bx, y, bw, bh, 12); g.fill();
  cut(g, 1); rr(g, bx + 16, y + 16, bw - 32, bh - 32, 8); g.fill();
  ink(g, 'dark', 1);
  g.font = '700 104px STKaiti, "华文楷体", serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('保 质 期', bx + bw / 2, y + bh * .46);
  for (let i = 0; i < 3; i++) {
    const x = bx + bw / 2 - 116 + i * 116;
    g.fillRect(x - 3, y + bh - 66, 6, 34);
  }
  if (o.marked) {
    ink(g, 'dark', .88);
    g.save(); g.translate(W / 2, 900); g.rotate(-.045);
    g.font = '700 92px STKaiti, "华文楷体", serif';
    g.textAlign = 'center'; g.fillText('保 质 期', 0, 0);
    g.restore();
  }
};
