/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.coffeeshop.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    public User user;

    @Column(name = "total_price")
    public Double totalPrice;

    public String status;

    @Column(name = "payment_method")
    public String paymentMethod;

    @Column(name = "shipping_address")
    public String shippingAddress;

    @Column(name = "receiver_name")
    public String receiverName;

    @Column(name = "phone")
    public String phone;

    @Column(name = "note")
    public String note;

    @Column(name = "created_at")
    public LocalDateTime createdAt;
}