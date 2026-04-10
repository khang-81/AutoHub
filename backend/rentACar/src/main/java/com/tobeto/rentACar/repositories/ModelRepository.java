package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.Model;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ModelRepository extends JpaRepository<Model, Integer> {

    boolean existsByName(String name);

    Optional<Model> findByNameAndBrand_Id(String name, Integer brandId);
}
