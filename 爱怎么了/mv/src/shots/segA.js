// A 段 S01–S13：钩子 → 收拾行李 → 一刀切开“两个人” → 器乐（灯一层层暗下去）
import * as THREE from 'three';
import { shotStage, cam, layer, figure, shadowOf, LADDER, PINK, PAPER, FLOOR, panelOf, ASPECT } from '../set.js';
import { skyPanel, text } from '../paper.js';
import { wallDraw, floorDraw, carton, chair, clothPile, shirt, pendant, scraps, drawScrap, FLOORY } from '../roomart.js';
import { knife, crack, scrap, cut } from '../art2.js';
import { figureSil, figureSilW } from '../figures.js';
import { seg, ss, eio, lerp, clamp, mulberry } from '../lib.js';

export const HIM = '#8c3a25', HER = '#f79ac0';

// —— 房间底座（夜）：天空 / 后墙(格窗) / 地板+家具 / 前景纸边 ——
function roomNight(S, o = {}) {
  const L = LADDER[o.lad || 'A'];
  const p = panelOf(o.vH, o.c || [0, -.02], 1.5);
  const win = o.win || { x: -.085, y: .075, w: .118, h: .195 };
  const sky = S.add(skyPanel({
    w: p.w * 1.04, h: p.h * 1.04, z: -.170, gain: 1.05,
    stops: [[0, L.sky[0]], [.55, L.sky[1]], [1, L.sky[2]]], stars: o.stars ?? 150, starMinY: -.08, seed: 11,
  }));
  const wall = layer(S, {
    ...p, z: -.152, trans: .62, glow: .55, glowCol: L.light,
    draw: wallDraw(L, p, win),
    glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.roundRect(win.x - win.w / 2, win.y - win.h / 2, win.w, win.h, .01); g.fill(); },
  });
  const floor = layer(S, {
    ...p, z: -.104, trans: .30,
    draw: x => { floorDraw(L, p)(x); x.fillStyle = L.prop; if (o.floorArt) o.floorArt(x, L); },
  });
  const front = layer(S, {
    ...p, z: -.014, trans: .035, finish: { rim: .18 },
    draw: x => {
      x.fillStyle = L.front;
      x.fillRect(p.cx - p.w / 2, p.cy - p.h / 2, p.w, .010);                 // 画面顶端一道纸梁
      x.fillRect(p.cx - p.w / 2, p.cy - p.h / 2, .016, p.h);                 // 左侧纸边
      x.fillRect(p.cx + p.w / 2 - .016, p.cy - p.h / 2, .016, p.h);
      if (o.frontArt) o.frontArt(x, L, p);
    },
  });
  return { sky, wall, floor, front, L, p, win };
}

// —— 墙上那张“两个人”的剪纸：可整张，也可拆成两半滑动 ——
function pairSheet(S, o) {
  const { vH, c, cx = -.030, cy = .045, w = .165, h = .120, z = -.088, split = 0 } = o;
  const p = panelOf(vH, c, 1.2);
  const paperCol = o.paperCol || '#efdcbe', inkCol = o.inkCol || '#3a2114';
  const drawSheet = (x, clipX) => {
    x.save();
    if (clipX !== null) { x.beginPath(); x.rect(clipX[0], cy - h, clipX[1] - clipX[0], h * 2); x.clip(); }
    x.fillStyle = paperCol;
    x.beginPath(); x.roundRect(cx - w / 2, cy - h / 2, w, h, .0035); x.fill();
    // 纸纹边：压一道暖边
    x.strokeStyle = 'rgba(255,240,210,.5)'; x.lineWidth = .0012;
    x.beginPath(); x.roundRect(cx - w / 2 + .001, cy - h / 2 + .001, w - .002, h - .002, .003); x.stroke();
    // 两个小人：同一张纸上并排剪出来，中间留出刀口
    x.fillStyle = inkCol;
    const gy = cy - h / 2 + .008, hh = h * .70;
    x.save(); x.translate(cx - .034, gy); figureSilW(x, hh, { facing: -1, pose: 'stand', arms: [[.18, .3], [-.10, .2]] }); x.restore();
    x.save(); x.translate(cx + .030, gy); figureSil(x, hh, { facing: 1, pose: 'stand', arms: [[.30, .5], [-.14, .26]] }); x.restore();
    // 纸面上的一点光斑
    x.save(); x.globalCompositeOperation = 'source-atop';
    const g = x.createRadialGradient(cx - .02, cy + .02, 0, cx - .02, cy + .02, w * .55);
    g.addColorStop(0, 'rgba(255,214,150,.42)'); g.addColorStop(1, 'rgba(255,214,150,0)');
    x.fillStyle = g; x.fillRect(cx - w / 2, cy - h / 2, w, h); x.restore();
    x.restore();
  };
  const full = () => layer(S, { ...p, z, trans: .34, finish: { rim: .5 }, draw: x => drawSheet(x, null) });
  if (!split) return { sheet: full() };
  const half = s => layer(S, {
    ...p, z: z + (s < 0 ? .0002 : 0), trans: .34, finish: { rim: .5 },
    draw: x => drawSheet(x, [s < 0 ? cx - w : cx, s < 0 ? cx : cx + w]),
  });
  return { left: half(-1), right: half(1) };
}

