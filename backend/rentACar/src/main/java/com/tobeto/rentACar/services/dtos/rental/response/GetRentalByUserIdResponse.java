package com.tobeto.rentACar.services.dtos.rental.response;

import com.tobeto.rentACar.services.dtos.car.response.GetCarByIdResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
    private Double depositAmount;
    private String depositStatus;
    private String insuranceCode;
    private Double insuranceFeeAmount;
    private Double extraFeesAmount;
    private String pickupDistrict;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private Double refundDepositAmount;
    private Double cancellationFeeAmount;
    private GetCarByIdResponse car;
}
