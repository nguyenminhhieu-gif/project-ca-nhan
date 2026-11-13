/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.coffeeshop.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    public Order order;

    public Double amount;

    @Column(name = "payment_date")
    public LocalDateTime paymentDate;

    @Column(name = "payment_status")
    public String paymentStatus;

    @Column(name = "transaction_id")
    public String transactionId;

    @Column(name = "payment_method")
    public String paymentMethod;
}