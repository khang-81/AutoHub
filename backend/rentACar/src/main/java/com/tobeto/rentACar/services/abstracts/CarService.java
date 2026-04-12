package com.tobeto.rentACar.services.abstracts;

import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.services.dtos.car.request.AddCarRequest;
import com.tobeto.rentACar.services.dtos.car.request.DeleteCarRequest;
import com.tobeto.rentACar.services.dtos.car.request.UpdateCarRequest;
import com.tobeto.rentACar.services.dtos.car.response.GetAllCarsResponse;
import com.tobeto.rentACar.services.dtos.car.response.GetCarByIdResponse;
import com.tobeto.rentACar.services.dtos.car.response.PagedCarsResponse;

import java.util.List;

public interface CarService {
    List<GetAllCarsResponse> getAll();

    PagedCarsResponse search(
            Integer brandId,
            Integer colorId,
            Double minPrice,
            Double maxPrice,
            Integer minYear,
            String listing,
            String q,
            int page,
            int size);
    GetCarByIdResponse getById(int id);
    Result add(AddCarRequest request);
    Result update(UpdateCarRequest request);
    Result delete(DeleteCarRequest request);



}
