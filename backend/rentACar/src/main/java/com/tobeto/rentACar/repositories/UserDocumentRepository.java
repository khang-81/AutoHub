package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.UserDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserDocumentRepository extends JpaRepository<UserDocument, Integer> {

    List<UserDocument> findByUser_Id(int userId);

    Optional<UserDocument> findByUser_IdAndDocumentType(int userId, String documentType);

    List<UserDocument> findByStatus(String status);
}
