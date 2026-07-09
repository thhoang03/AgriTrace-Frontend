Agricultural Supply Chain Traceability System
Business Process Specification
Version 2.0
1. System Overview

Hệ thống quản lý toàn bộ vòng đời của một lô nông sản từ:

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


Mỗi Batch có:

Batch Code duy nhất
QR Code
Product
Current Organization
Supply Chain Timeline

Mọi hoạt động tạo ra một:

SupplyChainEvent


Event:

Không update
Không delete
Append-only

Tính toàn vẹn dùng:

SHA-256 Hash Chain

2. Actors (FIX)
2.1 System Admin

Quản trị toàn hệ thống.

Responsibilities:

Quản lý Organization
Quản lý User
Quản lý Role
Quản lý Event Type
Tạo Recall
Monitor system

Database:

Users
Organizations
EventTypes

2.2 Organization Admin

Đại diện quản lý một doanh nghiệp.

Ví dụ:

Da Lat Farm

Vin Distribution

ABC Retail


Responsibilities:

Quản lý nhân viên trong tổ chức
Quản lý sản phẩm
Quản lý Batch
Xem báo cáo

Database:

Products

Batches

Users

2.3 Farmer

Đã tách riêng.

Không phải Operator.

Responsibilities:

Tạo Batch mới
Nhập thông tin thu hoạch
Tạo Harvest Event

Ví dụ:

Harvest tomato 1000kg

Generate QR


Database:

Batches

SupplyChainEvents

2.4 Operator

Nhân viên vận hành trong Processor / Distributor / Retailer.

Ví dụ:

Nhân viên kho.

Responsibilities:

Receive Batch
Processing Event
Packaging Event
Transport Event
Distribution Event
Split Batch
Merge Batch

Database:

SupplyChainEvents

BatchSplits

BatchMerges

2.5 Inspector

Người kiểm định.

Responsibilities:

Kiểm tra chất lượng
Upload certificate
Tạo inspection report

Database:

QualityInspections

Certificates

2.6 Consumer

Không login.

Responsibilities:

Scan QR
View timeline
View certificate
View recall

Database:

Read only:

Batches

Events

Certificates

Recalls

3. Main Business Processes

Anh sửa lại còn 10 process chính.

Không nên chia nhỏ quá vì đề yêu cầu:

Main Business Processes

BP01 - User Authentication

Actor:

System User


Flow:

Login

↓

Input Email Password

↓

Validate

↓

Generate JWT Access Token

↓

Generate Refresh Token

↓

Return User Profile


Database:

Users

BP02 - Organization Management

Actor:

System Admin


Flow:

Create Organization

↓

Select Organization Type

(FARM/PROCESSOR/DISTRIBUTOR/RETAILER)

↓

Create Organization Admin

↓

Activate Organization


Output:

Organization

User


Database:

Organizations

Users

OrganizationTypes

BP03 - Product Management

Actor:

Organization Admin


Flow:

Create Category

↓

Create Unit

↓

Create Product

↓

Assign Product Owner Organization

↓

Product Available


Database:

Products

Categories

Units

BP04 - Batch Creation

Actor:

Farmer


Flow:

Create Batch

↓

Select Product

↓

Input Harvest Date

↓

Input Quantity

↓

Generate Batch Code

↓

Generate QR Code

↓

Save Batch

↓

Create Harvest Event


Database:

Batches

SupplyChainEvents

BP05 - Supply Chain Event Management ⭐

Actor:

Operator

Farmer


Flow:

Scan QR

↓

Find Batch

↓

Validate Permission

↓

Select Event Type

↓

Input Event Data

↓

Generate Previous Hash

↓

Generate Current Hash

↓

Save Event

↓

Update Batch Status


Example:

Farmer:

HARVEST


Processor:

PROCESSING

PACKAGING


Distributor:

TRANSPORT

DISTRIBUTION


Retail:

RETAIL


Database:

SupplyChainEvents

BP06 - Batch Split

Actor:

Operator


Example:

1000kg Rice


Split


400kg Shop A

600kg Shop B


Flow:

Select Batch

↓

Input Split Quantity

↓

Validate Remaining Quantity

↓

Create Child Batch

↓

Create BatchSplit

↓

Create Split Event

↓

Generate QR


Database:

Batches

BatchSplits

BatchSplitDetails

SupplyChainEvents

BP07 - Batch Merge

Actor:

Operator


Example:

Batch A

+

Batch B


=

Batch C


Flow:

Select Source Batches

↓

Validate Same Product

↓

Create New Batch

↓

Create Merge Record

↓

Create Merge Event

↓

Generate QR


Database:

Batches

BatchMerges

BatchMergeSources

SupplyChainEvents

BP08 - Quality Inspection

Actor:

Inspector


Flow:

Select Batch

↓

Perform Inspection

↓

Input Result

↓

Upload Certificate

↓

Save Inspection


Database:

QualityInspections

Certificates

BP09 - Product Recall

Actor:

System Admin

Inspector


Flow:

Select Batch

↓

Input Reason

↓

Select Severity

↓

Create Recall

↓

Find Related Organizations

↓

Send Notification


Database:

Recalls

Notifications

BP10 - Public Traceability

Actor:

Consumer


Flow:

Scan QR

↓

Open Public URL

↓

Find Batch

↓

Load Events

↓

Load Inspection

↓

Load Certificate

↓

Load Recall Status

↓

Display Timeline


Database:

Batches

SupplyChainEvents

QualityInspections

Certificates

Recalls

4. Business Rules (FIX)
Batch Rule

Một Batch:

belongs to one Product

belongs to one Current Organization

has one QR Code

Event Rule

Một Event:

belongs to one Batch

belongs to one Organization

belongs to one User

belongs to one EventType


Không được:

UPDATE

DELETE

Hash Chain Rule

Ví dụ:

Event 1:

CurrentHash = ABC123


Event 2:

PreviousHash = ABC123


CurrentHash = XYZ789


Nếu sửa Event 1:

Hash chain broken

5. Database Mapping Check
Business Process	Database
Login	Users
Organization	Organizations
Product	Products
Batch	Batches
Event	SupplyChainEvents
Split	BatchSplits
Merge	BatchMerges
Inspection	QualityInspections
Certificate	Certificates
Recall	Recalls
Trace	All read tables