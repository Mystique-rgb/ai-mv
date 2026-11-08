// Clawd · 孔版印刷版（riso plate densities）
// 只借 painted-animation 的表情/动作词汇；画法是色块 + 纸白 knockout，不用水彩。
// 版序：ink(blue, yellow, red)
import { g, W, H, S, ink, inkA, layer, rrect, circle, ellipse, rect, line, poly, text, over, blob } from './draw.js';

export const COL = {
  hero: [0, 1, 1],        // 黄 + 红 叠印 = 陶土橙
  heroD: [.30, 1, 1],     // 影子：压一点蓝
  heroL: [0, 1, .55],     // 亮面：少一版红
  pink: [0, 0, .45],      // 女主：红版 45% 网点
  pinkD: [.22, 0, .62],
  ink: [1, 1, 1],         // 近黑（眼、嘴）
  blue: [1, 0, 0],
  paper: [0, 0, 0],
};

// ── 表情表：eyes / mouth / 允许的微调 ──
export const EMO = {
  neutral:   { eyes: 'slit',   mouth: 'none' },
  happy:     { eyes: 'happy',  mouth: 'smile' },
  excited:   { eyes: 'starSocket', mouth: 'open',  sq0: -.04 },
  laugh:     { eyes: 'happy',  mouth: 'grin',  tilt: -.06 },
  love:      { eyes: 'heart',  mouth: 'smile', blush: .5 },
  shy:       { eyes: 'happy',  mouth: 'cat',   blush: .7, tilt: .1 },
  smug:      { eyes: 'narrow', mouth: 'smirk', tilt: -.08 },
  proud:     { eyes: 'happy',  mouth: 'smile', tilt: -.12 },
  nervous:   { eyes: 'wide',   mouth: 'wobble', sweat: 1 },
  surprised: { eyes: 'wide',   mouth: 'o' },
  confused:  { eyes: 'slit',   mouth: 'wobble', lookX: .5 },
  determined:{ eyes: 'narrow', mouth: 'flat',  tilt: -.05 },
  angry:     { eyes: 'angry',  mouth: 'teeth' },
  furious:   { eyes: 'angry',  mouth: 'open', lid: .85 },
  scared:    { eyes: 'wide',   mouth: 'wail',  sweat: 1 },
  relieved:  { eyes: 'happy',  mouth: 'smile' },
  sad:       { eyes: 'sad',    mouth: 'frown', tilt: .1 },
  cry:       { eyes: 'sad',    mouth: 'wail',  tears: 1 },
  bored:     { eyes: 'narrow', mouth: 'flat' },
  sleepy:    { eyes: 'closed', mouth: 'none',  tilt: .14 },
  thinking:  { eyes: 'narrow', mouth: 'none',  lookX: -.4 },
  idea:      { eyes: 'starSocket', mouth: 'o' },
  starstruck:{ eyes: 'starSocket', mouth: 'grin',  blush: .3 },
  mischief:  { eyes: 'narrow', mouth: 'smirk', tilt: -.12 },
  ko:        { eyes: 'x',      mouth: 'wail' },
  playful:   { eyes: 'happy',  mouth: 'grin',  tilt: -.08 },
  hopeful:   { eyes: 'happy',  mouth: 'smile', blush: .3 },
  disgusted: { eyes: 'narrow', mouth: 'wobble', tilt: -.1 },
};

export function feel(name, t, over2 = {}) {
  const e = EMO[name] || EMO.neutral;
  return { ...e, ...over2, name, t };
}

// ── 部件 ──
function leg(x, y, w, h, c) { rrect(x - w / 2, y - h, w, h + w * .3, w * .42, c); }

function star4(x, y, s, c, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.beginPath();
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, rr = i % 2 ? s * .34 : s; const X = Math.cos(a) * rr, Yy = Math.sin(a) * rr; i ? g.lineTo(X, Yy) : g.moveTo(X, Yy); }
  g.closePath(); g.fillStyle = Array.isArray(c) ? inkA(c) : c; g.fill(); g.restore();
}

