package com.tobeto.rentACar.entities.concretes;

import com.tobeto.rentACar.entities.abstracts.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * GPLX / CCCD uploads for KYC. Status is updated by admin after review.
 */
@Table(name = "user_documents", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_document_type", columnNames = { "user_id", "document_type" })
})
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class UserDocument extends BaseEntity {

    /** CCCD | GPLX */
    @Column(name = "document_type", nullable = false, length = 32)
    private String documentType;

    /** Stored path or URL after upload */
    @Column(name = "file_path", nullable = false, length = 1024)
    private String filePath;

    /** PENDING | APPROVED | REJECTED */
    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "admin_note", length = 500)
    private String adminNote;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
