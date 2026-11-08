// specs/v4.js —《我好想你（苏打绿版）》像素 RPG · v4 资产版 · 全片 93 镜 / 329.2s
// 分镜词：D:/ai音乐mv/我好想你/分镜词-我好想你-像素RPG版-v4-资产版.md
// 只动三件事：PAL 换色 / 取景 / rig 参数。场景与道具全部来自 src/scene.js 原有资产。
//   node daily.mjs --spec=specs/v4.js --audio="…mp3" --out="…mp4" --no-cover

if (typeof PAL !== 'undefined') Object.assign(PAL, {
  ink: '#05080D', night: '#0E1B29', navy: '#1A2C40', slate: '#33506A',
  dusk: '#274A68', haze: '#7899B4', wall: '#202C3A', wallDk: '#161F2A',
  floor: '#2E2724', floorDk: '#1C1714', seaDk: '#19353F', steel: '#40607A',
});

// ---------------- 运镜 / 转场 ----------------
function CAM(dur, o) {
  const EF = {
    io: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
    out: x => 1 - Math.pow(1 - x, 3),
    in: x => x * x * x,
  };
  return function (lt) {
    const p = Math.min(1, Math.max(0, lt / Math.max(.01, dur)));
    const e = (EF[o.ease] || (x => x))(p);
    const z = o.z0 != null ? lerp(o.z0, o.z1 ?? o.z0, e) : 1;
    let cx = o.px ? lerp(o.px[0], o.px[1], e) : lerp(o.cx0 ?? 160, o.cx1 ?? o.cx0 ?? 160, e);
    let cy = o.py ? lerp(o.py[0], o.py[1], e) : lerp(o.cy0 ?? 90, o.cy1 ?? o.cy0 ?? 90, e);
    if (o.hand) { cx += Math.sin(lt * 11.7) * o.hand; cy += Math.cos(lt * 9.3) * o.hand * .75; }
    const w = 320 / z, h = 180 / z;
    return [Math.min(Math.max(cx - w / 2, 0), 320 - w), Math.min(Math.max(cy - h / 2, 0), 180 - h), w, h];
  };
}
function T(type, dur, dir, amt) { return { type, dur, dir: dir || 1, amt }; }

// ---------------- 局部工具 ----------------
// 把主体周围压暗，让背景的 1px 抖动掉进阴影
function spot(c, cx, cy, r, k) {
  shadeMask(c, (x, y) => {
    const d = Math.hypot(x - cx, y - cy);
    return k * Math.min(1, Math.max(0, (d - r) / 26));
  });
}
// 门口那块地：盖掉 dither，用纯色地板 + 平滑窗光重画，拖鞋照 scene.js 原样重画
function doorFloor(c, stage) {
  R(c, 190, 116, 104, 34, PAL.wallDk);
  R(c, 190, 150, 104, 30, PAL.floor);
  for (let x = 194; x < 298; x += 26) R(c, x, 150, 1, 30, PAL.floorDk);
  R(c, 190, 150, 104, 1, PAL.dusk);
  c.save(); c.globalAlpha = .07; c.fillStyle = '#FFD9A8';
  c.beginPath(); c.moveTo(196, 150); c.lineTo(292, 150); c.lineTo(306, 180); c.lineTo(224, 180); c.closePath(); c.fill();
  c.restore();
  if (stage < 3) { R(c, 244, 158, 8, 4, PAL.rose); R(c, 245, 157, 6, 1, PAL.blush); R(c, 245, 162, 7, 2, PAL.night); }
  if (stage < 2) { R(c, 255, 159, 8, 4, PAL.rose); R(c, 256, 158, 6, 1, PAL.blush); R(c, 256, 163, 7, 2, PAL.night); }
}
// 盖掉车厢里那个乘客，让围巾落在"空座"上
function clearSeat(c) {
  R(c, 243, 86, 16, 6, PAL.night);
  R(c, 243, 92, 16, 2, PAL.dusk);
  R(c, 243, 94, 16, 18, PAL.navy);
  R(c, 243, 112, 16, 7, PAL.dusk);
  R(c, 243, 112, 16, 1, PAL.haze);
  R(c, 243, 119, 16, 27, PAL.night);
}
// 关台灯：把灯罩和光池一起盖掉
function lampOff(c) {
  R(c, 94, 86, 74, 46, PAL.night);
  R(c, 96, 130, 60, 4, PAL.navy);
  R(c, 96, 130, 60, 1, PAL.dusk);
  R(c, 94, 134, 74, 16, PAL.ink);
  R(c, 129, 118, 3, 11, PAL.navy);
  R(c, 126, 129, 10, 2, PAL.night);
}
function winSnow(c, t, k = 26) {
  c.save(); c.beginPath(); c.rect(176, 26, 108, 82); c.clip();
  snowFx(c, t, k, PAL.pale); c.restore();
}
function winRain(c, t, k = 24) {
  c.save(); c.beginPath(); c.rect(176, 26, 108, 82); c.clip();
  rainFx(c, t, k, PAL.haze); c.restore();
}
function winBlink(c, t) {
  for (let i = 0; i < 6; i++) {
    if ((t * .8 + i * 1.37) % 3 < 1.5) R(c, 182 + (i * 17) % 94, 32 + (i * 23) % 56, 2, 3, PAL.haze);
  }
}
function sillSnow(c, h) { if (h > 0) R(c, 176, 108 - h, 108, h, PAL.pale); }
// 走马灯：场景轮换，每段只留一个记忆物
function montage(c, lt, dur, list, opt = {}) {
  const per = dur / list.length;
  const i = Math.min(list.length - 1, Math.floor(lt / per));
  const t2 = lt - i * per;
  const [name, gy] = list[i];
  SCENES[name].draw(c, t2);
  const edge = Math.min(t2, per - t2);
  if (edge < .10) shade(c, .62 * (1 - edge / .10));
  if (opt.glitch && edge < .12) {
    const off = Math.round((1 - edge / .12) * 8);
    for (let s = 0; s < 4; s++) {
      const y = 20 + s * 36;
      c.drawImage(c.canvas, 0, y, 320, 30, off, y, 320, 30);
    }
  }
  shade(c, .16 + i * .10);
}
// 第二串脚印：从远处一格一格"长"回来
function secondPrints(c, k) {
  R(c, 140, 126, 180, 54, PAL.paper);
  dith(c, 0, 176, 320, 4, PAL.paper, PAL.navy, .2);
  const n = Math.round(k * 9);
  for (let i = 8; i >= 0; i--) {
    if (8 - i >= n) continue;
    const x = 150 + i * 15, y = 132 + i * 5;
    R(c, x, y, 3, 2, PAL.navy);
    R(c, x + 3, y + 1, 3, 2, PAL.haze);
  }
}

