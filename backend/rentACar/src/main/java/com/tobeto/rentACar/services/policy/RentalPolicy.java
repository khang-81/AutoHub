package com.tobeto.rentACar.services.policy;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

/**
 * Gói bảo hiểm / cọc / hoàn cọc khi hủy — đơn giản hóa theo Mioto (điều chỉnh được qua hằng số).
 */
public final class RentalPolicy {

    private RentalPolicy() {}

    /** Phí bảo hiểm theo ngày (VNĐ) — snapshot vào đơn */
    public static double insuranceFeePerDay(String insuranceCode) {
        if (insuranceCode == null || insuranceCode.isBlank()
                || "NONE".equalsIgnoreCase(insuranceCode.trim())) {
            return 0;
        }
        return switch (insuranceCode.toUpperCase(Locale.ROOT).trim()) {
            case "BASIC" -> 80_000d;
            case "STANDARD" -> 120_000d;
            case "PREMIUM" -> 180_000d;
            default -> throw new IllegalArgumentException("Mã gói bảo hiểm không hợp lệ: " + insuranceCode);
        };
    }

    public static double computeDeposit(double rentalSubtotal) {
        double pct = rentalSubtotal * 0.15d;
        return Math.max(500_000d, pct);
    }

    /**
     * Tỷ lệ hoàn cọc theo số giờ còn lại đến 0h ngày nhận xe.
     * &gt; 48h: 100%, 24–48h: 50%, &lt; 24h: 0%.
     */
    public static double depositRefundRatio(LocalDate startDate) {
        LocalDateTime start = startDate.atStartOfDay();
        long hours = ChronoUnit.HOURS.between(LocalDateTime.now(), start);
        if (hours < 0) {
            return 0;
        }
        if (hours >= 48) {
            return 1.0d;
        }
        if (hours >= 24) {
            return 0.5d;
        }
        return 0;
    }
}
