package com.tobeto.rentACar.entities.concretes;

import com.tobeto.rentACar.entities.abstracts.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * One review per completed rental or sale order.
 */
@Table(name = "reviews")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Review extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_id")
    private Rental rental;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_order_id")
    private SaleOrder saleOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "comment", length = 2000)
    private String comment;

    @Column(name = "admin_reply", length = 2000)
    private String adminReply;

    /** Ẩn khỏi trang công khai xe (admin); vẫn hiện trong quản trị. */
    @Column(name = "hidden_from_public", nullable = false)
    private Boolean hiddenFromPublic = false;
}
