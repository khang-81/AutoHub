package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    List<Invoice> findByRentalUserId(Integer userId);

    @Query("SELECT i FROM Invoice i WHERE "
            + "(i.rental IS NOT NULL AND i.rental.user.id = :userId) OR "
            + "(i.saleOrder IS NOT NULL AND i.saleOrder.user.id = :userId)")
    List<Invoice> findAllByUserLinked(@Param("userId") int userId);
}