function eye(kind, x, y, u, lookX, lookY, c, lash = false) {
  const w = .78 * u, h = 1.7 * u, r = .34 * u;
  const ox = (lookX || 0) * .28 * u, oy = (lookY || 0) * .18 * u;
  switch (kind) {
    case 'happy': {
      line([[x - w * .62, y + h * .14], [x, y - h * .26], [x + w * .62, y + h * .14]], w * .40, c);
      if (lash) { // 参考图：闭眼笑带 2 根小睫毛
        line([[x - w * .58, y + h * .12], [x - w * .92, y + h * .38]], w * .20, c);
        line([[x + w * .58, y + h * .12], [x + w * .92, y + h * .38]], w * .20, c);
      }
      break;
    }
    case 'closed': line([[x - w * .7, y], [x + w * .7, y]], w * .32, c); break;
    case 'narrow': rrect(x - w * .42 + ox, y - h * .18 + oy, w * .84, h * .38, r * .3, c); break;
    case 'wide': rrect(x - w * .56 + ox, y - h * .56, w * 1.12, h * 1.12, r, c); break;
    case 'starSocket': { // 参考图主眼：深色圆角眼窝 + 纸白四角星
      rrect(x - w * .62 + ox, y - h * .62 + oy, w * 1.24, h * 1.24, r * 1.1, c);
      star4(x + ox, y + oy, w * .58, 'rgb(250,246,235)');
      break;
    }
    case 'sad': line([[x - w * .8, y - h * .3], [x - w * .1, y + h * .1], [x + w * .7, y - h * .1]], w * .38, c);
      circle(x + w * .9, y + h * .45, w * .18, c); break;
    case 'angry': line([[x - w * .9, y - h * .55], [x + w * .75, y + h * .1]], w * .32, c); break;
    case 'heart': {
      const s = u * .42; g.beginPath();
      g.moveTo(x, y + s * .75); g.bezierCurveTo(x - s * 1.5, y - s * .35, x - s * .55, y - s * 1.15, x, y - s * .45);
      g.bezierCurveTo(x + s * .55, y - s * 1.15, x + s * 1.5, y - s * .35, x, y + s * .75);
      g.fillStyle = inkA(c); g.fill(); break;
    }
    case 'x': line([[x - w * .55, y - h * .45], [x + w * .55, y + h * .45]], w * .38, c);
      line([[x + w * .55, y - h * .45], [x - w * .55, y + h * .45]], w * .38, c); break;
    case 'spark': star4(x, y, u * .62, c); break;
    default: rrect(x - w / 2 + ox, y - h / 2 + oy, w, h, r, c);
  }
}

function mouth(kind, x, y, u, c) {
  const w = 1.5 * u;
  switch (kind) {
    case 'smile': line([[x - w * .5, y - .1 * u], [x, y + .34 * u], [x + w * .5, y - .1 * u]], u * .15, c); break;
    case 'grin': g.beginPath(); g.moveTo(x - w * .55, y - .06 * u); g.quadraticCurveTo(x, y + .78 * u, x + w * .55, y - .06 * u); g.closePath(); g.fillStyle = inkA(c); g.fill();
      line([[x - w * .48, y + .06 * u], [x + w * .48, y + .06 * u]], u * .1, 'rgb(0,0,0)'); break;
    case 'open': ellipse(x, y + .16 * u, w * .38, u * .48, 0, c); break;
    case 'o': ellipse(x, y + .1 * u, w * .2, u * .3, 0, c); break;
    case 'wail': ellipse(x, y + .22 * u, w * .34, u * .55, 0, c); break;
    case 'cat': line([[x - w * .55, y + .1 * u], [x - w * .2, y - .12 * u], [x, y + .08 * u], [x + w * .2, y - .12 * u], [x + w * .55, y + .1 * u]], u * .14, c); break;
    case 'smirk': line([[x - w * .45, y + .1 * u], [x + w * .2, y + .22 * u], [x + w * .55, y - .06 * u]], u * .15, c); break;
    case 'flat': line([[x - w * .4, y + .06 * u], [x + w * .4, y + .06 * u]], u * .13, c); break;
    case 'frown': line([[x - w * .45, y + .2 * u], [x, y - .12 * u], [x + w * .45, y + .2 * u]], u * .14, c); break;
    case 'wobble': line([[x - w * .5, y], [x - w * .17, y + .2 * u], [x, y - .1 * u], [x + w * .17, y + .2 * u], [x + w * .5, y]], u * .13, c); break;
    case 'teeth': rrect(x - w * .5, y - .1 * u, w, u * .62, u * .1, c);
      line([[x - w * .36, y - .06 * u], [x - w * .36, y + .44 * u]], u * .07, 'rgb(0,0,0)');
      line([[x - w * .12, y - .06 * u], [x - w * .12, y + .44 * u]], u * .07, 'rgb(0,0,0)');
      line([[x + w * .12, y - .06 * u], [x + w * .12, y + .44 * u]], u * .07, 'rgb(0,0,0)');
      line([[x + w * .36, y - .06 * u], [x + w * .36, y + .44 * u]], u * .07, 'rgb(0,0,0)'); break;
    default: break;
  }
}

