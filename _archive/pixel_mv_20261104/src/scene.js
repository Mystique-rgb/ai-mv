// ============================================================
//  scene.js — 像素场景库 v1（12 个场景）
//  规则：320×180；每场景一个地面线 gy；每场景只允许一个暖黄光源（gold）；
//       渐变一律用 Bayer 抖动，不用 alpha 渐变（像素风不能有半透明过渡）。
//  每个场景导出 { name, gy, draw(c,t,o), fg(c,t) }，fg 是可选的遮挡层。
// ============================================================

// ---------- 图元 ----------
const R = (c, x, y, w, h, col) => {
  if (w <= 0 || h <= 0) return;
  c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};
const PX = (c, x, y, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), 1, 1); };

const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
// 抖动填充：k=0 全为 ca，k=1 全为 cb。像素风的"渐变"。
function dith(c, x, y, w, h, ca, cb, k) {
  if (k <= 0) return R(c, x, y, w, h, ca);
  if (k >= 1) return R(c, x, y, w, h, cb);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    c.fillStyle = BAYER[(y + j) & 3][(x + i) & 3] / 16 < k ? cb : ca;
    c.fillRect(x + i, y + j, 1, 1);
  }
}
// 垂直渐变：从 y0 的 ca 过渡到 y1 的 cb
function vgrad(c, x, y0, w, h, ca, cb) {
  const seg = 12;
  for (let s = 0; s < seg; s++) {
    const yy = y0 + (h * s) / seg, hh = h / seg + 1;
    dith(c, x, yy, w, hh, ca, cb, (s + 1) / seg);
  }
}
// 抖动压暗：按 Bayer 阈值把一部分像素"吃掉"（而不是叠一层半透明黑）
// k=0 不变，k=1 全黑。用 getImageData 是为了保留画面色彩层次，
// 直接 fillRect 半透明会把像素风的硬边糊掉。
function shadeRect(c, x, y, w, h, k) {
  if (k <= 0) return;
  const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y));
  const x1 = Math.min(320, Math.round(x + w)), y1 = Math.min(180, Math.round(y + h));
  const ww = x1 - x0, hh = y1 - y0;
  if (ww <= 0 || hh <= 0) return;
  const img = c.getImageData(x0, y0, ww, hh), d = img.data, kk = Math.min(1, k);
  // 连续压暗（不是棋盘格）：放大 6 倍后棋盘格会变成一片"布纹"
  for (let j = 0; j < hh; j++) {
    for (let i = 0; i < ww; i++) {
      const nb = BAYER[(y0 + j) & 3][(x0 + i) & 3] / 16;      // 0..1
      const f = 1 - kk * (.86 - nb * .12);
      const p = (j * ww + i) * 4;
      d[p] *= f; d[p + 1] *= f; d[p + 2] *= f;
    }
  }
  c.putImageData(img, x0, y0);
}
function shade(c, k) { shadeRect(c, 0, 0, 320, 180, k); }
// 按函数给每个像素算压暗量的版本（用来做"窗边不许出现硬边"的羽化）
function shadeMask(c, kf) {
  const img = c.getImageData(0, 0, 320, 180), d = img.data;
  for (let y = 0; y < 180; y++) {
    for (let x = 0; x < 320; x++) {
      const k = kf(x, y);
      if (k <= 0) continue;
      const nb = BAYER[y & 3][x & 3] / 16;
      const f = 1 - Math.min(1, k) * (.86 - nb * .12);
      const p = (y * 320 + x) * 4;
      d[p] *= f; d[p + 1] *= f; d[p + 2] *= f;
    }
  }
  c.putImageData(img, 0, 0);
}
// 四边暗角
function vignette(c, k) {
  if (k <= 0) return;
  for (let j = 0; j < 180; j++) {
    const e = Math.min(j, 179 - j);
    const kk = k * Math.max(0, 1 - e / 46);
    if (kk > 0) { shadeRect(c, 0, j, 320, 1, kk); }
  }
  for (let i = 0; i < 320; i++) {
    const e = Math.min(i, 319 - i);
    const kk = k * Math.max(0, 1 - e / 70);
    if (kk > 0) { shadeRect(c, i, 0, 1, 14, kk * .9); shadeRect(c, i, 166, 1, 14, kk * .9); }
  }
}
// 光晕：在 320 画布上用 radial gradient 做"实块状"的柔和光（放大 6 倍后
// 是一圈圈 6px 的色阶，像像素游戏里的灯光，而不是满屏撒金点）。
function glow(c, cx, cy, rx, ry, col, k) {
  if (k <= 0 || rx <= 0 || ry <= 0) return;
  const [r, g, b] = hex2rgb(col);
  c.save();
  c.translate(cx, cy);
  c.scale(1, ry / rx);
  const gr = c.createRadialGradient(0, 0, 0, 0, 0, rx);
  gr.addColorStop(0, `rgba(${r},${g},${b},${Math.min(.95, k * 1.35)})`);
  gr.addColorStop(.32, `rgba(${r},${g},${b},${Math.min(.8, k)})`);
  gr.addColorStop(.62, `rgba(${r},${g},${b},${k * .34})`);
  gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  c.fillStyle = gr;
  c.fillRect(-rx, -rx, rx * 2, rx * 2);
  c.restore();
}

function hex2rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function vgradS(c, x, y, w, h, ca, cb) {
  const A = hex2rgb(ca), B = hex2rgb(cb);
  for (let j = 0; j < h; j++) {
    const k = j / Math.max(1, h - 1);
    c.fillStyle = `rgb(${Math.round(A[0] + (B[0] - A[0]) * k)},${Math.round(A[1] + (B[1] - A[1]) * k)},${Math.round(A[2] + (B[2] - A[2]) * k)})`;
    c.fillRect(x, y + j, w, 1);
  }
}
function disc(c, cx, cy, r, col) {
  c.fillStyle = col;
  for (let j = -r; j <= r; j++) {
    const w = Math.floor(Math.sqrt(Math.max(0, r * r - j * j)));
    if (w > 0) c.fillRect(Math.round(cx) - w, Math.round(cy) + j, w * 2, 1);
  }
}
function ring(c, cx, cy, r, col) {
  for (let a = 0; a < 360; a += 6) {
    const rad = a * Math.PI / 180;
    PX(c, cx + Math.cos(rad) * r, cy + Math.sin(rad) * r, col);
  }
}
// 一列楼：从 baseY 往上长
function skyline(c, baseY, n, seed, col, opt = {}) {
  let x = opt.x0 ?? -10;
  const rnd = k => Math.abs(Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453) % 1;
  for (let i = 0; i < n; i++) {
    const w = 14 + Math.floor(rnd(i) * 26), h = (opt.hMin ?? 18) + Math.floor(rnd(i + 7) * (opt.hMax ?? 60));
    R(c, x, baseY - h, w, h + 2, col);
    if (opt.roof && rnd(i + 3) > .7) R(c, x + w * .3, baseY - h - 5, w * .4, 5, col);
    x += w + 3 + Math.floor(rnd(i + 5) * 6);
    if (x > 330) break;
  }
}
// 窗灯：在楼的范围内随机点几扇亮窗
function winLights(c, x, y, w, h, seed, col, dens = .18) {
  const rnd = k => Math.abs(Math.sin(seed * 7.13 + k * 31.7) * 12345.67) % 1;
  for (let j = y + 4; j < y + h - 4; j += 6) for (let i = x + 3; i < x + w - 3; i += 5) {
    if (rnd(i * 3 + j) < dens) R(c, i, j, 2, 3, col);
  }
}
function rain(c, t, n, col, slant = 1) {
  c.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const sp = 90 + (i % 5) * 26;
    const x = ((i * 53.7 + t * 12 * slant) % 340) - 10;
    const y = ((i * 71.3 + t * sp) % 200) - 10;
    c.fillRect(Math.round(x), Math.round(y), 1, 2 + (i % 3));
  }
}
function snow(c, t, n, col) {
  c.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const x = ((i * 47.1 + Math.sin(t * .8 + i) * 6) % 330) - 5;
    const y = ((i * 61.7 + t * 14) % 195) - 5;
    c.fillRect(Math.round(x), Math.round(y), i % 7 === 0 ? 2 : 1, 1);
  }
}

