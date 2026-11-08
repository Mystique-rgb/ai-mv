// specs/ys_v4.js —《于是》v4「完全复刻」样张
//   图1 人物分镜（复刻 ref-1：雨夜街灯 + 蘑菇头 + 白衬衫领 + 金边链）
//   图2 场景 S3 street（复刻 ref-2：一点透视 + 电线杆 + 面状光斑 + 暖橙窗）
// 规格来源：分镜词 v4 第一/二/三/四节（H1/H2/H3）
if (typeof PAL !== 'undefined') Object.assign(PAL, {
  ink: '#101321', night: '#181B2C', navy: '#232840', slate: '#2E3450',
  rainFar: '#6E688C', rainNear: '#8A86A8',
  gold: '#FFD166', goldDk: '#D8A856', goldRe: '#9C7838', goldLit: '#F2E8D0',
  amber: '#C87C3C',                                  // 暖橙窗（ref-2）
  coat: '#6E86A8', coatDk: '#4C617E', coatLt: '#8AA0BE',
  shirt: '#F2E8D0', innerDk: '#2A2E40',
  pants: '#262B44', pantsDk: '#1A1F33', shoe: '#0C0F18', shoeLt: '#1E2637',
  coatHer: '#A898C8', coatHerDk: '#7C6D9C', innerHer: '#D85870',
  red: '#C8463C', cyan: '#5FD3C4', tearC: '#9AD6C4',
  hair: '#15141A', hairEdge: '#0A0C16', hairHi: '#2C3448', brow: '#2A1F1A',
  // 夜色压暗暖灰肤（ref-1/3，禁亮橙）
  skin: '#C9A382', skinDk: '#A87E62', skinLt: '#E0B896', lip: '#9A6152',
  blush: '#C2737A', cool: '#C9D4E8', cellBg: '#4E4860',
});

const HZ = v => Math.min(1, Math.max(0, v));

function txt(c, s, x, y, size, col, alpha, ls, align) {
  c.save();
  c.globalAlpha = alpha == null ? 1 : alpha;
  c.font = `${size}px XK, KT, serif`;
  c.fillStyle = col; c.textAlign = align || 'left'; c.textBaseline = 'alphabetic';
  const chars = [...s];
  let w = 0; for (const ch of chars) w += c.measureText(ch).width + (ls || 0);
  let cx = align === 'center' ? x - (w - (ls || 0)) / 2 : (align === 'right' ? x - (w - (ls || 0)) : x);
  for (const ch of chars) { const cw = c.measureText(ch).width; c.fillText(ch, cx, y); cx += cw + (ls || 0); }
  c.restore();
}

