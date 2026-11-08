// _figtest.js — 复用模块像素一致性验证（不用于出片）
// 用 FIG.faceBg + FIG.faceFront 重画 ys_face2 的同一帧，psnr 对比应与原 spec 完全一致。
(function () {
  window.SPEC = {
    fps: 24, duration: 4.0,
    grade: 'brightness(1.03) saturate(1.04) contrast(1.04)',
    fadeIn: 0, fadeOut: 0,
    shots: [{
      t0: 0, t1: 4.0, scene: 'face', vig: .22,
      draw(pc) {
        FIG.faceBg(pc);
        FIG.faceFront(pc, { cx: 160, top: 14 });
      },
    }],
    subs: [],
    hud() {},
  };
})();
