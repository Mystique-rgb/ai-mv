// subs.js — 字幕：一张深红纸横幅（燕尾 + 锯齿边），奶油色华文行楷，12fps 分两步贴上去
import { PAL, canvas, piece, fill, trace, Pl, finishPaper, paperShadow, noShadow } from '../engine/paper.js';
import { rosette } from '../engine/motifs.js';

export const CUES = [
  [22.30, 26.27, '会在何处见到你'], [27.82, 31.79, '莫非前尘已注定'], [31.90, 36.97, '飞过时空的距离'],
  [37.12, 42.04, '却囿于刀剑光影'], [42.10, 46.14, '三月春花渐次醒'], [46.74, 51.79, '迢迢年华谁老去'],
  [51.94, 56.99, '是劫是缘随我心'], [57.05, 60.81, '除了你万敌不侵'], [61.90, 64.84, '当恩怨各一半'],
  [64.90, 67.38, '我怎么圈揽'], [67.44, 69.78, '看灯笼血红染'], [69.84, 72.26, '寻仇已太晚'],
  [72.32, 76.10, '月下门童喟叹'], [76.16, 81.67, '昨夜太平长安'], [82.10, 84.40, '当天上星河转'],
  [84.46, 87.42, '我命已定盘'], [87.48, 89.48, '待绝笔墨痕干'], [89.54, 91.94, '宿敌已来犯'],
  [92.00, 95.37, '我借你的孤单'], [96.05, 101.81, '今生恐怕难还'], [123.50, 128.64, '缠绕孤岛的雪雨'],
  [128.70, 133.34, '飘飘洒洒谁来停'], [133.40, 138.14, '摘取一颗海上星'], [138.20, 142.40, '陪我终夜不孤寂'],
  [143.20, 147.66, '灵柩长埋深谷底'], [148.50, 152.48, '没有永远的秘密'], [153.20, 157.32, '染指江湖结悲局'],
  [158.12, 163.11, '无人逃得过宿命'], [163.50, 166.16, '当恩怨各一半'], [166.22, 168.78, '我怎么圈揽'],
  [168.84, 171.16, '看灯笼血红染'], [171.22, 173.70, '寻仇已太晚'], [173.76, 177.54, '月下门童喟叹'],
  [177.60, 183.44, '昨夜太平长安'], [183.50, 186.06, '当天上星河转'], [186.12, 188.60, '我命已定盘'],
  [188.66, 191.02, '待绝笔墨痕干'], [191.08, 193.50, '宿敌已来犯'], [193.56, 197.44, '我借你的孤单'],
  [197.50, 203.27, '今生恐怕难还'], [205.10, 208.30, '当恩怨各一半'], [208.36, 210.86, '我怎么圈揽'],
  [210.92, 213.34, '看灯笼血红染'], [213.40, 215.80, '寻仇已太晚'], [215.86, 219.80, '月下门童喟叹'],
  [219.86, 224.12, '昨夜太平长安'], [224.60, 227.69, '当天上星河转'], [227.75, 230.68, '我命已定盘'],
  [230.74, 233.36, '待绝笔墨痕干'], [233.42, 235.52, '宿敌已来犯'], [235.58, 239.43, '我借你的孤单'],
  [239.82, 243.94, '今生恐怕难还']
];
// 字幕文件用的行（与音频逐句对齐，写 .srt 时用）
export const SRT_ROWS = CUES;

const STRIP = {};
function strip(text) {
  if (STRIP[text]) return STRIP[text];
  const K = 1.4, size = 62, pad = 96, h = 122;
  const probe = canvas(10, 10)[1]; probe.font = `${size}px "Xingkai"`;
  const tw = probe.measureText(text).width, w = Math.ceil(tw + pad * 2);
  const p = piece([0, 0, w, h], g => {
    // 燕尾 + 上下锯齿
    const poly = [];
    for (let x = 0; x <= w; x += 16) poly.push([x, 6 + ((x / 16) % 2) * 7]);
    poly.push([w - 34, h / 2]);
    for (let x = w; x >= 0; x -= 16) poly.push([x, h - 6 - ((x / 16) % 2) * 7]);
    poly.push([34, h / 2]);
    const body = Pl(poly, true, .4, 9);
    fill(g, q => trace(q, body), '#8f0f1b');
    // 内轮廓
    g.save(); g.beginPath(); trace(g, body); g.clip();
    g.globalCompositeOperation = 'destination-out'; g.strokeStyle = '#000'; g.lineWidth = 13; g.beginPath(); trace(g, body); g.stroke();
    g.globalCompositeOperation = 'source-over'; g.strokeStyle = '#8f0f1b'; g.lineWidth = 7; g.beginPath(); trace(g, body); g.stroke();
    g.restore();
    // 两端团花
    rosette(g, 52, h / 2, 24, 6, 0, .26); rosette(g, w - 52, h / 2, 24, 6, 0, .26);
    // 字
    g.font = `${size}px "Xingkai"`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#fff1d6'; g.fillText(text, w / 2, h / 2 + 4);
  }, { ss: 1.4, seed: 5, edge: 1.2 });
  return (STRIP[text] = { p, w, h });
}

export function drawSubs(g, t) {
  for (const [t0, t1, text] of CUES) {
    if (t < t0 || t > t1) continue;
    const s = strip(text), u = (t - t0);
    const step = Math.floor(u * 12) / 12;
    const drop = step < .09 ? -22 : step < .18 ? -8 : 0;
    const y = 1080 - 96 - s.h + drop;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    paperShadow(g, 1, 1.2); g.drawImage(s.p.c, 960 - s.w / 2, y, s.w, s.h); noShadow(g);
    g.restore();
  }
}
