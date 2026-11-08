// people.js — 方块人物（Clawd 资产库 v2 human 造型）+ 赛璐璐上色
// 方脸 / 头发盖顶 / 小躯干卫衣 / 两条短腿穿鞋。配色与发型沿用 CAST。
const CAST = {
  yan: { hair: 'short', hairCol: '#4A3428', cloth: '#7BA05B', clothDk: '#4B6B44', line: '#2F4526', pants: '#4A4550', shoe: '#EDE7DA' },
  fen: { hair: 'buns', hairCol: '#5A3A26', cloth: '#E8A0B0', clothDk: '#B0728A', line: '#7A4A5E', pants: '#565064', shoe: '#FBF7EE' },
  zhou: { hair: 'buzz', hairCol: '#565058', cloth: '#6E9F58', clothDk: '#3E4C34', line: '#33402A', pants: '#3E3A46', shoe: '#3A3540' },
  dou: { hair: 'afro', hairCol: '#33241B', cloth: '#F0BE46', clothDk: '#B98A2E', line: '#5E4A18', pants: '#454052', shoe: '#E8E2D4' }
};

const VIEW = { front: { fx: 0, sq: 1, n: 2 }, q: { fx: 5, sq: .86, n: 2 }, side: { fx: 9, sq: .62, n: 1 }, back: { fx: 0, sq: 1, n: 0 } };

// 本地坐标：地面 0，头顶 -100，方脸 34×34
function drawHead(g, o, S) {
  const { skin, hair, hairCol, line, mood = 'calm', view = 'front' } = o;
  const V = VIEW[view];
  const LW = p => p / S;
  g.lineJoin = 'round'; g.lineCap = 'round';

  // 后层：丸子 / 爆炸头
  g.fillStyle = mix(hairCol, '#000000', .22);
  if (hair === 'buns') {
    if (view !== 'side') { g.beginPath(); g.ellipse(-16, -96, 8.2, 8.0, 0, 0, TAU); g.fill(); g.strokeStyle = line; g.lineWidth = LW(2.2); g.stroke(); }
    g.beginPath(); g.ellipse(16, -96, 8.4, 8.2, .1, 0, TAU); g.fill();
    g.strokeStyle = line; g.lineWidth = LW(2.2); g.stroke();
  }
  if (hair === 'afro') {
    for (let i = 0; i < 8; i++) {
      const a = Math.PI * (1.06 + i * .13);
      g.beginPath(); g.arc(Math.cos(a) * 17, -92 + Math.sin(a) * 14, 6.4, 0, TAU); g.fill();
    }
  }

  // 方脸
  const face = () => rr(g, -17, -100, 34, 34, 7);
  face();
  g.fillStyle = skin[0]; g.fill();
  g.strokeStyle = line; g.lineWidth = LW(2.6); face(); g.stroke();
  // 脸的暗面（裁到脸形里）
  g.save(); face(); g.clip();
  g.fillStyle = rgba(skin[1], .40);
  g.beginPath();
  g.moveTo(7.4, -102); g.lineTo(20, -102); g.lineTo(20, -64); g.lineTo(9.8, -64);
  g.closePath(); g.fill();
  g.fillStyle = rgba(skin[1], .22);
  g.fillRect(-18, -73.6, 36, 8);
  g.restore();

  if (view !== 'back') {
    g.save();
    g.translate(V.fx * .9, 0);
    const open = mood === 'blink' ? .18 : mood === 'smile' ? .55 : mood === 'laugh' ? .4 : mood === 'wide' ? 1.25 : 1;
    const eyes = V.n === 2 ? [[-6.4, 1], [6.4, view === 'q' ? .86 : 1]] : [[6.4, 1]];
    for (const [ex, kk] of eyes) {
      const ew = 3.0 * kk * V.sq, eh = 6.4 * open;
      if (mood === 'smile' || mood === 'laugh') {
        g.strokeStyle = '#2A2E36'; g.lineWidth = LW(3.2);
        g.beginPath(); g.moveTo(ex - ew * .95, -86.4);
        g.quadraticCurveTo(ex, -91.6, ex + ew * .95, -86.4); g.stroke();
      } else {
        g.fillStyle = '#2A2E36';
        rr(g, ex - ew / 2, -87.6 - eh / 2, ew, eh, ew / 2); g.fill();
        if (open > .45) { g.fillStyle = 'rgba(255,255,255,.92)'; g.beginPath(); g.arc(ex - ew * .18, -89.6, 1.2 * kk, 0, TAU); g.fill(); }
      }
    }
    // 嘴
    g.strokeStyle = line; g.lineWidth = LW(2.4);
    g.beginPath();
    if (mood === 'smile' || mood === 'laugh') {
      const k = mood === 'laugh' ? 1.6 : 1;
      g.moveTo(-3.2 * k, -79.4); g.quadraticCurveTo(0, -75.4 - k, 3.2 * k, -79.6);
    } else if (mood === 'sad') {
      g.moveTo(-3.0, -77.6); g.quadraticCurveTo(0, -79.6, 3.0, -77.8);
    } else { g.moveTo(-2.6, -78.4); g.lineTo(2.6, -78.4); }
    g.stroke();
    if (mood !== 'calm') {
      g.fillStyle = rgba('#E88A86', .26);
      g.beginPath(); g.ellipse(-10.8, -80.2, 4.2, 2.2, 0, 0, TAU); g.fill();
      g.beginPath(); g.ellipse(10.8, -80.2, 4.2, 2.2, 0, 0, TAU); g.fill();
    }
    g.restore();
  }

  // 头发盖顶
  const cap = () => {
    g.beginPath();
    g.moveTo(-18.4, -88.6);
    g.bezierCurveTo(-19.2, -102.4, -9.6, -107.4, 0, -107.4);
    g.bezierCurveTo(9.6, -107.4, 19.2, -102.4, 18.4, -88.6);
    if (hair === 'short' || hair === 'buzz') {
      g.lineTo(15.0, -93.2); g.lineTo(10.6, -95.2); g.lineTo(6.0, -93.0);
      g.lineTo(1.4, -94.8); g.lineTo(-3.0, -93.0); g.lineTo(-8.0, -95.0);
      g.lineTo(-11.8, -93.0); g.lineTo(-15.0, -93.2);
    } else {
      g.lineTo(15.0, -92.6); g.lineTo(9.6, -95.6); g.lineTo(4.6, -92.4);
      g.lineTo(-0.6, -96.0); g.lineTo(-5.4, -92.6); g.lineTo(-10.2, -95.4); g.lineTo(-15.2, -92.4);
    }
    g.closePath();
  };
  g.fillStyle = hairCol; cap(); g.fill();
  g.strokeStyle = line; g.lineWidth = LW(2.4); cap(); g.stroke();

  // 天使环
  g.strokeStyle = rgba(mix(hairCol, '#FFFFFF', .45), .8); g.lineWidth = LW(3.4);
  g.beginPath(); g.arc(0, -95.6, 12.6, Math.PI * 1.13, Math.PI * 1.87); g.stroke();

  // 鬓角
  g.fillStyle = mix(hairCol, '#000000', .26);
  poly(g, [[-18.0, -93.4], [-14.6, -92.4], [-14.6, -84.4], [-17.8, -85.4]]); g.fill();
  if (view !== 'side') { poly(g, [[18.0, -93.4], [14.6, -92.4], [14.6, -84.4], [17.8, -85.4]]); g.fill(); }
}

