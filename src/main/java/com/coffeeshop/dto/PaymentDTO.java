package com.coffeeshop.dto;

import java.time.LocalDateTime;

public class PaymentDTO {

    public Long id;

    public Long orderId;

    public Double amount;

    public String paymentStatus;

    public String paymentMethod;

    public String transactionId;

    public LocalDateTime paymentDate;
}