// ————————————————————————————————————————————————
// S01 · 0.00–0.64 · 钩子①：刀锋贴纸面横移，金句半截露出纸边
// ————————————————————————————————————————————————
function s01(E) {
  const S = shotStage({ lightCol: '#ffcf94', light: [.02, .03, -.14], lightR: .12, key: 1.25 });
  const vH = .125, c = [.005, .005], p = panelOf(vH, c, 1.25);
  S.add(skyPanel({ w: p.w * 1.1, h: p.h * 1.1, z: -.15, stops: [[0, '#0b1330'], [.7, '#1b2c56'], [1, '#33497c']], stars: 40, seed: 4, gain: 1.2 }));
  // 纸：下半个画面一整张，金句是打穿的洞，上半截被纸边切掉
  const sheetM = layer(S, {
    ...p, z: -.05, trans: .40, finish: { rim: .55 },
    draw: x => {
      x.fillStyle = '#f0dcc0';
      x.fillRect(c.x - p.w, c.y - p.h, p.w * 2, p.h);            // 从画面中部往下铺满
      // 打穿的金句（只露出下半截）
      x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000';
      [...'爱怎么了'].forEach((ch, i) => text(x, ch, c.x - .020 + i * .0125, c.y - .012, .0105, 'Xingkai', { fill: '#000', weight: '' }));
      x.restore();
      // 纸边的一道压痕
      x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(0,0,0,.18)';
      x.fillRect(c.x - p.w, c.y - p.h, p.w * 2, .0012); x.restore();
    },
    glow: .55, glowCol: '#ffd8a4',
    glowDraw: g => { g.fillStyle = '#000'; [...'爱怎么了'].forEach((ch, i) => text(g, ch, c.x - .020 + i * .0125, c.y - .012, .0105, 'Xingkai', { fill: '#fff' })); },
  });
  const blade = layer(S, {
    ...p, z: -.03, trans: .05, draw: x => { x.fillStyle = '#d9cdb4'; knife(x, .18, .02, .22, '#d9cdb4', '#fff2d2', -1.45); },
    glow: .9, glowCol: '#ffe0b0',
  });
  return {
    S,
    update(t) {
      cam(S, t, { vH, look: [.005, .005, -.05], hand: .00035, roll: .004 });
      blade.position.x = lerp(-.05, .03, eio(seg(t, 0, E.dur)));
      blade.position.y = .001 * Math.sin(t * 2.2);
      blade.material.userData.u.uGlowLit.value = .7 + .3 * Math.sin(t * 3.1);
    },
    post() { return { focus: S.cam.position.z + .05, aper: 8, maxCoc: 14, bloom: { strength: .5, radius: .6, threshold: 1.02 } }; },
    grade() { return { expo: 1.05, vig: .5, sat: .98, contrast: .12 }; },
  };
}

