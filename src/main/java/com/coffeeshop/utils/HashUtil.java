/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.coffeeshop.utils;

import org.mindrot.jbcrypt.BCrypt;

public class HashUtil {
    // Băm mật khẩu
    public static String hashPassword(String password) {

        return BCrypt.hashpw(
                password,
                BCrypt.gensalt()
        );
    }
    // Kiểm tra mật khẩu
    public static boolean verifyPassword(
            String rawPassword,
            String hashedPassword) {
        return BCrypt.checkpw(
                rawPassword,
                hashedPassword
        );
    }
}