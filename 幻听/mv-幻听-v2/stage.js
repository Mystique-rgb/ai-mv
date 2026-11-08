// 舞台：歌词不是字幕，是台阶。71 个字排在一条起伏的长路上，主角一个一个字往前跳。
export const B = 0.470, A0 = 1.45, DUR = 30.642;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, u) => a + (b - a) * u;
const eio = u => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
const eo = u => 1 - Math.pow(1 - u, 3);
const hash = n => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };

export const LINES = [
  { t0: 0.70, t1: 4.60, text: '如今一个人听歌 总是会觉得失落', size: 158, sec: 0 },
  { t0: 5.36, t1: 8.35, text: '幻听你在我的耳边 轻轻诉说', size: 152, sec: 0 },
  { t0: 8.92, t1: 10.28, text: '夜色多温柔', size: 206, sec: 0 },
  { t0: 11.12, t1: 12.92, text: '你有多爱我', size: 196, sec: 0 },
  { t0: 15.68, t1: 19.58, text: '如今一个人听歌 总是会觉得难过', size: 158, sec: 1 },
  { t0: 20.34, t1: 23.45, text: '爱已不在这里 我却还没走脱', size: 152, sec: 1 },
  { t0: 23.92, t1: 26.85, text: '列表里的歌 随过往流动', size: 172, sec: 1 },
];

// 每句的路径形态：字距 / 基准线 / 起伏幅度 / 起伏周期 / 相位
const LAY = [
  { dx: 206, yb: 660, amp: 128, per: 5.0, ph: 0.0 },
  { dx: 206, yb: 596, amp: 148, per: 4.4, ph: 1.2 },
  { dx: 278, yb: 686, amp: 96,  per: 3.2, ph: 0.4 },
  { dx: 272, yb: 570, amp: 128, per: 3.4, ph: 2.0 },
  { dx: 206, yb: 664, amp: 148, per: 5.0, ph: 1.6 },
  { dx: 206, yb: 582, amp: 160, per: 4.6, ph: 0.8 },
  { dx: 228, yb: 636, amp: 140, per: 4.8, ph: 2.4 },
];

export const CHARS = [];
{
  let cx = 620;
  LINES.forEach((L, li) => {
    const lay = LAY[li];
    if (li > 0) cx += 282;
    const cs = [...L.text].filter(c => c !== ' ');
    const n = cs.length, d = L.t1 - L.t0;
    let prev = -9;
    cs.forEach((ch, i) => {
      let tt = L.t0 + d * i / n;
      tt = A0 + Math.round((tt - A0) / (B / 2)) * (B / 2);
      tt = Math.max(tt, prev + 0.16, L.t0 - 0.02);
      tt = +tt.toFixed(4);
      prev = tt;
      CHARS.push({
        ch, line: li, i, n,
        x: cx + i * lay.dx,
        y: lay.yb + lay.amp * Math.sin(i / lay.per * Math.PI * 2 + lay.ph),
        size: L.size, t: tt,
      });
    });
    cx += (n - 1) * lay.dx;
  });
}
export const CHAR_N = CHARS.length;

// 结尾平台：一个悬在路上的小对话框，主角跳上去打完最后一个字
export const END = { x: 19120, y: 622, w: 402, h: 152, t: 27.06 };
CHARS.push({ ch: '', line: 9, i: 0, n: 1, x: END.x + END.w * 0.38, y: END.y - END.h, size: 0, t: END.t, v: 1 });
const ALL = CHARS.length;

// 角色脚底 → 字的视觉上沿
const topOf = c => c.y - c.size * 1.00;

export function heroAt(t) {
  const F = CHARS[0];
  // 开场：从天而降砸在第一个字上
  if (t < F.t) {
    const u = seg(t, 0.05, F.t);
    const fall = 1 - u * u;
    return {
      x: F.x, y: topOf(F) - fall * 1180, gy: topOf(F), sq: u > .9 ? .34 : -.24, rot: 0,
      flip: false, eyes: 'wide', arms: 'up', legs: 'tuck', air: 1, op: seg(t, 0.05, 0.15),
    };
  }
  // 站上结尾平台：呼吸 → 低头打字 → 抬头 → 闭眼
  if (t >= CHARS[ALL - 1].t) {
    const c = CHARS[ALL - 1], q = t - c.t;
    const sq = .035 * Math.sin(q * 3.2);
    let eyes = 'd', arms = 'down';
    if (q > .50 && q < 1.42) { eyes = 'u'; arms = 'one'; }
    if (q >= 1.42) { eyes = 'd'; }
    if (q > 2.35) { eyes = 'shut'; }
    return { x: c.x, y: topOf(c), gy: topOf(c), sq, rot: 0, flip: false, eyes, arms, legs: 'stand', air: 0, op: 1, i: ALL - 1, u: 1 };
  }

  let i = 0;
  for (let k = 0; k < ALL - 1; k++) if (CHARS[k + 1].t > t) { i = k; break; }

  const a = CHARS[i], b = CHARS[i + 1];
  const u = seg(t, a.t, b.t);
  const ax = a.x, ay = topOf(a), bx = b.x, by = topOf(b);
  const dist = Math.hypot(bx - ax, by - ay);
  const hh = 44 + dist * .155;
  const x = lerp(ax, bx, u);
  const y = lerp(ay, by, u) - Math.sin(Math.PI * u) * hh;

  let sq = 0;
  if (u < .16) sq = .26 * (1 - u / .16);
  else if (u < .62) sq = -.17;
  else if (u < .88) sq = -.11;
  else sq = .32 * seg(u, .88, 1);

  const ph = hash(i * 7.3 + a.line);
  const eyes = u < .18 ? 'wide' : (u < .52 ? (ph > .52 ? 'u' : 'n') : (u < .84 ? (ph > .68 ? 'happy' : 'd') : 'n'));
  const arms = (u > .26 && u < .78) ? (ph > .62 ? 'reach' : 'up') : 'down';
  const legs = (u > .12 && u < .9) ? 'tuck' : (i % 2 ? 'walkA' : 'stand');
  const rot = (u > .15 && u < .85) ? (ph > .5 ? .07 : -.07) * Math.sin(Math.PI * u) : 0;

  return { x, y, gy: lerp(ay, by, u), sq, rot, flip: false, eyes, arms, legs, air: 1, op: 1, u, i };
}

