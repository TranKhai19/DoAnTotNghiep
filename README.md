# Hướng dẫn chạy dự án

Dự án này được chia thành 3 phần chính bao gồm: Smart Contract (Blockchain), Backend (Server), và Frontend (Client). Ngoài ra còn có phần tài liệu (Docs). Dưới đây là hướng dẫn tổng quát cho các thành viên trong nhóm.

## Cấu trúc dự án

- \`blockchain/\`: Chứa code Smart Contract (Solidity), scripts deploy và file test. (Quản lý: Trần Duy Khải)
- \`server/\`: Chứa code Node.js/Express.js cho hệ thống Off-chain API và Webhook. (Quản lý: Nguyễn Quốc Bảo & Bùi Vĩnh Lợi)
- \`client/\`: Chứa Giao diện người dùng viết bằng React (Vite). (Quản lý: Trần Yến Nhi & Nguyễn Bá Hậu)
- \`docs/\`: Chứa các tài liệu dự án, báo cáo. (Quản lý: Trần Duy Khải & Trần Yến Nhi)

## Hướng dẫn cho từng thành phần

### 1. Blockchain (Thư mục \`blockchain\`)
- Di chuyển vào thư mục: \`cd blockchain\`
- Cài đặt các thư viện cần thiết: \`npm install\` (hoặc \`yarn install\`)
- Biên dịch hợp đồng: \`npx hardhat compile\`
- Chạy test: \`npx hardhat test\`
- Deploy: Chạy các script deploy tương ứng trong thư mục \`scripts/\`.

### 2. Server (Thư mục \`server\`)
- Di chuyển vào thư mục: \`cd server\`
- Cài đặt thư viện: \`npm install\` (hoặc \`yarn install\`)
- Cấu hình môi trường: Tạo file \`.env\` với các biến cần thiết dựa trên \`.env.example\` (nếu có). Lưu ý: Không push file \`.env\` lên Git.
- Khởi động server (Development): \`npm run dev\`

### 3. Client (Thư mục \`client\`)
- Di chuyển vào thư mục: \`cd client\`
- Cài đặt thư viện: \`npm install\` (hoặc \`yarn install\`)
- Khởi động ứng dụng (Development): \`npm run dev\`

## Quy trình làm việc với Git (Branching Strategy)

- **Nhánh `main`**: Chỉ chứa mã nguồn hoàn thiện, đã test kỹ và sẵn sàng demo. Không ai được code trực tiếp trên này.
- **Nhánh `develop`**: Nhánh tập trung để ghép code (Integration). Sau khi mỗi thành viên xong tính năng, sẽ tạo Pull Request (PR) vào đây.
- **Các nhánh `feature/` (Nhánh tính năng riêng)**: Chia theo từng thành phần mà chúng ta đã phân rã trong Backlog:
  - `feature/blockchain-core`: Dành cho Hậu làm Smart Contract.
  - `feature/backend-api`: Dành cho Bảo xây dựng Server và DB.
  - `feature/frontend-ui`: Dành cho Nhi dựng giao diện React.
  - `feature/integration-socket`: Dành cho Lợi xử lý kết nối Ethers và Socket.
- **Nhánh `fix/` hoặc `hotfix/`**: Dùng để sửa lỗi gấp phát sinh trong quá trình Testing.

## Quy tắc chung
1. Luôn kiểm tra kỹ code và chạy thử cục bộ trước khi tạo Pull Request.
2. Không đẩy các file nhạy cảm (\`.env\`, khóa bí mật) lên repository công khai.
3. Khi có sự thay đổi lớn về ABI hoặc cấu trúc database, hãy thông báo cho các thành viên khác.

## Tích hợp Ethers.js (Server)

Server sử dụng `ethers.js` để tương tác với hợp đồng thông minh FundChain. Chi tiết triển khai:

- Helpers cho hợp đồng: `server/services/contractService.js` (bao bọc các gọi tới hợp đồng)
- Sử dụng hợp đồng: `server/controllers/contractController.js` (gọi các hàm trong service)
- Routes: các endpoint on-chain nằm trong `server/routes/campaigns.js` (tiền tố `/api/campaigns/onchain`)

Các biến môi trường cần thiết (thêm vào `server/.env`, xem `server/.env.example`):

- `CHAIN_RPC_URL` — endpoint RPC của mạng (ví dụ: `http://127.0.0.1:8545` hoặc URL Infura/Alchemy)
- `PRIVATE_KEY` — private key dùng để ký giao dịch (BẢO MẬT, không chia sẻ)
- `FUNDCHAIN_CONTRACT_ADDRESS` — địa chỉ hợp đồng FundChain đã được deploy

Sau khi thiết lập các biến môi trường, khởi động server và gọi các endpoint on-chain (tạo chiến dịch, ghi nhận quyên góp, giải ngân, đóng chiến dịch). Server sẽ ký và gửi giao dịch bằng private key đã cung cấp.

## Beneficiaries API (CRUD + Cloudinary image upload)

Dự án đã bổ sung REST API quản lý người thụ hưởng (beneficiaries) kèm upload ảnh lên Cloudinary. API được triển khai trong thư mục `server` và mount tại `/api/beneficiaries`.

Tóm tắt nhanh

- Routes: `/api/beneficiaries`
- Tính năng: Create / Read / Update / Delete beneficiaries; upload file ảnh lên Cloudinary; lưu `image_url` và `image_public_id`.

Các file chính

