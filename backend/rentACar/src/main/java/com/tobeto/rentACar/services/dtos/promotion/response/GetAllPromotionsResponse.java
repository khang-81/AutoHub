package com.tobeto.rentACar.services.dtos.promotion.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetAllPromotionsResponse {
    private Integer id;
    private String code;
    private String description;
    private String discountType;
    private double discountValue;
    private String appliesTo;
    private LocalDate validFrom;
    private LocalDate validTo;
    private Integer usageLimit;
    private int usageCount;
    private Double maxDiscountAmount;
    private Double minOrderValue;
    private boolean active;
}
