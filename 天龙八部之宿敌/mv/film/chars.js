// chars.js — 两个「剪纸偶」：阿宿（朱红原色）与粉煞（粉纸宿敌）
// 每一个部件都是一张剪出来的纸（fill + 镂空 + 内轮廓 + 剪边），用铆钉（肩/腕）绑成关节偶，
// 在 12fps 上换姿（st()），摄像机与光是 24fps 的。
import { PAL, canvas, piece, fill, cut, cutLine, cutTaper, trace, Pl, P, inset, ellipsePoly, paperShadow, noShadow, finishPaper } from '../engine/paper.js';
import { sawRow, sawEdge, crescent, crescentPts, swirl, plum, rosette, dots, along, taper } from '../engine/motifs.js';
import { put, mul, T as Tm, R, S } from '../engine/rig.js';

// 纸色家族：主角朱红（近处亮一档），宿敌粉纸，配角灰纸
export const CH = {
  A: { body: '#d2201f', hat: '#a8111f', robe: '#9c1323', belt: '#7e1424', boot: '#5d0d18', trim: '#e0503f', veil: null },
  B: { body: '#e0748c', hat: '#8e3350', robe: '#b7465f', belt: '#6d1730', boot: '#4a0f20', trim: '#f0a3b4', veil: '#f6cfd6' },
  G: { body: '#6b6472', hat: '#4e4854', robe: '#57515c', belt: '#3b3642', boot: '#2f2b36', trim: '#8b8492', veil: null }
};

const PC = {};
const pc = (k, f) => (PC[k] || (PC[k] = f()));

