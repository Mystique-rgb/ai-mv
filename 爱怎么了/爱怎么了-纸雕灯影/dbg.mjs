import puppeteer from 'puppeteer-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: true,
  args: ['--allow-file-access-from-files','--ignore-gpu-blocklist','--use-angle=d3d11','--enable-gpu-rasterization'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('[err]', e.stack || e.message));
page.on('console', m => { if (m.type()==='error') console.log('[c]', m.text()); });
await page.goto(pathToFileURL(resolve('studio.html')).href + '?render', { waitUntil: 'networkidle0' });
await page.waitForFunction('window.ready === true', { timeout: 60000 });
const r = await page.evaluate(async (t) => { try { const u = await window.renderAt(t); return 'ok ' + u.length; } catch (e) { return 'ERR ' + (e.stack||e.message); } }, 0.6);
console.log(r);
await browser.close();
