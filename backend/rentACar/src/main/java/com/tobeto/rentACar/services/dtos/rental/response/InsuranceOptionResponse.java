package com.tobeto.rentACar.services.dtos.rental.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InsuranceOptionResponse {
    private String code;
    private String name;
    private double feePerDay;
}
