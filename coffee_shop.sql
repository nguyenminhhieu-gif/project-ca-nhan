CREATE DATABASE IF NOT EXISTS coffee_shop;
USE coffee_shop;

-- ===================================================
-- 1. BANG USERS
-- ===================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    gender VARCHAR(10),
    birth_date DATE,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
);

-- ===================================================
-- 2. BANG PRODUCTS (CA PHE & DICH VU PHU)
-- ===================================================
CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    quantity INT DEFAULT 0,
    price DOUBLE NOT NULL,
    status VARCHAR(50),
    image VARCHAR(255),
    description TEXT,
    created_date DATE DEFAULT (CURRENT_DATE)
);

-- ===================================================
-- 3. BANG ORDERS
-- ===================================================
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    total_price DOUBLE,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
);

-- ===================================================
-- 4. BANG ORDER DETAILS
-- ===================================================
CREATE TABLE IF NOT EXISTS order_details (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT,
    product_id BIGINT,
    quantity INT,
    price DOUBLE,

    CONSTRAINT fk_detail_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id),

    CONSTRAINT fk_detail_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
);

-- ===================================================
-- 5. BANG PAYMENTS
-- ===================================================
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
);

-- ===================================================
-- 6. BANG CART ITEMS
-- ===================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    product_id BIGINT,
    quantity INT DEFAULT 1,

    CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id)
    REFERENCES users(id),

    CONSTRAINT fk_cart_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
);

-- ===================================================
-- DU LIEU MAU: USERS
-- ===================================================
INSERT INTO users (full_name, phone, address, gender, birth_date, username, password, role)
VALUES
('Quản Trị Viên', '0912345678', 'Hà Nội', 'Nam', '1998-01-01', 'admin', '123456', 'ADMIN'),
('Nguyễn Văn Khách', '0987654321', 'TP Hồ Chí Minh', 'Nam', '2001-06-15', 'user1', '123456', 'CUSTOMER')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- ===================================================
-- DU LIEU MAU: SAN PHAM CA PHE & DICH VU PHU
-- ===================================================
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM cart_items;
DELETE FROM order_details;
DELETE FROM products;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO products (id, name, category, quantity, price, status, image, description, created_date)
VALUES
-- [NHOM 1] CA PHE TRUYEN THONG & PHA PHIN (SAN PHAM CHINH)
(1, 'Cà Phê Sữa Đá Sài Gòn', 'coffee', 100, 29000, 'ACTIVE', 'caphesua.jpg', 'Hạt Robusta Đắk Lắk đậm đà rang mộc hòa quyện cùng sữa đặc ngọt béo thơm lừng chuẩn vị Sài Gòn.', CURRENT_DATE),
(2, 'Bạc Xỉu Sữa Nướng', 'coffee', 100, 32000, 'ACTIVE', 'bacxiu.jpg', 'Nhiều sữa ít cà phê, kết hợp tinh tế giữa sữa tươi thanh trùng béo ngậy và chút cà phê thơm dịu dàng.', CURRENT_DATE),
(3, 'Cà Phê Đen Đá Nguyên Chất', 'coffee', 100, 25000, 'ACTIVE', 'capheden.jpg', '100% Robusta Đắk Lắk hảo hạng rang mộc, vị đắng đậm đà chuẩn gu người sành cà phê Việt.', CURRENT_DATE),
(4, 'Cà Phê Muối Xứ Huế', 'coffee', 80, 35000, 'ACTIVE', 'caphemuoi.jpg', 'Hương vị bùng nổ giữa cà phê đậm đà và lớp kem muối béo mặn dịu êm, thơm bùi ngây ngất.', CURRENT_DATE),
(5, 'Cà Phê Trứng Hoàng Kim', 'coffee', 60, 39000, 'ACTIVE', 'caphetrung.jpg', 'Lớp kem trứng tươi đánh bông mịn béo ngậy vàng ươm phủ lên trên nền cà phê nóng thơm lừng.', CURRENT_DATE),

-- [NHOM 2] CA PHE Y & SPECIALTY CRAFT
(6, 'Cà Phê Americano Đá', 'coffee', 100, 32000, 'ACTIVE', 'americano.jpg', 'Espresso pha loãng thanh nhẹ, giải khát mát lạnh nhưng vẫn giữ trọn hương thơm đặc trưng của cà phê.', CURRENT_DATE),
(7, 'Cappuccino Chuẩn Gu Ý', 'coffee', 70, 42000, 'ACTIVE', 'cappuccino.jpg', 'Tỷ lệ vàng giữa Espresso, sữa nóng và lớp bọt sữa dày mịn bồng bềnh phủ bột cacao thơm ngậy.', CURRENT_DATE),
(8, 'Cà Phê Cold Brew Cam Vàng', 'coffee', 50, 45000, 'ACTIVE', 'coldbrew.jpg', 'Cà phê Arabica ủ lạnh suốt 24 giờ cho vị chua thanh tự nhiên, phối hợp cùng lát cam vàng mọng nước.', CURRENT_DATE),

