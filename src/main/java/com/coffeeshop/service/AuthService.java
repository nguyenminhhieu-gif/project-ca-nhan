/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.coffeeshop.service;

import com.coffeeshop.dto.ForgotPasswordRequest;

import jakarta.transaction.Transactional;
import com.coffeeshop.dto.LoginRequest;
import com.coffeeshop.dto.RegisterRequest;
import com.coffeeshop.entity.User;
import com.coffeeshop.repository.UserRepository;
import com.coffeeshop.security.JwtUtil;
import com.coffeeshop.utils.HashUtil;
import com.coffeeshop.dto.LoginResponse;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.time.LocalDate;
import java.time.LocalDateTime;

@ApplicationScoped
public class AuthService {

    @Inject
    UserRepository userRepository;

    @Transactional
    public String register(RegisterRequest request) {

        try {

            User existingUser = userRepository.findByUsername(request.username);

            if (existingUser != null) {
                return "Username already exists";
            }

            if (!request.password.equals(request.confirmPassword)) {
                return "Password confirmation does not match";
            }

            User user = new User();

            user.fullName = request.fullName;
            user.phone = request.phone;
            user.address = request.address;
            user.gender = request.gender;

            // safe parse
            if (request.birthDate != null && !request.birthDate.isEmpty()) {
                user.birthDate = java.time.LocalDate.parse(request.birthDate);
            }

            user.username = request.username;
            user.password = HashUtil.hashPassword(request.password);
            user.role = "CUSTOMER";
            user.points = 0;
            user.createdAt = java.time.LocalDateTime.now();

            userRepository.persist(user);

            return "Register success";

        } catch (Exception e) {
            e.printStackTrace();
            return "Register failed: " + e.getMessage();
        }
    }

    public LoginResponse login(LoginRequest request) {

        User user
                = userRepository.findByUsername(request.username);

        if (user == null) {
            return new LoginResponse(
                    "Người dùng không tồn tại"
            );
        }

        boolean checkPassword = false;

        // =========================
        // CHECK HASH PASSWORD
        // =========================
        try {

            checkPassword
                    = HashUtil.verifyPassword(
                            request.password,
                            user.password
                    );

        } catch (Exception e) {

            checkPassword = false;
        }

        // =========================
        // CHECK PLAIN TEXT PASSWORD
        // =========================
        if (!checkPassword) {

            checkPassword
                    = user.password.equals(
                            request.password
                    );
        }

        // =========================
        // WRONG PASSWORD
        // =========================
        if (!checkPassword) {
            return new LoginResponse(
                    "Vui lòng nhập đúng mật khẩu"
            );
        }

        // =========================
        // LOGIN SUCCESS
        // =========================
        var token = JwtUtil.generateToken(
                user.id,
                user.username,
                user.role
        );

        return new LoginResponse(
                token,
                user.role,
                user.username,
                user.id,
                user.points
        );
    }
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {

        User user = userRepository.findByUsername(request.username);

        if (user == null) {
            return "User not found";
        }

        if (!request.newPassword.equals(request.confirmPassword)) {
            return "Password confirmation does not match";
        }

        user.password = HashUtil.hashPassword(request.newPassword);

        userRepository.persist(user);

        return "Reset password success";
    }
}
