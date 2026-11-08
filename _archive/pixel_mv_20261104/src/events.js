// ============================================================
//  events.js — 像素事件库 v1（40 个可复用"每拍一件事"的动作片段）
//  设计：每个事件是一个纯函数 event(ctx, t, o)，
//        t = 事件本地时间（0..dur），o = { 场景、坐标、角色、强度 }
//        事件内部自己算缓动/相位，不依赖外部状态。
//
//  四大类（源自分镜规则"镜/身/表/景"四类轮换）：
//    body  动作/身（角色姿态与位移）
//    face  表情/表（五官与情绪符号）
//    prop  道具/墨（道具出现、移动、交互）
//    cam   镜头/镜（机位运动、转场，作用在 scene 层）
// ============================================================

// 缓动工具（与核心一致）
const clamp01 = v => Math.max(0, Math.min(1, v));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = k => 1 - Math.pow(1 - clamp01(k), 3);
const easeIn = k => clamp01(k) * clamp01(k) * clamp01(k);
const easeIO = k => clamp01(k) < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * clamp01(k) + 2, 3) / 2;
const backOut = k => { const c1 = 1.70158, c3 = c1 + 1; const x = clamp01(k) - 1; return 1 + c3 * x * x * x + c1 * x * x; };
// 把本地时间 t 映射到 [a,b] 段的 0..1 进度
const seg = (t, a, b) => clamp01((t - a) / (b - a));
// 脉冲：t 落在 [a,b] 时给一个 0→1→0 的尖峰
const pulse = (t, a, b) => { const k = seg(t, a, b); return Math.sin(Math.PI * clamp01(k)); };

// 帧率相关：12fps 步进（onTwos），让动作有"顿"
const onTwos = t => Math.floor(t * 12) / 12;

// ---------- 事件定义 ----------
// 每个事件：{ cat, dur, run(ctx, t, o) }
//   o 通用字段：sx/sy 起始脚底坐标(设备px)、S 放大、sex、col 等，事件自己按需读取

const EVENTS = {};

// ============ 一、body 动作（12 个） ============

// 1. 走（原地或位移）
EVENTS.walk = {
  cat: 'body', dur: 2,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 2);
    const x = lerp(o.sx, o.ex ?? o.sx, easeIO(p));
    const sp = o.speed ?? 6;
    figure(c, x, o.sy + (Math.sin(p * Math.PI * 2) > 0 ? 0 : -1), o.S, {
      sex: o.sex, pose: 'walk', walk: t * sp, aL: .2, aR: .2, eyes: o.eyes || 'normal', mouth: o.mouth || 'flat',
    });
  },
};

// 2. 跑（更大幅度）
EVENTS.run = {
  cat: 'body', dur: 1.5,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 1.5);
    const x = lerp(o.sx, o.ex ?? o.sx, p);
    figure(c, x, o.sy + (Math.sin(p * Math.PI * 2.5) > 0 ? -2 : 0), o.S, {
      sex: o.sex, pose: 'walk', walk: t * (o.speed ?? 11), aL: 1.3, aR: 1.3, eyes: 'wide', mouth: 'open',
      lean: o.lean ?? 0,
    });
  },
};

// 3. 坐下
EVENTS.sit = {
  cat: 'body', dur: 1.2,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 1.2);
    const dy = -Math.round(easeIn(p) * 11);
    figure(c, o.sx, o.sy, o.S, { sex: o.sex, pose: p < .6 ? 'crouch' : 'sit', dy: p < .6 ? -4 : 0, eyes: o.eyes || 'normal', mouth: o.mouth || 'flat', aL: .4, aR: .4 });
  },
};

// 4. 蹲下（抱膝）
EVENTS.crouch = {
  cat: 'body', dur: 1,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 1);
    figure(c, o.sx, o.sy, o.S, { sex: o.sex, pose: 'crouch', eyes: o.eyes || 'narrow', mouth: o.mouth || 'frown', aL: 2, aR: 2 });
  },
};

// 5. 抬头（视线从地面移到天）
EVENTS.lookup = {
  cat: 'body', dur: 1.5,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 1.5);
    figure(c, o.sx, o.sy, o.S, { sex: o.sex, eyes: o.eyes || 'up', mouth: o.mouth || 'tiny', lookY: lerp(.8, -.6, easeOut(p)) });
  },
};

// 6. 低头（失落到垂首）
EVENTS.lookdown = {
  cat: 'body', dur: 1.2,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 1.2);
    figure(c, o.sx, o.sy, o.S, { sex: o.sex, eyes: o.eyes || 'closed', mouth: o.mouth || 'frown', lookY: lerp(0, .9, easeIn(p)), dy: -Math.round(easeIn(p) * 1) });
  },
};

