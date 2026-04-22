// tests/e2e/auth.spec.js
const { test, expect } = require('@playwright/test');

const ADMIN_EMAIL    = 'tdk1902@gmail.com';
const ADMIN_PASSWORD = 'Khai1902@';
const STAFF_EMAIL    = 'khaitd.fastdo@gmail.com';
const STAFF_PASSWORD = 'admin@123';
const USER_EMAIL     = 'tranduykhai@dtu.edu.vn';
const USER_PASSWORD  = 'admin@123';

// Helper fill login form — scope vào form.r-form để tránh strict violation
async function fillLoginForm(page, email, password) {
  const form = page.locator('form.r-form, form').first();
  await form.locator('input[type="email"]').fill(email);
  await form.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').first().click();
}

// ───────────────────────────────────────────────────────────
// 1. User login → trang chủ
// ───────────────────────────────────────────────────────────
test('User login thành công và redirect về trang chủ (/)', async ({ page }) => {
  await page.goto('/login');
  await fillLoginForm(page, USER_EMAIL, USER_PASSWORD);
  await page.waitForURL('/', { timeout: 15000 });
  await expect(page).toHaveURL('/');
});

// ───────────────────────────────────────────────────────────
// 2. Admin login → /admin
// ───────────────────────────────────────────────────────────
test('Admin login thành công và redirect về /admin', async ({ page }) => {
  await page.goto('/login');
  await fillLoginForm(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.waitForURL(/.*admin.*/, { timeout: 15000 });
  expect(page.url()).toContain('/admin');
});

// ───────────────────────────────────────────────────────────
// 3. Staff login → /admin
// ───────────────────────────────────────────────────────────
test('Staff login thành công và redirect về /admin', async ({ page }) => {
  await page.goto('/login');
  await fillLoginForm(page, STAFF_EMAIL, STAFF_PASSWORD);
  await page.waitForURL(/.*admin.*/, { timeout: 15000 });
  expect(page.url()).toContain('/admin');
});

// ───────────────────────────────────────────────────────────
// 4. Sai mật khẩu → vẫn ở trang login, có lỗi đỏ
// (LoginPage hiển thị lỗi bằng div style color:red — không dùng class/role, dùng :text)
// ───────────────────────────────────────────────────────────
test('Login sai mật khẩu hiển thị thông báo lỗi', async ({ page }) => {
  await page.goto('/login');
  await fillLoginForm(page, ADMIN_EMAIL, 'SaiMatKhau_xyz!');

  // Chờ tối đa 10s để Supabase trả về lỗi
  await page.waitForTimeout(3000);
  await expect(page).toHaveURL(/.*login/, { timeout: 6000 });

  // LoginPage render lỗi trong: <div style="color: red; ...">errorMsg</div>
  const errDiv = page.locator('.r-form ~ div, div[style*="color: red"], div[style*="color:red"]').first();
  // Hoặc tìm bất kỳ div con của r-card chứa màu đỏ
  const formCard = page.locator('.r-card');
  // Kiểm tra errorMsg xuất hiện đâu đó trong form card
  await expect(formCard).toContainText(/thất bại|sai|không đúng|Invalid|invalid|error/i, { timeout: 8000 });
});

// ───────────────────────────────────────────────────────────
// 5. Email không tồn tại → lỗi
// ───────────────────────────────────────────────────────────
test('Login với email không tồn tại hiển thị lỗi', async ({ page }) => {
  await page.goto('/login');
  await fillLoginForm(page, 'ghost_99999@notexist.com', 'Test@1234');

  await page.waitForTimeout(3000);
  await expect(page).toHaveURL(/.*login/, { timeout: 6000 });

  const formCard = page.locator('.r-card');
  await expect(formCard).toContainText(/thất bại|sai|không đúng|Invalid|invalid|error/i, { timeout: 8000 });
});

// ───────────────────────────────────────────────────────────
// 6. Logout thành công
// ───────────────────────────────────────────────────────────
test('User đăng xuất thành công', async ({ page }) => {
  await page.goto('/login');
  await fillLoginForm(page, USER_EMAIL, USER_PASSWORD);
  await page.waitForURL('/', { timeout: 15000 });

  const logoutBtn = page.locator('button', { hasText: 'Đăng xuất' }).first();
  await expect(logoutBtn).toBeVisible({ timeout: 5000 });
  await logoutBtn.click();
  await page.waitForTimeout(1500);
  expect(page.url()).toMatch(/\/$/);
});
