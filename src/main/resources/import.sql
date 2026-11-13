-- DATA SEED CHO QUARKUS DEV/TEST MODE
INSERT INTO products (id, name, category, quantity, price, status, image, description, created_date)
VALUES
(1, 'Cà Phê Sữa Đá Sài Gòn', 'coffee', 100, 29000, 'ACTIVE', 'caphesua.jpg', 'Hạt Robusta Đắk Lắk đậm đà rang mộc hòa quyện cùng sữa đặc béo ngậy, tạo nên hương vị cà phê sữa đá truyền thống thơm ngon khó cưỡng.', CURRENT_DATE),
(2, 'Bạc Xỉu Sữa Nướng', 'coffee', 100, 32000, 'ACTIVE', 'bacxiu.jpg', 'Nhiều sữa ít cà phê, kết hợp tinh tế giữa sữa tươi thanh trùng béo ngậy và chút cà phê thơm dịu dàng, phù hợp cho mọi lứa tuổi.', CURRENT_DATE),
(3, 'Cà Phê Đen Đá Nguyên Chất', 'coffee', 100, 25000, 'ACTIVE', 'capheden.jpg', '100% Robusta Đắk Lắk hảo hạng rang mộc, vị đắng đậm đà chuẩn gu người sành cà phê Việt, đem lại sự tỉnh táo suốt ngày dài.', CURRENT_DATE),
(4, 'Cà Phê Muối Xứ Huế', 'coffee', 80, 35000, 'ACTIVE', 'caphemuoi.jpg', 'Hương vị bùng nổ giữa cà phê đậm đà và lớp kem muối béo mặn dịu êm, thơm bùi ngây ngất.', CURRENT_DATE),
(5, 'Cà Phê Trứng Hoàng Kim', 'coffee', 60, 39000, 'ACTIVE', 'caphetrung.jpg', 'Lớp kem trứng tươi đánh bông mịn béo ngậy vàng ươm phủ lên trên nền cà phê nóng thơm lừng theo công thức gia truyền.', CURRENT_DATE),
(6, 'Cà Phê Americano Đá', 'coffee', 100, 32000, 'ACTIVE', 'americano.jpg', 'Espresso pha loãng thanh nhẹ, giải khát mát lạnh nhưng vẫn giữ trọn hương thơm đặc trưng của cà phê.', CURRENT_DATE),
(7, 'Cappuccino Chuẩn Gu Ý', 'coffee', 70, 42000, 'ACTIVE', 'cappuccino.jpg', 'Tỷ lệ vàng giữa Espresso, sữa nóng và lớp bọt sữa dày mịn bồng bềnh phủ bột cacao thơm ngậy.', CURRENT_DATE),
(8, 'Cà Phê Cold Brew Cam Vàng', 'coffee', 50, 45000, 'ACTIVE', 'coldbrew.jpg', 'Cà phê Arabica ủ lạnh suốt 24 giờ cho vị chua thanh tự nhiên, phối hợp cùng lát cam vàng mọng nước.', CURRENT_DATE),
(9, 'Combo Co-Working Yên Tĩnh (4 Giờ + 1 Nước)', 'services', 30, 69000, 'ACTIVE', 'coworking.jpg', 'Dịch vụ không gian làm việc chuyên nghiệp: 4 giờ phòng máy lạnh yên tĩnh, ổ cắm riêng, WiFi tốc độ cao và miễn phí 1 ly cà phê/trà tùy chọn.', CURRENT_DATE),
(10, 'Gói Tiệc Trà & Coffee Break Mini (5-10 người)', 'services', 15, 299000, 'ACTIVE', 'coffeebreak.jpg', 'Dịch vụ chuẩn bị trọn gói cho hội thảo, họp nhóm: gồm 01 bình giữ nhiệt cà phê lớn (1.5L) + set 5 đĩa bánh ngọt mini phong phú.', CURRENT_DATE),
(11, 'Workshop Trải Nghiệm Tự Pha Cà Phê Cuối Tuần', 'services', 20, 180000, 'ACTIVE', 'workshop.jpg', 'Khóa trải nghiệm 2 giờ cùng chuyên gia Barista: học nếm thử hương vị (Cupping), tự tay pha chế phin & Pour-Over và nhận quà mang về.', CURRENT_DATE),
(12, 'Bánh Croissant Bơ Pháp Nướng Nóng', 'bakery', 40, 35000, 'ACTIVE', 'croissant.jpg', 'Bánh sừng bò ngàn lớp xốp giòn nướng thơm phức bơ Pháp cao cấp, sự kết hợp tuyệt hảo khi nhâm nhi cùng cà phê.', CURRENT_DATE),
(13, 'Bánh Tiramisu Hương Vị Cà Phê Ý', 'bakery', 35, 42000, 'ACTIVE', 'tiramisu.jpg', 'Bánh tráng miệng trứ danh từ Ý thấm đẫm cà phê espresso hòa quyện cùng phô mai Mascarpone mềm mượt béo ngậy.', CURRENT_DATE),
(14, 'Bánh Cookie Chocolate Hạnh Nhân', 'bakery', 80, 25000, 'ACTIVE', 'cookie.jpg', 'Bánh quy thủ công nướng giòn rụm kết hợp hạt hạnh nhân rang bùi và sô-cô-la chip nguyên chất ngọt dịu.', CURRENT_DATE),
(15, 'Cà Phê Hạt Robusta Honey Đắk Lắk (Gói 500g)', 'beans', 50, 145000, 'ACTIVE', 'hat_robusta.jpg', 'Cà phê hạt chế biến theo phương pháp Honey giữ trọn vị ngọt tự nhiên, rang mộc nguyên chất, đóng gói van 1 chiều.', CURRENT_DATE),
(16, 'Cà Phê Hạt Arabica Cầu Đất (Gói 250g)', 'beans', 40, 165000, 'ACTIVE', 'hat_arabica.jpg', 'Hạt Arabica trồng tại độ cao 1.600m Cầu Đất Đà Lạt, hương hoa quả thơm ngát, vị chua thanh và hậu ngọt sâu.', CURRENT_DATE),
(17, 'Phin Pha Cà Phê Nhôm Anode Cao Cấp', 'beans', 60, 45000, 'ACTIVE', 'phin_cafe.jpg', 'Chất liệu nhôm mạ anode bền đẹp truyền nhiệt đều, các lỗ lọc chuẩn xác giúp chiết xuất tách cà phê thơm ngon nhất.', CURRENT_DATE),
(18, 'Trà Đào Cam Sả Tươi Mát', 'tea', 90, 39000, 'ACTIVE', 'tradao.jpg', 'Vị trà thanh tao hòa cùng vị ngọt thơm của đào giòn, cam vàng tươi mát và hương thơm ấm nồng của sả tươi.', CURRENT_DATE),
(19, 'Trà Vải Hoa Lài Hạt Chia', 'tea', 85, 39000, 'ACTIVE', 'travai.jpg', 'Hương hoa lài thoang thoảng kết hợp quả vải mọng nước ngọt ngào và hạt chia giàu dinh dưỡng thanh lọc cơ thể.', CURRENT_DATE);
