package com.tobeto.rentACar.services.dtos.car.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CarImageRequest {

    @NotBlank
    private String imageUrl;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer sortOrder;

    @NotBlank
    @Pattern(regexp = "^(?i)(EXTERIOR|INTERIOR)$", message = "imageType phải là EXTERIOR hoặc INTERIOR")
    private String imageType;
}
