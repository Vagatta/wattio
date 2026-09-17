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

for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
  test(`upload leads the first screen at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.hero #invoice-form')).toHaveCount(1);
    await expect(page.locator('#invoice-form')).toHaveCount(1);
    const header = await page.locator('header.nav-wrap').boundingBox();
    const dropzone = await page.locator('#invoice-dropzone').boundingBox();
    const submit = await page.locator('#send-invoice').boundingBox();
    expect(dropzone!.y).toBeGreaterThan(header!.y + header!.height);
    expect(dropzone!.y + dropzone!.height).toBeLessThan(viewport.height);
    expect(submit!.y + submit!.height).toBeLessThan(viewport.height);
    await expect(page.locator('.hero .invoice-explorer')).toHaveCount(0);
    await expect(page.locator('#entender .invoice-explorer')).toHaveCount(1);
    await page.screenshot({ path: testInfo.outputPath('hero.png') });
  });
}

test('invoice explainer responds to keyboard without making savings claims', async ({ page }) => {
  await page.goto('/');
  const power = page.getByRole('button', { name: 'Potencia', exact: true });
  await power.focus();
  await page.keyboard.press('Enter');
  await expect(power).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#concept-explanation-luz')).toContainText('aparatos');
  await page.getByRole('button', { name: 'Extras', exact: true }).first().click();
  await expect(page.locator('#concept-explanation-luz')).toContainText('mantenimiento');
  await expect(page.locator('.invoice-explorer')).toHaveCount(2);
  await expect(page.getByText('Ejemplo ilustrativo. No es un análisis de tu factura.')).toHaveCount(2);
  await expect(page.getByText('margen detectado')).toHaveCount(0);
});

test('gas section explains its own concepts and preselects gas in the form', async ({ page }, testInfo) => {
  await page.goto('/');
  const gasExplorer = page.locator('.invoice-explorer[data-variant="gas"]');
  await expect(gasExplorer).toHaveCount(1);
  await gasExplorer.getByRole('button', { name: 'Término fijo', exact: true }).click();
  await expect(page.locator('#concept-explanation-gas')).toContainText('consumo');
  await gasExplorer.getByRole('button', { name: 'Peajes y extras', exact: true }).click();
  await expect(page.locator('#concept-explanation-gas')).toContainText('Peaje');
  await page.getByRole('link', { name: 'Revisar mi factura de gas' }).click();
  await expect(page.locator('input[name="supply"][value="gas"]')).toBeChecked();
  await expect(page.locator('#revisar')).toHaveAttribute('data-supply', 'gas');
  await expect(page.locator('.file-prompt')).toHaveText('Arrastra aquí tus facturas de gas');
  await page.locator('#invoice-form').screenshot({ path: testInfo.outputPath('card-gas.png') });
  await gasExplorer.screenshot({ path: testInfo.outputPath('gas-explorer.png') });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('.hero-journey').screenshot({ path: testInfo.outputPath('journey-gas.png') });
  await page.locator('input[name="supply"][value="ambas"]').check();
  await expect(page.locator('#revisar')).toHaveAttribute('data-supply', 'ambas');
  await expect(page.locator('.file-prompt')).toHaveText('Arrastra aquí tus facturas de luz y gas');
  await page.locator('#invoice-form').screenshot({ path: testInfo.outputPath('card-ambas.png') });
  await page.locator('.hero-journey').screenshot({ path: testInfo.outputPath('journey-ambas.png') });
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

test('multiple file selection validates total size and does not send before submit', async ({ page }) => {
  const posts: string[] = [];
  page.on('request', request => { if (request.method() === 'POST') posts.push(request.url()); });
  await page.goto('/');
  const input = page.locator('#invoice');
  await input.setInputFiles({ name: 'archivo.txt', mimeType: 'text/plain', buffer: Buffer.from('synthetic') });
  await expect(page.locator('#file-status')).toContainText('PDF, JPG o PNG');
  await input.setInputFiles({ name: 'vacio.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(0) });
  await expect(page.locator('#file-status')).toContainText('vacío');
  await input.setInputFiles({ name: 'grande.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(5 * 1024 * 1024) });
  await expect(page.locator('#file-status')).toContainText('4 MB');
  const files = [
    { name: 'factura-enero.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 january') },
    { name: 'factura-febrero.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('synthetic image') },
  ];
  await input.setInputFiles(files);
  await expect(page.locator('#selected-files')).toContainText('factura-enero.pdf');
  await expect(page.locator('#selected-files')).toContainText('factura-febrero.jpg');
  await expect(page.locator('#file-status')).toContainText('2 archivos seleccionados');
  await expect.poll(() => input.evaluate(element => (element as HTMLInputElement).files?.length)).toBe(2);
  await page.getByRole('button', { name: 'Quitar factura-enero.pdf' }).click();
  await expect(page.locator('#selected-files')).not.toContainText('factura-enero.pdf');
  await expect(page.locator('#selected-files')).toContainText('factura-febrero.jpg');
  await expect.poll(() => input.evaluate(element => (element as HTMLInputElement).files?.length)).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(posts).toEqual([]);
});

test('supply selector updates the dropzone and the comment field is optional', async ({ page }) => {
  await page.goto('/');
  const prompt = page.locator('.file-prompt');
  await expect(prompt).toHaveText('Arrastra aquí tus facturas de luz');
  await expect(page.locator('#revisar')).toHaveAttribute('data-supply', 'luz');
  await page.locator('input[name="supply"][value="gas"]').check();
  await expect(prompt).toHaveText('Arrastra aquí tus facturas de gas');
  await expect(page.locator('#revisar')).toHaveAttribute('data-supply', 'gas');
  await page.locator('input[name="supply"][value="ambas"]').check();
  await expect(prompt).toHaveText('Arrastra aquí tus facturas de luz y gas');
  await expect(page.locator('#comment')).toBeHidden();
  await expect(page.locator('#comment')).not.toHaveAttribute('required', '');
  await page.getByRole('button', { name: /Añadir un comentario/ }).click();
  await expect(page.locator('#comment')).toBeVisible();
  await expect(page.locator('#comment')).toBeFocused();
});

test('successful submission shows a confirmation without sending a real email', async ({ page }) => {
  let requestSeen = false;
  let payload = '';
  await page.route('**/api/submit-invoice', async route => {
    requestSeen = true;
    payload = route.request().postData() ?? '';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
  await page.goto('/');
  await expect(page.locator('#contact-label')).toHaveText(/teléfono/);
  await page.locator('#contact-switch').click();
  await expect(page.locator('#sender-contact')).toHaveAttribute('type', 'email');
  await expect(page.locator('#contact-label')).toHaveText(/email/);
  await expect(page.locator('#contact-type')).toHaveValue('email');
  await page.locator('#contact-switch').click();
  await page.locator('#sender-contact').fill('600 123 456');
  await page.locator('#invoice').setInputFiles({ name: 'factura.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 synthetic') });
  await page.getByRole('button', { name: 'Enviar factura a Wattio' }).click();
  expect(requestSeen).toBe(false);
  await expect(page.locator('#privacy-error')).toBeVisible();
  await expect(page.locator('#privacy-error')).toContainText('Marca esta casilla');
  await expect(page.locator('#privacy')).toHaveAttribute('required', '');
  await expect(page.locator('#submission-success')).toBeHidden();
  await page.locator('input[name="supply"][value="gas"]').check();
  await page.getByRole('button', { name: /Añadir un comentario/ }).click();
  await page.locator('#comment').fill('Revisad sobre todo la potencia.');
  await page.locator('#privacy').check();
  await page.getByRole('button', { name: 'Enviar factura a Wattio' }).click();
  await expect(page.locator('#submission-success')).toBeVisible();
  await expect(page.locator('#submission-success')).toContainText('Factura recibida');
  expect(requestSeen).toBe(true);
  expect(payload).toContain('name="supply"');
  expect(payload).toContain('gas');
  expect(payload).toContain('name="comment"');
  expect(payload).toContain('Revisad sobre todo la potencia.');
  expect(payload).toContain('name="privacy"');
});

test('WhatsApp links use the approved number and a fixed message without attaching files', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('a[href^="https://wa.me/"]');
  await expect(links).toHaveCount(2);
  const expected = 'https://wa.me/34646583077?text=' + encodeURIComponent('Hola, Wattio. Quiero revisar mi factura de luz o gas.');
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
