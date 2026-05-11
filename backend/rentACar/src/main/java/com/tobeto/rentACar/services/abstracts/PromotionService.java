package com.tobeto.rentACar.services.abstracts;

import com.tobeto.rentACar.services.dtos.promotion.request.ApplyPromotionRequest;
import com.tobeto.rentACar.services.dtos.promotion.response.ApplyPromotionResponse;

public interface PromotionService {

    /**
     * Validate mã + tính giảm giá (preview cho frontend trước khi confirm đặt đơn).
     * Quăng BusinessException khi mã không hợp lệ / hết hạn / không áp dụng cho scope.
     */
    ApplyPromotionResponse apply(ApplyPromotionRequest request);

    /**
     * Validate mã trong context tạo Rental/SaleOrder. KHÔNG thay đổi DB — chỉ trả về snapshot.
     * Truyền code = null/blank để biểu thị "không dùng promo" (trả về object với discount=0).
     */
    PromotionApplyResult applyForUse(String code, String scope, double orderAmount);

    /** Tăng usageCount sau khi đơn được tạo thành công. No-op khi code = null. */
    void consume(String code);

    record PromotionApplyResult(String code, double discountAmount) {}
}
