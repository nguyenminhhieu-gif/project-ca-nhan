/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.coffeeshop.security;

import io.smallrye.jwt.build.Jwt;

import java.time.Duration;
import java.util.Set;

public class JwtUtil {

    public static String generateToken(Long userId,String username, String role) {

        return Jwt
                .issuer("coffee-shop")
                .upn(username)
                .claim("userId", userId)
                .groups(Set.of(role))
                .expiresIn(Duration.ofHours(1))
                .signWithSecret("coffeeshopsecretkeycoffeeshopsecretkey");
    }
}