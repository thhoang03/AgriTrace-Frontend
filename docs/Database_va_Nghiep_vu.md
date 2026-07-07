# Tài liệu giải thích Database & Nghiệp vụ
## Hệ thống Truy xuất Nguồn gốc Nông sản theo Chuỗi Cung ứng (Đề tài 02)

Tài liệu này giải thích thiết kế cơ sở dữ liệu và các quy tắc nghiệp vụ, đồng bộ với **Business_Process.md** và **Database.md**.

- **Script schema:** [`AgriDB.sql`](AgriDB.sql)
- **Nguồn nghiệp vụ:** [`Business_Process.md`](Business_Process.md)
- **Tài liệu schema:** [`Database.md`](Database.md)
- **DBMS:** SQL Server 2022
- **Database name:** `AgriTraceabilityDB`

---

## 1. Tổng quan

Thiết kế hiện tại tập trung vào một mô hình cơ bản và thực tế:
- `Organizations` chứa thông tin các bên tham gia chuỗi cung ứng.
- `Users` lưu vai trò người dùng theo chuỗi và tổ chức.
- `Products` liên kết với tổ chức.
- `Batches` là thực thể trung tâm, đại diện lô hàng.
- `BatchImages` lưu ảnh minh hoạ cho từng lô.
- `SupplyChainEvents` ghi nhận lịch sử hành trình lô hàng.
- `BatchRelations` mô tả quan hệ tách/gộp giữa các lô.

Mục tiêu là giữ dữ liệu đơn giản, dễ hiểu và tránh ghi trạng thái nghiệp vụ trực tiếp vào lịch sử sự kiện.

---

## 2. Thiết kế chính

- Dùng `INT IDENTITY` cho các khoá chính.
- Dùng trường chuỗi (`NVARCHAR`) cho `Organizations.Type` và `Users.Role` để giảm độ phức tạp.
- Giữ `Batches` làm thực thể lô hiện tại còn `SupplyChainEvents` lưu lịch sử bất biến.
- `BatchImages` lưu ảnh riêng, không nhúng vào Batches.
- Dùng `BatchRelations` để biểu diễn quan hệ `SPLIT`/`MERGE` mà không đặt nhiều trạng thái vào bản ghi batch.

---

## 3. Các bảng chính

### 3.1. `Organizations`

- Lưu thông tin tổ chức tham gia chuỗi cung ứng.
- `Type` phân loại đơn giản: `FARM`, `PROCESSOR`, `DISTRIBUTOR`, `RETAILER`.
- `Status` theo dõi trạng thái hoạt động.

```sql
CREATE TABLE Organizations (
    Id INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Type NVARCHAR(50) NOT NULL, -- FARM / PROCESSOR / DISTRIBUTOR / RETAILER
    Status NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE / INACTIVE / SUSPENDED
    CreatedAt DATETIME DEFAULT GETDATE()
);
```

### 3.2. `Users`

- Lưu tài khoản người dùng.
- `Role` định nghĩa quyền: `ADMIN`, `ORGADMIN`, `FARMER`, `OPERATOR`, `INSPECTOR`.

```sql
CREATE TABLE Users (
    Id INT IDENTITY PRIMARY KEY,
    FullName NVARCHAR(200),
    Email NVARCHAR(200) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(500),
    Role NVARCHAR(50) NOT NULL, -- ADMIN / ORGADMIN / FARMER / OPERATOR / INSPECTOR
    OrganizationId INT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Users_Organizations FOREIGN KEY (OrganizationId) REFERENCES Organizations(Id)
);
```

Notes:
- Người dùng có thể liên kết với một tổ chức hoặc không nếu là tài khoản hệ thống.

### 3.3. `Products`

- Lưu sản phẩm do tổ chức quản lý.
- `Category` và `Unit` giữ nguyên dạng chuỗi để giảm phức tạp.

```sql
CREATE TABLE Products (
    Id INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(200),
    Category NVARCHAR(100),
    Unit NVARCHAR(50),
    OrganizationId INT NOT NULL,
    CONSTRAINT FK_Products_Organizations FOREIGN KEY (OrganizationId) REFERENCES Organizations(Id)
);
```

### 3.4. `Batches`

- Đại diện một lô hàng cụ thể.
- Lưu số lượng, mã QR và trạng thái hiện thời.
- `ParentBatchId`/`RootBatchId` hỗ trợ truy vết phân nhánh.

