// _skeletontest.js — 唯一目的：验证 SKILL.md 第二节"spec 骨架"照抄即可运行
(function () {
  window.SPEC = {
    fps: 24, duration: 2,
    shots: [{
      t0: 0, t1: 2, scene: 'beach', vig: .26,
      draw(pc, lt) {
        pc.fillStyle = P.core.night[2]; pc.fillRect(0, 0, 320, 180);
        FIG.back(pc, { cx: 137, fy: 152 });
        FIG.turn(pc, { cx: 175, fy: 152 });
      },
    }],
    subs: [], hud() {},
  };
})();