function emoteMark(kind, x, y, u, k = 1) {
  if (k <= 0) return;
  const s = u * 1.1 * (0.6 + .4 * k);
  g.save(); g.translate(x, y); g.scale(1, 1);
  const c = COL.ink;
  if (kind === '!') { rrect(-s * .08, -s * .9, s * .16, s * .62, s * .06, c); circle(0, -s * .06, s * .1, c); }
  else if (kind === '?') { text('?', 0, 0, `700 ${Math.round(s * .9)}px STKaiti, serif`, c, 'center', 'alphabetic'); }
  else if (kind === 'hearts') { eye('heart', -s * .28, -s * .35, s * 1.2, 0, 0, [0, 0, 1]); eye('heart', s * .3, -s * .7, s * .85, 0, 0, [0, 0, 1]); }
  else if (kind === 'sweat') { g.beginPath(); g.moveTo(0, -s * .55); g.quadraticCurveTo(s * .3, 0, 0, s * .1); g.quadraticCurveTo(-s * .3, 0, 0, -s * .55); g.fillStyle = inkA([1, 0, 0]); g.fill(); }
  else if (kind === 'spark') { eye('spark', 0, -s * .5, s * 1.1, 0, 0, [0, 1, 0]); }
  else if (kind === 'music') { text('♪', 0, 0, `700 ${Math.round(s * .9)}px STKaiti, serif`, c, 'center', 'alphabetic'); }
  else if (kind === 'bulb') { circle(0, -s * .45, s * .26, [0, 1, 0]); rect(-s * .1, -s * .18, s * .2, s * .16, [0, 1, 0]); }
  else if (kind === 'dots') { for (let i = 0; i < 3; i++) circle((i - 1) * s * .26, -s * .45, s * .08, c); }
  else if (kind === 'anger') { line([[-s * .4, -s * .8], [s * .4, 0]], s * .1, [0, 0, 1]); line([[s * .4, -s * .8], [-s * .4, 0]], s * .1, [0, 0, 1]); }
  g.restore();
}

/**
 * clawd(x, y, u, o)
 * x,y = 两脚之间的地面点；u = 单位（中等镜头 22–28，特写 45–70）
 */