// 7. 转身（背对→正对，用 view 切换）
EVENTS.turn = {
  cat: 'body', dur: 1,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 1);
    const view = p < .5 ? (o.from || 'back') : (o.to || 'front');
    figure(c, o.sx, o.sy, o.S, { sex: o.sex, view, eyes: 'normal', mouth: 'flat' });
  },
};

// 8. 挥手（告别/招呼）
EVENTS.wave = {
  cat: 'body', dur: 1.5,
  run(c, t, o) {
    const ph = Math.sin(t * 8) * .5 + .5;
    figure(c, o.sx, o.sy, o.S, { sex: o.sex, aR: 2, eyes: o.eyes || 'happy', mouth: o.mouth || 'smile', dy: -Math.round(ph) });
  },
};

// 9. 拥抱（两人）
EVENTS.hug = {
  cat: 'body', dur: 1.5,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 1.5);
    const m = o.mx ?? 200, gap = lerp(30, 10, easeOut(p));
    const y = o.sy;
    figure(c, m - gap / 2, y, o.S, { sex: 'm', eyes: 'closed', mouth: 'smile', aL: 1.6, aR: 1.6, lean: -2 });
    figure(c, m + gap / 2, y, o.S, { sex: 'f', eyes: 'cry', mouth: 'smile', tear: p > .5 ? .6 : 0, aL: 1.6, aR: 1.6, lean: 2 });
  },
};

// 10. 擦泪
EVENTS.wipe = {
  cat: 'body', dur: 1.5,
  run(c, t, o) {
    const ph = Math.sin(t * 5);
    figure(c, o.sx, o.sy, o.S, { sex: o.sex, eyes: o.eyes || 'cry', mouth: 'wobble', tear: .7, aR: 1.3 + ph * .3, aL: .3, lookX: -.4 });
  },
};

// 11. 挥手再见（背影 + 手举高）
EVENTS.farewell = {
  cat: 'body', dur: 1.8,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 1.8);
    const x = lerp(o.sx, o.sx - (o.dist ?? 30), easeIO(p));
    figure(c, x, o.sy, o.S, { sex: o.sex, view: 'back', aR: 2, aL: 2 });
    if (o.emo) { /* 背景渐远 */ }
  },
};

// 12. 晕倒（倒地）
EVENTS.faint = {
  cat: 'body', dur: 1.2,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 1.2);
    // 倒下：角色"躺平"用 sit 姿势 + 旋转近似（像素不做真旋转，用 dy 压缩表现）
    const k = easeIn(p);
    figure(c, o.sx, o.sy - Math.round(k * 20), o.S, { sex: o.sex, pose: 'crouch', eyes: 'xeye', mouth: 'o', emote: p > .3 ? 'qmark' : null, emoteK: p });
  },
};

// ============ 二、face 表情（12 个） ============

const FACE_OPTS = {
  sad:   { eyes: 'narrow', mouth: 'frown', lookY: .4 },
  cry:   { eyes: 'cry', mouth: 'open', tear: 1 },
  tear:  { eyes: 'teary', mouth: 'wobble', tear: .5 },
  happy: { eyes: 'happy', mouth: 'smile' },
  laugh: { eyes: 'closed', mouth: 'smile' },
  shock: { eyes: 'wide', mouth: 'o' },
  angry: { eyes: 'glare', mouth: 'grit', emote: 'anger' },
  shy:   { eyes: 'up', mouth: 'tiny', blush: 1 },
  sleepy:{ eyes: 'asleep', mouth: 'tiny', emote: 'zzz' },
  bored: { eyes: 'dot', mouth: 'tiny' },
  lost:  { eyes: 'dot', mouth: 'wobble', emote: 'dots' },
  sweat: { eyes: 'narrow', mouth: 'side', emote: 'sweat' },
};
// 用统一表情表生成 12 个 face 事件（各自带一个 0.5s 的"预备→定格"）
for (const [name, opt] of Object.entries(FACE_OPTS)) {
  EVENTS['face_' + name] = {
    cat: 'face', dur: 1,
    run(c, t, o) {
      const pop = backOut(seg(t, 0, .35));
      const em = opt.emote ? { emote: opt.emote, emoteK: Math.max(0, pop) } : {};
      figure(c, o.sx, o.sy, o.S, { sex: o.sex, ...opt, ...em, dy: -Math.round((1 - pop) * 3) });
    },
  };
}

