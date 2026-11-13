/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.coffeeshop.resource;

import com.coffeeshop.dto.ForgotPasswordRequest;
import com.coffeeshop.dto.LoginRequest;
import com.coffeeshop.dto.LoginResponse;
import com.coffeeshop.dto.RegisterRequest;
import com.coffeeshop.service.AuthService;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

@Path("/auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AuthService authService;

    @POST
    @Path("/register")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public String register(RegisterRequest request) {
        return authService.register(request);
    }

    @POST
    @Path("/login")
    public LoginResponse login(LoginRequest request) {

        return authService.login(request);
    }

    @POST
    @Path("/forgot-password")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.TEXT_PLAIN)
    public String forgotPassword(ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }
}
