import { test, expect } from '@playwright/test';

test('Demo AI Healing Test - Login Flow', async ({ page }) => {
  console.log('🚀 Starting Demo AI Healing Test');
  
  // Navigate to a real website that will demonstrate healing
  await page.goto('https://the-internet.herokuapp.com/login');
  
  console.log('📍 Page loaded, attempting login with failing locators...');
  
  // These locators will fail and trigger AI healing
  // The AI will suggest better locators based on the actual page
  const usernameField = page.locator('#wrong-username-selector');
  await usernameField.fill('tomsmith');
  
  const passwordField = page.locator('#wrong-password-selector');
  await passwordField.fill('SuperSecretPassword!');
  
  const loginButton = page.locator('[data-test="wrong-login-button"]');
  await loginButton.click();
  
  console.log('✅ Login attempted, checking for success...');
  
  // This assertion will show the healing result
  await expect(page.locator('.flash.success')).toBeVisible();
  
  console.log('🎉 Demo completed successfully!');
});
