package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.ViewingAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ViewingAppointmentRepository extends JpaRepository<ViewingAppointment, Integer> {

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
