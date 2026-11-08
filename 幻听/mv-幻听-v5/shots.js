// 14 个镜头。每个镜头 = 一个纯函数 render(t) → 画 g（画面）与 e（发光层）
import { W, H, path, cel, line, ribbon, flutter, rgba, mix, airbrush, vgrad, hash, TAU } from '/styles/cel-anime-80s/demo/cel.js';
import { drawClawd, drawReflection, emoTrack, emoOf } from './clawd.js';
import * as SET from './set.js';
import { ROOM } from './set.js';
import * as FX from './fx.js';
import { EMO, BEAT, T0, punch, hit, beatT, FPS } from './story.js';

const tcOf = t => Math.floor(t * 12) / 12;               // 角色 on twos
function cam(g, o = {}) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.translate(W / 2 + (o.x || 0), H / 2 + (o.y || 0));
  g.rotate(o.r || 0);
  g.scale(o.z || 1, o.z || 1);
  g.translate(-W / 2, -H / 2);
}
function charWithStamp(g, e, o) {
  drawClawd(g, null, o);
  if (e) drawClawd(e, null, { ...o, sil: true, alpha: 1, emoteMark: null, emote: null });
}
function whiteFlash(g, a) {
  if (a <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = rgba('#FFF6E2', a); g.fillRect(0, 0, W, H); g.restore();
}
function bounce(t, amp = 8, rate = 1) {
  const ph = ((t - T0) / BEAT) % 1;
  return -Math.abs(Math.sin(ph * Math.PI)) * amp * rate;
}
function legCycle(t, speed = 1) { return (t / BEAT) * Math.PI * speed; }

// 整间房（可复用）
function room(g, e, S, o = {}) {
  SET.drawBackWall(g, e, S);
  SET.drawLamp(g, e, S, o.t || 0, o.lamp ?? 1);
  SET.drawWindow(g, e, S, { open: o.open ?? 0, rain: o.rain ?? 1 });
  if (o.blind !== false) SET.blindBars(g, S, o.blindShift || 0, o.blindA ?? .16);
  SET.drawTable(g, S);
  SET.drawDeck(g, e, S, { x: 632, y: 648, vu: o.vu ?? -.35, spin: (o.t || 0) * 3, redOn: o.red ?? 0, pressed: o.pressed });
  // 桌上：一叠磁带
  for (let i = 0; i < 3; i++) SET.drawCassette(g, null, S, { x: 392, y: 662 - i * 17, scale: .42, spin: 0 });
  // 落地影子（先于家具，压住"悬浮感"）
  g.fillStyle = rgba(S.env.floorLo, .5);
  for (const c of [ROOM.chairA, ROOM.chairB]) {
    g.beginPath(); g.ellipse(c.x + 10, c.seat + 158, 128, 22, 0, 0, TAU); g.fill();
  }
  g.beginPath(); g.ellipse(578, ROOM.table.y + 190, 300, 26, 0, 0, TAU); g.fill();
  SET.drawChair(g, S, { x: ROOM.chairA.x, seat: ROOM.chairA.seat, dir: 1, scale: 1 });
  SET.drawChair(g, S, { x: ROOM.chairB.x, seat: ROOM.chairB.seat, dir: -1, scale: 1 });
  if (o.emptyPhones !== false) headphonesProp(g, S, 966, ROOM.chairB.seat - 30, 1.5);
}
function headphonesProp(g, S, x, y, sc = 1) {
  const PR = S.prop;
  g.save(); g.translate(x, y); g.scale(sc, sc);
  g.strokeStyle = S.char.line; g.lineWidth = 8; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-26, 4); g.bezierCurveTo(-26, -30, 26, -30, 26, 4); g.stroke();
  g.strokeStyle = PR.deck; g.lineWidth = 5.5; g.stroke();
  for (const sx of [-26, 26]) {
    cel(g, SET.rrPath(sx - 9, -12, 18, 30, 8), { f: PR.deck, s: PR.deckLo, so: [-5, 4], h: PR.deckHi, ho: [4, -4], l: S.char.line, lw: 2 });
  }
  g.restore();
}

// ———————————————————————— S01 开机 ————————————————————————
function S01({ t, g, e, S, A }) {
  cam(g, { z: 1.15 + .03 * (t / 1.92), x: 130, y: 20 });
  const tc = tcOf(t);
  room(g, e, S, { t: tc, vu: -.6, blindShift: t * .1 });
  charWithStamp(g, e, {
    set: S, x: 196, y: 660, scale: 1.9, view: 'front',
    emo: emoTrack(EMO, tc), pose: { sit: true, bob: bounce(tc, 3) },
  });
  // 光带横扫（k2 起）
  if (t > .98) FX.lightBand(g, { x: -400 + (t - .98) * 2600, y0: 0, y1: H, w: 260, col: S.env.lamp, a: .12, slant: -160 });
  whiteFlash(g, t < .16 ? .5 : 0);
}
// ———————————————————————— S02 房间·两把椅子 ————————————————————————
function S02({ t, lt, u, g, e, S, A }) {
  const seg = t < 3.80 ? 0 : 1;              // k8 硬切换构图
  const z = (seg ? 1.14 : 1.0) + (seg ? .05 : .1) * u;
  cam(g, { z, x: seg ? 80 : 30 + u * -30, y: seg ? 26 : 0 });
  const tc = tcOf(t), b = (t - T0) / BEAT;
  const blindShift = t < 4.74 ? t * .12 : (t - 4.74) * 1.5 + 4.74 * .12;
  room(g, e, S, { t: tc, vu: -.5 + .35 * Math.sin(b * 1.7), blindShift, blindA: t < 4.74 ? .14 : .2 });
  // 他：扣耳机（k6 之后手扶在耳机罩上）
  const em = emoTrack(EMO, tc);
  const k6 = t >= 2.86;
  const arm = k6 ? .55 + .1 * Math.sin(b * 2) : 1.45;
  charWithStamp(g, e, {
    set: S, x: 196, y: 660, scale: 1.9, view: 'front', emo: em,
    pose: { sit: true, bob: bounce(tc, 3), armR: arm, armL: k6 ? arm : 1.45 },
    emote: t > 6.1 && t < 6.4 ? 'excl' : null,
  });
  // 空椅子上那副耳机被光扫到
  if (t > 3.33 && t < 3.9) FX.lightBand(g, { x: 700 + (t - 3.33) * 1800, y0: 600, y1: 820, w: 120, col: S.env.lamp, a: .22, slant: -40 });
  // k6 冲击帧：2 帧反相
  if (t >= 2.86 && t < 2.86 + 2 / FPS) { FX.radialLines(g, 196, 640, 44, 11, 'rgba(255,240,210,.55)'); FX.invert(g); }
  if (t >= 3.80 && t < 3.80 + 1 / FPS) whiteFlash(g, .55);
  if (t > 1.05 && t < 2.4) FX.lightBand(g, { x: -500 + (t - 1.05) * 2400, y0: 0, y1: H, w: 300, col: S.env.lamp, a: .1, slant: -180 });
}

