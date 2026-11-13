package com.coffeeshop.resource;

import com.coffeeshop.dto.PaymentDTO;
import com.coffeeshop.service.PaymentService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/payments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PaymentResource {

    @Inject
    PaymentService paymentService;

    // ==========================================
    // PROCESS PAYMENT API
    // ==========================================
    @POST
    @Path("/process")
    public Response processPayment(PaymentDTO request) {
        PaymentDTO result = paymentService.processPayment(request);
        return Response.ok(result).build();
    }

    // ==========================================
    // GET PAYMENT BY ORDER ID
    // ==========================================
    @GET
    @Path("/order/{orderId}")
    public Response getPaymentByOrder(@PathParam("orderId") Long orderId) {
        PaymentDTO result = paymentService.getPaymentByOrderId(orderId);
        return Response.ok(result).build();
    }
}
