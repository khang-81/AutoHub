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

    boolean existsBySaleOrder_Id(int saleOrderId);

    @Query("""
            select r from Review r
            join fetch r.user
            left join fetch r.rental rr
            left join fetch r.saleOrder so
            where ((rr is not null and rr.car.id = :carId)
               or (so is not null and so.car.id = :carId))
              and r.rating >= :minRating
            order by r.createdDate desc
            """)
    List<Review> findByCarIdAndMinRating(@Param("carId") int carId, @Param("minRating") int minRating);

    @Query("""
            select r from Review r
            join fetch r.user
            left join fetch r.rental rr
            left join fetch r.saleOrder so
            where (rr is not null and rr.car.id = :carId)
               or (so is not null and so.car.id = :carId)
            order by r.createdDate desc
            """)
    List<Review> findByCarIdOrderByCreatedDateDesc(@Param("carId") int carId);

    @Query("""
            select r from Review r
            join fetch r.user
            left join fetch r.rental rr
            left join fetch r.saleOrder so
            order by r.id desc
            """)
    List<Review> findAllWithRefsOrderByIdDesc();

    @Query("""
            select coalesce(rr.car.id, so.car.id), avg(r.rating), count(r)
            from Review r
            left join r.rental rr
            left join r.saleOrder so
            group by coalesce(rr.car.id, so.car.id)
            """)
    List<Object[]> findAverageRatingStatsByCar();
}
