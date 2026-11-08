// _ys_p1.js —《于是》v4 全片 spec 第一片：色板 + 图元 + 60 格 rig + 9 场景
// 整份 spec 包在 IIFE 里：内部自定义色板，不依赖 stage.html 的全局 PAL（daily.mjs 需在 node 里预读）
(function () {
const PAL = {
  ink: '#101321', night: '#181B2C', navy: '#232840', slate: '#2E3450',
  rainFar: '#6E688C', rainNear: '#8A86A8',
  gold: '#FFD166', goldDk: '#D8A856', goldRe: '#9C7838', goldLit: '#F2E8D0',
  amber: '#C87C3C',
  coat: '#6E86A8', coatDk: '#4C617E', coatLt: '#8AA0BE',
  shirt: '#F2E8D0', innerDk: '#2A2E40',
  pants: '#262B44', pantsDk: '#1A1F33', shoe: '#0C0F18', shoeLt: '#1E2637',
  coatHer: '#A898C8', coatHerDk: '#7C6D9C', innerHer: '#D85870',
  red: '#C8463C', cyan: '#5FD3C4', tearC: '#9AD6C4',
  hair: '#15141A', hairEdge: '#0A0C16', hairHi: '#2C3448', brow: '#3A2A20',
  skin: '#C9A382', skinDk: '#A87E62', skinLt: '#E0B896', lip: '#9A6152',
  blush: '#C2737A', cool: '#C9D4E8', cellBg: '#4E4860',
};

const HZ = v => Math.min(1, Math.max(0, v));
const EZo = x => 1 - Math.pow(1 - x, 3);

// ============================================================
//  图元
// ============================================================
function lightSpot(c, x, y, w, h, col, k) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const dx = (i - w / 2) / (w / 2), dy = (j - h / 2) / (h / 2);
    const r = dx * dx + dy * dy * 1.5;
    if (r < .62 && ((i * 7 + j * 11) % 7) / 7 < k) R(c, x + i, y + j, 1, 1, col);
  }
}
function rainCoarse(c, t, n, a) {
  for (let i = 0; i < n; i++) {
    const s = i * 149.3;
    const bx = ((s * 6.1 + i * 47) % 350) - 14;
    const by = ((s * 2.7 + t * 210 + i * 31) % 215) - 18;
    const skew = Math.round(by * 0.10);
    R(c, bx + skew, by, 1, 3 + (i % 2), i % 3 ? PAL.rainFar : PAL.rainNear);
    if (i % 7 === 0) R(c, bx + skew, by, 1, 1, '#A6A0C4');
  }
}
function poles(c, x, top, bot) {
  R(c, x, top, 2, bot - top, '#0A0D18');
  R(c, x, top, 1, bot - top, '#161A28');
  R(c, x - 7, top + 4, 16, 1, '#0A0D18');
  R(c, x - 7, top + 11, 13, 1, '#0A0D18');
  for (let i = 0; i < 3; i++) R(c, x - 6 + i * 6, top + 2, 1, 2, '#232840');
  for (let i = 0; i < 2; i++) R(c, x - 5 + i * 6, top + 9, 1, 2, '#232840');
}
function wiresV4(c, y0, sag, n, x0, x1) {
  for (let i = 0; i < n; i++) {
    const yy = y0 + i * 5.5;
    for (let x = (x0 || 0); x < (x1 || 320); x++) {
      const kk = (x - 150) / 170;
      R(c, x, yy + Math.round((sag + i * 1.8) * (1 - kk * kk)), 1, 1, '#07090F');
    }
  }
}
// 灯下湿地光斑（面状，H2）
function wetGlow(c, x, y, w, h, k) {
  lightSpot(c, x, y, w, h, PAL.goldDk, k);
  lightSpot(c, x + w * .18, y + h * .25, w * .6, h * .6, PAL.gold, k * .9);
  lightSpot(c, x + w * .1, y + h * .5, w * .3, h * .4, PAL.goldRe, k * .7);
}
// 光柱（手机屏 / 闪光灯）
function lightCone(c, x, y, w0, w1, h, col, a) {
  for (let j = 0; j < h; j++) {
    const w = w0 + (w1 - w0) * (j / h);
    for (let i = 0; i < w; i++) {
      if (((i + j) & 1) === 0) {
        c.save(); c.globalAlpha = a * (1 - j / h); c.fillStyle = col;
        c.fillRect(Math.round(x - w / 2 + i), Math.round(y + j), 1, 1); c.restore();
      }
    }
  }
}

