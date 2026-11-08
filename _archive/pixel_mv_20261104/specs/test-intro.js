// specs/test-intro.js — 测试片段 ·《我好想你》像素 RPG v5 · 序幕 0–22s
// 验证四件事：①黑场标题卡打字机 ②存档界面 ③12.43 重拍那一下够不够震 ④小镇全景
// node daily.mjs --spec=specs/test-intro.js --audio="D:/ai音乐mv/我好想你/苏打绿 - 我好想你 (苏打绿版).mp3" --out=out/test_intro.mp4 --no-cover

if (typeof PAL !== 'undefined') Object.assign(PAL, {
  ink: '#05080D', night: '#0E1B29', navy: '#1A2C40', slate: '#33506A',
  dusk: '#274A68', haze: '#7899B4', wall: '#202C3A', wallDk: '#161F2A',
  floor: '#2E2724', floorDk: '#1C1714', seaDk: '#19353F', steel: '#40607A',
  gold: '#FFD166', rose: '#E8556D', teal: '#4FA0A8', paper: '#F2EFE4',
  pale: '#C9C6DD', mint: '#9AD6C4',
});

const HIRES = (c, W, H) => W / 320;   // 320 空间 → 主画布

// ---------- 工具 ----------
function SHAKE(dur, amp) {
  return function (lt) {
    const p = Math.min(1, Math.max(0, lt / dur));
    const k = Math.pow(1 - p, 2);
    const dx = Math.sin(lt * 61.3) * amp * k;
    const dy = Math.cos(lt * 47.7) * amp * k * .8;
    const w = 320, h = 180;
    return [Math.max(-6, Math.min(6, dx)), Math.max(-4, Math.min(4, dy)), w, h];
  };
}
function CAM_pull(lt, dur, z0, z1, cx0, cy0) {
  const p = Math.min(1, Math.max(0, lt / dur));
  const e = 1 - Math.pow(1 - p, 2.2);
  const z = z0 + (z1 - z0) * e;
  const w = 320 / z, h = 180 / z;
  return [Math.min(Math.max(cx0 - w / 2, 0), 320 - w), Math.min(Math.max(cy0 - h / 2, 0), 180 - h), w, h];
}

// ---------- 小镇：三层屋脊（自上而下 = 由远及近） ----------
function house(c, x, y, w, h, wallCol, roofCol, seed) {
  R(c, x, y, w, h, wallCol);
  const r = Math.ceil(w / 2);
  for (let i = 0; i < r; i++) R(c, x + i, y - i - 1, w - 2 * i, 1, roofCol);
  // 烟囱
  const rnd = k => Math.abs(Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453) % 1;
  if (rnd(3) > .55) R(c, x + 3 + (rnd(4) * (w - 8) | 0), y - r - 4, 3, 4, roofCol);
  // 窗：2×3 点，按种子决定亮不亮
  const wy = y + Math.max(3, (h * .35) | 0);
  const cols = Math.max(1, Math.floor((w - 8) / 7));
  for (let i = 0; i < cols; i++) {
    const wx = x + 4 + i * 7;
    const on = rnd(i * 5 + j2(seed)) ;
    c.fillStyle = (on > .55) ? PAL.gold : (on > .42 ? '#8A6A32' : PAL.wallDk);
    c.fillRect(wx, wy, 2, 3);
    if (on > .55) { c.fillStyle = 'rgba(255,209,102,.20)'; c.fillRect(wx - 1, wy - 1, 4, 5); }
  }
}
const j2 = s => Math.round(s * 7 % 13);

