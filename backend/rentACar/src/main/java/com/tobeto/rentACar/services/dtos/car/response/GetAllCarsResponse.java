package com.tobeto.rentACar.services.dtos.car.response;

import com.tobeto.rentACar.services.dtos.color.response.GetColorByIdResponse;
import com.tobeto.rentACar.services.dtos.model.response.GetModelByIdResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@NoArgsConstructor
public class GetAllCarsResponse {

    private Integer id;

    private short modelYear;

    private String serviceCity;

    private String plate;

    private short minFindeksRate;

    private Long kilometer;

    private Float dailyPrice;

    private String listingType;

    private Float salePrice;

    private String saleStatus;

    private String imagePath;

    private GetModelByIdResponse model;

    private GetColorByIdResponse color;

    private Double averageRating;
    private Integer reviewCount;

}
