// config.js: 《把回忆拼好给你》Risograph 套印版 · 60.47s / 127.95BPM / 1920x1080 (16:9)
// offset = 0.44 是第一下底鼓，不是 0；否则每一次 pulse()/move()/jump() 都会整体错半拍。
const PROJECT = { duration: 60.47, bpm: 127.95, offset: 0.44, audio: 'assets/song.mp3' };