// ============================================================
const SCENES = {};

// 道具阶段：1 = 她的东西都还在；2 = 只剩一只拖鞋；3 = 收走了
let STAGE = 1;
function setStage(v) { STAGE = v; }

// ---------- 01 雨街 ----------
SCENES.street = {
  name: '雨街', gy: 158,
  draw(c, t) {
    vgrad(c, 0, 0, 320, 110, PAL.night, PAL.navy);
    skyline(c, 112, 9, 3, PAL.dusk, { hMin: 26, hMax: 66 });
    winLights(c, 4, 60, 300, 52, 11, PAL.haze, .10);
    skyline(c, 118, 7, 9, PAL.night, { hMin: 34, hMax: 78 });
    winLights(c, 20, 60, 280, 56, 5, PAL.gold, .07);
    // 路面（用夜蓝不用纯黑，否则和字幕条连成一片）
    R(c, 0, 150, 320, 30, PAL.navy);
    R(c, 0, 149, 320, 2, PAL.haze);
    dith(c, 0, 150, 320, 8, PAL.navy, PAL.night, .5);
    // 反光：竖向拉长的灯柱倒影
    dith(c, 26, 152, 5, 28, PAL.navy, PAL.gold, .55);
    dith(c, 214, 152, 4, 28, PAL.navy, PAL.rose, .5);
    dith(c, 150, 154, 3, 26, PAL.navy, PAL.teal, .45);
    // 路灯（唯一暖色）
    R(c, 232, 44, 2, 110, PAL.navy);
    R(c, 226, 42, 14, 3, PAL.navy);
    R(c, 224, 46, 18, 4, PAL.gold);
    R(c, 228, 47, 10, 3, PAL.paper);             // 灯芯：唯一的接近白
    glow(c, 233, 46, 26, 22, PAL.gold, .52);
    glow(c, 233, 47, 11, 8, PAL.paper, .55);
    glow(c, 233, 74, 13, 34, PAL.gold, .22);
    // ---- 加料：街上的东西 ----
    // 斑马线
    for (let i = 0; i < 7; i++) {
      R(c, 8 + i * 46, 164, 26, 9, PAL.navy);
      R(c, 8 + i * 46, 164, 26, 1, PAL.haze);
    }
    // 公交站牌
    R(c, 44, 96, 2, 56, PAL.navy);
    R(c, 40, 88, 22, 14, PAL.ink);
    R(c, 41, 89, 20, 12, PAL.dusk);
    R(c, 44, 92, 14, 1, PAL.paper); R(c, 44, 95, 10, 1, PAL.haze);
    PX(c, 60, 90, PAL.gold);
    // 垃圾桶
    R(c, 150, 140, 12, 18, PAL.dusk);
    R(c, 149, 137, 14, 3, PAL.navy);
    R(c, 152, 144, 8, 1, PAL.night);
    // 小店橱窗（暖光透出来）
    R(c, 84, 104, 40, 30, PAL.ink);
    dith(c, 86, 106, 36, 26, PAL.navy, PAL.gold, .14);
    R(c, 104, 104, 2, 30, PAL.ink);
    R(c, 80, 100, 48, 4, PAL.navy);
    // 远处两个打伞的路人（这一版新增：街上不该只有他）
    figure(c, 26, 158, 1, { sex: 'f', pose: 'walk', walk: t * 3, eyes: 'normal', mouth: 'flat',
      col: { coat: '#8E6BB0', inner: '#E8DCC8' } });
    R(c, 12, 126, 3, 2, PAL.night);
    for (let i = 0; i < 7; i++) R(c, 13 + i * 2, 120 + i, 15 - i * 2, 1, PAL.night);
    figure(c, 292, 158, 1, { sex: 'm', pose: 'walk', walk: t * 3 + 2, eyes: 'normal', mouth: 'flat',
      col: { coat: '#4F7A6A', inner: '#C9B79C' } });
    for (let i = 0; i < 7; i++) R(c, 280 + i * 2, 120 + i, 15 - i * 2, 1, PAL.night);
    // 电线杆
    R(c, 300, 30, 3, 120, PAL.night);
    for (let x = 0; x < 320; x += 8) PX(c, x, 28 + Math.round(Math.sin(x * .04) * 3), PAL.night);
    rain(c, t, 70, PAL.haze);
  },
  fg(c, t) { rain(c, t + .1, 34, PAL.pale); },
};

