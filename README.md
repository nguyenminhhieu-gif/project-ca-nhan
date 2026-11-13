# ☕ Smart Coffee Hub - Nền Tảng Cà Phê Thông Minh & Dịch Vụ F&B Thế Hệ Mới

Dự án website quản lý và kinh doanh quán cà phê hiện đại kết hợp không gian làm việc Co-working, hệ thống cá nhân hóa đồ uống, màn hình pha chế thời gian thực (KDS) và trợ lý ảo tư vấn khẩu vị thông minh.

Dự án được xây dựng trên nền tảng **Quarkus (Supersonic Subatomic Java)** mang lại hiệu năng cao, thời gian khởi động tức thì và mức tiêu thụ tài nguyên tối ưu.

---

## 🛠️ Danh Sách Công Nghệ & Công Cụ Sử Dụng (Tech Stack)

### 1. Backend & Server-side
- **Ngôn ngữ**: [Java 21 (LTS)](https://adoptium.net/) - Phiên bản Java hiệu năng cao, hỗ trợ các tính năng hiện đại (Pattern Matching, Record types, Virtual Threads ready).
- **Core Framework**: [Quarkus 3.35.3](https://quarkus.io/) - Framework Java thế hệ mới ("Supersonic Subatomic Java"), tối ưu hóa cho cloud-native và container.
- **RESTful API**: 
  - `quarkus-rest` (Jakarta REST / RESTEasy Reactive): Xây dựng API phi đồng bộ (Non-blocking / Reactive).
  - `quarkus-rest-jackson`: Chuyển đổi và serialize/deserialize dữ liệu JSON tự động.
- **Dependency Injection**: `quarkus-arc` - Kiến trúc CDI (Contexts and Dependency Injection) build-time nhanh gấp nhiều lần so với reflection truyền thống.
- **ORM & Data Access**: 
  - `quarkus-hibernate-orm-panache`: Triển khai JPA / Hibernate với Panache Pattern (hỗ trợ cả Active Record và Repository Pattern, giảm thiểu tối đa boilerplate code).
  - `narayana-jta`: Quản lý giao dịch phân tán (Transaction Management).
- **Security & Xác thực**:
  - `quarkus-smallrye-jwt`: Quản lý và xác thực token JWT không trạng thái (Stateless JWT Authentication & Authorization).
  - `quarkus-smallrye-jwt-build`: Sinh token JWT cho người dùng sau khi đăng nhập.
  - `jbcrypt (0.4)`: Thư viện mã hóa và xác thực mật khẩu an toàn chuẩn Blowfish cipher.
- **Engine tầng thấp**: [Eclipse Vert.x](https://vertx.io/) - Lõi điều phối I/O hướng sự kiện (Event-driven reactive engine) bên dưới Quarkus.

### 2. Cơ Sở Dữ Liệu (Database)
- **Hệ quản trị CSDL**: [MySQL Server 8.0](https://www.mysql.com/) - Hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) mạnh mẽ, tin cậy.
- **Driver kết nối**: `quarkus-jdbc-mysql` (MySQL Connector/J qua JDBC).
- **Connection Pool**: Agroal Connection Pool (`quarkus-agroal`) - Bộ quản lý kết nối CSDL siêu nhẹ và hiệu năng cao dành riêng cho Quarkus.
- **Quản lý Schema**: Hibernate Auto DDL (`quarkus.hibernate-orm.schema-management.strategy=update`) kết hợp bộ khởi tạo dữ liệu mẫu tự động `DataInitializer.java` và `import.sql`.

### 3. Frontend & Client-side
- **Ngôn ngữ & Nền tảng**:
  - **HTML5 Semantic**: Cấu trúc tài liệu chuẩn SEO, tối ưu khả năng truy cập (a11y).
  - **CSS3 & Responsive Design**: Thiết kế tương thích đa màn hình (Mobile, Tablet, Desktop) sử dụng Flexbox, CSS Grid và CSS Custom Properties (Variables).
  - **Modern Vanilla JavaScript (ES6+)**: Xử lý logic phía client mượt mà, không phụ thuộc nặng vào thư viện cồng kềnh, tối ưu tốc độ tải trang.
- **Thư viện UI & Biểu tượng**:
  - [Tailwind CSS](https://tailwindcss.com/): Framework CSS utility-first giúp dựng giao diện hiện đại, sạch sẽ.
  - [Bootstrap 5](https://getbootstrap.com/): Hỗ trợ các component như Modal, Navbar, Dropdown.
  - [Font Awesome 6](https://fontawesome.com/): Bộ icon vector phong phú cho đồ uống, chức năng, trạng thái.
- **Tích hợp Web API & Dịch vụ ngoài**:
  - **Fetch API**: Giao tiếp bất đồng bộ (Asynchronous HTTP requests) với backend REST API.
  - **Web Audio API**: Bộ phát tín hiệu âm thanh thông báo 3-tone chime thời gian thực trên màn hình KDS khi có đơn hàng mới.
  - **VietQR API**: Tự động sinh mã QR thanh toán ngân hàng chuẩn Napas 247 theo từng hóa đơn và số tiền chính xác.
  - **Browser LocalStorage**: Lưu trữ token xác thực, thông tin giỏ hàng và trạng thái phiên làm việc của khách hàng.

### 4. Đóng Gói Container & DevOps (Docker)
- **Containerization**: [Docker](https://www.docker.com/) & Docker Desktop - Đóng gói ứng dụng thành các container độc lập, chuẩn hóa môi trường triển khai.
- **Dockerfile Profiles (trong `src/main/docker/`)**:
  - `Dockerfile.jvm`: Container image chạy trên nền Java Virtual Machine (Red Hat Universal Base Image - UBI 9 micro / JDK 21).
  - `Dockerfile.native`: Container image chạy file nhị phân biên dịch gốc (GraalVM / Mandrel Native Executable), khởi động dưới 0.05 giây và tiêu thụ RAM cực thấp.
  - `Dockerfile.native-micro`: Phiên bản native tối giản tối đa dung lượng container image (chỉ vài chục MB).
  - `Dockerfile.legacy-jar`: Đóng gói ứng dụng theo dạng Uber-JAR truyền thống.
- **Tối ưu build**: File `.dockerignore` giúp loại trừ thư mục `target/`, `.git`, temporary files khỏi Docker context, tăng tốc thời gian build image.

### 5. Công Cụ Phát Triển & Vận Hành (Development Tools)
- **Hệ điều hành**: Windows 11 / Windows Server.
- **Công cụ build & quản lý thư viện**: [Apache Maven 3.9+](https://maven.apache.org/) thông qua Maven Wrapper (`mvnw` / `mvnw.cmd`).
- **Môi trường phát triển tích hợp (IDE)**:
  - Antigravity IDE (Google DeepMind Agentic IDE).
  - Visual Studio Code / IntelliJ IDEA.
- **Quarkus Dev Tools**:
  - Live Coding / Hot Reload: Tự động biên dịch và nạp lại code tức thì khi lưu file (không cần restart server).
  - Dev UI: Giao diện quản trị, debug cấu hình và test dịch vụ trực quan tại `/q/dev`.
- **Kiểm thử (Testing)**:
  - `quarkus-junit5`: Framework unit test & integration test.
  - `rest-assured`: Kiểm thử tự động các REST endpoints.
  - PowerShell / cURL: Kiểm thử tải và kiểm tra phản hồi HTTP trực tiếp từ terminal.

---

## 🌟 5 Trụ Cột Tính Năng Đột Phá ("Smart Coffee Hub")

1. **🧪 Custom Brew Studio (`/custom-blend.html`)**:
   - Cho phép khách hàng tự tinh chỉnh gu cà phê: tỷ lệ Robusta Đắk Lắk vs Arabica Cầu Đất, phương pháp pha (Phin, Espresso, Cold Brew, V60), mức độ ngọt và loại sữa (Sữa tươi, sữa đặc, sữa yến mạch).
   - Tự động tính giá động theo công thức và cho phép thêm ngay vào giỏ hàng.

2. **🪑 Sơ Đồ Đặt Bàn Co-working 2D Thời Gian Thực (`/booking.html`)**:
   - Bản đồ mặt bằng tương tác 2D phân chia các khu vực: *Khu yên tĩnh*, *Khu cửa sổ view đẹp*, *Khu họp nhóm*.
   - Kiểm tra trạng thái bàn trống/đã đặt theo ngày và khung giờ linh hoạt, lưu thông tin đặt chỗ và ghi chú đồ uống.

3. **🎟️ Hệ Thống Tích Điểm Thành Viên (Bean Points)**:
   - Cơ chế tự động cộng 1 điểm cho mỗi 10.000 VNĐ chi tiêu khi đơn hàng chuyển sang trạng thái `COMPLETED`.
   - Lưu trữ và cập nhật số dư điểm trực tiếp vào tài khoản người dùng trong MySQL.

4. **🔔 Màn Hình Pha Chế Quầy Bar KDS - Kitchen Display System (`/kds.html`)**:
   - Giao diện Dark-mode chuyên dụng cho Barista với 3 cột Kanban trực quan: *Chờ pha chế (PENDING)* ➔ *Đang pha (PROCESSING)* ➔ *Đang giao (DELIVERING)*.
   - Đồng hồ đếm thời gian thực cho từng đơn hàng, âm thanh chuông báo tự động khi có đơn hàng mới và nút chuyển trạng thái 1-chạm.

5. **🤖 Trợ Lý Ảo "AI Barista Sommelier"**:
   - Widget nổi thông minh tích hợp trên toàn bộ website.
   - Phân tích tâm trạng, nhu cầu năng lượng và sở thích của khách để đưa ra gợi ý thức uống phù hợp cùng nút đặt món nhanh.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu Cầu Môi Trường
- **JDK**: Java 21 trở lên (khuyên dùng Eclipse Adoptium Temurin 21).
- **MySQL**: MySQL Server 8.0 đang hoạt động tại `localhost:3306`.
  - Database: `coffee_shop`
  - Username: `root`
  - Password: `password` (hoặc chỉnh sửa trong `application.properties`)

### Các Bước Khởi Chạy
1. **Clone hoặc mở thư mục dự án**:
   ```powershell
   cd e:\QuarkusProjects\coffee-shop
   ```

2. **Chạy ở chế độ phát triển (Live Coding Dev Mode)**:
   ```powershell
   .\mvnw.cmd quarkus:dev
   ```

3. **Truy cập ứng dụng trên trình duyệt**:
   - 🏠 **Trang chủ**: [http://localhost:8080/index.html](http://localhost:8080/index.html)
   - ☕ **Thực đơn món**: [http://localhost:8080/products.html](http://localhost:8080/products.html)
   - 🧪 **Tự phối vị (Custom Blend)**: [http://localhost:8080/custom-blend.html](http://localhost:8080/custom-blend.html)
   - 🪑 **Đặt bàn Co-working**: [http://localhost:8080/booking.html](http://localhost:8080/booking.html)
   - 🔔 **Màn hình Barista KDS**: [http://localhost:8080/kds.html](http://localhost:8080/kds.html)
   - 📦 **Lịch sử đơn hàng**: [http://localhost:8080/orders.html](http://localhost:8080/orders.html)
   - 🛒 **Giỏ hàng & Thanh toán**: [http://localhost:8080/cart.html](http://localhost:8080/cart.html)
   - ⚙️ **Quản trị Admin**: [http://localhost:8080/admin-orders.html](http://localhost:8080/admin-orders.html)
   - 🛠️ **Quarkus Dev UI**: [http://localhost:8080/q/dev/](http://localhost:8080/q/dev/)

---

## 📦 Đóng Gói Ứng Dụng Sản Xuất (Production Packaging)

- **Đóng gói file Fast-JAR**:
  ```powershell
  .\mvnw.cmd package
  java -jar target/quarkus-app/quarkus-run.jar
  ```

- **Đóng gói file Über-JAR (All-in-one)**:
  ```powershell
  .\mvnw.cmd package -Dquarkus.package.jar.type=uber-jar
  java -jar target/coffee-shop-1.0.0-SNAPSHOT-runner.jar
  ```

---

## 🐳 Hướng Dẫn Đóng Gói & Khởi Chạy Với Docker

Dự án hỗ trợ sẵn các Dockerfile tối ưu hóa cao trong thư mục `src/main/docker/`:

### 1. Build & Chạy Container dạng JVM:
```powershell
# Bước 1: Build ứng dụng Java
.\mvnw.cmd package

# Bước 2: Build Docker Image
docker build -f src/main/docker/Dockerfile.jvm -t coffee-shop:jvm .

# Bước 3: Chạy Container (kết nối mạng host hoặc container MySQL)
docker run -i --rm -p 8080:8080 --name coffee-shop-app coffee-shop:jvm
```

### 2. Build & Chạy Container dạng Native (Siêu nhẹ & Tốc độ cao):
```powershell
# Bước 1: Build native executable qua Docker (không cần cài GraalVM trên máy)
.\mvnw.cmd package -Dnative -Dquarkus.native.container-build=true

# Bước 2: Build Docker Image Native
docker build -f src/main/docker/Dockerfile.native-micro -t coffee-shop:native .

# Bước 3: Chạy Container Native
docker run -i --rm -p 8080:8080 --name coffee-shop-native coffee-shop:native
```
