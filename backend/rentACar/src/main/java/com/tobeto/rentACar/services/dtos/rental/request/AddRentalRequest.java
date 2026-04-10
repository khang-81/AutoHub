package com.tobeto.rentACar.services.dtos.rental.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddRentalRequest {

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotNull
    @Positive(message = "The assigned value must not assume a negative numerical value!")
    private int carId;

    @NotNull
    @Positive(message = "The assigned value must not assume a negative numerical value!")
    private int userId;

    @NotNull
    @Pattern(regexp = "CASH|BANK_TRANSFER", message = "Invalid payment method")
    private String paymentMethod;

    /** NONE | BASIC | STANDARD | PREMIUM — bỏ trống = NONE */
    private String insuranceCode;

    /** Phụ phí giao xe / khác (VNĐ), mặc định 0 */
    private Double extraFeesAmount;

    /** Quận nhận xe (Hà Nội) */
    private String pickupDistrict;

}
