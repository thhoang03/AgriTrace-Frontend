# ToDoList - AgriTrace Frontend (Agricultural Supply Chain Traceability Portal)

## Tổng quan dự án
- **Tech Stack:** React 19 + TypeScript 5.x + Vite 8 + Tailwind CSS 4 + Zustand + TanStack React Query 5 + Axios
- **API Backend Target:** ASP.NET Core .NET 10 Web API (`http://localhost:5103/api/v1`)
- **Trạng thái hiện tại:** Nền tảng UI/UX, Trang chủ Công khai, Tra cứu QR Code, Phả hệ Lineage, Authentication & API Integrations cho 16 features đã hoàn thành.

---

## 📊 Bảng Tiến Độ Tổng Quan (Frontend Progress)

| Sprint | Hạng Mục Chính | Trạng Thái |
|---|---|---|
| **Sprint 1** | Nền tảng React + Vite + TS, Clean Architecture Structure, Design System, API Layer & Types | **ĐÃ HOÀN THÀNH (100%)** |
| **Sprint 2** | Trang Chủ, Public Traceability Portal (Quét QR Code), Timeline, Phả Hệ (Lineage), Auth Flow & Profile | **ĐÃ HOÀN THÀNH (100%)** |
| **Sprint 3** | Tích hợp 16 Feature APIs, Modal QR Scanner/Generator, Role Protection & UI Polish | **ĐÃ HOÀN THÀNH (90%)** |

---

## 🛠️ Sprint 1: Nền tảng & Cấu Trúc Dự Án ✅

- [x] Khởi tạo dự án Vite 8 + React 19 + TypeScript
- [x] Cấu hình Tailwind CSS 4 + Lucide React Icons
- [x] Thiết lập cấu trúc Clean Feature Architecture (`src/features`, `src/pages`, `src/components`, `src/lib`, `src/contexts`)
- [x] Tạo file `src/types/api.ts` tự động từ OpenAPI Swagger spec (`npm run generate-types`)
- [x] Cấu hình Axios `http.ts` hỗ trợ tự động đính kèm `Bearer Token` và tự động refresh token khi gặp 401
- [x] Định nghĩa `token-storage.ts` quản lý an toàn Access Token & Refresh Token

---

## ⚡ Sprint 2: Trang Công Khai & Giao Diện Người Dùng ✅

### 2.1 Trang Chủ (`HomePage.tsx`)
- [x] Giao diện Landing Page hiện đại với Banner Hero, Animation đếm số liệu thống kê (Stats Counter)
- [x] Thanh tìm kiếm lô hàng thông minh với gợi ý Autocomplete
- [x] Widget Tạo mã QR (`QRGeneratorWidget`) & Section trưng bày lô hàng mẫu (`BatchShowcaseSection`)
- [x] Modals chi tiết tính năng (`FeatureModal`), Chính sách thông tin (`InfoPolicyModal`), Đối tác (`PartnerModal`)
- [x] Chuyển đổi ngôn ngữ Tiếng Việt (`vi`) / Tiếng Anh (`en`)

### 2.2 Trang Tra Cứu Công Khai (`PublicTracePage.tsx` & `PublicLineagePage.tsx`) ⭐
- [x] Tra cứu chi tiết thông tin lô hàng nông sản qua mã lô hoặc quét QR (`/trace/:id`)
- [x] Hiển thị Dòng thời gian sự kiện (Event Timeline) với biểu tượng trực quan theo từng loại event (`HARVEST`, `PROCESSING`, `TRANSPORT`, `RETAIL`...)
- [x] Hiển thị thông tin kiểm định chất lượng (`Inspection`) và Chứng nhận VietGAP/GlobalGAP (`Certificate`)
- [x] Trang Phả Hệ Lô Hàng (`PublicLineagePage.tsx`): Trực quan hóa cây lịch sử Tách (Split) và Gộp (Merge) lô hàng
- [x] Tối ưu hóa hoàn toàn cho thiết bị di động (Mobile-First Responsive)

### 2.3 QR Code Scanner Modal (`QRScannerModal.tsx`)
- [x] Tích hợp quét mã QR trực tiếp qua Camera thiết bị
- [x] Tải lên file ảnh chứa mã QR để giải mã và chuyển hướng tới trang tra cứu

---

## 🔐 Sprint 3: Authentication & Feature API Clients ✅

### 3.1 Authentication Flow
- [x] `LoginPage.tsx` — Đăng nhập bằng Email/Password, lưu trữ JWT tokens
- [x] `ChangePasswordPage.tsx` — Đổi mật khẩu tài khoản
- [x] `AuthContext.tsx` & `auth.store.ts` — Quản lý trạng thái phiên làm việc toàn cục
- [x] Route Protection (`ProtectedRoute`): Tự động chuyển hướng người dùng chưa đăng nhập

### 3.2 Tích Hợp API Layer (16 Feature Modules)
- [x] `src/features/auth/auth.api.ts` — POST /auth/login, /logout, /refresh, GET /profile, PUT /change-password
- [x] `src/features/users/users.api.ts` — CRUD /users, GET /users/{id}, PATCH status
- [x] `src/features/organizations/organizations.api.ts` — CRUD /organizations, users/products theo org
- [x] `src/features/categories/categories.api.ts` — GET/POST/PUT /categories
- [x] `src/features/products/products.api.ts` — CRUD /products
- [x] `src/features/batches/batches.api.ts` — CRUD /batches, GET /qr-code, timeline, verify
- [x] `src/features/batches/split-merge.api.ts` — POST /batches/{id}/split, POST /batches/merge
- [x] `src/features/supply-chain/supply-chain.api.ts` — POST /batches/{id}/events, verify hash chain
- [x] `src/features/inspection/inspections.api.ts` — CRUD /inspections
- [x] `src/features/certificates/certificates.api.ts` — CRUD /certificates
- [x] `src/features/recall/recalls.api.ts` — CRUD /recalls, resolve recall
- [x] `src/features/notifications/notifications.api.ts` — GET /notifications, read-all, unread-count
- [x] `src/features/analytics/analytics.api.ts` — GET /analytics/overview, distribution, traceback
- [x] `src/lib/api/lookup.ts` — GET /lookup master data

---

## 🔮 Hạng Mục Mở Rộng Tiếp Theo (Optional Roadmap)

- [ ] Hoàn thiện các trang Dashboard quản trị nội bộ cho từng vai trò (`Admin`, `Manager`, `Staff`).
- [ ] Tích hợp bản đồ tọa độ địa lý (`Leaflet` / `Google Maps`) trên dòng thời gian vận chuyển nông sản.
- [ ] Tích hợp thông báo Real-time (SignalR / WebSockets).
- [ ] Đóng gói Docker Compose Nginx phục vụ Production Deployment.
