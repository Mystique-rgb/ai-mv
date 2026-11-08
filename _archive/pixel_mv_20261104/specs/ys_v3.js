// specs/ys_v3.js —《于是》v3「金边像素」裁定样张
//   图1 他（56px 半写实 rig · 插兜站姿 · 路灯光金边）
//   图2 她（56px rig · 星星发夹 + 12×14 大块正脸）
//   图3 场景 S3 street（一点透视 · 路灯 · 灯下金光路 · 电线 · 紫灰雨）
// 依据：分镜词 v3 第一/二/三/四/七节
if (typeof PAL !== 'undefined') Object.assign(PAL, {
  ink: '#101321', night: '#181B2C', navy: '#232840', slate: '#2E3450',
  rainFar: '#6E688C', rainNear: '#8E86B0',
  gold: '#FFD166', goldDk: '#D8A856', goldRe: '#9C7838', goldLit: '#F2E8D0',
  coatHim: '#6E86A8', innerHim: '#F2E8D0', pants: '#1A1D2C', shoe: '#0F1420',
  coatHer: '#A898C8', innerHer: '#D85870',
  red: '#C8463C', cyan: '#5FD3C4',
  hair: '#15141A', hairEdge: '#0A0C16', hairHi: '#2C3448',
  skin: '#E8B590', skinMid: '#D9A078', skinDk: '#B8825F',
  lip: '#9A6152', blush: '#D97A82', cool: '#C9D4E8',
});

const HZ = v => Math.min(1, Math.max(0, v));

// ---------- HD 文字 ----------
function txt(c, s, x, y, size, col, alpha, ls, align) {
  c.save();
  c.globalAlpha = alpha == null ? 1 : alpha;
  c.font = `${size}px XK, KT, serif`;
  c.fillStyle = col;
  c.textAlign = align || 'left';
  c.textBaseline = 'alphabetic';
  const chars = [...s];
  let w = 0; for (const ch of chars) w += c.measureText(ch).width + (ls || 0);
  let cx = align === 'center' ? x - (w - (ls || 0)) / 2 : (align === 'right' ? x - (w - (ls || 0)) : x);
  for (const ch of chars) { const cw = c.measureText(ch).width; c.fillText(ch, cx, y); cx += cw + (ls || 0); }
  c.restore();
}

