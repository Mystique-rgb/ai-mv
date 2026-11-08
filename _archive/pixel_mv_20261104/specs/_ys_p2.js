// _ys_p2.js —《于是》v4 全片 spec 第二片：43 镜分镜（本文件先做前 30s 的 SH01–SH06）

// ---------- 存档缩略图小画 ----------
function thumbRoom(c, x, y, w, h) {
  R(c, x, y, w, h, '#0E1420');
  R(c, x + 3, y + 4, w * .5, h * .46, '#1A2234');      // 窗
  R(c, x + 3, y + 4, w * .5, 1, '#2E3854');
  R(c, x + 4, y + 6, 5, 6, '#232840');
  R(c, x + w * .62, y + h * .38, 7, 9, '#26204A');     // 台灯
  R(c, x + w * .64, y + h * .35, 4, 3, PAL.gold);
  R(c, x + w * .28, y + h * .6, 12, 11, '#3A4460');    // 人影
  R(c, x + w * .3, y + h * .56, 7, 5, '#2A2036');
}
function thumbPair(c, x, y, w, h) {
  R(c, x, y, w, h, '#3A3450');
  dith(c, x, y, w, h, '#3A3450', '#2A2438', .4);
  R(c, x + 6, y + h * .42, 9, 14, '#6E86A8');
  R(c, x + 7, y + h * .36, 7, 7, '#C9A382');
  R(c, x + 16, y + h * .44, 8, 12, '#A898C8');
  R(c, x + 17, y + h * .38, 6, 6, '#C9A382');
  R(c, x + 18, y + h * .38, 4, 5, '#15141A');
}
function thumbEmpty(c, x, y, w, h) {
  R(c, x, y, w, h, '#0A0D16');
  R(c, x + w / 2 - 2, y + h / 2 - 9, 4, 11, '#2A3050');
  R(c, x + w / 2 - 2, y + h / 2 + 5, 4, 4, '#2A3050');
}

// ---------- SH03 手柄特写（侧视：手柄横放 + 右手拇指压键）----------
function closeupPad(c, lt, o = {}) {
  R(c, 0, 0, 320, 180, '#0A0D16');
  dith(c, 0, 0, 320, 180, '#0A0D16', '#111624', .45);
  // 桌面
  R(c, 0, 150, 320, 30, '#12161F');
  dith(c, 0, 150, 320, 30, '#12161F', '#0B0E16', .4);
  // 屏幕冷光（左上）
  lightSpot(c, 10, 96, 150, 54, '#2A3350', .5);
  glow(c, 40, 30, 90, 60, '#8FA0C0', .10);

  // ---- 手柄机身（横放）----
  const GX = 54, GY = 74, GW = 190, GH = 52;
  R(c, GX, GY + 8, GW, GH - 8, '#1B2436');             // 主体
  R(c, GX + 4, GY, GW - 8, 10, '#232C44');             // 上弧
  R(c, GX + 10, GY - 3, GW - 20, 5, '#232C44');
  R(c, GX + 8, GY - 3, GW - 16, 1, '#3A4460');         // 顶边光
  // 握把（左右）
  R(c, GX - 8, GY + 34, 24, 34, '#161E30');
  R(c, GX + GW - 16, GY + 34, 24, 34, '#161E30');
  R(c, GX - 8, GY + 34, 24, 1, '#2E3854');
  R(c, GX + GW - 16, GY + 34, 24, 1, '#2E3854');
  R(c, GX - 8, GY + 34, 1, 34, '#232C44');
  R(c, GX + GW + 7, GY + 34, 1, 34, '#232C44');
  // 十字键
  R(c, GX + 22, GY + 30, 22, 7, '#0E1220');
  R(c, GX + 29, GY + 22, 8, 23, '#0E1220');
  R(c, GX + 29, GY + 30, 8, 7, '#2E3854');
  R(c, GX + 29, GY + 30, 8, 1, '#3E4A66');
  // 四键
  const kx = GX + 132, ky = GY + 18;
  const keys = [[kx + 12, ky], [kx + 24, ky + 10], [kx, ky + 10], [kx + 12, ky + 20]];
  for (let i = 0; i < 4; i++) {
    const pressed = (i === 1 && o.press);
    R(c, keys[i][0], keys[i][1] + (pressed ? 1 : 0), 9, 9, pressed ? '#5A6A88' : '#2A3348');
    R(c, keys[i][0], keys[i][1], 9, 1, pressed ? '#8A9AB8' : '#3E4A66');
  }
  // 左摇杆
  R(c, GX + 62, GY + 26, 20, 17, '#0E1220');
  R(c, GX + 66, GY + 29, 12, 11, '#262F44');
  R(c, GX + 67, GY + 30, 10, 3, '#3E4A66');
  // 右摇杆
  R(c, GX + 104, GY + 26, 20, 17, '#0E1220');
  R(c, GX + 108, GY + 29, 12, 11, '#262F44');
  R(c, GX + 109, GY + 30, 10, 3, '#3E4A66');
  // LED
  const led = o.ledOn ? PAL.red : '#4A2228';
  R(c, GX + 88, GY + 10, 14, 5, led);
  if (o.ledOn) glow(c, GX + 95, GY + 12, 30, 16, PAL.red, .32);

  // ---- 右手（从右下方伸入，拇指压四键）----
  const SK = PAL.skin, SKD = PAL.skinDk, SKL = PAL.skinLt;
  // 手掌侧面（斜置大块）
  R(c, 226, 44, 62, 78, SK);
  R(c, 240, 40, 48, 10, SK);                            // 掌背隆起
  R(c, 226, 44, 62, 8, SKL);                            // 受光上缘
  R(c, 226, 104, 62, 18, SKD);                          // 掌根暗
  R(c, 226, 44, 8, 78, SKD);
  // 四指（绕到手柄下缘）
  for (let i = 0; i < 4; i++) {
    const fx = 222 - i * 3, fy = 78 + i * 15;
    R(c, fx, fy, 46, 13, i % 2 ? SK : SKL);
    R(c, fx, fy + 11, 46, 3, SKD);
  }
  // 拇指（向左上方伸出，压右侧按键）
  const tp = o.pressK == null ? .45 : o.pressK;
  const tx = 176, ty = 62 + 10 * (1 - tp);
  R(c, tx + 30, ty + 6, 26, 16, SKL);                    // 拇指根
  R(c, tx, ty - 4, 34, 20, SK);                          // 拇指段
  R(c, tx, ty - 4, 34, 6, SKL);
  R(c, tx - 8, ty + 2 + 8 * (1 - tp), 16, 17, SKL);      // 指头
  R(c, tx - 8, ty + 17 + 8 * (1 - tp), 16, 3, SKD);      // 指头下缘
  R(c, tx + 2, ty - 6, 12, 3, '#E8C8A8');                // 指甲
  // 冷白 rim（屏幕光在左上）
  R(c, 240, 38, 48, 2, PAL.cool);
  R(c, 286, 48, 2, 46, '#8FA0C0');
  R(c, GX + 8, GY - 4, GW - 16, 1, '#C9D4E8');
  R(c, GX - 9, GY + 34, 1, 30, '#5A6A88');

  // 拇指压下时的按键反馈光
  if (o.press) {
    glow(c, GX + 140, GY + 30, 26, 20, '#8FA0C0', .22);
  }
  shadeRect(c, 0, 0, 320, 180, .05);
}

