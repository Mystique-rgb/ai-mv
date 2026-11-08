// 剪纸人物：关节小人的纸片零件（躯干+头 / 双臂 / 双腿），只旋转、不弯曲。
// 造型语言 = 平面剪影：大衣梯形 + 头部蛋形 + 锥形四肢 + 圆角脚。
// 局部坐标 s = 身高（米），原点在胯；地面 y=0 由调用方给。
import { TAU } from './lib.js';

// 情绪只改剪影：头前倾、肩下沉。剪影片不画五官——表演靠姿态、光与影子。
export const MOOD = {
  neutral: { hx: 0, hy: 0 },
  sad: { hx: .026, hy: .006 },
  cry: { hx: .038, hy: .009 },
  bored: { hx: .014, hy: .014 },
  confused: { hx: .004, hy: -.002 },
  thinking: { hx: .016, hy: .002 },
  hopeful: { hx: -.022, hy: -.004 },
  surprised: { hx: -.028, hy: -.006 },
  scared: { hx: -.014, hy: .004 },
  nervous: { hx: .014, hy: .002 },
  love: { hx: .002, hy: .002 },
};

// 一片“大衣”：肩宽 → 腰 → 摆
function coat(x, s, o) {
  const { sw = .086, ww = .068, hw = .064, top = .318, waist = .150, bottom = -.040 } = o;
  x.beginPath();
  x.moveTo(-hw * s, bottom * s);
  x.quadraticCurveTo(-(hw + .006) * s, (bottom + .10) * s, -ww * s, waist * s);
  x.quadraticCurveTo(-(ww + .010) * s, (waist + .09) * s, -sw * s, (top - .030) * s);
  x.quadraticCurveTo(-sw * s, top * s, -(sw - .022) * s, top * s);
  x.lineTo((sw - .022) * s, top * s);
  x.quadraticCurveTo(sw * s, top * s, sw * s, (top - .030) * s);
  x.quadraticCurveTo((ww + .010) * s, (waist + .09) * s, ww * s, waist * s);
  x.quadraticCurveTo((hw + .006) * s, (bottom + .10) * s, hw * s, bottom * s);
  x.quadraticCurveTo(0, (bottom - .010) * s, -hw * s, bottom * s);
  x.closePath(); x.fill();
}

// 头（hx/hy 是情绪偏移），脸朝 +x
function head(x, s, hx, hy, k = 1, f = 1) {
  x.save(); x.translate(hx * s, hy * s); if (f < 0) x.scale(-1, 1);
  const cy = .446, rx = .050 * k, ry = .052 * k;
  x.beginPath();
  x.moveTo(.002 * s, (cy - ry) * s);
  x.bezierCurveTo(.034 * s, (cy - ry + .004) * s, rx * s, (cy - .020) * s, rx * s, cy * s);
  x.bezierCurveTo(rx * s, (cy + .026) * s, .030 * s, (cy + ry) * s, .000 * s, (cy + ry) * s);
  x.bezierCurveTo(-.032 * s, (cy + ry) * s, -rx * s, (cy + .026) * s, -rx * s, cy * s);
  x.bezierCurveTo(-rx * s, (cy - .022) * s, -.030 * s, (cy - ry) * s, .002 * s, (cy - ry) * s);
  x.closePath(); x.fill();
  x.restore();
}

function neck(x, s, hx, hy, w = .017, top = .405, bot = .290) {
  x.beginPath();
  x.moveTo((hx - w + .006) * s, (hy + bot) * s);
  x.lineTo((hx + w + .006) * s, (hy + bot) * s);
  x.lineTo((hx + w) * s, (hy + top) * s);
  x.lineTo((hx - w + .002) * s, (hy + top) * s);
  x.closePath(); x.fill();
}

// —— 躯干 + 头（原点：胯）——
export function torso(x, s, o = {}) {
  const m = MOOD[o.mood || 'neutral'] || MOOD.neutral, f = o.facing ?? 1;
  const hx = (m.hx || 0) * f, hy = (m.hy || 0);
  x.save(); if (f < 0) x.scale(-1, 1);
  neck(x, s, hx, hy);
  head(x, s, hx, hy, 1, f);
  // 短发
  x.save(); x.translate(hx * s, hy * s);
  x.beginPath();
  x.moveTo(-.048 * s, .452 * s);
  x.bezierCurveTo(-.052 * s, .498 * s, -.024 * s, .518 * s, .006 * s, .514 * s);
  x.bezierCurveTo(.038 * s, .510 * s, .055 * s, .490 * s, .049 * s, .464 * s);
  x.bezierCurveTo(.041 * s, .484 * s, .022 * s, .492 * s, .000 * s, .490 * s);
  x.bezierCurveTo(-.022 * s, .488 * s, -.038 * s, .472 * s, -.042 * s, .454 * s);
  x.closePath(); x.fill();
  x.restore();
  coat(x, s, {});
  x.restore();
}

