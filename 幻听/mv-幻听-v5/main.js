// 《幻听》· 玻璃上的第二个人 · 80s 赛璐璐
import { canvas, W, H, airbrush } from '/styles/cel-anime-80s/demo/cel.js';
import { makePost } from './post80.js';   // 本地改版：加胶片颗粒、暗角加重
import { setAt, whiteFlash } from './pal80.js';
import { DUR, shotAt, FPS } from './story.js';
import { SHOT_FN, applyPunch } from './shots.js';
import { cityLayers } from './set.js';
import { makeShards } from './fx.js';
import { hud } from './hud.js';
import { transAt, applyTransition } from './transitions.js';

const qs = new URLSearchParams(location.search);
const [sc, g] = canvas(W, H);        // 画面
const [gc, e] = canvas(W, H);        // 发光层
const [ovc, ov] = canvas(W, H);      // 字幕层（进 CRT pass，跟扫描线一起被处理）
const [pvc, pvg] = canvas(W, H);     // 上一镜头末帧 · 画面层
const [pec, peg] = canvas(W, H);     // 上一镜头末帧 · 发光层
const [tc, tg] = canvas(W, H);       // 当前帧暂存（转场拿它跟旧画面合成）
const post = makePost(document.getElementById('gl'));

await document.fonts.load('58px STKaiti', '如今一个人听歌总是会觉得失落幻听你在我的耳边轻轻诉说夜色多温爱你有多爱已不在这却还没走脱列表里的随过往流动');

const A = {};
A.city = cityLayers(7, 3400);
A.shards = makeShards(360, 60, 1240, 900);

function powerAt(t) {
  if (t < 0.62) return Math.max(0.0005, Math.min(1, (t - 0.04) / 0.55));
  if (t > 30.11) return 0;
  if (t > 28.96) return Math.max(0.022, 1 - (t - 28.96) / 0.30);
  return 1;
}

// 把某个时刻的镜头单独渲进 pvc/pec（只给转场当"上一画面"用）
function renderPrevInto(tp) {
  const [s0, s1, sn] = shotAt(tp);
  for (const x of [pvg, peg]) {
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
  }
  SHOT_FN[sn]({ t: tp, lt: tp - s0, u: (tp - s0) / (s1 - s0), g: pvg, e: peg, S: setAt(tp), A });
  pvg.save();
  pvg.setTransform(1, 0, 0, 1, 0, 0);
  pvg.globalCompositeOperation = 'lighter'; pvg.globalAlpha = .92;
  pvg.drawImage(pec, 0, 0);
  pvg.restore();
}

function render(t) {
  // 清两层
  for (const x of [g, e]) {
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
    x.globalCompositeOperation = 'source-over'; x.filter = 'none';
  }
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  e.fillStyle = '#000'; e.fillRect(0, 0, W, H);

  const [t0, t1, name] = shotAt(t);
  const S = setAt(t);
  const ctx = { t, lt: t - t0, u: (t - t0) / (t1 - t0), g, e, S, A };
  g.setTransform(1, 0, 0, 1, 0, 0);
  SHOT_FN[name](ctx);

  // 拍击（每拍一次，同帧 punch 总和 < .06）
  applyPunch(g, t);

  // —— 转场 ——
  // 并行渲染时每个 worker 拿不到上一帧，所以直接重渲染上一镜头的末帧，
  // 这样任何一帧都能独立算出来，不分先后、不依赖历史。
  const tr = transAt(t);
  if (tr) {
    renderPrevInto(tr.def.t - 1 / FPS);
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalAlpha = 1; tg.globalCompositeOperation = 'source-over';
    tg.clearRect(0, 0, W, H);
    tg.drawImage(g.canvas, 0, 0);
    applyTransition(g, e, pvc, tc, tr.p, tr.def);
  }

  // 换套白闪
  const wf = whiteFlash(t, 2);
  if (wf > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(255,246,226,${wf * .8})`; g.fillRect(0, 0, W, H); g.restore(); }

  // 30.11 那一帧反相
  if (t >= 30.11 && t < 30.11 + 1 / FPS) {
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'difference';
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.restore();
  }

  // 字幕（硬上硬下）
  if (qs.get('nosub')) ov.clearRect(0, 0, W, H); else hud(ov, t);

  const power = powerAt(t);
  let track = 0;
  if (t > 29.90 && t < 30.11) track = .5 * (1 - (t - 29.90) / .21);
  if (t > 30.11) track = .9 * Math.max(0, 1 - (t - 30.11) / .46);
  const noiseA = t > 30.11 ? .16 * Math.max(0, 1 - (t - 30.11) / .45) : .018;

  const over = { power, track, noiseA };
  // 最后一点粉：CRT 已经收成一点，让 emissive 兜住
  if (t > 29.18 && t < 30.11) {
    over.bloom = 1.2; over.glow = .6; over.expo = 1.1;
    // 空椅上的耳机位置：关机后留在黑屏上的那一点
    const a = Math.min(1, (t - 29.18) / .12) * (t > 30.0 ? Math.max(0, 1 - (t - 30.0) / .1) : 1);
    over.dotA = a * (t > 30.0 ? 1 : .95);
    over.dotP = [966 / W, 1 - 700 / H];
  } else over.dotA = 0;
  post.render(sc, gc, Math.round(t * FPS), ovc, over);
}

window.render = render;
window.DUR = DUR;
render(parseFloat(qs.get('t') ?? '3'));
window.READY = true;
