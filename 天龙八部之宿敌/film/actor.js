// 两个役者：同一块黑骨版，两套色版
// A 阿宿（靛） / B 粉煞（朱） / G 群演（灰）
import { clamp, lerp, TAU } from '/core/lib.js';
import { PAL, smooth, poly } from '/styles/ukiyoe/demo/print.js';

export const ROLES = {
  A: { cloth: '#2c4a70', clothD: '#1f3656', sash: '#b8412f', hat: '#c9a45c', hatD: '#7d5d2c', leg: '#1d2c44', inner: '#efe6cf', accent: '#b8412f' },
  B: { cloth: '#c2565c', clothD: '#963f47', sash: '#231f1c', hat: '#b9a48c', hatD: '#6d5a45', leg: '#3a2a2e', inner: '#f0dfd2', accent: '#231f1c' },
  G: { cloth: '#8b8a80', clothD: '#6a6960', sash: '#5f5e58', hat: '#b3b0a2', hatD: '#8b8a80', leg: '#5f5e58', inner: '#d9d3c2', accent: '#5f5e58' },
};

const S = (a, len) => [-Math.sin(a) * len, Math.cos(a) * len];
const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
function limb(pts, ws) {
  const L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    L.push([pts[i][0] - dy * ws[i] / 2, pts[i][1] + dx * ws[i] / 2]);
    R.push([pts[i][0] + dy * ws[i] / 2, pts[i][1] - dx * ws[i] / 2]);
  }
  return L.concat(R.reverse());
}
let INKONLY = false;
export function setInk(v) { INKONLY = v; }
function shape(x, pts, fill, lw, sm = true) {
  x.beginPath(); sm ? smooth(x, pts, true) : poly(x, pts);
  if (fill && fill !== 'none' && !INKONLY) { x.fillStyle = fill; x.fill(); }
  if (lw) { x.strokeStyle = PAL.sumi; x.lineWidth = lw; x.stroke(); }
}

// 斗笠（侧视，低圆锥，檐微翘）
export function kasa(x, cx, cy, tilt, lw, col, dark) {
  x.save(); x.translate(cx, cy); x.rotate(tilt);
  const wd = 27, hh = 11.5;
  shape(x, [[-wd, 1], [-8, 3.6], [8, 3.6], [wd, 1], [0, 2]], dark, 0, false);
  shape(x, [[-wd - 1, .8], [-13, -5.6], [-2, -hh], [2, -hh], [13, -5.6], [wd + 1, .8], [0, 2.4]], col, lw, false);
  x.strokeStyle = dark; x.lineWidth = lw * .4;
  for (let i = -6; i <= 6; i++) { if (!i) continue; x.beginPath(); x.moveTo(i * .25, -hh + .8); x.lineTo(i / 6.3 * wd, 1.4 - Math.abs(i) * .05); x.stroke(); }
  x.restore();
}

// 刀（握在手里时以手为原点）
function swordIn(x, hand, ang, len, lw) {
  x.save(); x.translate(hand[0], hand[1]); x.rotate(ang);
  x.fillStyle = '#2a2320'; x.fillRect(-len * .26, -2.1, len * .26, 4.2);
  x.strokeStyle = PAL.sumi; x.lineWidth = lw * .8; x.strokeRect(-len * .26, -2.1, len * .26, 4.2);
  x.fillStyle = PAL.ochreL; x.fillRect(-1.2, -3.4, 2.4, 6.8);
  x.beginPath();
  x.moveTo(0, -2.6); x.lineTo(len * .93, -1.3); x.quadraticCurveTo(len, 0, len * .93, 1.1); x.lineTo(0, 2.6); x.closePath();
  x.fillStyle = PAL.white; x.fill(); x.strokeStyle = PAL.sumi; x.lineWidth = lw * .9; x.stroke();
  x.strokeStyle = 'rgba(35,31,28,.45)'; x.lineWidth = lw * .35;
  x.beginPath(); x.moveTo(len * .06, -.2); x.lineTo(len * .86, -.2); x.stroke();
  x.restore();
}

// 短剑（双持）
function shortBlade(x, hand, ang, lw, col) {
  const len = 34;
  x.save(); x.translate(hand[0], hand[1]); x.rotate(ang);
  x.fillStyle = '#2a2320'; x.fillRect(-7, -2, 7, 4);
  x.beginPath(); x.moveTo(0, -2.4); x.lineTo(len * .9, -1.1); x.quadraticCurveTo(len, 0, len * .9, 1); x.lineTo(0, 2.4); x.closePath();
  x.fillStyle = col; x.fill(); x.strokeStyle = PAL.sumi; x.lineWidth = lw * .9; x.stroke();
  x.restore();
}

