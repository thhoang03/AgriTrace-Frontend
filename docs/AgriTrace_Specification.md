# Agricultural Supply Chain Traceability System

## Database & Business Specification (v4.0)

* **Database:** `AgriTraceabilityDB`
* **DBMS:** SQL Server
* **Architecture:** Clean Architecture + DDD
* **Backend:** ASP.NET Core Web API (.NET 10)
* **Frontend:** React

---

# MỤC LỤC (TABLE OF CONTENTS)

- [1. Overview](#1-overview)
  - [1.1 System Description](#11-system-description)
  - [1.2 Main Objectives](#12-main-objectives)
- [2. Business Actors & Roles](#2-business-actors--roles)
- [3. Organization Model](#3-organization-model)
  - [3.1 Organization Types](#31-organization-types)
  - [3.2 Organization & User Relationship](#32-organization--user-relationship)
- [4. Authentication & Authorization](#4-authentication--authorization)
  - [4.1 Authentication](#41-authentication)
  - [4.2 Authorization](#42-authorization)
- [5. Database Core Design](#5-database-core-design)
- [6. Product Management](#6-product-management)
- [7. Batch Management](#7-batch-management)
  - [7.1 Định nghĩa](#71-định-nghĩa)
  - [7.2 Quy trình khởi tạo Lô hàng (Batch Creation)](#72-quy-trình-khởi-tạo-lô-hàng-batch-creation)
  - [7.3 Cấu trúc dữ liệu bảng Batches](#73-cấu-trúc-dữ-liệu-bảng-batches)
  - [7.4 Quy tắc nghiệp vụ các trường dữ liệu quan trọng](#74-quy-tắc-nghiệp-vụ-các-trường-dữ-liệu-quan-trọng)
- [8. Supply Chain Event Management](#8-supply-chain-event-management)
  - [8.1 Định nghĩa](#81-định-nghĩa)
  - [8.2 Danh mục sự kiện cấu hình (EventTypes)](#82-danh-mục-sự-kiện-cấu-hình-eventtypes)
  - [8.3 Cấu trúc dữ liệu bảng SupplyChainEvents](#83-cấu-trúc-dữ-liệu-bảng-supplychainevents)
- [9. Hash Chain Mechanism](#9-hash-chain-mechanism)
  - [9.1 Nguyên lý bảo mật dữ liệu](#91-nguyên-lý-bảo-mật-dữ-liệu)
  - [9.2 Luồng liên kết mã băm (Hash Logic)](#92-luồng-liên-kết-mã-băm-hash-logic)
  - [9.3 Công thức tính toán](#93-công-thức-tính-toán)
  - [9.4 Quy tắc hệ thống (Immutable Rules)](#94-quy-tắc-hệ-thống-immutable-rules)
- [10. Batch Split Management](#10-batch-split-management)
- [11. Batch Merge Management](#11-batch-merge-management)
- [12. Quality Inspection](#12-quality-inspection)
- [13. Certificate Management](#13-certificate-management)
- [14. Recall Management](#14-recall-management)
- [15. Public Traceability](#15-public-traceability)
- [16. Notification](#16-notification)
- [17. Main Business Processes](#17-main-business-processes)
- [18. Database Schema Overview](#18-database-schema-overview)
- [19. Business Rules](#19-business-rules)
- [20. API Mapping Recommendation](#20-api-mapping-recommendation)

---

## 1. Overview

### 1.1 System Description

**Agricultural Supply Chain Traceability System** là hệ thống quản lý truy xuất nguồn gốc nông sản xuyên suốt chuỗi cung ứng. Hệ thống quản lý toàn bộ vòng đời của một **Batch** (lô hàng):

$$\text{Farm} \longrightarrow \text{Processing} \longrightarrow \text{Packaging} \longrightarrow \text{Transportation} \longrightarrow \text{Distribution} \longrightarrow \text{Retail} \longrightarrow \text{Consumer}$$

Mỗi **Batch** được tạo ra sẽ sở hữu:

* Mã duy nhất định danh lô hàng (`Unique Batch Code`).
* Mã phản hồi nhanh phục vụ truy xuất (`QR Code`).
* Dòng thời gian chuỗi cung ứng (`Supply Chain Timeline`).

Mọi hoạt động tác động lên Batch đều phát sinh một hành vi hệ thống được ghi nhận là `SupplyChainEvent`.

* *Ví dụ:* Người nông dân thu hoạch cà chua $\rightarrow$ Event: `HARVEST` $\rightarrow$ Cơ sở chế biến tiếp nhận $\rightarrow$ Event: `RECEIVE` $\rightarrow$ Đơn vị phân phối vận chuyển $\rightarrow$ Event: `TRANSPORT`.

### 1.2 Main Objectives

1. **Traceability:** Cho phép người tiêu dùng quét mã QR (`Scan QR Code`) để xem toàn bộ lịch sử sản phẩm bao gồm: Nguồn gốc trang trại, ngày thu hoạch, lịch sử chế biến/vận chuyển, kết quả kiểm định, chứng chỉ đi kèm và trạng thái thu hồi.
2. **Data Integrity:** Lịch sử `SupplyChainEvent` tuân thủ nguyên tắc **Append-only** (không được phép sửa hoặc xóa). Mỗi sự kiện được liên kết bảo vệ bằng cơ chế chuỗi mã hóa **SHA-256 Hash Chain**.
3. **Supply Chain Management:** Hỗ trợ các tác nhân tham gia (`Farmer`, `Processor`, `Distributor`, `Retailer`, `Inspector`) ghi nhận đầy đủ hoạt động thực tế.
4. **Product Safety:** Quản lý chặt chẽ công tác kiểm định chất lượng (`Quality Inspection`), cấp chứng chỉ (`Certificate`), xử lý khủng hoảng thu hồi nông sản (`Recall`) và thông báo (`Notification`).

---

## 2. Business Actors & Roles

| Actor | Description | Responsibilities |
| --- | --- | --- |
| **Admin** | Người quản trị toàn hệ thống. | Quản lý tổ chức, phân quyền người dùng, danh mục cấu hình, khởi tạo lệnh thu hồi sản phẩm toàn hệ thống. |
| **Manager** | Quản trị viên nội bộ của một tổ chức (Farm, Processor, Distributor,...). | Quản lý nhân viên trực thuộc, danh mục sản phẩm và các lô hàng thuộc phạm vi tổ chức sở hữu. |
| **Staff / Farmer** | Nhân viên trực tiếp thực hiện nghiệp vụ tại các mắt xích cung ứng (Farm/Processor/Distributor/Retailer). | Ghi nhận sự kiện (`Events`). Hệ thống không chia cụ thể vai trò *Farmer/Processor/Distributor* ở tầng Role mà xác định dựa trên thuộc tính **Organization Type** của tổ chức họ trực thuộc. |
| **Inspector** | Đơn vị kiểm định chất lượng độc lập. | Thực hiện kiểm định, cập nhật báo cáo chất lượng và đính kèm chứng chỉ hợp quy. |
| **Consumer** | Người tiêu dùng cuối cùng. | Không cần đăng nhập, chỉ có quyền đọc (`Read-only`) để xem dòng thời gian (`Timeline`) truy xuất. |

> **Ví dụ phân định nghiệp vụ:**
> Nguyễn Văn A có Role là `Staff`, thuộc tổ chức `Đà Lạt Farm` có loại hình là `FARM` $\rightarrow$ Hệ thống định danh nghiệp vụ thực tế của đối tượng này là **Farmer**.

---

## 3. Organization Model

### 3.1 Organization Types

Đại diện cho vai trò vị trí chức năng của đơn vị trong chuỗi cung ứng, được cấu hình trong bảng `OrganizationTypes`:

| Code | Description |
| --- | --- |
| `FARM` | Nông trại |
| `PROCESSOR` | Cơ sở sơ chế, chế biến |
| `DISTRIBUTOR` | Nhà phân phối |
| `RETAILER` | Cửa hàng bán lẻ |
| `INSPECTION` | Đơn vị kiểm định chất lượng |
| `SYSTEM` | Hệ thống quản trị tổng |

### 3.2 Organization & User Relationship

Mỗi `Organization` đại diện cho một pháp nhân hoặc cơ sở vật lý tham gia chuỗi. Khách thể `User` quan hệ phụ thuộc với `Organization` theo kiến trúc một-nhiều: Một User bắt buộc thuộc về một Tổ chức và nắm giữ một Role nhất định.

---

## 4. Authentication & Authorization

### 4.1 Authentication

* Cơ chế xác thực dựa trên **JWT (JSON Web Token)**.
* Quy trình: `User Login` $\rightarrow$ Kiểm tra thông tin định danh $\rightarrow$ Cấp phát cặp Token (`Access Token` ngắn hạn & `Refresh Token` dài hạn lưu DB) $\rightarrow$ Trả về thông tin phiên làm việc.

### 4.2 Authorization

Hệ thống kiểm soát đặc quyền qua 2 lớp bảo mật tích hợp:

* **Layer 1 (Role Permission):** Kiểm tra vai trò định danh hệ thống (`Admin`, `Manager`, `Staff`, `Inspector`).
* **Layer 2 (Organization Event Permission):** Kiểm tra chéo giữa Loại hình tổ chức (`OrganizationType`) và Loại sự kiện (`EventType`) để quyết định quyền ghi dữ liệu.
* *Ví dụ:* Chỉ User thuộc tổ chức `FARM` mới được thực thi quyền tạo sự kiện `HARVEST`. Tổ chức `DISTRIBUTOR` được cấp quyền cho các sự kiện `RECEIVE`, `TRANSPORT`, `DISTRIBUTION`, `SPLIT`, `MERGE`.

---

## 5. Database Core Design

Cấu trúc phân hệ cơ sở dữ liệu được tổ chức thành các nhóm logic sau:

* **Identity (Định danh):** `Users`, `Roles`, `RefreshTokens`
* **Organization (Tổ chức):** `Organizations`, `OrganizationTypes`, `OrganizationTypeEvents`
* **Product (Sản phẩm):** `Categories`, `Products`, `Units`
* **Traceability Core (Lõi truy xuất):** `Batches`, `SupplyChainEvents`
* **Advanced Traceability (Nghiệp vụ lô biến đổi):** `BatchSplits`, `BatchSplitDetails`, `BatchMerges`, `BatchMergeSources`
* **Quality (Chất lượng):** `QualityInspections`, `Certificates`
* **System & Safety (An toàn & Hệ thống):** `Recalls`, `Notifications`

---

## 6. Product Management

* **Mục đích:** Quản lý danh mục các sản phẩm nông nghiệp được phép lưu hành và tham gia chuỗi cung ứng.
* **Phân cấp thực thể:** `Category` (Nhóm sản phẩm) $\rightarrow$ `Product` (Sản phẩm cụ thể) $\rightarrow$ Định lượng bằng `Unit` (Đơn vị tính).
* **Quy tắc nghiệp vụ:**
  * Quan hệ một - nhiều giữa `Category` và `Product` (Một loại nông sản chỉ thuộc duy nhất một danh mục cha).
  * `Product` gắn liền với tổ chức khởi tạo (`OrganizationId`) và không được thay đổi trong suốt vòng đời của `Batch`.
  * Để đảm bảo toàn vẹn dữ liệu quá khứ, các `Unit` đã phát sinh giao dịch **không được xóa** mà chỉ chuyển đổi trạng thái hoạt động (`IsActive = 0`).

---

## 7. Batch Management

### 7.1 Định nghĩa

`Batch` (Lô hàng) là thực thể trung tâm quản trị toàn bộ trạng thái vật lý của nông sản trên đường di chuyển.

```text
Mẫu mã Batch: TOMATO-2026-001 | Số lượng: 500 KG | QR Định danh bảo mật
```

### 7.2 Quy trình khởi tạo Lô hàng (Batch Creation)

Tác nhân `Staff` thuộc đơn vị `FARM` nhập thông tin sản phẩm, ngày thu hoạch, số lượng và đơn vị tính $\rightarrow$ Hệ thống tự động sinh `BatchCode` và mã hóa `QRCode` $\rightarrow$ Lưu thông tin thực thể `Batches` đồng thời kích hoạt tự động sự kiện đầu tiên: `HARVEST Event`.

### 7.3 Cấu trúc dữ liệu bảng `Batches`

```sql
CREATE TABLE Batches
(
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    ProductId UNIQUEIDENTIFIER NOT NULL,
    CreatedOrganizationId UNIQUEIDENTIFIER NOT NULL,
    CurrentOrganizationId UNIQUEIDENTIFIER NOT NULL,
    BatchCode VARCHAR(100) UNIQUE NOT NULL,
    QRCode VARCHAR(500),
    Quantity DECIMAL(18,2),
    UnitId UNIQUEIDENTIFIER,
    RemainingQuantity DECIMAL(18,2),
    Status INT,
    ParentBatchId UNIQUEIDENTIFIER NULL,
    RootBatchId UNIQUEIDENTIFIER NULL,
    HarvestDate DATETIME2,
    ExpirationDate DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
```

### 7.4 Quy tắc nghiệp vụ các trường dữ liệu quan trọng

* **`Quantity`:** Số lượng gốc lúc thiết lập lô. Tuyệt đối **không UPDATE** trường này khi hao hụt hoặc chế biến. Mọi biến động số lượng phải được ghi nhận qua sự kiện tăng/giảm phụ thuộc (`QuantityAfter`).
* **`RemainingQuantity`:** Số lượng khả dụng còn lại của lô hàng, phục vụ trực tiếp cho các kịch bản tách lô (`Batch Split`). Khi lượng phân tách đạt tối đa, trường này trả về giá trị `0`.
* **`CurrentOrganizationId`:** Định vị tổ chức đang chịu trách nhiệm lưu kho/sở hữu lô hàng tại thời điểm hiện tại (Cập nhật liên tục khi hoàn thành sự kiện giao nhận `RECEIVE`).

**Các trạng thái (Status):** `CREATED`, `HARVESTED`, `PROCESSING`, `TRANSPORTING`, `DISTRIBUTED`, `RETAIL`, `RECALLED`.

---

## 8. Supply Chain Event Management

### 8.1 Định nghĩa

`SupplyChainEvent` chịu trách nhiệm ghi lại toàn bộ dấu vết lịch sử hoạt động tác động lên lô hàng.

### 8.2 Danh mục sự kiện cấu hình (`EventTypes`)

* `HARVEST` (Thu hoạch)
* `RECEIVE` (Nhận hàng)
* `PROCESSING` (Sơ chế/Chế biến)
* `PACKAGING` (Đóng gói)
* `TRANSPORT` (Vận chuyển)
* `DISTRIBUTION` (Phân phối)
* `RETAIL` (Bán lẻ)
* `SALE` (Bán hàng thành phẩm)
* `INSPECTION` (Kiểm định)
* `SPLIT` (Chia lô)
* `MERGE` (Gộp lô)
* `RECALL` (Thu hồi)

### 8.3 Cấu trúc dữ liệu bảng `SupplyChainEvents`

```sql
CREATE TABLE SupplyChainEvents
(
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    BatchId UNIQUEIDENTIFIER NOT NULL,
    EventTypeId INT NOT NULL,
    OrganizationId UNIQUEIDENTIFIER NOT NULL,
    PerformedByUserId UNIQUEIDENTIFIER NOT NULL,
    Description NVARCHAR(500),
    QuantityAfter DECIMAL(18,2),
    UnitAfterId UNIQUEIDENTIFIER,
    Location NVARCHAR(200),
    PreviousHash VARCHAR(500),
    CurrentHash VARCHAR(500),
    EventTime DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
```

**Ví dụ cấu trúc cấu hình động cho `Harvest Event` lưu tại trường `EventData`:**

```json
{
  "temperature": 25,
  "farm": "Da Lat",
  "worker": 10
}
```

---

## 9. Hash Chain Mechanism

### 9.1 Nguyên lý bảo mật dữ liệu

Để đảm bảo tính toàn vẹn dữ liệu tối cao mà không cần vận hành một mạng lưới Blockchain phức tạp, hệ thống áp dụng cơ chế chuỗi mã hóa liên kết ngược **SHA-256 Hash Chain** ngay trong cơ sở dữ liệu quan hệ.

### 9.2 Luồng liên kết mã băm (Hash Logic)

Mỗi sự kiện được thêm vào chuỗi bắt buộc phải mang theo mã băm của sự kiện liền trước nó trong cùng một lô hàng (`BatchId`).

```text
[Event 1: HARVEST]     ───► CurrentHash: AAA111
                                   │
                                   ▼
[Event 2: PROCESSING]  ───► PreviousHash: AAA111  ───► CurrentHash: BBB222
                                                               │
                                                               ▼
[Event 3: TRANSPORT]   ───► PreviousHash: BBB222  ───► CurrentHash: CCC333
```

### 9.3 Công thức tính toán

Mã băm hiện tại được tạo lập bằng cách mã hóa tổng chuỗi ký tự của mã băm cũ kết hợp cùng toàn bộ dữ liệu trọng tải của sự kiện mới:

$$\text{CurrentHash} = \text{SHA256}(\text{PreviousHash} + \text{EventData})$$

### 9.4 Quy tắc hệ thống (Immutable Rules)

Bảng sự kiện tuân thủ nghiêm ngặt chỉ cho phép hành vi `INSERT`. Bất kỳ hành vi can thiệp thô nhằm `UPDATE` hoặc `DELETE` một bản ghi sự kiện trong quá khứ sẽ làm sai lệch chuỗi giá trị mã hóa liên tầng ($H_{\text{old}} \neq H_{\text{new}}$). Hệ thống sẽ ngay lập tức phát hiện chuỗi băm bị đứt gãy (`Hash Chain Broken`) và đưa ra cảnh báo gian lận dữ liệu.

---

## 10. Batch Split Management

### 10.1 Nghiệp vụ tách lô

Áp dụng khi một lô hàng lớn (ví dụ: lô nguyên liệu thô nhập kho) được chia nhỏ thành nhiều lô thành phẩm hoặc bán thành phẩm để vận chuyển tới các đơn vị bán lẻ khác nhau. Tác nhân thực hiện thường thuộc nhóm `Processor` hoặc `Distributor`.

### 10.2 Luồng xử lý dữ liệu (Split Flow)

1. Chọn Lô cha cần tách (`Parent Batch`).
2. Nhập số lượng mong muốn cho lô con và kiểm tra điều kiện kiểm soát: $\text{Quantity}_{\text{child}} \le \text{RemainingQuantity}_{\text{parent}}$.
3. Kích hoạt sự kiện nghiệp vụ `SPLIT`.
4. Hệ thống tự động trừ `RemainingQuantity` của lô cha, khởi tạo các bản ghi lô con mới tương ứng kèm mã QR độc lập.

### 10.3 Cấu trúc cơ sở dữ liệu phân tách lô

#### Bảng `BatchSplits`

```sql
CREATE TABLE BatchSplits
(
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    ParentBatchId UNIQUEIDENTIFIER NOT NULL,
    EventId UNIQUEIDENTIFIER NOT NULL,
    CreatedBy UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
```

#### Bảng `BatchSplitDetails`

```sql
CREATE TABLE BatchSplitDetails
(
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    SplitId UNIQUEIDENTIFIER NOT NULL,
    ChildBatchId UNIQUEIDENTIFIER NOT NULL,
    Quantity DECIMAL(18,2) NOT NULL
);
```

---

## 11. Batch Merge Management

### 11.1 Nghiệp vụ gộp lô

Áp dụng khi nhiều lô con (cùng một sản phẩm) được gộp thành một lô mới để vận chuyển hoặc chế biến tiếp. Tác nhân thực hiện thường thuộc nhóm `Processor` hoặc `Distributor`.

**Ví dụ kịch bản gộp lô:**

```text
Apple A (Batch) ──┐
                  ├───[ Merge ]───► Apple C (New Batch)
Apple B (Batch) ──┘
```

### 11.2 Cấu trúc cơ sở dữ liệu gộp lô

#### Bảng `BatchMerges`

```sql
CREATE TABLE BatchMerges
(
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    NewBatchId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
```

#### Bảng `BatchMergeSources`

```sql
CREATE TABLE BatchMergeSources
(
    BatchMergeId UNIQUEIDENTIFIER,
    SourceBatchId UNIQUEIDENTIFIER,
    Quantity DECIMAL(18,2),

    PRIMARY KEY (BatchMergeId, SourceBatchId)
);
```

---

## 12. Quality Inspection

Bảng `QualityInspections` lưu kết quả kiểm định chất lượng của một lô hàng do đơn vị `INSPECTION` thực hiện.

```sql
CREATE TABLE QualityInspections
(
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    BatchId UNIQUEIDENTIFIER NOT NULL,
    InspectorId UNIQUEIDENTIFIER NOT NULL,
    Status INT,
    Result NVARCHAR(500),
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),

    FOREIGN KEY(BatchId) REFERENCES Batches(Id),
    FOREIGN KEY(InspectorId) REFERENCES Users(Id)
);
```

---

## 13. Certificate Management

Bảng `Certificates` lưu trữ chứng chỉ hợp quy / quality certificate đính kèm với lô hàng hoặc kết quả kiểm định.

```sql
CREATE TABLE Certificates
(
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    BatchId UNIQUEIDENTIFIER NOT NULL,
    InspectionId UNIQUEIDENTIFIER NULL,
    CertificateType NVARCHAR(100),
    FileUrl VARCHAR(500),
    IssuedDate DATETIME2,

    FOREIGN KEY(BatchId) REFERENCES Batches(Id),
    FOREIGN KEY(InspectionId) REFERENCES QualityInspections(Id)
);
```

---

## 14. Recall Management

Bảng `Recalls` quản lý lệnh thu hồi nông sản khi phát hiện rủi ro an toàn thực phẩm.

```sql
CREATE TABLE Recalls
(
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    BatchId UNIQUEIDENTIFIER NOT NULL,
    CreatedBy UNIQUEIDENTIFIER NOT NULL,
    Reason NVARCHAR(500),
    Severity INT,
    Status INT,
    CreatedAt DATETIME2 DEFAULT GETDATE(),

    FOREIGN KEY(BatchId) REFERENCES Batches(Id),
    FOREIGN KEY(CreatedBy) REFERENCES Users(Id)
);
```

**Mức độ nghiêm trọng (Severity):** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.

---

## 15. Public Traceability

Người tiêu dùng (`Consumer`) không cần đăng nhập, chỉ quét mã QR $\rightarrow$ mở Public URL $\rightarrow$ hệ thống tải lịch sử `Batches`, `SupplyChainEvents`, `QualityInspections`, `Certificates`, `Recalls` và hiển thị dòng thời gian truy xuất (`Timeline`). Toàn bộ truy vấn ở tầng này là **Read-only**.

---

## 16. Notification

Bảng `Notifications` dùng để thông báo (ví dụ: khi có lệnh `Recall`) tới các User / Organization liên quan.

```sql
CREATE TABLE Notifications
(
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    UserId UNIQUEIDENTIFIER,
    Title NVARCHAR(200),
    Message NVARCHAR(MAX),
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),

    FOREIGN KEY(UserId) REFERENCES Users(Id)
);
```

---

## 17. Main Business Processes

| BP | Tên | Actor | Database liên quan |
| --- | --- | --- | --- |
| BP01 | User Authentication | User | Users, RefreshTokens |
| BP02 | Organization Management | Admin | Organizations, Users, OrganizationTypes |
| BP03 | Product Management | Manager | Products, Categories, Units |
| BP04 | Batch Creation | Farmer / Staff (FARM) | Batches, SupplyChainEvents |
| BP05 | Supply Chain Event Management | Staff, Farmer | SupplyChainEvents |
| BP06 | Batch Split | Staff | Batches, BatchSplits, BatchSplitDetails, SupplyChainEvents |
| BP07 | Batch Merge | Staff | Batches, BatchMerges, BatchMergeSources, SupplyChainEvents |
| BP08 | Quality Inspection | Inspector | QualityInspections, Certificates |
| BP09 | Product Recall | Admin, Inspector | Recalls, Notifications |
| BP10 | Public Traceability | Consumer | Batches, SupplyChainEvents, QualityInspections, Certificates, Recalls |

**BP05 - Supply Chain Event Management** (luồng chung):

1. Scan QR / Tìm Batch.
2. Validate Permission (Layer 1 + Layer 2).
3. Select Event Type.
4. Input Event Data.
5. Generate Previous Hash (từ event gần nhất).
6. Generate Current Hash.
7. Save Event (Append-only).
8. Update Batch Status.

---

## 18. Database Schema Overview

### 18.1 Units (Đơn vị tính) — Đã cập nhật

Bảng `Units` lưu danh mục đơn vị tính dùng để định lượng `Product` và `Batch`. Đơn vị được phân loại theo `Category` và có hệ số quy đổi (`ConversionToBase`) về đơn vị cơ sở của nhóm để hỗ trợ tính toán đồng nhất (vd: trọng lượng quy về Kilogram, thể tích quy về Liter).

```sql
CREATE TABLE Units
(
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Code VARCHAR(20) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255) NULL,
    Symbol NVARCHAR(20) NULL,
    Category INT NOT NULL,
    ConversionToBase DECIMAL(18,6) NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT UQ_Units_Code UNIQUE (Code)
);
```

**UnitCategory (enum):**

| Giá trị | Mô tả |
| --- | --- |
| `Weight = 1` | Khối lượng (kg, g, tấn, bao) |
| `Volume = 2` | Thể tích (lít, mL) |
| `Count = 3` | Đếm số lượng (thùng, bó, cái) |
| `Length = 4` | Chiều dài |
| `Area = 5` | Diện tích |
| `Other = 99` | Khác |

**Dữ liệu mẫu (Seed):**

| Code | Name | Symbol | Category | ConversionToBase |
| --- | --- | --- | --- | --- |
| `KG` | Kilogram | kg | Weight | 1 |
| `GRAM` | Gram | g | Weight | 0.001 |
| `LITER` | Liter | L | Volume | 1 |
| `MILLILITER` | Milliliter | mL | Volume | 0.001 |
| `BOX` | Box | box | Count | 1 |
| `BALE` | Bale | bale | Count | 1 |
| `PIECE` | Piece | pc | Count | 1 |
| `TON` | Metric Ton | t | Weight | 1000 |
| `SACK` | Sack | sack | Weight | 50 |

> Quy tắc: Các đơn vị đã phát sinh giao dịch **không được xóa**, chỉ chuyển `IsActive = 0`.

### 18.2 ERD Tổng Quan

```text
OrganizationTypes
       │
       ▼
 Organizations
       │
       ▼
     Users

Organizations
       │
       ▼
    Products ──► Units / Categories
       │
       ▼
    Batches ◄─── BatchSplits / BatchMerges
       │
       ├─► SupplyChainEvents
       ├─► QualityInspections ──► Certificates
       └─► Recalls

    Users ──► Notifications
```

---

## 19. Business Rules

* **Batch Rule:** Một Batch thuộc về một Product, một Current Organization, có một QR Code.
* **Event Rule:** Một Event thuộc về một Batch, một Organization, một User, một EventType. Không được `UPDATE` / `DELETE`.
* **Hash Chain Rule:** Nếu sửa Event trước $\rightarrow$ **Hash chain broken**.
* **Unit Rule:** Đơn vị không xóa mà chuyển `IsActive = 0` khi đã có giao dịch.
* **Split Rule:** $\text{Quantity}_{\text{child}} \le \text{RemainingQuantity}_{\text{parent}}$.
* **Merge Rule:** Các lô nguồn phải cùng Product mới được gộp.

---

## 20. API Mapping Recommendation

| Business Process | Đề xuất Endpoint |
| --- | --- |
| BP01 Authentication | `POST /api/auth/login` |
| BP02 Organization | `POST/GET/PUT /api/organizations` |
| BP03 Product | `POST/GET /api/products`, `/api/categories`, `/api/units` |
| BP04 Batch Creation | `POST /api/batches` |
| BP05 Event | `POST /api/batches/{id}/events` |
| BP06 Split | `POST /api/batches/{id}/split` |
| BP07 Merge | `POST /api/batches/merge` |
| BP08 Inspection | `POST /api/inspections` |
| BP09 Recall | `POST /api/recalls` |
| BP10 Public Trace | `GET /api/public/trace/{qrCode}` |
