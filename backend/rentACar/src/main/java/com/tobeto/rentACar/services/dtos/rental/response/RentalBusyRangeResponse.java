package com.tobeto.rentACar.services.dtos.rental.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Dữ liệu tối thiểu cho trang chi tiết xe (ẩn ngày đã có đơn) — không lộ PII.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentalBusyRangeResponse {

    private LocalDate startDate;
    private LocalDate endDate;
}
