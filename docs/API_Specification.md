API Specification — Agricultural Supply Chain Traceability System

Version: 1.0
Base URL: https://api.agritrace.vn/api/v1
Format: REST / JSON
Encoding: UTF-8
Authentication: JWT Bearer Token

1. Quy ước chung
1.1 Request Headers
Header	Bắt buộc	Mô tả
Content-Type	Có	application/json
Authorization	Có (API bảo vệ)	Bearer <access_token>
Accept-Language	Không	vi hoặc en

Ví dụ:

Authorization: Bearer eyJhbGciOiJIUzI1...
1.2 Response Format

Tất cả API trả về cùng một cấu trúc:

Thành công
{
    "success": true,
    "data": {},
    "message": "Thực hiện thành công",
    "timestamp": "2026-07-07T10:00:00Z"
}
Lỗi
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
1.3 Pagination

Các API trả danh sách hỗ trợ:

Parameter	Type	Default	Description
page	int	1	Trang hiện tại
pageSize	int	20	Số lượng bản ghi
sortBy	string	-	Cột sắp xếp
sortDir	string	asc	asc / desc

Response:

{
    "items": [],
    "totalCount":100,
    "page":1,
    "pageSize":20,
    "totalPages":5
}
1.4 HTTP Status Code
Code	Ý nghĩa
200	Request thành công
201	Tạo mới thành công
204	Xóa thành công không trả dữ liệu
400	Dữ liệu không hợp lệ
401	Chưa đăng nhập
403	Không đủ quyền
404	Không tìm thấy dữ liệu
409	Trùng dữ liệu
422	Sai nghiệp vụ
500	Lỗi server
2. Phân quyền (RBAC)
2.1 Danh sách Role
Role	Mô tả
ADMIN	Quản trị toàn hệ thống
MANAGER	Quản lý doanh nghiệp
FARMER	Nông dân tạo và quản lý lô hàng
PROCESSOR	Nhà máy chế biến
DISTRIBUTOR	Đơn vị phân phối
INSPECTOR	Đơn vị kiểm định
CUSTOMER	Người mua tra cứu sản phẩm
2.2 Permission Matrix
Chức năng	ADMIN	MANAGER	FARMER	PROCESSOR	INSPECTOR
Quản lý User	✓	✓	-	-	-
Tạo sản phẩm	✓	✓	-	-	-
Tạo Batch	✓	✓	✓	-	-
Ghi nhận Event	✓	✓	✓	✓	-
Kiểm định	✓	-	-	-	✓
Cấp chứng nhận	✓	-	-	-	✓
Thu hồi sản phẩm	✓	-	-	-	✓
Tra cứu QR	Public	Public	Public	Public	Public
3. Xác thực — Auth
3.1 Đăng nhập
POST /auth/login

Authorization:

Public

Request:

{
    "email":"farmer@gmail.com",
    "password":"12345678"
}

Response:

{
 "success":true,
 "data":{
    "accessToken":"jwt_token",
    "refreshToken":"refresh_token",
    "user":{
        "id":1,
        "name":"Nguyen Van A",
        "role":"FARMER"
    }
 }
}
3.2 Refresh Token
POST /auth/refresh-token

Request:

{
 "refreshToken":"xxxxxx"
}

Response:

{
 "success":true,
 "data":{
    "accessToken":"new_access_token",
    "refreshToken":"new_refresh_token"
 }
}
3.3 Logout
POST /auth/logout

Authorization:

Bearer Token

Response:

204 No Content
3.4 Lấy thông tin User hiện tại
GET /auth/me

Response:

{
 "id":1,
 "name":"Nguyen Van A",
 "email":"farmer@gmail.com",
 "role":"FARMER"
}
4. Quản lý tổ chức — Organizations
4.1 Lấy danh sách tổ chức
GET /organizations

Role:

ADMIN

Query:

?page=1&pageSize=20

Response:

{
 "items":[
    {
     "organizationId":1,
     "name":"Farm ABC",
     "type":"FARM",
     "status":"ACTIVE"
    }
 ]
}
4.2 Xem chi tiết tổ chức
GET /organizations/{id}

