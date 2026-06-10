package com.tobeto.rentACar.services.dtos.car.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateCarRequest {
    @NotNull
    @Positive(message = "The value cannot be negative!")
    private int id;

    @NotNull
    @Positive(message = "The value cannot be negative!")
    private Long kilometer;

    @NotBlank
    @Length(max = 10)
    @Pattern(regexp = "^[0-9A-Z\\s-]*$",
            message = "Only include numbers or capital letters, special characters not allowed")
    private String plate;

    @NotNull
    @Min(value = 2005, message = "Production year must be between 2005 and 2030!")
    @Max(value = 2030, message = "Production year must be between 2005 and 2030!")
    private short modelYear;

    private Float dailyPrice;

    private String listingType;

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

    @Min(value = 2, message = "Số chỗ tối thiểu là 2")
    @Max(value = 16, message = "Số chỗ tối đa là 16")
    private Integer seats;

    private String transmission;

    private String fuelType;

    @Valid
    private List<CarImageRequest> images;

}
