import { test, expect } from '@playwright/test';

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`layout and sticky CTA at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('header .nav-cta').click();
    await expect(page).toHaveURL(/#revisar$/);
    await expect.poll(async () => {
      const header = await page.locator('header.nav-wrap').boundingBox();
      const target = await page.locator('#revisar').boundingBox();
      return Boolean(header && target && target.y >= header.y + header.height && target.y < 180);
    }).toBe(true);
    expect(errors).toEqual([]);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: testInfo.outputPath(`wattio-${width}.png`), fullPage: true });
  });
}

test('invoice explainer responds to keyboard without making savings claims', async ({ page }) => {
  await page.goto('/');
  const power = page.getByRole('button', { name: 'Potencia', exact: true });
  await power.focus();
  await page.keyboard.press('Enter');
  await expect(power).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#concept-explanation')).toContainText('aparatos');
  await page.getByRole('button', { name: 'Extras', exact: true }).click();
  await expect(page.locator('#concept-explanation')).toContainText('mantenimiento');
  await expect(page.getByText('Ejemplo ilustrativo. No es un análisis de tu factura.')).toBeVisible();
  await expect(page.getByText('margen detectado')).toHaveCount(0);
});

test('mobile menu supports navigation and Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menú' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await page.locator('#mobile-navigation').getByRole('link', { name: 'Preguntas frecuentes' }).click();
  await expect(page).toHaveURL(/#faq$/);
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
});

test('file selection validates locally and does not send data', async ({ page }) => {
  const posts: string[] = [];
  page.on('request', request => { if (request.method() === 'POST') posts.push(request.url()); });
  await page.goto('/');
  const input = page.locator('#invoice');
  await input.setInputFiles({ name: 'archivo.txt', mimeType: 'text/plain', buffer: Buffer.from('synthetic') });
  await expect(page.locator('#file-status')).toContainText('PDF, JPG o PNG');
  await input.setInputFiles({ name: 'vacio.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(0) });
  await expect(page.locator('#file-status')).toContainText('vacío');
  await input.setInputFiles({ name: 'grande.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(11 * 1024 * 1024) });
  await expect(page.locator('#file-status')).toContainText('10 MB');
  const name = 'factura-de-prueba-sin-datos-personales-'.repeat(4) + '.pdf';
  await input.setInputFiles({ name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 synthetic') });
  await expect(page.locator('#file-name')).toHaveText(name);
  await expect(page.locator('#file-status')).toContainText('No se ha enviado');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Quitar archivo' }).click();
  await expect(input).toHaveValue('');
  await expect(page.locator('#selected-file')).toBeHidden();
  expect(posts).toEqual([]);
});

test('WhatsApp links use the approved number and a fixed message without attaching files', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('a[href^="https://wa.me/"]');
  await expect(links).toHaveCount(2);
  const expected = 'https://wa.me/34646583077?text=' + encodeURIComponent('Hola, Wattio. Quiero revisar mi factura de luz.');
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('href', expected);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
  await page.locator('#invoice').setInputFiles({ name: 'privado.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 synthetic') });
  await expect(links.first()).toHaveAttribute('href', expected);
  await expect(page.getByText('Adjunta la foto o el PDF dentro del chat. El archivo seleccionado aquí no se transfiere a WhatsApp.')).toBeVisible();
  await page.getByText('¿Puedo enviarla por WhatsApp?', { exact: true }).click();
  await expect(page.locator('details[open]')).toContainText('+34 646 58 30 77');
});

test('reduced motion, local fonts and valid internal destinations', async ({ page }) => {
  const external: string[] = [];
  page.on('request', request => { if (request.url().startsWith('https://')) external.push(request.url()); });
  await page.goto('/');
  const badAnchors = await page.locator('a[href^="#"]').evaluateAll(links => links
    .map(link => link.getAttribute('href')!)
    .filter(href => !document.getElementById(href.slice(1))));
  expect(badAnchors).toEqual([]);
  expect(external).toEqual([]);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
});