// ---------- 身体（含下摆、靴、腰带、脸）----------
function bodyPiece(kind, expr) {
  return pc(`body|${kind}|${expr}`, () => piece([-760, -1000, 760, 90], g => {
    const C = CH[kind];
    const sil = Pl([[-500, -800], [500, -800], [500, -210], [558, -96], [432, -96], [432, 0], [140, 0], [140, -96],
      [-140, -96], [-140, 0], [-432, 0], [-432, -96], [-558, -96], [-500, -210]], true, .7, 3);
    fill(g, q => trace(q, sil), C.body);
    // 双线内轮廓（剪纸上区分红压红的经典手法）
    inset(g, sil, 26, 11, C.body);
    // 下摆：锯齿剪口 + 两道衣褶
    sawRow(g, [[-540, -120], [540, -120]], 30, 42, 1, .62);
    taper(g, [[-300, -200], [-320, -150], [-296, -112]], 14);
    taper(g, [[300, -200], [320, -150], [296, -112]], 14);
    // 腰带：先剪开一条缝，再贴一条深色纸
    cutLine(g, 8, q => { q.moveTo(-520, -392); q.lineTo(520, -386); });
    fill(g, q => { q.rect(-512, -386, 1024, 84); }, C.belt);
    cutLine(g, 10, q => { q.moveTo(-512, -302); q.lineTo(512, -296); });
    // 玉扣：一枚梅花孔
    plum(g, 0, -344, 40);
    // 护肩
    for (const s of [-1, 1]) {
      const pa = Pl([[s * 520, -790], [s * 400, -790], [s * 388, -640], [s * 540, -672]], true, .5, 7 + s);
      fill(g, q => trace(q, pa), C.robe); inset(g, pa, 16, 8, C.robe);
      swirl(g, s * 430, -722, 26, 1.5, 7, s > 0 ? 0 : Math.PI, 1);
    }
    // 甲片行（阴刻小孔）
    dots(g, [[-120, -520], [0, -516], [120, -520]], 9);
    // ---- 脸 ----
    const ex = 250, ey = -604;
    const eye = (s) => {
      const c = s * ex;
      if (expr === 'happy') { crescent(g, c, ey + 10, 74, Math.PI * .12, Math.PI * .88, 26); return; }
      if (expr === 'closed') { cutLine(g, 15, q => { q.moveTo(c - 62, ey - 6); q.quadraticCurveTo(c, ey + 22, c + 62, ey - 6); }); return; }
      const h = expr === 'surprised' ? 96 : expr === 'sad' ? 58 : expr === 'angry' ? 52 : 78;
      const w = expr === 'surprised' ? 34 : 23;
      cut(g, q => trace(q, ellipsePoly(c, ey, w, h, 0, 26)));
    };
    eye(-1); eye(1);
    // 眉：走刀一刀利，内端压得低才是「剑眉」
    const brow = (s) => {
      const c = s * ex, k = expr === 'sad' ? -1 : expr === 'surprised' ? 0 : 1, st = expr === 'angry' ? 1.6 : 1;
      const inner = [c - s * 22, ey - 108 + (k > 0 ? 26 * st : k < 0 ? -22 : -34)];
      const outer = [c + s * 128, ey - 108 - (k > 0 ? 16 * st : k < 0 ? 14 : 34)];
      taper(g, [inner, [(inner[0] + outer[0]) / 2, (inner[1] + outer[1]) / 2 - 8], outer], 27);
    };
    brow(-1); brow(1);
    if (expr === 'angry') sawRow(g, [[-150, -432], [150, -428]], 44, 34, 1, .55);
    if (expr === 'sad') { taper(g, [[-300, -520], [-306, -470], [-292, -430]], 12); }
    if (expr === 'surprised') cut(g, q => trace(q, ellipsePoly(0, -428, 30, 40, 0, 20)));
    if (expr === 'determined') cutLine(g, 13, q => { q.moveTo(-120, -424); q.lineTo(120, -420); });
    // ---- 宿敌：口部粉色面纱（另贴一张浅纸）----
    if (C.veil) {
      const v = Pl([[-400, -512], [-200, -524], [0, -518], [200, -524], [400, -512], [376, -428], [0, -400], [-376, -428]], true, .5, 13);
      fill(g, q => trace(q, v), C.veil);
      // 面纱上缘锯齿 + 两道褶
      sawRow(g, [[-460, -502], [-240, -516], [0, -508], [240, -516], [460, -502]], 16, 30, -1, .6);
      taper(g, [[-180, -470], [-200, -420], [-176, -388]], 10);
      taper(g, [[180, -470], [200, -420], [176, -388]], 10);
    }
    // ---- 额前朱砂印（只用阴刻，不贴色）----
    if (!C.veil) {
      taper(g, [[0, -790], [0, -742]], 13);
      taper(g, [[-26, -788], [-40, -750]], 9);
      taper(g, [[26, -788], [40, -750]], 9);
    }
  }, { ss: 2.2, seed: kind === 'B' ? 7 : 3, edge: 1.4 }));
}

// ---------- 斗笠 ----------
function hatPiece(kind) {
  return pc(`hat|${kind}`, () => piece([-740, -680, 740, 90], g => {
    const C = CH[kind];
    const brim = Pl([[-676, -18], [-430, -86], [-190, -120], [0, -132], [190, -120], [430, -86], [676, -18],
      [528, 30], [286, 58], [0, 66], [-286, 58], [-528, 30]], true, .6, 5);
    fill(g, q => trace(q, brim), C.hat);
    inset(g, brim, 20, 9, C.hat);
    // 帽顶
    const cone = Pl([[-336, -60], [-190, -300], [0, -566], [190, -300], [336, -60]], true, .5, 9);
    fill(g, q => trace(q, cone), C.hat);
    inset(g, cone, 18, 8, C.hat);
    // 帽檐：放射状竹骨（阴刻）
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + Math.PI * (i + 1) / 8;
      taper(g, [[Math.cos(a) * 300, Math.sin(a) * 40 - 60], [Math.cos(a) * 610, Math.sin(a) * 44 - 26]], 11);
    }
    // 帽带上的一排回纹孔
    sawRow(g, [[-470, -96], [-240, -122], [0, -132], [240, -122], [470, -96]], 18, 34, -1, .55);
    // 系带（垂下的两根纸带）
    fill(g, q => trace(q, Pl([[-520, 6], [-556, 96], [-534, 176], [-500, 100], [-486, 22]], true, .5, 15)), C.trim);
    fill(g, q => trace(q, Pl([[520, 6], [556, 96], [534, 176], [500, 100], [486, 22]], true, .5, 16)), C.trim);
  }, { ss: 2.2, seed: kind === 'B' ? 11 : 6 }));
}

