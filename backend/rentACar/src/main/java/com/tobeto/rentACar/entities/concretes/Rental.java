package com.tobeto.rentACar.entities.concretes;


import com.tobeto.rentACar.entities.abstracts.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Table(name = "rentals")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Rental extends BaseEntity {

    @Column(name="start_date")
    private LocalDate startDate;

    @Column(name="end_date")
    private LocalDate endDate;

    @Column(name="return_date")
    private LocalDate returnDate;

    @Column(name="start_kilometer")
    private Long startKilometer;

    @Column(name="end_kilometer")
    private Long endKilometer;

    @Column(name = "total_price")
    private double totalPrice;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "rental_status")
    private String rentalStatus;

    /** Tiền cọc (snapshot khi tạo đơn) */
    @Column(name = "deposit_amount")
    private Double depositAmount;

    /** PENDING | HELD | REFUNDED | FORFEITED */
    @Column(name = "deposit_status", length = 32)
    private String depositStatus;

    /** Mã gói bảo hiểm chọn khi đặt (vd BASIC, PREMIUM) — snapshot */
    @Column(name = "insurance_code", length = 64)
    private String insuranceCode;

    @Column(name = "insurance_fee_amount")
    private Double insuranceFeeAmount;

    /** Phụ phí giao xe / vượt km / khác — snapshot */
    @Column(name = "extra_fees_amount")
    private Double extraFeesAmount;

    /** Quận/huyện nhận xe (Hà Nội) */
    @Column(name = "pickup_district", length = 128)
    private String pickupDistrict;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    /** USER | ADMIN */
    @Column(name = "cancelled_by", length = 16)
    private String cancelledBy;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Column(name = "cancellation_fee_amount")
    private Double cancellationFeeAmount;

    @Column(name = "refund_deposit_amount")
    private Double refundDepositAmount;

    @ManyToOne()
    @JoinColumn(name="car_id")
    private Car car;

    @ManyToOne()
    @JoinColumn(name="user_id")
    private User user;

    @OneToMany(mappedBy = "rental")
    List<Invoice> invoices;
}
