# 《最美的期待》MV — 制作说明

## 成片

| 项 | 值 |
|---|---|
| 文件 | `out/mv.mp4`（28.5 MB） |
| 规格 | 1920×1080 / 24 fps / 1024 帧 / 42.667 s / H.264 + AAC 44.1k 立体声 |
| 画风 | 综艺节奏扁平（lemo-opuscar → game-show） |
| 主角 | Clawd（painted-animation 角色套件）；A 原色 `#D97757`，B 粉色 `#FF4FA3`（矮 8%、头顶一颗星） |
| 字幕 | 华文行楷（`assets/fonts/Xingkai.ttf`），逐字盖章，关键词放大 1.13× 换色 |

## 为什么选 game-show

`lemo-opuscar` 的六个候选里，`rubber-hose`、`memphis-diorama`、`pictogram-motion`、`paper-popup`、`cel-anime-80s` 都不适合这首歌的**情绪配比**：这首歌是"睁眼—闭眼—世界换布景"的结构，需要每一拍都换景、每一景都独立成立。game-show 的三条硬规则正好服务这一点：

1. **平涂矢量、单一近黑描边 `#1A1418`**——13 个镜头切换时，视觉重量恒定，不会因为某镜"更厚"而让剪辑失衡；
2. **一格一色相**——13 段各用一个主色（奶白 / 橙黄 / 深紫 / 深海蓝 / 薄荷 / 正红 / 亮黄 / 墨黑 / 橙 / 奶白 / 天蓝 / 薄荷 / 橙粉），色相跳变本身就是节奏；
3. **角色 12 fps（on twos）**——在高饱和平涂背景上，逐帧动画会"太滑"，on twos 才有综艺棚里的木偶感。

配套的"硬偏移投影"（向右下 9px、无模糊）取代了所有柔光，全片没有一处渐变、模糊或纹理（唯一例外是 S13 穿过瞳孔时用 26 条 46px 色带拼出的"伪渐变"，仍然是硬边）。

## 音乐网格

- BPM 139.75，period 0.4293 s，首拍 0.06 s，末拍 42.24 s，共 **100 拍**。
- 检测方法：`ffmpeg -ac 1 -ar 22050 -f f32le` → `scipy.stft` 谱通量 → 自相关估 BPM → 梳状相位搜索 → Ellis DP 拍点跟踪（环境无 librosa，用 numpy/scipy 手写）。
- 校验：13 句歌词的起唱点全部落在拍点 **±0.16 s** 内。

## 结构（13 镜 / 100 拍）

| 镜 | 时间 | 歌词 | 一句话 |
|---|---|---|---|
| S01 | 0.06 | 我睁开双眼 想你在身边 | 巨眼特写 → 圆窗收缩成圆台，粉色虚线人形被手穿过、碎成点 |
| S02 | 3.46 | 无所谓永远还是瞬间 | 硬币当背板（正反两面是太阳/月亮），日历格滚过，跳进"瞬间"格 |
| S03 | 6.87 | 静闭上了眼 你却又浮现 | 眼皮合拢 → 深紫粉点，她从粉点里膨胀出来，晃手他没反应 |
| S04 | 10.29 | 带我远离寂寞的边缘 | 坠落隧道 → 薄荷波点灰盘，退到边缘，粉色手从背后抱回 |
| S05 | 13.69 | 忘了是非 没有伤悲 | 游乐场剪影上色，摩天轮/木马，"是/非"两块箭头牌被一拳打碎 |
| S06 | 17.10 | 无怨无悔 | 伞放大成烟花 → 信任倒 → 糖堆四脚朝天 → 黑洞吸走 → 白场爆 |
| S07 | 20.50 | 忘了是非 没有伤悲 | 双色地板格点亮，量距离，速度线，撞怀，跟头，背靠背 |
| S08 | 24.33 | 无怨无悔 | 把她举高（星芒里）→ 抽色只剩橙粉墨 → 黑底两点，心跳线绷紧、断 |
| S09 | 27.33 | 我拥抱着爱 当从梦中醒来 | 橙粉对撞 → 抛天砸坑 → 抱心 → 心炸 20 颗 → 巨眼掉出他 |
| S10 | 30.73 | 你执着地等待 却不曾离开 | 摇镜见她一直站原地（头顶落满时间叶）→ 冲过去抱，叶飞 |
| S11 | 34.14 | 舍不得分开 在每一次醒来 | 粉橡皮筋拉扯、断、弹飞、画面撕成两半 → 眨眼蒙太奇（天台/海底/太空） |
| S12 | 37.56 | 不用再徘徊 | 三岔箭头 + 三重残影 → 指尖点额头定格 → 箭头碎 → 直路 |
| S13 | 39.67 | 你就是我最美的期待 | 推近瞳孔 → 橙粉色带 + 两剪影 → 双星绕转 → 汇聚 → 粉星升空 → 最大烟花 → 两点牵手，期待线出画 |

