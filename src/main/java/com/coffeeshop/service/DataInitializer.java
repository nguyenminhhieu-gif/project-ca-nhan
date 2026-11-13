package com.coffeeshop.service;

import com.coffeeshop.entity.Product;
import com.coffeeshop.repository.ProductRepository;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

import java.time.LocalDate;
import java.util.logging.Logger;

@ApplicationScoped
public class DataInitializer {

    private static final Logger LOG = Logger.getLogger(DataInitializer.class.getName());

    @Inject
    ProductRepository productRepository;

    @Inject
    EntityManager entityManager;

    @Transactional
    public void onStart(@Observes StartupEvent ev) {
        long count = productRepository.count();
        if (count == 0) {
            LOG.info("Bảng sản phẩm đang trống. Tự động khởi tạo dữ liệu cà phê và dịch vụ phụ...");
            seedProducts();
        } else {
            LOG.info("Đã có " + count + " sản phẩm trong cơ sở dữ liệu.");
        }
    }

    @Transactional
    public void seedProducts() {
        LOG.info("Đang tiến hành dọn dẹp và khôi phục dữ liệu sản phẩm & dịch vụ...");

        try {
            // Tắt tạm thời kiểm tra khóa ngoại để dọn dẹp sạch sẽ
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM cart_items").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM order_details").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM products").executeUpdate();
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
        } catch (Exception e) {
            LOG.warning("Lỗi khi xóa bảng bằng Native SQL: " + e.getMessage() + ". Đang dùng fallback...");
            try {
                productRepository.deleteAll();
            } catch (Exception ex) {
                LOG.severe("Fallback deleteAll cũng thất bại: " + ex.getMessage());
            }
        }

        // 1. CÀ PHÊ TRUYỀN THỐNG & PHA PHIN
        createItem("Cà Phê Sữa Đá Sài Gòn", "coffee", 29000, 100, "caphesua.jpg",
                "Hạt Robusta Đắk Lắk đậm đà rang mộc hòa quyện cùng sữa đặc béo ngậy, tạo nên hương vị cà phê sữa đá truyền thống thơm ngon khó cưỡng.");

        createItem("Bạc Xỉu Sữa Nướng", "coffee", 32000, 100, "bacxiu.jpg",
                "Nhiều sữa ít cà phê, kết hợp tinh tế giữa sữa tươi thanh trùng béo ngậy và chút cà phê thơm dịu dàng, phù hợp cho mọi lứa tuổi.");

        createItem("Cà Phê Đen Đá Nguyên Chất", "coffee", 25000, 100, "capheden.jpg",
                "100% Robusta Đắk Lắk hảo hạng rang mộc, vị đắng đậm đà chuẩn gu người sành cà phê Việt, đem lại sự tỉnh táo suốt ngày dài.");

        createItem("Cà Phê Muối Xứ Huế", "coffee", 35000, 80, "caphemuoi.jpg",
                "Sự hòa quyện hoàn hảo giữa vị đậm đà của cà phê và lớp kem muối béo mặn dịu êm, thơm bùi ngây ngất.");

        createItem("Cà Phê Trứng Hoàng Kim", "coffee", 39000, 60, "caphetrung.jpg",
                "Lớp kem trứng tươi đánh bông mịn béo ngậy vàng ươm phủ lên trên nền cà phê nóng thơm lừng theo công thức gia truyền.");

        // 2. CÀ PHÊ Ý & HIỆN ĐẠI (SPECIALTY)
        createItem("Cà Phê Americano Đá", "coffee", 32000, 100, "americano.jpg",
                "Espresso pha loãng cùng nước tinh khiết và đá lạnh, thanh nhẹ mát lành nhưng vẫn giữ trọn hương thơm đặc trưng của hạt cà phê.");

        createItem("Cappuccino Chuẩn Gu Ý", "coffee", 42000, 70, "cappuccino.jpg",
                "Tỷ lệ vàng giữa Espresso, sữa nóng và lớp bọt sữa dày mịn bồng bềnh, rắc thêm chút bột cacao thơm lừng bên trên.");

        createItem("Cà Phê Cold Brew Cam Vàng", "coffee", 45000, 50, "coldbrew.jpg",
                "Cà phê Arabica ủ lạnh suốt 24 giờ cho vị chua thanh tự nhiên, phối hợp cùng lát cam vàng mọng nước sảng khoái.");

