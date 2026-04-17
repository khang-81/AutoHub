package com.tobeto.rentACar.services.dtos.car.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PagedCarsResponse {

    private List<GetAllCarsResponse> content;
    private long totalElements;
    private int totalPages;
    /** Trang hiện tại (bắt đầu từ 1) */
    private int page;
    private int size;
}
