// specs/main.js — 《可不可以》像素 MV v2 全片时间轴
// v2 铁律：间奏 6 镜每镜 ≤5.2s；副歌景别跳档；禁同机位连排；开场 0.3s 黑场炸雷
'use strict';
const D = 240.89;
const FPS = 24;

function mk(t0, t1, fn, o) {
  o = o || {};
  return {
    t0, t1,
    cam: o.cam === undefined ? CAM.push(240, 140, 1.02, 1.07, t1 - t0) : o.cam,
    in: o.in, hit: o.hit, hitMag: o.hitMag, tint: o.tint, tintA: o.tintA,
    cast: o.cast, castA: o.castA, vig: o.vig,
    draw: fn
  };
}
const push = (x, y, z0, z1, dur, drift) => CAM.push(x, y, z0, z1, dur, drift);

window.SPEC = {
  fps: FPS, duration: D, subShade: .38, gradeA: .05, gradeCol: '#2E2A48', fadeIn: .3, fadeOut: 1.4,
  subs: window.SUBS,
  cards: [
    { t0: 234.3, t1: 238.4, text: '趁你还愿意', sub: '—— 全片终 ——', y: 40, sc: 6, col: '#2A2440', subCol: '#7A6A5A' },
  ],
  shots: [
    // ============ 前奏：黑场炸雷 → 急推船内 → 瞳孔闪回 6 格 → 纸船翻覆 ============
    mk(0, 1.5, (c, t) => SC.storm(c, t, { mode: 'wide' }), {
      cam: CAM.shake(() => [0, 0, 480, 270], 12, 22, 1), vig: .6, in: { type: 'dip', dur: .3, col: '#000' }
    }),
    mk(1.5, 4.0, (c, t) => {
      SC.storm(c, t, { mode: 'wide' });
      FX.radial(c, t, 240, 130, 30);
    }, {
      cam: lt => rectOf(lerp(1.0, 2.6, easeIn(clamp(lt / 2.5, 0, 1))), 240, 120),
      in: { type: 'flash', dur: .14, amt: .95 }, hit: 1.55, hitMag: 16
    }),
    mk(4.0, 4.6, (c, t) => SC.cabin(c, t, {}), { cam: CAM.fixed(226, 0, 300, 240), in: { type: 'glitch', dur: .22 } }),
    // 瞳孔闪回 6 格（每格 0.8s 左右，硬切 + 震）
    mk(4.6, 5.4, (c, t) => SC.vig(c, t, { v: 0 }), { cam: CAM.fixed(0, 0, 480, 270), in: { type: 'flash', dur: .1, amt: .5 } }),
    mk(5.4, 6.2, (c, t) => SC.vig(c, t, { v: 1 }), { cam: push(330, 170, 1.15, 1.3, .8), in: { type: 'flash', dur: .1, amt: .45 } }),
    mk(6.2, 7.0, (c, t) => SC.vig(c, t, { v: 2 }), { cam: CAM.fixed(0, 0, 480, 270), in: { type: 'flash', dur: .1, amt: .45 } }),
    mk(7.0, 7.8, (c, t) => SC.vig(c, t, { v: 3 }), { cam: push(200, 170, 1.1, 1.25, .8), in: { type: 'flash', dur: .1, amt: .45 } }),
    mk(7.8, 8.6, (c, t) => SC.vig(c, t, { v: 4 }), { cam: CAM.fixed(0, 0, 480, 270), in: { type: 'flash', dur: .1, amt: .45 } }),
    mk(8.6, 9.4, (c, t) => SC.vig(c, t, { v: 5 }), { cam: push(300, 160, 1.15, 1.35, .8), in: { type: 'flash', dur: .1, amt: .45 } }),
    // 纸船翻覆（慢动作环绕 + 字碎裂）
    mk(9.4, 16.27, (c, t) => SC.storm(c, t, { mode: 'capsize' }), {
      cam: lt => { const k = easeOut(clamp(lt / 5.5, 0, 1)); return rectOf(1.02 + k * .26, 240 + k * 14, 150 + k * 8); },
      in: { type: 'flash', dur: .2, amt: .9 }, hit: 9.9, hitMag: 14
    }),

    // ============ 主歌一（冷蓝，每镜一个动作） ============
    mk(16.27, 19.95, (c, t) => SC.alley(c, t, { mode: 'leave' }), {
      cam: push(232, 150, 1.0, 1.16, 3.6), in: { type: 'dither', dur: .35 }, hit: 16.3, hitMag: 8
    }),
    mk(19.95, 23.47, (c, t) => SC.alley(c, t, { mode: 'tug' }), {
      cam: CAM.pan(200, 268, 156, 1.22, 3.4), in: { type: 'whip', dur: .3, dir: -1 },
      cast: '#FFB060', castA: .14
    }),
    mk(23.47, 30.53, (c, t) => SC.seawall(c, t, {}), {
      cam: lt => { const k = easeOut(clamp(lt / 4, 0, 1)); return rectOf(1.04, 240, 132 + k * 52); },
      in: { type: 'dither', dur: .5 }
    }),
    mk(30.53, 34.13, (c, t) => SC.room(c, t, {}), {
      cam: push(300, 152, 1.02, 1.34, 3.4), in: { type: 'dip', dur: .4 }
    }),
    mk(34.13, 37.73, (c, t) => SC.cross(c, t, {}), {
      cam: lt => rectOf(1.25, 214 + lt * 22, 158), in: { type: 'flash', dur: .3, amt: .5, col: '#5AD98A' }, hit: 34.2, hitMag: 9
    }),
    mk(37.73, 43.75, (c, t) => SC.alley(c, t, { mode: 'empty' }), {
      cam: lt => { const k = easeOut(clamp(lt / 4.5, 0, 1)); return rectOf(1.18, 236, 156 + k * 34); },
      in: { type: 'dip', dur: .4 }
    }),

    // ============ 主歌二（暖橙快切，生活动作） ============
    mk(43.75, 45.83, (c, t) => SC.canteen(c, t, {}), { cam: push(250, 168, 1.06, 1.18, 2.1), in: { type: 'flash', dur: .22, amt: .6 } }),
    mk(45.83, 47.27, (c, t) => SC.canteen(c, t, {}), { cam: CAM.fixed(160, 120, 250, 150), in: { type: 'cut', dur: .01 } }),
    mk(47.27, 48.97, (c, t) => SC.market(c, t, {}), { cam: push(240, 152, 1.2, 1.32, 1.7), in: { type: 'whip', dur: .26, dir: 1 } }),
    mk(48.97, 50.06, (c, t) => SC.market(c, t, {}), { cam: CAM.fixed(150, 128, 180, 168), in: { type: 'cut', dur: .01 } }),
    mk(50.06, 53.03, (c, t) => SC.gift(c, t, {}), { cam: push(250, 210, 1.28, 1.4, 2.9), in: { type: 'dither', dur: .3 } }),
    mk(53.03, 54.41, (c, t) => SC.gift(c, t, {}), { cam: CAM.fixed(160, 96, 220, 168), in: { type: 'flash', dur: .18, amt: .4 } }),

    // ============ 预副歌（4 格蒙太奇 + 情绪爬坡） ============
    mk(54.41, 55.77, (c, t) => SC.surprise(c, t, { k: 0 }), { cam: push(250, 140, 1.1, 1.22, 1.3), in: { type: 'whip', dur: .24, dir: -1 } }),
    mk(55.77, 56.72, (c, t) => SC.surprise(c, t, { k: 1 }), { cam: CAM.fixed(0, 0, 480, 270), in: { type: 'flash', dur: .14, amt: .5 } }),
    mk(56.72, 57.6, (c, t) => SC.surprise(c, t, { k: 2 }), { cam: push(240, 160, 1.1, 1.24, .9), in: { type: 'flash', dur: .14, amt: .5 } }),
    mk(57.6, 59.49, (c, t) => SC.surprise(c, t, { k: 3 }), { cam: push(240, 150, 1.05, 1.22, 1.9), in: { type: 'flash', dur: .14, amt: .5 } }),
    mk(59.49, 61.61, (c, t) => SC.stands(c, t, { mode: 'cry' }), { cam: push(240, 150, 1.3, 1.52, 2.1), in: { type: 'dither', dur: .35 } }),
    mk(61.61, 66.05, (c, t) => SC.stands(c, t, { mode: 'look' }), { cam: lt => rectOf(lerp(1.52, 1.14, easeOut(clamp(lt / 4.4, 0, 1))), 240, 140), in: { type: 'flash', dur: .3, amt: .35 } }),
    mk(66.05, 71.45, (c, t) => {
      SC.citypull(c, t, {});
      FX.shockwave(c, t, 4.4, 240, 200, '#FFD166');
      FX.firework(c, t + 1, 1, 120, 70, '#FF6EC7');
      FX.firework(c, t + 2.2, 2, 350, 60, '#39D9E8');
    }, {
      cam: lt => { const k = easeOut(clamp(lt / 5, 0, 1)); return rectOf(lerp(2.1, 1.0, k), 240, lerp(232, 150, k)); },
      in: { type: 'dip', dur: .4 }, cast: '#FFD166', castA: .1
    }),

    // ============ 副歌一（景别跳档：EWS→track→MS→WS→track→ECU→CU→CU） ============
    mk(71.45, 74.56, (c, t) => {
      SC.cloudboat(c, t, { mode: 'wide' });
      FX.shockwave(c, t, .1, 240, 190, '#FFD166');
    }, {
      cam: lt => { const k = easeOut(clamp(lt / 3, 0, 1)); return rectOf(lerp(1.32, 1.0, k), 240, lerp(210, 150, k)); },
      in: { type: 'flash', dur: .34, amt: .95 }, hit: 71.5, hitMag: 14
    }),
    mk(74.56, 77.52, (c, t) => SC.cloudboat(c, t, { mode: 'windows' }), { cam: CAM.pan(150, 330, 165, 1.12, 3), in: { type: 'flash', dur: .2, amt: .5 } }),
    mk(77.52, 82.07, (c, t) => {
      SC.cloudboat(c, t, { mode: 'bow' });
      FX.confetti(c, t + 2, 16);
    }, { cam: CAM.pan(300, 168, 150, 1.34, 4.5), in: { type: 'dither', dur: .4 } }),
    mk(82.07, 85.73, (c, t) => SC.firstmeet(c, t, {}), {
      cam: push(244, 146, 1.02, 1.3, 3.6), in: { type: 'flash', dur: .26, amt: .7 }
    }),
    mk(85.73, 89.25, (c, t) => SC.cloudboat(c, t, { mode: 'future' }), { cam: CAM.pan(330, 150, 165, 1.15, 3.5), in: { type: 'flash', dur: .24, amt: .6 } }),
    mk(89.25, 92.77, (c, t) => {
      SC.hands(c, t, {});
      FX.twinkles(c, t, 8, 80, 200, '#FFE9B8');
    }, {
      cam: lt => { const k = easeOut(clamp(lt / 3.4, 0, 1)); return rectOf(1.32, 240, lerp(196, 150, k)); },
      in: { type: 'dither', dur: .35 }
    }),
    mk(92.77, 96.37, (c, t) => SC.calendar(c, t, {}), { cam: push(240, 140, 1.5, 1.68, 3.5), in: { type: 'flash', dur: .2, amt: .5 } }),
    mk(96.37, 100.27, (c, t) => {
      SC.nod(c, t, {});
      FX.bubble(c, 320, 120, 'heart', t);
    }, { cam: push(240, 150, 1.02, 1.14, 3.9), in: { type: 'flash', dur: .3, amt: .75 } }),

    // ============ 间奏（30s 拆 6 镜，每镜 ≤5.2s，景别轮换） ============
    mk(100.27, 105.2, (c, t) => SC.stormLone(c, t, {}), {
      cam: lt => rectOf(1.04 + .14 * easeOut(clamp(lt / 4.9, 0, 1)), 240, 160), in: { type: 'dip', dur: .7 }, vig: .66, hit: 100.4, hitMag: 10
    }),
    mk(105.2, 110.2, (c, t) => SC.lonelyFace(c, t, {}), {
      cam: lt => rectOf(lerp(1.1, 1.3, easeOut(clamp(lt / 5, 0, 1))), 240, 120), in: { type: 'whip', dur: .22, dir: 1 }
    }),
    mk(110.2, 115.4, (c, t) => SC.sinking(c, t, {}), {
      cam: push(240, 150, 1.1, 1.34, 5.2), in: { type: 'flash', dur: .2, amt: .4, col: '#8FD8F0' }, hit: 110.6, hitMag: 9
    }),
    mk(115.4, 120.4, (c, t) => SC.grabPaper(c, t, {}), {
      cam: CAM.fixed(0, 0, 480, 270), in: { type: 'cut', dur: .01 }
    }),
    mk(120.4, 125.4, (c, t) => SC.floating(c, t, {}), {
      cam: lt => { const k = easeOut(clamp(lt / 5, 0, 1)); return rectOf(1.06 + k * .18, 240, 150 - k * 12); },
      in: { type: 'dither', dur: .5 }
    }),
    mk(125.4, 130.09, (c, t) => SC.eyeRain(c, t, {}), {
      cam: push(240, 132, 1.04, 1.16, 4.7), in: { type: 'dip', dur: .5, col: '#0A0910' }
    }),

    // ============ 桥段（黑白 → 上色） ============
    mk(130.09, 137.25, (c, t) => SC.photos(c, t, {}), {
      cam: push(240, 170, 1.15, 1.3, 7), in: { type: 'ink', dur: .9 }, hit: 130.2, hitMag: 9
    }),
    mk(137.25, 144.33, (c, t) => SC.pickup(c, t, {}), { cam: push(240, 150, 1.35, 1.52, 7), in: { type: 'dither', dur: .5 } }),
    mk(144.33, 151.47, (c, t) => SC.colorize(c, t, {}), {
      cam: push(240, 150, 1.02, 1.22, 7.1), in: { type: 'flash', dur: .5, amt: .6, col: '#F58BA6' }
    }),
    mk(151.47, 156.81, (c, t) => {
      SC.fold(c, t, {});
      FX.shockwave(c, t, 2.9, 300, 196, '#FFD166');
    }, { cam: push(280, 160, 1.3, 1.52, 5.3), in: { type: 'dither', dur: .4 } }),

    // ============ 副歌二（现实追爱，动作戏） ============
    mk(156.81, 160.09, (c, t) => SC.subway(c, t, {}), {
      cam: CAM.shake(() => rectOf(1.2, 200, 158), 7, 12, 3), in: { type: 'flash', dur: .28, amt: .85 }, hit: 156.9, hitMag: 11
    }),
    mk(160.09, 163.89, (c, t) => SC.glass(c, t, {}), { cam: push(220, 160, 1.3, 1.44, 3.8), in: { type: 'dither', dur: .35 } }),
    mk(163.89, 167.41, (c, t) => SC.rainrun(c, t, {}), {
      cam: lt => rectOf(1.05 + .12 * easeOut(clamp(lt / 3.5, 0, 1)), 240, 146), in: { type: 'flash', dur: .3, amt: .6 }
    }),
    mk(167.41, 170.03, (c, t) => SC.stonebridge(c, t, {}), { cam: CAM.pan(160, 300, 150, 1.15, 2.6), in: { type: 'whip', dur: .3, dir: 1 } }),
    mk(170.03, 174.57, (c, t) => SC.turn(c, t, {}), { cam: push(240, 140, 1.35, 1.58, 4.5), in: { type: 'flash', dur: .22, amt: .55 } }),
    mk(174.57, 178.12, (c, t) => SC.offer(c, t, {}), { cam: push(240, 155, 1.42, 1.6, 3.5), in: { type: 'dither', dur: .35 } }),
    mk(178.12, 180.56, (c, t) => SC.giftBoat(c, t, {}), {
      cam: push(240, 172, 1.06, 1.18, 2.4), in: { type: 'flash', dur: .2, amt: .5 }, hit: 178.2, hitMag: 7
    }),
    mk(180.56, 185.25, (c, t) => {
      SC.hug(c, t, {});
      FX.shockwave(c, t, .4, 240, 170, '#FF9EC0');
    }, { cam: push(240, 152, 1.35, 1.52, 4.7), in: { type: 'dither', dur: .4 } }),

    // ============ 副歌三（全片最炸） ============
    mk(185.25, 188.88, (c, t) => {
      SC.memcity(c, t, {});
      FX.shockwave(c, t, .1, 240, 160, '#FFD166');
      FX.firework(c, t + 1.2, 3, 110, 80, '#FFD166');
      FX.firework(c, t + 2.4, 4, 360, 70, '#FF6EC7');
    }, {
      cam: lt => CAM.shake(() => rectOf(1.02 + .14 * easeOut(clamp(lt / 3.6, 0, 1)), 240, 150), 6, 14, 8)(lt),
      in: { type: 'flash', dur: .4, amt: .95 }, hit: 185.35, hitMag: 15
    }),
    mk(188.88, 192.35, (c, t) => {
      SC.npc(c, t, {});
      FX.confetti(c, t, 22);
    }, { cam: CAM.pan(200, 300, 160, 1.14, 3.4), in: { type: 'dither', dur: .3 } }),
    mk(192.35, 195.87, (c, t) => {
      SC.boatsky(c, t, {});
      FX.boatFleet(c, t, 10, 220);
    }, {
      cam: lt => { const k = easeOut(clamp(lt / 3.5, 0, 1)); return rectOf(1.05, 240, lerp(170, 118, k)); },
      in: { type: 'flash', dur: .25, amt: .6 }
    }),
    mk(195.87, 199.47, (c, t) => {
      SC.kiss(c, t, {});
      FX.bubble(c, 300, 110, 'heart', t);
    }, { cam: push(250, 140, 1.35, 1.52, 3.6), in: { type: 'dither', dur: .4 } }),
    mk(199.47, 202.77, (c, t) => SC.seabig(c, t, {}), {
      cam: lt => rectOf(lerp(1.2, 1.0, easeOut(clamp(lt / 3.3, 0, 1))), 240, 150), in: { type: 'flash', dur: .3, amt: .5 }
    }),
    mk(202.77, 206.57, (c, t) => SC.wordChange(c, t, {}), {
      cam: CAM.pan(170, 320, 165, 1.22, 3.8), in: { type: 'dither', dur: .35 }, hit: 202.9, hitMag: 8
    }),
    mk(206.57, 210.11, (c, t) => SC.sunset(c, t, {}), { cam: push(230, 150, 1.0, 1.08, 3.5), in: { type: 'flash', dur: .3, amt: .4, col: '#FFB45E' } }),
    mk(210.11, 213.69, (c, t) => SC.shoulder(c, t, {}), { cam: push(232, 186, 1.62, 1.76, 3.5), in: { type: 'dither', dur: .35 } }),

    // ============ 尾声（安静收束，两只纸船并排靠岸） ============
    mk(213.69, 220.97, (c, t) => SC.beach(c, t, {}), {
      cam: push(240, 148, 1.0, 1.12, 7.2), in: { type: 'dip', dur: .8, col: '#FFFDF4' }, vig: .38
    }),
    mk(220.97, 233.6, (c, t) => {
      SC.boatsTwo(c, t, {});
      FX.twinkles(c, t, 6, 60, 160, '#FFF6E2');
    }, { cam: push(280, 180, 1.18, 1.32, 12.5), in: { type: 'dip', dur: .6 } }),
    mk(233.6, D, (c, t) => SC.titleEnd(c, t, {}), {
      cam: CAM.fixed(0, 0, 480, 270), in: { type: 'dip', dur: .8, col: '#FFFDF4' }, vig: 0
    }),
  ],
};
