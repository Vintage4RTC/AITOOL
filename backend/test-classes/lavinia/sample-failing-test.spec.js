import { test, expect } from '@playwright/test';

test('Sample test with failing locator', async ({ page }) => {
  await page.goto('https://example.com');

  // This locator will fail and trigger AI healing
  const button = page.locator('[data-test="non-existent-button"]');
  await button.click();

  // This will also fail
  const input = page.locator('#wrong-input-id');
  await input.fill('test value');

  await expect(page.locator('.success-message')).toBeVisible();
});