// ============================================================
//  脸（H1/H3）：12 格宽 × 12 格高，y 向下
// ============================================================
function faceV4(c, ox, oy, u, o = {}) {
  const P = (x, y, w, h, col) => R(c, ox + x * u, oy + y * u, w * u, h * u, col);
  const who = o.who || 'him';
  const ex = o.ex || 'E1';
  const hc = PAL.hair, edge = PAL.hairEdge;
  const sk = PAL.skin, skD = PAL.skinDk, skL = PAL.skinLt;

  if (o.back) {
    // 后脑：分三层（顶层略亮 / 中段主色 / 下段压暗）+ 发丝 + 颈
    P(-1.5, -1.5, 15, 4, '#1E2230');       // 发顶受光
    P(-1.5, 2.5, 15, 7.5, hc);             // 发主体
    P(-1.5, 8, 15, 2, '#0E1018');          // 后颈压暗
    P(-1.5, 10, 11, 2.5, PAL.skinDk);      // 脖子
    P(-2, 11.4, 12, 1.2, edge);
    P(-.8, -1, 5, 1, PAL.hairHi);          // 左上发丝高光
    P(2.5, .5, 3.5, .8, '#252B3A');
    P(3, 6, 4, .8, '#252B3A');             // 中段发丝
    P(-1.5, 9.6, 15, .6, '#06080E');       // 后脑下缘
    return;
  }
  // 蘑菇头
  P(-1, -1.5, 14, 6.5, hc);
  P(0, -2, 12, .6, hc);
  P(-1, 4.9, 14, .6, edge);
  P(-1, 3, 14, .5, PAL.hairHi);
  P(3, 1, 3, .5, '#1F2436');
  if (who === 'her') {
    P(-1.5, 4.6, 3.5, 16, hc);
    P(10, 4.6, 3.5, 16, hc);
    P(-1.5, 19, 3.5, 1.5, edge);
    P(10, 19, 3.5, 1.5, edge);
    P(5, -1.5, 2, 1.6, edge);
  }
  // 脸（裸脸 1.5~10.5 = 9 格，左右对称）
  P(1.5, 3.5, 9, 8.5, sk);
  P(2.5, 3, 7, .6, sk);
  P(1.5, 4, 1.4, 7, skD);
  P(2.5, 11, 7, 1, skD);
  // 包脸发（左右各 3.5 格，各盖脸缘 1 格）
  P(-1, 3.5, 3.5, 6.8, hc);
  P(9.5, 3.5, 3.5, 6.8, hc);
  P(-1, 9.7, 3.5, .8, edge);
  P(9.5, 9.7, 3.5, .8, edge);
  if (who !== 'her') P(9.5, 4.9, 3.5, .5, PAL.hairHi);
  // 眉
  const bdy = (ex === 'E5' || ex === 'E6') ? .4 : 0;
  const bw = who === 'her' ? 2.2 : 2.6;
  P(2.5, 6 + bdy, bw, .5, PAL.brow);
  P(9.5 - bw, 6 + bdy, bw, .5, PAL.brow);
  // 眼
  const eyeY = 6.9, ew = who === 'her' ? 2.2 : 2.5, eh = 2;
  const eyes = [[2.6, ew], [9.4 - ew, ew]];
  if (ex === 'E3' || ex === 'E5' || ex === 'E6') {
    for (const [x, w] of eyes) { P(x, eyeY + 1.2, w, .8, edge); P(x + .3, eyeY + 1.8, w * .65, .5, skD); }
  } else if (ex === 'E4') {
    for (const [x, w] of eyes) { P(x - .2, eyeY - .4, w + .5, eh + .8, edge); P(x + .2, eyeY + .2, .8, .8, PAL.goldLit); }
  } else {
    for (const [x, w] of eyes) { P(x, eyeY, w, eh, edge); P(x + .2, eyeY + 2, w * .7, .5, skL); }
  }
  // 鼻 / 嘴
  P(5.6, 9.2, .8, 1.1, skD);
  if (ex === 'E2') P(4.9, 10.4, 2.2, 1, PAL.lip);
  else if (ex === 'E4') P(4.6, 10.3, 2.8, 1.5, PAL.lip);
  else if (ex === 'E3') { P(4.6, 10.5, 1, .6, PAL.lip); P(6.4, 10.5, 1, .6, PAL.lip); P(5.6, 11, .9, .6, PAL.lip); }
  else P(5, 10.5, 2, .5, '#8A5A48');
  // 腮红 / 泪
  if (who === 'her') { P(1.6, 9.2, 1.4, .8, PAL.blush); P(9, 9.2, 1.4, .8, PAL.blush); }
  if (ex === 'E6') { P(9.6, 8.8, .9, 3, PAL.tearC); }
  // 星星发夹
  if (o.star) { P(-1.2, 7, 1, 3, PAL.gold); P(-2, 7.9, 2.6, 1, PAL.gold); P(-1.2, 7.9, 1, 1, '#FFF2C8'); }
}

