package com.coffeeshop.repository;

import com.coffeeshop.entity.Payment;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PaymentRepository implements PanacheRepository<Payment> {

    public Payment findByOrderId(Long orderId) {
        return find("order.id = ?1", orderId).firstResult();
    }
}
