package com.tobeto.rentACar.services.dtos.rental.response;

import com.tobeto.rentACar.services.dtos.car.response.GetCarByIdResponse;
import com.tobeto.rentACar.services.dtos.user.response.GetUserByIdResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetRentalByIdResponse {

    private Integer id;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate returnDate;

    private Long startKilometer;

    private Long endKilometer;

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
    private String cancelledBy;
    private String cancellationReason;
    private Double cancellationFeeAmount;
    private Double refundDepositAmount;

    private Double lateFeeAmount;
    private Double returnAdditionalFees;
    private Double balanceDueAtReturn;
    private Long allowedKilometers;
    private Integer expectedFuelLevel;
    private Integer actualFuelLevel;
    private Double overKmFee;
    private Double missingFuelFee;
    private String damageNotes;
    private String damagePhotoUrls;

    private GetCarByIdResponse car;

    private GetUserByIdResponse user;
}
