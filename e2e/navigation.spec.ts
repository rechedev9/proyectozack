import { test, expect } from '@playwright/test';

/**
 * Smoke navigation from the home page into two public routes via the
 * top-level <Nav>. Scoping locators to `nav` prevents collisions with
 * the same labels that may appear in <Footer> or inline CTAs further
 * down the page.
 */
test.describe('Public navigation from home', () => {
  test('home → /talentos via the Talentos nav link', async ({ page }) => {
    await page.goto('/');

    const link = page
      .locator('nav')
      .getByRole('link', { name: 'Talentos', exact: true })
      .first();
    await link.click();

    await expect(page).toHaveURL(/\/talentos$/);
    await expect(page.locator('#talentos')).toBeVisible();
  });

  test('home → /casos via the Casos de Éxito nav link', async ({ page }) => {
    await page.goto('/');

    const link = page
      .locator('nav')
      .getByRole('link', { name: /casos de éxito/i })
      .first();
    await link.click();

    await expect(page).toHaveURL(/\/casos$/);
    await expect(page.locator('#casos')).toBeVisible();
  });
});
