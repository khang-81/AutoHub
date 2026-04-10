package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {

    Optional<Review> findByRental_Id(int rentalId);

    @Query("select r from Review r where r.rental.car.id = :carId")
    List<Review> findByCarId(@Param("carId") int carId);
}
