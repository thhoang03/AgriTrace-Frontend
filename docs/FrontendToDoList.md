# AgriTrace Frontend — ToDo List

Dựa trên tài liệu: `De_tai_02_Traceability_System.md`, `Business_Process.md`, `API_Specification.md`, `Database.md`, `Frontend_project_structure.md`.

---

## Sprint 1 — Phân tích & Thiết kế Nền tảng ✅

- [x] Đọc hiểu tài liệu nghiệp vụ và API Specification
- [x] Xác định tech stack: React 19 + TS + Vite + TanStack Query + Zustand + Tailwind CSS
- [x] Thiết kế UI/UX Wireframe/Mockup cho tất cả màn hình (Figma/ảnh)
- [x] Thiết kế ERD chi tiết cho tất cả bảng (đã có trong `Database.md` và `Database_va_Nghiep_vu.md`)
- [x] Viết SRS & Product Backlog chi tiết
- [x] Thiết lập Clean Architecture scaffolding đầy đủ theo `Frontend_project_structure.md`
  - [x] Cấu trúc thư mục `src/` đã tạo
  - [x] Vite config + Tailwind + Router đã có
  - [x] Auth, Dashboard, Batch, Users, Recall, Reports, Public Trace đã có mock UI
  - [x] Inspection, Supply Chain, Analytics đã có API + UI
  - [x] Organizations, Categories, Products, Certificates, Notifications đã có API + Types
  - [ ] Thiếu: Pages/UI cho Organizations, Categories, Products, Certificates, Notifications
- [ ] Viết API Contract chi tiết theo OpenAPI/Swagger

---

## Sprint 2 — Tính năng Cốt lõi & Tích hợp

### 1. Tích hợp API Layer (Tất cả endpoints theo `API_Specification.md`)
- [x] `src/features/auth/auth.api.ts` — POST /auth/login, /logout, GET /auth/profile, POST /auth/refresh, PUT /auth/change-password
- [x] `src/api/authApi.ts` — **ĐÃ XÓA** file trùng lặp cũ trong `src/api/`
- [x] `src/features/users/users.api.ts` — GET/POST/PUT /users, GET /users/{id}, DELETE /users/{id}, POST /users/{id}/reset-password
- [x] `src/features/organizations/organizations.api.ts` — GET/POST/PUT/PATCH /organizations, GET /organizations/{id}, GET /organizations/{id}/users, GET /organizations/{id}/products
- [x] `src/features/categories/categories.api.ts` — GET/POST/PUT/PATCH /categories
- [x] `src/features/products/products.api.ts` — GET/POST/PUT/PATCH /products, /products/{id}/images (upload/delete)
- [x] `src/features/batches/batches.api.ts` — GET/POST/PUT /batches, GET /batches/{id}, DELETE /batches/{id}, GET /batches/{id}/timeline, GET /batches/{id}/qr-code, GET /batches/{id}/images (upload/delete)
- [x] `src/features/batches/split-merge.api.ts` — POST /batches/{id}/split, POST /batches/merge
- [x] `src/features/supply-chain/supply-chain.api.ts` — GET /supply-chain/{batchId}, GET /supply-chain/node/{nodeId}, GET /supply-chain/trace, GET/POST /batches/{id}/events, GET /events/{id}, GET /batches/{id}/events/verify
- [x] `src/features/inspection/inspections.api.ts` — GET /inspections, GET /batches/{id}/inspections, GET /inspections/{id}, POST /batches/{id}/inspections, PUT /inspections/{id}
- [x] `src/features/certificates/certificates.api.ts` — GET /batches/{id}/certificates, GET /certificates/{id}, POST /batches/{id}/certificates, DELETE /certificates/{id}
- [x] `src/features/recall/recalls.api.ts` — GET /recalls, GET /recalls/{id}, POST /recalls, PATCH /recalls/{id}/resolve, POST /recalls/{id}/notify
- [x] `src/features/notifications/notifications.api.ts` — GET/PATCH /notifications, GET /notifications/unread-count
- [x] `src/features/analytics/analytics.api.ts` — GET /analytics/overview, /batch-distribution, /processing-time, /traceback/{batchId}
- [x] `src/lib/api/lookup.ts` — /roles, /organization-types, /event-types, /units, /inspection-results, /certificate-types, /recall-severities

### 2. BP01 — User Authentication
- [x] Hook up login với POST /auth/login, lưu access/refresh token vào token-storage
- [x] Implement refresh token interceptor trong `http.ts`
- [x] Implement logout + clear token
- [x] Lưu user profile vào AuthContext (`src/contexts/AuthContext.tsx`)
- [x] Route protection theo role (ADMIN/MANAGER/FARMER/PROCESSOR/DISTRIBUTOR/INSPECTOR)
- [x] Change Password page với validation (react-hook-form)

### 3. BP02 — Organization Management
- [ ] Trang danh sách tổ chức (GET /organizations) — chỉ ADMIN
- [ ] Modal tạo/chỉnh sửa tổ chức (POST/PUT /organizations)
- [ ] Xem chi tiết tổ chức (GET /organizations/{id})
- [ ] Thay đổi trạng thái (PATCH /organizations/{id}/status)
- [ ] Xem users thuộc tổ chức (GET /organizations/{id}/users)
- [ ] Xem products thuộc tổ chức (GET /organizations/{id}/products)