// ———————————————————————— S03 耳朵特写 ————————————————————————
function S03({ t, lt, g, e, S }) {
  g.fillStyle = S.env.wallLo; g.fillRect(0, 0, W, H);
  const tc = tcOf(t), b = (t - T0) / BEAT;
  // 巨大的耳机罩占据右半
  charWithStamp(g, e, {
    set: S, x: 620, y: 372, scale: 8.0, view: 'q', emo: emoTrack(EMO, tc),
    pose: { bob: bounce(tc, 2) }, lw: .42,
  });
  // 右边缘：玻璃（一条亮边，把粉雾按在玻璃上）
  g.fillStyle = 'rgba(20,26,40,.62)'; g.fillRect(1150, 0, 770, H);
  // 玻璃上该有百叶的影子 + 一层反光，否则右边 1/3 是空的
  for (let i = 0; i < 16; i++) {
    const x = 1150 + i * 52;
    g.fillStyle = rgba(S.env.blind, .28); g.fillRect(x, 0, 26, H);
    g.fillStyle = 'rgba(190,225,250,.07)'; g.fillRect(x + 26, 0, 3, H);
  }
  g.save(); g.globalCompositeOperation = 'screen';
  const gr2 = g.createLinearGradient(1400, 0, 1920, 900);
  gr2.addColorStop(0, 'rgba(160,205,240,0)'); gr2.addColorStop(.5, 'rgba(160,205,240,.1)'); gr2.addColorStop(1, 'rgba(160,205,240,0)');
  g.fillStyle = gr2; g.fillRect(1150, 0, 770, H); g.restore();
  g.fillStyle = 'rgba(198,228,255,.3)'; g.fillRect(1152, 0, 6, H);
  if (t > 6.15) {
    const amt = Math.min(1, (t - 6.15) / .7);
    FX.pinkFog(g, e, { x: 1640, y: 400, rx: 210 + 100 * amt, ry: 330 + 90 * amt, amt });
    if (amt > .45) drawReflection(g, null, {
      set: S, x: 1640, y: 400, scale: 3.4, view: 'front', alpha: .3 * amt,
      emo: emoOf('neutral'), pose: { bob: bounce(tc, 3) },
    });
  }
  if (t > 7.09) { // 呼出的雾 + 手印
    const a = Math.min(1, (t - 7.09) / .3);
    FX.pinkFog(g, e, { x: 1480, y: 620, rx: 200, ry: 230, amt: .8 * a });
    FX.handprint(g, e, { x: 1520, y: 640, s: 1.9, a: .6 * a });
  }
  FX.lightBand(g, { x: -600 + (t - 5.68) * 1500, y0: 0, y1: H, w: 340, col: S.env.lampHot, a: .14, slant: -300 });
  if (t < 5.68 + 1 / FPS) whiteFlash(g, .6);
}
// ———————————————————————— S04 隔玻璃对唱 ————————————————————————
function S04({ t, lt, u, g, e, S }) {
  cam(g, { z: 1.14 + .04 * u, x: 40, y: 30 });
  const tc = tcOf(t), b = (t - T0) / BEAT;
  SET.drawBackWall(g, e, S);
  SET.drawLamp(g, e, S, tc, .55);
  SET.drawWindow(g, e, S, { open: 0, rain: 1 });
  // 这一幕玻璃要比别处暗：它在照人，不是在透城市
  { const W0 = ROOM.win; g.fillStyle = 'rgba(10,14,32,.62)'; g.fillRect(W0.x, W0.y, W0.w, W0.h); }
  SET.blindBars(g, S, t * .2, .1);
  SET.drawTable(g, S);
  SET.drawDeck(g, e, S, { x: 632, y: 648, vu: -.2 + .3 * Math.sin(b * 2), spin: tc * 3 });
  SET.drawChair(g, S, { x: 980, seat: 750, dir: -1, scale: 1 });
  // 他（实焦，站在窗左侧，右手能按到玻璃）
  const em = emoTrack(EMO, tc);
  const press = t > 8.97 ? 1 : 0;
  g.fillStyle = rgba(S.env.floorLo, .55);
  g.beginPath(); g.ellipse(1000, 806, 120, 20, 0, 0, TAU); g.fill();
  charWithStamp(g, e, {
    set: S, x: 1000, y: 660, scale: 1.95, view: 'q', emo: em,
    pose: { bob: bounce(tc, 5), armR: press ? 1.02 : 1.45, armL: 1.5 },
    emote: t > 8.03 && t < 8.5 ? 'music' : null,
  });
  // 倒影：只在玻璃里，不落地、不投影子
  const aRef = Math.min(.9, Math.max(0, (t - 7.56) / .5));
  if (aRef > 0.02) {
    const W0 = ROOM.win;
    g.save();
    // 玻璃自己压暗一档：倒影才会从夜城的暖光里浮出来
    g.fillStyle = rgba(S.env.glass, .5); g.fillRect(W0.x + 6, W0.y + 6, W0.w - 12, W0.h - 12);
    g.beginPath(); g.rect(W0.x + 6, W0.y + 6, W0.w - 12, W0.h - 12); g.clip();
    drawReflection(g, null, {
      set: S, x: 1452, y: 612, scale: 1.30, view: 'q', alpha: Math.min(1, aRef * 1.15),
      emo: emoTrack(EMO, tc - BEAT * .5),          // 反拍落后半拍
      pose: { bob: -bounce(tc, 5), armR: press ? 1.02 : 1.45, armL: 1.5 },
    });
    // 玻璃本身压一层色 + 扫描线切割，让它读成"在玻璃后面"
    g.fillStyle = rgba(S.env.glass, .12); g.fillRect(W0.x, W0.y, W0.w, W0.h);
    g.fillStyle = rgba('#000', .16);
    for (let y = W0.y; y < W0.y + W0.h; y += 6) g.fillRect(W0.x, y, W0.w, 2);
    g.restore();
    FX.pinkDust(g, e, t, 1452, 470, 150, .34);
  }
  FX.lightBand(g, { x: -700 + (t - 7.56) * 1400, y0: 0, y1: H, w: 320, col: S.env.glassHi, a: .12, slant: -240 });
  if (t < 7.56 + 1 / FPS) whiteFlash(g, .65);
}
// ———————————————————————— S05 夜色 ————————————————————————
function S05({ t, lt, u, g, e, S, A }) {
  const tc = tcOf(t);
  const crane = 140 - u * 320;
  cam(g, { y: crane, z: 1.06 });
  // 夜空（气刷渐变）
  vgrad(g, -200, -300, W + 400, H + 600, [[0, '#070A1E'], [.45, '#101736'], [.78, '#232046'], [1, '#3A2350']]);
  // 三层视差
  const off = u * 120;
  g.drawImage(A.city[0].c, -off * .25, 0, A.city[0].w, 1000);
  g.drawImage(A.city[1].c, -off * .6 - 200, 60, A.city[1].w, 1000);
  g.drawImage(A.city[2].c, -off * 1.1 - 400, 140, A.city[2].w, 1000);
  e.save(); e.globalCompositeOperation = 'lighter';
  e.drawImage(A.city[0].e, -off * .25, 0, A.city[0].w, 1000);
  e.drawImage(A.city[1].e, -off * .6 - 200, 60, A.city[1].w, 1000);
  e.drawImage(A.city[2].e, -off * 1.1 - 400, 140, A.city[2].w, 1000);
  e.restore();
  FX.rain(g, t, { n: 130, slant: -.12, col: 'rgba(200,230,255,.32)' });
  // 窗台（窄的一条，压在画面底）
  g.fillStyle = S.prop.woodLo; g.fillRect(-400, 1032, W + 800, 200);
  g.fillStyle = rgba(S.env.cyan || '#37D6E0', .14); g.fillRect(-400, 1032, W + 800, 7);
  const em = emoTrack(EMO, tc);
  charWithStamp(g, e, { set: S, x: 860, y: 720, scale: 2.9, view: 'q', emo: em, pose: { bob: bounce(tc, 6) } });
  // 水洼里的小粉点（比玻璃里那个小一号）
  if (t > 10.38) {
    const a = Math.min(.9, (t - 10.38) / .3);
    g.fillStyle = rgba('#FF8FA8', .5 * a); g.beginPath(); g.ellipse(1430, 1060, 22, 8, 0, 0, TAU); g.fill();
    e.fillStyle = rgba('#FF6E92', .6 * a); e.beginPath(); e.ellipse(1430, 1060, 22, 8, 0, 0, TAU); e.fill();
  }
  // 霓虹光带扫过脸
  FX.lightBand(g, { x: 300 + ((t * 900) % 2400), y0: 0, y1: H, w: 220, col: S.env.magenta, a: .16, slant: -420 });
  if (t < 9.44 + 1 / FPS) whiteFlash(g, .7);
}
// ———————————————————————— S06 VU 表 ————————————————————————
function S06({ t, lt, g, e, S }) {
  g.fillStyle = S.env.wallLo; g.fillRect(0, 0, W, H);
  const tc = tcOf(t);
  let vu = -.9;
  if (t < 11.79) vu = -.9 + (t - 11.32) / .47 * 1.7;
  else if (t < 12.26) vu = .78 + .22 * Math.abs(Math.sin((t - 11.79) * 26));
  else if (t < 12.61) vu = .8 - (t - 12.26) / .35 * 1.75;
  else if (t < 12.73) vu = -.95;
  else vu = -.95 + (t - 12.73) / .47 * 1.35;
  const red = vu > .72 ? 1 : 0;
  SET.drawVU(g, e, S, { x: 960, y: 600, r: 430, vu, red, glare: Math.sin(t * 2.2) * .5 + .5 });
  // 表盘玻璃上：他的脸 + 一张粉色小脸
  const fa = Math.min(.5, Math.max(0, (t - 11.79) / .3));
  if (fa > 0) {
    drawReflection(g, null, { set: S, x: 796, y: 250, scale: .9, view: 'front', alpha: fa * .8, emo: emoOf('sad'), pose: { bob: 0 } });
    if (t < 12.4) drawReflection(g, null, { set: S, x: 1108, y: 236, scale: .78, view: 'front', alpha: fa, emo: emoOf('neutral') });
  }
  FX.lightBand(g, { x: -700 + (t - 11.32) * 1600, y0: 0, y1: H, w: 380, col: S.prop.cream, a: .12, slant: -200 });
  if (t < 11.32 + 1 / FPS) whiteFlash(g, .55);
}
// ———————————————————————— S07 风 ————————————————————————
function S07({ t, lt, u, g, e, S }) {
  const tc = tcOf(t), b = (t - T0) / BEAT;
  const roll = t > 14.14 ? 2 * Math.PI / 180 : 0;
  cam(g, { z: 1.04, y: 10, r: roll });
  const sh = bounce(tc, 3);                     // 屋里所有东西一起抖
  g.save(); g.translate(0, sh);
  SET.drawBackWall(g, e, S);
  SET.drawLamp(g, e, S, tc, .8);
  SET.drawWindow(g, e, S, { open: Math.min(1, (t - 13.20) / .4), rain: 1 });
  SET.drawTable(g, S);
  SET.drawDeck(g, e, S, { vu: -.4 + .4 * Math.sin(b * 3), spin: t * 6 });
  SET.drawChair(g, S, { x: ROOM.chairA.x, seat: ROOM.chairA.seat, dir: 1, scale: 1 });
  SET.drawChair(g, S, { x: ROOM.chairB.x + sh, seat: ROOM.chairB.seat + sh, dir: -1, scale: 1 });
  g.restore();
  // 桌上那一叠磁带被风掀起来：纸片向右上飞（房间没有窗帘，别硬加）
  const fly = Math.min(1, (t - 13.20) / .7);
  for (let i = 0; i < 5; i++) {
    const t0 = 13.20 + i * .12;
    if (t < t0) continue;
    const p2 = Math.min(1, (t - t0) / .9);
    const x = 400 + i * 26 + p2 * (1150 + i * 130) + Math.sin(p2 * 6 + i) * 30;
    const y = 650 - i * 16 - p2 * (420 + i * 80) + Math.cos(p2 * 5 + i * 2) * 40;
    g.save(); g.translate(x, y); g.rotate(-.5 + p2 * 2.4 + i * .3); g.globalAlpha = 1 - p2 * .2;
    const w2 = 54, h2 = 34;
    g.fillStyle = S.prop.card; g.fillRect(-w2 / 2, -h2 / 2, w2, h2);
    g.strokeStyle = rgba(S.char.line, .6); g.lineWidth = 2; g.strokeRect(-w2 / 2, -h2 / 2, w2, h2);
    g.strokeStyle = rgba(S.char.line, .35); g.lineWidth = 1.4;
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-w2 / 2 + 7, -8 + k * 8); g.lineTo(w2 / 2 - 7, -8 + k * 8); g.stroke(); }
    g.restore();
  }
  const em = emoTrack(EMO, tc);
  const walkPh = legCycle(t, 1);
  charWithStamp(g, e, {
    set: S, x: 1290 + Math.sin(t * 1.5) * 12, y: 626, scale: 2.05, view: 'q', emo: em,
    pose: { walk: true, legPhase: walkPh, stride: 1, bob: bounce(tc, 6) },
  });
  g.fillStyle = rgba(S.env.floorLo, .45);
  g.beginPath(); g.ellipse(1300, ROOM.floorY + 6, 135, 20, 0, 0, TAU); g.fill();
  FX.speedLines(g, 1290, 560, t, 1.2, 'rgba(230,245,255,.22)');
  FX.lightBand(g, { x: -800 + (t - 13.20) * 2200, y0: 0, y1: H, w: 260, col: S.env.cyan || '#6FE3FF', a: .14, slant: -200 });
  FX.lightBand(g, { x: 1400 - (t - 13.20) * 2200, y0: 0, y1: H, w: 200, col: S.env.glassHi, a: .1, slant: 160 });
  if (t < 13.20 + 1 / FPS) whiteFlash(g, .7);
}
// ———————————————————————— S08 碎 ————————————————————————
function S08({ t, lt, g, e, S, A }) {
  const tc = tcOf(t);
  const shatter = 15.68;
  if (t < shatter) {
    // 最高俯视：房间缩成一个盒子，窗外一整片灯海
    cam(g, { z: 1 });
    vgrad(g, 0, 0, W, H, [[0, '#080C22'], [.55, '#111a36'], [1, '#1a2444']]);
    g.drawImage(A.city[0].c, -300, 40, A.city[0].w, 1000);
    g.drawImage(A.city[1].c, -900, 120, A.city[1].w, 1000);
    e.save(); e.globalCompositeOperation = 'lighter';
    e.drawImage(A.city[0].e, -300, 40, A.city[0].w, 1000);
    e.drawImage(A.city[1].e, -900, 120, A.city[1].w, 1000);
    e.restore();
    // 盒子
    const bx = 560, by = 250, bs = .235;
    g.save(); g.translate(bx, by); g.scale(bs, bs); g.translate(-960, -420);
    SET.drawBackWall(g, e, S);
    SET.drawLamp(g, e, S, tc, 1);
    SET.drawWindow(g, e, S, { open: .3, rain: 1 });
    SET.drawTable(g, S);
    SET.drawDeck(g, e, S, { vu: .6, spin: t * 9 });
    SET.drawChair(g, S, { x: ROOM.chairA.x, seat: ROOM.chairA.seat, dir: 1, scale: 1 });
    drawClawd(g, null, { set: S, x: 900, y: 690, scale: 1.9, view: 'q', emo: emoTrack(EMO, tc), pose: { bob: bounce(tc, 5) } });
    g.restore();
    // 盒子边（切开的墙）
    g.strokeStyle = S.env.wallLo; g.lineWidth = 10;
    g.strokeRect(bx - 960 * bs + 960 * 0, by, 1920 * bs, H * bs * .78);
    g.strokeStyle = rgba('#9FD8FF', .25); g.lineWidth = 3;
    g.strokeRect(bx + 2, by + 2, 1920 * bs - 4, H * bs * .78 - 4);
    // letterbox 压进（k33）
    if (t > 15.54) {
      const k = Math.min(1, (t - 15.54) / .12);
      g.fillStyle = '#000'; g.fillRect(0, 0, W, 130 * k); g.fillRect(0, H - 130 * k, W, 130 * k);
    }
    if (t > 15.07 + 1 / FPS) { /* 无白闪：这一段是俯视接碎 */ }
    return;
  }
  // —— 碎了 ——
  const p = Math.min(1, (t - shatter) / .85);
  cam(g, { z: 1.02 });
  vgrad(g, 0, 0, W, H, [[0, '#0A0E24'], [.55, '#16203E'], [1, '#24304F']]);
  const bright = .6 + .4 * p;
  g.globalAlpha = bright;
  g.drawImage(A.city[1].c, -700 - p * 200, 100, A.city[1].w, 1000);
  g.drawImage(A.city[2].c, -300 - p * 700, 220, A.city[2].w, 1000);
  g.globalAlpha = 1;
  e.save(); e.globalCompositeOperation = 'lighter'; e.globalAlpha = bright;
  e.drawImage(A.city[1].e, -700 - p * 200, 100, A.city[1].w, 1000);
  e.restore();
  // 360 片碎片：靠近中心的一批在身后，远处的一批从镜头前飞过
  FX.drawShards(g, e, A.shards, p, S, { filter: sh => sh.d < 400 && hash(sh.mx * .37 + sh.my * 1.1) > .3 });
  // 他跨出窗（旋转一次）
  const spin = Math.min(1, (t - shatter) / .45);
  g.fillStyle = rgba('#000', .35);
  g.beginPath(); g.ellipse(960, 760, 190, 34, 0, 0, TAU); g.fill();
  // 转身用横向挤压做，不许落到 side 视图（side 只有半张脸，会读成"半个身子"）
  const sqx = spin > .18 && spin < .78 ? 1 - .2 * Math.sin((spin - .18) / .6 * Math.PI) : 1;
  charWithStamp(g, e, {
    set: S, x: 960, y: 560 - p * 30, scale: 3.1,
    view: spin < .45 ? 'front' : 'q',
    emo: emoTrack(EMO, tc),
    pose: { bob: bounce(tc, 10), tilt: -.08 + p * .08, armL: .5, armR: .5, squashX: sqx },
    emoteMark: 'music',
  });
  FX.drawShards(g, e, A.shards, p, S, { filter: sh => sh.d >= 400 && hash(sh.mx * .51 + sh.my) > .58 });
  if (p < .28) FX.radialLines(g, 960, 470, 16, 21, 'rgba(255,255,255,.09)', 700);
  whiteFlash(g, Math.max(0, .92 - p * 9));
  if (p < .05) FX.invert(g);
}
// ———————————————————————— S09 城市 ————————————————————————
function S09({ t, lt, u, g, e, S, A }) {
  const tc = tcOf(t);
  const off = (t - 16.95) * 980;
  cam(g, { z: 1.0 });
  vgrad(g, 0, 0, W, H, [[0, '#0A0F26'], [.5, '#121A38'], [1, '#1B2544']]);
  g.drawImage(A.city[0].c, -off * .2, 80, A.city[0].w, 1000);
  g.drawImage(A.city[1].c, -off * .55 - 300, 140, A.city[1].w, 1000);
  g.drawImage(A.city[2].c, -off * 1.0 - 600, 200, A.city[2].w, 1000);
  e.save(); e.globalCompositeOperation = 'lighter';
  e.drawImage(A.city[0].e, -off * .2, 80, A.city[0].w, 1000);
  e.drawImage(A.city[1].e, -off * .55 - 300, 140, A.city[1].w, 1000);
  e.drawImage(A.city[2].e, -off * 1.0 - 600, 200, A.city[2].w, 1000);
  e.restore();
  // 湿地
  g.save(); g.globalAlpha = .55;
  g.translate(0, 866); g.scale(1, -1.15);
  g.drawImage(A.city[1].c, -off * .55 - 300, -140, A.city[1].w, 1000);
  g.restore();
  e.save(); e.globalCompositeOperation = 'lighter'; e.globalAlpha = .3;
  e.translate(0, 866); e.scale(1, -1.15);
  e.drawImage(A.city[1].e, -off * .55 - 300, -140, A.city[1].w, 1000);
  e.restore();
  vgrad(g, 0, 862, W, 218, [[0, 'rgba(10,20,40,.18)'], [.5, 'rgba(6,10,22,.5)'], [1, 'rgba(3,6,14,.85)']]);
  g.fillStyle = 'rgba(150,200,230,.16)'; g.fillRect(0, 860, W, 3);   // 路缘
  g.fillStyle = 'rgba(6,10,20,.5)'; g.fillRect(0, 863, W, 3);
  FX.rain(g, t, { n: 170, slant: -.1, col: 'rgba(200,230,255,.3)' });
  // 幕墙：整面楼是玻璃（竖梃 + 楼层横线），倒影只活在它里面
  const glassX = 1040, glassW = 1000, gTop = 0, gBot = 862;
  g.fillStyle = 'rgba(8,13,26,.55)'; g.fillRect(glassX, gTop, glassW, gBot - gTop);
  g.fillStyle = 'rgba(120,180,210,.07)'; g.fillRect(glassX, gTop, glassW, gBot - gTop);
  // 玻璃幕墙：楼板横线 + 几根粗竖梃（竖梃是让人读成"玻璃"的唯一线索）
  for (const yy of [88, 300, 560]) { g.fillStyle = 'rgba(150,200,230,.06)'; g.fillRect(glassX, yy, glassW, 2); }
  for (const vx of [glassX, glassX + 330, glassX + 660, glassX + glassW]) {
    g.fillStyle = 'rgba(12,18,32,.9)'; g.fillRect(vx - 7, gTop, 14, gBot - gTop);
    g.fillStyle = 'rgba(170,215,240,.3)'; g.fillRect(vx - 7, gTop, 3, gBot - gTop);
    g.fillStyle = 'rgba(70,110,150,.35)'; g.fillRect(vx + 4, gTop, 3, gBot - gTop);
  }
  // 底横梁
  g.fillStyle = 'rgba(12,18,32,.92)'; g.fillRect(glassX - 10, gBot - 8, glassW + 20, 18);
  g.fillStyle = 'rgba(170,215,240,.22)'; g.fillRect(glassX - 10, gBot - 8, glassW + 20, 3);
  // 玻璃里该有城市的倒影（镜像、压暗、只在幕墙内）
  g.save(); g.beginPath(); g.rect(glassX, gTop, glassW, gBot - gTop); g.clip();
  g.globalAlpha = .3; g.translate(glassX * 2 + glassW, 0); g.scale(-1, 1);
  g.drawImage(A.city[2].c, glassX - 220 - off * .55, 130, A.city[2].w, 1000);
  g.restore();
  // 斜向反光：一块玻璃该有的一道光
  g.save(); g.beginPath(); g.rect(glassX, gTop, glassW, gBot - gTop); g.clip();
  g.globalCompositeOperation = 'screen';
  const sg = g.createLinearGradient(glassX, gTop, glassX + 620, gBot);
  sg.addColorStop(0, 'rgba(180,225,255,0)'); sg.addColorStop(.46, 'rgba(180,225,255,.07)');
  sg.addColorStop(.54, 'rgba(180,225,255,.11)'); sg.addColorStop(1, 'rgba(180,225,255,0)');
  g.fillStyle = sg; g.fillRect(glassX, gTop, glassW, gBot - gTop);
  g.restore();
  // 他（前景跑）—— 必须真的走到玻璃前，否则"手对手"是隔空 740px 的假动作
  const em = emoTrack(EMO, tc);
  const hand = t > 17.89 && t < 18.4;
  const meet = Math.min(
    Math.max(0, Math.min(1, (t - 17.48) / .36)),
    Math.max(0, Math.min(1, (18.36 - t) / .36))
  );
  const xA = 620 + meet * 232;          // 620 → 852
  const xB = 1360 - meet * 128;         // 1360 → 1232
  const touch = meet > .22;
  charWithStamp(g, e, {
    set: S, x: xA, y: 664, scale: 3.0, view: 'q', emo: em,
    pose: {
      walk: meet < .55, legPhase: legCycle(t, 1.05), stride: 1 - meet * .85,
      bob: bounce(tc, 8), armR: touch ? 1.42 : 1.4, armL: touch ? 1.5 : 1.5,
    },
    emote: touch ? 'music' : (t > 18.36 && t < 18.8 ? 'quest' : null),
  });
  // 幕墙里的倒影并肩跑
  const aRef = t < 19.77 ? .85 : Math.max(0, .85 * (1 - (t - 19.77) / .35));
  if (aRef > .02) {
    g.save(); g.beginPath(); g.rect(glassX + 4, gTop, glassW - 8, gBot - gTop); g.clip();
    drawReflection(g, null, {
      set: S, x: xB, y: 664, scale: 3.0, view: 'q', alpha: aRef,
      emo: emoTrack(EMO, tc - BEAT * .46),
      pose: {
        walk: meet < .55, legPhase: legCycle(t - BEAT * .46, 1.05), stride: 1 - meet * .85,
        armL: touch ? 1.42 : 1.4, armR: 1.5,
      },
    });
    // 玻璃自己压一档 + 扫描线：倒影才钉在玻璃后面，不是站在街上
    g.fillStyle = rgba(S.env.glass, .26); g.fillRect(glassX, gTop, glassW, gBot - gTop);
    g.fillStyle = 'rgba(0,0,0,.13)';
    for (let yy = gTop; yy < gBot; yy += 6) g.fillRect(glassX, yy, glassW, 2);
    if (t > 19.77) { // 碎成一排粉点
      for (let i = 0; i < 16; i++) {
        const k = Math.min(1, (t - 19.77) / .3);
        g.fillStyle = rgba('#FF9CB0', (1 - k) * .9);
        g.beginPath(); g.arc(1360 + (hash(i) - .5) * 300 * k, 664 + (hash(i * 3) - .5) * 340 * k, 7, 0, TAU); g.fill();
      }
    }
    g.restore();
  }
  // 手贴玻璃：手掌印比手臂读得清（手藏在耳机罩后面，手臂伸出去看不见）
  if (meet > .2) {
    const ha = Math.min(1, (meet - .2) / .3);
    const lift = Math.min(1, Math.max(0, (t - 17.62) / .18));
    const hy = 722 - 52 * (1 - lift);          // 胸口高度，从下往上贴到玻璃上
    // 两人之间那块玻璃（没有它，手印就是浮在空气里的贴纸）
    g.save(); g.globalAlpha = .55 * ha * lift;
    g.fillStyle = 'rgba(150,200,235,.10)'; g.fillRect(1002, 250, 78, 620);
    g.fillStyle = 'rgba(200,235,255,.42)'; g.fillRect(1002, 250, 2, 620);
    g.fillStyle = 'rgba(200,235,255,.42)'; g.fillRect(1078, 250, 2, 620);
    g.restore();
    // 玻璃被按出来的光环
    g.save(); g.globalCompositeOperation = 'screen';
    for (let i = 1; i <= 3; i++) {
      g.strokeStyle = rgba('#FFE6F0', .2 * ha * lift / i);
      g.lineWidth = 3 - i * .5;
      g.beginPath(); g.arc(1041, hy, 34 + i * 20 + Math.sin(t * 5 + i) * 2.5, 0, TAU); g.stroke();
    }
    const cg = g.createRadialGradient(1041, hy, 3, 1041, hy, 78);
    cg.addColorStop(0, rgba('#FFF2F6', .3 * ha * lift)); cg.addColorStop(1, rgba('#FFF2F6', 0));
    g.fillStyle = cg; g.fillRect(960, hy - 100, 170, 200);
    g.restore();
    FX.handprint(g, null, { x: 1030, y: hy, s: 1.5, a: .9 * ha * lift, col: '#F3B29A' });
    FX.handprint(g, null, { x: 1052, y: hy, s: 1.5, a: .9 * ha * lift, col: '#E58384' });
  }
  if (hand && t < 17.89 + 2 / FPS) { FX.radialLines(g, 1041, 720, 22, 11, 'rgba(255,238,246,.65)'); FX.invert(g); }
  FX.speedLines(g, xA + 60, 700, t, 1.6, 'rgba(220,240,255,.18)');
  if (t < 16.95 + 1 / FPS) whiteFlash(g, .7);
}
// ———————————————————————— S10 雨 ————————————————————————
function S10({ t, lt, u, g, e, S }) {
  cam(g, { z: 1.12, x: 190, y: 30 });
  const tc = tcOf(t);
  room(g, e, S, { t: tc, vu: -.7, blindShift: t * .2, open: u > .5 ? .6 : 0 });
  // 地板已经湿了
  g.fillStyle = rgba('#7AB6D0', .12); g.fillRect(0, ROOM.floorY, W, H - ROOM.floorY);
  // 他背影
  charWithStamp(g, e, { set: S, x: 1120, y: 700, scale: 1.85, view: 'qback', emo: emoTrack(EMO, tc), pose: { bob: bounce(tc, 3) } });
  // 屋里在下雨
  FX.rain(g, t, { n: 240, slant: -.08, y0: 0, y1: H, col: 'rgba(190,225,245,.38)' });
  // 窗玻璃上浮出一个人形：她没回来，但玻璃记得（粉色后半段不能彻底断线）
  {
    const a = Math.max(0, Math.min(1, (t - 20.95) / .55)) * Math.max(0, Math.min(1, (22.45 - t) / .55));
    if (a > .01) {
      g.save();
      g.beginPath(); g.rect(ROOM.win.x + 8, ROOM.win.y + 8, ROOM.win.w - 16, ROOM.win.h - 16); g.clip();
      FX.pinkFog(g, null, { x: 1462, y: 400, rx: 210 * a + 40, ry: 260 * a + 40, amt: .3 * a });  // 不进发光层，否则 bloom 把人形炸成一团光
      drawReflection(g, null, {
        set: S, x: 1462, y: 604, scale: 1.65, view: 'front', alpha: .52 * a,
        emo: emoOf('sad'), pose: { bob: 0 },
      });
      g.restore();
    }
  }
  // 推窗 / 手印（他自己的手，白的）
  if (t > 21.65) {
    const k = Math.min(1, (t - 21.65) / .3);
    FX.handprint(g, e, { x: 1180, y: 560, s: 1.6, a: .5 * k });
  }
  if (t > 21.65 && t < 21.65 + 2 / FPS) FX.invert(g);
  FX.lightBand(g, { x: -600 + (t - 20.71) * 1300, y0: 0, y1: H, w: 300, col: S.env.green || '#8FE3B0', a: .1, slant: -160 });
  if (t < 20.71 + 1 / FPS) whiteFlash(g, .7);
}
// ———————————————————————— S11 脸 / 脚 ————————————————————————
function S11({ t, lt, g, e, S }) {
  const tc = tcOf(t), b = (t - T0) / BEAT;
  if (t < 23.53) {           // snap zoom 到脸
    const k = Math.min(1, (t - 22.59) / .18);
    const z = 1 + k * .06;
    g.fillStyle = S.env.wallLo; g.fillRect(0, 0, W, H);
    cam(g, { z, y: 0 });
    SET.drawBackWall(g, e, S);
    SET.drawWindow(g, e, S, { open: .5, rain: 1 });
    charWithStamp(g, e, {
      set: S, x: 960, y: 436, scale: 8, view: 'front', emo: emoTrack(EMO, tc),
      pose: { bob: bounce(tc, 2) * .5 }, lw: .38,
    });
    // 一滴泪（on ones，慢慢落）
    if (t > 23.06) {
      const p = Math.min(1, (t - 23.06) / .45);
      g.fillStyle = 'rgba(200,240,255,.9)';
      g.beginPath(); g.ellipse(1022, 560 + p * 210, 11, 20, 0, 0, TAU); g.fill();
      e.fillStyle = 'rgba(180,235,255,.5)';
      e.beginPath(); e.ellipse(1022, 560 + p * 210, 16, 26, 0, 0, TAU); e.fill();
    }
    if (t < 22.59 + 2 / FPS) FX.invert(g);
    return;
  }
  // 脚：只画脚和腿，不放大整个方块小人（放大了读出来是蜘蛛，不是脚）
  const FL = 706;                                    // 脚踩的地板线
  const C = S.char, PR = S.prop;
  vgrad(g, 0, 0, W, FL, [[0, mix(S.env.wallLo, '#000', .62)], [.8, mix(S.env.wallLo, '#000', .3)], [1, mix(S.env.wallLo, '#000', .1)]]);
  // 地板
  vgrad(g, 0, FL, W, H - FL, [[0, mix(S.env.floorHi, '#000', .16)], [.4, S.env.floor], [1, mix(S.env.floorLo, '#000', .55)]]);
  g.strokeStyle = rgba(S.env.floorLo, .5); g.lineWidth = 2.6;
  for (let i = 0; i < 5; i++) { const y = FL + 26 + i * i * 14; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.fillStyle = rgba(S.env.floorLo, .9); g.fillRect(0, FL - 8, W, 9);   // 踢脚阴影
  g.fillStyle = rgba(S.env.floorHi, .5); g.fillRect(0, FL + 1, W, 3);
  // 灯打下来的一圈光池
  g.save(); g.globalCompositeOperation = 'screen';
  const WARM = '#F3B24A', WARMH = '#FFE6B4';
  const pool = g.createRadialGradient(960, FL + 70, 50, 960, FL + 70, 700);
  pool.addColorStop(0, rgba(WARMH, .3)); pool.addColorStop(.45, rgba(WARM, .11)); pool.addColorStop(1, rgba(WARM, 0));
  g.fillStyle = pool; g.fillRect(0, 0, W, H); g.restore();
  e.save(); e.globalCompositeOperation = 'lighter';
  airbrush(e, 960, FL + 40, 620, 170, WARM, .26); e.restore();

  const b2 = (t - T0) / BEAT;
  const liftL = Math.max(0, Math.sin(b2 * Math.PI)) * 34;         // 正拍：右脚抬起
  const liftR = Math.max(0, Math.sin(b2 * Math.PI + Math.PI)) * 34;

  function oneFoot(cx, lift, flip) {
    const fy = FL - lift;
    // 影子：抬起来就收紧变淡
    g.fillStyle = rgba('#000', .62 - lift * .008);
    g.beginPath(); g.ellipse(cx + 10, FL + 8, 92 - lift * .55, 24 - lift * .18, 0, 0, TAU); g.fill();
    g.fillStyle = rgba('#000', .34);
    g.beginPath(); g.ellipse(cx + 10, FL + 8, 58 - lift * .35, 14 - lift * .1, 0, 0, TAU); g.fill();
    // 腿（从画面上方伸下来，被压暗）
    const legTop = -160, legBot = fy - 26;
    g.fillStyle = mix(C.sh, '#000', .3);
    g.beginPath(); g.roundRect(cx - 62, legTop, 124, legBot - legTop, 34); g.fill();
    g.fillStyle = mix(C.mid, '#000', .34);
    g.beginPath(); g.roundRect(cx - 54, legTop, 76, legBot - legTop, 30); g.fill();
    g.fillStyle = rgba(C.lit, .16);   // 受光的一侧
    g.beginPath(); g.roundRect(cx - 50, legTop, 26, legBot - legTop, 13); g.fill();
    // 脚：脚背 + 脚趾 + 硬边阴影
    g.save(); g.translate(cx, fy); g.scale(flip, 1);
    g.fillStyle = C.mid;
    g.beginPath(); g.ellipse(0, -34, 70, 46, 0, 0, TAU); g.fill();          // 脚背
    g.beginPath(); g.ellipse(6, 0, 82, 34, 0, 0, TAU); g.fill();            // 脚掌
    // 阴影（右下，硬边）
    g.save();
    g.beginPath(); g.ellipse(6, 0, 82, 34, 0, 0, TAU); g.clip();
    g.fillStyle = C.sh; g.beginPath(); g.ellipse(34, 14, 76, 34, 0, 0, TAU); g.fill();
    g.restore();
    // 高光（左上）
    g.fillStyle = C.lit;
    g.beginPath(); g.ellipse(-30, -46, 26, 16, -.4, 0, TAU); g.fill();
    // 轮廓
    g.strokeStyle = C.line; g.lineWidth = 4;
    g.beginPath(); g.ellipse(0, -34, 70, 46, 0, Math.PI, TAU); g.stroke();   // 只画上半弧，接在脚掌上
    // 三个脚趾（在脚掌前面，不能被盖住）
    for (const [tx, tw2, td] of [[-46, 30, 0], [-2, 33, -6], [42, 29, 2]]) {
      const yy = 22 + td;
      cel(g, SET.rrPath(tx - tw2 / 2, yy - tw2 / 2, tw2, tw2 * 1.28, tw2 * .46),
        { f: mix(C.mid, C.lit, .3), s: C.sh, so: [6, 6], h: C.lit, ho: [-4, -4], l: C.line, lw: 3.2 });
    }
    g.restore();
  }
  oneFoot(818, liftL, 1);
  oneFoot(1102, liftR, -1);
  // 头顶的墙压进黑里（画面上方留白给暗，不给人）
  vgrad(g, 0, 0, W, 240, [[0, 'rgba(3,4,9,.8)'], [1, 'rgba(3,4,9,0)']]);
  FX.lightBand(g, { x: -600 + (t - 23.53) * 1500, y0: 0, y1: H, w: 340, col: S.prop.cream, a: .09, slant: -120 });
}
// ———————————————————————— S12 磁带 ————————————————————————
function S12({ t, lt, u, g, e, S }) {
  cam(g, { z: 1.0, y: 0 });
  const tc = tcOf(t);
  room(g, e, S, { t: tc, vu: -.25, blindShift: t * .14, open: .9, rain: 1, emptyPhones: false });
  // 桌上那盘磁带：跟录音机同一景别，J-card 上的 01–07 才看得见
  const k = Math.min(1, (t - 24.47) / .5);
  SET.drawCassette(g, e, S, { x: 838, y: 616, scale: 1.02, spin: t * 4, lit: Math.floor((t - 24.47) * 8) });
  // 带子从带盒的下沿被抽出来，向右上飘出窗
  const spine = [];
  const N = 26;
  const reach = 200 + 880 * k;
  for (let i = 0; i < N; i++) {
    const u2 = i / (N - 1);
    // 先垂下去一段（带子是被拉出来的），再被风带向右上
    const sag = Math.sin(Math.min(1, u2 * 2.6) * Math.PI * .5);
    const bx = 838 + u2 * reach;
    const by = 713 + sag * 120 * (1 - u2) * (.4 + .6 * k) - u2 * reach * .40
      + Math.sin(u2 * 4.6 - t * 6) * 34 * u2;
    spine.push([bx, by]);
  }
  SET.tapeRibbon(g, e, S, { spine, width: 11 });
  g.strokeStyle = rgba(S.prop.deckLo, .45); g.lineWidth = 1.5;
  g.beginPath(); spine.forEach((p, i) => i ? g.lineTo(p[0], p[1] - 2.6) : g.moveTo(p[0], p[1] - 2.6)); g.stroke();
  // 他坐在桌边，伸手去够那根带子
  charWithStamp(g, e, {
    set: S, x: 196, y: 660, scale: 1.9, view: 'q', emo: emoTrack(EMO, tc),
    pose: { sit: true, bob: bounce(tc, 4), armR: 1.05 + .12 * Math.sin((t - T0) / BEAT * 2), armL: 1.5 },
    emote: t > 25.05 && t < 25.4 ? 'quest' : null,
  });
  FX.lightBand(g, { x: -600 + (t - 24.47) * 1500, y0: 0, y1: H, w: 340, col: S.prop.goldHi, a: .14, slant: -200 });
  if (t < 24.47 + 1 / FPS) whiteFlash(g, .6);
}
// ———————————————————————— S13 河（顶视） ————————————————————————
function S13({ t, lt, g, e, S }) {
  vgrad(g, 0, 0, W, H, [[0, '#05070F'], [.5, '#0B1120'], [1, '#141C2E']]);
  // 城市缩成底下的灯点（顶视看下去，只剩一片散开的光）
  for (let i = 0; i < 900; i++) {
    const x = hash(i * 1.3) * W, y = 90 + hash(i * 2.7) * (H - 90);
    const warm = hash(i * 4.1) > .42;
    g.fillStyle = rgba(warm ? '#F3B24A' : '#37D6E0', .12 + hash(i * 5.3) * .4);
    g.fillRect(x, y, 3.4, 3.4);
    if (hash(i * 7.9) > .86) { e.fillStyle = rgba(warm ? '#F3B24A' : '#37D6E0', .2); e.fillRect(x - 2, y - 2, 7, 7); }
  }
  // 那间房间：缩成底下一个还亮着的盒子
  const bx = 108, by = 600, bs = .345;
  g.fillStyle = 'rgba(4,7,14,.68)'; g.fillRect(bx - 24, by - 24, 1920 * bs + 48, 1080 * bs * .74 + 48);
  g.save(); g.translate(bx, by); g.scale(bs, bs);
  SET.drawBackWall(g, null, S);            // 不进发光层：缩放不改 bloom 半径，一进去就炸成光斑
  SET.drawWindow(g, null, S, { open: 0, rain: 0 });
  SET.drawLamp(g, null, S, t, .95);
  SET.drawTable(g, S);
  SET.drawChair(g, S, { x: ROOM.chairA.x, seat: ROOM.chairA.seat, dir: 1, scale: 1 });
  drawClawd(g, null, { set: S, x: 196, y: 660, scale: 1.9, view: 'front', emo: emoOf('starstruck'), pose: { sit: true } });
  g.restore();
  // 房间的暖光溢出来一点
  g.save(); g.globalCompositeOperation = 'screen';
  airbrush(g, bx + 331, by + 230, 430, 340, '#F3B24A', .2); g.restore();
  e.save(); e.globalCompositeOperation = 'lighter';
  airbrush(e, bx + 331, by + 230, 340, 270, '#F3B24A', .34); e.restore();
  // 盒子边（这是被切开的一面墙）
  g.strokeStyle = rgba('#9FD8FF', .22); g.lineWidth = 3;
  g.strokeRect(bx, by, 1920 * bs, 1080 * bs * .72);

  // 带子成河：一条被抽出来的带子横过整座城
  const spine = [];
  const N = 52;
  for (let i = 0; i < N; i++) {
    const u2 = i / (N - 1);
    spine.push([-260 + u2 * 2500, 452 + Math.sin(u2 * 3.0 + t * 1.5) * 92 - u2 * 44]);
  }
  const RW = 98;
  // 河身：中间半透明的带基 + 两侧硬金边（读成磁带，不是一条光）
  g.save();
  const bodyP = path(ribbon(spine, i => RW * (1 - .18 * i)));
  g.fillStyle = 'rgba(16,11,7,.72)'; g.fill(bodyP);
  g.fillStyle = rgba(S.prop.gold, .2); g.fill(bodyP);
  g.save(); g.clip(bodyP);
  // 河心一道亮，两侧暗下去：才读成一条带子而不是一块金色
  for (let i = 0; i < N; i += 1) {
    const p = spine[i];
    g.fillStyle = rgba(S.prop.goldHi, .10 * (1 - Math.abs(i / N - .5)));
    g.fillRect(p[0] - 20, p[1] - RW * .5, 40, RW);
  }
  g.restore();
  g.strokeStyle = rgba(S.prop.goldHi, .5); g.lineWidth = 3.4; g.stroke(bodyP);
  // 磁迹：沿着河的横向细纹
  g.strokeStyle = rgba('#2A1B0C', .35); g.lineWidth = 2;
  for (const f of [-.24, 0, .24]) {
    g.beginPath();
    spine.forEach((p, i) => {
      const q = spine[Math.min(N - 1, i + 1)], r = spine[Math.max(0, i - 1)];
      const tx = q[0] - r[0], ty = q[1] - r[1], L = Math.hypot(tx, ty) || 1;
      const nx = -ty / L, ny = tx / L;
      const xx = p[0] + nx * RW * f, yy = p[1] + ny * RW * f;
      i ? g.lineTo(xx, yy) : g.moveTo(xx, yy);
    });
    g.stroke();
  }
  g.restore();
  SET.tapeRibbon(g, e, S, { spine, width: RW * .62 });
  // 河面倒影（很淡，只是给人一点"底下还有地面"的暗示）
  g.save(); g.globalAlpha = .1; g.translate(0, 1010); g.scale(1, -1);
  SET.tapeRibbon(g, null, S, { spine, width: RW * .8 });
  g.restore();

  // 01–07 逐个亮起（沿着河，一个一个点过去）
  g.font = '700 46px STKaiti'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const lit = Math.floor((t - 26.35) * 8);
  for (let i = 0; i < 7; i++) {
    const u2 = .13 + i * .112;
    const idx = Math.round(u2 * (N - 1));
    const p = spine[idx];
    const x = p[0], y = p[1] - 92;
    const on = (t < 27.3 ? i <= lit : i <= 6 - Math.floor((t - 27.3) * 9));
    // 数字底下一记暖光，才不像浮在空气里
    if (on) { g.save(); g.globalCompositeOperation = 'screen'; airbrush(g, x, y, 46, 34, '#FFD98A', .3); g.restore(); }
    g.fillStyle = on ? '#FFF3D0' : rgba(S.prop.gold, .2);
    g.fillText(String(i + 1).padStart(2, '0'), x, y);
    if (on) { e.fillStyle = rgba(S.prop.gold, .5); e.fillText(String(i + 1).padStart(2, '0'), x, y); }
  }
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  FX.lightBand(g, { x: -800 + ((t * 900) % 3200), y0: 0, y1: H, w: 300, col: S.prop.goldHi, a: .11, slant: -200 });
  if (t < 26.35 + 1 / FPS) whiteFlash(g, .55);
}
// ———————————————————————— S14 关机 ————————————————————————
function S14({ t, lt, g, e, S }) {
  const tc = tcOf(t);
  // 首尾同框：跟开场同一个机位，两把椅子都在，窗边那把还是空着
  cam(g, { z: 1.0 });
  room(g, e, S, { t: 28.23, vu: -.30, blindShift: 0, blindA: .14, open: 0, rain: 0, red: 0 });
  // 他站起来，走到窗边那把空椅前 —— 开场他坐桌边、空椅在窗边，这里第一次走到它面前
  const walk = Math.min(1, Math.max(0, (t - 28.23) / .60));
  const wx = 196 + walk * 600;
  const moving = walk < .94;
  charWithStamp(g, e, {
    set: S, x: wx, y: 636, scale: 1.9, view: 'q', emo: emoTrack(EMO, tc),
    pose: {
      sit: false, bob: bounce(tc, 2),
      walk: moving, legPhase: legCycle(t, 1.15), stride: moving ? 1 : 0,
    },
  });
  g.fillStyle = rgba(S.env.floorLo, .45);
  g.beginPath(); g.ellipse(wx + 8, ROOM.floorY + 6, 120, 18, 0, 0, TAU); g.fill();
  // 关机之后：空椅上的耳机位置亮一记粉（她没走，只是不在这块屏幕上）
  if (t > 29.16) {
    const a2 = Math.min(1, (t - 29.16) / .1) * (t > 30.2 ? Math.max(0, 1 - (t - 30.2) / .8) : 1);
    if (a2 > .01) {
      e.save(); e.globalCompositeOperation = 'lighter';
      airbrush(e, 966, 700, 150 * a2, 150 * a2, '#FF9CB0', .8 * a2);
      e.restore();
      g.fillStyle = rgba('#FFC9D6', .95 * a2);
      g.beginPath(); g.arc(966, 700, 8 * a2, 0, TAU); g.fill();
      g.fillStyle = rgba('#FFF0F4', .7 * a2);
      g.beginPath(); g.arc(966, 700, 3.4 * a2, 0, TAU); g.fill();
    }
  }
  if (t < 28.23 + 1 / FPS) whiteFlash(g, .35);
}

export const SHOT_FN = { S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14 };

// 拍击：每个镜头都吃一次 punch（同帧总和 < 0.06）
// 每拍一次，但每拍的"动法"不一样：小节头猛推、第三拍转身、其余拍错位
// 原来统一 .022 缩放，太快太小，24fps 下 1 帧就没了 —— 等于没卡点
export function applyPunch(g, t) {
  const ph = ((t - T0) % BEAT + BEAT) % BEAT;
  const w = Math.exp(-ph * 7.5);          // 衰减再慢一档：每拍能留住 3 帧，眼睛才看得见
  if (w < .05) return;
  const k = Math.floor((t - T0) / BEAT);
  const barHead = k % 4 === 0;            // 小节头：整体猛推
  const third = k % 4 === 2;              // 第三拍：带一点转
  const amt = (barHead ? .07 : third ? .046 : .036) * w;
  const dx = barHead ? 0 : Math.cos(k * 1.9) * .011 * w;
  const dy = barHead ? 0 : Math.sin(k * 1.31) * .008 * w;
  const rot = third ? .0032 * w : 0;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.translate(W / 2 + dx * W, H / 2 + dy * H);
  g.rotate(rot);
  g.scale(1 + amt, 1 + amt);
  g.translate(-W / 2, -H / 2);
}