// ————————————————————————————————————————————————
// S02 · 0.64–1.12 · 钩子②：刀切下，纸条裂开又瞬间合上（预演 6.08 的刀）
// ————————————————————————————————————————————————
function s02(E) {
  const S = shotStage({ lightCol: '#ffcf94', light: [0, .02, -.14], lightR: .12, key: 1.35 });
  const vH = .105, c = [0, 0], p = panelOf(vH, c, 1.3);
  S.add(skyPanel({ w: p.w * 1.1, h: p.h * 1.1, z: -.15, stops: [[0, '#0c1432'], [.7, '#22315c'], [1, '#3a4f83']], stars: 30, seed: 6, gain: 1.15 }));
  const mkHalf = s => layer(S, {
    ...p, z: -.05 + (s < 0 ? .0003 : 0), trans: .40, finish: { rim: .5 },
    draw: x => {
      x.save(); x.beginPath(); x.rect(s < 0 ? c.x - 9 : c.x, c.y - 9, 9, 18); x.clip();
      x.fillStyle = '#f0dcc0'; x.fillRect(c.x - 9, c.y - 9, 18, 9);         // 上半个画面是纸
      x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000';
      [...'爱怎么了'].forEach((ch, i) => text(x, ch, c.x - .016 + i * .0115, c.y - .006, .0098, 'Xingkai', { fill: '#000' }));
      x.restore();
      x.restore();
    },
  });
  const left = mkHalf(-1), right = mkHalf(1);
  const blade = layer(S, { ...p, z: -.02, trans: .04, draw: x => { x.fillStyle = '#d5c9b0'; knife(x, .03, .045, .2, '#d5c9b0', '#fff2d2', -.62); }, glow: .8, glowCol: '#ffe0b0' });
  return {
    S,
    update(t) {
      cam(S, t, { vH, look: [0, 0, -.05], hand: .0003 });
      const k = ss(seg(t, 0, .06));                       // 切下
      blade.position.y = lerp(.02, -.004, k);
      const off = .006 * (ss(seg(t, .02, .20)) - ss(seg(t, .24, .44)));   // 裂开 6mm 又合上
      left.position.x = -off; right.position.x = off;
      for (const m of [left, right]) m.material.userData.u.uGlowLit.value = 1;
    },
    post() { return { focus: S.cam.position.z + .05, aper: 7, maxCoc: 12, bloom: { strength: .55, radius: .6, threshold: 1.0 } }; },
    grade() { return { expo: 1.07, vig: .52, sat: .98, contrast: .12 }; },
  };
}

// ————————————————————————————————————————————————
// S03 · 1.12–2.24 · 他跪在纸箱前，衣物堆成一排薄剪纸
// ————————————————————————————————————————————————
function s03(E) {
  const S = shotStage({ lightCol: '#ffb862', light: [-.085, .075, -.15], lightR: .2, key: 1.0 });
  const R = roomNight(S, {
    vH: .40, c: [.01, -.075],
    floorArt: (x, L) => {
      carton(x, .085, FLOORY, .145, .098, L.prop, L.front);
      clothPile(x, -.055, FLOORY, .085, 5, L.prop, L.mid);
      x.fillStyle = L.prop; shirt(x, -.085, FLOORY, .075, .062, L.prop);
    },
  });
  const him = figure(S, { x: .012, ground: FLOORY, h: .235, z: -.052, ppm: R.p.ppm * 1.8, col: HIM, mood: 'sad', pose: 'kneel', facing: 1, arms: [[.55, .95], [.16, .55]] });
  return {
    S,
    update(t) {
      const u = eio(seg(t, 0, E.dur));
      cam(S, t, { vH: lerp(.40, .34, u), look: [lerp(.01, .02, u), lerp(-.075, -.085, u), -.06], hand: .0007 });
      const a = ss(seg(t, 0, .28));                        // 收 → 拾
      him.arms[0].rotation.z = lerp(.55, 1.15, a) * .1;
      him.arms[1].rotation.z = lerp(.16, .55, a) * .05 - .02;
      him.body.rotation.z = .03 * Math.sin(t * 2.1);
      S.U.uLit.value = .9 + .06 * Math.sin(t * 7.3) * Math.sin(t * 3.1);
    },
    post() { return { focus: S.cam.position.z + .06, aper: 15, maxCoc: 12, bloom: { strength: .44, radius: .62, threshold: 1.08 } }; },
    grade() { return { expo: 1.05, vig: .45, sat: 1.02, contrast: .1 }; },
  };
}

