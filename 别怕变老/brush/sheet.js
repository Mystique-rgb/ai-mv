// sheet.js: 人物资产库模型表。行 = 视图/动作/情绪，列 = 角色预设。
// 出图：node render.mjs --page=characters.html --stills=0 --out=out/cast
window.EXTRA_FONTS = [['40px "PiaoyiKai"', 'Clawd人物资产库模型表视图动作情绪穿搭正背侧阿岩小粉阿蓝老周学霸陈阿姨小豆长发姐帽子哥墨镜酷开心走路恋爱困bouncehoproofswaywavestompshimmyidle惊讶生气哭酷炫同一个骨架同一个动画']];

const NAMES = Object.keys(CAST);
const TT = 1.31;   // 固定时刻：让 body() 的节拍动作停在一个好看的相位上

function label(txt, x, y, size = 26, col = '#3E3750') {
  letter(txt, x, y, size, col, { font: `${size}px "PiaoyiKai"` });
}

function drawWorld(t) {
  boilSeed('sheet'); noiseSeed(7);
  const u = 15, cols = NAMES.length, cell = 172, x0 = 100;
  paint(rectPts(-50, -50, W + 100, H + 100), { wash: '#F6F0E3', ink: null });

  // ── 标题 ──
  label('Clawd 人物资产库 · 模型表', W / 2, 64, 44, '#2B2233');
  label('同一个骨架 / 同一套动作表情 · 身份 = 发型 + 服装 + 面部', W / 2, 108, 24, '#7A7268');

  // 行分隔线
  for (const y of [240, 450, 660, 880]) inkLine([[60, y], [W - 60, y]], 1.2, 'rgba(62,55,80,.25)', 'inkfine', 0);

  // ── 行 1：正面立绘 ──
  label('正面', 52, 165, 22, '#8A8278');
  NAMES.forEach((n, i) => {
    const x = x0 + i * cell;
    person(n, x, 330, u, { ...feel('happy', TT) });
    label(n, x, 385, 26);
  });

  // ── 行 2：3/4 视图 ──
  label('3/4', 52, 375, 22, '#8A8278');
  NAMES.forEach((n, i) => {
    person(n, x0 + i * cell, 540, u, { view: 'q', ...feel('excited', TT) });
  });

  // ── 行 3：侧面走路 ──
  label('走路', 52, 585, 22, '#8A8278');
  NAMES.forEach((n, i) => {
    const m = move('walk', TT, i);
    person(n, x0 + i * cell, 750, u, { view: 'side', ...m });
  });

  // ── 行 4：情绪（用「小粉」演示 8 种）──
  label('情绪', 52, 795, 22, '#8A8278');
  const EMO8 = ['happy', 'sad', 'angry', 'cry', 'surprised', 'love', 'cool', 'sleepy'];
  EMO8.forEach((e, i) => {
    person('b', x0 + i * cell * (cols / EMO8.length) + cell * .4, 970, u + 2, { ...feel(e, TT) });
    label(e, x0 + i * cell * (cols / EMO8.length) + cell * .4, 1015, 22);
  });

  // ── 行 5：舞蹈动作（用「阿岩」演示 8 种）──
  label('动作', 52, 1015, 22, '#8A8278');
  const MV8 = ['bounce', 'hop', 'roof', 'sway', 'wave', 'stomp', 'shimmy', 'idle'];
  MV8.forEach((m, i) => {
    const x = x0 + i * cell * (cols / MV8.length) + cell * .4;
    person('a', x, 1235, u + 2, { ...move(m, TT, i) });
    label(m, x, 1285, 22);
  });

  // 角色名在行 2/3 也标一份（右移半格防重叠）
  NAMES.forEach((n, i) => { if (i % 2 === 0) label(n, x0 + i * cell, 610, 18, '#A89F92'); });
}
