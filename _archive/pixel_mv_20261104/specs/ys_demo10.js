// ys_demo10.js —《运镜 + 微信界面》10 秒验证 demo
// 学的三件事（2026-11-05 用户指定）：
//   ① 穿越式下摇：极远夜空 → 楼群 → 街道，一个镜头进入故事
//   ② 恒速横移：2 格/帧，单轴，无缓动
//   ③ UI 即场景：手机面板占 2/3 画面，人物退到 1/3 且被面板遮一半
(function () {
  const C = {
    night1: '#12172B', night2: '#1A2338', night3: '#232C48',
    cloud: '#323A5E', cloudLt: '#454E78', cloudEdge: '#E08A64',
    bldg1: '#1A2136', bldg2: '#222A44', bldg3: '#2A3352',
    win: '#FEE2AE', winDim: '#C89A60', winOff: '#232B42',
    shopWall: '#1A2136', shopSign: '#2E9466', signLt: '#42B27E',
    ktv: '#E85CA8', ktvDk: '#7A2E5A', neonRed: '#C8382C',
    road: '#202638', roadLt: '#2A3148', roadLine: '#4A5270',
    rain: '#7A86A8', rainF: '#9AA6C8',
    // 室内
    wall: '#2A2A48', wallLt: '#32325A', wallDk: '#22223C',
    bed: '#3A3454', bedLt: '#443E60', bedDk: '#2C2842',
    sheet: '#4A4468', sheetLt: '#565078',
    skin: '#D8A882', skinDk: '#B88A66', skinLt: '#EEC49C',
    hair: '#171420', hairHi: '#33304A',
    cloth: '#E8E4DC', clothDk: '#C8C4BC', pant: '#2C2F48',
    // UI
    shell: '#2D2D35', screen: '#EEEEEE', white: '#FFFFFF',
    green: '#8EDC64', greenDk: '#6BBE45',
    iconBlue: '#1C2B4C', moon: '#F0DCA8',
    iconPink: '#FFD5DF', bear: '#FFFFFF',
    txt: '#141414', txtGray: '#9A9A9A', txtStamp: '#B0B0B0',
    hb: '#C83C3C', pink: '#F0689A', uiTxt: '#E8EEFA', uiDim: '#9AA6C8',
  };

  function ell(c, cx, cy, rx, ry, col) {
    c.fillStyle = col;
    for (let dy = -ry; dy <= ry; dy++) {
      const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
      if (w > 0) c.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
    }
  }
  const HZ = t => t <= 0 ? 0 : (t >= 1 ? 1 : t * t * (3 - 2 * t));

  // ══════════════════════════════════════════════════════
  // 长卷 A：夜空 → 楼群 → 街道（总高 540，窗口 180）
  // ══════════════════════════════════════════════════════
  function rollA(c, t, drop) {
    const Y = -drop;                       // 长卷上移 drop 格
    // ── 0–170：夜空 ──
    c.fillStyle = C.night1; c.fillRect(0, Y + 0, 320, 175);
    c.fillStyle = C.night2; c.fillRect(0, Y + 60, 320, 60);
    c.fillStyle = C.night3; c.fillRect(0, Y + 120, 320, 55);
    // 云（扁云带，左右错位，底缘暖光）
    const clouds = [[14, 22, 58], [96, 10, 44], [196, 28, 62], [268, 14, 38], [140, 44, 34],
                    [30, 66, 48], [200, 78, 54], [110, 96, 40], [284, 92, 46], [60, 124, 52], [220, 140, 44]];
    for (const [x, y, w] of clouds) {
      const drift = (t * 2 + x * .1) % 8;
      const cx0 = Math.round(x + drift);
      R(c, cx0, Y + y, w, 3, C.cloudLt);
      R(c, cx0 + 3, Y + y + 3, w - 6, 3, C.cloud);
      R(c, cx0 + 1, Y + y + 6, w - 10, 2, C.cloud);
      R(c, cx0 + 8, Y + y + 8, w - 24, 1, C.cloudEdge);
      R(c, cx0 + 14, Y + y + 1, w - 30, 1, '#525A86');
    }
    // 星点（远处，稀疏）
    for (let i = 0; i < 40; i++) {
      const sx = (i * 53) % 320, sy = Y + ((i * 37) % 168);
      if (sy > Y + 4 && sy < Y + 170) R(c, sx, sy, 1, 1, i % 4 ? '#4A5478' : '#8A94B4');
    }
    // 雨（斜 6°，两层）
    for (let i = 0; i < 52; i++) {
      const rx = (i * 41 + t * 22) % 340 - 10;
      const ry = Y + ((i * 29 + t * 260) % 175);
      c.save(); c.globalAlpha = .42;
      R(c, rx, ry, 1, 2 + (i % 2), i % 3 ? C.rain : C.rainF); c.restore();
    }

    // ── 175–350：楼群（暖橙窗）──
    // 过渡带：远处矮楼剪影 + 雾气，避免天空直接切到楼
    c.save(); c.globalAlpha = .55;
    R(c, 0, Y + 168, 320, 12, '#1E2740'); c.restore();
    for (let i = 0; i < 9; i++) {
      const fx = i * 38 + ((i * 13) % 11);
      R(c, fx, Y + 166 - (i % 3) * 3, 26 + (i % 4) * 6, 6 + (i % 3) * 3, '#1A2136');
    }
    c.save(); c.globalAlpha = .16;
    R(c, 0, Y + 172, 320, 8, '#7A86A8'); c.restore();
    c.fillStyle = C.night1; c.fillRect(0, Y + 176, 320, 180);
    const blocks = [[-6, 40, 54, 110], [52, 18, 66, 132], [124, 50, 48, 100],
                    [176, 10, 74, 140], [254, 34, 60, 116], [316, 24, 40, 126]];
    for (let k = 0; k < blocks.length; k++) {
      const [bx, by, bw, bh] = blocks[k];
      const base = [C.bldg1, C.bldg2, C.bldg3][k % 3];
      R(c, bx, Y + by + 172, bw, bh, base);
      R(c, bx, Y + by + 172, bw, 1, '#2A3352');
      // 楼层线
      for (let fy = by + 10; fy < by + bh - 6; fy += 12) {
        R(c, bx + 1, Y + fy + 172, bw - 2, 1, k % 2 ? '#1B2338' : '#141A2C');
      }
      // 窗
      for (let wy = by + 14; wy < by + bh - 10; wy += 12) {
        for (let wx = bx + 4; wx < bx + bw - 5; wx += 8) {
          const h = (wx * 13 + wy * 7 + k * 31) % 10;
          if (h < 5) R(c, wx, Y + wy + 172, 4, 5, C.win);
          else if (h === 5 || h === 6) R(c, wx, Y + wy + 172, 4, 5, C.winDim);
          else if (h === 8) R(c, wx, Y + wy + 172, 4, 5, C.winOff);
        }
      }
    }

    // ── 350–470：店铺层（便利店）──
    R(c, 0, Y + 352, 320, 120, C.shopWall);
    R(c, 0, Y + 352, 320, 1, '#2E3854');
    // 便利店外框
    R(c, 96, Y + 356, 130, 96, '#20293E');
    // 招牌
    R(c, 100, Y + 360, 122, 14, C.shopSign);
    R(c, 100, Y + 360, 122, 1, C.signLt);
    R(c, 100, Y + 373, 122, 1, '#1E7448');
    // 橱窗（4 排货架彩色条）
    R(c, 102, Y + 378, 118, 62, '#DCE8E0');
    const goods = ['#E05040', '#E8C040', '#4A8AE0', '#E07A30', '#48B060', '#C84A98'];
    for (let row = 0; row < 4; row++) {
      const gy = Y + 384 + row * 14;
      R(c, 104, gy + 10, 114, 2, '#9AB0A8');
      for (let g = 0; g < 11; g++) {
        const gx = 106 + g * 10;
        R(c, gx, gy, 6, 10, goods[(g + row * 2) % 6]);
        R(c, gx, gy, 6, 1, '#FFFFFF');
      }
    }
    // 玻璃反光
    c.save(); c.globalAlpha = .18;
    R(c, 104, Y + 378, 30, 62, '#FFFFFF'); c.restore();
    // 门（左）
    R(c, 208, Y + 378, 18, 62, '#B8CCD8');
    R(c, 208, Y + 378, 18, 1, '#E8F4FA');
    R(c, 216, Y + 378, 1, 62, '#8AA0B0');

    // ── 470–540：路面 ──
    R(c, 0, Y + 470, 320, 70, C.road);
    R(c, 0, Y + 470, 320, 2, C.roadLt);
    for (let i = 0; i < 6; i++) R(c, 20 + i * 56, Y + 490, 24, 1, C.roadLine);
    // 路沿
    R(c, 0, Y + 472, 320, 3, '#2C3350');
    for (let x = 0; x < 320; x += 8) R(c, x, Y + 472, 4, 1, '#3E4668');
    // 湿地面反光
    for (let i = 0; i < 26; i++) {
      const rx = (i * 37) % 310, ry = Y + 478 + (i * 13) % 58;
      R(c, rx, ry, 3 + (i % 4), 1, i % 3 ? '#38405E' : C.winDim);
    }
    // 便利店灯光洒地
    c.save(); c.globalAlpha = .2;
    for (let i = 0; i < 8; i++) R(c, 104 + i * 14, Y + 474, 12, 4, C.win); c.restore();
  }

  // ══════════════════════════════════════════════════════
  // 长卷 B：街边店铺横移（总宽 980，窗口 320）
  // 每铺 = 建筑体 + 楼上窗 + 招牌带 + 橱窗 + 门 + 地面倒影
  // ══════════════════════════════════════════════════════
  function shopUnit(c, x, w, o) {
    const top = 10, gnd = 140;
    // 建筑体
    R(c, x, top, w, gnd - top, o.wall);
    R(c, x, top, w, 1, o.wallLt);
    R(c, x, top, 1, gnd - top, '#0E1420');
    R(c, x + w - 1, top, 1, gnd - top, '#0E1420');
    // 楼上窗（2 排）
    for (let ry = top + 8; ry < 40; ry += 14) {
      for (let rx = x + 7; rx < x + w - 9; rx += 13) {
        const h = (rx * 7 + ry * 11) % 9;
        R(c, rx, ry, 8, 8, h < 3 ? C.win : (h === 4 ? C.winDim : '#161C2C'));
        if (h < 3) R(c, rx, ry, 8, 1, '#FFF2D0');
      }
    }
    // 招牌带
    const sy = 44, sh = 17;
    R(c, x + 3, sy, w - 6, sh, o.sign);
    R(c, x + 3, sy, w - 6, 1, o.signLt);
    R(c, x + 3, sy + sh - 1, w - 6, 1, o.signDk);
    // 招牌支架
    R(c, x + 2, sy - 2, 2, 2, '#2A3148');
    R(c, x + w - 4, sy - 2, 2, 2, '#2A3148');
    // 招牌字
    if (o.label) T2(c, o.label, x + w / 2, sy + sh - 5.2, o.labelSize || 6.4, o.txt, 1, 0, 'center');
    // 店面
    if (o.kind === 'store') {
      // 便利店：亮橱窗 + 4 排货架
      R(c, x + 4, sy + sh + 2, w - 8, 70, '#E4EEE8');
      R(c, x + 4, sy + sh + 2, w - 8, 2, '#FFFFFF');
      const goods = ['#E05040', '#E8C040', '#4A8AE0', '#E07A30', '#48B060', '#C84A98'];
      for (let row = 0; row < 4; row++) {
        const gy = sy + sh + 7 + row * 16;
        R(c, x + 6, gy + 12, w - 12, 2, '#AFC4BC');
        for (let g = 0; g < Math.floor((w - 12) / 12); g++) {
          R(c, x + 8 + g * 12, gy, 8, 12, goods[(g + row * 2) % 6]);
          R(c, x + 8 + g * 12, gy, 8, 2, '#FFFFFF');
        }
      }
      // 玻璃反光斜条
      c.save(); c.globalAlpha = .16;
      R(c, x + 10, sy + sh + 2, 16, 70, '#FFFFFF');
      R(c, x + 34, sy + sh + 2, 8, 70, '#FFFFFF');
      c.restore();
      // 自动门（右侧）
      R(c, x + w - 30, sy + sh + 2, 26, 70, '#C8DCE6');
      R(c, x + w - 18, sy + sh + 2, 1, 70, '#8AA4B4');
      R(c, x + w - 30, sy + sh + 2, 26, 1, '#EAF6FA');
    } else if (o.kind === 'ktv') {
      // KTV：霓虹粉框 + 屏幕 + 暗门厅
      R(c, x + 6, sy + sh + 4, w - 12, 44, '#120E1E');
      // 霓虹框（粉，双线）
      const nx = x + 10, ny = sy + sh + 8, nw = w - 44, nh = 34;
      R(c, nx, ny, nw, nh, '#20102E');
      for (const r of [[nx, ny, nw, 1], [nx, ny + nh - 1, nw, 1], [nx, ny, 1, nh], [nx + nw - 1, ny, 1, nh]])
        R(c, r[0], r[1], r[2], r[3], C.ktv);
      c.save(); c.globalAlpha = .28; R(c, nx, ny, nw, nh, C.ktv); c.restore();
      // 门厅（暗，暖光缝）
      R(c, x + w - 30, sy + sh + 4, 26, 62, '#16101F');
      for (let i = 0; i < 4; i++) R(c, x + w - 28, sy + sh + 14 + i * 13, 22, 2, '#5A2A48');
      // 门口暖光洒地
      c.save(); c.globalAlpha = .22;
      R(c, x + w - 34, gnd - 6, 34, 8, C.ktv); c.restore();
    } else if (o.kind === 'booze') {
      // 烟酒：红招牌 + 玻璃柜
      R(c, x + 5, sy + sh + 3, w - 10, 56, '#1A1420');
      R(c, x + 8, sy + sh + 6, w - 16, 40, '#2A2238');
      for (let i = 0; i < 3; i++) R(c, x + 8, sy + sh + 14 + i * 12, w - 16, 1, '#443A58');
      // 柜里酒瓶（竖条）
      for (let i = 0; i < Math.floor((w - 20) / 9); i++)
        R(c, x + 11 + i * 9, sy + sh + 8, 4, 34, i % 3 === 0 ? '#C8A860' : (i % 3 === 1 ? '#8A6048' : '#B04838'));
      // 门（左）
      R(c, x + 2, sy + sh + 3, 8, 56, '#141020');
    } else {
      // 关门的卷帘
      R(c, x + 4, sy + sh + 2, w - 8, 68, '#2A3048');
      for (let ry = sy + sh + 4; ry < gnd - 4; ry += 4) R(c, x + 4, ry, w - 8, 1, '#20263C');
      R(c, x + 4, sy + sh + 2, w - 8, 1, '#3A4260');
    }
  }

  function rollB(c, t, pan) {
    const X = -pan;
    // 夜空
    R(c, X + 0, 0, 1000, 180, C.night1);
    R(c, X + 0, 0, 1000, 40, '#141A2E');
    // 远处楼影（视差：半速）
    for (let i = 0; i < 12; i++) {
      const bx = X * .5 + i * 84 - 40;
      R(c, bx, 18 + (i % 3) * 5, 56 + (i % 4) * 12, 30, '#161C2E');
      for (let wy = 24; wy < 44; wy += 7)
        for (let wx = bx + 5; wx < bx + 50; wx += 9)
          if ((wx * 5 + wy * 3) % 7 < 2) R(c, wx, wy, 3, 3, C.winDim);
    }
    // 地面（人行道 + 路面）
    R(c, X + 0, 140, 1000, 18, '#2A3048');
    R(c, X + 0, 140, 1000, 2, '#3A4260');
    R(c, X + 0, 158, 1000, 22, C.road);
    R(c, X + 0, 158, 1000, 1, '#2E3650');
    // 四段店铺（覆盖 0–980）
    shopUnit(c, X + 0, 168, { kind: 'store', wall: '#1E2638', wallLt: '#2A3450', sign: '#2E9466', signLt: '#42B27E', signDk: '#1E6E4A', label: '好邻居便利店 24h', txt: '#F4FFF6', labelSize: 5.6 });
    shopUnit(c, X + 182, 150, { kind: 'ktv', wall: '#1C1A2C', wallLt: '#28243C', sign: '#7A2E5A', signLt: '#E85CA8', signDk: '#4A1B38', label: '星光KTV', txt: '#FFD0E8', labelSize: 7.4 });
    shopUnit(c, X + 344, 132, { kind: 'booze', wall: '#1E1A24', wallLt: '#2A2432', sign: '#C8382C', signLt: '#E85A44', signDk: '#8A241C', label: '烟酒', txt: '#FFE0D0', labelSize: 8 });
    shopUnit(c, X + 488, 156, { kind: 'closed', wall: '#1A2030', wallLt: '#242C42', sign: '#3A6A9E', signLt: '#5A8AC0', signDk: '#264A6E', label: '打印 · 复印', txt: '#D8EAF8', labelSize: 5.4 });
    shopUnit(c, X + 656, 170, { kind: 'store', wall: '#1E2638', wallLt: '#2A3450', sign: '#2E9466', signLt: '#42B27E', signDk: '#1E6E4A', label: '好邻居便利店 24h', txt: '#F4FFF6', labelSize: 5.6 });
    shopUnit(c, X + 838, 142, { kind: 'closed', wall: '#1A2030', wallLt: '#242C42', sign: '#7A5A2E', signLt: '#A07A44', signDk: '#543E1E', label: '五金', txt: '#F0E4C8', labelSize: 6 });
    // 电线杆（每 200 一根，前景）
    for (const px0 of [124, 320, 512, 700, 890]) {
      const qx = X + px0;
      R(c, qx, 26, 3, 118, '#0E1220');
      R(c, qx, 26, 1, 118, '#1E2438');
      R(c, qx - 7, 32, 17, 2, '#0E1220');
      R(c, qx - 7, 40, 17, 2, '#0E1220');
      for (const ix of [qx - 5, qx + 1, qx + 7]) R(c, ix, 30, 1, 3, '#2A3148');
    }
    // 店面灯光洒在路面
    c.save(); c.globalAlpha = .2;
    for (const [lx, lw] of [[X + 10, 150], [X + 666, 160]]) R(c, lx, 158, lw, 8, '#E8F0E8');
    c.restore();
    // 路面反光条
    for (let i = 0; i < 22; i++) {
      const rx = X + (i * 47) % 980, ry = 162 + (i * 13) % 16;
      R(c, rx, ry, 6 + (i % 5) * 3, 1, i % 3 ? '#333B56' : C.winDim);
    }
    // 前景雨（不随横移）
    for (let i = 0; i < 52; i++) {
      const rx = (i * 43 + t * 26) % 340 - 10;
      const ry = ((i * 31 + t * 300) % 180);
      c.save(); c.globalAlpha = .42; R(c, rx, ry, 1, 2 + (i % 2), i % 3 ? C.rain : C.rainF); c.restore();
    }
    // 上下压暗，让 HUD 与字幕读得出
    c.save(); c.globalAlpha = .3; R(c, 0, 0, 320, 16, '#0A0E18'); c.restore();
  }

  // ══════════════════════════════════════════════════════
  // 室内（320×180）：左侧床 + 人物，右侧留给手机
  // ══════════════════════════════════════════════════════
  function scRoom(c, t) {
    R(c, 0, 0, 320, 180, C.wall);
    // 墙面分三段明度
    R(c, 0, 0, 320, 60, C.wallLt);
    R(c, 0, 60, 320, 50, C.wall);
    R(c, 0, 110, 320, 70, C.wallDk);
    // 腰线
    R(c, 0, 108, 320, 2, '#3A3A64');
    // 窗（左，冷光）
    R(c, 8, 18, 62, 78, '#4A5480');
    R(c, 10, 20, 58, 74, '#8CA0C8');
    R(c, 10, 20, 58, 2, '#C8D8F0');
    R(c, 38, 20, 2, 74, '#5A6490');
    R(c, 10, 56, 58, 2, '#5A6490');
    // 窗外夜色（远楼剪影 + 零星窗）
    R(c, 11, 22, 56, 70, '#4A5480');
    R(c, 12, 26, 22, 40, '#39425E');
    R(c, 46, 32, 20, 34, '#333C58');
    R(c, 11, 60, 56, 32, '#5A6488');
    for (let i = 0; i < 7; i++) {
      const wx = 15 + (i * 9) % 48, wy = 30 + (i * 13) % 34;
      if (i % 3 !== 0) R(c, wx, wy, 2, 2, C.win);
    }
    // 窗棂（十字）
    R(c, 38, 20, 2, 74, '#5A6490');
    R(c, 10, 56, 58, 2, '#5A6490');
    R(c, 10, 20, 58, 1, '#C8D8F0');
    // 床（右侧，人物坐上面）
    R(c, 100, 104, 120, 12, C.sheet);       // 床垫
    R(c, 100, 104, 120, 2, C.sheetLt);
    // 枕头（床头侧）
    R(c, 96, 96, 26, 10, '#6E6890');
    R(c, 97, 97, 24, 7, '#7E78A0');
    R(c, 96, 96, 26, 1, '#8E88B0');
    // 毯子（盖住床垫后半，带褶皱）
    R(c, 128, 102, 90, 10, '#4A4470');
    R(c, 128, 102, 90, 2, '#5A5480');
    for (let i = 0; i < 4; i++) R(c, 138 + i * 22, 104, 1, 8, '#3A3460');
    R(c, 128, 108, 90, 4, '#3A3460');
    R(c, 100, 116, 120, 26, C.bed);         // 床体
    R(c, 100, 116, 120, 2, C.bedDk);
    for (let i = 0; i < 5; i++) R(c, 106 + i * 23, 120, 1, 20, C.bedDk);
    R(c, 100, 142, 120, 4, C.bedDk);        // 床脚
    R(c, 94, 100, 8, 46, C.bedLt);          // 床头板
    // 窗台（放杯子 + 小盆栽）
    R(c, 6, 96, 66, 4, '#3A3A64');
    R(c, 6, 96, 66, 1, '#4A4A78');
    R(c, 16, 88, 9, 8, '#8A6A4A');            // 杯子
    R(c, 16, 88, 9, 1, '#A88260');
    R(c, 17, 86, 7, 2, '#6A4E34');
    R(c, 46, 84, 10, 12, '#3E7050');          // 盆栽
    R(c, 47, 82, 8, 4, '#4E8A64');
    R(c, 44, 92, 14, 4, '#6E4A32');           // 花盆
    // 墙上便签（腰线下方，避开字幕）
    R(c, 82, 116, 13, 15, '#B8B098');
    R(c, 83, 117, 11, 13, '#C8C0A8');
    for (let i = 0; i < 3; i++) R(c, 85, 120 + i * 4, 7, 1, '#7E7860');
    R(c, 82, 116, 13, 1, '#D8D0B8');
    // 地板
    R(c, 0, 152, 320, 28, '#242440');
    for (let y = 154; y < 180; y += 5) R(c, 0, y, 320, 1, '#1E1E38');
    R(c, 0, 150, 320, 2, '#2E2E50');          // 踢脚线
    // 光：窗光（冷）+ 手机光（暖冷白）
    c.save(); c.globalAlpha = .10;
    for (let i = 0; i < 40; i++) {
      const yy = 30 + i * 3.2;
      R(c, 8, yy, 70 + i * 1.2, 3, '#C8D8F0');
    }
    c.restore();

    // ── 人物：坐在床沿（屁股在床面 y=104，脚垂到 y=130），抱手机 ──
    const cx = 166, hipY = 104, headY = 58;
    const E = '#100E1A';
    const T = headY;
    // ── pass1 膨胀轮廓（1px 硬描边）──
    ell(c, cx, T + 9, 11, 9, E);              // 头
    R(c, cx - 3, T + 17, 6, 4, E);            // 脖
    R(c, cx - 9, T + 20, 18, 16, E);          // 上身
    R(c, cx - 12, T + 21, 4, 14, E);          // 左臂
    R(c, cx + 8, T + 21, 4, 14, E);           // 右臂
    R(c, cx - 8, T + 58, 7, 24, E);           // 左小腿（从床体下沿垂到地）
    R(c, cx + 1, T + 58, 7, 24, E);           // 右小腿
    R(c, cx - 10, T + 82, 9, 4, E);           // 左鞋
    R(c, cx + 1, T + 82, 9, 4, E);            // 右鞋
    // ── pass2 头（黑发圆顶 + 脸露下半）──
    ell(c, cx, T + 8, 11, 8, C.hair);
    R(c, cx - 5, T + 1, 10, 1, C.hair);
    R(c, cx - 6, T + 2, 5, 1, C.hairHi);
    // 脸（从 T+8 到 T+18，被头发盖上部）
    R(c, cx - 7, T + 8, 14, 9, C.skin);
    R(c, cx - 7, T + 8, 2, 9, C.skinDk);      // 左侧背光
    R(c, cx + 5, T + 8, 2, 9, C.skinLt);      // 右侧受光
    R(c, cx - 6, T + 16, 12, 2, C.skinDk);    // 下颌
    // 眼（两个 2×2 黑点）+ 泪痕
    R(c, cx - 4, T + 11, 2, 2, '#140F1A');
    R(c, cx + 3, T + 11, 2, 2, '#140F1A');
    R(c, cx - 4, T + 13, 1, 4, '#7AC8D8');    // 左泪
    R(c, cx + 4, T + 13, 1, 4, '#7AC8D8');    // 右泪
    // 嘴（一条横线，抿着）
    R(c, cx - 2, T + 15, 4, 1, '#8A5A50');
    // ── 上衣（白 T）──
    R(c, cx - 8, T + 20, 16, 16, C.cloth);
    R(c, cx - 8, T + 20, 2, 16, C.clothDk);
    R(c, cx + 6, T + 20, 2, 16, '#FFFFFF');
    R(c, cx - 8, T + 20, 16, 1, '#FFFFFF');
    // 手臂抬起（抱手机）
    R(c, cx - 11, T + 22, 3, 9, C.cloth);
    R(c, cx + 8, T + 22, 3, 9, C.cloth);
    R(c, cx - 11, T + 30, 3, 4, C.skin);
    R(c, cx + 8, T + 30, 3, 4, C.skin);
    // 手机（竖举胸前，屏幕朝自己）
    R(c, cx - 5, T + 24, 11, 15, '#0E1220');
    R(c, cx - 4, T + 25, 9, 13, '#3A4A6A');
    R(c, cx - 3, T + 26, 7, 11, '#8AA8C8');
    R(c, cx - 3, T + 26, 7, 1, '#C8DCF0');
    // 手机冷光（照脸与胸口）
    c.save(); c.globalAlpha = .14;
    ell(c, cx, T + 30, 15, 13, '#C8DCF0'); c.restore();
    // ── 裤（大腿 + 小腿）──
    R(c, cx - 7, T + 58, 6, 24, C.pant);
    R(c, cx + 2, T + 58, 6, 24, C.pant);
    R(c, cx - 7, T + 58, 1, 24, '#3A3E5C');
    R(c, cx + 7, T + 58, 1, 24, '#22243A');
    // ── 鞋 ──
    R(c, cx - 9, T + 82, 9, 4, '#141018');
    R(c, cx + 1, T + 82, 9, 4, '#141018');
    R(c, cx - 9, T + 82, 9, 1, '#2A2438');
    // 坐姿投影（床面上的暗块）
    c.save(); c.globalAlpha = .3;
    ell(c, cx - 2, hipY + 1, 13, 3, '#1A1830'); c.restore();

    // 窗外月光在地面的投影
    c.save(); c.globalAlpha = .07;
    R(c, 20, 152, 50, 10, '#A8C0E8'); c.restore();
  }

  // ══════════════════════════════════════════════════════
  // 手机聊天界面（学《20s》实测规格）
  // 面板 94×148 @ (206,16)；外壳 #2D2D35；屏幕 88×142
  // ══════════════════════════════════════════════════════
  function phoneChat(c, px, py, pw, ph, t, msgs) {
    const R2 = R;
    // 外壳（圆角：四角各削 2px）
    R2(c, px + 2, py, pw - 4, ph, C.shell);
    R2(c, px + 1, py + 2, pw - 2, ph - 4, C.shell);
    R2(c, px, py + 3, pw, ph - 6, C.shell);
    const sx = px + 3, sy = py + 4, sw = pw - 6, sh = ph - 8;
    // 屏幕
    R2(c, sx, sy, sw, sh, C.screen);
    // ── 系统状态栏（高 7）──
    R2(c, sx, sy, sw, 8, C.screen);
    T2(c, '23:55', sx + 3, sy + 6.6, 8, '#222', 1, 0, 'left');
    // 刘海（纯黑矩形）
    R2(c, sx + 30, sy + 1, 22, 5, '#0A0A0A');
    // 信号 + WiFi + 电池
    for (let i = 0; i < 3; i++) R2(c, sx + sw - 20 + i * 2, sy + 5 - i * 1.4, 1.4, 1 + i * 1.4, '#222');
    R2(c, sx + sw - 12, sy + 2, 4, 3, '#222');
    R2(c, sx + sw - 6, sy + 2, 5, 3, '#222');
    R2(c, sx + sw - 5, sy + 3, 3, 1, C.screen);

    // ── 标题栏（高 10）──
    const ty = sy + 8;
    R2(c, sx, ty, sw, 12, C.screen);
    R2(c, sx, ty + 12, sw, 1, '#DEDEDE');
    // 返回箭头
    R2(c, sx + 4, ty + 6, 1, 4, '#333');
    R2(c, sx + 5, ty + 5, 1, 1, '#333');
    R2(c, sx + 5, ty + 10, 1, 1, '#333');
    // 昵称（居中，单字）
    T2(c, '暗', sx + sw / 2, ty + 9, 12, '#1A1A1A', 1, 0, 'center');
    // 更多（两点）
    R2(c, sx + sw - 10, ty + 7, 1.6, 1.6, '#333');
    R2(c, sx + sw - 5, ty + 7, 1.6, 1.6, '#333');

    // ── 聊天区 ──
    const cy0 = ty + 13, cy1 = sy + sh - 12;
    R2(c, sx, cy0, sw, cy1 - cy0, C.screen);

    // 消息（msgs 是数组，每条 {side, text, stamp}）
    let y = cy0 + 6;
    for (let i = 0; i < msgs.length; i++) {
      const m = msgs[i];
      const appear = t - (0.6 + i * 0.46);
      if (appear <= 0) break;
      const a = Math.min(1, appear / 0.2);
      c.save(); c.globalAlpha = a;
      // 时间戳（若该条带 stamp）
      if (m.stamp) {
        T2(c, m.stamp, sx + sw / 2, y + 4.4, 8, '#8A8A8A', a, 0, 'center');
        y += 9;
      }
      const th = 12;                        // 字高（320 基准下中文需 ≥12px，10px 仍会粘连）
      const padX = 5, padY = 3;
      // 文字宽度估算（中文字宽 ≈ 字高）
      const tw = [...m.text].length * th * 1.0;
      const bw = Math.min(tw + padX * 2, sw - 22);
      const bh = padY * 2 + th;
      if (m.side === 'me') {
        // 绿色（我方）气泡 + 右侧头像
        const bx = sx + sw - 20 - bw;
        R2(c, bx, y, bw, bh, C.green);
        R2(c, bx, y, bw, 1, '#A6E87C');
        // 尾巴
        R2(c, bx + bw, y + 3, 2, 2, C.green);
        // 头像（深蓝夜空 + 月牙）
        const ax = sx + sw - 15, ay = y;
        R2(c, ax, ay, 14, bh, C.iconBlue);
        ell(c, ax + 7, ay + bh / 2 - 1, 4, 4, C.moon);
        ell(c, ax + 9, ay + bh / 2 - 2.6, 3.4, 3.4, C.iconBlue);
        T2(c, m.text, bx + padX, y + padY + th * .82, th, C.txt, a, 0, 'left');
      } else {
        // 白色（对方）气泡 + 左侧粉头像
        const ax = sx + 3;
        R2(c, ax, y, 11, bh, C.iconPink);
        // 白熊头
        ell(c, ax + 5.5, y + bh / 2, 3.4, 3.0, C.bear);
        R2(c, ax + 3, y + bh / 2 - 3.4, 1.6, 1.6, C.bear);
        R2(c, ax + 6.6, y + bh / 2 - 3.4, 1.6, 1.6, C.bear);
        R2(c, ax + 4, y + bh / 2 - 0.4, 1, 1, '#8A8A8A');
        R2(c, ax + 6.4, y + bh / 2 - 0.4, 1, 1, '#8A8A8A');
        const bx = sx + 16;
        R2(c, bx, y, bw, bh, C.white);
        R2(c, bx - 2, y + 3, 2, 2, C.white);
        T2(c, m.text, bx + padX, y + padY + th * .82, th, C.txt, a, 0, 'left');
      }
      c.restore();
      y += bh + 2;
    }

    // ── 输入栏（高 11）──
    const iy = sy + sh - 11;
    R2(c, sx, iy, sw, 11, C.screen);
    R2(c, sx, iy, sw, 1, '#DCDCDC');
    // 左虚线圆
    for (let a = 0; a < 12; a++) {
      const ang = a * Math.PI / 6;
      R2(c, sx + 6 + Math.cos(ang) * 3.4, iy + 5.5 + Math.sin(ang) * 3.4, .9, .9, '#9A9A9A');
    }
    // 输入框
    R2(c, sx + 12, iy + 2, sw - 30, 7, C.white);
    // 绿色光标
    R2(c, sx + 14, iy + 3, .9, 5, '#28B04C');
    // 右侧两个虚线圆
    for (const ox of [sw - 19, sw - 7]) {
      for (let a = 0; a < 12; a++) {
        const ang = a * Math.PI / 6;
        R2(c, sx + ox + Math.cos(ang) * 3.0, iy + 5.5 + Math.sin(ang) * 3.0, .9, .9, '#9A9A9A');
      }
    }
    R2(c, sx + sw - 8, iy + 4.4, 1, 3, '#666');
    R2(c, sx + sw - 6.5, iy + 5.4, 2.5, 1, '#666');
  }

  // 小字（系统 UI 用无衬线，不用行楷）
  function T2(c, s, x, y, size, col, a, ls, align) {
    c.save();
    c.globalAlpha = a == null ? 1 : a;
    c.font = `${size}px "Microsoft YaHei", "PingFang SC", sans-serif`;
    c.textAlign = align || 'left';
    c.textBaseline = 'alphabetic';
    const px0 = Math.round(x), py0 = Math.round(y);
    if (size >= 8) {
      c.strokeStyle = 'rgba(0,0,0,.22)';
      c.lineWidth = .8;
      c.strokeText(s, px0, py0);
    }
    c.fillStyle = col;
    c.fillText(s, px0, py0);
    c.restore();
  }

  // 行楷大字（字幕/HUD）
  function TH(c, s, x, y, size, col, a, ls, align, stroke) {
    c.save();
    c.globalAlpha = a == null ? 1 : a;
    c.font = `${size}px KT, XK, serif`;
    c.textAlign = align || 'left';
    c.textBaseline = 'alphabetic';
    const chars = [...s];
    let w = 0;
    for (const ch of chars) w += c.measureText(ch).width + (ls || 0);
    let cx = align === 'center' ? x - (w - (ls || 0)) / 2 : (align === 'right' ? x - (w - (ls || 0)) : x);
    for (const ch of chars) {
      const cw = c.measureText(ch).width;
      if (stroke) {
        c.fillStyle = stroke;
        for (const d of [[-1.5, 0], [1.5, 0], [0, -1.5], [0, 1.5], [-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]])
          c.fillText(ch, cx + d[0], y + d[1]);
      }
      c.fillStyle = col;
      c.fillText(ch, cx, y);
      cx += cw + (ls || 0);
    }
    c.restore();
  }

  // ══════════════════════════════════════════════════════
  // 三个镜头
  // ══════════════════════════════════════════════════════
  const CHAT_MSGS = [
    { side: 'me', text: '到家了吗', stamp: null },
    { side: 'me', text: '下雨了', stamp: null },
    { side: 'me', text: '能聊聊吗', stamp: '今天 23:47' },
    { side: 'me', text: '五分钟', stamp: null },
    { side: 'me', text: '暗', stamp: null },
  ];

  window.SPEC = {
    fps: 24, duration: 10.0,
    grade: 'brightness(1.04) saturate(1.06) contrast(1.05)',
    fadeIn: .4, fadeOut: .6,
    shots: [
      // ── SH01 穿越式下摇（0–3.0）：恒速 2 格/帧，无缓动 ──
      {
        t0: 0, t1: 3.0, scene: 'rollA', vig: .30, in: { type: 'fade', dur: .4 },
        draw(pc, lt) {
          rollA(pc, lt, Math.round(lt * 48));       // 48 格/秒 = 2 格/帧
        },
      },
      // ── SH02 恒速横移（3.0–6.0）：单轴，2 格/帧 ──
      {
        t0: 3.0, t1: 6.0, scene: 'rollB', vig: .28, in: { type: 'blk', dur: .24 },
        draw(pc, lt) {
          rollB(pc, lt + 3.0, Math.round(30 + lt * 80));
        },
      },
      // ── SH03 室内 + UI（6.0–10.0）：手机面板滑入，气泡逐条 ──
      {
        t0: 6.0, t1: 10.0, scene: 'room', vig: .26, in: { type: 'dither', dur: .3 },
        draw(pc, lt) {
          scRoom(pc, lt);
          // 手机面板从右侧滑入（0.45s，整数格，无缓动）
          const slide = lt < .45 ? Math.round((1 - lt / .45) * 100) : 0;
          phoneChat(pc, 200 + slide, 14, 94, 152, lt, CHAT_MSGS);
        },
      },
    ],
    subs: [],                       // 留空：字幕在 hud() 里自绘（产线会自动画 subs，避免重复）
    MYSUBS: [
      { t0: 0.30, t1: 3.00, text: '忘不掉的你' },
      { t0: 3.20, t1: 6.00, text: '便利店的灯还亮着' },
      { t0: 6.40, t1: 9.90, text: '两人的对话剩我一人独白' },
    ],

    hud(c, W, H, t) {
      const k = W / 320;

      // ═══ 左上：心电图 + ❤ + 时间 + 状态词 + 地点 ═══
      const a0 = HZ((t - .2) / .6);
      c.save(); c.globalAlpha = a0;
      // 心电图折线（红色）
      c.strokeStyle = C.hb; c.lineWidth = Math.max(1, .6 * k);
      c.beginPath();
      const hy = 6.4 * k;
      for (let i = 0; i <= 54; i++) {
        const x = (2.5 + i * .19) * k;
        const ph = ((i * 0.55 + t * 9) % 8);
        let dy = 0;
        if (ph > 3.4 && ph < 3.9) dy = -1.5; else if (ph > 3.9 && ph < 4.4) dy = 1.2;
        else if (ph > 4.4 && ph < 5.2) dy = -.35; else if (ph > 5.2 && ph < 5.7) dy = .7;
        c.lineTo(x, hy + dy * k);
      }
      c.stroke(); c.restore();

      // ❤ 105
      TH(c, '❤', 14.5 * k, 8.4 * k, Math.round(5.2 * k), C.pink, a0, 0, 'left', '#2A0A16');
      TH(c, '105', 19.5 * k, 8.4 * k, Math.round(4.6 * k), C.uiTxt, a0, 0, 'left', '#0A1018');
      // 23:55
      TH(c, '23:55', 33 * k, 8.4 * k, Math.round(4.6 * k), C.uiTxt, a0, 0, 'left', '#0A1018');
      // 状态词（随镜头变：不敢问 → 独白 → 独白）
      const st = t < 3.0 ? '不敢问' : '独白';
      const a1 = HZ((t - 3.1) / .5);
      if (t < 3.0) TH(c, st, 50 * k, 8.4 * k, Math.round(4.6 * k), '#FFD166', a0, 0, 'left', '#0A1018');
      else TH(c, st, 50 * k, 8.4 * k, Math.round(4.6 * k), '#FFD166', a1, 0, 'left', '#0A1018');
      // · 出租屋
      TH(c, '·', 66 * k, 8.4 * k, Math.round(4.6 * k), C.uiDim, a0, 0, 'left', '#0A1018');
      TH(c, '出租屋', 70 * k, 8.4 * k, Math.round(4.6 * k), C.uiDim, a0, 0, 'left', '#0A1018');

      // ═══ 右上：两圆点 + 虚线 + 相距 + 天数 ═══
      const a2 = HZ((t - .5) / .6);
      c.save(); c.globalAlpha = a2;
      const bx = W - 62 * k;
      // 两圆点
      c.fillStyle = '#5FB0F0'; c.beginPath(); c.arc(bx, 6.4 * k, 1.6 * k, 0, 7); c.fill();
      c.fillStyle = C.pink;   c.beginPath(); c.arc(bx + 5 * k, 6.4 * k, 1.6 * k, 0, 7); c.fill();
      // 虚线
      c.fillStyle = 'rgba(200,208,230,.55)';
      for (let i = 0; i < 4; i++) c.fillRect(bx + (1.9 + i * .9) * k, 6.2 * k, .5 * k, .5 * k);
      c.restore();
      TH(c, '相距 6.2km', W - 52 * k, 8.4 * k, Math.round(4.6 * k), C.uiTxt, a2, 0, 'left', '#0A1018');
      TH(c, '第612天', W - 6 * k, 8.4 * k, Math.round(4.6 * k), C.uiDim, a2, 0, 'right', '#0A1018');

      // ═══ 字幕（画面上部，白色 + 黑硬描边，逐字）═══
      const S = window.SPEC.MYSUBS;
      for (const s of S) {
        if (t < s.t0 || t >= s.t1) continue;
        const p = (t - s.t0) / (s.t1 - s.t0);
        const chars = [...s.text];
        const n = Math.max(1, Math.ceil(p * chars.length * 1.15));
        const shown = chars.slice(0, Math.min(n, chars.length)).join('');
        const aIn = Math.min(1, (t - s.t0) / .2);
        const aOut = t > s.t1 - .3 ? (s.t1 - t) / .3 : 1;
        const subX = t >= 6.0 ? 108 * k : 160 * k;
        TH(c, shown, subX, 30 * k, Math.round(10.5 * k), '#FFFFFF', aIn * aOut, Math.round(.5 * k), 'center', '#0A0810');
      }
    },
  };
})();
