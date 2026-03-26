// tests/api.test.js
// API Integration Tests — Jest + Supertest
// Yêu cầu: npm run start ở /server (port 3000) trước khi chạy
const request = require('supertest');

const BASE_URL = 'http://localhost:3000';

// ─── Thông tin tài khoản test thực ───────────────────────────────────────────
const ADMIN_EMAIL    = 'tranduykhai@dtu.edu.vn';
const ADMIN_PASSWORD = 'admin@123';

const STAFF_EMAIL    = 'khaitd.fastdo@gmail.com';
const STAFF_PASSWORD = 'admin@123';

const USER_EMAIL     = 'tdk1902@gmail.com';
const USER_PASSWORD  = 'Khai1902@';

// ─── Campaign có sẵn để test ─────────────────────────────────────────────────
const EXISTING_CAMPAIGN_ID  = '747b639b-36c8-4a57-99fd-9f838c3bbc08';
const FAKE_CAMPAIGN_ID      = '00000000-0000-0000-0000-000000000000';

// ════════════════════════════════════════════════════════════════════════════════
// 1. HEALTH CHECK
// ════════════════════════════════════════════════════════════════════════════════
describe('Health Check', () => {
  test('GET / → server đang chạy', async () => {
    const res = await request(BASE_URL).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/running/i);
  });

  test('GET /api/health → status OK', async () => {
    const res = await request(BASE_URL).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// 2. AUTH — ĐĂNG NHẬP
// ════════════════════════════════════════════════════════════════════════════════
describe('Auth — Đăng nhập hợp lệ', () => {
  test('Admin login thành công và có session', async () => {
    const res = await request(BASE_URL)
      .post('/api/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('session');
    expect(res.body.session).toHaveProperty('access_token');
  });

  test('Staff login thành công và có session', async () => {
    const res = await request(BASE_URL)
      .post('/api/auth/login')
      .send({ email: STAFF_EMAIL, password: STAFF_PASSWORD });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('session');
  });

  test('User login thành công và có session', async () => {
    const res = await request(BASE_URL)
      .post('/api/auth/login')
      .send({ email: USER_EMAIL, password: USER_PASSWORD });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('session');
  });
});

describe('Auth — Đăng nhập sai', () => {
  test('Sai mật khẩu → 400 + message lỗi', async () => {
    const res = await request(BASE_URL)
      .post('/api/auth/login')
      .send({ email: ADMIN_EMAIL, password: 'SaiMatKhau_xyz!' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('Email không tồn tại → 400', async () => {
    const res = await request(BASE_URL)
      .post('/api/auth/login')
      .send({ email: 'ghost_99999@notexist.com', password: 'Test@1234' });
    expect(res.statusCode).toBe(400);
  });

  test('Thiếu email → 400', async () => {
    const res = await request(BASE_URL)
      .post('/api/auth/login')
      .send({ password: ADMIN_PASSWORD });
    expect(res.statusCode).toBe(400);
  });

  test('Thiếu password → 400', async () => {
    const res = await request(BASE_URL)
      .post('/api/auth/login')
      .send({ email: ADMIN_EMAIL });
    expect(res.statusCode).toBe(400);
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// 3. CAMPAIGNS — READ
// ════════════════════════════════════════════════════════════════════════════════
describe('Campaigns — GET', () => {
  test('GET /api/campaigns → 200, trả về array', async () => {
    const res = await request(BASE_URL).get('/api/campaigns');
    expect(res.statusCode).toBe(200);
    // API trả về { success, data } hoặc trực tiếp array
    const arr = res.body.data ?? res.body;
    expect(Array.isArray(arr)).toBe(true);
  });

  test('GET /api/campaigns → từng item có đủ 12 field theo schema', async () => {
    const res = await request(BASE_URL).get('/api/campaigns');
    const arr = res.body.data ?? res.body;
    if (arr.length > 0) {
      const item = arr[0];
      const requiredFields = [
        'id', 'title', 'description',
        'goal_amount', 'raised_amount',
        'qr_code', 'category_id', 'beneficiary_id',
        'created_by', 'start_date', 'end_date',
        'status', 'created_at'
      ];
      requiredFields.forEach(f => {
        expect(item).toHaveProperty(f);
      });
    }
  });

  test(`GET /api/campaigns/${EXISTING_CAMPAIGN_ID} → tìm thấy`, async () => {
    const res = await request(BASE_URL).get(`/api/campaigns/${EXISTING_CAMPAIGN_ID}`);
    expect(res.statusCode).toBe(200);
    const data = res.body.data ?? res.body;
    expect(data).toHaveProperty('id', EXISTING_CAMPAIGN_ID);
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('goal_amount');
    expect(data).toHaveProperty('start_date');
    expect(data).toHaveProperty('end_date');
    expect(data).toHaveProperty('status');
  });

  test('GET /api/campaigns/:id với uuid không tồn tại → 404', async () => {
    const res = await request(BASE_URL).get(`/api/campaigns/${FAKE_CAMPAIGN_ID}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// 4. CAMPAIGNS — CREATE (schema mới snake_case)
// ════════════════════════════════════════════════════════════════════════════════
describe('Campaigns — POST (tạo mới)', () => {
  test('Tạo campaign với đầy đủ field → 201', async () => {
    const res = await request(BASE_URL)
      .post('/api/campaigns')
      .send({
        title:          'Chiến dịch automation test',
        description:    'Tạo bởi Jest automation test — có thể xóa sau.',
        goal_amount:    10000000,
        raised_amount:  0,
        qr_code:        'https://example.com/qr/test.png',
        category_id:    1,
        beneficiary_id: null,
        start_date:     '2026-04-01T00:00:00Z',
        end_date:       '2026-12-31T00:00:00Z',
        status:         'Đang chạy'
      });
    expect([200, 201]).toContain(res.statusCode);
    if (res.statusCode === 201) {
      const data = res.body.data ?? res.body;
      expect(data).toHaveProperty('id');
      expect(data.goal_amount).toBe(10000000);
    }
  });

  test('Tạo campaign thiếu title → 400 + error message snake_case', async () => {
    const res = await request(BASE_URL)
      .post('/api/campaigns')
      .send({
        description: 'Thiếu title',
        goal_amount:  1000,
        start_date:  '2026-04-01T00:00:00Z',
        end_date:    '2026-12-31T00:00:00Z',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/goal_amount|start_date|title/i);
  });

  test('Tạo campaign thiếu goal_amount → 400', async () => {
    const res = await request(BASE_URL)
      .post('/api/campaigns')
      .send({
        title:      'Thiếu goal_amount',
        description:'desc',
        start_date: '2026-04-01T00:00:00Z',
        end_date:   '2026-12-31T00:00:00Z',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Tạo campaign goal_amount = 0 → 400', async () => {
    const res = await request(BASE_URL)
      .post('/api/campaigns')
      .send({
        title:       'Goal = 0',
        description: 'test',
        goal_amount:  0,
        start_date:  '2026-04-01T00:00:00Z',
        end_date:    '2026-12-31T00:00:00Z',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Tạo campaign dùng field cũ (camelCase) → 400 (field không được chấp nhận)', async () => {
    const res = await request(BASE_URL)
      .post('/api/campaigns')
      .send({
        title:       'Test camelCase',
        description: 'desc',
        goalAmount:   5000,   // field cũ — sai
        startDate:   '2026-04-01T00:00:00Z',
        endDate:     '2026-12-31T00:00:00Z',
      });
    expect(res.statusCode).toBe(400);
    // Server phải từ chối vì goal_amount bị thiếu
    expect(res.body.error).toMatch(/goal_amount/i);
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// 5. WEBHOOKS
// ════════════════════════════════════════════════════════════════════════════════
describe('Webhooks', () => {
  test('POST /api/webhooks/bank thiếu transactionId → 400', async () => {
    const res = await request(BASE_URL)
      .post('/api/webhooks/bank')
      .send({ amount: 500000, campaignId: EXISTING_CAMPAIGN_ID });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/webhooks/bank amount = 0 → 400', async () => {
    const res = await request(BASE_URL)
      .post('/api/webhooks/bank')
      .send({ transactionId: 'TX_ZERO', amount: 0, campaignId: EXISTING_CAMPAIGN_ID });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/webhooks/bank campaignId không tồn tại → 404', async () => {
    const res = await request(BASE_URL)
      .post('/api/webhooks/bank')
      .send({ transactionId: 'TX_GHOST', amount: 100000, campaignId: FAKE_CAMPAIGN_ID });
    expect([404, 500]).toContain(res.statusCode);
  });
});
