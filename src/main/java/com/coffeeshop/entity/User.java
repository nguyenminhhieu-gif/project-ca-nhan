package com.coffeeshop.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "full_name", nullable = false)
    public String fullName;

    @Column(length = 20)
    public String phone;

    public String address;

    @Column(length = 10)
    public String gender;

    @Column(name = "birth_date")
    public LocalDate birthDate;

    @Column(unique = true, nullable = false)
    public String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    public String password;

    @Column(nullable = false)
    public String role;

    @Column(name = "points")
    public Integer points = 0;

    @Column(name = "created_at")
    public LocalDateTime createdAt;
}