// ============================================================
//  脸（H1/H3 复刻）：12 格宽 × 12 格高，y 向下
//  0-5 蘑菇头（刘海盖到眉上）· 5.8 眉 · 7.2-9.2 大黑方块眼
//  9.3-10.6 鼻 · 10.6 嘴 · 11-12 下巴
//  全片唯一脸数据：60 格 rig 与特写格共用
// ============================================================
function faceV4(c, ox, oy, u, o = {}) {
  const P = (x, y, w, h, col) => R(c, ox + x * u, oy + y * u, w * u, h * u, col);
  const who = o.who || 'him';
  const ex = o.ex || 'E1';
  const hc = PAL.hair, edge = PAL.hairEdge;
  const sk = PAL.skin, skD = PAL.skinDk, skL = PAL.skinLt;

  // ---------- 后颈发（脖子处，被衣领压）----------
  if (o.back) {
    P(-1.5, -1.5, 15, 10, hc);
    P(-1.5, 8.5, 15, 3, hc);
    P(-1.5, 11.5, 13, 1.5, hc);
    P(-.8, -1, 5, 1, PAL.hairHi);
    P(2, 12.2, 10, .8, edge);
    return;
  }

  // ---------- 蘑菇头 ----------
  P(-1, -1.5, 14, 6.5, hc);            // 发主体 0~5
  P(0, -2, 12, .6, hc);                // 圆弧顶
  P(-1, 4.9, 14, .6, edge);            // 刘海下缘描边
  P(-1, 3, 14, .5, PAL.hairHi);        // 发丝高光（左上）
  P(3, 1, 3, .5, '#1F2436');
  if (who === 'her') {
    // 黑长直：两侧长发垂过肩（包脸发再往下延）
    P(-1.5, 4.6, 3.5, 16, hc);
    P(10, 4.6, 3.5, 16, hc);
    P(-1.5, 19, 3.5, 1.5, edge);
    P(10, 19, 3.5, 1.5, edge);
    P(5, -1.5, 2, 1.6, edge);          // 中分缝
  }

  // ---------- 脸 ----------
  P(1, 3.5, 10, 8.5, sk);              // 裸脸 2~10 宽（H1：只剩中部 8 格）
  P(2, 3, 8, .6, sk);                  // 额头圆角
  P(1, 4, 1.6, 7, skD);                // 左侧暗（光源在右）
  P(2, 11, 8, 1, skD);                 // 下巴

  // ---------- 包脸发（后画，盖住脸缘 → 蘑菇头包脸垂颧骨）----------
  P(-1, 3.5, 2.8, 6.8, hc);            // 左包脸（垂到颧骨 y 10.3）
  P(9.2, 3.5, 2.8, 6.8, hc);           // 右包脸
  P(-1, 9.7, 2.8, .8, edge);
  P(9.2, 9.7, 2.8, .8, edge);
  if (who !== 'her') P(9.2, 4.9, 2.8, .5, PAL.hairHi);  // 右包脸受光缘

  // ---------- 眉（E5/E6 压低；细条贴眼）----------
  const bdy = (ex === 'E5' || ex === 'E6') ? .4 : 0;
  const bw = who === 'her' ? 2.2 : 2.6;
  P(2.4, 6 + bdy, bw, .5, '#3A2A20');
  P(10 - bw, 6 + bdy, bw, .5, '#3A2A20');

  // ---------- 眼（H3：大黑方块 2.5×2，贴眉）----------
  const eyeY = 6.9, ew = who === 'her' ? 2.2 : 2.5, eh = 2;
  const eyes = [[2.5, ew], [10 - ew, ew]];
  if (ex === 'E3' || ex === 'E5' || ex === 'E6') {
    for (const [x, w] of eyes) { P(x, eyeY + 1.2, w, .8, edge); P(x + .3, eyeY + 1.8, w * .65, .5, skD); }
  } else if (ex === 'E4') {
    for (const [x, w] of eyes) {
      P(x - .2, eyeY - .4, w + .5, eh + .8, edge);       // 放大
      P(x + .2, eyeY + .2, .8, .8, PAL.goldLit);
    }
  } else {
    for (const [x, w] of eyes) {
      P(x, eyeY, w, eh, edge);
      P(x + .2, eyeY + 2, w * .7, .5, skL);              // 眼下高光（黑块外下缘）
    }
  }

  // ---------- 鼻 / 嘴 ----------
  P(5.6, 9.2, .8, 1.1, skD);
  if (ex === 'E2') P(4.9, 10.4, 2.2, 1, PAL.lip);        // 欲言：微张
  else if (ex === 'E4') P(4.6, 10.3, 2.8, 1.5, PAL.lip); // 错愕：大张
  else if (ex === 'E3') { P(4.6, 10.5, 1, .6, PAL.lip); P(6.4, 10.5, 1, .6, PAL.lip); P(5.6, 11, .9, .6, PAL.lip); } // 浅笑弧
  else P(5, 10.5, 2, .5, '#8A5A48');

  // ---------- 腮红 / 泪（E6 唯一一次）----------
  if (who === 'her') { P(1.6, 9.2, 1.4, .8, PAL.blush); P(9, 9.2, 1.4, .8, PAL.blush); }
  if (ex === 'E6') { P(9.6, 8.8, .9, 3, PAL.tearC); }

  // ---------- 星星发夹（她，左鬓）----------
  if (o.star) {
    P(-1.2, 7, 1, 3, PAL.gold);
    P(-2, 7.9, 2.6, 1, PAL.gold);
    P(-1.2, 7.9, 1, 1, '#FFF2C8');
  }
}

// ============================================================
//  60 格半写实 rig（1 格 = 像素层 2px；净高 60 格）
//  鞋 0-2.5 · 腿 2.5-27 · 躯干 27-46 · 颈 46-48 · 头 48-60
// ============================================================
function gram(c, cx, footY, k) {
  // 1 格 → 像素层 2px × k
  return (x, y, w, h) => R(c, cx + x * 2 * k, footY - (y + h) * 2 * k, w * 2 * k, h * 2 * k);
}

