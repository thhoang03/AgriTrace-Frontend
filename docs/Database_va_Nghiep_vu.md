Database_Va_NghiepVu_v4.md

1. Overview
2. Business Actors & Roles
3. Organization Model
4. Authentication & Authorization
5. Product Management
6. Batch Management
7. Supply Chain Event Management
8. Hash Chain Mechanism
9. Batch Split
10. Batch Merge
11. Quality Inspection
12. Certificate Management
13. Recall Management
14. Public Traceability
15. Notification
16. Database Schema Overview
17. Business Rules
18. API Mapping Recommendation
19. Clean Architecture Mapping

Database & Business Specification
Agricultural Supply Chain Traceability System
Version 4.0

Database: AgriTraceabilityDB
DBMS: SQL Server 2022
Architecture: Clean Architecture + DDD
Backend: ASP.NET Core Web API (.NET 8)
Frontend: React TypeScript

1. Overview
1.1 System Description

Agricultural Supply Chain Traceability System là hệ thống quản lý truy xuất nguồn gốc nông sản xuyên suốt chuỗi cung ứng.

Hệ thống quản lý vòng đời của một Batch (lô hàng):

Farm

↓

Processing

↓

Packaging

↓

Transportation

↓

Distribution

↓

Retail

↓

Consumer

Mỗi Batch được tạo ra sẽ có:

Unique Batch Code
QR Code
Supply Chain Timeline

Mọi hoạt động tác động lên Batch sẽ tạo ra một:

SupplyChainEvent

Ví dụ:

Farmer harvest tomato

        ↓

Event:
HARVEST


        ↓

Processor receives


        ↓

Event:
RECEIVE


        ↓

Distributor transport


        ↓

Event:
TRANSPORT

1.2 Main Objectives

Hệ thống có các mục tiêu chính:

1. Traceability

Cho phép người tiêu dùng:

Scan QR Code

↓

View complete product history

Thông tin bao gồm:

Farm origin
Harvest date
Processing history
Transportation history
Inspection result
Certificate
Recall status
2. Data Integrity

Lịch sử Supply Chain Event:

Không được sửa
Không được xoá

Áp dụng:

Append-only Event History

Mỗi event được bảo vệ bằng:

SHA-256 Hash Chain

3. Supply Chain Management

Hỗ trợ các bên:

Farmer
Processor
Distributor
Retailer
Inspector

ghi nhận hoạt động trong chuỗi.

4. Product Safety

Hỗ trợ:

Quality Inspection
Certificate
Recall
Notification
2. Business Actors
2.1 System Admin
Description

Người quản trị toàn hệ thống.

Responsibilities
Manage organizations
Manage users
Manage roles
Manage lookup data
Create recall
Monitor system

Example:

Admin creates a new farm organization

↓

Assign Organization Admin

2.2 Organization Admin
Description

Quản trị viên của một tổ chức trong chuỗi cung ứng.

Ví dụ:

Farm ABC

Processor XYZ

Distributor DEF

Responsibilities
Manage employees
Manage products
Manage batches
View reports

Không trực tiếp thực hiện event nghiệp vụ.

2.3 Staff
Description

Nhân viên thực hiện nghiệp vụ tại tổ chức.

Đây là role chung.

Không tạo Role:

Farmer

Distributor

Processor

vì đây là:

Organization Type

Ví dụ:

User:

Role:

Staff


Organization:

ABC Farm


Organization Type:

FARM


=> Người này là Farmer.

2.4 Inspector
Description

Đơn vị kiểm định chất lượng.

Responsibilities:

Perform inspection
Upload certificates
Create inspection report
2.5 Consumer
Description

Người tiêu dùng cuối.

Đặc điểm:

Không cần đăng nhập
Read only

Flow:

Scan QR

↓

Public Traceability

↓

View Timeline

3. Organization Model
3.1 Organization Types

Organization Type đại diện cho vị trí trong chuỗi cung ứng.

Table:

OrganizationTypes

Values:

Code	Description
FARM	Nông trại
PROCESSOR	Cơ sở sơ chế
DISTRIBUTOR	Nhà phân phối
RETAILER	Cửa hàng bán lẻ
INSPECTION	Đơn vị kiểm định
SYSTEM	Hệ thống
3.2 Organization

Một Organization đại diện cho một đơn vị tham gia chuỗi.

Example:

Organization

