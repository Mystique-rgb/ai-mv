// One timeline for picture, camera, subtitles. Everything the film knows about time lives here.
export const FPS = 30;
export const DUR = 30.64;

// measured grid: 127.7 BPM, beat = 0.4704 s, anchor 0.04 s; 16 bars of 4
export const BEAT = 0.4704;
export const T0 = 0.04;
export const beat = k => T0 + k * BEAT;
export const BAR = BEAT * 4;

// lyric lines: measured starts. rows are what the screen shows.
export const LINES = [
  { id: 'L1', t0: 0.70, t1: 4.60, rows: ['如今一个人听歌', '总是会觉得失落'], karaoke: 0 },
  { id: 'L2', t0: 5.36, t1: 8.35, rows: ['幻听你在我的耳边', '轻轻诉说'], karaoke: 0 },
  { id: 'L3', t0: 8.92, t1: 10.72, rows: ['夜色多温柔'], karaoke: 0 },
  { id: 'L4', t0: 11.12, t1: 12.92, rows: ['你有多爱我'], karaoke: 0 },
  { id: 'L5', t0: 15.68, t1: 19.58, rows: ['如今一个人听歌', '总是会觉得难过'], karaoke: 1 },
  { id: 'L6', t0: 20.34, t1: 23.45, rows: ['爱已不在这里', '我却还没走脱'], karaoke: 1 },
  { id: 'L7', t0: 23.92, t1: 26.85, rows: ['列表里的歌', '随过往流动'], karaoke: 1 },
];

// when the whole spread changes (page turns land inside these windows)
export const TURN = [
  { t0: 9.18, t1: 9.72, to: 'night' },   // k20: night paper flips up over the room
  { t0: 13.02, t1: 13.50, to: 'city' },  // k28: page turn into the paper city
  { t0: 21.90, t1: 22.42, to: 'blank' }, // k47: run out of pages, back to a blank sheet
];
export const SPREAD_OF = t => (t < TURN[0].t0 ? 'room' : t < TURN[1].t0 ? 'night' : t < TURN[2].t0 ? 'city' : 'blank');

// book mechanics
export const OPENING = [
  { t: 0.00, a: 0.10 },        // shut at the very start: a sliver of paper
  { t: 0.08, a: 0.12 },
  { t: 0.55, a: Math.PI / 2 }, // snaps open on the first drum hit
  { t: 1.45, a: Math.PI / 2 },
  { t: 18.30, a: Math.PI / 2 },
  { t: 19.60, a: 0.62 },       // the page folds over him (对折)
  { t: 20.72, a: Math.PI / 2 },
  { t: 21.60, a: 0.30 },       // second fold, he is caught in the gutter
  { t: 22.42, a: Math.PI / 2 },
  { t: 27.30, a: Math.PI / 2 },
  { t: 29.70, a: 0.06 },       // the book closes itself, one slit of light left
  { t: 30.64, a: 0.04 },
];
