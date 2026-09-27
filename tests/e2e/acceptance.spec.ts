// Criterios de aceptación de docs/08-functional-requirements.md, uno por prueba.
import { test, expect, type Page } from '@playwright/test';

const next = (page: Page) => page.locator('.flow-bar').getByRole('button').last();
const partyRadio = (page: Page, n: number) => page.getByRole('radiogroup', { name: 'Número de personas' }).getByRole('radio').nth(n - 1);

test.beforeEach(async ({ context }) => {
  // datos de demo limpios y sin telón de entrada en cada prueba
  await context.addInitScript(() => {
    if (!sessionStorage.getItem('__acc')) {
      localStorage.clear();
      sessionStorage.setItem('__acc', '1');
      sessionStorage.setItem('mesa.splash', '1');
    }
  });
});

async function openDemoReservation(page: Page) {
  await page.goto('/mis-reservas');
  await page.fill('#m-code', 'mesa-4f7k');
  await page.fill('#m-phone', '81 1234 5678');
  await page.getByRole('button', { name: 'Buscar mi reserva' }).click();
  await page.waitForURL('**/mis-reservas/MESA-4F7K');
}

async function adminLogin(page: Page) {
  await page.goto('/admin/login');
  await page.fill('#a-user', 'admin');
  await page.fill('#a-pass', 'mesa-demo');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL((u) => u.pathname.startsWith('/admin') && !u.pathname.includes('login'));
}

const dbReservations = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('mesa.v1.db') ?? '{"reservations":[]}').reservations.length as number);

test('FR-040 · acceso con código y teléfono; datos erróneos sin revelar qué falla', async ({ page }) => {
  await openDemoReservation(page);
  await expect(page.getByText('Valeria Treviño').first()).toBeVisible();

  await page.goto('/mis-reservas');
  await page.fill('#m-code', 'MESA-4F7K');
  await page.fill('#m-phone', '8100000000');
  await page.getByRole('button', { name: 'Buscar mi reserva' }).click();
  await expect(page.getByText('No encontramos una reserva con esos datos.')).toBeVisible();
  await expect(page.locator('#m-code')).toHaveValue('MESA-4F7K');
});

test('FR-042 · modificar horario de 20:00 a 21:00 conserva el código y pasa a Modificada', async ({ page }) => {
  await openDemoReservation(page);
  await page.getByRole('button', { name: /Modificar reserva/ }).click();
  await page.getByRole('button', { name: /Fecha, horario, personas o mesa/ }).click();
  await expect(page.locator('#step-title')).toContainText('Revisa tu reserva');
  await page.getByRole('button', { name: 'Editar horario' }).first().click();
  await page.getByRole('radio', { name: /^21:00/ }).click();
  await next(page).click();
  await expect(page.locator('#step-title')).toContainText('Revisa tu reserva');
  await expect(page.getByText('Antes').first()).toBeVisible();
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await page.waitForURL('**/mis-reservas/MESA-4F7K');
  await expect(page.getByText('Modificada').first()).toBeVisible();
  await expect(page.getByText(/21:00/).first()).toBeVisible();
});

test('FR-043 + FR-044 · cancelar y reservar de nuevo con las mismas personas', async ({ page }) => {
  await openDemoReservation(page);
  await page.getByRole('button', { name: 'Cancelar reserva' }).click();
  await expect(page.getByRole('button', { name: 'Mantener mi reserva' })).toBeFocused();
  await page.getByRole('button', { name: 'Sí, cancelar reserva' }).click();
  await expect(page.getByText(/cancelada/i).first()).toBeVisible();
  await page.getByRole('link', { name: /Reservar de nuevo/ }).first().click();
  await page.waitForURL(/\/reservar\?personas=2/);
  await expect(partyRadio(page, 2)).toHaveAttribute('aria-checked', 'true');
});