function limb(g, x0, y0, x1, y1, w, col, line, S) {
  g.strokeStyle = line; g.lineWidth = w + 3.4 / S; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
}

function drawPerson(g, o) {
  const C = CAST[o.who] || CAST.yan;
  const p = Object.assign({ lean: 0, bob: 0, armL: 6, armR: -6, legL: 0, legR: 0, headRot: 0 }, o.pose || {});
  const view = o.view || 'front';
  const skin = o.skin || ['#F3CFA3', '#B98D62', '#8A6248'];
  const cloth = o.cloth || C.cloth, clothDk = o.clothDk || C.clothDk, line = o.line || C.line;
  const pants = o.pants || C.pants;

  g.save();
  g.translate(0, p.bob);
  g.rotate(p.lean * Math.PI / 180);
  g.lineJoin = 'round'; g.lineCap = 'round';

  // 腿
  for (const [side, ang, colr] of [[-1, p.legL, pants], [1, p.legR, mix(pants, '#000000', .16)]]) {
    const hx = side * 7.4, hy = -38;
    const sw = Math.sin(ang * Math.PI / 180);
    const ax = hx + sw * 7.0, ay = -7;
    limb(g, hx, hy, ax, ay, 11.4, colr, line, S_);
    g.fillStyle = C.shoe; g.strokeStyle = line; g.lineWidth = 2.2 / S_;
    rr(g, ax - 7.4, ay - 1.4, 15.4, 8.4, 3.4); g.fill(); g.stroke();
    g.fillStyle = rgba('#000000', .12); g.fillRect(ax - 6.6, ay + 4.4, 14, 2.2);
  }

  // 躯干
  const body = () => rr(g, -16, -66, 32, 29, 5.5);
  body();
  g.fillStyle = cloth; g.fill();
  g.save(); g.clip();
  g.fillStyle = clothDk;
  g.fillRect(-17, -41.4, 34, 5.0);
  g.beginPath(); g.ellipse(0, -66.2, 13.6, 4.6, 0, 0, TAU); g.fill();
  g.restore();
  g.strokeStyle = line; g.lineWidth = 2.5 / S_; body(); g.stroke();

  // 兜帽
  g.fillStyle = mix(cloth, '#000000', .16);
  g.beginPath(); g.ellipse(0, -65.4, 13.0, 6.2, 0, Math.PI, TAU); g.fill();
  g.strokeStyle = line; g.lineWidth = 2.2 / S_; g.stroke();
  // 抽绳
  g.strokeStyle = rgba('#FBF7EE', .92); g.lineWidth = 2.0 / S_;
  g.beginPath(); g.moveTo(-3.6, -66); g.lineTo(-3.6, -55); g.stroke();
  g.beginPath(); g.moveTo(3.6, -66); g.lineTo(3.6, -55); g.stroke();
  // 口袋
  g.strokeStyle = rgba(line, .5); g.lineWidth = 1.8 / S_;
  g.beginPath(); g.moveTo(-10, -55); g.lineTo(-9, -48); g.lineTo(9, -48); g.lineTo(10, -55); g.stroke();

  // 手臂
  const armDraw = (side, ang) => {
    const sx = side * 16.4, sy = -61;
    const a = ang * Math.PI / 180;
    const hx = sx + Math.sin(a) * 19 * side, hy = sy + Math.cos(a) * 19;
    limb(g, sx, sy, hx, hy, 9.6, cloth, line, S_);
    g.fillStyle = skin[0]; g.strokeStyle = line; g.lineWidth = 2.0 / S_;
    rr(g, hx - 5.2, hy - 4.6, 10.4, 9.6, 3.2); g.fill(); g.stroke();
    return [hx, hy];
  };
  const handL = armDraw(-1, p.armL);
  const handR = armDraw(1, p.armR);

  // 头
  g.save();
  g.translate(0, -66);
  g.rotate(p.headRot * Math.PI / 180);
  g.translate(0, 66);
  drawHead(g, { skin, hair: C.hair, hairCol: C.hairCol, line, mood: o.mood, view }, S_);
  g.restore();

  g.restore();
  return { handL, handR };
}

