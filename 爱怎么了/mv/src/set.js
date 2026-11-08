// 场景与镜头基座：取景换算、纸层构造、房间/剪纸/画框等 Set。
// 世界坐标：箱腔 x∈[-.28,.28] y∈[-.31,.31]；地面 FLOOR=-.16；天空面板 z=-.168；最前层 z≈-.01。
import * as THREE from 'three';
import { sheet, skyPanel, PPM } from './paper.js';
import { stage, aim } from './stage.js';
import { FLOOR } from './art2.js';
import { torso, torsoW, legs, arm, SHOULDER, HIP, MOOD, figureSil, figureSilW } from './figures.js';

export { FLOOR };
export const FOV = 30;
export const CW = 1080, CH = 1920;
export const ASPECT = CW / CH;

// —— 取景：vH = 可见高度（米）。距离由透视决定（真 dolly，不是数字变焦）——
export const dist = vH => vH / (2 * Math.tan(FOV * Math.PI / 360));
export function frameOf(vH) { return { vH, vW: vH * ASPECT, d: dist(vH) }; }

// 纸层面板：覆盖可见区域并留视差余量；画布宽度固定 ~2600px，保证任何景别都够清晰
export function panelOf(vH, c = [0, 0], m = 1.55) {
  const w = Math.min(.56, vH * ASPECT * m);
  const h = Math.min(.62, vH * m);
  return { w, h, cx: c[0], cy: c[1], ppm: 2600 / w };
}

// —— 一层纸 ——
export function layer(S, o) {
  const { w, h, cx = 0, cy = 0, ppm, z, draw, trans, finish, glow, glowCol, glowDraw, shadow, recv, bump, bumpBlur } = o;
  return S.add(sheet({
    U: S.U, w, h, x: cx, y: cy, z, ppm, trans, glow, glowCol, glowDraw, shadow, recv, bump, bumpBlur,
    cloudS: 9 * (w / .56),
    finish: finish || {},
    draw: (x, k) => { x.save(); x.translate(-cx, -cy); draw(x, k); x.restore(); },
  }));
}

// —— 舞台：唯一光源在箱体背后，顶光给每层投软影（关了就不像真纸）——
export function shotStage(o = {}) {
  const S = stage({
    light: o.light || [0, .04, -.16], lightR: o.lightR ?? .22, lightCol: o.lightCol || '#ffb862',
    key: o.key ?? 1.15, keyCol: o.keyCol || '#ffeedd', keyPos: o.keyPos || [0, .70, .58], keyTarget: o.keyTarget || [0, -.03, -.10],
    keyAngle: o.keyAngle ?? 1.42, shadowR: o.shadowR ?? 12,
    amb: o.amb ?? .38, ambCol: o.ambCol || '#8fa3d6', bg: o.bg || '#000',
  });
  S.cam.fov = FOV; S.cam.aspect = ASPECT; S.cam.updateProjectionMatrix();
  return S;
}

// 相机：at = 机位（z 由 vH 决定，除非给 z），look = 注视点；hand = 手持微抖
export function cam(S, t, o) {
  const { vH, look, at, hand = .0006, roll, dz = 0 } = o;
  const d = dist(vH);
  const lx = look[0], ly = look[1], lz = look[2] ?? -.06;
  const px = (at?.[0] ?? lx) , py = (at?.[1] ?? ly), pz = (at?.[2] ?? lz) + d + dz;
  aim(S.cam, [px, py, pz, lx, ly, lz], t, { hand, fov: FOV, roll });
  if (S.cam.fov !== FOV || S.cam.aspect !== ASPECT) { S.cam.fov = FOV; S.cam.aspect = ASPECT; S.cam.updateProjectionMatrix(); }
  return pz;
}