test('FR-037 · sin disponibilidad ofrece otros horarios y otras fechas', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Prueba estas funciones' }).click();
  const card = page.locator('#demo-panel li').filter({ hasText: 'Sin disponibilidad' });
  await card.getByRole('button', { name: 'Probar' }).click();
  const panel = page.locator('.dpanel');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('heading', { name: 'Otros horarios ese día' })).toBeVisible();
  await expect(panel.getByRole('heading', { name: 'La misma hora, otro día' })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Cambiar número de personas' })).toBeVisible();
  // elegir una alternativa continúa el flujo
  await panel.locator('.chip--alt').first().click();
  await expect(page.locator('#step-title')).toContainText('Elige tu mesa');
});

test('FR-038 · un lunes explica el cierre y ofrece días cercanos', async ({ page }) => {
  await page.goto('/reservar?personas=2&horario=20:00&pista=lunes');
  await page.locator('.cal__cell.is-cerrado:not([disabled])').first().click();
  const panel = page.locator('.dpanel');
  await expect(panel).toContainText('Los lunes descansamos');
  await expect(panel.locator('.chip--alt').first()).toBeVisible();
});

test('FR-039 · recargar en Datos conserva el progreso; cambiar personas libera la mesa incompatible', async ({ page }) => {
  await page.goto('/reservar');
  await partyRadio(page, 2).click();
  await next(page).click();
  await page.getByRole('radio', { name: /^19:00/ }).click();
  await next(page).click();
  await page.locator('.cal__cell.is-disponible:not([disabled])').first().click();
  await next(page).click();
  await page.locator('g.tbl.is-free').first().click();
  await next(page).click();
  await next(page).click();
  await expect(page.locator('#step-title')).toContainText('¿A nombre de quién?');
  await page.reload();
  await expect(page.locator('#step-title')).toContainText('¿A nombre de quién?');
  await expect(page.locator('.flow-aside')).toContainText('2 personas');

  await page.getByRole('button', { name: 'Paso 1: Personas' }).click();
  await partyRadio(page, 5).click();
  await expect(page.getByText(/Tu mesa ya no coincide con 5 personas/)).toBeVisible();
});

test('FR-036 · conflicto simultáneo vuelve al mapa conservando lo demás', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Prueba estas funciones' }).click();
  await page.locator('#demo-panel label.switch').click();
  await expect(page.getByRole('switch', { name: /Simular que alguien reserva tu mesa/ })).toBeChecked();
  await page.keyboard.press('Escape');

  await page.goto('/reservar');
  await partyRadio(page, 2).click();
  await next(page).click();
  await page.getByRole('radio', { name: /^19:30/ }).click();
  await next(page).click();
  await page.locator('.cal__cell.is-disponible:not([disabled])').first().click();
  await next(page).click();
  await page.locator('g.tbl.is-free').first().click();
  await next(page).click();
  await next(page).click();
  await page.fill('#f-name', 'Prueba Conflicto');
  await page.fill('#f-phone', '81 5555 0303');
  await next(page).click();
  await page.getByRole('button', { name: 'Confirmar reserva' }).click();
  await expect(page.locator('#step-title')).toContainText('Elige tu mesa');
  await expect(page.getByText(/Alguien más apartó/)).toBeVisible();
  await expect(page.locator('.flow-aside')).toContainText('19:30');
});

