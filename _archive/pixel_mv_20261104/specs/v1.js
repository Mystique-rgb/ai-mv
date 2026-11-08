// specs/current.js —《我好想你（苏打绿版）》像素 RPG 版 · 全曲 329.2s · 48 镜
// 分镜词：D:/ai音乐mv/我好想你/分镜词-我好想你-像素RPG版.md
// 语法：现实=无色调冷蓝紫；回忆=shot.tint gold 0.12~0.15；
//      全片唯一暖色 gold=灯（台灯/路灯/走廊窗/雪地窗/存档条/心口光点/片名）；
//      情绪心=rose。事件密度 ≈2s/个，无空闲段。
window.SPEC = {
  fps: 24,
  duration: 329.2,
  fadeIn: 0.5,
  fadeOut: 0.5,
  cover: 'A',

  shots: [
  // ============ 前奏 0–38.4 ============
  // S01 0–6.0 开机：黑屏 gold 光点闪两下 → 光圈扩开
  { t0: 0, t1: 6.0, scene: 'black',
    draw(pc, lt) {
      R(pc, 0, 0, 320, 180, PAL.ink);
      const blink = lt < 2.2 ? (Math.floor(lt * 4) % 2 === 0) : true;   // 闪两下后常亮
      if (blink) {
        const k = seg(lt, 2.2, 5.2);            // 光圈扩张
        const r = 6 + easeOut(k) * 150;
        for (let j = -r; j <= r; j += 2) {
          const w = Math.floor(Math.sqrt(Math.max(0, r * r - j * j)));
          dith(pc, 160 - w, 90 + j, w * 2, 2, PAL.ink, PAL.gold, .05 + k * .1);
        }
        PX(pc, 160, 90, PAL.gold);
      }
    } },
  // S02 6.0–15.0 雨街：两人并肩走向路灯
  { t0: 6.0, t1: 15.0, scene: 'street', tint: '#FFD166', tintA: 0.06,
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      const p = seg(lt, .3, 8.2), x = lerp(36, 176, easeIO(p));
      figure(pc, x - 16, 158, 2, { sex: 'm', pose: 'walk', walk: t * 6, eyes: 'normal', mouth: 'flat' });
      figure(pc, x + 16, 158, 2, { sex: 'f', pose: 'walk', walk: t * 6 + 1, eyes: 'normal', mouth: 'tiny',
        emote: lt > 6.6 ? 'heart' : null, emoteK: seg(lt, 6.6, 7.8), emoteCol: PAL.rose });
      SCENES.street.fg(pc, t);
    } },
  // S03 15.0–24.0 灯下告别：她转身走远，他没动
  { t0: 15.0, t1: 24.0, scene: 'street',
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      const p = seg(lt, 2.2, 8.6);
      if (p > 0) figure(pc, lerp(214, 318, easeIO(p)), 158, 2, { sex: 'f', view: 'back', pose: 'walk', walk: t * 5.5 });
      else figure(pc, 214, 158, 2, { sex: 'f', eyes: 'up', mouth: 'tiny', lookY: -.4 });
      figure(pc, 178, 158, 2, { sex: 'm', eyes: lt > 5 ? 'teary' : 'normal', mouth: 'flat',
        tear: lt > 5 ? .5 : 0, lookX: p > 0 ? .8 : 0 });
      if (lt > 7.6) { const tp = seg(lt, 7.6, 8.6); pc.fillStyle = PAL.mint; pc.fillRect(177, 140 + tp * 16, 1, 2); }
      SCENES.street.fg(pc, t);
    } },
  // S04 24.0–32.0 楼梯间：独自上楼，头越来越低
  { t0: 24.0, t1: 32.0, scene: 'stairs',
    draw(pc, lt, shot, t) {
      SCENES.stairs.draw(pc, t);
      const p = seg(lt, .4, 7.8), k = p * 7.2, i = Math.floor(k), fr = k - i;
      const x = 110 + (i + fr) * 14, y = 160 - (i + fr) * 12;
      figure(pc, x, y, 2, { sex: 'm', pose: 'walk', walk: t * 5.5,
        eyes: p < .3 ? 'normal' : 'narrow', mouth: 'flat', lookY: p < .3 ? 0 : .5 });
      if (lt > 6.4) EVENTS.shadow.run(pc, lt - 6.4, { sy: 168 });
    } },
  // S05 32.0–38.4 空房：进门 → 抬手 → 38.4 闪白 = 开灯
  { t0: 32.0, t1: 38.4, scene: 'emptyroom',
    draw(pc, lt, shot, t) {
      SCENES.emptyroom.draw(pc, t);
      const p = seg(lt, .3, 3.2), x = lerp(64, 150, easeIO(p));
      figure(pc, x, 154, 2, { sex: 'm', pose: p >= 1 ? 'stand' : 'walk', walk: t * 5.5,
        eyes: 'dot', mouth: 'flat', aR: seg(lt, 4.4, 5.4) * 2, lookX: .5 });
      const fl = seg(lt, 5.9, 6.4);              // 开灯闪白
      if (fl > 0) { pc.fillStyle = PAL.paper; pc.globalAlpha = fl * .9; pc.fillRect(0, 0, 320, 180); pc.globalAlpha = 1; }
    } },

  // ============ 主歌 1 · 秋·雨 38.4–86.5 ============
  // S06 「开了灯 眼前的模样」灯下全景，人小屋空
  { t0: 38.4, t1: 43.0, scene: 'room',
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      figure(pc, 160, 150, 2, { sex: 'm', eyes: lt < 2.4 ? 'wide' : 'lost', mouth: 'flat', lookY: lt < 2.4 ? -.4 : .3 });
    } },
  // S07 「偌大的房 寂寞的床」床占左半，人坐床沿
  { t0: 43.0, t1: 50.99, scene: 'room',
    crop(lt) { return focus(lt, 8, 84, 118, 1.34, .05); },
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      const p = seg(lt, .2, 2.6), x = lerp(150, 78, easeIO(p));
      if (p < 1) figure(pc, x, 150, 2, { sex: 'm', pose: 'walk', walk: t * 5.5, eyes: 'narrow', mouth: 'flat' });
      else figure(pc, 74, 144, 2, { sex: 'm', pose: 'sit', eyes: 'narrow', mouth: 'frown', lookY: .5, aL: .4, aR: .4 });
    } },
  // S08 「关了灯 全都一个样」51.0 灯灭，只剩窗
  { t0: 50.99, t1: 55.37, scene: 'room',
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      killLamp(pc);
      shadeAround(pc, .5);
      figure(pc, 160, 150, 2, { sex: 'm', eyes: 'closed', mouth: 'flat', dy: 1 });
    } },
  // S09 「心里的伤 无法分享」窗下蹲着，玻璃雨
  { t0: 55.37, t1: 61.56, scene: 'room',
    crop(lt) { return focus(lt, 6.2, 232, 120, 1.36, .05); },
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      killLamp(pc); shadeAround(pc, .38);
      pc.save(); pc.beginPath(); pc.rect(176, 26, 108, 82); pc.clip();
      rainFx(pc, lt, 26, PAL.haze); pc.restore();
      figure(pc, 244, 158, 2, { sex: 'm', pose: 'crouch', eyes: 'narrow', mouth: 'frown', lookY: .3, aL: 2, aR: 2 });
    } },
  // S10 「生命 随年月流去 随白发老去」窗外日夜快转 + 纸飞机
  { t0: 61.56, t1: 69.10, scene: 'room',
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      killLamp(pc); shadeAround(pc, .3);
      pc.save(); pc.beginPath(); pc.rect(176, 26, 108, 82); pc.clip();
      winBlink(pc, lt); EVENTS.plane.run(pc, lt, { dur: 6.4 }); pc.restore();
      if (lt < 4) figure(pc, 226, 150, 2, { sex: 'm', eyes: 'dot', mouth: 'flat', lookX: -.4 });
      else figure(pc, 74, 144, 2, { sex: 'm', pose: 'sit', eyes: 'dot', mouth: 'flat', lookX: .6 });
    } },
  // S11 「随着你离去 快乐渺无音讯」回忆闪回：她走远（金色调）
  { t0: 69.10, t1: 75.81, scene: 'street', tint: '#FFD166', tintA: 0.14,
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      const p = seg(lt, .6, 6.2);
      figure(pc, lerp(196, 300, easeIO(p)), 158, 2, { sex: 'f', view: 'back', pose: 'walk', walk: t * 5.5 });
      figure(pc, 92, 158, 2, { sex: 'm', eyes: 'teary', mouth: 'flat', tear: .5, lookX: .8 });
      SCENES.street.fg(pc, t);
    } },
  // S12 「随往事淡去 随梦境睡去」躺下，zzz，房间层层暗
  { t0: 75.81, t1: 81.74, scene: 'room',
    crop(lt) { return focus(lt, 5.9, 82, 116, 1.38, .05); },
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      figure(pc, 66, 140, 2, { sex: 'm', pose: 'sit', eyes: 'asleep', mouth: 'tiny',
        emote: 'zzz', emoteK: seg(lt, 1, 2), emoteUp: 2, aL: .5, aR: .5, lookX: -.5 });
      shadeAround(pc, Math.min(.48, lt * .12));
    } },
  // S13 「随麻痹的心逐渐远去」抽远→一点；窗里先梦见海
  { t0: 81.74, t1: 86.53, scene: 'room',
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      killLamp(pc);
      if (lt > 2.6) winSea(pc);                  // 梦见海——下一镜兑现
      shadeAround(pc, Math.min(.56, .3 + lt * .08));
      figure(pc, 64, 148, 1, { sex: 'm', pose: 'sit', eyes: 'asleep', mouth: 'tiny' });
      const fl = seg(lt, 4.3, 4.79);
      if (fl > 0) { pc.fillStyle = PAL.paper; pc.globalAlpha = fl * .9; pc.fillRect(0, 0, 320, 180); pc.globalAlpha = 1; }
    } },

  // ============ 副歌 1 · 回忆爆发 86.53–130.97（金色调） ============
  // S14 「我好想你 好想你」大字① + 两人背影看海
  { t0: 86.53, t1: 93.01, scene: 'sea', tint: '#FFD166', tintA: 0.13, hit: 86.53, hitMag: 9, hitFlash: .55,
    draw(pc, lt, shot, t) {
      SCENES.sea.draw(pc, t);
      figure(pc, 116, 148, 2, { sex: 'm', view: 'back' });
      figure(pc, 158, 148, 2, { sex: 'f', view: 'back',
        emote: lt > 1.5 ? 'heart' : null, emoteK: seg(lt, 1.5, 2.7), emoteCol: PAL.rose });
    } },
  // S15 「却不露痕迹」对望微笑，四边 dither 开始啃进来
  { t0: 93.01, t1: 99.57, scene: 'sea', tint: '#FFD166', tintA: 0.13,
    draw(pc, lt, shot, t) {
      SCENES.sea.draw(pc, t);
      const turned = lt > 1.2;
      figure(pc, 116, 148, 2, { sex: 'm', view: turned ? 'front' : 'back',
        eyes: turned ? 'happy' : 'normal', mouth: turned ? 'smile' : 'flat' });
      figure(pc, 158, 148, 2, { sex: 'f', view: turned ? 'front' : 'back',
        eyes: turned ? 'shy' : 'normal', mouth: turned ? 'tiny' : 'flat', blush: turned ? .8 : 0 });
      vignette(pc, Math.min(.55, Math.max(0, (lt - 2.5)) * .18));
    } },
  // S16 「我还踮着脚思念」天台：她踮脚，他看她笑
  { t0: 99.57, t1: 105.91, scene: 'rooftop', tint: '#FFD166', tintA: 0.12,
    draw(pc, lt, shot, t) {
      SCENES.rooftop.draw(pc, t);
      const hop = -Math.abs(Math.sin(lt * 3.2)) * 3;
      figure(pc, 150, 152, 2, { sex: 'f', dy: hop, aR: 2, eyes: 'happy', mouth: 'smile', lookY: -.6 });
      figure(pc, 196, 152, 2, { sex: 'm', eyes: 'happy', mouth: 'smile', lookX: -.5 });
    } },
  // S17 「我还任记忆盘旋」走马灯：4 段回忆每 1.6s 一转
  { t0: 105.91, t1: 112.26, scene: 'montage', tint: '#FFD166', tintA: 0.12,
    draw(pc, lt) {
      const scenes = [['classroom', 152], ['train', 156], ['store', 158], ['rooftop', 152]];
      montage(pc, lt, 6.35, scenes);
    } },
  // S18 「我还闭着眼流泪」现实：抱膝，泪一串串
  { t0: 112.26, t1: 118.45, scene: 'emptyroom',
    draw(pc, lt) {
      SCENES.emptyroom.draw(pc, lt);
      figure(pc, 240, 154, 2, { sex: 'm', pose: 'crouch', eyes: 'cry', mouth: 'open', tear: 1, aL: 2, aR: 2 });
      const tp = lt % 1.2;
      if (lt > 1 && tp < .45) { pc.fillStyle = PAL.mint; pc.fillRect(236, 136 + tp * 40, 1, 2); }
      vignette(pc, .45);
    } },
  // S19 「我还装作无所谓」灯全开+手机面瘫，头顶 rose 心慢升
  { t0: 118.45, t1: 124.36, scene: 'room',
    crop(lt) { return focus(lt, 5.9, 104, 122, 1.34, .045); },
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      EVENTS.phone.run(pc, seg(lt, .2, 1.7) * 1.5, { sx: 112, sy: 140, sc: .62 });
      figure(pc, 92, 150, 2, { sex: 'm', eyes: 'dot', mouth: 'side', lookX: .7,
        emote: lt > 3 ? 'heart' : null, emoteK: seg(lt, 3, 4.6), emoteCol: PAL.rose, emoteUp: 6 });
    } },
  // S20 「我好想你 好想你」大字② + 走廊尽头，他没走过去
  { t0: 124.36, t1: 130.97, scene: 'corridor', tint: '#FFD166', tintA: 0.1, hit: 124.36, hitMag: 7,
    draw(pc, lt, shot, t) {
      SCENES.corridor.draw(pc, t);
      const p = seg(lt, .4, 2.8), x = lerp(212, 190, easeIO(p));
      figure(pc, p < 1 ? x : 190, 158, 2, { sex: 'm', view: 'back', pose: p < 1 ? 'walk' : 'stand', walk: t * 5 });
      glow(pc, 160, 95, 52, 62, PAL.gold, .34 + .46 * seg(lt, 0, 6));
    } },

  // ============ 间奏 · 现实回程 130.97–164.77 ============
  // S21 车厢：光条刮过，他一格都没看
  { t0: 130.97, t1: 139.5, scene: 'train',
    draw(pc, lt, shot, t) {
      SCENES.train.draw(pc, t);
      figure(pc, 140, 120, 2, { sex: 'm', pose: 'sit', eyes: 'dot', mouth: 'flat', lookY: .2 });
    } },
  // S22 便利店：冷光看货架，一道影子掠过
  { t0: 139.5, t1: 148.0, scene: 'store',
    draw(pc, lt, shot, t) {
      SCENES.store.draw(pc, t);
      figure(pc, 120, 158, 2, { sex: 'm', eyes: 'dot', mouth: 'flat', lookX: .8,
        emote: lt > 2 ? 'dots' : null, emoteK: seg(lt, 2, 3) });
      if (lt > 4.4) EVENTS.shadow.run(pc, lt - 4.4, { sy: 162 });
    } },
  // S23 路灯：雨里往回走，穿灯光圈
  { t0: 148.0, t1: 157.0, scene: 'lamp',
    draw(pc, lt, shot, t) {
      SCENES.lamp.draw(pc, t);
      const p = seg(lt, .3, 8.4), x = lerp(56, 210, easeIO(p));
      figure(pc, x, 156, 2, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5 });
      SCENES.lamp.fg(pc, t);
    } },
  // S24 楼梯间：熟练上楼→到门前转身，深呼吸
  { t0: 157.0, t1: 164.77, scene: 'stairs',
    draw(pc, lt, shot, t) {
      SCENES.stairs.draw(pc, t);
      if (lt < 5.4) {
        const k = seg(lt, .3, 5.2) * 7.2, i = Math.floor(k), fr = k - i;
        figure(pc, 110 + (i + fr) * 14, 160 - (i + fr) * 12, 2, { sex: 'm', pose: 'walk', walk: t * 5, eyes: 'narrow', mouth: 'flat' });
      } else {
        figure(pc, 216, 60, 2, { sex: 'm', eyes: 'closed', mouth: 'flat', dy: -Math.round(Math.abs(Math.sin(lt * 2)) * 1) });
      }
    } },

  // ============ 主歌 2 · 冬·雪 164.77–212.82（逐句对位升级） ============
  // S25 「开了灯」窗外下雪，灯闪两下才亮，他背对灯
  { t0: 164.77, t1: 169.02, scene: 'room',
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      const on = lt < 1.3 ? (Math.floor(lt * 5) % 2 === 0) : true;
      if (!on) killLamp(pc);
      winSnow(pc, lt); sillSnow(pc, Math.min(5, lt * 1.6));
      figure(pc, 208, 150, 2, { sex: 'm', eyes: 'closed', mouth: 'flat', lookX: -.8 });
    } },
  // S26 「偌大的房 寂寞的床」窗前背影看雪，床空被齐
  { t0: 169.02, t1: 177.32, scene: 'room',
    crop(lt) { return focus(lt, 8.3, 206, 112, 1.3, .045); },
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      winSnow(pc, lt); sillSnow(pc, 5);
      figure(pc, 224, 150, 2, { sex: 'm', view: 'back', dy: Math.round(Math.sin(lt * 1.4)) });
    } },
  // S27 「关了灯」熟练版：灯灭，走向床一步不停
  { t0: 177.32, t1: 181.59, scene: 'room',
    draw(pc, lt, shot, t) {
      SCENES.room.draw(pc, t);
      killLamp(pc); shadeAround(pc, .45);
      const p = seg(lt, .2, 4.0), x = lerp(224, 88, easeIO(p));
      figure(pc, x, 150, 2, { sex: 'm', pose: 'walk', walk: t * 5.5, eyes: 'narrow', mouth: 'flat' });
    } },
  // S28 「心里的伤」床沿掏手机：亮一行 rose，看两秒扣下
  { t0: 181.59, t1: 188.01, scene: 'room',
    crop(lt) { return focus(lt, 6.4, 88, 126, 1.38, .05); },
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      killLamp(pc); shadeAround(pc, .4);
      if (lt < 1.2) EVENTS.phone.run(pc, seg(lt, 0, 1.2) * 1.5, { sx: 96, sy: 150 });
      else if (lt < 4.2) EVENTS.phone.run(pc, 1.5, { sx: 96, sy: 150 });
      else { pc.fillStyle = PAL.ink; pc.fillRect(90, 128, 12, 20); }   // 扣下的手机
      figure(pc, 74, 144, 2, { sex: 'm', pose: 'sit', eyes: lt < 4.2 ? 'teary' : 'closed', mouth: 'frown',
        tear: .5, lookX: .5, lookY: .4 });
      winSnow(pc, lt);
    } },
  // S29 「生命 随年月流去」窗外雪夜连转，窗台雪三级长高，他睁眼到天亮
  { t0: 188.01, t1: 195.41, scene: 'room',
    crop(lt) { return focus(lt, 7.4, 96, 116, 1.34, .05); },
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      killLamp(pc); shadeAround(pc, .4);
      winBlink(pc, lt); winSnow(pc, lt);
      sillSnow(pc, Math.min(9, 2 + Math.floor(lt / 2.4) * 2.5));
      figure(pc, 66, 140, 2, { sex: 'm', pose: 'sit', eyes: 'dot', mouth: 'flat', lookY: -.3 });
    } },
  // S30 「随着你离去」回忆闪回：车厢并肩，她靠上肩（金色调）
  { t0: 195.41, t1: 202.11, scene: 'train', tint: '#FFD166', tintA: 0.14,
    draw(pc, lt, shot, t) {
      SCENES.train.draw(pc, t);
      figure(pc, 136, 120, 2, { sex: 'm', pose: 'sit', eyes: 'closed', mouth: 'smile' });
      figure(pc, 172, 120, 2, { sex: 'f', pose: 'sit', eyes: 'closed', mouth: 'tiny', lean: -2, blush: .5 });
    } },
  // S31 「随往事淡去 随梦境睡去」侧躺抱手机，枕边 teal 微光
  { t0: 202.11, t1: 208.10, scene: 'room',
    crop(lt) { return focus(lt, 6, 84, 122, 1.4, .045); },
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      killLamp(pc); shadeAround(pc, Math.min(.5, .2 + lt * .08));
      figure(pc, 66, 140, 2, { sex: 'm', pose: 'sit', eyes: 'asleep', mouth: 'tiny', lookX: -.4 });
      R(pc, 80, 128, 6, 4, PAL.teal);
      dith(pc, 76, 124, 14, 12, PAL.ink, PAL.teal, .18);
    } },
  // S32 「随麻痹的心逐渐远去」抽远；210s 台灯自己熄了
  { t0: 208.10, t1: 212.82, scene: 'room',
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      if (lt > 1.8) killLamp(pc);                 // 灯自己灭
      shadeAround(pc, Math.min(.54, .2 + lt * .1));
      figure(pc, 64, 148, 1, { sex: 'm', pose: 'sit', eyes: 'asleep', mouth: 'tiny' });
      const fl = seg(lt, 4.24, 4.72);
      if (fl > 0) { pc.fillStyle = PAL.paper; pc.globalAlpha = fl * .9; pc.fillRect(0, 0, 320, 180); pc.globalAlpha = 1; }
    } },

  // ============ 副歌 2 · 更碎的回忆 212.82–260.41 ============
  // S33 「我好想你 好想你」海边只剩他；空位上的心闪两下熄了
  { t0: 212.82, t1: 219.33, scene: 'sea', tint: '#FFD166', tintA: 0.13, hit: 212.82, hitMag: 9, hitFlash: .55,
    draw(pc, lt, shot, t) {
      SCENES.sea.draw(pc, t);
      figure(pc, 132, 148, 2, { sex: 'm', view: 'back' });
      if (lt > 2.7 && lt < 4.5 && Math.floor(lt * 3) % 2 === 0) drawHeart(pc, 180, 100, 1, PAL.rose, 1);
    } },
  // S34 「却不露痕迹」天台：别人的烟花，他脸上什么都没有
  { t0: 219.33, t1: 225.92, scene: 'rooftop', tint: '#FFD166', tintA: 0.1,
    draw(pc, lt, shot, t) {
      SCENES.rooftop.draw(pc, t);
      figure(pc, 160, 152, 2, { sex: 'm', eyes: 'narrow', mouth: 'side', lookY: -.5 });
      if (lt > 1.7 && lt < 2.9) EVENTS.firework.run(pc, lt - 1.7, { sx: 90, sy: 112, col: PAL.gold });
      if (lt > 4.2 && lt < 5.4) EVENTS.firework.run(pc, lt - 4.2, { sx: 232, sy: 106, col: PAL.gold });
    } },
  // S35 「我还踮着脚思念」雪地：踩着脚印走，尽头停下转身
  { t0: 225.92, t1: 232.16, scene: 'snow',
    draw(pc, lt, shot, t) {
      SCENES.snow.draw(pc, t);
      const p = seg(lt, .4, 5.2), x = lerp(120, 190, easeIO(p));
      if (lt < 5.6) figure(pc, x, 150, 2, { sex: 'm', view: 'back', pose: 'walk', walk: t * 4.5 });
      else figure(pc, 190, 150, 2, { sex: 'm', eyes: 'narrow', mouth: 'frown', lookY: .6 });
      SCENES.snow.fg(pc, t);
    } },
  // S36 「我还任记忆盘旋」走马灯·褪色：每个地方只剩他一个人
  { t0: 232.16, t1: 238.38, scene: 'montage', tint: '#FFD166', tintA: 0.1,
    draw(pc, lt) {
      const scenes = [['sea', 148], ['rooftop', 152], ['classroom', 152], ['store', 158]];
      montage(pc, lt, 6.22, scenes, { solo: true });
    } },
  // S37 「我还闭着眼流泪」窗里窗外：雪水往下淌
  { t0: 238.38, t1: 244.78, scene: 'emptyroom',
    draw(pc, lt) {
      SCENES.emptyroom.draw(pc, lt);
      winSnow(pc, lt, 108, 26, 104, 84);          // emptyroom 的窗
      figure(pc, 196, 154, 2, { sex: 'm', pose: 'crouch', eyes: 'cry', mouth: 'open', tear: 1 });
      const tp = lt % 1.4;
      if (lt > 1.2 && tp < .5) { pc.fillStyle = PAL.mint; pc.fillRect(192, 136 + tp * 36, 1, 2); }
      vignette(pc, .3);
    } },
  // S38 「我还装作无所谓」迎面路人：错身一笑，过后垮掉
  { t0: 244.78, t1: 253.93, scene: 'street',
    draw(pc, lt, shot, t) {
      SCENES.street.draw(pc, t);
      const p = seg(lt, .3, 3.4), x = lerp(60, 156, easeIO(p));
      figure(pc, 268 - p * 100, 158, 2, { sex: 'm', pose: 'walk', walk: t * 6, col: { coat: 'dusk', inner: 'haze' } });
      if (lt < 3.4) figure(pc, x, 158, 2, { sex: 'm', pose: 'walk', walk: t * 6,
        eyes: 'normal', mouth: 'flat', aR: lt > 1.2 && lt < 3 ? 2 : .3 });
      else figure(pc, 156, 158, 2, { sex: 'm', eyes: 'narrow', mouth: 'frown', dy: 1, lookY: .4 });
      SCENES.street.fg(pc, t);
    } },
  // S39 「我好想你 好想你」大字③ rose + 心升起两秒碎成像素屑
  { t0: 253.93, t1: 260.41, scene: 'emptyroom', tint: '#E8556D', tintA: 0.06,
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
      vignette(pc, .3);
    } },

  // ============ 尾段 · 秘密与存档 260.41–292.0 ============
  // S40 「却欺骗自己」全屋只剩台灯一圈光，他坐在光圈边
  { t0: 260.41, t1: 266.50, scene: 'room',
    crop(lt) { return focus(lt, 6.1, 118, 122, 1.32, .04); },
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      shade(pc, .42); lampGlow(pc, 1);
      figure(pc, 96, 150, 2, { sex: 'm', pose: 'sit', eyes: 'closed', mouth: 'flat', lookX: .6 });
    } },
  // S41 「我好想你 好想你」大字④ + 灯光呼吸，他抬手虚握
  { t0: 266.50, t1: 272.98, scene: 'room', hit: 266.50, hitMag: 6,
    crop(lt) { return focus(lt, 6.5, 116, 124, 1.36, .05); },
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      shade(pc, .42); lampGlow(pc, 1 + .18 * (Math.floor(lt * 2) % 2));
      figure(pc, 102, 150, 2, { sex: 'm', eyes: 'closed', mouth: 'flat', aR: 1.1 + .15 * Math.sin(lt * 2), dy: Math.round(Math.sin(lt * 1.6)) });
    } },
  // S42 「就当作秘密」手机扣下；对空房挤出 0.8s 的笑
  { t0: 272.98, t1: 279.10, scene: 'room',
    crop(lt) { return focus(lt, 6.1, 112, 124, 1.34, .04); },
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      shade(pc, .35); lampGlow(pc, 1);
      if (lt < 1) EVENTS.phone.run(pc, seg(lt, 0, 1) * 1.5, { sx: 128, sy: 141 });
      else { pc.fillStyle = PAL.ink; pc.fillRect(122, 128, 12, 20); }  // 扣下
      const smile = lt > 1.6 && lt < 2.4 ? backOut(seg(lt, 1.6, 1.9)) : 0;
      figure(pc, 96, 150, 2, { sex: 'm', eyes: smile > .5 ? 'happy' : 'narrow', mouth: smile > .5 ? 'smile' : 'flat', lookX: .3 });
    } },
  // S43 「我好想你 好想你」大字⑤ + 走廊：这次一直走，走进光里
  { t0: 279.10, t1: 285.74, scene: 'corridor', tint: '#FFD166', tintA: 0.12, hit: 279.10, hitMag: 6,
    draw(pc, lt, shot, t) {
      SCENES.corridor.draw(pc, t);
      const p = seg(lt, .3, 5.6), x = lerp(206, 164, easeIO(p));
      figure(pc, x, 158, 2, { sex: 'm', view: 'back', pose: 'walk', walk: t * 5.5 });
      glow(pc, 160, 95, 58, 68, PAL.gold, .38 + .5 * seg(lt, 0, 5.6));
      const fl = seg(lt, 5.9, 6.5);
      if (fl > 0) { pc.fillStyle = PAL.paper; pc.globalAlpha = fl * .85; pc.fillRect(0, 0, 320, 180); pc.globalAlpha = 1; }
    } },
  // S44 「就深藏在心」存档：gold 进度条填满 → 心口一点光
  { t0: 285.74, t1: 292.0, scene: 'room',
    draw(pc, lt) {
      SCENES.room.draw(pc, lt);
      shade(pc, .22 + seg(lt, 4.5, 6.2) * .38);
      figure(pc, 160, 150, 2, { sex: 'm', eyes: 'closed', mouth: 'flat', aR: .5, lookY: .3 });
      const p = seg(lt, .4, 5.2);
      if (p < 1) {                                  // 存档条：画面顶部的 RPG 存档 HUD
        R(pc, 89, 22, 142, 18, PAL.ink);
        R(pc, 91, 24, 138, 14, PAL.night);
        R(pc, 92, 25, Math.round(136 * p), 12, PAL.gold);
        drawHeart(pc, 92 + 136 * p, 26, 1, PAL.gold, 1);
      } else {                                      // 存完：条收起，只剩心口光点
        const w = Math.max(0, Math.round(136 * (1 - seg(lt, 5.2, 5.8))));
        if (w > 0) {
          R(pc, 89, 22, 142, 18, PAL.ink);
          R(pc, 91, 24, 138, 14, PAL.night);
          R(pc, 92, 25, w, 12, PAL.gold);
        }
        if (lt > 5.6 && lt < 6.9 && Math.floor(lt * 3) % 2 === 0) { PX(pc, 160, 132, PAL.gold); PX(pc, 160, 133, PAL.gold); }
      }
    } },

  // ============ 尾奏 · 走进雪夜 292.0–329.2 ============
  // S45 出门：走进雪里，身后那扇亮窗就是他的房间
  { t0: 292.0, t1: 302.0, scene: 'snow',
    draw(pc, lt, shot, t) {
      SCENES.snow.draw(pc, t);
      const p = seg(lt, .4, 9), x = lerp(100, 172, easeIO(p));
      figure(pc, x, 150, 2, { sex: 'm', view: 'back', pose: 'walk', walk: t * 4.5 });
      SCENES.snow.fg(pc, t);
    } },
  // S46 回望：走远→停下回头看那扇窗→再走
  { t0: 302.0, t1: 312.0, scene: 'snow',
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
  // S47 片名回归：他走成小点，身后多出一串并肩的脚印
  { t0: 312.0, t1: 325.5, scene: 'snow',
    draw(pc, lt, shot, t) {
      SCENES.snow.draw(pc, t);
      const p = seg(lt, 0, 12), x = lerp(236, 282, easeIO(p));
      figure(pc, x, 146, 1, { sex: 'm', view: 'back', pose: 'walk', walk: t * 4 });
      const fp = Math.floor(lt / .5);                // 第二串脚印渐渐显形
      for (let i = 0; i < Math.min(8, fp); i++) {
        R(pc, 210 + i * 9, 132 + i * 3, 2, 1, PAL.pale);
        R(pc, 213 + i * 9, 133 + i * 3, 2, 1, PAL.haze);
      }
      shade(pc, Math.min(.55, .18 + lt * .03));
      SCENES.snow.fg(pc, t);
    } },
  // S48 关机：黑场里最后一枚 gold 光点闪两下——熄灭
  { t0: 325.5, t1: 329.2, scene: 'black',
    draw(pc, lt) {
      R(pc, 0, 0, 320, 180, PAL.ink);
      if (lt < 2.6 && Math.floor(lt * 3) % 2 === 0) { PX(pc, 160, 90, PAL.gold); PX(pc, 160, 91, PAL.gold); }
    } },
  ],

  // ============ 字幕 ============
  // 常规句：全宽暗带 + 逐字弹入，关键词 rose 放大（产线 subtitle.js）
  // 大字 5 次（band:false）：「我好想你」本身就是视觉事件
  subs: buildSubs(),
};

