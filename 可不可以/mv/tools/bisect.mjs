import puppeteer from 'puppeteer-core';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p=>existsSync(p));
const files = ['src/base.js','src/pxfont.js','src/char.js','src/props.js','src/places.js','src/scenes.js','src/scenes2.js'];
const b = await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--allow-file-access-from-files']});
for (let i=1;i<=files.length;i++){
  const html = '<!DOCTYPE html><meta charset="utf-8"><body><canvas id=a width=480 height=270></canvas>' +
    files.slice(0,i).map(f=>`<script src="../${f}"></script>`).join('') + '</body>';
  writeFileSync('tools/_bi.html', html);
  const p = await b.newPage();
  let err='';
  p.on('pageerror', e => err += e.message + ';');
  await p.goto(pathToFileURL(resolve('tools/_bi.html')).href, {waitUntil:'load'});
  console.log(i, files[i-1], '=>', err || 'ok');
  await p.close();
}
await b.close();
