package com.coffeeshop.service;

import com.coffeeshop.dto.CartRequest;
import com.coffeeshop.entity.CartItem;
import com.coffeeshop.entity.Product;
import com.coffeeshop.entity.User;
import com.coffeeshop.repository.CartRepository;
import com.coffeeshop.repository.ProductRepository;
import com.coffeeshop.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class CartService {

    @Inject
    CartRepository cartRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    ProductRepository productRepository;

    // =========================
    // ADD TO CART
    // =========================
    @Transactional
    public void addToCart(CartRequest req) {

        User user = userRepository.findById(req.userId);
        Product product = productRepository.findById(req.productId);

        if (user == null || product == null) {
            throw new RuntimeException("User or Product not found");
        }

        CartItem item = new CartItem();
        item.user = user;
        item.product = product;
        item.quantity = req.quantity;

        cartRepository.persist(item);
        cartRepository.flush(); // 🔥 THÊM DÒNG NÀY

    }

    // =========================
    // GET CART
    // =========================
    public List<CartItem> getCart(Long userId) {

        return cartRepository
                .find("select c from CartItem c "
                        + "join fetch c.product "
                        + "join fetch c.user "
                        + "where c.user.id = ?1", userId)
                .list();
    }
    // =========================
// UPDATE QUANTITY
// =========================

    @Transactional
    public void updateQuantity(Long cartId, CartRequest req) {

        CartItem item = cartRepository.findById(cartId);

        if (item == null) {
            throw new RuntimeException("Cart item not found");
        }

        item.quantity = req.quantity;

        cartRepository.persist(item);
    }

// =========================
// DELETE CART ITEM
// =========================
    @Transactional
    public void deleteCartItem(Long cartId) {

        cartRepository.deleteById(cartId);
    }
    public List<CartItem> getAll() {
    return cartRepository.listAll();
}
}
