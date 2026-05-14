package com.tobeto.rentACar.services.dtos.user.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetUserByIdResponse {

    private int id;

    private String email;

    private String kycStatus;

    private String customerFirstName;
    private String customerLastName;
    private LocalDate customerBirthdate;
    private String customerInternationalId;
    private LocalDate customerLicenceIssueDate;
    private String companyName;
    private String companyTaxNo;
    /** INDIVIDUAL | CORPORATE — null nếu chưa có hồ sơ chi tiết */
    private String profileKind;
}
