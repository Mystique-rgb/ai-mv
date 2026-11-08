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


// _ys_p2.js —《于是》v4 全片 spec 第二片：43 镜分镜（本文件先做前 30s 的 SH01–SH06）

// ---------- 存档缩略图小画 ----------
function thumbRoom(c, x, y, w, h) {
  R(c, x, y, w, h, '#0E1420');
  R(c, x + 3, y + 4, w * .5, h * .46, '#1A2234');      // 窗
  R(c, x + 3, y + 4, w * .5, 1, '#2E3854');
  R(c, x + 4, y + 6, 5, 6, '#232840');
  R(c, x + w * .62, y + h * .38, 7, 9, '#26204A');     // 台灯
  R(c, x + w * .64, y + h * .35, 4, 3, PAL.gold);
  R(c, x + w * .28, y + h * .6, 12, 11, '#3A4460');    // 人影
  R(c, x + w * .3, y + h * .56, 7, 5, '#2A2036');
}
function thumbPair(c, x, y, w, h) {
  R(c, x, y, w, h, '#3A3450');
  dith(c, x, y, w, h, '#3A3450', '#2A2438', .4);
  R(c, x + 6, y + h * .42, 9, 14, '#6E86A8');
  R(c, x + 7, y + h * .36, 7, 7, '#C9A382');
  R(c, x + 16, y + h * .44, 8, 12, '#A898C8');
  R(c, x + 17, y + h * .38, 6, 6, '#C9A382');
  R(c, x + 18, y + h * .38, 4, 5, '#15141A');
}
function thumbEmpty(c, x, y, w, h) {
  R(c, x, y, w, h, '#0A0D16');
  R(c, x + w / 2 - 2, y + h / 2 - 9, 4, 11, '#2A3050');
  R(c, x + w / 2 - 2, y + h / 2 + 5, 4, 4, '#2A3050');
}

// ---------- SH03 手柄特写（侧视：手柄横放 + 右手拇指压键）----------
function closeupPad(c, lt, o = {}) {
  R(c, 0, 0, 320, 180, '#0A0D16');
  dith(c, 0, 0, 320, 180, '#0A0D16', '#111624', .45);
  // 桌面
  R(c, 0, 150, 320, 30, '#12161F');
  dith(c, 0, 150, 320, 30, '#12161F', '#0B0E16', .4);
  // 屏幕冷光（左上）
  lightSpot(c, 10, 96, 150, 54, '#2A3350', .5);
  glow(c, 40, 30, 90, 60, '#8FA0C0', .10);

  // ---- 手柄机身（横放）----
  const GX = 54, GY = 74, GW = 190, GH = 52;
  R(c, GX, GY + 8, GW, GH - 8, '#1B2436');             // 主体
  R(c, GX + 4, GY, GW - 8, 10, '#232C44');             // 上弧
  R(c, GX + 10, GY - 3, GW - 20, 5, '#232C44');
  R(c, GX + 8, GY - 3, GW - 16, 1, '#3A4460');         // 顶边光
  // 握把（左右）
  R(c, GX - 8, GY + 34, 24, 34, '#161E30');
  R(c, GX + GW - 16, GY + 34, 24, 34, '#161E30');
  R(c, GX - 8, GY + 34, 24, 1, '#2E3854');
  R(c, GX + GW - 16, GY + 34, 24, 1, '#2E3854');
  R(c, GX - 8, GY + 34, 1, 34, '#232C44');
  R(c, GX + GW + 7, GY + 34, 1, 34, '#232C44');
  // 十字键
  R(c, GX + 22, GY + 30, 22, 7, '#0E1220');
  R(c, GX + 29, GY + 22, 8, 23, '#0E1220');
  R(c, GX + 29, GY + 30, 8, 7, '#2E3854');
  R(c, GX + 29, GY + 30, 8, 1, '#3E4A66');
  // 四键
  const kx = GX + 132, ky = GY + 18;
  const keys = [[kx + 12, ky], [kx + 24, ky + 10], [kx, ky + 10], [kx + 12, ky + 20]];
  for (let i = 0; i < 4; i++) {
    const pressed = (i === 1 && o.press);
    R(c, keys[i][0], keys[i][1] + (pressed ? 1 : 0), 9, 9, pressed ? '#5A6A88' : '#2A3348');
    R(c, keys[i][0], keys[i][1], 9, 1, pressed ? '#8A9AB8' : '#3E4A66');
  }
  // 左摇杆
  R(c, GX + 62, GY + 26, 20, 17, '#0E1220');
  R(c, GX + 66, GY + 29, 12, 11, '#262F44');
  R(c, GX + 67, GY + 30, 10, 3, '#3E4A66');
  // 右摇杆
  R(c, GX + 104, GY + 26, 20, 17, '#0E1220');
  R(c, GX + 108, GY + 29, 12, 11, '#262F44');
  R(c, GX + 109, GY + 30, 10, 3, '#3E4A66');
  // LED
  const led = o.ledOn ? PAL.red : '#4A2228';
  R(c, GX + 88, GY + 10, 14, 5, led);
  if (o.ledOn) glow(c, GX + 95, GY + 12, 30, 16, PAL.red, .32);

  // ---- 右手（从右下方伸入，拇指压四键）----
  const SK = PAL.skin, SKD = PAL.skinDk, SKL = PAL.skinLt;
  // 手掌侧面（斜置大块）
  R(c, 226, 44, 62, 78, SK);
  R(c, 240, 40, 48, 10, SK);                            // 掌背隆起
  R(c, 226, 44, 62, 8, SKL);                            // 受光上缘
  R(c, 226, 104, 62, 18, SKD);                          // 掌根暗
  R(c, 226, 44, 8, 78, SKD);
  // 四指（绕到手柄下缘）
  for (let i = 0; i < 4; i++) {
    const fx = 222 - i * 3, fy = 78 + i * 15;
    R(c, fx, fy, 46, 13, i % 2 ? SK : SKL);
    R(c, fx, fy + 11, 46, 3, SKD);
  }
  // 拇指（向左上方伸出，压右侧按键）
  const tp = o.pressK == null ? .45 : o.pressK;
  const tx = 176, ty = 62 + 10 * (1 - tp);
  R(c, tx + 30, ty + 6, 26, 16, SKL);                    // 拇指根
  R(c, tx, ty - 4, 34, 20, SK);                          // 拇指段
  R(c, tx, ty - 4, 34, 6, SKL);
  R(c, tx - 8, ty + 2 + 8 * (1 - tp), 16, 17, SKL);      // 指头
  R(c, tx - 8, ty + 17 + 8 * (1 - tp), 16, 3, SKD);      // 指头下缘
  R(c, tx + 2, ty - 6, 12, 3, '#E8C8A8');                // 指甲
  // 冷白 rim（屏幕光在左上）
  R(c, 240, 38, 48, 2, PAL.cool);
  R(c, 286, 48, 2, 46, '#8FA0C0');
  R(c, GX + 8, GY - 4, GW - 16, 1, '#C9D4E8');
  R(c, GX - 9, GY + 34, 1, 30, '#5A6A88');

  // 拇指压下时的按键反馈光
  if (o.press) {
    glow(c, GX + 140, GY + 30, 26, 20, '#8FA0C0', .22);
  }
  shadeRect(c, 0, 0, 320, 180, .05);
}

