package com.tobeto.rentACar.services.rules;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.entities.concretes.Car;
import com.tobeto.rentACar.repositories.SaleOrderRepository;
import com.tobeto.rentACar.services.constants.ListingConstants;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class SaleBusinessRule {

    private final SaleOrderRepository saleOrderRepository;

    public void assertCarListingAllowsSale(Car car) {
        String lt = normalizeListingType(car.getListingType());
        if (ListingConstants.LISTING_RENT_ONLY.equals(lt)) {
            throw new BusinessException("Xe này chỉ cho thuê, không bán.");
        }
    }

    public void assertCarReadyToSell(Car car) {
        assertCarListingAllowsSale(car);
        if (car.getSalePrice() == null || car.getSalePrice() <= 0) {
            throw new BusinessException("Xe chưa có giá bán hợp lệ.");
        }
        String ss = car.getSaleStatus();
        if (ss == null || !ListingConstants.SALE_AVAILABLE.equalsIgnoreCase(ss)) {
            throw new BusinessException("Xe không ở trạng thái còn bán (AVAILABLE).");
        }
    }

    public void assertNoOpenSaleOrderForCar(int carId) {
        List<String> open = List.of(
                ListingConstants.SALE_ORDER_PENDING_PAYMENT,
                ListingConstants.SALE_ORDER_PENDING_ADMIN);
        if (saleOrderRepository.existsByCar_IdAndOrderStatusIn(carId, open)) {
            throw new BusinessException("Xe đang có đơn mua chưa hoàn tất.");
        }
    }

    private static String normalizeListingType(String lt) {
        if (lt == null || lt.isBlank()) {
            return ListingConstants.LISTING_RENT_ONLY;
        }
        return lt.trim().toUpperCase();
    }
}