// ============================================================
//  60 格 rig：stand / sit / lie / crouch / walk
//  x 以中线 0；y = 离地格数（脚底 0，头顶 60）
// ============================================================
function figV4(c, cx, footY, k, o = {}) {
  const G = 2 * k;
  const P = (x, y, w, h, col) => R(c, cx + x * G, footY - (y + h) * G, w * G, h * G, col);
  const who = o.who || 'him';
  const pose = o.pose || 'stand';
  const back = o.view === 'back';
  const C = who === 'her'
    ? { coat: PAL.coatHer, dk: PAL.coatHerDk, lt: '#C0B2DE' }
    : { coat: PAL.coat, dk: PAL.coatDk, lt: PAL.coatLt };

  // ---------- 躺（横躺，头在左）----------
  if (pose === 'lie') {
    const LY = o.dy || 0;
    // 身体（水平条）
    P(-14, 2, 12, 8, C.coat);
    P(-14, 2, 12, 1, C.dk);
    P(-2, 2.5, 5, 7, C.coat);
    P(-2, 2.5, 1, 7, C.dk);
    // 腿
    P(3, 2.5, 11, 3.4, PAL.pants);
    P(3, 6, 11, 3.4, PAL.pants);
    P(13, 2, 3, 2.6, PAL.shoe);
    P(13, 6, 3, 2.6, PAL.shoe);
    // 颈 + 头（脸朝上，仰视）
    P(-15.5, 3, 2, 5, PAL.skin);
    faceV4(c, cx - 15.5 * G, footY - (11 + LY) * G, G, { ...o, back: false });
    // 手臂搭在身侧
    P(-10, 9.6, 9, 2.6, C.coat);
    P(-10, 9.6, 9, .8, C.lt);
    // 手持手机（亮屏光）
    if (o.phone) {
      R(c, cx - 4 * G, footY - 14.5 * G, 5 * G, 3.2 * G, '#0C0F18');
      R(c, cx - 3.6 * G, footY - 14.1 * G, 4.2 * G, 2.4 * G, PAL.cool);
    }
    if (o.light && o.light !== 'none') {
      P(-13, 12.4, 11, .8, o.light === 'cool' ? PAL.cool : PAL.gold);
    }
    return;
  }

  // ---------- 坐 / 蹲：整体下沉 ----------
  const sit = pose === 'sit', crouch = pose === 'crouch';
  const drop = sit ? 13 : (crouch ? 17 : 0);
  const legTop = sit ? 13 : (crouch ? 10 : 27);
  const DY = -drop;

  // ---------- 腿 ----------
  if (sit) {
    // 大腿水平前伸 + 小腿下垂
    P(-7, 12, 13, 3.6, PAL.pants);
    P(-7, 12, 13, 1, PAL.pantsDk);
    P(-6, 6, 4, 7, PAL.pants);
    P(1.5, 6, 4, 7, PAL.pants);
    P(-6.5, 2.5, 5, 3.6, PAL.shoe);
    P(1.5, 2.5, 5, 3.6, PAL.shoe);
    P(-6.5, 4.4, 5, .9, PAL.shoeLt);
    P(1.5, 4.4, 5, .9, PAL.shoeLt);
  } else if (crouch) {
    P(-6, 3, 4.6, 12, PAL.pants);
    P(1.4, 3, 4.6, 12, PAL.pants);
    P(-6, 3, 1.4, 12, PAL.pantsDk);
    P(4.6, 3, 1.4, 12, PAL.pantsDk);
    P(-6.5, .5, 5, 3, PAL.shoe);
    P(1.5, .5, 5, 3, PAL.shoe);
  } else if (pose === 'walk') {
    const ph = (o.phase || 0) & 3;
    const sw = [[3, -3], [1, -1], [-3, 3], [-1, 1]][ph];   // 前后摆
    P(-6, 2.5 + sw[0] * .5, 4.6, 24.5 - Math.abs(sw[0]), PAL.pants);
    P(1.4, 2.5 + sw[1] * .5, 4.6, 24.5 - Math.abs(sw[1]), PAL.pants);
    P(-6, 2.5, 1.4, 22, PAL.pantsDk);
    P(4.6, 2.5, 1.4, 22, PAL.pantsDk);
    P(-6.5 + sw[0] * .6, 0, 5.4, 2.8, PAL.shoe);
    P(1 + sw[1] * .6, 0, 5.4, 2.8, PAL.shoe);
  } else {
    P(-6, 2.5, 5, 24.5, PAL.pants);
    P(1, 2.5, 5, 24.5, PAL.pants);
    P(-6, 2.5, 1.5, 24.5, PAL.pantsDk);
    P(4.5, 2.5, 1.5, 24.5, PAL.pantsDk);
    P(-6.5, 0, 5.5, 2.5, PAL.shoe);
    P(1, 0, 5.5, 2.5, PAL.shoe);
    P(-6.5, 1.4, 5.5, .9, PAL.shoeLt);
    P(1, 1.4, 5.5, .9, PAL.shoeLt);
  }

  // ---------- 躯干 ----------
  const T = DY;                    // 躯干整体偏移
  P(-8, 42 + T, 16, 4, C.coat);
  P(-6.5, 27 + T, 13, 15, C.coat);
  P(-7, 27 + T, 14, 3, C.coat);
  P(-7, 27 + T, 14, 1, C.dk);
  P(-6.5, 28 + T, 1.4, 17, C.dk);
  P(5.4, 28 + T, 1.2, 17, C.lt);

  if (!back) {
    P(-1.4, 40 + T, 2.8, 5, PAL.innerDk);
    P(-3.2, 43.8 + T, 2, 1.4, PAL.shirt);
    P(-2.4, 42.6 + T, 1.8, 1.3, PAL.shirt);
    P(1.2, 43.8 + T, 2, 1.4, PAL.shirt);
    P(.6, 42.6 + T, 1.8, 1.3, PAL.shirt);
    P(-1.4, 44.8 + T, 2.8, .8, PAL.shirt);
    P(-8, 41 + T, 4.2, 1.5, C.dk);
    P(3.8, 42 + T, 4.2, 1.5, C.dk);
    P(-8, 36 + T, 1.4, 5, C.dk);
    P(6.6, 37 + T, 1.4, 5, C.dk);
  } else {
    P(-1, 28 + T, 1.2, 18, C.dk);
    P(-8, 45 + T, 16, 1, C.dk);
  }

  // ---------- 手臂 ----------
  const arm = o.arm || 'pocket';
  if (back) {
    P(-9.5, 28 + T, 2, 14, C.coat);
    P(7.5, 28 + T, 2, 14, C.coat);
  } else if (arm === 'raise') {
    // 抬到一半（停住）
    P(-9.5, 28 + T, 2, 10, C.coat);
    P(-11, 36 + T, 4.5, 2.4, C.coat);
    P(-12, 36.4 + T, 2, 2, PAL.skin);
    P(7.5, 28 + T, 2, 14, C.coat);
  } else if (arm === 'reach') {
    // 前伸（抓空气/伸手）
    P(7.5, 28 + T, 2, 8, C.coat);
    P(7.5, 34 + T, 7, 2.4, C.coat);
    P(14.2, 34.2 + T, 2.4, 2, PAL.skin);
    P(-9.5, 28 + T, 2, 14, C.coat);
  } else if (arm === 'pad') {
    P(7.5, 28 + T, 2, 10, C.coat);
    P(7.5, 36 + T, 6.5, 2.6, C.coat);
    P(13.4, 36.4 + T, 2, 2, PAL.skin);
    P(-9.5, 28 + T, 2, 14, C.coat);
    // 手柄
    const gx = cx + 16 * G, gy = footY - (37 + T) * G;
    R(c, gx, gy, 7 * k, 3 * k, '#1B2436');
    R(c, gx, gy, 7 * k, 1 * k, '#31415E');
    R(c, gx + 1 * k, gy + 1 * k, 1.5 * k, 1.5 * k, '#0E1220');
    R(c, gx + 4.5 * k, gy + 1 * k, 1.5 * k, 1.5 * k, '#0E1220');
    if (o.ledOn) R(c, gx + 6 * k, gy - 1 * k, 1 * k, 1 * k, PAL.red);
  } else if (arm === 'hold') {
    // 双手捧着（看手机/握手柄在胸前）
    P(-9.5, 28 + T, 2, 9, C.coat);
    P(7.5, 28 + T, 2, 9, C.coat);
    P(-5, 33 + T, 11, 2.6, C.coat);
    P(-4, 35 + T, 4, 2, PAL.skin);
    P(1, 35 + T, 4, 2, PAL.skin);
  } else {
    P(-9.5, 28 + T, 2, 14, C.coat);
    P(7.5, 28 + T, 2, 14, C.coat);
    P(-9.5, 27.4 + T, 2, 1, C.dk);
    P(7.5, 27.4 + T, 2, 1, C.dk);
    P(-7.6, 28.4 + T, .6, 13, C.dk);
    P(7.4, 28.4 + T, .6, 13, C.dk);
  }

  // ---------- 脖子 + 头 ----------
  P(-2, 46 + T, 4, 2.4, PAL.skin);
  P(-2, 46 + T, 4, 1, PAL.skinDk);
  faceV4(c, cx - 6 * G, footY - (60 + T) * G, G, { who, ex: o.ex, star: o.star, back });

  // ---------- 金边链（H1）----------
  const lit = o.light == null ? 'gold' : o.light;
  if (lit !== 'none') {
    const fade = o.lightFade == null ? 1 : o.lightFade;
    const g1 = lit === 'cool' ? PAL.cool : PAL.gold;
    const g2 = lit === 'cool' ? '#8FA0C0' : PAL.goldDk;
    const g3 = lit === 'cool' ? '#7D8CA8' : PAL.goldRe;
    const ON = fade > .55, DIM = fade > .22 && fade <= .55;
    if (ON || DIM) {
      const a1 = DIM ? g3 : g1, a2 = DIM ? g3 : g2;
      P(2, 59.2 + T, 4.5, 1.2, a1);
      if (ON) P(3, 59.6 + T, 2.5, .7, lit === 'cool' ? '#EAF0FA' : '#FFF6DA');
      P(6.2, 52 + T, 1, 2.2, a2);
      P(1, 45.2 + T, 8.5, .9, a1);
      P(-4, 45.2 + T, 5, .9, g3);
      P(9.5, 39.4 + T, 1, 4.6, a1);
      P(9.5, 33.4 + T, 1, 5.2, a2);
      P(9.5, 28.2 + T, 1, 4.4, a1);
      if (!sit) {
        P(6, 23.8, 1, 3.8, a1);
        P(6, 19.2, 1, 3.8, a2);
        P(6, 14.2, 1, 4.2, a1);
        P(6, 9.2, 1, 4.2, a2);
        P(6, 3.8, 1, 4.6, a1);
        P(4.4, 1.8, 2, .8, a2);
      }
    }
    if (who === 'her') P(6.6, 30 + T, 1, 8, g3);
  }
}

