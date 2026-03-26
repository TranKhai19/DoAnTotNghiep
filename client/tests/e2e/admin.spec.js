// tests/e2e/admin.spec.js
const { test, expect } = require('@playwright/test');

const ADMIN_EMAIL    = 'tranduykhai@dtu.edu.vn';
const ADMIN_PASSWORD = 'admin@123';

async function loginAsAdmin(page) {
  await page.goto('/login');
  const form = page.locator('form.r-form, form').first();
  await form.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await form.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  // Đợi redirect về /admin
  await page.waitForURL(/.*admin.*/, { timeout: 20000 });
}

// ───────────────────────────────────────────────────────────
// 1. Admin Dashboard — Sidebar hiển thị đúng
// ───────────────────────────────────────────────────────────
test('Admin Dashboard hiển thị Sidebar đúng', async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForLoadState('domcontentloaded');

  await expect(page.locator('.admin-sidebar')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('.admin-sidebar').getByText('Tổng quan')).toBeVisible();
  await expect(page.locator('.admin-sidebar').getByText('Hồ sơ tổ chức')).toBeVisible();
  await expect(page.locator('.admin-sidebar').getByText('Tạo chiến dịch')).toBeVisible();
  await expect(page.locator('.admin-sidebar').getByText('Quản lý nhân sự')).toBeVisible();
});

// ───────────────────────────────────────────────────────────
// 2. Điều hướng tới Hồ sơ tổ chức
// ───────────────────────────────────────────────────────────
test('Admin điều hướng tới Hồ sơ tổ chức và form hiển thị', async ({ page }) => {
  await loginAsAdmin(page);
  await page.locator('.admin-sidebar').getByText('Hồ sơ tổ chức').click();
  await expect(page).toHaveURL(/.*organizations/, { timeout: 8000 });
  await expect(page.locator('input[name="full_name"]')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('input[name="phone"]')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
});

// ───────────────────────────────────────────────────────────
// 3. Điều hướng tới Tạo chiến dịch
// ───────────────────────────────────────────────────────────
test('Admin điều hướng tới Tạo chiến dịch và form hiển thị đủ field', async ({ page }) => {
  await loginAsAdmin(page);
  await page.locator('.admin-sidebar').getByText('Tạo chiến dịch').click();
  await expect(page).toHaveURL(/.*create-campaign/, { timeout: 8000 });
  await expect(page.locator('input[name="title"]')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('textarea[name="description"]')).toBeVisible();
  await expect(page.locator('input[name="goal_amount"]')).toBeVisible();
  await expect(page.locator('select[name="category_id"]')).toBeVisible();
  await expect(page.locator('input[name="start_date"]')).toBeVisible();
  await expect(page.locator('input[name="end_date"]')).toBeVisible();
});

// ───────────────────────────────────────────────────────────
// 4. Tạo chiến dịch mới thành công
// ───────────────────────────────────────────────────────────
test('Admin tạo chiến dịch mới thành công', async ({ page }) => {
  await loginAsAdmin(page);
  await page.locator('.admin-sidebar').getByText('Tạo chiến dịch').click();
  await page.waitForURL(/.*create-campaign/, { timeout: 8000 });

  await page.fill('input[name="title"]', 'Test Campaign Playwright');
  await page.fill('textarea[name="description"]', 'Chiến dịch tạo bởi Playwright automation test.');
  await page.fill('input[name="goal_amount"]', '1000000');
  await page.selectOption('select[name="category_id"]', '1');
  await page.fill('input[name="start_date"]', '2026-04-01');
  await page.fill('input[name="end_date"]', '2026-12-31');

  page.on('dialog', dialog => dialog.accept());
  await page.locator('button[type="submit"]').click();

  await page.waitForURL(/\/admin$|\/admin\/?$/, { timeout: 15000 });
  expect(page.url()).toMatch(/\/admin/);
});

// ───────────────────────────────────────────────────────────
// 5. Quản lý nhân sự
// ───────────────────────────────────────────────────────────
test('Admin điều hướng tới Quản lý nhân sự và form hiển thị', async ({ page }) => {
  await loginAsAdmin(page);
  await page.locator('.admin-sidebar').getByText('Quản lý nhân sự').click();
  await expect(page).toHaveURL(/.*personnel/, { timeout: 8000 });
  await expect(page.locator('input[name="fullName"]')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="phone"]')).toBeVisible();
});

// ───────────────────────────────────────────────────────────
// 6. Thoát về web chính
// ───────────────────────────────────────────────────────────
test('Admin thoát về trang chủ qua nút Thoát về web chính', async ({ page }) => {
  await loginAsAdmin(page);
  await page.locator('.admin-sidebar').getByText('Thoát về web chính').click();
  await page.waitForURL('/', { timeout: 8000 });
  await expect(page).toHaveURL('/');
});
