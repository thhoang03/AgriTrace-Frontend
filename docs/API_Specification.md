# API Specification — Agricultural Supply Chain Traceability System

**Version:** 1.0
**Base URL:** https://api.agritrace.vn/api/v1
**Format:** REST / JSON
**Encoding:** UTF-8
**Authentication:** JWT Bearer Token

## Mục lục

- [1. Quy ước chung](#1-quy-c%C6%B0%E1%BB%9Bc-chung)
  - [1.1 Request Headers](#11-request-headers)
  - [1.2 Response Format](#12-response-format)
  - [1.3 Pagination](#13-pagination)
  - [1.4 HTTP Status Code](#14-http-status-code)
- [2. Phân quyền (RBAC)](#2-ph%C3%A2n-quy%E1%BB%81n-rbac)
  - [2.1 Danh sách Role](#21-danh-s%C3%A1ch-role)
  - [2.2 Permission Matrix](#22-permission-matrix)
- [3. Xác thực — Auth](#3-x%C3%A1c-th%E1%BB%B7c--auth)
  - [3.1 Đăng nhập](#31-%C4%91%C4%83ng-nh%E1%BA%ADp)
  - [3.2 Refresh Token](#32-refresh-token)
  - [3.3 Logout](#33-logout)
  - [3.4 Lấy thông tin User hiện tại](#34-l%E1%BA%A5y-th%C3%B4ng-tin-user-hi%E1%BB%87n-t%E1%BA%A1i)
- [4. Quản lý tổ chức — Organizations](#4-qu%E1%BA%A3n-l%C3%BD-t%E1%BB%95-ch%E1%BB%A9c--organizations)
  - [4.1 Lấy danh sách tổ chức](#41-l%E1%BA%A5y-danh-s%C3%A1ch-t%E1%BB%95-ch%E1%BB%A9c)
  - [4.2 Xem chi tiết tổ chức](#42-xem-chi-ti%E1%BA%BFt-t%E1%BB%95-ch%E1%BB%A9c)
  - [4.3 Tạo tổ chức](#43-t%E1%BA%A3o-t%E1%BB%95-ch%E1%BB%A9c)
  - [4.4 Cập nhật tổ chức](#44-c%E1%BA%ADp-nh%E1%BA%ADt-t%E1%BB%95-ch%E1%BB%A9c)
  - [4.5 Thay đổi trạng thái](#45-thay-%C4%91%E1%BB%95i-tr%E1%BA%A1ng-th%C3%A1i)
- [5. Quản lý Người dùng — Users](#5-qu%E1%BA%A3n-l%C3%BD-ng%C6%B0%E1%BB%9Di-d%C3%B9ng--users)
  - [5.1 Lấy danh sách người dùng](#51-l%E1%BA%A5y-danh-s%C3%A1ch-ng%C6%B0%E1%BB%9Di-d%C3%B9ng)
  - [5.2 Lấy thông tin chi tiết User](#52-l%E1%BA%A5y-th%C3%B4ng-tin-chi-ti%E1%BA%BFt-user)
  - [5.3 Tạo User mới](#53-t%E1%BA%A3o-user-m%E1%BB%9Bi)
  - [5.4 Cập nhật User](#54-c%E1%BA%ADp-nh%E1%BA%ADt-user)
  - [5.5 Kích hoạt / Vô hiệu hóa tài khoản](#55-k%C3%ADch-ho%E1%BA%A1t--v%C3%B4-hi%E1%BB%87u-h%C3%B3a-t%C3%A0i-kho%E1%BA%A3n)
- [6. Quản lý Danh mục sản phẩm — Categories](#6-qu%E1%BA%A3n-l%C3%BD-danh-m%E1%BB%A5c-s%E1%BA%A3n-ph%E1%BA%A9m--categories)
  - [6.1 Lấy danh sách Category](#61-l%E1%BA%A5y-danh-s%C3%A1ch-category)
  - [6.2 Chi tiết Category](#62-chi-ti%E1%BA%BFt-category)
  - [6.3 Tạo Category](#63-t%E1%BA%A3o-category)
  - [6.4 Cập nhật Category](#64-c%E1%BA%ADp-nh%E1%BA%ADt-category)
  - [6.5 Thay đổi trạng thái Category](#65-thay-%C4%91%E1%BB%95i-tr%E1%BA%A1ng-th%C3%A1i-category)
  - [6.6 Xóa Category](#66-x%C3%B3a-category)
- [7. Quản lý Sản phẩm — Products](#7-qu%E1%BA%A3n-l%C3%BD-s%E1%BA%A3n-ph%E1%BA%A9m--products)
  - [7.1 Danh sách Product](#71-danh-s%C3%A1ch-product)
  - [7.2 Chi tiết Product](#72-chi-ti%E1%BA%BFt-product)
  - [7.3 Tạo Product](#73-t%E1%BA%A3o-product)
  - [7.4 Update Product](#74-update-product)
  - [7.5 Product Status](#75-product-status)
  - [7.6 Delete Product](#76-delete-product)
- [8. Supply Chain Events](#8-supply-chain-events)
  - [8.1 Danh sách Event](#81-danh-s%C3%A1ch-event)
  - [8.2 Chi tiết Event](#82-chi-ti%E1%BA%BFt-event)
  - [8.3 Ghi nhận Event](#83-ghi-nh%E1%BA%ADn-event)
- [9. Quản lý Lô hàng — Batches](#9-qu%E1%BA%A3n-l%C3%BD-l%C3%B4-h%C3%A0ng--batches)
  - [9.1 Danh sách Batch](#91-danh-s%C3%A1ch-batch)
  - [9.2 Chi tiết Batch](#92-chi-ti%E1%BA%BFt-batch)
  - [9.3 Tạo Batch](#93-t%E1%BA%A3o-batch)
  - [9.4 Cập nhật Batch](#94-c%E1%BA%ADp-nh%E1%BA%ADt-batch)
  - [9.5 Thay đổi trạng thái Batch](#95-thay-%C4%91%E1%BB%95i-tr%E1%BA%A1ng-th%C3%A1i-batch)
  - [9.6 QR Code](#96-qr-code)
  - [9.7 Images](#97-images)
- [10. Batch Split & Merge](#10-batch-split--merge)
  - [10.1 Tách Batch](#101-t%C3%A1ch-batch)
  - [10.2 Gộp Batch](#102-g%E1%BB%99p-batch)
- [11. Quality Inspection](#11-quality-inspection)
  - [11.1 Danh sách kiểm định](#111-danh-s%C3%A1ch-ki%E1%BB%83m-%C4%91%E1%BB%8Bnh)
  - [11.2 Chi tiết kiểm định](#112-chi-ti%E1%BA%BFt-ki%E1%BB%83m-%C4%91%E1%BB%8Bnh)
  - [11.3 Tạo kiểm định](#113-t%E1%BA%A3o-ki%E1%BB%83m-%C4%91%E1%BB%8Bnh)
  - [11.4 Cập nhật kiểm định](#114-c%E1%BA%ADp-nh%E1%BA%ADt-ki%E1%BB%83m-%C4%91%E1%BB%8Bnh)
- [12. Certificate](#12-certificate)
  - [12.1 Danh sách chứng nhận](#121-danh-s%C3%A1ch-ch%E1%BB%A9ng-nh%E1%BA%ADn)
  - [12.2 Chi tiết chứng nhận](#122-chi-ti%E1%BA%BFt-ch%E1%BB%A9ng-nh%E1%BA%ADn)
  - [12.3 Cấp chứng nhận](#123-c%E1%BA%A5p-ch%E1%BB%A9ng-nh%E1%BA%ADn)
  - [12.4 Thu hồi chứng nhận](#124-thu-h%E1%BB%93i-ch%E1%BB%A9ng-nh%E1%BA%ADn)
- [13. Recall](#13-recall)
  - [13.1 Danh sách Recall](#131-danh-s%C3%A1ch-recall)
  - [13.2 Chi tiết Recall](#132-chi-ti%E1%BA%BFt-recall)
  - [13.3 Tạo Recall](#133-t%E1%BA%A3o-recall)
  - [13.4 Kết thúc Recall](#134-k%E1%BA%BFt-th%C3%BAc-recall)
- [14. Notifications](#14-notifications)
  - [14.1 Danh sách thông báo](#141-danh-s%C3%A1ch-th%C3%B4ng-b%C3%A1o)
  - [14.2 Đánh dấu đã đọc](#142-%C4%90%C3%A1nh-d%E1%BA%A5u-%C4%91%C3%A3-%C4%91%E1%BB%8Dc)
  - [14.3 Đánh dấu tất cả đã đọc](#143-%C4%90%C3%A1nh-d%E1%BA%A5u-t%E1%BA%A5t-c%E1%BA%A3-%C4%91%C3%A3-%C4%91%E1%BB%8Dc)
  - [14.4 Số thông báo chưa đọc](#144-s%E1%BB%91-th%C3%B4ng-b%C3%A1o-ch%C6%B0a-%C4%91%E1%BB%8Dc)
- [15. Public Traceability](#15-public-traceability)
  - [15.1 Tra cứu công khai](#151-tra-c%E1%BB%A9u-c%C3%B4ng-khai)
  - [15.2 Phả hệ Batch](#152-ph%E1%BA%A3-h%E1%BB%87-batch)
- [16. Analytics](#16-analytics)
  - [16.1 Dashboard tổng quan](#161-dashboard-t%E1%BB%95ng-quan)
  - [16.2 Thống kê Batch](#162-th%E1%BB%91ng-k%C3%AA-batch)
  - [16.3 Thời gian xử lý](#163-th%E1%BB%9Di-gian-x%E1%BB%AD-l%C3%BD)
  - [16.4 Truy vết ngược](#164-truy-v%E1%BA%BFt-ng%C6%B0%E1%BB%9Dc)
- [17. Lookup bổ sung](#17-lookup-b%E1%BB%95-sung)
- [18. Error Code bổ sung](#18-error-code-b%E1%BB%95-sung)
- [Phụ lục A — Luồng hoạt động API](#ph%E1%BB%A5-l%E1%BB%A5c-a--lu%E1%BB%93ng-ho%E1%BA%A1t-%C4%91%E1%BB%99ng-api)
- [Phụ lục B — JWT Token Structure](#ph%E1%BB%A5-l%E1%BB%A5c-b--jwt-token-structure)
- [Phụ lục C — Tổng hợp Endpoint](#ph%E1%BB%A5-l%E1%BB%A5c-c--t%E1%BB%95ng-h%E1%BB%A3p-endpoint)

## 1. Quy ước chung

### 1.1 Request Headers

| Header | Bắt buộc | Mô tả |
|--------|----------|-------|
| Content-Type | Có | application/json |
| Authorization | Có (API bảo vệ) | Bearer <access_token> |
| Accept-Language | Không | vi hoặc en |

**Ví dụ:**

```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

### 1.2 Response Format

Tất cả API trả về cùng một cấu trúc:

**Thành công**

```json
{
    "success": true,
    "data": {},
    "message": "Thực hiện thành công",
    "timestamp": "2026-07-07T10:00:00Z"
}
```

**Lỗi**

```json
{
    "success": false,
    "data": null,
    "message": "Validation failed",
    "errors": [
        {
            "field": "email",
            "code": "REQUIRED",
            "message": "Email không được để trống"
        }
    ],
    "timestamp": "2026-07-07T10:00:00Z"
}
```

### 1.3 Pagination

Các API trả danh sách hỗ trợ:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Trang hiện tại |
| pageSize | int | 20 | Số lượng bản ghi |
| sortBy | string | - | Cột sắp xếp |
| sortDir | string | asc | asc / desc |

**Response:**

```json
{
    "items": [],
    "totalCount": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
}
```

### 1.4 HTTP Status Code

| Code | Ý nghĩa |
|------|---------|
| 200 | Request thành công |
| 201 | Tạo mới thành công |
| 204 | Xóa thành công không trả dữ liệu |
| 400 | Dữ liệu không hợp lệ |
| 401 | Chưa đăng nhập |
| 403 | Không đủ quyền |
| 404 | Không tìm thấy dữ liệu |
| 409 | Trùng dữ liệu |
| 422 | Sai nghiệp vụ |
| 500 | Lỗi server |

## 2. Phân quyền (RBAC)

### 2.1 Danh sách Role

| Role | Mô tả |
|------|-------|
| ADMIN | Quản trị toàn hệ thống |
| MANAGER | Quản lý doanh nghiệp |
| STAFF | Nhân viên vận hành (tạo event, split/merge batch) |
| FARMER | Nông dân tạo và quản lý lô hàng |
| INSPECTOR | Đơn vị kiểm định |
| CONSUMER | Người mua tra cứu sản phẩm |

### 2.2 Permission Matrix

| Chức năng | ADMIN | MANAGER | STAFF | FARMER | INSPECTOR | CONSUMER |
|-----------|-------|---------|-------|--------|-----------|----------|
| Quản lý User | ✓ | ✓ | - | - | - | - |
| Tạo sản phẩm | ✓ | ✓ | - | - | - | - |
| Tạo Batch | ✓ | ✓ | - | ✓ | - | - |
| Ghi nhận Event | ✓ | ✓ | ✓ | ✓ | - | - |
| Kiểm định | ✓ | - | - | - | ✓ | - |
| Cấp chứng nhận | ✓ | - | - | - | ✓ | - |
| Thu hồi sản phẩm | ✓ | - | - | - | ✓ | - |
| Tra cứu QR | Public | Public | Public | Public | Public | Public |

## 3. Xác thực — Auth

### 3.1 Đăng nhập

**POST** `/auth/login`

**Authorization:** Public

**Request:**

```json
{
    "email": "farmer@gmail.com",
    "password": "12345678"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "user": {
      "id": 1,
      "name": "Nguyen Van A",
      "role": "FARMER"
    }
  }
}
```

### 3.2 Refresh Token

**POST** `/auth/refresh-token`

**Request:**

```json
{
  "refreshToken": "xxxxxx"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### 3.3 Logout

**POST** `/auth/logout`

**Authorization:** Bearer Token

**Response:** 204 No Content

### 3.4 Lấy thông tin User hiện tại

**GET** `/auth/me`

**Response:**

```json
{
  "id": 1,
  "name": "Nguyen Van A",
  "email": "farmer@gmail.com",
  "role": "FARMER"
}
```

## 4. Quản lý tổ chức — Organizations

### 4.1 Lấy danh sách tổ chức

**GET** `/organizations`

**Role:** ADMIN

**Query:** `?page=1&pageSize=20`

**Response:**

```json
{
  "items": [
    {
      "organizationId": 1,
      "name": "Farm ABC",
      "type": "FARM",
      "status": "ACTIVE"
    }
  ]
}
```

### 4.2 Xem chi tiết tổ chức

**GET** `/organizations/{id}`

**Response:**

```json
{
  "organizationId": 1,
  "name": "Farm ABC",
  "address": "Da Lat",
  "type": "FARM"
}
```

### 4.3 Tạo tổ chức

**POST** `/organizations`

**Role:** ADMIN

**Request:**

```json
{
  "name": "Green Farm",
  "type": "FARM",
  "address": "Lam Dong"
}
```

**Response:**

```json
{
  "organizationId": 10,
  "name": "Green Farm"
}
```

### 4.4 Cập nhật tổ chức

**PUT** `/organizations/{id}`

**Request:**

```json
{
  "name": "Green Farm Update"
}
```

### 4.5 Thay đổi trạng thái

**PATCH** `/organizations/{id}/status`

**Request:**

```json
{
  "status": "INACTIVE"
}
```

## 5. Quản lý Người dùng — Users

### 5.1 Lấy danh sách người dùng

**GET** `/users`

**Authorization:** ADMIN | MANAGER

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| organizationId | int | Lọc theo tổ chức |
| role | string | Lọc theo quyền |
| search | string | Tìm kiếm theo tên/email |
| page | int | Trang hiện tại |
| pageSize | int | Số lượng bản ghi |

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "items": [
            {
                "userId": 1,
                "fullName": "Nguyễn Văn A",
                "email": "farmer@gmail.com",
                "role": "FARMER",
                "organizationId": 1,
                "organizationName": "Green Farm",
                "isActive": true,
                "createdAt": "2026-07-01T10:00:00Z"
            }
        ],
        "totalCount": 20,
        "page": 1,
        "pageSize": 20,
        "totalPages": 1
    }
}
```

### 5.2 Lấy thông tin chi tiết User

**GET** `/users/{userId}`

**Authorization:** ADMIN | MANAGER | Self

**Response:**

```json
{
    "success": true,
    "data": {
        "userId": 1,
        "fullName": "Nguyễn Văn A",
        "email": "farmer@gmail.com",
        "role": "FARMER",
        "organizationId": 1,
        "phone": "090xxxxxxx",
        "isActive": true
    }
}
```

### 5.3 Tạo User mới

**POST** `/users`

**Authorization:** ADMIN | MANAGER

**Request Body:**

```json
{
    "organizationId": 1,
    "fullName": "Trần Văn B",
    "email": "tranb@gmail.com",
    "password": "12345678",
    "role": "FARMER"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| organizationId | int | No | ID tổ chức |
| fullName | string | Yes | Họ tên |
| email | string | Yes | Email đăng nhập |
| password | string | Yes | Mật khẩu |
| role | string | Yes | Quyền user |

**Response 201 Created:**

```json
{
    "success": true,
    "message": "Tạo người dùng thành công",
    "data": {
        "userId": 10
    }
}
```

### 5.4 Cập nhật User

**PUT** `/users/{userId}`

**Authorization:** ADMIN | MANAGER | Self

**Request:**

```json
{
    "fullName": "Nguyễn Văn C",
    "phone": "098888888",
    "role": "STAFF"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Cập nhật thành công"
}
```

### 5.5 Kích hoạt / Vô hiệu hóa tài khoản

**PATCH** `/users/{userId}/status`

**Request:**

```json
{
    "isActive": false
}
```

**Response:**

```json
{
    "success": true,
    "message": "Đã cập nhật trạng thái tài khoản"
}
```

## 6. Quản lý Danh mục sản phẩm — Categories

### 6.1 Lấy danh sách Category

**GET** `/categories`

**Authorization:** Authenticated

**Query:**

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Tìm kiếm tên category |
| page | int | Trang hiện tại |
| pageSize | int | Số lượng bản ghi |

**Response:**

```json
{
    "success": true,
    "data": {
        "items": [
            {
                "categoryId": 1,
                "name": "Rau củ",
                "description": "Nhóm rau củ quả",
                "isActive": true
            }
        ],
        "totalCount": 10,
        "page": 1,
        "pageSize": 20,
        "totalPages": 1
    }
}
```

### 6.2 Chi tiết Category

**GET** `/categories/{categoryId}`

**Authorization:** Authenticated

**Response:**

```json
{
  "success": true,
  "data": {
    "categoryId": 1,
    "name": "Coffee",
    "description": "Sản phẩm cà phê",
    "isActive": true
  }
}
```

### 6.3 Tạo Category

**POST** `/categories`

**Authorization:** ADMIN | MANAGER

**Request:**

```json
{
    "name": "Coffee",
    "description": "Các loại cà phê"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Tạo category thành công",
  "data": {
    "categoryId": 5
  }
}
```

### 6.4 Cập nhật Category

**PUT** `/categories/{categoryId}`

**Authorization:** ADMIN | MANAGER

**Request:**

```json
{
    "name": "Coffee Premium",
    "description": "Danh mục cà phê cao cấp"
}
```

### 6.5 Thay đổi trạng thái Category

**PATCH** `/categories/{categoryId}/status`

**Request:**

```json
{
  "isActive": false
}
```

### 6.6 Xóa Category

**DELETE** `/categories/{categoryId}`

**Authorization:** ADMIN

**Điều kiện:** Không được xóa nếu đang có Product sử dụng.

## 7. Quản lý Sản phẩm — Products

### 7.1 Danh sách Product

**GET** `/products`

**Authorization:** Authenticated

**Query:**

| Parameter | Description |
|-----------|-------------|
| organizationId | lọc tổ chức |
| categoryId | lọc danh mục |
| search | tìm tên |
| page | trang |
| pageSize | số lượng |

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": 1,
        "name": "Cà phê Arabica",
        "categoryId": 5,
        "categoryName": "Coffee",
        "unit": "kg",
        "organizationId": 1,
        "isActive": true
      }
    ],
    "totalCount": 20,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

### 7.2 Chi tiết Product

**GET** `/products/{productId}`

**Response:**

```json
{
  "success": true,
  "data": {
    "productId": 1,
    "name": "Cà phê Arabica",
    "category": {
      "id": 5,
      "name": "Coffee"
    },
    "unit": "kg",
    "organizationId": 1
  }
}
```

### 7.3 Tạo Product

**POST** `/products`

**Authorization:** ADMIN | MANAGER

**Request:**

```json
{
    "name": "Cà phê Arabica",
    "categoryId": 5,
    "unit": "kg",
    "organizationId": 1
}
```

**Response:**

```json
{
  "success": true,
  "message": "Tạo sản phẩm thành công",
  "data": {
    "productId": 10
  }
}
```

### 7.4 Update Product

**PUT** `/products/{productId}`

**Request:**

```json
{
  "name": "Arabica Premium",
  "categoryId": 5,
  "unit": "kg"
}
```

### 7.5 Product Status

**PATCH** `/products/{productId}/status`

**Request:**

```json
{
  "isActive": false
}
```

### 7.6 Delete Product

**DELETE** `/products/{productId}`

**Authorization:** ADMIN

## 8. Supply Chain Events

### 8.1 Danh sách Event

**GET** `/batches/{batchId}/events`

**Authorization:** Authenticated

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | int | Trang hiện tại |
| pageSize | int | Số lượng bản ghi |

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "items": [
            {
                "eventId": "uuid",
                "batchId": "uuid",
                "eventTypeId": "uuid",
                "eventTypeCode": "HARVEST",
                "organizationId": "uuid",
                "performedByUserId": "uuid",
                "eventData": "{\"temperature\":25}",
                "location": "Da Lat",
                "previousHash": "abc123",
                "currentHash": "xyz789",
                "eventTime": "2026-07-07T10:00:00Z"
            }
        ],
        "totalCount": 10,
        "page": 1,
        "pageSize": 20
    }
}
```

### 8.2 Chi tiết Event

**GET** `/events/{eventId}`

**Authorization:** Authenticated

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "eventId": "uuid",
        "batchId": "uuid",
        "eventTypeId": "uuid",
        "eventTypeCode": "PROCESSING",
        "organizationId": "uuid",
        "performedByUserId": "uuid",
        "eventData": "{\"machine\":\"M-01\"}",
        "location": "Processor A",
        "previousHash": "abc123",
        "currentHash": "xyz789",
        "eventTime": "2026-07-07T10:00:00Z"
    }
}
```

### 8.3 Ghi nhận Event

**POST** `/batches/{batchId}/events`

**Authorization:**

- ADMIN
- MANAGER
- FARMER
- STAFF

**Không cho:** INSPECTOR vì Event là hoạt động vận hành.

**Request:**

```json
{
    "eventTypeId": "uuid",
    "eventData": "{\"temperature\":25}",
    "location": "Da Lat"
}
```

**Response 201 Created:**

```json
{
    "success": true,
    "data": {
        "eventId": "uuid",
        "previousHash": "abc123",
        "currentHash": "xyz789"
    }
}
```

## 9. Quản lý Lô hàng — Batches

### 9.1 Danh sách Batch

**GET** `/batches`

**Authorization:** Authenticated

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| organizationId | guid | Lọc theo tổ chức |
| status | int | Lọc theo trạng thái |
| search | string | Tìm theo BatchCode |
| page | int | Trang hiện tại |
| pageSize | int | Số lượng bản ghi |

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "items": [
            {
                "batchId": "uuid",
                "productId": "uuid",
                "productName": "Tomato",
                "batchCode": "TOMATO-2026-001",
                "quantity": 1000,
                "unitId": "uuid",
                "unitCode": "kg",
                "status": 1,
                "statusName": "CREATED",
                "currentOrganizationId": "uuid",
                "qrCodeUrl": "https://api.agritrace.vn/qr/uuid",
                "createdAt": "2026-07-07T10:00:00Z"
            }
        ],
        "totalCount": 50,
        "page": 1,
        "pageSize": 20
    }
}
```

### 9.2 Chi tiết Batch

**GET** `/batches/{batchId}`

**Authorization:** Authenticated

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "batchId": "uuid",
        "productId": "uuid",
        "productName": "Tomato",
        "categoryId": "uuid",
        "categoryName": "Vegetable",
        "batchCode": "TOMATO-2026-001",
        "quantity": 1000,
        "unitId": "uuid",
        "unitCode": "kg",
        "productionDate": "2026-07-01",
        "expiryDate": "2026-07-15",
        "status": 1,
        "currentOrganizationId": "uuid",
        "organizationName": "Green Farm",
        "qrCodeUrl": "https://api.agritrace.vn/qr/uuid",
        "createdAt": "2026-07-07T10:00:00Z"
    }
}
```

### 9.3 Tạo Batch

**POST** `/batches`

**Authorization:** FARMER | MANAGER

**Request:**

```json
{
    "productId": "uuid",
    "quantity": 1000,
    "unitId": "uuid",
    "productionDate": "2026-07-01",
    "expiryDate": "2026-07-15"
}
```

**Response 201 Created:**

```json
{
    "success": true,
    "data": {
        "batchId": "uuid",
        "batchCode": "TOMATO-2026-001",
        "qrCodeUrl": "https://api.agritrace.vn/qr/uuid"
    }
}
```

### 9.4 Cập nhật Batch

**PUT** `/batches/{batchId}`

**Authorization:** FARMER | MANAGER

**Request:**

```json
{
    "quantity": 1200,
    "expiryDate": "2026-07-20"
}
```

**Response 200 OK:**

```json
{
    "success": true,
    "message": "Cập nhật Batch thành công"
}
```

### 9.5 Thay đổi trạng thái Batch

**PATCH** `/batches/{batchId}/status`

**Authorization:** MANAGER

**Request:**

```json
{
    "status": 2
}
```

**Response 200 OK:**

```json
{
    "success": true,
    "message": "Cập nhật trạng thái thành công"
}
```

### 9.6 QR Code

**GET** `/batches/{batchId}/qr-code`

**Authorization:** Authenticated

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "batchId": "uuid",
        "batchCode": "TOMATO-2026-001",
        "qrCodeUrl": "https://api.agritrace.vn/qr/uuid",
        "publicTraceUrl": "https://agritrace.vn/trace/uuid"
    }
}
```

### 9.7 Images

**GET** `/batches/{batchId}/images`

**Authorization:** Authenticated

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "items": [
            {
                "imageId": "uuid",
                "url": "https://storage.agritrace.vn/batches/uuid/img1.jpg",
                "isPrimary": true
            }
        ]
    }
}
```

**POST** `/batches/{batchId}/images`

**Authorization:** FARMER | MANAGER | STAFF

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| file | File | Ảnh batch (jpg/png, max 5MB) |
| isPrimary | bool | Là ảnh đại diện |

**Response 201 Created:**

```json
{
    "success": true,
    "data": {
        "imageId": "uuid",
        "url": "https://storage.agritrace.vn/batches/uuid/img1.jpg"
    }
}
```

**DELETE** `/batches/images/{imageId}`

**Authorization:** FARMER | MANAGER

**Response 204 No Content**

## 10. Batch Split & Merge

### 10.1 Tách Batch

**POST** `/batches/{batchId}/split`

**Authorization:** STAFF | MANAGER

**Request:**

```json
{
    "splits": [
        {
            "quantity": 400,
            "unitId": "uuid"
        },
        {
            "quantity": 600,
            "unitId": "uuid"
        }
    ]
}
```

**Response 201 Created:**

```json
{
    "success": true,
    "data": {
        "parentBatchId": "uuid",
        "childBatchIds": [
            "uuid-child-1",
            "uuid-child-2"
        ]
    }
}
```

### 10.2 Gộp Batch

**POST** `/batches/merge`

**Authorization:** STAFF | MANAGER

**Request:**

```json
{
    "sourceBatchIds": [
        "uuid-source-1",
        "uuid-source-2"
    ],
    "productId": "uuid",
    "quantity": 1000,
    "unitId": "uuid",
    "productionDate": "2026-07-01"
}
```

**Response 201 Created:**

```json
{
    "success": true,
    "data": {
        "newBatchId": "uuid",
        "batchCode": "MERGED-2026-001"
    }
}
```

## 11. Quality Inspection

### 11.1 Danh sách kiểm định

**GET** `/batches/{batchId}/inspections`

**Authorization:** ADMIN | MANAGER | INSPECTOR

### 11.2 Chi tiết kiểm định

**GET** `/inspections/{inspectionId}`

**Authorization:** ADMIN | INSPECTOR

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "inspectionId": "uuid",
        "batchId": "uuid",
        "batchCode": "TOMATO-2026-001",
        "inspectorId": "uuid",
        "inspectorName": "Nguyen Van A",
        "status": 1,
        "result": "PASS",
        "notes": "No pesticide residue detected",
        "createdAt": "2026-07-07T10:00:00Z"
    }
}
```

### 11.3 Tạo kiểm định

**POST** `/batches/{batchId}/inspections`

**Authorization:** INSPECTOR

**Request:**

```json
{
    "result": "PASS",
    "notes": "No pesticide residue detected"
}
```

**Response 201 Created:**

```json
{
    "success": true,
    "data": {
        "inspectionId": "uuid"
    }
}
```

### 11.4 Cập nhật kiểm định

**PUT** `/inspections/{inspectionId}`

**Authorization:** INSPECTOR

**Request:**

```json
{
    "result": "FAIL",
    "notes": "Detected residue above limit"
}
```

**Response 200 OK:**

```json
{
    "success": true,
    "message": "Cập nhật kiểm định thành công"
}
```

## 12. Certificate

### 12.1 Danh sách chứng nhận

**GET** `/batches/{batchId}/certificates`

**Authorization:** Authenticated

### 12.2 Chi tiết chứng nhận

**GET** `/certificates/{certificateId}`

**Authorization:** Authenticated

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "certificateId": "uuid",
        "batchId": "uuid",
        "batchCode": "TOMATO-2026-001",
        "inspectionId": "uuid",
        "certificateType": "VietGAP",
        "fileUrl": "https://storage.agritrace.vn/certs/uuid.pdf",
        "issuedDate": "2026-07-07",
        "createdAt": "2026-07-07T10:00:00Z"
    }
}
```

### 12.3 Cấp chứng nhận

**POST** `/batches/{batchId}/certificates`

**Authorization:** INSPECTOR

**Request:**

```json
{
    "inspectionId": "uuid",
    "certificateType": "VietGAP",
    "fileUrl": "https://storage.agritrace.vn/certs/uuid.pdf",
    "issuedDate": "2026-07-07"
}
```

**Response 201 Created:**

```json
{
    "success": true,
    "data": {
        "certificateId": "uuid"
    }
}
```

### 12.4 Thu hồi chứng nhận

**DELETE** `/certificates/{certificateId}`

**Authorization:** ADMIN

**Response 204 No Content**

## 13. Recall

### 13.1 Danh sách Recall

**GET** `/recalls`

**Authorization:** ADMIN | INSPECTOR

### 13.2 Chi tiết Recall

**GET** `/recalls/{recallId}`

**Authorization:** ADMIN | INSPECTOR

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "recallId": "uuid",
        "batchId": "uuid",
        "batchCode": "TOMATO-2026-001",
        "createdBy": "uuid",
        "createdByName": "Nguyen Van A",
        "reason": "E. coli contamination detected",
        "severity": 3,
        "severityName": "HIGH",
        "status": 1,
        "statusName": "PENDING",
        "createdAt": "2026-07-07T10:00:00Z"
    }
}
```

### 13.3 Tạo Recall

**POST** `/recalls`

**Authorization:** ADMIN | INSPECTOR

**Request:**

```json
{
    "batchId": "uuid",
    "reason": "E. coli contamination detected",
    "severity": 3
}
```

**Response 201 Created:**

```json
{
    "success": true,
    "data": {
        "recallId": "uuid"
    }
}
```

### 13.4 Kết thúc Recall

**PATCH** `/recalls/{recallId}/resolve`

**Authorization:** ADMIN | INSPECTOR

**Request:**

```json
{
    "status": 3
}
```

**Response 200 OK:**

```json
{
    "success": true,
    "message": "Kết thúc Recall thành công"
}
```

## 14. Notifications

### 14.1 Danh sách thông báo

**GET** `/notifications`

**Authorization:** Bearer

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | int | Trang hiện tại |
| pageSize | int | Số lượng bản ghi |
| isRead | bool | Lọc theo trạng thái đã đọc/chưa đọc |

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "items": [
            {
                "notificationId": "uuid",
                "userId": "uuid",
                "title": "Recall Alert",
                "message": "Batch TOMATO-2026-001 has been recalled",
                "isRead": false,
                "createdAt": "2026-07-07T10:00:00Z"
            }
        ],
        "totalCount": 5,
        "page": 1,
        "pageSize": 20
    }
}
```

### 14.2 Đánh dấu đã đọc

**PATCH** `/notifications/{notificationId}/read`

**Authorization:** Bearer

**Response 200 OK:**

```json
{
    "success": true,
    "message": "Đã đánh dấu đã đọc"
}
```

### 14.3 Đánh dấu tất cả đã đọc

**PATCH** `/notifications/read-all`

**Authorization:** Bearer

**Response 200 OK:**

```json
{
    "success": true,
    "message": "Đã đánh dấu tất cả đã đọc"
}
```

### 14.4 Số thông báo chưa đọc

**GET** `/notifications/unread-count`

**Authorization:** Bearer

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "unreadCount": 3
    }
}
```

## 15. Public Traceability

### 15.1 Tra cứu công khai

**GET** `/public/trace/{batchId}`

**Authorization:** Public

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "batchId": "uuid",
        "batchCode": "TOMATO-2026-001",
        "productName": "Tomato",
        "quantity": 1000,
        "unitCode": "kg",
        "currentOrganizationName": "Green Farm",
        "status": 1,
        "timeline": [
            {
                "eventTypeCode": "HARVEST",
                "organizationName": "Green Farm",
                "eventTime": "2026-07-01T08:00:00Z",
                "location": "Da Lat"
            },
            {
                "eventTypeCode": "TRANSPORT",
                "organizationName": "Vin Distribution",
                "eventTime": "2026-07-02T14:00:00Z",
                "location": "Ho Chi Minh"
            }
        ],
        "inspections": [
            {
                "result": "PASS",
                "inspectorName": "Nguyen Van A",
                "createdAt": "2026-07-07T10:00:00Z"
            }
        ],
        "certificates": [
            {
                "certificateType": "VietGAP",
                "fileUrl": "https://storage.agritrace.vn/certs/uuid.pdf",
                "issuedDate": "2026-07-07"
            }
        ],
        "recallStatus": null
    }
}
```

### 15.2 Phả hệ Batch

**GET** `/public/trace/{batchId}/lineage`

**Authorization:** Public

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "rootBatchId": "uuid",
        "lineage": [
            {
                "batchId": "uuid",
                "batchCode": "TOMATO-2026-001",
                "eventTypeCode": "HARVEST",
                "quantity": 1000,
                "parentBatchId": null
            },
            {
                "batchId": "uuid-child-1",
                "batchCode": "TOMATO-2026-001-A",
                "eventTypeCode": "SPLIT",
                "quantity": 400,
                "parentBatchId": "uuid"
            }
        ]
    }
}
```

## 16. Analytics

### 16.1 Dashboard tổng quan

**GET** `/analytics/overview`

**Authorization:** ADMIN

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "totalBatches": 150,
        "totalOrganizations": 12,
        "totalEvents": 890,
        "totalRecalls": 2,
        "activeBatches": 120,
        "recalledBatches": 2
    }
}
```

### 16.2 Thống kê Batch

**GET** `/analytics/batch-distribution`

**Authorization:** ADMIN | MANAGER

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| organizationId | guid | Lọc theo tổ chức |
| fromDate | datetime | Từ ngày |
| toDate | datetime | Đến ngày |

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "items": [
            {
                "status": 1,
                "statusName": "CREATED",
                "count": 30
            },
            {
                "status": 2,
                "statusName": "HARVESTED",
                "count": 50
            },
            {
                "status": 7,
                "statusName": "RECALLED",
                "count": 2
            }
        ],
        "totalCount": 82
    }
}
```

### 16.3 Thời gian xử lý

**GET** `/analytics/processing-time`

**Authorization:** ADMIN | MANAGER

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| organizationId | guid | Lọc theo tổ chức |
| eventTypeId | guid | Lọc theo loại event |
| fromDate | datetime | Từ ngày |
| toDate | datetime | Đến ngày |

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "averageProcessingHours": 24.5,
        "byEventType": [
            {
                "eventTypeCode": "PROCESSING",
                "averageHours": 12.0
            },
            {
                "eventTypeCode": "TRANSPORT",
                "averageHours": 8.5
            }
        ]
    }
}
```

### 16.4 Truy vết ngược

**GET** `/analytics/traceback/{batchId}`

**Authorization:** ADMIN | INSPECTOR

**Response 200 OK:**

```json
{
    "success": true,
    "data": {
        "batchId": "uuid",
        "batchCode": "TOMATO-2026-001",
        "affectedBatches": [
            {
                "batchId": "uuid",
                "batchCode": "TOMATO-2026-001-A",
                "relationship": "SPLIT"
            },
            {
                "batchId": "uuid",
                "batchCode": "SALAD-2026-005",
                "relationship": "MERGE"
            }
        ],
        "relatedOrganizations": [
            {
                "organizationId": "uuid",
                "name": "Green Farm",
                "type": "FARM"
            },
            {
                "organizationId": "uuid",
                "name": "Vin Distribution",
                "type": "DISTRIBUTOR"
            }
        ]
    }
}
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /roles | Danh sách role |
| GET | /organization-types | Loại tổ chức |
| GET | /event-types | Loại event |
| GET | /categories | Danh mục sản phẩm |
| GET | /units | Đơn vị tính (kg, ton, box) |

## 18. Error Code bổ sung

| Code | HTTP | Mô tả |
|------|------|-------|
| CATEGORY_IN_USE | 409 | Category đang được sử dụng |
| PRODUCT_IN_USE | 409 | Product đang có Batch |
| INVALID_QUANTITY | 422 | Số lượng không hợp lệ |
| INVALID_EVENT_TYPE | 422 | Event không hợp lệ |
| BATCH_ALREADY_RECALLED | 409 | Batch đã Recall |

# Phụ lục A — Luồng hoạt động API

## A.1. Quy trình đăng nhập

```
Người dùng
    │
    │ POST /auth/login
    ▼
Backend API
    │
    │ Kiểm tra Email & Password
    ▼
SQL Server
    │
    │ Trả thông tin User
    ▼
Backend API
    │
    │ Sinh Access Token
    │ Sinh Refresh Token
    ▼
Người dùng
```

## A.2. Quy trình tạo Batch

```
Farmer
    │
    │ POST /batches
    ▼
Backend API
    │
    ├── Kiểm tra Product
    ├── Sinh BatchCode
    ├── Sinh QR Code
    ├── Tạo Batch
    ├── Ghi Event HARVEST
    └── Sinh Hash đầu tiên
    ▼
SQL Server
    │
    ▼
Response
    │
    ├── BatchId
    ├── BatchCode
    └── QR Code URL
```

## A.3. Quy trình ghi nhận Supply Chain Event

```
User
    │
    │ POST /batches/{id}/events
    ▼
Backend API
    │
    ├── Kiểm tra quyền
    ├── Lấy Current Hash của Event gần nhất
    ├── Tính Previous Hash
    ├── Sinh Current Hash mới
    ├── Lưu Event
    ▼
SQL Server
    │
    ▼
Response
    │
    ├── EventId
    ├── PreviousHash
    └── CurrentHash
```

## A.4. Quy trình Split Batch

```
Staff
    │
    │ POST /batches/{id}/split
    ▼
Backend API
    │
    ├── Kiểm tra Batch
    ├── Kiểm tra Quantity
    ├── Tạo các Batch con
    ├── Ghi BatchRelation
    ├── Ghi Event SPLIT
    ▼
SQL Server
    │
    ▼
Response
```

## A.5. Quy trình Merge Batch

```
Staff
    │
    │ POST /batches/merge
    ▼
Backend API
    │
    ├── Kiểm tra Product
    ├── Kiểm tra Quantity
    ├── Tạo Batch mới
    ├── Ghi BatchRelation
    ├── Ghi Event MERGE
    ▼
SQL Server
    │
    ▼
Response
```

## A.6. Quy trình Public Trace

```
Consumer
    │
    │ Quét QR Code
    ▼
GET /public/trace/{batchId}
    │
    ▼
Backend API
    │
    ├── Kiểm tra Redis Cache
    │
    ├── Nếu Cache Hit
    │       │
    │       ▼
    │    Trả dữ liệu
    │
    └── Nếu Cache Miss
            │
            ├── Query SQL Server
            ├── Batch
            ├── Events
            ├── Certificates
            ├── Inspections
            ├── Recall
            ├── Lưu Redis (TTL 5 phút)
            ▼
        Trả dữ liệu
```

# Phụ lục B — JWT Token Structure

## Access Token Payload

```json
{
    "sub": "1",
    "email": "admin@agritrace.vn",
    "role": "ADMIN",
    "organizationId": 1,
    "organizationType": "FARM",
    "jti": "2fcf44e3-a123-4d56-bf87-123456789abc",
    "iat": 1783400400,
    "exp": 1783404000
}
```

### JWT Claims

| Claim | Ý nghĩa |
|-------|---------|
| sub | ID người dùng |
| email | Email đăng nhập |
| role | Vai trò của người dùng |
| organizationId | ID tổ chức |
| organizationType | Loại tổ chức |
| jti | JWT Identifier |
| iat | Thời điểm phát hành Token |
| exp | Thời điểm hết hạn Token |

### Refresh Token

- Được lưu trong bảng RefreshTokens.
- Thời gian hết hạn mặc định 07 ngày.
- Hỗ trợ Token Rotation.
- Khi Refresh Token mới được cấp, Refresh Token cũ sẽ bị thu hồi (Revoke).

# Phụ lục C — Tổng hợp Endpoint

| STT | Method | Endpoint | Authorization | Mô tả |
|-----|--------|----------|---------------|-------|
| **Authentication** |||||
| 1 | POST | /auth/login | Public | Đăng nhập |
| 2 | POST | /auth/refresh-token | Public | Làm mới Access Token |
| 3 | POST | /auth/logout | Bearer | Đăng xuất |
| 4 | GET | /auth/me | Bearer | Thông tin người dùng hiện tại |
| 5 | PUT | /auth/change-password | Bearer | Đổi mật khẩu |
| 6 | POST | /auth/forgot-password | Public | Quên mật khẩu |
| 7 | POST | /auth/reset-password | Public | Đặt lại mật khẩu |
| **Organizations** |||||
| 8 | GET | /organizations | ADMIN | Danh sách tổ chức |
| 9 | GET | /organizations/{id} | ADMIN | Chi tiết tổ chức |
| 10 | POST | /organizations | ADMIN | Tạo tổ chức |
| 11 | PUT | /organizations/{id} | ADMIN | Cập nhật tổ chức |
| 12 | PATCH | /organizations/{id}/status | ADMIN | Thay đổi trạng thái |
| 13 | GET | /organizations/{id}/users | ADMIN, MANAGER | Người dùng thuộc tổ chức |
| 14 | GET | /organizations/{id}/products | ADMIN, MANAGER | Sản phẩm của tổ chức |
| **Users** |||||
| 15 | GET | /users | ADMIN, MANAGER | Danh sách người dùng |
| 16 | GET | /users/{id} | ADMIN, MANAGER, Self | Chi tiết người dùng |
| 17 | POST | /users | ADMIN, MANAGER | Tạo người dùng |
| 18 | PUT | /users/{id} | ADMIN, MANAGER, Self | Cập nhật người dùng |
| 19 | PATCH | /users/{id}/status | ADMIN, MANAGER | Khóa/Mở khóa tài khoản |
| 20 | GET | /users/profile | Bearer | Hồ sơ cá nhân |
| 21 | PUT | /users/profile | Bearer | Cập nhật hồ sơ |
| **Categories** |||||
| 22 | GET | /categories | Authenticated | Danh sách danh mục |
| 23 | GET | /categories/{id} | Authenticated | Chi tiết danh mục |
| 24 | POST | /categories | ADMIN, MANAGER | Tạo danh mục |
| 25 | PUT | /categories/{id} | ADMIN, MANAGER | Cập nhật danh mục |
| 26 | DELETE | /categories/{id} | ADMIN | Xóa danh mục |
| **Products** |||||
| 27 | GET | /products | Authenticated | Danh sách sản phẩm |
| 28 | GET | /products/{id} | Authenticated | Chi tiết sản phẩm |
| 29 | POST | /products | ADMIN, MANAGER | Tạo sản phẩm |
| 30 | PUT | /products/{id} | ADMIN, MANAGER | Cập nhật sản phẩm |
| 31 | DELETE | /products/{id} | ADMIN | Xóa sản phẩm |
| 32 | GET | /products/{id}/images | Authenticated | Danh sách ảnh sản phẩm |
| 33 | POST | /products/{id}/images | ADMIN, MANAGER | Upload ảnh |
| 34 | DELETE | /products/images/{imageId} | ADMIN, MANAGER | Xóa ảnh |
| **Batches** |||||
| 35 | GET | /batches | Authenticated | Danh sách Batch |
| 36 | GET | /batches/{id} | Authenticated | Chi tiết Batch |
| 37 | POST | /batches | FARMER, MANAGER | Tạo Batch |
| 38 | PUT | /batches/{id} | FARMER, MANAGER | Cập nhật Batch |
| 39 | PATCH | /batches/{id}/status | MANAGER | Cập nhật trạng thái |
| 40 | GET | /batches/{id}/qr-code | Authenticated | Lấy QR Code |
| 41 | GET | /batches/{id}/images | Authenticated | Danh sách ảnh Batch |
| 42 | POST | /batches/{id}/images | FARMER, MANAGER, STAFF | Upload ảnh Batch |
| 43 | DELETE | /batches/images/{imageId} | FARMER, MANAGER | Xóa ảnh Batch |
| **Supply Chain Events** |||||
| 44 | GET | /batches/{id}/events | Authenticated | Danh sách Event |
| 45 | GET | /events/{id} | Authenticated | Chi tiết Event |
| 46 | POST | /batches/{id}/events | FARMER, MANAGER, STAFF | Thêm Event |
| 47 | GET | /batches/{id}/events/verify | ADMIN, INSPECTOR | Kiểm tra Hash Chain |
| **Batch Split & Merge** |||||
| 48 | POST | /batches/{id}/split | STAFF, MANAGER | Tách Batch |
| 49 | POST | /batches/merge | STAFF, MANAGER | Gộp Batch |
| **Quality Inspection** |||||
| 50 | GET | /batches/{id}/inspections | ADMIN, INSPECTOR | Danh sách kiểm định |
| 51 | POST | /batches/{id}/inspections | INSPECTOR | Tạo kiểm định |
| 52 | GET | /inspections/{id} | ADMIN, INSPECTOR | Chi tiết kiểm định |
| 53 | PUT | /inspections/{id} | INSPECTOR | Cập nhật kiểm định |
| **Certificates** |||||
| 54 | GET | /batches/{id}/certificates | Authenticated | Danh sách chứng nhận |
| 55 | GET | /certificates/{id} | Authenticated | Chi tiết chứng nhận |
| 56 | POST | /batches/{id}/certificates | INSPECTOR | Cấp chứng nhận |
| 57 | DELETE | /certificates/{id} | ADMIN | Thu hồi chứng nhận |
| **Recalls** |||||
| 58 | GET | /recalls | ADMIN, INSPECTOR | Danh sách Recall |
| 59 | GET | /recalls/{id} | ADMIN, INSPECTOR | Chi tiết Recall |
| 60 | POST | /recalls | ADMIN, INSPECTOR | Thu hồi Batch |
| 61 | PATCH | /recalls/{id}/resolve | ADMIN, INSPECTOR | Kết thúc Recall |
| **Notifications** |||||
| 62 | GET | /notifications | Bearer | Danh sách thông báo |
| 63 | PATCH | /notifications/{id}/read | Bearer | Đánh dấu đã đọc |
| 64 | PATCH | /notifications/read-all | Bearer | Đánh dấu tất cả |
| 65 | GET | /notifications/unread-count | Bearer | Số thông báo chưa đọc |
| **Public Traceability** |||||
| 66 | GET | /public/trace/{batchId} | Public | Tra cứu QR |
| 67 | GET | /public/trace/{batchId}/lineage | Public | Phả hệ Batch |
| **Analytics** |||||
| 68 | GET | /analytics/overview | ADMIN | Dashboard tổng quan |
| 69 | GET | /analytics/batch-distribution | ADMIN, MANAGER | Thống kê Batch |
| 70 | GET | /analytics/processing-time | ADMIN, MANAGER | Thời gian xử lý |
| 71 | GET | /analytics/traceback/{batchId} | ADMIN, INSPECTOR | Truy vết ngược |
| **Lookup** |||||
| 72 | GET | /roles | Authenticated | Danh sách Role |
| 73 | GET | /organization-types | Authenticated | Danh sách loại tổ chức |
| 74 | GET | /event-types | Authenticated | Danh sách loại Event |
| 75 | GET | /inspection-results | Authenticated | Danh sách kết quả kiểm định |
| 76 | GET | /certificate-types | Authenticated | Danh sách loại chứng nhận |
| 77 | GET | /recall-severities | Authenticated | Danh sách mức độ Recall |
| 78 | GET | /units | Authenticated | Danh sách đơn vị tính |