// Genera la imagen para redes (Open Graph) y los iconos de la app a partir de HTML con las
// fuentes reales del sitio: node scripts/brand-assets.mjs
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';

const font = (p) => `data:font/woff2;base64,${readFileSync(p).toString('base64')}`;
const img = (p, type) => `data:${type};base64,${readFileSync(p).toString('base64')}`;
const ARCHIVO = font('node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2');
const SERIF = font('node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2');
const MONO = font('node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2');
const TACO = img('public/images/taco-hero.webp', 'image/webp');

const base = `
@font-face { font-family: Archivo; src: url(${ARCHIVO}) format('woff2'); font-stretch: 62% 125%; font-weight: 100 900; }
@font-face { font-family: ISerif; src: url(${SERIF}) format('woff2'); font-style: italic; }
@font-face { font-family: Mono; src: url(${MONO}) format('woff2'); font-weight: 100 800; }
* { margin: 0; box-sizing: border-box; }
body { background: #F4EFE6; color: #161412; }
`;

const og = `<!doctype html><html><head><style>${base}
.og { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #F4EFE6; }
.dots { position: absolute; inset: 0; background-image: radial-gradient(#D8C3AE 2.2px, transparent 2.6px); background-size: 60px 60px; opacity: .7; }
.copy { position: absolute; left: 64px; top: 70px; width: 640px; }
.eyebrow { font: 500 17px Mono; letter-spacing: .22em; text-transform: uppercase; color: #4A443D; display: flex; gap: 14px; align-items: center; }
.eyebrow::before { content: ''; width: 26px; height: 1.5px; background: currentColor; }
h1 { margin-top: 26px; font-family: Archivo; font-stretch: 62%; font-weight: 850; text-transform: uppercase; font-size: 150px; line-height: .84; letter-spacing: -.01em; }
h1 em { font-style: normal; color: #C4432A; }
.serif { font-family: ISerif; font-style: italic; font-size: 64px; line-height: 1.05; margin-top: 14px; }
.meta { position: absolute; left: 64px; bottom: 54px; font: 500 17px Mono; letter-spacing: .08em; color: #4A443D; display: flex; gap: 22px; }
.meta b { color: #161412; font-weight: 600; }
.plate { position: absolute; right: 70px; top: 90px; width: 450px; height: 450px; border-radius: 50%; background: #C4432A; }
.ring { position: absolute; right: 90px; top: 110px; width: 410px; height: 410px; border-radius: 50%; border: 2px dotted rgba(244,239,230,.55); }
.taco { position: absolute; right: -60px; top: -10px; width: 700px; height: 700px; object-fit: cover; }
.logo { position: absolute; right: 64px; bottom: 50px; display: flex; gap: 12px; align-items: center; font-family: Archivo; font-stretch: 125%; font-weight: 800; font-size: 28px; letter-spacing: .06em; }
</style></head><body><div class="og">
<div class="dots"></div>
<div class="plate"></div><div class="ring"></div>
<img class="taco" src="${TACO}">
<div class="copy">
  <p class="eyebrow">Barrio Antiguo · Monterrey</p>
  <h1>Un taco.<br>Una <em>mesa.</em></h1>
  <p class="serif">Un lugar para disfrutar.</p>
</div>
<p class="meta"><span><b>Elige tu mesa exacta</b> en el plano</span><span>·</span><span>Caso de estudio</span></p>
<div class="logo"><svg width="40" height="40" viewBox="0 0 32 32"><rect x="3.5" y="7.5" width="25" height="17" rx="1.5" fill="none" stroke="#161412" stroke-width="2.2"/><circle cx="19.5" cy="16" r="5" fill="#C4432A"/></svg>MESA</div>
</div></body></html>`;

const icon = (size, pad) => `<!doctype html><html><head><style>${base}
body { width: ${size}px; height: ${size}px; background: #161412; display: grid; place-items: center; }
</style></head><body><svg width="${size - pad * 2}" height="${size - pad * 2}" viewBox="0 0 32 32"><rect x="3.5" y="7.5" width="25" height="17" rx="1.5" fill="none" stroke="#F4EFE6" stroke-width="2.2"/><circle cx="19.5" cy="16" r="5" fill="#C4432A"/></svg></body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage();
const shot = async (html, w, h, path, type = 'png') => {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot({ type, quality: type === 'jpeg' ? 88 : undefined });
  writeFileSync(path, buf);
  console.log('✓', path, `${(buf.length / 1024).toFixed(0)} KB`);
};
await shot(og, 1200, 630, 'public/og.jpg', 'jpeg');
await shot(icon(180, 26), 180, 180, 'public/apple-touch-icon.png');
await shot(icon(192, 28), 192, 192, 'public/icon-192.png');
await shot(icon(512, 90), 512, 512, 'public/icon-512.png');
await browser.close();
