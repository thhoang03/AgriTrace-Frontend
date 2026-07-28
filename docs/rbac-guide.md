# RBAC Guide — Tài Liệu Phân Quyền Hệ Thống AgriTrace

> **Hệ Thống Truy Xuất Nguồn Gốc Nông Sản**
> **Phiên bản:** 3.0 (2026-07-27) — Đã gộp từ `rabc.md` + `RBAC_Guide.md`
> **Trạng thái:** Cập nhật — RECALL giới hạn chỉ SYSTEM admin

---

## 0. Lịch Sử Thay Đổi (Changelog)

| Version | Date | Change |
|---------|------|--------|
| 3.0 | 2026-07-27 | Gộp `rabc.md` (backend spec) + `RBAC_Guide.md` (frontend guide). RECALL giới hạn SYSTEM admin loại. Bổ sung staff invite flow. |
| 2.0 | 2026-07-27 | RECALL restricted to SYSTEM (`Admin`). Removed `INSPECTION` RECALL permission. |
| 1.0 | 2026-07-22 | Initial draft. INSPECTION had RECALL permission. |

---

## 1. Cấu Trúc Vai Trò & Tổ Chức (Roles & Organizations)

### 1.1. Vai Trò Hệ Thống (System-Level Role)
* **`Admin`**: Administrator tối cao thuộc tổ chức mặc định `SYSTEM`.
  * Có toàn quyền quản trị hệ thống, quản lý danh mục tổ chức và xử lý các trường hợp khẩn cấp.
  * **Ràng buộc:** Cấm mọi hình thức đăng ký mới tổ chức loại `SYSTEM` từ các API công khai.

### 1.2. Cấu Trúc Tổ Chức (Organization-Level)
Hệ thống hỗ trợ 5 loại tổ chức nghiệp vụ:
* **`FARM`** (Trang trại / Cơ sở trồng trọt)
* **`PROCESSOR`** (Nhà chế biến / Đóng gói)
* **`DISTRIBUTOR`** (Nhà phân phối / Vận chuyển)
* **`RETAILER`** (Nhà bán lẻ / Siêu thị)
* **`INSPECTION`** (Đơn vị kiểm định / Kiểm nghiệm)

### 1.3. Vai Trò Nội Bộ Tổ Chức (Organization-Level Roles)
Mỗi tổ chức nghiệp vụ gồm 2 vai trò:
* **`Manager`** (Quản lý):
  * Tài khoản đăng ký khởi tạo tổ chức sẽ tự động nhận vai trò này.
  * Quyền hạn: Thực hiện các sự kiện nông sản cho phép + Quản lý nhân sự (Mời/Thêm `Staff` qua Email).
* **`Staff`** (Nhân viên):
  * Do `Manager` thêm vào thông qua Email.
  * Quyền hạn: Chỉ thực hiện các sự kiện nông sản được phép của tổ chức đó, **không** có quyền quản lý nhân sự.

---

## 2. Các Vai Trò Hệ Thống (UserRole)

| Vai trò | Mô tả | Quyền hạn chính |
|---------|-------|-----------------|
| `ADMIN` | Quản trị viên | Toàn quyền: quản lý người dùng, tổ chức, danh mục, batch, sự kiện, recall, báo cáo |
| `MANAGER` | Quản lý | Quản lý người dùng (tổ chức mình), tổ chức, danh mục, batch, sản phẩm, báo cáo, inspection, supply chain |
| `STAFF` | Nhân viên / Thành viên tổ chức | Xem dashboard, quản lý batch, tạo sự kiện trong phạm vi tổ chức của mình |

> **Lưu ý:** Backend hiện tại vẫn còn 6 vai trò cũ (`Administrator`, `Farmer`, `Processor`, `Distributor`, `Retailer`, `Inspector`). Frontend có **runtime adapter** tự động map các vai trò cũ sang 3 vai trò mới. Xem mục 8 để biết chi tiết.

---

## 3. Các Loại Tổ Chức (OrganizationType)