Farm ABC


Type:

FARM


Database:

Organizations

Id

OrganizationTypeId

Name

Address

CreatedAt

3.3 User Relationship

Quan hệ:

Organization


      |

      |

     Users



Một user:

Thuộc một organization
Có một role

Ví dụ:

Nguyen Van A


Role:

Staff


Organization:

Farm ABC


4. Authentication & Authorization
4.1 Authentication

Sử dụng:

JWT Authentication


Flow:

User Login

↓

Validate Email Password

↓

Generate Access Token

↓

Generate Refresh Token

↓

Return User Information

4.2 Authorization

Có 2 lớp permission:

Layer 1: Role Permission

Ví dụ:

SystemAdmin

OrganizationAdmin

Staff

Inspector

Layer 2: Organization Event Permission

Kiểm tra:

OrganizationType

+

EventType


Ví dụ:

Farmer:

Allowed:

HARVEST

Distributor:

Allowed:

RECEIVE

TRANSPORT

DISTRIBUTION

SPLIT

MERGE

5. Database Core Design

Database gồm các nhóm:

Identity
Users

Roles

RefreshTokens

Organization
Organizations

OrganizationTypes

OrganizationTypeEvents

Product
Categories

Products

UnitTypes

Units

Traceability Core
Batches

SupplyChainEvents

Advanced
BatchSplits

BatchSplitDetails

BatchMerges

BatchMergeSources

Quality
QualityInspections

Certificates

System
Recalls

Notifications

6. Product Management
6.1 Purpose

Product Management quản lý danh mục sản phẩm nông nghiệp được tham gia vào chuỗi cung ứng.

Ví dụ:

Category:

Vegetable


Product:

Tomato


Unit:

Kg

6.2 Category

Category đại diện cho nhóm sản phẩm.

Ví dụ:

Category	Example
Vegetable	Tomato
Fruit	Mango
Rice	Jasmine Rice

Database:

Categories

Id

Name

Description


Business Rule:

Một Category có nhiều Product.
Product chỉ thuộc một Category.

Relationship:

Category

   |

   | 1 - N

   |

Product

6.3 Product

Product đại diện cho loại nông sản.

Ví dụ:

Product:

Fresh Tomato


Category:

Vegetable


Unit:

Kg


Database:

Products


Id

OrganizationId

CategoryId

UnitId

Name

CreatedAt


Business Rule:

Product thuộc một Organization.

Ví dụ:

Farm ABC

 |

Tomato Product

Product không thay đổi trong suốt vòng đời Batch.
6.4 Unit Management

Hệ thống hỗ trợ đơn vị đo:

Ví dụ:

Kg

Ton

Box

Package


Database:

UnitTypes

Units


Ví dụ:

UnitType:

Weight


Units:

Kilogram

kg


Ton

t


Business Rule:

Không xoá Unit đã được sử dụng.
Chỉ deactivate.

Ví dụ:

Unit

Kg


Status:

Inactive

7. Batch Management
7.1 Batch Definition

Batch là thực thể trung tâm của hệ thống.

Một Batch đại diện cho một lô hàng vật lý trong chuỗi cung ứng.

Ví dụ:

Batch:

TOMATO-2026-001


Product:

Tomato


Quantity:

500 KG


QR:

https://system.com/trace/TOMATO-2026-001

7.2 Batch Lifecycle

Luồng tổng quát:

Farmer


↓

Create Batch


↓

Generate QR Code


↓

Harvest Event


↓

Processing


↓

Transportation


↓

Distribution


↓

Retail


↓

Consumer Scan QR

7.3 Batch Creation Process

Actor:

Staff

Organization Type:

FARM


Flow:

Input Product

↓

Input Harvest Date

↓

Input Quantity

↓

Select Unit

↓

Generate Batch Code

↓

Generate QR Code

↓

Save Batch

↓

Create HARVEST Event

7.4 Batch Database

Table:

Batches


Structure:

Id


ProductId


CreatedOrganizationId


CurrentOrganizationId


BatchCode


QRCode


Quantity


UnitId


RemainingQuantity


Status


ParentBatchId


RootBatchId


HarvestDate


ExpirationDate


CreatedAt

7.5 Batch Fields Explanation
BatchCode

Mã duy nhất của Batch.

Ví dụ:

TOMATO-20260707-001


Rule:

UNIQUE

