package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.UserDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserDocumentRepository extends JpaRepository<UserDocument, Integer> {

    @Query("SELECT d FROM UserDocument d JOIN FETCH d.user WHERE d.user.id = :userId")
    List<UserDocument> findByUser_IdWithUser(@Param("userId") int userId);

    List<UserDocument> findByUser_Id(int userId);

    Optional<UserDocument> findByUser_IdAndDocumentType(int userId, String documentType);

    List<UserDocument> findByStatus(String status);

    /** JOIN FETCH user — tránh LazyInitializationException khi map DTO ngoài transaction. */
    @Query("SELECT d FROM UserDocument d JOIN FETCH d.user u WHERE d.status = :status")
    List<UserDocument> findByStatusWithUser(@Param("status") String status);
}
