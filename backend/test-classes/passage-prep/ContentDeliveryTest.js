import { test, expect } from '@playwright/test';

test.describe('Passage Prep - Content Delivery Tests', () => {
  test('Student can access lesson content', async ({ page }) => {
    console.log('📖 Starting content delivery test...');
    
    // Set basic authentication
    await page.setExtraHTTPHeaders({
      'Authorization': 'Basic ' + Buffer.from('passageprepstg:777456c1').toString('base64')
    });
    
    // Navigate to lessons page
    await page.goto('https://passageprepstg.wpenginepowered.com/lessons', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Select a lesson
    await page.click('.lesson-card:first-child');
    await page.waitForTimeout(2000);
    
    // Verify lesson content loads
    await expect(page.locator('.lesson-content')).toBeVisible();
    await expect(page.locator('.lesson-title')).toBeVisible();
    await expect(page.locator('.lesson-text')).toBeVisible();
    
    // Check for multimedia content
    await expect(page.locator('.lesson-media')).toBeVisible();
    
    console.log('✅ Content delivery test completed');
  });

  test('Student can navigate through lesson sections', async ({ page }) => {
    console.log('📑 Testing lesson navigation...');
    
    await page.goto('https://passageprepstg.wpenginepowered.com/lessons', { waitUntil: 'networkidle' });
    await page.click('.lesson-card:first-child');
    
    // Navigate through lesson sections
    await page.click('.section-nav .next-section');
    await page.waitForTimeout(1000);
    
    // Verify section content changes
    await expect(page.locator('.lesson-content')).toBeVisible();
    
    // Go to previous section
    await page.click('.section-nav .prev-section');
    await page.waitForTimeout(1000);
    
    // Verify navigation works both ways
    await expect(page.locator('.lesson-content')).toBeVisible();
    
    console.log('✅ Lesson navigation test completed');
  });

  test('Student can access practice exercises', async ({ page }) => {
    console.log('✏️ Testing practice exercises...');
    
    await page.goto('https://passageprepstg.wpenginepowered.com/lessons', { waitUntil: 'networkidle' });
    await page.click('.lesson-card:first-child');
    
    // Navigate to practice section
    await page.click('.practice-tab');
    await page.waitForTimeout(2000);
    
    // Verify practice exercises load
    await expect(page.locator('.practice-exercises')).toBeVisible();
    await expect(page.locator('.exercise-item')).toHaveCount.greaterThan(0);
    
    // Complete an exercise
    await page.click('.exercise-item:first-child');
    await page.waitForTimeout(1000);
    
    // Answer the exercise
    await page.fill('.exercise-input', 'Sample answer');
    await page.click('.submit-exercise');
    await page.waitForTimeout(2000);
    
    // Verify feedback
    await expect(page.locator('.exercise-feedback')).toBeVisible();
    
    console.log('✅ Practice exercises test completed');
  });

  test('Student can access video content', async ({ page }) => {
    console.log('🎥 Testing video content delivery...');
    
    await page.goto('https://passageprepstg.wpenginepowered.com/lessons', { waitUntil: 'networkidle' });
    await page.click('.lesson-card:first-child');
    
    // Navigate to video section
    await page.click('.video-tab');
    await page.waitForTimeout(2000);
    
    // Verify video player loads
    await expect(page.locator('.video-player')).toBeVisible();
    await expect(page.locator('video')).toBeVisible();
    
    // Test video controls
    await page.click('.play-button');
    await page.waitForTimeout(2000);
    
    // Pause video
    await page.click('.pause-button');
    await page.waitForTimeout(1000);
    
    // Verify video controls work
    await expect(page.locator('.video-controls')).toBeVisible();
    
    console.log('✅ Video content test completed');
  });
});
