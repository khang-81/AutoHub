package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Integer> {


    List<Rental> findByUserId(int userId);

    @Query("select case when count(r)>0 then true else false end from Rental r " +
            "where r.car.id = :carId and r.startDate <= :endDate and r.endDate >= :startDate " +
            "and (r.rentalStatus is null or (r.rentalStatus <> 'COMPLETED' and r.rentalStatus <> 'CANCELLED'))")
    boolean existsActiveOverlap(@Param("carId") int carId,
                                @Param("startDate") java.time.LocalDate startDate,
                                @Param("endDate") java.time.LocalDate endDate);
}
