import { test, expect } from '@playwright/test';

test('Environment-Specific Test', async ({ page }) => {
  // Given I am testing in "staging"
  // Testing in staging environment

  // And I set basic auth credentials "laviniagro1stg" and "7ada27f4"
  await page.context().setHTTPCredentials({ username: "laviniagro1stg", password: "7ada27f4" });

  // And I navigate to "https://laviniagro1stg.wpengine.com/user-account/"
  await page.goto("https://laviniagro1stg.wpengine.com/user-account/");

  // When I fill "username" with "k12qaautomation@gmail.com"
  await page.fill('[name="username"]', "k12qaautomation@gmail.com");

  // And I fill "password" with "$VMF!)uxZLo9HqlLN4aMmS*D"
  await page.fill('[name="password"]', "$VMF!)uxZLo9HqlLN4aMmS*D");

  // And I click button "Login"
  await page.click('button:has-text("Login")');

  // Then I should see "Welcome"
  await expect(page.getByText("Welcome Back")).toBeVisible();
});