# 像素人物资产库 · v1

人形情侣像素 rig，数据驱动。渲染验证：`node shoot.mjs --page=rigsheet.html --out=out/rig/sheet.png --full`
浏览器直接看：打开 `rigsheet.html`。

## 文件

| 文件 | 内容 |
|---|---|
| `src/rig.js` | 角色 rig：调色板 / 角色表 / 眼型 / 嘴型 / 符号 / figure() |
| `src/scene.js` | 场景库 v1：12 个场景 + 抖动/渐变/雨雪/楼群等图元 |
| `src/events.js` | 事件库 v1：40 个可复用动作片段（body/face/prop/cam 四类） |
| `src/subtitle.js` | 字幕层（高分辨率矢量 + 逐字弹入 + 全宽字幕条） |
| `specs/current.js` | 当前出片配置（镜头 + 字幕 + 封面预设） |
| `stage.html` | 通用渲染舞台（读 specs/ 出帧） |
| `daily.mjs` | **一键出片**：spec → 帧 → mp4 → 封面 |
| `cover.html` | 封面模板（参数化 + 5 个预设） |
| `rigsheet.html` / `scenesheet.html` / `eventsheet.html` | 三张资产总表 |
| `bench.html` | 帧耗时基准 |
| `renderclip.mjs` / `probe.mjs` / `shootcover.mjs` | 出帧 / 抽单帧调试 / 封面出图 |

## 一键出片

```bash
node daily.mjs --spec=specs/current.js --audio="曲.mp3" --out=out/demo.mp4 --cover=A
```

实测：20.3s / 487 帧 / **43 秒出片**（78ms 每帧，含 1920×1080 截图）。

### spec 格式（`specs/current.js`）

```js
window.SPEC = {
  fps: 24, duration: 20.3, fadeIn: .4, fadeOut: .6,
  shots: [{ t0, t1, scene, draw(pc, lt, shot, t) { /* 画 320×180 场景层 */ } }],
  subs:  [{ t0, t1, text, kw: ['关键词'] }],   // 字幕自动逐字
  cover: 'A',
};
```

**改歌 = 改这一个文件**：换 shots 的场景/人物、换 subs 的文本和时间、换 cover 预设。

## 架构：三层

```
场景层  320×180 离屏 canvas（像素绘制，figure/SCENES/EVENTS）
   ↓ drawImage 整数放大（nearest，禁抗锯齿）
主画布  1920×1080
   ↓
字幕层  在高分辨率主画布上用矢量字体画 ← 关键：不能在 320 层画，中文放大 6 倍会糊
```

## 踩过的坑（都写进代码了）

| 坑 | 后果 | 解法 |
|---|---|---|
| 字幕画在 320×180 层 | 放大 6 倍后中文糊成一片 | 字幕在高分辨率主画布用矢量画 |
| 描边把 1-2px 细节也外扩 | 眼睛/嘴被墨线糊成黑块，表情全丢 | 描边跳过 `w*h <= 2` 的部件 |
| 用 rmSync 清空旧帧 | 触发批量删除保护，脚本崩 | 不删，直接覆盖 + `-frames:v N` 截断 |
| 路面用纯 ink | 和字幕条同色，连成一片 | 路面改 navy |
| 雪地远林画成细棍 | 放大后像一排栅栏 | 改成连续起伏的林线 |
| 背影头是纯黑方块 | 放大后像戴方帽子的机器人 | 圆轮廓 + 发丝走向 + 无脖子 |

## 场景库 v1（12 个）

`street 雨街 · room 房间 · rooftop 天台 · sea 海边 · classroom 教室 · train 车厢 ·
lamp 路灯 · stairs 楼梯间 · store 便利店 · snow 雪地 · corridor 走廊 · emptyroom 空房`

- 每个场景 `{ name, gy, draw(c,t), fg(c,t) }`，`gy` 是人物站位地面线，`fg` 是前景遮挡层（雨/雪近景）
- 构图铁律：**每场景只允许一个 gold 暖光源**，其余光一律 teal/pale/haze
- 渐变一律 Bayer 抖动（`dith`），禁用 alpha 过渡
- 场景里埋了情绪锚点：street 的地面三色反光（金/玫红/青）、sea 的月光水路、
  corridor 尽头夕照、emptyroom 的飘尘

## 事件库 v1（40 个）

四大类，源自分镜规则"镜/身/表/景"四类轮换（相邻不重复）：

- **body 动作 12**：walk/run/sit/crouch/lookup/lookdown/turn/wave/hug/wipe/farewell/faint
- **face 表情 12**：sad/cry/tear/happy/laugh/shock/angry/shy/sleepy/bored/lost/sweat（统一 FACE_OPTS 表生成）
- **prop 道具 10**：rain/snow/heart/teardrop/letter/phone/firework/plane/lampon/shadow
- **cam 镜头 6**：zoomin/zoomout/pan/shake/flash/fade