function figV4(c, cx, footY, k, o = {}) {
  const P = (x, y, w, h, col) => R(c, cx + x * 2 * k, footY - (y + h) * 2 * k, w * 2 * k, h * 2 * k, col);
  const who = o.who || 'him';
  const back = o.view === 'back';
  const C = who === 'her'
    ? { coat: PAL.coatHer, dk: PAL.coatHerDk, lt: '#C0B2DE' }
    : { coat: PAL.coat, dk: PAL.coatDk, lt: PAL.coatLt };

  // ---------- 腿 / 鞋 ----------
  P(-6, 2.5, 5, 24.5, PAL.pants);
  P(1, 2.5, 5, 24.5, PAL.pants);
  P(-6, 2.5, 1.5, 24.5, PAL.pantsDk);
  P(4.5, 2.5, 1.5, 24.5, PAL.pantsDk);
  P(-6.5, 0, 5.5, 2.5, PAL.shoe);
  P(1, 0, 5.5, 2.5, PAL.shoe);
  P(-6.5, 1.4, 5.5, .9, PAL.shoeLt);
  P(1, 1.4, 5.5, .9, PAL.shoeLt);

  // ---------- 躯干（肩 19 / 下摆 14）----------
  P(-8, 42, 16, 4, C.coat);             // 肩 42~46
  P(-6.5, 27, 13, 15, C.coat);          // 胸腰 27~42
  P(-7, 27, 14, 3, C.coat);             // 下摆外扩
  P(-7, 27, 14, 1, C.dk);               // 下摆阴影
  P(-6.5, 28, 1.4, 17, C.dk);           // 左缘暗
  P(5.4, 28, 1.2, 17, C.lt);            // 右缘受光

  // ---------- 领口：白衬衫领两片 + 深色内搭带（H1 复刻）----------
  if (!back) {
    P(-1.4, 40, 2.8, 5, PAL.innerDk);   // 深色内搭竖带
    P(-3.2, 43.8, 2, 1.4, PAL.shirt);   // 左领片（上）
    P(-2.4, 42.6, 1.8, 1.3, PAL.shirt); // 左领片（下斜）
    P(1.2, 43.8, 2, 1.4, PAL.shirt);    // 右领片
    P(.6, 42.6, 1.8, 1.3, PAL.shirt);
    P(-1.4, 44.8, 2.8, .8, PAL.shirt);  // 领圈（在颈下）
    // 夹克大翻领（压住衬衫领外侧）
    P(-8, 41, 4.2, 1.5, C.dk);
    P(3.8, 42, 4.2, 1.5, C.dk);
    P(-8, 36, 1.4, 5, C.dk);
    P(6.6, 37, 1.4, 5, C.dk);
  } else {
    P(-1, 28, 1.2, 18, C.dk);           // 背面中缝
    P(-8, 45, 16, 1, C.dk);             // 后领
  }

  // ---------- 手臂 ----------
  if (back) {
    P(-9.5, 28, 2, 14, C.coat);
    P(7.5, 28, 2, 14, C.coat);
  } else if (o.pad) {
    P(7.5, 28, 2, 10, C.coat);          // 上臂
    P(7.5, 36, 6.5, 2.6, C.coat);       // 前臂横出
    P(13.4, 36.4, 2, 2, PAL.skin);      // 手
    P(-9.5, 28, 2, 14, C.coat);         // 左手插兜
  } else {
    // 双手插兜（ref-1 剪影）
    P(-9.5, 28, 2, 14, C.coat);
    P(7.5, 28, 2, 14, C.coat);
    P(-9.5, 27.4, 2, 1, C.dk);          // 袋口
    P(7.5, 27.4, 2, 1, C.dk);
    P(-7.6, 28.4, .6, 13, C.dk);        // 袖内侧缝
    P(7.4, 28.4, .6, 13, C.dk);
  }

  // ---------- 脖子 ----------
  P(-2, 46, 4, 2.4, PAL.skin);
  P(-2, 46, 4, 1, PAL.skinDk);

  // ---------- 头 ----------
  faceV4(c, cx - 6 * 2 * k, footY - 60 * 2 * k, 2 * k, {
    who, ex: o.ex, star: o.star, back,
  });

  // ---------- 金边链（H1：一条断续链，光源在右后；全部贴身体外缘）----------
  if (o.light !== 'none') {
    const G = (x, y, w, h, col) => P(x, y, w, h, col);
    const g1 = o.light === 'cool' ? PAL.cool : PAL.gold;
    const g2 = o.light === 'cool' ? '#8FA0C0' : PAL.goldDk;
    const g3 = o.light === 'cool' ? '#7D8CA8' : PAL.goldRe;
    // 发顶右上外缘金斑（跨头发上缘）
    G(2, 59.2, 4.5, 1.2, g1);
    G(3, 59.6, 2.5, .7, o.light === 'cool' ? '#EAF0FA' : '#FFF6DA');
    // 右脸缘耳前（贴包脸发右缘）
    G(6.2, 52, 1, 2.2, g2);
    // 右肩线（只右段，ref-1 不横穿胸前）
    G(1, 45.2, 8.5, .9, g1);
    G(-4, 45.2, 5, .9, g3);
    // 右臂外缘 3 段（袖右缘 x=9.5）
    G(9.5, 39.5, 1, 4.2, g1);
    G(9.5, 33.5, 1, 4, g2);
    G(9.5, 28.4, 1, 3.6, g1);
    // 右裤腿外缘 5 段（腿右缘 x=6）
    G(6, 24, 1, 3.4, g1);
    G(6, 19, 1, 3.8, g2);
    G(6, 13.5, 1, 3.8, g1);
    G(6, 8, 1, 3.6, g2);
    G(6, 3, 1, 3, g1);
    // 鞋面金点
    G(4.4, 1.8, 2, .8, g2);
    // 她的侧发外缘
    if (who === 'her') G(6.6, 30, 1, 8, g3);
  } else {
    // 冷白 rim（手机镜）：只勾肩线 + 发顶，细
    P(1.5, 58.6, 4.2, 1, PAL.cool);
    P(-3, 45.4, 12, .7, PAL.cool);
  }

  // ---------- 手柄 ----------
  if (o.pad) {
    const gx = cx + 15 * 2 * k, gy = footY - 36 * 2 * k;
    R(c, gx, gy, 7 * k, 3 * k, '#1B2436');
    R(c, gx, gy, 7 * k, 1 * k, '#31415E');
    R(c, gx + 1 * k, gy + 1 * k, 1.5 * k, 1.5 * k, '#0E1220');
    R(c, gx + 4.5 * k, gy + 1 * k, 1.5 * k, 1.5 * k, '#0E1220');
    R(c, gx + 6 * k, gy - 1 * k, 1 * k, 1 * k, PAL.red);
  }
}