| Loại | Mã | Mô tả |
|------|----|-------|
| Nông trại | `FARM` | Trang trại, thu hoạch |
| Chế biến | `PROCESSOR` | Chế biến, đóng gói, tách/gộp lô |
| Phân phối | `DISTRIBUTOR` | Vận chuyển, phân phối, tách/gộp lô |
| Bán lẻ | `RETAILER` | Bán lẻ, tách lô |
| Kiểm định | `INSPECTION` | Kiểm tra chất lượng |
| Hệ thống | `SYSTEM` | Quản trị viên hệ thống, full quyền sự kiện |

---

## 4. Các Loại Sự Kiện (EventType)

| Loại | Mã | Mô tả |
|------|----|-------|
| Thu hoạch | `HARVEST` | Ghi nhận thu hoạch |
| Nhận hàng | `RECEIVE` | Nhận hàng vào kho |
| Chế biến | `PROCESSING` | Xử lý chế biến |
| Đóng gói | `PACKAGING` | Đóng gói sản phẩm |
| Vận chuyển | `TRANSPORT` | Vận chuyển giữa các địa điểm |
| Phân phối | `DISTRIBUTION` | Phân phối đến kênh |
| Bán lẻ | `RETAIL` | Bán lẻ cuối cùng |
| Kiểm định | `INSPECTION` | Kiểm tra chất lượng |
| Thu hồi | `RECALL` | Thu hồi sản phẩm |
| Tách lô | `SPLIT` | Tách một lô thành nhiều lô nhỏ |
| Gộp lô | `MERGE` | Gộp nhiều lô thành một lô |

---

## 5. Layer 1: Quyền Truy Cập Route

### 5.1. Bảng quyền truy cập

| Route | ADMIN | MANAGER | STAFF |
|-------|-------|---------|-------|
| `/app/dashboard` | ✅ | ✅ | ✅ |
| `/app/batches` | ✅ | ✅ | ✅ |
| `/app/batches/new` | ✅ | ✅ | ✅ |
| `/app/supply-chain` | ✅ | ✅ | ✅ |
| `/app/inspection` | ✅ | ✅ | ✅ |
| `/app/recall` | ✅ | ✅* | ❌ |
| `/app/reports` | ✅ | ✅ | ❌ |
| `/app/organizations` | ✅ | ✅ | ❌ |
| `/app/categories` | ✅ | ✅ | ❌ |
| `/app/users` | ✅ | ✅ | ❌ |
| `/app/products` | ✅ | ✅ | ❌ |
| `/app/profile` | ✅ | ✅ | ✅ |

> *`/app/recall` được hiển thị cho MANAGER trên sidebar, nhưng thao tác tạo recall thực tế chỉ dành cho ADMIN (SYSTEM).

### 5.2. Cơ chế guard

- **AppLayout**: Sau khi kiểm tra đăng nhập, kiểm tra `canAccessRoute(user.role, pathname)`. Nếu không có quyền, chuyển hướng về `/app/profile`.
- **ProtectedRoute**: Component hỗ trợ `allowedRoles` prop, dùng khi cần bảo vệ nhóm route con.

```tsx
import { ProtectedRoute } from "../../features/auth/ProtectedRoute";

<ProtectedRoute allowedRoles={["ADMIN"]}>
  <Outlet />
</ProtectedRoute>
```

```tsx
// Trong Sidebar — tự động lọc theo role
import { canAccessRoute } from "../../features/auth/permissions";
const filteredNavItems = navItems.filter((item) => canAccessRoute(role, item.to));
```

---

## 6. LAYER 2: Quyền Tạo Sự Kiện (OrgType × EventType)

### 6.1. Bảng quyền tạo sự kiện (Frontend + Backend)

| EventType | FARM | PROCESSOR | DISTRIBUTOR | RETAILER | INSPECTION | SYSTEM |
|-----------|------|-----------|-------------|----------|------------|--------|
| HARVEST | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| RECEIVE | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| PROCESSING | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| PACKAGING | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| TRANSPORT | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| DISTRIBUTION | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| RETAIL | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| INSPECTION | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| RECALL | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| SPLIT | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| MERGE | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |

