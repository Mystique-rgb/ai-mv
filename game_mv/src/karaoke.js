// karaoke.js: 字幕层（华文行楷 / STXingkai）。画在合成器上，逐字盖章，时间取 _words2.json 的逐字强制对齐。
// 平涂风格的规矩：白字 + 8px 墨描边 + 8px 硬投影（跟全片投影同一方向），不加柔光、不加渐变。
const KFONT = '"PiaoyiKai", "STXingkai", "STKaiti", "KaiTi", serif';
// [行起, 行止, 文本, [[逐字起,逐字止]...], 关键词, 关键词色]
const LY = [
  [0.22,3.33,"我睁开双眼 想你在身边",[[0.22,1.06],[1.06,1.26],[1.26,1.44],[1.44,1.68],[1.68,2.0],[2.74,2.74],[2.0,2.74],[2.74,2.88],[2.88,3.02],[3.02,3.38],[3.38,3.72]],["双眼", "身边"],"pink"],
  [3.98,6.74,"无所谓永远还是瞬间",[[3.98,4.06],[4.06,4.3],[4.3,4.52],[4.52,4.74],[4.74,5.1],[5.1,5.33],[5.33,5.56],[5.56,6.26],[6.26,6.9]],["永远", "瞬间"],"pink"],
  [7.36,10.18,"静闭上了眼 你却又浮现",[[7.36,7.52],[7.52,7.72],[7.72,7.94],[7.94,8.14],[8.14,8.5],[9.2,9.2],[8.5,9.2],[9.2,9.46],[9.46,9.66],[9.66,9.82],[9.82,10.3]],["闭上", "浮现"],"orange"],
  [10.83,13.36,"带我远离寂寞的边缘",[[10.83,10.97],[10.97,11.15],[11.15,11.35],[11.35,11.63],[11.63,11.91],[11.91,12.33],[12.33,12.71],[12.71,13.07],[13.07,13.39]],["寂寞", "边缘"],"orange"],
  [14.00,17.09,"忘了是非 没有伤悲",[[14.0,14.6],[14.6,14.84],[14.84,15.12],[15.12,15.5],[16.3,16.3],[16.14,16.3],[16.3,16.46],[16.46,16.86],[16.86,17.52]],["是非", "伤悲"],"pink"],
  [17.67,18.89,"无怨无悔",[[17.67,17.85],[17.85,18.13],[18.13,18.43],[18.43,19.13]],["无悔"],"orange"],
  [19.26,24.03,"忘了是非 没有伤悲",[[19.26,19.7],[19.7,21.58],[21.58,21.88],[21.88,22.24],[22.74,22.74],[22.24,22.74],[22.74,23.24],[23.24,23.62],[23.62,24.48]],["是非", "伤悲"],"pink"],
  [24.41,25.49,"无怨无悔",[[24.41,24.71],[24.71,24.93],[24.93,25.31],[25.31,25.57]],["无悔"],"orange"],
  [27.67,30.68,"我拥抱着爱 当从梦中醒来",[[27.67,28.21],[28.21,28.41],[28.41,28.65],[28.65,28.87],[28.87,29.17],[29.43,29.43],[29.17,29.43],[29.43,29.73],[29.73,30.19],[30.19,30.45],[30.45,30.69],[30.69,30.81]],["拥抱", "醒来"],"pink"],
  [30.73,34.40,"你执着地等待 却不曾离开",[[30.73,30.83],[30.83,30.99],[30.99,31.79],[31.79,32.01],[32.01,32.49],[32.49,32.89],[33.43,33.43],[32.89,33.43],[33.43,33.63],[33.63,33.83],[33.83,34.25],[34.25,34.53]],["等待", "离开"],"orange"],
  [34.65,37.72,"舍不得分开 在每一次醒来",[[34.65,34.75],[34.75,35.05],[35.05,35.23],[35.23,35.45],[35.45,35.67],[35.87,35.87],[35.67,35.87],[35.87,36.11],[36.11,36.26],[36.26,36.41],[36.41,37.37],[37.37,37.77]],["分开", "醒来"],"pink"],
  [37.93,39.45,"不用再徘徊",[[37.93,38.35],[38.35,38.51],[38.51,38.75],[38.75,39.31],[39.31,39.61]],["徘徊"],"orange"],
  [39.61,42.22,"你就是我最美的期待",[[39.61,40.03],[40.03,40.24],[40.24,40.45],[40.45,40.75],[40.75,40.95],[40.95,41.19],[41.19,41.79],[41.79,42.07],[42.07,42.39]],["最美", "期待"],"pink"],
];
window.EXTRA_FONTS = [[`120px ${KFONT}`, LY.map(l => l[2]).join("")]];

