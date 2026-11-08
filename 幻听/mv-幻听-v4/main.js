// 《幻听》· 一个人的对唱 · 综艺节奏扁平 v4
// 1920×1080 / 30 fps / 30.642 s / 65 拍零空拍
// 每一帧都是 t 的纯函数。分镜依据：2026-11-07-分镜提示词-…-v4-Clawd.md §9 逐拍表。
import {
  W, H, INK, CREAM, T0, BEAT, tOf, kAt, clamp, seg, lerp, hash, eo, eio, back,
  KAI, HEI, flashAt, punchAt, shakeAt, emoAt, drawClawd, note8, drawNote,
  judgeWord, burst, roundRect, line, star, heart, drop, dotGrid, text,
} from './film.js';

const DUR = 30.642;
const cv = document.getElementById('stage');
cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');

// ---------- 九个 round 色板（§4.2） ----------
const ROUNDS = [
  { k0: 0,  bg: CREAM,      pat: 'stripes', patCol: '#FFD24A', ac: '#E8A33D', name: 'READY',        cn: '准备' },
  { k0: 4,  bg: '#2E7DD1',  pat: 'dots',    patCol: '#7FB5EC', ac: '#CFE3FA', name: 'ROUND 1',      cn: '一个人' },
  { k0: 12, bg: '#149E92',  pat: 'stripes', patCol: '#5FC9BF', ac: '#C8F0EA', name: 'ROUND 2',      cn: '耳边' },
  { k0: 20, bg: '#20366B',  pat: 'sun',     patCol: '#D9A441', ac: '#FFD24A', name: 'ROUND 3',      cn: '夜色' },
  { k0: 28, bg: '#8CCB3F',  pat: 'dots',    patCol: '#6FA832', ac: '#FFF3DC', name: 'ROUND 4',      cn: '加倍' },
  { k0: 36, bg: '#6C4BC4',  pat: 'sun',     patCol: '#8F74D6', ac: '#D9CFFF', name: 'ROUND 5',      cn: '难过' },
  { k0: 44, bg: '#3B2A62',  pat: 'stars',   patCol: '#5A4488', ac: '#B9AEE0', name: 'ROUND 6',      cn: '空位' },
  { k0: 52, bg: '#4CB7E8',  pat: 'dots',    patCol: '#8AD2F2', ac: '#FFFFFF', name: 'ROUND 7',      cn: '歌单' },
  { k0: 60, bg: '#FFD24A',  pat: 'stripes', patCol: '#E8B425', ac: '#1D1A17', name: 'ROUND 8',      cn: '再来一次' },
];
function roundAt(t) { const kb = kAt(t); let r = ROUNDS[0]; for (const q of ROUNDS) if (kb >= q.k0) r = q; return r; }
function darkOf(hex, f = .62) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
  return `rgb(${r},${g},${b})`;
}

