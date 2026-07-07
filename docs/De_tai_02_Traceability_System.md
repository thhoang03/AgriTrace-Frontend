
Dưới đây là cấu trúc toàn diện của **ĐỀ TÀI 02: Hệ thống Truy xuất Nguồn gốc Nông sản theo Chuỗi Cung ứng (Agricultural Supply Chain Traceability System)**. 

Nhiệm vụ của bạn là đọc hiểu, phân tích sâu các thực thể, luồng nghiệp vụ, và đóng vai trò như một Kiến trúc sư phần mềm / Chuyên gia Phân tích Nghiệp vụ (BA) để hiện thực hóa dự án này. Hãy chuyển đổi dữ liệu này thành tài liệu phân tích hệ thống (SRS), phân rã User Story, thiết kế cơ sở dữ liệu và viết mã nguồn theo đúng các tiêu chí kỹ thuật được yêu cầu.

---

# ĐẶC TẢ CHI TIẾT ĐỀ TÀI 02: HỆ THỐNG TRUY XUẤT NGUỒN GỐC NÔNG SẢN

## 1. THÔNG TIN TỔNG QUAN DỰ ÁN
* **Tên đề tài (Tiếng Việt):** Hệ thống Truy xuất Nguồn gốc Nông sản theo Chuỗi Cung ứng
* **Tên đề tài (Tiếng Anh):** Agricultural Supply Chain Traceability System
* **Thời lượng dự án:** 6 tuần (Chia làm 3 Sprint × 2 tuần)
* **Quy mô nhóm:** 7 thành viên
* **Định hướng Công nghệ:**
  * **Frontend:** React (JavaScript), State Management (Redux Toolkit / Context API), RESTful API (JSON).
  * **Backend:** .NET 10 (ASP.NET Core Web API), Kiến trúc Clean Architecture, Entity Framework Core.

---

## 2. BỐI CẢNH & LÝ DO CHỌN ĐỀ TÀI
* **Thực trạng thị trường:** Người tiêu dùng ngày càng quan tâm đến nguồn gốc thực phẩm, an toàn vệ sinh và tính minh bạch. Tuy nhiên, các bên tham gia chuỗi cung ứng nông sản (Nông dân, đơn vị sơ chế, nhà phân phối, đại lý bán lẻ) hiện tại hoạt động độc lập, thiếu một hệ thống thông tin nhất quán, liên thông để ghi nhận và chia sẻ dữ liệu.
* **Giải pháp của dự án:** Xây dựng một nền tảng tập trung cho phép:
  1. Từng lô hàng nông sản (Batch) được gắn một mã định danh duy nhất (Unique Identifier) dưới dạng mã QR.
  2. Ghi nhận thời gian thực (Real-time) toàn bộ hành trình và các sự kiện xảy ra trên chuỗi cung ứng.
  3. Người tiêu dùng cuối (End-consumer) dễ dàng tra cứu toàn bộ lịch sử này một cách minh bạch mà không cần đăng nhập.

---

## 3. MỤC TIÊU DỰ ÁN
* **Số hoá chuỗi cung ứng:** Ghi nhận toàn vẹn các sự kiện: *Thu hoạch → Sơ chế → Đóng gói → Vận chuyển → Phân phối → Đại lý bán lẻ*.
* **Bảo vệ toàn vẹn dữ liệu (Immutability):** Đảm bảo dữ liệu lịch sử của lô hàng khó bị chỉnh sửa hoặc làm giả (Áp dụng cơ chế Append-only và Hash Chain).
* **Minh bạch hóa với người dùng:** Giúp người tiêu dùng quét mã QR truy xuất nhanh thông tin nguồn gốc, chứng nhận kiểm định chất lượng trực quan.
* **Quản trị rủi ro (Recall):** Hỗ trợ cơ chế truy vết ngược (Traceback) và kích hoạt cảnh báo thu hồi sản phẩm lỗi nhanh chóng khi có sự cố chất lượng.

---

## 4. ĐỐI TƯỢNG NGƯỜI DÙNG (ACTORS & ROLES)

