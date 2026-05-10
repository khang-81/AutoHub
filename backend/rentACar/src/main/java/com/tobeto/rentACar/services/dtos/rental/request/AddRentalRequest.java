package com.tobeto.rentACar.services.dtos.rental.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

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

    /** Mã khuyến mãi (tuỳ chọn). */
    private String promotionCode;

    /**
     * Danh sách add-on stack được (vd: ["EXTRA_DRIVER", "ROADSIDE"]).
     * Khác với insuranceCode (single tier), khách có thể chọn nhiều add-on.
     */
    private List<String> addonCodes;

}
