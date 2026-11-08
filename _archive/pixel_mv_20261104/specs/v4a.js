// specs/v4a.js —《我好想你》v4 预览版：只落 12 个 ★ 关键镜
// 分镜词：D:/ai音乐mv/我好想你/分镜词-我好想你-像素RPG版-v4-资产版.md §8
// 目的：验证三件事——冷调换血后是否"透"、人物尺子归位后是否"小"、取景是否认得出场景
// 用法：node probev4.mjs --spec=v4a --t=7.8,11.2 --out=out/v4
//      （加 --q=notext 出无字版）

// ---------- PAL 换血：只改 12 个中性色，暖色一个不动 ----------
if (typeof PAL !== 'undefined') Object.assign(PAL, {
  ink:     '#05080D',   // 描边 / 最暗（死黑靠它）
  night:   '#0E1B29',   // 夜底、天空
  navy:    '#1A2C40',   // 家具暗部、路面
  slate:   '#33506A',   // 次暗面
  dusk:    '#274A68',   // 结构线
  haze:    '#7899B4',   // 中间调：决定全片色相
  wall:    '#202C3A',   // 室内墙（比夜色亮一档，家具才立得住）
  wallDk:  '#161F2A',   // 墙角
  floor:   '#2E2724',   // 木地板（留一点暖）
  floorDk: '#1C1714',   // 地板缝
  seaDk:   '#19353F',   // 海水
  steel:   '#40607A',   // 他的外套
});

const WITH_TEXT = (typeof location === 'undefined') ? true : !location.search.includes('notext');

// CAM 与 v2 同签名：CAM(时长, {z0,z1,cx0,cy0,px,py,hand,ease})
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


// 局部压暗：让道具落在一小片亮里，背景的 dither 掉进阴影
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
  c.beginPath(); c.moveTo(206, 150); c.lineTo(300, 150); c.lineTo(314, 180); c.lineTo(232, 180); c.closePath(); c.fill();
  c.restore();
  if (stage < 3) { R(c, 244, 158, 8, 4, PAL.rose); R(c, 245, 157, 6, 1, PAL.blush); R(c, 245, 162, 7, 2, PAL.night); }
  if (stage < 2) { R(c, 255, 159, 8, 4, PAL.rose); R(c, 256, 158, 6, 1, PAL.blush); R(c, 256, 163, 7, 2, PAL.night); }
}

// 把车厢里那个乘客盖掉（只留座椅），让围巾真的落在"空座"上
function clearSeat(c) {
  R(c, 243, 86, 16, 6, PAL.night);
  R(c, 243, 92, 16, 2, PAL.dusk);
  R(c, 243, 94, 16, 18, PAL.navy);
  R(c, 243, 112, 16, 7, PAL.dusk);
  R(c, 243, 112, 16, 1, PAL.haze);
}

