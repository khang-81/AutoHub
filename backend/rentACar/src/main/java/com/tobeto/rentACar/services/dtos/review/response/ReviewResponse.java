package com.tobeto.rentACar.services.dtos.review.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponse {
    private Integer id;
    private Integer rentalId;
    private Integer rating;
    private String comment;
    private LocalDate createdDate;
    /** Hiển thị công khai, không lộ full email */
    private String authorLabel;
}
