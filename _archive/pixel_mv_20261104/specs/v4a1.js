// specs/v4a1.js — v4 预览 · 第一幕（0–38.4s，10 镜，带原曲）
// 用途：看节奏、转场、对轴；分镜词见 v4-资产版.md §8 一
// node daily.mjs --spec=specs/v4a1.js --audio="D:/ai音乐mv/我好想你/苏打绿 - 我好想你 (苏打绿版).mp3" --out=out/v4_act1.mp4 --no-cover

if (typeof PAL !== 'undefined') Object.assign(PAL, {
  ink: '#05080D', night: '#0E1B29', navy: '#1A2C40', slate: '#33506A',
  dusk: '#274A68', haze: '#7899B4', wall: '#202C3A', wallDk: '#161F2A',
  floor: '#2E2724', floorDk: '#1C1714', seaDk: '#19353F', steel: '#40607A',
});

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
function spot(c, cx, cy, r, k) {
  shadeMask(c, (x, y) => {
    const d = Math.hypot(x - cx, y - cy);
    return k * Math.min(1, Math.max(0, (d - r) / 26));
  });
}
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
function lampOff(c) {
  R(c, 94, 86, 74, 46, PAL.night);
  R(c, 96, 130, 60, 4, PAL.navy);
  R(c, 96, 130, 60, 1, PAL.dusk);
  R(c, 94, 134, 74, 16, PAL.ink);
  R(c, 129, 118, 3, 11, PAL.navy);
  R(c, 126, 129, 10, 2, PAL.night);
}

window.SPEC = {
  fps: 24, duration: 38.4, fadeIn: 0, fadeOut: 0,
  grade: 'brightness(1.12) saturate(.95) contrast(1.12)',
  cover: 'A',

  shots: [
  // 1 —— 开机：点阵片名
  { t0: 0, t1: 6.0, scene: 'black', cam: false,
    led: { title: '我好想你', sub: '第 37 天 · 他还没学会不回头' },
    draw(pc) { R(pc, 0, 0, 320, 180, PAL.ink); } },

  // 2 —— 雨街：两人背身并排走（S=1，人 22%）
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

  // 3 —— 站牌特写（无人）
  { t0: 9.6, t1: 12.4, scene: 'street', zs: 1, cast: '#7FB6E8', castA: .08,
    in: T('cut', 0),
    cam: CAM(2.8, { z0: 2.60, z1: 2.66, cx0: 51, cy0: 118 }),
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      SCENES.street.fg(pc, t);
    } },

  // 4 —— 站牌下告别：她仰头，他背身当前景
  { t0: 12.4, t1: 15.0, scene: 'street', zs: 1, cast: '#7FB6E8', castA: .07,
    in: T('cut', 0),
    cam: CAM(2.6, { z0: 1.40, z1: 1.44, cx0: 78, cy0: 112, hand: .4 }),
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      figure(pc, 112, 158, 1, { sex: 'm', view: 'back' });
      figure(pc, 86, 158, 1, { sex: 'f', eyes: 'up', lookY: -.4, mouth: 'tiny', aR: .5, lookX: .4 });
      SCENES.street.fg(pc, t);
    } },

  // 5 —— 她走远，他抬手又放下
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

  // 6 —— 空街：只剩灯和雨
  { t0: 18.4, t1: 21.2, scene: 'street', zs: 1, cast: '#7FB6E8', castA: .06,
    in: T('blk', .10),
    cam: CAM(2.8, { z0: 1.20, z1: 1.23, cx0: 222, cy0: 70 }),
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      SCENES.street.fg(pc, t);
    } },

  // 7 —— 楼梯：背身上楼
  { t0: 21.2, t1: 24.0, scene: 'stairs', zs: 1, cast: '#7FB6E8', castA: .06,
    in: T('blk', .10),
    cam: CAM(2.8, { z0: 1.06, z1: 1.08, cx0: 150, cy0: 108, py: [116, 96], ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.stairs.draw(pc, t);
      // 台阶 i 的踏面 y = 148 - 12i，脚必须落在踏面上，否则人浮在阶前
      const p = seg(lt, .2, 2.6), x = lerp(110, 152, easeIO(p));
      const gy = 148 - Math.floor((x - 110) / 14) * 12;
      figure(pc, x, gy, 2, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5.5, aL: .2, aR: .2 });
    } },

  // 8 —— 楼梯：手扶栏杆，停一下
  { t0: 24.0, t1: 28.6, scene: 'stairs', zs: 1, cast: '#7FB6E8', castA: .06,
    in: T('cut', 0),
    cam: CAM(4.6, { z0: 1.25, z1: 1.29, cx0: 120, cy0: 118, hand: .3 }),
    draw(pc, lt, shot, t) {
      SCENES.stairs.draw(pc, t);
      figure(pc, 150, 124, 2, { sex: 'm', eyes: 'narrow', mouth: 'flat', lookY: .4,
        aR: lt > .8 ? 1 : 0, dy: lt > 2.0 ? 1 : 0 });
    } },

  // 9 —— 进门：灯没开，只有窗光
  { t0: 28.6, t1: 33.6, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .10,
    in: T('blk', .12),
    cam: CAM(5.0, { z0: 1.06, z1: 1.08, cx0: 160, cy0: 100 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      const p = seg(lt, .3, 4.4);
      figure(pc, lerp(286, 250, easeIO(p)), 150, 2, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5.2, aL: .2, aR: .2 });
    } },

  // 10 —— 门口：两只拖鞋（母题①）
  { t0: 33.6, t1: 38.4, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .05,
    in: T('cut', 0),
    cam: CAM(4.8, { z0: 3.20, z1: 3.26, cx0: 242, cy0: 168, hand: .3 }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      lampOff(pc);
      doorFloor(pc, 1);
      spot(pc, 250, 160, 15, .34);
    } },
  ],

  subs: [],
  nar: [
    { t0: 15.6, t1: 18.2, style: 'sys', text: '明天见。' },
    { t0: 24.3, t1: 27.9, style: 'sys', text: '明天没有来' },
    { t0: 33.6, t1: 37.8, style: 'sys', text: '▶ 调查：门口 · 已读档 4 次' },
  ],
  kao: [],
};
