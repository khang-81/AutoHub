package com.tobeto.rentACar.services.dtos.promotion.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApplyPromotionResponse {
    /** Mã sau khi normalize (uppercase, trim). null khi backend không áp dụng. */
    private String code;
    private String description;
    private double orderAmount;
    private double discountAmount;
    private double finalAmount;
    private String message;
}