// ---------- 02 房间 ----------
SCENES.room = {
  name: '房间', gy: 150,
  draw(c, t) {
    // 墙面：暖褐，不是死黑——这样挂钟、日历、相框才"在房间里"，不是浮在黑上
    vgradS(c, 0, 0, 320, 150, PAL.wall, PAL.wallDk);
    
    // 木地板 + 踢脚线
    R(c, 0, 148, 320, 2, PAL.wallDk);
    R(c, 0, 150, 320, 30, PAL.floor);
    R(c, 0, 150, 320, 2, PAL.dusk);
    for (let x = -20; x < 340; x += 26) {
      R(c, x, 152, 1, 28, PAL.floorDk);
      R(c, x + 13, 153, 1, 27, PAL.wallDk);
    }
    dith(c, 0, 170, 320, 10, PAL.floor, PAL.floorDk, .35);
    // 窗
    const wx = 176, wy = 26, ww = 108, wh = 82;
    R(c, wx - 3, wy - 3, ww + 6, wh + 6, PAL.navy);
    vgradS(c, wx, wy, ww, wh, PAL.navy, PAL.dusk);
    // 窗外：远处楼与月亮
    R(c, wx + 16, wy + 48, 18, 34, PAL.night);
    R(c, wx + 44, wy + 36, 22, 46, PAL.night);
    disc(c, wx + 84, wy + 22, 7, PAL.paper);
    for (let i = 0; i < 7; i++) PX(c, wx + 6 + i * 14, wy + 8 + (i * 13) % 22, PAL.haze);
    // 窗框
    R(c, wx + ww / 2 - 1, wy, 2, wh, PAL.navy);
    R(c, wx, wy + wh / 2 - 1, ww, 2, PAL.navy);
    // 窗光落在墙上/地上
    dith(c, wx - 6, wy + wh + 4, ww + 20, 30, PAL.night, PAL.navy, .20);
    dith(c, wx - 10, 146, ww + 26, 20, PAL.ink, PAL.navy, .24);
    // 床（左侧，占满）
    R(c, 0, 132, 84, 48, PAL.ink);
    R(c, 0, 126, 84, 8, PAL.navy);            // 床垫
    R(c, 0, 126, 84, 2, PAL.dusk);            // 床垫亮边
    R(c, 0, 136, 84, 2, PAL.night);           // 床沿下阴影
    R(c, 6, 116, 30, 10, PAL.haze);           // 枕头
    R(c, 6, 116, 30, 2, PAL.paper);
    R(c, 40, 122, 42, 6, PAL.dusk);           // 被子
    for (let i = 0; i < 4; i++) R(c, 44 + i * 10, 123, 1, 5, PAL.haze);
    R(c, 40, 122, 42, 1, PAL.haze);
    // 书桌 + 台灯（唯一暖色）
    R(c, 96, 130, 60, 4, PAL.navy);
    R(c, 96, 130, 60, 1, PAL.dusk);
    R(c, 100, 134, 4, 18, PAL.ink); R(c, 148, 134, 4, 18, PAL.ink);
    // 台灯：底座 + 灯杆 + 梯形灯罩 + 光晕（灯的"形状"必须先立起来）
    R(c, 126, 129, 9, 2, PAL.night);
    R(c, 129, 118, 3, 11, PAL.navy);
    for (let i = 0; i < 7; i++) { const w = 12 + i * 2; R(c, 130 - w / 2, 108 + i, w, 1, PAL.gold); }
    R(c, 117, 113, 26, 1, PAL.haze);                     // 灯罩下沿
    R(c, 123, 114, 15, 2, PAL.paper);                    // 灯口亮线
    R(c, 126, 115, 9, 2, PAL.paper);                     // 灯芯
    glow(c, 130, 117, 9, 6, PAL.paper, .7);
    glow(c, 130, 118, 40, 34, PAL.gold, .55);
    glow(c, 130, 132, 26, 14, PAL.gold, .55);
    glow(c, 130, 148, 40, 12, PAL.gold, .28);   // 台灯在桌面/地板上的一滩光
    // 桌上的马克杯、一摞书（让房间"住过人"）
    R(c, 101, 124, 5, 6, PAL.pale); R(c, 106, 125, 2, 3, PAL.pale);
    R(c, 140, 124, 12, 3, PAL.dusk); R(c, 142, 121, 10, 3, PAL.haze);
    // 墙上相框（两个人）——她走后唯一没收拾的东西
    R(c, 88, 42, 20, 16, PAL.dusk);
    R(c, 90, 44, 16, 12, PAL.navy);
    R(c, 93, 50, 3, 4, PAL.haze); R(c, 99, 50, 3, 4, PAL.pale);
    R(c, 93, 48, 3, 2, PAL.night); R(c, 99, 48, 3, 2, PAL.night);
    // 椅子（靠在书桌右边，背对镜头）
    R(c, 158, 118, 14, 3, PAL.night); R(c, 159, 121, 2, 14, PAL.night); R(c, 169, 121, 2, 14, PAL.night);
    R(c, 158, 133, 14, 2, PAL.dusk);
    // 地毯（一块褪色的圆角布）
    R(c, 104, 158, 78, 4, PAL.navy); R(c, 100, 162, 86, 3, PAL.night);
    dith(c, 104, 158, 74, 2, PAL.navy, PAL.dusk, .3);
    // ---- 加料：让房间"住过人" ----
    // 挂钟（指针真的在走）
    R(c, 33, 37, 20, 20, PAL.ink);
    R(c, 35, 39, 16, 16, PAL.paper);
    R(c, 35, 39, 16, 1, PAL.haze);
    R(c, 42, 46, 2, 2, PAL.ink);
    const mA = (t / 60) * Math.PI * 2, hA = (t / 720) * Math.PI * 2;
    for (let r = 1; r < 7; r++) PX(c, 42.5 + Math.cos(mA) * r, 46.5 + Math.sin(mA) * r, PAL.ink);
    for (let r = 1; r < 4; r++) PX(c, 42.5 + Math.cos(hA) * r, 46.5 + Math.sin(hA) * r, PAL.ink);
    // 日历：停在 37 号那一页
    R(c, 58, 38, 15, 18, PAL.paper);
    R(c, 58, 38, 15, 4, PAL.rose);
    R(c, 58, 56, 15, 2, PAL.haze);
    R(c, 61, 45, 9, 1, PAL.haze); R(c, 61, 48, 7, 1, PAL.haze); R(c, 61, 51, 8, 1, PAL.haze);
    // 她贴的明信片（六张，一直没撕）
    for (let i = 0; i < 6; i++) {
      const px = 116 + (i % 3) * 12, py = 54 + Math.floor(i / 3) * 15;
      R(c, px, py, 10, 12, i % 2 ? PAL.pale : PAL.haze);
      R(c, px + 1, py + 1, 8, 7, i % 3 === 0 ? PAL.dusk : PAL.navy);
      R(c, px + 1, py + 9, 8, 1, PAL.dusk);
    }
    // 窗帘（两侧垂下来）
    R(c, 170, 22, 5, 90, PAL.navy); R(c, 171, 22, 3, 90, PAL.dusk);
    R(c, 285, 22, 5, 90, PAL.navy); R(c, 286, 22, 3, 90, PAL.dusk);
    R(c, 168, 20, 10, 3, PAL.ink); R(c, 283, 20, 10, 3, PAL.ink);
    // 衣钩上的女式外套（她没带走的那件）
    R(c, 160, 58, 2, 6, PAL.ink);
    if (STAGE < 3) {
      R(c, 157, 64, 9, 20, PAL.haze);
      R(c, 157, 64, 9, 2, PAL.pale);
      R(c, 159, 66, 2, 16, PAL.pale);
      R(c, 157, 82, 9, 3, PAL.dusk);
      R(c, 158, 76, 7, 1, PAL.navy);
    }
    // 桌上的两只杯子（一只是倒扣的）
    R(c, 124, 126, 5, 5, PAL.haze); R(c, 129, 127, 2, 3, PAL.haze);
    R(c, 132, 127, 5, 4, PAL.pale); R(c, 132, 127, 5, 1, PAL.haze);
    // 门口那双拖鞋（母题：一双 → 一只 → 没了）
    if (STAGE < 3) {
      R(c, 244, 158, 8, 4, PAL.rose); R(c, 245, 157, 6, 1, PAL.blush);
      R(c, 245, 162, 7, 2, PAL.night);
    }
    if (STAGE < 2) {
      R(c, 255, 159, 8, 4, PAL.rose); R(c, 256, 158, 6, 1, PAL.blush);
      R(c, 256, 163, 7, 2, PAL.night);
    }
    // 没拆的行李箱（靠着墙）
    if (STAGE < 3) {
      R(c, 294, 144, 22, 24, PAL.dusk);
      R(c, 294, 144, 22, 2, PAL.haze);
      R(c, 294, 154, 22, 1, PAL.navy);
      R(c, 300, 140, 8, 4, PAL.night);
      R(c, 304, 148, 3, 12, PAL.navy);
    }
    // 窗光落地：两束斜光——灯亮的地方才是"房间"
    c.save();
    c.fillStyle = '#FFD9A8';
    c.globalAlpha = .10;
    c.beginPath(); c.moveTo(192, 108); c.lineTo(236, 108); c.lineTo(316, 178); c.lineTo(214, 178); c.closePath(); c.fill();
    c.globalAlpha = .06;
    c.beginPath(); c.moveTo(252, 108); c.lineTo(282, 108); c.lineTo(320, 164); c.lineTo(302, 178); c.closePath(); c.fill();
    c.restore();
    // 窗边一点月光冷亮：满屋暖褐里留一口气
    glow(c, wx + 84, wy + 22, 30, 30, PAL.pale, .13);
  },
  fg(c, t) {
    const k = (t * .3) % 1;
    if (k < .25) { const x = 176 + k * 4 * 108; PX(c, x, 60, PAL.ink); PX(c, x + 2, 59, PAL.ink); PX(c, x + 4, 60, PAL.ink); }
  },
};

