package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RentalRepository extends JpaRepository<Rental, Integer> {

    List<Rental> findByUserId(int userId);

    /** JOIN FETCH tránh LazyInitialization / N+1 khi map sang DTO (lịch sử user sau admin xác nhận). */
    @Query("SELECT DISTINCT r FROM Rental r "
            + "JOIN FETCH r.car c "
            + "JOIN FETCH c.model m "
            + "JOIN FETCH m.brand "
            + "LEFT JOIN FETCH c.color "
            + "WHERE r.user.id = :userId")
    List<Rental> findAllForUserHistoryWithCarGraph(@Param("userId") int userId);

    @Query("select case when count(r)>0 then true else false end from Rental r " +
            "where r.car.id = :carId and r.startDate <= :endDate and r.endDate >= :startDate " +
            "and (r.rentalStatus is null or (r.rentalStatus <> 'COMPLETED' and r.rentalStatus <> 'CANCELLED'))")
    boolean existsActiveOverlap(@Param("carId") int carId,
                                @Param("startDate") java.time.LocalDate startDate,
                                @Param("endDate") java.time.LocalDate endDate);

    @Query("select u.email from Rental r join r.user u where r.id = :id")
    Optional<String> findUserEmailByRentalId(@Param("id") int id);

    @Query("select count(r)>0 from Rental r where r.user.id = :userId and (r.rentalStatus is null or r.rentalStatus not in ('COMPLETED','CANCELLED'))")
    boolean existsActiveByUserId(@Param("userId") int userId);

    @Query("select count(r)>0 from Rental r where r.car.id = :carId and (r.rentalStatus is null or r.rentalStatus not in ('COMPLETED','CANCELLED'))")
    boolean existsActiveByCarId(@Param("carId") int carId);

    @Query("select count(r)>0 from Rental r where r.car.model.brand.id = :brandId and (r.rentalStatus is null or r.rentalStatus not in ('COMPLETED','CANCELLED'))")
    boolean existsActiveByBrandId(@Param("brandId") int brandId);

    /**
     * Khớp logic hiển thị lịch bận trên CarDetail: đơn chưa trả xe, không hoàn tất/hủy.
     */
    @Query("SELECT r FROM Rental r WHERE r.car.id = :carId "
            + "AND r.returnDate IS NULL "
            + "AND (r.rentalStatus IS NULL OR (r.rentalStatus <> 'COMPLETED' AND r.rentalStatus <> 'CANCELLED')) "
            + "AND r.startDate IS NOT NULL AND r.endDate IS NOT NULL")
    List<Rental> findBlockingRentalsForPublicCalendar(@Param("carId") int carId);
}
