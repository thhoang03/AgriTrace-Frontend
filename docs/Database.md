# Database Specification — AgriTraceabilityDB

**Version:** 2.0
**Based on:** `New_DataBase.md` and `Business_Process.md`
**DBMS:** SQL Server 2022
**Script schema:** [`AgriDB.sql`](AgriDB.sql)

---

## 1. Overview

This document describes the simplified, cleaned database design for the Agricultural Supply Chain Traceability System.
The model is intentionally leaner than the previous version and follows the core business process flows:
Organizations, Users, Products, Batches, Supply Chain Events, Inspections, Certificates, Recalls, Notifications, and Batch Relations.

The central entity is `Batches`, which links to immutable `SupplyChainEvents` to preserve traceability and avoid state leakage into event history.

---

## 2. Design Principles

- Use a clean core event model: `SupplyChainEvents` store all history, while `Batches` store current batch metadata.
- Avoid over-engineering: keep the schema simple and aligned with real business entities.
- Support traceability for split and merge operations via explicit `BatchRelations`.
- Keep role and organization typing straightforward using string values.
- Use `INT IDENTITY` for primary keys for performance and simplicity.

---

## 3. Tables

### 3.1. `Organizations`

Stores supply chain participants such as farms, processors, distributors, and retailers.

```sql
CREATE TABLE Organizations (
    Id INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Type NVARCHAR(50) NOT NULL, -- FARM / PROCESSOR / DISTRIBUTOR / RETAILER
    Status NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE / INACTIVE / SUSPENDED
    CreatedAt DATETIME DEFAULT GETDATE()
);
```

Notes:
- `Type` is a simple string classification.
- `Status` indicates whether the organization is active.

---

### 3.2. `Users`

Stores users and their role within the organization.

```sql
CREATE TABLE Users (
    Id INT IDENTITY PRIMARY KEY,
    FullName NVARCHAR(200),
    Email NVARCHAR(200) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(500),
    Role NVARCHAR(50) NOT NULL, -- ADMIN / OrgAdmin/ FARMER / OPERATOR / INSPECTOR
    OrganizationId INT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Users_Organizations FOREIGN KEY (OrganizationId) REFERENCES Organizations(Id)
);
```

Notes:
- Roles are simple string values.
- A user may be linked to an organization or left null for system-level accounts.

---

### 3.3. `Products`

Stores the product catalog owned by organizations.

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

Notes:
- Each product is associated with an organization.
- Category and unit are kept as simple strings.

---

### 3.4. `Batches`

Represents physical batches of product with QR code tracking.

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

Notes:
- `CurrentOrganizationId` tracks the current holder of the batch.
- `ParentBatchId` and `RootBatchId` support split lineage.
- `QRCode` stores the batch QR code or trace URL.

---

### 3.5. `BatchImages`

Stores images attached to batches for visual traceability.

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

Notes:
- Each batch can have multiple images.
- `EventId` optionally links an image to a specific supply chain event.
- `DisplayOrder` controls the order of image display in the UI.

---

### 3.6. `SupplyChainEvents`

Stores immutable event history for batches.

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

Notes:
- Events are append-only.
- `PreviousHash` / `CurrentHash` support tamper detection.
- `EventData` may hold event-specific details in JSON or plain text.

---

### 3.7. `Inspections`

Stores quality inspection records.

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

Notes:
- Inspections are linked to batches and inspector users.

---

### 3.8. `Certificates`

Stores certification documents attached to batches.

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

Notes:
- `InspectionId` is optional for externally issued certificates.

---

### 3.9. `Recalls`

Stores product recall events.

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

Notes:
- Recalls are attached to batches for downstream visibility.

---

### 3.10. `Notifications`

Stores user notifications.

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

---

### 3.11. `BatchRelations`

Models split and merge relationships between batches.

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

Notes:
- `RelationType` indicates whether the relation is a `SPLIT` or `MERGE`.
- This table preserves lineage without putting complex state into `Batches`.

---

## 4. Summary of changes from previous design

- Simplified primary keys to `INT IDENTITY`.
- Kept roles and organization types as string values instead of multiple lookup tables.
- Separated immutable event history from batch metadata.
- Added explicit batch relation table for split/merge.
- Removed extra lookup tables and overly normalized constructs.

---

## 5. Recommended usage

- Use `Organizations.Type` to control business process behavior.
- Use `Users.Role` to manage permissions and UI behavior.
- Record every batch lifecycle action in `SupplyChainEvents`.
- Use `BatchRelations` for split/merge lineage, while keeping `Batches` as the current batch entity.