// ---------- 03 天台 ----------
SCENES.rooftop = {
  name: '天台', gy: 152,
  draw(c, t) {
    vgrad(c, 0, 0, 320, 100, PAL.ink, PAL.navy);
    vgrad(c, 0, 60, 320, 60, PAL.navy, PAL.dusk);
    for (let i = 0; i < 34; i++) {
      const x = (i * 79.7) % 320, y = (i * 43.1) % 74;
      if ((i * 7) % 3) PX(c, x, y, PAL.pale);
    }
    // 远处城市
    skyline(c, 118, 16, 21, PAL.dusk, { hMin: 12, hMax: 40 });
    winLights(c, 0, 90, 320, 30, 4, PAL.gold, .05);
    // 天台地面
    R(c, 0, 118, 320, 62, PAL.night);
    R(c, 0, 116, 320, 3, PAL.haze);
    dith(c, 0, 120, 320, 20, PAL.night, PAL.navy, .4);
    // 栏杆（前景）
    for (let x = 0; x < 320; x += 22) R(c, x, 96, 2, 26, PAL.ink);
    R(c, 0, 94, 320, 3, PAL.ink);
    R(c, 0, 108, 320, 2, PAL.ink);
    // 水箱（左侧剪影）
    R(c, 8, 62, 40, 34, PAL.ink);
    R(c, 14, 54, 28, 9, PAL.ink);
    R(c, 4, 94, 4, 4, PAL.ink); R(c, 48, 94, 4, 4, PAL.ink);
    // 一盏小灯（唯一暖色）
    PX(c, 300, 92, PAL.gold); PX(c, 299, 93, PAL.gold); PX(c, 301, 93, PAL.gold);
    PX(c, 300, 91, PAL.paper);
    dith(c, 296, 90, 9, 8, PAL.dusk, PAL.gold, .3);
    // ---- 加料 ----
    // 晾衣绳（空衣架在风里晃）
    R(c, 26, 54, 250, 1, PAL.haze);
    for (let i = 0; i < 4; i++) {
      const hx = 62 + i * 56 + Math.round(Math.sin(t * 1.2 + i) * 2);
      R(c, hx, 54, 1, 7, PAL.haze);
      R(c, hx - 3, 61, 7, 1, PAL.dusk);
    }
    // 烟囱
    R(c, 250, 58, 17, 40, PAL.night);
    R(c, 248, 55, 21, 4, PAL.dusk);
    R(c, 250, 58, 17, 1, PAL.haze);
    // 天线
    R(c, 302, 28, 1, 64, PAL.haze);
    R(c, 294, 38, 15, 1, PAL.haze);
    R(c, 297, 46, 9, 1, PAL.haze);
    // 空调外机
    R(c, 24, 102, 24, 15, PAL.dusk);
    R(c, 26, 104, 20, 11, PAL.navy);
    for (let i = 0; i < 3; i++) R(c, 28, 106 + i * 3, 16, 1, PAL.haze);
  },
};

// ---------- 04 海边 ----------
SCENES.sea = {
  name: '海边', gy: 148,
  draw(c, t) {
    vgradS(c, 0, 0, 320, 96, PAL.ink, PAL.dusk);
    disc(c, 244, 34, 11, '#E8F4FF');                // 月：冷白，全片最亮的一处
    glow(c, 244, 34, 36, 36, '#E8F4FF', .28);       // 月晕
    glow(c, 244, 92, 60, 10, PAL.haze, .14);        // 海平线的一点暖
    for (let i = 0; i < 12; i++) PX(c, (i * 61) % 320, (i * 29) % 40, PAL.pale);
    // 海（微冷的水色，压住整片暖褐；远岸留一线暖光）
    R(c, 0, 92, 320, 48, PAL.seaDk);
    R(c, 0, 91, 320, 1, PAL.haze);
    // 水线：横短线，越远越密（整行抖动会变成布纹）
    for (let i = 0; i < 110; i++) {
      const y = 94 + (i * 31) % 44;
      const x = ((i * 53 + t * 12) % 340) - 10;
      const w = 3 + (i % 6) * 3;
      R(c, x, y, w, 1, i % 3 === 0 ? PAL.haze : PAL.dusk);
    }
    dith(c, 0, 92, 320, 10, PAL.seaDk, PAL.dusk, .26);
    // 月光在水面拉出一条路
    for (let y = 94; y < 140; y += 2) {
      const w = 5 + Math.sin(t * 2 + y * .4) * 3 + (y - 94) * .30;
      dith(c, 244 - w, y, w * 2, 1, PAL.seaDk, PAL.pale, .46);
    }
    // 浪线
    for (let i = 0; i < 26; i++) {
      const x = (i * 37 + t * 8) % 320, y = 100 + (i * 19) % 36;
      PX(c, x, y, PAL.haze);
      if (i % 3 === 0) PX(c, x + 1, y + 1, PAL.haze);
    }
    // 沙滩（暖褐的沙，和冷色的海分开）
    R(c, 0, 140, 320, 40, PAL.floor);
    R(c, 0, 139, 320, 2, PAL.dusk);
    dith(c, 0, 142, 320, 12, PAL.floor, PAL.wallDk, .42);
    dith(c, 0, 140, 320, 2, PAL.floor, PAL.haze, .3);
    // 远处小船（唯一暖色：船灯）
    R(c, 62, 88, 12, 3, PAL.ink);
    PX(c, 68, 86, PAL.gold);
    dith(c, 56, 82, 24, 6, PAL.dusk, PAL.gold, .2);
    // ---- 加料 ----
    // 灯塔（一明一暗）
    R(c, 296, 58, 7, 42, PAL.night);
    R(c, 294, 54, 11, 5, PAL.dusk);
    const lk = (t * .8) % 7;
    if (lk < 1.4) { disc(c, 299, 56, 3, PAL.gold); disc(c, 299, 56, 1, PAL.paper); glow(c, 299, 56, 26, 16, PAL.gold, .40); glow(c, 299, 56, 8, 6, PAL.paper, .6); }
    // 海鸥
    for (let i = 0; i < 3; i++) {
      const bx = 46 + i * 23 + Math.sin(t * .6 + i * 2) * 5;
      const by = 44 - i * 7 + Math.cos(t * .45 + i) * 2;
      PX(c, bx, by, PAL.ink); PX(c, bx + 1, by - 1, PAL.ink); PX(c, bx + 2, by, PAL.ink);
    }
    // 礁石
    R(c, 16, 134, 30, 8, PAL.navy);
    R(c, 22, 129, 15, 6, PAL.dusk);
    R(c, 30, 127, 7, 3, PAL.haze);
    // 被浪冲上来的瓶子
    R(c, 268, 143, 3, 5, PAL.mint); PX(c, 269, 142, PAL.pale);
  },
};

// ---------- 05 教室 ----------
SCENES.classroom = {
  name: '教室', gy: 152,
  draw(c, t) {
    R(c, 0, 0, 320, 180, PAL.navy);
    dith(c, 0, 0, 320, 60, PAL.navy, PAL.night, .5);
    // 黑板
    R(c, 24, 22, 150, 64, PAL.ink);
    R(c, 22, 20, 154, 68, PAL.dusk);
    R(c, 24, 22, 150, 64, PAL.ink);
    for (let i = 0; i < 5; i++) R(c, 34, 32 + i * 10, 60 + (i * 37) % 70, 1, PAL.haze);
    // 窗（右侧三扇）
    for (let i = 0; i < 3; i++) {
      const x = 196 + i * 42;
      vgrad(c, x, 24, 34, 56, PAL.dusk, PAL.haze);
      R(c, x, 24, 34, 2, PAL.night); R(c, x, 78, 34, 2, PAL.night);
      R(c, x, 24, 2, 56, PAL.night); R(c, x + 32, 24, 2, 56, PAL.night);
      R(c, x, 50, 34, 2, PAL.night);
    }
    // 吊灯（唯一暖色）
    for (const lx of [70, 150]) {
      R(c, lx, 0, 1, 8, PAL.navy);
      R(c, lx - 7, 8, 15, 3, PAL.gold);
      R(c, lx - 7, 11, 15, 1, PAL.paper);
      glow(c, lx, 12, 20, 18, PAL.gold, .34);
    }
    // 课桌：三排，越近越大
    const rows = [[1, 112, 26], [1.25, 132, 32], [1.5, 156, 38]];
    for (const [k, y, w] of rows) {
      const n = Math.round(6 - k);
      for (let i = 0; i < n; i++) {
        const x = 8 + i * (300 / n);
        R(c, x, y, w, 3, PAL.dusk);
        R(c, x + 2, y + 3, 2, 10, PAL.ink);
        R(c, x + w - 4, y + 3, 2, 10, PAL.ink);
      }
    }
    R(c, 0, 168, 320, 12, PAL.ink);
    // 同学（三个人，不同颜色的衣服）
    figure(c, 52, 116, 1, { sex: 'f', pose: 'sit', eyes: 'dot', mouth: 'flat', col: { coat: '#8E6BB0', inner: '#FFF3DE' } });
    figure(c, 150, 116, 1, { sex: 'm', pose: 'sit', eyes: 'dot', mouth: 'flat', col: { coat: '#4F7A6A', inner: '#E8DCC8' } });
    figure(c, 250, 136, 1, { sex: 'm', pose: 'sit', eyes: 'dot', mouth: 'flat', col: { coat: '#C26A4E', inner: '#C9B79C' } });
    // ---- 加料 ----
    // 黑板右下角的值日表
    R(c, 132, 62, 30, 20, PAL.navy);
    R(c, 134, 64, 26, 2, PAL.pale);
    R(c, 134, 68, 20, 1, PAL.haze);
    R(c, 134, 71, 22, 1, PAL.haze);
    R(c, 134, 74, 16, 1, PAL.haze);
    // 窗台上的盆栽
    R(c, 228, 76, 7, 6, PAL.dusk);
    R(c, 229, 72, 5, 4, PAL.slate);
    PX(c, 231, 70, PAL.gold);
    // 后排的空桌（她不在了）
    R(c, 246, 140, 34, 3, PAL.haze);
    R(c, 248, 143, 2, 10, PAL.ink); R(c, 276, 143, 2, 10, PAL.ink);
    R(c, 250, 136, 26, 3, PAL.dusk);
  },
};