// ============================================================
//  图元：面状光斑（H2 禁竖条光路）/ 粗颗粒雨 / 电线杆
// ============================================================
function lightSpot(c, x, y, w, h, col, k) {
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const dx = (i - w / 2) / (w / 2), dy = (j - h / 2) / (h / 2);
      const r = dx * dx + dy * dy * 1.5;
      const th = (i * 7 + j * 11) % 7 / 7;
      if (r < .62 && th < k) R(c, x + i, y + j, 1, 1, col);
    }
  }
}

function rainCoarse(c, t, n) {
  for (let i = 0; i < n; i++) {
    const s = i * 149.3;
    const bx = ((s * 6.1 + i * 47) % 350) - 14;
    const by = ((s * 2.7 + t * 210 + i * 31) % 215) - 18;
    const skew = Math.round(by * 0.10);
    const len = 3 + (i % 2);
    R(c, bx + skew, by, 1, len, i % 3 ? PAL.rainFar : PAL.rainNear);
    if (i % 5 === 0) R(c, bx + skew, by, 1, 1, '#A6A0C4');
  }
}

function poles(c, x, top, bot) {
  R(c, x, top, 2, bot - top, '#0A0D18');           // 杆
  R(c, x, top, 1, bot - top, '#161A28');
  R(c, x - 7, top + 4, 16, 1, '#0A0D18');          // 横担
  R(c, x - 7, top + 11, 13, 1, '#0A0D18');
  for (let i = 0; i < 3; i++) R(c, x - 6 + i * 6, top + 2.2, 1, 1.6, '#232840');  // 绝缘子
  for (let i = 0; i < 2; i++) R(c, x - 5 + i * 6, top + 9.4, 1, 1.4, '#232840');
}

function wiresV4(c, y0, sag, n) {
  for (let i = 0; i < n; i++) {
    const yy = y0 + i * 5.5;
    for (let x = 0; x < 320; x++) {
      const kk = (x - 150) / 170;
      const dy = Math.round((sag + i * 1.8) * (1 - kk * kk));
      R(c, x, yy + dy, 1, 1, '#07090F');
    }
  }
}