// —— 色阶：换色阶 = 换时空（远→近 5 级；后层亮而透，前层暗而实）——
export const LADDER = {
  A: { name: '现在·夜', sky: ['#0a1330', '#16264d', '#2a3f6f'], wall: '#6a86c2', mid: '#3f5a92', prop: '#1c3260', front: '#0e1532', light: '#ffb862', key: '#ffeedd', amb: '#8fa3d6' },
  B: { name: '回忆·金', sky: ['#3a2410', '#7d4d1e', '#b8823c'], wall: '#f0c890', mid: '#c07850', prop: '#6a3020', front: '#1e0e08', light: '#ffd080', key: '#ffeecc', amb: '#c99a68' },
  C: { name: '暴雨·紫', sky: ['#120a20', '#241537', '#3d2b58'], wall: '#4a3a6a', mid: '#2a1a40', prop: '#170f28', front: '#0b0714', light: '#9fb4d8', key: '#d6dcf4', amb: '#6c7ba8' },
  T: { name: '尾声·暖', sky: ['#0a1330', '#16264d', '#2a3f6f'], wall: '#6a86c2', mid: '#3f5a92', prop: '#1c3260', front: '#0e1532', light: '#ffb862', key: '#ffeedd', amb: '#8fa3d6' },
};

// 她的粉：全片唯一强调色
export const PINK = '#F79AC0';
export const PAPER = '#F6E6D2';
export const PAPERW = '#fbf1de';

// ————————————————————————————————————————————————
// 房间：天空 / 后墙（带格窗） / 中景家具 / 前景框
// —— shot: 每个镜自己的 set（纸层尺寸随景别），裁切点之间不共享几何，但共享造型语言
// ————————————————————————————————————————————————
export function roomSet(S, o = {}) {
  const L = LADDER[o.lad || 'A'];
  const p = panelOf(o.vH, o.c);
  const win = o.win || { x: -.075, y: .06, w: .125, h: .19 };
  const dim = o.dim ?? 1;                       // 整体曝光/透光（灯暗一档）
  const sky = S.add(skyPanel({
    w: p.w * 1.02, h: p.h * 1.02, z: -.168, gain: o.skyGain ?? 1.0,
    stops: [[0, L.sky[0]], [.55, L.sky[1]], [1, L.sky[2]]], stars: o.stars ?? 120, starMinY: -.05, seed: 3,
  }));
  // 后墙：整块平涂 + 打穿格窗
  const wall = layer(S, {
    ...p, z: -.152, trans: .70 * dim, glow: o.wallGlow ?? .5, glowCol: L.light,
    draw: x => {
      x.fillStyle = L.wall; x.fillRect(p.cx - p.w / 2, p.cy - p.h / 2, p.w, p.h);
      x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(0,0,0,.13)';
      for (let i = 0; i < 26; i++) x.fillRect(p.cx - p.w / 2, p.cy - p.h / 2 + i * .024, p.w, .0006);
      x.restore();
      lattice(x);
      // 墙角线
      x.fillStyle = L.mid; x.fillRect(p.cx - p.w / 2, FLOOR - .004, p.w, .006);
    },
    glowDraw: g => { g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(win.x - win.w / 2, win.y - win.h / 2, win.w, win.h, .012); g.fill(); },
  });
  function lattice(x) {
    const { x: cx, y: cy, w, h } = win;
    x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000';
    x.beginPath(); x.roundRect(cx - w / 2, cy - h / 2, w, h, .012); x.fill(); x.restore();
    x.save(); x.beginPath(); x.roundRect(cx - w / 2, cy - h / 2, w, h, .012); x.clip();
    x.strokeStyle = L.wall; x.lineWidth = .0022; x.lineCap = 'square';
    for (const dy of [-h * .32, 0, h * .32]) { x.beginPath(); x.moveTo(cx - w / 2, cy + dy); x.lineTo(cx + w / 2, cy + dy); x.stroke(); }
    x.beginPath(); x.moveTo(cx, cy - h / 2); x.lineTo(cx, cy + h / 2); x.stroke();
    x.restore();
    x.strokeStyle = L.mid; x.lineWidth = .005; x.beginPath(); x.roundRect(cx - w / 2, cy - h / 2, w, h, .012); x.stroke();
    x.fillStyle = L.mid; x.fillRect(cx - w / 2 - .01, cy - h / 2 - .006, w + .02, .007);   // 窗台
  }
  // 中景：地板 + 几件家具（都属于同一层，剪影式）
  const mid = layer(S, {
    ...p, z: -.112, trans: .34 * dim,
    draw: x => {
      x.fillStyle = L.mid;
      x.fillRect(p.cx - p.w / 2, p.cy - p.h / 2, p.w, FLOOR - (p.cy - p.h / 2));
      if (o.midDraw) o.midDraw(x, L);
    },
  });
  // 前景：门框/窗棂压住四角（画面最黑的一块）
  const front = layer(S, {
    ...p, z: -.016, trans: .04, finish: { rim: .22 },
    draw: x => { x.fillStyle = L.front; if (o.frontDraw) o.frontDraw(x, L, p); },
  });
  return { sky, wall, mid, front, L, p, win };
}

