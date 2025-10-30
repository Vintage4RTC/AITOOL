import { test, expect } from '@playwright/test';

test.describe('Teaching Channel - Login Tests', () => {
  test('User can login with valid credentials', async ({ page }) => {
    console.log('🔐 Starting Teaching Channel login test...');
    
    // Set basic authentication
    await page.setExtraHTTPHeaders({
      'Authorization': 'Basic ' + Buffer.from('teachingchannel:password123').toString('base64')
    });
    
    // Navigate to login page
    await page.goto('https://teachingchannel.com/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Fill login form
    await page.fill('input[name="email"]', 'test@teachingchannel.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for redirect and verify login success
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    // Verify user is logged in
    await expect(page.locator('.user-menu')).toBeVisible();
    await expect(page.locator('text=Welcome')).toBeVisible();
    
    console.log('✅ Login test completed successfully');
  });

  test('User cannot login with invalid credentials', async ({ page }) => {
    console.log('🔐 Testing invalid login credentials...');
    
    await page.goto('https://teachingchannel.com/login', { waitUntil: 'networkidle' });
    
    // Fill with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Verify error message appears
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
    
    console.log('✅ Invalid login test completed');
  });
});