> **Quy tắc Backend (Bắt buộc):** Với mọi request tạo sự kiện (`POST /batches/{batchId}/events`), backend **phải** kiểm tra `user.organizationType` + `eventType` trong request có nằm trong ma trận trên không. Nếu không → trả `403 Forbidden`.

### 6.2. Sử dụng trong code

```tsx
import { canCreateEvent, getAllowedEventTypes } from "../../features/auth/permissions";

const orgType = user?.organizationType;
const allowedEventTypes = getAllowedEventTypes(orgType);

// Kiểm tra trước khi submit form
const canSubmit = canCreateEvent(orgType, selectedEventType);
if (!canSubmit) {
  setError("Tổ chức của bạn không có quyền tạo sự kiện này");
  return;
}
```

### 6.3. UI Filtering

Trong form tạo sự kiện (SupplyChainPage), dropdown Event Type chỉ hiển thị các loại sự kiện mà tổ chức của user được phép tạo:

```tsx
const eventTypes = ALL_EVENT_TYPES.filter((et) =>
  allowedEventTypes.includes(et.value)
);
```

---

## 7. Runtime Adapter (Backward Compatibility)

### 7.1. `adaptApiRoleToCanonical(apiRole)`

Map vai trò API cũ sang vai trò canonical mới:

| API Role cũ | Canonical Role |
|-------------|----------------|
| `ADMIN`, `Administrator` | `ADMIN` |
| `MANAGER`, `Manager` | `MANAGER` |
| `STAFF`, `Staff`, `FARMER`, `Farmer`, `PROCESSOR`, `Processor`, `DISTRIBUTOR`, `Distributor`, `RETAILER`, `Retailer`, `INSPECTOR`, `Inspector`, `CONSUMER`, `Consumer` | `STAFF` |

### 7.2. `inferOrganizationTypeFromApiRole(apiRole, jwtClaim, profileOrgType)`

Suy luận `OrganizationType` từ nhiều nguồn, theo thứ tự ưu tiên:

1. **API Role cũ**: `FARMER` → `FARM`, `Processor` → `PROCESSOR`, `Distributor` → `DISTRIBUTOR`, `Retailer` → `RETAILER`, `INSPECTOR` → `INSPECTION`
2. **JWT Claim**: Đọc từ token localStorage nếu có trường `organizationType`
3. **User Profile**: Đọc từ response API `/auth/profile`

Nếu tất cả đều không có, trả về `undefined` → user chỉ có thể xem, không tạo được sự kiện nào.

---

## 8. Cấu Trúc Code Liên Quan

```
src/
├── features/
│   ├── auth/
│   │   ├── auth.types.ts          # UserRole, OrganizationType, EventType
│   │   ├── auth.store.tsx         # AuthProvider + normalizeUser
│   │   ├── auth.api.ts            # Login, logout, refresh token
│   │   ├── ProtectedRoute.tsx     # Route guard component
│   │   └── permissions.ts         # ROLE_ACCESS, ORG_EVENT_PERMISSIONS, canAccessRoute, canCreateEvent
│   ├── users/
│   │   ├── users.types.ts         # UserRole, UserItem
│   │   ├── UsersListPage.tsx      # Role dropdown (Admin/Manager/Staff)
│   │   ├── ProfilePage.tsx        # Hiển thị Staff + OrgType
│   │   ├── users.utils.ts         # filterUsers, getRoleOptions
│   │   └── users.utils.test.ts    # Test cập nhật
│   ├── organizations/
│   │   ├── organizations.types.ts # OrganizationType = FARM|PROCESSOR|DISTRIBUTOR|RETAILER|INSPECTION|SYSTEM
│   │   └── organizations.api.ts   # mapTypeToNew adapter + inviteStaff
│   ├── supply-chain/
│   │   └── SupplyChainPage.tsx    # Layer 2 event guards + SPLIT/MERGE fields
│   ├── recall/
│   │   └── RecallPage.tsx         # Recall UI — chỉ SYSTEM admin thấy Create Recall
│   └── inspection/
│       └── InspectionPage.tsx     # Inspection event creation
├── types/
│   ├── api.ts                     # Auto-generated from Swagger
│   └── mapping.ts                 # adaptApiRoleToCanonical, inferOrganizationTypeFromApiRole
└── lib/
    └── api/
        ├── http.ts                # HTTP helpers
        ├── lookup.ts              # getRoles, getOrganizationTypes, getEventTypes
        └── mock-handlers.ts       # Mock handlers (chỉ dùng khi VITE_ENABLE_MOCKS=true)
```

