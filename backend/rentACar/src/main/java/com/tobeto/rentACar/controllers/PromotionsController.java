package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.services.abstracts.PromotionService;
import com.tobeto.rentACar.services.dtos.promotion.request.AddPromotionRequest;
import com.tobeto.rentACar.services.dtos.promotion.request.ApplyPromotionRequest;
import com.tobeto.rentACar.services.dtos.promotion.request.UpdatePromotionRequest;
import com.tobeto.rentACar.services.dtos.promotion.response.ApplyPromotionResponse;
import com.tobeto.rentACar.services.dtos.promotion.response.GetAllPromotionsResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@AllArgsConstructor
@CrossOrigin
public class PromotionsController {

    private final PromotionService promotionService;

    @PostMapping("/apply")
    public ApplyPromotionResponse apply(@RequestBody @Valid ApplyPromotionRequest request) {
        return promotionService.apply(request);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public List<GetAllPromotionsResponse> getAll() {
        return promotionService.getAll();
    }

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/add")
    public Result add(@RequestBody @Valid AddPromotionRequest request) {
        return promotionService.add(request);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public Result update(@RequestBody @Valid UpdatePromotionRequest request) {
        return promotionService.update(request);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public Result delete(@PathVariable int id) {
        return promotionService.delete(id);
    }
}
