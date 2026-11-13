package com.coffeeshop.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OrderResponseDTO {

    public Long id;

    public Long userId;

    public String customerName;

    public String receiverName;

    public String phone;

    public String address;

    public String shippingAddress;

    public String paymentMethod;

    public String status;

    public Double totalPrice;

    public String note;

    public LocalDateTime createdAt;

    public String paymentStatus;

    public String transactionId;

    public List<OrderItemDTO> items = new ArrayList<>();

    public static class OrderItemDTO {
        public Long id;
        public Long productId;
        public String productName;
        public String name;
        public String productImage;
        public String image;
        public Double price;
        public Integer quantity;
        public Double subtotal;
    }
}
