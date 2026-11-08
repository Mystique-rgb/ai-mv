// couple.js: 男女主角候选配对图
// 出图：node render.mjs --page=couple.html --stills=0 --out=out/pair
window.EXTRA_FONTS = [['40px "PiaoyiKai"', '男女主角候选配对阿岩小粉学霸长发姐帽子哥阿蓝墨镜酷小豆推荐校园都市复古街头绿衫粉衣圆眼镜黑长直背带裤毛线帽海魂衫耳机爆炸头']];

const TT = 1.31;

const PAIRS = [
  {
    A: '阿岩', B: '小粉', name: '阿岩 × 小粉', tag: '校园 · 绿衫 × 粉衣',
    note: '参考照片原配，最干净的一对', pick: true, hue: '#7BA05B',
    emoA: 'happy', emoB: 'love'
  },
  {
    A: '学霸', B: '长发姐', name: '学霸 × 长发姐', tag: '都市 · 圆眼镜 × 黑长直',
    note: '闷的人 + 温柔的人，成年感', pick: false, hue: '#9AA2B8',
    emoA: 'neutral', emoB: 'love'
  },
  {
    A: '帽子哥', B: '阿蓝', name: '帽子哥 × 阿蓝', tag: '复古 · 背带裤 × 海魂衫',
    note: '少年气，适合夏天/海边', pick: false, hue: '#4C7A8C',
    emoA: 'excited', emoB: 'happy'
  },
  {
    A: '墨镜酷', B: '小豆', name: '墨镜酷 × 小豆', tag: '街头 · 耳机 × 爆炸头',
    note: '最闹的一对，适合快歌', pick: false, hue: '#2F3C7A',
    emoA: 'cool', emoB: 'surprised'
  },
];

function label(txt, x, y, size = 26, col = '#3E3750', f = 'PiaoyiKai') {
  letter(txt, x, y, size, col, { font: `${size}px "${f}"` });
}

function drawWorld(t) {
  boilSeed('pair'); noiseSeed(11);
  paint(rectPts(-50, -50, W + 100, H + 100), { wash: '#F6F0E3', ink: null });

  // ── 标题 ──
  label('男女主角 · 候选配对', W / 2, 82, 52, '#2B2233');
  label('同一个骨架同一套动作 · 身份全靠发型服装区分 · 挑好一对就能开工', W / 2, 128, 24, '#847C70');

  const u = 24;
  const cols = [500, 1300], rows = [700, 1200];

  PAIRS.forEach((P, i) => {
    const cx = cols[i % 2], gy = rows[Math.floor(i / 2)];

    // 组底盘：一条淡淡的坐/站线
    inkLine([[cx - 200, gy + 6], [cx + 200, gy + 6]], 1.1, 'rgba(62,55,80,.18)', 'inkfine', 0);

    // 男主：身体略朝女主；女主：略朝男主。情绪按组区分，避免全员墨镜脸
    // 第一组用 hero()/heroine()（默认男女主角），其余组用中文名 person()
    if (P.pick) {
      hero(cx - 112, gy, u, { view: 'q', rot: .10, ...feel(P.emoA, TT), aL: .55 });
      heroine(cx + 112, gy, u, { view: 'q', rot: -.10, ...feel(P.emoB, TT), aR: .45 });
    } else {
      person(P.A, cx - 112, gy, u, { view: 'q', rot: .10, ...feel(P.emoA, TT), aL: .55 });
      person(P.B, cx + 112, gy, u, { view: 'q', rot: -.10, ...feel(P.emoB, TT), aR: .45 });
    }

    // 名字 + 定位
    label(P.name, cx - 20, gy + 66, 34, '#2B2233');
    label(P.tag, cx - 20, gy + 104, 21, '#8A8278');
    label(P.note, cx - 20, gy + 136, 19, P.pick ? '#A8322A' : '#A89F92');

    // 推荐角标：放在组名右侧空白处（letter 不吃矩阵变换，必须绝对坐标）
    if (P.pick) {
      paint(rectPts(cx + 86, gy + 38, 84, 40, 3), { wash: '#A8322A', washOp: 235, ink: null });
      label('推荐', cx + 128, gy + 67, 23, '#F6F0E3');
    }

    // 组间分隔竖线
    if (i % 2 === 0) inkLine([[900, gy - 300], [900, gy + 40]], 1, 'rgba(62,55,80,.14)', 'inkfine', 0);
  });
}
