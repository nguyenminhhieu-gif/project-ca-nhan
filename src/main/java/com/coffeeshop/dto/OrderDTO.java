package com.coffeeshop.dto;

import java.time.LocalDateTime;
import java.util.List;

public class OrderDTO {

    public Long id;

    public Long userId;

    public String customerName;

    public String receiverName;

    public String phone;

    public String address;

    public String shippingAddress;

    public Double totalPrice;

    public String status;

    public String paymentMethod;

    public String note;

    public LocalDateTime createdAt;

    public String paymentStatus;

    public String transactionId;

    public List<OrderResponseDTO.OrderItemDTO> items;
}
