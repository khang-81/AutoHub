package com.tobeto.rentACar.services.dtos.rental.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserReturnCarRequest {

    /** Nếu null: dùng ngày hiện tại */
    private LocalDate returnDate;

    @NotNull(message = "Vui lòng nhập số km đồng hồ khi trả xe")
    private Long endKilometer;
}
