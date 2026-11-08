#!/bin/sh
# 一键重建《天龙八部之宿敌》MV：帧渲染 → 编码 → 混音合成
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-"C:/Users/79420/WorkBuddy/2026-10-31-19-32-52"}
export LIB
cd "$LIB"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/song.mp3" "$HERE/天龙八部之宿敌_剪纸MV.mp4" 24
echo "done: $HERE/天龙八部之宿敌_剪纸MV.mp4"