// ————————————————————————————————————————————————
// 人物：关节纸片（躯干 / 双臂 / 双腿），返回可旋转的部件
// —— z 给她永远比他深一层：身体隔着一层纸
// ————————————————————————————————————————————————
export function figure(S, o) {
  const { x, ground, h, z, ppm, col, kind = 'm', mood = 'neutral', pose = 'stand', facing = 1, arms = [[.10, .16], [-.06, .2]], dim = 1, shadow = true } = o;
  const hipY = ground + HIP[pose] * h;
  const common = { ppm, z, trans: .10 * dim, glow: .30, glowCol: '#ffcf96', shadow, recv: true, cloudS: 4 };
  const body = S.add(sheet({
    U: S.U, w: .46 * h, h: 1.10 * h, x, y: hipY, z, ppm, trans: .11 * dim, glow: .30, glowCol: '#ffcf96',
    shadow, recv: true, cloudS: 5, finish: { rim: .30, under: .2 },
    draw: xx => { xx.fillStyle = col; xx.strokeStyle = col; kind === 'm' ? torso(xx, h, { mood, facing }) : torsoW(xx, h, { mood, facing }); },
  }));
  const legM = S.add(sheet({
    U: S.U, w: .50 * h, h: 1.06 * h, x, y: hipY, z: z - .0004, ppm, trans: .075 * dim, glow: .26, glowCol: '#ffcf96',
    shadow, recv: true, cloudS: 5, finish: { rim: .28, under: .2 },
    draw: xx => { xx.fillStyle = col; xx.strokeStyle = col; legs(xx, h, pose, { facing }); },
  }));
  const [sx0, sy0] = SHOULDER(h, facing);
  const armMeshes = arms.map(([a, b], i) => S.add(sheet({
    U: S.U, w: .92 * h, h: .92 * h, x: x + sx0, y: hipY + sy0, z: z + .0006 * (2 - i), ppm: ppm * .9,
    trans: .055 * dim, glow: .26, glowCol: '#ffcf96', shadow, recv: true, cloudS: 4, finish: { rim: .26, under: .2 },
    draw: xx => { xx.fillStyle = col; xx.strokeStyle = col; arm(xx, h, a, b, { facing }); },
  })));
  return { body, legs: legM, arms: armMeshes, hipY, shoulder: [x + sx0, hipY + sy0] };
}

// 影子：把整身剪影画成柔边深色，落在更后面那一层纸上（影子是唯一能跨层的东西）
export function shadowOf(S, o) {
  const { x, ground, h, z, ppm, kind = 'm', pose = 'stand', facing = 1, mood = 'neutral', arms, blur = 7, alpha = .78, col = '#08040c', w, hgt, cx, cy } = o;
  const hipY = ground + HIP[pose] * h;
  const W = w || .5, Hh = hgt || .62, CX = cx ?? x, CY = cy ?? (ground + .2);
  return layer(S, {
    w: W, h: Hh, cx: CX, cy: CY, ppm: ppm * .8, z, trans: 0, shadow: false, recv: false,
    finish: { grain: false, rim: 0, under: 0 },
    draw: xx => {
      xx.save(); xx.filter = `blur(${blur}px)`; xx.globalAlpha = alpha; xx.fillStyle = col; xx.strokeStyle = col;
      xx.translate(x - CX, hipY - CY);
      kind === 'm' ? figureSil(xx, h, { pose, facing, mood, arms }) : figureSilW(xx, h, { pose, facing, mood, arms });
      xx.restore();
    },
  });
}


