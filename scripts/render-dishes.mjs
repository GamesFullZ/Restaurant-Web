// Renderiza las escenas 3D del estudio a imágenes WebP en public/images/dishes/.
// Uso: node scripts/render-dishes.mjs [slug ...]
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ALL = [
  'tostada-de-atun', 'queso-fundido-al-mezcal', 'esquites-cremosos', 'coliflor-rostizada',
  'taco-de-short-rib', 'taco-de-camaron', 'quesadilla-de-hongos', 'sopes-de-birria',
  'mole-de-pollo', 'pescado-a-la-talla', 'costilla-de-res', 'enchiladas-de-mole', 'pato-en-adobo',
  'arroz-cremoso-de-hongos', 'cerdo-en-salsa-de-chile', 'pastel-de-elote', 'flan-de-cajeta',
  'chocolate-y-chile', 'bunuelo-de-canela', 'agua-de-jamaica', 'horchata-de-vainilla',
  'agua-de-pepino-y-limon', 'margarita-de-la-casa', 'cerveza-clara', 'cerveza-ambar',
  'taco-hero', 'mesa-vacia',
];
const EXTRA = { 'taco-hero': { w: 1400, h: 1100, dir: 'images' }, 'mesa-vacia': { w: 1500, h: 1100, dir: 'images' } };

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const outDir = resolve('public/images/dishes');
mkdirSync(outDir, { recursive: true });

const server = await createServer({ server: { port: 5199, strictPort: false }, logLevel: 'error' });
await server.listen();
const port = server.config.server.port ?? 5199;
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('pageerror', e.message));

for (const slug of slugs) {
  const extra = EXTRA[slug] ?? {};
  const w = extra.w ?? 1080;
  const h = extra.h ?? 1350;
  const t0 = Date.now();
  await page.goto(`http://localhost:${port}/studio.html?dish=${slug}&w=${w}&h=${h}`);
  await page.waitForFunction(() => window.__done === true, null, { timeout: 240_000 });
  const err = await page.evaluate(() => window.__error);
  if (err) {
    console.error(`✗ ${slug}\n${err}`);
    continue;
  }
  const type = extra.type ?? 'image/webp';
  const data = await page.evaluate(([t]) => window.__capture(t, 0.88), [type]);
  const buf = Buffer.from(data.split(',')[1], 'base64');
  const dir = extra.dir ? resolve('public', extra.dir) : outDir;
  mkdirSync(dir, { recursive: true });
  const file = resolve(dir, `${slug}.${extra.ext ?? 'webp'}`);
  writeFileSync(file, buf);
  console.log(`✓ ${slug} ${(buf.length / 1024).toFixed(0)} KB ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
await browser.close();
await server.close();