// ============================================================
//  脸：全片唯一一份脸数据（G1 硬约束 6）
//  原点 = 脸框左上角；脸框 12 宽 × 11 高；u = 1 脸的 1px 在屏幕上的尺寸
//  脸的 y 向下：0 发际线上沿 / 3 眉 / 4.6 眼 / 6.6 鼻 / 8.6 唇 / 11 下巴
// ============================================================
function facePx(c, ox, oy, u, o = {}) {
  const P = (x, y, w, h, col) => R(c, ox + x * u, oy + y * u, w * u, h * u, col);
  const who = o.who || 'him';
  const hair = PAL.hair, edge = PAL.hairEdge;
  const skin = PAL.skin, skM = PAL.skinMid, skD = PAL.skinDk;

  // ---------- 头发（后层，先画，脸盖上去）----------
  if (o.back) {
    P(-1.5, -4.5, 15, 12, hair);
    P(-1.5, 7.5, 15, 2, hair);
    P(-1.5, 9.5, 13, 2.5, hair);
    P(-1.8, 9.5, 1.6, 4, hair);
    P(12.2, 9.5, 1.6, 4, hair);
    P(-.8, -3.4, 4.5, 1.2, PAL.hairHi);  // 后脑高光（左上）
    P(1.5, 10.8, 10, .8, edge);
    return;
  }
  // 顶发（加厚到 7px：盖住脸框上方 + 压到眉上缘）
  P(-1, -4.5, 14, 7, hair);              // 顶发 -4.5~2.5
  P(0, -5, 12, .5, hair);                // 发顶圆角
  P(-1, 2.1, 3.6, 1.2, hair);            // 左刘海尖
  P(9.4, 2.1, 3.6, 1.2, hair);           // 右刘海尖
  P(-1, 2.5, 14, .7, edge);              // 刘海下缘描边
  if (who === 'her') {
    P(-1.5, 2, 3, 15, hair);             // 左长直发（垂到肩）
    P(10.5, 2, 3, 15, hair);
    P(-1.5, 15, 3, 2, edge);
    P(10.5, 15, 3, 2, edge);
    P(5, -4.5, 2.2, 2, edge);            // 中分缝
    P(-.6, -3.6, 2.6, .9, PAL.hairHi);   // 发丝高光
  } else {
    P(-1, 2.5, 2.6, 5.5, hair);          // 左鬓（加宽包脸）
    P(10.4, 2.5, 2.6, 5.5, hair);        // 右鬓
    P(-.4, -3.4, 2.6, .8, PAL.hairHi);
  }

  // ---------- 脸 ----------
  P(0, 1, 12, 10, skin);
  P(1, 0, 10, 1, skin);                  // 顶圆角
  P(0, 1, 1, 9, skM);                    // 受光侧在右，左侧影
  P(1, 10, 10, 1, skM);                  // 下巴
  P(2.4, 10.6, 7, .5, skD);

  // ---------- 眉（表情主驱动 G7）----------
  const bw = who === 'her' ? 2.2 : 2.8;
  const bdy = { flat: 0, up: -.6, down: .6, knit: .3 }[o.brow || 'flat'];
  P(1.2, 3.5 + bdy, bw, .65, edge);
  P(10.8 - bw, 3.5 + bdy, bw, .65, edge);
  if (o.brow === 'knit') { P(1.7, 3.9 + bdy, 1.3, .6, edge); P(9.2, 3.9 + bdy, 1.3, .6, edge); }

  // ---------- 眼 ----------
  const ey = [[1.7, 2.6], [7.9, 2.6]];
  if (o.eyes === 'closed') {
    for (const [x, w] of ey) P(x, 5.6, w, .8, edge);
  } else if (o.eyes === 'half') {
    for (const [x, w] of ey) { P(x, 5.2, w, .9, edge); P(x, 6.1, w, .6, skM); }
  } else {
    for (const [x, w] of ey) {
      P(x, 4.8, w, 1.9, edge);
      P(x + .3, 5.1, .8, .8, PAL.goldLit);  // 高光
      P(x, 6.5, w, .4, skD);                // 下眼睑
    }
  }

  // ---------- 鼻影 / 唇 ----------
  P(5.8, 6.9, .8, 1.4, skD);
  if (o.mouth === 'open') P(5.2, 8.3, 1.7, 1.1, PAL.lip);
  else if (o.mouth === 'smile') { P(4.6, 8.7, .9, .6, PAL.lip); P(5.5, 9, 1.2, .7, PAL.lip); P(6.7, 8.7, .9, .6, PAL.lip); }
  else P(5.2, 8.7, 1.7, .7, PAL.lip);

  // ---------- 腮红 / 泪 ----------
  if (who === 'her') { P(.4, 7.1, 1.6, .9, PAL.blush); P(9.6, 7.1, 1.6, .9, PAL.blush); }
  if (o.tear) { P(2.1, 6.8, .8, 3.2, PAL.cyan); }

  // ---------- 星星发夹（贴左鬓发）----------
  if (o.star) {
    P(-.5, 4.4, .9, 2.6, PAL.gold);
    P(-1.2, 5.2, 2.4, .9, PAL.gold);
    P(-.5, 5.2, .9, .9, '#FFF2C8');
  }
}