/**
 * 役者。s = 身高像素（含斗笠约 100 单位）
 * o: role / flip / mode(stand|walk|draw|kneel|sit|back|reach|guard) / ph / t / sword / twin / tilt / dip
 */
export function actor(x, px, py, s, o = {}) {
  const u = s / 100, R = ROLES[o.role || 'A'];
  const lw = clamp(s / 46, 1.25, 2.9) / u;
  x.save(); x.translate(px, py); x.scale(u * (o.flip ? -1 : 1), u);
  x.lineJoin = 'round'; x.lineCap = 'round';
  const mode = o.mode || 'stand', ph = (o.ph || 0) * TAU, t = o.t || 0;
  const walk = mode === 'walk';
  const bob = walk ? -Math.abs(Math.sin(ph)) * 1.5 + .7 : (o.bob || 0);
  const lean = o.lean ?? (walk ? -.07 : 0);
  const hip = [1.2, -40 + bob];

  // —— 腿 ——
  const gait = (p, far) => {
    let th, kn;
    if (mode === 'kneel') { th = -1.05 + (far ? .18 : 0); kn = 1.9; }
    else { const sw = Math.sin(p), lift = Math.max(0, Math.cos(p)); th = walk ? .46 * sw : (far ? .16 : -.14); kn = walk ? .05 + lift * .8 : (far ? .1 : .16); }
    const knee = add(hip, S(th, 19));
    const ankle = add(knee, S(th - kn, 21));
    return [knee, ankle, far];
  };
  const drawLeg = ([knee, ankle, far]) => {
    const sk = far ? '#dcc39c' : PAL.skin;
    shape(x, limb([hip, knee, ankle], [6.6, 5.2, 3.6]), sk, lw * .85, false);
    const g0 = [lerp(knee[0], ankle[0], .1), lerp(knee[1], ankle[1], .1)];
    const gm = [lerp(knee[0], ankle[0], .5), lerp(knee[1], ankle[1], .5)];
    const g1 = [lerp(knee[0], ankle[0], .95), lerp(knee[1], ankle[1], .95)];
    shape(x, limb([g0, gm, g1], [6, 6, 4.2]), far ? '#141f33' : R.leg, lw * .7, false);
    // 布鞋
    shape(x, [[ankle[0] - 2, ankle[1] - 3], [ankle[0] - 8.6, ankle[1] - .6], [ankle[0] - 8.2, ankle[1] + .8], [ankle[0] + 2.4, ankle[1] + 1], [ankle[0] + 2, ankle[1] - 2.6]], far ? '#20202a' : '#2b2a26', lw * .7, false);
  };
  const [kF, aF] = gait(ph, false);
  const [kB, aB] = gait(ph + Math.PI, true);
  drawLeg([kB, aB, true]);

  // —— 后臂 ——
  const arm = (side, a1, a2, len1 = 20, len2 = 19) => {
    const sh = [side * 6, -71];
    const el = add(sh, S(a1, len1)), hd = add(el, S(a1 + a2, len2));
    shape(x, limb([sh, el, hd], [6.2, 4.8, 3.4]), R.cloth, lw * .85, false);
    return { el, hd };
  };
  const armB = o.armB || (walk ? .28 : .12), armB2 = o.armB2 || (walk ? -.35 : -.2);
  arm(1, armB, armB2);

  // —— 袍 ——
  x.save(); x.translate(hip[0], hip[1]); x.rotate(lean); x.translate(-hip[0], -hip[1]);
  const hem = mode === 'kneel' ? [[-22, -34], [-2, -33], [12, -35]] : [[-9.5, -33], [3, -31.5], [10, -34]];
  shape(x, [[-7.4, -73.5], [7.4, -73.5], [9.6, -54], hem[2], hem[1], hem[0], [-9.2, -54]], R.cloth, lw * 1.05);
  // 前襟 + 褶
  x.strokeStyle = PAL.sumi; x.lineWidth = lw * .55;
  x.beginPath(); x.moveTo(-5, -72); x.quadraticCurveTo(-3, -58, -7.6, -44); x.stroke();
  x.beginPath(); x.moveTo(1.5, -46); x.quadraticCurveTo(.5, -38, 0, -32); x.moveTo(5.5, -46); x.quadraticCurveTo(5.5, -38, 5, -32); x.stroke();
  // 井字絣纹
  x.strokeStyle = 'rgba(238,230,210,.75)'; x.lineWidth = lw * .34;
  [[-4, -66], [2, -63], [5.5, -56], [-3, -55], [1, -43], [-6, -40], [6.5, -39]].forEach(([a, b]) => {
    x.beginPath(); x.moveTo(a - 1.3, b); x.lineTo(a + 1.3, b); x.moveTo(a, b - 1.3); x.lineTo(a, b + 1.3); x.stroke();
  });
  // 交领
  shape(x, [[-7, -74], [-3, -75], [-5.2, -68]], R.inner, lw * .5, false);
  shape(x, [[7, -74], [3.6, -74.6], [5.4, -68.5]], R.inner, lw * .5, false);
  // 腰带
  shape(x, [[-9.4, -53], [9.2, -54], [9.4, -48.4], [-9.5, -47.4]], R.sash, lw * .8, false);
  if (mode !== 'kneel') { x.strokeStyle = R.sash; x.lineWidth = lw * 1.1; x.beginPath(); x.moveTo(-9, -49); x.quadraticCurveTo(-14, -42, -12.5, -33); x.stroke(); }
  x.restore();

  drawLeg([kF, aF, false]);

  // —— 前臂 / 持械 ——
  let a1 = o.armF ?? .22, a2 = o.armF2 ?? -.3;
  if (mode === 'draw') { a1 = o.armF ?? -1.55; a2 = o.armF2 ?? -.5; }
  if (mode === 'reach') { a1 = o.armF ?? -2.5; a2 = o.armF2 ?? -.2; }
  if (mode === 'guard') { a1 = o.armF ?? -1.15; a2 = o.armF2 ?? -.9; }
  if (mode === 'kneel') { a1 = o.armF ?? -.35; a2 = o.armF2 ?? -1.5; }
  const A = arm(-1, a1, a2);
  // 手
  x.beginPath(); x.arc(A.hd[0], A.hd[1], 2.5, 0, TAU); x.fillStyle = PAL.skin; x.fill();
  x.strokeStyle = PAL.sumi; x.lineWidth = lw * .5; x.stroke();

  // 刀
  if (INKONLY) { x.restore(); return; }
  if (o.sword === 'held') swordIn(x, A.hd, o.swordAng ?? -.25, o.swordLen ?? 96, lw);
  if (o.twin) {
    shortBlade(x, A.hd, o.swordAng ?? -.9, lw, PAL.white);
  }
  if (o.sword === 'sheathed') {
    // 腰侧刀鞘
    x.save(); x.translate(-7, -46); x.rotate(.62);
    x.fillStyle = '#2a2320'; x.fillRect(-30, -2.4, 62, 4.8);
    x.strokeStyle = PAL.sumi; x.lineWidth = lw * .8; x.strokeRect(-30, -2.4, 62, 4.8);
    x.fillStyle = PAL.ochre; x.fillRect(-3, -3, 5, 6);
    x.restore();
  }

  // —— 头 ——
  const tilt = o.tilt ?? 0;
  x.save(); x.translate(0, -74); x.rotate(tilt *.5); x.translate(0, 74);
  shape(x, [[-6.4, -83], [-6.2, -80], [-7, -79.4], [-5.4, -77], [-1.8, -75.8], [3, -77], [4.6, -82], [2, -84.4], [-3, -85]], PAL.skin, lw * .8, false);
  if (o.hat === 'off') {
    // 束发 + 额
    shape(x, [[-6.2, -84.6], [-1, -88.6], [4.6, -86.6], [4.4, -82.6], [1.4, -84.6], [-3, -83.4]], PAL.sumi, 0, false);
    shape(x, [[1, -87], [5.4, -89.4], [2.4, -85]], PAL.sumi, 0, false);
  }
  // 眉眼（侧脸）
  const brow = o.brow ?? 0, eye = o.eye ?? 1;
  x.strokeStyle = PAL.sumi; x.lineWidth = lw * .6;
  x.beginPath(); x.moveTo(-5.6, -80.4 + brow * .4); x.lineTo(-3.2, -80.6 + brow * .2); x.stroke();
  if (eye > 0) { x.lineWidth = lw * .55; x.beginPath(); x.moveTo(-5.4, -78.6); x.lineTo(-3.4, -78.8); x.stroke(); }
  x.lineWidth = lw * .45; x.beginPath(); x.moveTo(-5.6, -75.6); x.lineTo(-4, -75.8); x.stroke();
  if (o.hat !== 'off') kasa(x, -.6, -84, tilt + (o.hatTilt || 0), lw, R.hat, R.hatD);
  x.restore();

  // B：口部面纱
  if (o.veil) {
    shape(x, [[-6.6, -76.4], [-1, -75.6], [4, -76.8], [3.4, -74.2], [-1, -73.6], [-6.2, -74.2]], '#f0dcdc', lw * .5, false);
  }
  x.restore();
}

// 群演（简化：只要剪影感，用灰）
export function crowd(x, list, t) {
  for (const c of list) actor(x, c[0], c[1], c[2], { role: 'G', mode: 'walk', ph: c[3] + t * .9, flip: c[4] || false });
}
