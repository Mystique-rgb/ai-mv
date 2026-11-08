#!/bin/sh
# 《幻听》一个人的对唱 v4 一键渲染（综艺节奏扁平）
# 用法: bash build.sh
set -e
LIB="C:/Users/79420/WorkBuddy/2026-10-31-19-32-52"   # 引擎库根
FPS=30

# 1) 渲染 920 帧 → out/draft.mp4
node "$LIB/core/render/video.mjs" . --fps $FPS --workers 3 --out out/draft.mp4

# 2) 混流音轨（两遍 loudnorm；矢量风格 grain=0）
sh "$LIB/core/render/mux.sh" out/draft.mp4 "../mv-幻听-v3/out/huanting.wav" "out/幻听-一个人的对唱-v4.mp4" $FPS 0

echo "完成 → out/幻听-一个人的对唱-v4.mp4"
