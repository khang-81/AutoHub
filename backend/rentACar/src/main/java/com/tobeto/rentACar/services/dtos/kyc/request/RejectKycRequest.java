package com.tobeto.rentACar.services.dtos.kyc.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RejectKycRequest {
    private String adminNote;
}
