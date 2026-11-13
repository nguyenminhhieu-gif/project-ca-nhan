package com.coffeeshop.repository;

import com.coffeeshop.entity.Booking;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class BookingRepository implements PanacheRepository<Booking> {

    public List<Booking> findByDateAndTimeSlot(LocalDate date, String timeSlot) {
        return list("bookingDate = ?1 and timeSlot = ?2 and status != 'CANCELLED'", date, timeSlot);
    }

    public List<Booking> findByUserId(Long userId) {
        return list("user.id = ?1 order by bookingDate desc, id desc", userId);
    }

    public List<Booking> findAllOrdered() {
        return list("order by bookingDate desc, id desc");
    }
}

