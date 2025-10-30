import { test, expect } from '@playwright/test';

test.describe('Passage Prep - Assessment Tests', () => {
  test('Student can take an assessment', async ({ page }) => {
    console.log('📝 Starting student assessment test...');
    
    // Set basic authentication
    await page.setExtraHTTPHeaders({
      'Authorization': 'Basic ' + Buffer.from('passageprepstg:777456c1').toString('base64')
    });
    
    // Navigate to assessment page
    await page.goto('https://passageprepstg.wpenginepowered.com/assessment', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Start assessment
    await page.click('.start-assessment-button');
    await page.waitForTimeout(1000);
    
    // Answer first question
    await page.click('.question-option:first-child');
    await page.click('.next-question-button');
    await page.waitForTimeout(1000);
    
    // Answer second question
    await page.click('.question-option:nth-child(2)');
    await page.click('.next-question-button');
    await page.waitForTimeout(1000);
    
    // Complete assessment
    await page.click('.submit-assessment-button');
    await page.waitForTimeout(3000);
    
    // Verify results page
    await expect(page.locator('.assessment-results')).toBeVisible();
    await expect(page.locator('.score-display')).toBeVisible();
    await expect(page.locator('.feedback-section')).toBeVisible();
    
    console.log('✅ Assessment test completed');
  });

  test('Student can view assessment history', async ({ page }) => {
    console.log('📊 Testing assessment history view...');
    
    await page.goto('https://passageprepstg.wpenginepowered.com/assessments', { waitUntil: 'networkidle' });
    
    // Verify assessment history is displayed
    await expect(page.locator('.assessment-history')).toBeVisible();
    await expect(page.locator('.assessment-item')).toHaveCount.greaterThan(0);
    
    // Click on a specific assessment
    await page.click('.assessment-item:first-child');
    await page.waitForTimeout(2000);
    
    // Verify detailed view
    await expect(page.locator('.assessment-details')).toBeVisible();
    await expect(page.locator('.question-breakdown')).toBeVisible();
    await expect(page.locator('.performance-metrics')).toBeVisible();
    
    console.log('✅ Assessment history test completed');
  });

  test('Student can retake failed assessments', async ({ page }) => {
    console.log('🔄 Testing assessment retake functionality...');
    
    await page.goto('https://passageprepstg.wpenginepowered.com/assessments', { waitUntil: 'networkidle' });
    
    // Find a failed assessment
    const failedAssessment = page.locator('.assessment-item.failed').first();
    await expect(failedAssessment).toBeVisible();
    
    // Click retake button
    await failedAssessment.locator('.retake-button').click();
    await page.waitForTimeout(2000);
    
    // Verify retake assessment page
    await expect(page.locator('.retake-confirmation')).toBeVisible();
    await page.click('.confirm-retake-button');
    await page.waitForTimeout(1000);
    
    // Verify assessment started
    await expect(page.locator('.assessment-questions')).toBeVisible();
    
    console.log('✅ Assessment retake test completed');
  });
});
