// pv_street.js — 街道场景（纯代码，320×180 像素层）
// 规格：skills/场景库-v1.md 白天底图规格 + 二维正交侧视（零透视）
// 招牌字：assets/fonts/px16.js 的 16×16 点阵字模，逐位填充，不用 TrueType
// 硬约定：所有坐标整数；每个物体 ≥3 档明度；层序 = 远到近；画面中段留空给人物站位
(function () {
  const C = {
    // 天（4 档，上深下浅）
    sky1: '#8FB8DC', sky2: '#A0C4E2', sky3: '#B4D2EA', sky4: '#C6E0F2',
    // 云
    cloud: '#FFFFFF', cloudSh: '#DCEAF4',
    // 远景建筑
    farA: '#A8B8C8', farB: '#93A6BA', farC: '#7E92A8',
    // 奶油墙（3 档）
    wallL: '#F0E6CC', wall: '#E5D8B5', wallD: '#C9BA95', wallDD: '#AD9E7C',
    // 木（3 档）
    woodL: '#C89C68', wood: '#A87546', woodD: '#7A5330', woodDD: '#553819',
    // 蓝灰阴影
    coolD: '#2D3343', cool: '#414A5A', coolL: '#5A6478',
    // 暖金
    gold: '#DAB461', goldD: '#C79A52', goldL: '#EFD08E',
    // KTV 深蓝紫（3 档）
    kvL: '#4A5078', kv: '#3A3F63', kvD: '#2B2F4A',
    // 红 / 绿
    red: '#C4504A', redD: '#9C3A36', redL: '#DE6B62',
    green: '#4E8A62', greenD: '#3A6B4A', greenL: '#6E9F7C',
    // 地面
    walk: '#B0B0A8', walkD: '#9A9A92', curb: '#8A8A82',
    road: '#5F656B', roadL: '#6B7278', roadLine: '#E8E8E0',
    // 玻璃
    glass: '#A8C8DC', glassD: '#8AAFC8', glassHi: '#D8ECF6',
    ink: '#2A2A32',
  };

  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x | 0, y | 0, w | 0, h | 0); };

  // ---------- 16×16 / 8×16 点阵字 ----------
  function PXT(c, s, x, y, col, sc) {
    sc = sc || 1;
    let cx = x;
    c.fillStyle = col;
    for (const ch of s) {
      const cn = window.PXF && window.PXF.cn[ch];
      const as = window.PXF && window.PXF.as[ch];
      if (cn) {
        for (let r = 0; r < 16; r++) {
          const bits = parseInt(cn[r], 16);
          if (!bits) continue;
          for (let b = 0; b < 16; b++) {
            if (bits & (1 << (15 - b))) c.fillRect(cx + b * sc, y + r * sc, sc, sc);
          }
        }
        cx += 16 * sc;
      } else if (as) {
        for (let r = 0; r < 16; r++) {
          const bits = parseInt(as[r], 16);
          if (!bits) continue;
          for (let b = 0; b < 8; b++) {
            if (bits & (1 << (7 - b))) c.fillRect(cx + b * sc, y + r * sc, sc, sc);
          }
        }
        cx += 8 * sc;
      } else {
        cx += 8 * sc;
      }
    }
    return cx;
  }
  const PXW = (s, sc) => {
    sc = sc || 1; let w = 0;
    for (const ch of s) w += (((window.PXF && window.PXF.cn[ch]) ? 16 : 8) * sc);
    return w;
  };

  function drawStreet(c) {
    // ══════ ① 天空：4 条横带（硬边，不做渐变）+ 点阵云 ══════
    R(c, 0, 0, 320, 30, C.sky1);
    R(c, 0, 30, 320, 28, C.sky2);
    R(c, 0, 58, 320, 28, C.sky3);
    R(c, 0, 86, 320, 32, C.sky4);
    // 云：白色短横堆叠（绝不画云朵轮廓），下缘一道浅蓝阴影
    const clouds = [[14, 14, 30], [86, 8, 22], [150, 18, 34], [226, 11, 18], [268, 26, 26]];
    for (const [x, y, w] of clouds) {
      R(c, x, y, w, 3, C.cloud);
      R(c, x + 4, y + 3, w - 8, 3, C.cloud);
      R(c, x + 9, y + 6, w - 18, 2, C.cloudSh);
    }

    // ══════ ② 远景建筑剪影（地平线上一排，制造街区纵深但不做透视） ══════
    const farRow = [
      [0, 92, 26, 26, C.farB], [24, 86, 20, 32, C.farA], [44, 96, 18, 22, C.farC],
      [120, 84, 24, 34, C.farA], [144, 94, 16, 24, C.farB], [168, 88, 22, 30, C.farC],
      [196, 96, 18, 22, C.farA], [218, 82, 26, 36, C.farB], [244, 92, 20, 26, C.farC],
      [268, 86, 22, 32, C.farA], [292, 94, 28, 24, C.farB],
    ];
    for (const [x, y, w, h, col] of farRow) {
      R(c, x, y, w, h, col);
      R(c, x + w - 3, y, 3, h, C.farC);
      for (let wy = y + 5; wy < y + h - 4; wy += 7) {
        for (let wx = x + 3; wx < x + w - 4; wx += 6) R(c, wx, wy, 2, 3, C.coolL);
      }
    }
    // 地平线暗带（把远景压住，不让它和主建筑粘在一起）
    R(c, 0, 116, 320, 2, C.farC);

    // ══════ ③ 小卖部 x 0–58 ══════
    R(c, 0, 62, 58, 56, C.wall);              // 墙
    R(c, 0, 62, 58, 3, C.wallL);              // 墙顶亮边
    R(c, 54, 62, 4, 56, C.wallD);             // 右侧暗面
    for (let y = 70; y < 116; y += 10) R(c, 0, y, 54, 1, C.wallD);  // 墙缝
    // 条纹雨棚（绿白斜条）
    for (let i = 0; i < 7; i++) R(c, i * 8, 52, 8, 8, i % 2 ? C.green : '#F4F0E4');
    R(c, 0, 60, 58, 2, C.greenD);
    for (let i = 0; i < 7; i++) R(c, 2 + i * 8, 50, 5, 2, i % 2 ? C.greenL : '#FFFFFF');
    // 招牌底板 + 点阵字
    R(c, 2, 64, 54, 20, '#F6EFD9');
    R(c, 2, 64, 54, 1, C.woodD); R(c, 2, 83, 54, 1, C.woodD);
    R(c, 2, 64, 1, 20, C.woodD); R(c, 55, 64, 1, 20, C.woodD);
    PXT(c, '小卖部', 5, 66, C.greenD, 1);
    // 窗（玻璃 + 反光斜条）+ 门
    R(c, 5, 90, 22, 16, C.woodD);
    R(c, 6, 91, 20, 14, C.glass);
    R(c, 9, 92, 3, 12, C.glassHi); R(c, 16, 92, 2, 12, C.glassD);
    R(c, 34, 90, 16, 28, C.wood);
    R(c, 35, 91, 14, 26, C.woodL);
    R(c, 41, 91, 1, 26, C.woodD);             // 门缝
    R(c, 45, 103, 2, 2, C.gold);              // 门把
    // 门口汽水箱（红塑料筐 + 玻璃瓶）
    R(c, 2, 106, 12, 12, C.red);
    R(c, 2, 106, 12, 1, C.redL); R(c, 2, 117, 12, 1, C.redD);
    for (let i = 0; i < 3; i++) R(c, 4 + i * 4, 108, 2, 8, '#7A8A96');
    R(c, 0, 118, 58, 2, C.wallDD);            // 墙脚

    // ══════ ④ 理发店 x 58–112 ══════
    R(c, 58, 48, 54, 70, C.wallL);
    R(c, 58, 48, 54, 3, '#FAF3E0');
    R(c, 108, 48, 4, 70, C.wallD);
    for (let y = 56; y < 116; y += 9) R(c, 58, y, 50, 1, C.wall);
    // 红白条纹雨棚
    for (let i = 0; i < 6; i++) R(c, 58 + i * 8, 58, 8, 7, i % 2 ? C.red : '#F6F2E8');
    R(c, 58, 65, 50, 2, C.redD);
    for (let i = 0; i < 6; i++) R(c, 60 + i * 8, 67, 5, 2, i % 2 ? C.redL : '#FFFFFF');
    // 招牌底板 + 字
    R(c, 60, 72, 50, 18, '#FBF4E0');
    R(c, 60, 72, 50, 1, C.redD); R(c, 60, 89, 50, 1, C.redD);
    R(c, 60, 72, 1, 18, C.redD); R(c, 109, 72, 1, 18, C.redD);
    PXT(c, '理发店', 61, 73, C.redD, 1);
    // 门 + 窗
    R(c, 70, 94, 18, 24, C.woodD);
    R(c, 71, 95, 16, 22, C.glassD);
    R(c, 74, 96, 3, 20, C.glassHi);
    R(c, 62, 96, 6, 12, C.woodD);
    R(c, 63, 97, 4, 10, C.glass);
    R(c, 96, 96, 12, 12, C.woodD);
    R(c, 97, 97, 10, 10, C.glass);
    // 转灯柱（红白斜条 + 金顶，理发店招牌动作）
    R(c, 103, 92, 4, 22, '#F6F2E8');
    for (let i = 0; i < 7; i++) R(c, 103, 93 + i * 3, 4, 2, C.red);
    R(c, 102, 89, 6, 3, C.gold);
    R(c, 103, 114, 4, 4, C.coolD);

    // ══════ ⑤ KTV x 112–186（街区最高，霓虹 + 灯笼 + 台阶） ══════
    R(c, 112, 24, 74, 94, C.kv);
    R(c, 112, 24, 74, 2, C.kvL);
    R(c, 180, 24, 6, 94, C.kvD);
    // 楼顶灯箱檐
    R(c, 110, 20, 78, 5, C.gold);
    R(c, 110, 20, 78, 1, C.goldL);
    for (let x = 112; x < 186; x += 6) R(c, x, 22, 3, 1, C.goldD);
    // 大招牌（深底 + 金边 + 白字）
    R(c, 116, 32, 66, 24, C.kvD);
    R(c, 116, 32, 66, 1, C.gold); R(c, 116, 55, 66, 1, C.gold);
    R(c, 116, 32, 1, 24, C.gold); R(c, 181, 32, 1, 24, C.gold);
    // KTV 三字母：8×16 点阵，居中
    PXT(c, 'KTV', 141, 36, '#F4F0E4', 1);
    // 霓虹灯管（竖条，金/粉交替）
    for (let y = 62; y < 104; y += 8) {
      R(c, 114, y, 1, 5, C.gold);
      R(c, 183, y, 1, 5, '#E88AA0');
    }
    // 二层小窗
    for (let i = 0; i < 3; i++) {
      R(c, 122 + i * 16, 62, 10, 10, C.kvD);
      R(c, 123 + i * 16, 63, 8, 8, i === 1 ? '#E8B46A' : '#8A7090');
    }
    // 玻璃门 + 门厅灯
    R(c, 138, 76, 24, 38, C.kvD);
    R(c, 140, 78, 20, 34, '#5A6A8C');
    R(c, 143, 80, 3, 30, '#8FA8C8');
    R(c, 155, 80, 2, 30, '#3A4258');
    R(c, 138, 74, 24, 3, C.gold);
    // 红灯笼 ×2
    R(c, 128, 70, 7, 9, C.red);
    R(c, 128, 70, 7, 1, C.redL); R(c, 128, 78, 7, 1, C.redD);
    R(c, 130, 68, 3, 2, C.gold); R(c, 130, 79, 3, 3, C.gold);
    R(c, 166, 70, 7, 9, C.red);
    R(c, 166, 70, 7, 1, C.redL); R(c, 166, 78, 7, 1, C.redD);
    R(c, 168, 68, 3, 2, C.gold); R(c, 168, 79, 3, 3, C.gold);
    // 三级台阶（横向平铺，不做透视收缩）
    R(c, 132, 110, 36, 4, '#5A6070');
    R(c, 128, 114, 44, 4, '#6A7282');
    // 门口地垫
    R(c, 136, 106, 28, 4, C.redD);

    // ══════ ⑥ 便利店 x 186–250 ══════
    R(c, 186, 54, 64, 64, C.wall);
    R(c, 186, 54, 64, 3, C.wallL);
    R(c, 244, 54, 6, 64, C.wallD);
    // 绿色横带招牌
    R(c, 186, 58, 62, 14, C.green);
    R(c, 186, 58, 62, 1, C.greenL);
    R(c, 186, 71, 62, 1, C.greenD);
    PXT(c, '便利店', 187, 57, '#F6F2E8', 1);
    // 大玻璃橱窗（三类简化：货架色块）
    R(c, 190, 76, 48, 32, C.woodD);
    R(c, 191, 77, 46, 30, C.glass);
    R(c, 194, 78, 2, 28, C.glassHi);
    R(c, 214, 77, 1, 30, C.glassD);
    R(c, 232, 77, 1, 30, C.glassD);
    for (let x = 193; x < 236; x += 6) {
      R(c, x, 92, 4, 3, ['#D8A050', '#C4504A', '#4E8A62', '#5A6A8C'][(x / 6 | 0) % 4]);
    }
    // 自动贩卖机
    R(c, 238, 80, 11, 38, C.red);
    R(c, 238, 80, 11, 1, C.redL);
    R(c, 239, 83, 9, 18, '#D8E4EC');
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) R(c, 240 + j * 4, 84 + i * 5, 3, 4, ['#C4504A', '#4E8A62', '#DAB461'][(i + j) % 3]);
    R(c, 240, 104, 7, 4, '#3A3A44');
    R(c, 186, 118, 64, 2, C.wallDD);

    // ══════ ⑦ 面馆 x 250–320 ══════
    R(c, 250, 60, 70, 58, C.wood);
    R(c, 250, 60, 70, 3, C.woodL);
    R(c, 316, 60, 4, 58, C.woodD);
    for (let y = 68; y < 116; y += 11) R(c, 250, y, 66, 1, C.woodD);
    // 招牌
    R(c, 252, 62, 52, 18, '#F0DCB0');
    R(c, 252, 62, 52, 1, C.woodDD); R(c, 252, 79, 52, 1, C.woodDD);
    PXT(c, '面馆', 262, 63, C.redD, 1);
    // 暖帘（蓝底白字圆，三片）
    for (let i = 0; i < 3; i++) {
      R(c, 262 + i * 11, 80, 10, 14, '#3A4A6A');
      R(c, 262 + i * 11, 80, 10, 1, '#546594');
      R(c, 265 + i * 11, 84, 4, 4, '#E8ECF4');
      R(c, 266 + i * 11, 85, 2, 2, '#3A4A6A');
    }
    // 门洞 + 窗
    R(c, 262, 94, 32, 24, '#241C12');
    R(c, 296, 92, 14, 14, C.woodD);
    R(c, 297, 93, 12, 12, '#E8D8A8');
    // 邮筒
    R(c, 302, 100, 9, 18, C.red);
    R(c, 302, 100, 9, 1, C.redL);
    R(c, 302, 104, 9, 1, C.redD);
    R(c, 304, 106, 5, 2, '#2A2A32');
    R(c, 302, 116, 9, 2, C.coolD);
    // 电线杆（街道地标，贯穿上下）
    R(c, 313, 18, 3, 100, C.cool);
    R(c, 314, 18, 1, 100, C.coolD);
    R(c, 306, 26, 14, 2, C.coolD);
    R(c, 306, 34, 14, 2, C.coolD);

    // ══════ ⑧ 街道道具（人行走道前沿一排） ══════
    // 自行车（靠小卖部）
    R(c, 26, 104, 2, 14, C.coolD);
    R(c, 44, 104, 2, 14, C.coolD);
    R(c, 27, 104, 18, 2, C.coolL);
    R(c, 30, 100, 10, 2, C.cool);
    R(c, 33, 96, 6, 4, C.coolL);
    // 垃圾箱（KTV 侧）
    R(c, 118, 108, 10, 10, C.greenD);
    R(c, 118, 108, 10, 2, C.green);
    R(c, 118, 106, 10, 2, C.greenL);
    // 消防栓
    R(c, 126, 110, 5, 8, C.red);
    R(c, 125, 112, 7, 2, C.redD);
    // 告示板
    R(c, 196, 96, 14, 16, C.woodD);
    R(c, 197, 97, 12, 14, '#F4F0E4');
    R(c, 199, 99, 8, 1, '#8A8A92'); R(c, 199, 102, 8, 1, '#8A8A92'); R(c, 199, 105, 5, 1, '#8A8A92');
    // 盆栽 ×2
    R(c, 62, 112, 6, 6, C.woodD);
    R(c, 62, 108, 6, 4, C.green);
    R(c, 63, 106, 4, 2, C.greenL);
    R(c, 246, 112, 6, 6, C.woodD);
    R(c, 246, 108, 6, 4, C.greenD);

    // ══════ ⑨ 地面：人行道 / 路缘 / 沥青路面 ══════
    R(c, 0, 118, 320, 12, C.walk);
    R(c, 0, 118, 320, 1, C.walkD);
    for (let x = 0; x < 320; x += 16) R(c, x, 119, 1, 11, C.walkD);  // 地砖竖缝
    R(c, 0, 130, 320, 4, C.curb);
    R(c, 0, 130, 320, 1, '#9E9E96');
    R(c, 0, 134, 320, 46, C.road);
    R(c, 0, 134, 320, 2, '#4E545A');          // 路缘阴影
    // 车道线（两条平行虚线，横铺，绝不汇聚）
    for (let x = 4; x < 320; x += 26) {
      R(c, x, 146, 14, 3, C.roadLine);
      R(c, x + 6, 162, 14, 3, C.roadLine);
    }
    // 路面颗粒
    for (let i = 0; i < 46; i++) {
      const x = (i * 53) % 318, y = 137 + (i * 11) % 40;
      R(c, x, y, 1, 1, i % 3 ? C.roadL : '#545A60');
    }
    // 井盖
    R(c, 92, 152, 14, 8, '#4A5056');
    R(c, 93, 153, 12, 6, '#5C6369');
    R(c, 96, 155, 6, 1, '#454B51');

    // ══════ ⑩ 建筑落地投影（硬边、水平，不拉斜线以免产生透视） ══════
    c.globalAlpha = .18;
    R(c, 0, 118, 58, 3, C.coolD);
    R(c, 58, 118, 54, 3, C.coolD);
    R(c, 112, 118, 74, 4, C.coolD);
    R(c, 186, 118, 64, 3, C.coolD);
    R(c, 250, 118, 70, 3, C.coolD);
    c.globalAlpha = 1;
  }

  window.SPEC = {
    fps: 24, duration: 4.0,
    grade: 'brightness(1.0) saturate(1.06) contrast(1.02)',
    fadeIn: 0, fadeOut: 0,
    shots: [{ t0: 0, t1: 4.0, scene: 'street', vig: .12, cam: false, draw(pc) { drawStreet(pc); } }],
    subs: [],
  };
})();