-- [NHOM 3] DICH VU PHU: DICH VU KHONG GIAN & HOI THAO
(9, 'Combo Co-Working Yên Tĩnh (4 Giờ + 1 Nước)', 'services', 30, 69000, 'ACTIVE', 'coworking.jpg', 'Dịch vụ không gian làm việc chuyên nghiệp: 4 giờ phòng máy lạnh yên tĩnh, ổ cắm riêng, WiFi tốc độ cao và miễn phí 1 ly cà phê/trà tùy chọn.', CURRENT_DATE),
(10, 'Gói Tiệc Trà & Coffee Break Mini (5-10 người)', 'services', 15, 299000, 'ACTIVE', 'coffeebreak.jpg', 'Dịch vụ chuẩn bị trọn gói cho hội thảo, họp nhóm: gồm 01 bình giữ nhiệt cà phê lớn (1.5L) + set 5 đĩa bánh ngọt mini phong phú.', CURRENT_DATE),
(11, 'Workshop Trải Nghiệm Tự Pha Cà Phê Cuối Tuần', 'services', 20, 180000, 'ACTIVE', 'workshop.jpg', 'Khóa trải nghiệm 2 giờ cùng chuyên gia Barista: học nếm thử hương vị (Cupping), tự tay pha chế phin & Pour-Over và nhận quà mang về.', CURRENT_DATE),

-- [NHOM 4] DICH VU PHU: BANH NGOT & AN KEM
(12, 'Bánh Croissant Bơ Pháp Nướng Nóng', 'bakery', 40, 35000, 'ACTIVE', 'croissant.jpg', 'Bánh sừng bò ngàn lớp xốp giòn nướng thơm phức bơ Pháp cao cấp, sự kết hợp tuyệt hảo khi nhâm nhi cùng cà phê.', CURRENT_DATE),
(13, 'Bánh Tiramisu Hương Vị Cà Phê Ý', 'bakery', 35, 42000, 'ACTIVE', 'tiramisu.jpg', 'Bánh tráng miệng trứ danh từ Ý thấm đẫm cà phê espresso hòa quyện cùng phô mai Mascarpone mềm mượt béo ngậy.', CURRENT_DATE),
(14, 'Bánh Cookie Chocolate Hạnh Nhân', 'bakery', 80, 25000, 'ACTIVE', 'cookie.jpg', 'Bánh quy thủ công nướng giòn rụm kết hợp hạt hạnh nhân rang bùi và sô-cô-la chip nguyên chất ngọt dịu.', CURRENT_DATE),

-- [NHOM 5] SAN PHAM MANG VE: HAT CA PHE & DUNG CU
(15, 'Cà Phê Hạt Robusta Honey Đắk Lắk (Gói 500g)', 'beans', 50, 145000, 'ACTIVE', 'hat_robusta.jpg', 'Cà phê hạt chế biến theo phương pháp Honey giữ trọn vị ngọt tự nhiên, rang mộc nguyên chất, đóng gói van 1 chiều.', CURRENT_DATE),
(16, 'Cà Phê Hạt Arabica Cầu Đất (Gói 250g)', 'beans', 40, 165000, 'ACTIVE', 'hat_arabica.jpg', 'Hạt Arabica trồng tại độ cao 1.600m Cầu Đất Đà Lạt, hương hoa quả thơm ngát, vị chua thanh và hậu ngọt sâu.', CURRENT_DATE),
(17, 'Phin Pha Cà Phê Nhôm Anode Cao Cấp', 'beans', 60, 45000, 'ACTIVE', 'phin_cafe.jpg', 'Chất liệu nhôm mạ anode bền đẹp truyền nhiệt đều, các lỗ lọc chuẩn xác giúp chiết xuất tách cà phê thơm ngon nhất.', CURRENT_DATE),

-- [NHOM 6] THUC UONG THANH MAT KHAC (GIAI NHIET)
(18, 'Trà Đào Cam Sả Tươi Mát', 'tea', 90, 39000, 'ACTIVE', 'tradao.jpg', 'Vị trà thanh tao hòa cùng vị ngọt thơm của đào giòn, cam vàng tươi mát và hương thơm ấm nồng của sả tươi.', CURRENT_DATE),
(19, 'Trà Vải Hoa Lài Hạt Chia', 'tea', 85, 39000, 'ACTIVE', 'travai.jpg', 'Hương hoa lài thoang thoảng kết hợp quả vải mọng nước ngọt ngào và hạt chia giàu dinh dưỡng thanh lọc cơ thể.', CURRENT_DATE);

-- DON HANG DEMO
INSERT INTO orders (id, user_id, total_price, status)
VALUES (1, 2, 61000, 'COMPLETED');

INSERT INTO order_details (order_id, product_id, quantity, price)
VALUES 
(1, 1, 1, 29000),
(1, 2, 1, 32000);

INSERT INTO payments (order_id, payment_method, payment_status)
VALUES (1, 'CASH', 'PAID');
