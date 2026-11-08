// main.js — 逐帧：物理刀痕板 + 人的刀痕 + 事件 + 刻字字幕
import { Impasto, Strokes, KNIFE, BRUSH, DAB, LINE } from '../engine/impasto.js';
import { buildSets } from './sets.js';

const P = window.PAL, C = P.C;
const hex = P.hex, mix = P.mix, clamp = P.clamp, hash = P.hash, lerp = P.lerp, smooth = P.smooth;
const W = 1920, H = 1080;
const BEAT = window.DATA.beat, KICKS = window.DATA.kicks;

const glc = document.createElement('canvas');
glc.width = W; glc.height = H;
const E = new Impasto(glc, { W, H, ss: 2 });
const plate = buildSets();
for (const k in plate) plate[k].batch = E.batch(plate[k].strokes.data());

const out = document.getElementById('c');
const ctx = out.getContext('2d');

// —— 机位 ——
function camAt(shot, t) {
  const k = shot.cam;
  if (k.length === 1) return { x: k[0][1], y: k[0][2], zoom: k[0][3], rot: k[0][4] || 0 };
  let a = k[0], b = k[k.length - 1];
  for (let i = 0; i < k.length - 1; i++) if (t >= k[i][0] && t <= k[i + 1][0]) { a = k[i]; b = k[i + 1]; break; }
  const f = clamp((t - a[0]) / Math.max(.001, b[0] - a[0]));
  const e = smooth(f);
  return { x: lerp(a[1], b[1], e), y: lerp(a[2], b[2], e), zoom: lerp(a[3], b[3], e), rot: lerp(a[4] || 0, b[4] || 0, e) };
}
function shotAt(t) {
  const S = window.SHOTS;
  for (let i = 0; i < S.length; i++) if (t >= S[i].t0 && t < S[i].t1) return S[i];
  return S[S.length - 1];
}
// 屏幕坐标 → 画板坐标
function toWorld(cam, sx, sy) {
  return [cam.x + (sx - W / 2) / cam.zoom, cam.y + (sy - H / 2) / cam.zoom];
}
const beatAt = t => Math.floor((t - .8456) / BEAT);
const beatT = i => .8456 + i * BEAT;

// —— 灰斑（那块画不上的地方） ——
function greySpot(st, cam, t) {
  if (st.set !== 'P1') return null;
  const a = plate.P1.anchors.grey;
  let r = 95;
  if (t > 128) r = 118;
  if (t > 154) r = 150;
  if (t > 179) r = 172;
  if (t > 216) r = 186;
  return { x: a.x, y: a.y, r };
}
function drawSpot(S, cam, t, st) {
  const g = greySpot(st, cam, t); if (!g) return;
  const u = 26, step = u * .8;
  for (let y = -g.r; y <= g.r; y += step) {
    const half = Math.sqrt(Math.max(0, g.r * g.r - y * y));
    for (let x = -half; x < half; x += u * 1.1) {
      S.push({ x: g.x + x, y: g.y + y, ang: -.06, len: u * 1.25, wid: u * .62,
        c: C.ground, c2: mix(C.ground, C.stone, .18), seed: hash(x * .13 + y * .7) * 900, type: KNIFE, hgt: .22, run: 0 });
    }
  }
  // 边上一圈被刀推起的堆积（亮）
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * 6.2832;
    S.push({ x: g.x + Math.cos(a) * (g.r + 6), y: g.y + Math.sin(a) * (g.r + 6), ang: a + 1.57, len: 30, wid: 7,
      c: mix(C.stone, C.white, .35), c2: C.ground, seed: hash(i * 3.7) * 900, type: KNIFE, hgt: 1.5, alpha: .8, run: 0 });
  }
}

// —— 雨 ——
function drawRain(S, cam, t, st) {
  if (st.model === 'D-2019' || st.model === 'DAWN') return;
  const dens = st.model === 'N-DRY' ? .35 : (st.model === 'N-SHOP' ? .25 : 1);
  const n = Math.round(54 * dens);
  const fr = Math.floor(t * 24);
  for (let i = 0; i < n; i++) {
    const vx = hash(i * 3.3 + 1), sp = 900 + hash(i * 7.1) * 700;
    const ph = (t * sp + hash(i * 2.7) * 1400) % 1400;
    const sx = vx * 2100 - 60, sy = ph - 200;
    const [x, y] = toWorld(cam, sx, sy);
    const L = 26 + hash(i * 5.5) * 34;
    S.push({ x, y, ang: 1.28, len: L / cam.zoom, wid: (1.6 + hash(i) * 1.6) / cam.zoom,
      c: mix(C.white, C.cold, .25), c2: C.white, seed: hash(i * 9.9) * 900, type: LINE, hgt: .4, alpha: .30 * (dens > .5 ? 1 : .8), app: t - .05, appDur: .06 });
  }
}