// 侧脸（俯角/侧向镜用）：只画轮廓 + 一只眼
function figSide(c, cx, footY, k, o = {}) {
  const G = 2 * k;
  const P = (x, y, w, h, col) => R(c, cx + x * G, footY - (y + h) * G, w * G, h * G, col);
  const C = { coat: PAL.coat, dk: PAL.coatDk, lt: PAL.coatLt };
  P(-4, 2.5, 4.6, 24.5, PAL.pants);
  P(-3, 2.5, 1.4, 24.5, PAL.pantsDk);
  P(-4.5, 0, 5, 2.5, PAL.shoe);
  P(-5.5, 27, 11, 15, C.coat);
  P(-5.5, 42, 11, 4, C.coat);
  P(-5.5, 27, 11, 1, C.dk);
  P(3.4, 28, 1.2, 17, C.lt);
  P(-6.5, 28, 1.2, 14, C.coat);
  P(-1.2, 40, 2.4, 5, PAL.innerDk);
  P(-2.6, 43.8, 1.8, 1.3, PAL.shirt);
  P(-2, 42.6, 1.6, 1.2, PAL.shirt);
  P(-8, 41, 3.4, 1.5, C.dk);
  P(-2, 46, 4, 2.4, PAL.skin);
  // 头（侧脸：前额/鼻梁/下巴轮廓）
  P(-3.2, 47, 3.4, 12, PAL.skin);
  P(-4.2, 48, 1.6, 10, PAL.skin);
  P(-1.6, 48, 1.6, 3, PAL.hair);
  P(-4.6, 57, 7, 3.4, PAL.hair);
  P(-4.6, 55, 6, 2.4, PAL.hair);
  P(-5.2, 52, 1.2, 5, PAL.hair);
  P(-4.4, 55.4, 5, .5, PAL.hairHi);
  // 眼 + 眉（侧）
  P(-3, 52.4, 1.6, 1.6, PAL.hairEdge);
  P(-3.2, 54.4, 2, .5, PAL.brow);
  P(-4.8, 51.4, .8, 1.2, PAL.skinDk);
  P(-4.4, 48.6, .5, 2.4, PAL.skinDk);
  // rim
  const lit = o.light === 'none' ? null : (o.light || 'gold');
  if (lit) {
    P(3.5, 55, 3, 1.1, lit === 'cool' ? PAL.cool : PAL.gold);
    P(-6.6, 42, 1, 3, lit === 'cool' ? PAL.cool : PAL.goldDk);
    P(3.4, 38, 1, 3.4, lit === 'cool' ? '#8FA0C0' : PAL.goldRe);
  }
}

