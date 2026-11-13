package com.coffeeshop.repository;

import com.coffeeshop.entity.Order;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class OrderRepository implements PanacheRepository<Order> {

    public List<Order> findByUserId(Long userId) {
        return find("user.id = ?1 order by createdAt desc", userId).list();
    }

    public List<Order> listAllSorted() {
        return find("order by createdAt desc").list();
    }
}
