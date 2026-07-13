# 🧑‍💻 AI CONTEXT - MEMBER: LEO

> **Lưu ý dành cho AI:** Tôi là **Leo**. Đây là không gian lưu trữ tiến độ, các quyết định kỹ thuật và trạng thái code của riêng tôi trong dự án. Hãy đọc kỹ phần này trước khi hỗ trợ tôi viết code.

---

## 🛠️ PHẦN VIỆC ĐƯỢC GIAO (MY SCOPE)
*   Chịu trách nhiệm Module: **Frontend Core** (API Layer, HTTP Client interceptors, Project Structure)
*   Các bảng/Service liên quan trực tiếp: `/src/lib/api/`, `/src/features/*/`

## 📌 QUY ƯỚC CÁ NHÂN VỚI AI
*   Giải thích kỹ thuật bằng **Tiếng Việt**.
*   Luôn đọc `docs/Frontend_project_structure.md` và `guidelines/Guidelines.md` trước khi code.
*   Feature APIs dùng helpers từ `lib/api/http.ts` (get, getList, post, put, patch, del) — không dùng raw axios.
*   File naming: `<feature>.types.ts`, `<feature>.api.ts`, `<feature>.queries.ts`, `<PageName>.tsx`.
*   Build phải pass (`vite build`) trước khi báo done.
*   Mock API được bật/tắt qua biến môi trường `VITE_ENABLE_MOCKS`. File handlers tại `lib/api/mock-handlers.ts`.

---

## 🪵 NHẬT KÝ TIẾN ĐỘ CÁ NHÂN (MY WORK LOG)
*(Nhật ký cập nhật mới nhất đưa lên đầu)*

### 🕒 [2026-07-09] - Thêm Mock API Layer
*   **AI hỗ trợ:** opencode (deepseek-v4-flash-free)
*   **Trạng thái:** 🟢 Hoàn thành
*   **Nội dung đã làm:**
    *   [X] Tạo `lib/api/mock-handlers.ts`: handlers cho tất cả endpoint (auth, batches, recalls, users, inspections, supply-chain, dashboard, reports).
    *   [X] Tạo `lib/api/mock-adapter.ts`: axios request interceptor ghi đè `config.adapter`, delay 300ms, không ảnh hưởng 401 interceptor.
    *   [X] Thêm `VITE_ENABLE_MOCKS` vào `env.ts`, `.env.example`.
    *   [X] Tích hợp vào `http.ts`: gọi `enableMockAdapter(http)` khi `env.enableMocks = true`.
    *   [X] Dữ liệu mock lấy từ `lib/data/mockData.ts`, hỗ trợ lọc/tìm kiếm.
    *   [X] Build verified: `vite build` thành công.
*   **Lưu ý cho phiên làm việc sau:**
    *   Mở rộng mock data nếu cần thêm test scenario.
    *   Có thể chuyển sang MSW (Mock Service Worker) khi cần mock phức tạp hơn.

### 🕒 [2026-07-09] - Hoàn thiện API Integration Layer cho Frontend
*   **AI hỗ trợ:** opencode (deepseek-v4-flash-free)
*   **Trạng thái:** 🟢 Hoàn thành
*   **Nội dung đã làm:**
    *   [X] Restructure `src/` theo `docs/Frontend_project_structure.md` (feature-based architecture).
    *   [X] Nâng cấp `lib/api/http.ts`: thêm typed helpers + interceptor refresh-token queue khi 401.
    *   [X] Tạo `lib/api/token-storage.ts` (get/set/remove token).
    *   [X] Tạo API layers (types + api + queries) cho tất cả feature:
        *   `auth/`: login, logout, profile, refresh
        *   `batches/`: CRUD + timeline
        *   `users/`: CRUD + reset password
        *   `recall/`: CRUD + resolve + notify
        *   `inspection/`: CRUD + update status
        *   `supply-chain/`: trace by batch/qr
        *   `dashboard/`: overview (auto-refetch 30s)
        *   `reports/`: generate + list
    *   [X] Cập nhật `auth.store.tsx` dùng API thật thay vì mock.
    *   [X] Thêm `QueryClientProvider` vào `app/providers.tsx`.
    *   [X] Cài đặt `@tanstack/react-query` và `axios`.
    *   [X] Build verified: `vite build` thành công.
*   **Lưu ý cho phiên làm việc sau:**
    *   Cần implement UI components tương ứng cho từng feature page (dùng dữ liệu thật từ queries).
    *   Cần thêm unit test cho API layer.
    *   Cần phối hợp với **An** (`context-an.md`) để tích hợp luồng login/register thật.
