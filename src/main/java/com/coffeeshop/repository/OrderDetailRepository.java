package com.coffeeshop.repository;

import com.coffeeshop.entity.OrderDetail;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class OrderDetailRepository implements PanacheRepository<OrderDetail> {

    public List<OrderDetail> findByOrderId(Long orderId) {
        return find("select d from OrderDetail d join fetch d.product where d.order.id = ?1", orderId).list();
    }
}