// ============================================================
//  56px 半写实 rig（2px 主网格 / 1px 细节）
//  x 以中线 0；y = 离地高度（脚底 0，头顶 56）
//  骨架：鞋 0-3 · 腿 3-21 · 躯干 21-40 · 颈 40-42 · 头 42-56
// ============================================================
function figRim(c, cx, footY, S, o = {}) {
  const P = (x, y, w, h, col) => R(c, cx + x * S, footY - (y + h) * S, w * S, h * S, col);
  const who = o.who || 'him';
  const lit = o.light || 'gold';
  const back = o.view === 'back';
  const C = who === 'her'
    ? { coat: PAL.coatHer, coatDk: '#7C6D9C', inner: PAL.innerHer, pants: '#22263A' }
    : { coat: PAL.coatHim, coatDk: '#4C617E', inner: PAL.innerHim, pants: PAL.pants };

  // ---------- 腿 / 鞋 ----------
  P(-5, 3, 4, 18, C.pants);
  P(1, 3, 4, 18, C.pants);
  P(-5, 3, 1, 18, '#12141F');           // 腿内侧暗
  P(4, 3, 1, 18, '#12141F');
  P(-6, 0, 5, 3, PAL.shoe);
  P(1, 0, 5, 3, PAL.shoe);
  P(-6, 2, 5, 1, '#1E2637');
  P(1, 2, 5, 1, '#1E2637');

  // ---------- 躯干（夹克：肩 16 · 下摆 12）----------
  P(-7, 21, 14, 16, C.coat);            // 躯干主体 21~37
  P(-8, 37, 16, 3, C.coat);             // 肩部横条 37~40
  P(-6, 21, 12, 1, C.coatDk);           // 下摆阴影
  P(-7, 22, 1, 15, C.coatDk);           // 左缘暗（光源在右）
  P(6, 22, 1, 15, '#8AA0BE');           // 右缘受光
  // 内搭
  if (who === 'her') {
    P(-1.2, 35.5, 2.4, 3, C.inner);     // 玫红领口锚点（小）
  } else {
    P(-1, 25, 2, 12, C.inner);          // 奶油白竖带
    P(-1.5, 36, 3, 3, C.inner);
  }
  // 翻领（左右襟错位 1px）
  P(-6.5, 35, 4.5, 1.2, C.coatDk);
  P(-6.5, 32.5, 1.2, 3, C.coatDk);
  P(2, 36, 4.5, 1.2, C.coatDk);
  P(5.3, 32.5, 1.2, 3.6, C.coatDk);

  // ---------- 手臂 ----------
  if (back) {
    P(-9, 24, 2.5, 13, C.coat);
    P(6.5, 24, 2.5, 13, C.coat);
  } else if (o.pad) {
    // 右手握手柄：前臂抬起前伸
    P(6.5, 24, 2.5, 8, C.coat);         // 上臂贴身
    P(6.5, 31, 5, 2.4, C.coat);         // 前臂横出
    P(11, 31.4, 1.6, 1.6, PAL.skinMid); // 手
    P(-9, 24, 2.5, 13, C.coat);         // 左手插兜
  } else {
    // 默认站姿：双手插兜（ref-1 剪影）
    P(-9, 24, 2.5, 13, C.coat);
    P(6.5, 24, 2.5, 13, C.coat);
    P(-9, 23.5, 2.5, 1, C.coatDk);      // 袋口
    P(6.5, 23.5, 2.5, 1, C.coatDk);
    P(6.4, 25, .6, 12, C.coatDk);       // 袖内侧缝
    P(-8.9, 25, .6, 12, C.coatDk);
  }

  // ---------- 脖子 ----------
  P(-2, 40, 4, 2.4, PAL.skinMid);
  P(-2, 40, 4, 1, PAL.skinDk);

  // ---------- 头（脸数据）----------
  facePx(c, cx - 6 * S, footY - 53 * S, S, {
    who, brow: o.brow, eyes: o.eyes, mouth: o.mouth, tear: o.tear, star: o.star, back,
  });

  // ---------- 金边轮廓光（G3：只勾外缘受光点，不满身）----------
  if (lit === 'gold') {
    P(0, 57.3, 7.5, 1.1, PAL.gold);      // 发顶外缘（右侧受光段）
    P(-3.5, 57.3, 3.5, 1.1, PAL.goldDk); // 左段过渡暗金
    P(-1.5, 57.6, 5, .7, '#FFF6DA');     // 最亮点
    P(8.8, 37.5, 1, 2, PAL.gold);        // 右肩点
    P(9.4, 29, 1, 3.5, PAL.goldRe);      // 右袖外缘一小段
    if (who === 'her') P(7.5, 37, 1, 9, PAL.goldRe);  // 她的侧发外缘（贴发）
  } else if (lit === 'cool') {
    P(0, 57.3, 7.5, 1.1, PAL.cool);
    P(-3.5, 57.3, 3.5, 1.1, '#8FA0C0');
    P(8.8, 37.5, 1, 2, PAL.cool);
    P(9.4, 27, 1, 5, '#7D8CA8');
  }

  // ---------- 手柄（握姿才拿出）----------
  if (o.pad) {
    const gx = cx + 11 * S, gy = footY - 31 * S;
    R(c, gx - 3 * S, gy - S, 6 * S, 2 * S, '#1B2436');
    R(c, gx - 3 * S, gy - S, 6 * S, .8, '#31415E');
    R(c, gx - 2.2 * S, gy - .4 * S, 1.2 * S, 1.2 * S, '#0E1220');
    R(c, gx + 1 * S, gy - .4 * S, 1.2 * S, 1.2 * S, '#0E1220');
    R(c, gx + 2.2 * S, gy - 1.6 * S, .9 * S, .9 * S, PAL.red);
  }
}

