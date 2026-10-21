import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (location.search.includes('consent-test=1')) return;
    try {
      localStorage.setItem('wattios-analytics-consent-v1', JSON.stringify({ analytics: false, savedAt: Date.now() }));
    } catch {
      // Keep browser tests independent of persisted consent from previous runs.
    }
  });
});

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
    await page.screenshot({ path: testInfo.outputPath(`wattios-${width}.png`), fullPage: true });
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
  await expect(page.locator('.example-note').first()).toHaveCSS('font-size', '12px');
  await expect(page.getByText('margen detectado')).toHaveCount(0);
});

test('trust and comparison preview explain the process without posing as a real case', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('¿Estás pagando de más');
  await expect(page.getByRole('heading', { name: 'Tu factura, bajo tu control.' })).toBeVisible();
  await expect(page.locator('.trust-section a[href="/privacidad"]')).toHaveCount(1);
  await expect(page.locator('#contact-label')).toContainText('para responderte');
  await expect(page.locator('.result-table [role="row"]')).toHaveCount(4);
  await expect(page.locator('.result-disclaimer')).toContainText('No corresponde a un cliente ni es un análisis real');
  await expect(page.locator('.result-disclaimer')).toHaveCSS('font-size', '13px');
  await expect(page.locator('.result-paper-caption')).toContainText('Sin datos ni ahorros simulados');
  await page.locator('.result-link').click();
  await expect(page).toHaveURL(/#revisar$/);
});