// ---------- 手臂（含手）----------
function armPiece(kind, s) {
  return pc(`arm|${kind}|${s}`, () => piece([-90, -130, 330, 130], g => {
    const C = CH[kind];
    const a = Pl([[-46, -58], [92, -50], [206, -44], [252, 0], [206, 44], [92, 50], [-46, 58]], true, .5, s > 0 ? 21 : 22);
    fill(g, q => trace(q, a), C.body);
    inset(g, a, 15, 7, C.body);
    swirl(g, 40, 0, 26, 1.4, 8, 0, s);      // 肩铆钉
    cut(g, q => { q.moveTo(250, 0); q.arc(236, 0, 16, 0, 7); });   // 手心的孔
  }, { ss: 2.4, seed: 31 + s }));
}

// ---------- 剑 ----------
function swordPiece(kind) {
  return pc(`sword|${kind}`, () => piece([-90, -70, 620, 160], g => {
    const C = CH[kind];
    const blade = Pl([[52, -30], [430, -24], [560, 0], [430, 24], [52, 30]], true, .4, 33);
    fill(g, q => trace(q, blade), '#f4ead2'); inset(g, blade, 9, 5, '#f4ead2');
    cutLine(g, 7, q => { q.moveTo(140, 0); q.lineTo(470, 0); });   // 剑脊（镂空）
    // 护手
    const gd = Pl([[20, -74], [52, -74], [58, 74], [24, 74]], true, .4, 34);
    fill(g, q => trace(q, gd), C.hat); inset(g, gd, 8, 4, C.hat);
    // 剑柄 + 穗
    fill(g, q => trace(q, Pl([[-76, -20], [22, -20], [22, 20], [-76, 20]], true, .4, 35)), C.belt);
    fill(g, q => trace(q, Pl([[30, 26], [74, 96], [60, 168], [96, 246], [58, 214], [30, 150], [10, 84]], true, .5, 36)), C.trim);
  }, { ss: 2.4, seed: 41 }));
}

// ---------- 组装：figure(g, C, kind, o) ----------
// o = {x, y, s(每单位像素), pose:{lean, aL, aR, bob, hatTilt}, expr, flip, alpha, shadow}
export function figure(g, C, kind, o) {
  const s = o.s || 1, pose = o.pose || {};
  const base = mul(C, Tm(o.x, o.y + (pose.bob || 0) * s));
  let M = mul(base, S(s));
  if (o.flip) M = mul(M, S(-1, 1));
  M = mul(M, R(pose.lean || 0));
  const sh = o.shadow ?? 1;
  put(g, bodyPiece(kind, o.expr || 'determined'), M, { shadow: sh, shadowScale: s, alpha: o.alpha });
  const shX = 452, shY = -545, aL = pose.aL ?? .9, aR = pose.aR ?? .9;
  const ML = mul(M, mul(Tm(-shX, shY), mul(S(-1, 1), R(aL))));   // 左臂镜像：向外伸
  const MR = mul(M, mul(Tm(shX, shY), R(aR)));
  put(g, armPiece(kind, -1), ML, { shadow: sh, shadowScale: s });
  put(g, armPiece(kind, 1), MR, { shadow: sh, shadowScale: s });
  if (o.swordL) put(g, swordPiece(kind), ML, { shadow: sh, shadowScale: s });
  if (o.swordR) put(g, swordPiece(kind), MR, { shadow: sh, shadowScale: s });
  put(g, hatPiece(kind), mul(M, mul(Tm((pose.hatDx || 0), -790), R(pose.hatTilt || 0))), { shadow: sh, shadowScale: s });
  return M;
}

// 站立高度：脚在 y=0，帽顶约 y=-1360
export const FIG_H = 1360;