// ---------- SH04 窗台坐姿（背影）----------
function drawSeatedHim(c, cx, footY, k, o) {
  const G = 2 * k;
  const P = (x, y, w, h, col) => R(c, cx + x * G, footY - (y + h) * G, w * G, h * G, col);
  const back = o.view === 'back';
  const C = { coat: PAL.coat, dk: PAL.coatDk, lt: PAL.coatLt };
  // 小腿下垂 + 鞋（脚离地一点，悬着）
  P(-5.5, 1, 4.6, 14, PAL.pants);
  P(1, 1, 4.6, 14, PAL.pants);
  P(-5.5, 1, 1.4, 14, PAL.pantsDk);
  P(4.6, 1, 1.4, 14, PAL.pantsDk);
  P(-6, .5, 5.4, 2.6, PAL.shoe);
  P(1, .5, 5.4, 2.6, PAL.shoe);
  // 大腿水平（搭在窗台上）
  P(-7, 14.5, 13.5, 4.2, PAL.pants);
  P(-7, 14.5, 13.5, 1, PAL.pantsDk);
  // 躯干
  P(-8, 30, 16, 4.2, C.coat);
  P(-6.5, 18, 13, 13, C.coat);
  P(-7, 18, 14, 2.4, C.coat);
  P(-6.5, 19, 1.4, 15, C.dk);
  P(5.4, 19, 1.2, 15, C.lt);
  if (back) {
    P(-1, 19, 1.2, 16, C.dk);
    P(-8, 33, 16, 1.2, C.dk);
    P(-8, 30, 16, 1, C.lt);
  } else {
    P(-1.4, 28, 2.8, 5, PAL.innerDk);
    P(-3.2, 31.8, 2, 1.4, PAL.shirt);
    P(-2.4, 30.6, 1.8, 1.3, PAL.shirt);
    P(1.2, 31.8, 2, 1.4, PAL.shirt);
    P(.6, 30.6, 1.8, 1.3, PAL.shirt);
    P(-8, 29, 4.2, 1.5, C.dk);
    P(3.8, 30, 4.2, 1.5, C.dk);
  }
  // 手臂（垂在身侧，手搭大腿）
  P(-9.5, 19, 2, 11, C.coat);
  P(7.5, 19, 2, 11, C.coat);
  P(-9.5, 16, 2.2, 3.4, PAL.skinDk);
  P(7.5, 16, 2.2, 3.4, PAL.skinDk);
  // 颈 + 头（坐姿头位 34~46）
  P(-2, 33, 4, 2.6, PAL.skin);
  faceV4(c, cx - 6 * G, footY - 47 * G, G, { who: 'him', ex: o.ex || 'E5', back });
  // rim（台灯在右）
  P(2, 46.2, 4.5, 1.1, PAL.gold);
  P(1, 33.2, 8.5, .9, PAL.gold);
  P(9.5, 27.5, 1, 4.2, PAL.goldDk);
  P(6, 13.5, 1, 3.6, PAL.goldRe);
  P(4.4, 1.4, 2, .8, PAL.goldRe);
}

