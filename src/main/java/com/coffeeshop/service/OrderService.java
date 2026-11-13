package com.coffeeshop.service;

import com.coffeeshop.dto.CheckoutRequest;
import com.coffeeshop.dto.OrderResponseDTO;
import com.coffeeshop.dto.OrderResponseDTO.OrderItemDTO;
import com.coffeeshop.entity.CartItem;
import com.coffeeshop.entity.Order;
import com.coffeeshop.entity.OrderDetail;
import com.coffeeshop.entity.Payment;
import com.coffeeshop.entity.Product;
import com.coffeeshop.entity.User;
import com.coffeeshop.repository.CartRepository;
import com.coffeeshop.repository.OrderDetailRepository;
import com.coffeeshop.repository.OrderRepository;
import com.coffeeshop.repository.PaymentRepository;
import com.coffeeshop.repository.ProductRepository;
import com.coffeeshop.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@ApplicationScoped
public class OrderService {

    private static final Set<String> VALID_STATUSES = Set.of(
            "PENDING", "PROCESSING", "DELIVERING", "COMPLETED", "CANCELLED"
    );

    @Inject
    OrderRepository orderRepository;

    @Inject
    OrderDetailRepository orderDetailRepository;

    @Inject
    PaymentRepository paymentRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    CartRepository cartRepository;

    @Inject
    ProductRepository productRepository;

    // ==========================================
    // CHECKOUT / CREATE ORDER
    // ==========================================
    @Transactional
    public OrderResponseDTO checkout(CheckoutRequest req) {
        if (req == null || req.userId == null) {
            throw new RuntimeException("Vui lòng cung cấp mã người dùng (User ID) hợp lệ.");
        }

        User user = userRepository.findById(req.userId);
        if (user == null) {
            throw new RuntimeException("Không tìm thấy thông tin tài khoản người dùng.");
        }

        List<CartItem> cartItems = cartRepository.find(
                "select c from CartItem c join fetch c.product where c.user.id = ?1", req.userId).list();

        if (cartItems == null || cartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng của bạn đang trống, không thể thanh toán.");
        }

        // Tính tổng tiền các món trong giỏ
        double subtotal = 0.0;
        for (CartItem item : cartItems) {
            double price = item.product.price != null ? item.product.price : 0.0;
            int qty = item.quantity != null ? item.quantity : 1;
            subtotal += (price * qty);
        }

        double discount = req.discountAmount != null ? req.discountAmount : 0.0;
        double finalTotal = Math.max(0.0, subtotal - discount);

        // Tạo Order
        Order order = new Order();
        order.user = user;
        order.receiverName = (req.receiverName != null && !req.receiverName.isBlank()) 
                ? req.receiverName.trim() : user.fullName;
        order.phone = (req.phone != null && !req.phone.isBlank()) 
                ? req.phone.trim() : user.phone;
        order.shippingAddress = (req.shippingAddress != null && !req.shippingAddress.isBlank()) 
                ? req.shippingAddress.trim() : user.address;
        order.paymentMethod = (req.paymentMethod != null && !req.paymentMethod.isBlank()) 
                ? req.paymentMethod.trim() : "COD";
        order.note = req.note;
        order.totalPrice = finalTotal;
        order.status = "PENDING";
        order.createdAt = LocalDateTime.now();

        orderRepository.persist(order);
        orderRepository.flush();

        // Tạo OrderDetails và cập nhật tồn kho
        for (CartItem item : cartItems) {
            OrderDetail detail = new OrderDetail();
            detail.order = order;
            detail.product = item.product;
            detail.quantity = item.quantity != null ? item.quantity : 1;
            detail.price = item.product.price;
            orderDetailRepository.persist(detail);

            // Giảm số lượng tồn kho sản phẩm nếu có quản lý số lượng
            if (item.product.quantity != null && item.product.quantity > 0) {
                item.product.quantity = Math.max(0, item.product.quantity - detail.quantity);
                productRepository.persist(item.product);
            }
        }

        // Tạo Payment
        Payment payment = new Payment();
        payment.order = order;
        payment.amount = finalTotal;
        payment.paymentDate = LocalDateTime.now();
        payment.paymentMethod = order.paymentMethod;
        payment.paymentStatus = "PENDING";
        payment.transactionId = "TXN" + System.currentTimeMillis() + (int)(Math.random() * 1000);
        paymentRepository.persist(payment);

        // Xóa các món trong giỏ hàng sau khi đặt thành công
        cartRepository.delete("user.id = ?1", req.userId);

        return convertToDTO(order);
    }