// ============================================================
//  图 1 · 人物分镜背景（ref-1：雨夜街边 + 右后街灯 + 湿地面）
// ============================================================
function sc_ref1(c, t) {
  // 夜底
  R(c, 0, 0, 320, 180, '#171A2C');
  dith(c, 0, 0, 320, 70, '#171A2C', '#12152A', .5);
  // 左侧建筑剪影（避开人物头顶动线）
  R(c, 0, 18, 92, 134, '#131628');
  R(c, 92, 44, 22, 108, '#101322');
  for (let y = 26; y < 150; y += 9) {
    for (let x = 4; x < 88; x += 13) {
      if ((x * 7 + y * 11) % 5 < 2) R(c, x, y, 2, 1, '#1B1F33');
    }
  }
  R(c, 240, 34, 20, 118, '#12152A');
  // 右侧墙
  R(c, 294, 6, 26, 146, '#101322');
  dith(c, 294, 6, 26, 146, '#101322', '#161A2E', .4);
  // 地面（湿）
  R(c, 0, 150, 320, 30, '#1C2036');
  dith(c, 0, 150, 320, 30, '#1C2036', '#12152A', .45);
  // 街灯（右后方，靠近人物）
  const LX = 232, LY = 44;
  R(c, LX - 1.5, LY + 12, 4, 96, '#0C0F1C');       // 杆
  R(c, LX - 1.5, LY + 12, 1.5, 96, '#1E2338');
  R(c, LX - 7, LY + 2, 14, 11, '#0C0F1C');         // 灯罩
  R(c, LX - 6, LY + 4, 12, 3, PAL.gold);
  R(c, LX - 4, LY + 4, 8, 3, '#FFF6DA');
  glow(c, LX, LY + 7, 46, 26, PAL.gold, .30);
  glow(c, LX, LY + 8, 16, 10, '#FFF6DA', .26);
  // 灯下湿地面反光（面状斑群）
  lightSpot(c, LX - 26, 150, 54, 14, PAL.goldDk, .55);
  lightSpot(c, LX - 16, 152, 34, 10, PAL.gold, .45);
  // 人物脚下反光
  lightSpot(c, 104, 160, 58, 14, PAL.goldRe, .5);
  // 雨
  rainCoarse(c, t, 150);
  shadeRect(c, 0, 0, 320, 180, .05);
}

// ============================================================
//  图 2 · 场景 S3 street（ref-2：一点透视 + 电线杆 + 光斑群 + 暖橙窗）
// ============================================================
const VX = 160, VY = 112;
const rY = x => x < VX ? 180 - (180 - VY) * x / VX : 180 - (180 - VY) * (320 - x) / (320 - VX);

