import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

test.setTimeout(150000);

const username = process.env.SMART_USERNAME;
const password = process.env.SMART_PASSWORD;

// 🔹 Helper → robust navigation
async function robustGoto(page, url, readySelector) {
  let lastErr;
  for (let i = 1; i <= 3; i++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      if (readySelector) {
        await page.waitForSelector(readySelector, { state: 'visible', timeout: 30000 });
      }
      return;
    } catch (e) {
      lastErr = e;
      if (i < 3) await page.waitForTimeout(2000);
    }
  }
  throw lastErr;
}

// 🔹 Define sidebar structure
const sidebarMenus = {
  Dashboar: [],
  Administration: ['Roles', 'School Type', 'School', 'Users', 'Pages', 'Signup-Status','Page Areas','District','Rejection Reason','Scan Status'],
  Masters: ['Grades', 'Assignment Type', 'Grade Subjects','Lesson','Lesson Unit','Curriculum','Rubrics'], 
  School: ['Future','Teachers','Students','School Grades','Academic Year','Students Group','School Users','Grade Classes','Reports','School License'],
  Assessments: ['Assessments', 'Reports'],
  Exercises: ['Past Group', 'Scan the Paper', 'Test', 'New', 'New Page', 'ExamPaper', 'NewExercise'],
  Inquiries: ['Newly Signed-up', 'Under Free-Trial', 'Approved', 'Rejected', 'Expiring Soon']
};

test('SMART-001: Smoke Test - SMART APP Sidebar & Logout', async ({ page }) => {
  // Step 1: Navigate
  await robustGoto(page, 'https://smartappstage.teachingchannel.com/');

  // Step 2: Login
  await page.fill('#Email', username);
  await page.fill('#Password', password);
  await page.getByRole('button', { name: /Sign In/i }).first().click();

  // Verify login success
  await expect(page.getByText(/Faraz/)).toBeVisible({ timeout: 20000 });

  // Step 3: Validate sidebar menus and submenus
  for (const [menu, submenus] of Object.entries(sidebarMenus)) {
    let  menuLocator ; 

    if (menu === 'School') {
        // Special case → pick the 2nd "School"
        menuLocator = page.locator("(//p[normalize-space() = 'School'])[2]");
      } else {
        // Normal case → exact match
        menuLocator = page.getByText(menu, { exact: true }).first();
      }
    
    await expect(menuLocator).toBeVisible({ timeout: 10000 });
    console.log(`✅ Main menu visible: ${menu}`);

    if (submenus.length > 0) {
      // expand menu
      await menuLocator.click();
        let subLocator ; 
      for (const sub of submenus) {
        if(sub === 'NewExercise'){
            subLocator = page.locator("//p[normalize-space() = 'NewExcercise']");
        } else{
         subLocator = page.getByText(sub, { exact: true }).first();
        }
        await expect(subLocator).toBeVisible({ timeout: 10000 });
        console.log(`   ↳ Submenu visible: ${sub}`);
      
    }
}
  }
  

  // Step 4: Logout
  await page.getByText(/Faraz/).click();
  await page.getByText(/Logout/i).click();

  // Validate redirect to login page
  await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible({ timeout: 20000 });
  console.log('✅ Logged out successfully');
});