// ---------- SH04 窗台坐姿（背影）----------
function drawSeatedHim(c, cx, footY, k, o) {
  const G = 2 * k;
  const P = (x, y, w, h, col) => R(c, cx + x * G, footY - (y + h) * G, w * G, h * G, col);
  const back = o.view === 'back';
  const C = { coat: PAL.coat, dk: PAL.coatDk, lt: PAL.coatLt };
  // 小腿下垂 + 鞋（脚离地一点，悬着）
  P(-5.5, 1, 4.6, 14, PAL.pants);
  P(1, 1, 4.6, 14, PAL.pants);
  P(-5.5, 1, 1.4, 14, PAL.pantsDk);
  P(4.6, 1, 1.4, 14, PAL.pantsDk);
  P(-6, .5, 5.4, 2.6, PAL.shoe);
  P(1, .5, 5.4, 2.6, PAL.shoe);
  // 大腿水平（搭在窗台上）
  P(-7, 14.5, 13.5, 4.2, PAL.pants);
  P(-7, 14.5, 13.5, 1, PAL.pantsDk);
  // 躯干
  P(-8, 30, 16, 4.2, C.coat);
  P(-6.5, 18, 13, 13, C.coat);
  P(-7, 18, 14, 2.4, C.coat);
  P(-6.5, 19, 1.4, 15, C.dk);
  P(5.4, 19, 1.2, 15, C.lt);
  if (back) {
    P(-1, 19, 1.2, 16, C.dk);
    P(-8, 33, 16, 1.2, C.dk);
    P(-8, 30, 16, 1, C.lt);
  } else {
    P(-1.4, 28, 2.8, 5, PAL.innerDk);
    P(-3.2, 31.8, 2, 1.4, PAL.shirt);
    P(-2.4, 30.6, 1.8, 1.3, PAL.shirt);
    P(1.2, 31.8, 2, 1.4, PAL.shirt);
    P(.6, 30.6, 1.8, 1.3, PAL.shirt);
    P(-8, 29, 4.2, 1.5, C.dk);
    P(3.8, 30, 4.2, 1.5, C.dk);
  }
  // 手臂（垂在身侧，手搭大腿）
  P(-9.5, 19, 2, 11, C.coat);
  P(7.5, 19, 2, 11, C.coat);
  P(-9.5, 16, 2.2, 3.4, PAL.skinDk);
  P(7.5, 16, 2.2, 3.4, PAL.skinDk);
  // 颈 + 头（坐姿头位 34~46）
  P(-2, 33, 4, 2.6, PAL.skin);
  faceV4(c, cx - 6 * G, footY - 47 * G, G, { who: 'him', ex: o.ex || 'E5', back });
  // rim（台灯在右）
  P(2, 46.2, 4.5, 1.1, PAL.gold);
  P(1, 33.2, 8.5, .9, PAL.gold);
  P(9.5, 27.5, 1, 4.2, PAL.goldDk);
  P(6, 13.5, 1, 3.6, PAL.goldRe);
  P(4.4, 1.4, 2, .8, PAL.goldRe);
}