// ---------- 分镜辅助（依赖 rig/scene/events 的全局件） ----------
// 取景：以 (cx,cy) 为画面中心，base>1 = 特写（240 宽 = 8 倍像素质感），z = 全镜推近量
function focus(lt, dur, cx, cy, base = 1, z = .05) {
  const p = Math.min(1, Math.max(0, lt / dur));
  const s = base * (1 - z * p);
  const w = 320 / s, h = 180 / s;
  const x = Math.min(Math.max(0, cx - w / 2), 320 - w);   // 不许出画
  const y = Math.min(Math.max(0, cy - h / 2), 180 - h);
  return [x, y, w, h];
}
// 压暗 / 暗角 / 光晕 全部由 scene.js 提供（shade / shadeRect / vignette / glow）：
// 压暗全屏但保留窗（room 窗 176,26,108,82），窗沿 16px 羽化——不然会有一条死黑的横线
function shadeAround(c, k) {
  if (k <= 0) return;
  shadeMask(c, (x, y) => {
    const dx = Math.max(0, Math.max(176 - x, x - 284));
    const dy = Math.max(0, Math.max(26 - y, y - 108));
    const d = Math.max(dx, dy);
    return k * Math.min(1, d / 16);
  });
}
// 抹掉 room 台灯的 gold（灭灯）：把灯罩+光晕整块盖掉
function killLamp(c) {
  R(c, 94, 86, 74, 46, PAL.night);          // 墙面（盖掉灯罩与光晕上缘）
  R(c, 96, 130, 60, 4, PAL.navy);           // 桌面
  R(c, 96, 130, 60, 1, PAL.dusk);
  R(c, 94, 134, 74, 16, PAL.ink);           // 桌下暗部
  R(c, 129, 118, 3, 11, PAL.navy);          // 灯杆还在——灯只是没亮
  R(c, 126, 129, 10, 2, PAL.night);
}
// 重画台灯光（S40/41 只剩灯）
function lampGlow(c, k) {
  for (let i = 0; i < 7; i++) { const w = 12 + i * 2; R(c, 130 - w / 2, 108 + i, w, 1, PAL.gold); }
  R(c, 117, 113, 26, 1, PAL.haze);
  R(c, 123, 114, 15, 2, PAL.paper);
  glow(c, 130, 118, 34 * k, 30 * k, PAL.gold, .45 * k);
  glow(c, 130, 130, 22, 12, PAL.gold, .5 * k);
}
// room 窗里闪灯（流年）
function winBlink(c, t) {
  for (let i = 0; i < 6; i++) {
    if ((t * .8 + i * 1.37) % 3 < 1.5) R(c, 182 + (i * 17) % 94, 32 + (i * 23) % 56, 2, 3, PAL.haze);
  }
}
// 窗里下雪（默认 room 窗，可传其它场景的窗矩形）
function winSnow(c, t, wx = 176, wy = 26, ww = 108, wh = 82) {
  c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip();
  snowFx(c, t, 26, PAL.pale);
  c.restore();
}
// room 窗里梦见海（S13 副歌前预兆）
function winSea(c) {
  const wx = 176, wy = 26, ww = 108, wh = 82;
  vgrad(c, wx, wy, ww, 40, PAL.dusk, PAL.haze);
  R(c, wx, wy + 40, ww, wh - 40, PAL.navy);
  for (let y = wy + 42; y < wy + wh; y += 3) dith(c, wx, y, ww, 2, PAL.navy, PAL.dusk, .4);
  disc(c, wx + 78, wy + 16, 6, PAL.pale);
  for (let y = wy + 44; y < wy + wh - 6; y += 4) dith(c, wx + 70, y, 16, 1, PAL.navy, PAL.pale, .5);
  PX(c, wx + 22, wy + 38, PAL.gold);              // 船灯
}
// 窗台积雪（S25 起）
function sillSnow(c, h) { if (h > 0) R(c, 176, 108 - h, 108, h, PAL.pale); }
// 四边 dither 暗角（回忆将醒）
function vignette(c, k) {
  if (k <= 0) return;
  shadeRect(c, 0, 0, 320, 14, k); shadeRect(c, 0, 166, 320, 14, k);
  shadeRect(c, 0, 0, 16, 180, k); shadeRect(c, 304, 0, 16, 180, k);
}
// 走马灯：场景轮换 + 边缘快闪 + 逐渐变暗（solo=只剩一个人）
function montage(c, lt, dur, list, opt = {}) {
  const per = dur / list.length;
  const i = Math.min(list.length - 1, Math.floor(lt / per));
  const t2 = lt - i * per;
  const [name, gy] = list[i];
  SCENES[name].draw(c, t2);
  if (opt.solo) figure(c, 160, gy, 2, { sex: 'm', eyes: 'dot', mouth: 'flat' });
  else {
    figure(c, 144, gy, 2, { sex: 'm', eyes: 'happy', mouth: 'smile' });
    figure(c, 178, gy, 2, { sex: 'f', eyes: 'happy', mouth: 'smile', blush: .6 });
  }
  const edge = Math.min(t2, per - t2);             // 换段快闪
  if (edge < .14) shade(c, .5 * (1 - edge / .14));
  shade(c, .12 + i * .1);                          // 一圈比一圈暗
}

