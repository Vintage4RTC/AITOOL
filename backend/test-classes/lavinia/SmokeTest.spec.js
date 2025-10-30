import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Increase overall test timeout to avoid premature failures on slow networks
test.setTimeout(120000)

// Resolve credentials strictly from env
const basicUser = process.env.laviniaBasicAuthUsername
const basicPass = process.env.laviniaBasicAuthPassword
const username = process.env.laviniaUsername
const password = process.env.laviniaPassword

console.log('Basic User:', basicUser, 'Basic Pass:', basicPass ? '***' : undefined);

// Configure HTTP Basic auth only if env vars are present
if (typeof basicUser === 'string' && typeof basicPass === 'string' && basicUser && basicPass) {
  test.use({ httpCredentials: { username: basicUser, password: basicPass } })
}

test('LAV-001: Smoke Test - Lavinia Hamburger Menu & Sign Out', async ({ page }) => {

  // Step 1: Robust Navigate
  async function robustGoto(url, readySelector){
    let lastErr
    for(let i=1;i<=3;i++){
      try{
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
        await page.waitForTimeout(500)
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(()=>{})
        if(readySelector){
          await page.waitForSelector(readySelector, { state: 'visible', timeout: 30000 })
        }
        return
      }catch(e){
        lastErr = e
        if(i<3){
          try{
            await page.waitForTimeout(2000)
          }catch{
            await new Promise(r => setTimeout(r, 2000))
          }
        }
      }
    }
    throw lastErr
  }

  await robustGoto('https://laviniagro1stg.wpengine.com/user-account/', 'text=PLATFORM LOGIN')

  // Step 2: Click on Platform Login and wait for network to settle
  await page.getByRole('link', { name: /platform login/i }).first().click();
  await page.waitForLoadState('networkidle');

  // Step 3: Fill login form (robust selectors)
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.getByRole('button', { name: /login/i }).first().click();

  // Verify login success
  await expect(page.getByText(/welcome back|dashboard/i).first()).toBeVisible({ timeout: 20000 });

  // Step 4: Validate all sidebar/hamburger menu items
  const menuItems = [
    'Dashboard',
    'Platform Roster',
    'RISE Curriculum Library',
    'RISE Resources',
    'Curriculum Platform'
  ];

  for (const item of menuItems) {
    const locator = page.getByText(item, { exact: false }).first();
    await expect(locator).toBeVisible();
    console.log(`✅ Validated menu item: ${item}`);
  }

  // Step 5: Click on Sign Out
  await page.getByText(/sign out/i).first().click();

  // Step 6: Validate redirect to home/login page
  await expect(page).toHaveURL("https://laviniagro1stg.wpengine.com/");
  
});
