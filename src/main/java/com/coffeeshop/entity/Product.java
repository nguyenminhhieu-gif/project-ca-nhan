/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.coffeeshop.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false)
    public String name;

    public String category;

    public Integer quantity;

    @Column(nullable = false)
    public Double price;

    public String status;

    public String image;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(name = "created_date")
    public LocalDate createdDate;
}