for (const width of [320, 768, 1440]) {
  test(`FAQ keeps its light reading surface at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const faq = page.locator('#faq');
    await expect(faq).toHaveCSS('background-color', 'rgb(238, 229, 245)');
    await expect(faq).toHaveCSS('color-scheme', 'light');
    const firstQuestion = faq.locator('details').first();
    await firstQuestion.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(firstQuestion).toHaveAttribute('open', '');
    await expect(firstQuestion.locator('p')).toHaveCSS('font-size', '14px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await faq.screenshot({ path: testInfo.outputPath(`faq-${width}.png`) });
  });
}

test('estimator requires a supply before asking for consumption and never sends inputs', async ({ page }) => {
  const posts: string[] = [];
  page.on('request', request => { if (request.method() === 'POST' && !request.url().includes('cloudflareinsights.com')) posts.push(request.url()); });
  await page.goto('/');
  await expect(page.locator('#estimate-result')).toBeHidden();
  await page.locator('.estimate-entry').click();
  await expect(page).toHaveURL(/#calculadora$/);
  await expect(page.locator('#estimate-followup')).toBeHidden();
  await expect(page.locator('#monthly-spend')).toHaveCount(0);
  await page.locator('input[name="estimate-supply"][value="luz"]').check();
  await expect(page.locator('#estimate-followup')).toBeVisible();
  await expect(page.locator('[data-panel="gas"]')).toBeHidden();
  await page.locator('.estimate-submit').click();
  await expect(page.locator('#estimate-result')).toBeHidden();
  expect(posts).toEqual([]);
});

test('estimator cannot submit personal inputs when JavaScript is disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: 'http://127.0.0.1:4322' });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('#estimate-controls')).toHaveAttribute('disabled', '');
    await expect(page.getByText('Activa JavaScript para calcular. El formulario no enviará tus datos.')).toBeVisible();
    await expect(page.locator('#estimate-tax-rate')).toBeDisabled();
  } finally {
    await context.close();
  }
});

test('light and gas estimates apply editable IVA and IGIC to the simplified subtotal', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[name="estimate-supply"][value="luz"]').check();
  await expect(page.locator('#estimate-fixed-gas')).toBeDisabled();
  await page.locator('#estimate-zone').selectOption('iva');
  await expect(page.locator('#estimate-tax-rate')).toHaveValue('21');
  await page.locator('input[name="estimate-tariff-luz"][value="2.0TD"]').check();
  await page.locator('#estimate-days-luz').fill('30');
  await page.locator('#estimate-kwh-luz').fill('200');
  await page.locator('#estimate-price-luz').fill('0.15');
  await page.locator('#estimate-power-luz').fill('4');
  await page.locator('#estimate-power-price-luz').fill('0.10');
  await page.locator('.estimate-submit').click();
  await expect(page.locator('#estimate-result')).toBeFocused();
  await expect(page.locator('#estimate-subtotal')).toContainText('42,00');
  await expect(page.locator('#estimate-tax-amount')).toContainText('IVA estimado (21 %): 8,82');
  await expect(page.locator('#estimate-total')).toContainText('50,82');
  await expect(page.locator('#estimate-share')).toBeVisible();
  await page.locator('#estimate-tax-rate').fill('10');
  await expect(page.locator('#estimate-result')).toBeHidden();
  await expect(page.locator('#estimate-share')).toBeHidden();
  await page.locator('.estimate-submit').click();
  await expect(page.locator('#estimate-total')).toContainText('46,20');
  await page.locator('input[name="estimate-supply"][value="gas"]').check();
  await expect(page.locator('#estimate-result')).toBeHidden();
  await expect(page.locator('#estimate-power-luz')).toBeDisabled();
  await page.locator('#estimate-zone').selectOption('igic');
  await expect(page.locator('#estimate-tax-rate')).toHaveValue('7');
  await page.locator('input[name="estimate-tariff-gas"][value="RL2"]').check();
  await page.locator('#estimate-days-gas').fill('30');
  await page.locator('#estimate-kwh-gas').fill('200');
  await page.locator('#estimate-price-gas').fill('0.15');
  await page.locator('#estimate-fixed-gas').fill('0.25');
  await page.locator('.estimate-submit').click();
  await expect(page.locator('#estimate-subtotal')).toContainText('37,50');
  await expect(page.locator('#estimate-tax-amount')).toContainText('IGIC estimado (7 %): 2,63');
  await expect(page.locator('#estimate-total')).toContainText('40,13');
  await expect(page.locator('#estimate-share-text')).toHaveValue(/Canarias \(IGIC\)/);
});

test('combined estimate uses independent light and gas periods without reusing hidden answers', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('input[name="estimate-supply"][value="ambas"]').check();
  await expect(page.locator('[data-panel="luz"]')).toBeVisible();
  await expect(page.locator('[data-panel="gas"]')).toBeVisible();
  await page.locator('#estimate-zone').selectOption('ipsi');
  await expect(page.locator('#estimate-tax-rate')).toBeEmpty();
  await expect(page.locator('#estimate-tax-help')).toContainText('IPSI varía');
  await page.locator('input[name="estimate-tariff-luz"][value="3.0TD"]').check();
  await page.locator('input[name="estimate-tariff-gas"][value="RL3"]').check();
  await page.locator('#estimate-days-luz').fill('30');
  await page.locator('#estimate-kwh-luz').fill('200');
  await page.locator('#estimate-price-luz').fill('0.15');
  await page.locator('#estimate-power-luz').fill('4');
  await page.locator('#estimate-power-price-luz').fill('0.10');
  await page.locator('#estimate-days-gas').fill('20');
  await page.locator('#estimate-kwh-gas').fill('100');
  await page.locator('#estimate-price-gas').fill('0.15');
  await page.locator('#estimate-fixed-gas').fill('0.25');
  await page.locator('.estimate-submit').click();
  await expect(page.locator('#estimate-result')).toBeHidden();
  await page.locator('#estimate-tax-rate').fill('4');
  await page.locator('.estimate-submit').click();
  await expect(page.locator('#estimate-subtotal')).toContainText('62,00');
  await expect(page.locator('#estimate-tax-amount')).toContainText('IPSI estimado (4 %): 2,48');
  await expect(page.locator('#estimate-total')).toContainText('64,48');
  await expect(page.locator('#estimate-result')).toHaveClass(/is-ready/);
  expect(await page.locator('[data-mix="energia"]').evaluate(el => getComputedStyle(el).transitionDuration)).not.toBe('0s');
  await expect(page.locator('.estimate-mix')).toHaveAttribute('aria-label', /Energía.*45,00.*términos fijos.*17,00.*impuesto.*2,48/);
  await expect(page.locator('#estimate-breakdown')).toContainText('Luz (30 días)');
  await expect(page.locator('#estimate-breakdown')).toContainText('Gas (20 días)');
  await expect(page.locator('#estimate-share-text')).toHaveValue(/Ceuta o Melilla \(IPSI\)/);
  await expect(page.locator('#estimate-share-text')).toHaveValue(/RL3.*20 días/);
  await expect(page.locator('#estimate-share-text')).toHaveValue(/64,48/);
  await expect(page.locator('#estimate-share-text')).toHaveValue(/4 kW a 0,1 €\/kW\/día/);
  await expect(page.locator('#estimate-share-text')).toHaveValue(/0,25 €\/día/);
  await expect(page.locator('#estimate-share')).not.toHaveAttribute('open', '');
  await page.locator('#estimate-share summary').click();
  await expect(page.locator('#estimate-share')).toHaveAttribute('open', '');
  await page.locator('#estimate-result').screenshot({ path: testInfo.outputPath('estimate-result-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#estimate-result').screenshot({ path: testInfo.outputPath('estimate-result-mobile.png') });
  const fixedMessage = 'https://wa.me/34688608806?text=' + encodeURIComponent('Hola, Wattios. Quiero revisar mi factura de luz o gas.');
  await expect(page.locator('.estimate-share a')).toHaveAttribute('href', fixedMessage);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.locator('#estimate-copy').click();
  await expect(page.locator('#estimate-copy-status')).toContainText('Resumen copiado');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('64,48');
  await page.locator('input[name="estimate-supply"][value="luz"]').check();
  await expect(page.locator('#estimate-share')).toBeHidden();
  await page.locator('.estimate-submit').click();
  await expect(page.locator('#estimate-total')).toContainText('43,68');
  await expect(page.locator('#estimate-breakdown')).not.toContainText('Gas (20 días)');
});

for (const width of [320, 768, 1440]) {
  test(`estimator stays readable and reachable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const link = width <= 760
      ? page.locator('#mobile-navigation a[href="#calculadora"]')
      : page.locator('.desktop-nav a[href="#calculadora"]');
    if (width <= 760) await page.getByRole('button', { name: 'Menú' }).click();
    await link.click();
    await expect(page).toHaveURL(/#calculadora$/);
    await expect.poll(async () => {
      const nav = await page.locator('.nav-wrap').boundingBox();
      const target = await page.locator('#calculadora').boundingBox();
      return Boolean(nav && target && target.y >= nav.y + nav.height && target.y < 190);
    }).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('input[name="estimate-supply"][value="ambas"]').check();
    await expect(page.locator('.estimator')).toHaveAttribute('data-supply', 'ambas');
    if (width === 1440) {
      await expect(page.locator('.estimate-visual')).toBeVisible();
      await expect(page.locator('.estimate-visual figcaption')).toContainText('sin cifras');
    } else {
      await expect(page.locator('.estimate-visual')).toBeHidden();
    }
    const estimatorHeight = (await page.locator('.estimator').boundingBox())!.height;
    if (width === 320) expect(estimatorHeight).toBeLessThan(2150);
    if (width === 1440) expect(estimatorHeight).toBeLessThan(1250);
    await page.locator('.estimator').screenshot({ path: testInfo.outputPath(`estimator-${width}.png`) });
  });
}