// ============================================================
//  场景 1 · room 出租屋
// ============================================================
function sc_room(c, t, o = {}) {
  R(c, 0, 0, 320, 180, '#14172A');
  // 右墙
  R(c, 196, 0, 124, 152, '#101322');
  dith(c, 196, 0, 124, 152, '#101322', '#181C30', .3);
  // 窗（左 2/3），窗台抬到 120（人物可坐）
  const WX = 18, WY = 22, WW = 176, WH = 98;
  R(c, WX - 3, WY - 3, WW + 6, WH + 6, '#0B0E18');
  R(c, WX, WY, WW, WH, '#0A0D16');
  // 窗外楼群
  for (let i = 0; i < 7; i++) {
    const bx = WX + i * 26, bw = 20 + (i * 7) % 12, bh = 26 + (i * 13) % 34;
    R(c, bx, WY + WH - bh, bw, bh, i % 2 ? '#131628' : '#171A2E');
    for (let wy = WY + WH - bh + 4; wy < WY + WH - 4; wy += 9)
      for (let wx = bx + 3; wx < bx + bw - 3; wx += 7)
        if ((wx * 5 + wy * 3) % 9 < 2) R(c, wx, wy, 2, 2, (wx + wy) % 3 ? '#3A3A52' : PAL.amber);
  }
  // 窗外雨痕
  for (let i = 0; i < 26; i++) {
    const rx = WX + (i * 37) % (WW - 8);
    const ry = WY + ((t * 14 + i * 23) % (WH - 16));
    R(c, rx, ry, 1, 3 + (i % 3), '#3E4666');
    R(c, rx, ry + 4, 1, 1, '#5A6288');
  }
  // 窗框十字
  R(c, WX + WW / 2 - 2, WY, 4, WH, '#0B0E18');
  R(c, WX, WY + 44, WW, 4, '#0B0E18');
  R(c, WX, WY, WW, 1, '#2A3050');
  R(c, WX, WY, 1, WH, '#2A3050');
  // 窗台
  R(c, WX - 6, WY + WH, WW + 12, 5, '#1A1E32');
  R(c, WX - 6, WY + WH, WW + 12, 1, '#2E3450');
  // 地板
  R(c, 0, 150, 320, 30, '#1C2036');
  dith(c, 0, 150, 320, 30, '#1C2036', '#12152A', .4);
  // 台灯（右，唯一光源）
  if (o.lamp !== false) {
    const LX = 268, LY = 96;
    R(c, LX - 10, 128, 20, 3, '#0C0F1A');
    R(c, LX - 1, LY, 2, 33, '#0C0F1A');
    R(c, LX - 8, LY - 6, 16, 8, '#0C0F1A');
    R(c, LX - 7, LY - 4, 14, 3, PAL.gold);
    R(c, LX - 4, LY - 4, 8, 3, '#FFF6DA');
    glow(c, LX, LY + 2, 54, 40, PAL.gold, .26);
    lightSpot(c, LX - 30, 140, 66, 22, PAL.goldDk, .5);
  }
  // 床（左下，虚化块）
  if (o.bed !== false) {
    R(c, 0, 120, 58, 30, '#181C2E');
    R(c, 0, 120, 58, 2, '#232840');
  }
  // 桌面水杯
  if (o.cup !== false) {
    R(c, 250, 122, 7, 9, '#2A3050');
    R(c, 251, 123, 5, 2, PAL.goldRe);
  }
  shadeRect(c, 0, 0, 320, 180, .04);
}

// ============================================================
//  场景 2 · street 雨夜街道（ref-2）
// ============================================================
const VX = 160, VY = 112;
const rY = x => x < VX ? 180 - (180 - VY) * x / VX : 180 - (180 - VY) * (320 - x) / (320 - VX);
function sc_street(c, t, o = {}) {
  R(c, 0, 0, 320, VY + 2, '#12111E');
  R(c, 0, 76, 320, 38, '#1A1930');
  dith(c, 0, 72, 320, 8, '#12111E', '#1A1930', .5);
  dith(c, 96, 58, 130, 56, '#12111E', '#222038', .15);
  R(c, 0, VY, 320, 180 - VY, '#2E2C42');
  dith(c, 0, VY, 320, 26, '#2E2C42', '#383651', .5);
  dith(c, 0, VY + 26, 320, 42, '#2E2C42', '#211F33', .55);
  for (let i = 0; i < 22; i++) {
    const y = VY + 5 + (i * 13) % 58, x = 60 + (i * 47) % 200;
    R(c, x, y, 8 + (i * 7) % 14, 1, i % 3 ? '#3C3A56' : '#454265');
  }
  // 左围墙 / 右楼群
  R(c, 0, 96, 118, 56, '#10131F');
  R(c, 0, 96, 118, 1, '#232840');
  for (let x = 6; x < 114; x += 14) if ((x * 3) % 7 < 3) R(c, x, 102, 3, 4, '#1A1E2E');
  R(c, 214, 20, 106, 40, '#262A42');
  R(c, 214, 60, 106, 52, '#20233A');
  R(c, 214, 20, 106, 1, '#3A4062');
  R(c, 214, 60, 106, 1, '#313652');
  R(c, 214, 20, 1, 92, '#161929');
  R(c, 214, 40, 106, 1, '#1B1E30');
  R(c, 214, 82, 106, 1, '#181B2C');
  for (let i = 0; i < 10; i++) {
    const wx = 224 + (i * 29) % 88, wy = 26 + (i * 37) % 80;
    const h = (wx * 13 + wy * 7) % 11;
    if (h < 3) R(c, wx, wy, 4, 5, h === 0 ? PAL.amber : '#5A4A38');
    else if (h === 5) R(c, wx, wy, 4, 5, '#2A2F44');
  }
  R(c, 196, 62, 20, 50, '#0F121C');
  R(c, 120, 96, 26, 16, '#0C0E17');
  R(c, 186, 92, 26, 20, '#0E1019');
  R(c, 144, 78, 2, 34, '#0A0C15');
  R(c, 138, 84, 14, 1, '#0A0C15');
  for (let x = 0; x < 320; x++) if (x % 4 !== 3) R(c, x, Math.round(rY(x)), 1, 1, '#4E4B6A');
  poles(c, 62, 30, 152);
  poles(c, 246, 24, 118);
  wiresV4(c, 10, 15, 5);
  // 路灯
  const LX = o.lampX || 112, LY = o.lampY || 88;
  R(c, LX - 1, LY, 3, 62, '#090C14');
  R(c, LX - 1, LY, 1, 62, '#1A1E2C');
  R(c, LX - 5, LY - 8, 10, 8, '#090C14');
  R(c, LX - 4, LY - 6, 8, 5, PAL.gold);
  R(c, LX - 2, LY - 6, 4, 5, '#FFF6DA');
  glow(c, LX, LY - 3, 34, 22, PAL.gold, .32);
  glow(c, VX, VY, 26, 12, '#3A3450', .25);
  // 4 楼那扇黑窗（SH05 目标）
  if (o.win4) {
    R(c, 226, 30, 12, 14, '#05070D');
    R(c, 226, 30, 12, 1, '#2A3050');
  }
  wetGlow(c, LX - 30, 138, 62, 20, .58);
  if (o.coolRoad) {
    lightSpot(c, LX - 26, 140, 54, 18, '#7D8CA8', .5);
    lightSpot(c, LX - 16, 144, 34, 12, PAL.cool, .45);
  }
  for (let i = 0; i < 16; i++) {
    const x = 100 + (i * 37) % 120, y = 126 + (i * 23) % 46;
    R(c, x, y, 2, 1, i % 3 ? '#3C3A56' : PAL.goldRe);
  }
  if (o.rain !== false) rainCoarse(c, o.frozen ? 0 : t, o.rainN || 110);
  shadeRect(c, 0, 0, 320, 180, .04);
}

