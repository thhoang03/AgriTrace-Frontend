# 🏛️ PROJECT MASTER CONTEXT

> **Lưu ý dành cho AI:** Đây là bối cảnh tổng thể của dự án. Hãy kết hợp thông tin ở đây với file nhật ký riêng của từng thành viên (`context-[tên].md`) để hỗ trợ chính xác nhất.

## 1. 🚀 THÔNG TIN CHUNG
*   **Tên dự án:** AgriTrace Vietnam - Hệ thống Truy xuất Nguồn gốc Nông sản theo Chuỗi Cung ứng
*   **Công nghệ:** React 18, TypeScript, Vite, Tailwind CSS v4, MUI, React Router v7, TanStack Query, Zustand, Axios, date-fns, Vitest, Docker, Nginx
*   **Quy ước chung:** 
    *   Feature-based architecture: code theo tính năng tại `src/features/<name>/` (types, api, store, queries, page).
    *   UI Primitives: `src/components/ui/` dùng PascalCase, mỗi file 1 component, test co-located, chấp nhận `className` prop để compose Tailwind qua `clsx` + `tailwind-merge`.
    *   Pages: `src/pages/` là thin wrappers kết hợp features thành route.
    *   Mock API: `VITE_ENABLE_MOCKS=true` dùng `lib/api/mock-handlers.ts` (axios adapter override). Tắt để gọi backend thật.
    *   Không commit secrets hoặc file `.env` lên repo.

## 2. 👥 PHÂN CHIA NHIỆM VỤ (TEAM ROLES)
*   **Sơn:** Phụ trách Home Page (Trang chủ công khai, tra cứu QR) -> Xem `context-son.md`
*   **An:** Phụ trách chức năng Xác thực (Login, Register, Change Password) -> Xem `context-an.md`
*   **M.Hoàng:** Phụ trách Profile Page (Trang cá nhân, chỉnh sửa thông tin) -> Xem `context-mhoang.md`
*   **Leo:** Phụ trách Frontend Core (API Layer, HTTP Client, Project Structure, tích hợp features) -> Xem `context-leo.md`