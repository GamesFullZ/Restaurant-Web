import { test, expect, type Page } from '@playwright/test';

const next = (page: Page) => page.locator('.flow-bar').getByRole('button').last();

async function book(page: Page, { name, phone }: { name: string; phone: string }) {
  await page.goto('/reservar');
  await page.getByRole('radiogroup', { name: 'Número de personas' }).getByRole('radio').nth(1).click();
  await next(page).click();

  await page.getByRole('radio', { name: /^19:00/ }).click();
  await next(page).click();

  await page.locator('.cal__cell.is-disponible:not([disabled])').first().click();
  await next(page).click();

  const free = page.locator('g.tbl.is-free').first();
  await free.waitFor();
  await free.click();
  await expect(next(page)).toContainText('Continuar con');
  await next(page).click();

  await expect(page.locator('#step-title')).toContainText('¿Celebran algo?');
  await next(page).click();

  await page.fill('#f-name', name);
  await page.fill('#f-phone', phone);
  await next(page).click();

  await expect(page.locator('#step-title')).toContainText('Revisa tu reserva');
  await page.getByRole('button', { name: 'Confirmar reserva' }).click();
  await page.waitForURL('**/reservar/confirmacion');
  const code = await page.locator('.code-card__code').getAttribute('aria-label');
  expect(code).toMatch(/^MESA-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/);
  return code!;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('__e2e')) {
      localStorage.clear();
      sessionStorage.setItem('__e2e', '1');
    }
  });
});

test('home carga con hero y CTA de reserva @mobile', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('link', { name: /Reservar/ }).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('menú lista 25 platillos y abre el detalle', async ({ page }) => {
  await page.goto('/menu');
  await expect(page.locator('.dcard__name')).toHaveCount(25);
  await page.goto('/menu/pato-en-adobo');
  await expect(page.locator('h1')).toContainText(/Pato en adobo/i);
});

test('reserva completa, consulta y cancelación en Mis reservas @mobile', async ({ page }) => {
  const code = await book(page, { name: 'Ana Prueba', phone: '81 5555 0101' });

  await page.goto('/mis-reservas');
  await page.fill('#m-code', code.toLowerCase());
  await page.fill('#m-phone', '8155550101');
  await page.getByRole('button', { name: 'Buscar mi reserva' }).click();
  await page.waitForURL(`**/mis-reservas/${code}`);
  await expect(page.getByText('Ana Prueba').first()).toBeVisible();

  await page.getByRole('button', { name: 'Cancelar reserva' }).click();
  await page.getByRole('button', { name: 'Sí, cancelar reserva' }).click();
  await expect(page.getByText(/cancelada/i).first()).toBeVisible();
});

test('teléfono duplicado se bloquea en la misma fecha', async ({ page }) => {
  await book(page, { name: 'Beto Uno', phone: '81 5555 0202' });
  await page.goto('/reservar');
  await page.getByRole('radiogroup', { name: 'Número de personas' }).getByRole('radio').nth(1).click();
  await next(page).click();
  await page.getByRole('radio', { name: /^19:00/ }).click();
  await next(page).click();
  await page.locator('.cal__cell.is-disponible:not([disabled])').first().click();
  await next(page).click();
  await page.locator('g.tbl.is-free').first().click();
  await next(page).click();
  await next(page).click();
  await page.fill('#f-name', 'Beto Dos');
  await page.fill('#f-phone', '81 5555 0202');
  await next(page).click();
  await page.getByRole('button', { name: 'Confirmar reserva' }).click();
  await expect(page.getByText(/Ya tienes una reserva/).first()).toBeVisible();
});

test('admin: login, dashboard y bloqueo de acceso sin sesión', async ({ page }) => {
  await page.goto('/admin');
  await page.waitForURL('**/admin/login**');
  await page.fill('#a-user', 'admin');
  await page.fill('#a-pass', 'incorrecta');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.locator('[role="alert"]').first()).toBeVisible();
  await page.fill('#a-pass', 'mesa-demo');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(/\/admin\/?$/);
  await expect(page.getByRole('heading', { name: /hoy/i }).first()).toBeVisible();
  await page.goto('/admin/reservas');
  await expect(page.getByText('MESA-H3N8').first()).toBeVisible();
});

test('sin desbordamiento horizontal en móvil @mobile', async ({ page }) => {
  for (const path of ['/', '/menu', '/menu/pato-en-adobo', '/reservar?personas=2&horario=19:00', '/mis-reservas', '/nada']) {
    await page.goto(path);
    await page.waitForTimeout(600);
    const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(sw, path).toBeLessThanOrEqual(cw);
  }
});
