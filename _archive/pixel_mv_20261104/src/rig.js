// ============================================================
//  pixel rig — 人形像素角色骨架
//  设计原则：造型是数据（CHARS），表演是参数（eyes/mouth/pose/...）。
//  换主角只改 CHARS 里那几行颜色和发型名，不动骨架代码。
//
//  坐标系：脚底中心 = (0, 0)，向上为负。头 y -40..-29，脚 y 0。
//  角色净宽 15 px（含手臂），净高 40 px。
// ============================================================

// ---------- 16 色调色板：暖夜（琥珀/棕）为主，只留一点点冷青做呼吸 ----------
const PAL = {
  ink:    '#0E0809',   // 描边 / 最暗（暖黑）
  night:  '#1E1315',   // 暖夜深棕
  navy:   '#33211F',   // 暗褐（阴影面）
  slate:  '#7A4A3A',   // 锈棕（男外套）
  dusk:   '#8F5E44',   // 暮褐
  haze:   '#C0906A',   // 雾棕（中间调）
  pale:   '#F0D3AC',   // 暖米（女外套）
  paper:  '#FFF2DC',   // 暖白（内搭、高光）
  skin:   '#E8A87C',   // 肤色（男）
  skinDk: '#B27656',   // 肤色暗
  skinMid:'#E8A472',   // 下巴阴影中间调（特写不糊脸）
  rose:   '#E8556D',   // 玫瑰红（情绪重音）
  blush:  '#FF9E8E',   // 浅粉（腮红、唇）
  peach:  '#FFC3A0',   // 暖桃（女肤色）
  teal:   '#4FA0A8',   // 冷青（雨、霓虹）——全片唯一的冷色
  mint:   '#9AD6C4',   // 薄荷（雨丝、高光）
  gold:   '#FFC35C',   // 暖黄（灯）
  steel:  '#4E5866',   // 冷灰蓝（他的外套）——暖世界里的唯一冷人
  // 室内：暖夜里能看清的墙与地板（不是纯黑，物件才立得住）
  wall:   '#3D2821',   // 暖墙
  wallDk: '#2A1915',   // 墙面暗部
  floor:  '#4A2F24',   // 木地板
  floorDk:'#33201A',   // 地板缝/暗部
  seaDk:  '#283A3B',   // 海水（微冷，压住整片暖褐）
};

// ---------- 角色表：造型差异全在这里 ----------
const CHARS = {
  m: { hair: 'night', hairDk: 'ink', skin: 'skin', skinDk: 'skinDk',
       coat: 'steel', coatDk: 'ink', inner: 'paper', pants: 'navy', shoe: 'ink',
       hairStyle: 'short', bodyW: 0 },
  f: { hair: 'night', hairDk: 'ink', skin: 'peach', skinDk: 'skin',
       coat: 'pale', coatDk: 'haze', inner: 'rose', pants: 'navy', shoe: 'ink',
       hairStyle: 'long', bodyW: 0 },
};

// ---------- 眼型：3 宽 × 最多 3 高，画在 (ex, ey) 为眼中心 ----------
// 每个眼型是一组 [dx, dy, w, h, role]，role: 'ink'=瞳孔 / 'hi'=高光 / 'skin'=肤色盖掉
const EYES = {
  normal: [[-1, -1, 3, 2, 'ink'], [-1, 0, 1, 1, 'hi']],
  narrow: [[-1, -1, 3, 1, 'ink'], [0, 0, 1, 1, 'ink']],   // 半睁：上眼睑 + 一点瞳孔
  wide:   [[-1, -1, 3, 3, 'ink'], [-1, -1, 1, 1, 'hi'], [1, 1, 1, 1, 'hi']],
  dot:    [[0, 0, 1, 1, 'ink']],
  closed: [[-1, 0, 1, 1, 'ink'], [0, 1, 1, 1, 'ink'], [1, 0, 1, 1, 'ink']],
  happy:  [[-1, 0, 1, 1, 'ink'], [0, -1, 1, 1, 'ink'], [1, 0, 1, 1, 'ink']],
  xeye:   [[-1, -1, 1, 1, 'ink'], [1, -1, 1, 1, 'ink'], [0, 0, 1, 1, 'ink'], [-1, 1, 1, 1, 'ink'], [1, 1, 1, 1, 'ink']],
  teary:  [[-1, -1, 3, 2, 'ink'], [-1, 1, 3, 1, 'hi'], [0, -1, 1, 1, 'hi']],
  glare:  [[-1, -1, 3, 1, 'ink'], [0, 0, 1, 1, 'ink'], [1, -1, 1, 1, 'ink']],
  up:     [[-1, -1, 3, 2, 'ink'], [-1, 1, 3, 1, 'skin'], [0, -1, 1, 1, 'hi']],
  asleep: [[-1, 1, 3, 1, 'ink']],
  // 眼泪：闭合的下弯 + 两颗泪点（泪点由 tear 参数另外画）
  cry:    [[-1, 0, 1, 1, 'ink'], [0, 1, 1, 1, 'ink'], [1, 0, 1, 1, 'ink']],
};

