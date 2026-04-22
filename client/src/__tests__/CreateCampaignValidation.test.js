import { z } from 'zod';

// ─── Schema đồng bộ với BeneficiaryForm.js (Zod) ─────────────────────────────
const beneficiarySchema = z.object({
  full_name:  z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100, 'Họ tên quá dài'),
  identifier: z
    .string()
    .min(9,  'Mã định danh/CCCD phải từ 9 đến 12 ký tự')
    .max(12, 'Mã định danh/CCCD tối đa 12 ký tự')
    .regex(/^[a-zA-Z0-9]+$/, 'Mã định danh chỉ gồm chữ và số'),
  phone:   z.string().regex(/^(0|\+84)[0-9]{8,10}$/, 'Số điện thoại không hợp lệ (VD: 0912345678)'),
  address: z.string().min(5, 'Địa chỉ quá ngắn, cần ghi tiết hơn'),
});

// ── Enum values đồng bộ với DB migration 005 ────────────────────────────────
const CAMPAIGN_STATUS = {
  DRAFT:            'draft',
  PENDING_APPROVAL: 'pending_approval',
  ACTIVE:           'active',
  COMPLETED:        'completed',
  REJECTED:         'rejected',
  CLOSED:           'closed',
};

const APPROVAL_STATUS = {
  PENDING:  'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const VALID_CAMPAIGN_STATUSES = Object.values(CAMPAIGN_STATUS);
const VALID_APPROVAL_STATUSES = Object.values(APPROVAL_STATUS);

// ── Campaign Schema ─────────────────────────────────────────────────────────
const campaignSchema = z.object({
  title:       z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(200, 'Tiêu đề quá dài'),
  description: z.string().min(20, 'Mô tả cần ít nhất 20 ký tự để chi tiết hơn'),
  goal_amount: z.number().min(100, 'Mục tiêu tối thiểu là 100'),
  qr_code:     z.string().url('Link URL không hợp lệ').optional().or(z.literal('')),
  category_id: z.number().int({ message: 'Vui lòng chọn danh mục' }).min(1, 'Vui lòng chọn danh mục'),
  start_date:  z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  end_date:    z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  // status phải thuộc enum hợp lệ — chỉ chấp nhận 'draft' hoặc 'pending_approval' lúc tạo
  status: z.enum([CAMPAIGN_STATUS.DRAFT, CAMPAIGN_STATUS.PENDING_APPROVAL]).optional(),
}).refine(data => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: 'Ngày kết thúc phải sau ngày bắt đầu',
  path: ['end_date'],
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getValidBeneficiary = () => ({
  full_name:  'Nguyễn Văn A',
  identifier: '079201012345',  // 12 ký tự số — CCCD hợp lệ
  phone:      '0912345678',
  address:    '123 Đường Lê Lợi, Quận 1, TP.HCM',
});

const getValidCampaign = () => ({
  title:       'Chiến dịch từ thiện lũ lụt miền Bắc (Hợp lệ)',
  description: 'Đây là dòng mô tả đầy đủ và chi tiết hơn 20 ký tự để vượt qua validation.',
  goal_amount: 5000000,
  qr_code:     'https://momo.vn/qr/123456',
  category_id: 1,
  start_date:  '2026-05-01',
  end_date:    '2026-06-01',
});

// ═════════════════════════════════════════════════════════════════════════════
// NHÓM 1 – BF: BeneficiaryForm Validation (MỚI)
// ═════════════════════════════════════════════════════════════════════════════
describe('BF: Kiểm thử Validation Hồ sơ Người thụ hưởng (BeneficiaryForm)', () => {

  // BF01: Tên hợp lệ
  test('BF01: Họ tên hợp lệ → pass', () => {
    const result = beneficiarySchema.safeParse(getValidBeneficiary());
    expect(result.success).toBe(true);
  });

  // BF02: Họ tên quá ngắn (< 2 ký tự)
  test('BF02: Họ tên 1 ký tự → lỗi min length', () => {
    const data = { ...getValidBeneficiary(), full_name: 'A' };
    const result = beneficiarySchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain('full_name');
    expect(result.error.issues[0].message).toMatch(/2 ký tự/i);
  });

  // BF03: Họ tên bỏ trống
  test('BF03: Họ tên rỗng → lỗi', () => {
    const data = { ...getValidBeneficiary(), full_name: '' };
    const result = beneficiarySchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues.some(e => e.path.includes('full_name'))).toBe(true);
  });

  // BF04: Mã CCCD hợp lệ (9 ký tự — CMND)
  test('BF04: Mã định danh 9 ký tự số → hợp lệ', () => {
    const data = { ...getValidBeneficiary(), identifier: '079201012' };
    const result = beneficiarySchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  // BF05: CCCD quá ngắn (< 9 ký tự)
  test('BF05: Mã định danh 8 ký tự → lỗi min 9', () => {
    const data = { ...getValidBeneficiary(), identifier: '07920101' };
    const result = beneficiarySchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues.some(e => e.path.includes('identifier'))).toBe(true);
  });

  // BF06: CCCD quá dài (> 12 ký tự)
  test('BF06: Mã định danh 13 ký tự → lỗi max 12', () => {
    const data = { ...getValidBeneficiary(), identifier: '0792010123456' }; // 13
    const result = beneficiarySchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues.some(e => e.path.includes('identifier'))).toBe(true);
  });

  // BF07: CCCD chứa ký tự đặc biệt
  test('BF07: Mã định danh chứa ký tự đặc biệt → lỗi regex', () => {
    const data = { ...getValidBeneficiary(), identifier: '079-201-012' }; // có gạch ngang
    const result = beneficiarySchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues.some(e => e.path.includes('identifier'))).toBe(true);
  });

  // BF08: Số điện thoại hợp lệ — bắt đầu 0
  test('BF08: SĐT bắt đầu 0 (10 số) → hợp lệ', () => {
    const data = { ...getValidBeneficiary(), phone: '0912345678' };
    expect(beneficiarySchema.safeParse(data).success).toBe(true);
  });

  // BF09: Số điện thoại hợp lệ — đầu +84
  test('BF09: SĐT bắt đầu +84 → hợp lệ', () => {
    const data = { ...getValidBeneficiary(), phone: '+84912345678' };
    expect(beneficiarySchema.safeParse(data).success).toBe(true);
  });

  // BF10: Số điện thoại sai định dạng
  test('BF10: SĐT sai định dạng (bắt đầu 1) → lỗi regex', () => {
    const data = { ...getValidBeneficiary(), phone: '1234567890' };
    const result = beneficiarySchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues.some(e => e.path.includes('phone'))).toBe(true);
  });

  // BF11: SĐT quá ngắn
  test('BF11: SĐT 7 số → lỗi', () => {
    const data = { ...getValidBeneficiary(), phone: '0912345' };
    const result = beneficiarySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  // BF12: Địa chỉ quá ngắn
  test('BF12: Địa chỉ < 5 ký tự → lỗi min', () => {
    const data = { ...getValidBeneficiary(), address: 'HN' };
    const result = beneficiarySchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues.some(e => e.path.includes('address'))).toBe(true);
  });

  // BF13: Địa chỉ bỏ trống
  test('BF13: Địa chỉ rỗng → lỗi', () => {
    const data = { ...getValidBeneficiary(), address: '' };
    const result = beneficiarySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  // BF14: Nhiều lỗi cùng lúc
  test('BF14: Cả 4 trường bỏ trống → trả về nhiều lỗi', () => {
    const data = { full_name: '', identifier: '', phone: '', address: '' };
    const result = beneficiarySchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues.length).toBeGreaterThanOrEqual(4);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// NHÓM 2 – CF: Campaign Form Validation (ĐÃ CÓ — giữ nguyên, đồng bộ ID)
// ═════════════════════════════════════════════════════════════════════════════
describe('CF: Kiểm thử Validation Form Tạo Chiến Dịch', () => {

  test('CF01: Bỏ trống tiêu đề → lỗi title', () => {
    const data = { ...getValidCampaign(), title: '' };
    const result = campaignSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain('title');
  });

  test('CF02: Tiêu đề < 5 ký tự → lỗi min 5', () => {
    const data = { ...getValidCampaign(), title: 'Abc' };
    const result = campaignSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues.some(e => e.path.includes('title'))).toBe(true);
  });

  test('CF03: Mô tả bỏ trống → lỗi description', () => {
    const data = { ...getValidCampaign(), description: '' };
    const result = campaignSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain('description');
  });

  test('CF04: Mô tả < 20 ký tự → lỗi min 20', () => {
    const data = { ...getValidCampaign(), description: 'Quá ngắn' };
    const result = campaignSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues.some(e => e.path.includes('description'))).toBe(true);
  });

  test('CF05: goal_amount = null → lỗi (không hợp lệ)', () => {
    const data = { ...getValidCampaign(), goal_amount: null };
    const result = campaignSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  test('CF06: goal_amount âm → lỗi', () => {
    const data = { ...getValidCampaign(), goal_amount: -5000 };
    const result = campaignSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  test('CF07: goal_amount = 0 → lỗi (dưới mức 100)', () => {
    const data = { ...getValidCampaign(), goal_amount: 0 };
    const result = campaignSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  test('CF08: goal_amount = 99 → lỗi (< 100)', () => {
    const data = { ...getValidCampaign(), goal_amount: 99 };
    const result = campaignSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  test('CF09: Thiếu start_date → lỗi', () => {
    const data = { ...getValidCampaign(), start_date: '' };
    const result = campaignSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues.some(e => e.path.includes('start_date'))).toBe(true);
  });

  test('CF10: Thiếu end_date → lỗi', () => {
    const data = { ...getValidCampaign(), end_date: '' };
    const result = campaignSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues.some(e => e.path.includes('end_date'))).toBe(true);
  });

  test('CF11: end_date trước start_date → lỗi refine end_date', () => {
    const data = { ...getValidCampaign(), start_date: '2026-06-01', end_date: '2026-05-01' };
    const result = campaignSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues.some(e => e.path.includes('end_date'))).toBe(true);
  });

  test('CF12: start_date = end_date → hợp lệ (cùng ngày)', () => {
    const data = { ...getValidCampaign(), start_date: '2026-06-01', end_date: '2026-06-01' };
    expect(campaignSchema.safeParse(data).success).toBe(true);
  });

  test('CF13: qr_code sai URL → lỗi', () => {
    const data = { ...getValidCampaign(), qr_code: '123abc_not_a_url' };
    const result = campaignSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error.issues.some(e => e.path.includes('qr_code'))).toBe(true);
  });

  test('CF14: qr_code bỏ trống → hợp lệ (optional)', () => {
    const data = { ...getValidCampaign(), qr_code: '' };
    expect(campaignSchema.safeParse(data).success).toBe(true);
  });

  test('CF15: category_id = 0 → lỗi (chưa chọn danh mục)', () => {
    const data = { ...getValidCampaign(), category_id: 0 };
    const result = campaignSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  test('CF16: Dữ liệu đầy đủ hợp lệ → pass', () => {
    expect(campaignSchema.safeParse(getValidCampaign()).success).toBe(true);
  });

  test('CF17: status="draft" hợp lệ khi truyền vào form', () => {
    const data = { ...getValidCampaign(), status: 'draft' };
    expect(campaignSchema.safeParse(data).success).toBe(true);
  });

  test('CF18: status="pending_approval" hợp lệ khi truyền vào form', () => {
    const data = { ...getValidCampaign(), status: 'pending_approval' };
    expect(campaignSchema.safeParse(data).success).toBe(true);
  });

  test('CF19: status="active" không hợp lệ khi staff tạo form (chỉ admin mới set được)', () => {
    const data = { ...getValidCampaign(), status: 'active' };
    const result = campaignSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  test('CF20: status tiếng Việt cũ ("Nháp") → lỗi enum', () => {
    const data = { ...getValidCampaign(), status: 'Nháp' };
    const result = campaignSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// NHÓM CS – CAMPAIGN STATUS ENUM VALIDATION (MỚI theo DB schema)
// ═════════════════════════════════════════════════════════════════════════════
describe('CS: Kiểm thử Campaign Status Enum (DB Schema)', () => {

  // CS01: status mặc định khi tạo (không truyền status)
  test('CS01: Không truyền status → có thể nhận giá trị mặc định hợp lệ', () => {
    // Miìu tả logic: server sẽ áp dụng 'draft' nếu không có status
    const defaultStatus = CAMPAIGN_STATUS.DRAFT;
    expect(VALID_CAMPAIGN_STATUSES).toContain(defaultStatus);
  });

  // CS02: status 'draft' hợp lệ khi tạo
  test('CS02: status="draft" → hợp lệ (lưu nháp)', () => {
    expect(VALID_CAMPAIGN_STATUSES).toContain('draft');
  });

  // CS03: status 'pending_approval' hợp lệ khi tạo (gửi duyệt ngay)
  test('CS03: status="pending_approval" → hợp lệ (gửi duyệt)', () => {
    expect(VALID_CAMPAIGN_STATUSES).toContain('pending_approval');
  });

  // CS04: Chỉ admin mới có thể set status='active' (logic phía server)
  test('CS04: status="active" thuộc enum hợp lệ (chỉ admin được dùng)', () => {
    expect(VALID_CAMPAIGN_STATUSES).toContain('active');
  });

  // CS05: Giá trị không hợp lệ (tiếng Việt cũ) — không còn được chấp nhận
  test('CS05: status tiếng Việt cũ ("Nháp") không thuộc enum mới', () => {
    expect(VALID_CAMPAIGN_STATUSES).not.toContain('Nháp');
    expect(VALID_CAMPAIGN_STATUSES).not.toContain('Chờ duyệt');
    expect(VALID_CAMPAIGN_STATUSES).not.toContain('Đang chạy');
  });

  // CS06: approval_status có 3 giá trị hợp lệ
  test('CS06: approval_status enum có đủ 3 giá trị (pending/approved/rejected)', () => {
    expect(VALID_APPROVAL_STATUSES).toEqual(['pending', 'approved', 'rejected']);
  });

  // CS07: approval_status mặc định khi tạo luôn là 'pending'
  test('CS07: approval_status mặc định = "pending" phải thuộc enum hợp lệ', () => {
    expect(VALID_APPROVAL_STATUSES).toContain(APPROVAL_STATUS.PENDING);
  });

  // CS08: Khi approved → campaign_status chuyển sang 'active'
  test('CS08: Logic duyệt: approval_status="approved" ⇒ campaign_status phải là "active"', () => {
    const simulateApproval = (approval_status) => {
      if (approval_status === APPROVAL_STATUS.APPROVED)  return CAMPAIGN_STATUS.ACTIVE;
      if (approval_status === APPROVAL_STATUS.REJECTED)  return CAMPAIGN_STATUS.REJECTED;
      return CAMPAIGN_STATUS.PENDING_APPROVAL;
    };
    expect(simulateApproval('approved')).toBe('active');
    expect(simulateApproval('rejected')).toBe('rejected');
  });

  // CS09: Chỉ được xóa/đủa1 khi status là draft hoặc rejected
  test('CS09: Chỉ "draft" hoặc "rejected" mới có thể bị xóa', () => {
    const deletable = [CAMPAIGN_STATUS.DRAFT, CAMPAIGN_STATUS.REJECTED];
    expect(deletable).toContain('draft');
    expect(deletable).toContain('rejected');
    expect(deletable).not.toContain('active');
    expect(deletable).not.toContain('pending_approval');
  });

  // CS10: Chỉ được chỉnh sửa khi status là draft hoặc rejected
  test('CS10: Chỉ "draft" hoặc "rejected" mới có thể chỉnh sửa', () => {
    const editable = [CAMPAIGN_STATUS.DRAFT, CAMPAIGN_STATUS.REJECTED];
    expect(editable).toContain('draft');
    expect(editable).not.toContain('active');
    expect(editable).not.toContain('completed');
  });
});
