// act4.js —— 镜 17–23（41.72–55.667）· 风 / 纸雨 / 空纸条 / 退出灯箱 / 现实 / 影子相拥
(() => {

  // ---------- 镜 17 · 41.72–43.45 ·「爱怎么随风而起」 ----------
  // 大时刻 C：风从左边灌进来——所有纸同时朝右上方倾 12°，然后离地飞起。他 scared，被风推得往后滑。
  function s17(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 17);
    const gust = ease(seg(t, 41.72, 42.2));
    const lift = easeIn(seg(t, 42.88, 43.45));
    const z = lerp(1.08, .92, ease(seg(t, 41.72, 43.4)));
    dgShell(p, { glowK: .45 });
    dgCam(-70 * gust + 140 * lift, 40, z);
    dgSky(p, { k: lk });
    dgHills(p);
    dgWall(p, { k: lk });
    dgFloor(p, { poolK: lk, rug: { x: 200, y: FTOP + 96, w: 520, h: 190 } });
    // 所有小东西同时被吹起来（层片按 z 不同速度，视差最强的一镜）
    dgLayer(.46, () => {
      push(); translate(CX, GY); rotate(-.10 * gust); translate(-CX, -GY);
      dgRail(p, 700, 962, 236, { n: 3, wind: gust * 1.4 });
      pop();
      dgWallArt(p, [{ x: 508, y: 520, w: 96, h: 112 }]);
    });
    // 近处的衣物、照片被卷起来
    dgLayer(.80, () => {
      for (let i = 0; i < 14; i++) {
        const s = 26 + hash(i * 3.7) * 54;
        const x = BOX.x0 + 60 + hash(i * 5.3) * (BW - 120) + lift * (280 + hash(i) * 320);
        const y = GY - 40 - hash(i * 7.9) * 720 - lift * (220 + hash(i * 2.1) * 420);
        if (y < BOX.y0 - 80) continue;
        dgBit(x, y, s, mixCol(p.mid, p.light, .25 + hash(i) * .35), gust * 1.1 + lift * 2.4 + hash(i) * .6);
      }
    });
    dgLayer(.74, () => dgSuitcase(p, 300, GY - 112, 260, 112, { open: true, tags: false }));
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'scared'], [42.9, 'scared'], [43.2, 'sad']]);
      const slide = easeIn(seg(t, 42.6, 43.4));
      dgHim(470 + 190 * slide, 26, mood, { view: 'q', flip: true, dy: (mood.dy || 0) + .2 - lift * .3, rot: -.10 * gust, emote: null,
        aL: -.9 - .5 * gust, aR: -.7 - .6 * lift, lookY: -.3, lookX: -.7 });
    });
    dgLayer(1, () => dgDust(p, 26, 41, { k: .5 }));
    dgCamEnd();
  }

  // ---------- 镜 18 · 43.45–45.02 ·「又消散风雨里」 ----------
  // 相机在窗框外面，透过窗看里面下雨；窗框是一块近乎全黑的剪纸，压住画面四周。
  function s18(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 18);
    const z = 1.16 + .06 * ease(lt / dur);
    dgShell(p, { glowK: .4 });
    dgCam(120, 120, z);
    dgSky(dgDim(p, .35), { k: lk });
    dgWall(dgDim(p, .25), { k: lk, win: { x: 152, y: 430, w: 296, h: 420 } });
    dgFloor(dgDim(p, .3), { poolK: lk * .6 });
    // 里面：他很小，隔着窗看雨
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'scared'], [44.2, 'scared'], [44.9, 'sad']]);
      dgHim(500, 15, mood, { view: 'front', dy: (mood.dy || 0) + .4, emote: null, lookY: -.4, aL: -.4, aR: -.4 });
    });
    // 纸雨：从右上斜着落下来
    dgLayer(.94, () => {
      for (let i = 0; i < 70; i++) {
        const sp = 420 + hash(i * 3.1) * 900;
        const ph = frac(hash(i * 7.7) + t * sp / 1400);
        const x = BOX.x0 + 40 + hash(i * 2.3) * (BW - 80) + ph * 260;
        const y = -80 + ph * (BH + 160);
        const s = 9 + hash(i * 5.5) * 16;
        const strip = frac(ph * 5 + i) < .45;   // 一部分被撕成细条
        if (strip) {
          paint([[x, y], [x + s * .31, y + s * 2.1], [x + s * .62, y + s * .2], [x + s * .31, y - s * .2]], { wash: mixCol(p.mid, p.light, .34), washOp: 225, ink: null });
        } else dgBit(x, y, s, mixCol(p.mid, p.light, .3 + hash(i) * .3), 1.2 + hash(i) * .8);
      }
    });
    // 窗框：近平面遮挡，压住画面四周
    dgLayer(1.0, () => {
      const f = mixCol(p.front, '#04030a', .4), w = 86;
      paint(rectPts(BOX.x0 - 60, BOX.y0 - 60, w + 60, BH + 120), { wash: f, ink: null });
      paint(rectPts(BOX.x1 - w, BOX.y0 - 60, w + 60, BH + 120), { wash: f, ink: null });
      paint(rectPts(BOX.x0 - 60, BOX.y0 - 60, BW + 120, 130), { wash: f, ink: null });
      paint(rectPts(BOX.x0 - 60, BOX.y1 - 90, BW + 120, 150), { wash: f, ink: null });
      inkLine([[BOX.x0 + w - 4, BOX.y0], [BOX.x0 + w - 4, BOX.y1]], 3, mixCol(p.rim, p.front, .22), 'inkfine', .2);
      inkLine([[BOX.x1 - w + 4, BOX.y0], [BOX.x1 - w + 4, BOX.y1]], 3, mixCol(p.rim, p.front, .18), 'inkfine', .2);
      // 玻璃上的水痕（纸浆纤维晕开）
      const wet = ease(seg(t, 44.24, 44.98));
      for (let i = 0; i < 12; i++) {
        const x = BOX.x0 + 100 + hash(i * 3.9) * (BW - 200), y = BOX.y0 + 240 + hash(i * 6.1) * 900;
        const h = (60 + hash(i * 2.2) * 140) * wet;
        inkLine([[x, y], [x + 4, y + h * .5], [x - 2, y + h]], 1.6, mixCol(p.rim, p.mid, .30), 'inkfine', .4);
      }
    });
    dgCamEnd();
  }

  // ---------- 镜 19 · 45.02–46.15 ·「找个理由」 ----------
  // 特写：他在雨里蹲下，从怀里掏出一张折起来的纸条。手指抖。
  function s19(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 19);
    const z = 1.40 + .10 * ease(lt / dur);
    dgShell(p, { glowK: .35 });
    dgCam(0, 500, z);
    dgEmpty(p, { k: .4, gx: 540, gy: 1200 });
    const out = ease(seg(t, 45.02, 45.30)), half = ease(seg(t, 45.36, 45.60));
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'nervous'], [45.4, 'nervous']]);
      const shake = Math.sin(t * 26) * .02;
      dgHim(520, 32, mood, { view: 'q', dy: (mood.dy || 0) + 1.0, noLegs: true, emote: null,
        aR: .7 + .2 * out, aL: .1 + .1 * shake, lookY: 1, lookX: .3 });
      dgKneel(520, 1584, 32, dgDimCol(PAL.clayDk, .2));
      // 手里的纸条：先是一折，再展开一半
      const nx = 520 + 32 * 3.4, ny = 1584 - 32 * 2.6;
      push(); translate(nx, ny); rotate(-.2 + .25 * half);
      const w = 34 + 26 * half, h = 46 - 8 * half;
      dgPaper(rectPts(-w / 2, -h / 2, w, h, .6), mixCol(p.light, '#ffffff', .42), { shadow: false, sk: .5,
              rim: [[-w / 2, -h / 2 + 1], [w / 2, -h / 2 + 1]], rimCol: mixCol(p.rim, p.light, .6), rimW: 1.6 });
      inkLine([[0, -h / 2 + 4], [0, h / 2 - 4]], 1.2, mixCol(p.mid, p.front, .4), 'inkfine', .2);
      pop();
    });
    dgCamEnd();
    dgVeil(Math.max(0, 1 - lt / .22) * .8);
  }

  // ---------- 镜 20 · 46.15–49.50 ·「却骗不过自己」 ----------
  // 纸条完全展开——上面是空的。他抬头，表情从 hopeful 掉到 sad。推到他脸上，停住 0.8s。
  function s20(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 20);
    const z = 1.42 + .26 * ease(seg(t, 46.6, 48.1));
    const drop = ease(seg(t, 48.32, 48.75));
    dgShell(p, { glowK: .3 });
    dgCam(0, lerp(520, 600, ease(seg(t, 46.2, 48.2))), z);
    dgEmpty(p, { k: .38, gx: 540, gy: 1200 });
    // 展开的空白纸条（占画面下半，展开后什么都没有）
    const open = ease(seg(t, 46.15, 46.7));
    dgLayer(.80, () => {
      const w = 96 + 150 * open, h = 120 - 40 * open;
      push(); translate(666, 1470 - 26 * open); rotate(.42 - .30 * open);
      dgPaper(rectPts(-w / 2, -h / 2, w, h, 1), mixCol(p.light, '#ffffff', .38),
              { rim: [[-w / 2, -h / 2 + 1], [w / 2, -h / 2 + 1]], rimCol: mixCol(p.rim, p.light, .6), rimW: 2.2, sk: .8, sx: 6, sy: 10 });
      if (drop > .01) {   // 纸从他手里滑落
        translate(0, drop * drop * 300); rotate(drop * .5);
      }
      pop();
    });
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'hopeful'], [46.72, 'hopeful'], [47.66, 'sad'], [48.4, 'sad']]);
      const look = ease(seg(t, 46.72, 47.1));
      dgHim(540, 30, mood, { view: 'front', dy: (mood.dy || 0) + .8, noLegs: true, emote: null,
        lookY: 1 - 1.9 * look, aL: .5 - .4 * look, aR: .5 - .4 * look });
      dgKneel(540, 1584, 30, dgDimCol(PAL.clayDk, .2));
    });
    dgCamEnd();
    if (lt > dur - .3) dgVeil(ease(seg(lt, dur - .3, dur - .05)));
  }

  // ---------- 镜 21 · 49.50–51.40 ·「到结局」 ----------
  // 房间空了：一盏灯、一个关好的纸箱、一把椅子。镜头退出箱体，先看见内壁，再看见黑衬里，最后看见木框。
  function s21(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 21);
    const out = ease(seg(t, 49.50, 51.20));
    const z = lerp(1.02, .58, out);
    dgCam(0, lerp(0, -40, out), z);
    // 桌面（"现实"）铺在箱体外面
    paint(rectPts(CX - 2600, CY - 2200, 5200, 4400), { wash: '#0d0a12', ink: null });
    paint(rectPts(CX - 2600, BOX.y1 + 54, 5200, 1400), { wash: '#1d1524', ink: null });
    dgRim([[CX - 2600, BOX.y1 + 55], [CX + 2600, BOX.y1 + 55]], 2.4, mixCol(p.rim, '#1d1524', .34));
    glow(CX, BOX.y1 + 120, 700, p.warm, .14);
    dgShell(p, { bare: true, glowK: .9, frame: 34, liner: 16, wood: '#2a1d24' });
    dgEmpty(dgDim(p, .06), { k: 1.1, gx: 540, gy: 980 });
    dgLayer(.74, () => {
      // 关好的纸箱 + 椅子 + 那盏灯
      dgCrates(p, 300, GY - 4, { n: 1 });
      dgChair(dgDim(p, .3), 700, GY + 8);
      dgLamp(p, 610, 420, { k: 1.1 * lk });
    });
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'bored'], [50.4, 'sad']]);
      dgHim(500, 20, mood, { view: 'front', dy: (mood.dy || 0) + 1.6, noLegs: true, emote: null, lookY: .4, aL: -.7, aR: -.7 });
    });
    dgCamEnd();
  }

  // ---------- 镜 22 · 51.40–52.72 ·「我只是可惜」 ----------
  // 现实世界：桌上一个亮着的灯箱，旁边一只真的纸箱，箱盖上贴着一张照片。灯箱的暖光漏在桌面上。
  function s22(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 22);
    const pan = ease(seg(t, 51.40, 52.72));
    const z = .60 + .03 * pan;
    dgCam(-70 + 60 * pan, -88 + 20 * pan, z);
    paint(rectPts(CX - 2600, CY - 2200, 5200, 4400), { wash: '#0b0810', ink: null });
    // 桌面：一块深色纸，被灯箱照出一小片暖
    paint(rectPts(CX - 2600, BOX.y1 + 54, 5200, 1400), { wash: '#241a28', ink: null });
    glow(CX - 240, BOX.y1 + 150, 460, p.light, .26 * lk);
    glow(CX - 300, BOX.y1 + 90, 220, p.light, .30 * lk);
    dgRim([[CX - 2600, BOX.y1 + 55], [CX + 2600, BOX.y1 + 55]], 2.4, mixCol(p.rim, '#241a28', .34));
    // 灯箱（就是整支片的那个盒子），里面已经空了，只有一点点暖
    dgShell(p, { bare: true, glowK: 1.0, frame: 34, liner: 16, wood: '#2a1d24' });
    dgEmpty(dgDim(p, .08), { k: 1.15, gx: 540, gy: 1000 });
    dgLayer(.74, () => dgCrates(p, 300, GY - 4, { n: 1 }));
    // 他真的还坐在灯箱里：透过纸，只是一个模糊的橙点
    dgLayer(.86, () => {
      glow(520, GY - 90, 120, p.warm, .30);
      clawd(520, GY, 18, { ...feel('sad', T, { view: 'front' }), emote: null, noShadow: true, aL: -.7, aR: -.7 });
    });
    // 灯箱旁边那只"真的"纸箱（不在箱体里，是外景道具）
    dgLayer(.05, () => {
      const bx = 96, by = 1660;
      dgPaper(rectPts(bx, by - 150, 250, 150, 1), mixCol('#4a3540', p.light, .12),
              { rim: [[bx, by - 149], [bx + 250, by - 149]], rimCol: mixCol(p.rim, '#4a3540', .48), rimW: 2.6, sk: 1.2, sx: 12, sy: 18 });
      dgPaper(rectPts(bx - 14, by - 176, 278, 30, .8), mixCol('#5a4048', p.light, .18),
              { rim: [[bx - 14, by - 175], [bx + 264, by - 175]], rimCol: mixCol(p.rim, '#5a4048', .5), rimW: 2.2 });
      // 箱盖上贴着一张照片
      dgPhoto(p, bx + 48, by - 232, 100, 84, { tint: .1 });
    });
    dgCamEnd();
  }

  // ---------- 镜 23 · 52.72–55.667 ·「不太够时间去拥抱你」 ----------
  // 回到箱内。后层那张纸被灯照亮，她的影子还在——影子比人留得久。
  // 他张开手臂，他的影子向前落到后层，慢慢与她的影子重叠成一个。
  function s23(t, lt, dur) {
    const p = dgPal(t), lk = dgFlick(t, 23);
    const open = ease(seg(t, 52.72, 53.36));
    const merge = ease(seg(t, 53.84, 55.36));
    const z = 1.20 + .02 * ease(seg(t, 55.0, 55.62));
    dgShell(p, { glowK: .5 + .4 * merge });
    dgCam(0, 430, z);
    // 后层：一张被灯从背后照亮的纸
    dgLayer(.18, () => {
      dgPaper(rectPts(BOX.x0 - 8, BOX.y0 - 8, BW + 16, BH + 16), mixCol(p.sky, p.front, .35), { shadow: false });
      glow(540, 980, 620, p.light, .34 * lk);
      glow(540, 980, 300, p.light, .26 * lk);
      // 星孔
      for (let i = 0; i < 30; i++) {
        const x = BOX.x0 + hash(i * 3.7) * BW, y = BOX.y0 + hash(i * 5.1) * (BH * .55);
        paint(rectPts(x, y, 2, 2), { wash: mixCol(p.light, '#ffffff', .7), washOp: 130, ink: null });
      }
    });
    // 地面
    dgLayer(.70, () => {
      paint(rectPts(BOX.x0 - 10, FTOP + 40, BW + 20, BOX.y1 - FTOP), { wash: mixCol(p.floor, p.front, .30), ink: null });
      dgRim([[BOX.x0, FTOP + 41], [BOX.x1, FTOP + 41]], 2.2, mixCol(p.rim, p.floor, .40));
      glow(540, GY + 10, 420, p.light, .18 * lk);
    });
    // 她的影子（人不在，影子在）——先在她自己的位置
    const hx = lerp(596, 646, merge);
    dgLayer(.30, () => {
      dgSilhouette(646, GY - 12, 26, mixCol(p.front, '#000000', .35), 165, .22);
    });
    // 他的影子：跟着 merge 往她的方向飘过去
    dgLayer(.32, () => {
      dgSilhouette(hx, GY - 12, 26, mixCol(p.front, '#000000', merge > .98 ? .02 : .30), 150, .2 + 1.0 * open);
    });
    // 影子交界处微亮（54.80「拥」影子相触）
    if (merge > .55) glow(lerp(596, 646, merge), GY - 130, 190, p.light, .18 * (merge - .55) / .45);
    // 他
    dgLayer(.86, () => {
      const mood = emotions(t, [[0, 'sad'], [53.3, 'cry'], [54.84, 'love'], [55.44, 'relieved']]);
      dgHim(470, 30, mood, { view: 'front', dy: (mood.dy || 0) + .1, emote: null,
        aL: -1 + 2.2 * open, aR: -1 + 2.2 * open, lookY: -.2, lookX: .4 });
      paint(ellPts(470, GY + 6, 160, 24, 18), { wash: '#05040b', washOp: 100, ink: null });
    });
    dgLayer(1, () => dgDust(p, 16, 53, { k: .3 }));
    dgCamEnd();
    dgVeil(ease(seg(t, 55.42, 55.63)) * .96);
  }

  shots([[41.72, s17], [43.45, s18], [45.02, s19], [46.15, s20], [49.50, s21], [51.40, s22], [52.72, s23]]);
})();
