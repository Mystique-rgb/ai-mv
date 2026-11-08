// ============================================================
//  分镜 57 镜 · 全曲 329s
// ============================================================
const GY = { town: 150, room: 170, market: 160, post: 156, clock: 160, station: 150, tavern: 156, train: 170, plat: 148 };

function duotone(c, dark, light, thr = .40) {
  const img = c.getImageData(0, 0, 320, 180), d = img.data;
  const A = hex2rgb(dark), B = hex2rgb(light);
  for (let i = 0; i < d.length; i += 4) {
    const l = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255;
    const on = l > thr;
    d[i] = on ? B[0] : A[0]; d[i + 1] = on ? B[1] : A[1]; d[i + 2] = on ? B[2] : A[2];
  }
  c.putImageData(img, 0, 0);
}
// 呼吸感：站立时身体 1px 上下
const BR = (t, k = 1) => Math.sin(t * 1.9) > 0 ? 0 : k;
// 走路相位
const WK = (t, sp = 7) => t * sp;

let OFF5 = null;
function off5() {
  if (!OFF5) { OFF5 = document.createElement('canvas'); OFF5.width = 320; OFF5.height = 180; }
  const g = OFF5.getContext('2d');
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, 320, 180);
  return g;
}

window.SPEC = {
  fps: 24, duration: 329.21, fadeIn: 1.2, fadeOut: 1.6,
  grade: 'brightness(1.10) saturate(1.02) contrast(1.10)',
  cover: 'A',

  shots: [
    // ================= 序幕 =================
    { t0: 0, t1: 6.12, scene: 'black', cam: false, vig: .7,
      draw(pc) { R(pc, 0, 0, 320, 180, PAL.ink); } },

    { t0: 6.12, t1: 12.4167, scene: 'save', cam: false, vig: .55,
      in: { type: 'dither', dur: .7 },
      draw(pc, lt) { saveScreen(pc, lt); } },

    // 12.4167 重拍：像素重排砸亮
    { t0: 12.4167, t1: 15.59, scene: 'town', zs: 1, vig: .62, cast: '#4C7FB0', castA: .10,
      in: { type: 'flash', dur: .10, amt: 1 },
      cam: (() => {
        const sh = SHAKE(.55, 5);
        return lt => {
          const b = CAM(3.16, { z0: 1.02, z1: 1.12, cx0: 160, cy0: 96 })(lt);
          if (lt > .6) return b;
          const s = sh(lt);
          return [b[0] + s[0] * .55, b[1] + s[1] * .55, b[2], b[3]];
        };
      })(),
      draw(pc, lt, shot, t) {
        const g = off5(); sc_town(g, t); rosec(c);
        pc.drawImage(OFF5, 0, 0);
        shadeRect(pc, 0, 0, 320, 180, .84);
        const p = Math.min(1, Math.max(0, (lt - .06) / .62)), thr = p * 1.10;
        for (let by = 0; by < 180; by += 5) for (let bx = 0; bx < 320; bx += 5) {
          const o = (by / 180) * .88 + (BAYER[(by / 5) & 3][(bx / 5) & 3] / 16) * .12;
          if (o < thr - .035) pc.drawImage(OFF5, bx, by, 5, 5, bx, by, 5, 5);
          else if (o < thr) { pc.drawImage(OFF5, bx, by, 5, 5, bx, by, 5, 5); pc.save(); pc.globalAlpha = .28; pc.fillStyle = PAL.gold; pc.fillRect(bx, by, 5, 5); pc.restore(); }
          else if (o < thr + .010) { pc.drawImage(OFF5, bx, by, 5, 5, bx, by, 5, 5); pc.save(); pc.globalAlpha = .92; pc.fillStyle = PAL.gold; pc.fillRect(bx, by, 5, 5); pc.restore(); }
        }
        if (lt > .68) rain(pc, t, 50, 'rgba(120,153,180,.35)', 1);
      } },

    { t0: 15.59, t1: 21.9, scene: 'town', zs: 1, vig: .58,
      in: { type: 'dither', dur: .6 },
      cam: CAM(6.31, { z0: 1.18, z1: 1.02, cx0: 168, cy0: 96 }),
      draw(pc, lt, shot, t) { sc_town(pc, t); rosec(pc); shadeRect(pc, 0, 158, 320, 22, .5); } },

    // 进村：伞下一个人
    { t0: 21.9, t1: 28.21, scene: 'town', zs: 1,
      cam: CAM(6.31, { z0: 1.10, z1: 1.22, cx0: 168, cy0: 104 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t);
        const x = 150 + lt * 1.2;
        npc(pc, 'm', x, GY.town + BR(t), 1, { view: 'back', pose: 'walk', walk: WK(t, 6), aL: .5, aR: .5 });
        umbrella(pc, x, GY.town, 1);
      } },

    { t0: 28.21, t1: 33.0, scene: 'town', zs: 1,
      cam: CAM(4.79, { z0: 2.1, z1: 2.35, cx0: 156, cy0: 96 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t); shadeRect(pc, 0, 0, 320, 180, .12);
        // 背影 + 伞：伞偏一侧，给另一个人留的空
        npc(pc, 'm', 148, GY.town, 1, { view: 'back' });
        umbrellaOffset(pc, 148, GY.town, 1, 7);
      } },

    { t0: 33.0, t1: 37.68, scene: 'rain', zs: 1,
      cam: CAM(4.68, { z0: 2.6, z1: 3.0, cx0: 150, cy0: 60 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#0A1119');
        // 伞面（超近景）
        c_umbrellaTop(pc, 160, 150, t);
        rain(pc, t, 26, 'rgba(150,180,208,.55)', 1);
        // 伞沿滴水
        for (let i = 0; i < 5; i++) {
          const ph = (t * 1.4 + i * .23) % 1;
          const dx = 40 + i * 60, dy = 96 + ph * 70;
          R(pc, dx, dy, 1, 3, 'rgba(180,210,235,.75)');
        }
      } },

    // ================= 主歌一 =================
    { t0: 37.68, t1: 42.42, scene: 'room', zs: 1,
      cam: CAM(4.74, { z0: 1.06, z1: 1.14, cx0: 150, cy0: 96 }),
      draw(pc, lt, shot, t) { sc_room(pc, t, { lamp: lt > .25, outside: true }); npc(pc, 'm', 168, GY.room + BR(t), 1, { eyes: 'narrow' }); } },

    { t0: 42.42, t1: 46.71, scene: 'room', zs: 1,
      cam: CAM(4.29, { z0: 1.25, z1: 1.32, cx0: 210, cy0: 90 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { lamp: true });
        npc(pc, 'm', 176, GY.room, 1, { view: 'back' });
        // 空相框一排（钉孔还在）
        for (let i = 0; i < 4; i++) {
          const x = 128 + i * 26;
          R(pc, x, 44, 18, 14, '#0E1620');
          R(pc, x, 44, 18, 1, '#4A5A6A'); R(pc, x, 57, 18, 1, '#4A5A6A');
          R(pc, x, 44, 1, 14, '#4A5A6A'); R(pc, x + 17, 44, 1, 14, '#4A5A6A');
          R(pc, x + 8, 42, 1, 2, '#8A8578');
        }
      } },

    { t0: 46.71, t1: 50.99, scene: 'room', zs: 1,
      cam: CAM(4.28, { z0: 1.9, z1: 2.1, cx0: 272, cy0: 120 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { lamp: true, hairtie: true });
        R(pc, 0, 0, 320, 180, 'rgba(4,6,10,.18)');
      } },

    { t0: 50.99, t1: 55.37, scene: 'room', zs: 1,
      cam: CAM(4.38, { z0: 1.10, z1: 1.02, cx0: 160, cy0: 96 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { lamp: lt < .35, dark: lt >= .35 });
        npc(pc, 'm', 170, GY.room, 1, { eyes: 'closed', mouth: 'flat' });
      } },

    { t0: 55.37, t1: 61.56, scene: 'bag', zs: 1,
      cam: false,
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#070C14');
        // 背包九宫格（320 层只画框，字走高清）
        const gx = 36, gy = 34, cw = 52, ch = 40;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
          const x = gx + i * (cw + 8), y = gy + j * (ch + 6);
          R(pc, x, y, cw, ch, '#0C141E');
          const bc = (i === 0 && j === 0) ? '#B08A3E' : '#22303E';
          R(pc, x, y, cw, 1, bc); R(pc, x, y + ch - 1, cw, 1, bc);
          R(pc, x, y, 1, ch, bc); R(pc, x + cw - 1, y, 1, ch, bc);
        }
        // 第一格：信；第二格：发圈
        letter(pc, 48, 48, 1);
        R(pc, 106, 50, 6, 6, PAL.rose);
        R(pc, 108, 52, 2, 2, '#8A2A38');
        // 选择光标
        R(pc, 40, 52, 2, 8, PAL.gold);
      } },

    // ①②③ 交互第一轮
    { t0: 61.56, t1: 69.10, scene: 'market', zs: 1,
      cam: CAM(7.54, { z0: 1.12, z1: 1.2, cx0: 160, cy0: 100 }),
      draw(pc, lt, shot, t) {
        sc_market(pc, t, { crowd: true });
        npc(pc, 'm', 128 + lt * 1.1, GY.market + BR(t), 1, { pose: lt < 2.2 ? 'walk' : 'stand', walk: WK(t, 6), lookX: 1 });
        npc(pc, 'xiaoman', 196, GY.market, 1, { aL: .5, lookX: -1, mouth: 'smile' });
      } },

    { t0: 69.10, t1: 75.81, scene: 'post', zs: 1,
      cam: CAM(6.71, { z0: 1.14, z1: 1.24, cx0: 180, cy0: 100 }),
      draw(pc, lt, shot, t) {
        sc_post(pc, t);
        npc(pc, 'm', 140, GY.post + BR(t), 1, { lookX: 1 });
        npc(pc, 'afei', 214, GY.post, 1, { aR: .5, lookX: -1, mouth: 'smile' });
      } },

    { t0: 75.81, t1: 81.74, scene: 'clock', zs: 1,
      cam: CAM(5.93, { z0: 1.10, z1: 1.20, cx0: 160, cy0: 96 }),
      draw(pc, lt, shot, t) {
        sc_clock(pc, t, {});
        npc(pc, 'm', 150, GY.clock + BR(t), 1, { view: 'back' });
        // 橱窗里低头修表的陈伯（玻璃后）
        c.save(); c.globalAlpha = .85;
        npc(pc, 'chen', 236, 142, 1, { pose: 'sit', lookY: 1, mouth: 'flat' });
        c.restore();
      } },

    { t0: 81.74, t1: 86.53, scene: 'town', zs: 1,
      cam: CAM(4.79, { z0: 2.2, z1: 2.5, cx0: 150, cy0: 104 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t); shadeRect(pc, 0, 0, 320, 180, .16);
        npc(pc, 'm', 146, GY.town + BR(t), 1, { aR: 2, eyes: 'closed', lookY: -1 });
        rain(pc, t, 80, 'rgba(150,180,208,.5)', 1);
      } },

    { t0: 86.53, t1: 90.08, scene: 'town', zs: 1,
      cam: CAM(3.55, { z0: 2.9, z1: 3.15, cx0: 148, cy0: 96 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t); shadeRect(pc, 0, 0, 320, 180, .22);
        npc(pc, 'm', 146, GY.town, 1, { eyes: 'closed', mouth: 'flat' });
        // dither 圆环波纹
        for (let i = 0; i < 3; i++) {
          const p = ((lt * .9 + i * .33) % 1);
          const r = 8 + p * 46;
          c_ringDither(pc, 148, 118, r, p);
        }
      } },

    { t0: 90.08, t1: 95.77, scene: 'town', zs: 1,
      cam: CAM(5.69, { z0: 3.0, z1: 2.85, cx0: 148, cy0: 100 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t); shadeRect(pc, 0, 0, 320, 180, .2);
        npc(pc, 'm', 146, GY.town, 1, { eyes: 'normal', mouth: 'flat', tear: 0 });
        rain(pc, t, 60, 'rgba(150,180,208,.4)', 1);
      } },

    { t0: 95.77, t1: 99.22, scene: 'town', zs: 1,
      cam: CAM(3.45, { z0: 1.5, z1: 1.42, cx0: 160, cy0: 110 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t);
        npc(pc, 'm', 132, GY.town, 1, { eyes: 'narrow' });
        // 三个路人剪影走过，无人回头
        for (let i = 0; i < 3; i++) {
          const x = 180 + i * 26 + lt * (3 + i);
          R(pc, x, GY.town - 26, 9, 26, '#151E2C');
          R(pc, x + 1, GY.town - 33, 7, 8, '#151E2C');
        }
      } },

    // ================= 桥段一：闪回 =================
    { t0: 99.22, t1: 105.52, scene: 'flash', zs: 1,
      cam: CAM(6.3, { z0: 1.2, z1: 1.32, cx0: 200, cy0: 96 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#0B0F18');
        // 书架
        R(pc, 120, 30, 120, 120, '#141C26');
        for (let i = 0; i < 3; i++) { R(pc, 122, 56 + i * 34, 116, 3, '#243141'); }
        for (let i = 0; i < 22; i++) R(pc, 126 + (i % 11) * 10, 44 + Math.floor(i / 11) * 34, 4, 10, i % 3 ? '#2A3A4A' : '#3A4A5A');
        // 她踮脚够最顶层
        npc(pc, 'she', 176, 150, 1, { aR: 2, lookY: -1, mouth: 'smile', eyes: 'happy' });
        // 他伸手替她拿
        npc(pc, 'm', 214, 150, 1, { aL: 2, lookX: -1, mouth: 'smile' });
        duotone(pc, '#0B0F18', PAL.rose, .34);
        shadeRect(pc, 0, 0, 320, 180, .06);
      } },

    { t0: 105.52, t1: 111.83, scene: 'flash', zs: 1,
      cam: CAM(6.31, { z0: 1.18, z1: 1.28, cx0: 160, cy0: 92 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#0B0F18');
        roofs(pc, 116, 71, '#141C26', '#0E1620', 26);
        windows(pc, 10, 108, 300, 12, 71, .10, '#2A3A4A');
        R(pc, 0, 130, 320, 50, '#0E1620');
        npc(pc, 'she', 146, 138, 1, { aL: 2, aR: 2, lookY: -1, eyes: 'happy', mouth: 'smile' });
        npc(pc, 'm', 180, 138, 1, { aL: 2, lookY: -1, mouth: 'smile' });
        // 灯升起来，混入星群
        const p = Math.min(1, lt / 3.4);
        const ly = 110 - p * 62;
        R(pc, 163, ly, 4, 5, PAL.gold);
        glow(pc, 165, ly + 2, 16, 14, PAL.gold, .5);
        for (let i = 0; i < 40; i++) {
          const sx = (i * 43) % 320, sy = (i * 29) % 90;
          R(pc, sx, sy, 1, 1, 'rgba(226,235,244,.55)');
        }
        duotone(pc, '#0B0F18', '#E8A0AC', .30);
      } },

    { t0: 111.83, t1: 118.15, scene: 'town', zs: 1,
      cam: CAM(6.32, { z0: 3.0, z1: 3.2, cx0: 150, cy0: 98 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t); shadeRect(pc, 0, 0, 320, 180, .26);
        npc(pc, 'm', 148, GY.town, 1, { eyes: 'closed', mouth: 'frown' });
        // 雨水顺脸（用泪参数
        for (let i = 0; i < 3; i++) {
          const ph = ((t * .9 + i * .4) % 1);
          R(pc, 144 + i * 2, 104 + ph * 22, 1, 3, 'rgba(200,225,245,.8)');
        }
        rain(pc, t, 90, 'rgba(150,180,208,.45)', 1);
      } },

    { t0: 118.15, t1: 124.47, scene: 'tavern', zs: 1,
      cam: CAM(6.32, { z0: 1.12, z1: 1.2, cx0: 160, cy0: 96 }),
      draw(pc, lt, shot, t) {
        sc_tavern(pc, t, {});
        npc(pc, 'm', 132, GY.tavern + BR(t), 1, { aR: 1, mouth: 'smile', eyes: 'happy' });
        npc(pc, 'qiao', 214, GY.tavern, 1, { lookX: -1, mouth: 'smile' });
      } },

    // ================= 副歌一 =================
    { t0: 124.47, t1: 129.23, scene: 'station', zs: 1,
      in: { type: 'flash', dur: .12, amt: .5 },
      cam: (() => { const sh = SHAKE(.4, 4); return lt => { const b = CAM(4.76, { z0: 1.05, z1: 1.12, cx0: 100, cy0: 90 })(lt); const s = sh(lt); return [b[0] + s[0] * .5, b[1] + s[1] * .5, b[2], b[3]]; }; })(),
      draw(pc, lt, shot, t) {
        sc_station(pc, t);
        npc(pc, 'm', 236, GY.station, 1, { view: 'back', lean: 0 });
        // 散场人群剪影
        for (let i = 0; i < 5; i++) {
          const x = 20 + i * 34 + lt * 8;
          if (x > 320) continue;
          R(pc, x, GY.station - 26, 9, 26, '#16202E');
          R(pc, x + 1, GY.station - 33, 7, 8, '#16202E');
        }
      } },

    { t0: 129.23, t1: 133.73, scene: 'station', zs: 1,
      cam: CAM(4.5, { z0: 1.35, z1: 1.28, cx0: 240, cy0: 110 }),
      draw(pc, lt, shot, t) {
        sc_station(pc, t);
        npc(pc, 'm', 232, GY.station, 1, { pose: 'sit', lookY: 1, eyes: 'narrow' });
      } },

    // ================= 主歌二 =================
    { t0: 133.73, t1: 141.99, scene: 'town', zs: 1,
      cam: CAM(8.26, { z0: 1.02, z1: 1.14, cx0: 160, cy0: 96, ease: 'out' }),
      draw(pc, lt, shot, t) { sc_town(pc, t, { snow: true }); } },

    { t0: 141.99, t1: 148.38, scene: 'market', zs: 1,
      cam: CAM(6.39, { z0: 1.3, z1: 1.42, cx0: 60, cy0: 110 }),
      draw(pc, lt, shot, t) { sc_market(pc, t, { empty: true, snow: true }); } },

    { t0: 148.38, t1: 156.0, scene: 'door', zs: 1,
      cam: CAM(7.62, { z0: 1.5, z1: 1.62, cx0: 160, cy0: 140 }),
      draw(pc, lt, shot, t) {
        // 雪地门口：两行脚印 → 一行
        vgradS(pc, 0, 0, 320, 100, PAL.ink, '#1B2A3C');
        R(pc, 0, 100, 320, 80, '#243447');
        for (let y = 100; y < 180; y += 3) dith(pc, 0, y, 320, 1, '#243447', '#2E4056', .3);
        // 门
        R(pc, 130, 40, 60, 62, '#101820');
        R(pc, 136, 46, 48, 56, '#181E26');
        const p = HZ((lt - 5.0) / 1.4);
        // 两行脚印（左）→ 叠化后只剩一行
        for (let i = 0; i < 6; i++) {
          const y = 168 - i * 9;
          R(pc, 104, y, 5, 2, '#3A4C62');
          R(pc, 112, y - 4, 5, 2, i > 2 && p > .5 ? '#243447' : '#3A4C62');
        }
        snow(pc, t, 50, 'rgba(226,235,244,.6)');
        if (p > .5) shadeRect(pc, 0, 0, 320, 180, .04 * (p - .5) * 2);
      } },

    { t0: 156.0, t1: 164.35, scene: 'room', zs: 1,
      cam: CAM(8.35, { z0: 1.08, z1: 1.02, cx0: 150, cy0: 96 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { lamp: false, dark: true, outside: true });
        shadeRect(pc, 0, 0, 320, 180, .18);
        npc(pc, 'm', 150, GY.room, 1, { pose: 'sit', eyes: 'narrow', lookY: 1 });
      } },

    { t0: 164.77, t1: 173.0, scene: 'room', zs: 1,
      cam: CAM(8.23, { z0: 1.06, z1: 1.16, cx0: 150, cy0: 96 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { lamp: lt > .3, flowers: true });
        npc(pc, 'm', 172, GY.room + BR(t), 1, { lookX: -1, mouth: 'flat' });
      } },

    { t0: 173.0, t1: 177.32, scene: 'room', zs: 1,
      cam: CAM(4.32, { z0: 2.0, z1: 2.2, cx0: 276, cy0: 122 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { lamp: false, dark: true, hairtie: true });
        shadeRect(pc, 0, 0, 320, 180, .3);
      } },

    { t0: 177.32, t1: 181.59, scene: 'window', zs: 1,
      cam: CAM(4.27, { z0: 1.7, z1: 1.55, cx0: 90, cy0: 80 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { lamp: false, dark: true });
        // 哈气擦窗：擦出一块能看见屋里的洞
        const p = Math.min(1, lt / 1.6);
        const r = 4 + p * 16;
        c.save();
        c.beginPath(); c.arc(84, 74, r, 0, 7); c.clip();
        R(pc, 40, 44, 74, 56, '#1A2B3E');
        roofs(pc, 78, 9, '#22405A', '#1A3048', 10);
        c.restore();
        // 手
        R(pc, 84, 90, 6, 8, PAL.skin);
      } },

    // ⑦ 台词裂缝
    { t0: 181.59, t1: 188.01, scene: 'market', zs: 1,
      cam: CAM(6.42, { z0: 1.2, z1: 1.34, cx0: 170, cy0: 100 }),
      draw(pc, lt, shot, t) {
        sc_market(pc, t, { snow: true });
        npc(pc, 'm', 132, GY.market + BR(t), 1, { lookX: 1 });
        npc(pc, 'zhou', 206, GY.market, 1, { aL: .5, lookX: -1, mouth: 'smile' });
      } },

    { t0: 188.01, t1: 195.41, scene: 'oldface', zs: 1,
      cam: CAM(7.4, { z0: 2.6, z1: 2.9, cx0: 176, cy0: 80 }),
      draw(pc, lt, shot, t) {
        vgradS(pc, 0, 0, 320, 120, PAL.ink, '#1B2A3C');
        R(pc, 0, 120, 320, 60, '#1E2C3C');
        npc(pc, 'chen', 172, 132, 2, { eyes: 'narrow', lookY: 1, mouth: 'flat' });
        // 落在白发上的雪，不化
        for (let i = 0; i < 14; i++) {
          const x = 148 + (i * 37) % 52, y = 46 + (i * 19) % 26;
          R(pc, x, y, 1, 1, 'rgba(240,246,252,.9)');
        }
        snow(pc, t, 40, 'rgba(226,235,244,.5)');
      } },

    { t0: 195.41, t1: 202.05, scene: 'post', zs: 1,
      cam: CAM(6.64, { z0: 1.55, z1: 1.4, cx0: 170, cy0: 106 }),
      draw(pc, lt, shot, t) {
        sc_post(pc, t, { snow: true });
        npc(pc, 'm', 126, GY.post + BR(t), 1, { lookX: 1, aR: 1 });
        npc(pc, 'afei', 196, GY.post, 1, { aL: .5, lookX: -1, mouth: 'tiny' });
        // 推到窗口一半的信
        const push = Math.min(1, Math.max(0, (lt - 2.2) / .8)) * (1 - Math.min(1, Math.max(0, (lt - 4.4) / .9)));
        letter(pc, 156 + push * 8, 116, 1);
      } },

    { t0: 202.05, t1: 208.26, scene: 'clock', zs: 1,
      cam: CAM(6.21, { z0: 1.35, z1: 1.5, cx0: 200, cy0: 100 }),
      draw(pc, lt, shot, t) {
        sc_clock(pc, t, { inside: true });
        npc(pc, 'chen', 154, GY.clock, 1, { aR: .5, lookX: 1, mouth: 'flat', eyes: 'narrow' });
        npc(pc, 'm', 232, GY.clock, 1, { view: 'back' });
        watch(pc, 176, 122);
        glow(pc, 176, 122, 14, 12, PAL.gold, .35);
      } },

    { t0: 208.26, t1: 212.82, scene: 'town', zs: 1,
      cam: CAM(4.56, { z0: 2.2, z1: 2.45, cx0: 150, cy0: 100 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t, { snow: true }); shadeRect(pc, 0, 0, 320, 180, .2);
        npc(pc, 'm', 148, GY.town, 1, { view: 'back', lookY: 1 });
        watch(pc, 154, 108);
        glow(pc, 154, 108, 10, 9, PAL.gold, .4);
      } },

    { t0: 212.82, t1: 219.23, scene: 'town', zs: 1,
      cam: CAM(6.41, { z0: 2.7, z1: 2.5, cx0: 150, cy0: 100 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t, { snow: true }); shadeRect(pc, 0, 0, 320, 180, .24);
        npc(pc, 'm', 148, GY.town, 1, { eyes: 'closed', lookY: 1 });
        watch(pc, 154, 108);
      } },

    { t0: 219.33, t1: 225.5, scene: 'market', zs: 1,
      cam: CAM(6.17, { z0: 1.5, z1: 1.62, cx0: 190, cy0: 120 }),
      draw(pc, lt, shot, t) {
        sc_market(pc, t, { snow: true, empty: true });
        npc(pc, 'm', 150, GY.market, 1, { pose: lt > 2.6 ? 'crouch' : 'stand', aR: 1, lookY: 1 });
        npc(pc, 'kid', 196, GY.market, 1, { pose: 'crouch', lookX: -1, mouth: 'tiny', eyes: 'wide' });
        dog(pc, 214, GY.market, t);
      } },

    // ================= 桥段二：回放 =================
    { t0: 225.5, t1: 231.77, scene: 'flash', zs: 1,
      cam: CAM(6.27, { z0: 1.2, z1: 1.32, cx0: 200, cy0: 96 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#0B0F18');
        R(pc, 120, 30, 120, 120, '#141C26');
        for (let i = 0; i < 3; i++) R(pc, 122, 56 + i * 34, 116, 3, '#243141');
        for (let i = 0; i < 14; i++) R(pc, 126 + (i % 7) * 10, 78 + Math.floor(i / 7) * 34, 4, 10, i % 3 ? '#2A3A4A' : '#3A4A5A');
        // 顶层空了：他自己踮脚，够到了，没人接
        npc(pc, 'm', 190, 150, 1, { aR: 2, lookY: -1, mouth: 'flat' });
        duotone(pc, '#0B0F18', '#8FA8C0', .34);
      } },

    { t0: 231.77, t1: 238.04, scene: 'flash', zs: 1,
      cam: CAM(6.27, { z0: 1.18, z1: 1.28, cx0: 160, cy0: 92 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#0B0F18');
        roofs(pc, 116, 71, '#141C26', '#0E1620', 26);
        windows(pc, 10, 108, 300, 12, 71, .10, '#2A3A4A');
        R(pc, 0, 130, 320, 50, '#0E1620');
        npc(pc, 'm', 176, 138, 1, { aL: 2, lookY: -1, mouth: 'flat' });
        const p = Math.min(1, lt / 3.4), ly = 110 - p * 58;
        R(pc, 172, ly, 4, 5, PAL.gold);
        glow(pc, 174, ly + 2, 12, 11, PAL.gold, .4);
        for (let i = 0; i < 22; i++) R(pc, (i * 43) % 320, (i * 29) % 90, 1, 1, 'rgba(226,235,244,.4)');
        duotone(pc, '#0B0F18', '#8FA8C0', .30);
      } },

    { t0: 238.04, t1: 244.32, scene: 'town', zs: 1,
      cam: CAM(6.28, { z0: 2.9, z1: 3.1, cx0: 150, cy0: 100 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t, { snow: false });      // 雨停了
        shadeRect(pc, 0, 0, 320, 180, .26);
        npc(pc, 'm', 148, GY.town, 1, { eyes: 'closed', mouth: 'frown' });
        // 第一次让眼泪看得见
        const p = HZ(lt / 2.2);
        R(pc, 144, 106 + p * 10, 1, 3, 'rgba(200,225,245,.9)');
        R(pc, 150, 107 + p * 12, 1, 3, 'rgba(200,225,245,.9)');
      } },

    { t0: 244.32, t1: 250.62, scene: 'tavern', zs: 1,
      cam: CAM(6.3, { z0: 1.3, z1: 1.45, cx0: 170, cy0: 108 }),
      draw(pc, lt, shot, t) {
        sc_tavern(pc, t, { inside: true });
        npc(pc, 'm', 132, GY.tavern, 1, { pose: 'sit', lookY: 1, aR: .5 });
        // 两杯，一杯推给空座
        R(pc, 156, 132, 7, 6, '#C8B27A'); R(pc, 157, 130, 5, 2, '#E8D8AE');
        R(pc, 178, 132, 7, 6, '#C8B27A'); R(pc, 179, 130, 5, 2, '#E8D8AE');
        // 信压在杯底
        letter(pc, 176, 128, 1);
      } },

    { t0: 250.62, t1: 253.79, scene: 'snow', zs: 1,
      cam: CAM(3.17, { z0: 1.6, z1: 1.4, cx0: 160, cy0: 130 }),
      draw(pc, lt, shot, t) {
        vgradS(pc, 0, 0, 320, 110, PAL.ink, '#1B2A3C');
        R(pc, 0, 110, 320, 70, '#243447');
        for (let y = 110; y < 180; y += 3) dith(pc, 0, y, 320, 1, '#243447', '#2E4056', .3);
        // 两串脚印并排走远，一串中途消失
        for (let i = 0; i < 7; i++) {
          const y = 176 - i * 9;
          R(pc, 140 + i * 2, y, 4, 2, '#3A4C62');
          if (i < 4) R(pc, 152 + i * 2, y - 3, 4, 2, '#3A4C62');
        }
        snow(pc, t, 60, 'rgba(226,235,244,.7)');
      } },

    // ================= 三连副歌 =================
    { t0: 253.79, t1: 260.2, scene: 'station', zs: 1,
      cam: CAM(6.41, { z0: 1.45, z1: 1.55, cx0: 220, cy0: 104 }),
      draw(pc, lt, shot, t) {
        sc_station(pc, t, { snow: true });
        // 售票窗口
        R(pc, 176, 84, 74, 50, '#0B131C');
        R(pc, 176, 82, 74, 2, '#3E5266');
        R(pc, 210, 84, 2, 50, '#26343F');
        npc(pc, 'piao', 236, 148, 1, { pose: 'stand', lookX: -1, mouth: 'flat' });
        npc(pc, 'm', 150, GY.station, 1, { lookX: 1 });
      } },

    { t0: 260.2, t1: 266.52, scene: 'ticket', zs: 1,
      cam: CAM(6.32, { z0: 2.4, z1: 2.7, cx0: 160, cy0: 96 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#0A1119');
        R(pc, 96, 56, 128, 72, '#E8E2D2');
        R(pc, 96, 56, 128, 1, '#C8C2B4');
        for (let i = 0; i < 5; i++) R(pc, 106, 68 + i * 9, 60 + (i % 2) * 18, 2, '#8A8578');
        // 手写涂改的日期
        R(pc, 106, 112, 44, 2, '#B04A4A');
        R(pc, 108, 108, 30, 1, '#B04A4A');
        R(pc, 118, 116, 22, 1, '#B04A4A');
        // 撕口
        for (let i = 0; i < 20; i++) R(pc, 222, 56 + i * 4, 2, 2, '#0A1119');
      } },

    { t0: 266.52, t1: 272.86, scene: 'station', zs: 1,
      cam: CAM(6.34, { z0: 1.3, z1: 1.15, cx0: 200, cy0: 110 }),
      draw(pc, lt, shot, t) {
        sc_station(pc, t, { snow: true });
        npc(pc, 'm', 214, GY.station, 1, { view: 'back', pose: 'walk', walk: WK(t, 4) });
      } },

    { t0: 272.86, t1: 279.18, scene: 'train', zs: 1,
      cam: CAM(6.32, { z0: 1.2, z1: 1.3, cx0: 170, cy0: 100 }),
      draw(pc, lt, shot, t) {
        sc_train(pc, t, {});
        npc(pc, 'm', 150, GY.train, 1, { pose: 'sit', lookX: 1, eyes: 'narrow' });
        // 窗上映出她的轮廓
        const k = .5 + Math.sin(t * 1.6) * .18;
        c.save(); c.globalAlpha = k;
        npc(pc, 'she', 196, 126, 1, { lookX: -1, mouth: 'smile', eyes: 'happy' });
        c.restore();
        shadeRect(pc, 20, 34, 200, 92, .0);
      } },

    { t0: 279.18, t1: 285.49, scene: 'bag', zs: 1,
      cam: CAM(6.31, { z0: 1.0, z1: 1.08, cx0: 160, cy0: 100 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#070C14');
        const gx = 40, gy = 40, cw = 50, ch = 42;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
          const x = gx + i * (cw + 10), y = gy + j * (ch + 12);
          R(pc, x, y, cw, ch, '#0C141E');
          R(pc, x, y, cw, 1, i === 1 ? '#B08A3E' : '#22303E'); R(pc, x, y + ch - 1, cw, 1, i === 1 ? '#B08A3E' : '#22303E');
          R(pc, x, y, 1, ch, i === 1 ? '#B08A3E' : '#22303E'); R(pc, x + cw - 1, y, 1, ch, i === 1 ? '#B08A3E' : '#22303E');
        }
        letter(pc, 52, 56, 1);
        R(pc, 112, 56, 7, 7, PAL.rose);
        watch(pc, 168, 60);
        // 三样东西各闪一下
        const bl = Math.floor(t * 3) % 3;
        if (bl === 0) glow(pc, 58, 60, 16, 12, PAL.gold, .25);
        if (bl === 1) glow(pc, 116, 60, 16, 12, PAL.rose, .25);
        if (bl === 2) glow(pc, 168, 60, 16, 12, PAL.gold, .25);
      } },

    { t0: 285.49, t1: 291.81, scene: 'train', zs: 1,
      cam: CAM(6.32, { z0: 2.2, z1: 2.45, cx0: 160, cy0: 120 }),
      draw(pc, lt, shot, t) {
        sc_train(pc, t, {});
        npc(pc, 'm', 150, GY.train, 1, { pose: 'sit', aL: .5, aR: .5, lookY: 1, eyes: 'closed', mouth: 'flat' });
        // 手按在胸口：三下心跳
        const beat = Math.max(0, Math.sin(t * 5.2)) ** 8;
        if (beat > .1) { glow(pc, 152, 140, 10, 8, PAL.gold, .3 * beat); }
      } },

    // ================= 结局 drop =================
    { t0: 291.81, t1: 295.76, scene: 'save2', zs: 1,
      in: { type: 'flash', dur: .14, amt: 1 },
      cam: (() => { const sh = SHAKE(.5, 5); return lt => { const b = CAM(3.95, { z0: 1.0, z1: 1.05, cx0: 160, cy0: 90 })(lt); const s = sh(lt); return [b[0] + s[0] * .6, b[1] + s[1] * .6, b[2], b[3]]; }; })(),
      draw(pc, lt, shot, t) {
        // 车窗外倒退的雪原 + 存档框
        vgradS(pc, 0, 0, 320, 180, '#0B1520', '#16283C');
        for (let i = 0; i < 22; i++) {
          const x = (i * 37 - lt * 90) % 340 - 10;
          R(pc, x, 120 + (i % 5) * 6, 3, 2, 'rgba(226,235,244,.30)');
        }
        R(pc, 44, 52, 232, 76, 'rgba(9,14,20,.90)');
        R(pc, 44, 52, 232, 2, PAL.pale); R(pc, 44, 126, 232, 2, PAL.pale);
        R(pc, 44, 52, 2, 76, PAL.pale); R(pc, 274, 52, 2, 76, PAL.pale);
      } },

    { t0: 295.76, t1: 302.08, scene: 'post', zs: 1,
      cam: CAM(6.32, { z0: 1.2, z1: 1.35, cx0: 220, cy0: 110 }),
      draw(pc, lt, shot, t) {
        sc_post(pc, t, { snow: true });
        npc(pc, 'm', 190, GY.post, 1, { view: 'back', aR: 1 });
        // 信从 UI 层滑进邮筒
        const p = HZ((lt - 1.4) / 1.2);
        letter(pc, 226 + p * 18, 108 - p * 8, 1);
        if (p > .95) {
          R(pc, 244, 104, 26, 5, PAL.gold);
          const k = Math.min(1, (lt - 2.8) / .6);
          if (k > 0) { glow(pc, 257, 108, 30, 24, PAL.gold, .5 * k); }
        }
      } },

    { t0: 302.08, t1: 308.39, scene: 'save2', zs: 1,
      cam: CAM(6.31, { z0: 1.06, z1: 1.0, cx0: 160, cy0: 92 }),
      draw(pc, lt, shot, t) {
        vgradS(pc, 0, 0, 320, 180, '#0B1520', '#16283C');
        R(pc, 44, 60, 232, 60, 'rgba(9,14,20,.92)');
        R(pc, 44, 60, 232, 2, PAL.gold); R(pc, 44, 118, 232, 2, PAL.gold);
        R(pc, 44, 60, 2, 60, PAL.gold); R(pc, 274, 60, 2, 60, PAL.gold);
        // 碎裂的数字（320 层只画碎片）
        const k = HZ((lt - .8) / 1.6);
        for (let i = 0; i < 26; i++) {
          const x = 190 + (i % 13) * 6 + Math.sin(i) * 3;
          const y = 96 - k * 40 * ((i % 5) * .3) + k * 20;
          if (k > 0) R(pc, x, y, 2, 2, k > .8 ? 'rgba(255,209,102,.0)' : 'rgba(255,209,102,.7)');
        }
      } },

    { t0: 308.39, t1: 313.3, scene: 'platform', zs: 1,
      cam: CAM(4.91, { z0: 1.12, z1: 1.22, cx0: 160, cy0: 110 }),
      draw(pc, lt, shot, t) {
        sc_platform(pc, t, { train: true });
        npc(pc, 'm', 96, GY.plat, 1, { lookX: 1, mouth: 'flat' });
        // 站台全员送别：一排剪影 + 头顶小气泡
        const ids = ['xiaoman', 'afei', 'chen', 'zhou', 'piao', 'qiao', 'keeper'];
        ids.forEach((id, i) => {
          const x = 132 + i * 24;
          c.save(); c.globalAlpha = .95;
          npc(pc, id, x, GY.plat + 4, 1, { lookX: -1, mouth: 'smile' });
          c.restore();
          R(pc, x - 2, GY.plat - 44, 9, 6, 'rgba(240,236,226,.85)');
        });
      } },

    { t0: 313.3, t1: 317.85, scene: 'platform', zs: 1,
      cam: CAM(4.55, { z0: 1.4, z1: 1.25, cx0: 220, cy0: 100 }),
      draw(pc, lt, shot, t) {
        sc_platform(pc, t, { train: true });
        // 灯火一盏盏灭
        const k = HZ((lt - 1.2) / 2.6);
        for (let i = 0; i < 5; i++) {
          if (i / 5 > k) windows(pc, 20 + i * 60, 104, 40, 20, 90 + i, .5, PAL.gold);
        }
      } },

    { t0: 317.85, t1: 323.0, scene: 'dawn', zs: 1,
      cam: CAM(5.15, { z0: 1.3, z1: 1.06, cx0: 170, cy0: 100 }),
      draw(pc, lt, shot, t) {
        vgradS(pc, 0, 0, 320, 120, '#7C94AC', '#E8EEF4');
        R(pc, 0, 110, 320, 70, '#D3DEE8');
        // 远山
        c.fillStyle = '#B9C9D8';
        for (let x = 0; x < 320; x++) { const y = 104 + Math.sin(x * .017) * 6; c.fillRect(x, y, 1, 30); }
        // 列车驶向白色地平线
        const x = lt * 26;
        R(pc, 60 + x, 118, 46, 10, '#3E566E');
        R(pc, 108 + x, 120, 14, 8, '#33485C');
        for (let i = 0; i < 3; i++) R(pc, 66 + x + i * 12, 120, 6, 4, '#0B1520');
      } },

    { t0: 323.0, t1: 329.21, scene: 'black', cam: false, vig: .8,
      draw(pc) { R(pc, 0, 0, 320, 180, PAL.ink); } },
  ],

  subs: SUBS,
  hud: hud,
  nar: [],
};

// ---------- 需要的补充图元 ----------
function rosec(c) {
  // 右上那扇 rose 窗（全片"她"的颜色）
  const x = 214, y = 100, w = 10, h = 13;
  R(c, x - 1, y - 1, w + 2, h + 2, PAL.ink);
  R(c, x, y, w, h, PAL.rose);
  R(c, x, y + 6, w, 1, PAL.ink);
  R(c, x + 5, y, 1, h, PAL.ink);
  glow(c, x + 5, y + 6, 22, 18, PAL.rose, .30);
}
function umbrellaOffset(c, x, gy, S, dx) {
  c.fillStyle = PAL.gold;
  for (let i = -26; i <= 26; i++) {
    const h = Math.round(Math.sqrt(Math.max(0, 676 - i * i)) * .42);
    c.fillRect(Math.round(x + dx + i * S), gy - 44 * S - h, S, h + 2);
  }
  R(c, x + dx - 1, gy - 44 * S, 3, 46 * S, '#8A6A32');
}
function c_umbrellaTop(c, cx, cy, t) {
  // 超近景伞面：从下往上看，一圈伞骨 + 雨点打在上面
  for (let y = 0; y < 60; y++) {
    const w = Math.round(Math.sqrt(Math.max(0, 1 - Math.pow((y - 60) / 60, 2))) * 150);
    R(c, cx - w, cy - 60 + y, w * 2, 1, y < 6 ? '#8A6A32' : (y % 9 === 0 ? '#C89A3E' : PAL.gold));
  }
  R(c, cx - 1, cy - 62, 3, 60, '#8A6A32');
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    c.fillStyle = '#8A6A32';
    for (let r = 0; r < 58; r++) c.fillRect(Math.round(cx + Math.cos(a) * r * 1.4), Math.round(cy - 60 + Math.sin(a) * r * .5 + 30), 1, 1);
  }
}
function c_ringDither(c, cx, cy, r, p) {
  for (let a = 0; a < 360; a += 2) {
    const rad = a * Math.PI / 180;
    if (BAYER[(Math.round(cy + Math.sin(rad) * r)) & 3][(Math.round(cx + Math.cos(rad) * r * 1.6)) & 3] / 16 < (1 - p)) {
      R(c, cx + Math.cos(rad) * r * 1.6, cy + Math.sin(rad) * r, 1, 1, 'rgba(226,235,244,.5)');
    }
  }
}
function saveScreen(c, lt) {
  R(c, 0, 0, 320, 180, PAL.ink);
  for (let y = 0; y < 180; y += 16) R(c, 0, y, 320, 1, '#080F18');
  for (let x = 0; x < 320; x += 16) R(c, x, 0, 1, 180, '#080F18');
  const blink = Math.floor(lt * 2.2) % 2 === 0;
  const SL = [{ y: 40, h: 36, live: true }, { y: 88, h: 36 }, { y: 136, h: 36 }];
  SL.forEach(s => {
    const x = 24, w = 272;
    R(c, x, s.y, w, s.h, s.live ? '#0C1A28' : '#0A121C');
    const bc = s.live ? (blink ? PAL.gold : '#B08A3E') : '#22303E';
    R(c, x, s.y, w, 1, bc); R(c, x, s.y + s.h - 1, w, 1, bc);
    R(c, x, s.y, 1, s.h, bc); R(c, x + w - 1, s.y, 1, s.h, bc);
    if (s.live) {
      const tx = x + 6, ty = s.y + 5, tw = 40, th = s.h - 10;
      R(c, tx, ty, tw, th, PAL.night);
      for (let yy = ty + 2; yy < ty + th - 2; yy += 5) R(c, tx + 2, yy, tw - 4, 1, '#16283C');
      R(c, tx + 12, ty + 4, 9, 10, PAL.rose);
      glow(c, tx + 16, ty + 9, 14, 12, PAL.rose, .30);
      if (blink) { const cyy = s.y + s.h / 2 | 0; R(c, x + 2, cyy - 3, 2, 6, PAL.gold); R(c, x + 4, cyy - 2, 1, 4, PAL.gold); R(c, x + 5, cyy - 1, 1, 2, PAL.gold); }
    } else {
      for (let dx = x + 8; dx < x + w - 8; dx += 4) R(c, dx, s.y + s.h - 3, 2, 1, '#1A2734');
    }
  });
  R(c, 0, 176, 320, 4, '#070D14');
  R(c, 0, 18, 320, 1, '#17232F');
}