// —— 鼓点上的刀（G1/G2）：他每一下都在刷这座城 ——
function drawBeats(S, cam, t, st, focus) {
  const b = beatAt(t);
  for (let k = b; k >= b - 1; k--) {
    const bt = beatT(k);
    const age = t - bt;
    if (age < 0 || age > .30) continue;
    const n = st.model === 'N-DRY' ? 1 : 2;
    for (let j = 0; j < n; j++) {
      const h1 = hash(k * 17.3 + j * 5.1), h2 = hash(k * 29.7 + j * 3.3), h3 = hash(k * 41.9 + j);
      const cx = focus ? focus[0] + (h1 - .5) * 340 : cam.x + (h1 - .5) * 700;
      const cy = focus ? focus[1] + (h2 - .5) * 260 : cam.y + (h2 - .5) * 420;
      const col = st.model === 'D-2019' ? [C.summer, C.leaf, C.gold, C.wallw][Math.floor(h3 * 4)]
        : [C.sodium, C.stone, C.ochre, C.gold, C.cold][Math.floor(h3 * 5)];
      const u = 34;
      S.push({ x: cx, y: cy, ang: -.35 + h3 * .7, len: u * (1.4 + h1 * .9), wid: u * (.45 + h2 * .3),
        c: col, c2: mix(col, C.ground, .45), seed: h1 * 900, type: KNIFE, hgt: 1.1,
        app: bt, appDur: .10, alpha: st.model === 'N-DRY' ? .8 : .95, run: st.model === 'N-DRY' ? 1.4 : .6 });
    }
  }
}

// —— 人的手在哪（给刀找焦点） ——
function figFocus(f) {
  if (!f) return null;
  return [f.x + 1.2 * f.u, f.y - 3.4 * f.u];
}

// —— 每帧 ——
function drawFrame(t) {
  const st = shotAt(t);
  const model = P.MODELS[st.model];
  const cam = camAt(st, t);
  // 卡点 punch-in（每 2 拍）
  const bt = beatT(beatAt(t));
  const punch = 1 + .012 * Math.exp(-Math.max(0, t - bt) * 9);
  cam.zoom *= punch;
  // 擦光：每个小节头跳一下
  const bar = Math.floor((t - 1.736) / (BEAT * 4));
  const sweep = Math.sin(bar * 2.1) * .06;
  const post = { ...model, ground: model.ground,
    light: [model.light[0] + sweep, model.light[1], model.light[2]], expo: model.expo * (1 + .02 * Math.exp(-Math.max(0, t - bt) * 10)) };

  // 色模型 → 灰的量
  let grey = { 'N-RAIN': .70, 'N-SHOP': .42, 'D-2019': 0, 'N-DRY': .52, 'DAWN': .26 }[st.model];
  if (st.grey !== undefined) grey = st.grey;

  E.begin(model.ground);
  const pl = plate[st.set];
  // M1/M3：一帧之内整幅上色
  let reveal = -1e6, revDur = .55;
  if (st.id === 'S25' || st.id === 'S42') { reveal = 72.89; if (st.id === 'S42') reveal = 141.76; }
  else if (st.model === 'D-2019') { reveal = -1e6; }
  E.draw(pl.batch, { cam, t, grey, reveal, revDur, appear: -1e6 });

  // 动态刀痕
  const S = new Strokes(6000);
  const figs = st.figs.map(fn => fn(t, t - st.t0, st.t1 - st.t0)).filter(Boolean);
  drawSpot(S, cam, t, st);
  drawBeats(S, cam, t, st, figFocus(figs[0]));
  drawRain(S, cam, t, st);
  // 人物
  for (const f of figs) {
    const blink = (beatAt(t) % 7 === 0) && ((t - beatT(beatAt(t))) < .16) && f.expr !== 'empty';
    const one = { ...f };
    if (blink) one.expr = 'blink';
    one.sq = (f.sq ?? 1) * (1 + .015 * Math.exp(-Math.max(0, t - bt) * 14));
    window.FIG.fig(S, t, f.x, f.y, f.u, one);
  }
  E.drawNow(S.data(), { cam, t, grey, appear: -1e6, hgt: 1 });

  // 粉的痕迹：单独一遍，永不变灰
  const P2 = new Strokes(400);
  pinkMarks(P2, st, t, cam, figs);
  if (P2.n) E.drawNow(P2.data(), { cam, t, grey: 0, appear: -1e6 });

  E.finish(post);

  // 合成 + 字幕
  ctx.drawImage(glc, 0, 0);
  const txt = window.SUBS.draw(ctx, t, { size: 48 });
  return { shot: st.id, model: st.model, sub: txt || '' };
}

// 粉：只在"她待过"的位置，按五次递减
function pinkMarks(S, st, t, cam, figs) {
  const lvl = t < 100 ? 0 : t < 155 ? 1 : t < 179 ? 2 : t < 207 ? 3 : 4;
  const add = (x, y, r, a) => {
    const u = r / 3;
    for (let i = 0; i < 9; i++) {
      const aa = i / 9 * 6.2832;
      S.push({ x: x + Math.cos(aa) * r * .55, y: y + Math.sin(aa) * r * .35, ang: aa + 1.2, len: u * 1.2, wid: u * .5,
        c: P.PINK5[Math.min(lvl, 4)], c2: C.dry, seed: hash(i * 4.1) * 900, type: KNIFE, hgt: .8, alpha: a });
    }
  };
  if (st.id === 'S10') add(300, 700, 26, .95);            // 玻璃上的手印
  if (st.id === 'S26' || st.id === 'S46') add(560, 790, 46, .9);  // 长椅右半
  if (st.id === 'S29' || st.id === 'S49') add(1120, 1108, 30, .8); // 斑马线
  if (st.id === 'S48' || st.id === 'S56') add(1500, 520, 22, .7);  // 招牌一格
  if (st.id === 'S12' || st.id === 'S61') add(1095, 1105, 40, lvl < 4 ? .8 : .0);
  if (st.id === 'S36') add(560, 790, 46, .35);            // 起皮的粉
}

window.drawAt = t => drawFrame(t);
document.fonts.load('48px STKaiti').then(() => { window.READY = true; });