// ---------- 06 车厢 ----------
SCENES.train = {
  name: '车厢', gy: 156,
  draw(c, t) {
    R(c, 0, 0, 320, 180, PAL.night);
    R(c, 0, 0, 320, 22, PAL.ink);                 // 车顶
    R(c, 0, 21, 320, 2, PAL.gold);                // 顶部灯带（唯一暖色）
    R(c, 0, 21, 320, 1, PAL.paper);               // 灯管白芯
    glow(c, 160, 24, 190, 18, PAL.gold, .24);
    glow(c, 160, 22, 120, 4, PAL.paper, .30);
    // 三扇车窗
    for (let i = 0; i < 3; i++) {
      const x = 18 + i * 98, y = 30, w = 84, h = 58;
      R(c, x - 3, y - 3, w + 6, h + 6, PAL.ink);
      R(c, x, y, w, h, PAL.night);
      // 窗外夜色先压一层，光条才像"远处"（顺序反了光条会被压没）
      dith(c, x, y, w, h, PAL.night, PAL.ink, .24);
      // 掠过的城市光条（细，被窗框裁掉）
      for (let k = 0; k < 11; k++) {
        const sx = ((t * 190 + k * 31 + i * 23) % (w + 50)) - 25;
        const yy = y + 6 + ((k * 23) % (h - 12));
        const ww = 5 + (k * 11) % 15;
        const x0 = Math.max(x, x + sx), x1 = Math.min(x + w, x + sx + ww);
        if (x1 <= x0) continue;
        c.fillStyle = k % 3 === 0 ? PAL.teal : (k % 3 === 1 ? PAL.gold : PAL.haze);
        c.fillRect(x0, yy, x1 - x0, k % 4 === 0 ? 2 : 1);
        if (k % 5 === 0) c.fillRect(x0 + 1, yy - 1, Math.max(1, x1 - x0 - 2), 1);
      }
      R(c, x + w / 2 - 1, y, 2, h, PAL.ink);      // 窗框十字
    }
    // 座椅：靠背 + 坐垫
    for (let x = 2; x < 320; x += 64) {
      R(c, x, 92, 48, 22, PAL.navy);
      R(c, x, 92, 48, 2, PAL.dusk);
      R(c, x, 112, 48, 7, PAL.dusk);
      R(c, x, 112, 48, 1, PAL.haze);
    }
    // 地板
    R(c, 0, 146, 320, 34, PAL.ink);
    dith(c, 0, 146, 320, 10, PAL.ink, PAL.navy, .3);
    dith(c, 150, 150, 22, 30, PAL.ink, PAL.gold, .10);   // 顶灯在地面的反光
    // 扶手吊环
    R(c, 0, 26, 320, 1, PAL.haze);
    for (let x = 40; x < 320; x += 58) { R(c, x, 27, 1, 9, PAL.haze); ring(c, x + 1, 39, 3, PAL.pale); }
    // ---- 加料 ----
    // 对面空座上的她的围巾
    R(c, 226, 110, 16, 4, PAL.rose);
    R(c, 226, 110, 4, 9, PAL.rose);
    R(c, 226, 110, 16, 1, PAL.blush);
    // 地上的拉杆箱
    R(c, 104, 124, 16, 16, PAL.dusk);
    R(c, 104, 124, 16, 2, PAL.haze);
    R(c, 110, 120, 2, 5, PAL.night);
    R(c, 104, 132, 16, 1, PAL.navy);
    // 车窗上的雾气手印
    dith(c, 58, 60, 12, 16, PAL.ink, PAL.paper, .22);
    dith(c, 62, 74, 6, 3, PAL.ink, PAL.paper, .3);
    // 车厢里另外两个人（有人在，才显得他孤单）
    figure(c, 66, 120, 1, { sex: 'm', pose: 'sit', eyes: 'asleep', mouth: 'flat',
      col: { coat: '#42506B', inner: '#C9B79C' } });
    figure(c, 250, 120, 1, { sex: 'f', pose: 'sit', eyes: 'dot', mouth: 'flat', lookX: -.4,
      col: { coat: '#7A5A8E', inner: '#E8DCC8' } });
  },
};

// ---------- 07 路灯 ----------
SCENES.lamp = {
  name: '路灯', gy: 156,
  draw(c, t) {
    R(c, 0, 0, 320, 180, PAL.ink);
    vgrad(c, 0, 0, 320, 106, PAL.ink, PAL.night);
    // 远处城市：两排剪影，一盏盏窗灯
    skyline(c, 112, 9, 17, PAL.night, { hMin: 16, hMax: 52 });
    winLights(c, 0, 62, 320, 46, 23, PAL.haze, .05);
    // 湿路面
    R(c, 0, 150, 320, 30, PAL.night);
    R(c, 0, 149, 320, 2, PAL.navy);
    dith(c, 0, 150, 320, 8, PAL.night, PAL.navy, .55);
    // 电线
    for (let x = 0; x < 320; x += 40) PX(c, x, 26 + Math.sin(x * .05) * 4, PAL.night);
    // 灯柱
    R(c, 198, 40, 3, 118, PAL.navy);
    R(c, 190, 34, 20, 4, PAL.navy);
    R(c, 184, 38, 32, 6, PAL.gold);
    R(c, 188, 44, 24, 2, PAL.paper);
    R(c, 194, 44, 12, 2, PAL.paper);
    // 光锥：用平滑渐变画（点阵放大 6 倍会变成一把金豆子）
    const cg = c.createLinearGradient(0, 44, 0, 160);
    cg.addColorStop(0, 'rgba(255,195,92,.26)');
    cg.addColorStop(.55, 'rgba(255,195,92,.10)');
    cg.addColorStop(1, 'rgba(255,195,92,0)');
    c.save();
    c.beginPath(); c.moveTo(198, 44); c.lineTo(158, 160); c.lineTo(244, 160); c.closePath(); c.clip();
    c.fillStyle = cg; c.fillRect(150, 44, 100, 116);
    c.restore();
    glow(c, 200, 48, 26, 12, PAL.gold, .5);
    // 地面光圈 + 湿地面拉长的倒影
    glow(c, 200, 156, 62, 9, PAL.gold, .34);
    dith(c, 196, 158, 8, 20, PAL.night, PAL.gold, .30);
    dith(c, 30, 154, 5, 22, PAL.night, PAL.haze, .22);
    dith(c, 262, 154, 4, 20, PAL.night, PAL.rose, .18);
    // 雨
    rain(c, t, 50, PAL.haze);
    // ---- 加料 ----
    // 长椅
    R(c, 18, 130, 58, 3, PAL.dusk);
    R(c, 18, 120, 58, 2, PAL.navy);
    R(c, 20, 133, 3, 14, PAL.night);
    R(c, 71, 133, 3, 14, PAL.night);
    R(c, 18, 129, 58, 1, PAL.haze);
    // 公交站牌
    R(c, 120, 96, 2, 56, PAL.navy);
    R(c, 112, 86, 20, 12, PAL.ink);
    R(c, 114, 88, 16, 8, PAL.dusk);
    R(c, 116, 90, 12, 1, PAL.paper);
    // 地上的烟头
    PX(c, 96, 152, PAL.paper); PX(c, 104, 154, PAL.pale); PX(c, 88, 150, PAL.haze);
  },
  fg(c, t) { rain(c, t + .08, 26, PAL.pale); },
};

