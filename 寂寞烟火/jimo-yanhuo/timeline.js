// Single source of truth: beat grid, shot cuts, lyrics. Page, mixer and checks all read this.
export const DUR = 55.28;
export const BEAT = 0.4425;          // 136 BPM
export const T0 = 0.46;              // first kick
export const beat = n => T0 + BEAT * n;

// shots: start time (on bar lines), id
export const SHOTS = [
  { id: 'macro',   t0: 0.00,  t1: 4.00 },
  { id: 'sea',     t0: 4.00,  t1: 7.54 },
  { id: 'ember',   t0: 7.54,  t1: 11.08 },
  { id: 'shore',   t0: 11.08, t1: 14.62 },
  { id: 'reflect', t0: 14.62, t1: 18.16 },
  { id: 'whip',    t0: 18.16, t1: 19.93 },
  { id: 'close',   t0: 19.93, t1: 21.70 },
  { id: 'wide',    t0: 21.70, t1: 23.47 },
  { id: 'scrape',  t0: 23.47, t1: 24.36 },
  { id: 'grey',    t0: 24.36, t1: 31.43 },
  { id: 'still',   t0: 31.43, t1: 35.42 },
  { id: 'stars',   t0: 35.42, t1: 39.40 },
  { id: 'firework',t0: 39.40, t1: 42.94 },
  { id: 'rainbow', t0: 42.94, t1: 46.48 },
  { id: 'sky',     t0: 46.48, t1: 50.02 },
  { id: 'fade',    t0: 50.02, t1: 55.28 },
];

// lyrics from the LRC, verbatim; end = next start (last one held to 53 s)
const L = [
  [0.00, '跨越过多少海洋去看你'], [3.34, '孤单的黑夜途中'], [5.42, '只要想着你'], [7.22, '我就不会惶恐'],
  [10.32, '时光的岸上人来了又走'], [13.92, '离开时你不用说我都懂'], [17.15, '感谢你曾让我'], [19.78, '留在你眼中'],
  [24.00, '我曾经走过最遥远的路'], [28.02, '想要去拥抱未成真的梦'], [31.60, '迷失的黑夜途中'], [33.78, '只要想起你'],
  [35.55, '就点亮了星空'], [38.54, '流浪的纸船忘不掉港口'], [42.18, '渐灭的花火割不断彩虹'], [45.72, '你就是我心中'], [48.44, '永恒的天空'],
];
export const LYRICS = L.map(([t0, text], i) => ({ t0, t1: i + 1 < L.length ? L[i + 1][0] : 53.0, text }));

// key actions that must land on the beat grid
export const HIT = {
  macroSweep: 0.46, titleIn: 4.00, emberLit: beat(12), scrapeGrey: 24.36,
  starFirst: beat(80), starLast: beat(86), firework: beat(88), rainbowCut: beat(98),
};
