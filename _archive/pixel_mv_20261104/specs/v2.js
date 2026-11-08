// specs/v2.js —《我好想你（苏打绿版）》像素 RPG 故事版 · 全曲 329.2s · 48 镜
// 分镜词：D:/ai音乐mv/我好想你/分镜词-我好想你-像素RPG版-v2-故事版.md
// 相对 v1 的四件事：运镜（每镜有方向）/ 转场（47 个接点）/ 叙事文字（12 条）/ 颜文字 + 道具阶段
window.SPEC = {
  fps: 24,
  duration: 329.2,
  fadeIn: .7,
  fadeOut: 1.0,
  cover: 'A',

  shots: [
  // ========================= 一 · 重复 0–38.4 =========================
  // S01 开机：光点闪两下 → 片名 → 章节卡
  { t0: 0, t1: 6.0, scene: 'black', cam: false,
    led: { title: '我好想你', sub: '第 37 天 · 他还没学会不回头' },
    draw(pc) { R(pc, 0, 0, 320, 180, PAL.ink); } },

  // S02 雨街：两人并肩走向路灯（TRUCK 跟拍）
  { t0: 6.0, t1: 15.0, scene: 'street', tint: '#FFD166', tintA: 0.05,
    in: T('iris', .5),
    cam: CAM(9, { z0: 1.16, z1: 1.04, cx0: 62, px: [90, 150], cy0: 100, ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      const p = seg(lt, .3, 8.2), x = lerp(30, 168, easeIO(p));
      figure(pc, x - 16, 158, 2, { sex: 'm', pose: 'walk', walk: t * 6, eyes: 'normal', mouth: 'flat' });
      figure(pc, x + 16, 158, 2, { sex: 'f', pose: 'walk', walk: t * 6 + 1, eyes: 'normal', mouth: 'tiny',
        emote: lt > 6.4 ? 'heart' : null, emoteK: seg(lt, 6.4, 7.6), emoteCol: PAL.rose, emoteUp: 4 });
      SCENES.street.fg(pc, t);
    } },

  // S03 灯下告别：她走远，他没动（手持 0.5px，越不动越重）
  { t0: 15.0, t1: 24.0, scene: 'street',
    in: T('blk', .12),
    cam: CAM(9, { z0: 1.14, z1: 1.20, cx0: 196, cy0: 102, hand: .5 }),
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      const p = seg(lt, 2.0, 8.4);
      if (p > 0) figure(pc, lerp(214, 322, easeIO(p)), 158, 2, { sex: 'f', view: 'back', pose: 'walk', walk: t * 5.5 });
      else figure(pc, 214, 158, 2, { sex: 'f', eyes: 'up', mouth: 'tiny', lookY: -.4 });
      figure(pc, 178, 158, 2, { sex: 'm', eyes: lt > 5 ? 'teary' : 'normal', mouth: 'flat',
        tear: lt > 5 ? .5 : 0, lookX: p > 0 ? .8 : 0 });
      if (lt > 7.4) { const tp = seg(lt, 7.4, 8.6); pc.fillStyle = PAL.mint; pc.fillRect(177, 140 + tp * 16, 1, 2); }
      SCENES.street.fg(pc, t);
    } },

  // S04 楼梯间：独自上楼（TRUCK 沿阶梯上行）
  { t0: 24.0, t1: 32.0, scene: 'stairs',
    in: T('blk', .10),
    cam: CAM(8, { z0: 1.22, z1: 1.10, cx0: 150, cy0: 110, px: [150, 186], py: [116, 92], ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.stairs.draw(pc, t);
      const p = seg(lt, .4, 7.8), k = p * 6.4, i = Math.floor(k), fr = k - i;
      const x = 110 + (i + fr) * 14, y = 160 - (i + fr) * 12;
      figure(pc, x, y, 2, { sex: 'm', pose: 'walk', walk: t * 5.5,
        eyes: p < .3 ? 'normal' : 'narrow', mouth: 'flat', lookY: p < .3 ? 0 : .5 });
      if (lt > 5.6) EVENTS.shadow.run(pc, lt - 5.6, { sy: 168 });
    } },

  // S05 空房：进门 → 抬手（PUSH 逼近书桌）
  { t0: 32.0, t1: 38.4, scene: 'emptyroom',
    in: T('cut', 0),
    cam: CAM(6.4, { z0: 1.02, z1: 1.22, cx0: 160, cy0: 108, ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.emptyroom.draw(pc, t);
      const p = seg(lt, .3, 3.2), x = lerp(64, 150, easeIO(p));
      figure(pc, x, 154, 2, { sex: 'm', pose: p >= 1 ? 'stand' : 'walk', walk: t * 5.5,
        eyes: 'dot', mouth: 'flat', aR: seg(lt, 4.4, 5.4) * 2, lookX: .5 });
      const fl = seg(lt, 5.9, 6.4);
      if (fl > 0) { pc.fillStyle = PAL.paper; pc.globalAlpha = fl * .9; pc.fillRect(0, 0, 320, 180); pc.globalAlpha = 1; }
    } },

  // ========================= 二 · 读档 · 主歌 1 38.4–86.5 =========================
  // S06 「开了灯 眼前的模样」灯亮后 PULL 抽开，显出空
  { t0: 38.4, t1: 43.0, scene: 'room', stage: 1,
    in: T('flash', .15, 1, .9),
    leak: 0,
    cam: CAM(4.6, { z0: 1.22, z1: 1.04, cx0: 196, cy0: 104, ease: 'out' }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      figure(pc, 138, 150, 2, { sex: 'm', eyes: lt < 1.6 ? 'wide' : 'lost', mouth: 'flat', lookY: lt < 1.6 ? -.4 : .3 });
    } },

  // S07 「偌大的房 寂寞的床」先看空床，再摇到他
  { t0: 43.0, t1: 50.99, scene: 'room', stage: 1,
    in: T('cut', 0),
    cam: CAM(7.99, { z0: 1.36, z1: 1.30, px: [58, 148], cy0: 112, ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      const p = seg(lt, .2, 2.6), x = lerp(150, 78, easeIO(p));
      if (p < 1) figure(pc, x, 150, 2, { sex: 'm', pose: 'walk', walk: t * 5.5, eyes: 'narrow', mouth: 'flat' });
      else figure(pc, 74, 144, 2, { sex: 'm', pose: 'sit', eyes: 'narrow', mouth: 'frown', lookY: .5, aL: .4, aR: .4 });
    } },

  // S08 「关了灯 全都一个样」灯灭，世界断了一下
  { t0: 50.99, t1: 55.37, scene: 'room', stage: 1,
    in: T('blk', .10, 1, .9),
    cam: CAM(4.38, { z0: 1.24, z1: 1.30, cx0: 116, cy0: 108, hand: .8 }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      killLamp(pc);
      shadeAround(pc, .52);
      figure(pc, 160, 150, 2, { sex: 'm', eyes: 'closed', mouth: 'flat', dy: 1 });
      if (lt < .18) { pc.fillStyle = PAL.gold; pc.globalAlpha = .5 * (1 - lt / .18); pc.fillRect(108, 104, 44, 34); pc.globalAlpha = 1; }
    } },

  // S09 「心里的伤 无法分享」窗下蹲着，慢慢逼近
  { t0: 55.37, zs: 1, t1: 61.56, scene: 'room', stage: 1,
    in: T('dither', .30),
    cam: CAM(6.2, { z0: 1.24, z1: 1.36, cx0: 238, cy0: 116, ease: 'io' }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      killLamp(pc); shadeAround(pc, .40);
      pc.save(); pc.beginPath(); pc.rect(176, 26, 108, 82); pc.clip();
      rainFx(pc, lt, 26, PAL.haze); pc.restore();
      figure(pc, 244, 158, 2, { sex: 'm', pose: 'crouch', eyes: 'narrow', mouth: 'frown', lookY: .3, aL: 2, aR: 2 });
    } },

  // S10 「生命 随年月流去」先看窗外流年，再落回他
  { t0: 61.56, t1: 69.10, scene: 'room', stage: 1,
    in: T('cut', 0),
    cam: CAM(7.54, { z0: 1.20, z1: 1.10, py: [70, 118], px: [222, 120], ease: 'io' }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      killLamp(pc); shadeAround(pc, .32);
      pc.save(); pc.beginPath(); pc.rect(176, 26, 108, 82); pc.clip();
      winBlink(pc, lt); EVENTS.plane.run(pc, lt, { dur: 6.4 }); pc.restore();
      if (lt < 4) figure(pc, 226, 150, 2, { sex: 'm', eyes: 'dot', mouth: 'flat', lookX: -.4 });
      else figure(pc, 74, 144, 2, { sex: 'm', pose: 'sit', eyes: 'dot', mouth: 'flat', lookX: .6 });
    } },

  // S11 「随着你离去」回忆：追她的背影，她出画后镜头停住
  { t0: 69.10, t1: 75.81, scene: 'street', tint: '#FFD166', tintA: 0.14,
    in: T('fade', .45),
    leak: .1,
    cam: CAM(6.71, { z0: 1.18, z1: 1.06, px: [190, 250], cy0: 106, ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      const p = seg(lt, .6, 6.2);
      figure(pc, lerp(196, 306, easeIO(p)), 158, 2, { sex: 'f', view: 'back', pose: 'walk', walk: t * 5.5 });
      figure(pc, 92, 158, 2, { sex: 'm', eyes: 'teary', mouth: 'flat', tear: .5, lookX: .8 });
      SCENES.street.fg(pc, t);
    } },

  // S12 「随往事淡去 随梦境睡去」缓缓退开，像舍不得
  { t0: 75.81, zs: 1, t1: 81.74, scene: 'room', stage: 1,
    in: T('dither', .30),
    cam: CAM(5.93, { z0: 1.30, z1: 1.14, cx0: 92, cy0: 118, ease: 'out' }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      figure(pc, 66, 140, 2, { sex: 'm', pose: 'sit', eyes: 'asleep', mouth: 'tiny',
        emote: 'zzz', emoteK: seg(lt, 1, 2), emoteUp: 2, aL: .5, aR: .5, lookX: -.5 });
      shadeAround(pc, Math.min(.48, lt * .12));
    } },

  // S13 「随麻痹的心逐渐远去」大远景，窗里先梦见海
  { t0: 81.74, t1: 86.53, scene: 'room', stage: 1,
    in: T('cut', 0),
    cam: CAM(4.79, { z0: 1.04, z1: 1.00, cx0: 150, cy0: 100 }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      killLamp(pc);
      if (lt > 2.4) winSea(pc);
      shadeAround(pc, Math.min(.56, .3 + lt * .08));
      figure(pc, 70, 142, 1, { sex: 'm', pose: 'sit', eyes: 'asleep', mouth: 'tiny' });
      const fl = seg(lt, 4.2, 4.79);
      if (fl > 0) { pc.fillStyle = PAL.paper; pc.globalAlpha = fl * .9; pc.fillRect(0, 0, 320, 180); pc.globalAlpha = 1; }
    } },

  // ========================= 三 · 读档 · 副歌 1 86.53–130.97 =========================
  // S14 「我好想你」① 甩镜冲进海
  { t0: 86.53, t1: 93.01, scene: 'sea', tint: '#FFC35C', tintA: 0.10,
    in: T('whip', .12, 1),
    leak: .35,
    cam: CAM(6.48, { z0: 1.16, z1: 1.04, cx0: 138, cy0: 96, ease: 'out' }),
    draw(pc, lt, shot, t) {
      SCENES.sea.draw(pc, t);
      figure(pc, 116, 148, 2, { sex: 'm', view: 'back' });
      figure(pc, 158, 148, 2, { sex: 'f', view: 'back',
        emote: lt > 1.4 ? 'heart' : null, emoteK: seg(lt, 1.4, 2.6), emoteCol: PAL.rose });
    } },

  // S15 「却不露痕迹」对望，DUTCH 缓慢回正
  { t0: 93.01, t1: 99.57, scene: 'sea', tint: '#FFC35C', tintA: 0.10,
    in: T('cut', 0),
    cam: CAM(6.56, { z0: 1.18, z1: 1.10, cx0: 138, cy0: 100, hand: .4 }),
    draw(pc, lt, shot, t) {
      SCENES.sea.draw(pc, t);
      const turned = lt > 1.2;
      figure(pc, 116, 148, 2, { sex: 'm', view: turned ? 'front' : 'back',
        eyes: turned ? 'happy' : 'normal', mouth: turned ? 'smile' : 'flat' });
      figure(pc, 158, 148, 2, { sex: 'f', view: turned ? 'front' : 'back',
        eyes: turned ? 'shy' : 'normal', mouth: turned ? 'tiny' : 'flat', blush: turned ? .8 : 0 });
      vignette(pc, Math.min(.6, Math.max(0, (lt - 2.2)) * .2));
    } },

  // S16 「我还踮着脚思念」天台，跟随她踮脚
  { t0: 99.57, t1: 105.91, scene: 'rooftop', tint: '#FFD166', tintA: 0.12,
    in: T('dissolve', .38),
    cam: CAM(6.34, { z0: 1.20, z1: 1.12, px: [150, 176], cy0: 104, hand: .5 }),
    draw(pc, lt, shot, t) {
      SCENES.rooftop.draw(pc, t);
      const hop = -Math.abs(Math.sin(lt * 3.2)) * 3;
      figure(pc, 150, 152, 2, { sex: 'f', dy: hop, aR: 2, eyes: 'happy', mouth: 'smile', lookY: -.6 });
      figure(pc, 196, 152, 2, { sex: 'm', eyes: 'happy', mouth: 'smile', lookX: -.5 });
    } },

  // S17 「我还任记忆盘旋」走马灯 ×4，每换一次往里推一点
  { t0: 105.91, t1: 112.26, scene: 'montage', tint: '#FFD166', tintA: 0.12,
    in: T('whip', .10, 1),
    cam: CAM(6.35, { z0: 1.02, z1: 1.12, cx0: 160, cy0: 100, ease: 'in' }),
    draw(pc, lt) {
      const scenes = [['pool', 96], ['classroom', 152], ['train', 156], ['store', 158]];
      montage(pc, lt, 6.35, scenes, { glitch: true });
    } },

  // S18 「我还闭着眼流泪」哭的时候镜头也抖
  { t0: 112.26, zs: 1, t1: 118.45, scene: 'emptyroom',
    in: T('glitch', .16),
    cam: CAM(6.19, { z0: 1.26, z1: 1.34, cx0: 240, cy0: 118, hand: 1.5 }),
    draw(pc, lt) {
      SCENES.emptyroom.draw(pc, lt);
      figure(pc, 240, 154, 2, { sex: 'm', pose: 'crouch', eyes: 'cry', mouth: 'open', tear: 1, aL: 2, aR: 2 });
      const tp = lt % 1.2;
      if (lt > 1 && tp < .45) { pc.fillStyle = PAL.mint; pc.fillRect(236, 136 + tp * 40, 1, 2); }
      vignette(pc, .52);
    } },

  // S19 「我还装作无所谓」手机亮屏，头顶慢慢浮起一颗心
  { t0: 118.45, zs: 1, t1: 124.36, scene: 'room', stage: 1,
    in: T('dither', .30),
    cam: CAM(5.91, { z0: 1.14, z1: 1.26, cx0: 132, cy0: 124, ease: 'io' }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      EVENTS.phone.run(pc, seg(lt, .2, 1.7) * 1.5, { sx: 112, sy: 140, sc: .62 });
      figure(pc, 92, 150, 2, { sex: 'm', eyes: 'dot', mouth: 'side', lookX: .7,
        emote: lt > 3 ? 'heart' : null, emoteK: seg(lt, 3, 4.6), emoteCol: PAL.rose, emoteUp: 6 });
    } },

  // S20 「我好想你」② 走廊尽头，他没走过去
  { t0: 124.36, t1: 130.97, scene: 'corridor', tint: '#FFD166', tintA: 0.10,
    in: T('cut', 0),
    cam: CAM(6.61, { z0: 1.16, z1: 1.10, cx0: 176, cy0: 104, hand: .35 }),
    draw(pc, lt, shot, t) {
      SCENES.corridor.draw(pc, t);
      const p = seg(lt, .4, 2.8), x = lerp(212, 190, easeIO(p));
      figure(pc, p < 1 ? x : 190, 158, 2, { sex: 'm', view: 'back', pose: p < 1 ? 'walk' : 'stand', walk: t * 5 });
      glow(pc, 160, 95, 52, 62, PAL.gold, .34 + .46 * seg(lt, 0, 6));
    } },

  // ========================= 四 · 习惯 · 间奏 130.97–164.77 =========================
  // S21 「却欺骗自己」车厢：从脸抽到整节车厢
  { t0: 130.97, zs: 1, t1: 139.5, scene: 'train',
    in: T('whip', .12, -1),
    cam: CAM(8.53, { z0: 1.30, z1: 1.04, cx0: 140, cy0: 108, ease: 'out' }),
    draw(pc, lt, shot, t) {
      SCENES.train.draw(pc, t);
      figure(pc, 140, 120, 2, { sex: 'm', pose: 'sit', eyes: 'dot', mouth: 'flat', lookY: .2 });
    } },

  // S22 便利店：推向关东煮的热气
  { t0: 139.5, t1: 148.0, scene: 'store',
    in: T('scan', .28),
    cam: CAM(8.5, { z0: 1.02, z1: 1.18, cx0: 190, cy0: 116, ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.store.draw(pc, t);
      // 店员：站在关东煮旁边，浅色围裙（"还是两份？"得有人问）
      figure(pc, 22, 122, 1, { sex: 'f', eyes: 'normal', mouth: 'tiny', lookX: .6,
        col: { coat: '#4F7A6A', coatDk: '#2E4A42', inner: '#FFF3DE' } });
      figure(pc, 118, 158, 2, { sex: 'm', eyes: 'dot', mouth: 'flat', lookX: .8 });
      if (lt > 4.2) EVENTS.shadow.run(pc, lt - 4.2, { sy: 162 });
    } },

  // S23 路灯：跟他走过那圈光
  { t0: 148.0, t1: 157.0, scene: 'lamp',
    in: T('cut', 0),
    cam: CAM(9, { z0: 1.20, z1: 1.08, px: [110, 178], cy0: 110, ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.lamp.draw(pc, t);
      const p = seg(lt, .3, 8.4), x = lerp(56, 210, easeIO(p));
      figure(pc, x, 156, 2, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5 });
      SCENES.lamp.fg(pc, t);
    } },

  // S24 楼梯：熟练上楼，到门前站定
  { t0: 157.0, t1: 164.77, scene: 'stairs',
    in: T('cut', 0),
    cam: CAM(7.77, { z0: 1.14, z1: 1.06, px: [160, 196], py: [116, 108], ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.stairs.draw(pc, t);
      if (lt < 5.4) {
        const k = seg(lt, .3, 5.2) * 6.6, i = Math.floor(k), fr = k - i;
        figure(pc, 110 + (i + fr) * 14, 160 - (i + fr) * 12, 2, { sex: 'm', pose: 'walk', walk: t * 5, eyes: 'narrow', mouth: 'flat' });
      } else {
        figure(pc, 216, 92, 2, { sex: 'm', eyes: 'closed', mouth: 'flat', dy: -Math.round(Math.abs(Math.sin(lt * 2)) * 1) });
      }
    } },

  // ========================= 五 · 习惯 · 主歌 2 164.77–212.82 =========================
  // S25 「开了灯」灯闪两下才亮，拖鞋只剩一只
  { t0: 164.77, t1: 169.02, scene: 'room', stage: 2,
    in: T('fade', .6),
    cam: CAM(4.25, { z0: 1.06, z1: 1.18, cx0: 190, cy0: 106, hand: .6 }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      const on = lt < 1.3 ? (Math.floor(lt * 5) % 2 === 0) : true;
      if (!on) killLamp(pc);
      winSnow(pc, lt); sillSnow(pc, Math.min(5, lt * 1.6));
      figure(pc, 208, 150, 2, { sex: 'm', eyes: 'closed', mouth: 'flat', lookX: -.8 });
    } },

  // S26 「偌大的房 寂寞的床」从床摇到窗（被子叠得整齐）
  { t0: 169.02, t1: 177.32, scene: 'room', stage: 2,
    in: T('cut', 0),
    cam: CAM(8.3, { z0: 1.26, z1: 1.16, px: [90, 210], py: [128, 86], ease: 'io' }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      winSnow(pc, lt); sillSnow(pc, 5);
      figure(pc, 224, 150, 2, { sex: 'm', view: 'back', dy: Math.round(Math.sin(lt * 1.4)) });
    } },

  // S27 「关了灯」熟练版：一步不停走向床
  { t0: 177.32, t1: 181.59, scene: 'room', stage: 2,
    in: T('blk', .10),
    cam: CAM(4.27, { z0: 1.18, z1: 1.10, px: [214, 120], cy0: 112, ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      killLamp(pc); shadeAround(pc, .46);
      const p = seg(lt, .2, 4.0), x = lerp(224, 88, easeIO(p));
      figure(pc, x, 150, 2, { sex: 'm', pose: 'walk', walk: t * 5.5, eyes: 'narrow', mouth: 'flat' });
    } },

  // S28 「心里的伤」床沿掏手机：草稿箱一条未发送
  { t0: 181.59, zs: 1, t1: 188.01, scene: 'room', stage: 2,
    in: T('cut', 0),
    cam: CAM(6.42, { z0: 1.26, z1: 1.36, cx0: 84, cy0: 126, ease: 'io' }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      killLamp(pc); shadeAround(pc, .42);
      if (lt < 1.2) EVENTS.phone.run(pc, seg(lt, 0, 1.2) * 1.5, { sx: 96, sy: 150, sc: .7 });
      else if (lt < 4.4) EVENTS.phone.run(pc, 1.5, { sx: 96, sy: 150, sc: .7 });
      else { pc.fillStyle = PAL.ink; pc.fillRect(90, 130, 9, 15); }
      figure(pc, 74, 144, 2, { sex: 'm', pose: 'sit', eyes: lt < 4.4 ? 'teary' : 'closed', mouth: 'frown',
        tear: .5, lookX: .5, lookY: .4 });
      winSnow(pc, lt);
    } },

  // S29 「生命 随年月流去」时间把他推远
  { t0: 188.01, t1: 195.41, scene: 'room', stage: 2,
    in: T('dither', .30),
    cam: CAM(7.4, { z0: 1.22, z1: 1.04, cx0: 96, cy0: 114, ease: 'out' }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      killLamp(pc); shadeAround(pc, .40);
      winBlink(pc, lt); winSnow(pc, lt);
      sillSnow(pc, Math.min(9, 2 + Math.floor(lt / 2.4) * 2.5));
      figure(pc, 66, 140, 2, { sex: 'm', pose: 'sit', eyes: 'dot', mouth: 'flat', lookY: -.3 });
    } },

  // S30 「随着你离去」车厢并肩，她靠上肩
  { t0: 195.41, t1: 202.11, scene: 'train', tint: '#FFD166', tintA: 0.14,
    in: T('fade', .4),
    leak: .2,
    cam: CAM(6.7, { z0: 1.10, z1: 1.18, cx0: 158, cy0: 108, hand: .4 }),
    draw(pc, lt, shot, t) {
      SCENES.train.draw(pc, t);
      figure(pc, 136, 120, 2, { sex: 'm', pose: 'sit', eyes: 'closed', mouth: 'smile' });
      figure(pc, 172, 120, 2, { sex: 'f', pose: 'sit', eyes: 'closed', mouth: 'tiny', lean: -2, blush: .5 });
    } },

  // S31 「随往事淡去」侧躺抱手机，退开一点
  { t0: 202.11, zs: 1, t1: 208.10, scene: 'room', stage: 2,
    in: T('dither', .30),
    cam: CAM(5.99, { z0: 1.28, z1: 1.16, cx0: 96, cy0: 126, ease: 'out' }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      killLamp(pc); shadeAround(pc, Math.min(.5, .2 + lt * .08));
      figure(pc, 66, 140, 2, { sex: 'm', pose: 'sit', eyes: 'asleep', mouth: 'tiny', lookX: -.4 });
      R(pc, 80, 128, 6, 4, PAL.teal);
      dith(pc, 76, 124, 14, 12, PAL.ink, PAL.teal, .18);
    } },

  // S32 「随麻痹的心逐渐远去」灯自己灭了
  { t0: 208.10, t1: 212.82, scene: 'room', stage: 2,
    in: T('cut', 0),
    cam: CAM(4.72, { z0: 1.03, z1: 1.00, cx0: 150, cy0: 100 }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      if (lt > 1.8) killLamp(pc);
      shadeAround(pc, Math.min(.54, .2 + lt * .1));
      figure(pc, 70, 142, 1, { sex: 'm', pose: 'sit', eyes: 'asleep', mouth: 'tiny' });
      const fl = seg(lt, 4.2, 4.72);
      if (fl > 0) { pc.fillStyle = PAL.paper; pc.globalAlpha = fl * .9; pc.fillRect(0, 0, 320, 180); pc.globalAlpha = 1; }
    } },

  // ========================= 六 · 存档 · 副歌 2 212.82–260.41 =========================
  // S33 「我好想你」③ 海边只剩他，空位的心闪两下
  { t0: 212.82, t1: 219.33, scene: 'sea', tint: '#FFD166', tintA: 0.13,
    in: T('whip', .12, 1),
    leak: .1,
    cam: CAM(6.51, { z0: 1.06, z1: 1.16, cx0: 150, cy0: 100, ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.sea.draw(pc, t);
      figure(pc, 132, 148, 2, { sex: 'm', view: 'back' });
      if (lt > 2.6 && lt < 4.6 && Math.floor(lt * 3) % 2 === 0) drawHeart(pc, 180, 100, 1, PAL.rose, 1);
    } },

  // S34 「却不露痕迹」别人的烟花，他脸上什么都没有
  { t0: 219.33, t1: 225.92, scene: 'rooftop', tint: '#FFD166', tintA: 0.10,
    in: T('cut', 0),
    cam: CAM(6.59, { z0: 1.14, z1: 1.06, px: [120, 168], cy0: 96, ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.rooftop.draw(pc, t);
      figure(pc, 160, 152, 2, { sex: 'm', eyes: 'narrow', mouth: 'side', lookY: -.5 });
      if (lt > 1.7 && lt < 2.9) EVENTS.firework.run(pc, lt - 1.7, { sx: 90, sy: 112, col: PAL.gold });
      if (lt > 4.2 && lt < 5.4) EVENTS.firework.run(pc, lt - 4.2, { sx: 232, sy: 106, col: PAL.gold });
    } },

  // S35 「我还踮着脚思念」雪地：第二串脚印此刻显形
  { t0: 225.92, t1: 232.16, scene: 'snow',
    in: T('scan', .28),
    cam: CAM(6.24, { z0: 1.18, z1: 1.10, px: [130, 180], cy0: 112, ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.snow.draw(pc, t);
      const p = seg(lt, .4, 5.2), x = lerp(120, 190, easeIO(p));
      if (lt < 5.6) figure(pc, x, 150, 1, { sex: 'm', view: 'back', pose: 'walk', walk: t * 4.5 });
      else figure(pc, 190, 150, 1, { sex: 'm', eyes: 'narrow', mouth: 'frown', lookY: .6 });
      SCENES.snow.fg(pc, t);
    } },

  // S36 「我还任记忆盘旋」走马灯·褪色，越转越远
  { t0: 232.16, t1: 238.38, scene: 'montage', tint: '#FFD166', tintA: 0.10,
    in: T('glitch', .16),
    cam: CAM(6.22, { z0: 1.14, z1: 1.02, cx0: 160, cy0: 100, ease: 'out' }),
    draw(pc, lt) {
      const scenes = [['sea', 148], ['rooftop', 152], ['pool', 96], ['store', 158]];
      montage(pc, lt, 6.22, scenes, { solo: true, glitch: true, fadeOut: true });
    } },

  // S37 「我还闭着眼流泪」窗里窗外，雪水往下淌
  { t0: 238.38, zs: 1, t1: 244.78, scene: 'emptyroom',
    in: T('glitch', .16),
    cam: CAM(6.4, { z0: 1.24, z1: 1.32, cx0: 196, cy0: 118, hand: 1.2 }),
    draw(pc, lt) {
      SCENES.emptyroom.draw(pc, lt);
      winSnow(pc, lt, 108, 26, 104, 84);
      figure(pc, 196, 154, 2, { sex: 'm', pose: 'crouch', eyes: 'cry', mouth: 'open', tear: 1 });
      const tp = lt % 1.4;
      if (lt > 1.2 && tp < .5) { pc.fillStyle = PAL.mint; pc.fillRect(192, 136 + tp * 36, 1, 2); }
      vignette(pc, .56);
    } },

  // S38 「我还装作无所谓」迎面错身，笑垮掉
  { t0: 244.78, t1: 253.93, scene: 'street',
    in: T('dither', .30),
    cam: CAM(9.15, { z0: 1.16, z1: 1.06, px: [120, 180], cy0: 108, ease: 'io' }),
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      const p = seg(lt, .3, 3.4), x = lerp(60, 156, easeIO(p));
      // 路人：从右往左真正走过（不再停在主角身上），手里递一杯
      const px2 = lerp(288, 8, easeIO(seg(lt, .3, 3.9)));
      figure(pc, px2, 160, 2, { sex: 'f', pose: 'walk', walk: t * 6,
        eyes: 'dot', mouth: 'tiny', lookX: -.5,
        col: { coat: 'dusk', inner: 'haze' }, aR: lt > 1.4 && lt < 3.2 ? 1.2 : .2 });
      if (lt > 1.4 && lt < 3.4) { R(pc, px2 + 9, 132, 2, 2, PAL.pale); }
      if (lt < 3.4) figure(pc, x, 158, 2, { sex: 'm', pose: 'walk', walk: t * 6,
        eyes: 'normal', mouth: 'flat', aR: lt > 1.2 && lt < 3 ? 2 : .3 });
      else figure(pc, 156, 158, 2, { sex: 'm', eyes: 'narrow', mouth: 'frown', dy: 1, lookY: .4 });
      SCENES.street.fg(pc, t);
    } },

  // S39 「我好想你」④ rose + 心碎
  { t0: 253.93, zs: 1, t1: 260.41, scene: 'emptyroom', tint: '#E8556D', tintA: 0.05,
    in: T('blk', .10),
    cam: CAM(6.48, { z0: 1.04, z1: 1.14, cx0: 168, cy0: 108, ease: 'io' }),
    draw(pc, lt) {
      SCENES.emptyroom.draw(pc, lt);
      figure(pc, 160, 154, 2, { sex: 'm', pose: 'crouch', eyes: 'teary', mouth: 'wobble', tear: .6 });
      if (lt < 3.6) drawHeart(pc, 172, 104 - lt * 6, 1, PAL.rose, 1);
      else {
        const bp = Math.min(1, (lt - 3.6) / 2);
        for (let i = 0; i < 7; i++) {
          PX(pc, 168 + (i * 5 % 13) - 6 + bp * (i - 3), 100 - (lt - 3.6) * 20 - (i % 3) * 5, PAL.rose);
        }
      }
      vignette(pc, .34);
    } },

  // ========================= 七 · 存档 · 尾段 260.41–292.0 =========================
  // S40 「却欺骗自己」只剩台灯一圈光
  { t0: 260.41, zs: 1, t1: 266.50, scene: 'room', stage: 3,
    in: T('dissolve', .38),
    cam: CAM(6.09, { z0: 1.14, z1: 1.22, cx0: 134, cy0: 124, hand: .4 }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      shade(pc, .44); lampGlow(pc, 1);
      figure(pc, 96, 150, 2, { sex: 'm', pose: 'sit', eyes: 'closed', mouth: 'flat', lookX: .6 });
    } },

  // S41 「我好想你」⑤ 灯光呼吸，他抬手虚握
  { t0: 266.50, t1: 272.98, scene: 'room', stage: 3, hit: 266.50, hitMag: 6,
    in: T('cut', 0),
    cam: CAM(6.48, { z0: 1.16, z1: 1.24, cx0: 132, cy0: 126, ease: 'io' }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      shade(pc, .44); lampGlow(pc, 1 + .18 * (Math.floor(lt * 2) % 2));
      figure(pc, 102, 150, 2, { sex: 'm', eyes: 'closed', mouth: 'flat', aR: 1.1 + .15 * Math.sin(lt * 2), dy: Math.round(Math.sin(lt * 1.6)) });
    } },

  // S42 「就当作秘密」手机扣下，挤出 0.8s 的笑
  { t0: 272.98, t1: 279.10, scene: 'room', stage: 3,
    in: T('cut', 0),
    cam: CAM(6.12, { z0: 1.24, z1: 1.34, cx0: 110, cy0: 124, ease: 'io' }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      shade(pc, .38); lampGlow(pc, 1);
      if (lt < 1) EVENTS.phone.run(pc, seg(lt, 0, 1) * 1.5, { sx: 128, sy: 141, sc: .62 });
      else { pc.fillStyle = PAL.ink; pc.fillRect(123, 130, 9, 15); }
      const smile = lt > 1.6 && lt < 2.4 ? backOut(seg(lt, 1.6, 1.9)) : 0;
      figure(pc, 96, 150, 2, { sex: 'm', eyes: smile > .5 ? 'happy' : 'narrow', mouth: smile > .5 ? 'smile' : 'flat', lookX: .3 });
    } },

  // S43 「我好想你」⑥ 走廊：这次一直走，走进光里
  { t0: 279.10, t1: 285.74, scene: 'corridor', tint: '#FFD166', tintA: 0.12,
    in: T('whip', .12, 1),
    leak: .1,
    cam: CAM(6.64, { z0: 1.04, z1: 1.04, cx0: 180, cy0: 100 }),
    draw(pc, lt, shot, t) {
      SCENES.corridor.draw(pc, t);
      const p = seg(lt, .3, 5.6), x = lerp(206, 164, easeIO(p));
      figure(pc, x, 158, 2, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5.5 });
      glow(pc, 160, 95, 58, 68, PAL.gold, .38 + .5 * seg(lt, 0, 5.6));
      const fl = seg(lt, 5.7, 6.4);
      if (fl > 0) { pc.fillStyle = PAL.paper; pc.globalAlpha = fl * .9; pc.fillRect(0, 0, 320, 180); pc.globalAlpha = 1; }
    } },

  // S44 「就深藏在心」存档条填满 → 心口一点光
  { t0: 285.74, t1: 292.0, scene: 'room', stage: 3,
    in: T('flash', .85, 1, .95),
    cam: CAM(6.26, { z0: 1.12, z1: 1.02, cx0: 160, cy0: 100, ease: 'out' }),
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      shade(pc, .24 + seg(lt, 4.4, 6.1) * .38);
      figure(pc, 160, 150, 2, { sex: 'm', eyes: 'closed', mouth: 'flat', aR: .5, lookY: .3 });
      const p = seg(lt, .4, 5.2);
      if (p < 1) {
        R(pc, 89, 22, 142, 18, PAL.ink);
        R(pc, 91, 24, 138, 14, PAL.night);
        R(pc, 92, 25, Math.round(136 * p), 12, PAL.gold);
        drawHeart(pc, 92 + 136 * p, 26, 1, PAL.gold, 1);
      } else {
        const w = Math.max(0, Math.round(136 * (1 - seg(lt, 5.2, 5.8))));
        if (w > 0) {
          R(pc, 89, 22, 142, 18, PAL.ink);
          R(pc, 91, 24, 138, 14, PAL.night);
          R(pc, 92, 25, w, 12, PAL.gold);
        }
        if (lt > 5.6 && lt < 6.9 && Math.floor(lt * 3) % 2 === 0) { PX(pc, 160, 132, PAL.gold); PX(pc, 160, 133, PAL.gold); }
      }
    } },

  // ========================= 八 · 尾声 292.0–329.2 =========================
  // S45 走进雪里
  { t0: 292.0, t1: 302.0, scene: 'snow',
    in: T('blk', .14),
    cam: CAM(10, { z0: 1.14, z1: 1.02, px: [120, 176], cy0: 108, ease: 'out' }),
    draw(pc, lt, shot, t) {
      SCENES.snow.draw(pc, t);
      const p = seg(lt, .4, 9), x = lerp(100, 172, easeIO(p));
      figure(pc, x, 150, 2, { sex: 'm', view: 'back', pose: 'walk', walk: t * 4.5 });
      SCENES.snow.fg(pc, t);
    } },

  // S46 回望那扇窗
  { t0: 302.0, t1: 312.0, scene: 'snow',
    in: T('cut', 0),
    cam: CAM(10, { z0: 1.14, z1: 1.02, px: [214, 246], cy0: 106, ease: 'out' }),
    draw(pc, lt, shot, t) {
      SCENES.snow.draw(pc, t);
      if (lt < 6) {
        const p = seg(lt, 0, 5.8), x = lerp(176, 226, easeIO(p));
        figure(pc, x, 148, 1, { sex: 'm', view: 'back', pose: 'walk', walk: t * 4 });
      } else if (lt < 8.2) {
        figure(pc, 226, 148, 1, { sex: 'm', eyes: 'normal', mouth: 'flat', lookX: .8 });
      } else {
        figure(pc, 232, 148, 1, { sex: 'm', view: 'back', pose: 'walk', walk: t * 4 });
      }
      SCENES.snow.fg(pc, t);
    } },

  // S47 走成一个小点，身后多出一串并肩的脚印
  { t0: 312.0, t1: 325.5, scene: 'snow',
    in: T('cut', 0),
    cam: CAM(13.5, { z0: 1.06, z1: 1.00, cx0: 246, cy0: 110, ease: 'out' }),
    draw(pc, lt, shot, t) {
      SCENES.snow.draw(pc, t);
      const p = seg(lt, 0, 12), x = lerp(236, 286, easeIO(p));
      figure(pc, x, 146, 1, { sex: 'm', view: 'back', pose: 'walk', walk: t * 4 });
      const fp = Math.floor(lt / .5);
      for (let i = 0; i < Math.min(9, fp); i++) {
        R(pc, 208 + i * 9, 132 + i * 3, 2, 1, PAL.pale);
        R(pc, 211 + i * 9, 133 + i * 3, 2, 1, PAL.haze);
      }
      shade(pc, Math.min(.5, .14 + lt * .025));
      SCENES.snow.fg(pc, t);
    } },

  // S48 关机
  { t0: 325.5, t1: 329.2, scene: 'black', cam: false,
    in: T('fade', 1.2, 1, 1),
    draw(pc, lt) {
      R(pc, 0, 0, 320, 180, PAL.ink);
      if (lt < 2.4 && Math.floor(lt * 3) % 2 === 0) { PX(pc, 160, 90, PAL.gold); PX(pc, 160, 91, PAL.gold); }
    } },
  ],

  // ========================= 字幕 =========================
  subs: buildSubs(),
  nar: NAR(),
  kao: KAO(),
};

// ---------------- 运镜 / 转场 helper ----------------
// CAM(时长, {z0,z1,cx0,cy0,px,py,hand,ease})
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

// ---------------- 分镜辅助 ----------------
function shadeAround(c, k) {
  if (k <= 0) return;
  shadeMask(c, (x, y) => {
    const dx = Math.max(0, Math.max(176 - x, x - 284));
    const dy = Math.max(0, Math.max(26 - y, y - 108));
    return k * Math.min(1, Math.max(dx, dy) / 16);
  });
}
function killLamp(c) {
  R(c, 94, 86, 74, 46, PAL.night);
  R(c, 96, 130, 60, 4, PAL.navy);
  R(c, 96, 130, 60, 1, PAL.dusk);
  R(c, 94, 134, 74, 16, PAL.ink);
  R(c, 129, 118, 3, 11, PAL.navy);
  R(c, 126, 129, 10, 2, PAL.night);
}
function lampGlow(c, k) {
  for (let i = 0; i < 7; i++) { const w = 12 + i * 2; R(c, 130 - w / 2, 108 + i, w, 1, PAL.gold); }
  R(c, 117, 113, 26, 1, PAL.haze);
  R(c, 123, 114, 15, 2, PAL.paper);
  glow(c, 130, 118, 34 * k, 30 * k, PAL.gold, .45 * k);
  glow(c, 130, 130, 22, 12, PAL.gold, .5 * k);
}
function winBlink(c, t) {
  for (let i = 0; i < 6; i++) {
    if ((t * .8 + i * 1.37) % 3 < 1.5) R(c, 182 + (i * 17) % 94, 32 + (i * 23) % 56, 2, 3, PAL.haze);
  }
}
function winSnow(c, t, wx = 176, wy = 26, ww = 108, wh = 82) {
  c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip();
  snowFx(c, t, 26, PAL.pale);
  c.restore();
}
function winSea(c) {
  const wx = 176, wy = 26, ww = 108, wh = 82;
  vgrad(c, wx, wy, ww, 40, PAL.dusk, PAL.haze);
  R(c, wx, wy + 40, ww, wh - 40, PAL.navy);
  for (let y = wy + 42; y < wy + wh; y += 3) dith(c, wx, y, ww, 2, PAL.navy, PAL.dusk, .4);
  disc(c, wx + 78, wy + 16, 6, PAL.pale);
  for (let y = wy + 44; y < wy + wh - 6; y += 4) dith(c, wx + 70, y, 16, 1, PAL.navy, PAL.pale, .5);
  PX(c, wx + 22, wy + 38, PAL.gold);
}
function sillSnow(c, h) { if (h > 0) R(c, 176, 108 - h, 108, h, PAL.pale); }
function vignette(c, k) {
  if (k <= 0) return;
  shadeMask(c, (x, y) => {
    const dx = Math.max(0, 160 - Math.abs(x - 160)) / 160;
    const dy = Math.max(0, 90 - Math.abs(y - 90)) / 90;
    const d = Math.min(dx, dy);
    return k * Math.min(1, Math.max(0, (1 - d) * 1.35));
  });
}
// 走马灯：场景轮换，可加故障切片与逐段压暗
function montage(c, lt, dur, list, opt = {}) {
  const per = dur / list.length;
  const i = Math.min(list.length - 1, Math.floor(lt / per));
  const t2 = lt - i * per;
  const [name, gy] = list[i];
  SCENES[name].draw(c, t2);
  const sit = name === 'pool';
  if (opt.solo) figure(c, 160, gy, sit ? 1 : 2, { sex: 'm', pose: sit ? 'sit' : 'stand', eyes: 'dot', mouth: 'flat',
    col: sit ? { coat: '#4F7A6A', inner: '#FFF3DE' } : null });
  else {
    figure(c, 140, gy, sit ? 1 : 2, { sex: 'm', pose: sit ? 'sit' : 'stand', eyes: 'happy', mouth: 'smile',
      col: { coat: '#4F7A6A', inner: '#FFF3DE' } });
    figure(c, 168, gy, sit ? 1 : 2, { sex: 'f', pose: sit ? 'sit' : 'stand', eyes: 'happy', mouth: 'smile', blush: .6,
      col: { coat: '#F2C14E', inner: '#E85D6E' } });
  }
  const edge = Math.min(t2, per - t2);
  if (edge < .10) shade(c, .62 * (1 - edge / .10));
  if (opt.glitch && edge < .12) {
    const off = Math.round((1 - edge / .12) * 8);
    for (let s = 0; s < 4; s++) {
      const y = 20 + s * 36;
      c.drawImage(c.canvas, 0, y, 320, 30, off, y, 320, 30);
    }
  }
  shade(c, (opt.fadeOut ? .22 + i * .12 : .12 + i * .1) * (name === 'pool' ? .25 : 1));
}

// ---------------- 字幕 ----------------
function buildSubs() {
  const L = [
    [38.40, '开了灯 眼前的模样', ['开了灯']],
    [42.77, '偌大的房 寂寞的床', ['寂寞']],
    [50.99, '关了灯 全都一个样', ['关了灯']],
    [55.37, '心里的伤 无法分享', ['伤']],
    [61.56, '生命 随年月流去 随白发老去', ['流去', '老去']],
    [69.10, '随着你离去 快乐渺无音讯', ['离去', '音讯']],
    [75.81, '随往事淡去 随梦境睡去', ['淡去', '睡去']],
    [81.74, '随麻痹的心逐渐远去', ['远去']],
    [86.53, '我好想你 好想你', [], { size: 178, y: 312, hit: 1, lines: 24, ghost: 3, slam: 1 }],
    [93.01, '却不露痕迹', ['痕迹']],
    [99.57, '我还踮着脚思念', ['踮着脚']],
    [105.91, '我还任记忆盘旋', ['盘旋']],
    [112.26, '我还闭着眼流泪', ['流泪']],
    [118.45, '我还装作无所谓', ['无所谓']],
    [124.36, '我好想你 好想你', [], { size: 178, y: 312, hit: 1, lines: 16, ghost: 2 }],
    [130.97, '却欺骗自己', ['欺骗']],
    [164.77, '开了灯 眼前的模样', ['开了灯']],
    [169.02, '偌大的房 寂寞的床', ['寂寞']],
    [177.32, '关了灯 全都一个样', ['关了灯']],
    [181.59, '心里的伤 无法分享', ['伤']],
    [188.01, '生命 随年月流去 随白发老去', ['流去', '老去']],
    [195.41, '随着你离去 快乐渺无音讯', ['离去', '音讯']],
    [202.11, '随往事淡去 随梦境睡去', ['淡去', '睡去']],
    [208.10, '随麻痹的心逐渐远去', ['远去']],
    [212.82, '我好想你 好想你', [], { size: 178, y: 312, hit: 1, lines: 24, ghost: 3 }],
    [219.33, '却不露痕迹', ['痕迹']],
    [225.92, '我还踮着脚思念', ['踮着脚']],
    [232.16, '我还任记忆盘旋', ['盘旋']],
    [238.38, '我还闭着眼流泪', ['流泪']],
    [244.78, '我还装作无所谓', ['无所谓']],
    [253.93, '我好想你 好想你', [], { size: 178, y: 420, color: '#E8556D', hit: 1, lines: 20, ghost: 2 }],
    [260.41, '却欺骗自己', ['欺骗']],
    [266.50, '我好想你 好想你', [], { size: 152, y: 380, hit: 1, lines: 12, ghost: 2 }],
    [272.98, '就当作秘密', ['秘密']],
    [279.10, '我好想你 好想你', [], { size: 152, y: 380, hit: 1, lines: 12, ghost: 1 }],
    [285.74, '就深藏在心', ['深藏', '心']],
  ];
  const subs = [];
  L.forEach((l, i) => {
    const n = [...l[1].replace(/\s/g, '')].length;
    const est = Math.min(9.0, Math.max(3.4, n * 0.95 + 1.8));
    const end = i < L.length - 1 ? Math.min(L[i + 1][0], l[0] + est) : 292.0;
    const t1 = Math.max(l[0] + 1.6, end);
    const big = l[3] || null;
    subs.push(big
      ? { t0: l[0], t1, text: l[1], kw: l[2], band: false, color: big.color || '#FFD166',
          size: big.size, y: big.y, kScale: .26, hit: big.hit, lines: big.lines, ghost: big.ghost }
      : { t0: l[0], t1, text: l[1], kw: l[2] });
  });
  subs.push({ t0: 313.0, t1: 321.0, text: '我好想你', size: 140, y: 400, color: '#C9C6DD', band: false, kScale: .3 });
  return subs;
}

// ---------------- 叙事文字（12 条，全部落在歌词空档） ----------------
function NAR() {
  return [
    { t0: 4.7, t1: 5.85, style: 'sys', text: '▶ 按下开始' },
    { t0: 6.7, t1: 10.6, style: 'bar', text: '这条路，他每天走两遍。' },
    { t0: 15.6, t1: 19.2, style: 'bar', text: '她在这盏灯下说过：明天见。' },
    { t0: 24.3, t1: 27.9, style: 'sys', text: '明天没有来' },
    { t0: 32.9, t1: 36.3, style: 'bar', text: '他还是把灯打开了。' },
    { t0: 44.3, t1: 47.7, style: 'sys', text: '▶ 调查：床 · 已读档 4 次' },
    { t0: 139.9, t1: 143.8, style: 'bar', text: '两份关东煮。店员问：还是两份？' },
    { t0: 148.5, t1: 151.9, style: 'sys', text: '他说：嗯。' },
    { t0: 170.3, t1: 173.5, style: 'bar', text: '他把她的拖鞋，收进了柜子。' },
    { t0: 182.1, t1: 185.3, style: 'sys', text: '▶ 草稿箱 · 1 条未发送' },
    { t0: 273.3, t1: 277.3, style: 'bar', text: '草稿箱里那条：我到了。' },
    { t0: 296.4, t1: 299.6, style: 'card', text: '第 38 天', sub: '他走进了雪里', tag: 'DAY / 38' },
    { t0: 321.4, t1: 324.8, style: 'bar', text: '身后多了一串脚印。' },
  ];
}

// ---------------- 颜文字（14 个，只出现在现实段） ----------------
function KAO() {
  return [
    { t0: 46.0, t1: 48.4, text: '（´-ω-`）', x: 76, y: 96, col: '#F0D3AC', a: .46 },
    { t0: 57.8, t1: 60.4, text: '（´；ω；`）', x: 246, y: 98, col: '#9AD6C4', a: .52 },
    { t0: 108.6, t1: 111.0, text: '（´▽`）', x: 168, y: 94, col: '#FFC35C', a: .42 },
    { t0: 114.6, t1: 117.0, text: '（；ω；）', x: 246, y: 96, col: '#9AD6C4', a: .5 },
    { t0: 121.6, t1: 123.8, text: '（￣ω￣;）', x: 96, y: 98, col: '#F0D3AC', a: .42 },
    { t0: 174.6, t1: 177.0, text: '（´･_･`）', x: 226, y: 94, col: '#C0906A', a: .44 },
    { t0: 185.2, t1: 187.4, text: '（・ω・`）', x: 76, y: 96, col: '#F0D3AC', a: .46 },
    { t0: 203.6, t1: 205.9, text: '（´-ω-`）', x: 70, y: 96, col: '#F0D3AC', a: .42 },
    { t0: 222.7, t1: 224.9, text: '（・_・;）', x: 164, y: 96, col: '#C0906A', a: .44 },
    { t0: 240.2, t1: 242.6, text: '（；ω；）', x: 198, y: 96, col: '#9AD6C4', a: .5 },
    { t0: 246.6, t1: 248.9, text: '（￣ω￣;）', x: 158, y: 98, col: '#F0D3AC', a: .4 },
    { t0: 251.0, t1: 253.4, text: '（´；ω；`）', x: 160, y: 96, col: '#9AD6C4', a: .48 },
    { t0: 262.6, t1: 264.9, text: '（´･_･`）', x: 98, y: 96, col: '#C0906A', a: .4 },
    { t0: 275.6, t1: 277.8, text: '（´-ω-`）', x: 98, y: 96, col: '#F0D3AC', a: .42 },
  ];
}

// ---------------- 每场一个色调（冷影暖灯，参考片的做法） ----------------
(function () {
  const M = {
    street: ['#0E2A50', .30], lamp: ['#0E2A50', .30], stairs: ['#12283C', .28],
    sea: ['#0C3452', .30], rooftop: ['#102C4C', .28], snow: ['#0F3350', .30],
    train: ['#16203C', .26], store: ['#1A2636', .22], corridor: ['#122C2C', .26],
    emptyroom: ['#1A2434', .26], room: ['#2A1206', .16], classroom: ['#2A1440', .30],
    pool: null, black: null,
  };
  for (const sh of window.SPEC.shots) {
    if (sh.cast) continue;
    const m = M[sh.scene];
    if (m) { sh.cast = m[0]; sh.castA = m[1]; }
  }
})();
