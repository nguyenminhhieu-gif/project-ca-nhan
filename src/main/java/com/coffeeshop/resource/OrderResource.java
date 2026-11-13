package com.coffeeshop.resource;

import com.coffeeshop.dto.CheckoutRequest;
import com.coffeeshop.dto.OrderResponseDTO;
import com.coffeeshop.service.OrderService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;

@Path("/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OrderResource {

    @Inject
    OrderService orderService;

    // ==========================================
    // CHECKOUT API
    // ==========================================
    @POST
    @Path("/checkout")
    public Response checkout(CheckoutRequest request) {
        try {
            OrderResponseDTO order = orderService.checkout(request);
            return Response.status(Response.Status.CREATED).entity(order).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", e.getMessage()))
                    .build();
        }
    }

    // ==========================================
    // GET USER ORDERS
    // ==========================================
    @GET
    @Path("/user/{userId}")
    public Response getUserOrders(@PathParam("userId") Long userId) {
        try {
            List<OrderResponseDTO> orders = orderService.getUserOrders(userId);
            return Response.ok(orders).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", e.getMessage()))
                    .build();
        }
    }

    // ==========================================
    // GET ORDER BY ID
    // ==========================================
    @GET
    @Path("/{id}")
    public Response getOrderById(@PathParam("id") Long id) {
        try {
            OrderResponseDTO order = orderService.getOrderById(id);
            return Response.ok(order).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("message", e.getMessage()))
                    .build();
        }
    }

    // ==========================================
    // GET ALL ORDERS (ADMIN)
    // ==========================================
    @GET
    public Response getAllOrders() {
        try {
            List<OrderResponseDTO> orders = orderService.getAllOrders();
            return Response.ok(orders).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("message", e.getMessage()))
                    .build();
        }
    }

    // ==========================================
    // UPDATE ORDER STATUS
    // ==========================================
    @PUT
    @Path("/{id}/status")
    public Response updateStatus(
            @PathParam("id") Long id,
            Map<String, String> body,
            @QueryParam("status") String queryStatus
    ) {
        String status = null;
        if (body != null && body.containsKey("status")) {
            status = body.get("status");
        }
        if ((status == null || status.isBlank()) && queryStatus != null && !queryStatus.isBlank()) {
            status = queryStatus;
        }

        if (status == null || status.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", "Trạng thái (status) không được để trống"))
                    .build();
        }

        try {
            OrderResponseDTO updatedOrder = orderService.updateOrderStatus(id, status);
            return Response.ok(updatedOrder).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", e.getMessage()))
                    .build();
        }
    }

    // ==========================================
    // CANCEL ORDER
    // ==========================================
    @PUT
    @Path("/{id}/cancel")
    public Response cancelOrder(@PathParam("id") Long id) {
        try {
            OrderResponseDTO updatedOrder = orderService.cancelOrder(id);
            return Response.ok(updatedOrder).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/{id}/cancel")
    public Response cancelOrderPost(@PathParam("id") Long id) {
        return cancelOrder(id);
    }
}
