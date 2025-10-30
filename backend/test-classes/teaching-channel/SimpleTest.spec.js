import { test, expect } from '@playwright/test';

test.describe('Teaching Channel - Simple Tests', () => {
  test('Basic page load test', async ({ page }) => {
    console.log('🌐 Starting basic page load test...');
    
    // Navigate to a real website for testing
    await page.goto('https://example.com', { waitUntil: 'networkidle' });
    
    // Verify page loads
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Example Domain');
    
    console.log('✅ Basic page load test completed successfully');
    
    // Pause to see the browser window
    await page.waitForTimeout(3000);
  });

  test('Element interaction test', async ({ page }) => {
    console.log('🖱️ Starting element interaction test...');
    
    await page.goto('https://example.com', { waitUntil: 'networkidle' });
    
    // Test basic interactions
    const title = await page.title();
    expect(title).toContain('Example');
    
    // Test page content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toContain('Example Domain');
    
    console.log('✅ Element interaction test completed successfully');
    
    // Pause to see the browser window
    await page.waitForTimeout(3000);
  });
});
