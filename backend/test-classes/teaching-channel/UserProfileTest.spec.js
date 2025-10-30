import { test, expect } from '@playwright/test';

test.describe('Teaching Channel - User Profile Tests', () => {
  test('User can view profile information', async ({ page }) => {
    console.log('👤 Starting user profile view test...');
    
    // Set basic authentication
    await page.setExtraHTTPHeaders({
      'Authorization': 'Basic ' + Buffer.from('teachingchannel:password123').toString('base64')
    });
    
    // Navigate to profile page
    await page.goto('https://teachingchannel.com/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Verify profile information is displayed
    await expect(page.locator('.profile-header')).toBeVisible();
    await expect(page.locator('.user-name')).toBeVisible();
    await expect(page.locator('.user-email')).toBeVisible();
    await expect(page.locator('.profile-stats')).toBeVisible();
    
    // Verify profile sections
    await expect(page.locator('.profile-section')).toHaveCount.greaterThan(0);
    
    console.log('✅ Profile view test completed');
  });

  test('User can edit profile information', async ({ page }) => {
    console.log('✏️ Testing profile editing functionality...');
    
    await page.goto('https://teachingchannel.com/profile', { waitUntil: 'networkidle' });
    
    // Click edit profile button
    await page.click('.edit-profile-button');
    await page.waitForTimeout(1000);
    
    // Update profile information
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('textarea[name="bio"]', 'Experienced educator with 10+ years in teaching');
    
    // Save changes
    await page.click('.save-profile-button');
    await page.waitForTimeout(2000);
    
    // Verify changes were saved
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.user-name')).toContainText('John Doe');
    
    console.log('✅ Profile editing test completed');
  });

  test('User can update profile picture', async ({ page }) => {
    console.log('📸 Testing profile picture update...');
    
    await page.goto('https://teachingchannel.com/profile', { waitUntil: 'networkidle' });
    
    // Click on profile picture
    await page.click('.profile-picture');
    await page.waitForTimeout(1000);
    
    // Upload new profile picture (simulate file selection)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('test-assets/profile-picture.jpg');
    
    // Confirm upload
    await page.click('.upload-confirm-button');
    await page.waitForTimeout(3000);
    
    // Verify profile picture was updated
    await expect(page.locator('.profile-picture img')).toHaveAttribute('src');
    await expect(page.locator('.success-message')).toBeVisible();
    
    console.log('✅ Profile picture update test completed');
  });

  test('User can view learning progress', async ({ page }) => {
    console.log('📊 Testing learning progress display...');
    
    await page.goto('https://teachingchannel.com/profile', { waitUntil: 'networkidle' });
    
    // Navigate to progress tab
    await page.click('.tab[data-tab="progress"]');
    await page.waitForTimeout(2000);
    
    // Verify progress information
    await expect(page.locator('.progress-overview')).toBeVisible();
    await expect(page.locator('.course-progress')).toHaveCount.greaterThan(0);
    await expect(page.locator('.achievement-badges')).toBeVisible();
    
    // Verify progress statistics
    await expect(page.locator('.progress-stats')).toBeVisible();
    await expect(page.locator('.completed-courses')).toBeVisible();
    await expect(page.locator('.total-hours')).toBeVisible();
    
    console.log('✅ Learning progress test completed');
  });
});
