package com.coffeeshop.service;

import com.coffeeshop.dto.BookingDTO;
import com.coffeeshop.entity.Booking;
import com.coffeeshop.entity.User;
import com.coffeeshop.repository.BookingRepository;
import com.coffeeshop.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class BookingService {

    @Inject
    BookingRepository bookingRepository;

    @Inject
    UserRepository userRepository;

    // Price per session (VND)
    private static final double PRICE_INDIVIDUAL   = 50_000.0;
    private static final double PRICE_WINDOW       = 80_000.0;
    private static final double PRICE_GROUP        = 150_000.0;

    private double calculatePrice(String tableType, Integer seatsCount) {
        double base;
        if (tableType == null) {
            base = PRICE_INDIVIDUAL;
        } else {
            switch (tableType.toUpperCase()) {
                case "WINDOW":        base = PRICE_WINDOW; break;
                case "GROUP_MEETING": base = PRICE_GROUP;  break;
                default:              base = PRICE_INDIVIDUAL; break;
            }
        }
        int seats = (seatsCount != null && seatsCount > 0) ? seatsCount : 1;
        return base * seats;
    }

    @Transactional
    public BookingDTO createBooking(BookingDTO request, Long userId) {
        Booking booking = new Booking();

        // Link user if logged in
        if (userId != null) {
            User user = userRepository.findById(userId);
            if (user != null) {
                booking.user = user;
                // Auto-fill name/phone from user if not provided
                if (request.customerName == null || request.customerName.isBlank()) {
                    booking.customerName = user.fullName != null ? user.fullName : user.username;
                } else {
                    booking.customerName = request.customerName;
                }
                if (request.customerPhone == null || request.customerPhone.isBlank()) {
                    booking.customerPhone = user.phone != null ? user.phone : "";
                } else {
                    booking.customerPhone = request.customerPhone;
                }
            } else {
                booking.customerName  = request.customerName;
                booking.customerPhone = request.customerPhone;
            }
        } else {
            booking.customerName  = request.customerName;
            booking.customerPhone = request.customerPhone;
        }

        booking.tableNumber  = request.tableNumber;
        booking.tableType    = request.tableType;
        booking.bookingDate  = request.bookingDate;
        booking.timeSlot     = request.timeSlot;
        booking.seatsCount   = (request.seatsCount != null && request.seatsCount > 0) ? request.seatsCount : 1;
        booking.drinkNote    = request.drinkNote;
        booking.totalPrice   = calculatePrice(request.tableType, booking.seatsCount);
        booking.status       = "CONFIRMED";

        bookingRepository.persist(booking);
        return toDTO(booking);
    }

    public List<String> getOccupiedTables(String dateStr, String timeSlot) {
        LocalDate date = LocalDate.parse(dateStr);
        return bookingRepository.findByDateAndTimeSlot(date, timeSlot)
                .stream()
                .map(b -> b.tableNumber)
                .distinct()
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAllOrdered()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingDTO cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id);
        if (booking == null) {
            throw new RuntimeException("Booking not found: " + id);
        }
        if ("CANCELLED".equals(booking.status)) {
            throw new RuntimeException("Booking is already cancelled");
        }
        if ("COMPLETED".equals(booking.status)) {
            throw new RuntimeException("Cannot cancel a completed booking");
        }
        booking.status = "CANCELLED";
        return toDTO(booking);
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private BookingDTO toDTO(Booking b) {
        BookingDTO dto = new BookingDTO();
        dto.id            = b.id;
        dto.userId        = (b.user != null) ? b.user.id : null;
        dto.customerName  = b.customerName;
        dto.customerPhone = b.customerPhone;
        dto.tableNumber   = b.tableNumber;
        dto.tableType     = b.tableType;
        dto.bookingDate   = b.bookingDate;
        dto.timeSlot      = b.timeSlot;
        dto.seatsCount    = b.seatsCount;
        dto.drinkNote     = b.drinkNote;
        dto.totalPrice    = b.totalPrice;
        dto.status        = b.status;
        dto.createdDate   = b.createdDate;
        return dto;
    }
}