```sql
CREATE TABLE Batches (
    Id INT IDENTITY PRIMARY KEY,
    ProductId INT NOT NULL,
    BatchCode NVARCHAR(100) UNIQUE NOT NULL,
    Quantity DECIMAL(18,2) NOT NULL,
    CurrentOrganizationId INT NULL,
    ParentBatchId INT NULL,
    RootBatchId INT NULL,
    QRCode NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Batches_Products FOREIGN KEY (ProductId) REFERENCES Products(Id),
    CONSTRAINT FK_Batches_Organizations FOREIGN KEY (CurrentOrganizationId) REFERENCES Organizations(Id),
    CONSTRAINT FK_Batches_Parent FOREIGN KEY (ParentBatchId) REFERENCES Batches(Id)
);
```

### 3.5. `BatchImages`

- Lưu ảnh minh hoạ cho lô hàng.
- Mỗi lô có thể có nhiều ảnh.
- `EventId` cho phép gắn ảnh với một sự kiện cụ thể.

```sql
CREATE TABLE BatchImages (
    Id INT IDENTITY PRIMARY KEY,
    BatchId INT NOT NULL,
    ImageUrl NVARCHAR(500) NOT NULL,
    Caption NVARCHAR(200),
    DisplayOrder INT DEFAULT 0,
    EventId INT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_BatchImages_Batches FOREIGN KEY (BatchId) REFERENCES Batches(Id),
    CONSTRAINT FK_BatchImages_Events FOREIGN KEY (EventId) REFERENCES SupplyChainEvents(Id)
);
```

**API tương ứng:** `POST /batches/{batchId}/images` (upload ảnh), ảnh được trả về trong `GET /batches/{batchId}` (mảng `images`).

---

### 3.6. `SupplyChainEvents`

- Lưu lịch sử bất biến của từng lô — **append-only**, không sửa/xoá.
- `EventType` là chuỗi mô tả hành động: `HARVEST`, `PROCESS`, `PACKAGE`, `TRANSPORT`, `RECEIVE`, `INSPECT`, `SPLIT`, `MERGE`.
- `PreviousHash` và `CurrentHash` tạo thành hash chain SHA-256 chống giả mạo.
- `EventData` là JSON string linh hoạt chứa dữ liệu chi tiết theo từng loại sự kiện.

```sql
CREATE TABLE SupplyChainEvents (
    Id INT IDENTITY PRIMARY KEY,
    BatchId INT NOT NULL,
    EventType NVARCHAR(50) NOT NULL, -- HARVEST / PROCESS / PACKAGE / TRANSPORT / INSPECT / RECEIVE / SPLIT / MERGE
    OrganizationId INT NOT NULL,
    UserId INT NOT NULL,
    EventData NVARCHAR(MAX),
    Location NVARCHAR(200),
    PreviousHash NVARCHAR(500),
    CurrentHash NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Events_Batches FOREIGN KEY (BatchId) REFERENCES Batches(Id),
    CONSTRAINT FK_Events_Organizations FOREIGN KEY (OrganizationId) REFERENCES Organizations(Id),
    CONSTRAINT FK_Events_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);
```

**API tương ứng:** `GET /batches/{id}/events` (danh sách), `POST /batches/{id}/events` (ghi mới), `GET /batches/{id}/events/verify-integrity` (xác minh hash chain).

---

### 3.7. `Inspections`

- Lưu kết quả kiểm định chất lượng.
- `Result` nhận giá trị: `PASS`, `FAIL`, `PENDING`.

```sql
CREATE TABLE Inspections (
    Id INT IDENTITY PRIMARY KEY,
    BatchId INT NOT NULL,
    InspectorId INT NOT NULL,
    Result NVARCHAR(100),
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Inspections_Batches FOREIGN KEY (BatchId) REFERENCES Batches(Id),
    CONSTRAINT FK_Inspections_Users FOREIGN KEY (InspectorId) REFERENCES Users(Id)
);
```

**API tương ứng:** `GET /batches/{id}/inspections`, `POST /batches/{id}/inspections`, `GET /inspections/{id}`.

---

### 3.8. `Certificates`

- Lưu chứng nhận gắn với lô hàng (VietGAP, GlobalGAP, Organic, ISO...).
- `InspectionId` là tuỳ chọn — hỗ trợ chứng nhận từ bên ngoài không qua kiểm định nội bộ.