// ---------- 嘴型：画在 (mx, my) ----------
const MOUTHS = {
  flat:   [[-1, 0, 3, 1, 'ink']],
  smile:  [[-2, 0, 1, 1, 'ink'], [-1, 1, 3, 1, 'ink'], [2, 0, 1, 1, 'ink']],
  frown:  [[-2, 1, 1, 1, 'ink'], [-1, 0, 3, 1, 'ink'], [2, 1, 1, 1, 'ink']],
  open:   [[-1, 0, 3, 2, 'ink'], [-1, 1, 1, 1, 'rose']],
  o:      [[-1, 0, 2, 2, 'ink']],
  grit:   [[-2, 0, 5, 2, 'ink'], [-2, 0, 5, 1, 'paper'], [-1, 0, 1, 2, 'ink'], [1, 0, 1, 2, 'ink']],
  tiny:   [[0, 0, 1, 1, 'ink']],
  wobble: [[-2, 0, 1, 1, 'ink'], [0, 1, 1, 1, 'ink'], [2, 0, 1, 1, 'ink']],
  side:   [[0, 0, 2, 1, 'ink']],
  none:   [],
};

// ---------- 情绪符号：位图字符串，'X' 为实心 ----------
const EMOTES = {
  sweat: ['..X..', '..XX.', '.XXX.', '.XXX.', '..X..'],
  anger: ['.X.X.', 'XXXXX', '.XXX.', 'XXXXX', '.X.X.'],
  dots:  ['.....', '.....', 'X.X.X'],
  heart: ['.X.X.', 'XXXXX', 'XXXXX', '.XXX.', '..X..'],
  zzz:   ['XXX..', '..X..', '.X...', 'XXX..'],
  note:  ['..XX.', '..X.X', '..X..', '.XX..', 'XXX..'],
  bolt:  ['..XX.', '.XX..', 'XXX..', '.XX..', 'XX...'],
  qmark: ['.XXX.', 'X...X', '...X.', '..X..'],
  spark: ['..X..', '..X..', 'XXXXX', '..X..', '..X..'],
  rain:  ['X.X.X', '.X.X.', 'X.X.X'],
};