### 4. BP03 — Product Management
- [ ] Quản lý Categories (CRUD + lookup từ /categories)
- [ ] Quản lý Units (lookup từ /units)
- [ ] Quản lý Products (CRUD, filter theo organization/category/search)
- [ ] Upload/delete ảnh sản phẩm

### 5. BP04 — Batch Creation
- [ ] Form tạo Batch mới (POST /batches) — FARMER, MANAGER
- [ ] Hiển thị BatchCode sinh tự động
- [ ] Hiển thị QR Code từ API (/batches/{id}/qr-code) — API đã có, chưa có UI
- [ ] Upload ảnh Batch — API đã có, chưa có UI
- [ ] Chi tiết Batch (GET /batches/{id}) — đã có page nhưng chưa dùng API thật

### 6. BP05 — Supply Chain Event Management
- [ ] Timeline view cho Batch Detail page (theo mẫu `mockData.timelineEvents`)
- [ ] Form ghi nhận Event (POST /batches/{id}/events) — FARMER/MANAGER/PROCESSOR — API đã có, chưa có UI
- [ ] Verify Hash Chain (GET /batches/{id}/events/verify) — API đã có, chưa có UI
- [ ] Dropdown Event Types từ lookup /event-types — lookup API đã có
- [ ] Status badge theo event type (HARVEST, RECEIVE, PROCESSING, PACKAGING, TRANSPORT, DISTRIBUTION, RETAIL) — types đã có

---

## Sprint 3 — Tính năng Nâng cao & Triển khai

### 7. BP06 + BP07 — Batch Split & Merge
- [ ] UI tách Batch (POST /batches/{id}/split) — PROCESSOR, MANAGER — API đã có, chưa có UI
- [ ] UI gộp Batch (POST /batches/merge) — PROCESSOR, MANAGER — API đã có, chưa có UI
- [ ] Hiển thị lineage/phả hệ Batch (batch parent/children)

### 8. BP08 — Quality Inspection
- [x] Danh sách kiểm định (GET /inspections) — INSPECTOR
- [x] Form xem chi tiết kiểm định (GET /inspections/{id})
- [ ] Form tạo/cập nhật kiểm định (POST/PUT /inspections) — API đã có, chưa có UI
- [ ] Upload certificate (POST /batches/{id}/certificates) — API đã có, chưa có UI
- [ ] Xem danh sách chứng nhận — API đã có, chưa có UI

### 9. BP09 — Product Recall
- [x] Danh sách Recall (GET /recalls) — ADMIN, INSPECTOR
- [x] Form tạo Recall (POST /recalls)
- [x] Kết thúc Recall (PATCH /recalls/{id}/resolve)
- [x] Notification propagation (GET/PATCH /notifications) — API đã có
- [ ] Hook up API thay vì mock data trong RecallPage

### 10. BP10 — Public Traceability
- [x] Mobile-optimized public page (GET /public/trace/{batchId})
- [x] Hiển thị Timeline công khai
- [x] Hiển thị Certificate + Recall status
- [ ] Phả hệ Batch (GET /public/trace/{batchId}/lineage)
- [ ] Hook up API thay vì mock data trong PublicTracePage

### 11. Analytics Dashboard
- [x] Dashboard overview (GET /analytics/overview)
- [x] Batch distribution (GET /analytics/batch-distribution)
- [x] Processing time (GET /analytics/processing-time)
- [x] Traceback analysis (GET /analytics/traceback/{batchId})
- [ ] Hook up API thay vì mock data trong DashboardPage và ReportsPage

---

## Technical Debt & Tối ưu

- [ ] i18n đa ngữ: chuyển toàn bộ text cứng sang vi/en qua i18next (đã setup i18n nhưng chưa tích hợp vào pages)
- [ ] Xóa mock data, thay bằng React Query hooks thật (hầu hết pages vẫn dùng mock data)
- [ ] Viết Vitest unit tests cho: api layer, auth context, form validation (chỉ có 1 test dummy)
- [ ] Integration tests cho các luồng chính (login → create batch → add event → trace)
- [ ] Setup Dockerfile + docker-compose + nginx.conf
- [ ] Tối ưu responsive mobile
- [ ] QR Code generator/scanner tích hợp trực tiếp
- [ ] Export PDF/Excel cho Reports
- [ ] Geospatial tracking (Leaflet/Google Maps) cho events

---

## Trạng thái hiện tại (2026-07-14)

**Đã hoàn thành:**
- API Layer đầy đủ: auth, users, organizations, categories, products, batches (+ qr-code/images), split/merge, supply-chain (+ events/verify), inspection (+ batch-specific), certificates, recall, notifications, analytics, lookup
- Pages: Login, Dashboard, Batch Management, Batch Detail, Users, Profile, Inspection, Recall, Reports, Supply Chain Event, Public Trace, Change Password
- Core infra: axios client với refresh token interceptor, TanStack Query, React Router, AuthContext (`src/contexts/AuthContext.tsx`)
- Xóa file `src/api/authApi.ts` trùng lặp

**Chưa làm:**
- Pages/UI cho: Organizations, Categories, Products, Certificates, Notifications, Batch Split/Merge, Event creation/verify
- Hầu hết pages vẫn dùng mock data thay vì API thật
- Tests thực tế, Docker, i18n integration, QR Code generator/scanner, Export PDF/Excel, Geospatial tracking
