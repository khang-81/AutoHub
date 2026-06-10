package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.services.FileStorageService;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cars")
@AllArgsConstructor
@CrossOrigin
public class CarsController {
    private final CarService carService;
    private final FileStorageService fileStorageService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/add")
    public Result add(@RequestBody @Valid AddCarRequest request) {
        return carService.add(request);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public Result update(@RequestBody @Valid UpdateCarRequest request) {
        return carService.update(request);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete")
    public Result delete(@RequestBody @Valid DeleteCarRequest request) {
        return carService.delete(request);
    }

    @GetMapping("/getAll")
    public List<GetAllCarsResponse> getAll() {
        return carService.getAll();
    }

    /**
     * Lọc + tìm kiếm + phân trang.
     * page bắt đầu từ 1; size tối đa 50.
     *
     * Tham số mới (UC Tìm kiếm xe thuê):
     *  - seats: số chỗ ngồi (4/7/9...)
     *  - transmission: AUTO | MANUAL
     *  - fuelType: GASOLINE | DIESEL | HYBRID | ELECTRIC
     *  - availableFrom / availableTo (yyyy-MM-dd): chỉ trả xe rảnh trong khoảng này.
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
            @RequestParam(required = false) Integer seats,
            @RequestParam(required = false) String transmission,
            @RequestParam(required = false) String fuelType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate availableFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate availableTo,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "9") int size) {
        return carService.search(brandId, colorId, minPrice, maxPrice, minYear, listing, q,
                seats, transmission, fuelType, availableFrom, availableTo, page, size);
    }

    @GetMapping("/getById/{id}")
    public GetCarByIdResponse getById(@PathVariable int id) {
        return carService.getById(id);
    }

    /** Admin upload ảnh xe — trả URL `/files/...` dùng trong gallery hoặc imagePath. */
    @PreAuthorize("hasRole('admin')")
    @PostMapping(value = "/admin/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Integer carId) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Vui lòng chọn ảnh.");
        }
        String relative = fileStorageService.storeCarImage(file, carId);
        return Map.of("url", fileStorageService.publicFileUrl(relative));
    }
}
