// ys_couple2.js — 情侣海边合照 · 第2稿（按《轨迹》构图模式重构）
// 依据（用户 2026-11-05 上传 2 帧实测）：
//   · 人物纯背影/3-4 正面，绝不正脸大特写
//   · 头身比 1:3.2（头占身高 32%），头宽 ≈ 或略宽于肩
//   · 五官极简：3/4 侧只画一只眼 + 一个点，无眉无鼻
//   · 1px 深色硬描边，无 rim light
//   · 人物站在画面下部"地面带"，脚底 ≈ 画面 84%，头顶留空给 HUD
//   · 构图三层压边：顶部 HUD 两行 / 右上计量条 / 底部字幕条
(function () {
  const C = {
    // 傍晚：天空紫→橙，海暗蓝紫，沙暖橙（与 HUD「傍晚」一致）
    sky1: '#4E4A78', sky2: '#7A6288', sky3: '#C08080', sky4: '#E8A070',
    sea1: '#4E5A88', sea2: '#3A4A78', sea3: '#2E3E68', sea4: '#26345A', sea5: '#1E2A4C',
    sand1: '#DCA870', sand2: '#C4925A', sand3: '#A87A44', sand4: '#845C30',
    w1: '#5E3A1E', w2: '#784C24', w3: '#8C5828', w4: '#A06830', w5: '#B47C44', w6: '#C49058',
    p1: '#C0A478', p2: '#F0DCA8', p3: '#F8F0C0',
    red: '#C8463C', redLt: '#E05840', green: '#3E7050', greenLt: '#5A9068',
    blue: '#4A90B8', blueLt: '#68A8C8', blueDk: '#2E6A8C',
    // 男主：白衬衫 + 深蓝长裤（照抄参考配色）
    shirt: '#F4F4F8', shirtDk: '#DCDCE8', shirtHi: '#FFFFFF', shirtLine: '#E6E6F0',
    pant: '#33416E', pantDk: '#28345C', pantLt: '#3E4E7C', pantSeam: '#1C2544',
    shoeDk: '#2A2430', shoeLt: '#3E3848',
    // 女主：暗棕红外套 + 绿色内搭边 + 蓝紫裙（照抄参考配色）
    coat: '#6B3438', coatDk: '#542629', coatLt: '#7E4448',
    innerG: '#4E9A6E', skirt: '#3C4C8E', skirtDk: '#2E3C72', skirtLt: '#4A5C9E',
    shoeW: '#ECE8E0', shoeWlt: '#FFFFFF',
    // 皮肤（夜色压暗的暖色，参考 #F8D8B0 在白天光下）
    skin: '#E8BE96', skinDk: '#C89C78', skinLt: '#F8D8B0',
    // 头发
    hair: '#171420', hairHi: '#4A4A66', hairHi2: '#34344E',
    hairBr: '#43292C', hairBrHi: '#6E4A44', hairBrDk: '#2C1A1E',
    blush: '#D08A88', gold: '#F0C048',
    // 描边
    edge: '#120E1A', edge2: '#0A0810',
    // UI（照参考：深蓝半透明 + 浅蓝边）
    uiBg: '#101828', uiBg2: '#16203A', uiEdge: '#6E8AC8', uiTxt: '#E8EEFA',
    uiDim: '#9EB0D0', pink: '#F0689A', pinkDk: '#8A3A54',
  };

  function ell(c, cx, cy, rx, ry, col) {
    c.fillStyle = col;
    for (let dy = -ry; dy <= ry; dy++) {
      const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
      if (w > 0) c.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
    }
  }

  // ══════════════════════════════════════════════════════
  // 他：纯背影（白衬衫 + 深蓝长裤 + 深色鞋）
  // 身高 62（画面 34%），头 19（头身比 1:3.26），头宽 24 > 肩宽 22
  // ══════════════════════════════════════════════════════
  function boyBack(c, cx, fy) {
    const T = fy - 62;
    const E = C.edge;

    // ── pass1：深色膨胀轮廓（1px 硬描边）──
    ell(c, cx, T + 9, 13, 10, E);             // 头（轮廓也是圆的）
    R(c, cx - 3, T + 16, 7, 6, E);            // 脖
    R(c, cx - 12, T + 20, 24, 19, E);         // 躯干
    R(c, cx - 13, T + 21, 5, 16, E);          // 左臂
    R(c, cx + 9, T + 21, 5, 16, E);           // 右臂
    R(c, cx - 11, T + 37, 22, 20, E);         // 裤
    R(c, cx - 12, T + 55, 24, 8, E);          // 鞋
    // 耳（描边上开小口）
    R(c, cx - 14, T + 9, 2, 5, C.skinDk);
    R(c, cx + 12, T + 9, 2, 5, C.skinDk);

    // ── pass2：头（扁圆，宽 24 高 19）──
    // 扁圆头（ell 一次成型，宽 24 高 19，宽高比 1.26 ≈ 参考 1.32）
    ell(c, cx, T + 9, 12, 9, C.hair);
    R(c, cx - 7, T + 1, 14, 1, C.hair);       // 顶点只补窄窄一道，保留弧
    R(c, cx - 4, T, 8, 1, C.hair);
    R(c, cx - 10, T + 17, 20, 1, C.edge2);    // 发底缘
    // 发丝高光（左上弧断线，不是整片亮）
    R(c, cx - 7, T + 2, 6, 1, '#30304A');      // 顶弧高光
    R(c, cx - 5, T + 3, 3, 1, '#26263C');      // 断开的第二道
    R(c, cx + 3, T + 3, 3, 1, '#26263C');

    // ── 脖子 ──
    R(c, cx - 2, T + 17, 5, 4, '#A87E5E');
    R(c, cx - 1, T + 17, 3, 1, '#C0946E');

    // ── 白衬衫（22 宽 17 高，左暗右亮 + 隔行细纹）──
    R(c, cx - 11, T + 20, 22, 12, C.shirt);       // 上段（肩最宽）
    R(c, cx - 10, T + 32, 20, 5, C.shirt);        // 下段（腰部收 1px）
    R(c, cx - 11, T + 20, 3, 12, C.shirtDk);      // 左侧背光
    R(c, cx - 10, T + 32, 3, 5, '#D2D2E0');
    R(c, cx + 8, T + 20, 3, 12, C.shirtHi);       // 右侧受光
    R(c, cx + 7, T + 32, 3, 5, C.shirtHi);
    // 竖向褶皱（3 条淡线，代替扫描线）
    R(c, cx - 5, T + 22, 1, 13, '#E8E8F2');
    R(c, cx + 2, T + 22, 1, 13, '#E8E8F2');
    R(c, cx + 5, T + 24, 1, 10, '#EDEDF6');
    R(c, cx - 11, T + 20, 22, 1, C.shirtHi);      // 肩线亮
    R(c, cx - 10, T + 36, 20, 1, '#D8D8E8');      // 下摆暗
    R(c, cx - 4, T + 29, 8, 1, '#E4E4F0');        // 背部横向折痕
    // 领口（后领，一小块深色）
    R(c, cx - 4, T + 19, 9, 2, C.shirtDk);
    R(c, cx - 3, T + 20, 7, 1, C.skinDk);

    // ── 手臂（白衬衫袖，两侧下垂）+ 手 ──
    R(c, cx - 12, T + 21, 3, 14, C.shirtDk);
    R(c, cx - 12, T + 21, 1, 14, C.shirt);
    R(c, cx + 10, T + 21, 3, 14, C.shirt);
    R(c, cx + 12, T + 21, 1, 14, C.shirtDk);
    R(c, cx - 12, T + 34, 3, 4, C.skin);          // 左手
    R(c, cx - 12, T + 34, 3, 1, C.skinLt);
    R(c, cx + 10, T + 34, 3, 4, C.skin);          // 右手
    R(c, cx + 10, T + 34, 3, 1, C.skinLt);
    R(c, cx - 12, T + 35, 1, 2, C.skinDk);
    R(c, cx + 12, T + 35, 1, 2, C.skinDk);

    // ── 深蓝长裤（两腿分离，中缝 2px）──
    R(c, cx - 10, T + 37, 20, 19, C.pant);
    R(c, cx - 10, T + 37, 9, 19, C.pantDk);       // 左腿背光
    R(c, cx + 1, T + 37, 9, 19, C.pantLt);        // 右腿受光
    R(c, cx - 1, T + 37, 2, 17, C.pantSeam);      // 中缝
    R(c, cx - 10, T + 37, 20, 1, C.pantLt);       // 腰线
    R(c, cx - 10, T + 37, 20, 2, C.pantDk);
    R(c, cx - 10, T + 37, 20, 1, '#4A5A88');
    R(c, cx - 10, T + 54, 9, 2, C.pantSeam);      // 裤脚暗
    R(c, cx + 1, T + 54, 9, 2, C.pantSeam);
    R(c, cx + 5, T + 41, 1, 11, '#445484');       // 右腿一道褶（只留一条）

    // ── 鞋（比腿宽 1px，深色 + 顶亮）──
    R(c, cx - 11, T + 56, 10, 6, C.shoeDk);
    R(c, cx + 1, T + 56, 10, 6, C.shoeDk);
    R(c, cx - 11, T + 56, 10, 1, C.shoeLt);
    R(c, cx + 1, T + 56, 10, 1, C.shoeLt);
    R(c, cx - 11, T + 61, 10, 1, C.edge2);
    R(c, cx + 1, T + 61, 10, 1, C.edge2);
  }

  // ══════════════════════════════════════════════════════
  // 她：身体背对，头转向右后方（3/4 侧脸，只画一只眼）
  // ══════════════════════════════════════════════════════
  function girlTurn(c, cx, fy) {
    const T = fy - 62;
    const E = C.edge;

    // ── pass1：膨胀轮廓 ──
    // 头：圆顶 + 两条矩形垂发（原来是一整个矩形→方发罩的根因）
    ell(c, cx - 2, T + 9, 13, 10, E);
    R(c, cx - 12, T + 14, 6, 28, E);          // 左垂发轮廓
    R(c, cx + 7, T + 19, 6, 23, E);           // 右垂发轮廓（下颌以下才垂）
    R(c, cx - 3, T + 16, 7, 6, E);
    R(c, cx - 12, T + 20, 23, 24, E);         // 躯干（衣 + 绿边）
    R(c, cx - 13, T + 21, 5, 16, E);          // 左臂
    R(c, cx + 9, T + 21, 5, 16, E);           // 右臂
    R(c, cx - 10, T + 42, 21, 11, E);         // 裙
    R(c, cx - 9, T + 52, 18, 5, E);           // 腿
    R(c, cx - 10, T + 56, 20, 8, E);          // 鞋

    // ── 头发：圆后脑（ell 成型，去方发罩）+ 两条垂发到腰 ──
    ell(c, cx - 2, T + 9, 11, 9, C.hairBr);       // 后脑（中心偏左，头转右）
    R(c, cx + 6, T + 15, 5, 4, C.hairBr);         // 右下颌处的发（补圆）
    R(c, cx - 3, T + 1, 8, 1, C.hairBr);          // 顶点补窄弧
    R(c, cx - 10, T + 13, 4, 4, C.hairBr);        // 左肩过渡（内收 1px）
    R(c, cx - 10, T + 16, 4, 25, C.hairBr);       // 左侧长垂（比头顶窄 1px）
    R(c, cx - 11, T + 4, 2, 11, C.hairBr);        // 耳侧一缕外扩
    R(c, cx - 10, T + 4, 1, 11, C.hairBrHi);      // 左缘受光
    R(c, cx + 8, T + 19, 4, 22, C.hairBr);        // 右侧长垂（下颌以下）
    R(c, cx + 11, T + 19, 1, 22, C.hairBrDk);
    R(c, cx + 8, T + 20, 1, 18, C.hairBrHi);      // 垂发受光边
    // 发梢锯齿
    R(c, cx - 10, T + 40, 2, 2, C.hairBrDk);
    R(c, cx - 7, T + 41, 2, 1, C.hairBr);
    R(c, cx + 9, T + 40, 2, 2, C.hairBrDk);
    // 发丝高光（顶弧一条 + 后脑一条）
    R(c, cx - 7, T + 3, 6, 1, C.hairBrHi);
    R(c, cx - 9, T + 6, 2, 3, C.hairBrHi);
    R(c, cx - 10, T + 15, 2, 9, '#7A5448');       // 左垂发一道亮
    R(c, cx - 5, T + 9, 1, 24, C.hairBrDk);       // 长发分缝

    // ── 3/4 侧脸（宽 9，上宽下窄，脸缘不出描边）──
    R(c, cx + 3, T + 4, 9, 9, C.skin);            // 颧骨以上（贴到描边）
    R(c, cx + 3, T + 13, 8, 3, C.skin);           // 下颌收 1px
    R(c, cx + 4, T + 16, 6, 1, C.skin);           // 下巴收 3px
    R(c, cx + 10, T + 12, 2, 3, C.skin);          // 上唇（侧脸凸出）
    R(c, cx + 3, T + 16, 8, 1, C.skinDk);         // 下颌线
    R(c, cx + 5, T + 17, 5, 1, C.skinDk);         // 脖影
    R(c, cx + 11, T + 6, 1, 8, C.skinLt);         // 脸颊外缘一点受光
    // 刘海：压上 2px，左侧厚（斜边界＝转头感）
    R(c, cx + 3, T + 3, 9, 2, C.hairBr);
    R(c, cx + 3, T + 5, 3, 3, C.hairBr);
    R(c, cx + 6, T + 4, 2, 1, C.hairBr);          // 侧刘尖
    R(c, cx + 10, T + 3, 2, 1, C.hairBr);
    // 五官：一只眼 + 鼻 + 嘴点 + 腮红（无眉）
    R(c, cx + 8, T + 8, 2, 2, C.hair);            // 眼
    R(c, cx + 10, T + 13, 2, 1, '#A85A58');       // 嘴
    R(c, cx + 5, T + 11, 2, 2, C.blush);          // 腮红
    R(c, cx + 4, T + 9, 1, 4, C.skinDk);          // 耳前阴影
    R(c, cx + 8, T + 14, 2, 1, C.skinDk);         // 下巴投影（让下颌有转折）
    // 星星发夹（金色，压顶发偏右）
    R(c, cx + 7, T + 2, 3, 1, C.gold);
    R(c, cx + 8, T + 1, 1, 3, C.gold);
    R(c, cx + 8, T + 2, 1, 1, '#FFF0C0');

    // ── 脖子 ──
    R(c, cx - 2, T + 16, 6, 5, C.skinDk);
    R(c, cx - 1, T + 16, 4, 1, C.skin);

    // ── 暗棕红外套（21 宽 21 高，3 条竖缝）──
    R(c, cx - 11, T + 20, 22, 13, C.coat);        // 上段（肩最宽）
    R(c, cx - 10, T + 33, 20, 8, C.coat);         // 下段（腰收 1px）
    R(c, cx - 11, T + 20, 3, 13, C.coatDk);       // 左背光
    R(c, cx - 10, T + 33, 3, 8, '#4A2024');
    R(c, cx + 8, T + 20, 3, 13, C.coatLt);        // 右受光
    R(c, cx + 7, T + 33, 3, 8, C.coatLt);
    R(c, cx - 11, T + 20, 22, 1, C.coatLt);       // 肩线
    R(c, cx - 8, T + 23, 1, 15, C.coatLt);        // 竖缝 ×3
    R(c, cx - 3, T + 23, 1, 15, C.coatLt);
    R(c, cx + 3, T + 23, 1, 15, C.coatLt);
    R(c, cx - 1, T + 20, 1, 21, C.coatDk);        // 开襟
    R(c, cx - 10, T + 37, 20, 1, '#4A2024');      // 下摆暗线
    // 领口（她回头看，领子翻起）
    R(c, cx - 5, T + 18, 12, 3, C.coatDk);
    R(c, cx - 4, T + 19, 10, 1, C.skinDk);

    // ── 手臂 + 手 ──
    // 臂与身之间留 1px 深色分隔（否则臂读不出来）
    R(c, cx - 12, T + 21, 2, 14, C.coatDk);
    R(c, cx + 10, T + 21, 2, 14, C.coatLt);
    R(c, cx - 10, T + 21, 1, 14, '#3E1A1E');
    R(c, cx + 9, T + 21, 1, 14, '#3E1A1E');
    R(c, cx - 12, T + 34, 2, 4, C.skin);
    R(c, cx + 11, T + 34, 1, 4, C.skin);
    R(c, cx - 12, T + 34, 2, 1, C.skinLt);
    R(c, cx + 11, T + 34, 1, 1, C.skinLt);

    // ── 绿色内搭边（参考里外套下缘那条绿）──
    R(c, cx - 10, T + 39, 20, 2, '#356048');
    R(c, cx - 10, T + 39, 20, 1, '#3E7058');

    // ── 蓝紫裙（竖褶）──
    R(c, cx - 9, T + 41, 19, 11, '#2E3A6E');
    R(c, cx - 9, T + 41, 19, 1, '#3A4880');
    for (let i = 0; i < 4; i++) R(c, cx - 7 + i * 4, T + 42, 1, 9, '#232E5A');
    R(c, cx - 9, T + 51, 19, 1, '#232E5A');

    // ── 腿（肤色，露膝下）──
    R(c, cx - 8, T + 52, 7, 5, C.skin);
    R(c, cx + 2, T + 52, 7, 5, C.skin);
    R(c, cx - 8, T + 52, 1, 5, C.skinLt);
    R(c, cx + 8, T + 52, 1, 5, C.skinDk);

    // ── 白鞋 ──
    R(c, cx - 9, T + 56, 9, 6, C.shoeW);
    R(c, cx + 1, T + 56, 9, 6, C.shoeW);
    R(c, cx - 9, T + 56, 9, 1, C.shoeWlt);
    R(c, cx + 1, T + 56, 9, 1, C.shoeWlt);
    R(c, cx - 9, T + 60, 9, 2, '#B8B4AC');
    R(c, cx + 1, T + 60, 9, 2, '#B8B4AC');
  }

  // ══════════════════════════════════════════════════════
  // 场景：横向场景带（天 / 海 / 沙 / 前景），人物站在沙带
  // ══════════════════════════════════════════════════════
  const HOR = 78;      // 海平线
  const FY = 152;      // 人物脚底线

  function drawScene(c) {
    // ① 天（3 档，上浅下深）
    R(c, 0, 0, 320, 22, C.sky1);
    R(c, 0, 22, 320, 20, C.sky2);
    R(c, 0, 42, 320, 18, C.sky3);
    R(c, 0, 60, 320, 18, C.sky4);
    // 云：傍晚横向云团（3 层堆叠成块，下缘带橙边）
    // 云：横向薄云带（3 层平铺 + 断口），不做团块（团块会像飞碟）
    const clouds = [[26, 13, 46], [104, 6, 32], [176, 18, 54], [258, 10, 30], [64, 34, 24]];
    for (const [x, y, w] of clouds) {
      R(c, x, y, w, 2, '#7E6890');                // 上缘（全宽）
      R(c, x + 4, y + 2, w - 6, 2, '#6A5680');    // 主体（左收右延，不对称）
      R(c, x + 1, y + 4, w - 10, 1, '#5A4A70');   // 下缘（左伸）
      R(c, x + 7, y + 5, w - 19, 1, '#C8846E');   // 暖光（右偏一段）
      R(c, x + 9, y + 1, w - 22, 1, '#9C84A8');   // 受光
    }
    // 落日位置的地平线辉光
    glow(c, 250, 66, 110, 40, '#FFC888', .22);
    // ② 远岛 + 灯塔
    R(c, 232, 74, 36, 4, '#3E4470');
    R(c, 236, 72, 28, 2, '#4E5480');
    R(c, 246, 71, 15, 1, '#3E4470');
    R(c, 254, 66, 3, 4, '#C8463C');
    R(c, 254, 65, 3, 1, '#F0F0E8');
    // ③ 海（6 层 + 浪线）
    const bands = [[78, 6, C.sea1], [84, 5, '#465288'], [89, 5, C.sea2], [94, 5, '#344268'],
                   [99, 6, C.sea3], [105, 7, C.sea4], [112, 8, C.sea5]];
    for (const b of bands) R(c, 0, b[0], 320, b[1], b[2]);
    // 浪线：只在近海更密，颜色压到 #8A7A98（不要像星星）
    for (let i = 0; i < 20; i++) {
      const x = (i * 41) % 312, y = 82 + (i * 11) % 34;
      R(c, x, y, 4 + (i % 3), 1, '#6A6090');
    }
    for (let i = 0; i < 22; i++) {
      const x = (i * 37) % 314, y = 104 + (i * 9) % 14;
      R(c, x, y, 5 + (i % 4), 1, '#8A7A98');
    }
    // 落日倒影带（参考图2 的橙色水面反光，竖向碎斑）
    // 落日倒影：密集 1px 竖向反光（参考图2 江面形态：细、密、明暗交替）
    for (let i = 0; i < 44; i++) {
      const x = 200 + (i * 7) % 112;
      const y = 84 + (i * 11) % 28;
      const h = 2 + (i % 2);
      R(c, x, y, 1, h, i % 3 === 0 ? '#C89A78' : (i % 3 === 1 ? '#A0826E' : '#8A7A98'));
    }
    // ④ 沙滩（从湿沙线 120 起，海 78–120 完整露出）
    R(c, 0, 120, 320, 22, C.sand1);
    R(c, 0, 138, 320, 4, '#D0A066');              // 过渡带 1
    R(c, 0, 142, 320, 24, C.sand2);
    R(c, 0, 162, 320, 4, '#8A6238');              // 过渡带 2
    R(c, 0, 166, 320, 14, '#8E6638');
    // 横向沙纹（微妙的湿沙层理，不是硬分界）
    for (let i = 0; i < 9; i++) {
      const y = 128 + i * 6;
      R(c, 0, y, 320, 1, i % 2 ? '#CC9A62' : '#D8A870');
    }
    // 远处退潮线（断续白）
    for (let i = 0; i < 9; i++) {
      const x = (i * 39) % 300, w = 8 + (i % 4) * 6;
      R(c, x, 126 + (i % 3) * 2, w, 1, '#E8D0A8');
    }
    for (let i = 0; i < 26; i++) {
      const x = (i * 43) % 316, y = 126 + (i * 23) % 50;
      R(c, x, y, 1, 1, i % 4 ? '#96683C' : '#C8A070');
    }
    // 湿沙线：断续的深沙色条（不是一条连续横线）
    R(c, 0, 118, 320, 2, '#B08454');
    for (let i = 0; i < 22; i++) {
      const x = (i * 31) % 314, w = 4 + (i % 5) * 4;
      R(c, x, 117 + (i % 2), w, 1, '#96703E');
    }
    for (let i = 0; i < 10; i++) {
      const x = (i * 61) % 300, w = 6 + (i % 3) * 5;
      R(c, x, 119, w, 1, '#D0B088');   // 浪花白（少量）
    }

    // ⑤ 左：小卖部
    R(c, 2, 56, 70, 76, C.w3);
    R(c, 2, 56, 70, 2, C.w5);
    R(c, 2, 56, 2, 76, C.w5);
    R(c, 70, 56, 2, 76, C.w2);
    for (let y = 60; y < 132; y += 9) R(c, 2, y, 70, 1, C.w2);
    // 遮阳棚（斜挑出墙顶，齿边压在墙上缘）
    for (let i = 0; i < 7; i++) R(c, i * 11, 49, 11, 7, i % 2 ? '#E8D8A8' : '#4E7E9E');
    R(c, 0, 56, 76, 2, C.blueDk);
    R(c, 0, 58, 76, 1, C.w2);
    for (let i = 0; i < 7; i++) R(c, 2 + i * 11, 53, 5, 3, i % 2 ? '#D8C898' : '#5E8AA8');
    // 招牌
    R(c, 8, 62, 56, 12, C.p1);
    R(c, 9, 63, 54, 10, C.p2);
    R(c, 8, 62, 56, 1, C.p3);
    R(c, 8, 73, 56, 1, '#8A6A48');
    // 窗 + 货架
    R(c, 8, 78, 30, 26, '#3A2A20');
    R(c, 9, 79, 28, 24, '#5A4632');
    for (let i = 0; i < 3; i++) {
      R(c, 10, 82 + i * 7, 26, 1, C.w2);
      for (let j = 0; j < 4; j++) R(c, 12 + j * 6, 79 + i * 7, 3, 3, [C.red, C.green, '#E8A058', C.blue][(i + j) % 4]);
    }
    R(c, 8, 78, 30, 2, '#2A1E16');
    // 冰柜
    R(c, 42, 86, 26, 30, '#C8C8C0');
    R(c, 42, 86, 26, 4, '#5E8AA8');
    R(c, 42, 86, 2, 30, '#A8A8A0');
    R(c, 66, 86, 2, 30, '#909088');
    R(c, 44, 92, 22, 20, '#A8C8D8');
    R(c, 46, 94, 8, 6, C.red);
    R(c, 56, 94, 8, 6, C.green);
    R(c, 46, 102, 8, 6, '#E8A058');
    R(c, 56, 102, 8, 6, C.blue);
    // 台阶
    R(c, 2, 129, 70, 4, '#9A7840');
    R(c, 2, 131, 70, 2, '#7A5A2E');

    // ⑥ 右：更衣室
    R(c, 266, 58, 54, 74, '#4E7E9E');
    R(c, 266, 58, 54, 2, '#6A96B4');
    R(c, 266, 58, 2, 74, C.blueLt);
    R(c, 318, 58, 2, 74, C.blueDk);
    for (let y = 62; y < 132; y += 8) R(c, 266, y, 54, 1, C.blueDk);
    R(c, 262, 52, 58, 6, C.w4);
    R(c, 262, 52, 58, 2, C.w6);
    R(c, 262, 58, 58, 2, C.w2);
    // 红门
    R(c, 284, 84, 20, 48, C.red);
    R(c, 285, 85, 18, 46, C.redLt);
    R(c, 284, 84, 20, 2, '#8A2A24');
    R(c, 284, 130, 20, 2, '#8A2A24');
    R(c, 285, 85, 2, 46, '#E8746A');
    R(c, 299, 106, 2, 2, '#F0D060');
    R(c, 292, 94, 4, 10, '#C8E0E8');
    R(c, 292, 94, 4, 1, '#FFFFFF');
    // 救生圈
    ell(c, 310, 70, 6, 6, '#F0F0E8');
    ell(c, 310, 70, 3, 3, C.blue);
    R(c, 304, 67, 12, 2, C.red);
    R(c, 304, 73, 12, 2, C.red);
    R(c, 304, 67, 2, 8, C.red);
    R(c, 314, 67, 2, 8, C.red);
    R(c, 304, 67, 12, 1, '#F8B0A8');
    // 木牌
    R(c, 284, 71, 26, 9, C.w2);
    R(c, 285, 72, 24, 7, C.p2);
    R(c, 284, 71, 26, 1, C.w6);
    R(c, 284, 79, 26, 1, '#6A4422');

    // ⑦ 木栈桥（中景，在人物身后）
    // 海边栈道栏杆（参考图2 形态：上下两根横杆 + 稀疏竖柱，深灰紫）
    const RL = 76, RR = 244, RY = 106;
    R(c, RL, RY, RR - RL, 2, '#4A4058');          // 上横杆
    R(c, RL, RY, RR - RL, 1, '#6A5E7A');
    R(c, RL, RY + 10, RR - RL, 1, '#3E3448');     // 下横杆
    for (let x = RL; x < RR; x += 14) {           // 竖柱
      R(c, x, RY + 1, 1, 10, '#4A4058');
      R(c, x, RY + 1, 1, 2, '#6A5E7A');
    }
    // 立柱（每 56px 一根，比栏杆粗）
    for (let i = 0; i < 4; i++) {
      const px0 = RL + 4 + i * 56;
      R(c, px0, RY - 2, 2, 20, '#3E3448');
      R(c, px0, RY - 2, 1, 20, '#5A4E6C');
      R(c, px0 - 1, RY - 3, 4, 1, '#6A5E7A');
    }
    // 栏杆尽头的灯
    R(c, RR - 2, RY - 8, 2, 6, '#3E3448');
    R(c, RR - 2, RY - 8, 2, 3, '#FFD166');

    // ⑧ 地面暖光斑（参考里人物脚下的光斑，此处为阳光）
    ell(c, 156, 156, 38, 5, '#DCAE68');
    R(c, 120, 154, 72, 3, '#D0A05C');
    ell(c, 156, 156, 28, 3, '#E8BC78');
    ell(c, 156, 157, 17, 2, '#F4D294');

    // ⑨ 人物地面淡影（先画影，再画人）
    ell(c, 137, 153, 13, 3, '#A87848');
    ell(c, 175, 153, 12, 3, '#A87848');
    // ⑩ 人物（脚底 FY=152，身高 62 = 画面 34%，中心距 38px）
    boyBack(c, 137, FY);
    girlTurn(c, 175, FY);

    // ⑩ 前景小物
    R(c, 24, 150, 9, 4, '#E8A058');
    R(c, 24, 150, 9, 1, '#F0C070');
    R(c, 38, 157, 9, 4, '#E8A058');
    R(c, 38, 157, 9, 1, '#F0C070');
    R(c, 94, 154, 4, 3, '#F0E0C0');       // 贝壳
    R(c, 102, 160, 3, 3, C.red);          // 海星
    R(c, 204, 158, 5, 3, C.p3);           // 纸袋
    R(c, 204, 158, 5, 1, '#FFFFFF');
    R(c, 238, 164, 8, 2, C.w3);           // 木板
    R(c, 296, 152, 3, 2, '#F0E0C0');
    // 遮阳伞（右下，只露一半）
    R(c, 302, 116, 20, 5, C.p3);
    R(c, 302, 116, 20, 2, C.red);
    R(c, 304, 121, 2, 10, C.w2);
    R(c, 310, 118, 12, 3, C.red);
    R(c, 310, 121, 12, 2, C.p3);

    // ⑪ 阳光 + 海面反光
    glow(c, 258, 40, 100, 56, '#FFC888', .12);
    for (let i = 0; i < 12; i++) {
      const x = 198 + (i * 23) % 112, y = 82 + (i * 11) % 30;
      R(c, x, y, 3 + (i % 3), 1, '#FFE0B0');
    }
    // 上暗角（压 HUD 区，让字读得出）
    c.save(); c.globalAlpha = .22; c.fillStyle = '#1A2A38';
    c.fillRect(0, 0, 320, 14); c.restore();
    // 下暗角（压字幕区 + 前景，让人物成为亮点）
    c.save(); c.globalAlpha = .16; c.fillStyle = '#2A1A10';
    c.fillRect(0, 160, 320, 20); c.restore();
  }

  // ══════════════════════════════════════════════════════
  // 文字（像素风点阵字：无描边光，1px 深色硬边）
  // ══════════════════════════════════════════════════════
  function T(c, s, x, y, size, col, a, ls, align, stroke) {
    c.save();
    c.globalAlpha = a == null ? 1 : a;
    c.font = `${size}px KT, XK, serif`;
    c.textAlign = align || 'left';
    c.textBaseline = 'alphabetic';
    const chars = [...s];
    let w = 0;
    for (const ch of chars) w += c.measureText(ch).width + (ls || 0);
    let cx = align === 'center' ? x - (w - (ls || 0)) / 2 : (align === 'right' ? x - (w - (ls || 0)) : x);
    for (const ch of chars) {
      const cw = c.measureText(ch).width;
      if (stroke) {
        c.fillStyle = stroke;
        for (const d of [[-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, -2], [-2, 2], [2, 2]]) c.fillText(ch, cx + d[0], y + d[1]);
      }
      c.fillStyle = col;
      c.fillText(ch, cx, y);
      cx += cw + (ls || 0);
    }
    c.restore();
  }

  window.SPEC = {
    fps: 24, duration: 4.0,
    grade: 'brightness(1.02) saturate(1.05) contrast(1.02)',
    fadeIn: .2, fadeOut: .2,
    shots: [{ t0: 0, t1: 4.0, scene: 'beach', vig: .16, draw(pc) { drawScene(pc); } }],
    subs: [],

    hud(c, W, H, t) {
      const k = W / 320;

      // ═══ 场景招牌字（写在招牌块上：米黄底 + 深棕字，零发光）═══
      T(c, '海边小卖部', 36 * k, 71.4 * k, Math.round(5.4 * k), '#4A3520', 1, 0, 'center');
      T(c, '更衣室', 297 * k, 78.2 * k, Math.round(4.2 * k), '#4A3520', 1, 0, 'center');

      // ═══ 顶部 HUD（照参考：无面板，直接压画面 + 1px 硬描边）═══
      const a0 = HZ((t - .3) / .6);
      T(c, 'DAY 97　2015.06.06', 6 * k, 13 * k, Math.round(6.2 * k), C.uiTxt, a0, 0, 'left', '#0A1018');
      T(c, '17:50　海边 · 傍晚', 6 * k, 21.5 * k, Math.round(6.2 * k), C.uiDim, a0, 0, 'left', '#0A1018');

      // ═══ 右上：想念计量条（12 格 + 12/12）═══
      const a1 = HZ((t - .5) / .6);
      const bw = 46 * k, bx = W - 6 * k - bw, by = 4 * k;
      // ♥ 想念 标签
      T(c, '♥', bx - 25 * k, 11 * k, Math.round(6.4 * k), C.pink, a1, 0, 'left', '#2A0A16');
      T(c, '想念', bx - 19 * k, 11 * k, Math.round(5.4 * k), C.uiTxt, a1, 0, 'left', '#0A1018');
      // 12 格粉条
      const cellW = 3.4 * k, gap = .5 * k, cellH = 5 * k;
      for (let i = 0; i < 12; i++) {
        const x = bx + i * (cellW + gap), y = by + 1 * k;
        c.save(); c.globalAlpha = a1;
        c.fillStyle = C.pinkDk; c.fillRect(x - .5 * k, y - .5 * k, cellW + k, cellH + k);
        c.fillStyle = C.pink;   c.fillRect(x, y, cellW, cellH);
        c.fillStyle = '#F8A0C0'; c.fillRect(x, y, cellW, 1 * k);
        c.restore();
      }
      T(c, '12/12', bx + bw, by + 12.4 * k, Math.round(5.6 * k), C.uiTxt, a1, 0, 'right', '#0A1018');

      // ═══ 右侧：轨迹记录面板（深蓝底 + 浅蓝边 + 进度条）═══
      const a2 = HZ((t - .8) / .6);
      if (a2 > 0) {
        const px0 = W - 46 * k, py0 = 23 * k, pw = 40 * k, ph = 17 * k;
        c.save(); c.globalAlpha = a2;
        c.fillStyle = C.uiBg; c.fillRect(px0, py0, pw, ph);
        c.fillStyle = C.uiBg2; c.fillRect(px0 + 1, py0 + 1, pw - 2, ph - 2);
        c.fillStyle = C.uiEdge;
        c.fillRect(px0, py0, pw, 1); c.fillRect(px0, py0 + ph - 1, pw, 1);
        c.fillRect(px0, py0, 1, ph); c.fillRect(px0 + pw - 1, py0, 1, ph);
        // 进度条
        c.fillStyle = '#0A1220'; c.fillRect(px0 + 3, py0 + 3, pw - 6, 3 * k);
        c.fillStyle = '#3A6AAE'; c.fillRect(px0 + 3, py0 + 3, (pw - 6) * .72, 3 * k);
        c.fillStyle = '#6A9AE0'; c.fillRect(px0 + 3, py0 + 3, (pw - 6) * .72, 1);
        // 小三角
        c.fillStyle = C.uiEdge;
        c.beginPath();
        c.moveTo(px0 + 4, py0 + 8 * k); c.lineTo(px0 + 8, py0 + 8 * k); c.lineTo(px0 + 6, py0 + 10 * k);
        c.closePath(); c.fill();
        c.restore();
        T(c, '轨迹记录', px0 + 4 * k, py0 + 15.4 * k, Math.round(6 * k), C.uiTxt, a2, 0, 'left', '#0A1018');
      }

      // ═══ 底部字幕条（深底 + 浅蓝边 + 蓝♪ + 黄字）═══
      const a3 = HZ((t - .9) / .7);
      if (a3 > 0) {
        const text = '那天的海风是咸的';
        const fs = Math.round(7.2 * k);
        c.save(); c.globalAlpha = a3;
        c.font = `${fs}px KT, XK, serif`;
        const tw = c.measureText(text).width;
        const barW = tw + 22 * k, barH = 12 * k;
        const barX = (W - barW) / 2, barY = H - 20 * k;
        // 底
        c.fillStyle = 'rgba(12,14,26,.86)'; c.fillRect(barX, barY, barW, barH);
        c.fillStyle = C.uiEdge;
        c.fillRect(barX, barY, barW, 1); c.fillRect(barX, barY + barH - 1, barW, 1);
        c.fillRect(barX, barY, 1, barH); c.fillRect(barX + barW - 1, barY, 1, barH);
        // 蓝色竖条 + ♪
        c.fillStyle = '#2E5A9E'; c.fillRect(barX + 1, barY + 1, 1, barH - 2);
        c.fillStyle = '#5A9AE8';
        c.fillRect(barX + 4 * k, barY + 3 * k, 1.4 * k, 5 * k);
        c.fillRect(barX + 5.4 * k, barY + 3 * k, 2 * k, 1.4 * k);
        c.fillRect(barX + 7.4 * k, barY + 3 * k, 1 * k, 3 * k);
        c.restore();
        T(c, text, barX + 10 * k, barY + 8.8 * k, fs, '#FFD166', a3, 0.4 * k, 'left', '#20160A');
      }
    },
  };

  function HZ(p) { return p <= 0 ? 0 : (p >= 1 ? 1 : p * p * (3 - 2 * p)); }
})();
