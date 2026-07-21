# Hướng dẫn Sử dụng Mock API

## Tổng quan

Hệ thống Mock API của AgriTrace Frontend được thiết kế với kiến trúc tập trung, cho phép bật/tắt mock cho toàn bộ ứng dụng hoặc từng module riêng lẻ thông qua biến môi trường.

### Kiến trúc

```
src/
├── mocks/
│   ├── config.ts              # Cấu hình mock trung tâm
│   ├── data/
│   │   └── index.ts           # Dữ liệu mock
│   ├── handlers/
│   │   ├── auth.mock.ts       # Handler mock cho Auth
│   │   ├── organizations.mock.ts  # Handler mock cho Organizations
│   │   ├── batches.mock.ts    # Handler mock cho Batches
│   │   └── ...                # Handler cho các module khác
│   └── utils/
│       └── index.ts           # Tiện ích mock (delay, helpers)
├── lib/api/
│   └── mock-adapter.ts        # Điểm quyết định duy nhất
└── features/
    └── *.api.ts               # API calls (không chứa logic mock)
```

**Nguyên tắc chính**: Mock-adapter là điểm quyết định duy nhất. Tất cả API của feature thực hiện HTTP request bình thường. Adapter quyết định sử dụng mock handler hay backend thực tế.

## Biến Môi Trường

### Bật/Tắt Mock Toàn Cục

```bash
# Bật mock cho toàn bộ ứng dụng (mặc định)
VITE_ENABLE_MOCKS=true

# Tắt mock cho toàn bộ ứng dụng
VITE_ENABLE_MOCKS=false
```

### Bật/Tắt Mock theo Module

Khi `VITE_ENABLE_MOCKS=true`, bạn có thể tắt mock cho từng module riêng lẻ:

```bash
# Tắt mock cho module Organizations
VITE_MOCK_ORGANIZATIONS=false

# Tắt mock cho module Auth
VITE_MOCK_AUTH=false

# Tắt mock cho module Batches
VITE_MOCK_BATCHES=false

# Tắt mock cho module Categories
VITE_MOCK_CATEGORIES=false

# Tắt mock cho module Recalls
VITE_MOCK_RECALLS=false

# Tắt mock cho module Users
VITE_MOCK_USERS=false

# Tắt mock cho module Inspections
VITE_MOCK_INSPECTIONS=false

# Tắt mock cho module Supply Chain
VITE_MOCK_SUPPLY_CHAIN=false

# Tắt mock cho module Reports
VITE_MOCK_REPORTS=false

# Tắt mock cho module Analytics
VITE_MOCK_ANALYTICS=false

# Tắt mock cho module Dashboard
VITE_MOCK_DASHBOARD=false

# Tắt mock cho module Notifications
VITE_MOCK_NOTIFICATIONS=false

# Tắt mock cho module Certificates
VITE_MOCK_CERTIFICATES=false

# Tắt mock cho module Products
VITE_MOCK_PRODUCTS=false

# Tắt mock cho module Split/Merge
VITE_MOCK_SPLIT_MERGE=false
```

## Luật Hoạt Động

### Quyết định Mock

```
HTTP Request
      │
      ▼
Mock Adapter
      │
      ├── Global mock disabled?
      │    │ Yes → Real Backend
      │    │ No  → Continue
      │
      ├── No matching route?
      │    │ Yes → Real Backend
      │    │ No  → Continue
      │
      ├── Module disabled?
      │    │ Yes → Real Backend
      │    │ No  → Continue
      │
      └── Module enabled
           │
           ▼
      Mock Handler
           │
           ▼
      Mock Response
```

### Quy tắc Quan Trọng

1. **Global flag ưu tiên**: Khi `VITE_ENABLE_MOCKS=false`, tất cả module flags bị bỏ qua và sử dụng real API
2. **Module flag phụ thuộc**: Module flags chỉ có hiệu quả khi global mock được bật
3. **Fallback**: Nếu không có route match, request được forward sang real backend
4. **Không lỗi**: Adapter không throw error khi không có mock, đơn giản forward request

## Cấu hình File

### src/mocks/config.ts

```typescript
const globalMockEnabled = import.meta.env.VITE_ENABLE_MOCKS !== "false";

export const mock = {
  global: globalMockEnabled,

  // Module flags được derive từ global flag
  auth: globalMockEnabled && import.meta.env.VITE_MOCK_AUTH !== "false",
  organizations: globalMockEnabled && import.meta.env.VITE_MOCK_ORGANIZATIONS !== "false",
  categories: globalMockEnabled && import.meta.env.VITE_MOCK_CATEGORIES !== "false",
  batches: globalMockEnabled && import.meta.env.VITE_MOCK_BATCHES !== "false",
  // ... các module khác
};
```

### src/lib/api/mock-adapter.ts

Mock adapter sử dụng routing table có thứ tự để xác định module:

```typescript
const ROUTING_TABLE: RouteRule[] = [
  // Route cụ thể trước
  { pattern: /^\/api\/batches\/[^/]+\/split$/, moduleFlag: "splitMerge", handlers: splitMergeHandlers },
  { pattern: /^\/api\/batches\/[^/]+\/merge$/, moduleFlag: "splitMerge", handlers: splitMergeHandlers },
  // Route chung sau
  { pattern: /^\/api\/auth/, moduleFlag: "auth", handlers: authHandlers },
  { pattern: /^api\/organizations/, moduleFlag: "organizations", handlers: organizationHandlers },
  // ... các route khác
];
```