function sc_streetV4(c, t) {
  // 天空（大块纯色，噪点极轻）
  R(c, 0, 0, 320, VY + 2, '#12111E');
  R(c, 0, 76, 320, 38, '#1A1930');
  dith(c, 0, 72, 320, 8, '#12111E', '#1A1930', .5);
  dith(c, 96, 58, 130, 56, "#12111E", "#222038", .15);
  // 路面（近处更暗）
  R(c, 0, VY, 320, 180 - VY, '#2E2C42');
  dith(c, 0, VY, 320, 26, '#2E2C42', '#383651', .5);
  dith(c, 0, VY + 26, 320, 42, '#2E2C42', '#211F33', .55);
  // 横向反光条（断续短线，不是通长横线）
  for (let i = 0; i < 22; i++) {
    const y = VY + 5 + (i * 13) % 58;
    const x = 60 + (i * 47) % 200;
    R(c, x, y, 8 + (i * 7) % 14, 1, i % 3 ? '#3C3A56' : '#454265');
  }

  // 左侧低矮围墙 + 右侧楼群（ref-2 构图）
  R(c, 0, 96, 118, 56, '#10131F');
  R(c, 0, 96, 118, 1, '#232840');
  for (let x = 6; x < 114; x += 14) if ((x * 3) % 7 < 3) R(c, x, 102, 3, 4, '#1A1E2E');
  // 右侧近楼（比天空亮两档，加楼层线保证体块可读）
  R(c, 214, 20, 106, 40, '#262A42');
  R(c, 214, 60, 106, 52, '#20233A');
  R(c, 214, 20, 106, 1, '#3A4062');
  R(c, 214, 60, 106, 1, '#313652');
  R(c, 214, 20, 1, 92, '#161929');               // 左缘暗
  R(c, 214, 40, 106, 1, '#1B1E30');              // 楼层线
  R(c, 214, 82, 106, 1, '#181B2C');
  for (let i = 0; i < 10; i++) {
    const wx = 224 + (i * 29) % 88;
    const wy = 26 + (i * 37) % 80;
    const h = (wx * 13 + wy * 7) % 11;
    if (h < 3) R(c, wx, wy, 4, 5, h === 0 ? PAL.amber : '#5A4A38');
    else if (h === 5) R(c, wx, wy, 4, 5, '#2A2F44');
  }
  // 右侧远处楼
  R(c, 196, 62, 20, 50, '#0F121C');
  // 中景房屋（消失点两侧低矮剪影）
  R(c, 120, 96, 26, 16, '#0C0E17');
  R(c, 186, 92, 26, 20, '#0E1019');
  // 中景电线杆剪影
  R(c, 144, 78, 2, 34, '#0A0C15');
  R(c, 138, 84, 14, 1, '#0A0C15');

  // 路缘（断续虚线）
  for (let x = 0; x < 320; x++) if (x % 4 !== 3) R(c, x, Math.round(rY(x)), 1, 1, '#4E4B6A');

  // 电线杆 ×2（左右分布，避开路灯）
  poles(c, 62, 30, 152);
  poles(c, 246, 24, 118);
  // 电线 5 条（垂弧，前景）
  wiresV4(c, 10, 15, 5);

  // 路灯（中左，唯一光源）
  const LX = 112, LY = 88;
  R(c, LX - 1, LY, 3, 62, '#090C14');
  R(c, LX - 1, LY, 1, 62, '#1A1E2C');
  R(c, LX - 5, LY - 8, 10, 8, '#090C14');
  R(c, LX - 4, LY - 6, 8, 5, PAL.gold);
  R(c, LX - 2, LY - 6, 4, 5, '#FFF6DA');
  glow(c, LX, LY - 3, 34, 22, PAL.gold, .32);
  // 消失点雾光
  glow(c, VX, VY, 26, 12, '#3A3450', .25);

  // 灯下光斑群（H2：面状，禁竖条）
  lightSpot(c, LX - 30, 138, 62, 20, PAL.goldDk, .55);
  lightSpot(c, LX - 20, 142, 40, 14, PAL.gold, .5);
  lightSpot(c, LX + 4, 152, 26, 12, PAL.goldRe, .45);
  // 路中央散碎反光（往消失点）
  for (let i = 0; i < 16; i++) {
    const x = 100 + (i * 37) % 120, y = 126 + (i * 23) % 46;
    R(c, x, y, 2, 1, i % 3 ? '#3C3A56' : PAL.goldRe);
  }

  // 雨
  rainCoarse(c, t, 110);
  shadeRect(c, 0, 0, 320, 180, .04);
}

// ============================================================
//  SPEC
// ============================================================
window.SPEC = {
  fps: 24, duration: 5.4,
  grade: 'brightness(1.04) saturate(1.02) contrast(1.08)',

  shots: [
    // ── 图 1 · 人物分镜（ref-1 构图）──
    { t0: 0, t1: 2.6, scene: 'ref1', cam: false, vig: .5,
      in: { type: 'dither', dur: .35 },
      draw(pc, lt) {
        sc_ref1(pc, lt);
        // 人物：中心 130，脚底 172，k=1 → 净高 120px（画面 67%）
        figV4(pc, 130, 172, 1, { who: 'him', ex: 'E1' });
      } },

    // ── 图 2 · 场景 S3（ref-2 构图）──
    { t0: 2.6, t1: 5.4, scene: 'street', cam: false, vig: .55,
      in: { type: 'dither', dur: .4 },
      draw(pc, lt) { sc_streetV4(pc, lt); } },
  ],

  hud(c, W, H, t) {
    const a = Math.min(1, HZ(t - .35));
    const idx = t < 2.6 ? 0 : 1;
    const L = [
      ['人物分镜 · 他', '复刻 ref-1：蘑菇头包脸 · 白衬衫领 · 金边链（发顶→肩线→裤腿→地面斑）'],
      ['场景 S3 · street', '复刻 ref-2：一点透视 · 电线杆 ×2 · 面状光斑群 · 暖橙窗 · 粗颗粒雨'],
    ];
    txt(c, L[idx][0], 66, 88, 40, '#F2E8D0', a, 5);
    txt(c, L[idx][1], 66, 128, 20, 'rgba(150,152,180,.92)', a, 2);
  },
};
