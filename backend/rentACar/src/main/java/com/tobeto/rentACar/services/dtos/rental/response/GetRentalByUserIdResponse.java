package com.tobeto.rentACar.services.dtos.rental.response;

import com.tobeto.rentACar.services.dtos.car.response.GetCarByIdResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetRentalByUserIdResponse {
    private int id;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate returnDate;
    private double totalPrice;
    private String paymentMethod;
    private String paymentStatus;
    private String rentalStatus;
    private GetCarByIdResponse car;
}