// ————————————————————————————————————————————————
// S04 · 2.24–3.20 · 俯视：手把纸衣压平、折三折、放进箱（手落拍）
// ————————————————————————————————————————————————
function s04(E) {
  const S = shotStage({ lightCol: '#ffbe6e', light: [.01, -.02, -.14], lightR: .16, key: .9 });
  const R = roomNight(S, {
    vH: .20, c: [.03, -.135],
    floorArt: (x, L) => {
      carton(x, .075, FLOORY, .150, .100, L.prop, L.front);
      x.fillStyle = L.prop;
      x.save(); x.translate(-.055, FLOORY + .004); x.rotate(.06); shirt(x, 0, 0, .10, .085, L.prop); x.restore();
      x.fillStyle = L.mid; x.fillRect(-.13, FLOORY - .002, .05, .004);
    },
  });
  const hand = layer(S, {
    w: .16, h: .16, cx: -.02, cy: FLOORY + .02, z: -.045, ppm: R.p.ppm * 2, trans: .08, shadow: true,
    draw: x => {
      x.fillStyle = HIM;
      // 一只手（掌+四指，纸片）
      x.beginPath(); x.roundRect(-.012, -.020, .026, .040, .008); x.fill();
      for (let i = 0; i < 4; i++) x.beginPath(), x.roundRect(-.010 + i * .0062, -.034, .005, .018, .0024), x.fill();
      x.beginPath(); x.roundRect(-.019, -.006, .008, .016, .004); x.fill();
      x.beginPath(); x.roundRect(-.012, -.030, .024, .010, .004); x.fill();   // 掌根压出的纸褶
    },
  });
  return {
    S,
    update(t) {
      cam(S, t, { vH: .20, look: [.03, -.135, -.06], hand: .0006, roll: -.012 });
      const u = eio(seg(t, 0, E.dur));
      hand.position.x = lerp(-.055, .02, u);
      hand.position.y = FLOORY + lerp(.028, .012, ss(seg(t, .45, .75)));
      hand.rotation.z = lerp(-.16, .06, u);
      R.floor.rotation.z = 0;
    },
    post() { return { focus: S.cam.position.z + .055, aper: 12, maxCoc: 14, bloom: { strength: .4, radius: .6, threshold: 1.1 } }; },
    grade() { return { expo: 1.03, vig: .5, sat: 1.0, contrast: .1 }; },
  };
}

// ————————————————————————————————————————————————
// S05 · 3.20–4.48 · dolly out：房间四层纸一次显形，他站起来
// ————————————————————————————————————————————————
function s05(E) {
  const S = shotStage({ lightCol: '#ffb862', light: [-.085, .075, -.15], lightR: .22, key: 1.05 });
  const R = roomNight(S, {
    vH: .56, c: [0, -.03],
    floorArt: (x, L) => {
      chair(x, -.125, FLOORY, .135, -1, L.prop);
      carton(x, .085, FLOORY, .150, .100, L.prop, L.front);
      clothPile(x, -.045, FLOORY, .080, 4, L.prop, L.mid);
      x.fillStyle = L.prop; x.fillRect(-.02, FLOORY - .003, .07, .003);
    },
  });
  const him = figure(S, { x: .012, ground: FLOORY, h: .235, z: -.052, ppm: R.p.ppm * 1.8, col: HIM, mood: 'sad', pose: 'stand', facing: -1, arms: [[.12, .2], [-.08, .18]] });
  return {
    S,
    update(t) {
      const u = eio(seg(t, 0, E.dur));
      cam(S, t, { vH: lerp(.30, .56, u), look: [lerp(.02, 0, u), lerp(-.055, -.03, u), -.06], hand: .0007 });
      him.body.rotation.z = lerp(.05, -.01, u);
      him.legs.rotation.z = 0;
      him.arms[0].rotation.z = .1 * Math.sin(t * 3.1) - .06;
      S.U.uLit.value = 1;
      R.sky.material.color.setScalar(.9 + .1 * ss(seg(t, 0, .6)));
    },
    post() { return { focus: S.cam.position.z + .055, aper: 14, maxCoc: 12, bloom: { strength: .46, radius: .62, threshold: 1.05 } }; },
    grade() { return { expo: 1.06, vig: .44, sat: 1.04, contrast: .1 }; },
  };
}

