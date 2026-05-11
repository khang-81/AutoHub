package com.tobeto.rentACar.entities.concretes;

import com.tobeto.rentACar.entities.abstracts.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Mã khuyến mãi áp dụng cho đơn thuê (RENT) hoặc đơn mua (SALE) hoặc cả hai (BOTH).
 *
 * Áp dụng theo logic snapshot: tại thời điểm tạo Rental/SaleOrder, hệ thống validate code,
 * tính discountAmount, lưu vào đơn rồi tăng usageCount. Không xóa Promotion sau khi hết
 * usageLimit — chỉ vô hiệu để có lịch sử.
 */
@Table(name = "promotions")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Promotion extends BaseEntity {

    /** Mã khuyến mãi (duy nhất, uppercase). VD: AUTUMN10, NEWUSER100K. */
    @Column(name = "code", length = 64, unique = true, nullable = false)
    private String code;

    @Column(name = "description", length = 255)
    private String description;

    /** PERCENT (giá trị 0-100) hoặc FIXED (số tiền VNĐ). */
    @Column(name = "discount_type", length = 16, nullable = false)
    private String discountType;

    @Column(name = "discount_value", nullable = false)
    private double discountValue;

    /** Áp dụng cho RENT | SALE | BOTH (so sánh case-insensitive). */
    @Column(name = "applies_to", length = 16, nullable = false)
    private String appliesTo;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    /** Số lần được phép áp dụng (null = không giới hạn). */
    @Column(name = "usage_limit")
    private Integer usageLimit;

    /** Số lần đã áp dụng. */
    @Column(name = "usage_count", nullable = false)
    @Builder.Default
    private int usageCount = 0;

    /** Trần giảm giá tuyệt đối (VNĐ) cho PERCENT (null = không trần). */
    @Column(name = "max_discount_amount")
    private Double maxDiscountAmount;

    /** Đơn tối thiểu (VNĐ) để áp được (null/0 = không yêu cầu). */
    @Column(name = "min_order_value")
    private Double minOrderValue;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;
}
