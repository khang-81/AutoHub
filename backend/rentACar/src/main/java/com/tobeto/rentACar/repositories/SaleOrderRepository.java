package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.SaleOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SaleOrderRepository extends JpaRepository<SaleOrder, Integer> {

    List<SaleOrder> findByUser_IdOrderByIdDesc(int userId);

    boolean existsByCar_IdAndOrderStatusIn(int carId, Iterable<String> statuses);

    @Query("select u.email from SaleOrder o join o.user u where o.id = :id")
    Optional<String> findUserEmailBySaleOrderId(@Param("id") int id);

    @Query("select count(o)>0 from SaleOrder o where o.user.id = :userId and o.orderStatus not in ('COMPLETED','CANCELLED')")
    boolean existsActiveByUserId(@Param("userId") int userId);

    @Query("select count(o)>0 from SaleOrder o where o.car.id = :carId and o.orderStatus not in ('COMPLETED','CANCELLED')")
    boolean existsActiveByCarId(@Param("carId") int carId);

    @Query("select count(o)>0 from SaleOrder o where o.car.model.brand.id = :brandId and o.orderStatus not in ('COMPLETED','CANCELLED')")
    boolean existsActiveByBrandId(@Param("brandId") int brandId);
}
