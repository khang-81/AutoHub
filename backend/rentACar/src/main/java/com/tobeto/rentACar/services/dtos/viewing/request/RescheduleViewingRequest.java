package com.tobeto.rentACar.services.dtos.viewing.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RescheduleViewingRequest {

    @NotNull
    private LocalDateTime scheduledAt;
}
