# Kiến Trúc Cấu Trúc Dự Án Frontend — AgriTrace

Tài liệu này mô tả chi tiết sơ đồ tổ chức thư mục, phân tầng kiến trúc và quy chuẩn lập trình của **AgriTrace Frontend** (React 19 + TypeScript + Vite + Tailwind CSS 4).

---

## 🏗️ Sơ Đồ Cấu Trúc Thư Mục Thực Tế (Project Directory Layout)

```
AgriTrace-Frontend/
├── public/                      # Tài nguyên tĩnh phục vụ trực tiếp
│   └── favicon.svg
├── src/                         # Mã nguồn ứng dụng
│   ├── components/              # Components dùng chung (Shared UI)
│   │   ├── common/              #   Modal, Dialogs dùng chung (QRScannerModal...)
│   │   ├── home/                #   Sub-components cho trang chủ (BatchShowcaseSection, PartnerModal...)
│   │   ├── layout/              #   Layout wrappers (Header, Footer, Sidebar)
│   │   └── ui/                  #   Atomic UI primitives (Button, Card, Input, Badge...)
│   │
│   ├── config/                  # Cấu hình môi trường
│   │   └── env.ts               #   Truy xuất biến môi trường VITE_API_BASE_URL
│   │
│   ├── contexts/                # React Context Providers
│   │   └── AuthContext.tsx      #   Quản lý phiên đăng nhập và User Profile
│   │
│   ├── features/                # Feature Modules (Chia theo nhóm chức năng nghiệp vụ)
│   │   ├── analytics/           #   Feature: Báo cáo & Thống kê dashboard
│   │   ├── auth/                #   Feature: Đăng nhập, token, permissions
│   │   │   ├── auth.api.ts      #     API requests (login, logout, refresh)
│   │   │   ├── auth.store.ts    #     Zustand store cho Auth state
│   │   │   └── auth.types.ts    #     TypeScript types cho Auth
│   │   ├── batches/             #   Feature: Quản lý lô hàng, QR code, Split/Merge
│   │   ├── categories/          #   Feature: Danh mục sản phẩm
│   │   ├── certificates/        #   Feature: Quản lý chứng nhận chất lượng
│   │   ├── dashboard/           #   Feature: Bảng điều khiển quản trị
│   │   ├── event-requests/      #   Feature: Yêu cầu duyệt sự kiện
│   │   ├── inspection/          #   Feature: Phê duyệt & Kiểm định chất lượng
│   │   ├── notifications/       #   Feature: Thông báo người dùng
│   │   ├── organizations/       #   Feature: Quản lý tổ chức
│   │   ├── products/            #   Feature: Quản lý sản phẩm nông sản
│   │   ├── public-trace/        #   Feature: Tra cứu công khai lô hàng
│   │   ├── recall/              #   Feature: Thu hồi sản phẩm khẩn cấp
│   │   ├── supply-chain/        #   Feature: Sự kiện chuỗi cung ứng & Hash Chain
│   │   └── users/               #   Feature: Quản lý người dùng
│   │
│   ├── hooks/                   # Custom React Hooks dùng chung
│   │   └── useDebounce.ts
│   │
│   ├── lib/                     # Utilities & API Client Layer
│   │   ├── api/                 #   Cấu hình HTTP client
│   │   │   ├── http.ts          #     Axios instance, Interceptors, Refresh Token logic
│   │   │   ├── lookup.ts        #     Lookup Master Data APIs
│   │   │   └── token-storage.ts #     Quản lý lưu trữ JWT Access/Refresh tokens
│   │   └── utils.ts             #   Helper functions
│   │
│   ├── pages/                   # Top-level Page Components (Routes chính)
│   │   ├── ChangePasswordPage.tsx # Trang đổi mật khẩu
│   │   ├── HomePage.tsx         # Trang chủ cổng thông tin AgriTrace
│   │   ├── LoginPage.tsx        # Trang đăng nhập
│   │   ├── NotFoundPage.tsx     # Trang 404 Not Found
│   │   ├── PublicLineagePage.tsx# Trang phả hệ lô hàng (Split/Merge history)
│   │   └── PublicTracePage.tsx  # Trang tra cứu nguồn gốc nông sản công khai (掃 QR Code)
│   │
│   ├── types/                   # TypeScript Type Definitions
│   │   ├── api.ts               #   Auto-generated types từ Swagger OpenAPI Spec
│   │   └── index.ts             #   Custom App Types
│   │
│   ├── App.tsx                  # Đăng ký App Router & Global Providers
│   ├── main.tsx                 # React DOM Root Entry
│   └── index.css                # Global Styles & Tailwind Imports
│
├── .env.example                 # Mẫu cấu hình môi trường
├── package.json                 # Dependencies & Build Scripts
├── tsconfig.json                # TypeScript Configuration
└── vite.config.ts               # Vite Bundler Configuration
```

---

## 🏛️ Phân Tầng Kiến Trúc (Layered Architecture Responsibilities)

| Tầng | Thư Mục | Vai Trò & Trách Nhiệm |
|---|---|---|
| **Bootstrap / App** | `src/App.tsx`, `src/main.tsx` | Khởi tạo React App, cấu hình `BrowserRouter`, bọc `AuthProvider` và thiết lập hệ thống định tuyến (Routing). |
| **Pages Layer** | `src/pages/` | Thành phần trang cấp cao nhất, chịu trách nhiệm kết hợp các UI components và feature hooks để dựng thành 1 trang hoàn chỉnh. |
| **Feature Layer** | `src/features/<feature>/` | Mô-đun hóa theo tính năng nghiệp vụ. Mỗi thư mục chứa API client (`.api.ts`), State store (`.store.ts`), Types (`.types.ts`) riêng biệt. |
| **Shared Components**| `src/components/` | Chứa các thành phần UI dùng chung (Modals, Headers, Footers, QR Scanner, Badges, Buttons). |
| **Core Utilities** | `src/lib/api/` | Quản lý kết nối HTTP qua Axios, tự động chèn JWT Header, bắt lỗi `401 Unauthorized` để tự động làm mới token (`Refresh Token`). |

---

## 📐 Quy Chuẩn Đặt Tên (Naming Conventions)

- **Thành phần React Components:** Đặt tên dạng `PascalCase.tsx` (ví dụ: `PublicTracePage.tsx`, `QRScannerModal.tsx`).
- **File tiện ích / API Modules:** Đặt tên dạng `kebab-case.ts` (ví dụ: `token-storage.ts`, `auth.api.ts`).
- **Thư mục Feature:** Đặt tên dạng `kebab-case/` (ví dụ: `public-trace/`, `supply-chain/`).
- **CSS / Styling:** Sử dụng trực tiếp các utility classes của Tailwind CSS 4, hạn chế tối đa việc viết inline style cứng.
