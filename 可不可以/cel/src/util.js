// util.js — 数学 / 颜色 / 确定性随机 / 五套色模型
const W = 1920, H = 1080;
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
const easeOut = k => 1 - Math.pow(1 - k, 3);
const TAU = Math.PI * 2;

function hash(i) { let x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(a, b, k) { const A = hex2rgb(a), B = hex2rgb(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); }
function rgba(h, a) { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; }

// ---------- 五套色模型（色指定） ----------
const PAL = {
  'N-RAIN': {
    sky: ['#080D1A', '#16233C', '#243A5A'], ink: '#151C2C',
    far: '#1B2A4A', mid: '#233458', near: '#0D1424', ground: '#0B1220',
    neon: ['#E0457B', '#35D0D8', '#F5C36B', '#B06BE0'], win: '#F5C36B',
    yan: { cloth: '#5E7F56', clothDk: '#33472F', line: '#243029', pants: '#33313C' },
    fen: { cloth: '#C18597', clothDk: '#6E4356', line: '#4C2E3B', pants: '#474153' },
    skin: ['#D9B896', '#9A7C67', '#6B4E3F'],
    shadowTint: '#93A0C4', rim: '#7DE3EA', hi: '#FFF0D2', sub: '#F7E9C4'
  },
  'N-WARM': {
    sky: ['#1A1220', '#3A2030', '#5A3028'], ink: '#2A1A1E',
    far: '#4A2A32', mid: '#6A3A32', near: '#1E1218', ground: '#160E14',
    neon: ['#F09A5A', '#F5C36B', '#E0457B', '#FFD9A0'], win: '#FFD9A0',
    yan: { cloth: '#86A96A', clothDk: '#4B6B44', line: '#3A4A32', pants: '#3E3A44' },
    fen: { cloth: '#F0B0BE', clothDk: '#B0728A', line: '#7A4A5E', pants: '#5A5260' },
    skin: ['#F6D3A8', '#C08F6A', '#7A5642'],
    shadowTint: '#C39A8E', rim: '#FFD9A0', hi: '#FFF6E0', sub: '#FFF3D6'
  },
  'N-SODIUM': {
    sky: ['#140E0C', '#2A1E1A', '#3E2A20'], ink: '#241A16',
    far: '#3A2A22', mid: '#5A3A28', near: '#1A120E', ground: '#160F0C',
    neon: ['#F0A03C', '#F2EDE4', '#2E9B72', '#D94A3D'], win: '#F0A03C',
    yan: { cloth: '#6E8A50', clothDk: '#3E4C34', line: '#33402A', pants: '#3A3540' },
    fen: { cloth: '#D898A8', clothDk: '#8A5464', line: '#5E3A46', pants: '#524C5A' },
    skin: ['#EFC79A', '#B08056', '#7A4E30'],
    shadowTint: '#B98A62', rim: '#FFD9A0', hi: '#FFF2DC', sub: '#F7E9C4'
  },
  'D-HAZE': {
    sky: ['#2C6EA8', '#5EA2D0', '#BBD9EA'], ink: '#2A3040',
    far: '#7FA8C4', mid: '#9FC0D2', near: '#4C7A46', ground: '#C9C3B4',
    neon: ['#FBF7EE', '#FFF3C4', '#4C7A46', '#E8A0B0'], win: '#FFF3C4',
    yan: { cloth: '#7BA05B', clothDk: '#4B6B44', line: '#2F4526', pants: '#4A4550' },
    fen: { cloth: '#E8A0B0', clothDk: '#B0728A', line: '#8A5464', pants: '#565064' },
    skin: ['#F3CFA3', '#C08F6A', '#8A6248'],
    shadowTint: '#AFC3DC', rim: '#FFE9A8', hi: '#FFFFFF', sub: '#3A2A22'
  },
  'PRE-DAWN': {
    sky: ['#22243A', '#3A3A52', '#6B6A82'], ink: '#1E2030',
    far: '#3A4A63', mid: '#4E5A70', near: '#23242E', ground: '#1B1C24',
    neon: ['#F2C46A', '#8FA8C0', '#A97487', '#F2C46A'], win: '#F2C46A',
    yan: { cloth: '#4A5B48', clothDk: '#2B3A2E', line: '#22301F', pants: '#2E2C36' },
    fen: { cloth: '#A97487', clothDk: '#6E4356', line: '#4A2C38', pants: '#3E3A46' },
    skin: ['#B79C8E', '#8A7268', '#5E4A42'],
    shadowTint: '#8E90AC', rim: '#F2C46A', hi: '#FFF0D0', sub: '#F7E9C4'
  }
};

// 唯一不参与乘色的红
const RED = '#E23A2E';

// ---------- 画布工具 ----------
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function mkCtx(w, h) { const c = mk(w, h); return { c, g: c.getContext('2d') }; }

// 可复现的雨：每滴按 index 固定
function rain(g, t, n, o = {}) {
  const { x0 = -200, x1 = W + 200, y0 = -100, y1 = H + 60, len = 90, a = .5, col = '#BFD6EA', w = 1.6, speed = 1800, slant = -.16 } = o;
  g.save(); g.strokeStyle = rgba(col, a); g.lineWidth = w; g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const r = hash(i * 3.7);
    const r2 = hash(i * 7.1 + 5);
    const sp = speed * (.75 + r2 * .6);
    const y = ((r2 * (y1 - y0) + t * sp) % (y1 - y0)) + y0;
    const x = x0 + r * (x1 - x0) + y * slant;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + len * slant, y + len); g.stroke();
  }
  g.restore();
}

// 湿地面倒影：把上层翻转模糊后画下来
function wetReflect(g, src, yTop, yBot, o = {}) {
  const { alpha = .42, blur = 7, shift = 0, streak = 0 } = o;
  const hh = Math.min(yBot - yTop, src.height);
  g.save();
  g.globalAlpha = alpha;
  g.beginPath(); g.rect(0, yTop, W, yBot - yTop); g.clip();
  g.filter = `blur(${blur}px)`;
  g.translate(0, yTop * 2 + hh);
  g.scale(1, -1);
  g.drawImage(src, 0, 0);
  g.restore();
  if (streak) {
    g.save(); g.globalAlpha = .22; g.globalCompositeOperation = 'screen';
    for (let i = 0; i < streak; i++) {
      const x = (hash(i * 5.3) * W + shift * 30) % W;
      g.fillStyle = rgba('#9FD8E8', .10 + hash(i) * .10);
      g.fillRect(x, yTop + hash(i * 2.1) * (yBot - yTop) * .8, 60 + hash(i * 9.1) * 120, 2);
    }
    g.restore();
  }
}
