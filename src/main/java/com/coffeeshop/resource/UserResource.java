package com.coffeeshop.resource;

import com.coffeeshop.entity.User;
import com.coffeeshop.repository.UserRepository;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject
    UserRepository userRepository;

    @GET
    public List<User> getAllUsers() {
        return userRepository.listAll();
    }

    @GET
    @Path("/{id}")
    public Response getUserById(@PathParam("id") Long id) {
        User user = userRepository.findById(id);
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("message", "Không tìm thấy người dùng với ID: " + id))
                    .build();
        }
        return Response.ok(user).build();
    }

    @GET
    @Path("/{id}/points")
    public Response getUserPoints(@PathParam("id") Long id) {
        User user = userRepository.findById(id);
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("message", "Không tìm thấy người dùng với ID: " + id))
                    .build();
        }
        int points = user.points != null ? user.points : 0;
        return Response.ok(Map.of(
                "userId", id,
                "points", points
        )).build();
    }

    @GET
    @Path("/points/{id}")
    public Response getUserPointsAlias(@PathParam("id") Long id) {
        return getUserPoints(id);
    }
}
