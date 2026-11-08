// 基础工具：确定性随机、缓动、颜色
export const h1 = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const h2 = (i, j) => h1(i * 57.3 + j * 131.9);
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const ss = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
export const eo = x => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
export const ei = x => Math.pow(clamp(x, 0, 1), 3);
export const eio = x => { x = clamp(x, 0, 1); return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
export const seg = (t, a, b) => clamp((t - a) / ((b - a) || 1e-6), 0, 1);
export const back = (x, s = 1.7) => { x = clamp(x, 0, 1); const c = s + 1; return 1 + c * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
export const hex = h => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255]; };
export const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const shade = (c, k) => [clamp(c[0] * k, 0, 1), clamp(c[1] * k, 0, 1), clamp(c[2] * k, 0, 1)];
export const key = (t, ks) => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 0; i < ks.length - 1; i++) {
    const [t0, v0, e] = ks[i], [t1, v1] = ks[i + 1];
    if (t < t1) { const k = (e || eio)((t - t0) / (t1 - t0)); return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], k)) : lerp(v0, v1, k); }
  }
  return ks[ks.length - 1][1];
};

// 调色板
export const C = {
  canvas: hex('#C9C4BA'), canvasDark: hex('#A9A49A'),
  night: hex('#151A24'), deep: hex('#16324F'), sea: hex('#1E4468'), seaDeep: hex('#0E2438'),
  cobalt: hex('#2F62C0'), ice: hex('#8FB8D8'), foam: hex('#DCE8EE'),
  terra: hex('#D97757'), terraDark: hex('#A4533A'),
  pink: hex('#F79AC0'), pinkDeep: hex('#C4557F'),
  ochre: hex('#B8763F'), sand: hex('#C99A62'),
  grey: hex('#888780'), greyDark: hex('#4A4A46'), greyLight: hex('#B4B2A9'),
  black: hex('#141312'), darkred: hex('#5C1F1F'), maroon: hex('#3E1515'),
  gold: hex('#E8B341'), amber: hex('#F4B942'), lemon: hex('#F7E08C'),
  sky: hex('#7FB2D9'), cloud: hex('#EDE7DA'), white: hex('#F5EFE3'),
  violet: hex('#8C6BA6'), jade: hex('#4FA3B8'), rose: hex('#C1443C'),
  indigo: hex('#5A6E9E'), orange: hex('#E08A3C'), green: hex('#5C8F5A'),
};
export const RAINBOW = [C.rose, C.orange, C.gold, C.green, C.jade, C.cobalt, C.violet];
