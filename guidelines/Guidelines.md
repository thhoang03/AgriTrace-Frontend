# Quy Chuẩn Lập Trình & Thiết Kế Giao Diện — AgriTrace Frontend Guidelines

Tài liệu này định nghĩa các nguyên tắc phát triển phần mềm, quy chuẩn viết code và chuẩn mực thiết kế UI/UX dành cho đội ngũ phát triển ứng dụng **AgriTrace Frontend** (React 19 + TypeScript + Vite + Tailwind CSS 4).

---

## 1. Nguyên Tắc Lập Trình (Engineering Principles)

### 1.1 Tổ Chức Code Theo Feature (Feature-Driven Architecture)
- Mỗi mô-đun nghiệp vụ độc lập phải nằm trong một thư mục riêng thuộc `src/features/<feature_name>/`.
- Mỗi mô-đun feature thường bao gồm:
  - `<feature>.api.ts`: Chứa các hàm gọi HTTP request tới Backend.
  - `<feature>.store.ts`: Zustand store quản lý Client State của riêng feature đó (nếu có).
  - `<feature>.types.ts`: Định nghĩa TypeScript interfaces/enums nội bộ.
- Tránh viết logic gọi API trực tiếp trong UI components; hãy phân tách qua custom React Query hooks hoặc API modules.

### 1.2 An Toàn Kiểu Dữ Liệu (Strict TypeScript Safety)
- Luôn định nghĩa kiểu dữ liệu tường minh cho Request DTOs, Response DTOs và Component Props.
- Tuyệt đối **không sử dụng kiểu `any`**. Khi xử lý dữ liệu động chưa xác định, dùng `unknown` kèm Type Guards.
- Tận dụng các kiểu dữ liệu tự động sinh từ OpenAPI Spec trong `src/types/api.ts`.

### 1.3 Quản Lý Trạng Thái & Server State
- **Server State (Dữ liệu từ API):** Sử dụng TanStack React Query 5 (`useQuery`, `useMutation`) để tự động cache, invalidate và handle loading/error status.
- **Global Client State (Auth, Theme...):** Sử dụng `AuthContext` hoặc Zustand Store.
- **Local Component State:** Sử dụng `useState` / `useReducer` chuẩn của React.

---

## 2. Quy Chuẩn Thiết Kế Giao Diện (Design System & UI Aesthetics)

Dự án AgriTrace hướng tới trải nghiệm người dùng cao cấp, hiện đại và tạo ấn tượng thị giác mạnh mẽ với chủ đề Nông nghiệp Công nghệ cao.

### 2.1 Bảng Màu Thương Hiệu (Agricultural Color Palette)
- **Màu chủ đạo (Primary):** Hạt màu Emerald / Green (`emerald-600`, `emerald-500`) thể hiện sự tươi mới, nông sản sạch.
- **Màu phụ (Accent):** Teal & Amber (`teal-500`, `amber-500`) tạo điểm nhấn thị giác cho trạng thái (Thu hoạch, Chế biến, Đóng gói).
- **Màu nền (Background):** Sleek Dark Mode (`slate-950`, `slate-900`) hoặc Clean Light Mode (`slate-50`, `white`).
- **Màu trạng thái (Status Badges):**
  - Success / Active: `emerald-500/10` + `text-emerald-600`
  - Warning / Recall: `rose-500/10` + `text-rose-600`
  - Pending / Processing: `amber-500/10` + `text-amber-600`

### 2.2 Hiệu Ứng Glassmorphism & Vi Viền (Glassmorphism & Borders)
- Sử dụng hiệu ứng mờ nhòe kính hiện đại cho các Header, Card và Modal Overlay:
  ```html
  class="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
  ```
- Vi viền tinh tế (`border-slate-200/60 dark:border-slate-800/60`) thay vì các đường kẻ đậm gây rối mắt.

### 2.3 Biểu Tượng & Phông Chữ (Iconography & Typography)
- **Bộ icon thống nhất:** Chỉ sử dụng biểu tượng từ thư viện `lucide-react`. Đảm bảo nét vẽ đồng đều (`strokeWidth={1.75}`).
- **Typography:** Sử dụng phông chữ không chân hiện đại (Inter / System UI Stack).
  - Trọng số font chữ: `font-normal` cho body text, `font-medium` cho labels, `font-semibold` / `font-bold` cho headings.
  - Phân cấp Heading: `h1` (text-3xl / text-4xl), `h2` (text-2xl), `h3` (text-xl). Mỗi trang công khai chỉ chứa 1 thẻ `h1`.

### 2.4 Vi Hoạt Ảnh & Phản Hồi Tương Tác (Micro-Animations & Micro-Interactions)
- Thêm hiệu ứng di chuột (Hover states) mượt mà cho nút bấm, card sản phẩm và các thành phần tương tác:
  ```html
  class="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
  ```
- Luôn hiển thị trạng thái đang tải (Loading Skeleton / Spinner) khi người dùng thực hiện thao tác hoặc đang chờ dữ liệu API.

### 2.5 Thiết Kế Đáp Ứng Đa Thiết Bị (Mobile-First Responsiveness)
- Đảm bảo tất cả các trang (đặc biệt là trang tra cứu QR Code `PublicTracePage`) hoạt động hoàn hảo trên màn hình điện thoại di động (width < 640px).
- Sử dụng Flexbox (`flex flex-col md:flex-row`) và CSS Grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) để tự động sắp xếp layout theo màn hình.

---

## 3. Quy Chuẩn Tích Hợp API & Xử Lý Lỗi (API Integration Standard)

### 3.1 HTTP Client
- Mọi request tới Backend bắt buộc đi qua Axios instance định nghĩa tại `src/lib/api/http.ts`.
- **Không bao giờ dùng `fetch` trực tiếp** hoặc khởi tạo Axios instance riêng lẻ.

### 3.2 Chuẩn Bọc Lỗi & Phản Hồi
- Backend trả về envelope `ApiResponse<T>`:
  ```typescript
  interface ApiResponse<T> {
    statusCode: number;
    isSuccess: boolean;
    errorMessages: string[];
    result: T;
  }
  ```
- Tại tầng API Client, kiểm tra `isSuccess` và trích xuất `result`. Khi `isSuccess === false`, tự động throw error chứa `errorMessages` để React Query hoặc UI component hiển thị toast thông báo cho người dùng.
