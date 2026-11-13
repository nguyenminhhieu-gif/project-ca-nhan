package com.coffeeshop.dto;

public class CheckoutRequest {

    public Long userId;

    public String receiverName;

    public String phone;

    public String shippingAddress;

    public String paymentMethod; // "COD", "BANKING", "MOMO", "VNPAY"

    public String note;

    public String voucherCode;

    public Double discountAmount;
}
