// 时间线：《幻听》30.642s · 128BPM · 拍长 0.470s（实测锚点 1.45s）
// 画面主体从「界面」换成了「字」：71 个歌词字排成一条起伏的长路，主角逐字往前跳。
import * as U from './ui.js';
import * as C from './clawd.js';
import * as S from './stage.js';

export const DUR = S.DUR;
export const LINES = S.LINES;
export const SUBS = S.LINES.map(l => ({ t0: l.t0, t1: l.t1, text: l.text }));
export const CHARS = S.CHARS;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, u) => a + (b - a) * u;
const eio = u => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
const eo = u => 1 - Math.pow(1 - u, 3);
const hash = n => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };

export function camAt(t) { return S.camAt(t, S.heroAt(t)); }

// ---------- 主题（L3 径向翻暗） ----------
const THEME_AT = 9.44;
export function themeAt(t) {
  if (t < THEME_AT) return { base: 'L', over: null, r: 0 };
  const u = seg(t, THEME_AT, THEME_AT + .30);
  if (u >= 1) return { base: 'D', over: null, r: 0 };
  return { base: 'L', over: 'D', r: eio(u) * 2300 };
}

// ---------- 画面状态 ----------
export function frame(t) {
  const H = S.heroAt(t);
  const p = t / DUR;
  const st = {
    t, theme: 'L', clock: '22:47', hero: H, cam: S.camAt(t, H),
    fx: [], seam: 0, moon: 0, starOp: 0, clockFade: 1 - seg(t, 16.0, 18.0) * .55,
  };
  const TH = themeAt(t);
  if (TH.base === 'D' || TH.over) { st.theme = 'D'; st.clock = '00:00'; st.moon = seg(t, THEME_AT, THEME_AT + .6); st.starOp = seg(t, THEME_AT + .2, THEME_AT + 1.2); }
  st.base = TH.base; st.over = TH.over; st.r = TH.r;
  if (TH.base === 'L' && !TH.over) { st.moon = 0; st.starOp = 0; }

  // ---- 歌单行 ----
  const rows = [
    { t: '幻听', c: U.ROWCOL[0], tag: U.TAG, d: '3:06', sub: '你最爱循环' },
    { t: '晴天', c: U.ROWCOL[1], tag: U.TAG, d: '4:29', sub: '你分享的' },
    { t: '夜曲', c: U.ROWCOL[2], tag: U.TAG, d: '4:16', sub: '你分享的' },
    { t: '后来', c: U.ROWCOL[3], tag: U.TAG, d: '4:24', sub: '你分享的' },
    { t: '断桥残雪', c: '#5FD3A8', tag: U.TAG, d: '3:52', sub: '你分享的' },
    { t: '玫瑰花的葬礼', c: '#E58384', tag: U.TAG, d: '4:04', sub: '你分享的' },
    { t: '有何不可', c: '#8A7BFF', tag: U.TAG, d: '4:12', sub: '你分享的' },
    { t: '素颜', c: '#F2CD37', tag: U.TAG, d: '3:58', sub: '你分享的' },
    { t: '未命名', c: '#BDB3A3', tag: U.TAG, d: '', sub: '' },
  ];
  rows.forEach((r, i) => {
    r.op = i === 0 ? seg(t, .88, 1.02) : (i < 4 ? seg(t, 1.0 + i * .10, 1.2 + i * .10) : (i === 8 ? seg(t, 18.9, 19.4) : (t > 16.3 && t < 19.9 ? 1 : 0)));
    r.lit = i === 0 && t > 2.39;
  });
  let scroll = 0;
  if (t > 16.30) {
    const u1 = seg(t, 16.49, 17.43), stall = seg(t, 17.43, 18.84), u2 = seg(t, 19.31, 19.78);
    scroll = eio(u1) * 150 + stall * 16 + eo(u2) * 170;
    if (t > 19.78) scroll = 336;
    if (t > 19.88) scroll = 336 * (1 - eio(seg(t, 19.88, 20.22)));
  }
  st.rows = rows.filter(r => r.op > .02);
  st.scroll = scroll;

  // ---- 播放器 ----
  const vol = .55 + .07 * Math.exp(-Math.abs(t - 5.21) * 8) + .05 * Math.exp(-Math.abs(t - 5.68) * 7);
  st.pl = {
    prog: clamp(p * 1.02, 0, .99), vol: clamp(vol, 0, 1), volPink: t > 5.6, knobGlow: t > 6.0 && t < 8.9,
    heart: t > 10.85, heartPulse: t > 11.79 && t < 12.2 ? Math.sin(seg(t, 11.79, 12.2) * Math.PI) : 0,
    member: t > 28.22 && t < 28.72 ? '2人' : '1人',
    memberHot: t > 28.22 && t < 28.72 ? (1 - Math.abs(t - 28.47) * 3) : 0,
    comment: t > 4.70 && t < 6.2 ? 38 : 37, commentHot: t > 4.74 && t < 5.6,
    rows: st.rows, scroll,
    xoff: 0, xop: 1,
    split: false, longList: t > 16.3 && t < 20.3,
    playing: true,
    popover: t > 5.62 && t < 9.30 ? clamp(seg(t, 5.62, 5.80)) * (1 - seg(t, 9.10, 9.30)) : 0,
  };
  // ---- 聊天窗 ----
  const imIn = seg(t, 13.05, 13.30);
  st.im = {
    op: imIn, gray: t > 16.02 ? .55 : 0,
    dy: (1 - eo(imIn)) * 46 - (seg(t, 16.02, 16.30) - seg(t, 19.85, 20.20)) * 172,
    typing: (t > 13.67 && t < 16.0) ? (t > 14.14 ? 3 : 2) : (t > 28.35 ? 2 : 0),
    input: undefined,
    caretOn: Math.floor(t * 2.2) % 2 === 0,
  };
  // ---- 通知 ----
  st.notifs = [];
  const notifText = ['她分享了《晴天》', '她分享了《夜曲》', '她分享了《后来》'];
  const nt = [14.14, 14.61, 15.08];
  notifText.forEach((tx, i) => {
    if (t < nt[i]) return;
    const a = seg(t, nt[i], nt[i] + .22), fl = t > 15.08 ? 1 : 0, col = seg(t, 15.55, 15.85);
    if (col >= 1) return;
    st.notifs.push({ text: tx, op: (1 - col) * Math.min(1, a * 2), sc: .96 + .04 * eo(a), dx: col * 160, flip: fl });
  });

  // ================= 字阵特效 =================
  const F = st.fx;
  const dark = st.theme === 'D';
  const hitCol = dark ? '#FFC24A' : '#C2412A';
  const coolCol = dark ? '#8FE3FF' : '#2E8FC0';

  // 背景微尘（世界坐标，给纵深）
  {
    const camX = st.cam[0], camY = st.cam[1], z = st.cam[2];
    const w = 1920 / z * .62, h = 1080 / z * .62;
    for (let i = 0; i < 46; i++) {
      const gx = Math.round((camX + (hash(i * 3.1) - .5) * w * 2) / 190) * 190;
      const gy = Math.round((camY + (hash(i * 7.7) - .5) * h * 2) / 190) * 190;
      const sz = 3 + hash(i * 11.3) * 5;
      const op = (.10 + .22 * hash(i * 5.5)) * (1 + .35 * Math.sin(t * 1.6 + i));
      F.push(`<div style="position:absolute;left:${gx}px;top:${gy + Math.sin(t * .7 + i) * 12}px;width:${sz}px;height:${sz}px;
        background:${dark ? '#BFD4FF' : '#8A7B6A'};opacity:${clamp(op, 0, .4)}"></div>`);
    }
  }

  // 背景字流：耳边不断飘过的字（不参与踩踏，只给纵深）
  {
    const camX = st.cam[0], camY = st.cam[1], z = st.cam[2];
    const w = 1920 / z * .70, h = 1080 / z * .72;
    for (let i = 0; i < 30; i++) {
      const sp = 34 + hash(i * 2.3) * 80;
      const gx = camX + (hash(i * 4.1) - .5) * w * 2.6 + Math.sin(t * .5 + i) * 40;
      const span = h * 2.8;
      const gy = camY + (hash(i * 8.9) - .5) * span - ((t * sp) % span) + span * .5;
      const sz2 = 52 + hash(i * 6.7) * 78;
      const op = (.11 + hash(i * 9.1) * .10) * (dark ? 1.5 : 1);
      const ch = S.CHARS[Math.floor(hash(i * 12.7) * S.CHAR_N)].ch;
      F.push(`<div style="position:absolute;left:${gx}px;top:${gy}px;font-family:XK;font-size:${sz2}px;
        color:${dark ? '#CFE0FF' : '#5A4B3A'};opacity:${op};white-space:nowrap">${ch}</div>`);
    }
  }

  // 逐字落地：冲击环 + 笔画碎屑 + 尘
  for (let i = 0; i < S.CHARS.length; i++) {
    const c = S.CHARS[i];
    const d = t - c.t;
    if (d < 0 || d > .46) continue;
    if (Math.abs(c.x - H.x) > 1900) continue;
    const u = d / .46;
    const bx = c.x, by = c.y - c.size * .94;
    const big = i === 0 || S.CHARS[i - 1] && S.CHARS[i - 1].line !== c.line;
    const W = (c.size * .95) * (1 + u * (big ? 1.5 : .9));
    const hgt = (c.size * .30) * (1 + u * (big ? 1.2 : .7));
    F.push(`<div style="position:absolute;left:${bx - W / 2}px;top:${by - hgt * .34}px;width:${W}px;height:${hgt}px;border-radius:50%;
      border:${big ? 4 : 2.5}px solid ${hitCol};opacity:${(1 - u) * (big ? .92 : .68)};transform:scaleY(.42);transform-origin:50% 50%"></div>`);
    if (u < .55) {
      F.push(`<div style="position:absolute;left:${bx - W * .30}px;top:${by - hgt * .22}px;width:${W * .6}px;height:${hgt * .44}px;border-radius:50%;
        border:2px solid ${coolCol};opacity:${(1 - u / .55) * .5};transform:scaleY(.4)"></div>`);
    }
    F.push(C.dust(bx, by, u, 6, big ? 8 : 4, i + 3, dark ? '#9FB0D8' : '#C7BBA6'));
    if (u < .40) F.push(C.burst(bx, by, u, { n: big ? 14 : 6, px: 4, col: hitCol, seed: i, spread: 70 + c.size * .4, up: 40 }));
  }

  // 快跳拖尾的速度线
  if (H.air && H.u > .08 && H.u < .92) {
    const dir = -1;
    for (let i = 0; i < 4; i++) {
      const ly = H.y - 18 - i * 16, lx = H.x + dir * (54 + i * 30);
      F.push(`<div style="position:absolute;left:${lx}px;top:${ly}px;width:${48 + i * 22}px;height:3px;border-radius:2px;
        background:linear-gradient(90deg,${hitCol}00,${hitCol});opacity:${.16 + .1 * Math.sin(t * 20 + i)}"></div>`);
    }
  }

  // 句首标志：每句第一个字炸开时，画一个巨大的同心环
  S.LINES.forEach((L, li) => {
    const c0 = S.CHARS.find(c => c.line === li && c.i === 0);
    if (!c0) return;
    const d = t - c0.t;
    if (d < 0 || d > 1.1) return;
    const u = d / 1.1;
    for (let k = 0; k < 2; k++) {
      const uk = clamp(u - k * .22);
      if (uk <= 0) continue;
      const R = 120 + uk * 900;
      F.push(`<div style="position:absolute;left:${c0.x - R}px;top:${c0.y - c0.size - R}px;width:${2 * R}px;height:${2 * R}px;border-radius:50%;
        border:${3 - k}px solid ${k ? coolCol : hitCol};opacity:${(1 - uk) * .40}"></div>`);
    }
  });

  // 抽鼓段（17.43–19.20）：空气凝固，粒子悬停
  {
    const fr = seg(t, 17.43, 17.6) * (1 - seg(t, 19.0, 19.2));
    if (fr > 0) {
      for (let i = 0; i < 26; i++) {
        const px = H.x + (hash(i * 2.7) - .5) * 1300;
        const py = H.y - 120 - hash(i * 6.1) * 420;
        const sz = 3 + hash(i * 9.3) * 4;
        F.push(`<div style="position:absolute;left:${px}px;top:${py}px;width:${sz}px;height:${sz}px;background:#FFF3D0;opacity:${fr * .55}"></div>`);
      }
      F.push(`<div style="position:absolute;left:${H.x - 620}px;top:${H.y - 460}px;width:1240px;height:900px;
        background:radial-gradient(circle at 50% 50%,rgba(255,228,170,${.10 * fr}),rgba(255,228,170,0) 66%)"></div>`);
    }
  }

  // 结尾：平台光晕 + 键显
  if (t > S.END.t - .12) {
    const a = seg(t, S.END.t - .12, S.END.t + .25);
    F.push(`<div style="position:absolute;left:${S.END.x - 90}px;top:${S.END.y - S.END.h - 90}px;width:${S.END.w + 180}px;height:${S.END.h + 150}px;
      background:radial-gradient(circle at 40% 30%,rgba(229,131,132,${.22 * a}),rgba(229,131,132,0) 70%)"></div>`);
  }
  return st;
}

// ---------- 精灵层 ----------
export function actors(t) {
  const H = S.heroAt(t);
  const out = [];
  // 快跳残影
  if (H.air && H.u > .12 && H.u < .88) {
    const sp = Math.hypot(H.x - S.heroAt(t - .05).x, H.y - S.heroAt(t - .05).y);
    if (sp > 40) {
      for (let k = 1; k <= 3; k++) {
        const h2 = S.heroAt(t - .028 * k);
        out.push({ ...h2, px: 5.1, color: C.CLAY, dark: C.CLAY_D, op: .22 / k, show: true, ghost: 1 });
      }
    }
  }
  out.push({ ...H, px: 5.2, color: C.CLAY, dark: C.CLAY_D, show: t > .09 });
  return out;
}
