# Hướng dẫn RBAC — AgriTrace Frontend

## 1. Tổng quan

Frontend áp dụng mô hình RBAC (Role-Based Access Control) gồm 2 lớp:

- **Layer 1 — Route Access**: Kiểm tra quyền truy cập route dựa trên vai trò hệ thống.
- **Layer 2 — Event Permissions**: Kiểm tra quyền tạo sự kiện dựa trên loại tổ chức (OrganizationType) và loại sự kiện (EventType).

Mục tiêu: đảm bảo người dùng chỉ thấy và thao tác với chức năng phù hợp với vai trò và loại tổ chức của họ.

---

## 2. Các vai trò hệ thống (UserRole)

| Vai trò | Mô tả | Quyền hạn chính |
|---------|-------|-----------------|
| `ADMIN` | Quản trị viên | Toàn quyền: quản lý người dùng, tổ chức, danh mục, batch, sự kiện, recall, báo cáo |
| `MANAGER` | Quản lý | Quản lý người dùng, batch, sản phẩm, báo cáo, supply chain; không truy cập được Organizations/Categories |
| `STAFF` | Nhân viên / Thành viên tổ chức | Xem dashboard, quản lý batch, tạo sự kiện trong phạm vi tổ chức của mình |

> **Lưu ý**: Backend hiện tại vẫn trả về 6 vai trò cũ (`Administrator`, `Farmer`, `Processor`, `Distributor`, `Retailer`, `Inspector`). Frontend có **runtime adapter** tự động map các vai trò cũ sang 3 vai trò mới.

---

## 3. Các loại tổ chức (OrganizationType)

| Loại | Mã | Mô tả |
|------|----|-------|
| Nông trại | `FARM` | Trồng trọt, thu hoạch |
| Chế biến | `PROCESSOR` | Chế biến, đóng gói, tách/gộp lô |
| Phân phối | `DISTRIBUTOR` | Vận chuyển, phân phối, tách/gộp lô |
| Bán lẻ | `RETAILER` | Bán lẻ, tách lô |
| Kiểm định | `INSPECTION` | Kiểm tra chất lượng |
| Hệ thống | `SYSTEM` | Quản trị viên hệ thống, full quyền sự kiện |

---

## 4. Các loại sự kiện (EventType)

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

## 5. Layer 1: Quyền truy cập Route

### 5.1. Bảng quyền truy cập

| Route | ADMIN | MANAGER | STAFF |
|-------|-------|---------|-------|
| `/app/dashboard` | ✓ | ✓ | ✓ |
| `/app/batches` | ✓ | ✓ | ✓ |
| `/app/batches/new` | ✓ | ✓ | ✓ |
| `/app/supply-chain` | ✓ | ✓ | ✓ |
| `/app/inspection` | ✓ | ✓ | ✗ |
| `/app/recall` | ✓ | ✗ | ✗ |
| `/app/reports` | ✓ | ✓ | ✗ |
| `/app/organizations` | ✓ | ✗ | ✗ |
| `/app/categories` | ✓ | ✗ | ✗ |
| `/app/users` | ✓ | ✓ | ✗ |
| `/app/products` | ✓ | ✓ | ✗ |
| `/app/profile` | ✓ | ✓ | ✓ |

### 5.2. Cơ chế guard

- **AppLayout**: Sau khi kiểm tra đăng nhập, kiểm tra `canAccessRoute(user.role, pathname)`. Nếu không có quyền, chuyển hướng về `/app/profile`.
- **ProtectedRoute**: Component hỗ trợ `allowedRoles` prop, dùng khi cần bảo vệ nhóm route con.

```tsx
import { ProtectedRoute } from "../../features/auth/ProtectedRoute";

<ProtectedRoute allowedRoles={["ADMIN"]}>
  <Outlet />
</ProtectedRoute>
```

---

## 6. Layer 2: Quyền tạo sự kiện (OrgType × EventType)

### 6.1. Bảng quyền tạo sự kiện

| EventType | FARM | PROCESSOR | DISTRIBUTOR | RETAILER | INSPECTION | SYSTEM |
|-----------|------|-----------|-------------|----------|------------|--------|
| HARVEST | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| RECEIVE | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| PROCESSING | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ |
| PACKAGING | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ |
| TRANSPORT | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| DISTRIBUTION | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| RETAIL | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| INSPECTION | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| RECALL | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| SPLIT | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| MERGE | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |

### 6.2. Sử dụng trong code

```tsx
import { canCreateEvent, getAllowedEventTypes } from "../../features/auth/permissions";

const orgType = user?.organizationType;
const allowedEventTypes = getAllowedEventTypes(orgType);

// Kiểm tra trước khi submit form
const canSubmit = canCreateEvent(orgType, selectedEventType);
if (!canSubmit) {
  setError("Tổ chức của bạn không có quyền tạo sự kiện này");
}
```

### 6.3. UI filtering

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