---

## 9. Quy Tắc Bảo Mật (Security & Business Rules)

### 9.1. Quản Lý Nhân Sự (Staff Management)

**Endpoint:** `POST /organizations/{orgId}/invite` (hoặc tương đương)

**Request Body** (`CreateUserRequest`):
```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "role": "STAFF"
}
```
> **⚠️ `organizationId` không được phép truyền trong Request Body.** Backend tự động gán `organizationId` từ `MANAGER` đang thực hiện request (từ JWT token).

1. Chỉ người dùng có `Role == MANAGER` mới được phép gọi API thêm nhân viên (`Staff`).
2. Khi thêm `Staff`, `orgId` của tài khoản mới **bắt buộc phải lấy tự động** từ `orgId` của `Manager` đang thực hiện request. Cấm truyền `orgId` từ Request Body/Query để ngăn chặn lỗ hổng IDOR (Insecure Direct Object Reference).
3. `role` của tài khoản mới luôn là `STAFF`.
4. Backend **phải** trả về `403 Forbidden` nếu MANAGER cố gắng thêm Staff vào tổ chức khác với tổ chức của mình.

### 9.2. Logic Kiểm Soát Sự Kiện RECALL (Thu hồi sản phẩm)

> **Cập nhật:** Từ phiên bản này, sự kiện `RECALL` chỉ được phép bởi tổ chức `SYSTEM` (`Admin`). Tổ chức `INSPECTION` **không còn** quyền tạo RECALL.

Sự kiện `RECALL` chỉ được giới hạn cấp quyền cho **`SYSTEM`** với các điều kiện kiểm soát dữ liệu (*Data Scope*) như sau:

* **`SYSTEM` (`Admin`):** Có quyền phát lệnh `RECALL` trên bất kỳ lô hàng (Batch/Lot) nào trên toàn hệ thống.
* **Tất cả các tổ chức nghiệp vụ khác** (`FARM`, `PROCESSOR`, `DISTRIBUTOR`, `RETAILER`, `INSPECTION`): **Không** có quyền tạo sự kiện `RECALL`.

### 9.3. Cấm Tạo Tổ Chức SYSTEM

Cấm mọi hình thức đăng ký mới tổ chức loại `SYSTEM` từ các API công khai. Backend **phải** trả về `403 Forbidden` nếu request `POST /organizations` có `type = "SYSTEM"`.

---

## 10. Quy Tắc Phát Triển (Dev Conventions)

### 10.1. Thêm Route Mới

1. Thêm route vào `ROLE_ACCESS` trong `permissions.ts`
2. Sidebar tự động lọc theo quyền — không cần sửa `roles` array riêng
3. Nếu cần guard tổ hợp, dùng `<ProtectedRoute allowedRoles={["ADMIN"]}>`

### 10.2. Thêm EventType Mới

1. Thêm vào `EventType` union trong `auth.types.ts`
2. Thêm vào `ALL_EVENT_TYPES` trong `SupplyChainPage.tsx`
3. Gán quyền cho các `OrganizationType` trong `ORG_EVENT_PERMISSIONS`
4. Cập nhật backend event type enum và permission matrix

### 10.3. Kiểm Tra Quyền Trong Component

