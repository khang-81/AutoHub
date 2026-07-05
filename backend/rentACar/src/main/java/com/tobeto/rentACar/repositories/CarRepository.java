package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.Car;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CarRepository extends JpaRepository<Car, Integer>, JpaSpecificationExecutor<Car> {

    boolean existsCarByPlate(String plate);

    boolean existsByPlateAndIdNot(String plate, int id);

    /**
     * BUGFIX #4: pessimistic write lock để tránh race condition TOCTOU khi đặt thuê/mua xe.
     * Gọi method này TRƯỚC khi check availability; đảm bảo 2 transaction không thể vừa check
     * overlap vừa insert cùng lúc.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Car c WHERE c.id = :id")
    Optional<Car> findByIdForUpdate(@Param("id") int id);
}
