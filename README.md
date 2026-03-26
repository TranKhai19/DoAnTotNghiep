# 🚧 DEV BRANCH - DỰ ÁN TỐT NGHIỆP 🚧

> **LƯU Ý QUAN TRỌNG:** Bạn đang ở nhánh `develop`. Đây là nhánh trung tâm dùng để **Integration (ghép code)** và **Testing**. 
> - **Tuyệt đối KHÔNG commit trực tiếp lên nhánh này.** 
> - Mọi thay đổi tạo từ nhánh `feature/*` phải được review thông qua Pull Request (PR) trước khi merge vào đây.

---

# Hướng dẫn chạy dự án

Dự án này được chia thành 3 phần chính bao gồm: Smart Contract (Blockchain), Backend (Server), và Frontend (Client). Ngoài ra còn có phần tài liệu (Docs). Dưới đây là hướng dẫn tổng quát cho các thành viên trong nhóm.

## Cấu trúc dự án

- `blockchain/`: Chứa code Smart Contract (Solidity), scripts deploy và file test. (Quản lý: Trần Duy Khải)
- `server/`: Chứa code Node.js/Express.js cho hệ thống Off-chain API và Webhook. (Quản lý: Nguyễn Quốc Bảo & Bùi Vĩnh Lợi)
- `client/`: Chứa Giao diện người dùng viết bằng React (Vite). (Quản lý: Trần Yến Nhi & Nguyễn Bá Hậu)
- `docs/`: Chứa các tài liệu dự án, báo cáo. (Quản lý: Trần Duy Khải & Trần Yến Nhi)

## Hướng dẫn cho từng thành phần

### 1. Blockchain (Thư mục `blockchain`)
- Di chuyển vào thư mục: `cd blockchain`
- Cài đặt các thư viện cần thiết: `npm install` (hoặc `yarn install`)
- Biên dịch hợp đồng: `npx hardhat compile`
- Chạy test: `npx hardhat test`
- Deploy: Chạy các script deploy tương ứng trong thư mục `scripts/`.

### 2. Server (Thư mục `server`)
- Di chuyển vào thư mục: `cd server`
- Cài đặt thư viện: `npm install` (hoặc `yarn install`)
- Cấu hình môi trường: Tạo file `.env` với các biến cần thiết dựa trên `.env.example` (nếu có). Lưu ý: Không push file `.env` lên Git.
- Khởi động server (Development): `npm run dev`

### 3. Client (Thư mục `client`)
- Di chuyển vào thư mục: `cd client`
- Cài đặt thư viện: `npm install` (hoặc `yarn install`)
- Khởi động ứng dụng (Development): `npm run dev`

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
2. Không đẩy các file nhạy cảm (`.env`, khóa bí mật) lên repository công khai.
3. Khi có sự thay đổi lớn về ABI hoặc cấu trúc database, hãy thông báo cho các thành viên khác.
