// Capturas para el README (docs/screenshots). Requiere `npm run build` y sirve dist/ con vite preview.
import { preview } from 'vite';
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/screenshots';
mkdirSync(OUT, { recursive: true });
const server = await preview({ preview: { port: 4190 }, logLevel: 'error' });
const URL = 'http://localhost:4190';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

async function ctx(mobile) {
  const c = await browser.newContext(
    mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  );
  // sin telón de entrada en las capturas
  await c.addInitScript(() => sessionStorage.setItem('mesa.splash', '1'));
  return c;
}
const settle = (p, ms = 1500) => p.waitForTimeout(ms);
const shot = (p, name) => p.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 82 });
const next = (p) => p.locator('.flow-bar').getByRole('button').last();

// ---- escritorio
{
  const c = await ctx(false);
  const p = await c.newPage();
  await p.goto(URL + '/');
  await settle(p, 1800);
  await p.mouse.move(760, 430);
  await p.waitForFunction(() => document.querySelector('.hero-taco')?.classList.contains('is-ready'), null, { timeout: 60000 }).catch(() => {});
  await settle(p, 2500);
  await shot(p, 'home');

  await p.goto(URL + '/menu');
  await settle(p);
  await shot(p, 'menu');

  await p.goto(URL + '/menu/pato-en-adobo');
  await settle(p);
  await shot(p, 'platillo');

  await p.goto(URL + '/reservar');
  await settle(p, 800);
  await p.getByRole('radiogroup', { name: 'Número de personas' }).getByRole('radio').nth(3).click();
  await next(p).click();
  await p.getByRole('radio', { name: /^20:00/ }).click();
  await next(p).click();
  await p.locator('.cal__cell.is-disponible:not([disabled])').first().click();
  await next(p).click();
  await p.locator('g.tbl.is-free').nth(2).click();
  await settle(p, 900);
  await shot(p, 'reserva-mesa');

  await p.goto(URL + '/admin/login');
  await p.fill('#a-user', 'admin');
  await p.fill('#a-pass', 'mesa-demo');
  await p.getByRole('button', { name: 'Entrar' }).click();
  await p.waitForURL(/\/admin\/?$/);
  await settle(p);
  await shot(p, 'admin');

  await p.goto(URL + '/proyecto');
  await settle(p);
  await shot(p, 'caso-de-estudio');
  await c.close();
}

// ---- móvil
{
  const c = await ctx(true);
  const p = await c.newPage();
  await p.goto(URL + '/');
  await settle(p, 2000);
  await shot(p, 'movil-home');

  await p.goto(URL + '/reservar?personas=2&horario=19:00');
  await settle(p, 900);
  await p.locator('.cal__cell.is-disponible:not([disabled])').first().click();
  await next(p).click();
  await settle(p, 900);
  await shot(p, 'movil-reserva');

  await p.goto(URL + '/menu/taco-de-camaron');
  await settle(p);
  await shot(p, 'movil-platillo');
  await c.close();
}

await browser.close();
server.httpServer.close();
console.log('✓ capturas en', OUT);