// ============================================================
//  场景 3 · gate 车站站台
// ============================================================
function sc_gate(c, t, o = {}) {
  vgrad(c, 0, 0, 320, 180, '#0E111C', '#1B1F30');
  // 顶棚
  R(c, 0, 0, 320, 30, '#0A0D16');
  R(c, 0, 28, 320, 4, '#1A1E32');
  R(c, 0, 30, 320, 1, '#2A3050');
  for (let x = 6; x < 320; x += 42) R(c, x, 0, 3, 30, '#141828');
  // 顶棚滴水
  for (let i = 0; i < 8; i++) {
    const dx = 20 + i * 38, dy = 32 + ((t * 42 + i * 31) % 96);
    R(c, dx, dy, 1, 3, '#3A4266');
  }
  // 支柱
  R(c, 26, 30, 4, 112, '#171B2E');
  R(c, 292, 30, 4, 112, '#171B2E');
  // 大钟（右上）
  R(c, 214, 36, 62, 26, '#0A0D16');
  R(c, 216, 38, 58, 22, '#05070D');
  R(c, 216, 38, 58, 1, '#2A3050');
  // 闸机 ×3
  for (let i = 0; i < 3; i++) {
    const gx = 116 + i * 32;
    R(c, gx, 96, 24, 8, '#3A4062');
    R(c, gx + 1, 104, 22, 34, '#161A2C');
    R(c, gx + 2, 104, 2, 34, '#3A4062');
    R(c, gx + 20, 104, 2, 34, '#3A4062');
    R(c, gx + 4, 100, 3, 3, o.gateLed ? PAL.cyan : '#31415E');
    const wing = o.gateOpen ? 9 : 4;
    R(c, gx + 4, 108, wing, 2, '#4A5170');
    R(c, gx + 18 - wing, 114, wing, 2, '#4A5170');
  }
  // 安全线
  R(c, 0, 132, 320, 3, '#6A5526');
  R(c, 0, 132, 320, 1, PAL.gold);
  // 地面
  R(c, 0, 135, 320, 45, '#232840');
  dith(c, 0, 135, 320, 8, '#232840', '#181C2E', .4);
  // 长椅（左）
  R(c, 22, 126, 52, 5, '#3A4062');
  R(c, 24, 131, 4, 16, '#0E111C');
  R(c, 68, 131, 4, 16, '#0E111C');
  R(c, 22, 126, 52, 1, '#4A5170');
  // 站牌
  R(c, 196, 62, 2, 70, '#2A3050');
  R(c, 190, 62, 14, 9, '#161A2C');
  R(c, 192, 64, 10, 5, '#31415E');
  // 顶灯（一主一辅）
  const L1 = o.lamp1 || 96, L2 = o.lamp2 || 224;
  glow(c, L1, 34, 40, 20, PAL.gold, .26);
  lightSpot(c, L1 - 26, 136, 52, 16, PAL.goldDk, .45);
  glow(c, L2, 34, 32, 16, PAL.gold, .18);
  lightSpot(c, L2 - 20, 138, 40, 12, PAL.goldRe, .3);
  rainCoarse(c, t, 26);
  shadeRect(c, 0, 0, 320, 180, .06);
}

// ============================================================
//  场景 4 · phone 手机（全屏 UI，文字走 HD）
// ============================================================
function sc_phone(c, t, o = {}) {
  R(c, 0, 0, 320, 180, '#07090F');
  dith(c, 0, 0, 320, 180, '#07090F', '#0D1018', .5);
  const PX0 = 96, PY0 = 12, PWd = 128, PHt = 158;
  R(c, PX0 - 2, PY0 - 2, PWd + 4, PHt + 4, '#0A0C14');
  R(c, PX0, PY0, PWd, PHt, '#12151F');
  R(c, PX0, PY0, PWd, 1, '#2A3050');
  // 刘海
  R(c, PX0 + 48, PY0, 32, 4, '#0A0C14');
  // 状态栏
  R(c, PX0, PY0 + 5, PWd, 8, '#0E111A');
  // 屏幕内容区
  R(c, PX0 + 2, PY0 + 15, PWd - 4, PHt - 20, o.bright ? '#1A2030' : '#161B28');
  // 列表条 (o.list) / 对话 (o.chat) / 输入框 (o.input)
  if (o.list) {
    for (let i = 0; i < 5; i++) {
      const ly = PY0 + 22 + i * 16;
      R(c, PX0 + 6, ly, PWd - 12, 13, i === 0 ? '#232A40' : '#1B2130');
      R(c, PX0 + 9, ly + 3, 7, 7, i === 0 ? '#7A4A5C' : '#2A3050');
      if (i === 0 && o.unread) R(c, PX0 + PWd - 16, ly + 4, 6, 4, PAL.red);
    }
  }
  if (o.chat) {
    // 对话气泡（对方灰 / 自己蓝），文字走 HD
    const bubbles = [
      [10, 32, 66, '#232A40'], [72, 48, 46, '#26304A'],
      [10, 64, 54, '#232A40'], [58, 80, 70, '#26304A'],
    ];
    for (const [bx, by, bw, bc] of bubbles) {
      R(c, PX0 + bx, PY0 + by, bw, 11, bc);
      R(c, PX0 + bx, PY0 + by, 1, 11, '#3A4260');
      R(c, PX0 + bx + 2, PY0 + by + 11, 2, 1, '#3A4260');
    }
  }
  if (o.input) {
    const iy = PY0 + PHt - 26;
    R(c, PX0 + 4, iy, PWd - 8, 12, '#232A40');
    R(c, PX0 + 4, iy, PWd - 8, 1, '#3A4062');
    R(c, PX0 + 7, iy + 3, o.inputW || 40, 6, '#4A5170');
  }
  if (o.call) {
    // 语音连接界面：圆头像 + 声波
    const ay = PY0 + 56;
    R(c, PX0 + 52, ay, 24, 24, '#232A40');
    R(c, PX0 + 56, ay + 4, 16, 16, o.fail ? '#4A3038' : '#3A4260');
    for (let i = 0; i < 5; i++) {
      const bh = 3 + ((Math.sin(t * 6 + i) + 1) * 5) | 0;
      R(c, PX0 + 30 + i * 14, ay + 44 - bh / 2, 2, bh, o.fail ? PAL.red : '#5A6288');
    }
  }
  if (o.draft) {
    const dy = PY0 + PHt - 30;
    R(c, PX0 + 4, dy, PWd - 8, 16, '#232A40');
    R(c, PX0 + 7, dy + 5, o.draftW || 60, 5, '#5A6288');
    if (o.sendBtn) R(c, PX0 + PWd - 22, dy + 3, 16, 10, o.sendOn ? '#3A6A7A' : '#2A3050');
  }
  // 屏幕光溢出
  glow(c, PX0 + PWd / 2, PY0 + 10, 90, 60, PAL.cool, .12);
  shadeRect(c, 0, 0, 320, 180, .06);
}