function townBase(c, t) {
  // 天空：从墨到夜蓝（逐行平滑，避免大块棋盘纹）
  vgradS(c, 0, 0, 320, 118, PAL.ink, PAL.night);
  // 远处山脊（一条起伏的线，别画成细棍）
  c.fillStyle = '#0B1522';
  for (let x = 0; x < 320; x++) {
    const y = 78 + Math.sin(x * .021) * 7 + Math.sin(x * .053 + 1.7) * 3;
    c.fillRect(x, y, 1, 120);
  }
  // 第一层：远景小屋（小、暗、几乎不亮窗）
  let x = -6, s = 1;
  while (x < 330) { const w = 16 + (j2(s) % 9); house(c, x, 92, w, 12, '#16202E', '#101A26', s); x += w + 2; s++; }
  // 第二层：中景（窗开始亮）
  x = -10; s = 21;
  while (x < 330) { const w = 22 + (j2(s) % 13); house(c, x, 124, w, 18, PAL.navy, '#111C2A', s); x += w + 3; s++; }
  // 第三层：近景（最大，压在画面底部）
  x = -14; s = 41;
  while (x < 330) { const w = 30 + (j2(s) % 16); house(c, x, 168, w, 24, PAL.wallDk, PAL.ink, s); x += w + 4; s++; }
  // 街灯：唯一 gold 暖源（全片规矩）
  for (const lx of [62, 168, 262]) {
    R(c, lx, 150, 1, 22, PAL.ink);
    R(c, lx - 1, 148, 3, 3, PAL.gold);
    glow(c, lx, 149, 16, 14, PAL.gold, .30);
  }
  // 雨
  rain(c, t, 90, 'rgba(120,153,180,.45)', 1);
}

function townRose(c, k) {
  // 右上那扇 rose 窗：全片唯一"她"的颜色
  const x = 232, y = 96, w = 9, h = 12;
  R(c, x - 1, y - 1, w + 2, h + 2, PAL.ink);
  R(c, x, y, w, h, k > .5 ? PAL.rose : '#7A2E3E');
  R(c, x, y + Math.floor(h / 2), w, 1, PAL.ink);
  R(c, x + Math.floor(w / 2), y, 1, h, PAL.ink);
  glow(c, x + w / 2, y + h / 2, 20 + k * 6, 18, PAL.rose, .22 * k);
}

// ---------- 存档界面（320 层画框，字走高清层） ----------
const SLOTS = [
  { y: 40, h: 36, live: true },
  { y: 88, h: 36, live: false },
  { y: 136, h: 36, live: false },
];
function saveScreen(c, lt, live) {
  R(c, 0, 0, 320, 180, PAL.ink);
  // 背景：极暗的网格，暗示"系统"
  for (let y = 0; y < 180; y += 16) R(c, 0, y, 320, 1, '#080F18');
  for (let x = 0; x < 320; x += 16) R(c, x, 0, 1, 180, '#080F18');
  const blink = Math.floor(lt * 2.2) % 2 === 0;

  SLOTS.forEach((s, i) => {
    const x = 24, w = 272;
    // 外框
    R(c, x, s.y, w, s.h, s.live ? '#0C1A28' : '#0A121C');
    const bc = s.live ? (blink ? PAL.gold : '#B08A3E') : '#22303E';
    R(c, x, s.y, w, 1, bc); R(c, x, s.y + s.h - 1, w, 1, bc);
    R(c, x, s.y, 1, s.h, bc); R(c, x + w - 1, s.y, 1, s.h, bc);
    if (s.live) {
      // 槽 1：缩略图 —— 雨夜的窗
      const tx = x + 6, ty = s.y + 5, tw = 40, th = s.h - 10;
      R(c, tx, ty, tw, th, PAL.night);
      for (let yy = ty + 2; yy < ty + th - 2; yy += 5) R(c, tx + 2, yy, tw - 4, 1, '#16283C');
      R(c, tx + 12, ty + 4, 9, 10, PAL.rose);          // 她的窗
      glow(c, tx + 16, ty + 9, 14, 12, PAL.rose, .30);
      // 光标
      if (blink) {
        const cy = s.y + s.h / 2 | 0;
        R(c, x + 2, cy - 3, 2, 6, PAL.gold);
        R(c, x + 4, cy - 2, 1, 4, PAL.gold);
        R(c, x + 5, cy - 1, 1, 2, PAL.gold);
      }
    } else {
      // 空槽：虚线
      for (let dx = x + 8; dx < x + w - 8; dx += 4) R(c, dx, s.y + s.h - 3, 2, 1, '#1A2734');
    }
  });

  // 底部提示的底条
  R(c, 0, 176, 320, 4, '#070D14');
  // 顶部细线
  R(c, 0, 18, 320, 1, '#17232F');
  // 扫描光
  const sy = (live * 0.16) % 180;
  c.save(); c.globalAlpha = .06; c.fillStyle = '#8FB8D8';
  c.fillRect(0, sy, 320, 10); c.restore();
}