// ============================================================
//  场景 S3 · street 雨夜街道（ref-2：一点透视 + 单灯 + 金光路 + 电线）
// ============================================================
const VPX = 168, VPY = 116;
const roadY = x => x < VPX
  ? 180 - (180 - VPY) * x / VPX
  : 180 - (180 - VPY) * (320 - x) / (320 - VPX);

function wires(c, y0, sag) {
  for (let i = 0; i < 3; i++) {
    const yy = y0 + i * 6.5;
    for (let x = 0; x < 320; x++) {
      const k = (x - 160) / 168;
      const dy = Math.round((sag + i * 2.2) * (1 - k * k));
      R(c, x, yy + dy, 1, 1, '#06080E');
    }
  }
}

function goldRoad(c, cx, y0, len, w0, k) {
  for (let i = 0; i < len; i++) {
    const w = Math.round(w0 + i * 0.10);
    const jit = Math.round(Math.sin(i * 0.55) * 1.1);
    const fade = 1 - (i / len) * 0.6;
    for (let x = 0; x < w; x++) {
      const px = cx + x - (w >> 1) + jit;
      const b = BAYER[(y0 + i) & 3][px & 3] / 16;
      if (b < k * fade) {
        R(c, px, y0 + i, 1, 1, i < len * .3 ? PAL.goldDk : (b < k * fade * .5 ? PAL.gold : PAL.goldRe));
      }
    }
  }
}

function rainP(c, t, n) {
  for (let i = 0; i < n; i++) {
    const s = i * 137.5;
    const bx = ((s * 7.3 + i * 53) % 344) - 12;
    const by = ((s * 3.1 + t * 250 + i * 29) % 210) - 16;
    const skew = Math.round(by * 0.105);          // 6°
    if (i % 4 === 0) {
      R(c, bx + skew, by, 1, 4, PAL.rainNear);
      R(c, bx + skew, by, 1, 1, '#ABA4CC');
    } else {
      R(c, bx + skew, by, 1, 2, PAL.rainFar);
    }
  }
}

