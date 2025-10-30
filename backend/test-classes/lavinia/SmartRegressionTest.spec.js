import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

test.setTimeout(600000);

const username = process.env.SMART_USERNAME;
const password = process.env.SMART_PASSWORD;

// 🔹 robust navigation helper
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

// 🔹 Sidebar structure with validate words
const sidebarMenus = {
  Dashboard: [],
  Administration: [
    { name: 'Roles', validate: 'Roles' },
    { name: 'School Type', validate: 'School Types' },
    { name: 'School', validate: 'Schools' },
    { name: 'Users', validate: 'Users' },
    { name: 'Pages', validate: 'Pages' },
    { name: 'Signup-Status', validate: 'Sign Up Status' },
    { name: 'Page Areas', validate: 'Page Areas' },
    { name: 'District', validate: 'Districts' },
    { name: 'Rejection Reason', validate: 'Rejection Reasons' },
    { name: 'Scan Status', validate: 'Scan Status' }
  ],
  Masters: [
    { name: 'Grades', validate: 'Grades' },
    { name: 'Assignment Type', validate: 'Assignment Types' },
    { name: 'Grade Subjects', validate: 'Subjects' },
    { name: 'Lesson', validate: 'Subject Lessons' },
    { name: 'Lesson Unit', validate: 'Lesson Units' },
    { name: 'Curriculum', validate: 'Curriculum' },
    { name: 'Rubrics', validate: 'Rubrics' }
  ],
  School: [
    //{ name: 'Future', validate: 'Future' },
    { name: 'Teachers', validate: 'Teachers' },
    { name: 'Students', validate: 'Students' },
    { name: 'School Grades', validate: 'Student Grades' },
    { name: 'Academic Year', validate: 'Academic Years' },
    { name: 'Students Group', validate: 'Student Groups' },
    { name: 'School Users', validate: 'School Users' },
    { name: 'Grade Classes', validate: 'Grade Classses' },
    { name: 'Reports', validate: '' },
    { name: 'School License', validate: 'School Licences' }
  ],
  Assessments: [
    { name: 'Assessments', validate: 'Assessments' },
    //{ name: 'Report', validate: 'Report' }
  ],
  Exercises: [
    // { name: 'Past Group', validate: 'Past Group' },
    // { name: 'Scan the Paper', validate: 'Scan the Paper' },
    // { name: 'Test', validate: 'Test' },
    // { name: 'New', validate: 'New' },
    // { name: 'New Page', validate: 'New Page' },
    // { name: 'ExamPaper', validate: 'ExamPaper' },
  ],
  Inquiries: [
    { name: 'Newly Signed-up', validate: 'Newly Signed-up Inquiries' },
    { name: 'Under Free-Trial', validate: 'Under Free Trial Inquiries' },
    { name: 'Approved', validate: 'Approved Inquiries List' },
    { name: 'Rejected', validate: 'Rejected Inquiries List' },
    { name: 'Expiring Soon', validate: 'Licenses Expiring Within 15 Days' }
  ]
  
};