| STT | Vai trò (Actor) | Mô tả trách nhiệm chính trong hệ thống |
| :--- | :--- | :--- |
| **1** | **Quản trị viên (Admin)** | Quản lý tài khoản, phân quyền hệ thống; Quản lý danh mục các tác nhân (Actors) tham gia vào chuỗi cung ứng. |
| **2** | **Nông dân / Cơ sở sản xuất** | Khởi tạo lô hàng mới (Batch); Ghi nhận thông tin ban đầu: chủng loại sản phẩm, nông trại, ngày thu hoạch, nhật ký bón phân/thuốc (nếu có). |
| **3** | **Đơn vị Sơ chế / Đóng gói** | Tiếp nhận lô hàng từ nông dân; Ghi nhận sự kiện xử lý, phân loại, đóng gói và cập nhật trạng thái lô hàng. |
| **4** | **Nhà phân phối / Đơn vị vận chuyển** | Ghi nhận sự kiện tiếp nhận, lưu kho, thông tin chuyến xe, nhiệt độ bảo quản (nếu có) và vận chuyển lô hàng đến đại lý. |
| **5** | **Đại lý bán lẻ / Siêu thị** | Tiếp nhận lô hàng cuối cùng, ghi nhận sự kiện mở bán, quản lý vị trí kệ hàng hoặc trạng thái tiêu thụ. |
| **6** | **Người tiêu dùng (Consumer)** | Đối tượng không cần đăng nhập hệ thống. Sử dụng thiết bị di động quét mã QR để kiểm tra toàn bộ vòng đời và tính hợp pháp của nông sản. |

---

## 5. YÊU CẦU CHỨC NĂNG CHÍNH (FUNCTIONAL REQUIREMENTS)

### 5.1. Quản lý Lô hàng (Batch Management) & Mã định danh
* **Tạo mới Batch:** Cho phép Nông dân tạo lô hàng với các thuộc tính: Mã lô, loại nông sản, vị trí nông trại (tọa độ/địa chỉ), ngày giờ thu hoạch, số lượng/khối lượng ban đầu.
* **Cấp phát Định danh:** Hệ thống tự động sinh một mã định danh duy nhất (UUID) và chuyển đổi thành **Mã QR định danh** cho riêng lô hàng đó.

### 5.2. Quản lý Sự kiện Chuỗi cung ứng (Chain of Custody)
* **Luồng sự kiện tuyến tính:** Ghi nhận tuần tự: `Thu hoạch` $
ightarrow$ `Sơ chế` $
ightarrow$ `Đóng gói` $
ightarrow$ `Vận chuyển` $
ightarrow$ `Phân phối` $
ightarrow$ `Bán lẻ`.
* **Cơ chế Hash Chain (Blockchain-lite):** 
  * Mỗi sự kiện sinh ra phải lưu giữ: *Mã sự kiện, Mã lô hàng, Timestamp (mốc thời gian), ID đơn vị thực hiện, Trạng thái hành động*.
  * Sự kiện sau bắt buộc phải chứa một trường `PreviousHash` (Mã băm của sự kiện ngay trước nó trong cùng lô hàng) và trường `CurrentHash` được tính toán dựa trên dữ liệu của chính nó + `PreviousHash`. Điều này ngăn chặn việc sửa đổi dữ liệu lịch sử một cách tùy tiện.

### 5.3. Tra cứu Công khai (Public Traceability Portal)
* **Trang Tra cứu Không định danh:** Hệ thống cung cấp một Portal public, tối ưu giao diện mobile. Khi người dùng quét mã QR, trình duyệt sẽ điều hướng tới link: `https://domain.com/trace/{batch_id}`.
* **Hiển thị dòng thời gian (Timeline View):** Hiển thị trực quan theo dạng sơ đồ tiến trình từ điểm bắt đầu đến điểm kết thúc.
* **Chứng nhận đính kèm:** Hiển thị các chứng nhận chất lượng (VietGAP, GlobalGAP, Organic...) hoặc phiếu xét nghiệm mẫu đất/nước nếu có đính kèm.