Response:

{
 "organizationId":1,
 "name":"Farm ABC",
 "address":"Da Lat",
 "type":"FARM"
}
4.3 Tạo tổ chức
POST /organizations

Role:

ADMIN

Request:

{
"name":"Green Farm",
"type":"FARM",
"address":"Lam Dong"
}

Response:

{
"organizationId":10,
"name":"Green Farm"
}
4.4 Cập nhật tổ chức
PUT /organizations/{id}

Request:

{
"name":"Green Farm Update"
}
4.5 Thay đổi trạng thái
PATCH /organizations/{id}/status

Request:

{
"status":"INACTIVE"
}

5. Quản lý Người dùng — Users
5.1 Lấy danh sách người dùng
GET /users

Authorization:

ADMIN | MANAGER
Query Parameters
Parameter	Type	Description
organizationId	int	Lọc theo tổ chức
role	string	Lọc theo quyền
search	string	Tìm kiếm theo tên/email
page	int	Trang hiện tại
pageSize	int	Số lượng bản ghi
Response 200 OK
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
5.2 Lấy thông tin chi tiết User
GET /users/{userId}

Authorization

ADMIN | MANAGER | Self
Response
{
    "success": true,
    "data": {
        "userId":1,
        "fullName":"Nguyễn Văn A",
        "email":"farmer@gmail.com",
        "role":"FARMER",
        "organizationId":1,
        "phone":"090xxxxxxx",
        "isActive":true
    }
}
5.3 Tạo User mới
POST /users

Authorization

ADMIN | MANAGER
Request Body
{
    "organizationId":1,
    "fullName":"Trần Văn B",
    "email":"tranb@gmail.com",
    "password":"12345678",
    "role":"FARMER"
}
Field Description
Field	Type	Required	Description
organizationId	int	No	ID tổ chức
fullName	string	Yes	Họ tên
email	string	Yes	Email đăng nhập
password	string	Yes	Mật khẩu
role	string	Yes	Quyền user
Response 201 Created
{
    "success":true,
    "message":"Tạo người dùng thành công",
    "data":{
        "userId":10
    }
}
5.4 Cập nhật User
PUT /users/{userId}

Authorization:

ADMIN | MANAGER | Self

Request:

{
    "fullName":"Nguyễn Văn C",
    "phone":"098888888",
    "role":"PROCESSOR"
}

Response:

{
    "success":true,
    "message":"Cập nhật thành công"
}
5.5 Kích hoạt / Vô hiệu hóa tài khoản
PATCH /users/{userId}/status

Request:

{
    "isActive":false
}

Response:

{
    "success":true,
    "message":"Đã cập nhật trạng thái tài khoản"
}


6. Quản lý Danh mục sản phẩm — Categories
6.1 Lấy danh sách Category

GET /categories

Authorization:

Authenticated

Query:

Parameter	Type	Description
search	string	Tìm kiếm tên category
page	int	Trang hiện tại
pageSize	int	Số lượng bản ghi

Response:

{
    "success":true,
    "data":{
        "items":[
            {
                "categoryId":1,
                "name":"Rau củ",
                "description":"Nhóm rau củ quả",
                "isActive":true
            }
        ],
        "totalCount":10,
        "page":1,
        "pageSize":20,
        "totalPages":1
    }
}
6.2 Chi tiết Category

GET

/categories/{categoryId}

Authorization:

Authenticated

Response:

{
 "success":true,
 "data":{
    "categoryId":1,
    "name":"Coffee",
    "description":"Sản phẩm cà phê",
    "isActive":true
 }
}
6.3 Tạo Category

POST

/categories

Authorization:

ADMIN | MANAGER

Request:

{
    "name":"Coffee",
    "description":"Các loại cà phê"
}

Response:

{
 "success":true,
 "message":"Tạo category thành công",
 "data":{
    "categoryId":5
 }
}
6.4 Cập nhật Category

PUT

/categories/{categoryId}

