package com.coffeeshop.resource;

import com.coffeeshop.dto.ProductDTO;
import com.coffeeshop.entity.Product;
import com.coffeeshop.service.DataInitializer;
import com.coffeeshop.service.ProductService;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/products")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ProductResource {

    @Inject
    ProductService productService;

    @Inject
    DataInitializer dataInitializer;

    @GET
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GET
    @Path("/seed")
    public String seedProductsGet() {
        dataInitializer.seedProducts();
        return "Seed products success";
    }

    @POST
    @Path("/seed")
    public String seedProductsPost() {
        dataInitializer.seedProducts();
        return "Seed products success";
    }

    @POST
    @Transactional
    public String createProduct(ProductDTO dto) {
        productService.createProduct(dto);
        return "Create product success";
    }

    @GET
    @Path("/{id}")
    public Product getProductById(@PathParam("id") Long id) {
        return productService.getProductById(id);
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public String updateProduct(
            @PathParam("id") Long id,
            ProductDTO dto
    ) {
        productService.updateProduct(id, dto);
        return "Update product success";
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public String deleteProduct(@PathParam("id") Long id) {
        productService.deleteProduct(id);
        return "Delete product success";
    }

    @GET
    @Path("/test")
    public String test() {
        return "OK";
    }
}
