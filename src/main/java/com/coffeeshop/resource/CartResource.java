package com.coffeeshop.resource;

import com.coffeeshop.dto.CartRequest;
import com.coffeeshop.service.CartService;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/cart")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class CartResource {

    @Inject
    CartService cartService;

    // =========================
    // ADD TO CART
    // =========================
    @POST
    @Path("/add")
    public Response addToCart(CartRequest request) {

        cartService.addToCart(request);

        return Response.ok("Added").build();
    }

    // =========================
    // GET CART
    // =========================
    @GET
    @Path("/{userId}")
    public Response getCart(@PathParam("userId") Long userId) {

        return Response.ok(cartService.getCart(userId)).build();
    }
    // =========================
// UPDATE QUANTITY
// =========================

    @PUT
    @Path("/{cartId}")
    public Response updateQuantity(
            @PathParam("cartId") Long cartId,
            CartRequest request) {

        cartService.updateQuantity(cartId, request);

        return Response.ok("Updated").build();
    }

// =========================
// DELETE CART ITEM
// =========================
    @DELETE
    @Path("/{cartId}")
    public Response deleteCartItem(
            @PathParam("cartId") Long cartId) {

        cartService.deleteCartItem(cartId);

        return Response.ok("Deleted").build();
    }

    @GET
    @Path("/all")
    public Response getAllCart() {
        return Response.ok(cartService.getAll()).build();
    }
}
