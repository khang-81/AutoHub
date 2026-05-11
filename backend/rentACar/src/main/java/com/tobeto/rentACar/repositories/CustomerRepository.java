package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Optional<Customer> findFirstByUserIdOrderByIdDesc(Integer userId);
}
