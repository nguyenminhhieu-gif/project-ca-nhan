/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.coffeeshop.exception;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class GlobalExceptionHandler
        implements ExceptionMapper<Exception> {

    @Override
    public Response toResponse(Exception exception) {

        return Response
                .status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(exception.getMessage())
                .build();
    }
}
