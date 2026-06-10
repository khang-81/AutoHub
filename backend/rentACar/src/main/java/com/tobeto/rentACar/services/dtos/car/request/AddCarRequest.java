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
    @Min(value = 2005, message = "Production year must be between 2005 and 2030!")
    @Max(value = 2030, message = "Production year must be between 2005 and 2030!")
    private short modelYear;

    /** Bắt buộc với RENT_ONLY; bằng 0 với SALE_ONLY. */
    private Float dailyPrice;

    /** RENT_ONLY | SALE_ONLY — mặc định RENT_ONLY nếu bỏ trống. */
    private String listingType;

    /** Bắt buộc với SALE_ONLY. */
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

    /** Số chỗ ngồi (UC Tìm kiếm xe thuê — lọc theo 4/7/9). */
    @Min(value = 2, message = "Số chỗ tối thiểu là 2")
    @Max(value = 16, message = "Số chỗ tối đa là 16")
    private Integer seats;

    /** AUTO | MANUAL — backend chuẩn hoá uppercase trước khi lưu. */
    private String transmission;

    /** GASOLINE | DIESEL | HYBRID | ELECTRIC */
    private String fuelType;

    /** Gallery chi tiết: 5 ảnh (3 EXTERIOR + 2 INTERIOR) — admin bắt buộc gửi đủ. */
    @Valid
    private List<CarImageRequest> images;

}
