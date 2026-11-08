// pv_bed.js — 卧室场景（纯代码，320×180 像素层，白天）
// 规格：skills/场景库-v1.md 白天底图规格 + 二维正交侧视（墙面平铺，家具单层排列，无透视）
// 硬约定：坐标整数；每物体 ≥3 档明度；层序远到近；地面中段留空给人物站位
(function () {
  const C = {
    // 墙（奶油上带 / 浅蓝护墙板）
    wallL: '#F2E8CE', wall: '#E5D8B5', wallD: '#CDBE9A', wallDD: '#B0A180',
    panelL: '#B8D2E2', panel: '#A8C4D8', panelD: '#8FAEC4',
    // 踢脚线 / 地板
    base: '#C9BA95', baseD: '#A8996F',
    floorL: '#C8A276', floor: '#B08A5E', floorD: '#8F6C44', floorDD: '#6F5232',
    // 木家具（3 档）
    woodL: '#C89C68', wood: '#A87546', woodD: '#7A5330', woodDD: '#553819',
    // 布（奶油 / 浅蓝 / 粉）
    clothL: '#FDF6E6', cloth: '#F0E6D2', clothD: '#D8CBAD',
    blueL: '#CFE2F0', blue: '#A8C8E0', blueD: '#7FA8C8',
    pink: '#E8B4B8', pinkD: '#C88E96',
    // 阴影 / 冷色
    coolD: '#2D3343', cool: '#414A5A', coolL: '#5A6478',
    // 点缀
    gold: '#DAB461', red: '#C4504A', green: '#4E8A62', greenL: '#6E9F7C', greenD: '#3A6B4A',
    // 窗外的天
    sky1: '#8FB8DC', sky2: '#B4D2EA', cloud: '#FFFFFF',
    // 玻璃
    glass: '#C8E0EE', glassHi: '#EAF6FC',
    ink: '#2A2A32',
  };

  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x | 0, y | 0, w | 0, h | 0); };

  // ---- 3×5 微型点阵数字（闹钟 LED 用，16px 会太大） ----
  const NUM = {
    '0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'],
    '2': ['111', '001', '111', '100', '111'], '3': ['111', '001', '111', '001', '111'],
    '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '111', '001', '111'],
    '6': ['111', '100', '111', '101', '111'], '7': ['111', '001', '010', '010', '010'],
    '8': ['111', '101', '111', '101', '111'], '9': ['111', '101', '111', '001', '111'],
    ':': ['000', '010', '000', '010', '000'],
  };
  function mini(c, s, x, y, col, sc) {
    let cx = x;
    c.fillStyle = col;
    for (const ch of s) {
      const bm = NUM[ch];
      if (bm) for (let r = 0; r < 5; r++) for (let i = 0; i < 3; i++) {
        if (bm[r][i] === '1') c.fillRect(cx + i * sc, y + r * sc, sc, sc);
      }
      cx += 4 * sc;
    }
  }

  function drawRoom(c) {
    // ══════ ① 墙：上奶油 + 下浅蓝护墙板（两段式，水平线，无透视） ══════
    R(c, 0, 0, 320, 96, C.wall);
    R(c, 0, 0, 320, 4, C.wallL);
    // 墙面极淡竖向肌理（4px 一根，避免大片死板）
    for (let x = 0; x < 320; x += 4) { c.globalAlpha = .35; R(c, x, 4, 1, 92, C.wallL); c.globalAlpha = 1; }
    R(c, 0, 96, 320, 2, C.wallD);            // 腰线
    R(c, 0, 98, 320, 38, C.panel);           // 护墙板
    for (let x = 0; x < 320; x += 12) R(c, x, 98, 1, 38, C.panelD);
    R(c, 0, 98, 320, 2, C.panelL);
    // 踢脚线
    R(c, 0, 134, 320, 6, C.base);
    R(c, 0, 134, 320, 1, C.wallDD);
    R(c, 0, 139, 320, 1, C.baseD);

    // ══════ ② 地板：木条 + 板缝（横条，不做透视梯形） ══════
    R(c, 0, 140, 320, 40, C.floor);
    R(c, 0, 140, 320, 3, C.floorL);
    for (let y = 144; y < 180; y += 9) R(c, 0, y, 320, 1, C.floorD);
    for (let x = 0; x < 320; x += 46) R(c, x, 144, 1, 36, C.floorD);
    R(c, 0, 176, 320, 4, C.floorDD);
    // 地板木纹碎块
    for (let i = 0; i < 22; i++) {
      const x = (i * 47) % 316, y = 146 + (i * 13) % 30;
      R(c, x, y, 3 + (i % 3), 1, i % 2 ? C.floorL : C.floorD);
    }

    // ══════ ③ 左：衣柜 x 4–44 ══════
    R(c, 4, 34, 40, 104, C.wood);
    R(c, 4, 34, 40, 3, C.woodL);
    R(c, 4, 34, 2, 104, C.woodL);
    R(c, 40, 34, 4, 104, C.woodD);
    R(c, 4, 34, 40, 2, C.woodDD);
    R(c, 22, 38, 1, 100, C.woodD);           // 双门缝
    R(c, 12, 88, 7, 2, C.gold);              // 左拉手
    R(c, 30, 88, 7, 2, C.gold);              // 右拉手
    R(c, 4, 132, 40, 6, C.woodDD);           // 柜脚
    R(c, 6, 40, 14, 30, C.woodD);            // 门板凹槽
    R(c, 7, 41, 12, 28, C.woodL);
    R(c, 24, 40, 14, 30, C.woodD);
    R(c, 25, 41, 12, 28, C.woodL);

    // ══════ ④ 书桌 x 48–90（桌面 y 96）+ 台灯 + 杂物 ══════
    R(c, 48, 96, 42, 4, C.woodL);            // 桌面
    R(c, 48, 100, 42, 2, C.woodD);
    R(c, 50, 102, 4, 34, C.woodD);           // 左桌腿
    R(c, 84, 102, 4, 34, C.woodD);           // 右桌腿
    R(c, 48, 102, 42, 3, C.wood);            // 挡板
    R(c, 50, 116, 38, 1, C.woodD);
    // 台灯（暖金灯罩 + 光锥）
    R(c, 54, 86, 10, 3, C.gold);
    R(c, 55, 83, 8, 3, C.goldL);
    R(c, 58, 89, 2, 8, C.coolD);
    R(c, 53, 96, 12, 1, C.gold);             // 底座
    c.globalAlpha = .18; R(c, 46, 96, 26, 10, C.gold); c.globalAlpha = 1;
    // 笔记本 + 笔
    R(c, 66, 94, 12, 3, '#F6F0DC');
    R(c, 66, 94, 12, 1, '#FFFFFF');
    R(c, 70, 95, 1, 2, C.coolL);
    R(c, 80, 94, 7, 3, '#E8DCC0');
    // 收音机（桌上白色小机）
    R(c, 62, 88, 14, 8, '#EDE6D6');
    R(c, 62, 88, 14, 1, '#FFFFFF');
    R(c, 63, 90, 6, 4, C.coolL);
    R(c, 71, 90, 3, 4, C.coolD);

    // ══════ ⑤ 海报（吉他图形，无文字）x 94–116 ══════
    R(c, 94, 36, 22, 30, C.woodD);
    R(c, 95, 37, 20, 28, '#DCEAF4');
    R(c, 95, 37, 20, 1, '#FFFFFF');
    // 吉他剪影
    R(c, 102, 44, 6, 8, C.red);
    R(c, 103, 46, 4, 4, C.redD);
    R(c, 104, 40, 2, 6, C.wood);
    R(c, 104, 38, 2, 2, C.woodDD);
    R(c, 101, 52, 8, 1, C.gold);
    R(c, 97, 58, 16, 1, C.coolL);
    R(c, 99, 61, 12, 1, C.coolL);

    // ══════ ⑥ 床 x 114–202（床头板在左） ══════
    // 床头板（木格栅）
    R(c, 112, 90, 18, 48, C.wood);
    R(c, 112, 90, 18, 2, C.woodL);
    for (let y = 94; y < 138; y += 7) R(c, 113, y, 16, 1, C.woodD);
    R(c, 112, 90, 2, 48, C.woodL);
    R(c, 128, 90, 2, 48, C.woodD);
    // 床架
    R(c, 126, 112, 76, 22, C.wood);
    R(c, 126, 112, 76, 2, C.woodL);
    R(c, 126, 132, 76, 4, C.woodDD);         // 床脚横梁
    R(c, 126, 136, 4, 6, C.woodDD);
    R(c, 198, 136, 4, 6, C.woodDD);
    // 床垫（白）
    R(c, 128, 104, 72, 10, C.clothL);
    R(c, 128, 104, 72, 1, '#FFFFFF');
    R(c, 128, 112, 72, 2, C.clothD);
    // 枕头 ×2
    R(c, 130, 96, 22, 10, C.clothL);
    R(c, 130, 96, 22, 1, '#FFFFFF');
    R(c, 130, 104, 22, 2, C.clothD);
    R(c, 154, 98, 18, 8, C.blueL);
    R(c, 154, 98, 18, 1, C.blue);
    R(c, 154, 104, 18, 2, C.blueD);
    // 被子（浅蓝，折角，三道褶）
    R(c, 144, 110, 56, 14, C.blue);
    R(c, 144, 110, 56, 2, C.blueL);
    for (let x = 150; x < 198; x += 9) R(c, x, 112, 1, 12, C.blueD);
    R(c, 144, 122, 56, 3, C.blueD);
    R(c, 162, 110, 16, 4, C.blueL);          // 翻折
    // 床下阴影
    c.globalAlpha = .22; R(c, 126, 140, 76, 3, C.coolD); c.globalAlpha = 1;

    // ══════ ⑦ 床头柜 x 202–230 + 闹钟 + 书堆 ══════
    R(c, 202, 116, 28, 22, C.wood);
    R(c, 202, 116, 28, 2, C.woodL);
    R(c, 202, 136, 28, 3, C.woodDD);
    R(c, 205, 120, 22, 7, C.woodD);          // 抽屉
    R(c, 214, 123, 4, 1, C.gold);
    R(c, 202, 132, 28, 2, C.woodD);
    // 闹钟（黑机身 + 红色 LED 23:47）
    R(c, 205, 103, 22, 13, '#2A2A32');
    R(c, 205, 103, 22, 1, '#4A4A56');
    R(c, 206, 105, 20, 9, '#141418');
    mini(c, '23:47', 207, 106, '#E8503C', 1);
    R(c, 203, 116, 2, 2, '#3A3A44');
    // 书堆
    R(c, 208, 100, 14, 3, C.red);
    R(c, 209, 97, 12, 3, C.green);
    R(c, 210, 94, 10, 3, C.blueD);

    // ══════ ⑧ 窗 x 232–304（白天蓝天 + 云 + 窗帘） ══════
    R(c, 230, 34, 76, 74, '#FFFFFF');        // 窗框外沿
    R(c, 232, 36, 72, 70, C.woodD);
    // 窗外风景（填满整个玻璃区 38–106）
    R(c, 234, 38, 68, 18, C.sky1);
    R(c, 234, 56, 68, 16, C.sky2);
    R(c, 234, 72, 68, 16, '#C6E0EE');
    R(c, 240, 46, 16, 3, C.cloud);
    R(c, 243, 49, 12, 2, C.cloud);
    R(c, 268, 58, 20, 3, C.cloud);
    R(c, 272, 61, 12, 2, C.cloud);
    // 窗外对面的屋顶线（三栋，平齐排列，不做透视）
    R(c, 234, 88, 18, 18, C.coolL);
    R(c, 236, 84, 12, 4, C.cool);
    R(c, 254, 92, 20, 14, '#7E92A8');
    R(c, 256, 88, 14, 4, C.coolL);
    R(c, 276, 86, 14, 20, C.coolL);
    R(c, 278, 82, 10, 4, C.cool);
    // 屋顶上的树冠
    R(c, 288, 78, 10, 8, C.greenD);
    R(c, 290, 75, 6, 4, C.green);
    // 玻璃反光
    R(c, 236, 40, 4, 64, C.glassHi);
    c.globalAlpha = .35; R(c, 246, 40, 2, 64, C.glassHi); c.globalAlpha = 1;
    // 窗棂
    R(c, 266, 36, 2, 70, C.woodD);
    R(c, 232, 70, 72, 2, C.woodD);
    // 窗台 + 照片框
    R(c, 226, 104, 84, 6, C.woodL);
    R(c, 226, 104, 84, 1, '#FFFFFF');
    R(c, 226, 110, 84, 2, C.woodD);
    R(c, 238, 96, 12, 9, C.woodD);
    R(c, 239, 97, 10, 7, '#DBE8F2');
    R(c, 253, 94, 10, 11, C.woodD);
    R(c, 254, 95, 8, 9, '#F0E6D2');
    // 窗帘（左右各一片，竖褶）
    R(c, 224, 30, 12, 76, C.blueL);
    for (let y = 32; y < 106; y += 6) R(c, 226, y, 8, 3, C.blueD);
    R(c, 224, 30, 12, 2, C.blueD);
    R(c, 302, 30, 12, 76, C.blueL);
    for (let y = 32; y < 106; y += 6) R(c, 304, y, 8, 3, C.blueD);
    R(c, 302, 30, 12, 2, C.blueD);
    // 窗帘杆
    R(c, 218, 26, 100, 3, C.woodD);
    R(c, 218, 26, 100, 1, C.woodL);
    R(c, 216, 24, 5, 7, C.gold);
    R(c, 316, 24, 5, 7, C.gold);

    // ══════ ⑨ 右墙：空调 + 三角旗 + 吉他 ══════
    R(c, 240, 12, 44, 14, '#EDE6D6');
    R(c, 240, 12, 44, 1, '#FFFFFF');
    R(c, 240, 24, 44, 2, C.clothD);
    for (let x = 244; x < 280; x += 5) R(c, x, 18, 2, 5, C.coolL);
    R(c, 240, 26, 3, 6, C.clothD);
    // 三角旗（从左墙拉到右）
    R(c, 8, 14, 228, 1, C.coolD);
    for (let i = 0; i < 12; i++) {
      const x = 12 + i * 19;
      const col = [C.red, C.gold, C.green, C.blueD][i % 4];
      R(c, x, 15, 8, 2, col);
      R(c, x + 2, 17, 4, 2, col);
      R(c, x + 3, 19, 2, 1, col);
    }
    // 吉他（挂在衣柜与海报之间的空墙上，横挂更省地方）
    R(c, 46, 44, 34, 3, C.coolD);            // 挂钉横杆
    R(c, 48, 42, 3, 5, C.gold);
    R(c, 72, 42, 3, 5, C.gold);
    R(c, 52, 48, 24, 3, C.woodD);            // 琴颈（横放）
    R(c, 50, 47, 3, 5, C.woodDD);
    R(c, 60, 50, 20, 14, C.wood);            // 音箱
    R(c, 58, 53, 24, 9, C.wood);
    R(c, 62, 52, 16, 11, C.woodL);
    R(c, 66, 54, 8, 7, C.woodDD);            // 音孔
    R(c, 69, 56, 2, 3, '#3A2418');
    R(c, 60, 62, 20, 1, C.woodDD);

    // ══════ ⑩ 地面道具：地毯 / 拖鞋 / 纸箱 / 抱枕 ══════
    // 地毯（圆角矩形，横向平铺）
    R(c, 112, 150, 96, 26, C.pink);
    R(c, 114, 152, 92, 22, C.pink);
    R(c, 114, 150, 92, 1, '#F2C8CC');
    R(c, 114, 172, 92, 2, C.pinkD);
    for (let x = 120; x < 204; x += 12) R(c, x, 154, 2, 16, C.pinkD);
    // 拖鞋（地毯左侧）
    R(c, 88, 158, 12, 5, C.blueD);
    R(c, 88, 158, 12, 1, C.blue);
    R(c, 90, 156, 8, 2, C.blueL);
    R(c, 86, 166, 12, 5, C.blueD);
    R(c, 86, 166, 12, 1, C.blue);
    R(c, 88, 164, 8, 2, C.blueL);
    // 纸箱
    R(c, 246, 148, 22, 20, '#C8A87A');
    R(c, 246, 148, 22, 2, '#DCBE92');
    R(c, 246, 156, 22, 1, '#A8885E');
    R(c, 254, 148, 6, 1, '#A8885E');
    R(c, 250, 150, 6, 4, '#E8E0CC');         // 标签
    // 抱枕（地毯上）
    R(c, 176, 156, 18, 12, C.gold);
    R(c, 176, 156, 18, 2, '#EFD08E');
    R(c, 176, 166, 18, 2, C.woodD);
    R(c, 182, 159, 6, 1, '#C79A52');

    // ══════ ⑪ 家具落地阴影（硬边水平，不用斜线） ══════
    c.globalAlpha = .16;
    R(c, 4, 140, 40, 3, C.coolD);
    R(c, 48, 140, 42, 2, C.coolD);
    R(c, 114, 140, 90, 3, C.coolD);
    R(c, 204, 140, 22, 2, C.coolD);
    R(c, 246, 168, 24, 3, C.coolD);
    c.globalAlpha = 1;
  }

  window.SPEC = {
    fps: 24, duration: 4.0,
    grade: 'brightness(1.02) saturate(1.04) contrast(1.01)',
    fadeIn: 0, fadeOut: 0,
    shots: [{ t0: 0, t1: 4.0, scene: 'bedroom', vig: .16, cam: false, draw(pc) { drawRoom(pc); } }],
    subs: [],
  };
})();
