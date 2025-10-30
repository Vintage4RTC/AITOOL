import { test, expect } from '@playwright/test';

test.describe('Passage Prep - Progress Tracking Tests', () => {
  test('Student can view learning progress', async ({ page }) => {
    console.log('📈 Starting progress tracking test...');
    
    // Set basic authentication
    await page.setExtraHTTPHeaders({
      'Authorization': 'Basic ' + Buffer.from('passageprepstg:777456c1').toString('base64')
    });
    
    // Navigate to progress dashboard
    await page.goto('https://passageprepstg.wpenginepowered.com/progress', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Verify progress dashboard elements
    await expect(page.locator('.progress-dashboard')).toBeVisible();
    await expect(page.locator('.overall-progress')).toBeVisible();
    await expect(page.locator('.subject-breakdown')).toBeVisible();
    await expect(page.locator('.weekly-activity')).toBeVisible();
    
    // Check progress charts
    await expect(page.locator('.progress-chart')).toBeVisible();
    await expect(page.locator('.streak-counter')).toBeVisible();
    
    console.log('✅ Progress tracking test completed');
  });

  test('Student can view detailed progress by subject', async ({ page }) => {
    console.log('📚 Testing subject-specific progress...');
    
    await page.goto('https://passageprepstg.wpenginepowered.com/progress', { waitUntil: 'networkidle' });
    
    // Click on a specific subject
    await page.click('.subject-card:first-child');
    await page.waitForTimeout(2000);
    
    // Verify subject details
    await expect(page.locator('.subject-details')).toBeVisible();
    await expect(page.locator('.topic-progress')).toBeVisible();
    await expect(page.locator('.skill-mastery')).toBeVisible();
    
    // Check individual topic progress
    await expect(page.locator('.topic-item')).toHaveCount.greaterThan(0);
    
    console.log('✅ Subject progress test completed');
  });

  test('Student can view achievement badges', async ({ page }) => {
    console.log('🏆 Testing achievement system...');
    
    await page.goto('https://passageprepstg.wpenginepowered.com/achievements', { waitUntil: 'networkidle' });
    
    // Verify achievements page
    await expect(page.locator('.achievements-page')).toBeVisible();
    await expect(page.locator('.badge-collection')).toBeVisible();
    
    // Check earned badges
    await expect(page.locator('.earned-badge')).toHaveCount.greaterThan(0);
    
    // Check available badges
    await expect(page.locator('.available-badge')).toHaveCount.greaterThan(0);
    
    // Click on a badge for details
    await page.click('.badge-item:first-child');
    await page.waitForTimeout(1000);
    
    // Verify badge details
    await expect(page.locator('.badge-details')).toBeVisible();
    await expect(page.locator('.badge-description')).toBeVisible();
    await expect(page.locator('.badge-requirements')).toBeVisible();
    
    console.log('✅ Achievement badges test completed');
  });

  test('Student can view learning analytics', async ({ page }) => {
    console.log('📊 Testing learning analytics...');
    
    await page.goto('https://passageprepstg.wpenginepowered.com/analytics', { waitUntil: 'networkidle' });
    
    // Verify analytics dashboard
    await expect(page.locator('.analytics-dashboard')).toBeVisible();
    await expect(page.locator('.time-spent-chart')).toBeVisible();
    await expect(page.locator('.accuracy-trends')).toBeVisible();
    await expect(page.locator('.strength-weakness')).toBeVisible();
    
    // Check time period filters
    await page.click('.time-filter[data-period="month"]');
    await page.waitForTimeout(2000);
    
    // Verify chart updates
    await expect(page.locator('.chart-container')).toBeVisible();
    
    console.log('✅ Learning analytics test completed');
  });
});