window.SPEC = {
  fps: 24,
  duration: 329.2,
  fadeIn: 0,
  fadeOut: 0,
  grade: 'brightness(1.12) saturate(.95) contrast(1.12)',

  shots: [
  // ---- ★2 雨街 双人背身并排走（S=1，人 22%）----
  { t0: 6.0, t1: 9.6, scene: 'street', zs: 1, cast: '#7FB6E8', castA: .08,
    cam: CAM(3.6, { z0: 1.05, z1: 1.05, px: [150, 176], cy0: 96 }),
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      const x = lerp(96, 148, easeIO(seg(lt, .2, 3.4)));
      figure(pc, x, 158, 1, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5.5, aL: .2, aR: .2 });
      figure(pc, x + 21, 158, 1, { sex: 'f', view: 'back', pose: 'walk', walk: t * 5.5 + 1, aL: .2, aR: .2 });
      SCENES.street.fg(pc, t);
    } },

  // ---- ★3 站牌特写（她每天在这等车；不出现人，给"物"一口气）----
  { t0: 9.6, t1: 12.4, scene: 'street', zs: 1, cast: '#7FB6E8', castA: .08,
    cam: CAM(2.8, { z0: 2.60, z1: 2.66, cx0: 51, cy0: 118 }),
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      SCENES.street.fg(pc, t);
    } },

  // ---- ★4 站牌下告别：她仰头，他背身当前景 ----
  { t0: 12.4, t1: 15.0, scene: 'street', zs: 1, cast: '#7FB6E8', castA: .07,
    cam: CAM(2.6, { z0: 1.40, z1: 1.44, cx0: 78, cy0: 112, hand: .4 }),
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      figure(pc, 112, 158, 1, { sex: 'm', view: 'back' });
      figure(pc, 86, 158, 1, { sex: 'f', eyes: 'up', lookY: -.4, mouth: 'tiny', aR: .5, lookX: .4 });
      SCENES.street.fg(pc, t);
    } },

  // ---- ★10 两只拖鞋（母题①：占宽 21%，1080 上 172px）----
  { t0: 33.6, t1: 38.4, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .05,
    cam: CAM(4.8, { z0: 3.20, z1: 3.26, cx0: 242, cy0: 168, hand: .3 }),
    draw(pc, lt, shot, t) { SCENES.room.draw(pc, t); doorFloor(pc, 1); spot(pc, 250, 160, 15, .34); } },

  // ---- ★13 挂钟+日历 → 两只杯子（场景身份：住过两个人）----
  { t0: 46.0, t1: 50.99, scene: 'room', stage: 1, zs: 1, cast: '#FFB86B', castA: .05,
    cam: CAM(4.99, { z0: 1.16, z1: 1.10, cx0: 146, cy0: 96, ease: 'io' }),
    draw(pc, lt, shot, t) { SCENES.room.draw(pc, t); } },

  // ---- ★23 灯塔（空镜开场，副歌大字压在天空）----
  { t0: 86.53, t1: 88.8, scene: 'sea', zs: 1, cast: '#6FD8E8', castA: .08,
    cam: CAM(2.27, { z0: 2.2, z1: 2.26, cx0: 299, cy0: 78 }),
    draw(pc, lt, shot, t) { SCENES.sea.draw(pc, t); } },

  // ---- ★30 空座上的围巾（母题①：她不在，围巾在）----
  { t0: 109.0, t1: 112.26, scene: 'train', zs: 1, cast: '#8FB0D8', castA: .08,
    cam: CAM(3.26, { z0: 2.35, z1: 2.41, cx0: 234, cy0: 94 }),
    draw(pc, lt, shot, t) { SCENES.train.draw(pc, t); clearSeat(pc); spot(pc, 232, 114, 16, .45); } },

  // ---- ★42 两只手各接一份（母题②：手够到锅边）----
  { t0: 145.2, t1: 148.0, scene: 'store', zs: 1, cast: '#FF9E5E', castA: .07,
    cam: CAM(2.8, { z0: 1.20, z1: 1.24, cx0: 80, cy0: 116 }),
    draw(pc, lt, shot, t) {
      SCENES.store.draw(pc, t);
      figure(pc, 94, 158, 2, { sex: 'm', eyes: 'dot', mouth: 'flat', lookY: .6, aL: 1, aR: 1 });
    } },

  // ---- ★49 只剩一只（母题②：同一位置、更大、更空）----
  { t0: 170.6, t1: 172.4, scene: 'room', stage: 2, zs: 1, cast: '#FFB86B', castA: .03,
    cam: CAM(1.8, { z0: 3.40, z1: 3.46, cx0: 246, cy0: 168 }),
    draw(pc, lt, shot, t) { SCENES.room.draw(pc, t); doorFloor(pc, 2); spot(pc, 248, 160, 14, .38); } },

  // ---- ★63 海：他一人背身，右侧空出一个人位 ----
  { t0: 215.0, t1: 219.33, scene: 'sea', zs: 1, cast: '#6FD8E8', castA: .08,
    cam: CAM(4.33, { z0: 1.25, z1: 1.28, cx0: 140, cy0: 112 }),
    draw(pc, lt, shot, t) {
      SCENES.sea.draw(pc, t);
      figure(pc, 104, 148, 1, { sex: 'm', view: 'back' });
    } },

  // ---- ★66 第一串脚印（占宽 41%）----
  { t0: 225.92, t1: 229.2, scene: 'snow', zs: 1, cast: '#9FBFE0', castA: .09,
    tint: '#7FD0DC', tintA: .10,
    cam: CAM(3.28, { z0: 2.35, z1: 2.40, cx0: 200, cy0: 150 }),
    draw(pc, lt, shot, t) { SCENES.snow.draw(pc, t); } },

  // ---- ★72 同一取景、双手垂着不接（母题③：重复构图，相反动作）----
  { t0: 244.78, t1: 249.0, scene: 'store', zs: 1, cast: '#FF9E5E', castA: .06,
    cam: CAM(4.22, { z0: 1.20, z1: 1.24, cx0: 80, cy0: 116 }),
    draw(pc, lt, shot, t) {
      SCENES.store.draw(pc, t);
      if (lt < 2.6) figure(pc, 94, 158, 2, { sex: 'm', eyes: 'dot', mouth: 'flat', lookY: .5 });
      else figure(pc, lerp(94, 152, seg(lt, 2.6, 4.2)), 158, 2, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5 });
    } },
  ],

  // ---- 文字：只放预览需要的那几条（验证字号/位置，不是全片表）----
  subs: WITH_TEXT ? [
    { t0: 42.77, t1: 50.99, text: '偌大的房 寂寞的床', band: false, size: 40, y: 972 },
    { t0: 86.53, t1: 93.0, text: '我好想你 好想你', band: false, size: 140, y: 356, hit: 1, ghost: 2, color: '#FFD166' },
    { t0: 105.91, t1: 112.26, text: '我还任记忆盘旋', band: false, size: 40, y: 972 },
    { t0: 169.02, t1: 177.32, text: '偌大的房 寂寞的床', band: false, size: 40, y: 972 },
    { t0: 212.82, t1: 219.33, text: '我好想你 好想你', band: false, size: 140, y: 356, hit: 1, ghost: 2, color: '#FFD166' },
  ] : [],
  nar: WITH_TEXT ? [
    { t0: 33.6, t1: 37.8, style: 'sys', text: '▶ 调查：门口 · 已读档 4 次' },
  ] : [],
  kao: [],
};