## 8. Cấu trúc code liên quan

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
│   │   ├── ProfilePage.tsx        # Hiển thị Staff — OrgType
│   │   └── users.utils.ts         # filterUsers, getRoleOptions
│   ├── organizations/
│   │   ├── organizations.types.ts # OrganizationType = FARM|PROCESSOR|DISTRIBUTOR|RETAILER|INSPECTION|SYSTEM
│   │   └── organizations.api.ts   # mapTypeToNew adapter
│   └── supply-chain/
│       └── SupplyChainPage.tsx    # Layer 2 event guards + SPLIT/MERGE fields
├── types/
│   └── mapping.ts                 # adaptApiRoleToCanonical, inferOrganizationTypeFromApiRole
└── lib/
    └── api/
        └── mock-handlers.ts       # Mock user factory with organizationType
```

---

## 9. Quy tắc phát triển

### 9.1. Thêm route mới

1. Thêm route vào `ROLE_ACCESS` trong `permissions.ts`
2. Sidebar tự động lọc theo quyền — không cần sửa `roles` array thủ công

### 9.2. Thêm EventType mới

1. Thêm vào `EventType` union trong `auth.types.ts`
2. Thêm vào `ALL_EVENT_TYPES` trong `SupplyChainPage.tsx`
3. Gán quyền cho các `OrganizationType` trong `ORG_EVENT_PERMISSIONS`

### 9.3. Kiểm tra quyền trong component

```tsx
const { user, canAccessRoute } = useAuth();
if (!canAccessRoute(user?.role, "/app/some-path")) {
  return <Navigate to="/app/profile" replace />;
}
```

### 9.4. Kiểm tra quyền tạo sự kiện

```tsx
const { user } = useAuth();
import { canCreateEvent } from "../auth/permissions";

if (!canCreateEvent(user?.organizationType, eventType)) {
  // Disable button, show warning
}
```

---

## 10. Migration từ 6 roles cũ sang 3 roles mới

### 10.1. Tác động

| Thành phần | Thay đổi | Ghi chú |
|------------|----------|---------|
| `auth.types.ts` | 6 roles → 3 roles | File type chính |
| `users.types.ts` | 6 roles → 3 roles | User management page |
| `users.utils.test.ts` | Farmer → STAFF | Test cập nhật |
| `Sidebar.tsx` | Xóa roleMap, dùng `canAccessRoute` | Không còn hardcode |
| `TopBar.tsx` | Hiển thị `STAFF — ORG_TYPE` | UX cải thiện |
| `ProfilePage.tsx` | Hiển thị `STAFF — ORG_TYPE` | UX cải thiện |
| `OrganizationsPage.tsx` | `INSPECTOR` → `INSPECTION` | Đúng với type mới |
| `organizations.api.ts` | Fix mapping key | `INSPECTION` → `INSPECTOR_ORG` |

### 10.2. Lưu ý

- **Không** cần đổi backend API ngay lập tức. Runtime adapter sẽ map trong transition period.
- Khi backend sẵn sàng chuyển sang 3 roles, có thể bỏ `adaptApiRoleToCanonical` và `inferOrganizationTypeFromApiRole` để dùng trực tiếp API response.
- Session cũ trong `sessionStorage` sẽ được re-normalize khi load lại trang.

---

## 11. Testing

### 11.1. Smoke test mock

| Kịch bản | Kết quả mong đợi |
|-----------|----------------|
| Login Admin | Tất cả menus hiện, truy cập được tất cả routes |
| Login Manager | Không thấy Organizations, Categories, Recall; không truy cập được |
| Login Staff + FARM | Chỉ thấy Harvest trong event types |
| Login Staff + PROCESSOR | Thấy Receive, Processing, Packaging, Split, Merge |
| Login Staff + DISTRIBUTOR | Thấy Receive, Transport, Distribution, Split, Merge |
| Login Staff + RETAILER | Thấy Receive, Retail, Split |
| Login Staff + INSPECTION | Chỉ thấy Inspection |
| Legacy API role FARMER | Tự động map → STAFF + FARM |
| Legacy API role INSPECTOR | Tự động map → STAFF + INSPECTION |

### 11.2. Run tests

```bash
npm test
```

### 11.3. Build

```bash
npm run build
```

---

## 12. Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách fix |
|------|-------------|----------|
| `canAccessRoute` trả về false dù đã đăng nhập | Role trong session chưa được normalize | Xóa sessionStorage, đăng nhập lại |
| Event type dropdown trống | `organizationType` chưa được set | Kiểm tra login response có `organizationType` không |
| Route redirect về profile liên tục | Thiếu route trong `ROLE_ACCESS` | Thêm route vào `permissions.ts` |
| Build fail: `OrganizationType` missing | Import thiếu từ `permissions.ts` | Import type đúng module |

---

## 13. Liên hệ

- File quy hoạch chi tiết: `.kilo/plans/frontend-rbac-refactor-plan.md`
- AGENTS.md: `D:\CPL_Project\AgriTrace-Frontend\AGENTS.md`
