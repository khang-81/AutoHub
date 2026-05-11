package com.tobeto.rentACar.services.dtos.promotion.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApplyPromotionRequest {

    @NotBlank(message = "Vui lòng nhập mã khuyến mãi.")
    private String code;

    /** RENT | SALE — backend dùng để filter promotion appliesTo. */
    @NotBlank
    @Pattern(regexp = "RENT|SALE", message = "scope phải là RENT hoặc SALE.")
    private String scope;

    @NotNull
    @PositiveOrZero(message = "amount phải >= 0.")
    private Double amount;
}