Authorization:

ADMIN | MANAGER

Request:

{
    "name":"Coffee Premium",
    "description":"Danh mục cà phê cao cấp"
}
6.5 Thay đổi trạng thái Category

PATCH

/categories/{categoryId}/status

Request:

{
 "isActive":false
}
6.6 Xóa Category

DELETE

/categories/{categoryId}

Authorization:

ADMIN

Điều kiện:

Không được xóa nếu đang có Product sử dụng.
7. Quản lý Sản phẩm — Products (Fix)
7.1 Danh sách Product

GET

/products

Authorization:

Authenticated

Query:

Parameter	Description
organizationId	lọc tổ chức
categoryId	lọc danh mục
search	tìm tên
page	trang
pageSize	số lượng

Response:

{
 "success":true,
 "data":{
    "items":[
        {
            "productId":1,
            "name":"Cà phê Arabica",
            "categoryId":5,
            "categoryName":"Coffee",
            "unit":"kg",
            "organizationId":1,
            "isActive":true
        }
    ],
    "totalCount":20,
    "page":1,
    "pageSize":20,
    "totalPages":1
 }
}
7.2 Chi tiết Product

GET

/products/{productId}

Response:

{
 "success":true,
 "data":{
    "productId":1,
    "name":"Cà phê Arabica",
    "category":{
        "id":5,
        "name":"Coffee"
    },
    "unit":"kg",
    "organizationId":1
 }
}
7.3 Tạo Product

POST

/products

Authorization:

ADMIN | MANAGER

Request:

{
    "name":"Cà phê Arabica",
    "categoryId":5,
    "unit":"kg",
    "organizationId":1
}

Response:

{
 "success":true,
 "message":"Tạo sản phẩm thành công",
 "data":{
    "productId":10
 }
}
7.4 Update Product

PUT

/products/{productId}

Request:

{
"name":"Arabica Premium",
"categoryId":5,
"unit":"kg"
}
7.5 Product Status

PATCH

/products/{productId}/status

Request:

{
"isActive":false
}
7.6 Delete Product

DELETE

/products/{productId}

Authorization:

ADMIN
8. Supply Chain Events (Fix quyền)
8.3 Ghi nhận Event

POST

/batches/{batchId}/events

Authorization:

ADMIN
MANAGER
FARMER
PROCESSOR

Không cho:

INSPECTOR
CUSTOMER

vì Event là hoạt động vận hành.

11. Quality Inspection (Fix)
11.1 Danh sách kiểm định

GET

/batches/{batchId}/inspections

Authorization:

ADMIN
MANAGER
INSPECTOR
12. Certificate (Fix)
12.1 Danh sách chứng nhận

GET

/batches/{batchId}/certificates

Authorization:

Authenticated
13. Recall (Fix)
13.1 Danh sách Recall

GET

/recalls

Authorization:

ADMIN
INSPECTOR
16. Analytics (Fix)
Batch Distribution

GET

/analytics/batch-distribution

Authorization:

ADMIN
MANAGER
17. Lookup bổ sung

Bổ sung Category:

Method	Endpoint	Description
GET	/roles	Danh sách role
GET	/organization-types	Loại tổ chức
GET	/event-types	Loại event
GET	/categories	Danh mục sản phẩm
18. Error Code bổ sung

Thêm:

Code	HTTP	Mô tả
CATEGORY_IN_USE	409	Category đang được sử dụng
PRODUCT_IN_USE	409	Product đang có Batch
INVALID_QUANTITY	422	Số lượng không hợp lệ
INVALID_EVENT_TYPE	422	Event không hợp lệ
BATCH_ALREADY_RECALLED	409	Batch đã Recall

# Phụ lục A — Luồng hoạt động API
A.1. Quy trình đăng nhập
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
A.2. Quy trình tạo Batch
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
A.3. Quy trình ghi nhận Supply Chain Event
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
A.4. Quy trình Split Batch
Operator
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
A.5. Quy trình Merge Batch
Operator
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
A.6. Quy trình Public Trace
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


