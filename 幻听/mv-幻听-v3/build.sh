#!/bin/sh
# 《幻听》纸片立体书 MV 一键重渲
# 用法: bash build.sh
# 依赖: node (three r170 via importmap), ffmpeg, python (PIL)
set -e
LIB="C:/Users/79420/WorkBuddy/2026-10-31-19-32-52"   # paper-popup 引擎库根
FPS=30

# 1) 渲染 919 帧 → out/draft.mp4（playwright 截帧 → ffmpeg mjpeg 管道 → 分段 x264 CRF14 → 无损拼接）
node "$LIB/core/render/video.mjs" . --fps $FPS --workers 3 --out out/draft.mp4

# 2) 混流音轨（两遍 loudnorm → -14 LUFS / TP -1.2）
sh "$LIB/core/render/mux.sh" out/draft.mp4 ../_ref/huanting.wav "out/幻听-我们的歌-v1.mp4" $FPS 2

# 3) 质检：黑帧检测（应无输出）
ffmpeg -loglevel info -i "out/幻听-我们的歌-v1.mp4" -vf blackdetect=d=0.2:pix_th=0.10 -an -f null - 2>&1 | grep black_detect || echo "OK: 无黑帧"

echo "完成 → out/幻听-我们的歌-v1.mp4"
