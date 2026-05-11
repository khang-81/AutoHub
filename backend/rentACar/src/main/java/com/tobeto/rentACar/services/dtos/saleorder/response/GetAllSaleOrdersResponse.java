package com.tobeto.rentACar.services.dtos.saleorder.response;

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
public class GetAllSaleOrdersResponse {

    private Integer id;

    /** Ngày tạo đơn (BaseEntity) — dùng cho báo cáo theo tháng */
    private LocalDate createdDate;
    private double totalPrice;
    private String paymentMethod;
    private String paymentStatus;
    private String orderStatus;
    private LocalDateTime cancelledAt;
    private String cancelledBy;
    private String cancellationReason;
    private Boolean hasReview;

    private GetCarByIdResponse car;
    private GetUserByIdResponse user;
}
