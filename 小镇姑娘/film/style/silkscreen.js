// silkscreen.js —— 丝印旅行海报《小镇·一九九九》概念图
// 只画人物，背景全部在 frameHook 里用硬边色块重印
const SK = {
  paper: '#F1E6D0',
  sky1: '#F8D9AC', sky2: '#EE9A73', far: '#9A7FA8', mid: '#3E7079', dark: '#1E3B3F',
  accent: '#FBE6B4', cream: '#F7EEDC'
};
PAL.paper = SK.paper;

function drawWorld(t) {
  // 男主角：站台前景，抬头看车窗
  hero(520, 950, 48, { view: 'q', ...emotions(t, [[0, 'hopeful']]) });
  // 女主角：车窗里，手贴玻璃，泪满面
  heroine(1300, 648, 29, { view: 'front', ...emotions(t, [[0, 'cry']]), aL: 1.2, aR: 1.05 });
}

const RAW = !!window.RAW_MODE;
window.frameHook = (c, t) => {
  if (RAW) { c.drawImage(drawingContext.canvas, 0, 0, W, H); return; }
  const w = W, h = H;
  const id = KIT.pixels(drawingContext.canvas);
  const m = KIT.clean(KIT.mask(id, KIT.hexToRgb(SK.paper), 26), w, h);

  // ---------- 1. 纸 ----------
  c.fillStyle = SK.paper; c.fillRect(0, 0, w, h);

  // ---------- 2. 天：阶梯色带（禁渐变）----------
  KIT.poly(c, [[0, 0], [w, 0], [w, 190], [0, 190]], SK.sky1);
  KIT.poly(c, [[0, 190], [w, 190], [w, 250], [0, 250]], '#F7DDB4');
  KIT.poly(c, [[0, 250], [w, 250], [w, 330], [0, 330]], SK.sky2);
  // 横条云
  for (let i = 0; i < 4; i++) {
    const y = 96 + i * 30, x0 = 640 + i * 190, ww = 260 + i * 70;
    KIT.poly(c, [[x0, y], [x0 + ww, y], [x0 + ww, y + 10], [x0, y + 10]], i % 2 ? '#FBEBCD' : SK.sky1);
  }
  // 同心日轮（右上，被车体切掉一半）
  const sx = 1690, sy = 330;
  for (let r = 300; r > 24; r -= 40) {
    c.beginPath(); c.arc(sx, sy, r, 0, Math.PI * 2);
    c.fillStyle = r > 180 ? SK.sky2 : (r > 80 ? SK.accent : SK.cream); c.fill();
  }

  // ---------- 3. 远山 ----------
  c.beginPath(); c.moveTo(-20, 330);
  [[60, 300], [180, 330], [300, 262], [430, 330], [540, 296], [640, 330]].forEach(([x, y]) => c.lineTo(x, y));
  c.lineTo(660, 330); c.closePath(); c.fillStyle = SK.far; c.fill();
  KIT.poly(c, [[296, 266], [306, 266], [306, 206], [296, 206]], SK.far);
  KIT.poly(c, [[534, 300], [542, 300], [542, 244], [534, 244]], SK.far);

  // ---------- 4. 站台地面 ----------
  KIT.poly(c, [[0, 760], [w, 760], [w, 960], [0, 960]], '#C9B79C');
  KIT.poly(c, [[0, 892], [w, 892], [w, 914], [0, 914]], SK.accent);   // 黄色安全线

  // ---------- 5. 绿皮车体 ----------
  KIT.poly(c, [[700, 300], [w, 300], [w, 760], [700, 760]], SK.mid);
  KIT.poly(c, [[700, 300], [w, 300], [w, 336], [700, 336]], SK.dark);     // 车顶
  KIT.poly(c, [[700, 712], [w, 712], [w, 760], [700, 760]], SK.dark);     // 裙板
  KIT.poly(c, [[700, 676], [w, 676], [w, 690], [700, 690]], SK.cream);    // 腰线
  // 车厢接缝
  KIT.poly(c, [[1618, 300], [1630, 300], [1630, 760], [1618, 760]], SK.dark);

  // ---------- 6. 车窗（第二扇里是她）----------
  KIT.poly(c, [[820, 372], [1010, 372], [1010, 662], [820, 662]], '#E2CFAB');
  KIT.poly(c, [[1140, 372], [1460, 372], [1460, 662], [1140, 662]], '#E2CFAB');
  // 玻璃斜光
  KIT.poly(c, [[1152, 384], [1268, 384], [1178, 650], [1152, 650]], '#FFF8E6');

  // ---------- 7. 人物：纸白挖空 + 分版重印 ----------
  const rules = [
    { l: [0, .42], col: SK.dark, off: [-1.6, -1.3] },               // 头发 / 深裤 / 鞋
    { s: [0, .12], l: [.78, 1], col: SK.paper, off: [1.4, 1] },      // 白鞋白边 → 纸
    { h: [318, 360], col: SK.sky2, off: [2.4, 1.6] },                // 她的粉衣 → 全片唯一暖色
    { h: [0, 18], col: SK.sky2, off: [2.4, 1.6] },
    { h: [20, 58], col: SK.paper, off: [1.6, .9] },                  // 皮肤 → 挖成纸
    { h: [59, 200], col: SK.mid, off: [-1.9, -1.3] },                // 他的卫衣
    { col: SK.mid, off: [0, 0] }
  ];
  const people = KIT.separate(id, m, rules);
  c.drawImage(KIT.outline(m, w, h, 4, SK.paper), 0, 0);   // 纸白留缝（套版挖空）
  c.drawImage(people, 0, 0);

  // 站台投影（实色块，不用渐变）
  c.save(); c.globalAlpha = .55;
  KIT.poly(c, [[400, 946], [660, 946], [600, 972], [440, 972]], '#6B5942');
  c.restore();

  // ---------- 8. 前景：窗框压住她的腿 ----------
  KIT.poly(c, [[1140, 636], [1460, 636], [1460, 662], [1140, 662]], SK.dark);
  KIT.poly(c, [[1152, 372], [1166, 372], [1166, 662], [1152, 662]], SK.dark);
  KIT.poly(c, [[1434, 372], [1448, 372], [1448, 662], [1434, 662]], SK.dark);

  // ---------- 9. 版面文字 ----------
  KIT.text(c, '小镇 · 一九九九', 72, 126, 74, SK.dark, { track: 6, weight: 800, family: '"Microsoft YaHei","PingFang SC",sans-serif' });
  KIT.poly(c, [[76, 148], [582, 148], [582, 154], [76, 154]], SK.dark);
  KIT.text(c, 'SHAN ZHEN  /  ONE WAY TICKET', 78, 194, 25, SK.dark, { track: 5, weight: 600, family: '"Arial Narrow",Arial,sans-serif' });

  // 信息带
  KIT.poly(c, [[0, 960], [w, 960], [w, h], [0, h]], SK.dark);
  KIT.text(c, '小镇姑娘', 72, 1052, 50, SK.cream, { track: 3, weight: 800, family: '"Microsoft YaHei","PingFang SC",sans-serif' });
  KIT.text(c, '车头依然吐着烟 · 一百二十公里', 74, 998, 22, SK.accent, { track: 2, weight: 500, family: '"Microsoft YaHei",sans-serif' });
  KIT.poly(c, [[70, 1014], [w - 70, 1014], [w - 70, 1017], [70, 1017]], '#54706C');
  KIT.text(c, '01', w - 78, 1044, 54, SK.accent, { align: 'right', family: '"Impact","Arial Black",sans-serif' });
  KIT.text(c, '1999 · 07 · 站台', w - 78, 992, 20, '#8FA9A4', { align: 'right', track: 3, weight: 600, family: '"Arial Narrow",Arial,sans-serif' });

  // ---------- 10. 印刷质感 ----------
  c.save(); c.strokeStyle = 'rgba(30,59,63,.5)'; c.lineWidth = 2;
  const rx = w - 108, ry = 62, rr = 20;
  c.beginPath(); c.moveTo(rx - rr, ry); c.lineTo(rx + rr, ry); c.moveTo(rx, ry - rr); c.lineTo(rx, ry + rr); c.stroke();
  c.beginPath(); c.arc(rx, ry, rr * .6, 0, Math.PI * 2); c.stroke();
  c.restore();

  KIT.fibres(c, w, h, 'rgba(255,248,232,.28)', 180, 5);
  KIT.grain(c, w, h, .10, 11);
  KIT.vignette(c, w, h, 'rgba(60,36,20,.30)', .58);
};