window.SPEC = {
  fps: 24,
  duration: 329.2,
  fadeIn: .7,
  fadeOut: 1.0,
  grade: 'brightness(1.12) saturate(.95) contrast(1.12)',
  cover: 'A',

  shots: [
  // ============ 一 · 重复 0–38.40（10 镜） ============
  { t0: 0, t1: 6.0, scene: 'black', cam: false,
    led: { title: '我好想你', sub: '第 37 天 · 他还没学会不回头' },
    draw(pc) { R(pc, 0, 0, 320, 180, PAL.ink); } },

  { t0: 6.0, t1: 9.6, scene: 'street', zs: 1, cast: '#7FB6E8', castA: .08,
    in: T('iris', .5),
    cam: CAM(3.6, { z0: 1.05, z1: 1.05, px: [150, 176], cy0: 96 }),
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      const x = lerp(96, 148, easeIO(seg(lt, .2, 3.4)));
      figure(pc, x, 158, 1, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5.5, aL: .2, aR: .2 });
      figure(pc, x + 21, 158, 1, { sex: 'f', view: 'back', pose: 'walk', walk: t * 5.5 + 1, aL: .2, aR: .2 });
      SCENES.street.fg(pc, t);
    } },

  { t0: 9.6, t1: 12.4, scene: 'street', zs: 1, cast: '#7FB6E8', castA: .08,
    in: T('cut', 0),
    cam: CAM(2.8, { z0: 2.60, z1: 2.66, cx0: 51, cy0: 118 }),
    draw(pc, lt, shot, t) { SCENES.street.draw(pc, t); SCENES.street.fg(pc, t); } },

  { t0: 12.4, t1: 15.0, scene: 'street', zs: 1, cast: '#7FB6E8', castA: .07,
    in: T('cut', 0),
    cam: CAM(2.6, { z0: 1.40, z1: 1.44, cx0: 78, cy0: 112, hand: .4 }),
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      figure(pc, 112, 158, 1, { sex: 'm', view: 'back' });
      figure(pc, 86, 158, 1, { sex: 'f', eyes: 'up', lookY: -.4, mouth: 'tiny', aR: .5, lookX: .4 });
      SCENES.street.fg(pc, t);
    } },

  { t0: 15.0, t1: 18.4, scene: 'street', zs: 1, cast: '#7FB6E8', castA: .08,
    in: T('cut', 0),
    cam: CAM(3.4, { z0: 1.35, z1: 1.38, cx0: 150, cy0: 116 }),
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      const p = seg(lt, .3, 3.0);
      figure(pc, lerp(120, 212, easeIO(p)), 158, 1, { sex: 'f', view: 'back', pose: 'walk', walk: t * 5.5 });
      figure(pc, 88, 158, 1, { sex: 'm', eyes: lt > 2.2 ? 'teary' : 'narrow', mouth: 'flat',
        lookX: .6, tear: lt > 2.2 ? .4 : 0, aR: (lt > 1.0 && lt < 2.6) ? 1 : 0 });
      SCENES.street.fg(pc, t);
    } },

  { t0: 18.4, t1: 21.2, scene: 'street', zs: 1, cast: '#7FB6E8', castA: .06,
    in: T('blk', .10),
    cam: CAM(2.8, { z0: 1.20, z1: 1.23, cx0: 222, cy0: 70 }),
    draw(pc, lt, shot, t) { SCENES.street.draw(pc, t); SCENES.street.fg(pc, t); } },

  { t0: 21.2, t1: 24.0, scene: 'stairs', zs: 1, cast: '#7FB6E8', castA: .06,
    in: T('blk', .10),
    cam: CAM(2.8, { z0: 1.06, z1: 1.08, cx0: 150, cy0: 108, py: [116, 96], ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.stairs.draw(pc, t);
      const p = seg(lt, .2, 2.6), x = lerp(110, 152, easeIO(p));
      const gy = 148 - Math.floor((x - 110) / 14) * 12;
      figure(pc, x, gy, 2, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5.5, aL: .2, aR: .2 });
    } },

  { t0: 24.0, t1: 28.6, scene: 'stairs', zs: 1, cast: '#7FB6E8', castA: .06,
    in: T('cut', 0),
    cam: CAM(4.6, { z0: 1.25, z1: 1.29, cx0: 120, cy0: 118, hand: .3 }),
    draw(pc, lt, shot, t) {
      SCENES.stairs.draw(pc, t);
      figure(pc, 150, 124, 2, { sex: 'm', eyes: 'narrow', mouth: 'flat', lookY: .4,
        aR: lt > .8 ? 1 : 0, dy: lt > 2.0 ? 1 : 0 });
    } },

  { t0: 28.6, t1: 33.6, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .10,
    in: T('blk', .12),
    cam: CAM(5.0, { z0: 1.06, z1: 1.08, cx0: 160, cy0: 100 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      const p = seg(lt, .3, 4.4);
      figure(pc, lerp(286, 250, easeIO(p)), 150, 2, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5.2, aL: .2, aR: .2 });
    } },

  { t0: 33.6, t1: 38.4, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .05,
    in: T('cut', 0),
    cam: CAM(4.8, { z0: 3.20, z1: 3.26, cx0: 242, cy0: 168, hand: .3 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc); doorFloor(pc, 1); spot(pc, 250, 160, 15, .34);
    } },

  // ============ 二 · 读档 · 主歌 1 38.40–86.53（12 镜） ============
  { t0: 38.40, t1: 42.2, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .08,
    in: T('flash', .15, 1, .9),
    cam: CAM(3.8, { z0: 1.06, z1: 1.08, cx0: 150, cy0: 100 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      figure(pc, 196, 150, 2, { sex: 'm', eyes: lt < 1.4 ? 'wide' : 'lost', mouth: 'flat',
        lookY: lt < 1.4 ? -.4 : .3, aR: lt < 1.2 ? 2 : (lt < 2.0 ? 1 : .2) });
    } },

  { t0: 42.2, t1: 46.0, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .08,
    in: T('cut', 0),
    cam: CAM(3.8, { z0: 1.10, z1: 1.12, px: [76, 110], cy0: 118, ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      figure(pc, 92, 146, 2, { sex: 'm', pose: 'sit', eyes: 'narrow', mouth: 'frown', lookY: .5, aL: .4, aR: .4 });
    } },

  { t0: 46.0, t1: 50.99, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .08,
    in: T('cut', 0),
    cam: CAM(4.99, { z0: 3.0, z1: 3.0, px: [58, 128], py: [55, 150], ease: 'io' }),
    draw(pc, lt, shot, t) { SCENES.room.draw(pc, t); } },

  { t0: 50.99, t1: 54.4, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .07,
    in: T('cut', 0),
    cam: CAM(3.4, { z0: 1.15, z1: 1.18, cx0: 160, cy0: 110 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      figure(pc, 152, 150, 2, { sex: 'm', eyes: 'closed', mouth: 'flat', dy: 1, aR: lt < 1.6 ? 1 : .2 });
      if (lt > 2.6) { lampOff(pc); shade(pc, Math.min(.34, (lt - 2.6) * .6)); }
    } },

  { t0: 54.4, t1: 57.6, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .05,
    in: T('hand', .3),
    cam: CAM(3.2, { z0: 1.08, z1: 1.09, cx0: 250, cy0: 108, hand: .6 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      winRain(pc, t);
      figure(pc, 250, 150, 2, { sex: 'm', view: 'back', dy: 1 });
    } },

  { t0: 57.6, t1: 61.56, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .05,
    in: T('cut', 0),
    cam: CAM(3.96, { z0: 1.70, z1: 1.74, cx0: 250, cy0: 92 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      winRain(pc, t);
      figure(pc, 250, 150, 2, { sex: 'm', eyes: 'narrow', mouth: 'flat', tear: .3, lookY: .2, dy: 1 });
    } },

  { t0: 61.56, t1: 65.0, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .06,
    in: T('cut', 0),
    cam: CAM(3.44, { z0: 2.60, z1: 2.64, cx0: 230, cy0: 62 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      winBlink(pc, t);
      pc.save(); pc.beginPath(); pc.rect(176, 26, 108, 82); pc.clip();
      EVENTS.plane.run(pc, lt, { dur: 3.4 });
      pc.restore();
    } },

  { t0: 65.0, t1: 69.1, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .05,
    in: T('cut', 0),
    cam: CAM(4.1, { z0: 1.35, z1: 1.38, cx0: 250, cy0: 105 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      figure(pc, 250, 150, 2, { sex: 'm', eyes: 'narrow', mouth: 'flat', dy: 1, aR: lt > .6 ? (lt < 2.2 ? 1 : 2) : .2 });
    } },

  { t0: 69.10, t1: 72.5, scene: 'street', zs: 1, cast: '#7FB6E8', castA: .06,
    tint: '#FFD166', tintA: .06, in: T('fade', .45),
    cam: CAM(3.4, { z0: 1.12, z1: 1.10, px: [210, 250], cy0: 104, ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      const p = seg(lt, .4, 3.2);
      figure(pc, lerp(213, 300, easeIO(p)), 158, 1, { sex: 'f', view: 'back', pose: 'walk', walk: t * 5.5 });
      figure(pc, 96, 158, 1, { sex: 'm', eyes: 'teary', mouth: 'flat', tear: .4, lookX: .8 });
      SCENES.street.fg(pc, t);
    } },

  { t0: 72.5, t1: 75.81, scene: 'street', zs: 1, cast: '#7FB6E8', castA: .05,
    in: T('cut', 0),
    cam: CAM(3.31, { z0: 3.0, z1: 3.04, cx0: 226, cy0: 152 }),
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      figure(pc, 250, 158, 2, { sex: 'm', eyes: 'dot', mouth: 'flat' });
      SCENES.street.fg(pc, t);
    } },

  { t0: 75.81, t1: 81.74, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .05,
    in: T('cut', 0),
    cam: CAM(5.93, { z0: 2.80, z1: 2.86, cx0: 56, cy0: 140 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      EVENTS.phone.run(pc, lt, { sx: 104, sy: 138, sc: 1, dur: 5.9 });
      spot(pc, 90, 140, 26, .30);
    } },

  { t0: 81.74, t1: 86.53, scene: 'corridor', zs: 1, cast: '#7FB6E8', castA: .06,
    in: T('cut', 0),
    cam: CAM(4.79, { z0: 1.06, z1: 1.00, cx0: 160, cy0: 96, ease: 'out' }),
    draw(pc, lt, shot, t) {
      SCENES.corridor.draw(pc, t);
      const p = seg(lt, .2, 4.4);
      figure(pc, lerp(160, 186, easeIO(p)), 158, 1, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5.2, aL: .2, aR: .2 });
    } },

  // ============ 三 · 副歌 1 86.53–130.97（14 镜） ============
  { t0: 86.53, t1: 88.8, scene: 'sea', zs: 1, cast: '#6FD8E8', castA: .08,
    in: T('flash', .12, 1, .9),
    cam: CAM(2.27, { z0: 2.20, z1: 2.26, cx0: 299, cy0: 78 }),
    draw(pc, lt, shot, t) { SCENES.sea.draw(pc, t); } },

  { t0: 88.8, t1: 92.0, scene: 'sea', zs: 1, cast: '#6FD8E8', castA: .08,
    in: T('cut', 0),
    cam: CAM(3.2, { z0: 1.04, z1: 1.05, cx0: 160, cy0: 100 }),
    draw(pc, lt, shot, t) {
      SCENES.sea.draw(pc, t);
      figure(pc, 140, 148, 1, { sex: 'm', view: 'back', aR: .3 });
      figure(pc, 158, 148, 1, { sex: 'f', view: 'back', aL: .3 });
      shade(pc, .10);
    } },

  { t0: 92.0, t1: 95.4, scene: 'sea', zs: 1, cast: '#6FD8E8', castA: .08,
    in: T('cut', 0),
    cam: CAM(3.4, { z0: 1.50, z1: 1.54, cx0: 196, cy0: 116 }),
    draw(pc, lt, shot, t) {
      SCENES.sea.draw(pc, t);
      figure(pc, 200, 148, 1, { sex: 'f', eyes: 'up', lookY: -.3, mouth: 'tiny', aR: .5, lookX: -.5 });
    } },

  { t0: 95.4, t1: 99.57, scene: 'sea', zs: 1, cast: '#6FD8E8', castA: .08,
    in: T('cut', 0),
    cam: CAM(4.17, { z0: 1.90, z1: 1.94, cx0: 160, cy0: 120 }),
    draw(pc, lt, shot, t) { SCENES.sea.draw(pc, t); } },

  { t0: 99.57, t1: 103.0, scene: 'rooftop', zs: 1, cast: '#6FD8E8', castA: .08,
    in: T('cut', 0),
    cam: CAM(3.43, { z0: 1.45, z1: 1.48, cx0: 110, cy0: 100, hand: .4 }),
    draw(pc, lt, shot, t) {
      SCENES.rooftop.draw(pc, t);
      figure(pc, 110, 152, 1, { sex: 'f', view: 'back', aR: 2, dy: -1 });
    } },

  { t0: 103.0, t1: 105.91, scene: 'rooftop', zs: 1, cast: '#6FD8E8', castA: .07,
    in: T('cut', 0),
    cam: CAM(2.91, { z0: 2.10, z1: 2.14, cx0: 120, cy0: 104 }),
    draw(pc, lt, shot, t) {
      SCENES.rooftop.draw(pc, t);
      figure(pc, 118, 152, 1, { sex: 'f', view: 'back', aR: 2 });
      figure(pc, 132, 152, 1, { sex: 'm', eyes: 'narrow', aL: 1, lookX: -.6 });
      spot(pc, 126, 120, 26, .30);
    } },

  { t0: 105.91, t1: 109.0, scene: 'classroom', zs: 1, cast: '#8FB0D8', castA: .08,
    in: T('glitch', .28),
    cam: CAM(3.09, { z0: 1.15, z1: 1.17, cx0: 120, cy0: 62 }),
    draw(pc, lt, shot, t) { SCENES.classroom.draw(pc, t); shade(pc, .12); } },

  { t0: 109.0, t1: 112.26, scene: 'train', zs: 1, cast: '#8FB0D8', castA: .08,
    in: T('cut', 0),
    cam: CAM(3.26, { z0: 3.20, z1: 3.26, cx0: 234, cy0: 118 }),
    draw(pc, lt, shot, t) {
      SCENES.train.draw(pc, t);
      clearSeat(pc); spot(pc, 232, 114, 16, .45);
    } },

  { t0: 112.26, t1: 116.0, scene: 'emptyroom', zs: 1, cast: '#8FB0D8', castA: .08,
    in: T('cut', 0),
    cam: CAM(3.74, { z0: 1.15, z1: 1.18, cx0: 140, cy0: 126 }),
    draw(pc, lt, shot, t) {
      SCENES.emptyroom.draw(pc, t);
      figure(pc, 96, 154, 2, { sex: 'm', pose: 'crouch', eyes: 'cry', mouth: 'frown', tear: .6,
        aR: lt > .8 ? 1 : .3, lookY: .5, lookX: -.4 });
    } },

  { t0: 116.0, t1: 118.45, scene: 'emptyroom', zs: 1, cast: '#8FB0D8', castA: .08,
    in: T('cut', 0),
    cam: CAM(2.45, { z0: 2.80, z1: 2.84, cx0: 46, cy0: 138 }),
    draw(pc, lt, shot, t) { SCENES.emptyroom.draw(pc, t); spot(pc, 46, 138, 20, .28); } },

  { t0: 118.45, t1: 121.5, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .07,
    in: T('cut', 0),
    cam: CAM(3.05, { z0: 3.00, z1: 3.04, cx0: 130, cy0: 128 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      EVENTS.phone.run(pc, lt, { sx: 130, sy: 130, sc: 1.2, dur: 3.05 });
      spot(pc, 130, 126, 26, .34);
    } },

  { t0: 121.5, t1: 124.36, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .07,
    in: T('cut', 0),
    cam: CAM(2.86, { z0: 1.55, z1: 1.59, cx0: 76, cy0: 126 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      figure(pc, 74, 146, 2, { sex: 'm', pose: 'sit', eyes: 'narrow', mouth: 'frown', lookY: .8, aR: .7, aL: .5 });
      EVENTS.phone.run(pc, lt, { sx: 62, sy: 132, sc: .8, dur: 2.8 });
    } },

  { t0: 124.36, t1: 127.6, scene: 'corridor', zs: 1, cast: '#7FB6E8', castA: .06,
    in: T('whip', .26, 1),
    cam: CAM(3.24, { z0: 1.08, z1: 1.05, cx0: 160, cy0: 96 }),
    draw(pc, lt, shot, t) {
      SCENES.corridor.draw(pc, t);
      const p = seg(lt, .1, 3.0);
      figure(pc, lerp(160, 198, easeIO(p)), 158, 1, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5.4, aL: .2, aR: .2 });
    } },

  { t0: 127.6, t1: 130.97, scene: 'corridor', zs: 1, cast: '#7FB6E8', castA: .06,
    in: T('cut', 0),
    cam: CAM(3.37, { z0: 3.20, z1: 3.26, cx0: 32, cy0: 70 }),
    draw(pc, lt, shot, t) { SCENES.corridor.draw(pc, t); spot(pc, 32, 70, 18, .30); } },

  // ============ 四 · 间奏 130.97–164.77（10 镜） ============
  { t0: 130.97, t1: 134.4, scene: 'train', zs: 1, cast: '#8FB0D8', castA: .08,
    in: T('scan', .3),
    cam: CAM(3.43, { z0: 1.15, z1: 1.17, cx0: 150, cy0: 118 }),
    draw(pc, lt, shot, t) {
      SCENES.train.draw(pc, t);
      figure(pc, 120, 120, 1, { sex: 'm', pose: 'sit', eyes: 'dot', mouth: 'flat', lookX: .5 });
    } },

  { t0: 134.4, t1: 138.0, scene: 'train', zs: 1, cast: '#8FB0D8', castA: .08,
    in: T('cut', 0),
    cam: CAM(3.6, { z0: 2.60, z1: 2.64, cx0: 64, cy0: 64 }),
    draw(pc, lt, shot, t) {
      SCENES.train.draw(pc, t);
      winRain(pc, t, 10);
      spot(pc, 64, 66, 20, .26);
    } },

  { t0: 138.0, t1: 139.5, scene: 'train', zs: 1, cast: '#8FB0D8', castA: .08,
    in: T('cut', 0),
    cam: CAM(1.5, { z0: 2.90, z1: 2.92, cx0: 234, cy0: 114 }),
    draw(pc, lt, shot, t) {
      SCENES.train.draw(pc, t);
      clearSeat(pc); spot(pc, 232, 114, 15, .40);
    } },

  { t0: 139.5, t1: 142.6, scene: 'store', zs: 1, cast: '#FF9E5E', castA: .07,
    in: T('cut', 0),
    cam: CAM(3.1, { z0: 1.12, z1: 1.14, cx0: 70, cy0: 112 }),
    draw(pc, lt, shot, t) {
      SCENES.store.draw(pc, t);
      figure(pc, 110, 158, 2, { sex: 'm', eyes: 'dot', mouth: 'flat', lookY: .5, aR: .5 });
    } },

  { t0: 142.6, t1: 145.2, scene: 'store', zs: 1, cast: '#FF9E5E', castA: .07,
    in: T('cut', 0),
    cam: CAM(2.6, { z0: 2.60, z1: 2.66, cx0: 65, cy0: 114 }),
    draw(pc, lt, shot, t) { SCENES.store.draw(pc, t); spot(pc, 65, 116, 22, .22); } },

  { t0: 145.2, t1: 148.0, scene: 'store', zs: 1, cast: '#FF9E5E', castA: .07,
    in: T('cut', 0),
    cam: CAM(2.8, { z0: 1.20, z1: 1.24, cx0: 80, cy0: 116 }),
    draw(pc, lt, shot, t) {
      SCENES.store.draw(pc, t);
      figure(pc, 94, 158, 2, { sex: 'm', eyes: 'dot', mouth: 'flat', lookY: .6, aL: 1, aR: 1 });
    } },

  { t0: 148.0, t1: 152.0, scene: 'lamp', zs: 1, cast: '#7FB6E8', castA: .06,
    in: T('cut', 0),
    cam: CAM(4.0, { z0: 1.05, z1: 1.06, cx0: 180, cy0: 108 }),
    draw(pc, lt, shot, t) {
      SCENES.lamp.draw(pc, t);
      figure(pc, 252, 156, 1, { sex: 'm', view: 'back', dy: 1 });
      SCENES.lamp.fg(pc, t);
    } },

  { t0: 152.0, t1: 155.4, scene: 'lamp', zs: 1, cast: '#7FB6E8', castA: .06,
    in: T('cut', 0),
    cam: CAM(3.4, { z0: 2.60, z1: 2.64, cx0: 100, cy0: 150 }),
    draw(pc, lt, shot, t) {
      SCENES.lamp.draw(pc, t);
      figure(pc, 112, 156, 2, { sex: 'm', pose: 'stand' });
      SCENES.lamp.fg(pc, t);
      spot(pc, 100, 152, 24, .26);
    } },

  { t0: 155.4, t1: 160.0, scene: 'stairs', zs: 1, cast: '#7FB6E8', castA: .06,
    in: T('cut', 0),
    cam: CAM(4.6, { z0: 1.06, z1: 1.08, cx0: 150, cy0: 108, py: [116, 96], ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.stairs.draw(pc, t);
      const p = seg(lt, .2, 4.2), x = lerp(110, 158, easeIO(p));
      const gy = 148 - Math.floor((x - 110) / 14) * 12;
      figure(pc, x, gy, 2, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5.5, aL: .2, aR: .2 });
    } },

  { t0: 160.0, t1: 164.77, scene: 'stairs', zs: 1, cast: '#7FB6E8', castA: .06,
    in: T('cut', 0),
    cam: CAM(4.77, { z0: 2.80, z1: 2.86, cx0: 28, cy0: 70 }),
    draw(pc, lt, shot, t) { SCENES.stairs.draw(pc, t); spot(pc, 28, 72, 20, .28); } },

  // ============ 五 · 主歌 2 164.77–212.82（15 镜） ============
  { t0: 164.77, t1: 167.6, scene: 'room', stage: 2, zs: 1, cast: '#FFB86B', castA: .08,
    in: T('flash', .2, 1, .8),
    cam: CAM(2.83, { z0: 1.06, z1: 1.08, cx0: 160, cy0: 100 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      const p = seg(lt, .2, 2.6);
      figure(pc, lerp(286, 254, easeIO(p)), 150, 2, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5.2, aL: .2, aR: .2 });
    } },

  { t0: 167.6, t1: 170.6, scene: 'room', stage: 2, zs: 1, cast: '#FFB86B', castA: .07,
    in: T('cut', 0),
    cam: CAM(3.0, { z0: 1.10, z1: 1.12, cx0: 76, cy0: 120 }),
    draw(pc, lt, shot, t) { SCENES.room.draw(pc, t); } },

  { t0: 170.6, t1: 172.4, scene: 'room', stage: 2, zs: 1, cast: '#FFB86B', castA: .05,
    in: T('cut', 0),
    cam: CAM(1.8, { z0: 3.40, z1: 3.44, cx0: 246, cy0: 168 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc); doorFloor(pc, 2); spot(pc, 246, 160, 14, .38);
    } },

  { t0: 172.4, t1: 175.4, scene: 'room', stage: 2, zs: 1, cast: '#FFB86B', castA: .07,
    in: T('cut', 0),
    cam: CAM(3.0, { z0: 3.00, z1: 3.04, cx0: 130, cy0: 128 }),
    draw(pc, lt, shot, t) { SCENES.room.draw(pc, t); spot(pc, 130, 126, 24, .26); } },

  { t0: 175.4, t1: 177.32, scene: 'room', stage: 2, zs: 1, cast: '#FFB86B', castA: .07,
    in: T('cut', 0),
    cam: CAM(1.92, { z0: 1.15, z1: 1.17, cx0: 160, cy0: 110 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      figure(pc, 152, 150, 2, { sex: 'm', eyes: 'dot', mouth: 'flat', aR: lt < 1.4 ? 1 : .2 });
      if (lt > 2.0) { lampOff(pc); shade(pc, Math.min(.34, (lt - 2.0) * .7)); }
    } },

  { t0: 177.32, t1: 181.59, scene: 'room', stage: 2, zs: 1, cast: '#FFB86B', castA: .05,
    in: T('cut', 0),
    cam: CAM(4.27, { z0: 1.07, z1: 1.09, cx0: 250, cy0: 108 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      winSnow(pc, t);
      figure(pc, 250, 150, 2, { sex: 'm', view: 'back', dy: 1 });
    } },

  { t0: 181.59, t1: 185.2, scene: 'room', stage: 2, zs: 1, cast: '#FFB86B', castA: .06,
    in: T('cut', 0),
    cam: CAM(3.61, { z0: 1.55, z1: 1.59, cx0: 76, cy0: 126 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      figure(pc, 74, 146, 2, { sex: 'm', pose: 'sit', eyes: 'dot', mouth: 'frown', lookY: .9, aR: .7, aL: .5 });
      EVENTS.phone.run(pc, lt, { sx: 62, sy: 132, sc: .8, dur: 3.6 });
    } },

  { t0: 185.2, t1: 188.01, scene: 'room', stage: 2, zs: 1, cast: '#FFB86B', castA: .06,
    in: T('cut', 0),
    cam: CAM(2.81, { z0: 2.90, z1: 2.94, cx0: 130, cy0: 128 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      EVENTS.phone.run(pc, lt, { sx: 130, sy: 130, sc: 1.6, dur: 2.8 });
      if (Math.floor(lt * 1.6) % 2 === 0) shade(pc, .18);
      spot(pc, 130, 126, 24, .30);
    } },

  { t0: 188.01, t1: 192.0, scene: 'room', stage: 2, zs: 1, cast: '#FFB86B', castA: .05,
    in: T('cut', 0),
    cam: CAM(3.99, { z0: 2.40, z1: 2.44, cx0: 230, cy0: 64 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      winSnow(pc, t);
      sillSnow(pc, Math.min(6, lt * 2));
      winBlink(pc, t);
    } },

  { t0: 192.0, t1: 195.41, scene: 'room', stage: 2, zs: 1, cast: '#FFB86B', castA: .05,
    in: T('cut', 0),
    cam: CAM(3.41, { z0: 1.08, z1: 1.10, cx0: 250, cy0: 106 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      winSnow(pc, t);
      figure(pc, 250, 150, 2, { sex: 'm', view: 'back', dy: 1 });
    } },

  { t0: 195.41, t1: 199.0, scene: 'train', zs: 1, cast: '#FFC98A', castA: .05,
    tint: '#FFD166', tintA: .05, in: T('fade', .4),
    cam: CAM(3.59, { z0: 1.20, z1: 1.22, cx0: 200, cy0: 116 }),
    draw(pc, lt, shot, t) {
      SCENES.train.draw(pc, t);
      clearSeat(pc);
      figure(pc, 200, 120, 1, { sex: 'm', pose: 'sit', eyes: 'closed', mouth: 'flat', aL: .3, aR: .3 });
      figure(pc, 222, 120, 1, { sex: 'f', pose: 'sit', eyes: 'closed', mouth: 'tiny', aL: .3, aR: .3, dy: 1 });
    } },

  { t0: 199.0, t1: 202.11, scene: 'train', zs: 1, cast: '#FFC98A', castA: .05,
    in: T('cut', 0),
    cam: CAM(3.11, { z0: 1.70, z1: 1.74, cx0: 212, cy0: 108 }),
    draw(pc, lt, shot, t) {
      SCENES.train.draw(pc, t);
      clearSeat(pc);
      figure(pc, 200, 120, 1, { sex: 'm', pose: 'sit', eyes: 'narrow', aL: .5, aR: .5, lookX: .6 });
      figure(pc, 222, 120, 1, { sex: 'f', pose: 'sit', eyes: 'closed', aL: .5, aR: .5, dy: 1 });
      spot(pc, 212, 124, 26, .24);
    } },

  { t0: 202.11, t1: 205.6, scene: 'room', stage: 2, zs: 1, cast: '#FFB86B', castA: .05,
    in: T('cut', 0),
    cam: CAM(3.49, { z0: 2.60, z1: 2.64, cx0: 60, cy0: 140 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      EVENTS.phone.run(pc, lt, { sx: 104, sy: 138, sc: 1, dur: 3.5 });
      spot(pc, 90, 140, 26, .28);
    } },

  { t0: 205.6, t1: 208.1, scene: 'room', stage: 3, zs: 1, cast: '#FFB86B', castA: .05,
    in: T('cut', 0),
    cam: CAM(2.5, { z0: 3.20, z1: 3.24, cx0: 246, cy0: 168 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc); doorFloor(pc, 3); spot(pc, 246, 160, 15, .40);
    } },

  { t0: 208.1, t1: 212.82, scene: 'room', stage: 3, zs: 1, cast: '#FFB86B', castA: .05,
    in: T('cut', 0),
    cam: CAM(4.72, { z0: 1.00, z1: .96, cx0: 160, cy0: 100, ease: 'out' }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      figure(pc, 250, 150, 2, { sex: 'm', view: 'back', dy: 1 });
      if (lt > 3.2) { lampOff(pc); shade(pc, Math.min(.5, (lt - 3.2) * .55)); }
    } },


  // ============ 六 · 副歌 2 212.82–260.41（14 镜） ============
  { t0: 212.82, t1: 215.0, scene: 'sea', zs: 1, cast: '#6FD8E8', castA: .08,
    in: T('flash', .12, 1, .9),
    cam: CAM(2.18, { z0: 2.40, z1: 2.46, cx0: 299, cy0: 78 }),
    draw(pc, lt, shot, t) { SCENES.sea.draw(pc, t); } },

  { t0: 215.0, t1: 219.33, scene: 'sea', zs: 1, cast: '#6FD8E8', castA: .08,
    in: T('cut', 0),
    cam: CAM(4.33, { z0: 1.25, z1: 1.28, cx0: 140, cy0: 112 }),
    draw(pc, lt, shot, t) {
      SCENES.sea.draw(pc, t);
      figure(pc, 104, 148, 1, { sex: 'm', view: 'back' });
      shade(pc, .12);
    } },

  { t0: 219.33, t1: 222.6, scene: 'rooftop', zs: 1, cast: '#6FD8E8', castA: .08,
    in: T('cut', 0),
    cam: CAM(3.27, { z0: 1.06, z1: 1.08, cx0: 150, cy0: 104 }),
    draw(pc, lt, shot, t) {
      SCENES.rooftop.draw(pc, t);
      figure(pc, 150, 152, 1, { sex: 'm', view: 'back', dy: 1 });
      if (lt > .8) EVENTS.firework.run(pc, lt - .8, { sx: 70, sy: 100, col: PAL.gold });
      if (lt > 2.0) EVENTS.firework.run(pc, lt - 2.0, { sx: 250, sy: 96, col: PAL.pale });
    } },

  { t0: 222.6, t1: 225.92, scene: 'rooftop', zs: 1, cast: '#6FD8E8', castA: .07,
    in: T('cut', 0),
    cam: CAM(3.32, { z0: 1.85, z1: 1.89, cx0: 200, cy0: 86 }),
    draw(pc, lt, shot, t) {
      SCENES.rooftop.draw(pc, t);
      const k = Math.max(0, 1 - lt / 2.4);
      if (k > 0) glow(pc, 214, 74, 26 * k, 18 * k, PAL.gold, .5 * k);
      figure(pc, 200, 152, 1, { sex: 'm', eyes: 'narrow', mouth: 'flat', lookX: -.6, lookY: -.3 });
    } },

  { t0: 225.92, t1: 229.2, scene: 'snow', zs: 1, cast: '#9FBFE0', castA: .09,
    tint: '#7FD0DC', tintA: .10, in: T('cut', 0),
    cam: CAM(3.28, { z0: 2.35, z1: 2.40, cx0: 200, cy0: 150 }),
    draw(pc, lt, shot, t) { SCENES.snow.draw(pc, t); SCENES.snow.fg(pc, t); } },

  { t0: 229.2, t1: 232.16, scene: 'snow', zs: 1, cast: '#9FBFE0', castA: .09,
    tint: '#7FD0DC', tintA: .10, in: T('cut', 0),
    cam: CAM(2.96, { z0: 1.05, z1: 1.07, cx0: 140, cy0: 108 }),
    draw(pc, lt, shot, t) {
      SCENES.snow.draw(pc, t);
      figure(pc, 196, 150, 1, { sex: 'm', view: 'back', dy: 1 });
      SCENES.snow.fg(pc, t);
    } },

  { t0: 232.16, t1: 236.0, scene: 'classroom', zs: 1, cast: '#8FB0D8', castA: .10,
    in: T('glitch', .3),
    cam: CAM(3.84, { z0: 1.10, z1: 1.12, cx0: 160, cy0: 90 }),
    draw(pc, lt, shot, t) {
      montage(pc, lt, 3.84, [
        ['classroom', 152], ['train', 156], ['street', 158], ['store', 158],
      ], { glitch: true });
    } },

  { t0: 236.0, t1: 238.38, scene: 'emptyroom', zs: 1, cast: '#8FB0D8', castA: .09,
    in: T('cut', 0),
    cam: CAM(2.38, { z0: 1.10, z1: 1.12, cx0: 160, cy0: 126, hand: 1.2 }),
    draw(pc, lt, shot, t) {
      SCENES.emptyroom.draw(pc, t);
      figure(pc, 160, 154, 2, { sex: 'm', view: 'back', dy: Math.round(Math.sin(lt * 9) * 1) });
    } },

  { t0: 238.38, t1: 241.2, scene: 'emptyroom', zs: 1, cast: '#8FB0D8', castA: .09,
    in: T('cut', 0),
    cam: CAM(2.82, { z0: 3.00, z1: 3.04, cx0: 54, cy0: 140 }),
    draw(pc, lt, shot, t) { SCENES.emptyroom.draw(pc, t); spot(pc, 52, 140, 20, .30); } },

  { t0: 241.2, t1: 244.78, scene: 'emptyroom', zs: 1, cast: '#8FB0D8', castA: .08,
    in: T('cut', 0),
    cam: CAM(3.58, { z0: 1.90, z1: 1.94, cx0: 160, cy0: 116 }),
    draw(pc, lt, shot, t) {
      SCENES.emptyroom.draw(pc, t);
      EVENTS.wipe.run(pc, lt, { sx: 160, sy: 154, S: 2, sex: 'm', dur: 3.58 });
    } },

  { t0: 244.78, t1: 249.0, scene: 'store', zs: 1, cast: '#FF9E5E', castA: .05,
    in: T('cut', 0),
    cam: CAM(4.22, { z0: 1.20, z1: 1.24, cx0: 80, cy0: 116 }),
    draw(pc, lt, shot, t) {
      SCENES.store.draw(pc, t);
      if (lt < 2.6) figure(pc, 94, 158, 2, { sex: 'm', eyes: 'dot', mouth: 'flat', lookY: .5 });
      else figure(pc, lerp(94, 152, seg(lt, 2.6, 4.2)), 158, 2, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5 });
    } },

  { t0: 249.0, t1: 253.93, scene: 'street', zs: 1, cast: '#7FB6E8', castA: .06,
    in: T('cut', 0),
    cam: CAM(4.93, { z0: 1.30, z1: 1.33, cx0: 150, cy0: 116 }),
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      const p = seg(lt, 2.4, 4.2);
      figure(pc, 150, 158, 1, { sex: 'm',
        eyes: p > 0 ? 'teary' : 'glare', mouth: p > 0 ? 'frown' : 'smile',
        tear: p * .5, aR: .5 + p * .5, lookY: -.2 });
      SCENES.street.fg(pc, t);
    } },

  { t0: 253.93, t1: 257.0, scene: 'emptyroom', zs: 1, cast: '#8FB0D8', castA: .08,
    in: T('cut', 0),
    cam: CAM(3.07, { z0: 1.05, z1: 1.07, cx0: 150, cy0: 128 }),
    draw(pc, lt, shot, t) {
      SCENES.emptyroom.draw(pc, t);
      figure(pc, 150, 154, 2, { sex: 'm', pose: 'crouch', eyes: 'cry', mouth: 'open', tear: .9, aL: 2, aR: 2, lookY: .6 });
    } },

  { t0: 257.0, t1: 260.41, scene: 'emptyroom', zs: 1, cast: '#8FB0D8', castA: .07,
    in: T('cut', 0),
    cam: CAM(3.41, { z0: 2.60, z1: 2.64, cx0: 150, cy0: 146 }),
    draw(pc, lt, shot, t) { SCENES.emptyroom.draw(pc, t); shade(pc, .30); } },

  // ============ 七 · 尾段 260.41–292.0（10 镜） ============
  { t0: 260.41, t1: 264.0, scene: 'room', stage: 3, zs: 1, cast: '#FFB86B', castA: .08,
    in: T('cut', 0),
    cam: CAM(3.59, { z0: 2.60, z1: 2.66, cx0: 130, cy0: 120 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      const k = .55 + .45 * (Math.sin(lt * Math.PI * 2 / 3.4) * .5 + .5);
      glow(pc, 130, 118, 40 * k, 34 * k, PAL.gold, .55 * k);
      glow(pc, 130, 132, 26 * k, 14 * k, PAL.gold, .5 * k);
      R(pc, 126, 115, 9, 2, PAL.paper);
    } },

  { t0: 264.0, t1: 266.5, scene: 'room', stage: 3, zs: 1, cast: '#FFB86B', castA: .06,
    in: T('cut', 0),
    cam: CAM(2.5, { z0: 2.20, z1: 2.24, cx0: 152, cy0: 112 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      figure(pc, 160, 150, 2, { sex: 'm', eyes: 'closed', mouth: 'flat', aR: lt < 1.2 ? 1 : .2 });
      spot(pc, 148, 118, 22, .30);
    } },

  { t0: 266.50, t1: 270.0, scene: 'room', stage: 3, zs: 1, cast: '#FFB86B', castA: .06,
    in: T('cut', 0),
    cam: CAM(3.5, { z0: 1.06, z1: 1.09, cx0: 160, cy0: 100 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      const k = .6 + .4 * (Math.sin(lt * Math.PI * 2 / 3.4) * .5 + .5);
      glow(pc, 130, 118, 40 * k, 34 * k, PAL.gold, .5 * k);
      figure(pc, 160, 150, 2, { sex: 'm', eyes: 'closed', mouth: 'flat', aR: .2, dy: 1 });
    } },

  { t0: 270.0, t1: 273.0, scene: 'room', stage: 3, zs: 1, cast: '#FFB86B', castA: .05,
    in: T('cut', 0),
    cam: CAM(3.0, { z0: 3.20, z1: 3.24, cx0: 130, cy0: 128 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      EVENTS.phone.run(pc, lt, { sx: 130, sy: 130, sc: 1.6, dur: 3 });
      const k = Math.min(1, lt / 2.2);
      shade(pc, .18 + k * .5);
      spot(pc, 130, 126, 20, .30);
    } },

  { t0: 273.0, t1: 276.0, scene: 'room', stage: 3, zs: 1, cast: '#FFB86B', castA: .05,
    in: T('cut', 0),
    cam: CAM(3.0, { z0: 1.55, z1: 1.59, cx0: 76, cy0: 128 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      figure(pc, 74, 146, 2, { sex: 'm', pose: 'bow', eyes: 'closed', mouth: 'flat', dy: 3, aR: .8, aL: .5 });
      EVENTS.phone.run(pc, lt, { sx: 62, sy: 134, sc: .8, dur: 3 });
      spot(pc, 74, 132, 26, .30);
    } },

  { t0: 276.0, t1: 279.1, scene: 'room', stage: 3, zs: 1, cast: '#FFB86B', castA: .05,
    in: T('cut', 0),
    cam: CAM(3.1, { z0: 1.00, z1: .98, cx0: 160, cy0: 100, ease: 'out' }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      figure(pc, 250, 150, 2, { sex: 'm', view: 'back', dy: 1 });
      shade(pc, .46);
    } },

  { t0: 279.10, t1: 283.0, scene: 'corridor', zs: 1, cast: '#FFC98A', castA: .09,
    in: T('flash', .3, 1, .6),
    cam: CAM(3.9, { z0: 1.08, z1: 1.04, cx0: 160, cy0: 96 }),
    draw(pc, lt, shot, t) {
      SCENES.corridor.draw(pc, t);
      const p = seg(lt, .1, 3.6);
      figure(pc, lerp(160, 206, easeIO(p)), 158, 1, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5.4, aL: .2, aR: .2 });
    } },

  { t0: 283.0, t1: 285.74, scene: 'corridor', zs: 1, cast: '#FFC98A', castA: .10,
    in: T('cut', 0),
    cam: CAM(2.74, { z0: 1.50, z1: 1.56, cx0: 160, cy0: 92 }),
    draw(pc, lt, shot, t) {
      SCENES.corridor.draw(pc, t);
      const k = Math.min(1, lt / 1.8);
      glow(pc, 160, 95, 66 + k * 30, 58 + k * 26, PAL.paper, .30 + k * .3);
    } },

  { t0: 285.74, t1: 289.0, scene: 'corridor', zs: 1, cast: '#FFC98A', castA: .10,
    in: T('cut', 0),
    cam: CAM(3.26, { z0: 1.20, z1: 1.22, cx0: 160, cy0: 104 }),
    draw(pc, lt, shot, t) {
      SCENES.corridor.draw(pc, t);
      figure(pc, 178, 158, 1, { sex: 'm', view: 'back' });
      shade(pc, .18);
    } },

  { t0: 289.0, t1: 292.0, scene: 'corridor', zs: 1, cast: '#FFC98A', castA: .06,
    in: T('cut', 0),
    cam: CAM(3.0, { z0: 2.60, z1: 2.64, cx0: 36, cy0: 116 }),
    draw(pc, lt, shot, t) { SCENES.corridor.draw(pc, t); spot(pc, 36, 118, 20, .34); } },

  // ============ 八 · 尾声 292.0–329.2（8 镜） ============
  { t0: 292.0, t1: 296.4, scene: 'black', cam: false,
    in: T('cut', 0),
    draw(pc) { R(pc, 0, 0, 320, 180, PAL.ink); } },

  { t0: 296.4, t1: 301.0, scene: 'snow', zs: 1, cast: '#9FBFE0', castA: .10,
    tint: '#7FD0DC', tintA: .08, in: T('fade', .6),
    cam: CAM(4.6, { z0: 1.04, z1: 1.06, cx0: 120, cy0: 104 }),
    draw(pc, lt, shot, t) {
      SCENES.snow.draw(pc, t);
      const p = seg(lt, .2, 4.4);
      figure(pc, lerp(150, 182, easeIO(p)), 150, 1, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5.2, aL: .2, aR: .2 });
      SCENES.snow.fg(pc, t);
    } },

  { t0: 301.0, t1: 305.5, scene: 'snow', zs: 1, cast: '#9FBFE0', castA: .10,
    tint: '#7FD0DC', tintA: .08, in: T('cut', 0),
    cam: CAM(4.5, { z0: 1.35, z1: 1.38, cx0: 190, cy0: 112 }),
    draw(pc, lt, shot, t) {
      SCENES.snow.draw(pc, t);
      const back = lt < 1.6 || lt > 3.4;
      figure(pc, 196, 150, 1, back
        ? { sex: 'm', view: 'back' }
        : { sex: 'm', eyes: 'dot', mouth: 'flat', lookX: -.4, dy: 1 });
      SCENES.snow.fg(pc, t);
    } },

  { t0: 305.5, t1: 310.0, scene: 'snow', zs: 1, cast: '#9FBFE0', castA: .10,
    tint: '#7FD0DC', tintA: .08, in: T('cut', 0),
    cam: CAM(4.5, { z0: 1.00, z1: 1.03, cx0: 160, cy0: 106 }),
    draw(pc, lt, shot, t) {
      SCENES.snow.draw(pc, t);
      const p = seg(lt, .1, 4.2);
      figure(pc, lerp(213, 272, easeIO(p)), 150, 1, { sex: 'm', view: 'back', pose: 'walk', walk: t * 4.6 });
      SCENES.snow.fg(pc, t);
    } },

  { t0: 310.0, t1: 315.0, scene: 'snow', zs: 1, cast: '#9FBFE0', castA: .10,
    tint: '#7FD0DC', tintA: .08, in: T('cut', 0),
    cam: CAM(5.0, { z0: 2.30, z1: 2.34, cx0: 196, cy0: 144 }),
    draw(pc, lt, shot, t) {
      SCENES.snow.draw(pc, t);
      secondPrints(pc, Math.min(1, lt / 3.4));
      SCENES.snow.fg(pc, t);
    } },

  { t0: 315.0, t1: 321.0, scene: 'snow', zs: 1, cast: '#9FBFE0', castA: .10,
    tint: '#7FD0DC', tintA: .08, in: T('cut', 0),
    cam: CAM(6.0, { z0: 1.00, z1: .97, cx0: 110, cy0: 80, ease: 'out' }),
    draw(pc, lt, shot, t) {
      SCENES.snow.draw(pc, t);
      shade(pc, .22);
      SCENES.snow.fg(pc, t);
    } },

  { t0: 321.0, t1: 325.0, scene: 'snow', zs: 1, cast: '#9FBFE0', castA: .09,
    tint: '#7FD0DC', tintA: .08, in: T('cut', 0),
    cam: CAM(4.0, { z0: 3.00, z1: 3.06, cx0: 250, cy0: 132 }),
    draw(pc, lt, shot, t) { SCENES.snow.draw(pc, t); spot(pc, 250, 132, 20, .30); } },

  { t0: 325.0, t1: 329.2, scene: 'black', cam: false,
    in: T('fade', 1.2, 1, 1),
    draw(pc, lt) {
      R(pc, 0, 0, 320, 180, PAL.ink);
      if (lt < 2.4 && Math.floor(lt * 3) % 2 === 0) { PX(pc, 160, 90, PAL.gold); PX(pc, 160, 91, PAL.gold); }
    } },

  ],

  subs: buildSubs(),
  nar: NAR(),
  kao: [],
};

// ---------------- 歌词（时间一帧不改，只换样式） ----------------
function buildSubs() {
  const BIG = true;
  const L = [
    [38.40, '开了灯 眼前的模样', ['开了灯']],
    [42.77, '偌大的房 寂寞的床', ['寂寞']],
    [50.99, '关了灯 全都一个样', ['关了灯']],
    [55.37, '心里的伤 无法分享', ['伤']],
    [61.56, '生命 随年月流去 随白发老去', ['流去', '老去']],
    [69.10, '随着你离去 快乐渺无音讯', ['离去', '音讯']],
    [75.81, '随往事淡去 随梦境睡去', ['淡去', '睡去']],
    [81.74, '随麻痹的心逐渐远去', ['远去']],
    [86.53, '我好想你 好想你', [], BIG],
    [93.01, '却不露痕迹', ['痕迹']],
    [99.57, '我还踮着脚思念', ['踮着脚']],
    [105.91, '我还任记忆盘旋', ['盘旋']],
    [112.26, '我还闭着眼流泪', ['流泪']],
    [118.45, '我还装作无所谓', ['无所谓']],
    [124.36, '我好想你 好想你', [], BIG],
    [130.97, '却欺骗自己', ['欺骗']],
    [164.77, '开了灯 眼前的模样', ['开了灯']],
    [169.02, '偌大的房 寂寞的床', ['寂寞']],
    [177.32, '关了灯 全都一个样', ['关了灯']],
    [181.59, '心里的伤 无法分享', ['伤']],
    [188.01, '生命 随年月流去 随白发老去', ['流去', '老去']],
    [195.41, '随着你离去 快乐渺无音讯', ['离去', '音讯']],
    [202.11, '随往事淡去 随梦境睡去', ['淡去', '睡去']],
    [208.10, '随麻痹的心逐渐远去', ['远去']],
    [212.82, '我好想你 好想你', [], BIG],
    [219.33, '却不露痕迹', ['痕迹']],
    [225.92, '我还踮着脚思念', ['踮着脚']],
    [232.16, '我还任记忆盘旋', ['盘旋']],
    [238.38, '我还闭着眼流泪', ['流泪']],
    [244.78, '我还装作无所谓', ['无所谓']],
    [253.93, '我好想你 好想你', [], BIG],
    [260.41, '却欺骗自己', ['欺骗']],
    [266.50, '我好想你 好想你', [], BIG],
    [272.98, '就当作秘密', ['秘密']],
    [279.10, '我好想你 好想你', [], BIG],
    [285.74, '就深藏在心', ['深藏', '心']],
  ];
  const out = [];
  L.forEach((l, i) => {
    const n = [...l[1].replace(/\s/g, '')].length;
    const est = Math.min(9.0, Math.max(3.4, n * 0.95 + 1.8));
    const end = i < L.length - 1 ? Math.min(L[i + 1][0], l[0] + est) : 292.0;
    const t1 = Math.max(l[0] + 1.6, end);
    if (l[3]) {
      out.push({ t0: l[0], t1, text: l[1], kw: l[2], band: false, color: '#FFD166',
        size: 140, y: 356, kScale: .26, hit: 1, ghost: 2 });
    } else {
      out.push({ t0: l[0], t1, text: l[1], kw: l[2], band: false, size: 40, y: 972, accent: '#F6E9D2' });
    }
  });
  out.push({ t0: 313.0, t1: 321.0, text: '我好想你', size: 140, y: 400, color: '#C9C6DD', band: false, kScale: .3 });
  return out;
}

// ---------------- 叙事文字：6 条系统提示 + 1 张章节卡 ----------------
function NAR() {
  return [
    { t0: 15.6, t1: 18.2, style: 'sys', text: '明天见。' },
    { t0: 24.3, t1: 27.9, style: 'sys', text: '明天没有来' },
    { t0: 33.6, t1: 37.8, style: 'sys', text: '▶ 调查：门口 · 已读档 4 次' },
    { t0: 148.5, t1: 151.9, style: 'sys', text: '他说：嗯。' },
    { t0: 182.1, t1: 185.3, style: 'sys', text: '▶ 草稿箱 · 1 条未发送' },
    { t0: 205.6, t1: 208.0, style: 'sys', text: '▶ 物品已收起' },
    { t0: 292.4, t1: 296.4, style: 'card', text: '第 38 天', sub: '他走进了雪里', tag: 'DAY / 38' },
  ];
}
