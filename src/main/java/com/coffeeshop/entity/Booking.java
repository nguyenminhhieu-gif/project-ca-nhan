package com.coffeeshop.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    public User user;

    @Column(name = "customer_name", nullable = false)
    public String customerName;

    @Column(name = "customer_phone", nullable = false)
    public String customerPhone;

    @Column(name = "table_number", nullable = false)
    public String tableNumber; // Ví dụ: "T01", "T02", "VIP01"

    @Column(name = "table_type")
    public String tableType; // "INDIVIDUAL", "WINDOW", "GROUP_MEETING"

    @Column(name = "booking_date", nullable = false)
    public LocalDate bookingDate;

    @Column(name = "time_slot", nullable = false)
    public String timeSlot; // "08:00 - 12:00", "13:00 - 17:00", "18:00 - 22:00"

    @Column(name = "seats_count")
    public Integer seatsCount = 1;

    @Column(name = "drink_note", length = 500)
    public String drinkNote;

    @Column(name = "total_price")
    public Double totalPrice = 0.0;

    @Column(name = "status")
    public String status = "CONFIRMED"; // "CONFIRMED", "COMPLETED", "CANCELLED"

    @Column(name = "created_date")
    public LocalDateTime createdDate = LocalDateTime.now();
}