test('FR-035 · recargar la confirmación no duplica la reserva', async ({ page }) => {
  await page.goto('/reservar');
  await partyRadio(page, 3).click();
  await next(page).click();
  await page.getByRole('radio', { name: /^13:30/ }).click();
  await next(page).click();
  await page.locator('.cal__cell.is-disponible:not([disabled])').nth(1).click();
  await next(page).click();
  await page.locator('g.tbl.is-free').first().click();
  await next(page).click();
  await next(page).click();
  await page.fill('#f-name', 'Laura Recarga');
  await page.fill('#f-phone', '81 5555 0404');
  await next(page).click();
  await page.getByRole('button', { name: 'Confirmar reserva' }).click();
  await page.waitForURL('**/reservar/confirmacion');
  const code = await page.locator('.code-card__code').getAttribute('aria-label');
  const before = await dbReservations(page);
  await page.reload();
  await expect(page.locator('.code-card__code')).toHaveAttribute('aria-label', code!);
  expect(await dbReservations(page)).toBe(before);
  await expect(page.getByRole('button', { name: /Agregar al calendario/ })).toBeVisible();
  await page.getByRole('link', { name: /Ver mi reserva/ }).click();
  await page.waitForURL(`**/mis-reservas/${code}`);
  await expect(page.getByText('Laura Recarga').first()).toBeVisible();
});

test('FR-050 · rutas de admin protegidas y cierre de sesión', async ({ page }) => {
  await page.goto('/admin/menu');
  await page.waitForURL('**/admin/login**');
  await adminLogin(page);
  await page.getByRole('button', { name: /Cerrar sesión/ }).first().click();
  await page.goto('/admin/reservas');
  await page.waitForURL('**/admin/login**');
});

test('FR-065 · bloquear M06 la marca en Mantenimiento y avisa en su reserva', async ({ page }) => {
  await adminLogin(page);
  await page.goto('/admin/mesas');
  const m06 = page.locator('li').filter({ has: page.locator('strong', { hasText: /^M06$/ }) });
  await m06.getByRole('button', { name: 'Bloquear' }).click();
  await page.getByRole('radio', { name: /Mantenimiento/ }).click();
  await page.fill('#b-note', 'Silla dañada');
  await page.getByRole('dialog').getByRole('button', { name: 'Bloquear', exact: true }).click();
  await expect(m06).toContainText('Silla dañada');

  await page.goto('/admin/reservas?fecha=todas&aviso=bloqueada');
  await expect(page.getByText('MESA-4F7K').first()).toBeVisible();
  await expect(page.getByText('Mesa bloqueada — reasignar').first()).toBeVisible();

  await page.goto('/reservar?personas=4&horario=19:00');
  await page.locator('.cal__cell.is-disponible:not([disabled])').first().click();
  await next(page).click();
  await expect(page.locator('g.tbl[data-table="M06"]')).toHaveClass(/is-maint/);
});

test('FR-062 + FR-020 · marcar agotado se refleja en el menú y en el detalle', async ({ page }) => {
  await adminLogin(page);
  await page.goto('/admin/menu');
  await page.getByRole('button', { name: 'Marcar agotado Tostada de Atún' }).click();
  await page.goto('/menu');
  await expect(page.locator('.dcard').filter({ hasText: 'Tostada de Atún' })).toContainText('Agotado');
  await page.goto('/menu/tostada-de-atun');
  await expect(page.getByText(/Hoy se nos terminó/)).toBeVisible();
});

test('FR-063 · enviar a papelera oculta el platillo y restaurar lo devuelve', async ({ page }) => {
  await adminLogin(page);
  await page.goto('/admin/menu');
  await page.getByRole('button', { name: 'Eliminar Esquites Cremosos' }).click();
  await page.getByRole('button', { name: /Enviar a papelera/ }).click();
  await page.goto('/menu');
  await expect(page.locator('.dcard__name', { hasText: 'Esquites Cremosos' })).toHaveCount(0);
  await page.goto('/admin/menu/papelera');
  await page.locator('li').filter({ hasText: 'Esquites Cremosos' }).getByRole('button', { name: /Restaurar/ }).click();
  await page.goto('/menu');
  await expect(page.locator('.dcard__name', { hasText: 'Esquites Cremosos' })).toHaveCount(1);
});

