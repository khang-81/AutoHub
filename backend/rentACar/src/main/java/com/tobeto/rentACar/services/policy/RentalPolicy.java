package com.tobeto.rentACar.services.policy;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Gói bảo hiểm / cọc / hoàn cọc khi hủy — đơn giản hóa theo Mioto (điều chỉnh được qua hằng số).
 */
public final class RentalPolicy {

    private RentalPolicy() {}

    /** Phí bảo hiểm tier (lưu vào `insuranceCode`) — vẫn single-select. */
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

    /**
     * Phí add-on theo ngày — multi-select (Sprint 2 — bảo hiểm chuyến đi multi-package).
     * Khác với `insuranceCode` (tier), các add-on này stack được với nhau:
     *  - EXTRA_DRIVER : Tài xế phụ (50.000/ngày)
     *  - ROADSIDE     : Cứu hộ 24/7 (30.000/ngày)
     *  - INTERIOR     : Bảo vệ nội thất (40.000/ngày)
     */
    public static double addonFeePerDay(String addonCode) {
        if (addonCode == null || addonCode.isBlank()) {
            return 0;
        }
        return switch (addonCode.toUpperCase(Locale.ROOT).trim()) {
            case "EXTRA_DRIVER" -> 50_000d;
            case "ROADSIDE"     -> 30_000d;
            case "INTERIOR"     -> 40_000d;
            default -> throw new IllegalArgumentException("Mã gói add-on không hợp lệ: " + addonCode);
        };
    }

    /** Tổng phí add-on/ngày từ danh sách mã (CSV cũng nhận được). */
    public static double addonsFeePerDay(List<String> codes) {
        if (codes == null || codes.isEmpty()) {
            return 0;
        }
        Set<String> dedup = new LinkedHashSet<>();
        for (String raw : codes) {
            if (raw == null) continue;
            for (String c : raw.split(",")) {
                String norm = c.trim().toUpperCase(Locale.ROOT);
                if (!norm.isEmpty() && !"NONE".equals(norm)) {
                    dedup.add(norm);
                }
            }
        }
        double sum = 0;
        for (String c : dedup) {
            sum += addonFeePerDay(c);
        }
        return sum;
    }

    /** Chuẩn hoá danh sách add-on về CSV unique để snapshot vào DB. */
    public static String normalizeAddonsCsv(List<String> codes) {
        if (codes == null || codes.isEmpty()) return null;
        Set<String> dedup = new LinkedHashSet<>();
        for (String raw : codes) {
            if (raw == null) continue;
            for (String c : raw.split(",")) {
                String norm = c.trim().toUpperCase(Locale.ROOT);
                if (!norm.isEmpty() && !"NONE".equals(norm)) {
                    dedup.add(norm);
                }
            }
        }
        return dedup.isEmpty() ? null : String.join(",", dedup);
    }

    /** Danh sách add-on hợp lệ — dùng để lộ ra REST endpoint. */
    public static List<String> supportedAddonCodes() {
        return Arrays.asList("EXTRA_DRIVER", "ROADSIDE", "INTERIOR");
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

    /** Hạn mức km/ngày mặc định khi tạo đơn (Mioto-style). */
    public static final long DEFAULT_KM_QUOTA_PER_DAY = 300L;

    /** Phí vượt km — VNĐ/km. */
    public static final double OVER_KM_FEE_PER_KM = 5_000d;

    /** Giá ước lượng đổ đầy 1 bình xăng — dùng để tính phí thiếu xăng. */
    public static final double FULL_TANK_PRICE = 1_500_000d;

    /** Tính hạn mức km cho phép cho 1 đơn rentalDays ngày. */
    public static long allowedKilometers(long rentalDays) {
        if (rentalDays <= 0) return 0;
        return rentalDays * DEFAULT_KM_QUOTA_PER_DAY;
    }

    /**
     * Phí vượt km khi trả xe.
     * @param drivenKm  số km thực tế khách đã chạy
     * @param allowedKm hạn mức km của đơn (snapshot khi tạo)
     */
    public static double overKilometerFee(long drivenKm, Long allowedKm) {
        if (allowedKm == null || allowedKm <= 0 || drivenKm <= allowedKm) {
            return 0;
        }
        return (drivenKm - allowedKm) * OVER_KM_FEE_PER_KM;
    }

    /**
     * Phí thiếu xăng — % thiếu so với kỳ vọng × giá đầy bình.
     * @param expectedPct kỳ vọng khi trả (mặc định 100%)
     * @param actualPct   mức xăng thực tế khi khách trả (0..100)
     */
    public static double missingFuelFee(Integer expectedPct, Integer actualPct) {
        if (actualPct == null) return 0;
        int expected = expectedPct != null ? Math.max(0, Math.min(100, expectedPct)) : 100;
        int actual = Math.max(0, Math.min(100, actualPct));
        if (actual >= expected) return 0;
        double missingRatio = (expected - actual) / 100d;
        return Math.round(missingRatio * FULL_TANK_PRICE / 1000d) * 1000d;
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
