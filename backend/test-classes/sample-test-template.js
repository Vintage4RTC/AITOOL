// Sample Playwright Test Template
// Copy this template and modify it for your test

import { test, expect } from '@playwright/test';

test.describe('Sample Test Suite', () => {
  test('should navigate to homepage', async ({ page }) => {
    // Navigate to your application
    await page.goto('https://example.com');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Assert page title
    await expect(page).toHaveTitle(/Example Domain/);
    
    // Take a screenshot
    await page.screenshot({ path: 'homepage.png' });
  });

  test('should perform login', async ({ page }) => {
    // Navigate to login page
    await page.goto('https://example.com/login');
    
    // Fill in login form
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'testpass');
    
    // Click login button
    await page.click('#login-button');
    
    // Wait for redirect
    await page.waitForURL('**/dashboard');
    
    // Assert successful login
    await expect(page.locator('.welcome-message')).toBeVisible();
  });

  test('should validate form submission', async ({ page }) => {
    // Navigate to form page
    await page.goto('https://example.com/form');
    
    // Fill form fields
    await page.fill('#name', 'John Doe');
    await page.fill('#email', 'john@example.com');
    await page.selectOption('#country', 'US');
    
    // Submit form
    await page.click('#submit-button');
    
    // Wait for success message
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
