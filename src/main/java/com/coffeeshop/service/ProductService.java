/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.coffeeshop.service;

import com.coffeeshop.dto.ProductDTO;
import com.coffeeshop.entity.Product;
import com.coffeeshop.repository.ProductRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class ProductService {

    @Inject
    ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.listAll();
    }

    @Transactional
    public void createProduct(ProductDTO dto) {

        Product product = new Product();

        product.name = dto.name;
        product.category = dto.category;
        product.quantity = dto.quantity;
        product.price = dto.price;
        product.status = dto.status;
        product.image = dto.image;
        product.description = dto.description;
        product.createdDate = LocalDate.now();

        productRepository.persist(product);
    }

    public Product getProductById(Long id) {

        return productRepository.findById(id);
    }

    @Transactional
    public void updateProduct(Long id, ProductDTO dto) {

        Product product = productRepository.findById(id);

        if (product == null) {
            throw new RuntimeException("Product not found");
        }

        product.name = dto.name;
        product.category = dto.category;
        product.quantity = dto.quantity;
        product.price = dto.price;
        product.status = dto.status;
        product.image = dto.image;
        product.description = dto.description;
    }

    @Transactional
    public void deleteProduct(Long id) {

        productRepository.deleteById(id);
    }
}
