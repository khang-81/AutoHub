package com.tobeto.rentACar.services.dtos.saleorder.response;

import com.tobeto.rentACar.services.dtos.car.response.GetCarByIdResponse;
import com.tobeto.rentACar.services.dtos.user.response.GetUserByIdResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetAllSaleOrdersResponse {

    private Integer id;
    private double totalPrice;
    private String paymentMethod;
    private String paymentStatus;
    private String orderStatus;
    private LocalDateTime cancelledAt;
    private String cancelledBy;
    private String cancellationReason;

    private GetCarByIdResponse car;
    private GetUserByIdResponse user;
}
