// _figtest2.js — 小人物两式目视验证（不用于出片）
// 验证 FIG.back / FIG.turn 的形态：圆头（非方发罩）、垂发位置、裙/鞋、脚底对齐。
(function () {
  window.SPEC = {
    fps: 24, duration: 1.0,
    shots: [{
      t0: 0, t1: 1.0, scene: 'fig', vig: 0,
      draw(pc) {
        // 中性底（不是场景色，方便看轮廓）
        pc.fillStyle = '#8FA8C0'; pc.fillRect(0, 0, 320, 180);
        pc.fillStyle = '#7E96AE'; pc.fillRect(0, 152, 320, 28);
        // 脚底线（校验 fy=152）
        pc.fillStyle = '#E05C48'; pc.fillRect(0, 152, 320, 1);
        FIG.back(pc, { cx: 137, fy: 152 });
        FIG.turn(pc, { cx: 175, fy: 152 });
      },
    }],
    subs: [],
    hud() {},
  };
})();
