// testclip.js — 10 秒测试片：验证 rig + 场景 + 事件 串联
// 无音频、无字幕，纯看动态观感。24fps × 10s = 240 帧，320×180 内部分辨率。
// 分镜（10 秒）：
//  0.0–2.0  路灯场景，两人并肩走（walk + rain）
//  2.0–4.0  空房场景，女主独自坐地（sit + face_sad + teardrop）
//  4.0–6.0  海边场景，男主抬头望月（lookup），女主缓步走来（walk）
//  6.0–8.0  天台场景，烟花炸开（firework + shake），两人抬头
//  8.0–10.0 雪地场景，拥抱（hug + snow），淡出

function drawTestClip(c, t) {
  const S = 2;   // 320×180 下角色放大 2 倍 = 80px 高

  // ===== 镜 1：路灯（0–2s）=====
  if (t < 2.0) {
    SCENES.lamp.draw(c, t);
    const p = t / 2;
    const x = lerp(40, 180, p);
    figure(c, x - 18, 156, S, { sex: 'm', pose: 'walk', walk: t * 7, aL: .3, aR: .3, eyes: 'normal', mouth: 'flat' });
    figure(c, x + 18, 156, S, { sex: 'f', pose: 'walk', walk: t * 7, aL: .3, aR: .3, eyes: 'happy', mouth: 'smile' });
    SCENES.lamp.fg(c, t);
    const fadeOut = seg(t, 1.8, 2.0);
    if (fadeOut > 0) { c.fillStyle = PAL.ink; c.globalAlpha = fadeOut; c.fillRect(0, 0, 320, 180); c.globalAlpha = 1; }
  }
  // ===== 镜 2：空房（2–4s）=====
  else if (t < 4.0) {
    SCENES.emptyroom.draw(c, t);
    const lt = t - 2;
    figure(c, 160, 154, S, { sex: 'f', pose: 'sit', eyes: 'cry', mouth: 'frown', tear: .7, lookY: .6, aL: .6, aR: .6 });
    const p = seg(lt, .5, 1.5);
    if (p > 0 && p < 1) { c.fillStyle = PAL.mint; c.fillRect(158, 154 - 40 + p * 30, 1, 2); }
    const flashK = pulse(lt, 1.7, 1.9);
    if (flashK > 0) { c.fillStyle = PAL.paper; c.globalAlpha = flashK * .7; c.fillRect(0, 0, 320, 180); c.globalAlpha = 1; }
  }
  // ===== 镜 3：海边（4–6s）=====
  else if (t < 6.0) {
    SCENES.sea.draw(c, t);
    const lt = t - 4;
    figure(c, 150, 148, S, { sex: 'm', eyes: 'up', mouth: 'tiny', lookY: -.6 });
    if (lt > .8) {
      const wp = seg(lt, .8, 2);
      const wx = lerp(290, 210, easeOut(wp));
      figure(c, wx, 148, S, { sex: 'f', pose: 'walk', walk: lt * 5, aL: .3, aR: .3, eyes: 'normal', mouth: 'flat' });
    }
  }
  // ===== 镜 4：天台（6–8s）=====
  else if (t < 8.0) {
    SCENES.rooftop.draw(c, t);
    const lt = t - 6;
    figure(c, 140, 152, S, { sex: 'm', eyes: 'wide', mouth: 'o', lookY: -.5 });
    figure(c, 190, 152, S, { sex: 'f', eyes: 'wide', mouth: 'smile', lookY: -.5 });
    for (let i = 0; i < 3; i++) {
      const ft = lt - (.3 + i * .9);
      if (ft >= 0 && ft < 1.2) {
        const p = ft / 1.2;
        const r = 8 + easeOut(p) * 40;
        const cx = 120 + i * 80, cy = 40 + (i % 2) * 22;
        c.fillStyle = i % 2 ? PAL.rose : PAL.gold;
        for (let a = 0; a < 14; a++) {
          const ang = a / 14 * Math.PI * 2;
          c.fillRect(Math.round(cx + Math.cos(ang) * r), Math.round(cy + Math.sin(ang) * r), 2, 2);
        }
      }
    }
  }
  // ===== 镜 5：雪地（8–10s）=====
  else {
    SCENES.snow.draw(c, t);
    const lt = t - 8;
    const p = seg(lt, 0, 1.2);
    const gap = lerp(40, 12, easeOut(p));
    figure(c, 160 - gap / 2, 150, S, { sex: 'm', eyes: 'closed', mouth: 'smile', aL: 1.5, aR: 1.5, lean: -2 });
    figure(c, 160 + gap / 2, 150, S, { sex: 'f', eyes: 'cry', mouth: 'smile', tear: .5, aL: 1.5, aR: 1.5, lean: 2 });
    SCENES.snow.fg(c, t);
    const fadeOut = seg(lt, 1.5, 2.0);
    if (fadeOut > 0) { c.fillStyle = PAL.ink; c.globalAlpha = fadeOut; c.fillRect(0, 0, 320, 180); c.globalAlpha = 1; }
  }
}