// ============ 三、prop 道具（10 个） ============

// 25. 雨（下）
EVENTS.rain = {
  cat: 'prop', dur: 3,
  run(c, t, o) {
    rainFx(c, t, o.n ?? 60, o.col || PAL.haze);
  },
};

// 26. 雪（下）
EVENTS.snow = {
  cat: 'prop', dur: 3,
  run(c, t, o) {
    snowFx(c, t, o.n ?? 50, o.col || PAL.pale);
  },
};

// 27. 一颗心飘出（从角色头顶升起）
EVENTS.heart = {
  cat: 'prop', dur: 1.5,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 1.5);
    const hx = o.sx, hy = o.sy - 46 - easeOut(p) * 30;
    const s = o.S;
    drawHeart(c, hx, hy, s, PAL.rose, .5 + .5 * Math.sin(t * 4));
  },
};

// 28. 泪滴滑落
EVENTS.teardrop = {
  cat: 'prop', dur: 1,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 1);
    const x = o.sx + (o.dx || 0), y = o.sy - 20 + p * 24;
    c.fillStyle = PAL.mint;
    c.fillRect(Math.round(x), Math.round(y), 1, 2);
  },
};

// 29. 信纸（落下一封信）
EVENTS.letter = {
  cat: 'prop', dur: 1.5,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 1.5);
    const x = o.sx, y = lerp(o.sy - 40, o.sy + 8, easeIn(p));
    const w = 18, h = 12;
    c.fillStyle = PAL.paper; c.fillRect(x - w / 2, y - h / 2, w, h);
    c.fillStyle = PAL.ink; c.fillRect(x - w / 2, y - h / 2, w, 1); c.fillRect(x - w / 2, y + h / 2, w, 1);
    c.fillStyle = PAL.rose; c.fillRect(x - 4, y - 2, 8, 4);
  },
};

// 30. 手机（亮屏出现）
EVENTS.phone = {
  cat: 'prop', dur: 1.5,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 1.5);
    const k = backOut(p);
    const sc = o.sc || 1;
    const w = Math.max(4, Math.round(14 * sc)), h = Math.max(6, Math.round(22 * sc));
    const x = o.sx, y = o.sy - 10 * sc;
    c.fillStyle = PAL.ink; c.fillRect(x - w / 2 - 1, y - h / 2 - 1, w + 2, h + 2);
    c.fillStyle = PAL.navy; c.fillRect(x - w / 2, y - h / 2, w, h);
    c.fillStyle = PAL.pale; c.fillRect(x - w / 2 + 1, y - h / 2 + 1, w - 2, h - 6 * sc);
    // 屏幕蓝光
    c.fillStyle = PAL.teal; c.fillRect(x - w / 2 + 2, y - h / 2 + 2, w - 4, h * .5);
    if (p > .6) { c.fillStyle = PAL.rose; c.fillRect(x - w / 2 + 2, y - 4 * sc, w - 4, 2); }
  },
};

// 31. 烟花（炸开）
EVENTS.firework = {
  cat: 'prop', dur: 1.2,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 1.2);
    const r = 10 + easeOut(p) * 30;
    const cx = o.sx, cy = o.sy - 60;
    c.fillStyle = o.col || PAL.gold;
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2;
      const rr = r * (.7 + .3 * Math.sin(i * 3));
      c.fillRect(Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr), 2, 2);
    }
    c.fillStyle = PAL.paper; c.fillRect(Math.round(cx - 1), Math.round(cy - 1), 2, 2);
  },
};

// 32. 纸飞机（飞过）
EVENTS.plane = {
  cat: 'prop', dur: 2,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 2);
    const x = lerp(-20, 340, easeIO(p));
    const y = 60 + Math.sin(p * Math.PI * 2) * 20;
    c.fillStyle = PAL.paper;
    c.fillRect(Math.round(x), Math.round(y), 5, 1);
    c.fillRect(Math.round(x + 2), Math.round(y - 1), 1, 1);
    c.fillRect(Math.round(x - 3), Math.round(y), 3, 1);
    c.fillRect(Math.round(x - 5), Math.round(y - 1), 2, 1);
  },
};

