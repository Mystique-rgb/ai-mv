// arc.js —— 参数化的丝印场景：一套代码跑 26 镜，靠 A_state(t) 控制"有哪些版、错位多少、纸白淹到哪"
// 用途：验证四种核心语言（压版 / 分层错位 / 纸白洪泛 / 人形挖空）
const SK = {
  paper: '#F1E6D0', cream: '#F7EEDC', accent: '#FBE6B4',
  sky1: '#F8D9AC', sky2: '#EE9A73', far: '#9A7FA8', mid: '#3E7079', dark: '#1E3B3F',
};
PAL.paper = SK.paper;

// ---------- 时间表：只写"变化点"，其余靠 A_pick() 取上一个值 ----------
const A_TRACK = {
  plates: [[0.00, [1]], [3.58, [1, 2]], [3.97, [1, 2, 3]], [5.53, [1, 2, 3, 4]], [5.92, [1, 2, 3, 4, 5]],
           [12.53, [1, 2, 3, 4, 5, 6]], [15.64, [2, 1, 6]], [17.20, [2, 1, 6, 4]], [19.53, [1, 2, 3, 4, 5, 6]],
           [22.64, [1, 2, 3, 4, 5]], [24.97, [1, 2, 4, 5]], [25.75, [1, 2, 5]], [26.92, [1, 2]], [29.25, [1]]],
  off: [[0.00, 0], [1.64, 3], [3.97, 4], [9.03, 6], [12.14, 8], [21.09, 10], [24.59, 8], [25.36, 12],
        [27.70, 6], [28.86, 2], [31.20, 0]],
  flood: [[0.00, 1200], [3.19, 1140], [22.25, 1050], [23.03, 990], [23.42, 930], [24.59, 880], [26.53, 800],
          [27.31, 640], [29.25, -100], [31.20, -100]],
  hole: [[0.00, 0], [29.64, 1]],
  face: [[0.00, 0], [2.42, 1]],
  show: [[0.00, 'none'], [0.86, 'lines'], [3.97, 'train'], [5.92, 'both'], [15.25, 'report'], [21.86, 'train'],
         [22.64, 'solo']],
};
function A_pick(t, list) {
  let v = list[0][1];
  for (const [tt, val] of list) if (t >= tt) v = val;
  return v;
}

function A_state(t) {
  const plates = A_pick(t, A_TRACK.plates);
  return {
    t, plates, has: n => plates.includes(n),
    off: A_pick(t, A_TRACK.off), flood: A_pick(t, A_TRACK.flood),
    hole: A_pick(t, A_TRACK.hole), face: A_pick(t, A_TRACK.face), show: A_pick(t, A_TRACK.show),
  };
}
window.STATE = () => A_state(window.__T || 0);

// ---------- 人物 ----------
function drawWorld(t) {
  window.__T = t;
  const S = A_state(t);
  if (S.show === 'none' || S.show === 'lines') return;      // 只有线的时候人物不画
  const emoH = S.face ? emotions(t, [[0, 'neutral'], [2.80, 'hopeful'], [23.0, 'neutral'], [24.20, 'hopeful', { emote: null }]]) : { eyes: null, mouth: null };
  if (S.show === 'solo' || S.show === 'train' || S.show === 'both') {
    hero(520, 950, 48, { view: 'q', noShadow: true, ...emoH });
  }
  if (S.show === 'both') {
    heroine(1300, 648, 29, { view: 'front', noShadow: true, ...emotions(t, [[0, 'cry']]), aL: 1.2, aR: 1.05 });
  }
}

// ---------- 版面 ----------
const G = 4;   // 纸白留缝

function A_bands(c, w, h) {                       // 天空：阶梯色带
  const ys = [[0, 0, 190], [1, 190, 250], [2, 250, 330]];
  ys.forEach(([i, a, b]) => KIT.poly(c, [[0, a], [w, a], [w, b], [0, b]], i === 1 ? '#F7DDB4' : SK.sky1));
  for (let i = 0; i < 4; i++) {
    const y = 96 + i * 30, x0 = 640 + i * 190, ww = 260 + i * 70;
    KIT.poly(c, [[x0, y], [x0 + ww, y], [x0 + ww, y + 10], [x0, y + 10]], i % 2 ? '#FBEBCD' : SK.sky1);
  }
}

