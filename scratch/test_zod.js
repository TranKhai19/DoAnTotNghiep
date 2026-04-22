const { z } = require('zod');

const campaignSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(200, 'Tiêu đề quá dài'),
  description: z.string().min(20, 'Mô tả cần ít nhất 20 ký tự để chi tiết hơn'),
  goal_amount: z.number().min(100, 'Mục tiêu tối thiểu là $100'),
  qr_code: z.string().url('Link URL không hợp lệ').optional().or(z.literal('')),
  category_id: z.number().int({ message: 'Vui lòng chọn danh mục' }),
  start_date: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  end_date: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
}).refine(data => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["end_date"]
});

try {
  campaignSchema.parse({
    title: '',
    description: 'Mô tả hợp lệ với hơn 20 ký tự để chi tiết hơn.',
    goal_amount: 1000,
    qr_code: '',
    category_id: 1,
    start_date: '2026-05-01',
    end_date: '2026-06-01'
  });
} catch (err) {
  if (err instanceof z.ZodError) {
    const newErrors = {};
    err.errors.forEach(errItem => {
      newErrors[errItem.path[0]] = errItem.message;
    });
    console.log(newErrors);
  }
}
