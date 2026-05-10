package com.tobeto.rentACar.services.dtos.rental.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * Form đối chiếu trả xe (Sprint 3 — UC #15).
 * Dùng cả cho khách (xác nhận) và admin (đối chiếu) — admin có thêm cờ
 * `markDispute` để đẩy đơn sang trạng thái DISPUTE thay vì COMPLETED.
 */
@Data
public class UserReturnCarRequest {

    /** Nếu null: dùng ngày hiện tại */
    private LocalDate returnDate;

    @NotNull(message = "Vui lòng nhập số km đồng hồ khi trả xe")
    private Long endKilometer;

    /** Mức xăng thực tế (% — 0..100). Mặc định kỳ vọng = 100% (đầy bình). */
    @Min(value = 0, message = "Mức xăng tối thiểu 0%")
    @Max(value = 100, message = "Mức xăng tối đa 100%")
    private Integer actualFuelLevel;

    /** Mô tả trầy xước, hư hại nếu có. */
    private String damageNotes;

    /** Ảnh đính kèm — CSV URL/đường dẫn (max 1024 ký tự). */
    private String damagePhotoUrls;

    /** Phụ phí thủ công (xe bẩn, mất phụ kiện…) — auto fees đã được tính riêng. */
    private Double additionalIncidentalFees;

    /** Admin-only: true = đẩy đơn sang DISPUTE thay vì COMPLETED. */
    private Boolean markDispute;
}
