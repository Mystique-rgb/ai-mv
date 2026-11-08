// config.js: 《最美的期待》42秒 · 综艺节奏扁平 · 1920x1080 / 24fps
// offset = 0.06 是实测的第一下鼓点（不是 0），否则每次 pulse()/move()/jump() 都会整体错拍。
const PROJECT = { duration: 42.667, bpm: 139.75, offset: 0.06, audio: 'assets/song.mp3' };
