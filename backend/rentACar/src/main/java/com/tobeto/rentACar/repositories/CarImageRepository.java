package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.CarImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarImageRepository extends JpaRepository<CarImage, Integer> {

    List<CarImage> findByCar_IdOrderBySortOrderAsc(int carId);

    void deleteByCar_Id(int carId);
}