function sc_street(c, t, o = {}) {
  // 天空
  vgrad(c, 0, 0, 320, VPY + 2, '#090C15', '#1D2237');
  dith(c, 108, 64, 124, 54, '#090C15', '#252B42', .28);   // 消失点方向的雾
  // 电线带的天空微亮（让剪影电线可辨）
  dith(c, 0, 10, 320, 32, '#090C15', '#141A2C', .55);

  // 路面
  R(c, 0, VPY, 320, 180 - VPY, '#141827');
  dith(c, 0, VPY, 320, 64, '#141827', '#0D1120', .55);

  // 楼群（近 4 + 远 4，全部压进明度带 G6）
  const LEFT = [[0, 62, 30], [60, 100, 60], [98, 126, 82], [124, 148, 96]];
  const RIGHT = [[274, 320, 26], [236, 276, 58], [210, 238, 80], [190, 212, 94]];
  const dark = ['#101321', '#141727', '#181B2C', '#1C2033'];
  for (const [set, side] of [[LEFT, 'L'], [RIGHT, 'R']]) {
    set.forEach(([x0, x1, top], i) => {
      const bot = Math.round(roadY(side === 'L' ? x0 : 320 - x1)) + 3;
      R(c, x0, top, x1 - x0, bot - top, dark[i]);
      R(c, x0, top, x1 - x0, 1, '#2A3048');           // 楼顶边光
      R(c, side === 'L' ? x1 - 1 : x0, top, 1, bot - top, '#0B0E18');
      // 零星窗点（G6：零星，不做成星空）
      for (let wy = top + 7; wy < bot - 9; wy += 9) {
        for (let wx = x0 + 6; wx < x1 - 6; wx += 9) {
          const h = (wx * 31 + wy * 17 + i * 7) % 17;
          if (h < 2) R(c, wx, wy, 2, 3, h === 0 ? PAL.goldDk : '#333950');
        }
      }
    });
  }
  // 路缘（楼的底边 = 街道边界；断续虚线，湿面反光）
  for (let x = 0; x < 320; x++) if (x % 3 !== 2) R(c, x, Math.round(roadY(x)), 1, 1, '#272E48');

  // 路灯（远端正中，唯一光源 G4）
  const LX = 170, LY = 56;
  R(c, LX - 1, LY + 7, 3, VPY - LY - 7, '#161A28');
  R(c, LX - 1, LY + 7, 1, VPY - LY - 7, '#2C3350');
  R(c, LX - 6, LY, 12, 8, '#0C0F18');
  R(c, LX - 5, LY + 5, 10, 2.5, PAL.gold);
  R(c, LX - 3, LY + 5, 6, 2.5, '#FFF6DA');
  glow(c, LX, LY + 8, 30, 16, PAL.gold, .32);
  glow(c, LX, LY + 10, 12, 8, '#FFF6DA', .22);

  // 灯下湿地金光路（G4）
  goldRoad(c, LX, VPY + 1, 62, 5, .62);
  // 两侧湿面零星反光
  for (let i = 0; i < 26; i++) {
    const x = (i * 73 + 19) % 300 + 10;
    const y = VPY + 8 + (i * 37) % 52;
    if (Math.abs(x - LX) > 24) R(c, x, y, 1, 1, i % 3 ? '#232840' : PAL.goldRe);
  }

  // 电线（G6，前景剪影）
  wires(c, 16, 13);

  // 紫灰双层雨（G5）
  rainP(c, t, 92);

  // 整体压一层夜色
  shadeRect(c, 0, 0, 320, 180, .06);
}

// 简易"灯下台面"（人物样张用，模拟路灯从右上打过来）
function sc_plate(c, t, o = {}) {
  // 纯色夜空（不铺满屏 dith，只留底部过渡带）
  R(c, 0, 0, 320, 142, '#10141F');
  dith(c, 0, 108, 320, 34, '#10141F', '#181C2E', .5);
  // 地面
  R(c, 0, 142, 320, 38, '#141827');
  dith(c, 0, 142, 320, 38, '#141827', '#0D1120', .5);
  // 稀疏砖缝（更淡）
  for (let y = 14; y < 136; y += 18) {
    for (let x = 0; x < 320; x += 26) {
      const off = (y / 18) % 2 ? 13 : 0;
      R(c, x + off, y, 24, 1, '#151928');
      R(c, x + off, y, 1, 17, '#151928');
    }
  }
  // 右上光源
  const LX = 262, LY = 26;
  glow(c, LX, LY, 34, 34, PAL.gold, .26);
  R(c, LX - 5, LY - 4, 10, 5, '#0C0F18');
  R(c, LX - 4, LY + 1, 8, 2, PAL.gold);
  glow(c, LX, LY + 3, 18, 10, '#FFF6DA', .18);
  // 地面反光
  goldRoad(c, LX, 144, 26, 5, .38);
  rainP(c, t, 40);
}

