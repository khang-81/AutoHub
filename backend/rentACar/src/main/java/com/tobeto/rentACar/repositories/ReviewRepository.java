package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {

    Optional<Review> findByRental_Id(int rentalId);

    boolean existsByRental_Id(int rentalId);

    @Query("select r from Review r join fetch r.user join fetch r.rental where r.rental.car.id = :carId order by r.createdDate desc")
    List<Review> findByCarIdOrderByCreatedDateDesc(@Param("carId") int carId);

    @Query("select r.rental.car.id, avg(r.rating), count(r) from Review r group by r.rental.car.id")
    List<Object[]> findAverageRatingStatsByCar();
}