// 统一入口：画进离屏 → 赛璐璐上色 → 贴回
let S_ = 1;
function actor(ctx, o) {
  const s = o.s, k = s / 100;
  const crop = o.crop || { x: -70, y: -120, w: 140, h: 122 };
  const bw = Math.max(2, Math.round(crop.w * k)), bh = Math.max(2, Math.round(crop.h * k));
  if (!o.crop && o.shadowCol !== false) {
    ctx.save();
    const rg = ctx.createRadialGradient(o.x, o.y - 2, 2, o.x, o.y - 2, 58 * k);
    rg.addColorStop(0, 'rgba(4,6,12,.55)'); rg.addColorStop(.55, 'rgba(4,6,12,.28)'); rg.addColorStop(1, 'rgba(4,6,12,0)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.ellipse(o.x, o.y - 2, 58 * k, 15 * k, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  const { c, g } = mkCtx(bw, bh);
  S_ = k;
  g.save();
  g.translate(-crop.x * k, -crop.y * k);
  g.scale(k, k);
  if (o.flip) g.scale(-1, 1);
  drawPerson(g, o);
  g.restore();
  const shaded = celShade(c, {
    light: o.light || [-0.6, -0.8],
    step: o.step || clamp(Math.round(s * .045), 8, 190),
    rimW: o.rimW || 6,
    shadowTint: o.shadowTint || '#93A0C4', shadowA: o.shadowA ?? 1,
    hiCol: o.hiCol, hiA: o.hiA || 0, rimCol: o.rimCol, rimA: o.rimA || 0
  });
  ctx.drawImage(shaded, o.x + crop.x * k, o.y + crop.y * k);
  return shaded;
}

function silhouette(ctx, x, y, s, flip, col, alpha = 1, who = 'yan') {
  const k = s / 100;
  const crop = { x: -70, y: -120, w: 140, h: 122 };
  const bw = Math.round(crop.w * k), bh = Math.round(crop.h * k);
  const { c, g } = mkCtx(bw, bh);
  S_ = k;
  g.save();
  g.translate(-crop.x * k, -crop.y * k); g.scale(k, k);
  if (flip) g.scale(-1, 1);
  drawPerson(g, { who, mood: 'calm', view: 'q' });
  g.restore();
  g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, bw, bh);
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.drawImage(c, x + crop.x * k, y + crop.y * k);
  ctx.restore();
}
