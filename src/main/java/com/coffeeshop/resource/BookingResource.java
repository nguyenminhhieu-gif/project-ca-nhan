package com.coffeeshop.resource;

import com.coffeeshop.dto.BookingDTO;
import com.coffeeshop.service.BookingService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Map;

@Path("/bookings")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class BookingResource {

    @Inject
    BookingService bookingService;

    // ── POST /bookings ──────────────────────────────────────────────────────
    // Create a new booking. Optional query param ?userId=<id> to link a user.
    @POST
    public Response createBooking(
            BookingDTO request,
            @QueryParam("userId") Long userId) {
        try {
            BookingDTO result = bookingService.createBooking(request, userId);
            return Response.status(Response.Status.CREATED).entity(result).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage())).build();
        }
    }

    // ── GET /bookings/occupied?date=YYYY-MM-DD&timeSlot=... ─────────────────
    // Returns list of table numbers already booked for that date + time slot.
    @GET
    @Path("/occupied")
    public Response getOccupied(
            @QueryParam("date") String date,
            @QueryParam("timeSlot") String timeSlot) {
        try {
            if (date == null || date.isBlank() || timeSlot == null || timeSlot.isBlank()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "date and timeSlot query params are required")).build();
            }
            List<String> occupied = bookingService.getOccupiedTables(date, timeSlot);
            return Response.ok(occupied).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage())).build();
        }
    }

    // ── GET /bookings/user/{userId} ─────────────────────────────────────────
    @GET
    @Path("/user/{userId}")
    public Response getBookingsByUser(@PathParam("userId") Long userId) {
        try {
            List<BookingDTO> bookings = bookingService.getBookingsByUser(userId);
            return Response.ok(bookings).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage())).build();
        }
    }

    // ── GET /bookings (admin: all bookings) ─────────────────────────────────
    @GET
    public Response getAllBookings() {
        try {
            List<BookingDTO> bookings = bookingService.getAllBookings();
            return Response.ok(bookings).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage())).build();
        }
    }

    // ── PUT /bookings/{id}/cancel ───────────────────────────────────────────
    @PUT
    @Path("/{id}/cancel")
    public Response cancelBooking(@PathParam("id") Long id) {
        try {
            BookingDTO result = bookingService.cancelBooking(id);
            return Response.ok(result).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage())).build();
        }
    }
}
