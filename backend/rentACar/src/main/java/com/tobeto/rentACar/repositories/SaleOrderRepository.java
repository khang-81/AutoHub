package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.SaleOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SaleOrderRepository extends JpaRepository<SaleOrder, Integer> {

    List<SaleOrder> findByUser_IdOrderByIdDesc(int userId);

    boolean existsByCar_IdAndOrderStatusIn(int carId, Iterable<String> statuses);
}