### 5.4. Kiểm định Chất lượng & Cảnh báo Thu hồi (Quality Assurance & Recall)
* **Ghi nhận kiểm định:** Cơ quan chức năng hoặc bộ phận QC nội bộ ghi nhận kết quả kiểm tra (Đạt/Không đạt, hàm lượng chất cấm...).
* **Cảnh báo lan truyền (Recall Propagation):** Khi một lô hàng được xác nhận nhiễm khuẩn hoặc lỗi chất lượng, Admin hoặc Cơ sở sản xuất có thể kích hoạt trạng thái **"RECALL"**. Hệ thống tự động gửi thông báo (Notification/Email) lan truyền đến tất cả các Actor đang nắm giữ hoặc đã xử lý lô hàng đó trên chuỗi để dừng việc tiêu thụ lập tức.

### 5.5. Báo cáo & Phân tích (Analytics Dashboard)
* **Dashboard trực quan:** Thống kê tổng số lượng lô hàng đang lưu thông, tỷ lệ phân bổ hàng hóa theo từng công đoạn, thời gian xử lý trung bình của từng mắt xích.
* **Truy vết ngược (Traceback Analysis):** Khi phát hiện sản phẩm lỗi tại siêu thị, hệ thống cho phép truy xuất ngược dòng thời gian về tận nông trại ban đầu và liệt kê danh sách các lô hàng khác dùng chung xe vận chuyển hoặc chung nhà máy sơ chế để xử lý khoanh vùng.

---

## 6. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

* **Tính bất biến của dữ liệu (Immutability):** Toàn bộ bảng ghi lịch sử sự kiện phải thiết lập cơ chế **Append-only**. Không cung cấp API `DELETE` hoặc `UPDATE` cho dữ liệu chuỗi sự kiện.
* **Hiệu năng & Khả dụng (Performance):** Trang tra cứu công khai cho người tiêu dùng phải đạt tốc độ tải trang dưới 1.5 giây, chịu tải tốt khi có lượng quét QR đồng thời lớn.
* **Bảo mật & Phân quyền:** Xác thực qua cơ chế JWT (gồm Access Token thời hạn ngắn và Refresh Token). Phân quyền nghiêm ngặt dựa trên vai trò (Role-based Access Control - RBAC). Các đơn vị thuộc mắt xích nào chỉ được quyền ghi nhận sự kiện thuộc phạm vi quản lý của mắt xích đó.
* **Tính toàn vẹn (Data Integrity):** Áp dụng thuật toán băm (SHA-256) mã hóa chuỗi sự kiện để kiểm tra tính toàn vẹn dữ liệu định kỳ.

---

## 7. KIẾN TRÚC & CÔNG NGHỆ KHUYẾN NGHỊ

```
+------------------------------------------------------------+
|                  FRONTEND APP (React)                      |
|      (State Management: Redux - UI components - QR)        |
+-----------------------------+------------------------------+
                              | REST API (JSON)
                              v
+------------------------------------------------------------+
|               BACKEND API (.NET 10 Web API)                |
|  [Presentation] -> [Application] -> [Domain] -> [Infra]    |
+-----------------------------+------------------------------+
                              | EF Core
                              v
+------------------------------------------------------------+
|             DATABASE (SQL Server / Redis Cache)            |
+------------------------------------------------------------+
```

* **Backend:** ASP.NET Core Web API chạy trên .NET 10. Tổ chức mã nguồn theo mô hình **Clean Architecture** (Tách biệt rõ rệt các tầng: Domain, Application, Infrastructure, Presentation).
* **Database:** SQL Server đóng vai trò lưu trữ quan hệ chính. 
* **Kiểm thử (Testing):** Viết Unit Test sử dụng xUnit/NUnit cho Backend (đặc biệt là logic tính toán Hash Chain); sử dụng Jest/Vitest cho React Frontend.
* **Triển khai (Deployment):** Docker hóa toàn bộ ứng dụng (`Dockerfile`, `docker-compose.yml`). Triển khai thử nghiệm lên các môi trường cloud (Render, Azure, AWS hoặc Railway).
* **Quản lý source code:** Sử dụng Git, tuân thủ mô hình Gitflow rút gọn bao gồm các nhánh chính: `main` (production), `dev` (integration), và các nhánh `feature/*` cho từng thành viên.

