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

    /**
     * Danh sách add-on stack được (CSV: EXTRA_DRIVER,ROADSIDE,…) — snapshot.
     * Khác với insuranceCode (tier), nhiều mã add-on có thể được chọn cùng lúc.
     */
    @Column(name = "addon_codes", length = 256)
    private String addonCodes;

    /** Tổng phí add-on đã tính vào totalPrice (snapshot). */
    @Column(name = "addon_fee_amount")
    private Double addonFeeAmount;

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

    /** Phí nộp xe trễ (snapshot khi khách trả xe) */
    @Column(name = "late_fee_amount")
    private Double lateFeeAmount;

    /** Phí phát sinh khi trả (xăng, vệ sinh, vượt km… — nhập khi trả) */
    @Column(name = "return_additional_fees")
    private Double returnAdditionalFees;

    /** Số tiền còn phải thu sau khi trừ cọc + cộng phí trễ & phát sinh (snapshot) */
    @Column(name = "balance_due_at_return")
    private Double balanceDueAtReturn;

    /** Mã khuyến mãi đã áp tại lúc tạo đơn (snapshot). null = không dùng. */
    @Column(name = "promotion_code", length = 64)
    private String promotionCode;

    /** Số tiền giảm giá (VNĐ) đã áp vào totalPrice. null = 0. */
    @Column(name = "discount_amount")
    private Double discountAmount;

    @ManyToOne()
    @JoinColumn(name="car_id")
    private Car car;

    @ManyToOne()
    @JoinColumn(name="user_id")
    private User user;

    @OneToMany(mappedBy = "rental")
    List<Invoice> invoices;
}
