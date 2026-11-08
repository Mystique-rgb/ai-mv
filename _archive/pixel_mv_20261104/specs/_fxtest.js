// _fxtest.js — 动效模块验证（不用于出片）
// 复刻《陀飞轮》罗盘界面，验证 FX 的旋转 / 心跳 / 数字乱跳 / 进度条。
(function () {
  var HEART = [
    '01100110000',
    '11111111100',
    '11111111110',
    '11111111110',
    '01111111100',
    '00111111000',
    '00011110000',
    '00001100000',
    '00000000000',
  ];
  function heart(c, cx, cy, k, col, hi) {
    var w = HEART[0].length, h = HEART.length;
    var x0 = Math.round(cx - w * k / 2), y0 = Math.round(cy - h * k / 2);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      if (HEART[y][x] !== '1') continue;
      c.fillStyle = (x < 3 && y < 2) ? hi : col;
      c.fillRect(x0 + Math.round(x * k), y0 + Math.round(y * k), Math.round(k), Math.round(k));
    }
  }
  function line(c, x1, y1, x2, y2, col, w) {
    c.fillStyle = col;
    var dx = x2 - x1, dy = y2 - y1, n = Math.max(Math.abs(dx), Math.abs(dy));
    for (var i = 0; i <= n; i++) {
      c.fillRect(Math.round(x1 + dx * i / n), Math.round(y1 + dy * i / n), w || 1, w || 1);
    }
  }

  window.SPEC = {
    fps: 24, duration: 4.0,
    shots: [{
      t0: 0, t1: 4.0, scene: 'fx', vig: .30,
      draw(pc, lt) {
        var P_ = P.ext;
        // 底
        pc.fillStyle = P.ext.faceBg[0]; pc.fillRect(0, 0, 320, 180);
        var cx = 160, cy = 96, R0 = 56;

        // 外圈（金）+ 刻度
        for (var a = 0; a < 360; a += 2) {
          var r = a * Math.PI / 180;
          var rr = (a % 10 === 0) ? R0 : R0 - 2;
          pc.fillStyle = P.core.wood[4];
          pc.fillRect(Math.round(cx + Math.sin(r) * rr), Math.round(cy - Math.cos(r) * rr), 1, 1);
        }
        // 内白圈
        for (var b = 0; b < 360; b += 3) {
          var rb = b * Math.PI / 180;
          pc.fillStyle = P.core.paper[3];
          pc.fillRect(Math.round(cx + Math.sin(rb) * 34), Math.round(cy - Math.cos(rb) * 34), 1, 1);
        }
        // 8 根辐射线（静态）
        for (var k = 0; k < 8; k++) {
          var ang = k * 45 * Math.PI / 180;
          line(pc, cx + Math.sin(ang) * 14, cy - Math.cos(ang) * 14,
                   cx + Math.sin(ang) * R0, cy - Math.cos(ang) * R0, P.core.wood[2], 1);
        }

        // 指针：FX.spin 85°/s
        var A = FX.spin(lt) * Math.PI / 180;
        line(pc, cx, cy, cx + Math.sin(A) * 44, cy - Math.cos(A) * 44, P.core.paper[4], 2);

        // 心跳：3 档离散
        var kk = [2.2, 3.0, 3.6][FX.beat(lt)];
        heart(pc, cx, cy + 2, kk, '#E83C50', '#F87890');

        // 左上 HUD + 数字乱跳
        pc.fillStyle = P.core.paper[4];
        pc.font = '11px KT, XK, serif';
        pc.fillText('心跳余额', 8, 14);
        pc.font = '15px KT, XK, serif';
        pc.fillStyle = '#F0A0B0';
        pc.fillText('' + FX.odoNum(lt, 409056204, 0.0015), 8, 32);

        // 底部进度条：FX.barFill
        var bw = FX.barFill(lt, 2.4, 220);
        pc.fillStyle = '#2A2240'; pc.fillRect(50, 158, 220, 5);
        pc.fillStyle = '#D84050'; pc.fillRect(50, 158, bw, 5);

        // 档位指示（调试用）
        pc.fillStyle = P.core.paper[2]; pc.font = '9px KT, XK, serif';
        pc.fillText('beat=' + FX.beat(lt) + '  spin=' + FX.spin(lt).toFixed(0) + 'deg', 232, 174);
      },
    }],
    subs: [],
    hud() {},
  };
})();
