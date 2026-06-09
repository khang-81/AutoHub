package com.tobeto.rentACar.services.dtos.car.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CarImageResponse {
    private String imageUrl;
    /** EXTERIOR | INTERIOR */
    private String imageType;
    private short sortOrder;
}
