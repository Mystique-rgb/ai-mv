// Timeline: everything comes from the measured audio, never from a guess.
// beat = 0.465 s (65 low-frequency pulses over 30.64 s), first sung word lands on P00 = 0.700 s.
export const DUR = 30.64;
export const BEAT = 0.465;
export const T0 = 0.700;
export const bt = n => T0 + n * BEAT;

// lyric lines: verified onset/offset from the audio (see 11月7日.srt)
export const LINES = [
  { t0: 0.70, t1: 4.60, txt: '如今一个人听歌 总是会觉得失落' },
  { t0: 5.36, t1: 8.35, txt: '幻听你在我的耳边 轻轻诉说' },
  { t0: 8.92, t1: 10.28, txt: '夜色多温柔' },
  { t0: 11.12, t1: 12.92, txt: '你有多爱我' },
  { t0: 15.68, t1: 19.58, txt: '如今一个人听歌 总是会觉得难过' },
  { t0: 20.34, t1: 23.45, txt: '爱已不在这里 我却还没走脱' },
  { t0: 23.92, t1: 26.85, txt: '列表里的歌 随过往流动' },
];

export const SHOTS = [
  ['S00', 0.00, 0.70, '前奏 · 插头'],
  ['S01', 0.70, 5.36, 'L1 · 房间'],
  ['S02', 5.36, 8.92, 'L2 · 她拼起来'],
  ['S03', 8.92, 11.12, 'L3 · 夜色'],
  ['S04', 11.12, 12.92, 'L4 · 她散架'],
  ['S05', 12.92, 15.68, '间奏 · 揭底'],
  ['S06', 15.68, 20.34, 'L5 · 同机位'],
  ['S07', 20.34, 23.92, 'L6 · 撞门'],
  ['S08', 23.92, 26.85, 'L7 · 河'],
  ['S09', 26.85, 30.64, '尾奏 · 灯灭'],
];

export function shotAt(t) {
  for (const s of SHOTS) if (t >= s[1] && t < s[2]) return s;
  return SHOTS[SHOTS.length - 1];
}
