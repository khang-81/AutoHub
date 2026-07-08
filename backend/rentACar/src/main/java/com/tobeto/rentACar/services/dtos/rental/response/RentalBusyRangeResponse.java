package com.tobeto.rentACar.services.dtos.rental.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Dá»¯ liá»‡u tá»‘i thiá»ƒu cho trang chi tiáº¿t xe (áº©n ngÃ y Ä‘Ã£ cÃ³ Ä‘Æ¡n) â€” khÃ´ng lá»™ PII.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentalBusyRangeResponse {

    private LocalDate startDate;
    private LocalDate endDate;

    /** Khung giờ nhận xe (Sprint 4). */
    private java.time.LocalTime startTime;

    /** Khung giờ trả xe. */
    private java.time.LocalTime endTime;
}