## 技术链路

```
_beats.py（测拍）→ 最美的期待-100拍卡点表.csv → STORYBOARD.md（分镜提示词）
        ↓
game_mv/src/*.js（每帧 = 时间 t 的纯函数）
        ↓
puppeteer-core + headless Chrome → studio.html（p5 2.3.1 P2D）→ renderAt() → dataURL
        ↓
ffmpeg → out/mv.mp4（+ aac）
```

- **纯矢量引擎**：`src/core.js` 直接用 `drawingContext` 做 fill/stroke，不用 p5.brush，渲染 16–22 ms/帧（1024 帧约 25 秒）。踩过的坑：p5 2.x 在 P2D 下的全局 `push/translate/scale` 不与裸 canvas 变换同步，必须把 `push/pop/translate/rotate/scale` 全部重写成 `drawingContext` 直操作。
- **逐帧可并行**：画面不使用跨帧状态、不调 `Math.random()`（用 `hash(i)`），所以能 3 进程乱序渲帧。
- **字幕层**：`src/karaoke.js` 的 `window.overlayHook(c, t)` 在 grain 之后画，逐字盖章（`backOut` 弹入 + 0.05 s 淡入 + 行尾 0.1 s 退场），关键词放大 1.13× 换粉/橙。逐字时间来自 `_words2.json`（faster-whisper small 强制对齐 + 歌词校正）。

## 验收数字

- 黑帧检测 `blackdetect d=0.05 pix_th=0.06`：**0 段**
- 静止检测 `freezedetect n=0.002 d=1.0`：**0 段**
- 字幕对齐（从成片抽帧核验）：每行在 `L[0]` 出现、`L[1]` 消失、逐字递进。抽查 27.50 / 27.80 / 30.55 / 30.85 / 39.45 / 39.75 / 42.10 / 42.35 八个边界帧全部符合 LRC 时间。
- 已知取舍：第 1 行末字"边"、第 9 行末字"来"的强制对齐时间晚于行尾，已做 `min(t0, b-0.06)` 夹取，保证末字一定上屏（代价是这个字只亮 0.06 s 就随行淡出）。

## 署名与授权

- 角色套件：**Clawd / ClaudeAnimationBase**，JohnHeibel，MIT License。
- 画风参考：`lemo-opuscar` 风格库 → game-show（综艺节奏扁平）。
- 字体：华文行楷（`Xingkai.ttf`）。**仅本机渲染使用**，未随片分发字体文件；商业发布请自行确认字体授权。
- 音乐：《最美的期待》原曲，仅用于本片音画对位；发布请自理版权。


## 封面

| 文件 | 尺寸 | 用途 |
|---|---|---|
| `out/cover/cover_3x4.png` | 1080×1440 | 抖音/小红书封面（信息流占位最满） |
| `out/cover/cover_16x9.png` | 1920×1080 | B 站 / 视频号 / YouTube 缩略图 |

用 `cover.html` 出图，复用同一套 `core/clawd/gs` 与同一条色弧（橙 `#FF8A3D` → 粉 `#FF4FA3`），所以封面和成片是同一个世界：

```bash
node render.mjs --page="cover.html?w=1080&h=1440" --stills=0 --out=out/cv   # 竖版
node render.mjs --page="cover.html?w=1920&h=1080" --stills=0 --out=out/cv2  # 横版
```

排版要点：行楷的 advance 与墨迹差得远（`最` 168px 的字，墨迹只占 132px，左边还空 18px），所以 `titleRun()` 按 `actualBoundingBoxLeft/Right` 算墨迹边界来居中，并按 `maxW` 自动等比缩，绝不能直接拿 `measureText().width` 当字宽。

## 重新渲染

```bash
node render.mjs --stills=12.0,30.0 --out=out/chk   # 单帧/多帧预览
node render.mjs --sheet=1,5,9 --cols=3 --w=500 --out=out/sheet.jpg  # 联系表
node render.mjs --frames --workers=3               # 全片帧
node render.mjs --encode --out=out/mv.mp4 --audio=assets/song.mp3   # 合成
```
