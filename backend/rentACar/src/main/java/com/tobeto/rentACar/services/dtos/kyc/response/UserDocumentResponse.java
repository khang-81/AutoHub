package com.tobeto.rentACar.services.dtos.kyc.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDocumentResponse {
    private Integer id;
    private Integer userId;
    private String documentType;
    /** URL tương đối API, ví dụ /files/kyc/user_1/xxx.jpg */
    private String fileUrl;
    private String status;
    private String adminNote;
    private LocalDateTime reviewedAt;
}
