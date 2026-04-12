package com.tobeto.rentACar.services.abstracts;

import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.services.dtos.saleorder.request.AddSaleOrderRequest;
import com.tobeto.rentACar.services.dtos.saleorder.response.AddSaleOrderResponse;
import com.tobeto.rentACar.services.dtos.saleorder.response.GetAllSaleOrdersResponse;

import java.util.List;

public interface SaleOrderService {

    AddSaleOrderResponse add(AddSaleOrderRequest request, int userId);

    List<GetAllSaleOrdersResponse> getAll();

    GetAllSaleOrdersResponse getById(int id);

    List<GetAllSaleOrdersResponse> getByUserId(int userId);

    Result submitTransfer(int id, int userId);

    Result confirmByAdmin(int id);

    Result cancel(int id, int actorUserId, boolean isAdmin, String reason);
}