// ---------- 08 楼梯间 ----------
SCENES.stairs = {
  name: '楼梯间', gy: 160,
  draw(c, t) {
    R(c, 0, 0, 320, 180, PAL.night);
    // 侧墙
    R(c, 0, 0, 96, 180, PAL.ink);
    dith(c, 96, 0, 26, 180, PAL.night, PAL.ink, .5);
    // 上方小窗（冷光，唯一暖色留给楼梯灯）
    R(c, 226, 18, 56, 44, PAL.navy);
    vgrad(c, 228, 20, 52, 40, PAL.haze, PAL.pale);
    R(c, 226, 18, 56, 2, PAL.ink); R(c, 226, 60, 56, 2, PAL.ink);
    R(c, 226, 18, 2, 44, PAL.ink); R(c, 280, 18, 2, 44, PAL.ink);
    R(c, 252, 18, 2, 44, PAL.ink);
    // 窗光斜打下来
    dith(c, 150, 62, 150, 60, PAL.night, PAL.haze, .16);
    // 阶梯：右下往左上
    for (let i = 0; i < 9; i++) {
      const y = 160 - i * 12, x = 110 + i * 14;
      R(c, x, y - 12, 320 - x, 12, PAL.navy);
      R(c, x, y - 12, 320 - x, 2, PAL.dusk);
      R(c, x, y - 1, 320 - x, 1, PAL.ink);
    }
    // 扶手
    for (let i = 0; i < 9; i++) {
      const y = 148 - i * 12, x = 118 + i * 14;
      R(c, x, y - 24, 1, 24, PAL.haze);
    }
    for (let i = 0; i < 8; i++) R(c, 118 + i * 14, 124 - i * 12, 15, 1, PAL.haze);
    // 楼梯灯（唯一暖色）：一盏壁灯，不是一个金色方块
    R(c, 86, 94, 8, 3, PAL.gold);
    R(c, 88, 94, 4, 2, PAL.paper);
    R(c, 85, 93, 10, 1, PAL.pale);
    R(c, 89, 97, 2, 4, PAL.navy);
    glow(c, 90, 100, 22, 20, PAL.gold, .38);
    // ---- 加料 ----
    // 转角堆的纸箱
    R(c, 6, 124, 24, 24, PAL.dusk);
    R(c, 6, 124, 24, 2, PAL.haze);
    R(c, 17, 124, 2, 24, PAL.navy);
    R(c, 6, 136, 24, 1, PAL.navy);
    R(c, 11, 112, 15, 12, PAL.navy);
    R(c, 11, 112, 15, 1, PAL.haze);
    // 墙上的小广告
    R(c, 20, 64, 18, 12, PAL.paper);
    R(c, 22, 66, 14, 2, PAL.rose); R(c, 22, 70, 10, 1, PAL.haze); R(c, 22, 73, 12, 1, PAL.haze);
    R(c, 24, 80, 14, 9, PAL.pale);
    R(c, 26, 82, 10, 1, PAL.haze); R(c, 26, 85, 8, 1, PAL.haze);
  },
};

// ---------- 09 便利店 ----------
SCENES.store = {
  name: '便利店', gy: 158,
  draw(c, t) {
    R(c, 0, 0, 320, 180, PAL.ink);
    // 店内地面
    R(c, 0, 132, 320, 48, PAL.navy);
    dith(c, 0, 132, 320, 20, PAL.navy, PAL.haze, .3);
    for (let x = 0; x < 320; x += 40) R(c, x, 132, 1, 48, PAL.dusk);
    // 冷柜（teal 冷光，不是暖色）
    R(c, 176, 40, 118, 92, PAL.ink);
    dith(c, 178, 42, 114, 88, PAL.ink, PAL.teal, .13);
    for (let i = 0; i < 5; i++) R(c, 180 + i * 22, 46, 1, 80, PAL.night);
    for (let i = 0; i < 3; i++) R(c, 178 + i * 38, 42, 2, 88, PAL.night);
    for (let i = 0; i < 4; i++) R(c, 178, 56 + i * 22, 114, 1, PAL.night);
    // 货架
    for (let i = 0; i < 4; i++) R(c, 12, 56 + i * 22, 140, 1, PAL.dusk);
    R(c, 10, 52, 2, 80, PAL.night); R(c, 152, 52, 2, 80, PAL.night);
    for (let s2 = 0; s2 < 4; s2++) {
      for (let i = 0; i < 14; i++) {
        const x = 14 + i * 10, y = 50 + s2 * 22;
        const col = ['#E85D6E', '#F2C14E', '#7FD0DC', '#FFF3DE', '#8E6BB0'][(i + s2) % 5];
        R(c, x, y, 6, 7, col);
        R(c, x, y, 6, 1, PAL.paper);
      }
    }
    // 玻璃门框
    R(c, 0, 0, 6, 132, PAL.night);
    R(c, 300, 0, 20, 132, PAL.night);
    R(c, 0, 128, 320, 4, PAL.night);
    // 招牌（唯一暖色）：灯箱 —— 亮框 + 暗底 + 字
    R(c, 24, 4, 134, 18, PAL.night);
    R(c, 26, 6, 130, 14, PAL.gold);
    R(c, 28, 8, 126, 10, PAL.dusk);
    for (let i = 0; i < 5; i++) R(c, 34 + i * 24, 11, 15, 4, PAL.paper);
    glow(c, 92, 13, 60, 6, PAL.paper, .34);
    dith(c, 20, 22, 142, 10, PAL.ink, PAL.gold, .28);
    // ---- 加料 ----
    // 关东煮锅（冒热气）
    R(c, 46, 106, 38, 4, PAL.haze);
    R(c, 48, 110, 34, 14, PAL.navy);
    for (let i = 0; i < 4; i++) {
      R(c, 50 + i * 8, 111, 6, 4, i % 2 ? PAL.paper : PAL.dusk);
      R(c, 50 + i * 8, 116, 6, 1, PAL.ink);
    }
    for (let i = 0; i < 5; i++) {
      const yy = 104 - ((t * 9 + i * 7) % 26);
      dith(c, 50 + i * 7, yy, 5, 4, PAL.night, PAL.paper, .16);
    }
    // 收银台
    R(c, 0, 112, 26, 22, PAL.dusk);
    R(c, 0, 112, 26, 2, PAL.haze);
    R(c, 4, 116, 12, 8, PAL.navy);
    PX(c, 18, 116, PAL.gold); PX(c, 19, 117, PAL.gold);
    // 门口的伞桶
    R(c, 300, 126, 12, 20, PAL.navy);
    R(c, 302, 118, 1, 10, PAL.haze); R(c, 306, 116, 1, 12, PAL.haze); R(c, 309, 119, 1, 9, PAL.haze);
  },
};