        // 3. HẠT CÀ PHÊ & DỤNG CỤ (BÁN LẺ MANG VỀ)
        createItem("Cà Phê Hạt Robusta Honey Đắk Lắk (500g)", "beans", 145000, 50, "hat_robusta.jpg",
                "Cà phê hạt chế biến theo phương pháp Honey giữ trọn vị ngọt tự nhiên, rang mộc nguyên chất, đóng gói van 1 chiều cao cấp.");

        createItem("Cà Phê Hạt Arabica Cầu Đất (250g)", "beans", 165000, 40, "hat_arabica.jpg",
                "Hạt Arabica trồng tại độ cao 1.600m Cầu Đất - Đà Lạt, hương hoa quả thơm ngát, vị chua thanh thoát và hậu vị ngọt sâu.");

        createItem("Phin Pha Cà Phê Nhôm Anode Cao Cấp", "beans", 45000, 60, "phin_cafe.jpg",
                "Chất liệu nhôm mạ anode công nghệ cao, lỗ phin đục đều cho tốc độ nhỏ giọt lý tưởng, chiết xuất tách cà phê chuẩn vị nhất.");

        // 4. BÁNH NGỌT & ĐỒ ĂN KÈM (DỊCH VỤ PHỤ)
        createItem("Bánh Croissant Bơ Pháp Nướng Nóng", "bakery", 35000, 40, "croissant.jpg",
                "Bánh sừng bò ngàn lớp xốp giòn nướng thơm phức bơ Pháp, là sự kết hợp không thể thiếu bên tách cà phê sáng.");

        createItem("Bánh Tiramisu Hương Cà Phê Ý", "bakery", 42000, 35, "tiramisu.jpg",
                "Bánh tráng miệng trứ danh từ Ý thấm đẫm cà phê espresso hảo hạng kết hợp phô mai Mascarpone mềm mượt quyến rũ.");

        createItem("Bánh Cookie Chocolate Hạnh Nhân", "bakery", 25000, 80, "cookie.jpg",
                "Bánh quy nướng giòn rụm kết hợp sô-cô-la chip nguyên chất và hạt hạnh nhân giòn bùi thơm béo.");

        // 5. DỊCH VỤ KHÔNG GIAN & TRẢI NGHIỆM (DỊCH VỤ PHỤ)
        createItem("Combo Co-Working Yên Tĩnh (4 Giờ + 1 Đồ Uống)", "services", 69000, 30, "coworking.jpg",
                "Dịch vụ không gian làm việc chuyên nghiệp: 4 giờ trải nghiệm phòng máy lạnh yên tĩnh, ổ cắm từng bàn, WiFi tốc độ cao và miễn phí 1 món đồ uống.");

        createItem("Gói Tiệc Trà & Coffee Break Mini (5-10 người)", "services", 299000, 15, "coffeebreak.jpg",
                "Dịch vụ chuẩn bị trọn gói cho hội thảo, họp nhóm: gồm 01 bình giữ nhiệt cà phê lớn (1.5L) + 5 đĩa bánh ngọt mini phong phú.");

        createItem("Workshop Trải Nghiệm Tự Pha Cà Phê Cuối Tuần", "services", 180000, 20, "workshop.jpg",
                "Trải nghiệm 2 giờ thú vị cùng Barista: tìm hiểu nguồn gốc cà phê, học kỹ thuật pha phin và Pour-Over, tự tay sáng tạo tách cafe và nhận quà lưu niệm.");

        // 6. TRÀ THANH NHIỆT (MÓN PHỤ ĐI KÈM)
        createItem("Trà Đào Cam Sả Tươi Mát", "tea", 39000, 90, "tradao.jpg",
                "Vị trà lài thanh tao hòa cùng vị ngọt thơm của miếng đào giòn tan, cam vàng tươi mát và hương thơm ấm nồng của sả tươi.");

        createItem("Trà Vải Hoa Lài Hạt Chia", "tea", 39000, 85, "travai.jpg",
                "Hương hoa lài thoang thoảng kết hợp quả vải ngâm ngọt ngào và hạt chia giàu dinh dưỡng giúp thanh lọc cơ thể.");

        LOG.info("Khởi tạo thành công 19 sản phẩm cà phê và dịch vụ phụ chất lượng!");
    }

    private void createItem(String name, String category, double price, int quantity, String image, String description) {
        Product p = new Product();
        p.name = name;
        p.category = category;
        p.price = price;
        p.quantity = quantity;
        p.status = "ACTIVE";
        p.image = image;
        p.description = description;
        p.createdDate = LocalDate.now();
        productRepository.persist(p);
    }
}
