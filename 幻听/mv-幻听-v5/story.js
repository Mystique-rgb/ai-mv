// 音乐事实与结构（唯一卡点依据：鼓点实测.json / 11月7日-字幕音频对照.json）
export const DUR = 30.642;
export const T0 = 0.04;        // 拍网格起点
export const BEAT = 0.4699;    // 127.7 BPM
export const BAR = BEAT * 4;
export const FPS = 24;

export const beatT = k => T0 + BEAT * k;
export const kAt = t => (t - T0) / BEAT;
export const isBar = k => k >= 0 && k % 4 === 0;

// 拍击 punch：每拍开头一次衰减，幅度由调用方给
export function punch(t, amt = .03) {
  const ph = ((t - T0) % BEAT + BEAT) % BEAT;
  return amt * Math.exp(-ph * 9.5);
}
// 某一拍之后的窗口 0..1
export function hit(k, t, w = .14) { const d = t - beatT(k); return d >= 0 && d < w ? 1 - d / w : 0; }
// 小节内的位置 0..1
export function inBar(t) { return (((t - T0) % BAR) + BAR) % BAR / BAR; }
// 全片 16 小节头
export const BARHEADS = Array.from({ length: 17 }, (_, b) => beatT(b * 4));

// —— 字幕（华文楷体；整句上屏，硬上硬下；L3 向前借 0.12 s） ——
export const LYRIC = [
  { id: 'L1', a: 0.70, b: 4.60, text: '如今一个人听歌 总是会觉得失落' },
  { id: 'L2', a: 5.36, b: 8.35, text: '幻听你在我的耳边 轻轻诉说' },
  { id: 'L3', a: 8.80, b: 10.92, text: '夜色多温柔' },
  { id: 'L4', a: 11.12, b: 12.92, text: '你有多爱我' },
  { id: 'L5', a: 15.68, b: 19.58, text: '如今一个人听歌 总是会觉得难过' },
  { id: 'L6', a: 20.34, b: 23.45, text: '爱已不在这里 我却还没走脱' },
  { id: 'L7', a: 23.92, b: 26.85, text: '列表里的歌 随过往流动' },
];
export function lyricAt(t) { return LYRIC.find(s => t >= s.a && t < s.b) || null; }

// —— 分场 ——
export const SHOTS = [
  [0.00, 1.92, 'S01'],   // CRT 开机
  [1.92, 5.68, 'S02'],   // 房间 · 两把椅子
  [5.68, 7.56, 'S03'],   // 耳朵特写
  [7.56, 9.44, 'S04'],   // 隔玻璃对唱
  [9.44, 11.32, 'S05'],  // 夜色（换套 B）
  [11.32, 13.20, 'S06'], // VU 表
  [13.20, 15.07, 'S07'], // 风（换套 C）
  [15.07, 16.95, 'S08'], // 碎
  [16.95, 20.71, 'S09'], // 城市
  [20.71, 22.59, 'S10'], // 雨（换套 D）
  [22.59, 24.47, 'S11'], // 脚
  [24.47, 26.35, 'S12'], // 磁带
  [26.35, 28.23, 'S13'], // 河
  [28.23, 30.642, 'S14'],// 关机
];
export function shotAt(t) {
  for (const s of SHOTS) if (t >= s[0] && t < s[1]) return s;
  return SHOTS[SHOTS.length - 1];
}

// —— 情绪弧（全片一条轨道，不许直接换 eyes/mouth） ——
export const EMO = [
  [0.04, 'neutral'], [0.51, 'thinking'], [1.45, 'sad'], [1.92, 'bored'],
  [2.86, 'sad'], [3.33, 'sad', { look: [1, 0] }], [3.80, 'bored'], [4.27, 'confused'],
  [4.74, 'sad'], [5.68, 'surprised'], [6.15, 'confused'], [6.62, 'nervous'],
  [7.09, 'shy'], [7.56, 'surprised'], [8.03, 'excited'], [8.50, 'love'],
  [8.97, 'love'], [9.44, 'hopeful'], [10.38, 'starstruck'], [10.85, 'relieved'],
  [11.32, 'nervous'], [12.26, 'love'], [12.73, 'sad', { gloom: .5 }],
  [13.20, 'determined'], [15.07, 'surprised'], [15.68, 'excited'],
  [16.95, 'excited'], [18.36, 'confused'], [19.77, 'sad'],
  [20.71, 'sad', { look: [1, 0] }], [21.65, 'confused'], [22.12, 'determined'],
  [22.59, 'cry'], [23.53, 'determined'], [24.47, 'relieved'], [24.94, 'thinking'],
  [25.41, 'confused'], [26.35, 'confused'], [26.82, 'starstruck'], [27.29, 'sad'],
  [27.76, 'relieved'], [28.23, 'determined'], [29.30, 'hopeful'],
];
