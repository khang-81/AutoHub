package com.tobeto.rentACar.services.dtos.review.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminReplyRequest {

    @NotBlank
    @Size(max = 2000)
    private String reply;
}