```sql
CREATE TABLE Certificates (
    Id INT IDENTITY PRIMARY KEY,
    BatchId INT NOT NULL,
    InspectionId INT NULL,
    CertificateType NVARCHAR(100),
    FileUrl NVARCHAR(500),
    IssuedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Certificates_Batches FOREIGN KEY (BatchId) REFERENCES Batches(Id),
    CONSTRAINT FK_Certificates_Inspections FOREIGN KEY (InspectionId) REFERENCES Inspections(Id)
);
```

**API tương ứng:** `GET /batches/{id}/certificates`, `POST /batches/{id}/certificates`.

---

### 3.9. `Recalls`

- Lưu sự kiện thu hồi sản phẩm.
- `Severity` phân loại mức độ: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.

```sql
CREATE TABLE Recalls (
    Id INT IDENTITY PRIMARY KEY,
    BatchId INT NOT NULL,
    Reason NVARCHAR(500),
    Severity NVARCHAR(50),
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Recalls_Batches FOREIGN KEY (BatchId) REFERENCES Batches(Id),
    CONSTRAINT FK_Recalls_Users FOREIGN KEY (CreatedBy) REFERENCES Users(Id)
);
```

**API tương ứng:** `GET /recalls`, `POST /recalls`, `PATCH /recalls/{id}/resolve`.

---

### 3.10. `Notifications`

- Lưu thông báo gửi tới người dùng.
- `IsRead` đánh dấu trạng thái đã đọc.

```sql
CREATE TABLE Notifications (
    Id INT IDENTITY PRIMARY KEY,
    UserId INT NOT NULL,
    Title NVARCHAR(200),
    Message NVARCHAR(MAX),
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);
```

**API tương ứng:** `GET /notifications`, `PATCH /notifications/{id}/read`, `PATCH /notifications/read-all`, `GET /notifications/unread-count`.

---

### 3.11. `BatchRelations`

- Mô tả quan hệ `SPLIT` và `MERGE` giữa các lô.
- `SourceBatchId` là lô nguồn, `TargetBatchId` là lô đích.
- `Quantity` ghi lại số lượng tham gia quan hệ.

```sql
CREATE TABLE BatchRelations (
    Id INT IDENTITY PRIMARY KEY,
    SourceBatchId INT NOT NULL,
    TargetBatchId INT NOT NULL,
    RelationType NVARCHAR(50), -- SPLIT / MERGE
    Quantity DECIMAL(18,2),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Rel_Source FOREIGN KEY (SourceBatchId) REFERENCES Batches(Id),
    CONSTRAINT FK_Rel_Target FOREIGN KEY (TargetBatchId) REFERENCES Batches(Id)
);
```

**API tương ứng:** `POST /batches/{id}/split` (tạo SPLIT relation), `POST /batches/merge` (tạo MERGE relation), `GET /public/trace/{batchId}/lineage` (truy vết phả hệ).

---

## 4. Quy tắc nghiệp vụ chính

- `Batches` lưu thông tin hiện tại của lô; `SupplyChainEvents` lưu lịch sử bất biến.
- `BatchRelations` ghi lại tách/gộp mà không đặt nhiều trạng thái lên `Batches`.
- `BatchImages` lưu ảnh minh hoạ, có thể gắn với sự kiện cụ thể qua `EventId`.
- `Users.Role` và `Organizations.Type` quyết định quyền thực thi hoạt động.
- `SupplyChainEvents` là append-only, không sửa/xoá dữ liệu lịch sử.
- `Certificates` có thể gắn với `Inspections` hoặc là chứng nhận bên ngoài.
- `Recalls` liên kết với `Batch` để phát thông báo và truy vết.
- `Inspections` chỉ có thể được tạo bởi user có role `INSPECTOR`.
- `Recalls` có `Severity` phân loại mức độ (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).

---

## 5. Lưu ý so với thiết kế cũ

- Loại bỏ các bảng lookup nhiều lớp như `OrganizationTypes`, `UnitTypes`, `Units`, `BatchSplits`, `BatchMerges`, `BatchMergeSources`.
- Thêm `BatchImages` để hỗ trợ upload ảnh lô hàng — tách riêng khỏi `Batches` giúp dễ mở rộng.
- Giữ model đơn giản hơn, phù hợp với phiên bản `New_DataBase.md`.
- Chỉ dùng các bảng cần thiết để hỗ trợ truy vết, kiểm định, chứng nhận, thu hồi và minh hoạ ảnh.