// ============================================================
//  前 30s 分镜
// ============================================================
const SHOTS = [
  // ── SH01 标题卡（0–5.5）──
  { t0: 0, t1: 5.5, scene: 'black', cam: false, vig: .62,
    draw(pc, lt) { sc_black(pc, lt, { grain: true }); } },

  // ── SH02 CRT 开机 + 存档槽（5.5–9.5）──
  { t0: 5.5, t1: 9.5, scene: 'menu', cam: false, vig: .5, in: { type: 'blk', dur: .35, hold: .18 },
    draw(pc, lt) {
      const on = lt > .55;
      sc_menu(pc, lt, {
        sel: 0, screenOff: !on,
        thumb: [thumbRoom, thumbEmpty, thumbEmpty],
      });
      if (lt > .3 && lt < .8) {
        const p = (lt - .3) / .5;
        R(pc, 26, 16 + 148 * p - 2, 268, 3, '#C9D4E8');
      }
    } },

  // ── SH03 手柄特写（9.5–13.48）──
  { t0: 9.5, t1: 13.48, scene: 'pad', cam: false, vig: .55, in: { type: 'dither', dur: .28 },
    draw(pc, lt) {
      const press = HZ((lt - 2.1) / .16) * (lt < 3.4 ? 1 : Math.max(0, 1 - (lt - 3.4) / .3));
      const ledOn = lt > .45;
      closeupPad(pc, lt, { press: press > .5, pressK: 1 - press * .5, ledOn });
    } },

  // ── SH04 他坐窗台背影（13.48–21.00）──
  { t0: 13.48, t1: 21.00, scene: 'room', cam: false, vig: .5, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_room(pc, lt, { lamp: true, bed: true, cup: true });
      // 坐在窗台（窗台 y=120，脚 147）
      drawSeatedHim(pc, 96, 147, 1, { view: 'back', ex: 'E1' });
      // 窗台上手柄（暗 LED）
      R(pc, 120, 116, 14, 6, '#1B2436');
      R(pc, 120, 116, 14, 1, '#31415E');
      R(pc, 133, 114, 3, 3, '#4A2228');
      // 手机冷光从下打一点
      lightCone(pc, 96, 146, 8, 20, 14, '#8FA0C0', .14);
    } },

  // ── SH05 雨街：他插兜站光路旁，镜头摇上 4 楼黑窗（21.00–27.88）──
  { t0: 21.00, t1: 27.88, scene: 'street', vig: .54, in: { type: 'dither', dur: .45 },
    cam(lt) {
      const p = HZ(lt / 5.4), e = EZo(p);
      const y = 152 - 118 * e;
      const z = 1 + .6 * e;
      const w = 320 / z, h = 180 / z;
      return [160 - w / 2, y - h * .58, w, h];
    },
    draw(pc, lt) {
      sc_street(pc, lt, { win4: true, lampX: 112 });
      figV4(pc, 120, 178, 1, { who: 'him', ex: 'E1', arm: 'pocket', light: 'gold' });
      const blink = .4 + .6 * Math.abs(Math.sin(lt * 1.2));
      c.save(); c.globalAlpha = blink * .75;
      R(pc, 230, 33, 2, 2, PAL.gold); R(pc, 230, 37, 2, 2, PAL.gold); R(pc, 230, 41, 2, 2, PAL.gold);
      c.restore();
    } },

  // ── SH06 躺地照手机（27.88–34.83；俯拍大脸 + 举手机）──
  { t0: 27.88, t1: 34.83, scene: 'room', cam: false, vig: .58, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      // 地板（俯视）
      R(pc, 0, 0, 320, 180, '#141828');
      dith(pc, 0, 0, 320, 180, '#141828', '#0E1120', .45);
      for (let x = 0; x < 320; x += 22) R(pc, x, 0, 1, 180, '#0F1322');
      for (let y = 0; y < 180; y += 44) R(pc, 0, y, 320, 1, '#0F1322');
      // 肩 + 衣（脸下方，被画面裁）
      R(pc, 96, 136, 132, 44, PAL.coat);
      R(pc, 96, 136, 132, 4, PAL.coatLt);
      R(pc, 140, 136, 44, 18, PAL.innerDk);
      R(pc, 148, 136, 28, 12, PAL.shirt);
      // 大脸（u=6，脸框 12×12 格 = 72px）
      faceV4(pc, 126, 40, 6, { who: 'him', ex: 'E5' });
      // 手机（竖举，压在脸右上，屏幕朝下照脸）
      R(pc, 180, 22, 50, 92, '#0C0F18');
      R(pc, 182, 24, 46, 88, '#141A28');
      R(pc, 184, 26, 42, 82, '#C9D4E8');
      R(pc, 186, 28, 38, 9, '#AFC0DC');
      for (let i = 0; i < 5; i++) R(pc, 188, 42 + i * 13, 18 + (i * 7) % 16, 6, '#8FA0C0');
      // 握住手机的手（右下伸入，掌根 + 拇指）
      const SK = PAL.skin, SKD = PAL.skinDk, SKL = PAL.skinLt;
      R(pc, 198, 108, 42, 54, SK);
      R(pc, 198, 108, 42, 6, SKL);
      R(pc, 198, 108, 6, 54, SKL);
      R(pc, 198, 152, 42, 10, SKD);
      R(pc, 206, 104, 14, 6, '#E8C8A8');      // 指甲
      // 冷白光：屏幕照亮右侧脸
      glow(pc, 200, 64, 62, 56, '#C9D4E8', .26);
      lightCone(pc, 196, 68, 8, 30, 40, '#C9D4E8', .16);
      shadeRect(pc, 0, 0, 320, 180, .03);
    } },

  // ── SH07 窗玻璃时钟快进（34.83–40.89）──
  { t0: 34.83, t1: 40.89, scene: 'room', cam: false, vig: .54, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_room(pc, lt, { lamp: true, bed: false, cup: false });
      // 他用袖子擦出一块玻璃（清出一片看清外面）
      R(pc, 62, 46, 54, 40, '#1A2234');
      dith(pc, 62, 46, 54, 40, '#1A2234', '#242E44', .3);
      // 时钟是"玻璃上的雾被划掉"的效果 → 数字走 HD
    } },

  // ── SH08 天台数星星（40.89–47.88）──
  { t0: 40.89, t1: 47.88, scene: 'roof', cam: false, vig: .5, in: { type: 'dither', dur: .35 },
    draw(pc, lt) {
      sc_roof(pc, lt, { cloud: 0, moon: true });
      figV4(pc, 132, 176, 1, { who: 'him', ex: 'E1', arm: 'pocket', light: 'cool' });
    } },

  // ── SH09 手机列表（47.88–55.14）──
  { t0: 47.88, t1: 55.14, scene: 'phone', cam: false, vig: .5, in: { type: 'dither', dur: .28 },
    draw(pc, lt) {
      sc_phone(pc, lt, { list: true, unread: true });
      // 他的拇指悬停在第一条（HD 里画手指阴影）
    } },

  // ── SH10 打字不发送（55.14–63.19）──
  { t0: 55.14, t1: 63.19, scene: 'phone', cam: false, vig: .5, in: { type: 'dither', dur: .28 },
    draw(pc, lt) {
      const tw = HZ((lt - .6) / 3.2) * 52;
      sc_phone(pc, lt, { chat: true, input: true, inputW: tw });
    } },

  // ── SH11 过场 CG：她贴贴纸（63.19–70.00）──
  { t0: 63.19, t1: 70.00, scene: 'cg', cam: false, vig: .46, in: { type: 'flash', dur: .3, amt: .7 },
    draw(pc, lt) {
      sc_cg(pc, lt);
      // 手机背面大特写
      R(pc, 92, 8, 132, 164, '#0C0F18');
      R(pc, 95, 11, 126, 158, '#1A2032');
      R(pc, 95, 11, 126, 3, '#2A3050');
      R(pc, 95, 11, 3, 158, '#232840');
      R(pc, 218, 11, 3, 158, '#12172A');
      // 摄像头
      R(pc, 104, 22, 34, 24, '#0A0D16');
      R(pc, 108, 26, 11, 11, '#2E3854');
      R(pc, 122, 26, 11, 11, '#2E3854');
      R(pc, 110, 28, 5, 5, '#5A6A88');
      // 星星贴纸
      R(pc, 146, 82, 16, 16, PAL.gold);
      R(pc, 139, 88, 30, 5, PAL.gold);
      R(pc, 142, 86, 5, 5, '#FFF6DA');
      glow(pc, 154, 90, 48, 40, PAL.gold, .32);
      // 食指（右上方伸入，指尖压在贴纸上）
      R(pc, 162, 56, 15, 52, PAL.skinLt);
      R(pc, 162, 56, 15, 3, '#F0D0B0');
      R(pc, 162, 71, 15, 2, PAL.skinDk);
      R(pc, 162, 86, 15, 2, PAL.skinDk);
      R(pc, 162, 101, 15, 7, PAL.skinDk);
      R(pc, 154, 92, 10, 14, PAL.skin);
      R(pc, 155, 95, 7, 4, '#F0D0B0');
      // 拇指（下方托住机身）
      R(pc, 176, 112, 14, 34, PAL.skin);
      R(pc, 176, 112, 14, 3, PAL.skinLt);
      R(pc, 176, 142, 14, 4, PAL.skinDk);
      // 撕贴纸「刺啦」
      if (lt > 4.7) {
        const p = HZ((lt - 4.7) / .55);
        c.save(); c.globalAlpha = .6 * (1 - p);
        R(pc, 146 + p * 30, 82 - p * 16, 16, 16, PAL.gold);
        R(pc, 139 + p * 30, 88 - p * 16, 30, 5, PAL.gold);
        c.restore();
      }
    } },

  // ── SH12 过场 CG：两人并排（70.00–73.20）──
  { t0: 70.00, t1: 73.20, scene: 'cg', cam: false, vig: .46, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_cg(pc, lt);
      figV4(pc, 108, 178, 1, { who: 'him', ex: 'E3', arm: 'pocket', light: 'gold' });
      figV4(pc, 208, 178, 1, { who: 'her', ex: 'E3', arm: 'pocket', light: 'gold', star: true });
    } },

  // ── SH13 她正脸特写（73.20–76.69）──
  { t0: 73.20, t1: 76.69, scene: 'cg', cam: false, vig: .44, in: { type: 'dither', dur: .28 },
    draw(pc, lt) {
      sc_cg(pc, lt);
      // 脖子（在脸下）
      R(pc, 146, 84, 28, 22, PAL.skinDk);
      // 大块正脸（u=6 → 72px 宽）
      faceV4(pc, 124, 20, 6, { who: 'her', ex: 'E3', star: true });
      // 肩与 V 领
      R(pc, 78, 102, 164, 78, PAL.coatHer);
      R(pc, 78, 102, 164, 4, '#C0B2DE');
      R(pc, 78, 102, 5, 78, PAL.coatHerDk);
      R(pc, 237, 102, 5, 78, '#8A7AAA');
      // 玫红 V 领
      R(pc, 134, 102, 52, 9, PAL.innerHer);
      R(pc, 141, 111, 38, 9, PAL.innerHer);
      R(pc, 149, 120, 22, 10, PAL.innerHer);
      // 白衬衫领片
      R(pc, 126, 102, 9, 24, PAL.shirt);
      R(pc, 185, 102, 9, 24, PAL.shirt);
      R(pc, 126, 102, 9, 3, '#FFFFFF');
      R(pc, 185, 102, 9, 3, '#FFFFFF');
    } },

  // ── SH14 存档槽=合影（76.69–83.86）──
  { t0: 76.69, t1: 83.86, scene: 'menu', cam: false, vig: .5, in: { type: 'scan', dur: .4 },
    draw(pc, lt) {
      sc_menu(pc, lt, { sel: 0, thumb: [thumbPair, thumbRoom, thumbEmpty], progFrom: .35 + .5 * HZ(lt / 4) });
    } },

  // ── SH15 闸机回头（83.86–88.22）──
  { t0: 83.86, t1: 88.22, scene: 'gate', cam: false, vig: .52, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_gate(pc, lt, { gateOpen: true, gateLed: true });
      // 她走向闸机，第 1.3 秒回头
      const turn = lt > 1.3 && lt < 2.6;
      figV4(pc, 186, 152, .9, { who: 'her', ex: turn ? 'E3' : 'E1', arm: 'pocket', light: 'gold', star: true, view: turn ? 'front' : 'back' });
      // 他坐长椅，手抬到一半（E4 错愕）
      figV4(pc, 62, 154, .95, { who: 'him', pose: 'sit', ex: 'E4', arm: 'raise', light: 'gold' });
    } },

  // ── SH16 水面倒影（88.22–91.98）──
  { t0: 88.22, t1: 91.98, scene: 'street', cam: false, vig: .56, in: { type: 'fade', dur: .4, col: '#0A0806' },
    draw(pc, lt) {
      sc_street(pc, lt, { lampX: 118 });
      // 水洼
      R(pc, 84, 138, 96, 26, '#232040');
      dith(pc, 84, 138, 96, 26, '#232040', '#2A2748', .4);
      // 倒影（上下翻转的简化人形）
      const ry = 140;
      R(pc, 120, ry, 14, 22, '#4A5A78');
      R(pc, 122, ry + 22, 10, 8, '#3A4460');
      R(pc, 124, ry - 6, 8, 6, '#8A7A8A');
      // 水面波纹
      for (let i = 0; i < 5; i++) R(pc, 88 + i * 18, 146 + ((lt * 8 + i * 5) % 14), 14, 1, '#3A3660');
    } },

  // ── SH17 脚印（91.98–98.52）──
  { t0: 91.98, t1: 98.52, scene: 'street', vig: .54, in: { type: 'dither', dur: .3 },
    cam(lt) { return [40, 108, 240, 135]; },
    draw(pc, lt) {
      sc_street(pc, lt, { lampX: 96, rainN: 90 });
      // 两串脚印 → 中途只剩一串
      for (let i = 0; i < 6; i++) {
        const py = 150 + i * 5, px1 = 104 + i * 6, px2 = 136 + i * 6;
        R(pc, px1, py, 4, 2, '#3A3A56');
        R(pc, px1 + 1, py, 2, 2, PAL.goldRe);
        if (i < 3) { R(pc, px2, py + 2, 4, 2, '#3A3A56'); R(pc, px2 + 1, py + 2, 2, 2, PAL.goldRe); }
      }
    } },

  // ── SH18 长按删除草稿（98.52–105.35）──
  { t0: 98.52, t1: 105.35, scene: 'phone', cam: false, vig: .5, in: { type: 'dither', dur: .28 },
    draw(pc, lt) {
      const hold = lt > 2.4 && lt < 4.2;
      sc_phone(pc, lt, { chat: true, draft: true, draftW: 56, sendBtn: true, sendOn: false });
      // 长按：草稿条被选中
      if (hold) {
        const p = HZ((lt - 2.4) / 1.8);
        R(pc, 100, 138, 120, 18, `rgba(200,70,60,${.15 + p * .3})`);
      }
    } },

  // ── SH19 长椅对空位说话（105.35–112.86）──
  { t0: 105.35, t1: 112.86, scene: 'gate', cam: false, vig: .52, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_gate(pc, lt, { gateOpen: false, lamp1: 84 });
      figV4(pc, 52, 152, .92, { who: 'him', pose: 'sit', ex: 'E2', arm: 'raise', light: 'gold' });
    } },

  // ── SH20 镜子慢半拍（112.86–117.01）──
  { t0: 112.86, t1: 117.01, scene: 'mirror', cam: false, vig: .5, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_mirror(pc, lt, { fog: .35 });
      // 真人（画面左下，E1） + 镜中人（镜内，E5，慢半拍）
      figV4(pc, 62, 176, .82, { who: 'him', ex: 'E1', arm: 'pocket', light: 'gold' });
      figV4(pc, 160, 156, .72, { who: 'him', ex: 'E5', arm: 'pocket', light: 'none' });
    } },

  // ── SH21 镜面裂开（117.01–120.96）──
  { t0: 117.01, t1: 120.96, scene: 'mirror', cam: false, vig: .52, in: { type: 'glitch', dur: .35 },
    draw(pc, lt) {
      sc_mirror(pc, lt, { crack: true, fog: .2 });
      // 裂缝两侧两个他：左 E5、右 E6
      figV4(pc, 116, 150, .74, { who: 'him', ex: 'E5', arm: 'pocket', light: 'none' });
      figV4(pc, 204, 150, .74, { who: 'him', ex: 'E6', arm: 'pocket', light: 'none' });
    } },

  // ── SH22 她的脸浮现在镜中（120.96–124.20）──
  { t0: 120.96, t1: 124.20, scene: 'mirror', cam: false, vig: .52, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      const fog = .3 + .5 * HZ((lt - 2.2) / 1)
      sc_mirror(pc, lt, { fog });
      // 她的脸（浮在镜中，被雾吃掉）
      const a = 1 - HZ((lt - 2.3) / .9) * .7;
      c.save(); c.globalAlpha = a;
      faceV4(pc, 96, 30, 6, { who: 'her', ex: 'E3', star: true });
      c.restore();
      // 他伸手
      figV4(pc, 58, 176, .8, { who: 'him', ex: 'E1', arm: 'reach', light: 'gold' });
    } },

  // ── SH23 读档暴涨（124.20–128.32）──
  { t0: 124.20, t1: 128.32, scene: 'menu', cam: false, vig: .5, in: { type: 'glitch', dur: .3 },
    draw(pc, lt) {
      sc_menu(pc, lt, { sel: 1, thumb: [thumbPair, thumbEmpty, thumbEmpty] });
      // 数字暴涨的机械翻页感：屏幕闪
      if (lt > .8 && lt < 3.2 && Math.floor(lt * 12) % 2 === 0) {
        c.save(); c.globalAlpha = .12; c.fillStyle = '#C9D4E8'; c.fillRect(0, 0, 320, 180); c.restore();
      }
    } },

  // ── SH24 他跑起来（128.32–131.58）──
  { t0: 128.32, t1: 131.58, scene: 'street', vig: .56, in: { type: 'whip', dur: .35, dir: 1 },
    cam(lt) { return [40 + lt * 6, 96, 240, 135]; },
    draw(pc, lt) {
      sc_street(pc, lt, { lampX: 104, rainN: 150 });
      const ph = Math.floor(lt * 8) & 3;
      figV4(pc, 108, 178, 1, { who: 'him', pose: 'walk', phase: ph, ex: 'E1', arm: 'pad', ledOn: true, light: 'gold' });
      // 雨被拉成斜线
      for (let i = 0; i < 18; i++) {
        const x = (i * 31 + lt * 40) % 320, y = (i * 37) % 170;
        R(pc, x, y, 4, 1, PAL.rainNear);
      }
    } },

  // ── SH25 冻帧（131.58–134.86）──
  { t0: 131.58, t1: 134.86, scene: 'street', cam: false, vig: .58, in: { type: 'flash', dur: .2, amt: .5 },
    draw(pc, lt) {
      sc_street(pc, lt, { lampX: 104, frozen: true, rainN: 150 });
      figV4(pc, 108, 178, 1, { who: 'him', pose: 'walk', phase: 2, ex: 'E1', arm: 'pad', ledOn: true, light: 'gold' });
      // 悬停的雨滴（大颗）
      for (let i = 0; i < 26; i++) {
        const x = (i * 47) % 320, y = (i * 71) % 176;
        R(pc, x, y, 1, 4, '#A6A0C4');
      }
      c.save(); c.globalAlpha = .10; c.fillStyle = '#C9D4E8'; c.fillRect(0, 0, 320, 180); c.restore();
    } },

  // ── SH26 语音连接失败（134.86–142.16）──
  { t0: 134.86, t1: 142.16, scene: 'phone', cam: false, vig: .52, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_phone(pc, lt, { call: true, fail: lt > 4.2 });
    } },

  // ── SH27 B1 大钟跳格 + 任务过期（142.16–146.12）──
  { t0: 142.16, t1: 146.12, scene: 'gate', cam: false, vig: .54, in: { type: 'scan', dur: .3 },
    draw(pc, lt) {
      sc_gate(pc, lt, { gateOpen: false, lamp1: 100 });
      // 他入画侧脸（E4 挑眉）1s 后出画
      if (lt < 1.4) {
        figSide(pc, 40 + lt * 10, 176, 1, { ex: 'E4', light: 'gold' });
      }
    } },

  // ── SH28 乌云压境 rim 熄灭（146.12–151.98）──
  { t0: 146.12, t1: 151.98, scene: 'roof', cam: false, vig: .52, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      const cover = HZ((lt - .8) / 4.2);
      sc_roof(pc, lt, { cloud: cover, moon: cover < .8 });
      figV4(pc, 132, 176, 1, {
        who: 'him', ex: 'E5', arm: 'pocket',
        light: 'gold', lightFade: 1 - cover,
      });
    } },

  // ── SH29 同一张沙发，两副表情（151.98–159.24）──
  { t0: 151.98, t1: 159.24, scene: 'cg', cam: false, vig: .46, in: { type: 'dither', dur: .35 },
    draw(pc, lt) {
      sc_cg(pc, lt);
      // 同 SH12 构图，但她那边是空的
      figV4(pc, 108, 178, 1, { who: 'him', ex: 'E1', arm: 'pocket', light: 'gold' });
      // 空位的压痕（一块更暗的地面）
      R(pc, 176, 172, 56, 6, '#221E30');
    } },

  // ── SH30 存档缩略图变 ?（159.24–166.23）──
  { t0: 159.24, t1: 166.23, scene: 'menu', cam: false, vig: .5, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_menu(pc, lt, { sel: 0, thumb: [lt > 3.5 ? thumbEmpty : thumbPair, thumbEmpty, thumbEmpty] });
    } },

  // ── SH31 抓空气（166.23–170.71）──
  { t0: 166.23, t1: 170.71, scene: 'gate', cam: false, vig: .54, in: { type: 'flash', dur: .22, amt: .45 },
    draw(pc, lt) {
      sc_gate(pc, lt, { gateOpen: false, lamp1: 92 });
      const grab = HZ((lt - .5) / .8);
      figV4(pc, 150, 176, 1, { who: 'him', ex: grab > .6 ? 'E6' : 'E1', arm: 'reach', light: 'gold' });
      // 五指收拢的抓握（画在伸出的手位置）
      if (grab > .3) {
        const gy = 176 - 34 * 2 - 4;
        R(pc, 196, gy, 8, 6, PAL.skinLt);
        R(pc, 196, gy + 4, 8, 2, PAL.skinDk);
      }
    } },

  // ── SH32 顶棚水滴极近特写（170.71–174.31）──
  { t0: 170.71, t1: 174.31, scene: 'gate', cam: false, vig: .6, in: { type: 'dither', dur: .26 },
    draw(pc, lt) {
      R(pc, 0, 0, 320, 180, '#0A0D16');
      dith(pc, 0, 0, 320, 180, '#0A0D16', '#141A28', .45);
      // 顶棚边缘（画面上方）
      R(pc, 0, 0, 320, 26, '#161B2C');
      R(pc, 0, 26, 320, 2, '#2A3050');
      // 水滴：汇聚 → 拉长 → 坠落
      const cyc = (lt % 2.2) / 2.2;
      const dy = 30 + cyc * cyc * 90;
      const hh = 6 + cyc * 12;
      R(pc, 158, 28, 4, hh, '#8FA0C0');
      R(pc, 159, 28, 2, hh, '#C9D4E8');
      if (cyc > .55) { R(pc, 158, 30 + dy * .4, 4, 5, '#C9D4E8'); }
      // 地面水花
      if (cyc > .92) {
        R(pc, 152, 150, 16, 2, '#8FA0C0');
        R(pc, 156, 148, 8, 2, '#C9D4E8');
      }
      glow(pc, 160, 60, 40, 60, PAL.cool, .1);
    } },

  // ── SH33 蹲下闪光灯照脚印（174.31–180.59）──
  { t0: 174.31, t1: 180.59, scene: 'street', vig: .58, in: { type: 'dither', dur: .3 },
    cam(lt) { return [32, 96, 256, 144]; },
    draw(pc, lt) {
      sc_street(pc, lt, { lampX: 96, coolRoad: true, rainN: 80 });
      figV4(pc, 128, 178, 1, { who: 'him', pose: 'crouch', ex: 'E1', arm: 'hold', light: 'none' });
      // 手电光柱（白）
      lightCone(pc, 128, 132, 6, 40, 44, '#F2E8F8', .5);
      lightSpot(pc, 100, 148, 56, 18, PAL.cool, .55);
      glow(pc, 128, 142, 60, 40, '#F2E8F8', .22);
    } },

  // ── SH34 打字「星星贴纸我还留着。」（180.59–187.67）──
  { t0: 180.59, t1: 187.67, scene: 'phone', cam: false, vig: .5, in: { type: 'dither', dur: .28 },
    draw(pc, lt) {
      const tw = HZ((lt - .5) / 4.5) * 74;
      sc_phone(pc, lt, { chat: true, draft: true, draftW: tw, sendBtn: true, sendOn: lt > 5.2 });
    } },

  // ── SH35 手柄放长椅（187.67–194.91）──
  { t0: 187.67, t1: 194.91, scene: 'gate', cam: false, vig: .52, in: { type: 'blk', dur: .28, hold: .12 },
    draw(pc, lt) {
      sc_gate(pc, lt, { gateOpen: false, lamp1: 88 });
      // 手柄：前 2 秒在他手里，之后放上长椅 LED 熄灭
      const put = lt > 2.0;
      if (!put) {
        figV4(pc, 60, 152, .92, { who: 'him', pose: 'sit', ex: 'E1', arm: 'pad', ledOn: true, light: 'gold' });
      } else {
        // 他站起来，插兜（ref-1 默认站姿回归）
        figV4(pc, 78, 176, .95, { who: 'him', ex: 'E1', arm: 'pocket', light: 'gold' });
        // 长椅上的手柄（LED 灭）
        R(pc, 40, 122, 14, 6, '#1B2436');
        R(pc, 40, 122, 14, 1, '#31415E');
        R(pc, 52, 120, 3, 3, '#3A2228');
      }
    } },

  // ── SH36 B2 对方已离线（194.91–199.20）──
  { t0: 194.91, t1: 199.20, scene: 'phone', cam: false, vig: .52, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_phone(pc, lt, { list: true, unread: false, bright: false });
    } },

  // ── SH37 镜子完成，镜中人同步（199.20–202.94）──
  { t0: 199.20, t1: 202.94, scene: 'mirror', cam: false, vig: .5, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_mirror(pc, lt, { fog: .12 });
      figV4(pc, 62, 176, .82, { who: 'him', ex: 'E3', arm: 'pocket', light: 'gold' });
      figV4(pc, 160, 156, .72, { who: 'him', ex: 'E3', arm: 'pocket', light: 'none' });
      // 抠贴纸「咝」（手在镜前）
      if (lt > 1.2 && lt < 2.4) {
        R(pc, 150, 96, 8, 8, PAL.gold);
        R(pc, 148, 100, 12, 3, PAL.gold);
      }
    } },

  // ── SH38 存档成功（202.94–207.50）──
  { t0: 202.94, t1: 207.50, scene: 'menu', cam: false, vig: .48, in: { type: 'scan', dur: .32 },
    draw(pc, lt) {
      sc_menu(pc, lt, {
        sel: 0, thumb: [lt > 1.6 ? thumbPair : thumbEmpty, thumbEmpty, thumbEmpty],
        progFrom: HZ((lt - .6) / 1.4),
      });
    } },

  // ── SH39 白房间菜单（207.50–213.00）──
  { t0: 207.50, t1: 213.00, scene: 'white', cam: false, vig: .22, in: { type: 'flash', dur: .4, amt: .9 },
    draw(pc, lt) { sc_white(pc, lt, { crt: true, screenOff: false }); } },

  // ── SH40 光标下移到「退出」（213.00–219.00）──
  { t0: 213.00, t1: 219.00, scene: 'white', cam: false, vig: .22,
    draw(pc, lt) { sc_white(pc, lt, { crt: true, screenOff: false }); } },

  // ── SH41 B3 已过期·无法发送（219.00–224.00）──
  { t0: 219.00, t1: 224.00, scene: 'black', cam: false, vig: .5, in: { type: 'blk', dur: .8, hold: .8 },
    draw(pc, lt) { sc_black(pc, lt, { grain: true }); } },

  // ── SH42 屏幕收线熄灭（224.00–229.00）──
  { t0: 224.00, t1: 229.00, scene: 'menu', cam: false, vig: .5, in: { type: 'dither', dur: .35 },
    draw(pc, lt) {
      const off = lt > 1.6;
      sc_menu(pc, lt, { screenOff: off, sel: null, thumb: [thumbPair, thumbEmpty, thumbEmpty] });
      if (off) {
        // 收线：白线从上下向中间压扁
        const p = HZ((lt - 1.6) / .9);
        const hh = Math.max(1, 148 * (1 - p));
        R(pc, 26, 16 + (148 - hh) / 2, 268, hh, '#C9D4E8');
      }
    } },

  // ── SH43 片名卡（229.00–232.84）──
  { t0: 229.00, t1: 232.84, scene: 'black', cam: false, vig: .58, in: { type: 'fade', dur: .5, col: '#0A0806' },
    draw(pc, lt) { sc_black(pc, lt, { grain: true }); } },
];