test('Regression Test - SMART APP Sidebar Flow', async ({ page }) => {
  // Step 1: Navigate & Login
  await robustGoto(page, 'https://smartappstage.teachingchannel.com/');
  await page.fill('#Email', username);
  await page.fill('#Password', password);
  await page.getByRole('button', { name: /Sign In/i }).first().click();
  await expect(page.getByText(/Faraz/)).toBeVisible({ timeout: 20000 });
  console.log('✅ Login successful');

  // Step 2: Validate hamburger menus & submenus visible
  for (const [menu, submenus] of Object.entries(sidebarMenus)) {
    let menuLocator;
    if (menu === 'School') {
      menuLocator = page.locator("(//p[normalize-space() = 'School'])[2]");
    } else {
      menuLocator = page.getByText(menu, { exact: true }).first();
    }

    await expect(menuLocator).toBeVisible({ timeout: 10000 });
    console.log(`✅ Main menu visible: ${menu}`);

    if (submenus.length > 0) {
      await menuLocator.click();
      for (const sub of submenus) {
        const subLocator = page.getByText(sub.name, { exact: true }).first();
        await expect(subLocator).toBeVisible({ timeout: 10000 });
        console.log(`   ↳ Submenu visible: ${sub.name}`);
      }
    }
  }

  // Step 3: Navigate each submenu & validate
  for (const [menu, submenus] of Object.entries(sidebarMenus)) {
    let menuLocator;
    if (menu === 'School') {
      menuLocator = page.locator("(//p[normalize-space() = 'School'])[2]");
    } else {
      menuLocator = page.getByText(menu, { exact: true }).first();
    }
    
    // edge case for validate dashboard
    if (menu === 'Dashboard') {
      await menuLocator.click();
      const h5Locator = page.locator("//h3[normalize-space()='Dashboard']");
      await expect(h5Locator).toBeVisible({ timeout: 15000 });
      console.log('✅ Dashboard validated');
    }

    if (submenus.length > 0) {
      await menuLocator.scrollIntoViewIfNeeded();
      await menuLocator.click();
      const menuText = await menuLocator.innerText();

      for (const sub of submenus) {
        let subLocator; 
       
        if (menuText.trim() === 'Assessments') {
          subLocator = page.locator('//a[@href="/Assessment/Index"]');
        } else {
          subLocator = page.getByText(sub.name, { exact: true }).first();
        }
        
        await subLocator.click();

        if (sub.name === 'Reports') {
          const h5Locator = page.locator("//span[normalize-space() = 'Class Report']"); 
          await expect(h5Locator).toBeVisible({ timeout: 15000 });
          console.log('✅ Class Report validated');
        } else {
          const h5Locator = page.locator(`//h5[normalize-space()='${sub.validate}']`);
          await h5Locator.scrollIntoViewIfNeeded();
          await expect(h5Locator).toBeVisible({ timeout: 15000 });
          console.log(`   ✅ Submenu "${sub.name}" validated with h5: "${sub.validate}"`);
        }
      }
    }
  }

  // Step 3.5: Student Creation Flow Test
  const firstName = 'Test';
  const middleName = 'TestMiddle';
  const lastName = 'TestLastName';
  
  // Navigate to Students section
  await page.locator("(//p[normalize-space() = 'School'])[2]").click(); 
  await page.getByText('Students').first().click();
  await page.locator("button[data-mode='add']").click();
  
  // Fill student form
  await page.locator('#firstName').fill(firstName);
  await expect(page.locator('#middleNameError')).toBeVisible({ timeout: 15000 });
  await page.locator('#middleName').fill(middleName);
  await page.locator('#lastName').fill(lastName);
  await page.locator('#select2-schoolId-container').click();
  await page.locator('//li[normalize-space() = "Lex Academy"]').click(); 
  await page.locator('#select2-entryGrade-container').click(); 
  await page.locator('//li[normalize-space() = 9]').click(); 
  await page.locator('#entryYear').fill('2025');
  await page.locator('#select2-exitGrade-container').click();
  await page.locator('//li[normalize-space() = 9]').click(); 
  await page.locator('#exitYear').fill('2028');
  await page.locator('#saveBtn').click(); 

  await expect(page.getByText('Student created successfully!')).toBeVisible({ timeout: 10000 });

  // Click the OK button inside the modal
  await page.click("//div[@id='successModal']//button[@data-bs-dismiss='modal' and normalize-space()='OK']");

  // Verify student appears in table
  const expectedFullName = `${firstName} ${middleName} ${lastName}`;
  const rows = page.getByRole('row').filter({ hasText: 'Test TestMiddle TestLastName' });
  const count = await rows.count();
  
  // Minimum 1 row check
  expect(count).toBeGreaterThan(0);







  // Step 4: Logout
  await page.getByText(/Faraz/).click();
  await page.getByText(/Logout/i).click();
  await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible({ timeout: 20000 });
  console.log('✅ Logged out successfully');
});