// ---------- 高清层文字 ----------
function txt(c, s, x, y, size, col, alpha, ls, align) {
  c.save();
  c.globalAlpha = alpha == null ? 1 : alpha;
  c.font = `${size}px KT, XK, serif`;
  c.fillStyle = col;
  c.textAlign = align || 'left';
  c.textBaseline = 'alphabetic';
  if (!ls) { c.fillText(s, x, y); c.restore(); return; }
  const chars = [...s];
  let w = 0; for (const ch of chars) w += c.measureText(ch).width + ls;
  let cx = align === 'center' ? x - (w - ls) / 2 : (align === 'right' ? x - (w - ls) : x);
  for (const ch of chars) { const cw = c.measureText(ch).width; c.fillText(ch, cx, y); cx += cw + ls; }
  c.restore();
}
function typeText(c, s, x, y, size, col, k, ls) {
  const chars = [...s];
  const n = Math.round(chars.length * Math.min(1, k));
  return { shown: chars.slice(0, n).join(''), rest: n };
}

// ============================================================
window.SPEC = {
  fps: 24, duration: 22.0, fadeIn: 0, fadeOut: .35,
  grade: 'brightness(1.10) saturate(1.02) contrast(1.10)',
  cover: 'A',
  palette: 'rpg-night',

  shots: [
    // ---- S01 0–6.12 黑场 + 打字机判词 ----
    {
      t0: 0, t1: 6.12, scene: 'black', cam: false, vig: .7,
      draw(pc) { R(pc, 0, 0, 320, 180, PAL.ink); },
    },

    // ---- S02 6.12–12.43 存档界面 ----
    {
      t0: 6.12, t1: 12.43, scene: 'save', cam: false, vig: .55,
      in: { type: 'dither', dur: .7 },
      draw(pc, lt) { saveScreen(pc, lt, 1); },
    },

    // ---- S03 12.43–15.59 重拍：像素重排砸亮 + 标题 ----
    {
      t0: 12.4167, t1: 15.59, scene: 'town', zs: 1, vig: .62,
      cast: '#4C7FB0', castA: .10,
      in: { type: 'flash', dur: .10, amt: 1 },
      cam: (() => {
        const sh = SHAKE(.55, 5);
        return lt => {
          const base = CAM_pull(lt, 3.16, 1.02, 1.12, 160, 96);
          if (lt > .6) return base;
          const s = sh(lt);
          return [base[0] + s[0] * .55, base[1] + s[1] * .55, base[2], base[3]];
        };
      })(),
      draw(pc, lt, shot, t) {
        const g = townCanvas();
        townBase(g, t); townRose(g, 1);
        // 先铺一层极暗 ghost 小镇（未点亮区不是纯黑，金波扫过才有对比）
        pc.drawImage(OFF, 0, 0);
        shadeRect(pc, 0, 0, 320, 180, .84);
        // 波浪式像素重排：从天到地（5px 块；窄渐亮带 + 一条金波前线）
        const p = Math.min(1, Math.max(0, (lt - .06) / .62));
        const thr = p * 1.10;
        for (let by = 0; by < 180; by += 5) {
          for (let bx = 0; bx < 320; bx += 5) {
            const o = (by / 180) * .88 + (BAYER[(by / 5) & 3][(bx / 5) & 3] / 16) * .12;
            if (o < thr - .035) {
              pc.drawImage(OFF, bx, by, 5, 5, bx, by, 5, 5);
            } else if (o < thr) {                    // 渐亮带：半透金
              pc.drawImage(OFF, bx, by, 5, 5, bx, by, 5, 5);
              pc.save(); pc.globalAlpha = .28;
              pc.fillStyle = PAL.gold; pc.fillRect(bx, by, 5, 5); pc.restore();
            } else if (o < thr + .010) {             // 波前金线
              pc.drawImage(OFF, bx, by, 5, 5, bx, by, 5, 5);
              pc.save(); pc.globalAlpha = .92;
              pc.fillStyle = PAL.gold; pc.fillRect(bx, by, 5, 5); pc.restore();
            }
          }
        }
        if (lt > .78) { // 全部到位后再补一帧雨
          rain(pc, t, 60, 'rgba(120,153,180,.35)', 1);
        }
      },
    },

    // ---- S04 15.59–21.9 俯瞰小镇 + HUD 首现 ----
    {
      t0: 15.59, t1: 22.01, scene: 'town', zs: 1, vig: .58,
      cast: '#4C7FB0', castA: .07,
      in: { type: 'dither', dur: .6 },
      cam: lt => CAM_pull(lt, 6.31, 1.16, 1.02, 160, 92),
      draw(pc, lt, shot, t) {
        townBase(pc, t);
        townRose(pc, .8 + Math.sin(t * 2.2) * .2);
        // 前景屋顶压一层暗（主体之外全压暗）
        shadeRect(pc, 0, 160, 320, 20, .55);
      },
    },
  ],

  // ---- 高清层：所有文字都在这里（320 层画中文会糊） ----
  hud(c, W, H, t) {
    const X = x => x * 6;   // 1920/320
    const Y = y => y * 6;   // 1080/180

    // ===== S01 黑场判词 =====
    if (t >= 0 && t < 6.12) {
      const k = Math.min(1, Math.max(0, (t - .55) / 1.5));
      const a = Math.min(1, Math.max(0, (6.12 - t) / .5));
      // 上下分隔线
      const lw = Math.min(1, Math.max(0, (t - .35) / .9)) * 620;
      c.save(); c.globalAlpha = a * .34; c.fillStyle = PAL.pale;
      c.fillRect(W / 2 - lw / 2, H * .40, lw, 2);
      c.fillRect(W / 2 - lw / 2, H * .68, lw, 2);
      c.restore();

      const s1 = '第 1095 天。';
      const n1 = Math.round([...s1].length * k);
      txt(c, [...s1].slice(0, n1).join(''), W / 2, H * .565, 132, PAL.paper, a, 16, 'center');

      const k2 = Math.min(1, Math.max(0, (t - 2.0) / 1.2));
      if (k2 > 0) {
        const s2 = '他数错了。其实是第 1096 天。';
        const n2 = Math.round([...s2].length * k2);
        txt(c, [...s2].slice(0, n2).join(''), W / 2, H * .745, 40, 'rgba(201,198,221,.80)', a, 6, 'center');
      }
      // 左上系统标
      txt(c, 'SAVE 01 / 1095 DAYS', 92, 108, 24, 'rgba(201,198,221,.45)', a, 3);
      // 打字机光标
      if (Math.floor(t * 2.4) % 2 === 0 && k < 1) {
        const w = (() => { c.font = '132px KT, serif'; let w = 0; for (const ch of [...s1].slice(0, n1)) w += c.measureText(ch).width + 16; return w; })();
        c.save(); c.globalAlpha = a; c.fillStyle = PAL.gold; c.fillRect(W / 2 + w / 2, H * .565 - 96, 8, 100); c.restore();
      }
    }

    // ===== S02 存档界面 =====
    if (t >= 6.12 && t < 12.43) {
      const lt = t - 6.12;
      const a = Math.min(1, lt / .6) * Math.min(1, Math.max(0, (12.43 - t) / .35));
      const blink = Math.floor(lt * 2.2) % 2 === 0;

      txt(c, 'L O A D   G A M E', W / 2, 132, 30, 'rgba(201,198,221,.62)', a, 0, 'center');

      const rows = [
        ['第 0 天 · 有她的雨夜', '1095 DAYS AGO'],
        ['——— 空 ———', 'NO DATA'],
        ['——— 空 ———', 'NO DATA'],
      ];
      SLOTS.forEach((s, i) => {
        const baseY = Y(s.y) + Y(s.h) / 2 + 12;
        const live = s.live;
        txt(c, rows[i][0], X(84), baseY, live ? 40 : 32,
          live ? PAL.paper : 'rgba(120,153,180,.45)', a, live ? 3 : 4);
        txt(c, rows[i][1], X(296) - 12, baseY - (live ? 0 : 0), live ? 22 : 20,
          live ? 'rgba(255,209,102,.85)' : 'rgba(120,153,180,.30)', a, 3, 'right');
      });

      // 底部提示
      const hy = Y(168);
      if (blink) txt(c, '▶  读档', X(296), hy, 30, PAL.gold, a * .95, 4, 'right');
      else txt(c, '   读档', X(296), hy, 30, 'rgba(255,209,102,.35)', a * .95, 4, 'right');
    }

    // ===== S03 12.43 标题砸落 =====
    if (t >= 12.4167 && t < 15.59) {
      const lt = t - 12.43;
      const p = Math.min(1, lt / .22);
      const gs = 1.55 - .55 * (1 - Math.pow(1 - p, 3));
      const out = Math.min(1, Math.max(0, (15.59 - t) / .45));
      // 标题背光
      c.save();
      c.globalAlpha = .22 * out;
      const gr = c.createLinearGradient(0, H * .30, 0, H * .72);
      gr.addColorStop(0, 'rgba(0,0,0,0)');
      gr.addColorStop(.5, 'rgba(5,8,13,.92)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gr; c.fillRect(0, H * .28, W, H * .46);
      c.restore();

      c.save();
      c.globalAlpha = out;
      c.translate(W / 2, H * .50);
      c.scale(gs, gs);
      // 描边（硬，不用柔光）
      c.font = '196px XK, KT, serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = '#0B1119';
      for (const [dx, dy] of [[-6, 0], [6, 0], [0, -6], [0, 6], [-4, -4], [4, -4], [-4, 4], [4, 4]])
        c.fillText('我好想你', dx, dy);
      c.fillStyle = PAL.paper;
      c.fillText('我好想你', 0, 0);
      c.restore();

      // 英文小标
      const k3 = Math.min(1, Math.max(0, (lt - .45) / .6));
      if (k3 > 0) txt(c, 'I   M I S S   Y O U', W / 2, H * .645, 26 + k3 * 0, 'rgba(255,209,102,.75)', k3 * out, 6, 'center');
    }

    // ===== S04 HUD 首现（日期戳 + 计数器 + 对话条） =====
    if (t >= 15.59) {
      const lt = t - 15.59;
      const a = Math.min(1, Math.max(0, (lt - .5) / .9));
      if (a > 0) {
        // 日期戳（带底带，保证雨夜里读得清）
        c.save(); c.globalAlpha = a * .72; c.fillStyle = 'rgba(8,13,20,.85)';
        c.fillRect(72, 82, 320, 84); c.restore();
        c.save(); c.globalAlpha = a * .9;
        c.fillStyle = PAL.gold; c.fillRect(84, 94, 3, 30);
        c.restore();
        txt(c, '第 1095 天', 104, 122, 30, 'rgba(230,238,246,.94)', a, 4);
        txt(c, '雨', 104, 152, 22, 'rgba(150,178,204,.80)', a, 4);

        // 计数器
        c.save(); c.globalAlpha = a * .72; c.fillStyle = 'rgba(8,13,20,.85)';
        c.fillRect(W - 392, 76, 320, 92); c.restore();
        txt(c, '未 说 出 口', W - 112, 108, 24, 'rgba(170,196,220,.88)', a, 4, 'right');
        txt(c, '× 0000', W - 112, 154, 44, PAL.gold, a, 4, 'right');

        // 底部对话条（金边暗底，预告全片对话框语法）
        const bx = 120, by = H - 168, bw = W - 240, bh = 108;
        c.save(); c.globalAlpha = a * .92;
        c.fillStyle = 'rgba(10,14,20,.88)'; c.fillRect(bx, by, bw, bh);
        c.fillStyle = 'rgba(240,211,172,.75)';
        c.fillRect(bx, by, bw, 2); c.fillRect(bx, by + bh - 2, bw, 2);
        c.fillRect(bx, by, 2, bh); c.fillRect(bx + bw - 2, by, 2, bh);
        c.restore();
        txt(c, '▶', bx + 32, by + 70, 30, PAL.gold, a * .95, 0);
        txt(c, '（伞下只有一个人。）', bx + 78, by + 72, 32, 'rgba(234,240,246,.85)', a * .95, 3);
      }
    }
  },

  subs: [],
  nar: [],
};

// 320 离屏画布（S03 重排用）
let OFF = null;
function townCanvas() {
  if (!OFF) { OFF = document.createElement('canvas'); OFF.width = 320; OFF.height = 180; }
  const g = OFF.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, 320, 180);
  return g;
}
