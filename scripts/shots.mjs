// Capturas de revisión visual: node scripts/shots.mjs <outDir> [ruta:ancho ...]
import { preview } from 'vite';
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const out = process.argv[2] ?? 'shots';
const targets = process.argv.slice(3).length ? process.argv.slice(3) : ['/:1440', '/:390', '/menu:1440', '/menu/pato-en-adobo:1440', '/reservar:1440', '/mis-reservas:1440', '/admin:1440'];
mkdirSync(out, { recursive: true });
const server = await preview({ preview: { port: 4183 }, logLevel: 'error' });
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
for (const t of targets) {
  const [path, w, full, scroll] = t.split(':');
  const width = Number(w ?? 1440);
  const ctx = await browser.newContext({ viewport: { width, height: width < 800 ? 844 : 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(`http://localhost:4183${path}`, { waitUntil: 'networkidle' });
  if (path.startsWith('/admin')) {
    if (page.url().includes('/login')) {
      await page.fill('#a-user', 'admin');
      await page.fill('#a-pass', 'mesa-demo');
      await page.click('button:has-text("Entrar")');
      await page.waitForTimeout(900);
    }
  }
  await page.waitForTimeout(2500);
  if (scroll === 'tour') {
    const h = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 500) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(160);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
  } else if (scroll) {
    await page.evaluate((yy) => window.scrollTo(0, yy), Number(scroll));
    await page.waitForTimeout(2200);
  }
  const name = `${path.replace(/\//g, '_') || 'home'}-${width}${full ? '-full' : ''}${scroll ? '-s' + scroll : ''}.png`;
  await page.screenshot({ path: `${out}/${name}`, fullPage: !!full });
  console.log(name, errors.length ? 'ERRORS: ' + errors.join(' | ').slice(0, 400) : 'ok');
  await ctx.close();
}
await browser.close();
server.httpServer.close();
