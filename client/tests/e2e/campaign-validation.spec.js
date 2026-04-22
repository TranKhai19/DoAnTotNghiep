const { test, expect } = require('@playwright/test');

const ADMIN_EMAIL = 'tdk1902@gmail.com';
const ADMIN_PASSWORD = 'Khai1902@';

async function loginAsAdmin(page) {
  await page.goto('/login');
  const form = page.locator('form.r-form, form').first();
  await form.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await form.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/.*admin.*/, { timeout: 20000 });
}

test.describe('Validation Form Tạo Chiến Dịch (Create Campaign)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator('.admin-sidebar').getByText('Tạo chiến dịch').click();
    await page.waitForURL(/.*create-campaign/);
  });

  test('CF01: Bỏ trống tên (title) -> Hiển thị lỗi', async ({ page }) => {
    await page.fill('input[name="title"]', '');
    await page.fill('textarea[name="description"]', 'Mô tả hợp lệ với hơn 20 ký tự để chi tiết hơn.');
    await page.fill('input[name="goal_amount"]', '1000');
    await page.selectOption('select[name="category_id"]', '1');
    await page.fill('input[name="start_date"]', '2026-05-01');
    await page.fill('input[name="end_date"]', '2026-06-01');
    
    await page.locator('button[type="submit"]').click();
    
    const errorMsg = page.locator('div', { hasText: 'Tiêu đề phải có ít nhất 5 ký tự' }).first();
    await expect(errorMsg).toBeVisible();
    await expect(page).toHaveURL(/.*create-campaign/); // Vẫn ở lại trang
  });

  test('CF02: Bỏ trống mô tả (description) -> Hiển thị lỗi', async ({ page }) => {
    await page.fill('input[name="title"]', 'Chiến dịch từ thiện');
    await page.fill('textarea[name="description"]', '');
    await page.fill('input[name="goal_amount"]', '1000');
    await page.selectOption('select[name="category_id"]', '1');
    await page.fill('input[name="start_date"]', '2026-05-01');
    await page.fill('input[name="end_date"]', '2026-06-01');
    
    await page.locator('button[type="submit"]').click();
    
    const errorMsg = page.locator('div', { hasText: 'Mô tả cần ít nhất 20 ký tự để chi tiết hơn' }).first();
    await expect(errorMsg).toBeVisible();
  });

  test('CF03, CF04, CF05: Lỗi số tiền mục tiêu (Trống, Âm, =0) -> Hiển thị lỗi', async ({ page }) => {
    await page.fill('input[name="title"]', 'Chiến dịch từ thiện');
    await page.fill('textarea[name="description"]', 'Mô tả hợp lệ với hơn 20 ký tự để chi tiết hơn.');
    await page.selectOption('select[name="category_id"]', '1');
    await page.fill('input[name="start_date"]', '2026-05-01');
    await page.fill('input[name="end_date"]', '2026-06-01');
    
    // Test âm
    await page.fill('input[name="goal_amount"]', '-1000');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('div', { hasText: 'Mục tiêu tối thiểu là $100' }).first()).toBeVisible();

    // Test = 0
    await page.fill('input[name="goal_amount"]', '0');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('div', { hasText: 'Mục tiêu tối thiểu là $100' }).first()).toBeVisible();

    // Test trống
    await page.fill('input[name="goal_amount"]', '');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('div', { hasText: 'Mục tiêu tối thiểu là $100' }).first()).toBeVisible();
  });

  test('CF06, CF07: Bỏ trống ngày bắt đầu / ngày kết thúc -> Báo lỗi', async ({ page }) => {
    await page.fill('input[name="title"]', 'Chiến dịch từ thiện');
    await page.fill('textarea[name="description"]', 'Mô tả hợp lệ với hơn 20 ký tự để chi tiết hơn.');
    await page.fill('input[name="goal_amount"]', '1000');
    await page.selectOption('select[name="category_id"]', '1');
    
    // Thiếu start date
    await page.fill('input[name="start_date"]', '');
    await page.fill('input[name="end_date"]', '2026-06-01');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('div', { hasText: 'Vui lòng chọn ngày bắt đầu' }).first()).toBeVisible();

    // Thiếu end date
    await page.fill('input[name="start_date"]', '2026-05-01');
    await page.fill('input[name="end_date"]', '');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('div', { hasText: 'Vui lòng chọn ngày kết thúc' }).first()).toBeVisible();
  });

  test('CF09: Ngày kết thúc nhỏ hơn ngày bắt đầu -> Báo lỗi logic', async ({ page }) => {
    await page.fill('input[name="title"]', 'Chiến dịch từ thiện');
    await page.fill('textarea[name="description"]', 'Mô tả hợp lệ với hơn 20 ký tự để chi tiết hơn.');
    await page.fill('input[name="goal_amount"]', '1000');
    await page.selectOption('select[name="category_id"]', '1');
    
    // End < Start
    await page.fill('input[name="start_date"]', '2026-06-01');
    await page.fill('input[name="end_date"]', '2026-05-01');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('div', { hasText: 'Ngày kết thúc phải sau ngày bắt đầu' }).first()).toBeVisible();
  });

  test('CF12: Không chọn danh mục (category) -> Báo lỗi', async ({ page }) => {
    await page.fill('input[name="title"]', 'Chiến dịch từ thiện');
    await page.fill('textarea[name="description"]', 'Mô tả hợp lệ với hơn 20 ký tự để chi tiết hơn.');
    await page.fill('input[name="goal_amount"]', '1000');
    await page.fill('input[name="start_date"]', '2026-05-01');
    await page.fill('input[name="end_date"]', '2026-06-01');
    // Bỏ qua category_id
    
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('div', { hasText: 'Vui lòng chọn danh mục' }).first()).toBeVisible();
  });

  test('CF14: Dữ liệu hợp lệ -> Form submit thành công', async ({ page }) => {
    await page.fill('input[name="title"]', 'Chiến dịch bảo vệ môi trường');
    await page.fill('textarea[name="description"]', 'Dự án nhằm mục tiêu làm sạch các bãi biển và khu dân cư.');
    await page.fill('input[name="goal_amount"]', '5000');
    await page.selectOption('select[name="category_id"]', '1');
    await page.fill('input[name="start_date"]', '2026-05-01');
    await page.fill('input[name="end_date"]', '2026-12-31');
    
    page.on('dialog', dialog => dialog.accept());
    await page.locator('button[type="submit"]').click();
    
    await page.waitForURL(/\/admin$|\/admin\/?$/, { timeout: 15000 });
    expect(page.url()).toMatch(/\/admin/);
  });
});
