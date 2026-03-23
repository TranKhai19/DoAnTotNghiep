# FundChain - Hệ thống Quỹ Từ thiện Minh bạch dựa trên Công nghệ Blockchain

## 1. Tổng quan Dự án

FundChain là nền tảng ứng dụng phi tập trung (dApp) được thiết kế nhằm số hóa và đảm bảo tính minh bạch tuyệt đối trong các hoạt động quản lý quỹ từ thiện. Core module (Mô-đun cốt lõi) tích hợp nền tảng Hợp đồng thông minh (Smart Contracts) hoạt động trên mạng lưới Hyperledger Besu, thiết lập một sổ cái bất biến, bảo mật để theo dõi dòng tiền quyên góp và giải ngân.

Hệ thống cung cấp giải pháp xác thực tự động (real-time) bằng cách xử lý các dữ liệu webhook thanh toán từ ngân hàng ảo. Backend sẽ thực hiện logic đối soát chống trùng lặp dữ liệu (anti-duplication validation) và ghi trực tiếp các biến động on-chain, loại bỏ hoàn toàn quy trình báo cáo sao kê thủ công và triệt tiêu các rủi ro thất thoát.

## 2. Cấu trúc Source Code

Repository hiện tại được tổ chức theo kiến trúc microservices với các thành phần chính sau:

```text
.
├── blockchain/      # Chứa mã nguồn Smart Contracts (Solidity), Script Deploy & cấu hình Hardhat
├── server/          # Backend API & Webhook Handlers (Node.js/Express)
└── README.md        # Tài liệu đặc tả kỹ thuật dự án
```

---

## 3. Hướng dẫn Triển khai Local (Development Environment)

### 3.1. Phân hệ Blockchain (`/blockchain`)
Phân hệ đảm nhiệm logic On-chain và thực thi giao dịch trên mạng Hyperledger Besu local.

**Yêu cầu hệ thống:** Node.js v18+, npm/yarn.

**Các bước cài đặt:**
1. Di chuyển vào thư mục phân hệ:
   ```bash
   cd blockchain
   ```
2. Cài đặt các Package Dependencies:
   ```bash
   npm install
   ```
3. Biên dịch Hợp đồng thông minh (Compile Smart Contracts):
   ```bash
   npx hardhat compile
   ```
*(Lưu ý: Thông số kết nối RPC đến mạng mạng Besu nội bộ đã được cấu hình sẵn tại `hardhat.config.js`)*

### 3.2. Phân hệ Backend API (`/server`)
Service Backend đóng vai trò như cầu nối (bridging middleware) tiếp nhận webhook ngân hàng, thẩm định tính toàn vẹn của giao dịch và sử dụng Private Key hệ thống để ký/phát lệnh cập nhật On-chain thông qua Ethers.js.

**Yêu cầu hệ thống:** Node.js v18+, npm/yarn.

**Các bước cài đặt:**
1. Di chuyển vào thư mục phân hệ:
   ```bash
   cd server
   ```
2. Cài đặt các Package Dependencies:
   ```bash
   npm install
   ```
3. Cấu hình Biến Môi Trường (Environment Variables):
   Sao chép template từ file `.env.example` tạo thành `.env` tại máy local và cập nhật tham số (Ví dụ: `PORT=3000`).
4. Khởi động API Server:
   ```bash
   npm run start
   # Hoặc chế độ live-reloading: npm run dev
   ```
*(Lưu ý: Developer có thể import tệp `DoAnTotNghiep_API.postman_collection.json` trực tiếp vào Postman để kiểm thử Unit Test cho các end-points).*

---

## 4. Quản lý Mã nguồn & Luồng làm việc (Git Branching Strategy)

Toàn bộ dự án phải tuân thủ nghiêm ngặt mô hình **Feature Branch Workflow**:

* **`main`**: Nhánh Production-ready. **Tuyệt đối cấm** việc commit mã nguồn hay push trực tiếp vào nhánh này.
* **`develop`**: Nhánh hội nhập (Integration branch) chính thức. Mọi tính năng phát triển đều bắt nguồn từ nhánh này và sau quá trình Review sẽ gộp (Merge) về lại thông qua Pull Requests (PRs).
* **`feature/*`**: Các nhánh phát triển tính năng độc lập (Ví dụ: `feature/blockchain-core`, `feature/backend-api`). 
* **`hotfix/*`**: Sử dụng riêng biệt để vá các lỗi nghiệp vụ khẩn cấp trên môi trường Product/Staging.

## 5. Tiêu chuẩn Phát triển (Coding Standards & Policies)

1. **Local Validation:** Toàn bộ thành viên bắt buộc phải đảm bảo source code biên dịch (compile) thành công và các test-case vận hành ổn định trên Local trước khi mở Pull Request.
2. **Security Checks:** Đặc biệt kiểm soát tệp tin `.gitignore`. TUYỆT ĐỐI KHÔNG commit các file chứa credential nhạy cảm (`.env`, Private Keys, API Keys) lên public repository.
3. **Architecture Protocol:** Mọi sửa đổi có tác động đến cấu trúc Database (Schema) hoặc Giao thức Hợp đồng (Smart Contract ABI) cần phải báo cáo cho Tech Lead và ghi chú tường minh tại nội dung Pull Request.
4. **Code Reviews:** Bất kỳ mã nguồn mới nào muốn sát nhập vào nhánh `develop` đều yêu cầu tối thiểu một lượt phê duyệt (Approval) từ các Senior peer-reviewer trong dự án.