// ---------- 字幕（严格等于 .ass 时间轴；华文楷体） ----------
const LINES = [
  { t0: 0.70,  t1: 4.60,  txt: '如今一个人听歌 总是会觉得失落' },
  { t0: 5.36,  t1: 8.35,  txt: '幻听你在我的耳边 轻轻诉说' },
  { t0: 8.92,  t1: 10.28, txt: '夜色多温柔' },
  { t0: 11.12, t1: 12.92, txt: '你有多爱我' },
  { t0: 15.68, t1: 19.58, txt: '如今一个人听歌 总是会觉得难过' },
  { t0: 20.34, t1: 23.45, txt: '爱已不在这里 我却还没走脱' },
  { t0: 23.92, t1: 26.85, txt: '列表里的歌 随过往流动' },
];
function drawSubs(t) {
  for (const L of LINES) {
    if (t < L.t0 || t > L.t1 + 0.08) continue;      // 只硬切不淡出
    const chars = Array.from(L.txt);
    ctx.save();
    ctx.font = `100px ${KAI}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const rowW = chars.reduce((s, c) => s + ctx.measureText(c).width, 0);
    let x = 960 - rowW / 2; const y = 985;
    chars.forEach((c, i) => {
      const cw = ctx.measureText(c).width;
      const born = L.t0 + i * 0.022;                 // telop 内部打字机，非逐字卡点
      if (t >= born) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = INK; ctx.lineWidth = 14;   // ink 描边 ≈ 字号 14%
        ctx.strokeText(c, x + cw / 2, y);
        ctx.fillStyle = t > 15.5 && t < 20 ? '#FFD24A' : '#FFF7E6';  // 副歌换黄
        ctx.fillText(c, x + cw / 2, y);
      }
      x += cw;
    });
    ctx.restore();
  }
}

// ---------- 背景图案（按拍跳格，不匀速滚动） ----------
function drawPattern(r, t) {
  const kb = Math.max(0, Math.floor(kAt(t)));
  const half = kAt(t) >= 30 ? (kAt(t) % 1) >= .5 : false;   // R4 条纹 ×2
  const step = (r.pat === 'stripes' && Math.floor(kAt(t)) >= 28 && Math.floor(kAt(t)) < 36) ? kb * 2 : kb;
  ctx.save();
  if (r.pat === 'stripes') {
    ctx.fillStyle = r.patCol; ctx.globalAlpha = .5;
    const sp = 220, off = (step * 55) % sp;
    for (let x = -H + off; x < W + H; x += sp) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 160, 0); ctx.lineTo(x + 160 - 240, H); ctx.lineTo(x - 240, H); ctx.fill();
    }
  } else if (r.pat === 'dots') {
    ctx.fillStyle = r.patCol; ctx.globalAlpha = .55;
    const sp = 170, off = (step * 42) % sp;
    for (let yy = 60; yy < H; yy += sp) for (let xx = 40 + ((yy / sp) % 2) * sp / 2; xx < W; xx += sp) {
      ctx.beginPath(); ctx.arc(xx + off, yy, 17, 0, Math.PI * 2); ctx.fill();
    }
  } else if (r.pat === 'sun') {
    const cx = 960, cy = 700, R0 = 560;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(step * .07);
    ctx.fillStyle = r.patCol; ctx.globalAlpha = .4;
    for (let i = 0; i < 16; i++) {
      ctx.rotate(Math.PI * 2 / 16);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R0, -Math.PI / 22, Math.PI / 22); ctx.fill();
    }
    ctx.restore();
  } else if (r.pat === 'stars') {
    ctx.fillStyle = r.patCol; ctx.globalAlpha = .8;
    for (let i = 0; i < 12; i++) {
      const x = hash(i) * W, y = hash(i + 40) * 640, tw = 16 + hash(i + 9) * 18;
      star(ctx, x, y, tw, r.patCol, null, 0);
    }
  }
  ctx.restore();
}

// ---------- 舞台 ----------
const JY = 800;              // 判定线
const HX = 540;              // 1P 位
const PX = 1400;             // 2P 位
const SLOT_Y = 1032;

function drawJudgeLine(t, x0, x1, y) {
  line(ctx, x0, y, x1, y, 8, INK);
  // 判定线上的小刻度，随拍跳动一格
  const kb = Math.floor(Math.max(0, kAt(t)));
  ctx.fillStyle = CREAM;
  for (let x = x0 + ((kb * 46) % 92); x < x1; x += 92) ctx.fillRect(x - 3, y - 12, 6, 24);
}
function drawFloor(t, r, x0, x1) {
  ctx.fillStyle = darkOf(r.bg, .5);
  ctx.fillRect(x0, JY + 4, x1 - x0, H - JY);
  line(ctx, x0, JY + 4, x1, JY + 4, 6, INK);
}

// 2P 虚线空位（歪 2°）+ 卷角名牌
function draw2PBox(t) {
  let sc = 1, cy = 615;
  if (kAt(t) >= 10.8 && kAt(t) < 12) {        // k11 收进底部 slot
    const u = eo(seg(t, tOf(11), tOf(11.7)));
    sc = 1 - u * .92; cy = lerp(615, SLOT_Y, u);
  } else if (kAt(t) >= 12 && kAt(t) < 12.6) { // k12 弹回
    const u = eo(seg(t, tOf(12), tOf(12.5)));
    sc = .08 + u * .92; cy = lerp(SLOT_Y, 615, u);
  } else if (kAt(t) >= 44) {                  // R6 整块撤走 → 收成一个点
    const u = eo(seg(t, tOf(44), tOf(44.6)));
    if (u >= 1) return;
    sc = 1 - u; cy = lerp(615, 700, u);
  }
  ctx.save(); ctx.translate(PX, cy); ctx.rotate(.035); ctx.scale(sc, sc);
  ctx.strokeStyle = CREAM; ctx.lineWidth = 7; ctx.setLineDash([26, 18]);
  ctx.lineDashOffset = -((t * 30) % 44);
  roundRect(ctx, -210, -175, 420, 360, 24); ctx.stroke();
  ctx.setLineDash([]);
  // 名牌（卷角）
  ctx.fillStyle = CREAM; roundRect(ctx, -150, -215, 200, 56, 10); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(50, -215); ctx.lineTo(28, -193); ctx.lineTo(50, -159); ctx.fillStyle = darkOf('#FFF3DC', .8); ctx.fill();
  text(ctx, '2P', -50, -187, 40, INK, null, 0, HEI);
  ctx.restore();
}

// 角标 banner（左上）
function drawBanner(t, r) {
  const born = tOf(r.k0);
  const k = back(Math.min(1, (t - born) / .22));
  ctx.save(); ctx.translate(64, 56); ctx.scale(.5 + .5 * k, .5 + .5 * k);
  ctx.fillStyle = CREAM; roundRect(ctx, 0, 0, 470, 84, 16); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.stroke();
  ctx.fillStyle = r.bg; roundRect(ctx, 12, 12, 200, 60, 10); ctx.fill(); ctx.stroke();
  text(ctx, r.name, 112, 44, 34, r.k0 === 0 || r.k0 === 60 ? INK : CREAM, null, 0, HEI);
  text(ctx, r.cn, 350, 44, 42, INK, null, 0, KAI);
  ctx.restore();
}

// 计分板（右上）：1P COMBO / 2P COMBO / 2P SCORE --
let combo1Cache = null, combo1CacheT = -1;
function combo1(t) {
  const kb = kAt(t);
  if (kb < 2) return 0;
  const k = Math.min(63, Math.floor(kb));
  let c = 0;
  for (let i = 2; i <= k; i++) c += (i >= 28 && i < 36) ? 2 : 1;
  return c;
}
function combo2(t) {
  const kb = kAt(t);
  if (kb < 2) return 0;
  const k = Math.min(63, Math.floor(kb));
  if (k < 13) return [0, 1, 1, 1, 2, 2, 3, 4, 4, 4, 4][k - 2] ?? 0;   // 慢慢自己跳
  if (k >= 46) return combo2At46;                                      // R6 起冻结
  const c = combo1(t) - 1 + (k >= 37 ? 4 + ((k - 37) >> 1) : 0);       // k37 反超
  if (k === 45) combo2At46 = c;
  return c;
}
let combo2At46 = 0;
function drawScoreboard(t) {
  const kb = kAt(t);
  ctx.save(); ctx.translate(1580, 44);
  ctx.fillStyle = CREAM; roundRect(ctx, 0, 0, 296, 196, 18); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.stroke();
  const rows = [
    ['1P', '#D97757', String(Math.min(99, combo1(t))).padStart(2, '0')],
    ['2P', '#E58384', kb < 2 ? '00' : String(Math.min(99, combo2(t))).padStart(2, '0')],
    ['2P', '#E58384', '--'],
  ];
  rows.forEach(([tag, col, val], i) => {
    const y = 42 + i * 58;
    ctx.fillStyle = col; roundRect(ctx, 14, y - 20, 56, 40, 8); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
    text(ctx, tag, 42, y, 24, kb >= 55 && i === 2 ? INK : CREAM, null, 0, HEI);
    // k55 数字被水流冲散成圆点 / k59 归零重跳
    if (kb >= 55 && kb < 56.6 && i < 2) {
      ctx.fillStyle = INK;
      for (let d = 0; d < 4; d++) { ctx.beginPath(); ctx.arc(120 + d * 38 + Math.sin(t * 3 + d) * 14 * seg(t, tOf(55), tOf(56)), y + Math.cos(t * 2.4 + d) * 10 * seg(t, tOf(55), tOf(56)), 5, 0, Math.PI * 2); ctx.fill(); }
    } else if (kb >= 59.4 && i === 0) {
      text(ctx, '000001', 200, y, 30, INK, null, 0, HEI);
    } else {
      text(ctx, val, 200, y, 30, INK, null, 0, HEI);
    }
  });
  ctx.restore();
}

// 底部 slot + round 卡
function slotPos(i) { return [712 + i * 92, 1052]; }
function drawSlots(t) {
  const kb = kAt(t);
  for (let i = 0; i < 7; i++) {
    const [sx, sy] = slotPos(i);
    const filled = t >= tOf(ROUNDS[i + 1].k0);
    ctx.fillStyle = filled ? CREAM : 'rgba(29,26,23,.25)';
    roundRect(ctx, sx - 34, sy - 23, 68, 46, 8); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
    if (filled) {
      const rc = ROUNDS[i + 1];
      const lit = kb >= 57 && kb < 57.6;                       // k57 一起亮一次
      ctx.fillStyle = lit ? '#FFFFFF' : rc.bg;
      roundRect(ctx, sx - 27, sy - 17, 54, 34, 6); ctx.fill();
      text(ctx, String(i + 1).padStart(2, '0'), sx, sy, 22, CREAM, null, 0, HEI);
    }
  }
}
// round 开头：大卡飞入（R0 无卡，让位给 count-in）
function drawRoundCard(t, r) {
  if (r.k0 === 0) return;
  const born = tOf(r.k0);
  const dt = t - born;
  if (dt < 0 || dt > .55) return;
  const u = back(Math.min(1, dt / .3));
  const x = lerp(2150, 1050, u), y = 470, rot = lerp(.4, -.06, u);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(29,26,23,.3)'; roundRect(ctx, -140 + 14, -95 + 14, 280, 190, 18); ctx.fill();
  ctx.fillStyle = CREAM; roundRect(ctx, -140, -95, 280, 190, 18); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.stroke();
  text(ctx, r.name, 0, -38, 40, INK, null, 0, HEI);
  text(ctx, r.cn, 0, 26, 64, r.bg, INK, 6, KAI);
  ctx.restore();
}
// round 结尾：卡缩进 slot
function drawCardSink(t) {
  const kb = kAt(t);
  const ends = [4, 12, 20, 28, 36, 44, 52];
  for (let i = 0; i < ends.length; i++) {
    if (kb >= ends[i] && kb < ends[i] + 1) {
      const u = eio(seg(t, tOf(ends[i]), tOf(ends[i] + .8)));
      const [sx, sy] = slotPos(i);
      const x = lerp(1050, sx, u), y = lerp(470, sy, u), s = lerp(1, .2, u);
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = CREAM; roundRect(ctx, -140, -95, 280, 190, 18); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.stroke();
      ctx.restore();
    }
  }
}

// ---------- 落下的音符 ----------
// landT 落线时刻；起落 0.45s；密度按 round（§6.1）
function notesAt(t) {
  const out = [];
  const kb = kAt(t);
  if (kb >= 52 && kb < 63) return out;                       // R7 换传送带
  for (let k = 2; k <= 63; k++) {
    const lt = tOf(k);
    const dens2 = k >= 28 && k < 36;                          // R4 起 2/拍
    for (const [d, side] of [[0, 'L'], [dens2 ? .5 : 99, 'L']]) {
      const T = lt + d;
      if (T > 30.2) continue;
      const u = (t - (T - .45)) / .45;                        // 下落进度
      if (u >= 0 && u < 1) {
        const x = HX - 60 + hash(k * 3 + d) * 120;
        const y = lerp(120, JY - 16, u * u);
        out.push({ x, y, land: T });
      } else if (t >= T && t < T + .12) {                     // 落地小环
        out.push({ x: HX - 60 + hash(k * 3 + d) * 120, y: JY - 16, ring: t - T });
      }
    }
    // 副歌：右侧判定线也落（3/拍），k44 后仍从右边飞来（接空）
    if ((t >= 15.68 && k >= 34 && k <= 51)) {
      const u = (t - (lt - .45)) / .45;
      if (u >= 0 && u < 1) out.push({ x: PX - 40 + hash(k * 7) * 90, y: lerp(120, JY - 16, u * u), land: lt, side: 'R' });
      else if (t >= lt && t < lt + .12) out.push({ x: PX - 40 + hash(k * 7) * 90, y: JY - 16, ring: t - lt });
    }
  }
  // k63 全屏齐落
  if (t >= tOf(63) - .5 && t < tOf(63) + .15) {
    const u = clamp((t - (tOf(63) - .5)) / .5);
    for (let i = 0; i < 16; i++) {
      const x = 120 + i * 118;
      out.push({ x, y: lerp(-80, JY - 16, u * u), land: tOf(63) });
    }
  }
  return out;
}

// ---------- 判定词表（§9） ----------
const WORDS = {
  2: ['PERFECT', CREAM, -8], 5: ['GOOD', CREAM, 0], 6: ['PERFECT', CREAM, -8], 7: ['…?', CREAM, 0],
  9: ['PERFECT', CREAM, -8], 13: ['PERFECT', CREAM, -8], 14: ['PERFECT ×2', '#FFD24A', 0],
  16: ['PERFECT', CREAM, -8], 17: ['GOOD', CREAM, 0], 18: ['AGAIN?', '#E5484D', 5],
  20: ['NICE', '#FFD24A', 0], 21: ['NICE', '#FFD24A', 4], 22: ['NICE', '#FFD24A', -4], 23: ['NICE', '#FFD24A', 0],
  25: ['10/10!', '#FFD24A', 0], 28: ['GOOD', CREAM, 0], 29: ['GOOD', CREAM, 5], 30: ['GOOD GOOD', CREAM, 0],
  31: ['GOOD', CREAM, -5], 32: ['READY', CREAM, 0], 34: ['PERFECT ×4', '#FFD24A', 0],
  35: ['PERFECT?', CREAM, 0], 36: ['PERFECT', CREAM, -8], 37: ['PERFECT', CREAM, 8],
  38: ['PERFECT', CREAM, -8], 39: ['GOOD', CREAM, 6], 40: ['GOOD', CREAM, 0], 41: ['GOOD', CREAM, -6],
  42: ['MISS', '#E5484D', 0], 43: ['GOOD', CREAM, 0], 45: ['MISS', '#E5484D', 0],
  46: ['GOOD', CREAM, 0], 47: ['MISS MISS', '#E5484D', 0], 48: ['MISS', '#E5484D', 0],
  49: ['NO ANSWER', '#E5484D', 0], 50: ['GOOD', CREAM, 0], 51: ['GOOD', CREAM, 0],
  52: ['NICE', '#FFD24A', 0], 53: ['NICE', '#FFD24A', 0], 54: ['GOOD', CREAM, 0], 55: ['GOOD', CREAM, 0],
  56: ['CLEAR', '#FFD24A', 0], 57: ['PERFECT', CREAM, -8], 58: ['AGAIN?', '#E5484D', 0],
  59: ['GOOD', CREAM, 0], 60: ['READY', CREAM, 0], 63: ['PERFECT!', '#FFD24A', 0],
};
function drawWords(t) {
  const kb = kAt(t);
  const k = Math.floor(kb);
  if (WORDS[k]) judgeWord(ctx, WORDS[k][0], 960, 178, k === 63 ? 130 : 104, WORDS[k][1], WORDS[k][2] * Math.PI / 180, tOf(k), t);
  if (kb >= 0 && kb < 1) judgeWord(ctx, 'READY', 960, 178, 104, CREAM, 0, tOf(0), t);
  // 15.68 非拍点大时刻
  if (t >= 15.68 && t < 16.15) judgeWord(ctx, 'PERFECT!', 960, 178, 120, '#FFD24A', -6, 15.68, t);
}

// ---------- 主角动作（§5.3 / §9） ----------
function heroAt(t) {
  const kb = kAt(t);
  const k = Math.floor(kb), frac = kb - k;
  const st = { x: HX, hop: 0, sq: 1, lean: 0, armL: 'down', armR: 'down', legPhase: null, view: 0, spin: 0, phones: t >= tOf(12) - .05 };
  const amp = kb >= 28 ? 40 : 26;
  const R = Math.round;
  // 默认：bounce（每拍 hop + 落地 squash）
  st.hop = Math.pow(Math.abs(Math.sin(Math.PI * frac)), .8) * amp;
  st.sq = frac > .82 ? 1 - .2 * Math.sin(Math.PI * (frac - .82) / .18) : 1;
  if (kb < 0) { st.hop = 0; }
  else if (kb < 1) {                                          // k0 drop-in
    const u = clamp((t - (tOf(0) - .18)) / .18);
    st.hop = lerp(560, 0, u * u);
    st.sq = u >= 1 ? .78 + .22 * Math.min(1, (t - tOf(0)) / .22) : 1;
    st.armL = st.armR = 'up';
  } else if (k === 6 || k === 34 || k === 63) { st.armL = st.armR = 'up'; if (k === 63) { st.sq = frac > .9 ? .8 : 1; } }
  else if (k === 7) { st.armR = 'reach'; st.x += 40 * eo(frac); }
  else if (k === 9 || k === 15) { st.view = -.6; }
  else if (k === 10 || (k >= 20 && k <= 23) || k === 55) { st.x += Math.sin(t * 3.4) * 16; st.lean = Math.sin(t * 3.4) * .3; }
  else if (k === 11) { st.hop *= .3; }
  else if (k === 13) { st.armR = 'up'; }
  else if (k === 14) { st.armL = frac < .5 ? 'up' : 'down'; st.armR = frac < .5 ? 'down' : 'up'; }
  else if (k === 16 || k === 17 || k === 40) { st.x += Math.sin(t * 11) * 10; }
  else if (k === 18) { st.hop = 0; st.view = .25; }
  else if (k === 19) { st.hop = 0; }
  else if (k === 22) { st.spin = seg(t, tOf(22), tOf(22) + .24); }
  else if (k === 24) { st.sq = .94; }
  else if (k === 27) { st.armR = 'reach'; st.hop *= .4; }
  else if (k === 28 || k === 29 || k === 30 || k === 46) { st.legPhase = (kb * 2) % 1; st.lean = .5; st.hop = Math.abs(Math.sin(Math.PI * frac * 2)) * 16; }
  else if (k === 31 || k === 51) { st.sq = frac > .45 && frac < .7 ? .82 : 1; st.lean = .2; }
  else if (k === 33) { st.x -= 90 * eo(frac); st.armL = st.armR = 'up'; }
  else if (k === 38) { st.view = 1; st.armR = 'reach'; st.armL = 'reach'; }
  else if (k === 41) { st.lean = Math.sin(t * 9) * .5; }
  else if (k === 45) { st.armR = 'reach'; }
  else if (k === 47) { st.view = .9; st.legPhase = (kb * 2) % 1; st.lean = .6; }
  else if (k === 49 || k === 50) { st.armL = frac < .5 ? 'down' : 'reach'; st.armR = frac < .5 ? 'reach' : 'down'; if (k === 50) { st.hop = Math.abs(Math.sin(Math.PI * frac * 2)) * 20; st.legPhase = (kb * 2) % 1; } }
  else if (k === 53) { st.legPhase = (kb * .8) % 1; st.lean = -.4; }
  else if (k === 59) { st.hop *= .3; }
  else if (k === 64) { st.hop = amp; st.sq = .92; }           // 定格 hop 最高点
  return st;
}

// ---------- 粉色残影调度 ----------
const G4 = [[1120, 720], [1330, 730], [1560, 725], [1430, 545]];   // R5 四残影脚底
const ERASE = [[tOf(46) + .30, .10], [tOf(46) + .10, .10], [tOf(47) + .40, .12], [tOf(49) + .25, .12]]; // [擦除时刻, 隐去时长] 对应 g0..g3
function ghostsAt(t) {
  const out = [];
  const add = (x, y, s, a, o = {}) => out.push({ x, y, s, alpha: a, tint: '#E58384', tintL: '#F2A3A4', tintD: '#B95E62', ht: 1, ...o });
  const kb = kAt(t);
  // —— R2 一问一答（一次比一次实） ——
  if (t >= tOf(13) + .235 && t < tOf(14)) add(1680, 760, .7, .4);
  if (t >= tOf(14) && t < tOf(15)) add(PX, 790, .85, .85, { wave: 1 });
  if (t >= tOf(15) && t < tOf(16)) add(PX, 790, .85, .45, { half: 1 });
  if (t >= tOf(16) && t < tOf(17.7)) add(PX, 800, .95, .95, { shimmy: 1 });
  if (t >= tOf(17.7) && t < tOf(18.6)) {                       // shrink into slot
    const u = eio(seg(t, tOf(17.7), tOf(18.5)));
    add(lerp(PX, 900, u), lerp(800, SLOT_Y, u), lerp(.95, .12, u), .9);
  }
  if (t >= tOf(18.7) && t < tOf(19.6)) add(PX, 780, .55, .4, { music: 1, eyeOnly: 1 });
  // k21 金色光带扫过时显形一帧
  const bx = seg(t, tOf(21), tOf(21) + .4) * 2200 - 140;
  if (t >= tOf(21) && t < tOf(22) && Math.abs(bx - PX) < 90) add(PX, 780, .8, .8);
  // k24-27 举牌打分
  if (t >= tOf(24.6) && t < tOf(27)) add(PX, 800, .9, .9, { card: t < tOf(26) ? 'front' : 'back' });
  // —— 15.68 四残影 drop-in ——
  if (t >= 15.68) {
    for (let i = 0; i < 4; i++) {
      const born = 15.68 + i * .06;
      if (t < born) continue;
      let a = .8, sc = .78 + hash(i) * .1;
      const drop = 1 - eo(seg(t, born, born + .3));
      const eraseT = ERASE[i][0];
      if (t >= eraseT) {                                           // 擦除：网点散掉
        const eu = seg(t, eraseT, eraseT + ERASE[i][1]);
        if (eu >= 1) continue;
        a *= (1 - eu); sc *= (1 - eu * .4);
        out[out.length - 1];
        scatterDots(t, G4[i][0], G4[i][1] - 160, eu);
        continue;
      }
      let sq = 1;
      if (kAt(t) >= 35.5 && kAt(t) < 36) sq = .8;                  // k35 反拍齐 squash
      if (kAt(t) >= 40 && kAt(t) < 42) { var sh = Math.sin(t * 11 + i * 1.3) * 8; }
      else sh = 0;
      const halfFace = i === 1 && kb >= 47 && kb < 47.8;
      const realOutline = i === 1 && kb >= 38 && kb < 39;
      add(G4[i][0] + (sh || 0), G4[i][1] - drop * 300, sc, realOutline ? 1 : a * .9, {
        sq, half: halfFace, ht: !realOutline, shimmy: kb >= 40 && kb < 42 ? 1 : 0, idx: i,
      });
    }
  }
  // k54 卡片反光里最后闪一帧
  if (kb >= 54 && kb < 54.25) add(HX + 130, 700, .5, .8);
  return out;
}
function scatterDots(t, x, y, u) {
  ctx.fillStyle = '#E58384';
  for (let i = 0; i < 14; i++) {
    const a = hash(i * 2 + 7) * Math.PI * 2, r = 30 + u * 130 * (.5 + hash(i));
    ctx.globalAlpha = 1 - u;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r * .7, 6 * (1 - u) + 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---------- 打分牌（0–10，翻面空白） ----------
function drawScoreCard(t) {
  if (kAt(t) < 24 || kAt(t) >= 27.4) return;
  let x = 960, y = 560, rot = 0, flip = 0, sc = 1;
  if (kAt(t) < 25) { const u = back(seg(t, tOf(24), tOf(24.3))); y = lerp(-260, 620, u * u > 1 ? 1 : u * u); }
  if (kAt(t) >= 26 && kAt(t) < 26.4) flip = seg(t, tOf(26), tOf(26.35));
  if (kAt(t) >= 27) { const u = eio(seg(t, tOf(27), tOf(27.5))); sc = 1 - u; y = lerp(560, SLOT_Y + 40, u); x = lerp(960, 900, u); if (sc <= 0) return; }
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot + Math.sin(t * 2) * .02); ctx.scale(sc * Math.abs(Math.cos(flip * Math.PI)) || .02, sc);
  if (Math.cos(flip * Math.PI) < 0) {                                      // 背面空白
    ctx.fillStyle = CREAM; roundRect(ctx, -110, -140, 220, 280, 14); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.stroke();
  } else {
    ctx.fillStyle = 'rgba(29,26,23,.3)'; roundRect(ctx, -96, -126, 220, 280, 14); ctx.fill();
    ctx.fillStyle = CREAM; roundRect(ctx, -110, -140, 220, 280, 14); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.stroke();
    text(ctx, '0 – 10', 0, -86, 40, INK, null, 0, HEI);
    line(ctx, -80, -52, 80, -52, 5, INK);
    text(ctx, '10', 0, 34, 130, '#E5484D', INK, 12, HEI);
  }
  ctx.restore();
}

// ---------- R7 传送带 / 白点河 ----------
function drawConveyor(t) {
  const kb = kAt(t);
  if (kb < 52 || kb >= 55.4) return;
  const speed = lerp(280, 560, seg(t, tOf(52), tOf(55)));
  const off = (t - tOf(52)) * speed;
  const melt = seg(t, tOf(55), tOf(55.5));                   // 漫过判定线成白点河
  for (let i = 0; i < 9; i++) {
    const x = 2200 - ((off + i * 250) % 2600);
    const y = lerp(600, 740, melt);
    const s = lerp(1, .7, melt);
    const flip = kb >= 53 ? (Math.sin(t * 3 + i) > 0 ? 1 : -1) : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * flip, s);
    ctx.fillStyle = 'rgba(29,26,23,.25)'; roundRect(ctx, -98, -62, 210, 140, 14); ctx.fill();
    ctx.fillStyle = CREAM; roundRect(ctx, -105, -70, 210, 140, 14); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.stroke();
    text(ctx, String(((i + 6) % 7) + 1).padStart(2, '0'), 0, 0, 56, INK, null, 0, HEI);
    ctx.restore();
  }
  if (melt > 0) {                                            // 白点河
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 60; i++) {
      const x = ((i * 137 - t * speed) % (W + 80) + W + 80) % (W + 80) - 40;
      const y = 700 + Math.sin(i * 3.1) * 60 + 90 * melt;
      ctx.beginPath(); ctx.arc(x, y, 7 + hash(i) * 6, 0, Math.PI * 2); ctx.fill();
    }
  }
}

// ---------- 顶视图（k32 俯视 / k56 顶视） ----------
function drawTopView(t, mode) {
  const r = roundAt(t);
  drawPattern(r, t);
  if (mode === 32) {
    const dy = -70 * eo(seg(t, tOf(32), tOf(32) + .2));
    ctx.save(); ctx.translate(0, dy);
    ctx.fillStyle = darkOf(r.bg, .55); roundRect(ctx, 60, 470, 1800, 150, 20); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.stroke();
    for (let i = 0; i < 9; i++) {
      const x = 160 + i * 200;
      ctx.fillStyle = 'rgba(29,26,23,.3)'; roundRect(ctx, x, 500, 150, 90, 10); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
      if (hash(i + tOf(0)) > .4) { ctx.fillStyle = r.ac; ctx.beginPath(); ctx.arc(x + 75, 545, 22, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = INK; ctx.stroke(); }
    }
    // 他缩成一个点
    ctx.fillStyle = '#D97757'; ctx.beginPath(); ctx.arc(560, 545, 30, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
    ctx.beginPath(); ctx.arc(560, 545, 44, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = 8; ctx.stroke();
    ctx.restore();
  } else {
    // k56 歌单河横贯
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    for (let i = 0; i < 80; i++) {
      const x = ((i * 97 - t * 420) % (W + 60) + W + 60) % (W + 60) - 30;
      const y = 470 + (i % 5) * 26;
      ctx.beginPath(); ctx.arc(x, y, 8 + hash(i) * 7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#D97757'; ctx.beginPath(); ctx.arc(900, 522, 26, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
  }
}

// ---------- 主渲染 ----------
window.DUR = DUR;
window.render = (t) => {
  ctx.clearRect(0, 0, W, H);
  const r = roundAt(t);
  const kb = kAt(t);
  const split = t >= 15.68 && kb < 44;                       // 裂成两半（至 R6 换景）
  const topMode = kb >= 32 && kb < 33 ? 32 : kb >= 56 && kb < 57 ? 56 : 0;

  // ---- 镜头 ----
  let camS = 1, cx = 960, cy = 540, camX = 0;
  if (kb >= 16 && kb < 20) { camS = 1.3; cy = 640; }         // medium two-shot
  if (kb >= 26 && kb < 27) { camS = 2; cx = 960; cy = 600; } // snap zoom 空牌
  if (kb >= 48 && kb < 49) { camS = 2; cx = 560; cy = 640; } // snap zoom 脸
  if (kb >= 53 && kb < 54.2) camX = -220 * seg(t, tOf(53), tOf(53) + .8);  // lateral track
  const punch = punchAt(t);
  ctx.save();
  ctx.translate(960, 540);
  ctx.scale(1 + punch + (camS - 1), 1 + punch + (camS - 1));
  ctx.translate(-cx, -cy);
  ctx.translate(camX + shakeAt(t) * 900, 0);

  // ---- 背景 / 舞台 ----
  if (topMode) { drawTopView(t, topMode); }
  else {
    if (split) {                                             // 裂成两半：右半 violet
      ctx.fillStyle = '#6C4BC4'; ctx.fillRect(960, 0, 960, H);
      ctx.save(); ctx.beginPath(); ctx.rect(960, 0, 960, H); ctx.clip();
      drawPattern(ROUNDS[5], t); ctx.restore();
      ctx.fillStyle = r.bg; ctx.fillRect(0, 0, 960, H);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 960, H); ctx.clip();
      drawPattern(r, t); ctx.restore();
      line(ctx, 960, 0, 960, H, 8, INK);                     // 中缝
    } else if (kb >= 58 && kb < 60) {                        // k58 半屏硬切 yellow
      ctx.fillStyle = ROUNDS[8].bg; ctx.fillRect(960, 0, 960, H);
      ctx.save(); ctx.beginPath(); ctx.rect(960, 0, 960, H); ctx.clip();
      drawPattern(ROUNDS[8], t); ctx.restore();
      ctx.fillStyle = r.bg; ctx.fillRect(0, 0, 960, H);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 960, H); ctx.clip();
      drawPattern(r, t); ctx.restore();
      line(ctx, 960, 0, 960, H, 8, INK);
    } else {
      ctx.fillStyle = r.bg; ctx.fillRect(0, 0, W, H);
      drawPattern(r, t);
    }
    drawFloor(t, split ? ROUNDS[5] : r, 0, W);
    // 判定线：split 时两条
    if (split) { drawJudgeLine(t, 0, 950, JY); drawJudgeLine(t, 970, W, JY + 14); }
    else drawJudgeLine(t, 0, W, JY);

    draw2PBox(t);
    drawBanner(t, r);
    drawScoreboard(t);
    drawSlots(t);
    drawRoundCard(t, r);
    drawCardSink(t);
    drawConveyor(t);

    // ---- 音符 ----
    const acNote = kb >= 58 ? INK : r.ac;
    for (const n of notesAt(t)) {
      if (n.ring != null) { ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.globalAlpha = 1 - n.ring / .12;
        ctx.beginPath(); ctx.arc(n.x, n.y, 24 + n.ring * 260, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
      else drawNote(ctx, n.x, n.y, kb >= 28 ? 1.1 : 1, acNote);
    }

    // ---- burst（强拍） ----
    for (const k of [6, 16, 25, 36, 38]) burst(ctx, HX, 620, tOf(k), t, '#FFD24A');
    if (t >= 15.68) burst(ctx, 960, 500, 15.68, t, '#FFD24A');

    // ---- 残影 ----
    for (const g of ghostsAt(t)) {
      const emo = g.realOutline ? {} : emoAt(t);
      const gb = kAt(t) >= 16 && kAt(t) < 17.7 ? Math.sin(t * 11) * -10 : 0;
      drawClawd(ctx, {
        x: g.x + (g.shimmy ? gb : 0), y: g.y, s: g.s, alpha: g.alpha,
        tint: g.tint, tintL: g.tintL, tintD: g.tintD, halfTone: g.ht,
        emo: { ...emo, eyes: undefined }, blink: false, phones: true,
        armL: g.wave ? 'up' : (g.card ? 'up' : 'down'), armR: g.wave ? 'down' : (g.card ? 'up' : 'down'),
        squashY: g.sq || 1, half: g.half, music: g.music, t,
      });
      // 半脸裁切
      // （drawClawd 之后用背景色盖掉左/右半边过于粗暴，改为半透明已由 ht/alpha 表达）
      if (g.card) drawScoreCard(t);
    }

    // ---- 主角 ----
    if (kb < 56 || kb >= 57) {
      const hs = heroAt(t);
      const blink = [1, 35, 61].some(k => Math.abs(t - (tOf(k) + .05)) < .1) ||
        (frac => frac > .3 && frac < .4 && Math.floor(kb) % 4 === 1)(kb - Math.floor(kb));
      // k22 / 15.68 spin：水平压缩翻面 + smear
      if (hs.spin > 0 && hs.spin < 1) {
        const u = hs.spin, c = Math.cos(u * Math.PI * 2);
        for (const [dx, al] of [[-16, .25], [16, .25], [0, 1]]) {
          ctx.save(); ctx.globalAlpha = al * (hs.spin < .9 ? 1 : 0);
          ctx.translate(hs.x + dx, 0); ctx.scale(Math.max(.08, Math.abs(c)) * (c < 0 ? -1 : 1), 1); ctx.translate(-hs.x, 0);
          drawClawd(ctx, { x: hs.x, y: JY - hs.hop, s: 1, tint: '#D97757', tintL: '#E9966F', tintD: '#A6502F', emo: emoAt(t), blink, phones: hs.phones, armL: hs.armL, armR: hs.armR, legPhase: hs.legPhase, lean: hs.lean, squashY: hs.sq, t });
          ctx.restore();
        }
      } else {
        drawClawd(ctx, { x: hs.x, y: JY - hs.hop, s: 1, tint: '#D97757', tintL: '#E9966F', tintD: '#A6502F', emo: emoAt(t), blink, phones: hs.phones, armL: hs.armL, armR: hs.armR, legPhase: hs.legPhase, lean: hs.lean, squashY: hs.sq, t,
          qMark: Math.floor(kb) === 7 || Math.floor(kb) === 45, hearts: kb >= 38 && kb < 39, spark: kb >= 57 && kb < 58, swirl: kb >= 41 && kb < 42, dots: kb >= 51 && kb < 52,
          gloom: (emoAt(t).mouth === 'frown' && kb >= 42) ? .6 : 0 });
      }
      // 落地尘（R4 起）
      if (kb >= 28 && kb < 52 && (kb % 1) > .82) {
        ctx.strokeStyle = 'rgba(29,26,23,.5)'; ctx.lineWidth = 5;
        const dy2 = (kb % 1 - .82) / .18;
        ctx.beginPath(); ctx.arc(hs.x - 90 - dy2 * 30, JY - 8 + dy2 * 14, 10, Math.PI, Math.PI * 1.8); ctx.stroke();
        ctx.beginPath(); ctx.arc(hs.x + 90 + dy2 * 30, JY - 8 + dy2 * 14, 10, Math.PI, Math.PI * 1.8); ctx.stroke();
      }
    }

    drawScoreCard(t);

    // ---- count-in 数字（R0 居中 / R8 右侧避开 round 卡） ----
    const count = (kOf, n, cx2 = 960, cy2 = 480) => { if (Math.floor(kb) === kOf) { const u = back(seg(t, tOf(kOf), tOf(kOf) + .15));
      ctx.save(); ctx.translate(cx2, cy2); ctx.scale(.5 + .5 * u, .5 + .5 * u); text(ctx, String(n), 0, 0, 230, CREAM, INK, 24, HEI); ctx.restore(); } };
    count(0, 3); count(1, 2);
    count(60, 3, 1560, 370); count(61, 2, 1560, 370); count(62, 1, 1560, 370);
    if (Math.floor(kb) === 63) { const u = back(seg(t, tOf(63), tOf(63) + .15)); ctx.save(); ctx.translate(960, 300); ctx.scale(.6 + .4 * u, .6 + .4 * u); text(ctx, 'PERFECT!', 0, 0, 150, '#FFD24A', INK, 20, HEI); ctx.restore(); }
    if (kb >= 64) { text(ctx, 'AGAIN?', 960, 470, 236, kb >= 64.2 ? '#E5484D' : CREAM, INK, 34, HEI); }
  }

  ctx.restore();                                              // 镜头结束

  // ---- 判定词（屏幕层 UI，特写/俯视时也在画面内） ----
  drawWords(t);

  // ---- 顶视图文字（不在镜头变换内） ----
  if (topMode === 32) text(ctx, 'READY', 960, 250, 150, CREAM, INK, 20, HEI);
  if (topMode === 56) text(ctx, 'CLEAR', 960, 250, 150, '#FFD24A', INK, 20, HEI);

  // ---- 字幕（不随镜头） ----
  drawSubs(t);

  // ---- 白闪 ----
  const fl = flashAt(t);
  if (fl) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H); }

  // ---- 结尾：冲击帧 + 硬切黑 ----
  if (t >= 30.144 && t < 30.178) {                            // 1 帧反相剪影冲击帧（放射线）
    ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = CREAM; ctx.lineWidth = 14;
    for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12;
      ctx.beginPath(); ctx.moveTo(960 + Math.cos(a) * 200, 540 + Math.sin(a) * 200);
      ctx.lineTo(960 + Math.cos(a) * 1500, 540 + Math.sin(a) * 1500); ctx.stroke(); }
    text(ctx, 'AGAIN?', 960, 540, 220, INK, CREAM, 0, HEI);
    ctx.save(); ctx.fillStyle = CREAM; roundRect(ctx, 860, 700, 200, 200, 40); ctx.fill(); ctx.restore();
  }
  if (t >= 30.178) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
};

window.READY = true;
