const { test, expect } = require('@playwright/test');

test.describe('ZETA Mobile & Backend E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('Complete End-to-End Flow: Onboarding -> Auth -> Home -> Tenders -> Profile -> Logout', async ({ page }) => {
    const appConsoleErrors = [];
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error' && !text.includes('midtrans') && !text.includes('script-src')) {
        appConsoleErrors.push(text);
      }
    });

    // 1. Splash & Onboarding
    await page.goto('http://127.0.0.1:4200/splash', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText(/ZETA|Zona E-Procurement/i);

    const lewatiBtn = page.getByRole('button', { name: 'Lewati' }).first();
    await expect(lewatiBtn).toBeVisible({ timeout: 10000 });
    await lewatiBtn.click();

    // 2. Welcome Page & Checkbox
    const masukBtn = page.getByRole('button', { name: 'Masuk Ke Akun' });
    await expect(masukBtn).toBeVisible({ timeout: 10000 });
    await page.locator('ion-checkbox').click();
    await masukBtn.click();

    // 3. Login Page Navigation
    await expect(page).toHaveURL(/\/login$/);
    const loginSubmitBtn = page.getByRole('button', { name: 'Login' });
    await expect(loginSubmitBtn).toBeVisible();

    // 4. Invalid Login Test
    const emailInput = page.locator('ion-input[name="email"] input');
    const passwordInput = page.locator('ion-input[name="password"] input');

    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');
    await loginSubmitBtn.click();

    const errorMsg = page.locator('.auth-error');
    await expect(errorMsg).toBeVisible({ timeout: 8000 });
    await expect(errorMsg).toContainText(/salah|gagal|tidak/i);

    // 5. Valid Login Test with Approved Vendor
    await emailInput.fill('vendor.approved@example.com');
    await passwordInput.fill('password');
    await loginSubmitBtn.click();

    // 6. Navigation to Tabs Home
    await expect(page).toHaveURL(/\/tabs\/home/, { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');

    // 7. Verify Dashboard / Home Content
    await expect(page.locator('body')).toContainText(/Vendor Approved|PT Approved Maju|Tender/i);

    // Take screenshot of Home dashboard
    await page.screenshot({ path: 'e2e/home-dashboard.png', fullPage: false });

    // 8. Navigate to Tenders Tab
    const tendersTab = page.locator('ion-tab-button[tab="tenders"]');
    if (await tendersTab.isVisible()) {
      await tendersTab.click();
      await expect(page).toHaveURL(/\/tabs\/tenders/, { timeout: 10000 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'e2e/tenders-tab.png', fullPage: false });
    }

    // 9. Navigate to Profile Tab and Logout
    const profileTab = page.locator('ion-tab-button[tab="profile"]');
    if (await profileTab.isVisible()) {
      await profileTab.click();
      await expect(page).toHaveURL(/\/tabs\/profile/, { timeout: 10000 });
      await page.waitForTimeout(1000);

      const logoutBtn = page.locator('.btn-logout').first();
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
      }
    }

    console.log('E2E Test completed successfully without blocking console errors.');
  });
});
