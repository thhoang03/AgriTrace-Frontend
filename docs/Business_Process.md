# Agricultural Supply Chain Traceability System

## Business Process Specification

Version: 2.0 (BA Fixed Edition)

---

# 1. Overview

The Agricultural Supply Chain Traceability System records the complete lifecycle of an agricultural product batch from farm to consumer.

Each batch has a unique QR Code.

Every operation performed on a batch creates an immutable Supply Chain Event.

SupplyChainEvents are append-only and cannot be modified or deleted.

The integrity of the event timeline is ensured using a SHA-256 Hash Chain mechanism.

---

# 2. Actors

## 2.1 System Admin

System governance and control.

Responsibilities:

- Manage users and roles
- Manage organizations
- Manage system configuration data
- Create and manage recall events
- Monitor system activities

---

## 2.2 Farmer (Producer)

Initial stage of the supply chain.

Responsibilities:

- Create agricultural batch
- Record harvest information
- Transfer batch to supply chain operator

---

## 2.3 Supply Chain Operator

Handles processing and logistics.

Responsibilities:

- Receive batches
- Process and package products
- Transport and distribute batches
- Record supply chain events
- Perform batch split and merge operations

---

## 2.4 Inspector

Quality assurance authority.

Responsibilities:

- Perform quality inspection
- Record inspection results
- Upload certificates (VietGAP, GlobalGAP, Organic, ISO)
- Approve or reject batch quality

---

## 2.5 Consumer

End user.

Responsibilities:

- Scan QR Code
- View full traceability timeline
- View certificates and recall status

Consumer does not require authentication.

---

# 3. Main Business Processes

The system consists of the following major business processes:

1. User Authentication
2. Organization Management
3. Product Management
4. Batch Management
5. Supply Chain Event Management
6. Batch Split
7. Batch Merge
8. Quality Inspection
9. Certificate Management
10. Product Recall
11. Public Traceability
12. Notification

---

# 4. Business Process Descriptions

## 4.1 User Authentication

Goal: Authenticate users using JWT.

Flow:

Login
↓
Validate credentials
↓
Generate access token
↓
Generate refresh token
↓
Return user information

Alternative:

Invalid credentials → Unauthorized response

---

## 4.2 Organization Management

Actor: System Admin

Flow:

Create organization
↓
Define organization type
↓
Assign admin user
↓
Activate organization

Outputs:

- Organization
- Admin User

---

## 4.3 Product Management

Actor: System Admin / Organization Admin (optional simplification)

Flow:

Create category
↓
Create product
↓
Assign unit
↓
Activate product

Outputs:

- Product catalog

---

## 4.4 Batch Management

Actor: Farmer

Flow:

Select product
↓
Input harvest information
↓
Input quantity
↓
Generate batch code
↓
Generate QR code
↓
Save batch

Outputs:

- Batch
- QR Code

---

## 4.5 Supply Chain Event Management

Actor: Supply Chain Operator

Flow:

Scan QR Code
↓
Find batch
↓
Select event type
↓
Input event details
↓
Generate previous hash
↓
Generate current hash
↓
Save event
↓
Update timeline

Rules:

- Append-only
- No update/delete allowed
- Hash chain ensures integrity

---

## 4.6 Batch Split

Actor: Operator

Flow:

Select batch
↓
Define split quantities
↓
Create child batches
↓
Record split event
↓
Generate new QR codes

---

## 4.7 Batch Merge

Actor: Operator

Flow:

Select multiple batches
↓
Define merge quantity
↓
Create merged batch
↓
Record merge event
↓
Generate new QR code

---

## 4.8 Quality Inspection

Actor: Inspector

Flow:

Select batch
↓
Perform inspection
↓
Record result
↓
Upload attachments

---

## 4.9 Certificate Management

Actor: Inspector

Flow:

Select batch
↓
Select inspection
↓
Upload certificate
↓
Attach to batch

---

## 4.10 Product Recall

Actor: System Admin / Inspector

Flow:

Select batch
↓
Create recall
↓
Define severity
↓
Notify stakeholders
↓
Update public traceability

---

## 4.11 Public Traceability

Actor: Consumer

Flow:

Scan QR
↓
Open public page
↓
Load batch
↓
Load events timeline
↓
Load inspections
↓
Load certificates
↓
Display full history

---

## 4.12 Notification

Actor: System

Trigger events:

- Recall created
- Inspection completed
- Certificate issued
- Batch updated

Flow:

