# 《幻听》积木歌单 MV v1 · 制作说明

## 成片

- `out/幻听-积木歌单-v1.mp4` — 1920×1080 / 24fps / 30.63s / H.264 + AAC 192k / 41MB，735 帧，无黑帧
- `out/contact.jpg` — 每 2.5 秒一格的接触表
- `out/sync.jpg` — 字幕进/出边界帧（0.625 / 0.75 / 5.33 / 5.46 / 15.58 / 15.71 秒）

## 怎么做的

| 项 | 做法 |
|---|---|
| 画风 | lemo-opuscar `styles/brick-toy`（积木玩具）。塑料清漆材质 + 程序化指纹/划痕粗糙度贴图、AO、物理景深、柔光箱矩形高光 |
| 步进 | 角色 12fps 步进（`T12()` 量化），相机/光/尘埃 24fps —— 这是该 STYLE.md 的硬规矩 |
| 引擎 | three.js + `core/three/post.js`（MSAA→GTAO→DoF→Bloom→调色→暗角） |
| 渲染 | `core/render/video.mjs`，3 worker，735 帧 65 秒渲完 |
| 字幕 | 华文行楷（`fonts/STXingkai.ttf`，@font-face 加载），82px 白字 + 深色圆角胶囊 + 积木图标；时间直接取自 `11月7日.srt` 实测句首句尾 |
| 卡点 | `cues.js`：拍长 0.465s，P00 = 0.700s，共 65 拍；每拍有一次光脉冲 + 姿态/事件变化 |

## 素材来源

- 桌面胡桃木贴图、台灯模型：`core/assets/polyhaven`（CC0，American Walnut Veneer / Desk Lamp Arm 01）
- 积木几何与塑料材质：`styles/brick-toy/demo/bricks.js`（库内代码，未改动逻辑）
- 环境反射：three `RoomEnvironment`（**本库未附 HDR 文件**，`core/assets/polyhaven/photo_studio_loft_hall_2k.hdr` 缺失，改用程序化环境）
- 字体：华文行楷（本机 `C:\Windows\Fonts\STXINGKA.TTF`，随片自用，未分发）

## 与分镜提示词 v1 的差异（如实记录）

1. **耳机线拼人**：她改成站在他右侧、一块块拼起来，不是沿耳机线爬。耳机线保留为垂到地板的一根线。
2. **真实的手拧灯**：删掉。库里没有手部模型，硬做会出戏。改成 S09 灯灭 + 整体降饱和完成"世界在桌上"的收束。
3. **插孔穿越**：前奏只保留"插头落下 — 硬切进房间"，没有做钻进插孔内部的通道。
4. **她"在我耳边"**：改成并肩站位。原因是方块角色只有正面有眼睛，若她正面贴他耳朵，两人都会背对镜头变成两个色块。
5. **夜色**：做成了"暖光房间的傍晚"，不是深蓝夜。压暗幅度到不了 STYLE 的夜景级别，否则砖纹与塑料高光全糊。
6. **车厢**：5 节车厢改成从右墙内侧滑到左墙内侧（原设定从桌面外滑入），因为墙会挡住。

## 已知问题（下一版要改）

- **开场 0–0.7s 不够狠**：现在只是插头落下 + 硬切。分镜里"钻进插孔"的镜头没实现。
- **S03/S07 光线偏平**：夜景压完后整体仍偏亮，缺一盏明确的轮廓光。
- **她的脸**：转身时眼睛只有正面，侧角度会变成"空白盒子"。
- **车厢太小**：全景里 5 节车厢读起来像地上的积木块，车内旧物（糖/车票/耳钉/拍立得）几乎看不见。
- **字幕胶囊**：占了画面下缘 12%，压住了地面前景的表演。

## 怎么改

- 改时间/事件：`cues.js`（句子时间）+ `main.js` 里 `himAt()` / `herAt()` / `cam()` 三处
- 只看某一帧：`node core/render/still.mjs <本目录> <秒>`
- 重渲整片：`node core/render/video.mjs <本目录> --fps 24 --workers 3 --out out/mv_silent.mp4`
- 混音：`ffmpeg -i out/mv_silent.mp4 -i audio.mp3 -c:v copy -c:a aac -b:a 192k -shortest out/成片.mp4`