// _ys_p3.js —《于是》v4 全片 spec 第三片：HUD + 字幕 + SPEC 组装

// ---------- HD 文字（带字距 + 硬描边）----------
function T(c, s, x, y, size, col, a, ls, align, stroke) {
  c.save();
  c.globalAlpha = a == null ? 1 : a;
  c.font = `${size}px KT, XK, serif`;
  c.textAlign = align || 'left';
  c.textBaseline = 'alphabetic';
  const chars = [...s];
  let w = 0;
  for (const ch of chars) w += c.measureText(ch).width + (ls || 0);
  let cx = align === 'center' ? x - (w - (ls || 0)) / 2 : (align === 'right' ? x - (w - (ls || 0)) : x);
  for (const ch of chars) {
    const cw = c.measureText(ch).width;
    if (stroke) {
      c.fillStyle = stroke;
      for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, -2], [-2, 2], [2, 2]]) {
        c.fillText(ch, cx + dx, y + dy);
      }
    }
    c.fillStyle = col;
    c.fillText(ch, cx, y);
    cx += cw + (ls || 0);
  }
  c.restore();
}

// ---------- 状态词时间线 ----------
const STATE = [
  [5.5, 13.48, '读档', '存档界面 · 21:37'],
  [13.48, 21.00, '读档', '出租屋 · 21:37'],
  [21.00, 27.88, '等待', '楼下 · 21:44'],
  [27.88, 34.83, '失眠', '出租屋 · 04:12'],
  [34.83, 40.89, '失眠', '窗玻璃 · 04:50'],
  [40.89, 47.88, '数星星', '天台 · 05:02'],
  [47.88, 55.14, '查看', '手机 · 05:20'],
  [55.14, 63.19, '欲言又止', '手机 · 05:31'],
  [63.19, 70.00, '回忆', '过场 CG · 08/21'],
  [70.00, 76.69, '回忆', '过场 CG · 08/21'],
  [76.69, 83.86, '读档', '存档界面 · 08/21'],
  [83.86, 88.22, '错愕', '车站 · 20:05'],
  [88.22, 91.98, '沉溺', '雨后 · 20:12'],
  [91.98, 98.52, '回头', '泥泞路 · 20:20'],
  [98.52, 105.35, '删除', '手机 · 20:31'],
  [105.35, 112.86, '求你别走', '车站长椅 · 20:40'],
  [112.86, 120.96, '破碎', '镜子 · 21:10'],
  [120.96, 124.20, '沉溺', '镜子 · 21:12'],
  [124.20, 128.32, '读档', '存档界面 · —'],
  [128.32, 131.58, '奔跑', '雨街 · 21:30'],
  [131.58, 134.86, '冻结', '雨街 · 21:30'],
  [134.86, 142.16, '连接中', '手机 · 21:32'],
  [142.16, 146.12, '错过', '车站 · 21:38'],
  [146.12, 151.98, '乌云', '天台 · 21:40'],
  [151.98, 159.24, '承认', '过场 CG · 08/21'],
  [159.24, 166.23, '存档失败', '存档界面 · —'],
  [166.23, 170.71, '抓不住', '车站 · 21:41'],
  [170.71, 174.31, '雨后', '车站 · 21:42'],
  [174.31, 180.59, '寻找', '泥泞路 · 21:45'],
  [180.59, 187.67, '留着', '手机 · 21:50'],
  [187.67, 194.91, '放下', '车站长椅 · 21:52'],
  [194.91, 199.20, '离线', '手机 · 21:53'],
  [199.20, 202.94, '同步', '镜子 · 22:00'],
  [202.94, 207.50, '存档成功', '存档界面 · 22:01'],
  [207.50, 213.00, '退出', '白房间 · —'],
  [213.00, 219.00, '退出', '白房间 · —'],
  [219.00, 224.00, '过期', '—'],
  [224.00, 229.00, '退出', '白房间 · —'],
  [229.00, 232.84, '于是', '—'],
];
function stateAt(t) {
  for (const s of STATE) if (t >= s[0] && t < s[1]) return s;
  return STATE[STATE.length - 1];
}