// ————————————————————————————————————————————————
// S06 · 4.48–5.27 · 墙上那张纸：两个小人并排剪在同一张纸上（侧移，前景窗框擦过）
// ————————————————————————————————————————————————
function s06(E) {
  const S = shotStage({ lightCol: '#ffc074', light: [-.03, .06, -.14], lightR: .14, key: 1.1 });
  const R = roomNight(S, { vH: .21, c: [-.03, .05] });
  const ps = pairSheet(S, { vH: .21, c: [-.03, .05], cx: -.030, cy: .048, w: .170, h: .124, z: -.086 });
  const frameBar = layer(S, { ...panelOf(.21, [-.03, .05], 1.2), z: -.026, trans: .03, draw: x => { x.fillStyle = R.L.front; x.fillRect(-.30, -.30, .055, .62); x.fillRect(.24, -.30, .055, .62); } });
  return {
    S,
    update(t) {
      const u = eio(seg(t, 0, E.dur));
      cam(S, t, { vH: .21, look: [lerp(-.045, -.018, u), .050, -.06], at: [lerp(-.020, .006, u), .048], hand: .0006 });
      ps.sheet.rotation.z = .004 * Math.sin(t * 1.7);
      ps.sheet.position.y = .0012 * Math.sin(t * 2.3);
      ps.sheet.material.userData.u.uGlowLit.value = .85 + .15 * Math.sin(t * 1.9);
    },
    post() { return { focus: S.cam.position.z + .03, aper: 16, maxCoc: 14, bloom: { strength: .42, radius: .6, threshold: 1.05 } }; },
    grade() { return { expo: 1.06, vig: .46, sat: 1.02, contrast: .1 }; },
  };
}

// ————————————————————————————————————————————————
// S07 · 5.27–6.08 · 刀从上方落下，停在纸上方 2cm（固定，只有刀在下）
// ————————————————————————————————————————————————
function s07(E) {
  const S = shotStage({ lightCol: '#ffc074', light: [-.02, .05, -.14], lightR: .14, key: 1.2 });
  const R = roomNight(S, { vH: .23, c: [-.03, .04] });
  const ps = pairSheet(S, { vH: .23, c: [-.03, .04], cx: -.030, cy: .044, w: .170, h: .124, z: -.086 });
  const blade = layer(S, { ...panelOf(.23, [-.03, .04], 1.3), z: -.030, trans: .05, draw: x => { x.fillStyle = R.L.prop; knife(x, -.030, .20, .26, R.L.prop, '#ffe6bc', -1.5708); }, glow: .8, glowCol: '#ffdca8' });
  return {
    S,
    update(t) {
      cam(S, t, { vH: .23, look: [-.03, .04, -.06], hand: .0005 });
      const fall = ss(seg(t, 0, .52));                       // 落到纸上方 2cm
      blade.position.y = lerp(.20, .052, fall);
      blade.rotation.z = .004 * Math.sin(t * 2.6);
      blade.material.userData.u.uGlowLit.value = .8;
    },
    post() { return { focus: S.cam.position.z + .04, aper: 14, maxCoc: 14, bloom: { strength: .45, radius: .6, threshold: 1.04 } }; },
    grade() { return { expo: 1.06, vig: .48, sat: 1.0, contrast: .11 }; },
  };
}

