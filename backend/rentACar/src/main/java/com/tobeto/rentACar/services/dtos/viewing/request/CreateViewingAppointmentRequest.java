package com.tobeto.rentACar.services.dtos.viewing.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateViewingAppointmentRequest {

    @NotNull
    private Integer carId;

    @NotNull
    private LocalDateTime scheduledAt;

    @Size(max = 500)
    private String note;

    @Size(max = 32)
    private String contactPhone;
}