test('FR-059 · crear platillo con imagen de la biblioteca', async ({ page }) => {
  await adminLogin(page);
  await page.goto('/admin/menu/nuevo');
  await page.fill('#d-name', 'Tamal de Rajas');
  await page.selectOption('#d-cat', { label: 'Antojitos' });
  await page.fill('#d-price', '120');
  await page.fill('#d-desc', 'Masa suave con rajas poblanas y queso.');
  await page.getByRole('button', { name: 'Usar imagen: Sopes de Birria' }).click();
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await page.waitForURL(/\/admin\/menu\/?$/);
  await page.goto('/menu');
  await expect(page.locator('.dcard__name', { hasText: 'Tamal de Rajas' })).toHaveCount(1);
});

test('FR-047 · cambios en otra pestaña se ven sin recargar', async ({ context }) => {
  const client = await context.newPage();
  await client.goto('/menu');
  const admin = await context.newPage();
  await adminLogin(admin);
  await admin.goto('/admin/menu');
  await admin.getByRole('button', { name: 'Marcar agotado Queso Fundido al Mezcal' }).click();
  await expect(client.locator('.dcard').filter({ hasText: 'Queso Fundido al Mezcal' })).toContainText('Agotado');
});

test('FR-068 · el panel de demo abre la reserva de ejemplo y se cierra con Escape', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Prueba estas funciones' }).click();
  await expect(page.locator('#demo-panel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#demo-panel')).toBeHidden();
  await page.getByRole('button', { name: 'Prueba estas funciones' }).click();
  await page.getByRole('button', { name: 'Abrir con estos datos' }).click();
  await page.waitForURL('**/mis-reservas/MESA-4F7K');
});

test('FR-069 · el interruptor de movimiento reducido aplica en todo el sitio', async ({ page }) => {
  await page.goto('/menu');
  await page.locator('label.switch', { hasText: 'Reducir movimiento' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-reduced-motion', 'true');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-reduced-motion', 'true');
});

test('FR-072 · 404 con navegación y variante de platillo', async ({ page }) => {
  await page.goto('/esta-ruta-no-existe');
  await expect(page.locator('h1')).toContainText(/no existe/i);
  await expect(page.getByRole('main').getByRole('link', { name: 'Menú' })).toBeVisible();
  await page.goto('/menu/platillo-que-no-existe');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: /menú/i }).first()).toBeVisible();
});

test('FR-052 · el dashboard muestra la ocupación del día', async ({ page }) => {
  await adminLogin(page);
  await expect(page.getByText('Reservas del día')).toBeVisible();
  await expect(page.locator('svg g.tbl').first()).toBeVisible();
});