// ---------- 10 雪地 ----------
SCENES.snow = {
  name: '雪地', gy: 150,
  draw(c, t) {
    vgradS(c, 0, 0, 320, 108, PAL.ink, PAL.dusk);
    disc(c, 66, 30, 8, PAL.pale);
    // 远林：一整条起伏的林线（画成一棵棵细棍放大后会像栅栏）
    for (let x = -4; x < 330; x += 3) {
      const h = 5 + Math.abs(Math.sin(x * .11)) * 11 + ((x * 7) % 5) * .6;
      R(c, x, 108 - h, 3, h, PAL.night);
    }
    // 雪地（连续色阶，两层抖动叠起来会变成"棋盘"）
    vgradS(c, 0, 106, 320, 22, PAL.navy, PAL.pale);
    R(c, 0, 126, 320, 54, PAL.paper);
    dith(c, 0, 126, 320, 2, PAL.pale, PAL.haze, .18);
    // 近景三棵树：锥形剪影 + 积雪
    for (const [x, h] of [[38, 62], [92, 40], [268, 54]]) {
      R(c, x, 150 - h * .45, 3, h * .45, PAL.ink);
      for (let k = 0; k < h * .62; k++) {
        const w = 2 + k * (24 / (h * .62));
        const y = 150 - h * .62 + k;
        R(c, x + 1 - w / 2, y, Math.round(w), 1, PAL.ink);
        if (k % 6 === 2 || k < 2) R(c, x + 1 - w / 2, y, Math.round(w), 1, PAL.pale);
      }
    }
    // 脚印
    for (let i = 0; i < 9; i++) {
      const x = 150 + i * 15, y = 132 + i * 5;
      R(c, x, y, 3, 2, PAL.navy);
      R(c, x + 3, y + 1, 3, 2, PAL.haze);
    }
    // 窗里透出的一点暖光（唯一暖色）
    R(c, 300, 96, 3, 3, PAL.gold);
    dith(c, 296, 92, 12, 10, PAL.dusk, PAL.gold, .25);
    // ---- 加料 ----
    // 远处的路灯
    R(c, 40, 98, 2, 46, PAL.navy);
    R(c, 35, 93, 12, 4, PAL.gold);
    glow(c, 41, 98, 22, 18, PAL.gold, .30);
    // 一排矮栅栏（只在左侧，别整条横过去）
    for (let x = 4; x < 120; x += 15) R(c, x, 130, 2, 14, PAL.night);
    R(c, 4, 133, 116, 1, PAL.haze);
    // 邮筒
    R(c, 244, 120, 15, 24, PAL.rose);
    R(c, 244, 116, 15, 5, PAL.ink);
    R(c, 248, 126, 7, 1, PAL.ink);
    R(c, 244, 144, 15, 2, PAL.night);
    // 被雪埋了一半的自行车
    R(c, 188, 132, 20, 2, PAL.night);
    ring(c, 191, 137, 4, PAL.haze);
    ring(c, 205, 137, 4, PAL.haze);
    R(c, 190, 126, 1, 8, PAL.haze); R(c, 204, 126, 1, 8, PAL.haze);
    R(c, 190, 126, 10, 1, PAL.haze);
    R(c, 186, 134, 14, 2, PAL.pale);
    snow(c, t, 60, PAL.pale);
  },
  fg(c, t) { snow(c, t + .2, 24, PAL.paper); },
};

// ---------- 11 走廊 ----------
SCENES.corridor = {
  name: '走廊', gy: 158,
  draw(c, t) {
    R(c, 0, 0, 320, 180, PAL.ink);
    const vx = 160, vy = 95;                       // 消失点
    const eL = 132, eR = 188, eT = 62, eB = 128;   // 尽头墙四边
    // 天花板 / 左墙 / 右墙 / 地面：按消失点收敛的梯形
    for (let y = 0; y < 180; y++) {
      let xl = 0, xr = 320;
      if (y < eT)      { const k = y / eT;        xl = 0 + k * eL;      xr = 320 - k * (320 - eR); }
      else if (y <= eB){ xl = eL;                  xr = eR; }
      else             { const k = (y - eB) / (180 - eB); xl = eL * (1 - k); xr = eR + k * (320 - eR); }
      // 分区着色
      if (y < eT) dith(c, Math.round(xl), y, Math.round(xr - xl), 1, PAL.night, PAL.ink, .5);          // 天花板
      else if (y <= eB) {                                                                             // 两墙
        dith(c, Math.round(xl), y, Math.round(eL - xl) + 1, 1, PAL.navy, PAL.ink, .5);
        dith(c, Math.round(eR), y, Math.round(xr - eR) + 1, 1, PAL.night, PAL.ink, .55);
      } else dith(c, Math.round(xl), y, Math.round(xr - xl), 1, PAL.navy, PAL.dusk, .3 + (y - eB) / 60 * .3); // 地面
    }
    // 尽头墙
    R(c, eL, eT, eR - eL, eB - eT, PAL.navy);
    dith(c, eL, eT, eR - eL, eB - eT, PAL.navy, PAL.night, .3);
    // 两侧门（贴墙，近大远小）
    for (let i = 0; i < 3; i++) {
      const k = i / 3;
      const dw = 34 - k * 16, dh = 58 - k * 22;
      const dy2 = eB - dh + k * 6;
      R(c, 20 + k * 44, dy2, dw, dh, PAL.dusk);
      R(c, 20 + k * 44, dy2, dw, 2, PAL.haze);
      R(c, 20 + k * 44 + dw - 4, dy2 + dh / 2, 2, 3, PAL.haze);
      R(c, 286 - k * 44, dy2, dw, dh, PAL.night);
      R(c, 286 - k * 44, dy2, dw, 2, PAL.dusk);
    }
    // 尽头的窗（唯一暖色：夕照）
    const ww = 34, wh = 44, wx = vx - ww / 2, wy = vy - wh / 2;
    R(c, wx - 3, wy - 3, ww + 6, wh + 6, PAL.night);
    vgradS(c, wx, wy, ww, wh, PAL.haze, PAL.paper);   // 夕照窗：上暖下亮
    R(c, wx + ww / 2 - 1, wy, 2, wh, PAL.dusk);
    R(c, wx, wy + wh / 2 - 1, ww, 2, PAL.dusk);
    // 光晕 + 地面光斑（柔和光，不是一屏金点）
    glow(c, vx, vy, 66, 58, PAL.gold, .30);
    dith(c, vx - 16, eB, 32, 10, PAL.navy, PAL.dusk, .35);
    for (let j = 0; j < 34; j++) {
      const k = j / 34;
      dith(c, vx - 24 + k * 10, eB + j + 2, 48 - k * 14, 1, PAL.navy, PAL.gold, .4 - k * .35);
    }
    // ---- 加料 ----
    // 信箱（塞满传单）
    R(c, 20, 94, 30, 24, PAL.dusk);
    for (let i = 0; i < 3; i++) {
      R(c, 22 + i * 10, 96, 8, 9, PAL.night);
      R(c, 22 + i * 10, 104, 8, 1, PAL.haze);
    }
    R(c, 26, 106, 6, 6, PAL.paper);
    // 门牌
    R(c, 34, 120, 7, 4, PAL.pale); R(c, 278, 118, 7, 4, PAL.pale);
    // 电表（转）
    R(c, 26, 62, 13, 15, PAL.ink);
    R(c, 28, 64, 9, 11, PAL.haze);
    PX(c, 32 + Math.round(Math.sin(t * 2) * 2), 70, PAL.rose);
    // 脚垫
    R(c, 118, 152, 36, 6, PAL.navy);
    dith(c, 118, 152, 36, 6, PAL.navy, PAL.dusk, .5);
  },
};

