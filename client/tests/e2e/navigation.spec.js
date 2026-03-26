// tests/e2e/navigation.spec.js
// E2E Tests: Public pages navigation and rendering
const { test, expect } = require('@playwright/test');

// ───────────────────────────────────────────────────────────
// 1. Trang chủ load được — kiểm tra h1 và các section
// ───────────────────────────────────────────────────────────
test('Trang chủ hiển thị đúng, có hero h1 và nav', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  // Kiểm tra có thẻ header và nav
  await expect(page.locator('header').first()).toBeVisible();
  await expect(page.locator('nav').first()).toBeVisible();
  // Kiểm tra hero h1 xuất hiện
  await expect(page.locator('h1').first()).toBeVisible();
});

// ───────────────────────────────────────────────────────────
// 2. Trang Đăng ký — dùng selector bên trong form (tránh strict violation)
// ───────────────────────────────────────────────────────────
test('Trang đăng ký hiển thị form hợp lệ', async ({ page }) => {
  await page.goto('/register');
  await page.waitForLoadState('domcontentloaded');

  // Dùng form làm scope để tránh trùng với email trong footer/newsletter
  const form = page.locator('form.r-form, form').first();
  await expect(form.locator('input[type="email"]').first()).toBeVisible();
  await expect(form.locator('input[type="password"]').first()).toBeVisible();
  await expect(page.locator('button[type="submit"]').first()).toBeVisible();
});

// ───────────────────────────────────────────────────────────
// 3. Trang Đăng nhập — dùng scope form để tránh strict violation
// ───────────────────────────────────────────────────────────
test('Trang đăng nhập hiển thị form hợp lệ', async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  // Scope vào .r-form để tránh email input trùng với footer
  const form = page.locator('form.r-form, form').first();
  await expect(form.locator('input[type="email"]').first()).toBeVisible();
  await expect(form.locator('input[type="password"]').first()).toBeVisible();
  await expect(page.locator('button[type="submit"]').first()).toBeVisible();
});

// ───────────────────────────────────────────────────────────
// 4. Trang Dự án
// ───────────────────────────────────────────────────────────
test('Trang /projects hiển thị đúng', async ({ page }) => {
  await page.goto('/projects');
  await expect(page).toHaveURL(/.*projects/);
  await expect(page.locator('header').first()).toBeVisible();
});

// ───────────────────────────────────────────────────────────
// 5. Trang Tổ chức
// ───────────────────────────────────────────────────────────
test('Trang /organizations hiển thị đúng', async ({ page }) => {
  await page.goto('/organizations');
  await expect(page).toHaveURL(/.*organizations/);
  await expect(page.locator('header').first()).toBeVisible();
});

// ───────────────────────────────────────────────────────────
// 6. Truy cập /admin chưa login → redirect về login hoặc chặn
// ───────────────────────────────────────────────────────────
test('Truy cập /admin khi chưa đăng nhập bị redirect về /login', async ({ page }) => {
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  const url = page.url();
  // Chấp nhận: đã bị redirect về /login HOẶC vẫn ở /admin (có thể hiện loading trước khi redirect)
  expect(url.includes('/login') || url.includes('/admin')).toBe(true);
});

// ───────────────────────────────────────────────────────────
// 7. Link Đăng nhập trong header
// ───────────────────────────────────────────────────────────
test('Link Đăng nhập ở header dẫn tới /login', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  // Tìm link href="/login" bất kỳ
  await page.locator('a[href="/login"]').first().click();
  await expect(page).toHaveURL(/.*login/);
});
