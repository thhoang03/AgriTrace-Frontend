Kiến trúc Clean Architecture kết hợp CQRS (MediatR), Mapster và EF Core SQL Server.

```markdown
# 🏛️ Cấu trúc dự án Clean Architecture & CQRS (.NET 10)

Tài liệu này mô tả kiến trúc, cách phân chia các tầng (Layers) và luồng luân chuyển dữ liệu trong hệ thống. Dự án tuân thủ nghiêm ngặt nguyên tắc **Clean Architecture**, tách biệt mã nguồn nghiệp vụ khỏi các công nghệ phụ thuộc bên ngoài.

---

## 📂 Sơ đồ cấu trúc thư mục (Directory Structure)

```text
src/
  ├── AgriTrace.Domain/                      # 1. Tầng Lõi (Domain Layer)
  │   ├── Entities/                     # Chứa các Thực thể nghiệp vụ (Ví dụ: Product.cs)
  │   └── Interfaces/                   # Định nghĩa các giao tiếp (Ví dụ: IProductRepository.cs)
  │
  ├── AgriTrace.Application/                 # 2. Tầng Nghiệp vụ (Application Layer)
  │   ├── Contracts/                    # Định nghĩa DTOs phục vụ Use-case (Ví dụ: ProductDto.cs)
  │   ├── Features/                     # Phân chia chức năng theo CQRS (Slicing)
  │   │   └── Products/
  │   │       ├── Commands/             # Thao tác ghi/thay đổi dữ liệu (Create, Update, Delete)
  │   │       └── Queries/              # Thao tác đọc dữ liệu (GetAll, GetById)
  │   ├── Mappings/                     # Cấu hình Mapper nội bộ tầng App (ApplicationMappingRegister.cs)
  │   └── DependencyInjection.cs        # Tự đóng gói dịch vụ của tầng Application (MediatR, Mapping)
  │
  ├── AgriTrace.Infrastructure.SqlServer/    # 3. Tầng Hạ tầng (Infrastructure Layer - SQL Server)
  │   ├── Persistence/                  # Quản lý EF Core DbContext (ApplicationDbContext.cs)
  │   ├── Configurations/               # Cấu hình các bảng dữ liệu bằng Fluent API
  │   ├── Models/                       # Database Entities / Data Models (Ví dụ: ProductDataModel.cs)
  │   ├── Migrations/                   # Lưu trữ lịch sử nâng cấp cấu trúc Database
  │   ├── Repositories/                 # Hiện thực hóa Interfaces từ Domain (Ví dụ: ProductRepository.cs)
  │   └── DependencyInjection.cs        # Tự đóng gói dịch vụ hạ tầng (DbContext, Connection, Repositories)
  │
  └── AgriTrace.API/                         # 4. Tầng Giao tiếp (Presentation/API Layer)
      ├── Controllers/                  # Tiếp nhận HTTP Request và điều phối qua MediatR
      ├── Models/                       # Request/Response Models may đo riêng cho Client hiển thị
      ├── DependencyInjection.cs        # Tự đóng gói dịch vụ API (Controllers, Swagger, API-Mapper)
      ├── appsettings.json              # Lưu cấu hình hệ thống (ConnectionString, Logging)
      └── Program.cs                    # File khởi chạy hệ thống (Siêu tối giản, chỉ gọi DI của các tầng)