**Ưu tiên route**: Route cụ thể phải xuất hiện trước route chung. Ví dụ: `/api/batches/*/split` xuất hiện trước `/api/batches/*` để tránh chọn handler sai.

## Ví dụ Sử Dụng

### Ví dụ 1: Bắt đầu với Mock

```bash
# File .env.local
VITE_ENABLE_MOCKS=true
```

Tất cả modules sử dụng mock data.

### Ví dụ 2: Chỉ Organizations dùng Real API

```bash
# File .env.local
VITE_ENABLE_MOCKS=true
VITE_MOCK_ORGANIZATIONS=false
```

Organizations sử dụng real backend, các module khác vẫn dùng mock.

### Ví dụ 3: Tắt toàn bộ Mock

```bash
# File .env.local
VITE_ENABLE_MOCKS=false
```

Tất cả modules sử dụng real backend (module flags bị bỏ qua).

### Ví dụ 4: Từng module chuyển sang Real API

Khi backend sẵn sàng cho từng module:

```bash
# Bước 1: Auth sẵn sàng
VITE_ENABLE_MOCKS=true
VITE_MOCK_AUTH=false

# Bước 2: Organizations sẵn sàng
VITE_ENABLE_MOCKS=true
VITE_MOCK_AUTH=false
VITE_MOCK_ORGANIZATIONS=false

# Bước 3: Tất cả sẵn sàng
VITE_ENABLE_MOCKS=false
```

## Thêm Module Mock Mới

### Bước 1: Tạo Handler

Tạo file `src/mocks/handlers/[module-name].mock.ts`:

```typescript
import type { AxiosRequestConfig } from "axios";
import type { MockResponse } from "../utils";
import { ok } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

export const moduleHandlers: Record<string, MockHandler> = {
  "GET /module-endpoint": () => ok({ data: "mock response" }),
  "POST /module-endpoint": (config) => ok({ ...config.data, id: "NEW-ID" }),
};
```

### Bước 2: Thêm Flag vào Config

Thêm vào `src/mocks/config.ts`:

```typescript
export const mock = {
  // ... existing flags
  newModule: globalMockEnabled && import.meta.env.VITE_MOCK_NEW_MODULE !== "false",
};
```

### Bước 3: Thêm Route vào Adapter

Thêm vào routing table trong `src/lib/api/mock-adapter.ts`:

```typescript
import { moduleHandlers } from "../../mocks/handlers/module-name.mock";

const ROUTING_TABLE: RouteRule[] = [
  // ... existing routes
  { pattern: /^\/api\/new-module/, moduleFlag: "newModule", handlers: moduleHandlers },
];
```

### Bước 4: Tạo API File

Tạo `src/features/[module-name]/[module-name].api.ts`:

```typescript
import { get, post, put, patch, del } from "../../lib/api";

export const moduleApi = {
  getAll: () => get("/module-endpoint"),
  create: (data) => post("/module-endpoint", data),
  // ... các methods khác
};
```

## Debugging

### Kiểm tra Mock đang hoạt động

1. Mở DevTools Network tab
2. Thực hiện request
3. Nếu mock hoạt động:
   - Request không gửi đến server
   - Response trả về ngay lập tức (~300ms delay)
   - Status: 200 OK

### Kiểm tra Config

```typescript
import { mock } from "../mocks/config";

console.log("Mock global:", mock.global);
console.log("Mock auth:", mock.auth);
console.log("Mock organizations:", mock.organizations);
```

### Xác nhận không có Inline Mock

```bash
# Tìm kiếm USE_MOCK trong code
grep -r "USE_MOCK" src/features/

# Tìm kiếm mockDelay trong code
grep -r "mockDelay" src/features/

# Tìm kiếm import từ src/mocks trong features
grep -r "from.*src/mocks" src/features/
```

Không nên có kết quả nào từ các lệnh trên.

## Rollback Strategy

Để tạm thời quay lại sử dụng real backend cho một module cụ thể:

```bash
# Bắt đầu với mock
VITE_ENABLE_MOCKS=true

# Tắt mock cho module cần rollback
VITE_MOCK_ORGANIZATIONS=false
```

Điều này cho phép Organizations sử dụng real backend trong khi các module khác vẫn dùng mock.

## Lợi ích

- **Điểm quyết định duy nhất**: Mock-adapter loại bỏ sự nhầm lẫn
- **Biến môi trường**: Cho phép cấu hình runtime
- **Không boilerplate**: Không cần code mock trong từng API file
- **Migration an toàn**: Cho phép chuyển từng module sang real API
- **Kiến trúc thống nhất**: Cấu trúc nhất quán trên toàn bộ modules
- **Dễ mở rộng**: Thêm module mới chỉ cần thêm flag + handler
- **Phân tách rõ ràng**: API public và mock implementation tách biệt

## Troubleshooting

### Mock không hoạt động

1. Kiểm tra `VITE_ENABLE_MOCKS=true`
2. Kiểm tra module flag không bị set thành `false`
3. Kiểm tra route có match với routing table
4. Kiểm tra handler có tồn tại trong module handlers

### Request vẫn gửi đến server

1. Kiểm tra `mock.global` trong config
2. Kiểm tra module flag tương ứng
3. Kiểm tra route pattern có match URL
4. Xác nhận handler trả về undefined (không match)

### Mock data không cập nhật

Mock data được lưu trong memory. Nếu cần persistence:
- Sử dụng localStorage trong handler
- Hoặc kết nối đến mock server thực tế

## Liên hệ

Nếu có vấn đề hoặc câu hỏi về mock API, vui lòng liên hệ team development.
