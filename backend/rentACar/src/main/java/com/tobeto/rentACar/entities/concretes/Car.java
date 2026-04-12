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

    /** RENT_ONLY | SALE_ONLY | BOTH */
    @Column(name = "listing_type", length = 16)
    private String listingType;

    /** Giá bán (áp dụng SALE_ONLY hoặc BOTH) */
    @Column(name = "sale_price")
    private Float salePrice;

    /** AVAILABLE | RESERVED | SOLD — khi có niêm yết bán */
    @Column(name = "sale_status", length = 16)
    private String saleStatus;

    @Column(name="image_path")
    private String imagePath;

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
