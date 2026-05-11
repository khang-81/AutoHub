package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.ViewingAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ViewingAppointmentRepository extends JpaRepository<ViewingAppointment, Integer> {

    /** Đếm lịch hẹn trong khung giờ [from, to) chưa bị huỷ — dùng để kiểm tra slot kín. */
    @Query("SELECT COUNT(v) FROM ViewingAppointment v WHERE v.scheduledAt >= :from AND v.scheduledAt < :to AND v.status NOT IN ('CANCELLED','NO_SHOW')")
    long countActiveInSlot(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /** Lấy tất cả lịch hẹn active trong 1 ngày — dùng cho endpoint availability. */
    @Query("SELECT v FROM ViewingAppointment v WHERE CAST(v.scheduledAt AS date) = :date AND v.status NOT IN ('CANCELLED','NO_SHOW')")
    List<ViewingAppointment> findActiveByDate(@Param("date") LocalDate date);

    @Query("""
            SELECT v FROM ViewingAppointment v
            JOIN FETCH v.car c
            JOIN FETCH c.model m
            JOIN FETCH m.brand
            JOIN FETCH c.color
            JOIN FETCH v.user u
            ORDER BY v.scheduledAt DESC
            """)
    List<ViewingAppointment> findAllWithRelations();

    @Query("""
            SELECT v FROM ViewingAppointment v
            JOIN FETCH v.car c
            JOIN FETCH c.model m
            JOIN FETCH m.brand
            JOIN FETCH c.color
            JOIN FETCH v.user u
            WHERE u.id = :userId
            ORDER BY v.scheduledAt DESC
            """)
    List<ViewingAppointment> findByUserIdWithRelations(@Param("userId") int userId);

    @Query("""
            SELECT v FROM ViewingAppointment v
            JOIN FETCH v.car c
            JOIN FETCH c.model m
            JOIN FETCH m.brand
            JOIN FETCH c.color
            JOIN FETCH v.user u
            WHERE v.id = :id
            """)
    Optional<ViewingAppointment> findByIdWithRelations(@Param("id") int id);

    long countByUser_IdAndCar_IdAndStatus(int userId, int carId, String status);
}
