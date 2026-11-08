// ============================================================
//  文字数据：歌词字幕 / NPC 对话 / 括号泡 / 计数器
// ============================================================
const SUBS = [
  { t0: 38.40, t1: 42.60, text: '开了灯 眼前的模样', kw: ['开了灯'] },
  { t0: 42.77, t1: 47.20, text: '偌大的房 寂寞的床', kw: ['寂寞'] },
  { t0: 50.99, t1: 55.45, text: '关了灯 全都一个样', kw: ['关了灯'] },
  { t0: 55.37, t1: 61.40, text: '心里的伤 无法分享', kw: ['伤'] },
  { t0: 61.56, t1: 67.40, text: '生命 随年月流去 随白发老去', kw: ['白发', '老去'] },
  { t0: 69.10, t1: 74.90, text: '随着你离去 快乐渺无音讯', kw: ['离去'] },
  { t0: 75.81, t1: 81.10, text: '随往事淡去 随梦境睡去', kw: ['往事', '睡去'] },
  { t0: 81.74, t1: 86.30, text: '随麻痹的心逐渐远去', kw: ['远去'] },
  { t0: 86.53, t1: 92.90, text: '我好想你 好想你', kw: ['想你', '好想你'], size: 96 },
  { t0: 93.01, t1: 98.90, text: '却不露痕迹', kw: ['痕迹'] },
  { t0: 99.57, t1: 105.40, text: '我还踮着脚思念', kw: ['思念'] },
  { t0: 105.91, t1: 111.70, text: '我还任记忆盘旋', kw: ['记忆'] },
  { t0: 112.26, t1: 118.00, text: '我还闭着眼流泪', kw: ['流泪'] },
  { t0: 118.45, t1: 124.30, text: '我还装作无所谓', kw: ['无所谓'] },
  { t0: 124.36, t1: 129.10, text: '我好想你 好想你', kw: ['想你', '好想你'], size: 96 },
  { t0: 130.97, t1: 133.60, text: '却欺骗自己', kw: ['欺骗'] },
  { t0: 164.77, t1: 169.00, text: '开了灯 眼前的模样', kw: ['开了灯'] },
  { t0: 169.02, t1: 176.80, text: '偌大的房 寂寞的床', kw: ['寂寞'] },
  { t0: 177.32, t1: 181.40, text: '关了灯 全都一个样', kw: ['关了灯'] },
  { t0: 181.59, t1: 187.90, text: '心里的伤 无法分享', kw: ['伤'] },
  { t0: 188.01, t1: 195.30, text: '生命 随年月流去 随白发老去', kw: ['白发', '老去'] },
  { t0: 195.41, t1: 202.00, text: '随着你离去 快乐渺无音讯', kw: ['离去'] },
  { t0: 202.11, t1: 208.00, text: '随往事淡去 随梦境睡去', kw: ['往事', '睡去'] },
  { t0: 208.10, t1: 212.70, text: '随麻痹的心逐渐远去', kw: ['远去'] },
  { t0: 212.82, t1: 219.10, text: '我好想你 好想你', kw: ['想你', '好想你'], size: 96 },
  { t0: 219.33, t1: 225.30, text: '却不露痕迹', kw: ['痕迹'] },
  { t0: 225.92, t1: 231.60, text: '我还踮着脚思念', kw: ['思念'] },
  { t0: 232.16, t1: 237.90, text: '我还任记忆盘旋', kw: ['记忆'] },
  { t0: 238.38, t1: 244.20, text: '我还闭着眼流泪', kw: ['流泪'] },
  { t0: 244.78, t1: 250.40, text: '我还装作无所谓', kw: ['无所谓'] },
  { t0: 253.93, t1: 260.00, text: '我好想你 好想你', kw: ['想你', '好想你'], size: 96 },
  { t0: 260.41, t1: 266.30, text: '却欺骗自己', kw: ['欺骗'] },
  { t0: 266.50, t1: 272.70, text: '我好想你 好想你', kw: ['想你', '好想你'], size: 96 },
  { t0: 272.98, t1: 279.00, text: '就当作秘密', kw: ['秘密'] },
  { t0: 279.10, t1: 285.30, text: '我好想你 好想你', kw: ['想你', '好想你'], size: 96 },
  { t0: 285.74, t1: 291.60, text: '就深藏在心', kw: ['深藏'] },
];

