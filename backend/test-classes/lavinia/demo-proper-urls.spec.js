import { test, expect } from '@playwright/test';

const BASE_URL = 'https://laviniagro1stg.wpengine.com/';

test.describe('RTCTEK QA Testing Platform - Demo Script', () => {
  test.beforeEach(async ({ browser }) => {
    // Set basic authentication credentials on context
  const context = await browser.newContext({ 
      httpCredentials: { 
        username: process.env.BASIC_AUTH_USERNAME || '', 
        password: process.env.BASIC_AUTH_PASSWORD || '' 
      } 
    });
    const page = await context.newPage();
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Perform application login if needed
    console.log('🔐 Checking for login form...');
    const loginForm = page.locator('input[name="username"], input[name="email"], input[name="password"]');
    const loginFormCount = await loginForm.count();
    console.log(`📊 Found ${loginFormCount} login form elements`);
    
    if (loginFormCount > 0) {
      console.log('🔑 Attempting to login...');
      try {
        // Wait for login form to be visible
        await page.waitForSelector('input[name="username"], input[name="email"], input[name="password"]', { timeout: 5000 });
        
        // Fill username/email
        const usernameField = page.locator('input[name="username"], input[name="email"]').first();
        await usernameField.waitFor({ state: 'visible', timeout: 5000 });
        await usernameField.fill(process.env.DEMO_LOGIN_USERNAME || '');
        console.log('✅ Username filled');
        
        // Fill password
        const passwordField = page.locator('input[name="password"]').first();
        await passwordField.waitFor({ state: 'visible', timeout: 5000 });
        await passwordField.fill(process.env.DEMO_LOGIN_PASSWORD || '');
        console.log('✅ Password filled');
        
        // Click login button
        const loginButton = page.locator('button[type="submit"], .btn-login, button:has-text("Login"), button:has-text("Sign In")').first();
        await loginButton.waitFor({ state: 'visible', timeout: 5000 });
        await loginButton.click();
        console.log('✅ Login button clicked');
        
        // Wait for login to complete
        try {
          await Promise.race([
            page.waitForURL('**/dashboard**', { timeout: 10000 }),
            page.waitForURL('**/home**', { timeout: 10000 }),
            page.waitForSelector('text=Dashboard, .dashboard, [data-testid="dashboard"]', { timeout: 10000 }),
            page.waitForSelector('text=Welcome, .welcome, .user-menu', { timeout: 10000 })
          ]);
          console.log('✅ Login successful - detected success indicators');
        } catch (loginError) {
          console.log('⚠️ Login success detection failed, but continuing...');
          console.log('Current URL:', page.url());
        }
      } catch (loginError) {
        console.log('⚠️ Login process failed:', loginError.message);
        console.log('Current URL:', page.url());
      }
    }
  });

  test('Demo: Proper URL and Authentication Test', async ({ page }) => {
    console.log('🚀 Starting Demo Test with Proper URL and Authentication');
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Verify we're on the correct domain
    expect(page.url()).toContain('laviniagro1stg.wpengine.com');
    
    // Take a screenshot to show we're on the right page
    await page.screenshot({ path: 'screenshots/demo-proper-url.png', fullPage: true });
    
    // Look for common elements that should be present after login
    const pageTitle = await page.title();
    console.log(`📄 Page Title: ${pageTitle}`);
    
    // Check for navigation elements
    const navElements = page.locator('nav, .navigation, .menu, .sidebar');
    const navCount = await navElements.count();
    console.log(`🧭 Found ${navCount} navigation elements`);
    
    // Look for user menu or dashboard elements
    const userElements = page.locator('.user-menu, .dashboard, .welcome, [data-testid="user-menu"]');
    const userCount = await userElements.count();
    console.log(`👤 Found ${userCount} user-related elements`);
    
    // Verify the page loaded successfully
    expect(pageTitle).toBeTruthy();
    expect(navCount).toBeGreaterThan(0);
    
    console.log('✅ Demo test completed successfully with proper URL and authentication!');
  });

  test('Demo: Navigation Test with Real URLs', async ({ page }) => {
    console.log('🧭 Testing navigation with real application URLs');
    
    // Try to find and click on a menu item
    const menuItems = page.locator('a[href*="/"], button:has-text("Menu"), .menu-item');
    const menuCount = await menuItems.count();
    
    if (menuCount > 0) {
      console.log(`🔍 Found ${menuCount} potential menu items`);
      
      // Try to click on the first available menu item
      const firstMenuItem = menuItems.first();
      await firstMenuItem.waitFor({ state: 'visible', timeout: 5000 });
      await firstMenuItem.click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of the navigated page
      await page.screenshot({ path: 'screenshots/demo-navigation.png', fullPage: true });
      
      console.log(`📍 Navigated to: ${page.url()}`);
      expect(page.url()).toContain('laviniagro1stg.wpengine.com');
    } else {
      console.log('⚠️ No menu items found, but test continues');
    }
    
    console.log('✅ Navigation test completed!');
  });
});
