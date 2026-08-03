# RBAC Guide — Tài Liệu Phân Quyền Hệ Thống AgriTrace (Backend & Frontend)

> **Hệ Thống Truy Xuất Nguồn Gốc Nông Sản AgriTrace**  
> **Phiên bản:** 3.0 — Cập nhật phân quyền 2 lớp (Role-Based + OrganizationType/EventType Matrix)  
> **Trạng thái:** Hoàn thiện — Phê duyệt quy tắc RECALL giới hạn cho SYSTEM Admin

---

## 1. Tổng Quan Kiến Trúc Phân Quyền (2-Layer RBAC)

Hệ thống AgriTrace triển khai bảo mật và phân quyền theo **2 lớp độc lập**:

```
[HTTP Request] ──► [Layer 1: JWT Bearer Auth & Role Check]
                         │
                         ▼
                   [Layer 2: Business Permission Checks]
                   ├── (1) OrganizationType ↔ EventType Matrix
                   └── (2) Batch Ownership Guard (CurrentOrganizationId == User.OrganizationId)
```

- **Layer 1 — Role-Based Access Control (`[Authorize(Roles = "...")]`):**
  Kiểm tra vai trò hệ thống của người dùng (`Admin`, `Manager`, `Staff`, `Inspector`, `Consumer`) thông qua Claims trong JWT Bearer Token.
- **Layer 2 — Matrix Permision & Ownership Check:**
  Kiểm tra quyền nghiệp vụ chi tiết: Tổ chức thuộc loại nào (`FARM`, `PROCESSOR`, `DISTRIBUTOR`, `RETAILER`, `INSPECTION`, `SYSTEM`) thì chỉ được thực hiện những loại sự kiện nông sản (`EventType`) tương ứng. Đồng thời đảm bảo quyền sở hữu đối với Lô hàng (Batch).

---

## 2. Các Vai Trò Hệ Thống (System Roles)

| Role | Tên Vai Trò | Phạm Vi & Quyền Hạn |
|---|---|---|
| `Admin` | Quản trị viên hệ thống | **Toàn quyền:** Quản lý tổ chức, người dùng, cấu hình danh mục, xem thống kê analytics, phát lệnh thu hồi (`RECALL`) toàn hệ thống. Bypass kiểm tra Layer 2 Event Matrix. |
| `Manager` | Quản lý tổ chức | **Phạm vi tổ chức:** Quản lý nhân viên (`Staff`), quản lý sản phẩm, lô hàng (`Batch`), xem báo cáo nội bộ tổ chức. |
| `Staff` | Nhân viên vận hành | **Nghiệp vụ trực tiếp:** Tạo lô hàng mới, ghi nhận sự kiện chuỗi cung ứng (`SupplyChainEvent`), thực hiện tách/gộp lô (`Split/Merge`) trong phạm vi tổ chức. |
| `Inspector` | Kiểm định viên | **Độc lập:** Kiểm định chất lượng nông sản (`QualityInspection`), cấp chứng nhận (`Certificate`) và thu hồi chứng nhận. Được phép ghi sự kiện `INSPECTION` xuyên tổ chức (Cross-Org). |
| `Consumer` | Người tiêu dùng | **Công khai:** Tra cứu thông tin lô hàng, xem timeline sự kiện và phả hệ split/merge qua mã QR mà không cần đăng nhập. |

---

## 3. Các Loại Tổ Chức (Organization Types)

| Mã OrgType | Tên Tổ Chức | Mô Tả Nghiệp Vụ |
|---|---|---|
| `FARM` | Trang trại / Nông trại | Trồng trọt, thu hoạch nông sản ban đầu |
| `PROCESSOR` | Cơ sở chế biến | Chế biến, phân loại, đóng gói, tách/gộp lô |
| `DISTRIBUTOR` | Nhà phân phối / Vận chuyển | Đóng gói, vận chuyển, giao nhận, tách/gộp lô |
| `RETAILER` | Nhà bán lẻ / Siêu thị | Bán lẻ nông sản tới tay người tiêu dùng, tách lô |
| `INSPECTION` | Cơ quan kiểm định | Đơn vị kiểm tra chất lượng độc lập |
| `SYSTEM` | Quản trị hệ thống | Đơn vị điều hành toàn bộ nền tảng AgriTrace |

---

## 4. Ma Trận Quyền Sự Kiện Chuỗi Cung Ứng (Layer 2 Event Matrix)

Hàm `EventPermissionRules.IsAllowed(orgTypeCode, eventTypeCode)` thực thi kiểm tra quyền tạo sự kiện:

| OrganizationType | HARVEST | RECEIVE | PROCESSING | PACKAGING | TRANSPORT | DISTRIBUTION | RETAIL | INSPECTION | SPLIT | MERGE | RECALL |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `FARM` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `PROCESSOR` | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `DISTRIBUTOR` | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `RETAILER` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `INSPECTION` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `SYSTEM` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Các Quy Tắc Đặc Bẫy Nghiệp Vụ (Business Rules):
1. **Chỉ `SYSTEM` Admin được tạo `RECALL`:** Thu hồi nông sản là lệnh đặc biệt nghiêm trọng, chỉ Admin tối cao mới được phát lệnh.
2. **Quyền Cross-Org của `INSPECTION`:** Tổ chức `INSPECTION` có quyền lập kiểm định và ghi nhận event `INSPECTION` trên lô hàng của tổ chức khác (bỏ qua Batch Ownership Guard).
3. **Batch Ownership Guard:** ngoại trừ trường hợp `INSPECTION` và `SYSTEM`, tất cả thao tác của các tổ chức khác bắt buộc thỏa mãn: `batch.CurrentOrganizationId == currentUser.OrganizationId`.

---

## 5. Quy Trình Xác Thực & Phân Quyền Trong Code

### Backend (.NET 10):
```csharp
// 1. Controller Guard (Layer 1)
[Authorize(Roles = "Admin,Manager,Staff")]
[HttpPost("{id}/events")]
public async Task<IActionResult> CreateEvent(Guid id, [FromBody] CreateEventRequest request)
{
    // 2. Extracted Current User (ClaimsPrincipal)
    var userId = _currentUserService.UserId;
    var userOrgType = _currentUserService.OrganizationType;

    // 3. Command Handler (Layer 2 Check)
    var isAllowed = EventPermissionRules.IsAllowed(userOrgType, request.EventType);
    if (!isAllowed)
        throw new ConflictException("Tổ chức của bạn không có quyền ghi nhận loại sự kiện này.");
        
    // 4. Batch Ownership Guard Check
    if (batch.CurrentOrganizationId != _currentUserService.OrganizationId && userOrgType != "INSPECTION")
        throw new ConflictException("Lô hàng hiện không thuộc quyền sở hữu của tổ chức bạn.");
}
```

### Frontend (React 19 / TypeScript):
```typescript
// Role Adapter Map (Map các vai trò từ API sang frontend permissions)
export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  if (userRole === "Admin") return true;
  return requiredRoles.includes(userRole);
}
```
