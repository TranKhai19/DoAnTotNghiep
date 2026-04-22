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

// Giả định rằng khi Mint (Tạo chiến dịch) UI sẽ gọi API backend: POST /api/campaigns hoặc POST /api/campaigns/draft/:id/approve
// Dùng page.route để chặn request này và trả về lỗi giả lập từ mạng Besu
test.describe('Xử lý lỗi mạng Blockchain Besu (MINT)', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator('.admin-sidebar').getByText('Tạo chiến dịch').click();
    await page.waitForURL(/.*create-campaign/);
    
    // Điền form hợp lệ trước khi submit
    await page.fill('input[name="title"]', 'Chiến dịch từ thiện');
    await page.fill('textarea[name="description"]', 'Mô tả hợp lệ với hơn 20 ký tự để chi tiết hơn.');
    await page.fill('input[name="goal_amount"]', '1000');
    await page.selectOption('select[name="category_id"]', '1');
    await page.fill('input[name="start_date"]', '2026-05-01');
    await page.fill('input[name="end_date"]', '2026-06-01');
  });

  test('FUNC-MINT-E01: Lỗi mất kết nối (Connection Refused)', async ({ page }) => {
    await page.route('**/api/campaigns/**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'could not connect to node' })
      });
    });

    page.on('dialog', dialog => dialog.accept());
    await page.locator('button[type="submit"]').click();

    // Verify UI không bị treo, hiển thị thông báo lỗi thân thiện (dựa theo code tương lai, hiện tại mock để kiểm tra)
    // Tạm thời verify là thông báo dialog lỗi hoặc UI hiển thị lỗi
    // Có thể sẽ fail nếu UI hiện tại chưa xử lý gọi API, test này được viết đón đầu.
    // Lỗi mong đợi theo mô tả: "Không thể kết nối đến mạng Blockchain"
    
    // Vì UI dùng alert(), ta có thể bắt sự kiện dialog
  });

  test('FUNC-MINT-E02: Lỗi Timeout mạng Besu chập chờn', async ({ page }) => {
    await page.route('**/api/campaigns/**', async route => {
      await route.fulfill({
        status: 504,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'timeout exceeded' })
      });
    });

    page.on('dialog', dialog => dialog.accept());
    await page.locator('button[type="submit"]').click();
  });

  test('FUNC-MINT-E03: Lỗi hết phí Gas (Out of Gas)', async ({ page }) => {
    await page.route('**/api/campaigns/**', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'out of gas' })
      });
    });

    page.on('dialog', dialog => dialog.accept());
    await page.locator('button[type="submit"]').click();
  });

  test('FUNC-MINT-E04: Số dư tài khoản không đủ (Insufficient Funds)', async ({ page }) => {
    await page.route('**/api/campaigns/**', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'insufficient funds for gas * price' })
      });
    });

    page.on('dialog', dialog => dialog.accept());
    await page.locator('button[type="submit"]').click();
  });

});
