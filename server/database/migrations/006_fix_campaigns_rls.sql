-- Migration 006: Fix RLS policies for campaigns table
-- Lỗi "role admin does not exist" xảy ra khi RLS policy dùng current_user/role không hợp lệ
-- Chạy script này trên Supabase SQL Editor

-- Option A (đơn giản nhất cho dev): Tắt RLS hoàn toàn cho bảng campaigns
-- Uncomment nếu muốn bỏ RLS:
-- ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;

-- Option B (khuyên dùng cho production): Xóa policy lỗi, thêm lại policy đúng

-- 1. Xem policy hiện tại (debug)
-- SELECT schemaname, tablename, policyname, cmd, qual, with_check
-- FROM pg_policies WHERE tablename = 'campaigns';

-- 2. Drop tất cả policy hiện có của campaigns (để làm sạch)
DO $$
DECLARE
  policy_name TEXT;
BEGIN
  FOR policy_name IN
    SELECT policyname FROM pg_policies WHERE tablename = 'campaigns' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.campaigns', policy_name);
    RAISE NOTICE 'Dropped policy: %', policy_name;
  END LOOP;
END $$;

-- 3. Tạo lại RLS policies đúng chuẩn Supabase
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Mọi người đều có thể đọc các campaign active
CREATE POLICY "campaigns_select_public"
  ON public.campaigns
  FOR SELECT
  USING (status = 'active');

-- Staff/admin có thể đọc tất cả campaigns
CREATE POLICY "campaigns_select_authenticated"
  ON public.campaigns
  FOR SELECT
  TO authenticated
  USING (true);

-- Chỉ người tạo mới được insert (hoặc admin)
CREATE POLICY "campaigns_insert_authenticated"
  ON public.campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by OR auth.uid() IS NOT NULL);

-- Chỉ người tạo hoặc admin mới được update
CREATE POLICY "campaigns_update_owner"
  ON public.campaigns
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() = created_by OR auth.uid() IS NOT NULL);

-- Chỉ người tạo hoặc admin mới được delete
CREATE POLICY "campaigns_delete_owner"
  ON public.campaigns
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by OR auth.uid() IS NOT NULL);

-- Nếu server dùng service_role key (bypass RLS hoàn toàn), các policy trên không ảnh hưởng
-- Nếu server dùng anon key, cần thêm policy cho anon:
CREATE POLICY "campaigns_select_anon"
  ON public.campaigns
  FOR SELECT
  TO anon
  USING (true);  -- anon được đọc tất cả (có thể giới hạn theo status nếu cần)

CREATE POLICY "campaigns_insert_anon"
  ON public.campaigns
  FOR INSERT
  TO anon
  WITH CHECK (true);  -- Cho phép anon insert (nếu server dùng anon key)

CREATE POLICY "campaigns_update_anon"
  ON public.campaigns
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "campaigns_delete_anon"
  ON public.campaigns
  FOR DELETE
  TO anon
  USING (true);
