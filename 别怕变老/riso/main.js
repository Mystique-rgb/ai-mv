import { makeRiso } from './riso.js';
import { W, H, plate } from './draw.js';
import { renderFilm, DUR } from './film.js';
const out = document.getElementById('c');
const print = makeRiso(out, W, H);
try { await document.fonts.load('400 46px STKaiti'); } catch (e) {}
window.DUR = DUR;
window.render = t => { const o = renderFilm(t); print(plate, o); };
window.READY = true;
