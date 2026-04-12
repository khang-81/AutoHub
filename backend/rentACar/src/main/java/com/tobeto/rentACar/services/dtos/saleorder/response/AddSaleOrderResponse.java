package com.tobeto.rentACar.services.dtos.saleorder.response;

import com.tobeto.rentACar.core.utilities.results.Result;
import lombok.Data;

@Data
public class AddSaleOrderResponse {
    private Integer id;
    private Result result;
}