# Phụ lục B — JWT Token Structure
Access Token Payload
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
JWT Claims
Claim	Ý nghĩa
sub	ID người dùng
email	Email đăng nhập
role	Vai trò của người dùng
organizationId	ID tổ chức
organizationType	Loại tổ chức
jti	JWT Identifier
iat	Thời điểm phát hành Token
exp	Thời điểm hết hạn Token
Refresh Token
Được lưu trong bảng RefreshTokens.
Thời gian hết hạn mặc định 07 ngày.
Hỗ trợ Token Rotation.
Khi Refresh Token mới được cấp, Refresh Token cũ sẽ bị thu hồi (Revoke).

Phụ lục C — Tổng hợp Endpoint
STT	Method	Endpoint	Authorization	Mô tả
Authentication				
1	POST	/auth/login	Public	Đăng nhập
2	POST	/auth/refresh-token	Public	Làm mới Access Token
3	POST	/auth/logout	Bearer	Đăng xuất
4	GET	/auth/me	Bearer	Thông tin người dùng hiện tại
5	PUT	/auth/change-password	Bearer	Đổi mật khẩu
6	POST	/auth/forgot-password	Public	Quên mật khẩu
7	POST	/auth/reset-password	Public	Đặt lại mật khẩu
Organizations				
8	GET	/organizations	ADMIN	Danh sách tổ chức
9	GET	/organizations/{id}	ADMIN	Chi tiết tổ chức
10	POST	/organizations	ADMIN	Tạo tổ chức
11	PUT	/organizations/{id}	ADMIN	Cập nhật tổ chức
12	PATCH	/organizations/{id}/status	ADMIN	Thay đổi trạng thái
13	GET	/organizations/{id}/users	ADMIN, MANAGER	Người dùng thuộc tổ chức
14	GET	/organizations/{id}/products	ADMIN, MANAGER	Sản phẩm của tổ chức
Users				
15	GET	/users	ADMIN, MANAGER	Danh sách người dùng
16	GET	/users/{id}	ADMIN, MANAGER, Self	Chi tiết người dùng
17	POST	/users	ADMIN, MANAGER	Tạo người dùng
18	PUT	/users/{id}	ADMIN, MANAGER, Self	Cập nhật người dùng
19	PATCH	/users/{id}/status	ADMIN, MANAGER	Khóa/Mở khóa tài khoản
20	GET	/users/profile	Bearer	Hồ sơ cá nhân
21	PUT	/users/profile	Bearer	Cập nhật hồ sơ
Categories				
22	GET	/categories	Authenticated	Danh sách danh mục
23	GET	/categories/{id}	Authenticated	Chi tiết danh mục
24	POST	/categories	ADMIN, MANAGER	Tạo danh mục
25	PUT	/categories/{id}	ADMIN, MANAGER	Cập nhật danh mục
26	DELETE	/categories/{id}	ADMIN	Xóa danh mục
Products				
27	GET	/products	Authenticated	Danh sách sản phẩm
28	GET	/products/{id}	Authenticated	Chi tiết sản phẩm
29	POST	/products	ADMIN, MANAGER	Tạo sản phẩm
30	PUT	/products/{id}	ADMIN, MANAGER	Cập nhật sản phẩm
31	DELETE	/products/{id}	ADMIN	Xóa sản phẩm
32	GET	/products/{id}/images	Authenticated	Danh sách ảnh sản phẩm
33	POST	/products/{id}/images	ADMIN, MANAGER	Upload ảnh
34	DELETE	/products/images/{imageId}	ADMIN, MANAGER	Xóa ảnh
Batches				
35	GET	/batches	Authenticated	Danh sách Batch
36	GET	/batches/{id}	Authenticated	Chi tiết Batch
37	POST	/batches	FARMER, MANAGER	Tạo Batch
38	PUT	/batches/{id}	FARMER, MANAGER	Cập nhật Batch
39	PATCH	/batches/{id}/status	MANAGER	Cập nhật trạng thái
40	GET	/batches/{id}/qr-code	Authenticated	Lấy QR Code
41	GET	/batches/{id}/images	Authenticated	Danh sách ảnh Batch
42	POST	/batches/{id}/images	FARMER, MANAGER, PROCESSOR	Upload ảnh Batch
43	DELETE	/batches/images/{imageId}	FARMER, MANAGER	Xóa ảnh Batch
Supply Chain Events				
44	GET	/batches/{id}/events	Authenticated	Danh sách Event
45	GET	/events/{id}	Authenticated	Chi tiết Event
46	POST	/batches/{id}/events	FARMER, MANAGER, PROCESSOR	Thêm Event
47	GET	/batches/{id}/events/verify	ADMIN, INSPECTOR	Kiểm tra Hash Chain
Batch Split & Merge				
48	POST	/batches/{id}/split	PROCESSOR, MANAGER	Tách Batch
49	POST	/batches/merge	PROCESSOR, MANAGER	Gộp Batch
Quality Inspection				
50	GET	/batches/{id}/inspections	ADMIN, INSPECTOR	Danh sách kiểm định
51	POST	/batches/{id}/inspections	INSPECTOR	Tạo kiểm định
52	GET	/inspections/{id}	ADMIN, INSPECTOR	Chi tiết kiểm định
53	PUT	/inspections/{id}	INSPECTOR	Cập nhật kiểm định
Certificates				
54	GET	/batches/{id}/certificates	Authenticated	Danh sách chứng nhận
55	GET	/certificates/{id}	Authenticated	Chi tiết chứng nhận
56	POST	/batches/{id}/certificates	INSPECTOR	Cấp chứng nhận
57	DELETE	/certificates/{id}	ADMIN	Thu hồi chứng nhận
Recalls				
58	GET	/recalls	ADMIN, INSPECTOR	Danh sách Recall
59	GET	/recalls/{id}	ADMIN, INSPECTOR	Chi tiết Recall
60	POST	/recalls	ADMIN, INSPECTOR	Thu hồi Batch
61	PATCH	/recalls/{id}/resolve	ADMIN, INSPECTOR	Kết thúc Recall
Notifications				
62	GET	/notifications	Bearer	Danh sách thông báo
63	PATCH	/notifications/{id}/read	Bearer	Đánh dấu đã đọc
64	PATCH	/notifications/read-all	Bearer	Đánh dấu tất cả
65	GET	/notifications/unread-count	Bearer	Số thông báo chưa đọc
Public Traceability				
66	GET	/public/trace/{batchId}	Public	Tra cứu QR
67	GET	/public/trace/{batchId}/lineage	Public	Phả hệ Batch
Analytics				
68	GET	/analytics/overview	ADMIN	Dashboard tổng quan
69	GET	/analytics/batch-distribution	ADMIN, MANAGER	Thống kê Batch
70	GET	/analytics/processing-time	ADMIN, MANAGER	Thời gian xử lý
71	GET	/analytics/traceback/{batchId}	ADMIN, INSPECTOR	Truy vết ngược
Lookup				
72	GET	/roles	Authenticated	Danh sách Role
73	GET	/organization-types	Authenticated	Danh sách loại tổ chức
74	GET	/event-types	Authenticated	Danh sách loại Event
75	GET	/inspection-results	Authenticated	Danh sách kết quả kiểm định
76	GET	/certificate-types	Authenticated	Danh sách loại chứng nhận
77	GET	/recall-severities	Authenticated	Danh sách mức độ Recall
78	GET	/units	Authenticated	Danh sách đơn vị tính

Tài liệu này được xây dựng dựa trên thiết kế cơ sở dữ liệu, yêu cầu nghiệp vụ và kiến trúc của hệ thống Agricultural Supply Chain Traceability System. Các API tuân thủ chuẩn RESTful, sử dụng JWT Bearer Authentication, Entity Framework Core, SQL Server và Hash Chain nhằm đảm bảo tính toàn vẹn dữ liệu và khả năng truy xuất nguồn gốc trong chuỗi cung ứng nông sản.