NOT NULL

QRCode

Lưu URL truy xuất.

Ví dụ:

https://agri.com/trace/abc123


Consumer:

Scan QR

↓

Open URL

↓

Load Timeline

Quantity

Số lượng ban đầu.

Ví dụ:

500 KG


Rule:

Không thay đổi.

Sai:

UPDATE Quantity = 400


Đúng:

Tạo Event:

PROCESSING

QuantityAfter = 400

RemainingQuantity

Số lượng còn lại dùng cho Split.

Ví dụ:

Batch:

500 KG


Split:

200 KG

+

300 KG


Remaining:

0 KG

CurrentOrganizationId

Tổ chức đang giữ Batch.

Ví dụ:

Ban đầu:

Farm ABC


Sau vận chuyển:

Distributor XYZ


Update:

CurrentOrganizationId

8. Supply Chain Event Management
8.1 Event Definition

SupplyChainEvent là bản ghi lịch sử của mọi hoạt động xảy ra với Batch.

Ví dụ:

Farm harvest tomato


=

Event:


HARVEST

Distributor transports tomato


=

Event:


TRANSPORT

8.2 Event Types

Table:

EventTypes


Danh sách:

Event	Meaning
HARVEST	Thu hoạch
RECEIVE	Nhận hàng
PROCESSING	Sơ chế
PACKAGING	Đóng gói
TRANSPORT	Vận chuyển
DISTRIBUTION	Phân phối
RETAIL	Bán lẻ
SALE	Bán hàng
INSPECTION	Kiểm định
SPLIT	Chia lô
MERGE	Gộp lô
RECALL	Thu hồi
8.3 Event Flow

Ví dụ:

Farmer:

Create Batch

↓

Create Event

HARVEST


Processor:

Receive Batch

↓

Create Event

RECEIVE


↓

Process Product


↓

Create Event

PROCESSING


Distributor:

Transport

↓

Create Event

TRANSPORT

8.4 SupplyChainEvent Database

Table:

SupplyChainEvents


Fields:

Id


BatchId


EventTypeId


OrganizationId


PerformedByUserId


Description


QuantityAfter


UnitAfterId


Location


PreviousHash


CurrentHash


EventTime


CreatedAt

9. Hash Chain Mechanism
9.1 Purpose

Đảm bảo lịch sử Batch không bị chỉnh sửa.

Không dùng blockchain thật.

Sử dụng:

SHA-256 Hash Chain

9.2 Hash Logic

Ví dụ:

Batch:

Tomato Batch


Event 1:

HARVEST


CurrentHash:

AAA111


Event 2:

PROCESSING


PreviousHash:

AAA111


CurrentHash:

BBB222


Event 3:

TRANSPORT


PreviousHash:

BBB222


CurrentHash:

CCC333


Chuỗi:

Event1

  |

Hash A

  |

Event2

  |

Hash B

  |

Event3

  |

Hash C

9.3 Hash Formula
CurrentHash

=

SHA256(

PreviousHash

+

EventData

)


Ví dụ:

Input:

PreviousHash:

AAA111


EventData:

{

type:"TRANSPORT",

time:"2026-07-07"

}


Output:

BBB222

9.4 Business Rules

SupplyChainEvent:

Không được:

UPDATE

DELETE


Chỉ:

INSERT


Nếu sửa Event cũ:

Hash Chain Broken


Hệ thống phát hiện.

10. Batch Split Management
10.1 Purpose

Chia một Batch thành nhiều Batch nhỏ hơn.

Ví dụ:

500kg Tomato


       Split


200kg Retail A


300kg Retail B

10.2 Actor

Không phải Farmer.

Actor:

Processor

hoặc

Distributor

10.3 Split Flow
Select Parent Batch


↓

Input Child Quantity


↓

Validate Remaining Quantity


↓

Create Split Event


↓

Create Child Batch


↓

Generate Child QR


↓

Save Split History

10.4 Database
BatchSplits
Id

ParentBatchId

EventId

CreatedBy

CreatedAt

BatchSplitDetails
Id

SplitId

ChildBatchId

Quantity

10.5 Example

Before:

Batch A


Quantity:

500KG


Split:

Batch A

 |

 +--- Batch B 200KG

 |

 +--- Batch C 300KG


Database:

BatchSplit:

Parent:

A


Detail:

A -> B

200KG


A -> C

300KG