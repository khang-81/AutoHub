package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.services.abstracts.PromotionService;
import com.tobeto.rentACar.services.dtos.promotion.request.ApplyPromotionRequest;
import com.tobeto.rentACar.services.dtos.promotion.response.ApplyPromotionResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/promotions")
@AllArgsConstructor
@CrossOrigin
public class PromotionsController {

    private final PromotionService promotionService;

    /**
     * Validate + tính giảm giá theo mã. Cần đăng nhập (đã đi qua JwtAuthFilter ở SecurityConfig).
     * Trả 200 + body với discountAmount/finalAmount; lỗi business bubble lên global handler dạng 400.
     */
    @PostMapping("/apply")
    public ApplyPromotionResponse apply(@RequestBody @Valid ApplyPromotionRequest request) {
        return promotionService.apply(request);
    }
}
