package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.CorporateCustomer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CorporateCustomerRepository extends JpaRepository<CorporateCustomer, Integer> {
	boolean existsCorporateCustomerByTaxNo(String taxNo);

	java.util.Optional<CorporateCustomer> findFirstByUserIdOrderByIdDesc(Integer userId);

}