```js
EVENTS[name].run(ctx, t, o)   // t=本地时间(0..dur)，o={sx,sy,S,sex,场景上下文}
```

- 每个事件是纯函数，内部自算缓动/相位（`seg`/`pulse`/`easeOut`/`backOut`/`onTwos`）
- `onTwos` = 12fps 步进，动作"顿"感的关键
- cam 类返回 `{z,cx,cy,dx,dy}` 供场景层做缩放/平移；flash/fade 直接盖画面

## 事件编排规则（写分镜用）

1. 每拍一件事，四类轮换（body→face→prop→cam），相邻不重复
2. 每个 body 事件自带 0.5s 预备动作（anticipation），不硬切
3. 表情优先级：符号 > 眼型 > 嘴型（1 符号顶 5 表情）
4. prop 里 lampon 是唯一"事件级暖光源"，用它时该场景不得另有 gold 光源

opt（全部可选）：

| 组 | 参数 | 说明 |
|---|---|---|
| 造型 | `sex` `'m'|'f'`；`col` 覆盖 CHARS 里任意色槽 | 换主角=加一条 CHARS 记录 |
| 五官 | `eyes` / `mouth` / `lookX` / `lookY` / `blush` 0-1 / `tear` 0-1 | 眼 11 种嘴 10 种 |
| 姿态 | `pose` `stand|walk|sit|crouch|bow`；`walk` 相位；`dy`；`lean` | |
| 手臂 | `aL` / `aR`：0=垂 0.5=斜下 1=平举 2=举高 | |
| 视角 | `view` `front|back` | |
| 符号 | `emote` + `emoteK` + `emoteCol` | sweat/anger/dots/heart/zzz/note/bolt/qmark/spark/rain |

## 16 色调色板（夜景偏蓝紫）

ink `#0B0A12` · night `#1B1B2E` · navy `#2C2A4A` · slate `#46527A`（男外套）·
dusk `#5A5480` · haze `#8B86B0` · pale `#C9C6DD`（女外套）· paper `#F2EFE5` ·
skin `#E0A08A` / skinDk · rose `#E8556D`（情绪重音，女内搭）· blush / peach（女肤）·
teal `#3FA9B8`（雨）· mint（泪/雨丝）· **gold `#FFD166`（唯一暖色：灯/道具/符号）**

## 实测结论（2026-11-03）

- **单帧绘制 0.1 ms**（320×180 含两人+雨+字幕），riso 版 195 ms → 提速 ~2000×
- 48px 高（S=4）下表情全部可读；缩到 116px 信息流宽度时表情消失、
  但**剪影 + 玫瑰红重音色 + 暖黄点**仍可辨 → 小屏识别必须靠色块，不靠脸
- 符号画在头顶右上，`emoteUp` 可再抬高

## 封面模板（`cover.html`）

一份配置出一张封面，换歌只改 `title`：

```js
{ scene, t, figures:[{x,sex,gy,S,opt}], title, titleY, titleW,
  glow, sub, subY, dimTop, dimBot, dimBotY, tagL, tagR }
```

5 个预设：**A 雨街双人（主推）· B 路灯背影 · C 海边远景小人 · D 走廊纵深 · E 空房纯字**

三条硬规则（踩过坑得出的）：

1. **景要糙，字要清**——背景是 320×180 像素放大，字是高清矢量飘逸楷体。对比才有"像素封面"的质感。
2. **只有「大面积纯色 + 单一光源 + 明确地平线」的场景能做封面**。
   store / classroom / train / snow 放大到 1920 后，dither 横纹会变成"栅栏"、细节全暴露，不能用。
   可用：lamp / emptyroom / sea / corridor / street。
3. **字号用 `fitSize` 二分反算**，让歌名精确铺满指定宽度（默认 84%）。换长短不同的歌名不用手调字号。

`node shootcover.mjs --v=A,B,C,D,E --w=1920 --h=1080` → `out/cover/cover_*.jpg`（2 倍图 = 3840×2160）

## 渲染

```bash
# 出帧（10s / 24fps = 240 帧，约 25 秒）
node renderclip.mjs --out=out/testclip --fps=24 --dur=10
# 合成（必须 nearest，否则像素边会被糊掉）
ffmpeg -y -framerate 24 -i "out/testclip/f%04d.png" \
  -vf "scale=1920:1080:flags=neighbor" -c:v libx264 -pix_fmt yuv420p -crf 18 out/testclip.mp4
```

## 下一步

产线已通。日更的日常动作：改 `specs/current.js`（六槽位：歌 / 场景序列 / 事件 / 字幕 / 封面预设 / 配色）→ 跑 `daily.mjs` → 出片。

待补的两块：
1. **字幕自动对齐歌词文件**：目前 subs 时间手填，可从 `.lrc`/`.srt` 直接生成。
2. **歌曲 BPM 卡点助手**：把重拍位置写进 spec，让镜头切换踩拍。