// 她的躯干：窄肩、细腰、裙摆到膝上
export function torsoW(x, s, o = {}) {
  const m = MOOD[o.mood || 'neutral'] || MOOD.neutral, f = o.facing ?? 1;
  const hx = (m.hx || 0) * f, hy = (m.hy || 0);
  x.save(); if (f < 0) x.scale(-1, 1);
  neck(x, s, hx, hy, .013, .396, .290);
  head(x, s, hx, hy, .94, f);
  // 长发
  x.save(); x.translate(hx * s, hy * s);
  x.beginPath();
  x.moveTo(-.044 * s, .468 * s);
  x.bezierCurveTo(-.070 * s, .430 * s, -.074 * s, .330 * s, -.064 * s, .250 * s);
  x.bezierCurveTo(-.058 * s, .206 * s, -.044 * s, .208 * s, -.040 * s, .246 * s);
  x.bezierCurveTo(-.044 * s, .330 * s, -.032 * s, .410 * s, -.012 * s, .460 * s);
  x.closePath(); x.fill();
  x.beginPath();
  x.moveTo(-.046 * s, .450 * s);
  x.bezierCurveTo(-.048 * s, .496 * s, -.018 * s, .516 * s, .008 * s, .512 * s);
  x.bezierCurveTo(.036 * s, .508 * s, .053 * s, .488 * s, .047 * s, .462 * s);
  x.bezierCurveTo(.039 * s, .482 * s, .020 * s, .490 * s, .000 * s, .488 * s);
  x.bezierCurveTo(-.020 * s, .486 * s, -.036 * s, .470 * s, -.040 * s, .452 * s);
  x.closePath(); x.fill();
  x.restore();
  // 裙
  x.beginPath();
  x.moveTo(-.068 * s, -.072 * s);
  x.quadraticCurveTo(-.072 * s, .040 * s, -.052 * s, .150 * s);
  x.quadraticCurveTo(-.044 * s, .250 * s, -.060 * s, .296 * s);
  x.quadraticCurveTo(-.060 * s, .316 * s, -.038 * s, .316 * s);
  x.lineTo(.038 * s, .316 * s);
  x.quadraticCurveTo(.060 * s, .316 * s, .060 * s, .296 * s);
  x.quadraticCurveTo(.044 * s, .250 * s, .052 * s, .150 * s);
  x.quadraticCurveTo(.072 * s, .040 * s, .068 * s, -.072 * s);
  x.quadraticCurveTo(0, -.086 * s, -.068 * s, -.072 * s);
  x.closePath(); x.fill();
  x.restore();
}

// —— 腿：stand / kneel / sat / crouch（原点：胯）——
export function legs(x, s, pose = 'stand', o = {}) {
  const f = o.facing ?? 1;
  x.save(); if (f < 0) x.scale(-1, 1);
  const run = (x0, y0, x1, y1, w0, w1) => {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1e-6, nx = -dy / L, ny = dx / L;
    x.beginPath();
    x.moveTo((x0 + nx * w0 / 2) * s, (y0 + ny * w0 / 2) * s);
    x.lineTo((x1 + nx * w1 / 2) * s, (y1 + ny * w1 / 2) * s);
    x.lineTo((x1 - nx * w1 / 2) * s, (y1 - ny * w1 / 2) * s);
    x.lineTo((x0 - nx * w0 / 2) * s, (y0 - ny * w0 / 2) * s);
    x.closePath(); x.fill();
  };
  const foot = (cx, cy, w, h) => { x.beginPath(); x.roundRect((cx - w * .62) * s, (cy - h) * s, w * s, h * s, h * .45 * s); x.fill(); };
  if (pose === 'stand') {
    run(.020, -.020, .028, -.290, .058, .046); run(.028, -.290, .032, -.436, .046, .038);
    run(-.020, -.020, -.026, -.290, .060, .048); run(-.026, -.290, -.030, -.436, .048, .038);
    foot(.034, -.436, .078, .030); foot(-.028, -.436, .070, .030);
  } else if (pose === 'kneel') {
    run(.012, -.010, .112, -.272, .062, .050);
    run(.112, -.272, -.024, -.298, .050, .042);
    foot(-.030, -.298, .086, .028);
    run(-.018, -.010, -.072, -.268, .060, .048);
    run(-.072, -.268, .022, -.298, .048, .040);
    foot(.030, -.298, .074, .026);
  } else if (pose === 'sat') {
    run(.010, -.006, .104, -.024, .064, .052);
    run(.104, -.024, .110, -.256, .050, .040);
    foot(.114, -.256, .070, .028);
    run(-.010, -.006, -.032, -.024, .062, .050);
    run(-.032, -.024, -.026, -.248, .048, .038);
    foot(-.022, -.248, .066, .026);
  } else if (pose === 'crouch') {
    run(.012, -.010, .098, -.186, .062, .050);
    run(.098, -.186, .064, -.336, .050, .040);
    foot(.070, -.336, .082, .028);
    run(-.016, -.010, -.088, -.192, .060, .048);
    run(-.088, -.192, -.060, -.336, .048, .040);
    foot(-.054, -.336, .076, .026);
  }
  x.restore();
}

