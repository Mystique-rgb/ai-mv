// plate.js — 三通道版面：R=蓝版 G=粉版 B=黄版，alpha 恒为 1，浓度写进通道值
// 叠印 = 两个通道同时有墨（shader 里两版相乘 → 紫/绿/橙）
// 敲白 = destination-out（没有墨 = 纸）
const PW = 1920, PH = 1080;

function makePlateCanvas(w = PW, h = PH) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// d = 0..1 浓度
function ink(g, name, d = 1) {
  g.globalCompositeOperation = 'lighter';
  let r = 0, gg = 0, b = 0;
  if (name === 'blue') r = 255 * d;
  else if (name === 'pink') gg = 255 * d;
  else if (name === 'yellow') b = 255 * d;
  else { r = gg = b = 255 * d; }        // dark = 三版全叠
  const s = `rgb(${r | 0},${gg | 0},${b | 0})`;
  g.fillStyle = s; g.strokeStyle = s;
  return s;
}
// 敲白（挖掉墨，露出纸）
function cut(g, a = 1) {
  g.globalCompositeOperation = 'destination-out';
  const s = `rgba(0,0,0,${a})`;
  g.fillStyle = s; g.strokeStyle = s;
  return s;
}
// 普通绘制（用于清底 / 遮罩以外的场合）
function src(g) { g.globalCompositeOperation = 'source-over'; }

function clearPlate(g) {
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, PW, PH);
}

// 网点：在版面里画一个"点阵块"，用真网点而不是 shader 网点（用于大面积的粗网点，可选）
// alpha 走通道浓度，shader 会二次挂网 —— 所以这里只画实心块，密度靠浓度
function band(g, name, d, x, y, w, h) { ink(g, name, d); g.fillRect(x, y, w, h); }

// 人物贴版：先按 8 向位移擦出纸白晕圈，再把本人加回去
function stampChar(P, tmp, x, y, halo = 5) {
  const g = P.g;
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU;
    g.drawImage(tmp, x + Math.cos(a) * halo, y + Math.sin(a) * halo);
  }
  g.drawImage(tmp, x, y);
  g.globalCompositeOperation = 'lighter';
  g.drawImage(tmp, x, y);
}