---

## 8. KẾ HOẠCH TRIỂN KHAI THEO SPRINT (6 Tuần / 3 Sprints)

### 📅 SPRINT 1 (Tuần 1 & Tuần 2): Phân tích, Thiết kế Nền tảng & Khởi tạo
* **Mục tiêu:**
  * Làm mịn yêu cầu chi tiết, xây dựng Product Backlog, phân rã thành các User Story cụ thể trên công cụ quản lý Trello.
  * Thiết kế sơ đồ thực thể mối quan hệ (ERD) hoàn chỉnh cho cơ sở dữ liệu.
  * Thiết kế API Contract chi tiết theo chuẩn OpenAPI/Swagger.
  * Thiết kế UI/UX dạng Wireframe/Mockup cho các màn hình quản trị và màn hình quét mã QR của Consumer.
  * Thiết lập khung dự án (Scaffolding): Tạo Solution Clean Architecture cho .NET 10, cấu trúc thư mục React, cấu hình kết nối DB và tính năng đăng nhập/xác thực cơ bản với JWT.
* **Sản phẩm bàn giao:**
  * Tài liệu Đặc tả Yêu cầu Phần mềm (SRS) & Product Backlog chỉn chu.
  * Sơ đồ ERD & Tài liệu API Contract định dạng Swagger.
  * Bộ thiết kế Mockup UI Figma/Hình ảnh.
  * Mã nguồn Base của dự án đã chạy được ở trạng thái rỗng (Empty-state) trên GitHub.

### 📅 SPRINT 2 (Tuần 3 & Tuần 4): Phát triển Tính năng Cốt lõi & Tích hợp
* **Mục tiêu:**
  * Triển khai toàn bộ các nghiệp vụ CRUD cốt lõi: Quản lý Tài khoản/Actor, Quản lý lô hàng (Batch), Luồng ghi nhận chuỗi sự kiện.
  * Hiện thực hóa thuật toán tính toán băm liên kết `Hash Chain` giữa các sự kiện của lô hàng tại Backend.
  * Phát triển giao diện React cho các Actor nhập liệu và kết nối trực tiếp với API Backend thông qua Axios/Fetch.
  * Viết Unit Test bao phủ tối thiểu 60% logic nghiệp vụ tại tầng Service của Backend.
  * Thực hiện Demo nội bộ cuối Sprint 2 để đánh giá tiến độ và thu thập phản hồi (Sprint Review & Retrospective).
* **Sản phẩm bàn giao:**
  * Hệ thống hoạt động End-to-End đối với các luồng nghiệp vụ chính.
  * Bộ mã nguồn kiểm thử (Unit Test Case) và báo cáo kết quả kiểm thử thành công.
  * Biên bản họp kiểm điểm và cải tiến Sprint (Review & Retrospective Minutes).

### 📅 SPRINT 3 (Tuần 5 & Tuần 6): Tính năng Nâng cao, Kiểm thử Toàn diện & Triển khai
* **Mục tiêu:**
  * Phát triển giao diện Tra cứu Công khai (Public Portal) cho Consumer, tích hợp thư viện sinh và đọc mã QR trực tiếp trên trình duyệt.
  * Xây dựng Dashboard báo cáo, phân tích và tính năng Cảnh báo Thu hồi (Recall) lan truyền.
  * Tiến hành kiểm thử tích hợp (Integration Test) và kiểm thử chấp nhận người dùng (UAT) toàn bộ hệ thống để vá lỗi.
  * Đóng gói ứng dụng thành các Docker Image, viết script cấu hình và thực hiện triển khai (Deploy) sản phẩm lên VPS/Cloud.
  * Hoàn thiện tài liệu hướng dẫn vận hành, chuẩn bị Slide báo cáo và kịch bản demo chạy mượt mà trước hội đồng.
