import { test, expect } from '@playwright/test';

test('Working test with correct locators', async ({ page }) => {
  await page.goto('https://example.com');

  // These locators should work correctly
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();

  // Find a link and click it
  const link = page.locator('a').first();
  if (await link.count() > 0) {
    await link.click();
  }

  // Verify we're on a page
  await expect(page).toHaveURL(/example/);
});