// NPC 对话（金边框 + 打字机）；opts 有选项支
const DLG = [
  { t0: 65.30, t1: 69.00, who: '小满', text: '今天的雏菊很新鲜哦。', opts: ['买一束', '算了'], sel: 0 },
  { t0: 70.70, t1: 75.60, who: '阿飞', text: '有你的信吗？……没有。' },
  { t0: 76.60, t1: 81.60, who: '陈伯', text: '（没抬头）别催，慢工才准。' },
  { t0: 119.10, t1: 124.20, who: '大乔', text: '老样子？' },
  { t0: 165.60, t1: 170.20, who: '我', text: '我回来了。', self: true },
  { t0: 182.70, t1: 188.00, who: '老周', text: '出炉了，刚出炉。……她以前也爱等第一炉。' },
  { t0: 196.10, t1: 202.00, who: '阿飞', text: '今天也没有哦。' },
  { t0: 202.90, t1: 208.20, who: '陈伯', text: '修不好了。有些东西停下来，是它自己不肯走。' },
  { t0: 220.10, t1: 225.30, who: '小孩', text: '哥哥，你哭过吗？' },
  { t0: 245.30, t1: 250.50, who: '大乔', text: '两杯？' },
  { t0: 254.70, t1: 260.10, who: '售票员', text: '去哪？', opts: ['小镇外面', '她去过的地方'], sel: 0 },
  { t0: 292.20, t1: 295.70, who: '系统', text: '是否保存当前进度？', opts: ['是', '否'], sel: 0, sys: true },
  { t0: 296.60, t1: 302.00, who: '系统', text: '检测到未寄出的信 ×1。是否同时保存？', opts: ['是', '否'], sel: 0, sys: true },
  { t0: 302.40, t1: 308.30, who: '系统', text: '已保存。', sys: true },
];

// 括号泡（没说出口的话）
const THINK = [
  { t0: 72.90, t1: 75.90, text: '（有一封，我一直没敢寄。）', x: 300, y: 300 },
  { t0: 170.70, t1: 173.00, text: '（习惯是戒不掉的。）', x: 360, y: 300 },
  { t0: 198.60, t1: 202.00, text: '（差一点就寄了。）', x: 300, y: 300 },
  { t0: 204.40, t1: 208.20, text: '（那你为什么还修？）', x: 300, y: 300 },
  { t0: 222.40, t1: 225.30, text: '（没有。是雪化了。）', x: 300, y: 300 },
];

// 计数器关键帧
const CNT = [
  [0, 0], [15.6, 0], [65.2, 1], [71.2, 2], [77.2, 3], [83.6, 4], [92.0, 5],
  [130.0, 5], [133.0, 102], [184.5, 103], [199.0, 104], [212.0, 500], [221.0, 570],
  [268.0, 1095], [302.4, 1095],
];
function cntAt(t) {
  if (t < CNT[0][0]) return 0;
  for (let i = 0; i < CNT.length - 1; i++) {
    if (t >= CNT[i][0] && t < CNT[i + 1][0]) {
      const p = (t - CNT[i][0]) / Math.max(.001, CNT[i + 1][0] - CNT[i][0]);
      return Math.round(CNT[i][1] + (CNT[i + 1][1] - CNT[i][1]) * p);
    }
  }
  return 1095;
}

// ============================================================
//  高清层：所有中文都画在这里（320 层画会糊）
// ============================================================
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
function band(c, x, y, w, h, col, a) {
  c.save(); c.globalAlpha = a; c.fillStyle = col; c.fillRect(x, y, w, h); c.restore();
}
function frame(c, x, y, w, h, col, a, t) {
  c.save(); c.globalAlpha = a; c.fillStyle = col;
  const t2 = t || 2;
  c.fillRect(x, y, w, t2); c.fillRect(x, y + h - t2, w, t2);
  c.fillRect(x, y, t2, h); c.fillRect(x + w - t2, y, t2, h);
  c.restore();
}

