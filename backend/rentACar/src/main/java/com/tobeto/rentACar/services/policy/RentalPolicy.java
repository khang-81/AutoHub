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

    /** Cọc đặt xe ≈ 30% tổng tiền thuê (làm tròn nghìn), tối thiểu 200k. */
    public static double computeDeposit(double rentalSubtotal) {
        if (rentalSubtotal <= 0) {
            return 0;
        }
        double raw = rentalSubtotal * 0.30d;
        double rounded = Math.round(raw / 1000d) * 1000d;
        return Math.max(200_000d, rounded);
    }

    /** Số ngày trễ so với ngày trả dự kiến (endDate). Trả đúng hoặc sớm → 0. */
    public static long lateChargeDays(LocalDate endDate, LocalDate actualReturn) {
        if (actualReturn == null || endDate == null || !actualReturn.isAfter(endDate)) {
            return 0;
        }
        return ChronoUnit.DAYS.between(endDate, actualReturn);
    }

    /** Phí trễ: mỗi ngày trễ = 100% giá thuê/ngày của xe (có thể chỉnh hệ số). */
    public static double lateReturnFeeTotal(long lateDays, double dailyPrice) {
        if (lateDays <= 0 || dailyPrice <= 0) {
            return 0;
        }
        return lateDays * dailyPrice;
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