export function clawd(x, y, u, o = {}) {
  const e = o;
  const pink = e.tint === 'pink', mono = e.tint === 'mono';
  const body = mono ? [.85, 0, 0] : pink ? COL.pink : COL.hero;
  const bodyD = mono ? [.45, 0, 0] : pink ? COL.pinkD : COL.heroD;
  const bodyL = mono ? [.95, 0, 0] : pink ? [0, 0, .28] : [0, 1, .5];
  const sq = e.sq || 0;
  const bw = 10 * u * (1 + sq * .45), bh = 7.4 * u * (1 - sq);
  const bx = x - bw / 2, by = y - 1.8 * u - bh;
  const flip = e.flip ? -1 : 1;
  const tilt = (e.tilt || 0) + (e.rot || 0);
  const dy = (e.dy || 0) * u;
  const RAD = 1.1 * u;                       // 参考图的圆角

  layer(() => {
    g.save();
    g.translate(x, y + dy);
    g.rotate(tilt * .5 * flip);
    g.translate(-x, -(y + dy));

    // 贴地网点影（很淡）
    if (!e.noShadow) {
      g.save(); g.globalCompositeOperation = 'lighter';
      ellipse(x + 1.2 * u, y + .16 * u, bw * .44, u * .5, 0, [0, 0, .22]);
      g.restore();
    }

    // 细短腿（参考图：四根小细腿）
    if (!e.noLegs) {
      const wk = e.walk || 0, amp = e.walk ? 1 : 0;
      const legs = [[-3.4, 0], [-1.15, 2.1], [1.15, 0], [3.4, 2.1]];
      for (const [lx, phh] of legs) {
        const yy = y + Math.sin(wk + phh) * .9 * u * amp;
        leg(x + lx * u * flip, yy + dy, .85 * u, 1.9 * u, bodyD);
      }
    }

    // 身体：干净平涂圆角方块（ halo 已给纸白描边）
    rrect(bx, by + dy, bw, bh, RAD, body);
    // 底部一条暗色「纸厚度」边（参考图身体下缘）
    g.save(); g.beginPath(); g.roundRect(bx, by + dy, bw, bh, RAD); g.clip();
    rrect(bx, by + bh * .8 + dy, bw, bh * .3, RAD, bodyD);
    // 顶部一道浅色受光边（参考图身体上缘的亮边）
    rrect(bx + bw * .06, by + bh * .045 + dy, bw * .88, bh * .09, RAD * .5, bodyL);
    g.restore();

    // 饭盒盖（喊叫机关）
    if (e.lid > .02) {
      g.save();
      g.translate(bx + bw, by + dy);
      g.rotate(-e.lid * .55);
      rrect(-bw, -2.3 * u, bw, 2.3 * u, .5 * u, body);
      rrect(-bw + bw * .06, -2.3 * u, bw * .88, .4 * u, .3 * u, bodyL);
      g.restore();
    }

    // 蝴蝶结（女主的记号）
    if (pink) {
      const bx0 = x - 3.4 * u * flip + (e.dx || 0) * u, by0 = by + dy - .5 * u;
      g.save(); g.translate(bx0, by0); g.rotate(-.25 * flip);
      blob([[-.15 * u, 0], [-1.25 * u, -.85 * u], [-1.05 * u, .6 * u]], [0, 0, 1]);
      blob([[.15 * u, 0], [1.25 * u, -.85 * u], [1.05 * u, .6 * u]], [0, 0, 1]);
      circle(0, 0, .32 * u, [0, 0, 1]);
      g.restore();
    }

    // 眼睛：居中偏下、更大（参考图比例）
    const ex = (e.dx || 0) * u, ey = (e.dy || 0) * 0 + dy;
    const lookX = e.lookX ?? 0, lookY = e.lookY ?? 0;
    const eyes = e.eyes || 'slit';
    const eyeY = by + bh * .42 + ey;
    const lash = pink && !mono;                // 女主闭眼笑自带睫毛
    if (e.squint) {
      line([[x - 3.4 * u * flip + ex, eyeY], [x - 1.5 * u * flip + ex, eyeY]], .34 * u, COL.ink);
      line([[x + 1.5 * u * flip + ex, eyeY], [x + 3.4 * u * flip + ex, eyeY]], .34 * u, COL.ink);
    } else {
      eye(eyes, x - 2.6 * u * flip + ex, eyeY, u, lookX, lookY, COL.ink, lash);
      eye(eyes, x + 2.6 * u * flip + ex, eyeY, u, lookX, lookY, COL.ink, lash);
    }
    // 腮红：更大的椭圆网点（参考图）
    if (e.blush) {
      g.save(); g.globalCompositeOperation = 'lighter';
      ellipse(x - 3.8 * u * flip + ex, eyeY + 1.7 * u, .95 * u, .62 * u, .15, [0, 0, .5 * e.blush]);
      ellipse(x + 3.8 * u * flip + ex, eyeY + 1.7 * u, .95 * u, .62 * u, -.15, [0, 0, .5 * e.blush]);
      g.restore();
    }
    // 嘴
    if (e.mouth && e.mouth !== 'none') mouth(e.mouth, x + ex, by + bh * .84 + ey - .3 * u, u * 1.12, COL.ink);

    // 手臂：默认不画（参考图无手），给了 aL/aR 才画
    const hasL = e.aL != null, hasR = e.aR != null;
    if (hasL || hasR) {
      const arm = (side, ang) => {
        const sx = x + side * bw * .48, sy = by + bh * .42 + dy;
        const a = (ang ?? 0) * side * flip;
        const len = 2.0 * u;
        const tip = [sx + Math.cos(-1.2 + a) * len * side * flip * .9, sy - Math.sin(1.2 - a) * len * .8];
        line([[sx, sy], tip], 1.0 * u, bodyD);
        circle(tip[0], tip[1], .58 * u, body);
        return tip;
      };
      if (hasL) arm(-1, e.aL);
      if (hasR) arm(1, e.aR);
    }

    // emote
    if (e.emote) emoteMark(e.emote, x + 5.6 * u * flip + ex, by - .4 * u + ey, u * .9, e.emoteK ?? 1);
    g.restore();
  }, e.halo ?? 6);
}

// 心跳/呼吸：所有 Clawd 共用一个拍内节奏
export const breath = (t, bpm = 144.19, ph = 0) => Math.sin((t * bpm / 60 + ph) * Math.PI * 2);
