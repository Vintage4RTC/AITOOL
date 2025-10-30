import { test, expect } from '@playwright/test';

test.describe('Teaching Channel - Search Tests', () => {
  test('User can search for content', async ({ page }) => {
    console.log('🔍 Starting content search test...');
    
    // Set basic authentication
    await page.setExtraHTTPHeaders({
      'Authorization': 'Basic ' + Buffer.from('teachingchannel:password123').toString('base64')
    });
    
    // Navigate to main page
    await page.goto('https://teachingchannel.com', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Use global search
    await page.fill('input[placeholder*="Search"]', 'classroom management');
    await page.press('input[placeholder*="Search"]', 'Enter');
    
    // Wait for search results
    await page.waitForTimeout(3000);
    
    // Verify search results page
    await expect(page.locator('.search-results')).toBeVisible();
    await expect(page.locator('.search-result-item')).toHaveCount.greaterThan(0);
    
    // Verify search query is displayed
    await expect(page.locator('.search-query')).toContainText('classroom management');
    
    console.log('✅ Content search test completed');
  });

  test('User can filter search results', async ({ page }) => {
    console.log('🔍 Testing search result filtering...');
    
    await page.goto('https://teachingchannel.com', { waitUntil: 'networkidle' });
    
    // Perform search
    await page.fill('input[placeholder*="Search"]', 'mathematics');
    await page.press('input[placeholder*="Search"]', 'Enter');
    await page.waitForTimeout(3000);
    
    // Apply content type filter
    await page.click('.filter-button[data-type="video"]');
    await page.waitForTimeout(2000);
    
    // Verify filtered results
    await expect(page.locator('.search-result-item')).toHaveCount.greaterThan(0);
    
    // Verify all results are videos
    const resultItems = await page.locator('.search-result-item').all();
    for (const item of resultItems) {
      await expect(item.locator('.content-type')).toContainText('Video');
    }
    
    console.log('✅ Search filtering test completed');
  });

  test('User can view search suggestions', async ({ page }) => {
    console.log('💡 Testing search suggestions...');
    
    await page.goto('https://teachingchannel.com', { waitUntil: 'networkidle' });
    
    // Start typing in search box
    await page.fill('input[placeholder*="Search"]', 'teach');
    await page.waitForTimeout(1000);
    
    // Verify suggestions dropdown appears
    await expect(page.locator('.search-suggestions')).toBeVisible();
    await expect(page.locator('.suggestion-item')).toHaveCount.greaterThan(0);
    
    // Click on a suggestion
    await page.click('.suggestion-item:first-child');
    await page.waitForTimeout(2000);
    
    // Verify search was executed with suggestion
    await expect(page.locator('.search-results')).toBeVisible();
    
    console.log('✅ Search suggestions test completed');
  });
});