function A_mountains(c, filled) {
  const pts = [[-20, 330], [60, 300], [180, 330], [300, 262], [430, 330], [540, 296], [640, 330], [660, 330]];
  if (filled) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(([x, y]) => c.lineTo(x, y)); c.closePath(); c.fillStyle = SK.far; c.fill(); }
  else {
    c.save(); c.strokeStyle = SK.dark; c.lineWidth = 4; c.lineJoin = 'miter';
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    c.restore();
  }
  // 两根铁塔
  [[296, 266, 206], [534, 300, 244]].forEach(([x, yb, yt]) => KIT.poly(c, [[x, yb], [x + 8, yb], [x + 8, yt], [x, yt]], filled ? SK.far : SK.dark));
}

function A_train(c, w, filled) {
  if (filled) {
    KIT.poly(c, [[700, 300], [w, 300], [w, 760], [700, 760]], SK.mid);
    KIT.poly(c, [[700, 300], [w, 300], [w, 336], [700, 336]], SK.dark);
    KIT.poly(c, [[700, 712], [w, 712], [w, 760], [700, 760]], SK.dark);
    KIT.poly(c, [[700, 676], [w, 676], [w, 690], [700, 690]], SK.cream);
    KIT.poly(c, [[1618, 300], [1630, 300], [1630, 760], [1618, 760]], SK.dark);
  } else {
    c.save(); c.strokeStyle = SK.dark; c.lineWidth = 5;
    c.strokeRect(700, 300, w - 700, 460);
    c.beginPath(); c.moveTo(700, 676); c.lineTo(w, 676); c.moveTo(700, 712); c.lineTo(w, 712); c.stroke();
    c.beginPath(); c.moveTo(1618, 300); c.lineTo(1618, 760); c.stroke();
    c.restore();
  }
}

function A_windows(c, lit) {
  const r = [[820, 372, 1010, 662], [1140, 372, 1460, 662]];
  r.forEach(([a, b, cc, d]) => {
    if (lit) KIT.poly(c, [[a, b], [cc, b], [cc, d], [a, d]], '#E2CFAB');
    else {
      c.save(); c.strokeStyle = SK.dark; c.lineWidth = 5; c.strokeRect(a, b, cc - a, d - b); c.restore();
    }
  });
  if (lit) KIT.poly(c, [[1152, 384], [1268, 384], [1178, 650], [1152, 650]], '#FFF8E6');
}

function A_frame(c, w, h) {                      // 窗框压住她
  KIT.poly(c, [[1140, 636], [1460, 636], [1460, 662], [1140, 662]], SK.dark);
  KIT.poly(c, [[1152, 372], [1166, 372], [1166, 662], [1152, 662]], SK.dark);
  KIT.poly(c, [[1434, 372], [1448, 372], [1448, 662], [1434, 662]], SK.dark);
}

function A_lines(c, w, h) {                      // 版 1 的"结构"，永远不抽走
  c.save(); c.strokeStyle = SK.dark; c.lineWidth = 5;
  c.beginPath(); c.moveTo(0, 892); c.lineTo(w, 892); c.stroke();
  c.beginPath(); c.moveTo(0, 960); c.lineTo(w, 960); c.stroke();
  c.restore();
}

function A_textBlock(c, w, h) {
  KIT.text(c, '小镇 · 一九九九', 72, 126, 74, SK.dark, { track: 6, weight: 800, family: '"Microsoft YaHei","PingFang SC",sans-serif' });
  KIT.poly(c, [[76, 148], [582, 148], [582, 154], [76, 154]], SK.dark);
  KIT.text(c, 'SHAN ZHEN  /  ONE WAY TICKET', 78, 194, 25, SK.dark, { track: 5, weight: 600, family: '"Arial Narrow",Arial,sans-serif' });
  KIT.poly(c, [[0, 960], [w, 960], [w, h], [0, h]], SK.dark);
  KIT.text(c, '小镇姑娘', 72, 1052, 50, SK.cream, { track: 3, weight: 800, family: '"Microsoft YaHei","PingFang SC",sans-serif' });
  KIT.text(c, '车头依然吐着烟 · 一百二十公里', 74, 998, 22, SK.accent, { track: 2, weight: 500, family: '"Microsoft YaHei",sans-serif' });
  KIT.text(c, '01', w - 78, 1044, 54, SK.accent, { align: 'right', family: '"Impact","Arial Black",sans-serif' });
  KIT.text(c, '1999 · 07 · 站台', w - 78, 992, 20, '#8FA9A4', { align: 'right', track: 3, weight: 600, family: '"Arial Narrow",Arial,sans-serif' });
}

