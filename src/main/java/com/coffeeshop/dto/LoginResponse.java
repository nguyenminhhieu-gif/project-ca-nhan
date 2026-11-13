package com.coffeeshop.dto;

public class LoginResponse {

    public String token;

    public String role;

    public String username;

    public String message;

    public Long userId;

    public Integer points;

    public LoginResponse() {
    }

    // =========================
    // SUCCESS
    // =========================
    public LoginResponse(
            String token,
            String role,
            String username,
            Long userId
    ) {
        this.token = token;
        this.role = role;
        this.username = username;
        this.userId = userId;
        this.points = 0;
    }

    public LoginResponse(
            String token,
            String role,
            String username,
            Long userId,
            Integer points
    ) {
        this.token = token;
        this.role = role;
        this.username = username;
        this.userId = userId;
        this.points = points != null ? points : 0;
    }

    // =========================
    // ERROR
    // =========================
    public LoginResponse(String message) {
        this.message = message;
    }
}
