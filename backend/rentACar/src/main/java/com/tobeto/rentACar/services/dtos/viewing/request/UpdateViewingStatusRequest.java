package com.tobeto.rentACar.services.dtos.viewing.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateViewingStatusRequest {

    @NotBlank
    @Pattern(regexp = "CONFIRMED|CANCELLED|COMPLETED|NO_SHOW", message = "Trạng thái không hợp lệ")
    private String status;

    @Size(max = 500)
    private String adminNote;
}
