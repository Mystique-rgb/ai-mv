// 宿敌百景 · 主渲染
import {
  W, H, FR, PAL, TX, mk, buildTextures, stampLayer, stampFn, clamp, lerp, seg, ss, eio, eo,
  PSET, dip, paper, frame, mountBG, seal, bigSeal, slipV, subSlip, STX
} from './base.js';
import { SHOTS } from './shots.js';

const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const QS = new URLSearchParams(location.search);

export const DUR = 263.34;
const RAW = await (await fetch('subs.json')).json();
const SUBS = RAW.map(s => ({ t0: s.t0, t1: Math.max(s.t0 + 1.6, s.t1 - .10), text: s.text }));

await document.fonts.load(`400 60px ${STX}`, '宿敌百景恩怨各一半当我看灯笼血红染');
await document.fonts.load('400 60px Yuji', '宿敌百景命');
buildTextures();

const TMP = mk(), tmpX = TMP.getContext('2d');
const REVEAL = .34;

function shotAt(t) {
  for (let i = 0; i < SHOTS.length; i++) {
    const s = SHOTS[i];
    if (t < s.t1 || i === SHOTS.length - 1) return s;
  }
  return SHOTS[SHOTS.length - 1];
}
function camOf(s, t, lt) {
  const c = s.cam ? s.cam(t, lt, (t - s.t0) / (s.t1 - s.t0)) : null;
  return { cx: 960, cy: 540, z: 1, rot: 0, ...(c || {}) };
}
function applyCam(x, c) {
  x.translate(W / 2, H / 2);
  if (c.rot) x.rotate(c.rot);
  if (c.z !== 1) x.scale(c.z, c.z);
  x.translate(-c.cx, -c.cy);
}

// —— 一镜的实体（可画进任意上下文，用于显影合成） ——
function body(x, S, t, lt) {
  const P = PSET[S.pset || 'B1'];
  const cam = camOf(S, t, lt);
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  if (cam.z < 1.001) mountBG(x); else { x.fillStyle = PAL.paper; x.fillRect(0, 0, W, H); }
  x.save(); applyCam(x, cam);
  const sheetC = S.cache !== false ? S._c || (S._c = (() => {
    const c = mk(), g = c.getContext('2d');
    g.fillStyle = PAL.paper; g.fillRect(0, 0, W, H);
    S.still && S.still(g, P, S);
    g.drawImage(TX.fiber, 0, 0);
    return c;
  })()) : null;
  if (sheetC) x.drawImage(sheetC, 0, 0);
  else { paper(x); S.still && S.still(x, P, S); }
  S.live && S.live(x, t, lt, P, S);
  x.restore();
}

function renderFrame(t) {
  const S = shotAt(t), lt = t - S.t0, rev = clamp(lt / REVEAL);
  const full = rev >= 1;
  const x = full ? ctx : tmpX;
  body(x, S, t, lt);
  if (!full) {
    tmpX.setTransform(1, 0, 0, 1, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = PAL.mount; ctx.fillRect(0, 0, W, H);
    stampLayer(ctx, TMP, rev, [0, 0], [5, -4]);
  }
  // 画框
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (S.noFrame !== true) frame(ctx, S.frameLw || 3.2);
  // 镜内屏上叠加（印章 / 大字 / 竖题签）
  S.ui && S.ui(ctx, t, lt, S);
  // 字幕
  const sub = SUBS.find(s => t >= s.t0 - .04 && t < s.t1);
  if (sub && !QS.has('nosub')) {
    const p = clamp((t - sub.t0) / .30), out = 1 - clamp((t - (sub.t1 - .22)) / .22);
    const seg = S.seg || '';
    subSlip(ctx, sub.text, Math.min(p, out), {
      mis: seg === 'B2' ? 8 : 0,
      noSeal: seg === 'B3',
      size: 56,
    });
  }
  // 片尾
  endCard(ctx, t);
}

function endCard(x, t) {
  if (t < 258.6) return;
  const a = ss(seg(t, 258.6, 259.6));
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = a;
  x.fillStyle = '#efe4ca'; x.fillRect(0, 0, W, H);
  x.globalAlpha = a;
  x.fillStyle = PAL.sumi; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = `400 76px ${STX}`; x.fillText('宿敌百景', W / 2, 430);
  x.font = `400 30px ${STX}`; x.globalAlpha = a * .8; x.fillText('许嵩《天龙八部之宿敌》· 浮世绘 MV', W / 2, 530);
  x.globalAlpha = a; x.font = `400 26px ${STX}`; x.fillText('八十八景 · 一夜印成', W / 2, 600);
  x.restore();
  seal(x, '宿', W / 2, 700, 84, ss(seg(t, 259.3, 259.9)), { seed: 5 });
}

window.render = renderFrame;
window.DUR = DUR;
window.SUBS = SUBS;
renderFrame(parseFloat(QS.get('t') ?? '30'));
window.READY = true;