System event triggered
↓
Identify affected users
↓
Create notifications
↓
User views notifications

---

# 5. Core Business Rules

## Batch Rules

- Each batch belongs to one product
- Each batch belongs to one current operator
- Batch may have parent/root batch

## Supply Chain Event Rules

- One batch → many events
- Events are append-only
- No update or delete

---

# End of Document


Save Event

↓

Update Timeline

Outputs

SupplyChainEvent

Important Rules

Events are Append-only.

Events cannot be updated.

Events cannot be deleted.

Every event references the previous event using PreviousHash.

---

# Business Process 6
## Batch Split

Actor

Operator

Goal

Split one batch into multiple batches.

Flow

Select Parent Batch

↓

Input Child Quantities

↓

Create Child Batch

↓

Create Split Event

↓

Generate New QR Codes

↓

Update Remaining Quantity

Outputs

Parent Batch

Child Batches

Business Rules

The total child quantity must not exceed the remaining quantity of the parent batch.

Parent batch remains in the system.

Every child batch stores ParentBatchId and RootBatchId.

---

# Business Process 7
## Batch Merge

Actor

Operator

Goal

Merge multiple batches into one batch.

Flow

Select Source Batches

↓

Input Quantity

↓

Create Merge Event

↓

Create Result Batch

↓

Generate QR Code

↓

Save Merge Information

Outputs

Merged Batch

Business Rules

Source batches remain in history.

Merge relationship is stored in BatchMergeSources.

Timeline remains traceable.

---

# Business Process 8
## Quality Inspection

Actor

Inspector

Goal

Record product quality.

Flow

Select Batch

↓

Perform Inspection

↓

Input Result

↓

Upload Attachment

↓

Save Inspection

Outputs

Quality Inspection

Business Rules

Inspection history cannot be deleted.

Multiple inspections are allowed.

---

# Business Process 9
## Certificate Management

Actor

Inspector

Goal

Attach certificates to batches.

Flow

Select Batch

↓

Select Inspection

↓

Upload Certificate

↓

Save Certificate

Outputs

Certificate

Examples

VietGAP

GlobalGAP

Organic

ISO

---

# Business Process 10
## Product Recall

Actors

Admin

Inspector

Goal

Recall unsafe products.

Flow

Select Batch

↓

Input Recall Reason

↓

Select Severity

↓

Create Recall

↓

Notify Related Organizations

↓

Notify Consumers

Outputs

Recall

Notification

Business Rules

Recall never deletes batch history.

Recall status is visible in Public Traceability.

---

# Business Process 11
## Public Traceability

Actor

Consumer

Goal

Display complete product history.

Flow

Scan QR

↓

Open Public URL

↓

Find Batch

↓

Load Timeline

↓

Load Certificates

↓

Load Inspections

↓

Load Split History

↓

Load Merge History

↓

Display Timeline

Outputs

Complete Traceability Information

Consumer permissions

Read only.

No login required.

---

# Business Process 12
## Notification

Actors

System

Goal

Notify users.

Trigger Events

Recall Created

Inspection Completed

Certificate Expired

Batch Received

Batch Delivered

Flow

Business Event

↓

Find Related Users

↓

Create Notification

↓

User Login

↓

Read Notification

Outputs

Notification

---

# 4. Core Business Rules

## Batch

A Batch belongs to exactly one Product.

A Batch belongs to one current Organization.

A Batch may have one Parent Batch.

A Batch may have one Root Batch.

---

## SupplyChainEvent

Every Event belongs to exactly one Batch.

Every Event belongs to one EventType.

Every Event belongs to one Organization.

Every Event belongs to one User.

Events are Append-only.

No Update.

No Delete.

---

## Hash Chain

Every Event stores

PreviousHash

CurrentHash

CurrentHash = SHA256

PreviousHash + EventData

Any modification invalidates the chain.

---

## Quality Inspection

One Batch

↓

Many Inspections

---

## Certificate

One Batch

↓

Many Certificates

---

## Recall

One Batch

↓

Zero or Many Recalls

---

# 5. System Workflow

Farmer

↓

Create Batch

↓

Generate QR

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

Consumer Scan QR

↓

Display Timeline

↓

Quality Inspection

↓

Certificate

↓

Recall (if required)

↓

Notification

---

# 6. Non-functional Rules

Append-only Event History

SHA-256 Hash Chain

Role-based Authorization

JWT Authentication

REST API

Clean Architecture

EF Core

SQL Server

Redis Cache

Docker Deployment

---

# End of Document