```tsx
// Route access
const { user, canAccessRoute } = useAuth();
if (!canAccessRoute(user?.role, "/app/some-path")) {
  return <Navigate to="/app/profile" replace />;
}

// Event creation access
const { user } = useAuth();
import { canCreateEvent } from "../auth/permissions";
if (!canCreateEvent(user?.organizationType, eventType)) {
  // Disable button, show warning
}
```

---

## 11. Testing & Troubleshooting

### 11.1. Smoke Test Matrix (Mock)

| Kịch bản | Kết quả mong đợi |
|-----------|-----------------|
| Login Admin | Tất cả menus hiển thị, truy cập được tất cả routes |
| Login Manager | Được phép truy cập organizations, categories, inspection, recall (nhưng không tạo được recall) như Admin |
| Login Staff + FARM | Chỉ thấy Harvest trong event types |
| Login Staff + PROCESSOR | Thấy Receive, Processing, Packaging, Split, Merge |
| Login Staff + DISTRIBUTOR | Thấy Receive, Transport, Distribution, Split, Merge |
| Login Staff + RETAILER | Thấy Receive, Retail, Split |
| Login Staff + INSPECTION | Chỉ thấy Inspection |
| Legacy API role FARMER | Tự động map → STAFF + FARM |
| Legacy API role INSPECTOR | Tự động map → STAFF + INSPECTION |

### 11.2. Run Tests & Build

```bash
# Chạy test
npm test

# Build production (kiểm tra TypeScript)
npm run build
```

> **Lưu ý:** Trước khi build, đảm bảo `VITE_ENABLE_MOCKS` được đặt đúng giá trị theo ý muốn. Build vẫn hoạt động bất kể cài đặt mock.

### 11.3. Các Lỗi Thường Gặp

| Lỗi | Nguyên nhân | Cách fix |
|-----|-------------|----------|
| `canAccessRoute` trả `false` dù đã đăng nhập | Role trong session chưa được normalize | Xóa sessionStorage, đăng nhập lại |
| Event type dropdown trống | `organizationType` chưa được set | Kiểm tra login response có `organizationType` không |
| Route redirect về profile liên tục | Thiếu route trong `ROLE_ACCESS` | Thêm route vào `permissions.ts` |
| Build fail: `OrganizationType` missing | Import thiếu từ `permissions.ts` | Import type đúng module |

---

## 12. Triển Khai Backend RBAC

Frontend đã cập nhật để tương thích với backend RBAC:

- **Manager** có quyền mutation tương đương Admin tại hầu hết endpoints: Organizations, Categories, Inspections, Recalls, Users, Products.
- **Staff** chỉ có quyền read-only và tạo sự kiện trong phạm vi OrganizationType của họ.
- Mọi thay đổi backend RBAC nên được phản ánh vào `src/features/auth/permissions.ts` (`ROLE_ACCESS`) và cập nhật lại bảng trong section 5.1 của tài liệu này.

### Backend RBAC Checklist

- [ ] Event creation (`POST /batches/{batchId}/events`) kiểm tra `ORG_EVENT_PERMISSIONS[orgType]`
- [ ] Recall creation (`POST /recalls`) chỉ cho phép `ADMIN` + `SYSTEM`
- [ ] Staff invite (`POST /organizations/{orgId}/invite`) chỉ cho phép `MANAGER`, auto-assign `orgId`
- [ ] Organization creation từ chối `type = "SYSTEM"`
- [ ] All RBAC errors return `403 Forbidden` with structured error body

---

## 13. Tài Liệu Liên Quan

- **Backend RBAC Spec:** `docs/rbac-backend-spec.md` — Tài liệu đặc tả chi tiết cho backend team
- **Frontend code:** `src/features/auth/permissions.ts` — Nơi tập trung tất cả permission constants và helpers
- **API types:** Generated from `docs/swagger.yaml` via `npm run generate-types`
- **Project config:** `AGENTS.md` — Stack, conventions, and commands
