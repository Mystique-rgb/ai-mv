// chars.js — 《天龙八部之宿敌》双角色定妆图（全部代码绘制，p5.brush 水墨设色）
//
//   t = 0  角色 A · 阿宿（原色主角）定妆卡
//   t = 1  角色 B · 粉煞（粉色宿敌）定妆卡
//   t = 2  双人对峙图
//
// 两个角色都建立在 Clawd 的方块身体上（10u×6u + 四条短腿 + 两只小手），
// 只靠「斗笠 / 腰带 / 下摆 / 靴 / 剑」四件外装区分身份，保证与整支 MV 同一套骨架、可动。
(() => {
  // ---------- 本片色板（五色纸的设色版：赭、朱、青灰、粉、墨）----------
  const C = {
    robeA: '#4E6B78', robeAdk: '#31454E',     // 青灰长袍
    red: '#C0324A',                            // 朱红（腰带、剑穗、额印）
    straw: '#D9A85C', strawDk: '#A5732F',      // 斗笠
    ink2: '#3B3247',                           // 剑鞘 / 玄色
    jade: '#E4D8B0', silver: '#CFD3D8',
    bodyB: '#E892A9', bodyBdk: '#B25C7C', bodyBlt: '#F8C6D1',   // 粉
    robeB: '#6C5A7A', robeBdk: '#493C58',      // 紫灰
    veil: '#F3DCD4'
  };
  const U = (pts, u) => pts.map(([x, y]) => [x * u, y * u]);
  const faceOf = v => (VIEWS[v] && VIEWS[v].face) || { cx: 0, fw: 1 };

  // ---------- 腰带 / 下摆 / 靴：两人共用骨架，换色换形 ----------
  function dressed(view, cfg) {
    return (u, sw) => {
      const V = VIEWS[view] || VIEWS.front, F = faceOf(view), showFace = !!V.face;
      const fx = F.cx, fw = F.fw || 1, side = view === 'side';
      const L = V.L, R = V.R;

      // 下摆（盖住四条腿，只露靴尖）
      boilSeed('skirt ' + cfg.id + view);
      const skirt = cfg.ragged
        ? (side ? [[-3.05, -2.95], [-3.45, -.85], [-2.5, -.5], [-1.6, -.95], [-.2, -.35], [1.3, -.95], [2.4, -.4], [3.45, -.85], [3.05, -2.95]]
                : [[-5.0, -2.95], [-5.6, -.85], [-4.3, -.35], [-3.1, -.95], [-1.5, -.3], [.2, -.95], [1.9, -.35], [3.3, -.95], [4.6, -.4], [5.6, -.85], [5.0, -2.95]])
        : (side ? [[-3.0, -2.95], [-3.4, -.8], [3.4, -.8], [3.0, -2.95]]
                : [[-5.0, -2.95], [-5.55, -.8], [5.55, -.8], [5.0, -2.95]]);
      paint(U(skirt, u), { wash: cfg.robe, ink: PAL.ink, sw: sw * .95, curv: .08 });
      for (const fxx of (side ? [-.6] : [-2.5, 2.5]))
        inkLine(U([[fxx, -2.8], [fxx * .84, -1.0]], u), sw * .4, mixCol(cfg.robe, PAL.ink, .45), 'inkfine', .2);
      // 下摆缘边（second colour, like a hem band）
      inkLine(U((side ? [[-3.38, -.85], [3.38, -.85]] : [[-5.5, -.85], [5.5, -.85]]), u), sw * .55, cfg.hem, 'ink', .1);

      // 靴
      boilSeed('boots ' + cfg.id + view);
      const bx = side ? [[-2.85, 1.55], [1.0, 1.55]] : [[-3.6, 1.7], [1.9, 1.7]];
      bx.forEach(([x0, w], i) => paint(rrPts(x0 * u, -.92 * u, w * u, .92 * u, .34 * u, u * .03),
        { wash: i ? cfg.boot : mixCol(cfg.boot, PAL.ink, .25), ink: PAL.ink, sw: sw * .8 }));

      // 腰带
      boilSeed('belt ' + cfg.id + view);
      paint(rectPts(L * u, -3.42 * u, (R - L) * u, .78 * u, u * .03), { wash: cfg.belt, ink: PAL.ink, sw: sw * .65 });
      paint(ellPts(fx * u, -3.03 * u, .5 * u, .42 * u, 12), { wash: cfg.jade, ink: PAL.ink, sw: sw * .5 });
      // 腰带垂下的络子
      if (!side) paint(ribbon(U([[fx + 1.0, -2.9], [fx + 1.25, -1.9], [fx + 1.05, -.95]], u), .26 * u, .1 * u),
        { wash: cfg.knot, ink: PAL.ink, sw: sw * .4 });

      // 护肩
      if (!side && cfg.pauldron) {
        boilSeed('pauldron ' + cfg.id + view);
        for (const s of [-1, 1])
          paint(U([[s * 5.2, -8.08], [s * 4.1, -8.08], [s * 3.95, -6.25], [s * 5.3, -6.55]], u),
            { wash: cfg.pauldron, ink: PAL.ink, sw: sw * .8, curv: .15 });
      }

      // 挂在腰侧的剑鞘（正面 / 3/4 才画；侧面看是侧棱，不画）
      if (cfg.scabbard && (view === 'front' || view === 'q')) {
        boilSeed('scabbard ' + cfg.id + view);
        push(); scale(cfg.sx || 1, 1); translate(3.1 * u, -1.75 * u); rotate(-.09);
        paint(rrPts(0, -.34 * u, 5.0 * u, .68 * u, .3 * u, u * .02), { wash: cfg.ink2 || C.ink2, ink: PAL.ink, sw: sw * .7 });
        inkLine(U([[1.0, 0], [4.3, 0]], u), sw * .3, mixCol(cfg.ink2 || C.ink2, PAL.cream, .45), 'inkfine', 0);
        paint(ribbon(U([[4.7, .1], [5.05, .8], [4.9, 1.45]], u), .26 * u, .09 * u), { wash: cfg.knot, ink: PAL.ink, sw: sw * .4 });
        pop();
      }

      // 额印 + 剑眉（只有正面 / 3/4 有脸时才画）
      if (showFace && cfg.mark) {
        boilSeed('mark ' + cfg.id + view);
        paint(U([[fx - .16, -7.95], [fx + .16, -7.95], [fx + .28, -7.3], [fx, -7.05], [fx - .28, -7.3]], u),
          { wash: cfg.mark, ink: null });
        for (const s of [-1, 1]) {
          const oy = cfg.brow === 'worried' ? .38 : 0, ix = cfg.brow === 'worried' ? -.18 : .18;
          inkLine(U([[fx + s * 1.55 * fw, -7.55 - oy], [fx + s * 2.45 * fw, -7.5 + oy * .2], [fx + s * 3.25 * fw, -7.35 - oy + ix]], u),
            sw * .85, cfg.browCol || PAL.ink, 'ink', .35);
        }
      }

      // 斗笠（最后画，压住头顶）
      if (cfg.hat) {
        boilSeed('hat ' + cfg.id + view);
        push(); translate(V.hat * u, 0); scale(V.hw, 1); push(); translate(0, -8.15 * u); rotate(cfg.hatTilt || 0);
        const brim = cfg.ragged
          ? [[-6.3, -.1], [-4.9, -.9], [-3.3, -.55], [-1.5, -1.32], [0, -1.45], [1.75, -1.2], [3.3, -.7], [4.9, -1.05], [6.3, -.15],
             [4.4, 1.25], [2.15, 1.72], [0, 1.85], [-2.15, 1.7], [-4.4, 1.2]]
          : [[-6.3, -.15], [-3.6, -1.02], [0, -1.45], [3.6, -1.02], [6.3, -.15],
             [4.3, 1.22], [2.1, 1.66], [0, 1.8], [-2.1, 1.66], [-4.3, 1.22]];
        paint(U(brim, u), { wash: cfg.hat, fill: PAL.ochre, fillOp: 55, ink: PAL.ink, sw: sw * .95, curv: .3 });
        paint(U([[-3.35, -.15], [-1.5, -3.35], [0, -4.85], [1.5, -3.35], [3.35, -.15]], u),
          { wash: cfg.hat, fill: PAL.ochre, fillOp: 40, ink: PAL.ink, sw: sw * .95, curv: .18 });
        paint(U([[-3.4, -.72], [-1.7, -1.22], [0, -1.36], [1.7, -1.22], [3.4, -.72], [3.35, .02], [0, -.72], [-3.35, .02]], u),
          { wash: cfg.band, ink: null });
        for (let i = 0; i < 4; i++) { const x = -2.5 + i * 1.65; inkLine(U([[x, -.95], [x * .34, -3.95]], u), sw * .32, mixCol(cfg.hat, PAL.ink, .5), 'inkfine', .1); }
        pop();
        // 系带
        if (!side) for (const s of [-1, 1]) inkLine(U([[s * 4.9, -.2], [s * 5.6, .9], [s * 5.2, 1.85]], u), sw * .45, cfg.band, 'ink', .4);
        pop();
      }
    };
  }

  // ---------- 持剑：armL / armR 钩子（剑随手臂自动跟手）----------
  function blade(len, bladeCol, knot) {
    return (u, sw) => {
      boilSeed('blade' + len);
      paint(U([[.3, -.2], [len, -.26], [len + .5, 0], [len, .26], [.3, .2]], u),
        { wash: bladeCol, ink: PAL.ink, sw: sw * .7 });
      inkLine(U([[.7, -.05], [len - .4, -.1]], u), sw * .3, PAL.cream, 'inkfine', 0);
      paint(rectPts(-.02 * u, -.7 * u, .42 * u, 1.4 * u, u * .03), { wash: C.silver, ink: PAL.ink, sw: sw * .55 });
      paint(rectPts(-1.1 * u, -.3 * u, 1.06 * u, .6 * u, u * .03), { wash: C.ink2, ink: PAL.ink, sw: sw * .5 });
      paint(ribbon(U([[.05, .3], [.5, .95], [.72, 1.75], [.9, 2.55]], u), .3 * u, .1 * u), { wash: knot, ink: PAL.ink, sw: sw * .38 });
    };
  }

  // ---------- 角色 A · 阿宿 ----------
  function charA(x, y, u, o = {}) {
    const view = o.view || 'q';
    clawd(x, y, u, {
      view, flip: o.flip, dy: o.dy || 0, sq: o.sq || 0, rot: o.rot || 0,
      col: PAL.clay, dk: PAL.clayDk, lt: PAL.clayLt,
      eyes: o.eyes || 'determined', mouth: o.mouth || 'flat', lookX: o.lookX ?? .35, lookY: o.lookY || 0,
      blush: o.blush || 0, gloom: o.gloom || 0, squint: o.squint || 0,
      aL: o.aL ?? 1.02, aR: o.aR ?? -.28,
      emote: o.emote, emoteK: o.emoteK ?? 0, emoteAge: o.emoteAge || 0,
      armL: blade(5.0, '#DDE3E6', C.red),
      draw: dressed(view, {
        id: 'A', robe: C.robeA, hem: C.robeAdk, boot: C.ink2, belt: C.red, jade: C.jade, knot: C.red,
        pauldron: C.robeAdk, scabbard: true, mark: C.red, brow: o.brow || 'fierce', browCol: PAL.ink,
        hat: C.straw, band: C.red, hatTilt: 0, ink2: C.ink2, sx: o.scabSide || 1
      }),
      boilKey: 'A' + (o.seed || 0)
    });
  }

  // ---------- 角色 B · 粉煞 ----------
  function charB(x, y, u, o = {}) {
    const view = o.view || 'q';
    clawd(x, y, u, {
      view, flip: o.flip ?? true, dy: o.dy || 0, sq: o.sq || 0, rot: o.rot || 0,
      col: C.bodyB, dk: C.bodyBdk, lt: C.bodyBlt,
      eyes: o.eyes || 'narrow', mouth: null, lookX: o.lookX ?? -.5, lookY: o.lookY || 0,
      blush: o.blush || 0, gloom: o.gloom || 0, squint: o.squint || 0,
      aL: o.aL ?? .55, aR: o.aR ?? .55,
      emote: o.emote, emoteK: o.emoteK ?? 0, emoteAge: o.emoteAge || 0,
      armL: blade(2.7, '#E7D2DA', C.bodyBdk), armR: blade(2.7, '#E7D2DA', C.bodyBdk),
      draw: dressed(view, {
        id: 'B', robe: C.robeB, hem: C.robeBdk, boot: C.ink2, belt: C.ink2, jade: C.silver, knot: C.bodyBdk,
        pauldron: C.robeBdk, scabbard: false, mark: null, brow: 'sharp', browCol: C.bodyBdk,
        hat: C.robeB, band: C.bodyB, hatTilt: -.14, ragged: true, ink2: C.ink2
      }) ,
      boilKey: 'B' + (o.seed || 0)
    });
    // 面纱：盖住嘴部（在脸之后、斗笠之前画；直接画在角色之后会盖住斗笠，所以放在这里单独补）
    const V = VIEWS[view] || VIEWS.front, F = faceOf(view);
    if (F && V.face) {
      boilSeed('veil' + (o.seed || 0));
      const sw = clamp(u / 15, .45, 2.4) * .9;
      push(); translate(x + (o.flip ?? true ? 0 : 0), y + (o.dy || 0) * u); scale(o.flip ?? true ? -1 : 1, 1);
      push(); translate(F.cx * u, 0); scale(F.fw, 1);
      paint(U([[-4.15, -4.52], [-2.0, -4.68], [0, -4.58], [2.0, -4.68], [4.15, -4.52], [3.9, -3.95], [0, -3.7], [-3.9, -3.95]], u),
        { wash: '#F2C9CF', fill: C.bodyBdk, fillOp: 26, ink: PAL.ink, sw: sw * .65, curv: .3 });
      for (const s of [-1, 1]) inkLine(U([[s * 1.7, -4.35], [s * 1.95, -3.88]], u), sw * .32, mixCol(C.bodyBdk, PAL.ink, .3), 'inkfine', .2);
      pop(); pop();
    }
  }

  // ---------- 背景零件 ----------
  function disc(cx, cy, r, col, op) {
    boilSeed('disc' + cx + cy);
    paint(ellPts(cx, cy, r, r, 46), { fill: col, fillOp: op, bleed: .1, tex: .45, border: .5, ink: null });
    const ring = []; for (let i = 0; i < 42; i++) { const a = i / 42 * TAU; ring.push([cx + Math.cos(a) * r * .995, cy + Math.sin(a) * r * .995]); }
    inkLine(ring, 1.1, mixCol(col, PAL.ink, .55), 'inkfine', .5);
  }
  function ground(cx, y, w) {
    boilSeed('ground' + cx);
    paint(ellPts(cx, y + 8, w, 26, 34), { fill: PAL.ink, fillOp: 45, bleed: .25, tex: .3, border: .2, ink: null });
    inkLine([[cx - w, y + 6], [cx, y + 3], [cx + w, y + 7]], .8, mixCol(PAL.paper, PAL.ink, .35), 'inkfine', .5);
  }
  function dust(seed, n, y0, y1) {
    boilSeed('dust' + seed);
    for (let i = 0; i < n; i++) {
      const x = 120 + hash(seed * 31 + i * 7.7) * 1680, y = y0 + hash(seed * 17 + i * 3.1) * (y1 - y0);
      const r = 3 + hash(seed + i * 11) * 8, a = hash(seed * 3 + i * 5);
      paint(ellPts(x, y, r, r * .8, 10), { wash: a > .6 ? C.red : (a > .3 ? C.strawDk : C.robeAdk), washOp: 110, ink: null });
    }
  }
  function seal(x, y, s) {   // 空白印章块（纯图形，无文字）
    boilSeed('seal' + x + y);
    paint(rectPts(x, y, s, s, s * .04), { wash: C.red, ink: null });
    for (let i = 0; i < 3; i++) paint(rectPts(x + s * .18, y + s * (.22 + i * .22), s * .64, s * .07, s * .01), { wash: PAL.paper, ink: null });
  }
  function swatches(x, y, cols, u) {
    cols.forEach((c, i) => {
      boilSeed('sw' + i + x);
      paint(rrPts(x + i * 1.55 * u, y, 1.25 * u, 1.25 * u, .18 * u, u * .02), { wash: c, ink: PAL.ink, sw: .7 });
    });
  }

  // ---------- 定妆卡 A ----------
  function cardA(t) {
    disc(500, 455, 392, C.strawDk, 42);
    ground(500, 900, 330);
    dust(1, 16, 120, 980);
    charA(500, 900, 45, { view: 'q', aL: 1.05, aR: -.35, eyes: 'determined', mouth: 'flat', brow: 'fierce', seed: 1 });

    // 三个视图
    const gy = 430, uv = 20;
    charA(1055, gy, uv, { view: 'front', aL: .15, aR: .15, eyes: 'determined', seed: 2 });
    charA(1355, gy, uv, { view: 'side', aL: -.1, aR: .1, eyes: 'determined', lookX: .8, seed: 3 });
    charA(1655, gy, uv, { view: 'back', aL: .15, aR: .15, seed: 4 });
    // 三个表情
    const ey = 765;
    charA(1055, ey, uv, { view: 'front', aL: .1, aR: .1, eyes: 'angry', mouth: 'teeth', brow: 'fierce', sq: -.03, emote: 'anger', emoteK: 1, emoteAge: .3, seed: 5 });
    charA(1355, ey, uv, { view: 'front', aL: .1, aR: .1, eyes: 'sad', mouth: 'frown', brow: 'worried', gloom: .35, seed: 6 });
    charA(1655, ey, uv, { view: 'front', aL: .1, aR: .1, eyes: 'wide', mouth: 'O', brow: 'worried', sq: -.06, seed: 7 });
    // 底部：色板 + 道具 + 印章
    swatches(1000, 905, [PAL.clay, PAL.clayDk, C.robeA, C.red, C.straw, C.ink2], 34);
    seal(1690, 890, 76);
  }

  // ---------- 定妆卡 B ----------
  function cardB(t) {
    disc(1420, 455, 392, C.bodyBdk, 38);
    ground(1420, 900, 330);
    dust(2, 16, 120, 980);
    charB(1420, 900, 45, { view: 'q', aL: .75, aR: .75, eyes: 'narrow', seed: 11 });

    const gy = 430, uv = 20;
    charB(865, gy, uv, { view: 'front', aL: .35, aR: .35, eyes: 'narrow', seed: 12 });
    charB(565, gy, uv, { view: 'side', aL: .2, aR: .2, eyes: 'narrow', lookX: -.7, seed: 13 });
    charB(265, gy, uv, { view: 'back', aL: .35, aR: .35, seed: 14 });

    const ey = 765;
    charB(865, ey, uv, { view: 'front', aL: .3, aR: .3, eyes: 'narrow', squint: .25, emote: 'steam', emoteK: 1, emoteAge: .3, seed: 15 });
    charB(565, ey, uv, { view: 'front', aL: .3, aR: .3, eyes: 'x', mouth: null, sq: .06, seed: 16 });
    charB(265, ey, uv, { view: 'front', aL: .3, aR: .3, eyes: 'shine', lookX: -.6, lookY: -.3, seed: 17 });

    swatches(560, 905, [C.bodyB, C.bodyBdk, C.robeB, C.veil, C.ink2, C.silver], 34);
    seal(150, 890, 76);
  }

  // ---------- 双人对峙 ----------
  function duo(t) {
    disc(700, 470, 360, C.strawDk, 34);
    disc(1220, 470, 360, C.bodyBdk, 30);
    // 中间那道「一刀切开」的竖线
    inkLine([[960, 40], [958, 540], [961, 1040]], 1.6, mixCol(PAL.ink, PAL.paper, .15), 'ink', 0);
    ground(700, 900, 300); ground(1220, 900, 300);
    dust(3, 18, 100, 1000);
    charA(700, 900, 42, { view: 'q', aL: .95, aR: -.4, eyes: 'determined', brow: 'fierce', seed: 21, scabSide: -1 });
    charB(1220, 900, 42, { view: 'q', flip: true, aL: .8, aR: .8, eyes: 'narrow', lookX: -.8, seed: 22 });
    seal(936, 980, 48);
  }

  shots([[0, cardA], [1, cardB], [2, duo]]);
})();
