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

    /**
     * Lấy tất cả rentals active của 1 xe (chưa COMPLETED/CANCELLED) để check overlap ở service.
     * Service sẽ filter overlap dựa trên (date, time) tuples ở Java — tránh phức tạp SQL
     * vì SQL Server + JPA không CAST date+time trực tiếp tốt.
     */
    @Query("select r from Rental r " +
            "where r.car.id = :carId " +
            "and (r.rentalStatus is null or (r.rentalStatus <> 'COMPLETED' and r.rentalStatus <> 'CANCELLED'))")
    java.util.List<Rental> findActiveByCarId(@Param("carId") int carId);

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