// ============================================================
//  场景 5 · menu CRT 存档界面
// ============================================================
function sc_menu(c, t, o = {}) {
  R(c, 0, 0, 320, 180, '#0A0D16');
  dith(c, 0, 0, 320, 180, '#0A0D16', '#121624', .45);
  const X = 26, Y = 16, Wd = 268, Ht = 148;
  // CRT 外壳
  R(c, X - 6, Y - 6, Wd + 12, Ht + 12, '#161A28');
  R(c, X - 6, Y - 6, Wd + 12, 1, '#2A3050');
  R(c, X, Y, Wd, Ht, o.screenOff ? '#05070D' : '#0E1420');
  if (!o.screenOff) {
    // 扫描线
    for (let y = Y; y < Y + Ht; y += 3) R(c, X, y, Wd, 1, '#131A28');
    // 存档槽 ×3（像素层只留缩略图 + 进度条 + 光标，文字全走 HD）
    for (let i = 0; i < 3; i++) {
      const sy = Y + 22 + i * 38;
      R(c, X + 6, sy, Wd - 12, 32, o.sel === i ? '#1E2740' : '#141B2A');
      R(c, X + 6, sy, Wd - 12, 1, o.sel === i ? '#4A5A88' : '#232A40');
      R(c, X + 10, sy + 4, 40, 24, '#0C1120');
      R(c, X + 10, sy + 4, 40, 1, o.sel === i ? '#3A4A70' : '#1A2236');
      if (o.thumb && o.thumb[i]) o.thumb[i](c, X + 10, sy + 4, 40, 24);
      if (o.progFrom != null && i === 0) {
        const pw = (Wd - 80) * HZ(o.progFrom);
        R(c, X + 60, sy + 26, Wd - 76, 2, '#232A40');
        R(c, X + 60, sy + 26, pw, 2, PAL.cyan);
      }
    }
    // 光标
    if (o.sel != null) R(c, X + 2, Y + 22 + o.sel * 38 + 12, 4, 8, PAL.gold);
  }
  // 屏幕光
  glow(c, 160, 90, 150, 90, PAL.cool, o.screenOff ? .04 : .10);
  shadeRect(c, 0, 0, 320, 180, .05);
}

// ============================================================
//  场景 6 · roof 天台（月光冷白）
// ============================================================
function sc_roof(c, t, o = {}) {
  vgrad(c, 0, 0, 320, 130, '#0C1020', '#1A2038');
  // 云（3 层不规则块，可压境）
  const cover = o.cloud || 0;
  for (let i = 0; i < 3; i++) {
    const yy = 14 + i * 15 - cover * 22;
    for (let x = -20 + i * 26; x < 350; x += 24) {
      const hh = 7 + ((x * 7 + i * 13) % 6);
      const ww = 34 + ((x * 11 + i * 5) % 18);
      R(c, x, yy + cover * 8 + ((x * 3) % 4), ww, hh, i === 0 ? '#181E32' : (i === 1 ? '#1E2438' : '#252C42'));
    }
  }
  // 月
  if (o.moon !== false) {
    R(c, 250, 22, 10, 14, '#DEE6F2');
    R(c, 246, 26, 18, 6, '#DEE6F2');
    R(c, 248, 24, 14, 10, '#DEE6F2');
    R(c, 251, 26, 7, 6, '#F6FAFF');
    R(c, 252, 28, 4, 3, '#FFFFFF');
    glow(c, 254, 30, 56, 40, PAL.cool, .22 - cover * .15);
  }
  // 3 颗金星
  const stars = [[86, 26], [104, 40], [72, 46]];
  for (let i = 0; i < stars.length; i++) {
    const [sx, sy] = stars[i];
    const tw = .55 + .45 * Math.sin(t * 2.2 + i * 2);
    c.save(); c.globalAlpha = tw * (1 - cover * .7);
    R(c, sx - 1, sy, 4, 2, PAL.gold); R(c, sx, sy - 1, 2, 4, PAL.gold);
    R(c, sx, sy, 2, 2, '#FFF6DA');
    c.restore();
  }
  // 远景城市
  for (let i = 0; i < 12; i++) {
    const bx = i * 27, bh = 12 + (i * 11) % 22;
    R(c, bx, 130 - bh, 24, bh, '#0E1220');
    if ((i * 7) % 5 < 2) R(c, bx + 5, 130 - bh + 5, 2, 2, i % 4 ? '#3A3A52' : PAL.amber);
  }
  // 女儿墙
  R(c, 0, 128, 320, 10, '#171B2A');
  R(c, 0, 128, 320, 1, '#2E3450');
  for (let x = 8; x < 320; x += 30) R(c, x, 128, 2, 10, '#0E1220');
  // 天台地面
  R(c, 0, 138, 320, 42, '#1A1E30');
  dith(c, 0, 138, 320, 42, '#1A1E30', '#101420', .45);
  // 水塔（右）
  R(c, 268, 84, 6, 54, '#0E1220');
  R(c, 288, 84, 6, 54, '#0E1220');
  R(c, 256, 62, 50, 24, '#141828');
  R(c, 256, 62, 50, 2, '#2A3050');
  R(c, 262, 44, 38, 10, '#0E1220');
  shadeRect(c, 0, 0, 320, 180, .03 + cover * .12);
}