// —— 手臂（原点：肩；a=0 自然下垂，90° 前伸，180° 上举；b=肘弯）——
export function arm(x, s, a, b = .18, o = {}) {
  const f = o.facing ?? 1;
  const L1 = .190, L2 = .175, w = .042;
  x.save(); if (f < 0) x.scale(-1, 1);
  const A = o.keepSign ? a : a * f;
  const ex = Math.sin(A) * L1 * s, ey = -Math.cos(A) * L1 * s;
  const hx = ex + Math.sin(A + b) * L2 * s, hy = ey - Math.cos(A + b) * L2 * s;
  const seg = (ax, ay, bx, by, w0, w1, bend) => {
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-6, nx = -dy / L, ny = dx / L;
    const mx = (ax + bx) / 2 + nx * L * bend, my = (ay + by) / 2 + ny * L * bend;
    x.beginPath();
    x.moveTo(ax + nx * w0 / 2, ay + ny * w0 / 2);
    x.quadraticCurveTo(mx + nx * (w0 + w1) / 4, my + ny * (w0 + w1) / 4, bx + nx * w1 / 2, by + ny * w1 / 2);
    x.lineTo(bx - nx * w1 / 2, by - ny * w1 / 2);
    x.quadraticCurveTo(mx - nx * (w0 + w1) / 4, my - ny * (w0 + w1) / 4, ax - nx * w0 / 2, ay - ny * w0 / 2);
    x.closePath(); x.fill();
  };
  seg(0, 0, ex, ey, w * s * 1.06, w * s * .86, .05);
  x.beginPath(); x.arc(0, 0, w * s * .62, 0, TAU); x.fill();
  seg(ex, ey, hx, hy, w * s * .84, w * s * .60, .08);
  x.beginPath(); x.arc(ex, ey, w * s * .44, 0, TAU); x.fill();
  const ha = A + b + (o.wrist || .26);
  x.save(); x.translate(hx, hy); x.rotate(ha);
  x.beginPath(); x.moveTo(0, w * s * .24); x.quadraticCurveTo(w * s * .96, w * s * .30, w * s * 1.10, w * s * .02);
  x.quadraticCurveTo(w * s * 1.14, -w * s * .22, w * s * .78, -w * s * .26); x.lineTo(w * s * .38, -w * s * .40);
  x.quadraticCurveTo(w * s * .22, -w * s * .30, w * s * .26, -w * s * .18); x.lineTo(0, -w * s * .20);
  x.closePath(); x.fill(); x.restore();
  x.restore();
  return [hx, hy];
}

export const SHOULDER = (s, f = 1) => [.040 * s * f, .306 * s];

// —— 整身剪影（影子层 / 照片里的 / 一刀切开的纸）——
export function figureSil(x, s, o = {}) {
  const f = o.facing ?? 1, pose = o.pose || 'stand';
  legs(x, s, pose, { facing: f });
  torso(x, s, o);
  const [sx, sy] = SHOULDER(s, f);
  for (const [aa, bb] of (o.arms || [[.10, .16], [-.06, .22]])) {
    x.save(); x.translate(sx, sy); arm(x, s, aa, bb, { facing: f, keepSign: true, wrist: o.wrist }); x.restore();
  }
}
export function figureSilW(x, s, o = {}) {
  const f = o.facing ?? 1, pose = o.pose || 'stand';
  legs(x, s, pose, { facing: f });
  torsoW(x, s, o);
  const [sx, sy] = SHOULDER(.94 * s, f);
  for (const [aa, bb] of (o.arms || [[.08, .14], [-.05, .2]])) {
    x.save(); x.translate(sx, sy); arm(x, .94 * s, aa, bb, { facing: f, keepSign: true }); x.restore();
  }
}

// 姿势 → 胯高（占身高比）
export const HIP = { stand: .47, kneel: .30, sat: .47, sit: .47, crouch: .33 };
