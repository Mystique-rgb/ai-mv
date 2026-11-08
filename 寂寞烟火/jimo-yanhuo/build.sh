#!/bin/sh
# Rebuild the MV. Windows (Git Bash): venv python is .venv/Scripts/python.exe
set -e
HERE="D:/ai音乐mv/寂寞烟火/jimo-yanhuo"
LIB="D:/test/lemo-opuscar"
PY="$LIB/.venv/Scripts/python.exe"
unset CURL_CA_BUNDLE SSL_CERT_FILE REQUESTS_CA_BUNDLE
cd "$LIB"
node "$HERE/dump_tl.mjs" "$HERE"
"$PY" -I "$HERE/foley.py" "$HERE"
ffmpeg -y -v error -i "$HERE/audio.wav" -i "$HERE/out/foley.wav" -filter_complex "[0:a]aresample=48000[a];[1:a]volume=0.5[f];[a][f]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[m]" -map "[m]" -ar 48000 -ac 2 "$HERE/out/mix.wav"
node core/render/video.mjs "$HERE" --fps 24 --workers 3 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/jimo-yanhuo.mp4" 24 0
"$PY" -I "$HERE/make_cues.py" "$HERE"
"$PY" -I core/render/srt.py "$HERE/out/cues.json" "$HERE/jimo-yanhuo.srt"