// ============================================================
//  3 个样张镜头
// ============================================================
window.SPEC = {
  fps: 24, duration: 7.0,
  grade: 'brightness(1.07) saturate(1.03) contrast(1.07)',

  shots: [
    // ── 图 1 · 他 ──────────────────────────────
    { t0: 0, t1: 2.2, scene: 'plate', cam: false, vig: .44,
      in: { type: 'dither', dur: .35 },
      draw(pc, lt) {
        sc_plate(pc, lt);
        // 站立位的地面投影
        pc.save(); pc.globalAlpha = .5;
        R(pc, 116, 166, 40, 3, '#080A12');
        R(pc, 120, 168, 32, 2, '#080A12');
        pc.restore();
        figRim(pc, 136, 166, 2, { who: 'him', light: 'gold', brow: 'flat', eyes: 'open', mouth: 'flat' });
      } },

    // ── 图 2 · 她 + 12×14 大块正脸 ──────────────────────
    { t0: 2.2, t1: 4.4, scene: 'plate', cam: false, vig: .44,
      in: { type: 'dither', dur: .35 },
      draw(pc, lt) {
        sc_plate(pc, lt);
        pc.save(); pc.globalAlpha = .5;
        R(pc, 56, 166, 40, 3, '#080A12');
        R(pc, 60, 168, 32, 2, '#080A12');
        pc.restore();
        figRim(pc, 76, 166, 2, { who: 'her', light: 'gold', brow: 'flat', eyes: 'open', mouth: 'smile', star: true });

        // 正脸特写框（右侧）
        R(pc, 176, 30, 128, 132, '#0C0F18');
        R(pc, 178, 32, 124, 128, '#1A1E2E');
        dith(pc, 178, 32, 124, 128, '#1A1E2E', '#121624', .35);
        // 脸框左上 = (194, 44)，每块 u=8 → 脸宽 12*8=96 高 11*8=88，头发外扩到 -1~13
        facePx(pc, 194, 60, 8, { who: 'her', brow: 'flat', eyes: 'open', mouth: 'smile', star: true });
        // 相框角标
        R(pc, 176, 30, 128, 1, '#2C3350');
        R(pc, 176, 30, 1, 132, '#2C3350');
        R(pc, 303, 30, 1, 132, '#2C3350');
      } },

    // ── 图 3 · 场景 S3 street ──────────────────────
    { t0: 4.4, t1: 7.0, scene: 'street', cam: false, vig: .52,
      in: { type: 'dither', dur: .4 },
      draw(pc, lt) { sc_street(pc, lt); } },
  ],

  hud(c, W, H, t) {
    const a = Math.min(1, HZ(t - .35));
    const idx = t < 2.2 ? 0 : t < 4.4 ? 1 : 2;
    const L = [
      ['他 · 56px 半写实 rig', '蓝灰夹克 #6E86A8 · 奶油白内搭 · 双手插兜（默认站姿）· 发顶金边'],
      ['她 · 白长直 + 星星发夹', '淡紫外套 #A898C8 · 玫红内搭 · 右侧为 12×14 大块正脸（SH13 特写样张）'],
      ['场景 S3 · street 雨夜街道', '一点透视 · 远端单路灯 · 灯下湿地金光路 · 电线剪影 · 紫灰双层雨'],
    ];
    txt(c, L[idx][0], 72, 92, 42, '#F2E8D0', a, 5);
    txt(c, L[idx][1], 72, 134, 22, 'rgba(140,150,180,.90)', a, 2);
  },
};

function HZ2(v) { return Math.min(1, Math.max(0, v)); }
