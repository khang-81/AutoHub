package com.tobeto.rentACar.services.dtos.rental.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CancelRentalRequest {
    private String reason;
}
