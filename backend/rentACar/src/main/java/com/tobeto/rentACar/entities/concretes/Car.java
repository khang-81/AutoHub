package com.tobeto.rentACar.entities.concretes;


import com.tobeto.rentACar.entities.abstracts.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Table(name = "cars")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Car extends BaseEntity {

    @Column(name="model_year")
    private short modelYear;

    /** Dịch vụ tại một thành phố (đồ án: Hà Nội) */
    @Column(name = "service_city", length = 128)
    private String serviceCity;

    @Column(name="plate")
    private String plate;

    @Column(name="min_findeks_rate")
    private short minFindeksRate;

    @Column(name="kilometer")
    private Long kilometer;

    @Column(name="daily_price")
    private Float dailyPrice;

    /** RENT_ONLY | SALE_ONLY */
    @Column(name = "listing_type", length = 16)
    private String listingType;

    /** Giá bán (áp dụng SALE_ONLY) */
    @Column(name = "sale_price")
    private Float salePrice;

    /** AVAILABLE | RESERVED | SOLD — khi có niêm yết bán */
    @Column(name = "sale_status", length = 16)
    private String saleStatus;

    @Column(name="image_path")
    private String imagePath;

    /**
     * Optimistic lock — chống race condition khi 2 khách cùng bấm "Mua ngay" trên cùng 1 xe.
     * Khi update saleStatus từ AVAILABLE → RESERVED, JPA sinh WHERE version=? — tab thua sẽ ném
     * OptimisticLockingFailureException để service map sang thông báo "Xe đã được người khác đặt".
     */
    @Version
    @Column(name = "version", nullable = false)
    private long version;

    /** Số chỗ ngồi (UC Tìm kiếm xe thuê — lọc 4/7/9 chỗ). */
    @Column(name = "seats")
    private Integer seats;

    /** AUTO | MANUAL — phân loại hộp số. */
    @Column(name = "transmission", length = 16)
    private String transmission;

    /** GASOLINE | DIESEL | HYBRID | ELECTRIC */
    @Column(name = "fuel_type", length = 16)
    private String fuelType;

    @Column(name = "average_rating")
    private Double averageRating;

    @Column(name = "review_count", nullable = false)
    private int reviewCount;

    @ManyToOne()
    @JoinColumn(name="model_id")
    private Model model;

    @ManyToOne
    @JoinColumn(name="color_id")
    private Color color;

    @OneToMany(mappedBy = "car")
    private List<Rental> rentals;

    @OneToMany(mappedBy = "car")
    private List<SaleOrder> saleOrders;

}
