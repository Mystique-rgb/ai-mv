import puppeteer from 'puppeteer-core';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p=>existsSync(p));
const b = await puppeteer.launch({executablePath:CHROME, headless:true, args:['--allow-file-access-from-files','--window-size=1920,1080']});
const p = await b.newPage();
p.on('pageerror', e=>console.log('ERR', e.message));
await p.goto(pathToFileURL(resolve('studio.html')).href+'?render', {waitUntil:'networkidle0'});
await p.waitForFunction('window.ready===true',{timeout:60000});
console.log(await p.evaluate(()=>{
  T = 2.0; redraw && redraw();
  const c = drawingContext, m = c.getTransform();
  return {W,H, cw:c.canvas.width, ch:c.canvas.height, m:[m.a,m.b,m.c,m.d,m.e,m.f], cam:CAM, shot:SHOT_T0, ver:p5.VERSION};
}));
await b.close();