// 相机：sx/sy = 主角落在屏幕上的位置，z = 景别，rot = 机身倾斜
const CAMK = [
  [0.000, 960, 470, 3.40, 0.00],
  [0.150, 900, 460, 2.80, 0.03],
  [0.420, 880, 452, 2.22, 0.00],
  [0.745, 960, 420, 2.10, 0.00],
  [1.000, 820, 500, 2.30, -0.01],
  [1.450, 760, 480, 2.62, 0.00],
  [2.200, 600, 470, 3.00, -0.03],
  [3.100, 760, 492, 2.32, 0.01],
  [4.600, 1380, 450, 2.20, 0.03],
  [5.360, 640, 480, 3.10, 0.00],
  [6.600, 900, 460, 2.60, 0.03],
  [8.350, 1262, 472, 2.30, 0.00],
  [8.920, 960, 470, 3.20, 0.00],
  [10.280, 1020, 482, 3.00, 0.02],
  [11.120, 470, 470, 2.80, -0.03],
  [12.920, 1400, 450, 2.30, 0.04],
  [13.600, 900, 472, 2.10, 0.07],
  [14.600, 1082, 460, 2.40, 0.09],
  [15.680, 1480, 450, 2.10, 0.00],
  [17.430, 540, 480, 2.80, -0.04],
  [18.370, 820, 470, 3.10, 0.00],
  [19.200, 780, 480, 2.90, 0.02],
  [19.580, 1100, 460, 2.30, 0.00],
  [20.340, 840, 470, 2.80, 0.00],
  [22.000, 1180, 460, 2.30, 0.03],
  [23.450, 720, 482, 2.80, 0.00],
  [23.920, 400, 470, 3.10, -0.03],
  [25.400, 1060, 460, 2.50, 0.02],
  [26.850, 1540, 450, 2.30, 0.00],
  [27.060, 1080, 470, 2.10, 0.02],
  [27.900, 906, 456, 2.08, 0.00],
  [28.900, 938, 424, 2.34, 0.00],
  [30.642, 954, 402, 2.78, 0.00],
];

export function camAt(t, hero) {
  // 开场：从第一个字的笔画里拉起（相机固定看它，不跟人）
  if (t < 0.745) {
    const u = seg(t, 0.02, 0.745);
    const zz = lerp(6.4, 2.10, Math.pow(u, 0.92));
    return [620 - 92 * (1 - u) * (1 - u), 559 + 62 * Math.sin(u * Math.PI), zz, -0.04 * (1 - u)];
  }
  let i = 0;
  while (i < CAMK.length - 2 && t > CAMK[i + 1][0]) i++;
  const a = CAMK[i], b = CAMK[i + 1], u = seg(t, a[0], b[0]);
  const k = (b[0] - a[0]) < .34 ? eo(u) : eio(u);
  const sx = lerp(a[1], b[1], k), sy = lerp(a[2], b[2], k);
  const z = lerp(a[3], b[3], k), rot = lerp(a[4], b[4], k);

  // 落地 kick：每次踩到字都是一下轻微的下压 + 抖动
  let sh = 0, zk = 0;
  const H = hero || heroAt(t);
  const idx = H.i ?? 0;
  for (const j of [idx, idx - 1]) {
    if (j < 0 || j >= CHARS.length) continue;
    const d = t - CHARS[j].t;
    if (d >= 0 && d < .34) { const e = Math.exp(-d * 15); sh += 9 * e; zk += .022 * e; }
  }
  const x = H.x + (960 - sx) / z + Math.sin(t * .8) * 2.2 + Math.sin(t * 47) * sh;
  const y = H.y - (sy - 540) / z + Math.cos(t * .61) * 2.0 + Math.cos(t * 41) * sh * .55;
  return [x, y, z * (1 + zk + .004 * Math.sin(t * 2.2)), rot];
}

// 字的可见列表（带状态）
export function chars(t, cx, cy, z) {
  const hw = 1920 / z * .78, hh = 1080 / z * .92, out = [];
  for (const c of CHARS) {
    if (c.v) continue;
    const mid = c.y - c.size * .5;
    if (Math.abs(c.x - cx) > hw + c.size || Math.abs(mid - cy) > hh + c.size) continue;
    const k = t - c.t;
    const on = seg(k, -0.03, 0.05);
    const sink = k >= 0 ? 15 * Math.exp(-k * 8) : 0;
    const fade = 1 - seg(k, 1.2, 4.2) * .40;
    const pop = k >= 0 ? Math.exp(-k * 9) : 0;
    const sc = 1 + .34 * pop - .04 * (1 - seg(k, -1.6, 0)) * (1 - on);
    out.push({
      ch: c.ch, x: c.x, y: c.y + sink, size: c.size, sink,
      op: (.30 + .70 * on) * fade,
      hit: k >= 0 ? Math.exp(-k * 15) : 0,
      sc,
      ahead: k < 0,
      solid: (k < 0 && c.line === 0 && c.i === 0) ? .58 : 0,
    });
  }
  return out;
}
