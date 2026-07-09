# AgriTrace Frontend — ToDo List

Dựa trên tài liệu: `De_tai_02_Traceability_System.md`, `Business_Process.md`, `API_Specification.md`, `Database.md`, `Frontend_project_structure.md`.

---

## Sprint 1 — Phân tích & Thiết kế Nền tảng ⏳

- [x] Đọc hiểu tài liệu nghiệp vụ và API Specification
- [x] Xác định tech stack: React 19 + TS + Vite + TanStack Query + Zustand + Tailwind CSS
- [ ] Thiết kế UI/UX Wireframe/Mockup cho tất cả màn hình (Figma/ảnh)
- [ ] Thiết kế ERD chi tiết cho tất cả bảng (đã có trong `Database.md` và `Database_va_Nghiep_vu.md`)
- [ ] Viết SRS & Product Backlog chi tiết
- [ ] Thiết lập Clean Architecture scafolding đầy đủ theo `Frontend_project_structure.md`
  - [x] Cấu trúc thư mục `src/` đã tạo
  - [x] Vite config + Tailwind + Router đã có
  - [x] Auth, Dashboard, Batch, Users, Recall, Reports, Public Trace đã có mock UI
  - [ ] Thiếu: `features/organizations`, `features/categories`, `features/products`, `features/inspections`, `features/supply-chain/events`, `features/notifications`
- [ ] Viết API Contract chi tiết theo OpenAPI/Swagger

---

## Sprint 2 — Tính năng Cốt lõi & Tích hợp

### 1. Tích hợp API Layer (Tất cả endpoints theo `API_Specification.md`)
- [ ] `src/features/auth/auth.api.ts` — POST /auth/login, /refresh-token, /logout, GET /auth/me, PUT /auth/change-password
- [ ] `src/features/organizations/organizations.api.ts` — GET/POST/PUT /organizations, GET /organizations/{id}
- [ ] `src/features/users/users.api.ts` — GET/POST/PUT /users, GET/PATCH /users/{id}
- [ ] `src/features/categories/categories.api.ts` — GET/POST/PUT/PATCH /categories
- [ ] `src/features/products/products.api.ts` — GET/POST/PUT/PATCH /products, /products/{id}/images
- [ ] `src/features/batches/batches.api.ts` — GET/POST/PUT /batches, /batches/{id}/qr-code, /batches/{id}/images
- [ ] `src/features/supply-chain/events.api.ts` — GET/POST /batches/{id}/events, GET /events/{id}, GET /batches/{id}/events/verify
- [ ] `src/features/batches/split-merge.api.ts` — POST /batches/{id}/split, POST /batches/merge
- [ ] `src/features/inspection/inspections.api.ts` — GET/POST/PUT /batches/{id}/inspections, GET /inspections/{id}
- [ ] `src/features/certificates/certificates.api.ts` — GET/POST/DELETE certificates
- [ ] `src/features/recall/recalls.api.ts` — GET/POST/PATCH /recalls, /recalls/{id}/resolve
- [ ] `src/features/notifications/notifications.api.ts` — GET/PATCH /notifications
- [ ] `src/features/analytics/analytics.api.ts` — /analytics/overview, /batch-distribution, /processing-time, /traceback/{id}
- [ ] `src/lib/api/lookup.ts` — /roles, /organization-types, /event-types, /units, /inspection-results, /certificate-types, /recall-severities

### 2. BP01 — User Authentication
- [ ] Hook up login với POST /auth/login, lưu access/refresh token vào token-storage
- [ ] Implement refresh token interceptor trong `http.ts`
- [ ] Implement logout + clear token
- [ ] Lưu user profile vào Zustand store
- [ ] Route protection theo role (ADMIN/MANAGER/FARMER/PROCESSOR/DISTRIBUTOR/INSPECTOR)

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
- [ ] Hiển thị QR Code từ API (/batches/{id}/qr-code)
- [ ] Upload ảnh Batch
- [ ] Chi tiết Batch (GET /batches/{id})

### 6. BP05 — Supply Chain Event Management
- [ ] Timeline view cho Batch Detail page (theo mẫu `mockData.timelineEvents`)
- [ ] Form ghi nhận Event (POST /batches/{id}/events) — FARMER/MANAGER/PROCESSOR
- [ ] Verify Hash Chain (GET /batches/{id}/events/verify)
- [ ] Dropdown Event Types từ lookup /event-types
- [ ] Status badge theo event type (HARVEST, RECEIVE, PROCESSING, PACKAGING, TRANSPORT, DISTRIBUTION, RETAIL)

---

## Sprint 3 — Tính năng Nâng cao & Triển khai

### 7. BP06 + BP07 — Batch Split & Merge
- [ ] UI tách Batch (POST /batches/{id}/split) — PROCESSOR, MANAGER
- [ ] UI gộp Batch (POST /batches/merge) — PROCESSOR, MANAGER
- [ ] Hiển thị lineage/phả hệ Batch (batch parent/children)

### 8. BP08 — Quality Inspection
- [ ] Danh sách kiểm định (GET /batches/{id}/inspections) — INSPECTOR
- [ ] Form tạo/cập nhật kiểm định (POST/PUT /inspections)
- [ ] Upload certificate (POST /batches/{id}/certificates)
- [ ] Xem danh sách chứng nhận

### 9. BP09 — Product Recall
- [ ] Danh sách Recall (GET /recalls) — ADMIN, INSPECTOR
- [ ] Tạo Recall (POST /recalls)
- [ ] Kết thúc Recall (PATCH /recalls/{id}/resolve)
- [ ] Notification propagation (GET/PATCH /notifications)

### 10. BP10 — Public Traceability
- [ ] Mobile-optimized public page (GET /public/trace/{batchId})
- [ ] Hiển thị Timeline công khai
- [ ] Hiển thị Certificate + Recall status
- [ ] Phả hệ Batch (GET /public/trace/{batchId}/lineage)

### 11. Analytics Dashboard
- [ ] Dashboard overview (GET /analytics/overview)
- [ ] Batch distribution (GET /analytics/batch-distribution)
- [ ] Processing time (GET /analytics/processing-time)
- [ ] Traceback analysis (GET /analytics/traceback/{batchId})

---

## Technical Debt & Tối ưu

- [ ] i18n đa ngữ: chuyển toàn bộ text cứng sang vi/en qua i18next
- [ ] Xóa mock data, thay bằng React Query hooks thật
- [ ] Viết Vitest unit tests cho: api layer, auth store, form validation
- [ ] Integration tests cho các luồng chính (login → create batch → add event → trace)
- [ ] Setup Dockerfile + docker-compose + nginx.conf
- [ ] Tối ưu responsive mobile
- [ ] QR Code generator/scanner tích hợp trực tiếp
- [ ] Export PDF/Excel cho Reports
- [ ] Geospatial tracking (Leaflet/Google Maps) cho events