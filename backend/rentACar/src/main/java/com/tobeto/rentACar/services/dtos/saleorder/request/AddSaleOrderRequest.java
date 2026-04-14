package com.tobeto.rentACar.services.dtos.saleorder.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddSaleOrderRequest {

    @NotNull
    private Integer carId;

    @NotNull
    @Pattern(regexp = "CASH|BANK_TRANSFER", message = "Invalid payment method")
    private String paymentMethod;
}