// ---------- 字幕（33 行 LRC，行楷，关键词换色）----------
const KY = PAL.gold, RS = PAL.innerHer;
const SUBS = [
  { t0: 13.48, t1: 21.00, text: '窗外下着雨 房间里依然很冷清', kw: ['下着雨', '冷清'] },
  { t0: 21.00, t1: 27.88, text: '等着你出现 从来没改变', kw: ['你', '从来没改变'] },
  { t0: 27.88, t1: 34.83, text: '昨晚想到你 被寂寞包裹的恐惧', kw: ['寂寞', '恐惧'] },
  { t0: 34.83, t1: 40.89, text: '等待黎明 等待深爱的你', kw: ['黎明', '深爱'] },
  { t0: 40.89, t1: 47.88, text: '能不能留下来再陪我数次星星', kw: ['留下来', '星星'] },
  { t0: 47.88, t1: 55.14, text: '能不能别提起念念不忘的他', kw: ['念念不忘'] },
  { t0: 55.14, t1: 63.19, text: '能不能告诉我你这次离开的各种原因', kw: ['离开', '原因'] },
  { t0: 63.19, t1: 70.00, text: '只能和孤独亲密 像小孩想要星星', kw: ['孤独', '小孩', '星星'] },
  { t0: 70.00, t1: 76.69, text: '忘不了你我互相的甜蜜', kw: ['忘不了', '甜蜜'] },
  { t0: 76.69, t1: 83.86, text: '是你给我的最后的记忆', kw: ['最后的记忆'] },
  { t0: 83.86, t1: 88.22, text: '松开的手再抓不紧', kw: ['松开的手', '抓不紧'] },
  { t0: 88.22, t1: 91.98, text: '等雨后等天晴', kw: ['雨后', '天晴'] },
  { t0: 91.98, t1: 98.52, text: '一起走的路都泥泞 沉睡向往的梦境', kw: ['泥泞', '梦境'] },
  { t0: 98.52, t1: 105.35, text: '说来又说去还放不下你', kw: ['放不下'] },
  { t0: 105.35, t1: 112.86, text: '最后再求你求你别离去', kw: ['求你别离去'] },
  { t0: 112.86, t1: 117.01, text: '即便现实都已看清', kw: ['现实'] },
  { t0: 117.01, t1: 120.96, text: '镜子两面我破碎又织起', kw: ['镜子两面', '破碎'] },
  { t0: 120.96, t1: 124.20, text: '倔强的我最后过回了沉溺', kw: ['倔强', '沉溺'] },
  { t0: 124.20, t1: 128.32, text: '渐渐两路模糊我视线', kw: ['模糊', '视线'] },
  { t0: 128.32, t1: 131.58, text: '有一瞬间就将我冻结', kw: ['冻结'] },
  { t0: 131.58, t1: 134.86, text: '重新连接的爱却又只能够妥协', kw: ['重新连接', '妥协'] },
  { t0: 134.86, t1: 142.16, text: '于是我们又错过了时间', kw: ['于是', '错过了时间'] },
  { t0: 142.16, t1: 146.12, text: '乌云密布了整个蓝天', kw: ['乌云密布', '蓝天'] },
  { t0: 146.12, t1: 151.98, text: '忘不了你我互相的甜蜜', kw: ['忘不了', '甜蜜'] },
  { t0: 151.98, t1: 159.24, text: '是你给我的最后的记忆', kw: ['最后的记忆'] },
  { t0: 159.24, t1: 166.23, text: '松开的手再抓不紧', kw: ['松开的手', '抓不紧'] },
  { t0: 166.23, t1: 170.71, text: '等雨后等天晴', kw: ['雨后', '天晴'] },
  { t0: 170.71, t1: 174.31, text: '一起走的路都泥泞 沉睡向往的梦境', kw: ['泥泞', '梦境'] },
  { t0: 174.31, t1: 180.59, text: '说来又说去还放不下你', kw: ['放不下'] },
  { t0: 180.59, t1: 187.67, text: '最后再求你求你别离去', kw: ['求你别离去'] },
  { t0: 187.67, t1: 194.91, text: '即便现实都已看清', kw: ['现实'] },
  { t0: 194.91, t1: 199.20, text: '镜子两面我破碎又织起', kw: ['镜子两面', '破碎'] },
  { t0: 199.20, t1: 232.84, text: '最后我会承认 无法改变结局', kw: ['承认', '无法改变结局'] },
];
// 字幕统一样式：纯字硬描边（不用 RPG 框，避免抢画面），关键词金，字号按字数自适应
SUBS.forEach(s => {
  const n = [...s.text].length;
  s.band = false;
  s.size = n > 15 ? 64 : (n > 12 ? 70 : 78);
  s.y = 968;
  s.accent = PAL.gold;
  s.color = '#F2E8D0';
});

