# AgriTrace Frontend — Agricultural Supply Chain Traceability Portal

Giao diện Web portal hiện đại cho hệ thống truy xuất nguồn gốc nông sản **AgriTrace**, được xây dựng trên nền tảng **React 19**, **TypeScript**, **Vite** và **Tailwind CSS 4**.

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

- **Core Framework:** React 19 + TypeScript
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4 + Lucide React Icons
- **State Management:** Zustand 5 (Client state) + AuthContext
- **Server State & Data Fetching:** TanStack React Query 5
- **HTTP Client:** Axios (với Refresh Token Interceptor & Token Storage abstraction)
- **Routing:** React Router v7
- **Code Generation:** `openapi-typescript` (tự động tạo TypeScript types từ Swagger OpenAPI Spec)

---

## 📱 Features & Highlights (Tính Năng Nổi Bật)

- 🔍 **Trang Tra Cứu Công Khai (`PublicTracePage`):** Tối ưu giao diện mobile-first, quét mã QR tra cứu chi tiết lô nông sản, hiển thị Dòng thời gian sự kiện (Timeline), Chứng nhận chất lượng (VietGAP/GlobalGAP) và Lịch sử phả hệ Tách/Gộp lô (`Lineage`).
- 📷 **Tích Hợp QR Code Scanner & Generator:** Modal quét mã QR trực tiếp qua camera/file ảnh và công cụ tạo mã QR Code cho từng lô hàng.
- 🔐 **Hệ Thống Phân Quyền RBAC:** Bảo vệ tuyến đường (`ProtectedRoute`), điều hướng động theo 5 nhóm người dùng (`Admin`, `Manager`, `Staff`, `Inspector`, `Consumer`).
- 📊 **Dashboard Thống Kê & Báo Cáo:** Biểu đồ phân bố lô hàng, thời gian xử lý trung bình và truy vết ngược sự cố.

---

## 🛠️ Hướng Dẫn Cài Đặt & Khởi Chạy (Quickstart)

### 1. Yêu Cầu Tiền Đề
- [Node.js](https://nodejs.org/) (Phiên bản v18.0 trở lên)
- `npm` hoặc `pnpm`

### 2. Cài Đặt Dependencies
```bash
npm install
```

### 3. Cấu Hình Biến Môi Trường (Environment Variables)
Tạo file `.env` từ mẫu `.env.example`:
```env
VITE_API_BASE_URL=http://localhost:5103/api/v1
```

### 4. Khởi Chạy Server Phát Triển (Development Server)
```bash
npm run dev
```
Trình duyệt sẽ tự động mở tại địa chỉ: **`http://localhost:5173`**

### 5. Lệnh NPM Scripts

| Lệnh Script | Mô Tả Chức Năng |
|---|---|
| `npm run dev` | Chạy dev server với HMR (Hot Module Replacement) |
| `npm run build` | Biến dịch TypeScript và đóng gói ứng dụng cho Production vào thư mục `dist/` |
| `npm run preview` | Khởi chạy server xem trước bản build Production |
| `npm run generate-types` | Tự động tạo lại file `src/types/api.ts` từ file Swagger `docs/swagger.yaml` |

---

## 📁 Cấu Trúc Thư Mục (Folder Structure)

```
AgriTrace-Frontend/
├── docs/                        # Tài liệu đặc tả API, ERD, RBAC, Frontend structure
├── guidelines/                  # Quy chuẩn phát triển UI/UX (Guidelines.md)
├── public/                      # Static assets (Favicon, Logo...)
└── src/
    ├── components/              # Shared Components (Header, Footer, Modals, QRScanner)
    ├── config/                  # App configuration & Environment variables
    ├── contexts/                # React Contexts (AuthContext...)
    ├── features/                # Feature Modules (Auth, Batches, Products, Recall, Analytics...)
    │   ├── auth/                # API calls, types, Zustand store cho Auth
    │   ├── batches/             # QL Lô hàng, QR code, Split/Merge APIs
    │   ├── supply-chain/        # Sự kiện chuỗi cung ứng, Hash chain verify
    │   └── ...                  # Các feature modules khác
    ├── hooks/                   # Custom React Hooks
    ├── lib/                     # Axios instance, Token storage, Utils
    ├── pages/                   # Top-level Page Components (HomePage, PublicTracePage, LoginPage...)
    ├── types/                   # TypeScript interfaces & auto-generated API types
    ├── App.tsx                  # App Routing & Providers
    └── main.tsx                 # Entry Point
```

---

## ⚠️ Lưu Ý Phát Triển

File `src/types/api.ts` được tự động sinh từ file `docs/swagger.yaml` thông qua công cụ `openapi-typescript`. **Không chỉnh sửa trực tiếp file `src/types/api.ts`**. Khi Backend cập nhật API, hãy chạy lại lệnh:
```bash
npm run generate-types
```