```

---

## 🧩 Vai trò và Quy tắc của từng Tầng (Layer Responsibilities)

### 1. Tầng Domain (Lõi trung tâm)

* **Nhiệm vụ:** Chứa các thực thể (Entities), quy tắc và logic nghiệp vụ cốt lõi của doanh nghiệp.
* **Quy tắc:** **Tuyệt đối không phụ thuộc vào bất kỳ tầng nào khác** hoặc bất kỳ thư viện bên ngoài nào (No Nuget Packages, ngoại trừ thư viện hỗ trợ Domain thuần túy). Các thuộc tính nên đóng gói (`private set`) để bảo vệ tính toàn vẹn dữ liệu.

### 2. Tầng Application (Ứng dụng / Nghiệp vụ)

* **Nhiệm vụ:** Định nghĩa các kịch bản sử dụng hệ thống (Use-cases) thông qua cấu trúc **CQRS** (MediatR Handlers).
* **Thành phần:**
* `Command/Query`: Định nghĩa hành động đầu vào.
* `Handler`: Nơi tập trung toàn bộ logic xử lý nghiệp vụ, gọi Domain và phối hợp với Repository thông qua Interface.
* `DTO (Data Transfer Object)`: Cấu trúc dữ liệu phẳng, an toàn để vận chuyển dữ liệu ra khỏi tầng Application.


* **Quy tắc:** Chỉ phụ thuộc vào tầng **Domain**.

### 3. Tầng Infrastructure.SqlServer (Hạ tầng dữ liệu)

* **Nhiệm vụ:** Hiện thực hóa các Interface lưu trữ bằng công nghệ SQL Server và Entity Framework Core.
* **Thành phần:**
* `DataModel`: Đại diện chính xác cho cấu trúc bảng vật lý trong DB để cách ly hoàn toàn Database khỏi Domain Entity.
* `Repository`: Thực hiện truy vấn thực tế, chịu trách nhiệm dùng Mapster để chuyển đổi hai chiều giữa `DataModel` và `Domain Entity`.


* **Quy tắc:** Phụ thuộc vào tầng **Domain** để lấy Interface.

### 4. Tầng API / Presentation (Hiển thị ngoại vi)

* **Nhiệm vụ:** Điểm đầu tiếp nhận các yêu cầu từ Client (Web, Mobile, Postman), định cấu hình HTTP Pipeline, Middleware, Swagger và bảo mật.
* **Thành phần:**
* `Request / Response`: Cấu trúc dữ liệu may đo riêng theo nhu cầu hiển thị hoặc tối ưu băng thông của giao diện Client.


* **Quy tắc:** Phụ thuộc vào tầng **Application** (để gửi Command/Query qua MediatR) và tầng **Infrastructure** (chỉ để kích hoạt Dependency Injection tại `Program.cs`).

---

## 🔄 Luồng chu trình luân chuyển dữ liệu và Mapping (Data Flow & Mapping Lifecycle)

Khi một chu trình từ Client gửi đến hệ thống cho tới khi nhận lại kết quả, dữ liệu sẽ biến đổi tuần tự qua 5 biểu mẫu cấu trúc dữ liệu độc lập nhằm đảm bảo tính an toàn và đóng gói:

```text
[Client] ──(Gửi JSON Body)──► [1. ProductRequest] (Tầng API)
                                      │
                               (Mapster Mapping)
                                      ▼
                              [2. CreateProductCommand] (Gửi vào MediatR Pipeline)
                                      │
                               (Handler xử lý)
                                      ▼
                              [3. Product Entity] (Tầng Domain - Kiểm tra nghiệp vụ)
                                      │
                               (Repository lưu)
                                      ▼
                              [4. ProductDataModel] (Tầng Infrastructure - Ghi vào SQL Server)
                                      │
                         (Truy vấn ngược lên / Làm phẳng)
                                      ▼
                              [5. ProductDto] (Tầng Application - Đi ra khỏi nghiệp vụ)
                                      │
                               (Mapster Mapping)
                                      ▼
[Client] ◄──(Nhận JSON)────── [6. ProductResponse] (Tầng API - Định dạng hiển thị UI)

```

1. **Chặng vào:** `ProductRequest` (API) $\rightarrow$ `CreateProductCommand` (Application) $\rightarrow$ `Product` (Domain Entity) $\rightarrow$ `ProductDataModel` (Infrastructure $\rightarrow$ SQL Server).
2. **Chặng ra:** `ProductDataModel` (SQL Server) $\rightarrow$ `Product` (Domain Entity) $\rightarrow$ `ProductDto` (Application) $\rightarrow$ `ProductResponse` (API) $\rightarrow$ Client.

---

## 🛠️ Nguyên tắc Đóng gói Dịch vụ (Dependency Injection Rules)

Mỗi Class Library chịu trách nhiệm hoàn toàn về việc nạp các dịch vụ nội bộ của chính nó thông qua phương thức mở rộng `DependencyInjection.cs`:

* `AddPresentation()`: Cấu hình hệ thống API, Swagger, Cors và bộ Mapper nội bộ tầng API.
* `AddApplication()`: Cấu hình hệ thống MediatR tự động quét Handlers và bộ Mapper nội bộ tầng App.
* `AddInfrastructureSqlServer()`: Cấu hình kết nối chuỗi `DefaultConnection` cho EF Core DbContext và nạp các Repositories.

File `Program.cs` ở tầng API đóng vai trò tối giản, chỉ gọi tích hợp:

```csharp
builder.Services.AddPresentation();
builder.Services.AddApplication();
builder.Services.AddInfrastructureSqlServer(builder.Configuration);

```