// ============================================================
window.SPEC = {
  fps: 24, duration: 232.84,
  grade: 'brightness(1.04) saturate(1.03) contrast(1.07)',
  fadeIn: .8, fadeOut: 1.2,
  shots: SHOTS,
  subs: SUBS,

  hud(c, W, H, t) {
    // ── SH01 片头标题卡（0–5.5）──
    if (t < 5.5) {
      const a1 = HZ((t - .5) / 1.1), a2 = HZ((t - 1.5) / 1.1), a3 = HZ((t - 2.3) / 1.2);
      const out = t > 4.9 ? 1 - (t - 4.9) / .6 : 1;
      c.save(); c.globalAlpha = .22 * a1 * out; c.strokeStyle = '#F6E9D2'; c.lineWidth = 2;
      c.setLineDash([8, 8]); c.strokeRect(W * .18, H * .30, W * .64, H * .36); c.restore();
      T(c, '第 163 次读档', W / 2, H * .455, 104, '#F6E9D2', a1 * out, 10, 'center', '#0A0806');
      c.save(); c.globalAlpha = .5 * a2 * out; c.fillStyle = PAL.gold;
      c.fillRect(W / 2 - 90, H * .505, 180, 2); c.restore();
      T(c, '2018 · 08 · 21　　21:37', W / 2, H * .565, 36, '#FFD166', a2 * out, 4, 'center', '#0A0806');
      T(c, '他还没学会不读档', W / 2, H * .635, 28, 'rgba(214,204,224,.72)', a3 * out, 8, 'center', '#0A0806');
      T(c, 'PIXEL MV · v4 完全复刻', W - 64, H - 52, 18, 'rgba(180,172,196,.38)', HZ((t - 3) / 1), 2, 'right');
      return;
    }

    // ── SH43 片名卡（229+，独占画面）──
    if (t >= 229) {
      const a1 = HZ((t - 229.5) / 1.1), a2 = HZ((t - 230.4) / 1.2), a3 = HZ((t - 231.1) / 1.2);
      T(c, '于是', W / 2, H * .50, 168, '#F6E9D2', a1, 18, 'center', '#0A0806');
      c.save(); c.globalAlpha = .55 * a2; c.fillStyle = PAL.gold;
      c.fillRect(W / 2 - 70, H * .555, 140, 2); c.restore();
      T(c, '郑润泽　·　2018', W / 2, H * .615, 34, '#FFD166', a2, 6, 'center', '#0A0806');
      T(c, '像素版 MV', W / 2, H * .678, 22, 'rgba(200,194,214,.6)', a3, 10, 'center', '#0A0806');
      return;
    }

    // ── HUD 三件套 ──
    const blackOut = (t >= 219 && t < 224);
    const [st, loc] = stateAt(t).slice(2);
    const fade = t < 6.0 ? HZ((t - 5.5) / .5) : 1;
    if (!blackOut) {
      T(c, '状态', 64, 70, 20, 'rgba(190,186,206,.62)', fade, 4);
      T(c, '[于是]', 108, 70, 20, 'rgba(255,209,102,.9)', fade, 3);
      T(c, st, 64, 104, 30, '#F2E8D0', fade, 5, 'left', '#0A0806');
      T(c, loc, 64, 132, 18, 'rgba(160,168,190,.66)', fade, 2);
      // 读档计数（SH23 暴涨后冻结 ×0163）
      let cnt = '0163';
      if (t >= 124.20 && t < 128.32) {
        const p = HZ((t - 124.9) / 2.4);
        cnt = String(Math.round(44 + (163 - 44) * EZo(p))).padStart(4, '0');
      } else if (t < 70) cnt = '0163';
      T(c, `读档 ×${cnt}`, W - 64, 104, 32, '#FFD166', fade, 3, 'right', '#0A0806');
      T(c, '2018 · 08 · 21　21:37', W - 64, 132, 18, 'rgba(160,168,190,.6)', fade, 2, 'right');
    }

    // ── SH02 存档界面（5.5–9.5）──
    if (t >= 5.5 && t < 9.5 && t > 6.2) {
      const a = HZ((t - 6.2) / .8);
      T(c, '存档槽', 156, 208, 24, '#C9D4E8', a, 6);
      const rows = [['01', '2018 · 08 · 21　21:37', '出租屋 · 读完第 163 次', '▶ 继续'], ['02', '— 空 —', '', ''], ['03', '— 空 —', '', '']];
      rows.forEach((r, i) => {
        const y0 = (38 + i * 38) * 6, ra = a * (i === 0 ? 1 : .40);
        T(c, r[0], 492, y0 + 34, 20, '#FFD166', ra, 2);
        T(c, r[1], 546, y0 + 34, 20, i === 0 ? '#F2E8D0' : 'rgba(150,158,182,.75)', ra, 2);
        if (r[2]) T(c, r[2], 492, y0 + 66, 16, 'rgba(160,168,190,.68)', ra, 1);
        if (r[3]) T(c, r[3], 1608, y0 + 38, 20, '#5FD3C4', ra, 2, 'right');
      });
    }

    // ── SH05 4F 楼号（21–27.88）──
    if (t >= 21.4 && t < 27.88) {
      const a = HZ((t - 21.4) / 1.2) * (t > 27.2 ? .3 : 1);
      T(c, '4F', 1246, 214, 30, '#FFD166', a, 4, 'left', '#0A0806');
      T(c, '她以前住的窗', 1246, 246, 20, 'rgba(210,204,222,.8)', a, 2, 'left', '#0A0806');
      c.save(); c.globalAlpha = a * .55; c.fillStyle = '#FFD166'; c.fillRect(1320, 206, 40, 2); c.restore();
    }

    // ── SH06 手机屏（27.88–34.83）──
    if (t >= 27.88 && t < 34.83) {
      const a = HZ((t - 28.3) / .8) * .9;
      T(c, '04:12', 960, 156, 22, 'rgba(201,212,232,.85)', a, 2, 'center');
      T(c, '聊天 · 他', 960, 264, 18, 'rgba(160,168,190,.6)', a, 2, 'center');
    }

    // ── SH07 窗玻璃时钟快进（34.83–40.89）──
    if (t >= 34.83 && t < 40.89) {
      const p = HZ((t - 35.2) / 5.2);
      let m = 21 * 60 + 37 + Math.round(423 * EZo(p));   // 21:37 → 04:50（跨午夜）
      m = ((m % 1440) + 1440) % 1440;
      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      const mm = String(m % 60).padStart(2, '0');
      const a = HZ((t - 35) / .8);
      // 玻璃上的雾写数字
      T(c, `${hh}:${mm}`, 534, 372, 62, 'rgba(242,232,208,.92)', a, 6, 'center', '#0A0806');
      T(c, '玻璃上的雾', 534, 404, 16, 'rgba(190,194,214,.55)', a, 3, 'center', '#0A0806');
    }

    // ── SH09 手机列表（47.88–55.14）──
    if (t >= 47.88 && t < 55.14) {
      const a = HZ((t - 48.2) / .8);
      T(c, '05:20', 960, 138, 20, 'rgba(201,212,232,.8)', a, 2, 'center');
      T(c, '消息', 606, 190, 22, '#C9D4E8', a, 4);
      const items = [
        ['她', '今天也没有来', '#D85870', 1],
        ['妈', '吃饭了吗', '#3A4260', 0],
        ['阿哲', '上号？', '#3A4260', 0],
        ['天气', '明日有雨', '#3A4260', 0],
        ['备忘录', '（无题）', '#3A4260', 0],
      ];
      items.forEach((r, i) => {
        const y = 204 + i * 96;
        T(c, r[0], 686, y + 30, 26, i === 0 ? '#F2E8D0' : 'rgba(200,204,222,.8)', a * (i ? .62 : 1), 3);
        T(c, r[1], 686, y + 66, 19, i === 0 ? 'rgba(232,85,109,.92)' : 'rgba(150,158,180,.62)', a * (i ? .58 : 1), 1);
        if (r[3]) {
          T(c, '1', 1332, y + 28, 15, '#FFF', a, 0, 'center');
          c.save(); c.globalAlpha = a; c.fillStyle = PAL.red;
          c.beginPath(); c.arc(1330, y + 24, 11, 0, Math.PI * 2); c.fill(); c.restore();
        }
      });
    }

    // ── SH10 打字不发送（55.14–63.19）──
    if (t >= 55.14 && t < 63.19) {
      const a = HZ((t - 55.4) / .6);
      const txt = '你这次……';
      const n = Math.min(txt.length, Math.floor(HZ((t - 55.8) / 2.6) * txt.length));
      T(c, txt.slice(0, n), 606, 892, 22, '#F2E8D0', a, 2);
      if (Math.floor(t * 2) % 2 === 0) { c.save(); c.globalAlpha = a; c.fillStyle = PAL.gold; c.fillRect(606 + n * 24, 872, 3, 24); c.restore(); }
      T(c, '未发送 ×1', 1290, 892, 18, 'rgba(200,70,60,.9)', a, 2, 'right');
    }

    // ── SH11–SH13 / SH22 / SH29 过场 CG 章 ──
    if ((t >= 63.19 && t < 63.19 + 1.4) || (t >= 70.0 && t < 71.2) || (t >= 73.2 && t < 74.2) || (t >= 151.98 && t < 153.2)) {
      T(c, '▶ 过场 CG · 08/21', 64, H - 232, 26, 'rgba(255,209,102,.92)', 1, 4, 'left', '#0A0806');
      c.save(); c.globalAlpha = .4; c.fillStyle = PAL.gold; c.fillRect(64, H - 214, 250, 1); c.restore();
    }

    // ── SH14/SH23/SH30/SH38 存档界面 ──
    const menuWin = [[76.69, 83.86], [124.20, 128.32], [159.24, 166.23], [202.94, 207.50]];
    const inMenu = menuWin.some(([a0, a1]) => t >= a0 && t < a1);
    if (inMenu) {
      const a = .95;
      T(c, '存档槽', 156, 208, 24, '#C9D4E8', a, 6);
      let l1 = '2018 · 08 · 21　21:37', l2 = '出租屋 · 读完第 163 次', l3 = '▶ 继续';
      if (t >= 159.24 && t < 166.23 && t > 162.7) { l1 = '???'; l2 = '缩略图已损坏'; l3 = '存档失败'; }
      if (t >= 202.94) { l1 = '2018 · 08 · 21　21:37'; l2 = '出租屋 · 存档完成'; l3 = '存档成功'; }
      T(c, '01', 492, 262, 20, '#FFD166', a, 2);
      T(c, l1, 546, 262, 20, '#F2E8D0', a, 2);
      T(c, l2, 492, 300, 16, 'rgba(160,168,190,.7)', a, 1);
      T(c, l3, 1608, 264, 20, t >= 159.24 && t < 166.23 && t > 162.7 ? '#C8463C' : '#5FD3C4', a, 2, 'right');
      T(c, '02', 492, 490, 20, '#FFD166', .4, 2);
      T(c, '— 空 —', 546, 490, 20, 'rgba(150,158,182,.7)', .4, 2);
      T(c, '03', 492, 718, 20, '#FFD166', .4, 2);
      T(c, '— 空 —', 546, 718, 20, 'rgba(150,158,182,.7)', .4, 2);
      if (t >= 124.20 && t < 128.32) {
        const p = HZ((t - 124.9) / 2.4);
        T(c, `×${String(Math.round(44 + 119 * EZo(p))).padStart(4, '0')}`, 1250, 700, 54, '#FFD166', 1, 3, 'right', '#0A0806');
      }
    }

    // ── SH18 长按删除（98.52–105.35）──
    if (t >= 98.52 && t < 105.35) {
      const a = HZ((t - 98.9) / .7);
      T(c, '20:31', 960, 138, 20, 'rgba(201,212,232,.8)', a, 2, 'center');
      T(c, '草稿 · 你这次……', 606, 880, 20, 'rgba(200,204,222,.85)', a, 2);
      if (t > 100.9 && t < 102.9) {
        T(c, '删除草稿？', 960, 560, 34, '#F2E8D0', HZ((t - 100.9) / .4), 6, 'center', '#0A0806');
        T(c, '长按删除', 960, 620, 20, 'rgba(200,70,60,.9)', HZ((t - 100.9) / .4), 4, 'center');
      }
      if (t >= 102.9 && t < 104.4) {
        T(c, '已删除', 960, 580, 30, 'rgba(160,168,190,.8)', HZ((t - 102.9) / .4) * (1 - HZ((t - 103.9) / .5)), 6, 'center');
      }
    }

    // ── SH19 RPG 对话框「别再走了。」（105.35–112.86）──
    if (t >= 105.35 && t < 112.86) {
      const p = HZ((t - 106.4) / 1.2);
      if (p > 0) {
        const bx = W * .22, by = H * .62, bw = W * .56, bh = 150;
        c.save(); c.globalAlpha = .95;
        c.fillStyle = '#F0D3AC'; c.fillRect(bx, by, bw, bh);
        c.fillStyle = 'rgba(12,8,9,.92)'; c.fillRect(bx + 6, by + 6, bw - 12, bh - 12);
        c.strokeStyle = 'rgba(255,195,92,.34)'; c.lineWidth = 2; c.strokeRect(bx + 15, by + 15, bw - 30, bh - 30);
        c.fillStyle = '#120C0E';
        c.fillRect(bx, by, 10, 10); c.fillRect(bx + bw - 10, by, 10, 10);
        c.fillRect(bx, by + bh - 10, 10, 10); c.fillRect(bx + bw - 10, by + bh - 10, 10, 10);
        c.restore();
        const n = Math.min(5, Math.floor(p * 5.4));
        T(c, '▶ ' + '别再走了。'.slice(0, n), bx + 52, by + 96, 40, '#F2E8D0', 1, 4);
      }
    }

    // ── SH26 语音连接失败（134.86–142.16）──
    if (t >= 134.86 && t < 142.16) {
      const fail = t > 139.0;
      T(c, fail ? '连接失败' : '连接中…', 960, 420, 34, fail ? '#C8463C' : 'rgba(201,212,232,.9)', 1, 5, 'center', '#0A0806');
      if (fail) T(c, '重新连接的爱 又只能够妥协', 960, 480, 20, 'rgba(200,204,222,.6)', HZ((t - 139.2) / .6), 3, 'center');
    }

    // ── SH27 B1 大钟跳格 + 任务过期（142.16–146.12）──
    if (t >= 142.16 && t < 146.12) {
      const jump = t > 143.4;
      T(c, jump ? '21:38' : '21:37', 1452, 300, 44, jump ? '#C8463C' : '#F2E8D0', 1, 3, 'center', '#0A0806');
      // 任务栏
      const ty = 176;
      T(c, '任务', 64, ty, 18, 'rgba(190,186,206,.6)', 1, 4);
      if (!jump) T(c, '等她上线', 140, ty, 22, '#F2E8D0', 1, 3);
      else {
        T(c, '等她上线', 140, ty, 22, 'rgba(200,70,60,.55)', 1, 3);
        c.save(); c.globalAlpha = .9; c.fillStyle = '#C8463C';
        c.fillRect(138, ty - 10, 108, 2); c.restore();
        T(c, '任务已过期', 260, ty, 20, '#C8463C', HZ((t - 143.6) / .5), 3);
      }
    }

    // ── SH32 无文字 ──

    // ── SH34 打字「星星贴纸我还留着。」（180.59–187.67）──
    if (t >= 180.59 && t < 187.67) {
      const a = HZ((t - 180.9) / .6);
      const txt = '星星贴纸我还留着。';
      const n = Math.min(txt.length, Math.floor(HZ((t - 181.3) / 4.2) * txt.length));
      T(c, txt.slice(0, n), 606, 892, 22, '#F2E8D0', a, 2);
      if (Math.floor(t * 2) % 2 === 0) { c.save(); c.globalAlpha = a; c.fillStyle = PAL.gold; c.fillRect(606 + n * 26, 872, 3, 24); c.restore(); }
      if (t > 186.0) T(c, '停在发送 · 2.5s', 960, 760, 18, 'rgba(255,209,102,.7)', HZ((t - 186) / .4), 3, 'center');
    }

    // ── SH35 手柄放长椅（187.67–194.91）──
    if (t >= 187.67 && t < 194.91 && t > 189.6) {
      T(c, '手柄留在这里', 320, 700, 20, 'rgba(200,204,222,.72)', HZ((t - 189.6) / .6), 3);
      T(c, '他学会不带着它走', 320, 736, 18, 'rgba(255,209,102,.6)', HZ((t - 190.2) / .6), 2);
    }

    // ── SH36 B2 对方已离线（194.91–199.20）──
    if (t >= 194.91 && t < 199.20) {
      const a = HZ((t - 195.3) / .7);
      T(c, '21:53', 960, 138, 20, 'rgba(201,212,232,.8)', a, 2, 'center');
      T(c, '对方已离线', 960, 520, 40, '#C8463C', HZ((t - 196.2) / .6), 6, 'center', '#0A0806');
      T(c, '· 2018 ·', 960, 578, 24, 'rgba(180,184,206,.7)', HZ((t - 196.8) / .6), 6, 'center');
      T(c, '草稿已淡出', 960, 640, 18, 'rgba(160,168,190,.55)', HZ((t - 197.6) / .6), 3, 'center');
    }

    // ── SH39/SH40 白房间菜单（207.50–219.00）──
    if (t >= 207.50 && t < 219.00) {
      const a = HZ((t - 208.0) / .8);
      const items = ['继续游戏', '读取存档', '设置', '退出'];
      // 光标：207.5–213 停在「继续游戏」，213–219 下移到「退出」并停 3s
      let sel = 0;
      if (t >= 213) sel = t < 215.2 ? Math.min(3, Math.floor((t - 213) / .55)) : 3;
      T(c, '菜单', 1200, 240, 26, 'rgba(40,36,32,.75)', a, 6);
      items.forEach((s, i) => {
        const y = 330 + i * 92;
        const on = i === sel;
        T(c, on ? '▶' : '　', 1120, y, 30, 'rgba(30,26,24,.9)', a, 0);
        T(c, s, 1180, y, 40, on ? 'rgba(24,20,18,.92)' : 'rgba(60,56,52,.5)', a, 4);
        if (on) {
          c.save(); c.globalAlpha = a * .5; c.fillStyle = 'rgba(30,26,24,.5)';
          c.fillRect(1170, y + 12, 190, 2); c.restore();
        }
      });
      if (t >= 215.8) T(c, '他选了「退出」', 960, 800, 22, 'rgba(40,36,32,.6)', HZ((t - 215.8) / .6), 4, 'center');
    }

    // ── SH41 B3 已过期·无法发送（219–224）──
    if (t >= 219 && t < 224) {
      const a = HZ((t - 220.6) / .7);
      T(c, '已过期 · 无法发送', W / 2, H * .50, 62, 'rgba(150,150,158,.85)', a, 8, 'center', '#0A0806');
      T(c, '未发送 ×1', W / 2, H * .58, 26, 'rgba(120,120,128,.6)', HZ((t - 221.4) / .7), 4, 'center');
    }

    // ── SH42 屏幕收线熄灭（224–229）──
    if (t >= 224 && t < 229) {
      const a = HZ((t - 224.6) / .6);
      T(c, '第 164 次，他没有读档。', W / 2, H * .52, 34, 'rgba(214,208,224,.8)', a, 5, 'center', '#0A0806');
    }
  },
};
})();