test('EC-47 · en modo edición, sin cambios no se puede guardar', async ({ page }) => {
  await openDemoReservation(page);
  await page.getByRole('button', { name: /Modificar reserva/ }).click();
  await page.getByRole('button', { name: /Fecha, horario, personas o mesa/ }).click();
  await expect(page.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
  await expect(page.getByText(/Aún no hay cambios/)).toBeVisible();
});

test('FR-055 + FR-054 · confirmar una pendiente desde admin y ver su historial', async ({ page }) => {
  await adminLogin(page);
  await page.goto('/admin/reservas?fecha=todas');
  const row = page.locator('tr').filter({ hasText: 'MESA-T2MV' });
  await row.getByRole('button', { name: 'Confirmar' }).click();
  await expect(row).toContainText('Confirmada');
  await page.goto('/admin/reservas?fecha=todas&reserva=MESA-T2MV');
  const detail = page.getByRole('dialog');
  await expect(detail).toContainText('Historial');
  await expect(detail).toContainText('Confirmada');
});

test('FR-057 · cancelar desde admin libera la reserva', async ({ page }) => {
  await adminLogin(page);
  await page.goto('/admin/reservas?fecha=todas');
  await page.getByRole('button', { name: 'Más acciones para MESA-B6RD' }).click();
  await page.getByRole('menuitem', { name: 'Cancelar' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar reserva' }).click();
  await expect(page.locator('tr').filter({ hasText: 'MESA-B6RD' })).toContainText('Cancelada');
});

test('FR-056 · modificar desde admin registra el cambio', async ({ page }) => {
  await adminLogin(page);
  await page.goto('/admin/reservas/MESA-9QX2/modificar');
  await page.fill('#r-comment', 'Silla alta para bebé.');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await page.waitForURL((u) => u.pathname.replace(/\/$/, '') === '/admin/reservas');
  await page.goto('/admin/reservas?fecha=todas&reserva=MESA-9QX2');
  await expect(page.getByRole('dialog')).toContainText('Modificada');
});

test('FR-061 · ocultar un platillo lo saca del menú público', async ({ page }) => {
  await adminLogin(page);
  await page.goto('/admin/menu');
  await page.getByRole('button', { name: 'Ocultar Coliflor Rostizada' }).click();
  await page.goto('/menu');
  await expect(page.locator('.dcard__name', { hasText: 'Coliflor Rostizada' })).toHaveCount(0);
  await page.goto('/menu/coliflor-rostizada');
  await expect(page.locator('h1')).toContainText(/no está/i);
});

test('FR-064 · subir una foto propia reemplaza el render en el menú', async ({ page }) => {
  await adminLogin(page);
  await page.goto('/admin/menu');
  await page.getByLabel('Editar Flan de Cajeta').click();
  await page.getByRole('tab', { name: 'Subir imagen' }).click();
  // PNG 64×64 generado en el navegador
  const png = await page.evaluate(async () => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const x = c.getContext('2d')!;
    x.fillStyle = '#C4432A';
    x.fillRect(0, 0, 64, 64);
    const b: Blob = await new Promise((r) => c.toBlob((bb) => r(bb!), 'image/png'));
    return Array.from(new Uint8Array(await b.arrayBuffer()));
  });
  await page.locator('input[type="file"]').setInputFiles({ name: 'flan.png', mimeType: 'image/png', buffer: Buffer.from(png) });
  await page.fill('#d-alt', 'Flan de cajeta en plato blanco.');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await page.waitForURL(/\/admin\/menu\/?$/);
  await page.goto('/menu');
  const img = page.locator('.dcard').filter({ hasText: 'Flan de Cajeta' }).locator('img');
  await expect(img).toHaveAttribute('src', /^(blob:|data:)/);
});

test('FR-048 · restablecer la demo devuelve los datos iniciales', async ({ page }) => {
  await openDemoReservation(page);
  await page.getByRole('button', { name: 'Cancelar reserva' }).click();
  await page.getByRole('button', { name: 'Sí, cancelar reserva' }).click();
  await expect(page.getByText(/cancelada/i).first()).toBeVisible();
  await page.getByRole('button', { name: 'Prueba estas funciones' }).click();
  await page.getByRole('button', { name: /Restablecer datos de demo/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: /Restablecer/ }).last().click();
  await expect(page.getByText('Datos de demo restablecidos.').first()).toBeVisible();
  await openDemoReservation(page);
  await expect(page.getByText('Confirmada').first()).toBeVisible();
});

test('FR-070 · a 360 px ninguna pantalla tiene scroll horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  const check = async (path: string) => {
    await page.goto(path);
    await page.waitForTimeout(500);
    const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(sw, path).toBeLessThanOrEqual(cw);
  };
  for (const path of ['/', '/menu', '/menu/pato-en-adobo', '/reservar?personas=2&horario=19:00', '/mis-reservas', '/proyecto', '/admin/login']) await check(path);
  await openDemoReservation(page);
  await check('/mis-reservas/MESA-4F7K');
  await adminLogin(page);
  for (const path of ['/admin', '/admin/reservas', '/admin/reservas?fecha=todas&reserva=MESA-4F7K', '/admin/reservas/MESA-4F7K/modificar', '/admin/menu', '/admin/menu/nuevo', '/admin/menu/papelera', '/admin/mesas']) await check(path);
});
