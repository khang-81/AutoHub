package com.tobeto.rentACar.services.dtos.promotion.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AddPromotionRequest {

    @NotBlank(message = "Mã khuyến mãi không được trống.")
    private String code;

    private String description;

    @NotBlank
    @Pattern(regexp = "PERCENT|FIXED", message = "discountType phải là PERCENT hoặc FIXED.")
    private String discountType;

    @NotNull
    @Positive(message = "discountValue phải lớn hơn 0.")
    private Double discountValue;

    @NotBlank
    @Pattern(regexp = "RENT|SALE|BOTH", message = "appliesTo phải là RENT, SALE hoặc BOTH.")
    private String appliesTo;

    private LocalDate validFrom;
    private LocalDate validTo;
    private Integer usageLimit;
    private Double maxDiscountAmount;
    private Double minOrderValue;
    private Boolean active;
}
