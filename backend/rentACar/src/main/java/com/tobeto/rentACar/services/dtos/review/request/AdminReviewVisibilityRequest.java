package com.tobeto.rentACar.services.dtos.review.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminReviewVisibilityRequest {
    @NotNull
    private Boolean hidden;
}
