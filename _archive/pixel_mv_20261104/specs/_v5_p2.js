// ============================================================
//  分镜 57 镜 · 全曲 329s
// ============================================================
const GY = { town: 150, room: 152, market: 154, post: 152, clock: 156, station: 148, tavern: 156, train: 170, plat: 148 };
// 对话镜头的取景：把人物放在画面上 2/3，腿被对话框挡住
const DCAM = (cx, d) => CAM(d, { z0: 1.55, z1: 1.66, cx0: cx, cy0: 122 });

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
const BR = (t, k = 1) => Math.sin(t * 1.9) > 0 ? 0 : k;
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
        const g = off5(); sc_town(g, t); rosec(g);
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
      cam: CAM(6.31, { z0: 1.22, z1: 1.02, cx0: 168, cy0: 100 }),
      draw(pc, lt, shot, t) { sc_town(pc, t); rosec(pc); shadeRect(pc, 0, 160, 320, 20, .45); } },

    { t0: 21.9, t1: 28.21, scene: 'town', zs: 1,
      cam: CAM(6.31, { z0: 1.30, z1: 1.42, cx0: 160, cy0: 112 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t);
        const x = 150 + lt * 1.4;
        npc(pc, 'm', x, GY.town + BR(t), 1, { view: 'back', pose: 'walk', walk: WK(t, 6), aL: .5, aR: .5 });
        umbrella(pc, x, GY.town, 1);
      } },

    { t0: 28.21, t1: 33.0, scene: 'town', zs: 1,
      cam: CAM(4.79, { z0: 2.2, z1: 2.5, cx0: 156, cy0: 108 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t); shadeRect(pc, 0, 0, 320, 180, .12);
        npc(pc, 'm', 150, GY.town, 1, { view: 'back' });
        umbrella(pc, 150, GY.town, 1, 7);   // 伞偏一侧，给另一个人留的空
      } },

    { in: { type: 'blk', hold: .3 }, t0: 33.0, t1: 37.68, scene: 'rain', zs: 1,
      cam: CAM(4.68, { z0: 3.0, z1: 3.4, cx0: 160, cy0: 96 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#0A1119');
        c_umbrellaTop(pc, 160, 140, t);
        rain(pc, t, 30, 'rgba(150,180,208,.5)', 1);
        for (let i = 0; i < 5; i++) {
          const ph = (t * 1.4 + i * .23) % 1;
          R(pc, 36 + i * 62, 92 + ph * 84, 1, 3, 'rgba(180,210,235,.75)');
        }
      } },

    // ================= 主歌一 =================
    { in: { type: 'dither', dur: .5 }, t0: 37.68, t1: 42.42, scene: 'room', zs: 1,
      cam: CAM(4.74, { z0: 1.25, z1: 1.36, cx0: 165, cy0: 110 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { lamp: lt > .25 });
        npc(pc, 'm', 172, GY.room + BR(t), 1, { eyes: 'narrow' });
      } },

    { t0: 42.42, t1: 46.71, scene: 'room', zs: 1,
      cam: CAM(4.29, { z0: 1.45, z1: 1.55, cx0: 200, cy0: 100 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { lamp: true });
        npc(pc, 'm', 176, GY.room, 1, { view: 'back' });
        for (let i = 0; i < 4; i++) {
          const x = 128 + i * 26;
          R(pc, x, 34, 18, 13, '#0E1620');
          R(pc, x, 34, 18, 1, '#4A5A6A'); R(pc, x, 46, 18, 1, '#4A5A6A');
          R(pc, x, 34, 1, 13, '#4A5A6A'); R(pc, x + 17, 34, 1, 13, '#4A5A6A');
          R(pc, x + 8, 32, 1, 2, '#8A8578');
        }
      } },

    { t0: 46.71, t1: 50.99, scene: 'room', zs: 1,
      cam: CAM(4.28, { z0: 2.2, z1: 2.45, cx0: 280, cy0: 128 }),
      draw(pc, lt, shot, t) { sc_room(pc, t, { lamp: true, hairtie: true }); } },

    { t0: 50.99, t1: 55.37, scene: 'room', zs: 1,
      cam: CAM(4.38, { z0: 1.3, z1: 1.2, cx0: 160, cy0: 110 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { lamp: lt < .35, dark: lt >= .35 });
        npc(pc, 'm', 172, GY.room, 1, { eyes: 'closed' });
      } },

    { in: { type: 'scan', dur: .3 }, t0: 55.37, t1: 61.56, scene: 'bag', cam: false,
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#070C14');
        const gx = 36, gy = 34, cw = 52, ch = 40;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
          const x = gx + i * (cw + 8), y = gy + j * (ch + 6);
          R(pc, x, y, cw, ch, '#0C141E');
          const bc = (i === 0 && j === 0) ? '#B08A3E' : '#22303E';
          R(pc, x, y, cw, 1, bc); R(pc, x, y + ch - 1, cw, 1, bc);
          R(pc, x, y, 1, ch, bc); R(pc, x + cw - 1, y, 1, ch, bc);
        }
        letter(pc, 48, 46);
        R(pc, 106, 48, 6, 6, PAL.rose); R(pc, 108, 50, 2, 2, '#8A2A38');
        R(pc, 40, 50, 2, 8, PAL.gold);
      } },

    // ①②③ 第一轮交互
    { in: { type: 'dither', dur: .45 }, t0: 61.56, t1: 69.1, scene: 'market', zs: 1,
      cam: DCAM(166, 7.54),
      draw(pc, lt, shot, t) {
        sc_market(pc, t, { crowd: true });
        npc(pc, 'm', 122 + lt * 1.2, GY.market + BR(t), 1, { pose: lt < 2.0 ? 'walk' : 'stand', walk: WK(t, 6), lookX: 1 });
        npc(pc, 'xiaoman', 200, GY.market, 1, { aL: .5, lookX: -1, mouth: 'smile' });
      } },

    { in: { type: 'dither', dur: .4 }, t0: 69.1, t1: 75.81, scene: 'post', zs: 1, cam: DCAM(176, 6.71),
      draw(pc, lt, shot, t) {
        sc_post(pc, t);
        npc(pc, 'm', 132, GY.post + BR(t), 1, { lookX: 1 });
        npc(pc, 'afei', 212, GY.post, 1, { aR: .5, lookX: -1, mouth: 'smile' });
      } },

    { t0: 75.81, t1: 81.74, scene: 'clock', zs: 1, cam: DCAM(164, 5.93),
      draw(pc, lt, shot, t) {
        sc_clock(pc, t, {});
        npc(pc, 'm', 138, GY.clock + BR(t), 1, { view: 'back' });
        c.save(); c.globalAlpha = .88;
        npc(pc, 'chen', 216, 148, 1, { pose: 'sit', lookY: 1, mouth: 'flat' });
        c.restore();
      } },

    { in: { type: 'dither', dur: .45 }, t0: 81.74, t1: 86.53, scene: 'town', zs: 1,
      cam: CAM(4.79, { z0: 2.4, z1: 2.7, cx0: 150, cy0: 112 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t); shadeRect(pc, 0, 0, 320, 180, .16);
        npc(pc, 'm', 148, GY.town + BR(t), 1, { aR: 2, eyes: 'closed', lookY: -1 });
        rain(pc, t, 80, 'rgba(150,180,208,.5)', 1);
      } },

    { t0: 86.53, t1: 90.08, scene: 'town', zs: 1,
      cam: CAM(3.55, { z0: 3.1, z1: 3.35, cx0: 148, cy0: 108 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t); shadeRect(pc, 0, 0, 320, 180, .22);
        npc(pc, 'm', 148, GY.town, 1, { eyes: 'closed' });
        for (let i = 0; i < 3; i++) {
          const p = ((lt * .9 + i * .33) % 1);
          c_ringDither(pc, 148, 126, 8 + p * 44, p);
        }
      } },

    { t0: 90.08, t1: 95.77, scene: 'town', zs: 1,
      cam: CAM(5.69, { z0: 3.2, z1: 3.0, cx0: 148, cy0: 110 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t); shadeRect(pc, 0, 0, 320, 180, .2);
        npc(pc, 'm', 148, GY.town, 1, { eyes: 'normal' });
        rain(pc, t, 60, 'rgba(150,180,208,.4)', 1);
      } },

    { t0: 95.77, t1: 99.22, scene: 'town', zs: 1,
      cam: CAM(3.45, { z0: 1.7, z1: 1.62, cx0: 160, cy0: 120 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t);
        npc(pc, 'm', 128, GY.town, 1, { eyes: 'narrow' });
        for (let i = 0; i < 3; i++) {
          const x = 186 + i * 28 + lt * (3 + i);
          R(pc, x, GY.town - 26, 9, 26, '#151E2C');
          R(pc, x + 1, GY.town - 33, 7, 8, '#151E2C');
        }
      } },

    // ================= 桥段一：闪回 =================
    { in: { type: 'fade', dur: .5 }, t0: 99.22, t1: 105.52, scene: 'flash', zs: 1,
      cam: CAM(6.3, { z0: 1.32, z1: 1.42, cx0: 186, cy0: 122 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#1A2230');
        R(pc, 96, 16, 150, 140, '#2E3A4A');
        for (let i = 0; i < 4; i++) R(pc, 98, 44 + i * 32, 146, 3, '#4A5A6E');
        for (let i = 0; i < 30; i++) R(pc, 102 + (i % 12) * 12, 26 + Math.floor(i / 12) * 32, 6, 14, i % 3 ? '#5A6A7E' : '#7A8A9E');
        R(pc, 0, 156, 320, 24, '#3A4656');
        npc(pc, 'she', 176, 158, 1, { aR: 2, lookY: -1, mouth: 'smile', eyes: 'happy' });
        npc(pc, 'm', 214, 158, 1, { aL: 2, lookX: -1, mouth: 'smile' });
        duotone(pc, '#160810', '#F2AEBB', .30);
      } },

    { t0: 105.52, t1: 111.83, scene: 'flash', zs: 1,
      cam: CAM(6.31, { z0: 1.5, z1: 1.62, cx0: 160, cy0: 112 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#1A2230');
        let x = -8, s = 71;
        while (x < 330) { const w = 22 + (Math.abs(Math.sin(s * 4.7) * 100) % 12 | 0); house(pc, x, 110, w, 34, '#2E3A4A', '#26303E', s, .10, '#6A7A8E', false); x += w + 3; s++; }
        R(pc, 0, 144, 320, 36, '#26303E');
        npc(pc, 'she', 148, 146, 1, { aL: 2, aR: 2, lookY: -1, eyes: 'happy', mouth: 'smile' });
        npc(pc, 'm', 182, 146, 1, { aL: 2, lookY: -1, mouth: 'smile' });
        const p = Math.min(1, lt / 3.4), ly = 118 - p * 52;
        R(pc, 163, ly, 5, 6, PAL.gold);
        glow(pc, 165, ly + 3, 18, 16, PAL.gold, .6);
        for (let i = 0; i < 40; i++) R(pc, (i * 43) % 320, (i * 29) % 88, 1, 1, 'rgba(226,235,244,.7)');
        duotone(pc, '#160810', '#F2AEBB', .30);
      } },

    { in: { type: 'fade', dur: .5 }, t0: 111.83, t1: 118.15, scene: 'town', zs: 1,
      cam: CAM(6.32, { z0: 3.2, z1: 3.4, cx0: 150, cy0: 108 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t); shadeRect(pc, 0, 0, 320, 180, .26);
        npc(pc, 'm', 148, GY.town, 1, { eyes: 'closed', mouth: 'frown' });
        for (let i = 0; i < 3; i++) {
          const ph = ((t * .9 + i * .4) % 1);
          R(pc, 144 + i * 2, 112 + ph * 20, 1, 3, 'rgba(200,225,245,.8)');
        }
        rain(pc, t, 90, 'rgba(150,180,208,.45)', 1);
      } },

    { in: { type: 'dither', dur: .4 }, t0: 118.15, t1: 124.47, scene: 'tavern', zs: 1, cam: DCAM(170, 6.32),
      draw(pc, lt, shot, t) {
        sc_tavern(pc, t, {});
        npc(pc, 'm', 124, GY.tavern + BR(t), 1, { aR: 1, mouth: 'smile', eyes: 'happy' });
        npc(pc, 'qiao', 212, GY.tavern, 1, { lookX: -1, mouth: 'smile' });
      } },

    // ================= 副歌一 =================
    { t0: 124.47, t1: 129.23, scene: 'station', zs: 1,
      in: { type: 'flash', dur: .12, amt: .5 },
      cam: (() => { const sh = SHAKE(.4, 4); return lt => { const b = CAM(4.76, { z0: 1.45, z1: 1.55, cx0: 76, cy0: 120 })(lt); const s = sh(lt); return [b[0] + s[0] * .5, b[1] + s[1] * .5, b[2], b[3]]; }; })(),
      draw(pc, lt, shot, t) {
        sc_station(pc, t);
        npc(pc, 'm', 240, GY.station, 1, { view: 'back' });
        for (let i = 0; i < 5; i++) {
          const x = 10 + i * 34 - lt * 9;
          if (x > 300) continue;
          R(pc, x, GY.station - 26, 9, 26, '#16202E');
          R(pc, x + 1, GY.station - 33, 7, 8, '#16202E');
        }
      } },

    { in: { type: 'whip', dur: .3, dir: -1 }, t0: 129.23, t1: 133.73, scene: 'station', zs: 1,
      cam: CAM(4.5, { z0: 1.6, z1: 1.5, cx0: 226, cy0: 118 }),
      draw(pc, lt, shot, t) {
        sc_station(pc, t);
        npc(pc, 'm', 226, GY.station, 1, { pose: 'sit', lookY: 1, eyes: 'narrow' });
      } },

    // ================= 主歌二 =================
    { t0: 133.73, t1: 141.88, scene: 'town', zs: 1,
      hit: 140.6, hitMag: 10,
      cam: CAM(8.26, { z0: 1.02, z1: 1.16, cx0: 160, cy0: 96, ease: 'out' }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t, { snow: true });
        // 2:20 鼓点动效：白闪 4 帧 + 双冲击环 + 雪雾横扫
        const dp = lt - (140.6 - 133.73);
        if (dp >= 0 && dp < .85) {
          const k = 1 - dp / .85;
          if (dp < .17) R(pc, 0, 0, 320, 180, 'rgba(246,233,210,.55)');
          c_ringDither(pc, 160, 96, 8 + dp * 170, k * .95);
          if (dp > .1) c_ringDither(pc, 160, 96, 8 + (dp - .1) * 140, k * .75);
          for (let i = 0; i < 16; i++) {
            const yy = 18 + (i * 13) % 148;
            const len = 8 + (i * 7) % 20;
            const xx = ((i * 53) % 300) - 20 - dp * 90 * (i % 2 ? 1 : -1);
            R(pc, Math.max(0, xx), yy, len, 1, 'rgba(226,235,244,' + (.5 * k).toFixed(2) + ')');
          }
        }
      } },

    { t0: 141.88, t1: 148.38, scene: 'market', zs: 1,
      in: { type: 'whip', dur: .34, dir: 1 },
      cam: CAM(6.39, { z0: 1.5, z1: 1.62, cx0: 46, cy0: 118 }),
      draw(pc, lt, shot, t) { sc_market(pc, t, { empty: true, snow: true }); } },

    { in: { type: 'scan', dur: .3 }, t0: 148.38, t1: 156.0, scene: 'door', zs: 1,
      cam: CAM(7.62, { z0: 1.45, z1: 1.58, cx0: 130, cy0: 130 }),
      draw(pc, lt, shot, t) {
        vgradS(pc, 0, 0, 320, 96, PAL.ink, '#1B2A3C');
        R(pc, 0, 96, 320, 84, '#243447');
        for (let y = 96; y < 180; y += 3) dith(pc, 0, y, 320, 1, '#243447', '#2E4056', .3);
        R(pc, 118, 40, 58, 56, '#101820');
        R(pc, 124, 46, 46, 50, '#181E26');
        // 两行脚印 → 一行
        for (let i = 0; i < 7; i++) {
          const y = 174 - i * 8;
          R(pc, 92, y, 5, 2, '#3A4C62');
          if (i < 3) R(pc, 100, y - 3, 5, 2, '#3A4C62');
        }
        snow(pc, t, 50, 'rgba(226,235,244,.6)');
      } },

    { in: { type: 'dither', dur: .5 }, t0: 156.0, t1: 164.35, scene: 'room', zs: 1,
      cam: CAM(8.35, { z0: 1.3, z1: 1.18, cx0: 150, cy0: 112 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { dark: true });
        shadeRect(pc, 0, 0, 320, 180, .16);
        npc(pc, 'm', 152, GY.room, 1, { pose: 'sit', eyes: 'narrow', lookY: 1 });
      } },

    { t0: 164.77, t1: 173.0, scene: 'room', zs: 1,
      cam: DCAM(168, 8.23),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { lamp: lt > .3, flowers: true });
        npc(pc, 'm', 176, GY.room + BR(t), 1, { lookX: -1 });
      } },

    { t0: 173.0, t1: 177.32, scene: 'room', zs: 1,
      cam: CAM(4.32, { z0: 2.2, z1: 2.45, cx0: 282, cy0: 128 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { dark: true, hairtie: true });
        shadeRect(pc, 0, 0, 320, 180, .28);
      } },

    { in: { type: 'dither', dur: .45 }, t0: 177.32, t1: 181.59, scene: 'window', zs: 1,
      cam: CAM(4.27, { z0: 1.9, z1: 1.72, cx0: 84, cy0: 92 }),
      draw(pc, lt, shot, t) {
        sc_room(pc, t, { dark: true });
        const p = Math.min(1, lt / 1.6), r = 4 + p * 18;
        c.save(); c.beginPath(); c.arc(84, 70, r, 0, 7); c.clip();
        R(pc, 30, 38, 76, 58, '#16283C');
        let x = 26, s = 9;
        while (x < 110) { const w = 12 + (Math.abs(Math.sin(s * 5.1) * 100) % 8 | 0); house(pc, x, 74, w, 20, '#1E3A52', '#16283C', s, .22, PAL.gold, true); x += w + 2; s++; }
        c.restore();
        R(pc, 84, 86, 6, 8, PAL.skin);   // 手
      } },

    { in: { type: 'whip', dur: .3, dir: -1 }, t0: 181.59, t1: 188.01, scene: 'market', zs: 1, cam: DCAM(172, 6.42),
      draw(pc, lt, shot, t) {
        sc_market(pc, t, { snow: true });
        npc(pc, 'm', 126, GY.market + BR(t), 1, { lookX: 1 });
        npc(pc, 'zhou', 208, GY.market, 1, { aL: .5, lookX: -1, mouth: 'smile' });
      } },

    { t0: 188.01, t1: 195.41, scene: 'oldface', zs: 1,
      cam: CAM(7.4, { z0: 2.55, z1: 2.72, cx0: 168, cy0: 112 }),
      draw(pc, lt, shot, t) {
        vgradS(pc, 0, 0, 320, 96, PAL.ink, '#1B2A3C');
        R(pc, 0, 96, 320, 84, '#1E2C3C');
        npc(pc, 'chen', 166, 132, 1, { eyes: 'narrow', lookY: 1 });
        for (let i = 0; i < 14; i++) R(pc, 152 + (i * 37) % 40, 92 + (i * 19) % 16, 1, 1, 'rgba(240,246,252,.9)');
        for (let i = 0; i < 10; i++) R(pc, 150 + (i * 23) % 44, 128 + (i * 11) % 6, 1, 1, 'rgba(240,246,252,.8)');
        snow(pc, t, 40, 'rgba(226,235,244,.5)');
      } },

    { in: { type: 'dither', dur: .45 }, t0: 195.41, t1: 202.05, scene: 'post', zs: 1, cam: DCAM(168, 6.64),
      draw(pc, lt, shot, t) {
        sc_post(pc, t, { snow: true });
        npc(pc, 'm', 122, GY.post + BR(t), 1, { lookX: 1, aR: 1 });
        npc(pc, 'afei', 196, GY.post, 1, { aL: .5, lookX: -1, mouth: 'tiny' });
        const push = Math.min(1, Math.max(0, (lt - 2.2) / .8)) * (1 - Math.min(1, Math.max(0, (lt - 4.4) / .9)));
        letter(pc, 148 + push * 10, 122);
      } },

    { t0: 202.05, t1: 208.26, scene: 'clock', zs: 1, cam: DCAM(196, 6.21),
      draw(pc, lt, shot, t) {
        sc_clock(pc, t, { inside: true });
        npc(pc, 'chen', 148, GY.clock, 1, { aR: .5, lookX: 1, eyes: 'narrow' });
        npc(pc, 'm', 226, GY.clock, 1, { view: 'back' });
        watch(pc, 176, 126);
        glow(pc, 176, 126, 14, 12, PAL.gold, .35);
      } },

    { in: { type: 'scan', dur: .3 }, t0: 208.26, t1: 212.82, scene: 'town', zs: 1,
      cam: CAM(4.56, { z0: 2.6, z1: 2.9, cx0: 150, cy0: 110 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t, { snow: true }); shadeRect(pc, 0, 0, 320, 180, .2);
        npc(pc, 'm', 148, GY.town, 1, { view: 'back', lookY: 1 });
        watch(pc, 154, 116);
        glow(pc, 154, 116, 10, 9, PAL.gold, .4);
      } },

    { t0: 212.82, t1: 219.23, scene: 'town', zs: 1,
      cam: CAM(6.41, { z0: 3.0, z1: 2.8, cx0: 150, cy0: 110 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t, { snow: true }); shadeRect(pc, 0, 0, 320, 180, .24);
        npc(pc, 'm', 148, GY.town, 1, { eyes: 'closed', lookY: 1 });
        watch(pc, 154, 116);
      } },

    { in: { type: 'fade', dur: .55 }, t0: 219.33, t1: 225.5, scene: 'market', zs: 1,
      cam: CAM(6.17, { z0: 1.7, z1: 1.82, cx0: 182, cy0: 128 }),
      draw(pc, lt, shot, t) {
        sc_market(pc, t, { snow: true, empty: true });
        npc(pc, 'm', 144, GY.market, 1, { pose: lt > 2.6 ? 'crouch' : 'stand', aR: 1, lookY: 1 });
        npc(pc, 'kid', 190, GY.market, 1, { pose: 'crouch', lookX: -1, mouth: 'tiny', eyes: 'wide' });
        dog(pc, 208, GY.market, t);
      } },

    // ================= 桥段二：回放 =================
    { in: { type: 'fade', dur: .5 }, t0: 225.5, t1: 231.77, scene: 'flash', zs: 1,
      cam: CAM(6.27, { z0: 1.55, z1: 1.68, cx0: 190, cy0: 118 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#1A222E');
        R(pc, 96, 16, 150, 140, '#2E3A4A');
        for (let i = 0; i < 4; i++) R(pc, 98, 44 + i * 32, 146, 3, '#4A5A6E');
        for (let i = 0; i < 18; i++) R(pc, 102 + (i % 9) * 14, 76 + Math.floor(i / 9) * 32, 6, 14, i % 3 ? '#5A6A7E' : '#7A8A9E');
        R(pc, 0, 156, 320, 24, '#3A4656');
        npc(pc, 'm', 190, 158, 1, { aR: 2, lookY: -1 });
        duotone(pc, '#0C1018', '#ACC4DC', .30);
      } },

    { t0: 231.77, t1: 238.04, scene: 'flash', zs: 1,
      cam: CAM(6.27, { z0: 1.5, z1: 1.62, cx0: 160, cy0: 112 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#1A222E');
        let x = -8, s = 71;
        while (x < 330) { const w = 22 + (Math.abs(Math.sin(s * 4.7) * 100) % 12 | 0); house(pc, x, 110, w, 34, '#2E3A4A', '#26303E', s, .10, '#6A7A8E', false); x += w + 3; s++; }
        R(pc, 0, 144, 320, 36, '#26303E');
        npc(pc, 'm', 176, 146, 1, { aL: 2, lookY: -1 });
        const p = Math.min(1, lt / 3.4), ly = 118 - p * 50;
        R(pc, 172, ly, 5, 6, PAL.gold);
        glow(pc, 174, ly + 3, 14, 13, PAL.gold, .55);
        for (let i = 0; i < 26; i++) R(pc, (i * 43) % 320, (i * 29) % 88, 1, 1, 'rgba(226,235,244,.6)');
        duotone(pc, '#0C1018', '#ACC4DC', .30);
      } },

    { in: { type: 'fade', dur: .5 }, t0: 238.04, t1: 244.32, scene: 'town', zs: 1,
      cam: CAM(6.28, { z0: 3.2, z1: 3.4, cx0: 150, cy0: 108 }),
      draw(pc, lt, shot, t) {
        sc_town(pc, t, { snow: false });     // 雨停了
        shadeRect(pc, 0, 0, 320, 180, .26);
        npc(pc, 'm', 148, GY.town, 1, { eyes: 'closed', mouth: 'frown' });
        const p = HZ(lt / 2.2);
        R(pc, 144, 112 + p * 10, 1, 3, 'rgba(200,225,245,.9)');
        R(pc, 150, 113 + p * 12, 1, 3, 'rgba(200,225,245,.9)');
      } },

    { in: { type: 'dither', dur: .45 }, t0: 244.32, t1: 250.62, scene: 'tavern', zs: 1,
      cam: CAM(6.3, { z0: 1.6, z1: 1.75, cx0: 168, cy0: 130 }),
      draw(pc, lt, shot, t) {
        sc_tavern(pc, t, { inside: true });
        npc(pc, 'm', 126, GY.tavern, 1, { pose: 'sit', lookY: 1, aR: .5 });
        R(pc, 152, 136, 7, 6, '#C8B27A'); R(pc, 153, 134, 5, 2, '#E8D8AE');
        R(pc, 176, 136, 7, 6, '#C8B27A'); R(pc, 177, 134, 5, 2, '#E8D8AE');
        letter(pc, 174, 132);
      } },

    { in: { type: 'fade', dur: .55 }, t0: 250.62, t1: 253.79, scene: 'snow', zs: 1,
      cam: CAM(3.17, { z0: 1.7, z1: 1.5, cx0: 160, cy0: 132 }),
      draw(pc, lt, shot, t) {
        vgradS(pc, 0, 0, 320, 104, PAL.ink, '#1B2A3C');
        R(pc, 0, 104, 320, 76, '#243447');
        for (let y = 104; y < 180; y += 3) dith(pc, 0, y, 320, 1, '#243447', '#2E4056', .3);
        for (let i = 0; i < 7; i++) {
          const y = 176 - i * 9;
          R(pc, 138 + i * 2, y, 4, 2, '#3A4C62');
          if (i < 4) R(pc, 150 + i * 2, y - 3, 4, 2, '#3A4C62');
        }
        snow(pc, t, 60, 'rgba(226,235,244,.7)');
      } },

    // ================= 三连副歌 =================
    { in: { type: 'dither', dur: .45 }, t0: 253.79, t1: 260.2, scene: 'station', zs: 1, cam: DCAM(200, 6.41),
      draw(pc, lt, shot, t) {
        sc_station(pc, t, { snow: true });
        R(pc, 178, 86, 72, 46, '#0B131C');
        R(pc, 178, 84, 72, 2, '#3E5266');
        R(pc, 212, 86, 2, 46, '#26343F');
        npc(pc, 'piao', 234, 148, 1, { lookX: -1 });
        npc(pc, 'm', 148, GY.station, 1, { lookX: 1 });
      } },

    { in: { type: 'scan', dur: .28 }, t0: 260.2, t1: 266.52, scene: 'ticket', zs: 1, cam: false,
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#0A1119');
        // 顶部一束冷光
        for (let i = 0; i < 8; i++) R(pc, 118 + i * 12, 0, 5, 44, 'rgba(150,178,204,.05)');
        // 纸（scan 进场后轻轻落定）
        const sl = Math.min(1, lt / .35);
        const py = Math.round(36 - (1 - sl) * 8);
        R(pc, 62, py, 196, 108, '#E8E2D2');
        R(pc, 62, py, 196, 2, '#B9B2A0');
        R(pc, 62, py + 106, 196, 2, '#CFC8B6');
        // 左缘打孔
        for (let i = 0; i < 6; i++) R(pc, 58, py + 10 + i * 16, 6, 6, '#0A1119');
        // 头部印刷分隔线
        R(pc, 70, py + 22, 180, 1, '#B9B2A0');
        // 条码（右下）
        for (let i = 0; i < 14; i++) R(pc, 208 + i * 2, py + 84, 1, 14, i % 3 ? '#3A362C' : '#CFC8B6');
      } },

    { in: { type: 'dither', dur: .4 }, t0: 266.52, t1: 272.86, scene: 'station', zs: 1,
      cam: CAM(6.34, { z0: 1.55, z1: 1.4, cx0: 196, cy0: 124 }),
      draw(pc, lt, shot, t) {
        sc_station(pc, t, { snow: true });
        npc(pc, 'm', 208, GY.station, 1, { view: 'back', pose: 'walk', walk: WK(t, 4) });
      } },

    { in: { type: 'whip', dur: .3, dir: 1 }, t0: 272.86, t1: 279.18, scene: 'train', zs: 1,
      cam: CAM(6.32, { z0: 1.35, z1: 1.5, cx0: 160, cy0: 118 }),
      draw(pc, lt, shot, t) {
        sc_train(pc, t, {});
        npc(pc, 'm', 146, GY.train, 1, { pose: 'sit', lookX: 1, eyes: 'narrow' });
        c.save(); c.globalAlpha = .5 + Math.sin(t * 1.6) * .18;
        npc(pc, 'she', 196, 128, 1, { lookX: -1, mouth: 'smile', eyes: 'happy' });
        c.restore();
      } },

    { in: { type: 'scan', dur: .3 }, t0: 279.18, t1: 285.49, scene: 'bag', zs: 1,
      cam: CAM(6.31, { z0: 1.0, z1: 1.08, cx0: 160, cy0: 100 }),
      draw(pc, lt, shot, t) {
        R(pc, 0, 0, 320, 180, '#070C14');
        const gx = 40, gy = 40, cw = 50, ch = 42;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
          const x = gx + i * (cw + 10), y = gy + j * (ch + 12);
          R(pc, x, y, cw, ch, '#0C141E');
          const bc = i === 1 ? '#B08A3E' : '#22303E';
          R(pc, x, y, cw, 1, bc); R(pc, x, y + ch - 1, cw, 1, bc);
          R(pc, x, y, 1, ch, bc); R(pc, x + cw - 1, y, 1, ch, bc);
        }
        letter(pc, 52, 54);
        R(pc, 112, 54, 7, 7, PAL.rose);
        watch(pc, 168, 58);
        const bl = Math.floor(t * 3) % 3;
        if (bl === 0) glow(pc, 58, 58, 16, 12, PAL.gold, .25);
        if (bl === 1) glow(pc, 116, 58, 16, 12, PAL.rose, .25);
        if (bl === 2) glow(pc, 168, 58, 16, 12, PAL.gold, .25);
      } },

    { in: { type: 'dither', dur: .4 }, t0: 285.49, t1: 291.81, scene: 'train', zs: 1,
      cam: CAM(6.32, { z0: 2.4, z1: 2.65, cx0: 158, cy0: 132 }),
      draw(pc, lt, shot, t) {
        sc_train(pc, t, {});
        npc(pc, 'm', 148, GY.train, 1, { pose: 'sit', aL: .5, aR: .5, lookY: 1, eyes: 'closed' });
        const beat = Math.max(0, Math.sin(t * 5.2)) ** 8;
        if (beat > .1) glow(pc, 150, 144, 10, 8, PAL.gold, .3 * beat);
      } },

    // ================= 结局 drop =================
    { t0: 291.81, t1: 295.76, scene: 'save2', zs: 1,
      in: { type: 'flash', dur: .14, amt: 1 },
      cam: (() => { const sh = SHAKE(.5, 5); return lt => { const b = CAM(3.95, { z0: 1.0, z1: 1.05, cx0: 160, cy0: 90 })(lt); const s = sh(lt); return [b[0] + s[0] * .6, b[1] + s[1] * .6, b[2], b[3]]; }; })(),
      draw(pc, lt, shot, t) {
        vgradS(pc, 0, 0, 320, 180, '#0B1520', '#16283C');
        for (let i = 0; i < 22; i++) {
          const x = (i * 37 - lt * 90) % 340 - 10;
          R(pc, x, 120 + (i % 5) * 6, 3, 2, 'rgba(226,235,244,.30)');
        }
        R(pc, 44, 54, 232, 72, 'rgba(9,14,20,.90)');
        R(pc, 44, 54, 232, 2, PAL.pale); R(pc, 44, 124, 232, 2, PAL.pale);
        R(pc, 44, 54, 2, 72, PAL.pale); R(pc, 274, 54, 2, 72, PAL.pale);
      } },

    { in: { type: 'scan', dur: .3 }, t0: 295.76, t1: 302.08, scene: 'post', zs: 1,
      cam: CAM(6.32, { z0: 1.35, z1: 1.5, cx0: 224, cy0: 120 }),
      draw(pc, lt, shot, t) {
        sc_post(pc, t, { snow: true });
        npc(pc, 'm', 196, GY.post, 1, { view: 'back', aR: 1 });
        const p = HZ((lt - 1.4) / 1.2);
        letter(pc, 224 + p * 18, 110 - p * 8);
        if (p > .95) {
          const k = Math.min(1, (lt - 2.8) / .6);
          if (k > 0) glow(pc, 258, 108, 30, 24, PAL.gold, .5 * k);
        }
      } },

    { in: { type: 'glitch', dur: .3 }, t0: 302.08, t1: 308.39, scene: 'save2', zs: 1,
      cam: CAM(6.31, { z0: 1.06, z1: 1.0, cx0: 160, cy0: 92 }),
      draw(pc, lt, shot, t) {
        vgradS(pc, 0, 0, 320, 180, '#0B1520', '#16283C');
        R(pc, 44, 60, 232, 60, 'rgba(9,14,20,.92)');
        R(pc, 44, 60, 232, 2, PAL.gold); R(pc, 44, 118, 232, 2, PAL.gold);
        R(pc, 44, 60, 2, 60, PAL.gold); R(pc, 274, 60, 2, 60, PAL.gold);
        const k = HZ((lt - .8) / 1.6);
        for (let i = 0; i < 26; i++) {
          const x = 190 + (i % 13) * 6 + Math.sin(i) * 3;
          const y = 96 - k * 40 * ((i % 5) * .3) + k * 20;
          if (k > 0 && k < .82) R(pc, x, y, 2, 2, 'rgba(255,209,102,.7)');
        }
      } },

    { in: { type: 'dither', dur: .5 }, t0: 308.39, t1: 313.3, scene: 'platform', zs: 1,
      cam: CAM(4.91, { z0: 1.35, z1: 1.45, cx0: 150, cy0: 120 }),
      draw(pc, lt, shot, t) {
        sc_platform(pc, t, { train: true });
        npc(pc, 'm', 84, GY.plat, 1, { lookX: 1 });
        const ids = ['xiaoman', 'afei', 'chen', 'zhou', 'piao', 'qiao', 'keeper'];
        ids.forEach((id, i) => {
          const x = 126 + i * 24;
          const dy = (i % 2) ? 4 : 0;
          const o2 = { lookX: -1, mouth: 'smile' };
          if (i === 2) o2.eyes = 'narrow';
          if (i === 4) o2.aR = 1;
          if (i === 6) o2.pose = 'stand';
          npc(pc, id, x, GY.plat + 6 + dy, 1, o2);
        });
      } },

    { t0: 313.3, t1: 317.85, scene: 'platform', zs: 1,
      cam: CAM(4.55, { z0: 1.55, z1: 1.38, cx0: 210, cy0: 112 }),
      draw(pc, lt, shot, t) {
        sc_platform(pc, t, { train: true });
        const k = HZ((lt - 1.2) / 2.6);
        for (let i = 0; i < 5; i++) if (i / 5 > k) R(pc, 16 + i * 60, 106, 18, 12, PAL.gold);
      } },

    { in: { type: 'fade', dur: .6 }, t0: 317.85, t1: 323.0, scene: 'dawn', zs: 1,
      cam: CAM(5.15, { z0: 1.35, z1: 1.1, cx0: 170, cy0: 104 }),
      draw(pc, lt, shot, t) {
        vgradS(pc, 0, 0, 320, 118, '#7C94AC', '#E8EEF4');
        R(pc, 0, 108, 320, 72, '#D3DEE8');
        c.fillStyle = '#B9C9D8';
        for (let x = 0; x < 320; x++) { const y = 102 + Math.sin(x * .017) * 6; c.fillRect(x, y, 1, 30); }
        const x = lt * 24;
        R(pc, 56 + x, 116, 46, 10, '#3E566E');
        R(pc, 104 + x, 118, 14, 8, '#33485C');
        for (let i = 0; i < 3; i++) R(pc, 62 + x + i * 12, 118, 6, 4, '#0B1520');
      } },

    { in: { type: 'fade', dur: .8 }, t0: 323.0, t1: 329.21, scene: 'black', cam: false, vig: .8,
      draw(pc) { R(pc, 0, 0, 320, 180, PAL.ink); } },
  ],

  subs: SUBS, hud: hud, nar: [],
};
