import { test, expect } from '@playwright/test';

test.describe('Teaching Channel - Course Navigation Tests', () => {
  test('User can browse course catalog', async ({ page }) => {
    console.log('📚 Starting course catalog browsing test...');
    
    // Set basic authentication
    await page.setExtraHTTPHeaders({
      'Authorization': 'Basic ' + Buffer.from('teachingchannel:password123').toString('base64')
    });
    
    // Navigate to courses page
    await page.goto('https://teachingchannel.com/courses', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Verify course catalog is loaded
    await expect(page.locator('.course-grid')).toBeVisible();
    await expect(page.locator('.course-card')).toHaveCount.greaterThan(0);
    
    // Click on first course
    await page.click('.course-card:first-child');
    await page.waitForTimeout(2000);
    
    // Verify course details page
    await expect(page.locator('.course-title')).toBeVisible();
    await expect(page.locator('.course-description')).toBeVisible();
    
    console.log('✅ Course catalog browsing test completed');
  });

  test('User can search for courses', async ({ page }) => {
    console.log('🔍 Testing course search functionality...');
    
    await page.goto('https://teachingchannel.com/courses', { waitUntil: 'networkidle' });
    
    // Use search functionality
    await page.fill('input[placeholder*="search"]', 'mathematics');
    await page.click('button[type="submit"]');
    
    // Wait for search results
    await page.waitForTimeout(3000);
    
    // Verify search results
    await expect(page.locator('.search-results')).toBeVisible();
    await expect(page.locator('.course-card')).toHaveCount.greaterThan(0);
    
    console.log('✅ Course search test completed');
  });

  test('User can filter courses by category', async ({ page }) => {
    console.log('🏷️ Testing course filtering by category...');
    
    await page.goto('https://teachingchannel.com/courses', { waitUntil: 'networkidle' });
    
    // Click on category filter
    await page.click('.category-filter[data-category="elementary"]');
    await page.waitForTimeout(2000);
    
    // Verify filtered results
    await expect(page.locator('.course-card')).toHaveCount.greaterThan(0);
    
    // Verify all visible courses belong to elementary category
    const courseCards = await page.locator('.course-card').all();
    for (const card of courseCards) {
      await expect(card.locator('.course-category')).toContainText('Elementary');
    }
    
    console.log('✅ Course filtering test completed');
  });
});
