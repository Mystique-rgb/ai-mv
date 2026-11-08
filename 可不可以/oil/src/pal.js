// pal.js — 调色板、色模型、随机与插值（全片确定性：禁用 Math.random / Date）
(function () {
  const hex = h => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255]; };
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const shade = (c, k) => [Math.min(1, c[0] * k), Math.min(1, c[1] * k), Math.min(1, c[2] * k)];
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);

  function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }
  function rng(seed) { let s = (seed * 2654435761) % 4294967296; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }

  // —— 色卡（本片只用这些） ——
  const C = {
    ground: hex('#9A958C'),      // 底料灰 = "没上色"
    black: hex('#1E1A18'),       // 暖黑
    stone: hex('#3B3F46'),       // 湿石
    cold: hex('#2E3F4E'),        // 冷蓝
    sodium: hex('#C9762F'),      // 钠橙
    gold: hex('#E8B25C'),        // 窗金
    ochre: hex('#8A6A3E'),       // 他（赭土）
    ochreD: hex('#4A3A28'),
    canvas: hex('#B9A183'),      // 围裙帆布
    pink: hex('#E0708C'),        // 她的粉（唯一满纯）
    pinkD: hex('#C6697F'),
    dry: hex('#B98F98'),         // 干粉
    white: hex('#F4EDDF'),       // 钛白
    skin: hex('#E3C49B'),
    skinD: hex('#9A8570'),
    plas: hex('#B8402F'),        // 塑料红
    green: hex('#2F6B52'),
    indigo: hex('#2B2F44'),
    summer: hex('#4C86A8'),      // 2019 盛夏天钴
    leaf: hex('#5A7A46'),
    wallw: hex('#F2EADA'),
  };

  // —— 五套色模型（每种光重新指定，不用滤镜调） ——
  const MODELS = {
    'N-RAIN': { light: [-.5, -.62, .72], norm: 3.4, amb: .74, dif: .30, spec: .22, shin: 26, ao: 1.25,
      ground: C.black, sat: .96, expo: 1.0, vig: .30, weave: .14, lightCol: [1, .93, .82], tint: [.95, .98, 1.05] },
    'N-SHOP': { light: [-.62, -.5, .78], norm: 3.0, amb: .82, dif: .26, spec: .26, shin: 22, ao: 1.2,
      ground: hex('#241C18'), sat: 1.0, expo: 1.04, vig: .26, weave: .16, lightCol: [1, .88, .72], tint: [.99, .99, 1.0] },
    'D-2019': { light: [-.45, -.7, .62], norm: 2.6, amb: .92, dif: .20, spec: .12, shin: 34, ao: 1.0,
      ground: hex('#F2EADA'), sat: 1.04, expo: 1.0, vig: .16, weave: .10, lightCol: [1, .97, .88], tint: [1, 1, 1] },
    'N-DRY': { light: [-.55, -.6, .7], norm: 3.6, amb: .70, dif: .30, spec: .08, shin: 16, ao: 1.3,
      ground: hex('#241F1C'), sat: .62, expo: .96, vig: .34, weave: .18, lightCol: [.96, .92, .86], tint: [.97, .98, 1.0] },
    'DAWN': { light: [.55, -.55, .68], norm: 2.8, amb: .90, dif: .22, spec: .10, shin: 40, ao: 1.0,
      ground: hex('#6E7C86'), sat: .84, expo: 1.02, vig: .20, weave: .12, lightCol: [1, .96, .86], tint: [1, 1, 1] },
  };

  // 粉的五级递减
  const PINK5 = [C.pink, hex('#D4788E'), hex('#C6828F'), hex('#B98F98'), C.ground];

  window.PAL = { hex, mix, shade, clamp, lerp, smooth, hash, rng, C, MODELS, PINK5 };
})();