// ————————————————————————————————————————————————
// S08 · 6.08–6.64 · ★A 割舍：刀落，纸裂开，碎屑撒出，最大一片留在箱口
// ————————————————————————————————————————————————
function s08(E) {
  const S = shotStage({ lightCol: '#ffc074', light: [-.02, .04, -.14], lightR: .14, key: 1.45 });
  const vH = .185, c = [-.028, .036];
  const R = roomNight(S, { vH, c });
  const ps = pairSheet(S, { vH, c, cx: -.030, cy: .038, w: .170, h: .124, z: -.086, split: 1 });
  const blade = layer(S, { ...panelOf(vH, c, 1.3), z: -.030, trans: .05, draw: x => { x.fillStyle = R.L.prop; knife(x, -.030, .045, .26, R.L.prop, '#ffe6bc', -1.5708); }, glow: 1, glowCol: '#ffdca8' });
  // 碎屑：一把，其中最大那片留在箱口
  const R2 = mulberry(23);
  const bits = Array.from({ length: 22 }, () => [R2(), R2(), .0018 + R2() * .0042, R2() * 6.283]);
  const dust = layer(S, {
    ...panelOf(vH, c, 1.35), z: -.020, trans: .5, shadow: false, recv: false, finish: { rim: .4 },
    draw: x => { x.fillStyle = '#f6e6d2'; for (const [a, b, r, rot] of bits) drawScrap(x, -.030 + (a - .5) * .12, .020 + (b - .5) * .09, r, rot, '#f6e6d2'); },
  });
  const bigScrap = layer(S, {
    w: .06, h: .06, cx: .030, cy: -.088, z: -.018, ppm: panelOf(vH, c, 1).ppm, trans: .45, shadow: false, recv: false,
    draw: x => { drawScrap(x, .030, -.088, .0042, .7, '#f6e6d2'); },
  });
  return {
    S,
    update(t) {
      cam(S, t, { vH, look: [c[0], c[1], -.06], hand: .0004, roll: .003 });
      const k = ss(seg(t, 0, .055));
      blade.position.y = lerp(.045, -.004, k);
      blade.visible = t < .09;
      const sep = .020 * ss(seg(t, .03, .30));                // 两半各滑开
      ps.left.position.x = -sep; ps.right.position.x = sep;
      ps.left.rotation.z = -.006 * ss(seg(t, .05, .3)); ps.right.rotation.z = .005 * ss(seg(t, .05, .3));
      const fly = ss(seg(t, .02, .22));
      dust.position.y = .012 * fly; dust.material.userData.u.uGlowLit.value = 1;
      bigScrap.position.y = -.004 * ss(seg(t, .05, .25));
    },
    post() { return { focus: S.cam.position.z + .045, aper: 13, maxCoc: 15, bloom: { strength: .48, radius: .62, threshold: 1.02 } }; },
    grade() { return { expo: 1.08, vig: .5, sat: 1.0, contrast: .12 }; },
  };
}

// ————————————————————————————————————————————————
// S09 · 6.64–7.60 · 两半各滑 3cm，缝里透出夜空
// ————————————————————————————————————————————————
function s09(E) {
  const S = shotStage({ lightCol: '#9fb4d8', light: [-.03, .04, -.15], lightR: .16, key: 1.0, ambCol: '#6f7fae' });
  const vH = .205, c = [-.028, .030];
  const R = roomNight(S, { vH, c });
  const ps = pairSheet(S, { vH, c, cx: -.030, cy: .032, w: .170, h: .124, z: -.086, split: 1 });
  return {
    S,
    update(t) {
      cam(S, t, { vH, look: [c[0], c[1], -.06], hand: .0005 });
      const u = eio(seg(t, 0, E.dur));
      const sep = lerp(.020, .034, u);
      ps.left.position.x = -sep; ps.right.position.x = sep;
      ps.left.position.y = -.0015 * u; ps.right.position.y = .0012 * u;
      R.wall.material.userData.u.uTrans.value = .62 * lerp(1, .86, u);   // 夜里灯退一点
    },
    post() { return { focus: S.cam.position.z + .04, aper: 13, maxCoc: 14, bloom: { strength: .42, radius: .6, threshold: 1.06 } }; },
    grade() { return { expo: 1.02, vig: .5, sat: .96, contrast: .11 }; },
  };
}

export const SHOTS_A = [
  { id: 'S01', start: 0.00, build: s01 },
  { id: 'S02', start: 0.64, build: s02 },
  { id: 'S03', start: 1.12, build: s03 },
  { id: 'S04', start: 2.24, build: s04 },
  { id: 'S05', start: 3.20, build: s05 },
  { id: 'S06', start: 4.48, build: s06 },
  { id: 'S07', start: 5.27, build: s07 },
  { id: 'S08', start: 6.08, build: s08 },
  { id: 'S09', start: 6.64, build: s09 },
];
