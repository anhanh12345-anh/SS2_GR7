# FinanceFlow - Hệ thống Quản lý Chi tiêu

Ứng dụng quản lý tài chính cá nhân với giao diện hiện đại, dark theme, hỗ trợ đầy đủ tính năng thu chi.

##Công nghệ sử dụng

| Layer      | Technology           |
|------------|---------------------|
| Frontend   | React 18 + Vite 5   |
| Backend    | Node.js + Express   |
| Database   | MongoDB             |
| Auth       | JWT                 |
| Charts     | Recharts            |
| State      | Zustand             |

## Cấu trúc dự án

```
expense-manager/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/       # Auth middleware
│   │   └── server.js        # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/           # Reusable components
    │   │   └── layout/       # Sidebar, Layout
    │   ├── pages/            # Page components
    │   ├── services/         # API calls
    │   ├── store/            # Zustand state
    │   └── utils/            # Helpers
    └── package.json
```

## Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js >= 18.x
- MongoDB >= 6.x (local hoặc MongoDB Atlas)
- npm hoặc yarn

### 1. Cài đặt Backend

```bash
cd backend
npm install

# Tạo file .env từ .env.example
cp .env.example .env

# Chỉnh sửa .env với thông tin của bạn:
# MONGODB_URI=mongodb://localhost:27017/expense_manager
# JWT_SECRET=your_super_secret_key_here
# PORT=5000
```

### 2. Cài đặt Frontend

```bash
cd frontend
npm install
```

### 3. Chạy ứng dụng

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server chạy tại http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App chạy tại http://localhost:5173
```

### 4. Sử dụng với MongoDB Atlas (Cloud)

1. Tạo tài khoản tại [mongodb.com](https://www.mongodb.com)
2. Tạo cluster mới (Free tier)
3. Lấy connection string và thêm vào `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense_manager
   ```

## Tính năng

| Tính năng | Mô tả |
|-----------|-------|
|  Auth | Đăng ký, đăng nhập, đổi mật khẩu, quên mật khẩu |
|  Thu nhập | Thêm, sửa, xóa, lọc thu nhập theo danh mục |
|  Chi tiêu | Thêm, sửa, xóa, tìm kiếm chi tiêu |
|  Danh mục | Tùy chỉnh danh mục với icon và màu sắc |
|  Thống kê | Biểu đồ tròn, cột, đường xu hướng |
|  Ngân sách | Đặt ngân sách, cảnh báo vượt ngân sách |
|  Báo cáo | Xem và xuất báo cáo PDF, Excel |
|  Nhắc nhở | Nhắc nhở chi tiêu, hóa đơn định kỳ |
|  Cài đặt | Cập nhật hồ sơ, đổi mật khẩu |

## 📡 API Endpoints

```
POST   /api/auth/register          - Đăng ký
POST   /api/auth/login             - Đăng nhập
GET    /api/auth/me                - Lấy thông tin user
PUT    /api/auth/profile           - Cập nhật hồ sơ
PUT    /api/auth/change-password   - Đổi mật khẩu

GET    /api/transactions           - Danh sách giao dịch (có filter/search/pagination)
POST   /api/transactions           - Thêm giao dịch
PUT    /api/transactions/:id       - Sửa giao dịch
DELETE /api/transactions/:id       - Xóa giao dịch
GET    /api/transactions/stats     - Thống kê
GET    /api/transactions/dashboard - Dashboard data

GET    /api/categories             - Danh mục
POST   /api/categories             - Tạo danh mục
PUT    /api/categories/:id         - Sửa danh mục
DELETE /api/categories/:id         - Xóa danh mục

GET    /api/budgets                - Ngân sách (có spending info)
POST   /api/budgets                - Tạo ngân sách
PUT    /api/budgets/:id            - Sửa ngân sách
DELETE /api/budgets/:id            - Xóa ngân sách

GET    /api/reports                - Báo cáo
GET    /api/reports/export/excel   - Xuất Excel
GET    /api/reports/export/pdf     - Xuất PDF

GET    /api/reminders              - Nhắc nhở
POST   /api/reminders              - Tạo nhắc nhở
PUT    /api/reminders/:id          - Sửa nhắc nhở
DELETE /api/reminders/:id          - Xóa nhắc nhở
```

## Design System

- **Font**: Syne (Display) + DM Sans (Body)
- **Theme**: Dark mode
- **Colors**: Accent Purple (#6c63ff), Green (#00d48a), Red (#ff5b7d)
- **Responsive**: Grid layout với flexbox

## Bảo mật

- JWT Authentication với expire
- Bcrypt password hashing (12 rounds)
- Rate limiting (100 req/15min)
- CORS configured
- Input validation

## Build cho Production

```bash
# Frontend
cd frontend
npm run build
# Output: frontend/dist/

# Backend - deploy với PM2
npm install -g pm2
cd backend
pm2 start src/server.js --name finance-api
```
