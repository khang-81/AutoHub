package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.services.abstracts.CarService;
import com.tobeto.rentACar.services.dtos.car.request.AddCarRequest;
import com.tobeto.rentACar.services.dtos.car.request.DeleteCarRequest;
import com.tobeto.rentACar.services.dtos.car.request.UpdateCarRequest;
import com.tobeto.rentACar.services.dtos.car.response.GetAllCarsResponse;
import com.tobeto.rentACar.services.dtos.car.response.GetCarByIdResponse;
import com.tobeto.rentACar.services.dtos.car.response.PagedCarsResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/cars")
@AllArgsConstructor
@CrossOrigin
public class CarsController {
    private final CarService carService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/add")
    public Result add(@RequestBody @Valid AddCarRequest request){
        return carService.add(request);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public Result update(@RequestBody @Valid UpdateCarRequest request){
       return carService.update(request);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete")
    public Result delete(@RequestBody @Valid DeleteCarRequest request){
        return carService.delete(request);
    }

    @GetMapping("/getAll")
    public List<GetAllCarsResponse> getAll(){
       return carService.getAll();
    }

    /**
     * Lọc + tìm kiếm + phân trang (mức C — tối ưu tải danh sách lớn).
     * page bắt đầu từ 1; size tối đa 50.
     */
    @GetMapping("/search")
    public PagedCarsResponse search(
            @RequestParam(required = false) Integer brandId,
            @RequestParam(required = false) Integer colorId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minYear,
            @RequestParam(required = false) String listing,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "9") int size) {
        return carService.search(brandId, colorId, minPrice, maxPrice, minYear, listing, q, page, size);
    }

    @GetMapping("/getById/{id}")
    public GetCarByIdResponse getById(@PathVariable int id){
        return carService.getById(id);
    }
}