* **Sản phẩm bàn giao:**
  * Link website hệ thống đã deploy trực tuyến ổn định.
  * Tài liệu Hướng dẫn cài đặt, cấu hình hệ thống và vận hành chi tiết.
  * Báo cáo tổng kết dự án cuối kỳ.
  * Slide thuyết trình + Kịch bản Demo sản phẩm.

---

## 9. ĐỊNH HƯỚNG TÍNH NĂNG NÂNG CAO (NÂNG CAO ĐIỂM SỐ)
Để tối ưu hóa điểm số và tăng tính chuyên nghiệp, nhóm nên tập trung nghiên cứu và hiện thực hóa thêm từ 2-3 tính năng nâng cao dưới đây:
1. **QR Code Generator & Scanner:** Tích hợp bộ thư viện sinh mã QR động chứa liên kết tra cứu và hỗ trợ camera quét trực tiếp trên Web Frontend của mobile không qua ứng dụng bên thứ ba.
2. **Blockchain Simulation (Hash-chaining):** Triển khai cấu trúc dữ liệu chuỗi khối thu nhỏ, đảm bảo khi một mắt xích thay đổi dữ liệu cũ, chuỗi băm sẽ lập tức bị gãy vỡ và hệ thống phát hiện ra ngay lập tức thông qua thuật toán tự kiểm tra tính toàn vẹn (Audit log validation).
3. **Geospatial Tracking:** Tích hợp bản đồ trực quan (Google Maps / Leaflet) để vẽ lại lộ trình di chuyển của lô nông sản qua các tọa độ GPS được ghi nhận tại mỗi sự kiện vận chuyển.
4. **Automated PDF Report Export:** Hỗ trợ tính năng xuất báo cáo nguồn gốc, chứng nhận kiểm định chất lượng sản phẩm ra file PDF chuyên nghiệp được ký điện tử mã băm (Digital Signature) để cung cấp cho cơ quan quản lý thị trường khi cần thiết.

---

## 10. TIÊU CHÍ ĐÁNH GIÁ KẾT QUẢ DỰ ÁN
* **Độ hoàn thiện nghiệp vụ (30%):** Đáp ứng đúng, đủ và mượt mà tất cả các yêu cầu chức năng cốt lõi đã đặc tả.
* **Chất lượng kiến trúc & Mã nguồn (25%):** Tổ chức các lớp (Layers) rõ ràng theo Clean Architecture, áp dụng đúng Dependency Injection, viết mã sạch (Clean Code), tuân thủ đúng Coding Conventions của .NET và React. Mã nguồn trên Git có tần suất commit đều đặn, phân chia nhánh khoa học.
* **Trải nghiệm người dùng UI/UX (15%):** Giao diện quản trị khoa học, giao diện tra cứu trên thiết bị di động trực quan, hiển thị timeline mượt mà, dễ tương tác.
* **Tài liệu dự án (15%):** Đầy đủ các tài liệu theo danh mục bàn giao của mỗi Sprint. Tài liệu có cấu trúc rõ ràng, hình vẽ ERD và đặc tả API chuẩn xác.
* **Năng lực triển khai & Demo (15%):** Hệ thống được deploy thực tế trên môi trường Cloud, chạy ổn định, không phát sinh lỗi nghiêm trọng trong quá trình demo trực tiếp.

---

# HƯỚNG DẪN AI SỬ DỤNG TÀI LIỆU NÀY:
Khi được yêu cầu viết code, thiết kế DB hoặc giải thích nghiệp vụ cho đề tài này, bạn phải:
1. Tuân thủ tuyệt đối kiến trúc **Clean Architecture** và các ràng buộc phi chức năng (Ví dụ: dữ liệu sự kiện là **Append-only**).
2. Khi thiết kế cơ sở dữ liệu, luôn chú ý các trường `PreviousHash` và `CurrentHash` trong bảng lưu trữ Event để đảm bảo tính năng Hash Chain.
3. Luôn phản hồi bằng tiếng Việt chuyên ngành công nghệ thông tin rõ ràng, mạch lạc.
