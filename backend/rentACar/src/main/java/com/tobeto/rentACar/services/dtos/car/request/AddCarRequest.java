package com.tobeto.rentACar.services.dtos.car.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddCarRequest {
    @NotNull
    @Positive(message = "The value cannot be negative!")
    private Long kilometer;

    @NotBlank
    @Length(max = 10)
    @Pattern(regexp = "^[0-9A-Z\\s-]*$",
            message = "Only include numbers or capital letters, special characters not allowed")
    private String plate;

    @NotNull
    @Min(value = 2005, message = "Production year must be between 2005 to 2024!")
    @Max(value = 2024, message = "Production year must be between 2005 to 2024!")
    private short modelYear;

    /** Bắt buộc với RENT_ONLY và BOTH; có thể 0 với SALE_ONLY. */
    private Float dailyPrice;

    /** RENT_ONLY | SALE_ONLY | BOTH — mặc định RENT_ONLY nếu bỏ trống. */
    private String listingType;

    /** Bắt buộc với SALE_ONLY và BOTH. */
    private Float salePrice;

    @NotNull
    @Positive(message = "The value cannot be negative!")
    private int modelId;

    @NotNull
    @Positive(message = "The value cannot be negative!")
    private int colorId;

    @NotNull
    private short minFindeksRate;

    @NotBlank
    private String imagePath;

}