// ---------- 字幕 ----------
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
    [86.53, '我好想你 好想你', [], { size: 175, y: 352 }],
    [93.01, '却不露痕迹', ['痕迹']],
    [99.57, '我还踮着脚思念', ['踮着脚']],
    [105.91, '我还任记忆盘旋', ['盘旋']],
    [112.26, '我还闭着眼流泪', ['流泪']],
    [118.45, '我还装作无所谓', ['无所谓']],
    [124.36, '我好想你 好想你', [], { size: 175, y: 400 }],
    [130.97, '却欺骗自己', ['欺骗']],
    [164.77, '开了灯 眼前的模样', ['开了灯']],
    [169.02, '偌大的房 寂寞的床', ['寂寞']],
    [177.32, '关了灯 全都一个样', ['关了灯']],
    [181.59, '心里的伤 无法分享', ['伤']],
    [188.01, '生命 随年月流去 随白发老去', ['流去', '老去']],
    [195.41, '随着你离去 快乐渺无音讯', ['离去', '音讯']],
    [202.11, '随往事淡去 随梦境睡去', ['淡去', '睡去']],
    [208.10, '随麻痹的心逐渐远去', ['远去']],
    [212.82, '我好想你 好想你', [], { size: 175, y: 352 }],
    [219.33, '却不露痕迹', ['痕迹']],
    [225.92, '我还踮着脚思念', ['踮着脚']],
    [232.16, '我还任记忆盘旋', ['盘旋']],
    [238.38, '我还闭着眼流泪', ['流泪']],
    [244.78, '我还装作无所谓', ['无所谓']],
    [253.93, '我好想你 好想你', [], { size: 175, y: 420, color: '#E8556D' }],
    [260.41, '却欺骗自己', ['欺骗']],
    [266.50, '我好想你 好想你', [], { size: 150, y: 380 }],
    [272.98, '就当作秘密', ['秘密']],
    [279.10, '我好想你 好想你', [], { size: 150, y: 380 }],
    [285.74, '就深藏在心', ['深藏', '心']],
  ];
  const subs = [];
  subs.push({ t0: .6, t1: 6.0, text: '我好想你', size: 210, y: 430, color: '#FFD166', band: false, kScale: .42 });
  L.forEach((l, i) => {
    // 句尾不能简单取"下一句的开唱时间"——间奏那 34s 会把上一句钉在画面上。
    // 按字数估一个演唱长度，再和下一句取小。
    const n = [...l[1].replace(/\s/g, '')].length;
    const est = Math.min(9.0, Math.max(3.4, n * 0.95 + 1.8));
    const end = i < L.length - 1 ? Math.min(L[i + 1][0], l[0] + est) : 292.0;
    const t1 = Math.max(l[0] + 1.6, end);
    const big = l[3] || null;
    subs.push(big
      ? { t0: l[0], t1, text: l[1], kw: l[2], band: false, color: big.color || '#FFD166', size: big.size, y: big.y, kScale: .28 }
      : { t0: l[0], t1, text: l[1], kw: l[2] });
  });
  subs.push({ t0: 313.0, t1: 321.0, text: '我好想你', size: 140, y: 400, color: '#C9C6DD', band: false });
  return subs;
}