    // ==========================================
    // GET USER ORDERS
    // ==========================================
    public List<OrderResponseDTO> getUserOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        List<OrderResponseDTO> dtos = new ArrayList<>();
        for (Order order : orders) {
            dtos.add(convertToDTO(order));
        }
        return dtos;
    }

    // ==========================================
    // GET ORDER BY ID
    // ==========================================
    public OrderResponseDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId);
        if (order == null) {
            throw new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId);
        }
        return convertToDTO(order);
    }

    // ==========================================
    // GET ALL ORDERS (ADMIN)
    // ==========================================
    public List<OrderResponseDTO> getAllOrders() {
        List<Order> orders = orderRepository.listAllSorted();
        List<OrderResponseDTO> dtos = new ArrayList<>();
        for (Order order : orders) {
            dtos.add(convertToDTO(order));
        }
        return dtos;
    }

    // ==========================================
    // UPDATE ORDER STATUS
    // ==========================================
    @Transactional
    public OrderResponseDTO updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId);
        if (order == null) {
            throw new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId);
        }

        String oldStatus = order.status != null ? order.status.trim().toUpperCase() : "";
        String normalizedNewStatus = newStatus != null ? newStatus.trim().toUpperCase() : "";

        if (normalizedNewStatus.isBlank()) {
            throw new RuntimeException("Trạng thái (status) không được để trống");
        }

        if (!VALID_STATUSES.contains(normalizedNewStatus)) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + newStatus + ". Các trạng thái hợp lệ: " + VALID_STATUSES);
        }

        order.status = normalizedNewStatus;
        orderRepository.persist(order);

        // Khi trạng thái chuyển sang COMPLETED (và trước đó chưa phải COMPLETED)
        // -> Cập nhật Payment SUCCESS và tích 1 điểm cho mỗi 10.000 VNĐ vào user.points
        if ("COMPLETED".equals(normalizedNewStatus) && !"COMPLETED".equals(oldStatus)) {
            Payment payment = paymentRepository.findByOrderId(orderId);
            if (payment != null) {
                payment.paymentStatus = "SUCCESS";
                paymentRepository.persist(payment);
            }

            if (order.user != null && order.totalPrice != null && order.totalPrice >= 10000) {
                int pointsAwarded = (int) (order.totalPrice / 10000);
                User user = userRepository.findById(order.user.id);
                if (user != null) {
                    if (user.points == null) {
                        user.points = 0;
                    }
                    user.points += pointsAwarded;
                    userRepository.persist(user);
                }
            }
        } 
        // Khi trạng thái chuyển sang CANCELLED (và trước đó chưa phải CANCELLED)
        // -> Hủy payment và hoàn lại tồn kho cho sản phẩm
        else if ("CANCELLED".equals(normalizedNewStatus) && !"CANCELLED".equals(oldStatus)) {
            Payment payment = paymentRepository.findByOrderId(orderId);
            if (payment != null && "PENDING".equalsIgnoreCase(payment.paymentStatus)) {
                payment.paymentStatus = "CANCELLED";
                paymentRepository.persist(payment);
            }

            List<OrderDetail> details = orderDetailRepository.findByOrderId(order.id);
            if (details != null) {
                for (OrderDetail d : details) {
                    if (d.product != null && d.quantity != null) {
                        Product p = productRepository.findById(d.product.id);
                        if (p != null && p.quantity != null) {
                            p.quantity += d.quantity;
                            productRepository.persist(p);
                        }
                    }
                }
            }
        }

        return convertToDTO(order);
    }

    // ==========================================
    // CANCEL ORDER (if status is PENDING)
    // ==========================================
    @Transactional
    public OrderResponseDTO cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId);
        if (order == null) {
            throw new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId);
        }

        String currentStatus = order.status != null ? order.status.trim().toUpperCase() : "";
        if (!"PENDING".equals(currentStatus)) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng ở trạng thái Chờ duyệt (PENDING). Trạng thái hiện tại: " + order.status);
        }

        return updateOrderStatus(orderId, "CANCELLED");
    }

    // ==========================================
    // HELPER: CONVERT ENTITY TO DTO
    // ==========================================
    public OrderResponseDTO convertToDTO(Order order) {
        if (order == null) return null;

        OrderResponseDTO dto = new OrderResponseDTO();
        dto.id = order.id;
        dto.userId = order.user != null ? order.user.id : null;
        dto.customerName = (order.user != null && order.user.fullName != null && !order.user.fullName.isBlank()) 
                ? order.user.fullName 
                : (order.receiverName != null ? order.receiverName : "");
        dto.receiverName = order.receiverName != null ? order.receiverName : dto.customerName;
        dto.phone = order.phone != null ? order.phone : (order.user != null ? order.user.phone : "");
        dto.shippingAddress = order.shippingAddress != null ? order.shippingAddress : (order.user != null ? order.user.address : "");
        dto.address = dto.shippingAddress;
        dto.paymentMethod = order.paymentMethod;
        dto.status = order.status;
        dto.totalPrice = order.totalPrice;
        dto.note = order.note;
        dto.createdAt = order.createdAt;

        // Payment info
        Payment payment = paymentRepository.findByOrderId(order.id);
        if (payment != null) {
            dto.paymentStatus = payment.paymentStatus;
            dto.transactionId = payment.transactionId;
        }

        // Details info
        List<OrderDetail> details = orderDetailRepository.findByOrderId(order.id);
        if (details != null) {
            for (OrderDetail d : details) {
                OrderItemDTO itemDto = new OrderItemDTO();
                itemDto.id = d.id;
                if (d.product != null) {
                    itemDto.productId = d.product.id;
                    itemDto.productName = d.product.name;
                    itemDto.name = d.product.name;
                    itemDto.productImage = d.product.image;
                    itemDto.image = d.product.image;
                }
                itemDto.price = d.price;
                itemDto.quantity = d.quantity;
                itemDto.subtotal = (d.price != null && d.quantity != null) ? (d.price * d.quantity) : 0.0;
                dto.items.add(itemDto);
            }
        }

        return dto;
    }
}