// 33. 一盏灯（点亮，唯一暖色——事件级）
EVENTS.lampon = {
  cat: 'prop', dur: 1,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 1);
    const k = p < .5 ? easeOut(p * 2) : 1;
    const x = o.sx, y = o.sy - 40;
    // 光晕
    for (let yy = y; yy < y + 40; yy++) {
      const w = 20 + (yy - y) * 1.5;
      dith(c, x - w / 2, yy, w, 1, PAL.ink, PAL.gold, k * .5 * (1 - (yy - y) / 40));
    }
    c.fillStyle = PAL.gold; c.fillRect(x - 6, y - 4, 12, 4);
    c.fillStyle = PAL.navy; c.fillRect(x - 1, y, 2, 40);
  },
};

// 34. 一个影子掠过（远处）
EVENTS.shadow = {
  cat: 'prop', dur: 1.5,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || 1.5);
    const x = lerp(-10, 330, easeIO(p));
    c.fillStyle = PAL.ink;
    c.fillRect(Math.round(x), o.sy - 16, 16, 16);
    c.fillRect(Math.round(x + 2), o.sy, 12, 16);
  },
};

// ============ 四、cam 镜头（6 个） ============

// 35. 推近（zoom in，作用在场景绘制前的缩放因子）
EVENTS.zoomin = {
  cat: 'cam', dur: 1.5,
  run(c, t, o) { return { z: lerp(1, o.to ?? 1.5, easeIn(seg(t, 0, o.dur || 1.5))), cx: o.cx ?? 160, cy: o.cy ?? 90 }; },
};

// 36. 拉远（zoom out）
EVENTS.zoomout = {
  cat: 'cam', dur: 1.5,
  run(c, t, o) { return { z: lerp(o.from ?? 1.5, 1, easeOut(seg(t, 0, o.dur || 1.5))), cx: o.cx ?? 160, cy: o.cy ?? 90 }; },
};

// 37. 平移（pan）
EVENTS.pan = {
  cat: 'cam', dur: 2,
  run(c, t, o) { return { dx: lerp(o.from ?? 0, o.to ?? 40, easeIO(seg(t, 0, o.dur || 2))) }; },
};

// 38. 抖动（震一下，用于重拍）
EVENTS.shake = {
  cat: 'cam', dur: .5,
  run(c, t, o) {
    const p = seg(t, 0, o.dur || .5);
    const mag = (o.mag ?? 4) * (1 - p);
    return { dx: Math.round(Math.sin(t * 50) * mag), dy: Math.round(Math.cos(t * 40) * mag) };
  },
};

// 39. 闪白（转场）
EVENTS.flash = {
  cat: 'cam', dur: .3,
  run(c, t, o) {
    const k = pulse(t, 0, o.dur || .3);
    if (k > 0) { c.fillStyle = PAL.paper; c.globalAlpha = k * .8; c.fillRect(0, 0, 320, 180); c.globalAlpha = 1; }
    return {};
  },
};

// 40. 淡黑（淡入/淡出）
EVENTS.fade = {
  cat: 'cam', dur: 1,
  run(c, t, o) {
    const dir = o.dir || 'in';   // in = 从黑淡入，out = 淡出到黑
    const k = dir === 'in' ? 1 - easeOut(seg(t, 0, o.dur || 1)) : easeIn(seg(t, 0, o.dur || 1));
    if (k > 0) { c.fillStyle = PAL.ink; c.globalAlpha = k; c.fillRect(0, 0, 320, 180); c.globalAlpha = 1; }
    return {};
  },
};

// ---------- 道具辅助函数 ----------
function rainFx(c, t, n, col) {
  c.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const sp = 90 + (i % 5) * 26;
    const x = ((i * 53.7 + t * 12) % 340) - 10;
    const y = ((i * 71.3 + t * sp) % 200) - 10;
    c.fillRect(Math.round(x), Math.round(y), 1, 2 + (i % 3));
  }
}
function snowFx(c, t, n, col) {
  c.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const x = ((i * 47.1 + Math.sin(t * .8 + i) * 6) % 330) - 5;
    const y = ((i * 61.7 + t * 14) % 195) - 5;
    c.fillRect(Math.round(x), Math.round(y), i % 7 === 0 ? 2 : 1, 1);
  }
}
function drawHeart(c, cx, cy, s, col, k) {
  const w = 4 + Math.round(k * 4);
  c.fillStyle = col;
  // 两个像素心形的近似
  c.fillRect(cx - w, cy - 1, w, 1); c.fillRect(cx + 1, cy - 1, w, 1);
  c.fillRect(cx - w - 1, cy, w + 2, 3); c.fillRect(cx, cy, w + 1, 3);
  c.fillRect(cx - 1, cy + 3, 3, 2); c.fillRect(cx - 2, cy + 4, 5, 1);
}

// 导出
const EVENT_LIST = Object.keys(EVENTS);
