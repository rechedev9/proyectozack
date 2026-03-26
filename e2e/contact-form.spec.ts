import { test, expect } from '@playwright/test';

test.describe('Contact form', () => {
  test('renders the contact section', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('#contacto');
    await expect(section).toBeVisible();
  });

  test('shows validation state when submitting empty form', async ({ page }) => {
    await page.goto('/');
    await page.locator('#contacto').scrollIntoViewIfNeeded();

    // Submit without filling anything
    const submitBtn = page.locator('#contacto button[type="submit"]');
    await submitBtn.click();

    // Expect at least one error to be visible
    const errors = page.locator('#contacto [role="alert"], #contacto .text-red-400, #contacto [aria-invalid="true"]');
    await expect(errors.first()).toBeVisible({ timeout: 3000 });
  });

  test('fills and submits the contact form successfully', async ({ page }) => {
    await page.goto('/');
    await page.locator('#contacto').scrollIntoViewIfNeeded();

    await page.fill('#contacto input[name="name"]', 'Test User');
    await page.fill('#contacto input[name="email"]', 'test@example.com');
    await page.selectOption('#contacto select[name="type"]', 'other');
    await page.fill('#contacto textarea[name="message"]', 'This is a test message from Playwright.');

    await page.locator('#contacto button[type="submit"]').click();

    // Expect success state (adjust selector to match actual success UI)
    await expect(
      page.locator('#contacto').getByText(/gracias|enviado|success/i)
    ).toBeVisible({ timeout: 10_000 });
  });
});
