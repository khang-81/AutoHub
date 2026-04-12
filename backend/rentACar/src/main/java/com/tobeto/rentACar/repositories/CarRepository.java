package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CarRepository extends JpaRepository<Car, Integer>, JpaSpecificationExecutor<Car> {

    boolean existsCarByPlate(String plate);
}
