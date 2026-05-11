package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.entities.concretes.Promotion;
import com.tobeto.rentACar.repositories.PromotionRepository;
import com.tobeto.rentACar.services.abstracts.PromotionService;
import com.tobeto.rentACar.services.dtos.promotion.request.ApplyPromotionRequest;
import com.tobeto.rentACar.services.dtos.promotion.response.ApplyPromotionResponse;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
@AllArgsConstructor
public class PromotionManager implements PromotionService {

    private static final Set<String> ALLOWED_TYPES = Set.of("PERCENT", "FIXED");
    private static final Set<String> ALLOWED_APPLIES_TO = Set.of("RENT", "SALE", "BOTH");

    private final PromotionRepository promotionRepository;

    @Override
    @Transactional(readOnly = true)
    public ApplyPromotionResponse apply(ApplyPromotionRequest request) {
        String code = normalizeCode(request.getCode());
        String scope = request.getScope() == null ? "" : request.getScope().trim().toUpperCase(Locale.ROOT);
        double amount = request.getAmount() == null ? 0d : Math.max(0, request.getAmount());

        Promotion promo = findValid(code, scope);
        double discount = computeDiscount(promo, amount);
        double finalAmount = Math.max(0, amount - discount);
        return new ApplyPromotionResponse(promo.getCode(), promo.getDescription(), amount, discount, finalAmount,
                discount > 0 ? "Áp mã thành công." : "Mã hợp lệ nhưng không tạo ra giảm giá cho đơn này.");
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionApplyResult applyForUse(String code, String scope, double orderAmount) {
        if (code == null || code.isBlank()) {
            return new PromotionApplyResult(null, 0d);
        }
        String norm = normalizeCode(code);
        Promotion promo = findValid(norm, scope == null ? "" : scope.trim().toUpperCase(Locale.ROOT));
        double discount = computeDiscount(promo, Math.max(0, orderAmount));
        return new PromotionApplyResult(promo.getCode(), discount);
    }

    @Override
    @Transactional
    public void consume(String code) {
        if (code == null || code.isBlank()) {
            return;
        }
        Optional<Promotion> opt = promotionRepository.findByCodeIgnoreCase(code.trim());
        if (opt.isEmpty()) {
            return;
        }
        Promotion promo = opt.get();
        promo.setUsageCount(promo.getUsageCount() + 1);
        if (promo.getUsageLimit() != null && promo.getUsageCount() >= promo.getUsageLimit()) {
            promo.setActive(false);
        }
        promotionRepository.save(promo);
    }

    private Promotion findValid(String code, String scope) {
        Promotion promo = promotionRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new BusinessException("Mã khuyến mãi không tồn tại."));
        if (!promo.isActive()) {
            throw new BusinessException("Mã khuyến mãi đã hết hiệu lực.");
        }
        LocalDate today = LocalDate.now();
        if (promo.getValidFrom() != null && today.isBefore(promo.getValidFrom())) {
            throw new BusinessException("Mã khuyến mãi chưa tới ngày áp dụng.");
        }
        if (promo.getValidTo() != null && today.isAfter(promo.getValidTo())) {
            throw new BusinessException("Mã khuyến mãi đã hết hạn.");
        }
        if (promo.getUsageLimit() != null && promo.getUsageCount() >= promo.getUsageLimit()) {
            throw new BusinessException("Mã khuyến mãi đã hết lượt sử dụng.");
        }
        String applies = promo.getAppliesTo() == null ? "" : promo.getAppliesTo().trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_APPLIES_TO.contains(applies)) {
            throw new BusinessException("Cấu hình mã khuyến mãi không hợp lệ.");
        }
        if (!"BOTH".equals(applies) && !applies.equals(scope)) {
            throw new BusinessException("Mã khuyến mãi này không áp dụng cho loại đơn của bạn.");
        }
        return promo;
    }

    private static double computeDiscount(Promotion promo, double orderAmount) {
        if (promo.getMinOrderValue() != null && promo.getMinOrderValue() > 0
                && orderAmount < promo.getMinOrderValue()) {
            throw new BusinessException("Đơn cần đạt tối thiểu "
                    + String.format("%,.0f", promo.getMinOrderValue()) + " VNĐ để áp mã này.");
        }
        String type = promo.getDiscountType() == null
                ? ""
                : promo.getDiscountType().trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_TYPES.contains(type)) {
            throw new BusinessException("Cấu hình loại giảm giá không hợp lệ.");
        }
        double raw;
        if ("PERCENT".equals(type)) {
            double pct = Math.min(100, Math.max(0, promo.getDiscountValue()));
            raw = orderAmount * pct / 100d;
        } else {
            raw = Math.max(0, promo.getDiscountValue());
        }
        if (promo.getMaxDiscountAmount() != null && promo.getMaxDiscountAmount() > 0) {
            raw = Math.min(raw, promo.getMaxDiscountAmount());
        }
        // Không vượt quá giá trị đơn.
        return Math.min(raw, orderAmount);
    }

    private static String normalizeCode(String code) {
        if (code == null) {
            throw new BusinessException("Vui lòng nhập mã khuyến mãi.");
        }
        String c = code.trim().toUpperCase(Locale.ROOT);
        if (c.isEmpty()) {
            throw new BusinessException("Vui lòng nhập mã khuyến mãi.");
        }
        return c;
    }
}