// ============================================================
//  场景 7 · mirror 镜前
// ============================================================
function sc_mirror(c, t, o = {}) {
  R(c, 0, 0, 320, 180, '#0E1120');
  dith(c, 0, 0, 320, 180, '#0E1120', '#161A2C', .45);
  // 镜框
  const MX = 84, MY = 10, MW = 152, MH = 150;
  R(c, MX - 5, MY - 5, MW + 10, MH + 10, '#1A1E30');
  R(c, MX - 5, MY - 5, MW + 10, 1, '#323A58');
  R(c, MX, MY, MW, MH, '#141A28');
  // 镜面（略亮的反光面）
  R(c, MX + 2, MY + 2, MW - 4, MH - 4, '#1A2234');
  dith(c, MX + 2, MY + 2, MW - 4, MH - 4, '#1A2234', '#242E44', .35);
  // 镜面雾
  if (o.fog) {
    for (let i = 0; i < 40; i++) {
      const fx = MX + 4 + (i * 37) % (MW - 8), fy = MY + 4 + (i * 23) % (MH - 8);
      c.save(); c.globalAlpha = .18 * o.fog; c.fillStyle = '#8A96B4';
      c.fillRect(fx, fy, 6 + (i % 5), 3); c.restore();
    }
  }
  // 裂缝
  if (o.crack) {
    let cxx = MX + MW / 2, cyy = MY + 4;
    for (let i = 0; i < 40; i++) {
      cxx += Math.sin(i * 1.7) * 3;
      cyy += 3.6;
      R(c, cxx, cyy, 1, 2, '#06080E');
      if (i % 7 === 0) R(c, cxx - 2, cyy, 4, 1, '#06080E');
    }
  }
  // 镜前灯（上方，暖白小）
  R(c, 148, 2, 24, 4, '#1E2438');
  R(c, 150, 4, 20, 2, '#F2E8D0');
  glow(c, 160, 8, 70, 34, PAL.goldLit, .16);
  // 地面
  R(c, 0, 158, 320, 22, '#141828');
  dith(c, 0, 158, 320, 22, '#141828', '#0C1018', .4);
  shadeRect(c, 0, 0, 320, 180, .03);
}

// ============================================================
//  场景 8 · white 白房间（过曝）
// ============================================================
function sc_white(c, t, o = {}) {
  R(c, 0, 0, 320, 180, '#E8E4DC');
  R(c, 0, 0, 320, 120, '#F2EEE6');
  dith(c, 0, 96, 320, 30, '#F2EEE6', '#E4E0D8', .5);
  // 墙缝
  R(c, 0, 120, 320, 1, '#D6D2CA');
  // 地板
  R(c, 0, 120, 320, 60, '#DEDAD2');
  dith(c, 0, 120, 320, 60, '#DEDAD2', '#D0CCC4', .45);
  // 桌
  R(c, 30, 108, 96, 5, '#C8C4BC');
  R(c, 36, 113, 4, 24, '#BCB8B0');
  R(c, 116, 113, 4, 24, '#BCB8B0');
  // CRT 显示器
  if (o.crt !== false) {
    R(c, 48, 76, 60, 34, '#B4B0A8');
    R(c, 51, 79, 54, 26, '#8E8A82');
    R(c, 53, 81, 50, 22, o.screenOff ? '#3A3832' : '#4A4840');
    R(c, 60, 112, 12, 4, '#A8A4A0');
  }
  // 椅子
  R(c, 40, 132, 34, 4, '#C0BCB4');
  R(c, 44, 136, 3, 18, '#B4B0A8');
  R(c, 67, 136, 3, 18, '#B4B0A8');
  // 窗格影子
  for (let i = 0; i < 4; i++) R(c, 180 + i * 30, 0, 2, 120, '#E2DED6');
  for (let i = 0; i < 3; i++) R(c, 170, 20 + i * 36, 150, 2, '#E2DED6');
  // 过曝
  c.save(); c.globalAlpha = .10; c.fillStyle = '#FFFDF8'; c.fillRect(0, 0, 320, 180); c.restore();
}

// ============================================================
//  场景 9 · black 黑场
// ============================================================
function sc_black(c, t, o = {}) {
  R(c, 0, 0, 320, 180, '#0A0806');
  if (o.grain) for (let i = 0; i < 60; i++) {
    const gx = (i * 137 + (t * 60 | 0) * 17) % 320, gy = (i * 89) % 180;
    c.save(); c.globalAlpha = .06; c.fillStyle = '#F6E9D2'; c.fillRect(gx, gy, 1, 1); c.restore();
  }
}

// ============================================================
//  场景 10 · cg 过场 CG（紫灰网点点阵底）
// ============================================================
function sc_cg(c, t, o = {}) {
  R(c, 0, 0, 320, 180, '#2A2438');
  dith(c, 0, 0, 320, 180, '#2A2438', '#3A3450', .45);
  // 网点
  for (let y = 0; y < 180; y += 6) for (let x = 0; x < 320; x += 6) {
    if (((x / 6 + y / 6) & 1) === 0) { c.save(); c.globalAlpha = .10; c.fillStyle = '#8A80A8'; c.fillRect(x, y, 1, 1); c.restore(); }
  }
  // 暗角
  shadeRect(c, 0, 0, 320, 180, .12);
}