const SB_Y = 984, SB_MAXW = 1560, SB_SIZE = 108;

function kLayout(c, txt) {
  let size = SB_SIZE, sp = 8;
  const chars = [...txt];
  c.font = `${size}px ${KFONT}`;
  const wid = chars.map(ch => (ch === " " ? size * .32 : c.measureText(ch).width));
  let w = wid.reduce((s, v) => s + v, 0) + sp * (chars.length - 1);
  if (w > SB_MAXW) { const k = SB_MAXW / w; size = Math.floor(size * k); sp *= k; c.font = `${size}px ${KFONT}`; return kLayout2(c, chars, size, sp * k); }
  const xs = []; let acc = 0;
  for (let i = 0; i < chars.length; i++) { xs.push(acc + wid[i] / 2); acc += wid[i] + sp; }
  return { chars, size, xs, w, wid, sp };
}
function kLayout2(c, chars, size, sp) {
  const wid = chars.map(ch => (ch === " " ? size * .32 : c.measureText(ch).width));
  const xs = []; let acc = 0;
  for (let i = 0; i < chars.length; i++) { xs.push(acc + wid[i] / 2); acc += wid[i] + sp; }
  return { chars, size, xs, w: acc - sp, wid, sp };
}

function kLine(c, L, t) {
  const [a, b, txt, tt, kw, kcol] = L;
  const { chars, size, xs, w } = kLayout(c, txt);
  const x0 = 960 - w / 2;
  const mask = new Array(chars.length).fill(false);
  for (const k of kw) {
    let i = txt.indexOf(k);
    while (i >= 0) { for (let j = 0; j < k.length; j++) mask[i + j] = true; i = txt.indexOf(k, i + 1); }
  }
  const exit = seg(t, b - .1, b);
  c.save();
  c.textAlign = "center"; c.textBaseline = "alphabetic";
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]; if (ch === " ") continue;
    const t0 = Math.min(tt[i][0], b - .06), local = t - t0;
    if (local < 0) continue;
    const isKw = mask[i];
    const fs = size * (isKw ? 1.13 : 1);
    const pop = backOut(clamp(local / .12));
    const sc = lerp(1.26, 1, pop);
    let alpha = clamp(local / .05), dy = (1 - pop) * -16;
    if (exit > 0) { alpha *= 1 - ease(exit); dy += 18 * exit; }
    if (alpha <= .02) continue;
    const cx = x0 + xs[i], cy = SB_Y + dy;
    c.save(); c.translate(cx, cy); c.scale(sc, sc);
    c.font = `${fs}px ${KFONT}`;
    c.lineJoin = "round"; c.miterLimit = 2;
    // 硬投影
    c.globalAlpha = alpha * .85; c.fillStyle = "#1A1418";
    c.fillText(ch, 9, 9);
    // 墨描边 + 字面
    c.globalAlpha = alpha; c.lineWidth = fs * .085; c.strokeStyle = "#1A1418";
    c.strokeText(ch, 0, 0);
    c.fillStyle = isKw ? (kcol === "pink" ? "#FF4FA3" : "#FF8A3D") : "#FFF6E8";
    c.fillText(ch, 0, 0);
    c.restore();
  }
  c.restore();
}

window.overlayHook = (c, t) => {
  for (const L of LY) if (t >= L[0] - .001 && t < L[1]) kLine(c, L, t);
};