- `server/models/Beneficiary.js` — logic CRUD (Supabase). Có fallback in-memory cho môi trường phát triển.
- `server/controllers/beneficiaryController.js` — xử lý HTTP, upload ảnh, xóa ảnh cũ khi cập nhật/xóa.
- `server/routes/beneficiaries.js` — routes Express (dùng `multer` để nhận multipart uploads). Tên field ảnh: `image`.
- `server/config/cloudinary.js` — cấu hình Cloudinary (đọc từ `.env`).
- `server/db/migrations/001_create_beneficiaries.sql` — SQL mẫu tạo bảng `beneficiaries`.

Biến môi trường (thêm vào `server/.env`)

- `SUPABASE_URL` — URL Supabase
- `SUPABASE_KEY` — Supabase anon/service key
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary credentials
 - `BANK_WEBHOOK_SECRET` — (optional) shared secret to verify webhook requests from the virtual bank. Server expects HMAC-SHA256 of the JSON body in header `x-bank-signature`.
 - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary credentials
 - `BANK_WEBHOOK_SECRET` — (tuỳ chọn) khóa bí mật dùng để xác thực webhook từ ngân hàng ảo. Server sẽ kiểm tra HMAC-SHA256 của nội dung JSON gửi trong header `x-bank-signature`.

Endpoints

- GET /api/beneficiaries — lấy danh sách
- GET /api/beneficiaries/:id — lấy 1 beneficiary
- POST /api/beneficiaries — tạo (multipart/form-data), field ảnh: `image`
- PUT /api/beneficiaries/:id — cập nhật (hỗ trợ multipart để thay ảnh)
- DELETE /api/beneficiaries/:id — xóa (cũng xóa ảnh trên Cloudinary nếu có)

Ví dụ (curl) — tạo beneficiary kèm ảnh:

```bash
curl -X POST http://localhost:3000/api/beneficiaries \
  -F "name=Nguyen Van Test" \
  -F "email=test@example.com" \
  -F "image=@/full/path/to/photo.jpg"
```

Ghi chú

- Code có fallback in-memory khi Supabase chưa cấu hình, giúp test nhanh local. Để dùng Supabase thật, chạy migration SQL trong Supabase và cập nhật `SUPABASE_URL`/`SUPABASE_KEY` trong `server/.env`.
- Ảnh upload lưu `image_url` và `image_public_id`. Khi cập nhật hoặc xóa, ảnh cũ sẽ bị xóa khỏi Cloudinary (nếu có `public_id`).

## Webhook: Bank webhook testing

Server cung cấp các route webhook tại `/api/webhooks`.

- `POST /api/webhooks/bank` — endpoint dạng production. Handler sẽ (tuỳ chọn) kiểm tra chữ ký HMAC, kiểm tra tồn tại campaign trong Supabase, cập nhật `raised_amount` cho campaign, lưu transaction và phát sự kiện socket.
- `POST /api/webhooks/bank/test` — endpoint dành cho test (demo local). Endpoint này bỏ qua bước kiểm tra tồn tại campaign nhưng vẫn lưu transaction (nếu DB có) và phát sự kiện socket. Dùng khi bạn chưa có dữ liệu campaign trong Supabase nhưng vẫn muốn thử luồng webhook.

Payload example (JSON):

```json
{
  "transactionId": "tx-123",
  "amount": 100.5,
  "campaignId": 1,
  "description": "Payment from virtual bank",
  "timestamp": "2026-04-04T10:00:00Z",
  "senderName": "Nguyen A",
  "senderAccount": "12345678"
}
```

Yêu cầu thử không có chữ ký (dùng cho `/bank/test`):

```bash
curl -X POST http://localhost:3000/api/webhooks/bank/test \
  -H "Content-Type: application/json" \
  -d '{"transactionId":"tx-test-001","amount":55.5,"campaignId":999,"description":"Demo no-check","timestamp":"2026-04-04T10:00:00Z","senderName":"Demo","senderAccount":"000111"}'
```

Yêu cầu có chữ ký (production) — HMAC-SHA256

Nếu bạn đã thiết lập `BANK_WEBHOOK_SECRET` trong `server/.env`, server sẽ kiểm tra chữ ký gửi trong header `x-bank-signature`. Chữ ký là giá trị hex của HMAC-SHA256 tính trên nội dung JSON thô bằng khóa chia sẻ.

Tạo chữ ký và gửi bằng curl (Linux/macOS hoặc Git Bash trên Windows):

```bash
BODY='{"transactionId":"tx-123","amount":100.5,"campaignId":1}'
SIGNATURE=$(printf "%s" "$BODY" | openssl dgst -sha256 -hmac "YOUR_BANK_WEBHOOK_SECRET" -binary | xxd -p -c 256)
curl -X POST http://localhost:3000/api/webhooks/bank \
  -H "Content-Type: application/json" \
  -H "x-bank-signature: $SIGNATURE" \
  -d "$BODY"
```

Hoặc tạo chữ ký trong PowerShell (Windows):

```powershell
$body = '{"transactionId":"tx-123","amount":100.5,"campaignId":1}'
$secret = 'YOUR_BANK_WEBHOOK_SECRET'
$hmac = New-Object System.Security.Cryptography.HMACSHA256([System.Text.Encoding]::UTF8.GetBytes($secret))
$hash = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($body))
$signature = ($hash | ForEach-Object { $_.ToString('x2') }) -join ''
Invoke-RestMethod -Uri 'http://localhost:3000/api/webhooks/bank' -Method POST -Body $body -ContentType 'application/json' -Headers @{ 'x-bank-signature' = $signature }
```

Notes

- Use `/bank/test` for local demos where campaigns table is absent or you want to bypass campaign validation.
- `/bank` performs campaign existence check and updates campaign; it requires a valid Supabase setup to fully exercise.


