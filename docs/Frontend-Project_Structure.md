# Cấu trúc Dự án AgriTrace (Project Structure)

Chào mừng bạn đến với tài liệu cấu trúc dự án **AgriTrace**. Đây là hệ thống truy xuất nguồn gốc nông sản hiện đại (Agricultural Supply Chain Traceability System) được lấy cảm hứng từ nền tảng quốc gia **TraceViet**, nhưng được thiết kế lại với phong cách SaaS doanh nghiệp cao cấp, trực quan và tối ưu hóa trải nghiệm người dùng.

---

## 🚀 1. Công nghệ sử dụng (Technology Stack)

Dự án sử dụng các công nghệ hiện đại nhất ở thời điểm hiện tại:

- **Frontend Framework**: [React 18](https://react.dev/) (TypeScript)
- **Build Tool**: [Vite 8](https://vite.dev/) (Cực nhanh, tối ưu hóa phát triển)
- **Styling**:
  - [Tailwind CSS v4](https://tailwindcss.com/) (Hỗ trợ cấu hình theme trực tiếp qua CSS `@theme`)
  - [Radix UI Primitives](https://www.radix-ui.com/) (Hệ thống component không style, tăng khả năng tiếp cận - Accessibility)
  - [Lucide React](https://lucide.dev/) (Bộ icon thiết kế hiện đại)
- **Routing**: [React Router 7](https://reactrouter.com/) (Sử dụng hệ thống định tuyến hiện đại `createBrowserRouter`)
- **Biểu đồ**: [Recharts](https://recharts.org/) (Dùng cho trang Dashboard và Reports)
- **Quản lý trạng thái & Xác thực**: Context API (`AuthContext`)

---

## 📁 2. Chi tiết Cấu trúc Thư mục (Directory Tree)

Dưới đây là sơ đồ tổ chức thư mục của dự án và chức năng của từng phần:

```text
C:\Users\Leo\Desktop\Premium Modern UI Design\
├── package.json                    # Khai báo thư viện phụ thuộc (React 19, Vite 8, Tailwind v4, v.v.)
├── vite.config.ts                  # Cấu hình Vite (tích hợp plugin React và Tailwind v4)
├── postcss.config.mjs              # Cấu hình PostCSS
├── index.html                      # File HTML chính (Entrypoint)
├── ATTRIBUTIONS.md                 # Ghi nhận nguồn tài nguyên sử dụng
├── README.md                       # Hướng dẫn chạy và tổng quan dự án
├── guidelines/
│   └── Guidelines.md               # Quy chuẩn lập trình và thiết kế
└── src/
    ├── main.tsx                    # Điểm khởi đầu của ứng dụng React
    ├── styles/                     # Quản lý giao diện, theme và CSS toàn cục
    │   ├── fonts.css               # Định nghĩa font Inter và Material Symbols
    │   ├── index.css               # Nơi import Tailwind và cấu hình CSS cơ bản
    │   ├── tailwind.css            # Tích hợp Tailwind v4
    │   └── theme.css               # Cấu hình Theme chính của AgriTrace (màu sắc, radius, dark mode)
    │
    ├── imports/
    │   └── pasted_text/
    │       └── agri-trace-design-system.md  # Chi tiết yêu cầu hệ thống thiết kế AgriTrace
    │
    ├── __tests__/                 # Thư mục chứa các file test (vitest)
    │    | ...                    # Các file test (*.test.tsx, *.test.ts)
    │    |__App.test.jsx          # File test ví dụ cho App component
    |              
    │
    └── app/
        ├── App.tsx                 # Khởi tạo AuthProvider và RouterProvider
        ├── routes.ts               # Định nghĩa tất cả các routes của ứng dụng (React Router 7)
        │
        ├── context/
        │   └── AuthContext.tsx     # Quản lý trạng thái đăng nhập, phân quyền người dùng (Farmer, Inspector, Admin)
        │
        ├── data/
        │   └── mockData.ts         # Mock data chi tiết cho toàn bộ ứng dụng (Batches, Timelines, Recalls, Users)
        │
        ├── components/
        │   ├── figma/
        │   │   └── ImageWithFallback.tsx  # Component hiển thị hình ảnh từ Figma hoặc fallback thông minh
        │   │
        │   ├── layout/             # Bố cục giao diện trang Dashboard / Admin
        │   │   ├── AppLayout.tsx   # Layout bao quanh (chứa Sidebar và TopBar, quản lý responsive)
        │   │   ├── Sidebar.tsx     # Thanh điều hướng trái với màu xanh AgriTech (#1B5E20)
        │   │   └── TopBar.tsx      # Thanh công cụ phía trên (Search, Thông báo, User Profile, Ngôn ngữ)
        │   │
        │   └── ui/                 # Bộ thư viện UI component cao cấp (tương tự Radix/Shadcn)
        │       ├── accordion.tsx
        │       ├── alert.tsx
        │       ├── badge.tsx       # Hiển thị trạng thái lô hàng, cấp độ cảnh báo thu hồi
        │       ├── button.tsx      # Nút bấm tương tác đa dạng variant (primary, secondary, outline,...)
        │       ├── card.tsx        # Container hiển thị thông tin
        │       ├── carousel.tsx
        │       ├── chart.tsx       # Wrapper hỗ trợ vẽ biểu đồ Recharts
        │       ├── dialog.tsx      # Hộp thoại popup hiện đại
        │       ├── navigation-menu.tsx
        │       ├── progress.tsx    # Thanh tiến trình (tiến trình vận chuyển lô hàng)
        │       ├── select.tsx      # Dropdown chọn giá trị tối ưu hóa
        │       ├── sheet.tsx       # Panel trượt từ cạnh màn hình (Sidebar trên mobile)
        │       ├── tabs.tsx        # Chuyển đổi tab thông tin mượt mà
        │       ├── tooltip.tsx     # Hiển thị chú thích nhanh khi hover
        │       └── ...             # Và các UI components nhỏ gọn khác (checkbox, table, separator, slider, input...)
        │
        └── pages/                  # Toàn bộ màn hình chức năng của hệ thống
            ├── HomePage.tsx               # Trang chủ giới thiệu nền tảng, các con số thống kê và tìm kiếm nhanh mã lô hàng
            ├── LoginPage.tsx              # Trang đăng nhập thiết kế đẹp mắt với form minh họa chuyên nghiệp
            ├── PublicTracePage.tsx        # Trang truy xuất nguồn gốc công cộng dành cho người tiêu dùng (Quét QR Code)
            ├── DashboardPage.tsx          # Trang tổng quan thông tin, biểu đồ phân tích dữ liệu chuỗi cung ứng
            ├── BatchManagementPage.tsx    # Quản lý danh sách lô hàng nông sản (Bộ lọc, Tìm kiếm, Thêm lô hàng mới)
            ├── BatchDetailPage.tsx        # Chi tiết lô hàng, tiến trình vận chuyển theo dòng thời gian (Blockchain Traceability Timeline)
            ├── SupplyChainPage.tsx        # Giao diện trực quan hóa sơ đồ chuỗi cung ứng (từ Nông trại đến Siêu thị)
            ├── InspectionPage.tsx         # Quản lý các chứng nhận kiểm định chất lượng, an toàn thực phẩm VietGAP/GlobalGAP
            ├── RecallPage.tsx             # Quản lý các yêu cầu cảnh báo và thu hồi sản phẩm lỗi/không an toàn
            ├── ReportsPage.tsx            # Báo cáo thống kê chi tiết sản lượng, hiệu suất vận chuyển và kiểm định chất lượng
            ├── UsersPage.tsx              # Quản lý người dùng, nhân sự trong hệ thống phân quyền của doanh nghiệp
            └── ProfilePage.tsx            # Trang cá nhân của người dùng, đổi mật khẩu và thông tin liên hệ
```

---

## 🗺️ 3. Định tuyến và Phân quyền (Routes & Authentication)

Hệ thống định tuyến được cấu hình tập trung tại `src/app/routes.ts`:

### 🌐 Các Routes Công cộng (Public Routes)
- `/` - **Trang chủ (HomePage)**: Giới thiệu, tra cứu nhanh.
- `/login` - **Đăng nhập (LoginPage)**: Cho phép truy cập hệ thống quản trị.
- `/trace/:id` - **Truy xuất công cộng (PublicTracePage)**: Hiển thị đầy đủ thông tin xuất xứ sản phẩm kèm chữ ký Blockchain xác thực khi người tiêu dùng quét mã QR.

### 🛡️ Các Routes Nội bộ (Protected /app Routes)
Tất cả các trang dưới đây đều nằm trong bố cục `AppLayout` và yêu cầu tài khoản đăng nhập:
- `/app/dashboard` - Bảng điều khiển phân tích.
- `/app/batches` - Danh sách lô hàng.
- `/app/batches/:id` - Chi tiết hành trình lô hàng.
- `/app/supply-chain` - Sơ đồ chuỗi cung ứng.
- `/app/inspection` - Nhật ký kiểm định chất lượng.
- `/app/recall` - Quản lý thu hồi sản phẩm.
- `/app/reports` - Biểu đồ báo cáo.
- `/app/users` - Phân quyền cán bộ/nhân viên.
- `/app/profile` - Thiết lập tài khoản.

---

## 🗃️ 4. Mô hình Dữ liệu (Data Models)

Các cấu trúc dữ liệu chính trong hệ thống (định nghĩa tại `src/app/data/mockData.ts`):

1. **Batch (Lô hàng nông sản)**:
   - `id`: Mã lô hàng (ví dụ: `BTH-2024-001`).
   - `product`: Tên loại nông sản (ví dụ: Organic Dragon Fruit).
   - `farm` / `farmer`: Tên trang trại và nông dân sản xuất.
   - `harvestDate`: Ngày thu hoạch.
   - `status`: Trạng thái hành trình chuỗi cung ứng (`Harvested`, `Processing`, `Packaged`, `In Transit`, `Distributed`, `At Retail`, `Recalled`).
   - `gps`: Toạ độ định vị nông trại phục vụ bản đồ số.

2. **TimelineEvent (Sự kiện Chuỗi cung ứng)**:
   - Mỗi sự kiện đại diện cho một bước trong chuỗi cung ứng được băm mã hóa liên kết (Blockchain-like).
   - `stage`: Bước hành trình (Thu hoạch, Đóng gói, Kiểm định, Vận chuyển...).
   - `hash` & `prevHash`: Tạo chuỗi liên kết dữ liệu minh bạch, chống giả mạo.
   - `verified`: Trạng thái xác thực chữ ký số kiểm định.

3. **RecallItem (Sự kiện Thu hồi)**:
   - Cảnh báo thu hồi nông sản khi có sự cố chất lượng.
   - `severity`: Mức độ cảnh báo (`Critical`, `High`, `Medium`, `Low`).
   - `status`: Trạng thái xử lý (`Active`, `Resolved`, `Pending`).

---

## 🎨 5. Quy chuẩn Thiết kế & Theme (Design Guidelines)

Màu sắc chủ đạo được cấu hình chuẩn AgriTech dựa trên màu xanh cây tươi mát thể hiện nông nghiệp xanh bền vững (định nghĩa tại `src/app/styles/theme.css`):

- **Primary Green (`--agri-primary`)**: `#2E7D32` (Xanh lục đậm thương hiệu)
- **Secondary Green (`--agri-secondary`)**: `#66BB6A` (Xanh lá tươi cho tương tác phụ)
- **Light Green (`--agri-light`)**: `#E8F5E9` (Xanh nhạt làm nền hoặc hover)
- **Recall Red (`--agri-recall`)**: `#E53935` (Đỏ cảnh báo thu hồi khẩn cấp)
- **Warning Orange (`--agri-warning`)**: `#FFB300` (Cam cảnh báo kiểm tra)
- **Border Radius**: Cố định `12px` (`0.75rem`) tạo cảm giác giao diện hiện đại, mềm mại.
- **Phông chữ**: Font `Inter` hiện đại, thanh lịch kết hợp cùng `Material Symbols Outlined` trực quan.