test('price-period guidance expands with keyboard and preserves inputs', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[name="estimate-supply"][value="luz"]').check();
  const tariff = page.locator('input[name="estimate-tariff-luz"][value="2.0TD"]');
  await tariff.focus();
  await page.keyboard.press('Space');
  await expect(tariff).toBeChecked();
  await page.locator('#estimate-days-luz').fill('30');
  const help = page.locator('.estimate-help');
  await help.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(help).toHaveAttribute('open', '');
  await expect(help).toContainText('precio medio ponderado');
  await expect(page.locator('#estimate-days-luz')).toHaveValue('30');
});

test('supply sketch responds to choice without becoming a fictitious result', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('input[name="estimate-supply"][value="gas"]').check();
  await expect(page.locator('.estimator')).toHaveAttribute('data-supply', 'gas');
  await expect(page.locator('.estimate-visual-icons svg').first()).toBeHidden();
  await expect(page.locator('.estimate-visual-icons svg').last()).toBeVisible();
  await expect(page.locator('#estimate-result')).toBeHidden();
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
  page.on('request', request => { if (request.method() === 'POST' && !request.url().includes('cloudflareinsights.com')) posts.push(request.url()); });
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
  await expect(page.locator('#contact-label')).toHaveText(/teléfono/i);
  await page.locator('#contact-switch').click();
  await expect(page.locator('#sender-contact')).toHaveAttribute('type', 'email');
  await expect(page.locator('#contact-label')).toHaveText(/email/i);
  await expect(page.locator('#contact-type')).toHaveValue('email');
  await page.locator('#contact-switch').click();
  await page.locator('#sender-contact').fill('600 123 456');
  await page.locator('#invoice').setInputFiles({ name: 'factura.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 synthetic') });
  await page.getByRole('button', { name: 'Enviar factura a Wattios' }).click();
  expect(requestSeen).toBe(false);
  await expect(page.locator('#privacy-error')).toBeVisible();
  await expect(page.locator('#privacy-error')).toContainText('Marca esta casilla');
  await expect(page.locator('#privacy')).toHaveAttribute('required', '');
  await expect(page.locator('#submission-success')).toBeHidden();
  await page.locator('input[name="supply"][value="gas"]').check();
  await page.getByRole('button', { name: /Añadir un comentario/ }).click();
  await page.locator('#comment').fill('Revisad sobre todo la potencia.');
  await page.locator('#privacy').check();
  await page.getByRole('button', { name: 'Enviar factura a Wattios' }).click();
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
  await expect(links).toHaveCount(5);
  const expected = 'https://wa.me/34688608806?text=' + encodeURIComponent('Hola, Wattios. Quiero revisar mi factura de luz o gas.');
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('href', expected);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
  await page.locator('#invoice').setInputFiles({ name: 'privado.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 synthetic') });
  await expect(links.first()).toHaveAttribute('href', expected);
  await expect(page.getByText('Adjunta la foto o el PDF dentro del chat. El archivo seleccionado aquí no se transfiere a WhatsApp.')).toBeVisible();
  await page.getByText('¿Puedo enviarla por WhatsApp?', { exact: true }).click();
  await expect(page.locator('details[open]')).toContainText('+34 688 60 88 06');
});