// ---------- 绘制入口 ----------
// c: canvas ctx | cx, footY: 脚底中心（设备像素）| S: 整数放大倍数
function figure(c, cx, footY, S, o = {}) {
  const C = { ...CHARS[o.sex || 'm'], ...(o.col || {}) };
  const parts = [];
  const R = (x, y, w, h, role) => {
    if (!w || !h) return;
    parts.push([x, y, w, h, PAL[C[role]] || C[role] || role]);
  };

  const back = o.view === 'back';
  const pose = o.pose || 'stand';
  const walk = o.walk || 0;
  const lookX = o.lookX || 0, lookY = o.lookY || 0;
  let eyesType = o.eyes || 'normal';
  // 自动眨眼：张眼的人物每 ~4.3s（按角色错开）眨一下，静止画面也有呼吸感
  const OPEN_EYES = { normal: 1, narrow: 1, dot: 1, teary: 1, up: 1, wide: 1, glare: 1 };
  const _T = (typeof window !== 'undefined' && window.__T != null) ? window.__T : null;
  if (_T != null && OPEN_EYES[eyesType] && o.blink !== false) {
    const ph = (_T + (o.sex === 'f' ? 1.9 : 0)) % 4.3;
    if (ph < .13) eyesType = 'closed';
  }
  const mouthType = o.mouth || 'flat';
  const aL = o.aL ?? 0, aR = o.aR ?? 0;   // 0 = 自然下垂，1 = 平举，2 = 举高，-1 = 贴身

  // --- 姿态位移 ---
  let bodyDY = 0, legSwing = [0, 0], armDY = 0;
  let headExtraDY = 0;               // 头部额外下压（坐/蹲时头比身体降得更多）
  if (pose === 'walk') {
    const w = Math.sin(walk);
    legSwing = [Math.round(w * 1.6), -Math.round(w * 1.6)];
    armDY = Math.round(w * 1.4);
  } else if (pose === 'sit') {
    bodyDY = 10; headExtraDY = 6;   // 头降 16，身体降 10，坐姿明显矮
  } else if (pose === 'crouch') {
    bodyDY = 13; headExtraDY = 8;   // 蹲：整体压低 21，膝盖顶到胸口
  } else if (pose === 'bow') {
    bodyDY = 4;
  }
  const DY = bodyDY + (o.dy || 0);
  const lean = o.lean || 0;

  // ---------- 腿 ----------
  const legTop = -12 + DY, legBot = 0;
  const legH = legBot - legTop;
  if (pose === 'sit') {
    // 坐：屁股着地（-8），大腿水平前伸到脚尖，明显宽而矮的轮廓
    R(-5, -8, 12, 3, 'pants');              // 水平大腿（向左前伸，占宽）
    R(-6, -5, 13, 2, 'pants');              // 大腿下半段
    R(-8, -3, 4, 3, 'pants');               // 左小腿折回
    R(5, -3, 4, 3, 'pants');                // 右小腿
    R(-9, -2, 5, 2, 'shoe');                // 左鞋（明显前伸）
    R(5, -2, 5, 2, 'shoe');                 // 右鞋
    R(-5, -8, 3, 3, 'night');               // 大腿暗面
  } else if (pose === 'crouch') {
    // 蹲：膝盖并拢上提，身体团起，脚仍着地
    R(-5, -9, 4, 9, 'pants');               // 左腿折起
    R(2, -9, 4, 9, 'pants');                // 右腿
    R(-5, -1, 5, 2, 'shoe');
    R(2, -1, 5, 2, 'shoe');
    R(-5, -9, 2, 9, 'night');
    R(2, -9, 2, 9, 'night');
  } else {
    const lt = legH + legSwing[0], rt = legH + legSwing[1];
    R(-4, legTop - legSwing[0], 4, lt, 'pants');
    R(1, legTop - legSwing[1], 4, rt, 'pants');
    // 鞋
    R(-5, legBot - 3 - legSwing[0], 5, 3, 'shoe');
    R(1, legBot - 3 - legSwing[1], 5, 3, 'shoe');
    // 裤脚暗面
    R(-4, legTop - legSwing[0] + 6, 4, 2, 'night');
    R(1, legTop - legSwing[1] + 6, 4, 2, 'night');
  }

  // ---------- 身体 ----------
  const coatTop = -26 + DY, coatBot = -12 + DY;
  // 手臂（后层：贴身时画在身后）
  const armLen = 12;
  const drawArm = (side) => {
    const a = side < 0 ? aL : aR;
    const ang = a;  // 0 下垂 / 1 平举 / 2 举高
    // 用整数阶梯近似手臂角度，像素风不做旋转
    const px0 = side < 0 ? -7 : 6;
    if (ang <= .25) {              // 下垂
      R(px0, coatTop + 2, 2, armLen, 'coatDk');
      R(px0, coatTop + 2 + armLen - 2, 2, 2, 'skinDk');   // 手
    } else if (ang <= .8) {        // 斜下
      R(px0, coatTop + 2, 2, 7, 'coatDk');
      R(px0 + side, coatTop + 9, 2, 3, 'coatDk');
      R(px0 + side, coatTop + 11, 2, 2, 'skinDk');
    } else if (ang <= 1.4) {       // 平举
      R(px0, coatTop + 2, 3, 2, 'coatDk');
      R(px0 + side * 2, coatTop + 2, 2, 2, 'coatDk');
      R(px0 + side * 3, coatTop + 2, 2, 2, 'skinDk');
    } else {                       // 举高
      R(px0, coatTop + 2, 2, 4, 'coatDk');
      R(px0, coatTop - 3, 2, 5, 'coatDk');
      R(px0, coatTop - 5, 2, 2, 'skinDk');
    }
  };
  // 后层手臂先画（只画贴身那种，避免重复）
  drawArm(-1); drawArm(1);

  // 躯干
  R(-5, coatTop, 11, 3, 'coat');          // 肩
  R(-4, coatTop + 3, 9, coatBot - coatTop - 3, 'coat');
  R(-5, coatBot - 3, 11, 3, 'coat');      // 下摆
  // 外套暗面（右侧一竖条，给体积）
  R(3, coatTop + 3, 2, coatBot - coatTop - 6, 'coatDk');
  // 体态：壮实/中年发福（把外套往外撑 1px，剪影变圆）
  if (o.belly) {
    R(-6, coatTop + 5, 13, 7, 'coat');
    R(-6, coatBot - 6, 13, 6, 'coat');
    R(4, coatTop + 5, 2, 7, 'coatDk');
    R(4, coatBot - 6, 2, 6, 'coatDk');
    R(-6, coatTop + 2, 2, 3, 'coatDk');
  }
  if (back) {
    // 背面：只有外套，中间一条中缝，没有内搭和领口
    R(-1, coatTop + 2, 1, coatBot - coatTop - 4, 'coatDk');
    R(-5, coatTop, 11, 1, 'coatDk');      // 后领
  } else {
    // 内搭：领口 + 中间一竖
    R(-2, coatTop + 1, 5, 3, 'inner');
    R(-1, coatTop + 4, 3, 6, 'inner');
    // 领子
    R(-5, coatTop, 2, 2, 'coatDk');
    R(4, coatTop, 2, 2, 'coatDk');
  }

  // ---------- 脖子（背影不画，否则放大后像"方脑袋下面接了根柱子"）----------
  if (!back) R(-1, -29 + DY + headExtraDY, 3, 4, 'skinDk');

  // ---------- 头 ----------
  const hy = -40 + DY + headExtraDY;
  R(-5, hy + 1, 11, 11, 'skin');
  R(-4, hy, 9, 1, 'skin');            // 顶部圆角
  R(-5, hy + 9, 11, 1, 'skinMid');    // 下巴阴影（中间调）

  // 头发
  if (C.hairStyle === 'bald') {
    // 秃顶：顶上只剩两撮鬓发，后脑留一圈
    R(-5, hy + 4, 1, 3, 'hair');
    R(5, hy + 4, 1, 3, 'hair');
    R(-4, hy + 3, 9, 1, 'hairDk');
  } else if (C.hairStyle === 'bun') {
    // 盘发：头顶一个圆髻
    R(-5, hy, 11, 3, 'hair');
    R(-5, hy + 3, 2, 2, 'hair');
    R(4, hy + 3, 2, 2, 'hair');
    R(-3, hy - 3, 7, 4, 'hair');
    R(-2, hy - 2, 3, 1, 'haze');
    R(-6, hy + 1, 1, 3, 'hair');
    R(5, hy + 1, 1, 3, 'hair');
  } else if (C.hairStyle === 'bob') {
    // 齐耳短发：两侧包到下巴
    R(-6, hy, 13, 4, 'hair');
    R(-6, hy + 4, 2, 6, 'hair');
    R(5, hy + 4, 2, 6, 'hair');
    R(-4, hy, 4, 1, 'haze');
    R(-6, hy + 9, 2, 1, 'hairDk');
    R(5, hy + 9, 2, 1, 'hairDk');
  } else if (C.hairStyle === 'braid') {
    // 单侧麻花辫
    R(-5, hy, 11, 3, 'hair');
    R(-5, hy + 3, 2, 2, 'hair');
    R(4, hy + 3, 2, 2, 'hair');
    R(5, hy + 4, 2, 6, 'hair');
    R(5, hy + 10, 2, 3, 'hairDk');
    R(6, hy + 13, 2, 3, 'hair');
    R(-4, hy, 3, 1, 'haze');
  } else if (C.hairStyle === 'short') {
    R(-5, hy, 11, 3, 'hair');
    R(-5, hy + 3, 2, 2, 'hair');      // 左鬓
    R(4, hy + 3, 2, 2, 'hair');       // 右鬓
    R(-2, hy + 3, 4, 1, 'hair');      // 中间一撮刘海
  } else {
    R(-5, hy, 11, 3, 'hair');
    R(-5, hy + 3, 2, 2, 'hair');
    R(4, hy + 3, 2, 2, 'hair');
    // 长发：两侧垂到肩
    R(-6, hy + 2, 2, 16, 'hair');
    R(5, hy + 2, 2, 16, 'hair');
    R(-6, hy + 16, 2, 3, 'hairDk');
    R(5, hy + 16, 2, 3, 'hairDk');
    // 发丝高光
    R(-4, hy, 3, 1, 'haze');
  }

  if (back) {
    // 背影：后脑勺做成圆轮廓 + 发丝，避免放大后变成一个死黑方块
    R(-5, hy, 11, 1, 'hair');
    R(-6, hy + 1, 13, 1, 'hair');
    R(-6, hy + 2, 13, 9, 'hair');
    R(-5, hy + 11, 11, 1, 'hair');
    R(-4, hy + 12, 9, 1, 'hairDk');
    // 发丝走向：只在左上角给两点高光，别画成"竖条栅栏"
    R(-4, hy + 2, 2, 1, 'haze');
    R(-5, hy + 5, 1, 2, 'haze');
    if (C.hairStyle === 'long') {
      R(-7, hy + 2, 2, 18, 'hair'); R(6, hy + 2, 2, 18, 'hair');
      R(-7, hy + 18, 2, 2, 'hairDk'); R(6, hy + 18, 2, 2, 'hairDk');
      R(-7, hy + 4, 1, 8, 'hairDk'); R(6, hy + 4, 1, 8, 'hairDk');
    }
  } else {
    // ---------- 五官 ----------
    const eyeY = hy + 7 + Math.round(lookY * 1);
    const exL = -3 + Math.round(lookX), exR = 3 + Math.round(lookX);
    const skinCol = PAL[C.skin];
    const paintEye = (ex) => {
      for (const [dx, dy, w, h, role] of (EYES[eyesType] || EYES.normal)) {
        const col = role === 'ink' ? PAL.ink : role === 'hi' ? PAL.paper : skinCol;
        parts.push([ex + dx, eyeY + dy, w, h, col]);
      }
    };
    paintEye(exL); paintEye(exR);

    // 腮红
    if (o.blush > 0) {
      const a = o.blush;
      parts.push([-5, eyeY + 2, 2, 1, a > .6 ? PAL.blush : PAL.skinDk]);
      parts.push([4, eyeY + 2, 2, 1, a > .6 ? PAL.blush : PAL.skinDk]);
    }
    // 泪
    if (o.tear > 0) {
      const tl = Math.round(o.tear * 3);
      R(exL, eyeY + 2, 1, 1 + tl, 'mint');
      if (o.tear > .5) R(exR, eyeY + 2, 1, tl, 'mint');
    }
    // 嘴
    const my = hy + 10;
    for (const [dx, dy, w, h, role] of (MOUTHS[mouthType] || MOUTHS.flat)) {
      const col = role === 'ink' ? PAL.ink : role === 'rose' ? PAL.rose : PAL.paper;
      parts.push([dx, my + dy, w, h, col]);
    }
  }

  // ---------- 头饰 / 面部配件（最上层，先描边前叠好） ----------
  if (!back && o.hat) {
    const hc = o.hatCol || '#2A2A30', hcD = o.hatColDk || '#141419';
    if (o.hat === 'brim') {           // 宽檐帽：帽檐比头宽 4px，剪影一眼不同
      R(-4, hy - 2, 9, 3, hc);
      R(-3, hy - 4, 7, 2, hc);
      R(-7, hy + 1, 15, 2, hcD);
      R(-4, hy - 2, 3, 1, 'haze');
    } else if (o.hat === 'newsboy') {  // 报童帽/邮差帽：圆顶 + 短前檐
      R(-5, hy - 1, 11, 3, hc);
      R(-4, hy - 3, 9, 2, hc);
      R(-7, hy + 2, 6, 1, hcD);
      R(-4, hy - 3, 3, 1, 'haze');
    } else if (o.hat === 'uniform') {  // 制服大盖帽：平顶 + 金带 + 帽檐
      R(-5, hy - 3, 11, 3, hc);
      R(-4, hy - 4, 9, 1, hc);
      R(-5, hy, 11, 1, PAL.gold);
      R(-6, hy + 1, 13, 2, hcD);
    } else if (o.hat === 'straw') {    // 草帽：宽檐 + 缎带
      R(-4, hy - 1, 9, 3, '#C8A868');
      R(-3, hy - 3, 7, 2, '#D8B878');
      R(-8, hy + 2, 17, 2, '#B08A4E');
      R(-8, hy + 4, 17, 1, '#8A6A32');
      R(-4, hy, 9, 1, PAL.rose);
    } else if (o.hat === 'knit') {     // 针织帽/厨帽：贴头 + 翻边
      R(-5, hy - 2, 11, 4, hc);
      R(-5, hy + 2, 11, 1, hcD);
      R(-5, hy - 2, 2, 4, hcD);
      R(4, hy - 2, 1, 4, hcD);
    }
  }
  if (!back && o.beard) {
    const bc = o.beardCol || '#B9B4A6';
    if (o.beard === 1) {              // 胡茬
      R(-4, hy + 10, 9, 2, bc);
      R(-5, hy + 8, 1, 2, bc);
      R(4, hy + 8, 1, 2, bc);
    } else {                          // 大胡子：包围下巴和嘴
      R(-5, hy + 8, 11, 2, bc);
      R(-4, hy + 10, 9, 3, bc);
      R(-3, hy + 13, 7, 1, bc);
      R(-2, hy + 10, 5, 1, PAL.skinDk);
    }
  }
  if (!back && o.glasses) {
    const gc = o.glassesCol || PAL.gold;
    const eyY = hy + 7 + Math.round(lookY * 1);   // 与五官同一条眼高基准
    R(-6, eyY - 2, 4, 1, gc);
    R(3, eyY - 2, 4, 1, gc);
    R(-6, eyY + 1, 4, 1, gc);
    R(3, eyY + 1, 4, 1, gc);
    R(-6, eyY - 2, 1, 4, gc);
    R(6, eyY - 2, 1, 4, gc);
    R(-2, eyY - 1, 5, 1, gc);
  }
  if (!back && o.scarf) {
    R(-5, coatTop - 2, 11, 3, o.scarf);
    R(-6, coatTop + 1, 3, 9, o.scarf);
    R(-6, coatTop + 8, 3, 2, o.scarfDk || o.scarf);
  }

  // ---------- 描边：整体剪影外扩 1px ----------
  c.save();
  c.translate(Math.round(cx), Math.round(footY));
  c.scale(S, S);
  const inkCol = o.outline === false ? null : (typeof o.outline === 'string' ? o.outline : PAL.ink);
  if (inkCol) {
    c.fillStyle = inkCol;
    for (const [x, y, w, h] of parts) {
      // 关键：1-2px 的细节（眼、嘴、高光）不描边，否则会被墨线糊成黑块，表情全丢
      if (w * h <= 2) continue;
      c.fillRect(x - 1, y - 1, w + 2, h + 2);
    }
  }
  // 本体
  for (const [x, y, w, h, col] of parts) {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  }

  // ---------- 轮廓光：右上 1px 暖高光 ----------
  // 没有这 2-3 个像素，人物在暖褐背景里会糊成一块剪影（尤其背影）
  if (o.rim !== false) {
    c.fillStyle = PAL.haze;
    c.fillRect(4, hy + 1, 2, 1);
    c.fillRect(5, hy + 2, 1, 1);
    c.fillRect(4, hy + 8, 1, 1);
    c.fillStyle = PAL.dusk;
    c.fillRect(4, coatTop + 1, 1, 2);
    c.fillRect(5, coatTop + 2, 1, 1);
    c.fillRect(4, coatBot - 2, 1, 1);
  }

  // ---------- 情绪符号 ----------
  if (o.emote) {
    const bm = EMOTES[o.emote] || EMOTES.dots;
    const ex = 8, ey = hy - 9 - (o.emoteUp || 0);
    const k = o.emoteK ?? 1;
    c.fillStyle = o.emoteCol || PAL.gold;
    const bh = bm.length, bw = Math.max(...bm.map(r => r.length));
    const off = Math.round((1 - k) * 2);   // 出现时从上方落下
    for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) {
      if (bm[j][i] === 'X') c.fillRect(ex + i, ey + j + off, 1, 1);
    }
  }
  c.restore();
  return { w: 15, h: 40 };// 名义净尺寸
}
