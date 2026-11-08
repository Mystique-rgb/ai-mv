// specs/current.js — 当前出片配置
// 曲目：把回忆拼好给你（片段 20.3s）  5 镜 × 5 句
// 改歌只改这个文件：shots（镜头）+ subs（字幕）+ cover 预设

window.SPEC = {
  fps: 24,
  duration: 20.3,
  fadeIn: 0.4,
  fadeOut: 0.6,

  shots: [
    // ---- 镜1 0–4.7 雨街：两人走过（"渺小"靠构图留白表达，不靠把人物缩小）----
    {
      t0: 0, t1: 4.7, scene: 'street',
      draw(pc, lt, shot, t) {
        SCENES.street.draw(pc, t);
        const p = lt / 4.7;
        const x = 108 + p * 52;
        figure(pc, x - 26, 158, 2, { sex: 'm', pose: 'walk', walk: t * 6, aL: .3, aR: .3, eyes: 'narrow', mouth: 'flat' });
        figure(pc, x + 30, 158, 2, { sex: 'f', pose: 'walk', walk: t * 6, aL: .3, aR: .3, eyes: 'normal', mouth: 'tiny', blush: .5 });
        SCENES.street.fg(pc, t);
      },
    },
    // ---- 镜2 4.7–8.6 空房：独坐，低头，泪 ----
    {
      t0: 4.7, t1: 8.6, scene: 'emptyroom',
      draw(pc, lt, shot, t) {
        SCENES.emptyroom.draw(pc, t);
        const k = Math.min(1, lt / 1.2);
        figure(pc, 168, 154, 2, {
          sex: 'f', pose: k < .5 ? 'crouch' : 'sit',
          eyes: 'closed', mouth: 'frown', lookY: .5, aL: .5, aR: .5,
        });
        // 一滴泪
        const tp = (lt % 2) / 2;
        if (lt > 1.5 && tp < .35) {
          pc.fillStyle = PAL.mint;
          pc.fillRect(164, 132 + tp * 60, 1, 2);
        }
      },
    },
    // ---- 镜3 8.6–12.4 走廊：他走过，尽头有光（"直到遇见你，光明起来"）----
    {
      t0: 8.6, t1: 12.4, scene: 'corridor',
      draw(pc, lt, shot, t) {
        SCENES.corridor.draw(pc, t);
        const p = lt / 3.8;
        // 从近处走向尽头（尺寸由大变小）
        const s = p < .55 ? 2 : 1;
        const y = p < .55 ? 158 : 152;
        figure(pc, 150 + p * 8, y, s, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5 });
        // 光晕随进度变强
        const glowK = Math.min(1, p * 1.4);
        pc.globalAlpha = .18 * glowK;
        pc.fillStyle = PAL.gold;
        pc.fillRect(130, 58, 60, 76);
        pc.globalAlpha = 1;
      },
    },
    // ---- 镜4 12.4–16.6 海边：两个人的海（她伸手，头上一颗心）----
    {
      t0: 12.4, t1: 16.6, scene: 'sea',
      draw(pc, lt, shot, t) {
        SCENES.sea.draw(pc, t);
        figure(pc, 138, 148, 2, { sex: 'm', eyes: 'up', mouth: 'smile', lookY: -.5, lookX: .5 });
        figure(pc, 192, 148, 2, {
          sex: 'f', eyes: 'happy', mouth: 'smile', blush: .8,
          emote: 'heart', emoteK: Math.min(1, lt / .8), emoteCol: PAL.rose,
        });
      },
    },
    // ---- 镜5 16.6–20.3 雪地：并肩走远 ----
    {
      t0: 16.6, t1: 20.3, scene: 'snow',
      draw(pc, lt, shot, t) {
        SCENES.snow.draw(pc, t);
        const p = Math.min(1, lt / 4.2);
        const x = 148 + p * 40;
        figure(pc, x - 24, 150, 2, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5 });
        figure(pc, x + 26, 150, 2, { sex: 'f', view: 'back', pose: 'walk', walk: t * 5 });
        SCENES.snow.fg(pc, t);
      },
    },
  ],

  subs: [
    { t0: 0.85, t1: 4.70, text: '我们都是渺小真实存在', kw: ['渺小'] },
    { t0: 4.80, t1: 8.54, text: '祈愿小世界里不只有挫败', kw: ['挫败'] },
    { t0: 8.64, t1: 12.30, text: '直到遇见你 我以为就光明起来', kw: ['光明'] },
    { t0: 12.40, t1: 16.54, text: '眼睛里看到的都是 广袤无垠的大海', kw: ['大海'] },
    { t0: 16.64, t1: 20.30, text: '有你在的日子里不可能被取代', kw: ['取代'] },
  ],

  cover: 'A',
};
