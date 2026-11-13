package com.coffeeshop.service;

import com.coffeeshop.dto.PaymentDTO;
import com.coffeeshop.entity.Order;
import com.coffeeshop.entity.Payment;
import com.coffeeshop.repository.OrderRepository;
import com.coffeeshop.repository.PaymentRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;

@ApplicationScoped
public class PaymentService {

    @Inject
    PaymentRepository paymentRepository;

    @Inject
    OrderRepository orderRepository;

    // ==========================================
    // PROCESS / UPDATE PAYMENT
    // ==========================================
    @Transactional
    public PaymentDTO processPayment(PaymentDTO dto) {
        if (dto == null || dto.orderId == null) {
            throw new RuntimeException("Mã đơn hàng (Order ID) không hợp lệ.");
        }

        Payment payment = paymentRepository.findByOrderId(dto.orderId);
        if (payment == null) {
            Order order = orderRepository.findById(dto.orderId);
            if (order == null) {
                throw new RuntimeException("Không tìm thấy đơn hàng với ID: " + dto.orderId);
            }
            payment = new Payment();
            payment.order = order;
            payment.amount = order.totalPrice;
        }

        if (dto.paymentStatus != null && !dto.paymentStatus.isBlank()) {
            payment.paymentStatus = dto.paymentStatus;
        } else {
            payment.paymentStatus = "SUCCESS";
        }

        if (dto.paymentMethod != null && !dto.paymentMethod.isBlank()) {
            payment.paymentMethod = dto.paymentMethod;
        }

        if (dto.transactionId != null && !dto.transactionId.isBlank()) {
            payment.transactionId = dto.transactionId;
        }

        payment.paymentDate = LocalDateTime.now();
        paymentRepository.persist(payment);

        // Đồng bộ trạng thái đơn hàng nếu thanh toán thành công
        if ("SUCCESS".equalsIgnoreCase(payment.paymentStatus) && payment.order != null) {
            payment.order.status = "PAID";
            orderRepository.persist(payment.order);
        }

        return convertToDTO(payment);
    }

    // ==========================================
    // GET PAYMENT BY ORDER ID
    // ==========================================
    public PaymentDTO getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId);
        if (payment == null) {
            throw new RuntimeException("Không tìm thấy thông tin thanh toán cho đơn hàng: " + orderId);
        }
        return convertToDTO(payment);
    }

    private PaymentDTO convertToDTO(Payment payment) {
        if (payment == null) return null;
        PaymentDTO dto = new PaymentDTO();
        dto.id = payment.id;
        dto.orderId = payment.order != null ? payment.order.id : null;
        dto.amount = payment.amount;
        dto.paymentStatus = payment.paymentStatus;
        dto.paymentMethod = payment.paymentMethod;
        dto.transactionId = payment.transactionId;
        dto.paymentDate = payment.paymentDate;
        return dto;
    }
}