// ============================================================
//  前 30s 分镜
// ============================================================
const SHOTS = [
  // ── SH01 标题卡（0–5.5）──
  { t0: 0, t1: 5.5, scene: 'black', cam: false, vig: .62,
    draw(pc, lt) { sc_black(pc, lt, { grain: true }); } },

  // ── SH02 CRT 开机 + 存档槽（5.5–9.5）──
  { t0: 5.5, t1: 9.5, scene: 'menu', cam: false, vig: .5, in: { type: 'blk', dur: .35, hold: .18 },
    draw(pc, lt) {
      const on = lt > .55;
      sc_menu(pc, lt, {
        sel: 0, screenOff: !on,
        thumb: [thumbRoom, thumbEmpty, thumbEmpty],
      });
      if (lt > .3 && lt < .8) {
        const p = (lt - .3) / .5;
        R(pc, 26, 16 + 148 * p - 2, 268, 3, '#C9D4E8');
      }
    } },

  // ── SH03 手柄特写（9.5–13.48）──
  { t0: 9.5, t1: 13.48, scene: 'pad', cam: false, vig: .55, in: { type: 'dither', dur: .28 },
    draw(pc, lt) {
      const press = HZ((lt - 2.1) / .16) * (lt < 3.4 ? 1 : Math.max(0, 1 - (lt - 3.4) / .3));
      const ledOn = lt > .45;
      closeupPad(pc, lt, { press: press > .5, pressK: 1 - press * .5, ledOn });
    } },

  // ── SH04 他坐窗台背影（13.48–21.00）──
  { t0: 13.48, t1: 21.00, scene: 'room', cam: false, vig: .5, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_room(pc, lt, { lamp: true, bed: true, cup: true });
      // 坐在窗台（窗台 y=120，脚 147）
      drawSeatedHim(pc, 96, 147, 1, { view: 'back', ex: 'E1' });
      // 窗台上手柄（暗 LED）
      R(pc, 120, 116, 14, 6, '#1B2436');
      R(pc, 120, 116, 14, 1, '#31415E');
      R(pc, 133, 114, 3, 3, '#4A2228');
      // 手机冷光从下打一点
      lightCone(pc, 96, 146, 8, 20, 14, '#8FA0C0', .14);
    } },

  // ── SH05 雨街：他插兜站光路旁，镜头摇上 4 楼黑窗（21.00–27.88）──
  { t0: 21.00, t1: 27.88, scene: 'street', vig: .54, in: { type: 'dither', dur: .45 },
    cam(lt) {
      const p = HZ(lt / 5.4), e = EZo(p);
      const y = 152 - 118 * e;
      const z = 1 + .6 * e;
      const w = 320 / z, h = 180 / z;
      return [160 - w / 2, y - h * .58, w, h];
    },
    draw(pc, lt) {
      sc_street(pc, lt, { win4: true, lampX: 112 });
      figV4(pc, 120, 178, 1, { who: 'him', ex: 'E1', arm: 'pocket', light: 'gold' });
      const blink = .4 + .6 * Math.abs(Math.sin(lt * 1.2));
      c.save(); c.globalAlpha = blink * .75;
      R(pc, 230, 33, 2, 2, PAL.gold); R(pc, 230, 37, 2, 2, PAL.gold); R(pc, 230, 41, 2, 2, PAL.gold);
      c.restore();
    } },

  // ── SH06 躺地照手机（27.88–34.83；俯拍大脸 + 举手机）──
  { t0: 27.88, t1: 34.83, scene: 'room', cam: false, vig: .58, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      // 地板（俯视）
      R(pc, 0, 0, 320, 180, '#141828');
      dith(pc, 0, 0, 320, 180, '#141828', '#0E1120', .45);
      for (let x = 0; x < 320; x += 22) R(pc, x, 0, 1, 180, '#0F1322');
      for (let y = 0; y < 180; y += 44) R(pc, 0, y, 320, 1, '#0F1322');
      // 肩 + 衣（脸下方，被画面裁）
      R(pc, 96, 136, 132, 44, PAL.coat);
      R(pc, 96, 136, 132, 4, PAL.coatLt);
      R(pc, 140, 136, 44, 18, PAL.innerDk);
      R(pc, 148, 136, 28, 12, PAL.shirt);
      // 大脸（u=6，脸框 12×12 格 = 72px）
      faceV4(pc, 126, 40, 6, { who: 'him', ex: 'E5' });
      // 手机（竖举，压在脸右上，屏幕朝下照脸）
      R(pc, 180, 22, 50, 92, '#0C0F18');
      R(pc, 182, 24, 46, 88, '#141A28');
      R(pc, 184, 26, 42, 82, '#C9D4E8');
      R(pc, 186, 28, 38, 9, '#AFC0DC');
      for (let i = 0; i < 5; i++) R(pc, 188, 42 + i * 13, 18 + (i * 7) % 16, 6, '#8FA0C0');
      // 握住手机的手（右下伸入，掌根 + 拇指）
      const SK = PAL.skin, SKD = PAL.skinDk, SKL = PAL.skinLt;
      R(pc, 198, 108, 42, 54, SK);
      R(pc, 198, 108, 42, 6, SKL);
      R(pc, 198, 108, 6, 54, SKL);
      R(pc, 198, 152, 42, 10, SKD);
      R(pc, 206, 104, 14, 6, '#E8C8A8');      // 指甲
      // 冷白光：屏幕照亮右侧脸
      glow(pc, 200, 64, 62, 56, '#C9D4E8', .26);
      lightCone(pc, 196, 68, 8, 30, 40, '#C9D4E8', .16);
      shadeRect(pc, 0, 0, 320, 180, .03);
    } },

  // ── SH07 窗玻璃时钟快进（34.83–40.89）──
  { t0: 34.83, t1: 40.89, scene: 'room', cam: false, vig: .54, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_room(pc, lt, { lamp: true, bed: false, cup: false });
      // 他用袖子擦出一块玻璃（清出一片看清外面）
      R(pc, 62, 46, 54, 40, '#1A2234');
      dith(pc, 62, 46, 54, 40, '#1A2234', '#242E44', .3);
      // 时钟是"玻璃上的雾被划掉"的效果 → 数字走 HD
    } },

  // ── SH08 天台数星星（40.89–47.88）──
  { t0: 40.89, t1: 47.88, scene: 'roof', cam: false, vig: .5, in: { type: 'dither', dur: .35 },
    draw(pc, lt) {
      sc_roof(pc, lt, { cloud: 0, moon: true });
      figV4(pc, 132, 176, 1, { who: 'him', ex: 'E1', arm: 'pocket', light: 'cool' });
    } },

  // ── SH09 手机列表（47.88–55.14）──
  { t0: 47.88, t1: 55.14, scene: 'phone', cam: false, vig: .5, in: { type: 'dither', dur: .28 },
    draw(pc, lt) {
      sc_phone(pc, lt, { list: true, unread: true });
      // 他的拇指悬停在第一条（HD 里画手指阴影）
    } },

  // ── SH10 打字不发送（55.14–63.19）──
  { t0: 55.14, t1: 63.19, scene: 'phone', cam: false, vig: .5, in: { type: 'dither', dur: .28 },
    draw(pc, lt) {
      const tw = HZ((lt - .6) / 3.2) * 52;
      sc_phone(pc, lt, { chat: true, input: true, inputW: tw });
    } },

  // ── SH11 过场 CG：她贴贴纸（63.19–70.00）──
  { t0: 63.19, t1: 70.00, scene: 'cg', cam: false, vig: .46, in: { type: 'flash', dur: .3, amt: .7 },
    draw(pc, lt) {
      sc_cg(pc, lt);
      // 手机背面大特写
      R(pc, 92, 8, 132, 164, '#0C0F18');
      R(pc, 95, 11, 126, 158, '#1A2032');
      R(pc, 95, 11, 126, 3, '#2A3050');
      R(pc, 95, 11, 3, 158, '#232840');
      R(pc, 218, 11, 3, 158, '#12172A');
      // 摄像头
      R(pc, 104, 22, 34, 24, '#0A0D16');
      R(pc, 108, 26, 11, 11, '#2E3854');
      R(pc, 122, 26, 11, 11, '#2E3854');
      R(pc, 110, 28, 5, 5, '#5A6A88');
      // 星星贴纸
      R(pc, 146, 82, 16, 16, PAL.gold);
      R(pc, 139, 88, 30, 5, PAL.gold);
      R(pc, 142, 86, 5, 5, '#FFF6DA');
      glow(pc, 154, 90, 48, 40, PAL.gold, .32);
      // 食指（右上方伸入，指尖压在贴纸上）
      R(pc, 162, 56, 15, 52, PAL.skinLt);
      R(pc, 162, 56, 15, 3, '#F0D0B0');
      R(pc, 162, 71, 15, 2, PAL.skinDk);
      R(pc, 162, 86, 15, 2, PAL.skinDk);
      R(pc, 162, 101, 15, 7, PAL.skinDk);
      R(pc, 154, 92, 10, 14, PAL.skin);
      R(pc, 155, 95, 7, 4, '#F0D0B0');
      // 拇指（下方托住机身）
      R(pc, 176, 112, 14, 34, PAL.skin);
      R(pc, 176, 112, 14, 3, PAL.skinLt);
      R(pc, 176, 142, 14, 4, PAL.skinDk);
      // 撕贴纸「刺啦」
      if (lt > 4.7) {
        const p = HZ((lt - 4.7) / .55);
        c.save(); c.globalAlpha = .6 * (1 - p);
        R(pc, 146 + p * 30, 82 - p * 16, 16, 16, PAL.gold);
        R(pc, 139 + p * 30, 88 - p * 16, 30, 5, PAL.gold);
        c.restore();
      }
    } },

  // ── SH12 过场 CG：两人并排（70.00–73.20）──
  { t0: 70.00, t1: 73.20, scene: 'cg', cam: false, vig: .46, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_cg(pc, lt);
      figV4(pc, 108, 178, 1, { who: 'him', ex: 'E3', arm: 'pocket', light: 'gold' });
      figV4(pc, 208, 178, 1, { who: 'her', ex: 'E3', arm: 'pocket', light: 'gold', star: true });
    } },

  // ── SH13 她正脸特写（73.20–76.69）──
  { t0: 73.20, t1: 76.69, scene: 'cg', cam: false, vig: .44, in: { type: 'dither', dur: .28 },
    draw(pc, lt) {
      sc_cg(pc, lt);
      // 脖子（在脸下）
      R(pc, 146, 84, 28, 22, PAL.skinDk);
      // 大块正脸（u=6 → 72px 宽）
      faceV4(pc, 124, 20, 6, { who: 'her', ex: 'E3', star: true });
      // 肩与 V 领
      R(pc, 78, 102, 164, 78, PAL.coatHer);
      R(pc, 78, 102, 164, 4, '#C0B2DE');
      R(pc, 78, 102, 5, 78, PAL.coatHerDk);
      R(pc, 237, 102, 5, 78, '#8A7AAA');
      // 玫红 V 领
      R(pc, 134, 102, 52, 9, PAL.innerHer);
      R(pc, 141, 111, 38, 9, PAL.innerHer);
      R(pc, 149, 120, 22, 10, PAL.innerHer);
      // 白衬衫领片
      R(pc, 126, 102, 9, 24, PAL.shirt);
      R(pc, 185, 102, 9, 24, PAL.shirt);
      R(pc, 126, 102, 9, 3, '#FFFFFF');
      R(pc, 185, 102, 9, 3, '#FFFFFF');
    } },

  // ── SH14 存档槽=合影（76.69–83.86）──
  { t0: 76.69, t1: 83.86, scene: 'menu', cam: false, vig: .5, in: { type: 'scan', dur: .4 },
    draw(pc, lt) {
      sc_menu(pc, lt, { sel: 0, thumb: [thumbPair, thumbRoom, thumbEmpty], progFrom: .35 + .5 * HZ(lt / 4) });
    } },

  // ── SH15 闸机回头（83.86–88.22）──
  { t0: 83.86, t1: 88.22, scene: 'gate', cam: false, vig: .52, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_gate(pc, lt, { gateOpen: true, gateLed: true });
      // 她走向闸机，第 1.3 秒回头
      const turn = lt > 1.3 && lt < 2.6;
      figV4(pc, 186, 152, .9, { who: 'her', ex: turn ? 'E3' : 'E1', arm: 'pocket', light: 'gold', star: true, view: turn ? 'front' : 'back' });
      // 他坐长椅，手抬到一半（E4 错愕）
      figV4(pc, 62, 154, .95, { who: 'him', pose: 'sit', ex: 'E4', arm: 'raise', light: 'gold' });
    } },

  // ── SH16 水面倒影（88.22–91.98）──
  { t0: 88.22, t1: 91.98, scene: 'street', cam: false, vig: .56, in: { type: 'fade', dur: .4, col: '#0A0806' },
    draw(pc, lt) {
      sc_street(pc, lt, { lampX: 118 });
      // 水洼
      R(pc, 84, 138, 96, 26, '#232040');
      dith(pc, 84, 138, 96, 26, '#232040', '#2A2748', .4);
      // 倒影（上下翻转的简化人形）
      const ry = 140;
      R(pc, 120, ry, 14, 22, '#4A5A78');
      R(pc, 122, ry + 22, 10, 8, '#3A4460');
      R(pc, 124, ry - 6, 8, 6, '#8A7A8A');
      // 水面波纹
      for (let i = 0; i < 5; i++) R(pc, 88 + i * 18, 146 + ((lt * 8 + i * 5) % 14), 14, 1, '#3A3660');
    } },

  // ── SH17 脚印（91.98–98.52）──
  { t0: 91.98, t1: 98.52, scene: 'street', vig: .54, in: { type: 'dither', dur: .3 },
    cam(lt) { return [40, 108, 240, 135]; },
    draw(pc, lt) {
      sc_street(pc, lt, { lampX: 96, rainN: 90 });
      // 两串脚印 → 中途只剩一串
      for (let i = 0; i < 6; i++) {
        const py = 150 + i * 5, px1 = 104 + i * 6, px2 = 136 + i * 6;
        R(pc, px1, py, 4, 2, '#3A3A56');
        R(pc, px1 + 1, py, 2, 2, PAL.goldRe);
        if (i < 3) { R(pc, px2, py + 2, 4, 2, '#3A3A56'); R(pc, px2 + 1, py + 2, 2, 2, PAL.goldRe); }
      }
    } },

  // ── SH18 长按删除草稿（98.52–105.35）──
  { t0: 98.52, t1: 105.35, scene: 'phone', cam: false, vig: .5, in: { type: 'dither', dur: .28 },
    draw(pc, lt) {
      const hold = lt > 2.4 && lt < 4.2;
      sc_phone(pc, lt, { chat: true, draft: true, draftW: 56, sendBtn: true, sendOn: false });
      // 长按：草稿条被选中
      if (hold) {
        const p = HZ((lt - 2.4) / 1.8);
        R(pc, 100, 138, 120, 18, `rgba(200,70,60,${.15 + p * .3})`);
      }
    } },

  // ── SH19 长椅对空位说话（105.35–112.86）──
  { t0: 105.35, t1: 112.86, scene: 'gate', cam: false, vig: .52, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_gate(pc, lt, { gateOpen: false, lamp1: 84 });
      figV4(pc, 52, 152, .92, { who: 'him', pose: 'sit', ex: 'E2', arm: 'raise', light: 'gold' });
    } },

  // ── SH20 镜子慢半拍（112.86–117.01）──
  { t0: 112.86, t1: 117.01, scene: 'mirror', cam: false, vig: .5, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_mirror(pc, lt, { fog: .35 });
      // 真人（画面左下，E1） + 镜中人（镜内，E5，慢半拍）
      figV4(pc, 62, 176, .82, { who: 'him', ex: 'E1', arm: 'pocket', light: 'gold' });
      figV4(pc, 160, 156, .72, { who: 'him', ex: 'E5', arm: 'pocket', light: 'none' });
    } },

  // ── SH21 镜面裂开（117.01–120.96）──
  { t0: 117.01, t1: 120.96, scene: 'mirror', cam: false, vig: .52, in: { type: 'glitch', dur: .35 },
    draw(pc, lt) {
      sc_mirror(pc, lt, { crack: true, fog: .2 });
      // 裂缝两侧两个他：左 E5、右 E6
      figV4(pc, 116, 150, .74, { who: 'him', ex: 'E5', arm: 'pocket', light: 'none' });
      figV4(pc, 204, 150, .74, { who: 'him', ex: 'E6', arm: 'pocket', light: 'none' });
    } },

  // ── SH22 她的脸浮现在镜中（120.96–124.20）──
  { t0: 120.96, t1: 124.20, scene: 'mirror', cam: false, vig: .52, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      const fog = .3 + .5 * HZ((lt - 2.2) / 1)
      sc_mirror(pc, lt, { fog });
      // 她的脸（浮在镜中，被雾吃掉）
      const a = 1 - HZ((lt - 2.3) / .9) * .7;
      c.save(); c.globalAlpha = a;
      faceV4(pc, 96, 30, 6, { who: 'her', ex: 'E3', star: true });
      c.restore();
      // 他伸手
      figV4(pc, 58, 176, .8, { who: 'him', ex: 'E1', arm: 'reach', light: 'gold' });
    } },

  // ── SH23 读档暴涨（124.20–128.32）──
  { t0: 124.20, t1: 128.32, scene: 'menu', cam: false, vig: .5, in: { type: 'glitch', dur: .3 },
    draw(pc, lt) {
      sc_menu(pc, lt, { sel: 1, thumb: [thumbPair, thumbEmpty, thumbEmpty] });
      // 数字暴涨的机械翻页感：屏幕闪
      if (lt > .8 && lt < 3.2 && Math.floor(lt * 12) % 2 === 0) {
        c.save(); c.globalAlpha = .12; c.fillStyle = '#C9D4E8'; c.fillRect(0, 0, 320, 180); c.restore();
      }
    } },

  // ── SH24 他跑起来（128.32–131.58）──
  { t0: 128.32, t1: 131.58, scene: 'street', vig: .56, in: { type: 'whip', dur: .35, dir: 1 },
    cam(lt) { return [40 + lt * 6, 96, 240, 135]; },
    draw(pc, lt) {
      sc_street(pc, lt, { lampX: 104, rainN: 150 });
      const ph = Math.floor(lt * 8) & 3;
      figV4(pc, 108, 178, 1, { who: 'him', pose: 'walk', phase: ph, ex: 'E1', arm: 'pad', ledOn: true, light: 'gold' });
      // 雨被拉成斜线
      for (let i = 0; i < 18; i++) {
        const x = (i * 31 + lt * 40) % 320, y = (i * 37) % 170;
        R(pc, x, y, 4, 1, PAL.rainNear);
      }
    } },

  // ── SH25 冻帧（131.58–134.86）──
  { t0: 131.58, t1: 134.86, scene: 'street', cam: false, vig: .58, in: { type: 'flash', dur: .2, amt: .5 },
    draw(pc, lt) {
      sc_street(pc, lt, { lampX: 104, frozen: true, rainN: 150 });
      figV4(pc, 108, 178, 1, { who: 'him', pose: 'walk', phase: 2, ex: 'E1', arm: 'pad', ledOn: true, light: 'gold' });
      // 悬停的雨滴（大颗）
      for (let i = 0; i < 26; i++) {
        const x = (i * 47) % 320, y = (i * 71) % 176;
        R(pc, x, y, 1, 4, '#A6A0C4');
      }
      c.save(); c.globalAlpha = .10; c.fillStyle = '#C9D4E8'; c.fillRect(0, 0, 320, 180); c.restore();
    } },

  // ── SH26 语音连接失败（134.86–142.16）──
  { t0: 134.86, t1: 142.16, scene: 'phone', cam: false, vig: .52, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_phone(pc, lt, { call: true, fail: lt > 4.2 });
    } },

  // ── SH27 B1 大钟跳格 + 任务过期（142.16–146.12）──
  { t0: 142.16, t1: 146.12, scene: 'gate', cam: false, vig: .54, in: { type: 'scan', dur: .3 },
    draw(pc, lt) {
      sc_gate(pc, lt, { gateOpen: false, lamp1: 100 });
      // 他入画侧脸（E4 挑眉）1s 后出画
      if (lt < 1.4) {
        figSide(pc, 40 + lt * 10, 176, 1, { ex: 'E4', light: 'gold' });
      }
    } },

  // ── SH28 乌云压境 rim 熄灭（146.12–151.98）──
  { t0: 146.12, t1: 151.98, scene: 'roof', cam: false, vig: .52, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      const cover = HZ((lt - .8) / 4.2);
      sc_roof(pc, lt, { cloud: cover, moon: cover < .8 });
      figV4(pc, 132, 176, 1, {
        who: 'him', ex: 'E5', arm: 'pocket',
        light: 'gold', lightFade: 1 - cover,
      });
    } },

  // ── SH29 同一张沙发，两副表情（151.98–159.24）──
  { t0: 151.98, t1: 159.24, scene: 'cg', cam: false, vig: .46, in: { type: 'dither', dur: .35 },
    draw(pc, lt) {
      sc_cg(pc, lt);
      // 同 SH12 构图，但她那边是空的
      figV4(pc, 108, 178, 1, { who: 'him', ex: 'E1', arm: 'pocket', light: 'gold' });
      // 空位的压痕（一块更暗的地面）
      R(pc, 176, 172, 56, 6, '#221E30');
    } },

  // ── SH30 存档缩略图变 ?（159.24–166.23）──
  { t0: 159.24, t1: 166.23, scene: 'menu', cam: false, vig: .5, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_menu(pc, lt, { sel: 0, thumb: [lt > 3.5 ? thumbEmpty : thumbPair, thumbEmpty, thumbEmpty] });
    } },

  // ── SH31 抓空气（166.23–170.71）──
  { t0: 166.23, t1: 170.71, scene: 'gate', cam: false, vig: .54, in: { type: 'flash', dur: .22, amt: .45 },
    draw(pc, lt) {
      sc_gate(pc, lt, { gateOpen: false, lamp1: 92 });
      const grab = HZ((lt - .5) / .8);
      figV4(pc, 150, 176, 1, { who: 'him', ex: grab > .6 ? 'E6' : 'E1', arm: 'reach', light: 'gold' });
      // 五指收拢的抓握（画在伸出的手位置）
      if (grab > .3) {
        const gy = 176 - 34 * 2 - 4;
        R(pc, 196, gy, 8, 6, PAL.skinLt);
        R(pc, 196, gy + 4, 8, 2, PAL.skinDk);
      }
    } },

  // ── SH32 顶棚水滴极近特写（170.71–174.31）──
  { t0: 170.71, t1: 174.31, scene: 'gate', cam: false, vig: .6, in: { type: 'dither', dur: .26 },
    draw(pc, lt) {
      R(pc, 0, 0, 320, 180, '#0A0D16');
      dith(pc, 0, 0, 320, 180, '#0A0D16', '#141A28', .45);
      // 顶棚边缘（画面上方）
      R(pc, 0, 0, 320, 26, '#161B2C');
      R(pc, 0, 26, 320, 2, '#2A3050');
      // 水滴：汇聚 → 拉长 → 坠落
      const cyc = (lt % 2.2) / 2.2;
      const dy = 30 + cyc * cyc * 90;
      const hh = 6 + cyc * 12;
      R(pc, 158, 28, 4, hh, '#8FA0C0');
      R(pc, 159, 28, 2, hh, '#C9D4E8');
      if (cyc > .55) { R(pc, 158, 30 + dy * .4, 4, 5, '#C9D4E8'); }
      // 地面水花
      if (cyc > .92) {
        R(pc, 152, 150, 16, 2, '#8FA0C0');
        R(pc, 156, 148, 8, 2, '#C9D4E8');
      }
      glow(pc, 160, 60, 40, 60, PAL.cool, .1);
    } },

  // ── SH33 蹲下闪光灯照脚印（174.31–180.59）──
  { t0: 174.31, t1: 180.59, scene: 'street', vig: .58, in: { type: 'dither', dur: .3 },
    cam(lt) { return [32, 96, 256, 144]; },
    draw(pc, lt) {
      sc_street(pc, lt, { lampX: 96, coolRoad: true, rainN: 80 });
      figV4(pc, 128, 178, 1, { who: 'him', pose: 'crouch', ex: 'E1', arm: 'hold', light: 'none' });
      // 手电光柱（白）
      lightCone(pc, 128, 132, 6, 40, 44, '#F2E8F8', .5);
      lightSpot(pc, 100, 148, 56, 18, PAL.cool, .55);
      glow(pc, 128, 142, 60, 40, '#F2E8F8', .22);
    } },

  // ── SH34 打字「星星贴纸我还留着。」（180.59–187.67）──
  { t0: 180.59, t1: 187.67, scene: 'phone', cam: false, vig: .5, in: { type: 'dither', dur: .28 },
    draw(pc, lt) {
      const tw = HZ((lt - .5) / 4.5) * 74;
      sc_phone(pc, lt, { chat: true, draft: true, draftW: tw, sendBtn: true, sendOn: lt > 5.2 });
    } },

  // ── SH35 手柄放长椅（187.67–194.91）──
  { t0: 187.67, t1: 194.91, scene: 'gate', cam: false, vig: .52, in: { type: 'blk', dur: .28, hold: .12 },
    draw(pc, lt) {
      sc_gate(pc, lt, { gateOpen: false, lamp1: 88 });
      // 手柄：前 2 秒在他手里，之后放上长椅 LED 熄灭
      const put = lt > 2.0;
      if (!put) {
        figV4(pc, 60, 152, .92, { who: 'him', pose: 'sit', ex: 'E1', arm: 'pad', ledOn: true, light: 'gold' });
      } else {
        // 他站起来，插兜（ref-1 默认站姿回归）
        figV4(pc, 78, 176, .95, { who: 'him', ex: 'E1', arm: 'pocket', light: 'gold' });
        // 长椅上的手柄（LED 灭）
        R(pc, 40, 122, 14, 6, '#1B2436');
        R(pc, 40, 122, 14, 1, '#31415E');
        R(pc, 52, 120, 3, 3, '#3A2228');
      }
    } },

  // ── SH36 B2 对方已离线（194.91–199.20）──
  { t0: 194.91, t1: 199.20, scene: 'phone', cam: false, vig: .52, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_phone(pc, lt, { list: true, unread: false, bright: false });
    } },

  // ── SH37 镜子完成，镜中人同步（199.20–202.94）──
  { t0: 199.20, t1: 202.94, scene: 'mirror', cam: false, vig: .5, in: { type: 'dither', dur: .3 },
    draw(pc, lt) {
      sc_mirror(pc, lt, { fog: .12 });
      figV4(pc, 62, 176, .82, { who: 'him', ex: 'E3', arm: 'pocket', light: 'gold' });
      figV4(pc, 160, 156, .72, { who: 'him', ex: 'E3', arm: 'pocket', light: 'none' });
      // 抠贴纸「咝」（手在镜前）
      if (lt > 1.2 && lt < 2.4) {
        R(pc, 150, 96, 8, 8, PAL.gold);
        R(pc, 148, 100, 12, 3, PAL.gold);
      }
    } },

  // ── SH38 存档成功（202.94–207.50）──
  { t0: 202.94, t1: 207.50, scene: 'menu', cam: false, vig: .48, in: { type: 'scan', dur: .32 },
    draw(pc, lt) {
      sc_menu(pc, lt, {
        sel: 0, thumb: [lt > 1.6 ? thumbPair : thumbEmpty, thumbEmpty, thumbEmpty],
        progFrom: HZ((lt - .6) / 1.4),
      });
    } },

  // ── SH39 白房间菜单（207.50–213.00）──
  { t0: 207.50, t1: 213.00, scene: 'white', cam: false, vig: .22, in: { type: 'flash', dur: .4, amt: .9 },
    draw(pc, lt) { sc_white(pc, lt, { crt: true, screenOff: false }); } },

  // ── SH40 光标下移到「退出」（213.00–219.00）──
  { t0: 213.00, t1: 219.00, scene: 'white', cam: false, vig: .22,
    draw(pc, lt) { sc_white(pc, lt, { crt: true, screenOff: false }); } },

  // ── SH41 B3 已过期·无法发送（219.00–224.00）──
  { t0: 219.00, t1: 224.00, scene: 'black', cam: false, vig: .5, in: { type: 'blk', dur: .8, hold: .8 },
    draw(pc, lt) { sc_black(pc, lt, { grain: true }); } },

  // ── SH42 屏幕收线熄灭（224.00–229.00）──
  { t0: 224.00, t1: 229.00, scene: 'menu', cam: false, vig: .5, in: { type: 'dither', dur: .35 },
    draw(pc, lt) {
      const off = lt > 1.6;
      sc_menu(pc, lt, { screenOff: off, sel: null, thumb: [thumbPair, thumbEmpty, thumbEmpty] });
      if (off) {
        // 收线：白线从上下向中间压扁
        const p = HZ((lt - 1.6) / .9);
        const hh = Math.max(1, 148 * (1 - p));
        R(pc, 26, 16 + (148 - hh) / 2, 268, hh, '#C9D4E8');
      }
    } },

  // ── SH43 片名卡（229.00–232.84）──
  { t0: 229.00, t1: 232.84, scene: 'black', cam: false, vig: .58, in: { type: 'fade', dur: .5, col: '#0A0806' },
    draw(pc, lt) { sc_black(pc, lt, { grain: true }); } },
];