// ---------- 12 空房 ----------
SCENES.emptyroom = {
  name: '空房', gy: 154,
  draw(c, t) {
    vgradS(c, 0, 0, 320, 121, PAL.wall, PAL.wallDk);
    dith(c, 0, 0, 320, 22, PAL.wall, PAL.wallDk, .22);
    // 踢脚线
    R(c, 0, 118, 320, 3, PAL.dusk);
    // 地板
    R(c, 0, 121, 320, 59, PAL.floor);
    for (let x = -40; x < 340; x += 26) {
      for (let y = 121; y < 180; y += 1) {
        // 木纹：斜向透视
        const xx = x + (y - 121) * .58;
        if ((y - 121) % 12 === 0) PX(c, xx, y, PAL.floorDk);
      }
    }
    dith(c, 0, 121, 320, 20, PAL.floor, PAL.floorDk, .40);
    // 一扇窗（唯一光源，暖白）
    const wx = 108, wy = 26, ww = 104, wh = 84;
    R(c, wx - 4, wy - 4, ww + 8, wh + 8, PAL.dusk);
    vgradS(c, wx, wy, ww, wh, PAL.night, PAL.dusk);
    disc(c, wx + 76, wy + 20, 7, PAL.paper);
    for (let i = 0; i < 9; i++) PX(c, wx + 8 + (i * 17) % 90, wy + 8 + (i * 13) % 30, PAL.haze);
    dith(c, wx, wy + 62, ww, 22, PAL.night, PAL.dusk, .45);
    for (let i = 0; i < 12; i++) PX(c, wx + 5 + (i * 19) % 88, wy + 64 + (i * 7) % 16, PAL.gold);
    R(c, wx + ww / 2 - 1, wy, 2, wh, PAL.dusk);
    R(c, wx, wy + wh / 2 - 1, ww, 2, PAL.dusk);
    glow(c, wx + 30, wy + 66, 40, 30, PAL.gold, .16);
    // 窗光落在地上：平行四边形
    for (let j = 0; j < 46; j++) {
      const k = j / 46;
      const x0 = wx + 14 + k * 26, w2 = ww - k * 10;
      dith(c, x0, 122 + j, w2, 1, PAL.floor, PAL.floorDk, .18 - k * .10);
    }
    // 飘尘
    for (let i = 0; i < 10; i++) {
      const x = 130 + (i * 23) % 90, y = 40 + ((i * 17 + t * 6) % 80);
      PX(c, x, y, PAL.paper);
    }
    // ---- 加料：搬空之后留下的痕迹 ----
    // 家具压出来的地板印
    dith(c, 28, 130, 36, 18, PAL.floor, PAL.floorDk, .55);
    R(c, 28, 130, 36, 1, PAL.floorDk);
    dith(c, 212, 124, 28, 24, PAL.floor, PAL.floorDk, .55);
    R(c, 212, 124, 28, 1, PAL.floorDk);
    // 墙上的挂钩（空）
    for (let i = 0; i < 3; i++) { R(c, 248 + i * 9, 64, 1, 3, PAL.haze); PX(c, 248 + i * 9, 63, PAL.pale); }
    R(c, 246, 62, 26, 1, PAL.haze);
    // 地上的胶带卷
    R(c, 266, 144, 5, 5, PAL.pale); PX(c, 268, 146, PAL.night);
    // 门后的钥匙
    PX(c, 300, 150, PAL.gold); PX(c, 301, 151, PAL.gold); PX(c, 300, 152, PAL.haze);
  },
};


// ---------- 13 泳池（回忆里最亮的一天） ----------
SCENES.pool = {
  name: '泳池', gy: 158,
  draw(c, t) {
    // 傍晚的天空
    vgradS(c, 0, 0, 320, 78, '#4A2E52', '#E8915C');
    disc(c, 246, 26, 11, '#FFD9A0');
    dith(c, 0, 56, 320, 22, '#E8915C', '#F6C98A', .35);
    // 远处的楼与树
    for (let i = 0; i < 9; i++) R(c, i * 38, 52 - (i % 3) * 8, 26, 26 + (i % 3) * 8, '#3A2434');
    // 池岸瓷砖
    R(c, 0, 74, 320, 20, '#E8DCC8');
    for (let x = 0; x < 320; x += 16) R(c, x, 74, 1, 20, '#C9B79C');
    R(c, 0, 74, 320, 2, '#FFF3DE');
    R(c, 0, 92, 320, 2, '#9FD8E0');
    // 水面
    R(c, 0, 94, 320, 86, '#2E93AC');
    dith(c, 0, 94, 320, 16, '#2E93AC', '#57B9CC', .45);
    for (let i = 0; i < 90; i++) {
      const x = ((i * 53 + t * 14) % 340) - 10, y = 98 + (i * 31) % 76;
      R(c, x, y, 4 + (i % 5) * 4, 1, i % 3 ? '#7FD0DC' : '#CFF3F6');
    }
    // 泳道线
    for (let k = 0; k < 3; k++) {
      const y = 108 + k * 26;
      for (let x = 0; x < 320; x += 12) R(c, x, y, 7, 2, '#E85D6E');
      R(c, 0, y + 2, 320, 1, '#1F6E80');
    }
    // 扶梯
    R(c, 236, 70, 2, 40, '#D8D2C4'); R(c, 252, 70, 2, 40, '#D8D2C4');
    R(c, 236, 68, 18, 2, '#D8D2C4');
    for (let i = 0; i < 6; i++) R(c, 238, 74 + i * 6, 12, 2, '#EFE7D6');
    // 泳圈
    ring(c, 60, 118, 8, '#F2C14E'); ring(c, 60, 118, 6, '#F2C14E');
    ring(c, 196, 146, 9, '#E85D6E'); ring(c, 196, 146, 7, '#E85D6E');
    // ---- 池子里的人（这一版新增：不再冷清）----
    const swim = [[110, 122, 'm'], [282, 134, 'f'], [162, 156, 'm']];
    for (let i = 0; i < swim.length; i++) {
      const [x, y, sex] = swim[i];
      const bob = Math.round(Math.sin(t * 1.6 + i * 2) * 1.5);
      // 水下的身体
      R(c, x - 5, y + 4, 11, 10, '#1F6E80');
      // 头
      R(c, x - 4, y - 6 + bob, 9, 8, sex === 'f' ? '#FFC3A0' : '#E8A87C');
      R(c, x - 4, y - 8 + bob, 9, 3, '#241A18');
      R(c, x - 5, y - 5 + bob, 2, 5, '#241A18');
      // 划水的手
      const sw = Math.sin(t * 2.4 + i) * 3;
      R(c, x + 7, y + 1 + bob + sw, 5, 2, sex === 'f' ? '#FFC3A0' : '#E8A87C');
      R(c, x - 12, y + 1 + bob - sw, 5, 2, sex === 'f' ? '#FFC3A0' : '#E8A87C');
      // 水花
      if (i < 2) { PX(c, x + 9, y - 2 + bob, '#CFF3F6'); PX(c, x - 10, y - 1 + bob, '#CFF3F6'); }
    }
    // 池边坐着的人（脚泡在水里）
    figure(c, 40, 92, 1, { sex: 'f', pose: 'sit', eyes: 'happy', mouth: 'smile', col: { coat: '#F2C14E', inner: '#E85D6E' } });
    figure(c, 300, 92, 1, { sex: 'm', pose: 'sit', eyes: 'happy', mouth: 'smile', col: { coat: '#7FD0DC', inner: '#FFF3DE' } });
    // 遮阳伞
    for (let i = 0; i < 9; i++) R(c, 16 + i * 3, 34 + i, 30 - i * 3, 2, i % 2 ? '#E85D6E' : '#FFF3DE');
    R(c, 30, 42, 2, 34, '#C9B79C');
  },
};

// ---------- 渲染整帧 ----------
function drawScene(c, name, t, o = {}) {
  const s = SCENES[name];
  if (!s) return null;
  s.draw(c, t, o);
  return s;
}
const SCENE_LIST = Object.keys(SCENES);
