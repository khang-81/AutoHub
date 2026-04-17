package com.tobeto.rentACar.entities.concretes;

import com.tobeto.rentACar.entities.abstracts.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Table(name = "viewing_appointments")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class ViewingAppointment extends BaseEntity {

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    /** PENDING | CONFIRMED | CANCELLED | COMPLETED | NO_SHOW */
    @Column(name = "status", length = 32, nullable = false)
    private String status;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "contact_phone", length = 32)
    private String contactPhone;

    @Column(name = "admin_note", length = 500)
    private String adminNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