test('reduced motion, local fonts and valid internal destinations', async ({ page }) => {
  const external: string[] = [];
  page.on('request', request => {
    const url = request.url();
    if (url.startsWith('https://') && !url.includes('cloudflareinsights.com')) external.push(url);
  });
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

test('analytics stays off until explicit consent and rejection persists', async ({ page }, testInfo) => {
  const analyticsRequests: string[] = [];
  page.on('request', request => {
    if (/googletagmanager|google-analytics|cloudflareinsights|plausible/.test(request.url())) analyticsRequests.push(request.url());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?consent-test=1');
  await expect(page.locator('#analytics-consent')).toBeVisible();
  await expect(page.locator('#analytics-optional')).not.toBeChecked();
  expect(analyticsRequests).toEqual([]);
  await page.locator('#analytics-consent').screenshot({ path: testInfo.outputPath('consent-desktop.png') });
  await page.locator('#analytics-reject').click();
  await expect(page.locator('#analytics-consent')).toBeHidden();
  await expect(page.locator('#analytics-reopen')).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('wattios-analytics-consent-v1') ?? '{}').analytics)).toBe(false);
  await page.reload();
  await expect(page.locator('#analytics-consent')).toBeHidden();
  expect(analyticsRequests).toEqual([]);
  await page.evaluate(() => localStorage.removeItem('wattios-analytics-consent-v1'));
  await page.setViewportSize({ width: 320, height: 740 });
  await page.reload();
  const banner = page.locator('#analytics-consent');
  await expect(banner).toBeVisible();
  const bannerBounds = await banner.boundingBox();
  expect(bannerBounds!.x).toBeGreaterThanOrEqual(0);
  expect(bannerBounds!.x + bannerBounds!.width).toBeLessThanOrEqual(320);
  expect(bannerBounds!.y + bannerBounds!.height).toBeLessThanOrEqual(740);
  await banner.screenshot({ path: testInfo.outputPath('consent-mobile.png') });
});

test('accepted analytics sends only allowlisted events and can be revoked', async ({ page }) => {
  const analyticsRequests: string[] = [];
  await page.route('https://www.googletagmanager.com/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.route('https://static.cloudflareinsights.com/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  page.on('request', request => {
    if (/googletagmanager|google-analytics|cloudflareinsights|plausible/.test(request.url())) analyticsRequests.push(request.url());
  });
  await page.goto('/?consent-test=1');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  const scrollBeforeConsent = await page.evaluate(() => window.scrollY);
  await page.locator('#analytics-accept').click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollBeforeConsent);
  await expect.poll(() => analyticsRequests.some(url => url.includes('googletagmanager.com/gtag/js?id=G-LCJ9VBQ2YJ'))).toBe(true);
  await expect.poll(() => analyticsRequests.some(url => url.includes('cloudflareinsights.com/beacon.min.js'))).toBe(true);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('wattios:estimate-complete', { detail: { supply: 'luz' } })));
  const queuedData = await page.evaluate(() => JSON.stringify(window.dataLayer));
  expect(queuedData).toContain('estimate_completed');
  expect(queuedData).toContain('"supply":"luz"');
  expect(queuedData).not.toContain('contact@example.com');

  await page.locator('#analytics-reopen').click();
  await expect(page.locator('#analytics-optional')).toBeChecked();
  await page.locator('#analytics-optional').uncheck();
  const reloaded = page.waitForEvent('load');
  await page.locator('#analytics-save').click();
  await reloaded;
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('wattios-analytics-consent-v1') ?? '{}').analytics)).toBe(false);
  expect(await page.locator('script[src*="googletagmanager"]').count()).toBe(0);
});