window.frameHook = (c, t) => {
  window.__T = t;
  const S = A_state(t), w = W, h = H;
  const id = KIT.pixels(drawingContext.canvas);
  const m = KIT.clean(KIT.mask(id, KIT.hexToRgb(SK.paper), 26), w, h);

  // 1. 纸
  c.fillStyle = SK.paper; c.fillRect(0, 0, w, h);
  KIT.fibres(c, w, h, 'rgba(255,248,232,.30)', 200, 5);

  // 2. 背景层（错位 0）
  if (S.has(4)) A_bands(c, w, h);
  if (S.has(2)) {
    KIT.poly(c, [[0, 760], [w, 760], [w, 960], [0, 960]], '#C9B79C');
    A_mountains(c, true);
  } else A_mountains(c, false);
  if (S.has(6)) KIT.poly(c, [[0, 892], [w, 892], [w, 914], [0, 914]], SK.accent);
  if (S.show !== 'lines') { A_train(c, w, S.has(3)); A_windows(c, S.has(4)); }
  A_lines(c, w, h);

  // 3. 人物层（错位 S.off）
  const rules = [
    { l: [0, .42], col: S.has(1) ? SK.dark : SK.paper, off: [-2, -1.4] },
    { s: [0, .12], l: [.78, 1], col: SK.paper, off: [1.4, 1] },
    { h: [318, 360], col: S.has(5) ? SK.sky2 : SK.paper, off: [3, 2] },
    { h: [0, 18], col: S.has(5) ? SK.sky2 : SK.paper, off: [3, 2] },
    { h: [20, 58], col: SK.paper, off: [1.6, .9] },
    { h: [59, 200], col: S.has(3) ? SK.mid : SK.paper, off: [-2.4, -1.4] },
    { col: S.has(3) ? SK.mid : SK.paper, off: [0, 0] },
  ];
  if (S.show === 'lines' || S.show === 'none') {
    // 空壳：只留线
    if (m.some(v => v)) {
      c.save(); c.translate(0, 0);
      c.drawImage(KIT.outline(m, w, h, 4, SK.dark), 0, 0);
      c.restore();
    }
  } else {
    c.save(); c.translate(S.off, 0);
    c.drawImage(KIT.outline(m, w, h, G, SK.paper), 0, 0);
    c.drawImage(KIT.separate(id, m, rules), 0, 0);
    c.restore();
    if (S.show === 'both') A_frame(c, w, h);
  }

  // 4. 纸白洪泛（人物之后画，才会淹到人）
  if (S.flood < 1100) {
    KIT.poly(c, [[0, S.flood], [w, S.flood], [w, h], [0, h]], SK.paper);
    // 洪泛的边缘是一条墨线（印刷的水痕）
    KIT.poly(c, [[0, S.flood - 3], [w, S.flood - 3], [w, S.flood], [0, S.flood]], S.has(1) ? SK.dark : SK.paper);
  }

  // 5. 人形挖空（比纸白深 3%）
  if (S.hole && m.some(v => v)) {
    const hole = KIT.newCanvas(w, h), hc = hole.getContext('2d');
    hc.fillStyle = '#EDE1C9'; hc.fillRect(0, 0, w, h);
    const img = hc.getImageData(0, 0, w, h), d = img.data;
    for (let i = 0; i < w * h; i++) if (!m[i]) d[i * 4 + 3] = 0;
    hc.putImageData(img, 0, 0);
    c.drawImage(hole, 0, 0);
  }

  // 6. 版面文字
  if (S.show !== 'report') A_textBlock(c, w, h);
  else {
    KIT.text(c, '年 度 报 告', 72, 150, 60, SK.dark, { track: 8, weight: 800, family: '"Microsoft YaHei",sans-serif' });
    KIT.text(c, 'ANNUAL REPORT  ·  2000', 76, 200, 22, S.has(6) ? '#C9932B' : SK.dark, { track: 4, weight: 600, family: '"Arial Narrow",Arial,sans-serif' });
  }

  // 7. 定位十字（只在开场）
  if (t < 0.86) {
    c.save(); c.strokeStyle = SK.dark; c.lineWidth = 2;
    [[54, 54], [w - 54, 54], [54, h - 54], [w - 54, h - 54]].forEach(([x, y]) => {
      c.beginPath(); c.moveTo(x - 26, y); c.lineTo(x + 26, y); c.moveTo(x, y - 26); c.lineTo(x, y + 26); c.stroke();
    });
    c.restore();
  }
};
