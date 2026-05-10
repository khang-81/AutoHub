package com.tobeto.rentACar.entities.concretes;

import com.tobeto.rentACar.entities.abstracts.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Table(name = "sale_orders")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class SaleOrder extends BaseEntity {

    @Column(name = "total_price")
    private double totalPrice;

    @Column(name = "payment_method", length = 32)
    private String paymentMethod;

    @Column(name = "payment_status", length = 32)
    private String paymentStatus;

    @Column(name = "order_status", length = 32)
    private String orderStatus;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancelled_by", length = 16)
    private String cancelledBy;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    /** Mã khuyến mãi đã áp dụng (snapshot tại thời điểm tạo đơn). null = không dùng. */
    @Column(name = "promotion_code", length = 64)
    private String promotionCode;

    /** Số tiền giảm giá tuyệt đối (VNĐ) áp vào totalPrice. null = không có giảm. */
    @Column(name = "discount_amount")
    private Double discountAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id")
    private Car car;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "saleOrder")
    private List<Invoice> invoices;
}
