package com.coffeeshop.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingDTO {
    public Long id;
    public Long userId;
    public String customerName;
    public String customerPhone;
    public String tableNumber;
    public String tableType;
    public LocalDate bookingDate;
    public String timeSlot;
    public Integer seatsCount;
    public String drinkNote;
    public Double totalPrice;
    public String status;
    public LocalDateTime createdDate;

    public BookingDTO() {}
}

