const { test, expect } = require('@playwright/test');

test('ZETA mobile smoke flow', async ({ page }) => {
  const appConsoleErrors = [];
  const failedRequests = [];
  page.on('console', message => {
    const text = message.text();
    if (message.type() === 'error' && !text.includes('midtrans') && !text.includes('script-src')) {
      appConsoleErrors.push(text);
    }
  });
  page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()}`));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4200/splash', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toContainText(/ZETA|Zona E-Procurement/i);
  await expect(page.getByRole('button', { name: 'Lewati' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Lewati' }).first().click();
  await expect(page.getByRole('button', { name: 'Masuk Ke Akun' })).toBeVisible();
  await page.locator('ion-checkbox').click();
  await page.getByRole('button', { name: 'Masuk Ke Akun' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  await page.screenshot({ path: 'e2e/zeta-smoke.png', fullPage: false });
  console.log(JSON.stringify({ url: page.url(), appConsoleErrors, failedRequests }));
  expect(appConsoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});

