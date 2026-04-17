package com.tobeto.rentACar.services.dtos.viewing.response;

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
public class ViewingAppointmentResponse {

    private Integer id;
    private LocalDateTime scheduledAt;
    private String status;
    private String note;
    private String contactPhone;
    private String adminNote;
    private LocalDate createdDate;

    private GetCarByIdResponse car;
    private GetUserByIdResponse user;
}
