import { test, expect } from '@playwright/test';

test.describe('Passage Prep - Reporting Tests', () => {
  test('Teacher can view student progress reports', async ({ page }) => {
    console.log('📊 Starting teacher reporting test...');
    
    // Set basic authentication for teacher account
    await page.setExtraHTTPHeaders({
      'Authorization': 'Basic ' + Buffer.from('teacher@passageprep:teacher123').toString('base64')
    });
    
    // Navigate to teacher dashboard
    await page.goto('https://passageprepstg.wpenginepowered.com/teacher/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Navigate to reports section
    await page.click('.reports-tab');
    await page.waitForTimeout(2000);
    
    // Verify reports page loads
    await expect(page.locator('.reports-dashboard')).toBeVisible();
    await expect(page.locator('.report-filters')).toBeVisible();
    
    // Select a student
    await page.selectOption('.student-select', 'student1');
    await page.waitForTimeout(1000);
    
    // Generate progress report
    await page.click('.generate-report-button');
    await page.waitForTimeout(3000);
    
    // Verify report is generated
    await expect(page.locator('.progress-report')).toBeVisible();
    await expect(page.locator('.student-performance')).toBeVisible();
    await expect(page.locator('.subject-breakdown')).toBeVisible();
    
    console.log('✅ Teacher reporting test completed');
  });

  test('Teacher can export reports', async ({ page }) => {
    console.log('📤 Testing report export functionality...');
    
    await page.goto('https://passageprepstg.wpenginepowered.com/teacher/reports', { waitUntil: 'networkidle' });
    
    // Generate a report first
    await page.selectOption('.student-select', 'student1');
    await page.click('.generate-report-button');
    await page.waitForTimeout(3000);
    
    // Export as PDF
    await page.click('.export-pdf-button');
    await page.waitForTimeout(2000);
    
    // Verify download started
    const downloadPromise = page.waitForEvent('download');
    await downloadPromise;
    
    console.log('✅ Report export test completed');
  });

  test('Admin can view class performance analytics', async ({ page }) => {
    console.log('👨‍💼 Testing admin analytics...');
    
    // Set admin authentication
    await page.setExtraHTTPHeaders({
      'Authorization': 'Basic ' + Buffer.from('admin@passageprep:admin123').toString('base64')
    });
    
    // Navigate to admin dashboard
    await page.goto('https://passageprepstg.wpenginepowered.com/admin/analytics', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Verify admin analytics dashboard
    await expect(page.locator('.admin-analytics')).toBeVisible();
    await expect(page.locator('.class-performance')).toBeVisible();
    await expect(page.locator('.overall-metrics')).toBeVisible();
    
    // Filter by class
    await page.selectOption('.class-filter', 'class1');
    await page.waitForTimeout(2000);
    
    // Verify filtered data
    await expect(page.locator('.class-metrics')).toBeVisible();
    await expect(page.locator('.student-list')).toBeVisible();
    
    console.log('✅ Admin analytics test completed');
  });

  test('Teacher can view assignment completion reports', async ({ page }) => {
    console.log('📋 Testing assignment completion reports...');
    
    await page.goto('https://passageprepstg.wpenginepowered.com/teacher/assignments', { waitUntil: 'networkidle' });
    
    // Navigate to completion reports
    await page.click('.completion-reports-tab');
    await page.waitForTimeout(2000);
    
    // Verify completion reports
    await expect(page.locator('.completion-dashboard')).toBeVisible();
    await expect(page.locator('.assignment-list')).toBeVisible();
    
    // Select an assignment
    await page.click('.assignment-item:first-child');
    await page.waitForTimeout(2000);
    
    // Verify assignment details
    await expect(page.locator('.assignment-details')).toBeVisible();
    await expect(page.locator('.completion-stats')).toBeVisible();
    await expect(page.locator('.student-completion')).toBeVisible();
    
    console.log('✅ Assignment completion test completed');
  });
});
