package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.exceptions.types.NotFoundException;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.core.utilities.results.SuccessResult;
import com.tobeto.rentACar.entities.concretes.Promotion;
import com.tobeto.rentACar.repositories.PromotionRepository;
import com.tobeto.rentACar.services.abstracts.PromotionService;
import com.tobeto.rentACar.services.dtos.promotion.request.AddPromotionRequest;
import com.tobeto.rentACar.services.dtos.promotion.request.ApplyPromotionRequest;
import com.tobeto.rentACar.services.dtos.promotion.request.UpdatePromotionRequest;
import com.tobeto.rentACar.services.dtos.promotion.response.ApplyPromotionResponse;
import com.tobeto.rentACar.services.dtos.promotion.response.GetAllPromotionsResponse;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
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

    @Override
    @Transactional(readOnly = true)
    public List<GetAllPromotionsResponse> getAll() {
        return promotionRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public Result add(AddPromotionRequest request) {
        String code = normalizeCode(request.getCode());
        validateConfig(request.getDiscountType(), request.getAppliesTo(), request.getDiscountValue(),
                request.getValidFrom(), request.getValidTo());
        if (promotionRepository.existsByCodeIgnoreCase(code)) {
            throw new BusinessException("Mã khuyến mãi đã tồn tại.");
        }
        Promotion promo = Promotion.builder()
                .code(code)
                .description(trimOrNull(request.getDescription()))
                .discountType(request.getDiscountType().trim().toUpperCase(Locale.ROOT))
                .discountValue(request.getDiscountValue())
                .appliesTo(request.getAppliesTo().trim().toUpperCase(Locale.ROOT))
                .validFrom(request.getValidFrom())
                .validTo(request.getValidTo())
                .usageLimit(request.getUsageLimit())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .minOrderValue(request.getMinOrderValue())
                .active(request.getActive() == null || request.getActive())
                .usageCount(0)
                .build();
        promotionRepository.save(promo);
        return new SuccessResult("Thêm mã khuyến mãi thành công.");
    }

    @Override
    @Transactional
    public Result update(UpdatePromotionRequest request) {
        Promotion promo = promotionRepository.findById(request.getId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy mã khuyến mãi."));
        String code = normalizeCode(request.getCode());
        validateConfig(request.getDiscountType(), request.getAppliesTo(), request.getDiscountValue(),
                request.getValidFrom(), request.getValidTo());
        if (promotionRepository.existsByCodeIgnoreCaseAndIdNot(code, request.getId())) {
            throw new BusinessException("Mã khuyến mãi đã tồn tại.");
        }
        promo.setCode(code);
        promo.setDescription(trimOrNull(request.getDescription()));
        promo.setDiscountType(request.getDiscountType().trim().toUpperCase(Locale.ROOT));
        promo.setDiscountValue(request.getDiscountValue());
        promo.setAppliesTo(request.getAppliesTo().trim().toUpperCase(Locale.ROOT));
        promo.setValidFrom(request.getValidFrom());
        promo.setValidTo(request.getValidTo());
        promo.setUsageLimit(request.getUsageLimit());
        promo.setMaxDiscountAmount(request.getMaxDiscountAmount());
        promo.setMinOrderValue(request.getMinOrderValue());
        promo.setActive(request.getActive());
        promotionRepository.save(promo);
        return new SuccessResult("Cập nhật mã khuyến mãi thành công.");
    }

    @Override
    @Transactional
    public Result delete(int id) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy mã khuyến mãi."));
        if (promo.getUsageCount() > 0) {
            promo.setActive(false);
            promotionRepository.save(promo);
            return new SuccessResult("Mã đã được sử dụng — đã vô hiệu hóa thay vì xóa.");
        }
        promotionRepository.delete(promo);
        return new SuccessResult("Xóa mã khuyến mãi thành công.");
    }

    private GetAllPromotionsResponse toResponse(Promotion promo) {
        return new GetAllPromotionsResponse(
                promo.getId(),
                promo.getCode(),
                promo.getDescription(),
                promo.getDiscountType(),
                promo.getDiscountValue(),
                promo.getAppliesTo(),
                promo.getValidFrom(),
                promo.getValidTo(),
                promo.getUsageLimit(),
                promo.getUsageCount(),
                promo.getMaxDiscountAmount(),
                promo.getMinOrderValue(),
                promo.isActive()
        );
    }

    private void validateConfig(String discountType, String appliesTo, Double discountValue,
                                LocalDate validFrom, LocalDate validTo) {
        String type = discountType == null ? "" : discountType.trim().toUpperCase(Locale.ROOT);
        String applies = appliesTo == null ? "" : appliesTo.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_TYPES.contains(type)) {
            throw new BusinessException("Loại giảm giá không hợp lệ.");
        }
        if (!ALLOWED_APPLIES_TO.contains(applies)) {
            throw new BusinessException("Phạm vi áp dụng không hợp lệ.");
        }
        if ("PERCENT".equals(type) && discountValue != null && discountValue > 100) {
            throw new BusinessException("Giảm giá phần trăm không được vượt quá 100.");
        }
        if (validFrom != null && validTo != null && validFrom.isAfter(validTo)) {
            throw new BusinessException("Ngày bắt đầu không được sau ngày kết thúc.");
        }
    }

    private static String trimOrNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
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
