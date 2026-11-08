// 节奏引擎：把「拍网格」变成全片共用的动力。
// 画面只由 t 决定 —— 所有抖动/冲击都用 hash(k) 而不是随机数，所以可重渲、可断点续渲。
import { BEAT, T0, beat } from './story.js';
import { clamp, hash, lerp } from './engine/lib.js';

// 当前处在第几拍、拍内相位（0..1）
export function phase(t) {
  const dt = t - T0, k = Math.floor(dt / BEAT);
  return { k, ph: dt / BEAT - k };
}

// 鼓点衰减包络：拍头 1 → 拍尾 0，sharp 越大越干脆
export const pulse = (t, sharp = 5) => Math.exp(-phase(t).ph * sharp);

// 每拍冲击强度（0..1）。稀疏表：没写的拍走默认值。
// 依据：k38=17.89s、k39=18.36s 是实测全曲最响两拍；k0 开场第一鼓；k33 副歌入；
//       k41–k43 褪色重场；k47 撕页；k63 合书。k1(0.51s)、k61(28.73s) 实测无底鼓 → 0（留白）。
const HITW = {
  0: 1.00, 1: 0.00,
  2: .42, 3: .55, 4: .50, 5: .55, 6: .60, 7: .50, 8: .55, 9: .50, 10: .55,
  12: .60, 13: .50, 14: .55, 15: .55, 16: .50, 17: .55, 18: .65,
  19: .55, 20: .60, 21: .55, 22: .50, 23: .55, 24: .60, 25: .55, 26: .62, 27: .70,
  28: .55, 29: .55, 30: .60, 31: .55, 32: .65, 33: .95, 34: .60, 35: .65, 36: .70, 37: .75,
  38: 1.00, 39: 1.00, 40: .70, 41: .80, 42: .75, 43: .80, 44: .60, 45: .85, 46: .90, 47: .95,
  48: .55, 49: .65, 50: .60, 51: .60, 52: .65, 53: .60, 54: .62, 55: .60, 56: .70,
  57: .55, 58: .50, 59: .55, 60: .60, 61: 0.00, 62: .55, 63: 1.00, 64: .35,
};
export const hitW = k => (k in HITW ? HITW[k] : .45);

// 冲击包络（0..1）：拍头瞬间起，0.22s 内衰减
export function hit(t) {
  const { k, ph } = phase(t);
  return hitW(k) * Math.exp(-ph * 4.2);
}

// 特定时刻的瞬时冲击（用于「最响两拍」「开书」「撕页」这种非网格点也要打的地方）
export const spike = (t, at, w = .13) => Math.exp(-Math.pow((t - at) / w, 2));

// 大事件：白闪 + 强推。返回 0..1
export const FLASHES = [12.92, 17.89, 18.36, 21.90, 27.30];
export function flash(t) {
  let a = 0;
  for (const ft of FLASHES) a = Math.max(a, spike(t, ft, .075) * .5);
  return a;
}

// 相机抖动：用 hash(k) 保证同一拍方向固定、幅度随包络衰减
export function shake(t, amt = .0020) {
  const { k, ph } = phase(t);
  const e = hitW(k) * Math.exp(-ph * 5.5) * amt;
  return [ (hash(k * 3.13) - .5) * e, (hash(k * 7.71 + 1.7) - .5) * e, (hash(k * 5.37 + 4.1) - .5) * e ];
}

// 拍点事件辅助：第 k 拍的时间
export const at = k => beat(k);
