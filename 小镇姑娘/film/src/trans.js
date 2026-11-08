// trans.js — 全片转场库（在 composite 阶段以 Canvas2D 介入）
//
// 为什么放在 composite：转场常常要把"已经画好的整帧"当成一张纸（切片错位、旋转甩出、震一下），
// 这些在 p5 笔刷层里做不到。在这里可以把整帧重新贴一遍（任意切片 / 位移 / 旋转），再盖色块。
//
// 规则：每个转场在 TRANS 里一行 { t: 切点, din, dout, type, o }，
//       窗口 = [t-din, t+dout]，p 从 0 走到 1，p = din/(din+dout) 恰好落在切点。
//       所以 0→切点 遮住旧镜，切点→1 露出新镜。t 必须等于 shots() 里的镜头边界，否则遮住的不是切点。
//
// 十种转场都只说一种语言：孔版印刷。墨块、干刷、半调边、套版错位、规矩线、纸。
(() => {
  const CW = W, CH = H;
  const TMP = document.createElement('canvas'); TMP.width = CW; TMP.height = CH;
  const TX = TMP.getContext('2d');

  const cov = (p, k) => clamp(p < k ? p / k : (1 - p) / (1 - k));      // 0 → 1（切点）→ 0
  const shk = (t, amt) => { const f = Math.floor(t * 24); return [(hash(f * 1.7) - .5) * 2 * amt, (hash(f * 2.3 + 9) - .5) * 2 * amt]; };
  const rgb = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
  const reset = c => { c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; };

  // 贴整帧（可位移 / 缩放）；ex 是防抖外扩，避免边缘露纸
  function blit(c, cv, dx = 0, dy = 0, sc = 1, ex = 6) {
    const w = CW * sc + ex * 2, h = CH * sc + ex * 2;
    c.drawImage(cv, (CW - w) / 2 + dx, (CH - h) / 2 + dy, w, h);
  }
  // 干刷纹理：让纯色块不像数码填充
  function dry(c, x, y, w, h, col, n = 9, a = .16) {
    c.strokeStyle = rgb(col, a); c.lineWidth = 2.2;
    for (let i = 0; i < n; i++) {
      const yy = y + h * (i + .5) / n + (hash(i * 5.1 + x) - .5) * h * .08;
      c.beginPath(); c.moveTo(x + hash(i) * w * .25, yy);
      c.lineTo(x + w * (.45 + hash(i + 9) * .55), yy + (hash(i + 3) - .5) * 10); c.stroke();
    }
  }
  // 带子四角：a = 推进轴 0..1（h 沿 x、v 沿 y），u = 正交轴 0..1，slope 让推进边倾斜
  const BP = (a, u, vert, slope) => vert
    ? [u * CW, a * CH + (u - .5) * CW * slope]
    : [a * CW + (u - .5) * CH * slope, u * CH];
  function bandPts(u0, u1, a0, a1, vert, slope, jitAmp, seed) {
    const N = 9, top = [], bot = [];
    for (let k = 0; k <= N; k++) {
      const u = lerp(u0, u1, k / N);
      const ja = (hash(seed * 13.7 + k) - .5) * 2 * jitAmp, jb = (hash(seed * 7.13 + k + 41) - .5) * 2 * jitAmp;
      const pa = BP(a0, u, vert, slope), pb = BP(a1, u, vert, slope);
      top.push(vert ? [pa[0] + ja, pa[1]] : [pa[0], pa[1] + ja]);
      bot.push(vert ? [pb[0] + jb, pb[1]] : [pb[0], pb[1] + jb]);
    }
    return top.concat(bot.reverse());
  }
  function poly(c, pts, col, a = 1) {
    c.globalAlpha = a; c.fillStyle = col; c.beginPath();
    pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    c.closePath(); c.fill(); c.globalAlpha = 1;
  }

  // ---------- 1. 笔刷扫（横 / 竖 / 斜，五条毛边墨带） ----------
  function tBrush(c, cv, p, o, t, k) {
    const K = cov(p, k), n = o.n || 5, vert = o.dir === 'v';
    const slope = o.slope || 0, cols = o.cols || [INK.clayDk, INK.clay];
    const amp = (o.shake || 0) * Math.sin(Math.PI * p), [sx, sy] = shk(t, amp);
    blit(c, cv, sx, sy, 1, amp + 6);
    for (let i = 0; i < n; i++) {
      const u0 = i / n - .01, u1 = (i + 1) / n + .01;
      const d = [0, .13, .05, .17, .09, .11][i % 6];
      const q = easeOut(clamp((K - d) / (1 - d)));
      if (q <= .002) continue;
      const a0 = p < k ? -.22 : q, a1 = p < k ? q : 1.22;
      const pts = bandPts(u0, u1, a0, a1, vert, slope, 24, i + 1);
      const col = i % 2 ? cols[0] : cols[1];
      poly(c, pts, col);
      c.save(); c.beginPath(); pts.forEach(([x, y], j) => j ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.clip();
      dry(c, 0, 0, CW, CH, INK.cream, 8, .12);
      dry(c, 0, 0, CW, CH, INK.ink, 5, .10);
      c.restore();
    }
  }

  // ---------- 2. 滚筒压过（竖压 / 横压） ----------
  function tRoller(c, cv, p, o, t, k) {
    const col = o.col || INK.blueDk, vert = o.axis !== 'h';
    blit(c, cv);
    const f = p < k ? lerp(-.4, 1.4, easeOut(p / k)) : lerp(1.4, -.4, ease((p - k) / (1 - k)));
    const P = vert ? CW : CH, S = vert ? CH : CW;
    const head = f * P, over = P * .5;
    const R = (x0, x1, y0, y1) => vert ? [x0, y0, x1 - x0, y1 - y0] : [y0, x0, y1 - y0, x1 - x0];
    // 墨面
    c.fillStyle = col;
    c.fillRect(...R(-over, head, -over, S + over));
    c.fillStyle = rgb(INK.blueDk, .12);
    c.fillRect(...R(-over, head, -over, S + over));
    // 干刷横纹
    c.strokeStyle = rgb(INK.cream, .16); c.lineWidth = 2.4;
    for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(...(vert ? [-over, 20 + i * S / 7] : [20 + i * S / 7, -over])); c.lineTo(...(vert ? [head, 14 + i * S / 7] : [14 + i * S / 7, head])); c.stroke(); }
    // 滚筒本体：一道更重的墨 + 纸白高光
    c.fillStyle = mixCol(col, INK.blueDk, .45);
    c.fillRect(...R(head - 46, head + 46, -over, S + over));
    c.strokeStyle = rgb(INK.cream, .85); c.lineWidth = 3.4;
    c.beginPath(); c.moveTo(...(vert ? [head + 8, -over] : [-over, head + 8])); c.lineTo(...(vert ? [head + 8, S + over] : [S + over, head + 8])); c.stroke();
  }

  // ---------- 3. 套版错位（切片位移 + 单色副版叠印） ----------
  function tintOf(col, cv, op) {
    TX.setTransform(1, 0, 0, 1, 0, 0); TX.globalCompositeOperation = 'source-over'; TX.globalAlpha = 1;
    TX.clearRect(0, 0, CW, CH); TX.drawImage(cv, 0, 0, CW, CH);
    TX.globalCompositeOperation = 'multiply'; TX.fillStyle = col; TX.fillRect(0, 0, CW, CH);
    TX.globalCompositeOperation = 'source-over';
    return TMP;
  }
  function tMisreg(c, cv, p, o, t, k) {
    const kk = Math.sin(Math.PI * clamp(p)), amp = (o.amp || 90) * kk, n = o.n || 8;
    c.fillStyle = INK.paper; c.fillRect(0, 0, CW, CH);            // 印歪了，露出纸
    for (let i = 0; i < n; i++) {
      const y0 = CH * i / n, h = CH / n;
      const dx = (hash(i * 7.31 + 2) - .5) * 2 * amp + (i % 2 ? amp * .32 : -amp * .32);
      const dy = (hash(i * 3.7) - .5) * amp * .16;
      c.drawImage(cv, 0, y0, CW, h, dx, y0 + dy, CW, h + 1);
    }
    // 副版：整帧染成一色，两向错开叠印
    const tm = tintOf(o.col || INK.pink, cv);
    c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = (o.op || .5) * kk;
    c.drawImage(tm, -amp * .6, amp * .25, CW, CH);
    c.drawImage(tm, amp * .5, -amp * .2, CW, CH);
    c.restore(); reset(c);
  }

  // ---------- 4. 光圈（圆 / 星） ----------
  function tIris(c, cv, p, o, t, k) {
    blit(c, cv);
    const K = cov(p, k), R = (o.r || 1400) * (1 - K);
    const cx = o.cx ?? CW / 2, cy = o.cy ?? CH / 2;
    if (R < 3) { c.fillStyle = o.col; c.fillRect(0, 0, CW, CH); return; }
    c.beginPath(); c.rect(-40, -40, CW + 80, CH + 80);
    const N = 108;
    for (let i = 0; i <= N; i++) {
      const a = i / N * TAU, jj = 1 + (hash(i * 3.1) - .5) * .07;
      let r = R * jj;
      if (o.shape === 'star') r *= .55 + .45 * Math.pow(Math.abs(Math.cos(a * 2)), .55);
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.closePath();
    c.fillStyle = o.col; c.fill('evenodd');
    // 墨边上的半调点：孔版印刷的边不是刀切的
    for (let i = 0; i < 64; i++) {
      const a = i / 64 * TAU + hash(i) * .1, jj = 1 + (hash(i * 3.1) - .5) * .07;
      let r = R * jj;
      if (o.shape === 'star') r *= .55 + .45 * Math.pow(Math.abs(Math.cos(a * 2)), .55);
      const d = 8 + 16 * hash(i + 2);
      c.globalAlpha = .5 + .5 * hash(i + 5); c.fillStyle = o.col;
      c.beginPath(); c.arc(cx + Math.cos(a) * (r + d), cy + Math.sin(a) * (r + d), 2 + 7 * hash(i + 7), 0, TAU); c.fill();
    }
    c.globalAlpha = 1;
  }

  // ---------- 5. 墨晕吞没（不规则墨团 + 半调边） ----------
  function blob(c, x, y, r, col, seed) {
    c.beginPath();
    const N = 44;
    for (let i = 0; i <= N; i++) {
      const a = i / N * TAU;
      const rr = r * (1 + .07 * Math.sin(a * 3 + seed) + .05 * Math.sin(a * 7 + seed * 2.3) + (hash(i * 1.7 + seed) - .5) * .05);
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.closePath(); c.fillStyle = col; c.fill();
  }
  function tBleed(c, cv, p, o, t, k) {
    blit(c, cv);
    const K = cov(p, k), R = (o.r || 1500) * Math.pow(K, 1.3) * 1.15;
    if (R < 8) return;
    const cx = o.cx ?? CW / 2, cy = o.cy ?? CH / 2, col = o.col || INK.blue;
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * TAU + hash(i + 1) * .8, dd = R * .52 * hash(i + 4);
      blob(c, cx + Math.cos(a) * dd, cy + Math.sin(a) * dd * .82, R * (.52 + .36 * hash(i + 6)), col, i + 1);
    }
    // 外缘一圈半调点：墨和纸的交界是被网点啃出来的
    c.fillStyle = col;
    for (let i = 0; i < 110; i++) {
      const a = i / 110 * TAU + hash(i + 9) * .07;
      const d = R * (1.02 + .16 * hash(i + 3));
      c.globalAlpha = .28 + .55 * hash(i + 11);
      c.beginPath(); c.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .85, 2 + 8 * hash(i + 13), 0, TAU); c.fill();
    }
    c.globalAlpha = 1;
  }

  // ---------- 6. 撕纸（锯齿边 + 纤维） ----------
  function tTear(c, cv, p, o, t, k) {
    blit(c, cv);
    const col = o.col || INK.paper;
    const e = p < k ? lerp(CW + 320, -320, easeOut(p / k)) : lerp(-320, CW + 320, easeIn((p - k) / (1 - k)));
    const sawAt = y => { const i = Math.floor(y / 26); return (hash(i * 2.7 + 5) - .5) * 52 + (i % 2 ? 18 : -18) + Math.sin(y * .07) * 14; };
    const pts = [];
    for (let y = -60; y <= CH + 60; y += 26) pts.push([e + sawAt(y), y]);
    c.beginPath(); c.moveTo(CW + 500, -60);
    for (const [x, y] of pts) c.lineTo(x, y);
    c.lineTo(CW + 500, CH + 60); c.closePath();
    c.fillStyle = col; c.fill();
    // 撕裂的纤维：从锯齿边甩出去的短毛
    c.strokeStyle = rgb(INK.cream, .55); c.lineWidth = 2;
    for (let i = 0; i < 46; i++) {
      const y = -40 + i * (CH + 80) / 46 + hash(i * 3) * 12;
      const x = e + sawAt(y), L = 14 + 40 * hash(i + 7);
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - L, y + (hash(i + 2) - .5) * 22); c.stroke();
    }
    // 纸的背光边
    c.strokeStyle = rgb(INK.ink, .18); c.lineWidth = 4;
    c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x + 5, y) : c.moveTo(x + 5, y)); c.stroke();
  }

  // ---------- 7. 纸片甩过（整帧当一张照片） ----------
  function tCardSwipe(c, cv, p, o, t, k) {
    c.fillStyle = o.bg || INK.paper; c.fillRect(0, 0, CW, CH);
    if (o.grain) { c.fillStyle = rgb(o.grain, .12); c.fillRect(0, 0, CW, CH); }
    const inH = p < k;
    const q = inH ? easeIn(p / k) : easeOut((p - k) / (1 - k));
    const dy = inH ? lerp(0, CH * 1.3, q) : lerp(-CH * 1.3, 0, q);
    const rot = (inH ? lerp(0, .12, q) : lerp(-.12, 0, q)) * (o.rot ?? 1);
    c.save();
    c.translate(CW / 2, CH / 2 + dy); c.rotate(rot);
    c.shadowColor = 'rgba(28,20,24,.38)'; c.shadowBlur = 56; c.shadowOffsetY = 20;
    c.drawImage(cv, -CW / 2, -CH / 2, CW, CH);
    c.restore(); reset(c);
  }

  // ---------- 8. 印章砸下（overshoot 放大后退场） ----------
  function tStamp(c, cv, p, o, t, k) {
    const [sx, sy] = shk(t, 16 * Math.sin(Math.PI * p));
    blit(c, cv, sx, sy, 1, 18);
    const grow = p < k ? backOut(clamp(p / k)) : 1;
    const out = p < k ? 0 : easeIn((p - k) / (1 - k));
    const sc = lerp(.1, 1.06, grow) * (1 + out * .9);
    const dx = -out * CW * 1.15, dy = out * CH * .1;
    const s = Math.max(CW, CH) * 1.2;
    c.save(); c.translate(CW / 2 + dx, CH / 2 + dy); c.rotate(-.045); c.scale(sc, sc);
    c.fillStyle = o.col || INK.warm; c.fillRect(-s / 2, -s / 2, s, s);
    c.strokeStyle = rgb(INK.cream, .28); c.lineWidth = 10 / sc; c.strokeRect(-s / 2 + 60, -s / 2 + 60, s - 120, s - 120);
    dry(c, -s / 2, -s / 2, s, s, INK.cream, 10, .07);
    c.restore();
  }

  // ---------- 9. 对位带滑过（规矩线被拉着走） ----------
  function tRegRoll(c, cv, p, o, t, k) {
    blit(c, cv);
    const H2 = CH * 1.75, sl = .1;
    const yc = p < k ? lerp(-H2 * .6, CH * .5, easeOut(p / k)) : lerp(CH * .5, CH + H2 * .6, easeIn((p - k) / (1 - k)));
    const top = y => yc - H2 / 2 + y * sl, bot = y => yc + H2 / 2 + y * sl;
    c.beginPath(); c.moveTo(-80, top(-80)); c.lineTo(CW + 80, top(CW + 80));
    c.lineTo(CW + 80, bot(CW + 80)); c.lineTo(-80, bot(-80)); c.closePath();
    c.fillStyle = o.col || INK.cream; c.fill();
    dry(c, -80, yc - H2 / 2, CW + 160, H2, INK.blueDk, 26, .05);
    c.strokeStyle = rgb(INK.blue, .5); c.lineWidth = 3;
    c.beginPath(); c.moveTo(-80, top(-80)); c.lineTo(CW + 80, top(CW + 80)); c.stroke();
    c.beginPath(); c.moveTo(-80, bot(-80)); c.lineTo(CW + 80, bot(CW + 80)); c.stroke();
    // 规矩十字：钉在这条带上，被一路拖着走
    for (let i = 0; i < 4; i++) {
      const x = 120 + i * 520, y = yc - 40;
      c.strokeStyle = rgb(INK.blue, .75); c.lineWidth = 2.4;
      c.beginPath(); c.moveTo(x - 34, y); c.lineTo(x + 34, y); c.moveTo(x, y - 34); c.lineTo(x, y + 34); c.stroke();
      c.beginPath(); c.arc(x, y, 15, 0, TAU); c.stroke();
    }
  }

  // ---------- 10. 白闪硬切（强拍专用） ----------
  function tFlashCut(c, cv, p, o, t, k) {
    const [sx, sy] = shk(t, 10);
    blit(c, cv, sx, sy, 1, 16);
    const a = p < k ? Math.pow(p / k, .55) : Math.pow(1 - (p - k) / (1 - k), 2.4);
    c.fillStyle = rgb(o.col || INK.cream, clamp(a)); c.fillRect(0, 0, CW, CH);
  }

  const TYPES = { brush: tBrush, roller: tRoller, misreg: tMisreg, iris: tIris, bleed: tBleed, tear: tTear, cardSwipe: tCardSwipe, stamp: tStamp, regRoll: tRegRoll, flashCut: tFlashCut };

  // ================================================================
  // 切点表：14 个镜头边界，一个边界一种语言；相邻两次不重复。
  // 情绪先定，形状再挑：错位=镜子/自欺，光圈=看，墨晕=回忆，撕纸=撕开，翻照片=怀旧，
  // 规矩带=时间/机器，滚筒=速度/横移，印章=点燃，白闪=冻结那一下。
  // ================================================================
  const TRANS = [
    { t: 2.88, din: .24, dout: .24, type: 'brush', o: { dir: 'd', slope: .075, n: 5, cols: [INK.blueDk, INK.blue] } },         // S01→S02 街角
    { t: 5.36, din: .22, dout: .22, type: 'misreg', o: { amp: 96, n: 9, col: INK.pink, op: .55 } },                              // S02→S03 镜子/自拍
    { t: 8.48, din: .24, dout: .24, type: 'iris', o: { col: INK.blueDk, r: 1380 } },                                            // S03→S04 视力
    { t: 12.24, din: .20, dout: .20, type: 'roller', o: { col: INK.clayDk } },                                                   // S04→S05 被拐跑
    { t: 16.32, din: .28, dout: .28, type: 'bleed', o: { col: mixCol(INK.blue, INK.paper, .16), cx: 800, cy: 690, r: 1650 } },    // S05→S06 回忆洇开
    { t: 19.12, din: .20, dout: .28, type: 'tear', o: { col: INK.paper } },                                                       // S06→S07 从回忆撕开
    { t: 22.40, din: .26, dout: .26, type: 'cardSwipe', o: { bg: mixCol(INK.blue, INK.paper, .48), rot: .8 } },                   // S07→S08 老照片
    { t: 25.60, din: .22, dout: .22, type: 'regRoll', o: {} },                                                                    // S08→S09 时间
    { t: 29.92, din: .22, dout: .22, type: 'brush', o: { dir: 'v', n: 6, shake: 9, cols: [INK.pinkDk, INK.pink] } },              // S09→S10 坠进梦
    { t: 33.72, din: .10, dout: .24, type: 'flashCut', o: {} },                                                                   // S10→S11 冻结
    { t: 37.06, din: .15, dout: .17, type: 'stamp', o: { col: INK.warm } },                                                        // S11→S12 埋火种
    { t: 39.76, din: .20, dout: .22, type: 'roller', o: { col: INK.blueDk, axis: 'h' } },                                          // S12→S13 横移长镜
    { t: 43.28, din: .24, dout: .24, type: 'iris', o: { col: INK.pinkDk, shape: 'star', r: 1500, cy: 620 } },                     // S13→S14 聚到她
    { t: 47.20, din: .20, dout: .30, type: 'tear', o: { col: mixCol(INK.blue, INK.paper, .22) } },                                 // S14→S15 表白
  ];

  window.TRANS = TRANS;
  window.frameHook = (c, t) => {
    const cv = drawingContext.canvas;
    let hit = null;
    for (const tr of TRANS) {
      const a = tr.t - tr.din, b = tr.t + tr.dout;
      if (t >= a && t < b) { hit = { tr, p: (t - a) / (b - a) }; break; }
    }
    reset(c);
    if (!hit) { c.drawImage(cv, 0, 0, W, H); return; }
    const { tr, p } = hit, k = tr.din / (tr.din + tr.dout);
    (TYPES[tr.type] || tBrush)(c, cv, p, tr.o || {}, t, k);
    reset(c);
  };
})();