function hud(c, W, H, t) {
  const Y = y => y * 6;
  const BAYER4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

  // ---------- S01 黑场判词 ----------
  if (t < 6.12) {
    const k = HZ((t - .55) / 1.5), a = Math.min(1, HZ((6.12 - t) / .5));
    const lw = HZ((t - .35) / .9) * 620;
    band(c, W / 2 - lw / 2, H * .40, lw, 2, PAL.pale, a * .34);
    band(c, W / 2 - lw / 2, H * .68, lw, 2, PAL.pale, a * .34);
    const s1 = '第 1095 天。';
    const n1 = Math.round([...s1].length * k);
    txt(c, [...s1].slice(0, n1).join(''), W / 2, H * .565, 128, PAL.paper, a, 16, 'center');
    const k2 = HZ((t - 2.0) / 1.2);
    if (k2 > 0) {
      const s2 = '他数错了。其实是第 1096 天。';
      txt(c, [...s2].slice(0, Math.round([...s2].length * k2)).join(''), W / 2, H * .745, 40, 'rgba(201,198,221,.80)', a, 6, 'center');
    }
    txt(c, 'SAVE 01 / 1095 DAYS', 92, 108, 24, 'rgba(201,198,221,.45)', a, 3);
  }

  // ---------- S02 存档界面 ----------
  if (t >= 6.12 && t < 12.4167) {
    const lt = t - 6.12, a = Math.min(1, lt / .6) * Math.min(1, HZ((12.4167 - t) / .35));
    const blink = Math.floor(lt * 2.2) % 2 === 0;
    txt(c, 'L O A D   G A M E', W / 2, 132, 30, 'rgba(201,198,221,.62)', a, 0, 'center');
    const rows = [['第 0 天 · 有她的雨夜', '1095 DAYS AGO'], ['——— 空 ———', 'NO DATA'], ['——— 空 ———', 'NO DATA']];
    [[40, 36], [88, 36], [136, 36]].forEach((s, i) => {
      const baseY = Y(s[0]) + Y(s[1]) / 2 + 12, live = i === 0;
      txt(c, rows[i][0], W * .14, baseY, live ? 40 : 32, live ? PAL.paper : 'rgba(120,153,180,.45)', a, live ? 3 : 4);
      txt(c, rows[i][1], W * .92, baseY, live ? 22 : 20, live ? 'rgba(255,209,102,.85)' : 'rgba(120,153,180,.30)', a, 3, 'right');
    });
    txt(c, blink ? '▶  读档' : '   读档', W * .92, Y(168), 30, blink ? PAL.gold : 'rgba(255,209,102,.35)', a * .95, 4, 'right');
  }

  // ---------- S03 标题砸落 ----------
  if (t >= 12.4167 && t < 15.59) {
    const lt = t - 12.4167;
    const p = Math.min(1, lt / .22), gs = 1.55 - .55 * (1 - Math.pow(1 - p, 3));
    const out = HZ((15.59 - t) / .45);
    const gr = c.createLinearGradient(0, H * .30, 0, H * .72);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.5, 'rgba(5,8,13,.92)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    band(c, 0, H * .28, W, H * .46, gr, .22 * out);
    c.save(); c.globalAlpha = out; c.translate(W / 2, H * .50); c.scale(gs, gs);
    c.font = '196px XK, KT, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#0B1119';
    for (const [dx, dy] of [[-6, 0], [6, 0], [0, -6], [0, 6], [-4, -4], [4, -4], [-4, 4], [4, 4]]) c.fillText('我好想你', dx, dy);
    c.fillStyle = PAL.paper; c.fillText('我好想你', 0, 0);
    c.restore();
    const k3 = HZ((lt - .45) / .6);
    if (k3 > 0) txt(c, 'I   M I S S   Y O U', W / 2, H * .645, 26, 'rgba(255,209,102,.75)', k3 * out, 6, 'center');
  }

  // ---------- HUD 三件套（15.6 之后全程） ----------
  if (t >= 15.59) {
    const a = Math.min(1, HZ((t - 16.1) / .9));
    if (a > 0) {
      const snow = t >= 133.0, dawn = t >= 317.5;
      const day = t >= 320 ? 1096 : 1095;
      band(c, 72, 82, 320, 84, 'rgba(8,13,20,.80)', a * .8);
      band(c, 84, 94, 3, 30, PAL.gold, a * .9);
      txt(c, '第 ' + day + ' 天', 104, 122, 30, 'rgba(230,238,246,.94)', a, 4);
      txt(c, dawn ? '晴' : snow ? '雪' : '雨', 104, 152, 22, 'rgba(150,178,204,.80)', a, 4);

      // 计数器：1095 之后碎裂成「已寄存 ×1」
      const shatter = HZ((t - 302.4) / 1.4);
      band(c, W - 392, 76, 320, 92, 'rgba(8,13,20,.80)', a * .8);
      if (shatter < .55) {
        txt(c, '未 说 出 口', W - 112, 108, 24, 'rgba(170,196,220,.88)', a, 4, 'right');
        const n = cntAt(t);
        txt(c, '× ' + String(n).padStart(4, '0'), W - 112, 154, 44, PAL.gold, a * (1 - shatter), 4, 'right');
      } else {
        txt(c, '已  寄  存', W - 112, 108, 24, 'rgba(255,209,102,.92)', a, 4, 'right');
        txt(c, '× 1', W - 112, 154, 44, PAL.gold, a * HZ((shatter - .55) / .3), 4, 'right');
      }
    }
  }

  // ---------- 车站屏（green → red） ----------
  if (t >= 118 && t < 133.7) {
    const a = Math.min(1, HZ((t - 118) / .5)) * Math.min(1, HZ((133.7 - t) / .4));
    const gone = t >= 124.47;
    const col = gone ? '#E8556D' : '#6FD3A8';
    const bx = 22 * 6, by = 50 * 6, bw = 110 * 6, bh = 54 * 6;
    band(c, bx, by, bw, bh, 'rgba(6,10,16,.55)', a);
    txt(c, '末班车  21:10', bx + bw / 2, by + 70, 34, 'rgba(201,198,221,.88)', a, 2, 'center');
    const sz = gone ? 52 : 40;
    txt(c, gone ? '已 发 车' : '检 票 中', bx + bw / 2, by + 150, sz, col, a, 4, 'center');
    if (gone) txt(c, '— — —', bx + bw / 2, by + 200, 24, 'rgba(232,85,109,.6)', a * .8, 6, 'center');
    else txt(c, 'PLATFORM 2', bx + bw / 2, by + 196, 20, 'rgba(111,211,168,.72)', a * .8, 4, 'center');
  }

  // ---------- 背包 ----------
  if (t >= 55.37 && t < 61.56) {
    const a = Math.min(1, HZ((t - 55.5) / .5)) * Math.min(1, HZ((61.56 - t) / .3));
    txt(c, '背 包', 60, 96, 26, 'rgba(201,198,221,.7)', a, 5);
    txt(c, '未寄出的信 ×1', 216, 96, 30, PAL.paper, a, 2);
    txt(c, '她的发圈 ×1', 216, 258, 30, 'rgba(180,196,214,.55)', a, 2);
    txt(c, '（灰字 · 不可用）', 216, 296, 20, 'rgba(150,178,204,.55)', a, 2);
    txt(c, '▶', 84, 330, 26, PAL.gold, a, 0);
  }
  if (t >= 279.18 && t < 285.49) {
    const a = Math.min(1, HZ((t - 279.3) / .5)) * Math.min(1, HZ((285.49 - t) / .3));
    txt(c, '背 包', 60, 96, 26, 'rgba(201,198,221,.7)', a, 5);
    txt(c, '未寄出的信', 100, 330, 26, PAL.paper, a * .95, 2);
    txt(c, '她的发圈', 452, 330, 26, PAL.paper, a * .95, 2);
    txt(c, '停摆的怀表', 800, 330, 26, PAL.paper, a * .95, 2);
    txt(c, '（三样，都还在。）', W / 2, 920, 28, 'rgba(180,196,214,.7)', a * .9, 3, 'center');
  }

  // ---------- 车票特写（S46：票面内容文字化） ----------
  if (t >= 260.2 && t < 266.52) {
    const lt = t - 260.2;
    const out = Math.min(1, HZ((266.52 - t) / .3));
    const L = (d, dr) => Math.min(1, HZ((lt - d) / dr)) * out;
    const cx = 960;
    // 头部（印刷体）
    txt(c, '小 镇 长 途 · 单 程', cx, 296, 30, '#5E594C', L(.45, .4), 6, 'center');
    // 开往
    txt(c, '开往：她住过的城市', 436, 478, 34, '#3E3A2E', L(.9, .4), 3);
    // 日期：印刷 + 红笔涂改
    txt(c, '日期', 436, 606, 26, '#6A6558', L(1.4, .35), 3);
    txt(c, '第 0 天', 600, 608, 30, '#3E3A2E', L(1.4, .35), 3);
    // 划掉印刷日期的红笔道
    const sk = Math.min(1, Math.max(0, (lt - 2.0) / .35));
    if (sk > 0) band(c, 594, 596, 178 * sk, 5, '#B0433F', .92 * out);
    // 手写「第 1095 天」（逐字 + 抖动）
    const hw = '第 1095 天', hcs = [...hw];
    hcs.forEach((ch, i) => {
      const a = Math.min(1, HZ((lt - 2.15 - i * .13) / .12)) * out;
      if (a > 0 && ch !== ' ') txt(c, ch, 588 + i * 36, 672 + ((i * 37) % 5) - 2, 30, '#B0433F', a, 1);
    });
    // 发车 / 座号
    txt(c, '发车：21:10', 436, 788, 26, '#3E3A2E', L(2.9, .35), 2);
    txt(c, '座号：21 – 07', 906, 788, 26, '#3E3A2E', L(3.1, .35), 2);
    // 底部小字
    txt(c, 'ONE WAY · 检票后作废', cx, 852, 18, '#8A8578', L(3.4, .4), 4, 'center');
    // 「改」字红章（斜盖）
    const sa = Math.min(1, HZ((lt - 2.6) / .18)) * out;
    if (sa > 0) {
      c.save(); c.translate(1170, 330); c.rotate(-.18);
      c.globalAlpha = sa * .85; c.strokeStyle = '#B0433F'; c.lineWidth = 4;
      c.strokeRect(-38, -38, 76, 76); c.strokeRect(-32, -32, 64, 64);
      c.fillStyle = '#B0433F'; c.font = '46px KT, XK, serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('改', 0, 4);
      c.restore();
    }
  }

  // ---------- 结局文案 ----------
  if (t >= 291.81 && t < 295.76) {
    const a = Math.min(1, HZ((t - 291.95) / .35));
    txt(c, '是 否 保 存 当 前 进 度 ？', W / 2, 400, 44, 'rgba(234,240,246,.95)', a, 4, 'center');
    txt(c, '▶ 是', W / 2 - 160, 520, 36, PAL.gold, a, 4, 'center');
    txt(c, '否', W / 2 + 160, 520, 36, 'rgba(150,178,204,.6)', a, 4, 'center');
    txt(c, 'SAVE 02 / NOW', 92, 108, 22, 'rgba(201,198,221,.45)', a, 3);
  }
  if (t >= 302.08 && t < 308.39) {
    const a = Math.min(1, HZ((t - 302.2) / .4)) * Math.min(1, HZ((308.39 - t) / .4));
    txt(c, '已 保 存', W / 2, 470, 52, PAL.gold, a, 8, 'center');
    txt(c, '存档位置：心里（1/1）', W / 2, 530, 26, 'rgba(201,198,221,.72)', a, 3, 'center');
  }
  if (t >= 308.39 && t < 313.3) {
    const a = Math.min(1, HZ((t - 308.9) / .8));
    // 三个气泡，都写着同一句
    [[250, 430], [610, 470], [980, 430], [1330, 470]].forEach((p, i) => {
      const k = HZ((t - 309.0 - i * .28) / .5);
      if (k <= 0) return;
      const s = '一路顺风。';
      c.save(); c.globalAlpha = k * .96;
      c.font = '28px KT, serif';
      const tw = c.measureText(s).width + 40;
      c.fillStyle = 'rgba(244,240,230,.92)';
      c.fillRect(p[0], p[1], tw, 56);
      c.fillStyle = 'rgba(10,14,20,.9)'; c.fillRect(p[0], p[1], tw, 2);
      c.fillRect(p[0], p[1] + 54, tw, 2);
      c.restore();
      txt(c, s, p[0] + 20, p[1] + 40, 28, 'rgba(20,26,34,.92)', k, 3);
    });
  }
  if (t >= 323.0) {
    const k = HZ((t - 323.4) / 1.4), a = Math.min(1, HZ((329.21 - t) / 1.2));
    txt(c, [...'第 1096 天。'].slice(0, Math.round([...'第 1096 天。'].length * k)).join(''), W / 2, H * .50, 96, PAL.paper, a, 12, 'center');
    const k2 = HZ((t - 325.4) / 1.2);
    if (k2 > 0) txt(c, '他终于没有数错。', W / 2, H * .63, 34, 'rgba(201,198,221,.75)', a, 8, 'center');
  }

  // ---------- NPC 对话（金边框 + 打字机） ----------
  for (const d of DLG) {
    if (t < d.t0 || t >= d.t1) continue;
    const lt = t - d.t0, dur = d.t1 - d.t0;
    const a = Math.min(1, lt / .2) * Math.min(1, HZ((d.t1 - t) / .25));
    const k = Math.min(1, Math.max(0, (lt - .12) / Math.min(1.8, dur * .55)));
    const bx = 110, by = H * .655, bw = W - 220, bh = 136;
    band(c, bx, by, bw, bh, 'rgba(10,14,20,.90)', a);
    frame(c, bx, by, bw, bh, d.sys ? '#8FB8D8' : '#F0D3AC', a * .85, 2);
    // 名字标签
    const nameCol = d.sys ? '#8FB8D8' : d.self ? '#F0D3AC' : PAL.gold;
    band(c, bx + 24, by - 40, Math.max(120, [...d.who].length * 32 + 40), 40, 'rgba(10,14,20,.95)', a);
    frame(c, bx + 24, by - 40, Math.max(120, [...d.who].length * 32 + 40), 40, nameCol, a * .7, 2);
    txt(c, d.who, bx + 44, by - 8, 26, nameCol, a, 3);
    // 正文（打字机）
    const chars = [...d.text];
    const n = Math.round(chars.length * k);
    txt(c, chars.slice(0, n).join(''), bx + 44, by + 84, 34, d.self ? '#F6E4C8' : PAL.paper, a, 2);
    // 打字机光标
    if (k < 1 && Math.floor(t * 6) % 2 === 0) {
      c.save(); c.globalAlpha = a;
      c.font = '34px KT, serif';
      let cw = 0; for (const ch of chars.slice(0, n)) cw += c.measureText(ch).width + 2;
      c.fillStyle = PAL.gold; c.fillRect(bx + 44 + cw + 4, by + 56, 14, 32);
      c.restore();
    }
    // 选项支
    if (d.opts && k > .6) {
      const ox = bx + bw - 380, oy = by - 40;
      d.opts.forEach((o, i) => {
        const on = i === d.sel;
        const w2 = 160, x2 = ox + i * 176;
        band(c, x2, oy, w2, 44, on ? 'rgba(255,209,102,.16)' : 'rgba(10,14,20,.85)', a);
        frame(c, x2, oy, w2, 44, on ? PAL.gold : 'rgba(150,178,204,.45)', a * .9, 2);
        txt(c, (on ? '▶ ' : '   ') + o, x2 + 20, oy + 32, 24, on ? PAL.gold : 'rgba(180,196,214,.7)', a, 2);
      });
    }
  }

  // ---------- 括号泡（没说出口的话） ----------
  for (const th of THINK) {
    if (t < th.t0 || t >= th.t1) continue;
    const lt = t - th.t0;
    const k = HZ(lt / .6), a = Math.min(1, lt / .25) * Math.min(1, HZ((th.t1 - t) / .3));
    const bx = Math.max(60, Math.min(W - 620, th.x));
    const by = th.y;
    c.save(); c.globalAlpha = a * .95;
    c.font = '30px KT, serif';
    const tw = Math.min(600, c.measureText(th.text).width + 56);
    c.fillStyle = 'rgba(226,235,244,.92)';
    c.fillRect(bx, by, tw, 62);
    c.fillStyle = 'rgba(120,153,180,.55)';
    c.fillRect(bx, by, tw, 2); c.fillRect(bx, by + 60, tw, 2);
    c.fillRect(bx, by, 2, 62); c.fillRect(bx + tw - 2, by, 2, 62);
    // 尾巴
    c.beginPath(); c.moveTo(bx + 40, by + 62); c.lineTo(bx + 56, by + 62); c.lineTo(bx + 42, by + 82); c.fill();
    c.restore();
    txt(c, th.text, bx + 28, by + 44, 30, 'rgba(20,30,42,.95)', a * k, 2);
  }
}
